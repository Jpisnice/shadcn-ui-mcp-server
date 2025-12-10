/**
 * Convert a tweakcn preset object (as fetched) into the ThemeStyles shape
 * expected by the theme generator. This is a best-effort mapping — missing
 * fields are left as-is or filled with sensible defaults.
 */
import { colorFormatter } from "./assets_function/color-converter.js";

export function convertPresetToThemeStyles(preset: any): Record<string, any> {
  if (!preset) throw new Error("No preset provided");

  const styles = preset.styles || preset;

  const ensureMode = (m: any) => {
    if (!m) return {};
    return { ...m };
  };

  const light = ensureMode(styles.light || styles);
  const dark = ensureMode(styles.dark || styles.dark || {});

  if (Object.keys(dark).length === 0) {
    dark.background = dark.background || light.background || "#0b1220";
    dark.foreground = dark.foreground || light.foreground || "#e6eef8";
  }

  const ensureToken = (obj: any, key: string, fallback: any) => {
    if (obj[key] === undefined) obj[key] = fallback;
  };

  const fallbackTokens: Record<string, any> = {
    background: "#ffffff",
    foreground: "#111827",
    card: "#ffffff",
    "card-foreground": "#111827",
    border: "#e5e7eb",
    input: "#f9fafb",
    ring: "#eef2ff",
    primary: "#3b82f6",
    "primary-foreground": "#ffffff",
    radius: "0.375rem",
    "font-sans": "Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto",
    "font-serif": "Georgia, 'Times New Roman', Times, serif",
    "font-mono": "ui-monospace, SFMono-Regular, Menlo, Monaco, 'Roboto Mono'",
  };

  for (const k of Object.keys(fallbackTokens)) {
    ensureToken(light, k, fallbackTokens[k]);
    ensureToken(dark, k, fallbackTokens[k]);
  }

  for (let i = 1; i <= 5; i++) {
    ensureToken(light, `chart-${i}`, light[`chart-${i}`] || `#${Math.floor(Math.random() * 16777215).toString(16)}`);
    ensureToken(dark, `chart-${i}`, dark[`chart-${i}`] || light[`chart-${i}`]);
  }

  const rawShadowDefaults: Record<string, string> = {
    "shadow-offset-x": "0px",
    "shadow-offset-y": "1px",
    "shadow-blur": "3px",
    "shadow-spread": "0px",
    "shadow-opacity": "0.08",
    "shadow-color": "0,0,0",
  };
  for (const k of Object.keys(rawShadowDefaults)) {
    ensureToken(light, k, rawShadowDefaults[k]);
    ensureToken(dark, k, rawShadowDefaults[k]);
  }

  // Normalize color-like tokens using tweakcn's colorFormatter when available.
  const normalizeColorsFor = (obj: any) => {
    for (const k of Object.keys(obj)) {
      const v = obj[k];
      if (typeof v !== "string") continue;
      const looksLikeColor = /#|rgb|hsl|o?k?l?c?h?/i.test(v);
      if (looksLikeColor) {
        try {
          // Attempt to normalize to a CSS-compatible HSL string where possible
          const normalized = colorFormatter(v, "hsl", "3");
          if (typeof normalized === "string" && normalized.length > 0) obj[k] = normalized;
        } catch (err) {
          // keep original value on failure
          obj[k] = v;
        }
      }
    }
  };

  normalizeColorsFor(light);
  normalizeColorsFor(dark);

  return { light, dark };
}

export default convertPresetToThemeStyles;
