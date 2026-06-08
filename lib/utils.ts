import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a number to a compact string representation (e.g. 2830000000 to 2.83B)
 */
export function formatCompactNumber(number: number): string {
  if (number === 0) return "0"

  const formatter = new Intl.NumberFormat("en-US", {
    notation: "compact",
    compactDisplay: "short",
    maximumFractionDigits: 2,
  })

  return formatter.format(number)
}
