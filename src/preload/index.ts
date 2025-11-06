import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  ping: () => ipcRenderer.invoke('ping'),

  // Workspace operations
  workspace: {
    open: () => ipcRenderer.invoke('workspace:open'),
    openPath: (path: string) => ipcRenderer.invoke('workspace:open-path', path),
    create: () => ipcRenderer.invoke('workspace:create'),
    close: () => ipcRenderer.invoke('workspace:close'),
    getInfo: () => ipcRenderer.invoke('workspace:get-info'),
  },

  // Document operations
  document: {
    list: () => ipcRenderer.invoke('document:list'),
    read: (path: string) => ipcRenderer.invoke('document:read', path),
    write: (path: string, content: string, metadata?: any) =>
      ipcRenderer.invoke('document:write', path, content, metadata),
    delete: (path: string) => ipcRenderer.invoke('document:delete', path),
    addTags: (path: string, tags: string[]) =>
      ipcRenderer.invoke('document:add-tags', path, tags),
  },

  // Search operations
  search: {
    query: (query: string) => ipcRenderer.invoke('search:query', query),
    tags: () => ipcRenderer.invoke('search:tags'),
    byTag: (tag: string) => ipcRenderer.invoke('search:by-tag', tag),
  },

  // Git operations
  git: {
    status: () => ipcRenderer.invoke('git:status'),
    commit: (message: string) => ipcRenderer.invoke('git:commit', message),
    push: (remote?: string, branch?: string) =>
      ipcRenderer.invoke('git:push', remote, branch),
    pull: (remote?: string, branch?: string) =>
      ipcRenderer.invoke('git:pull', remote, branch),
    addRemote: (name: string, url: string) =>
      ipcRenderer.invoke('git:add-remote', name, url),
    getRemotes: () => ipcRenderer.invoke('git:get-remotes'),
    log: (file?: string, maxCount?: number) =>
      ipcRenderer.invoke('git:log', file, maxCount),
    syncWithRemote: (remoteUrl: string, patToken?: string) =>
      ipcRenderer.invoke('git:sync-with-remote', remoteUrl, patToken),
  },

  // Settings operations
  settings: {
    getGitConfig: () => ipcRenderer.invoke('settings:get-git-config'),
    setGitConfig: (config: any) => ipcRenderer.invoke('settings:set-git-config', config),
    getAIConfig: () => ipcRenderer.invoke('settings:get-ai-config'),
    setAIConfig: (config: any) => ipcRenderer.invoke('settings:set-ai-config', config),
    getEditorPreferences: () => ipcRenderer.invoke('settings:get-editor-preferences'),
    setEditorPreferences: (preferences: any) => ipcRenderer.invoke('settings:set-editor-preferences', preferences),
  },

  // AI operations
  ai: {
    sendPrompt: (documentPath: string, documentContent: string, userPrompt: string, mode: string, language: string) =>
      ipcRenderer.invoke('ai:send-prompt', documentPath, documentContent, userPrompt, mode, language),
    clearMemory: (documentPath?: string) =>
      ipcRenderer.invoke('ai:clear-memory', documentPath),
    getMemory: (documentPath: string) =>
      ipcRenderer.invoke('ai:get-memory', documentPath),
  },

  // Code execution
  code: {
    execute: (code: string, executor: string, language: string) =>
      ipcRenderer.invoke('code:execute', code, executor, language),
    kill: () =>
      ipcRenderer.invoke('code:kill'),
    installPackage: (packageName: string, language: string) =>
      ipcRenderer.invoke('code:install-package', packageName, language),
  },

  // Template operations
  template: {
    save: (name: string, mode: string, language: string | undefined, content: string) =>
      ipcRenderer.invoke('template:save', name, mode, language, content),
    list: () => ipcRenderer.invoke('template:list'),
    load: (filename: string) => ipcRenderer.invoke('template:load', filename),
    delete: (filename: string) => ipcRenderer.invoke('template:delete', filename),
  },

  // RSS operations
  rss: {
    getConfig: () => ipcRenderer.invoke('rss:get-config'),
    setConfig: (config: any) => ipcRenderer.invoke('rss:set-config', config),
    fetchFeeds: () => ipcRenderer.invoke('rss:fetch-feeds'),
    openLink: (url: string) => ipcRenderer.invoke('rss:open-link', url),
  },
});

// Type definitions for the exposed API
export interface ElectronAPI {
  ping: () => Promise<string>;

  workspace: {
    open: () => Promise<{ success: boolean; path?: string; error?: string }>;
    openPath: (path: string) => Promise<{ success: boolean; path?: string; error?: string }>;
    create: () => Promise<{ success: boolean; path?: string; error?: string }>;
    close: () => Promise<void>;
    getInfo: () => Promise<any>;
  };

  document: {
    list: () => Promise<any[]>;
    read: (path: string) => Promise<string>;
    write: (path: string, content: string, metadata?: any) => Promise<void>;
    delete: (path: string) => Promise<void>;
    addTags: (path: string, tags: string[]) => Promise<void>;
  };

  search: {
    query: (query: string) => Promise<any[]>;
    tags: () => Promise<Array<{ name: string; count: number }>>;
    byTag: (tag: string) => Promise<any[]>;
  };

  git: {
    status: () => Promise<any>;
    commit: (message: string) => Promise<void>;
    push: (remote?: string, branch?: string) => Promise<void>;
    pull: (remote?: string, branch?: string) => Promise<void>;
    addRemote: (name: string, url: string) => Promise<void>;
    getRemotes: () => Promise<Array<{ name: string; url: string }>>;
    log: (file?: string, maxCount?: number) => Promise<any[]>;
    syncWithRemote: (remoteUrl: string, patToken?: string) => Promise<void>;
  };

  settings: {
    getGitConfig: () => Promise<any>;
    setGitConfig: (config: any) => Promise<void>;
    getAIConfig: () => Promise<any>;
    setAIConfig: (config: any) => Promise<void>;
    getEditorPreferences: () => Promise<any>;
    setEditorPreferences: (preferences: any) => Promise<void>;
  };

  ai: {
    sendPrompt: (documentPath: string, documentContent: string, userPrompt: string, mode: string, language: string) => Promise<string>;
    clearMemory: (documentPath?: string) => Promise<void>;
    getMemory: (documentPath: string) => Promise<any>;
  };

  code: {
    execute: (code: string, executor: string, language: string) => Promise<{
      output: string;
      error: string | null;
      exitCode: number;
    }>;
    kill: () => Promise<{ success: boolean }>;
    installPackage: (packageName: string, language: string) => Promise<{
      success: boolean;
      message: string;
    }>;
  };

  template: {
    save: (name: string, mode: string, language: string | undefined, content: string) => Promise<{ success: boolean; error?: string }>;
    list: () => Promise<Array<{ name: string; mode: string; language?: string; created: string; filename: string }>>;
    load: (filename: string) => Promise<{ success: boolean; content?: string; error?: string }>;
    delete: (filename: string) => Promise<{ success: boolean; error?: string }>;
  };

  rss: {
    getConfig: () => Promise<any>;
    setConfig: (config: any) => Promise<void>;
    fetchFeeds: () => Promise<any[]>;
    openLink: (url: string) => Promise<void>;
  };
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
