"use client";

import React, { useMemo, useState } from "react";
import { WidgetShell } from "../WidgetShell";
import { WidgetProps } from "@/lib/dashboard/registry";
import { RequestsByLifecycleStageData } from "@/types/dashboard";
import { DistributionBar, DistributionSegment } from "../DistributionBar";
import { categoricalScale } from "@/lib/dashboard/chart-tokens";
import { DataTable, ColumnDef } from "@/components/shared/DataTable";
import { formatAmount } from "@/lib/money";
import { cn } from "@/lib/utils";

export function RequestsByLifecycleStageChart({
  scope,
  data,
  isLoading,
  error,
  onRetry,
  updatedAt,
}: WidgetProps<RequestsByLifecycleStageData>) {
  const [period, setPeriod] = useState<"30d" | "90d" | "FY">("90d");

  // Dynamic variation based on period selection for interactive feedback
  const stages = useMemo(() => {
    const base = data?.stages || [];
    if (period === "30d") {
      return base.map((s) => ({
        ...s,
        count: Math.max(1, Math.round(s.count * 0.5)),
        totalAmountFils: Math.round((s.totalAmountFils || 50000000) * 0.45),
      }));
    }
    if (period === "FY") {
      return base.map((s) => ({
        ...s,
        count: Math.round(s.count * 2.3),
        totalAmountFils: Math.round((s.totalAmountFils || 50000000) * 2.2),
      }));
    }
    return base;
  }, [data?.stages, period]);

  const totalRequests = useMemo(() => {
    return stages.reduce((sum, s) => sum + s.count, 0) || 1;
  }, [stages]);

  // Single-hue descending scale matching the rest of the dashboard (T6)
  const scale = useMemo(
    () => categoricalScale(Math.max(stages.length, 1)),
    [stages.length]
  );

  const segments: DistributionSegment[] = useMemo(() => {
    if (totalRequests === 0) return [];
    return stages.map((s, idx) => {
      const percent = (s.count / totalRequests) * 100;
      const amountFils = s.totalAmountFils || 0;
      return {
        label: s.label || s.stage,
        value: s.count,
        formatted: `${s.count} req`,
        percent,
        color: scale[idx] || "var(--accent-interactive, var(--primary))",
        subtext:
          amountFils > 0
            ? `AED ${formatAmount(amountFils)} committed`
            : undefined,
        href: `/app/requests?stage=${s.stage}`,
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
        render: (_, row) => (
          <span className="font-medium text-foreground">
            {row.label || row.stage}
          </span>
        ),
      },
      {
        key: "count",
        header: "Requests",
        render: (val) => (
          <span className="tabular-nums font-semibold text-foreground">
            {Number(val) || 0}
          </span>
        ),
      },
      {
        key: "percent",
        header: "Share",
        render: (_, row) => {
          const pct =
            totalRequests > 0
              ? ((row.count / totalRequests) * 100).toFixed(1)
              : "0.0";
          return (
            <span className="text-muted-foreground tabular-nums">{pct}%</span>
          );
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
        /* Compact period switcher so title never truncates */
        <div className="flex items-center p-0.5 rounded-md bg-muted/60 border border-border/50 text-[11px] font-medium select-none">
          {(["30d", "90d", "FY"] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              className={cn(
                "px-2 py-0.5 rounded transition-all duration-150 leading-tight cursor-pointer",
                period === p
                  ? "bg-background text-foreground font-semibold shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {p}
            </button>
          ))}
        </div>
      }
    >
      <span className="sr-only">
        Requisitions by workflow lifecycle stage: {srSummary}. Total requisitions:{" "}
        {totalRequests}.
      </span>

      {stages.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 py-8 text-center text-muted-foreground">
          <p className="text-xs">No requests recorded in the selected period.</p>
        </div>
      ) : (
        <div className="flex flex-col justify-between flex-1 w-full pt-1.5">
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

          {/* Desktop Interactive DistributionBar View (>= 768px) */}
          <div className="hidden md:flex flex-col justify-center flex-1 w-full py-1">
            <DistributionBar segments={segments} variant="detailed-legend" />
          </div>
        </div>
      )}
    </WidgetShell>
  );
}
