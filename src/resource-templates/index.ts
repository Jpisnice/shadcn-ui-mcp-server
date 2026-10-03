/**
 * Resource templates implementation for the Model Context Protocol (MCP) server.
 *
 * This file defines resource templates that can be used to dynamically generate
 * resources based on parameters in the URI.
 */

import { getFramework } from "../utils/framework.js";

/**
 * Resource template definitions exported to the MCP handler
 * Each template has a name, description, uriTemplate and mimeType
 */
export const resourceTemplates = [
  {
    name: "get_install_script_for_component",
    description:
      "Generate installation script for a specific shadcn/ui component based on package manager",
    uriTemplate:
      "resource-template:get_install_script_for_component?packageManager={packageManager}&component={component}",
    mimeType: "text/plain",
  },
  {
    name: "get_installation_guide",
    description:
      "Get the installation guide for shadcn/ui based on build tool and package manager",
    uriTemplate:
      "resource-template:get_installation_guide?buildTool={buildTool}&packageManager={packageManager}",
    mimeType: "text/plain",
  },
];

// Create a map for easier access in getResourceTemplate
const resourceTemplateMap = {
  get_install_script_for_component: resourceTemplates[0],
  get_installation_guide: resourceTemplates[1],
};

/**
 * Extract parameters from URI
 * @param uri URI to extract from
 * @param paramName Name of parameter to extract
 * @returns Parameter value or undefined
 */
function extractParam(uri: string, paramName: string): string | undefined {
  const match = uri.match(new RegExp(`${paramName}=([^&]+)`));
  return match?.[1];
}

/**
 * Gets a resource template handler for a given URI
 * @param uri The URI of the resource template
 * @returns A function that generates the resource
 */
