## ACTUAL Fix for GitHub Sync - Documents Now Load (Really!)

This release fixes the REAL root cause of why documents don't appear after GitHub sync.

### What Was the Problem?

**v1.0.21 bug**: The `rebuildIndex()` method only added documents to metadata if they had frontmatter with `title` or `mode` fields. Plain markdown files without frontmatter were ignored.

**Result**: If your GitHub repository has plain `.md` files without YAML frontmatter headers, they never appeared in the UI after syncing.

### The Real Fix

Enhanced `rebuildIndex()` to discover ALL documents from the filesystem, regardless of frontmatter:

- **Before**: Only indexed files with frontmatter containing `title` or `mode`
- **After**: Indexes ALL markdown/code/HTML files found in `documents/` directory
- Automatically detects file type from extension (.md → markdown, .js → code, .html → notes)
- Creates metadata for any discovered file
- No frontmatter required!

### Technical Changes

**Modified `src/main/workspace-service.ts` (lines 426-461)**:

```typescript
// OLD (v1.0.21): Only add if has frontmatter with title or mode
if (fileMeta.title || fileMeta.mode) {
  const docMeta = { /* create metadata */ };
  metadata.documents[relativePath] = docMeta;
}

// NEW (v1.0.22): Add ALL files, use extension for mode detection
const ext = path.extname(file).toLowerCase();
let mode = 'markdown';  // default
if (ext === '.js' || ext === '.py' /* etc */) mode = 'code';
else if (ext === '.html') mode = 'notes';

const docMeta = {
  id: relativePath.replace(/[^a-zA-Z0-9]/g, '_'),
  title: fileMeta.title || path.basename(file, path.extname(file)),
  mode: fileMeta.mode || mode,  // use frontmatter if exists, else extension
  tags: fileMeta.tags || [],
  language: fileMeta.language,
  created: stats.birthtime.toISOString(),
  modified: stats.mtime.toISOString(),
};
metadata.documents[relativePath] = docMeta;
```

### How It Works Now

1. User clicks "Sync Now" in Settings → Git Configuration
2. Backend syncs with GitHub and calls `rebuildIndex()`
3. `rebuildIndex()` scans ALL files in `documents/` directory
4. For each file:
   - Reads frontmatter if it exists
   - Detects mode from file extension if no frontmatter
   - Creates metadata with title from filename if no frontmatter title
   - Indexes in SQLite for search
   - Adds to metadata JSON
5. Frontend refreshes and shows ALL documents

### Supported File Extensions

- **Markdown mode**: `.md` (default for unknown extensions)
- **Code mode**: `.js`, `.ts`, `.py`, `.java`, `.cpp`, `.c`, `.go`, `.rs`
- **Notes mode**: `.html`

### What This Fixes

- **Plain markdown files**: GitHub repos with `.md` files (no frontmatter) now work
- **Code files**: `.js`, `.py`, etc. automatically detected as code mode
- **HTML files**: Automatically detected as notes mode
- **Frontmatter optional**: Files work with or without YAML headers
- **Cross-machine sync**: Works on fresh workspace with no metadata file

### Debug Logging

The fix includes enhanced logging to track document discovery:

```
[Workspace] rebuildIndex: Starting with X documents in metadata
[Workspace] rebuildIndex: Found Y files in documents directory
[Workspace] rebuildIndex: Added new document from filesystem: documents/file.md mode: markdown
[Workspace] rebuildIndex: Saving metadata with Z new documents
[Workspace] rebuildIndex: Complete. Total documents in index: N
```

Check the main process logs (Terminal where you launched the app) to see this output.

## Download

### macOS (Apple Silicon)
- **DMG**: FinText-1.0.22-arm64.dmg (167 MB)
- **ZIP**: FinText-1.0.22-arm64-mac.zip (160 MB)

**Important**: Remove quarantine flag after installation:
```bash
xattr -cr /Applications/FinText.app
```

## Upgrading from v1.0.21

Simply install the new version. The GitHub sync feature will now work properly - ALL documents will appear after syncing, even without frontmatter.

## Full Changelog

- Enhanced `WorkspaceService.rebuildIndex()` to discover ALL files, not just files with frontmatter
- Added automatic mode detection from file extension
- Removed requirement for frontmatter with title/mode fields
- Bumped version to 1.0.22
