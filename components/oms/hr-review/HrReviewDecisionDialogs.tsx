"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { HrReviewDetailResponse } from "@/types/hr-review";
import { useHrReviewSubmitDecision } from "@/hooks/useHrReview";
import { formatAmount } from "@/lib/money";

interface SharedDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  detail: HrReviewDetailResponse;
  onSuccess: () => void;
}

function useIdempotencyKey(open: boolean) {
  const [key, setKey] = useState<string>("");
  useEffect(() => {
    if (open) {
      setKey(crypto.randomUUID());
    } else {
      setKey("");
    }
  }, [open]);
  return key;
}

export function ApproveOmsDialog({ open, onOpenChange, detail, onSuccess }: SharedDialogProps) {
  const [comment, setComment] = useState("");
  const idempotencyKey = useIdempotencyKey(open);
  const { mutate, isPending } = useHrReviewSubmitDecision();

  const unconfirmed = detail.hrConfirmations.filter((c) => !c.confirmed);
  const canSubmit = comment.trim().length > 0;

  useEffect(() => {
    if (!open) setComment("");
  }, [open]);

  const handleSubmit = () => {
    mutate(
      {
        requestId: detail.request.id,
        payload: { decision: "APPROVE_OMS", comment: comment.trim(), idempotencyKey },
      },
      {
        onSuccess: () => {
          toast.success("Approved", { description: "Request approved successfully." });
          onOpenChange(false);
          onSuccess();
        },
        onError: (err: any) => {
          toast.error("Submission Failed", { description: err?.message || "An error occurred." });
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !isPending && onOpenChange(val)}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Approve Request</DialogTitle>
          <DialogDescription>Approve {detail.request.id} for OMS routing.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {unconfirmed.length > 0 && (
            <div className="rounded-lg border border-warning/30 bg-warning-light p-4">
              <p className="text-[13px] font-semibold text-warning">You have not confirmed:</p>
              <ul className="mt-1 list-inside list-disc text-[13px] font-normal text-warning">
                {unconfirmed.map((c) => <li key={c.code}>{c.label}</li>)}
              </ul>
              <p className="mt-2 text-[13px] font-semibold text-warning">Approve anyway?</p>
            </div>
          )}

          <div className="space-y-2">
            <Label>HR comments <span className="text-destructive">*</span></Label>
            <Textarea 
              value={comment} 
              onChange={(e) => setComment(e.target.value)} 
              placeholder="Required..." 
              disabled={isPending}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!canSubmit || isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirm Approval
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}



export function PermanentHireDialog({ open, onOpenChange, detail, onSuccess }: SharedDialogProps) {
  const [comment, setComment] = useState("");
  const [confirmId, setConfirmId] = useState("");
  const idempotencyKey = useIdempotencyKey(open);
  const { mutate, isPending } = useHrReviewSubmitDecision();

  const canSubmit = confirmId === detail.request.id;

  useEffect(() => {
    if (!open) {
      setComment("");
      setConfirmId("");
    }
  }, [open]);

  const handleSubmit = () => {
    mutate(
      {
        requestId: detail.request.id,
        payload: { decision: "PERMANENT_HIRE", comment: comment.trim(), idempotencyKey },
      },
      {
        onSuccess: () => {
          toast.success("Converted", { description: "Successfully converted to permanent hire." });
          onOpenChange(false);
          onSuccess();
        },
        onError: (err: any) => {
          toast.error("Submission Failed", { description: err?.message || "An error occurred." });
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !isPending && onOpenChange(val)}>
      <DialogContent className="sm:max-w-xl border-destructive/30">
        <DialogHeader>
          <DialogTitle className="text-destructive">Convert to Permanent Hire</DialogTitle>
          <DialogDescription>This is a permanent action that removes the request from OMS.</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="rounded-lg border border-destructive/30 bg-destructive-light p-4">
            <ul className="list-disc list-inside space-y-1 text-[13px] text-destructive font-medium tabular-nums">
              <li>This request leaves OMS</li>
              <li>The job profile, justification and any CV upload to Oracle</li>
              <li>The requisition closes with status &quot;Permanent Hire&quot;</li>
              <li>Reserved funds are released (AED {formatAmount(detail.budget.reserved)})</li>
            </ul>
          </div>

          <div className="space-y-2">
            <Label>HR comments</Label>
            <Textarea value={comment} onChange={(e) => setComment(e.target.value)} disabled={isPending} />
          </div>

          <div className="space-y-2">
            <Label>Type <span className="font-mono font-bold select-all">{detail.request.id}</span> to confirm</Label>
            <Input value={confirmId} onChange={(e) => setConfirmId(e.target.value)} disabled={isPending} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>Cancel</Button>
          <Button variant="destructive" onClick={handleSubmit} disabled={!canSubmit || isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirm Conversion
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function RejectDialog({ open, onOpenChange, detail, onSuccess }: SharedDialogProps) {
  const [comment, setComment] = useState("");
  const [reasonCode, setReasonCode] = useState("");
  const idempotencyKey = useIdempotencyKey(open);
  const { mutate, isPending } = useHrReviewSubmitDecision();

  const canSubmit = comment.trim().length > 0 && reasonCode.length > 0;

  useEffect(() => {
    if (!open) {
      setComment("");
      setReasonCode("");
    }
  }, [open]);

  const handleSubmit = () => {
    mutate(
      {
        requestId: detail.request.id,
        payload: { decision: "REJECT", comment: `[${reasonCode}] ${comment.trim()}`, idempotencyKey },
      },
      {
        onSuccess: () => {
          toast.success("Rejected", { description: "Request has been rejected." });
          onOpenChange(false);
          onSuccess();
        },
        onError: (err: any) => {
          toast.error("Submission Failed", { description: err?.message || "An error occurred." });
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !isPending && onOpenChange(val)}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Reject Request</DialogTitle>
          <DialogDescription>
            Reject {detail.request.id}. AED {formatAmount(detail.budget.reserved)} will be released back to the department.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Reason Code <span className="text-destructive">*</span></Label>
            <Select value={reasonCode} onValueChange={setReasonCode} disabled={isPending}>
              <SelectTrigger>
                <SelectValue placeholder="Select a reason..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BUDGET">Insufficient Budget</SelectItem>
                <SelectItem value="BUSINESS_NEED">Weak Business Need</SelectItem>
                <SelectItem value="POLICY">Policy Violation</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>HR comments <span className="text-destructive">*</span></Label>
            <Textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Required..." disabled={isPending} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>Cancel</Button>
          <Button variant="destructive" onClick={handleSubmit} disabled={!canSubmit || isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Reject Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
