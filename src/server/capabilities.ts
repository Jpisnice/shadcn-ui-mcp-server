export const capabilities = {
  resources: {
    get_components: {
      description:
        "List of available shadcn/ui components that can be used in the project",
      uri: "resource:get_components",
      contentType: "text/plain",
    },
    get_install_script_for_component: {
      description:
        "Generate installation script for a specific shadcn/ui component based on package manager",
      uriTemplate:
        "resource-template:get_install_script_for_component?packageManager={packageManager}&component={component}",
      contentType: "text/plain",
    },
    get_installation_guide: {
      description:
        "Get the installation guide for shadcn/ui based on build tool and package manager",
      uriTemplate:
        "resource-template:get_installation_guide?buildTool={buildTool}&packageManager={packageManager}",
      contentType: "text/plain",
    },
  },
  prompts: {
    component_usage: {
      description: "Get usage examples for a specific component",
      arguments: {
        componentName: {
          type: "string",
          description: "Name of the component to get usage for",
        },
      },
    },
    component_search: {
      description: "Search for components by name or description",
      arguments: {
        query: {
          type: "string",
          description: "Search query",
        },
      },
    },
    component_comparison: {
      description: "Compare two components side by side",
      arguments: {
        component1: {
          type: "string",
          description: "First component name",
        },
        component2: {
          type: "string",
          description: "Second component name",
        },
      },
    },
    component_recommendation: {
      description: "Get component recommendations based on use case",
      arguments: {
        useCase: {
          type: "string",
          description: "Use case description",
        },
      },
    },
    component_tutorial: {
      description: "Get a step-by-step tutorial for using a component",
      arguments: {
        componentName: {
          type: "string",
          description: "Name of the component for tutorial",
        },
      },
    },
  },
  tools: {
    get_component: {
      description:
        "Get the source code for a specific shadcn/ui v4 component",
      inputSchema: {
        type: "object",
        properties: {
          componentName: {
            type: "string",
            description:
              'Name of the shadcn/ui component (e.g., "accordion", "button")',
          },
        },
        required: ["componentName"],
      },
    },
    get_component_demo: {
      description:
        "Get demo code illustrating how a shadcn/ui v4 component should be used",
      inputSchema: {
        type: "object",
        properties: {
          componentName: {
            type: "string",
            description:
              'Name of the shadcn/ui component (e.g., "accordion", "button")',
          },
        },
        required: ["componentName"],
      },
    },
    list_components: {
      description: "Get all available shadcn/ui v4 components",
      inputSchema: {
        type: "object",
        properties: {},
      },
    },
    get_component_metadata: {
      description: "Get metadata for a specific shadcn/ui v4 component",
      inputSchema: {
        type: "object",
        properties: {
          componentName: {
            type: "string",
            description:
              'Name of the shadcn/ui component (e.g., "accordion", "button")',
          },
        },
        required: ["componentName"],
      },
    },
    get_directory_structure: {
      description:
        "Get the directory structure of the shadcn-ui v4 repository",
      inputSchema: {
        type: "object",
        properties: {
          path: {
            type: "string",
            description: "Path within the repository (default: v4 registry)",
          },
          owner: {
            type: "string",
            description: 'Repository owner (default: "shadcn-ui")',
          },
          repo: {
            type: "string",
            description: 'Repository name (default: "ui")',
          },
          branch: {
            type: "string",
            description: 'Branch name (default: "main")',
          },
        },
      },
    },
    get_block: {
      description:
        "Get source code for a specific shadcn/ui v4 block (e.g., calendar-01, dashboard-01)",
      inputSchema: {
        type: "object",
        properties: {
          blockName: {
            type: "string",
            description:
              'Name of the block (e.g., "calendar-01", "dashboard-01", "login-02")',
          },
          includeComponents: {
            type: "boolean",
            description:
              "Whether to include component files for complex blocks (default: true)",
          },
        },
        required: ["blockName"],
      },
    },
    list_blocks: {
      description:
        "Get all available shadcn/ui v4 blocks with categorization",
      inputSchema: {
        type: "object",
        properties: {
          category: {
            type: "string",
            description:
              "Filter by category (calendar, dashboard, login, sidebar, products)",
          },
        },
      },
    },
    // Tweakcn theme tools
    get_tweakcn_presets: {
      description: "Fetch available tweakcn theme presets (list)",
      inputSchema: {
        type: "object",
        properties: {
          query: { type: "string", description: "Search keywords to filter presets" },
        },
      },
    },
    apply_tweakcn_theme: {
      description:
        "Apply a tweakcn theme preset to the project (writes CSS to global.css).",
      inputSchema: {
        type: "object",
        properties: {
          presetId: { type: "string", description: "ID of the preset to apply" },
          query: { type: "string", description: "Search keywords to find a preset" },
          tailwindVersion: { type: "string", description: "3 or 4", enum: ["3", "4"] },
          cssPath: { type: "string", description: "Optional explicit path to global.css to write" },
          dryRun: { type: "boolean", description: "If true, do not write files; just return preview" },
        },
        required: [],
      },
    },
    list_themes: {
      description: "List available tweakcn themes",
      inputSchema: {
        type: "object",
        properties: {
          query: { type: "string", description: "Search query to filter themes" },
        },
      },
    },
    get_theme: {
      description: "Get details of a specific tweakcn theme",
      inputSchema: {
        type: "object",
        properties: {
          themeName: { type: "string", description: "Name or ID of the theme to retrieve" },
        },
        required: ["themeName"],
      },
    },
  },
}