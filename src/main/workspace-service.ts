/**
 * Workspace service - manages documents, metadata, and search
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import Database from 'better-sqlite3';
import { GitService } from './git-service';

export interface WorkspaceMetadata {
  version: string;
  workspace: {
    name: string;
    created: string;
    description?: string;
  };
  documents: Record<string, WorkspaceDocumentMetadata>;
}

export interface WorkspaceDocumentMetadata {
  id: string;
  title: string;
  tags: string[];
  created: string;
  modified: string;
  mode: 'notes' | 'markdown' | 'code';
  language?: string;
  customFields?: Record<string, any>;
}

export interface SearchResult {
  path: string;
  title: string;
  mode: string;
  tags: string[];
  modified: Date;
  snippet?: string;
  score: number;
}

export class WorkspaceService {
  private workspacePath: string;
  private db: Database.Database | null = null;
  private gitService: GitService;
  private metadataPath: string;

  constructor(workspacePath: string) {
    this.workspacePath = workspacePath;
    this.metadataPath = path.join(workspacePath, '.fintontext-metadata.json');
    this.gitService = new GitService();
  }

  /**
   * Initialize workspace
   */
  async init(): Promise<void> {
    // Initialize Git
    await this.gitService.initWorkspace(this.workspacePath);

    // Initialize SQLite database for search
    const dbPath = path.join(this.workspacePath, '.fintontext', 'index.db');
    this.db = new Database(dbPath);

    // Create search tables
    this.createSearchTables();

    // Index existing documents
    await this.rebuildIndex();
  }

  /**
   * Create FTS5 tables for search
   */
  private createSearchTables(): void {
    if (!this.db) return;

    // Documents table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS documents (
        id TEXT PRIMARY KEY,
        path TEXT UNIQUE NOT NULL,
        title TEXT NOT NULL,
        mode TEXT NOT NULL,
        tags TEXT,
        created TEXT NOT NULL,
        modified TEXT NOT NULL
      )
    `);

    // Full-text search table
    this.db.exec(`
      CREATE VIRTUAL TABLE IF NOT EXISTS documents_fts USING fts5(
        path,
        title,
        content,
        tags,
        tokenize='porter'
      )
    `);

    // Tags table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS tags (
        name TEXT PRIMARY KEY,
        count INTEGER DEFAULT 0
      )
    `);
  }

  /**
   * Load metadata from file
   */
  async loadMetadata(): Promise<WorkspaceMetadata> {
    try {
      const content = await fs.readFile(this.metadataPath, 'utf-8');
      return JSON.parse(content);
    } catch {
      // Create default metadata if doesn't exist
      const metadata: WorkspaceMetadata = {
        version: '1.0',
        workspace: {
          name: path.basename(this.workspacePath),
          created: new Date().toISOString(),
        },
        documents: {},
      };
      await this.saveMetadata(metadata);
      return metadata;
    }
  }

  /**
   * Save metadata to file
   */
  async saveMetadata(metadata: WorkspaceMetadata): Promise<void> {
    await fs.writeFile(
      this.metadataPath,
      JSON.stringify(metadata, null, 2),
      'utf-8'
    );
  }

  /**
   * Add or update document
   */
  async addDocument(
    relativePath: string,
    title: string,
    mode: 'notes' | 'markdown' | 'code',
    tags: string[] = [],
    language?: string
  ): Promise<void> {
    const metadata = await this.loadMetadata();

    const docMeta: WorkspaceDocumentMetadata = {
      id: this.generateId(),
      title,
      tags,
      created: new Date().toISOString(),
      modified: new Date().toISOString(),
      mode,
      language,
    };

    metadata.documents[relativePath] = docMeta;

    // Save metadata
    await this.saveMetadata(metadata);

    // Index for search
    await this.indexDocument(relativePath, docMeta);

    // Update tags
    await this.updateTags(tags);

    // Git commit
    await this.gitService.stage([
      this.metadataPath,
      path.join(this.workspacePath, relativePath),
    ]);
    await this.gitService.commit(`Add: ${title}`);
  }

  /**
   * Update document metadata
   */
  async updateDocument(
    relativePath: string,
    updates: Partial<WorkspaceDocumentMetadata>
  ): Promise<void> {
    const metadata = await this.loadMetadata();

    if (!metadata.documents[relativePath]) {
      throw new Error(`Document not found: ${relativePath}`);
    }

    const doc = metadata.documents[relativePath];
    Object.assign(doc, updates, {
      modified: new Date().toISOString(),
    });

    await this.saveMetadata(metadata);
    await this.indexDocument(relativePath, doc);

    if (updates.tags) {
      await this.rebuildTagCounts();
    }
  }

  /**
   * Delete document
   */
  async deleteDocument(relativePath: string): Promise<void> {
    const metadata = await this.loadMetadata();
    const doc = metadata.documents[relativePath];

    if (!doc) {
      throw new Error(`Document not found: ${relativePath}`);
    }

    delete metadata.documents[relativePath];

    await this.saveMetadata(metadata);
    await this.removeFromIndex(relativePath);
    await this.rebuildTagCounts();

    // Git commit
    const fullPath = path.join(this.workspacePath, relativePath);
    await fs.unlink(fullPath);
    await this.gitService.stage(this.metadataPath);
    await this.gitService.commit(`Delete: ${doc.title}`);
  }

  /**
   * Index document for search
   */
  private async indexDocument(
    relativePath: string,
    doc: WorkspaceDocumentMetadata
  ): Promise<void> {
    if (!this.db) return;

    const fullPath = path.join(this.workspacePath, relativePath);
    let content = '';

    try {
      content = await fs.readFile(fullPath, 'utf-8');
    } catch {
      content = '';
    }

    // Remove from index if exists
    this.db
      .prepare('DELETE FROM documents WHERE path = ?')
      .run(relativePath);
    this.db
      .prepare('DELETE FROM documents_fts WHERE path = ?')
      .run(relativePath);

    // Insert into documents table
    this.db
      .prepare(
        `INSERT INTO documents (id, path, title, mode, tags, created, modified)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        doc.id,
        relativePath,
        doc.title,
        doc.mode,
        doc.tags.join(','),
        doc.created,
        doc.modified
      );

    // Insert into FTS table
    this.db
      .prepare(
        `INSERT INTO documents_fts (path, title, content, tags)
         VALUES (?, ?, ?, ?)`
      )
      .run(relativePath, doc.title, content, doc.tags.join(' '));
  }

  /**
   * Remove document from index
   */
  private removeFromIndex(relativePath: string): void {
    if (!this.db) return;

    this.db
      .prepare('DELETE FROM documents WHERE path = ?')
      .run(relativePath);
    this.db
      .prepare('DELETE FROM documents_fts WHERE path = ?')
      .run(relativePath);
  }

  /**
   * Search documents
   */
  search(query: string, limit = 50): SearchResult[] {
    if (!this.db || !query.trim()) return [];

    const stmt = this.db.prepare(`
      SELECT d.path, d.title, d.mode, d.tags, d.modified,
             snippet(documents_fts, 2, '<mark>', '</mark>', '...', 32) as snippet,
             rank as score
      FROM documents_fts
      JOIN documents d ON documents_fts.path = d.path
      WHERE documents_fts MATCH ?
      ORDER BY rank
      LIMIT ?
    `);

    const results = stmt.all(query, limit) as any[];

    return results.map((r) => ({
      path: r.path,
      title: r.title,
      mode: r.mode,
      tags: r.tags ? r.tags.split(',') : [],
      modified: new Date(r.modified),
      snippet: r.snippet,
      score: r.score,
    }));
  }

  /**
   * Get all tags with counts
   */
  getTags(): Array<{ name: string; count: number }> {
    if (!this.db) return [];

    const stmt = this.db.prepare('SELECT name, count FROM tags ORDER BY name');
    return stmt.all() as Array<{ name: string; count: number }>;
  }

  /**
   * Get documents by tag
   */
  getDocumentsByTag(tag: string): SearchResult[] {
    if (!this.db) return [];

    const stmt = this.db.prepare(`
      SELECT path, title, mode, tags, modified
      FROM documents
      WHERE tags LIKE ?
      ORDER BY modified DESC
    `);

    const results = stmt.all(`%${tag}%`) as any[];

    return results.map((r) => ({
      path: r.path,
      title: r.title,
      mode: r.mode,
      tags: r.tags ? r.tags.split(',') : [],
      modified: new Date(r.modified),
      score: 1,
    }));
  }

  /**
   * Rebuild search index from metadata
   */
  private async rebuildIndex(): Promise<void> {
    if (!this.db) return;

    // Clear existing index
    this.db.exec('DELETE FROM documents');
    this.db.exec('DELETE FROM documents_fts');

    const metadata = await this.loadMetadata();

    for (const [relativePath, doc] of Object.entries(metadata.documents)) {
      await this.indexDocument(relativePath, doc);
    }

    await this.rebuildTagCounts();
  }

  /**
   * Update tag counts
   */
  private async updateTags(tags: string[]): Promise<void> {
    if (!this.db) return;

    const insert = this.db.prepare(`
      INSERT INTO tags (name, count) VALUES (?, 1)
      ON CONFLICT(name) DO UPDATE SET count = count + 1
    `);

    for (const tag of tags) {
      insert.run(tag);
    }
  }

  /**
   * Rebuild tag counts from scratch
   */
  private async rebuildTagCounts(): Promise<void> {
    if (!this.db) return;

    this.db.exec('DELETE FROM tags');

    const metadata = await this.loadMetadata();
    const tagCounts = new Map<string, number>();

    for (const doc of Object.values(metadata.documents)) {
      for (const tag of doc.tags) {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      }
    }

    const insert = this.db.prepare(
      'INSERT INTO tags (name, count) VALUES (?, ?)'
    );

    for (const [name, count] of tagCounts.entries()) {
      insert.run(name, count);
    }
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Close database connection
   */
  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }

  /**
   * Get Git service for direct Git operations
   */
  getGitService(): GitService {
    return this.gitService;
  }
}
