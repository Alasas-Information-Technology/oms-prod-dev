"use client";

import React from "react";
import { WidgetShell } from "../WidgetShell";
import { WidgetProps } from "@/lib/dashboard/registry";
import { BudgetBurnVsElapsedData } from "@/types/dashboard";
import { formatAbbreviated } from "@/lib/money";
import { cn } from "@/lib/utils";

import { Gauge } from "../Gauge";

/**
 * V2 — Budget burn vs year elapsed per DASHBOARD-VISUAL-DEPTH.md:
 * - Gauge: arc shows % consumed, a tick mark on the arc shows year-elapsed % as the threshold reference
 * - Caption stating the gap AND its meaning:
 *     under plan -> "23.9 points behind — spending is under plan"
 *     on plan    -> "In line with the year to date"
 *     ahead      -> "12.4 points ahead — spending is outpacing the year"
 * - Tone: neutral when consumption trails elapsed, amber when it leads by >10 points, red beyond 20
 */
export function BudgetBurnVsElapsedWidget({
  scope,
  data,
  isLoading,
  error,
  onRetry,
  updatedAt,
}: WidgetProps<BudgetBurnVsElapsedData>) {
  const consumedPercent = data?.consumedPercent ?? 0;
  const elapsedPercent = data?.elapsedPercent ?? 0;
  const gap = data?.gapPoints ?? (consumedPercent - elapsedPercent);
  const assessment = data?.assessment ?? (gap < -2 ? "UNDER_PLAN" : gap > 2 ? "AHEAD_OF_PLAN" : "ON_PLAN");

  // Determine severity tone
  // Neutral when trailing elapsed, amber when leading >10, red when leading >20
  const isAhead = gap > 0;
  const isCritical = gap > 20;
  const isWarning = gap > 10;

  const toneClass = isCritical
    ? "text-rose-600 dark:text-rose-400"
    : isWarning
    ? "text-amber-600 dark:text-amber-400"
    : "text-muted-foreground";

  // Caption text
  let caption = "";
  if (assessment === "UNDER_PLAN" || gap < -2) {
    caption = `${Math.abs(gap).toFixed(1)} points behind — spending is under plan`;
  } else if (assessment === "AHEAD_OF_PLAN" || gap > 2) {
    caption = `${Math.abs(gap).toFixed(1)} points ahead — spending is outpacing the year`;
  } else {
    caption = "In line with the year to date";
  }

  const consumedFormatted = data?.consumedAmount
    ? formatAbbreviated(data.consumedAmount, { showCurrency: true })
    : undefined;
  const totalFormatted = data?.totalBudget
    ? formatAbbreviated(data.totalBudget, { showCurrency: true })
    : undefined;

  return (
    <WidgetShell
      title="Budget burn vs year elapsed"
      scopeLabel={scope?.label}
      href="/app/budget"
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      updatedAt={updatedAt}
      minHeight={180}
    >
      <div className="flex flex-col justify-between h-full gap-3.5 select-none font-sans py-1">
        {/* NEW: Gauge (M6) replacing stacked bars */}
        <div className="flex-1 flex flex-col justify-center py-2 pb-6">
          <Gauge 
            value={consumedPercent}
            max={100}
            threshold={elapsedPercent}
            thresholdCrossed={consumedPercent > elapsedPercent}
            thresholdSemantic={isCritical ? "danger" : isWarning ? "warning" : "success"}
            label="Consumed"
          />
        </div>

        {/* Bottom Assessment & Contextual Caption */}
        <div className="pt-2 border-t border-border/30 dark:border-white/[0.05] flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs mt-auto">
          <span className={cn("font-medium text-[11.5px] flex items-center gap-1", toneClass)}>
            {gap !== 0 && <span>{gap > 0 ? "↑ " : "↓ "}</span>}
            {caption}
          </span>
          {consumedFormatted && totalFormatted && (
            <span className="text-[11px] text-muted-foreground tabular-nums">
              {consumedFormatted} / {totalFormatted}
            </span>
          )}
        </div>
      </div>
    </WidgetShell>
  );
}

