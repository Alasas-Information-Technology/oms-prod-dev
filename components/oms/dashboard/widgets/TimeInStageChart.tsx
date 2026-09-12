"use client";

import React, { useMemo } from "react";
import { WidgetShell } from "../WidgetShell";
import { WidgetProps } from "@/lib/dashboard/registry";
import { TimeInStageData } from "@/types/dashboard";
import { categoricalScale } from "@/lib/dashboard/chart-tokens";
import { DataTable, ColumnDef } from "@/components/shared/DataTable";

/**
 * V5 — Time in stage with bottleneck per DASHBOARD-VISUAL-DEPTH.md:
 * - Horizontal bars, average days per stage, one hue by rank
 * - The slowest stage gets the warning colour and an explicit "Slowest stage" label
 * - A dashed target line where an SLA exists
 * - Caption: "HR Review is taking 2.3× the department average"
 */
export function TimeInStageChart({
  scope,
  data,
  isLoading,
  error,
  onRetry,
  updatedAt,
}: WidgetProps<TimeInStageData>) {
  const stages = useMemo(() => data?.stages || [], [data]);
  const overallAvg = data?.overallAvgDays ?? (stages.length ? stages.reduce((acc, s) => acc + s.avgDays, 0) / stages.length : 1);

  // Single hue scale by rank
  const rankScale = useMemo(() => categoricalScale(Math.max(stages.length, 1)), [stages.length]);

  const slowestStage = useMemo(() => {
    return (
      stages.find((s) => s.isSlowest) ||
      (stages.length ? stages.reduce((prev, curr) => (curr.avgDays > prev.avgDays ? curr : prev), stages[0]) : null)
    );
  }, [stages]);

  const maxVal = useMemo(() => {
    if (!stages.length) return 10;
    const maxDay = Math.max(...stages.map((s) => Math.max(s.avgDays, s.targetDays || 0)));
    return Math.ceil(maxDay * 1.15);
  }, [stages]);

  // Caption: e.g. "HR Review is taking 2.3x the department average"
  const caption = useMemo(() => {
    if (!slowestStage || overallAvg <= 0) return "Workflow durations within expected limits";
    const ratio = (slowestStage.avgDays / overallAvg).toFixed(1);
    return `${slowestStage.label} is taking ${ratio}× the department average`;
  }, [slowestStage, overallAvg]);

  // Mobile Table columns
  const tableColumns: ColumnDef<any>[] = [
    {
      key: "label",
      header: "Stage",
      render: (val, row) => (
        <div className="flex items-center gap-1.5 font-medium text-foreground">
          <span>{row.label}</span>
          {row.isSlowest && (
            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold bg-amber-500/10 px-1.5 py-0.2 rounded">
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
      render: (val: any) => <span className="font-mono tabular-nums text-foreground">{typeof val === "number" ? val : String(val)}d</span>,
    },
    {
      key: "targetDays",
      header: "Target",
      align: "right",
      render: (val: any) => <span className="font-mono tabular-nums text-muted-foreground">{val ? `${val}d` : "—"}</span>,
    },
  ];

  // Stage colors: Blue, Indigo, Violet, Cyan, Amber/Rose
  const stagePalette = ["#3b82f6", "#6366f1", "#8b5cf6", "#06b6d4", "#f59e0b"];

  return (
    <WidgetShell
      title="Time in stage"
      scopeLabel={scope?.label}
      updatedAt={updatedAt}
      href="/app/requests"
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      minHeight={180}
    >
      <span className="sr-only">
        {caption}. Overall average is {overallAvg.toFixed(1)} days.
      </span>

      {stages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-6 text-center text-muted-foreground">
          <p className="text-sm">No workflow timing data recorded.</p>
        </div>
      ) : (
        <div className="flex flex-col justify-between h-full gap-2.5 select-none font-sans py-1">
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

          {/* Desktop Horizontal Bars View */}
          <div className="hidden md:flex flex-col gap-2 w-full">
            {stages.map((stage, idx) => {
              const isSlowest = stage.isSlowest || stage === slowestStage;
              const barPercent = Math.min(100, Math.max(5, (stage.avgDays / maxVal) * 100));
              const targetPercent = stage.targetDays
                ? Math.min(100, (stage.targetDays / maxVal) * 100)
                : null;
              const barColor = isSlowest
                ? "#f43f5e"
                : stagePalette[idx % stagePalette.length];

              return (
                <div key={stage.stage || idx} className="flex flex-col gap-0.5 w-full">
                  {/* Row Label & Numeric Values */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium text-foreground/90 text-[12px]">{stage.label}</span>
                      {isSlowest && (
                        <span className="text-[9.5px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-500/10 px-1.5 py-0.2 rounded border border-rose-500/20">
                          Slowest
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 font-mono text-[11px] tabular-nums">
                      <span className="font-semibold text-foreground">{stage.avgDays}d</span>
                      {stage.targetDays && (
                        <span className="text-muted-foreground">(target {stage.targetDays}d)</span>
                      )}
                    </div>
                  </div>

                  {/* Horizontal Bar Track with Target SLA Marker */}
                  <div className="relative h-2 w-full bg-muted/40 dark:bg-slate-800/60 rounded-full overflow-hidden">
                    <div
                      style={{
                        width: `${barPercent}%`,
                        backgroundColor: barColor,
                      }}
                      className="h-full rounded-full transition-all duration-300 shadow-2xs"
                    />
                    {/* Target SLA dashed line */}
                    {targetPercent !== null && (
                      <div
                        style={{ left: `${targetPercent}%` }}
                        className="absolute top-0 bottom-0 w-[2px] bg-foreground/70 border-l border-dashed border-background z-10"
                        title={`SLA Target: ${stage.targetDays} days`}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Assessment & Contextual Caption */}
          <div className="pt-2 border-t border-border/30 dark:border-white/[0.05] flex items-center justify-between text-xs mt-auto">
            <span className="font-medium text-[11.5px] text-amber-600 dark:text-amber-400">
              {caption}
            </span>
            <span className="text-[10.5px] text-muted-foreground font-mono tabular-nums">
              Dept avg: {overallAvg.toFixed(1)}d
            </span>
          </div>
        </div>
      )}
    </WidgetShell>
  );
}
