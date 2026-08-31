"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle2, ChevronRight, Play, RefreshCw, ShieldAlert, ShieldCheck } from "lucide-react";
import { WidgetShell } from "../WidgetShell";
import { WidgetProps } from "@/src/lib/dashboard/registry";
import { DataIntegrityChecksData, DataIntegrityCheckItem } from "@/src/types/dashboard";
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

export function DataIntegrityChecksWidget({
  scope,
  data,
  isLoading,
  error,
  onRetry,
  updatedAt,
}: WidgetProps<DataIntegrityChecksData>) {
  const [isRunning, setIsRunning] = useState(false);

  const rawChecks = data?.checks || [];

  // Sort failed checks first, and within failed checks sort CRITICAL severity first
  const sortedChecks = [...rawChecks].sort((a, b) => {
    const aFailed = a.state === "FAILED" ? 1 : 0;
    const bFailed = b.state === "FAILED" ? 1 : 0;
    if (bFailed !== aFailed) return bFailed - aFailed;

    const severityWeight = { CRITICAL: 3, HIGH: 2, MEDIUM: 1 };
    return (severityWeight[b.severity] || 0) - (severityWeight[a.severity] || 0);
  });

  const failedCount = sortedChecks.filter((c) => c.state === "FAILED").length;
  const allPassed = data?.allPassed ?? failedCount === 0;

  const handleRunChecks = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsRunning(true);
    setTimeout(() => {
      setIsRunning(false);
      if (onRetry) onRetry();
    }, 1200);
  };

  return (
    <WidgetShell
      title="Data integrity checks"
      scopeLabel={scope?.label}
      updatedAt={updatedAt}
      href="/app/administration/integrity"
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      minHeight={240}
      headerActions={
        <div className="flex items-center gap-2">
          {failedCount > 0 ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-600 dark:text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
              <ShieldAlert className="w-3 h-3" />
              {failedCount} failed
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              <ShieldCheck className="w-3 h-3" />
              All clean
            </span>
          )}

          <button
            onClick={handleRunChecks}
            disabled={isRunning || isLoading}
            className="inline-flex items-center gap-1 text-[11.5px] font-medium text-foreground bg-muted hover:bg-muted/80 px-2.5 py-1 rounded transition-colors disabled:opacity-50"
            title="Trigger automated data sanity check suite"
          >
            <RefreshCw className={cn("w-3 h-3", isRunning && "animate-spin text-primary")} />
            <span className="hidden sm:inline">{isRunning ? "Running..." : "Run checks"}</span>
          </button>
        </div>
      }
    >
      <div className="space-y-1 select-none">
        {sortedChecks.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted-foreground">
            No integrity checks registered.
          </div>
        ) : (
          sortedChecks.map((check) => {
            const isFailed = check.state === "FAILED";
            const isCritical = check.severity === "CRITICAL";

            return (
              <Link
                key={check.code}
                href={check.detailLink || "/app/administration/integrity"}
                className={cn(
                  "group flex items-center justify-between h-[44px] px-3.5 rounded-md transition-colors duration-150 border",
                  isFailed
                    ? cn(
                        "bg-red-500/10 border-red-500/30 dark:bg-red-950/20 dark:border-red-900/40 hover:bg-red-500/15",
                        isCritical && "border-l-4 border-l-red-600 dark:border-l-red-500"
                      )
                    : "bg-background/40 hover:bg-muted/50 border-transparent hover:border-border/40"
                )}
              >
                {/* Left: Icon + Label + Last Run */}
                <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
                  {isFailed ? (
                    <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  )}

                  <div className="flex flex-col min-w-0">
                    <span
                      className={cn(
                        "text-[13px] font-medium truncate leading-tight group-hover:text-primary transition-colors",
                        isFailed ? "text-red-700 dark:text-red-300 font-semibold" : "text-foreground"
                      )}
                    >
                      {check.label}
                    </span>
                    <span className="text-[11px] text-muted-foreground truncate leading-tight mt-0.5">
                      Checked {formatRelativeTime(check.lastRunAt)}
                    </span>
                  </div>
                </div>

                {/* Right: State & Affected Count Badge */}
                <div className="flex items-center gap-2.5 shrink-0">
                  {isFailed ? (
                    <span className="text-[11.5px] font-bold text-red-600 dark:text-red-400 bg-red-500/20 px-2 py-0.5 rounded border border-red-500/30 tabular-nums">
                      {check.affectedCount} affected
                    </span>
                  ) : (
                    <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-500/15 px-2 py-0.5 rounded uppercase tracking-wider">
                      Pass
                    </span>
                  )}

                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-transform group-hover:translate-x-0.5" />
                </div>
              </Link>
            );
          })
        )}
      </div>
    </WidgetShell>
  );
}
