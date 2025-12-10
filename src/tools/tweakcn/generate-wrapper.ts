 
/**
 * Generate a minimal CSS variables block and a basic Tailwind v3 config
 * from the normalized ThemeStyles. This is intentionally lightweight so it
 * doesn't depend on the UI generator internals.
 */
export function generateCssAndConfig(
  themeStyles: Record<string, any>,
  tailwindVersion: "3" | "4" = "3",
  colorFormat: "hsl" | "var" = "hsl"
): { css: string; tailwindConfig?: string } {
  const modes: Array<"light" | "dark"> = ["light", "dark"];

  const formatColor = (val: any) => {
    if (!val) return val;
    if (colorFormat === "hsl") return `hsl(${val})`;
    return `${val}`;
  };

  const buildVars = (mode: "light" | "dark") => {
    const styles = themeStyles[mode] || {};
    const keys = Object.keys(styles);
    const lines = keys.map((k) => {
      const v = styles[k];
      return `  --${k}: ${v};`;
    });
    return lines.join("\n");
  };

  const lightVars = buildVars("light");
  const darkVars = buildVars("dark");

  const css = `:root {\n${lightVars}\n}\n\n.dark {\n${darkVars}\n}`;

  const tailwindConfig = `/** @type {import('tailwindcss').Config} */\nmodule.exports = {\n  darkMode: ['class'],\n  theme: { extend: {} },\n}`;

  return { css, tailwindConfig: tailwindVersion === "3" ? tailwindConfig : undefined };
}

export default generateCssAndConfig;
