"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  ExternalLink,
  RotateCcw,
  XCircle,
} from "lucide-react";
import { WidgetShell } from "../WidgetShell";
import { WidgetProps } from "@/src/lib/dashboard/registry";
import { BackgroundJobHealthData, ScheduledJobStatus } from "@/src/types/dashboard";
import { cn } from "@/lib/utils";

function formatRelativeTime(isoDate: string): string {
  try {
    const diffMs = Date.now() - new Date(isoDate).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  } catch {
    return isoDate;
  }
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

export function BackgroundJobHealthWidget({
  scope,
  data,
  isLoading,
  error,
  onRetry,
  updatedAt,
}: WidgetProps<BackgroundJobHealthData>) {
  const [expandedJob, setExpandedJob] = useState<string | null>(null);

  const rawJobs = data?.jobs || [];

  // Sort failing (FAILED) and missed (missedWindows > 0) jobs FIRST
  const sortedJobs = [...rawJobs].sort((a, b) => {
    const aSeverity = (a.missedWindows > 0 ? 2 : 0) + (a.lastOutcome === "FAILED" ? 2 : a.lastOutcome === "PARTIAL" ? 1 : 0);
    const bSeverity = (b.missedWindows > 0 ? 2 : 0) + (b.lastOutcome === "FAILED" ? 2 : b.lastOutcome === "PARTIAL" ? 1 : 0);
    return bSeverity - aSeverity;
  });

  const hasIssues = data?.anyFailing || data?.anyMissedWindow || sortedJobs.some(j => j.missedWindows > 0 || j.lastOutcome === "FAILED");

  return (
    <WidgetShell
      title="Background job health"
      scopeLabel={scope?.label}
      updatedAt={updatedAt}
      href="/app/administration/jobs"
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      minHeight={240}
      headerActions={
        hasIssues ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-600 dark:text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
            <AlertTriangle className="w-3 h-3" />
            Action required
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" />
            All daemons operational
          </span>
        )
      }
    >
      <div className="space-y-1.5 select-none">
        {sortedJobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground text-sm">
            <Clock className="w-6 h-6 mb-2 opacity-50" />
            No background jobs scheduled.
          </div>
        ) : (
          sortedJobs.map((job) => {
            const isMissed = job.missedWindows > 0;
            const isFailed = job.lastOutcome === "FAILED";
            const isPartial = job.lastOutcome === "PARTIAL";
            const isExpanded = expandedJob === job.code;

            return (
              <div
                key={job.code}
                className={cn(
                  "rounded-md transition-colors duration-150 border",
                  isMissed || isFailed
                    ? "bg-red-500/10 border-red-500/30 dark:bg-red-950/20 dark:border-red-900/40"
                    : isPartial
                    ? "bg-amber-500/10 border-amber-500/30 dark:bg-amber-950/20 dark:border-amber-900/40"
                    : "bg-background/40 hover:bg-muted/50 border-border/40"
                )}
              >
                <div
                  onClick={() => setExpandedJob(isExpanded ? null : job.code)}
                  className="flex items-center justify-between min-h-[44px] px-3.5 py-1.5 cursor-pointer gap-2"
                >
                  {/* Left: Indicator + Job Name & Schedule */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {isMissed || isFailed ? (
                      <XCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                    ) : isPartial ? (
                      <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    )}

                    <div className="flex flex-col min-w-0">
                      <span className={cn(
                        "text-[13px] font-medium truncate leading-tight",
                        (isMissed || isFailed) ? "text-red-700 dark:text-red-300 font-semibold" : "text-foreground"
                      )}>
                        {job.label}
                      </span>
                      <span className="text-[11px] text-muted-foreground truncate leading-tight mt-0.5">
                        {job.schedule} · last run {formatRelativeTime(job.lastRunAt)}
                      </span>
                    </div>
                  </div>

                  {/* Middle / Right: Outcomes & Prominent missedWindows */}
                  <div className="flex items-center gap-3 shrink-0">
                    {/* CRITICAL: Missed Windows prominence */}
                    {isMissed ? (
                      <span className="text-[12px] font-bold text-red-600 dark:text-red-400 bg-red-500/20 px-2 py-0.5 rounded border border-red-500/30 tabular-nums">
                        Missed {job.missedWindows} run{job.missedWindows > 1 ? "s" : ""}
                      </span>
                    ) : (
                      <div className="hidden sm:flex flex-col items-end text-right">
                        <span className="text-[12px] font-medium text-foreground tabular-nums">
                          {formatDuration(job.durationMs)}
                        </span>
                        <span className="text-[11px] text-muted-foreground tabular-nums">
                          {job.itemsProcessed} item{job.itemsProcessed === 1 ? "" : "s"}
                        </span>
                      </div>
                    )}

                    {/* Outcome Badge */}
                    <span
                      className={cn(
                        "text-[11px] font-semibold px-2 py-0.5 rounded uppercase tracking-wider",
                        isMissed || isFailed
                          ? "bg-red-600 text-white"
                          : isPartial
                          ? "bg-amber-600 text-white"
                          : "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                      )}
                    >
                      {isMissed ? "STALLED" : job.lastOutcome}
                    </span>

                    {/* Expand Toggle Chevron */}
                    {job.lastError ? (
                      isExpanded ? (
                        <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                      )
                    ) : (
                      <span className="w-3.5" />
                    )}
                  </div>
                </div>

                {/* Expanded Details / Error Callout */}
                {isExpanded && job.lastError && (
                  <div className="px-3.5 pb-3 pt-1 border-t border-border/20 text-xs">
                    <div className="p-2.5 rounded bg-red-500/15 text-red-700 dark:text-red-300 font-mono text-[11px] break-all border border-red-500/30">
                      <strong className="block font-sans font-semibold mb-1">Failure Detail:</strong>
                      {job.lastError}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </WidgetShell>
  );
}
