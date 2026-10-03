/**
 * Argument completion (completion/complete) for prompts and resource templates.
 *
 * Values mirror the options documented in the prompt argument descriptions
 * (src/prompts/index.ts) and the values the resource templates accept
 * (src/resource-templates/index.ts). Comma-separated multi-value arguments
 * (features, widgets, providers, actions) are not completed.
 */
import type { CompleteRequestParams, CompleteResult } from "@modelcontextprotocol/server";
import { getComponentNames, getFramework } from "../utils/framework.js";
import { resourceTemplates } from "../resource-templates/index.js";
import { logError } from "../utils/logger.js";

type ValueSource = readonly string[] | (() => string[] | Promise<string[]>);

const MAX_VALUES = 100;

const packageManagers = ["npm", "pnpm", "yarn", "bun"];

// Build tools per framework, matching the installation guide keys
const buildToolsByFramework: Record<string, string[]> = {
  react: ["next", "vite", "remix"],
  svelte: ["vite"],
  vue: ["vite"],
  "react-native": ["expo"],
};

const [installScriptTemplate, installGuideTemplate] = resourceTemplates;

/** Completion sources keyed by "prompt:<name>" or "template:<uriTemplate>", then argument name */
const completionValues: Record<string, Record<string, ValueSource>> = {
  "prompt:build-shadcn-page": {
    pageType: ["dashboard", "login", "calendar", "sidebar", "products", "custom"],
    layout: ["sidebar", "header", "full-width", "centered"],
    style: ["minimal", "modern", "enterprise", "creative"],
  },
  "prompt:create-dashboard": {
    dashboardType: ["analytics", "admin", "user", "project", "sales"],
    navigation: ["sidebar", "top-nav", "breadcrumbs"],
  },
  "prompt:create-auth-flow": {
    authType: ["login", "register", "forgot-password", "two-factor"],
  },
  "prompt:optimize-shadcn-component": {
    component: getComponentNames,
    optimization: ["performance", "accessibility", "responsive", "animations"],
  },
  "prompt:create-data-table": {
    dataType: ["users", "products", "orders", "analytics"],
  },
  [`template:${installScriptTemplate.uriTemplate}`]: {
    packageManager: packageManagers,
    component: getComponentNames,
  },
  [`template:${installGuideTemplate.uriTemplate}`]: {
    packageManager: packageManagers,
    buildTool: () => buildToolsByFramework[getFramework()] ?? [],
  },
};

const emptyResult: CompleteResult = { completion: { values: [], total: 0, hasMore: false } };

/**
 * Resolves completion values for a prompt or resource template argument.
 * Unknown references and fetch failures yield an empty result rather than an
 * error, since completion is requested as the user types.
 */
export async function complete(
  ref: CompleteRequestParams["ref"],
  argument: CompleteRequestParams["argument"]
): Promise<CompleteResult> {
  const key = ref.type === "ref/prompt" ? `prompt:${ref.name}` : `template:${ref.uri}`;
  const source = completionValues[key]?.[argument.name];
  if (!source) return emptyResult;

  try {
    const values = typeof source === "function" ? await source() : source;
    const prefix = argument.value.toLowerCase();
    const matches = values.filter((value) => value.toLowerCase().startsWith(prefix));

    return {
      completion: {
        values: matches.slice(0, MAX_VALUES),
        total: matches.length,
        hasMore: matches.length > MAX_VALUES,
      },
    };
  } catch (error) {
    logError(`Completion failed for ${key} argument ${argument.name}`, error);
    return emptyResult;
  }
}
