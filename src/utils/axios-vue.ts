import { Axios } from "axios"
import { logError, logWarning, logInfo } from "./logger.js"

// Constants for the Vue repository structure (v4)
const REPO_OWNER = "unovue"
const REPO_NAME = "shadcn-vue"
const REPO_BRANCH = "dev"

// App paths
const APPS_V4_PATH = `apps/v4`
const REGISTRY_PATH = `${APPS_V4_PATH}/registry`
const NEW_YORK_V4_PATH = `${REGISTRY_PATH}/new-york-v4`
const UI_PATH = `${NEW_YORK_V4_PATH}/ui`
const BLOCKS_PATH = `${NEW_YORK_V4_PATH}/blocks`
const DEMOS_PATH = `${APPS_V4_PATH}/components`
const formatComponentNameToCapital = (name: string) => {
  return name
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("")
}
const toKebabCase = (name: string) =>
  name
    // Convert PascalCase or camelCase to kebab-case
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/\s+/g, "-")
    .toLowerCase()
// Normalize block names like "login01", "Login01", or "login-01" -> "Login01"
const normalizeBlockName = (name: string) => {
  const parts = (name || "").match(/[a-zA-Z]+|\d+/g) || []
  return parts
    .map((p) =>
      /[0-9]/.test(p) ? p : p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()
    )
    .join("")
}
// GitHub API for accessing repository structure and metadata
const githubApi = new Axios({
  baseURL: "https://api.github.com",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/vnd.github+json",
    "User-Agent": "Mozilla/5.0 (compatible; ShadcnUiMcpServer/1.0.0)",
    ...(process.env.GITHUB_PERSONAL_ACCESS_TOKEN && {
      Authorization: `Bearer ${process.env.GITHUB_PERSONAL_ACCESS_TOKEN}`,
    }),
  },
  timeout: 30000, // 30 seconds
  transformResponse: [
    (data) => {
      try {
        return JSON.parse(data)
      } catch {
        return data
      }
    },
  ],
})

// GitHub Raw for directly fetching file contents
const githubRaw = new Axios({
  baseURL: `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${REPO_BRANCH}`,
  headers: {
    "User-Agent": "Mozilla/5.0 (compatible; ShadcnUiMcpServer/1.0.0)",
  },
  timeout: 30000, // 30 seconds
  transformResponse: [(data) => data], // Return raw data
})

/**
 * Fetch component source code from the Vue registry
 * @param componentName Name of the component
 * @param style Optional style variant ('new-york' or 'default')
 * @returns Promise with component source code
 */
async function getComponentSource(
  componentName: string,
  style: string = "new-york-v4"
): Promise<string> {
  const formattedComponentName = formatComponentNameToCapital(componentName)
  const componentFolder = componentName.toLowerCase()
  const basePath = UI_PATH // Only new-york-v4 is supported for v4
  const componentPath = `${basePath}/${componentFolder}/${formattedComponentName}.vue`

  try {
    const response = await githubRaw.get(`/${componentPath}`)
    return response.data
  } catch (error) {
    // Try alternative paths if the primary fails
    const altPaths = [
      `${basePath}/${componentFolder}/${formattedComponentName}.vue`,
      `${basePath}/${componentFolder}/index.ts`,
      `${basePath}/${formattedComponentName}.vue`,
    ]

    for (const altPath of altPaths) {
      try {
        const response = await githubRaw.get(`/${altPath}`)
        return response.data
      } catch {
        continue
      }
    }

    throw new Error(
      `Component "${formattedComponentName}" not found in Vue registry (v4)`
    )
  }
}

/**
 * Fetch component demo/example from the Vue registry
 * @param componentName Name of the component
 * @param style Optional style variant ('new-york' or 'default')
 * @returns Promise with component demo code
 */
async function getComponentDemo(
  componentName: string,
  style: string = "new-york-v4"
): Promise<string> {
  const formattedComponentName = formatComponentNameToCapital(componentName)
  const demoPaths = [
    `${DEMOS_PATH}/${formattedComponentName}Demo.vue`,
    `${DEMOS_PATH}/${formattedComponentName}.vue`,
  ]

  for (const demoPath of demoPaths) {
    try {
      const response = await githubRaw.get(`/${demoPath}`)
      return response.data
    } catch (error) {
      continue
    }
  }

  throw new Error(
    `Demo for component "${formattedComponentName}" not found in Vue registry (v4)`
  )
}

