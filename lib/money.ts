/**
 * Money & Minor Units Formatting Library
 *
 * CRITICAL ARCHITECTURAL RULES (Part 4 of BUDGET-CONTROL-CENTER-UI.md):
 * 1. Store and transport minor units as integers (fils). 1 AED = 100 fils.
 * 2. Never use floating point arithmetic anywhere in this file. All conversions,
 *    remainders, rounding, and percentage ratios are computed strictly using BigInt.
 * 3. formatAmount(value) -> "3,200,000.00" — two decimals ALWAYS, never trimmed.
 * 4. formatAbbreviated(value) -> "AED 24.80M" — for KPI cards only.
 * 5. formatPercent(numerator, denominator) -> one decimal, "21.8%".
 * 6. Zero renders as "0.00", never a dash.
 * 7. Negative numbers render with a leading minus sign, never parentheses.
 */

export type MinorUnitInput = number | bigint | string;

const B_ZERO = BigInt(0);
const B_ONE = BigInt(1);
const B_FIVE = BigInt(5);
const B_TEN = BigInt(10);
const B_HUNDRED = BigInt(100);
const B_THOUSAND = BigInt(1000);
const B_TEN_THOUSAND = BigInt(10000);
const B_ONE_THOUSAND_FILS = BigInt(100000); // 1,000 AED = 100,000 fils
const B_FIVE_HUNDRED_FILS = BigInt(500);
const B_ONE_MILLION_FILS = BigInt(100000000); // 1,000,000 AED = 100,000,000 fils
const B_FIVE_HUNDRED_THOUSAND_FILS = BigInt(500000);
const B_ONE_MILLION_SCALE = BigInt(1000000);
const B_ONE_BILLION_FILS = BigInt("100000000000"); // 1,000,000,000 AED
const B_FIVE_HUNDRED_MILLION_FILS = BigInt("500000000");
const B_ONE_BILLION_SCALE = BigInt("1000000000");

/**
 * Coerces various input representations safely into BigInt fils.
 * Rejects floats or non-integer numbers by rounding to closest integer fils.
 */
export function toBigIntFils(value: MinorUnitInput): bigint {
  if (typeof value === "bigint") return value;
  if (typeof value === "number") {
    if (Number.isNaN(value) || !Number.isFinite(value)) return B_ZERO;
    return BigInt(Math.trunc(value));
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed || trimmed === "-") return B_ZERO;
    try {
      return BigInt(trimmed);
    } catch {
      return B_ZERO;
    }
  }
  return B_ZERO;
}

/**
 * Formats an integer amount of fils into exact currency format with two decimal places.
 * Example: 320000000 -> "3,200,000.00"
 * Example: 0 -> "0.00"
 * Example: -50000000 -> "-500,000.00"
 */
export function formatAmount(value: MinorUnitInput): string {
  const filsBigInt = toBigIntFils(value);
  const isNegative = filsBigInt < B_ZERO;
  const absFils = isNegative ? -filsBigInt : filsBigInt;

  const dirhams = absFils / B_HUNDRED;
  const filsRemainder = absFils % B_HUNDRED;

  // Insert thousands commas into the dirhams portion using pure string regex
  const dirhamsFormatted = dirhams
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  const filsFormatted = filsRemainder.toString().padStart(2, "0");

  return `${isNegative ? "-" : ""}${dirhamsFormatted}.${filsFormatted}`;
}

export interface AbbreviateOptions {
  currency?: string;
  showCurrency?: boolean;
}

/**
 * Formats an integer amount of fils into an abbreviated string for KPI cards.
 * Uses integer math with round-half-up.
 * Example: 2480000000 -> "AED 24.80M"
 * Example: 1020000000 -> "AED 10.20M"
 * Example: 62000000   -> "AED 620.00k"
 */
