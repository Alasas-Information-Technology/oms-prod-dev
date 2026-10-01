"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface WaffleProps {
  /** Value from 0 to 100 */
  percent: number;
  label?: string;
  valueFormatter?: (percent: number) => string;
  className?: string;
}

export function Waffle({ percent, label, valueFormatter, className }: WaffleProps) {
  // Clamp between 0 and 100 and round to nearest integer for square count
  const filledCount = Math.round(Math.min(Math.max(percent, 0), 100));
  
  const displayValue = valueFormatter ? valueFormatter(percent) : `${percent.toFixed(1)}%`;

  return (
    <div className={cn("flex flex-col items-center w-full font-sans select-none", className)}>
      <div className="flex items-center gap-6">
        {/* Waffle Grid */}
        <div className="grid grid-cols-10 gap-[2px] w-[140px] shrink-0">
          {Array.from({ length: 100 }).map((_, i) => {
            const isFilled = i < filledCount;
            return (
              <div
                key={i}
                className={cn(
                  "aspect-square rounded-[1px] transition-colors duration-300",
                  isFilled ? "bg-primary" : "bg-muted"
                )}
              />
            );
          })}
        </div>

        {/* Legend / Info */}
        <div className="flex flex-col justify-center">
          <span className="text-3xl font-bold tracking-tight text-foreground tabular-nums">
            {displayValue}
          </span>
          {label && (
            <span className="text-[12px] font-medium text-muted-foreground uppercase tracking-wider mt-1">
              {label}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
