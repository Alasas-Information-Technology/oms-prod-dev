"use client";

import React, { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Clock,
} from "lucide-react";
import { WidgetShell } from "../WidgetShell";
import { StatusTooltipIcon } from "../StatusTooltipIcon";
import { WidgetProps } from "@/lib/dashboard/registry";
import { BackgroundJobHealthData } from "@/types/dashboard";
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
        <StatusTooltipIcon
          status={hasIssues ? "WARNING" : "HEALTHY"}
          label={hasIssues ? "Issues detected" : "All healthy"}
          tooltipTitle={hasIssues ? "Background Daemons: Action Required" : "All Background Daemons Operational"}
          tooltipDescription={
            hasIssues
              ? "One or more background jobs failed or missed scheduled execution windows."
              : "All 5 scheduled background daemon tasks are running on schedule without errors."
          }
          tooltipDetails={[
            { label: "Active Jobs", value: `${sortedJobs.length} daemons` },
            { label: "Health Check", value: "Live" },
          ]}
          showBorder
        />
      }
    >
      <div className="space-y-1 select-none">
        {sortedJobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center text-muted-foreground text-xs">
            <Clock className="w-5 h-5 mb-1.5 opacity-50" />
            No background jobs scheduled.
          </div>
        ) : (
          sortedJobs.map((job) => {
            const isMissed = job.missedWindows > 0;
            const isFailed = job.lastOutcome === "FAILED";
            const isPartial = job.lastOutcome === "PARTIAL";
            const isExpanded = expandedJob === job.code;

            const outcomeStatus = isMissed ? "STALLED" : job.lastOutcome;

            return (
              <div
                key={job.code}
                className={cn(
                  "rounded-lg transition-colors duration-150 border",
                  isMissed || isFailed
                    ? "bg-rose-500/10 border-rose-500/30 dark:bg-rose-950/20 dark:border-rose-900/40"
                    : isPartial
                    ? "bg-amber-500/10 border-amber-500/30 dark:bg-amber-950/20 dark:border-amber-900/40"
                    : "bg-muted/20 hover:bg-muted/50 border-border/30 dark:border-white/[0.04]"
                )}
              >
                <div
                  onClick={() => setExpandedJob(isExpanded ? null : job.code)}
                  className="flex items-center justify-between min-h-[40px] px-3 py-1 cursor-pointer gap-2"
                >
                  {/* Left: Job Name & Schedule */}
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="flex flex-col min-w-0">
                      <span
                        className={cn(
                          "text-[12.5px] font-medium truncate leading-tight",
                          isMissed || isFailed
                            ? "text-rose-700 dark:text-rose-300 font-semibold"
                            : "text-foreground/90"
                        )}
                      >
                        {job.label}
                      </span>
                      <span className="text-[10.5px] text-muted-foreground truncate leading-tight mt-0.5">
                        {job.schedule} · last run {formatRelativeTime(job.lastRunAt)}
                      </span>
                    </div>
                  </div>

                  {/* Right: Duration + Status Tooltip Icon */}
                  <div className="flex items-center gap-2 shrink-0">
                    {/* Duration & Items Count (Subtle text) */}
                    {!isMissed && (
                      <div className="flex items-center gap-1.5 text-right font-mono text-[11px] tabular-nums text-muted-foreground">
                        <span className="font-medium text-foreground/80">{formatDuration(job.durationMs)}</span>
                        <span className="text-muted-foreground/60">·</span>
                        <span>{job.itemsProcessed} items</span>
                      </div>
                    )}

                    {isMissed && (
                      <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 bg-rose-500/20 px-1.5 py-0.2 rounded border border-rose-500/30 tabular-nums">
                        Missed {job.missedWindows} run{job.missedWindows > 1 ? "s" : ""}
                      </span>
                    )}

                    {/* Compact Status Icon with Tooltip */}
                    <StatusTooltipIcon
                      status={outcomeStatus}
                      tooltipTitle={`Job: ${job.label}`}
                      tooltipDescription={`Outcome: ${outcomeStatus}. Execution took ${formatDuration(job.durationMs)} to process ${job.itemsProcessed} items.`}
                      tooltipDetails={[
                        { label: "Status", value: outcomeStatus },
                        { label: "Schedule", value: job.schedule },
                        { label: "Duration", value: formatDuration(job.durationMs) },
                        { label: "Items Processed", value: `${job.itemsProcessed} items` },
                        { label: "Last Run", value: formatRelativeTime(job.lastRunAt) },
                      ]}
                      size="sm"
                    />

                    {/* Expand Toggle Chevron if error exists */}
                    {job.lastError ? (
                      isExpanded ? (
                        <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                      )
                    ) : null}
                  </div>
                </div>

                {/* Expanded Details / Error Callout */}
                {isExpanded && job.lastError && (
                  <div className="px-3 pb-2.5 pt-1 border-t border-border/20 text-xs">
                    <div className="p-2 rounded bg-rose-500/15 text-rose-700 dark:text-rose-300 font-mono text-[10.5px] break-all border border-rose-500/30">
                      <strong className="block font-sans font-semibold mb-0.5">Failure Detail:</strong>
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
