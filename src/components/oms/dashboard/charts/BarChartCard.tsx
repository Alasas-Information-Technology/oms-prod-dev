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
  Legend,
  LabelList
} from "recharts";
import { gridStyle, axisStyle, tooltipStyle, categoricalScale, semanticColors } from "@/src/lib/dashboard/chart-tokens";
import { DataTable, ColumnDef } from "@/components/shared/DataTable";
import { cn } from "@/lib/utils";

export interface ChartSeries {
  key: string;
  name: string;
  color?: string; // Optional override, otherwise uses categoricalScale
}

export interface BarChartCardProps {
  data: any[];
  series: ChartSeries[];
  xAxisKey: string;
  accessibilitySummary: string;
  layout?: "horizontal" | "vertical"; // horizontal means bars grow up, vertical means bars grow right
  height?: number; // 200-260px
  className?: string;
}

export function BarChartCard({
  data,
  series,
  xAxisKey,
  accessibilitySummary,
  layout = "horizontal",
  height = 240,
  className,
}: BarChartCardProps) {
  // Enforce height constraints
  const safeHeight = Math.max(200, Math.min(260, height));
  const showLegend = series.length > 3;

  // Thin data if > 8
  const safeData = useMemo(() => {
    if (data.length <= 8) return data;
    if (process.env.NODE_ENV === "development") {
      console.warn(`[BarChartCard] Data points (${data.length}) exceed maximum of 8. Thinning applied.`);
    }
    // Simple thinning (take every nth element) to keep max 8
    const step = Math.ceil(data.length / 8);
    return data.filter((_, i) => i % step === 0).slice(0, 8);
  }, [data]);

  const scale = categoricalScale(series.length);

  // Determine Table columns for fallback
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

      {/* Responsive Fallback */}
      <div className="block md:hidden overflow-hidden rounded-md border border-border/50">
        <DataTable
          columns={tableColumns}
          data={data} // show all data in table, not thinned
          keyField={xAxisKey}
          compact
          hidePagination
        />
      </div>

      {/* Chart */}
      <div className="hidden md:block w-full" style={{ height: safeHeight }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={safeData} layout={layout} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={gridStyle.vertical}
              horizontal={gridStyle.horizontal}
              stroke={gridStyle.stroke}
              strokeOpacity={gridStyle.strokeOpacity}
            />
            {layout === "horizontal" ? (
              <>
                <XAxis dataKey={xAxisKey} {...axisStyle} tickMargin={8} />
                <YAxis {...axisStyle} tickFormatter={(v) => (typeof v === "number" && v > 999 ? `${(v/1000).toFixed(1)}k` : v)} />
              </>
            ) : (
              <>
                <XAxis type="number" {...axisStyle} tickFormatter={(v) => (typeof v === "number" && v > 999 ? `${(v/1000).toFixed(1)}k` : v)} />
                <YAxis dataKey={xAxisKey} type="category" {...axisStyle} tickMargin={8} />
              </>
            )}
            <Tooltip
              contentStyle={tooltipStyle}
              itemStyle={{ color: "var(--foreground)" }}
              cursor={{ fill: "var(--muted)", opacity: 0.2 }}
            />
            {showLegend && <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />}
            {series.map((s, idx) => (
              <Bar
                key={s.key}
                dataKey={s.key}
                name={s.name}
                fill={s.color || scale[idx]}
                radius={layout === "horizontal" ? [4, 4, 0, 0] : [0, 4, 4, 0]}
                isAnimationActive={false} // Will handle global animation rules later if needed, but per E5: "Chart mount 300ms, once" - actually we can keep default Recharts anim or disable it. The instructions say "isAnimationActive={false}" but let's set to true for now with 300ms.
                animationDuration={300}
              >
                {!showLegend && layout === "horizontal" && (
                  <LabelList dataKey={s.key} position="top" fill="var(--muted-foreground)" fontSize={11} />
                )}
                {!showLegend && layout === "vertical" && (
                  <LabelList dataKey={s.key} position="right" fill="var(--muted-foreground)" fontSize={11} />
                )}
              </Bar>
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
