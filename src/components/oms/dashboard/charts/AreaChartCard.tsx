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
import { gridStyle, axisStyle, categoricalScale } from "@/src/lib/dashboard/chart-tokens";
import { DataTable, ColumnDef } from "@/components/shared/DataTable";
import { HatchPatternDefs } from "../HatchPattern";
import { ChartTooltip } from "../ChartTooltip";
import { cn } from "@/lib/utils";
import { ChartSeries } from "./BarChartCard";

export interface AreaChartCardProps {
  data: any[];
  series: ChartSeries[];
  xAxisKey: string;
  accessibilitySummary: string;
  /** Plot area height (default 130px per T3) */
  height?: number;
  className?: string;
  hideLegend?: boolean;
  xAxisFormatter?: (value: any) => string;
  yAxisFormatter?: (value: any) => string;
}

export function AreaChartCard({
  data,
  series,
  xAxisKey,
  accessibilitySummary,
  height = 130, // Plot area height 130px per T3
  className,
  hideLegend = false,
  xAxisFormatter,
  yAxisFormatter,
}: AreaChartCardProps) {
  const generatedId = useId().replace(/:/g, "");
  const baseHatchId = `area-hatch-${generatedId}`;

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

      {/* SVG Defs for 45° Diagonal Hatch Fills per T4 */}
      <svg className="sr-only" aria-hidden="true" width="0" height="0">
        <defs>
          {series.map((s, idx) => {
            const color = s.color || scale[idx] || "var(--primary)";
            return (
              <HatchPatternDefs
                key={s.key}
                id={`${baseHatchId}-${idx}`}
                color={color}
                strokeWidth={1}
                opacity={0.24}
              />
            );
          })}
        </defs>
      </svg>

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
          <AreaChart data={safeData} margin={{ top: 10, right: 10, left: -24, bottom: 0 }}>
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
                <Area
                  key={s.key}
                  type="linear" // Never monotone
                  dataKey={s.key}
                  name={s.name}
                  stroke={color}
                  strokeWidth={1.5} // 1.5px per T4
                  fill={`url(#${baseHatchId}-${idx})`} // T4 Hatched fill
                  dot={false}
                  activeDot={{ r: 3.5, strokeWidth: 0, fill: color }}
                  animationDuration={300}
                />
              );
            })}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
