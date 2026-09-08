"use client";

import * as React from "react";
import { Check, Clock, Plus, Sparkles } from "lucide-react";
import {
  InterviewCandidate,
  InterviewProposedSlot,
} from "@/src/types/interview-planning";
import { getCandidateColor } from "@/src/lib/interview-planning/candidate-colors";
import { TraySlotChip } from "./TraySlotChip";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface CandidatePlanCardProps {
  candidate: InterviewCandidate;
  candidateIndex: number;
  slots: InterviewProposedSlot[];
  targetSlotsCount?: number;
  collisionsMap: Record<string, string[]>;
  isSelected?: boolean;
  onSelect?: (candidateRef: string) => void;
  isReadOnly?: boolean;
  onRemoveSlot: (candidateRef: string, startUtc: string) => void;
  onReorderSlots: (candidateRef: string, newSlots: InterviewProposedSlot[]) => void;
  onDropFromOtherCandidate: (
    targetCandidateRef: string,
    slot: InterviewProposedSlot,
    fromCandidateRef: string
  ) => void;
  onDragStartSlot: (
    e: React.DragEvent<HTMLDivElement>,
    data: { slot: InterviewProposedSlot; fromCandidateRef: string; fromIndex: number }
  ) => void;
  onDragEndSlot: (e: React.DragEvent<HTMLDivElement>) => void;
  className?: string;
}

export function CandidatePlanCard({
  candidate,
  candidateIndex,
  slots,
  targetSlotsCount = 3,
  collisionsMap,
  isSelected = false,
  onSelect,
  isReadOnly = false,
  onRemoveSlot,
  onReorderSlots,
  onDropFromOtherCandidate,
  onDragStartSlot,
  onDragEndSlot,
  className,
}: CandidatePlanCardProps) {
  const color = getCandidateColor(candidateIndex);
  const [isDragOver, setIsDragOver] = React.useState(false);
  const [hasJustCompleted, setHasJustCompleted] = React.useState(false);
  const prevCountRef = React.useRef(slots.length);

  const isReady = slots.length >= targetSlotsCount;

  // 300ms single border transition on plan complete per UX Part 7
  React.useEffect(() => {
    if (slots.length >= targetSlotsCount && prevCountRef.current < targetSlotsCount) {
      setHasJustCompleted(true);
      const timer = setTimeout(() => {
        setHasJustCompleted(false);
      }, 300);
      return () => clearTimeout(timer);
    }
    prevCountRef.current = slots.length;
  }, [slots.length, targetSlotsCount]);

  // Drag over handling
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    // Only unset if leaving the card boundary
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);

    try {
      const dataStr = e.dataTransfer.getData("application/json");
      if (!dataStr) return;
      const parsed = JSON.parse(dataStr) as {
        slot: InterviewProposedSlot;
        fromCandidateRef: string;
        fromIndex: number;
      };

      if (!parsed.slot || !parsed.fromCandidateRef) return;

      if (parsed.fromCandidateRef === candidate.candidateRef) {
        // Reordering within the same candidate
        // Insert at the end or maintain order
        return;
      }

      // Reassignment between candidates
      onDropFromOtherCandidate(
        candidate.candidateRef,
        parsed.slot,
        parsed.fromCandidateRef
      );
    } catch {
      // Ignore malformed drag payload
    }
  };

  return (
    <div
      onClick={() => onSelect?.(candidate.candidateRef)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect?.(candidate.candidateRef);
        }
      }}
      tabIndex={0}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "relative rounded-xl border p-4 transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] cursor-pointer focus:outline-hidden",
        color.classes.borderLeft,
        color.classes.surface,
        isSelected
          ? "ring-2 ring-primary border-primary shadow-sm bg-primary/[0.04] dark:bg-primary/[0.08]"
          : isReady
          ? "border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600"
          : "border-border hover:border-slate-300 dark:hover:border-slate-700",
        hasJustCompleted && "ring-2 ring-emerald-500 border-emerald-500 transition-all duration-300",
        isDragOver && "ring-2 ring-primary border-primary bg-primary/5 shadow-md",
        className
      )}
      role="region"
      aria-label={`Interview plan for ${candidate.candidateRef}${isSelected ? " (Active Candidate)" : ""}`}
    >
      {/* Header: Reference, Priority Badge, Active Badge, Progress */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          {/* Avatar Background with initials / index */}
          <div
            className={cn(
              "size-6 rounded-full font-bold flex items-center justify-center text-[10px] shadow-2xs shrink-0",
              color.classes.avatar,
              isSelected && "ring-2 ring-primary ring-offset-1 dark:ring-offset-background"
            )}
          >
            {candidateIndex + 1}
          </div>

          <span className={cn("font-mono font-bold text-xs", color.classes.text)}>
            {candidate.candidateRef}
          </span>

          <Badge
            variant="outline"
            className="text-[10px] px-1.5 py-0 h-4.5 font-semibold bg-card/60 text-muted-foreground border-border/80"
          >
            {candidate.priority}
          </Badge>

          {isSelected && (
            <Badge
              variant="default"
              className="text-[10px] px-1.5 py-0 h-4.5 font-bold bg-primary text-primary-foreground shadow-2xs gap-1 shrink-0 animate-in fade-in duration-200"
            >
              <span className="size-1.5 rounded-full bg-primary-foreground animate-pulse" />
              Active
            </Badge>
          )}
        </div>

        {/* Progress Display per Task 3: "2 of 3" -> "✓ 3 of 3 · ready" in success green */}
        <div>
          {isReady ? (
            <Badge
              variant="outline"
              className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 text-[10px] font-mono font-semibold gap-1 shadow-2xs"
            >
              <Check className="size-3 stroke-[3]" />
              {slots.length} of {targetSlotsCount} · ready
            </Badge>
          ) : (
            <span className="text-[11px] font-mono font-medium text-muted-foreground">
              {slots.length} of {targetSlotsCount}
            </span>
          )}
        </div>
      </div>

      {/* Slots List or Task 4 Empty State */}
      <div className="space-y-2">
        {slots.length === 0 ? (
          /* Task 4 Empty State: Dashed drop zone, never a blank card */
          <div
            className={cn(
              "p-4 rounded-lg border-2 border-dashed border-border/80 bg-background/40 text-center space-y-1 transition-colors",
              isDragOver && "border-primary bg-primary/10 text-primary"
            )}
          >
            <Clock className="size-4 text-muted-foreground/60 mx-auto" />
            <p className="text-[11px] font-medium text-muted-foreground">
              Drop a time here, or add one from the suggestions.
            </p>
          </div>
        ) : (
          slots.map((slot, idx) => {
            const collidingWith = collisionsMap[slot.start] || [];
            const isCollision = collidingWith.some((ref) => ref !== candidate.candidateRef);

            return (
              <TraySlotChip
                key={slot.start}
                slot={slot}
                index={idx}
                candidateRef={candidate.candidateRef}
                isOffshore={candidate.isOffshore}
                candidateTimezone={candidate.timezone}
                isCollision={isCollision}
                collisionCandidates={collidingWith.filter((ref) => ref !== candidate.candidateRef)}
                isReadOnly={isReadOnly}
                onRemove={(startUtc) => onRemoveSlot(candidate.candidateRef, startUtc)}
                onDragStart={onDragStartSlot}
                onDragEnd={onDragEndSlot}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
