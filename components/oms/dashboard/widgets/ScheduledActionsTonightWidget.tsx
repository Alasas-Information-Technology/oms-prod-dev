"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight, Coins, FileText, Trash2, Users } from "lucide-react";
import { WidgetShell } from "../WidgetShell";
import { StatusTooltipIcon } from "../StatusTooltipIcon";
import { WidgetProps } from "@/lib/dashboard/registry";
import { ScheduledActionsTonightData } from "@/types/dashboard";
import { formatAbbreviated } from "@/lib/money";
import { cn } from "@/lib/utils";

function getActionIcon(code: string) {
  switch (code) {
    case "AUTO_CLOSE":
      return { icon: Coins, bg: "bg-muted/40", color: "text-foreground/70" };
    case "DRAFT_PURGE":
      return { icon: Trash2, bg: "bg-muted/40", color: "text-foreground/70" };
    case "DOC_EXPIRY_REMINDER":
      return { icon: FileText, bg: "bg-muted/40", color: "text-foreground/70" };
    default:
      return { icon: Users, bg: "bg-muted/40", color: "text-foreground/70" };
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
        <StatusTooltipIcon
          status="INFO"
          label={formatRunTime(data?.runsAt)}
          tooltipTitle="Scheduled Execution Window"
          tooltipDescription="Automated batch operations and financial release scripts scheduled to execute during off-peak maintenance hours."
          tooltipDetails={[
            { label: "Execution Time", value: formatRunTime(data?.runsAt) },
            { label: "Queued Actions", value: `${actions.length} job types` },
          ]}
          showBorder
        />
      }
    >
      <div className="space-y-2 select-none">
        {/* Prominent Financial Impact Banner */}

        {hasFunds && (
          <div className="flex items-center justify-between p-2.5 rounded-sm bg-[var(--success-surface)] border border-[var(--success-border)]/40 text-foreground">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-6 h-6 rounded-md bg-[var(--success-surface)] border border-[var(--success-border)]/50 flex items-center justify-center shrink-0">
                <Coins className="w-3.5 h-3.5 text-success-text" />
              </div>
              <div>
                <div className="text-[12px] font-semibold text-foreground">Scheduled Financial Release</div>
                <div className="text-[10.5px] text-muted-foreground">
                  Unused funds automatically unlocked to departmental budgets
                </div>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[14px] font-bold text-success-text tabular-nums">
                {formatAbbreviated(totalFundsReleased)}
              </span>
            </div>
          </div>
        )}

        {/* Actions List */}
        <div className="space-y-2">
          {actions.length === 0 ? (
            <div className="py-6 text-center text-xs text-muted-foreground">
              No scheduled actions queued for tonight&apos;s run.
            </div>
          ) : (
            actions.slice(0, 4).map((act) => {
              const { icon: Icon, bg, color } = getActionIcon(act.code);
              const link = getActionLink(act.code);
              const hasRowFunds = Number(act.fundsReleased) > 0;

              return (
                <Link
                  key={act.code}
                  href={link}
                  className="group flex items-center justify-between h-[48px] px-2.5 sm:px-3 rounded-sm transition-colors border hover:bg-accent border-foreground/10 dark:border-foreground/4"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
                    <div className={cn("w-5.5 h-5.5 rounded-md flex items-center justify-center shrink-0", bg, color)}>
                      <Icon className="w-3 h-3" />
                    </div>
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[12.5px] font-medium text-foreground/90 group-hover:text-primary transition-colors truncate">
                        {act.count} {act.label.toLowerCase()}
                      </span>
                      {hasRowFunds && (
                        <span className="text-[10.5px] font-semibold text-success-text bg-[var(--success-surface)] px-1.5 py-0.2 rounded border border-[var(--success-border)]/40 tabular-nums shrink-0">
                          {formatAbbreviated(act.fundsReleased)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-muted-foreground/60 group-hover:text-foreground text-xs shrink-0">
                    <span className="text-[10.5px] hidden sm:inline group-hover:underline">View</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </div>
                </Link>
              );
            })
          )}
        </div>

        {actions.length > 4 && (
          <div className="pt-1 text-center">
            <Link
              href="/app/administration/jobs"
              className="text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              View all {actions.length} scheduled actions →
            </Link>
          </div>
        )}
      </div>
    </WidgetShell>
  );
}
