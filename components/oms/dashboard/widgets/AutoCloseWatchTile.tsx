"use client";

import React from "react";
import { SimpleKpiCard } from "@/components/budget/SimpleKpiCard";
import { WidgetProps } from "@/lib/dashboard/registry";
import { AutoCloseWatchData } from "@/types/dashboard";
import { formatAbbreviated } from "@/lib/money";

export function AutoCloseWatchTile({
  data,
  isLoading,
  error,
}: WidgetProps<AutoCloseWatchData>) {
  const count = data?.items ? data.items.length : 0;
  const fundsFils = data?.totalFundsAtRisk ?? 0;
  const formattedFunds = formatAbbreviated(fundsFils, { showCurrency: true });

  return (
    <SimpleKpiCard
      title="Auto-close watch"
      value={count}
      description={count > 0 ? `${count} requests · ${formattedFunds} at risk` : "0 at risk"}
      href="/app/requests?filter=closing-soon"
      icon="lucide:hourglass"
      sparkline={data?.sparkline}
      isLoading={isLoading}
      zeroMeaning="GOOD"
      zeroLabel="No requests closing soon"
    />
  );
}
