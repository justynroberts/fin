# FintonText - UX Design Specifications

## Design Principles

1. **Clarity Over Cleverness**: Interface should be immediately understandable
2. **Power with Simplicity**: Advanced features accessible but not overwhelming
3. **Consistent Interaction**: Similar actions work the same way everywhere
4. **Forgiving**: Easy to undo, hard to lose work
5. **Performant**: Every interaction feels instant
6. **Accessible**: Works for everyone, including keyboard-only and screen reader users

## UI Layout

### Main Window Structure

```
┌─────────────────────────────────────────────────────────────┐
│ Menu Bar (macOS) / Title Bar (Windows/Linux)                │
├─────────────────────────────────────────────────────────────┤
│ Toolbar                                                      │
│ [File] [Edit] [Mode: ▼] [Format] [View] [Help]             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│                                                              │
│                    Editor Area                               │
│                                                              │
│                   (Full height)                              │
│                                                              │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│ Status Bar                                                   │
│ Mode: Rich Text | Line 42, Col 12 | 1,234 words | UTF-8    │
└─────────────────────────────────────────────────────────────┘
```

### Optional Panels (Toggle)
- **Left Sidebar**: File tree, recent files, bookmarks
- **Right Sidebar**: Macro panel, snippets, document outline
- **Split View**: Preview pane for markdown mode

### Responsive Behavior
- Panels auto-hide when window <1024px width
- Mobile-friendly for hypothetical tablet version
- Minimum window size: 800x600px

## Color Scheme & Visual Design

### Light Theme (Default)
```
Background:     #FFFFFF
Text:           #24292F
Primary:        #0969DA
Secondary:      #6E7781
Border:         #D0D7DE
Accent:         #1F883D
Selection:      #0969DA20
Error:          #CF222E
Warning:        #9A6700
Success:        #1F883D
```

### Dark Theme
```
Background:     #0D1117
Text:           #E6EDF3
Primary:        #58A6FF
Secondary:      #8B949E
Border:         #30363D
Accent:         #3FB950
Selection:      #58A6FF30
Error:          #F85149
Warning:        #D29922
Success:        #3FB950
```

### Typography
- **UI Font**: System default (-apple-system, BlinkMacSystemFont, "Segoe UI", ...)
- **Editor Font (Code)**: 'Monaco', 'Menlo', 'Courier New', monospace
- **Editor Font (Rich Text)**: Configurable, default system serif
- **Font Sizes**: 11px (small), 13px (default), 16px (large), 20px (extra large)
- **Line Height**: 1.6 (prose), 1.4 (code)

### Spacing System
- Base unit: 8px
- Micro: 4px
- Small: 8px
- Medium: 16px
- Large: 24px
- XLarge: 32px

### Elevation & Shadows
```css
--shadow-small: 0 1px 3px rgba(0,0,0,0.12);
--shadow-medium: 0 4px 6px rgba(0,0,0,0.16);
--shadow-large: 0 10px 25px rgba(0,0,0,0.20);
```

## Interaction Patterns

### Editor Mode Switching

**Visual Indicator**: Mode selector in toolbar
```
┌─────────────────────────────────────┐
│ Mode: [Rich Text ▼]                 │
├─────────────────────────────────────┤
│ ○ Rich Text                         │
│ ○ Markdown                          │
│ ○ Code                              │
└─────────────────────────────────────┘
```

**Keyboard Shortcut**: Cmd/Ctrl + Shift + M (cycle modes)

**Smooth Transition**:
- Fade out current editor (100ms)
- Convert content
- Fade in new editor (100ms)
- Show subtle notification: "Switched to Markdown mode"

### Rich Text Formatting

**Toolbar Design**: Floating toolbar appears on selection
```
┌────────────────────────────────────────┐
│ [B] [I] [U] [S] │ [H1▼] [•] [#] [🔗] │
└────────────────────────────────────────┘
```

**Fixed Toolbar**: Always visible at top
```
File Edit Format View
[B] [I] [U] [S] [H1▼] [Font▼] [Color] [Align▼] [•] [#] [🔗] [📷]
```

**Keyboard Shortcuts**:
- Bold: Cmd/Ctrl + B
- Italic: Cmd/Ctrl + I
- Underline: Cmd/Ctrl + U
- Heading 1: Cmd/Ctrl + Alt + 1
- Link: Cmd/Ctrl + K

### Markdown Features

**Syntax Highlighting**: Color-coded markdown syntax
```markdown
# Heading         ← Blue
**bold**          ← Bold text
*italic*          ← Italic text
[link](url)       ← Underlined blue
```

**Live Preview**: Optional split pane
```
┌─────────────────────┬─────────────────────┐
│ # Heading           │ Heading             │
│                     │                     │
│ **Bold** text       │ Bold text           │
│                     │                     │
│ - List item         │ • List item         │
└─────────────────────┴─────────────────────┘
```

**Toggle Preview**: Cmd/Ctrl + Shift + P

### Code Mode

**Language Selector**: Top-right corner
```
┌──────────────────────────────────┐
│ Language: [JavaScript ▼]         │
└──────────────────────────────────┘
```

