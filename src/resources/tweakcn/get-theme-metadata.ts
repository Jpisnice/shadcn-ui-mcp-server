import fs from 'fs';
import path from 'path';

export async function handleGetThemeMetadata() {
  try {
    const metadataPath = path.join(process.cwd(), 'src', 'tools', 'tweakcn', 'assets_function', 'all_41_themes_metadata.json');
    
    if (!fs.existsSync(metadataPath)) {
      throw new Error(`Metadata file not found at ${metadataPath}`);
    }

    const content = await fs.promises.readFile(metadataPath, 'utf8');
    
    return {
      content,
      contentType: 'application/json'
    };
  } catch (error) {
    throw new Error(`Failed to read theme metadata: ${error instanceof Error ? error.message : String(error)}`);
  }
}
