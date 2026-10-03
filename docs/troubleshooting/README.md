# Troubleshooting

Common issues and solutions for the shadcn/ui MCP Server.

## 🐛 Common Issues

- [Installation Issues](installation-issues.md) - Problems with installation and setup
- [Rate Limit Issues](rate-limit-issues.md) - GitHub API rate limiting problems
- [Framework Issues](framework-issues.md) - Framework-specific problems
- [Integration Issues](integration-issues.md) - Editor and tool integration problems
- [Network Issues](network-issues.md) - Connection and proxy problems

## 🚨 Quick Fixes

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
# Verify framework selection: the startup log names the active framework
npx @jpisnice/shadcn-ui-mcp-server --framework svelte
# INFO: MCP Server configured for SVELTE framework
```

### Client Can't Connect After Upgrading to 3.0.0

- **`-32022 Unsupported protocol version`**: the client uses the legacy
  (2025-era) protocol and the server runs with `--protocol modern`. Use
  `--protocol any` (the default) or switch the client to the modern protocol.
  See the [Modern Protocol Guide](../getting-started/modern-protocol.md).
- **`404` on `/sse`**: the legacy SSE transport was removed. Point the client
  at `http://<host>:7423/mcp` and use the `http` transport.
- **Node.js errors on startup**: version 3.0.0 requires Node.js 20 or newer.

## 🔧 Logs

The server writes its logs (startup info, warnings, errors) to **stderr**:

- **stdio**: your MCP client captures stderr in its server logs (for example
  the MCP logs of Claude Desktop or Claude Code).
- **HTTP mode**: logs appear in the terminal, or via `docker logs shadcn-mcp-server`.

MCP protocol logging (`notifications/message`) isn't used, because the
2026-07-28 spec deprecates it.

## 📞 Getting Help

- 🐛 [Report Issues](https://github.com/Jpisnice/shadcn-ui-mcp-server/issues)
- 💬 [Discussions](https://github.com/Jpisnice/shadcn-ui-mcp-server/discussions)
- 📖 [Documentation](https://github.com/Jpisnice/shadcn-ui-mcp-server#readme)

## 🔗 Next Steps

- [Installation Issues](installation-issues.md) - Detailed installation troubleshooting
- [Rate Limit Issues](rate-limit-issues.md) - GitHub API problems
- [Framework Issues](framework-issues.md) - Framework-specific problems
- [Integration Issues](integration-issues.md) - Editor integration problems 