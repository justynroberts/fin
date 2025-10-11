/**
 * Built-in Themes for Finton
 *
 * Includes professional themes inspired by popular editors
 */

import { Theme } from '../types/theme';

/**
 * GitHub Light Theme
 * Professional light theme based on GitHub's color scheme
 */
export const githubLight: Theme = {
  id: 'github-light',
  name: 'GitHub Light',
  type: 'light',
  colors: {
    // UI Colors
    background: '#ffffff',
    foreground: '#24292f',
    primary: '#0969da',
    secondary: '#6e7781',
    accent: '#8250df',
    border: '#d0d7de',
    hover: '#f6f8fa',
    active: '#e8ecef',

    // Editor Colors
    editorBackground: '#ffffff',
    editorForeground: '#24292f',
    lineNumber: '#8c959f',
    selection: '#ddf4ff',
    cursor: '#24292f',

    // Syntax Colors
    keyword: '#cf222e',
    string: '#0a3069',
    comment: '#6e7781',
    function: '#6639ba',
    variable: '#953800',
    type: '#0969da',
    number: '#0550ae',
    operator: '#cf222e',

    // Semantic Colors
    error: '#d1242f',
    warning: '#9a6700',
    info: '#0969da',
    success: '#1a7f37',
  },
  fonts: {
    ui: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    editor: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    monospace: '"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace',
  },
  fontSizes: {
    ui: '14px',
    editor: '16px',
  },
  spacing: {
    unit: '8px',
  },
  borderRadius: '6px',
  shadows: {
    small: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.08)',
    medium: '0 3px 6px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.12)',
    large: '0 10px 20px rgba(0, 0, 0, 0.19), 0 6px 6px rgba(0, 0, 0, 0.16)',
  },
};

/**
 * GitHub Dark Theme
 * Professional dark theme based on GitHub's dark mode
 */
export const githubDark: Theme = {
  id: 'github-dark',
  name: 'GitHub Dark',
  type: 'dark',
  colors: {
    // UI Colors
    background: '#0d1117',
    foreground: '#e6edf3',
    primary: '#58a6ff',
    secondary: '#8b949e',
    accent: '#a371f7',
    border: '#30363d',
    hover: '#161b22',
    active: '#21262d',

    // Editor Colors
    editorBackground: '#0d1117',
    editorForeground: '#e6edf3',
    lineNumber: '#6e7681',
    selection: '#1f6feb',
    cursor: '#e6edf3',

    // Syntax Colors
    keyword: '#ff7b72',
    string: '#a5d6ff',
    comment: '#8b949e',
    function: '#d2a8ff',
    variable: '#ffa657',
    type: '#79c0ff',
    number: '#79c0ff',
    operator: '#ff7b72',

    // Semantic Colors
    error: '#f85149',
    warning: '#d29922',
    info: '#58a6ff',
    success: '#3fb950',
  },
  fonts: {
    ui: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    editor: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    monospace: '"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace',
  },
  fontSizes: {
    ui: '14px',
    editor: '16px',
  },
  spacing: {
    unit: '8px',
  },
  borderRadius: '6px',
  shadows: {
    small: '0 1px 3px rgba(0, 0, 0, 0.4), 0 1px 2px rgba(0, 0, 0, 0.3)',
    medium: '0 3px 6px rgba(0, 0, 0, 0.5), 0 2px 4px rgba(0, 0, 0, 0.4)',
    large: '0 10px 20px rgba(0, 0, 0, 0.6), 0 6px 6px rgba(0, 0, 0, 0.5)',
  },
};

/**
 * VS Code Light Theme
 * Light theme inspired by Visual Studio Code
 */
