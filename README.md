[![MseeP.ai Security Assessment Badge](https://mseep.net/pr/jpisnice-shadcn-ui-mcp-server-badge.png)](https://mseep.ai/app/jpisnice-shadcn-ui-mcp-server)

# Shadcn UI v4 MCP Server

[![npm version](https://badge.fury.io/js/@jpisnice%2Fshadcn-ui-mcp-server.svg)](https://badge.fury.io/js/@jpisnice%2Fshadcn-ui-mcp-server)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[![Trust Score](https://archestra.ai/mcp-catalog/api/badge/quality/Jpisnice/shadcn-ui-mcp-server)](https://archestra.ai/mcp-catalog/jpisnice__shadcn-ui-mcp-server)

> **🚀 The fastest way to integrate shadcn/ui components into your AI workflow**

A Model Context Protocol (MCP) server that provides AI assistants with comprehensive access to [shadcn/ui v4](https://ui.shadcn.com/) components, blocks, demos, and metadata. Seamlessly retrieve React, Svelte, Vue, and React Native implementations for your AI-powered development workflow.

## ✨ Key Features

- **🎯 Multi-Framework Support** - React, Svelte, Vue, and React Native implementations
- **📦 Component Source Code** - Latest shadcn/ui v4 TypeScript source
- **🎨 Component Demos** - Example implementations and usage patterns  
- **🏗️ Blocks Support** - Complete block implementations (dashboards, calendars, forms)
- **📋 Metadata Access** - Dependencies, descriptions, and configuration details
- **🔍 Directory Browsing** - Explore repository structures
- **⚡ Smart Caching** - Efficient GitHub API integration with rate limit handling
- **🌐 SSE Transport** - Server-Sent Events support for multi-client deployments
- **🐳 Docker Ready** - Production-ready containerization with Docker Compose

## 🚀 Quick Start

```bash
# Basic usage (60 requests/hour)
npx @jpisnice/shadcn-ui-mcp-server

# With GitHub token (5000 requests/hour) - Recommended
npx @jpisnice/shadcn-ui-mcp-server --github-api-key ghp_your_token_here

# Switch frameworks
npx @jpisnice/shadcn-ui-mcp-server --framework svelte
npx @jpisnice/shadcn-ui-mcp-server --framework vue
npx @jpisnice/shadcn-ui-mcp-server --framework react-native

# Use Base UI instead of Radix (React only)
npx @jpisnice/shadcn-ui-mcp-server --ui-library base
```

**🎯 Get your GitHub token in 2 minutes**: [docs/getting-started/github-token.md](docs/getting-started/github-token.md)

## 📦 One-Click Installation (Claude Desktop)

Download and double-click the `.mcpb` file for instant installation:

1. Download `shadcn-ui-mcp-server.mcpb` from [Releases](https://github.com/Jpisnice/shadcn-ui-mcp-server/releases)
2. Double-click the file - Claude Desktop opens automatically
3. Enter your GitHub token (optional, for higher rate limits)
4. Click Install - tools are available immediately

**Manual install:** Claude Desktop → Settings → MCP → Add Server → Browse → Select `.mcpb` file

> **References:** [Anthropic Desktop Extensions](https://www.anthropic.com/engineering/desktop-extensions) | [Building MCPB](https://support.claude.com/en/articles/12922929-building-desktop-extensions-with-mcpb)

## 🌐 SSE Transport & Docker Deployment

Run the server with **Server-Sent Events (SSE)** transport for multi-client support and production deployments:

### Quick Start with SSE
```bash
# SSE mode (supports multiple concurrent connections)
node build/index.js --mode sse --port 7423

# Docker Compose (production ready)
docker-compose up -d

# Connect with Claude Code
claude mcp add --scope user --transport sse shadcn-mcp-server http://localhost:7423/sse
```

### Transport Modes
- **`stdio`** (default) - Standard input/output for CLI usage
- **`sse`** - Server-Sent Events for HTTP-based connections
- **`dual`** - Both stdio and SSE simultaneously

### Docker Examples
```bash
# Basic container
docker run -p 7423:7423 shadcn-ui-mcp-server

# With GitHub API token
docker run -p 7423:7423 -e GITHUB_PERSONAL_ACCESS_TOKEN=ghp_your_token shadcn-ui-mcp-server

# Docker Compose (recommended)
docker-compose up -d
curl http://localhost:7423/health
```

### Environment Variables
- `MCP_TRANSPORT_MODE` - Transport mode (stdio|sse|dual)
- `MCP_PORT` - SSE server port (default: 7423 - SHADCN on keypad!)
- `MCP_HOST` - Host binding (default: 0.0.0.0)
- `MCP_CORS_ORIGINS` - CORS origins (comma-separated)
- `GITHUB_PERSONAL_ACCESS_TOKEN` - GitHub API token
- `UI_LIBRARY` - UI primitive library: `radix` (default) or `base` (React only)

## 📚 Documentation

| Section | Description |
|---------|-------------|
| [🚀 Getting Started](docs/getting-started/) | Installation, setup, and first steps |
| [⚙️ Configuration](docs/configuration/) | Framework selection, tokens, and options |
| [🔌 Integration](docs/integration/) | Editor and tool integrations |
| [📖 Usage](docs/usage/) | Examples, tutorials, and use cases |
| [🎨 Frameworks](docs/frameworks/) | Framework-specific documentation |
| [🐛 Troubleshooting](docs/troubleshooting/) | Common issues and solutions |
| [🔧 API Reference](docs/api/) | Tool reference and technical details |

## 🎨 Framework Support

This MCP server supports four popular shadcn implementations:

| Framework | Repository | Maintainer | Description |
|-----------|------------|------------|-------------|
| **React** (default) | [shadcn/ui](https://ui.shadcn.com/) | [shadcn](https://github.com/shadcn) | React components from shadcn/ui v4 |
| **Svelte** | [shadcn-svelte](https://www.shadcn-svelte.com/) | [huntabyte](https://github.com/huntabyte) | Svelte components from shadcn-svelte |
| **Vue** | [shadcn-vue](https://www.shadcn-vue.com/) | [unovue](https://github.com/unovue) | Vue components from shadcn-vue |
| **React Native** | [react-native-reusables](https://github.com/founded-labs/react-native-reusables) | [Founded Labs](https://github.com/founded-labs) | React Native components from react-native-reusables |

### UI Library (React only)

shadcn/ui v4 supports two primitive libraries for React: **Radix UI** (default) and **Base UI**.

```bash
# Radix UI (default)
npx @jpisnice/shadcn-ui-mcp-server --framework react --ui-library radix

# Base UI
npx @jpisnice/shadcn-ui-mcp-server --framework react --ui-library base

# Or via environment variable
UI_LIBRARY=base npx @jpisnice/shadcn-ui-mcp-server
```

Claude Desktop config example:
```json
{
  "args": ["--framework", "react", "--ui-library", "base"]
}
```

## 🛠️ Essential Setup

### 1. Get GitHub Token (Recommended)
```bash
# Visit: https://github.com/settings/tokens
# Generate token with no scopes needed
export GITHUB_PERSONAL_ACCESS_TOKEN=ghp_your_token_here
```

### 2. Run Server
```bash
# React (default)
npx @jpisnice/shadcn-ui-mcp-server

# Svelte
npx @jpisnice/shadcn-ui-mcp-server --framework svelte

# Vue  
npx @jpisnice/shadcn-ui-mcp-server --framework vue

# React Native
npx @jpisnice/shadcn-ui-mcp-server --framework react-native
```

### 3. Integrate with Your Editor
- **Claude Code**: See [Claude Code Integration](#-claude-code-integration) below
- **VS Code**: [docs/integration/vscode.md](docs/integration/vscode.md)
- **Cursor**: [docs/integration/cursor.md](docs/integration/cursor.md)
- **Claude Desktop**: [docs/integration/claude-desktop.md](docs/integration/claude-desktop.md)
- **Continue.dev**: [docs/integration/continue.md](docs/integration/continue.md)

## 💻 Claude Code Integration

### Quick Add (CLI)

```bash
# Add the shadcn-ui MCP server
claude mcp add shadcn -- bunx -y @jpisnice/shadcn-ui-mcp-server --github-api-key YOUR_TOKEN
```

### SSE Transport

For production deployments with SSE transport:

```bash
# Start server in SSE mode
node build/index.js --mode sse --port 7423

# Connect with Claude Code
claude mcp add --scope user --transport sse shadcn-mcp-server http://localhost:7423/sse
```

### Framework-Specific Commands

See [Claude Code Integration Guide](docs/integration/claude-code.md) for framework-specific commands (React, Svelte, Vue, React Native).

> **Reference:** [Claude Code MCP Documentation](https://code.claude.com/docs/en/mcp)

## 🎯 Use Cases

- **AI-Powered Development** - Let AI assistants build UIs with shadcn/ui
- **Multi-Client Deployments** - SSE transport supports multiple concurrent connections
- **Production Environments** - Docker Compose ready with health checks and monitoring
- **Component Discovery** - Explore available components and their usage
- **Multi-Framework Learning** - Compare React, Svelte, Vue, and React Native implementations
- **Rapid Prototyping** - Get complete block implementations for dashboards, forms, etc.
- **Code Generation** - Generate component code with proper dependencies

## 📦 Installation

```bash
# Global installation (optional)
npm install -g @jpisnice/shadcn-ui-mcp-server

# Or use npx (recommended)
npx @jpisnice/shadcn-ui-mcp-server
```

## 🔨 Building from Source

### Prerequisites

- Node.js >= 18.0.0
- npm or pnpm

### Build Steps

```bash
# Clone the repository
git clone https://github.com/Jpisnice/shadcn-ui-mcp-server.git
cd shadcn-ui-mcp-server

# Install dependencies
npm install

# Build the project
npm run build

# Run the server
node build/index.js --github-api-key YOUR_TOKEN
```

### Run Locally

```bash
# After building, run with options
node build/index.js --github-api-key YOUR_TOKEN
node build/index.js --framework svelte
```

### Building MCPB Package

The project includes a `manifest.json` following the [MCPB specification](https://github.com/modelcontextprotocol/mcpb). The `.mcpb` file is a ZIP archive containing the server, dependencies, and configuration.

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed packaging instructions.

> **Reference:** [Building Desktop Extensions with MCPB](https://support.claude.com/en/articles/12922929-building-desktop-extensions-with-mcpb)

## 🔗 Quick Links

- 📖 [Full Documentation](docs/)
- 🚀 [Getting Started Guide](docs/getting-started/)
- 🌐 [SSE Transport & Docker Guide](SSE_IMPLEMENTATION.md)
- 🎨 [Framework Comparison](docs/frameworks/)
- 🔧 [API Reference](docs/api/)
- 🐛 [Troubleshooting](docs/troubleshooting/)
- 💬 [Issues & Discussions](https://github.com/Jpisnice/shadcn-ui-mcp-server)

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

- **[shadcn](https://github.com/shadcn)** - For the amazing React UI component library
- **[huntabyte](https://github.com/huntabyte)** - For the excellent Svelte implementation
- **[unovue](https://github.com/unovue)** - For the comprehensive Vue implementation
- **[Founded Labs](https://github.com/founded-labs)** - For the React Native implementation
- **[Anthropic](https://anthropic.com)** - For the Model Context Protocol specification

---

**Made with ❤️ by [Janardhan Polle](https://github.com/Jpisnice)**

**Star ⭐ this repo if you find it helpful!**
