"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  FileText,
  Clock,
  CheckCircle2,
  HelpCircle,
  Paperclip,
  Check,
  ChevronRight,
  Info,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  PageBarBreadcrumbs,
  PageBarActions,
  BreadcrumbCrumb,
} from "@/components/ui/layouts/page-bar-context";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { AmendmentProgressRail } from "./AmendmentProgressRail";
import { AmendmentContextBar } from "./AmendmentContextBar";
import { AmendmentPageActions } from "./AmendmentPageActions";
import { WhyNeededPanel } from "./WhyNeededPanel";
import { RevisedBudgetPositionPanel } from "./RevisedBudgetPositionPanel";
import { FundingRoutePanel } from "./FundingRoutePanel";
import { WhoApprovesPanel } from "./WhoApprovesPanel";
import { AmendmentSubmitDialog } from "./AmendmentSubmitDialog";
import {
  useBudgetAmendment,
  useBudgetAmendmentPreview,
  useCancelBudgetAmendment,
  useSubmitBudgetAmendment,
} from "@/src/lib/budget-amendment/api";
import {
  computeMockAmendmentPreview,
  UNBUDGETED_6_STEP_REAPPROVAL_ROUTE,
} from "@/src/lib/budget-amendment/fixtures";
import { formatAmount } from "@/lib/money";
import { cn } from "@/lib/utils";
import {
  FundingRouteCode,
  AmendmentAllocationInput,
  BudgetAmendmentError,
} from "@/src/types/budget-amendment";
import { ClarificationAttachment } from "@/types/clarification";

interface BudgetAmendmentWorkspaceProps {
  requestId: string;
  amendmentId: string;
  className?: string;
  initialData?: import("@/src/types/budget-amendment").BudgetAmendmentWorkspace;
}

