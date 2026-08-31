import * as React from "react";
import {
  formatAmount,
  formatAbbreviated,
  formatAmountParts,
  formatAbbreviatedParts,
  MinorUnitInput,
  toBigIntFils,
} from "@/lib/money";
import { cn } from "@/lib/utils";

export interface AmountProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Amount in minor units (fils) */
  value: MinorUnitInput;
  /** Visual presentation variant per T2 */
  variant?: "display" | "table" | "inline";
  /** Whether to abbreviate (e.g. "AED 24.80M") */
  abbreviate?: boolean;
  /** Currency code (default "AED") */
  currency?: string;
  /** Whether to show the currency prefix */
  showCurrency?: boolean;
  /** Whether to style negative values in red */
  colorizeNegative?: boolean;
}

/**
 * Amount Component — Renders monetary values with tabular-nums and T2 numeral weight contrast.
 *
 * Rules:
 * - Always receives integer fils.
 * - Tabular numbers with decimal alignment.
 * - variant="display": 12px muted currency, 30px/600 bold integer, 30px/400 muted decimal.
 */
export function Amount({
  value,
  variant = "inline",
  abbreviate = false,
  currency = "AED",
  showCurrency = true,
  colorizeNegative = true,
  className,
  ...props
}: AmountProps) {
  const filsBigInt = toBigIntFils(value);
  const isNegative = filsBigInt < BigInt(0);

  const exactFormatted = formatAmount(filsBigInt);
  const exactWithCurrency = `${currency} ${exactFormatted}`;

  // T2: Display Variant with Numeral Weight Contrast
  if (variant === "display") {
    const parts = abbreviate
      ? formatAbbreviatedParts(filsBigInt, { currency, showCurrency })
      : formatAmountParts(filsBigInt, { currency, showCurrency });

    return (
      <span
        data-slot="amount-display"
        title={exactWithCurrency}
        className={cn(
          "inline-flex items-baseline font-sans tabular-nums select-all leading-none",
          colorizeNegative && isNegative && "text-rose-600 dark:text-rose-400",
          className
        )}
        {...props}
      >
        {parts.currency && (
          <span className="text-[12px] font-normal text-muted-foreground mr-1">
            {parts.currency}
          </span>
        )}
        <span className="text-[30px] font-semibold text-foreground tracking-tight">
          {parts.integer}
        </span>
        <span className="text-[30px] font-normal text-muted-foreground">
          {parts.decimalOrSuffix}
        </span>
      </span>
    );
  }

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
        "font-sans tabular-nums select-all inline-block",
        variant === "table" ? "text-sm text-right" : "",
        colorizeNegative && isNegative && "text-rose-600 dark:text-rose-400 font-medium",
        className
      )}
      {...props}
    >
      {displayString}
    </span>
  );
}
