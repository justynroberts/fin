/**
 * IPC handlers for workspace and Git operations
 */

import { ipcMain, dialog } from 'electron';
import { WorkspaceService } from './workspace-service';
import { settingsService } from './settings-service';
import { aiService } from './ai-service';
import { codeExecutionService } from './code-execution-service';
import * as fs from 'fs/promises';
import * as path from 'path';

let workspaceService: WorkspaceService | null = null;

/**
 * Register all IPC handlers
 */
export function registerIpcHandlers(): void {
  // Workspace operations
  ipcMain.handle('workspace:open', handleOpenWorkspace);
  ipcMain.handle('workspace:create', handleCreateWorkspace);
  ipcMain.handle('workspace:close', handleCloseWorkspace);
  ipcMain.handle('workspace:get-info', handleGetWorkspaceInfo);

  // Document operations
  ipcMain.handle('document:list', handleListDocuments);
  ipcMain.handle('document:read', handleReadDocument);
  ipcMain.handle('document:write', handleWriteDocument);
  ipcMain.handle('document:delete', handleDeleteDocument);
  ipcMain.handle('document:add-tags', handleAddTags);

  // Search operations
  ipcMain.handle('search:query', handleSearch);
  ipcMain.handle('search:tags', handleGetTags);
  ipcMain.handle('search:by-tag', handleSearchByTag);

  // Git operations
  ipcMain.handle('git:status', handleGitStatus);
  ipcMain.handle('git:commit', handleGitCommit);
  ipcMain.handle('git:push', handleGitPush);
  ipcMain.handle('git:pull', handleGitPull);
  ipcMain.handle('git:add-remote', handleAddRemote);
  ipcMain.handle('git:get-remotes', handleGetRemotes);
  ipcMain.handle('git:log', handleGetLog);

  // Settings operations
  ipcMain.handle('settings:get-git-config', handleGetGitConfig);
  ipcMain.handle('settings:set-git-config', handleSetGitConfig);
  ipcMain.handle('settings:get-ai-config', handleGetAIConfig);
  ipcMain.handle('settings:set-ai-config', handleSetAIConfig);
  ipcMain.handle('settings:get-editor-preferences', handleGetEditorPreferences);
  ipcMain.handle('settings:set-editor-preferences', handleSetEditorPreferences);

  // AI operations
  ipcMain.handle('ai:send-prompt', handleAISendPrompt);
  ipcMain.handle('ai:clear-memory', handleAIClearMemory);
  ipcMain.handle('ai:get-memory', handleAIGetMemory);

  // Code execution
  ipcMain.handle('code:execute', handleCodeExecute);
  ipcMain.handle('code:kill', handleCodeKill);
  ipcMain.handle('code:install-package', handleInstallPackage);

  // Template operations
  ipcMain.handle('template:save', handleSaveTemplate);
  ipcMain.handle('template:list', handleListTemplates);
  ipcMain.handle('template:load', handleLoadTemplate);
  ipcMain.handle('template:delete', handleDeleteTemplate);
}

/**
 * Open existing workspace
 */
async function handleOpenWorkspace(): Promise<{ success: boolean; path?: string; error?: string }> {
  try {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory', 'createDirectory'],
      title: 'Open Workspace',
    });

    if (result.canceled || result.filePaths.length === 0) {
      return { success: false };
    }

    const workspacePath = result.filePaths[0];

    // Initialize workspace service
    workspaceService = new WorkspaceService(workspacePath);
    await workspaceService.init();

    // Initialize workspace settings
    await settingsService.setWorkspacePath(workspacePath);

    return { success: true, path: workspacePath };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Create new workspace
 */
