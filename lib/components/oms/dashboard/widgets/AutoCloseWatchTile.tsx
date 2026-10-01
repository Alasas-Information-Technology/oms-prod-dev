"use client";

import React from "react";
import { WidgetProps } from "@/lib/dashboard/registry";
import { AutoCloseWatchData } from "@/types/dashboard";
import { HeroInsightCard } from "../HeroInsightCard";
import { formatAbbreviated } from "@/lib/money";

/**
 * Auto-close Watch — now renders as the Hero Insight Card (U1/I1)
 * for the Requestor dashboard.
 *
 * Reframes the data as: "AED X will be released back to your budget in N days
 * unless Y requests are approved."
 */
export function AutoCloseWatchTile({
  data,
  isLoading,
  error,
}: WidgetProps<AutoCloseWatchData>) {
  const count = data?.items ? data.items.length : 0;
  const fundsFils = data?.totalFundsAtRisk ?? 0;
  const formattedFunds = formatAbbreviated(fundsFils, { showCurrency: true });

  // Find the soonest closing date across all items
  const soonestDays = React.useMemo(() => {
    if (!data?.items || data.items.length === 0) return 0;
    return Math.min(...data.items.map((item) => item.daysRemaining));
  }, [data?.items]);

  // Loading shimmer state
  if (isLoading) {
    return (
      <div className="rounded-[20px] bg-muted/40 animate-pulse h-[152px]" />
    );
  }

  // Error state — fall back to a non-hero card
  if (error) {
    return (
      <div className="rounded-[20px] border border-destructive/30 bg-destructive/5 p-4 h-[152px] flex items-center justify-center text-xs text-destructive">
        Unable to load auto-close data
      </div>
    );
  }

  // Zero state — everything is healthy
  if (count === 0 || fundsFils === 0) {
    return (
      <HeroInsightCard
        value="All clear"
        sentence="No requests are at risk of auto-closing. Your budget is secure."
        tone="accent"
      />
    );
  }

  // Active state — reframe as the hero insight
  const sentence =
    count === 1
      ? `${formattedFunds} will be released back to your budget in ${soonestDays} day${soonestDays !== 1 ? "s" : ""} unless 1 request is approved.`
      : `${formattedFunds} will be released back to your budget in ${soonestDays} day${soonestDays !== 1 ? "s" : ""} unless ${count} requests are approved.`;

  return (
    <HeroInsightCard
      value={formattedFunds}
      sentence={sentence}
      tone="accent"
      trackProgress={count > 0 ? Math.min(1, soonestDays / 30) : undefined}
    />
  );
}
