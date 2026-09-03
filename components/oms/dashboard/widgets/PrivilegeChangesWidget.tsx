"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, KeyRound, Shield, UserCheck, Users } from "lucide-react";
import { WidgetShell } from "../WidgetShell";
import { StatusTooltipIcon } from "../StatusTooltipIcon";
import { WidgetProps } from "@/lib/dashboard/registry";
import { PrivilegeChangesData, PrivilegeChangeType } from "@/types/dashboard";
import { DeltaChip } from "../DeltaChip";
import { cn } from "@/lib/utils";

function formatRelativeTime(isoDate: string): string {
  try {
    const diffMs = Date.now() - new Date(isoDate).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  } catch {
    return isoDate;
  }
}

function getHumanReadableType(type: PrivilegeChangeType): { label: string; tone: "amber" | "neutral" | "red" } {
  switch (type) {
    case "ROLE_GRANTED":
      return { label: "Role given", tone: "neutral" };
    case "ROLE_REVOKED":
      return { label: "Role removed", tone: "amber" };
    case "SCOPE_GRANTED":
      return { label: "Scope assigned", tone: "neutral" };
    case "SCOPE_REVOKED":
      return { label: "Scope removed", tone: "amber" };
    case "OVERRIDE_GRANTED":
      return { label: "Override granted", tone: "amber" };
    case "OVERRIDE_REVOKED":
      return { label: "Override removed", tone: "neutral" };
    case "DELEGATION_CREATED":
      return { label: "Delegation assigned", tone: "neutral" };
    default:
      return { label: "Privilege altered", tone: "neutral" };
  }
}

export function PrivilegeChangesWidget({
  scope,
  data,
  isLoading,
  error,
  onRetry,
  updatedAt,
}: WidgetProps<PrivilegeChangesData>) {
  const changes = data?.changes || [];
  const trend = data?.trend || { thisWeek: changes.length, lastWeek: changes.length };

  const deltaPercent =
    trend.lastWeek > 0
      ? Math.round(((trend.thisWeek - trend.lastWeek) / trend.lastWeek) * 100)
      : trend.thisWeek > 0
      ? 100
      : 0;

  const direction = deltaPercent >= 0 ? "up" : "down";

  return (
    <WidgetShell
      title="Privilege changes"
      scopeLabel={scope?.label}
      updatedAt={updatedAt}
      href="/app/administration/security-dashboard?tab=privileges"
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      minHeight={240}
      headerActions={
        <div className="flex items-center gap-2">
          <StatusTooltipIcon
            status={deltaPercent > 0 ? "WARNING" : "SUCCESS"}
            label={`${direction === "up" ? "↑" : "↓"} ${Math.abs(deltaPercent)}%`}
            tooltipTitle="7-Day Privilege Delta"
            tooltipDescription="Percentage change in role and scope grants compared to previous 7-day period."
            tooltipDetails={[
              { label: "This Week", value: `${trend.thisWeek} changes` },
              { label: "Last Week", value: `${trend.lastWeek} changes` },
              { label: "Trend", value: deltaPercent > 0 ? "Increased activity" : "Stable/Decreased" },
            ]}
            showBorder
          />
        </div>
      }
    >
      <div className="space-y-0.5 select-none">
        {changes.length === 0 ? (
          <div className="py-6 text-center text-xs text-muted-foreground">
            No privilege or role alterations in trailing 7 days.
          </div>
        ) : (
          changes.map((change, idx) => {
            const { label, tone } = getHumanReadableType(change.type);

            return (
              <div
                key={idx}
                className="group flex items-center justify-between h-[38px] px-2.5 sm:px-3 rounded-lg hover:bg-muted/40 transition-colors border border-transparent hover:border-border/30 dark:hover:border-white/[0.04]"
              >
                {/* Left: Icon + What changed + Subject */}
                <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
                  <div
                    className={cn(
                      "w-5.5 h-5.5 rounded-md flex items-center justify-center shrink-0 text-xs",
                      tone === "amber"
                        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                        : "bg-muted/60 text-muted-foreground"
                    )}
                  >
                    <KeyRound className="w-3 h-3" />
                  </div>

                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5 text-[12.5px] font-medium text-foreground/90 truncate leading-tight">
                      <span className="text-muted-foreground font-normal text-[11px]">{label}:</span>
                      <span className="truncate">{change.detail}</span>
                      <ArrowRight className="w-3 h-3 text-muted-foreground/60 shrink-0" />
                      <span className="font-semibold text-foreground truncate">{change.subject.name}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground/70 truncate leading-tight mt-0.5">
                      Granted by {change.actor.name} · {formatRelativeTime(change.at)}
                    </span>
                  </div>
                </div>

                {/* Right: Timestamp tag */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10.5px] font-mono text-muted-foreground tabular-nums">
                    {formatRelativeTime(change.at)}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </WidgetShell>
  );
}

