"use client";

import * as React from "react";
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Lock,
  Loader2,
  FileText,
  AlertCircle,
  Calendar,
} from "lucide-react";
import {
  EvaluationCriterion,
  EvaluationCostSummary,
  InterviewEvaluationError,
  PanelContributor,
  RejectionReason,
} from "@/src/types/interview-evaluation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatAmount } from "@/lib/money";
import { cn } from "@/lib/utils";

interface EvaluationSubmitConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmSubmit: (idempotencyKey: string) => Promise<void>;
  idempotencyKey: string;
  outcome: "QUALIFY" | "REJECT" | null;
  rejectionReason: RejectionReason | null;
  overallScore: number | null;
  overallAnchor: string | null;
  unratedCriteria: EvaluationCriterion[];
  pendingContributors: PanelContributor[];
  isMainInterviewer: boolean;
  cost: EvaluationCostSummary;
  immutabilityNotice: string;
  isSubmitting: boolean;
  serverError: InterviewEvaluationError | null;
}

/**
 * Final Evaluation Submit Confirmation Modal (TASK 4 & 5 / Sections 1.1, 3.6, Part 5)
 *
 * TASK 4:
 * - Restates outcome, overall score, rejection reason & retention consequence (if rejecting).
 * - Restates what happens next.
 * - Restates any unrated criteria.
 * - Restates any pending panel contributors.
 * - Displays immutabilityNotice text.
 *
 * TASK 5:
 * - Generates idempotencyKey ONCE when opened; reuses on retry.
 * - Disables button during submission.
 * - Prevents double-clicking (fires exactly one request).
 * - Handles server errors with plain messages (EVALUATION_BUDGET_CHANGED, EVALUATION_NOT_MAIN, etc.).
 */
export interface EvaluationSubmitConfirmationContentProps {
  outcome: "QUALIFY" | "REJECT" | null;
  rejectionReason: RejectionReason | null;
  overallScore: number | null;
  overallAnchor: string | null;
  unratedCriteria: EvaluationCriterion[];
  pendingContributors: PanelContributor[];
  isMainInterviewer: boolean;
  cost: EvaluationCostSummary;
  immutabilityNotice: string;
  isSubmitting: boolean;
  serverError: InterviewEvaluationError | null;
  onClose: () => void;
  onSubmit: () => void;
}

/**
 * Presentational confirmation body for the submission modal
 */
