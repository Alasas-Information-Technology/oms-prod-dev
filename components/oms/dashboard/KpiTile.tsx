"use client";

import React from "react";
import { SimpleKpiCard, GenericKpiCardProps } from "@/components/budget/SimpleKpiCard";

export type KpiTone = "default" | "amber" | "destructive" | "emerald" | "indigo" | "blue" | "purple" | "teal";
export type ZeroMeaning = "GOOD" | "NEEDS_ACTION" | "NO_DATA";

export interface KpiTileProps {
  title: string;
  scopeLabel?: string;
  updatedAt?: string;
  value: number | bigint | string | null | undefined;
  label?: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }> | string;
  isCurrency?: boolean;
  currency?: string;
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
    label?: string;
  };

  sparklineData?: number[] | Array<{ value: number; [key: string]: any }>;
  sparklineKey?: string;
  sparklineColor?: string;

  zeroMeaning?: ZeroMeaning;
  zeroMessage?: string;
  zeroLabel?: string;
  zeroActionLabel?: string;
}

/**
 * KpiTile is now a backward-compatibility wrapper around the upgraded SimpleKpiCard.
 */
export function KpiTile({
  title,
  label,
  value,
  href,
  badge,
  delta,
  icon,
  isCurrency,
  prefix,
  suffix,
  zeroMeaning,
  zeroMessage,
  zeroLabel,
  sparklineData,
  isLoading,
  className,
}: KpiTileProps & { prefix?: string; suffix?: string }) {
  const displayTitle = label || title;

  const sparklineNumbers = React.useMemo(() => {
    if (!sparklineData || sparklineData.length === 0) return undefined;
    return sparklineData.map((item) => (typeof item === "number" ? item : (item as any)?.value ?? 0));
  }, [sparklineData]);

  const iconString = typeof icon === "string" ? icon : undefined;

  return (
    <SimpleKpiCard
      title={displayTitle}
      value={value ?? 0}
      href={href}
      isCurrency={isCurrency}
      prefix={prefix}
      suffix={suffix}
      icon={iconString}
      showIcon={!!iconString}
      description={badge?.text}
      delta={
        delta
          ? {
              value: delta.value,
              direction: delta.direction,
              increaseIsGood: delta.increaseIsGood,
              label: delta.label || delta.comparisonLabel,
            }
          : undefined
      }
      sparkline={sparklineNumbers}
      zeroMeaning={zeroMeaning}
      zeroLabel={zeroLabel || zeroMessage}
      isLoading={isLoading}
      className={className}
    />
  );
}

export const KpiCard = KpiTile;

