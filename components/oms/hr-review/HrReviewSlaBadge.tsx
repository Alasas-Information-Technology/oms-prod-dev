import {
  CircleAlert,
  Clock3,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/components/ui/utils";

import { HrReviewSlaState } from "@/types/hr-review";

interface HrReviewSlaBadgeProps {
  state: HrReviewSlaState;
  ageDays: number;
  targetDays: number;
  className?: string;
}

export function HrReviewSlaBadge({
  state,
  ageDays,
  targetDays,
  className,
}: HrReviewSlaBadgeProps) {
  const overdueDays = Math.max(
    1,
    ageDays - targetDays
  );

  const label =
    state === "overdue"
      ? `${overdueDays}d overdue`
      : state === "due-soon"
        ? `Due today · ${ageDays}d`
        : `${ageDays} ${
            ageDays === 1
              ? "day"
              : "days"
          }`;

  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-md px-2 py-1 text-[11px] font-medium tabular-nums",

        state === "within-target" &&
          "border-success/30 bg-success-light text-success",

        state === "due-soon" &&
          "border-warning/30 bg-warning-light text-warning",

        state === "overdue" &&
          "border-destructive/30 bg-destructive-light text-destructive",

        className
      )}
    >
      {state === "overdue" ? (
        <CircleAlert className="size-3.5" />
      ) : (
        <Clock3 className="size-3.5" />
      )}

      {label}
    </Badge>
  );
}