export const vscodeLight: Theme = {
  id: 'vscode-light',
  name: 'VS Code Light',
  type: 'light',
  colors: {
    // UI Colors
    background: '#ffffff',
    foreground: '#3b3b3b',
    primary: '#0066bf',
    secondary: '#616161',
    accent: '#0066bf',
    border: '#e5e5e5',
    hover: '#f3f3f3',
    active: '#e8e8e8',

    // Editor Colors
    editorBackground: '#ffffff',
    editorForeground: '#3b3b3b',
    lineNumber: '#237893',
    selection: '#add6ff',
    cursor: '#3b3b3b',

    // Syntax Colors
    keyword: '#0000ff',
    string: '#a31515',
    comment: '#008000',
    function: '#795e26',
    variable: '#001080',
    type: '#267f99',
    number: '#098658',
    operator: '#000000',

    // Semantic Colors
    error: '#e51400',
    warning: '#bf8803',
    info: '#0066bf',
    success: '#008000',
  },
  fonts: {
    ui: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    editor: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    monospace: '"Consolas", "Courier New", monospace',
  },
  fontSizes: {
    ui: '13px',
    editor: '14px',
  },
  spacing: {
    unit: '8px',
  },
  borderRadius: '3px',
  shadows: {
    small: '0 1px 3px rgba(0, 0, 0, 0.1)',
    medium: '0 2px 6px rgba(0, 0, 0, 0.15)',
    large: '0 4px 12px rgba(0, 0, 0, 0.2)',
  },
};

/**
 * VS Code Dark Theme
 * Dark theme inspired by Visual Studio Code
 */
export const vscodeDark: Theme = {
  id: 'vscode-dark',
  name: 'VS Code Dark',
  type: 'dark',
  colors: {
    // UI Colors
    background: '#1e1e1e',
    foreground: '#d4d4d4',
    primary: '#007acc',
    secondary: '#858585',
    accent: '#007acc',
    border: '#3e3e3e',
    hover: '#2a2d2e',
    active: '#37373d',

    // Editor Colors
    editorBackground: '#1e1e1e',
    editorForeground: '#d4d4d4',
    lineNumber: '#858585',
    selection: '#264f78',
    cursor: '#aeafad',

    // Syntax Colors
    keyword: '#569cd6',
    string: '#ce9178',
    comment: '#6a9955',
    function: '#dcdcaa',
    variable: '#9cdcfe',
    type: '#4ec9b0',
    number: '#b5cea8',
    operator: '#d4d4d4',

    // Semantic Colors
    error: '#f48771',
    warning: '#cca700',
    info: '#007acc',
    success: '#89d185',
  },
  fonts: {
    ui: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    editor: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    monospace: '"Consolas", "Courier New", monospace',
  },
  fontSizes: {
    ui: '13px',
    editor: '14px',
  },
  spacing: {
    unit: '8px',
  },
  borderRadius: '3px',
  shadows: {
    small: '0 1px 3px rgba(0, 0, 0, 0.5)',
    medium: '0 2px 6px rgba(0, 0, 0, 0.6)',
    large: '0 4px 12px rgba(0, 0, 0, 0.7)',
  },
};

/**
 * Solarized Light Theme
 * Based on the popular Solarized color scheme
 */
export const solarizedLight: Theme = {
  id: 'solarized-light',
  name: 'Solarized Light',
  type: 'light',
  colors: {
    // UI Colors
    background: '#fdf6e3',
    foreground: '#657b83',
    primary: '#268bd2',
    secondary: '#93a1a1',
    accent: '#d33682',
    border: '#eee8d5',
    hover: '#eee8d5',
    active: '#e8e2cf',

    // Editor Colors
    editorBackground: '#fdf6e3',
    editorForeground: '#657b83',
    lineNumber: '#93a1a1',
    selection: '#eee8d5',
    cursor: '#657b83',

    // Syntax Colors
    keyword: '#859900',
    string: '#2aa198',
    comment: '#93a1a1',
    function: '#268bd2',
    variable: '#b58900',
    type: '#cb4b16',
    number: '#2aa198',
    operator: '#859900',

    // Semantic Colors
    error: '#dc322f',
    warning: '#b58900',
    info: '#268bd2',
    success: '#859900',
  },
  fonts: {
    ui: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    editor: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    monospace: '"Menlo", "Monaco", "Courier New", monospace',
  },
  fontSizes: {
    ui: '14px',
    editor: '15px',
  },
  spacing: {
    unit: '8px',
  },
  borderRadius: '4px',
  shadows: {
    small: '0 1px 3px rgba(0, 0, 0, 0.08)',
    medium: '0 2px 6px rgba(0, 0, 0, 0.12)',
    large: '0 4px 12px rgba(0, 0, 0, 0.16)',
  },
};

