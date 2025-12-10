// ============================================================================
// Color Converter - No External Dependencies (Standalone)
// ============================================================================

export type ColorFormat = "hex" | "rgb" | "hsl" | "oklch";

interface ParsedColor {
  r: number;
  g: number;
  b: number;
  a?: number;
}

interface HSL {
  h: number;
  s: number;
  l: number;
  a?: number;
}

interface OKLCH {
  l: number;
  c: number;
  h: number;
  a?: number;
}

export const formatNumber = (num?: number) => {
  if (!num) return "0";
  return num % 1 === 0 ? num : num.toFixed(4);
};

/**
 * Parse a color string in hex, rgb, hsl, or oklch format
 */
const parseColor = (colorValue: string): ParsedColor | null => {
  const trimmed = colorValue.trim();

  // Hex format (#RGB, #RRGGBB, #RGBA, #RRGGBBAA)
  if (trimmed.startsWith("#")) {
    const hex = trimmed.slice(1);
    if (!/^[0-9A-Fa-f]{3}$|^[0-9A-Fa-f]{4}$|^[0-9A-Fa-f]{6}$|^[0-9A-Fa-f]{8}$/.test(hex)) {
      return null;
    }

    let r, g, b, a;
    if (hex.length === 3 || hex.length === 4) {
      r = parseInt(hex[0] + hex[0], 16);
      g = parseInt(hex[1] + hex[1], 16);
      b = parseInt(hex[2] + hex[2], 16);
      a = hex.length === 4 ? parseInt(hex[3] + hex[3], 16) / 255 : undefined;
    } else {
      r = parseInt(hex.slice(0, 2), 16);
      g = parseInt(hex.slice(2, 4), 16);
      b = parseInt(hex.slice(4, 6), 16);
      a = hex.length === 8 ? parseInt(hex.slice(6, 8), 16) / 255 : undefined;
    }

    return { r: r / 255, g: g / 255, b: b / 255, a };
  }

  // RGB format (rgb(r, g, b) or rgba(r, g, b, a))
  const rgbMatch = trimmed.match(
    /rgba?\s*\(\s*(\d+(?:\.\d+)?%?)\s*,\s*(\d+(?:\.\d+)?%?)\s*,\s*(\d+(?:\.\d+)?%?)\s*(?:,\s*(\d+(?:\.\d+)?)\s*)?\)/i
  );
  if (rgbMatch) {
    const toNormalized = (val: string) => {
      const num = parseFloat(val);
      return val.includes("%") ? num / 100 : num / 255;
    };
    return {
      r: toNormalized(rgbMatch[1]),
      g: toNormalized(rgbMatch[2]),
      b: toNormalized(rgbMatch[3]),
      a: rgbMatch[4] ? parseFloat(rgbMatch[4]) : undefined,
    };
  }

  // HSL format (hsl(h, s%, l%) or hsla(h, s%, l%, a))
  const hslMatch = trimmed.match(
    /hsla?\s*\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)%\s*,\s*(\d+(?:\.\d+)?)%\s*(?:,\s*(\d+(?:\.\d+)?)\s*)?\)/i
  );
  if (hslMatch) {
    const h = parseFloat(hslMatch[1]);
    const s = parseFloat(hslMatch[2]) / 100;
    const l = parseFloat(hslMatch[3]) / 100;
    return hslToRgb({ h, s, l, a: hslMatch[4] ? parseFloat(hslMatch[4]) : undefined });
  }

  // OKLCH format (oklch(l c h) or oklch(l c h / a))
  const oklchMatch = trimmed.match(
    /oklch\s*\(\s*([0-9.]+)\s+([0-9.]+)\s+([0-9.]+)\s*(?:\/\s*([0-9.]+)\s*)?\)/i
  );
  if (oklchMatch) {
    const l = parseFloat(oklchMatch[1]);
    const c = parseFloat(oklchMatch[2]);
    const h = parseFloat(oklchMatch[3]);
    const a = oklchMatch[4] ? parseFloat(oklchMatch[4]) : undefined;
    return oklchToRgb({ l, c, h, a });
  }

  return null;
};

/**
 * Convert RGB to HSL
 */
const rgbToHsl = (color: ParsedColor): HSL => {
  const r = color.r;
  const g = color.g;
  const b = color.b;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return { h: h * 360, s, l, a: color.a };
};

