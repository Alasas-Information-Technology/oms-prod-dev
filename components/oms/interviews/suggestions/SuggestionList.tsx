"use client";

import * as React from "react";
import {
  CalendarX2,
  CalendarOff,
  RotateCcw,
  Sparkles,
  ChevronDown,
  Calendar as CalendarIcon,
  Users,
  Filter,
  Keyboard,
} from "lucide-react";
import {
  InterviewSuggestion,
  InterviewCandidate,
} from "@/src/types/interview-planning";
import { SuggestionCard } from "./SuggestionCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface SuggestionListProps {
  suggestions: InterviewSuggestion[];
  totalFound: number;
  availabilityConnected: boolean;
  isLoading?: boolean;
  candidates: InterviewCandidate[];
  activeCandidateRef?: string;
  focusedIndex?: number;
  dismissedSlotIds?: string[];
  onAddToPlan: (
    slot: { start: string; durationMinutes: number },
    targetCandidateRef: string
  ) => void;
  onDismissSuggestion?: (slotId: string) => void;
  onRestoreDismissed?: () => void;
  onSwitchToCalendarTab: () => void;
  onOpenShortcutsModal?: () => void;
  onWidenDates?: () => void;
  onDropInterviewer?: () => void;
  timezone?: string;
  className?: string;
}

const INITIAL_VISIBLE_COUNT = 5;

