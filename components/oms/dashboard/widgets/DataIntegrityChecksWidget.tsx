"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle2, ChevronRight, Play, RefreshCw, ShieldAlert, ShieldCheck } from "lucide-react";
import { WidgetShell } from "../WidgetShell";
import { StatusTooltipIcon } from "../StatusTooltipIcon";
import { WidgetProps } from "@/lib/dashboard/registry";
import { DataIntegrityChecksData, DataIntegrityCheckItem } from "@/types/dashboard";
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
          <StatusTooltipIcon
            status={failedCount > 0 ? "FAILED" : "CLEAN"}
            label={failedCount > 0 ? `${failedCount} issues` : "All clean"}
            tooltipTitle={failedCount > 0 ? "Integrity Alert" : "Data Integrity Healthy"}
            tooltipDescription={
              failedCount > 0
                ? `${failedCount} data consistency checks failed. Immediate investigation recommended.`
                : "All database and ledger cross-system validation checks passed without errors."
            }
            tooltipDetails={[
              { label: "Checks Run", value: `${sortedChecks.length} checks` },
              { label: "Status", value: failedCount > 0 ? "Attention Required" : "100% Passed" },
            ]}
            showBorder
          />

          <button
            onClick={handleRunChecks}
            disabled={isRunning || isLoading}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-foreground bg-muted/60 hover:bg-muted px-2 py-0.5 rounded transition-colors disabled:opacity-50 border border-border/40"
            title="Trigger automated data sanity check suite"
          >
            <RefreshCw className={cn("w-3 h-3", isRunning && "animate-spin text-primary")} />
            <span className="hidden sm:inline">{isRunning ? "Running..." : "Run checks"}</span>
          </button>
        </div>
      }
    >
      <div className="space-y-0.5 select-none">
        {sortedChecks.length === 0 ? (
          <div className="py-6 text-center text-xs text-muted-foreground">
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
                  "group flex items-center justify-between h-[40px] px-2.5 sm:px-3 rounded-lg transition-colors duration-150 border",
                  isFailed
                    ? cn(
                        "bg-rose-500/10 border-rose-500/30 dark:bg-rose-950/20 dark:border-rose-900/40 hover:bg-rose-500/15",
                        isCritical && "border-l-4 border-l-rose-600 dark:border-l-rose-500"
                      )
                    : "bg-transparent hover:bg-muted/40 border-transparent hover:border-border/30 dark:hover:border-white/[0.04]"
                )}
              >
                {/* Left: Label + Last Run */}
                <div className="flex items-center gap-2 min-w-0 flex-1 pr-2">
                  <div className="flex flex-col min-w-0">
                    <span
                      className={cn(
                        "text-[12.5px] font-medium truncate leading-tight group-hover:text-primary transition-colors",
                        isFailed ? "text-rose-700 dark:text-rose-300 font-semibold" : "text-foreground/90"
                      )}
                    >
                      {check.label}
                    </span>
                    <span className="text-[10.5px] text-muted-foreground truncate leading-tight mt-0.5">
                      Checked {formatRelativeTime(check.lastRunAt)}
                    </span>
                  </div>
                </div>

                {/* Right: State & Affected Count with Tooltip */}
                <div className="flex items-center gap-2 shrink-0">
                  {isFailed ? (
                    <StatusTooltipIcon
                      status="FAILED"
                      label={`${check.affectedCount} affected`}
                      tooltipTitle={`Failed Check: ${check.label}`}
                      tooltipDescription={`Severity: ${check.severity}. Found ${check.affectedCount} discrepancies requiring remediation.`}
                      tooltipDetails={[
                        { label: "Status", value: "Failed" },
                        { label: "Severity", value: check.severity },
                        { label: "Affected Entities", value: String(check.affectedCount) },
                        { label: "Last Checked", value: formatRelativeTime(check.lastRunAt) },
                      ]}
                      size="sm"
                    />
                  ) : (
                    <StatusTooltipIcon
                      status="PASS"
                      tooltipTitle={`Passed Check: ${check.label}`}
                      tooltipDescription={`Data integrity verified. 0 discrepancies detected.`}
                      tooltipDetails={[
                        { label: "Status", value: "Passed" },
                        { label: "Severity Level", value: check.severity },
                        { label: "Last Checked", value: formatRelativeTime(check.lastRunAt) },
                      ]}
                      size="sm"
                    />
                  )}

                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60 group-hover:text-foreground transition-transform group-hover:translate-x-0.5" />
                </div>
              </Link>
            );
          })
        )}
      </div>
    </WidgetShell>
  );
}
