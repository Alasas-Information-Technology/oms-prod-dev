"use client";

import React from "react";
import { WidgetShell } from "../WidgetShell";
import { StatusTooltipIcon } from "../StatusTooltipIcon";
import { WidgetProps } from "@/lib/dashboard/registry";
import { ReconciliationExceptionsData } from "@/types/dashboard";
import { cn } from "@/lib/utils";

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
              <span className="text-2xl font-bold font-mono tracking-tight text-foreground">
                {total}
              </span>
              <span className="text-xs font-medium text-muted-foreground">
                Discrepancies
              </span>
            </div>
            
            {total > 0 && (
              <div className="flex items-center gap-1.5 font-mono text-xs">
                <span className="text-muted-foreground text-[11px]">Oldest:</span>
                <span className={cn(
                  "font-bold tabular-nums",
                  oldest > 7 ? "text-rose-600 dark:text-rose-400" : "text-amber-600 dark:text-amber-400"
                )}>
                  {oldest}d
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1">
            {bySystem.map((sys) => (
              <div key={sys.system} className="flex items-center justify-between px-2 py-1 rounded-md hover:bg-muted/30 transition-colors text-xs">
                <span className="text-[12.5px] font-medium text-foreground/90">{sys.label}</span>
                <div className="flex items-center gap-3">
                  {sys.exceptionCount > 0 && (
                    <span className="text-[10.5px] text-muted-foreground font-mono">
                      Oldest: {sys.oldestAgeDays}d
                    </span>
                  )}
                  <span className={cn(
                    "text-xs font-mono font-semibold tabular-nums",
                    sys.exceptionCount > 0 ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground"
                  )}>
                    {sys.exceptionCount}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </WidgetShell>
  );
}

