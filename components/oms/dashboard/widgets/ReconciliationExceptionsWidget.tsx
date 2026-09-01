"use client";

import React from "react";
import { WidgetShell } from "../WidgetShell";
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
      minHeight={240}
    >
      {!data ? (
        <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
          No reconciliation data available.
        </div>
      ) : (
        <div className="flex flex-col gap-4 mt-1">
          
          <div className="flex items-center gap-6">
            <div className="flex flex-col">
              <span className="text-3xl font-bold font-mono tracking-tight text-foreground">
                {total}
              </span>
              <span className="text-xs font-medium text-muted-foreground">
                Total Exceptions
              </span>
            </div>
            
            {total > 0 && (
              <div className="flex flex-col border-l border-border pl-6">
                <span className={cn(
                  "text-2xl font-bold font-mono tracking-tight",
                  oldest > 7 ? "text-red-600 dark:text-red-500" : "text-amber-600 dark:text-amber-500"
                )}>
                  {oldest}d
                </span>
                <span className="text-xs font-medium text-muted-foreground">
                  Oldest Exception
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 mt-2 pt-3 border-t border-border/40">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
              By System
            </span>
            {bySystem.map((sys) => (
              <div key={sys.system} className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">{sys.label}</span>
                <div className="flex items-center gap-4">
                  {sys.exceptionCount > 0 && (
                    <span className="text-[11px] text-muted-foreground">
                      Oldest: {sys.oldestAgeDays}d
                    </span>
                  )}
                  <span className={cn(
                    "text-sm font-mono font-medium tabular-nums w-6 text-right",
                    sys.exceptionCount > 0 ? "text-amber-600 dark:text-amber-500" : "text-muted-foreground"
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
