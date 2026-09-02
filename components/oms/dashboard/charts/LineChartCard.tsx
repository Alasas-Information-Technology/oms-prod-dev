"use client";

import React, { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { gridStyle, axisStyle, categoricalScale } from "@/lib/dashboard/chart-tokens";
import { DataTable, ColumnDef } from "@/components/shared/DataTable";
import { ChartTooltip } from "../ChartTooltip";
import { cn } from "@/lib/utils";
import { ChartSeries } from "./BarChartCard";

export interface LineChartCardProps {
  data: any[];
  series: ChartSeries[];
  xAxisKey: string;
  accessibilitySummary: string;
  /** Strictly linear or step — no monotone smoothing allowed */
  type?: "linear" | "step";
  /** Plot area height (default 130px per T3) */
  height?: number;
  className?: string;
  hideLegend?: boolean;
  xAxisFormatter?: (value: any) => string;
  yAxisFormatter?: (value: any) => string;
}

export function LineChartCard({
  data,
  series,
  xAxisKey,
  accessibilitySummary,
  type = "linear",
  height = 130, // Plot area height 130px per T3
  className,
  hideLegend = false,
  xAxisFormatter,
  yAxisFormatter,
}: LineChartCardProps) {
  // Max 7 X-axis data points per T11
  const safeData = useMemo(() => {
    if (data.length <= 7) return data;
    const step = Math.ceil(data.length / 7);
    return data.filter((_, i) => i % step === 0).slice(0, 7);
  }, [data]);

  const scale = useMemo(() => categoricalScale(series.length), [series.length]);
  const showHeaderLegend = !hideLegend && series.length > 1;

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

      {/* T8: Header Legend */}
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
          <LineChart data={safeData} margin={{ top: 10, right: 10, left: -24, bottom: 0 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={gridStyle.vertical}
              horizontal={gridStyle.horizontal}
              stroke={gridStyle.stroke}
              strokeOpacity={gridStyle.strokeOpacity}
            />
            <XAxis
              dataKey={xAxisKey}
              {...axisStyle}
              tickMargin={6}
              tickFormatter={xAxisFormatter}
            />
            <YAxis
              {...axisStyle}
              tickCount={4} // Max 4 Y-axis labels per T11
              tickFormatter={
                yAxisFormatter ||
                ((v) => (typeof v === "number" && v > 999 ? `${(v / 1000).toFixed(0)}k` : v))
              }
            />
            <Tooltip
              content={<ChartTooltip />}
              cursor={{ stroke: "var(--muted-foreground)", strokeWidth: 1, strokeDasharray: "3 3", opacity: 0.4 }}
            />
            {series.map((s, idx) => {
              const color = s.color || scale[idx] || "var(--primary)";
              return (
                <Line
                  key={s.key}
                  type={type} // Linear or step only
                  dataKey={s.key}
                  name={s.name}
                  stroke={color}
                  strokeWidth={1.5} // 1.5px per T4
                  dot={false} // No dots per T4
                  activeDot={{ r: 3.5, strokeWidth: 0, fill: color }} // Dot only on hover per T4
                  animationDuration={300}
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
