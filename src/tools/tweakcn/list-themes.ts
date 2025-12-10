import { z } from "zod";
import fetchPresetsFromGithub from "./fetch-presets.js";
import { DEFAULT_PRESETS_URL } from "./orchestrator.js";

export const schema = {
  query: z.string().optional().describe("Search query to filter themes"),
};

export async function handleListThemes(args: z.infer<z.ZodObject<typeof schema>>) {
  try {
    const presets = await fetchPresetsFromGithub(DEFAULT_PRESETS_URL);
    
    let results = Object.entries(presets).map(([id, theme]) => ({
      id,
      label: theme.label || theme.name || id,
      createdAt: theme.createdAt,
      // description: theme.description || "No description available",
    }));

    if (args.query) {
      const q = args.query.toLowerCase();
      results = results.filter(
        (t) =>
          t.id.toLowerCase().includes(q) ||
          t.label.toLowerCase().includes(q)
      );
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(results, null, 2),
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error listing themes: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
}
