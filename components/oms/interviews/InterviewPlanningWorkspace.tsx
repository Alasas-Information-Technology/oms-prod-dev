"use client";

import * as React from "react";
import {
  ShieldAlert,
  Info,
  Loader2,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  ArrowRight,
} from "lucide-react";
import {
  useInterviewPlanning,
  useInterviewDraft,
  useBypassInterview,
  useSendInterviewSlots,
} from "@/src/lib/interview-planning/api";
import {
  InterviewProposedSlot,
  InterviewProposalSettings,
  InterviewCandidateStatus,
} from "@/src/types/interview-planning";
import {
  PageBarBreadcrumbs,
  PageBarActions,
} from "@/components/ui/layouts/page-bar-context";
import { Button } from "@/components/ui/button";
import { CandidateRail } from "./CandidateRail";
import { InterviewProgressRail } from "./rail/InterviewProgressRail";
import { InterviewFrameBar, InterviewFrameState } from "./frame/InterviewFrameBar";
import {
  WeekCalendar,
  ProposedSlotsList,
  formatSlotTimeRange,
  getSlotDateLabel,
} from "./calendar";
import { InterviewSettingsPanel } from "./settings";
import { SendConfirmationModal, SendErrorState } from "./dialogs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface InterviewPlanningWorkspaceProps {
  requestId: string;
}

/**
 * Calculates two working days (Mon–Fri) out from reference date or today.
 */