/**
 * Fetch all available components from the Vue registry
 * @param style Optional style variant ('new-york' or 'default')
 * @returns Promise with list of component names
 */
async function getAvailableComponents(
  style: string = "new-york-v4"
): Promise<string[]> {
  try {
    // v4 components live under UI_PATH as directories
    const response = await githubApi.get(
      `/repos/${REPO_OWNER}/${REPO_NAME}/contents/${UI_PATH}`
    )

    if (!response.data || !Array.isArray(response.data)) {
      throw new Error("Invalid response from GitHub API")
    }

    const components = response.data
      .filter(
        (item: any) =>
          item.type === "dir" ||
          (item.type === "file" && item.name.endsWith(".vue"))
      )
      .map((item: any) => {
        if (item.type === "dir") {
          return item.name
        } else {
          return item.name.replace(".vue", "")
        }
      })

    if (components.length === 0) {
      throw new Error("No components found in the Vue registry (v4)")
    }

    return components
  } catch (error: any) {
    logError("Error fetching components from GitHub API", error)

    // Check for specific error types
    if (error.response) {
      const status = error.response.status
      const message = error.response.data?.message || "Unknown error"

      if (status === 403 && message.includes("rate limit")) {
        throw new Error(
          `GitHub API rate limit exceeded. Please set GITHUB_PERSONAL_ACCESS_TOKEN environment variable for higher limits. Error: ${message}`
        )
      } else if (status === 404) {
        throw new Error(
          `Components directory not found. The path ${UI_PATH} may not exist in the repository.`
        )
      } else if (status === 401) {
        throw new Error(
          `Authentication failed. Please check your GITHUB_PERSONAL_ACCESS_TOKEN if provided.`
        )
      } else {
        throw new Error(`GitHub API error (${status}): ${message}`)
      }
    }

    // If it's a network error or other issue, provide a fallback
    if (
      error.code === "ECONNREFUSED" ||
      error.code === "ENOTFOUND" ||
      error.code === "ETIMEDOUT"
    ) {
      throw new Error(
        `Network error: ${error.message}. Please check your internet connection.`
      )
    }

    // If all else fails, provide a fallback list of known Vue components
    logWarning("Using fallback component list due to API issues")
    return getFallbackComponents()
  }
}

/**
 * Fallback list of known shadcn-vue components
 * This is used when the GitHub API is unavailable
 */
function getFallbackComponents(): string[] {
  return [
    "accordion",
    "alert",
    "alert-dialog",
    "aspect-ratio",
    "avatar",
    "badge",
    "breadcrumb",
    "button",
    "button-group",
    "calendar",
    "card",
    "carousel",
    "chart",
    "checkbox",
    "collapsible",
    "combobox",
    "command",
    "context-menu",
    "dialog",
    "drawer",
    "dropdown-menu",
    "empty",
    "field",
    "form",
    "hover-card",
    "input",
    "input-group",
    "input-otp",
    "item",
    "kbd",
    "label",
    "menubar",
    "native-select",
    "navigation-menu",
    "number-field",
    "pagination",
    "pin-input",
    "popover",
    "progress",
    "radio-group",
    "range-calendar",
    "resizable",
    "scroll-area",
    "select",
    "separator",
    "sheet",
    "sidebar",
    "skeleton",
    "slider",
    "sonner",
    "spinner",
    "stepper",
    "switch",
    "table",
    "tabs",
    "tags-input",
    "textarea",
    "toggle",
    "toggle-group",
    "tooltip",
  ]
}

/**
 * Fetch component metadata from the Vue registry
 * @param componentName Name of the component
 * @returns Promise with component metadata
 */
