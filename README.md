# 🐾 Finton

**A powerful desktop text editor with AI assistance, seamless mode switching, and intelligent organization.**

![Finton Hero](./docs/screenshots/hero.svg)

## 📥 Download

Get the latest version (v1.0.6) for your platform:

- **macOS (Apple Silicon)**: [Download DMG](https://github.com/justynroberts/fin/releases/download/v1.0.6/FinText-1.0.6-arm64.dmg) or [ZIP](https://github.com/justynroberts/fin/releases/download/v1.0.6/FinText-1.0.6-arm64-mac.zip)
- **Windows (x64)**: [Download Installer](https://github.com/justynroberts/fin/releases/download/v1.0.6/FinText.Setup.1.0.6.exe)
- **Linux (x64)**: [AppImage](https://github.com/justynroberts/fin/releases/download/v1.0.6/FinText-1.0.6.AppImage) or [DEB](https://github.com/justynroberts/fin/releases/download/v1.0.6/finton_1.0.6_amd64.deb)

[View all releases](https://github.com/justynroberts/fin/releases)

> 📸 **Screenshots**: See `docs/screenshots/` directory for application screenshots and UI examples.

## ✨ Features

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

## 📦 Installation

### macOS (Apple Silicon)
1. Download the [DMG file](https://github.com/justynroberts/fin/releases/download/v1.0.6/FinText-1.0.6-arm64.dmg)
2. Open the DMG and drag Finton to your Applications folder
3. **IMPORTANT**: Remove the quarantine flag (app is not code signed):
   ```bash
   xattr -cr /Applications/FinText.app
   ```
4. Launch Finton from Applications
5. If macOS still blocks the app, right-click the app and select "Open", then click "Open" in the dialog

### Windows (x64 - Intel/AMD)
1. Download the [Setup installer](https://github.com/justynroberts/fin/releases/download/v1.0.6/FinText.Setup.1.0.6.exe)
2. Run the installer (you may see a Windows SmartScreen warning - click "More info" then "Run anyway")
3. Follow the installation wizard
4. Launch Finton from the Start Menu or Desktop

### Linux (x64)

**AppImage (Universal)**
1. Download the [AppImage file](https://github.com/justynroberts/fin/releases/download/v1.0.6/FinText-1.0.6.AppImage)
2. Make it executable: `chmod +x FinText-1.0.6.AppImage`
3. Run it: `./FinText-1.0.6.AppImage`

**Debian/Ubuntu (DEB package)**
1. Download the [DEB file](https://github.com/justynroberts/fin/releases/download/v1.0.6/finton_1.0.6_amd64.deb)
2. Install: `sudo dpkg -i finton_1.0.6_amd64.deb`
3. If dependencies are missing: `sudo apt-get install -f`
4. Launch from applications menu or run `finton`

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

## 🚀 Quick Start Guide

### First Launch

When you first open Finton, you'll need to create or open a workspace:

1. **Create New Workspace**
   - Click "Create New Workspace"
   - Choose a folder location (e.g., `Documents/FintonWorkspace`)
   - Finton will initialize Git and create the workspace structure

2. **Or Open Existing Workspace**
   - Click "Open Existing Workspace"
   - Select a folder that contains Finton documents
   - Your documents and templates will load automatically

### Creating Your First Document

1. Click the **"New Document"** button (+ icon) in the sidebar
2. Choose your editor mode:
   - 🟢 **Notes** - For rich text with formatting (like Google Docs)
   - 🟢 **Markdown** - For plain text with Markdown syntax
   - 🟢 **Code** - For programming with syntax highlighting
3. Add a title and optional tags
4. Start writing!

### Using AI Assistant

Finton includes powerful AI assistance:

1. **Setup AI** (first time)
   - Click the ⚙️ Settings icon
   - Go to "AI Assistant" tab
   - Choose a provider (Anthropic Claude, OpenAI, OpenRouter, or Ollama)
   - Enter your API key (not needed for Ollama)
   - Select a model

2. **Use AI in Documents**
   - Write some text or select existing text
   - Press the AI button or use the prompt dialog
   - Choose "Insert" to add AI content or "Replace" to modify existing text
   - AI remembers context within each document (if memory is enabled)

### Working with Templates

Save time by creating reusable templates:

1. **Create a Template**
   - Create a document with your desired structure
   - Click the 📑 "Save as Template" button
   - Give it a name (e.g., "Meeting Notes", "Blog Post")

2. **Use a Template**
   - Click "New Document from Template"
   - Select your saved template
   - Finton creates a new document with the template content

### Keyboard Shortcuts
- `Cmd/Ctrl + N` - New document
- `Cmd/Ctrl + S` - Save document
- `Cmd/Ctrl + Shift + N` - New document dialog (with templates)
- `Cmd/Ctrl + Z` - Undo
- `Cmd/Ctrl + Shift + Z` - Redo
- `Cmd/Ctrl + \` - Toggle Zen mode (press ESC to exit)

### Organizing Documents

- **Tags**: Add tags to documents for easy categorization
- **Search**: Use full-text search to find content across all documents
- **Git Integration**: Finton automatically commits changes with Git
- **Sync**: Push your workspace to GitHub/GitLab to sync across machines

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