function getTwoWorkingDaysOut(baseDate: Date = new Date("2026-08-06")): string {
  const d = new Date(baseDate);
  let daysAdded = 0;
  while (daysAdded < 2) {
    d.setDate(d.getDate() + 1);
    const day = d.getDay();
    if (day !== 0 && day !== 6) {
      daysAdded++;
    }
  }
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const date = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${date}`;
}

export function InterviewPlanningWorkspace({
  requestId,
}: InterviewPlanningWorkspaceProps) {
  const { data, isLoading, error } = useInterviewPlanning(requestId);

  // Selected candidate state (defaults to first candidate once data loads)
  const [candidateOverride, setCandidateOverride] = React.useState<string | null>(null);

  const selectedCandidateRef =
    candidateOverride ||
    (data?.candidates && data.candidates.length > 0
      ? data.candidates[0].candidateRef
      : "");

  // Track draft state and unsaved changes per candidate
  const [hasUnsavedChanges, setHasUnsavedChanges] = React.useState<boolean>(false);
  const [pendingCandidateRef, setPendingCandidateRef] = React.useState<string | null>(null);
  const [showDiscardDialog, setShowDiscardDialog] = React.useState<boolean>(false);

  // Bypass modal state
  const [showBypassModal, setShowBypassModal] = React.useState<boolean>(false);
  const [bypassJustification, setBypassJustification] = React.useState<string>("");

  // Mutations
  const bypassMutation = useBypassInterview(requestId);
  const sendSlotsMutation = useSendInterviewSlots(requestId);

  // Send confirmation modal state (Task 3 & 4)
  const [showSendModal, setShowSendModal] = React.useState<boolean>(false);
  const [sendError, setSendError] = React.useState<SendErrorState | null>(null);
  const [idempotencyKey, setIdempotencyKey] = React.useState<string>("");

  // Local candidate status overrides (Task 6 & 7: AWAITING_REPLY, BYPASS_REQUESTED)
  const [candidateStatusMap, setCandidateStatusMap] = React.useState<
    Record<string, InterviewCandidateStatus>
  >({});
  const [justSentCandidateRef, setJustSentCandidateRef] = React.useState<string | null>(null);

  // Map of candidateRef -> InterviewProposedSlot[] to track in-progress changes per candidate
  const [candidateSlotsMap, setCandidateSlotsMap] = React.useState<
    Record<string, InterviewProposedSlot[]>
  >({});

  // Active candidate object
  const activeCandidate = React.useMemo(() => {
    if (!data?.candidates) return null;
    const found =
      data.candidates.find((c) => c.candidateRef === selectedCandidateRef) ||
      data.candidates[0] ||
      null;
    if (!found) return null;
    const statusOverride = candidateStatusMap[found.candidateRef];
    if (statusOverride) {
      return { ...found, status: statusOverride };
    }
    return found;
  }, [data, selectedCandidateRef, candidateStatusMap]);

  // Current active slots (either locally edited or loaded from candidate proposal)
  const currentSlots = React.useMemo(() => {
    if (!activeCandidate) return [];
    return (
      candidateSlotsMap[activeCandidate.candidateRef] ??
      activeCandidate.proposal.slots ??
      []
    );
  }, [activeCandidate, candidateSlotsMap]);

  // Frame state overrides & derived effective state per UX 4.1 & Task 2/3
  const [frameOverrides, setFrameOverrides] = React.useState<Partial<InterviewFrameState>>({});
  const [isRecomputing, setIsRecomputing] = React.useState(false);

  const effectiveFrame: InterviewFrameState = React.useMemo(() => {
    return {
      selectedInterviewerIds:
        frameOverrides.selectedInterviewerIds ??
        (data?.interviewers?.map((i) => i.userId) || []),
      durationMinutes: frameOverrides.durationMinutes ?? 45,
      method:
        frameOverrides.method ??
        (activeCandidate?.methodPreference === "PHYSICAL" ? "PHYSICAL" : "ONLINE"),
      platform: frameOverrides.platform ?? "MICROSOFT_TEAMS",
      location:
        frameOverrides.location ??
        (data?.settings?.locations[0]?.id || "loc-hq-rm3"),
      earliestDate: frameOverrides.earliestDate ?? getTwoWorkingDaysOut(),
      timezone: frameOverrides.timezone ?? "Asia/Dubai",
    };
  }, [
    frameOverrides,
    data?.interviewers,
    data?.settings?.locations,
    activeCandidate?.methodPreference,
  ]);

  const handleFrameChange = React.useCallback(
    (newFrame: InterviewFrameState) => {
      setFrameOverrides(newFrame);

      // 200ms crossfade per Task 2
      setIsRecomputing(true);
      setTimeout(() => {
        setIsRecomputing(false);
      }, 200);
    },
    []
  );

  const handleSlotsChange = React.useCallback(
    (newSlots: InterviewProposedSlot[]) => {
      if (!activeCandidate) return;
      setCandidateSlotsMap((prev) => ({
        ...prev,
        [activeCandidate.candidateRef]: newSlots,
      }));
      setHasUnsavedChanges(true);
    },
    [activeCandidate]
  );

  // Next candidate with NOT_SENT status for post-send transition (Task 7)
  const otherNotSentCandidate = React.useMemo(() => {
    if (!data?.candidates || !activeCandidate) return null;
    return (
      data.candidates.find(
        (c) =>
          c.candidateRef !== activeCandidate.candidateRef &&
          (candidateStatusMap[c.candidateRef] ?? c.status) === "NOT_SENT"
      ) || null
    );
  }, [data, activeCandidate, candidateStatusMap]);

  // Candidates list reflected with any local slot and status edits for the rail
  const candidatesWithLocalSlots = React.useMemo(() => {
    if (!data?.candidates) return [];
    return data.candidates.map((cand) => {
      const localSlots = candidateSlotsMap[cand.candidateRef];
      const localStatus = candidateStatusMap[cand.candidateRef];
      return {
        ...cand,
        status: localStatus ?? cand.status,
        proposal: {
          ...cand.proposal,
          slots: localSlots ?? cand.proposal.slots,
        },
      };
    });
  }, [data, candidateSlotsMap, candidateStatusMap]);

  // Map of candidateRef -> InterviewProposalSettings to track settings per candidate (Task 6)
  const [candidateSettingsMap, setCandidateSettingsMap] = React.useState<
    Record<string, InterviewProposalSettings>
  >({});

  // Current active settings for active candidate
  const currentSettings = React.useMemo<InterviewProposalSettings | null>(() => {
    if (!activeCandidate) return null;
    const existing = candidateSettingsMap[activeCandidate.candidateRef];
    if (existing) return existing;

    // Default to candidate proposal settings or initialize with candidate preference
    const baseSettings = activeCandidate.proposal.settings;
    const defaultMethod =
      activeCandidate.methodPreference === "PHYSICAL" ? "PHYSICAL" : "ONLINE";

    return {
      method: baseSettings?.method || defaultMethod,
      platform:
        baseSettings?.platform || (defaultMethod === "ONLINE" ? "MICROSOFT_TEAMS" : null),
      location:
        baseSettings?.location ||
        (defaultMethod === "PHYSICAL" ? data?.settings.locations[0]?.id || null : null),
      replyByDate: baseSettings?.replyByDate || "2026-08-13",
      allowAlternatives: baseSettings?.allowAlternatives ?? true,
      allowReschedule: baseSettings?.allowReschedule ?? true,
    };
  }, [activeCandidate, candidateSettingsMap, data?.settings.locations]);

  const handleSettingsChange = React.useCallback(
    (newSettings: InterviewProposalSettings) => {
      if (!activeCandidate) return;
      setCandidateSettingsMap((prev) => ({
        ...prev,
        [activeCandidate.candidateRef]: newSettings,
      }));
      setHasUnsavedChanges(true);
    },
    [activeCandidate]
  );

  // Current draft payload for 2-second debounced autosave
  const currentDraftPayload = React.useMemo(() => {
    if (!activeCandidate || !currentSettings) return undefined;
    return {
      slots: currentSlots,
      method: currentSettings.method,
      platform: currentSettings.platform,
      location: currentSettings.location,
      replyByDate: currentSettings.replyByDate,
      allowAlternatives: currentSettings.allowAlternatives,
      allowReschedule: currentSettings.allowReschedule,
    };
  }, [activeCandidate, currentSettings, currentSlots]);

  // Draft hook with 2-second debounced autosave for active candidate
  const { saveDraft, isSaving, lastSavedAt } = useInterviewDraft(
    requestId,
    activeCandidate?.candidateRef || "",
    currentDraftPayload
  );

  // Switching candidates with unsaved changes guard
  const handleCandidateSelection = (nextRef: string) => {
    if (nextRef === selectedCandidateRef) return;

    if (hasUnsavedChanges) {
      setPendingCandidateRef(nextRef);
      setShowDiscardDialog(true);
    } else {
      setCandidateOverride(nextRef);
    }
  };

  const handleConfirmDiscard = () => {
    if (pendingCandidateRef) {
      setCandidateOverride(pendingCandidateRef);
      setPendingCandidateRef(null);
      setHasUnsavedChanges(false);
    }
    setShowDiscardDialog(false);
  };

  const handleManualSaveDraft = () => {
    if (!activeCandidate || !currentDraftPayload) return;
    saveDraft(currentDraftPayload);
    setHasUnsavedChanges(false);
    toast.success(`Draft saved for ${activeCandidate.candidateRef}`);
  };

  const handleBypassSubmit = async () => {
    if (!activeCandidate) return;
    if (!bypassJustification.trim()) {
      toast.error("Justification is required to bypass an interview.");
      return;
    }

    try {
      await bypassMutation.mutateAsync({
        candidateRef: activeCandidate.candidateRef,
        payload: { justification: bypassJustification.trim() },
      });
      setCandidateStatusMap((prev) => ({
        ...prev,
        [activeCandidate.candidateRef]: "BYPASS_REQUESTED",
      }));
      toast.success(
        `Bypass request submitted for ${activeCandidate.candidateRef}`
      );
      setShowBypassModal(false);
      setBypassJustification("");
    } catch {
      toast.error("Failed to submit bypass request.");
    }
  };

  const currentPlatformOrLocationDisplay = React.useMemo(() => {
    if (!currentSettings) return "";
    if (currentSettings.method === "ONLINE") {
      switch (currentSettings.platform) {
        case "MICROSOFT_TEAMS":
          return "Microsoft Teams";
        case "ZOOM":
          return "Zoom";
        case "GOOGLE_MEET":
          return "Google Meet";
        default:
          return "Microsoft Teams";
      }
    }
    const loc = data?.settings.locations.find((l) => l.id === currentSettings.location);
    return loc ? loc.name : "DIEZ HQ, Meeting Room 3";
  }, [currentSettings, data?.settings.locations]);

  // Transmit proposed slots to candidate via vendor relay (Task 3 & 4)
  const handleConfirmSend = async (idempotencyKey: string) => {
    if (!activeCandidate || !currentSettings) return;
    setSendError(null);

    try {
      await sendSlotsMutation.mutateAsync({
        candidateRef: activeCandidate.candidateRef,
        payload: {
          slots: currentSlots,
          method: currentSettings.method,
          platform: currentSettings.platform,
          location: currentSettings.location,
          replyByDate: currentSettings.replyByDate,
          allowAlternatives: currentSettings.allowAlternatives,
          allowReschedule: currentSettings.allowReschedule,
          idempotencyKey,
        },
      });

      // Update candidate status to AWAITING_REPLY in local state
      setCandidateStatusMap((prev) => ({
        ...prev,
        [activeCandidate.candidateRef]: "AWAITING_REPLY",
      }));
      setHasUnsavedChanges(false);
      setShowSendModal(false);
      setJustSentCandidateRef(activeCandidate.candidateRef);

      const nextCand = data?.candidates.find(
        (c) =>
          c.candidateRef !== activeCandidate.candidateRef &&
          (candidateStatusMap[c.candidateRef] ?? c.status) === "NOT_SENT"
      );

      if (nextCand) {
        toast.success(
          `${currentSlots.length} interview slots sent to ${activeCandidate.candidateRef} via vendor relay.`,
          {
            action: {
              label: `Plan for ${nextCand.candidateRef} ›`,
              onClick: () => handleCandidateSelection(nextCand.candidateRef),
            },
          }
        );
      } else {
        toast.success(
          `${currentSlots.length} interview slots sent to ${activeCandidate.candidateRef} via vendor relay.`
        );
      }
    } catch (err: unknown) {
      const errorObj = err as {
        code?: string;
        message?: string;
        slotStart?: string;
        earliestSlot?: string;
        latestReplyDate?: string;
      };
      setSendError({
        code: errorObj.code || "SEND_ERROR",
        message: errorObj.message || "Failed to send interview slots via vendor relay.",
        slotStart: errorObj.slotStart,
        earliestSlot: errorObj.earliestSlot,
        latestReplyDate: errorObj.latestReplyDate,
      });
    }
  };

  // Breadcrumbs definition per APP-SHELL-SPEC.md (Task 1)
  const breadcrumbs = React.useMemo(() => {
    return [
      { label: "Interviews", href: "/app/candidates" },
      {
        label: data?.request.id || requestId,
        href: `/app/requests/${data?.request.id || requestId}`,
      },
      { label: "Plan interviews", isCurrent: true },
    ];
  }, [data?.request.id, requestId]);

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-140px)] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="size-6 animate-spin text-primary" />
          <span className="text-xs font-medium">Loading interview planning workspace...</span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center">
        <p className="text-sm font-semibold text-destructive">
          Failed to load interview planning workspace.
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Please check the request identifier and try again.
        </p>
      </div>
    );
  }

  const proposedSlotsCount = currentSlots.length;

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* 1. Page Bar Breadcrumbs (Acts as page title per APP-SHELL-SPEC.md) */}
      <PageBarBreadcrumbs crumbs={breadcrumbs} />

      {/* 2. Page Bar Actions: ABSENT if isMainInterviewer is false */}
      {data.isMainInterviewer && (
        <PageBarActions>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleManualSaveDraft}
              disabled={isSaving}
              className="h-9 px-3 text-xs font-medium cursor-pointer"
            >
              {isSaving ? "Saving..." : "Save draft"}
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => {
                if (proposedSlotsCount === 0) {
                  toast.error("Please propose at least one interview slot.");
                  return;
                }
                setIdempotencyKey(
                  typeof crypto !== "undefined" && crypto.randomUUID
                    ? crypto.randomUUID()
                    : `idemp-${Date.now()}`
                );
                setSendError(null);
                setShowSendModal(true);
              }}
              disabled={
                proposedSlotsCount === 0 ||
                (data.blindBoundary && !data.blindBoundary.relayActive) ||
                sendSlotsMutation.isPending
              }
              className="h-9 px-4 text-xs font-semibold cursor-pointer"
            >
              {sendSlotsMutation.isPending ? (
                <>
                  <Loader2 className="size-3.5 animate-spin mr-1.5" />
                  Sending...
                </>
              ) : proposedSlotsCount > 0 ? (
                `Send ${proposedSlotsCount} ${proposedSlotsCount === 1 ? "slot" : "slots"}`
              ) : (
                "Send slots"
              )}
            </Button>
          </div>
        </PageBarActions>
      )}

      {/* 3. Progress Rail per UX Part 3: 4px progress rail directly beneath breadcrumbs */}
      <InterviewProgressRail currentStep={2} totalSteps={5} stepLabel="Propose slots" />

      {/* 4. Sub-line Header Band: Position & Shortlisted count */}
      <div className="px-6 py-2 bg-muted/10 border-b border-border flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-semibold text-foreground truncate">
            {data.request.position}
          </span>
          <span className="text-muted-foreground">·</span>
          <span className="text-muted-foreground font-medium whitespace-nowrap">
            {data.request.shortlistedCount ?? data.candidates.length} shortlisted
          </span>
        </div>

        {lastSavedAt && data.isMainInterviewer && (
          <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
            <CheckCircle2 className="size-3 text-success" />
            <span>Draft saved at {new Date(lastSavedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
          </div>
        )}
      </div>

      {/* 5. Frame Bar per UX Part 4.1: Row of chips summarising four decisions */}
      <InterviewFrameBar
        frame={effectiveFrame}
        onFrameChange={handleFrameChange}
        availableInterviewers={data.interviewers}
        availablePlatforms={data.settings.platforms}
        availableLocations={data.settings.locations}
        candidateRef={activeCandidate?.candidateRef}
        candidatePreference={activeCandidate?.methodPreference}
        candidateTimezone={activeCandidate?.timezone}
        isReadOnly={!data.isMainInterviewer}
      />

      {/* 6. Service Health Blocking Banner (Task 2: ONLY shown when relay is down) */}
      {data.blindBoundary && !data.blindBoundary.relayActive && (
        <div className="mx-6 mt-4 p-3.5 rounded-xl border border-destructive/40 bg-destructive/10 text-destructive flex items-center gap-3 text-xs font-medium">
          <AlertCircle className="size-4.5 shrink-0 text-destructive" />
          <div className="space-y-0.5">
            <p className="font-semibold text-foreground">
              The vendor relay is unavailable. Slots can&apos;t be sent right now.
            </p>
            <p className="text-muted-foreground text-[11px]">
              You may continue preparing slots and save as a draft. Relay transmission will resume once connection is restored.
            </p>
          </div>
        </div>
      )}

      {/* 7. Read-only Banner (Task 6): Shown when isMainInterviewer is false */}
      {!data.isMainInterviewer && (
        <div className="mx-6 mt-4 p-3.5 rounded-xl border border-border bg-card shadow-2xs flex items-start gap-3 text-xs">
          <ShieldAlert className="size-4.5 text-amber-500 mt-0.5 shrink-0" />
          <div className="space-y-0.5">
            <p className="font-semibold text-foreground">Read-only view</p>
            <p className="text-muted-foreground">
              {data.readOnlyReason ||
                "Only the Main Interviewer has scheduling authority for this requisition."}
            </p>
          </div>
        </div>
      )}

      {/* 8. Main 3-Column Grid per Part 2 (with 200ms crossfade on frame changes) */}
      <div
        className={cn(
          "flex-1 p-6 transition-opacity duration-200",
          isRecomputing && "opacity-75"
        )}
      >
        <div className="grid min-h-0 gap-6 xl:grid-cols-[280px_minmax(0,1fr)_320px]">
          {/* Column 1: Candidate Rail (280px, own scroll) */}
          <CandidateRail
            candidates={candidatesWithLocalSlots}
            selectedCandidateRef={selectedCandidateRef}
            onSelectCandidate={handleCandidateSelection}
            bypass={data.bypass}
            onBypassClick={() => setShowBypassModal(true)}
          />

          {/* Column 2: Calendar Workspace & Proposed Slots List (IV3) */}
          <div className="min-w-0 flex flex-col">
            {/* Reschedule Banner (Task 5 & Fixture D) */}
            {activeCandidate?.status === "RESCHEDULING" && activeCandidate.withdrawnSlot && (
              <div className="mb-4 rounded-xl border border-amber-300 dark:border-amber-800/80 bg-amber-50/90 dark:bg-amber-950/40 p-4 text-xs text-amber-900 dark:text-amber-200 shadow-2xs">
                <div className="flex items-start gap-2.5">
                  <RotateCcw className="size-4.5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-foreground text-sm">
                        Interview Reschedule Requested
                      </span>
                      {activeCandidate.rescheduleCount > 0 && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-200/60 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700">
                          {activeCandidate.rescheduleCount === 1
                            ? "Rescheduled once"
                            : activeCandidate.rescheduleCount === 2
                            ? "Rescheduled twice"
                            : `Rescheduled ${activeCandidate.rescheduleCount} times`}
                        </span>
                      )}
                    </div>
                    <p className="text-muted-foreground text-xs leading-relaxed">
                      Previously confirmed slot for{" "}
                      <strong className="text-foreground font-semibold">
                        {getSlotDateLabel(activeCandidate.withdrawnSlot.start, "Asia/Dubai")}{" "}
                        at {formatSlotTimeRange(activeCandidate.withdrawnSlot.start, activeCandidate.withdrawnSlot.durationMinutes, "Asia/Dubai")} GST
                      </strong>{" "}
                      was withdrawn.
                    </p>
                    {activeCandidate.withdrawnSlot.reason && (
                      <p className="text-xs text-amber-800 dark:text-amber-300 italic bg-background/60 dark:bg-card/40 p-2 rounded-md border border-amber-200 dark:border-amber-800/50">
                        Reason: &ldquo;{activeCandidate.withdrawnSlot.reason}&rdquo;
                      </p>
                    )}
                    <p className="text-[11px] text-muted-foreground font-medium pt-0.5">
                      Please propose new interview slots below and send updated options to {activeCandidate.candidateRef}.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Next Candidate Post-Send Prompt (Task 7) */}
            {otherNotSentCandidate && justSentCandidateRef === activeCandidate?.candidateRef && (
              <div className="mb-4 p-3.5 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/90 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 text-xs flex flex-wrap items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>
                    Slots sent to <strong>{activeCandidate.candidateRef}</strong>. Candidate is now awaiting reply.
                  </span>
                </div>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => {
                    setJustSentCandidateRef(null);
                    handleCandidateSelection(otherNotSentCandidate.candidateRef);
                  }}
                  className="h-7.5 px-3 text-xs font-semibold gap-1.5 cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <span>Plan for {otherNotSentCandidate.candidateRef}</span>
                  <ArrowRight className="size-3" />
                </Button>
              </div>
            )}

            <WeekCalendar
              slots={currentSlots}
              onSlotsChange={handleSlotsChange}
              availability={data.availability}
              interviewers={data.interviewers}
              collisions={data.collisions}
              candidateTimezone={activeCandidate?.timezone || "Asia/Dubai"}
              isOffshore={activeCandidate?.isOffshore || false}
              defaultDurationMinutes={data.settings.defaultDurationMinutes || 45}
              isReadOnly={!data.isMainInterviewer}
            />

            <ProposedSlotsList
              slots={currentSlots}
              collisions={data.collisions}
              candidateRef={activeCandidate?.candidateRef || ""}
              candidateTimezone={activeCandidate?.timezone || "Asia/Dubai"}
              isOffshore={activeCandidate?.isOffshore || false}
              onRemoveSlot={(startUtc) => {
                handleSlotsChange(currentSlots.filter((s) => s.start !== startUtc));
              }}
              isReadOnly={!data.isMainInterviewer}
            />
          </div>

          {/* Column 3: Interview Settings Panel (IV4) */}
          {activeCandidate && currentSettings && (
            <InterviewSettingsPanel
              candidate={activeCandidate}
              position={data.request.position}
              settings={currentSettings}
              onSettingsChange={handleSettingsChange}
              proposedSlots={currentSlots}
              onSlotsChange={handleSlotsChange}
              globalSettings={data.settings}
              availability={data.availability}
              interviewers={data.interviewers}
              isReadOnly={!data.isMainInterviewer}
            />
          )}
        </div>

        {/* Footnote per Part 2 */}
        <div className="mt-6 flex items-center gap-2 text-[12px] text-muted-foreground">
          <Info className="size-3.5 text-muted-foreground/80 shrink-0" />
          <span>Either party can reschedule. Every change is audited.</span>
        </div>
      </div>

      {/* Discard Unsaved Changes Confirmation Modal */}
      <AlertDialog open={showDiscardDialog} onOpenChange={setShowDiscardDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard unsaved changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes in {selectedCandidateRef}&apos;s proposal.
              Switching candidates now will discard these changes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDiscardDialog(false)}>
              Keep editing
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDiscard}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Discard changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bypass Request Dialog (Task 5 & RFP Step 6) */}
      <Dialog open={showBypassModal} onOpenChange={setShowBypassModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Request Interview Bypass</DialogTitle>
            <DialogDescription>
              This request routes to <strong className="text-foreground">{data.bypass.requiresApprovalFrom.name}</strong> (Head of Department) for decision and schedules nothing.
              Per RFP Step 6, if the HOD rejects the request, candidate <strong className="text-foreground">{activeCandidate?.candidateRef}</strong> returns to shortlisted.
            </DialogDescription>
          </DialogHeader>

          <div className="py-2">
            <label className="text-xs font-semibold text-foreground mb-1.5 block">
              Justification <span className="text-destructive">*</span>
            </label>
            <Textarea
              placeholder="State why this candidate meets the criteria to bypass the interview stage..."
              value={bypassJustification}
              onChange={(e) => setBypassJustification(e.target.value)}
              className="h-28 text-xs resize-none"
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowBypassModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleBypassSubmit}
              disabled={bypassMutation.isPending || !bypassJustification.trim()}
            >
              {bypassMutation.isPending ? "Submitting..." : "Submit for HOD Approval"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Confirmation Modal (Task 3 & 4) */}
      {activeCandidate && currentSettings && (
        <SendConfirmationModal
          isOpen={showSendModal}
          onClose={() => {
            setShowSendModal(false);
            setSendError(null);
          }}
          candidateRef={activeCandidate.candidateRef}
          position={data.request.position}
          slots={currentSlots}
          method={currentSettings.method}
          platformOrLocation={currentPlatformOrLocationDisplay}
          durationMinutes={
            currentSlots[0]?.durationMinutes ||
            data.settings.defaultDurationMinutes ||
            45
          }
          replyByDate={currentSettings.replyByDate}
          candidateTimezone={activeCandidate.timezone}
          isOffshore={activeCandidate.isOffshore}
          onConfirmSend={handleConfirmSend}
          isSending={sendSlotsMutation.isPending}
          sendError={sendError}
          idempotencyKey={idempotencyKey}
        />
      )}
    </div>
  );
}
