"use client";

import React from "react";
import { Hourglass } from "lucide-react";
import { KpiTile } from "../KpiTile";
import { WidgetProps } from "@/lib/dashboard/registry";
import { AutoCloseWatchData } from "@/types/dashboard";
import { formatAbbreviated } from "@/lib/money";

export function AutoCloseWatchTile({
  scope,
  data,
  isLoading,
  error,
  onRetry,
  updatedAt,
}: WidgetProps<AutoCloseWatchData>) {
  const count = data?.items ? data.items.length : 0;
  const fundsFils = data?.totalFundsAtRisk ?? 0;
  const formattedFunds = formatAbbreviated(fundsFils, { showCurrency: true });

  return (
    <KpiTile
      title="Auto-close watch"
      scopeLabel={scope?.label}
      value={count}
      badge={
        count > 0
          ? {
              text: `${count} requests · ${formattedFunds} at risk`,
              tone: "amber",
            }
          : {
              text: "0 at risk",
              tone: "neutral",
            }
      }
      href="/app/requests?filter=closing-soon"
      icon={Hourglass}
      tone={count > 0 ? "amber" : "default"}
      sparklineData={data?.sparkline}
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      updatedAt={updatedAt}
      zeroMeaning="GOOD"
      zeroMessage="No requests closing soon"
    />
  );
}
