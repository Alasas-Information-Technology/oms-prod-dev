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
          {/* Top Buckets Row */}
          <div className="grid grid-cols-4 gap-2.5">
            {buckets.map((bucket, i) => (
              <div 
                key={bucket.range} 
                className="flex flex-col p-3 rounded-md border border-border/60 bg-muted/30 dark:bg-slate-800/30 shadow-2xs"
              >
                <span className="text-[11px] font-medium text-muted-foreground truncate mb-1">
                  {bucket.label}
                </span>
                <span className={cn(
                  "text-lg font-bold font-mono tabular-nums leading-none",
                  i === 0 ? "text-rose-600 dark:text-rose-400" : i === 1 ? "text-amber-600 dark:text-amber-400" : "text-foreground"
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
            <div className="flex flex-col gap-1">
              {vendors.slice(0, 3).map((v) => (
                <DashboardListRow
                  key={v.vendorId}
                  icon={Building2}
                  title={v.name}
                  subtitle={`${v.active} active resources`}
                  trailing={
                    v.endingWithin90Days > 0 ? (
                      <span className="text-amber-600 dark:text-amber-400 font-mono tabular-nums">
                        {v.endingWithin90Days} ending &lt;90d
                      </span>
                    ) : (
                      <span className="text-muted-foreground font-mono tabular-nums">
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
