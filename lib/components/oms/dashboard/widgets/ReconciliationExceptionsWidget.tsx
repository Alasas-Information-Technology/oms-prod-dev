"use client";

import React from "react";
import { WidgetShell } from "../WidgetShell";
import { StatusTooltipIcon } from "../StatusTooltipIcon";
import { WidgetProps } from "@/lib/dashboard/registry";
import { ReconciliationExceptionsData } from "@/types/dashboard";
import { cn } from "@/lib/utils";
import { SeverityDot, SeverityLevel } from "../SeverityDot";

// TODO(integration-ops): wire to the real exception queue

export function ReconciliationExceptionsWidget({
  scope,
  data,
  isLoading,
  error,
  onRetry,
}: WidgetProps<ReconciliationExceptionsData>) {
  const total = data?.totalExceptions ?? 0;
  const oldest = data?.oldestAgeDays ?? 0;
  const bySystem = data?.bySystem || [];

  return (
    <WidgetShell
      title="Reconciliation exceptions"
      scopeLabel={scope?.label}
      href={data?.link || "/app/budget/reconciliation"}
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      minHeight={215}
      headerActions={
        <StatusTooltipIcon
          status={total > 0 ? "WARNING" : "SUCCESS"}
          label={total > 0 ? `${total} exceptions` : "Reconciled"}
          tooltipTitle="Budget & ERP Ledger Reconciliation"
          tooltipDescription={
            total > 0
              ? `${total} discrepancies detected across ledger systems. Oldest discrepancy is ${oldest} days old.`
              : "All ledger records and payment lines are fully reconciled without discrepancy."
          }
          tooltipDetails={[
            { label: "Total Exceptions", value: `${total}` },
            { label: "Oldest Item Age", value: `${oldest} days` },
          ]}
          showBorder
        />
      }
    >
      {!data ? (
        <div className="flex items-center justify-center py-8 text-xs text-muted-foreground">
          No reconciliation data available.
        </div>
      ) : (
        <div className="flex flex-col gap-3 select-none">
          <div className="flex items-center justify-between p-2 rounded-lg bg-muted/20 border border-border/30 dark:border-white/[0.04]">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-foreground">
                {total}
              </span>
              <span className="text-xs font-medium text-muted-foreground">
                Discrepancies
              </span>
            </div>
            
            {total > 0 && (
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-muted-foreground text-[11px]">Oldest:</span>
                <span className={cn(
                  "font-bold tabular-nums",
                  oldest > 7 ? "text-danger-text" : "text-warning-text"
                )}>
                  {oldest}d
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            {(() => {
              const maxVal = Math.max(...bySystem.map((s) => s.exceptionCount), 1);
              return bySystem.map((sys) => {
                const severity: SeverityLevel =
                  sys.exceptionCount === 0
                    ? "LOW"
                    : sys.oldestAgeDays > 7
                    ? "HIGH"
                    : "MEDIUM";
                const barWidth = sys.exceptionCount > 0 ? Math.max(8, Math.min(100, (sys.exceptionCount / maxVal) * 100)) : 0;

                return (
                  <div
                    className="flex items-center justify-between h-[48px] px-2.5 sm:px-3 rounded-sm transition-colors border hover:bg-accent border-foreground/10 dark:border-foreground/4 text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <SeverityDot
                        severity={severity}
                        label={`${severity} severity: ${sys.label}`}
                      />
                      <span className="text-[12.5px] font-medium text-foreground/90 truncate">
                        {sys.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5 shrink-0">
                      {sys.exceptionCount > 0 && (
                        <span className="text-[10.5px] text-muted-foreground hidden md:inline">
                          Oldest: {sys.oldestAgeDays}d
                        </span>
                      )}
                      {/* Horizontal bar primitive (form: horizontal bar) */}
                      <div className="hidden sm:block w-12 h-1.5 bg-muted/60 dark:bg-slate-800/80 rounded-full overflow-hidden shrink-0">
                        <div
                          className="h-full rounded-full bg-[var(--accent-interactive,var(--primary))] transition-all duration-300"
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                      <span
                        className={cn(
                          "text-xs font-semibold tabular-nums min-w-[14px] text-right",
                          sys.exceptionCount > 0
                            ? sys.oldestAgeDays > 7
                              ? "text-danger-text"
                              : "text-warning-text"
                            : "text-muted-foreground"
                        )}
                      >
                        {sys.exceptionCount}
                      </span>
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>
      )}
    </WidgetShell>
  );
}