export function EvaluationSubmitConfirmationContent({
  outcome,
  rejectionReason,
  overallScore,
  overallAnchor,
  unratedCriteria,
  pendingContributors,
  isMainInterviewer,
  cost,
  immutabilityNotice,
  isSubmitting,
  serverError,
  onClose,
  onSubmit,
}: EvaluationSubmitConfirmationContentProps) {
  const isOverBudget = cost.status === "OVER_BUDGET";

  // What happens next explanation
  const whatHappensNextText = React.useMemo(() => {
    if (!isMainInterviewer) {
      return "Your evaluation scorecard and qualitative observations will be submitted to the panel record for the Main Interviewer's review.";
    }
    if (outcome === "QUALIFY") {
      if (isOverBudget) {
        return `Candidate is qualified. Because the expected cost exceeds approved budget by AED ${formatAmount(
          Math.abs(cost.variance)
        )}, qualifying initiates a formal Budget Amendment requiring Finance approval before onboarding can proceed.`;
      }
      return "Candidate is qualified. Procurement will be immediately notified to begin resource onboarding.";
    }
    if (outcome === "REJECT") {
      return "Candidate is marked as rejected. The recorded retention policy will be applied to the candidate's CV and personal data under UAE PDPL.";
    }
    return "Evaluation will be finalized.";
  }, [isMainInterviewer, outcome, isOverBudget, cost.variance]);

  // Human-readable error message mapping
  const errorDisplay = React.useMemo(() => {
    if (!serverError) return null;

    switch (serverError.code) {
      case "EVALUATION_BUDGET_CHANGED":
        return {
          title: "Budget Changed Concurrently",
          message:
            "Approved budget figures changed concurrently since this page was loaded. Please review the updated figures before resubmitting. Auto-resubmit was prevented.",
        };
      case "EVALUATION_NOT_MAIN":
        return {
          title: "Permission Denied",
          message: "Only the main interviewer can submit the outcome.",
        };
      case "EVALUATION_ALREADY_SUBMITTED":
        return {
          title: "Already Submitted",
          message:
            serverError.message ||
            "Evaluation was already submitted and locked for this candidate.",
        };
      case "EVALUATION_INTERVIEW_NOT_CONFIRMED":
        return {
          title: "Interview Confirmation Required",
          message: "Confirm whether the interview took place first.",
        };
      case "EVALUATION_REJECTION_REASON_REQUIRED":
        return {
          title: "Rejection Reason Required",
          message: "A rejection reason must be selected.",
        };
      case "EVALUATION_UNRATED_CRITERIA":
        return {
          title: "Unrated Criteria",
          message: "All required criteria must be rated.",
        };
      default:
        return {
          title: "Submission Failed",
          message: serverError.message || "Failed to submit evaluation.",
        };
    }
  }, [serverError]);

  return (
    <>
      <DialogHeader className="space-y-1">
        <DialogTitle className="text-base font-bold flex items-center gap-2">
          <Lock className="size-4 text-primary" />
          <span>Confirm evaluation submission</span>
        </DialogTitle>
        <DialogDescription className="text-xs text-muted-foreground">
          Please review the evaluation summary before recording the final submission.
        </DialogDescription>
      </DialogHeader>

        {/* ── Summary Card ── */}
        <div className="space-y-3 p-4 rounded-lg bg-muted/40 border border-border/80 text-xs">
          {/* Outcome & Score */}
          <div className="flex items-center justify-between pb-2.5 border-b border-border/60">
            <span className="text-muted-foreground font-medium">Outcome decision:</span>
            {isMainInterviewer ? (
              <span
                className={cn(
                  "font-bold uppercase tracking-wider px-2 py-0.5 rounded-full text-[11px] border inline-flex items-center gap-1",
                  outcome === "QUALIFY"
                    ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                    : "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30"
                )}
              >
                {outcome === "QUALIFY" ? (
                  <>
                    <CheckCircle2 className="size-3" />
                    Qualify
                  </>
                ) : (
                  <>
                    <XCircle className="size-3" />
                    Reject
                  </>
                )}
              </span>
            ) : (
              <span className="font-semibold text-muted-foreground">
                Panelist Scorecard (Ratings only)
              </span>
            )}
          </div>

          {/* Overall Score */}
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground font-medium">Weighted overall score:</span>
            <span className="font-bold text-foreground">
              {overallScore !== null ? `${overallScore}%` : "—"}{" "}
              {overallAnchor && (
                <span className="text-muted-foreground font-normal">
                  ({overallAnchor})
                </span>
              )}
            </span>
          </div>

          {/* Rejection Reason & Retention Consequence (if Reject) */}
          {outcome === "REJECT" && rejectionReason && (
            <div className="space-y-1.5 pt-2 border-t border-border/60">
              <span className="text-muted-foreground font-medium block">
                Statutory retention policy:
              </span>
              <div className="p-2.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-900 dark:text-rose-200 text-xs space-y-1">
                <span className="font-bold block">{rejectionReason.label}</span>
                <p className="text-[11px] text-rose-800/90 dark:text-rose-300/90">
                  {rejectionReason.retentionConsequence}
                </p>
                {rejectionReason.deletionDate && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono mt-1 text-rose-700 dark:text-rose-300">
                    <Calendar className="size-2.5" />
                    Scheduled deletion: {rejectionReason.deletionDate}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* What Happens Next */}
          <div className="space-y-1 pt-2 border-t border-border/60">
            <span className="text-muted-foreground font-medium flex items-center gap-1">
              <FileText className="size-3" />
              What happens next:
            </span>
            <p className="text-muted-foreground text-[11px] leading-relaxed">
              {whatHappensNextText}
            </p>
          </div>
        </div>

        {/* ── Warning: Unrated criteria if any ── */}
        {unratedCriteria.length > 0 && (
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2.5">
            <AlertTriangle className="size-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div>
              <span className="font-bold block">
                {`${unratedCriteria.length} unrated ${
                  unratedCriteria.length === 1 ? "criterion" : "criteria"
                }:`}
              </span>
              <p className="text-[11px] text-amber-800 dark:text-amber-300">
                {unratedCriteria.map((c) => c.label).join(", ")}.
              </p>
            </div>
          </div>
        )}

        {/* ── Notice: Pending panel contributors if any ── */}
        {pendingContributors.length > 0 && (
          <div className="p-3 rounded-lg bg-muted/60 border border-border text-xs flex items-start gap-2.5">
            <Clock className="size-4 shrink-0 text-muted-foreground mt-0.5" />
            <div>
              <span className="font-bold text-foreground block">
                Panel evaluation still pending:
              </span>
              <p className="text-[11px] text-muted-foreground">
                {pendingContributors.map((c) => c.name).join(", ")}{" "}
                {pendingContributors.length === 1 ? "has" : "have"} not completed evaluation yet. As Main Interviewer, you may proceed with the decision now.
              </p>
            </div>
          </div>
        )}

        {/* ── Immutability Notice ── */}
        <div className="p-2.5 rounded-md bg-muted/40 border border-border/60 text-[11px] text-muted-foreground flex items-center gap-2">
          <Lock className="size-3.5 shrink-0 text-primary" />
          <span>{immutabilityNotice}</span>
        </div>

        {/* ── Server Error Display ── */}
        {errorDisplay && (
          <div
            role="alert"
            className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-xs space-y-1"
          >
            <span className="font-bold flex items-center gap-1.5">
              <AlertCircle className="size-3.5" />
              {errorDisplay.title}
            </span>
            <p className="text-[11px] leading-relaxed">{errorDisplay.message}</p>
          </div>
        )}

        {/* ── Footer Actions ── */}
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
            className="cursor-pointer text-xs"
          >
            Cancel
          </Button>

          <Button
            type="button"
            variant={outcome === "REJECT" ? "destructive" : "default"}
            size="sm"
            onClick={onSubmit}
            disabled={isSubmitting}
            className="cursor-pointer text-xs font-semibold gap-1.5"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                Submitting...
              </>
            ) : (
              <span>Confirm & Submit</span>
            )}
          </Button>
        </DialogFooter>
    </>
  );
}

export function EvaluationSubmitConfirmationModal({
  isOpen,
  onClose,
  onConfirmSubmit,
  idempotencyKey,
  ...rest
}: EvaluationSubmitConfirmationModalProps) {
  // Prevent double-clicking submission
  const handleSubmitClick = async () => {
    if (rest.isSubmitting) return;
    await onConfirmSubmit(idempotencyKey);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !rest.isSubmitting && !open && onClose()}>
      <DialogContent className="max-w-lg p-6 sm:p-7 gap-5">
        <EvaluationSubmitConfirmationContent
          {...rest}
          onClose={onClose}
          onSubmit={handleSubmitClick}
        />
      </DialogContent>
    </Dialog>
  );
}
