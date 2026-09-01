"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { WidgetShell } from "../WidgetShell";
import { WidgetProps } from "@/lib/dashboard/registry";
import { RequestExceptionsData, RequestExceptionItem, RequestExceptionType } from "@/types/dashboard";
import { DashboardListRow } from "../DashboardListRow";
import { 
  ClockAlert, 
  AlertTriangle, 
  FileWarning, 
  Hourglass, 
  UserX,
  type LucideIcon
} from "lucide-react";

const EXCEPTION_CONFIG: Record<RequestExceptionType, { icon: LucideIcon; label: string; color: string; bg: string }> = {
  SLA_BREACH: {
    icon: ClockAlert,
    label: "SLA Breach",
    color: "text-rose-600 dark:text-rose-400",
    bg: "bg-rose-500/10",
  },
  BUDGET_MISMATCH: {
    icon: AlertTriangle,
    label: "Budget Mismatch",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-500/10",
  },
  RECONCILIATION_VARIANCE: {
    icon: FileWarning,
    label: "Reconciliation",
    color: "text-orange-600 dark:text-orange-400",
    bg: "bg-orange-500/10",
  },
  STALLED: {
    icon: Hourglass,
    label: "Stalled",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-500/10",
  },
  APPROVER_UNAVAILABLE: {
    icon: UserX,
    label: "Approver Unavailable",
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-500/10",
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
    >
      {items.length === 0 ? (
        <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
          No request exceptions in the selected scope.
        </div>
      ) : (
        <div className="flex flex-col gap-1 w-full">
          {displayItems.map((item) => {
            const config = EXCEPTION_CONFIG[item.type] || EXCEPTION_CONFIG.SLA_BREACH;
            const Icon = config.icon;

            return (
              <DashboardListRow
                key={item.id}
                icon={Icon}
                iconBg={config.bg}
                iconColor={config.color}
                title={item.detail}
                subtitle={`${item.requestCode || item.requestId} · ${item.owner?.name || "Unassigned"}`}
                trailing={
                  <span className="text-muted-foreground font-mono tabular-nums">
                    {item.ageDays}d old
                  </span>
                }
                trailingSubtitle={
                  item.severity === "HIGH" ? (
                    <span className="text-rose-600 dark:text-rose-400 font-semibold">High Severity</span>
                  ) : (
                    <span className="text-muted-foreground">{config.label}</span>
                  )
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
