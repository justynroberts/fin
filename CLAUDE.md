# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Finton is an Electron-based desktop text editor that seamlessly switches between three editing modes:
- **Notes**: WYSIWYG editing with visual formatting (using Slate.js)
- **Markdown**: Markdown editing with live preview
- **Code**: Syntax-highlighted code editing with execution support (using Monaco Editor)

Key features include:
- AI assistant integration (Anthropic Claude, OpenAI, OpenRouter)
- Template system for reusable document structures
- Git-based version control and workspace sync
- Frontmatter-based metadata (portable across machines)
- Full-text search with SQLite FTS5
- Code execution in editor
- Macro recording system
- Multi-format export (PDF, HTML, Markdown, DOCX, etc.)

## Development Commands

### Essential Commands
```bash
# Development with hot reload
npm run dev

# Run tests
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage

# Type checking
npm run type-check

# Linting
npm run lint
npm run lint:fix

# Formatting
npm run format
npm run format:check
```

### Building
```bash
# Build all
npm run build

# Build specific parts
npm run build:renderer    # React app
npm run build:main        # Electron main process
npm run build:preload     # Preload scripts

# Package for distribution
npm run package           # All platforms
npm run package:mac       # macOS only
npm run package:win       # Windows only
npm run package:linux     # Linux only
```

## Architecture

### Process Model
FintonText follows Electron's multi-process architecture:

1. **Main Process** (`src/main/`): Node.js process managing windows and system operations
2. **Renderer Process** (`src/renderer/`): React application running in the browser context
3. **Preload Scripts** (`src/preload/`): Bridge between main and renderer with contextIsolation

### Key Architectural Decisions

**Security-First**:
- `contextIsolation: true` - Renderer and preload have separate JavaScript contexts
- `nodeIntegration: false` - No Node.js in renderer
- `sandbox: true` - Renderer runs in OS-level sandbox
- IPC communication via `contextBridge` only

**State Management**:
- **Zustand** for global state (lightweight, minimal boilerplate)
- **Immer** for immutable updates
- Separate stores for: documents, workspace, themes, macros

