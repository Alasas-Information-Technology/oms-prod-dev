"use client";

import { RequisitionImpact } from "@/lib/types/approval.types";
import { formatAmount } from "@/lib/money";
import { FundStateBar } from "@/components/budget/FundStateBar";
import { ArrowRight, Lock, CheckCircle2, AlertCircle, Coins, Wallet, Landmark } from "lucide-react";
import { cn } from "@/components/ui/utils";

interface ApprovalImpactPanelProps {
  impact: RequisitionImpact;
}

function toPlainLanguage(value: string) {
  return value
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function ApprovalImpactPanel({ impact }: ApprovalImpactPanelProps) {
  const isAvailable = impact.remainingAfter >= 0;

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Budget Authorization & Validation */}
      <div className="rounded-lg border border-border bg-card p-6 shadow-xs flex flex-col gap-5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2.5">
            <div className="flex size-7 shrink-0 items-center justify-center rounded bg-primary/10 text-primary mt-0.5">
              <Landmark className="size-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                Budget Authorization
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Funding route: <span className="font-semibold text-foreground">{toPlainLanguage(impact.fundingRoute)}</span>
              </p>
            </div>
          </div>
          <div
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border shrink-0",
              isAvailable
                ? "bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                : "bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800"
            )}
          >
            {isAvailable ? (
              <CheckCircle2 className="size-3.5 text-emerald-600" />
            ) : (
              <AlertCircle className="size-3.5 text-rose-600" />
            )}
            <span>{isAvailable ? "Funds Available" : "Insufficient Funds"}</span>
          </div>
        </div>

        {/* Structured Financial Balance Ledger */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Available Before */}
          <div className="flex flex-col gap-1 p-3 rounded-lg border border-border bg-muted/20">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Available Before
            </span>
            <span className="font-semibold tabular-nums text-foreground text-sm">
              <span className="text-xs text-muted-foreground mr-1">{impact.currency}</span>
              {formatAmount(impact.availableBefore)}
            </span>
          </div>

          {/* Requested */}
          <div className="flex flex-col gap-1 p-3 rounded-lg border border-border bg-muted/20">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Requested
            </span>
            <span className="font-semibold tabular-nums text-foreground text-sm">
              <span className="text-xs text-muted-foreground mr-1">{impact.currency}</span>
              {formatAmount(impact.requested)}
            </span>
          </div>

          {/* Reserved Now */}
          <div className="flex flex-col gap-1 p-3 rounded-lg border border-border bg-muted/20">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Reserved Now
            </span>
            <span className="font-semibold tabular-nums text-foreground text-sm">
              <span className="text-xs text-muted-foreground mr-1">{impact.currency}</span>
              {formatAmount(impact.reservedNow)}
            </span>
          </div>

          {/* Remaining After */}
          <div className="flex flex-col gap-1 p-3 rounded-lg border border-border bg-muted/30">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Remaining After
            </span>
            <span className={cn("font-bold tabular-nums text-sm", isAvailable ? "text-emerald-700 dark:text-emerald-400" : "text-rose-700 dark:text-rose-400")}>
              <span className="text-xs font-normal opacity-75 mr-1">{impact.currency}</span>
              {formatAmount(impact.remainingAfter)}
            </span>
          </div>
        </div>

        {/* Reusing FundStateBar to visualize Before/After proportions */}
        <div className="pt-1">
          <FundStateBar
            totalFils={impact.availableBefore}
            availableFils={impact.remainingAfter}
            reservedFils={impact.reservedNow}
            lockedFils={0}
            consumedFils={0}
            currency={impact.currency}
            legendLayout="vertical"
          />
        </div>
      </div>

      {/* 2. Budget Allocation */}
      <div className="rounded-lg border border-border bg-card p-6 shadow-xs flex flex-col gap-4">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Coins className="size-4 text-primary" />
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
              Budget Allocation Breakdown
            </h3>
          </div>
          <div
            className={cn(
              "px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border",
              impact.periodOpen
                ? "bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                : "bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800"
            )}
          >
            {impact.periodOpen ? "Period Open" : "Period Closed"}
          </div>
        </div>

        <div className="flex flex-col divide-y divide-border">
          {impact.allocations.map((alloc) => (
            <div
              key={alloc.budgetLineId}
              className="flex items-center justify-between py-2.5 first:pt-1 last:pb-1"
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-semibold text-foreground">
                  {alloc.name}
                </span>
                <span className="text-[11px] font-mono text-muted-foreground">
                  {alloc.code}
                </span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-xs font-bold tabular-nums text-foreground">
                  {formatAmount(alloc.amount)}
                </span>
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  {impact.currency}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Total Allocation Highlight Box */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border mt-1">
          <div className="flex items-center gap-2">
            <Wallet className="size-4 text-primary" />
            <span className="text-xs font-bold text-foreground uppercase tracking-wider">
              Total Requisition Commitment
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-bold tabular-nums text-foreground">
              {formatAmount(impact.requested)}
            </span>
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              {impact.currency}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Fund State on Approval */}
      {impact.fundStateTransition && (
        <div className="p-4 rounded-lg border border-border bg-muted/20 shadow-2xs flex flex-col gap-3">
          <div className="flex items-center gap-2 text-foreground font-bold text-xs uppercase tracking-wider">
            <Lock className="size-3.5 text-primary" />
            <h4>Fund State Transition on Approval</h4>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="px-3 py-1.5 rounded-md bg-card border border-border text-xs font-semibold text-muted-foreground">
              {toPlainLanguage(impact.fundStateTransition.from)}
            </div>
            <ArrowRight className="size-4 text-muted-foreground shrink-0" />
            <div className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-bold tracking-wide">
              {toPlainLanguage(impact.fundStateTransition.to)}
            </div>
          </div>

          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Final availability check executes atomically at the moment of approval confirmation.
          </p>
        </div>
      )}
    </div>
  );
}
