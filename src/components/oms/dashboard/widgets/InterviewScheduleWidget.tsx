"use client";

import React from "react";
import { WidgetShell } from "../WidgetShell";
import { WidgetProps } from "@/src/lib/dashboard/registry";
import { InterviewScheduleData } from "@/src/types/dashboard";
import { Video, MapPin, CalendarDays } from "lucide-react";

export function InterviewScheduleWidget({
  scope,
  data,
  isLoading,
  error,
  onRetry,
}: WidgetProps<InterviewScheduleData>) {
  
  const interviews = data?.interviews || [];

  return (
    <WidgetShell
      title="Interview schedule"
      scopeLabel={scope?.label}
      href="/app/candidates/calendar"
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      minHeight={240}
    >
      {interviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
          <CalendarDays className="size-8 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">No interviews scheduled for the next 7 days.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3 mt-2">
          {interviews.map((interview) => (
            <div 
              key={interview.id} 
              className="flex flex-col gap-2 p-3 rounded-lg border border-border/60 bg-muted/20"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-foreground">{interview.candidateName}</span>
                  <span className="text-xs text-muted-foreground truncate" title={interview.position}>
                    {interview.position}
                  </span>
                </div>
                <div className="flex flex-col items-end shrink-0">
                  <span className="text-sm font-medium text-foreground whitespace-nowrap">
                    {interview.formattedDate}
                  </span>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {interview.formattedTime}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-1.5 mt-1 text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-background/50 self-start px-2 py-0.5 rounded border border-border/50">
                {interview.medium === "ONLINE" ? (
                  <>
                    <Video className="size-3" />
                    <span>Online</span>
                  </>
                ) : (
                  <>
                    <MapPin className="size-3" />
                    <span className="truncate max-w-[120px]">{interview.locationOrLink || "In Person"}</span>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </WidgetShell>
  );
}
