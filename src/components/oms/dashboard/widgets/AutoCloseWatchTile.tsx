"use client";

import React from "react";
import { Hourglass } from "lucide-react";
import { KpiTile } from "../KpiTile";
import { WidgetProps } from "@/src/lib/dashboard/registry";
import { AutoCloseWatchData } from "@/src/types/dashboard";
import { formatAbbreviated } from "@/lib/money";

export function AutoCloseWatchTile({
  scope,
  data,
  isLoading,
  error,
  onRetry,
}: WidgetProps<AutoCloseWatchData>) {
  const count = data?.items ? data.items.length : 0;
  const fundsFils = data?.totalFundsAtRisk ?? 0;
  const formattedFunds = formatAbbreviated(fundsFils, { showCurrency: true });

  const detailText = count > 0 ? `${formattedFunds} at risk` : "No requests at risk";

  return (
    <KpiTile
      title="Auto-close watch"
      scopeLabel={scope?.label}
      value={count}
      detail={detailText}
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
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
    />
  );
}
