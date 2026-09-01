"use client";

import { ReactNode } from "react";
import { format } from "date-fns";
import { ApprovalTaskDetail } from "@/lib/types/approval.types";
import { PageBarBreadcrumbs } from "@/components/ui/layouts/page-bar-context";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ApprovalRouteStepper } from "./ApprovalRouteStepper";
import { ShieldCheck, Clock3 } from "lucide-react";

interface ApprovalDetailShellProps {
  detail: ApprovalTaskDetail;
  /** Content for the left 1fr column (e.g. subject details) */
  leftColumn?: ReactNode;
  /** Content for the right 420px column (e.g. decision bar, impact, preflight) */
  rightColumn?: ReactNode;
}

export function ApprovalDetailShell({
  detail,
  leftColumn,
  rightColumn,
}: ApprovalDetailShellProps) {
  const { task, route, canAct, actingFor, readOnlyReason } = detail;

  // Derive current assignee from the current stage in route
  const currentStage = route.find((s) => s.state === "CURRENT");
  const currentAssigneeName =
    currentStage?.user?.name ||
    task.assignment.claimedBy?.name ||
    (task.assignment.mode === "ROLE_QUEUE" ? "Role Queue" : "Assigned Approver");

  const formattedAssignedDate = task.assignedAt
    ? format(new Date(task.assignedAt), "d MMM")
    : "";

  const readOnlyLine =
    readOnlyReason ||
    `Awaiting ${task.stage.label} — ${currentAssigneeName}${
      formattedAssignedDate ? `, since ${formattedAssignedDate}` : ""
    }.`;

  return (
    <div className="flex flex-col h-full animate-in fade-in-50 duration-300 pb-12 relative">
      {/* Delegated View: Persistent Sticky Banner per Part 4.5 */}
      {actingFor && (
        <div className="sticky top-0 z-30 bg-indigo-950 text-indigo-100 px-6 py-3 shadow-md border-b border-indigo-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-xs sm:text-sm font-medium">
            <ShieldCheck className="size-4 text-indigo-400 shrink-0" />
            <span>
              You&apos;re acting for <strong>{actingFor.name}</strong>. Your
              decision will be recorded under both names in the audit trail.
            </span>
          </div>
          <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-800 text-indigo-200">
            Delegated Mode
          </span>
        </div>
      )}

      {/* 1. Header: Breadcrumb acts as page title per APP-SHELL-SPEC.md */}
      <PageBarBreadcrumbs
        crumbs={[
          { label: "OMS Requests", href: "/app/requests?tab=needs-my-action" },
          { label: task.title, isCurrent: true },
        ]}
      />

      <div className="px-6 pt-6 pb-2 space-y-6">
        {/* Read-Only View Top Status Line per Part 4.4 */}
        {!canAct && (
          <div className="p-3.5 rounded-lg bg-muted/50 border border-border/70 text-xs text-foreground font-medium flex items-center gap-2.5">
            <Clock3 className="size-4 text-muted-foreground shrink-0" />
            <span>{readOnlyLine}</span>
          </div>
        )}

        {/* Context Header */}
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="font-mono text-[11px] font-medium bg-muted/50 border border-border/40 px-1.5 py-0.5 rounded text-foreground">
                {task.subjectRef}
              </span>
              <span>&middot;</span>
              <span>{task.context}</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <StatusBadge status="pending" label={task.stage.label} />
            <span className="text-xs text-muted-foreground">
              Submitted {format(new Date(task.submittedAt), "MMM d, yyyy")}
            </span>
          </div>
        </div>

        {/* 2. Route Stepper */}
        <div className="py-2 border-b border-border/40 pb-6">
          <ApprovalRouteStepper route={route} />
        </div>

        {/* 3. Two-Column Body */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-6">
          <div className="flex flex-col gap-6">
            {leftColumn}
          </div>
          <div className="flex flex-col gap-6">
            {rightColumn}
          </div>
        </div>
      </div>
    </div>
  );
}
