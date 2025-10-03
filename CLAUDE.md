# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FintonText is an Electron-based desktop text editor that seamlessly switches between three editing modes:
- **Rich Text**: WYSIWYG editing with formatting (using Slate.js)
- **Markdown**: Markdown editing with live preview
- **Code**: Syntax-highlighted code editing (using Monaco Editor)

Key features include a macro recording system, theming, and multi-format export (PDF, HTML, Markdown, DOCX, etc.).

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
- Separate stores for: documents, themes, macros, settings

**Editor Strategy**:
Each editor mode implements a common interface allowing seamless switching:
- Rich Text → `Slate.js` (full control over document model)
- Markdown → `Monaco Editor` with markdown language + preview
- Code → `Monaco Editor` (VS Code's editor)

**Conversion System**:
Content converter service handles mode transitions:
- Maintains a canonical internal format
- Converts to/from each editor's native format
- Preserves formatting where possible
- Documents conversion losses

### Directory Structure

```
src/
├── main/               # Electron main process
│   ├── index.ts       # Entry point, window management
│   └── (future: file-operations, menu-manager, ipc-handlers)
├── preload/
│   └── index.ts       # IPC bridge, context isolation
├── renderer/           # React application
│   ├── App.tsx        # Root component
│   ├── index.tsx      # React entry point
│   ├── components/    # UI components (toolbars, sidebars, dialogs)
│   ├── editors/       # Editor mode implementations
│   ├── services/      # Business logic (converter, exporter, macro-engine)
│   ├── store/         # Zustand stores
│   ├── types/         # TypeScript definitions
│   └── styles/        # CSS files
├── shared/            # Code shared between processes (future)
└── (future: tests integrated with implementation)
```

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
// Zustand store
import create from 'zustand';
import { immer } from 'zustand/middleware/immer';

interface DocumentState {
  content: string;
  mode: 'rich-text' | 'markdown' | 'code';
  setContent: (content: string) => void;
  switchMode: (mode: string) => void;
}

export const useDocumentStore = create<DocumentState>()(
  immer((set) => ({
    content: '',
    mode: 'rich-text',
    setContent: (content) => set({ content }),
    switchMode: (mode) => set({ mode }),
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
Each editor mode should:
1. Implement common `EditorMode` interface
2. Handle content serialization/deserialization
3. Support command execution for macros
4. Provide conversion to/from other modes
5. Emit events for macro recording

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

### Macro System
Macros are JSON arrays of actions:
```json
{
  "actions": [
    { "type": "insert", "text": "Hello" },
    { "type": "format", "format": "bold" }
  ]
}
```

## Project Roadmap

See `plan/03-deliverables.md` for the complete development roadmap. Current phase:

**Phase 2: Editor Core** - Implementing the three editor modes and mode switching system.

## Important Constraints

- **Security**: Never bypass Electron security (contextIsolation, etc.)
- **Performance**: Mode switching must be <100ms
- **Accessibility**: WCAG 2.1 AA compliance required
- **Testing**: All features must have tests before merge
- **Code Quality**: Maintain >80% test coverage

## Key Dependencies

- **Electron 28+**: Desktop framework
- **React 18+**: UI library
- **TypeScript 5+**: Type safety
- **Vite**: Build tool and dev server
- **Zustand**: State management
- **Monaco Editor**: Code/markdown editing
- **Slate.js**: Rich text editing
- **Vitest**: Testing framework

## Debugging

### Renderer Process
- Development: DevTools auto-open
- Production: Cmd/Ctrl+Shift+I to toggle

### Main Process
- Use `--inspect` flag with electron
- Connect Chrome DevTools to Node process

### IPC Issues
- Check preload script is loaded
- Verify IPC channel names match
- Check handler exists in main process
- Validate arguments in both directions
