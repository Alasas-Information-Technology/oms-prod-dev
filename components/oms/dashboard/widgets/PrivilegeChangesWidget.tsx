"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, KeyRound } from "lucide-react";
import { WidgetShell } from "../WidgetShell";
import { StatusTooltipIcon } from "../StatusTooltipIcon";
import { WidgetProps } from "@/lib/dashboard/registry";
import { PrivilegeChangesData, PrivilegeChangeType } from "@/types/dashboard";
import { BarChart, Bar, XAxis, Cell, ResponsiveContainer, Tooltip } from "recharts";
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

  // Compute 7-day discrete trend for DotMatrix per TASK 2
  const dailyMatrixData = React.useMemo(() => {
    if (data?.trend?.dailyCounts && data.trend.dailyCounts.length > 0) {
      return data.trend.dailyCounts;
    }
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const baseDate = new Date(updatedAt || "2026-08-31T08:30:00.000Z");
    const result: Array<{ day: string; count: number; dateStr: string }> = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(baseDate);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const dayName = dayNames[d.getDay()];
      result.push({ day: dayName, count: 0, dateStr });
    }

    for (const ch of changes) {
      if (!ch.at) continue;
      const cDate = ch.at.split("T")[0];
      const match = result.find((r) => r.dateStr === cDate);
      if (match) {
        match.count += 1;
      }
    }

    return result.map(({ day, count }) => ({ day, count }));
  }, [changes, data?.trend?.dailyCounts, updatedAt]);

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
          {/* DeltaChip: this-week-vs-last-week per spec */}
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
      <div className="space-y-2 select-none">
          {/* 7-Day Bar Chart Trend */}
          <div className="h-[60px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dailyMatrixData}
                margin={{ top: 2, right: 2, left: 2, bottom: 0 }}
                barCategoryGap="20%"
              >
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "var(--muted-foreground)", fontFamily: "var(--font-sans)" }}
                  tickMargin={4}
                />
                <Tooltip
                  cursor={{ fill: "var(--muted)", opacity: 0.15 }}
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    return (
                      <div className="rounded-lg bg-popover/95 border border-border/70 px-2.5 py-1.5 text-xs shadow-md backdrop-blur-md">
                        <span className="font-semibold text-foreground">{label}</span>
                        <span className="ml-2 text-muted-foreground">{payload[0].value} changes</span>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="count" radius={[3, 3, 0, 0]} maxBarSize={20}>
                  {dailyMatrixData.map((entry, idx) => (
                    <Cell
                      key={idx}
                      fill={entry.count === 0
                        ? "var(--muted)"
                        : entry.count >= 3
                        ? "var(--danger-border)"
                        : "var(--chart-1)"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

        {/* Change Records List */}
        {changes.length === 0 ? (
          <div className="py-4 text-center text-xs text-muted-foreground">
            No privilege or role alterations in trailing 7 days.
          </div>
        ) : (
          <div className="space-y-2 pt-1 border-t border-border/30">
            {changes.slice(0, 3).map((change, idx) => {
              const { label, tone } = getHumanReadableType(change.type);

              return (
                <div
                  key={idx}
                  className="group flex items-center justify-between h-[48px] px-2.5 sm:px-3 rounded-sm transition-colors border hover:bg-accent border-foreground/10 dark:border-foreground/4"
                >
                  {/* Left: Icon + What changed + Subject */}
                  <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
                    <div
                      className={cn(
                        "w-5 h-5 rounded-md flex items-center justify-center shrink-0 text-xs",
                        tone === "amber"
                          ? "bg-[var(--warning-surface)] text-warning-text"
                          : "bg-muted/60 text-muted-foreground"
                      )}
                    >
                      <KeyRound className="w-3 h-3" />
                    </div>

                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1.5 text-[12px] font-medium text-foreground/90 truncate leading-tight group-hover:text-primary transition-colors">
                        <span className="truncate">{change.detail}</span>
                        <ArrowRight className="w-3 h-3 text-muted-foreground/60 shrink-0" />
                        <span className="font-semibold text-foreground truncate">{change.subject.name}</span>
                      </div>
                      <span className="text-[10.5px] text-muted-foreground truncate leading-tight mt-0.5">{label}</span>
                    </div>
                  </div>

                  {/* Right: Timestamp */}
                  <span className="text-[10px] text-muted-foreground tabular-nums shrink-0">
                    {formatRelativeTime(change.at)}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {changes.length > 3 && (
          <div className="pt-1 text-center">
            <Link
              href="/app/administration/security-dashboard?tab=privileges"
              className="text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              View all {changes.length} privilege changes →
            </Link>
          </div>
        )}
      </div>
    </WidgetShell>
  );
}

