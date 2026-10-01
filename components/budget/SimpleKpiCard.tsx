"use client";

import { KpiBarBehindNumber } from "@/components/oms/dashboard/charts/KpiBarBehindNumber";
import { Sparkline } from "@/components/oms/dashboard/charts/Sparkline";
import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/components/ui/utils";
import { formatCompactNumberParts } from "@/lib/utils";
import { Icon } from "@iconify/react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import * as React from "react";

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

  /** Optional sparkline / period trend data array */
  sparkline?: number[];
  /** Custom sparkline color override */
  sparklineColor?: string;
  /** Visual treatment: "bars" (bar-behind-number per U2, default) or "sparkline" (line) */
  visualTreatment?: "bars" | "sparkline";

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

  /** When true, renders text and icons in white (ideal for dark, gradient, or image backgrounds) */
  whiteText?: boolean;
  /** Alias for whiteText */
  lightText?: boolean;
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
      sparklineHex: "var(--danger-border, #B0432C)",
    };
  }
  if (colorProp?.includes("orange") || colorProp?.includes("amber")) {
    return {
      textColor: colorProp || "text-amber-600 dark:text-amber-400",
      bgColor: bgProp || "bg-amber-500/10 dark:bg-amber-500/15",
      borderColor: "border-amber-500/20",
      sparklineHex: "var(--warning-border, #B4791F)",
    };
  }
  if (colorProp?.includes("blue") || colorProp?.includes("sky")) {
    return {
      textColor: colorProp || "text-blue-600 dark:text-blue-400",
      bgColor: bgProp || "bg-blue-500/10 dark:bg-blue-500/15",
      borderColor: "border-blue-500/20",
      sparklineHex: "var(--accent-interactive, var(--primary))",
    };
  }
  if (colorProp?.includes("green") || colorProp?.includes("emerald")) {
    return {
      textColor: colorProp || "text-emerald-600 dark:text-emerald-400",
      bgColor: bgProp || "bg-emerald-500/10 dark:bg-emerald-500/15",
      borderColor: "border-emerald-500/20",
      sparklineHex: "var(--success-border, #3A8F6B)",
    };
  }
  if (colorProp?.includes("purple") || colorProp?.includes("violet")) {
    return {
      textColor: colorProp || "text-purple-600 dark:text-purple-400",
      bgColor: bgProp || "bg-purple-500/10 dark:bg-purple-500/15",
      borderColor: "border-purple-500/20",
      sparklineHex: "var(--accent-interactive, var(--primary))",
    };
  }

  // Automatic smart thematic mapping based on KPI title
  if (t.includes("security") || t.includes("failed") || t.includes("threat") || t.includes("incident") || t.includes("exception")) {
    return {
      textColor: "text-rose-600 dark:text-rose-400",
      bgColor: "bg-rose-500/10 dark:bg-rose-500/15",
      borderColor: "border-rose-500/20",
      sparklineHex: "var(--danger-border, #B0432C)",
    };
  }
  if (t.includes("action") || t.includes("approval") || t.includes("task") || t.includes("session")) {
    return {
      textColor: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-500/10 dark:bg-blue-500/15",
      borderColor: "border-blue-500/20",
      sparklineHex: "var(--accent-interactive, var(--primary))",
    };
  }
  if (t.includes("onboarding") || t.includes("active") || t.includes("complete") || t.includes("verified")) {
    return {
      textColor: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-500/10 dark:bg-emerald-500/15",
      borderColor: "border-emerald-500/20",
      sparklineHex: "var(--success-border, #3A8F6B)",
    };
  }
  if (t.includes("expir") || t.includes("watch") || t.includes("warn") || t.includes("lock") || t.includes("pending")) {
    return {
      textColor: "text-amber-600 dark:text-amber-400",
      bgColor: "bg-amber-500/10 dark:bg-amber-500/15",
      borderColor: "border-amber-500/20",
      sparklineHex: "var(--warning-border, #B4791F)",
    };
  }
  if (t.includes("candidate") || t.includes("interview") || t.includes("talent")) {
    return {
      textColor: "text-indigo-600 dark:text-indigo-400",
      bgColor: "bg-indigo-500/10 dark:bg-indigo-500/15",
      borderColor: "border-indigo-500/20",
      sparklineHex: "var(--accent-interactive, var(--primary))",
    };
  }
  if (t.includes("vendor") || t.includes("submission") || t.includes("contract")) {
    return {
      textColor: "text-teal-600 dark:text-teal-400",
      bgColor: "bg-teal-500/10 dark:bg-teal-500/15",
      borderColor: "border-teal-500/20",
      sparklineHex: "var(--info-border, var(--rasikh-teal, #23879C))",
    };
  }
  if (t.includes("elevated") || t.includes("account") || t.includes("privilege") || t.includes("integrity")) {
    return {
      textColor: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-500/10 dark:bg-purple-500/15",
      borderColor: "border-purple-500/20",
      sparklineHex: "var(--accent-interactive, var(--primary))",
    };
  }
  if (t.includes("integration") || t.includes("job") || t.includes("pipeline")) {
    return {
      textColor: "text-cyan-600 dark:text-cyan-400",
      bgColor: "bg-cyan-500/10 dark:bg-cyan-500/15",
      borderColor: "border-cyan-500/20",
      sparklineHex: "var(--info-border, var(--rasikh-teal, #23879C))",
    };
  }

  // Default Primary Theme
  return {
    textColor: "text-brand-teal dark:text-brand-teal", // or specific classes if needed, but let's stick to teal
    bgColor: "bg-brand-teal/10 dark:bg-brand-teal/15",
    borderColor: "border-brand-teal/20",
    sparklineHex: "var(--chart-1, var(--rasikh-teal, #23879C))",
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
  visualTreatment = "sparkline",
  delta,
  zeroMeaning,
  zeroLabel,
  whiteText = false,
  lightText = false,
}: GenericKpiCardProps) {
  // Support explicit prop or automatic detection via className
  const isWhite = Boolean(
    whiteText ||
    lightText ||
    className?.includes("text-white")
  );

  // Compute theme colors matching security dashboard aesthetic
  const theme = React.useMemo(() => getKpiTheme(title, color, bg), [title, color, bg]);

  // Prefix and numeral weight contrast
  const effectivePrefix = prefix !== undefined ? prefix : isCurrency ? "AED" : "";
  const numValue = Number(value);
  const { integer, fraction } = formatCompactNumberParts(numValue);

  const isZero = numValue === 0 || value === "0" || value === 0 || value === null || value === undefined;
  const hasSparkline = sparkline && sparkline.length > 0;
  const activeSparklineColor = sparklineColor || (isWhite ? "#ffffff" : theme.sparklineHex);

  const content = (
    <Card
      aria-busy={isLoading}
      className={cn(
        "relative rounded-lg p-5 flex flex-col justify-between overflow-hidden select-none",
        "bg-card/60 dark:bg-card/40 backdrop-blur-md shadow-sm border border-[var(--glass-border-light)] dark:border-[var(--glass-border-dark)]",
        isWhite
          ? "border-white/15 shadow-md before:absolute before:inset-x-0 before:top-0 before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent"
          : "before:absolute before:inset-x-0 before:top-0 before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-foreground/[0.08] before:to-transparent",
        className?.includes("bg-[url") && "bg-cover bg-center",
        href && "hover:border-primary/40 dark:hover:border-primary/40 cursor-pointer group",
        hasSparkline ? "h-[152px]" : "h-[124px]",
        className
      )}
    >
      {isLoading ? (
        <div className="flex flex-col justify-between h-full w-full">
          <div className="flex items-start justify-between">
            <Shimmer className={cn("h-3.5 w-24 mt-1", isWhite && "bg-white/20")} />
            {showIcon && <Shimmer className={cn("size-8 rounded-lg", isWhite && "bg-white/20")} />}
          </div>
          <Shimmer className={cn("h-8 w-28 my-auto", isWhite && "bg-white/20")} />
          <Shimmer className={cn("h-3 w-32 mb-1", isWhite && "bg-white/20")} />
          {hasSparkline && <Shimmer className={cn("h-6 w-full mt-1.5", isWhite && "bg-white/20")} />}
        </div>
      ) : (
        <div className="flex flex-col justify-between h-full w-full">
          {/* Top Row: Title and Security-Styled Icon Tile */}
          <div className="flex items-center justify-between gap-2">
            <span
              className={cn(
                "text-xs font-semibold truncate leading-snug",
                isWhite ? "text-white/90" : "text-muted-foreground"
              )}
            >
              {title}
            </span>
            {showIcon && icon && (
              <Icon
                icon={icon}
                className={cn(
                  "size-4 shrink-0",
                  isWhite ? "text-white/85" : "text-muted-foreground/70"
                )}
              />
            )}
          </div>

          {/* Middle Row: Main Numeral */}
          <div className="flex items-baseline gap-1 flex-1 mt-1 mb-0.5">
            {effectivePrefix && (
              <span
                className={cn(
                  "text-xs font-bold leading-none",
                  isWhite ? "text-white/80" : "text-muted-foreground"
                )}
              >
                {effectivePrefix}
              </span>
            )}
            <span className="tabular-nums leading-none flex items-baseline">
              <span
                className={cn(
                  "text-2xl sm:text-[28px] font-extrabold tracking-tight",
                  isWhite ? "text-white" : "text-foreground"
                )}
              >
                {integer}
              </span>
              {fraction && (
                <span
                  className={cn(
                    "text-2xl sm:text-[28px] font-normal tracking-tight",
                    isWhite ? "text-white/80" : "text-muted-foreground"
                  )}
                >
                  {fraction}
                </span>
              )}
              {suffix && (
                <span
                  className={cn(
                    "text-2xl sm:text-[28px] font-normal tracking-tight pl-1",
                    isWhite ? "text-white/80" : "text-muted-foreground"
                  )}
                >
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
                  <CheckCircle2
                    className={cn(
                      "size-3.5 shrink-0",
                      isWhite ? "text-emerald-300" : "text-emerald-600 dark:text-emerald-400"
                    )}
                  />
                )}
                {zeroMeaning === "NEEDS_ACTION" && (
                  <AlertCircle
                    className={cn(
                      "size-3.5 shrink-0",
                      isWhite ? "text-amber-300" : "text-amber-600 dark:text-amber-400"
                    )}
                  />
                )}
                <span
                  className={cn(
                    "truncate",
                    zeroMeaning === "NEEDS_ACTION"
                      ? isWhite
                        ? "text-amber-200 font-semibold"
                        : "text-amber-600 dark:text-amber-400 font-semibold"
                      : isWhite
                        ? "text-white/80"
                        : "text-muted-foreground"
                  )}
                >
                  {zeroLabel || (zeroMeaning === "NO_DATA" ? "Nothing recorded yet" : "No items")}
                </span>
              </div>
            ) : delta ? (
              <div
                className={cn(
                  "flex items-center gap-1 text-xs font-medium leading-none",
                  isWhite ? "text-white/80" : "text-muted-foreground"
                )}
              >
                <span className="truncate">
                  {delta.label || "vs last month"}
                </span>
                <span
                  className={cn(
                    "inline-flex items-center tabular-nums font-semibold shrink-0",
                    (delta.direction === "up" && delta.increaseIsGood) ||
                      (delta.direction === "down" && !delta.increaseIsGood)
                      ? isWhite
                        ? "text-emerald-300"
                        : "text-emerald-600 dark:text-emerald-400"
                      : isWhite
                        ? "text-rose-300"
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
                  <p
                    className={cn(
                      "text-xs font-medium truncate cursor-help leading-none",
                      isWhite ? "text-white/80" : "text-muted-foreground"
                    )}
                  >
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

          {/* Visual Trend: Bar-behind-number (U2 default) or Sparkline */}
          {hasSparkline && (
            <div
              className={cn(
                "mt-1.5 pt-1.5 -mx-2 -mb-2 border-t overflow-visible",
                isWhite ? "border-white/15" : "border-border/40"
              )}
            >
              {visualTreatment === "sparkline" ? (
                <Sparkline
                  data={sparkline}
                  height={28}
                  color={activeSparklineColor}
                />
              ) : (
                <KpiBarBehindNumber
                  data={sparkline}
                  height={32}
                  color={activeSparklineColor}
                  accessibilitySummary={`Trend bars for ${title}`}
                />
              )}
            </div>
          )}
        </div>
      )}
    </Card>
  );

  if (href) {
    return (
      <Link href={href} className="block h-full group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg">
        {content}
      </Link>
    );
  }

  return content;
}
