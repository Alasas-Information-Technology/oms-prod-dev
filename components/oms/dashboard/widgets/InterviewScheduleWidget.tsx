"use client";

import React from "react";
import { WidgetShell } from "../WidgetShell";
import { WidgetProps } from "@/lib/dashboard/registry";
import { InterviewScheduleData } from "@/types/dashboard";
import { Video, MapPin, CalendarDays } from "lucide-react";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

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
      minHeight={215}
      headerActions={
        interviews.length > 0 ? (
          <span className="text-[11px] font-mono text-muted-foreground tabular-nums bg-muted/40 px-2 py-0.5 rounded border border-border/30">
            {interviews.length} upcoming
          </span>
        ) : undefined
      }
    >
      {interviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center gap-1.5">
          <CalendarDays className="size-6 text-muted-foreground/30" />
          <p className="text-xs text-muted-foreground">No interviews scheduled for the next 7 days.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-1.5 select-none">
          {interviews.map((interview) => (
            <div 
              key={interview.id} 
              className="flex items-center justify-between p-2.5 rounded-lg border border-border/30 dark:border-white/[0.04] bg-muted/20 hover:bg-muted/40 transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="w-6 h-6 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/20 cursor-help">
                      {interview.medium === "ONLINE" ? (
                        <Video className="size-3" />
                      ) : (
                        <MapPin className="size-3" />
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p className="text-xs font-semibold">{interview.medium === "ONLINE" ? "Online Video Call" : "In-Person Interview"}</p>
                    {interview.locationOrLink && (
                      <p className="text-[11px] text-primary-foreground/80 mt-0.5">{interview.locationOrLink}</p>
                    )}
                  </TooltipContent>
                </Tooltip>

                <div className="flex flex-col min-w-0">
                  <span className="text-[12.5px] font-semibold text-foreground/90 truncate leading-tight">
                    {interview.candidateName}
                  </span>
                  <span className="text-[10.5px] text-muted-foreground truncate leading-tight mt-0.5" title={interview.position}>
                    {interview.position}
                  </span>
                </div>
              </div>
              
              <div className="flex flex-col items-end shrink-0 text-right">
                <span className="text-[11.5px] font-medium text-foreground font-mono tabular-nums leading-tight">
                  {interview.formattedDate}
                </span>
                <span className="text-[10.5px] text-muted-foreground font-mono tabular-nums leading-tight mt-0.5">
                  {interview.formattedTime}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </WidgetShell>
  );
}

