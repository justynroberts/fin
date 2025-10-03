/**
 * Theme store - manages theme state and application
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Theme } from '../types';
import { themes, defaultTheme } from '../themes';

interface ThemeState {
  currentTheme: Theme;
  availableThemes: Theme[];
  editorFontSize: number;
  editorLineHeight: number;

  setTheme: (themeId: string) => void;
  setEditorFontSize: (size: number) => void;
  setEditorLineHeight: (height: number) => void;
  applyTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      currentTheme: defaultTheme,
      availableThemes: themes,
      editorFontSize: 14,
      editorLineHeight: 1.6,

      setTheme: (themeId) => {
        const theme = get().availableThemes.find((t) => t.id === themeId);
        if (theme) {
          set({ currentTheme: theme });
          get().applyTheme();
        }
      },

      setEditorFontSize: (size) => {
        set({ editorFontSize: size });
        get().applyTheme();
      },

      setEditorLineHeight: (height) => {
        set({ editorLineHeight: height });
        get().applyTheme();
      },

      applyTheme: () => {
        const { currentTheme, editorFontSize, editorLineHeight } = get();
        const root = document.documentElement;

        // Apply colors - comprehensive mapping
        Object.entries(currentTheme.colors).forEach(([key, value]) => {
          root.style.setProperty(
            `--color-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`,
            value
          );
        });

        // Apply fonts
        root.style.setProperty('--font-ui', currentTheme.fonts.ui);
        root.style.setProperty('--font-editor', currentTheme.fonts.editor);
        root.style.setProperty('--font-mono', currentTheme.fonts.monospace);

        // Apply font sizes
        root.style.setProperty('--font-size-ui', currentTheme.fontSizes.ui);
        root.style.setProperty('--font-size-editor', `${editorFontSize}px`);
        root.style.setProperty('--line-height-editor', editorLineHeight.toString());

        // Apply spacing with calculated values
        const unit = parseInt(currentTheme.spacing.unit);
        root.style.setProperty('--space-unit', currentTheme.spacing.unit);
        root.style.setProperty('--space-xs', `${unit * 0.5}px`);
        root.style.setProperty('--space-sm', `${unit}px`);
        root.style.setProperty('--space-md', `${unit * 1.5}px`);
        root.style.setProperty('--space-lg', `${unit * 2}px`);
        root.style.setProperty('--space-xl', `${unit * 3}px`);

        // Apply border radius
        root.style.setProperty('--radius', currentTheme.borderRadius);

        // Apply shadows
        root.style.setProperty('--shadow-sm', currentTheme.shadows.small);
        root.style.setProperty('--shadow-md', currentTheme.shadows.medium);
        root.style.setProperty('--shadow-lg', currentTheme.shadows.large);

        // Apply theme type to body for conditional styling
        document.body.setAttribute('data-theme', currentTheme.type);
      },
    }),
    {
      name: 'fintontext-theme',
      partialize: (state) => ({
        currentTheme: state.currentTheme,
        editorFontSize: state.editorFontSize,
        editorLineHeight: state.editorLineHeight,
      }),
    }
  )
);
