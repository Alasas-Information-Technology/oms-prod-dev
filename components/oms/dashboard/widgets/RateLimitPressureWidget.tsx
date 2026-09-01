"use client";

import React from "react";
import { Activity, AlertTriangle, CheckCircle2, Info, ShieldAlert } from "lucide-react";
import { WidgetShell } from "../WidgetShell";
import { WidgetProps } from "@/lib/dashboard/registry";
import { RateLimitPressureData } from "@/types/dashboard";
import { SegmentedBar } from "../SegmentedBar";
import { cn } from "@/lib/utils";

export function RateLimitPressureWidget({
  scope,
  data,
  isLoading,
  error,
  onRetry,
  updatedAt,
}: WidgetProps<RateLimitPressureData>) {
  const tiers = data?.tiers || [];
  const totalHits = data?.totalHits ?? tiers.reduce((s, t) => s + t.hits, 0);

  const hasHighPressure = totalHits > 50;

  return (
    <WidgetShell
      title="Rate limit pressure"
      scopeLabel={scope?.label}
      updatedAt={updatedAt}
      href="/app/administration/security-dashboard"
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      minHeight={240}
      headerActions={
        totalHits > 0 ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
            <Activity className="w-3 h-3" />
            {totalHits} throttle hit{totalHits === 1 ? "" : "s"} in 24h
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" />
            No throttling active
          </span>
        )
      }
    >
      <div className="space-y-3 select-none">
        {/* Tier Rows */}
        <div className="space-y-1">
          {tiers.length === 0 ? (
            <div className="py-6 text-center text-xs text-muted-foreground">
              No rate limit tiers configured.
            </div>
          ) : (
            tiers.map((t) => {
              const hasHits = t.hits > 0;

              return (
                <div
                  key={t.tier}
                  className="flex items-center justify-between h-[44px] px-3.5 rounded-md hover:bg-muted/40 transition-colors border border-transparent hover:border-border/30"
                >
                  {/* Left: Tier Label & Limit */}
                  <div className="flex items-center gap-3 min-w-0 flex-1 pr-3">
                    <span className="text-[11px] font-mono font-semibold text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                      T{t.tier}
                    </span>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[13px] font-medium text-foreground truncate leading-tight">
                        {t.label}
                      </span>
                      <span className="text-[11px] text-muted-foreground truncate leading-tight mt-0.5">
                        Limit: {t.limit} req/min
                      </span>
                    </div>
                  </div>

                  {/* Center: Segmented Bar */}
                  <div className="hidden sm:flex items-center px-4 shrink-0">
                    <SegmentedBar
                      value={t.hits}
                      max={t.limit}
                      color={t.hits > 0 ? "var(--color-amber-500, #f59e0b)" : undefined}
                      showPercent={false}
                    />
                  </div>

                  {/* Right: Hits & Unique Users */}
                  <div className="flex flex-col items-end shrink-0">
                    <span className={cn(
                      "text-[13px] font-semibold tabular-nums leading-tight",
                      hasHits ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground"
                    )}>
                      {t.hits} hit{t.hits === 1 ? "" : "s"}
                    </span>
                    <span className="text-[11px] text-muted-foreground tabular-nums mt-0.5">
                      {t.uniqueUsers} user{t.uniqueUsers === 1 ? "" : "s"} throttled
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Operational Context Copy */}
        <div className="flex items-start gap-2 p-2.5 rounded-md bg-muted/30 border border-border/30 text-[11px] text-muted-foreground leading-relaxed">
          <Info className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
          <span>
            Hits indicate user throttling occurrences, not total request traffic. Repeated tier hits typically indicate that rate limits should be adjusted.
          </span>
        </div>
      </div>
    </WidgetShell>
  );
}