export function SuggestionList({
  suggestions,
  totalFound,
  availabilityConnected,
  isLoading = false,
  candidates,
  activeCandidateRef,
  focusedIndex,
  dismissedSlotIds: controlledDismissedSlotIds,
  onAddToPlan,
  onDismissSuggestion,
  onRestoreDismissed,
  onSwitchToCalendarTab,
  onOpenShortcutsModal,
  onWidenDates,
  onDropInterviewer,
  timezone,
  className,
}: SuggestionListProps) {
  // Visible count state (starts at 5 per Task 5)
  const [visibleCount, setVisibleCount] = React.useState<number>(INITIAL_VISIBLE_COUNT);

  // Local dismissed state fallback if not controlled
  const [localDismissedSlotIds, setLocalDismissedSlotIds] = React.useState<string[]>([]);
  const [dismissingSlotId, setDismissingSlotId] = React.useState<string | null>(null);

  const effectiveDismissedSlotIds = controlledDismissedSlotIds ?? localDismissedSlotIds;

  // Active suggestions excluding dismissed ones
  const activeSuggestions = React.useMemo(() => {
    return suggestions.filter((s) => !effectiveDismissedSlotIds.includes(s.slotId));
  }, [suggestions, effectiveDismissedSlotIds]);

  const dismissedCount = effectiveDismissedSlotIds.length;

  // Handle dismiss with 180ms slide animation
  const handleDismiss = React.useCallback(
    (slotId: string) => {
      setDismissingSlotId(slotId);
      setTimeout(() => {
        if (onDismissSuggestion) {
          onDismissSuggestion(slotId);
        } else {
          setLocalDismissedSlotIds((prev) => [...prev, slotId]);
        }
        setDismissingSlotId(null);
      }, 180);
    },
    [onDismissSuggestion]
  );

  // Restore all dismissed suggestions
  const handleRestoreDismissed = React.useCallback(() => {
    if (onRestoreDismissed) {
      onRestoreDismissed();
    } else {
      setLocalDismissedSlotIds([]);
    }
  }, [onRestoreDismissed]);

  // Show more handler
  const handleShowMore = React.useCallback(() => {
    setVisibleCount((prev) => prev + 5);
  }, []);

  // ─────────────────────────────────────────────────────────────────────────────
  // Case 1: Disconnected State per Task 6 & UI §3.2
  // availabilityConnected === false -> NEVER show suggestions
  // ─────────────────────────────────────────────────────────────────────────────
  if (!availabilityConnected) {
    return (
      <div
        className={cn(
          "rounded-2xl border border-border bg-card p-8 text-center space-y-4 max-w-xl mx-auto my-6 shadow-xs",
          className
        )}
      >
        <div className="size-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 mx-auto flex items-center justify-center border border-amber-200 dark:border-amber-800/60">
          <CalendarOff className="size-6" />
        </div>
        <div className="space-y-1.5">
          <h3 className="text-base font-bold text-foreground">
            Interviewer calendars aren&apos;t connected
          </h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
            Automatic suggestion ranking is unavailable because live calendar sync is not active.
            Use the Calendar tab to propose times manually.
          </p>
        </div>
        <div className="pt-2">
          <Button
            onClick={onSwitchToCalendarTab}
            className="text-xs font-semibold gap-2 cursor-pointer shadow-xs"
          >
            <CalendarIcon className="size-3.5" />
            Switch to Calendar tab
          </Button>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Case 2: Empty Suggestions per Task 6
  // availabilityConnected === true but no suggestions found
  // ─────────────────────────────────────────────────────────────────────────────
  if (!isLoading && activeSuggestions.length === 0) {
    return (
      <div
        className={cn(
          "rounded-2xl border border-border bg-card p-8 text-center space-y-4 max-w-xl mx-auto my-6 shadow-xs",
          className
        )}
      >
        <div className="size-12 rounded-2xl bg-muted/60 text-muted-foreground mx-auto flex items-center justify-center border border-border">
          <CalendarX2 className="size-6" />
        </div>
        <div className="space-y-1.5">
          <h3 className="text-base font-bold text-foreground">
            No suggestions found
          </h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
            No times work for all three in this range. Try widening the dates or dropping an interviewer.
          </p>
        </div>
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          {onWidenDates && (
            <Button
              variant="outline"
              size="sm"
              onClick={onWidenDates}
              className="text-xs font-semibold gap-1.5 cursor-pointer"
            >
              <CalendarIcon className="size-3.5 text-primary" />
              Widen date range
            </Button>
          )}
          {onDropInterviewer && (
            <Button
              variant="outline"
              size="sm"
              onClick={onDropInterviewer}
              className="text-xs font-semibold gap-1.5 cursor-pointer"
            >
              <Users className="size-3.5 text-amber-600" />
              Drop an interviewer
            </Button>
          )}
          {dismissedCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRestoreDismissed}
              className="text-xs font-semibold gap-1.5 cursor-pointer text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="size-3.5" />
              Restore {dismissedCount} dismissed
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Slice visible suggestions (5 initially per Task 5)
  const displayedSuggestions = activeSuggestions.slice(0, visibleCount);
  const remainingCount = activeSuggestions.length - visibleCount;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Top Meta Bar: Active suggestions count & restore affordance */}
      <div className="flex items-center justify-between gap-3 px-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-foreground">
            {activeSuggestions.length}{" "}
            {activeSuggestions.length === 1 ? "suggestion" : "suggestions"}
          </span>
          <span className="text-xs text-muted-foreground">·</span>
          <span className="text-[11px] text-muted-foreground">
            Server ranked by availability &amp; candidate hours
          </span>
        </div>

        {dismissedCount > 0 && (
          <button
            type="button"
            onClick={handleRestoreDismissed}
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="size-3" />
            {dismissedCount} dismissed · Restore
          </button>
        )}
      </div>

      {/* Suggestion Cards List */}
      <div className="space-y-3">
        {displayedSuggestions.map((suggestion, index) => (
          <SuggestionCard
            key={suggestion.slotId}
            suggestion={suggestion}
            candidates={candidates}
            activeCandidateRef={activeCandidateRef}
            onAddToPlan={onAddToPlan}
            onDismiss={handleDismiss}
            isDismissing={dismissingSlotId === suggestion.slotId}
            timezone={timezone}
            isFocused={focusedIndex === index}
            shortcutNumber={index < 9 ? index + 1 : undefined}
          />
        ))}
      </div>

      {/* Progressive Disclosure - "Show {N} more" */}
      {remainingCount > 0 && (
        <div className="pt-2 text-center">
          <Button
            variant="outline"
            onClick={handleShowMore}
            className="w-full sm:w-auto px-6 text-xs font-semibold gap-2 border-dashed border-border hover:border-border/80 cursor-pointer shadow-2xs"
          >
            <ChevronDown className="size-3.5 text-muted-foreground" />
            Show {remainingCount} more
          </Button>
        </div>
      )}

      {/* Task 5: Discoverability Keyboard Hint Bar */}
      <div className="pt-3 pb-1 border-t border-border/60 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3.5 text-[11px]">
          <span className="inline-flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border text-[10px] font-semibold text-foreground shadow-2xs">1-9</kbd>
            <span>add</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border text-[10px] font-semibold text-foreground shadow-2xs">↑↓</kbd>
            <span>navigate</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border text-[10px] font-semibold text-foreground shadow-2xs">X</kbd>
            <span>dismiss</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border text-[10px] font-semibold text-foreground shadow-2xs">Tab</kbd>
            <span>switch candidate</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border text-[10px] font-semibold text-foreground shadow-2xs">⌘Z</kbd>
            <span>undo</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border text-[10px] font-semibold text-foreground shadow-2xs">C</kbd>
            <span>toggle calendar</span>
          </span>
        </div>

        {onOpenShortcutsModal && (
          <button
            type="button"
            onClick={onOpenShortcutsModal}
            className="inline-flex items-center gap-1.5 text-[11px] font-medium text-primary hover:underline cursor-pointer ml-auto"
            title="View keyboard shortcut guide (?)"
          >
            <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border text-[10px] font-semibold text-foreground shadow-2xs">?</kbd>
            <span>Shortcuts</span>
          </button>
        )}
      </div>
    </div>
  );
}
