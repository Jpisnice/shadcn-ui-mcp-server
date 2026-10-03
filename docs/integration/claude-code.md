# Claude Code Integration

Integrate the shadcn/ui MCP Server with Claude Code terminal for command-line AI development.

## 🚀 Quick Setup

### Method 1: Direct Command

For Claude Code terminal users, you can add the MCP server directly:

```bash
# Add the shadcn-ui MCP server with GitHub token
claude mcp add shadcn -- bunx -y @jpisnice/shadcn-ui-mcp-server --github-api-key YOUR_API_KEY
```

### Method 2: Configuration File

Add to your Claude Code configuration:

```json
{
  "mcpServers": {
    "shadcn-ui": {
      "command": "npx",
      "args": [
        "@jpisnice/shadcn-ui-mcp-server",
        "--github-api-key",
        "ghp_your_token_here"
      ]
    }
  }
}
```

## 🎨 Framework-Specific Commands

### React (Default)

```bash
claude mcp add shadcn-react -- bunx -y @jpisnice/shadcn-ui-mcp-server --github-api-key YOUR_API_KEY
```

### Svelte

```bash
claude mcp add shadcn-svelte -- bunx -y @jpisnice/shadcn-ui-mcp-server --framework svelte --github-api-key YOUR_API_KEY
```

### Vue

```bash
claude mcp add shadcn-vue -- bunx -y @jpisnice/shadcn-ui-mcp-server --framework vue --github-api-key YOUR_API_KEY
```

### React Native

```bash
claude mcp add shadcn-react-native -- bunx -y @jpisnice/shadcn-ui-mcp-server --framework react-native --github-api-key YOUR_API_KEY
```

## 🎯 Usage Examples

### Component Requests

```
"Show me the shadcn/ui button component source code"
"Get the card component with usage examples"
"List all available shadcn/ui components"
```

### Block Requests

```
"Get the dashboard-01 block implementation"
"Show me the dashboard-01 block with all components"
"List all available shadcn/ui blocks"
```

### Framework Comparison

```
"Compare the button component between React and Svelte"
"Show me the Vue version of the card component"
"Get the React dialog component with TypeScript"
```

## 🔧 Environment Variable Setup

Use environment variables for better security:

```bash
# Set environment variable
export GITHUB_PERSONAL_ACCESS_TOKEN=ghp_your_token_here

# Add MCP server without hardcoding token
claude mcp add shadcn -- bunx -y @jpisnice/shadcn-ui-mcp-server
```

## 🐛 Troubleshooting

### Claude Code Not Recognizing MCP Server

1. **Verify server runs standalone**:
   ```bash
   npx @jpisnice/shadcn-ui-mcp-server --help
   ```

2. **Check command syntax**:
   - Ensure proper spacing and quotes
   - Verify GitHub token is valid

3. **Restart Claude Code** after adding MCP server

4. **Check Claude Code logs** for error messages

### Common Issues

**"Command not found"**:
```bash
# Ensure npx is available
npx --version
```

**"Rate limit exceeded"**:
```bash
# Add GitHub token to command
```

**"MCP server not recognized"**:
- Restart Claude Code
- Check command syntax
- Verify token is valid

## 🔗 Next Steps

- [Usage Examples](../usage/) - How to use after integration
- [Troubleshooting](../troubleshooting/) - Common issues and solutions
- [API Reference](../api/) - Complete tool reference
- [Other Integrations](README.md) - Connect to other tools 
