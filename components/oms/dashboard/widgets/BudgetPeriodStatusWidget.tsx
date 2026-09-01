"use client";

import React from "react";
import { WidgetShell } from "../WidgetShell";
import { WidgetProps } from "@/lib/dashboard/registry";
import { BudgetPeriodStatusData } from "@/types/dashboard";
import { CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

export function BudgetPeriodStatusWidget({
  scope,
  data,
  isLoading,
  error,
  onRetry,
  updatedAt,
}: WidgetProps<BudgetPeriodStatusData>) {
  if (!data && !isLoading && !error) {
    return (
      <WidgetShell
        title="Budget period status"
        scopeLabel={scope?.label}
        isLoading={false}
        minHeight={215}
        updatedAt={updatedAt}
      >
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
      href="/app/budget"
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      updatedAt={updatedAt}
      minHeight={215}
      headerActions={
        status && (
          <span
            className={cn(
              "px-2 py-0.5 text-[11px] font-semibold rounded border",
              status === "OPEN"
                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20"
                : status === "CLOSED"
                ? "bg-muted text-muted-foreground border-border/40"
                : "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20"
            )}
          >
            {status}
          </span>
        )
      }
    >
      <div className="flex flex-col justify-between flex-1 gap-3 py-1">
        <div className="flex items-center justify-between">
          <span className="text-base font-bold text-foreground">{periodName}</span>
          <span className="text-xs text-muted-foreground">
            {currentLevel === totalLevels ? "Fully approved" : `Level ${currentLevel} of ${totalLevels}`}
          </span>
        </div>

        {/* Approval Progress Nodes */}
        <div className="flex items-center gap-2 px-1 py-2">
          {Array.from({ length: totalLevels }).map((_, i) => {
            const isApproved = i < currentLevel;
            const isCurrent = i === currentLevel && status !== "CLOSED";
            return (
              <div key={i} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center gap-1 shrink-0 relative z-10 bg-card">
                  {isApproved ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <Circle
                      className={cn(
                        "w-5 h-5",
                        isCurrent
                          ? "text-primary border-primary border-2 rounded-full w-4 h-4 m-0.5"
                          : "text-muted-foreground/30"
                      )}
                    />
                  )}
                </div>
                {i < totalLevels - 1 && (
                  <div
                    className={cn(
                      "h-0.5 flex-1 mx-2 rounded-full",
                      isApproved ? "bg-emerald-500/80" : "bg-border/60"
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Last amended footer */}
        {lastAmendedAt && (
          <div className="pt-2 border-t border-border/40 flex justify-between items-center text-[11px] text-muted-foreground">
            <span>Last amended</span>
            <span className="font-medium text-foreground font-mono">{lastAmendedAt}</span>
          </div>
        )}
      </div>
    </WidgetShell>
  );
}
