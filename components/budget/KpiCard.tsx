import * as React from "react";
import { LucideIcon } from "lucide-react";
import { formatAmount, formatAbbreviated, MinorUnitInput, toBigIntFils } from "@/lib/money";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface KpiCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Icon component to display in the card header */
  icon: LucideIcon;
  /** Label describing the KPI metric */
  label: string;
  /** Amount in minor units (fils) */
  amount: MinorUnitInput;
  /** Optional comparative delta information against previous period */
  delta?: {
    valueFils?: MinorUnitInput;
    percent?: number | string;
    isPositive?: boolean;
    label?: string;
  };
  /** Whether this card represents the master Total figure (visually distinct) */
  isTotal?: boolean;
  /** Custom status beacon dot color */
  statusDotColor?: string;
  /** Currency abbreviation prefix (default "AED") */
  currency?: string;
}

/**
 * KpiCard Component — Executive summary card for Budget Control Center.
 *
 * Rules:
 * - Abbreviates amounts (e.g. "AED 24.80M").
 * - Displays exact value in hover tooltip.
 * - Tabular numbers with crisp typography.
 * - Total card is visually distinct from the 4 additive breakdown cards.
 */
export function KpiCard({
  icon: Icon,
  label,
  amount,
  delta,
  isTotal = false,
  statusDotColor,
  currency = "AED",
  className,
  ...props
}: KpiCardProps) {
  const filsBigInt = toBigIntFils(amount);
  const abbreviatedText = formatAbbreviated(filsBigInt, {
    currency,
    showCurrency: true,
  });
  const exactFormattedText = `${currency} ${formatAmount(filsBigInt)}`;

  return (
    <Card
      data-slot="budget-kpi-card"
      className={cn(
        "relative overflow-hidden p-5 rounded-xl border transition-all duration-200",
        isTotal
          ? "border-primary/20 bg-primary/5 shadow-none"
          : "border-border/40 bg-card shadow-none hover:shadow-sm",
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className={cn(
              "size-7 rounded-lg flex items-center justify-center shrink-0",
              isTotal
                ? "bg-primary/20 text-primary"
                : "bg-muted text-muted-foreground"
            )}
          >
            <Icon className="size-3.5" />
          </div>
          <span className="text-xs font-semibold text-muted-foreground truncate uppercase tracking-wider">
            {label}
          </span>
        </div>

        {statusDotColor && (
          <span
            className={cn("size-2.5 rounded-full shrink-0 shadow-2xs", statusDotColor)}
            aria-hidden="true"
          />
        )}
      </div>

      <div className="space-y-1">
        <div
          title={exactFormattedText}
          className={cn(
            "text-xl sm:text-2xl font-bold tracking-tight font-display tabular-nums cursor-help",
            isTotal ? "text-foreground font-extrabold" : "text-foreground"
          )}
        >
          {abbreviatedText}
        </div>

        {delta && (
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-mono">
            <span
              className={cn(
                "font-semibold",
                delta.isPositive
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-rose-600 dark:text-rose-400"
              )}
            >
              {delta.isPositive ? "+" : ""}
              {delta.percent !== undefined
                ? typeof delta.percent === "number"
                  ? `${delta.percent.toFixed(1)}%`
                  : delta.percent
                : delta.valueFils !== undefined
                ? formatAbbreviated(delta.valueFils, { showCurrency: true })
                : ""}
            </span>
            {delta.label && <span className="text-muted-foreground/80">{delta.label}</span>}
          </div>
        )}
      </div>
    </Card>
  );
}
