"use client";

import {
  CheckCircle2,
  CircleAlert,
  Inbox,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/components/ui/utils";

import { HrReviewSlaBadge } from "./HrReviewSlaBadge";
import { HrReviewRequest } from "./hr-review.types";

interface HrReviewQueueProps {
  requests: HrReviewRequest[];
  selectedRequestId: string | null;
  onSelect: (
    requestId: string
  ) => void;
  slaTargetDays?: number;
}

const STATUS_STYLES: Record<
  HrReviewRequest["queueStatus"],
  string
> = {
  "Awaiting HR Review":
    "border-blue-200 bg-blue-50 text-blue-700",

  New:
    "border-cyan-200 bg-cyan-50 text-cyan-700",

  "Clarification Returned":
    "border-amber-200 bg-amber-50 text-amber-700",
};

export function HrReviewQueue({
  requests,
  selectedRequestId,
  onSelect,
  slaTargetDays = 3,
}: HrReviewQueueProps) {
  const overdueCount =
    requests.filter(
      (request) =>
        request.slaState === "overdue"
    ).length;

  return (
    <Card className="min-h-0 gap-0 overflow-hidden rounded-xl bg-white p-0 shadow-xs hover:translate-y-0">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-foreground">
            Review Queue
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            Select a request to begin the
            HR review.
          </p>
        </div>

        <Badge
          variant="secondary"
          className="rounded-full"
        >
          {requests.length}
        </Badge>
      </div>

      <div className="max-h-[620px] space-y-2 overflow-y-auto p-3">
        {requests.length === 0 ? (
          <div className="flex min-h-40 flex-col items-center justify-center text-center">
            <Inbox className="size-8 text-muted-foreground/60" />

            <p className="mt-3 text-sm font-medium">
              No requests found
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              Change the current filters
              to view more requests.
            </p>
          </div>
        ) : (
          requests.map((request) => {
            const isSelected =
              request.requestId ===
              selectedRequestId;

            return (
              <button
                key={request.id}
                type="button"
                aria-pressed={isSelected}
                onClick={() =>
                  onSelect(
                    request.requestId
                  )
                }
                className={cn(
                  "w-full rounded-xl border border-transparent p-3 text-left transition-colors",

                  "hover:border-primary/20 hover:bg-primary/5",

                  isSelected &&
                    "border-primary/40 bg-primary/5 shadow-[inset_3px_0_0_var(--color-primary)]"
                )}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={cn(
                      "mt-1 flex size-5 shrink-0 items-center justify-center rounded-full border",

                      isSelected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-slate-300 text-transparent"
                    )}
                  >
                    <CheckCircle2 className="size-3.5" />
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-mono text-xs font-semibold text-secondary">
                        {
                          request.requestId
                        }
                      </span>

                      <HrReviewSlaBadge
                        state={
                          request.slaState
                        }
                        ageDays={
                          request.slaAgeDays
                        }
                        targetDays={
                          request.slaTargetDays
                        }
                      />
                    </div>

                    <p className="mt-2 whitespace-normal text-sm font-semibold leading-5 text-foreground">
                      {request.position}
                    </p>

                    <p className="mt-1 truncate text-xs text-muted-foreground">
                      {request.department}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <Badge
                        variant="outline"
                        className={cn(
                          "rounded-md px-2 py-0.5 text-[10px]",

                          STATUS_STYLES[
                            request
                              .queueStatus
                          ]
                        )}
                      >
                        {
                          request.queueStatus
                        }
                      </Badge>

                      {request.budgetVerified && (
                        <Badge
                          variant="outline"
                          className="rounded-md border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] text-emerald-700"
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

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border bg-slate-50/70 px-4 py-3">
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <CircleAlert className="size-3.5" />

          SLA target: {slaTargetDays}{" "}
          business days
        </span>

        <span
          className={cn(
            "text-xs font-semibold",

            overdueCount > 0
              ? "text-red-600"
              : "text-emerald-600"
          )}
        >
          {overdueCount} of{" "}
          {requests.length} overdue
        </span>
      </div>
    </Card>
  );
}