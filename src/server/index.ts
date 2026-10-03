import {
  validateFrameworkSelection,
  getAxiosImplementation,
} from "../utils/framework.js"
import { logError, logInfo, logWarning } from "../utils/logger.js"
import { parseArgs } from "../cli/args.js"
import { readVersion } from "../server/version.js"
import { createServerFactory } from "../server/createServer.js"
import { TransportManager, resolveTransportMode, resolveProtocolPolicy } from "./transport.js"

export async function start() {
  try {
    logInfo("Starting Shadcn UI MCP Server...")

    const { githubApiKey, mode = 'stdio', port, host, cors, protocol } = parseArgs()

    validateFrameworkSelection()

    const axios = await getAxiosImplementation()
    if (githubApiKey) {
      axios.setGitHubApiKey(githubApiKey)
      logInfo("GitHub API configured with token")
    } else {
      logWarning("No GitHub API key provided. Rate limited to 60 requests/hour.")
    }

    const version = await readVersion("1.0.3")
    const serverFactory = createServerFactory(version)

    const transportManager = new TransportManager({
      mode: resolveTransportMode(mode),
      protocol: resolveProtocolPolicy(protocol),
      http: {
        port: port ? parseInt(port) : 7423,
        host: host || '0.0.0.0',
        corsOrigin: cors ? cors.split(',') : true,
        path: '/mcp'
      }
    })

    await transportManager.initialize(serverFactory, { name: "shadcn-ui-mcp-server", version })

    const status = transportManager.getStatus()
    logInfo(`Server started successfully - Mode: ${status.mode}`)
    logInfo(`Protocol: ${status.protocol === 'modern' ? '2026-07-28 only (2025-era clients rejected)' : '2026-07-28 with 2025-era fallback'}`)

    if (status.http.active) {
      logInfo(`MCP endpoint: http://${host || '0.0.0.0'}:${port || 7423}/mcp`)
    }

    process.on('SIGINT', async () => {
      logInfo("Shutting down server...")
      await transportManager.shutdown()
      process.exit(0)
    })

    process.on('SIGTERM', async () => {
      logInfo("Shutting down server...")
      await transportManager.shutdown()
      process.exit(0)
    })

  } catch (error) {
    logError("Failed to start server", error as Error)
    process.exit(1)
  }
}