async function handleCreateWorkspace(): Promise<{ success: boolean; path?: string; error?: string }> {
  try {
    console.log('[IPC] Opening create workspace dialog...');
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory', 'createDirectory'],
      title: 'Create Workspace',
      buttonLabel: 'Create',
    });

    console.log('[IPC] Dialog result:', result);

    if (result.canceled || result.filePaths.length === 0) {
      console.log('[IPC] User canceled dialog');
      return { success: false };
    }

    const workspacePath = result.filePaths[0];
    console.log('[IPC] Creating workspace at:', workspacePath);

    // Initialize workspace service
    workspaceService = new WorkspaceService(workspacePath);
    await workspaceService.init();

    // Initialize workspace settings
    await settingsService.setWorkspacePath(workspacePath);

    console.log('[IPC] Workspace initialized successfully');
    return { success: true, path: workspacePath };
  } catch (error) {
    console.error('[IPC] Error creating workspace:', error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Close current workspace
 */
async function handleCloseWorkspace(): Promise<void> {
  if (workspaceService) {
    workspaceService.close();
    workspaceService = null;
  }
}

/**
 * Get workspace info
 */
async function handleGetWorkspaceInfo(): Promise<any> {
  if (!workspaceService) {
    throw new Error('No workspace open');
  }

  const metadata = await workspaceService.loadMetadata();
  return metadata.workspace;
}

/**
 * Parse frontmatter from file content
 */
function parseFrontmatter(content: string): { metadata: any; content: string } {
  if (!content.startsWith('---\n')) {
    return { metadata: {}, content };
  }

  const endIndex = content.indexOf('\n---\n', 4);
  if (endIndex === -1) {
    return { metadata: {}, content };
  }

  const frontmatterText = content.substring(4, endIndex);
  const actualContent = content.substring(endIndex + 5);

  // Parse frontmatter (simple key: value format)
  const metadata: any = {};
  for (const line of frontmatterText.split('\n')) {
    const colonIndex = line.indexOf(':');
    if (colonIndex !== -1) {
      const key = line.substring(0, colonIndex).trim();
      const value = line.substring(colonIndex + 1).trim();
      try {
        metadata[key] = JSON.parse(value);
      } catch {
        metadata[key] = value;
      }
    }
  }

  return { metadata, content: actualContent };
}

/**
 * List all documents in workspace (with frontmatter fallback)
 */
async function handleListDocuments(): Promise<any[]> {
  if (!workspaceService) {
    throw new Error('No workspace open');
  }

  const metadata = await workspaceService.loadMetadata();
  const workspacePath = workspaceService['workspacePath'];

  // Also scan for files with frontmatter that might not be in the database
  const documentsDir = path.join(workspacePath, 'documents');
  try {
    const files = await fs.readdir(documentsDir, { recursive: true });

    for (const file of files) {
      if (typeof file !== 'string') continue;

      const relativePath = `documents/${file}`;
      const fullPath = path.join(documentsDir, file);

      // Skip if it's a directory
      const stats = await fs.stat(fullPath);
      if (stats.isDirectory()) continue;

      // If not in database, try to read frontmatter
      if (!metadata.documents[relativePath]) {
        try {
          const content = await fs.readFile(fullPath, 'utf-8');
          const { metadata: fileMeta } = parseFrontmatter(content);

          if (fileMeta.title || fileMeta.mode) {
            // Add to metadata from frontmatter
            metadata.documents[relativePath] = {
              id: relativePath.replace(/[^a-zA-Z0-9]/g, '_'),
              title: fileMeta.title || path.basename(file, path.extname(file)),
              mode: fileMeta.mode || 'markdown',
              tags: fileMeta.tags || [],
              language: fileMeta.language,
              created: stats.birthtime.toISOString(),
              modified: stats.mtime.toISOString(),
            };
          }
        } catch (error) {
          console.error(`Failed to read frontmatter from ${relativePath}:`, error);
        }
      }
    }
  } catch (error) {
    // Documents directory might not exist yet
  }

  return Object.entries(metadata.documents).map(([path, doc]) => ({
    path,
    ...doc,
  }));
}

/**
 * Read document content (strips frontmatter)
 */
async function handleReadDocument(_event: any, relativePath: string): Promise<string> {
  if (!workspaceService) {
    throw new Error('No workspace open');
  }

  const fullPath = path.join(workspaceService['workspacePath'], relativePath);
  const rawContent = await fs.readFile(fullPath, 'utf-8');

  // Parse and strip frontmatter using the helper function
  const { content } = parseFrontmatter(rawContent);
  return content;
}

/**
 * Write document content with frontmatter metadata
 */
async function handleWriteDocument(
  _event: any,
  relativePath: string,
  content: string,
  metadata?: {
    title?: string;
    mode?: 'notes' | 'markdown' | 'code';
    tags?: string[];
    language?: string;
  }
): Promise<void> {
  if (!workspaceService) {
    throw new Error('No workspace open');
  }

  const fullPath = path.join(workspaceService['workspacePath'], relativePath);

  // Ensure directory exists
  await fs.mkdir(path.dirname(fullPath), { recursive: true });

  // Build frontmatter
  let fileContent = content;
  if (metadata) {
    const frontmatter = [
      '---',
      `title: ${JSON.stringify(metadata.title || path.basename(relativePath, path.extname(relativePath)))}`,
      `mode: ${metadata.mode || 'markdown'}`,
      metadata.tags && metadata.tags.length > 0 ? `tags: ${JSON.stringify(metadata.tags)}` : null,
      metadata.language ? `language: ${metadata.language}` : null,
      '---',
      ''
    ].filter(Boolean).join('\n');

    fileContent = frontmatter + content;
  }

  // Write file with frontmatter
  await fs.writeFile(fullPath, fileContent, 'utf-8');

  // Update or add document metadata in database (for backwards compatibility and performance)
  const docMetadata = await workspaceService.loadMetadata();

  if (docMetadata.documents[relativePath]) {
    // Update existing
    await workspaceService.updateDocument(relativePath, {
      title: metadata?.title,
      tags: metadata?.tags,
      language: metadata?.language,
    });
  } else {
    // Add new
    await workspaceService.addDocument(
      relativePath,
      metadata?.title || path.basename(relativePath),
      metadata?.mode || 'markdown',
      metadata?.tags || [],
      metadata?.language
    );
  }
}

/**
 * Delete document
 */
async function handleDeleteDocument(_event: any, relativePath: string): Promise<void> {
  if (!workspaceService) {
    throw new Error('No workspace open');
  }

  await workspaceService.deleteDocument(relativePath);
}

/**
 * Add tags to document
 */
async function handleAddTags(
  _event: any,
  relativePath: string,
  tags: string[]
): Promise<void> {
  if (!workspaceService) {
    throw new Error('No workspace open');
  }

  const metadata = await workspaceService.loadMetadata();
  const doc = metadata.documents[relativePath];

  if (!doc) {
    throw new Error(`Document not found: ${relativePath}`);
  }

  const newTags = Array.from(new Set([...doc.tags, ...tags]));

  await workspaceService.updateDocument(relativePath, { tags: newTags });
}

/**
 * Search documents
 */
async function handleSearch(_event: any, query: string): Promise<any[]> {
  if (!workspaceService) {
    throw new Error('No workspace open');
  }

  return workspaceService.search(query);
}

/**
 * Get all tags
 */
async function handleGetTags(): Promise<Array<{ name: string; count: number }>> {
  if (!workspaceService) {
    throw new Error('No workspace open');
  }

  return workspaceService.getTags();
}

/**
 * Search documents by tag
 */
async function handleSearchByTag(_event: any, tag: string): Promise<any[]> {
  if (!workspaceService) {
    throw new Error('No workspace open');
  }

  return workspaceService.getDocumentsByTag(tag);
}

/**
 * Get Git status
 */
async function handleGitStatus(): Promise<any> {
  if (!workspaceService) {
    throw new Error('No workspace open');
  }

  const gitService = workspaceService.getGitService();
  const status = await gitService.getStatus();

  return {
    branch: status.current,
    ahead: status.ahead,
    behind: status.behind,
    modified: status.modified,
    staged: status.staged,
    untracked: status.not_added,
    conflicts: status.conflicted,
    clean: status.isClean(),
  };
}

/**
 * Commit changes
 */
async function handleGitCommit(_event: any, message: string): Promise<void> {
  if (!workspaceService) {
    throw new Error('No workspace open');
  }

  const gitService = workspaceService.getGitService();
  await gitService.stage('.');
  await gitService.commit(message);
}

/**
 * Push to remote
 */
async function handleGitPush(_event: any, remote = 'origin', branch = 'main'): Promise<void> {
  if (!workspaceService) {
    throw new Error('No workspace open');
  }

  const gitService = workspaceService.getGitService();
  await gitService.push(remote, branch);
}

/**
 * Pull from remote
 */
async function handleGitPull(_event: any, remote = 'origin', branch = 'main'): Promise<void> {
  if (!workspaceService) {
    throw new Error('No workspace open');
  }

  const gitService = workspaceService.getGitService();
  await gitService.pull(remote, branch);
}

/**
 * Add remote repository
 */
async function handleAddRemote(_event: any, name: string, url: string): Promise<void> {
  if (!workspaceService) {
    throw new Error('No workspace open');
  }

  const gitService = workspaceService.getGitService();
  await gitService.addRemote(name, url);
}

/**
 * Get remote repositories
 */
async function handleGetRemotes(): Promise<Array<{ name: string; url: string }>> {
  if (!workspaceService) {
    throw new Error('No workspace open');
  }

  const gitService = workspaceService.getGitService();
  return await gitService.getRemotes();
}

/**
 * Get commit log
 */
async function handleGetLog(
  _event: any,
  file?: string,
  maxCount = 50
): Promise<any[]> {
  if (!workspaceService) {
    throw new Error('No workspace open');
  }

  const gitService = workspaceService.getGitService();
  return await gitService.getLog(file, maxCount);
}

/**
 * Get git configuration from settings
 */
async function handleGetGitConfig(): Promise<any> {
  return await settingsService.getGitConfig();
}

/**
 * Save git configuration to settings
 */
async function handleSetGitConfig(_event: any, config: any): Promise<void> {
  await settingsService.setGitConfig(config);

  // If workspace is open, update git user config
  if (workspaceService) {
    const gitService = workspaceService.getGitService();
    await gitService.setUserConfig(config.userName, config.userEmail);

    // If remote URL is provided, set it up
    if (config.remoteUrl) {
      try {
        const remotes = await gitService.getRemotes();
        const hasOrigin = remotes.some((r) => r.name === 'origin');

        if (hasOrigin) {
          // Update existing remote
          await gitService.setRemoteUrl('origin', config.remoteUrl);
        } else {
          // Add new remote
          await gitService.addRemote('origin', config.remoteUrl);
        }
      } catch (error) {
        console.error('[Settings] Failed to configure remote:', error);
      }
    }
  }
}

/**
 * Get AI configuration from settings
 */
async function handleGetAIConfig(): Promise<any> {
  return await settingsService.getAIConfig();
}

/**
 * Save AI configuration to settings
 */
async function handleSetAIConfig(_event: any, config: any): Promise<void> {
  await settingsService.setAIConfig(config);
}

/**
 * Send AI prompt with document context
 */
async function handleAISendPrompt(
  _event: any,
  documentPath: string,
  documentContent: string,
  userPrompt: string,
  mode: string,
  language: string
): Promise<string> {
  return await aiService.sendPrompt(documentPath, documentContent, userPrompt, mode, language);
}

/**
 * Clear AI conversation memory
 */
async function handleAIClearMemory(_event: any, documentPath?: string): Promise<void> {
  await aiService.clearMemory(documentPath);
}

/**
 * Get AI conversation memory for a document
 */
async function handleAIGetMemory(_event: any, documentPath: string): Promise<any> {
  return await aiService.getMemory(documentPath);
}

/**
 * Execute code with specified executor
 */
async function handleCodeExecute(
  _event: any,
  code: string,
  executor: string,
  language: string
): Promise<{ output: string; error: string | null; exitCode: number }> {
  return await codeExecutionService.execute(code, executor, language);
}

/**
 * Kill the currently running code process
 */
async function handleCodeKill(): Promise<{ success: boolean }> {
  const killed = codeExecutionService.killRunningProcess();
  return { success: killed };
}

/**
 * Install package for specified language
 */
async function handleInstallPackage(
  _event: any,
  packageName: string,
  language: string
): Promise<{ success: boolean; message: string }> {
  return await codeExecutionService.installPackage(packageName, language);
}

/**
 * Get editor preferences from workspace settings
 */
async function handleGetEditorPreferences(): Promise<any> {
  return await settingsService.getEditorPreferences();
}

/**
 * Save editor preferences to workspace settings
 */
async function handleSetEditorPreferences(_event: any, preferences: any): Promise<void> {
  await settingsService.setEditorPreferences(preferences);
}

/**
 * Save current document as a template
 */
async function handleSaveTemplate(
  _event: any,
  name: string,
  mode: string,
  language: string | undefined,
  content: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!workspaceService) {
      return { success: false, error: 'No workspace open' };
    }

    const workspacePath = (workspaceService as any).workspacePath;
    const templatesDir = path.join(workspacePath, '.fintontext', 'templates');

    // Create templates directory if it doesn't exist
    await fs.mkdir(templatesDir, { recursive: true });

    // Create template metadata
    const template = {
      name,
      mode,
      language,
      created: new Date().toISOString(),
    };

    // Save template content with metadata as frontmatter
    const frontmatter = [
      '---',
      `name: ${JSON.stringify(name)}`,
      `mode: ${mode}`,
      language ? `language: ${language}` : null,
      `created: ${JSON.stringify(template.created)}`,
      '---',
      ''
    ].filter(Boolean).join('\n');

    const templateContent = frontmatter + content;

    // Generate filename from name (sanitized)
    const filename = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '.template';
    const templatePath = path.join(templatesDir, filename);

    await fs.writeFile(templatePath, templateContent, 'utf-8');

    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

/**
 * List all templates
 */
async function handleListTemplates(): Promise<Array<{ name: string; mode: string; language?: string; created: string; filename: string }>> {
  try {
    if (!workspaceService) {
      return [];
    }

    const workspacePath = (workspaceService as any).workspacePath;
    const templatesDir = path.join(workspacePath, '.fintontext', 'templates');

    // Check if templates directory exists
    try {
      await fs.access(templatesDir);
    } catch {
      return [];
    }

    const files = await fs.readdir(templatesDir);
    const templates: Array<{ name: string; mode: string; language?: string; created: string; filename: string }> = [];

    for (const file of files) {
      if (!file.endsWith('.template')) continue;

      const content = await fs.readFile(path.join(templatesDir, file), 'utf-8');
      const { metadata } = parseFrontmatter(content);

      if (metadata.name && metadata.mode) {
        templates.push({
          name: metadata.name,
          mode: metadata.mode,
          language: metadata.language,
          created: metadata.created,
          filename: file,
        });
      }
    }

    // Sort by created date (newest first)
    templates.sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());

    return templates;
  } catch (error) {
    console.error('[Templates] Failed to list templates:', error);
    return [];
  }
}

/**
 * Load template content
 */
async function handleLoadTemplate(
  _event: any,
  filename: string
): Promise<{ success: boolean; content?: string; error?: string }> {
  try {
    if (!workspaceService) {
      return { success: false, error: 'No workspace open' };
    }

    const workspacePath = (workspaceService as any).workspacePath;
    const templatePath = path.join(workspacePath, '.fintontext', 'templates', filename);

    const rawContent = await fs.readFile(templatePath, 'utf-8');
    const { content } = parseFrontmatter(rawContent);

    return { success: true, content };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Delete a template
 */
async function handleDeleteTemplate(
  _event: any,
  filename: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!workspaceService) {
      return { success: false, error: 'No workspace open' };
    }

    const workspacePath = (workspaceService as any).workspacePath;
    const templatePath = path.join(workspacePath, '.fintontext', 'templates', filename);

    await fs.unlink(templatePath);

    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}
