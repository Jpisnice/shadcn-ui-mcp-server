# VS Code Integration

Integrate the shadcn/ui MCP Server with VS Code for seamless component access.

## 🚀 Quick Setup

### Method 1: Using Continue Extension (Recommended)

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
        "args": [
          "@jpisnice/shadcn-ui-mcp-server",
          "--github-api-key",
          "ghp_your_token_here"
        ]
      }
    }
  }
}
```

### Method 2: Using Claude Extension

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
    }
  }
}
```

### Method 3: Using native VSCode MCP Servers (works with Copilot Chat)

1. **Configure MCP Server**:
   - <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>P</kbd>
   - Search for "MCP: Add Server..."
   - Choose "NPM Package"
   - Paste this repo name \ npm package `@jpisnice/shadcn-ui-mcp-server`
   - It will ask automatically about:
     - How it should be installed (global, remote (WSL for example), workspace-only)
     - GitHub API Token
     - Framework
     - Transport Mode

Your VSCode MCP Server configuration (`mcp.json`) should look like:

```json
{
	"servers": {
		"shadcn-ui-mcp-server": {
			"command": "npx",
			"args": [
				"@jpisnice/shadcn-ui-mcp-server@2.0.0",
				"--fremaework",
				"react",
				"--ui-library",
				"radix"
			],
			"env": {
				"GITHUB_PERSONAL_ACCESS_TOKEN": "${input:github_token}"
			},
			"type": "stdio"
		}
	},
	"inputs": [
		{
			"id": "github_token",
			"type": "promptString",
			"description": "GitHub Personal Access Token (optional, recommended for higher rate limits)"
		}
	]
}
```

## 🎨 Framework-Specific Configurations

### React (Default)

```json
{
  "continue.server": {
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
}
```

### Svelte

```json
{
  "continue.server": {
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
}
```

### Vue

```json
{
  "continue.server": {
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
}
```

### React Native

```json
{
  "continue.server": {
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
}
```

## 🔧 Multiple Framework Setup

You can configure multiple frameworks simultaneously:

```json
{
  "continue.server": {
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
}
```

## 🎯 Usage Examples

### With Continue Extension

1. **Open Continue Chat** (Ctrl+Shift+L)
2. **Ask for components**:
   ```
   "Show me the shadcn/ui button component"
   "Get the dashboard-01 block"
   "List all available components"
   ```

### With Claude Extension

1. **Open Claude Chat** (Ctrl+Shift+L)
2. **Request components**:
   ```
   "Show me the React button component source code"
   "Get the Svelte card component demo"
   "Compare Vue and React button implementations"
   ```

## 🔍 Environment Variable Setup

Instead of hardcoding your token, use environment variables:

```json
{
  "continue.server": {
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
}
```

## 🐛 Troubleshooting

### Extension Not Working

1. **Check if server runs standalone**:
   ```bash
   npx @jpisnice/shadcn-ui-mcp-server --help
   ```

2. **Verify configuration syntax**:
   - Use a JSON validator
   - Check for missing commas or brackets

3. **Restart VS Code** after configuration changes

4. **Check extension logs**:
   - Open Output panel (View → Output)
   - Select "Continue" or "Claude" from dropdown

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

**"Extension not recognizing MCP server"**:
- Restart VS Code
- Check configuration file location
- Verify JSON syntax

## 🔗 Next Steps

- [Usage Examples](../usage/) - How to use after integration
- [Troubleshooting](../troubleshooting/) - Common issues and solutions
- [API Reference](../api/) - Complete tool reference
- [Other Integrations](README.md) - Connect to other tools 
