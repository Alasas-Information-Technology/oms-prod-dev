"use client";

import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Cell,
} from "recharts";
import { WidgetShell } from "../WidgetShell";
import { WidgetProps } from "@/src/lib/dashboard/registry";
import { BudgetVsActualTrendData, MonthlyBudgetTrendItem } from "@/src/types/dashboard";
import { formatAbbreviated } from "@/lib/money";

interface ChartTooltipPayload {
  payload: MonthlyBudgetTrendItem;
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: ChartTooltipPayload[];
}) {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0].payload;

  return (
    <div className="bg-popover/95 border border-border/80 shadow-xl rounded-lg p-2.5 text-xs space-y-1.5 backdrop-blur-sm">
      <div className="flex items-center justify-between gap-3 font-semibold text-foreground border-b border-border/40 pb-1">
        <span>{data.month}</span>
        {data.isOverBudget && (
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-500/15 text-rose-600 dark:text-rose-400 font-bold border border-rose-500/30">
            Over budget
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
        <span className="text-muted-foreground">Planned:</span>
        <span className="font-mono text-right text-foreground font-medium">
          {formatAbbreviated(data.plannedFils)}
        </span>
        <span className="text-muted-foreground">Actual:</span>
        <span
          className={`font-mono text-right font-medium ${
            data.isOverBudget ? "text-rose-600 dark:text-rose-400 font-bold" : "text-foreground"
          }`}
        >
          {formatAbbreviated(data.actualFils)}
        </span>
        <span className="text-muted-foreground">Variance:</span>
        <span className="font-mono text-right text-muted-foreground">
          {formatAbbreviated(data.varianceFils)}
        </span>
      </div>
    </div>
  );
}

export function BudgetVsActualTrendChart({
  scope,
  data,
  isLoading,
  error,
  onRetry,
}: WidgetProps<BudgetVsActualTrendData>) {
  const months = data?.months || [];
  const totals = data?.totals;

  const srSummary = months
    .map(
      (m) =>
        `${m.month}: Planned ${formatAbbreviated(m.plannedFils)}, Actual ${formatAbbreviated(m.actualFils)} ${
          m.isOverBudget ? "(Over budget)" : ""
        }`
    )
    .join("; ");

  return (
    <WidgetShell
      title="Budget vs actual trend"
      scopeLabel={scope?.label}
      href="/app/budget"
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      minHeight={280}
      headerActions={
        totals && (
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-muted-foreground text-[11px]">Actual:</span>
            <span className="font-semibold text-foreground">
              {formatAbbreviated(totals.actualFils)}
            </span>
            <span className="text-muted-foreground/60">/</span>
            <span className="text-muted-foreground text-[11px]">Plan:</span>
            <span className="text-muted-foreground font-medium">
              {formatAbbreviated(totals.plannedFils)}
            </span>
          </div>
        )
      }
    >
      {/* Screen Reader Accessible Summary */}
      <span className="sr-only">
        Monthly planned versus actual budget trend: {srSummary}
      </span>

      {months.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
          <p className="text-sm">No budget trend data available.</p>
        </div>
      ) : (
        <div className="flex flex-col justify-between flex-1 gap-2 py-1 w-full">
          {/* Desktop & Tablet Chart View */}
          <div className="hidden md:block w-full h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={months}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                barGap={3}
              >
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  axisLine={{ stroke: "var(--border)", opacity: 0.5 }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => formatAbbreviated(val, { showCurrency: false })}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: "11px", paddingTop: "4px" }}
                  formatter={(value) => (
                    <span className="text-muted-foreground font-medium text-[11px] capitalize">
                      {value}
                    </span>
                  )}
                />
                <Bar
                  dataKey="plannedFils"
                  name="Planned"
                  fill="#94A3B8"
                  radius={[3, 3, 0, 0]}
                  maxBarSize={28}
                />
                <Bar
                  dataKey="actualFils"
                  name="Actual"
                  radius={[3, 3, 0, 0]}
                  maxBarSize={28}
                >
                  {months.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.isOverBudget ? "#EF4444" : "#3B82F6"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Mobile Fallback Table (<768px) */}
          <div className="md:hidden flex flex-col divide-y divide-border/40 text-xs">
            {months.map((m) => (
              <div key={m.month} className="flex items-center justify-between py-2 px-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">{m.month}</span>
                  {m.isOverBudget && (
                    <span className="px-1.5 py-0.2 rounded bg-rose-500/15 text-rose-600 dark:text-rose-400 font-semibold text-[10px]">
                      Over
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 font-mono">
                  <span className={m.isOverBudget ? "text-rose-600 font-bold" : "text-foreground"}>
                    {formatAbbreviated(m.actualFils)}
                  </span>
                  <span className="text-muted-foreground">/ {formatAbbreviated(m.plannedFils)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </WidgetShell>
  );
}
