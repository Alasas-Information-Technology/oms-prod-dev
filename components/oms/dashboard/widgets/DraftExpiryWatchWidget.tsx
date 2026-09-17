"use client";

import React, { useMemo } from "react";
import { WidgetShell } from "../WidgetShell";
import { StatusTooltipIcon } from "../StatusTooltipIcon";
import { WidgetProps } from "@/lib/dashboard/registry";
import { DraftExpiryWatchData } from "@/types/dashboard";
import { DashboardListRow } from "../DashboardListRow";
import { ColumnChart } from "../ColumnChart";
import { Trash2, FileEdit } from "lucide-react";
import { formatAmount } from "@/lib/money";

export function DraftExpiryWatchWidget({
  scope,
  data,
  isLoading,
  error,
  onRetry,
  updatedAt,
}: WidgetProps<DraftExpiryWatchData>) {
  const count = data?.draftsExpiringCount ?? 0;
  const days = data?.soonestDaysRemaining ?? 0;
  const items = data?.items || [];

  // Discrete period buckets for DotMatrix when count > 1
  const matrixData = useMemo(() => {
    if (count <= 1) return [];
    return [
      {
        label: "< 7d",
        count: items.filter((d) => d.daysRemaining <= 7).length,
      },
      {
        label: "7–14d",
        count: items.filter((d) => d.daysRemaining > 7 && d.daysRemaining <= 14).length,
      },
      {
        label: "15–30d",
        count: items.filter((d) => d.daysRemaining > 14 && d.daysRemaining <= 30).length,
      },
      {
        label: "30–60d",
        count: items.filter((d) => d.daysRemaining > 30).length,
      },
    ];
  }, [items, count]);

  return (
    <WidgetShell
      title="Draft expiry watch"
      scopeLabel={scope?.label}
      href="/app/requests?tab=drafts"
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      updatedAt={updatedAt}
      minHeight={215}
      headerActions={
        count > 0 ? (
          <StatusTooltipIcon
            status="WARNING"
            label={`${count} expiring`}
            tooltipTitle="Draft Requisitions Expiring Soon"
            tooltipDescription={`${count} draft requisition(s) are nearing the automated 60-day purge threshold (soonest in ${days} days).`}
            tooltipDetails={[
              { label: "Expiring Drafts", value: `${count}` },
              { label: "Soonest Deletion", value: `in ${days} days` },
            ]}
            showBorder
          />
        ) : undefined
      }
    >
      {count === 0 ? (
        // Empty State: Part 1.2 allow-list
        <div className="flex flex-col items-center justify-center py-10 text-center gap-1.5 text-muted-foreground">
          <Trash2 className="w-6 h-6 text-muted-foreground/40" />
          <p className="text-xs">No drafts nearing deletion.</p>
        </div>
      ) : count === 1 ? (
        // TASK 6 / Part 1.2 Single Fact Allow-list: Exactly one draft falls onto text-only (no chart forced)
        <div className="flex flex-col gap-2.5 py-1 w-full select-none">
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/20 border border-border/30 dark:border-white/[0.04]">
            <span className="text-xs text-foreground/90">
              <span className="font-semibold text-warning-text">1 draft</span> will be permanently deleted in{" "}
              <span className="font-semibold tabular-nums text-foreground">{days} days</span>.
            </span>
          </div>

          {items.length > 0 && (
            <DashboardListRow
              key={items[0].requestId}
              icon={FileEdit}
              title={items[0].title}
              subtitle={items[0].requestId}
              trailing={
                <span className="text-danger-text tabular-nums font-semibold">
                  {items[0].daysRemaining}d left
                </span>
              }
              trailingSubtitle={
                items[0].estimatedAmountFils !== undefined
                  ? formatAmount(items[0].estimatedAmountFils)
                  : undefined
              }
              href={`/app/requests/${items[0].requestId}`}
            />
          )}
        </div>
      ) : (
        // TASK 6: More than one draft expiring -> Render DotMatrix chart
        <div className="flex flex-col gap-2.5 w-full select-none">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs text-muted-foreground">
              {count} drafts across 60-day purge schedule:
            </span>
            <span className="text-[11px] font-medium text-warning-text">
              Soonest: {days}d
            </span>
          </div>

          {/* Better Chart: ColumnChart */}
          <div className="h-[120px] w-full pt-2">
            <ColumnChart
              data={matrixData}
              xAxisKey="label"
              series={[
                { key: "count", name: "Drafts", color: "var(--danger-border)" }
              ]}
              accessibilitySummary={`${count} drafts expiring across purge windows`}
              height={100}
            />
          </div>

          {/* Soonest Draft List Rows (max 2) */}
          <div className="flex flex-col gap-2 pt-3 border-t border-border/30">
            {items.slice(0, 2).map((item) => (
              <DashboardListRow
                key={item.requestId}
                icon={FileEdit}
                title={item.title}
                subtitle={item.requestId}
                trailing={
                  <span className="text-danger-text tabular-nums font-semibold">
                    {item.daysRemaining}d left
                  </span>
                }
                trailingSubtitle={
                  item.estimatedAmountFils !== undefined
                    ? formatAmount(item.estimatedAmountFils)
                    : undefined
                }
                href={`/app/requests/${item.requestId}`}
              />
            ))}
          </div>
        </div>
      )}
    </WidgetShell>
  );
}
