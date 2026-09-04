"use client";

import * as React from "react";
import {
  Send,
  AlertTriangle,
  Calendar,
  Clock,
  Video,
  Building2,
  ShieldCheck,
  Loader2,
  AlertCircle,
} from "lucide-react";
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
  InterviewProposedSlot,
  InterviewMethod,
} from "@/src/types/interview-planning";
import {
  formatSlotTimeRange,
  getSlotDateLabel,
  formatReplyByDateDisplay,
} from "../calendar/calendar-utils";

export interface SendErrorState {
  code: string;
  message: string;
  slotStart?: string;
  earliestSlot?: string;
  latestReplyDate?: string;
}

interface SendConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidateRef: string;
  position: string;
  slots: InterviewProposedSlot[];
  method: InterviewMethod;
  platformOrLocation: string;
  durationMinutes: number;
  replyByDate: string;
  candidateTimezone: string;
  isOffshore: boolean;
  onConfirmSend: (idempotencyKey: string) => Promise<void>;
  isSending: boolean;
  sendError: SendErrorState | null;
  idempotencyKey: string;
}

export function SendConfirmationModal({
  isOpen,
  onClose,
  candidateRef,
  position,
  slots,
  method,
  platformOrLocation,
  durationMinutes,
  replyByDate,
  candidateTimezone,
  isOffshore,
  onConfirmSend,
  isSending,
  sendError,
  idempotencyKey,
}: SendConfirmationModalProps) {
  const handleSend = async () => {
    await onConfirmSend(idempotencyKey);
  };

  // Plain-language error mapping (Task 4)
  const renderErrorMessage = (err: SendErrorState) => {
    switch (err.code) {
      case "INTERVIEW_SLOT_TAKEN": {
        const slotLabel = err.slotStart
          ? `${getSlotDateLabel(err.slotStart, "Asia/Dubai")} at ${formatSlotTimeRange(
              err.slotStart,
              durationMinutes,
              "Asia/Dubai"
            )} GST`
          : "a proposed slot";
        return `The slot on ${slotLabel} was booked by a colleague since this page loaded. Please close this dialog, choose another slot, and try again.`;
      }
      case "INTERVIEW_RELAY_UNAVAILABLE":
        return "Slots can't be sent right now. Save as a draft and try again shortly.";
      case "INTERVIEW_NOT_MAIN":
        return "Only the main interviewer can send slots.";
      case "INTERVIEW_REPLY_DATE_INVALID": {
        const earliestSlotIso = [...slots].sort(
          (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
        )[0]?.start;
        const earliest =
          err.earliestSlot ||
          (earliestSlotIso ? getSlotDateLabel(earliestSlotIso, "Asia/Dubai") : "the earliest slot");
        const latestReply =
          err.latestReplyDate ||
          (earliestSlotIso
            ? getSlotDateLabel(
                new Date(new Date(earliestSlotIso).getTime() - 86400000).toISOString(),
                "Asia/Dubai"
              )
            : "1 day prior");

        return `The reply deadline must be before the earliest proposed slot (${earliest}). The latest valid reply date is ${latestReply}.`;
      }
      default:
        return err.message || "An unexpected error occurred while transmitting interview slots.";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isSending && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto p-6 gap-5">
        <DialogHeader className="gap-1 border-b border-border pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Send className="size-4 text-primary" />
              <DialogTitle className="text-base font-semibold text-foreground">
                Confirm Interview Invitation
              </DialogTitle>
            </div>
            <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-full bg-muted border border-border text-foreground">
              {candidateRef}
            </span>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Review the proposed interview details for {position} before sending via the vendor relay.
          </DialogDescription>
        </DialogHeader>

        {/* 1. Restatement of proposal details per Task 3 */}
        <div className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-2.5 p-3 rounded-lg bg-muted/30 border border-border">
            <div>
              <span className="text-[11px] text-muted-foreground block">Candidate</span>
              <span className="font-mono font-semibold text-foreground">{candidateRef}</span>
            </div>
            <div>
              <span className="text-[11px] text-muted-foreground block">Method</span>
              <span className="font-semibold text-foreground flex items-center gap-1">
                {method === "ONLINE" ? (
                  <Video className="size-3 text-primary" />
                ) : (
                  <Building2 className="size-3 text-primary" />
                )}
                {method === "ONLINE" ? "Online" : "In person"}
                {platformOrLocation ? ` (${platformOrLocation})` : ""}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-muted-foreground block">Duration</span>
              <span className="font-semibold text-foreground flex items-center gap-1">
                <Clock className="size-3 text-primary" />
                {durationMinutes} minutes
              </span>
            </div>
            <div>
              <span className="text-[11px] text-muted-foreground block">Reply deadline</span>
              <span className="font-semibold text-foreground flex items-center gap-1">
                <Calendar className="size-3 text-primary" />
                {formatReplyByDateDisplay(replyByDate)}
              </span>
            </div>
          </div>

          {/* Slots breakdown list */}
          <div className="space-y-1.5">
            <span className="font-semibold text-foreground text-xs block">
              Proposed times ({slots.length}):
            </span>
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {slots.map((slot, index) => {
                const dateLabel = getSlotDateLabel(slot.start, "Asia/Dubai");
                const gstRange = formatSlotTimeRange(
                  slot.start,
                  slot.durationMinutes,
                  "Asia/Dubai"
                );
                const offshoreRange = isOffshore
                  ? formatSlotTimeRange(
                      slot.start,
                      slot.durationMinutes,
                      candidateTimezone
                    )
                  : null;

                return (
                  <div
                    key={slot.start || index}
                    className="p-2 rounded-md border border-border bg-card flex items-center justify-between font-mono text-[11px]"
                  >
                    <div>
                      <strong className="text-foreground font-sans mr-2">{dateLabel}</strong>
                      <span className="text-muted-foreground">{gstRange} GST</span>
                    </div>
                    {offshoreRange && (
                      <span className="text-primary font-medium">{offshoreRange} (Candidate)</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Warn but do not block when fewer than 2 slots are proposed (Task 3) */}
          {slots.length < 2 && (
            <div className="p-2.5 rounded-md border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-[11px] flex items-start gap-2">
              <AlertTriangle className="size-3.5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
              <span>
                You have proposed only {slots.length} slot. We recommend proposing 3–5 slots so the candidate has real choice.
              </span>
            </div>
          )}

          {/* Plain-language Error Callout (Task 4) */}
          {sendError && (
            <div className="p-3 rounded-md border border-destructive/40 bg-destructive/10 text-destructive text-[11px] flex items-start gap-2">
              <AlertCircle className="size-4 text-destructive mt-0.5 shrink-0" />
              <div className="space-y-1">
                <p className="font-semibold">Unable to send slots</p>
                <p className="leading-snug">{renderErrorMessage(sendError)}</p>
              </div>
            </div>
          )}

          {/* Reassurance note on relay */}
          <div className="flex items-center gap-2 p-2.5 rounded-lg border border-primary/20 bg-primary/5 text-[11px] text-muted-foreground">
            <ShieldCheck className="size-4 text-primary shrink-0" />
            <span>
              Sent via automated vendor relay. Your identity and the vendor&apos;s identity remain masked.
            </span>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isSending}
            className="cursor-pointer"
          >
            Cancel
          </Button>

          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={handleSend}
            disabled={isSending || slots.length === 0}
            className="gap-1.5 cursor-pointer font-semibold"
          >
            {isSending ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                <span>Sending via relay...</span>
              </>
            ) : (
              <>
                <Send className="size-3.5" />
                <span>Confirm &amp; send {slots.length} {slots.length === 1 ? "slot" : "slots"}</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
