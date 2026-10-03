import { Server } from "@modelcontextprotocol/server"
import { capabilities } from "./capabilities.js"
import { setupHandlers } from "./handler.js"

const ONE_HOUR = 60 * 60 * 1000

export function createServer(version: string) {
  return new Server(
    {
      name: "shadcn-ui-mcp-server",
      title: "shadcn/ui MCP Server",
      version,
      description:
        "shadcn/ui v4 components, blocks, demos and themes for React, Svelte, Vue and React Native",
      websiteUrl: "https://github.com/Jpisnice/shadcn-ui-mcp-server",
    },
    {
      capabilities,
      // Cache policy advertised on 2026-07-28 responses (ttlMs / cacheScope).
      // Lists are static for the process lifetime; resource reads include the
      // GitHub-backed component list, so they get a shorter TTL. Nothing here
      // is per-user, so shared caches may store it.
      cacheHints: {
        'tools/list': { ttlMs: ONE_HOUR, cacheScope: 'public' },
        'prompts/list': { ttlMs: ONE_HOUR, cacheScope: 'public' },
        'resources/list': { ttlMs: ONE_HOUR, cacheScope: 'public' },
        'resources/templates/list': { ttlMs: ONE_HOUR, cacheScope: 'public' },
        'resources/read': { ttlMs: 10 * 60 * 1000, cacheScope: 'public' },
        'server/discover': { ttlMs: ONE_HOUR, cacheScope: 'public' },
      },
    }
  )
}

/**
 * Returns a factory that builds a fully configured server instance.
 * The v2 SDK entry points (serveStdio, createMcpHandler) call the factory
 * once per connection (stdio) or per request (HTTP).
 */
export function createServerFactory(version: string) {
  return () => {
    const server = createServer(version)
    setupHandlers(server)
    return server
  }
}
