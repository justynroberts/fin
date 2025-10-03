/**
 * Theme hook - automatically applies theme on mount
 */

import { useEffect } from 'react';
import { useThemeStore } from '../store/theme-store';

export function useTheme() {
  const { currentTheme, setTheme, applyTheme, editorFontSize, setEditorFontSize } = useThemeStore();

  // Apply theme on mount
  useEffect(() => {
    applyTheme();
  }, [applyTheme]);

  // Reapply theme when it changes
  useEffect(() => {
    applyTheme();
  }, [currentTheme, editorFontSize, applyTheme]);

  return {
    currentTheme,
    setTheme,
    applyTheme,
    editorFontSize,
    setEditorFontSize,
  };
}
