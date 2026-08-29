import assert from "node:assert/strict";
import {
  formatAmount,
  formatAbbreviated,
  formatPercent,
  formatPercentValue,
  reconcileFundStates,
  toBigIntFils,
} from "../money";

console.log("Running lib/money.ts unit test suite...");

// 1. toBigIntFils
assert.equal(toBigIntFils(0), BigInt(0));
assert.equal(toBigIntFils(100), BigInt(100));
assert.equal(toBigIntFils(-500), BigInt(-500));
assert.equal(toBigIntFils("2480000000"), BigInt("2480000000"));
assert.equal(toBigIntFils(""), BigInt(0));
assert.equal(toBigIntFils("-"), BigInt(0));
assert.equal(toBigIntFils(Number.NaN), BigInt(0));

// 2. formatAmount
// Zero must render "0.00", never a dash
assert.equal(formatAmount(0), "0.00");
assert.equal(formatAmount(BigInt(0)), "0.00");
assert.equal(formatAmount("0"), "0.00");

// Small amounts
assert.equal(formatAmount(1), "0.01");
assert.equal(formatAmount(9), "0.09");
assert.equal(formatAmount(10), "0.10");
assert.equal(formatAmount(99), "0.99");
assert.equal(formatAmount(100), "1.00");
assert.equal(formatAmount(105), "1.05");

// Typical currency values
assert.equal(formatAmount(320000000), "3,200,000.00");
assert.equal(formatAmount(BigInt("2480000000")), "24,800,000.00");
assert.equal(formatAmount(62000000), "620,000.00");

// Negative amounts (leading minus, never parentheses)
assert.equal(formatAmount(-50000000), "-500,000.00");
assert.equal(formatAmount(-1), "-0.01");
assert.equal(formatAmount(-100), "-1.00");

// Very large numbers
assert.equal(formatAmount(BigInt("99999999999999")), "999,999,999,999.99");

// 3. formatAbbreviated
// Millions (2 decimals)
assert.equal(formatAbbreviated(BigInt("2480000000")), "AED 24.80M");
assert.equal(formatAbbreviated(BigInt("1020000000")), "AED 10.20M");
assert.equal(formatAbbreviated(BigInt("540000000")), "AED 5.40M");
assert.equal(formatAbbreviated(BigInt("710000000")), "AED 7.10M");
assert.equal(formatAbbreviated(BigInt("210000000")), "AED 2.10M");

// Thousands
assert.equal(formatAbbreviated(BigInt("62000000")), "AED 620.00k");
assert.equal(formatAbbreviated(BigInt("34000000")), "AED 340.00k");

// Billions
assert.equal(formatAbbreviated(BigInt("150000000000")), "AED 1.50B");

// Currency prefix options
assert.equal(
  formatAbbreviated(BigInt("2480000000"), { showCurrency: false }),
  "24.80M"
);
assert.equal(
  formatAbbreviated(BigInt("-540000000"), { showCurrency: false }),
  "-5.40M"
);

// 4. formatPercent
// Ratio computations matching the reference figures exactly
// 5.40M / 24.80M = 21.774% -> 21.8%
assert.equal(formatPercent(BigInt("540000000"), BigInt("2480000000")), "21.8%");
// 7.10M / 24.80M = 28.629% -> 28.6%
assert.equal(formatPercent(BigInt("710000000"), BigInt("2480000000")), "28.6%");
// 2.10M / 24.80M = 8.467% -> 8.5%
assert.equal(formatPercent(BigInt("210000000"), BigInt("2480000000")), "8.5%");
// 10.20M / 24.80M = 41.129% -> 41.1%
assert.equal(formatPercent(BigInt("1020000000"), BigInt("2480000000")), "41.1%");

// Edge cases for percentages
assert.equal(formatPercent(0, 1000), "0.0%");
assert.equal(formatPercent(1000, 0), "0.0%");
assert.equal(formatPercent(1000, 1000), "100.0%");
assert.equal(formatPercent(1, 10000), "0.0%");
assert.equal(formatPercent(5, 10000), "0.1%");

// formatPercentValue
assert.equal(formatPercentValue(21.8), "21.8%");
assert.equal(formatPercentValue("7.8"), "7.8%");

// 5. reconcileFundStates
const reconciled = reconcileFundStates(
  BigInt("2480000000"),
  BigInt("1020000000"),
  BigInt("540000000"),
  BigInt("710000000"),
  BigInt("210000000")
);
assert.equal(reconciled.isReconciled, true);
assert.equal(reconciled.discrepancyFils, BigInt(0));

const mismatched = reconcileFundStates(
  BigInt("2480000000"),
  BigInt("1000000000"), // 20M short
  BigInt("540000000"),
  BigInt("710000000"),
  BigInt("210000000")
);
assert.equal(mismatched.isReconciled, false);
assert.equal(mismatched.discrepancyFils, BigInt("20000000"));

console.log("All unit tests passed successfully!");
