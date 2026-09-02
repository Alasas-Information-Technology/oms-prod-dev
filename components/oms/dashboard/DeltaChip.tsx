import React from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DeltaChipProps {
  value: number;
  direction: "up" | "down";
  increaseIsGood: boolean;
  className?: string;
}

export function DeltaChip({ value, direction, increaseIsGood, className }: DeltaChipProps) {
  // Determine if this change represents a positive/good outcome
  const isGood =
    (direction === "up" && increaseIsGood) ||
    (direction === "down" && !increaseIsGood);

  const Icon = direction === "up" ? ArrowUp : ArrowDown;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-semibold tabular-nums leading-none",
        isGood
          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
          : "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400",
        className
      )}
    >
      <Icon className="size-3 stroke-[2.5]" aria-hidden="true" />
      <span>{value}%</span>
    </div>
  );
}
