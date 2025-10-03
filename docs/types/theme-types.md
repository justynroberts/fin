# Theme Types Documentation

**File**: `src/renderer/types/theme.ts`

## Overview

Theme types define the visual appearance system for FintonText, including colors, fonts, spacing, and shadows. The theme system uses CSS custom properties for live theme switching.

---

## Core Types

### `ThemeType`

```typescript
type ThemeType = 'light' | 'dark';
```

Base theme classification.

**Values**:
- `'light'` - Light color scheme (light background, dark text)
- `'dark'` - Dark color scheme (dark background, light text)

---

## Color System

### `ThemeColors`

```typescript
interface ThemeColors {
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
```

Complete color palette for the application.

#### UI Colors

- `background` - Main background color (e.g., '#ffffff' for light)
- `foreground` - Main text color (e.g., '#24292f' for light)
- `primary` - Primary brand color (buttons, links)
- `secondary` - Secondary UI elements
- `accent` - Accent highlights
- `border` - UI borders and dividers
- `hover` - Hover state background
- `active` - Active/selected state background

#### Editor Colors

- `editorBackground` - Editor pane background
- `editorForeground` - Editor text color
- `lineNumber` - Line number gutter color
- `selection` - Text selection highlight
- `cursor` - Cursor/caret color

#### Syntax Colors (Code Mode)

- `keyword` - Language keywords (`const`, `function`, `if`, etc.)
- `string` - String literals
- `comment` - Comments
- `function` - Function names
- `variable` - Variable names
- `type` - Type names/annotations
- `number` - Numeric literals
- `operator` - Operators (`+`, `-`, `=`, etc.)

#### Semantic Colors

- `error` - Error messages and indicators
- `warning` - Warning messages
- `info` - Informational messages
- `success` - Success messages

**Example (Light Theme)**:
```typescript
const lightColors: ThemeColors = {
  // UI
  background: '#ffffff',
  foreground: '#24292f',
  primary: '#0969da',
  secondary: '#6e7781',
  accent: '#8250df',
  border: '#d0d7de',
  hover: '#f6f8fa',
  active: '#e8ecef',

  // Editor
  editorBackground: '#ffffff',
  editorForeground: '#24292f',
  lineNumber: '#8c959f',
  selection: '#ddf4ff',
  cursor: '#24292f',

  // Syntax
  keyword: '#cf222e',
  string: '#0a3069',
  comment: '#6e7781',
  function: '#6639ba',
  variable: '#953800',
  type: '#0969da',
  number: '#0550ae',
  operator: '#cf222e',

  // Semantic
  error: '#d1242f',
  warning: '#9a6700',
  info: '#0969da',
  success: '#1a7f37'
};
```

---

## Typography

### `ThemeFonts`

```typescript
interface ThemeFonts {
  ui: string;
  editor: string;
  monospace: string;
}
```

Font families used in the application.

**Fields**:
- `ui` - UI elements (menus, buttons, sidebars)
- `editor` - Editor content (markdown, rich text)
- `monospace` - Code editor and inline code

**Example**:
```typescript
const fonts: ThemeFonts = {
  ui: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  editor: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, serif',
  monospace: 'Monaco, Menlo, "Courier New", monospace'
};
```

---

### `ThemeFontSizes`

```typescript
interface ThemeFontSizes {
  ui: string;
  editor: string;
}
```

Base font sizes.

**Fields**:
- `ui` - UI text size (e.g., '14px')
- `editor` - Editor content size (e.g., '16px')

**Example**:
```typescript
const fontSizes: ThemeFontSizes = {
  ui: '14px',
  editor: '16px'
};
```

---

## Complete Theme

### `Theme`

```typescript
interface Theme {
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
```

A complete theme definition.

