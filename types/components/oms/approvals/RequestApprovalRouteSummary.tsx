"use client";

import Link from "next/link";
import { ApprovalRouteStepper } from "./ApprovalRouteStepper";
import { ApprovalStage } from "@/lib/types/approval.types";
import { Clock3, ArrowRight, ShieldCheck } from "lucide-react";
import { format } from "date-fns";

interface RequestApprovalRouteSummaryProps {
  requestId: string;
  route?: ApprovalStage[];
  currentStageName?: string;
  currentOwnerName?: string;
  assignedAt?: string;
  approvalDetailTaskId?: string;
}

const DEFAULT_ROUTE: ApprovalStage[] = [
  { index: 1, code: "REQUESTOR", label: "Requestor", state: "COMPLETE", user: { id: "u-103", name: "Omar Tariq" }, at: "2026-08-04T09:18:00Z" },
  { index: 2, code: "LINE_MANAGER", label: "Line Manager", state: "COMPLETE", user: { id: "u-102", name: "Fatima Al Hashimi" }, at: "2026-08-04T14:42:00Z" },
  { index: 3, code: "SECTION_HEAD", label: "Section Head", state: "COMPLETE", user: { id: "u-104", name: "Sarah Connor" }, at: "2026-08-05T10:06:00Z" },
  { index: 4, code: "HOD", label: "HOD Approval", state: "CURRENT", user: { id: "u-101", name: "Khalid Al Suwaidi" } },
  { index: 5, code: "HR_REVIEW", label: "HR Review", state: "PENDING" },
  { index: 6, code: "PROCUREMENT", label: "Procurement", state: "PENDING" },
];

export function RequestApprovalRouteSummary({
  requestId,
  route = DEFAULT_ROUTE,
  currentStageName = "HOD Approval",
  currentOwnerName = "Khalid Al Suwaidi",
  assignedAt = "2026-08-05T10:06:00Z",
  approvalDetailTaskId = "baseline",
}: RequestApprovalRouteSummaryProps) {
  const currentStage = route.find((s) => s.state === "CURRENT");
  const assignee = currentStage?.user?.name || currentOwnerName;
  const formattedDate = assignedAt ? format(new Date(assignedAt), "d MMM") : "";

  return (
    <div className="rounded-lg border border-border/70 bg-card p-5 shadow-xs flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border/50 pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="size-7 rounded-md bg-primary/10 text-primary flex items-center justify-center">
            <ShieldCheck className="size-4" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground tracking-tight">
              Governance & Approval Route
            </h4>
            <p className="text-[11px] text-muted-foreground">
              Real-time multi-stage approval authorization track
            </p>
          </div>
        </div>

        <Link
          href={`/app/requests/${requestId || approvalDetailTaskId}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors shrink-0"
        >
          <span>View Request & Governance Detail</span>
          <ArrowRight className="size-3.5" />
        </Link>
      </div>

      {/* Read-Only Status Banner */}
      <div className="p-3 rounded-md bg-muted/40 border border-border/60 text-xs text-foreground font-medium flex items-center gap-2.5">
        <Clock3 className="size-4 text-muted-foreground shrink-0" />
        <span>
          Awaiting <strong className="font-semibold text-foreground">{currentStage?.label || currentStageName}</strong> — {assignee}
          {formattedDate ? `, since ${formattedDate}` : ""}.
        </span>
      </div>

      {/* Embedded Route Stepper with Full Width */}
      <div className="pt-2 w-full px-1 sm:px-2">
        <ApprovalRouteStepper route={route} className="w-full" />
      </div>
    </div>
  );
}
