"use client";

import React from "react";
import { WidgetShell } from "../WidgetShell";
import { WidgetProps } from "@/lib/dashboard/registry";
import { BudgetBurnVsElapsedData } from "@/types/dashboard";
import { formatAbbreviated } from "@/lib/money";
import { cn } from "@/lib/utils";

/**
 * V2 — Budget burn vs year elapsed per DASHBOARD-VISUAL-DEPTH.md:
 * - Two stacked horizontal tracks, 12px tall, 8px apart, identical width
 * - Track 1: budget consumed as a percentage, accent fill
 * - Track 2: financial year elapsed as a percentage, neutral at 40%
 * - Percentage labels right-aligned on each track
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

  const track1FillColor = isCritical
    ? "var(--destructive)"
    : isWarning
    ? "var(--warning)"
    : "var(--primary)";

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
      minHeight={215}
    >
      <div className="flex flex-col justify-between h-full p-5 gap-4 select-none font-sans">
        {/* Track 1: Budget Consumed */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-normal text-muted-foreground">Budget consumed</span>
            <span className="font-mono font-semibold text-foreground tabular-nums">
              {consumedPercent.toFixed(1)}%
            </span>
          </div>
          <div className="h-3 w-full bg-muted/40 rounded-[4px] overflow-hidden">
            <div
              style={{
                width: `${Math.min(100, Math.max(0, consumedPercent))}%`,
                backgroundColor: track1FillColor,
              }}
              className="h-full rounded-[4px] transition-all duration-300"
            />
          </div>
        </div>

        {/* Track 2: Financial Year Elapsed (8px gap) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-normal text-muted-foreground">Financial year elapsed</span>
            <span className="font-mono font-medium text-muted-foreground tabular-nums">
              {elapsedPercent.toFixed(1)}%
            </span>
          </div>
          <div className="h-3 w-full bg-muted/40 rounded-[4px] overflow-hidden">
            <div
              style={{
                width: `${Math.min(100, Math.max(0, elapsedPercent))}%`,
                backgroundColor: "color-mix(in srgb, var(--foreground) 35%, transparent)",
              }}
              className="h-full rounded-[4px] transition-all duration-300"
            />
          </div>
        </div>

        {/* Bottom Assessment & Contextual Caption */}
        <div className="pt-2 border-t border-border/40 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
          <span className={cn("font-medium", toneClass)}>
            {gap !== 0 && <span>{gap > 0 ? "↑ " : "↓ "}</span>}
            {caption}
          </span>
          {consumedFormatted && totalFormatted && (
            <span className="text-[11px] font-mono text-muted-foreground tabular-nums">
              {consumedFormatted} / {totalFormatted}
            </span>
          )}
        </div>
      </div>
    </WidgetShell>
  );
}
