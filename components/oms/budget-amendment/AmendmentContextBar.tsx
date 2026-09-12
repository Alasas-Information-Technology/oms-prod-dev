"use client";

import * as React from "react";
import Link from "next/link";
import { format, isValid } from "date-fns";
import { Clock, AlertTriangle, ExternalLink, ArrowRight } from "lucide-react";
import {
  AmendmentDeadline,
  AmendmentTriggeredBy,
} from "@/src/types/budget-amendment";
import { cn } from "@/lib/utils";

interface AmendmentContextBarProps {
  requestId: string;
  candidateRef: string;
  position: string;
  triggeredBy: AmendmentTriggeredBy;
  deadline: AmendmentDeadline;
  className?: string;
}

/**
 * Context Bar beneath the progress rail per BUDGET-AMENDMENT-UI.md 1.6, 1.9, Part 2 & 3.7.
 *
 * TASK 3: Lineage line:
 *  "Triggered by qualifying candidate C-009 for Senior Cybersecurity Analyst on 12 Aug 2026"
 *  linking back to the interview evaluation.
 *
 * TASK 4: Deadline severity escalation:
 *  - Neutral (> 7 days): "24 days left on the original request"
 *  - Amber (3-7 days): "X days left on the original request · Request and candidate will close automatically"
 *  - Red (< 3 days): "X days left on the original request · Request and candidate will close automatically"
 */
export function AmendmentContextBar({
  requestId,
  candidateRef,
  position,
  triggeredBy,
  deadline,
  className,
}: AmendmentContextBarProps) {
  // Format triggered date (e.g. 12 Aug 2026)
  const formattedDate = React.useMemo(() => {
    if (!triggeredBy?.at) return "12 Aug 2026";
    const dateObj = new Date(triggeredBy.at);
    if (!isValid(dateObj)) return "12 Aug 2026";
    return format(dateObj, "d MMM yyyy");
  }, [triggeredBy?.at]);

  // Target evaluation URL
  const evaluationUrl = `/app/candidates/interviews/evaluate/${encodeURIComponent(
    requestId
  )}/${encodeURIComponent(candidateRef)}`;

  // Deadline element with severity escalation
  const deadlineElement = React.useMemo(() => {
    const days = deadline.daysRemaining;
    const isSingleDay = days === 1;

    switch (deadline.severity) {
      case "CRITICAL":
        return (
          <span className="inline-flex items-center gap-1.5 font-semibold text-destructive">
            <AlertTriangle
              className="size-3.5 shrink-0 text-destructive animate-pulse"
              aria-hidden="true"
            />
            <span>
              {`${days} ${isSingleDay ? "day" : "days"} left on the original request · Request and candidate will close automatically`}
            </span>
          </span>
        );

      case "WARNING":
        return (
          <span className="inline-flex items-center gap-1.5 font-medium text-amber-800 dark:text-amber-300">
            <AlertTriangle
              className="size-3.5 shrink-0 text-amber-600 dark:text-amber-400"
              aria-hidden="true"
            />
            <span>
              {`${days} ${isSingleDay ? "day" : "days"} left on the original request · Request and candidate will close automatically`}
            </span>
          </span>
        );

      case "NORMAL":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 text-muted-foreground">
            <Clock
              className="size-3.5 shrink-0 text-muted-foreground/80"
              aria-hidden="true"
            />
            <span>
              {`${days} ${isSingleDay ? "day" : "days"} left on the original request`}
            </span>
          </span>
        );
    }
  }, [deadline]);

  return (
    <div
      className={cn(
        "w-full px-4 sm:px-6 py-2 bg-muted/20 border-b border-border text-[13px] text-muted-foreground transition-colors",
        deadline.severity === "CRITICAL" && "bg-destructive/5 border-destructive/20",
        deadline.severity === "WARNING" && "bg-amber-500/5 border-amber-500/20",
        className
      )}
    >
      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
        {/* TASK 3: Lineage Line */}
        <div className="flex items-center gap-1 flex-wrap">
          <span>Triggered by qualifying candidate</span>
          <Link
            href={evaluationUrl}
            className="inline-flex items-center gap-0.5 font-semibold text-primary hover:underline focus:outline-hidden focus-visible:ring-1 focus-visible:ring-primary rounded-xs"
            title={`View interview evaluation for candidate ${candidateRef}`}
          >
            <span>{candidateRef}</span>
            <ExternalLink className="size-3 shrink-0 ml-0.5 opacity-80" aria-hidden="true" />
          </Link>
          <span>for</span>
          <span className="font-medium text-foreground">{position}</span>
          <span>on</span>
          <span className="text-foreground/90 font-medium">{formattedDate}</span>
        </div>

        {/* Separator Bullet */}
        <span className="text-muted-foreground/40 hidden sm:inline" aria-hidden="true">
          ·
        </span>

        {/* TASK 4: Deadline */}
        <div className="flex items-center">{deadlineElement}</div>
      </div>
    </div>
  );
}
