"use client";

import * as React from "react";
import {
  Layers,
  Wallet,
  GitBranch,
  CheckCircle2,
  AlertTriangle,
  Info,
  Building2,
  ArrowRight,
} from "lucide-react";
import { Amount } from "@/components/budget/Amount";
import { MoneyInput } from "./MoneyInput";
import {
  FundingRouteCode,
  FundingRouteOption,
  AmendmentAllocationInput,
} from "@/src/types/budget-amendment";
import { formatAmount } from "@/lib/money";
import { cn } from "@/lib/utils";

export interface FundingRoutePanelProps {
  fundingRoutes: FundingRouteOption[];
  selectedRoute: FundingRouteCode;
  onSelectRoute: (route: FundingRouteCode) => void;
  allocations: AmendmentAllocationInput[];
  onAllocationChange: (lineId: string, amount: number) => void;
  shortfall: number; // in fils
  totalAllocated: number; // in fils (server preview)
  balanced: boolean; // server preview
  shortfallRemaining: number; // in fils (server preview)
  departmentName?: string;
  readOnly?: boolean;
  className?: string;
}

/**
 * Funding Route Selection Panel per BUDGET-AMENDMENT-UI.md 1.3 & 3.3:
 *
 * TASK 1: Three radio cards (Budgeted, Unallocated, Unbudgeted).
 *         Unallocated icon is a plain wallet, NOT a lock.
 *
 * TASK 2: Budgeted / Unallocated form with line picker, live count,
 *         money-masked "Add" input, running total, and balance check against shortfall.
 *
 * TASK 3: Unbudgeted form with NO line picker, rendering exact text:
 *         "HR reviews this first. If they approve, Finance selects or creates the funding line.
 *          Only then does this continue to procurement."
 *         Sends NO allocations.
 *
 * TASK 4: Money-masked inputs with AED prefix, thousands separators, two decimals,
 *         and no spinner arrows.
 */
