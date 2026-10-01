"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getAmendment } from "@/src/lib/demo-data";
import {
  PageBarBreadcrumbs,
  PageBarActions,
} from "@/components/ui/layouts/page-bar-context";
import { Button } from "@/components/ui/button";
import {
  useInterviewEvaluation,
  useConfirmInterviewOutcome,
  useInterviewEvaluationDraft,
  useSubmitInterviewEvaluation,
} from "@/src/lib/interview-evaluation/api";
import {
  ConfirmationChoice,
  CriterionRatingLevel,
  RejectionReasonCode,
  InterviewEvaluationError,
  InterviewEvaluationSubmitPayload,
} from "@/src/types/interview-evaluation";
import {
  InterviewProgressRail,
  LifecycleStep,
} from "@/components/oms/interviews/rail/InterviewProgressRail";
import { InterviewOverdueBanner } from "./InterviewOverdueBanner";
import { InterviewEvaluationContextBar } from "./InterviewEvaluationContextBar";
import { InterviewConfirmationBranch } from "./InterviewConfirmationBranch";
import { EvaluationScorecard } from "./EvaluationScorecard";
import { EvaluationCommentsAndTags } from "./EvaluationCommentsAndTags";
import { EvaluationPanelSection } from "./EvaluationPanelSection";
import { EvaluationCandidateCard } from "./EvaluationCandidateCard";
import { EvaluationCostCard } from "./EvaluationCostCard";
import { EvaluationOutcomePanel } from "./EvaluationOutcomePanel";
import { EvaluationSubmitConfirmationModal } from "./EvaluationSubmitConfirmationModal";
import { EvaluationAuditTrail } from "./EvaluationAuditTrail";
import { cn } from "@/lib/utils";

// Standard 5-step lifecycle where Evaluation is Step 4 of 5
const EVALUATION_LIFECYCLE_STEPS: LifecycleStep[] = [
  {
    number: 1,
    label: "Candidate review",
    status: "completed",
    description: "Shortlisted candidates reviewed by the hiring department",
  },
  {
    number: 2,
    label: "Propose slots",
    status: "completed",
    description: "Curated interview times sent to candidates via vendor relay",
  },
  {
    number: 3,
    label: "Interview",
    status: "completed",
    description: "Panel conducts interview session online or in person",
  },
  {
    number: 4,
    label: "Evaluation",
    status: "current",
    description: "Scorecards entered, panel consensus verified, and hiring outcome decided",
  },
  {
    number: 5,
    label: "Procurement & Onboarding",
    status: "pending",
    description: "Offer extended and procurement begins resource onboarding",
  },
];

const EMPTY_ARRAY: string[] = [];

interface InterviewEvaluationWorkspaceProps {
  requestId: string;
  candidateRef: string;
  initialFixtureKey?: string;
  className?: string;
}