**Code Features**:
- Line numbers (toggle: Cmd/Ctrl + L)
- Minimap (toggle: Cmd/Ctrl + Shift + E)
- Code folding (click gutter)
- Multi-cursor (Cmd/Ctrl + D)

### Macro System

**Macro Panel**: Right sidebar
```
┌────────────────────────────────┐
│ Macros                    [⊕]  │
├────────────────────────────────┤
│ ● Format Code Block            │
│ ● Insert Date Stamp            │
│ ● Markdown Table               │
│                                │
│ [● Record] [▶ Play] [✎ Edit]  │
└────────────────────────────────┘
```

**Recording Flow**:
1. Click "Record" → Turns red
2. Perform actions
3. Click "Stop" → Save dialog appears
4. Name macro, assign shortcut (optional)
5. Save

**Visual Feedback During Recording**:
- Red dot in menu bar
- Status bar shows "Recording..."
- Action counter: "15 actions recorded"

**Playback**:
- Select macro → Click "Play"
- Or use assigned keyboard shortcut
- Progress indicator for long macros
- Option to pause/cancel mid-playback

### Theme Switching

**Theme Selector**: Settings → Appearance
```
┌────────────────────────────────┐
│ Theme                          │
│ ┌──────────────────────────┐   │
│ │ ● Light (Default)        │   │
│ │ ○ Dark                   │   │
│ │ ○ High Contrast          │   │
│ │ ○ Solarized Light        │   │
│ │ ○ Solarized Dark         │   │
│ │ ○ Custom...              │   │
│ └──────────────────────────┘   │
│                                │
│ [Preview] [Apply]              │
└────────────────────────────────┘
```

**Live Preview**: Click theme name shows preview without applying

**Custom Themes**: Button to import .json theme file

### Export Dialog

**Export Flow**:
1. File → Export → Format selection
2. Export options appear
3. Preview (optional)
4. Export

**Export Dialog Design**:
```
┌──────────────────────────────────────┐
│ Export Document                      │
├──────────────────────────────────────┤
│ Format:                              │
│ ○ PDF                                │
│ ○ HTML                               │
│ ○ Markdown                           │
│ ○ Plain Text                         │
│ ○ DOCX                               │
│                                      │
│ Options (PDF):                       │
│ Page Size: [A4 ▼]                    │
│ Margins:   [Normal ▼]                │
│ ☑ Include images                     │
│ ☑ Embed fonts                        │
│                                      │
│ [Preview] [Cancel] [Export]          │
└──────────────────────────────────────┘
```

## Navigation & Discoverability

### Menu Structure
```
File
  New                    Cmd+N
  Open...                Cmd+O
  Open Recent           →
  Save                   Cmd+S
  Save As...             Cmd+Shift+S
  ──────────────────────
  Export               →
  ──────────────────────
  Preferences            Cmd+,
  ──────────────────────
  Close Tab              Cmd+W
  Quit                   Cmd+Q

Edit
  Undo                   Cmd+Z
  Redo                   Cmd+Shift+Z
  ──────────────────────
  Cut                    Cmd+X
  Copy                   Cmd+C
  Paste                  Cmd+V
  ──────────────────────
  Find...                Cmd+F
  Replace...             Cmd+H
  ──────────────────────
  Macros               →

Format (Rich Text Mode)
  Bold                   Cmd+B
  Italic                 Cmd+I
  Underline              Cmd+U
  Strikethrough          Cmd+Shift+X
  ──────────────────────
  Heading              →
  List                 →
  ──────────────────────
  Insert Link...         Cmd+K
  Insert Image...        Cmd+Shift+I

View
  Mode                 →
  ──────────────────────
  Toggle Sidebar         Cmd+B
  Toggle Preview         Cmd+Shift+P
  ──────────────────────
  Zoom In                Cmd++
  Zoom Out               Cmd+-
  Reset Zoom             Cmd+0
  ──────────────────────
  Full Screen            Cmd+Ctrl+F

Help
  Documentation
  Keyboard Shortcuts     Cmd+/
  ──────────────────────
  About FintonText
```

### Keyboard Shortcuts Cheat Sheet

**Modal**: Cmd/Ctrl + ? or Cmd + /
```
┌────────────────────────────────────────┐
│ Keyboard Shortcuts            [✕]      │
├────────────────────────────────────────┤
│ General                                │
│ Cmd+N        New document              │
│ Cmd+O        Open                      │
│ Cmd+S        Save                      │
│                                        │
│ Editing                                │
│ Cmd+B        Bold                      │
│ Cmd+I        Italic                    │
│ Cmd+K        Insert link               │
│                                        │
│ View                                   │
│ Cmd+Shift+M  Switch mode               │
│ Cmd+Shift+P  Toggle preview            │
│                                        │
│ [Search shortcuts...] [Print] [Close]  │
└────────────────────────────────────────┘
```

### Contextual Help

