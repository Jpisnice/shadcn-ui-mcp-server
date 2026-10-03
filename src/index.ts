#!/usr/bin/env node
import { start } from "./server/index.js"
import { readVersion } from "./server/version.js"
import { logError } from "./utils/logger.js"

const HELP = `shadcn-ui-mcp-server: MCP server for shadcn/ui v4 components, blocks and themes

Usage: shadcn-mcp [options]

Options:
  --github-api-key, -g <token>  GitHub Personal Access Token (5000 req/hour instead of 60)
  --framework, -f <name>        react (default), svelte, vue or react-native
  --ui-library <name>           radix (default) or base (React only)
  --mode, -m <mode>             stdio (default), http or dual
  --port, -p <port>             HTTP port (default: 7423)
  --host, -h <host>             HTTP bind address (default: 0.0.0.0)
  --cors <origins>              Comma-separated allowed CORS origins (default: all)
  --protocol <policy>           any (default): 2026-07-28 plus 2025-era clients
                                modern: 2026-07-28 only
  --help                        Show this help
  --version, -v                 Show the version

Environment variables:
  GITHUB_PERSONAL_ACCESS_TOKEN, FRAMEWORK, UI_LIBRARY, MCP_TRANSPORT_MODE,
  MCP_PORT, MCP_HOST, MCP_CORS_ORIGINS, MCP_PROTOCOL

Examples:
  shadcn-mcp --github-api-key ghp_xxx
  shadcn-mcp --framework svelte
  shadcn-mcp --mode http --port 7423     # Streamable HTTP at http://localhost:7423/mcp
`

const argv = process.argv.slice(2)

if (argv.includes("--help")) {
  process.stdout.write(HELP)
  process.exit(0)
}

if (argv.includes("--version") || argv.includes("-v")) {
  readVersion().then((version) => {
    process.stdout.write(`${version}\n`)
    process.exit(0)
  })
} else {
  start().catch((error: Error) => {
    logError("Unhandled startup error", error)
    process.exit(1)
  })
}
