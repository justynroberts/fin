/**
 * Editor mode types and interfaces
 */

export type EditorMode = 'notes' | 'markdown' | 'code';

export type CodeLanguage =
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

export interface EditorState {
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

export interface CursorPosition {
  line: number;
  column: number;
}

export interface TextSelection {
  start: CursorPosition;
  end: CursorPosition;
}

export interface EditorCommand {
  type: string;
  payload?: any;
}

export interface EditorConfig {
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

/**
 * Rich Text specific types
 */
export interface RichTextNode {
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

export interface RichTextDocument {
  type: 'document';
  children: RichTextNode[];
  version: number;
}

/**
 * Conversion types
 */
export interface ConversionResult {
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

export interface ConverterOptions {
  preserveFormatting?: boolean;
  strictMode?: boolean;
  htmlSafe?: boolean;
}

/**
 * Editor mode interface - all editors must implement this
 */
export interface IEditor {
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

/**
 * Document metadata
 */
export interface DocumentMetadata {
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
