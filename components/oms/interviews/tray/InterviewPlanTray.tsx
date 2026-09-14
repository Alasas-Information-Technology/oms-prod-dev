"use client";

import * as React from "react";
import {
  Layers,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  ChevronUp,
  ChevronDown,
  X,
  Send,
} from "lucide-react";
import {
  InterviewCandidate,
  InterviewProposedSlot,
} from "@/src/types/interview-planning";
import { CandidatePlanCard } from "./CandidatePlanCard";
import { CollisionNotice, CollisionNoticeItem } from "./CollisionNotice";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export interface InterviewPlanTrayProps {
  candidates: InterviewCandidate[];
  candidateSlotsMap: Record<string, InterviewProposedSlot[]>;
  targetSlotsPerCandidate?: number;
  selectedCandidateRef?: string;
  onSelectCandidate?: (candidateRef: string) => void;
  isReadOnly?: boolean;
  onSlotsChange: (candidateRef: string, newSlots: InterviewProposedSlot[]) => void;
  onReviewAndSend: () => void;
  className?: string;
}

export function InterviewPlanTray({
  candidates,
  candidateSlotsMap,
  targetSlotsPerCandidate = 3,
  selectedCandidateRef,
  onSelectCandidate,
  isReadOnly = false,
  onSlotsChange,
  onReviewAndSend,
  className,
}: InterviewPlanTrayProps) {
  // Mobile bottom sheet expanded state (< 1024px)
  const [isMobileSheetOpen, setIsMobileSheetOpen] = React.useState(false);

  // Dragging state tracking for visual target feedback
  const [activeDragData, setActiveDragData] = React.useState<{
    slot: InterviewProposedSlot;
    fromCandidateRef: string;
    fromIndex: number;
  } | null>(null);

  // Undo history stack (up to 20 states per Part 8)
  const [history, setHistory] = React.useState<Record<string, InterviewProposedSlot[]>[]>([]);

  // Push current state to undo history
  const pushHistory = React.useCallback(
    (nextState: Record<string, InterviewProposedSlot[]>) => {
      setHistory((prev) => [...prev.slice(-19), candidateSlotsMap]);
    },
    [candidateSlotsMap]
  );

  // Handle undo (⌘Z)
  const handleUndo = React.useCallback(() => {
    if (history.length === 0) {
      toast.info("Nothing to undo.");
      return;
    }
    const previous = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1));
    for (const [cRef, slots] of Object.entries(previous)) {
      onSlotsChange(cRef, slots);
    }
    toast.success("Undid last plan change.");
  }, [history, onSlotsChange]);

  // Global ⌘Z listener
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }
      if ((e.metaKey || e.ctrlKey) && (e.key === "z" || e.key === "Z")) {
        e.preventDefault();
        handleUndo();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleUndo]);

  // Derive slots for each candidate (merging local edits with proposal default)
  const candidateSlotEntries = React.useMemo(() => {
    return candidates.map((c) => {
      const slots =
        candidateSlotsMap[c.candidateRef] ?? c.proposal?.slots ?? [];
      return { candidate: c, slots };
    });
  }, [candidates, candidateSlotsMap]);

  // Task 5: Calculate slot collisions across candidates
  const { collisionsMap, collisionsList } = React.useMemo(() => {
    const slotCountMap: Record<string, string[]> = {};
    for (const { candidate, slots } of candidateSlotEntries) {
      for (const s of slots) {
        if (!slotCountMap[s.start]) {
          slotCountMap[s.start] = [];
        }
        if (!slotCountMap[s.start].includes(candidate.candidateRef)) {
          slotCountMap[s.start].push(candidate.candidateRef);
        }
      }
    }

    const collisions: CollisionNoticeItem[] = [];
    for (const [start, refs] of Object.entries(slotCountMap)) {
      if (refs.length > 1) {
        collisions.push({ slotStart: start, candidates: refs });
      }
    }

    return { collisionsMap: slotCountMap, collisionsList: collisions };
  }, [candidateSlotEntries]);

  // Task 6: Completion check (every candidate has reached target slots)
  const totalRequired = candidates.length * targetSlotsPerCandidate;
  const totalPlanned = candidateSlotEntries.reduce(
    (sum, item) => sum + Math.min(item.slots.length, targetSlotsPerCandidate),
    0
  );
  const allCandidatesReady =
    candidates.length > 0 &&
    candidateSlotEntries.every(
      (item) => item.slots.length >= targetSlotsPerCandidate
    );

  // Task 6: Button 2px lift animation trigger (lifts ONCE on completion, then settles)
  const [hasLiftedOnce, setHasLiftedOnce] = React.useState(false);
  const [shouldAnimateLift, setShouldAnimateLift] = React.useState(false);

  React.useEffect(() => {
    if (allCandidatesReady && !hasLiftedOnce) {
      setHasLiftedOnce(true);
      setShouldAnimateLift(true);
      const timer = setTimeout(() => {
        setShouldAnimateLift(false);
      }, 450);
      return () => clearTimeout(timer);
    } else if (!allCandidatesReady) {
      setHasLiftedOnce(false);
    }
  }, [allCandidatesReady, hasLiftedOnce]);

  // Handlers for slot mutations
  const handleRemoveSlot = React.useCallback(
    (candidateRef: string, startUtc: string) => {
      const current =
        candidateSlotsMap[candidateRef] ??
        candidates.find((c) => c.candidateRef === candidateRef)?.proposal?.slots ??
        [];
      const updated = current.filter((s) => s.start !== startUtc);
      pushHistory({ ...candidateSlotsMap, [candidateRef]: updated });
      onSlotsChange(candidateRef, updated);
      toast.info(`Removed slot from ${candidateRef}`);
    },
    [candidateSlotsMap, candidates, pushHistory, onSlotsChange]
  );

  const handleReorderSlots = React.useCallback(
    (candidateRef: string, newSlots: InterviewProposedSlot[]) => {
      pushHistory({ ...candidateSlotsMap, [candidateRef]: newSlots });
      onSlotsChange(candidateRef, newSlots);
    },
    [candidateSlotsMap, pushHistory, onSlotsChange]
  );

  const handleDropFromOtherCandidate = React.useCallback(
    (
      targetCandidateRef: string,
      slot: InterviewProposedSlot,
      fromCandidateRef: string
    ) => {
      if (targetCandidateRef === fromCandidateRef) return;

      const sourceSlots =
        candidateSlotsMap[fromCandidateRef] ??
        candidates.find((c) => c.candidateRef === fromCandidateRef)?.proposal
          ?.slots ??
        [];
      const targetSlots =
        candidateSlotsMap[targetCandidateRef] ??
        candidates.find((c) => c.candidateRef === targetCandidateRef)?.proposal
          ?.slots ??
        [];

      // Check duplicate in target
      if (targetSlots.some((s) => s.start === slot.start)) {
        toast.info(`Slot is already proposed for ${targetCandidateRef}.`);
        return;
      }

      // Check target max capacity
      if (targetSlots.length >= targetSlotsPerCandidate) {
        toast.warning(
          `${targetCandidateRef} already has ${targetSlotsPerCandidate} slots.`
        );
        return;
      }

      const updatedSource = sourceSlots.filter((s) => s.start !== slot.start);
      const updatedTarget = [...targetSlots, slot];

      pushHistory({
        ...candidateSlotsMap,
        [fromCandidateRef]: updatedSource,
        [targetCandidateRef]: updatedTarget,
      });

      onSlotsChange(fromCandidateRef, updatedSource);
      onSlotsChange(targetCandidateRef, updatedTarget);
      toast.success(
        `Reassigned slot from ${fromCandidateRef} to ${targetCandidateRef}`
      );
    },
    [candidateSlotsMap, candidates, targetSlotsPerCandidate, pushHistory, onSlotsChange]
  );

  const handleDragStartSlot = React.useCallback(
    (
      _e: React.DragEvent<HTMLDivElement>,
      data: { slot: InterviewProposedSlot; fromCandidateRef: string; fromIndex: number }
    ) => {
      setActiveDragData(data);
    },
    []
  );

  const handleDragEndSlot = React.useCallback(() => {
    setActiveDragData(null);
  }, []);

  // Shared Tray Body Content
  const trayContent = (
    <div className="space-y-4">
      {/* Top Header: Title & Progress Summary */}
      <div className="flex items-center justify-between border-b border-border pb-2.5">
        <div className="flex items-center gap-2">
          <Layers className="size-4.5 text-primary" />
          <h2 className="text-sm font-bold text-foreground tracking-tight">
            Interview Plan Tray
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {history.length > 0 && (
            <button
              type="button"
              onClick={handleUndo}
              className="text-[11px] font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1 cursor-pointer transition-colors"
              title="Undo last change (⌘Z)"
            >
              <RotateCcw className="size-3" />
              Undo
            </button>
          )}

          <Badge
            variant="outline"
            className={cn(
              "text-[10px] font-semibold",
              allCandidatesReady
                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300"
                : "bg-muted/60 text-muted-foreground"
            )}
          >
            {allCandidatesReady
              ? "All ready"
              : `${totalPlanned} of ${totalRequired} planned`}
          </Badge>
        </div>
      </div>

      {/* Task 5: Collision Notices */}
      {collisionsList.length > 0 && (
        <CollisionNotice collisions={collisionsList} />
      )}

      {/* Task 1 & 4: Candidate Plan Cards */}
      <div className="space-y-3">
        {candidateSlotEntries.map(({ candidate, slots }, idx) => (
          <CandidatePlanCard
            key={candidate.candidateRef}
            candidate={candidate}
            candidateIndex={idx}
            slots={slots}
            targetSlotsCount={targetSlotsPerCandidate}
            collisionsMap={collisionsMap}
            isSelected={candidate.candidateRef === selectedCandidateRef}
            onSelect={onSelectCandidate}
            isReadOnly={isReadOnly}
            onRemoveSlot={handleRemoveSlot}
            onReorderSlots={handleReorderSlots}
            onDropFromOtherCandidate={handleDropFromOtherCandidate}
            onDragStartSlot={handleDragStartSlot}
            onDragEndSlot={handleDragEndSlot}
          />
        ))}
      </div>

      {/* Task 6: Review & Send Button with 2px lift animation */}
      <div className="pt-2">
        <Button
          onClick={onReviewAndSend}
          disabled={!allCandidatesReady || isReadOnly}
          className={cn(
            "w-full h-10 text-xs font-semibold gap-2 shadow-xs transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] cursor-pointer",
            allCandidatesReady
              ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
              : "opacity-60",
            shouldAnimateLift &&
              "translate-y-[-2px] shadow-[0_4px_14px_rgba(79,70,229,0.3)] duration-200"
          )}
          style={{
            transform: shouldAnimateLift ? "translateY(-2px)" : undefined,
          }}
        >
          {allCandidatesReady ? (
            <>
              <CheckCircle2 className="size-4 text-emerald-300" />
              <span>Review &amp; send interview plan</span>
              <ArrowRight className="size-3.5 ml-0.5" />
            </>
          ) : (
            <>
              <span>Review &amp; send</span>
              <span className="opacity-75 font-normal">
                ({totalPlanned}/{totalRequired} slots)
              </span>
            </>
          )}
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop & Tablet Tray Container (Task 1: Sticky 340px) */}
      <aside
        className={cn(
          "hidden lg:block w-full xl:w-[340px] shrink-0 xl:sticky xl:top-6 self-start space-y-4",
          className
        )}
        aria-label="Interview planning tray"
      >
        <div className="p-4 rounded-2xl border border-border bg-card/95 backdrop-blur-xs shadow-xs max-h-[calc(100vh-120px)] overflow-y-auto overscroll-contain">
          {trayContent}
        </div>
      </aside>

      {/* Task 8: Mobile Bottom Sheet (< 1024px) */}
      <div className="block lg:hidden fixed bottom-0 left-0 right-0 z-40">
        {/* Mobile Bar / Handle */}
        <div
          onClick={() => setIsMobileSheetOpen((prev) => !prev)}
          className="bg-card/95 backdrop-blur-md border-t border-border px-4 py-3 flex items-center justify-between cursor-pointer shadow-lg"
        >
          <div className="flex items-center gap-2 text-xs">
            <Layers className="size-4 text-primary" />
            <span className="font-bold text-foreground">
              Plan: {totalPlanned} of {totalRequired} slots ready
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={cn(
                "text-[10px] font-semibold",
                allCandidatesReady
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                  : "bg-muted"
              )}
            >
              {allCandidatesReady ? "Ready" : `${candidates.length} candidates`}
            </Badge>
            {isMobileSheetOpen ? (
              <ChevronDown className="size-4 text-muted-foreground" />
            ) : (
              <ChevronUp className="size-4 text-muted-foreground" />
            )}
          </div>
        </div>

        {/* Mobile Sheet Expanded Content */}
        {isMobileSheetOpen && (
          <div className="bg-card border-t border-border px-4 py-4 max-h-[75vh] overflow-y-auto space-y-4 shadow-2xl">
            {trayContent}
          </div>
        )}
      </div>
    </>
  );
}
