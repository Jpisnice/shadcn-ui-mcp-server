import { getAxiosImplementation } from '../../utils/framework.js';
import { logError } from '../../utils/logger.js';

export async function handleGetDirectoryStructure({ 
  path, 
  owner, 
  repo, 
  branch 
}: { 
  path?: string, 
  owner?: string, 
  repo?: string, 
  branch?: string 
}) {
  try {
    const axios = await getAxiosImplementation();
    // Get the default path based on available properties
    const defaultPath = 'BLOCKS' in axios.paths ? axios.paths.BLOCKS : axios.paths.NEW_YORK_V4_PATH;
    
    const directoryTree = await axios.buildDirectoryTree(
      owner || axios.paths.REPO_OWNER,
      repo || axios.paths.REPO_NAME,
      path || defaultPath,
      branch || axios.paths.REPO_BRANCH
    );
    return {
      content: [{ 
        type: "text", 
        text: JSON.stringify(directoryTree, null, 2)
      }]
    };
  } catch (error) {
    logError('Failed to get directory structure', error);
    throw new Error(`Failed to get directory structure: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export const schema = {
  path: {
    type: 'string',
    description: 'Path within the repository (default: v4 registry)'
  },
  owner: {
    type: 'string',
    description: 'Repository owner (default: "shadcn-ui")'
  },
  repo: {
    type: 'string',
    description: 'Repository name (default: "ui")'
  },
  branch: {
    type: 'string',
    description: 'Branch name (default: "main")'
  }
}; 