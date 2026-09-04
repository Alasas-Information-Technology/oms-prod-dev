"use client";

import * as React from "react";
import {
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Lock,
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

interface WeekCalendarProps {
  slots: InterviewProposedSlot[];
  onSlotsChange: (slots: InterviewProposedSlot[]) => void;
  availability: InterviewAvailability;
  interviewers: Interviewer[];
  collisions: SlotCollision[];
  candidateTimezone: string;
  isOffshore: boolean;
  defaultDurationMinutes: number;
  isReadOnly?: boolean;
}

export function WeekCalendar({
  slots,
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

  // Handlers for slot modification
  const handleAddSlot = React.useCallback(
    (newSlot: InterviewProposedSlot) => {
      onSlotsChange([...slots, newSlot]);
    },
    [onSlotsChange, slots]
  );

  const handleRemoveSlot = React.useCallback(
    (startUtc: string) => {
      onSlotsChange(slots.filter((s) => s.start !== startUtc));
    },
    [onSlotsChange, slots]
  );

  // Hook for drag-to-create & keyboard interactions
  const {
    dragState,
    keyboardCursor,
    handleCellMouseDown,
    handleCellMouseEnter,
    handleKeyDown,
  } = useSlotSelection({
    slots,
    onAddSlot: handleAddSlot,
    onRemoveSlot: handleRemoveSlot,
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
            // Overlaps if block start < busy end AND block end > busy start
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
    >
      {/* SVG Hatch Patterns (Once per calendar) */}
      <CalendarHatchPatterns />

      {/* 1. Header Toolbar (Navigation, Week Range, Today) */}
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

        <Button
          variant="outline"
          size="sm"
          onClick={handleToday}
          className="h-8 px-3 text-xs font-medium cursor-pointer"
        >
          Today
        </Button>
      </div>

      {/* 2. Disconnected Availability Banner (Task 4) */}
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
        <div className="min-w-[620px] max-h-[540px] overflow-y-auto">
          {/* Day Headers */}
          <div className="sticky top-0 z-30 grid grid-cols-[60px_repeat(5,1fr)] border-b border-border bg-card/95 backdrop-blur-xs">
            <div className="p-2 border-r border-border text-[11px] font-mono text-muted-foreground text-center">
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
                  <span className="text-[11px] font-mono text-muted-foreground">
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
                      <span className="font-mono text-[10px] text-muted-foreground/80">
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
              // Filter proposed slots belonging to this day
              const daySlots = slots.filter((s) => s.start.startsWith(dayIsoPrefix));

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
                    // Working hours: 09:00 to 17:00 GST
                    // 09:00 is min 60; 17:00 is min 540
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
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-primary text-primary-foreground text-[10px] font-bold font-mono">
                        {dragState.durationMinutes}m
                      </span>
                    </div>
                  )}

                  {/* Committed Proposed Slots Layer */}
                  {daySlots.map((slot) => {
                    const collision = collisions.find(
                      (c) => c.slotStart === slot.start
                    );
                    return (
                      <ProposedSlotCard
                        key={slot.start}
                        slot={slot}
                        collision={collision}
                        candidateTimezone={candidateTimezone}
                        isOffshore={isOffshore}
                        onRemove={handleRemoveSlot}
                        isReadOnly={isReadOnly || isPast}
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
          {/* Proposed */}
          <div className="flex items-center gap-1.5">
            <span className="size-3 rounded-xs bg-primary shrink-0" />
            <span>Proposed slot</span>
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
            <span>Outside working hours</span>
          </div>
        </div>

        <div className="text-[11px] text-muted-foreground/80">
          Click or drag to propose · Del to remove · Arrows to navigate
        </div>
      </div>
    </div>
  );
}
