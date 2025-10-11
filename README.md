# Finton

A powerful desktop text editor with AI assistance, seamless mode switching, and intelligent organization.

> 📸 **Screenshots**: See `docs/screenshots/` directory for application screenshots and UI examples.

## Features

### 🎨 Three Editor Modes
- **Notes** - Rich text editor with visual formatting (WYSIWYG)
- **Markdown** - Plain text with Markdown syntax and live preview
- **Code** - Syntax-highlighted code editor with execution support

### 🤖 AI Assistant
- Generate and modify content with AI
- Context-aware suggestions
- Multi-provider support: Anthropic Claude, OpenAI, OpenRouter, and Ollama (local)
- Built-in memory for contextual conversations
- Works with unsaved documents
- Insert or replace modes for content generation

### 📋 Template System
- Save any document as a reusable template
- Templates filtered by document type (Notes/Markdown/Code)
- Quick document creation from templates
- Templates stored with frontmatter metadata

### 🏷️ Smart Organization
- Tags and metadata for easy categorization
- Full-text search across all documents
- Tag-based filtering and navigation
- Git version control integration

### 🔄 Cross-Platform Sync
- Document metadata stored as frontmatter in files
- Portable across machines via Git
- Consistent workspace experience everywhere
- Only API keys need reconfiguration

### 🎯 Code Execution
- Execute code directly in the editor
- Support for multiple languages (JavaScript, Python, etc.)
- Real-time output display
- Package installation support

### 🎨 Customization
- Multiple themes
- Configurable editor preferences
- Auto-save functionality
- Zen mode for distraction-free writing (Cmd/Ctrl+\ or ESC to exit)

## Installation

### macOS
1. Download the latest release from [Releases](https://github.com/justynroberts/fin/releases)
2. Open the DMG file or extract the ZIP
3. Drag Finton to your Applications folder
4. Launch Finton

### Build from Source
```bash
# Clone the repository
git clone https://github.com/justynroberts/fin.git
cd fin

# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build

# Package for macOS
npm run package:mac
```

## Usage

### Getting Started
1. **Create or Open Workspace** - Start by creating a new workspace or opening an existing one
2. **Create Document** - Click "New Document" and choose your editor mode
3. **Use Templates** - Select from saved templates or start from blank
4. **Enable AI** - Configure your AI API key in Settings for AI assistance
5. **Organize** - Add tags and metadata to keep documents organized

### Keyboard Shortcuts
- `Cmd/Ctrl + N` - New document
- `Cmd/Ctrl + S` - Save document
- `Cmd/Ctrl + Shift + N` - New document dialog (with templates)
- `Cmd/Ctrl + Z` - Undo
- `Cmd/Ctrl + Shift + Z` - Redo
- `Cmd/Ctrl + \` - Toggle Zen mode

### Template Workflow
1. Create a document with your desired content
2. Click the "Save as Template" button (bookmark icon)
3. Name your template
4. When creating new documents, select from available templates

### Git Integration
- Automatic Git initialization for workspaces
- Commit changes with meaningful messages
- Sync across machines via remote repository
- Document metadata travels with files via frontmatter

## Configuration

### AI Setup
1. Open Settings (gear icon)
2. Navigate to AI Assistant tab
3. Choose your provider:
   - **Anthropic** - Claude models (requires API key)
   - **OpenAI** - GPT models (requires API key)
   - **OpenRouter** - Multiple models (requires API key)
   - **Ollama** - Local LLMs (no API key needed, requires Ollama running)
4. Enter your API key (if using cloud provider)
5. For Ollama: Set base URL (default: `http://127.0.0.1:11434`)
6. Select your preferred model
7. Enable/disable conversation memory

### Editor Preferences
- Auto-save interval
- Theme selection
- Default editor mode
- Font and display settings

## Technology Stack

- **Electron 28** - Desktop framework
- **React 18** - UI library
- **TypeScript** - Type safety
- **Zustand** - State management
- **Monaco Editor** - Code/Markdown editing
- **Slate.js** - Rich text editing
- **Better-SQLite3** - Local search indexing

## Development

```bash
# Development with hot reload
npm run dev

# Run tests
npm test

# Type checking
npm run type-check

# Linting
npm run lint
npm run lint:fix

# Build
npm run build
npm run build:renderer    # React app
npm run build:main        # Electron main
npm run build:preload     # Preload scripts

# Package
npm run package           # All platforms
npm run package:mac       # macOS only
npm run package:win       # Windows only
npm run package:linux     # Linux only
```

## Architecture

### Security
- `contextIsolation: true` - Separate JavaScript contexts
- `nodeIntegration: false` - No Node.js in renderer
- `sandbox: true` - OS-level sandboxing
- IPC communication via `contextBridge` only

### Data Storage
- **Documents** - Stored as files with frontmatter metadata
- **Templates** - Stored in `.finton/templates/` with frontmatter
- **Search Index** - SQLite FTS5 for fast full-text search
- **Settings** - JSON configuration files

### Frontmatter Format
```markdown
---
title: "Document Title"
mode: notes
tags: ["work", "important"]
language: javascript
---

Document content here...
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE file for details

## Version

Current version: 1.0.6

## Changelog

### v1.0.6 (Latest)
- 🤖 Ollama integration for local LLMs (no API key required)
- 🔧 AI assistant now works with unsaved documents
- 🎨 Improved zen mode with ESC key exit
- 🔄 Fixed RichText editor AI content sync
- 🌐 IPv4 connection fix for Ollama (127.0.0.1)
- ⚡ Enhanced AI prompt dialog with insert/replace modes

### v1.0.5
- 🐛 Fix frontmatter display issue
- 📝 Update references from 'rich-text' to 'notes'

### v1.0.4
- 📋 Template system (save/load/list templates)
- 📄 Frontmatter support for portable metadata
- 🔄 Cross-machine sync via Git
- 🔧 Notes editor improvements
- 🏷️ Enhanced document organization

---

Built with ❤️ using Electron, React, and TypeScript
