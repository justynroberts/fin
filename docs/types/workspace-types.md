# Workspace Types Documentation

**File**: `src/renderer/types/workspace.ts`

## Overview

Workspace types define the Git-based document management system, including workspace configuration, Git operations, document search, and conflict resolution.

---

## Core Types

### `Workspace`

```typescript
interface Workspace {
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
```

Represents a workspace (a directory containing documents).

**Fields**:
- `id` - Unique workspace identifier (UUID)
- `name` - Display name
- `path` - Absolute filesystem path
- `description` - Optional description
- `created` - Creation timestamp
- `lastOpened` - Last opened timestamp
- `isGitRepo` - Whether directory is a Git repository
- `remote` - Remote repository configuration (if configured)
- `settings` - Workspace-specific settings

**Example**:
```typescript
const workspace: Workspace = {
  id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  name: 'My Notes',
  path: '/Users/john/Documents/notes',
  description: 'Personal note collection',
  created: new Date('2025-01-15'),
  lastOpened: new Date('2025-10-02'),
  isGitRepo: true,
  remote: {
    url: 'https://github.com/john/notes.git',
    name: 'origin',
    branch: 'main',
    authType: 'https',
    username: 'john'
  },
  settings: {
    autoCommit: true,
    autoSync: false,
    syncInterval: 30,
    defaultMode: 'markdown',
    showHiddenFiles: false
  }
};
```

---

## Workspace Settings

### `WorkspaceSettings`

```typescript
interface WorkspaceSettings {
  autoCommit: boolean;
  autoSync: boolean;
  syncInterval: number; // minutes
  defaultMode: 'rich-text' | 'markdown' | 'code';
  showHiddenFiles: boolean;
}
```

Configurable workspace behavior.

**Fields**:
- `autoCommit` - Auto-commit changes when saving (default: true)
- `autoSync` - Auto-push/pull from remote (default: false)
- `syncInterval` - Minutes between auto-syncs (default: 30)
- `defaultMode` - Default editor mode for new documents (default: 'markdown')
- `showHiddenFiles` - Show dot-files in workspace (default: false)

**Example**:
```typescript
const settings: WorkspaceSettings = {
  autoCommit: true,
  autoSync: true,
  syncInterval: 15, // Sync every 15 minutes
  defaultMode: 'markdown',
  showHiddenFiles: false
};
```

---

## Git Integration

### `RemoteRepository`

```typescript
interface RemoteRepository {
  url: string;
  name: string; // e.g., "origin"
  branch: string;
  lastSync?: Date;
  authType: 'ssh' | 'https' | 'token';
  username?: string;
}
```

Remote repository configuration.

**Fields**:
- `url` - Remote URL (e.g., 'https://github.com/user/repo.git')
- `name` - Remote name (typically 'origin')
- `branch` - Default branch (e.g., 'main', 'master')
- `lastSync` - Last successful push/pull
- `authType` - Authentication method
  - `'ssh'` - SSH keys
  - `'https'` - Username/password or personal access token
  - `'token'` - Personal access token
- `username` - Username for HTTPS/token auth

**Example**:
```typescript
const remote: RemoteRepository = {
  url: 'git@github.com:john/notes.git',
  name: 'origin',
  branch: 'main',
  lastSync: new Date('2025-10-02T14:30:00'),
  authType: 'ssh'
};
```

---

### `GitStatus`

```typescript
interface GitStatus {
  branch: string;
  ahead: number; // commits ahead of remote
  behind: number; // commits behind remote
  modified: string[]; // modified files
  staged: string[]; // staged files
  untracked: string[]; // untracked files
  conflicts: string[]; // conflicted files
  clean: boolean;
}
```

Current Git repository status.

**Fields**:
- `branch` - Current branch name
- `ahead` - Number of local commits not pushed
- `behind` - Number of remote commits not pulled
- `modified` - Files with unstaged changes
- `staged` - Files staged for commit
- `untracked` - New files not yet tracked
- `conflicts` - Files with merge conflicts
- `clean` - Whether working directory is clean (no changes)

**Example**:
```typescript
const status: GitStatus = {
  branch: 'main',
  ahead: 2,
  behind: 0,
  modified: ['docs/todo.md', 'notes/ideas.md'],
  staged: ['README.md'],
  untracked: ['new-note.md'],
  conflicts: [],
  clean: false
};
```

---

### `GitCommit`

```typescript
interface GitCommit {
  hash: string;
  message: string;
  author: {
    name: string;
    email: string;
  };
  date: Date;
  files: string[];
}
```

Represents a Git commit.

**Fields**:
- `hash` - Commit SHA hash (abbreviated)
- `message` - Commit message
- `author` - Commit author information
- `date` - Commit timestamp
- `files` - List of files changed in commit

**Example**:
```typescript
const commit: GitCommit = {
  hash: 'a1b2c3d',
  message: 'Update project documentation',
  author: {
    name: 'John Doe',
    email: 'john@example.com'
  },
  date: new Date('2025-10-02T14:25:00'),
  files: ['README.md', 'docs/architecture.md']
};
```

---

### `GitRemoteStatus`

