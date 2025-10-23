import { setupHandlers } from "./handler.js"
import {
  validateFrameworkSelection,
  getAxiosImplementation,
} from "../utils/framework.js"
import { logError, logInfo, logWarning } from "../utils/logger.js"
import { parseArgs } from "../cli/args.js"
import { readVersion } from "../server/version.js"
import { createServer } from "../server/createServer.js"
import { TransportManager, TransportMode } from "./transport.js"

export async function start() {
  try {
    logInfo("Starting Shadcn UI MCP Server...")

    const { githubApiKey, mode = 'stdio', port, host, cors } = parseArgs()

    validateFrameworkSelection()

    const axios = await getAxiosImplementation()
    if (githubApiKey) {
      axios.setGitHubApiKey(githubApiKey)
      logInfo("GitHub API configured with token")
    } else {
      logWarning("No GitHub API key provided. Rate limited to 60 requests/hour.")
    }

    const version = await readVersion("1.0.3")
    const server = createServer(version)

    setupHandlers(server)

    const transportManager = new TransportManager({
      mode: mode as TransportMode,
      sse: {
        port: port ? parseInt(port) : 7423,
        host: host || '0.0.0.0',
        corsOrigin: cors ? cors.split(',') : true,
        path: '/sse'
      }
    })

    await transportManager.initialize(server)

    const status = transportManager.getStatus()
    logInfo(`Server started successfully - Mode: ${status.mode}`)

    if (status.sse.active) {
      logInfo(`SSE endpoint: http://${host || '0.0.0.0'}:${port || 7423}/sse`)
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