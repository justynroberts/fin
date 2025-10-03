# FintonText - Git-Based Document Management System

## Overview

FintonText will use Git as the underlying storage and sync mechanism for documents. This provides:
- **Version control** for all documents automatically
- **Remote sync** to any Git repository (GitHub, GitLab, self-hosted)
- **Collaboration** through standard Git workflows
- **Backup** and disaster recovery
- **Developer-friendly** workflow using familiar Git concepts

## Architecture

### Document Storage Structure

```
~/Documents/FintonText/  (or custom workspace path)
├── .git/                           # Git repository
├── .fintontext/
│   ├── config.json                 # Workspace configuration
│   ├── index.db                    # SQLite database for metadata
│   └── .gitignore                  # Ignore index.db
├── documents/
│   ├── project-notes.md
│   ├── design-specs.html           # Rich text saved as HTML
│   ├── api-docs.md
│   └── code-snippets/
│       └── utility.js
├── .fintontext-metadata.json       # Document tags and metadata (Git-tracked)
└── README.md                       # Auto-generated workspace description
```

### Metadata Schema

**`.fintontext-metadata.json`** (Git-tracked):
```json
{
  "version": "1.0",
  "workspace": {
    "name": "My Workspace",
    "created": "2025-10-02T08:00:00Z",
    "description": "Personal notes and documentation"
  },
  "documents": {
    "documents/project-notes.md": {
      "id": "uuid-here",
      "title": "Project Notes",
      "tags": ["project", "planning", "2025"],
      "created": "2025-10-02T08:00:00Z",
      "modified": "2025-10-02T10:30:00Z",
      "mode": "markdown",
      "customFields": {
        "status": "active",
        "priority": "high"
      }
    },
    "documents/design-specs.html": {
      "id": "uuid-here",
      "title": "Design Specifications",
      "tags": ["design", "ui", "specs"],
      "created": "2025-10-01T14:00:00Z",
      "modified": "2025-10-02T09:15:00Z",
      "mode": "rich-text"
    }
  }
}
```

**Local Index** (`.fintontext/index.db` - SQLite, NOT Git-tracked):
- Full-text search index
- Cached metadata for performance
- Recent files and quick access
- User preferences (per-workspace)

## Git Integration Features

### 1. Workspace Initialization

**Create New Workspace**:
```
1. User selects folder or creates new
2. Initialize Git repo (git init)
3. Create .fintontext/ directory
4. Create initial .fintontext-metadata.json
5. Create .gitignore (ignore .fintontext/index.db)
6. Initial commit: "Initialize FintonText workspace"
```

**Clone Existing Workspace**:
```
1. User provides Git URL
2. Clone repository (git clone)
3. Validate .fintontext-metadata.json exists
4. Build local index from metadata
5. Ready to use
```

### 2. Document Operations

**Create Document**:
```
1. Create file in workspace
2. Add entry to .fintontext-metadata.json
3. Stage both files (git add)
4. Commit: "Add: [document-title]"
```

**Edit Document**:
```
1. Save file changes
2. Update modified timestamp in metadata
3. Auto-commit (optional): "Update: [document-title]"
   OR
   Stage changes for manual commit
```

**Delete Document**:
```
1. Remove file (git rm)
2. Remove entry from metadata
3. Commit: "Delete: [document-title]"
```

**Tag Document**:
```
1. Update tags in .fintontext-metadata.json
2. Stage metadata file
3. Commit: "Update tags: [document-title]"
```

### 3. Sync Operations

**Push to Remote**:
```
1. git add . (stage all changes)
2. git commit -m "Sync: [timestamp]"
3. git push origin main
4. Show sync status in UI
```

**Pull from Remote**:
```
1. git pull origin main
2. Resolve conflicts if any (UI-assisted)
3. Rebuild local index from updated metadata
4. Refresh document list
```

**Conflict Resolution**:
```
1. Detect conflicts during pull
2. Show conflict UI with:
   - Local version
   - Remote version
   - Base version
3. Allow user to choose or merge
4. Stage resolved file
5. Complete merge commit
```

