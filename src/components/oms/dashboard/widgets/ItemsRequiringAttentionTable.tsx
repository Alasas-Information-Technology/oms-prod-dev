"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { WidgetShell } from "../WidgetShell";
import { WidgetProps } from "@/src/lib/dashboard/registry";
import { ItemsRequiringAttentionData, AttentionQueueItem } from "@/src/types/dashboard";
import { DataTable, ColumnDef } from "@/components/shared/DataTable";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function ItemsRequiringAttentionTable({
  scope,
  data,
  isLoading,
  error,
  onRetry,
}: WidgetProps<ItemsRequiringAttentionData>) {
  const router = useRouter();

  const items = data?.items || [];
  // Sort by due date ascending, overdue first - already handled by pre-aggregated data from backend?
  // "Sorted by due date ascending, overdue first" - assuming backend sorted it, but let's be safe.
  // Actually, rule 3 says "Every figure arrives pre-aggregated; the client performs zero arithmetic."
  // And "All figures come pre-aggregated from the server."
  // So we just take the first 5 rows.
  const displayItems = items.slice(0, 5);
  const totalItems = data?.totalItems ?? 0;
  const hasMore = totalItems > 5;

  const columns: ColumnDef<AttentionQueueItem>[] = [
    {
      key: "item",
      header: "Item",
      render: (val, row) => (
        <span className="font-medium text-foreground">{row.item}</span>
      ),
    },
    {
      key: "requestCode",
      header: "Request",
      render: (val, row) => (
        <span className="font-mono text-muted-foreground">{row.requestCode}</span>
      ),
    },
    {
      key: "stage",
      header: "Current Stage",
      render: (val, row) => <span>{row.stage}</span>,
    },
    {
      key: "due",
      header: "Due",
      render: (val, row) => (
        <span className={cn(row.isOverdue || row.due === "Today" ? "text-red-600 font-medium" : "text-muted-foreground")}>
          {row.isOverdue && row.overdueDays ? `Overdue by ${row.overdueDays} days` : row.due}
        </span>
      ),
    },
    {
      key: "priority",
      header: "Priority",
      render: (val, row) => {
        const priorityColors = {
          HIGH: "bg-red-50 text-red-700 border-red-200",
          MEDIUM: "bg-amber-50 text-amber-700 border-amber-200",
          LOW: "bg-slate-100 text-slate-700 border-slate-200",
        };
        const pClass = priorityColors[row.priority] || priorityColors.LOW;
        const label = row.priority.charAt(0) + row.priority.slice(1).toLowerCase();
        
        return (
          <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border", pClass)}>
            {label}
          </span>
        );
      },
    },
  ];

  return (
    <WidgetShell
      title="Items requiring attention"
      scopeLabel={scope?.label}
      href="/app/requests?tab=needs-my-action"
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      minHeight={260}
    >
      {items.length === 0 ? (
        <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
          No items currently require your attention.
        </div>
      ) : (
        <div className="flex flex-col">
          <DataTable
            columns={columns}
            data={displayItems}
            keyField="id"
            compact
            hidePagination
            onRowClick={(row) => router.push(row.link)}
            className="mt-1"
          />
          {hasMore && (
            <div className="mt-3 text-center">
              <Button variant="link" size="sm" asChild className="text-primary h-auto py-1">
                <Link href="/app/requests?tab=needs-my-action">
                  View all items ({totalItems})
                </Link>
              </Button>
            </div>
          )}
        </div>
      )}
    </WidgetShell>
  );
}
