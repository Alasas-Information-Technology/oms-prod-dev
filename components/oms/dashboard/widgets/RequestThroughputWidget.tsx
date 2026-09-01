"use client";

import React, { useId, useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { WidgetShell } from "../WidgetShell";
import { WidgetProps } from "@/lib/dashboard/registry";
import { RequestThroughputData } from "@/types/dashboard";
import { HatchPatternDefs } from "../HatchPattern";
import { ChartTooltip } from "../ChartTooltip";
import { gridStyle, axisStyle } from "@/lib/dashboard/chart-tokens";
import { cn } from "@/lib/utils";

/**
 * V3 — Throughput over time per DASHBOARD-VISUAL-DEPTH.md:
 * - 12 weeks, two series: requests created and requests completed
 * - Area chart with 130px plot and HatchPattern fills
 * - Where completed trails created, divergence is shaded in amber at 10%
 * - T8 Header Legend: positioned in headerActions
 * - Caption: "Backlog grew by 4 requests over 12 weeks" or "Backlog cleared by 2 requests over 12 weeks"
 */
export function RequestThroughputWidget({
  scope,
  data,
  isLoading,
  error,
  onRetry,
  updatedAt,
}: WidgetProps<RequestThroughputData>) {
  const generatedId = useId().replace(/:/g, "");
  const createdHatchId = `tp-created-${generatedId}`;
  const completedHatchId = `tp-completed-${generatedId}`;

  const weeks = data?.weeks ?? [];
  const backlogChange = data?.backlogChange ?? 0;

  // Format week labels (e.g., "08 Jun")
  const chartData = useMemo(() => {
    return weeks.map((w) => {
      const dateObj = new Date(w.weekStarting);
      const label = isNaN(dateObj.getTime())
        ? w.weekStarting
        : dateObj.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });

      return {
        ...w,
        weekLabel: label,
      };
    });
  }, [weeks]);

  // Caption calculation
  let caption = "";
  let toneClass = "text-muted-foreground";
  if (backlogChange > 0) {
    caption = `Backlog grew by ${backlogChange} request${backlogChange === 1 ? "" : "s"} over ${weeks.length || 12} weeks`;
    toneClass = "text-amber-600 dark:text-amber-400";
  } else if (backlogChange < 0) {
    caption = `Backlog cleared by ${Math.abs(backlogChange)} request${Math.abs(backlogChange) === 1 ? "" : "s"} over ${weeks.length || 12} weeks`;
    toneClass = "text-emerald-600 dark:text-emerald-400";
  } else {
    caption = `Backlog remained stable over ${weeks.length || 12} weeks`;
  }

  // T8 Header Legend
  const headerLegend = (
    <div className="flex items-center gap-3.5 text-[11px] text-muted-foreground select-none">
      <div className="flex items-center gap-1.5">
        <span className="w-2.5 h-2.5 rounded-xs bg-primary shrink-0" />
        <span>Created</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500 shrink-0" />
        <span>Completed</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-2.5 h-2.5 rounded-xs bg-amber-500/20 border border-amber-500/40 shrink-0" />
        <span>Backlog delta</span>
      </div>
    </div>
  );

  return (
    <WidgetShell
      title="Request throughput"
      scopeLabel={scope?.label}
      href="/app/requests"
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      updatedAt={updatedAt}
      headerActions={headerLegend}
      minHeight={215}
    >
      <div className="flex flex-col justify-between h-full p-5 gap-3 select-none font-sans">
        {/* SVG Defs for 45° Diagonal Hatch Fills */}
        <svg className="sr-only" aria-hidden="true" width="0" height="0">
          <defs>
            <HatchPatternDefs
              id={createdHatchId}
              color="var(--primary)"
              strokeWidth={1}
              opacity={0.20}
            />
            <HatchPatternDefs
              id={completedHatchId}
              color="#10b981"
              strokeWidth={1}
              opacity={0.25}
            />
          </defs>
        </svg>

        {/* 130px Area Plot */}
        <div className="w-full h-[130px] min-w-0">
          <ResponsiveContainer width="100%" height={130}>
            <AreaChart
              data={chartData}
              margin={{ top: 8, right: 8, left: -24, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={gridStyle.vertical}
                horizontal={gridStyle.horizontal}
                stroke={gridStyle.stroke}
                strokeOpacity={gridStyle.strokeOpacity}
              />
              <XAxis
                dataKey="weekLabel"
                {...axisStyle}
                tickMargin={6}
                interval="preserveStartEnd"
              />
              <YAxis
                {...axisStyle}
                tickCount={4}
                allowDecimals={false}
              />
              <Tooltip
                content={<ChartTooltip />}
                cursor={{
                  stroke: "var(--muted-foreground)",
                  strokeWidth: 1,
                  strokeDasharray: "3 3",
                  opacity: 0.4,
                }}
              />
              <Area
                type="linear"
                dataKey="created"
                name="Requests created"
                stroke="var(--primary)"
                strokeWidth={1.5}
                fill={`url(#${createdHatchId})`}
                dot={false}
                activeDot={{ r: 3.5, strokeWidth: 0, fill: "var(--primary)" }}
              />
              <Area
                type="linear"
                dataKey="completed"
                name="Requests completed"
                stroke="#10b981"
                strokeWidth={1.5}
                fill={`url(#${completedHatchId})`}
                dot={false}
                activeDot={{ r: 3.5, strokeWidth: 0, fill: "#10b981" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Bottom Assessment & Contextual Caption */}
        <div className="pt-2 border-t border-border/40 flex items-center justify-between text-xs">
          <span className={cn("font-medium", toneClass)}>
            {caption}
          </span>
          <span className="text-[11px] text-muted-foreground font-mono tabular-nums">
            12-week rolling window
          </span>
        </div>
      </div>
    </WidgetShell>
  );
}
