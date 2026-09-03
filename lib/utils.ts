import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a number to a compact string representation (e.g. 2830000000 to 2.83B)
 */
export function formatCompactNumber(number: number | string | bigint): string {
  if (typeof number === "string" && isNaN(Number(number))) {
    return number;
  }
  const num = typeof number === "bigint" ? Number(number) : typeof number === "string" ? Number(number) : number;
  if (isNaN(num) || num === 0) return "0";

  const formatter = new Intl.NumberFormat("en-US", {
    notation: "compact",
    compactDisplay: "short",
    maximumFractionDigits: 2,
  });

  return formatter.format(num);
}

/**
 * Formats a number into its integer and fractional/compact parts for distinct styling
 */
export function formatCompactNumberParts(number: number | string | bigint): { integer: string; fraction: string } {
  if (typeof number === "string" && isNaN(Number(number))) {
    return { integer: number, fraction: "" };
  }
  const num = typeof number === "bigint" ? Number(number) : typeof number === "string" ? Number(number) : number;
  if (isNaN(num) || num === 0) return { integer: "0", fraction: "" };

  const formatter = new Intl.NumberFormat("en-US", {
    notation: "compact",
    compactDisplay: "short",
    maximumFractionDigits: 2,
  });

  const parts = formatter.formatToParts(num);
  let integer = "";
  let fraction = "";

  for (const part of parts) {
    if (part.type === "integer" || part.type === "group" || part.type === "minusSign") {
      integer += part.value;
    } else {
      fraction += part.value;
    }
  }

  return { integer, fraction };
}
