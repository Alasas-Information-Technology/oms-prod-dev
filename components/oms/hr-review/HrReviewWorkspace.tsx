"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, ListFilter, Search } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { PageBarActions } from "@/components/ui/layouts/page-bar-context";

import { DepartmentApprovalTrail } from "./DepartmentApprovalTrail";
import { HrReviewOverview } from "./HrReviewOverview";
import { HrReviewQueue } from "./HrReviewQueue";
import { HrReviewRequestSummary } from "./HrReviewRequestSummary";
import { HrReviewTabs } from "./HrReviewTabs";
import { HrReviewDecisionBar } from "./HrReviewDecisionBar";
import { HrReviewShortcutOverlay } from "./HrReviewShortcutOverlay";
import { HrReviewTab } from "@/types/hr-review";
import { useHrReviewQueue, useHrReviewDetail, hrReviewKeys } from "@/hooks/useHrReview";
import { hrReviewApi } from "@/lib/api/hr-review";
import { useHrReviewShortcuts } from "@/hooks/useHrReviewShortcuts";

export function HrReviewWorkspace() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const urlRequestId = searchParams.get("request");

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [department, setDepartment] = useState("all");
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [activeTab, setActiveTab] = useState<HrReviewTab>("overview");
  const [isQueueOpen, setIsQueueOpen] = useState(false);

  const [activeDialog, setActiveDialog] = useState<"APPROVE" | "SEND_BACK" | "PERM_HIRE" | "REJECT" | null>(null);
  const [showShortcuts, setShowShortcuts] = useState(false);

  const { data: queueData, isLoading: isQueueLoading } = useHrReviewQueue({
    department: department !== "all" ? department : undefined,
    status: overdueOnly ? "overdue" : undefined,
  });

  const { data: detailResponse, isLoading: isDetailLoading } = useHrReviewDetail(
    urlRequestId || "",
    { enabled: !!urlRequestId }
  );

  const departments = useMemo(() => [
    "Digital Security", "Data Management", "Project Management Office", "IT Infrastructure", "Procurement",
  ].sort(), []);

  const queueItems = queueData?.items ?? [];

  const processedQueueItems = useMemo(() => {
    let items = [...queueItems];
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      items = items.filter(
        (item) => item.requestId.toLowerCase().includes(q) || item.position.toLowerCase().includes(q) || item.department.name.toLowerCase().includes(q)
      );
    }
    if (overdueOnly) {
      items = items.filter((item) => item.sla.breached);
    }
    items.sort((a, b) => {
      if (a.sla.breached && !b.sla.breached) return -1;
      if (!a.sla.breached && b.sla.breached) return 1;
      if (a.returnedFromClarification && !b.returnedFromClarification) return -1;
      if (!a.returnedFromClarification && b.returnedFromClarification) return 1;
      return b.ageDays - a.ageDays;
    });
    return items;
  }, [queueItems, search, overdueOnly]);

  const currentIndex = processedQueueItems.findIndex(i => i.requestId === urlRequestId);
  const nextRequest = currentIndex >= 0 && currentIndex < processedQueueItems.length - 1 ? processedQueueItems[currentIndex + 1] : null;
  const prevRequest = currentIndex > 0 ? processedQueueItems[currentIndex - 1] : null;
  const currentPositionLabel = processedQueueItems.length > 0 && currentIndex >= 0
    ? `${currentIndex + 1} of ${processedQueueItems.length}`
    : processedQueueItems.length === 0 ? "Queue clear." : "";

  // Set default selection
  useEffect(() => {
    if (!urlRequestId && processedQueueItems.length > 0) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("request", processedQueueItems[0].requestId);
      router.replace(`${pathname}?${params.toString()}`);
    }
  }, [urlRequestId, processedQueueItems, pathname, router, searchParams]);

  // Prefetch next request
  useEffect(() => {
    if (nextRequest) {
      queryClient.prefetchQuery({
        queryKey: hrReviewKeys.detail(nextRequest.requestId),
        queryFn: () => hrReviewApi.getDetail(nextRequest.requestId)
      });
    }
  }, [nextRequest, queryClient]);

  const handleSelectRequest = (id: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("request", id);
    router.push(`${pathname}?${params.toString()}`);
    setActiveTab("overview");
    setIsQueueOpen(false);
  };

  const handleDecisionSuccess = (actionMessage: string) => {
    if (nextRequest) {
      toast.success(actionMessage, {
        description: `Moved to ${nextRequest.requestId}.`,
      });
      handleSelectRequest(nextRequest.requestId);
    } else {
      toast.success(actionMessage, {
        description: "You've reached the end of the queue.",
      });
      // In a real app we'd refetch queue and maybe select nothing
    }
  };

  useHrReviewShortcuts({
    onNext: () => nextRequest && handleSelectRequest(nextRequest.requestId),
    onPrev: () => prevRequest && handleSelectRequest(prevRequest.requestId),
    onApprove: () => detailResponse?.canDecide && setActiveDialog("APPROVE"),
    onSendBack: () => detailResponse?.canDecide && setActiveDialog("SEND_BACK"),
    onReject: () => detailResponse?.canDecide && setActiveDialog("REJECT"),
    onEscape: () => {
      setActiveDialog(null);
      setShowShortcuts(false);
    },
    onToggleHelp: () => setShowShortcuts(prev => !prev),
    enabled: true,
  });

  const hasActiveFilters = search.trim() !== "" || department !== "all" || status !== "all" || overdueOnly;

  const handleClearFilters = () => {
    setSearch("");
    setStatus("all");
    setDepartment("all");
    setOverdueOnly(false);
  };

  const queueComponent = (
    <HrReviewQueue
      requests={processedQueueItems}
      selectedRequestId={urlRequestId}
      onSelect={handleSelectRequest}
      totalCount={queueData?.counts?.total ?? 0}
      overdueCount={queueData?.counts?.overdue ?? 0}
      slaTargetDays={queueData?.slaTargetDays ?? 3}
      isLoading={isQueueLoading}
      positionLabel={currentPositionLabel}
      hasActiveFilters={hasActiveFilters}
      onClearFilters={handleClearFilters}
    />
  );

  return (
    <div className="space-y-6">
      <HrReviewShortcutOverlay open={showShortcuts} onOpenChange={setShowShortcuts} />

      <PageBarActions>
        <div className="flex flex-wrap items-center gap-4">
          <Sheet open={isQueueOpen} onOpenChange={setIsQueueOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="xl:hidden shrink-0">
                <ListFilter className="size-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-95 p-0 border-none bg-transparent shadow-none">
              <div className="p-4 h-full bg-slate-50/50 backdrop-blur-xl border-r">
                {queueComponent}
              </div>
            </SheetContent>
          </Sheet>

          <div className="hidden xl:flex items-center gap-2 px-3 h-8 rounded-md border border-border bg-white hover:bg-slate-50 shadow-xs">
            <Switch id="overdue-only" checked={overdueOnly} onCheckedChange={setOverdueOnly} />
            <Label htmlFor="overdue-only" className="text-[13px] font-medium cursor-pointer">Overdue only</Label>
          </div>

          <Select value={department} onValueChange={setDepartment}>
            <SelectTrigger className="h-8 w-40 rounded-md border border-border bg-white shadow-xs hover:bg-slate-50 focus:ring-0">
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map((dept) => <SelectItem key={dept} value={dept}>{dept}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="h-8 w-40 rounded-md border border-border bg-white shadow-xs hover:bg-slate-50 focus:ring-0">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="New">New</SelectItem>
              <SelectItem value="Awaiting HR Review">Awaiting Review</SelectItem>
              <SelectItem value="Clarification Returned">Clarification Returned</SelectItem>
            </SelectContent>
          </Select>

          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search requests"
              className="h-8 w-48 pl-9 rounded-md border border-border bg-white shadow-xs hover:bg-slate-50 focus-visible:ring-0"
            />
          </div>

          <div className="ml-2 text-[13px] font-medium text-foreground-secondary border-l border-border pl-4 tabular-nums">
            {processedQueueItems.length} requests
          </div>
        </div>
      </PageBarActions>

      <div className="grid min-h-0 gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
        <div className="hidden xl:block">
          {queueComponent}
        </div>

        {isDetailLoading ? (
          <div className="flex h-64 items-center justify-center">
            <p className="text-[13px] font-normal text-muted-foreground">Loading detail...</p>
          </div>
        ) : detailResponse ? (
          <div className="min-w-0 space-y-6">
            <div className="space-y-4">
              <HrReviewRequestSummary request={detailResponse.request} />
              <HrReviewTabs
                value={activeTab}
                onValueChange={setActiveTab}
                attachmentCount={0}
                auditCount={0}
              />
            </div>

            <div className="min-w-0">
              {activeTab === "overview" && <HrReviewOverview detail={detailResponse} onNavigateTab={(tab) => setActiveTab(tab)} />}
              {activeTab === "approval-trail" && (
                <div className="rounded-xl border border-border bg-white p-6 shadow-xs">
                  <h3 className="text-[14px] font-semibold text-foreground mb-4">Approval Trail</h3>
                  <DepartmentApprovalTrail items={detailResponse.approvalTrail} detailed />
                </div>
              )}
              {activeTab === "budget" && (
                <div className="rounded-xl border border-border bg-white p-6 shadow-xs">
                  <h3 className="text-[14px] font-semibold text-foreground mb-4">Budget Position</h3>
                  <p className="text-[13px] font-normal text-muted-foreground">Full BudgetPositionPanel placeholder (Waiting for Budget component update)</p>
                </div>
              )}
              {activeTab === "attachments" && (
                <div className="rounded-xl border border-border bg-white p-6 shadow-xs">
                  <h3 className="text-[14px] font-semibold text-foreground mb-4">Attachments</h3>
                  <p className="text-[13px] font-normal text-muted-foreground">Attachments tab placeholder</p>
                </div>
              )}
              {activeTab === "audit" && (
                <div className="rounded-xl border border-border bg-white p-6 shadow-xs">
                  <h3 className="text-[14px] font-semibold text-foreground mb-4">Audit Trail</h3>
                  <p className="text-[13px] font-normal text-muted-foreground">Audit trail tab placeholder</p>
                </div>
              )}
            </div>

            <HrReviewDecisionBar
              detail={detailResponse}
              activeDialog={activeDialog}
              setActiveDialog={setActiveDialog}
              onSuccess={handleDecisionSuccess}
            />
          </div>
        ) : (
          <Card className="flex min-h-[440px] items-center justify-center rounded-xl bg-white p-8 text-center shadow-xs hover:translate-y-0">
            <div>
              <CheckCircle2 className="mx-auto size-10 text-muted-foreground/50" />
              <p className="mt-4 text-[14px] font-semibold text-foreground">
                No matching requests
              </p>
              <p className="mt-2 text-[13px] font-normal text-muted-foreground">
                Change or clear the filters to view the HR review queue.
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}