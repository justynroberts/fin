# GitHub Sync Debugging Guide

## Version Verification

1. **Check which version you downloaded:**
   - Look at the DMG filename: `FinText-1.0.X-arm64.dmg`
   - In the app: Menu → About FinText
   - Should say **v1.0.22** or later

2. **If you're on v1.0.21 or earlier:** Download v1.0.22 from https://github.com/justynroberts/fin/releases/tag/v1.0.22

## How to See Main Process Logs

The main process logs (where `[Workspace] rebuildIndex:` messages appear) are separate from the DevTools console.

### Option 1: Run from Terminal
```bash
# Navigate to the app
cd /Applications/FinText.app/Contents/MacOS

# Run the app directly (this will show main process logs)
./FinText
```

### Option 2: Check Console.app
1. Open `/Applications/Utilities/Console.app`
2. Select your Mac in the sidebar
3. Search for "Workspace rebuildIndex"
4. Click "Sync Now" and watch for new log messages

## Expected Log Output (v1.0.22)

When you click "Sync Now" in Settings → Git Configuration, you should see:

```
[IPC] Re-initializing workspace after sync...
[Workspace] rebuildIndex: Starting with 6 documents in metadata
[Workspace] rebuildIndex: Scanning /path/to/workspace/documents for new documents
[Workspace] rebuildIndex: Found 6 files in documents directory
[Workspace] rebuildIndex: Complete. Total documents in index: 6
[IPC] Workspace re-initialized successfully
```

## If You See "Found 0 files"

This means the `documents/` directory doesn't exist in your local workspace.

Check:
```bash
# Where is your workspace?
ls -la ~/path/to/your/workspace/

# Does it have a documents folder?
ls -la ~/path/to/your/workspace/documents/
```

## If Documents Directory is Empty After Sync

This means Git sync didn't pull the files properly. Try:

```bash
cd ~/path/to/your/workspace
git status
git log --oneline -5
ls -la documents/
```

The `documents/` directory should contain:
- `aws-uk.html`
- `azure-notes.html`
- `best-p.md`
- `best-practices.html`
- `gcp-notes.html`
- `test-doc.html`

## Common Issues

### Issue 1: Wrong Workspace Directory
- You might be looking at a different workspace than the one you synced
- Check Settings → Workspace Info to see the current workspace path

### Issue 2: Git Sync Didn't Actually Pull Files
- The sync might have failed silently
- Check the workspace directory manually to confirm files were downloaded

### Issue 3: Testing Old Version
- Make sure you downloaded and installed v1.0.22
- Verify with About dialog or DMG filename

## Still Not Working?

Share these details:
1. App version (from About dialog)
2. Main process console logs (from Terminal or Console.app)
3. Output of: `ls -la ~/path/to/your/workspace/documents/`
4. Frontend DevTools console logs showing the document count
