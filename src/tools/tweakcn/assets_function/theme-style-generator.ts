// ============================================================================
// STANDALONE THEME STYLE GENERATOR - No External Dependencies
// ============================================================================

// Types
type ThemeMode = "light" | "dark";
type ColorFormat = "hsl" | "rgb" | "oklch" | "hex";

interface ThemeStyleProps {
  background: string;
  foreground: string;
  card: string;
  "card-foreground": string;
  popover: string;
  "popover-foreground": string;
  primary: string;
  "primary-foreground": string;
  secondary: string;
  "secondary-foreground": string;
  muted: string;
  "muted-foreground": string;
  accent: string;
  "accent-foreground": string;
  destructive: string;
  "destructive-foreground": string;
  border: string;
  input: string;
  ring: string;
  "chart-1": string;
  "chart-2": string;
  "chart-3": string;
  "chart-4": string;
  "chart-5": string;
  sidebar: string;
  "sidebar-foreground": string;
  "sidebar-primary": string;
  "sidebar-primary-foreground": string;
  "sidebar-accent": string;
  "sidebar-accent-foreground": string;
  "sidebar-border": string;
  "sidebar-ring": string;
  "font-sans": string;
  "font-serif": string;
  "font-mono": string;
  radius: string;
  "shadow-color": string;
  "shadow-opacity": string;
  "shadow-blur": string;
  "shadow-spread": string;
  "shadow-offset-x": string;
  "shadow-offset-y": string;
  "letter-spacing": string;
  spacing?: string;
}

interface ThemeStyles {
  light: ThemeStyleProps;
  dark: ThemeStyleProps;
}

interface ThemeEditorState {
  preset?: string;
  styles: ThemeStyles;
  currentMode: "light" | "dark";
  hslAdjustments?: {
    hueShift: number;
    saturationScale: number;
    lightnessScale: number;
  };
}

// Default Light Theme Styles
const defaultLightThemeStyles: ThemeStyleProps = {
  background: "oklch(1 0 0)",
  foreground: "oklch(0.145 0 0)",
  card: "oklch(1 0 0)",
  "card-foreground": "oklch(0.145 0 0)",
  popover: "oklch(1 0 0)",
  "popover-foreground": "oklch(0.145 0 0)",
  primary: "oklch(0.205 0 0)",
  "primary-foreground": "oklch(0.985 0 0)",
  secondary: "oklch(0.97 0 0)",
  "secondary-foreground": "oklch(0.205 0 0)",
  muted: "oklch(0.97 0 0)",
  "muted-foreground": "oklch(0.556 0 0)",
  accent: "oklch(0.97 0 0)",
  "accent-foreground": "oklch(0.205 0 0)",
  destructive: "oklch(0.577 0.245 27.325)",
  "destructive-foreground": "oklch(1 0 0)",
  border: "oklch(0.922 0 0)",
  input: "oklch(0.922 0 0)",
  ring: "oklch(0.708 0 0)",
  "chart-1": "oklch(0.81 0.10 252)",
  "chart-2": "oklch(0.62 0.19 260)",
  "chart-3": "oklch(0.55 0.22 263)",
  "chart-4": "oklch(0.49 0.22 264)",
  "chart-5": "oklch(0.42 0.18 266)",
  radius: "0.625rem",
  sidebar: "oklch(0.985 0 0)",
  "sidebar-foreground": "oklch(0.145 0 0)",
  "sidebar-primary": "oklch(0.205 0 0)",
  "sidebar-primary-foreground": "oklch(0.985 0 0)",
  "sidebar-accent": "oklch(0.97 0 0)",
  "sidebar-accent-foreground": "oklch(0.205 0 0)",
  "sidebar-border": "oklch(0.922 0 0)",
  "sidebar-ring": "oklch(0.708 0 0)",
  "font-sans":
    "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'",
  "font-serif": 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
  "font-mono":
    'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  "shadow-color": "oklch(0 0 0)",
  "shadow-opacity": "0.1",
  "shadow-blur": "3px",
  "shadow-spread": "0px",
  "shadow-offset-x": "0",
  "shadow-offset-y": "1px",
  "letter-spacing": "0em",
  spacing: "0.25rem",
};

// Color Converter (inlined)
const formatNumber = (num?: number) => {
  if (!num) return "0";
  return num % 1 === 0 ? num : num.toFixed(4);
};

