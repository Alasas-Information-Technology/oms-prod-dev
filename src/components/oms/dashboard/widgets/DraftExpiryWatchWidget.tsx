"use client";

import React from "react";
import { WidgetShell } from "../WidgetShell";
import { WidgetProps } from "@/src/lib/dashboard/registry";
import { DraftExpiryWatchData } from "@/src/types/dashboard";
import { AlertCircle, Trash2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { formatAmount } from "@/lib/money";

export function DraftExpiryWatchWidget({
  scope,
  data,
  isLoading,
  error,
  onRetry,
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
      minHeight={240}
    >
      {count === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
          <Trash2 className="size-8 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">No drafts nearing deletion.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3 mt-1">
          <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-800 dark:text-red-400">
            <AlertCircle className="size-4 shrink-0" />
            <span className="text-sm font-medium">
              {count} draft{count !== 1 ? 's' : ''} will be deleted in {days} day{days !== 1 ? 's' : ''}.
            </span>
          </div>

          <div className="flex flex-col gap-0 divide-y divide-border/40 mt-1">
            {items.map((item) => (
              <Link
                key={item.requestId}
                href={`/app/requests/${item.requestId}`}
                className="flex items-center justify-between py-2.5 px-1 group hover:bg-muted/30 transition-colors rounded-sm"
              >
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate max-w-[180px]">
                    {item.title}
                  </span>
                  <span className="text-[11px] text-muted-foreground font-mono">
                    {item.requestId}
                  </span>
                </div>
                <div className="flex flex-col items-end shrink-0">
                  <span className={cn(
                    "text-sm font-semibold tabular-nums",
                    item.daysRemaining <= 7 ? "text-red-600 dark:text-red-500" : "text-amber-600 dark:text-amber-500"
                  )}>
                    {item.daysRemaining}d left
                  </span>
                  {item.estimatedAmountFils !== undefined && (
                    <span className="text-[11px] text-muted-foreground tabular-nums">
                      {formatAmount(item.estimatedAmountFils)}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </WidgetShell>
  );
}
