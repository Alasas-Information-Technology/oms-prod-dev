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
export const SURFACE_LIGHT_BASE = "#FAFBFC";
export const SURFACE_LIGHT_CARD = "#FFFFFF";

export const SURFACE_DARK_BASE = "#0B0F17";
export const SURFACE_DARK_CARD = "#161B26"; // Elevation 1 (+4%)
export const SURFACE_DARK_ELEV2 = "#212838"; // Elevation 2 (+4%)
export const SURFACE_DARK_ELEV3 = "#2D364A"; // Elevation 3 (+4%)

export function buildContrastAuditList(): ContrastAuditItem[] {
  const list: ContrastAuditItem[] = [
    // 1. Accent
    {
      category: "Semantic Text",
      token: "accent-text on accent-surface",
      lightPair: {
        fg: "#3730A3",
        bg: "#EEF2FF",
        ratio: calculateContrastRatio("#3730A3", "#EEF2FF"),
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
        fg: "#3730A3",
        bg: SURFACE_LIGHT_CARD,
        ratio: calculateContrastRatio("#3730A3", SURFACE_LIGHT_CARD),
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
        fg: "#4F46E5",
        bg: SURFACE_LIGHT_CARD,
        ratio: calculateContrastRatio("#4F46E5", SURFACE_LIGHT_CARD),
      },
      darkPair: {
        fg: "#818CF8",
        bg: SURFACE_DARK_CARD,
        ratio: calculateContrastRatio("#818CF8", SURFACE_DARK_CARD),
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
        fg: "#065F46",
        bg: "#ECFDF5",
        ratio: calculateContrastRatio("#065F46", "#ECFDF5"),
      },
      darkPair: {
        fg: "#A7F3D0",
        bg: "#142924",
        ratio: calculateContrastRatio("#A7F3D0", "#142924"),
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
        fg: "#059669",
        bg: SURFACE_LIGHT_CARD,
        ratio: calculateContrastRatio("#059669", SURFACE_LIGHT_CARD),
      },
      darkPair: {
        fg: "#34D399",
        bg: SURFACE_DARK_CARD,
        ratio: calculateContrastRatio("#34D399", SURFACE_DARK_CARD),
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
        fg: "#78350F",
        bg: "#FFFBEB",
        ratio: calculateContrastRatio("#78350F", "#FFFBEB"),
      },
      darkPair: {
        fg: "#FDE68A",
        bg: "#2E2416",
        ratio: calculateContrastRatio("#FDE68A", "#2E2416"),
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
        fg: "#B45309",
        bg: SURFACE_LIGHT_CARD,
        ratio: calculateContrastRatio("#B45309", SURFACE_LIGHT_CARD),
      },
      darkPair: {
        fg: "#FBBF24",
        bg: SURFACE_DARK_CARD,
        ratio: calculateContrastRatio("#FBBF24", SURFACE_DARK_CARD),
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
        fg: "#881337",
        bg: "#FFF1F2",
        ratio: calculateContrastRatio("#881337", "#FFF1F2"),
      },
      darkPair: {
        fg: "#FECDD3",
        bg: "#2E1B22",
        ratio: calculateContrastRatio("#FECDD3", "#2E1B22"),
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
        fg: "#E11D48",
        bg: SURFACE_LIGHT_CARD,
        ratio: calculateContrastRatio("#E11D48", SURFACE_LIGHT_CARD),
      },
      darkPair: {
        fg: "#FB7185",
        bg: SURFACE_DARK_CARD,
        ratio: calculateContrastRatio("#FB7185", SURFACE_DARK_CARD),
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
        fg: "#075985",
        bg: "#F0F9FF",
        ratio: calculateContrastRatio("#075985", "#F0F9FF"),
      },
      darkPair: {
        fg: "#BAE6FD",
        bg: "#142538",
        ratio: calculateContrastRatio("#BAE6FD", "#142538"),
      },
      minRequired: 4.5,
      description: "System suggestions & automation notice text",
      lightPass: true,
      darkPass: true,
      pass: true,
    },
    {
      category: "Semantic Border",
      token: "info-border on card",
      lightPair: {
        fg: "#0284C7",
        bg: SURFACE_LIGHT_CARD,
        ratio: calculateContrastRatio("#0284C7", SURFACE_LIGHT_CARD),
      },
      darkPair: {
        fg: "#38BDF8",
        bg: SURFACE_DARK_CARD,
        ratio: calculateContrastRatio("#38BDF8", SURFACE_DARK_CARD),
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
        fg: "#4F46E5",
        bg: SURFACE_LIGHT_CARD,
        ratio: calculateContrastRatio("#4F46E5", SURFACE_LIGHT_CARD),
      },
      darkPair: {
        fg: "#818CF8",
        bg: SURFACE_DARK_CARD,
        ratio: calculateContrastRatio("#818CF8", SURFACE_DARK_CARD),
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
        fg: "#4F46E5",
        bg: SURFACE_LIGHT_BASE,
        ratio: calculateContrastRatio("#4F46E5", SURFACE_LIGHT_BASE),
      },
      darkPair: {
        fg: "#818CF8",
        bg: SURFACE_DARK_BASE,
        ratio: calculateContrastRatio("#818CF8", SURFACE_DARK_BASE),
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
        fg: "#64748B",
        bg: SURFACE_LIGHT_CARD,
        ratio: calculateContrastRatio("#64748B", SURFACE_LIGHT_CARD),
      },
      darkPair: {
        fg: "#9CA3AF",
        bg: SURFACE_DARK_CARD,
        ratio: calculateContrastRatio("#9CA3AF", SURFACE_DARK_CARD),
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
        fg: "#7C3AED",
        bg: SURFACE_LIGHT_CARD,
        ratio: calculateContrastRatio("#7C3AED", SURFACE_LIGHT_CARD),
      },
      darkPair: {
        fg: "#A78BFA",
        bg: SURFACE_DARK_CARD,
        ratio: calculateContrastRatio("#A78BFA", SURFACE_DARK_CARD),
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
        fg: "#4C1D95",
        bg: "#DDD6FE",
        ratio: calculateContrastRatio("#4C1D95", "#DDD6FE"),
      },
      darkPair: {
        fg: "#EDE9FE",
        bg: "#4C1D95",
        ratio: calculateContrastRatio("#EDE9FE", "#4C1D95"),
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
        fg: "#0D9488",
        bg: SURFACE_LIGHT_CARD,
        ratio: calculateContrastRatio("#0D9488", SURFACE_LIGHT_CARD),
      },
      darkPair: {
        fg: "#2DD4BF",
        bg: SURFACE_DARK_CARD,
        ratio: calculateContrastRatio("#2DD4BF", SURFACE_DARK_CARD),
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
        fg: "#134E4A",
        bg: "#CCFBF1",
        ratio: calculateContrastRatio("#134E4A", "#CCFBF1"),
      },
      darkPair: {
        fg: "#CCFBF1",
        bg: "#134E4A",
        ratio: calculateContrastRatio("#CCFBF1", "#134E4A"),
      },
      minRequired: 4.5,
      description: "Candidate 1 initials avatar text",
      lightPass: true,
      darkPass: true,
      pass: true,
    },

    {
      category: "Candidate Identity",
      token: "candidate-2 (amber) left border",
      lightPair: {
        fg: "#D97706",
        bg: SURFACE_LIGHT_CARD,
        ratio: calculateContrastRatio("#D97706", SURFACE_LIGHT_CARD),
      },
      darkPair: {
        fg: "#FBBF24",
        bg: SURFACE_DARK_CARD,
        ratio: calculateContrastRatio("#FBBF24", SURFACE_DARK_CARD),
      },
      minRequired: 3.0,
      description: "Candidate 2 left border identifying C-032",
      lightPass: true,
      darkPass: true,
      pass: true,
    },
    {
      category: "Candidate Identity",
      token: "candidate-2 (amber) avatar text",
      lightPair: {
        fg: "#78350F",
        bg: "#FEF3C7",
        ratio: calculateContrastRatio("#78350F", "#FEF3C7"),
      },
      darkPair: {
        fg: "#FEF3C7",
        bg: "#78350F",
        ratio: calculateContrastRatio("#FEF3C7", "#78350F"),
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
        fg: "#E11D48",
        bg: SURFACE_LIGHT_CARD,
        ratio: calculateContrastRatio("#E11D48", SURFACE_LIGHT_CARD),
      },
      darkPair: {
        fg: "#FB7185",
        bg: SURFACE_DARK_CARD,
        ratio: calculateContrastRatio("#FB7185", SURFACE_DARK_CARD),
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
        fg: "#881337",
        bg: "#FFE4E6",
        ratio: calculateContrastRatio("#881337", "#FFE4E6"),
      },
      darkPair: {
        fg: "#FFE4E6",
        bg: "#881337",
        ratio: calculateContrastRatio("#FFE4E6", "#881337"),
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
        fg: "#0284C7",
        bg: SURFACE_LIGHT_CARD,
        ratio: calculateContrastRatio("#0284C7", SURFACE_LIGHT_CARD),
      },
      darkPair: {
        fg: "#38BDF8",
        bg: SURFACE_DARK_CARD,
        ratio: calculateContrastRatio("#38BDF8", SURFACE_DARK_CARD),
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
        fg: "#0C4A6E",
        bg: "#E0F2FE",
        ratio: calculateContrastRatio("#0C4A6E", "#E0F2FE"),
      },
      darkPair: {
        fg: "#E0F2FE",
        bg: "#0C4A6E",
        ratio: calculateContrastRatio("#E0F2FE", "#0C4A6E"),
      },
      minRequired: 4.5,
      description: "Candidate 4 initials avatar text",
      lightPass: true,
      darkPass: true,
      pass: true,
    },

    {
      category: "Candidate Identity",
      token: "candidate-5 (lime) left border",
      lightPair: {
        fg: "#65A30D",
        bg: SURFACE_LIGHT_CARD,
        ratio: calculateContrastRatio("#65A30D", SURFACE_LIGHT_CARD),
      },
      darkPair: {
        fg: "#A3E635",
        bg: SURFACE_DARK_CARD,
        ratio: calculateContrastRatio("#A3E635", SURFACE_DARK_CARD),
      },
      minRequired: 3.0,
      description: "Candidate 5 left border",
      lightPass: true,
      darkPass: true,
      pass: true,
    },
    {
      category: "Candidate Identity",
      token: "candidate-5 (lime) avatar text",
      lightPair: {
        fg: "#365314",
        bg: "#ECFCCB",
        ratio: calculateContrastRatio("#365314", "#ECFCCB"),
      },
      darkPair: {
        fg: "#ECFCCB",
        bg: "#365314",
        ratio: calculateContrastRatio("#ECFCCB", "#365314"),
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
