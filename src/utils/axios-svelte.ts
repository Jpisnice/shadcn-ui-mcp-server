import { Axios } from "axios";
import { logError, logWarning, logInfo } from './logger.js';

// Constants for the v4 repository structure
const REPO_OWNER = 'huntabyte';
const REPO_NAME = 'shadcn-svelte';
const REPO_BRANCH = 'main';
const REGISTRY_PATH = `docs/src/lib/registry`;
const BLOCKS = `${REGISTRY_PATH}/blocks`;

// GitHub API for accessing repository structure and metadata
const githubApi = new Axios({
    baseURL: "https://api.github.com",
    headers: {
        "Content-Type": "application/json",
        "Accept": "application/vnd.github+json",
        "User-Agent": "Mozilla/5.0 (compatible; ShadcnUiMcpServer/1.0.0)",
        ...(process.env.GITHUB_PERSONAL_ACCESS_TOKEN && {
            "Authorization": `Bearer ${process.env.GITHUB_PERSONAL_ACCESS_TOKEN}`
        })
    },
    timeout: 30000, // Increased from 15000 to 30000 (30 seconds)
    transformResponse: [(data) => {
        try {
            return JSON.parse(data);
        } catch {
            return data;
        }
    }],
});

// GitHub Raw for directly fetching file contents
const githubRaw = new Axios({
    baseURL: `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${REPO_BRANCH}`,
    headers: {
        "User-Agent": "Mozilla/5.0 (compatible; ShadcnUiMcpServer/1.0.0)",
    },
    timeout: 30000, // Increased from 15000 to 30000 (30 seconds)
    transformResponse: [(data) => data], // Return raw data
});

/**
 * Fetch component source code from the v4 registry
 * @param componentName Name of the component
 * @returns Promise with component source code
 */
async function getComponentSource(componentName: string): Promise<string> {
    const componentPath = `${REGISTRY_PATH}/ui/${componentName.toLowerCase()}/${componentName.toLowerCase()}.svelte`;

    try {
        const response = await githubRaw.get(`/${componentPath}`);
        return response.data;
    } catch (error) {
        throw new Error(`Component "${componentName}" not found in v4 registry`);
    }
}

/**
 * Fetch component demo/example from the v4 registry
 * @param componentName Name of the component
 * @returns Promise with component demo code
 */
async function getComponentDemo(componentName: string): Promise<string> {
    const demoPath = `${REGISTRY_PATH}/examples/${componentName.toLowerCase()}-demo.svelte`;

    try {
        const response = await githubRaw.get(`/${demoPath}`);
        return response.data;
    } catch (error) {
        throw new Error(`Demo for component "${componentName}" not found in v4 registry`);
    }
}

/**
 * Fetch all available components from the registry
 * @returns Promise with list of component names
 */
async function getAvailableComponents(): Promise<string[]> {
    try {
        // First try the GitHub API
        const response = await githubApi.get(`/repos/${REPO_OWNER}/${REPO_NAME}/contents/${REGISTRY_PATH}/ui`);

        if (!response.data || !Array.isArray(response.data)) {
            throw new Error('Invalid response from GitHub API');
        }

        const components = response.data.map((item: any) => item.name);

        if (components.length === 0) {
            throw new Error('No components found in the registry');
        }

        return components;
    } catch (error: any) {
        logError('Error fetching components from GitHub API', error);

        // Check for specific error types
        if (error.response) {
            const status = error.response.status;
            const message = error.response.data?.message || 'Unknown error';

            if (status === 403 && message.includes('rate limit')) {
                throw new Error(`GitHub API rate limit exceeded. Please set GITHUB_PERSONAL_ACCESS_TOKEN environment variable for higher limits. Error: ${message}`);
            } else if (status === 404) {
                throw new Error(`Components directory not found. The path ${BLOCKS}/ui may not exist in the repository.`);
            } else if (status === 401) {
                throw new Error(`Authentication failed. Please check your GITHUB_PERSONAL_ACCESS_TOKEN if provided.`);
            } else {
                throw new Error(`GitHub API error (${status}): ${message}`);
            }
        }

        // If it's a network error or other issue, provide a fallback
        if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT') {
            throw new Error(`Network error: ${error.message}. Please check your internet connection.`);
        }

        // If all else fails, provide a fallback list of known components
        logWarning('Using fallback component list due to API issues');
        return getFallbackComponents();
    }
}

/**
 * Fallback list of known shadcn/ui v4 components
 * This is used when the GitHub API is unavailable
 */
