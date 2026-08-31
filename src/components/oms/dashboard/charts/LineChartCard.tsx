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
  Legend,
  LabelList
} from "recharts";
import { gridStyle, axisStyle, tooltipStyle, categoricalScale } from "@/src/lib/dashboard/chart-tokens";
import { DataTable, ColumnDef } from "@/components/shared/DataTable";
import { cn } from "@/lib/utils";
import { ChartSeries } from "./BarChartCard";

export interface LineChartCardProps {
  data: any[];
  series: ChartSeries[];
  xAxisKey: string;
  accessibilitySummary: string;
  type?: "linear" | "step"; // STRICT ENFORCEMENT: No monotone/smooth curves allowed
  height?: number; // 200-260px
  className?: string;
}

export function LineChartCard({
  data,
  series,
  xAxisKey,
  accessibilitySummary,
  type = "linear",
  height = 240,
  className,
}: LineChartCardProps) {
  const safeHeight = Math.max(200, Math.min(260, height));
  const showLegend = series.length > 3;

  const safeData = useMemo(() => {
    if (data.length <= 8) return data;
    if (process.env.NODE_ENV === "development") {
      console.warn(`[LineChartCard] Data points (${data.length}) exceed maximum of 8. Thinning applied.`);
    }
    const step = Math.ceil(data.length / 8);
    return data.filter((_, i) => i % step === 0).slice(0, 8);
  }, [data]);

  const scale = categoricalScale(series.length);

  const tableColumns: ColumnDef<any>[] = [
    { key: xAxisKey, header: "Category", render: (val, row) => <span className="font-medium text-foreground">{row[xAxisKey]}</span> },
    ...series.map((s) => ({
      key: s.key,
      header: s.name,
      align: "right" as const,
      render: (val: any, row: any) => <span className="font-mono tabular-nums text-muted-foreground">{row[s.key]}</span>,
    }))
  ];

  return (
    <div className={cn("w-full", className)} role="img" aria-label={accessibilitySummary}>
      <span className="sr-only">{accessibilitySummary}</span>

      <div className="block md:hidden overflow-hidden rounded-md border border-border/50">
        <DataTable
          columns={tableColumns}
          data={data}
          keyField={xAxisKey}
          compact
          hidePagination
        />
      </div>

      <div className="hidden md:block w-full" style={{ height: safeHeight }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={safeData} margin={{ top: 15, right: 15, left: -20, bottom: 0 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={gridStyle.vertical}
              horizontal={gridStyle.horizontal}
              stroke={gridStyle.stroke}
              strokeOpacity={gridStyle.strokeOpacity}
            />
            <XAxis dataKey={xAxisKey} {...axisStyle} tickMargin={8} />
            <YAxis {...axisStyle} tickFormatter={(v) => (typeof v === "number" && v > 999 ? `${(v/1000).toFixed(1)}k` : v)} />
            <Tooltip
              contentStyle={tooltipStyle}
              itemStyle={{ color: "var(--foreground)" }}
              cursor={{ stroke: "var(--muted-foreground)", strokeWidth: 1, strokeDasharray: "3 3", opacity: 0.5 }}
            />
            {showLegend && <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />}
            {series.map((s, idx) => (
              <Line
                key={s.key}
                type={type}
                dataKey={s.key}
                name={s.name}
                stroke={s.color || scale[idx]}
                strokeWidth={2}
                dot={{ r: 4, strokeWidth: 2, fill: "var(--card)" }}
                activeDot={{ r: 6, strokeWidth: 0, fill: s.color || scale[idx] }}
                animationDuration={300}
              >
                {!showLegend && (
                  <LabelList dataKey={s.key} position="top" fill="var(--muted-foreground)" fontSize={11} offset={10} />
                )}
              </Line>
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
