/**
 * Theme system types
 */

export type ThemeType = 'light' | 'dark';

export interface ThemeColors {
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

  // Syntax Colors
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
}

export interface ThemeFonts {
  ui: string;
  editor: string;
  monospace: string;
}

export interface ThemeFontSizes {
  ui: string;
  editor: string;
}

export interface Theme {
  id: string;
  name: string;
  type: ThemeType;
  colors: ThemeColors;
  fonts: ThemeFonts;
  fontSizes: ThemeFontSizes;
  spacing: {
    unit: string;
  };
  borderRadius: string;
  shadows: {
    small: string;
    medium: string;
    large: string;
  };
}

export interface ThemeState {
  currentTheme: Theme;
  availableThemes: Theme[];
  customThemes: Theme[];
}
