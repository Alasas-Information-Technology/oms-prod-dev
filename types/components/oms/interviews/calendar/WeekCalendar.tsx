"use client";

import * as React from "react";
import {
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Lock,
  Calendar,
  Sparkles,
} from "lucide-react";
import {
  InterviewProposedSlot,
  InterviewAvailability,
  Interviewer,
  SlotCollision,
} from "@/src/types/interview-planning";
import {
  TOTAL_MINUTES,
  getWorkingWeekDays,
  formatWeekRangeHeader,
  isWeekInPast,
  minutesToUtcIso,
} from "./calendar-utils";
import { CalendarHatchPatterns } from "./CalendarHatchPatterns";
import { CalendarCell } from "./CalendarCell";
import { ProposedSlotCard } from "./ProposedSlotCard";
import { useSlotSelection } from "./useSlotSelection";
import { Button } from "@/components/ui/button";

export interface CalendarCandidateSlot {
  slot: InterviewProposedSlot;
  candidateRef: string;
  candidateIndex: number;
  candidateTimezone?: string;
  isOffshore?: boolean;
  isActiveCandidate?: boolean;
}

export interface WeekCalendarProps {
  candidateSlots?: CalendarCandidateSlot[];
  slots?: InterviewProposedSlot[];
  activeCandidateRef?: string;
  onAddSlot?: (slot: InterviewProposedSlot, candidateRef?: string) => void;
  onRemoveSlot?: (startUtc: string, candidateRef?: string) => void;
  onSlotsChange?: (slots: InterviewProposedSlot[]) => void;
  availability: InterviewAvailability;
  interviewers: Interviewer[];
  collisions: SlotCollision[];
  candidateTimezone: string;
  isOffshore: boolean;
  defaultDurationMinutes: number;
  isReadOnly?: boolean;
}

/**
 * Computes side-by-side placements for overlapping slots on the same day.
 */
function computeOverlapPlacements(slots: CalendarCandidateSlot[]) {
  if (slots.length <= 1) {
    return slots.map((s) => ({ ...s, overlapIndex: 0, overlapCount: 1 }));
  }

  // Sort chronologically
  const sorted = [...slots].sort((a, b) => a.slot.start.localeCompare(b.slot.start));
  const columns: { endMs: number; slot: CalendarCandidateSlot }[][] = [];
  const slotColMap = new Map<string, number>();

  sorted.forEach((item) => {
    const startMs = new Date(item.slot.start).getTime();
    const endMs = startMs + item.slot.durationMinutes * 60 * 1000;

    let placedCol = -1;
    for (let c = 0; c < columns.length; c++) {
      const lastInCol = columns[c][columns[c].length - 1];
      if (lastInCol.endMs <= startMs) {
        columns[c].push({ endMs, slot: item });
        placedCol = c;
        break;
      }
    }
    if (placedCol === -1) {
      columns.push([{ endMs, slot: item }]);
      placedCol = columns.length - 1;
    }
    slotColMap.set(`${item.candidateRef}-${item.slot.start}`, placedCol);
  });

  const totalCols = columns.length;
  return sorted.map((item) => ({
    ...item,
    overlapIndex: slotColMap.get(`${item.candidateRef}-${item.slot.start}`) ?? 0,
    overlapCount: totalCols,
  }));
}

