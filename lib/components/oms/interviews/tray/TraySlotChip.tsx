"use client";

import * as React from "react";
import { GripVertical, X, Link2, Clock } from "lucide-react";
import { InterviewProposedSlot } from "@/src/types/interview-planning";
import {
  getSlotDateLabel,
  formatSlotTimeRange,
  formatTime,
  getTimezoneAbbr,
  REQUISITION_TIMEZONE,
} from "../calendar/calendar-utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export interface TraySlotChipProps {
  slot: InterviewProposedSlot;
  index: number;
  candidateRef: string;
  isOffshore?: boolean;
  candidateTimezone?: string;
  isCollision?: boolean;
  collisionCandidates?: string[];
  isReadOnly?: boolean;
  onRemove: (startUtc: string) => void;
  onDragStart: (
    e: React.DragEvent<HTMLDivElement>,
    data: { slot: InterviewProposedSlot; fromCandidateRef: string; fromIndex: number }
  ) => void;
  onDragEnd: (e: React.DragEvent<HTMLDivElement>) => void;
  className?: string;
}

export function TraySlotChip({
  slot,
  index,
  candidateRef,
  isOffshore = false,
  candidateTimezone = "Asia/Dubai",
  isCollision = false,
  collisionCandidates = [],
  isReadOnly = false,
  onRemove,
  onDragStart,
  onDragEnd,
  className,
}: TraySlotChipProps) {
  const [isDragging, setIsDragging] = React.useState(false);

  // Time labels
  const dateLabel = getSlotDateLabel(slot.start, REQUISITION_TIMEZONE);
  const gstRange = formatSlotTimeRange(
    slot.start,
    slot.durationMinutes,
    REQUISITION_TIMEZONE
  );

  // Local candidate time if offshore
  const candidateLocalTimeStr = React.useMemo(() => {
    if (!isOffshore || !candidateTimezone || candidateTimezone === REQUISITION_TIMEZONE) {
      return null;
    }
    const localStart = formatTime(slot.start, candidateTimezone);
    const localEnd = formatTime(
      new Date(new Date(slot.start).getTime() + slot.durationMinutes * 60 * 1000).toISOString(),
      candidateTimezone
    );
    const tzAbbr = getTimezoneAbbr(candidateTimezone);
    return `${localStart} – ${localEnd} ${tzAbbr}`;
  }, [slot.start, slot.durationMinutes, isOffshore, candidateTimezone]);

  const handleDragStartInternal = (e: React.DragEvent<HTMLDivElement>) => {
    if (isReadOnly) return;
    setIsDragging(true);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData(
      "application/json",
      JSON.stringify({
        slot,
        fromCandidateRef: candidateRef,
        fromIndex: index,
      })
    );
    onDragStart(e, { slot, fromCandidateRef: candidateRef, fromIndex: index });
  };

  const handleDragEndInternal = (e: React.DragEvent<HTMLDivElement>) => {
    setIsDragging(false);
    onDragEnd(e);
  };

  return (
    <div
      draggable={!isReadOnly}
      onDragStart={handleDragStartInternal}
      onDragEnd={handleDragEndInternal}
      className={cn(
        "group relative flex items-center justify-between gap-2 p-2.5 rounded-lg border bg-card text-xs text-foreground shadow-2xs select-none",
        "transition-all duration-240 ease-[cubic-bezier(0.2,0,0,1)] motion-reduce:transition-opacity",
        "animate-[slot-chip-enter_240ms_cubic-bezier(0.2,0,0,1)]",
        isCollision
          ? "border-amber-400/80 bg-amber-50/50 dark:border-amber-700/80 dark:bg-amber-950/20"
          : "border-border/80 hover:border-slate-300 dark:hover:border-slate-700",
        isDragging
          ? "scale-[1.02] shadow-md border-primary ring-2 ring-primary/20 opacity-70 z-20 cursor-grabbing"
          : "cursor-grab",
        className
      )}
      style={{
        transformOrigin: "center center",
      }}
      role="listitem"
      aria-label={`${dateLabel} at ${gstRange} for ${candidateRef}`}
    >
      <div className="flex items-center gap-2 min-w-0 flex-1">
        {/* Drag Handle */}
        {!isReadOnly && (
          <div
            className="text-muted-foreground/60 group-hover:text-muted-foreground transition-colors cursor-grab active:cursor-grabbing shrink-0"
            title="Drag to reorder or reassign to another candidate"
          >
            <GripVertical className="size-3.5" />
          </div>
        )}

        {/* Slot Time Details */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-semibold text-foreground">
              {dateLabel} · {gstRange}
            </span>

            {/* Collision Link Marker per Task 5 */}
            {isCollision && (
              <TooltipProvider delayDuration={150}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-200/70 text-amber-900 dark:bg-amber-900/60 dark:text-amber-200 border border-amber-300 dark:border-amber-700">
                      <Link2 className="size-2.5 shrink-0" />
                      Shared offer
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs max-w-xs">
                    This slot also offered to {collisionCandidates.join(", ")}. Whoever confirms first takes it.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>

          {/* Offshore Candidate Local Time */}
          {candidateLocalTimeStr && (
            <div className="text-[11px] font-medium text-primary dark:text-primary-foreground/90 flex items-center gap-1 mt-0.5">
              <Clock className="size-2.5 shrink-0 opacity-70" />
              <span>{candidateLocalTimeStr} for candidate</span>
            </div>
          )}
        </div>
      </div>

      {/* Remove Button */}
      {!isReadOnly && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(slot.start);
          }}
          className="size-5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors flex items-center justify-center shrink-0 cursor-pointer"
          title="Remove slot"
          aria-label={`Remove slot on ${dateLabel}`}
        >
          <X className="size-3.5" />
        </button>
      )}
    </div>
  );
}
