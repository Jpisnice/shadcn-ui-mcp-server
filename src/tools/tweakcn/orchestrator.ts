import fetchPresetsFromGithub from "./fetch-presets.js";
import { filterPresets } from "./parse-presets.js";
import convertPresetToThemeStyles from "./convert-preset.js";
import generateCssAndConfig from "./generate-wrapper.js";
import { locateGlobalCss, writeThemeBlock } from "./locate-and-write.js";
import path from "path";

const DEFAULT_PRESETS_URL =
  "https://raw.githubusercontent.com/jnsahaj/tweakcn/main/utils/theme-presets.ts";

export async function applyPresetByIdOrQuery(options: {
  rootDir?: string;
  presetId?: string;
  query?: string;
  tailwindVersion?: "3" | "4";
  cssPath?: string;
  dryRun?: boolean;
}) {
  const root = options.rootDir || process.cwd();
  const url = DEFAULT_PRESETS_URL;

  const presets = await fetchPresetsFromGithub(url);

  let chosenId = options.presetId;
  if (!chosenId && options.query) {
    const matches = filterPresets(presets, options.query);
    if (matches.length === 0) {
      return { success: false, reason: "No matching presets" };
    }
    // pick first match
    chosenId = matches[0].id;
  }

  if (!chosenId) return { success: false, reason: "No presetId or query provided" };

  const preset = presets[chosenId];
  if (!preset) return { success: false, reason: `Preset not found: ${chosenId}` };

  const themeStyles = convertPresetToThemeStyles(preset);
  const { css, tailwindConfig } = generateCssAndConfig(themeStyles, options.tailwindVersion || "3");

  const targetPath = options.cssPath || (await locateGlobalCss(root)) || path.join(root, "src", "styles", "globals.css");

  if (options.dryRun) {
    return { success: true, preview: { css, tailwindConfig, targetPath } };
  }

  const result = await writeThemeBlock(targetPath, css, { createBackup: true });
  return { success: true, writtenTo: result.filePath, backup: result.backup };
}

export default applyPresetByIdOrQuery;
