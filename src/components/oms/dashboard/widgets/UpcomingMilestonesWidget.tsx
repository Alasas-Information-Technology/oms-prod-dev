"use client";

import React from "react";
import { WidgetShell } from "../WidgetShell";
import { WidgetProps } from "@/src/lib/dashboard/registry";
import { UpcomingMilestonesData, MilestoneType } from "@/src/types/dashboard";
import { DashboardListRow } from "../DashboardListRow";
import { Users, UserPlus, FileClock, CalendarX, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const MILESTONE_ICONS: Record<MilestoneType, LucideIcon> = {
  INTERVIEW: Users,
  JOINING: UserPlus,
  DOCUMENT_EXPIRY: FileClock,
  CONTRACT_END: CalendarX,
};

export function UpcomingMilestonesWidget({
  scope,
  data,
  isLoading,
  error,
  onRetry,
  updatedAt,
}: WidgetProps<UpcomingMilestonesData>) {
  const milestones = data?.milestones || [];

  return (
    <WidgetShell
      title="Upcoming milestones"
      scopeLabel={scope?.label}
      updatedAt={updatedAt}
      href="/app/workforce?tab=milestones"
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      minHeight={215}
    >
      {milestones.length === 0 ? (
        <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
          No upcoming milestones.
        </div>
      ) : (
        <div className="flex flex-col gap-1 w-full">
          {milestones.map((milestone) => {
            const Icon = MILESTONE_ICONS[milestone.type] || Users;
            const isOverdue =
              milestone.formattedDate.toLowerCase().includes("overdue") ||
              milestone.formattedDate.toLowerCase() === "today";

            return (
              <DashboardListRow
                key={milestone.id}
                icon={Icon}
                title={milestone.label}
                subtitle={milestone.detail}
                trailing={
                  <span className={cn(isOverdue ? "text-rose-600 dark:text-rose-400 font-semibold" : "text-muted-foreground font-mono tabular-nums")}>
                    {milestone.formattedDate}
                  </span>
                }
                href={milestone.link}
              />
            );
          })}
        </div>
      )}
    </WidgetShell>
  );
}