### 4. Version History

**View Document History**:
```
git log --follow -- documents/project-notes.md
```

**Restore Previous Version**:
```
git show <commit-hash>:documents/project-notes.md
```

**Compare Versions**:
```
git diff <commit1> <commit2> -- documents/project-notes.md
```

## Search System

### Multi-tier Search Strategy

**Tier 1: Metadata Search** (Fast - <10ms)
- Search document titles
- Search tags
- Filter by mode, date range
- Uses in-memory index

**Tier 2: Full-Text Search** (Fast - <100ms)
- SQLite FTS5 (Full-Text Search)
- Index document content
- Ranking by relevance
- Highlighting matches

**Tier 3: Git Grep** (Slower - <500ms)
- Deep search including history
- Search in old versions
- Regex support
- Use `git grep` command

### Search Query Syntax

```
# Simple search
"project planning"

# Tag filter
tag:design tag:2025

# Mode filter
mode:markdown

# Date filter
modified:>2025-10-01

# Combined
tag:project mode:markdown "API design"

# Regex (Git grep)
regex:"function.*export"
```

## Tagging System

### Tag Types

**Auto-generated Tags**:
- File type: `#markdown`, `#richtext`, `#code`
- Language: `#javascript`, `#python` (for code files)
- Date-based: `#2025`, `#october`, `#week40`

**User Tags**:
- Freeform: `#project`, `#important`, `#draft`
- Hierarchical: `#work/client-a`, `#personal/recipes`
- Special: `#todo`, `#review`, `#archive`

### Tag UI Features

- Tag autocomplete
- Tag cloud visualization
- Filter by multiple tags (AND/OR)
- Tag renaming (updates all documents)
- Tag deletion with confirmation

## Remote Repository Support

### Supported Git Providers

- **GitHub** (with authentication)
- **GitLab** (with authentication)
- **Gitea** (self-hosted)
- **Generic Git** (any Git server with SSH/HTTPS)

### Authentication Methods

1. **SSH Keys**: Standard Git SSH
2. **HTTPS + Token**: Personal access tokens
3. **OAuth**: GitHub/GitLab OAuth (future)

### Remote Configuration

```json
{
  "remote": {
    "url": "git@github.com:user/fintontext-docs.git",
    "name": "origin",
    "branch": "main",
    "autoSync": true,
    "syncInterval": 300,
    "lastSync": "2025-10-02T10:00:00Z"
  }
}
```

## User Workflows

### Workflow 1: Solo Developer

```
1. Create workspace in ~/Documents/DevNotes
2. Write notes, code snippets, documentation
3. Auto-commit on save (enabled)
4. Push to private GitHub repo daily
5. Pull on other machines to sync
```

### Workflow 2: Design Team

```
1. Clone team workspace from GitLab
2. Create design specs with rich text
3. Tag with #design, #project-name, #in-review
4. Commit and push when ready
5. Team members pull updates
6. Review history for changes
```

### Workflow 3: Personal Knowledge Base

```
1. Create workspace for personal notes
2. Organize with tags: #recipes, #finance, #learning
3. Use markdown for most content
4. Search across all notes instantly
5. Optional: Push to private backup repo
```

## UI Components

### Workspace Sidebar

```
┌─────────────────────────────┐
│ 📁 Workspace: DevNotes      │
│ ────────────────────────    │
│ 🔍 Search...                │
│                             │
│ 📂 All Documents (42)       │
│ 🏷️  Tags                    │
│    #project (12)            │
│    #design (8)              │
│    #code (15)               │
│    #draft (3)               │
│                             │
│ 📅 Recent                   │
│    project-notes.md         │
│    api-spec.html            │
│                             │
│ ⭐ Favorites                │
│                             │
│ 🔄 Sync Status              │
│    ● Synced 2 min ago       │
│    [Push] [Pull]            │
└─────────────────────────────┘
```

### Document List View

