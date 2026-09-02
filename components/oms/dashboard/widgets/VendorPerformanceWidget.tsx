"use client";

import React from "react";
import { WidgetShell } from "../WidgetShell";
import { WidgetProps } from "@/lib/dashboard/registry";
import { VendorPerformanceData } from "@/types/dashboard";
import { DashboardListRow } from "../DashboardListRow";
import { SegmentedBar } from "../SegmentedBar";
import { Building2 } from "lucide-react";

export function VendorPerformanceWidget({
  scope,
  data,
  isLoading,
  error,
  onRetry,
  updatedAt,
}: WidgetProps<VendorPerformanceData>) {
  const vendors = data?.vendors || [];

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
    >
      {!data || vendors.length === 0 ? (
        <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
          No vendor performance data available.
        </div>
      ) : (
        <div className="flex flex-col gap-1 w-full">
          {vendors.slice(0, 4).map((v) => (
            <DashboardListRow
              key={v.vendorId}
              icon={Building2}
              title={v.name}
              subtitle={`${v.avgTimeToSubmitDays}d avg time`}
              center={
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-muted-foreground">Acceptance:</span>
                  <SegmentedBar value={v.acceptanceRatePercent} />
                </div>
              }
              trailing={
                <span className="font-mono tabular-nums">
                  {v.submissionRatePercent}%
                </span>
              }
              trailingSubtitle="submission"
              href={`/app/vendors/${v.vendorId}`}
            />
          ))}
        </div>
      )}
    </WidgetShell>
  );
}
