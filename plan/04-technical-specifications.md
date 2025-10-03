# FintonText - Technical Specifications

## Editor Mode Specifications

### 1. Rich Text Mode

#### Features
- Bold, italic, underline, strikethrough
- Headings (H1-H6)
- Ordered and unordered lists
- Block quotes
- Code blocks with syntax highlighting
- Inline code
- Links with preview
- Images with drag-and-drop
- Tables with cell editing
- Horizontal rules
- Text alignment (left, center, right, justify)
- Font family, size, and color selection
- Background color/highlighting
- Subscript and superscript

#### Implementation
- **Editor**: Slate.js with custom plugins
- **Toolbar**: Floating toolbar + fixed toolbar
- **Serialization**: Custom JSON format
- **Image Storage**: Base64 embedded or file references
- **Undo Levels**: 100 operations

#### Performance Targets
- Initial render: <100ms
- Typing latency: <16ms (60fps)
- Large document (5000 lines): <200ms render

### 2. Markdown Mode

#### Features
- Full GFM (GitHub Flavored Markdown) support
- Syntax highlighting for markdown elements
- Live preview (optional split pane)
- Table editing with grid view
- Task lists with checkboxes
- Emoji support (:emoji:)
- Math equations (LaTeX via KaTeX)
- Mermaid diagrams
- Front matter (YAML)
- Footnotes

#### Implementation
- **Editor**: Monaco Editor with markdown language
- **Parser**: Unified/Remark ecosystem
- **Preview**: React component with remark-react
- **Syntax Highlighting**: Prism.js for code blocks
- **Math**: KaTeX renderer
- **Diagrams**: Mermaid.js

#### Performance Targets
- Preview update latency: <50ms
- Large markdown (10,000 lines): <300ms parse

### 3. Code Mode

#### Features
- 50+ language support
- Syntax highlighting
- Intelligent code completion
- Bracket matching and auto-closing
- Multi-cursor editing
- Code folding
- Minimap
- Git diff indicators
- Linting (configurable)
- Format on save (Prettier/ESLint)
- Regex-based find/replace

