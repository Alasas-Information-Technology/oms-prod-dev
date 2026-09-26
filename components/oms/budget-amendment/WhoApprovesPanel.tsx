"use client";

import * as React from "react";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { ReapprovalRoute } from "@/components/oms/clarification/ReapprovalRoute";
import { FundStateBadge } from "@/components/budget/FundStateBadge";
import { ReapprovalRouteStep } from "@/src/types/budget-amendment";
import { cn } from "@/lib/utils";

export interface WhoApprovesPanelProps {
  reapprovalRoute: ReapprovalRouteStep[];
  candidateRef: string;
  cancelConsequence?: string;
  genericRejectionConsequence?: string;
  className?: string;
}

/**
 * Who Approves Panel per BUDGET-AMENDMENT-UI.md 1.2, 1.5, 3.4, 3.5 & BA5:
 *
 * TASK 1: Reuses existing ReapprovalRoute component.
 *         Variable-length, names approvers, dynamically extended with HR -> Finance branch when Unbudgeted.
 *
 * TASK 2: Renders EVERY stage's rejectionConsequence beneath the route.
 *         Falls back to genericRejectionConsequence from API if missing.
 *
 * TASK 3: Reuses "Reserved -> Locked & Allocated" pill-and-arrow pattern with FundStateBadge.
 *
 * TASK 4: Cancellation consequence quiet note.
 */
export function WhoApprovesPanel({
  reapprovalRoute,
  candidateRef,
  cancelConsequence = "Cancelling reverts Candidate to Qualified, pending budget. No funds are moved.",
  genericRejectionConsequence = "A rejection at any stage closes this candidate's path and releases reserved funds.",
  className,
}: WhoApprovesPanelProps) {
  return (
    <aside
      aria-labelledby="panel-approval-title"
      className={cn(
        "rounded-lg border border-border bg-card p-5 space-y-6 shadow-xs transition-all",
        className
      )}
    >
      {/* ── TASK 1: Reuse existing ReapprovalRoute component ── */}
      <div className="space-y-4">
        <ReapprovalRoute
          title="Who Approves"
          route={reapprovalRoute}
          hideNote={true}
        />

        {/* ── TASK 2: Every stage's rejection consequence rendered beneath the route ── */}
        <div
          data-slot="rejection-consequences-panel"
          className="p-3.5 rounded-lg border border-amber-500/20 bg-amber-500/10 text-amber-950 dark:text-amber-200 text-xs space-y-2.5"
        >
          <div className="flex items-center gap-2 font-semibold">
            <AlertTriangle
              className="size-4 shrink-0 text-amber-600 dark:text-amber-400"
              aria-hidden="true"
            />
            <span>Rejection Consequences</span>
          </div>

          <p className="text-[11.5px] text-muted-foreground leading-normal">
            A rejection at any stage closes this candidate&apos;s path and releases the reserved funds.
          </p>

          <div className="space-y-1.5 pt-1 border-t border-amber-500/20">
            {reapprovalRoute.map((step) => {
              const consequence =
                step.rejectionConsequence || genericRejectionConsequence;

              return (
                <div
                  key={step.stage}
                  data-slot={`stage-consequence-${step.stage.toLowerCase()}`}
                  className="text-[11px] leading-relaxed"
                >
                  <span className="font-semibold text-foreground">
                    {step.role || step.user.name}:
                  </span>{" "}
                  <span className="text-muted-foreground">{consequence}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── TASK 3: Fund state on approval (Reserved -> Locked & Allocated) ── */}
      <div
        data-slot="fund-state-transition-container"
        className="pt-4 border-t border-border/60 space-y-2"
      >
        <h3 className="text-xs font-bold tracking-wider uppercase text-muted-foreground">
          Fund State On Approval
        </h3>
        <div className="flex items-center gap-2 text-xs">
          <FundStateBadge state="RESERVED" size="sm" />
          <ArrowRight className="size-3.5 text-muted-foreground" aria-hidden="true" />
          <FundStateBadge state="LOCKED" size="sm" />
        </div>
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          On final approval, funds transition from Reserved to Locked &amp; Allocated after atomic availability verification.
        </p>
      </div>

      {/* ── TASK 4: Cancellation consequence quiet note ── */}
      <div
        data-slot="cancel-consequence-card"
        className="pt-4 border-t border-border/60 space-y-1.5"
      >
        <h3 className="text-xs font-bold tracking-wider uppercase text-muted-foreground">
          Cancellation Consequence
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {cancelConsequence.includes(candidateRef)
            ? cancelConsequence
            : `Cancelling reverts Candidate ${candidateRef} to Qualified, pending budget. No funds are moved.`}
        </p>
      </div>
    </aside>
  );
}
