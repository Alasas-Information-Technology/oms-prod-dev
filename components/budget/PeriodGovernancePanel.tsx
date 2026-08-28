"use client";

import * as React from "react";
import {
  CalendarCheck,
  CheckCircle2,
  Clock,
  Lock,
  Unlock,
  Edit3,
  AlertCircle,
  ShieldCheck,
  UserCheck,
  Info,
  ChevronRight,
} from "lucide-react";
import { IBudgetPeriodDto } from "@/lib/types/budget.types";
import { usePermission } from "@/hooks/usePermission";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export interface PeriodGovernancePanelProps {
  periodData?: IBudgetPeriodDto;
  isLoading?: boolean;
  onOpenManagePeriodDialog?: () => void;
  className?: string;
}

function formatApprovalTimestamp(isoString?: string): string {
  if (!isoString) return "—";
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } catch {
    return isoString;
  }
}

export function PeriodGovernancePanel({
  periodData,
  isLoading = false,
  onOpenManagePeriodDialog,
  className,
}: PeriodGovernancePanelProps) {
  const { can } = usePermission();
  const canManagePeriod = can("BUDGET.PERIOD.MANAGE") || can("ADMIN.VIEW");

  const isClosed = periodData ? periodData.status === "CLOSED" : false;
  const periodCode = periodData?.code || "FY 2026";
  const approval = periodData?.threeLevelApproval;
  const isApprovalComplete = approval?.isComplete ?? true;

  const lastAmendedFormatted = periodData?.lastAmendedAt
    ? formatApprovalTimestamp(periodData.lastAmendedAt)
    : "1 Aug 11:05";

  return (
    <TooltipProvider delayDuration={200}>
      <div className={cn("p-6 rounded-xl border border-border/40 bg-card space-y-5", className)}>
        {/* Panel Header */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <CalendarCheck className="size-4 text-primary" />
            <h3 className="text-sm font-bold font-display text-foreground">
              Period Governance
            </h3>
          </div>

          <Badge
            variant="outline"
            className={cn(
              "text-[10px] font-semibold px-2 py-0.5 shadow-2xs inline-flex items-center gap-1",
              isClosed
                ? "bg-zinc-500/10 text-zinc-700 dark:text-zinc-300 border-zinc-500/30"
                : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
            )}
          >
            <span
              className={cn(
                "size-1.5 rounded-full shrink-0",
                isClosed ? "bg-zinc-500" : "bg-emerald-500"
              )}
            />
            <span>{isClosed ? "Closed" : "Open"}</span>
          </Badge>
        </div>

        {/* Period Meta Subtitle */}
        <div className="text-xs text-muted-foreground flex items-center gap-2 flex-wrap pb-1 border-b border-border/40">
          <span className="font-semibold text-foreground">{periodCode}</span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <Clock className="size-3 text-muted-foreground" />
            Last amended {lastAmendedFormatted}
          </span>
        </div>

        {/* ── Three-Level Approval Progress Header ── */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-foreground flex items-center gap-1.5">
              <ShieldCheck className="size-3.5 text-primary" />
              Three-Level Approval Process
            </span>
            {isApprovalComplete ? (
              <Badge
                variant="outline"
                className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20 text-[10px] font-semibold gap-1 py-0 px-1.5"
              >
                <CheckCircle2 className="size-2.5" />
                Completed
              </Badge>
            ) : (
              <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                Level {approval?.currentLevel || 1} of {approval?.totalLevels || 3}
              </span>
            )}
          </div>

          {/* ── Approval History Numbered List (Part 3) ── */}
          <div className="space-y-2 pt-1">
            {approval?.steps ? (
              approval.steps.map((step) => {
                const isApproved = step.status === "APPROVED";
                return (
                  <div
                    key={step.level}
                    className="p-2.5 rounded-xl border border-border/50 bg-muted/30 flex items-start gap-2.5 text-xs"
                  >
                    <div
                      className={cn(
                        "size-5 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5 shadow-2xs",
                        isApproved
                          ? "bg-emerald-500 text-white"
                          : "bg-muted-foreground/20 text-muted-foreground"
                      )}
                    >
                      {step.level === 1 ? "①" : step.level === 2 ? "②" : "③"}
                    </div>

                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-semibold text-foreground text-xs truncate">
                          {step.roleDisplayName || step.role}
                        </span>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                          {formatApprovalTimestamp(step.approvedAt)}
                        </span>
                      </div>
                      <span className="text-[11px] text-muted-foreground truncate">
                        {step.approverName || "Pending sign-off"}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <>
                <div className="p-2 rounded-xl border border-border/50 bg-muted/30 flex items-center justify-between text-xs">
                  <span className="font-medium flex items-center gap-1.5">
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">①</span>
                    Finance Analyst Review
                  </span>
                  <span className="text-[10px] text-muted-foreground">1 Aug 09:10</span>
                </div>
                <div className="p-2 rounded-xl border border-border/50 bg-muted/30 flex items-center justify-between text-xs">
                  <span className="font-medium flex items-center gap-1.5">
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">②</span>
                    Finance Manager Endorsement
                  </span>
                  <span className="text-[10px] text-muted-foreground">1 Aug 10:25</span>
                </div>
                <div className="p-2 rounded-xl border border-border/50 bg-muted/30 flex items-center justify-between text-xs">
                  <span className="font-medium flex items-center gap-1.5">
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">③</span>
                    Finance HOD Executive Approval
                  </span>
                  <span className="text-[10px] text-muted-foreground">1 Aug 11:05</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── RFP Mandatory Governance Note ── */}
        <div className="p-2.5 rounded-xl border border-border/60 bg-muted/40 flex items-start gap-2 text-xs">
          <Info className="size-3.5 text-primary shrink-0 mt-0.5" />
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            <strong className="text-foreground font-semibold">Governance Rule:</strong> Reopening a closed financial period requires the full three-level approval process.
          </p>
        </div>

        {/* ── Governance Actions (Gated on BUDGET.PERIOD.MANAGE) ── */}
        {canManagePeriod && (
          <div className="pt-2 border-t border-border/40 flex items-center gap-2">
            {isClosed ? (
              <Button
                variant="default"
                size="sm"
                onClick={onOpenManagePeriodDialog}
                className="w-full text-xs h-8 gap-1.5 font-semibold rounded-xl cursor-pointer shadow-xs"
              >
                <Unlock className="size-3" />
                <span>Reopen Period (3-Level Request)</span>
              </Button>
            ) : (
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onOpenManagePeriodDialog}
                      className="flex-1 text-xs h-8 gap-1 font-semibold rounded-xl cursor-pointer"
                    >
                      <Edit3 className="size-3" />
                      <span>Amend</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">
                    Amend active period allocations or adjust baseline budget parameters.
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onOpenManagePeriodDialog}
                      className="flex-1 text-xs h-8 gap-1 font-semibold rounded-xl text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border-rose-200 dark:border-rose-900 cursor-pointer"
                    >
                      <Lock className="size-3" />
                      <span>Close</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">
                    Lock period against further fund movements and begin formal reconciliation.
                  </TooltipContent>
                </Tooltip>
              </>
            )}
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
