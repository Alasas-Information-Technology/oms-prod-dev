"use client";

import React from "react";
import { WidgetShell } from "../WidgetShell";
import { WidgetProps } from "@/lib/dashboard/registry";
import { UpcomingMilestonesData, MilestoneType } from "@/types/dashboard";
import { DashboardListRow } from "../DashboardListRow";
import { MilestoneTimeline } from "../MilestoneTimeline";
import { Users, UserPlus, FileClock, CalendarX, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const MILESTONE_ICONS: Record<MilestoneType, LucideIcon> = {
  INTERVIEW: Users,
  JOINING: UserPlus,
  DOCUMENT_EXPIRY: FileClock,
  CONTRACT_END: CalendarX,
};

/**
 * V4 — Milestone timeline per DASHBOARD-VISUAL-DEPTH.md:
 * - 60-day horizontal timeline strip above the list on desktop (80px tall)
 * - Markers sized by count and colored by type
 * - List below stays as accessible detail view and mobile fallback
 */
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
      minHeight={280}
    >
      {milestones.length === 0 ? (
        <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
          No upcoming milestones.
        </div>
      ) : (
        <div className="flex flex-col gap-3 w-full p-4 select-none">
          {/* Desktop 60-day Timeline Strip (V4) — Hidden below 768px */}
          <div className="hidden md:block w-full">
            <MilestoneTimeline milestones={milestones} />
          </div>

          {/* Milestone List (Accessible detail view & Mobile fallback) */}
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
                    <span
                      className={cn(
                        isOverdue
                          ? "text-rose-600 dark:text-rose-400 font-semibold"
                          : "text-muted-foreground font-mono tabular-nums"
                      )}
                    >
                      {milestone.formattedDate}
                    </span>
                  }
                  href={milestone.link}
                />
              );
            })}
          </div>
        </div>
      )}
    </WidgetShell>
  );
}
