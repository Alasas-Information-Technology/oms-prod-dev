/**
 * Chart Tokens
 *
 * Single source of truth for all dashboard chart aesthetics.
 * Curated executive multi-color palette and semantic tokens for an upmarket, clean aesthetic.
 */

export const executivePalette = [
  "#3b82f6", // Sapphire Blue
  "#10b981", // Emerald Green
  "#7C6BC4", // Bedrock Violet
  "#f59e0b", // Warm Amber
  "#06b6d4", // Cyan / Teal
  "#ec4899", // Rose
  "#6366f1", // Indigo
  "#14b8a6", // Mint Teal
];

/**
 * Returns an array of CSS colors based on the executive multi-color palette.
 */
export function categoricalScale(count: number): string[] {
  const scale: string[] = [];
  for (let i = 0; i < count; i++) {
    scale.push(executivePalette[i % executivePalette.length]);
  }
  return scale;
}

export const semanticColors = {
  success: "var(--success-border, #2E7D47)",
  failure: "var(--danger-border, #B0432C)",
  warning: "var(--warning-border, #B87514)",
  info: "var(--info-border, #2E6B9E)",
  neutral: "var(--muted-foreground)",
};

/**
 * Gridlines: Subtle horizontal only, foreground at 4% opacity.
 */
export const gridStyle = {
  stroke: "var(--foreground)",
  strokeOpacity: 0.04,
  vertical: false,
  horizontal: true,
};

/**
 * Axis labels: 11px muted, no axis line, no tick line.
 */
export const axisStyle = {
  fontSize: 11,
  fill: "var(--muted-foreground)",
  fontFamily: "var(--font-sans)",
  tickLine: false,
  axisLine: false,
};

/**
 * Tooltip style
 */
export const tooltipStyle = {
  backgroundColor: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius-md)",
  color: "var(--popover-foreground)",
  boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
  fontSize: 12,
  fontFamily: "var(--font-ui)",
};

