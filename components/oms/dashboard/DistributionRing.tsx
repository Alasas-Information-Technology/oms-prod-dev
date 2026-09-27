"use client";

import React, { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts";
import { categoricalScale } from "@/lib/dashboard/chart-tokens";
import { DistributionSegment } from "./DistributionBar";
import { cn } from "@/lib/utils";

export interface DistributionRingProps {
  segments: DistributionSegment[];
  className?: string;
  totalLabel?: string;
}

export function DistributionRing({ segments, className, totalLabel = "Total" }: DistributionRingProps) {
  // Validate minimum segments in dev
  if (process.env.NODE_ENV === "development" && segments.length < 3) {
    console.warn("[DistributionRing]: Received fewer than 3 segments. This violates the M1 rule. Falling back to DistributionBar...");
  }

  // Filter out non-residual for color scale
  const nonResidualCount = useMemo(
    () => segments.filter((s) => !s.isResidual).length,
    [segments]
  );
  
  const scale = useMemo(
    () => categoricalScale(Math.max(nonResidualCount, 1)),
    [nonResidualCount]
  );

  const processedSegments = useMemo(() => {
    let nonResidualIdx = 0;
    return segments.map((seg) => {
      let color = seg.color;
      if (!color) {
        if (seg.isResidual) {
          color = "color-mix(in srgb, var(--primary) 30%, transparent)";
        } else {
          color = scale[nonResidualIdx % scale.length];
          nonResidualIdx++;
        }
      }
      return { ...seg, resolvedColor: color };
    });
  }, [segments, scale]);

  const totalValue = useMemo(() => {
    return segments.reduce((acc, curr) => acc + Number(curr.value), 0);
  }, [segments]);

  // If fewer than 3 segments, fallback is required by instructions
  if (segments.length < 3) {
    const { DistributionBar } = require("./DistributionBar");
    return <DistributionBar segments={segments} className={className} />;
  }

  return (
    <div className={cn("flex flex-col gap-4 w-full", className)}>
      <div className="relative aspect-square max-w-[200px] mx-auto w-full">
        {/* Center Total */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-3xl font-bold tracking-tight text-foreground">{totalValue.toLocaleString()}</span>
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{totalLabel}</span>
        </div>
        
        {/* Ring Chart */}
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={processedSegments}
              cx="50%"
              cy="50%"
              innerRadius="72%"
              outerRadius="90%"
              paddingAngle={2}
              dataKey="value"
              stroke="none"
              cornerRadius={2}
            >
              {processedSegments.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.resolvedColor} 
                />
              ))}
            </Pie>
            <RechartsTooltip
              cursor={false}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload as typeof processedSegments[0];
                  return (
                    <div className="rounded-md border border-border bg-background px-3 py-2 shadow-xl z-50">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: data.resolvedColor }} />
                        <span className="text-xs font-medium text-muted-foreground">{data.label}</span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm font-bold text-foreground">
                          {data.formatted !== undefined ? data.formatted : data.value.toLocaleString()}
                        </span>
                        <span className="text-[11px] text-muted-foreground">({data.percent.toFixed(1)}%)</span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend (T8 Embedded Pattern) */}
      <div className="flex flex-col gap-2 pt-2 border-t border-border/40">
        {processedSegments.map((seg, idx) => (
          <div key={idx} className="flex items-center justify-between group">
            <div className="flex items-center gap-2">
              <div
                className={cn("w-2.5 h-2.5 rounded-[2px] shrink-0", seg.isResidual && "border border-primary/30")}
                style={{ backgroundColor: seg.resolvedColor }}
              />
              <span className="text-[13px] font-medium text-foreground">{seg.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-semibold tabular-nums text-foreground">
                {seg.formatted !== undefined ? seg.formatted : seg.value.toLocaleString()}
              </span>
              <span className="text-[11px] text-muted-foreground tabular-nums w-10 text-right">
                {seg.percent.toFixed(1)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