/**
 * Convert HSL to RGB
 */
const hslToRgb = (hsl: HSL): ParsedColor => {
  const h = hsl.h / 360;
  const s = hsl.s;
  const l = hsl.l;

  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return { r, g, b, a: hsl.a };
};

/**
 * Convert RGB to OKLCH
 */
const rgbToOklch = (color: ParsedColor): OKLCH => {
  // RGB to Linear RGB
  const toLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  const lr = toLinear(color.r);
  const lg = toLinear(color.g);
  const lb = toLinear(color.b);

  // Linear RGB to LMS
  const l = 0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb;
  const m = 0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb;
  const s = 0.0883024619 * lr + 0.0853627803 * lg + 0.8149879486 * lb;

  // LMS to OKLCH
  const l_ = Math.cbrt(l);
  const m_ = Math.cbrt(m);
  const s_ = Math.cbrt(s);

  const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_;
  const a = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_;
  const b = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808649671 * s_;

  const C = Math.sqrt(a * a + b * b);
  let H = Math.atan2(b, a) * (180 / Math.PI);
  if (H < 0) H += 360;

  return { l: L, c: C, h: H, a: color.a };
};

/**
 * Convert OKLCH to RGB
 */
const oklchToRgb = (oklch: OKLCH): ParsedColor => {
  const L = oklch.l;
  const C = oklch.c;
  const H = oklch.h * (Math.PI / 180);

  const a = C * Math.cos(H);
  const b = C * Math.sin(H);

  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291506236 * b;

  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;

  let r = 4.0767416621 * l - 3.3077363322 * m + 0.2309101289 * s;
  let g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193761 * s;
  let b_val = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;

  // Linear RGB to RGB
  const toSrgb = (c: number) => (c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055);

  r = Math.max(0, Math.min(1, toSrgb(r)));
  g = Math.max(0, Math.min(1, toSrgb(g)));
  b_val = Math.max(0, Math.min(1, toSrgb(b_val)));

  return { r, g, b: b_val, a: oklch.a };
};

/**
 * Convert RGB to Hex
 */
const rgbToHex = (color: ParsedColor): string => {
  const toHex = (c: number) => {
    const hex = Math.round(c * 255).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };

  const hex = `#${toHex(color.r)}${toHex(color.g)}${toHex(color.b)}`;

  if (color.a !== undefined && color.a < 1) {
    return hex + toHex(color.a);
  }

  return hex;
};

/**
 * Convert RGB to RGB string
 */
const rgbToString = (color: ParsedColor): string => {
  const r = Math.round(color.r * 255);
  const g = Math.round(color.g * 255);
  const b = Math.round(color.b * 255);

  if (color.a !== undefined && color.a < 1) {
    return `rgba(${r}, ${g}, ${b}, ${formatNumber(color.a)})`;
  }

  return `rgb(${r}, ${g}, ${b})`;
};

export const formatHsl = (hsl: HSL) => {
  return `hsl(${formatNumber(hsl.h)} ${formatNumber(hsl.s * 100)}% ${formatNumber(hsl.l * 100)}%)`;
};

export const colorFormatter = (
  colorValue: string,
  format: ColorFormat = "hsl",
  tailwindVersion: "3" | "4" = "3"
): string => {
  try {
    const rgb = parseColor(colorValue);
    if (!rgb) throw new Error("Invalid color input");

    switch (format) {
      case "hsl": {
        const hsl = rgbToHsl(rgb);
        if (tailwindVersion === "4") {
          return formatHsl(hsl);
        }
        return `${formatNumber(hsl.h)} ${formatNumber(hsl.s * 100)}% ${formatNumber(hsl.l * 100)}%`;
      }
      case "rgb":
        return rgbToString(rgb);
      case "oklch": {
        const oklch = rgbToOklch(rgb);
        return `oklch(${formatNumber(oklch.l)} ${formatNumber(oklch.c)} ${formatNumber(oklch.h)})`;
      }
      case "hex":
        return rgbToHex(rgb);
      default:
        return colorValue;
    }
  } catch (error) {
    console.error(`Failed to convert color: ${colorValue}`, error);
    return colorValue;
  }
};

export const convertToHSL = (colorValue: string): string => colorFormatter(colorValue, "hsl");