export function formatAbbreviated(
  value: MinorUnitInput,
  options?: AbbreviateOptions
): string {
  const { currency = "AED", showCurrency = true } = options || {};
  const filsBigInt = toBigIntFils(value);
  const isNegative = filsBigInt < B_ZERO;
  const absFils = isNegative ? -filsBigInt : filsBigInt;

  const prefix = isNegative ? "-" : "";
  const currencyPrefix = showCurrency ? `${currency} ` : "";

  if (absFils >= B_ONE_BILLION_FILS) {
    // Round to 2 decimal places in Billions: scale = 1,000,000,000 fils per 0.01B
    const scaled = (absFils + B_FIVE_HUNDRED_MILLION_FILS) / B_ONE_BILLION_SCALE;
    const whole = scaled / B_HUNDRED;
    const decimals = (scaled % B_HUNDRED).toString().padStart(2, "0");
    return `${prefix}${currencyPrefix}${whole}.${decimals}B`;
  }

  if (absFils >= B_ONE_MILLION_FILS) {
    // Round to 2 decimal places in Millions: scale = 1,000,000 fils per 0.01M
    const scaled = (absFils + B_FIVE_HUNDRED_THOUSAND_FILS) / B_ONE_MILLION_SCALE;
    const whole = scaled / B_HUNDRED;
    const decimals = (scaled % B_HUNDRED).toString().padStart(2, "0");
    return `${prefix}${currencyPrefix}${whole}.${decimals}M`;
  }

  if (absFils >= B_ONE_THOUSAND_FILS) {
    // Round to 2 decimal places in Thousands: scale = 1,000 fils per 0.01k
    const scaled = (absFils + B_FIVE_HUNDRED_FILS) / B_THOUSAND;
    const whole = scaled / B_HUNDRED;
    const decimals = (scaled % B_HUNDRED).toString().padStart(2, "0");
    return `${prefix}${currencyPrefix}${whole}.${decimals}k`;
  }

  // Under 1k AED: Render exact amount
  return `${prefix}${currencyPrefix}${formatAmount(absFils)}`;
}

/**
 * Formats a ratio of two integer fils amounts into a percentage with one decimal place.
 * Computed entirely with BigInt integer division and round-half-up.
 * Example: 540000000 / 2480000000 -> "21.8%"
 * Example: 710000000 / 2480000000 -> "28.6%"
 * Example: 210000000 / 2480000000 -> "8.5%"
 * Example: 1020000000 / 2480000000 -> "41.1%"
 */
export function formatPercent(
  numerator: MinorUnitInput,
  denominator: MinorUnitInput
): string {
  const numBigInt = toBigIntFils(numerator);
  const denBigInt = toBigIntFils(denominator);

  if (denBigInt === B_ZERO) return "0.0%";

  const isNegative =
    (numBigInt < B_ZERO && denBigInt > B_ZERO) ||
    (numBigInt > B_ZERO && denBigInt < B_ZERO);
  const absNum = numBigInt < B_ZERO ? -numBigInt : numBigInt;
  const absDen = denBigInt < B_ZERO ? -denBigInt : denBigInt;

  // Multiply numerator by 10,000 to obtain tenths of a percent * 10
  const scaledTenths = (absNum * B_TEN_THOUSAND) / absDen;
  const roundedTenths = (scaledTenths + B_FIVE) / B_TEN;

  const whole = roundedTenths / B_TEN;
  const decimal = roundedTenths % B_TEN;

  return `${isNegative ? "-" : ""}${whole}.${decimal}%`;
}

/**
 * Formats a direct percentage number/integer tenths into standard "XX.X%" string.
 */
export function formatPercentValue(percent: number | string): string {
  if (typeof percent === "string") {
    const parsed = Number.parseFloat(percent);
    if (Number.isNaN(parsed)) return "0.0%";
    return `${parsed.toFixed(1)}%`;
  }
  if (Number.isNaN(percent) || !Number.isFinite(percent)) return "0.0%";
  return `${percent.toFixed(1)}%`;
}

/**
 * Reconciles the four fund states against total budget allocation.
 * Returns exact discrepancy in fils if the sum is not equal to total.
 */
export function reconcileFundStates(
  totalFils: MinorUnitInput,
  availableFils: MinorUnitInput,
  reservedFils: MinorUnitInput,
  lockedFils: MinorUnitInput,
  consumedFils: MinorUnitInput
): {
  isReconciled: boolean;
  total: bigint;
  sum: bigint;
  discrepancyFils: bigint;
} {
  const total = toBigIntFils(totalFils);
  const available = toBigIntFils(availableFils);
  const reserved = toBigIntFils(reservedFils);
  const locked = toBigIntFils(lockedFils);
  const consumed = toBigIntFils(consumedFils);

  const sum = available + reserved + locked + consumed;
  const discrepancyFils = total - sum;

  return {
    isReconciled: discrepancyFils === B_ZERO,
    total,
    sum,
    discrepancyFils,
  };
}
