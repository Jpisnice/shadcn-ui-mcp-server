import { z } from "zod";
import fetchPresetsFromGithub from "./fetch-presets.js";
import { DEFAULT_PRESETS_URL } from "./orchestrator.js";

export const schema = {
  themeName: z.string().describe("Name or ID of the theme to retrieve"),
};

export async function handleGetTheme(args: z.infer<z.ZodObject<typeof schema>>) {
  try {
    const presets = await fetchPresetsFromGithub(DEFAULT_PRESETS_URL);
    const themeId = args.themeName;
    
    // Direct match
    if (presets[themeId]) {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(presets[themeId], null, 2),
          },
        ],
      };
    }

    // Search by label if ID not found
    const foundId = Object.keys(presets).find(
      (id) => (presets[id].label && presets[id].label.toLowerCase() === themeId.toLowerCase()) || id.toLowerCase() === themeId.toLowerCase()
    );

    if (foundId) {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(presets[foundId], null, 2),
          },
        ],
      };
    }

    return {
      content: [
        {
          type: "text",
          text: `Theme not found: ${themeId}`,
        },
      ],
      isError: true,
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error getting theme: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
}
