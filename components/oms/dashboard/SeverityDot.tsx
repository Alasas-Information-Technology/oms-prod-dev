import React from "react";
import { cn } from "@/lib/utils";

export type SeverityLevel =
  | "CRITICAL"
  | "critical"
  | "HIGH"
  | "high"
  | "MEDIUM"
  | "medium"
  | "LOW"
  | "low"
  | "NEUTRAL"
  | "neutral";

export interface SeverityDotProps extends React.HTMLAttributes<HTMLSpanElement> {
  severity: SeverityLevel;
  className?: string;
  label?: string;
}

/**
 * J2 / Task 3 — Shared SeverityDot Primitive
 *
 * Rules:
 * - 8px filled circle (w-2 h-2 rounded-full).
 * - Exactly three allowed colours: danger, warning, and neutral semantic tokens.
 *   - CRITICAL / HIGH: var(--danger-border)
 *   - MEDIUM: var(--warning-border)
 *   - LOW / NEUTRAL: var(--muted-foreground)
 * - Never a fourth colour, never a custom hex.
 * - Accessible via role="status" and aria-label.
 */
export function SeverityDot({
  severity,
  className,
  label,
  ...props
}: SeverityDotProps) {
  const norm = (severity || "").toUpperCase();

  let colorClass = "bg-[var(--muted-foreground)]";
  let defaultLabel = "Neutral";

  if (norm === "CRITICAL" || norm === "HIGH") {
    colorClass = "bg-[var(--danger-border)]";
    defaultLabel = norm === "CRITICAL" ? "Critical" : "High";
  } else if (norm === "MEDIUM") {
    colorClass = "bg-[var(--warning-border)]";
    defaultLabel = "Medium";
  } else if (norm === "LOW" || norm === "NEUTRAL") {
    colorClass = "bg-[var(--muted-foreground)]";
    defaultLabel = "Low";
  }

  const effectiveLabel = label || defaultLabel;

  return (
    <span
      role="status"
      aria-label={effectiveLabel}
      title={effectiveLabel}
      className={cn(
        "inline-block size-2 rounded-full shrink-0", // 8px circle
        colorClass,
        className
      )}
      {...props}
    />
  );
}
