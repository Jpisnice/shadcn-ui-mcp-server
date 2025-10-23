import express from "express"
import cors from "cors"
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js"
import { Server } from "@modelcontextprotocol/sdk/server/index.js"
import { logInfo, logError, logWarning } from "../utils/logger.js"

export interface SSETransportOptions {
  port?: number
  host?: string
  corsOrigin?: string | string[] | boolean
  path?: string
}

export class SSETransportManager {
  private app: express.Application
  private server: any
  private transports: Map<string, SSEServerTransport> = new Map()
  private mcpServer?: Server

  constructor(private options: SSETransportOptions = {}) {
    this.app = express()
    this.setupMiddleware()
    this.setupRoutes()
  }

  private setupMiddleware() {
    this.app.use(cors({
      origin: this.options.corsOrigin || true,
      credentials: true,
      methods: ['GET', 'POST', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
    }))

    this.app.use(express.json())
    this.app.use((req, res, next) => {
      logInfo(`${req.method} ${req.path} - ${req.ip}`)
      next()
    })
  }

  private setupRoutes() {
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        activeConnections: this.transports.size,
        serverInfo: this.mcpServer ? {
          name: (this.mcpServer as any)._serverInfo?.name,
          version: (this.mcpServer as any)._serverInfo?.version
        } : null
      })
    })

    this.app.get(this.options.path || '/sse', async (req, res) => {
      try {
        if (!this.mcpServer) {
          res.status(503).json({ error: 'MCP server not initialized' })
          return
        }

        // Create transport with sessionId-based endpoint
        const transport = new SSEServerTransport('/message', res, {
          allowedOrigins: this.options.corsOrigin === true ? undefined :
                          Array.isArray(this.options.corsOrigin) ? this.options.corsOrigin :
                          this.options.corsOrigin ? [this.options.corsOrigin] : undefined,
          enableDnsRebindingProtection: false
        })

        const connectionId = transport.sessionId
        this.transports.set(connectionId, transport)
        logInfo(`SSE connection established: ${connectionId}`)

        // Create a new server instance for each connection to avoid conflicts
        const { createServer } = await import('./createServer.js')
        const { setupHandlers } = await import('./handler.js')
        const { readVersion } = await import('./version.js')

        const version = await readVersion("1.0.3")
        const connectionServer = createServer(version)
        setupHandlers(connectionServer)

        // Connect the new server instance to this transport
        await connectionServer.connect(transport)

        req.on('close', () => {
          this.transports.delete(connectionId)
          logInfo(`SSE connection closed: ${connectionId}`)
          transport.close()
        })

        req.on('error', (error) => {
          logError(`SSE connection error for ${connectionId}`, error)
          this.transports.delete(connectionId)
          transport.close()
        })

      } catch (error) {
        logError('Failed to establish SSE connection', error as Error)
        if (!res.headersSent) {
          res.status(500).json({ error: 'Failed to establish SSE connection' })
        }
      }
    })

    // Handle POST messages for SSE transport
    this.app.post('/message', async (req, res) => {
      try {
        // Try multiple ways to get session ID
        let sessionId = req.headers['x-mcp-session-id'] as string
        if (!sessionId) {
          sessionId = req.query.sessionId as string
        }
        if (!sessionId) {
          sessionId = req.body?.sessionId as string
        }

        logInfo(`POST /message - SessionId: ${sessionId}, Active sessions: ${Array.from(this.transports.keys()).join(', ')}`)

        if (!sessionId) {
          res.status(400).json({ error: 'No session ID provided' })
          return
        }

        const transport = this.transports.get(sessionId)

        if (!transport) {
          res.status(404).json({ error: `Session not found: ${sessionId}` })
          return
        }

        await transport.handlePostMessage(req, res, req.body)
      } catch (error) {
        logError('Failed to handle POST message', error as Error)
        if (!res.headersSent) {
          res.status(500).json({ error: 'Failed to handle message' })
        }
      }
    })

    this.app.get('/connections', (req, res) => {
      res.json({
        total: this.transports.size,
        connections: Array.from(this.transports.keys())
      })
    })
  }

  setMcpServer(server: Server) {
    this.mcpServer = server
  }

  async start(): Promise<void> {
    const port = this.options.port || 7423
    const host = this.options.host || '0.0.0.0'

    return new Promise((resolve, reject) => {
      this.server = this.app.listen(port, host, () => {
        logInfo(`SSE server listening on ${host}:${port}`)
        logInfo(`Health check available at http://${host}:${port}/health`)
        logInfo(`SSE endpoint available at http://${host}:${port}${this.options.path || '/sse'}`)
        resolve()
      })

      this.server.on('error', (error: Error) => {
        logError('SSE server error', error)
        reject(error)
      })
    })
  }

  async stop(): Promise<void> {
    if (this.server) {
      return new Promise((resolve) => {
        this.server.close(() => {
          logInfo('SSE server stopped')
          resolve(undefined)
        })
      })
    }
  }

  getActiveConnections(): number {
    return this.transports.size
  }

  getApp(): express.Application {
    return this.app
  }
}