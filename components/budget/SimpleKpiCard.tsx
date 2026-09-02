"use client";

import * as React from "react";
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
  
  /** Optional sparkline data array */
  sparkline?: number[];
  /** Custom sparkline color override */
  sparklineColor?: string;
  
  /** Comparison and Delta */
  delta?: {
    value: number;
    direction: "up" | "down";
    increaseIsGood: boolean;
    label?: string;
  };
  
  /** Zero states */
  zeroMeaning?: ZeroMeaning;
  zeroLabel?: string;
};

// Preset palette mapping for varying sparkline & badge colors based on domain/title
function getKpiTheme(title: string, colorProp?: string, bgProp?: string) {
  const t = title.toLowerCase();

  // If explicit Tailwind color and bg are provided (e.g. from security dashboard), map to hex
  if (colorProp?.includes("red") || colorProp?.includes("rose")) {
    return {
      textColor: colorProp || "text-rose-600 dark:text-rose-400",
      bgColor: bgProp || "bg-rose-500/10 dark:bg-rose-500/15",
      borderColor: "border-rose-500/20",
      sparklineHex: "#F43F5E", // Rose 500
    };
  }
  if (colorProp?.includes("orange") || colorProp?.includes("amber")) {
    return {
      textColor: colorProp || "text-amber-600 dark:text-amber-400",
      bgColor: bgProp || "bg-amber-500/10 dark:bg-amber-500/15",
      borderColor: "border-amber-500/20",
      sparklineHex: "#F59E0B", // Amber 500
    };
  }
  if (colorProp?.includes("blue") || colorProp?.includes("sky")) {
    return {
      textColor: colorProp || "text-blue-600 dark:text-blue-400",
      bgColor: bgProp || "bg-blue-500/10 dark:bg-blue-500/15",
      borderColor: "border-blue-500/20",
      sparklineHex: "#3B82F6", // Blue 500
    };
  }
  if (colorProp?.includes("green") || colorProp?.includes("emerald")) {
    return {
      textColor: colorProp || "text-emerald-600 dark:text-emerald-400",
      bgColor: bgProp || "bg-emerald-500/10 dark:bg-emerald-500/15",
      borderColor: "border-emerald-500/20",
      sparklineHex: "#10B981", // Emerald 500
    };
  }
  if (colorProp?.includes("purple") || colorProp?.includes("violet")) {
    return {
      textColor: colorProp || "text-purple-600 dark:text-purple-400",
      bgColor: bgProp || "bg-purple-500/10 dark:bg-purple-500/15",
      borderColor: "border-purple-500/20",
      sparklineHex: "#8B5CF6", // Purple 500
    };
  }

  // Automatic smart thematic mapping based on KPI title
  if (t.includes("security") || t.includes("failed") || t.includes("threat") || t.includes("incident") || t.includes("exception")) {
    return {
      textColor: "text-rose-600 dark:text-rose-400",
      bgColor: "bg-rose-500/10 dark:bg-rose-500/15",
      borderColor: "border-rose-500/20",
      sparklineHex: "#F43F5E", // Vibrant Rose
    };
  }
  if (t.includes("action") || t.includes("approval") || t.includes("task") || t.includes("session")) {
    return {
      textColor: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-500/10 dark:bg-blue-500/15",
      borderColor: "border-blue-500/20",
      sparklineHex: "#3B82F6", // Vibrant Blue
    };
  }
  if (t.includes("onboarding") || t.includes("active") || t.includes("complete") || t.includes("verified")) {
    return {
      textColor: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-500/10 dark:bg-emerald-500/15",
      borderColor: "border-emerald-500/20",
      sparklineHex: "#10B981", // Vibrant Emerald
    };
  }
  if (t.includes("expir") || t.includes("watch") || t.includes("warn") || t.includes("lock") || t.includes("pending")) {
    return {
      textColor: "text-amber-600 dark:text-amber-400",
      bgColor: "bg-amber-500/10 dark:bg-amber-500/15",
      borderColor: "border-amber-500/20",
      sparklineHex: "#F59E0B", // Vibrant Amber
    };
  }
  if (t.includes("candidate") || t.includes("interview") || t.includes("talent")) {
    return {
      textColor: "text-indigo-600 dark:text-indigo-400",
      bgColor: "bg-indigo-500/10 dark:bg-indigo-500/15",
      borderColor: "border-indigo-500/20",
      sparklineHex: "#6366F1", // Vibrant Indigo
    };
  }
  if (t.includes("vendor") || t.includes("submission") || t.includes("contract")) {
    return {
      textColor: "text-teal-600 dark:text-teal-400",
      bgColor: "bg-teal-500/10 dark:bg-teal-500/15",
      borderColor: "border-teal-500/20",
      sparklineHex: "#0D9488", // Vibrant Teal
    };
  }
  if (t.includes("elevated") || t.includes("account") || t.includes("privilege") || t.includes("integrity")) {
    return {
      textColor: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-500/10 dark:bg-purple-500/15",
      borderColor: "border-purple-500/20",
      sparklineHex: "#8B5CF6", // Vibrant Purple
    };
  }
  if (t.includes("integration") || t.includes("job") || t.includes("pipeline")) {
    return {
      textColor: "text-cyan-600 dark:text-cyan-400",
      bgColor: "bg-cyan-500/10 dark:bg-cyan-500/15",
      borderColor: "border-cyan-500/20",
      sparklineHex: "#06B6D4", // Vibrant Cyan
    };
  }

  // Default Primary Theme
  return {
    textColor: "text-primary",
    bgColor: "bg-primary/10 dark:bg-primary/15",
    borderColor: "border-primary/20",
    sparklineHex: "var(--primary)",
  };
}

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
  sparklineColor,
  delta,
  zeroMeaning,
  zeroLabel,
}: GenericKpiCardProps) {
  // Compute theme colors matching security dashboard aesthetic
  const theme = React.useMemo(() => getKpiTheme(title, color, bg), [title, color, bg]);

  // Prefix and numeral weight contrast
  const effectivePrefix = prefix !== undefined ? prefix : isCurrency ? "AED" : "";
  const numValue = Number(value);
  const { integer, fraction } = formatCompactNumberParts(numValue);
  
  const isZero = numValue === 0 || value === "0" || value === 0 || value === null || value === undefined;
  const hasSparkline = sparkline && sparkline.length > 0;
  const activeSparklineColor = sparklineColor || theme.sparklineHex;

  const content = (
    <Card
      aria-busy={isLoading}
      className={cn(
        "relative rounded-xl p-4 flex flex-col justify-between shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden select-none",
        "border border-border/70 dark:border-white/[0.08] bg-card/95 dark:bg-card/70 backdrop-blur-xs",
        "before:absolute before:inset-x-0 before:top-0 before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-foreground/[0.08] before:to-transparent",
        href && "hover:border-primary/40 dark:hover:border-primary/40 cursor-pointer group",
        hasSparkline ? "h-[152px]" : "h-[124px]",
        className
      )}
    >
      {isLoading ? (
        <div className="flex flex-col justify-between h-full w-full">
          <div className="flex items-start justify-between">
            <Shimmer className="h-3.5 w-24 mt-1" />
            {showIcon && <Shimmer className="size-8 rounded-xl" />}
          </div>
          <Shimmer className="h-8 w-28 my-auto" />
          <Shimmer className="h-3 w-32 mb-1" />
          {hasSparkline && <Shimmer className="h-6 w-full mt-1.5" />}
        </div>
      ) : (
        <div className="flex flex-col justify-between h-full w-full">
          {/* Top Row: Title and Security-Styled Icon Tile */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-muted-foreground truncate leading-snug">
              {title}
            </span>
            {showIcon && icon && (
              <div
                className={cn(
                  "size-8 rounded-xl flex items-center justify-center shrink-0 border transition-transform duration-200 group-hover:scale-105",
                  theme.bgColor,
                  theme.textColor,
                  theme.borderColor
                )}
              >
                <Icon icon={icon} className="size-4" />
              </div>
            )}
          </div>

          {/* Middle Row: Main Numeral */}
          <div className="flex items-baseline gap-1 flex-1 mt-1 mb-0.5">
            {effectivePrefix && (
              <span className="text-xs font-bold text-muted-foreground leading-none">
                {effectivePrefix}
              </span>
            )}
            <span className="tabular-nums leading-none flex items-baseline">
              <span className="text-2xl sm:text-[28px] font-extrabold text-foreground tracking-tight">
                {integer}
              </span>
              {fraction && (
                <span className="text-2xl sm:text-[28px] font-normal text-muted-foreground tracking-tight">
                  {fraction}
                </span>
              )}
              {suffix && (
                <span className="text-2xl sm:text-[28px] font-normal text-muted-foreground tracking-tight pl-1">
                  {suffix}
                </span>
              )}
            </span>
          </div>

          {/* Bottom Row: Delta, Zero State, or Description */}
          <div className="flex items-center justify-between mt-auto">
            {isZero && zeroMeaning ? (
              <div className="flex items-center gap-1.5 text-xs font-medium leading-none">
                {zeroMeaning === "GOOD" && (
                  <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                )}
                {zeroMeaning === "NEEDS_ACTION" && (
                  <AlertCircle className="size-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
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
              <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground leading-none">
                <span className="truncate">
                  {delta.label || "vs last month"}
                </span>
                <span
                  className={cn(
                    "inline-flex items-center tabular-nums font-semibold shrink-0",
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
                  <p className="text-xs font-medium text-muted-foreground truncate cursor-help leading-none">
                    {description}
                  </p>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">{description}</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              <span className="text-xs opacity-0 leading-none">-</span>
            )}
          </div>

          {/* Sparkline (Rendered with the unique, varying color of the card) */}
          {hasSparkline && (
            <div className="mt-1.5 pt-1.5 -mx-2 -mb-2 border-t border-border/40">
              <Sparkline
                data={sparkline}
                height={28}
                color={activeSparklineColor}
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
