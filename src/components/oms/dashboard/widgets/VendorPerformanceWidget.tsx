"use client";

import React from "react";
import { WidgetShell } from "../WidgetShell";
import { WidgetProps } from "@/src/lib/dashboard/registry";
import { VendorPerformanceData, VendorPerformanceItem } from "@/src/types/dashboard";
import { DataTable, ColumnDef } from "@/components/shared/DataTable";
import { cn } from "@/lib/utils";

export function VendorPerformanceWidget({
  scope,
  data,
  isLoading,
  error,
  onRetry,
}: WidgetProps<VendorPerformanceData>) {
  
  const vendors = data?.vendors || [];

  const columns: ColumnDef<VendorPerformanceItem>[] = [
    {
      key: "name",
      header: "Vendor",
      render: (val, row) => (
        <span className="font-medium text-foreground truncate block max-w-[150px]" title={row.name}>
          {row.name}
        </span>
      ),
    },
    {
      key: "submissionRatePercent",
      header: "Submission Rate",
      align: "right",
      render: (val, row) => (
        <span className={cn(
          "font-mono tabular-nums",
          row.submissionRatePercent >= 90 ? "text-emerald-600 dark:text-emerald-500" :
          row.submissionRatePercent < 70 ? "text-red-600 dark:text-red-500" : ""
        )}>
          {row.submissionRatePercent}%
        </span>
      ),
    },
    {
      key: "avgTimeToSubmitDays",
      header: "Avg Time",
      align: "right",
      render: (val, row) => (
        <span className="font-mono tabular-nums text-muted-foreground">
          {row.avgTimeToSubmitDays}d
        </span>
      ),
    },
    {
      key: "acceptanceRatePercent",
      header: "Acceptance",
      align: "right",
      render: (val, row) => (
        <span className="font-mono tabular-nums">
          {row.acceptanceRatePercent}%
        </span>
      ),
    },
  ];

  return (
    <WidgetShell
      title="Vendor performance"
      scopeLabel={scope?.label}
      href="/app/vendors"
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      minHeight={240}
    >
      {!data || vendors.length === 0 ? (
        <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
          No vendor performance data available.
        </div>
      ) : (
        <div className="flex flex-col gap-2 mt-1">
          <DataTable
            columns={columns}
            data={vendors.slice(0, 5)} // Top 5 by activity as per requirement
            keyField="vendorId"
            compact
            hidePagination
          />
        </div>
      )}
    </WidgetShell>
  );
}
