/**
 * REST API server for document management
 * Allows external tools (like MCP servers) to create/delete documents
 */

import * as http from 'http';
import * as path from 'path';
import * as fs from 'fs/promises';
import { WorkspaceService, WorkspaceDocumentMetadata } from './workspace-service';
import { parseFrontmatter } from './frontmatter-utils';

export class ApiServer {
  private server: http.Server | null = null;
  private workspaceService: WorkspaceService | null = null;
  private port: number;

  constructor(port: number = 31337) {
    this.port = port;
  }

  /**
   * Set workspace service (must be called before starting server)
   */
  setWorkspaceService(workspaceService: WorkspaceService): void {
    this.workspaceService = workspaceService;
  }

  /**
   * Start the API server
   */
  start(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.server) {
        console.log('[API Server] Already running');
        return resolve();
      }

      this.server = http.createServer((req, res) => {
        this.handleRequest(req, res).catch(error => {
          console.error('[API Server] Request handler error:', error);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Internal server error' }));
        });
      });

      this.server.listen(this.port, '127.0.0.1', () => {
        console.log(`[API Server] Listening on http://127.0.0.1:${this.port}`);
        resolve();
      });

      this.server.on('error', (error) => {
        console.error('[API Server] Server error:', error);
        reject(error);
      });
    });
  }

  /**
   * Stop the API server
   */
  stop(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.server) {
        return resolve();
      }

      this.server.close(() => {
        console.log('[API Server] Stopped');
        this.server = null;
        resolve();
      });
    });
  }

  /**
   * Handle incoming HTTP requests
   */
  private async handleRequest(
    req: http.IncomingMessage,
    res: http.ServerResponse
  ): Promise<void> {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight
    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }

    console.log(`[API Server] ${req.method} ${req.url}`);

    // Check workspace service
    if (!this.workspaceService) {
      res.writeHead(503, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'No workspace open' }));
      return;
    }

    const url = new URL(req.url || '/', `http://${req.headers.host}`);
    const path = url.pathname;

    try {
      // Routes
      if (path === '/health' && req.method === 'GET') {
        await this.handleHealth(req, res);
      } else if (path === '/documents' && req.method === 'GET') {
        await this.handleListDocuments(req, res);
      } else if (path === '/documents' && req.method === 'POST') {
        await this.handleCreateDocument(req, res);
      } else if (path.startsWith('/documents/') && req.method === 'DELETE') {
        await this.handleDeleteDocument(req, res, path);
      } else if (path.startsWith('/documents/') && req.method === 'GET') {
        await this.handleGetDocument(req, res, path);
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not found' }));
      }
    } catch (error) {
      console.error('[API Server] Handler error:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: (error as Error).message }));
    }
  }

  /**
   * Health check endpoint
   */
  private async handleHealth(
    _req: http.IncomingMessage,
    res: http.ServerResponse
  ): Promise<void> {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', workspace: !!this.workspaceService }));
  }

  /**
   * List all documents
   */
  private async handleListDocuments(
    _req: http.IncomingMessage,
    res: http.ServerResponse
  ): Promise<void> {
    const metadata = await this.workspaceService!.loadMetadata();
    const documents = Object.values(metadata.documents);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ documents }));
  }

  /**
   * Create a new document
   * POST /documents
   * Body: { "title": "string", "content": "string", "mode": "notes"|"markdown"|"code", "tags": ["string"], "language": "string" }
   */
  private async handleCreateDocument(
    req: http.IncomingMessage,
    res: http.ServerResponse
  ): Promise<void> {
    const body = await this.readBody(req);
    const data = JSON.parse(body);

    // Validate required fields
    if (!data.title) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Missing required field: title' }));
      return;
    }

    // Default values
    const mode = data.mode || 'markdown';
    const content = data.content || '';
    const tags = data.tags || [];
    const language = data.language;

    // Generate document path
    const filename = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + `.${mode === 'code' ? (language || 'txt') : 'md'}`;
    const docPath = `documents/${filename}`;

    // Write the file first (with frontmatter)
    const workspacePath = this.workspaceService!['workspacePath'];
    const fullPath = path.join(workspacePath, docPath);

    // Create frontmatter
    const frontmatter = `---
title: "${data.title}"
mode: ${mode}
tags: [${tags.map((t: string) => `"${t}"`).join(', ')}]${language ? `\nlanguage: ${language}` : ''}
created: ${new Date().toISOString()}
modified: ${new Date().toISOString()}
---

${content}`;

    // Ensure documents directory exists
    const docsDir = path.dirname(fullPath);
    await fs.mkdir(docsDir, { recursive: true });

    // Write file
    await fs.writeFile(fullPath, frontmatter, 'utf-8');

    // Add document metadata (this will index and commit)
    await this.workspaceService!.addDocument(
      docPath,
      data.title,
      mode,
      tags,
      language
    );

    res.writeHead(201, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, path: docPath }));
  }

  /**
   * Delete a document
   * DELETE /documents/{path}
   */
  private async handleDeleteDocument(
    _req: http.IncomingMessage,
    res: http.ServerResponse,
    urlPath: string
  ): Promise<void> {
    // Extract document path from URL
    const docPath = urlPath.replace('/documents/', '');

    if (!docPath) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Missing document path' }));
      return;
    }

    await this.workspaceService!.deleteDocument(decodeURIComponent(docPath));

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true }));
  }

  /**
   * Get a document's content
   * GET /documents/{path}
   */
  private async handleGetDocument(
    _req: http.IncomingMessage,
    res: http.ServerResponse,
    urlPath: string
  ): Promise<void> {
    // Extract document path from URL
    const docPath = urlPath.replace('/documents/', '');

    if (!docPath) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Missing document path' }));
      return;
    }

    // Read the file directly from workspace
    const workspacePath = this.workspaceService!['workspacePath'];
    const fullPath = path.join(workspacePath, decodeURIComponent(docPath));
    const rawContent = await fs.readFile(fullPath, 'utf-8');

    // Parse and strip frontmatter
    const { content } = parseFrontmatter(rawContent);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ content }));
  }

  /**
   * Read request body
   */
  private readBody(req: http.IncomingMessage): Promise<string> {
    return new Promise((resolve, reject) => {
      let body = '';
      req.on('data', (chunk) => {
        body += chunk.toString();
      });
      req.on('end', () => {
        resolve(body);
      });
      req.on('error', reject);
    });
  }
}
