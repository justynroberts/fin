## Debug Build for GitHub Sync Investigation

This is a special debug build to investigate why documents aren't loading after GitHub sync.

### What's Changed

Added extensive debug logging to both frontend and backend to track down the issue where documents don't appear after syncing with GitHub.

### Debug Features

- **Frontend Logging**: Console logs show each step of the document fetch process
- **Backend Logging**: Main process logs show metadata loading and file scanning
- **Increased Timeout**: Changed from 500ms to 2000ms to give more time for indexing
- **Better Error Messages**: More descriptive feedback if documents don't load

### How to Debug

After clicking "Sync Now" in Settings → Git Configuration:

1. Open DevTools (View → Toggle Developer Tools)
2. Check the Console tab for detailed logs
3. Look for messages starting with `[Settings]` and `[IPC]`
4. The logs will show:
   - How many documents were loaded from metadata
   - How many files were found in documents directory
   - The final count returned to frontend

### Important Note

**This is a DEBUG build** - it has extra logging that will be removed in the next release. Please share the console output with us so we can diagnose the issue.

## Download

### macOS (Apple Silicon)
- **DMG**: FinText-1.0.20-arm64.dmg (167 MB)
- **ZIP**: FinText-1.0.20-arm64-mac.zip (160 MB)

**Important**: Remove quarantine flag after installation:
```bash
xattr -cr /Applications/FinText.app
```

## Technical Changes
- Added debug logging to Settings.tsx (lines 170-210)
- Added debug logging to handleListDocuments in ipc-handlers.ts (lines 202-258)
- Increased sync refresh timeout from 500ms to 2000ms
- Added console.table() output for document visualization
- Bumped version to 1.0.20

## Upgrading from v1.0.19
Simply install the new version. Same functionality as v1.0.19 but with debug logging enabled.
