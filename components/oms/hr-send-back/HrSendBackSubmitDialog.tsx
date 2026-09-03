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
} from "lucide-react";
import { formatApproversSentence } from "./HrSendBackModeChooser";
import { format } from "date-fns";

interface HrSendBackSubmitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  options: HrSendBackOptionsResponse;
  mode: ClarificationType;
  message: string;
  asks: HrSendBackAsk[];
  editableFieldKeys: string[];
  attachmentIds: string[];
  isSubmitting: boolean;
  onConfirmSubmit: (idempotencyKey: string) => Promise<void>;
  submitError?: HrSendBackError | null;
  onClearError?: () => void;
  onSwitchToQuestion?: () => void;
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
  isSubmitting,
  onConfirmSubmit,
  submitError,
  onSwitchToQuestion,
}: HrSendBackSubmitDialogProps) {
  const [idempotencyKey] = React.useState<string>(() => {
    return typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `sendback-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  });

  const approversSentence = React.useMemo(
    () => formatApproversSentence(options.reapprovalRoute),
    [options.reapprovalRoute]
  );

  const formattedClosesAt = React.useMemo(() => {
    try {
      return format(new Date(options.deadline.closesAt), "d MMMM");
    } catch {
      return "the deadline";
    }
  }, [options.deadline.closesAt]);

  const modeDetails = {
    MORE_INFO: {
      title: "Ask a question",
      icon: HelpCircle,
      consequenceText:
        "Mariam answers. Nothing needs re-approval and the request stays with you.",
    },
    INFO_WITH_APPROVAL: {
      title: "Ask for changes that need re-approval",
      icon: RefreshCw,
      consequenceText: `Mariam updates the details, then ${approversSentence}`,
    },
    AMEND: {
      title: "Ask her to amend the request",
      icon: AlertOctagon,
      consequenceText: "Mariam revises it. Full approval and budget checks repeat.",
    },
  }[mode];

  const ModeIcon = modeDetails.icon;

  const hasNoFieldsWarning =
    mode !== "MORE_INFO" && editableFieldKeys.length === 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-base font-semibold text-foreground flex items-center gap-2">
            <Send className="size-4 text-primary" />
            <span>Confirm Send-Back to {options.requester.name}</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Review the consequence and structured items before sending this request back.
          </DialogDescription>
        </DialogHeader>

        {/* Error Alert if any */}
        {submitError && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/30 p-3 text-xs text-destructive flex items-start gap-2.5">
            <AlertTriangle className="size-4 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-semibold">Submission failed</p>
              <p className="text-destructive/90">{submitError.message}</p>
            </div>
          </div>
        )}

        {/* Task 4: Warn when mode requires re-approval but no fields were selected */}
        {hasNoFieldsWarning && (
          <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-3.5 text-xs text-amber-900 dark:text-amber-200 space-y-2.5">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="size-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-amber-900 dark:text-amber-200">
                  Mode Mismatch Warning
                </p>
                <p className="text-amber-800 dark:text-amber-300 leading-relaxed">
                  You have asked for changes that need re-approval, but she cannot change any fields. Did you mean to ask a question instead?
                </p>
              </div>
            </div>
            {onSwitchToQuestion && (
              <div className="pl-6.5 pt-1">
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

        <div className="space-y-3.5 py-1">
          {/* Mode & Consequence Summary */}
          <div className="p-3 rounded-lg border border-border/80 bg-muted/30 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
              <ModeIcon className="size-3.5 text-primary" />
              <span>{modeDetails.title}</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {modeDetails.consequenceText}
            </p>
          </div>

          {/* Structured Summary Items */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-lg border border-border/70 bg-card flex items-center gap-2">
              <CheckCircle2 className="size-3.5 text-primary" />
              <span className="text-muted-foreground">
                <strong className="text-foreground">{asks.length}</strong> ask{asks.length === 1 ? "" : "s"} included
              </span>
            </div>

            <div className="p-2.5 rounded-lg border border-border/70 bg-card flex items-center gap-2">
              <Sliders className="size-3.5 text-primary" />
              <span className="text-muted-foreground">
                <strong className="text-foreground">{editableFieldKeys.length}</strong> field{editableFieldKeys.length === 1 ? "" : "s"} unlocked
              </span>
            </div>

            {attachmentIds.length > 0 && (
              <div className="col-span-2 p-2.5 rounded-lg border border-border/70 bg-card flex items-center gap-2">
                <Paperclip className="size-3.5 text-primary" />
                <span className="text-muted-foreground">
                  <strong className="text-foreground">{attachmentIds.length}</strong> attachment{attachmentIds.length === 1 ? "" : "s"} included
                </span>
              </div>
            )}
          </div>

          {/* Deadline reminder */}
          <div className="p-3 rounded-lg border border-border/60 bg-muted/20 flex items-start gap-2 text-xs text-muted-foreground">
            <Clock className="size-3.5 text-primary shrink-0 mt-0.5" />
            <span>
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
            className="text-xs"
          >
            Cancel
          </Button>

          <Button
            type="button"
            disabled={isSubmitting || !message.trim()}
            onClick={() => onConfirmSubmit(idempotencyKey)}
            className="text-xs font-medium"
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
