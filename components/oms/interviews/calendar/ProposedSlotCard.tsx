"use client";

import * as React from "react";
import { X, Users, Link2 } from "lucide-react";
import { InterviewProposedSlot, SlotCollision } from "@/src/types/interview-planning";
import { getCandidateColor } from "@/src/lib/interview-planning/candidate-colors";
import {
  TOTAL_MINUTES,
  utcIsoToMinutesFrom8am,
  formatSlotTimeRange,
} from "./calendar-utils";
import { cn } from "@/components/ui/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface ProposedSlotCardProps {
  slot: InterviewProposedSlot;
  candidateRef: string;
  candidateIndex?: number;
  candidateTimezone?: string;
  isOffshore?: boolean;
  isActiveCandidate?: boolean;
  collision?: SlotCollision;
  onRemove: (startUtc: string, candidateRef: string) => void;
  isReadOnly?: boolean;
  overlapIndex?: number;
  overlapCount?: number;
}

export const ProposedSlotCard = React.memo(function ProposedSlotCard({
  slot,
  candidateRef,
  candidateIndex = 0,
  candidateTimezone = "Asia/Dubai",
  isOffshore = false,
  isActiveCandidate = false,
  collision,
  onRemove,
  isReadOnly = false,
  overlapIndex = 0,
  overlapCount = 1,
}: ProposedSlotCardProps) {
  const minutesFrom8am = utcIsoToMinutesFrom8am(slot.start);
  const topPercent = (minutesFrom8am / TOTAL_MINUTES) * 100;
  const heightPercent = (slot.durationMinutes / TOTAL_MINUTES) * 100;

  const gstRange = formatSlotTimeRange(slot.start, slot.durationMinutes, "Asia/Dubai");
  const candidateRange = isOffshore
    ? formatSlotTimeRange(slot.start, slot.durationMinutes, candidateTimezone)
    : null;

  const color = getCandidateColor(candidateIndex);

  // Position calculation for overlapping slots on the same day
  const isMultiOverlap = overlapCount > 1;
  const widthStyle = isMultiOverlap
    ? `calc(${(1 / overlapCount) * 100}% - 4px)`
    : undefined;
  const leftStyle = isMultiOverlap
    ? `calc(${(overlapIndex / overlapCount) * 100}% + 2px)`
    : undefined;

  return (
    <div
      style={{
        top: `${Math.max(0, topPercent)}%`,
        height: `${Math.max(4.2, heightPercent)}%`,
        ...(isMultiOverlap && {
          width: widthStyle,
          left: leftStyle,
        }),
      }}
      className={cn(
        "absolute z-20 rounded-md p-1.5 shadow-2xs select-none flex flex-col justify-between overflow-hidden group transition-all",
        !isMultiOverlap && "inset-x-1",
        color.classes.borderLeft,
        color.classes.surface,
        "border border-border/70 border-l-0",
        isActiveCandidate && "ring-1 ring-primary/40 shadow-xs",
        collision && "ring-2 ring-amber-400/90 dark:ring-amber-500/90"
      )}
      role="article"
      aria-label={`Slot for ${candidateRef} at ${gstRange}`}
    >
      {/* Top Header: Candidate Ref Badge & Remove Button */}
      <div className="flex items-start justify-between gap-1">
        <div className="flex items-center gap-1 min-w-0">
          <span
            className={cn(
              "px-1 py-0.2 rounded font-mono font-bold text-[9px] tracking-tight shrink-0 shadow-2xs",
              color.classes.avatar
            )}
          >
            {candidateRef}
          </span>
          <span className="font-semibold text-[10.5px] text-foreground block truncate leading-tight">
            {gstRange}
          </span>
        </div>

        {!isReadOnly && (
          <button
            type="button"
            title={`Remove slot for ${candidateRef}`}
            onClick={(e) => {
              e.stopPropagation();
              onRemove(slot.start, candidateRef);
            }}
            className="rounded p-0.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0 transition-colors cursor-pointer"
          >
            <X className="size-3" />
          </button>
        )}
      </div>

      {/* Middle: Offshore Local Time if applicable */}
      {candidateRange && (
        <div className="text-[9.5px] text-muted-foreground block truncate font-medium pl-0.5">
          {candidateRange}
        </div>
      )}

      {/* Bottom Footer: Duration & Collision Indicator */}
      <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-auto pt-0.5">
        <span className="font-mono tabular-nums text-[9.5px]">
          {slot.durationMinutes}m
        </span>

        {collision && (
          <TooltipProvider delayDuration={150}>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="inline-flex items-center gap-0.5 px-1 py-0.2 rounded bg-amber-200/60 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 font-medium text-[8.5px] border border-amber-300 dark:border-amber-700/60">
                  <Link2 className="size-2.5" />
                  <span>{collision.alsoOfferedTo.join(", ")}</span>
                </span>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs max-w-xs z-50">
                <p className="font-semibold">Shared Slot Offer</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Also offered to {collision.alsoOfferedTo.join(", ")}. Whoever confirms first takes it; the other offer is withdrawn automatically.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </div>
  );
});
