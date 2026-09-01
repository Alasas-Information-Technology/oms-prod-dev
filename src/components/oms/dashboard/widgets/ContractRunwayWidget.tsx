"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { WidgetShell } from "../WidgetShell";
import { WidgetProps } from "@/src/lib/dashboard/registry";
import { ContractRunwayData, VendorContractRunwayItem } from "@/src/types/dashboard";
import { DataTable, ColumnDef } from "@/components/shared/DataTable";
import { AlertCircle, ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function ContractRunwayWidget({
  scope,
  data,
  isLoading,
  error,
  onRetry,
}: WidgetProps<ContractRunwayData>) {
  const router = useRouter();

  const buckets = data?.buckets || [];
  const vendors = data?.byVendor || [];
  const replacementWindowCount = data?.replacementWindowOpen ?? 0;

  const vendorColumns: ColumnDef<VendorContractRunwayItem>[] = [
    {
      key: "name",
      header: "Vendor",
      render: (val, row) => <span className="font-medium">{row.name}</span>,
    },
    {
      key: "active",
      header: "Active Resources",
      align: "right",
      render: (val, row) => <span className="tabular-nums font-mono">{row.active}</span>,
    },
    {
      key: "endingWithin90Days",
      header: "Ending < 90d",
      align: "right",
      render: (val, row) => (
        <span className={cn("tabular-nums font-mono font-medium", row.endingWithin90Days > 0 ? "text-amber-600 dark:text-amber-500" : "text-muted-foreground")}>
          {row.endingWithin90Days}
        </span>
      ),
    },
  ];

  return (
    <WidgetShell
      title="Contract runway"
      scopeLabel={scope?.label}
      href="/app/workforce"
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      minHeight={260}
    >
      {!data ? (
        <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
          No contract runway data available.
        </div>
      ) : (
        <div className="flex flex-col gap-5 pt-1 pb-2">
          
          {/* Top Buckets Row */}
          <div className="grid grid-cols-4 gap-3">
            {buckets.map((bucket, i) => (
              <div 
                key={bucket.range} 
                className="flex flex-col p-3 rounded-lg border border-border/60 bg-muted/20"
              >
                <span className="text-[11px] font-medium text-muted-foreground truncate mb-1">
                  {bucket.label}
                </span>
                <span className={cn(
                  "text-xl font-bold font-mono tabular-nums",
                  i === 0 ? "text-red-600 dark:text-red-500" : i === 1 ? "text-amber-600 dark:text-amber-500" : "text-foreground"
                )}>
                  {bucket.count}
                </span>
              </div>
            ))}
          </div>

          {/* Replacement Window Alert */}
          {replacementWindowCount > 0 && (
            <Link 
              href="/app/workforce?filter=ending-soon" 
              className="flex items-center justify-between p-3 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-800 dark:text-amber-400 group hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-colors"
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="size-4 shrink-0" />
                <span className="text-sm font-medium">
                  {replacementWindowCount} engagement{replacementWindowCount !== 1 ? 's' : ''} {replacementWindowCount !== 1 ? 'are' : 'is'} inside the replacement window
                </span>
              </div>
              <ChevronRight className="size-4 opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
            </Link>
          )}

          {/* Vendors Table */}
          {vendors.length > 0 && (
            <div className="mt-1">
              <DataTable
                columns={vendorColumns}
                data={vendors}
                keyField="vendorId"
                compact
                hidePagination
                className="text-sm"
              />
            </div>
          )}
        </div>
      )}
    </WidgetShell>
  );
}
