"use client";

import React from "react";
import { WidgetShell } from "../WidgetShell";
import { StatusTooltipIcon } from "../StatusTooltipIcon";
import { WidgetProps } from "@/lib/dashboard/registry";
import { ContractRunwayData } from "@/types/dashboard";
import { DashboardListRow } from "../DashboardListRow";
import { AlertCircle, ChevronRight, Building2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function ContractRunwayWidget({
  scope,
  data,
  isLoading,
  error,
  onRetry,
  updatedAt,
}: WidgetProps<ContractRunwayData>) {
  const buckets = data?.buckets || [];
  const vendors = data?.byVendor || [];
  const replacementWindowCount = data?.replacementWindowOpen ?? 0;

  return (
    <WidgetShell
      title="Contract runway"
      scopeLabel={scope?.label}
      updatedAt={updatedAt}
      href="/app/workforce"
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      minHeight={215}
      headerActions={
        replacementWindowCount > 0 ? (
          <StatusTooltipIcon
            status="WARNING"
            label={`${replacementWindowCount} in window`}
            tooltipTitle="Contract Expirations & Replacement Window"
            tooltipDescription={`${replacementWindowCount} contractor engagement(s) are inside the replacement window (<60 days). Requisition creation recommended.`}
            tooltipDetails={[
              { label: "Inside Window", value: `${replacementWindowCount}` },
              { label: "Active Vendors", value: `${vendors.length}` },
            ]}
            showBorder
          />
        ) : undefined
      }
    >

      {!data ? (
        <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
          No contract runway data available.
        </div>
      ) : (
        <div className="flex flex-col gap-3 w-full">
          {/* Top Buckets Row with Bucket-Style Bars */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {buckets.map((bucket, i) => {
              const maxBucketCount = Math.max(...buckets.map((b) => b.count), 1);
              const totalContracts = buckets.reduce((sum, b) => sum + b.count, 0) || 1;
              const barPercent = Math.max(4, Math.min(100, (bucket.count / maxBucketCount) * 100));
              const sharePercent = Math.round((bucket.count / totalContracts) * 100);
              const barColor =
                i === 0
                  ? "var(--danger-border, #B0432C)"
                  : i === 1
                    ? "var(--warning-border, #B4791F)"
                    : "var(--primary)";

              return (
                <div
                  key={bucket.range}
                  className="p-2.5 rounded-sm bg-muted/30 border hover:bg-accent border-foreground/10 dark:border-foreground/4 transition-colors flex flex-col justify-between"
                >
                  <span className="text-[11px] font-medium text-muted-foreground truncate mb-1">
                    {bucket.label}
                  </span>
                  <div className="flex items-baseline justify-between gap-1">
                    <span
                      className={cn(
                        "text-lg font-bold tabular-nums leading-none",
                        i === 0
                          ? "text-danger-text"
                          : i === 1
                            ? "text-warning-text"
                            : "text-foreground"
                      )}
                    >
                      {bucket.count}
                    </span>
                    <span className="text-[10.5px] text-muted-foreground tabular-nums">
                      {sharePercent}%
                    </span>
                  </div>

                  {/* Bucket-style visual bar per C2 */}
                  <div
                    className="w-full bg-muted/60 dark:bg-slate-800/80 rounded-full h-1.5 mt-2 overflow-hidden"
                    role="progressbar"
                    aria-valuenow={bucket.count}
                    aria-valuemin={0}
                    aria-valuemax={maxBucketCount}
                    aria-label={`${bucket.label}: ${bucket.count} contracts (${sharePercent}%)`}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${barPercent}%`,
                        backgroundColor: barColor,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Replacement Window Alert */}
          {replacementWindowCount > 0 && (
            <Link
              href="/app/workforce?filter=ending-soon"
              className="flex items-center justify-between px-3.5 py-2.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-300 group hover:bg-amber-500/15 transition-colors shadow-2xs"
            >
              <div className="flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
                <span className="text-xs font-medium">
                  {replacementWindowCount} engagement{replacementWindowCount !== 1 ? 's' : ''} inside replacement window
                </span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
            </Link>
          )}

          {/* Vendors T9 List */}
          {vendors.length > 0 && (
            <div className="flex flex-col gap-2">
              {vendors.slice(0, 3).map((v) => (
                <DashboardListRow
                  key={v.vendorId}
                  icon={Building2}
                  title={v.name}
                  subtitle={`${v.active} active resources`}
                  trailing={
                    v.endingWithin90Days > 0 ? (
                      <span className="text-amber-600 dark:text-amber-400 tabular-nums">
                        {v.endingWithin90Days} ending &lt;90d
                      </span>
                    ) : (
                      <span className="text-muted-foreground tabular-nums">
                        0 ending
                      </span>
                    )
                  }
                  href={`/app/workforce?vendor=${v.vendorId}`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </WidgetShell>
  );
}
