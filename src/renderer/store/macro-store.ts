/**
 * Macro store - manages macro recording, playback, and library
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { Macro, MacroAction, MacroRecorderState } from '../types/macro';
import { createMacro, macroEngine, builtInMacros } from '../services/macro-engine';
import { useDocumentStore } from './document-store';

interface MacroState extends MacroRecorderState {
  // Macro library
  macros: Macro[];
  favoriteMacros: string[];
  recentMacros: string[];

  // Actions
  startRecording: (name: string) => void;
  stopRecording: () => Macro | null;
  pauseRecording: () => void;
  resumeRecording: () => void;
  cancelRecording: () => void;
  recordAction: (action: MacroAction) => void;

  // Macro management
  saveMacro: (macro: Macro) => void;
  deleteMacro: (macroId: string) => void;
  updateMacro: (macroId: string, updates: Partial<Macro>) => void;
  toggleFavorite: (macroId: string) => void;

  // Macro execution
  executeMacro: (macroId: string) => Promise<boolean>;

  // Library management
  getMacroById: (macroId: string) => Macro | undefined;
  getMacrosByCategory: (category: string) => Macro[];
  searchMacros: (query: string) => Macro[];
}

export const useMacroStore = create<MacroState>()(
  persist(
    immer((set, get) => ({
      // Initial state
      isRecording: false,
      isPaused: false,
      currentMacro: null,
      recordedActions: [],
      startTime: undefined,
      pauseTime: undefined,
      macros: [...builtInMacros],
      favoriteMacros: [],
      recentMacros: [],

      // Start recording
      startRecording: (name) => {
        set({
          isRecording: true,
          isPaused: false,
          currentMacro: createMacro(name, []),
          recordedActions: [],
          startTime: Date.now(),
        });
        console.log('[Macro] Started recording:', name);
      },

      // Stop recording
      stopRecording: () => {
        const state = get();
        if (!state.isRecording || !state.currentMacro) {
          return null;
        }

        const macro: Macro = {
          ...state.currentMacro,
          actions: state.recordedActions,
          modified: new Date(),
        };

        set({
          isRecording: false,
          isPaused: false,
          currentMacro: null,
          recordedActions: [],
          startTime: undefined,
          pauseTime: undefined,
        });

        // Auto-save the macro
        get().saveMacro(macro);

        console.log('[Macro] Stopped recording:', macro.name, `(${macro.actions.length} actions)`);
        return macro;
      },

      // Pause recording
      pauseRecording: () => {
        if (get().isRecording && !get().isPaused) {
          set({
            isPaused: true,
            pauseTime: Date.now(),
          });
          console.log('[Macro] Paused recording');
        }
      },

      // Resume recording
      resumeRecording: () => {
        if (get().isRecording && get().isPaused) {
          set({
            isPaused: false,
            pauseTime: undefined,
          });
          console.log('[Macro] Resumed recording');
        }
      },

      // Cancel recording
      cancelRecording: () => {
        set({
          isRecording: false,
          isPaused: false,
          currentMacro: null,
          recordedActions: [],
          startTime: undefined,
          pauseTime: undefined,
        });
        console.log('[Macro] Cancelled recording');
      },

      // Record an action
      recordAction: (action) => {
        const state = get();
        if (!state.isRecording || state.isPaused) {
          return;
        }

        set((draft) => {
          draft.recordedActions.push({
            ...action,
            timestamp: Date.now() - (state.startTime || 0),
          });
        });

        console.log('[Macro] Recorded action:', action.type);
      },

      // Save macro
      saveMacro: (macro) => {
        set((draft) => {
          const existingIndex = draft.macros.findIndex((m) => m.id === macro.id);
          if (existingIndex >= 0) {
            draft.macros[existingIndex] = macro;
          } else {
            draft.macros.push(macro);
          }

          // Add to recent macros
          draft.recentMacros = [
            macro.id,
            ...draft.recentMacros.filter((id) => id !== macro.id),
          ].slice(0, 10);
        });
        console.log('[Macro] Saved macro:', macro.name);
      },

      // Delete macro
      deleteMacro: (macroId) => {
        set((draft) => {
          draft.macros = draft.macros.filter((m) => m.id !== macroId);
          draft.favoriteMacros = draft.favoriteMacros.filter((id) => id !== macroId);
          draft.recentMacros = draft.recentMacros.filter((id) => id !== macroId);
        });
        console.log('[Macro] Deleted macro:', macroId);
      },

      // Update macro
      updateMacro: (macroId, updates) => {
        set((draft) => {
          const macro = draft.macros.find((m) => m.id === macroId);
          if (macro) {
            Object.assign(macro, updates, { modified: new Date() });
          }
        });
        console.log('[Macro] Updated macro:', macroId);
      },

      // Toggle favorite
      toggleFavorite: (macroId) => {
        set((draft) => {
          if (draft.favoriteMacros.includes(macroId)) {
            draft.favoriteMacros = draft.favoriteMacros.filter((id) => id !== macroId);
          } else {
            draft.favoriteMacros.push(macroId);
          }
        });
      },

      // Execute macro
      executeMacro: async (macroId) => {
        const macro = get().getMacroById(macroId);
        if (!macro) {
          console.error('[Macro] Macro not found:', macroId);
          return false;
        }

        console.log('[Macro] Executing macro:', macro.name);

        // Get current document context
        const documentStore = useDocumentStore.getState();
        const context = {
          editorMode: documentStore.mode,
          content: documentStore.content,
          cursorPosition: documentStore.cursorPosition || undefined,
          selection: documentStore.selection || undefined,
        };

        try {
          const result = await macroEngine.executeMacro(macro, context);

          if (result.success && result.newContent) {
            // Update document content
            documentStore.setContent(result.newContent);

            // Update cursor position if changed
            if (result.newCursorPosition) {
              documentStore.setCursorPosition(result.newCursorPosition);
            }

            // Add to recent macros
            set((draft) => {
              draft.recentMacros = [
                macroId,
                ...draft.recentMacros.filter((id) => id !== macroId),
              ].slice(0, 10);
            });

            console.log('[Macro] Execution successful');
            if (result.warnings) {
              console.warn('[Macro] Warnings:', result.warnings);
            }
            return true;
          } else {
            console.error('[Macro] Execution failed:', result.errors);
            return false;
          }
        } catch (error) {
          console.error('[Macro] Execution error:', error);
          return false;
        }
      },

      // Get macro by ID
      getMacroById: (macroId) => {
        return get().macros.find((m) => m.id === macroId);
      },

      // Get macros by category
      getMacrosByCategory: (category) => {
        return get().macros.filter((m) => m.category === category);
      },

      // Search macros
      searchMacros: (query) => {
        const lowerQuery = query.toLowerCase();
        return get().macros.filter(
          (m) =>
            m.name.toLowerCase().includes(lowerQuery) ||
            m.description?.toLowerCase().includes(lowerQuery) ||
            m.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery))
        );
      },
    })),
    {
      name: 'finton-macros',
      partialize: (state) => ({
        macros: state.macros.filter((m) => !m.isBuiltIn), // Don't persist built-in macros
        favoriteMacros: state.favoriteMacros,
        recentMacros: state.recentMacros,
      }),
    }
  )
);
