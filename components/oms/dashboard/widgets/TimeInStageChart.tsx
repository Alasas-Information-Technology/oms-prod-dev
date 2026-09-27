"use client";

import React, { useMemo, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from "recharts";
import { WidgetShell } from "../WidgetShell";
import { WidgetProps } from "@/lib/dashboard/registry";
import { TimeInStageData, TimeInStageItem } from "@/types/dashboard";
import { DataTable, ColumnDef } from "@/components/shared/DataTable";
import { cn } from "@/lib/utils";

/** Curated authoritative palette: DIEZ Navy, Cobalt Blue, Teal, Slate, with Amber for Bottleneck */
const STAGE_COLOR_MAP: Record<string, string> = {
  DRAFT: "#1B2B5C",
  LINE_MANAGER: "#475569",
  HOD: "#0D9488",
  HR_REVIEW: "#D97706",
  PROCUREMENT: "#2563EB",
};

const FALLBACK_PALETTE = [
  "#1B2B5C",
  "#2563EB",
  "#0D9488",
  "#475569",
  "#6366F1",
  "#0284C7",
];

export function TimeInStageChart({
  scope,
  data,
  isLoading,
  error,
  onRetry,
  updatedAt,
}: WidgetProps<TimeInStageData>) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const stages = useMemo(() => data?.stages || [], [data]);

  const totalDays = useMemo(() => {
    if (data?.overallAvgDays) return data.overallAvgDays;
    return stages.reduce((acc, s) => acc + s.avgDays, 0);
  }, [data?.overallAvgDays, stages]);

  const slowestStage = useMemo(() => {
    return (
      stages.find((s) => s.isSlowest) ||
      (stages.length
        ? stages.reduce(
            (prev, curr) => (curr.avgDays > prev.avgDays ? curr : prev),
            stages[0]
          )
        : null)
    );
  }, [stages]);

  const processedStages = useMemo(() => {
    let fallbackIdx = 0;
    return stages.map((stage) => {
      let color = stage.isSlowest
        ? "#D97706"
        : STAGE_COLOR_MAP[stage.stage];
      if (!color) {
        color = FALLBACK_PALETTE[fallbackIdx % FALLBACK_PALETTE.length];
        fallbackIdx++;
      }
      const percent = totalDays > 0 ? (stage.avgDays / totalDays) * 100 : 0;
      return {
        ...stage,
        color,
        percent,
      };
    });
  }, [stages, totalDays]);

  // Caption: e.g. "HR Review is taking 2.3× the stage average"
  const caption = useMemo(() => {
    if (!slowestStage || totalDays <= 0)
      return "Workflow durations within expected limits";
    const deptAvg =
      data?.departmentAvgDays || (stages.length ? totalDays / stages.length : 1);
    const ratio = (slowestStage.avgDays / (deptAvg || 1)).toFixed(1);
    return `${slowestStage.label} is taking ${ratio}× the stage average`;
  }, [slowestStage, totalDays, data?.departmentAvgDays, stages.length]);

  // Mobile Table columns
  const tableColumns: ColumnDef<any>[] = [
    {
      key: "label",
      header: "Stage",
      render: (val, row) => (
        <div className="flex items-center gap-1.5 font-medium text-foreground">
          <span>{row.label}</span>
          {row.isSlowest && (
            <span className="text-[10px] text-amber-700 dark:text-amber-300 font-bold bg-amber-500/15 px-1.5 py-0.5 rounded">
              Slowest
            </span>
          )}
        </div>
      ),
    },
    {
      key: "avgDays",
      header: "Avg Days",
      align: "right",
      render: (val: any) => (
        <span className="tabular-nums text-foreground font-semibold">
          {typeof val === "number" ? val.toFixed(1) : String(val)}d
        </span>
      ),
    },
    {
      key: "targetDays",
      header: "Target",
      align: "right",
      render: (val: any) => (
        <span className="tabular-nums text-muted-foreground">
          {val ? `${val}d` : "—"}
        </span>
      ),
    },
  ];

  return (
    <WidgetShell
      title="Time in stage"
      scopeLabel={scope?.label}
      updatedAt={updatedAt}
      href="/app/requests"
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      minHeight={280}
    >
      <span className="sr-only">
        {caption}. Total cycle average is {totalDays.toFixed(1)} days.
      </span>

      {stages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
          <p className="text-sm">No workflow timing data recorded.</p>
        </div>
      ) : (
        <div className="flex flex-col justify-between h-full p-5 gap-3 select-none font-sans">
          {/* Mobile Fallback Table (below 768px) */}
          <div className="block md:hidden overflow-hidden rounded-md border border-border/50">
            <DataTable
              columns={tableColumns}
              data={stages}
              keyField="stage"
              compact
              hidePagination
            />
          </div>

          {/* Desktop Doughnut Chart + Stage Breakdown Legend View */}
          <div className="hidden md:flex flex-row items-center gap-4 lg:gap-6 w-full flex-1">
            {/* Doughnut Ring Chart with Center Metric - Enlarged Hero */}
            <div className="relative w-[160px] h-[160px] sm:w-[175px] sm:h-[175px] shrink-0 mx-auto">
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center select-none">
                <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground tabular-nums leading-none">
                  {totalDays.toFixed(1)}d
                </span>
                <span className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-0.5">
                  Total Cycle
                </span>
              </div>

              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={processedStages}
                    cx="50%"
                    cy="50%"
                    innerRadius="60%"
                    outerRadius="90%"
                    paddingAngle={2.5}
                    dataKey="avgDays"
                    stroke="none"
                    cornerRadius={2.5}
                    onMouseEnter={(_, index) => setHoveredIdx(index)}
                    onMouseLeave={() => setHoveredIdx(null)}
                  >
                    {processedStages.map((entry, index) => (
                      <Cell
                        key={`stage-cell-${entry.stage}`}
                        fill={entry.color}
                        opacity={
                          hoveredIdx === null || hoveredIdx === index
                            ? 1
                            : 0.35
                        }
                        className="transition-opacity duration-200 cursor-pointer"
                      />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    cursor={false}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0]
                          .payload as (typeof processedStages)[0];
                        const delta = item.targetDays
                          ? item.avgDays - item.targetDays
                          : null;
                        const isOver = delta !== null && delta > 0;
                        return (
                          <div className="rounded-lg border border-border bg-popover/95 backdrop-blur-xs px-3 py-2 shadow-xl z-50 text-xs">
                            <div className="flex items-center gap-2 mb-1">
                              <div
                                className="size-2 rounded-xs shrink-0"
                                style={{ backgroundColor: item.color }}
                              />
                              <span className="font-semibold text-foreground">
                                {item.label}
                              </span>
                            </div>
                            <div className="flex items-baseline gap-2 mb-1">
                              <span className="text-sm font-bold text-foreground tabular-nums">
                                {item.avgDays} days
                              </span>
                              <span className="text-[11px] text-muted-foreground tabular-nums">
                                ({item.percent.toFixed(1)}% of cycle)
                              </span>
                            </div>
                            <div className="text-[10px] text-muted-foreground pt-1 border-t border-border/50 flex items-center justify-between gap-3">
                              <span>
                                Target SLA:{" "}
                                {item.targetDays ? `${item.targetDays}d` : "—"}
                              </span>
                              {delta !== null && (
                                <span
                                  className={cn(
                                    "font-semibold",
                                    isOver
                                      ? "text-amber-600 dark:text-amber-400"
                                      : "text-emerald-600 dark:text-emerald-400"
                                  )}
                                >
                                  {isOver
                                    ? `+${delta.toFixed(1)}d over`
                                    : `${Math.abs(delta).toFixed(1)}d under`}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Stage Breakdown List / Legend - Compact & Refined */}
            <div className="flex flex-col gap-1 flex-1 min-w-0 w-full justify-center">
              {processedStages.map((stage, idx) => {
                const isHovered = hoveredIdx === idx;
                const isOverTarget =
                  stage.targetDays && stage.avgDays > stage.targetDays;
                return (
                  <div
                    key={stage.stage}
                    onMouseEnter={() => setHoveredIdx(idx)}
                    onMouseLeave={() => setHoveredIdx(null)}
                    className={cn(
                      "flex items-center justify-between text-[11px] px-1.5 py-0.5 rounded transition-colors cursor-default",
                      isHovered ? "bg-muted/60" : "hover:bg-muted/30",
                      stage.isSlowest &&
                        "bg-amber-500/[0.07] dark:bg-amber-950/20"
                    )}
                  >
                    {/* Stage Name & Color Pip */}
                    <div className="flex items-center gap-1.5 min-w-0 pr-1.5">
                      <span
                        className="size-1.5 rounded-full shrink-0"
                        style={{ backgroundColor: stage.color }}
                      />
                      <span
                        className={cn(
                          "truncate text-[10.5px]",
                          stage.isSlowest
                            ? "text-amber-950 dark:text-amber-200 font-bold"
                            : "text-foreground font-medium"
                        )}
                        title={stage.label}
                      >
                        {stage.label}
                      </span>
                    </div>

                    {/* Value, % and SLA Indicator */}
                    <div className="flex items-center gap-1 shrink-0 tabular-nums text-[10.5px]">
                      <span className="font-semibold text-foreground">
                        {stage.avgDays}d
                      </span>
                      <span className="text-[9.5px] text-muted-foreground w-6 text-right">
                        {stage.percent.toFixed(0)}%
                      </span>
                      {stage.isSlowest ? (
                        <span className="text-[8.5px] font-bold text-amber-700 dark:text-amber-300 bg-amber-500/15 px-1 py-0.2 rounded shrink-0">
                          Slowest
                        </span>
                      ) : isOverTarget ? (
                        <span className="text-[8.5px] font-medium text-amber-600 dark:text-amber-400">
                          +{((stage.avgDays - stage.targetDays!)).toFixed(1)}d
                        </span>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Assessment & Contextual Caption */}
          <div className="pt-2 border-t border-border/40 flex items-center justify-between text-xs mt-auto">
            <span className="font-medium text-[11.5px] text-amber-700 dark:text-amber-400 truncate mr-2">
              {caption}
            </span>
            <span className="text-[10.5px] text-muted-foreground tabular-nums shrink-0">
              Dept avg: {totalDays.toFixed(1)}d
            </span>
          </div>
        </div>
      )}
    </WidgetShell>
  );
}
