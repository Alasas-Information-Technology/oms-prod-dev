"use client";

import React from "react";
import Link from "next/link";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { Amount } from "@/components/budget/Amount";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export interface KpiMetricColumn {
  id: string;
  label: string;
  value: number | bigint | string | null | undefined;
  href: string;
  isCurrency?: boolean;
  abbreviateCurrency?: boolean;
  currency?: string;
  /** Delta comparison */
  delta?: {
    value: number;
    direction: "up" | "down";
    increaseIsGood: boolean;
    comparisonLabel?: string; // default "vs last month"
  };
  /** Status badge / text if no delta */
  statusText?: string;
  /** Zero-state handling (Task 3) */
  zeroMeaning?: "GOOD" | "NEEDS_ACTION" | "NO_DATA";
  zeroMessage?: string;
  isLoading?: boolean;
  error?: Error | string | null;
}

export interface KpiRowProps {
  metrics: KpiMetricColumn[];
  className?: string;
}

/**
 * KpiRow Component per T1, T2, T10:
 * ONE card containing all Band A metrics as equal-width columns separated by hairline dividers.
 * No icons, no circular tinted backgrounds, full-surface link targets.
 */
export function KpiRow({ metrics, className }: KpiRowProps) {
  if (!metrics || metrics.length === 0) return null;

  return (
    <div
      className={cn(
        "w-full rounded-xl border border-border/60 bg-card p-5 select-none transition-colors",
        className
      )}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-0 relative">
        {metrics.map((metric, idx) => {
          const numValue =
            typeof metric.value === "number"
              ? metric.value
              : typeof metric.value === "bigint"
              ? Number(metric.value)
              : Number(metric.value || 0);

          const isZero =
            metric.value === 0 ||
            metric.value === "0" ||
            metric.value === null ||
            metric.value === undefined ||
            (!isNaN(numValue) && numValue === 0);

          const isLast = idx === metrics.length - 1;

          return (
            <div
              key={metric.id || idx}
              className={cn(
                "flex flex-col justify-between relative",
                // Horizontal divider on tablet & mobile
                idx > 0 && "pt-4 md:pt-0 border-t md:border-t-0 border-foreground/8",
                // Vertical divider with 20px inset on desktop
                !isLast && "lg:border-r lg:border-foreground/8",
                // Padding per column
                "lg:px-5 first:lg:pl-0 last:lg:pr-0"
              )}
            >
              {metric.isLoading ? (
                <div className="flex flex-col justify-between h-full py-1 space-y-2">
                  <Skeleton className="h-3.5 w-24" />
                  <Skeleton className="h-8 w-28" />
                  <Skeleton className="h-3.5 w-20" />
                </div>
              ) : (
                <Link
                  href={metric.href}
                  className="group flex flex-col justify-between h-full p-2.5 rounded-lg hover:bg-foreground/[0.03] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {/* 1. Top: Label 12px --text-muted */}
                  <span className="text-[12px] font-medium text-muted-foreground truncate leading-normal group-hover:text-foreground transition-colors">
                    {metric.label}
                  </span>

                  {/* 2. Middle: Value using Numeral Weight Contrast (T2) */}
                  <div className="my-1.5 flex items-baseline leading-none">
                    {metric.isCurrency ? (
                      <Amount
                        value={metric.value || 0}
                        variant="display"
                        abbreviate={metric.abbreviateCurrency ?? true}
                        currency={metric.currency || "AED"}
                      />
                    ) : (
                      <span className="font-mono tabular-nums leading-none">
                        <span className="text-[30px] font-semibold text-foreground tracking-tight">
                          {isZero ? "0" : typeof metric.value === "number" ? metric.value.toLocaleString() : metric.value}
                        </span>
                      </span>
                    )}
                  </div>

                  {/* 3. Bottom: Comparison line / Zero State / Delta (T1, T3) */}
                  <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground leading-normal truncate">
                    {isZero && metric.zeroMeaning ? (
                      // Zero State per Task 3
                      <div className="flex items-center gap-1.5">
                        {metric.zeroMeaning === "GOOD" && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600/80 dark:text-emerald-400/80 shrink-0" />
                        )}
                        {metric.zeroMeaning === "NEEDS_ACTION" && (
                          <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                        )}
                        <span
                          className={cn(
                            "truncate",
                            metric.zeroMeaning === "NEEDS_ACTION"
                              ? "text-amber-600/90 dark:text-amber-400/90"
                              : "text-muted-foreground"
                          )}
                        >
                          {metric.zeroMessage || "No items"}
                        </span>
                      </div>
                    ) : metric.delta ? (
                      // Comparison line: "vs last month ↗3%"
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground">
                          {metric.delta.comparisonLabel || "vs last month"}
                        </span>
                        <span
                          className={cn(
                            "inline-flex items-center font-mono tabular-nums font-semibold ml-0.5",
                            (metric.delta.direction === "up" && metric.delta.increaseIsGood) ||
                              (metric.delta.direction === "down" && !metric.delta.increaseIsGood)
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-rose-600 dark:text-rose-400"
                          )}
                        >
                          {metric.delta.direction === "up" ? "↗" : "↘"}
                          {Math.abs(metric.delta.value)}%
                        </span>
                      </div>
                    ) : metric.statusText ? (
                      <span className="truncate text-muted-foreground">
                        {metric.statusText}
                      </span>
                    ) : (
                      <span className="opacity-0 select-none">-</span>
                    )}
                  </div>
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
