"use client";

import * as React from "react";
import { formatAmount } from "@/lib/money";
import { cn } from "@/lib/utils";

export interface MoneyInputProps {
  id?: string;
  name?: string;
  value: number; // in minor units (fils: 1 AED = 100 fils)
  onChange: (fils: number) => void;
  max?: number; // max available in fils
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  ariaLabel?: string;
}

/**
 * Money-masked input per BUDGET-AMENDMENT-UI.md 1.4 & TASK 4:
 *  - Digits only, thousands separators, two decimals, prefixed AED
 *  - No native number spinner arrows
 *  - Strictly manipulates and emits integer minor units (fils)
 */
export function MoneyInput({
  id,
  name,
  value,
  onChange,
  max,
  disabled = false,
  placeholder = "0.00",
  className,
  ariaLabel,
}: MoneyInputProps) {
  const [isFocused, setIsFocused] = React.useState(false);
  const [displayValue, setDisplayValue] = React.useState<string>(() => {
    return value > 0 ? formatAmount(value) : "0.00";
  });

  // Synchronize internal display text when external value changes while not focused
  React.useEffect(() => {
    if (!isFocused) {
      setDisplayValue(value > 0 ? formatAmount(value) : "0.00");
    }
  }, [value, isFocused]);

  const exceedsMax = max !== undefined && value > max;

  const handleFocus = () => {
    setIsFocused(true);
    if (value === 0) {
      setDisplayValue("");
    } else {
      // Remove trailing .00 if whole number for easier typing, but keep if user had decimals
      const formatted = formatAmount(value);
      setDisplayValue(formatted.endsWith(".00") ? formatted.slice(0, -3) : formatted);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    setDisplayValue(value > 0 ? formatAmount(value) : "0.00");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawInput = e.target.value;

    // Filter to only digits and at most one decimal point
    const cleaned = rawInput.replace(/[^0-9.]/g, "");
    if (!cleaned) {
      setDisplayValue("");
      onChange(0);
      return;
    }

    // Split on first decimal point
    const parts = cleaned.split(".");
    let wholeDigits = parts[0] || "0";
    // Remove leading zeros unless it is just "0"
    if (wholeDigits.length > 1 && wholeDigits.startsWith("0")) {
      wholeDigits = wholeDigits.replace(/^0+/, "") || "0";
    }

    // Insert thousands commas into the whole number part
    const wholeFormatted = wholeDigits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    let newDisplay = wholeFormatted;
    let decimalPart = "";

    if (parts.length > 1) {
      // Allow up to 2 decimal digits
      decimalPart = parts[1].slice(0, 2);
      newDisplay = `${wholeFormatted}.${decimalPart}`;
    }

    setDisplayValue(newDisplay);

    // Compute minor units (fils) using BigInt math without literal syntax
    const wholeNum = BigInt(wholeDigits || "0");
    const centsNum = BigInt((decimalPart || "").padEnd(2, "0"));
    const totalFils = Number(wholeNum * BigInt(100) + centsNum);

    onChange(totalFils);
  };

  return (
    <div className={cn("relative flex items-center w-full max-w-[200px]", className)}>
      {/* Prefixed AED currency label */}
      <span
        aria-hidden="true"
        className="absolute left-2.5 text-[11px] font-bold text-muted-foreground select-none pointer-events-none"
      >
        AED
      </span>

      {/* Money-masked input without native spinner arrows */}
      <input
        type="text"
        inputMode="decimal"
        autoComplete="off"
        id={id}
        name={name}
        value={displayValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        disabled={disabled}
        placeholder={placeholder}
        aria-label={ariaLabel || "Allocation amount in AED"}
        className={cn(
          "w-full h-8 pl-10 pr-2.5 text-xs text-right font-semibold text-foreground bg-background rounded-md border border-border shadow-2xs transition-colors",
          "focus:outline-hidden focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary",
          exceedsMax && "border-destructive text-destructive focus-visible:ring-destructive focus-visible:border-destructive",
          disabled && "opacity-50 cursor-not-allowed bg-muted/40",
          // CSS rule suppressing native number spinner arrows
          "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        )}
      />
    </div>
  );
}
