/**
 * Request handler setup for the Model Context Protocol (MCP) server.
 * 
 * This file configures how the server responds to various MCP requests by setting up
 * handlers for resources, resource templates, tools, and prompts.
 * 
 * Uses the MCP TypeScript SDK v2 low-level Server (method-string handler registration).
 */
import {
  type Server,
  type Tool,
  type CallToolResult,
  type GetPromptResult,
  type CompleteResult,
  ProtocolError,
  ProtocolErrorCode,
  ResourceNotFoundError,
} from "@modelcontextprotocol/server";
import { resourceHandlers, resources } from "../resources/index.js";
import { promptHandlers, prompts } from "../prompts/index.js";
import { toolHandlers, tools } from "../tools/index.js";
import { complete } from "../completions/index.js";
import {
  getResourceTemplate,
  resourceTemplates,
} from "../resource-templates/index.js";
import { z } from "zod";
import { validateAndSanitizeParams, validateRequest, getValidationSchema } from '../utils/validation.js';
import { circuitBreakers, isUpstreamFailure } from '../utils/circuit-breaker.js';
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
    const result = await circuitBreakers.external.execute(() => handler(validatedParams), isUpstreamFailure);
    
    return result;
  } catch (error) {
    logError(`Error in ${method}`, error);
    throw error;
  }
}

/**
 * Sets up all request handlers for the MCP server
 * Handlers are registered by spec method name (MCP SDK v2)
 * @param server - The MCP server instance
 */
