# Document Types Documentation

**File**: `src/renderer/types/document.ts`

## Overview

Document types define structures for file operations, document persistence, and auto-save functionality in FintonText.

---

## Core Types

### `Document`

```typescript
interface Document {
  id: string;
  content: string;
  mode: EditorMode;
  language?: CodeLanguage;
  filePath?: string;
  fileName: string;
  isDirty: boolean;
  created: Date;
  modified: Date;
  saved?: Date;
}
```

Represents a complete document in the application.

**Fields**:
- `id` - Unique document identifier (UUID v4)
- `content` - Full document content as string
- `mode` - Editor mode ('rich-text', 'markdown', or 'code')
- `language` - Programming language (when mode is 'code')
- `filePath` - Full filesystem path (undefined if never saved)
- `fileName` - Display name (e.g., 'untitled-1.md')
- `isDirty` - Whether document has unsaved changes
- `created` - When document was first created
- `modified` - Last modification timestamp
- `saved` - Last save timestamp (undefined if never saved)

**Example**:
```typescript
const doc: Document = {
  id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  content: '# Hello World\n\nThis is my document.',
  mode: 'markdown',
  fileName: 'hello.md',
  filePath: '/Users/john/Documents/hello.md',
  isDirty: false,
  created: new Date('2025-10-01'),
  modified: new Date('2025-10-02'),
  saved: new Date('2025-10-02')
};
```

---

## File Information

### `FileInfo`

```typescript
interface FileInfo {
  path: string;
  name: string;
  extension: string;
  size: number;
  lastModified: Date;
}
```

File metadata from the filesystem.

**Fields**:
- `path` - Full absolute path to file
- `name` - File name with extension
- `extension` - File extension (e.g., '.md', '.txt', '.js')
- `size` - File size in bytes
- `lastModified` - Last modification time from filesystem

**Usage**: Obtained when opening files, used for workspace file listing.

**Example**:
```typescript
const fileInfo: FileInfo = {
  path: '/Users/john/notes/project.md',
  name: 'project.md',
  extension: '.md',
  size: 2048,
  lastModified: new Date('2025-10-02T14:30:00')
};
```

---

## File Operations

### `SaveOptions`

```typescript
interface SaveOptions {
  filePath?: string;
  createBackup?: boolean;
  encoding?: BufferEncoding;
}
```

Options for saving documents to disk.

**Fields**:
- `filePath` - Where to save (if different from current path)
- `createBackup` - Create .bak file before overwriting
- `encoding` - Character encoding (default: 'utf8')

**Common encodings**: `'utf8'`, `'ascii'`, `'utf16le'`, `'latin1'`

**Example**:
```typescript
const options: SaveOptions = {
  filePath: '/Users/john/Documents/backup.md',
  createBackup: true,
  encoding: 'utf8'
};

await window.electronAPI.document.save(content, options);
```

---

### `OpenOptions`

```typescript
interface OpenOptions {
  encoding?: BufferEncoding;
  mode?: EditorMode;
  language?: CodeLanguage;
}
```

Options for opening/loading documents.

**Fields**:
- `encoding` - Character encoding to use when reading file
- `mode` - Force specific editor mode (otherwise auto-detected)
- `language` - Programming language (for code mode)

**Mode Detection**: If `mode` is not specified:
- `.md` files → markdown mode
- `.js`, `.ts`, `.py`, etc. → code mode with appropriate language
- `.txt` → markdown mode
- Other files → code mode with plaintext

**Example**:
```typescript
const options: OpenOptions = {
  encoding: 'utf8',
  mode: 'code',
  language: 'javascript'
};

const doc = await window.electronAPI.document.open('/path/to/file.js', options);
```

---

## Recent Files

### `RecentFile`

```typescript
interface RecentFile {
  path: string;
  name: string;
  lastOpened: Date;
  mode: EditorMode;
}
```

Information about recently opened files for quick access.

**Fields**:
- `path` - Full path to file
- `name` - Display name
- `lastOpened` - When file was last opened
- `mode` - Editor mode used when last opened

**Usage**: Displayed in "File > Open Recent" menu, limited to last 10 files.

**Example**:
```typescript
const recent: RecentFile[] = [
  {
    path: '/Users/john/project/README.md',
    name: 'README.md',
    lastOpened: new Date('2025-10-02T15:00:00'),
    mode: 'markdown'
  },
  {
    path: '/Users/john/code/app.js',
    name: 'app.js',
    lastOpened: new Date('2025-10-02T14:30:00'),
    mode: 'code'
  }
];
```

