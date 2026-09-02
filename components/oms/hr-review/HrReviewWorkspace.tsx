"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  Inbox,
  ShieldAlert,
} from "lucide-react";

import { Card } from "@/components/ui/card";

import { BudgetPositionPanel } from "./BudgetPositionPanel";
import { DepartmentApprovalTrail } from "./DepartmentApprovalTrail";
import { HrDispositionPanel } from "./HrDispositionPanel";
import {
  HrReviewFilters,
  HrReviewSlaFilter,
  HrReviewStatusFilter,
} from "./HrReviewFilters";
import { HrReviewAttachments } from "./HrReviewAttachments";
import { HrReviewAudit } from "./HrReviewAudit";
import { HrReviewOverview } from "./HrReviewOverview";
import { HrReviewQueue } from "./HrReviewQueue";
import { HrReviewRequestSummary } from "./HrReviewRequestSummary";
import { HrReviewTabs } from "./HrReviewTabs";
import {
  HR_DISPOSITION_ACTIONS,
  MOCK_HR_REVIEW_REQUESTS,
} from "./hr-review.mock-data";
import {
  HrDispositionSubmission,
  HrReviewTab,
} from "./hr-review.types";

function MetricCard({
  label,
  value,
  description,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: number;
  description: string;
  icon: React.ComponentType<{
    className?: string;
  }>;
  tone?: "default" | "warning" | "danger";
}) {
  return (
    <Card className="gap-3 rounded-xl bg-white p-4 shadow-xs hover:translate-y-0">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-muted-foreground">
            {label}
          </p>

          <p className="mt-2 text-2xl font-semibold text-foreground">
            {value}
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            {description}
          </p>
        </div>

        <span
          className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${
            tone === "danger"
              ? "bg-red-100 text-red-700"
              : tone === "warning"
                ? "bg-amber-100 text-amber-700"
                : "bg-primary/10 text-primary"
          }`}
        >
          <Icon className="size-4" />
        </span>
      </div>
    </Card>
  );
}

export function HrReviewWorkspace() {
  const [search, setSearch] =
    useState("");

  const [status, setStatus] =
    useState<HrReviewStatusFilter>(
      "all"
    );

  const [sla, setSla] =
    useState<HrReviewSlaFilter>(
      "all"
    );

  const [department, setDepartment] =
    useState("all");

  const [selectedRequestId, setSelectedRequestId] =
    useState<string | null>(
      MOCK_HR_REVIEW_REQUESTS[0]?.requestId ??
        null
    );

  const [activeTab, setActiveTab] =
    useState<HrReviewTab>("overview");

  const departments = useMemo(
    () =>
      Array.from(
        new Set(
          MOCK_HR_REVIEW_REQUESTS.map(
            (request) =>
              request.department
          )
        )
      ).sort((first, second) =>
        first.localeCompare(second)
      ),
    []
  );

  const filteredRequests = useMemo(() => {
    const normalizedSearch =
      search.trim().toLowerCase();

    return MOCK_HR_REVIEW_REQUESTS.filter(
      (request) => {
        const matchesSearch =
          normalizedSearch === "" ||
          request.requestId
            .toLowerCase()
            .includes(normalizedSearch) ||
          request.position
            .toLowerCase()
            .includes(normalizedSearch) ||
          request.department
            .toLowerCase()
            .includes(normalizedSearch);

        const matchesStatus =
          status === "all" ||
          request.queueStatus === status;

        const matchesSla =
          sla === "all" ||
          request.slaState === sla;

        const matchesDepartment =
          department === "all" ||
          request.department === department;

        return (
          matchesSearch &&
          matchesStatus &&
          matchesSla &&
          matchesDepartment
        );
      }
    );
  }, [
    search,
    status,
    sla,
    department,
  ]);

  useEffect(() => {
    if (
      selectedRequestId &&
      filteredRequests.some(
        (request) =>
          request.requestId ===
          selectedRequestId
      )
    ) {
      return;
    }

    setSelectedRequestId(
      filteredRequests[0]?.requestId ??
        null
    );
  }, [
    filteredRequests,
    selectedRequestId,
  ]);

  const selectedRequest =
    filteredRequests.find(
      (request) =>
        request.requestId ===
        selectedRequestId
    ) ?? null;

  const overdueCount =
    MOCK_HR_REVIEW_REQUESTS.filter(
      (request) =>
        request.slaState === "overdue"
    ).length;

  const dueSoonCount =
    MOCK_HR_REVIEW_REQUESTS.filter(
      (request) =>
        request.slaState === "due-soon"
    ).length;

  const reviewRequiredCount =
    MOCK_HR_REVIEW_REQUESTS.filter(
      (request) =>
        request.complianceChecks.some(
          (check) =>
            check.state ===
            "review-required"
        )
    ).length;

  function clearFilters() {
    setSearch("");
    setStatus("all");
    setSla("all");
    setDepartment("all");
  }

  async function handleDisposition(
    submission: HrDispositionSubmission
  ) {
    // Design-only until the backend endpoint is added.
    console.log(
      "HR disposition submission:",
      submission
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">
            Outsource Management
            System
          </p>

          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
            HR Review
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
            Review approved workforce
            requests, validate compliance
            and funding, and submit the
            final HR disposition.
          </p>
        </div>

        <div className="inline-flex w-fit items-center gap-2 rounded-lg border border-border bg-white px-3 py-2 text-xs text-muted-foreground shadow-xs">
          <Clock3 className="size-4 text-primary" />

          SLA target: 3 business days
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="In Review Queue"
          value={
            MOCK_HR_REVIEW_REQUESTS.length
          }
          description="Requests requiring HR action"
          icon={Inbox}
        />

        <MetricCard
          label="Due Today"
          value={dueSoonCount}
          description="Requests at SLA target"
          icon={Clock3}
          tone="warning"
        />

        <MetricCard
          label="Overdue"
          value={overdueCount}
          description="Requests beyond SLA target"
          icon={ShieldAlert}
          tone="danger"
        />

        <MetricCard
          label="Policy Review"
          value={reviewRequiredCount}
          description="Requests with flagged checks"
          icon={ClipboardCheck}
          tone="warning"
        />
      </div>

      <HrReviewFilters
        search={search}
        status={status}
        sla={sla}
        department={department}
        departments={departments}
        overdueCount={overdueCount}
        onSearchChange={setSearch}
        onStatusChange={setStatus}
        onSlaChange={setSla}
        onDepartmentChange={
          setDepartment
        }
        onClear={clearFilters}
      />

      <div className="grid min-h-0 gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
        <HrReviewQueue
          requests={filteredRequests}
          selectedRequestId={
            selectedRequestId
          }
          onSelect={(requestId) => {
            setSelectedRequestId(
              requestId
            );
            setActiveTab("overview");
          }}
        />

        {selectedRequest ? (
          <div className="min-w-0 space-y-4">
            <HrReviewRequestSummary
              request={selectedRequest}
            />

            <HrReviewTabs
              value={activeTab}
              onValueChange={setActiveTab}
              attachmentCount={
                selectedRequest
                  .attachments.length
              }
              auditCount={
                selectedRequest.audit
                  .length
              }
            />

            <div className="grid min-w-0 gap-4 2xl:grid-cols-[minmax(0,1fr)_340px]">
              <div className="min-w-0">
                {activeTab ===
                  "overview" && (
                  <HrReviewOverview
                    request={
                      selectedRequest
                    }
                  />
                )}

                {activeTab ===
                  "approval-trail" && (
                  <DepartmentApprovalTrail
                    items={
                      selectedRequest
                        .approvalTrail
                    }
                    detailed
                  />
                )}

                {activeTab ===
                  "budget" && (
                  <BudgetPositionPanel
                    budget={
                      selectedRequest
                        .budget
                    }
                    detailed
                  />
                )}

                {activeTab ===
                  "attachments" && (
                  <HrReviewAttachments
                    attachments={
                      selectedRequest
                        .attachments
                    }
                  />
                )}

                {activeTab ===
                  "audit" && (
                  <HrReviewAudit
                    entries={
                      selectedRequest
                        .audit
                    }
                  />
                )}
              </div>

              <aside className="min-w-0">
                <div className="2xl:sticky 2xl:top-4">
                  <HrDispositionPanel
                    request={
                      selectedRequest
                    }
                    actions={
                      HR_DISPOSITION_ACTIONS
                    }
                    onSubmit={
                      handleDisposition
                    }
                  />
                </div>
              </aside>
            </div>
          </div>
        ) : (
          <Card className="flex min-h-[440px] items-center justify-center rounded-xl bg-white p-8 text-center shadow-xs hover:translate-y-0">
            <div>
              <CheckCircle2 className="mx-auto size-10 text-muted-foreground/50" />

              <p className="mt-4 text-sm font-semibold text-foreground">
                No matching requests
              </p>

              <p className="mt-2 text-sm text-muted-foreground">
                Change or clear the
                filters to view the HR
                review queue.
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}