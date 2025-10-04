/**
 * Macro Engine Service
 *
 * Handles macro recording, playback, and execution
 */

import {
  Macro,
  MacroAction,
  MacroContext,
  MacroExecutionResult,
  InsertAction,
  DeleteAction,
  ReplaceAction,
  FormatAction,
  InsertLinkAction,
  InsertHeadingAction,
  SwitchModeAction,
} from '../types/macro';
import { v4 as uuidv4 } from 'uuid';

/**
 * Macro Engine - executes macro actions
 */
export class MacroEngine {
  /**
   * Execute a complete macro
   */
  async executeMacro(
    macro: Macro,
    context: MacroContext
  ): Promise<MacroExecutionResult> {
    let content = context.content;
    let cursorPosition = context.cursorPosition;
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      for (const action of macro.actions) {
        const result = await this.executeAction(action, {
          ...context,
          content,
          cursorPosition,
        });

        if (!result.success) {
          errors.push(...(result.errors || []));
          if (errors.length > 0) {
            // Stop execution on first error
            return {
              success: false,
              errors,
              warnings,
            };
          }
        }

        // Update context with results
        if (result.newContent !== undefined) {
          content = result.newContent;
        }
        if (result.newCursorPosition) {
          cursorPosition = result.newCursorPosition;
        }
        if (result.warnings) {
          warnings.push(...result.warnings);
        }
      }

      return {
        success: true,
        newContent: content,
        newCursorPosition: cursorPosition,
        warnings: warnings.length > 0 ? warnings : undefined,
      };
    } catch (error) {
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  /**
   * Execute a single macro action
   */
  private async executeAction(
    action: MacroAction,
    context: MacroContext
  ): Promise<MacroExecutionResult> {
    switch (action.type) {
      case 'insert':
        return this.executeInsert(action as InsertAction, context);
      case 'delete':
        return this.executeDelete(action as DeleteAction, context);
      case 'replace':
        return this.executeReplace(action as ReplaceAction, context);
      case 'format-bold':
      case 'format-italic':
      case 'format-underline':
      case 'format-code':
        return this.executeFormat(action as FormatAction, context);
      case 'insert-link':
        return this.executeInsertLink(action as InsertLinkAction, context);
      case 'insert-heading':
        return this.executeInsertHeading(action as InsertHeadingAction, context);
      case 'switch-mode':
        return this.executeSwitchMode(action as SwitchModeAction, context);
      default:
        return {
          success: false,
          errors: [`Unknown action type: ${action.type}`],
        };
    }
  }

  /**
   * Execute insert action
   */
  private executeInsert(
    action: InsertAction,
    context: MacroContext
  ): MacroExecutionResult {
    const { text, position } = action.payload;
    let content = context.content;
    let cursorPos = position || context.cursorPosition || { line: 0, column: 0 };

    // Convert line/column to string index
    const lines = content.split('\n');
    let index = 0;
    for (let i = 0; i < cursorPos.line && i < lines.length; i++) {
      index += lines[i].length + 1; // +1 for newline
    }
    index += Math.min(cursorPos.column, lines[cursorPos.line]?.length || 0);

    // Insert text
    const newContent = content.slice(0, index) + text + content.slice(index);

    // Calculate new cursor position
    const newCursorPosition = {
      line: cursorPos.line,
      column: cursorPos.column + text.length,
    };

    return {
      success: true,
      newContent,
      newCursorPosition,
    };
  }

  /**
   * Execute delete action
   */
  private executeDelete(
    action: DeleteAction,
    context: MacroContext
  ): MacroExecutionResult {
    const { count, direction } = action.payload;
    let content = context.content;
    const cursorPos = context.cursorPosition || { line: 0, column: 0 };

    // Convert line/column to string index
    const lines = content.split('\n');
    let index = 0;
    for (let i = 0; i < cursorPos.line && i < lines.length; i++) {
      index += lines[i].length + 1;
    }
    index += Math.min(cursorPos.column, lines[cursorPos.line]?.length || 0);

    let newContent: string;
    let newCursorPosition = cursorPos;

    if (direction === 'backward') {
      // Delete before cursor
      const start = Math.max(0, index - count);
      newContent = content.slice(0, start) + content.slice(index);
      newCursorPosition = {
        line: cursorPos.line,
        column: Math.max(0, cursorPos.column - count),
      };
    } else {
      // Delete after cursor
      newContent = content.slice(0, index) + content.slice(index + count);
    }

    return {
      success: true,
      newContent,
      newCursorPosition,
    };
  }

  /**
   * Execute replace action
   */
  private executeReplace(
    action: ReplaceAction,
    context: MacroContext
  ): MacroExecutionResult {
    const { from, to, regex, global } = action.payload;
    let content = context.content;

    try {
      if (regex) {
        const flags = global ? 'g' : '';
        const pattern = new RegExp(from, flags);
        content = content.replace(pattern, to);
      } else {
        if (global) {
          content = content.split(from).join(to);
        } else {
          content = content.replace(from, to);
        }
      }

      return {
        success: true,
        newContent: content,
      };
    } catch (error) {
      return {
        success: false,
        errors: [`Replace failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
      };
    }
  }

  /**
   * Execute format action
   */
  private executeFormat(
    action: FormatAction,
    context: MacroContext
  ): MacroExecutionResult {
    let content = context.content;
    const selection = context.selection;

    if (!selection) {
      return {
        success: false,
        warnings: ['No text selected for formatting'],
      };
    }

    // Get selected text
    const lines = content.split('\n');
    const startLine = selection.start.line;
    const endLine = selection.end.line;
    const startCol = selection.start.column;
    const endCol = selection.end.column;

    let selectedText = '';
    if (startLine === endLine) {
      selectedText = lines[startLine].substring(startCol, endCol);
    } else {
      // Multi-line selection
      selectedText = lines[startLine].substring(startCol) + '\n';
      for (let i = startLine + 1; i < endLine; i++) {
        selectedText += lines[i] + '\n';
      }
      selectedText += lines[endLine].substring(0, endCol);
    }

    // Apply formatting based on mode
    let formattedText = selectedText;

    if (context.editorMode === 'markdown') {
      switch (action.type) {
        case 'format-bold':
          formattedText = `**${selectedText}**`;
          break;
        case 'format-italic':
          formattedText = `*${selectedText}*`;
          break;
        case 'format-code':
          formattedText = `\`${selectedText}\``;
          break;
      }
    } else if (context.editorMode === 'notes') {
      switch (action.type) {
        case 'format-bold':
          formattedText = `<strong>${selectedText}</strong>`;
          break;
        case 'format-italic':
          formattedText = `<em>${selectedText}</em>`;
          break;
        case 'format-underline':
          formattedText = `<u>${selectedText}</u>`;
          break;
        case 'format-code':
          formattedText = `<code>${selectedText}</code>`;
          break;
      }
    }

    // Replace selected text with formatted text
    // This is simplified - in real implementation would need proper text replacement
    const newContent = content.replace(selectedText, formattedText);

    return {
      success: true,
      newContent,
    };
  }

  /**
   * Execute insert link action
   */
  private executeInsertLink(
    action: InsertLinkAction,
    context: MacroContext
  ): MacroExecutionResult {
    const { text, url } = action.payload;
    let linkText = '';

    if (context.editorMode === 'markdown') {
      linkText = `[${text}](${url})`;
    } else if (context.editorMode === 'notes') {
      linkText = `<a href="${url}">${text}</a>`;
    } else {
      linkText = `${text} (${url})`;
    }

    return this.executeInsert(
      {
        type: 'insert',
        payload: { text: linkText },
      } as InsertAction,
      context
    );
  }

  /**
   * Execute insert heading action
   */
  private executeInsertHeading(
    action: InsertHeadingAction,
    context: MacroContext
  ): MacroExecutionResult {
    const { level, text } = action.payload;
    let headingText = '';

    if (context.editorMode === 'markdown') {
      headingText = `${'#'.repeat(level)} ${text}\n\n`;
    } else if (context.editorMode === 'notes') {
      headingText = `<h${level}>${text}</h${level}>`;
    } else {
      headingText = `${text}\n${'='.repeat(text.length)}\n\n`;
    }

    return this.executeInsert(
      {
        type: 'insert',
        payload: { text: headingText },
      } as InsertAction,
      context
    );
  }

  /**
   * Execute switch mode action
   */
  private executeSwitchMode(
    action: SwitchModeAction,
    context: MacroContext
  ): MacroExecutionResult {
    // Mode switching is handled at the store level
    return {
      success: true,
      warnings: ['Mode switching should be handled by the document store'],
    };
  }
}

/**
 * Create a macro from a list of actions
 */
export function createMacro(
  name: string,
  actions: MacroAction[],
  options?: {
    description?: string;
    tags?: string[];
    category?: string;
    keyBinding?: string;
  }
): Macro {
  return {
    id: uuidv4(),
    name,
    description: options?.description,
    actions,
    created: new Date(),
    modified: new Date(),
    tags: options?.tags,
    category: options?.category,
    keyBinding: options?.keyBinding,
    isBuiltIn: false,
  };
}

/**
 * Built-in macros
 */
export const builtInMacros: Macro[] = [
  {
    id: 'insert-date',
    name: 'Insert Current Date',
    description: 'Insert the current date at cursor position',
    actions: [
      {
        type: 'insert',
        payload: {
          text: new Date().toLocaleDateString(),
        },
      },
    ],
    created: new Date(),
    modified: new Date(),
    category: 'Utilities',
    keyBinding: 'Ctrl+Shift+D',
    isBuiltIn: true,
  },
  {
    id: 'insert-timestamp',
    name: 'Insert Timestamp',
    description: 'Insert the current date and time',
    actions: [
      {
        type: 'insert',
        payload: {
          text: new Date().toLocaleString(),
        },
      },
    ],
    created: new Date(),
    modified: new Date(),
    category: 'Utilities',
    keyBinding: 'Ctrl+Shift+T',
    isBuiltIn: true,
  },
  {
    id: 'wrap-code-block',
    name: 'Wrap in Code Block',
    description: 'Wrap selected text in a markdown code block',
    actions: [
      {
        type: 'insert',
        payload: {
          text: '```\n',
        },
      },
      {
        type: 'insert',
        payload: {
          text: '\n```',
        },
      },
    ],
    created: new Date(),
    modified: new Date(),
    category: 'Formatting',
    keyBinding: 'Ctrl+Shift+C',
    isBuiltIn: true,
  },
];

/**
 * Singleton macro engine instance
 */
export const macroEngine = new MacroEngine();
