"use client";

import React from "react";
import { SimpleKpiCard, GenericKpiCardProps } from "@/components/budget/SimpleKpiCard";

export type KpiCardProps = GenericKpiCardProps;

/**
 * Shared KpiCard Component with bar-behind-number per U2 / J2.
 *
 * Requirements:
 * - Height: 120px-152px uniform card
 * - Value sits on top of bar visualisation spanning card's full width behind it
 * - T4 hatched fill for recent periods, solid fill for current period
 * - Hover reveals T7 ChartTooltip with value and delta
 */
export function KpiCard(props: KpiCardProps) {
  return <SimpleKpiCard visualTreatment="sparkline" {...props} />;
}

export { KpiBarBehindNumber } from "./charts/KpiBarBehindNumber";
