import { serveStdio, type StdioServerHandle } from "@modelcontextprotocol/server/stdio"
import type { McpServerFactory } from "@modelcontextprotocol/server"
import { HttpTransportManager, HttpTransportOptions } from "./http.js"
import { logInfo, logError, logWarning } from "../utils/logger.js"

export type TransportMode = 'stdio' | 'http' | 'dual'

/**
 * Which protocol eras the server accepts. `any` serves 2026-07-28 clients and
 * falls back to the 2025-era initialize handshake; `modern` accepts only the
 * 2026-07-28 revision and rejects 2025-era openings.
 */
export type ProtocolPolicy = 'any' | 'modern'

export function resolveProtocolPolicy(protocol?: string): ProtocolPolicy {
  if (!protocol || protocol === 'any') return 'any'
  if (protocol === 'modern') return 'modern'
  throw new Error(`Unsupported protocol policy: ${protocol} (expected "modern" or "any")`)
}

export interface TransportConfig {
  mode: TransportMode
  protocol?: ProtocolPolicy
  http?: HttpTransportOptions
}

/**
 * Normalizes a user-supplied transport mode. `sse` is accepted as a
 * deprecated alias for `http`: the legacy HTTP+SSE transport was removed in
 * MCP SDK v2 and replaced by Streamable HTTP.
 */
export function resolveTransportMode(mode: string): TransportMode {
  if (mode === 'sse') {
    logWarning("Transport mode 'sse' is deprecated; using 'http' (Streamable HTTP at /mcp). The legacy /sse endpoint has been removed.")
    return 'http'
  }
  if (mode === 'stdio' || mode === 'http' || mode === 'dual') {
    return mode
  }
  throw new Error(`Unsupported transport mode: ${mode}`)
}

export class TransportManager {
  private httpManager?: HttpTransportManager
  private stdioHandle?: StdioServerHandle

  constructor(private config: TransportConfig) {}

  async initialize(factory: McpServerFactory, serverInfo: { name: string; version: string }): Promise<void> {
    const { mode } = this.config

    switch (mode) {
      case 'stdio':
        this.initializeStdio(factory)
        break

      case 'http':
        await this.initializeHttp(factory, serverInfo)
        break

      case 'dual':
        await this.initializeDual(factory, serverInfo)
        break

      default:
        throw new Error(`Unsupported transport mode: ${mode}`)
    }
  }

  private initializeStdio(factory: McpServerFactory): void {
    try {
      // serveStdio negotiates the protocol era on the opening exchange:
      // 2026-07-28 clients get the stateless revision; 2025-era clients
      // (initialize handshake) are served unless the policy is 'modern'.
      this.stdioHandle = serveStdio(factory, {
        legacy: this.config.protocol === 'modern' ? 'reject' : 'serve',
      })
      logInfo("Server connected via stdio")
    } catch (error) {
      logError("Failed to initialize stdio transport", error as Error)
      throw error
    }
  }

  private async initializeHttp(factory: McpServerFactory, serverInfo: { name: string; version: string }): Promise<void> {
    try {
      this.httpManager = new HttpTransportManager({
        ...this.config.http,
        modernOnly: this.config.protocol === 'modern',
      })
      this.httpManager.setServerFactory(factory, serverInfo)

      await this.httpManager.start()
      logInfo("Transport initialized: Streamable HTTP")
    } catch (error) {
      logError("Failed to initialize HTTP transport", error as Error)
      throw error
    }
  }

  private async initializeDual(factory: McpServerFactory, serverInfo: { name: string; version: string }): Promise<void> {
    try {
      await this.initializeHttp(factory, serverInfo)

      if (process.stdin.isTTY === false) {
        this.initializeStdio(factory)
        logInfo("Dual transport mode: Both HTTP and stdio active")
      } else {
        logWarning("Dual transport mode: Only HTTP active (no stdio pipe detected)")
      }
    } catch (error) {
      logError("Failed to initialize dual transport", error as Error)
      throw error
    }
  }

  async shutdown(): Promise<void> {
    const shutdownPromises: Promise<void>[] = []

    if (this.httpManager) {
      shutdownPromises.push(this.httpManager.stop())
    }

    if (this.stdioHandle) {
      shutdownPromises.push(
        this.stdioHandle.close().catch((error) => {
          logWarning(`Error closing stdio transport: ${error}`)
        })
      )
    }

    await Promise.all(shutdownPromises)
    logInfo("All transports shutdown")
  }

  getHttpManager(): HttpTransportManager | undefined {
    return this.httpManager
  }

  getStatus() {
    return {
      mode: this.config.mode,
      protocol: this.config.protocol ?? 'any',
      http: {
        active: !!this.httpManager,
      },
      stdio: {
        active: !!this.stdioHandle
      }
    }
  }
}
