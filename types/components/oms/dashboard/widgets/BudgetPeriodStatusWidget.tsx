"use client";

import React from "react";
import { WidgetShell } from "../WidgetShell";
import { StatusTooltipIcon } from "../StatusTooltipIcon";
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

  const { status = "OPEN", periodName, approvalProgress, lastAmendedAt } = data || {};
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
        <StatusTooltipIcon
          status={status}
          label={status}
          tooltipTitle={`Budget Period: ${periodName || "Current Fiscal Cycle"}`}
          tooltipDescription={`Status: ${status}. Multi-level approval progress is at level ${currentLevel} of ${totalLevels}.`}
          tooltipDetails={[
            { label: "Cycle Status", value: status },
            { label: "Approval Progress", value: `${currentLevel} / ${totalLevels} Levels` },
            { label: "Last Amended", value: lastAmendedAt || "None" },
          ]}
          showBorder
        />
      }
    >

      <div className="flex flex-col justify-between flex-1 gap-3 py-1">
        <div className="flex items-center justify-between">
          <span className="text-base font-bold text-foreground">{periodName}</span>
          <span className="text-xs text-muted-foreground">
            {currentLevel === totalLevels ? "Fully approved" : `Level ${currentLevel} of ${totalLevels}`}
          </span>
        </div>

        {/* 4px Stage Rail per D2 / DASHBOARD-PLAN.md 6.1 */}
        <div className="flex flex-col gap-2 py-2">
          <div
            className="grid items-center gap-[3px] h-1 w-full"
            style={{
              gridTemplateColumns: `repeat(${totalLevels}, minmax(0, 1fr))`,
            }}
            role="progressbar"
            aria-valuenow={currentLevel}
            aria-valuemin={0}
            aria-valuemax={totalLevels}
            aria-label={`Budget period approval progress: Level ${currentLevel} of ${totalLevels}`}
          >
            {Array.from({ length: totalLevels }).map((_, i) => {
              const isApproved = i < currentLevel;
              const isCurrent = i === currentLevel && status !== "CLOSED";
              return (
                <div
                  key={i}
                  style={{
                    backgroundColor: isApproved
                      ? "var(--success-border, #3A8F6B)"
                      : isCurrent
                      ? "var(--brand-teal, var(--primary))"
                      : undefined,
                  }}
                  className={cn(
                    "h-1 rounded-[1px] transition-colors duration-200",
                    !isApproved && !isCurrent && "bg-muted-foreground/20 dark:bg-slate-800/80"
                  )}
                  title={`Level ${i + 1}: ${isApproved ? "Approved" : isCurrent ? "Under Review" : "Pending"}`}
                />
              );
            })}
          </div>

          {/* Rail Stage Sublabels */}
          <div className="flex items-center justify-between text-[10.5px] text-muted-foreground">
            <span>Level 1: Dept Review</span>
            <span>Level 2: Finance Review</span>
            {totalLevels > 2 && <span>Level {totalLevels}: Executive Sign-off</span>}
          </div>
        </div>

        {/* Last amended footer */}
        {lastAmendedAt && (
          <div className="pt-2 border-t border-border/40 flex justify-between items-center text-[11px] text-muted-foreground">
            <span>Last amended</span>
            <span className="font-medium text-foreground">{lastAmendedAt}</span>
          </div>
        )}
      </div>
    </WidgetShell>
  );
}
