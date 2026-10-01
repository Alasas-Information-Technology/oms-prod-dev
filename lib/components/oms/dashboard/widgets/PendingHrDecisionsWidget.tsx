"use client";

import React from "react";
import { WidgetShell } from "../WidgetShell";
import { StatusTooltipIcon } from "../StatusTooltipIcon";
import { WidgetProps } from "@/lib/dashboard/registry";
import { PendingHrDecisionsData } from "@/types/dashboard";
import { DashboardListRow } from "../DashboardListRow";
import { SeverityDot, SeverityLevel } from "../SeverityDot";
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

  const TYPE_CONFIG: Array<{
    key: keyof typeof breakdown;
    label: string;
    icon: LucideIcon;
    baseSeverity: SeverityLevel;
  }> = [
    { key: "salaryException", label: "Salary Exceptions", icon: ShieldAlert, baseSeverity: "HIGH" },
    { key: "amendmentReview", label: "Amendment Reviews", icon: Edit3, baseSeverity: "MEDIUM" },
    { key: "responseToClarification", label: "Clarification Responses", icon: MessageSquare, baseSeverity: "MEDIUM" },
    { key: "newReview", label: "New Reviews", icon: Clock, baseSeverity: "LOW" },
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
            const severity: SeverityLevel = count === 0 ? "LOW" : config.baseSeverity;

            return (
              <DashboardListRow
                key={config.key}
                leading={
                  <SeverityDot
                    severity={severity}
                    label={`${severity} priority: ${config.label}`}
                    className="mr-0.5"
                  />
                }
                icon={config.icon}
                iconBg="bg-muted/40 dark:bg-slate-800/60"
                iconColor="text-foreground/70"
                title={config.label}
                trailing={
                  <span className="tabular-nums font-semibold text-foreground">
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