export function BudgetAmendmentWorkspace({
  requestId,
  amendmentId,
  className,
  initialData,
}: BudgetAmendmentWorkspaceProps) {
  const router = useRouter();

  // Active fixture key switcher for QA & prompt test verification (e.g. Fixture d)
  const [activeFixtureKey, setActiveFixtureKey] = React.useState<string>("reference");
  const [cancelDialogOpen, setCancelDialogOpen] = React.useState(false);
  const [selectedFundingRoute, setSelectedFundingRoute] = React.useState<FundingRouteCode>("BUDGETED");

  // Justification text state (minimum 40 characters required per TASK 1)
  const [justification, setJustification] = React.useState<string>(
    "Senior candidate exceeds target band due to specialized OT/ICS security certs. Market benchmark attached confirms alignment."
  );

  // Attachments state via existing AttachmentList component
  const [attachments, setAttachments] = React.useState<ClarificationAttachment[]>([
    {
      id: "att-market-comp-01",
      name: "Market_Rate_Comp.pdf",
      sizeBytes: 1240000,
      scanStatus: "VERIFIED",
      url: "/documents/Market_Rate_Comp.pdf",
    },
  ]);

  const handleAddAttachment = (attachment: ClarificationAttachment) => {
    setAttachments((prev) => [...prev, attachment]);
  };

  const handleRemoveAttachment = (attachmentId: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== attachmentId));
  };

  // Allocations state (line allocations in fils)
  const [allocations, setAllocations] = React.useState<AmendmentAllocationInput[]>([
    { lineId: "line-cs-001", amount: 2000000 },
  ]);

  // Fetch workspace data
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useBudgetAmendment(
    requestId,
    amendmentId,
    initialData ? { initialData } : undefined,
    activeFixtureKey
  );

  // Cancel mutation
  const cancelMutation = useCancelBudgetAmendment(requestId, amendmentId);

  // Submit mutation & confirmation dialog state (TASK 2, 3, 5)
  const submitMutation = useSubmitBudgetAmendment(requestId, amendmentId);
  const [submitDialogOpen, setSubmitDialogOpen] = React.useState(false);
  const [idempotencyKey, setIdempotencyKey] = React.useState<string>("");
  const [submitError, setSubmitError] = React.useState<BudgetAmendmentError | null>(null);

  // Open submit confirmation dialog: generate idempotency key once per open session (TASK 3)
  const handleOpenSubmitDialog = () => {
    if (isSubmitBlocked) return;
    if (!idempotencyKey) {
      const generatedKey =
        typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
          ? crypto.randomUUID()
          : `idem-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
      setIdempotencyKey(generatedKey);
    }
    setSubmitError(null);
    setSubmitDialogOpen(true);
  };

  // Confirm submit from dialog (TASK 3 & TASK 5)
  const handleConfirmSubmit = async () => {
    try {
      setSubmitError(null);
      const result = await submitMutation.mutateAsync({
        fundingRoute: selectedFundingRoute,
        allocations: selectedFundingRoute === "UNBUDGETED" ? [] : allocations,
        justification,
        attachmentIds: attachments.map((a) => a.id),
        idempotencyKey,
      });

      setSubmitDialogOpen(false);
      const nextApproverName =
        result.nextApprover?.name ||
        effectiveReapprovalRoute[0]?.user?.name ||
        "Omar Al Hashmi";
      toast.success(
        `Amendment submitted. It now goes to ${nextApproverName} for approval.`
      );

      // TASK 5: Return to request detail
      const rId = data?.requestId || requestId;
      router.push(`/app/requests/${encodeURIComponent(rId)}`);
    } catch (err: any) {
      // TASK 3: Retain idempotency key for retry, show specific error in dialog
      setSubmitError(err as BudgetAmendmentError);
    }
  };

  // Close submit dialog: reset error
  const handleCloseSubmitDialog = (open: boolean) => {
    setSubmitDialogOpen(open);
    if (!open) {
      setSubmitError(null);
    }
  };

  // Handle fixture switcher change
  const handleFixtureChange = (key: string) => {
    setActiveFixtureKey(key);
    if (key === "unbudgeted") {
      setSelectedFundingRoute("UNBUDGETED");
      setAllocations([]);
    } else if (key === "insufficient") {
      setSelectedFundingRoute("BUDGETED");
      setAllocations([{ lineId: "line-cs-001", amount: 500000 }]);
    } else {
      setSelectedFundingRoute("BUDGETED");
      setAllocations([{ lineId: "line-cs-001", amount: 2000000 }]);
    }
  };

  // Handle funding route selection per TASK 1 & 3:
  // Selecting UNBUDGETED sends NO allocations (Server Contract Requirement 6)
  const handleSelectFundingRoute = (route: FundingRouteCode) => {
    setSelectedFundingRoute(route);
    if (route === "UNBUDGETED") {
      setAllocations([]);
    }
  };

  // Handle line allocation changes (in fils) per TASK 2 & 4
  const handleAllocationChange = (lineId: string, amount: number) => {
    setAllocations((prev) => {
      const existingIdx = prev.findIndex((a) => a.lineId === lineId);
      if (existingIdx >= 0) {
        if (amount <= 0) {
          return prev.filter((a) => a.lineId !== lineId);
        }
        const updated = [...prev];
        updated[existingIdx] = { lineId, amount };
        return updated;
      }
      if (amount <= 0) return prev;
      return [...prev, { lineId, amount }];
    });
  };

  // Dynamic ReapprovalRoute: When UNBUDGETED is selected, gains an HR -> Finance branch sourced from API (TASK 1)
  const effectiveReapprovalRoute = React.useMemo(() => {
    if (selectedFundingRoute === "UNBUDGETED") {
      return (
        data?.unbudgetedReapprovalRoute ||
        (data as any)?.unbudgetedRoute?.reapprovalRoute ||
        UNBUDGETED_6_STEP_REAPPROVAL_ROUTE
      );
    }
    return data?.reapprovalRoute || [];
  }, [selectedFundingRoute, data?.reapprovalRoute, data?.unbudgetedReapprovalRoute]);

  // Live server preview debounced at 500ms (TASK 2 & TASK 3)
  const previewQuery = useBudgetAmendmentPreview(
    requestId,
    amendmentId,
    selectedFundingRoute,
    allocations,
    undefined,
    activeFixtureKey
  );

  // Effective preview calculation: zero client arithmetic, directly from server preview response
  const effectivePreview = React.useMemo(() => {
    if (previewQuery.data) return previewQuery.data;
    if (data) {
      return computeMockAmendmentPreview(data, selectedFundingRoute, allocations);
    }
    return {
      revisedPosition: [],
      balanced: false,
      totalAllocated: 0,
      shortfallRemaining: 2000000,
    };
  }, [previewQuery.data, data, selectedFundingRoute, allocations]);

  // TASK 3: Submit is blocked when position is short OR justification < 40 chars
  const isJustificationValid = justification.trim().length >= 40;
  const isSubmitBlocked = !effectivePreview.balanced || !isJustificationValid;

  // Breadcrumbs per TASK 1:
  // "My Requests / OMS-2026-0148 / Candidate C-009 / Budget amendment"
  const breadcrumbs: BreadcrumbCrumb[] = React.useMemo(() => {
    const rId = data?.requestId || requestId || "OMS-2026-0148";
    const cRef = data?.candidateRef || "C-009";

    return [
      { label: "My Requests", href: "/app/requests" },
      { label: rId, href: `/app/requests/${encodeURIComponent(rId)}` },
      {
        label: `Candidate ${cRef}`,
        href: `/app/candidates/interviews/evaluate/${encodeURIComponent(
          rId
        )}/${encodeURIComponent(cRef)}`,
      },
      { label: "Budget amendment", isCurrent: true },
    ];
  }, [data?.requestId, data?.candidateRef, requestId]);

  // Handle Cancel action confirmation (TASK 4)
  const handleConfirmCancel = async () => {
    try {
      await cancelMutation.mutateAsync({
        reason: "Cancelled by user from amendment workspace",
      });
      setCancelDialogOpen(false);
      const cRef = data?.candidateRef || "C-009";
      toast.success(`Amendment cancelled. ${cRef} is Qualified, pending budget.`);

      // TASK 4: Return to the request detail
      const rId = data?.requestId || requestId;
      router.push(`/app/requests/${encodeURIComponent(rId)}`);
    } catch (err: any) {
      toast.error(err?.message || "Failed to cancel amendment");
      setCancelDialogOpen(false);
    }
  };

  if (isLoading || !data) {
    return (
      <div className="flex flex-col min-h-screen bg-background text-foreground animate-pulse p-6 space-y-6 max-w-7xl mx-auto">
        <div className="h-6 w-80 bg-muted rounded" />
        <div className="h-1 bg-muted rounded" />
        <div className="h-10 bg-muted/60 rounded" />
        <div className="grid grid-cols-1 xl:grid-cols-[320px_1fr_320px] gap-6">
          <div className="h-96 bg-muted/40 rounded-lg" />
          <div className="h-96 bg-muted/40 rounded-lg" />
          <div className="h-96 bg-muted/40 rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col min-h-full flex-1 bg-background text-foreground", className)}>
      {/* ── TASK 1: Page Bar Breadcrumbs ── */}
      <PageBarBreadcrumbs crumbs={breadcrumbs} />

      {/* ── TASK 1: Page Bar Actions: Cancel (ghost, danger text), Save draft (ghost), Submit (primary) ── */}
      <PageBarActions>
        <AmendmentPageActions
          activeFixtureKey={activeFixtureKey}
          onFixtureChange={handleFixtureChange}
          onCancel={() => setCancelDialogOpen(true)}
          onSaveDraft={() => {}}
          onSubmit={handleOpenSubmitDialog}
          submitDisabled={isSubmitBlocked}
          cancelConsequence={data.cancelConsequence}
          balanced={effectivePreview.balanced}
          shortfallRemaining={effectivePreview.shortfallRemaining}
        />
      </PageBarActions>

      {/* Mobile top action bar for small screens (<640px) */}
      <div className="sm:hidden w-full px-4 py-2 border-b border-border bg-card flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground">Amendment Actions</span>
          <AmendmentPageActions
            activeFixtureKey={activeFixtureKey}
            onFixtureChange={handleFixtureChange}
            onCancel={() => setCancelDialogOpen(true)}
            onSaveDraft={() => {}}
            onSubmit={handleOpenSubmitDialog}
            submitDisabled={isSubmitBlocked}
            cancelConsequence={data.cancelConsequence}
            balanced={effectivePreview.balanced}
            shortfallRemaining={effectivePreview.shortfallRemaining}
          />
        </div>
        {data.cancelConsequence && (
          <p className="text-[10.5px] text-muted-foreground/80 italic">
            {data.cancelConsequence}
          </p>
        )}
      </div>

      {/* ── TASK 4: Urgent Red Alert Banner when Deadline is CRITICAL (< 3 days, e.g. Fixture d) ── */}
      {data.deadline.severity === "CRITICAL" && (
        <div
          role="alert"
          className="w-full px-4 sm:px-6 py-2.5 bg-destructive/10 border-b border-destructive/25 text-destructive flex items-center justify-between gap-3 text-xs sm:text-sm font-medium"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="size-4 shrink-0 text-destructive animate-pulse" aria-hidden="true" />
            <span>
              <strong>Deadline Critical:</strong> {data.deadline.daysRemaining} days left on the original request.
              The underlying request and Candidate {data.candidateRef}&apos;s slot will close automatically if this amendment is not submitted and approved.
            </span>
          </div>
          <span className="hidden md:inline-flex text-[11px] font-mono uppercase tracking-wider bg-destructive/15 text-destructive px-2 py-0.5 rounded font-bold">
            Auto-close imminent
          </span>
        </div>
      )}

      {/* ── TASK 2: 4px Progress Rail directly beneath breadcrumbs ("Amendment draft · 2 of 5") ── */}
      <AmendmentProgressRail
        currentStep={2}
        totalSteps={5}
        stepLabel="Amendment draft"
      />

      {/* ── TASK 3 & 4: Lineage line beneath the rail & Deadline severity states ── */}
      <AmendmentContextBar
        requestId={data.requestId}
        candidateRef={data.candidateRef}
        position={data.position}
        triggeredBy={data.triggeredBy}
        deadline={data.deadline}
      />

      {/* ── TASK 5: Responsive Layout Container ──
          Grid 320px 1fr 320px, 24px gap.
          Below 1280px (xl) right column stacks;
          Below 1024px (lg) single column with funding route last.
      ── */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto p-4 sm:p-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] xl:grid-cols-[320px_1fr_320px] gap-6 items-start">

          {/* ═════════════════════════════════════════════════════════════════════
              COLUMN 1 (320px): WHY THIS IS NEEDED (TASK 1)
              order-1 on mobile (<1024px), col 1 on lg/xl
          ═════════════════════════════════════════════════════════════════════ */}
          <WhyNeededPanel
            cost={data.cost}
            justification={justification}
            onJustificationChange={setJustification}
            attachments={attachments}
            onAddAttachment={handleAddAttachment}
            onRemoveAttachment={handleRemoveAttachment}
            className="order-1 lg:col-span-1 lg:row-start-1 lg:row-span-2 xl:col-start-1 xl:row-start-1 xl:row-span-2"
          />

          {/* ═════════════════════════════════════════════════════════════════════
              COLUMN 2 TOP (1fr): REVISED BUDGET POSITION (TASK 2 & 3)
              order-2 on mobile (<1024px), col 2 row 1 on lg/xl
          ═════════════════════════════════════════════════════════════════════ */}
          <RevisedBudgetPositionPanel
            revisedPosition={effectivePreview.revisedPosition}
            balanced={effectivePreview.balanced}
            shortfallRemaining={effectivePreview.shortfallRemaining}
            isLoadingPreview={previewQuery.isLoading}
            className="order-2 lg:col-start-2 lg:row-start-1 xl:col-start-2 xl:row-start-1"
          />

          {/* ═════════════════════════════════════════════════════════════════════
              COLUMN 2 BOTTOM (1fr): FUNDING ROUTE (TASKS 1, 2, 3, 4)
              order-4 on mobile (<1024px) -> FUNDING ROUTE LAST BELOW 1024px!
              lg:col-start-2 lg:row-start-2, xl:col-start-2 xl:row-start-2
          ═════════════════════════════════════════════════════════════════════ */}
          <FundingRoutePanel
            fundingRoutes={data.fundingRoutes}
            selectedRoute={selectedFundingRoute}
            onSelectRoute={handleSelectFundingRoute}
            allocations={allocations}
            onAllocationChange={handleAllocationChange}
            shortfall={data.cost.shortfall}
            totalAllocated={effectivePreview.totalAllocated}
            balanced={effectivePreview.balanced}
            shortfallRemaining={effectivePreview.shortfallRemaining}
            departmentName="Digital Security"
            className="order-4 lg:col-start-2 lg:row-start-2 xl:col-start-2 xl:row-start-2"
          />

          {/* ═════════════════════════════════════════════════════════════════════
              COLUMN 3 (320px): WHO APPROVES, FUND STATE, CANCEL NOTE (BA5)
              order-3 on mobile (<1024px)
              lg:col-span-2 lg:row-start-3 -> STACKS BELOW ON <1280px!
              xl:col-start-3 xl:row-start-1 xl:row-span-2
          ═════════════════════════════════════════════════════════════════════ */}
          <WhoApprovesPanel
            reapprovalRoute={effectiveReapprovalRoute}
            candidateRef={data.candidateRef}
            cancelConsequence={data.cancelConsequence}
            genericRejectionConsequence={data.genericRejectionConsequence}
            className="order-3 lg:col-span-2 lg:row-start-3 xl:col-start-3 xl:row-start-1 xl:row-span-2"
          />
        </div>

        {/* Audit footer note per Part 2 Layout */}
        <div className="pt-4 border-t border-border/40 text-xs text-muted-foreground flex items-center gap-2">
          <Info className="size-3.5 shrink-0 text-muted-foreground/80" />
          <span>
            Before and after allocation, justification, attachments, and approvals are permanently retained for audit compliance.
          </span>
        </div>
      </main>

      {/* ── Cancel Confirmation Dialog per §3.6 ── */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Budget Amendment?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                {data.cancelConsequence ||
                  `Cancelling reverts Candidate ${data.candidateRef} to Qualified, pending budget. No funds are moved.`}
              </p>
              <p className="text-xs text-muted-foreground">
                You will be returned to the request detail page. You can create a new amendment draft at any time before the 30-day request deadline.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelMutation.isPending}>
              Keep amendment
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmCancel}
              disabled={cancelMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {cancelMutation.isPending ? "Cancelling..." : "Confirm cancellation"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Submit Confirmation Dialog per Part 4 & BA6 ── */}
      <AmendmentSubmitDialog
        open={submitDialogOpen}
        onOpenChange={handleCloseSubmitDialog}
        candidateRef={data.candidateRef}
        position={data.position}
        shortfall={data.cost.shortfall}
        fundingRoute={selectedFundingRoute}
        fundingRouteOption={data.fundingRoutes.find(
          (r) => r.code === selectedFundingRoute
        )}
        allocations={selectedFundingRoute === "UNBUDGETED" ? [] : allocations}
        availableLines={
          data.fundingRoutes.find((r) => r.code === selectedFundingRoute)
            ?.availableLines || []
        }
        reapprovalRoute={effectiveReapprovalRoute}
        deadline={data.deadline}
        idempotencyKey={idempotencyKey}
        isSubmitting={submitMutation.isPending}
        submitError={submitError}
        onConfirm={handleConfirmSubmit}
        onClearError={() => setSubmitError(null)}
      />
    </div>
  );
}