**Editor Strategy**:
Each editor mode is independent (no conversion between modes):
- Notes → `Slate.js` (full control over document model)
- Markdown → `Monaco Editor` with markdown language + live preview
- Code → `Monaco Editor` (VS Code's editor) with execution capability

**Document Storage**:
- Documents stored as plain files in workspace directory
- Metadata stored as YAML frontmatter in each document
- SQLite FTS5 database for full-text search indexing (`.finton/index.db`, not Git-tracked)
- Git for version control and cross-machine sync
- Metadata file (`.finton-metadata.json`) tracked in Git for portability

**AI Integration**:
- Multi-provider support (Anthropic, OpenAI, OpenRouter, Ollama)
- Ollama support for local LLMs (no API key required, default URL: http://127.0.0.1:11434)
- Conversation memory per document (optional)
- Mode-aware prompting (different strategies for notes/markdown/code)
- Works with unsaved documents
- Insert or replace modes for content generation
- Configurable via Settings dialog

### Directory Structure

```
src/
├── main/                    # Electron main process
│   ├── index.ts            # Entry point, window management
│   ├── ipc-handlers.ts     # IPC communication handlers
│   ├── workspace-service.ts # Document management, search (SQLite FTS5)
│   ├── git-service.ts      # Git operations wrapper
│   ├── ai-service.ts       # AI provider integration
│   ├── code-execution-service.ts # Code execution engine
│   ├── settings-service.ts # Application settings
│   ├── rss-service.ts      # RSS feed fetching and parsing
│   └── frontmatter-utils.ts # YAML frontmatter parsing
├── preload/
│   └── index.ts            # IPC bridge, context isolation
├── renderer/                # React application
│   ├── App.tsx             # Root component
│   ├── index.tsx           # React entry point
│   ├── components/         # UI components
│   │   ├── Dashboard.tsx
│   │   ├── EditorContainer.tsx
│   │   ├── WorkspaceSidebar.tsx
│   │   ├── AIPromptDialog.tsx
│   │   ├── NewDocumentDialog.tsx
│   │   ├── Settings.tsx
│   │   ├── ExportDialog.tsx
│   │   ├── SaveDialog.tsx
│   │   ├── TemplateManager.tsx
│   │   └── RSSFeed.tsx
│   ├── editors/            # Editor mode implementations
│   │   ├── RichTextEditor.tsx  # Slate-based notes editor
│   │   ├── MarkdownEditor.tsx  # Monaco + preview
│   │   └── CodeEditor.tsx      # Monaco with execution
│   ├── services/
│   │   ├── macro-engine.ts # Macro recording/playback
│   │   └── content-converter.ts # Mode conversion utilities
│   ├── store/              # Zustand stores
│   │   ├── document-store.ts
│   │   ├── workspace-store.ts
│   │   ├── theme-store.ts
│   │   └── macro-store.ts
│   ├── hooks/              # Custom React hooks
│   ├── types/              # TypeScript definitions
│   ├── themes/             # Theme definitions
│   └── styles/             # Global CSS styles
└── tests/                   # Test suites
    ├── unit/
    └── setup.ts
```

### Path Aliases
Vite is configured with the following aliases:
- `@/` → `./src/`
- `@renderer/` → `./src/renderer/`
- `@main/` → `./src/main/`
- `@shared/` → `./src/shared/`

### Testing Strategy

**Test Pyramid**:
- **Unit tests** (60%): Pure functions, utilities, stores
- **Component tests** (30%): React components with React Testing Library
- **E2E tests** (10%): Critical user flows with Playwright

**Location**: Tests in `tests/` directory, organized by type:
- `tests/unit/` - Unit tests
- `tests/integration/` - Integration tests
- `tests/e2e/` - End-to-end tests

**Testing Tools**:
- Vitest (unit/integration)
- React Testing Library (components)
- @testing-library/user-event (user interactions)
- happy-dom (lightweight DOM)

**Coverage Target**: >80% for critical paths

## Development Guidelines

### Code Style
- **TypeScript**: Strict mode enabled
- **ESLint**: Enforced with recommended rules
- **Prettier**: Auto-format on save
- **React**: Functional components with hooks

### Type Safety
- All new code must be TypeScript
- Avoid `any` - use `unknown` and type guards
- Define interfaces for all data structures
- Use discriminated unions for variants

### Component Patterns
```typescript
// Functional component with types
interface Props {
  content: string;
  onChange: (content: string) => void;
}

const Editor: React.FC<Props> = ({ content, onChange }) => {
  // Implementation
};
```

### State Management Pattern
```typescript
// Zustand store with Immer
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

interface DocumentState {
  content: string;
  mode: 'notes' | 'markdown' | 'code';
  title: string;
  tags: string[];
  setContent: (content: string) => void;
  setMode: (mode: EditorMode) => void;
  addTag: (tag: string) => void;
}

export const useDocumentStore = create<DocumentState>()(
  immer((set, get) => ({
    content: '',
    mode: 'markdown',
    title: 'Untitled',
    tags: [],
    setContent: (content) => set({ content, isDirty: true }),
    setMode: (mode) => set({ mode }),
    addTag: (tag) => {
      const { tags } = get();
      if (!tags.includes(tag)) {
        set({ tags: [...tags, tag] });
      }
    },
  }))
);
```

### IPC Communication Pattern
```typescript
// Preload (exposeInMainWorld)
contextBridge.exposeInMainWorld('electronAPI', {
  saveFile: (content, path) => ipcRenderer.invoke('save-file', content, path)
});

// Main (handler)
ipcMain.handle('save-file', async (event, content, path) => {
  // Validate, then save
  return savedPath;
});

// Renderer (usage)
const saved = await window.electronAPI.saveFile(content, path);
```

## Keyboard Shortcuts

The application supports the following keyboard shortcuts:
- `Cmd/Ctrl + N` - New document
- `Cmd/Ctrl + S` - Save document
- `Cmd/Ctrl + Shift + N` - New document dialog (with templates)
- `Cmd/Ctrl + Z` - Undo
- `Cmd/Ctrl + Shift + Z` - Redo
- `Cmd/Ctrl + \` - Toggle Zen mode
- `ESC` - Exit Zen mode

## Feature Implementation Workflow

When implementing a new feature:

1. **Plan**: Review relevant plan docs in `plan/` directory
2. **Types**: Define TypeScript interfaces first
3. **Tests**: Write tests for core logic (TDD where appropriate)
4. **Implementation**: Build feature incrementally
5. **UI**: Add React components with accessibility
6. **Integration**: Wire up IPC if needed
7. **Documentation**: Update relevant docs
8. **Testing**: Ensure >80% coverage

## Common Patterns

### Editor Mode Implementation
Each editor mode component:
1. Receives `content` and `onChange` props
2. Manages its own editor instance (Slate or Monaco)
3. Handles keyboard shortcuts and commands
4. Supports macro recording via macro store
5. No conversion between modes (each mode stores content independently)

### Frontmatter Pattern
Documents use YAML frontmatter for metadata:
```markdown
---
title: "My Document"
mode: notes
tags: ["work", "important"]
language: javascript
---

Document content starts here...
```

### Template System
Templates are stored in `.fintontext/templates/` with frontmatter:
```typescript
// Save template
await window.electronAPI.template.save('template-name', content, metadata);

// List templates (filtered by mode)
const templates = await window.electronAPI.template.list('notes');

// Load template
const content = await window.electronAPI.template.load('template-name');
```

### Search Pattern
Full-text search uses SQLite FTS5:
```typescript
// Search across all documents
const results = await window.electronAPI.workspace.search('query');

// Search by tag
const docs = await window.electronAPI.workspace.getDocumentsByTag('work');
```

### AI Assistant Pattern
```typescript
// Send prompt to AI
const response = await window.electronAPI.ai.sendPrompt(
  documentPath,
  currentContent,
  userPrompt,
  mode,
  language
);

// Clear conversation memory
await window.electronAPI.ai.clearMemory(documentPath);
```

### Theme Application
Themes use CSS custom properties:
```css
:root {
  --color-bg: #ffffff;
  --color-fg: #24292f;
  /* ... */
}
```
Theme switching replaces all CSS variables in real-time.

### RSS Feed Pattern
Dashboard includes RSS feed integration:
```typescript
// Feeds configured in settings
const feeds = await window.electronAPI.settings.getRSSFeeds();

// Fetch feed items
const items = await window.electronAPI.rss.fetchFeed(feed);

// Auto-refresh with configurable interval
```

### Export Pattern
Multiple export formats supported:
```typescript
// Export document to PDF/HTML/DOCX/Markdown
await window.electronAPI.export.document(content, format, outputPath);
```

## Project Status

**Current Version**: 1.0.7

See `plan/03-deliverables.md` for the complete development roadmap.

**Completed Features**:
- Three editor modes (Notes, Markdown, Code)
- AI assistant with multi-provider support (Anthropic, OpenAI, OpenRouter, Ollama)
- Template system
- Git-based workspace management
- Frontmatter metadata system
- Full-text search (SQLite FTS5)
- Code execution
- Theme system
- Tag-based organization
- RSS feed integration on dashboard
- Task list with drag-and-drop reordering
- Zen mode (Cmd/Ctrl+\ or ESC to toggle)
- Export functionality (PDF, HTML, Markdown, DOCX)

## Important Constraints

- **Security**: Never bypass Electron security (contextIsolation, etc.)
- **Mode Independence**: Editor modes are independent - no conversion between modes
- **Workspace Structure**: Documents must be in `documents/` directory within workspace
- **Frontmatter Required**: All documents must have YAML frontmatter for metadata
- **Git Integration**: WorkspaceService automatically manages Git commits
- **Testing**: All features should have tests
- **Code Quality**: Maintain >80% test coverage for critical paths

## Key Dependencies

- **Electron 28**: Desktop framework
- **React 18**: UI library
- **TypeScript 5**: Type safety
- **Vite**: Build tool and dev server
- **Zustand**: State management (with Immer middleware)
- **Monaco Editor**: Code/markdown editing
- **Slate.js**: Notes (rich text) editing
- **Better-SQLite3**: Full-text search database
- **simple-git**: Git operations
- **marked**: Markdown rendering
- **mermaid**: Diagram rendering in markdown
- **jsPDF**: PDF export
- **Vitest**: Testing framework

## Workspace Architecture

### Workspace Structure
```
workspace-directory/
├── .git/                          # Git repository
├── .gitignore                     # Ignores .finton/index.db
├── .finton/
│   ├── config.json               # Workspace configuration
│   ├── index.db                  # SQLite FTS5 search index (local)
│   └── templates/                # Saved templates
│       ├── template1.md
│       └── template2.html
├── .finton-metadata.json         # Document metadata (synced via Git)
├── documents/                     # User documents
│   ├── doc1.md
│   ├── doc2.html
│   └── script.js
└── README.md                      # Workspace description
```

### Data Flow: Opening a Workspace
1. User selects workspace directory
2. `WorkspaceService.init()` initializes Git and SQLite
3. Reads `.finton-metadata.json` for document metadata
4. Indexes all documents for full-text search
5. Renderer displays dashboard with document list

### Data Flow: Saving a Document
1. User saves document in editor
2. Content written to file with frontmatter
3. `WorkspaceService.addDocument()` updates metadata
4. Document indexed in SQLite for search
5. Git automatically commits: metadata + document file

## Installation & Distribution

### macOS Code Signing
The app is **not code signed**. Users must remove the quarantine flag after installation:
```bash
xattr -cr /Applications/FinText.app
```
If macOS still blocks the app, right-click and select "Open", then click "Open" in the dialog.

### Build Icon Generation
Icons are generated from `release-icon.svg`:
```bash
npm run generate-icons
```
This creates platform-specific icons in the `build/` directory (icon.icns, icon.ico, icon.png).

### Better-SQLite3 Native Module
The app uses `better-sqlite3` which requires native compilation. The `electron-builder` configuration includes:
```json
"extraResources": [
  {
    "from": "node_modules/better-sqlite3/build/Release",
    "to": "better-sqlite3"
  }
]
```
If you encounter SQLite errors, rebuild native modules:
```bash
npm run electron-rebuild
```

## Debugging

### Renderer Process
- Development: DevTools auto-open
- Production: Cmd/Ctrl+Shift+I to toggle
- Console logs prefixed with component name: `[Dashboard]`, `[EditorContainer]`

### Main Process
- Use `--inspect` flag with electron
- Connect Chrome DevTools to Node process
- Logs prefixed with service name: `[Git]`, `[Workspace]`, `[AI]`
- **Important**: Console logging wrapped in try-catch to prevent EPIPE errors

### IPC Issues
- Check preload script is loaded
- Verify IPC channel names match in `preload/index.ts` and `main/ipc-handlers.ts`
- Check handler exists in main process
- Validate arguments in both directions
- Use `console.log` in preload to debug bridging

### Database Issues
- SQLite database at `.finton/index.db`
- Use `sqlite3` CLI to inspect: `sqlite3 .finton/index.db`
- FTS5 queries use MATCH syntax: `SELECT * FROM documents_fts WHERE documents_fts MATCH 'query'`

### Ollama Connection Issues
- Ollama uses IPv4 (127.0.0.1) not IPv6 (::1)
- Default base URL: `http://127.0.0.1:11434`
- Verify Ollama is running: `curl http://127.0.0.1:11434/api/tags`