const colorFormatter = (
  colorValue: string,
  format: ColorFormat = "hsl",
  tailwindVersion: "3" | "4" = "3"
): string => {
  // For standalone version, return the color as-is if it's already in a valid format
  // This avoids the culori dependency
  if (format === "hsl" && colorValue.includes("oklch")) {
    // Simple oklch to hsl placeholder - returns the value as-is
    return colorValue;
  }
  return colorValue;
};

// Shadow Map Generator (inlined & simplified)
const getShadowMap = (themeStyles: ThemeStyles, currentMode: ThemeMode) => {
  const styles = themeStyles[currentMode];

  const shadowColor = styles["shadow-color"];
  const offsetX = styles["shadow-offset-x"];
  const offsetY = styles["shadow-offset-y"];
  const blur = styles["shadow-blur"];
  const spread = styles["shadow-spread"];
  const opacity = parseFloat(styles["shadow-opacity"]);
  const color = (opacityMultiplier: number) =>
    `${shadowColor} / ${(opacity * opacityMultiplier).toFixed(2)}`;

  const secondLayer = (fixedOffsetY: string, fixedBlur: string): string => {
    const offsetX2 = offsetX;
    const offsetY2 = fixedOffsetY;
    const blur2 = fixedBlur;
    const spread2 = (parseFloat(spread?.replace("px", "") ?? "0") - 1).toString() + "px";
    const color2 = color(1.0);

    return `${offsetX2} ${offsetY2} ${blur2} ${spread2} ${color2}`;
  };

  const shadowMap: Record<string, string> = {
    "shadow-2xs": `${offsetX} ${offsetY} ${blur} ${spread} ${color(0.5)}`,
    "shadow-xs": `${offsetX} ${offsetY} ${blur} ${spread} ${color(0.5)}`,
    "shadow-2xl": `${offsetX} ${offsetY} ${blur} ${spread} ${color(2.5)}`,
    "shadow-sm": `${offsetX} ${offsetY} ${blur} ${spread} ${color(
      1.0
    )}, ${secondLayer("1px", "2px")}`,
    shadow: `${offsetX} ${offsetY} ${blur} ${spread} ${color(1.0)}, ${secondLayer("1px", "2px")}`,
    "shadow-md": `${offsetX} ${offsetY} ${blur} ${spread} ${color(
      1.0
    )}, ${secondLayer("2px", "4px")}`,
    "shadow-lg": `${offsetX} ${offsetY} ${blur} ${spread} ${color(
      1.0
    )}, ${secondLayer("4px", "6px")}`,
    "shadow-xl": `${offsetX} ${offsetY} ${blur} ${spread} ${color(
      1.0
    )}, ${secondLayer("8px", "10px")}`,
  };

  return shadowMap;
};

const generateColorVariables = (
  themeStyles: ThemeStyles,
  mode: ThemeMode,
  formatColor: (color: string) => string
): string => {
  const styles = themeStyles[mode];
  return `
  --background: ${formatColor(styles.background)};
  --foreground: ${formatColor(styles.foreground)};
  --card: ${formatColor(styles.card)};
  --card-foreground: ${formatColor(styles["card-foreground"])};
  --popover: ${formatColor(styles.popover)};
  --popover-foreground: ${formatColor(styles["popover-foreground"])};
  --primary: ${formatColor(styles.primary)};
  --primary-foreground: ${formatColor(styles["primary-foreground"])};
  --secondary: ${formatColor(styles.secondary)};
  --secondary-foreground: ${formatColor(styles["secondary-foreground"])};
  --muted: ${formatColor(styles.muted)};
  --muted-foreground: ${formatColor(styles["muted-foreground"])};
  --accent: ${formatColor(styles.accent)};
  --accent-foreground: ${formatColor(styles["accent-foreground"])};
  --destructive: ${formatColor(styles.destructive)};
  --destructive-foreground: ${formatColor(styles["destructive-foreground"])};
  --border: ${formatColor(styles.border)};
  --input: ${formatColor(styles.input)};
  --ring: ${formatColor(styles.ring)};
  --chart-1: ${formatColor(styles["chart-1"])};
  --chart-2: ${formatColor(styles["chart-2"])};
  --chart-3: ${formatColor(styles["chart-3"])};
  --chart-4: ${formatColor(styles["chart-4"])};
  --chart-5: ${formatColor(styles["chart-5"])};
  --sidebar: ${formatColor(styles.sidebar)};
  --sidebar-foreground: ${formatColor(styles["sidebar-foreground"])};
  --sidebar-primary: ${formatColor(styles["sidebar-primary"])};
  --sidebar-primary-foreground: ${formatColor(styles["sidebar-primary-foreground"])};
  --sidebar-accent: ${formatColor(styles["sidebar-accent"])};
  --sidebar-accent-foreground: ${formatColor(styles["sidebar-accent-foreground"])};
  --sidebar-border: ${formatColor(styles["sidebar-border"])};
  --sidebar-ring: ${formatColor(styles["sidebar-ring"])};`;
};

