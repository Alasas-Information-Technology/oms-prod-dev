"use client";

import * as React from "react";
import {
  Activity,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  User,
  ShieldCheck,
  FileSpreadsheet,
  AlertCircle,
  ExternalLink,
  History,
} from "lucide-react";
import { IFundMovementsResponseDto, IFundMovementDto } from "@/lib/types/budget.types";
import { useBudgetLineMovements } from "@/hooks/useBudget";
import { Amount } from "./Amount";
import { FundStateBadge } from "./FundStateBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export interface FundMovementsPanelProps {
  selectedLineId?: string | null;
  selectedLineCode?: string;
  selectedLineName?: string;
  departmentId?: string;
  className?: string;
}

function formatMovementTime(isoString?: string | null): string {
  if (!isoString) return "";
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } catch {
    return isoString;
  }
}

export function FundMovementsPanel({
  selectedLineId,
  selectedLineCode,
  selectedLineName,
  departmentId,
  className,
}: FundMovementsPanelProps) {
  const { data: movementsData, isLoading } = useBudgetLineMovements(
    selectedLineId,
    departmentId
  );

  const isLineSelected = Boolean(selectedLineId);
  const movements: IFundMovementDto[] = movementsData?.movements || [];
  const lineCode = selectedLineCode || movementsData?.budgetLineCode || "CS-DIG-002";
  const lineName = selectedLineName || movementsData?.budgetLineName;

  return (
    <TooltipProvider delayDuration={200}>
      <div className={cn("p-6 rounded-xl border border-border/40 bg-card space-y-5", className)}>
        {/* ── Panel Header: Names selected line unambiguously (Part 2.1) ── */}
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <Activity className="size-4 text-primary shrink-0" />
              <h3 className="text-sm font-bold font-display text-foreground truncate">
                Fund Movements
              </h3>
            </div>

            {isLineSelected && (
              <Badge
                variant="outline"
                className="font-mono text-[10px] font-bold text-primary bg-primary/10 border-primary/25 shrink-0"
              >
                {lineCode}
              </Badge>
            )}
          </div>

          {/* Subtitle / Context indicator */}
          {isLineSelected ? (
            <p className="text-[11px] font-medium text-foreground truncate" title={lineName || lineCode}>
              {lineName ? `${lineName}` : `Lifecycle for ${lineCode}`}
            </p>
          ) : (
            <p className="text-[11px] text-muted-foreground italic">
              Showing recent movements across department — select a budget line in the table to view its lifecycle.
            </p>
          )}
        </div>

        {/* ── Vertical Stepper (Sign-off chain visual pattern from ORG-UNIT-DETAIL-SPEC §3.7) ── */}
        <div className="relative pl-0.5 pt-2">
          {isLoading ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              Loading fund movements...
            </div>
          ) : movements.length === 0 ? (
            <div className="py-6 text-center text-xs text-muted-foreground">
              No fund movement records available.
            </div>
          ) : (
            <div className="relative pl-0.5">
              {movements.map((step, idx) => {
                const isLast = idx === movements.length - 1;
                const isCompleted = step.isCompleted;
                const formattedTime = formatMovementTime(step.timestamp);

                return (
                  <div
                    key={step.id || idx}
                    className="relative flex items-start gap-3 pb-5 last:pb-0 group"
                  >
                    {/* Vertical Connector Line (ORG-UNIT-DETAIL-SPEC §3.7) */}
                    {!isLast && (
                      <div
                        className={cn(
                          "absolute left-[9.5px] top-[22px] bottom-0 w-[1px] transition-colors",
                          isCompleted ? "bg-primary/40" : "bg-border/70"
                        )}
                      />
                    )}

                    {/* Step Numbered Circle */}
                    <div
                      className={cn(
                        "relative z-10 w-5 h-5 rounded-full text-[10px] font-mono font-bold flex items-center justify-center border shrink-0 transition-all shadow-2xs mt-0.5",
                        isCompleted
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-muted text-muted-foreground/60 border-border/70"
                      )}
                    >
                      {step.stepNumber}
                    </div>

                    {/* Step Card Content */}
                    <div
                      className={cn(
                        "min-w-0 flex-1 p-3 rounded-xl border transition-colors space-y-1.5",
                        isCompleted
                          ? "bg-muted/30 border-border/60 hover:bg-muted/50"
                          : "bg-muted/10 border-border/30 opacity-70"
                      )}
                    >
                      {/* Step Title & Status */}
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span
                          className={cn(
                            "text-xs font-semibold leading-snug",
                            isCompleted ? "text-foreground" : "text-muted-foreground"
                          )}
                        >
                          {step.label}
                        </span>

                        {isCompleted ? (
                          <span className="text-[10px] text-muted-foreground font-medium whitespace-nowrap flex items-center gap-1">
                            <Clock className="size-2.5" />
                            {formattedTime}
                          </span>
                        ) : (
                          <Badge
                            variant="secondary"
                            className="text-[9px] px-1.5 py-0 font-medium text-muted-foreground bg-muted/60"
                          >
                            Not started
                          </Badge>
                        )}
                      </div>

                      {/* Transition Badge + Exact Amount */}
                      {isCompleted ? (
                        <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
                          <div className="flex items-center gap-1.5">
                            <FundStateBadge state={step.toState} size="sm" />
                            <Amount
                              value={step.amountFils}
                              className="font-semibold text-xs text-foreground"
                            />
                          </div>

                          {step.requestCode && (
                            <span className="font-mono text-[10px] text-muted-foreground">
                              {step.requestCode}
                            </span>
                          )}
                        </div>
                      ) : (
                        <p className="text-[11px] text-muted-foreground/80 leading-snug">
                          {step.description}
                        </p>
                      )}

                      {/* Actor details (if completed) */}
                      {isCompleted && step.actorName && (
                        <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <User className="size-3 text-muted-foreground shrink-0" />
                          <span className="truncate">
                            {step.actorName} {step.actorRole && `(${step.actorRole})`}
                          </span>
                        </div>
                      )}

                      {/* "View before/after audit" Link (Part 3) */}
                      {isCompleted && (
                        <div className="pt-1 border-t border-border/30 flex justify-end">
                          <a
                            href={`/app/budget/dept-budget?code=${encodeURIComponent(lineCode)}#audit-${step.id}`}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:text-primary/80 hover:underline cursor-pointer group-hover:text-primary transition-colors"
                          >
                            <History className="size-3" />
                            <span>View before/after audit</span>
                            <ArrowUpRight className="size-2.5" />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
