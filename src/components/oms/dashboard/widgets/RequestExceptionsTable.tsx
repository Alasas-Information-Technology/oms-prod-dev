"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { WidgetShell } from "../WidgetShell";
import { WidgetProps } from "@/src/lib/dashboard/registry";
import { RequestExceptionsData, RequestExceptionItem, RequestExceptionType } from "@/src/types/dashboard";
import { DataTable, ColumnDef } from "@/components/shared/DataTable";
import { 
  ClockAlert, 
  AlertTriangle, 
  FileWarning, 
  Hourglass, 
  UserX,
  type LucideIcon
} from "lucide-react";
import { cn } from "@/lib/utils";

const EXCEPTION_CONFIG: Record<RequestExceptionType, { icon: LucideIcon; label: string; color: string }> = {
  SLA_BREACH: {
    icon: ClockAlert,
    label: "SLA Breach",
    color: "text-red-500",
  },
  BUDGET_MISMATCH: {
    icon: AlertTriangle,
    label: "Budget Mismatch",
    color: "text-amber-500",
  },
  RECONCILIATION_VARIANCE: {
    icon: FileWarning,
    label: "Reconciliation",
    color: "text-orange-500",
  },
  STALLED: {
    icon: Hourglass,
    label: "Stalled",
    color: "text-blue-500",
  },
  APPROVER_UNAVAILABLE: {
    icon: UserX,
    label: "Approver Unavailable",
    color: "text-purple-500",
  },
};

export function RequestExceptionsTable({
  scope,
  data,
  isLoading,
  error,
  onRetry,
}: WidgetProps<RequestExceptionsData>) {
  const router = useRouter();

  const items = data?.items || [];

  const handleRowClick = (row: RequestExceptionItem) => {
    if (row.type === "RECONCILIATION_VARIANCE") {
      // TODO(integration-ops): link to reconciliation exception queue when module ships
      router.push(`/app/budget/reconciliation`); 
    } else {
      router.push(`/app/requests/${row.requestId}`);
    }
  };

  const columns: ColumnDef<RequestExceptionItem>[] = [
    {
      key: "type",
      header: "Type",
      render: (val, row) => {
        const config = EXCEPTION_CONFIG[row.type];
        const Icon = config.icon;
        return (
          <div className="flex items-center gap-2">
            <Icon className={cn("size-4 shrink-0", config.color)} />
            <span className="font-medium">{config.label}</span>
          </div>
        );
      },
    },
    {
      key: "requestCode",
      header: "Request",
      render: (val, row) => (
        <span className="font-mono text-muted-foreground">{row.requestCode || row.requestId}</span>
      ),
    },
    {
      key: "detail",
      header: "Detail",
      render: (val, row) => <span className="truncate max-w-[150px] inline-block" title={row.detail}>{row.detail}</span>,
    },
    {
      key: "ageDays",
      header: "Age",
      align: "right",
      render: (val, row) => (
        <span className="font-mono tabular-nums">{row.ageDays}d</span>
      ),
    },
    {
      key: "owner",
      header: "Owner",
      render: (val, row) => <span className="text-muted-foreground">{row.owner.name}</span>,
    },
    {
      key: "severity",
      header: "Severity",
      align: "right",
      render: (val, row) => {
        const isHigh = row.severity === "HIGH";
        const isMedium = row.severity === "MEDIUM";
        return (
          <span className={cn(
            "text-xs font-semibold px-2 py-0.5 rounded",
            isHigh ? "bg-red-50 text-red-700" : isMedium ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-700"
          )}>
            {row.severity.charAt(0) + row.severity.slice(1).toLowerCase()}
          </span>
        );
      },
    },
  ];

  return (
    <WidgetShell
      title="Request exceptions"
      scopeLabel={scope?.label}
      href="/app/requests?filter=exceptions"
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      minHeight={260}
    >
      {items.length === 0 ? (
        <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
          No request exceptions in the selected scope.
        </div>
      ) : (
        <div className="mt-1">
          <DataTable
            columns={columns}
            data={items}
            keyField="id"
            compact
            hidePagination
            onRowClick={handleRowClick}
          />
        </div>
      )}
    </WidgetShell>
  );
}
