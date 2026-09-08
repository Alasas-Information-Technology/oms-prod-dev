"use client";

import * as React from "react";
import {
  Sparkles,
  Check,
  X,
  XCircle,
  ChevronDown,
  Clock,
  Calendar as CalendarIcon,
  AlertTriangle,
} from "lucide-react";
import {
  InterviewSuggestion,
  InterviewCandidate,
} from "@/src/types/interview-planning";
import { getCandidateColor } from "@/src/lib/interview-planning/candidate-colors";
import {
  getSlotDateLabel,
  formatSlotTimeRange,
  REQUISITION_TIMEZONE,
} from "../calendar/calendar-utils";
import { buildReasonLine } from "./suggestion-reasons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export interface SuggestionCardProps {
  suggestion: InterviewSuggestion;
  candidates: InterviewCandidate[];
  activeCandidateRef?: string;
  onAddToPlan: (
    slot: { start: string; durationMinutes: number },
    targetCandidateRef: string
  ) => void;
  onDismiss: (slotId: string) => void;
  timezone?: string;
  isDismissing?: boolean;
  isFocused?: boolean;
  shortcutNumber?: number;
}

export function SuggestionCard({
  suggestion,
  candidates,
  activeCandidateRef,
  onAddToPlan,
  onDismiss,
  timezone = REQUISITION_TIMEZONE,
  isDismissing = false,
  isFocused = false,
  shortcutNumber,
}: SuggestionCardProps) {
  // Format Date & Time large
  const dateLabel = getSlotDateLabel(suggestion.start, timezone);
  const timeRangeLabel = formatSlotTimeRange(
    suggestion.start,
    suggestion.durationMinutes,
    timezone
  );

  // Build reason items from codes
  const reasonParts = React.useMemo(() => {
    return buildReasonLine(
      suggestion.reasons,
      suggestion.availability.length,
      suggestion.candidateLocalTime
    );
  }, [
    suggestion.reasons,
    suggestion.availability.length,
    suggestion.candidateLocalTime,
  ]);

  // Identify busy interviewers
  const busyInterviewers = React.useMemo(() => {
    return suggestion.availability.filter((a) => !a.free);
  }, [suggestion.availability]);

  const hasBusy = busyInterviewers.length > 0;

  // Determine candidates who still need proposed slots (< 3 slots)
  const candidatesNeedingSlots = React.useMemo(() => {
    return candidates.filter((c) => {
      const slotCount = c.proposal?.slots?.length ?? 0;
      return slotCount < 3;
    });
  }, [candidates]);

  // Single candidate target reference if only 1 needs slots
  const singleTargetCandidate = React.useMemo(() => {
    if (candidatesNeedingSlots.length === 1) {
      return candidatesNeedingSlots[0];
    }
    if (activeCandidateRef) {
      const active = candidates.find((c) => c.candidateRef === activeCandidateRef);
      if (active && (active.proposal?.slots?.length ?? 0) < 3) {
        return active;
      }
    }
    return candidates[0] || null;
  }, [candidatesNeedingSlots, activeCandidateRef, candidates]);

  const shouldShowDropdown = candidatesNeedingSlots.length > 1;

  return (
    <div
      className={cn(
        "group relative rounded-xl border border-border bg-card p-4 sm:p-5 shadow-xs transition-all duration-180 ease-[cubic-bezier(0.2,0,0,1)] hover:shadow-sm hover:border-slate-300 dark:hover:border-slate-700",
        hasBusy && "opacity-85 hover:opacity-100",
        isFocused && "ring-2 ring-primary ring-offset-2 dark:ring-offset-background border-primary/60 shadow-sm",
        isDismissing && "translate-x-12 opacity-0 pointer-events-none"
      )}
      role="region"
      aria-label={`Interview Suggestion for ${dateLabel} at ${timeRangeLabel}`}
    >
      {/* Top Row: Rank Badge (Top Card Only) & Dismiss Affordance */}
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          {shortcutNumber !== undefined && shortcutNumber >= 1 && shortcutNumber <= 9 && (
            <kbd
              title={`Press ${shortcutNumber} to add to active candidate`}
              className="size-5 flex items-center justify-center rounded bg-muted border border-border font-mono text-[10px] font-bold text-foreground shadow-2xs"
            >
              {shortcutNumber}
            </kbd>
          )}
          {suggestion.isBestMatch ? (
            <Badge
              variant="outline"
              className="bg-accent-surface border-accent-border/40 text-accent-text font-semibold px-2.5 py-0.5 text-[11px] gap-1.5 shadow-2xs"
            >
              <Sparkles className="size-3 text-accent-border fill-accent-border/20 shrink-0" />
              Best match
            </Badge>
          ) : (
            <span className="text-[11px] font-mono text-muted-foreground">
              Option {suggestion.rank}
            </span>
          )}
        </div>

        {/* Dismiss Button (180ms ease-out) */}
        <button
          type="button"
          onClick={() => onDismiss(suggestion.slotId)}
          className="size-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors flex items-center justify-center cursor-pointer relative"
          title="Dismiss suggestion (Press X when focused)"
          aria-label="Dismiss this suggestion"
        >
          <X className="size-4" />
          {isFocused && (
            <span className="absolute -top-1 -right-1 text-[9px] font-mono font-bold px-1 bg-muted rounded border border-border text-foreground shadow-2xs">
              X
            </span>
          )}
        </button>
      </div>

      {/* Decision: Date and Time Large */}
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h3 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
          {dateLabel} · {timeRangeLabel}
        </h3>
      </div>

      {/* Availability Dots & Reason Line Row */}
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
        {/* Availability Dots (One per interviewer, filled when free, names on hover, never color alone) */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-muted-foreground mr-0.5">Panel:</span>
          <TooltipProvider delayDuration={150}>
            {suggestion.availability.map((interviewer) => (
              <Tooltip key={interviewer.userId}>
                <TooltipTrigger asChild>
                  <div
                    tabIndex={0}
                    role="img"
                    aria-label={`${interviewer.name}: ${interviewer.free ? "Free" : `Busy (${interviewer.reason || "Busy"})`}`}
                    className={cn(
                      "size-5 rounded-full flex items-center justify-center transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring",
                      interviewer.free
                        ? "bg-emerald-600 text-white dark:bg-emerald-500 shadow-2xs"
                        : "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-400 dark:border-rose-700"
                    )}
                  >
                    {interviewer.free ? (
                      <Check className="size-3 stroke-[3]" />
                    ) : (
                      <XCircle className="size-3 stroke-[2.5]" />
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs max-w-xs">
                  <strong className="block font-semibold">{interviewer.name}</strong>
                  <span className="text-muted-foreground">
                    {interviewer.free
                      ? "✓ Available for this slot"
                      : `✕ Busy: ${interviewer.reason || "Conflict on calendar"}`}
                  </span>
                </TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
        </div>

        <div className="h-3 w-px bg-border hidden sm:block" />

        {/* Reason Line Rendered From Reason Codes */}
        <div className="flex items-center flex-wrap gap-1.5 text-muted-foreground font-medium">
          {reasonParts.map((part, index) => (
            <React.Fragment key={index}>
              {index > 0 && <span className="opacity-40">·</span>}
              <span
                className={cn(
                  part.includes("IST") || part.includes("candidate")
                    ? "text-primary dark:text-primary-foreground/90 font-semibold"
                    : ""
                )}
              >
                {part}
              </span>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Busy Interviewer Warning Banner: Name who is busy explicitly */}
      {hasBusy && (
        <div className="mt-3 p-2.5 rounded-lg border border-amber-200 dark:border-amber-900/60 bg-amber-50/80 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2">
          <AlertTriangle className="size-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1 space-y-0.5">
            <span className="font-semibold block">Panel conflict noted:</span>
            <span className="text-amber-800 dark:text-amber-300">
              {busyInterviewers
                .map((b) => `${b.name}${b.reason ? ` is busy (${b.reason})` : " is busy"}`)
                .join(" · ")}
              . You may still propose this slot if needed.
            </span>
          </div>
        </div>
      )}

      {/* Bottom Action Row */}
      <div className="mt-4 pt-3 border-t border-border/80 flex items-center justify-between gap-3">
        <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
          <Clock className="size-3.5 text-muted-foreground/80" />
          <span>{suggestion.durationMinutes} min session</span>
        </div>

        {/* "Add to plan" Action */}
        <div>
          {shouldShowDropdown ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="sm"
                  className="h-8 px-3.5 text-xs font-semibold gap-1.5 cursor-pointer"
                >
                  Add to plan
                  <ChevronDown className="size-3.5 opacity-70" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 text-xs">
                <DropdownMenuLabel className="text-[11px] font-semibold text-muted-foreground">
                  Select candidate for this slot
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {candidates.map((cand, idx) => {
                  const color = getCandidateColor(idx);
                  const plannedCount = cand.proposal?.slots?.length ?? 0;
                  const isFull = plannedCount >= 3;

                  return (
                    <DropdownMenuItem
                      key={cand.candidateRef}
                      disabled={isFull}
                      onClick={() =>
                        onAddToPlan(
                          {
                            start: suggestion.start,
                            durationMinutes: suggestion.durationMinutes,
                          },
                          cand.candidateRef
                        )
                      }
                      className="flex items-center justify-between py-2 cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border-l-2",
                            color.classes.chip
                          )}
                        >
                          {cand.candidateRef}
                        </span>
                        <span className="font-medium text-foreground">
                          Candidate {idx + 1}
                        </span>
                      </div>
                      <span className="text-[11px] text-muted-foreground">
                        {isFull ? (
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                            ✓ 3/3 ready
                          </span>
                        ) : (
                          `${plannedCount}/3 slots`
                        )}
                      </span>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              size="sm"
              onClick={() => {
                if (singleTargetCandidate) {
                  onAddToPlan(
                    {
                      start: suggestion.start,
                      durationMinutes: suggestion.durationMinutes,
                    },
                    singleTargetCandidate.candidateRef
                  );
                }
              }}
              className="h-8 px-3.5 text-xs font-semibold cursor-pointer"
            >
              Add to plan
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
