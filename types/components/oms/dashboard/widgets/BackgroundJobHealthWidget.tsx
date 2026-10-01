"use client";

import React, { useState } from "react";
import Link from "next/link";
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
import { SeverityDot, SeverityLevel } from "../SeverityDot";

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
      <div className="space-y-2 select-none">
        {sortedJobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center text-muted-foreground text-xs">
            <Clock className="w-5 h-5 mb-1.5 opacity-50" />
            No background jobs scheduled.
          </div>
        ) : (
          sortedJobs.slice(0, 4).map((job) => {
            const isMissed = job.missedWindows > 0;
            const isFailed = job.lastOutcome === "FAILED";
            const isPartial = job.lastOutcome === "PARTIAL";
            const isExpanded = expandedJob === job.code;

            const outcomeStatus = isMissed ? "STALLED" : job.lastOutcome;
            const severity: SeverityLevel = isMissed || isFailed ? "HIGH" : isPartial ? "MEDIUM" : "LOW";

            return (
              <div
                key={job.code}
                className={cn(
                  "rounded-sm transition-colors duration-150 border h-[48px]",
                  isMissed || isFailed
                    ? "bg-[var(--danger-surface)] border-[var(--danger-border)]/50"
                    : isPartial
                      ? "bg-[var(--warning-surface)] border-[var(--warning-border)]/50"
                      : "bg-muted/20 hover:bg-accent border-foreground/10 dark:border-foreground/4"
                )}
              >
                <div
                  onClick={() => setExpandedJob(isExpanded ? null : job.code)}
                  className="flex items-center justify-between min-h-[40px] px-3 py-1 cursor-pointer gap-2"
                >
                  {/* Left: Status/Severity Dot + Job Name & Schedule */}
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <SeverityDot
                      severity={severity}
                      label={`Job status: ${outcomeStatus}`}
                      className="shrink-0"
                    />
                    <div className="flex flex-col min-w-0">
                      <span
                        className={cn(
                          "text-[12px] font-medium truncate",
                          isMissed || isFailed ? "text-danger-text font-semibold" : "text-foreground"
                        )}
                      >
                        {job.label}
                      </span>
                      <span className="text-[10.5px] text-muted-foreground">
                        {job.schedule} · last run {formatRelativeTime(job.lastRunAt)}
                      </span>
                    </div>
                  </div>

                  {/* Right: Metrics / Missed Badge / State */}
                  <div className="flex items-center gap-2 shrink-0">
                    {/* CRITICAL Correctness Feature: Preserved Missed Windows Prominence */}
                    {isMissed ? (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-[var(--danger-surface)] text-danger-text border border-danger-border animate-pulse">
                        Missed {job.missedWindows} run{job.missedWindows > 1 ? "s" : ""}
                      </span>
                    ) : (
                      <div className="text-right hidden sm:block">
                        <span className="text-[11px] font-medium text-foreground tabular-nums">
                          {formatDuration(job.durationMs)}
                        </span>
                        <span className="text-[10px] text-muted-foreground ml-1">
                          · {job.itemsProcessed} items
                        </span>
                      </div>
                    )}

                    {/* Chevron for expandable errors */}
                    {job.lastError ? (
                      isExpanded ? (
                        <ChevronDown className="w-3.5 h-3.5 text-danger-text" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                      )
                    ) : null}
                  </div>
                </div>

                {/* Expanded Details / Error Callout */}
                {isExpanded && job.lastError && (
                  <div className="px-3 pb-2.5 pt-1 border-t border-border/20 text-xs">
                    <div className="p-2 rounded bg-[var(--danger-surface)] text-danger-text text-[10.5px] break-all border border-[var(--danger-border)]">
                      <strong className="block font-sans font-semibold mb-0.5">Failure Detail:</strong>
                      {job.lastError}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}

        {sortedJobs.length > 4 && (
          <div className="pt-1 text-center">
            <Link
              href="/app/administration/jobs"
              className="text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              View all {sortedJobs.length} background jobs →
            </Link>
          </div>
        )}
      </div>
    </WidgetShell>
  );
}