---

## Auto-Save System

### `AutoSaveState`

```typescript
interface AutoSaveState {
  enabled: boolean;
  interval: number;
  lastAutoSave?: Date;
  pendingChanges: boolean;
}
```

State of the auto-save system.

**Fields**:
- `enabled` - Whether auto-save is turned on
- `interval` - Milliseconds between auto-saves (default: 2000)
- `lastAutoSave` - When last auto-save occurred
- `pendingChanges` - Whether there are unsaved changes

**Auto-Save Behavior**:
1. User makes changes → `pendingChanges` becomes `true`
2. After `interval` milliseconds → auto-save triggered
3. Document saved → `lastAutoSave` updated, `pendingChanges` becomes `false`

**Example**:
```typescript
const autoSaveState: AutoSaveState = {
  enabled: true,
  interval: 2000, // 2 seconds
  lastAutoSave: new Date('2025-10-02T15:00:30'),
  pendingChanges: false
};
```

---

## Usage Examples

### Creating a New Document

```typescript
import { v4 as uuidv4 } from 'uuid';

const newDoc: Document = {
  id: uuidv4(),
  content: '',
  mode: 'markdown',
  fileName: 'untitled-1.md',
  isDirty: false,
  created: new Date(),
  modified: new Date()
};
```

### Saving a Document

```typescript
const saveOptions: SaveOptions = {
  createBackup: true,
  encoding: 'utf8'
};

try {
  const savedPath = await window.electronAPI.document.save(
    document.content,
    saveOptions
  );

  // Update document state
  document.filePath = savedPath;
  document.saved = new Date();
  document.isDirty = false;
} catch (error) {
  console.error('Save failed:', error);
}
```

### Opening a File

```typescript
const openOptions: OpenOptions = {
  encoding: 'utf8'
  // mode will be auto-detected from extension
};

try {
  const filePath = await window.electronAPI.dialog.showOpenDialog({
    filters: [
      { name: 'All Files', extensions: ['*'] },
      { name: 'Markdown', extensions: ['md', 'markdown'] },
      { name: 'Text', extensions: ['txt'] }
    ]
  });

  const content = await window.electronAPI.document.read(filePath, openOptions);

  const doc: Document = {
    id: uuidv4(),
    content,
    mode: detectMode(filePath),
    language: detectLanguage(filePath),
    filePath,
    fileName: path.basename(filePath),
    isDirty: false,
    created: new Date(),
    modified: new Date(),
    saved: new Date()
  };
} catch (error) {
  console.error('Open failed:', error);
}
```

### Managing Recent Files

```typescript
function addToRecentFiles(document: Document): void {
  if (!document.filePath) return;

  const recentFile: RecentFile = {
    path: document.filePath,
    name: document.fileName,
    lastOpened: new Date(),
    mode: document.mode
  };

  // Add to beginning of list
  recentFiles.unshift(recentFile);

  // Keep only last 10
  if (recentFiles.length > 10) {
    recentFiles = recentFiles.slice(0, 10);
  }

  // Save to local storage
  localStorage.setItem('recentFiles', JSON.stringify(recentFiles));
}
```

### Auto-Save Implementation

```typescript
let autoSaveTimer: NodeJS.Timeout | null = null;

function setupAutoSave(state: AutoSaveState): void {
  if (!state.enabled) return;

  // Clear existing timer
  if (autoSaveTimer) {
    clearTimeout(autoSaveTimer);
  }

  // Set new timer
  autoSaveTimer = setTimeout(async () => {
    if (state.pendingChanges && document.filePath) {
      try {
        await window.electronAPI.document.save(document.content, {
          filePath: document.filePath
        });

        state.lastAutoSave = new Date();
        state.pendingChanges = false;
        document.saved = new Date();
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    }
  }, state.interval);
}

// Call when content changes
function onContentChange(): void {
  autoSaveState.pendingChanges = true;
  setupAutoSave(autoSaveState);
}
```

---

## Related Types

- **Editor Types** (`editor.ts`) - Editor state and configuration
- **Workspace Types** (`workspace.ts`) - Multi-document workspaces
- **Theme Types** (`theme.ts`) - Visual appearance settings
