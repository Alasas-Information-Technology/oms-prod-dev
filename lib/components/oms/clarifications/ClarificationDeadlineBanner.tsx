"use client";

import * as React from "react";
import { format } from "date-fns";
import { AlertTriangle, Clock, AlertCircle } from "lucide-react";
import { ClarificationDeadline } from "@/types/clarification";
import { cn } from "@/lib/utils";

interface ClarificationDeadlineBannerProps {
  deadline: ClarificationDeadline;
  className?: string;
}

/**
 * Renders the top-level critical/overdue deadline escalation banner per Part 1.6:
 * - Under 3 days: Red banner stating consequence:
 *   "This request closes in 2 days. If you do not respond, it will be closed automatically and the reserved funds released."
 * - Overdue: Red banner in past tense
 */
export function ClarificationDeadlineBanner({
  deadline,
  className,
}: ClarificationDeadlineBannerProps) {
  const { severity, daysRemaining, closesAt } = deadline;

  // Only render the full top banner for CRITICAL (< 3 days) or OVERDUE states
  if (severity !== "CRITICAL" && severity !== "OVERDUE" && daysRemaining > 2) {
    return null;
  }

  const isOverdue = severity === "OVERDUE" || daysRemaining <= 0;
  const formattedDate = closesAt ? format(new Date(closesAt), "d MMM") : "";

  return (
    <div
      role="alert"
      className={cn(
        "rounded-xl border px-4 py-3.5 flex items-start sm:items-center gap-3 shadow-xs animate-in fade-in-50 duration-300",
        "bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-300",
        className
      )}
    >
      <AlertCircle className="size-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5 sm:mt-0" />
      <div className="flex-1 text-xs sm:text-sm font-medium leading-relaxed">
        {isOverdue ? (
          <span>
            <strong>Request overdue:</strong> This request reached its deadline on{" "}
            {formattedDate || "the scheduled date"} and is subject to automatic closure and fund release.
          </span>
        ) : (
          <span>
            <strong>Urgent action required:</strong> This request closes in{" "}
            <strong>{daysRemaining} day{daysRemaining === 1 ? "" : "s"}</strong> ({formattedDate}). If you do not
            respond, it will be closed automatically and the reserved funds released.
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * Sub-header badge for 4-tier deadline status:
 * - Over 7 days: Neutral "28 days left · closes 30 Sep"
 * - 3-7 days: Amber "5 days left · closes 6 Sep"
 * - Under 3 days: Red "2 days left · closes 27 Aug"
 * - Overdue: Red "Overdue"
 */
export function ClarificationDeadlineBadge({
  deadline,
  className,
}: {
  deadline: ClarificationDeadline;
  className?: string;
}) {
  const { severity, daysRemaining, closesAt } = deadline;
  const formattedDate = closesAt ? format(new Date(closesAt), "d MMM") : "";

  let badgeVariant = "bg-muted/60 text-muted-foreground border-border/60";
  let icon = <Clock className="size-3.5" />;

  if (severity === "OVERDUE" || daysRemaining <= 0) {
    badgeVariant = "bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/30 font-semibold";
    icon = <AlertCircle className="size-3.5 text-red-600 dark:text-red-400" />;
  } else if (severity === "CRITICAL" || daysRemaining <= 2) {
    badgeVariant = "bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/30 font-semibold";
    icon = <AlertTriangle className="size-3.5 text-red-600 dark:text-red-400" />;
  } else if (severity === "WARNING" || (daysRemaining >= 3 && daysRemaining <= 7)) {
    badgeVariant = "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30 font-medium";
    icon = <AlertTriangle className="size-3.5 text-amber-600 dark:text-amber-400" />;
  }

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-xs border tracking-tight shrink-0",
        badgeVariant,
        className
      )}
    >
      {icon}
      <span>
        {severity === "OVERDUE" || daysRemaining <= 0
          ? `Overdue · closed ${formattedDate}`
          : `${daysRemaining} day${daysRemaining === 1 ? "" : "s"} left · closes ${formattedDate}`}
      </span>
    </div>
  );
}
