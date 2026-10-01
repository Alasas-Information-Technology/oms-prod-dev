"use client";

import * as React from "react";
import Link from "next/link";
import { AlertCircle, ArrowRight, CheckCircle2, TrendingDown, TrendingUp, Users } from "lucide-react";
import {
  EvaluationCostSummary,
  PositionProgress,
} from "@/src/types/interview-evaluation";
import { formatAmount } from "@/lib/money";
import { cn } from "@/lib/utils";

interface EvaluationCostCardProps {
  cost: EvaluationCostSummary;
  positions?: PositionProgress;
  requestId?: string;
  amendmentId?: string;
  className?: string;
}

/**
 * Cost & Position Progress Panel Component (TASK 2 & 3 / Sections 1.6, 3.5)
 *
 * TASK 2:
 * - Approved per-candidate budget, expected annual cost, variance, status badge
 * - All amounts via lib/money.ts, exact, tabular-nums, no abbreviation
 * - Compute nothing — variance comes directly from the server
 * - WITHIN_BUDGET: variance in success tone, "Under by AED 12,000.00"
 * - OVER_BUDGET: variance in warning tone, "Over by AED 25,000.00", and panel carries warning border
 *
 * TASK 3:
 * - Beneath the cost panel: "1 of 2 positions filled."
 * - When positions.thisWouldFill === positions.required, add:
 *   "Qualifying this candidate fills the last position."
 */
export function EvaluationCostCard({
  cost,
  positions,
  requestId,
  amendmentId,
  className,
}: EvaluationCostCardProps) {
  const isOverBudget = cost.status === "OVER_BUDGET";

  // Format exact variance amount without computing arithmetic (variance is server-computed)
  const absVarianceFils = Math.abs(cost.variance);
  const formattedVarianceAmount = formatAmount(absVarianceFils);

  const varianceText = isOverBudget
    ? `Over by AED ${formattedVarianceAmount}`
    : `Under by AED ${formattedVarianceAmount}`;

  const closesRequisition =
    positions !== undefined && positions.thisWouldFill === positions.required;

  return (
    <section
      aria-labelledby="cost-panel-heading"
      className={cn(
        "bg-card border rounded-xl p-5 space-y-4 shadow-2xs transition-colors",
        isOverBudget
          ? "border-amber-500/50 bg-amber-500/5 dark:bg-amber-500/5"
          : "border-border",
        className
      )}
    >
      {/* ── Header: Cost & Status Badge ── */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <h3
          id="cost-panel-heading"
          className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
        >
          Cost
        </h3>

        <span
          className={cn(
            "text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border inline-flex items-center gap-1",
            isOverBudget
              ? "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30"
              : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
          )}
        >
          {isOverBudget ? (
            <>
              <AlertCircle className="size-3" />
              <span>Over budget</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="size-3" />
              <span>Within budget</span>
            </>
          )}
        </span>
      </div>

      {/* ── Cost Figures (exact tabular-nums, no abbreviation) ── */}
      <div className="space-y-2 text-xs">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Approved budget</span>
          <span className="tabular-nums font-medium text-foreground">
            {`AED ${formatAmount(cost.approvedBudget)}`}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Expected annual cost</span>
          <span className="tabular-nums font-medium text-foreground">
            {`AED ${formatAmount(cost.expectedAnnualCost)}`}
          </span>
        </div>

        {/* Variance row */}
        <div
          className={cn(
            "flex justify-between items-center pt-2 border-t border-border font-semibold",
            isOverBudget
              ? "text-amber-700 dark:text-amber-300"
              : "text-emerald-700 dark:text-emerald-300"
          )}
        >
          <span className="font-sans flex items-center gap-1 text-xs">
            {isOverBudget ? (
              <TrendingUp className="size-3.5" />
            ) : (
              <TrendingDown className="size-3.5" />
            )}
            Variance
          </span>
          <span className="tabular-nums text-xs">
            {varianceText}
          </span>
        </div>
      </div>

      {/* Over budget consequence notice if present */}
      {isOverBudget && cost.overBudgetConsequence && (
        <div className="p-2.5 rounded-md bg-amber-500/10 border border-amber-500/25 text-amber-900 dark:text-amber-200 text-[11px] leading-relaxed space-y-2">
          <p>{cost.overBudgetConsequence}</p>
          {amendmentId && requestId && (
            <Link
              href={`/app/requests/${requestId}/amendments/${amendmentId}`}
              className="inline-flex items-center gap-1 font-semibold text-amber-800 dark:text-amber-300 hover:underline pt-0.5"
            >
              <span>View Budget Amendment ({amendmentId})</span>
              <ArrowRight className="size-3" />
            </Link>
          )}
        </div>
      )}

      {/* ── TASK 3: Position Progress (Beneath the Cost panel) ── */}
      {positions && (
        <div className="pt-3 border-t border-border/80 flex items-start gap-2 text-xs">
          <Users className="size-3.5 mt-0.5 text-muted-foreground shrink-0" />
          <div className="text-muted-foreground leading-snug">
            <span className="font-semibold text-foreground">
              {`${positions.filled} of ${positions.required} positions filled.`}
            </span>{" "}
            {closesRequisition && (
              <span className="text-foreground font-medium">
                Qualifying this candidate fills the last position.
              </span>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
