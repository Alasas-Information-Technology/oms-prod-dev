"use client";

import * as React from "react";

import Link from "next/link";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  PageBarActions,
  PageBarBreadcrumbs,
} from "@/components/ui/layouts/page-bar-context";

import {
  createMockDraft,
  MOCK_REQUESTS,
} from "./request.mock-data";

import { NewRequisitionDialog } from "./NewRequisitionDialog";
import { PortfolioSnapshot } from "./PortfolioSnapshot";
import { RequestFilters } from "./RequestFilters";
import { RequestsTable } from "./RequestsTable";
import { RequestStatusTabs } from "./RequestStatusTabs";
import { RequestNeedsActionSubFilters } from "./RequestNeedsActionSubFilters";

import {
  EMPTY_REQUEST_FILTERS,
  NeedsActionSubFilter,
  NewRequestDraft,
  OmsRequest,
  RequestFiltersState,
  RequestTab,
} from "./request.types";

export type RequestWorkspaceMode = "all" | "mine";

interface RequestWorkspaceProps {
  mode: RequestWorkspaceMode;
}

function unique(values: string[]) {
  return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b));
}

function exportRequests(requests: OmsRequest[], filename: string) {
  if (requests.length === 0) return;

  const rows = requests.map((request) => ({
    "Request ID": request.requestId,
    Position: request.position,
    Resources: request.resources,
    "Actual Status": request.actualStatus,
    "Current Stage": request.currentStage,
    "Current Owner": request.currentOwner,
    Budget: request.budget,
    Organisation: request.organization,
    Department: request.department,
    "Start Date": request.startDate,
    "End Date": request.endDate,
    "Next Action": request.nextAction,
  }));

  const headers = Object.keys(rows[0]);

  const csv = [
    headers.join(","),
    ...rows.map((row) =>
      headers
        .map((header) => {
          const value = row[header as keyof typeof row];
          return `"${String(value ?? "").replace(/"/g, '""')}"`;
        })
        .join(",")
    ),
  ].join("\n");

  const blob = new Blob(["\uFEFF", csv], {
    type: "text/csv;charset=utf-8",
  });

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${filename}.csv`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export function RequestWorkspace({ mode }: RequestWorkspaceProps) {
  const searchParams = useSearchParams();
  const isMinePage = mode === "mine";

  const [requests, setRequests] = React.useState<OmsRequest[]>(MOCK_REQUESTS);

  // Sync tab from URL if ?tab=needs-my-action or ?tab=needs-action
  const tabParam = searchParams.get("tab");
  const initialTab: RequestTab =
    tabParam === "needs-my-action" || tabParam === "needs-action"
      ? "needs-action"
      : "all";

  const [activeTab, setActiveTab] = React.useState<RequestTab>(initialTab);
  const [needsActionSubFilter, setNeedsActionSubFilter] =
    React.useState<NeedsActionSubFilter>("all");

  const [filters, setFilters] = React.useState<RequestFiltersState>(() => ({
    ...EMPTY_REQUEST_FILTERS,
    activeOnly: isMinePage,
  }));

  const [expandedRequestId, setExpandedRequestId] = React.useState<string | null>(
    null
  );

  const [newRequestOpen, setNewRequestOpen] = React.useState(false);

  const pageTitle = isMinePage ? "My Requests" : "All Requests";

  const scopedRequests = React.useMemo(
    () => requests.filter((request) => !isMinePage || request.isMine),
    [isMinePage, requests]
  );

  const tabCounts = React.useMemo(
    () => ({
      all: scopedRequests.length,
      draft: scopedRequests.filter((request) => request.statusGroup === "draft")
        .length,
      "needs-action": scopedRequests.filter(
        (request) => request.statusGroup === "needs-action"
      ).length,
      "in-progress": scopedRequests.filter(
        (request) => request.statusGroup === "in-progress"
      ).length,
      closed: scopedRequests.filter(
        (request) => request.statusGroup === "closed"
      ).length,
    }),
    [scopedRequests]
  );

  // Sub-filter counts for Needs My Action tab
  const needsActionItems = React.useMemo(() => {
    return scopedRequests.filter((r) => r.statusGroup === "needs-action");
  }, [scopedRequests]);

  const subFilterCounts = React.useMemo(
    () => ({
      all: needsActionItems.length,
      approvals: needsActionItems.filter((r) => r.actionType === "APPROVE")
        .length,
      revision: needsActionItems.filter(
        (r) => r.actionType === "REVISE" || r.actionType === "CLARIFY"
      ).length,
      drafts: needsActionItems.filter(
        (r) => r.actionType === "COMPLETE_DRAFT"
      ).length,
      other: needsActionItems.filter(
        (r) =>
          r.actionType === "REVIEW_CANDIDATES" ||
          r.actionType === "CONFIRM_JOINING" ||
          r.actionType === "LOG_COMPLETION"
      ).length,
    }),
    [needsActionItems]
  );

  const filterOptions = React.useMemo(
    () => ({
      organizations: unique(
        scopedRequests.map((request) => request.organization)
      ),
      departments: unique(scopedRequests.map((request) => request.department)),
      statuses: unique(scopedRequests.map((request) => request.actualStatus)),
      owners: unique(scopedRequests.map((request) => request.currentOwner)),
    }),
    [scopedRequests]
  );

  const filteredRequests = React.useMemo(() => {
    const search = filters.search.trim().toLowerCase();

    return scopedRequests.filter((request) => {
      if (activeTab !== "all" && request.statusGroup !== activeTab) {
        return false;
      }

      // Sub-filter evaluation on Needs My Action tab
      if (activeTab === "needs-action" && needsActionSubFilter !== "all") {
        if (
          needsActionSubFilter === "approvals" &&
          request.actionType !== "APPROVE"
        ) {
          return false;
        }
        if (
          needsActionSubFilter === "revision" &&
          request.actionType !== "REVISE" &&
          request.actionType !== "CLARIFY"
        ) {
          return false;
        }
        if (
          needsActionSubFilter === "drafts" &&
          request.actionType !== "COMPLETE_DRAFT"
        ) {
          return false;
        }
        if (
          needsActionSubFilter === "other" &&
          request.actionType !== "REVIEW_CANDIDATES" &&
          request.actionType !== "CONFIRM_JOINING" &&
          request.actionType !== "LOG_COMPLETION"
        ) {
          return false;
        }
      }

      if (
        filters.organization !== "all" &&
        request.organization !== filters.organization
      ) {
        return false;
      }

      if (
        filters.department !== "all" &&
        request.department !== filters.department
      ) {
        return false;
      }

      if (
        filters.actualStatus !== "all" &&
        request.actualStatus !== filters.actualStatus
      ) {
        return false;
      }

      if (
        filters.currentOwner !== "all" &&
        request.currentOwner !== filters.currentOwner
      ) {
        return false;
      }

      if (filters.startDate && request.startDate < filters.startDate) {
        return false;
      }

      if (filters.endDate && request.endDate > filters.endDate) {
        return false;
      }

      if (filters.activeOnly && !request.isActive) {
        return false;
      }

      if (filters.slaOnly && !request.needsSlaAttention) {
        return false;
      }

      if (filters.needsActionOnly && request.statusGroup !== "needs-action") {
        return false;
      }

      if (!search) return true;

      return [
        request.requestId,
        request.position,
        request.department,
        request.currentOwner,
        request.actualStatus,
      ].some((value) => value.toLowerCase().includes(search));
    });
  }, [activeTab, needsActionSubFilter, filters, scopedRequests]);

  const visibleExpandedRequestId =
    expandedRequestId &&
    filteredRequests.some(
      (request) => request.requestId === expandedRequestId
    )
      ? expandedRequestId
      : null;

  const createDraft = (draft: NewRequestDraft) => {
    const newRequest = createMockDraft(draft);

    setRequests((current) => [newRequest, ...current]);
    setActiveTab("draft");
    setFilters({
      ...EMPTY_REQUEST_FILTERS,
      activeOnly: false,
    });
    setExpandedRequestId(newRequest.requestId);
  };

  const clearFilters = () => {
    setFilters({
      ...EMPTY_REQUEST_FILTERS,
      activeOnly: isMinePage,
    });
    setActiveTab("all");
    setNeedsActionSubFilter("all");
  };

  const pageActions =
    React.useMemo(
      () => (
        <Button
          size="sm"
          className="h-9 rounded-lg gap-1.5"
          asChild
        >
          <Link href="/app/requests/new">
            <Plus className="size-4" />
            New requisition
          </Link>
        </Button>
      ),
      []
    );

  const breadcrumbs =
    React.useMemo(
      () => [
        {
          label: "OMS Requests",
          href: "/app/requests",
        },
        {
          label: pageTitle,
          isCurrent: true,
        },
      ],
      [pageTitle]
    );

  return (
    <div className="min-h-full bg-background p-4 md:p-6">
      <PageBarActions>{pageActions}</PageBarActions>

      <PageBarBreadcrumbs crumbs={breadcrumbs} />

      <NewRequisitionDialog
        open={newRequestOpen}
        onOpenChange={setNewRequestOpen}
        onCreate={createDraft}
      />

      <div className="mx-auto flex w-full max-w-[1680px] flex-col gap-5">
        <p className="text-sm text-muted-foreground">
          {isMinePage
            ? "Track the requisitions you created, own, or need to act on."
            : "Monitor every requisition through approval, sourcing, and engagement."}
        </p>

        <div className="flex flex-col gap-3">
          <RequestStatusTabs
            value={activeTab}
            onValueChange={(val) => {
              setActiveTab(val);
              setNeedsActionSubFilter("all");
            }}
            counts={tabCounts}
          />

          {/* Sub-filter chips beneath Needs My Action tab per Part 3 */}
          {activeTab === "needs-action" && (
            <RequestNeedsActionSubFilters
              value={needsActionSubFilter}
              onValueChange={setNeedsActionSubFilter}
              counts={subFilterCounts}
            />
          )}
        </div>

        <RequestFilters
          idPrefix={mode}
          filters={filters}
          options={filterOptions}
          onFiltersChange={setFilters}
          onClear={clearFilters}
          onExport={() =>
            exportRequests(
              filteredRequests,
              isMinePage ? "my-requests" : "all-requests"
            )
          }
          exportDisabled={filteredRequests.length === 0}
        />

        <RequestsTable
          requests={filteredRequests}
          expandedRequestId={visibleExpandedRequestId}
          onExpandedRequestChange={setExpandedRequestId}
          isNeedsActionTab={activeTab === "needs-action"}
        />

        <PortfolioSnapshot requests={filteredRequests} />
      </div>
    </div>
  );
}