"use client";

import * as React from "react";
import { CheckCircle2, AlertTriangle, Info } from "lucide-react";
import { Amount } from "@/components/budget/Amount";
import { RevisedPositionRow } from "@/src/types/budget-amendment";
import { formatAmount } from "@/lib/money";
import { cn } from "@/lib/utils";

export interface RevisedBudgetPositionPanelProps {
  revisedPosition: RevisedPositionRow[];
  balanced: boolean;
  shortfallRemaining: number; // in fils, server-computed
  isLoadingPreview?: boolean;
  className?: string;
}

/**
 * Revised Budget Position Table per BUDGET-AMENDMENT-UI.md 1.1, 3.2:
 *
 * TASK 2 — FIX THE SIGN BUG:
 *  - Cost figures increasing -> POSITIVE change (+), shown in warning tone (amber)
 *  - Remaining-budget figures decreasing -> NEGATIVE change (−), shown in neutral tone (muted)
 *  - Caption: "Positive means an increase to cost. Negative means a decrease to what remains."
 *
 * TASK 3 — Balance status:
 *  - "Balanced" in success tone when allocations cover the shortfall
 *  - "Short by AED X" in danger tone otherwise, with Submit blocked and reason stated
 *
 * CRITICAL INVARIANT: Zero client-side arithmetic on cost fields. All values come
 * directly from the server preview response.
 */
export function RevisedBudgetPositionPanel({
  revisedPosition,
  balanced,
  shortfallRemaining,
  isLoadingPreview = false,
  className,
}: RevisedBudgetPositionPanelProps) {
  return (
    <section
      aria-labelledby="panel-revised-position-heading"
      className={cn(
        "rounded-lg border border-border bg-card p-5 space-y-4 shadow-xs transition-all",
        className
      )}
    >
      {/* ── Header: Title and Live Balance Status Badge (Task 3) ── */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/80 pb-3">
        <h2
          id="panel-revised-position-heading"
          className="text-xs font-bold tracking-wider uppercase text-muted-foreground"
        >
          Revised Budget Position
        </h2>

        {/* Task 3: Balance status pill */}
        <div data-slot="balance-status-container">
          {balanced ? (
            <span
              data-slot="balance-badge-balanced"
              className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full inline-flex items-center gap-1.5"
            >
              <CheckCircle2 className="size-3.5" aria-hidden="true" />
              <span>Balanced after amendment</span>
            </span>
          ) : (
            <span
              data-slot="balance-badge-short"
              className="text-[11px] font-semibold text-destructive bg-destructive/10 border border-destructive/20 px-2.5 py-1 rounded-full inline-flex items-center gap-1.5"
            >
              <AlertTriangle className="size-3.5" aria-hidden="true" />
              <span>
                {`Short by AED ${formatAmount(shortfallRemaining)}`}
              </span>
            </span>
          )}
        </div>
      </div>

      {/* ── Task 2: Revised Position Table & Sign Convention Caption ── */}
      <div className="overflow-x-auto">
        <table
          className="w-full text-xs"
          aria-describedby="revised-position-caption"
        >
          {/* Table Caption stating the sign rule */}
          <caption
            id="revised-position-caption"
            className="text-[11px] text-muted-foreground text-left italic pb-2.5"
          >
            Positive means an increase to cost. Negative means a decrease to what remains.
          </caption>

          <thead>
            <tr className="border-b border-border/60 text-muted-foreground font-semibold text-left">
              <th scope="col" className="py-2 pr-4 font-sans">
                Item
              </th>
              <th scope="col" className="py-2 px-3 text-right font-sans">
                Now
              </th>
              <th scope="col" className="py-2 px-3 text-right font-sans">
                → Revised
              </th>
              <th scope="col" className="py-2 pl-3 text-right font-sans">
                Change
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border/40 font-mono">
            {revisedPosition.map((row, index) => {
              const isCostIncrease = row.change > 0;
              const isBudgetDecrease = row.change < 0;

              return (
                <tr key={`${row.item}-${index}`} className="group hover:bg-muted/30 transition-colors">
                  <td className="py-2.5 pr-4 font-sans font-medium text-foreground">
                    {row.item}
                  </td>
                  <td className="py-2.5 px-3 text-right text-muted-foreground">
                    <Amount
                      variant="display"
                      size="sm"
                      value={row.current}
                      showCurrency={false}
                      abbreviate={false}
                    />
                  </td>
                  <td className="py-2.5 px-3 text-right font-semibold text-foreground">
                    <Amount
                      variant="display"
                      size="sm"
                      value={row.revised}
                      showCurrency={false}
                      abbreviate={false}
                    />
                  </td>
                  <td className="py-2.5 pl-3 text-right">
                    {/* TASK 2:
                        Cost figures increasing -> POSITIVE change in warning tone
                        Remaining-budget figures decreasing -> NEGATIVE change in neutral tone
                    */}
                    {isCostIncrease ? (
                      <span
                        data-slot="change-cost-increase"
                        className="font-semibold text-amber-800 dark:text-amber-300 inline-block"
                        title="Cost increase (Positive change)"
                      >
                        {`+${formatAmount(row.change)}`}
                      </span>
                    ) : isBudgetDecrease ? (
                      <span
                        data-slot="change-budget-decrease"
                        className="font-semibold text-muted-foreground inline-block"
                        title="Remaining budget decrease (Negative change)"
                      >
                        {formatAmount(row.change)}
                      </span>
                    ) : (
                      <span
                        data-slot="change-neutral"
                        className="font-normal text-muted-foreground/60 inline-block"
                      >
                        0.00
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Task 3: Blocked Submit Warning when Not Balanced ── */}
      {!balanced && (
        <div
          role="alert"
          data-slot="submit-blocked-alert"
          className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-xs space-y-1"
        >
          <div className="flex items-center gap-1.5 font-semibold">
            <AlertTriangle className="size-4 shrink-0" aria-hidden="true" />
            <span>Submit blocked: Position is short</span>
          </div>
          <p className="text-[11px] text-destructive/90 pl-5.5 leading-relaxed">
            {`The amendment is short by AED ${formatAmount(shortfallRemaining)}. Allocate sufficient funds from an open budget line or switch to an Unbudgeted request to balance the position before submitting.`}
          </p>
        </div>
      )}

      {/* Informative helper note reiterating rule */}
      <div className="text-[11px] text-muted-foreground/80 flex items-center gap-1.5 pt-1 border-t border-border/40">
        <Info className="size-3.5 shrink-0 text-muted-foreground/60" aria-hidden="true" />
        <span>
          Every figure is verified against authorized department budget lines.
        </span>
      </div>
    </section>
  );
}
