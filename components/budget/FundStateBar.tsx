"use client";

import * as React from "react";
import { AlertTriangle, Info } from "lucide-react";
import {
  formatAmount,
  formatPercent,
  reconcileFundStates,
  MinorUnitInput,
  toBigIntFils,
} from "@/lib/money";
import { FundState } from "@/lib/types/budget.types";
import { FUND_STATE_CONFIG } from "./FundStateBadge";
import { Amount } from "./Amount";
import { cn } from "@/lib/utils";

export interface FundStateBarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Total allocated budget in minor units (fils) */
  totalFils: MinorUnitInput;
  /** Available uncommitted funds in minor units (fils) */
  availableFils: MinorUnitInput;
  /** Reserved funds pending approval in minor units (fils) */
  reservedFils: MinorUnitInput;
  /** Locked and allocated funds in minor units (fils) */
  lockedFils: MinorUnitInput;
  /** Consumed disbursed funds in minor units (fils) */
  consumedFils: MinorUnitInput;
  /** Currency abbreviation (default "AED") */
  currency?: string;
  /** Optional custom title or heading */
  title?: string;
  /** Layout of the legend beneath the bar. Defaults to horizontal grid. */
  legendLayout?: "horizontal" | "vertical";
}

interface SegmentItem {
  key: FundState;
  label: string;
  fils: bigint;
  percentString: string;
  percentValue: number;
  barColor: string;
  dotColor: string;
  textColor: string;
}

/**
 * FundStateBar Component — Stacked fund state visualization with interactive legend.
 *
 * Critical Invariants (Part 4 of BUDGET-CONTROL-CENTER-UI.md):
 * 1. If Available + Reserved + Locked + Consumed !== Total, renders an audit warning banner.
 * 2. Segments below ~8% show no inline label to prevent truncation/overlap.
 * 3. Hovering a segment highlights the corresponding legend item and vice-versa.
 * 4. Zero floating-point arithmetic used for reconciliation.
 */
