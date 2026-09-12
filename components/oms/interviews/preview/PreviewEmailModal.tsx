"use client";

import * as React from "react";
import {
  Mail,
  ShieldCheck,
  Calendar,
  Clock,
  Video,
  Building2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  InterviewProposedSlot,
  InterviewMethod,
} from "@/src/types/interview-planning";
import {
  formatSlotTimeRange,
  getSlotDateLabel,
} from "../calendar/calendar-utils";

interface PreviewEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidateRef: string;
  position: string;
  method: InterviewMethod;
  platformOrLocation: string;
  durationMinutes: number;
  slots: InterviewProposedSlot[];
  replyByDate: string;
  candidateTimezone: string;
  isOffshore: boolean;
  allowAlternatives?: boolean;
}

export function PreviewEmailModal({
  isOpen,
  onClose,
  candidateRef,
  position,
  method,
  platformOrLocation,
  durationMinutes,
  slots,
  replyByDate,
  candidateTimezone,
  isOffshore,
  allowAlternatives = true,
}: PreviewEmailModalProps) {
  // Format replyByDate for clean candidate display
  const formattedReplyDate = React.useMemo(() => {
    if (!replyByDate) return "within 3 working days";
    const d = new Date(`${replyByDate}T00:00:00Z`);
    return new Intl.DateTimeFormat("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    }).format(d);
  }, [replyByDate]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-6 gap-5">
        {/* Modal Header */}
        <DialogHeader className="gap-1 border-b border-border pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="size-4 text-primary" />
              <DialogTitle className="text-base font-semibold text-foreground">
                Candidate Email Preview
              </DialogTitle>
            </div>
            <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-full bg-muted border border-border text-foreground">
              {candidateRef}
            </span>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            This is exactly what they receive.
          </DialogDescription>
        </DialogHeader>

        {/* 1. Reassuring Blind Boundary Notice per Task 1 & 2 */}
        <div className="p-3 rounded-lg border border-primary/20 bg-primary/5 text-xs text-foreground flex items-start gap-2.5">
          <ShieldCheck className="size-4 text-primary mt-0.5 shrink-0" />
          <div className="space-y-0.5">
            <p className="font-semibold text-primary">
              Blind Review Boundary Enforced
            </p>
            <p className="text-muted-foreground text-[11px] leading-relaxed">
              Sent through the vendor relay. The vendor&apos;s identity stays hidden from you,
              and your contact details stay hidden from them. Contains <strong>no interviewer names</strong>, <strong>no department</strong>, <strong>no request reference</strong>, and <strong>no vendor identity</strong>.
            </p>
          </div>
        </div>

        {/* 2. Realistic Email Envelope & Body */}
        <div className="rounded-lg border border-border bg-card shadow-2xs overflow-hidden">
          {/* Email Header Fields */}
          <div className="p-3.5 bg-muted/30 border-b border-border space-y-1.5 text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground w-16 shrink-0">From:</span>
              <span className="text-foreground font-sans">
                DIEZ Interviews Relay &lt;relay@diez.gov.ae&gt;
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground w-16 shrink-0">To:</span>
              <span className="text-foreground font-sans">
                Candidate ({candidateRef}) &lt;candidate-relay@diez.gov.ae&gt;
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground w-16 shrink-0">Subject:</span>
              <span className="font-semibold text-foreground font-sans">
                Interview Invitation: {position}
              </span>
            </div>
          </div>

          {/* Email Body */}
          <div className="p-6 bg-background space-y-5 text-sm leading-relaxed text-foreground">
            {/* Branding Header */}
            <div className="border-b border-border/80 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold tracking-tight text-primary text-base">
                  DIEZ
                </span>
                <span className="text-xs text-muted-foreground">
                  Talent Acquisition
                </span>
              </div>
              <span className="text-[11px] text-muted-foreground font-mono">
                Ref: {candidateRef}
              </span>
            </div>

            {/* Greeting & Intro */}
            <div className="space-y-2 text-xs">
              <p className="font-medium text-foreground">Dear Candidate,</p>
              <p className="text-muted-foreground">
                You have been shortlisted and invited to an interview for the{" "}
                <strong className="text-foreground font-semibold">
                  {position}
                </strong>{" "}
                position.
              </p>
            </div>

            {/* Key Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-3 rounded-lg bg-muted/30 border border-border text-xs">
              <div className="space-y-0.5">
                <span className="text-[11px] text-muted-foreground block flex items-center gap-1">
                  {method === "ONLINE" ? (
                    <Video className="size-3 text-primary" />
                  ) : (
                    <Building2 className="size-3 text-primary" />
                  )}
                  Method
                </span>
                <span className="font-semibold text-foreground">
                  {method === "ONLINE" ? "Online" : "In person"}
                </span>
                <span className="text-[10px] text-muted-foreground block truncate">
                  {platformOrLocation || "Details provided upon confirmation"}
                </span>
              </div>

              <div className="space-y-0.5">
                <span className="text-[11px] text-muted-foreground block flex items-center gap-1">
                  <Clock className="size-3 text-primary" />
                  Duration
                </span>
                <span className="font-semibold text-foreground">
                  {durationMinutes} minutes
                </span>
              </div>

              <div className="space-y-0.5">
                <span className="text-[11px] text-muted-foreground block flex items-center gap-1">
                  <Calendar className="size-3 text-primary" />
                  Reply Deadline
                </span>
                <span className="font-semibold text-foreground">
                  {formattedReplyDate}
                </span>
              </div>
            </div>

            {/* Proposed Slots Selection */}
            <div className="space-y-2 pt-1">
              <h4 className="text-xs font-semibold text-foreground">
                Please select one of the following proposed times:
              </h4>

              {slots.length === 0 ? (
                <div className="p-3 rounded-lg border border-border/80 bg-muted/20 text-xs text-muted-foreground italic text-center">
                  No slots have been proposed yet. Please propose 3–5 slots in the calendar.
                </div>
              ) : (
                <div className="space-y-2">
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
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-lg border border-border bg-card hover:border-primary/40 transition-colors"
                      >
                        <div className="space-y-0.5">
                          <span className="text-xs font-semibold text-foreground block">
                            Option {index + 1}: {dateLabel}
                          </span>
                          <div className="text-xs font-mono text-muted-foreground">
                            <span>{gstRange} GST</span>
                            {offshoreRange && (
                              <span className="text-primary/90 font-medium">
                                {" "}
                                · {offshoreRange} (Your local time)
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="shrink-0">
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-primary px-2.5 py-1 rounded-md border border-primary/30 bg-primary/5">
                            Select Slot
                            <ExternalLink className="size-3" />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Alternative Times note */}
            {allowAlternatives && (
              <p className="text-xs text-muted-foreground">
                If none of the above times are convenient, you may suggest alternative times using the confirmation link.
              </p>
            )}

            {/* Relay Footer Notice */}
            <div className="pt-4 border-t border-border/70 text-[11px] text-muted-foreground/80 space-y-1">
              <p>
                Sent via DIEZ Automated Interview Relay under the blind evaluation framework.
              </p>
              <p className="italic">
                Do not reply directly to this email. Use the secure link above to submit your response.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Note & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <AlertCircle className="size-3.5 text-muted-foreground/80 shrink-0" />
            <span>This is exactly what they receive.</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="h-8.5 px-4 text-xs font-medium cursor-pointer"
          >
            Close preview
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
