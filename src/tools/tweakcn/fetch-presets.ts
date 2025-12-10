import axios from "axios";
import fs from "fs";
import path from "path";

/**
 * Fetches the raw tweakcn theme-presets.ts file from GitHub and attempts
 * to extract the exported object literal as a JavaScript object.
 */
export async function fetchPresetsFromGithub(url: string): Promise<Record<string, any>> {
  // Try network fetch first
  try {
    const res = await axios.get(url, { responseType: "text" });
    const text: string = res.data;
    const parsed = extractExportedObject(text);
    if (parsed) return parsed;
    // fallthrough to local file
  } catch (err) {
    console.error("Network fetch failed:", err);
    // network failed — will try local fallback
  }

  // Fallback: try reading local tweakcn/theme-presets.ts
  try {
    const localPath = path.join(process.cwd(), "tweakcn", "theme-presets.ts");
    if (fs.existsSync(localPath)) {
      const text = await fs.promises.readFile(localPath, "utf8");
      const parsed = extractExportedObject(text);
      if (parsed) return parsed;
    }
  } catch (err) {
    console.error("Local read failed:", err);
    // ignore and throw below
  }

  throw new Error("Could not fetch or parse tweakcn presets from network or local file");
}

function extractExportedObject(text: string): Record<string, any> | null {
  // User requested specific parsing logic:
  // 1. Remove everything till "export const defaultPresets: Record<string, ThemePreset> = {"
  // 2. Remove "};" from the end
  // 3. Wrap in "{ }"
  
  const startMarker = "export const defaultPresets: Record<string, ThemePreset> = {";
  const startIndex = text.indexOf(startMarker);
  
  if (startIndex === -1) {
    // Fallback to regex if exact string not found (maybe type annotation is missing or different)
    // But user was specific, so let's try to be flexible but prefer their string.
    // Let's try a slightly more flexible regex that matches the user's intent.
    const regex = /export\s+const\s+defaultPresets\s*(?::\s*[^=]+)?\s*=\s*\{/;
    const match = text.match(regex);
    if (!match) return null;
    
    const matchIndex = match.index!;
    const matchLength = match[0].length;
    
    // We want to start AFTER the opening brace of the match
    // The regex ends with '{', so we slice after it.
    // But wait, the user said "remove everything till ... = {".
    // And "whatever is remaining put it in { }".
    // So if we have "prefix... = { content }; suffix",
    // Removing prefix gives " content }; suffix".
    // Removing "};" from end gives " content ".
    // Wrapping gives "{ content }".
    
    // Let's implement the logic based on the match end.
    const contentStart = matchIndex + matchLength;
    let content = text.slice(contentStart);
    
    // Remove suffix "};" (and potentially trailing whitespace/newlines)
    // We look for the last occurrence of "};"
    const lastSemiBrace = content.lastIndexOf("};");
    if (lastSemiBrace !== -1) {
      content = content.slice(0, lastSemiBrace);
    } else {
        // Maybe just "}" if no semicolon?
        const lastBrace = content.lastIndexOf("}");
        if (lastBrace !== -1) {
            content = content.slice(0, lastBrace);
        }
    }

    const finalString = `{${content}}`;

    try {
        const sanitized = finalString
          .replace(/`/g, "'")
          .replace(/:\s*undefined/g, ": null");

        // eslint-disable-next-line no-new-func
        const obj = new Function(`return (${sanitized})`)();
        if (typeof obj === "object") return obj as Record<string, any>;
    } catch (err) {
        console.error("Error parsing presets:", err);
        return null;
    }
    return null;
  }

  // If exact match found
  const contentStart = startIndex + startMarker.length;
  let content = text.slice(contentStart);

  const lastSemiBrace = content.lastIndexOf("};");
  if (lastSemiBrace !== -1) {
    content = content.slice(0, lastSemiBrace);
  }

  const finalString = `{${content}}`;

  try {
    const sanitized = finalString
        .replace(/`/g, "'")
        .replace(/:\s*undefined/g, ": null");

    // eslint-disable-next-line no-new-func
    const obj = new Function(`return (${sanitized})`)();
    if (typeof obj === "object") return obj as Record<string, any>;
  } catch (err) {
    console.error("Error parsing presets:", err);
    return null;
  }

  return null;
}

export default fetchPresetsFromGithub;