```typescript
interface GitRemoteStatus {
  connected: boolean;
  ahead: number;
  behind: number;
  lastFetch?: Date;
  error?: string;
}
```

Remote repository connection status.

**Fields**:
- `connected` - Whether remote is accessible
- `ahead` - Commits ahead of remote
- `behind` - Commits behind remote
- `lastFetch` - Last fetch operation
- `error` - Connection error message (if any)

**Example**:
```typescript
const remoteStatus: GitRemoteStatus = {
  connected: true,
  ahead: 3,
  behind: 1,
  lastFetch: new Date('2025-10-02T14:00:00')
};
```

---

### `SyncOperation`

```typescript
interface SyncOperation {
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
```

Represents an ongoing or completed Git sync operation.

**Fields**:
- `id` - Operation identifier
- `type` - Type of operation
- `status` - Current status
- `startedAt` - When operation started
- `completedAt` - When operation finished (if complete)
- `error` - Error message (if failed)
- `progress` - Progress information (for long operations)

**Example**:
```typescript
const syncOp: SyncOperation = {
  id: 'sync-1696262400000',
  type: 'push',
  status: 'in-progress',
  startedAt: new Date('2025-10-02T14:30:00'),
  progress: {
    phase: 'Uploading objects',
    loaded: 450,
    total: 1000
  }
};
```

---

## Document Metadata

### `WorkspaceMetadata`

```typescript
interface WorkspaceMetadata {
  version: string;
  workspace: {
    name: string;
    created: string;
    description?: string;
  };
  documents: Record<string, WorkspaceDocumentMetadata>;
}
```

Workspace metadata file (`.fintontext-metadata.json`).

**Fields**:
- `version` - Metadata format version
- `workspace` - Workspace information
- `documents` - Map of document path → metadata

**Storage**: Saved as `.fintontext-metadata.json` in workspace root, tracked by Git.

**Example**:
```typescript
const metadata: WorkspaceMetadata = {
  version: '1.0',
  workspace: {
    name: 'Project Notes',
    created: '2025-01-15T00:00:00Z',
    description: 'Notes for the FintonText project'
  },
  documents: {
    'notes/architecture.md': {
      id: 'doc-1',
      title: 'Architecture Overview',
      tags: ['design', 'technical'],
      created: '2025-01-15T10:00:00Z',
      modified: '2025-10-02T14:30:00Z',
      mode: 'markdown'
    },
    'code/example.js': {
      id: 'doc-2',
      title: 'Example Code',
      tags: ['code', 'example'],
      created: '2025-01-20T12:00:00Z',
      modified: '2025-01-20T12:00:00Z',
      mode: 'code',
      language: 'javascript'
    }
  }
};
```

---

### `WorkspaceDocumentMetadata`

```typescript
interface WorkspaceDocumentMetadata {
  id: string;
  title: string;
  tags: string[];
  created: string;
  modified: string;
  mode: 'rich-text' | 'markdown' | 'code';
  language?: string;
  customFields?: Record<string, any>;
}
```

Metadata for a single document in the workspace.

**Fields**:
- `id` - Unique document ID
- `title` - Display title
- `tags` - User-assigned tags
- `created` - ISO 8601 creation date
- `modified` - ISO 8601 last modified date
- `mode` - Editor mode
- `language` - Programming language (code mode)
- `customFields` - Additional user-defined metadata

---

## Search System

### `Tag`

```typescript
interface Tag {
  name: string;
  count: number;
  color?: string;
  category?: string;
}
```

Represents a tag with usage statistics.

**Fields**:
- `name` - Tag name (e.g., 'important', 'todo')
- `count` - Number of documents with this tag
- `color` - Optional display color (hex code)
- `category` - Optional category for grouping

**Example**:
```typescript
const tags: Tag[] = [
  { name: 'important', count: 5, color: '#ff0000' },
  { name: 'todo', count: 12, color: '#ffa500' },
  { name: 'completed', count: 8, color: '#00ff00' }
];
```

---

### `SearchQuery`

```typescript
interface SearchQuery {
  text?: string;
  tags?: string[];
  mode?: 'rich-text' | 'markdown' | 'code';
  dateRange?: {
    start?: Date;
    end?: Date;
  };
  regex?: boolean;
  includeHistory?: boolean; // search in Git history
}
```

Search parameters for full-text search.

**Fields**:
- `text` - Text to search for (FTS5 query syntax supported)
- `tags` - Filter by tags (AND logic)
- `mode` - Filter by editor mode
- `dateRange` - Filter by modification date
- `regex` - Treat text as regex pattern
- `includeHistory` - Search in Git commit history (not just current files)

**FTS5 Query Syntax**:
- `"exact phrase"` - Phrase search
- `term1 AND term2` - Both terms required
- `term1 OR term2` - Either term
- `term*` - Prefix search
- `term1 NOT term2` - Exclude term2

**Example**:
```typescript
const query: SearchQuery = {
  text: '"project plan" OR roadmap',
  tags: ['important'],
  mode: 'markdown',
  dateRange: {
    start: new Date('2025-09-01'),
    end: new Date('2025-10-02')
  },
  regex: false,
  includeHistory: false
};
```

