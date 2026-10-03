/**
 * Framework selection utility for shadcn/ui MCP server
 *
 * This module handles switching between React Svelte, Vue and React Native implementations
 * based on environment variables or command line arguments.
 *
 * Usage:
 * - Set FRAMEWORK environment variable to 'react' or 'svelte' or 'vue'
 * - Or use --framework command line argument
 * - Defaults to 'react' if not specified
 */

import { logInfo, logWarning } from "./logger.js";
import { Cache } from "./cache.js";

// Framework types
export type Framework = "react" | "svelte" | "vue" | "react-native";

// UI library types (React-only: Radix vs Base UI)
export type UiLibrary = "radix" | "base";

// Default framework
const DEFAULT_FRAMEWORK: Framework = "react";
const DEFAULT_UI_LIBRARY: UiLibrary = "radix";

// Cache for memoization
let cachedFramework: Framework | null = null;
let cachedUiLibrary: UiLibrary | null = null;

/**
 * Get the current framework from environment or command line arguments
 * @returns The selected framework ('react' or 'svelte' or 'vue')
 */
export function getFramework(): Framework {
  if (cachedFramework !== null) return cachedFramework;

  // Check command line arguments first
  const args = process.argv.slice(2);
  const frameworkIndex = args.findIndex(
    (arg) => arg === "--framework" || arg === "-f"
  );

  if (frameworkIndex !== -1 && args[frameworkIndex + 1]) {
    const framework = args[frameworkIndex + 1].toLowerCase() as Framework;
    if (
      framework === "react" ||
      framework === "svelte" ||
      framework === "vue" ||
      framework === "react-native"
    ) {
      logInfo(`Framework set to '${framework}' via command line argument`);
      cachedFramework = framework;
      return framework;
    } else {
      logWarning(
        `Invalid framework '${framework}' specified. Using default '${DEFAULT_FRAMEWORK}'`
      );
    }
  }

  // Check environment variable
  const envFramework = process.env.FRAMEWORK?.toLowerCase() as Framework;
  if (
    envFramework === "react" ||
    envFramework === "svelte" ||
    envFramework === "vue" ||
    envFramework === "react-native"
  ) {
    logInfo(`Framework set to '${envFramework}' via environment variable`);
    cachedFramework = envFramework;
    return envFramework;
  }

  // Return default
  logInfo(`Using default framework: '${DEFAULT_FRAMEWORK}'`);
  cachedFramework = DEFAULT_FRAMEWORK;
  return DEFAULT_FRAMEWORK;
}

export function getUiLibrary(): UiLibrary {
  if (cachedUiLibrary !== null) return cachedUiLibrary;

  const framework = getFramework();
  const args = process.argv.slice(2);
  const idx = args.findIndex((arg) => arg === "--ui-library");
  const argLib = idx !== -1 ? args[idx + 1]?.toLowerCase() : null;
  const envLib = process.env.UI_LIBRARY?.toLowerCase();
  const requestedLib = argLib || envLib;

  if (framework !== "react") {
    if (requestedLib) {
      logWarning(`--ui-library is only supported for React. Ignoring '${requestedLib}' for ${framework}.`);
    }
    cachedUiLibrary = DEFAULT_UI_LIBRARY;
    return DEFAULT_UI_LIBRARY;
  }

  if (argLib === "radix" || argLib === "base") {
    logInfo(`UI library set to '${argLib}' via command line argument`);
    cachedUiLibrary = argLib;
    return argLib;
  } else if (argLib) {
    logWarning(`Invalid UI library '${argLib}'. Using default '${DEFAULT_UI_LIBRARY}'`);
  }

  if (envLib === "radix" || envLib === "base") {
    logInfo(`UI library set to '${envLib}' via environment variable`);
    cachedUiLibrary = envLib;
    return envLib;
  }

  logInfo(`Using default UI library: '${DEFAULT_UI_LIBRARY}'`);
  cachedUiLibrary = DEFAULT_UI_LIBRARY;
  return DEFAULT_UI_LIBRARY;
}

