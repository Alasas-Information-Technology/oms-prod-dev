"use client";

import * as React from "react";
import { AlertCircle } from "lucide-react";
import {
  CriterionRatingLevel,
  EvaluationCriterion,
} from "@/src/types/interview-evaluation";
import { EvaluationCriterionRow } from "./EvaluationCriterionRow";
import { cn } from "@/lib/utils";

interface EvaluationScorecardProps {
  criteria: EvaluationCriterion[];
  overallScore: number | null;
  overallAnchor: string | null;
  onRatingChange: (code: string, rating: CriterionRatingLevel) => void;
  isSaving?: boolean;
  disabled?: boolean;
  className?: string;
}

/**
 * Scorecard Component (TASK 1, 2, 3, 4, 5)
 *
 * - Renders weighted criteria rows with 5-segment rating controls and anchors.
 * - Displays server-computed overall score beneath a hairline separator.
 * - Dims previous score during autosave/saving rather than blanking it.
 * - Highlights unrated criteria visibly.
 * - ZERO arithmetic on ratings or weights.
 */
export function EvaluationScorecard({
  criteria,
  overallScore,
  overallAnchor,
  onRatingChange,
  isSaving = false,
  disabled = false,
  className,
}: EvaluationScorecardProps) {
  // Find unrated criteria without performing numeric arithmetic on ratings
  const unratedCriteria = React.useMemo(() => {
    return criteria.filter((c) => c.rating === null);
  }, [criteria]);

  return (
    <section
      aria-labelledby="scorecard-heading"
      className={cn(
        "bg-card border border-border rounded-xl p-5 sm:p-6 space-y-6 shadow-2xs transition-colors",
        className
      )}
    >
      {/* ── Scorecard Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
        <div className="space-y-0.5">
          <h3
            id="scorecard-heading"
            className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
          >
            How did they do
          </h3>
          <p className="text-xs text-muted-foreground">
            {criteria.length} weighted criteria · Rate candidate against role requirements
          </p>
        </div>

        {/* Unrated summary pill per TASK 5 */}
        {unratedCriteria.length > 0 ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
            <AlertCircle className="size-3" aria-hidden="true" />
            {unratedCriteria.length} unrated
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            All rated
          </span>
        )}
      </div>

      {/* ── Unrated Warning Banner if unrated criteria exist ── */}
      {unratedCriteria.length > 0 && (
        <div
          role="note"
          className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/25 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2"
        >
          <AlertCircle className="size-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" aria-hidden="true" />
          <div className="space-y-0.5">
            <span className="font-semibold">Unrated criteria reminder:</span>
            <p className="text-amber-800/90 dark:text-amber-300/90">
              You haven&apos;t rated{" "}
              <span className="font-medium text-foreground">
                {unratedCriteria.map((c) => c.label).join(", ")}
              </span>
              . You may submit with unrated items, but providing all ratings ensures a complete evaluation.
            </p>
          </div>
        </div>
      )}

      {/* ── Criteria Rows ── */}
      <div className="space-y-1">
        {criteria.map((crit) => (
          <EvaluationCriterionRow
            key={crit.code}
            criterion={crit}
            onRatingChange={onRatingChange}
            isSaving={isSaving}
            disabled={disabled}
          />
        ))}
      </div>

      {/* ── Overall Score Section (TASK 4): Beneath a hairline, server-computed ── */}
      <div className="pt-4 border-t border-border/80 flex items-center justify-between">
        <div className="space-y-0.5">
          <span className="text-xs uppercase tracking-wider font-bold text-muted-foreground">
            Overall Score
          </span>
          <p className="text-xs text-muted-foreground">
            Level:{" "}
            <span
              className={cn(
                "font-semibold text-foreground transition-opacity",
                isSaving ? "opacity-60" : "opacity-100"
              )}
            >
              {overallAnchor || "Above requirement"}
            </span>
          </p>
        </div>

        {/* Server score display: Dims previous value when saving per TASK 4 */}
        <div className="text-right">
          <span
            className={cn(
              "text-3xl font-extrabold text-foreground tracking-tight transition-opacity",
              isSaving ? "opacity-60" : "opacity-100"
            )}
            title={isSaving ? "Updating score with server..." : "Server-calculated overall score"}
          >
            {overallScore !== null ? `${overallScore}%` : "—"}
          </span>
          {isSaving && (
            <span className="block text-[10px] text-muted-foreground font-medium animate-pulse">
              Recalculating...
            </span>
          )}
        </div>
      </div>
    </section>
  );
}
