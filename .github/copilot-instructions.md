# GitHub Copilot Instructions for Agent MCP Inspector

## Project Overview

The Agent MCP Inspector is an advanced developer tool for testing, debugging, and creating MCP servers with Microsoft Copilot Studio integration. It consists of three main components in a TypeScript monorepo:

- **Client (`client/`)**: React frontend with Vite, TypeScript and Tailwind CSS
- **Server (`server/`)**: Express backend with TypeScript for MCP proxy functionality
- **CLI (`cli/`)**: Command-line interface for programmatic MCP server interaction

## Development Guidelines

### Build Commands

- Build all: `npm run build`
- Build client: `npm run build-client`
- Build server: `npm run build-server`
- Build CLI: `npm run build-cli`
- Development mode: `npm run dev` (use `npm run dev:windows` on Windows)
- Format code: `npm run prettier-fix`
- Run tests: `npm run test`
- E2E tests: `npm run test:e2e`
- Lint client: `cd client && npm run lint`

### Code Style Requirements

- **TypeScript**: Use proper type annotations throughout
- **React**: Functional components with hooks (no class components)
- **Modules**: Use ES modules (import/export), not CommonJS
- **Formatting**: Prettier auto-formats on commit
- **Naming Conventions**:
  - camelCase for variables and functions
  - PascalCase for component names and types
  - kebab-case for file names
- **Async**: Use async/await for asynchronous operations
- **Error Handling**: Implement proper try/catch blocks
- **Styling**: Use Tailwind CSS for client styling
- **Components**: Keep components small and focused on single responsibility

### Architecture Patterns

- **MCP Protocol**: Follow Model Context Protocol specifications
- **Transport Types**: Support stdio, SSE, and streamable HTTP transports
- **Authentication**: Bearer token auth for SSE connections
- **Security**: Local-only binding by default, DNS rebinding protection
- **Microsoft Integration**: Support for Copilot Studio and Power Platform services

### File Structure Understanding

```
/
├── client/          # React frontend (port 6274)
│   ├── src/         # React components and utilities
│   ├── dist/        # Build output
│   └── bin/         # Client startup scripts
├── server/          # Express backend (port 6277)
│   ├── src/         # Server source code
│   ├── build/       # Build output
│   └── microsoft/   # Microsoft service integrations
├── cli/             # Command-line interface
│   ├── src/         # CLI source code
│   └── build/       # Build output
├── Examples/        # Sample configurations and exports
│   ├── MeetingAssist/           # Complete Copilot Studio agent
│   └── SolutionExport/          # Power Platform solution
└── .github/         # GitHub workflows and configuration
```

### Key Technical Concepts

- **MCP Proxy**: Acts as protocol bridge between web UI and MCP servers
- **Transport Abstraction**: Unified interface for different MCP transport methods
- **Session Management**: Token-based authentication with randomized session tokens
- **Microsoft PAC CLI**: Integration with Power Apps CLI for Copilot Studio
- **OAuth Flows**: Support for Microsoft and Google service authentication

### Common Tasks and Patterns

#### Adding New MCP Transport

1. Implement transport interface in `server/src/`
2. Add transport selection logic in proxy
3. Update client UI transport options
4. Add configuration export support

#### Microsoft Service Integration

1. Follow existing patterns in `server/src/microsoft/`
2. Use proper OAuth2 flows for authentication
3. Implement error handling for API limits
4. Add proper connection reference handling

#### UI Component Development

1. Create functional React components in `client/src/`
2. Use Tailwind classes for styling
3. Implement proper TypeScript interfaces
4. Add error boundaries and loading states

### Security Considerations

- **Never expose MCP proxy to untrusted networks**
- **Use authentication tokens for all proxy requests**
- **Validate Origin headers to prevent DNS rebinding**
- **Sanitize all example configurations before committing**
- **Use environment variables for sensitive configuration**

### Testing Guidelines

- **Unit Tests**: Focus on business logic and utility functions
- **E2E Tests**: Test complete user workflows with Playwright
- **CLI Tests**: Validate command-line interface functionality
- **Integration Tests**: Test MCP server connections and transports

### Microsoft Copilot Studio Integration

- **Agent Configuration**: Support Power Platform solution exports
- **Connection References**: Handle dynamic connection ID resolution
- **Schema Management**: Support bot schema name transformations
- **Security Compliance**: Follow GDPR, CCPA, HIPAA requirements where applicable

### Common Patterns to Follow

#### Error Handling

```typescript
try {
  const result = await mcpOperation();
  return { success: true, data: result };
} catch (error) {
  console.error("MCP operation failed:", error);
  return { success: false, error: error.message };
}
```

#### React Component Structure

```typescript
interface ComponentProps {
  // Use proper TypeScript interfaces
}

export const Component: React.FC<ComponentProps> = ({ prop }) => {
  // Use hooks for state management
  const [state, setState] = useState();

  // Handle async operations properly
  const handleAction = useCallback(async () => {
    try {
      await action();
    } catch (error) {
      // Proper error handling
    }
  }, []);

  return (
    <div className="tailwind-classes">
      {/* JSX content */}
    </div>
  );
};
```

#### MCP Client Usage

```typescript
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const transport = new StdioClientTransport({
  command: "node",
  args: ["server.js"],
});

await transport.connect();
// Use transport for MCP operations
```

### Environment Requirements

- **Node.js**: >=22.7.5 (specified in package.json engines)
- **Package Manager**: npm with workspaces support
- **Development**: TypeScript 5.4+, Vite 6+, React functional patterns

### Debugging and Development

- **Development Mode**: Runs client and server concurrently
- **Hot Reload**: Vite provides fast refresh for client development
- **Source Maps**: Generated for both client and server builds
- **Console Logging**: Structured logging with proper error context
- **Auth Tokens**: Session tokens printed to console in development

### Common Issues and Solutions

1. **Build Failures**: Check TypeScript errors, ensure all dependencies installed
2. **Transport Issues**: Verify MCP server is running and accessible
3. **Auth Problems**: Check session token configuration and Origin headers
4. **Microsoft Integration**: Verify connection references and OAuth configuration

When making changes, always:

- Run the build to check for TypeScript errors
- Test both UI and CLI functionality
- Validate MCP server connectivity
- Check security implications of changes
- Update relevant documentation
- Follow existing code patterns and naming conventions
