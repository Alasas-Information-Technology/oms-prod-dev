"use client";

import React, { useMemo } from "react";
import { WidgetShell } from "../WidgetShell";
import { WidgetProps } from "@/src/lib/dashboard/registry";
import { TimeInStageData } from "@/src/types/dashboard";
import { BarChartCard } from "../charts/BarChartCard";
import { semanticColors, categoricalScale } from "@/src/lib/dashboard/chart-tokens";

export function TimeInStageChart({
  scope,
  data,
  isLoading,
  error,
  onRetry,
  updatedAt,
}: WidgetProps<TimeInStageData>) {
  const stages = useMemo(() => data?.stages || [], [data]);
  const overallAvg = data?.overallAvgDays ?? 0;

  // Single hue scale by rank
  const rankScale = useMemo(() => categoricalScale(stages.length || 5), [stages.length]);

  const slowestStage = useMemo(() => {
    return stages.find((s) => s.isSlowest) || (stages.length ? stages.reduce((prev, curr) => (curr.avgDays > prev.avgDays ? curr : prev), stages[0]) : null);
  }, [stages]);

  const chartData = useMemo(() => {
    return stages.map((s, idx) => ({
      label: s.isSlowest ? `${s.label} (Slowest)` : s.label,
      rawLabel: s.label,
      avgDays: s.avgDays,
      targetDays: s.targetDays,
      isSlowest: s.isSlowest,
      rankColor: rankScale[idx],
    }));
  }, [stages, rankScale]);

  const srSummary = stages
    .map(
      (s) =>
        `${s.label}: avg ${s.avgDays} days (target ${s.targetDays} days)${
          s.isSlowest ? " [Slowest stage]" : ""
        }`
    )
    .join("; ");

  return (
    <WidgetShell
      title="Time in stage"
      scopeLabel={scope?.label}
      updatedAt={updatedAt}
      href="/app/requests"
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      minHeight={215}
      headerActions={
        <div className="flex items-center gap-2">
          {slowestStage && (
            <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              Slowest: {slowestStage.label} ({slowestStage.avgDays}d)
            </span>
          )}
        </div>
      }
    >
      <span className="sr-only">
        Workflow stage average duration: {srSummary}. Overall average: {overallAvg} days.
      </span>

      {stages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
          <p className="text-sm">No workflow timing data recorded.</p>
        </div>
      ) : (
        <div className="flex flex-col justify-between flex-1">
          <BarChartCard
            data={chartData.slice(0, 5)}
            series={[
              {
                key: "avgDays",
                name: "Avg Days",
              },
            ]}
            xAxisKey="label"
            layout="vertical"
            height={130}
            hideLegend
            xAxisFormatter={(val) => `${val}d`}
            getCellColor={(entry) => {
              if (entry.isSlowest) {
                return semanticColors.warning; // Semantic warning for slowest stage
              }
              return entry.rankColor || "var(--primary)";
            }}
            accessibilitySummary="Horizontal bar chart showing average days spent in each workflow stage"
          />
        </div>
      )}
    </WidgetShell>
  );
}
