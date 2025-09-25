# Agent MCP Inspector - GitHub Copilot Configuration

This file provides context for GitHub Copilot when working with the Agent MCP Inspector codebase.

## Quick Reference

For comprehensive development guidelines, see [`.github/copilot-instructions.md`](.github/copilot-instructions.md).

### Essential Commands

```bash
npm run build        # Build all components
npm run dev          # Development mode
npm run test         # Run tests
npm run prettier-fix # Format code
```

### Key Patterns

- **TypeScript**: Use proper type annotations and interfaces
- **React**: Functional components with hooks only
- **Styling**: Tailwind CSS classes
- **Modules**: ES6 import/export syntax
- **Async**: async/await pattern with proper error handling

### Architecture

- `client/`: React frontend (port 6274)
- `server/`: Express backend (port 6277)
- `cli/`: Command-line interface
- **MCP Protocol**: Model Context Protocol implementation
- **Microsoft Integration**: Copilot Studio and Power Platform support

### Code Quality

- Prettier auto-formatting on commit
- TypeScript strict mode enabled
- React functional patterns required
- Comprehensive error handling expected
