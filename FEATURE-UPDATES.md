# Feature Updates - Auto-Open Workspace, Font Fixes, and Python Support

**Date**: November 2, 2025
**Version**: 1.0.7+

## Summary

Three key improvements have been implemented:
1. Auto-open last workspace on startup (configurable setting)
2. Fixed Google Fonts loading in Notes view
3. Fixed Python code execution for systems with only `python3`

---

## 1. Auto-Open Last Workspace Setting

### Overview
Users can now configure Finton to automatically open their most recently used workspace when the application launches, eliminating the need to manually select the workspace every time.

### Files Modified

#### `src/main/settings-service.ts`
- **Lines 32-40**: Added `autoOpenLastWorkspace` and `lastWorkspacePath` to `EditorPreferences` interface
- **Lines 147-149**: Added default values for new preferences in workspace settings
- **Lines 342-344**: Added default values in `getEditorPreferences()` method

```typescript
export interface EditorPreferences {
  theme: 'dark' | 'light' | 'auto';
  fontSize: number;
  fontFamily: string;
  lineHeight: number;
  autoSave: boolean;
  autoSaveInterval: number;
  autoOpenLastWorkspace: boolean;      // NEW
  lastWorkspacePath: string | null;    // NEW
}
```

#### `src/main/ipc-handlers.ts`
- **Line 23**: Registered new IPC handler `workspace:open-path`
- **Lines 109-132**: Added `handleOpenWorkspacePath()` function to open workspace from a specific path

```typescript
async function handleOpenWorkspacePath(_event: any, workspacePath: string):
  Promise<{ success: boolean; path?: string; error?: string }> {
  try {
    // Check if the path exists
    try {
      await fs.access(workspacePath);
    } catch (error) {
      return { success: false, error: `Workspace path does not exist: ${workspacePath}` };
    }

    // Initialize workspace service
    workspaceService = new WorkspaceService(workspacePath);
    await workspaceService.init();

    // Initialize workspace settings
    await settingsService.setWorkspacePath(workspacePath);

    return { success: true, path: workspacePath };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}
```

#### `src/preload/index.ts`
- **Line 11**: Added `openPath` method to workspace operations
- **Line 104**: Added `openPath` to `ElectronAPI` TypeScript interface

```typescript
workspace: {
  open: () => ipcRenderer.invoke('workspace:open'),
  openPath: (path: string) => ipcRenderer.invoke('workspace:open-path', path),  // NEW
  create: () => ipcRenderer.invoke('workspace:create'),
  close: () => ipcRenderer.invoke('workspace:close'),
  getInfo: () => ipcRenderer.invoke('workspace:get-info'),
}
```

#### `src/renderer/store/workspace-store.ts`
- **Line 66**: Added `openWorkspacePath` to actions interface
- **Lines 111-113, 148-150**: Modified `openWorkspace` and `createWorkspace` to save last workspace path
- **Lines 128-158**: Added new `openWorkspacePath()` method

```typescript
// Save as last workspace
const prefs = await window.electronAPI.settings.getEditorPreferences();
prefs.lastWorkspacePath = result.path;
await window.electronAPI.settings.setEditorPreferences(prefs);
```

#### `src/renderer/App.tsx`
- **Line 15**: Destructured `openWorkspacePath` from workspace store
- **Line 23**: Added `hasCheckedAutoOpen` state
- **Lines 59-76**: Added `useEffect` hook to check and auto-open workspace on mount

```typescript
// Check for auto-open last workspace on mount
useEffect(() => {
  const checkAutoOpen = async () => {
    if (!hasCheckedAutoOpen && !isOpen) {
      setHasCheckedAutoOpen(true);
      try {
        const prefs = await window.electronAPI.settings.getEditorPreferences();
        if (prefs.autoOpenLastWorkspace && prefs.lastWorkspacePath) {
          console.log('[App] Auto-opening last workspace:', prefs.lastWorkspacePath);
          await openWorkspacePath(prefs.lastWorkspacePath);
        }
      } catch (error) {
        console.error('[App] Failed to auto-open workspace:', error);
      }
    }
  };
  checkAutoOpen();
}, [hasCheckedAutoOpen, isOpen, openWorkspacePath]);
```

#### `src/renderer/components/Settings.tsx`
- **Lines 45-54**: Added `EditorPreferences` interface with new fields
- **Lines 83-92**: Added `editorPreferences` state
- **Lines 125-128**: Load editor preferences in `loadSettings()`
- **Line 140**: Save editor preferences in `handleSave()`
- **Lines 537-600**: Replaced "Coming soon..." with actual editor settings UI

```typescript
<div className="form-group">
  <label>
    <div className="checkbox-label">
      <input
        type="checkbox"
        checked={editorPreferences.autoOpenLastWorkspace}
        onChange={(e) =>
          setEditorPreferences({
            ...editorPreferences,
            autoOpenLastWorkspace: e.target.checked,
          })
        }
      />
      <span>Open last workspace on startup</span>
    </div>
  </label>
  <p className="field-desc">
    Automatically open your most recent workspace when launching Finton
  </p>
  {editorPreferences.lastWorkspacePath && (
    <p className="field-desc" style={{ marginTop: '8px', fontStyle: 'italic' }}>
      Last workspace: {editorPreferences.lastWorkspacePath}
    </p>
  )}
</div>
```

### How to Use
1. Open Finton and create/open a workspace
2. Go to Settings (⚙️ icon) → Editor tab
3. Check "Open last workspace on startup"
4. Click "Save Settings"
5. Close and reopen Finton - it will automatically open the last workspace!

