"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight, Clock, Coins, FileText, Trash2, Users } from "lucide-react";
import { WidgetShell } from "../WidgetShell";
import { WidgetProps } from "@/src/lib/dashboard/registry";
import { ScheduledActionsTonightData } from "@/src/types/dashboard";
import { formatAbbreviated } from "@/lib/money";
import { cn } from "@/lib/utils";

function getActionIcon(code: string) {
  switch (code) {
    case "AUTO_CLOSE":
      return { icon: Coins, bg: "bg-emerald-500/10", color: "text-emerald-600 dark:text-emerald-400" };
    case "DRAFT_PURGE":
      return { icon: Trash2, bg: "bg-amber-500/10", color: "text-amber-600 dark:text-amber-400" };
    case "DOC_EXPIRY_REMINDER":
      return { icon: FileText, bg: "bg-blue-500/10", color: "text-blue-600 dark:text-blue-400" };
    default:
      return { icon: Users, bg: "bg-muted", color: "text-foreground" };
  }
}

function getActionLink(code: string): string {
  switch (code) {
    case "AUTO_CLOSE":
      return "/app/requests?filter=closing-soon";
    case "DRAFT_PURGE":
      return "/app/requests?tab=drafts";
    case "DOC_EXPIRY_REMINDER":
      return "/app/workforce?filter=expiring-documents";
    default:
      return "/app/administration/jobs";
  }
}

function formatRunTime(isoDate?: string): string {
  if (!isoDate) return "Tonight 02:00";
  try {
    const d = new Date(isoDate);
    return `Tonight at ${d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false })}`;
  } catch {
    return "Tonight 02:00";
  }
}

export function ScheduledActionsTonightWidget({
  scope,
  data,
  isLoading,
  error,
  onRetry,
  updatedAt,
}: WidgetProps<ScheduledActionsTonightData>) {
  const actions = data?.actions || [];
  const totalFundsReleased = data?.totalFundsReleased ?? 0;
  const hasFunds = Number(totalFundsReleased) > 0;

  return (
    <WidgetShell
      title="Tonight's scheduled actions"
      scopeLabel={scope?.label}
      updatedAt={updatedAt}
      href="/app/administration/jobs"
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      minHeight={240}
      headerActions={
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground bg-muted/60 px-2 py-0.5 rounded border border-border/40">
          <Clock className="w-3 h-3 text-muted-foreground" />
          {formatRunTime(data?.runsAt)}
        </span>
      }
    >
      <div className="space-y-3 select-none">
        {/* Prominent Financial Impact Banner */}
        {hasFunds && (
          <div className="flex items-center justify-between p-3 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-900 dark:text-emerald-100">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded bg-emerald-500/20 flex items-center justify-center shrink-0">
                <Coins className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <div className="text-xs font-semibold">Scheduled Financial Release</div>
                <div className="text-[11px] text-emerald-700/80 dark:text-emerald-300/80">
                  Unused funds automatically unlocked to departmental budgets
                </div>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[15px] font-bold text-emerald-700 dark:text-emerald-300 tabular-nums">
                {formatAbbreviated(totalFundsReleased)}
              </span>
            </div>
          </div>
        )}

        {/* Actions List */}
        <div className="space-y-1">
          {actions.length === 0 ? (
            <div className="py-6 text-center text-xs text-muted-foreground">
              No scheduled actions queued for tonight's run.
            </div>
          ) : (
            actions.map((act) => {
              const { icon: Icon, bg, color } = getActionIcon(act.code);
              const link = getActionLink(act.code);
              const hasRowFunds = Number(act.fundsReleased) > 0;

              return (
                <Link
                  key={act.code}
                  href={link}
                  className="group flex items-center justify-between h-[42px] px-3 rounded-md hover:bg-muted/60 transition-colors border border-transparent hover:border-border/40"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
                    <div className={cn("w-6 h-6 rounded flex items-center justify-center shrink-0", bg, color)}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[13px] font-medium text-foreground group-hover:text-primary transition-colors truncate">
                        {act.count} {act.label.toLowerCase()}
                      </span>
                      {hasRowFunds && (
                        <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20 tabular-nums shrink-0">
                          {formatAbbreviated(act.fundsReleased)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-muted-foreground group-hover:text-foreground text-xs shrink-0">
                    <span className="text-[11px] hidden sm:inline group-hover:underline">View affected</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </WidgetShell>
  );
}
