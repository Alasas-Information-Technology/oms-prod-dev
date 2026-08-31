"use client";

import React from "react";
import {
  LineChart,
  Line,
  ResponsiveContainer
} from "recharts";
import { cn } from "@/lib/utils";
import { categoricalScale } from "@/src/lib/dashboard/chart-tokens";

export interface SparklineProps {
  data: any[];
  dataKey: string;
  accessibilitySummary: string;
  color?: string; // Optional override
  className?: string;
}

export function Sparkline({
  data,
  dataKey,
  accessibilitySummary,
  color,
  className,
}: SparklineProps) {
  // Use first hue if no color is provided
  const resolvedColor = color || categoricalScale(1)[0];

  return (
    <div className={cn("w-full h-[32px]", className)} role="img" aria-label={accessibilitySummary}>
      <span className="sr-only">{accessibilitySummary}</span>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line
            type="linear" // Never monotone
            dataKey={dataKey}
            stroke={resolvedColor}
            strokeWidth={2}
            dot={false}
            activeDot={false}
            isAnimationActive={false} // Sparklines are small and should appear instantly
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