export function FundStateBar({
  totalFils,
  availableFils,
  reservedFils,
  lockedFils,
  consumedFils,
  currency = "AED",
  title,
  legendLayout = "horizontal",
  className,
  ...props
}: FundStateBarProps) {
  const [hoveredState, setHoveredState] = React.useState<FundState | null>(null);

  const reconciliation = reconcileFundStates(
    totalFils,
    availableFils,
    reservedFils,
    lockedFils,
    consumedFils
  );

  const total = reconciliation.total;
  const isZeroTotal = total === BigInt(0);

  // Build segments array in standard ledger sequence
  const segments: SegmentItem[] = React.useMemo(() => {
    if (isZeroTotal) return [];

    const order: FundState[] = ["RESERVED", "LOCKED", "CONSUMED", "AVAILABLE"];

    return order.map((key) => {
      let fils = BigInt(0);
      if (key === "RESERVED") fils = toBigIntFils(reservedFils);
      else if (key === "LOCKED") fils = toBigIntFils(lockedFils);
      else if (key === "CONSUMED") fils = toBigIntFils(consumedFils);
      else if (key === "AVAILABLE") fils = toBigIntFils(availableFils);

      const percentString = formatPercent(fils, total);
      // Derive numeric percentage (0 - 100) for CSS flex/width calculation
      const scaledTenths = (fils * BigInt(10000)) / total;
      const percentValue = Number(scaledTenths) / 100;

      const config = FUND_STATE_CONFIG[key];

      return {
        key,
        label: config.label,
        fils,
        percentString,
        percentValue,
        barColor: config.barColor,
        dotColor: config.dotColor,
        textColor: config.textColor,
      };
    });
  }, [total, reservedFils, lockedFils, consumedFils, availableFils, isZeroTotal]);

  // CRITICAL: Sum-Mismatch Audit Warning Banner
  if (!reconciliation.isReconciled) {
    const formattedSum = `${currency} ${formatAmount(reconciliation.sum)}`;
    const formattedTotal = `${currency} ${formatAmount(reconciliation.total)}`;
    const formattedDiff = `${currency} ${formatAmount(reconciliation.discrepancyFils)}`;

    return (
      <div
        data-slot="fund-state-mismatch-warning"
        className={cn(
          "p-4 rounded-md border border-rose-300 bg-rose-50/90 dark:border-rose-900/60 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 shadow-xs space-y-2 animate-in fade-in-50",
          className
        )}
        {...props}
      >
        <div className="flex items-center gap-2 font-semibold text-sm">
          <AlertTriangle className="size-4 text-rose-600 dark:text-rose-400 shrink-0" />
          <span>Ledger Sum Discrepancy Detected</span>
        </div>
        <p className="text-xs text-rose-800 dark:text-rose-300 leading-relaxed">
          The sum of individual fund states (<strong>{formattedSum}</strong>) does not equal the
          total baseline budget (<strong>{formattedTotal}</strong>). Unreconciled variance:{" "}
          <span className="font-mono font-bold">{formattedDiff}</span>.
        </p>
        <div className="text-[11px] text-rose-700/80 dark:text-rose-400/80 flex items-center gap-1.5">
          <Info className="size-3.5" />
          <span>Per DIEZ financial integrity safeguards, visual representation is suppressed until reconciled.</span>
        </div>
      </div>
    );
  }

  return (
    <div
      data-slot="fund-state-bar-container"
      className={cn("py-4 space-y-4", className)}
      {...props}
    >
      {/* Optional Title Header */}
      {title && (
        <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          <span>{title}</span>
          <span className="font-mono tabular-nums text-foreground font-bold">
            Total {currency} {formatAmount(total)}
          </span>
        </div>
      )}

      {/* Stacked Bar */}
      <div className="relative h-6 w-full overflow-hidden rounded-md bg-muted/60 flex shadow-inner">
        {segments.map((seg) => {
          if (seg.percentValue <= 0) return null;
          const isHovered = hoveredState === seg.key;
          const showInlineLabel = seg.percentValue >= 8; // Hide label if below 8%

          return (
            <div
              key={seg.key}
              style={{ width: `${Math.max(seg.percentValue, 0.5)}%` }}
              onMouseEnter={() => setHoveredState(seg.key)}
              onMouseLeave={() => setHoveredState(null)}
              className={cn(
                "h-full relative transition-all duration-200 cursor-pointer flex items-center justify-center select-none overflow-hidden",
                seg.barColor,
                isHovered && "brightness-110 ring-2 ring-foreground/20 z-10 scale-[1.02]",
                hoveredState && !isHovered && "opacity-60"
              )}
              title={`${seg.label}: ${currency} ${formatAmount(seg.fils)} (${seg.percentString})`}
            >
              {showInlineLabel && (
                <span className="text-[11px] font-bold text-white drop-shadow-xs font-mono tracking-tight px-1 truncate">
                  {seg.percentString}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend Beneath Bar */}
      <div className={cn(
        "grid gap-3 pt-1",
        legendLayout === "vertical" ? "grid-cols-1" : "grid-cols-2 sm:grid-cols-4"
      )}>
        {segments.map((seg) => {
          const isHovered = hoveredState === seg.key;

          return (
            <button
              type="button"
              key={seg.key}
              onMouseEnter={() => setHoveredState(seg.key)}
              onMouseLeave={() => setHoveredState(null)}
              className={cn(
                "rounded-md border text-left transition-all duration-200 cursor-pointer",
                legendLayout === "vertical" ? "flex items-center justify-between px-3 py-2.5 gap-4" : "p-2.5 block",
                isHovered
                  ? "border-border bg-background shadow-xs ring-1 ring-border"
                  : "border-border/40 bg-background/40 hover:bg-background/70",
                hoveredState && !isHovered && "opacity-50"
              )}
            >
              <div className={cn("flex items-center gap-1.5", legendLayout === "horizontal" && "mb-1")}>
                <span className={cn("size-2 rounded-full shrink-0", seg.dotColor)} />
                <span className="text-[11px] font-medium text-muted-foreground truncate">
                  {seg.label}
                </span>
              </div>
              <div className={cn(
                "flex items-baseline gap-1 min-w-0",
                legendLayout === "vertical" ? "flex-1 justify-end gap-3" : "flex-wrap justify-between gap-x-1.5 gap-y-0.5 mt-0.5"
              )}>
                <Amount
                  value={seg.fils}
                  abbreviate={false}
                  showCurrency={true}
                  currency={currency}
                  className="text-[11px] font-bold text-foreground text-left tracking-tight"
                />
                <span className={cn("text-[10px] font-semibold font-mono shrink-0", legendLayout === "horizontal" && "ml-auto", seg.textColor)}>
                  {seg.percentString}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
