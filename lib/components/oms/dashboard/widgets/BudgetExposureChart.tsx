"use client";

import React, { useMemo } from "react";
import { WidgetShell } from "../WidgetShell";
import { WidgetProps } from "@/lib/dashboard/registry";
import { BudgetExposureData } from "@/types/dashboard";
import { DistributionBar, DistributionSegment } from "../DistributionBar";
import { Amount } from "@/components/budget/Amount";
import { formatAmount } from "@/lib/money";
import { DataTable, ColumnDef } from "@/components/shared/DataTable";

export function BudgetExposureChart({
  scope,
  data,
  isLoading,
  error,
  onRetry,
  updatedAt,
}: WidgetProps<BudgetExposureData>) {
  const periodLabel = data?.fiscalPeriod || "FY 2026";
  const currency = data?.currency || "AED";

  const totalFils = Number(data?.totalFils ?? 0);
  const availableFils = Number(data?.availableFils ?? 0);
  const reservedFils = Number(data?.reservedFils ?? 0);
  const lockedFils = Number(data?.lockedFils ?? 0);
  const consumedFils = Number(data?.consumedFils ?? 0);

  const safeTotal =
    totalFils > 0
      ? totalFils
      : reservedFils + lockedFils + consumedFils + availableFils || 1;

  const segments: DistributionSegment[] = useMemo(
    () => [
      {
        label: "Reserved",
        value: reservedFils,
        formatted: (
          <Amount
            value={reservedFils}
            abbreviate
            variant="inline"
            currency={currency}
          />
        ),
        percent: (reservedFils / safeTotal) * 100,
        subtext: "Funds reserved for active requisitions in pipeline",
        href: "/app/budget?filter=reserved",
      },
      {
        label: "Locked",
        value: lockedFils,
        formatted: (
          <Amount
            value={lockedFils}
            abbreviate
            variant="inline"
            currency={currency}
          />
        ),
        percent: (lockedFils / safeTotal) * 100,
        subtext: "Committed under contracted vendor agreements",
        href: "/app/budget?filter=locked",
      },
      {
        label: "Consumed",
        value: consumedFils,
        formatted: (
          <Amount
            value={consumedFils}
            abbreviate
            variant="inline"
            currency={currency}
          />
        ),
        percent: (consumedFils / safeTotal) * 100,
        subtext: "Invoiced & disbursed year-to-date",
        href: "/app/budget?filter=consumed",
      },
      {
        label: "Available",
        value: availableFils,
        formatted: (
          <Amount
            value={availableFils}
            abbreviate
            variant="inline"
            currency={currency}
          />
        ),
        percent: (availableFils / safeTotal) * 100,
        isResidual: true, // T4 Hatched fill for residual segment
        subtext: "Uncommitted balance available for new requisitions",
        href: "/app/budget?filter=available",
      },
    ],
    [reservedFils, lockedFils, consumedFils, availableFils, safeTotal, currency]
  );

  // Mobile Table Fallback Columns below 768px
  const tableColumns: ColumnDef<any>[] = [
    {
      key: "label",
      header: "Category",
      render: (_, row) => (
        <span className="font-medium text-foreground">{row.label}</span>
      ),
    },
    {
      key: "formatted",
      header: "Amount",
      render: (_, row) => (
        <span className="tabular-nums font-semibold text-foreground">
          {row.formatted}
        </span>
      ),
    },
    {
      key: "percent",
      header: "Share",
      render: (_, row) => (
        <span className="text-muted-foreground tabular-nums">
          {row.percent.toFixed(1)}%
        </span>
      ),
    },
  ];

  return (
    <WidgetShell
      title="Budget exposure"
      scopeLabel={scope?.label}
      updatedAt={updatedAt}
      href="/app/budget"
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      minHeight={215}
      headerActions={
        <span className="text-[12px] font-normal text-muted-foreground font-sans">
          {periodLabel}
        </span>
      }
    >
      {/* Screen Reader Accessible Summary */}
      <span className="sr-only">
        Budget exposure summary for {periodLabel}: Total {currency}{" "}
        {formatAmount(totalFils)}, Consumed: {currency}{" "}
        {formatAmount(consumedFils)}, Locked: {currency}{" "}
        {formatAmount(lockedFils)}, Reserved: {currency}{" "}
        {formatAmount(reservedFils)}, Available: {currency}{" "}
        {formatAmount(availableFils)}.
      </span>

      <div className="flex flex-col justify-between flex-1 w-full pt-1.5">
        {/* Mobile Table Fallback (< 768px) */}
        <div className="block md:hidden w-full">
          <DataTable
            data={segments}
            columns={tableColumns}
            keyField="label"
            compact
            hidePagination
          />
        </div>

        {/* Desktop Interactive DistributionBar (>= 768px) */}
        <div className="hidden md:flex flex-col justify-center flex-1 w-full py-1">
          <DistributionBar segments={segments} variant="detailed-legend" />
        </div>
      </div>
    </WidgetShell>
  );
}
