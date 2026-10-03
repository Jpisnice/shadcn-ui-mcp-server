# Continue.dev Integration

Integrate the shadcn/ui MCP Server with Continue.dev for enhanced AI-powered development.

## 🚀 Quick Setup

### Method 1: Application Settings

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
  "args": [
    "@jpisnice/shadcn-ui-mcp-server",
    "--github-api-key",
    "ghp_your_token_here"
  ]
}
```

### Method 2: Configuration File

Add to your Continue.dev configuration file:

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

## 🎨 Framework-Specific Configurations

### React (Default)

```json
{
  "name": "shadcn-ui",
  "command": "npx",
  "args": [
    "@jpisnice/shadcn-ui-mcp-server",
    "--github-api-key",
    "ghp_your_token_here"
  ]
}
```

### Svelte

```json
{
  "name": "shadcn-ui-svelte",
  "command": "npx",
  "args": [
    "@jpisnice/shadcn-ui-mcp-server",
    "--framework",
    "svelte",
    "--github-api-key",
    "ghp_your_token_here"
  ]
}
```

### Vue

```json
{
  "name": "shadcn-ui-vue",
  "command": "npx",
  "args": [
    "@jpisnice/shadcn-ui-mcp-server",
    "--framework",
    "vue",
    "--github-api-key",
    "ghp_your_token_here"
  ]
}
```

### React Native

```json
{
  "name": "shadcn-ui-react-native",
  "command": "npx",
  "args": [
    "@jpisnice/shadcn-ui-mcp-server",
    "--framework",
    "react-native",
    "--github-api-key",
    "ghp_your_token_here"
  ]
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

### Component Development

```
"Show me the shadcn/ui button component source code"
"Get the card component with usage examples"
"List all available shadcn/ui components"
```

### Block Implementation

```
"Get the dashboard-01 block implementation"
"Show me the dashboard-01 block with all components"
"List all available shadcn/ui blocks"
```

### Code Generation

```
"Generate a login form using shadcn/ui components"
"Create a dashboard with shadcn/ui blocks"
"Show me how to use the dialog component"
```

### Framework Comparison

```
"Compare the button component between React and Svelte"
"Show me the Vue version of the card component"
"Get the React form component with TypeScript"
```

## 🔍 Environment Variable Setup

Use environment variables for better security:

```json
{
  "name": "shadcn-ui",
  "command": "npx",
  "args": ["@jpisnice/shadcn-ui-mcp-server"],
  "env": {
    "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_your_token_here"
  }
}
```

## 🐛 Troubleshooting

### Continue.dev Not Recognizing MCP Server

1. **Verify server runs standalone**:
   ```bash
   npx @jpisnice/shadcn-ui-mcp-server --help
   ```

2. **Check configuration syntax**:
   - Validate JSON format
   - Check for missing commas or brackets

3. **Restart Continue.dev** after configuration changes

4. **Check Continue.dev logs** for error messages

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

**"MCP server not recognized"**:
- Restart Continue.dev
- Check configuration file location
- Verify JSON syntax

## 🔗 Next Steps

- [Usage Examples](../usage/) - How to use after integration
- [Troubleshooting](../troubleshooting/) - Common issues and solutions
- [API Reference](../api/) - Complete tool reference
- [Other Integrations](README.md) - Connect to other tools 
