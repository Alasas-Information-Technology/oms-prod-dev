/**
 * Date, Timezone, and Deadline Formatting Utilities for Vendor Portal
 * Specification: docs/VENDOR-DOCUMENTS-UI.md §1.10, §1.12
 */

import { VendorOnboardingDeadline } from "@/src/types/vendor-documents";

const MONTHS_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/**
 * Formats ISO date to readable string (e.g., "1 Sep 2026")
 */
export function formatJoiningDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  try {
    const parts = dateStr.split("T")[0].split("-");
    if (parts.length === 3) {
      const day = parseInt(parts[2], 10);
      const monthIdx = parseInt(parts[1], 10) - 1;
      const year = parts[0];
      if (monthIdx >= 0 && monthIdx < 12) {
        return `${day} ${MONTHS_SHORT[monthIdx]} ${year}`;
      }
    }
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return `${d.getUTCDate()} ${MONTHS_SHORT[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
  } catch {
    return dateStr;
  }
}

/**
 * Formats a timestamp ensuring GST is ALWAYS spelled out as "Gulf Standard Time"
 * or "+04:00", never the bare abbreviation "GST" (§1.10).
 *
 * Example output: "24 Aug 2026, 08:15 Gulf Standard Time (+04:00)"
 */
export function formatAuditTimestamp(
  dateStr: string | Date | null | undefined,
  includeOffset: boolean = false
): string {
  if (!dateStr) return "—";
  try {
    const d = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
    if (isNaN(d.getTime())) return String(dateStr);

    const formattedDate = new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Dubai",
    }).format(d);

    const tzLabel = includeOffset ? "Gulf Standard Time (+04:00)" : "Gulf Standard Time";
    return `${formattedDate} ${tzLabel}`;
  } catch {
    return String(dateStr);
  }
}

/**
 * Formats deadline text and severity color tokens per §1.12
 * - Over 7 days: NORMAL (neutral muted)
 * - 3 to 7 days: WARNING (amber tone)
 * - Under 3 days: CRITICAL (red destructive, stating joining is at risk)
 */
export function getDeadlineVisuals(deadline: VendorOnboardingDeadline): {
  noticeText: string;
  badgeText: string;
  severityClass: string;
  isAtRisk: boolean;
} {
  const { joiningDate, daysRemaining, severity } = deadline;
  const formattedDate = formatJoiningDate(joiningDate);

  if (severity === "CRITICAL" || daysRemaining < 3) {
    return {
      noticeText: `Joining ${formattedDate} · ${daysRemaining} ${
        daysRemaining === 1 ? "day" : "days"
      } left · Joining date at risk`,
      badgeText: `${daysRemaining}d left · Critical`,
      severityClass: "text-danger-text font-semibold",
      isAtRisk: true,
    };
  }

  if (severity === "WARNING" || (daysRemaining >= 3 && daysRemaining <= 7)) {
    return {
      noticeText: `Joining ${formattedDate} · ${daysRemaining} days left to complete documents`,
      badgeText: `${daysRemaining}d left · Attention`,
      severityClass: "text-warning-text font-medium",
      isAtRisk: false,
    };
  }

  return {
    noticeText: `Joining ${formattedDate} · ${daysRemaining} days left to complete documents`,
    badgeText: `${daysRemaining}d left`,
    severityClass: "text-muted-foreground",
    isAtRisk: false,
  };
}
