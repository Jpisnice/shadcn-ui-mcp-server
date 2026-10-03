# Claude Desktop Integration

Integrate the shadcn/ui MCP Server with Claude Desktop for seamless component access.

## 🚀 Quick Setup

### Method 1: Configuration File

Add to your Claude Desktop configuration (`~/.config/Claude/claude_desktop_config.json`):

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

### Method 2: Environment Variable

```json
{
  "mcpServers": {
    "shadcn-ui": {
      "command": "npx",
      "args": ["@jpisnice/shadcn-ui-mcp-server"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_your_token_here"
      }
    }
  }
}
```

## 🎨 Framework-Specific Configurations

### React (Default)

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

### Svelte

```json
{
  "mcpServers": {
    "shadcn-ui-svelte": {
      "command": "npx",
      "args": [
        "@jpisnice/shadcn-ui-mcp-server",
        "--framework",
        "svelte",
        "--github-api-key",
        "ghp_your_token_here"
      ]
    }
  }
}
```

### Vue

```json
{
  "mcpServers": {
    "shadcn-ui-vue": {
      "command": "npx",
      "args": [
        "@jpisnice/shadcn-ui-mcp-server",
        "--framework",
        "vue",
        "--github-api-key",
        "ghp_your_token_here"
      ]
    }
  }
}
```

### React Native

```json
{
  "mcpServers": {
    "shadcn-ui-react-native": {
      "command": "npx",
      "args": [
        "@jpisnice/shadcn-ui-mcp-server",
        "--framework",
        "react-native",
        "--github-api-key",
        "ghp_your_token_here"
      ]
    }
  }
}
```

## 🔧 Multiple Framework Setup

Configure multiple frameworks for comparison:

```json
{
  "mcpServers": {
    "shadcn-ui-react": {
      "command": "npx",
      "args": [
        "@jpisnice/shadcn-ui-mcp-server",
        "--framework",
        "react",
        "--github-api-key",
        "ghp_your_token_here"
      ]
    },
    "shadcn-ui-svelte": {
      "command": "npx",
      "args": [
        "@jpisnice/shadcn-ui-mcp-server",
        "--framework",
        "svelte",
        "--github-api-key",
        "ghp_your_token_here"
      ]
    },
    "shadcn-ui-vue": {
      "command": "npx",
      "args": [
        "@jpisnice/shadcn-ui-mcp-server",
        "--framework",
        "vue",
        "--github-api-key",
        "ghp_your_token_here"
      ]
    },
    "shadcn-ui-react-native": {
      "command": "npx",
      "args": [
        "@jpisnice/shadcn-ui-mcp-server",
        "--framework",
        "react-native",
        "--github-api-key",
        "ghp_your_token_here"
      ]
    }
  }
}
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

## 🔍 Configuration File Location

### macOS
```
~/Library/Application Support/Claude/claude_desktop_config.json
```

### Linux
```
~/.config/Claude/claude_desktop_config.json
```

### Windows
```
%APPDATA%\Claude\claude_desktop_config.json
```

## 🐛 Troubleshooting

### Claude Desktop Not Recognizing MCP Server

1. **Verify server runs standalone**:
   ```bash
   npx @jpisnice/shadcn-ui-mcp-server --help
   ```

2. **Check configuration file location**:
   - Ensure file is in the correct directory
   - Verify file permissions

3. **Restart Claude Desktop** after configuration changes

4. **Check configuration syntax**:
   - Validate JSON format
   - Check for missing commas or brackets

### Common Issues

**"Command not found"**:
```bash
# Ensure npx is available
npx --version
```

**"Rate limit exceeded"**:
```bash
# Add GitHub token to configuration
```

**"Configuration not loaded"**:
- Check file path and permissions
- Restart Claude Desktop
- Verify JSON syntax

## 🔗 Next Steps

- [Usage Examples](../usage/) - How to use after integration
- [Troubleshooting](../troubleshooting/) - Common issues and solutions
- [API Reference](../api/) - Complete tool reference
- [Other Integrations](README.md) - Connect to other tools 
