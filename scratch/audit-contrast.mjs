function hexToRgb(hex) {
  const clean = hex.replace("#", "");
  const num = parseInt(clean, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

function sRgbToLinear(c) {
  const v = c / 255;
  return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

function getRelativeLuminance(rgb) {
  const r = sRgbToLinear(rgb.r);
  const g = sRgbToLinear(rgb.g);
  const b = sRgbToLinear(rgb.b);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function getContrastRatio(hex1, hex2) {
  const lum1 = getRelativeLuminance(hexToRgb(hex1));
  const lum2 = getRelativeLuminance(hexToRgb(hex2));
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

const tokens = {
  light: {
    bg: "#FFFFFF",
    card: "#FFFFFF",
    disabledText: "#64748B",
    ring: "#5B5FE1",
    semantic: {
      accent: { surface: "#EEF2FF", border: "#4F46E5", text: "#3730A3" },
      success: { surface: "#ECFDF5", border: "#059669", text: "#065F46" },
      warning: { surface: "#FFFBEB", border: "#B45309", text: "#78350F" },
      danger: { surface: "#FFF1F2", border: "#E11D48", text: "#881337" },
      info: { surface: "#F0F9FF", border: "#0284C7", text: "#075985" },
    },
    candidates: [
      { name: "Violet", surface: "#F5F3FF", border: "#7C3AED", text: "#5B21B6", avatarBg: "#DDD6FE", avatarText: "#4C1D95" },
      { name: "Teal", surface: "#F0FDFA", border: "#0D9488", text: "#115E59", avatarBg: "#CCFBF1", avatarText: "#134E4A" },
      { name: "Amber", surface: "#FFFBEB", border: "#D97706", text: "#92400E", avatarBg: "#FEF3C7", avatarText: "#78350F" },
      { name: "Rose", surface: "#FFF1F2", border: "#E11D48", text: "#9F1239", avatarBg: "#FFE4E6", avatarText: "#881337" },
      { name: "Sky", surface: "#F0F9FF", border: "#0284C7", text: "#0369A1", avatarBg: "#E0F2FE", avatarText: "#0C4A6E" },
      { name: "Lime", surface: "#F7FEE7", border: "#65A30D", text: "#3F6212", avatarBg: "#ECFCCB", avatarText: "#365314" },
    ],
  },
  dark: {
    bg: "#0B0F17",
    card: "#161B26",
    disabledText: "#9CA3AF",
    ring: "#818CF8",
    semantic: {
      accent: { surface: "#1E2540", border: "#818CF8", text: "#C7D2FE" },
      success: { surface: "#142924", border: "#34D399", text: "#A7F3D0" },
      warning: { surface: "#2E2416", border: "#FBBF24", text: "#FDE68A" },
      danger: { surface: "#2E1B22", border: "#FB7185", text: "#FECDD3" },
      info: { surface: "#142538", border: "#38BDF8", text: "#BAE6FD" },
    },
    candidates: [
      { name: "Violet", surface: "#272836", border: "#A78BFA", text: "#DDD6FE", avatarBg: "#4C1D95", avatarText: "#EDE9FE" },
      { name: "Teal", surface: "#183138", border: "#2DD4BF", text: "#99F6E4", avatarBg: "#134E4A", avatarText: "#CCFBF1" },
      { name: "Amber", surface: "#312E26", border: "#FBBF24", text: "#FDE68A", avatarBg: "#78350F", avatarText: "#FEF3C7" },
      { name: "Rose", surface: "#312531", border: "#FB7185", text: "#FECDD3", avatarBg: "#881337", avatarText: "#FFE4E6" },
      { name: "Sky", surface: "#1A2E3F", border: "#38BDF8", text: "#BAE6FD", avatarBg: "#0C4A6E", avatarText: "#E0F2FE" },
      { name: "Lime", surface: "#273327", border: "#A3E635", text: "#D9F99D", avatarBg: "#365314", avatarText: "#ECFCCB" },
    ],
  },
};

console.log("| Theme | Element Pair | Target | Calculated Ratio | Status |");
console.log("| :--- | :--- | :--- | :--- | :--- |");

for (const theme of ["light", "dark"]) {
  const t = tokens[theme];

  // 1. Semantic Text on Surface
  for (const [name, s] of Object.entries(t.semantic)) {
    const ratio = getContrastRatio(s.text, s.surface);
    const pass = ratio >= 4.5;
    console.log(`| ${theme.toUpperCase()} | Semantic ${name} (text on surface) | ≥ 4.5:1 | **${ratio.toFixed(2)}:1** | ${pass ? "PASS" : "FAIL"} |`);
  }

  // 2. Semantic Border on Surface
  for (const [name, s] of Object.entries(t.semantic)) {
    const ratio = getContrastRatio(s.border, s.surface);
    const pass = ratio >= 3.0;
    console.log(`| ${theme.toUpperCase()} | Semantic ${name} (border on surface) | ≥ 3.0:1 | **${ratio.toFixed(2)}:1** | ${pass ? "PASS" : "FAIL"} |`);
  }

  // 3. Disabled text on background
  const disabledRatio = getContrastRatio(t.disabledText, t.bg);
  console.log(`| ${theme.toUpperCase()} | Disabled text on background | ≥ 4.5:1 | **${disabledRatio.toFixed(2)}:1** | ${disabledRatio >= 4.5 ? "PASS" : "FAIL"} |`);

  // 4. Focus ring on background
  const ringRatio = getContrastRatio(t.ring, t.bg);
  console.log(`| ${theme.toUpperCase()} | Focus ring on background | ≥ 3.0:1 | **${ringRatio.toFixed(2)}:1** | ${ringRatio >= 3.0 ? "PASS" : "FAIL"} |`);

  // 5. Candidate Tokens
  for (const cand of t.candidates) {
    const textOnSurface = getContrastRatio(cand.text, cand.surface);
    const borderOnCard = getContrastRatio(cand.border, t.card);
    const avatarContrast = getContrastRatio(cand.avatarText, cand.avatarBg);

    console.log(`| ${theme.toUpperCase()} | Candidate ${cand.name} (text on surface) | ≥ 4.5:1 | **${textOnSurface.toFixed(2)}:1** | ${textOnSurface >= 4.5 ? "PASS" : "FAIL"} |`);
    console.log(`| ${theme.toUpperCase()} | Candidate ${cand.name} (border on card) | ≥ 3.0:1 | **${borderOnCard.toFixed(2)}:1** | ${borderOnCard >= 3.0 ? "PASS" : "FAIL"} |`);
    console.log(`| ${theme.toUpperCase()} | Candidate ${cand.name} (avatar text on bg) | ≥ 4.5:1 | **${avatarContrast.toFixed(2)}:1** | ${avatarContrast >= 4.5 ? "PASS" : "FAIL"} |`);
  }
}
