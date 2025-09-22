export type CliOptions = {
  githubApiKey: string | null
  mode?: string
  port?: string
  host?: string
  cors?: string
}

export function parseArgs(argv = process.argv.slice(2)): CliOptions {
  const options: CliOptions = { githubApiKey: null }

  // Parse GitHub API key
  const githubApiKeyIndex = argv.findIndex(
    (arg) => arg === "--github-api-key" || arg === "-g"
  )
  if (githubApiKeyIndex !== -1 && argv[githubApiKeyIndex + 1]) {
    options.githubApiKey = argv[githubApiKeyIndex + 1]
  } else if (process.env.GITHUB_PERSONAL_ACCESS_TOKEN) {
    options.githubApiKey = process.env.GITHUB_PERSONAL_ACCESS_TOKEN
  }

  // Parse transport mode
  const modeIndex = argv.findIndex((arg) => arg === "--mode" || arg === "-m")
  if (modeIndex !== -1 && argv[modeIndex + 1]) {
    options.mode = argv[modeIndex + 1]
  } else if (process.env.MCP_TRANSPORT_MODE) {
    options.mode = process.env.MCP_TRANSPORT_MODE
  }

  // Parse port
  const portIndex = argv.findIndex((arg) => arg === "--port" || arg === "-p")
  if (portIndex !== -1 && argv[portIndex + 1]) {
    options.port = argv[portIndex + 1]
  } else if (process.env.MCP_PORT) {
    options.port = process.env.MCP_PORT
  }

  // Parse host
  const hostIndex = argv.findIndex((arg) => arg === "--host" || arg === "-h")
  if (hostIndex !== -1 && argv[hostIndex + 1]) {
    options.host = argv[hostIndex + 1]
  } else if (process.env.MCP_HOST) {
    options.host = process.env.MCP_HOST
  }

  // Parse CORS origins
  const corsIndex = argv.findIndex((arg) => arg === "--cors")
  if (corsIndex !== -1 && argv[corsIndex + 1]) {
    options.cors = argv[corsIndex + 1]
  } else if (process.env.MCP_CORS_ORIGINS) {
    options.cors = process.env.MCP_CORS_ORIGINS
  }

  return options
}