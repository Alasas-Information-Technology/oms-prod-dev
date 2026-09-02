import React from "react";
import { cn } from "@/lib/utils";

export interface ChartTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  date?: string;
  valueFormatter?: (value: any, name?: string) => string;
  className?: string;
}

/**
 * Custom Chart Tooltip per T7:
 * Dark surface, 8px radius, 10px x 12px padding, 2px x 12px color bars,
 * values first in tabular-nums, date last separated by 8px.
 */
export function ChartTooltip({
  active,
  payload,
  label,
  date,
  valueFormatter,
  className,
}: ChartTooltipProps) {
  if (!active || !payload || !payload.length) return null;

  const dateOrLabel = date || label;

  return (
    <div
      className={cn(
        "rounded-[8px] bg-popover/95 border border-border/70 p-[10px_12px] shadow-[0_4px_16px_rgba(0,0,0,0.16)] backdrop-blur-md min-w-[120px] select-none",
        className
      )}
    >
      {/* 1. Series Values First */}
      <div className="flex flex-col gap-1.5">
        {payload.map((item, idx) => {
          const color = item.color || item.fill || item.stroke || "var(--primary)";
          const formatted = valueFormatter
            ? valueFormatter(item.value, item.name)
            : typeof item.value === "number"
            ? item.value.toLocaleString()
            : item.value;

          return (
            <div key={idx} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span
                  style={{ backgroundColor: color }}
                  className="w-[2px] h-[12px] rounded-[1px] shrink-0 inline-block"
                />
                <span className="text-[12px] font-medium text-muted-foreground truncate max-w-[120px]">
                  {item.name}
                </span>
              </div>
              <span className="text-[13px] font-semibold text-foreground font-mono tabular-nums leading-none">
                {formatted}
              </span>
            </div>
          );
        })}
      </div>

      {/* 2. Date / Label Last (Separated by 8px) */}
      {dateOrLabel && (
        <div className="mt-2 pt-1.5 border-t border-border/40 text-[11px] font-medium text-muted-foreground/80 font-mono">
          {dateOrLabel}
        </div>
      )}
    </div>
  );
}
