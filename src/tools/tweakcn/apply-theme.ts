import { z } from "zod";
import { applyPresetByIdOrQuery } from "./orchestrator.js";

export const schema = {
  query: z.string().optional().describe("Search query for theme (e.g., 'cyberpunk', 'modern')"),
  presetId: z.string().optional().describe("Specific preset ID if known"),
  tailwindVersion: z.enum(["3", "4"]).optional().describe("Tailwind CSS version (default: '4')"),
  dryRun: z.boolean().optional().describe("If true, returns preview instead of writing files"),
};

export async function handleApplyTheme(args: z.infer<z.ZodObject<typeof schema>>) {
  try {
    const result = await applyPresetByIdOrQuery({
      query: args.query,
      presetId: args.presetId,
      tailwindVersion: args.tailwindVersion,
      dryRun: args.dryRun,
    });

    if (!result.success) {
      return {
        content: [
          {
            type: "text",
            text: `Failed to apply theme: ${result.reason}`,
          },
        ],
        isError: true,
      };
    }

    if (args.dryRun && result.preview) {
      return {
        content: [
          {
            type: "text",
            text: `Theme Preview:\n\nTailwind Config:\n${JSON.stringify(result.preview.tailwindConfig, null, 2)}\n\nCSS:\n${result.preview.css.substring(0, 500)}... (truncated)`,
          },
        ],
      };
    }

    return {
      content: [
        {
          type: "text",
          text: `Successfully applied theme to ${result.writtenTo}${result.backup ? ` (Backup created at ${result.backup})` : ""}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error applying theme: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
}
