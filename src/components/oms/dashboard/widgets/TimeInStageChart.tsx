"use client";

import React from "react";
import { WidgetShell } from "../WidgetShell";
import { WidgetProps } from "@/src/lib/dashboard/registry";
import { TimeInStageData } from "@/src/types/dashboard";
import { cn } from "@/lib/utils";

export function TimeInStageChart({
  scope,
  data,
  isLoading,
  error,
  onRetry,
}: WidgetProps<TimeInStageData>) {
  const stages = React.useMemo(() => data?.stages || [], [data]);
  const overallAvg = data?.overallAvgDays ?? 0;

  // Maximum value for scaling bar widths
  const maxDays = React.useMemo(() => {
    if (!stages.length) return 10;
    return Math.max(...stages.map((s) => Math.max(s.avgDays, s.targetDays))) * 1.2;
  }, [stages]);

  const srSummary = stages
    .map(
      (s) =>
        `${s.label}: avg ${s.avgDays} days (target ${s.targetDays} days) ${
          s.isSlowest ? "[Slowest stage]" : ""
        }`
    )
    .join("; ");

  return (
    <WidgetShell
      title="Time in stage"
      scopeLabel={scope?.label}
      href="/app/requests"
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      minHeight={280}
      headerActions={
        overallAvg > 0 && (
          <span className="text-xs font-medium text-muted-foreground bg-muted/60 px-2 py-0.5 rounded border border-border/40 font-mono">
            Overall avg: <strong className="text-foreground">{overallAvg}d</strong>
          </span>
        )
      }
    >
      {/* Screen Reader Accessible Summary */}
      <span className="sr-only">
        Workflow stage average duration: {srSummary}. Overall average: {overallAvg} days.
      </span>

      {stages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
          <p className="text-sm">No workflow timing data recorded.</p>
        </div>
      ) : (
        <div className="flex flex-col justify-between flex-1 gap-2.5 py-1">
          {stages.map((stage) => {
            const barWidth = Math.min((stage.avgDays / maxDays) * 100, 100);
            const targetPos = Math.min((stage.targetDays / maxDays) * 100, 100);

            return (
              <div
                key={stage.stage}
                className={cn(
                  "flex flex-col gap-1.5 p-2 rounded-lg border text-left transition-all",
                  stage.isSlowest
                    ? "border-amber-500/40 bg-amber-500/5 dark:bg-amber-950/20"
                    : "border-border/40 bg-card/40 hover:bg-muted/40"
                )}
              >
                {/* Stage Title + Slowest Badge + Durations */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs font-medium text-foreground truncate">
                      {stage.label}
                    </span>
                    {stage.isSlowest && (
                      <span className="shrink-0 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                        Slowest stage
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0 font-mono text-xs">
                    <span
                      className={cn(
                        "font-semibold tabular-nums",
                        stage.isSlowest ? "text-amber-600 dark:text-amber-400" : "text-foreground"
                      )}
                    >
                      {stage.avgDays}d
                    </span>
                    <span className="text-[10px] text-muted-foreground tabular-nums">
                      (target {stage.targetDays}d)
                    </span>
                  </div>
                </div>

                {/* Bar with Target Indicator */}
                <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted/70 flex">
                  {/* Actual Duration Bar */}
                  <div
                    style={{ width: `${Math.max(barWidth, 3)}%` }}
                    className={cn(
                      "h-full transition-all duration-300 rounded-full",
                      stage.isSlowest
                        ? "bg-amber-500 dark:bg-amber-600"
                        : "bg-blue-500 dark:bg-blue-600"
                    )}
                  />
                  {/* Target Reference Line */}
                  <div
                    style={{ left: `${targetPos}%` }}
                    className="absolute top-0 bottom-0 w-0.5 bg-foreground/40 z-10"
                    title={`Target: ${stage.targetDays} days`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </WidgetShell>
  );
}
