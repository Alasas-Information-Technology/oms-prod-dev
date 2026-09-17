"use client";

import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import { UpcomingMilestoneItem, MilestoneType } from "@/types/dashboard";
import { cn } from "@/lib/utils";
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  ReferenceLine,
  Tooltip,
} from "recharts";

export interface MilestoneTimelineProps {
  milestones: UpcomingMilestoneItem[];
  referenceDate?: string; // Default "2026-08-31"
  className?: string;
}

const TYPE_COLORS: Record<MilestoneType, { bg: string; fill: string; border: string; text: string; label: string }> = {
  INTERVIEW: {
    bg: "bg-indigo-500",
    fill: "#6366f1", // indigo-500
    border: "border-indigo-600",
    text: "text-indigo-600 dark:text-indigo-400",
    label: "Interview",
  },
  JOINING: {
    bg: "bg-emerald-500",
    fill: "#10b981", // emerald-500
    border: "border-emerald-600",
    text: "text-emerald-600 dark:text-emerald-400",
    label: "Joining",
  },
  DOCUMENT_EXPIRY: {
    bg: "bg-amber-500",
    fill: "#f59e0b", // amber-500
    border: "border-amber-600",
    text: "text-amber-600 dark:text-amber-400",
    label: "Doc Expiry",
  },
  CONTRACT_END: {
    bg: "bg-rose-500",
    fill: "#f43f5e", // rose-500
    border: "border-rose-600",
    text: "text-rose-600 dark:text-rose-400",
    label: "Contract End",
  },
};

interface MilestoneCluster {
  id: string;
  items: UpcomingMilestoneItem[];
  primaryType: MilestoneType;
  date: Date;
  dateStr: string;
  timestamp: number;
}

export function MilestoneTimeline({
  milestones,
  referenceDate = "2026-08-31",
  className,
}: MilestoneTimelineProps) {
  const router = useRouter();

  const baseDate = useMemo(() => new Date(referenceDate), [referenceDate]);
  const windowDays = 60;
  
  const windowEnd = useMemo(() => {
    const d = new Date(baseDate);
    d.setDate(d.getDate() + windowDays);
    return d;
  }, [baseDate]);

  // Cluster milestones within 2 days of each other
  const clusters = useMemo(() => {
    const valid = milestones
      .map((m) => ({ ...m, dateObj: new Date(m.date) }))
      .filter((m) => !isNaN(m.dateObj.getTime()))
      .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());

    const result: MilestoneCluster[] = [];

    for (const item of valid) {
      const existing = result.find((c) => {
        const diff = Math.abs(item.dateObj.getTime() - c.date.getTime()) / (24 * 60 * 60 * 1000);
        return diff <= 2;
      });

      if (existing) {
        existing.items.push(item);
      } else {
        result.push({
          id: item.id,
          items: [item],
          primaryType: item.type,
          date: item.dateObj,
          dateStr: item.formattedDate || item.date,
          timestamp: item.dateObj.getTime(),
        });
      }
    }

    return result;
  }, [milestones]);

  const data = useMemo(() => {
    return clusters.map(c => ({
      ...c,
      y: 0, // 1D scatter plot
      z: c.items.length // Use Z axis for size if needed
    }));
  }, [clusters]);

  const CustomShape = (props: any) => {
    const { cx, cy, payload } = props;
    const config = TYPE_COLORS[payload.primaryType as MilestoneType] || TYPE_COLORS.INTERVIEW;
    const count = payload.items.length;
    const sizePx = Math.min(22, 13 + (count - 1) * 3);
    const radius = sizePx / 2;

    return (
      <g 
        transform={`translate(${cx}, ${cy})`}
        style={{ cursor: 'pointer' }}
        onClick={() => {
          if (payload.items[0]?.link) {
            router.push(payload.items[0].link);
          }
        }}
        className="transition-transform duration-150 hover:scale-125 hover:z-50"
      >
        <circle
          cx={0}
          cy={0}
          r={radius + 1}
          fill="hsl(var(--background))"
          stroke={config.fill}
          strokeWidth={3}
          className="shadow-sm"
        />
        <circle
          cx={0}
          cy={0}
          r={radius - 2}
          fill={config.fill}
        />
        {count > 1 && (
          <text 
            x={0} 
            y={0} 
            dy={3.5} 
            textAnchor="middle" 
            fill="#fff" 
            fontSize={10} 
            fontWeight="bold"
            pointerEvents="none"
          >
            {count}
          </text>
        )}
      </g>
    );
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const cluster = payload[0].payload as MilestoneCluster;
      
      return (
        <div className="z-50 bg-popover text-popover-foreground border border-border/80 rounded-md p-2 shadow-lg min-w-[180px] max-w-[260px] text-xs pointer-events-none animate-in fade-in zoom-in-95 duration-100">
          <div className="font-semibold text-foreground pb-1 border-b border-border/40 flex items-center justify-between">
            <span>{cluster.dateStr}</span>
            <span className="text-[10px] font-normal text-muted-foreground">
              {cluster.items.length} item{cluster.items.length > 1 ? "s" : ""}
            </span>
          </div>
          <div className="mt-1.5 space-y-1">
            {cluster.items.map((item, idx) => {
              const cfg = TYPE_COLORS[item.type] || TYPE_COLORS.INTERVIEW;
              return (
                <div key={idx} className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-1.5 font-medium text-foreground">
                    <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", cfg.bg)} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.detail && (
                    <span className="text-[11px] text-muted-foreground pl-3 truncate">
                      {item.detail}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    return null;
  };

  const formatMonthTick = (tickItem: number) => {
    const date = new Date(tickItem);
    return date.toLocaleDateString("en-GB", { month: "short" });
  };

  return (
    <div
      className={cn(
        "relative w-full h-[96px] bg-muted/20 border border-border/40 rounded-md p-2 select-none flex flex-col justify-between",
        className
      )}
    >
      {/* Header Row for Labels */}
      <div className="flex items-center justify-between text-[10px] font-medium text-muted-foreground px-2">
        <span className="font-semibold text-primary uppercase tracking-wider">Today</span>
        <span className="hidden sm:inline">60-day horizon</span>
      </div>

      {/* Chart Container */}
      <div className="w-full flex-1 min-h-0 relative">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 24, right: 20, bottom: 10, left: 20 }}>
            <XAxis 
              type="number" 
              dataKey="timestamp" 
              domain={[baseDate.getTime(), windowEnd.getTime()]} 
              tickFormatter={formatMonthTick}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fontWeight: 600, fill: "hsl(var(--foreground))" }}
              tickCount={4}
              orientation="top"
              dy={-18}
            />
            <YAxis 
              type="number" 
              dataKey="y" 
              domain={[-2, 2]} 
              hide 
            />
            <ZAxis dataKey="z" range={[50, 200]} />
            <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: "3 3", stroke: "hsl(var(--border))" }} />
            <ReferenceLine 
              y={0} 
              stroke="hsl(var(--border))" 
              strokeOpacity={1}
              strokeWidth={3}
            />
            <ReferenceLine 
              x={baseDate.getTime()} 
              stroke="hsl(var(--primary))" 
              strokeWidth={2} 
              strokeDasharray="4 4"
            />
            {/* Dot at top of reference line */}
            <Scatter 
              data={[{ timestamp: baseDate.getTime(), y: 0 }]} 
              shape={(props: any) => (
                <circle cx={props.cx} cy={props.cy - 16} r={4} fill="hsl(var(--primary))" />
              )}
              isAnimationActive={false}
            />
            <Scatter 
              name="Milestones" 
              data={data} 
              shape={<CustomShape />}
              isAnimationActive={false}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