const generateFontVariables = (themeStyles: ThemeStyles, mode: ThemeMode): string => {
  const styles = themeStyles[mode];
  return `
  --font-sans: ${styles["font-sans"]};
  --font-serif: ${styles["font-serif"]};
  --font-mono: ${styles["font-mono"]};`;
};

const generateShadowVariables = (shadowMap: Record<string, string>): string => {
  return `
  --shadow-2xs: ${shadowMap["shadow-2xs"]};
  --shadow-xs: ${shadowMap["shadow-xs"]};
  --shadow-sm: ${shadowMap["shadow-sm"]};
  --shadow: ${shadowMap["shadow"]};
  --shadow-md: ${shadowMap["shadow-md"]};
  --shadow-lg: ${shadowMap["shadow-lg"]};
  --shadow-xl: ${shadowMap["shadow-xl"]};
  --shadow-2xl: ${shadowMap["shadow-2xl"]};`;
};

const generateRawShadowVariables = (themeStyles: ThemeStyles, mode: ThemeMode): string => {
  const styles = themeStyles[mode];
  return `
  --shadow-x: ${styles["shadow-offset-x"]};
  --shadow-y: ${styles["shadow-offset-y"]};
  --shadow-blur: ${styles["shadow-blur"]};
  --shadow-spread: ${styles["shadow-spread"]};
  --shadow-opacity: ${styles["shadow-opacity"]};
  --shadow-color: ${styles["shadow-color"]};`;
};

const generateTrackingVariables = (themeStyles: ThemeStyles): string => {
  const styles = themeStyles["light"];
  if (styles["letter-spacing"] === "0em") {
    return "";
  }
  return `

  --tracking-tighter: calc(var(--tracking-normal) - 0.05em);
  --tracking-tight: calc(var(--tracking-normal) - 0.025em);
  --tracking-normal: var(--tracking-normal);
  --tracking-wide: calc(var(--tracking-normal) + 0.025em);
  --tracking-wider: calc(var(--tracking-normal) + 0.05em);
  --tracking-widest: calc(var(--tracking-normal) + 0.1em);`;
};

const generateThemeVariables = (
  themeStyles: ThemeStyles,
  mode: ThemeMode,
  formatColor: (color: string) => string
): string => {
  const selector = mode === "dark" ? ".dark" : ":root";
  const colorVars = generateColorVariables(themeStyles, mode, formatColor);
  const fontVars = generateFontVariables(themeStyles, mode);
  const radiusVar = `\n  --radius: ${themeStyles[mode].radius};`;
  const shadowVars = generateShadowVariables(getShadowMap(themeStyles, mode));
  const rawShadowVars = generateRawShadowVariables(themeStyles, mode);
  const spacingVar =
    mode === "light"
      ? `\n  --spacing: ${themeStyles["light"].spacing ?? defaultLightThemeStyles.spacing};`
      : "";

  const trackingVars =
    mode === "light"
      ? `\n  --tracking-normal: ${themeStyles["light"]["letter-spacing"] ?? defaultLightThemeStyles["letter-spacing"]};`
      : "";

  return (
    selector +
    " {" +
    colorVars +
    fontVars +
    radiusVar +
    rawShadowVars +
    shadowVars +
    trackingVars +
    spacingVar +
    "\n}"
  );
};

const generateTailwindV4ThemeInline = (themeStyles: ThemeStyles): string => {
  return `@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);

  --font-sans: var(--font-sans);
  --font-mono: var(--font-mono);
  --font-serif: var(--font-serif);

  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);

  --shadow-2xs: var(--shadow-2xs);
  --shadow-xs: var(--shadow-xs);
  --shadow-sm: var(--shadow-sm);
  --shadow: var(--shadow);
  --shadow-md: var(--shadow-md);
  --shadow-lg: var(--shadow-lg);
  --shadow-xl: var(--shadow-xl);
  --shadow-2xl: var(--shadow-2xl);${generateTrackingVariables(themeStyles)}
}`;
};