export const getResourceTemplate = (uri: string) => {
  // Component installation script template
  if (uri.startsWith("resource-template:get_install_script_for_component")) {
    return async () => {
      try {
        const packageManager = extractParam(uri, "packageManager");
        const component = extractParam(uri, "component");

        if (!packageManager) {
          return {
            content:
              "Missing packageManager parameter. Please specify npm, pnpm, or yarn.",
            contentType: "text/plain",
          };
        }

        if (!component) {
          return {
            content:
              "Missing component parameter. Please specify the component name.",
            contentType: "text/plain",
          };
        }

        // Get current framework and determine package name
        const framework = getFramework();
        let packageName: string;
        switch (framework) {
          case "svelte":
            packageName = "shadcn-svelte";
            break;
          case "vue":
            packageName = "shadcn-vue";
            break;
          case "react":
            packageName = "shadcn";
            break;
          default:
            packageName = "shadcn";
            break;
        }

        // Generate installation script based on package manager
        let installCommand: string;

        switch (packageManager.toLowerCase()) {
          case "npm":
            installCommand = `npx ${packageName}@latest add ${component} --yes --overwrite`;
            break;
          case "pnpm":
            installCommand = `pnpm dlx ${packageName}@latest add ${component} --yes --overwrite`;
            break;
          case "yarn":
            installCommand = `yarn dlx ${packageName}@latest add ${component} --yes --overwrite`;
            break;
          case "bun":
            installCommand = `bunx --bun ${packageName}@latest add ${component} --yes --overwrite`;
            break;
          default:
            installCommand = `npx ${packageName}@latest add ${component} --yes --overwrite`;
        }

        return {
          content: installCommand,
          contentType: "text/plain",
        };
      } catch (error) {
        return {
          content: `Error generating installation script: ${
            error instanceof Error ? error.message : String(error)
          }`,
          contentType: "text/plain",
        };
      }
    };
  }

  // Installation guide template
  if (uri.startsWith("resource-template:get_installation_guide")) {
    return async () => {
      try {
        const buildTool = extractParam(uri, "buildTool");
        const packageManager = extractParam(uri, "packageManager");

        // Get current framework first since it's used in validation
        const currentFramework = getFramework();

        if (!buildTool) {
          return {
            content:
              currentFramework === "svelte"
                ? "Missing buildTool parameter. Available option: vite"
                : "Missing buildTool parameter. Please specify next, vite, remix, etc.",
            contentType: "text/plain",
          };
        }

        // Validate build tool for Svelte
        if (
          currentFramework === "svelte" &&
          buildTool.toLowerCase() !== "vite"
        ) {
          return {
            content: 'Invalid build tool for Svelte. Only "vite" is supported.',
            contentType: "text/plain",
          };
        }

        if (!packageManager) {
          return {
            content:
              "Missing packageManager parameter. Please specify npm, pnpm, or yarn.",
            contentType: "text/plain",
          };
        }

        // Determine package name
        let packageName: any;
        switch (currentFramework) {
          case "svelte":
            packageName = "shadcn-svelte";
            break;
          case "vue":
            packageName = "shadcn-vue";
            break;
          case "react":
            packageName = "shadcn-ui";
            break;
          case "react-native":
            packageName = "@react-native-reusables/cli";
            break;
          default:
            packageName = "shadcn-ui";
            break;
        }
        // Generate installation guide based on build tool and package manager
        let guides: any;
        switch (currentFramework) {
          case "svelte": {
            guides = {
              vite: {
                description: "Installation guide for Svelte Vite project",
                steps: [
                  "Create a Vite project if you don't have one already:",
                  `${packageManager}${
                    packageManager === "npm" ? " create" : ""
                  } vite my-app -- --template svelte-ts`,
                  "",
                  "Navigate to your project directory:",
                  "cd my-app",
                  "",
                  "Install dependencies:",
                  packageManager === "npm"
                    ? `npm i && npm install -D tailwindcss @tailwindcss/vite`
                    : packageManager === "pnpm"
                    ? `pnpm i && pnpm install -D tailwindcss @tailwindcss/vite`
                    : packageManager === "yarn"
                    ? `yarn add tailwindcss @tailwindcss/vite`
                    : packageManager === "bun"
                    ? `bunx --bun install tailwindcss @tailwindcss/vite`
                    : `npm install tailwindcss @tailwindcss/vite`,
                  "",
                  "The current version of Vite splits TypeScript configuration into three files, two of which need to be edited.",
                  "Add the baseUrl and paths properties to the compilerOptions section of the tsconfig.json and tsconfig.app.json files",
                  '"compilerOptions": { "baseUrl": ".", "paths": { "$lib": ["./src/lib"], "$lib/*": ["./src/lib/*"] } }',
                  "",
                  "Add the following code to the tsconfig.app.json file to resolve paths, for your IDE:",
                  '"baseUrl": ".", "paths": { "$lib": ["./src/lib"], "$lib/*": ["./src/lib/*"] }',
                  "",
                  "Add the following code to the vite.config.ts so your app can resolve paths without error",
                  'resolve: { alias: { $lib: path.resolve("./src/lib"), }, },',
                  "Make sure, the following code is added to the vite.config.ts file:",
                  'import path from "path";',
                  "",
                  "Add the @tailwindcss/vite plugin to your Vite configuration (vite.config.ts).",
                  "import tailwindcss from '@tailwindcss/vite'",
                  "Make sure the following code is updated to the vite.config.ts file:",
                  "export default defineConfig({ plugins: [ tailwindcss(), ], })",
                  "",
                  "Add the following code to the app.css file:",
                  '@import "tailwindcss";',
                  "",
                  "Add shadcn/ui to your project (non-interactive):",
                  packageManager === "npm"
                    ? `npx ${packageName}@latest init --overwrite --base-color slate --css src/app.css --components-alias $lib/components --lib-alias $lib/ --utils-alias $lib/utils --hooks-alias $lib/hooks --ui-alias $lib/ui`
                    : packageManager === "pnpm"
                    ? `pnpm dlx ${packageName}@latest init --overwrite --base-color slate --css src/app.css --components-alias $lib/components --lib-alias $lib/ --utils-alias $lib/utils --hooks-alias $lib/hooks --ui-alias $lib/ui`
                    : packageManager === "yarn"
                    ? `yarn dlx ${packageName}@latest init --overwrite --base-color slate --css src/app.css --components-alias $lib/components --lib-alias $lib/ --utils-alias $lib/utils --hooks-alias $lib/hooks --ui-alias $lib/ui`
                    : packageManager === "bun"
                    ? `bunx --bun ${packageName}@latest init --overwrite --base-color slate --css src/app.css --components-alias $lib/components --lib-alias $lib/ --utils-alias $lib/utils --hooks-alias $lib/hooks --ui-alias $lib/ui`
                    : `npx ${packageName}@latest init --overwrite --base-color slate --css src/app.css --components-alias $lib/components --lib-alias $lib --utils-alias $lib/utils --hooks-alias $lib/hooks --ui-alias $lib/ui`,
                  "",
                  "The command will automatically configure your project with sensible defaults.",
                  "",
                  "Once initialized, you can add components:",
                  packageManager === "npm"
                    ? `npx ${packageName}@latest add button --yes --overwrite`
                    : packageManager === "pnpm"
                    ? `pnpm dlx ${packageName}@latest add button --yes --overwrite`
                    : packageManager === "yarn"
                    ? `yarn dlx ${packageName}@latest add button --yes --overwrite`
                    : packageManager === "bun"
                    ? `bunx --bun ${packageName}@latest add button --yes --overwrite`
                    : `npx ${packageName}@latest add button --yes --overwrite`,
                  "",
                  "Now you can use the component in your project!",
                ],
              },
              default: {
                description: "Generic installation guide for Svelte",
                steps: [
                  "Make sure you have a Svelte project set up",
                  "",
                  "Add shadcn/ui to your project (non-interactive):",
                  packageManager === "npm"
                    ? `npx ${packageName}@latest init --overwrite --base-color slate --css src/app.css --components-alias $lib/components --lib-alias $lib/ --utils-alias $lib/utils --hooks-alias $lib/hooks --ui-alias $lib/ui`
                    : packageManager === "pnpm"
                    ? `pnpm dlx ${packageName}@latest init --overwrite --base-color slate --css src/app.css --components-alias $lib/components --lib-alias $lib/ --utils-alias $lib/utils --hooks-alias $lib/hooks --ui-alias $lib/ui`
                    : packageManager === "yarn"
                    ? `yarn dlx ${packageName}@latest init --overwrite --base-color slate --css src/app.css --components-alias $lib/components --lib-alias $lib/ --utils-alias $lib/utils --hooks-alias $lib/hooks --ui-alias $lib/ui`
                    : packageManager === "bun"
                    ? `bunx --bun ${packageName}@latest init --overwrite --base-color slate --css src/app.css --components-alias $lib/components --lib-alias $lib/ --utils-alias $lib/utils --hooks-alias $lib/hooks --ui-alias $lib/ui`
                    : `npx ${packageName}@latest init --overwrite --base-color slate --css src/app.css --components-alias $lib/components --lib-alias $lib/ --utils-alias $lib/utils --hooks-alias $lib/hooks --ui-alias $lib/ui`,
                  "",
                  "The command will automatically configure your project with sensible defaults.",
                  "",
                  "Once initialized, you can add components (non-interactive):",
                  packageManager === "npm"
                    ? `npx ${packageName}@latest add button --yes --overwrite`
                    : packageManager === "pnpm"
                    ? `pnpm dlx ${packageName}@latest add button --yes --overwrite`
                    : packageManager === "yarn"
                    ? `yarn dlx ${packageName}@latest add button --yes --overwrite`
                    : packageManager === "bun"
                    ? `bunx --bun ${packageName}@latest add button --yes --overwrite`
                    : `npx ${packageName}@latest add button --yes --overwrite`,
                  "",
                  "Now you can use the component in your project!",
                ],
              },
            };
            break;
          }
          case "react":
            guides = {
              next: {
                description: "Installation guide for Next.js project",
                steps: [
                  "Create a Next.js project if you don't have one already:",
                  `${packageManager} create next-app my-app`,
                  "",
                  "Navigate to your project directory:",
                  "cd my-app",
                  "",
                  "Add shadcn/ui to your project:",
                  packageManager === "npm"
                    ? `npx ${packageName}@latest init`
                    : packageManager === "pnpm"
                    ? `pnpm dlx ${packageName}@latest init`
                    : packageManager === "yarn"
                    ? `yarn dlx ${packageName}@latest init`
                    : packageManager === "bun"
                    ? `bunx --bun ${packageName}@latest init`
                    : `npx ${packageName}@latest init`,
                  "",
                  "Follow the prompts to select your preferences",
                  "",
                  "Once initialized, you can add components:",
                  packageManager === "npm"
                    ? `npx ${packageName}@latest add button`
                    : packageManager === "pnpm"
                    ? `pnpm dlx ${packageName}@latest add button`
                    : packageManager === "yarn"
                    ? `yarn dlx ${packageName}@latest add button`
                    : packageManager === "bun"
                    ? `bunx --bun ${packageName}@latest add button`
                    : `npx ${packageName}@latest add button`,
                  "",
                  "Now you can use the component in your project!",
                ],
              },
              vite: {
                description: "Installation guide for Vite project",
                steps: [
                  "Create a Vite project if you don't have one already:",
                  `${packageManager}${
                    packageManager === "npm" ? " create" : ""
                  } vite my-app -- --template react-ts`,
                  "",
                  "Navigate to your project directory:",
                  "cd my-app",
                  "",
                  "Install dependencies:",
                  `${packageManager} ${
                    packageManager === "npm" ? "install" : "add"
                  } -D tailwindcss postcss autoprefixer`,
                  "",
                  "Initialize Tailwind CSS:",
                  "npx tailwindcss init -p",
                  "",
                  "Add shadcn/ui to your project:",
                  packageManager === "npm"
                    ? `npx ${packageName}@latest init`
                    : packageManager === "pnpm"
                    ? `pnpm dlx ${packageName}@latest init`
                    : packageManager === "yarn"
                    ? `yarn dlx ${packageName}@latest init`
                    : packageManager === "bun"
                    ? `bunx --bun ${packageName}@latest init`
                    : `npx ${packageName}@latest init`,
                  "",
                  "Follow the prompts to select your preferences",
                  "",
                  "Once initialized, you can add components:",
                  packageManager === "npm"
                    ? `npx ${packageName}@latest add button`
                    : packageManager === "pnpm"
                    ? `pnpm dlx ${packageName}@latest add button`
                    : packageManager === "yarn"
                    ? `yarn dlx ${packageName}@latest add button`
                    : packageManager === "bun"
                    ? `bunx --bun ${packageName}@latest add button`
                    : `npx ${packageName}@latest add button`,
                  "",
                  "Now you can use the component in your project!",
                ],
              },
              remix: {
                description: "Installation guide for Remix project",
                steps: [
                  "Create a Remix project if you don't have one already:",
                  `${
                    packageManager === "npm"
                      ? "npx"
                      : packageManager === "pnpm"
                      ? "pnpm dlx"
                      : packageManager === "yarn"
                      ? "yarn dlx"
                      : "bunx"
                  } create-remix my-app`,
                  "",
                  "Navigate to your project directory:",
                  "cd my-app",
                  "",
                  "Install dependencies:",
                  `${packageManager} ${
                    packageManager === "npm" ? "install" : "add"
                  } -D tailwindcss postcss autoprefixer`,
                  "",
                  "Initialize Tailwind CSS:",
                  "npx tailwindcss init -p",
                  "",
                  "Add shadcn/ui to your project:",
                  packageManager === "npm"
                    ? `npx ${packageName}@latest init`
                    : packageManager === "pnpm"
                    ? `pnpm dlx ${packageName}@latest init`
                    : packageManager === "yarn"
                    ? `yarn dlx ${packageName}@latest init`
                    : packageManager === "bun"
                    ? `bunx --bun ${packageName}@latest init`
                    : `npx ${packageName}@latest init`,
                  "",
                  "Follow the prompts to select your preferences",
                  "",
                  "Once initialized, you can add components:",
                  packageManager === "npm"
                    ? `npx ${packageName}@latest add button`
                    : packageManager === "pnpm"
                    ? `pnpm dlx ${packageName}@latest add button`
                    : packageManager === "yarn"
                    ? `yarn dlx ${packageName}@latest add button`
                    : packageManager === "bun"
                    ? `bunx --bun ${packageName}@latest add button`
                    : `npx ${packageName}@latest add button`,
                  "",
                  "Now you can use the component in your project!",
                ],
              },
              default: {
                description: "Generic installation guide for React",
                steps: [
                  "Make sure you have a React project set up",
                  "",
                  "Add shadcn/ui to your project:",
                  packageManager === "npm"
                    ? `npx ${packageName}@latest init`
                    : packageManager === "pnpm"
                    ? `pnpm dlx ${packageName}@latest init`
                    : packageManager === "yarn"
                    ? `yarn dlx ${packageName}@latest init`
                    : packageManager === "bun"
                    ? `bunx --bun ${packageName}@latest init`
                    : `npx ${packageName}@latest init`,
                  "",
                  "Follow the prompts to select your preferences",
                  "",
                  "Once initialized, you can add components:",
                  packageManager === "npm"
                    ? `npx ${packageName}@latest add button`
                    : packageManager === "pnpm"
                    ? `pnpm dlx ${packageName}@latest add button`
                    : packageManager === "yarn"
                    ? `yarn dlx ${packageName}@latest add button`
                    : packageManager === "bun"
                    ? `bunx --bun ${packageName}@latest add button`
                    : `npx ${packageName}@latest add button`,
                  "",
                  "Now you can use the component in your project!",
                ],
              },
            };
            break;
          case "react-native":
            guides = {
              expo: {
                description: "Installation guide for React Native with Expo",
                steps: [
                  "Create a new Expo project if you don't have one already:",
                  `${packageManager} create expo-app my-app`,
                  "",
                  "Navigate to your project directory:",
                  "cd my-app",
                  "",
                  "Install NativeWind for Tailwind CSS support:",
                  packageManager === "npm"
                    ? `npm install nativewind tailwindcss`
                    : packageManager === "pnpm"
                    ? `pnpm add nativewind tailwindcss`
                    : packageManager === "yarn"
                    ? `yarn add nativewind tailwindcss`
                    : packageManager === "bun"
                    ? `bun add nativewind tailwindcss`
                    : `npm install nativewind tailwindcss`,
                  "",
                  "Initialize Tailwind CSS:",
                  `npx tailwindcss init`,
                  "",
                  "Configure NativeWind in your project (follow NativeWind docs)",
                  "",
                  "Add React Native Reusables to your project:",
                  packageManager === "npm"
                    ? `npx ${packageName}@latest init`
                    : packageManager === "pnpm"
                    ? `pnpx ${packageName}@latest init`
                    : packageManager === "yarn"
                    ? `yarn dlx ${packageName}@latest init`
                    : packageManager === "bun"
                    ? `bunx --bun ${packageName}@latest init`
                    : `npx ${packageName}@latest init`,
                  "",
                  "The command will automatically configure your project with sensible defaults.",
                  "",
                  "Once initialized, you can add components:",
                  packageManager === "npm"
                    ? `npx ${packageName}@latest add button --yes --overwrite`
                    : packageManager === "pnpm"
                    ? `pnpx ${packageName}@latest add button --yes --overwrite`
                    : packageManager === "yarn"
                    ? `yarn dlx ${packageName}@latest add button --yes --overwrite`
                    : packageManager === "bun"
                    ? `bunx --bun ${packageName}@latest add button --yes --overwrite`
                    : `npx ${packageName}@latest add button --yes --overwrite`,
                  "",
                  "Install dependencies from the component registry:",
                  "Check the component's registry entry for required dependencies and install them",
                  "",
                  "For iOS development:",
                  "npx expo install --fix",
                  "cd ios && pod install",
                  "",
                  "For Android development:",
                  "npx expo install --fix",
                  "",
                  "Start your development server:",
                  "npx expo start",
                  "",
                  "For full details, refer to the React Native Reusables documentation:",
                  "https://github.com/founded-labs/react-native-reusables",
                ],
              },
            };
            break;
          case "vue":
            guides = {
              default: {
                description: "Generic installation guide for Vue",
                steps: [
                  "Make sure you have a Vue project set up",
                  "",
                  "Add shadcn-vue to your project:",
                  packageManager === "npm"
                    ? `npx shadcn-vue@latest init`
                    : packageManager === "pnpm"
                    ? `pnpm dlx shadcn-vue@latest init`
                    : packageManager === "yarn"
                    ? `yarn dlx shadcn-vue@latest init`
                    : packageManager === "bun"
                    ? `bunx shadcn-vue@latest init`
                    : `npx shadcn-vue@latest init`,
                  "",
                  "Follow the prompts to configure components.json",
                  "",
                  "Once initialized, you can add components:",
                  packageManager === "npm"
                    ? `npx shadcn-vue@latest add button`
                    : packageManager === "pnpm"
                    ? `pnpm dlx shadcn-vue@latest add button`
                    : packageManager === "yarn"
                    ? `yarn dlx shadcn-vue@latest add button`
                    : packageManager === "bun"
                    ? `bunx shadcn-vue@latest add button`
                    : `npx shadcn-vue@latest add button`,
                  "",
                  "Now you can use the component in your Vue project!",
                ],
              },
              vite: {
                description:
                  "Installation guide for Vue with Vite (Tailwind CSS v4)",
                steps: [
                  "1. Create a new Vite project (if you don't have one):",
                  `${packageManager}${
                    packageManager === "npm" ? " create" : ""
                  } vite@latest my-vue-app -- --template vue-ts`,
                  "",
                  "Navigate to your project directory:",
                  "cd my-vue-app",
                  "",
                  "2. Install Tailwind CSS v4:",
                  `${packageManager} ${
                    packageManager === "npm" ? "install" : "add"
                  } tailwindcss @tailwindcss/vite`,
                  "",
                  "3. Install @types/node for path resolution:",
                  `${packageManager} ${
                    packageManager === "npm" ? "install" : "add"
                  } -D @types/node`,
                  "",
                  "4. Update tsconfig.json to add baseUrl and paths:",
                  'Add to compilerOptions: "baseUrl": ".", "paths": { "@/*": ["./src/*"] }',
                  "",
                  "5. Update tsconfig.app.json to add the same baseUrl and paths",
                  "",
                  "6. Update vite.config.ts:",
                  "import path from 'node:path'",
                  "import tailwindcss from '@tailwindcss/vite'",
                  "import vue from '@vitejs/plugin-vue'",
                  "import { defineConfig } from 'vite'",
                  "",
                  "export default defineConfig({",
                  "  plugins: [vue(), tailwindcss()],",
                  "  resolve: {",
                  "    alias: {",
                  "      '@': path.resolve(__dirname, './src'),",
                  "    },",
                  "  },",
                  "})",
                  "",
                  "7. Replace src/style.css content with:",
                  '@import "tailwindcss";',
                  "",
                  "8. Initialize shadcn-vue:",
                  packageManager === "npm"
                    ? `npx shadcn-vue@latest init`
                    : packageManager === "pnpm"
                    ? `pnpm dlx shadcn-vue@latest init`
                    : packageManager === "yarn"
                    ? `yarn dlx shadcn-vue@latest init`
                    : packageManager === "bun"
                    ? `bunx shadcn-vue@latest init`
                    : `npx shadcn-vue@latest init`,
                  "",
                  "Choose your preferred base color (e.g., Neutral)",
                  "",
                  "9. Start your development server:",
                  `${packageManager} ${
                    packageManager === "npm" ? "run " : ""
                  }dev`,
                  "",
                  "10. Add your first component:",
                  packageManager === "npm"
                    ? `npx shadcn-vue@latest add button`
                    : packageManager === "pnpm"
                    ? `pnpm dlx shadcn-vue@latest add button`
                    : packageManager === "yarn"
                    ? `yarn dlx shadcn-vue@latest add button`
                    : packageManager === "bun"
                    ? `bunx shadcn-vue@latest add button`
                    : `npx shadcn-vue@latest add button`,
                  "",
                  "11. Use the component in your Vue files:",
                  '<script setup lang="ts">',
                  "import { Button } from '@/components/ui/button'",
                  "</script>",
                  "",
                  "<template>",
                  "  <div>",
                  "    <Button>Click me</Button>",
                  "  </div>",
                  "</template>",
                  "",
                  "You're all set! Your Vue + Vite project with Tailwind CSS v4 and shadcn-vue is ready!",
                ],
              },
            };
            break;
        }
        // Select appropriate guide based on build tool
        const guide =
          guides[buildTool.toLowerCase() as keyof typeof guides] ||
          guides.default;

        return {
          content: `# ${
            guide.description
          } with ${packageManager}\n\n${guide.steps.join("\n")}`,
          contentType: "text/plain",
        };
      } catch (error) {
        return {
          content: `Error generating installation guide: ${
            error instanceof Error ? error.message : String(error)
          }`,
          contentType: "text/plain",
        };
      }
    };
  }

  return undefined;
};