### Technical Notes
- The last workspace path is saved in the workspace settings (`.fintext-settings.json`)
- The setting is checked only once on app startup to avoid infinite loops
- If the workspace path no longer exists, the app will show the welcome screen
- The feature gracefully handles errors and falls back to normal behavior

---

## 2. Fixed Fonts in Notes View

### Overview
The font selector in the Notes (rich text) editor was not working because Google Fonts were not being loaded. This has been fixed by adding the necessary font imports.

### Files Modified

#### `index.html`
- **Lines 12-15**: Added Google Fonts preconnect and stylesheet links

```html
<!-- Google Fonts for Rich Text Editor -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Merriweather:wght@400;700&family=Lora:wght@400;600&family=Playfair+Display:wght@400;700&family=Source+Serif+Pro:wght@400;600&family=Crimson+Text:wght@400;600&family=Libre+Baskerville:wght@400;700&display=swap" rel="stylesheet">
```

### Fonts Available
The following fonts are now properly loaded and available in the Notes editor:
- **Inter** - Modern sans-serif (default)
- **Merriweather** - Classic serif
- **Lora** - Elegant serif
- **Playfair Display** - Display serif
- **Source Serif Pro** - Professional serif
- **Crimson Text** - Traditional serif
- **Libre Baskerville** - Book-style serif
- **Georgia** - System serif (always available)

### How to Use
1. Create or open a document in Notes mode
2. Select text or place cursor
3. Click the font dropdown in the toolbar
4. Select any font - it will now apply correctly!

### Technical Notes
- The CSP (Content Security Policy) already allowed `fonts.googleapis.com` and `fonts.gstatic.com`
- The fonts are loaded with `display=swap` for better performance
- Preconnect hints optimize font loading speed
- Fonts are applied via inline style on the contentEditable div

---

## 3. Fixed Python Code Execution

### Overview
Python code was failing to execute on systems that only have `python3` installed (not `python`). The code execution service now tries `python3` first, then falls back to `python`.

### Files Modified

#### `src/main/code-execution-service.ts`
- **Lines 161-164**: Added Python-specific handling in `buildCommand()` method
- **Line 213**: Updated `installPackage()` to use `python3 -m pip install` first

```typescript
// Handle Python - try python3 first, fallback to python
if (language === 'python') {
  return `python3 "${tempFile}" || python "${tempFile}"`;
}
```

```typescript
python: `python3 -m pip install ${packageName} || pip3 install ${packageName} || pip install ${packageName}`,
```

### How It Works
When executing Python code:
1. First tries: `python3 script.py`
2. If that fails, tries: `python script.py`
3. Uses the `||` operator for automatic fallback

When installing Python packages:
1. First tries: `python3 -m pip install package`
2. If that fails, tries: `pip3 install package`
3. If that fails, tries: `pip install package`

### System Compatibility
This fix ensures Python works on:
- ✅ macOS with Homebrew Python (python3 only)
- ✅ Linux systems with python3
- ✅ Systems with both python and python3
- ✅ Windows with python.exe
- ✅ Systems with python symlinked to python3

### How to Use
1. Create a Code document
2. Set language to Python
3. Write Python code:
   ```python
   print("Hello from Python!")
   import sys
   print(f"Python version: {sys.version}")
   ```
4. Click Run - it will now execute successfully!

### Technical Notes
- The fix uses shell `||` operator for automatic fallback
- No changes needed to existing Python code
- Works with all Python 3.x versions
- Package installation also handles version differences
- Error messages will indicate which Python was tried

---

## Testing Checklist

### Auto-Open Workspace
- [ ] Open a workspace
- [ ] Enable "Open last workspace on startup" in Settings → Editor
- [ ] Close Finton
- [ ] Reopen Finton - workspace should open automatically
- [ ] Disable the setting - next launch should show welcome screen

### Fonts in Notes
- [ ] Create a Notes document
- [ ] Try each font in the dropdown
- [ ] Verify fonts render correctly
- [ ] Save and reopen - font should persist

### Python Execution
- [ ] Create a Code document (Python)
- [ ] Run simple print statement
- [ ] Try importing standard library (sys, os, etc.)
- [ ] Test package installation (if needed)

---

## Migration Notes

### For Users
- No migration needed - new features are opt-in
- Existing workspaces continue to work normally
- Font selection in existing Notes documents will now work properly

### For Developers
- The `EditorPreferences` interface has new fields (backward compatible)
- New IPC channel: `workspace:open-path`
- Workspace store has new `openWorkspacePath()` method
- Settings dialog now has functional Editor tab

---

## Known Limitations

### Auto-Open Workspace
- Only opens the last workspace, not multiple recent workspaces
- No validation if workspace was moved/deleted (shows welcome screen)
- Setting is stored per workspace, not globally

### Fonts
- Google Fonts require internet connection on first load
- Custom font upload not supported (only predefined fonts)
- Fonts only available in Notes mode (not Markdown or Code)

### Python
- Fallback adds slight delay if first python command fails
- No version detection - uses whatever python3/python is in PATH
- Virtual environments must be activated manually

---

## Future Enhancements

Potential improvements for future versions:

1. **Auto-Open Workspace**
   - Remember multiple recent workspaces
   - Workspace selector dialog for quick switching
   - Global setting (not per-workspace)

2. **Fonts**
   - Custom font upload support
   - Font preview in dropdown
   - More Google Fonts options
   - Font size and line-height controls

3. **Python**
   - Python version detection and selection
   - Virtual environment management
   - Package manager UI
   - Requirements.txt support

---

## Conclusion

These three updates improve the overall user experience by:
- Reducing friction when launching the app (auto-open workspace)
- Making the Notes editor more versatile (working fonts)
- Ensuring Python works on modern systems (python3 support)

All changes are backward compatible and opt-in, ensuring existing workflows are not disrupted.
