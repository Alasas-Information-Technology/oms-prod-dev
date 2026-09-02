"use client";

import React, { useId, useMemo } from "react";
import { cn } from "@/lib/utils";

export interface SparklineProps {
  data: number[] | Array<{ value: number; [key: string]: any }>;
  dataKey?: string;
  accessibilitySummary?: string;
  color?: string; // e.g. "var(--primary)"
  className?: string;
  height?: number;
}

/**
 * 28px Sparkline per DASHBOARD-VISUAL-DEPTH.md & DASHBOARD-KPI-CARDS-AMENDMENT.md:
 * - 28px height at the bottom of each KPI card
 * - 30 daily values
 * - No axes, no gridlines, no dots except a 3px dot on the final point
 * - Line at 1.5px in the accent / primary
 * - Fill below at 12% using diagonal hatch pattern
 */
export function Sparkline({
  data,
  dataKey,
  accessibilitySummary = "30-day trend sparkline",
  color = "var(--primary)",
  className,
  height = 28,
}: SparklineProps) {
  const generatedId = useId().replace(/:/g, "");
  const hatchId = `spark-hatch-${generatedId}`;

  // Extract raw numeric values (normalize to array of 30 numbers)
  const values = useMemo(() => {
    if (!data || data.length === 0) return [];
    return data.map((item) => {
      if (typeof item === "number") return item;
      if (dataKey && item && typeof item === "object" && typeof item[dataKey] === "number") {
        return item[dataKey];
      }
      if (item && typeof item === "object" && "value" in item && typeof item.value === "number") {
        return item.value;
      }
      return 0;
    });
  }, [data, dataKey]);

  // Compute SVG coordinates
  const { linePath, areaPath, lastPoint } = useMemo(() => {
    if (values.length === 0) {
      return { linePath: "", areaPath: "", lastPoint: null };
    }

    const width = 200;
    const viewHeight = height;
    const padding = 3;
    const drawHeight = viewHeight - padding * 2;

    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;

    const points = values.map((val, idx) => {
      const x = (idx / (values.length - 1)) * width;
      const y = viewHeight - padding - ((val - min) / range) * drawHeight;
      return { x, y };
    });

    const linePointsStr = points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" L ");
    const linePath = `M ${linePointsStr}`;
    const areaPath = `M ${linePointsStr} L ${width},${viewHeight} L 0,${viewHeight} Z`;
    const lastPoint = points[points.length - 1];

    return { linePath, areaPath, lastPoint };
  }, [values, height]);

  if (values.length === 0) return null;

  return (
    <div
      className={cn("w-full relative select-none overflow-hidden", className)}
      style={{ height: `${height}px` }}
      role="img"
      aria-label={accessibilitySummary}
    >
      <span className="sr-only">{accessibilitySummary}</span>
      <svg
        viewBox={`0 0 200 ${height}`}
        preserveAspectRatio="none"
        className="w-full h-full block overflow-visible"
      >
        <defs>
          <pattern
            id={hatchId}
            width="6"
            height="6"
            patternTransform="rotate(45 0 0)"
            patternUnits="userSpaceOnUse"
          >
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="6"
              stroke={color}
              strokeWidth="1"
              strokeOpacity="0.12"
            />
          </pattern>
        </defs>

        {/* 12% Hatch Pattern Area Fill Below Line */}
        <path d={areaPath} fill={`url(#${hatchId})`} />

        {/* 1.5px Accent Line (linear segments, never curved/monotone) */}
        <path
          d={linePath}
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* 3px Terminal Dot on Final Point */}
        {lastPoint && (
          <circle
            cx={lastPoint.x}
            cy={lastPoint.y}
            r="3"
            fill={color}
            stroke="var(--card)"
            strokeWidth="0.5"
          />
        )}
      </svg>
    </div>
  );
}
