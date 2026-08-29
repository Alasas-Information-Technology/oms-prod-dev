"use client";

import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ApprovalTaskDetail, ApprovalApiError } from "@/lib/types/approval.types";
import { formatAmount } from "@/lib/money";
import { approvalsApi } from "@/lib/api/approvals";
import { Loader2, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck } from "lucide-react";
import { cn } from "@/components/ui/utils";

interface ApproveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  detail: ApprovalTaskDetail;
  onSuccess: () => void;
}

export function ApproveDialog({
  open,
  onOpenChange,
  detail,
  onSuccess,
}: ApproveDialogProps) {
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<ApprovalApiError | null>(null);
  const idempotencyKeyRef = useRef<string>("");

  // Generate idempotency key ONCE when dialog opens
  useEffect(() => {
    if (open) {
      idempotencyKeyRef.current = crypto.randomUUID();
      setComment("");
      setError(null);
      setIsSubmitting(false);
    }
  }, [open]);

  const { task, impact, actingFor } = detail;
  const fromState = impact.fundStateTransition?.from ?? "Reserved";
  const toState = impact.fundStateTransition?.to ?? "Locked & Allocated";

  const handleApprove = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError(null);

    try {
      await approvalsApi.approveTask(task.approvalTaskId, {
        comment: comment.trim() || undefined,
        idempotencyKey: idempotencyKeyRef.current,
      });
      onOpenChange(false);
      onSuccess();
    } catch (err: any) {
      setError(err?.code ? err : { code: "UNKNOWN", message: err?.message || "An unexpected error occurred." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={isSubmitting ? undefined : onOpenChange}>
      <DialogContent className="sm:max-w-[540px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <CheckCircle2 className="size-5 text-emerald-600" />
            Approve Requisition
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {task.subjectRef} &middot; {task.title}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Money Restatement Banner */}
          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 flex flex-col gap-2">
            <div className="text-xs font-medium text-emerald-900">
              Financial Impact Confirmation:
            </div>
            <div className="flex items-center gap-2 text-sm font-semibold text-emerald-950">
              <span className="tabular-nums">
                {impact.currency} {formatAmount(impact.requested)}
              </span>
              <span className="text-xs font-normal text-emerald-800">
                will move from
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-100/80 text-emerald-900 text-xs">
                {fromState}
              </span>
              <ArrowRight className="size-3.5 text-emerald-600" />
              <span className="px-2 py-0.5 rounded bg-emerald-200 text-emerald-950 text-xs font-bold">
                {toState}
              </span>
            </div>
          </div>

          {/* Delegation Notice if actingFor */}
          {actingFor && (
            <div className="p-3 rounded-lg border border-indigo-200 bg-indigo-50/60 flex items-start gap-2.5 text-xs text-indigo-950">
              <ShieldCheck className="size-4 text-indigo-600 shrink-0 mt-0.5" />
              <span>
                You are approving on behalf of <strong>{actingFor.name}</strong>.
                Your decision will be recorded under both identities in the permanent audit trail.
              </span>
            </div>
          )}

          {/* Error Banner with Specific Part 3.7 Messages */}
          {error && (
            <div className="p-3.5 rounded-lg border border-red-200 bg-red-50 text-xs text-red-900 flex items-start gap-2.5">
              <AlertCircle className="size-4 text-red-600 shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1">
                <span className="font-semibold">
                  {error.code === "APPROVAL_BUDGET_CHANGED" && "Budget Changed"}
                  {error.code === "APPROVAL_ALREADY_DECIDED" && "Already Decided"}
                  {error.code === "APPROVAL_NOT_ASSIGNED" && "Assignment Changed"}
                  {error.code === "APPROVAL_SELF" && "Segregation of Duties Violation"}
                  {error.code === "APPROVAL_PERIOD_CLOSED" && "Period Closed"}
                  {error.code === "APPROVAL_PREFLIGHT_FAILED" && "Preflight Checks Failed"}
                  {!error.code.startsWith("APPROVAL_") && "Approval Failed"}
                </span>
                <span className="leading-relaxed">
                  {error.code === "APPROVAL_BUDGET_CHANGED"
                    ? "The available budget changed while you were reviewing. Here are the current figures. Please review again before approving."
                    : error.code === "APPROVAL_ALREADY_DECIDED"
                    ? `Already approved by ${error.decidedBy || "another approver"}.`
                    : error.code === "APPROVAL_NOT_ASSIGNED"
                    ? `This is no longer waiting on you. It moved to ${error.movedTo || "another stage"}.`
                    : error.code === "APPROVAL_SELF"
                    ? "You can't approve a request you raised."
                    : error.code === "APPROVAL_PERIOD_CLOSED"
                    ? "The budget period closed. Reopen it before approving."
                    : error.message}
                </span>
              </div>
            </div>
          )}

          {/* Comment input (Optional) */}
          <div className="space-y-1.5">
            <label
              htmlFor="approve-comment"
              className="text-xs font-medium text-foreground flex items-center justify-between"
            >
              <span>Approval Comment</span>
              <span className="text-[11px] text-muted-foreground font-normal">Optional</span>
            </label>
            <Textarea
              id="approve-comment"
              placeholder="Add any notes or justification for this approval..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              disabled={isSubmitting}
              className="min-h-[90px] text-sm"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleApprove}
            disabled={isSubmitting}
            className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Approving...
              </>
            ) : (
              "Confirm & Approve"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
