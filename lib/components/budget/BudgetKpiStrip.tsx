"use client";

import * as React from "react";
import { Wallet, Coins, Layers, Lock, Building2 } from "lucide-react";
import { KpiCard } from "./KpiCard";
import { Skeleton } from "@/components/ui/skeleton";
import { IBudgetSummaryDto } from "@/lib/types/budget.types";
import { cn } from "@/lib/utils";

export interface BudgetKpiStripProps {
  summary?: IBudgetSummaryDto;
  isLoading?: boolean;
  className?: string;
}

/**
 * BudgetKpiStrip Component — Renders the 5 headline executive summary cards.
 *
 * Rules (Part 3 & Part 4 of BUDGET-CONTROL-CENTER-UI.md):
 * 1. Total Budget is visually distinct with primary gradient styling.
 * 2. Four additive fund state cards sum exactly to the total.
 * 3. All amounts abbreviated (e.g. "AED 24.80M") with exact hover tooltips.
 * 4. Displays skeleton placeholders during data loading.
 */
export function BudgetKpiStrip({
  summary,
  isLoading = false,
  className,
}: BudgetKpiStripProps) {
  if (isLoading || !summary) {
    return (
      <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4", className)}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="p-4 rounded-md border border-border/60 bg-card/60 space-y-3 shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24 rounded-md" />
              <Skeleton className="size-6 rounded-lg" />
            </div>
            <Skeleton className="h-7 w-32 rounded-lg" />
            <Skeleton className="h-3.5 w-20 rounded-md" />
          </div>
        ))}
      </div>
    );
  }

  const deltaPercent = summary.deltaAgainstPreviousPeriod?.totalDeltaPercent;

  return (
    <div
      data-slot="budget-kpi-strip"
      className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4", className)}
    >
      {/* 1. Master Total Budget Card (Visually Distinct) */}
      <KpiCard
        icon={Wallet}
        label="Total Budget"
        amount={summary.totalFils}
        isTotal={true}
        currency={summary.currency || "AED"}
        delta={
          deltaPercent !== undefined
            ? {
                percent: deltaPercent,
                isPositive: deltaPercent >= 0,
                label: "vs FY25",
              }
            : undefined
        }
      />

      {/* 2. Available Funds Card */}
      <KpiCard
        icon={Coins}
        label="Available"
        amount={summary.availableFils}
        statusDotColor="bg-emerald-500"
        currency={summary.currency || "AED"}
        delta={{
          percent: `${summary.breakdown?.availablePercent ?? 41.1}%`,
          isPositive: true,
          label: "share",
        }}
      />

      {/* 3. Reserved Funds Card */}
      <KpiCard
        icon={Layers}
        label="Reserved"
        amount={summary.reservedFils}
        statusDotColor="bg-amber-500"
        currency={summary.currency || "AED"}
        delta={{
          percent: `${summary.breakdown?.reservedPercent ?? 21.8}%`,
          isPositive: true,
          label: "share",
        }}
      />

      {/* 4. Locked & Allocated Funds Card */}
      <KpiCard
        icon={Lock}
        label="Locked & Allocated"
        amount={summary.lockedFils}
        statusDotColor="bg-indigo-500"
        currency={summary.currency || "AED"}
        delta={{
          percent: `${summary.breakdown?.lockedPercent ?? 28.6}%`,
          isPositive: true,
          label: "share",
        }}
      />

      {/* 5. Consumed Funds Card */}
      <KpiCard
        icon={Building2}
        label="Consumed"
        amount={summary.consumedFils}
        statusDotColor="bg-zinc-500"
        currency={summary.currency || "AED"}
        delta={{
          percent: `${summary.breakdown?.consumedPercent ?? 8.5}%`,
          isPositive: false,
          label: "share",
        }}
      />
    </div>
  );
}
