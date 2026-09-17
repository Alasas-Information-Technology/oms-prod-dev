"use client";

import * as React from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  ChevronRight,
  Video,
  CheckCircle2,
  CalendarCheck,
  AlertTriangle,
  AlertCircle,
  HelpCircle,
  ArrowLeft,
  CalendarPlus,
  Send,
  Building2,
  User,
  ShieldCheck,
  ExternalLink,
  MessageSquare,
  Sparkles,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  getVendorInterviewProposal,
  selectVendorInterviewSlot,
  requestVendorAlternativeSlots,
} from "@/src/lib/demo-data";
import {
  VendorInterviewProposalData,
  VendorInterviewProposalSlot,
} from "@/src/lib/demo-data/entities";
import { cn } from "@/lib/utils";

interface VendorInterviewResponseWorkspaceProps {
  candidateRef: string;
  vendorId?: string;
  className?: string;
}

export function VendorInterviewResponseWorkspace({
  candidateRef,
  vendorId = "ven-falcon",
  className,
}: VendorInterviewResponseWorkspaceProps) {
  // Load proposal data for candidate
  const [proposal, setProposal] = React.useState<VendorInterviewProposalData | null>(() =>
    getVendorInterviewProposal(candidateRef, vendorId)
  );

  // Selected slot state
  const [selectedSlotStart, setSelectedSlotStart] = React.useState<string | null>(null);

  // Alternative slots state
  const [isRequestingAlternatives, setIsRequestingAlternatives] = React.useState(false);
  const [alternativeNote, setAlternativeNote] = React.useState("");
  const [noteError, setNoteError] = React.useState<string | null>(null);

  // Feedback banner state
  const [actionSuccessMessage, setActionSuccessMessage] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Handle case where proposal or candidate not found
  if (!proposal) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="size-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
          <AlertCircle className="size-6" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-foreground">Interview Proposal Not Found</h2>
          <p className="text-xs text-muted-foreground max-w-md">
            Could not find an active interview proposal for candidate reference{" "}
            <code className="px-1.5 py-0.5 rounded bg-muted">{candidateRef}</code>.
            The proposal may have already concluded or is assigned to another vendor.
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/vendor/submissions/history">
            <ArrowLeft className="size-4 mr-2" />
            Back to Submission History
          </Link>
        </Button>
      </div>
    );
  }

  // Handle slot confirmation
  const handleConfirmSlot = () => {
    if (!selectedSlotStart) return;
    setIsSubmitting(true);
    try {
      const res = selectVendorInterviewSlot(candidateRef, selectedSlotStart, vendorId);
      setProposal(res.proposal);
      setActionSuccessMessage("Interview time slot successfully confirmed!");
      setIsRequestingAlternatives(false);
    } catch (err: any) {
      alert(err?.message || "Failed to confirm interview slot.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle requesting alternative slots
  const handleSubmitAlternativeRequest = () => {
    if (!alternativeNote.trim()) {
      setNoteError("Please provide a brief note explaining the candidate's availability.");
      return;
    }
    if (alternativeNote.trim().length < 10) {
      setNoteError("Please enter a few more details (minimum 10 characters).");
      return;
    }

    setNoteError(null);
    setIsSubmitting(true);
    try {
      const res = requestVendorAlternativeSlots(candidateRef, alternativeNote, vendorId);
      setProposal(res.proposal);
      setActionSuccessMessage(
        "Alternative slots requested. The hiring team has been notified."
      );
      setIsRequestingAlternatives(false);
    } catch (err: any) {
      setNoteError(err?.message || "Failed to submit alternative request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generate .ics calendar download file
  const handleDownloadIcs = () => {
    if (!proposal.scheduledSlot) return;

    const summary = `Interview: ${proposal.candidateName} — ${proposal.positionTitle}`;
    const description = `Interview for ${proposal.positionTitle} with ${proposal.hiringTeam}\nCandidate: ${proposal.candidateName} (${proposal.candidateRef})\nRequisition: ${proposal.requisitionId}\nPlatform: ${proposal.platform || "Microsoft Teams"}`;
    const location = proposal.platform ? `${proposal.platform} Video Conference` : "Online Video Call";

    const startDate = new Date(proposal.scheduledSlot.start);
    const endDate = new Date(
      startDate.getTime() + proposal.scheduledSlot.durationMinutes * 60 * 1000
    );

    const formatIcsDate = (d: Date) =>
      d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//DIEZ OMS//Vendor Portal//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      `UID:diez-interview-${proposal.candidateRef}-${Date.now()}@diez.ae`,
      `DTSTAMP:${formatIcsDate(new Date())}`,
      `DTSTART:${formatIcsDate(startDate)}`,
      `DTEND:${formatIcsDate(endDate)}`,
      `SUMMARY:${summary}`,
      `DESCRIPTION:${description.replace(/\n/g, "\\n")}`,
      `LOCATION:${location}`,
      "STATUS:CONFIRMED",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `interview-${proposal.candidateRef}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Google Calendar Link
  const getGoogleCalendarLink = () => {
    if (!proposal.scheduledSlot) return "#";
    const startDate = new Date(proposal.scheduledSlot.start);
    const endDate = new Date(
      startDate.getTime() + proposal.scheduledSlot.durationMinutes * 60 * 1000
    );
    const formatUtc = (d: Date) =>
      d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

    const params = new URLSearchParams({
      action: "TEMPLATE",
      text: `Interview: ${proposal.candidateName} — ${proposal.positionTitle}`,
      details: `Interview for ${proposal.positionTitle} with ${proposal.hiringTeam}\nCandidate: ${proposal.candidateName} (${proposal.candidateRef})\nPlatform: ${proposal.platform || "Microsoft Teams"}`,
      location: proposal.platform || "Microsoft Teams",
      dates: `${formatUtc(startDate)}/${formatUtc(endDate)}`,
    });
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  };

  const isConfirmed = proposal.status === "CONFIRMED";
  const isAlternativeRequested = proposal.status === "ALTERNATIVE_REQUESTED";

  return (
    <div className={cn("w-full flex flex-col bg-background pb-16 space-y-6", className)}>
      {/* 1. Top Breadcrumb and Header */}
      <div className="w-full bg-background border-b border-border/70 px-4 sm:px-6 py-4 space-y-3 transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Link href="/vendor" className="hover:text-foreground transition-colors">
                Vendor Portal
              </Link>
              <ChevronRight className="size-3.5 text-muted-foreground/60" />
              <Link
                href="/vendor/submissions/history"
                className="hover:text-foreground transition-colors"
              >
                Submissions
              </Link>
              <ChevronRight className="size-3.5 text-muted-foreground/60" />
              <span className="text-muted-foreground">{proposal.candidateRef}</span>
              <ChevronRight className="size-3.5 text-muted-foreground/60" />
              <span className="text-foreground font-semibold">Interview Schedule</span>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <Calendar className="size-6 text-teal-600 dark:text-teal-400" />
                Interview Response · {proposal.candidateName}
              </h1>
              <Badge variant="outline" className="text-xs border-border/80">
                {proposal.candidateRef}
              </Badge>
              {isConfirmed ? (
                <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-xs font-semibold flex items-center gap-1">
                  <CheckCircle2 className="size-3" />
                  Confirmed & Scheduled
                </Badge>
              ) : isAlternativeRequested ? (
                <Badge className="bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30 text-xs font-medium">
                  Alternative Slots Requested
                </Badge>
              ) : (
                <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 text-xs font-semibold animate-pulse flex items-center gap-1">
                  <span className="size-1.5 rounded-full bg-amber-500" />
                  Response Needed
                </Badge>
              )}
            </div>

            <p className="text-xs sm:text-sm text-muted-foreground">
              Candidate: <span className="font-semibold text-foreground">{proposal.candidateName}</span> ·
              Target Position: <span className="font-semibold text-foreground">{proposal.positionTitle}</span> ({proposal.requisitionId})
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button asChild variant="outline" size="sm" className="text-xs gap-1.5">
              <Link href="/vendor/submissions/history">
                <ArrowLeft className="size-3.5" />
                Back to Submissions
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 max-w-4xl mx-auto w-full space-y-6">
        {/* Success / Notification Banner */}
        {actionSuccessMessage && (
          <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-3">
            <CheckCircle2 className="size-5 text-emerald-600 shrink-0" />
            <div className="flex-1 font-medium">{actionSuccessMessage}</div>
          </div>
        )}

        {/* 2. Deadline Severity Banner (amber under 2 days, red under 1) */}
        {!isConfirmed && !isAlternativeRequested && (
          <div
            className={cn(
              "p-4 rounded-xl border text-xs flex items-start gap-3 transition-colors shadow-2xs",
              proposal.urgencySeverity === "red"
                ? "border-rose-500/40 bg-rose-50/70 dark:bg-rose-950/30 text-rose-900 dark:text-rose-200"
                : proposal.urgencySeverity === "amber"
                ? "border-amber-500/40 bg-amber-50/70 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200"
                : "border-teal-500/30 bg-teal-50/40 dark:bg-teal-950/20 text-teal-900 dark:text-teal-200"
            )}
          >
            {proposal.urgencySeverity === "red" ? (
              <AlertCircle className="size-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            ) : proposal.urgencySeverity === "amber" ? (
              <Clock className="size-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5 animate-pulse" />
            ) : (
              <Info className="size-5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
            )}
            <div className="space-y-0.5 flex-1">
              <div className="font-semibold text-sm">
                {proposal.urgencySeverity === "red"
                  ? "Urgent: Interview Response Deadline Closing Soon"
                  : proposal.urgencySeverity === "amber"
                  ? "Time-Sensitive: Response Deadline Approaching"
                  : "Interview Time Slots Awaiting Response"}
              </div>
              <p className="text-xs opacity-90">
                Please confirm candidate availability for one of the proposed slots by{" "}
                <span className="font-bold underline">{proposal.replyByDate}</span> (
                {proposal.daysRemaining <= 1
                  ? "less than 24 hours remaining"
                  : `${proposal.daysRemaining} days remaining`}
                ). If the candidate is unavailable, you may request alternative slots below.
              </p>
            </div>
          </div>
        )}

        {/* 3. Requisition & Anonymized Interviewer Card */}
        {/* Server Requirement 4: The interviewer renders ONLY as "The hiring team for {Position}." */}
        <Card className="p-4 sm:p-5 rounded-xl border border-border/80 bg-card shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <ShieldCheck className="size-4 text-teal-600 dark:text-teal-400" />
              Interview Context & Meeting Details
            </span>
            <span className="text-[11px] text-muted-foreground">
              {proposal.requisitionId}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            {/* Anonymized Interviewer */}
            <div className="space-y-1">
              <span className="text-muted-foreground text-[11px] font-medium block">
                Conducted by
              </span>
              <div className="font-semibold text-foreground flex items-center gap-1.5">
                <Building2 className="size-3.5 text-muted-foreground shrink-0" />
                {/* Server Requirement 4: ONLY "The hiring team for {Position}." */}
                <span>{proposal.hiringTeam}</span>
              </div>
            </div>

            {/* Platform & Method */}
            <div className="space-y-1">
              <span className="text-muted-foreground text-[11px] font-medium block">
                Meeting Format
              </span>
              <div className="font-medium text-foreground flex items-center gap-1.5">
                <Video className="size-3.5 text-teal-600 shrink-0" />
                <span>
                  {proposal.platform === "MICROSOFT_TEAMS"
                    ? "Microsoft Teams (Online)"
                    : "Video Conference"}
                </span>
              </div>
            </div>

            {/* Candidate */}
            <div className="space-y-1">
              <span className="text-muted-foreground text-[11px] font-medium block">
                Candidate
              </span>
              <div className="font-medium text-foreground flex items-center gap-1.5">
                <User className="size-3.5 text-muted-foreground shrink-0" />
                <span>
                  {proposal.candidateName} ({proposal.candidateRef})
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* 4. CONFIRMED READ-ONLY MODE */}
        {isConfirmed && proposal.scheduledSlot ? (
          <Card className="p-6 rounded-xl border-2 border-emerald-500/40 bg-emerald-50/30 dark:bg-emerald-950/20 shadow-sm space-y-6">
            <div className="flex items-start gap-4">
              <div className="size-10 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <CalendarCheck className="size-6" />
              </div>
              <div className="space-y-1 flex-1">
                <div className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                  Agreed & Confirmed Time
                </div>
                <h3 className="text-xl font-bold text-foreground">
                  {proposal.scheduledSlot.dateLabel} · {proposal.scheduledSlot.timeRange}
                </h3>
                <p className="text-xs text-muted-foreground">
                  Duration: {proposal.scheduledSlot.durationMinutes} minutes · Video link will be sent
                  prior to the meeting.
                </p>
              </div>
            </div>

            {/* Calendar Actions */}
            <div className="pt-2 border-t border-emerald-500/20 flex flex-wrap items-center gap-3">
              <Button
                onClick={handleDownloadIcs}
                className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs text-xs gap-2"
              >
                <CalendarPlus className="size-4" />
                Add to Calendar (.ics)
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-emerald-500/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/10 text-xs gap-2"
              >
                <a href={getGoogleCalendarLink()} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="size-3.5" />
                  Open Google Calendar
                </a>
              </Button>
              <Button asChild variant="ghost" className="text-xs text-muted-foreground hover:text-foreground">
                <Link href="/vendor/submissions/history">Return to Submissions</Link>
              </Button>
            </div>

            <div className="text-[11px] text-muted-foreground bg-background/60 p-3 rounded-lg border border-emerald-500/20">
              Note: If candidate circumstances require an emergency rescheduling, please contact
              Procurement directly through the Support desk.
            </div>
          </Card>
        ) : isAlternativeRequested ? (
          /* ALTERNATIVE REQUESTED READ-ONLY MODE */
          <Card className="p-6 rounded-xl border border-blue-500/40 bg-blue-50/20 dark:bg-blue-950/20 shadow-2xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="size-8 rounded-full bg-blue-500/20 text-blue-600 flex items-center justify-center shrink-0">
                <MessageSquare className="size-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">
                  Alternative Slots Request Submitted
                </h3>
                <p className="text-xs text-muted-foreground">
                  The hiring team has been notified with your availability note.
                </p>
              </div>
            </div>

            {proposal.alternativeRequestNote && (
              <div className="p-3.5 rounded-lg bg-card border border-border/80 text-xs space-y-1">
                <span className="text-[10px] uppercase font-semibold text-muted-foreground">
                  Your Note to Hiring Team:
                </span>
                <p className="text-foreground italic">"{proposal.alternativeRequestNote}"</p>
              </div>
            )}

            <div className="pt-2">
              <Button asChild variant="outline" size="sm" className="text-xs">
                <Link href="/vendor/submissions/history">Return to Submissions</Link>
              </Button>
            </div>
          </Card>
        ) : (
          /* 5. INTERACTIVE SLOT SELECTION MODE */
          <div className="space-y-6">
            {/* Slot Options Card */}
            <Card className="p-5 sm:p-6 rounded-xl border border-border/80 bg-card shadow-2xs space-y-5">
              <div className="space-y-1">
                <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Clock className="size-4 text-teal-600 dark:text-teal-400" />
                  Select an Agreed Time Slot
                </h2>
                <p className="text-xs text-muted-foreground">
                  Choose one of the interview timeslots proposed by the hiring team.
                  Times are presented in Gulf Standard Time (GST, Asia/Dubai).
                </p>
              </div>

              {/* Slot Chips Container: Styled using the slot-chip visual language from INTERVIEW-PLANNING-UX.md's plan tray */}
              <div className="space-y-2.5" role="radiogroup" aria-label="Interview slot options">
                {proposal.proposedSlots.map((slot, index) => {
                  const isSelected = selectedSlotStart === slot.start;

                  return (
                    <div
                      key={slot.slotId}
                      onClick={() => setSelectedSlotStart(slot.start)}
                      className={cn(
                        "group relative flex items-center justify-between gap-3 p-3.5 rounded-lg border bg-card text-xs text-foreground shadow-2xs cursor-pointer select-none",
                        "transition-all duration-200 ease-[cubic-bezier(0.2,0,0,1)]",
                        isSelected
                          ? "border-teal-500 bg-teal-50/50 dark:bg-teal-950/20 ring-2 ring-teal-500/30 shadow-sm"
                          : "border-border/80 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-muted/30"
                      )}
                      role="radio"
                      aria-checked={isSelected}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === " " || e.key === "Enter") {
                          setSelectedSlotStart(slot.start);
                        }
                      }}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        {/* Radio selection circle */}
                        <div
                          className={cn(
                            "size-4 rounded-full border flex items-center justify-center shrink-0 transition-colors",
                            isSelected
                              ? "border-teal-600 bg-teal-600 text-white"
                              : "border-muted-foreground/50 group-hover:border-foreground"
                          )}
                        >
                          {isSelected && <span className="size-1.5 rounded-full bg-white" />}
                        </div>

                        {/* Slot details matching TraySlotChip */}
                        <div className="min-w-0 flex-1 space-y-0.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-sm text-foreground">
                              {slot.dateLabel} · {slot.timeRange}
                            </span>
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-muted text-muted-foreground border border-border/60">
                              {slot.durationMinutes} mins
                            </span>
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20">
                              Microsoft Teams
                            </span>
                          </div>
                          <div className="text-[11px] text-muted-foreground">
                            {`Option ${index + 1} of ${proposal.proposedSlots.length}`}
                          </div>
                        </div>
                      </div>

                      {/* Selected checkmark indicator */}
                      {isSelected && (
                        <div className="text-teal-600 dark:text-teal-400 font-semibold text-xs shrink-0 flex items-center gap-1">
                          <CheckCircle2 className="size-4" />
                          <span>Selected</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Primary Action Button */}
              <div className="pt-3 border-t border-border/60 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="text-[11px] text-muted-foreground">
                  {selectedSlotStart ? (
                    <span className="text-teal-600 dark:text-teal-400 font-medium">
                      ✓ Time slot selected. Click confirm to lock in the schedule.
                    </span>
                  ) : (
                    "Please select one of the time slots above to confirm."
                  )}
                </div>

                <Button
                  onClick={handleConfirmSlot}
                  disabled={!selectedSlotStart || isSubmitting}
                  className="bg-teal-600 hover:bg-teal-700 text-white shadow-2xs text-xs font-semibold px-5 h-9"
                >
                  {isSubmitting ? "Confirming..." : "Confirm Selected Time Slot"}
                </Button>
              </div>
            </Card>

            {/* 6. REQUEST ALTERNATIVE SLOTS SECTION */}
            {/* Per RFP's "select a timeslot... or request alternative slots" */}
            <Card className="p-4 sm:p-5 rounded-xl border border-border/80 bg-card shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-semibold text-foreground">
                    Candidate Unavailable for Proposed Slots?
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    If none of the suggested slots work, you may request the hiring team to propose new times.
                  </p>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsRequestingAlternatives((prev) => !prev)}
                  className="text-xs h-8"
                >
                  {isRequestingAlternatives ? "Cancel" : "Request Alternative Slots"}
                </Button>
              </div>

              {/* Collapsible Alternative Request Form */}
              {isRequestingAlternatives && (
                <div className="pt-3 border-t border-border/60 space-y-3 animate-in fade-in duration-200">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                      <span>Candidate Availability Notes (Required)</span>
                      <span className="text-[10px] text-muted-foreground font-normal">
                        e.g. preferred dates, morning/afternoon windows
                      </span>
                    </label>
                    <Textarea
                      placeholder="e.g. The candidate has client audit commitments on 12-14 Sep. They are available next Monday 15 Sep or Tuesday 16 Sep between 09:00 - 13:00 GST..."
                      value={alternativeNote}
                      onChange={(e) => {
                        setAlternativeNote(e.target.value);
                        if (noteError) setNoteError(null);
                      }}
                      rows={3}
                      className={cn("text-xs resize-none bg-background", noteError && "border-destructive")}
                    />
                    {noteError && (
                      <p className="text-[11px] text-destructive font-medium">{noteError}</p>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setIsRequestingAlternatives(false);
                        setNoteError(null);
                      }}
                      className="text-xs h-8"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSubmitAlternativeRequest}
                      disabled={isSubmitting}
                      size="sm"
                      className="bg-amber-600 hover:bg-amber-700 text-white text-xs h-8 gap-1.5"
                    >
                      <Send className="size-3" />
                      {isSubmitting ? "Submitting..." : "Submit Alternative Request"}
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
