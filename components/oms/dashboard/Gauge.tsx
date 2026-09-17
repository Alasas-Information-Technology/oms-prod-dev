"use client";

import React, { useMemo } from "react";
import { cn } from "@/lib/utils";

export interface GaugeProps {
  value: number;
  max: number;
  threshold?: number;
  thresholdCrossed?: boolean;
  valueFormatter?: (value: number) => string;
  label?: string;
  className?: string;
  /** Force standard threshold semantics if needed (e.g., cross = danger, or cross = success) */
  thresholdSemantic?: "danger" | "success";
}

export function Gauge({
  value,
  max,
  threshold,
  thresholdCrossed,
  valueFormatter,
  label,
  className,
  thresholdSemantic = "danger",
}: GaugeProps) {
  // Clamp value to max
  const clampedValue = Math.min(Math.max(value, 0), max);
  const percent = max > 0 ? clampedValue / max : 0;

  // 180 degree arc geometry
  const radius = 90;
  const strokeWidth = 20;
  const cx = 100;
  const cy = 100;
  // Arc path from left to right
  const pathData = `M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`;
  const arcLength = Math.PI * radius;
  const dashOffset = arcLength * (1 - percent);

  // Determine color based on threshold crossed
  const colorClass = useMemo(() => {
    if (!thresholdCrossed) return "text-[var(--brand-teal)] dark:text-[var(--brand-teal)] text-primary"; // fallback just in case
    return thresholdSemantic === "danger" ? "text-destructive" : "text-success";
  }, [thresholdCrossed, thresholdSemantic]);

  // Calculate threshold tick coordinates
  const thresholdTick = useMemo(() => {
    if (threshold === undefined) return null;
    const tPercent = Math.min(Math.max(threshold, 0), max) / max;
    // Angle from left (PI) to right (0)
    const angle = Math.PI - (tPercent * Math.PI);

    // Inner and outer points for the tick mark
    const innerR = radius - strokeWidth / 2 - 4;
    const outerR = radius + strokeWidth / 2 + 4;

    const x1 = cx + innerR * Math.cos(angle);
    const y1 = cy - innerR * Math.sin(angle);
    const x2 = cx + outerR * Math.cos(angle);
    const y2 = cy - outerR * Math.sin(angle);

    return { x1, y1, x2, y2 };
  }, [threshold, max, radius, cx, cy, strokeWidth]);

  const displayValue = valueFormatter ? valueFormatter(value) : value.toLocaleString();

  return (
    <div className={cn("flex flex-col items-center justify-center w-full font-sans select-none", className)}>
      <div className="relative w-full max-w-[200px] aspect-[2/1]">
        <svg viewBox="0 0 200 110" className="w-full h-full overflow-visible">
          {/* Background Arc */}
          <path
            d={pathData}
            fill="none"
            stroke="var(--background-secondary)"
            strokeWidth={strokeWidth}
            strokeLinecap="butt"
          />

          {/* Foreground Arc */}
          <path
            d={pathData}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="butt"
            strokeDasharray={arcLength}
            strokeDashoffset={dashOffset}
            className={cn("transition-all duration-700 ease-out", colorClass)}
          />

          {/* Threshold Tick */}
          {thresholdTick && (
            <line
              x1={thresholdTick.x1}
              y1={thresholdTick.y1}
              x2={thresholdTick.x2}
              y2={thresholdTick.y2}
              stroke="var(--foreground)"
              strokeWidth={3}
              strokeLinecap="round"
              className="opacity-70"
            />
          )}
        </svg>

        {/* Center Value */}
        <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center translate-y-2">
          <span className="text-3xl font-bold tracking-tight text-foreground">{displayValue}</span>
          {label && (
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mt-1">{label}</span>
          )}
        </div>
      </div>
    </div>
  );
}