export function FundingRoutePanel({
  fundingRoutes,
  selectedRoute,
  onSelectRoute,
  allocations,
  onAllocationChange,
  shortfall,
  totalAllocated,
  balanced,
  shortfallRemaining,
  departmentName = "Digital Security",
  readOnly = false,
  className,
}: FundingRoutePanelProps) {
  const activeRouteOption = fundingRoutes.find((r) => r.code === selectedRoute);
  const availableLines = activeRouteOption?.availableLines || [];

  // Map allocations by lineId for fast O(1) lookup
  const allocationsMap = React.useMemo(() => {
    const map = new Map<string, number>();
    for (const a of allocations) {
      map.set(a.lineId, a.amount);
    }
    return map;
  }, [allocations]);

  return (
    <section
      aria-labelledby="panel-funding-route-heading"
      className={cn(
        "rounded-lg border border-border bg-card p-5 space-y-5 shadow-xs transition-all",
        className
      )}
    >
      <div className="border-b border-border/80 pb-3">
        <h2
          id="panel-funding-route-heading"
          className="text-xs font-bold tracking-wider uppercase text-muted-foreground"
        >
          Funding Route
        </h2>
      </div>

      {/* ── TASK 1: Three Radio Cards ── */}
      <div
        role="radiogroup"
        aria-label="Select funding route"
        className="grid grid-cols-1 sm:grid-cols-3 gap-3"
      >
        {fundingRoutes.map((route) => {
          const isSelected = selectedRoute === route.code;

          // Distinct iconography per route:
          // Unallocated MUST use a plain wallet (NOT a lock) per Task 1 & §1.3
          const RouteIcon =
            route.code === "UNALLOCATED"
              ? Wallet
              : route.code === "UNBUDGETED"
              ? GitBranch
              : Layers;

          return (
            <div
              key={route.code}
              role="radio"
              aria-checked={isSelected}
              tabIndex={readOnly ? -1 : 0}
              onClick={() => {
                if (!readOnly && selectedRoute !== route.code) {
                  onSelectRoute(route.code);
                }
              }}
              onKeyDown={(e) => {
                if (!readOnly && (e.key === " " || e.key === "Enter")) {
                  e.preventDefault();
                  onSelectRoute(route.code);
                }
              }}
              className={cn(
                "p-3.5 rounded-lg border text-xs cursor-pointer transition-all flex flex-col justify-between space-y-2 select-none",
                "focus:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/40",
                isSelected
                  ? "border-primary bg-primary/5 shadow-xs ring-1 ring-primary/30"
                  : "border-border hover:bg-muted/30 hover:border-border/80",
                readOnly && "cursor-default opacity-80"
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "size-7 rounded-md flex items-center justify-center shrink-0 transition-colors",
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    <RouteIcon className="size-3.5" aria-hidden="true" />
                  </div>
                  <span className="font-semibold text-foreground text-xs">
                    {route.label}
                  </span>
                </div>

                <div
                  className={cn(
                    "size-4 rounded-full border flex items-center justify-center shrink-0 transition-colors",
                    isSelected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-muted-foreground/40"
                  )}
                >
                  {isSelected && <span className="size-1.5 rounded-full bg-white" />}
                </div>
              </div>

              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {route.consequence}
              </p>
            </div>
          );
        })}
      </div>

      {/* ── TASK 2: Budgeted / Unallocated Form with Line Picker ── */}
      {(selectedRoute === "BUDGETED" || selectedRoute === "UNALLOCATED") && (
        <div className="space-y-4 pt-2 border-t border-border/60">
          {/* Live count of scoped open lines */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-xs font-semibold text-foreground">
              {selectedRoute === "BUDGETED" ? "Open Budget Lines" : "Unallocated Budget Pools"}
            </h3>
            <span
              data-slot="open-lines-count"
              className="text-[11px] font-medium text-muted-foreground bg-muted/50 px-2 py-0.5 rounded border border-border/50"
            >
              {`${availableLines.length} open ${availableLines.length === 1 ? "line" : "lines"} available to ${departmentName}.`}
            </span>
          </div>

          {/* Lines List with exact amounts and MoneyInput */}
          <div className="space-y-2.5">
            {availableLines.map((line) => {
              const allocatedAmount = allocationsMap.get(line.lineId) || 0;
              const isOverAllocated = allocatedAmount > line.available;

              return (
                <div
                  key={line.lineId}
                  className={cn(
                    "p-3 rounded-lg border bg-card/60 transition-colors space-y-2 sm:space-y-0 sm:flex sm:items-center sm:justify-between sm:gap-4",
                    isOverAllocated ? "border-destructive/60 bg-destructive/5" : "border-border/80"
                  )}
                >
                  {/* Line info */}
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-foreground text-xs truncate">
                        {line.name}
                      </span>
                      <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground shrink-0">
                        {line.code}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <span>Available:</span>
                      <Amount
                        variant="display"
                        size="sm"
                        value={line.available}
                        abbreviate={false}
                        className="font-medium"
                      />
                    </div>
                  </div>

                  {/* TASK 4: Money-Masked "Add" Input */}
                  <div className="flex items-center gap-2 justify-end shrink-0">
                    <label
                      htmlFor={`line-allocation-${line.lineId}`}
                      className="text-xs font-semibold text-muted-foreground shrink-0"
                    >
                      Add
                    </label>
                    <MoneyInput
                      id={`line-allocation-${line.lineId}`}
                      name={`allocation-${line.lineId}`}
                      value={allocatedAmount}
                      max={line.available}
                      onChange={(fils) => onAllocationChange(line.lineId, fils)}
                      disabled={readOnly}
                      placeholder="0.00"
                      ariaLabel={`Add allocation from ${line.name}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Running total beneath lines */}
          <div className="p-3 rounded-lg bg-muted/30 border border-border/60 flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="font-medium text-muted-foreground">Total added</span>
            <div className="flex items-center gap-2">
              <Amount
                variant="display"
                size="md"
                value={totalAllocated}
                abbreviate={false}
                className="font-mono font-bold text-foreground"
              />
            </div>
          </div>

          {/* Live balance check against shortfall */}
          <div data-slot="balance-check-feedback" className="pt-1">
            {balanced ? (
              <div className="flex items-center gap-2 text-xs font-medium text-emerald-800 dark:text-emerald-300">
                <CheckCircle2 className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                <span>
                  {`Sufficient funds available (AED ${formatAmount(totalAllocated)} allocated of AED ${formatAmount(shortfall)} shortfall)`}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs font-medium text-amber-800 dark:text-amber-400">
                <AlertTriangle className="size-4 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden="true" />
                <span>
                  {`Short by AED ${formatAmount(shortfallRemaining)} — Add more funds to cover the shortfall`}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TASK 3: Unbudgeted Form (NO Line Picker) ── */}
      {selectedRoute === "UNBUDGETED" && (
        <div
          data-slot="unbudgeted-route-container"
          className="space-y-3 pt-3 border-t border-border/60"
        >
          {/* Exact required text per Task 3 */}
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 text-xs space-y-2">
            <div className="flex items-start gap-2">
              <GitBranch className="size-4 text-primary shrink-0 mt-0.5" aria-hidden="true" />
              <p
                data-slot="unbudgeted-exact-text"
                className="font-medium text-foreground leading-relaxed"
              >
                HR reviews this first. If they approve, Finance selects or creates the funding line. Only then does this continue to procurement.
              </p>
            </div>

            <p className="text-[11px] text-muted-foreground pl-6 leading-relaxed">
              Selecting Unbudgeted requests additional corporate funding beyond your department&apos;s allocated fiscal ceiling. An HR &rarr; Finance endorsement stage has been automatically added to the approval workflow.
            </p>
          </div>

          <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 pl-1">
            <Info className="size-3.5 shrink-0" aria-hidden="true" />
            <span>
              Zero department budget lines will be debited. No line allocations are submitted.
            </span>
          </div>
        </div>
      )}
    </section>
  );
}
