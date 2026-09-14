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
    bg: "#FAF8F3",
    card: "#FFFFFF",
    disabledText: "#7C7362",
    ring: "#1B2A4A",
    semantic: {
      accent: { surface: "#EEF2FF", border: "#3E568A", text: "#1B2A4A" },
      success: { surface: "#E8F4EC", border: "#2E7D47", text: "#1B542E" },
      warning: { surface: "#FDF4E2", border: "#B87514", text: "#7D4A06" },
      danger: { surface: "#FCEEEB", border: "#B0432C", text: "#7A2816" },
      info: { surface: "#EBF3F8", border: "#2E6B9E", text: "#1A4669" },
    },
    candidates: [
      { name: "Violet", surface: "#F4F1FA", border: "#7C6BC4", text: "#48388C", avatarBg: "#E5E0F4", avatarText: "#32256B" },
      { name: "Teal", surface: "#EAF3F2", border: "#0E7A6E", text: "#085048", avatarBg: "#CEE5E2", avatarText: "#053B35" },
      { name: "Bronze", surface: "#F8F1EC", border: "#A65A2E", text: "#6E3615", avatarBg: "#EEDCD0", avatarText: "#52260B" },
      { name: "Rose", surface: "#F9ECEE", border: "#C4586A", text: "#8A2E3F", avatarBg: "#F1D4D9", avatarText: "#6B1D2D" },
      { name: "Sky", surface: "#ECF2F8", border: "#2F6FA8", text: "#1A4A75", avatarBg: "#D4E3F1", avatarText: "#103454" },
      { name: "Olive", surface: "#F4F5EB", border: "#7A8A3D", text: "#4D5920", avatarBg: "#E3E7CB", avatarText: "#353E13" },
    ],
  },
  dark: {
    bg: "#0E0D0B",
    card: "#171310",
    disabledText: "#948C7A",
    ring: "#7C8FC4",
    semantic: {
      accent: { surface: "#1C2035", border: "#7C8FC4", text: "#C7D2FE" },
      success: { surface: "#13251A", border: "#5AA873", text: "#B8E2C4" },
      warning: { surface: "#2A1F0D", border: "#E29A38", text: "#F8D89E" },
      danger: { surface: "#2B1510", border: "#D45D43", text: "#F3AEA0" },
      info: { surface: "#10202E", border: "#5695C9", text: "#B0D3ED" },
    },
    candidates: [
      { name: "Violet", surface: "#201B2E", border: "#9D8FE0", text: "#DDD6FE", avatarBg: "#433575", avatarText: "#EDE9FE" },
      { name: "Teal", surface: "#112624", border: "#25B2A2", text: "#A4EAE1", avatarBg: "#0C4740", avatarText: "#D1F5F0" },
      { name: "Bronze", surface: "#291B13", border: "#E08B58", text: "#F8D4BC", avatarBg: "#5C2F14", avatarText: "#FDECE2" },
      { name: "Rose", surface: "#2B171C", border: "#DE7B8C", text: "#F8CDD4", avatarBg: "#631F2D", avatarText: "#FCE7EB" },
      { name: "Sky", surface: "#142230", border: "#5496D4", text: "#BFDCF8", avatarBg: "#173B5E", avatarText: "#DFEEFC" },
      { name: "Olive", surface: "#212414", border: "#A7B860", text: "#E5EDB8", avatarBg: "#444E1C", avatarText: "#F1F6D6" },
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
