"use client";

import * as React from "react";
import {
  X,
  AlertTriangle,
  Users,
  Calendar,
} from "lucide-react";
import { InterviewProposedSlot, SlotCollision } from "@/src/types/interview-planning";
import {
  formatSlotTimeRange,
  getSlotDateLabel,
  isOutsideCandidateHours,
} from "./calendar-utils";
import { Button } from "@/components/ui/button";

interface ProposedSlotsListProps {
  slots: InterviewProposedSlot[];
  collisions: SlotCollision[];
  candidateRef: string;
  candidateTimezone: string;
  isOffshore: boolean;
  onRemoveSlot: (startUtc: string) => void;
  isReadOnly?: boolean;
}

export function ProposedSlotsList({
  slots,
  collisions,
  candidateTimezone,
  isOffshore,
  onRemoveSlot,
  isReadOnly = false,
}: ProposedSlotsListProps) {
  // Sort slots chronologically
  const sortedSlots = React.useMemo(() => {
    return [...slots].sort((a, b) => a.start.localeCompare(b.start));
  }, [slots]);

  const count = sortedSlots.length;

  return (
    <div className="mt-6 rounded-xl border border-border bg-card p-5 shadow-xs">
      {/* Header with slot guidance */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b border-border">
        <div className="flex items-center gap-2">
          <Calendar className="size-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground tracking-tight">
            Proposed Slots
          </h3>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-muted border border-border tabular-nums text-foreground">
            {count}
          </span>
        </div>

        {/* Guidance line per Task 5 */}
        <div className="text-xs text-muted-foreground font-medium">
          {count} {count === 1 ? "slot" : "slots"} proposed · aim for 3–5
        </div>
      </div>

      {/* Warning below 2 slots per Task 5 */}
      {count < 2 && (
        <div className="mt-3.5 p-3 rounded-lg border border-amber-300/60 dark:border-amber-700/50 bg-amber-50/80 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-2.5">
          <AlertTriangle className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <span>
            {count === 0
              ? "No slots proposed yet. Propose at least 2 slots (ideally 3–5) so the candidate has a choice."
              : "Only 1 slot proposed. Propose at least 2 slots so the candidate has a choice."}
          </span>
        </div>
      )}

      {/* Empty state */}
      {count === 0 ? (
        <div className="py-8 text-center text-muted-foreground text-xs">
          Click or drag on the week calendar above to propose interview times.
        </div>
      ) : (
        <div className="mt-4 space-y-2.5">
          {sortedSlots.map((slot) => {
            const dateLabel = getSlotDateLabel(slot.start, "Asia/Dubai");
            const gstRange = formatSlotTimeRange(slot.start, slot.durationMinutes, "Asia/Dubai");

            // Dual timezone check
            const candidateRange = isOffshore
              ? formatSlotTimeRange(slot.start, slot.durationMinutes, candidateTimezone)
              : null;

            // Candidate local hours boundary check (08:00 - 20:00)
            const localHoursCheck = isOffshore
              ? isOutsideCandidateHours(slot.start, slot.durationMinutes, candidateTimezone)
              : { isOutside: false, candidateLocalTime: "" };

            // Collision check
            const collision = collisions.find((c) => c.slotStart === slot.start);

            return (
              <div
                key={slot.start}
                className="p-3.5 rounded-lg border border-border/80 bg-background/80 hover:bg-muted/20 transition-all flex flex-col gap-2.5 shadow-2xs"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    {/* Date and Requisition GST Time */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-xs text-foreground">
                        {dateLabel}
                      </span>
                      <span className="text-muted-foreground">·</span>
                      <span className="font-mono text-xs font-semibold text-primary">
                        {gstRange}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        ({slot.durationMinutes} min)
                      </span>
                    </div>

                    {/* Dual Timezone rendering per Task 6 */}
                    {candidateRange && (
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-muted-foreground font-medium">
                          Candidate local time:
                        </span>
                        <span className="font-mono font-semibold text-foreground">
                          {candidateRange}
                        </span>
                      </div>
                    )}

                    {/* Candidate local hours warning per Task 6 */}
                    {localHoursCheck.isOutside && (
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-400 text-[11px] font-medium">
                        <AlertTriangle className="size-3 shrink-0" />
                        <span>
                          Outside candidate&apos;s local hours (starts at {localHoursCheck.candidateLocalTime})
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Remove button */}
                  {!isReadOnly && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveSlot(slot.start)}
                      className="size-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0 cursor-pointer"
                      title="Remove this slot"
                    >
                      <X className="size-4" />
                      <span className="sr-only">Remove</span>
                    </Button>
                  )}
                </div>

                {/* Collision note per Task 7 */}
                {collision && (
                  <div className="p-2.5 rounded-md bg-amber-50/90 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-2">
                    <Users className="size-3.5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                    <div className="leading-snug">
                      <strong>Also offered to {collision.alsoOfferedTo.join(", ")}.</strong>{" "}
                      Whoever confirms first takes it; the other offer is withdrawn automatically.
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
