"use client";

import React, { useState, useMemo } from "react";
import { DataTable, ColumnDef } from "@/components/shared/DataTable";
import { ChartTooltip } from "../ChartTooltip";
import { cn } from "@/lib/utils";

export interface DotMatrixProps {
  data: any[];
  /** Numeric key in data objects */
  valueKey: string;
  /** Period label key in data objects (e.g. "day", "week", "date", "label") */
  periodKey?: string;
  /** Accessible text summary for screen readers */
  accessibilitySummary: string;
  /** Single hue color for dots (default: "var(--accent-interactive, var(--primary))") */
  color?: string;
  /** Maximum number of dots in the highest column (default: 6) */
  maxDotsPerColumn?: number;
  /** Plot area height in px (default: 110) */
  height?: number;
  /** Custom class name */
  className?: string;
  /** Optional value formatter */
  valueFormatter?: (value: number) => string;
  /** Optional click handler on a column */
  onPeriodClick?: (item: any) => void;
}

/**
 * U3 / J2 — DotMatrix Chart Primitive
 *
 * Dedicated strictly to counts of discrete entities (onboarding cases per week,
 * candidates interviewed per week, notifications sent per day).
 *
 * Rules:
 * - One column per period.
 * - Dot count per column proportional to that period's value, rounded to the nearest whole dot.
 * - One hue at 100% opacity.
 * - Consistent gap between dots (4px / gap-1).
 * - No axes, no gridlines, no legend.
 * - Responsive table fallback below 768px (md:hidden).
 */
export function DotMatrix({
  data,
  valueKey,
  periodKey = "label",
  accessibilitySummary,
  color = "var(--accent-interactive, var(--primary))",
  maxDotsPerColumn = 6,
  height = 110,
  className,
  valueFormatter,
  onPeriodClick,
}: DotMatrixProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  const maxVal = useMemo(() => {
    if (!data || data.length === 0) return 1;
    const max = Math.max(...data.map((d) => Number(d[valueKey]) || 0));
    return max > 0 ? max : 1;
  }, [data, valueKey]);

  // Compute column metadata
  const columns = useMemo(() => {
    if (!data || data.length === 0) return [];
    return data.map((item, idx) => {
      const rawVal = Number(item[valueKey]) || 0;
      // Proportional whole dots rounded to nearest integer (never fractional)
      const dotCount = rawVal === 0 ? 0 : Math.max(1, Math.round((rawVal / maxVal) * maxDotsPerColumn));
      const label = item[periodKey] || item.label || item.date || item.day || `P${idx + 1}`;
      return {
        rawVal,
        dotCount,
        label,
        item,
      };
    });
  }, [data, valueKey, periodKey, maxVal, maxDotsPerColumn]);

  // Mobile Table columns definition per standard chart wrappers
  const tableColumns: ColumnDef<any>[] = useMemo(
    () => [
      {
        key: periodKey,
        header: "Period",
        render: (_, row) => (
          <span className="font-medium text-foreground">
            {row[periodKey] || row.label || row.date || row.day || "-"}
          </span>
        ),
      },
      {
        key: valueKey,
        header: "Count",
        render: (val) => {
          const num = Number(val) || 0;
          return (
            <span className="tabular-nums font-semibold text-foreground">
              {valueFormatter ? valueFormatter(num) : num.toLocaleString()}
            </span>
          );
        },
      },
    ],
    [periodKey, valueKey, valueFormatter]
  );

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center py-6 text-xs text-muted-foreground">
        No discrete data available.
      </div>
    );
  }

  const hoveredCol = hoveredIndex !== null ? columns[hoveredIndex] : null;

  return (
    <div className={cn("w-full flex flex-col justify-between select-none relative", className)}>
      <span className="sr-only">{accessibilitySummary}</span>

      {/* Accessible Mobile Table Fallback below 768px */}
      <div className="block md:hidden w-full">
        <DataTable
          data={data}
          columns={tableColumns}
          keyField={periodKey}
          compact
          hidePagination
        />
      </div>

      {/* Desktop Dot Matrix Plot View (>= 768px) */}
      <div
        className="hidden md:flex flex-col justify-end w-full relative"
        style={{ height }}
        onMouseLeave={() => {
          setHoveredIndex(null);
          setTooltipPos(null);
        }}
      >
        {/* Columns Container */}
        <div className="flex items-end justify-around w-full flex-1 px-2 pb-1 gap-2">
          {columns.map((col, colIdx) => {
            const isHovered = hoveredIndex === colIdx;

            return (
              <div
                key={colIdx}
                className={cn(
                  "flex flex-col items-center justify-end flex-1 min-w-[20px] max-w-[48px] h-full cursor-pointer group transition-transform duration-150",
                  isHovered && "scale-105"
                )}
                onClick={() => onPeriodClick && onPeriodClick(col.item)}
                onMouseEnter={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const parentRect = e.currentTarget.parentElement?.parentElement?.getBoundingClientRect();
                  if (parentRect) {
                    setTooltipPos({
                      x: rect.left + rect.width / 2 - parentRect.left,
                      y: rect.top - parentRect.top,
                    });
                  }
                  setHoveredIndex(colIdx);
                }}
              >
                {/* Dots stack from bottom to top (proportional whole dots) */}
                <div className="flex flex-col-reverse items-center gap-1 mb-1.5 w-full">
                  {Array.from({ length: col.dotCount }).map((_, dotIdx) => (
                    <span
                      key={dotIdx}
                      style={{ backgroundColor: color }}
                      className={cn(
                        "w-2.5 h-2.5 rounded-[2px] shrink-0 transition-opacity duration-150",
                        isHovered ? "opacity-100 ring-1 ring-white/30" : "opacity-100"
                      )}
                      aria-hidden="true"
                    />
                  ))}
                  {col.dotCount === 0 && (
                    <span
                      className="w-2.5 h-1 rounded-[1px] bg-muted/40 shrink-0 mb-0.5"
                      aria-hidden="true"
                    />
                  )}
                </div>

                {/* Period Label */}
                <span
                  className={cn(
                    "text-[11px] font-medium tracking-tight truncate w-full text-center transition-colors leading-none",
                    isHovered ? "text-foreground font-semibold" : "text-muted-foreground"
                  )}
                >
                  {col.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Floating T7 Tooltip */}
        {hoveredCol !== null && tooltipPos !== null && (
          <div
            className="absolute pointer-events-none z-50 transform -translate-x-1/2 -translate-y-full mb-1 transition-transform"
            style={{
              left: tooltipPos.x,
              top: tooltipPos.y,
            }}
          >
            <ChartTooltip
              active={true}
              label={hoveredCol.label}
              payload={[
                {
                  name: "Count",
                  value: valueFormatter ? valueFormatter(hoveredCol.rawVal) : hoveredCol.rawVal,
                  color,
                },
              ]}
            />
          </div>
        )}
      </div>
    </div>
  );
}
