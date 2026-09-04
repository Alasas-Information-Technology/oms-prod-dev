"use client";

import * as React from "react";
import {
  FileText,
  AlertOctagon,
  ArrowUpRight,
  TrendingUp,
  FilePlus2,
  FileCode,
  Filter,
  X,
  ArrowRight,
  Inbox,
} from "lucide-react";
import {
  IBudgetRequestDto,
  BudgetRequestType,
  BudgetRequestStatus,
  IBudgetRequestsSummaryCountDto,
} from "@/lib/types/budget.types";
import { useBudgetRequests } from "@/hooks/useBudget";
import { Amount } from "./Amount";
import { StatusBadge, OMSStatus } from "@/components/shared/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export interface BudgetRequestsSectionProps {
  periodId?: string;
  departmentId?: string;
  className?: string;
}

// ── Date Formatter: "3 Aug 2026" (Part 3 Rule 7) ──────────────────────────────
function formatRequestDate(isoString: string): string {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return isoString;
  }
}

// ── Map BudgetRequestStatus to OMSStatus for StatusBadge ───────────────────────
function mapRequestStatusToOms(status: BudgetRequestStatus): {
  omsStatus: OMSStatus;
  labelOverride?: string;
} {
  switch (status) {
    case "APPROVED":
      return { omsStatus: "approved", labelOverride: "Approved" };
    case "AWAITING_APPROVAL":
      return { omsStatus: "pending", labelOverride: "Awaiting Approval" };
    case "EXCEPTION":
      return { omsStatus: "rejected", labelOverride: "Exception" };
    case "REJECTED":
      return { omsStatus: "cancelled", labelOverride: "Rejected" };
    default:
      return { omsStatus: "waiting", labelOverride: status };
  }
}

// ── Request Type Config ───────────────────────────────────────────────────────
const TYPE_CONFIG: Record<
  BudgetRequestType,
  { label: string; icon: React.ElementType; badgeClass: string }
> = {
  UNBUDGETED: {
    label: "Unbudgeted",
    icon: FilePlus2,
    badgeClass: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20",
  },
  TOP_UP: {
    label: "Top-Up",
    icon: TrendingUp,
    badgeClass: "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20",
  },
  AMENDMENT: {
    label: "Amendment",
    icon: FileCode,
    badgeClass: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/20",
  },
  EXCEPTION: {
    label: "Exception",
    icon: AlertOctagon,
    badgeClass: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
  },
};

