/**
 * Request handler setup for the Model Context Protocol (MCP) server.
 * 
 * This file configures how the server responds to various MCP requests by setting up
 * handlers for resources, resource templates, tools, and prompts.
 * 
 * Updated for MCP SDK 1.16.0 with improved error handling and request processing.
 */
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListResourceTemplatesRequestSchema,
  ReadResourceRequestSchema,
  ListToolsRequestSchema,
  GetPromptRequestSchema,
  ListPromptsRequestSchema,
  ErrorCode,
  McpError
} from "@modelcontextprotocol/sdk/types.js";
import { type Server } from "@modelcontextprotocol/sdk/server/index.js";
import { resourceHandlers, resources } from "../resources/index.js";
import { promptHandlers, prompts } from "../prompts/index.js";
import { toolHandlers, tools } from "../tools/index.js";
import {
  getResourceTemplate,
  resourceTemplates,
} from "../resource-templates/index.js";
import { z } from "zod";
import { validateAndSanitizeParams } from '../utils/validation.js';
import { circuitBreakers } from '../utils/circuit-breaker.js';
import { logError, logInfo } from '../utils/logger.js';

// Define basic component schemas here for tool validation
const componentSchema = { componentName: z.string() };
const searchSchema = { query: z.string() };
const themesSchema = { query: z.string().optional() };
const blocksSchema = { 
  query: z.string().optional(), 
  category: z.string().optional() 
};

/**
 * Wrapper function to handle requests with simple error handling
 */
async function handleRequest<T>(
  method: string,
  params: any,
  handler: (validatedParams: any) => Promise<T>
): Promise<T> {
  try {
    // Validate and sanitize input parameters
    const validatedParams = validateAndSanitizeParams(method, params);
    
    // Execute the handler with circuit breaker protection for external calls
    const result = await circuitBreakers.external.execute(() => handler(validatedParams));
    
    return result;
  } catch (error) {
    logError(`Error in ${method}`, error);
    throw error;
  }
}

/**
 * Sets up all request handlers for the MCP server
 * Following MCP SDK 1.16.0 best practices for handler registration
 * @param server - The MCP server instance
 */
