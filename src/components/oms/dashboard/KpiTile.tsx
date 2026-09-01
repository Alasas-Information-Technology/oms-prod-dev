"use client";

import React from "react";
import { SimpleKpiCard } from "@/components/budget";

export type KpiTone = "default" | "amber" | "destructive" | "emerald" | "indigo" | "blue" | "purple" | "teal";
export type ZeroMeaning = "GOOD" | "NEEDS_ACTION" | "NO_DATA";

export interface KpiTileProps {
  title: string;
  scopeLabel?: string;
  updatedAt?: string;
  value: number | bigint | string | null | undefined;
  label?: string;
  href: string;
  icon?: any;
  tone?: KpiTone;
  isLoading?: boolean;
  error?: Error | string | null;
  onRetry?: () => void;
  className?: string;

  badge?: {
    text: string;
    tone?: "neutral" | "amber" | "destructive" | "emerald";
  } | null;

  delta?: {
    value: number;
    direction: "up" | "down";
    increaseIsGood: boolean;
    comparisonLabel?: string;
  };

  sparklineData?: any[];
  sparklineKey?: string;

  zeroMeaning?: ZeroMeaning;
  zeroMessage?: string;
  zeroActionLabel?: string;
}

const TONE_MAP: Record<string, { color: string; bg: string; icon: string }> = {
  blue: { color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/30", icon: "mdi:inbox-arrow-down" },
  indigo: { color: "text-indigo-600", bg: "bg-indigo-100 dark:bg-indigo-900/30", icon: "mdi:progress-clock" },
  purple: { color: "text-purple-600", bg: "bg-purple-100 dark:bg-purple-900/30", icon: "mdi:account-plus-outline" },
  amber: { color: "text-amber-600", bg: "bg-amber-100 dark:bg-amber-900/30", icon: "mdi:file-alert-outline" },
  destructive: { color: "text-red-600", bg: "bg-red-100 dark:bg-red-900/30", icon: "mdi:alert-octagon-outline" },
  emerald: { color: "text-emerald-600", bg: "bg-emerald-100 dark:bg-emerald-900/30", icon: "mdi:check-circle-outline" },
  teal: { color: "text-teal-600", bg: "bg-teal-100 dark:bg-teal-900/30", icon: "mdi:account-search-outline" },
  default: { color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/30", icon: "mdi:chart-box-outline" },
};

/**
 * KpiTile — Uses SimpleKpiCard from the Security Dashboard for visual uniformity.
 */
export function KpiTile({
  title,
  value,
  href,
  badge,
  delta,
  tone = "default",
  zeroMeaning,
  zeroMessage,
  isLoading,
  className,
}: KpiTileProps) {
  const numValue =
    typeof value === "number"
      ? value
      : typeof value === "bigint"
      ? Number(value)
      : Number(value || 0);

  const isZero =
    value === 0 ||
    value === "0" ||
    value === null ||
    value === undefined ||
    (!isNaN(numValue) && numValue === 0);

  let description: string | undefined = undefined;
  if (isZero && zeroMeaning) {
    description = zeroMessage || "No active items";
  } else if (delta) {
    description = `${delta.comparisonLabel || "vs last month"} ${delta.direction === "up" ? "+" : "-"}${delta.value}%`;
  } else if (badge?.text) {
    description = badge.text;
  }

  const toneConfig = TONE_MAP[tone] || TONE_MAP.default;

  return (
    <SimpleKpiCard
      title={title}
      value={numValue}
      description={description}
      icon={toneConfig.icon}
      color={toneConfig.color}
      bg={toneConfig.bg}
      href={href}
      isLoading={isLoading}
      className={className}
    />
  );
}

export const KpiCard = KpiTile;