function getFallbackComponents(): string[] {
    return [
        'accordion',
        'alert',
        'alert-dialog',
        'aspect-ratio',
        'avatar',
        'badge',
        'breadcrumb',
        'button',
        'calendar',
        'card',
        'carousel',
        'chart',
        'checkbox',
        'collapsible',
        'command',
        'context-menu',
        'dialog',
        'drawer',
        'dropdown-menu',
        'form',
        'hover-card',
        'input',
        'input-otp',
        'label',
        'menubar',
        'navigation-menu',
        'pagination',
        'popover',
        'progress',
        'radio-group',
        'resizable',
        'scroll-area',
        'select',
        'separator',
        'sheet',
        'sidebar',
        'skeleton',
        'slider',
        'sonner',
        'switch',
        'table',
        'tabs',
        'textarea',
        'toggle',
        'toggle-group',
        'tooltip'
    ];
}

/**
 * Fetch component metadata from the registry
 * @param componentName Name of the component
 * @returns Promise with component metadata
 */
async function getComponentMetadata(componentName: string): Promise<any> {
    try {
        const response = await githubRaw.get(`/docs/registry.json`);
        const registryContent = JSON.parse(response.data);

        const metadata = registryContent.items.map((item: any) => {
            return {
                name: item.name,
                type: item.type,
                dependencies: item.dependencies,
                registryDependencies: item.registryDependencies
            }
        });
        const component = metadata.find((item: any) => item.name === componentName.toLowerCase());

        if (!component) {
            throw new Error(`Component "${componentName}" not found in registry`);
        }

        return {
            name: component.name,
            type: component.type,
            dependencies: component.dependencies,
            registryDependencies: component.registryDependencies
        };
    } catch (error) {
        logError(`Error getting metadata for ${componentName}`, error);
        return null;
    }
}

/**
 * Recursively builds a directory tree structure from a GitHub repository
 * @param owner Repository owner
 * @param repo Repository name  
 * @param path Path within the repository to start building the tree from
 * @param branch Branch name
 * @returns Promise resolving to the directory tree structure
 */
async function buildDirectoryTree(
    owner: string = REPO_OWNER,
    repo: string = REPO_NAME,
    path: string = BLOCKS,
    branch: string = REPO_BRANCH
): Promise<any> {
    try {
        const response = await githubApi.get(`/repos/${owner}/${repo}/contents/${path}?ref=${branch}`);

        if (!response.data) {
            throw new Error('No data received from GitHub API');
        }

        const contents = response.data;

        // Handle different response types from GitHub API
        if (!Array.isArray(contents)) {
            // Check if it's an error response (like rate limit)
            if (contents.message) {
                const message: string = contents.message;
                if (message.includes('rate limit exceeded')) {
                    throw new Error(`GitHub API rate limit exceeded. ${message} Consider setting GITHUB_PERSONAL_ACCESS_TOKEN environment variable for higher rate limits.`);
                } else if (message.includes('Not Found')) {
                    throw new Error(`Path not found: ${path}. The path may not exist in the repository.`);
                } else {
                    throw new Error(`GitHub API error: ${message}`);
                }
            }

            // If contents is not an array, it might be a single file
            if (contents.type === 'file') {
                return {
                    path: contents.path,
                    type: 'file',
                    name: contents.name,
                    url: contents.download_url,
                    sha: contents.sha,
                };
            } else {
                throw new Error(`Unexpected response type from GitHub API: ${JSON.stringify(contents)}`);
            }
        }

        // Build tree node for this level (directory with multiple items)
        const result: Record<string, any> = {
            path,
            type: 'directory',
            children: {},
        };

        // Process each item
        for (const item of contents) {
            if (item.type === 'file') {
                // Add file to this directory's children
                result.children[item.name] = {
                    path: item.path,
                    type: 'file',
                    name: item.name,
                    url: item.download_url,
                    sha: item.sha,
                };
            } else if (item.type === 'dir') {
                // Recursively process subdirectory (limit depth to avoid infinite recursion)
                if (path.split('/').length < 8) {
                    try {
                        const subTree = await buildDirectoryTree(owner, repo, item.path, branch);
                        result.children[item.name] = subTree;
                    } catch (error) {
                        logWarning(`Failed to fetch subdirectory ${item.path}: ${error instanceof Error ? error.message : String(error)}`);
                        result.children[item.name] = {
                            path: item.path,
                            type: 'directory',
                            error: 'Failed to fetch contents'
                        };
                    }
                }
            }
        }

        return result;
    } catch (error: any) {
        logError(`Error building directory tree for ${path}`, error);

        // Check if it's already a well-formatted error from above
        if (error.message && (error.message.includes('rate limit') || error.message.includes('GitHub API error'))) {
            throw error;
        }

        // Provide more specific error messages for HTTP errors
        if (error.response) {
            const status: number = error.response.status;
            const responseData: any = error.response.data;
            const message: string = responseData?.message || 'Unknown error';

            if (status === 404) {
                throw new Error(`Path not found: ${path}. The path may not exist in the repository.`);
            } else if (status === 403) {
                if (message.includes('rate limit')) {
                    throw new Error(`GitHub API rate limit exceeded: ${message} Consider setting GITHUB_PERSONAL_ACCESS_TOKEN environment variable for higher rate limits.`);
                } else {
                    throw new Error(`Access forbidden: ${message}`);
                }
            } else if (status === 401) {
                throw new Error(`Authentication failed. Please check your GITHUB_PERSONAL_ACCESS_TOKEN if provided.`);
            } else {
                throw new Error(`GitHub API error (${status}): ${message}`);
            }
        }

        throw error;
    }
}

