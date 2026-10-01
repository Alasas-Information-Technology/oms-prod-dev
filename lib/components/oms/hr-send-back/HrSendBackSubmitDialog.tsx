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
  HrSendBackOptionsResponse,
  ClarificationType,
  HrSendBackAsk,
  HrSendBackError,
} from "@/src/types/hr-send-back";
import {
  Send,
  Loader2,
  Clock,
  CheckCircle2,
  Sliders,
  AlertTriangle,
  HelpCircle,
  RefreshCw,
  AlertOctagon,
  Paperclip,
  GitFork,
  Info,
  XCircle,
} from "lucide-react";
import { formatApproversSentence } from "./HrSendBackModeChooser";
import { format } from "date-fns";
import { formatAmount } from "@/lib/money";

interface HrSendBackSubmitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  options: HrSendBackOptionsResponse;
  mode: ClarificationType;
  message: string;
  asks: HrSendBackAsk[];
  editableFieldKeys: string[];
  attachmentIds: string[];
  idempotencyKey: string;
  isSubmitting: boolean;
  onConfirmSubmit: (idempotencyKey: string) => Promise<void>;
  submitError?: HrSendBackError | null;
  onClearError?: () => void;
  onSwitchToQuestion?: () => void;
  onDeselectField?: (fieldKey: string) => void;
}

