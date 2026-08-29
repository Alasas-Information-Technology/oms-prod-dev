"use client";

import { RequisitionImpact } from "@/lib/types/approval.types";
import { formatAmount } from "@/lib/money";
import { FundStateBar } from "@/components/budget/FundStateBar";
import { ArrowRight, Lock, CheckCircle2, AlertCircle } from "lucide-react";
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
  // Pre-calculate condition for funds being available
  // No math on amounts! Just relying on the reserved vs requested or a strict boolean if we had one.
  // Actually, the server dictates available vs unavailable by remainingAfter >= 0 (or preflight).
  // But wait! We'll just show "Funds Available" if remainingAfter >= 0.
  const isAvailable = impact.remainingAfter >= 0;

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Budget Validation */}
      <div className="p-5 rounded-xl border border-border/40 bg-card shadow-sm flex flex-col gap-5">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-foreground">Budget Validation</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Funding route: <span className="font-medium text-foreground">{toPlainLanguage(impact.fundingRoute)}</span>
            </p>
          </div>
          <div
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border",
              isAvailable
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-red-50 text-red-700 border-red-200"
            )}
          >
            {isAvailable ? (
              <CheckCircle2 className="size-3.5" />
            ) : (
              <AlertCircle className="size-3.5" />
            )}
            <span>{isAvailable ? "Funds Available" : "Insufficient Funds"}</span>
          </div>
        </div>

        {/* Numerical breakdown of the 4 exact figures from server */}
        <div className="grid grid-cols-2 gap-3 py-3 border-y border-border/40 text-xs">
          <div className="flex flex-col gap-0.5">
            <span className="text-muted-foreground">Available Before</span>
            <span className="font-semibold tabular-nums text-foreground text-sm">
              {impact.currency} {formatAmount(impact.availableBefore)}
            </span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-muted-foreground">Requested</span>
            <span className="font-semibold tabular-nums text-foreground text-sm">
              {impact.currency} {formatAmount(impact.requested)}
            </span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-muted-foreground">Reserved Now</span>
            <span className="font-semibold tabular-nums text-foreground text-sm">
              {impact.currency} {formatAmount(impact.reservedNow)}
            </span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-muted-foreground">Remaining After</span>
            <span className="font-semibold tabular-nums text-foreground text-sm">
              {impact.currency} {formatAmount(impact.remainingAfter)}
            </span>
          </div>
        </div>

        {/* Reusing FundStateBar to visualize Before/After proportions */}
        <div>
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
      <div className="p-5 rounded-xl border border-border/40 bg-card shadow-sm flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground">Budget Allocation</h3>
          <div
            className={cn(
              "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
              impact.periodOpen
                ? "bg-emerald-100 text-emerald-800"
                : "bg-red-100 text-red-800"
            )}
          >
            {impact.periodOpen ? "Period Open" : "Period Closed"}
          </div>
        </div>
        
        <div className="flex flex-col gap-2">
          {impact.allocations.map((alloc) => (
            <div
              key={alloc.budgetLineId}
              className="flex items-center justify-between py-2 border-b border-border/30 last:border-0"
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium text-foreground">
                  {alloc.name}
                </span>
                <span className="text-[11px] font-mono text-muted-foreground">
                  {alloc.code}
                </span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-sm font-semibold tabular-nums text-foreground">
                  {formatAmount(alloc.amount)}
                </span>
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                  {impact.currency}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Total Allocation Display */}
        <div className="flex items-center justify-between pt-3 mt-1 border-t border-border/50">
          <span className="text-sm font-semibold text-muted-foreground">
            Total Allocated
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-bold tabular-nums text-foreground">
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
        <div className="p-5 rounded-xl border border-indigo-200/50 bg-indigo-50/30 flex flex-col gap-4">
          <div className="flex items-center gap-2 text-indigo-900 font-semibold">
            <Lock className="size-4 text-indigo-500" />
            <h3 className="text-sm">Fund State on Approval</h3>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-full bg-background border border-border shadow-sm text-xs font-semibold text-muted-foreground">
              {toPlainLanguage(impact.fundStateTransition.from)}
            </div>
            <ArrowRight className="size-4 text-muted-foreground/50" />
            <div className="px-3 py-1.5 rounded-full bg-indigo-600 text-white shadow-sm text-xs font-semibold tracking-wide">
              {toPlainLanguage(impact.fundStateTransition.to)}
            </div>
          </div>
          
          <p className="text-[11px] text-muted-foreground leading-relaxed mt-1">
            Note: The final availability check runs atomically at the exact moment of approval.
          </p>
        </div>
      )}
    </div>
  );
}
