"use client";

import React from "react";
import Link from "next/link";
import { WidgetShell } from "../WidgetShell";
import { WidgetProps } from "@/src/lib/dashboard/registry";
import { UpcomingMilestonesData, MilestoneType } from "@/src/types/dashboard";
import { Users, UserPlus, FileClock, CalendarX, ChevronRight, type LucideIcon } from "lucide-react";
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
}: WidgetProps<UpcomingMilestonesData>) {
  const milestones = data?.milestones || [];

  return (
    <WidgetShell
      title="Upcoming milestones"
      scopeLabel={scope?.label}
      href="/app/workforce?tab=milestones"
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      minHeight={260}
    >
      {milestones.length === 0 ? (
        <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
          No upcoming milestones.
        </div>
      ) : (
        <div className="flex flex-col gap-1 mt-1">
          {milestones.map((milestone) => {
            const Icon = MILESTONE_ICONS[milestone.type];
            return (
              <Link
                key={milestone.id}
                href={milestone.link}
                className="group flex items-start justify-between p-3 rounded-lg border border-transparent hover:border-border/60 hover:bg-muted/30 transition-all cursor-pointer"
              >
                <div className="flex gap-3 items-start">
                  <div className="mt-0.5 p-1.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors shrink-0">
                    <Icon className="size-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                      {milestone.label}
                    </span>
                    <span className="text-xs text-muted-foreground mt-0.5">
                      {milestone.detail}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "text-xs font-medium whitespace-nowrap",
                    milestone.formattedDate.toLowerCase().includes("overdue") || milestone.formattedDate.toLowerCase() === "today" 
                      ? "text-red-600" 
                      : "text-muted-foreground"
                  )}>
                    {milestone.formattedDate}
                  </span>
                  <ChevronRight className="size-4 text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity translate-x-[-4px] group-hover:translate-x-0" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </WidgetShell>
  );
}