export function HrSendBackSubmitDialog({
  open,
  onOpenChange,
  options,
  mode,
  message,
  asks,
  editableFieldKeys,
  attachmentIds,
  idempotencyKey,
  isSubmitting,
  onConfirmSubmit,
  submitError,
  onClearError,
  onSwitchToQuestion,
  onDeselectField,
}: HrSendBackSubmitDialogProps) {
  // Plain words approver sequence
  const approversSentence = React.useMemo(
    () => formatApproversSentence(options.reapprovalRoute),
    [options.reapprovalRoute]
  );

  // Formatted deadline date
  const formattedClosesAt = React.useMemo(() => {
    try {
      return format(new Date(options.deadline.closesAt), "d MMMM");
    } catch {
      return "the deadline";
    }
  }, [options.deadline.closesAt]);

  // Selected field labels for Task 1: "Which fields she can change"
  const selectedFieldsList = React.useMemo(() => {
    if (mode === "MORE_INFO") return [];
    return (options.selectableFields || []).filter((f) =>
      editableFieldKeys.includes(f.key)
    );
  }, [mode, options.selectableFields, editableFieldKeys]);

  // Mode details in plain language (Task 1)
  const modeDetails = React.useMemo(() => {
    switch (mode) {
      case "MORE_INFO":
        return {
          title: "Ask a question",
          icon: HelpCircle,
          badgeColor: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20",
          consequenceText: `${options.requester.name} answers your question. Nothing needs re-approval and the request stays with you.`,
          returnPathText: "Returns directly to you (no re-approval required)",
        };
      case "INFO_WITH_APPROVAL":
        return {
          title: "Ask for changes that need re-approval",
          icon: RefreshCw,
          badgeColor: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
          consequenceText: `${options.requester.name} updates the details, then returns through ${approversSentence} before returning to you.`,
          returnPathText: `Returns through ${approversSentence} and then back to HR Review.`,
        };
      case "AMEND":
        return {
          title: "Ask her to amend the request",
          icon: AlertOctagon,
          badgeColor: "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20",
          consequenceText: `${options.requester.name} revises the request. Full approval chain and budget re-checks repeat.`,
          returnPathText: `Returns through ${approversSentence} with full re-approval.`,
        };
    }
  }, [mode, options.requester.name, approversSentence]);

  const ModeIcon = modeDetails.icon;

  // TASK 2: Non-blocking warning 1 — Re-approval mode with no fields selected
  const hasNoFieldsWarning =
    mode !== "MORE_INFO" && editableFieldKeys.length === 0;

  // TASK 2: Non-blocking warning 2 — No asks added
  const hasNoAsksWarning = asks.length === 0;

  // TASK 4: Plain error formatting
  const formattedError = React.useMemo(() => {
    if (!submitError) return null;

    const code = submitError.code;

    if (code === "SEND_BACK_FIELD_NOT_SELECTABLE" || code === "FIELD_NOT_SELECTABLE") {
      const field = (options.selectableFields || []).find(
        (f) => f.key === submitError.fieldKey
      );
      const fieldName =
        submitError.fieldName || field?.label || submitError.fieldKey || "A selected field";
      return {
        title: "Field no longer selectable",
        message: `"${fieldName}" may have been locked since the page loaded. Remove it and retry.`,
        fieldKey: submitError.fieldKey,
      };
    }

    if (code === "SEND_BACK_ALREADY_DECIDED") {
      const decider = submitError.decidedBy || "another reviewer";
      return {
        title: "Request already decided",
        message: `This request was already decided by ${decider}.`,
      };
    }

    if (code === "ATTACHMENT_SCAN_PENDING") {
      return {
        title: "Attachment scan in progress",
        message: "One attachment is still being checked.",
      };
    }

    if (code === "HR_REVIEW_BUDGET_CHANGED") {
      const budgetReserved = submitError.currentBudget?.reserved ?? options.budget?.reserved;
      const budgetNote = submitError.currentBudget?.note ?? options.budget?.note;
      return {
        title: "Budget figures changed",
        message: `The request budget has changed. Current reserved amount: AED ${
          budgetReserved !== undefined ? formatAmount(budgetReserved) : "—"
        }. Current figures must be reviewed before sending back; do not auto-resubmit.`,
        budgetNote,
      };
    }

    return {
      title: "Submission failed",
      message: submitError.message || "Failed to send request back. Please try again.",
    };
  }, [submitError, options.selectableFields, options.budget]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-1.5">
          <DialogTitle className="text-base font-semibold text-foreground flex items-center gap-2">
            <Send className="size-4 text-primary" />
            <span>Confirm Send-Back to {options.requester.name}</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Please review the plain summary below before sending this request back.
          </DialogDescription>
        </DialogHeader>

        {/* TASK 4: Error Banner with Plain Messages */}
        {formattedError && (
          <div className="rounded-xl bg-destructive/10 border border-destructive/30 p-3.5 text-xs text-destructive space-y-2">
            <div className="flex items-start gap-2.5">
              <XCircle className="size-4 shrink-0 mt-0.5" />
              <div className="space-y-1 min-w-0 flex-1">
                <p className="font-semibold text-destructive">
                  {formattedError.title}
                </p>
                <p className="text-destructive/90 leading-relaxed">
                  {formattedError.message}
                </p>
              </div>
            </div>

            {/* If field was locked, provide one-click button to deselect it */}
            {formattedError.fieldKey && onDeselectField && (
              <div className="pl-6.5 pt-1">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    if (formattedError.fieldKey) {
                      onDeselectField(formattedError.fieldKey);
                    }
                    if (onClearError) onClearError();
                  }}
                  className="h-7 text-xs bg-background/90 hover:bg-background border-destructive/40 text-destructive shadow-2xs cursor-pointer"
                >
                  Deselect locked field and retry
                </Button>
              </div>
            )}
          </div>
        )}

        {/* TASK 2: Warning 1 — Re-approval mode with no fields selected (warns and allows) */}
        {hasNoFieldsWarning && (
          <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-3.5 text-xs text-amber-900 dark:text-amber-200 space-y-2.5">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="size-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1 min-w-0 flex-1">
                <p className="font-semibold text-amber-900 dark:text-amber-200">
                  Mode Mismatch Advisory
                </p>
                <p className="text-amber-800 dark:text-amber-300 leading-relaxed">
                  You have asked for changes that need re-approval, but she cannot change any fields. Did you mean to ask a question instead?
                </p>
              </div>
            </div>
            {onSwitchToQuestion && (
              <div className="pl-6.5 pt-0.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onSwitchToQuestion}
                  className="h-7 text-xs bg-background/80 hover:bg-background border-amber-500/40 text-amber-900 dark:text-amber-200 shadow-2xs cursor-pointer"
                >
                  Switch to &quot;Ask a question&quot;
                </Button>
              </div>
            )}
          </div>
        )}

        {/* TASK 2: Warning 2 — No asks added (warns and allows) */}
        {hasNoAsksWarning && (
          <div className="rounded-xl bg-blue-500/10 border border-blue-500/30 p-3.5 text-xs text-blue-900 dark:text-blue-200">
            <div className="flex items-start gap-2.5">
              <Info className="size-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div className="space-y-1 min-w-0 flex-1">
                <p className="font-semibold text-blue-900 dark:text-blue-200">
                  No specific items added
                </p>
                <p className="text-blue-800 dark:text-blue-300 leading-relaxed">
                  She will see only your message. Add specific items so she knows exactly what to address.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TASK 1: Restatement Section */}
        <div className="space-y-3 py-1">
          {/* 1. Which mode, in plain words */}
          <div className="p-3.5 rounded-xl border border-border/80 bg-muted/30 space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                <ModeIcon className="size-3.5 text-primary" />
                <span>{modeDetails.title}</span>
              </div>
              <span
                className={`text-[10.5px] uppercase font-semibold px-2 py-0.5 rounded border ${modeDetails.badgeColor}`}
              >
                {mode.replace(/_/g, " ")}
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {modeDetails.consequenceText}
            </p>
          </div>

          {/* Structured items grid */}
          <div className="space-y-2.5 text-xs">
            {/* 2. How many things you are asking for */}
            <div className="p-3 rounded-lg border border-border/70 bg-card space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-3.5 text-primary" />
                  <span className="font-semibold text-foreground">
                    Things you are asking for:
                  </span>
                </div>
                <span className="font-medium text-muted-foreground">
                  {asks.length} {asks.length === 1 ? "item" : "items"}
                </span>
              </div>
              {asks.length > 0 ? (
                <ul className="pl-5 list-disc space-y-1 text-muted-foreground text-[11.5px]">
                  {asks.map((ask, idx) => (
                    <li key={ask.id || idx} className="truncate">
                      {ask.text}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground italic text-[11.5px]">
                  None (message only)
                </p>
              )}
            </div>

            {/* 3. Which fields she can change */}
            <div className="p-3 rounded-lg border border-border/70 bg-card space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sliders className="size-3.5 text-primary" />
                  <span className="font-semibold text-foreground">
                    Fields she can change:
                  </span>
                </div>
                <span className="font-medium text-muted-foreground">
                  {selectedFieldsList.length} unlocked
                </span>
              </div>
              {selectedFieldsList.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {selectedFieldsList.map((field) => (
                    <span
                      key={field.key}
                      className="inline-flex items-center gap-1 text-[11px] font-medium bg-muted/80 text-foreground px-2 py-0.5 rounded border border-border/60"
                    >
                      {field.label}
                      {field.financialImpact && (
                        <span className="text-[9.5px] font-semibold text-amber-600 dark:text-amber-400">
                          (Financial)
                        </span>
                      )}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground italic text-[11.5px]">
                  {mode === "MORE_INFO"
                    ? "None (request data remains read-only)"
                    : "None selected"}
                </p>
              )}
            </div>

            {/* 4. Who it returns through, by name */}
            <div className="p-3 rounded-lg border border-border/70 bg-card space-y-1">
              <div className="flex items-center gap-2">
                <GitFork className="size-3.5 text-primary" />
                <span className="font-semibold text-foreground">
                  Return route:
                </span>
              </div>
              <p className="text-muted-foreground text-[11.5px] leading-relaxed">
                {modeDetails.returnPathText}
              </p>
            </div>

            {/* Attachments if any */}
            {attachmentIds.length > 0 && (
              <div className="p-2.5 rounded-lg border border-border/70 bg-card flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Paperclip className="size-3.5 text-primary" />
                  <span className="font-semibold text-foreground">
                    Attachments:
                  </span>
                </div>
                <span className="text-muted-foreground font-medium">
                  {attachmentIds.length} {attachmentIds.length === 1 ? "file" : "files"} attached
                </span>
              </div>
            )}
          </div>

          {/* 5. When it closes if she does not respond */}
          <div className="p-3 rounded-lg border border-border/60 bg-muted/20 flex items-start gap-2.5 text-xs text-muted-foreground">
            <Clock className="size-4 text-primary shrink-0 mt-0.5" />
            <span className="leading-relaxed">
              She has <strong>{options.deadline.daysAllowed} days</strong> to respond,
              or the request closes automatically on <strong>{formattedClosesAt}</strong>.
            </span>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0 pt-2">
          <Button
            variant="ghost"
            type="button"
            disabled={isSubmitting}
            onClick={() => onOpenChange(false)}
            className="text-xs cursor-pointer"
          >
            Cancel
          </Button>

          {/* TASK 3: Button disabled during submission, idempotency key passed */}
          <Button
            type="button"
            disabled={isSubmitting || !message.trim()}
            onClick={() => onConfirmSubmit(idempotencyKey)}
            className="text-xs font-medium cursor-pointer shadow-xs"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-3.5 animate-spin mr-1.5" />
                Sending back...
              </>
            ) : (
              <>
                <Send className="size-3.5 mr-1.5" />
                Confirm and send back
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
