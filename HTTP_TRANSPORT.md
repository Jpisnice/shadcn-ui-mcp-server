# HTTP Transport & Docker Guide

## Overview

Besides stdio, the server can be reached over **Streamable HTTP** at a single
`/mcp` endpoint. It is built on MCP TypeScript SDK v2 and speaks the
**2026-07-28** protocol revision, while still serving 2025-era clients
(protocol versions 2024-10-07 through 2025-11-25).

The 2026-07-28 revision is stateless: there are no sessions, and every request
carries its own protocol version, client info, and capabilities. Any request can
be served by any instance, so no sticky sessions or shared session store are
needed when scaling out.

> **Migrating from the SSE transport:** the legacy HTTP+SSE transport
> (`GET /sse` + `POST /message`) was removed in SDK v2 and is no longer served.
> Point clients at `/mcp` instead. `--mode sse` / `MCP_TRANSPORT_MODE=sse` still
> works as a deprecated alias for `http` and logs a warning. The `/connections`
> endpoint was removed because there are no sessions to list.

## Architecture

1. **Server factory** (`src/server/createServer.ts`): `createServerFactory()`
   builds a configured low-level `Server` with all handlers registered. The SDK
   calls it once per stdio connection or once per HTTP request.
2. **HttpTransportManager** (`src/server/http.ts`): an Express app that mounts
   the SDK's `createMcpHandler(factory)` at `/mcp` (via `toNodeHandler` from
   `@modelcontextprotocol/node`) and exposes `/health`.
3. **TransportManager** (`src/server/transport.ts`): selects stdio, HTTP, or
   both. stdio uses the SDK's `serveStdio(factory)`, which negotiates the
   protocol era on the first message.
4. **CLI arguments** (`src/cli/args.ts`): `--mode`, `--port`, `--host`, `--cors`
   and their environment variables.

## Transport Modes

```bash
# stdio (default)
node build/index.js

# Streamable HTTP at http://localhost:7423/mcp
node build/index.js --mode http --port 7423 --host 0.0.0.0

# Both stdio and HTTP
node build/index.js --mode dual --port 7423
```

### Connecting a client

```bash
claude mcp add --scope user --transport http shadcn-mcp-server http://localhost:7423/mcp
```

For local debugging, use the MCP Inspector and choose the "Streamable HTTP"
transport:

```bash
npx @modelcontextprotocol/inspector
```

## Environment Variables

- `MCP_TRANSPORT_MODE`: `stdio` | `http` | `dual` (`sse` is a deprecated alias for `http`)
- `MCP_PORT`: HTTP port (default: 7423, which spells SHADCN on a phone keypad)
- `MCP_HOST`: host binding (default: 0.0.0.0)
- `MCP_CORS_ORIGINS`: allowed CORS origins (comma-separated; default allows all)
- `MCP_PROTOCOL`: `any` (default) serves 2026-07-28 clients and 2025-era
  clients; `modern` accepts only 2026-07-28 and answers 2025-era requests with
  `-32022 Unsupported protocol version`. CLI: `--protocol`. See the
  [Modern Protocol Guide](docs/getting-started/modern-protocol.md).
- `GITHUB_PERSONAL_ACCESS_TOKEN`: GitHub API token

## Endpoints

### `POST /mcp`

The MCP endpoint. Clients send JSON-RPC requests here; `GET` and `DELETE`
return `405`, because 2026-07-28 removed the standalone GET stream and
sessions.

A **2026-07-28** request carries its protocol version and capabilities in
`_meta`, and must send matching `MCP-Protocol-Version` and `Mcp-Method`
headers (a mismatch returns `-32020`):

```bash
curl -s -X POST http://localhost:7423/mcp \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  -H 'MCP-Protocol-Version: 2026-07-28' \
  -H 'Mcp-Method: server/discover' \
  -d '{"jsonrpc":"2.0","id":1,"method":"server/discover","params":{"_meta":{"io.modelcontextprotocol/protocolVersion":"2026-07-28","io.modelcontextprotocol/clientCapabilities":{},"io.modelcontextprotocol/clientInfo":{"name":"curl","version":"1"}}}}'
```

A **2025-era** client sends `initialize` and is served statelessly (rejected
with `-32022` when running with `--protocol modern`):

```bash
curl -s -X POST http://localhost:7423/mcp \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-11-25","capabilities":{},"clientInfo":{"name":"curl","version":"1"}}}'
```

### `GET /health`

```json
{
  "status": "healthy",
  "timestamp": "2026-10-03T12:00:00.000Z",
  "transport": "streamable-http",
  "endpoint": "/mcp",
  "protocol": "2026-07-28, 2025-era fallback",
  "serverInfo": { "name": "shadcn-ui-mcp-server", "version": "3.0.0" }
}
```

## Docker

```bash
# Build and start
docker-compose up --build -d

# Health check
curl http://localhost:7423/health

# With the nginx reverse proxy (production profile)
docker-compose --profile production up -d
```

The image uses Node 22 (SDK v2 requires Node 20+), runs as a non-root user, and
defaults to `MCP_TRANSPORT_MODE=http`. `nginx.conf` proxies `/mcp` with response
buffering disabled, because responses may be streamed as SSE.

## Security Notes

1. **CORS**: configure with `--cors` / `MCP_CORS_ORIGINS`. The default allows
   any origin, so restrict it for public deployments.
2. **No built-in auth**: the endpoint is unauthenticated. Put it behind a
   reverse proxy or network boundary if exposed beyond localhost.
3. **Input validation**: tool arguments are validated and sanitized before
   handlers run.
4. **Non-root container**: the Docker image runs as an unprivileged user.

## Scaling

Because the 2026-07-28 protocol and the 2025-era fallback are both served
statelessly, instances need no shared state. Scale horizontally behind any load
balancer without session affinity, and use `/health` for readiness checks.

On 2026-07-28 responses the server also sends cache hints: list results
(`tools/list`, `prompts/list`, `resources/list`, `resources/templates/list`)
are cacheable for 1 hour and `resources/read` for 10 minutes, all with
`cacheScope: "public"`. Clients and shared caches can reuse them instead of
re-requesting.

## Troubleshooting

1. **Port conflicts**: change the port with `--port` or `MCP_PORT`.
2. **CORS errors**: set `--cors` / `MCP_CORS_ORIGINS` to include the browser origin.
3. **404 on `/sse`**: the legacy SSE transport was removed. Use `/mcp`.
4. **Node version errors**: SDK v2 requires Node 20 or newer.
