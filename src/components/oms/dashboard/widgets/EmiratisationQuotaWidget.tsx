"use client";

import React from "react";
import { WidgetShell } from "../WidgetShell";
import { WidgetProps } from "@/src/lib/dashboard/registry";
import { EmiratisationQuotaData } from "@/src/types/dashboard";
import { SegmentedBar } from "../SegmentedBar";
import { cn } from "@/lib/utils";

export function EmiratisationQuotaWidget({
  scope,
  data,
  isLoading,
  error,
  onRetry,
  updatedAt,
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
      updatedAt={updatedAt}
      minHeight={215}
      headerActions={
        <span
          className={cn(
            "px-2 py-0.5 text-[11px] font-semibold rounded border",
            isCompliant
              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20"
              : "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20"
          )}
        >
          {isCompliant ? "Compliant" : "Below Target"}
        </span>
      }
    >
      {!data ? (
        <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
          No quota data available.
        </div>
      ) : (
        <div className="flex flex-col justify-between flex-1 gap-2">
          {/* Main Percentage & Segmented Progress */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono tracking-tight text-foreground">
                {currentPercent.toFixed(1)}%
              </span>
              <span className="text-xs text-muted-foreground">
                (target {targetPercent.toFixed(1)}%)
              </span>
            </div>
            <SegmentedBar
              value={currentPercent}
              color={isCompliant ? "var(--emerald-600, #10b981)" : "var(--amber-600, #f59e0b)"}
            />
          </div>

          {/* Breakdown per BU */}
          {byBusinessUnit.length > 0 && (
            <div className="flex flex-col gap-1 pt-2 border-t border-border/40">
              {byBusinessUnit.slice(0, 2).map((bu) => (
                <div
                  key={bu.businessUnitId}
                  className="flex items-center justify-between px-2 py-1 rounded-[6px] hover:bg-foreground/[0.03] transition-colors"
                >
                  <span className="text-xs font-medium text-foreground truncate max-w-[150px]" title={bu.name}>
                    {bu.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-muted-foreground font-mono tabular-nums">
                      {bu.uaeNationalHeadcount}/{bu.totalHeadcount}
                    </span>
                    <span
                      className={cn(
                        "text-xs font-mono font-semibold tabular-nums",
                        bu.currentPercent >= bu.targetPercent
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-amber-600 dark:text-amber-400"
                      )}
                    >
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
