"use client";

import * as React from "react";
import {
  CriterionRatingLevel,
  EvaluationCriterion,
} from "@/src/types/interview-evaluation";
import { cn } from "@/lib/utils";

interface EvaluationCriterionRowProps {
  criterion: EvaluationCriterion;
  onRatingChange: (code: string, rating: CriterionRatingLevel) => void;
  isSaving?: boolean;
  disabled?: boolean;
}

const RATING_LEVELS: CriterionRatingLevel[] = [1, 2, 3, 4, 5];

const LEVEL_PREV: Record<CriterionRatingLevel, CriterionRatingLevel> = {
  1: 1,
  2: 1,
  3: 2,
  4: 3,
  5: 4,
};

const LEVEL_NEXT: Record<CriterionRatingLevel, CriterionRatingLevel> = {
  1: 2,
  2: 3,
  3: 4,
  4: 5,
  5: 5,
};

/**
 * Criterion Row Component (TASK 1, 2, 3)
 *
 * Left: criterion label at 14px/500, weight at 12px muted, e.g. "25%"
 * Centre: five-segment rating control (minimum 40x40px per segment)
 * Right: anchor label for the selected (or hovered) rating at 13px
 *
 * Keyboard: Arrow keys move, 1-5 set directly.
 * Accessible name combines criterion, rating, and anchor.
 * Zero client-side arithmetic on ratings.
 */
export function EvaluationCriterionRow({
  criterion,
  onRatingChange,
  isSaving = false,
  disabled = false,
}: EvaluationCriterionRowProps) {
  const [hoveredRating, setHoveredRating] = React.useState<CriterionRatingLevel | null>(null);

  // Active anchor displayed on the right: hovered takes precedence over selected
  const displayAnchor = React.useMemo(() => {
    if (hoveredRating !== null) {
      return {
        text: criterion.anchors[hoveredRating],
        isPreview: true,
      };
    }
    if (criterion.rating !== null) {
      return {
        text: criterion.anchors[criterion.rating],
        isPreview: false,
      };
    }
    return {
      text: "Not rated",
      isPreview: false,
    };
  }, [hoveredRating, criterion.rating, criterion.anchors]);

  // Handle keyboard navigation: Arrow keys move, 1-5 set directly
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLButtonElement>,
    currentLevel: CriterionRatingLevel
  ) => {
    if (disabled) return;

    // Keys 1 through 5 set directly
    if (["1", "2", "3", "4", "5"].includes(e.key)) {
      e.preventDefault();
      const directRating = parseInt(e.key, 10) as CriterionRatingLevel;
      onRatingChange(criterion.code, directRating);
      return;
    }

    // Arrow Left / Up -> decrement level via lookup
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      const baseLevel = criterion.rating ?? currentLevel;
      onRatingChange(criterion.code, LEVEL_PREV[baseLevel]);
      return;
    }

    // Arrow Right / Down -> increment level via lookup
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      const baseLevel = criterion.rating ?? currentLevel;
      onRatingChange(criterion.code, LEVEL_NEXT[baseLevel]);
      return;
    }

    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onRatingChange(criterion.code, currentLevel);
    }
  };

  return (
    <div
      className={cn(
        "py-4 first:pt-1 last:pb-1 flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-border/60 last:border-b-0 transition-opacity",
        isSaving && "opacity-75"
      )}
    >
      {/* ── Left Column: Criterion label (14px/500) & Weight (12px muted) ── */}
      <div className="md:w-64 shrink-0 space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[14px] font-medium text-foreground leading-snug">
            {criterion.label}
          </span>
          {/* Weight beside every criterion per TASK 1 */}
          <span className="text-[12px] text-muted-foreground font-medium px-1.5 py-0.5 rounded bg-muted/60">
            {`${criterion.weightPercent}%`}
          </span>
        </div>

        {/* Visibly mark unrated criteria per TASK 5 */}
        {criterion.rating === null && (
          <div className="flex items-center gap-1.5 pt-0.5">
            <span
              aria-hidden="true"
              className="size-1.5 rounded-full bg-amber-500 animate-pulse"
            />
            <span className="text-[11px] font-medium text-amber-700 dark:text-amber-400">
              Unrated
            </span>
          </div>
        )}
      </div>

      {/* ── Centre Column: 5-Segment Rating Control (minimum 40x40px per segment) ── */}
      <div
        role="radiogroup"
        aria-label={`${criterion.label} rating`}
        className="inline-flex items-center p-1 rounded-lg bg-muted/40 border border-border/80 gap-1 self-start md:self-auto"
      >
        {RATING_LEVELS.map((lvl) => {
          const isSelected = criterion.rating === lvl;
          const anchorForLevel = criterion.anchors[lvl];

          return (
            <button
              key={lvl}
              type="button"
              role="radio"
              aria-checked={isSelected}
              tabIndex={
                isSelected || (criterion.rating === null && lvl === 1) ? 0 : -1
              }
              disabled={disabled}
              // Combined accessible name: criterion + level + anchor per TASK 2
              aria-label={`${criterion.label}, ${lvl}, ${anchorForLevel}`}
              onClick={() => onRatingChange(criterion.code, lvl)}
              onMouseEnter={() => setHoveredRating(lvl)}
              onMouseLeave={() => setHoveredRating(null)}
              onKeyDown={(e) => handleKeyDown(e, lvl)}
              className={cn(
                // Strict requirement: Minimum 40x40px targets per segment
                "min-w-[40px] min-h-[40px] w-10 h-10 rounded-md flex items-center justify-center text-sm font-semibold transition-all select-none cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/40",
                isSelected
                  ? "bg-primary text-primary-foreground font-bold shadow-xs scale-[1.02]"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/80",
                disabled && "cursor-not-allowed opacity-50"
              )}
            >
              {lvl}
            </button>
          );
        })}
      </div>

      {/* ── Right Column: Anchor label for selected/hovered rating (13px) ── */}
      <div className="md:w-56 text-left md:text-right shrink-0">
        <span
          className={cn(
            "text-[13px] transition-colors leading-tight block",
            displayAnchor.isPreview
              ? "text-primary font-medium italic"
              : criterion.rating !== null
              ? "text-foreground font-medium"
              : "text-muted-foreground/70 italic"
          )}
        >
          {displayAnchor.text}
        </span>
      </div>
    </div>
  );
}
