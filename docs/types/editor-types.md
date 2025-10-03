# Editor Types Documentation

**File**: `src/renderer/types/editor.ts`

## Overview

The editor types define the core data structures for the three editing modes (Rich Text, Markdown, Code), editor configuration, content conversion, and the common editor interface.

---

## Core Types

### `EditorMode`

```typescript
type EditorMode = 'rich-text' | 'markdown' | 'code';
```

Defines the three editing modes available in FintonText.

**Values**:
- `'rich-text'` - WYSIWYG editor with formatting toolbar
- `'markdown'` - Markdown editor with live preview
- `'code'` - Syntax-highlighted code editor

---

### `CodeLanguage`

```typescript
type CodeLanguage =
  | 'javascript'
  | 'typescript'
  | 'python'
  | 'java'
  | 'cpp'
  | 'csharp'
  | 'go'
  | 'rust'
  | 'ruby'
  | 'php'
  | 'html'
  | 'css'
  | 'json'
  | 'yaml'
  | 'xml'
  | 'sql'
  | 'shell'
  | 'plaintext';
```

Supported programming languages for syntax highlighting in code mode.

**Usage**: Set when `mode` is `'code'` to enable language-specific features like IntelliSense and syntax highlighting.

---

## Editor State

### `EditorState`

```typescript
interface EditorState {
  mode: EditorMode;
  content: string;
  language?: CodeLanguage;
  isDirty: boolean;
  filePath?: string;
  fileName?: string;
  lastSaved?: Date;
  cursorPosition?: CursorPosition;
  selection?: TextSelection;
}
```

The complete state of the editor at any given time.

**Fields**:
- `mode` - Current editing mode
- `content` - Document content as string
- `language` - Programming language (code mode only)
- `isDirty` - Has unsaved changes
- `filePath` - Full path to file on disk (if saved)
- `fileName` - Display name of the file
- `lastSaved` - Timestamp of last save operation
- `cursorPosition` - Current cursor location
- `selection` - Currently selected text range

---

### `CursorPosition`

```typescript
interface CursorPosition {
  line: number;
  column: number;
}
```

Represents a position in the document.

**Fields**:
- `line` - Line number (0-indexed)
- `column` - Column/character position (0-indexed)

---

### `TextSelection`

```typescript
interface TextSelection {
  start: CursorPosition;
  end: CursorPosition;
}
```

Represents a range of selected text.

**Fields**:
- `start` - Beginning of selection
- `end` - End of selection

---

## Editor Configuration

### `EditorConfig`

```typescript
interface EditorConfig {
  fontSize: number;
  fontFamily: string;
  lineHeight: number;
  tabSize: number;
  wordWrap: boolean;
  lineNumbers: boolean;
  minimap: boolean;
  autoSave: boolean;
  autoSaveDelay: number;
}
```

User-configurable editor settings.

**Fields**:
- `fontSize` - Editor font size in pixels (default: 14)
- `fontFamily` - Font family name (default: 'Monaco', 'Consolas', etc.)
- `lineHeight` - Line height multiplier (default: 1.5)
- `tabSize` - Number of spaces per tab (default: 4)
- `wordWrap` - Enable word wrapping (default: true)
- `lineNumbers` - Show line numbers (default: true)
- `minimap` - Show minimap overview (code mode, default: true)
- `autoSave` - Enable auto-save (default: true)
- `autoSaveDelay` - Milliseconds delay for auto-save (default: 2000)

---

## Commands

### `EditorCommand`

```typescript
interface EditorCommand {
  type: string;
  payload?: any;
}
```

Represents an action to execute in the editor (for macro recording).

**Fields**:
- `type` - Command identifier (e.g., 'bold', 'insert', 'delete')
- `payload` - Optional command parameters

**Example**:
```typescript
const boldCommand: EditorCommand = {
  type: 'format-bold',
  payload: { toggle: true }
};
```

---

## Rich Text Types

### `RichTextNode`

```typescript
interface RichTextNode {
  type: string;
  children?: RichTextNode[];
  text?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  code?: boolean;
  url?: string;
}
```

A node in the rich text document tree (Slate.js-compatible).

**Fields**:
- `type` - Node type (e.g., 'paragraph', 'heading', 'list')
- `children` - Nested nodes (for container nodes)
- `text` - Text content (for text nodes)
- `bold`, `italic`, `underline`, `strikethrough` - Text formatting
- `code` - Inline code formatting
- `url` - Link URL (for link nodes)

---

### `RichTextDocument`

```typescript
interface RichTextDocument {
  type: 'document';
  children: RichTextNode[];
  version: number;
}
```