**Tooltips**: Hover over buttons for description
**First-Run Tutorial**: Optional guided tour on first launch
**Empty State**: Helpful message when no document open
```
┌────────────────────────────────────┐
│                                    │
│         📝 FintonText              │
│                                    │
│  Create a new document or open     │
│  an existing file to get started.  │
│                                    │
│  [New Document]  [Open File]       │
│                                    │
│  Recent Files:                     │
│  - project-notes.md                │
│  - todo-list.html                  │
│                                    │
└────────────────────────────────────┘
```

## Error Handling & Feedback

### Error Messages

**Principle**: Be specific, helpful, and offer solutions

**Bad Example**: "Save failed."
**Good Example**: "Could not save to Documents/notes.txt. The file may be locked by another application. Try saving to a different location or closing other apps."

**Error Toast Design**:
```
┌───────────────────────────────────────┐
│ ⚠ Export failed                       │
│ The PDF is too large (>50MB).         │
│ Try reducing images or splitting      │
│ into multiple documents.              │
│                              [Dismiss] │
└───────────────────────────────────────┘
```

### Success Feedback

**Subtle and Non-Intrusive**: Brief status bar message or toast

**Examples**:
- "Document saved" (2 seconds, then fade)
- "Exported to Downloads/document.pdf" (clickable to open)
- "Macro saved successfully"

### Loading States

**Principles**:
- Show immediately (<100ms)
- Indicate progress when possible
- Allow cancellation for long operations

**Spinner**: For unknown duration
**Progress Bar**: For known duration
```
┌────────────────────────────────────┐
│ Exporting PDF...                   │
│ ████████████░░░░░░░░░░░░  45%      │
│                          [Cancel]  │
└────────────────────────────────────┘
```

### Unsaved Changes

**Warning Dialog**:
```
┌────────────────────────────────────┐
│ Save changes to "Untitled"?        │
├────────────────────────────────────┤
│ Your changes will be lost if you   │
│ don't save them.                   │
│                                    │
│ [Don't Save] [Cancel] [Save]       │
└────────────────────────────────────┘
```

**Auto-save**: Every 30 seconds to temp location
**Recovery**: Offer to restore on crash/force quit

## Accessibility Features

### Keyboard Navigation
- Tab through all controls
- Escape to close modals
- Arrow keys in lists/menus
- Cmd+F6 to cycle between panes

### Screen Reader Support
- All buttons labeled
- State changes announced
- Document structure (headings) navigable
- Alt text for toolbar icons

### Visual Accessibility
- High contrast mode
- Configurable cursor size and color
- Current line highlight
- Focus indicators (2px outline)

### Customization
- Font size 10-32px
- Line height 1.0-2.0
- Letter spacing adjustment
- Color blind friendly themes

## Performance & Responsiveness

### Perceived Performance
- Optimistic UI updates (undo if fails)
- Instant feedback on interactions
- Background processing for heavy tasks
- Progress indication

### Debouncing/Throttling
- Auto-save: Debounce 1 second after last edit
- Live preview: Throttle to 16ms (60fps)
- Search: Debounce 300ms after last keystroke

### Skeleton Screens
Show layout immediately while loading content:
```
┌────────────────────────────────────┐
│ ████████████░░░░░░░░░░░░░░░░░░     │
│ ████░░░░░░░░░░░░░░░░░░░░░░░░░░     │
│ ████████░░░░░░░░░░░░░░░░░░░░░░     │
│ ██░░░░░░░░░░░░░░░░░░░░░░░░░░░░     │
└────────────────────────────────────┘
```

## Delight & Polish

### Animations
- **Fast**: 100-200ms for most transitions
- **Smooth**: 60fps minimum
- **Purposeful**: Convey state change, not decoration
- **Disableable**: Respect system preferences (prefers-reduced-motion)

### Micro-interactions
- Buttons depress slightly on click
- Checkboxes animate when toggled
- Mode switch slides in new editor
- Success actions pulse briefly

### Sounds (Optional, Off by Default)
- Subtle "pop" on macro save
- Quiet "whoosh" on export
- Error "bonk"

### Onboarding
- Welcome screen on first launch
- Tips shown contextually
- "What's new" on updates
- Optional tutorial mode

## Responsive Design Considerations

### Window Resizing
- Fluid layout, no fixed widths
- Panels hide at breakpoints:
  - <1024px: Auto-hide sidebars
  - <800px: Single toolbar row
  - <600px: Minimal UI

### Split Panes
- Draggable splitter
- Remember user's preferred sizes
- Snap to 50/50 on double-click

### Multi-Monitor
- Remember window position per monitor
- Allow windows on different screens
- Consistent DPI scaling

## Design System Summary

**Component Library**:
- Buttons (primary, secondary, ghost, danger)
- Inputs (text, select, checkbox, radio)
- Modals and dialogs
- Tooltips and popovers
- Toast notifications
- Progress indicators
- Tabs
- Panels and cards

**Consistency Checklist**:
- [ ] All buttons same height (32px)
- [ ] Consistent spacing (8px grid)
- [ ] Same border radius (4px)
- [ ] Unified color palette
- [ ] Consistent font usage
- [ ] Icon size (16px or 24px)
- [ ] Accessible focus indicators

**Style Guide**: Document all components with usage examples (Storybook or similar)