async function getComponentMetadata(componentName: string): Promise<any> {
  try {
    const response = await githubRaw.get(
      `/${APPS_V4_PATH}/__registry__/index.ts`
    )
    const content: string = response.data as string

    // Find the block for the component key
    const entryRegex = new RegExp(
      `"${componentName}"\s*:\\s*\{([\\s\\S]*?)\n\}`,
      "s"
    )
    const entryMatch = content.match(entryRegex)
    if (!entryMatch) {
      throw new Error(`Registry entry for ${componentName} not found`)
    }

    const entry = entryMatch[1]

    // Extract simple fields
    const typeMatch = entry.match(/type:\s*"([^"]+)"/)
    const depsMatch = entry.match(/registryDependencies:\s*\[([^\]]*)\]/s)
    const filesMatch = entry.match(/files:\s*\[([\s\S]*?)\]/)
    const registryDependencies = depsMatch
      ? depsMatch[1]
          .split(",")
          .map((d) => d.replace(/["'\s]/g, "").trim())
          .filter(Boolean)
      : []

    // Parse file paths (best-effort)
    const filePathRegex = /path:\s*"([^"]+)"/g
    const files: string[] = []
    if (filesMatch) {
      let m: RegExpExecArray | null
      while ((m = filePathRegex.exec(filesMatch[1])) !== null) {
        files.push(m[1])
      }
    }

    return {
      name: componentName,
      type: typeMatch?.[1] || "registry:ui",
      registryDependencies,
      files,
    }
  } catch (error) {
    logError(`Error getting metadata for ${componentName}`, error)
    return null
  }
}
/**
 * Recursively builds a directory tree structure from the Vue repository
 * @param owner Repository owner
 * @param repo Repository name
 * @param path Path within the repository to start building the tree from
 * @param branch Branch name
 * @returns Promise resolving to the directory tree structure
 */
async function buildDirectoryTree(
  owner: string = REPO_OWNER,
  repo: string = REPO_NAME,
  path: string = NEW_YORK_V4_PATH,
  branch: string = REPO_BRANCH
): Promise<any> {
  try {
    const response = await githubApi.get(
      `/repos/${owner}/${repo}/contents/${path}?ref=${branch}`
    )

    if (!response.data) {
      throw new Error("No data received from GitHub API")
    }

    const contents = response.data

    // Handle different response types from GitHub API
    if (!Array.isArray(contents)) {
      // Check if it's an error response (like rate limit)
      if (contents.message) {
        const message: string = contents.message
        if (message.includes("rate limit exceeded")) {
          throw new Error(
            `GitHub API rate limit exceeded. ${message} Consider setting GITHUB_PERSONAL_ACCESS_TOKEN environment variable for higher rate limits.`
          )
        } else if (message.includes("Not Found")) {
          throw new Error(
            `Path not found: ${path}. The path may not exist in the repository.`
          )
        } else {
          throw new Error(`GitHub API error: ${message}`)
        }
      }

      // If contents is not an array, it might be a single file
      if (contents.type === "file") {
        return {
          path: contents.path,
          type: "file",
          name: contents.name,
          url: contents.download_url,
          sha: contents.sha,
        }
      } else {
        throw new Error(
          `Unexpected response type from GitHub API: ${JSON.stringify(
            contents
          )}`
        )
      }
    }

    // Build tree node for this level (directory with multiple items)
    const result: Record<string, any> = {
      path,
      type: "directory",
      children: {},
    }

    // Process each item
    for (const item of contents) {
      if (item.type === "file") {
        // Add file to this directory's children
        result.children[item.name] = {
          path: item.path,
          type: "file",
          name: item.name,
          url: item.download_url,
          sha: item.sha,
        }
      } else if (item.type === "dir") {
        // Recursively process subdirectory (limit depth to avoid infinite recursion)
        if (path.split("/").length < 8) {
          try {
            const subTree = await buildDirectoryTree(
              owner,
              repo,
              item.path,
              branch
            )
            result.children[item.name] = subTree
          } catch (error) {
            logWarning(
              `Failed to fetch subdirectory ${item.path}: ${
                error instanceof Error ? error.message : String(error)
              }`
            )
            result.children[item.name] = {
              path: item.path,
              type: "directory",
              error: "Failed to fetch contents",
            }
          }
        }
      }
    }

    return result
  } catch (error: any) {
    logError(`Error building directory tree for ${path}`, error)

    // Check if it's already a well-formatted error from above
    if (
      error.message &&
      (error.message.includes("rate limit") ||
        error.message.includes("GitHub API error"))
    ) {
      throw error
    }

    // Provide more specific error messages for HTTP errors
    if (error.response) {
      const status: number = error.response.status
      const responseData: any = error.response.data
      const message: string = responseData?.message || "Unknown error"

      if (status === 404) {
        throw new Error(
          `Path not found: ${path}. The path may not exist in the repository.`
        )
      } else if (status === 403) {
        if (message.includes("rate limit")) {
          throw new Error(
            `GitHub API rate limit exceeded: ${message} Consider setting GITHUB_PERSONAL_ACCESS_TOKEN environment variable for higher rate limits.`
          )
        } else {
          throw new Error(`Access forbidden: ${message}`)
        }
      } else if (status === 401) {
        throw new Error(
          `Authentication failed. Please check your GITHUB_PERSONAL_ACCESS_TOKEN if provided.`
        )
      } else {
        throw new Error(`GitHub API error (${status}): ${message}`)
      }
    }

    throw error
  }
}

