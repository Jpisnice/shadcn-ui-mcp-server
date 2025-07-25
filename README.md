# Shadcn UI v4 MCP Server

[![npm version](https://badge.fury.io/js/@jpisnice%2Fshadcn-ui-mcp-server.svg)](https://badge.fury.io/js/@jpisnice%2Fshadcn-ui-mcp-server)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A Model Context Protocol (MCP) server that provides AI assistants with comprehensive access to [shadcn/ui v4](https://ui.shadcn.com/) components, blocks, demos, and metadata. This server enables AI tools like Claude Desktop, Continue.dev, VS Code, Cursor, and other MCP-compatible clients to retrieve and work with shadcn/ui components seamlessly.

## 🚀 Key Features

- **Component Source Code**: Get the latest shadcn/ui v4 component TypeScript source
- **Component Demos**: Access example implementations and usage patterns  
- **Blocks Support**: Retrieve complete block implementations (dashboards, calendars, login forms, etc.)
- **Metadata Access**: Get component dependencies, descriptions, and configuration details
- **Directory Browsing**: Explore the shadcn/ui repository structure
- **GitHub API Integration**: Efficient caching and intelligent rate limit handling
- **Framework Support**: Switch between React (shadcn/ui) and Svelte (shadcn-svelte) implementations

## 📦 Quick Start

### ⚡ Using npx (Recommended)

The fastest way to get started - no installation required!

```bash
# Basic usage (rate limited to 60 requests/hour)
npx @jpisnice/shadcn-ui-mcp-server

# With GitHub token for better rate limits (5000 requests/hour)
npx @jpisnice/shadcn-ui-mcp-server --github-api-key ghp_your_token_here

# Short form
npx @jpisnice/shadcn-ui-mcp-server -g ghp_your_token_here

# Using environment variable
export GITHUB_PERSONAL_ACCESS_TOKEN=ghp_your_token_here
npx @jpisnice/shadcn-ui-mcp-server

# Switch to Svelte framework (default is react)
npx @jpisnice/shadcn-ui-mcp-server --framework svelte

# Use Svelte with GitHub token
npx @jpisnice/shadcn-ui-mcp-server --framework svelte --github-api-key ghp_your_token_here

# Using environment variable for framework
export FRAMEWORK=svelte
npx @jpisnice/shadcn-ui-mcp-server
```

**🎯 Try it now**: Run `npx @jpisnice/shadcn-ui-mcp-server --help` to see all options!

**🔄 Framework Selection**: The server supports both React (shadcn/ui) and Svelte (shadcn-svelte) implementations. Use `--framework svelte` to switch to Svelte components.

### 🔧 Command Line Options

```bash
shadcn-ui-mcp-server [options]

Options:
  --github-api-key, -g <token>    GitHub Personal Access Token
  --framework, -f <framework>     Framework to use: 'react' or 'svelte' (default: react)
  --help, -h                      Show help message  
  --version, -v                   Show version information

Environment Variables:
  GITHUB_PERSONAL_ACCESS_TOKEN    Alternative way to provide GitHub token
  FRAMEWORK                       Framework to use: 'react' or 'svelte' (default: react)

Examples:
  npx @jpisnice/shadcn-ui-mcp-server --help
  npx @jpisnice/shadcn-ui-mcp-server --version
  npx @jpisnice/shadcn-ui-mcp-server -g ghp_1234567890abcdef
  GITHUB_PERSONAL_ACCESS_TOKEN=ghp_token npx @jpisnice/shadcn-ui-mcp-server
  npx @jpisnice/shadcn-ui-mcp-server --framework svelte
  npx @jpisnice/shadcn-ui-mcp-server -f react
  export FRAMEWORK=svelte && npx @jpisnice/shadcn-ui-mcp-server
```

## 🔑 GitHub API Token Setup

**Why do you need a token?**
- Without token: Limited to 60 API requests per hour
- With token: Up to 5,000 requests per hour
- Better reliability and faster responses

### 📝 Getting Your Token (2 minutes)

1. **Go to GitHub Settings**:
   - Visit [GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)](https://github.com/settings/tokens)
   - Or: GitHub Profile → Settings → Developer settings → Personal access tokens

2. **Generate New Token**:
   - Click "Generate new token (classic)"
   - Add a note: "shadcn-ui MCP server"
   - **Expiration**: Choose your preference (90 days recommended)
   - **Scopes**: ✅ **No scopes needed!** (public repository access is sufficient)

3. **Copy Your Token**:
   - Copy the generated token (starts with `ghp_`)
   - ⚠️ **Save it securely** - you won't see it again!

### 🚀 Using Your Token

**Method 1: Command Line (Quick testing)**
```bash
npx @jpisnice/shadcn-ui-mcp-server --github-api-key ghp_your_token_here
```

**Method 2: Environment Variable (Recommended)**
```bash
# Add to your shell profile (~/.bashrc, ~/.zshrc, etc.)
export GITHUB_PERSONAL_ACCESS_TOKEN=ghp_your_token_here

# Then simply run:
npx @jpisnice/shadcn-ui-mcp-server
```

## 🔄 Framework Selection

The MCP server supports both **React** (shadcn/ui) and **Svelte** (shadcn-svelte) implementations. You can switch between them based on your project needs.

### 📋 Framework Comparison

| Framework | Repository | File Extension | Description |
|-----------|------------|----------------|-------------|
| **React** (default) | `shadcn-ui/ui` | `.tsx` | React components from shadcn/ui v4 |
| **Svelte** | `huntabyte/shadcn-svelte` | `.svelte` | Svelte components from shadcn-svelte |

### 🎯 How to Switch Frameworks

**Method 1: Command Line Argument (Recommended)**
```bash
# Use React (default)
npx @jpisnice/shadcn-ui-mcp-server

# Switch to Svelte
npx @jpisnice/shadcn-ui-mcp-server --framework svelte
npx @jpisnice/shadcn-ui-mcp-server -f svelte

# Switch back to React
npx @jpisnice/shadcn-ui-mcp-server --framework react
npx @jpisnice/shadcn-ui-mcp-server -f react
```

**Method 2: Environment Variable**
```bash
# Use Svelte
export FRAMEWORK=svelte
npx @jpisnice/shadcn-ui-mcp-server

# Use React
export FRAMEWORK=react
npx @jpisnice/shadcn-ui-mcp-server

# Or set for single command
FRAMEWORK=svelte npx @jpisnice/shadcn-ui-mcp-server
```

**Method 3: Combined with GitHub Token**
```bash
# Svelte with GitHub token
npx @jpisnice/shadcn-ui-mcp-server --framework svelte --github-api-key ghp_your_token_here

# React with GitHub token (default)
npx @jpisnice/shadcn-ui-mcp-server --github-api-key ghp_your_token_here
```

### 🔍 Framework Detection

The server will log which framework is being used:
```bash
INFO: Framework set to 'svelte' via command line argument
INFO: MCP Server configured for SVELTE framework
INFO: Repository: huntabyte/shadcn-svelte
INFO: File extension: .svelte
```

**⚠️ Important**: When using environment variables, make sure to use the correct syntax:
- ✅ Correct: `export FRAMEWORK=svelte && npx @jpisnice/shadcn-ui-mcp-server`
- ✅ Correct: `FRAMEWORK=svelte npx @jpisnice/shadcn-ui-mcp-server`
- ❌ Incorrect: `FRAMEWORK=svelte npx @jpisnice/shadcn-ui-mcp-server` (without proper spacing)

### 💡 Use Cases

- **React Projects**: Use default or `--framework react` for React/Next.js applications
- **Svelte Projects**: Use `--framework svelte` for Svelte/SvelteKit applications
- **Multi-Framework Development**: Switch between frameworks to compare implementations
- **Learning**: Explore both React and Svelte versions of the same components

## 🛠️ Editor Integration

### VS Code Integration

#### Method 1: Using Continue Extension

1. **Install Continue Extension**:
   - Open VS Code
   - Go to Extensions (Ctrl+Shift+X)
   - Search for "Continue" and install it

2. **Configure MCP Server**:
   - Open Command Palette (Ctrl+Shift+P)
   - Type "Continue: Configure" and select it
   - Add this configuration to your settings:

```json
{
  "continue.server": {
    "mcpServers": {
      "shadcn-ui": {
        "command": "npx",
        "args": ["@jpisnice/shadcn-ui-mcp-server", "--github-api-key", "ghp_your_token_here"]
      },
      // If using Svelte, do this instead:
      "shadcn-ui-svelte": {
        "command": "npx",
        "args": ["@jpisnice/shadcn-ui-mcp-server", "--framework", "svelte", "--github-api-key", "ghp_your_token_here"]
      }
    }
  }
}
```

#### Method 2: Using Claude Extension

1. **Install Claude Extension**:
   - Search for "Claude" in VS Code extensions
   - Install the official Claude extension

2. **Configure MCP Server**:
   - Add to your VS Code settings.json:

```json
{
  "claude.mcpServers": {
    "shadcn-ui": {
      "command": "npx",
      "args": ["@jpisnice/shadcn-ui-mcp-server"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_your_token_here"
      }
    },
      // If using Svelte, do this instead:
    "shadcn-ui-svelte": {
      "command": "npx",
      "args": ["@jpisnice/shadcn-ui-mcp-server", "--framework", "svelte"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_your_token_here"
      }
    }
  }
}
```

### Cursor Integration

#### Method 1: Global Configuration

1. **Open Cursor Settings**:
   - Go to Settings (Cmd/Ctrl + ,)
   - Search for "MCP" or "Model Context Protocol"

2. **Add MCP Server Configuration**:
```json
{
  "mcpServers": {
    "shadcn-ui": {
      "command": "npx",
      "args": ["@jpisnice/shadcn-ui-mcp-server", "--github-api-key", "ghp_your_token_here"]
    },
    // If using Svelte, do this instead:
    "shadcn-ui-svelte": {
      "command": "npx",
      "args": ["@jpisnice/shadcn-ui-mcp-server", "--framework", "svelte", "--github-api-key", "ghp_your_token_here"]
    }
  }
}
```

#### Method 2: Workspace Configuration

Create a `.cursorrules` file in your project root:

```json
{
  "mcpServers": {
    "shadcn-ui": {
      "command": "npx",
      "args": ["@jpisnice/shadcn-ui-mcp-server"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_your_token_here"
      }
    },
    // If using Svelte, do this instead:
    "shadcn-ui-svelte": {
      "command": "npx",
      "args": ["@jpisnice/shadcn-ui-mcp-server", "--framework", "svelte"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_your_token_here"
      }
    }
  }
}
```

### Claude Desktop Integration

Add to your Claude Desktop configuration (`~/.config/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "shadcn-ui": {
      "command": "npx",
      "args": ["@jpisnice/shadcn-ui-mcp-server", "--github-api-key", "ghp_your_token_here"]
    },
    // If using Svelte, do this instead:
    "shadcn-ui-svelte": {
      "command": "npx",
      "args": ["@jpisnice/shadcn-ui-mcp-server", "--framework", "svelte", "--github-api-key", "ghp_your_token_here"]
    }
  }
}
```

Or with environment variable:

```json
{
  "mcpServers": {
    "shadcn-ui": {
      "command": "npx",
      "args": ["@jpisnice/shadcn-ui-mcp-server"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_your_token_here"
      }
    },
    // If using Svelte, do this instead:
    "shadcn-ui-svelte": {
      "command": "npx",
      "args": ["@jpisnice/shadcn-ui-mcp-server", "--framework", "svelte"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_your_token_here"
      }
    }
  }
}
```

### Continue.dev Integration

1. **Install Continue.dev**:
   - Download from [continue.dev](https://continue.dev)
   - Install the application

2. **Configure MCP Server**:
   - Open Continue.dev
   - Go to Settings → MCP Servers
   - Add new server:

```json
{
  "name": "shadcn-ui",
  "command": "npx",
  "args": ["@jpisnice/shadcn-ui-mcp-server", "--github-api-key", "ghp_your_token_here"]
}
```

Or for Svelte:

```json
{
  "name": "shadcn-ui-svelte",
  "command": "npx",
  "args": ["@jpisnice/shadcn-ui-mcp-server", "--framework", "svelte", "--github-api-key", "ghp_your_token_here"]
}
```

## 🎯 Usage Examples

### Getting Component Source Code

Ask your AI assistant:
```
"Show me the source code for the shadcn/ui button component"
```

The AI can now access the complete TypeScript source code for the button component.

### Creating a Dashboard

Ask your AI assistant:
```
"Create a dashboard using shadcn/ui components. Use the dashboard-01 block as a starting point"
```

The AI can retrieve the complete dashboard block implementation and customize it for your needs.

### Building a Login Form

Ask your AI assistant:
```
"Help me build a login form using shadcn/ui components. Show me the available form components"
```

The AI can list all available components and help you build the form.

## 🛠️ Available Tools

The MCP server provides these tools for AI assistants:

### Component Tools

- **`get_component`** - Get component source code
- **`get_component_demo`** - Get component usage examples
- **`list_components`** - List all available components
- **`get_component_metadata`** - Get component dependencies and info

### Block Tools

- **`get_block`** - Get complete block implementations (dashboard-01, calendar-01, etc.)
- **`list_blocks`** - List all available blocks with categories

### Repository Tools

- **`get_directory_structure`** - Explore the shadcn/ui repository structure

### Example Tool Usage

```typescript
// These tools can be called by AI assistants via MCP protocol

// Get button component source
{
  "tool": "get_component",
  "arguments": { "componentName": "button" }
}

// List all components
{
  "tool": "list_components",
  "arguments": {}
}

// Get dashboard block
{
  "tool": "get_block", 
  "arguments": { "blockName": "dashboard-01" }
}
```

## 🐛 Troubleshooting

### Common Issues

**"Rate limit exceeded" errors:**
```bash
# Solution: Add GitHub API token
npx @jpisnice/shadcn-ui-mcp-server --github-api-key ghp_your_token_here
```

**"Command not found" errors:**
```bash
# Solution: Install Node.js 18+ and ensure npx is available
node --version  # Should be 18+
npx --version   # Should work
```

**Component not found:**
```bash
# Check available components first
npx @jpisnice/shadcn-ui-mcp-server
# Then call list_components tool via your MCP client
```

**Network/proxy issues:**
```bash
# Set proxy if needed
export HTTP_PROXY=http://your-proxy:8080
export HTTPS_PROXY=http://your-proxy:8080
npx @jpisnice/shadcn-ui-mcp-server
```

**Editor not recognizing MCP server:**
```bash
# Verify the server is running
npx @jpisnice/shadcn-ui-mcp-server --help

# Check your editor's MCP configuration
# Ensure the command and args are correct
```

### Debug Mode

Enable verbose logging:

```bash
# Set debug environment variable
DEBUG=* npx @jpisnice/shadcn-ui-mcp-server --github-api-key ghp_your_token
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

- 🐛 [Report Issues](https://github.com/Jpisnice/shadcn-ui-mcp-server/issues)
- 💬 [Discussions](https://github.com/Jpisnice/shadcn-ui-mcp-server/discussions)
- 📖 [Documentation](https://github.com/Jpisnice/shadcn-ui-mcp-server#readme)
- 📦 [npm Package](https://www.npmjs.com/package/@jpisnice/shadcn-ui-mcp-server)

## 🔗 Related Projects

- [shadcn/ui](https://ui.shadcn.com/) - React component library (default framework)
- [shadcn-svelte](https://www.shadcn-svelte.com/) - Svelte component library (use `--framework svelte`)
- [Model Context Protocol](https://modelcontextprotocol.io/) - The protocol specification
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk) - Official MCP SDK

## ⭐ Acknowledgments

- [shadcn](https://github.com/shadcn) for the amazing UI component library
- [Anthropic](https://anthropic.com) for the Model Context Protocol specification
- The open source community for inspiration and contributions

---

**Made with ❤️ by [Janardhan Polle](https://github.com/Jpisnice)**

**Star ⭐ this repo if you find it helpful!**