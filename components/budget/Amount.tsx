import * as React from "react";
import { formatAmount, formatAbbreviated, MinorUnitInput, toBigIntFils } from "@/lib/money";
import { cn } from "@/lib/utils";

export interface AmountProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Amount in minor units (fils) */
  value: MinorUnitInput;
  /** Whether to abbreviate (e.g. "AED 24.80M") for KPI cards */
  abbreviate?: boolean;
  /** Currency code (default "AED") */
  currency?: string;
  /** Whether to show the currency prefix */
  showCurrency?: boolean;
  /** Whether to style negative values in red */
  colorizeNegative?: boolean;
}

/**
 * Amount Component — Renders monetary values with tabular-nums.
 *
 * Rules:
 * - Always receives integer fils.
 * - Tabular numbers with decimal alignment.
 * - When abbreviated, sets full exact amount in `title` for hover inspection.
 */
export function Amount({
  value,
  abbreviate = false,
  currency = "AED",
  showCurrency = false,
  colorizeNegative = true,
  className,
  ...props
}: AmountProps) {
  const filsBigInt = toBigIntFils(value);
  const isNegative = filsBigInt < BigInt(0);

  const exactFormatted = formatAmount(filsBigInt);
  const exactWithCurrency = `${currency} ${exactFormatted}`;

  const displayString = abbreviate
    ? formatAbbreviated(filsBigInt, { currency, showCurrency })
    : showCurrency
    ? exactWithCurrency
    : exactFormatted;

  return (
    <span
      data-slot="amount"
      title={abbreviate ? exactWithCurrency : undefined}
      className={cn(
        "font-mono tabular-nums text-right select-all inline-block",
        colorizeNegative && isNegative && "text-rose-600 dark:text-rose-400 font-medium",
        className
      )}
      {...props}
    >
      {displayString}
    </span>
  );
}
