"use client";

import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
  Cell,
} from "recharts";
import { gridStyle, axisStyle, categoricalScale } from "@/lib/dashboard/chart-tokens";
import { DataTable, ColumnDef } from "@/components/shared/DataTable";
import { ChartTooltip } from "../ChartTooltip";
import { cn } from "@/lib/utils";

export interface ChartSeries {
  key: string;
  name: string;
  color?: string;
  stackId?: string;
}

export interface BarChartCardProps {
  data: any[];
  series: ChartSeries[];
  xAxisKey: string;
  accessibilitySummary: string;
  /** "horizontal" = vertical bars (X is category), "vertical" = horizontal bars (Y is category) */
  layout?: "horizontal" | "vertical";
  stacked?: boolean;
  /** Plot area height (default 130px per T3) */
  height?: number | string;
  className?: string;
  hideLegend?: boolean;
  hideGrid?: boolean;
  xAxisFormatter?: (value: any) => string;
  yAxisFormatter?: (value: any) => string;
  getCellColor?: (entry: any, index: number, seriesKey: string) => string | undefined;
  onBarClick?: (entry: any) => void;
}

export function BarChartCard({
  data,
  series,
  xAxisKey,
  accessibilitySummary,
  layout = "horizontal",
  stacked = false,
  height = 130, // Plot area height 130px per T3
  className,
  hideLegend = false,
  hideGrid = false,
  xAxisFormatter,
  yAxisFormatter,
  getCellColor,
  onBarClick,
}: BarChartCardProps) {
  // Max 7 data points for X-axis per T11
  const safeData = useMemo(() => {
    if (data.length <= 7) return data;
    const step = Math.ceil(data.length / 7);
    return data.filter((_, i) => i % step === 0).slice(0, 7);
  }, [data]);

  const scale = useMemo(() => categoricalScale(series.length), [series.length]);

  // Header Legend per T8: 2px x 12px color bar, 6px gap, 12px muted label, 16px between entries
  const showHeaderLegend = !hideLegend && series.length > 1;

  // Fallback table columns for mobile
  const tableColumns: ColumnDef<any>[] = [
    {
      key: xAxisKey,
      header: "Category",
      render: (val, row) => <span className="font-medium text-foreground">{row[xAxisKey]}</span>,
    },
    ...series.map((s) => ({
      key: s.key,
      header: s.name,
      align: "right" as const,
      render: (val: any, row: any) => (
        <span className="font-mono tabular-nums text-muted-foreground">
          {typeof row[s.key] === "number" ? row[s.key].toLocaleString() : row[s.key]}
        </span>
      ),
    })),
  ];

  return (
    <div className={cn("w-full flex flex-col gap-2 select-none", className)} role="img" aria-label={accessibilitySummary}>
      <span className="sr-only">{accessibilitySummary}</span>

      {/* T8: Legend inline above plot area */}
      {showHeaderLegend && (
        <div className="flex items-center justify-end gap-4 text-[12px] text-muted-foreground pb-1">
          {series.map((s, idx) => {
            const color = s.color || scale[idx] || "var(--primary)";
            return (
              <div key={s.key} className="flex items-center gap-1.5">
                <span
                  style={{ backgroundColor: color }}
                  className="w-[2px] h-[12px] rounded-[1px] shrink-0"
                />
                <span className="truncate">{s.name}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Mobile Responsive Fallback (below 768px) */}
      <div className="block md:hidden overflow-hidden rounded-md border border-border/50">
        <DataTable
          columns={tableColumns}
          data={data}
          keyField={xAxisKey}
          compact
          hidePagination
        />
      </div>

      {/* Desktop Plot View: 130px Plot Area */}
      <div className="hidden md:block w-full" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={safeData}
            layout={layout}
            margin={{
              top: 5,
              right: layout === "vertical" ? 20 : 5,
              left: layout === "vertical" ? 5 : -24,
              bottom: 0,
            }}
          >
            {!hideGrid && (
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={gridStyle.vertical}
                horizontal={gridStyle.horizontal}
                stroke={gridStyle.stroke}
                strokeOpacity={gridStyle.strokeOpacity}
              />
            )}

            {layout === "horizontal" ? (
              <>
                <XAxis
                  dataKey={xAxisKey}
                  {...axisStyle}
                  tickMargin={6}
                  tickFormatter={xAxisFormatter}
                />
                <YAxis
                  {...axisStyle}
                  tickCount={4} // Max 4 labels on Y-axis per T11
                  tickFormatter={
                    yAxisFormatter ||
                    ((v) => (typeof v === "number" && v > 999 ? `${(v / 1000).toFixed(0)}k` : v))
                  }
                />
              </>
            ) : (
              <>
                <XAxis
                  type="number"
                  {...axisStyle}
                  tickCount={4}
                  tickFormatter={
                    xAxisFormatter ||
                    ((v) => (typeof v === "number" && v > 999 ? `${(v / 1000).toFixed(0)}k` : v))
                  }
                />
                <YAxis
                  dataKey={xAxisKey}
                  type="category"
                  {...axisStyle}
                  tickMargin={6}
                  width={90}
                  tickFormatter={yAxisFormatter}
                />
              </>
            )}

            <Tooltip
              content={<ChartTooltip />}
              cursor={{ fill: "var(--muted)", opacity: 0.15 }}
            />

            {series.map((s, idx) => {
              const defaultColor = s.color || scale[idx] || "var(--primary)";
              const stackId = stacked ? "stack" : s.stackId;

              return (
                <Bar
                  key={s.key}
                  dataKey={s.key}
                  name={s.name}
                  stackId={stackId}
                  fill={defaultColor}
                  radius={
                    stacked
                      ? undefined
                      : layout === "horizontal"
                      ? [3, 3, 0, 0]
                      : [0, 3, 3, 0]
                  }
                  animationDuration={300}
                  onClick={(entry) => onBarClick && onBarClick(entry)}
                  cursor={onBarClick ? "pointer" : undefined}
                >
                  {/* Per-cell color overrides */}
                  {safeData.map((entry, entryIdx) => {
                    const customColor = getCellColor ? getCellColor(entry, entryIdx, s.key) : undefined;
                    return customColor ? <Cell key={`cell-${entryIdx}`} fill={customColor} /> : null;
                  })}
                </Bar>
              );
            })}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
