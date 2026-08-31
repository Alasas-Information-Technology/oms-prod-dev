"use client";

import React from "react";
import { WidgetShell } from "../WidgetShell";
import { WidgetProps } from "@/src/lib/dashboard/registry";
import { BudgetExposureData } from "@/src/types/dashboard";
import { FundStateBar } from "@/components/budget/FundStateBar";
import { formatAmount } from "@/lib/money";

export function BudgetExposureChart({
  scope,
  data,
  isLoading,
  error,
  onRetry,
}: WidgetProps<BudgetExposureData>) {
  const periodLabel = data?.fiscalPeriod || "FY 2026";
  const currency = data?.currency || "AED";

  const totalFils = data?.totalFils ?? 0;
  const availableFils = data?.availableFils ?? 0;
  const reservedFils = data?.reservedFils ?? 0;
  const lockedFils = data?.lockedFils ?? 0;
  const consumedFils = data?.consumedFils ?? 0;

  return (
    <WidgetShell
      title="Budget exposure"
      scopeLabel={scope?.label}
      href="/app/budget"
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      minHeight={260}
      headerActions={
        <span className="text-xs font-semibold text-muted-foreground bg-muted/60 px-2 py-0.5 rounded border border-border/40">
          {periodLabel}
        </span>
      }
    >
      {/* Screen Reader Accessible Summary */}
      <span className="sr-only">
        Budget exposure summary for {periodLabel}: Total {currency} {formatAmount(totalFils)}, Consumed: {currency} {formatAmount(consumedFils)}, Locked: {currency} {formatAmount(lockedFils)}, Reserved: {currency} {formatAmount(reservedFils)}, Available: {currency} {formatAmount(availableFils)}.
      </span>

      <div className="flex flex-col justify-center flex-1 w-full">
        <FundStateBar
          totalFils={totalFils}
          availableFils={availableFils}
          reservedFils={reservedFils}
          lockedFils={lockedFils}
          consumedFils={consumedFils}
          currency={currency}
          className="py-1 space-y-3"
        />
      </div>
    </WidgetShell>
  );
}