#### Implementation
- **Editor**: Monaco Editor (VS Code's editor)
- **Language Support**: Built-in Monaco languages
- **Completion**: Monaco's IntelliSense
- **Formatting**: Prettier integration
- **Linting**: ESLint integration (JavaScript/TypeScript)

#### Performance Targets
- Typing latency: <16ms
- Large file (50,000 lines): <500ms initial render
- Completion suggestions: <100ms

## Conversion Specifications

### Rich Text → Markdown
```
Bold/Italic/Underline → **bold** / *italic* / <u>underline</u>
Headings → # Heading 1, ## Heading 2, etc.
Lists → - item or 1. item
Links → [text](url)
Images → ![alt](src)
Tables → GFM table syntax
Code blocks → ```language\ncode\n```
```

**Loss**: Font colors, custom font sizes, exact spacing

### Markdown → Rich Text
```
**bold** → Bold
*italic* → Italic
# Heading → H1 with default styling
[link](url) → Clickable link
![img](src) → Embedded image
Tables → Rich text table
```

**Loss**: Raw HTML, some custom markdown extensions

### Rich Text → Code
```
All formatting stripped
HTML representation of rich text content
Converted to HTML source code
```

### Code → Rich Text
```
Plain text import
Detected language → Code block in rich text
Syntax highlighted if in code block
```

### Markdown → Code
```
Raw markdown source
No processing
Suitable for editing markdown files directly
```

### Code → Markdown
```
If content is markdown → Parse and render
If not markdown → Treat as code block
```

## Macro Specifications

### Macro Action Types
```typescript
type MacroAction =
  | TextInsertAction
  | TextDeleteAction
  | CursorMoveAction
  | SelectionAction
  | FormatAction
  | CommandAction
  | DelayAction
  | ConditionalAction;

interface TextInsertAction {
  type: 'insert';
  text: string;
  position?: CursorPosition;
}

interface FormatAction {
  type: 'format';
  format: 'bold' | 'italic' | 'heading' | /* ... */;
  range?: Range;
}

interface CommandAction {
  type: 'command';
  command: string;
  args?: any[];
}
```

### Macro Storage Format
```json
{
  "id": "uuid",
  "name": "Format as Code Block",
  "description": "Wraps selection in markdown code block",
  "version": "1.0",
  "created": "2025-10-02T10:00:00Z",
  "actions": [
    {
      "type": "insert",
      "text": "```javascript\n"
    },
    {
      "type": "command",
      "command": "paste"
    },
    {
      "type": "insert",
      "text": "\n```"
    }
  ],
  "shortcuts": ["Cmd+Shift+C"],
  "tags": ["markdown", "code"]
}
```

### Macro Features
- **Recording**: Captures keystrokes, mouse clicks, commands
- **Editing**: JSON editor with schema validation
- **Variables**: User input prompts, clipboard content
- **Conditionals**: If/else based on selection, mode, content
- **Loops**: Repeat actions N times or until condition
- **Playback Speed**: 0.5x, 1x, 2x, 5x, instant
- **Breakpoints**: Pause during playback for inspection

### Macro Limits
- Max actions per macro: 10,000
- Max execution time: 60 seconds
- Max recursion depth: 10

## Theme Specifications

### Theme Schema
```typescript
interface Theme {
  id: string;
  name: string;
  type: 'light' | 'dark';
  colors: {
    // UI Colors
    background: string;
    foreground: string;
    primary: string;
    secondary: string;
    accent: string;
    border: string;
    hover: string;
    active: string;

    // Editor Colors
    editorBackground: string;
    editorForeground: string;
    lineNumber: string;
    selection: string;
    cursor: string;

    // Syntax Colors (for code mode)
    keyword: string;
    string: string;
    comment: string;
    function: string;
    variable: string;
    type: string;
    number: string;
    operator: string;

    // Semantic Colors
    error: string;
    warning: string;
    info: string;
    success: string;
  };
  fonts: {
    ui: string;
    editor: string;
    monospace: string;
  };
  fontSizes: {
    ui: string;
    editor: string;
  };
  spacing: {
    unit: string; // e.g., "8px"
  };
  borderRadius: string;
  shadows: {
    small: string;
    medium: string;
    large: string;
  };
}
```

### Built-in Themes
1. **Light**: Clean white background, dark text
2. **Dark**: Dark background, light text
3. **High Contrast**: Maximum contrast for accessibility
4. **Solarized Light**: Solarized light color palette
5. **Solarized Dark**: Solarized dark color palette
6. **Nord**: Nordic-inspired theme
7. **Dracula**: Popular dark theme
8. **Monokai**: Classic code editor theme

### Font Requirements
- **UI Font**: System default or custom sans-serif
- **Editor Font**: Monospace for code, configurable for rich text
- **Supported Formats**: TTF, OTF, WOFF, WOFF2
- **Font Loading**: Async with fallbacks
- **Variable Fonts**: Support for weight/style variations

## Export Specifications

### PDF Export
- **Engine**: jsPDF
- **Features**:
  - Page size selection (A4, Letter, Legal, Custom)
  - Margins configuration
  - Headers/footers
  - Table of contents
  - Embedded fonts
  - Images
  - Hyperlinks
- **Quality**: 300 DPI for images
- **Size Limit**: 50MB per PDF

### HTML Export
- **Format**: Standalone HTML5
- **Features**:
  - Embedded CSS
  - Base64 images (optional)
  - External asset folder (optional)
  - Responsive design
  - Print stylesheet
- **Compatibility**: Modern browsers (Chrome, Firefox, Safari, Edge)

### Markdown Export
- **Flavor**: GitHub Flavored Markdown
- **Features**:
  - Clean formatting
  - Image references or embedded
  - Preserved frontmatter
  - Consistent line breaks
- **Compatibility**: Renders correctly on GitHub, GitLab, etc.

### DOCX Export
- **Engine**: docx.js
- **Features**:
  - Headings with styles
  - Bold, italic, underline
  - Lists
  - Tables
  - Images
  - Page breaks
- **Compatibility**: Microsoft Word 2016+, LibreOffice

### Plain Text Export
- **Encoding**: UTF-8
- **Line Endings**: Platform-specific or configurable
- **Features**:
  - Strip all formatting
  - Preserve structure with spacing
  - Optional markdown-style formatting

### JSON Export
- **Format**: Custom schema
- **Features**:
  - Complete document structure
  - Metadata
  - Version information
  - Theme information
- **Use Case**: Backup, interchange, debugging

## Performance Requirements

### Startup Performance
- **Cold start**: <3 seconds
- **Warm start**: <1 second
- **Memory footprint**: <150MB initially

### Runtime Performance
- **Editor typing latency**: <16ms (60fps)
- **Mode switching**: <100ms
- **Theme switching**: <50ms
- **File save**: <200ms for 1MB file
- **Search**: <500ms for 10,000 lines
- **Macro execution**: <2 seconds for 1,000 actions

### Resource Limits
- **Max file size**: 10MB (warning at 5MB)
- **Max concurrent files**: 20 tabs
- **Max undo history**: 100 operations per file
- **Max macros**: 1,000 stored macros
- **Max themes**: 100 custom themes

## Security Specifications

### Electron Security
- `nodeIntegration: false`
- `contextIsolation: true`
- `sandbox: true` for renderer
- CSP headers for HTML content
- IPC validation in main process

### File Operations
- Permission checks before file access
- Path traversal prevention
- File size validation
- Allowed file type filtering

### Macro Execution
- No arbitrary code execution
- Sandboxed action environment
- Resource limits (time, memory)
- User confirmation for destructive actions

### Data Privacy
- No telemetry without opt-in
- Local-only storage (no cloud by default)
- Encrypted storage option for sensitive docs
- Clear data deletion

## Accessibility Requirements

### WCAG 2.1 AA Compliance
- Keyboard navigation for all features
- Screen reader support (ARIA labels)
- Focus indicators
- Sufficient color contrast (4.5:1 minimum)
- Resizable text (up to 200%)
- No keyboard traps

### Keyboard Shortcuts
- All commands accessible via keyboard
- Customizable shortcuts
- Shortcut cheat sheet (Cmd/Ctrl + ?)
- No conflicts with OS shortcuts

### Visual Accessibility
- High contrast themes
- Adjustable font sizes
- Cursor customization
- Highlight current line
- Bracket pair colorization (code mode)

## Platform-Specific Considerations

### macOS
- Native menus
- Touch Bar support (optional)
- Quick Look integration
- Spotlight integration for recent files
- iCloud storage option

### Windows
- Windows 10/11 native styling
- Windows Defender SmartScreen signing
- Start menu integration
- Notification system integration

### Linux
- GTK/Qt theme integration
- .desktop file for app launcher
- AppImage, deb, rpm packages
- XDG base directory compliance
