"use client";

import { CheckCircle2, CircleAlert, Inbox } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/components/ui/utils";
import { HrReviewQueueItem } from "@/types/hr-review";

interface HrReviewQueueProps {
  requests: HrReviewQueueItem[];
  selectedRequestId: string | null;
  onSelect: (requestId: string) => void;
  slaTargetDays?: number;
  totalCount: number;
  overdueCount: number;
  isLoading?: boolean;
  positionLabel?: string;
  hasActiveFilters?: boolean;
  onClearFilters?: () => void;
}

export function HrReviewQueue({
  requests,
  selectedRequestId,
  onSelect,
  slaTargetDays = 3,
  totalCount,
  overdueCount,
  isLoading = false,
  positionLabel,
  hasActiveFilters = false,
  onClearFilters,
}: HrReviewQueueProps) {
  return (
    <Card className="sticky top-6 flex h-[calc(100vh-156px)] min-h-[500px] flex-col overflow-hidden rounded-md bg-card p-0 shadow-xs hover:translate-y-0">
      <div className="flex items-center justify-between border-b border-border/70 px-3.5 py-2.5 shrink-0 bg-muted/20">
        <div>
          <p className="text-[13px] font-semibold text-foreground">Review Queue</p>
        </div>

        <div className="flex items-center gap-1.5">
          {overdueCount > 0 && (
            <Badge
              variant="outline"
              className="rounded-full border-amber-500/30 bg-amber-500/10 px-2 py-0 text-[10.5px] font-medium text-amber-600 dark:text-amber-400 tabular-nums h-5 flex items-center gap-1"
            >
              <CircleAlert className="size-2.5" />
              {overdueCount} overdue
            </Badge>
          )}
          <Badge variant="secondary" className="rounded-full text-[11px] font-medium tabular-nums h-5 px-2 py-0">
            {totalCount}
          </Badge>
        </div>
      </div>

      <div className="flex-1 space-y-1.5 overflow-y-auto p-2.5">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="w-full rounded-md border border-border/40 p-2.5 space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <Skeleton className="h-4 w-3/5" />
                <Skeleton className="h-3 w-10" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-3 w-2/5" />
                <Skeleton className="h-3 w-14" />
              </div>
              <div className="flex gap-1.5 pt-0.5">
                <Skeleton className="h-4 w-16 rounded" />
                <Skeleton className="h-4 w-20 rounded" />
              </div>
            </div>
          ))
        ) : requests.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            {hasActiveFilters ? (
              <>
                <Inbox className="size-8 text-muted-foreground/60" />
                <p className="mt-3 text-[13px] font-medium text-foreground">
                  No requests match these filters
                </p>
                {onClearFilters && (
                  <button
                    onClick={onClearFilters}
                    className="mt-3 text-[12px] font-medium text-primary hover:underline cursor-pointer"
                  >
                    Clear filters
                  </button>
                )}
              </>
            ) : (
              <>
                <Inbox className="size-8 text-success/60" />
                <p className="mt-3 text-[13px] font-medium text-success">
                  Nothing waiting for review.
                </p>
                <p className="mt-1 text-[12px] font-normal text-muted-foreground">
                  You&apos;re all caught up!
                </p>
              </>
            )}
          </div>
        ) : (
          requests.map((request) => {
            const isSelected = request.requestId === selectedRequestId;
            const isOverdue = request.sla.breached;
            const hasBadges =
              isOverdue ||
              request.returnedFromClarification ||
              request.flags.includes("NEW") ||
              request.flags.includes("BUDGET_VERIFIED");

            return (
              <button
                key={request.requestId}
                type="button"
                aria-pressed={isSelected}
                onClick={() => onSelect(request.requestId)}
                className={cn(
                  "group relative w-full text-left rounded-md px-3 py-2 transition-all duration-150 border cursor-pointer select-none overflow-hidden",
                  isSelected
                    ? "bg-brand-teal/[0.08] dark:bg-brand-teal/[0.14] border-brand-teal/60 shadow-xs"
                    : isOverdue
                      ? "bg-amber-500/[0.04] border-amber-500/25 hover:bg-amber-500/[0.07] hover:border-amber-500/40"
                      : "bg-card border-border/60 hover:bg-muted/40 hover:border-border"
                )}
              >
                {/* Sleek left accent indicator pill */}
                {isSelected ? (
                  <div className="absolute left-0 inset-y-1.5 w-[3px] rounded-r bg-brand-teal shadow-[0_0_8px_rgba(35,135,156,0.5)]" />
                ) : isOverdue ? (
                  <div className="absolute left-0 inset-y-2 w-[2.5px] rounded-r bg-amber-500/80" />
                ) : null}

                {/* Header: Position Title & Age */}
                <div className="flex items-start justify-between gap-2">
                  <p
                    className={cn(
                      "text-[13px] font-semibold leading-snug truncate",
                      isSelected
                        ? "text-brand-teal dark:text-brand-teal"
                        : "text-foreground group-hover:text-foreground"
                    )}
                  >
                    {request.position}
                  </p>

                  <span className="text-[11px] font-medium text-muted-foreground/80 tabular-nums shrink-0 mt-0.5">
                    {request.ageDays}d old
                  </span>
                </div>

                {/* Subheader: Department & Request ID */}
                <div className="flex items-center gap-1.5 text-[11.5px] text-muted-foreground/90 mt-0.5">
                  <span className="truncate max-w-[170px] font-normal">
                    {request.department.name}
                  </span>
                  <span className="text-muted-foreground/30">•</span>
                  <span className="font-mono text-[10.5px] text-muted-foreground/70 shrink-0">
                    {request.requestId}
                  </span>
                </div>

                {/* Badges row */}
                {hasBadges && (
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    {isOverdue && (
                      <span className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25 tabular-nums">
                        <CircleAlert className="size-2.5 shrink-0" />
                        {request.sla.overdueDays}d overdue
                      </span>
                    )}

                    {request.flags.includes("BUDGET_VERIFIED") && (
                      <span className="inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
                        Budget verified
                      </span>
                    )}

                    {request.returnedFromClarification && (
                      <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/25">
                        Returned
                      </span>
                    )}

                    {request.flags.includes("NEW") && (
                      <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/25">
                        New
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/70 bg-muted/20 px-3.5 py-2.5 shrink-0 text-[11.5px] text-muted-foreground">
        <span className="inline-flex items-center gap-1.5 font-normal tabular-nums">
          SLA target: {slaTargetDays}d
        </span>
        <div className="flex items-center gap-3 font-normal tabular-nums">
          {positionLabel && <span className="font-medium text-foreground">{positionLabel}</span>}
          <span className="text-muted-foreground/70 hidden sm:inline-block">Press <kbd className="bg-card border border-border px-1 py-0.5 rounded text-[10px]">?</kbd> for shortcuts</span>
        </div>
      </div>
    </Card>
  );
}