"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { WidgetShell } from "../WidgetShell";
import { WidgetProps } from "@/lib/dashboard/registry";
import { VendorPerformanceData, VendorPerformanceItem } from "@/types/dashboard";
import { DataTable, ColumnDef } from "@/components/shared/DataTable";
import { Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function VendorPerformanceWidget({
  scope,
  data,
  isLoading,
  error,
  onRetry,
  updatedAt,
}: WidgetProps<VendorPerformanceData>) {
  const vendors = data?.vendors || [];
  // Top 5 vendors by activity per Part 2 Band D & DASHBOARD-PLAN.md D6
  const topVendors = useMemo(() => vendors.slice(0, 5), [vendors]);

  const mobileColumns: ColumnDef<VendorPerformanceItem>[] = useMemo(
    () => [
      {
        key: "name",
        header: "Vendor",
        render: (_, row) => (
          <span className="font-medium text-foreground truncate max-w-[140px] block">
            {row.name}
          </span>
        ),
      },
      {
        key: "submissionRatePercent",
        header: "Sub %",
        render: (val) => (
          <span className="tabular-nums font-semibold text-foreground">
            {Number(val).toFixed(1)}%
          </span>
        ),
      },
      {
        key: "acceptanceRatePercent",
        header: "Acc %",
        render: (val) => (
          <span className="tabular-nums font-semibold text-foreground">
            {Number(val).toFixed(1)}%
          </span>
        ),
      },
      {
        key: "avgTimeToSubmitDays",
        header: "Avg Time",
        render: (val) => (
          <span className="tabular-nums text-muted-foreground">
            {Number(val).toFixed(1)}d
          </span>
        ),
      },
    ],
    []
  );

  return (
    <WidgetShell
      title="Vendor performance"
      scopeLabel={scope?.label}
      updatedAt={updatedAt}
      href="/app/vendors"
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      minHeight={215}
      headerActions={
        topVendors.length > 0 ? (
          <span className="text-[11px] text-muted-foreground tabular-nums bg-muted/40 px-2 py-0.5 rounded border border-border/30">
            Top {topVendors.length} active
          </span>
        ) : undefined
      }
    >
      <span className="sr-only">
        Vendor performance: Top {topVendors.length} vendors by activity showing submission rate and acceptance rate.
      </span>

      {!data || topVendors.length === 0 ? (
        <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
          No vendor performance data available.
        </div>
      ) : (
        <div className="w-full">
          {/* Mobile DataTable Fallback (< 768px) */}
          <div className="block md:hidden w-full">
            <DataTable
              data={topVendors}
              columns={mobileColumns}
              keyField="vendorId"
              compact
              hidePagination
            />
          </div>

          {/* Desktop Horizontal Bars (>= 768px) */}
          <div className="hidden md:flex flex-col gap-2.5 w-full">
            {topVendors.map((v) => (
              <div
                key={v.vendorId}
                className="flex flex-col gap-1.5 p-2.5 sm:p-3 rounded-sm transition-colors border hover:bg-accent border-foreground/10 dark:border-foreground/4"
              >
                {/* Header: Vendor Name & Subtitle */}
                <div className="flex items-center justify-between text-xs">
                  <Link
                    href={`/app/vendors/${v.vendorId}`}
                    className="font-medium text-foreground hover:underline truncate max-w-[210px]"
                    title={v.name}
                  >
                    {v.name}
                  </Link>
                  <span className="text-[11px] text-muted-foreground tabular-nums">
                    {v.avgTimeToSubmitDays}d avg turnaround · {v.activePlacements} active
                  </span>
                </div>

                {/* Horizontal Bars for Submission & Acceptance Rate */}
                <div className="grid grid-cols-2 gap-3 text-[11px] pt-0.5">
                  {/* Submission Rate Bar */}
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-muted-foreground text-[10.5px]">Submission rate</span>
                      <span className="text-xs font-semibold tabular-nums text-foreground">
                        {v.submissionRatePercent.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-muted/60 dark:bg-slate-800/80 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[var(--accent-interactive,var(--primary))] transition-all duration-300"
                        style={{
                          width: `${Math.min(100, Math.max(2, v.submissionRatePercent))}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Acceptance Rate Bar (Single hue at descending opacity) */}
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-muted-foreground text-[10.5px]">Acceptance rate</span>
                      <span className="text-xs font-semibold tabular-nums text-foreground">
                        {v.acceptanceRatePercent.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-muted/60 dark:bg-slate-800/80 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[var(--accent-interactive,var(--primary))] opacity-75 transition-all duration-300"
                        style={{
                          width: `${Math.min(100, Math.max(2, v.acceptanceRatePercent))}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </WidgetShell>
  );
}
