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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ApprovalTaskDetail, ApprovalApiError } from "@/lib/types/approval.types";
import { formatAmount } from "@/lib/money";
import { approvalsApi } from "@/lib/api/approvals";
import { Loader2, XCircle, AlertTriangle, AlertCircle } from "lucide-react";

interface RejectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  detail: ApprovalTaskDetail;
  onSuccess: () => void;
}

const REJECT_REASONS = [
  { value: "BUDGET_CONSTRAINTS", label: "Budget Constraints / Insufficient department funds" },
  { value: "HEADCOUNT_CAP", label: "Headcount Cap / Strategic headcount restriction" },
  { value: "INSUFFICIENT_JUSTIFICATION", label: "Insufficient Business Justification / Incomplete evidence" },
  { value: "TIMING_CANCELLED", label: "Project Postponed or Cancelled" },
  { value: "DUPLICATE_REQUEST", label: "Duplicate or Superseded Requisition" },
  { value: "OTHER", label: "Other Business Reason" },
];

export function RejectDialog({
  open,
  onOpenChange,
  detail,
  onSuccess,
}: RejectDialogProps) {
  const [reasonCode, setReasonCode] = useState("");
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [error, setError] = useState<ApprovalApiError | null>(null);
  const idempotencyKeyRef = useRef<string>("");

  const { task, impact } = detail;

  useEffect(() => {
    if (open) {
      idempotencyKeyRef.current = crypto.randomUUID();
      setReasonCode("");
      setComment("");
      setValidationError(null);
      setError(null);
      setIsSubmitting(false);
    }
  }, [open]);

  const handleReject = async () => {
    if (!reasonCode) {
      setValidationError("Please select a primary rejection reason.");
      return;
    }
    if (!comment.trim()) {
      setValidationError("Please provide detailed rejection remarks explaining this decision.");
      return;
    }

    if (isSubmitting) return;
    setIsSubmitting(true);
    setError(null);
    setValidationError(null);

    try {
      await approvalsApi.rejectTask(task.approvalTaskId, {
        comment: comment.trim(),
        reasonCode,
        idempotencyKey: idempotencyKeyRef.current,
      });
      onOpenChange(false);
      onSuccess();
    } catch (err: any) {
      setError(err?.code ? err : { code: "UNKNOWN", message: err?.message || "Failed to reject request." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={isSubmitting ? undefined : onOpenChange}>
      <DialogContent className="sm:max-w-[540px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg text-red-700 dark:text-red-400">
            <XCircle className="size-5 text-red-600" />
            Reject Requisition
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {task.subjectRef} &middot; {task.title}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Explicit Final Warning Banner */}
          <div className="p-4 rounded-lg border border-red-300 bg-red-50 text-xs text-red-950 flex items-start gap-3">
            <AlertTriangle className="size-5 text-red-600 shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1 leading-relaxed">
              <span className="font-bold text-red-900 uppercase tracking-wide text-[11px]">
                Warning: Rejection is Final
              </span>
              <span>
                Rejecting this requisition permanently closes it. The reserved funds of{" "}
                <strong className="tabular-nums font-semibold">
                  {impact.currency} {formatAmount(impact.requested)}
                </strong>{" "}
                will be immediately released back to the department budget. This action cannot be undone.
              </span>
            </div>
          </div>

          {/* Delegation Notice if actingFor */}
          {detail.actingFor && (
            <div className="p-3 rounded-lg border border-indigo-200 bg-indigo-50/60 flex items-start gap-2.5 text-xs text-indigo-950">
              <AlertTriangle className="size-4 text-indigo-600 shrink-0 mt-0.5" />
              <span>
                You are rejecting this request on behalf of <strong>{detail.actingFor.name}</strong>.
                Your action will be recorded under both identities in the permanent audit trail.
              </span>
            </div>
          )}

          {/* Error Banner with Specific Part 3.7 Messages */}
          {error && (
            <div className="p-3.5 rounded-lg border border-red-200 bg-red-50 text-xs text-red-900 flex items-start gap-2.5">
              <AlertCircle className="size-4 text-red-600 shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1">
                <span className="font-semibold">Action Failed</span>
                <span>
                  {error.code === "APPROVAL_NOT_ASSIGNED"
                    ? `This is no longer waiting on you. It moved to ${error.movedTo || "another stage"}.`
                    : error.code === "APPROVAL_ALREADY_DECIDED"
                    ? `Already decided by ${error.decidedBy || "another approver"}.`
                    : error.message}
                </span>
              </div>
            </div>
          )}

          {/* Reason Code (REQUIRED) */}
          <div className="space-y-1.5">
            <label
              htmlFor="reject-reason"
              className="text-xs font-medium text-foreground flex items-center justify-between"
            >
              <span>Reason Code <span className="text-red-500">*</span></span>
              <span className="text-[11px] text-red-500 font-normal">Required</span>
            </label>
            <Select
              value={reasonCode}
              onValueChange={(val) => {
                setReasonCode(val);
                if (validationError && comment.trim()) {
                  setValidationError(null);
                }
              }}
              disabled={isSubmitting}
            >
              <SelectTrigger id="reject-reason" className="w-full text-sm">
                <SelectValue placeholder="Select primary rejection reason" />
              </SelectTrigger>
              <SelectContent>
                {REJECT_REASONS.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Remarks Comment (REQUIRED) */}
          <div className="space-y-1.5">
            <label
              htmlFor="reject-comment"
              className="text-xs font-medium text-foreground flex items-center justify-between"
            >
              <span>Detailed Remarks <span className="text-red-500">*</span></span>
              <span className="text-[11px] text-red-500 font-normal">Required</span>
            </label>
            <Textarea
              id="reject-comment"
              placeholder="Provide a plain explanation of why this requisition is rejected..."
              value={comment}
              onChange={(e) => {
                setComment(e.target.value);
                if (validationError && e.target.value.trim() && reasonCode) {
                  setValidationError(null);
                }
              }}
              disabled={isSubmitting}
              className="min-h-[110px] text-sm"
            />
          </div>

          {validationError && (
            <p className="text-xs text-red-600 font-medium">{validationError}</p>
          )}
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
            variant="destructive"
            onClick={handleReject}
            disabled={isSubmitting || !reasonCode || !comment.trim()}
            className="gap-1.5 font-semibold"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Rejecting & Releasing Funds...
              </>
            ) : (
              "Confirm & Reject"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
