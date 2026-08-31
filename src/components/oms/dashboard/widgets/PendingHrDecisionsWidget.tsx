"use client";

import React from "react";
import { WidgetShell } from "../WidgetShell";
import { WidgetProps } from "@/src/lib/dashboard/registry";
import { PendingHrDecisionsData } from "@/src/types/dashboard";
import { Clock, MessageSquare, Edit3, ShieldAlert, AlertCircle, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function PendingHrDecisionsWidget({
  scope,
  data,
  isLoading,
  error,
  onRetry,
}: WidgetProps<PendingHrDecisionsData>) {
  
  const total = data?.totalPending ?? 0;
  const urgent = data?.urgentCount ?? 0;
  const breakdown = data?.byClarificationType || { newReview: 0, responseToClarification: 0, amendmentReview: 0, salaryException: 0 };

  const TYPE_CONFIG: Array<{ key: keyof typeof breakdown; label: string; icon: LucideIcon; color: string }> = [
    { key: "newReview", label: "New Reviews", icon: Clock, color: "text-blue-500" },
    { key: "responseToClarification", label: "Clarification Responses", icon: MessageSquare, color: "text-purple-500" },
    { key: "amendmentReview", label: "Amendment Reviews", icon: Edit3, color: "text-amber-500" },
    { key: "salaryException", label: "Salary Exceptions", icon: ShieldAlert, color: "text-red-500" },
  ];

  return (
    <WidgetShell
      title="Pending HR decisions"
      scopeLabel={scope?.label}
      href="/app/requests?status=hr-review"
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      minHeight={240}
    >
      {total === 0 ? (
        <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
          No pending HR decisions.
        </div>
      ) : (
        <div className="flex flex-col gap-4 mt-2">
          
          <div className="flex items-center justify-between">
            <div className="flex items-end gap-3">
              <span className="text-3xl font-bold font-mono tracking-tight text-foreground leading-none">
                {total}
              </span>
              <span className="text-xs font-medium text-muted-foreground pb-1">
                Total Pending
              </span>
            </div>
            
            {urgent > 0 && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 rounded-full border border-red-200 dark:border-red-500/20">
                <AlertCircle className="size-3.5" />
                <span className="text-xs font-bold">{urgent} Urgent</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 mt-1">
            {TYPE_CONFIG.map((config) => {
              const count = breakdown[config.key] || 0;
              const Icon = config.icon;
              return (
                <div 
                  key={config.key} 
                  className={cn(
                    "flex flex-col p-3 rounded-lg border transition-colors",
                    count > 0 ? "border-border/60 bg-card hover:bg-muted/30" : "border-transparent bg-muted/20 opacity-60"
                  )}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className={cn("size-4 shrink-0", count > 0 ? config.color : "text-muted-foreground")} />
                    <span className="text-xs font-medium text-foreground truncate">{config.label}</span>
                  </div>
                  <span className="text-xl font-semibold font-mono tabular-nums text-foreground">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>

        </div>
      )}
    </WidgetShell>
  );
}