export const setupHandlers = (server: Server): void => {
  logInfo('Setting up request handlers...');

  // List available resources when clients request them
  server.setRequestHandler(
    ListResourcesRequestSchema,
    async (request) => {
      return await handleRequest(
        'list_resources',
        request.params,
        async () => ({ resources })
      );
    }
  );
  
  // Resource Templates
  server.setRequestHandler(ListResourceTemplatesRequestSchema, async (request) => {
    return await handleRequest(
      'list_resource_templates',
      request.params,
      async () => ({ resourceTemplates })
    );
  });

  // List available tools
  server.setRequestHandler(ListToolsRequestSchema, async (request) => {
    return await handleRequest(
      'list_tools',
      request.params,
      async () => {
        // Return the tools that are registered with the server
        const registeredTools = [
          {
            name: 'get_component',
            description: 'Get the source code for a specific shadcn/ui v4 component',
            inputSchema: {
              type: 'object',
              properties: {
                componentName: {
                  type: 'string',
                  description: 'Name of the shadcn/ui component (e.g., "accordion", "button")',
                },
              },
              required: ['componentName'],
            },
          },
          {
            name: 'get_component_demo',
            description: 'Get demo code illustrating how a shadcn/ui v4 component should be used',
            inputSchema: {
              type: 'object',
              properties: {
                componentName: {
                  type: 'string',
                  description: 'Name of the shadcn/ui component (e.g., "accordion", "button")',
                },
              },
              required: ['componentName'],
            },
          },
          {
            name: 'list_components',
            description: 'Get all available shadcn/ui v4 components',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'get_component_metadata',
            description: 'Get metadata for a specific shadcn/ui v4 component',
            inputSchema: {
              type: 'object',
              properties: {
                componentName: {
                  type: 'string',
                  description: 'Name of the shadcn/ui component (e.g., "accordion", "button")',
                },
              },
              required: ['componentName'],
            },
          },
          {
            name: 'get_directory_structure',
            description: 'Get the directory structure of the shadcn-ui v4 repository',
            inputSchema: {
              type: 'object',
              properties: {
                path: {
                  type: 'string',
                  description: 'Path within the repository (default: v4 registry)',
                },
                owner: {
                  type: 'string',
                  description: 'Repository owner (default: "shadcn-ui")',
                },
                repo: {
                  type: 'string',
                  description: 'Repository name (default: "ui")',
                },
                branch: {
                  type: 'string',
                  description: 'Branch name (default: "main")',
                },
              },
            },
          },
          {
            name: 'get_block',
            description: 'Get source code for a specific shadcn/ui v4 block (e.g., calendar-01, dashboard-01)',
            inputSchema: {
              type: 'object',
              properties: {
                blockName: {
                  type: 'string',
                  description: 'Name of the block (e.g., "calendar-01", "dashboard-01", "login-02")',
                },
                includeComponents: {
                  type: 'boolean',
                  description: 'Whether to include component files for complex blocks (default: true)',
                },
              },
              required: ['blockName'],
            },
          },
          {
            name: 'list_blocks',
            description: 'Get all available shadcn/ui v4 blocks with categorization',
            inputSchema: {
              type: 'object',
              properties: {
                category: {
                  type: 'string',
                  description: 'Filter by category (calendar, dashboard, login, sidebar, products)',
                },
              },
            },
          },
          {
            name: 'apply_theme',
            description: 'Apply a TweakCN theme preset to the project',
            inputSchema: {
              type: 'object',
              properties: {
                query: {
                  type: 'string',
                  description: "Search query for theme (e.g., 'cyberpunk', 'modern')",
                },
                presetId: {
                  type: 'string',
                  description: "Specific preset ID if known",
                },
                tailwindVersion: {
                  type: 'string',
                  enum: ['3', '4'],
                  description: "Tailwind CSS version (default: '4')",
                },
                dryRun: {
                  type: 'boolean',
                  description: "If true, returns preview instead of writing files",
                },
              },
            },
          },
        ];
        
        return { tools: registeredTools };
      }
    );
  });
  
  // Return resource content when clients request it
  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    return await handleRequest(
      'read_resource',
      request.params,
      async (validatedParams: any) => {
        const { uri } = validatedParams;
        
        // Check if this is a static resource
        const resourceHandler = resourceHandlers[uri as keyof typeof resourceHandlers];
        if (resourceHandler) {
          const result = await Promise.resolve(resourceHandler());
          return {
            contentType: result.contentType,
            contents: [{
              uri: uri,
              text: result.content
            }]
          };
        }
        
        // Check if this is a generated resource from a template
        const resourceTemplateHandler = getResourceTemplate(uri);
        if (resourceTemplateHandler) {
          const result = await Promise.resolve(resourceTemplateHandler());
          return {
            contentType: result.contentType,
            contents: [{
              uri: uri,
              text: result.content
            }]
          };
        }
        
        throw new Error(`Resource not found: ${uri}`);
      }
    );
  });

  // List available prompts
  server.setRequestHandler(ListPromptsRequestSchema, async (request) => {
    return await handleRequest(
      'list_prompts',
      request.params,
      async () => ({ prompts: Object.values(prompts) })
    );
  });

  // Get specific prompt content with optional arguments
  server.setRequestHandler(GetPromptRequestSchema, async (request) => {
    return await handleRequest(
      'get_prompt',
      request.params,
      async (validatedParams: any) => {
        const { name, arguments: args } = validatedParams;
        const promptHandler = promptHandlers[name as keyof typeof promptHandlers];
        
        if (!promptHandler) {
          throw new Error(`Prompt not found: ${name}`);
        }
        
        return promptHandler(args as any);
      }
    );
  });

  // Tool request Handler - executes the requested tool with provided parameters
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    return await handleRequest(
      'call_tool',
      request.params,
      async (validatedParams: any) => {
        const { name, arguments: params } = validatedParams;
        
        if (!name || typeof name !== 'string') {
          throw new Error("Tool name is required");
        }
        
        const handler = toolHandlers[name as keyof typeof toolHandlers];

        if (!handler) {
          throw new Error(`Tool not found: ${name}`);
        }

        // Execute handler with circuit breaker protection
        const result = await circuitBreakers.external.execute(() => 
          Promise.resolve(handler(params || {}))
        );
        
        return result;
      }
    );
  });
  
  // Add global error handler
  server.onerror = (error) => {
    logError('MCP server error', error);
  };

  logInfo('Handlers setup complete');
};

/**
 * Get Zod schema for tool validation if available
 * Following MCP SDK 1.16.0 best practices for schema validation
 * @param toolName Name of the tool
 * @returns Zod schema or undefined
 */
function getToolSchema(toolName: string): z.ZodType | undefined {
  try {
    switch(toolName) {
      case 'get_component':
      case 'get_component_details':
        return z.object(componentSchema);
        
      case 'get_examples':
        return z.object(componentSchema);
        
      case 'get_usage':
        return z.object(componentSchema);
        
      case 'search_components':
        return z.object(searchSchema);
        
      case 'get_themes':
        return z.object(themesSchema);
        
      case 'get_blocks':
        return z.object(blocksSchema);
        
      case 'apply_theme':
        return z.object({
          query: z.string().optional(),
          presetId: z.string().optional(),
          tailwindVersion: z.enum(['3', '4']).optional(),
          dryRun: z.boolean().optional(),
        });
        
      default:
        return undefined;
    }
  } catch (error) {
    logError('Schema error', error);
    return undefined;
  }
}