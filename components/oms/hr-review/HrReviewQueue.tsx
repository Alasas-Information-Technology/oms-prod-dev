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
    <Card className="sticky top-6 flex h-[calc(100vh-156px)] min-h-[500px] flex-col overflow-hidden rounded-xl bg-card p-0 shadow-xs hover:translate-y-0">
      <div className="flex items-center justify-between border-b border-border px-4 py-3 shrink-0">
        <div>
          <p className="text-[14px] font-[600] text-foreground">Review queue</p>
        </div>

        <div className="flex items-center gap-2">
          {overdueCount > 0 && (
            <Badge
              variant="outline"
              className="rounded-full border-warning/30 bg-warning-light px-2 py-0.5 text-[11px] font-medium text-warning tabular-nums"
            >
              {overdueCount} overdue
            </Badge>
          )}
          <Badge variant="secondary" className="rounded-full text-[11px] font-medium tabular-nums">
            {totalCount}
          </Badge>
        </div>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto p-3">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="w-full rounded-xl border border-transparent p-3 h-[88px]">
              <div className="flex items-start gap-3">
                <Skeleton className="mt-1 size-5 rounded-full shrink-0" />
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <div className="mt-3 flex gap-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
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
                    className="mt-3 text-[12px] font-medium text-primary hover:underline"
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

            return (
              <button
                key={request.requestId}
                type="button"
                aria-pressed={isSelected}
                onClick={() => onSelect(request.requestId)}
                className={cn(
                  "w-full rounded-xl border border-transparent p-3 text-left transition-colors relative overflow-hidden",
                  "hover:border-brand-teal/50 hover:bg-accent",
                  isSelected && "border-brand-teal bg-brand-teal/10",
                  isOverdue && !isSelected && "border-warning/30 bg-warning-light/30",
                  isSelected && isOverdue && "border-brand-teal bg-brand-teal/10" // Selected overrides overdue bg
                )}
              >
                {/* Left accent borders */}
                {isSelected && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-teal" />
                )}
                {!isSelected && isOverdue && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-warning-light0" />
                )}

                <div className="flex items-start gap-3">
                  <span
                    className={cn(
                      "mt-1 flex size-5 shrink-0 items-center justify-center rounded-full border",
                      isSelected
                        ? "border-brand-teal bg-brand-teal text-white"
                        : "border-slate-300 text-transparent"
                    )}
                  >
                    <CheckCircle2 className="size-3.5" />
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-mono text-[11px] font-medium text-muted-foreground">
                        {request.requestId}
                      </span>
                      
                      <span className="text-[12px] font-normal text-muted-foreground tabular-nums">
                        {request.ageDays} {request.ageDays === 1 ? 'day' : 'days'} old
                      </span>
                    </div>

                    <p className="mt-2 whitespace-normal text-[14px] font-medium leading-5 text-foreground">
                      {request.position}
                    </p>

                    <p className="mt-1 truncate text-[12px] font-normal text-muted-foreground">
                      {request.department.name}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {isOverdue && (
                        <Badge
                          variant="outline"
                          className="rounded-md border-warning/30 bg-warning-light px-2 py-0.5 text-[11px] font-medium text-warning tabular-nums"
                        >
                          <CircleAlert className="size-3 mr-1" />
                          {request.sla.overdueDays} {request.sla.overdueDays === 1 ? 'day' : 'days'} overdue
                        </Badge>
                      )}

                      {request.returnedFromClarification && (
                        <Badge
                          variant="outline"
                          className="rounded-md border-transparent bg-muted px-2 py-0.5 text-[11px] font-medium text-foreground-secondary"
                        >
                          Returned
                        </Badge>
                      )}

                      {request.flags.includes("NEW") && (
                        <Badge
                          variant="outline"
                          className="rounded-md border-transparent bg-muted px-2 py-0.5 text-[11px] font-medium text-foreground-secondary"
                        >
                          New
                        </Badge>
                      )}

                      {request.flags.includes("BUDGET_VERIFIED") && (
                        <Badge
                          variant="outline"
                          className="rounded-md border-success/30 bg-success-light px-2 py-0.5 text-[11px] font-medium text-success"
                        >
                          Budget verified
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border bg-muted/30 px-4 py-3 shrink-0">
        <span className="inline-flex items-center gap-1.5 text-[12px] font-normal text-muted-foreground tabular-nums">
          SLA target: {slaTargetDays} business days
        </span>
        <div className="flex items-center gap-4 text-[12px] font-normal tabular-nums">
          {positionLabel && <span className="text-foreground">{positionLabel}</span>}
          <span className="text-muted-foreground hidden sm:inline-block">Press <kbd className="font-mono bg-card border border-border px-1 rounded mx-0.5">?</kbd> for shortcuts</span>
        </div>
      </div>
    </Card>
  );
}