**Fields**:
- `id` - Unique theme identifier (e.g., 'github-light')
- `name` - Display name (e.g., 'GitHub Light')
- `type` - 'light' or 'dark'
- `colors` - Complete color palette
- `fonts` - Font families
- `fontSizes` - Font sizes
- `spacing.unit` - Base spacing unit (e.g., '8px')
- `borderRadius` - Border radius for UI elements (e.g., '6px')
- `shadows` - Drop shadow definitions
  - `small` - Subtle shadows (tooltips)
  - `medium` - Card shadows
  - `large` - Modal/dialog shadows

**Example**:
```typescript
const githubLightTheme: Theme = {
  id: 'github-light',
  name: 'GitHub Light',
  type: 'light',
  colors: {
    // ... (see ThemeColors example above)
  },
  fonts: {
    ui: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    editor: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, serif',
    monospace: 'Monaco, Menlo, "Courier New", monospace'
  },
  fontSizes: {
    ui: '14px',
    editor: '16px'
  },
  spacing: {
    unit: '8px'
  },
  borderRadius: '6px',
  shadows: {
    small: '0 1px 3px rgba(0,0,0,0.12)',
    medium: '0 3px 6px rgba(0,0,0,0.15)',
    large: '0 10px 20px rgba(0,0,0,0.19)'
  }
};
```

---

## Theme State

### `ThemeState`

```typescript
interface ThemeState {
  currentTheme: Theme;
  availableThemes: Theme[];
  customThemes: Theme[];
}
```

Application-wide theme state (managed by Zustand store).

**Fields**:
- `currentTheme` - Currently active theme
- `availableThemes` - Built-in themes (GitHub Light, GitHub Dark, etc.)
- `customThemes` - User-created themes

**Usage**: Stored in `theme-store.ts`, persisted to localStorage.

---

## Usage Examples

### Creating a Custom Theme

```typescript
import { Theme, ThemeType } from '@/types/theme';

function createCustomTheme(name: string, baseType: ThemeType): Theme {
  return {
    id: `custom-${Date.now()}`,
    name,
    type: baseType,
    colors: {
      // UI Colors
      background: baseType === 'light' ? '#fafafa' : '#1a1a1a',
      foreground: baseType === 'light' ? '#333333' : '#e0e0e0',
      primary: '#4a90e2',
      secondary: '#7f8c8d',
      accent: '#e74c3c',
      border: baseType === 'light' ? '#dddddd' : '#333333',
      hover: baseType === 'light' ? '#f0f0f0' : '#2a2a2a',
      active: baseType === 'light' ? '#e0e0e0' : '#3a3a3a',

      // Editor Colors
      editorBackground: baseType === 'light' ? '#ffffff' : '#1e1e1e',
      editorForeground: baseType === 'light' ? '#333333' : '#d4d4d4',
      lineNumber: baseType === 'light' ? '#999999' : '#666666',
      selection: baseType === 'light' ? '#cce0ff' : '#3a3d41',
      cursor: baseType === 'light' ? '#000000' : '#ffffff',

      // Syntax Colors
      keyword: '#c586c0',
      string: '#ce9178',
      comment: '#6a9955',
      function: '#dcdcaa',
      variable: '#9cdcfe',
      type: '#4ec9b0',
      number: '#b5cea8',
      operator: '#d4d4d4',

      // Semantic Colors
      error: '#f44336',
      warning: '#ff9800',
      info: '#2196f3',
      success: '#4caf50'
    },
    fonts: {
      ui: '-apple-system, sans-serif',
      editor: 'Georgia, serif',
      monospace: '"Fira Code", monospace'
    },
    fontSizes: {
      ui: '14px',
      editor: '18px'
    },
    spacing: {
      unit: '8px'
    },
    borderRadius: '4px',
    shadows: {
      small: '0 1px 2px rgba(0,0,0,0.1)',
      medium: '0 2px 4px rgba(0,0,0,0.15)',
      large: '0 8px 16px rgba(0,0,0,0.2)'
    }
  };
}
```

### Applying a Theme

