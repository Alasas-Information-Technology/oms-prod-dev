"use client";

import { format } from "date-fns";
import { History, Undo2 } from "lucide-react";

import { StatusBadge, OMSStatus } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import { LeaveRequestRecord, LeaveRequestStatus } from "./leave.types";

interface LeaveHistoryProps {
  requests: LeaveRequestRecord[];
  onWithdraw: (requestId: string) => void;
}

const STATUS_MAP: Record<LeaveRequestStatus, { status: OMSStatus; label: string }> = {
  approved: { status: "approved", label: "Approved" },
  pending: { status: "pending", label: "Pending" },
  rejected: { status: "rejected", label: "Rejected" },
  withdrawn: { status: "cancelled", label: "Withdrawn" },
};

function formatRange(request: LeaveRequestRecord) {
  if (request.startDate.toDateString() === request.endDate.toDateString()) {
    return format(request.startDate, "dd MMM yyyy");
  }

  return `${format(request.startDate, "dd MMM")} – ${format(request.endDate, "dd MMM yyyy")}`;
}

export function LeaveHistory({ requests, onWithdraw }: LeaveHistoryProps) {
  return (
    <Card className="gap-4 rounded-xl border border-border/60 bg-card p-5 shadow-xs hover:translate-y-0">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <History className="size-4" />
          </span>
          <div>
            <h2 className="text-sm font-semibold text-foreground">Leave History</h2>
            <p className="mt-1 text-xs text-muted-foreground">Recent requests and their current status.</p>
          </div>
        </div>

        <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
          {requests.length}
        </span>
      </div>

      <div className="hidden overflow-hidden rounded-xl border border-border/70 lg:block">
        <div className="grid grid-cols-[1fr_1.1fr_0.55fr_0.6fr_0.8fr_auto] gap-3 bg-muted/50 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          <span>Request</span>
          <span>Dates</span>
          <span>Days</span>
          <span>Paid</span>
          <span>Status</span>
          <span className="text-right">Action</span>
        </div>

        {requests.map((request) => {
          const status = STATUS_MAP[request.status];
          return (
            <div
              key={request.id}
              className="grid grid-cols-[1fr_1.1fr_0.55fr_0.6fr_0.8fr_auto] items-center gap-3 border-t border-border/60 px-4 py-3 text-xs"
            >
              <div className="min-w-0">
                <p className="truncate font-semibold text-foreground">{request.id}</p>
                <p className="mt-0.5 truncate text-muted-foreground">{request.typeLabel}</p>
              </div>
              <span className="text-foreground-secondary">{formatRange(request)}</span>
              <span className="font-medium tabular-nums text-foreground">{request.duration}</span>
              <span className="text-foreground-secondary">{request.paid ? "Yes" : "No"}</span>
              <StatusBadge status={status.status} label={status.label} size="sm" />
              <div className="flex justify-end">
                {request.status === "pending" ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 gap-1.5 text-xs"
                    onClick={() => onWithdraw(request.id)}
                  >
                    <Undo2 className="size-3.5" />
                    Withdraw
                  </Button>
                ) : (
                  <span className="px-2 text-muted-foreground">—</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="space-y-3 lg:hidden">
        {requests.map((request) => {
          const status = STATUS_MAP[request.status];
          return (
            <div key={request.id} className="rounded-xl border border-border/70 p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">{request.typeLabel}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{request.id}</p>
                </div>
                <StatusBadge status={status.status} label={status.label} size="sm" />
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-muted-foreground">Dates</p>
                  <p className="mt-1 font-medium text-foreground">{formatRange(request)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Duration</p>
                  <p className="mt-1 font-medium text-foreground">{request.duration} day(s)</p>
                </div>
              </div>

              {request.status === "pending" && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-3 w-full gap-1.5"
                  onClick={() => onWithdraw(request.id)}
                >
                  <Undo2 className="size-3.5" />
                  Withdraw Request
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
