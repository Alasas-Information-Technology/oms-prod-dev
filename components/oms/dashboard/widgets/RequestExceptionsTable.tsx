"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { WidgetShell } from "../WidgetShell";
import { StatusTooltipIcon } from "../StatusTooltipIcon";
import { WidgetProps } from "@/lib/dashboard/registry";
import { RequestExceptionsData, RequestExceptionItem, RequestExceptionType } from "@/types/dashboard";
import { DashboardListRow } from "../DashboardListRow";
import { SeverityDot } from "../SeverityDot";
import {
  ClockAlert,
  AlertTriangle,
  FileWarning,
  Hourglass,
  UserX,
  type LucideIcon
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Exception TYPE is conveyed strictly by icon, never by colour per
 * DASHBOARD-ADMIN-WIDGETS.md and DASHBOARD-VISUAL-COVERAGE-GEMINI.md C3.
 * Severity is conveyed by SeverityDot (three allowed colours).
 */
const EXCEPTION_CONFIG: Record<RequestExceptionType, { icon: LucideIcon; label: string }> = {
  SLA_BREACH: {
    icon: ClockAlert,
    label: "SLA Breach",
  },
  BUDGET_MISMATCH: {
    icon: AlertTriangle,
    label: "Budget Mismatch",
  },
  RECONCILIATION_VARIANCE: {
    icon: FileWarning,
    label: "Reconciliation",
  },
  STALLED: {
    icon: Hourglass,
    label: "Stalled",
  },
  APPROVER_UNAVAILABLE: {
    icon: UserX,
    label: "Approver Unavailable",
  },
};

export function RequestExceptionsTable({
  scope,
  data,
  isLoading,
  error,
  onRetry,
  updatedAt,
}: WidgetProps<RequestExceptionsData>) {
  const router = useRouter();

  const items = data?.items || [];
  const displayItems = items.slice(0, 5);
  const totalCount = items.length;
  const highSeverityCount = items.filter(i => i.severity === "HIGH").length;

  const handleRowClick = (row: RequestExceptionItem) => {
    if (row.type === "RECONCILIATION_VARIANCE") {
      router.push(`/app/budget/reconciliation`);
    } else {
      router.push(`/app/requests/${row.requestId}`);
    }
  };

  return (
    <WidgetShell
      title="Request exceptions"
      scopeLabel={scope?.label}
      updatedAt={updatedAt}
      href="/app/requests?filter=exceptions"
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      minHeight={215}
      headerActions={
        totalCount > 0 ? (
          <StatusTooltipIcon
            status={highSeverityCount > 0 ? "FAILED" : "WARNING"}
            label={`${totalCount} exception${totalCount === 1 ? "" : "s"}`}
            tooltipTitle="Requisition Workflow Exceptions"
            tooltipDescription={
              highSeverityCount > 0
                ? `${highSeverityCount} high-severity exception(s) detected (SLA breaches, budget mismatches, or unavailable approvers).`
                : `${totalCount} workflow exception(s) require review or reassignment.`
            }
            tooltipDetails={[
              { label: "Total Exceptions", value: `${totalCount}` },
              { label: "High Severity", value: `${highSeverityCount}` },
            ]}
            showBorder
          />
        ) : undefined
      }
    >
      <span className="sr-only">
        Workflow exceptions: {totalCount} total exceptions, {highSeverityCount} high severity.
      </span>

      {items.length === 0 ? (
        <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
          No request exceptions in the selected scope.
        </div>
      ) : (
        <div className="flex flex-col gap-2 w-full">
          {displayItems.map((item) => {
            const config = EXCEPTION_CONFIG[item.type] || EXCEPTION_CONFIG.SLA_BREACH;
            const Icon = config.icon;

            return (
              <DashboardListRow
                key={item.id}
                leading={<SeverityDot severity={item.severity} label={`${item.severity} severity`} className="mr-0.5" />}
                icon={Icon}
                iconBg="bg-muted/40 dark:bg-slate-800/60"
                iconColor="text-foreground/70"
                title={item.detail}
                subtitle={`${item.requestCode || item.requestId} · ${item.owner?.name || "Unassigned"}`}
                trailing={
                  <span className="text-muted-foreground tabular-nums">
                    {item.ageDays}d old
                  </span>
                }
                trailingSubtitle={
                  <span
                    className={cn(
                      "text-[11px]",
                      item.severity === "HIGH"
                        ? "text-danger-text font-semibold"
                        : item.severity === "MEDIUM"
                          ? "text-warning-text font-semibold"
                          : "text-muted-foreground font-normal"
                    )}
                  >
                    {item.severity === "HIGH"
                      ? "High Severity"
                      : item.severity === "MEDIUM"
                        ? "Medium Severity"
                        : "Low Severity"} · {config.label}
                  </span>
                }
                onClick={() => handleRowClick(item)}
              />
            );
          })}
        </div>
      )}
    </WidgetShell>
  );
}
