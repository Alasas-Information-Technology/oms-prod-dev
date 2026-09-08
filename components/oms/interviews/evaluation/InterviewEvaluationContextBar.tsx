"use client";

import * as React from "react";
import { format, isValid } from "date-fns";
import { Calendar, Video, MapPin, Clock, AlertCircle, AlertTriangle } from "lucide-react";
import {
  InterviewDetails,
  EvaluationDeadline,
} from "@/src/types/interview-evaluation";
import { cn } from "@/lib/utils";

interface InterviewEvaluationContextBarProps {
  interview: InterviewDetails;
  deadline: EvaluationDeadline;
  className?: string;
}

/**
 * Context Bar (TASK 3 & TASK 4)
 * One row beneath the progress rail:
 *  - Interview completed date and time (13px, muted, 16px icon)
 *  - Method (Online / Physical)
 *  - Deadline state per Part 4 (Normal: neutral, Warning/Critical: amber, Overdue: red text)
 */
export function InterviewEvaluationContextBar({
  interview,
  deadline,
  className,
}: InterviewEvaluationContextBarProps) {
  // Format completion or scheduled date
  const completedDateStr = React.useMemo(() => {
    const rawDate = interview.confirmedAt || interview.scheduledFor;
    if (!rawDate) return "Interview completed 12 Aug 2026, 11:45";
    const dateObj = new Date(rawDate);
    if (!isValid(dateObj)) return "Interview completed 12 Aug 2026, 11:45";

    if (interview.occurred) {
      return `Interview completed ${format(dateObj, "d MMM yyyy, HH:mm")}`;
    }
    return `Scheduled for ${format(dateObj, "d MMM yyyy, HH:mm")}`;
  }, [interview.confirmedAt, interview.scheduledFor, interview.occurred]);

  // Format deadline state
  const deadlineElement = React.useMemo(() => {
    const dueDate = new Date(deadline.dueAt);
    const dueDateStr = isValid(dueDate) ? format(dueDate, "d MMM yyyy") : "12 Aug 2026";

    switch (deadline.severity) {
      case "OVERDUE":
        return (
          <span className="flex items-center gap-1.5 font-semibold text-destructive">
            <AlertTriangle className="size-4 shrink-0 text-destructive" aria-hidden="true" />
            <span>
              Overdue by {Math.abs(deadline.daysRemaining)}{" "}
              {Math.abs(deadline.daysRemaining) === 1 ? "day" : "days"} ({dueDateStr})
            </span>
          </span>
        );
      case "CRITICAL":
        return (
          <span className="flex items-center gap-1.5 font-semibold text-amber-700 dark:text-amber-300">
            <AlertCircle className="size-4 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden="true" />
            <span>{`Due tomorrow (${dueDateStr})`}</span>
          </span>
        );
      case "WARNING":
        return (
          <span className="flex items-center gap-1.5 font-semibold text-amber-700 dark:text-amber-300">
            <Clock className="size-4 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden="true" />
            <span>{`Due today (${dueDateStr})`}</span>
          </span>
        );
      case "NORMAL":
      default:
        return (
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="size-4 shrink-0 text-muted-foreground/80" aria-hidden="true" />
            <span>{`Due in ${deadline.daysRemaining} ${
              deadline.daysRemaining === 1 ? "day" : "days"
            } (${dueDateStr})`}</span>
          </span>
        );
    }
  }, [deadline]);

  return (
    <div
      className={cn(
        "w-full px-6 py-2 bg-muted/20 border-b border-border text-[13px] text-muted-foreground transition-colors",
        className
      )}
    >
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        {/* Interview completion date & time */}
        <div className="flex items-center gap-1.5">
          <Calendar className="size-4 shrink-0 text-muted-foreground/80" aria-hidden="true" />
          <span>{completedDateStr}</span>
        </div>

        <span className="text-muted-foreground/40 hidden sm:inline" aria-hidden="true">
          ·
        </span>

        {/* Method */}
        <div className="flex items-center gap-1.5 capitalize">
          {interview.method === "ONLINE" ? (
            <Video className="size-4 shrink-0 text-muted-foreground/80" aria-hidden="true" />
          ) : (
            <MapPin className="size-4 shrink-0 text-muted-foreground/80" aria-hidden="true" />
          )}
          <span>{interview.method.toLowerCase()}</span>
        </div>

        <span className="text-muted-foreground/40 hidden sm:inline" aria-hidden="true">
          ·
        </span>

        {/* Deadline */}
        <div>{deadlineElement}</div>
      </div>
    </div>
  );
}
