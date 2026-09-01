import React, { useId } from "react";

export interface HatchPatternProps {
  id?: string;
  color?: string;
  strokeWidth?: number;
  opacity?: number;
}

/**
 * Reusable SVG <pattern> defs block per T4:
 * 45 degrees, 1px lines, 6px apart, 18% opacity of the passed colour.
 */
export function HatchPatternDefs({
  id,
  color = "currentColor",
  strokeWidth = 1,
  opacity = 0.18,
}: HatchPatternProps) {
  return (
    <pattern
      id={id}
      width="6"
      height="6"
      patternTransform="rotate(45)"
      patternUnits="userSpaceOnUse"
    >
      <line
        x1="0"
        y1="0"
        x2="0"
        y2="6"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeOpacity={opacity}
      />
    </pattern>
  );
}

/**
 * Standalone SVG Hatch Pattern provider.
 */
export function HatchPattern({
  id: explicitId,
  color = "currentColor",
  strokeWidth = 1,
  opacity = 0.18,
}: HatchPatternProps) {
  const generatedId = useId().replace(/:/g, "");
  const id = explicitId || `hatch-${generatedId}`;

  return (
    <svg className="sr-only" aria-hidden="true" width="0" height="0">
      <defs>
        <HatchPatternDefs
          id={id}
          color={color}
          strokeWidth={strokeWidth}
          opacity={opacity}
        />
      </defs>
    </svg>
  );
}