The root document structure for rich text mode.

**Fields**:
- `type` - Always `'document'`
- `children` - Top-level nodes (paragraphs, headings, etc.)
- `version` - Document format version

---

## Content Conversion

### `ConversionResult`

```typescript
interface ConversionResult {
  success: boolean;
  content: string;
  warnings?: string[];
  errors?: string[];
  metadata?: {
    originalMode: EditorMode;
    targetMode: EditorMode;
    lossless: boolean;
  };
}
```

Result of converting content between editor modes.

**Fields**:
- `success` - Whether conversion completed
- `content` - Converted content string
- `warnings` - Non-fatal conversion issues
- `errors` - Fatal conversion errors
- `metadata` - Conversion information
  - `originalMode` - Source editor mode
  - `targetMode` - Destination editor mode
  - `lossless` - Whether conversion preserved all formatting

**Example**:
```typescript
const result: ConversionResult = {
  success: true,
  content: '# Heading\n\nParagraph text',
  warnings: ['Complex tables simplified'],
  metadata: {
    originalMode: 'rich-text',
    targetMode: 'markdown',
    lossless: false
  }
};
```

---

### `ConverterOptions`

```typescript
interface ConverterOptions {
  preserveFormatting?: boolean;
  strictMode?: boolean;
  htmlSafe?: boolean;
}
```

Options for content conversion.

**Fields**:
- `preserveFormatting` - Try to preserve all formatting (may fail)
- `strictMode` - Fail on any conversion issues (vs. best-effort)
- `htmlSafe` - Escape HTML entities in output

---

## Editor Interface

### `IEditor`

```typescript
interface IEditor {
  getContent(): string;
  setContent(content: string): void;
  getSelection(): TextSelection | null;
  insertText(text: string, position?: CursorPosition): void;
  executeCommand(command: EditorCommand): void;
  focus(): void;
  blur(): void;
  undo(): void;
  redo(): void;
}
```

Common interface that all editor implementations must provide.

**Methods**:
- `getContent()` - Returns current document content as string
- `setContent(content)` - Replaces all content
- `getSelection()` - Returns current selection or null
- `insertText(text, position?)` - Inserts text at position or cursor
- `executeCommand(command)` - Executes an editor command
- `focus()` - Gives focus to the editor
- `blur()` - Removes focus from the editor
- `undo()` - Undoes last change
- `redo()` - Redoes last undone change

**Implementation**: All three editor components (CodeEditor, MarkdownEditor, RichTextEditor) implement this interface.

---

## Document Metadata

### `DocumentMetadata`

```typescript
interface DocumentMetadata {
  id: string;
  title: string;
  created: Date;
  modified: Date;
  wordCount: number;
  charCount: number;
  lineCount: number;
  mode: EditorMode;
  language?: CodeLanguage;
  tags?: string[];
}
```

Statistical and descriptive information about a document.

**Fields**:
- `id` - Unique document identifier (UUID)
- `title` - Display title
- `created` - Creation timestamp
- `modified` - Last modification timestamp
- `wordCount` - Number of words (for text/markdown)
- `charCount` - Total character count
- `lineCount` - Number of lines
- `mode` - Current/default editor mode
- `language` - Programming language (code mode)
- `tags` - User-assigned tags for organization

**Usage**: Displayed in workspace sidebar, used for search indexing, shown in status bar.

---

## Usage Examples

### Creating an Editor State

```typescript
const initialState: EditorState = {
  mode: 'markdown',
  content: '# My Document\n\nHello world!',
  isDirty: false,
  fileName: 'document.md',
  cursorPosition: { line: 0, column: 0 }
};
```

### Configuring the Editor

```typescript
const config: EditorConfig = {
  fontSize: 16,
  fontFamily: 'Fira Code',
  lineHeight: 1.6,
  tabSize: 2,
  wordWrap: true,
  lineNumbers: true,
  minimap: false,
  autoSave: true,
  autoSaveDelay: 1000
};
```

### Converting Between Modes

```typescript
const result: ConversionResult = await convertContent(
  richTextContent,
  { from: 'rich-text', to: 'markdown' },
  { preserveFormatting: true, htmlSafe: true }
);

if (result.success) {
  editor.setContent(result.content);
  if (result.warnings?.length) {
    console.warn('Conversion warnings:', result.warnings);
  }
}
```

---

## Related Types

- **Document Types** (`document.ts`) - File operations and document persistence
- **Workspace Types** (`workspace.ts`) - Multi-document workspace management
- **Theme Types** (`theme.ts`) - Editor appearance customization
