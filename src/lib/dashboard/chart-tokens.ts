/**
 * Chart Tokens
 *
 * Single source of truth for all dashboard chart aesthetics.
 * Enforces strict rules on categorical and semantic coloring.
 */

/**
 * Returns an array of CSS colors based on a single hue at descending opacities.
 * NEVER use one hue per category. Color must mean something.
 */
export function categoricalScale(count: number): string[] {
  // We use color-mix to apply opacity to the CSS variable dynamically
  // Opacity steps: 100%, 75%, 55%, 40%, 28%, 20%, 12%, 8%...
  const opacities = [100, 75, 55, 40, 28, 20, 12, 8, 5, 2];
  
  const scale: string[] = [];
  for (let i = 0; i < count; i++) {
    const opacity = opacities[i % opacities.length];
    scale.push(`color-mix(in srgb, var(--primary) ${opacity}%, transparent)`);
  }
  
  return scale;
}

export const semanticColors = {
  success: "var(--success)",
  failure: "var(--destructive)",
  warning: "var(--warning)",
  neutral: "var(--muted-foreground)",
};

export const gridStyle = {
  stroke: "var(--foreground)",
  strokeOpacity: 0.06,
  vertical: false, // Enforce horizontal only
  horizontal: true,
};

export const axisStyle = {
  fontSize: 11,
  fill: "var(--muted-foreground)",
  fontFamily: "var(--font-sans)",
  tickLine: false,
  axisLine: false,
};

export const tooltipStyle = {
  backgroundColor: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius-md)",
  color: "var(--popover-foreground)",
  boxShadow: "var(--shadow-md)",
  fontSize: 12,
  fontFamily: "var(--font-mono)", // tabular-nums implicitly supported by mono or classes
};
