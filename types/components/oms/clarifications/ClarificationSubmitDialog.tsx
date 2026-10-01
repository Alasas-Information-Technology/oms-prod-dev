"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  ClarificationDetail,
  ClarificationPreviewResponse,
  ClarificationSubmitError,
} from "@/types/clarification";
import {
  AlertTriangle,
  Send,
  Loader2,
  GitFork,
  Landmark,
  FileCheck,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import { formatAmount } from "@/lib/money";

interface ClarificationSubmitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clarification: ClarificationDetail;
  preview?: ClarificationPreviewResponse;
  message: string;
  fieldValues: Record<string, any>;
  attachmentIds: string[];
  isSubmitting: boolean;
  onConfirmSubmit: (idempotencyKey: string) => Promise<void>;
  submitError?: ClarificationSubmitError | null;
  onClearError?: () => void;
}

export function ClarificationSubmitDialog({
  open,
  onOpenChange,
  clarification,
  preview,
  message,
  fieldValues,
  attachmentIds,
  isSubmitting,
  onConfirmSubmit,
  submitError,
  onClearError,
}: ClarificationSubmitDialogProps) {
  // Generate idempotencyKey once when dialog opens, so retries reuse the exact same key
  const [idempotencyKey, setIdempotencyKey] = React.useState<string>("");

  React.useEffect(() => {
    if (open) {
      const newKey =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `idem-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      setIdempotencyKey(newKey);
      if (onClearError) onClearError();
    }
  }, [open]);

  const { asks = [], type } = clarification;
  const isMoreInfo = type === "MORE_INFO";

  // Calculate unaddressed asks
  const addressedSet = new Set(
    preview?.asksAddressed !== undefined
      ? preview.asksAddressed
      : asks.filter((a) => a.addressed).map((a) => a.id)
  );

  const unaddressedAsks = asks.filter((a) => !addressedSet.has(a.id));
  const hasUnaddressedAsks = unaddressedAsks.length > 0 && asks.length > 0;

  // Modified diff items
  const changedDiffItems = preview && preview.type !== "MORE_INFO"
    ? (preview.diff || []).filter((d) => d.changed)
    : [];

  // Next approvers list
  const nextApprovers = preview && preview.type !== "MORE_INFO" && preview.route
    ? preview.route.map((r) => r.user?.name || r.label).filter(Boolean)
    : [];

  const handleSubmit = async () => {
    await onConfirmSubmit(idempotencyKey);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
            <Send className="size-5 text-primary" />
            <span>Confirm Clarification Response</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Please review the summary below before submitting your response.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2 text-xs">
          {/* Specific Plain-Language Error Banners per Task 3 */}
          {submitError && (
            <div className="p-3 rounded-lg border bg-destructive/10 border-destructive/30 text-destructive space-y-1.5 animate-in fade-in-50">
              <div className="flex items-center gap-2 font-semibold text-xs">
                <ShieldAlert className="size-4 shrink-0" />
                <span>Unable to Submit Response</span>
              </div>

              {submitError.code === "CLARIFICATION_BUDGET_CHANGED" && (
                <div className="text-xs text-foreground/90 space-y-1">
                  <p>
                    <strong>Budget figures have changed</strong> since this page loaded. Please review the updated figures
                    before resubmitting:
                  </p>
                  {submitError.newBudget && (
                    <div className="p-2.5 rounded-lg bg-background border border-border/80 text-xs space-y-1">
                      <div className="flex justify-between"><span>Current:</span> <span className="font-semibold tabular-nums">AED {formatAmount(submitError.newBudget.currentReservation)}</span></div>
                      <div className="flex justify-between"><span>Change:</span> <span className="font-semibold tabular-nums">AED {formatAmount(submitError.newBudget.changeAmount)}</span></div>
                      <div className="flex justify-between"><span>Available:</span> <span className="font-semibold tabular-nums">AED {formatAmount(submitError.newBudget.lineAvailable)}</span></div>
                    </div>
                  )}
                </div>
              )}

              {submitError.code === "CLARIFICATION_ALREADY_SUBMITTED" && (
                <p className="text-xs text-foreground/90">
                  This clarification was already submitted on {submitError.submittedAt ? new Date(submitError.submittedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "earlier"}.
                </p>
              )}

              {submitError.code === "CLARIFICATION_CLOSED" && (
                <p className="text-xs text-foreground/90">
                  This request was closed automatically. Contact HR to reopen it.
                </p>
              )}

              {submitError.code === "ATTACHMENT_SCAN_PENDING" && (
                <p className="text-xs text-foreground/90">
                  One attachment is still being checked. Try again in a moment.
                </p>
              )}

              {submitError.code === "ATTACHMENT_SCAN_FAILED" && (
                <p className="text-xs text-foreground/90">
                  The file <strong>{submitError.filename || "attached"}</strong> failed security scanning and cannot be used.
                </p>
              )}
            </div>
          )}

          {/* 1. Unaddressed asks warning (WARN but do not block per Task 1) */}
          {hasUnaddressedAsks && (
            <div className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200 space-y-1.5">
              <div className="flex items-center gap-1.5 font-semibold text-xs text-amber-800 dark:text-amber-300">
                <AlertTriangle className="size-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
                <span>Unaddressed Ask Warning</span>
              </div>
              <p className="text-[11.5px] leading-relaxed">
                You have not addressed: <strong>&ldquo;{unaddressedAsks[0].text}&rdquo;</strong>. Submit anyway?
              </p>
            </div>
          )}

          {/* 2. Asks addressed count summary */}
          {asks.length > 0 && (
            <div className="p-3 rounded-lg border border-border/70 bg-muted/20 flex items-center justify-between">
              <span className="font-medium text-muted-foreground flex items-center gap-2">
                <FileCheck className="size-4 text-primary" />
                <span>HR Asks Addressed:</span>
              </span>
              <span className="font-semibold text-foreground">
                {asks.length - unaddressedAsks.length} of {asks.length} addressed
              </span>
            </div>
          )}

          {/* 3. Changed fields summary */}
          {changedDiffItems.length > 0 && (
            <div className="p-3 rounded-lg border border-border/70 bg-muted/20 space-y-2">
              <span className="font-semibold text-foreground block">
                What is changing ({changedDiffItems.length} field{changedDiffItems.length > 1 ? "s" : ""}):
              </span>
              <div className="space-y-1.5 divide-y divide-border/40">
                {changedDiffItems.map((item) => (
                  <div key={item.fieldKey} className="pt-1.5 first:pt-0 flex items-center justify-between gap-2 text-[11.5px]">
                    <span className="font-medium text-foreground">{item.label}</span>
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <span className="line-through text-muted-foreground/80">{item.before}</span>
                      <ArrowRight className="size-3 text-primary" />
                      <strong className="text-emerald-700 dark:text-emerald-300 font-semibold">{item.after}</strong>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. Approver chain routing summary */}
          {!isMoreInfo && nextApprovers.length > 0 && (
            <div className="p-3 rounded-lg border border-border/70 bg-muted/20 space-y-1">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <GitFork className="size-3.5 text-primary" />
                <span>Next Approvers:</span>
              </span>
              <p className="text-muted-foreground text-[11.5px]">
                Goes to <strong>{nextApprovers.join(", ")}</strong> for approval.
              </p>
            </div>
          )}

          {/* 5. Budget result summary */}
          {!isMoreInfo && preview && preview.type !== "MORE_INFO" && preview.budget && preview.budget.applicable && (
            <div className="p-3 rounded-lg border border-border/70 bg-muted/20 flex items-center justify-between">
              <span className="font-medium text-muted-foreground flex items-center gap-1.5">
                <Landmark className="size-3.5 text-primary" />
                <span>Budget Status:</span>
              </span>
              <span className="font-semibold text-foreground">
                {preview.budget.result === "WITHIN_BUDGET" && "Still within budget"}
                {preview.budget.result === "REQUIRES_AMENDMENT" && "Starts budget amendment"}
                {preview.budget.result === "INSUFFICIENT" && "Insufficient budget"}
              </span>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0 pt-3 border-t border-border/60">
          <Button
            type="button"
            variant="ghost"
            disabled={isSubmitting}
            onClick={() => onOpenChange(false)}
            className="text-xs h-9"
          >
            Cancel
          </Button>

          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="text-xs h-9 px-4 font-semibold shadow-xs"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-3.5 animate-spin mr-1.5" />
                <span>Submitting response...</span>
              </>
            ) : (
              <>
                <Send className="size-3.5 mr-1.5" />
                <span>Confirm & submit response</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
