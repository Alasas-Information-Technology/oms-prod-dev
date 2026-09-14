/**
 * Contrast Audit Engine per INTERVIEW-PLANNING-UX.md §5.3
 *
 * Implements W3C WCAG 2.1 Relative Luminance and Contrast Ratio algorithms:
 *  - Body text: >= 4.5:1
 *  - Large text (>= 18.66px bold or >= 24px): >= 3.0:1
 *  - Meaningful icons & borders: >= 3.0:1
 *  - Focus rings: >= 3.0:1
 *  - Disabled text: >= 4.5:1
 */

export interface RgbColor {
  r: number;
  g: number;
  b: number;
}

export function hexToRgb(hex: string): RgbColor {
  const cleanHex = hex.replace("#", "").trim();
  const fullHex =
    cleanHex.length === 3
      ? cleanHex
          .split("")
          .map((c) => c + c)
          .join("")
      : cleanHex;

  const num = parseInt(fullHex, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

export function relativeLuminance({ r, g, b }: RgbColor): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

export function calculateContrastRatio(hex1: string, hex2: string): number {
  const lum1 = relativeLuminance(hexToRgb(hex1));
  const lum2 = relativeLuminance(hexToRgb(hex2));
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  const ratio = (brightest + 0.05) / (darkest + 0.05);
  return Math.round(ratio * 100) / 100;
}

export function blendRgb(fgHex: string, alpha: number, bgHex: string): string {
  const fg = hexToRgb(fgHex);
  const bg = hexToRgb(bgHex);
  const r = Math.round(fg.r * alpha + bg.r * (1 - alpha));
  const g = Math.round(fg.g * alpha + bg.g * (1 - alpha));
  const b = Math.round(fg.b * alpha + bg.b * (1 - alpha));
  return "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
}

export interface ContrastAuditItem {
  category: "Semantic Text" | "Semantic Border" | "Candidate Identity" | "Focus & State";
  token: string;
  lightPair: {
    fg: string;
    bg: string;
    ratio: number;
  };
  darkPair: {
    fg: string;
    bg: string;
    ratio: number;
  };
  minRequired: number;
  description: string;
  lightPass: boolean;
  darkPass: boolean;
  pass: boolean;
}

// Surfaces
export const SURFACE_LIGHT_BASE = "#FAF8F3";
export const SURFACE_LIGHT_CARD = "#FFFFFF";

export const SURFACE_DARK_BASE = "#0E0D0B";
export const SURFACE_DARK_CARD = "#171310"; // Elevation 1 (+4%)
export const SURFACE_DARK_ELEV2 = "#201A14"; // Elevation 2 (+4%)
export const SURFACE_DARK_ELEV3 = "#2A2219"; // Elevation 3 (+4%)

export function buildContrastAuditList(): ContrastAuditItem[] {
  const list: ContrastAuditItem[] = [
    // 1. Accent
    {
      category: "Semantic Text",
      token: "accent-text on accent-surface",
      lightPair: {
        fg: "#1B2A4A",
        bg: "#EEF1FB",
        ratio: calculateContrastRatio("#1B2A4A", "#EEF1FB"),
      },
      darkPair: {
        fg: "#C7D2FE",
        bg: "#1E2540",
        ratio: calculateContrastRatio("#C7D2FE", "#1E2540"),
      },
      minRequired: 4.5,
      description: "Body text on accent alert/tray surface",
      lightPass: true,
      darkPass: true,
      pass: true,
    },
    {
      category: "Semantic Text",
      token: "accent-text on card",
      lightPair: {
        fg: "#1B2A4A",
        bg: SURFACE_LIGHT_CARD,
        ratio: calculateContrastRatio("#1B2A4A", SURFACE_LIGHT_CARD),
      },
      darkPair: {
        fg: "#C7D2FE",
        bg: SURFACE_DARK_CARD,
        ratio: calculateContrastRatio("#C7D2FE", SURFACE_DARK_CARD),
      },
      minRequired: 4.5,
      description: "Accent text against card background",
      lightPass: true,
      darkPass: true,
      pass: true,
    },
    {
      category: "Semantic Border",
      token: "accent-border on card",
      lightPair: {
        fg: "#3E4E8C",
        bg: SURFACE_LIGHT_CARD,
        ratio: calculateContrastRatio("#3E4E8C", SURFACE_LIGHT_CARD),
      },
      darkPair: {
        fg: "#7C8FC4",
        bg: SURFACE_DARK_CARD,
        ratio: calculateContrastRatio("#7C8FC4", SURFACE_DARK_CARD),
      },
      minRequired: 3.0,
      description: "Meaningful accent border against card background",
      lightPass: true,
      darkPass: true,
      pass: true,
    },

    // 2. Success
    {
      category: "Semantic Text",
      token: "success-text on success-surface",
      lightPair: {
        fg: "#1E5C42",
        bg: "#EBF5EE",
        ratio: calculateContrastRatio("#1E5C42", "#EBF5EE"),
      },
      darkPair: {
        fg: "#A7E8C7",
        bg: "#12271F",
        ratio: calculateContrastRatio("#A7E8C7", "#12271F"),
      },
      minRequired: 4.5,
      description: "Success feedback / all-free text on tinted surface",
      lightPass: true,
      darkPass: true,
      pass: true,
    },
    {
      category: "Semantic Border",
      token: "success-border on card",
      lightPair: {
        fg: "#3A8F6B",
        bg: SURFACE_LIGHT_CARD,
        ratio: calculateContrastRatio("#3A8F6B", SURFACE_LIGHT_CARD),
      },
      darkPair: {
        fg: "#5FC79A",
        bg: SURFACE_DARK_CARD,
        ratio: calculateContrastRatio("#5FC79A", SURFACE_DARK_CARD),
      },
      minRequired: 3.0,
      description: "Success card border against card background",
      lightPass: true,
      darkPass: true,
      pass: true,
    },

    // 3. Warning
    {
      category: "Semantic Text",
      token: "warning-text on warning-surface",
      lightPair: {
        fg: "#7A4E0C",
        bg: "#FBF2E3",
        ratio: calculateContrastRatio("#7A4E0C", "#FBF2E3"),
      },
      darkPair: {
        fg: "#F5D89A",
        bg: "#2E2416",
        ratio: calculateContrastRatio("#F5D89A", "#2E2416"),
      },
      minRequired: 4.5,
      description: "Partial availability / mismatch warning text",
      lightPass: true,
      darkPass: true,
      pass: true,
    },
    {
      category: "Semantic Border",
      token: "warning-border on card",
      lightPair: {
        fg: "#B4791F",
        bg: SURFACE_LIGHT_CARD,
        ratio: calculateContrastRatio("#B4791F", SURFACE_LIGHT_CARD),
      },
      darkPair: {
        fg: "#E0A94A",
        bg: SURFACE_DARK_CARD,
        ratio: calculateContrastRatio("#E0A94A", SURFACE_DARK_CARD),
      },
      minRequired: 3.0,
      description: "Warning border against card background",
      lightPass: true,
      darkPass: true,
      pass: true,
    },

    // 4. Danger
    {
      category: "Semantic Text",
      token: "danger-text on danger-surface",
      lightPair: {
        fg: "#7A2818",
        bg: "#FBEDEA",
        ratio: calculateContrastRatio("#7A2818", "#FBEDEA"),
      },
      darkPair: {
        fg: "#F5B8A5",
        bg: "#2E1B18",
        ratio: calculateContrastRatio("#F5B8A5", "#2E1B18"),
      },
      minRequired: 4.5,
      description: "Conflict / blocked status text on danger surface",
      lightPass: true,
      darkPass: true,
      pass: true,
    },
    {
      category: "Semantic Border",
      token: "danger-border on card",
      lightPair: {
        fg: "#B0432C",
        bg: SURFACE_LIGHT_CARD,
        ratio: calculateContrastRatio("#B0432C", SURFACE_LIGHT_CARD),
      },
      darkPair: {
        fg: "#E8795C",
        bg: SURFACE_DARK_CARD,
        ratio: calculateContrastRatio("#E8795C", SURFACE_DARK_CARD),
      },
      minRequired: 3.0,
      description: "Danger border against card background",
      lightPass: true,
      darkPass: true,
      pass: true,
    },

    // 5. Info
    {
      category: "Semantic Text",
      token: "info-text on info-surface",
      lightPair: {
        fg: "#123F38",
        bg: "#EEF5F4",
        ratio: calculateContrastRatio("#123F38", "#EEF5F4"),
      },
      darkPair: {
        fg: "#A9DAD0",
        bg: "#132320",
        ratio: calculateContrastRatio("#A9DAD0", "#132320"),
      },
      minRequired: 4.5,
      description: "System notices and recommendations on cyan/teal surface",
      lightPass: true,
      darkPass: true,
      pass: true,
    },
    {
      category: "Semantic Border",
      token: "info-border on card",
      lightPair: {
        fg: "#256C61",
        bg: SURFACE_LIGHT_CARD,
        ratio: calculateContrastRatio("#256C61", SURFACE_LIGHT_CARD),
      },
      darkPair: {
        fg: "#4CA694",
        bg: SURFACE_DARK_CARD,
        ratio: calculateContrastRatio("#4CA694", SURFACE_DARK_CARD),
      },
      minRequired: 3.0,
      description: "Info border against card background",
      lightPass: true,
      darkPass: true,
      pass: true,
    },

    // 6. Focus & State
    {
      category: "Focus & State",
      token: "focus-ring against card",
      lightPair: {
        fg: "#1B2A4A",
        bg: SURFACE_LIGHT_CARD,
        ratio: calculateContrastRatio("#1B2A4A", SURFACE_LIGHT_CARD),
      },
      darkPair: {
        fg: "#7C8FC4",
        bg: SURFACE_DARK_CARD,
        ratio: calculateContrastRatio("#7C8FC4", SURFACE_DARK_CARD),
      },
      minRequired: 3.0,
      description: "Interactive element focus ring against card surface",
      lightPass: true,
      darkPass: true,
      pass: true,
    },
    {
      category: "Focus & State",
      token: "focus-ring against page background",
      lightPair: {
        fg: "#1B2A4A",
        bg: SURFACE_LIGHT_BASE,
        ratio: calculateContrastRatio("#1B2A4A", SURFACE_LIGHT_BASE),
      },
      darkPair: {
        fg: "#7C8FC4",
        bg: SURFACE_DARK_BASE,
        ratio: calculateContrastRatio("#7C8FC4", SURFACE_DARK_BASE),
      },
      minRequired: 3.0,
      description: "Interactive element focus ring against page background",
      lightPass: true,
      darkPass: true,
      pass: true,
    },
    {
      category: "Focus & State",
      token: "disabled-text against card",
      lightPair: {
        fg: "#7C7362",
        bg: SURFACE_LIGHT_CARD,
        ratio: calculateContrastRatio("#7C7362", SURFACE_LIGHT_CARD),
      },
      darkPair: {
        fg: "#948C7A",
        bg: SURFACE_DARK_CARD,
        ratio: calculateContrastRatio("#948C7A", SURFACE_DARK_CARD),
      },
      minRequired: 4.5,
      description: "Disabled text readability requirement (UX 5.3: disabled is not exempt)",
      lightPass: true,
      darkPass: true,
      pass: true,
    },

    // 7. Candidate Identity Hues (All 6)
    {
      category: "Candidate Identity",
      token: "candidate-0 (violet) left border",
      lightPair: {
        fg: "#7C6BC4",
        bg: SURFACE_LIGHT_CARD,
        ratio: calculateContrastRatio("#7C6BC4", SURFACE_LIGHT_CARD),
      },
      darkPair: {
        fg: "#9D8FE0",
        bg: SURFACE_DARK_CARD,
        ratio: calculateContrastRatio("#9D8FE0", SURFACE_DARK_CARD),
      },
      minRequired: 3.0,
      description: "Candidate 0 left border identifying C-014",
      lightPass: true,
      darkPass: true,
      pass: true,
    },
    {
      category: "Candidate Identity",
      token: "candidate-0 (violet) avatar text",
      lightPair: {
        fg: "#3C316E",
        bg: "#DDD7F5",
        ratio: calculateContrastRatio("#3C316E", "#DDD7F5"),
      },
      darkPair: {
        fg: "#E6E1FA",
        bg: "#3C316E",
        ratio: calculateContrastRatio("#E6E1FA", "#3C316E"),
      },
      minRequired: 4.5,
      description: "Candidate 0 initials avatar text",
      lightPass: true,
      darkPass: true,
      pass: true,
    },

    {
      category: "Candidate Identity",
      token: "candidate-1 (teal) left border",
      lightPair: {
        fg: "#0E7A6E",
        bg: SURFACE_LIGHT_CARD,
        ratio: calculateContrastRatio("#0E7A6E", SURFACE_LIGHT_CARD),
      },
      darkPair: {
        fg: "#25B2A2",
        bg: SURFACE_DARK_CARD,
        ratio: calculateContrastRatio("#25B2A2", SURFACE_DARK_CARD),
      },
      minRequired: 3.0,
      description: "Candidate 1 left border identifying C-021",
      lightPass: true,
      darkPass: true,
      pass: true,
    },
    {
      category: "Candidate Identity",
      token: "candidate-1 (teal) avatar text",
      lightPair: {
        fg: "#074039",
        bg: "#C5ECE7",
        ratio: calculateContrastRatio("#074039", "#C5ECE7"),
      },
      darkPair: {
        fg: "#D1F4F0",
        bg: "#074039",
        ratio: calculateContrastRatio("#D1F4F0", "#074039"),
      },
      minRequired: 4.5,
      description: "Candidate 1 initials avatar text",
      lightPass: true,
      darkPass: true,
      pass: true,
    },

    {
      category: "Candidate Identity",
      token: "candidate-2 (bronze) left border",
      lightPair: {
        fg: "#A65A2E",
        bg: SURFACE_LIGHT_CARD,
        ratio: calculateContrastRatio("#A65A2E", SURFACE_LIGHT_CARD),
      },
      darkPair: {
        fg: "#D3894F",
        bg: SURFACE_DARK_CARD,
        ratio: calculateContrastRatio("#D3894F", SURFACE_DARK_CARD),
      },
      minRequired: 3.0,
      description: "Candidate 2 left border identifying C-032",
      lightPass: true,
      darkPass: true,
      pass: true,
    },
    {
      category: "Candidate Identity",
      token: "candidate-2 (bronze) avatar text",
      lightPair: {
        fg: "#592E15",
        bg: "#F5DAC9",
        ratio: calculateContrastRatio("#592E15", "#F5DAC9"),
      },
      darkPair: {
        fg: "#F7E2D4",
        bg: "#592E15",
        ratio: calculateContrastRatio("#F7E2D4", "#592E15"),
      },
      minRequired: 4.5,
      description: "Candidate 2 initials avatar text",
      lightPass: true,
      darkPass: true,
      pass: true,
    },

    {
      category: "Candidate Identity",
      token: "candidate-3 (rose) left border",
      lightPair: {
        fg: "#C4586A",
        bg: SURFACE_LIGHT_CARD,
        ratio: calculateContrastRatio("#C4586A", SURFACE_LIGHT_CARD),
      },
      darkPair: {
        fg: "#E38695",
        bg: SURFACE_DARK_CARD,
        ratio: calculateContrastRatio("#E38695", SURFACE_DARK_CARD),
      },
      minRequired: 3.0,
      description: "Candidate 3 left border",
      lightPass: true,
      darkPass: true,
      pass: true,
    },
    {
      category: "Candidate Identity",
      token: "candidate-3 (rose) avatar text",
      lightPair: {
        fg: "#6B2632",
        bg: "#F7D5DB",
        ratio: calculateContrastRatio("#6B2632", "#F7D5DB"),
      },
      darkPair: {
        fg: "#FCE2E7",
        bg: "#6B2632",
        ratio: calculateContrastRatio("#FCE2E7", "#6B2632"),
      },
      minRequired: 4.5,
      description: "Candidate 3 initials avatar text",
      lightPass: true,
      darkPass: true,
      pass: true,
    },

    {
      category: "Candidate Identity",
      token: "candidate-4 (sky) left border",
      lightPair: {
        fg: "#2F6FA8",
        bg: SURFACE_LIGHT_CARD,
        ratio: calculateContrastRatio("#2F6FA8", SURFACE_LIGHT_CARD),
      },
      darkPair: {
        fg: "#5B9DD9",
        bg: SURFACE_DARK_CARD,
        ratio: calculateContrastRatio("#5B9DD9", SURFACE_DARK_CARD),
      },
      minRequired: 3.0,
      description: "Candidate 4 left border",
      lightPass: true,
      darkPass: true,
      pass: true,
    },
    {
      category: "Candidate Identity",
      token: "candidate-4 (sky) avatar text",
      lightPair: {
        fg: "#133959",
        bg: "#CBE0F2",
        ratio: calculateContrastRatio("#133959", "#CBE0F2"),
      },
      darkPair: {
        fg: "#DCEDFA",
        bg: "#133959",
        ratio: calculateContrastRatio("#DCEDFA", "#133959"),
      },
      minRequired: 4.5,
      description: "Candidate 4 initials avatar text",
      lightPass: true,
      darkPass: true,
      pass: true,
    },

    {
      category: "Candidate Identity",
      token: "candidate-5 (olive) left border",
      lightPair: {
        fg: "#7A8A3D",
        bg: SURFACE_LIGHT_CARD,
        ratio: calculateContrastRatio("#7A8A3D", SURFACE_LIGHT_CARD),
      },
      darkPair: {
        fg: "#A4B55E",
        bg: SURFACE_DARK_CARD,
        ratio: calculateContrastRatio("#A4B55E", SURFACE_DARK_CARD),
      },
      minRequired: 3.0,
      description: "Candidate 5 left border",
      lightPass: true,
      darkPass: true,
      pass: true,
    },
    {
      category: "Candidate Identity",
      token: "candidate-5 (olive) avatar text",
      lightPair: {
        fg: "#3C451A",
        bg: "#DFE5C4",
        ratio: calculateContrastRatio("#3C451A", "#DFE5C4"),
      },
      darkPair: {
        fg: "#F0F4DC",
        bg: "#3C451A",
        ratio: calculateContrastRatio("#F0F4DC", "#3C451A"),
      },
      minRequired: 4.5,
      description: "Candidate 5 initials avatar text",
      lightPass: true,
      darkPass: true,
      pass: true,
    },
  ];

  return list.map((item) => ({
    ...item,
    lightPass: item.lightPair.ratio >= item.minRequired,
    darkPass: item.darkPair.ratio >= item.minRequired,
    pass: item.lightPair.ratio >= item.minRequired && item.darkPair.ratio >= item.minRequired,
  }));
}
