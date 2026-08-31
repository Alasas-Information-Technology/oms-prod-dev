import {
  CircleAlert,
  Clock3,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/components/ui/utils";

import { HrReviewSlaState } from "./hr-review.types";

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
        "rounded-md px-2 py-1 text-[11px] font-medium",

        state === "within-target" &&
          "border-emerald-200 bg-emerald-50 text-emerald-700",

        state === "due-soon" &&
          "border-amber-200 bg-amber-50 text-amber-700",

        state === "overdue" &&
          "border-red-200 bg-red-50 text-red-700",

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