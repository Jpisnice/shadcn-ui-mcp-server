import { getAxiosImplementation, getFramework } from "../../utils/framework.js";
import { logError } from "../../utils/logger.js";

export async function handleGetBlock({
  blockName,
  includeComponents = true,
}: {
  blockName: string;
  includeComponents?: boolean;
}) {
  const framework = getFramework();

  if (framework === "react-native") {
    return {
      content: [
        {
          type: "text",
          text: `Blocks are not available for React Native framework. The react-native-reusables repository does not provide block templates.`,
        },
      ],
    };
  }

  try {
    const axios = await getAxiosImplementation();
    const blockData = await axios.getBlockCode(blockName, includeComponents);
    return {
      content: [{ type: "text", text: JSON.stringify(blockData, null, 2) }],
    };
  } catch (error) {
    logError(`Failed to get block "${blockName}"`, error);
    throw new Error(
      `Failed to get block "${blockName}": ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

export const schema = {
  blockName: {
    type: "string",
    description:
      'Name of the block (e.g., "dashboard-01", "login-02", "sidebar-01")',
  },
  includeComponents: {
    type: "boolean",
    description:
      "Whether to include component files for complex blocks (default: true)",
  },
};
