import { getAxiosImplementation } from '../../utils/framework.js';
import { logError } from '../../utils/logger.js';

export async function handleListComponents() {
  try {
    const axios = await getAxiosImplementation();
    const components = await axios.getAvailableComponents();
    return {
      content: [{ 
        type: "text", 
        text: JSON.stringify({ 
          components: components.sort(),
          total: components.length 
        }, null, 2) 
      }]
    };
  } catch (error) {
    logError('Failed to list components', error);
    throw new Error(`Failed to list components: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export const schema = {}; 