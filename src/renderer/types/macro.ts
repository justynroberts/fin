/**
 * Macro system types
 */

import { EditorMode, CodeLanguage } from './editor';

/**
 * Macro action types
 */
export type MacroActionType =
  | 'insert'
  | 'delete'
  | 'replace'
  | 'format-bold'
  | 'format-italic'
  | 'format-underline'
  | 'format-code'
  | 'insert-link'
  | 'insert-heading'
  | 'insert-list'
  | 'switch-mode'
  | 'move-cursor'
  | 'select-text'
  | 'custom';

/**
 * A single action in a macro
 */
export interface MacroAction {
  type: MacroActionType;
  payload?: any;
  timestamp?: number;
}

/**
 * Insert text action
 */
export interface InsertAction extends MacroAction {
  type: 'insert';
  payload: {
    text: string;
    position?: {
      line: number;
      column: number;
    };
  };
}

/**
 * Delete text action
 */
export interface DeleteAction extends MacroAction {
  type: 'delete';
  payload: {
    count: number;
    direction: 'forward' | 'backward';
  };
}

/**
 * Replace text action
 */
export interface ReplaceAction extends MacroAction {
  type: 'replace';
  payload: {
    from: string;
    to: string;
    regex?: boolean;
    global?: boolean;
  };
}

/**
 * Format action
 */
export interface FormatAction extends MacroAction {
  type: 'format-bold' | 'format-italic' | 'format-underline' | 'format-code';
  payload?: {
    toggle?: boolean;
  };
}

/**
 * Insert link action
 */
export interface InsertLinkAction extends MacroAction {
  type: 'insert-link';
  payload: {
    text: string;
    url: string;
  };
}

/**
 * Insert heading action
 */
export interface InsertHeadingAction extends MacroAction {
  type: 'insert-heading';
  payload: {
    level: 1 | 2 | 3 | 4 | 5 | 6;
    text: string;
  };
}

/**
 * Switch mode action
 */
export interface SwitchModeAction extends MacroAction {
  type: 'switch-mode';
  payload: {
    mode: EditorMode;
    language?: CodeLanguage;
  };
}

/**
 * Complete macro definition
 */
export interface Macro {
  id: string;
  name: string;
  description?: string;
  actions: MacroAction[];
  created: Date;
  modified: Date;
  author?: string;
  tags?: string[];
  category?: string;
  keyBinding?: string;
  isBuiltIn?: boolean;
}

/**
 * Macro execution context
 */
export interface MacroContext {
  editorMode: EditorMode;
  content: string;
  cursorPosition?: {
    line: number;
    column: number;
  };
  selection?: {
    start: { line: number; column: number };
    end: { line: number; column: number };
  };
}

/**
 * Macro execution result
 */
export interface MacroExecutionResult {
  success: boolean;
  newContent?: string;
  newCursorPosition?: {
    line: number;
    column: number;
  };
  errors?: string[];
  warnings?: string[];
}

/**
 * Macro recorder state
 */
export interface MacroRecorderState {
  isRecording: boolean;
  isPaused: boolean;
  currentMacro: Macro | null;
  recordedActions: MacroAction[];
  startTime?: number;
  pauseTime?: number;
}

/**
 * Macro library
 */
export interface MacroLibrary {
  macros: Macro[];
  categories: string[];
  recentMacros: string[]; // IDs
  favoriteMacros: string[]; // IDs
}