/**
 * Solarized Dark Theme
 * Dark variant of Solarized
 */
export const solarizedDark: Theme = {
  id: 'solarized-dark',
  name: 'Solarized Dark',
  type: 'dark',
  colors: {
    // UI Colors
    background: '#002b36',
    foreground: '#839496',
    primary: '#268bd2',
    secondary: '#586e75',
    accent: '#d33682',
    border: '#073642',
    hover: '#073642',
    active: '#094350',

    // Editor Colors
    editorBackground: '#002b36',
    editorForeground: '#839496',
    lineNumber: '#586e75',
    selection: '#073642',
    cursor: '#839496',

    // Syntax Colors
    keyword: '#859900',
    string: '#2aa198',
    comment: '#586e75',
    function: '#268bd2',
    variable: '#b58900',
    type: '#cb4b16',
    number: '#2aa198',
    operator: '#859900',

    // Semantic Colors
    error: '#dc322f',
    warning: '#b58900',
    info: '#268bd2',
    success: '#859900',
  },
  fonts: {
    ui: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    editor: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    monospace: '"Menlo", "Monaco", "Courier New", monospace',
  },
  fontSizes: {
    ui: '14px',
    editor: '15px',
  },
  spacing: {
    unit: '8px',
  },
  borderRadius: '4px',
  shadows: {
    small: '0 1px 3px rgba(0, 0, 0, 0.3)',
    medium: '0 2px 6px rgba(0, 0, 0, 0.4)',
    large: '0 4px 12px rgba(0, 0, 0, 0.5)',
  },
};

/**
 * Dracula Theme
 * Popular dark theme with vibrant colors
 */
export const dracula: Theme = {
  id: 'dracula',
  name: 'Dracula',
  type: 'dark',
  colors: {
    // UI Colors
    background: '#282a36',
    foreground: '#f8f8f2',
    primary: '#bd93f9',
    secondary: '#6272a4',
    accent: '#ff79c6',
    border: '#44475a',
    hover: '#44475a',
    active: '#6272a4',

    // Editor Colors
    editorBackground: '#282a36',
    editorForeground: '#f8f8f2',
    lineNumber: '#6272a4',
    selection: '#44475a',
    cursor: '#f8f8f2',

    // Syntax Colors
    keyword: '#ff79c6',
    string: '#f1fa8c',
    comment: '#6272a4',
    function: '#50fa7b',
    variable: '#f8f8f2',
    type: '#8be9fd',
    number: '#bd93f9',
    operator: '#ff79c6',

    // Semantic Colors
    error: '#ff5555',
    warning: '#ffb86c',
    info: '#8be9fd',
    success: '#50fa7b',
  },
  fonts: {
    ui: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    editor: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    monospace: '"Fira Code", "JetBrains Mono", "Consolas", monospace',
  },
  fontSizes: {
    ui: '14px',
    editor: '15px',
  },
  spacing: {
    unit: '8px',
  },
  borderRadius: '6px',
  shadows: {
    small: '0 2px 4px rgba(0, 0, 0, 0.4)',
    medium: '0 4px 8px rgba(0, 0, 0, 0.5)',
    large: '0 8px 16px rgba(0, 0, 0, 0.6)',
  },
};

/**
 * Nord Theme
 * Arctic, north-bluish color palette
 */
