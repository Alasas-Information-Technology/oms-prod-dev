"use client";

import * as React from "react";
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Calendar,
  ShieldCheck,
} from "lucide-react";
import {
  EvaluationCostSummary,
  RejectionReason,
  RejectionReasonCode,
} from "@/src/types/interview-evaluation";
import { formatAmount } from "@/lib/money";
import { cn } from "@/lib/utils";

interface EvaluationOutcomePanelProps {
  isMainInterviewer: boolean;
  selectedOutcome: "QUALIFY" | "REJECT" | null;
  onSelectOutcome: (outcome: "QUALIFY" | "REJECT") => void;
  selectedRejectionReasonCode: RejectionReasonCode | null;
  onSelectRejectionReason: (code: RejectionReasonCode) => void;
  cost: EvaluationCostSummary;
  rejectionReasons: RejectionReason[];
  disabled?: boolean;
  className?: string;
}

/**
 * Outcome Panel Component (TASK 1, 2, 6 / Sections 1.1, 3.6, Part 5)
 *
 * TASK 1:
 * - Two radio cards: QUALIFY and REJECT.
 * - QUALIFY consequence DEPENDS ON BUDGET:
 *   - WITHIN_BUDGET: "Procurement will be told to begin onboarding."
 *   - OVER_BUDGET: "This is AED 25,000.00 over the approved budget. Qualifying starts a Budget Amendment, which needs Finance approval before onboarding can begin."
 *   - Reads from cost.status; does NOT hardcode the within-budget wording.
 *
 * TASK 2:
 * - Selecting Reject reveals three radio cards from rejectionReasons.
 * - Each shows its label AND its retentionConsequence with actual deletion date.
 * - Submit is BLOCKED until a reason is selected, with the reason stated.
 *
 * TASK 6:
 * - When isMainInterviewer is false, this section is completely ABSENT from the DOM.
 */
