"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import {
  HrDispositionDefinition,
  HrDispositionSubmission,
  HrReviewRequest,
} from "./hr-review.types";

interface HrDispositionDialogProps {
  open: boolean;
  request: HrReviewRequest;
  action: HrDispositionDefinition | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (
    submission: HrDispositionSubmission
  ) => void | Promise<void>;
}

export function HrDispositionDialog({
  open,
  request,
  action,
  onOpenChange,
  onSubmit,
}: HrDispositionDialogProps) {
  const [comment, setComment] =
    useState("");

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  useEffect(() => {
    if (!open) {
      setComment("");
      setIsSubmitting(false);
    }
  }, [open]);

  if (!action) {
    return null;
  }

  const trimmedComment = comment.trim();

  const canSubmit =
    !action.requiresComment ||
    trimmedComment.length > 0;

  async function handleSubmit() {
    if (!canSubmit || isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit({
        requestId: request.requestId,
        action: action.id,
        comment: trimmedComment,
      });

      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!isSubmitting) {
          onOpenChange(nextOpen);
        }
      }}
    >
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {action.label}
          </DialogTitle>

          <DialogDescription>
            Record the HR decision for{" "}
            {request.requestId} —{" "}
            {request.position}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="rounded-xl border border-border bg-slate-50 p-4">
            <p className="text-sm font-semibold text-foreground">
              {action.label}
            </p>

            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              {action.description}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="hr-disposition-comment">
              HR comments
              {action.requiresComment && (
                <span className="ml-1 text-red-600">
                  *
                </span>
              )}
            </Label>

            <Textarea
              id="hr-disposition-comment"
              value={comment}
              onChange={(event) =>
                setComment(
                  event.target.value
                )
              }
              placeholder="Enter the reason, conditions or supporting HR comments..."
              rows={6}
              disabled={isSubmitting}
              className="resize-none"
            />

            <div className="flex items-center justify-between gap-4">
              <p className="text-xs text-muted-foreground">
                Comments are recorded in
                the request audit history.
              </p>

              <span className="shrink-0 text-xs text-muted-foreground">
                {comment.length} characters
              </span>
            </div>

            {action.requiresComment &&
              comment.length > 0 &&
              trimmedComment.length === 0 && (
                <p className="text-xs text-red-600">
                  Enter a valid comment
                  before continuing.
                </p>
              )}
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={() =>
              onOpenChange(false)
            }
          >
            Cancel
          </Button>

          <Button
            type="button"
            disabled={
              !canSubmit ||
              isSubmitting
            }
            variant={
              action.tone === "danger"
                ? "destructive"
                : "default"
            }
            onClick={handleSubmit}
          >
            {isSubmitting && (
              <Loader2 className="size-4 animate-spin" />
            )}

            Confirm {action.label}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}