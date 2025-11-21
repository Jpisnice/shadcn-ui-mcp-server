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
    // ignore and throw below
  }

  throw new Error("Could not fetch or parse tweakcn presets from network or local file");
}

function extractExportedObject(text: string): Record<string, any> | null {
  const exportIndex = text.search(/export\s+const\s+[a-zA-Z0-9_]+\s*=\s*\{/);
  if (exportIndex === -1) {
    return null;
  }

  // find the opening brace for the object
  const braceStart = text.indexOf("{", exportIndex);
  let i = braceStart;
  let depth = 0;
  for (; i < text.length; i++) {
    const ch = text[i];
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) {
        const objStr = text.slice(braceStart, i + 1);
        try {
          const sanitized = objStr
            .replace(/`/g, "'")
            .replace(/:\s*undefined/g, ": null")
            .replace(/export\s+const\s+[a-zA-Z0-9_]+\s*=\s*/g, "");

          // eslint-disable-next-line no-new-func
          const obj = new Function(`return (${sanitized})`)();
          if (typeof obj === "object") return obj as Record<string, any>;
        } catch (err) {
          return null;
        }
      }
    }
  }

  return null;
}

export default fetchPresetsFromGithub;