export function InterviewEvaluationWorkspace({
  requestId,
  candidateRef,
  initialFixtureKey,
  className,
}: InterviewEvaluationWorkspaceProps) {
  const router = useRouter();
  const linkedAmendment = React.useMemo(() => getAmendment(requestId), [requestId]);

  // Allow switching fixture in testing
  const [activeFixtureKey, setActiveFixtureKey] = React.useState<string | undefined>(
    initialFixtureKey
  );

  const { data, isLoading, error, refetch } = useInterviewEvaluation(
    requestId,
    candidateRef,
    undefined,
    activeFixtureKey
  );

  const confirmOutcomeMutation = useConfirmInterviewOutcome(requestId, candidateRef);

  // Local optimistic state for interview occurrence confirmation
  const [optimisticOccurred, setOptimisticOccurred] = React.useState<boolean | null>(null);

  // Local rating overrides & server score updates
  const [localRatings, setLocalRatings] = React.useState<Record<string, CriterionRatingLevel>>({});
  const [provisionalScore, setProvisionalScore] = React.useState<number | null>(null);
  const [provisionalAnchor, setProvisionalAnchor] = React.useState<string | null>(null);

  // Local comments & tags state (EV4)
  const [localComments, setLocalComments] = React.useState<string | null>(null);
  const [localStrengths, setLocalStrengths] = React.useState<string[] | null>(null);
  const [localDevelopment, setLocalDevelopment] = React.useState<string[] | null>(null);
  const [isDirty, setIsDirty] = React.useState(false);

  // Outcome & Submit Confirmation state (EV6)
  const [localOutcome, setLocalOutcome] = React.useState<"QUALIFY" | "REJECT" | null>(null);
  const [selectedRejectionReasonCode, setSelectedRejectionReasonCode] =
    React.useState<RejectionReasonCode | null>(null);
  const [idempotencyKey, setIdempotencyKey] = React.useState<string>("");
  const [isConfirmModalOpen, setIsConfirmModalOpen] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<InterviewEvaluationError | null>(null);

  // Switch fixture and reset any transient optimistic state
  const handleFixtureChange = (newFixtureKey: string) => {
    setActiveFixtureKey(newFixtureKey);
    setOptimisticOccurred(null);
    setLocalRatings({});
    setProvisionalScore(null);
    setProvisionalAnchor(null);
    setLocalComments(null);
    setLocalStrengths(null);
    setLocalDevelopment(null);
    setIsDirty(false);
    setLocalOutcome(null);
    setSelectedRejectionReasonCode(null);
    setIdempotencyKey("");
    setIsConfirmModalOpen(false);
    setSubmitError(null);
  };

  const currentCriteria = React.useMemo(() => {
    if (!data) return [];
    return data.criteria.map((c) => ({
      ...c,
      rating: localRatings[c.code] !== undefined ? localRatings[c.code] : c.rating,
    }));
  }, [data, localRatings]);

  const effectiveComments = localComments !== null ? localComments : (data?.comments ?? "");
  const effectiveStrengths = React.useMemo(
    () => localStrengths ?? data?.strengthTags ?? EMPTY_ARRAY,
    [localStrengths, data?.strengthTags]
  );
  const effectiveDevelopment = React.useMemo(
    () => localDevelopment ?? data?.developmentTags ?? EMPTY_ARRAY,
    [localDevelopment, data?.developmentTags]
  );

  const currentDraftPayload = React.useMemo(() => {
    if (!data) return undefined;
    const allRatings = currentCriteria
      .filter((c): c is typeof c & { rating: CriterionRatingLevel } => c.rating !== null)
      .map((c) => ({
        criterionCode: c.code,
        rating: c.rating,
      }));

    return {
      ratings: allRatings,
      comments: effectiveComments,
      strengthTags: effectiveStrengths,
      developmentTags: effectiveDevelopment,
    };
  }, [data, currentCriteria, effectiveComments, effectiveStrengths, effectiveDevelopment]);

  const draftMutation = useInterviewEvaluationDraft(
    requestId,
    candidateRef,
    currentDraftPayload,
    {
      autoSave: isDirty,
      onSaveSuccess: (res) => {
        if (res?.overallScore !== undefined && res.overallScore !== null) {
          setProvisionalScore(res.overallScore);
        }
        if (res?.overallAnchor !== undefined && res.overallAnchor !== null) {
          setProvisionalAnchor(res.overallAnchor);
        }
      },
    }
  );
  const submitMutation = useSubmitInterviewEvaluation(requestId, candidateRef);

  const effectiveOverallScore =
    provisionalScore !== null ? provisionalScore : (data?.overallScore ?? null);
  const effectiveOverallAnchor =
    provisionalAnchor !== null ? provisionalAnchor : (data?.overallAnchor ?? null);

  const handleRatingChange = async (code: string, rating: CriterionRatingLevel) => {
    setIsDirty(true);
    const updatedLocal = { ...localRatings, [code]: rating };
    setLocalRatings(updatedLocal);

    if (!data) return;

    const allRatings = data.criteria.map((c) => ({
      criterionCode: c.code,
      rating: c.code === code ? rating : (updatedLocal[c.code] ?? c.rating ?? 3),
    }));

    try {
      const res = await draftMutation.saveDraftAsync({
        ratings: allRatings,
        comments: effectiveComments,
        strengthTags: effectiveStrengths,
        developmentTags: effectiveDevelopment,
      });

      if (res?.overallScore !== undefined && res.overallScore !== null) {
        setProvisionalScore(res.overallScore);
      }
      if (res?.overallAnchor !== undefined && res.overallAnchor !== null) {
        setProvisionalAnchor(res.overallAnchor);
      }
    } catch {
      // Draft save error handled by React Query
    }
  };

  const handleSaveDraft = async () => {
    if (!data) return;
    const allRatings = currentCriteria
      .filter((c): c is typeof c & { rating: CriterionRatingLevel } => c.rating !== null)
      .map((c) => ({
        criterionCode: c.code,
        rating: c.rating,
      }));

    try {
      const res = await draftMutation.saveDraftAsync({
        ratings: allRatings,
        comments: effectiveComments,
        strengthTags: effectiveStrengths,
        developmentTags: effectiveDevelopment,
      });
      if (res?.overallScore !== undefined && res.overallScore !== null) {
        setProvisionalScore(res.overallScore);
      }
      if (res?.overallAnchor !== undefined && res.overallAnchor !== null) {
        setProvisionalAnchor(res.overallAnchor);
      }
      toast.success("Evaluation draft saved.");
    } catch {
      toast.error("Failed to save evaluation draft.");
    }
  };

  const effectiveOutcome =
    localOutcome !== null
      ? localOutcome
      : data?.isMainInterviewer
      ? "QUALIFY"
      : null;

  const unratedCriteria = currentCriteria.filter((c) => c.rating === null);

  const pendingContributors = (data?.panel?.contributors ?? []).filter(
    (c) => c.status === "PENDING"
  );

  const selectedRejectionReason =
    data?.rejectionReasons?.find((r) => r.code === selectedRejectionReasonCode) ?? null;

  const handleOpenSubmit = () => {
    if (!data) return;

    if (data.isMainInterviewer) {
      if (effectiveOutcome === "REJECT") {
        if (!selectedRejectionReasonCode) {
          toast.error("A rejection reason must be selected.");
          return;
        }
        if (!effectiveComments.trim()) {
          toast.error("Comments are required when rejecting a candidate.");
          return;
        }
      }
    }

    // TASK 5: Generate idempotency key ONCE when confirmation opens; reuse on retry
    const key =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `idemp-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    setIdempotencyKey(key);
    setSubmitError(null);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmSubmit = async (idempotencyKey: string) => {
    if (!data) return;

    try {
      const allRatings = currentCriteria
        .filter((c): c is typeof c & { rating: CriterionRatingLevel } => c.rating !== null)
        .map((c) => ({
          criterionCode: c.code,
          rating: c.rating,
        }));

      const payload: InterviewEvaluationSubmitPayload = {
        ratings: allRatings,
        comments: effectiveComments,
        strengthTags: effectiveStrengths,
        developmentTags: effectiveDevelopment,
        idempotencyKey,
        ...(data.isMainInterviewer
          ? effectiveOutcome === "REJECT"
            ? {
                outcome: "REJECT" as const,
                rejectionReasonCode: selectedRejectionReasonCode!,
              }
            : {
                outcome: "QUALIFY" as const,
              }
          : {
              outcome: "RATINGS_ONLY" as const,
            }),
      };

      const res = await submitMutation.mutateAsync(payload);
      toast.success(res.message);
      setIsConfirmModalOpen(false);

      // TASK 4: Over-budget Qualify -> real Amendment page for that candidate
      if (payload.outcome === "QUALIFY" && data.cost.status === "OVER_BUDGET") {
        const targetAmendmentId = linkedAmendment?.id || "amd-2026-0089";
        toast.info(`Candidate qualified over budget. Navigating to Budget Amendment (${targetAmendmentId})...`);
        router.push(`/app/requests/${requestId}/amendments/${targetAmendmentId}`);
      }
    } catch (err: unknown) {
      const errorObj = err as Partial<InterviewEvaluationError>;
      setSubmitError({
        statusCode: errorObj.statusCode || 500,
        code: errorObj.code || "SUBMIT_ERROR",
        message: errorObj.message || "Failed to submit evaluation.",
      });
    }
  };

  // Handle interview confirmation choice from RFP Step 6 panel
  const handleConfirmOccurrence = async (choice: ConfirmationChoice) => {
    if (choice === "WENT_AHEAD") {
      setOptimisticOccurred(true);
      try {
        await confirmOutcomeMutation.mutateAsync({
          occurred: true,
        });
        toast.success("Interview confirmed. Scorecard is now accessible.");
      } catch {
        toast.error("Failed to record interview confirmation.");
      }
    } else {
      setOptimisticOccurred(false);
      try {
        await confirmOutcomeMutation.mutateAsync({
          occurred: false,
          reason: choice,
        });
        toast.info("Interview status recorded.");
      } catch {
        toast.error("Failed to record status.");
      }
    }
  };

  // Breadcrumbs per APP-SHELL-SPEC.md (Task 1): Acts as the page title
  const breadcrumbs = React.useMemo(() => {
    return [
      { label: "Interviews", href: "/app/candidates" },
      {
        label: data?.requestId || requestId || "OMS-2026-0148",
        href: `/app/requests/${data?.requestId || requestId}`,
      },
      {
        label: `Candidate ${data?.candidateRef || candidateRef || "C-014"}`,
        isCurrent: true,
      },
    ];
  }, [data?.requestId, data?.candidateRef, requestId, candidateRef]);

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-140px)] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="size-6 animate-spin text-primary" />
          <span className="text-xs font-medium">Loading candidate evaluation...</span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center max-w-md mx-auto my-12 bg-card border border-border rounded-xl">
        <p className="text-sm font-semibold text-destructive">
          Failed to load interview evaluation workspace.
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Please check the requisition and candidate references and try again.
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          className="mt-4 text-xs cursor-pointer"
        >
          Retry
        </Button>
      </div>
    );
  }

  // Interview occurrence status
  const effectiveOccurred = optimisticOccurred !== null ? optimisticOccurred : data.interview.occurred;

  return (
    <div className={cn("flex flex-col min-h-full flex-1 bg-background text-foreground", className)}>
      {/* 1. Page Bar Breadcrumbs (Acts as page title per APP-SHELL-SPEC.md. No separate heading block) */}
      <PageBarBreadcrumbs crumbs={breadcrumbs} />

      {/* 2. Page Bar Actions: Save draft (ghost), Submit (primary) */}
      <PageBarActions>
        <div className="flex items-center gap-2">
          {/* Subtle fixture switcher for testing Phase EV1-EV6 */}
          <div className="hidden md:flex items-center gap-1 mr-2 px-2 py-0.5 rounded-md bg-muted/40 border border-border text-[11px] text-muted-foreground">
            <span className="font-semibold text-foreground/80">Fixture:</span>
            <select
              value={activeFixtureKey || "reference"}
              onChange={(e) => handleFixtureChange(e.target.value)}
              className="bg-transparent border-none text-[11px] font-medium text-foreground focus:outline-hidden cursor-pointer"
              aria-label="Select evaluation fixture"
            >
              <option value="reference">a) Reference (C-014)</option>
              <option value="over-budget">b) Over budget</option>
              <option value="single-interviewer">c) Single interviewer</option>
              <option value="disagreement">d) Disagreement</option>
              <option value="not-occurred">e) Not occurred</option>
              <option value="overdue">f) Overdue (2 days)</option>
              <option value="non-main">g) Panel member (non-main)</option>
            </select>
          </div>

          <Button
            variant="ghost"
            size="sm"
            disabled={!effectiveOccurred || draftMutation.isSaving}
            onClick={handleSaveDraft}
            className="h-9 px-3 text-xs font-medium cursor-pointer"
          >
            {draftMutation.isSaving ? "Saving..." : "Save draft"}
          </Button>

          <Button
            variant="default"
            size="sm"
            disabled={!effectiveOccurred || submitMutation.isPending}
            onClick={handleOpenSubmit}
            className="h-9 px-4 text-xs font-semibold cursor-pointer"
          >
            {data.isMainInterviewer ? "Submit" : "Submit my ratings"}
          </Button>
        </div>
      </PageBarActions>

      {/* 3. Overdue Red Banner per TASK 4 (Fixture f): Placed above everything */}
      {data.deadline.severity === "OVERDUE" && (
        <InterviewOverdueBanner
          daysOverdue={data.deadline.daysRemaining}
          message={data.deadline.overdueMessage}
        />
      )}

      {/* 4. Progress Rail per TASK 2: 4px progress rail, 5 segments, "Evaluation · 4 of 5" */}
      <InterviewProgressRail
        currentStep={4}
        totalSteps={5}
        stepLabel="Evaluation"
        steps={EVALUATION_LIFECYCLE_STEPS}
      />

      {/* 5. Context Bar per TASK 3: completed date/time, method, deadline state */}
      <InterviewEvaluationContextBar
        interview={{
          ...data.interview,
          occurred: effectiveOccurred,
        }}
        deadline={data.deadline}
      />

      {/* 6. Main Body: Interview Confirmation branch OR Two-Column Layout */}
      {!effectiveOccurred ? (
        /* TASK 5 / Acceptance: Fixture (e) shows ONLY the confirmation panel, no scorecard in the DOM */
        <InterviewConfirmationBranch
          candidateRef={data.candidateRef}
          position={data.position}
          onConfirm={handleConfirmOccurrence}
          isSubmitting={confirmOutcomeMutation.isPending}
        />
      ) : (
        /* TASK 6: Grid 1fr 360px, 24px gap. Right column sticky. Below 1280px stacked with outcome LAST */
        <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6 items-start">
            {/* ── Left Column: How Did They Do (Scorecard, Comments, Panel) ── */}
            <div className="min-w-0 space-y-6">
              {/* HOW DID THEY DO: Scorecard Component (TASK 1-5 / EV3) */}
              <EvaluationScorecard
                criteria={currentCriteria}
                overallScore={effectiveOverallScore}
                overallAnchor={effectiveOverallAnchor}
                onRatingChange={handleRatingChange}
                isSaving={draftMutation.isSaving}
                disabled={!data.canEvaluate}
              />

              {/* YOUR COMMENTS & TAGS (EV4) */}
              <EvaluationCommentsAndTags
                comments={effectiveComments}
                onCommentsChange={(val) => {
                  setIsDirty(true);
                  setLocalComments(val);
                }}
                strengthTags={effectiveStrengths}
                onStrengthTagsChange={(tags) => {
                  setIsDirty(true);
                  setLocalStrengths(tags);
                }}
                developmentTags={effectiveDevelopment}
                onDevelopmentTagsChange={(tags) => {
                  setIsDirty(true);
                  setLocalDevelopment(tags);
                }}
                suggestedTags={data.suggestedTags || []}
                lastSavedAt={draftMutation.lastSavedAt}
                isSaving={draftMutation.isSaving}
                outcome={effectiveOutcome}
                disabled={!data.canEvaluate}
              />

              {/* THE PANEL (EV4): Rendered ONLY when panel.isPanel is true */}
              {data.panel.isPanel && (
                <EvaluationPanelSection
                  panel={data.panel}
                  criteriaDefinitions={data.criteria}
                />
              )}
            </div>

            {/* ── Right Column: Candidate, Cost, Outcome (Sticky, Stacked below XL) ── */}
            <div className="space-y-6 xl:sticky xl:top-4">
              {/* CANDIDATE PANEL (TASK 1 / EV5) */}
              <EvaluationCandidateCard
                candidateRef={data.candidateRef}
                priority={data.priority}
                candidate={data.candidate}
              />

              {/* COST PANEL & POSITION PROGRESS (TASK 2 & 3 / EV5) */}
              <EvaluationCostCard
                cost={data.cost}
                positions={data.positions}
                requestId={requestId}
                amendmentId={linkedAmendment?.id}
              />

              {/* OUTCOME BLOCK (TASK 1, 2, 6 / EV6): Kept LAST so flow reads rate -> decide */}
              {data.isMainInterviewer && (
                <EvaluationOutcomePanel
                  isMainInterviewer={data.isMainInterviewer}
                  selectedOutcome={effectiveOutcome}
                  onSelectOutcome={(outcome) => setLocalOutcome(outcome)}
                  selectedRejectionReasonCode={selectedRejectionReasonCode}
                  onSelectRejectionReason={(code) => setSelectedRejectionReasonCode(code)}
                  cost={data.cost}
                  rejectionReasons={data.rejectionReasons}
                  disabled={!data.canEvaluate}
                />
              )}
            </div>
          </div>

          {/* 7. Collapsible Audit Trail at the Bottom (TASK 1 / Sections 1.8, 3.7) */}
          <EvaluationAuditTrail auditTrail={data.auditTrail} />
        </div>
      )}

      {/* 8. Final Submit Confirmation Modal (TASK 4 & 5 / EV6) */}
      <EvaluationSubmitConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirmSubmit={handleConfirmSubmit}
        idempotencyKey={idempotencyKey}
        outcome={effectiveOutcome}
        rejectionReason={selectedRejectionReason}
        overallScore={effectiveOverallScore}
        overallAnchor={effectiveOverallAnchor}
        unratedCriteria={unratedCriteria}
        pendingContributors={pendingContributors}
        isMainInterviewer={data.isMainInterviewer}
        cost={data.cost}
        immutabilityNotice={data.immutabilityNotice}
        isSubmitting={submitMutation.isPending}
        serverError={submitError}
      />
    </div>
  );
}
