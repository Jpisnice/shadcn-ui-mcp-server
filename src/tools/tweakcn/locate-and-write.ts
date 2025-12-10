import fs from "fs";
import path from "path";

const COMMON_PATHS = [
  "src/styles/globals.css",
  "src/styles/global.css",
  "app/globals.css",
  "src/global.css",
  "src/index.css",
  "src/styles.css",
  "globals.css",
];

export async function locateGlobalCss(rootDir: string): Promise<string | null> {
  for (const p of COMMON_PATHS) {
    const full = path.join(rootDir, p);
    if (fs.existsSync(full)) return full;
  }
  return null;
}

export async function backupFile(filePath: string): Promise<string> {
  const dir = path.dirname(filePath);
  const base = path.basename(filePath);
  const ts = new Date().toISOString().replace(/[:.]/g, "-");
  const backupName = path.join(dir, `.mcp-backup-${base}.${ts}`);
  await fs.promises.copyFile(filePath, backupName);
  return backupName;
}

/**
 * Insert or replace content between MCP markers in the target CSS file.
 * If markers are not found, append the block at the end.
 */
export async function writeThemeBlock(
  filePath: string,
  blockContent: string,
  options?: { markerStart?: string; markerEnd?: string; createBackup?: boolean }
): Promise<{ filePath: string; backup?: string }> {
  const markerStart = options?.markerStart ?? "/* MCP-TWEAKCN-START */";
  const markerEnd = options?.markerEnd ?? "/* MCP-TWEAKCN-END */";

  if (!fs.existsSync(filePath)) {
    // create parent directories if needed
    await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
    await fs.promises.writeFile(filePath, "");
  }

  let backupPath: string | undefined;
  if (options?.createBackup ?? true) {
    backupPath = await backupFile(filePath);
  }

  const original = await fs.promises.readFile(filePath, "utf8");
  const startIdx = original.indexOf(markerStart);
  const endIdx = original.indexOf(markerEnd);

  const block = `\n${markerStart}\n${blockContent}\n${markerEnd}\n`;

  let out = original;
  if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    out = original.slice(0, startIdx) + block + original.slice(endIdx + markerEnd.length);
  } else {
    out = original + "\n" + block;
  }

  await fs.promises.writeFile(filePath, out, "utf8");
  return { filePath, backup: backupPath };
}

export default { locateGlobalCss, backupFile, writeThemeBlock };
