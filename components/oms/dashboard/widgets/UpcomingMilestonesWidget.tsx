"use client";

import React from "react";
import { WidgetShell } from "../WidgetShell";
import { WidgetProps } from "@/lib/dashboard/registry";
import { UpcomingMilestonesData, MilestoneType } from "@/types/dashboard";
import { DashboardListRow } from "../DashboardListRow";
import { MilestoneTimeline } from "../MilestoneTimeline";
import { Users, UserPlus, FileClock, CalendarX, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const MILESTONE_CONFIG: Record<
  MilestoneType,
  { icon: LucideIcon; iconBg: string; iconColor: string }
> = {
  INTERVIEW: {
    icon: Users,
    iconBg: "bg-blue-500/15 dark:bg-blue-500/20",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  JOINING: {
    icon: UserPlus,
    iconBg: "bg-emerald-500/15 dark:bg-emerald-500/20",
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
  DOCUMENT_EXPIRY: {
    icon: FileClock,
    iconBg: "bg-amber-500/15 dark:bg-amber-500/20",
    iconColor: "text-amber-600 dark:text-amber-400",
  },
  CONTRACT_END: {
    icon: CalendarX,
    iconBg: "bg-purple-500/15 dark:bg-purple-500/20",
    iconColor: "text-purple-600 dark:text-purple-400",
  },
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
      minHeight={215}
    >
      {milestones.length === 0 ? (
        <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
          No upcoming milestones.
        </div>
      ) : (
        <div className="flex flex-col gap-2.5 w-full select-none">
          {/* Desktop 60-day Timeline Strip (V4) — Hidden below 768px */}
          <div className="hidden md:block w-full">
            <MilestoneTimeline milestones={milestones} />
          </div>

          {/* Milestone List (Accessible detail view & Mobile fallback) */}
          <div className="flex flex-col gap-0.5 w-full">
            {milestones.map((milestone) => {
              const cfg = MILESTONE_CONFIG[milestone.type] || {
                icon: Users,
                iconBg: "bg-muted/40",
                iconColor: "text-foreground/70",
              };
              const isOverdue =
                milestone.formattedDate.toLowerCase().includes("overdue") ||
                milestone.formattedDate.toLowerCase() === "today";

              return (
                <DashboardListRow
                  key={milestone.id}
                  icon={cfg.icon}
                  iconBg={cfg.iconBg}
                  iconColor={cfg.iconColor}
                  title={milestone.label}
                  subtitle={milestone.detail}
                  trailing={
                    <span
                      className={cn(
                        "text-[12px]",
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