/**
 * Provides a basic directory structure for v4 registry without API calls
 * This is used as a fallback when API rate limits are hit
 */
function getBasicV4Structure(): any {
    return {
        path: REGISTRY_PATH,
        type: 'directory',
        note: 'Basic structure provided due to API limitations',
        children: {
            'ui': {
                path: `${REGISTRY_PATH}/ui`,
                type: 'directory',
                description: 'Contains all v4 UI components',
                note: 'Component files (.tsx) are located here'
            },
            'examples': {
                path: `${REGISTRY_PATH}/examples`,
                type: 'directory',
                description: 'Contains component demo examples',
                note: 'Demo files showing component usage'
            },
            'hooks': {
                path: `${REGISTRY_PATH}/hooks`,
                type: 'directory',
                description: 'Contains custom React hooks'
            },
            'lib': {
                path: `${REGISTRY_PATH}/lib`,
                type: 'directory',
                description: 'Contains utility libraries and functions'
            }
        }
    };
}

/**
 * Extract description from block code comments
 * @param code The source code to analyze
 * @returns Extracted description or null
 */
function extractBlockDescription(code: string): string | null {
    // Look for JSDoc comments or description comments
    const descriptionRegex = /\/\*\*[\s\S]*?\*\/|\/\/\s*(.+)/;
    const match = code.match(descriptionRegex);
    if (match) {
        // Clean up the comment
        const description = match[0]
            .replace(/\/\*\*|\*\/|\*|\/\//g, '')
            .trim()
            .split('\n')[0]
            .trim();
        return description.length > 0 ? description : null;
    }

    // Look for component name as fallback
    const componentRegex = /export\s+(?:default\s+)?function\s+(\w+)/;
    const componentMatch = code.match(componentRegex);
    if (componentMatch) {
        return `${componentMatch[1]} - A reusable UI component`;
    }

    return null;
}

/**
 * Extract dependencies from import statements
 * @param code The source code to analyze
 * @returns Array of dependency names
 */
function extractDependencies(code: string): string[] {
    const dependencies: string[] = [];

    // Match import statements
    const importRegex = /import\s+.*?\s+from\s+['"]([@\w\/\-\.]+)['"]/g;
    let match: RegExpExecArray | null;

    match = importRegex.exec(code);
    while (match !== null) {
        const dep: string = match[1];
        if (!dep.startsWith('./') && !dep.startsWith('../') && !dep.startsWith('@/')) {
            dependencies.push(dep);
        }
        match = importRegex.exec(code);
    }

    return [...new Set(dependencies)]; // Remove duplicates
}

/**
 * Extract component usage from code
 * @param code The source code to analyze
 * @returns Array of component names used
 */
function extractComponentUsage(code: string): string[] {
    const components: string[] = [];

    // Extract from imports of components (assuming they start with capital letters)
    const importRegex = /import\s+\{([^}]+)\}\s+from/g;
    let match: RegExpExecArray | null;

    match = importRegex.exec(code);
    while (match !== null) {
        const imports = match[1].split(',').map(imp => imp.trim());
        imports.forEach(imp => {
            if (imp[0] && imp[0] === imp[0].toUpperCase()) {
                components.push(imp);
            }
        });
        match = importRegex.exec(code);
    }

    // Also look for JSX components in the code
    const jsxRegex = /<([A-Z]\w+)/g;
    match = jsxRegex.exec(code);
    while (match !== null) {
        components.push(match[1]);
        match = jsxRegex.exec(code);
    }

    return [...new Set(components)]; // Remove duplicates
}

/**
 * Generate usage instructions for complex blocks
 * @param blockName Name of the block
 * @param structure Structure information
 * @returns Usage instructions string
 */
function generateComplexBlockUsage(blockName: string, structure: any[]): string {
    const hasComponents = structure.some(item => item.name === 'components');

    let usage = `To use the ${blockName} block:\n\n`;
    usage += `1. Copy the main files to your project:\n`;

    structure.forEach(item => {
        if (item.type === 'file') {
            usage += `   - ${item.name}\n`;
        } else if (item.type === 'directory' && item.name === 'components') {
            usage += `   - components/ directory (${item.count} files)\n`;
        }
    });

    if (hasComponents) {
        usage += `\n2. Copy the components to your components directory\n`;
        usage += `3. Update import paths as needed\n`;
        usage += `4. Ensure all dependencies are installed\n`;
    } else {
        usage += `\n2. Update import paths as needed\n`;
        usage += `3. Ensure all dependencies are installed\n`;
    }

    return usage;
}

/**
 * Enhanced buildDirectoryTree with fallback for rate limits
 */
async function buildDirectoryTreeWithFallback(
    owner: string = REPO_OWNER,
    repo: string = REPO_NAME,
    path: string = BLOCKS,
    branch: string = REPO_BRANCH
): Promise<any> {
    try {
        return await buildDirectoryTree(owner, repo, path, branch);
    } catch (error: any) {
        // If it's a rate limit error and we're asking for the default v4 path, provide fallback
        if (error.message && error.message.includes('rate limit') && path === BLOCKS) {
            logWarning('Using fallback directory structure due to rate limit');
            return getBasicV4Structure();
        }
        // Re-throw other errors
        throw error;
    }
}

/**
 * Fetch block code from the v4 blocks directory
 * @param blockName Name of the block (e.g., "calendar-01", "dashboard-01")
 * @param includeComponents Whether to include component files for complex blocks
 * @returns Promise with block code and structure
 */
async function getBlockCode(blockName: string, includeComponents: boolean = true): Promise<any> {
    const blocksPath = `${BLOCKS}`;

    try {
        // First, check if it's a simple block file (.tsx)
        try {
            const simpleBlockResponse = await githubRaw.get(`/${blocksPath}/${blockName}.svelte`);
            if (simpleBlockResponse.status === 200) {
                const code = simpleBlockResponse.data;

                // Extract useful information from the code
                const description = extractBlockDescription(code);
                const dependencies = extractDependencies(code);
                const components = extractComponentUsage(code);

                return {
                    name: blockName,
                    type: 'simple',
                    description: description || `Simple block: ${blockName}`,
                    code: code,
                    dependencies: dependencies,
                    componentsUsed: components,
                    size: code.length,
                    lines: code.split('\n').length,
                    usage: `Import and use directly in your application:\n\nimport { ${blockName.charAt(0).toUpperCase() + blockName.slice(1).replace(/-/g, '')} } from './blocks/${blockName}'`
                };
            }
        } catch (error) {
            // Continue to check for complex block directory
        }

        // Check if it's a complex block directory
        const directoryResponse = await githubApi.get(`/repos/${REPO_OWNER}/${REPO_NAME}/contents/${blocksPath}/${blockName}?ref=${REPO_BRANCH}`);

        if (!directoryResponse.data) {
            throw new Error(`Block "${blockName}" not found`);
        }

        const blockStructure: any = {
            name: blockName,
            type: 'complex',
            description: `Complex block: ${blockName}`,
            files: {},
            structure: [],
            totalFiles: 0,
            dependencies: new Set(),
            componentsUsed: new Set()
        };

        // Process the directory contents
        if (Array.isArray(directoryResponse.data)) {
            blockStructure.totalFiles = directoryResponse.data.length;

            for (const item of directoryResponse.data) {
                if (item.type === 'file') {
                    // Get the main page file
                    const fileResponse = await githubRaw.get(`/${item.path}`);
                    const content = fileResponse.data;

                    // Extract information from the file
                    const description = extractBlockDescription(content);
                    const dependencies = extractDependencies(content);
                    const components = extractComponentUsage(content);

                    blockStructure.files[item.name] = {
                        path: item.name,
                        content: content,
                        size: content.length,
                        lines: content.split('\n').length,
                        description: description,
                        dependencies: dependencies,
                        componentsUsed: components
                    };

                    // Add to overall dependencies and components
                    dependencies.forEach((dep: string) => blockStructure.dependencies.add(dep));
                    components.forEach((comp: string) => blockStructure.componentsUsed.add(comp));

                    blockStructure.structure.push({
                        name: item.name,
                        type: 'file',
                        size: content.length,
                        description: description || `${item.name} - Main block file`
                    });

                    // Use the first file's description as the block description if available
                    if (description && blockStructure.description === `Complex block: ${blockName}`) {
                        blockStructure.description = description;
                    }
                } else if (item.type === 'dir' && item.name === 'components' && includeComponents) {
                    // Get component files
                    const componentsResponse = await githubApi.get(`/repos/${REPO_OWNER}/${REPO_NAME}/contents/${item.path}?ref=${REPO_BRANCH}`);

                    if (Array.isArray(componentsResponse.data)) {
                        blockStructure.files.components = {};
                        const componentStructure: any[] = [];

                        for (const componentItem of componentsResponse.data) {
                            if (componentItem.type === 'file') {
                                const componentResponse = await githubRaw.get(`/${componentItem.path}`);
                                const content = componentResponse.data;

                                const dependencies = extractDependencies(content);
                                const components = extractComponentUsage(content);

                                blockStructure.files.components[componentItem.name] = {
                                    path: `components/${componentItem.name}`,
                                    content: content,
                                    size: content.length,
                                    lines: content.split('\n').length,
                                    dependencies: dependencies,
                                    componentsUsed: components
                                };

                                // Add to overall dependencies and components
                                dependencies.forEach((dep: string) => blockStructure.dependencies.add(dep));
                                components.forEach((comp: string) => blockStructure.componentsUsed.add(comp));

                                componentStructure.push({
                                    name: componentItem.name,
                                    type: 'component',
                                    size: content.length
                                });
                            }
                        }

                        blockStructure.structure.push({
                            name: 'components',
                            type: 'directory',
                            files: componentStructure,
                            count: componentStructure.length
                        });
                    }
                }
            }
        }

        // Convert Sets to Arrays for JSON serialization
        blockStructure.dependencies = Array.from(blockStructure.dependencies);
        blockStructure.componentsUsed = Array.from(blockStructure.componentsUsed);

        // Add usage instructions
        blockStructure.usage = generateComplexBlockUsage(blockName, blockStructure.structure);

        return blockStructure;

    } catch (error: any) {
        if (error.response?.status === 404) {
            throw new Error(`Block "${blockName}" not found. Available blocks can be found in the v4 blocks directory.`);
        }
        throw error;
    }
}

/**
 * Get all available blocks with categorization
 * @param category Optional category filter
 * @returns Promise with categorized block list
 */
async function getAvailableBlocks(category?: string): Promise<any> {
    const blocksPath = `${BLOCKS}`;

    try {
        const response = await githubApi.get(`/repos/${REPO_OWNER}/${REPO_NAME}/contents/${blocksPath}?ref=${REPO_BRANCH}`);

        if (!Array.isArray(response.data)) {
            throw new Error('Unexpected response from GitHub API');
        }

        const blocks: any = {
            calendar: [],
            dashboard: [],
            login: [],
            sidebar: [],
            products: [],
            authentication: [],
            charts: [],
            mail: [],
            music: [],
            other: []
        };

        for (const item of response.data) {
            const blockInfo: any = {
                name: item.name.replace('.svelte', ''),
                type: item.type === 'file' ? 'simple' : 'complex',
                path: item.path,
                size: item.size || 0,
                lastModified: item.download_url ? 'Available' : 'Directory'
            };

            // Add description based on name patterns
            if (item.name.includes('calendar')) {
                blockInfo.description = 'Calendar component for date selection and scheduling';
                blocks.calendar.push(blockInfo);
            } else if (item.name.includes('dashboard')) {
                blockInfo.description = 'Dashboard layout with charts, metrics, and data display';
                blocks.dashboard.push(blockInfo);
            } else if (item.name.includes('login') || item.name.includes('signin')) {
                blockInfo.description = 'Authentication and login interface';
                blocks.login.push(blockInfo);
            } else if (item.name.includes('sidebar')) {
                blockInfo.description = 'Navigation sidebar component';
                blocks.sidebar.push(blockInfo);
            } else if (item.name.includes('products') || item.name.includes('ecommerce')) {
                blockInfo.description = 'Product listing and e-commerce components';
                blocks.products.push(blockInfo);
            } else if (item.name.includes('auth')) {
                blockInfo.description = 'Authentication related components';
                blocks.authentication.push(blockInfo);
            } else if (item.name.includes('chart') || item.name.includes('graph')) {
                blockInfo.description = 'Data visualization and chart components';
                blocks.charts.push(blockInfo);
            } else if (item.name.includes('mail') || item.name.includes('email')) {
                blockInfo.description = 'Email and mail interface components';
                blocks.mail.push(blockInfo);
            } else if (item.name.includes('music') || item.name.includes('player')) {
                blockInfo.description = 'Music player and media components';
                blocks.music.push(blockInfo);
            } else {
                blockInfo.description = `${item.name} - Custom UI block`;
                blocks.other.push(blockInfo);
            }
        }

        // Sort blocks within each category
        Object.keys(blocks).forEach(key => {
            blocks[key].sort((a: any, b: any) => a.name.localeCompare(b.name));
        });

        // Filter by category if specified
        if (category) {
            const categoryLower = category.toLowerCase();
            if (blocks[categoryLower]) {
                return {
                    category,
                    blocks: blocks[categoryLower],
                    total: blocks[categoryLower].length,
                    description: `${category.charAt(0).toUpperCase() + category.slice(1)} blocks available in shadcn/ui v4`,
                    usage: `Use 'get_block' tool with the block name to get the full source code and implementation details.`
                };
            } else {
                return {
                    category,
                    blocks: [],
                    total: 0,
                    availableCategories: Object.keys(blocks).filter(key => blocks[key].length > 0),
                    suggestion: `Category '${category}' not found. Available categories: ${Object.keys(blocks).filter(key => blocks[key].length > 0).join(', ')}`
                };
            }
        }

        // Calculate totals
        const totalBlocks = Object.values(blocks).flat().length;
        const nonEmptyCategories = Object.keys(blocks).filter(key => blocks[key].length > 0);

        return {
            categories: blocks,
            totalBlocks,
            availableCategories: nonEmptyCategories,
            summary: Object.keys(blocks).reduce((acc: any, key) => {
                if (blocks[key].length > 0) {
                    acc[key] = blocks[key].length;
                }
                return acc;
            }, {}),
            usage: "Use 'get_block' tool with a specific block name to get full source code and implementation details.",
            examples: nonEmptyCategories.slice(0, 3).map(cat =>
                blocks[cat][0] ? `${cat}: ${blocks[cat][0].name}` : ''
            ).filter(Boolean)
        };

    } catch (error: any) {
        if (error.response?.status === 404) {
            throw new Error('Blocks directory not found in the v4 registry');
        }
        throw error;
    }
}

/**
 * Set or update GitHub API key for higher rate limits
 * @param apiKey GitHub Personal Access Token
 */
function setGitHubApiKey(apiKey: string): void {
    // Update the Authorization header for the GitHub API instance
    if (apiKey && apiKey.trim()) {
        (githubApi.defaults.headers as any)['Authorization'] = `Bearer ${apiKey.trim()}`;
        logInfo('GitHub API key updated successfully');
        console.error('GitHub API key updated successfully');
    } else {
        // Remove authorization header if empty key provided
        delete (githubApi.defaults.headers as any)['Authorization'];
        console.error('GitHub API key removed - using unauthenticated requests');
        console.error('For higher rate limits and reliability, provide a GitHub API token. See setup instructions: https://github.com/Jpisnice/shadcn-ui-mcp-server#readme');
    }
}

/**
 * Get current GitHub API rate limit status
 * @returns Promise with rate limit information
 */
async function getGitHubRateLimit(): Promise<any> {
    try {
        const response = await githubApi.get('/rate_limit');
        return response.data;
    } catch (error: any) {
        throw new Error(`Failed to get rate limit info: ${error.message}`);
    }
}

export const axios = {
    githubRaw,
    githubApi,
    buildDirectoryTree: buildDirectoryTreeWithFallback, // Use fallback version by default
    buildDirectoryTreeWithFallback,
    getComponentSource,
    getComponentDemo,
    getAvailableComponents,
    getComponentMetadata,
    getBlockCode,
    getAvailableBlocks,
    setGitHubApiKey,
    getGitHubRateLimit,
    // Path constants for easy access
    paths: {
        REPO_OWNER,
        REPO_NAME,
        REPO_BRANCH,
        REGISTRY_PATH,
        BLOCKS
    }
}