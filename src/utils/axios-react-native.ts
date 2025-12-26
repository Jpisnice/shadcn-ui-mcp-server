import { Axios } from "axios";
import { logError, logWarning, logInfo } from "./logger.js";

// Constants for the React Native repository structure
const REPO_OWNER = "founded-labs";
const REPO_NAME = "react-native-reusables";
const REPO_BRANCH = "main";
const REGISTRY_PATH = "packages/registry/src/new-york";
const UI_PATH = `${REGISTRY_PATH}/components/ui`;
const NEW_YORK_V4_PATH = REGISTRY_PATH; // For compatibility with get-directory-structure

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
  timeout: 30000,
  transformResponse: [
    (data: any) => {
      try {
        return JSON.parse(data);
      } catch {
        return data;
      }
    },
  ],
});

// GitHub Raw for directly fetching file contents
const githubRaw = new Axios({
  baseURL: `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${REPO_BRANCH}`,
  headers: {
    "User-Agent": "Mozilla/5.0 (compatible; ShadcnUiMcpServer/1.0.0)",
  },
  timeout: 30000,
  transformResponse: [(data: any) => data], // Return raw data
});

/**
 * Fetch component source code from the React Native registry
 * @param componentName Name of the component
 * @returns Promise with component source code
 */
async function getComponentSource(componentName: string): Promise<string> {
  const componentPath = `${UI_PATH}/${componentName.toLowerCase()}.tsx`;

  try {
    const response = await githubRaw.get(`/${componentPath}`);
    return response.data;
  } catch (error) {
    throw new Error(
      `Component "${componentName}" not found in React Native registry`
    );
  }
}

/**
 * Fetch component demo/example from the React Native registry
 * @param componentName Name of the component
 * @returns Promise with component demo code or informative message
 */
async function getComponentDemo(componentName: string): Promise<string> {
  // React Native registry typically doesn't have dedicated demo files per component
  // For now, return an informative message
  return `Demo for component "${componentName}" is not available in the React Native registry. Check the showcase app at apps/showcase for examples.`;
}

/**
 * Fetch all available components from the React Native registry
 * @returns Promise with list of component names
 */
async function getAvailableComponents(): Promise<string[]> {
  try {
    // First try the GitHub API
    const response = await githubApi.get(
      `/repos/${REPO_OWNER}/${REPO_NAME}/contents/${UI_PATH}`
    );

    if (!response.data || !Array.isArray(response.data)) {
      throw new Error("Invalid response from GitHub API");
    }

    const components = response.data
      .filter((item: any) => item.type === "file" && item.name.endsWith(".tsx"))
      .map((item: any) => item.name.replace(".tsx", ""));

    if (components.length === 0) {
      throw new Error("No components found in the registry");
    }

    return components;
  } catch (error: any) {
    logError("Error fetching components from GitHub API", error);

    // Check for specific error types
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || "Unknown error";

      if (status === 403 && message.includes("rate limit")) {
        throw new Error(
          `GitHub API rate limit exceeded. Please set GITHUB_PERSONAL_ACCESS_TOKEN environment variable for higher limits. Error: ${message}`
        );
      } else if (status === 404) {
        throw new Error(
          `Components directory not found. The path ${UI_PATH} may not exist in the repository.`
        );
      } else if (status === 401) {
        throw new Error(
          `Authentication failed. Please check your GITHUB_PERSONAL_ACCESS_TOKEN if provided.`
        );
      } else {
        throw new Error(`GitHub API error (${status}): ${message}`);
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
      );
    }

    // If all else fails, provide a fallback list of known components
    logWarning("Using fallback component list due to API issues");
    return getFallbackComponents();
  }
}

/**
 * Fallback list of known React Native components
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
    "button",
    "card",
    "checkbox",
    "collapsible",
    "context-menu",
    "dialog",
    "dropdown-menu",
    "hover-card",
    "icon",
    "input",
    "label",
    "menubar",
    "native-only-animated-view",
    "popover",
    "progress",
    "radio-group",
    "select",
    "separator",
    "skeleton",
    "switch",
    "tabs",
    "text",
    "textarea",
    "toggle",
    "toggle-group",
    "tooltip",
  ];
}

/**
 * Fetch component metadata from the React Native registry JSON
 * @param componentName Name of the component
 * @returns Promise with component metadata
 */
