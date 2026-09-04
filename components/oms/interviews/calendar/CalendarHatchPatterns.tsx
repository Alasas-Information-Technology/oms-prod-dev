import * as React from "react";

/**
 * Reusable SVG Hatch Patterns for Interview Availability Shading:
 * - hatch-one-busy: 45deg, 6px spacing, light stroke (1 interviewer busy)
 * - hatch-two-busy: 45deg, 4px spacing, denser stroke (2+ interviewers busy)
 * Reuses the SVG pattern specification from HatchPattern.tsx (dashboard work).
 */
export function CalendarHatchPatterns() {
  return (
    <svg
      className="absolute size-0 pointer-events-none opacity-0 sr-only"
      aria-hidden="true"
      width="0"
      height="0"
    >
      <defs>
        {/* Light Hatch: 1 Interviewer Busy */}
        <pattern
          id="hatch-one-busy"
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
            className="stroke-slate-500 dark:stroke-slate-400"
            strokeWidth="1"
            strokeOpacity="0.22"
          />
        </pattern>

        {/* Heavy Hatch: 2+ Interviewers Busy */}
        <pattern
          id="hatch-two-busy"
          width="4"
          height="4"
          patternTransform="rotate(45)"
          patternUnits="userSpaceOnUse"
        >
          <line
            x1="0"
            y1="0"
            x2="0"
            y2="4"
            className="stroke-slate-600 dark:stroke-slate-300"
            strokeWidth="1.2"
            strokeOpacity="0.42"
          />
        </pattern>
      </defs>
    </svg>
  );
}
