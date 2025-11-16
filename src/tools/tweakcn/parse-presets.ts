/**
 * Utilities to search and filter presets fetched from tweakcn
 */
export function filterPresets(
  presets: Record<string, any>,
  keywords?: string
): Array<{ id: string; label: string; description?: string }> {
  const results: Array<{ id: string; label: string; description?: string }> = [];
  const lower = (s?: string) => (s || "").toLowerCase();
  const q = (keywords || "").toLowerCase();

  for (const id of Object.keys(presets || {})) {
    const preset = presets[id] || {};
    const label = preset.label || id;
    const desc = preset.description || preset.label || "";
    if (!q) {
      results.push({ id, label, description: desc });
      continue;
    }

    if (label.toLowerCase().includes(q) || lower(desc).includes(q) || id.toLowerCase().includes(q)) {
      results.push({ id, label, description: desc });
    }
  }

  return results;
}

export default filterPresets;
