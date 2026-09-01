/**
 * Chart Tokens
 *
 * Single source of truth for all dashboard chart aesthetics.
 * Enforces strict rules on categorical and semantic coloring.
 */

/**
 * Returns an array of CSS colors based on a single hue at descending opacities.
 * Categorical Scale per T6 / F1: 100%, 72%, 48%, 30%, 18%, 10%...
 */
export function categoricalScale(count: number): string[] {
  const opacities = [100, 72, 48, 30, 18, 10, 6, 3];
  
  const scale: string[] = [];
  for (let i = 0; i < count; i++) {
    const opacity = opacities[i % opacities.length];
    if (opacity === 100) {
      scale.push("var(--primary)");
    } else {
      scale.push(`color-mix(in srgb, var(--primary) ${opacity}%, transparent)`);
    }
  }
  
  return scale;
}

export const semanticColors = {
  success: "var(--success)",
  failure: "var(--destructive)",
  warning: "var(--warning)",
  neutral: "var(--muted-foreground)",
};

/**
 * Gridlines per T11: Horizontal only, foreground at 4% opacity.
 */
export const gridStyle = {
  stroke: "var(--foreground)",
  strokeOpacity: 0.04,
  vertical: false, // Enforce horizontal only
  horizontal: true,
};

/**
 * Axis labels per T11: 11px muted, no axis line, no tick line.
 */
export const axisStyle = {
  fontSize: 11,
  fill: "var(--muted-foreground)",
  fontFamily: "var(--font-sans)",
  tickLine: false,
  axisLine: false,
};

/**
 * Default Tooltip style
 */
export const tooltipStyle = {
  backgroundColor: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius-md)",
  color: "var(--popover-foreground)",
  boxShadow: "var(--shadow-md)",
  fontSize: 12,
  fontFamily: "var(--font-mono)",
};