---

### `SearchResult`

```typescript
interface SearchResult {
  documentId: string;
  path: string;
  title: string;
  mode: 'rich-text' | 'markdown' | 'code';
  tags: string[];
  modified: Date;
  matches: SearchMatch[];
  score: number;
}
```

A single search result.

**Fields**:
- `documentId` - Document identifier
- `path` - Relative path in workspace
- `title` - Document title
- `mode` - Editor mode
- `tags` - Document tags
- `modified` - Last modified date
- `matches` - Individual match locations
- `score` - Relevance score (0-1, higher is better)

**Example**:
```typescript
const result: SearchResult = {
  documentId: 'doc-123',
  path: 'notes/architecture.md',
  title: 'Architecture Overview',
  mode: 'markdown',
  tags: ['design', 'technical'],
  modified: new Date('2025-10-02'),
  matches: [
    {
      line: 15,
      column: 10,
      text: 'project plan',
      context: {
        before: 'According to the ',
        match: 'project plan',
        after: ', we will implement...'
      }
    }
  ],
  score: 0.95
};
```

---

### `SearchMatch`

```typescript
interface SearchMatch {
  line: number;
  column: number;
  text: string;
  context: {
    before: string;
    match: string;
    after: string;
  };
}
```

A specific match location within a document.

**Fields**:
- `line` - Line number (1-indexed)
- `column` - Column number (1-indexed)
- `text` - Matched text
- `context` - Surrounding text for preview
  - `before` - Text before match (up to 50 chars)
  - `match` - The matched text
  - `after` - Text after match (up to 50 chars)

---

## Conflict Resolution

### `ConflictResolution`

```typescript
interface ConflictResolution {
  path: string;
  base: string; // common ancestor
  ours: string; // local version
  theirs: string; // remote version
  resolved?: string; // user-resolved content
  strategy?: 'ours' | 'theirs' | 'manual';
}
```

Represents a merge conflict and its resolution.

**Fields**:
- `path` - File path with conflict
- `base` - Common ancestor version
- `ours` - Local version (current changes)
- `theirs` - Remote version (incoming changes)
- `resolved` - User-resolved content (if resolved)
- `strategy` - Resolution strategy
  - `'ours'` - Keep local version
  - `'theirs'` - Accept remote version
  - `'manual'` - User manually resolved

**Example**:
```typescript
const conflict: ConflictResolution = {
  path: 'notes/todo.md',
  base: '# TODO\n\n- Task 1\n- Task 2',
  ours: '# TODO\n\n- Task 1\n- Task 2\n- Task 3 (local)',
  theirs: '# TODO\n\n- Task 1\n- Task 2\n- Task 3 (remote)',
  resolved: '# TODO\n\n- Task 1\n- Task 2\n- Task 3 (local)\n- Task 3 (remote)',
  strategy: 'manual'
};
```

---

## Usage Examples

### Creating a Workspace

```typescript
import { v4 as uuidv4 } from 'uuid';

async function createWorkspace(path: string, name: string): Promise<Workspace> {
  // Initialize Git repo
  await window.electronAPI.git.init(path);

  const workspace: Workspace = {
    id: uuidv4(),
    name,
    path,
    created: new Date(),
    lastOpened: new Date(),
    isGitRepo: true,
    settings: {
      autoCommit: true,
      autoSync: false,
      syncInterval: 30,
      defaultMode: 'markdown',
      showHiddenFiles: false
    }
  };

  // Save metadata
  const metadata: WorkspaceMetadata = {
    version: '1.0',
    workspace: {
      name,
      created: new Date().toISOString()
    },
    documents: {}
  };

  await window.electronAPI.workspace.saveMetadata(path, metadata);

  return workspace;
}
```

### Performing a Search

```typescript
async function searchDocuments(query: SearchQuery): Promise<SearchResult[]> {
  const results = await window.electronAPI.search.query(query);

  // Sort by score
  results.sort((a, b) => b.score - a.score);

  return results;
}

// Usage
const results = await searchDocuments({
  text: 'architecture',
  tags: ['design'],
  mode: 'markdown'
});

console.log(`Found ${results.length} documents`);
results.forEach(result => {
  console.log(`${result.title} (score: ${result.score})`);
  result.matches.forEach(match => {
    console.log(`  Line ${match.line}: ${match.context.before}${match.context.match}${match.context.after}`);
  });
});
```

### Git Operations

```typescript
async function commitAndPush(message: string): Promise<void> {
  // Stage all changes
  await window.electronAPI.git.add('.');

  // Commit
  await window.electronAPI.git.commit(message);

  // Get status
  const status: GitStatus = await window.electronAPI.git.getStatus();
  console.log(`Committed, ${status.ahead} commits ahead`);

  // Push to remote
  if (status.ahead > 0) {
    const syncOp: SyncOperation = await window.electronAPI.git.push();
    console.log('Pushed to remote');
  }
}
```

---

## Related Types

- **Editor Types** (`editor.ts`) - Editor modes and configuration
- **Document Types** (`document.ts`) - Document structure and file operations
- **Theme Types** (`theme.ts`) - Visual appearance