export function WeekCalendar({
  candidateSlots,
  slots,
  activeCandidateRef,
  onAddSlot,
  onRemoveSlot,
  onSlotsChange,
  availability,
  interviewers,
  collisions,
  candidateTimezone,
  isOffshore,
  defaultDurationMinutes,
  isReadOnly = false,
}: WeekCalendarProps) {
  // Reference date: default to 10 Aug 2026 (matching reference fixture week)
  const [currentDate, setCurrentDate] = React.useState<Date>(() => new Date("2026-08-10T00:00:00Z"));

  const weekDays = React.useMemo(() => getWorkingWeekDays(currentDate), [currentDate]);
  const isPast = React.useMemo(() => isWeekInPast(weekDays), [weekDays]);
  const weekTitle = React.useMemo(() => formatWeekRangeHeader(weekDays), [weekDays]);

  // Merge candidate slots or fallback to single candidate slots
  const effectiveCandidateSlots = React.useMemo<CalendarCandidateSlot[]>(() => {
    if (candidateSlots && candidateSlots.length > 0) {
      return candidateSlots;
    }
    return (slots || []).map((s) => ({
      slot: s,
      candidateRef: activeCandidateRef || "C-001",
      candidateIndex: 0,
      candidateTimezone,
      isOffshore,
      isActiveCandidate: true,
    }));
  }, [candidateSlots, slots, activeCandidateRef, candidateTimezone, isOffshore]);

  const allRawSlots = React.useMemo(
    () => effectiveCandidateSlots.map((cs) => cs.slot),
    [effectiveCandidateSlots]
  );

  // Handlers for slot modification
  const handleAddSlot = React.useCallback(
    (newSlot: InterviewProposedSlot) => {
      if (onAddSlot) {
        onAddSlot(newSlot, activeCandidateRef);
      } else if (onSlotsChange && slots) {
        onSlotsChange([...slots, newSlot]);
      }
    },
    [onAddSlot, onSlotsChange, slots, activeCandidateRef]
  );

  const handleRemoveSlot = React.useCallback(
    (startUtc: string, candidateRef?: string) => {
      if (onRemoveSlot) {
        onRemoveSlot(startUtc, candidateRef || activeCandidateRef);
      } else if (onSlotsChange && slots) {
        onSlotsChange(slots.filter((s) => s.start !== startUtc));
      }
    },
    [onRemoveSlot, onSlotsChange, slots, activeCandidateRef]
  );

  // Hook for drag-to-create & keyboard interactions
  const {
    dragState,
    keyboardCursor,
    handleCellMouseDown,
    handleCellMouseEnter,
    handleKeyDown,
  } = useSlotSelection({
    slots: allRawSlots,
    onAddSlot: handleAddSlot,
    onRemoveSlot: (startUtc) => handleRemoveSlot(startUtc),
    defaultDurationMinutes,
    weekDays,
    isReadOnly: isReadOnly || isPast,
  });

  // Week navigation handlers
  const handlePrevWeek = () => {
    setCurrentDate((prev) => {
      const next = new Date(prev);
      next.setDate(prev.getDate() - 7);
      return next;
    });
  };

  const handleNextWeek = () => {
    setCurrentDate((prev) => {
      const next = new Date(prev);
      next.setDate(prev.getDate() + 7);
      return next;
    });
  };

  const handleToday = () => {
    setCurrentDate(new Date("2026-08-10T00:00:00Z"));
  };

  // Pre-calculate busy interviewers per 30-minute block across the 5 days
  // Key format: `${dayIndex}-${minutesFrom8am}`
  const busyMap = React.useMemo(() => {
    const map = new Map<string, Interviewer[]>();
    if (!availability.connected || !availability.busy) return map;

    weekDays.forEach((day, dayIndex) => {
      for (let min = 0; min < TOTAL_MINUTES; min += 30) {
        const slotStartUtc = new Date(minutesToUtcIso(day, min));
        const slotEndUtc = new Date(slotStartUtc.getTime() + 30 * 60 * 1000);

        const busyForBlock = interviewers.filter((interviewer) => {
          return availability.busy.some((b) => {
            if (b.userId !== interviewer.userId) return false;
            const bStart = new Date(b.from);
            const bEnd = new Date(b.to);
            return slotStartUtc < bEnd && slotEndUtc > bStart;
          });
        });

        map.set(`${dayIndex}-${min}`, busyForBlock);
      }
    });

    return map;
  }, [availability.busy, availability.connected, interviewers, weekDays]);

  // 24 half-hour intervals (08:00 to 20:00)
  const timeRows = React.useMemo(() => {
    const rows = [];
    for (let min = 0; min < TOTAL_MINUTES; min += 30) {
      rows.push(min);
    }
    return rows;
  }, []);

  return (
    <div
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className="rounded-xl border border-border bg-card shadow-xs overflow-hidden focus:outline-none focus:ring-1 focus:ring-primary/40"
      aria-label="Interactive Interview Planning Calendar"
    >
      {/* SVG Hatch Patterns (Once per calendar) */}
      <CalendarHatchPatterns />

      {/* 1. Header Toolbar (Navigation, Week Range, Today, Active Candidate Context) */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-border bg-muted/20">
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg border border-border bg-background p-0.5 shadow-2xs">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePrevWeek}
              className="size-7 p-0 text-muted-foreground hover:text-foreground cursor-pointer"
              title="Previous week"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNextWeek}
              className="size-7 p-0 text-muted-foreground hover:text-foreground cursor-pointer"
              title="Next week"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>

          <h2 className="text-sm font-semibold text-foreground tracking-tight">
            {weekTitle}
          </h2>

          {isPast && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground px-2 py-0.5 rounded-full bg-muted border border-border">
              <Lock className="size-3" />
              Past week (Read-only)
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {activeCandidateRef && (
            <span className="text-[11px] text-muted-foreground hidden sm:inline-flex items-center gap-1.5">
              <span>Proposing for:</span>
              <strong className="text-foreground font-bold px-1.5 py-0.5 rounded bg-muted border border-border text-[10px]">
                {activeCandidateRef}
              </strong>
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleToday}
            className="h-8 px-3 text-xs font-medium cursor-pointer"
          >
            Today
          </Button>
        </div>
      </div>

      {/* 2. Disconnected Availability Banner (UI §3.2) */}
      {!availability.connected && (
        <div className="mx-4 mt-3.5 p-3 rounded-lg border border-amber-300 dark:border-amber-700/60 bg-amber-50/90 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-2.5">
          <AlertCircle className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <span>
            <strong>Interviewer availability isn&apos;t connected.</strong> Check with them before proposing.
          </span>
        </div>
      )}

      {/* 3. Calendar Grid (08:00 to 20:00 GST with scroll) */}
      <div className="overflow-x-auto">
        <div className="min-w-[640px] max-h-[540px] overflow-y-auto overscroll-contain">
          {/* Day Headers */}
          <div className="sticky top-0 z-30 grid grid-cols-[60px_repeat(5,1fr)] border-b border-border bg-card/95 backdrop-blur-xs">
            <div className="p-2 border-r border-border text-[11px] text-muted-foreground text-center">
              GST
            </div>
            {weekDays.map((day) => {
              const weekday = new Intl.DateTimeFormat("en-GB", { weekday: "short" }).format(day);
              const dayNum = day.getDate();
              return (
                <div
                  key={day.toISOString()}
                  className="p-2 border-r border-border/60 last:border-r-0 text-center"
                >
                  <span className="text-xs font-semibold text-foreground block">
                    {weekday}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {dayNum}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Grid Body */}
          <div className="grid grid-cols-[60px_repeat(5,1fr)] relative">
            {/* Time Gutter (Left) */}
            <div className="border-r border-border select-none">
              {timeRows.map((min) => {
                const isHour = min % 60 === 0;
                const hour = 8 + Math.floor(min / 60);
                return (
                  <div
                    key={`time-${min}`}
                    className="h-7 border-b border-border/30 px-1 text-right flex items-center justify-end"
                  >
                    {isHour && (
                      <span className="text-[10px] text-muted-foreground/80">
                        {String(hour).padStart(2, "0")}:00
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* 5 Day Columns */}
            {weekDays.map((day, dayIndex) => {
              const dayIsoPrefix = day.toISOString().split("T")[0];

              // Filter all candidates' slots belonging to this day
              const dayCandidateSlots = effectiveCandidateSlots.filter((cs) =>
                cs.slot.start.startsWith(dayIsoPrefix)
              );

              // Calculate overlap placements for side-by-side display
              const placedSlots = computeOverlapPlacements(dayCandidateSlots);

              // Active drag on this column?
              const isDraggingOnThisCol =
                dragState?.isDragging && dragState.dayIndex === dayIndex;

              return (
                <div
                  key={day.toISOString()}
                  data-day-index={dayIndex}
                  className="relative border-r border-border/50 last:border-r-0"
                >
                  {/* 24 Half-Hour Cells */}
                  {timeRows.map((min) => {
                    const isOutsideWorkingHours = min < 60 || min >= 540;
                    const busyList = busyMap.get(`${dayIndex}-${min}`) || [];
                    const isFocused =
                      keyboardCursor.dayIndex === dayIndex &&
                      keyboardCursor.minutesFrom8am === min;

                    return (
                      <CalendarCell
                        key={`${dayIndex}-${min}`}
                        minutesFrom8am={min}
                        isOutsideWorkingHours={isOutsideWorkingHours}
                        busyInterviewers={busyList}
                        isConnected={availability.connected}
                        isPastWeek={isPast}
                        isFocused={isFocused}
                        onMouseDown={() => handleCellMouseDown(dayIndex, min)}
                        onMouseEnter={() => handleCellMouseEnter(dayIndex, min)}
                      />
                    );
                  })}

                  {/* Drag Preview Layer (During active drag) */}
                  {isDraggingOnThisCol && dragState && (
                    <div
                      style={{
                        top: `${(dragState.startMinutes / TOTAL_MINUTES) * 100}%`,
                        height: `${(dragState.durationMinutes / TOTAL_MINUTES) * 100}%`,
                      }}
                      className="absolute inset-x-1 z-25 rounded-md bg-primary/25 border-2 border-primary border-dashed pointer-events-none p-1 flex items-start justify-between shadow-xs transition-all"
                    >
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-primary text-primary-foreground text-[10px] font-bold">
                        {dragState.durationMinutes}m
                      </span>
                    </div>
                  )}

                  {/* Committed Proposed Slots Layer with Candidate Identity Colours */}
                  {placedSlots.map((item) => {
                    const collision = collisions.find(
                      (c) => c.slotStart === item.slot.start
                    );
                    return (
                      <ProposedSlotCard
                        key={`${item.candidateRef}-${item.slot.start}`}
                        slot={item.slot}
                        candidateRef={item.candidateRef}
                        candidateIndex={item.candidateIndex}
                        candidateTimezone={item.candidateTimezone || candidateTimezone}
                        isOffshore={item.isOffshore ?? isOffshore}
                        isActiveCandidate={item.candidateRef === activeCandidateRef}
                        collision={collision}
                        onRemove={(startUtc, cRef) => handleRemoveSlot(startUtc, cRef)}
                        isReadOnly={isReadOnly || isPast}
                        overlapIndex={item.overlapIndex}
                        overlapCount={item.overlapCount}
                      />
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. Legend & Instructions Footer */}
      <div className="p-3.5 border-t border-border bg-muted/20 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
        <div className="flex flex-wrap items-center gap-4 text-[11px]">
          {/* Candidate identity indicator */}
          <div className="flex items-center gap-1.5">
            <span className="size-3 rounded-xs border-l-2 border-l-violet-600 bg-violet-500/20 shrink-0" />
            <span>Candidate slots (tinted by hue)</span>
          </div>

          {/* 1 Busy */}
          <div className="flex items-center gap-1.5">
            <span className="size-3 rounded-xs border border-border bg-card relative overflow-hidden shrink-0">
              <svg className="absolute inset-0 size-full" aria-hidden="true">
                <rect width="100%" height="100%" fill="url(#hatch-one-busy)" />
              </svg>
            </span>
            <span>1 busy</span>
          </div>

          {/* 2+ Busy */}
          <div className="flex items-center gap-1.5">
            <span className="size-3 rounded-xs border border-border bg-card relative overflow-hidden shrink-0">
              <svg className="absolute inset-0 size-full" aria-hidden="true">
                <rect width="100%" height="100%" fill="url(#hatch-two-busy)" />
              </svg>
            </span>
            <span>2+ busy</span>
          </div>

          {/* Free */}
          <div className="flex items-center gap-1.5">
            <span className="size-3 rounded-xs border border-border bg-card shrink-0" />
            <span>All free</span>
          </div>

          {/* Outside hours */}
          <div className="flex items-center gap-1.5">
            <span className="size-3 rounded-xs bg-muted/60 border border-border/60 shrink-0" />
            <span>Outside hours</span>
          </div>
        </div>

        <div className="text-[11px] text-muted-foreground/80 flex items-center gap-2">
          <span>Click/drag to propose · Press <kbd className="px-1 py-0.2 rounded bg-muted border text-[9.5px]">C</kbd> to toggle view</span>
        </div>
      </div>
    </div>
  );
}
