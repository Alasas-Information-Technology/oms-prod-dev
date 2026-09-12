"use client";

import * as React from "react";
import { InterviewProposedSlot } from "@/src/types/interview-planning";
import {
  CALENDAR_START_HOUR,
  CALENDAR_END_HOUR,
  minutesToUtcIso,
  utcIsoToMinutesFrom8am,
} from "./calendar-utils";

export interface DragState {
  isDragging: boolean;
  dayIndex: number;
  startMinutes: number;
  currentMinutes: number;
  durationMinutes: number;
}

interface UseSlotSelectionProps {
  slots: InterviewProposedSlot[];
  onAddSlot: (slot: InterviewProposedSlot) => void;
  onRemoveSlot: (startUtc: string) => void;
  defaultDurationMinutes: number;
  weekDays: Date[];
  isReadOnly?: boolean;
}

export function useSlotSelection({
  slots,
  onAddSlot,
  onRemoveSlot,
  defaultDurationMinutes,
  weekDays,
  isReadOnly = false,
}: UseSlotSelectionProps) {
  const [dragState, setDragState] = React.useState<DragState | null>(null);

  // Keyboard navigation cursor (dayIndex: 0-4, minutesFrom8am: 0-690)
  const [keyboardCursor, setKeyboardCursor] = React.useState<{
    dayIndex: number;
    minutesFrom8am: number;
  }>({
    dayIndex: 0,
    minutesFrom8am: 60, // 09:00 GST
  });

  const isDraggingRef = React.useRef(false);

  const handleCellMouseDown = React.useCallback(
    (dayIndex: number, minutesFrom8am: number) => {
      if (isReadOnly) return;
      isDraggingRef.current = true;
      setKeyboardCursor({ dayIndex, minutesFrom8am });
      setDragState({
        isDragging: true,
        dayIndex,
        startMinutes: minutesFrom8am,
        currentMinutes: minutesFrom8am + defaultDurationMinutes,
        durationMinutes: defaultDurationMinutes,
      });
    },
    [defaultDurationMinutes, isReadOnly]
  );

  const handleCellMouseEnter = React.useCallback(
    (dayIndex: number, minutesFrom8am: number) => {
      if (!isDraggingRef.current || !dragState || dayIndex !== dragState.dayIndex) {
        return;
      }

      // Calculate dragged distance, snapping to 15 minutes
      const rawEnd = minutesFrom8am + 30;
      const rawDuration = Math.max(15, rawEnd - dragState.startMinutes);
      const snappedDuration = Math.max(15, Math.round(rawDuration / 15) * 15);

      setDragState((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          currentMinutes: prev.startMinutes + snappedDuration,
          durationMinutes: snappedDuration,
        };
      });
    },
    [dragState]
  );

  const handleMouseUp = React.useCallback(() => {
    if (!isDraggingRef.current || !dragState) {
      isDraggingRef.current = false;
      setDragState(null);
      return;
    }

    isDraggingRef.current = false;

    // Check bounds
    const targetDay = weekDays[dragState.dayIndex];
    if (targetDay) {
      const finalDuration = Math.max(15, dragState.durationMinutes);
      // Ensure start + duration <= 720 (20:00 GST)
      const validDuration = Math.min(finalDuration, 720 - dragState.startMinutes);
      const startUtcIso = minutesToUtcIso(targetDay, dragState.startMinutes);

      // Check if slot already exists
      const existing = slots.find((s) => s.start === startUtcIso);
      if (!existing) {
        onAddSlot({
          start: startUtcIso,
          durationMinutes: validDuration,
        });
      }
    }

    setDragState(null);
  }, [dragState, onAddSlot, slots, weekDays]);

  // Global mouseup listener so dragging outside the calendar container completes cleanly
  React.useEffect(() => {
    const onWindowMouseUp = () => {
      if (isDraggingRef.current) {
        handleMouseUp();
      }
    };
    window.addEventListener("mouseup", onWindowMouseUp);
    return () => window.removeEventListener("mouseup", onWindowMouseUp);
  }, [handleMouseUp]);

  // Keyboard navigation handler
  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (isReadOnly) return;

      const maxMinutes = (CALENDAR_END_HOUR - CALENDAR_START_HOUR) * 60 - 30; // 690

      switch (e.key) {
        case "ArrowUp":
          e.preventDefault();
          setKeyboardCursor((prev) => ({
            ...prev,
            minutesFrom8am: Math.max(0, prev.minutesFrom8am - 30),
          }));
          break;
        case "ArrowDown":
          e.preventDefault();
          setKeyboardCursor((prev) => ({
            ...prev,
            minutesFrom8am: Math.min(maxMinutes, prev.minutesFrom8am + 30),
          }));
          break;
        case "ArrowLeft":
          e.preventDefault();
          setKeyboardCursor((prev) => ({
            ...prev,
            dayIndex: Math.max(0, prev.dayIndex - 1),
          }));
          break;
        case "ArrowRight":
          e.preventDefault();
          setKeyboardCursor((prev) => ({
            ...prev,
            dayIndex: Math.min(weekDays.length - 1, prev.dayIndex + 1),
          }));
          break;
        case "Enter":
        case " ": {
          e.preventDefault();
          const targetDay = weekDays[keyboardCursor.dayIndex];
          if (targetDay) {
            const startUtcIso = minutesToUtcIso(
              targetDay,
              keyboardCursor.minutesFrom8am
            );
            const existing = slots.find((s) => s.start === startUtcIso);
            if (!existing) {
              onAddSlot({
                start: startUtcIso,
                durationMinutes: defaultDurationMinutes,
              });
            }
          }
          break;
        }
        case "Delete":
        case "Backspace": {
          e.preventDefault();
          const targetDay = weekDays[keyboardCursor.dayIndex];
          if (targetDay) {
            const cursorStartUtcIso = minutesToUtcIso(
              targetDay,
              keyboardCursor.minutesFrom8am
            );
            // Check if any slot starts at this exact cell or spans it
            const matched = slots.find((s) => {
              const slotMins = utcIsoToMinutesFrom8am(s.start);
              return (
                s.start.split("T")[0] === cursorStartUtcIso.split("T")[0] &&
                Math.abs(slotMins - keyboardCursor.minutesFrom8am) < 30
              );
            });
            if (matched) {
              onRemoveSlot(matched.start);
            }
          }
          break;
        }
      }
    },
    [
      defaultDurationMinutes,
      isReadOnly,
      keyboardCursor,
      onAddSlot,
      onRemoveSlot,
      slots,
      weekDays,
    ]
  );

  return {
    dragState,
    keyboardCursor,
    handleCellMouseDown,
    handleCellMouseEnter,
    handleKeyDown,
  };
}
