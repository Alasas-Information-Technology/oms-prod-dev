"use client";

import React from "react";
import { WidgetShell } from "../WidgetShell";
import { WidgetProps } from "@/src/lib/dashboard/registry";
import { EmiratisationQuotaData } from "@/src/types/dashboard";
import { cn } from "@/lib/utils";

// TODO(hr): confirm quota calculation basis with DIEZ — headcount or cost?

export function EmiratisationQuotaWidget({
  scope,
  data,
  isLoading,
  error,
  onRetry,
}: WidgetProps<EmiratisationQuotaData>) {
  const isCompliant = data?.isCompliant ?? false;
  const currentPercent = data?.currentPercent ?? 0;
  const targetPercent = data?.targetPercent ?? 0;
  const byBusinessUnit = data?.byBusinessUnit || [];

  return (
    <WidgetShell
      title="Emiratisation quota"
      scopeLabel={scope?.label}
      href="/app/workforce"
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      minHeight={240}
    >
      {!data ? (
        <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
          No quota data available.
        </div>
      ) : (
        <div className="flex flex-col gap-4 mt-2">
          {/* Main KPI */}
          <div className="flex flex-col gap-1">
            <div className="flex items-end justify-between">
              <div className="flex flex-col">
                <span className="text-3xl font-bold font-mono tracking-tight text-foreground">
                  {currentPercent.toFixed(1)}%
                </span>
                <span className="text-xs font-medium text-muted-foreground">
                  Target: {targetPercent.toFixed(1)}%
                </span>
              </div>
              <span className={cn(
                "px-2.5 py-1 text-xs font-semibold rounded-full border",
                isCompliant 
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                  : "bg-amber-50 text-amber-700 border-amber-200"
              )}>
                {isCompliant ? "Compliant" : "Below Target"}
              </span>
            </div>
            
            {/* Progress Bar */}
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden mt-2 relative">
              <div 
                className={cn("h-full transition-all duration-500", isCompliant ? "bg-emerald-500" : "bg-amber-500")} 
                style={{ width: `${Math.min(currentPercent, 100)}%` }} 
              />
              {/* Target Line */}
              <div 
                className="absolute top-0 bottom-0 w-0.5 bg-slate-800 dark:bg-slate-200"
                style={{ left: `${targetPercent}%` }}
              />
            </div>
          </div>

          {/* Breakdown */}
          {byBusinessUnit.length > 0 && (
            <div className="flex flex-col gap-2 mt-2 pt-4 border-t border-border/40">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                By Business Unit
              </span>
              {byBusinessUnit.map((bu) => (
                <div key={bu.businessUnitId} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground truncate max-w-[140px]" title={bu.name}>
                    {bu.name}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {bu.uaeNationalHeadcount} / {bu.totalHeadcount}
                    </span>
                    <span className={cn(
                      "text-sm font-mono font-medium w-12 text-right tabular-nums",
                      bu.currentPercent >= bu.targetPercent ? "text-emerald-600 dark:text-emerald-500" : "text-amber-600 dark:text-amber-500"
                    )}>
                      {bu.currentPercent.toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </WidgetShell>
  );
}
