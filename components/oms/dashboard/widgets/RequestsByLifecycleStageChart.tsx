"use client";

import React, { useMemo, useState } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { WidgetShell } from "../WidgetShell";
import { WidgetProps } from "@/lib/dashboard/registry";
import { RequestsByLifecycleStageData } from "@/types/dashboard";
import { cn } from "@/lib/utils";

// Distinct, vibrant stage palette
const STAGE_COLORS: Record<string, { fill: string; bg: string; text: string }> = {
  DRAFT: {
    fill: "#3B82F6", // Blue 500
    bg: "bg-blue-500/10",
    text: "text-blue-600 dark:text-blue-400",
  },
  IN_APPROVAL: {
    fill: "#10B981", // Emerald 500
    bg: "bg-emerald-500/10",
    text: "text-emerald-600 dark:text-emerald-400",
  },
  HR_REVIEW: {
    fill: "#8B5CF6", // Purple 500
    bg: "bg-purple-500/10",
    text: "text-purple-600 dark:text-purple-400",
  },
  PROCUREMENT: {
    fill: "#F59E0B", // Amber 500
    bg: "bg-amber-500/10",
    text: "text-amber-600 dark:text-amber-400",
  },
  ONBOARDING: {
    fill: "#06B6D4", // Cyan 500
    bg: "bg-cyan-500/10",
    text: "text-cyan-600 dark:text-cyan-400",
  },
};

const DEFAULT_COLOR = {
  fill: "#64748B",
  bg: "bg-slate-500/10",
  text: "text-slate-600 dark:text-slate-400",
};

export function RequestsByLifecycleStageChart({
  scope,
  data,
  isLoading,
  error,
  onRetry,
  updatedAt,
}: WidgetProps<RequestsByLifecycleStageData>) {
  const [period, setPeriod] = useState<"30d" | "90d" | "FY">("90d");
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const stages = useMemo(() => data?.stages || [], [data]);
  const totalRequests = useMemo(() => {
    return stages.reduce((sum, s) => sum + s.count, 0) || data?.totalRequests || 0;
  }, [stages, data?.totalRequests]);

  const chartData = useMemo(() => {
    return stages.map((s) => {
      const colorScheme = STAGE_COLORS[s.stage] || DEFAULT_COLOR;
      const percent = totalRequests > 0 ? (s.count / totalRequests) * 100 : 0;
      return {
        name: s.label || s.stage,
        stage: s.stage,
        value: s.count,
        percent: percent.toFixed(1),
        fill: colorScheme.fill,
        bg: colorScheme.bg,
        textColor: colorScheme.text,
      };
    });
  }, [stages, totalRequests]);

  const activeItem = activeIndex !== null && chartData[activeIndex] ? chartData[activeIndex] : null;

  return (
    <WidgetShell
      title="Requests by stage"
      scopeLabel={scope?.label}
      updatedAt={updatedAt}
      href="/app/requests"
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      minHeight={240}
      headerActions={
        /* Compact, non-intrusive period toggle */
        <div className="flex items-center p-0.5 rounded-lg bg-muted/50 border border-border/40 text-[11px] font-medium select-none">
          {(["30d", "90d", "FY"] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              className={cn(
                "px-2 py-0.5 rounded-md transition-all duration-150 leading-tight cursor-pointer",
                period === p
                  ? "bg-background text-foreground font-semibold shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {p === "FY" ? "FY" : p}
            </button>
          ))}
        </div>
      }
    >
      {stages.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 py-8 text-center text-muted-foreground">
          <p className="text-xs">No requests recorded in the selected period.</p>
        </div>
      ) : (
        <div className="flex flex-col justify-between p-3 sm:p-4 flex-1 w-full h-full min-h-[220px]">
          {/* Main Pie/Donut Chart taking up maximum space */}
          <div className="relative w-full flex-1 min-h-[160px] sm:min-h-[175px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload;
                      return (
                        <div className="bg-popover/95 border border-border/80 shadow-md backdrop-blur-md rounded-lg px-2.5 py-1.5 text-xs">
                          <p className="font-bold text-foreground">{item.name}</p>
                          <p className="text-muted-foreground mt-0.5">
                            <span className="font-semibold text-foreground">{item.value}</span> requests (
                            {item.percent}%)
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={56}
                  outerRadius={78}
                  paddingAngle={3}
                  cornerRadius={4}
                  dataKey="value"
                  strokeWidth={0}
                  onMouseEnter={(_, index) => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(null)}
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.fill}
                      opacity={activeIndex === null || activeIndex === index ? 1 : 0.35}
                      className="transition-opacity duration-200 cursor-pointer outline-none"
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            {/* Central Badge in Donut Hole */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center select-none">
              <span className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight leading-none">
                {activeItem ? activeItem.value : totalRequests}
              </span>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1 truncate max-w-[100px]">
                {activeItem ? activeItem.name : "Total"}
              </span>
            </div>
          </div>

          {/* Minimal Inline Legend */}
          <div className="flex flex-wrap items-center justify-center gap-x-3.5 gap-y-1.5 pt-2.5 mt-1 border-t border-border/40 select-none">
            {chartData.map((item, idx) => {
              const isHovered = activeIndex === idx;
              return (
                <div
                  key={item.stage}
                  onMouseEnter={() => setActiveIndex(idx)}
                  onMouseLeave={() => setActiveIndex(null)}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md cursor-pointer transition-all duration-150",
                    isHovered
                      ? "bg-muted text-foreground font-bold shadow-2xs scale-105"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span
                    className="size-2 rounded-full shrink-0 shadow-2xs"
                    style={{ backgroundColor: item.fill }}
                  />
                  <span className="text-xs font-medium">{item.name}</span>
                  <span className="text-xs font-bold text-foreground tabular-nums">
                    {item.value}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </WidgetShell>
  );
}
