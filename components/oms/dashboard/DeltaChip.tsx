import React from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
    <Badge
      tone={isGood ? "success" : "danger"}
      className={cn(
        "gap-0.5 px-1.5 py-0.5 text-xs tabular-nums leading-none",
        className
      )}
    >
      <Icon className="size-3 stroke-[2.5]" aria-hidden="true" />
      <span>{value}%</span>
    </Badge>
  );
}
