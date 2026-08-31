"use client";

import React from "react";
import Link from "next/link";
import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { WidgetShell } from "./WidgetShell";

export type KpiTone = "default" | "amber" | "destructive" | "emerald" | "indigo";

export interface KpiTileProps {
  /** Widget title in header */
  title: string;
  /** Scope label on right of header */
  scopeLabel?: string;
  /** Value shown at 28px/600 tabular-nums */
  value: number | string;
  /** Optional secondary label / detail */
  label?: string;
  /** Optional badge text at bottom-left (e.g. "2 overdue", "Within 30 days") */
  badge?: {
    text: string;
    tone?: "neutral" | "amber" | "destructive" | "emerald";
  } | null;
  /** Destination link */
  href: string;
  /** 32px Icon component */
  icon: LucideIcon;
  /** Visual tone for icon square */
  tone?: KpiTone;
  /** Loading state */
  isLoading?: boolean;
  /** Error object or message */
  error?: Error | string | null;
  /** Retry callback */
  onRetry?: () => void;
  /** Extra detail text or money string next to value */
  detail?: string;
  className?: string;
}

const TONE_STYLES: Record<
  KpiTone,
  {
    iconBg: string;
    iconColor: string;
  }
> = {
  default: {
    iconBg: "bg-muted/80 text-foreground",
    iconColor: "text-foreground",
  },
  amber: {
    iconBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    iconColor: "text-amber-600 dark:text-amber-400",
  },
  destructive: {
    iconBg: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
    iconColor: "text-rose-600 dark:text-rose-400",
  },
  emerald: {
    iconBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
  indigo: {
    iconBg: "bg-primary/10 text-primary",
    iconColor: "text-primary",
  },
};

const BADGE_STYLES = {
  neutral:
    "bg-muted text-muted-foreground border-border/60",
  amber:
    "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 font-medium",
  destructive:
    "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30 font-medium",
  emerald:
    "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 font-medium",
};

export function KpiTile({
  title,
  scopeLabel,
  value,
  label,
  badge,
  href,
  icon: Icon,
  tone = "default",
  isLoading = false,
  error = null,
  onRetry,
  detail,
  className,
}: KpiTileProps) {
  const toneStyle = TONE_STYLES[tone] || TONE_STYLES.default;

  // Format value: render 0 as "0", never empty or dash
  const displayValue =
    value === undefined || value === null
      ? "0"
      : typeof value === "number"
      ? value.toLocaleString()
      : value;

  return (
    <WidgetShell
      title={title}
      scopeLabel={scopeLabel}
      href={href}
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      minHeight={140}
      className={cn("group transition-all duration-200 hover:border-primary/40", className)}
    >
      <Link
        href={href}
        className="flex flex-col justify-between flex-1 gap-2.5 focus-visible:outline-none"
      >
        {/* Top Row: 32px tinted icon square */}
        <div className="flex items-center justify-between">
          <div
            className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center transition-transform duration-200 group-hover:scale-105",
              toneStyle.iconBg
            )}
          >
            <Icon className="w-4 h-4" />
          </div>
          {label && (
            <span className="text-[13px] text-muted-foreground font-medium">
              {label}
            </span>
          )}
        </div>

        {/* Middle Row: Large Value + Optional Detail */}
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-[28px] font-semibold tracking-tight text-foreground tabular-nums leading-none">
            {displayValue}
          </span>
          {detail && (
            <span className="text-xs text-muted-foreground font-normal truncate">
              {detail}
            </span>
          )}
        </div>

        {/* Bottom Row: Optional Badge */}
        {badge ? (
          <div className="pt-1">
            <span
              className={cn(
                "inline-flex items-center px-2 py-0.5 rounded-md text-[11px] border leading-tight",
                BADGE_STYLES[badge.tone || "neutral"]
              )}
            >
              {badge.text}
            </span>
          </div>
        ) : (
          <div className="h-[21px]" />
        )}
      </Link>
    </WidgetShell>
  );
}
