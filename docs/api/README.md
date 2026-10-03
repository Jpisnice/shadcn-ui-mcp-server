# API Reference

Complete reference for the shadcn/ui MCP Server tools and capabilities.

## 🛠️ Available Tools

### Component Tools

- [get_component](get-component.md) - Get component source code
- [get_component_demo](get-component-demo.md) - Get component usage examples
- [list_components](list-components.md) - List all available components
- [get_component_metadata](get-component-metadata.md) - Get component dependencies and info

### Block Tools

- [get_block](get-block.md) - Get complete block implementations
- [list_blocks](list-blocks.md) - List all available blocks with categories

### Repository Tools

- [get_directory_structure](get-directory-structure.md) - Explore repository structure

### Theme Tools

- `list_themes` - List available tweakcn themes
- `get_theme` - Get details of a specific tweakcn theme
- `apply_theme` - Apply a tweakcn theme preset to the project (writes CSS; supports `dryRun`)

## 🧩 Protocol Features

- **MCP spec 2026-07-28**, with fallback for 2025-era clients (`--protocol any`, the default). See the [Modern Protocol Guide](../getting-started/modern-protocol.md)
- **Argument completion** for prompt and resource-template arguments (component names, package managers, build tools)
- **Cache hints** (`ttlMs` / `cacheScope`) on list and read results
- **Errors:** unknown tools, prompts and resources return `-32602`; tool execution failures return a result with `isError: true` so the model can self-correct

## 🔧 Tool Usage Examples

### Component Tools

```typescript
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

// Get component demo
{
  "tool": "get_component_demo",
  "arguments": { "componentName": "card" }
}
```

### Block Tools

```typescript
// Get dashboard block
{
  "tool": "get_block",
  "arguments": { "blockName": "dashboard-01" }
}

// List all blocks
{
  "tool": "list_blocks",
  "arguments": {}
}
```

### Repository Tools

```typescript
// Get directory structure
{
  "tool": "get_directory_structure",
  "arguments": { "path": "components" }
}
```

## 🎨 Framework Support

All tools support four frameworks:
- **React** (default) - shadcn/ui v4
- **Svelte** - shadcn-svelte
- **Vue** - shadcn-vue
- **React Native** - react-native-reusables

## 🔗 Next Steps

- [get_component](get-component.md) - Component source code tool
- [get_component_demo](get-component-demo.md) - Component demo tool
- [list_components](list-components.md) - Component listing tool
- [get_block](get-block.md) - Block implementation tool
- [list_blocks](list-blocks.md) - Block listing tool 
