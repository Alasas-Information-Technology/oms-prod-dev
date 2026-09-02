"use client";

import React from "react";
import { WidgetShell } from "../WidgetShell";
import { StatusTooltipIcon } from "../StatusTooltipIcon";
import { WidgetProps } from "@/lib/dashboard/registry";
import { PendingHrDecisionsData } from "@/types/dashboard";
import { DashboardListRow } from "../DashboardListRow";
import { Clock, MessageSquare, Edit3, ShieldAlert, type LucideIcon } from "lucide-react";

export function PendingHrDecisionsWidget({
  scope,
  data,
  isLoading,
  error,
  onRetry,
  updatedAt,
}: WidgetProps<PendingHrDecisionsData>) {
  const total = data?.totalPending ?? 0;
  const urgent = data?.urgentCount ?? 0;
  const breakdown = data?.byClarificationType || { newReview: 0, responseToClarification: 0, amendmentReview: 0, salaryException: 0 };

  const TYPE_CONFIG: Array<{ key: keyof typeof breakdown; label: string; icon: LucideIcon; color: string; bg: string }> = [
    { key: "newReview", label: "New Reviews", icon: Clock, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500/10" },
    { key: "responseToClarification", label: "Clarification Responses", icon: MessageSquare, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-500/10" },
    { key: "amendmentReview", label: "Amendment Reviews", icon: Edit3, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10" },
    { key: "salaryException", label: "Salary Exceptions", icon: ShieldAlert, color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-500/10" },
  ];

  return (
    <WidgetShell
      title="Pending HR decisions"
      scopeLabel={scope?.label}
      updatedAt={updatedAt}
      href="/app/requests?status=hr-review"
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      minHeight={215}
      headerActions={
        urgent > 0 ? (
          <StatusTooltipIcon
            status="CRITICAL"
            label={`${urgent} urgent`}
            tooltipTitle="Urgent HR Reviews Required"
            tooltipDescription={`${urgent} requisitions require urgent HR review or clarification resolution.`}
            tooltipDetails={[
              { label: "Total Pending", value: `${total}` },
              { label: "Urgent Queue", value: `${urgent}` },
            ]}
            showBorder
          />
        ) : undefined
      }
    >

      {total === 0 ? (
        <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
          No pending HR decisions.
        </div>
      ) : (
        <div className="flex flex-col gap-1 w-full">
          {TYPE_CONFIG.map((config) => {
            const count = breakdown[config.key] || 0;
            return (
              <DashboardListRow
                key={config.key}
                icon={config.icon}
                iconBg={config.bg}
                iconColor={config.color}
                title={config.label}
                trailing={
                  <span className="font-mono tabular-nums">
                    {count}
                  </span>
                }
                href={`/app/requests?status=hr-review&type=${config.key}`}
              />
            );
          })}
        </div>
      )}
    </WidgetShell>
  );
}
