/**
 * Chart Tokens
 *
 * Single source of truth for all dashboard chart aesthetics.
 * Curated executive multi-color palette and semantic tokens for an upmarket, clean aesthetic.
 */

export const executivePalette = [
  "#1B2B5C", // Rasikh Primary
  "#6063A2", // Rasikh Indigo Accent
  "#23879C", // Rasikh Teal
  "#3A8F6B", // Rasikh Success
  "#B4791F", // Rasikh Warning
  "#B0432C", // Rasikh Danger
  "#CBA876", // Rasikh Gold
  "#8E3B68", // Candidate Plum
];

/**
 * Standard opacity steps for single-hue categorical ramps:
 * 100%, 72%, 48%, 30%, 20%, 14%, 10%, 8% per DASHBOARD-VISUAL-LANGUAGE.md T6
 */
const OPACITY_STEPS = [1.0, 0.72, 0.48, 0.30, 0.20, 0.14, 0.10, 0.08];

/**
 * Returns an array of CSS colors ramping from the active mode's accent:
 * --rasikh-primary (operational mode) or --rasikh-indigo-accent (dashboard mode)
 * via var(--accent-interactive, var(--primary)).
 */
export function categoricalScale(
  count: number,
  baseColor: string = "var(--chart-1, var(--rasikh-teal))"
): string[] {
  const scale: string[] = [];
  for (let i = 0; i < count; i++) {
    const step = OPACITY_STEPS[i % OPACITY_STEPS.length];
    const pct = Math.round(step * 100);
    if (pct === 100) {
      scale.push(baseColor);
    } else {
      scale.push(`color-mix(in srgb, ${baseColor} ${pct}%, transparent)`);
    }
  }
  return scale;
}

export const semanticColors = {
  success: "var(--success-border, #3A8F6B)",
  failure: "var(--danger-border, #B0432C)",
  warning: "var(--warning-border, #B4791F)",
  info: "var(--info-border, #23879C)",
  neutral: "var(--muted-foreground, #7C7362)",
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

