"use client";

import * as React from "react";
import { AlertTriangle } from "lucide-react";

import { cn } from "@/lib/utils";

interface InterviewOverdueBannerProps {
  daysOverdue: number;
  message?: string | null;
  className?: string;
}

/**
 * Overdue Escalation Banner (TASK 4)
 * Prominent red banner rendered at the top of the evaluation page when deadline is missed.
 * Blocks the whole requisition and explicitly states who is waiting.
 */
export function InterviewOverdueBanner({
  daysOverdue,
  message,
  className,
}: InterviewOverdueBannerProps) {
  const displayMessage =
    message ||
    `This evaluation is ${Math.abs(daysOverdue)} ${
      Math.abs(daysOverdue) === 1 ? "day" : "days"
    } overdue. Procurement is waiting to begin onboarding.`;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={cn(
        "w-full bg-destructive/10 dark:bg-destructive/20 border-b border-destructive/30 px-6 py-3 text-destructive transition-colors",
        className
      )}
    >
      <div className="flex items-center gap-2.5 max-w-7xl mx-auto">
        <div className="p-1 rounded-full bg-destructive/15 text-destructive shrink-0">
          <AlertTriangle className="size-4 shrink-0" aria-hidden="true" />
        </div>
        <div className="flex-1 text-xs sm:text-sm font-semibold tracking-tight">
          {displayMessage}
        </div>
      </div>
    </div>
  );
}
