"use client";

import React from "react";
import { BarChartCard, BarChartCardProps } from "./charts/BarChartCard";
import { cn } from "@/lib/utils";

/**
 * ColumnChart Component (M4 primitive)
 * Vertical sibling to the horizontal bar component.
 * Uses layout="horizontal" inside BarChartCard to render vertical columns.
 * K3 gradient shading and 4px top corner radius are handled inside BarChartCard.
 */
export function ColumnChart(props: Omit<BarChartCardProps, "layout">) {
  return (
    <div className={cn("w-full", props.className)}>
      <BarChartCard
        {...props}
        layout="horizontal"
      />
    </div>
  );
}
