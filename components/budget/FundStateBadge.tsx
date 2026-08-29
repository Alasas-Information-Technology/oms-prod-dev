import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { FundState } from "@/lib/types/budget.types";

export interface FundStateBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  state: FundState | string;
  size?: "sm" | "default" | "lg";
  showDot?: boolean;
  labelOverride?: string;
}

export const FUND_STATE_CONFIG: Record<
  FundState,
  {
    label: string;
    dotColor: string;
    badgeClass: string;
    barColor: string;
    textColor: string;
  }
> = {
  AVAILABLE: {
    label: "Available",
    dotColor: "bg-emerald-500",
    badgeClass:
      "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
    barColor: "bg-emerald-500 dark:bg-emerald-500",
    textColor: "text-emerald-700 dark:text-emerald-400",
  },
  RESERVED: {
    label: "Reserved",
    dotColor: "bg-amber-500",
    badgeClass:
      "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30",
    barColor: "bg-amber-500 dark:bg-amber-500",
    textColor: "text-amber-700 dark:text-amber-400",
  },
  LOCKED: {
    label: "Locked & Allocated",
    dotColor: "bg-indigo-500",
    badgeClass:
      "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/30",
    barColor: "bg-indigo-500 dark:bg-indigo-500",
    textColor: "text-indigo-700 dark:text-indigo-400",
  },
  CONSUMED: {
    label: "Consumed",
    dotColor: "bg-zinc-500",
    badgeClass:
      "bg-zinc-500/10 text-zinc-700 dark:text-zinc-300 border-zinc-500/30",
    barColor: "bg-zinc-500 dark:bg-zinc-400",
    textColor: "text-zinc-700 dark:text-zinc-400",
  },
};

export function FundStateBadge({
  state,
  size = "default",
  showDot = true,
  labelOverride,
  className,
  ...props
}: FundStateBadgeProps) {
  const normalizedKey = (
    state.toUpperCase().includes("RESERV")
      ? "RESERVED"
      : state.toUpperCase().includes("LOCK")
      ? "LOCKED"
      : state.toUpperCase().includes("CONSUM")
      ? "CONSUMED"
      : "AVAILABLE"
  ) as FundState;

  const config = FUND_STATE_CONFIG[normalizedKey] || FUND_STATE_CONFIG.AVAILABLE;
  const label = labelOverride || config.label;

  return (
    <Badge
      variant="outline"
      className={cn(
        "font-medium inline-flex items-center gap-1.5 transition-colors shadow-2xs",
        config.badgeClass,
        size === "sm" && "text-[10px] px-1.5 py-0.5",
        size === "default" && "text-xs px-2.5 py-0.5",
        size === "lg" && "text-sm px-3 py-1",
        className
      )}
      {...props}
    >
      {showDot && (
        <span
          className={cn(
            "rounded-full shrink-0",
            config.dotColor,
            size === "sm" ? "size-1.5" : "size-2"
          )}
          aria-hidden="true"
        />
      )}
      <span>{label}</span>
    </Badge>
  );
}
