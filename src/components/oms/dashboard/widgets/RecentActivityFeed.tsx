"use client";

import React from "react";
import Link from "next/link";
import { WidgetShell } from "../WidgetShell";
import { WidgetProps } from "@/src/lib/dashboard/registry";
import { RecentActivityData } from "@/src/types/dashboard";
import { DashboardListRow } from "../DashboardListRow";
import { Activity } from "lucide-react";

export function RecentActivityFeed({
  scope,
  data,
  isLoading,
  error,
  onRetry,
  updatedAt,
}: WidgetProps<RecentActivityData>) {
  const activities = data?.activities || [];
  const displayActivities = activities.slice(0, 5);
  const totalCount = data?.totalCount ?? 0;
  const hasMore = totalCount > 5;

  return (
    <WidgetShell
      title="Recent activity"
      scopeLabel={scope?.label}
      updatedAt={updatedAt}
      href="/app/settings/audit"
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      minHeight={215}
    >
      {activities.length === 0 ? (
        <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
          No recent activity in your scope.
        </div>
      ) : (
        <div className="flex flex-col gap-1 w-full">
          {displayActivities.map((activity) => (
            <DashboardListRow
              key={activity.id}
              icon={Activity}
              title={activity.description}
              subtitle={activity.relativeTime}
              href={activity.link}
            />
          ))}

          {hasMore && (
            <div className="pt-2 text-center">
              <Link
                href="/app/settings/audit"
                className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                View all activity ({totalCount})
              </Link>
            </div>
          )}
        </div>
      )}
    </WidgetShell>
  );
}