```typescript
function applyTheme(theme: Theme): void {
  const root = document.documentElement;

  // Apply colors as CSS custom properties
  root.style.setProperty('--color-background', theme.colors.background);
  root.style.setProperty('--color-foreground', theme.colors.foreground);
  root.style.setProperty('--color-primary', theme.colors.primary);
  root.style.setProperty('--color-secondary', theme.colors.secondary);
  root.style.setProperty('--color-accent', theme.colors.accent);
  root.style.setProperty('--color-border', theme.colors.border);
  root.style.setProperty('--color-hover', theme.colors.hover);
  root.style.setProperty('--color-active', theme.colors.active);

  // Editor colors
  root.style.setProperty('--editor-background', theme.colors.editorBackground);
  root.style.setProperty('--editor-foreground', theme.colors.editorForeground);
  root.style.setProperty('--editor-line-number', theme.colors.lineNumber);
  root.style.setProperty('--editor-selection', theme.colors.selection);
  root.style.setProperty('--editor-cursor', theme.colors.cursor);

  // Fonts
  root.style.setProperty('--font-ui', theme.fonts.ui);
  root.style.setProperty('--font-editor', theme.fonts.editor);
  root.style.setProperty('--font-monospace', theme.fonts.monospace);

  // Font sizes
  root.style.setProperty('--font-size-ui', theme.fontSizes.ui);
  root.style.setProperty('--font-size-editor', theme.fontSizes.editor);

  // Other properties
  root.style.setProperty('--spacing-unit', theme.spacing.unit);
  root.style.setProperty('--border-radius', theme.borderRadius);
  root.style.setProperty('--shadow-small', theme.shadows.small);
  root.style.setProperty('--shadow-medium', theme.shadows.medium);
  root.style.setProperty('--shadow-large', theme.shadows.large);
}
```

### Using Theme in CSS

```css
.app {
  background-color: var(--color-background);
  color: var(--color-foreground);
  font-family: var(--font-ui);
  font-size: var(--font-size-ui);
}

.editor {
  background-color: var(--editor-background);
  color: var(--editor-foreground);
  font-family: var(--font-editor);
  font-size: var(--font-size-editor);
}

.button {
  background-color: var(--color-primary);
  color: #ffffff;
  border-radius: var(--border-radius);
  padding: calc(var(--spacing-unit) * 1) calc(var(--spacing-unit) * 2);
  box-shadow: var(--shadow-small);
}

.button:hover {
  background-color: var(--color-hover);
  box-shadow: var(--shadow-medium);
}

.syntax-keyword {
  color: var(--syntax-keyword);
}

.syntax-string {
  color: var(--syntax-string);
}
```

### Theme Switching

```typescript
import { useThemeStore } from '@/store/theme-store';

function ThemeSwitcher() {
  const { currentTheme, availableThemes, setTheme } = useThemeStore();

  const handleThemeChange = (themeId: string) => {
    const theme = availableThemes.find(t => t.id === themeId);
    if (theme) {
      setTheme(theme);
      applyTheme(theme);
    }
  };

  return (
    <select
      value={currentTheme.id}
      onChange={(e) => handleThemeChange(e.target.value)}
    >
      {availableThemes.map(theme => (
        <option key={theme.id} value={theme.id}>
          {theme.name}
        </option>
      ))}
    </select>
  );
}
```

---

## Built-in Themes

FintonText includes several built-in themes:

1. **GitHub Light** (`github-light`)
   - Clean, professional light theme
   - Based on GitHub's color scheme

2. **GitHub Dark** (`github-dark`)
   - Dark theme with excellent contrast
   - Easy on the eyes for extended use

3. **VS Code Light** (`vscode-light`)
   - Familiar to VS Code users
   - Optimized for code editing

4. **VS Code Dark** (`vscode-dark`)
   - Popular dark theme
   - Great syntax highlighting

---

## Related Types

- **Editor Types** (`editor.ts`) - Editor configuration
- **Document Types** (`document.ts`) - Document persistence
- **Workspace Types** (`workspace.ts`) - Workspace settings