export const nord: Theme = {
  id: 'nord',
  name: 'Nord',
  type: 'dark',
  colors: {
    // UI Colors
    background: '#2e3440',
    foreground: '#d8dee9',
    primary: '#88c0d0',
    secondary: '#4c566a',
    accent: '#81a1c1',
    border: '#3b4252',
    hover: '#3b4252',
    active: '#434c5e',

    // Editor Colors
    editorBackground: '#2e3440',
    editorForeground: '#d8dee9',
    lineNumber: '#4c566a',
    selection: '#434c5e',
    cursor: '#d8dee9',

    // Syntax Colors
    keyword: '#81a1c1',
    string: '#a3be8c',
    comment: '#616e88',
    function: '#88c0d0',
    variable: '#d8dee9',
    type: '#8fbcbb',
    number: '#b48ead',
    operator: '#81a1c1',

    // Semantic Colors
    error: '#bf616a',
    warning: '#ebcb8b',
    info: '#88c0d0',
    success: '#a3be8c',
  },
  fonts: {
    ui: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    editor: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    monospace: '"JetBrains Mono", "Fira Code", "Consolas", monospace',
  },
  fontSizes: {
    ui: '14px',
    editor: '15px',
  },
  spacing: {
    unit: '8px',
  },
  borderRadius: '4px',
  shadows: {
    small: '0 2px 4px rgba(0, 0, 0, 0.3)',
    medium: '0 4px 8px rgba(0, 0, 0, 0.4)',
    large: '0 8px 16px rgba(0, 0, 0, 0.5)',
  },
};

/**
 * Monokai Theme
 * Classic dark theme with warm colors
 */
export const monokai: Theme = {
  id: 'monokai',
  name: 'Monokai',
  type: 'dark',
  colors: {
    // UI Colors
    background: '#272822',
    foreground: '#f8f8f2',
    primary: '#66d9ef',
    secondary: '#75715e',
    accent: '#f92672',
    border: '#3e3d32',
    hover: '#3e3d32',
    active: '#49483e',

    // Editor Colors
    editorBackground: '#272822',
    editorForeground: '#f8f8f2',
    lineNumber: '#90908a',
    selection: '#49483e',
    cursor: '#f8f8f0',

    // Syntax Colors
    keyword: '#f92672',
    string: '#e6db74',
    comment: '#75715e',
    function: '#a6e22e',
    variable: '#f8f8f2',
    type: '#66d9ef',
    number: '#ae81ff',
    operator: '#f92672',

    // Semantic Colors
    error: '#f92672',
    warning: '#e6db74',
    info: '#66d9ef',
    success: '#a6e22e',
  },
  fonts: {
    ui: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    editor: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    monospace: '"Monaco", "Menlo", "Consolas", monospace',
  },
  fontSizes: {
    ui: '14px',
    editor: '14px',
  },
  spacing: {
    unit: '8px',
  },
  borderRadius: '3px',
  shadows: {
    small: '0 2px 4px rgba(0, 0, 0, 0.5)',
    medium: '0 4px 8px rgba(0, 0, 0, 0.6)',
    large: '0 8px 16px rgba(0, 0, 0, 0.7)',
  },
};

/**
 * One Dark Theme
 * Atom's iconic dark theme
 */
export const oneDark: Theme = {
  id: 'one-dark',
  name: 'One Dark',
  type: 'dark',
  colors: {
    // UI Colors
    background: '#282c34',
    foreground: '#abb2bf',
    primary: '#61afef',
    secondary: '#5c6370',
    accent: '#c678dd',
    border: '#3e4451',
    hover: '#2c313a',
    active: '#3e4451',

    // Editor Colors
    editorBackground: '#282c34',
    editorForeground: '#abb2bf',
    lineNumber: '#4b5263',
    selection: '#3e4451',
    cursor: '#528bff',

    // Syntax Colors
    keyword: '#c678dd',
    string: '#98c379',
    comment: '#5c6370',
    function: '#61afef',
    variable: '#e06c75',
    type: '#e5c07b',
    number: '#d19a66',
    operator: '#56b6c2',

    // Semantic Colors
    error: '#e06c75',
    warning: '#e5c07b',
    info: '#61afef',
    success: '#98c379',
  },
  fonts: {
    ui: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    editor: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    monospace: '"Fira Code", "Menlo", "Consolas", monospace',
  },
  fontSizes: {
    ui: '14px',
    editor: '14px',
  },
  spacing: {
    unit: '8px',
  },
  borderRadius: '4px',
  shadows: {
    small: '0 2px 4px rgba(0, 0, 0, 0.4)',
    medium: '0 4px 8px rgba(0, 0, 0, 0.5)',
    large: '0 8px 16px rgba(0, 0, 0, 0.6)',
  },
};