/**
 * Get the axios implementation based on the current framework
 * @returns The appropriate axios implementation
 */
export async function getAxiosImplementation() {
  const framework = getFramework();

  if (framework === "svelte") {
    // Dynamic import for Svelte implementation
    return import("./axios-svelte.js").then((module) => module.axios);
  } else if (framework === "vue") {
    // Dynamic import for Vue implementation
    return import("./axios-vue.js").then((module) => module.axios);
  } else if (framework === "react-native") {
    // Dynamic import for React Native implementation
    return import("./axios-react-native.js").then((module) => module.axios);
  } else {
    // Dynamic import for React implementation (default)
    return import("./axios.js").then((module) => module.axios);
  }
}

/**
 * Get the component names for the current framework, cached for an hour.
 * Used by argument completion (called per keystroke) and the get_components
 * resource, so the GitHub API is not hit on every request.
 */
export async function getComponentNames(): Promise<string[]> {
  return Cache.getInstance().getOrFetch(
    `components:${getFramework()}:${getUiLibrary()}`,
    async () => {
      const axios = await getAxiosImplementation();
      return axios.getAvailableComponents();
    },
    60 * 60 * 1000
  );
}

/**
 * Get framework-specific information for help text
 * @returns Framework information object
 */
export function getFrameworkInfo() {
  const framework = getFramework();

  return {
    current: framework,
    repository:
      framework === "svelte"
        ? "huntabyte/shadcn-svelte"
        : framework === "vue"
        ? "unovue/shadcn-vue"
        : framework === "react-native"
        ? "founded-labs/react-native-reusables"
        : "shadcn-ui/ui",
    fileExtension:
      framework === "svelte"
        ? ".svelte"
        : framework === "vue"
        ? ".vue"
        : framework === "react-native"
        ? ".tsx"
        : ".tsx",
    description:
      framework === "svelte"
        ? "Svelte components from shadcn-svelte"
        : framework === "vue"
        ? "Vue components from shadcn-vue"
        : framework === "react-native"
        ? "React Native components from react-native-reusables"
        : "React components from shadcn/ui v4",
  };
}

/**
 * Validate framework selection and provide helpful feedback
 */
export function validateFrameworkSelection() {
  const framework = getFramework();
  const info = getFrameworkInfo();

  logInfo(`MCP Server configured for ${framework.toUpperCase()} framework`);
  logInfo(`Repository: ${info.repository}`);
  logInfo(`File extension: ${info.fileExtension}`);
  logInfo(`Description: ${info.description}`);

  if (framework === "react") {
    const uiLibrary = getUiLibrary();
    logInfo(`UI library: ${uiLibrary} (${uiLibrary === 'base' ? 'Base UI' : 'Radix UI'})`);
  } else {
    // Warn if UI_LIBRARY specified for non-React framework
    const envLib = process.env.UI_LIBRARY;
    const args = process.argv.slice(2);
    const argLib = args.includes("--ui-library");
    if (envLib || argLib) {
      logWarning(`UI_LIBRARY is only supported for React. Ignoring for ${framework}.`);
    }
  }

  // Provide helpful information about switching frameworks
  if (framework === "react") {
    logInfo(
      "To switch frameworks: set FRAMEWORK=svelte|vue|react-native or use --framework svelte|vue|react-native"
    );
  } else if (framework === "svelte") {
    logInfo(
      "To switch frameworks: set FRAMEWORK=react|vue|react-native or use --framework react|vue|react-native"
    );
  } else if (framework === "vue") {
    logInfo(
      "To switch frameworks: set FRAMEWORK=react|svelte|react-native or use --framework react|svelte|react-native"
    );
  } else if (framework === "react-native") {
    logInfo(
      "To switch frameworks: set FRAMEWORK=react|svelte|vue or use --framework react|svelte|vue"
    );
  } else {
    logInfo(
      "To switch frameworks: set FRAMEWORK=react|svelte|vue|react-native or use --framework react|svelte|vue|react-native"
    );
  }
}
