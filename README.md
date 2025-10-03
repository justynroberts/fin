# FintonText

A powerful desktop text editor that seamlessly switches between **Rich Text**, **Markdown**, and **Code** editing modes. Built with Electron, React, and TypeScript.

## Features

- **🔄 Seamless Mode Switching**: Effortlessly switch between rich text, markdown, and code modes
- **🎨 Theming Support**: Multiple built-in themes with custom theme support
- **⚡ Macro System**: Record, save, and replay complex editing sequences
- **📤 Export Flexibility**: Export to PDF, HTML, Markdown, Plain Text, and DOCX
- **🎯 Professional UX**: Clean, intuitive interface with keyboard-first design
- **🔧 Extensible**: Plugin architecture for future customization

## Development Setup

### Prerequisites

- Node.js 18+ and npm
- macOS, Windows, or Linux

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/fintontext.git
cd fintontext

# Install dependencies
npm install
```

### Development

```bash
# Start development server with hot reload
npm run dev

# Run linter
npm run lint

# Run type checking
npm run type-check

# Format code
npm run format
```

### Testing

```bash
# Run tests
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

### Building

```bash
# Build for all platforms
npm run build

# Package for specific platform
npm run package:mac
npm run package:win
npm run package:linux
```

## Project Structure

```
fintontext/
├── src/
│   ├── main/           # Electron main process
│   ├── preload/        # Preload scripts
│   ├── renderer/       # React application
│   │   ├── components/ # UI components
│   │   ├── editors/    # Editor implementations
│   │   ├── services/   # Business logic
│   │   ├── store/      # State management
│   │   └── types/      # TypeScript types
│   └── shared/         # Shared utilities
├── tests/              # Test files
├── plan/               # Project planning docs
└── public/             # Static assets
```

## Architecture

See [plan/02-architecture.md](plan/02-architecture.md) for detailed architecture documentation.

## Contributing

Contributions are welcome! Please read the planning documentation in the `plan/` directory to understand the project structure and roadmap.

## License

MIT License - see LICENSE file for details
