/**
 * Workspace configuration - defines the fixed workspace directory
 */

import * as path from 'path';
import { app } from 'electron';
import * as fs from 'fs/promises';

/**
 * Get the fixed workspace directory path
 * Uses ~/Documents/Finton on all platforms
 */
export function getWorkspacePath(): string {
  const homeDir = app.getPath('home');
  return path.join(homeDir, 'Documents', 'Finton');
}

/**
 * Check if workspace exists
 */
export async function workspaceExists(): Promise<boolean> {
  try {
    const workspacePath = getWorkspacePath();
    await fs.access(workspacePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Ensure workspace directory exists (create if needed)
 */
export async function ensureWorkspace(): Promise<string> {
  const workspacePath = getWorkspacePath();
  await fs.mkdir(workspacePath, { recursive: true });
  return workspacePath;
}

/**
 * Check if workspace needs first-time setup (GitHub clone)
 * Returns true if directory exists but is empty (no documents/ folder)
 */
export async function needsFirstTimeSetup(): Promise<boolean> {
  const workspacePath = getWorkspacePath();
  const exists = await workspaceExists();

  if (!exists) {
    return true;
  }

  // Check if documents directory exists
  const docsDir = path.join(workspacePath, 'documents');
  try {
    await fs.access(docsDir);
    // Documents dir exists, not first-time setup
    return false;
  } catch {
    // Documents dir doesn't exist, needs setup
    return true;
  }
}
