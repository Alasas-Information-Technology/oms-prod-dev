"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { WidgetShell } from "../WidgetShell";
import { WidgetProps } from "@/src/lib/dashboard/registry";
import { ItemsRequiringAttentionData } from "@/src/types/dashboard";
import { DashboardListRow } from "../DashboardListRow";
import { ClockAlert, FileText, AlertCircle } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function ItemsRequiringAttentionTable({
  scope,
  data,
  isLoading,
  error,
  onRetry,
  updatedAt,
}: WidgetProps<ItemsRequiringAttentionData>) {
  const router = useRouter();

  const items = data?.items || [];
  const displayItems = items.slice(0, 5);
  const totalItems = data?.totalItems ?? 0;
  const hasMore = totalItems > 5;

  return (
    <WidgetShell
      title="Items requiring attention"
      scopeLabel={scope?.label}
      updatedAt={updatedAt}
      href="/app/requests?tab=needs-my-action"
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      minHeight={215}
    >
      {items.length === 0 ? (
        <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
          No items currently require your attention.
        </div>
      ) : (
        <div className="flex flex-col gap-1 w-full">
          {displayItems.map((item) => {
            const isOverdue = item.isOverdue || item.due === "Today";
            const Icon = isOverdue ? ClockAlert : item.priority === "HIGH" ? AlertCircle : FileText;
            const iconBg = isOverdue ? "bg-rose-500/10" : "bg-foreground/8";
            const iconColor = isOverdue ? "text-rose-600 dark:text-rose-400" : "text-foreground/70";

            return (
              <DashboardListRow
                key={item.id}
                icon={Icon}
                iconBg={iconBg}
                iconColor={iconColor}
                title={item.item}
                subtitle={`${item.requestCode} · ${item.stage}`}
                trailing={
                  <span className={cn(isOverdue ? "text-rose-600 dark:text-rose-400" : "text-muted-foreground")}>
                    {item.isOverdue && item.overdueDays ? `+${item.overdueDays}d overdue` : item.due}
                  </span>
                }
                trailingSubtitle={
                  item.priority === "HIGH" ? (
                    <span className="text-rose-600 dark:text-rose-400 font-semibold">High Priority</span>
                  ) : undefined
                }
                href={item.link}
              />
            );
          })}

          {hasMore && (
            <div className="pt-2 text-center">
              <Link
                href="/app/requests?tab=needs-my-action"
                className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                View all items ({totalItems})
              </Link>
            </div>
          )}
        </div>
      )}
    </WidgetShell>
  );
}