export function BudgetRequestsSection({
  periodId = "period-fy26",
  departmentId,
  className,
}: BudgetRequestsSectionProps) {
  const [selectedType, setSelectedType] = React.useState<BudgetRequestType | "ALL">("ALL");

  // Fetch Requests & Exceptions
  const { data: requestsResponse, isLoading } = useBudgetRequests({
    periodId,
    departmentId,
    type: selectedType,
  });

  const summaryCounts: IBudgetRequestsSummaryCountDto = requestsResponse?.summaryCounts || {
    unbudgetedCount: 3,
    topUpCount: 2,
    amendmentsCount: 4,
    // TODO(integration-ops): wire to the real reconciliation exception queue
    exceptionsCount: 1,
  };

  const requests: IBudgetRequestDto[] = requestsResponse?.items || [];

  return (
    <TooltipProvider delayDuration={200}>
      <div className={cn("space-y-4", className)}>
        {/* Section Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap px-1">
          <div className="flex items-center gap-2">
            <FileText className="size-4 text-primary" />
            <h2 className="text-sm font-bold font-display text-foreground">
              Requests & Exceptions
            </h2>
            <span className="text-[11px] text-muted-foreground">
              · Unbudgeted, top-up, amendment and reconciliation events
            </span>
          </div>

          <a
            href="/app/budget/dept-budget#requests"
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors group cursor-pointer"
          >
            <span>View all requests</span>
            <ArrowRight className="size-3.5 group-hover:translate-x-0.5 transition-transform" />
          </a>
        </div>

        {/* ── 1. Four Interactive Count Tiles (Part 3) ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Tile 1: Unbudgeted */}
          <button
            type="button"
            onClick={() => setSelectedType(selectedType === "UNBUDGETED" ? "ALL" : "UNBUDGETED")}
            className={cn(
              "p-4 rounded-md border text-left transition-all relative overflow-hidden cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1",
              selectedType === "UNBUDGETED"
                ? "bg-primary/5 border-primary/40 shadow-none ring-1 ring-primary/20"
                : "bg-card border-border/40 shadow-none hover:shadow-sm"
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                Unbudgeted
              </span>
              <FilePlus2 className="size-3.5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-display text-foreground">
                {summaryCounts.unbudgetedCount}
              </span>
              <span className="text-[11px] text-muted-foreground">open</span>
            </div>
          </button>

          {/* Tile 2: Top-Up */}
          <button
            type="button"
            onClick={() => setSelectedType(selectedType === "TOP_UP" ? "ALL" : "TOP_UP")}
            className={cn(
              "p-4 rounded-md border text-left transition-all relative overflow-hidden cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1",
              selectedType === "TOP_UP"
                ? "bg-primary/5 border-primary/40 shadow-none ring-1 ring-primary/20"
                : "bg-card border-border/40 shadow-none hover:shadow-sm"
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                Top-Up
              </span>
              <TrendingUp className="size-3.5 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-display text-foreground">
                {summaryCounts.topUpCount}
              </span>
              <span className="text-[11px] text-muted-foreground">open</span>
            </div>
          </button>

          {/* Tile 3: Amendments */}
          <button
            type="button"
            onClick={() => setSelectedType(selectedType === "AMENDMENT" ? "ALL" : "AMENDMENT")}
            className={cn(
              "p-4 rounded-md border text-left transition-all relative overflow-hidden cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1",
              selectedType === "AMENDMENT"
                ? "bg-primary/5 border-primary/40 shadow-none ring-1 ring-primary/20"
                : "bg-card border-border/40 shadow-none hover:shadow-sm"
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                Amendments
              </span>
              <FileCode className="size-3.5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-display text-foreground">
                {summaryCounts.amendmentsCount}
              </span>
              <span className="text-[11px] text-muted-foreground">pending</span>
            </div>
          </button>

          {/* Tile 4: Exceptions (AMBER when above zero per Part 3 Rule 2) */}
          <button
            type="button"
            onClick={() => setSelectedType(selectedType === "EXCEPTION" ? "ALL" : "EXCEPTION")}
            className={cn(
              "p-4 rounded-md border text-left transition-all relative overflow-hidden cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-1",
              summaryCounts.exceptionsCount > 0
                ? "bg-amber-50/50 border-amber-500/30 dark:bg-amber-950/10"
                : "bg-card border-border/40 hover:shadow-sm",
              selectedType === "EXCEPTION" && "ring-1 ring-amber-500/50 border-amber-500/50 bg-amber-50 dark:bg-amber-950/20 shadow-none"
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wide flex items-center gap-1">
                <AlertOctagon className="size-3 shrink-0" />
                Exceptions
              </span>
              {summaryCounts.exceptionsCount > 0 && (
                <span className="size-2 rounded-full bg-amber-500 animate-pulse" />
              )}
            </div>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-display text-amber-800 dark:text-amber-300">
                {summaryCounts.exceptionsCount}
              </span>
              <span className="text-[11px] text-amber-700/80 dark:text-amber-400/80 font-medium">
                needs action
              </span>
            </div>
          </button>
        </div>

        {/* ── Active Filter Clear Bar ── */}
        {selectedType !== "ALL" && (
          <div className="flex items-center justify-between gap-3 px-3 py-1.5 rounded-md bg-muted/40 border border-border/60 text-xs">
            <div className="flex items-center gap-1.5">
              <Filter className="size-3 text-primary" />
              <span className="text-muted-foreground">Filtered by:</span>
              <Badge variant="secondary" className="text-[11px] font-semibold">
                {TYPE_CONFIG[selectedType]?.label || selectedType}
              </Badge>
            </div>
            <button
              type="button"
              onClick={() => setSelectedType("ALL")}
              className="text-xs font-semibold text-muted-foreground hover:text-foreground inline-flex items-center gap-1 cursor-pointer"
            >
              <X className="size-3" />
              <span>Clear filter</span>
            </button>
          </div>
        )}

        {/* ── 2. Requests Table ── */}
        <div className="rounded-md border border-border/40 bg-card overflow-hidden h-fit">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border/70 bg-muted/30 text-muted-foreground">
                  <th className="py-2.5 px-4 font-semibold w-32">Request ID</th>
                  <th className="py-2.5 px-3 font-semibold w-28">Type</th>
                  <th className="py-2.5 px-4 font-semibold min-w-48">Description</th>
                  <th className="py-2.5 px-4 font-semibold text-right w-32">Amount (AED)</th>
                  <th className="py-2.5 px-3 font-semibold text-center w-36">Status</th>
                  <th className="py-2.5 px-4 font-semibold min-w-36">Owner</th>
                  <th className="py-2.5 px-4 font-semibold w-32">Requested On</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-border/40">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-muted-foreground">
                      Loading requests...
                    </td>
                  </tr>
                ) : requests.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <Inbox className="size-8 text-muted-foreground/50" />
                        <p className="font-semibold text-foreground text-xs">No open requests</p>
                        <p className="text-[11px] text-muted-foreground">
                          {selectedType !== "ALL"
                            ? `No ${TYPE_CONFIG[selectedType]?.label.toLowerCase()} requests match the current filter.`
                            : "There are no pending requests or reconciliation exceptions."}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  requests.map((req) => {
                    const typeCfg = TYPE_CONFIG[req.type] || TYPE_CONFIG.UNBUDGETED;
                    const { omsStatus, labelOverride } = mapRequestStatusToOms(req.status);
                    const formattedDate = formatRequestDate(req.requestedOn);

                    return (
                      <tr
                        key={req.id}
                        className="hover:bg-muted/30 transition-colors group"
                      >
                        {/* Request ID */}
                        <td className="py-3 px-4">
                          <a
                            href={`/app/budget/dept-budget#${encodeURIComponent(req.requestCode)}`}
                            className="inline-flex items-center gap-1 font-mono text-xs font-bold text-primary hover:text-primary/80 hover:underline cursor-pointer"
                            title={`View request ${req.requestCode}`}
                          >
                            <span>{req.requestCode}</span>
                            <ArrowUpRight className="size-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </a>
                        </td>

                        {/* Type Badge */}
                        <td className="py-3 px-3">
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[10px] font-medium px-2 py-0.5 inline-flex items-center gap-1",
                              typeCfg.badgeClass
                            )}
                          >
                            {typeCfg.label}
                          </Badge>
                        </td>

                        {/* Description */}
                        <td className="py-3 px-4">
                          <div className="flex flex-col min-w-0">
                            <span className="font-medium text-foreground text-xs truncate" title={req.description}>
                              {req.description}
                            </span>
                            {req.budgetLineCode && (
                              <span className="font-mono text-[10px] text-muted-foreground mt-0.5">
                                Line: {req.budgetLineCode}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Amount */}
                        <td className="py-3 px-4 text-right">
                          <Amount
                            value={req.amountFils}
                            className="font-semibold text-xs text-foreground"
                          />
                        </td>

                        {/* Status */}
                        <td className="py-3 px-3 text-center">
                          {req.status === "EXCEPTION" ? (
                            <Badge
                              variant="outline"
                              className="text-[10px] font-medium px-2 py-0.5 inline-flex items-center gap-1 bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/30 shadow-2xs"
                            >
                              <span className="size-1.5 rounded-full bg-red-500 shrink-0" />
                              <span>Exception</span>
                            </Badge>
                          ) : (
                            <StatusBadge
                              status={omsStatus}
                              size="sm"
                              className="inline-flex"
                            />
                          )}
                        </td>

                        {/* Owner */}
                        <td className="py-3 px-4">
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-semibold text-foreground truncate">
                              {req.ownerName}
                            </span>
                            <span className="text-[10px] text-muted-foreground truncate">
                              {req.departmentName}
                            </span>
                          </div>
                        </td>

                        {/* Requested On (formatted as "3 Aug 2026") */}
                        <td className="py-3 px-4 text-muted-foreground font-medium text-xs whitespace-nowrap">
                          {formattedDate}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
