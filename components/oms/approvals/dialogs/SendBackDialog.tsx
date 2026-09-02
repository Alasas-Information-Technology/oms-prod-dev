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
import { approvalsApi } from "@/lib/api/approvals";
import { Loader2, Undo2, AlertCircle, Info } from "lucide-react";

interface SendBackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  detail: ApprovalTaskDetail;
  onSuccess: () => void;
}

export function SendBackDialog({
  open,
  onOpenChange,
  detail,
  onSuccess,
}: SendBackDialogProps) {
  const [comment, setComment] = useState("");
  const [selectedStage, setSelectedStage] = useState("REQUESTOR");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [error, setError] = useState<ApprovalApiError | null>(null);
  const idempotencyKeyRef = useRef<string>("");

  // Available stages to send back to (stages prior to current in route)
  const currentStageIndex = detail.task.stage.index;
  const eligibleStages = detail.route.filter(
    (s) => s.index < currentStageIndex || s.code === "REQUESTOR"
  );

  useEffect(() => {
    if (open) {
      idempotencyKeyRef.current = crypto.randomUUID();
      setComment("");
      setSelectedStage("REQUESTOR");
      setValidationError(null);
      setError(null);
      setIsSubmitting(false);
    }
  }, [open]);

  const handleSendBack = async () => {
    if (!comment.trim()) {
      setValidationError("A reason for sending this request back is required.");
      return;
    }

    if (isSubmitting) return;
    setIsSubmitting(true);
    setError(null);
    setValidationError(null);

    try {
      await approvalsApi.sendBackTask(detail.task.approvalTaskId, {
        comment: comment.trim(),
        sendBackToStage: selectedStage,
        idempotencyKey: idempotencyKeyRef.current,
      });
      onOpenChange(false);
      onSuccess();
    } catch (err: any) {
      setError(err?.code ? err : { code: "UNKNOWN", message: err?.message || "Failed to send back request." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={isSubmitting ? undefined : onOpenChange}>
      <DialogContent className="sm:max-w-[540px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Undo2 className="size-5 text-amber-600" />
            Send Back Requisition
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {detail.task.subjectRef} &middot; {detail.task.title}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Informational Notice */}
          <div className="p-3.5 rounded-lg border border-amber-200 bg-amber-50/60 flex items-start gap-2.5 text-xs text-amber-950">
            <Info className="size-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              Sending this request back returns it to the selected stage for revision.
              The assignee will be notified and required to address your comments.
            </span>
          </div>

          {/* Delegation Notice if actingFor */}
          {detail.actingFor && (
            <div className="p-3 rounded-lg border border-indigo-200 bg-indigo-50/60 flex items-start gap-2.5 text-xs text-indigo-950">
              <Info className="size-4 text-indigo-600 shrink-0 mt-0.5" />
              <span>
                You are sending this request back on behalf of <strong>{detail.actingFor.name}</strong>.
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

          {/* Stage Selector (Default: REQUESTOR) */}
          <div className="space-y-1.5">
            <label
              htmlFor="sendback-stage"
              className="text-xs font-medium text-foreground"
            >
              Return to Stage <span className="text-red-500">*</span>
            </label>
            <Select
              value={selectedStage}
              onValueChange={setSelectedStage}
              disabled={isSubmitting}
            >
              <SelectTrigger id="sendback-stage" className="w-full text-sm">
                <SelectValue placeholder="Select target stage" />
              </SelectTrigger>
              <SelectContent>
                {eligibleStages.map((stg) => (
                  <SelectItem key={stg.code} value={stg.code}>
                    {stg.label} {stg.user ? `(${stg.user.name})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Comment Field (REQUIRED) */}
          <div className="space-y-1.5">
            <label
              htmlFor="sendback-comment"
              className="text-xs font-medium text-foreground flex items-center justify-between"
            >
              <span>Feedback & Return Reason <span className="text-red-500">*</span></span>
              <span className="text-[11px] text-red-500 font-normal">Required</span>
            </label>
            <Textarea
              id="sendback-comment"
              placeholder="State plainly what needs to be changed or clarified..."
              value={comment}
              onChange={(e) => {
                setComment(e.target.value);
                if (validationError && e.target.value.trim()) {
                  setValidationError(null);
                }
              }}
              disabled={isSubmitting}
              className="min-h-[110px] text-sm"
            />
            {validationError && (
              <p className="text-xs text-red-600 font-medium">{validationError}</p>
            )}
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
            onClick={handleSendBack}
            disabled={isSubmitting || !comment.trim()}
            className="bg-amber-600 hover:bg-amber-700 text-white gap-1.5"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Sending Back...
              </>
            ) : (
              "Confirm & Send Back"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
