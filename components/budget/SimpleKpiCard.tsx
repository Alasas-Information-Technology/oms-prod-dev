"use client";

import { Icon } from "@iconify/react";
import { formatCompactNumberParts } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/components/ui/utils";
import { Card } from "@/components/ui/card";
import { Sparkline } from "@/components/oms/dashboard/charts/Sparkline";
import Link from "next/link";
import { CheckCircle2, AlertCircle } from "lucide-react";

export type ZeroMeaning = "GOOD" | "NEEDS_ACTION" | "NO_DATA";

export type GenericKpiCardProps = {
  icon?: string;
  value: number | string | bigint;
  title: string;
  description?: string;
  color?: string;
  bg?: string;
  className?: string;
  /** Whether the value represents a monetary currency amount (default: false) */
  isCurrency?: boolean;
  /** Optional custom prefix (e.g. "AED", "$", "+") */
  prefix?: string;
  /** Optional custom suffix (e.g. "%", "users") */
  suffix?: string;
  /** Optional link navigation target */
  href?: string;
  /** Optional external loading state */
  isLoading?: boolean;
  /** Whether to show the icon (default: true) */
  showIcon?: boolean;
  
  /** M2: Optional sparkline data array */
  sparkline?: number[];
  
  /** M1: Comparison and Delta */
  delta?: {
    value: number;
    direction: "up" | "down";
    increaseIsGood: boolean;
    label?: string;
  };
  
  /** M4: Zero states */
  zeroMeaning?: ZeroMeaning;
  zeroLabel?: string;
};

function Shimmer({ className }: { className?: string }) {
  return (
    <div
      className={cn("rounded-md animate-shine motion-reduce:animate-none", className)}
      style={{
        backgroundImage:
          "linear-gradient(90deg, var(--muted) 25%, color-mix(in oklch, var(--foreground) 8%, var(--muted)) 50%, var(--muted) 75%)",
        backgroundSize: "200% 100%",
      }}
    />
  );
}

export function SimpleKpiCard({
  icon,
  value,
  title,
  description,
  color,
  bg,
  className,
  isCurrency = false,
  prefix,
  suffix,
  href,
  isLoading = false,
  showIcon = true,
  sparkline,
  delta,
  zeroMeaning,
  zeroLabel,
}: GenericKpiCardProps) {
  // M3: Prefix and numeral weight contrast
  const effectivePrefix = prefix !== undefined ? prefix : isCurrency ? "AED" : "";
  const numValue = Number(value);
  const { integer, fraction } = formatCompactNumberParts(numValue);
  
  const isZero = numValue === 0 || value === "0" || value === 0 || value === null || value === undefined;
  const hasSparkline = sparkline && sparkline.length > 0;

  const content = (
    <Card
      aria-busy={isLoading}
      className={cn(
        "relative rounded-xl p-3.5 sm:p-4 flex flex-col justify-between shadow-2xs hover:shadow-xs transition-all duration-200 overflow-hidden select-none",
        "border-[0.5px] border-solid border-border/40 dark:border-white/[0.07] bg-card/95 dark:bg-card/70 backdrop-blur-xs",
        "before:absolute before:inset-x-0 before:top-0 before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-foreground/[0.06] before:to-transparent",
        href && "hover:border-primary/40 dark:hover:border-primary/40 cursor-pointer",
        hasSparkline ? "h-[148px]" : "h-[120px]",
        className
      )}
    >
      {isLoading ? (
        <div className="flex flex-col justify-between h-full w-full">
          <div className="flex items-start justify-between">
            <Shimmer className="h-3 w-20 mt-1" />
            {showIcon && <Shimmer className="h-4 w-4" />}
          </div>
          <Shimmer className="h-7 w-28 my-auto" />
          <Shimmer className="h-3 w-32 mb-1" />
          {hasSparkline && <Shimmer className="h-6 w-full mt-1.5" />}
        </div>
      ) : (
        <div className="flex flex-col justify-between h-full w-full">
          {/* Top Row: Title and Icon */}
          <div className="flex items-start justify-between">
            <span className="text-[11.5px] font-medium text-muted-foreground truncate pr-2 leading-none font-sans">
              {title}
            </span>
            {showIcon && icon && (
              <div className="w-5 h-5 rounded-md flex items-center justify-center bg-foreground/[0.04] text-muted-foreground shrink-0">
                <Icon icon={icon} className="h-3.5 w-3.5" />
              </div>
            )}
          </div>

          {/* Middle Row: M3 Numeral weight contrast */}
          <div className="flex items-baseline gap-1 flex-1 mt-1.5 mb-0.5">
            {effectivePrefix && (
              <span className="text-[11.5px] font-medium text-muted-foreground leading-none">
                {effectivePrefix}
              </span>
            )}
            <span className="font-display tabular-nums leading-none">
              <span className="text-[28px] sm:text-[30px] font-semibold text-foreground tracking-tight">{integer}</span>
              {fraction && (
                <span className="text-[28px] sm:text-[30px] font-normal text-muted-foreground tracking-tight">{fraction}</span>
              )}
              {suffix && (
                <span className="text-[28px] sm:text-[30px] font-normal text-muted-foreground tracking-tight pl-1">{suffix}</span>
              )}
            </span>
          </div>

          {/* Bottom Row: M1 Delta, M4 Zero State, or Description */}
          <div className="flex items-center justify-between mt-auto">
            {isZero && zeroMeaning ? (
              <div className="flex items-center gap-1.5 text-[11px] font-medium leading-none">
                {zeroMeaning === "GOOD" && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                )}
                {zeroMeaning === "NEEDS_ACTION" && (
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                )}
                <span
                  className={cn(
                    "truncate",
                    zeroMeaning === "NEEDS_ACTION"
                      ? "text-amber-600 dark:text-amber-400 font-semibold"
                      : "text-muted-foreground"
                  )}
                >
                  {zeroLabel || (zeroMeaning === "NO_DATA" ? "Nothing recorded yet" : "No items")}
                </span>
              </div>
            ) : delta ? (
              <div className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground leading-none">
                <span className="truncate">
                  {delta.label || "vs last month"}
                </span>
                <span
                  className={cn(
                    "inline-flex items-center font-mono tabular-nums font-semibold shrink-0",
                    (delta.direction === "up" && delta.increaseIsGood) ||
                      (delta.direction === "down" && !delta.increaseIsGood)
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-rose-600 dark:text-rose-400"
                  )}
                >
                  {delta.direction === "up" ? "↗" : "↘"}
                  {Math.abs(delta.value)}%
                </span>
              </div>
            ) : description ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <p className="text-[11px] font-medium text-muted-foreground truncate cursor-help leading-none">
                    {description}
                  </p>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-[11px]">{description}</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              <span className="text-[11px] opacity-0 leading-none">-</span>
            )}
          </div>

          
          {/* M2: Sparkline (if present, card height grows to 148px) */}
          {hasSparkline && (
            <div className="mt-1 pt-1 -mx-2 -mb-2 border-t border-border/30">
              <Sparkline
                data={sparkline}
                height={28}
                color={color || "var(--primary)"}
              />
            </div>
          )}
        </div>
      )}
    </Card>
  );

  if (href) {
    return (
      <Link href={href} className="block h-full group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl">
        {content}
      </Link>
    );
  }

  return content;
}
