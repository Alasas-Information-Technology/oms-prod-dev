"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { WidgetShell } from "../WidgetShell";
import { StatusTooltipIcon } from "../StatusTooltipIcon";
import { WidgetProps } from "@/lib/dashboard/registry";
import { ItemsRequiringAttentionData } from "@/types/dashboard";
import { DashboardListRow } from "../DashboardListRow";
import { SeverityDot } from "../SeverityDot";
import { SegmentedBar } from "../SegmentedBar";
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
  const overdueCount = items.filter(i => i.isOverdue || i.due === "Today").length;

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
      headerActions={
        totalItems > 0 ? (
          <StatusTooltipIcon
            status={overdueCount > 0 ? "WARNING" : "INFO"}
            label={`${totalItems} action item${totalItems === 1 ? "" : "s"}`}
            tooltipTitle="Approvals & Action Items"
            tooltipDescription={
              overdueCount > 0
                ? `${overdueCount} item(s) are due today or overdue for review.`
                : `${totalItems} requisition approval(s) pending in your active queue.`
            }
            tooltipDetails={[
              { label: "Total Pending", value: `${totalItems}` },
              { label: "Due / Overdue", value: `${overdueCount}` },
            ]}
            showBorder
          />
        ) : undefined
      }
    >

      {items.length === 0 ? (
        <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
          No items currently require your attention.
        </div>
      ) : (
        <div className="flex flex-col gap-2.5 w-full select-none">
          {/* Visual 1: On-track vs overdue SegmentedBar summary per Part 1.4 ceiling */}
          <div className="flex items-center justify-between px-1 pb-1 text-xs border-b border-border/20">
            <span className="text-muted-foreground text-[11px] font-medium">Pending action urgency:</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-medium text-foreground tabular-nums">
                {Math.max(0, items.length - overdueCount)}/{items.length} on track
              </span>
              <SegmentedBar
                value={Math.max(0, items.length - overdueCount)}
                max={Math.max(items.length, 1)}
                showPercent={false}
                color={overdueCount > 0 ? "var(--warning-border)" : "var(--accent-interactive, var(--primary))"}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2 w-full pt-0.5">
            {displayItems.map((item) => {
              const isOverdue = item.isOverdue || item.due === "Today";
              const Icon = isOverdue ? ClockAlert : item.priority === "HIGH" ? AlertCircle : FileText;
              const iconBg = isOverdue ? "bg-rose-500/10" : "bg-foreground/8";
              const iconColor = isOverdue ? "text-rose-600 dark:text-rose-400" : "text-foreground/70";

              return (
                <DashboardListRow
                  key={item.id}
                  leading={<SeverityDot severity={item.priority} label={`${item.priority} priority`} className="mr-0.5" />}
                  icon={Icon}
                  iconBg={iconBg}
                  iconColor={iconColor}
                  title={item.item}
                  subtitle={`${item.requestCode} · ${item.stage}`}
                  trailing={
                    <span className={cn(isOverdue ? "text-danger-text font-medium" : "text-muted-foreground")}>
                      {item.isOverdue && item.overdueDays ? `+${item.overdueDays}d overdue` : item.due}
                    </span>
                  }
                  trailingSubtitle={
                    <span
                      className={cn(
                        "text-[11px]",
                        item.priority === "HIGH"
                          ? "text-danger-text font-semibold"
                          : item.priority === "MEDIUM"
                            ? "text-warning-text font-semibold"
                            : "text-muted-foreground font-normal"
                      )}
                    >
                      {item.priority === "HIGH"
                        ? "High Priority"
                        : item.priority === "MEDIUM"
                          ? "Medium Priority"
                          : "Low Priority"}
                    </span>
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
        </div>
      )}
    </WidgetShell>
  );
}