/**
 * Gruvbox Dark Theme
 * Retro groove color scheme
 */
export const gruvboxDark: Theme = {
  id: 'gruvbox-dark',
  name: 'Gruvbox Dark',
  type: 'dark',
  colors: {
    // UI Colors
    background: '#282828',
    foreground: '#ebdbb2',
    primary: '#83a598',
    secondary: '#928374',
    accent: '#d3869b',
    border: '#3c3836',
    hover: '#3c3836',
    active: '#504945',

    // Editor Colors
    editorBackground: '#282828',
    editorForeground: '#ebdbb2',
    lineNumber: '#7c6f64',
    selection: '#504945',
    cursor: '#ebdbb2',

    // Syntax Colors
    keyword: '#fb4934',
    string: '#b8bb26',
    comment: '#928374',
    function: '#fabd2f',
    variable: '#83a598',
    type: '#d3869b',
    number: '#d3869b',
    operator: '#fe8019',

    // Semantic Colors
    error: '#fb4934',
    warning: '#fabd2f',
    info: '#83a598',
    success: '#b8bb26',
  },
  fonts: {
    ui: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    editor: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    monospace: '"JetBrains Mono", "Fira Code", monospace',
  },
  fontSizes: {
    ui: '14px',
    editor: '15px',
  },
  spacing: {
    unit: '8px',
  },
  borderRadius: '4px',
  shadows: {
    small: '0 2px 4px rgba(0, 0, 0, 0.4)',
    medium: '0 4px 8px rgba(0, 0, 0, 0.5)',
    large: '0 8px 16px rgba(0, 0, 0, 0.6)',
  },
};

/**
 * Tokyo Night Theme
 * A clean dark theme
 */
export const tokyoNight: Theme = {
  id: 'tokyo-night',
  name: 'Tokyo Night',
  type: 'dark',
  colors: {
    // UI Colors
    background: '#1a1b26',
    foreground: '#c0caf5',
    primary: '#7aa2f7',
    secondary: '#565f89',
    accent: '#bb9af7',
    border: '#292e42',
    hover: '#24283b',
    active: '#292e42',

    // Editor Colors
    editorBackground: '#1a1b26',
    editorForeground: '#c0caf5',
    lineNumber: '#3b4261',
    selection: '#364a82',
    cursor: '#c0caf5',

    // Syntax Colors
    keyword: '#bb9af7',
    string: '#9ece6a',
    comment: '#565f89',
    function: '#7aa2f7',
    variable: '#c0caf5',
    type: '#2ac3de',
    number: '#ff9e64',
    operator: '#89ddff',

    // Semantic Colors
    error: '#f7768e',
    warning: '#e0af68',
    info: '#7aa2f7',
    success: '#9ece6a',
  },
  fonts: {
    ui: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    editor: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    monospace: '"JetBrains Mono", "Fira Code", monospace',
  },
  fontSizes: {
    ui: '14px',
    editor: '15px',
  },
  spacing: {
    unit: '8px',
  },
  borderRadius: '5px',
  shadows: {
    small: '0 2px 4px rgba(0, 0, 0, 0.5)',
    medium: '0 4px 8px rgba(0, 0, 0, 0.6)',
    large: '0 8px 16px rgba(0, 0, 0, 0.7)',
  },
};

/**
 * All available themes
 */
export const themes: Theme[] = [
  githubLight,
  githubDark,
  vscodeLight,
  vscodeDark,
  solarizedLight,
  solarizedDark,
  dracula,
  nord,
  monokai,
  oneDark,
  gruvboxDark,
  tokyoNight,
];

/**
 * Get theme by ID
 */
export function getThemeById(id: string): Theme | undefined {
  return themes.find((theme) => theme.id === id);
}

/**
 * Get all light themes
 */
export function getLightThemes(): Theme[] {
  return themes.filter((theme) => theme.type === 'light');
}

/**
 * Get all dark themes
 */
export function getDarkThemes(): Theme[] {
  return themes.filter((theme) => theme.type === 'dark');
}

/**
 * Default theme
 */
export const defaultTheme = gruvboxDark;
