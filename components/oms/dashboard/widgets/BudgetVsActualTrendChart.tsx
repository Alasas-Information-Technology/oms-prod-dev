"use client";

import React, { useMemo } from "react";
import { WidgetShell } from "../WidgetShell";
import { WidgetProps } from "@/lib/dashboard/registry";
import { BudgetVsActualTrendData, MonthlyBudgetTrendItem } from "@/types/dashboard";
import { formatAbbreviated } from "@/lib/money";
import { AreaChartCard } from "../charts/AreaChartCard";

export function BudgetVsActualTrendChart({
  scope,
  data,
  isLoading,
  error,
  onRetry,
  updatedAt,
}: WidgetProps<BudgetVsActualTrendData>) {
  const months: MonthlyBudgetTrendItem[] = useMemo(() => data?.months || (data as unknown as { monthlyTrend?: MonthlyBudgetTrendItem[] })?.monthlyTrend || [], [data]);

  const chartData = useMemo(() => {
    return months.map((m: MonthlyBudgetTrendItem) => ({
      month: m.month,
      planned: m.plannedFils / 100,
      actual: m.actualFils / 100,
      isOverBudget: m.isOverBudget,
    }));
  }, [months]);

  const overspendCount = useMemo(() => {
    return months.filter((m) => m.isOverBudget).length;
  }, [months]);

  const srSummary = months
    .map(
      (m) =>
        `${m.month}: planned ${formatAbbreviated(m.plannedFils)}, actual ${formatAbbreviated(
          m.actualFils
        )}${m.isOverBudget ? " (Over budget)" : ""}`
    )
    .join("; ");

  return (
    <WidgetShell
      title="Budget vs actual trend"
      scopeLabel={scope?.label}
      updatedAt={updatedAt}
      href="/app/budget"
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      minHeight={215} // T3: ~215px total card
      headerActions={
        overspendCount > 0 ? (
          <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
            {overspendCount} month{overspendCount > 1 ? "s" : ""} over budget
          </span>
        ) : undefined
      }
    >
      <span className="sr-only">
        12-month budget vs actual consumption trend: {srSummary}
      </span>

      {months.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
          <p className="text-sm">No monthly trend data available.</p>
        </div>
      ) : (
        <div className="flex flex-col justify-between flex-1">
          <AreaChartCard
            data={chartData}
            series={[
              {
                key: "planned",
                name: "Planned",
              },
              {
                key: "actual",
                name: "Actual",
              },
            ]}
            xAxisKey="month"
            height={130} // T3: 130px plot area
            yAxisFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
            accessibilitySummary="Hatched area chart comparing planned vs actual monthly consumption"
          />
        </div>
      )}
    </WidgetShell>
  );
}
