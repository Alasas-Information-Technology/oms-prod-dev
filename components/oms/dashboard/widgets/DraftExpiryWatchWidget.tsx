"use client";

import React from "react";
import { WidgetShell } from "../WidgetShell";
import { WidgetProps } from "@/lib/dashboard/registry";
import { DraftExpiryWatchData } from "@/types/dashboard";
import { DashboardListRow } from "../DashboardListRow";
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
          <span className="px-2 py-0.5 text-[11px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-500/10 rounded border border-rose-500/20">
            {count} draft{count !== 1 ? "s" : ""} · {days}d left
          </span>
        ) : undefined
      }
    >
      {count === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center gap-1.5 text-muted-foreground">
          <Trash2 className="w-6 h-6 text-muted-foreground/40" />
          <p className="text-xs">No drafts nearing deletion.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-1 w-full">
          {items.slice(0, 3).map((item) => (
            <DashboardListRow
              key={item.requestId}
              icon={FileEdit}
              title={item.title}
              subtitle={item.requestId}
              trailing={
                <span className="text-rose-600 dark:text-rose-400 font-mono tabular-nums font-semibold">
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
      )}
    </WidgetShell>
  );
}
