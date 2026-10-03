# First Steps

Now that you have the shadcn/ui MCP Server installed, let's make your first component request!

## 🚀 Quick Test

### 1. Start the Server

```bash
# Basic start (React framework)
npx @jpisnice/shadcn-ui-mcp-server

# With GitHub token (recommended)
npx @jpisnice/shadcn-ui-mcp-server --github-api-key ghp_your_token_here

# Different framework
npx @jpisnice/shadcn-ui-mcp-server --framework svelte --github-api-key ghp_your_token_here
npx @jpisnice/shadcn-ui-mcp-server --framework vue --github-api-key ghp_your_token_here
npx @jpisnice/shadcn-ui-mcp-server --framework react-native --github-api-key ghp_your_token_here
```

### 2. Verify Server is Running

You should see output like:
```
INFO: MCP Server starting...
INFO: Framework set to 'react' via command line argument
INFO: MCP Server configured for REACT framework
INFO: Repository: shadcn-ui/ui
INFO: File extension: .tsx
INFO: MCP Server ready
```

## 🎯 Your First Component Request

Once the server is running, you can ask your AI assistant to:

### Get a Component

```
"Show me the source code for the shadcn/ui button component"
```

### List Available Components

```
"List all available shadcn/ui components"
```

### Get Component Demo

```
"Show me how to use the shadcn/ui card component"
```

### Get Component Metadata

```
"What are the dependencies for the shadcn/ui dialog component?"
```

## 🏗️ Working with Blocks

### Get a Complete Block

```
"Get the dashboard-01 block implementation"
```

### List Available Blocks

```
"Show me all available shadcn/ui blocks"
```

### Get Block with Components

```
"Get the dashboard-01 block with all its component files"
```

## 🔍 Exploring the Repository

### Browse Directory Structure

```
"Show me the structure of the shadcn/ui repository"
```

### Explore Specific Paths

```
"Show me the components directory structure"
```

## 💡 Example Conversations

### Building a Login Form

**You**: "Help me build a login form using shadcn/ui components"

**AI Assistant**: *Can now access all form-related components, their source code, and usage examples*

### Creating a Dashboard

**You**: "Create a dashboard using shadcn/ui components. Use the dashboard-01 block as a starting point"

**AI Assistant**: *Can retrieve the complete dashboard block and customize it for your needs*

### Component Comparison

**You**: "Compare the button component implementations between React and Svelte"

**AI Assistant**: *Can switch frameworks and show you both implementations*

## 🔧 Integration Examples

### VS Code with Continue Extension

1. **Install Continue Extension** in VS Code
2. **Configure MCP Server** in settings
3. **Ask questions** directly in your editor

### Claude Desktop

1. **Add MCP Server** to Claude Desktop configuration
2. **Start conversation** with Claude
3. **Request components** naturally

### Cursor

1. **Configure MCP Server** in Cursor settings
2. **Use AI features** with shadcn/ui access
3. **Generate code** with proper components

## 🎨 Framework-Specific Examples

### React (Default)

```
"Show me the React button component with TypeScript"
"Get the React card component demo"
"List all React components available"
```

### Svelte

```
"Show me the Svelte button component"
"Get the Svelte card component with usage examples"
"Compare Svelte and React button implementations"
```

### Vue

```
"Show me the Vue button component"
"Get the Vue card component demo"
"List all Vue components available"
```

### React Native

```
"Show me the React Native button component"
"List all React Native components available"
"Get the React Native input component metadata"
```

## 🔗 Next Steps

- [Integration](../integration/) - Connect to your preferred editor or tool
- [Usage Examples](../usage/) - More detailed examples and tutorials
- [API Reference](../api/) - Complete tool reference
- [Troubleshooting](../troubleshooting/) - Common issues and solutions

## 🎯 Success Indicators

You'll know it's working when:

- ✅ Server starts without errors
- ✅ AI assistant can retrieve component source code
- ✅ Component code includes proper imports and dependencies
- ✅ Framework-specific syntax is correct
- ✅ Blocks include all necessary component files

## 🐛 Common First-Time Issues

### Server Won't Start
```bash
# Check Node.js version
node --version  # Should be 20+

# Check if npx is available
npx --version
```

### Rate Limit Errors
```bash
# Add GitHub token
npx @jpisnice/shadcn-ui-mcp-server --github-api-key ghp_your_token_here
```

### Component Not Found
```bash
# Check available components first
# Ask AI assistant: "List all available components"
```

### Framework Issues
```bash
# Verify framework selection
npx @jpisnice/shadcn-ui-mcp-server --framework svelte --help
``` 
