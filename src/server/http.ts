import express from "express"
import cors from "cors"
import type { Server as HttpServer } from "node:http"
import { createMcpHandler, type McpHttpHandler, type McpServerFactory } from "@modelcontextprotocol/server"
import { toNodeHandler, localhostHostValidation, localhostOriginValidation } from "@modelcontextprotocol/node"
import { logInfo, logError } from "../utils/logger.js"

function isLoopbackHost(host?: string) {
  return host === "127.0.0.1" || host === "localhost" || host === "::1"
}

export interface HttpTransportOptions {
  port?: number
  host?: string
  corsOrigin?: string | string[] | boolean
  path?: string
  /** Reject 2025-era requests and serve only the 2026-07-28 revision */
  modernOnly?: boolean
}

/**
 * Serves MCP over Streamable HTTP at a single endpoint (default `/mcp`).
 *
 * Uses the SDK v2 `createMcpHandler`, which serves the stateless 2026-07-28
 * protocol revision per request and falls back to stateless serving for
 * 2025-era clients. There are no sessions to track.
 */
export class HttpTransportManager {
  private app: express.Application
  private httpServer?: HttpServer
  private mcpHandler?: McpHttpHandler
  private serverInfo?: { name: string; version: string }

  constructor(private options: HttpTransportOptions = {}) {
    this.app = express()
    this.setupMiddleware()
    this.setupHealthRoute()
  }

  private get path() {
    return this.options.path || "/mcp"
  }

  private setupMiddleware() {
    this.app.use(cors({
      origin: this.options.corsOrigin || true,
      credentials: true,
      // POST carries MCP traffic; GET is only used by /health. Sessions,
      // resumability (Last-Event-ID) and DELETE were removed in 2026-07-28.
      methods: ["GET", "POST", "OPTIONS"],
      allowedHeaders: [
        "Content-Type",
        "Authorization",
        "Accept",
        "Mcp-Protocol-Version",
        "Mcp-Method",
        "Mcp-Name",
      ],
      exposedHeaders: ["Mcp-Protocol-Version"],
    }))

    // DNS rebinding protection for local servers: when bound to loopback, only
    // accept localhost Host and Origin headers. createMcpHandler performs no
    // validation itself. Servers bound to other interfaces (e.g. 0.0.0.0 in
    // Docker) rely on CORS and the network boundary instead.
    if (isLoopbackHost(this.options.host)) {
      const validHost = localhostHostValidation()
      const validOrigin = localhostOriginValidation()
      this.app.use((req, res, next) => {
        if (validHost(req, res) && validOrigin(req, res)) next()
      })
    }

    this.app.use(express.json({ limit: "4mb" }))
    this.app.use((req, res, next) => {
      logInfo(`${req.method} ${req.path} - ${req.ip}`)
      next()
    })
  }

  private setupHealthRoute() {
    this.app.get("/health", (req, res) => {
      res.json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        transport: "streamable-http",
        endpoint: this.path,
        protocol: this.options.modernOnly ? "2026-07-28" : "2026-07-28, 2025-era fallback",
        serverInfo: this.serverInfo ?? null,
      })
    })
  }

  setServerFactory(factory: McpServerFactory, serverInfo: { name: string; version: string }) {
    this.serverInfo = serverInfo
    this.mcpHandler = createMcpHandler(factory, {
      legacy: this.options.modernOnly ? "reject" : "stateless",
      onerror: (error: Error) => logError("MCP HTTP handler error", error),
    })

    const nodeHandler = toNodeHandler(this.mcpHandler, {
      onerror: (error: Error) => logError("MCP HTTP adapter error", error),
    })

    this.app.all(this.path, (req, res) => {
      nodeHandler(req, res, req.body).catch((error: Error) => {
        logError("Failed to handle MCP request", error)
        if (!res.headersSent) {
          res.status(500).json({ error: "Failed to handle MCP request" })
        }
      })
    })
  }

  async start(): Promise<void> {
    const port = this.options.port || 7423
    const host = this.options.host || "0.0.0.0"

    return new Promise((resolve, reject) => {
      this.httpServer = this.app.listen(port, host, () => {
        logInfo(`HTTP server listening on ${host}:${port}`)
        logInfo(`Health check available at http://${host}:${port}/health`)
        logInfo(`MCP endpoint available at http://${host}:${port}${this.path}`)
        resolve()
      })

      this.httpServer.on("error", (error: Error) => {
        logError("HTTP server error", error)
        reject(error)
      })
    })
  }

  async stop(): Promise<void> {
    await this.mcpHandler?.close()
    if (this.httpServer) {
      return new Promise((resolve) => {
        this.httpServer!.close(() => {
          logInfo("HTTP server stopped")
          resolve()
        })
      })
    }
  }

  getApp(): express.Application {
    return this.app
  }
}
