"use client";

import React, { useMemo } from "react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export interface HeatmapRow {
  id: string;
  label: string;
  [key: string]: any;
}

export interface HeatmapCol {
  id: string;
  label: string;
  [key: string]: any;
}

export interface HeatmapProps<R extends HeatmapRow, C extends HeatmapCol> {
  rows: R[];
  cols: C[];
  /** Value-per-cell accessor. Should return a number for magnitude, or null/undefined for empty cell. */
  valueAccessor: (row: R, col: C) => number | null | undefined;
  /** Optional function to format the value in the tooltip. Defaults to toLocaleString() */
  valueFormatter?: (value: number) => string;
  /** Optional function to customize the tooltip label. Defaults to `${row.label} - ${col.label}` */
  tooltipLabelAccessor?: (row: R, col: C) => string;
  diverging?: boolean;
  className?: string;
}

export function Heatmap<R extends HeatmapRow, C extends HeatmapCol>({
  rows,
  cols,
  valueAccessor,
  valueFormatter,
  tooltipLabelAccessor,
  diverging = false,
  className,
}: HeatmapProps<R, C>) {
  // Find max absolute value to scale opacities across all valid cells
  const maxValue = useMemo(() => {
    let max = 1; // Default to 1 to avoid division by zero
    for (const r of rows) {
      for (const c of cols) {
        const val = valueAccessor(r, c);
        if (typeof val === "number") {
          const absVal = Math.abs(val);
          if (absVal > max) max = absVal;
        }
      }
    }
    return max;
  }, [rows, cols, valueAccessor]);

  const getCellColor = (value: number) => {
    const opacity = Math.max(0.1, Math.min(1, Math.abs(value) / maxValue));
    
    if (diverging) {
      if (value < 0) {
        return `color-mix(in srgb, var(--destructive) ${opacity * 100}%, transparent)`;
      } else {
        return `color-mix(in srgb, var(--success) ${opacity * 100}%, transparent)`;
      }
    }
    
    // Default single hue
    return `color-mix(in srgb, var(--primary) ${opacity * 100}%, transparent)`;
  };

  return (
    <div className={cn("flex flex-col w-full font-sans select-none overflow-x-auto", className)}>
      <TooltipProvider delayDuration={150}>
        <div className="min-w-max">
          {/* Top Axis (Cols) */}
          <div className="flex">
            {/* Empty top-left corner */}
            <div className="w-24 shrink-0" />
            <div className="flex flex-1">
              {cols.map((col) => (
                <div key={col.id} className="flex-1 flex justify-center items-end pb-2 min-w-[24px]">
                  <span className="text-[10px] font-medium text-muted-foreground truncate transform -rotate-45 origin-bottom-left" title={col.label}>
                    {col.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Grid Rows */}
          <div className="flex flex-col gap-[2px]">
            {rows.map((row) => (
              <div key={row.id} className="flex items-center">
                {/* Y Axis (Row label) */}
                <div className="w-24 shrink-0 pr-2 text-right">
                  <span className="text-xs font-medium text-muted-foreground truncate block" title={row.label}>
                    {row.label}
                  </span>
                </div>

                {/* Row Cells */}
                <div className="flex flex-1 gap-[2px]">
                  {cols.map((col) => {
                    const value = valueAccessor(row, col);
                    const hasData = typeof value === "number";
                    
                    const displayVal = hasData
                      ? (valueFormatter ? valueFormatter(value) : value.toLocaleString())
                      : "";
                    const tooltipLabel = tooltipLabelAccessor
                      ? tooltipLabelAccessor(row, col)
                      : `${row.label} - ${col.label}`;

                    return (
                      <Tooltip key={`${row.id}-${col.id}`}>
                        <TooltipTrigger asChild>
                          <div
                            className="flex-1 aspect-square rounded-[3px] transition-opacity hover:opacity-80 cursor-default min-w-[24px] min-h-[24px]"
                            style={{
                              backgroundColor: hasData ? getCellColor(value) : "var(--background-secondary)",
                              border: !hasData ? "1px solid var(--border)" : undefined
                            }}
                          />
                        </TooltipTrigger>
                        {hasData && (
                          <TooltipContent className="px-3 py-2" sideOffset={4}>
                            <div className="flex flex-col gap-1">
                              <span className="text-xs text-muted-foreground font-medium">{tooltipLabel}</span>
                              <span className="text-sm font-bold tabular-nums text-foreground">{displayVal}</span>
                            </div>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </TooltipProvider>

      {/* Legend */}
      <div className="flex items-center justify-end gap-3 mt-4 text-[11px] font-medium text-muted-foreground">
        {diverging ? (
          <>
            <div className="flex items-center gap-1.5">
              <span>Low (Danger)</span>
              <div className="w-24 h-2 rounded-[2px]" style={{ background: `linear-gradient(to right, color-mix(in srgb, var(--destructive) 10%, transparent), var(--destructive))` }} />
              <span>High</span>
            </div>
            <div className="w-px h-3 bg-border" />
            <div className="flex items-center gap-1.5">
              <span>Low (Success)</span>
              <div className="w-24 h-2 rounded-[2px]" style={{ background: `linear-gradient(to right, color-mix(in srgb, var(--success) 10%, transparent), var(--success))` }} />
              <span>High</span>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-1.5">
            <span>Less</span>
            <div className="w-24 h-2 rounded-[2px]" style={{ background: `linear-gradient(to right, color-mix(in srgb, var(--primary) 10%, transparent), var(--primary))` }} />
            <span>More</span>
          </div>
        )}
      </div>
    </div>
  );
}
