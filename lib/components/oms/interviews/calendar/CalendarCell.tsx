"use client";

import * as React from "react";
import { Interviewer } from "@/src/types/interview-planning";
import { cn } from "@/components/ui/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CalendarCellProps {
  minutesFrom8am: number;
  isOutsideWorkingHours: boolean;
  busyInterviewers: Interviewer[];
  isConnected: boolean;
  isPastWeek: boolean;
  isFocused?: boolean;
  onClick?: () => void;
  onMouseDown?: (e: React.MouseEvent) => void;
  onMouseEnter?: () => void;
}

export const CalendarCell = React.memo(function CalendarCell({
  minutesFrom8am,
  isOutsideWorkingHours,
  busyInterviewers,
  isConnected,
  isPastWeek,
  isFocused = false,
  onClick,
  onMouseDown,
  onMouseEnter,
}: CalendarCellProps) {
  const busyCount = busyInterviewers.length;

  // Compute time string for accessibility and tooltips (e.g. 09:30)
  const hour = 8 + Math.floor(minutesFrom8am / 60);
  const min = minutesFrom8am % 60;
  const timeLabel = `${String(hour).padStart(2, "0")}:${String(min).padStart(2, "0")} GST`;

  // Render tooltip text
  const tooltipText = React.useMemo(() => {
    if (!isConnected) {
      return "Calendar disconnected — check availability with interviewers";
    }
    if (isOutsideWorkingHours) {
      return `Outside working hours (${timeLabel})`;
    }
    if (busyCount === 0) {
      return `All interviewers available (${timeLabel})`;
    }
    const names = busyInterviewers.map((i) => i.name).join(", ");
    return `${busyCount} ${busyCount === 1 ? "interviewer" : "interviewers"} busy: ${names}`;
  }, [isConnected, isOutsideWorkingHours, busyCount, busyInterviewers, timeLabel]);

  // Determine shading pattern
  const renderShading = () => {
    if (!isConnected) {
      return null;
    }
    if (isOutsideWorkingHours) {
      return null; // Will use solid muted background
    }
    if (busyCount === 1) {
      return (
        <svg className="absolute inset-0 size-full pointer-events-none" aria-hidden="true">
          <rect width="100%" height="100%" fill="url(#hatch-one-busy)" />
        </svg>
      );
    }
    if (busyCount >= 2) {
      return (
        <svg className="absolute inset-0 size-full pointer-events-none" aria-hidden="true">
          <rect width="100%" height="100%" fill="url(#hatch-two-busy)" />
        </svg>
      );
    }
    return null;
  };

  const isClickable = !isPastWeek;

  return (
    <TooltipProvider delayDuration={250}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            role="gridcell"
            tabIndex={-1}
            data-minutes={minutesFrom8am}
            onMouseDown={isClickable ? onMouseDown : undefined}
            onMouseEnter={isClickable ? onMouseEnter : undefined}
            onClick={isClickable ? onClick : undefined}
            className={cn(
              "relative h-7 border-b border-border/40 select-none transition-colors",
              // Shading states
              !isConnected
                ? "bg-muted/15"
                : isOutsideWorkingHours
                ? "bg-muted/50 dark:bg-muted/30"
                : busyCount === 0
                ? "bg-card hover:bg-primary/5"
                : "bg-card",
              isClickable ? "cursor-pointer" : "cursor-default",
              isFocused && "ring-2 ring-primary ring-inset z-10"
            )}
          >
            {renderShading()}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs max-w-xs z-50">
          <p className="font-semibold">{timeLabel}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">{tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
});
