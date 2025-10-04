/**
 * Workspace and Git integration types
 */

export interface Workspace {
  id: string;
  name: string;
  path: string;
  description?: string;
  created: Date;
  lastOpened: Date;
  isGitRepo: boolean;
  remote?: RemoteRepository;
  settings: WorkspaceSettings;
}

export interface WorkspaceSettings {
  autoCommit: boolean;
  autoSync: boolean;
  syncInterval: number; // minutes
  defaultMode: 'notes' | 'markdown' | 'code';
  showHiddenFiles: boolean;
}

export interface RemoteRepository {
  url: string;
  name: string; // e.g., "origin"
  branch: string;
  lastSync?: Date;
  authType: 'ssh' | 'https' | 'token';
  username?: string;
}

export interface GitStatus {
  branch: string;
  ahead: number; // commits ahead of remote
  behind: number; // commits behind remote
  modified: string[]; // modified files
  staged: string[]; // staged files
  untracked: string[]; // untracked files
  conflicts: string[]; // conflicted files
  clean: boolean;
}

export interface GitCommit {
  hash: string;
  message: string;
  author: {
    name: string;
    email: string;
  };
  date: Date;
  files: string[];
}

export interface GitRemoteStatus {
  connected: boolean;
  ahead: number;
  behind: number;
  lastFetch?: Date;
  error?: string;
}

export interface SyncOperation {
  id: string;
  type: 'push' | 'pull' | 'fetch' | 'clone';
  status: 'pending' | 'in-progress' | 'success' | 'error';
  startedAt: Date;
  completedAt?: Date;
  error?: string;
  progress?: {
    phase: string;
    loaded: number;
    total: number;
  };
}

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

export interface Tag {
  name: string;
  count: number;
  color?: string;
  category?: string;
}

export interface SearchQuery {
  text?: string;
  tags?: string[];
  mode?: 'notes' | 'markdown' | 'code';
  dateRange?: {
    start?: Date;
    end?: Date;
  };
  regex?: boolean;
  includeHistory?: boolean; // search in Git history
}

export interface SearchResult {
  documentId: string;
  path: string;
  title: string;
  mode: 'notes' | 'markdown' | 'code';
  tags: string[];
  modified: Date;
  matches: SearchMatch[];
  score: number;
}

export interface SearchMatch {
  line: number;
  column: number;
  text: string;
  context: {
    before: string;
    match: string;
    after: string;
  };
}

export interface ConflictResolution {
  path: string;
  base: string; // common ancestor
  ours: string; // local version
  theirs: string; // remote version
  resolved?: string; // user-resolved content
  strategy?: 'ours' | 'theirs' | 'manual';
}
