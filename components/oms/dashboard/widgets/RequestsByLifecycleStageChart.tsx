"use client";

import React, { useMemo, useState } from "react";
import { WidgetShell } from "../WidgetShell";
import { WidgetProps } from "@/lib/dashboard/registry";
import { RequestsByLifecycleStageData } from "@/types/dashboard";
import { DistributionBar, DistributionSegment } from "../DistributionBar";
import { categoricalScale } from "@/lib/dashboard/chart-tokens";
import { DataTable, ColumnDef } from "@/components/shared/DataTable";
import { cn } from "@/lib/utils";

/**
 * B1 — Requests by Lifecycle Stage
 *
 * Replaces the donut chart regression with DistributionBar per T6 / U7.
 * Single hue descending scale (categoricalScale), accessible screen reader text,
 * and mobile table fallback below 768px.
 */
export function RequestsByLifecycleStageChart({
  scope,
  data,
  isLoading,
  error,
  onRetry,
  updatedAt,
}: WidgetProps<RequestsByLifecycleStageData>) {
  const [period, setPeriod] = useState<"30d" | "90d" | "FY">("90d");

  const stages = useMemo(() => data?.stages || [], [data]);
  const totalRequests = useMemo(() => {
    return stages.reduce((sum, s) => sum + s.count, 0) || data?.totalRequests || 0;
  }, [stages, data?.totalRequests]);

  // One hue scale by descending stage index
  const scale = useMemo(() => categoricalScale(Math.max(stages.length, 1)), [stages.length]);

  const segments: DistributionSegment[] = useMemo(() => {
    if (totalRequests === 0) return [];
    return stages.map((s, idx) => {
      const percent = (s.count / totalRequests) * 100;
      return {
        label: s.label || s.stage,
        value: s.count,
        formatted: `${s.count} req`,
        percent,
        color: scale[idx] || "var(--accent-interactive, var(--primary))",
      };
    });
  }, [stages, totalRequests, scale]);

  const srSummary = useMemo(() => {
    return stages.map((s) => `${s.label || s.stage}: ${s.count}`).join(", ");
  }, [stages]);

  // Mobile Table Fallback Columns below 768px
  const tableColumns: ColumnDef<any>[] = useMemo(
    () => [
      {
        key: "label",
        header: "Stage",
        render: (_, row) => <span className="font-medium text-foreground">{row.label || row.stage}</span>,
      },
      {
        key: "count",
        header: "Requests",
        render: (val) => <span className="tabular-nums font-semibold text-foreground">{Number(val) || 0}</span>,
      },
      {
        key: "percent",
        header: "Share",
        render: (_, row) => {
          const pct = totalRequests > 0 ? ((row.count / totalRequests) * 100).toFixed(1) : "0.0";
          return <span className="text-muted-foreground tabular-nums">{pct}%</span>;
        },
      },
    ],
    [totalRequests]
  );

  return (
    <WidgetShell
      title="Requests by lifecycle stage"
      scopeLabel={scope?.label}
      updatedAt={updatedAt}
      href="/app/requests"
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      minHeight={215}
      headerActions={
        <div className="flex items-center gap-2 select-none">
          <span className="text-xs font-semibold text-foreground tabular-nums">
            {totalRequests} total
          </span>
          <div className="flex items-center p-0.5 rounded-lg bg-muted/50 border border-border/40 text-[11px] font-medium">
            {(["30d", "90d", "FY"] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPeriod(p)}
                className={cn(
                  "px-2 py-0.5 rounded-md transition-all duration-150 leading-tight cursor-pointer",
                  period === p
                    ? "bg-background text-foreground font-semibold shadow-2xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      }
    >
      {/* Screen reader text summary */}
      <span className="sr-only">
        Requisitions by workflow lifecycle stage: {srSummary}. Total requisitions: {totalRequests}.
      </span>

      {stages.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 py-8 text-center text-muted-foreground">
          <p className="text-xs">No requests recorded in the selected period.</p>
        </div>
      ) : (
        <div className="flex flex-col justify-between flex-1 w-full pt-3">
          {/* Accessible Table View for Mobile below 768px */}
          <div className="block md:hidden w-full">
            <DataTable
              data={stages}
              columns={tableColumns}
              keyField="stage"
              compact
              hidePagination
            />
          </div>

          {/* Desktop DistributionBar View (>= 768px) */}
          <div className="hidden md:flex flex-col justify-center flex-1 w-full py-2">
            <DistributionBar segments={segments} variant="detailed-legend" />
          </div>
        </div>
      )}
    </WidgetShell>
  );
}