export const setupHandlers = (server: Server): void => {
  logInfo('Setting up request handlers...');

  // List available resources when clients request them
  server.setRequestHandler('resources/list',
    async (request) => {
      return await handleRequest(
        'list_resources',
        request.params,
        async () => ({ resources })
      );
    }
  );
  
  // Resource Templates
  server.setRequestHandler('resources/templates/list', async (request) => {
    return await handleRequest(
      'list_resource_templates',
      request.params,
      async () => ({ resourceTemplates })
    );
  });

  // List available tools
  server.setRequestHandler('tools/list', async (request) => {
    return await handleRequest(
      'list_tools',
      request.params,
      async () => {
        // Return the tools that are registered with the server
        const registeredTools: Tool[] = [
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
            annotations: {
              title: "Get Component",
              readOnlyHint: true,
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
            annotations: {
              title: "Get Component Demo",
              readOnlyHint: true,
            },
          },
          {
            name: 'list_components',
            description: 'Get all available shadcn/ui v4 components',
            inputSchema: {
              type: 'object',
              properties: {},
            },
            annotations: {
              title: "List Components",
              readOnlyHint: true,
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
            annotations: {
              title: "Get Component Metadata",
              readOnlyHint: true,
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
            annotations: {
              title: "Get Directory Structure",
              readOnlyHint: true,
            },
          },
          {
            name: 'get_block',
            description: 'Get source code for a specific shadcn/ui v4 block (e.g., dashboard-01, login-02, sidebar-01)',
            inputSchema: {
              type: 'object',
              properties: {
                blockName: {
                  type: 'string',
                  description: 'Name of the block (e.g., "dashboard-01", "login-02", "sidebar-01")',
                },
                includeComponents: {
                  type: 'boolean',
                  description: 'Whether to include component files for complex blocks (default: true)',
                },
              },
              required: ['blockName'],
            },
            annotations: {
              title: "Get Block",
              readOnlyHint: true,
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
            annotations: {
              title: "List Blocks",
              readOnlyHint: true,
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
            annotations: {
              title: "Apply Theme",
              destructiveHint: true,
            },
          },
          {
            name: 'list_themes',
            description: 'List available tweakcn themes',
            inputSchema: {
              type: 'object',
              properties: {},
            },
            annotations: {
              title: "List Themes",
              readOnlyHint: true,
            },
          },
          {
            name: 'get_theme',
            description: 'Get details of a specific tweakcn theme',
            inputSchema: {
              type: 'object',
              properties: {
                themeName: {
                  type: 'string',
                  description: "Name or ID of the theme to retrieve",
                },
              },
              required: ['themeName'],
            },
            annotations: {
              title: "Get Theme",
              readOnlyHint: true,
            },
          },
        ];
        
        return { tools: registeredTools };
      }
    );
  });
  
  // Return resource content when clients request it
  server.setRequestHandler('resources/read', async (request) => {
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
            contents: [{
              uri: uri,
              mimeType: result.contentType,
              text: result.content
            }]
          };
        }
        
        // Check if this is a generated resource from a template
        const resourceTemplateHandler = getResourceTemplate(uri);
        if (resourceTemplateHandler) {
          const result = await Promise.resolve(resourceTemplateHandler());
          return {
            contents: [{
              uri: uri,
              mimeType: result.contentType,
              text: result.content
            }]
          };
        }
        
        // -32602 with data.uri, per the 2026-07-28 spec (previously -32002)
        throw new ResourceNotFoundError(uri, `Resource not found: ${uri}`);
      }
    );
  });

  // List available prompts
  server.setRequestHandler('prompts/list', async (request) => {
    return await handleRequest(
      'list_prompts',
      request.params,
      async () => ({ prompts: Object.values(prompts) })
    );
  });

  // Get specific prompt content with optional arguments
  server.setRequestHandler('prompts/get', async (request): Promise<GetPromptResult> => {
    return await handleRequest(
      'get_prompt',
      request.params,
      async (validatedParams: any) => {
        const { name, arguments: args } = validatedParams;
        const promptHandler = promptHandlers[name as keyof typeof promptHandlers];
        
        if (!promptHandler) {
          throw new ProtocolError(ProtocolErrorCode.InvalidParams, `Prompt not found: ${name}`);
        }
        
        // Prompt helpers build untyped literals; they follow the GetPromptResult shape
        return promptHandler(args as any) as GetPromptResult;
      }
    );
  });

  // Argument completion for prompts and resource templates. Not routed through
  // handleRequest: it runs per keystroke and already returns empty results on
  // failure, so it should not count against the circuit breaker.
  server.setRequestHandler('completion/complete', async (request): Promise<CompleteResult> => {
    return complete(request.params.ref, request.params.argument);
  });

  // Tool request Handler - executes the requested tool with provided parameters
  server.setRequestHandler('tools/call', async (request): Promise<CallToolResult> => {
    return await handleRequest(
      'call_tool',
      request.params,
      async (validatedParams: any) => {
        const { name, arguments: params } = validatedParams;
        
        if (!name || typeof name !== 'string') {
          throw new ProtocolError(ProtocolErrorCode.InvalidParams, "Tool name is required");
        }
        
        const handler = toolHandlers[name as keyof typeof toolHandlers];

        if (!handler) {
          throw new ProtocolError(ProtocolErrorCode.InvalidParams, `Tool not found: ${name}`);
        }

        // Validate the tool's own arguments (the call_tool schema above only
        // checks the request envelope). Invalid arguments are returned as a
        // tool error the calling agent can read and correct.
        let toolArgs = params || {};
        const argsSchema = getValidationSchema(name);
        if (argsSchema) {
          try {
            toolArgs = validateRequest(argsSchema, toolArgs);
          } catch (error) {
            return {
              content: [{ type: "text", text: `Invalid arguments for ${name}: ${error instanceof Error ? error.message : String(error)}` }],
              isError: true
            };
          }
        }

        // Execute with circuit breaker protection. Execution failures (missing
        // component, GitHub errors, open breaker) are returned as tool results
        // with isError so the model can read them and self-correct; protocol
        // errors are reserved for unknown tools and malformed requests.
        try {
          const result = await circuitBreakers.external.execute(
            () => Promise.resolve(handler(toolArgs)),
            isUpstreamFailure
          );
          return result as CallToolResult;
        } catch (error) {
          logError(`Tool  failed`, error);
          return {
            content: [{ type: "text", text: error instanceof Error ? error.message : String(error) }],
            isError: true
          };
        }
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
 * 
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

      case 'list_themes':
        return z.object({
          query: z.string().optional(),
        });

      case 'get_theme':
        return z.object({
          themeName: z.string(),
        });
        
      default:
        return undefined;
    }
  } catch (error) {
    logError('Schema error', error);
    return undefined;
  }
}