export function EvaluationOutcomePanel({
  isMainInterviewer,
  selectedOutcome,
  onSelectOutcome,
  selectedRejectionReasonCode,
  onSelectRejectionReason,
  cost,
  rejectionReasons,
  disabled = false,
  className,
}: EvaluationOutcomePanelProps) {
  // TASK 6: Non-main interviewers cannot decide outcome -> section is absent from DOM
  if (!isMainInterviewer) {
    return null;
  }

  const isOverBudget = cost.status === "OVER_BUDGET";

  // Dynamic qualify consequence based on live budget status
  const qualifyConsequence = isOverBudget
    ? cost.overBudgetConsequence ||
      `This is AED ${formatAmount(
        Math.abs(cost.variance)
      )} over the approved budget. Qualifying starts a Budget Amendment, which needs Finance approval before onboarding can begin.`
    : "Procurement will be told to begin onboarding.";

  return (
    <section
      aria-labelledby="outcome-panel-heading"
      className={cn(
        "bg-card border border-border rounded-xl p-5 space-y-4 shadow-2xs transition-colors",
        className
      )}
    >
      {/* ── Section Header ── */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="space-y-0.5">
          <h3
            id="outcome-panel-heading"
            className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
          >
            Hiring outcome decision
          </h3>
          <p className="text-xs text-muted-foreground">
            Main Interviewer binding authority (RFP Step 1)
          </p>
        </div>

        {selectedOutcome && (
          <span
            className={cn(
              "text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border tracking-wider",
              selectedOutcome === "QUALIFY"
                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                : "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30"
            )}
          >
            {selectedOutcome === "QUALIFY" ? "Qualify" : "Reject"}
          </span>
        )}
      </div>

      {/* ── TASK 1: Two Radio Cards (Qualify & Reject) ── */}
      <div
        role="radiogroup"
        aria-label="Candidate hiring outcome"
        className="space-y-3"
      >
        {/* Card 1: QUALIFY */}
        <div
          role="radio"
          aria-checked={selectedOutcome === "QUALIFY"}
          tabIndex={disabled ? -1 : 0}
          onClick={() => {
            if (!disabled) onSelectOutcome("QUALIFY");
          }}
          onKeyDown={(e) => {
            if (!disabled && (e.key === " " || e.key === "Enter")) {
              e.preventDefault();
              onSelectOutcome("QUALIFY");
            }
          }}
          className={cn(
            "p-3.5 rounded-lg border text-xs cursor-pointer transition-all flex items-start gap-3",
            selectedOutcome === "QUALIFY"
              ? "border-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/10 shadow-xs ring-1 ring-emerald-500/40"
              : "border-border bg-background hover:bg-muted/40 hover:border-border/80",
            disabled && "cursor-not-allowed opacity-50"
          )}
        >
          {/* Radio Indicator */}
          <div
            className={cn(
              "size-4 rounded-full border shrink-0 mt-0.5 flex items-center justify-center transition-colors",
              selectedOutcome === "QUALIFY"
                ? "border-emerald-600 dark:border-emerald-400 bg-emerald-600 dark:bg-emerald-500"
                : "border-muted-foreground/60"
            )}
          >
            {selectedOutcome === "QUALIFY" && (
              <div className="size-1.5 rounded-full bg-white dark:bg-black" />
            )}
          </div>

          <div className="space-y-1 flex-1">
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                Qualify candidate
              </span>

              {isOverBudget && (
                <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 uppercase px-1.5 py-0.2 rounded bg-amber-500/15 border border-amber-500/30">
                  Budget amendment required
                </span>
              )}
            </div>

            {/* Dynamic consequence text depending on budget status */}
            <p
              className={cn(
                "text-xs leading-relaxed",
                isOverBudget
                  ? "text-amber-800 dark:text-amber-200 font-medium"
                  : "text-muted-foreground"
              )}
            >
              {qualifyConsequence}
            </p>
          </div>
        </div>

        {/* Card 2: REJECT */}
        <div
          role="radio"
          aria-checked={selectedOutcome === "REJECT"}
          tabIndex={disabled ? -1 : 0}
          onClick={() => {
            if (!disabled) onSelectOutcome("REJECT");
          }}
          onKeyDown={(e) => {
            if (!disabled && (e.key === " " || e.key === "Enter")) {
              e.preventDefault();
              onSelectOutcome("REJECT");
            }
          }}
          className={cn(
            "p-3.5 rounded-lg border text-xs cursor-pointer transition-all flex items-start gap-3",
            selectedOutcome === "REJECT"
              ? "border-rose-500 bg-rose-500/10 dark:bg-rose-500/10 shadow-xs ring-1 ring-rose-500/40"
              : "border-border bg-background hover:bg-muted/40 hover:border-border/80",
            disabled && "cursor-not-allowed opacity-50"
          )}
        >
          {/* Radio Indicator */}
          <div
            className={cn(
              "size-4 rounded-full border shrink-0 mt-0.5 flex items-center justify-center transition-colors",
              selectedOutcome === "REJECT"
                ? "border-rose-600 dark:border-rose-400 bg-rose-600 dark:bg-rose-500"
                : "border-muted-foreground/60"
            )}
          >
            {selectedOutcome === "REJECT" && (
              <div className="size-1.5 rounded-full bg-white dark:bg-black" />
            )}
          </div>

          <div className="space-y-1 flex-1">
            <span className="font-semibold text-foreground flex items-center gap-1.5">
              <XCircle className="size-3.5 text-rose-600 dark:text-rose-400" />
              Reject candidate
            </span>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Candidate does not meet requirements. A statutory retention reason and written observations are required under UAE PDPL.
            </p>
          </div>
        </div>
      </div>

      {/* ── TASK 2: Rejection Reasons — REQUIRED when outcome is REJECT ── */}
      {selectedOutcome === "REJECT" && (
        <div className="pt-3 border-t border-border space-y-3 animate-in fade-in-50 slide-in-from-top-1 duration-200">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <ShieldCheck className="size-3.5 text-primary" />
              <span>Retention reason code (Mandatory)</span>
            </label>
            {!selectedRejectionReasonCode && (
              <span className="text-[11px] font-bold text-destructive animate-pulse flex items-center gap-1">
                <AlertCircle className="size-3" />
                Required to submit
              </span>
            )}
          </div>

          <div
            role="radiogroup"
            aria-label="Rejection retention reason"
            className="space-y-2"
          >
            {rejectionReasons.map((reason) => {
              const isSelected = selectedRejectionReasonCode === reason.code;

              return (
                <div
                  key={reason.code}
                  role="radio"
                  aria-checked={isSelected}
                  tabIndex={disabled ? -1 : 0}
                  onClick={() => {
                    if (!disabled) onSelectRejectionReason(reason.code);
                  }}
                  onKeyDown={(e) => {
                    if (!disabled && (e.key === " " || e.key === "Enter")) {
                      e.preventDefault();
                      onSelectRejectionReason(reason.code);
                    }
                  }}
                  className={cn(
                    "p-3 rounded-lg border text-xs cursor-pointer transition-all flex items-start gap-2.5",
                    isSelected
                      ? "border-rose-500 bg-rose-500/15 dark:bg-rose-500/15 shadow-2xs ring-1 ring-rose-500/30"
                      : "border-border bg-background hover:bg-muted/30",
                    disabled && "cursor-not-allowed opacity-50"
                  )}
                >
                  <div
                    className={cn(
                      "size-3.5 rounded-full border shrink-0 mt-0.5 flex items-center justify-center transition-colors",
                      isSelected
                        ? "border-rose-600 bg-rose-600 dark:border-rose-400 dark:bg-rose-400"
                        : "border-muted-foreground/60"
                    )}
                  >
                    {isSelected && (
                      <div className="size-1 rounded-full bg-white dark:bg-black" />
                    )}
                  </div>

                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="font-semibold text-foreground">
                        {reason.label}
                      </span>
                      {reason.deletionDate && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-muted/80 text-muted-foreground border border-border shrink-0 flex items-center gap-1">
                          <Calendar className="size-2.5" />
                          Deletion: {reason.deletionDate}
                        </span>
                      )}
                    </div>

                    {/* Retention consequence stating plain language action */}
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      {reason.retentionConsequence}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Warning text when reject selected but no reason chosen */}
          {!selectedRejectionReasonCode && (
            <p className="text-[11px] text-destructive bg-destructive/10 p-2 rounded-md border border-destructive/20 leading-relaxed">
              ⚠️ A rejection without a reason code leaves the CV in an undefined retention state. Select one of the statutory retention reasons above to enable submission.
            </p>
          )}
        </div>
      )}
    </section>
  );
}
