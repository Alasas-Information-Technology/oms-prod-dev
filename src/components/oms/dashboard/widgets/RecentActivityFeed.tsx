"use client";

import React from "react";
import Link from "next/link";
import { WidgetShell } from "../WidgetShell";
import { WidgetProps } from "@/src/lib/dashboard/registry";
import { RecentActivityData } from "@/src/types/dashboard";
import { Button } from "@/components/ui/button";

export function RecentActivityFeed({
  scope,
  data,
  isLoading,
  error,
  onRetry,
}: WidgetProps<RecentActivityData>) {
  const activities = data?.activities || [];
  const displayActivities = activities.slice(0, 5);
  const hasMore = (data?.totalCount ?? 0) > 5;

  return (
    <WidgetShell
      title="Recent activity"
      scopeLabel={scope?.label}
      href="/app/settings/audit"
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      minHeight={260}
    >
      {activities.length === 0 ? (
        <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
          No recent activity in your scope.
        </div>
      ) : (
        <div className="flex flex-col">
          <div className="relative border-l border-border/60 ml-3 mt-2 mb-2 space-y-5 py-2">
            {displayActivities.map((activity) => (
              <div key={activity.id} className="relative pl-5 group">
                <div className="absolute -left-[5px] top-1.5 size-2.5 rounded-full bg-slate-300 dark:bg-slate-600 ring-4 ring-card group-hover:bg-primary transition-colors" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm text-foreground leading-tight">
                    {activity.link ? (
                      <Link href={activity.link} className="hover:underline hover:text-primary transition-colors">
                        {activity.description}
                      </Link>
                    ) : (
                      activity.description
                    )}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {activity.relativeTime}
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          {hasMore && (
            <div className="mt-1 pt-3 border-t border-border/40 text-center">
              <Button variant="link" size="sm" asChild className="text-primary h-auto py-1">
                <Link href="/app/settings/audit">
                  View all activity
                </Link>
              </Button>
            </div>
          )}
        </div>
      )}
    </WidgetShell>
  );
}
