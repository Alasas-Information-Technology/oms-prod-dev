"use client";

import * as React from "react";
import { X, Users } from "lucide-react";
import { InterviewProposedSlot, SlotCollision } from "@/src/types/interview-planning";
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

interface ProposedSlotCardProps {
  slot: InterviewProposedSlot;
  collision?: SlotCollision;
  candidateTimezone: string;
  isOffshore: boolean;
  onRemove: (startUtc: string) => void;
  isReadOnly?: boolean;
}

export const ProposedSlotCard = React.memo(function ProposedSlotCard({
  slot,
  collision,
  candidateTimezone,
  isOffshore,
  onRemove,
  isReadOnly = false,
}: ProposedSlotCardProps) {
  const minutesFrom8am = utcIsoToMinutesFrom8am(slot.start);
  const topPercent = (minutesFrom8am / TOTAL_MINUTES) * 100;
  const heightPercent = (slot.durationMinutes / TOTAL_MINUTES) * 100;

  const gstRange = formatSlotTimeRange(slot.start, slot.durationMinutes, "Asia/Dubai");
  const candidateRange = isOffshore
    ? formatSlotTimeRange(slot.start, slot.durationMinutes, candidateTimezone)
    : null;

  return (
    <div
      style={{
        top: `${Math.max(0, topPercent)}%`,
        height: `${Math.max(3.5, heightPercent)}%`,
      }}
      className={cn(
        "absolute inset-x-1 z-20 rounded-md bg-primary text-primary-foreground p-1.5 shadow-sm select-none flex flex-col justify-between overflow-hidden group transition-all",
        collision && "ring-2 ring-amber-400 dark:ring-amber-500"
      )}
    >
      <div className="flex items-start justify-between gap-1">
        <div className="min-w-0 leading-tight">
          <span className="font-semibold text-[11px] block truncate text-primary-foreground">
            {gstRange}
          </span>
          {candidateRange && (
            <span className="text-[10px] text-primary-foreground/80 block truncate font-medium">
              {candidateRange}
            </span>
          )}
        </div>

        {!isReadOnly && (
          <button
            type="button"
            title="Remove proposed slot"
            onClick={(e) => {
              e.stopPropagation();
              onRemove(slot.start);
            }}
            className="rounded p-0.5 text-primary-foreground/80 hover:text-white hover:bg-black/20 shrink-0 transition-colors cursor-pointer"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>

      <div className="flex items-center justify-between text-[10px] text-primary-foreground/85 mt-auto pt-0.5">
        <span className="font-mono tabular-nums">{slot.durationMinutes}m</span>

        {collision && (
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="inline-flex items-center gap-0.5 px-1 py-0.2 rounded bg-amber-400/30 text-white font-medium text-[9px]">
                  <Users className="size-2.5" />
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
