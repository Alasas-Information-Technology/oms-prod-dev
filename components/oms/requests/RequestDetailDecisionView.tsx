"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { format } from "date-fns";
import {
  ApprovalTaskDetail,
  RequisitionSubject,
  RequisitionImpact,
} from "@/lib/types/approval.types";
import {
  PageBarBreadcrumbs,
} from "@/components/ui/layouts/page-bar-context";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  ApprovalRouteStepper,
  ApprovalSubjectDetail,
  ApprovalHistory,
  ApprovalImpactPanel,
  ApprovalPreflightPanel,
  ApprovalDecisionBar,
} from "@/components/oms/approvals";
import { TabsButton } from "@/components/shared/TabsButton";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck,
  Clock3,
  ArrowLeft,
  FileText,
  Paperclip,
  Download,
} from "lucide-react";

interface RequestDetailDecisionViewProps {
  detail: ApprovalTaskDetail;
  onRefresh?: () => void;
}

type DetailTab = "details" | "documents" | "timeline";

export function RequestDetailDecisionView({
  detail,
  onRefresh,
}: RequestDetailDecisionViewProps) {
  const searchParams = useSearchParams();
  const actionParam = searchParams.get("action");

  const [activeTab, setActiveTab] = React.useState<DetailTab>("details");
  const decisionPanelRef = React.useRef<HTMLDivElement>(null);

  const { task, route, subject, impact, preflight, history, canAct, actingFor, readOnlyReason } = detail;

  // Requirement 6: ?action=approve scrolls the decision panel into view and focuses it
  React.useEffect(() => {
    if (actionParam === "approve" && decisionPanelRef.current) {
      decisionPanelRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [actionParam]);

  // Derive current assignee info for read-only banner
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

  const tabs: { value: DetailTab; label: string; badge?: number }[] = [
    { value: "details", label: "Request Details" },
    {
      value: "documents",
      label: "Documents & Evidence",
      badge: subject?.attachments?.length || (subject?.evidence?.supportingDocumentCount ? subject.evidence.supportingDocumentCount + 1 : undefined),
    },
    { value: "timeline", label: "Audit Timeline", badge: history?.length },
  ];

  return (
    <div className="flex flex-col min-h-full animate-in fade-in-50 duration-300 pb-16 relative">
      {/* Requirement 8: Delegated View Persistent Sticky Banner */}
      {actingFor && (
        <div className="sticky top-0 z-30 bg-indigo-950 text-indigo-100 px-6 py-3 shadow-md border-b border-indigo-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-xs sm:text-sm font-medium">
            <ShieldCheck className="size-4 text-indigo-400 shrink-0" />
            <span>
              You&apos;re acting for <strong>{actingFor.name}</strong> until 15 Aug. Your decision will be recorded under both names.
            </span>
          </div>
          <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded bg-indigo-800 text-indigo-200">
            Delegated Mode
          </span>
        </div>
      )}

      {/* Header Breadcrumb per APP-SHELL-SPEC.md */}
      <PageBarBreadcrumbs
        crumbs={[
          { label: "OMS Requests", href: "/app/requests?tab=needs-my-action" },
          { label: task.title, isCurrent: true },
        ]}
      />

      <div className="px-4 sm:px-6 pt-5 pb-4 space-y-6 max-w-[1680px] w-full mx-auto">
        {/* Top Navigation & Back Link */}
        <div className="flex items-center justify-between">
          <Link
            href="/app/requests?tab=needs-my-action"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-3.5" />
            <span>Back to Needs My Action</span>
          </Link>
        </div>

        {/* Read-Only Status Line when canAct is false (Requirement 4) */}
        {!canAct && (
          <div className="p-3.5 rounded-lg bg-muted/50 border border-border/70 text-xs text-foreground font-medium flex items-center gap-2.5 shadow-xs">
            <Clock3 className="size-4 text-muted-foreground shrink-0" />
            <span>{readOnlyLine}</span>
          </div>
        )}

        {/* Request Title & Stage Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 border-b border-border/40 pb-5">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="font-mono text-xs font-semibold bg-muted border border-border/50 px-2 py-0.5 rounded text-foreground">
                {task.subjectRef}
              </span>
              <span>&middot;</span>
              <span className="font-medium text-foreground">{task.context}</span>
            </div>
            <h1 className="text-xl font-bold text-foreground tracking-tight">
              {task.title}
            </h1>
          </div>

          <div className="flex flex-col sm:items-end gap-1.5 shrink-0">
            <StatusBadge status="pending" label={task.stage.label} />
            <span className="text-xs text-muted-foreground">
              Submitted {format(new Date(task.submittedAt), "MMM d, yyyy")}
            </span>
          </div>
        </div>

        {/* Requirement 1 & 2: Route Stepper below header for everyone in scope */}
        <div className="py-2 border-b border-border/40 pb-4 w-full">
          <ApprovalRouteStepper route={route} className="w-full" />
        </div>

        {/* Main Body: 2 Columns (1fr 420px) */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-8">
          {/* Left Column: Request Tabs & Content (Requirement 5) */}
          <div className="flex flex-col gap-6 min-w-0">
            {/* Tab Bar */}
            <div className="border-b border-border/40 pb-2">
              <TabsButton
                tabs={tabs}
                value={activeTab}
                onValueChange={(v) => setActiveTab(v as DetailTab)}
              />
            </div>

            {/* Tab 1: Request Details */}
            {activeTab === "details" && (
              <div className="space-y-6 animate-in fade-in-50 duration-200">
                <div className="p-6 rounded-lg border border-border/60 bg-card shadow-xs">
                  <ApprovalSubjectDetail subject={subject as RequisitionSubject} />
                </div>
                <div className="p-6 rounded-lg border border-border/60 bg-card shadow-xs">
                  <ApprovalHistory history={history} />
                </div>
              </div>
            )}

            {/* Tab 2: Documents & Evidence */}
            {activeTab === "documents" && (
              <div className="p-6 rounded-lg border border-border/60 bg-card shadow-xs space-y-5 animate-in fade-in-50 duration-200">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Attached Documents</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Job descriptions, business cases, and supporting documentation.
                  </p>
                </div>

                <div className="divide-y divide-border/40">
                  <div className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        <FileText className="size-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-foreground">
                          Job_Description_{task.subjectRef}.pdf
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Official position description & competencies &middot; 245 KB
                        </span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground hover:text-foreground">
                      <Download className="size-3.5" />
                      Download
                    </Button>
                  </div>

                  <div className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
                        <Paperclip className="size-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-foreground">
                          Operating_Plan_Alignment_Q3.xlsx
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Budget allocation justification &middot; 1.2 MB
                        </span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground hover:text-foreground">
                      <Download className="size-3.5" />
                      Download
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Timeline */}
            {activeTab === "timeline" && (
              <div className="p-6 rounded-lg border border-border/60 bg-card shadow-xs animate-in fade-in-50 duration-200">
                <ApprovalHistory history={history} />
              </div>
            )}
          </div>

          {/* Right Column: Decision Panel (Requirement 3) */}
          <div ref={decisionPanelRef} className="flex flex-col gap-6">
            <ApprovalImpactPanel impact={impact as RequisitionImpact} />
            <ApprovalPreflightPanel preflight={preflight} />
            
            {/* Requirement 3: Sticky decision bar at the bottom when canAct is true */}
            <ApprovalDecisionBar
              detail={detail}
              onSuccess={onRefresh}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