/**
 * Provides a basic directory structure for Vue registry without API calls
 * This is used as a fallback when API rate limits are hit
 */
function getBasicVueStructure(): any {
  return {
    path: NEW_YORK_V4_PATH,
    type: "directory",
    note: "Basic structure provided due to API limitations",
    children: {
      ui: {
        path: `${UI_PATH}`,
        type: "directory",
        description: "Contains all Vue UI components (v4)",
        note: "Component files (.vue) are located in subfolders",
      },
      blocks: {
        path: `${BLOCKS_PATH}`,
        type: "directory",
        description: "Contains Vue blocks for v4",
      },
    },
  }
}

/**
 * Extract description from Vue component comments
 * @param code The source code to analyze
 * @returns Extracted description or null
 */
function extractComponentDescription(code: string): string | null {
  // Look for Vue component description in template comments or script comments
  const descriptionRegex = /<!--[\s\S]*?-->|\/\*\*[\s\S]*?\*\/|\/\/\s*(.+)/
  const match = code.match(descriptionRegex)
  if (match) {
    // Clean up the comment
    const description = match[0]
      .replace(/<!--|}-->|\/\*\*|\*\/|\*|\/\//g, "")
      .trim()
      .split("\n")[0]
      .trim()
    return description.length > 0 ? description : null
  }

  // Look for component name in script setup
  const componentRegex = /<script.*setup.*>[\s\S]*?<\/script>/
  const scriptMatch = code.match(componentRegex)
  if (scriptMatch) {
    const nameMatch = scriptMatch[0].match(
      /defineComponent\(\s*{[\s\S]*?name:\s*['"]([^'"]+)['"]/
    )
    if (nameMatch) {
      return `${nameMatch[1]} - A reusable Vue UI component`
    }
  }

  return null
}

/**
 * Extract dependencies from Vue component imports
 * @param code The source code to analyze
 * @returns Array of dependency names
 */
function extractVueDependencies(code: string): string[] {
  const dependencies: string[] = []

  // Match import statements in script blocks
  const scriptRegex = /<script.*?>([\s\S]*?)<\/script>/g
  let scriptMatch: RegExpExecArray | null

  while ((scriptMatch = scriptRegex.exec(code)) !== null) {
    const scriptContent = scriptMatch[1]
    const importRegex = /import\s+.*?\s+from\s+['"]([@\w\/\-\.]+)['"]/g
    let importMatch: RegExpExecArray | null

    while ((importMatch = importRegex.exec(scriptContent)) !== null) {
      const dep: string = importMatch[1]
      if (
        !dep.startsWith("./") &&
        !dep.startsWith("../") &&
        !dep.startsWith("@/")
      ) {
        dependencies.push(dep)
      }
    }
  }

  return [...new Set(dependencies)] // Remove duplicates
}

/**
 * Extract component usage from Vue template
 * @param code The source code to analyze
 * @returns Array of component names used
 */
function extractVueComponentUsage(code: string): string[] {
  const components: string[] = []

  // Extract from template
  const templateRegex = /<template.*?>([\s\S]*?)<\/template>/
  const templateMatch = code.match(templateRegex)

  if (templateMatch) {
    const templateContent = templateMatch[1]
    // Look for custom components (PascalCase or kebab-case)
    const componentRegex = /<([A-Z]\w+|[a-z]+-[a-z-]+)/g
    let match: RegExpExecArray | null

    while ((match = componentRegex.exec(templateContent)) !== null) {
      components.push(match[1])
    }
  }

  // Also extract from script imports
  const scriptRegex = /<script.*?>([\s\S]*?)<\/script>/
  const scriptMatch = code.match(scriptRegex)

  if (scriptMatch) {
    const scriptContent = scriptMatch[1]
    const importRegex = /import\s+\{([^}]+)\}\s+from/g
    let match: RegExpExecArray | null

    while ((match = importRegex.exec(scriptContent)) !== null) {
      const imports = match[1].split(",").map((imp) => imp.trim())
      imports.forEach((imp) => {
        if (imp[0] && imp[0] === imp[0].toUpperCase()) {
          components.push(imp)
        }
      })
    }
  }

  return [...new Set(components)] // Remove duplicates
}

/**
 * Enhanced buildDirectoryTree with fallback for rate limits
 */
async function buildDirectoryTreeWithFallback(
  owner: string = REPO_OWNER,
  repo: string = REPO_NAME,
  path: string = NEW_YORK_V4_PATH,
  branch: string = REPO_BRANCH
): Promise<any> {
  try {
    return await buildDirectoryTree(owner, repo, path, branch)
  } catch (error: any) {
    // If it's a rate limit error and we're asking for the default path, provide fallback
    if (
      error.message &&
      error.message.includes("rate limit") &&
      path === NEW_YORK_V4_PATH
    ) {
      logWarning("Using fallback directory structure due to rate limit")
      return getBasicVueStructure()
    }
    // Re-throw other errors
    throw error
  }
}

/**
 * Fetch block code from the Vue blocks directory
 * @param blockName Name of the block
 * @param includeComponents Whether to include component files for complex blocks
 * @returns Promise with block code and structure
 */
async function getBlockCode(
  blockName: string,
  includeComponents: boolean = true
): Promise<any> {
  // Prefer v4 registry blocks (directories with page.vue)
  const blocksPath = BLOCKS_PATH
  const normalized = normalizeBlockName(blockName)

  // Check for complex block directory
  const directoryResponse = await githubApi.get(
    `/repos/${REPO_OWNER}/${REPO_NAME}/contents/${blocksPath}/${normalized}?ref=${REPO_BRANCH}`
  )

  if (!directoryResponse.data) {
    throw new Error(`Block "${blockName}" not found`)
  }

  const blockStructure: any = {
    name: normalized,
    type: "complex",
    description: `Complex block: ${normalized}`,
    files: {},
    structure: [],
    totalFiles: 0,
    dependencies: new Set(),
    componentsUsed: new Set(),
    code: undefined as unknown as string,
  }

  if (Array.isArray(directoryResponse.data)) {
    blockStructure.totalFiles = directoryResponse.data.length

    for (const item of directoryResponse.data) {
      if (item.type === "file") {
        const fileResponse = await githubRaw.get(`/${item.path}`)
        const content = fileResponse.data

        const description = extractComponentDescription(content)
        const dependencies = extractVueDependencies(content)
        const components = extractVueComponentUsage(content)

        blockStructure.files[item.name] = {
          path: item.name,
          content: content,
          size: content.length,
          lines: content.split("\n").length,
          description: description,
          dependencies: dependencies,
          componentsUsed: components,
        }

        dependencies.forEach((dep: string) =>
          blockStructure.dependencies.add(dep)
        )
        components.forEach((comp: string) =>
          blockStructure.componentsUsed.add(comp)
        )

        blockStructure.structure.push({
          name: item.name,
          type: "file",
          size: content.length,
          description: description || `${item.name} - Main block file`,
        })

        // If this is the main page file, set it as the primary code
        if (item.name.toLowerCase() === "page.vue") {
          blockStructure.code = content
          if (
            description &&
            blockStructure.description === `Complex block: ${normalized}`
          ) {
            blockStructure.description = description
          }
        }
      } else if (
        item.type === "dir" &&
        item.name === "components" &&
        includeComponents
      ) {
        const componentsResponse = await githubApi.get(
          `/repos/${REPO_OWNER}/${REPO_NAME}/contents/${item.path}?ref=${REPO_BRANCH}`
        )

        if (Array.isArray(componentsResponse.data)) {
          blockStructure.files.components = {}
          const componentStructure: any[] = []

          for (const componentItem of componentsResponse.data) {
            if (componentItem.type === "file") {
              const componentResponse = await githubRaw.get(
                `/${componentItem.path}`
              )
              const content = componentResponse.data

              const dependencies = extractVueDependencies(content)
              const components = extractVueComponentUsage(content)

              blockStructure.files.components[componentItem.name] = {
                path: `components/${componentItem.name}`,
                content: content,
                size: content.length,
                lines: content.split("\n").length,
                dependencies: dependencies,
                componentsUsed: components,
              }

              dependencies.forEach((dep: string) =>
                blockStructure.dependencies.add(dep)
              )
              components.forEach((comp: string) =>
                blockStructure.componentsUsed.add(comp)
              )

              componentStructure.push({
                name: componentItem.name,
                type: "component",
                size: content.length,
              })
            }
          }

          blockStructure.structure.push({
            name: "components",
            type: "directory",
            files: componentStructure,
            count: componentStructure.length,
          })
        }
      }
    }
  }

  blockStructure.dependencies = Array.from(blockStructure.dependencies)
  blockStructure.componentsUsed = Array.from(blockStructure.componentsUsed)

  // Ensure we return page.vue as main code. If not loaded above, fetch explicitly
  if (!blockStructure.code) {
    try {
      const pageResponse = await githubRaw.get(
        `/${blocksPath}/${normalized}/page.vue`
      )
      blockStructure.code = pageResponse.data
    } catch (e) {
      blockStructure.code = ""
    }
  }

  blockStructure.usage = `To use the ${normalized} block, copy \`page.vue\` and any \`components\` into your project and update imports as needed.`

  return blockStructure
}

/**
 * Get all available blocks with categorization
 * @param category Optional category filter
 * @returns Promise with categorized block list
 */
async function getAvailableBlocks(category?: string): Promise<any> {
  const blocksPath = BLOCKS_PATH

  const allBlocks: any[] = []

  try {
    const response = await githubApi.get(
      `/repos/${REPO_OWNER}/${REPO_NAME}/contents/${blocksPath}?ref=${REPO_BRANCH}`
    )

    if (Array.isArray(response.data)) {
      for (const item of response.data) {
        if (item.type === "file" && item.name.endsWith(".vue")) {
          allBlocks.push({
            name: item.name.replace(".vue", ""),
            type: "simple",
            path: item.path,
            size: item.size || 0,
            lastModified: "Available",
          })
        } else if (item.type === "dir") {
          allBlocks.push({
            name: item.name,
            type: "complex",
            path: item.path,
            lastModified: "Directory",
          })
        }
      }
    }
  } catch (error) {
    throw new Error("No blocks found in Vue registry (v4)")
  }

  // Categorize blocks by simple heuristics
  const blocks: any = {
    calendar: [],
    dashboard: [],
    login: [],
    sidebar: [],
    products: [],
    authentication: [],
    charts: [],
    mail: [],
    music: [],
    other: [],
  }

  for (const block of allBlocks) {
    if (block.name.includes("calendar")) {
      block.description = "Calendar component for date selection and scheduling"
      blocks.calendar.push(block)
    } else if (block.name.includes("dashboard")) {
      block.description =
        "Dashboard layout with charts, metrics, and data display"
      blocks.dashboard.push(block)
    } else if (block.name.includes("login") || block.name.includes("signin")) {
      block.description = "Authentication and login interface"
      blocks.login.push(block)
    } else if (block.name.includes("sidebar")) {
      block.description = "Navigation sidebar component"
      blocks.sidebar.push(block)
    } else if (
      block.name.includes("products") ||
      block.name.includes("ecommerce")
    ) {
      block.description = "Product listing and e-commerce components"
      blocks.products.push(block)
    } else if (block.name.includes("auth")) {
      block.description = "Authentication related components"
      blocks.authentication.push(block)
    } else if (block.name.includes("chart") || block.name.includes("graph")) {
      block.description = "Data visualization and chart components"
      blocks.charts.push(block)
    } else if (block.name.includes("mail") || block.name.includes("email")) {
      block.description = "Email and mail interface components"
      blocks.mail.push(block)
    } else if (block.name.includes("music") || block.name.includes("player")) {
      block.description = "Music player and media components"
      blocks.music.push(block)
    } else {
      block.description = `${block.name} - Custom Vue UI block`
      blocks.other.push(block)
    }
  }

  Object.keys(blocks).forEach((key) => {
    blocks[key].sort((a: any, b: any) => a.name.localeCompare(b.name))
  })

  if (category) {
    const categoryLower = category.toLowerCase()
    if (blocks[categoryLower]) {
      return {
        category,
        blocks: blocks[categoryLower],
        total: blocks[categoryLower].length,
        description: `${
          category.charAt(0).toUpperCase() + category.slice(1)
        } blocks available in shadcn-vue v4`,
        usage: `Use 'get_block' tool with the block name to get the full source code and implementation details.`,
      }
    } else {
      return {
        category,
        blocks: [],
        total: 0,
        availableCategories: Object.keys(blocks).filter(
          (key) => blocks[key].length > 0
        ),
        suggestion: `Category '${category}' not found. Available categories: ${Object.keys(
          blocks
        )
          .filter((key) => blocks[key].length > 0)
          .join(", ")}`,
      }
    }
  }

  const totalBlocks = Object.values(blocks).flat().length
  const nonEmptyCategories = Object.keys(blocks).filter(
    (key) => blocks[key].length > 0
  )

  return {
    categories: blocks,
    totalBlocks,
    availableCategories: nonEmptyCategories,
    summary: Object.keys(blocks).reduce((acc: any, key) => {
      if (blocks[key].length > 0) {
        acc[key] = blocks[key].length
      }
      return acc
    }, {}),
    usage:
      "Use 'get_block' tool with a specific block name to get full source code and implementation details.",
    examples: nonEmptyCategories
      .slice(0, 3)
      .map((cat) => (blocks[cat][0] ? `${cat}: ${blocks[cat][0].name}` : ""))
      .filter(Boolean),
  }
}

/**
 * Set or update GitHub API key for higher rate limits
 * @param apiKey GitHub Personal Access Token
 */
function setGitHubApiKey(apiKey: string): void {
  // Update the Authorization header for the GitHub API instance
  if (apiKey && apiKey.trim()) {
    ;(githubApi.defaults.headers as any)[
      "Authorization"
    ] = `Bearer ${apiKey.trim()}`
    logInfo("GitHub API key updated successfully")
    console.error("GitHub API key updated successfully")
  } else {
    // Remove authorization header if empty key provided
    delete (githubApi.defaults.headers as any)["Authorization"]
    console.error("GitHub API key removed - using unauthenticated requests")
    console.error(
      "For higher rate limits and reliability, provide a GitHub API token. See setup instructions: https://github.com/Jpisnice/shadcn-ui-mcp-server#readme"
    )
  }
}

/**
 * Get current GitHub API rate limit status
 * @returns Promise with rate limit information
 */
async function getGitHubRateLimit(): Promise<any> {
  try {
    const response = await githubApi.get("/rate_limit")
    return response.data
  } catch (error: any) {
    throw new Error(`Failed to get rate limit info: ${error.message}`)
  }
}

export const axios = {
  githubRaw,
  githubApi,
  buildDirectoryTree: buildDirectoryTreeWithFallback, // Use fallback version by default
  buildDirectoryTreeWithFallback,
  getComponentSource,
  getComponentDemo,
  getAvailableComponents,
  getComponentMetadata,
  getBlockCode,
  getAvailableBlocks,
  setGitHubApiKey,
  getGitHubRateLimit,
  // Path constants for easy access
  paths: {
    REPO_OWNER,
    REPO_NAME,
    REPO_BRANCH,
    APPS_V4_PATH,
    REGISTRY_PATH,
    NEW_YORK_V4_PATH,
    UI_PATH,
    BLOCKS_PATH,
    DEMOS_PATH,
  },
}
