# Using the Modern MCP Protocol (2026-07-28)

This server implements the [MCP 2026-07-28 specification](https://modelcontextprotocol.io/specification/2026-07-28),
the "modern" protocol. It also still serves "legacy" clients that speak the
2025-era protocol. This guide explains the difference, how to make your client
use the modern protocol, and how to require it on the server.

## Modern vs legacy

| | Legacy (2025-era) | Modern (2026-07-28) |
|---|---|---|
| Protocol versions | 2024-10-07 to 2025-11-25 | 2026-07-28 |
| Connection setup | `initialize` handshake, then a session | No handshake; optional `server/discover` probe |
| State | Negotiated once per connection | Stateless: every request carries its protocol version and capabilities in `_meta` |
| Server identity | In the `initialize` result | In every result's `_meta` |
| Caching | No cache hints | `ttlMs` / `cacheScope` on lists and reads |
| Spec status | Earlier revisions | Current revision |

Both use the same transports (stdio or Streamable HTTP). The era is chosen
per connection, independently of the transport. Over HTTP this server answers
legacy clients statelessly too, so both eras survive server restarts and need
no sticky sessions.

## Who picks the protocol?

**The client does.** By default the server accepts both eras:

- A client that opens with `initialize` gets the legacy protocol.
- A client that sends 2026-07-28 requests (or probes with `server/discover`)
  gets the modern protocol.

So to use the modern protocol, configure your **client**. To *require* it,
also configure the **server** (see below).

## Making your client use the modern protocol

### MCP Inspector

The Inspector has a protocol era setting with three choices:

- **Legacy** (default): the 2025-11-25 `initialize` handshake
- **Auto**: probes `server/discover` and falls back to legacy
- **Modern**: pins the 2026-07-28 sessionless protocol

Choose **Modern** (or **Auto**, which picks modern with this server). The
setting applies to both stdio and Streamable HTTP.

```bash
npx @modelcontextprotocol/inspector
```

### Your own client (TypeScript SDK v2)

`@modelcontextprotocol/client` v2 uses the legacy handshake unless you opt in
with `versionNegotiation`:

```ts
import { Client, StreamableHTTPClientTransport } from '@modelcontextprotocol/client';

const client = new Client(
  { name: 'my-client', version: '1.0.0' },
  // 'auto' probes and falls back to legacy; { pin: '2026-07-28' } is modern-only
  { versionNegotiation: { mode: { pin: '2026-07-28' } } }
);

await client.connect(new StreamableHTTPClientTransport(new URL('http://localhost:7423/mcp')));
console.log(client.getProtocolEra()); // 'modern'
```

The same option works with `StdioClientTransport`.

### Claude Code, Claude Desktop, Cursor and other apps

These choose the protocol themselves; there is no per-server setting.
Whether they speak 2026-07-28 depends on the app version, so check its release
notes. To find out, run the server in modern-only mode (next section). If the
app still connects, it is using the modern protocol.

### Raw HTTP

A 2026-07-28 request carries the protocol version in both the `_meta`
envelope and the `MCP-Protocol-Version` header, plus an `Mcp-Method` header.
The values must match, or the server returns `-32020`.

```bash
curl -s -X POST http://localhost:7423/mcp \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  -H 'MCP-Protocol-Version: 2026-07-28' \
  -H 'Mcp-Method: tools/list' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{"_meta":{"io.modelcontextprotocol/protocolVersion":"2026-07-28","io.modelcontextprotocol/clientCapabilities":{}}}}'
```

## Requiring the modern protocol on the server

Pass `--protocol modern` (or set `MCP_PROTOCOL=modern`). Legacy clients are
then rejected with `-32022 Unsupported protocol version`.

```bash
# stdio
npx @jpisnice/shadcn-ui-mcp-server --protocol modern

# Streamable HTTP
npx @jpisnice/shadcn-ui-mcp-server --mode http --port 7423 --protocol modern
```

In an MCP client config:

```json
{
  "mcpServers": {
    "shadcn-ui": {
      "command": "npx",
      "args": ["-y", "@jpisnice/shadcn-ui-mcp-server", "--protocol", "modern"]
    }
  }
}
```

The server logs its policy at startup, and `/health` reports it in HTTP
mode:

```
INFO: Protocol: 2026-07-28 only (2025-era clients rejected)
```

> **Only require modern if every client you use supports it.** The default,
> `--protocol any`, serves both eras and is the right choice for most setups.

For local development, `npm run dev` already runs with `--protocol modern`
(see [CONTRIBUTING.md](../../CONTRIBUTING.md)). If your client is legacy-only,
use `npm run dev -- --protocol any`; the last `--protocol` wins.

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `-32022 Unsupported protocol version: 2025-…` | Legacy client, server running `--protocol modern` | Switch the client to modern, or run the server with `--protocol any` |
| `-32020 … request headers and body disagree` | Raw HTTP request missing `MCP-Protocol-Version` or `Mcp-Method`, or they don't match the body | Send matching headers (see [Raw HTTP](#raw-http)) |
| Inspector connects as legacy | Inspector's protocol era is set to Legacy (its default) | Set it to **Modern** or **Auto** |
| `404` on `/sse` | The legacy HTTP+SSE transport was removed in 3.0.0 | Connect to `/mcp` |

## What's not available on the modern protocol

**MCP logging** (`notifications/message`) is deprecated in 2026-07-28 and this
server doesn't use it. Server logs go to stderr (stdio) or the console (HTTP).
Your MCP client usually shows stderr in its server logs.
