"use client";

import React, { useId, useState, useMemo } from "react";
import { HatchPatternDefs } from "../HatchPattern";
import { ChartTooltip } from "../ChartTooltip";
import { cn } from "@/lib/utils";

export interface KpiBarDataPoint {
  value: number;
  label?: string;
  date?: string;
  delta?: number;
}

export interface KpiBarBehindNumberProps {
  /** Array of values or data points across recent periods (e.g. 7 or 30 days) */
  data: number[] | KpiBarDataPoint[];
  /** Bar accent color (default: "var(--accent-interactive, var(--primary))") */
  color?: string;
  /** Height of the SVG visualization in px (default: 44) */
  height?: number;
  /** Optional value formatter */
  valueFormatter?: (value: number) => string;
  /** Accessible summary */
  accessibilitySummary?: string;
  className?: string;
}

/**
 * U2 / J2 — KpiBarBehindNumber Primitive
 *
 * Requirements:
 * - Bars spanning the card's full width, positioned behind the value.
 * - One bar per recent period (7 or 30 days).
 * - T4 HatchPattern for all bars EXCEPT the current period, which renders solid in accent color.
 * - Hover on any bar reveals a T7 ChartTooltip with that period's exact value and delta versus previous period.
 */
export function KpiBarBehindNumber({
  data,
  color = "var(--accent-interactive, var(--primary))",
  height = 44,
  valueFormatter,
  accessibilitySummary = "Recent period trend bars",
  className,
}: KpiBarBehindNumberProps) {
  const generatedId = useId().replace(/:/g, "");
  const hatchId = `kpi-bar-hatch-${generatedId}`;

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  // Normalize data points
  const items: KpiBarDataPoint[] = useMemo(() => {
    if (!data || data.length === 0) return [];
    return data.map((item, idx) => {
      if (typeof item === "number") {
        const prev = idx > 0 ? (typeof data[idx - 1] === "number" ? (data[idx - 1] as number) : 0) : item;
        return {
          value: item,
          label: `Period ${idx + 1}`,
          delta: item - prev,
        };
      }
      return item;
    });
  }, [data]);

  const maxVal = useMemo(() => {
    if (items.length === 0) return 1;
    const max = Math.max(...items.map((i) => i.value));
    return max > 0 ? max : 1;
  }, [items]);

  if (items.length === 0) return null;

  const N = items.length;
  // SVG coordinates: 200px width coordinate system
  const svgWidth = 200;
  const gap = N > 14 ? 1.5 : 3;
  const totalGaps = (N - 1) * gap;
  const barWidth = Math.max(1.5, (svgWidth - totalGaps) / N);

  const hoveredItem = hoveredIndex !== null ? items[hoveredIndex] : null;

  return (
    <div
      className={cn("relative w-full select-none overflow-visible", className)}
      style={{ height }}
      onMouseLeave={() => {
        setHoveredIndex(null);
        setTooltipPos(null);
      }}
    >
      <span className="sr-only">{accessibilitySummary}</span>

      <svg
        viewBox={`0 0 ${svgWidth} ${height}`}
        preserveAspectRatio="none"
        className="w-full h-full overflow-visible"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`grad-kpi-${generatedId}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={1} />
            <stop offset="100%" stopColor={color} stopOpacity={0.85} />
          </linearGradient>
          <HatchPatternDefs
            id={hatchId}
            color={color}
            strokeWidth={1.2}
            opacity={0.38}
          />
        </defs>

        {items.map((item, i) => {
          const isCurrent = i === N - 1;
          const isHovered = hoveredIndex === i;
          const barH = Math.max(3, (item.value / maxVal) * (height - 4));
          const x = i * (barWidth + gap);
          const y = height - barH;

          return (
            <rect
              key={i}
              x={x}
              y={y}
              width={barWidth}
              height={barH}
              rx={Math.min(1.5, barWidth / 2)}
              fill={isCurrent ? `url(#grad-kpi-${generatedId})` : `url(#${hatchId})`}
              stroke={color}
              strokeWidth={isCurrent ? 1 : 0.75}
              strokeOpacity={isHovered ? 1 : isCurrent ? 0.9 : 0.35}
              className={cn(
                "transition-all duration-150 cursor-pointer",
                isHovered && "opacity-100"
              )}
              onMouseEnter={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const parentRect = e.currentTarget.parentElement?.getBoundingClientRect();
                if (parentRect) {
                  setTooltipPos({
                    x: rect.left + rect.width / 2 - parentRect.left,
                    y: rect.top - parentRect.top,
                  });
                }
                setHoveredIndex(i);
              }}
            />
          );
        })}
      </svg>

      {/* Floating T7 ChartTooltip on bar hover */}
      {hoveredItem !== null && tooltipPos !== null && (
        <div
          className="absolute pointer-events-none z-50 transform -translate-x-1/2 -translate-y-full mb-1 transition-transform"
          style={{
            left: tooltipPos.x,
            top: tooltipPos.y,
          }}
        >
          <ChartTooltip
            active={true}
            label={hoveredItem.label || (hoveredItem.date ? hoveredItem.date : `Day ${hoveredIndex! + 1}`)}
            payload={[
              {
                name: "Value",
                value: valueFormatter ? valueFormatter(hoveredItem.value) : hoveredItem.value,
                color,
              },
              ...(hoveredItem.delta !== undefined
                ? [
                    {
                      name: "Delta",
                      value: `${hoveredItem.delta >= 0 ? "+" : ""}${
                        valueFormatter ? valueFormatter(hoveredItem.delta) : hoveredItem.delta
                      }`,
                      color:
                        hoveredItem.delta > 0
                          ? "var(--success-border, #3A8F6B)"
                          : hoveredItem.delta < 0
                          ? "var(--danger-border, #B0432C)"
                          : "var(--muted-foreground)",
                    },
                  ]
                : []),
            ]}
          />
        </div>
      )}
    </div>
  );
}