async function getComponentMetadata(componentName: string): Promise<any> {
  const registryPath = "apps/docs/registry/new-york.json";

  try {
    const response = await githubRaw.get(`/${registryPath}`);
    const registry = JSON.parse(response.data);

    const component = registry.find(
      (item: any) => item.name === componentName.toLowerCase()
    );

    if (!component) {
      throw new Error(`Component "${componentName}" not found in registry`);
    }

    return {
      name: component.name,
      type: component.type,
      dependencies: component.dependencies || [],
      registryDependencies: component.registryDependencies || [],
    };
  } catch (error) {
    throw new Error(
      `Failed to fetch metadata for component "${componentName}": ${error}`
    );
  }
}

/**
 * Fetch block code from the React Native registry
 * @param blockName Name of the block
 * @param includeComponents Whether to include component files
 * @returns Promise with block code or informative message
 */
async function getBlockCode(
  blockName: string,
  includeComponents = true
): Promise<any> {
  // React Native registry currently doesn't provide blocks
  return {
    message: `Blocks are not available for React Native framework. Block "${blockName}" cannot be retrieved.`,
    availableBlocks: [],
    totalBlocks: 0,
  };
}

/**
 * Fetch all available blocks from the React Native registry
 * @param category Optional category filter
 * @returns Promise with block information
 */
async function getAvailableBlocks(category?: string): Promise<any> {
  // React Native registry currently doesn't provide blocks
  return {
    categories: {},
    totalBlocks: 0,
    availableCategories: [],
    message: "Blocks are currently not available for React Native framework",
  };
}

/**
 * Set GitHub API key for authenticated requests
 * @param apiKey GitHub personal access token
 */
function setGitHubApiKey(apiKey: string): void {
  if (apiKey && apiKey.trim()) {
    (githubApi.defaults.headers as any)[
      "Authorization"
    ] = `Bearer ${apiKey.trim()}`;
    (githubRaw.defaults.headers as any)[
      "Authorization"
    ] = `Bearer ${apiKey.trim()}`;
    logInfo("GitHub API key updated successfully");
  } else {
    delete (githubApi.defaults.headers as any)["Authorization"];
    delete (githubRaw.defaults.headers as any)["Authorization"];
    logWarning("GitHub API key removed - using unauthenticated requests");
  }
}

/**
 * Get current GitHub API rate limit status
 * @returns Promise with rate limit information
 */
async function getGitHubRateLimit(): Promise<any> {
  try {
    const response = await githubApi.get("/rate_limit");
    return response.data;
  } catch (error) {
    logError("Error fetching GitHub rate limit", error);
    throw new Error("Failed to fetch GitHub API rate limit");
  }
}

/**
 * Build directory tree for the given path
 * @param owner Repository owner
 * @param repo Repository name
 * @param path Path to build tree for
 * @param branch Branch name
 * @returns Promise with directory tree
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
    );
    return response.data;
  } catch (error) {
    logError(`Error building directory tree for ${path}`, error);
    throw new Error(`Failed to build directory tree for ${path}`);
  }
}

/**
 * Build directory tree with fallback for the given path
 * @param owner Repository owner
 * @param repo Repository name
 * @param path Path to build tree for
 * @param branch Branch name
 * @returns Promise with directory tree
 */
async function buildDirectoryTreeWithFallback(
  owner: string = REPO_OWNER,
  repo: string = REPO_NAME,
  path: string = NEW_YORK_V4_PATH,
  branch: string = REPO_BRANCH
): Promise<any> {
  return buildDirectoryTree(owner, repo, path, branch);
}

// Export the axios implementation
export const axios = {
  githubRaw,
  githubApi,
  buildDirectoryTree,
  buildDirectoryTreeWithFallback,
  getComponentSource,
  getComponentDemo,
  getAvailableComponents,
  getComponentMetadata,
  getBlockCode,
  getAvailableBlocks,
  setGitHubApiKey,
  getGitHubRateLimit,
  paths: {
    REPO_OWNER,
    REPO_NAME,
    REPO_BRANCH,
    REGISTRY_PATH,
    NEW_YORK_V4_PATH,
    UI_PATH,
  },
};