```
┌──────────────────────────────────────────────────┐
│ Sort: ▼ Modified   Filter: 🏷️ Tags   Search: 🔍 │
├──────────────────────────────────────────────────┤
│ 📄 Project Planning Notes                        │
│    #project #planning #2025                      │
│    Modified 2 hours ago • Markdown               │
│                                                  │
│ 📄 Design Specifications                         │
│    #design #ui #specs                            │
│    Modified yesterday • Rich Text                │
│                                                  │
│ 📄 API Documentation                             │
│    #code #api #reference                         │
│    Modified 3 days ago • Markdown                │
└──────────────────────────────────────────────────┘
```

### Sync Panel

```
┌─────────────────────────────────────────┐
│ Remote Repository                       │
│ ───────────────────────────────────────│
│ URL: github.com:user/notes.git          │
│ Branch: main                            │
│                                         │
│ Status: ✓ Up to date                    │
│ Last sync: 5 minutes ago                │
│                                         │
│ Changes to push: 3 commits              │
│ Changes to pull: 0 commits              │
│                                         │
│ [⬆️ Push] [⬇️ Pull] [⚙️ Settings]        │
│                                         │
│ ☑ Auto-sync every 5 minutes            │
│ ☐ Auto-commit on save                   │
└─────────────────────────────────────────┘
```

## Implementation Details

### Git Library

Use **isomorphic-git** (pure JavaScript Git implementation):
- Works in Electron renderer process
- No native dependencies
- Full Git protocol support
- HTTP/HTTPS and SSH support

Alternative: **simple-git** (Node.js wrapper):
- Use in main process via IPC
- Requires system Git installation
- Faster for large repos
- Better compatibility

**Decision**: Use **simple-git** in main process for reliability and performance.

### Database

**SQLite with FTS5** for local index:
- Fast full-text search
- Portable (single file)
- No server required
- FTS5 for modern search features

Library: **better-sqlite3** (synchronous, fast)

### File Watching

Watch workspace for external changes:
- **chokidar**: Cross-platform file watcher
- Detect changes made outside FintonText
- Auto-refresh document list
- Prompt to reload changed files

## Performance Considerations

### Large Workspaces

For workspaces with 1000+ documents:
- Lazy load document list
- Virtual scrolling in document list
- Incremental search results
- Background indexing
- Pagination for large result sets

### Git Performance

- Shallow clones for initial sync
- Sparse checkout for large repos (future)
- Git LFS support for large files (future)
- Background push/pull to avoid blocking UI

## Security & Privacy

### Credential Storage

- Use system keychain (macOS Keychain, Windows Credential Manager)
- Never store passwords in plaintext
- SSH keys managed by SSH agent
- Token expiration handling

### Data Privacy

- All data local-first
- Remote sync is optional
- User controls what is synced
- .gitignore for sensitive files
- Encryption option for remote repos (Git-crypt support - future)

## Migration & Export

### Import Existing Notes

- Import from folder (creates workspace)
- Import from ZIP
- Import from other note apps (Notion, Evernote, etc. - future)

### Export Options

- Export workspace as ZIP
- Export to static site (Jekyll, Hugo compatible)
- Export individual documents (existing export system)

## Developer & Designer Benefits

### For Developers

✅ **Version control** for all notes and docs
✅ **Git workflow** they already know
✅ **Code snippets** with syntax highlighting
✅ **API documentation** in Markdown
✅ **Team collaboration** via Git
✅ **CLI integration** possible (Git commands)

### For Designers

✅ **Visual design specs** in rich text
✅ **Image embedding** in documents
✅ **Tagging and organization**
✅ **Team sharing** via Git
✅ **Version history** for design iterations
✅ **Export to PDF/HTML** for clients

## Future Enhancements

- **Branch support**: Work on different branches
- **Pull requests**: Review changes before merging
- **Git LFS**: Large file support
- **Submodules**: Link to other workspaces
- **Hooks**: Run scripts on Git events
- **Conflict UI**: Visual merge tool
- **Blame view**: See who changed what
- **Stash**: Temporary save changes
