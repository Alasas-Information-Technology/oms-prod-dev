import React from "react";
import { cn } from "@/lib/utils";

export interface SegmentedBarProps {
  /** Current value */
  value: number;
  /** Max value (default 100) */
  max?: number;
  /** Color for filled ticks (defaults to primary) */
  color?: string;
  /** Whether to show percentage in parentheses to the left (default true) */
  showPercent?: boolean;
  className?: string;
}

/**
 * Segmented Progress Bar per T5:
 * 20 discrete ticks (2.5px x 13px, 1.5px radius, 2px gap).
 * Left-aligned percentage label in parentheses.
 */
export function SegmentedBar({
  value,
  max = 100,
  color,
  showPercent = true,
  className,
}: SegmentedBarProps) {
  const TOTAL_TICKS = 20;
  const ratio = max > 0 ? Math.min(Math.max(value / max, 0), 1) : 0;
  const filledCount = Math.round(ratio * TOTAL_TICKS);
  const percentage = Math.round(ratio * 100);

  const filledColor = color || "var(--primary)";

  return (
    <div
      className={cn("inline-flex items-center select-none", className)}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={`${percentage}% complete`}
    >
      {showPercent && (
        <span className="text-xs font-mono font-semibold text-muted-foreground mr-2 tabular-nums">
          ({percentage}%)
        </span>
      )}

      <div className="flex items-center gap-[2px]">
        {Array.from({ length: TOTAL_TICKS }).map((_, index) => {
          const isFilled = index < filledCount;
          return (
            <span
              key={index}
              style={{
                backgroundColor: isFilled ? filledColor : undefined,
              }}
              className={cn(
                "w-[2.5px] h-[13px] rounded-[1.5px] transition-colors duration-150 shrink-0",
                !isFilled && "bg-muted-foreground/15 dark:bg-slate-800"
              )}
            />
          );
        })}
      </div>
    </div>
  );
}
