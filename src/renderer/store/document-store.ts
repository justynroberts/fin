/**
 * Document store - manages current document state and editing
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { EditorMode, CodeLanguage, CursorPosition, TextSelection } from '../types';

interface DocumentState {
  // Document info
  path: string | null;
  title: string;
  content: string;
  mode: EditorMode;
  language: CodeLanguage;
  tags: string[];

  // Editor state
  isActive: boolean;
  isDirty: boolean;
  isSaving: boolean;
  lastSaved: Date | null;
  cursorPosition: CursorPosition | null;
  selection: TextSelection | null;

  // Auto-save
  autoSaveEnabled: boolean;
  autoSaveInterval: number;

  // Undo/Redo
  history: string[];
  historyIndex: number;
  canUndo: boolean;
  canRedo: boolean;

  // Actions
  newDocument: (mode?: EditorMode, title?: string, language?: CodeLanguage, templateContent?: string) => void;
  openDocument: (path: string) => Promise<void>;
  setContent: (content: string, skipHistory?: boolean) => void;
  setMode: (mode: EditorMode) => void;
  setLanguage: (language: CodeLanguage) => void;
  setTitle: (title: string) => void;
  setTags: (tags: string[]) => void;
  addTag: (tag: string) => void;
  removeTag: (tag: string) => void;
  setCursorPosition: (position: CursorPosition | null) => void;
  setSelection: (selection: TextSelection | null) => void;
  saveDocument: () => Promise<void>;
  saveAs: (newPath: string) => Promise<void>;
  closeDocument: () => void;
  setAutoSave: (enabled: boolean) => void;
  undo: () => void;
  redo: () => void;
}

export const useDocumentStore = create<DocumentState>()(
  immer((set, get) => ({
    // Initial state
    path: null,
    title: 'Untitled',
    content: '',
    mode: 'markdown',
    language: 'plaintext',
    tags: [],
    isActive: false,
    isDirty: false,
    isSaving: false,
    lastSaved: null,
    cursorPosition: null,
    selection: null,
    autoSaveEnabled: true,
    autoSaveInterval: 30000, // 30 seconds
    history: [''],
    historyIndex: 0,
    canUndo: false,
    canRedo: false,

    // New document
    newDocument: (mode = 'markdown', title?: string, language?: CodeLanguage, templateContent?: string) => {
      console.log('[DocumentStore] newDocument called with:', JSON.stringify({
        mode,
        title,
        language,
        templateContentLength: templateContent?.length || 0,
        hasTemplate: !!templateContent,
        templateContentPreview: templateContent ? templateContent.substring(0, 50) : 'NO TEMPLATE'
      }, null, 2));
      const content = templateContent || '';
      set({
        path: null,
        title: title || 'Untitled',
        content,
        mode,
        language: language || (mode === 'code' ? 'javascript' : 'plaintext'),
        tags: [],
        isActive: true,
        isDirty: templateContent ? true : false, // Mark dirty if using template
        lastSaved: null,
        cursorPosition: null,
        selection: null,
        history: [content],
        historyIndex: 0,
        canUndo: false,
        canRedo: false,
      });
      console.log('[DocumentStore] Document created with content length:', content.length);
      console.log('[DocumentStore] Content preview (first 50 chars):', content.substring(0, 50));
    },

    // Open document
    openDocument: async (path: string) => {
      try {
        const content = await window.electronAPI.document.read(path);
        const docs = await window.electronAPI.document.list();
        const docMeta = docs.find((d) => d.path === path);

        if (docMeta) {
          set({
            path,
            title: docMeta.title,
            content,
            mode: docMeta.mode,
            language: (docMeta.language as CodeLanguage) || 'plaintext',
            tags: docMeta.tags,
            isActive: true,
            isDirty: false,
            lastSaved: new Date(docMeta.modified),
          });
        } else {
          // Fallback if metadata not found
          set({
            path,
            title: path.split('/').pop() || 'Untitled',
            content,
            mode: 'markdown',
            language: 'plaintext',
            tags: [],
            isActive: true,
            isDirty: false,
            lastSaved: new Date(),
          });
        }
      } catch (error) {
        console.error('Failed to open document:', error);
      }
    },

    // Set content
    setContent: (content, skipHistory = false) => {
      const state = get();

      if (!skipHistory && content !== state.content) {
        // Add to history
        const newHistory = state.history.slice(0, state.historyIndex + 1);
        newHistory.push(content);

        // Limit history to 100 items
        const limitedHistory = newHistory.length > 100 ? newHistory.slice(-100) : newHistory;

        set({
          content,
          isDirty: true,
          history: limitedHistory,
          historyIndex: limitedHistory.length - 1,
          canUndo: limitedHistory.length > 1,
          canRedo: false,
        });
      } else {
        set({ content, isDirty: true });
      }
    },

    // Set mode (no conversion - modes are independent)
    setMode: (mode) => {
      set({ mode, isDirty: true });
    },

    // Set language
    setLanguage: (language) => {
      set({ language, isDirty: true });
    },

    // Set title
    setTitle: (title) => {
      set({ title, isDirty: true });
    },

    // Set tags
    setTags: (tags) => {
      set({ tags, isDirty: true });
    },

    // Add tag
    addTag: (tag) => {
      const { tags } = get();
      if (!tags.includes(tag)) {
        set({ tags: [...tags, tag], isDirty: true });
      }
    },

    // Remove tag
    removeTag: (tag) => {
      set((state) => {
        state.tags = state.tags.filter((t) => t !== tag);
        state.isDirty = true;
      });
    },

    // Set cursor position
    setCursorPosition: (position) => {
      set({ cursorPosition: position });
    },

    // Set selection
    setSelection: (selection) => {
      set({ selection });
    },

    // Save document
    saveDocument: async () => {
      const state = get();

      if (!state.isDirty && state.path) {
        return; // Nothing to save
      }

      set({ isSaving: true });

      try {
        // Generate path if new document
        const docPath = state.path || `documents/${state.title.replace(/\s+/g, '-').toLowerCase()}.${
          state.mode === 'notes' ? 'html' :
          state.mode === 'markdown' ? 'md' :
          'txt'
        }`;

        await window.electronAPI.document.write(
          docPath,
          state.content,
          {
            title: state.title,
            mode: state.mode,
            tags: state.tags,
            language: state.language,
          }
        );

        set({
          path: docPath,
          isDirty: false,
          isSaving: false,
          lastSaved: new Date(),
        });
      } catch (error) {
        console.error('[Document] Save failed:', error);
        set({ isSaving: false });
        throw error; // Re-throw so EditorContainer can catch it
      }
    },

    // Save as
    saveAs: async (newPath: string) => {
      const state = get();
      set({ isSaving: true });

      try {
        await window.electronAPI.document.write(
          newPath,
          state.content,
          {
            title: state.title,
            mode: state.mode,
            tags: state.tags,
            language: state.language,
          }
        );

        set({
          path: newPath,
          isDirty: false,
          isSaving: false,
          lastSaved: new Date(),
        });
      } catch (error) {
        console.error('Failed to save document:', error);
        set({ isSaving: false });
      }
    },

    // Close document
    closeDocument: () => {
      set({
        path: null,
        title: 'Untitled',
        content: '',
        mode: 'markdown',
        language: 'plaintext',
        tags: [],
        isActive: false,
        isDirty: false,
        lastSaved: null,
        cursorPosition: null,
        selection: null,
      });
    },

    // Set auto-save
    setAutoSave: (enabled) => {
      set({ autoSaveEnabled: enabled });
    },

    // Undo
    undo: () => {
      const state = get();
      if (state.historyIndex > 0) {
        const newIndex = state.historyIndex - 1;
        set({
          content: state.history[newIndex],
          historyIndex: newIndex,
          canUndo: newIndex > 0,
          canRedo: true,
          isDirty: true,
        });
      }
    },

    // Redo
    redo: () => {
      const state = get();
      if (state.historyIndex < state.history.length - 1) {
        const newIndex = state.historyIndex + 1;
        set({
          content: state.history[newIndex],
          historyIndex: newIndex,
          canUndo: true,
          canRedo: newIndex < state.history.length - 1,
          isDirty: true,
        });
      }
    },
  }))
);
