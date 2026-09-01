"use client";

import React from "react";
import { WidgetShell } from "../WidgetShell";
import { WidgetProps } from "@/src/lib/dashboard/registry";
import { BudgetPeriodStatusData } from "@/src/types/dashboard";
import { CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

export function BudgetPeriodStatusWidget({
  scope,
  data,
  isLoading,
  error,
  onRetry,
}: WidgetProps<BudgetPeriodStatusData>) {
  
  if (!data && !isLoading && !error) {
    return (
      <WidgetShell title="Budget period status" scopeLabel={scope?.label} isLoading={false} minHeight={240}>
        <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
          No budget period data available.
        </div>
      </WidgetShell>
    );
  }

  const { status, periodName, approvalProgress, lastAmendedAt } = data || {};
  const { currentLevel = 0, totalLevels = 3 } = approvalProgress || {};

  return (
    <WidgetShell
      title="Budget period status"
      scopeLabel={scope?.label}
      href="/app/budget" // Links to the budget period dialog
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      minHeight={240}
    >
      <div className="flex flex-col gap-5 mt-2">
        {/* Period and Status */}
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-foreground">{periodName}</span>
          <span className={cn(
            "px-2.5 py-1 text-xs font-semibold rounded-full border",
            status === "OPEN" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
            status === "CLOSED" ? "bg-slate-100 text-slate-700 border-slate-200" :
            "bg-amber-50 text-amber-700 border-amber-200"
          )}>
            {status}
          </span>
        </div>

        {/* Approval Progress */}
        <div className="flex flex-col gap-3">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Approval Progress
          </span>
          <div className="flex items-center gap-2">
            {Array.from({ length: totalLevels }).map((_, i) => {
              const isApproved = i < currentLevel;
              const isCurrent = i === currentLevel && status !== "CLOSED";
              return (
                <div key={i} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center gap-1 shrink-0 relative z-10 bg-card">
                    {isApproved ? (
                      <CheckCircle2 className="size-5 text-emerald-500" />
                    ) : (
                      <Circle className={cn(
                        "size-5", 
                        isCurrent ? "text-primary border-primary border-2 rounded-full size-4 m-0.5" : "text-muted-foreground/30"
                      )} />
                    )}
                  </div>
                  {i < totalLevels - 1 && (
                    <div className={cn(
                      "h-0.5 flex-1 mx-2 rounded-full",
                      isApproved ? "bg-emerald-500" : "bg-border"
                    )} />
                  )}
                </div>
              );
            })}
          </div>
          <span className="text-xs text-muted-foreground text-center">
            {currentLevel === totalLevels ? "Fully approved" : `Level ${currentLevel} of ${totalLevels} approved`}
          </span>
        </div>

        {/* Last amended */}
        {lastAmendedAt && (
          <div className="pt-3 border-t border-border/40 flex justify-between items-center text-xs text-muted-foreground">
            <span>Last amended</span>
            <span className="font-medium text-foreground">{lastAmendedAt}</span>
          </div>
        )}
      </div>
    </WidgetShell>
  );
}
