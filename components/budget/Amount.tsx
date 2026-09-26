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
  /** Font size for display variant (default "xl" = 30px) */
  size?: "sm" | "md" | "lg" | "xl";
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
 * - variant="display": muted currency, bold integer, muted decimals with T2 weight contrast.
 */
export function Amount({
  value,
  variant = "inline",
  size = "xl",
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

    const sizeClasses = {
      sm: {
        currency: "text-[10px] font-normal text-muted-foreground mr-1",
        integer: "text-xs font-bold text-foreground",
        decimal: "text-[11px] font-normal text-muted-foreground",
      },
      md: {
        currency: "text-[11px] font-normal text-muted-foreground mr-1",
        integer: "text-sm font-bold text-foreground",
        decimal: "text-xs font-normal text-muted-foreground",
      },
      lg: {
        currency: "text-xs font-normal text-muted-foreground mr-1",
        integer: "text-lg font-bold text-foreground",
        decimal: "text-sm font-normal text-muted-foreground",
      },
      xl: {
        currency: "text-[12px] font-normal text-muted-foreground mr-1",
        integer: "text-[30px] font-semibold text-foreground tracking-tight",
        decimal: "text-[30px] font-normal text-muted-foreground",
      },
    }[size];

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
          <span className={sizeClasses.currency}>
            {parts.currency}
          </span>
        )}
        <span className={sizeClasses.integer}>
          {parts.integer}
        </span>
        <span className={sizeClasses.decimal}>
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
