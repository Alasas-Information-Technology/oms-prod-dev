"use client";

import Link from "next/navigation";
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
    <div className="rounded-xl border border-border/70 bg-card/60 p-4 sm:p-5 flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border/40 pb-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">
            Governance & Approval Route
          </span>
        </div>
        <a
          href={`/app/approvals/${approvalDetailTaskId}`}
          className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 shrink-0"
        >
          <span>View Read-Only Approval Detail</span>
          <ArrowRight className="size-3.5" />
        </a>
      </div>

      {/* Read-Only Status Banner */}
      <div className="p-3 rounded-lg bg-muted/50 border border-border/60 text-xs text-foreground font-medium flex items-center gap-2">
        <Clock3 className="size-4 text-muted-foreground shrink-0" />
        <span>
          Awaiting {currentStage?.label || currentStageName} — {assignee}
          {formattedDate ? `, since ${formattedDate}` : ""}.
        </span>
      </div>

      {/* Embedded Route Stepper */}
      <div className="pt-1">
        <ApprovalRouteStepper route={route} />
      </div>
    </div>
  );
}
