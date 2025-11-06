## Fix for GitHub Sync - Documents Now Load Properly

This release fixes the root cause of why documents weren't appearing after GitHub sync.

### What Was Fixed

**Problem**: After syncing from GitHub, documents were downloaded but didn't appear in the UI because the workspace indexing system only looked at the `.finton-metadata.json` file, which doesn't exist in freshly synced repositories.

**Solution**: Enhanced the `rebuildIndex()` method in WorkspaceService to automatically discover and index documents from the filesystem, even when metadata doesn't exist yet.

### Technical Changes

**Modified `src/main/workspace-service.ts`**:
- `rebuildIndex()` method now scans the `documents/` directory for markdown files with frontmatter
- Automatically adds newly discovered documents to metadata
- Indexes discovered documents in SQLite for search
- Saves updated metadata for future use
- Added extensive logging to track document discovery process

### How It Works Now

1. User clicks "Sync Now" in Settings → Git Configuration
2. Backend syncs with GitHub and calls `workspaceService.init()`
3. `init()` calls `rebuildIndex()` which now:
   - Indexes existing documents from metadata
   - Scans filesystem for documents not in metadata
   - Reads frontmatter from discovered files
   - Adds new documents to metadata and SQLite index
   - Saves updated metadata
4. Frontend fetches documents via `document.list()`
5. Documents appear in sidebar immediately

### What This Fixes

- **Fresh GitHub sync**: Documents pulled from GitHub now appear immediately
- **Empty workspace**: New workspaces that sync from GitHub work correctly
- **Missing metadata**: Documents work even if `.finton-metadata.json` doesn't exist yet
- **Cross-machine workflows**: Syncing to a new machine now works properly

### Debug Logging Added

The `rebuildIndex()` method now logs:
- How many documents are in metadata at start
- How many files found in documents directory
- Which documents are discovered and added
- Final count of documents in index

These logs will help diagnose any remaining issues.

## Download

### macOS (Apple Silicon)
- **DMG**: FinText-1.0.21-arm64.dmg (167 MB)
- **ZIP**: FinText-1.0.21-arm64-mac.zip (160 MB)

**Important**: Remove quarantine flag after installation:
```bash
xattr -cr /Applications/FinText.app
```

## Upgrading from v1.0.20

Simply install the new version. The GitHub sync feature will now work properly - documents will appear after syncing from GitHub.

## Full Changelog

- Enhanced `WorkspaceService.rebuildIndex()` to discover documents from filesystem
- Added frontmatter parsing during index rebuild
- Automatic metadata creation for discovered documents
- Bumped version to 1.0.21