const generateTailwindV3Config = (
  _themeStyles: ThemeStyles,
  colorFormat: ColorFormat = "hsl"
): string => {
  const colorToken = (key: string) => {
    return colorFormat === "hsl" ? `"hsl(var(--${key}))"` : `"var(--${key})"`;
  };

  return `/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  theme: {
    extend: {
      colors: {
        border: ${colorToken("border")},
        input: ${colorToken("input")},
        ring: ${colorToken("ring")},
        background: ${colorToken("background")},
        foreground: ${colorToken("foreground")},
        primary: {
          DEFAULT: ${colorToken("primary")},
          foreground: ${colorToken("primary-foreground")},
        },
        secondary: {
          DEFAULT: ${colorToken("secondary")},
          foreground: ${colorToken("secondary-foreground")},
        },
        destructive: {
          DEFAULT: ${colorToken("destructive")},
          foreground: ${colorToken("destructive-foreground")},
        },
        muted: {
            DEFAULT: ${colorToken("muted")},
          foreground: ${colorToken("muted-foreground")},
        },
        accent: {
          DEFAULT: ${colorToken("accent")},
          foreground: ${colorToken("accent-foreground")},
        },
        popover: {
          DEFAULT: ${colorToken("popover")},
          foreground: ${colorToken("popover-foreground")},
        },
        card: {
          DEFAULT: ${colorToken("card")},
          foreground: ${colorToken("card-foreground")},
        },
        sidebar: {
          DEFAULT: ${colorToken("sidebar")},
          foreground: ${colorToken("sidebar-foreground")},
          primary: ${colorToken("sidebar-primary")},
          "primary-foreground": ${colorToken("sidebar-primary-foreground")},
          accent: ${colorToken("sidebar-accent")},
          "accent-foreground": ${colorToken("sidebar-accent-foreground")},
          border: ${colorToken("sidebar-border")},
          ring: ${colorToken("sidebar-ring")},
        },
        chart: {
          1: ${colorToken("chart-1")},
          2: ${colorToken("chart-2")},
          3: ${colorToken("chart-3")},
          4: ${colorToken("chart-4")},
          5: ${colorToken("chart-5")},
        },
      },
      borderRadius: {
        xl: "calc(var(--radius) + 4px)",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        serif: ["var(--font-serif)"],
        mono: ["var(--font-mono)"],
      },
    },
  },
}`;
};

export const generateThemeCode = (
  themeEditorState: ThemeEditorState,
  colorFormat: ColorFormat = "hsl",
  tailwindVersion: "3" | "4" = "3"
): string => {
  if (
    !themeEditorState ||
    !("light" in themeEditorState.styles) ||
    !("dark" in themeEditorState.styles)
  ) {
    throw new Error("Invalid theme styles: missing light or dark mode");
  }

  const themeStyles = themeEditorState.styles as ThemeStyles;
  const formatColor = (color: string) => colorFormatter(color, colorFormat, tailwindVersion);

  const lightTheme = generateThemeVariables(themeStyles, "light", formatColor);
  const darkTheme = generateThemeVariables(themeStyles, "dark", formatColor);
  const tailwindV4Theme =
    tailwindVersion === "4" ? `\n\n${generateTailwindV4ThemeInline(themeStyles)}` : "";

  const bodyLetterSpacing =
    themeStyles["light"]["letter-spacing"] !== "0em"
      ? "\n\nbody {\n  letter-spacing: var(--tracking-normal);\n}"
      : "";

  return `${lightTheme}\n\n${darkTheme}${tailwindV4Theme}${bodyLetterSpacing}`;
};

export const generateTailwindConfigCode = (
  themeEditorState: ThemeEditorState,
  colorFormat: ColorFormat = "hsl",
  _tailwindVersion: "3" | "4" = "3"
): string => {
  if (
    !themeEditorState ||
    !("light" in themeEditorState.styles) ||
    !("dark" in themeEditorState.styles)
  ) {
    throw new Error("Invalid theme styles: missing light or dark mode");
  }

  const themeStyles = themeEditorState.styles as ThemeStyles;
  return generateTailwindV3Config(themeStyles, colorFormat);
};
