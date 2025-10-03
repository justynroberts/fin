# FintonText - Technical Architecture

## Technology Stack

### Core Framework
- **Electron**: v28+ for cross-platform desktop application
- **React**: v18+ for UI components
- **TypeScript**: v5+ for type safety
- **Vite**: For fast builds and HMR during development

### Editor Components
- **Monaco Editor**: For code mode (VS Code's editor)
- **Slate.js**: For rich text editing with full control
- **Unified/Remark**: For markdown parsing and rendering
- **CodeMirror 6**: Alternative code editor (evaluation phase)

### State Management
- **Zustand**: Lightweight state management
- **Immer**: Immutable state updates
- **IndexedDB**: Local storage for documents and macros

### Styling & Theming
- **CSS Modules**: Scoped component styling
- **CSS Custom Properties**: Dynamic theming
- **Tailwind CSS**: Utility classes for rapid UI development

### Export & Conversion
- **jsPDF**: PDF generation
- **marked**: Markdown to HTML conversion
- **turndown**: HTML to Markdown conversion
- **mammoth**: DOCX generation
- **html2canvas**: Screenshot capabilities

### Testing
- **Vitest**: Unit and integration testing
- **React Testing Library**: Component testing
- **Playwright**: End-to-end testing
- **Electron Testing Library**: Electron-specific testing

### Build & Deployment
- **Electron Builder**: Packaging for macOS, Windows, Linux
- **Docker**: Containerized build environment
- **GitHub Actions**: CI/CD pipeline

## Architecture Layers

### 1. Main Process (Electron)
```
main/
├── index.ts                 # Entry point
├── window-manager.ts        # Window lifecycle
├── menu-manager.ts          # Application menus
├── file-operations.ts       # File system operations
├── ipc-handlers.ts          # IPC communication
└── updater.ts              # Auto-update logic
```

### 2. Renderer Process (React App)
```
renderer/
├── App.tsx                  # Root component
├── store/                   # State management
│   ├── document-store.ts
│   ├── theme-store.ts
│   ├── macro-store.ts
│   └── settings-store.ts
├── components/
│   ├── Editor/             # Editor components
│   ├── Toolbar/            # Toolbars and controls
│   ├── Sidebar/            # File tree, macro panel
│   └── StatusBar/          # Status information
├── editors/
│   ├── RichTextEditor.tsx  # Slate-based rich text
│   ├── MarkdownEditor.tsx  # Markdown mode
│   └── CodeEditor.tsx      # Monaco-based code
├── services/
│   ├── converter.ts        # Mode conversion logic
│   ├── exporter.ts         # Export functionality
│   ├── macro-engine.ts     # Macro execution
│   └── theme-engine.ts     # Theme application
└── types/                  # TypeScript definitions
```

### 3. Data Layer
```
- IndexedDB for persistent storage
- File system for document storage
- JSON for configuration and themes
- SQLite for macro and snippet storage (future)
```

## Data Flow Architecture

### Document Lifecycle
```
User Input → Editor Component → Document Store → Conversion Engine → Other Modes
                                      ↓
                                 IndexedDB
                                      ↓
                              File System (Save)
```

### Macro System Flow
```
User Actions → Event Capture → Macro Recorder → Macro Store → IndexedDB
                                                      ↓
Playback Trigger → Macro Engine → Event Replay → Editor Updates
```

### Theme System Flow
```
Theme Selection → Theme Store → CSS Variable Injection → Live Update
                                      ↓
                              Local Storage
```

## Key Design Patterns

### 1. Command Pattern
All editor actions (bold, italic, insert, delete) are implemented as commands that can be:
- Executed directly
- Recorded in macros
- Undone/redone
- Serialized for storage

### 2. Strategy Pattern
Editor modes (rich text, markdown, code) implement a common interface:
```typescript
interface EditorMode {
  render(): ReactElement;
  getContent(): string;
  setContent(content: string): void;
  convert(toMode: EditorType): ConvertedContent;
  executeCommand(command: EditorCommand): void;
}
```

### 3. Observer Pattern
Document changes notify:
- Auto-save system
- Undo/redo stack
- Live preview (for markdown)
- Macro recorder (when active)

### 4. Factory Pattern
Theme creation, macro instantiation, and export format generation use factories for extensibility.

## Security Considerations

1. **Sandboxing**: Renderer process runs with `contextIsolation: true`
2. **IPC Validation**: All IPC messages validated in main process
3. **File Access**: Controlled through main process with permission checks
4. **Macro Execution**: Sandboxed with resource limits
5. **External Content**: CSP headers prevent XSS in rich text mode

## Performance Optimization

1. **Virtual Scrolling**: Large documents rendered incrementally
2. **Debounced Auto-save**: Save operations batched and debounced
3. **Lazy Loading**: Editor modes loaded on-demand
4. **Web Workers**: Heavy parsing/conversion in background threads
5. **Code Splitting**: Bundle split by feature for faster initial load

## Extensibility Points

1. **Plugin System**: Future support for custom editor modes
2. **Theme API**: JSON-based theme format for community themes
3. **Macro Scripts**: JavaScript-based macro extension
4. **Export Formats**: Pluggable export handlers
5. **Keybinding System**: Customizable keyboard shortcuts
