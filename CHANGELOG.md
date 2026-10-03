# Changelog

## 3.0.0

Implements the **MCP 2026-07-28 specification** on MCP TypeScript SDK v2. Clients
on 2025-era protocol versions (2024-10-07 through 2025-11-25) are still served by
default.

### Breaking changes

- **Node.js 20 or newer is required** (MCP SDK v2 requirement). The Docker image
  now uses Node 22.
- **The legacy HTTP+SSE transport is removed.** `GET /sse` and `POST /message`
  are gone; HTTP clients connect to the Streamable HTTP endpoint at `/mcp`
  instead. `--mode sse` / `MCP_TRANSPORT_MODE=sse` still work as a deprecated
  alias for `--mode http` and log a warning.
- **`/connections` endpoint removed.** The protocol is stateless, so there are
  no sessions to list.
- **Error codes follow the spec.** Unknown tools, prompts and resources now
  return `-32602` (Invalid Params) instead of `-32603`.
- **Tool execution failures are returned as tool results** with
  `isError: true` instead of JSON-RPC errors, so the model can read them and
  self-correct.

### Added

- **2026-07-28 protocol support:** stateless requests, `server/discover`,
  per-request `_meta` envelope, and `serverInfo` (now with `title`,
  `description` and `websiteUrl`) on every result. Era negotiation is
  automatic over both stdio and HTTP.
- **`--protocol any|modern`** (`MCP_PROTOCOL`): `any` (default) also serves
  2025-era clients; `modern` accepts only 2026-07-28.
- **Cache hints:** `ttlMs` / `cacheScope` on `tools/list`, `prompts/list`,
  `resources/list`, `resources/templates/list` (1 hour), `resources/read`
  (10 minutes) and `server/discover`.
- **Argument completion** (`completion/complete`) for prompt and
  resource-template arguments: component names, package managers, build tools
  and the documented option values.
- **`--help` and `--version`** CLI flags.
- **Local development over Streamable HTTP:** `npm run dev` runs from source
  with `tsx watch`, bound to `127.0.0.1`, with `--protocol modern`. Clients stay
  connected across restarts. `npm run dev:stdio`, `npm run dev:watch` and
  `npm run typecheck` are also available.
- **DNS rebinding protection:** when bound to a loopback address, the HTTP
  server rejects non-localhost `Host` and `Origin` headers.
- **[Modern Protocol Guide](docs/getting-started/modern-protocol.md):** how to
  make clients use 2026-07-28 instead of the legacy handshake, and how to
  require it on the server.

### Fixed

- **GitHub errors were treated as success.** The HTTP clients accepted any
  status code, so a missing component returned the text `404: Not Found` as its
  source, a missing block returned an invented block, and rate-limit errors were
  never reported. Non-2xx responses now fail properly.
- **Circuit breaker no longer trips on client mistakes.** Unknown names and
  "not found" lookups don't count as upstream failures, so a few bad component
  names can't lock out every tool.
- **Component list is cached for an hour** instead of calling GitHub on every
  `get_components` resource read and completion request.
- **Resources use the spec's `mimeType` field** instead of a non-standard
  `contentType`; `get_components` correctly advertises `application/json`.
- **Docker Compose healthcheck** probed the wrong port (3001) with `curl`, which
  isn't in the image.
- **Test script** (`test-package.ps1`) failed to parse in Windows PowerShell 5.1
  because it was saved without a UTF-8 BOM.
- **Docs:** the VS Code config example passed `--fremaework` (ignored by the
  server); the troubleshooting guide suggested a `DEBUG=*` variable the server
  never read; block examples used `calendar-01`, which the React and Vue
  registries no longer ship (still valid for Svelte).

### Not adopted

- **MCP logging** (`notifications/message`) is deprecated in 2026-07-28
  (SEP-2577) and isn't implemented. Server logs go to stderr (stdio) or the
  console (HTTP), as the spec recommends.
- **Pagination** isn't needed: the server exposes 10 tools, 5 prompts,
  2 resources and 2 resource templates.
