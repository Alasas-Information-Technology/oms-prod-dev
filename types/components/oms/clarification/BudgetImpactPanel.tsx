"use client";

import * as React from "react";
import {
  Landmark,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Info,
} from "lucide-react";
import { formatAmount } from "@/lib/money";
import { cn } from "@/lib/utils";

export interface BudgetFigures {
  applicable?: boolean;
  currentReservation?: number;
  changeAmount?: number;
  lineAvailable?: number;
  result?: "WITHIN_BUDGET" | "REQUIRES_AMENDMENT" | "INSUFFICIENT" | string;
  message?: string | null;
  note?: string | null;
  reserved?: number;
}

export interface BudgetImpactPanelProps {
  figures?: BudgetFigures;
  /** Alias for figures for backwards compatibility */
  budget?: BudgetFigures;
  variant?: "revalidation" | "note";
  isLoading?: boolean;
  className?: string;
  title?: string;
  noteText?: string;
}

export function BudgetImpactPanel({
  figures,
  budget,
  variant = "revalidation",
  isLoading = false,
  className,
  title,
  noteText,
}: BudgetImpactPanelProps) {
  const data = figures || budget;

  if (!data || (data.applicable !== undefined && !data.applicable)) {
    return null;
  }

  const isNote = variant === "note";

  const {
    currentReservation,
    reserved,
    changeAmount = 0,
    lineAvailable,
    result,
    message,
    note,
  } = data;

  const resolvedReservation =
    currentReservation !== undefined ? currentReservation : reserved;

  const isPositiveChange = changeAmount > 0;
  const isZeroChange = changeAmount === 0;

  // ==========================================
  // NOTE VARIANT (HR Send-Back §4.5)
  // ==========================================
  if (isNote) {
    return (
      <div
        className={cn(
          "rounded-xl border border-border/80 bg-card shadow-xs overflow-hidden",
          className
        )}
      >
        {/* Header */}
        <div className="px-4 py-3 sm:px-5 sm:py-3.5 bg-muted/40 border-b border-border/70 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Landmark className="size-4 text-primary" />
            <span className="text-xs font-bold uppercase tracking-wider text-foreground">
              {title || "Budget"}
            </span>
          </div>
        </div>

        <div className="p-4 sm:p-5 space-y-3.5 text-xs">
          {resolvedReservation !== undefined && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground font-medium">Reserved:</span>
              <span className="tabular-nums font-semibold text-foreground">
                AED {formatAmount(resolvedReservation)}
              </span>
            </div>
          )}

          {(note || noteText || message) && (
            <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/30 p-2.5 rounded-lg border border-border/40 leading-relaxed">
              <Info className="size-3.5 text-muted-foreground/70 shrink-0 mt-0.5" />
              <span>{note || noteText || message}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ==========================================
  // REVALIDATION VARIANT (Requester Response §3.8)
  // ==========================================
  return (
    <div
      className={cn(
        "rounded-xl border border-border/80 bg-card shadow-xs overflow-hidden transition-opacity duration-200",
        isLoading && "opacity-70",
        className
      )}
    >
      {/* Header */}
      <div className="px-4 py-3 sm:px-5 sm:py-3.5 bg-muted/40 border-b border-border/70 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Landmark className="size-4 text-primary" />
          <span className="text-xs font-bold uppercase tracking-wider text-foreground">
            {title || "Budget Impact"}
          </span>
        </div>

        {/* Server Result Badge */}
        {result === "WITHIN_BUDGET" && (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
            <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400" />
            Still within budget
          </span>
        )}
        {result === "REQUIRES_AMENDMENT" && (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30">
            <AlertTriangle className="size-3.5 text-amber-600 dark:text-amber-400" />
            Starts budget amendment
          </span>
        )}
        {result === "INSUFFICIENT" && (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-700 dark:text-red-300 border border-red-500/30">
            <XCircle className="size-3.5 text-red-600 dark:text-red-400" />
            Not enough budget
          </span>
        )}
      </div>

      {/* Ledger Breakdown */}
      <div className="p-4 sm:p-5 space-y-4 text-xs">
        <div className="space-y-3">
          {/* Current Reservation */}
          {resolvedReservation !== undefined && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground font-medium">Current Reservation:</span>
              <span className="tabular-nums font-semibold text-foreground">
                AED {formatAmount(resolvedReservation)}
              </span>
            </div>
          )}

          {/* Change in Amount (Server-computed delta) */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground font-medium">Change in Amount:</span>
            <span
              className={cn(
                "tabular-nums font-bold inline-flex items-center gap-1",
                isZeroChange
                  ? "text-muted-foreground"
                  : isPositiveChange
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-emerald-600 dark:text-emerald-400"
              )}
            >
              {isZeroChange ? (
                <Minus className="size-3" />
              ) : isPositiveChange ? (
                <ArrowUpRight className="size-4" />
              ) : (
                <ArrowDownRight className="size-4" />
              )}
              {isPositiveChange ? "+" : ""}
              AED {formatAmount(changeAmount)}
            </span>
          </div>

          {/* Available on Selected Line */}
          {lineAvailable !== undefined && (
            <div className="flex items-center justify-between pt-2 border-t border-border/40 text-sm">
              <span className="text-muted-foreground font-medium">Available on line:</span>
              <span className="tabular-nums font-medium text-muted-foreground">
                AED {formatAmount(lineAvailable)}
              </span>
            </div>
          )}
        </div>

        {/* Informative Server Message if provided */}
        {(message || note) && (
          <p className="text-xs text-muted-foreground bg-muted/30 p-2.5 rounded-lg border border-border/40 leading-relaxed">
            {message || note}
          </p>
        )}

        {/* Mandatory Note per Part 3.8 */}
        <p className="pt-2 border-t border-border/40 text-[11.5px] text-muted-foreground leading-normal">
          Budget is checked again at each approval and finally when your HOD approves. The figures shown are a preview.
        </p>
      </div>
    </div>
  );
}
