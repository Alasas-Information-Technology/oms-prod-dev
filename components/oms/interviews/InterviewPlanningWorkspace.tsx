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
  Sparkles,
  Calendar as CalendarIcon,
} from "lucide-react";
import {
  useInterviewPlanning,
  useInterviewDraft,
  useBypassInterview,
  useSendInterviewSlots,
  useInterviewSuggestions,
} from "@/src/lib/interview-planning/api";
import {
  InterviewProposedSlot,
  InterviewProposalSettings,
  InterviewCandidateStatus,
  SlotCollision,
} from "@/src/types/interview-planning";
import {
  PageBarBreadcrumbs,
  PageBarActions,
} from "@/components/ui/layouts/page-bar-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CandidateRail } from "./CandidateRail";
import { InterviewProgressRail } from "./rail/InterviewProgressRail";
import { InterviewFrameBar, InterviewFrameState } from "./frame/InterviewFrameBar";
import {
  WeekCalendar,
  ProposedSlotsList,
  CalendarCandidateSlot,
  formatSlotTimeRange,
  getSlotDateLabel,
} from "./calendar";
import { SuggestionList } from "./suggestions";
import { InterviewPlanTray } from "./tray";
import { getCandidateColor } from "@/src/lib/interview-planning/candidate-colors";
import { InterviewSettingsPanel } from "./settings";
import {
  SendConfirmationModal,
  SendErrorState,
  InterviewShortcutsModal,
} from "./dialogs";
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

  // Tab state with per-user persistence per TASK 1 & UX §4.4
  const TAB_STORAGE_KEY = "oms_interview_planning_tab";
  const [activeTab, setActiveTab] = React.useState<"suggested" | "calendar">("suggested");

  React.useEffect(() => {
    try {
      const savedTab = localStorage.getItem(TAB_STORAGE_KEY);
      if (savedTab === "suggested" || savedTab === "calendar") {
        setActiveTab(savedTab);
      }
    } catch {
      // LocalStorage might be restricted
    }
  }, []);

  const handleSelectTab = React.useCallback((tab: "suggested" | "calendar") => {
    setActiveTab(tab);
    try {
      localStorage.setItem(TAB_STORAGE_KEY, tab);
    } catch {
      // Ignore
    }
  }, []);

  // Map of candidateRef -> InterviewProposedSlot[] to track in-progress changes per candidate
  const [candidateSlotsMap, setCandidateSlotsMap] = React.useState<
    Record<string, InterviewProposedSlot[]>
  >({});

  // 20-step undo history stack covering all plan changes (TASK 4)
  interface PlanHistorySnapshot {
    candidateSlotsMap: Record<string, InterviewProposedSlot[]>;
    dismissedSlotIds: string[];
    description: string;
  }
  const [undoStack, setUndoStack] = React.useState<PlanHistorySnapshot[]>([]);

  // Suggestion list dismissals & keyboard navigation state (TASK 3 & 5)
  const [dismissedSlotIds, setDismissedSlotIds] = React.useState<string[]>([]);
  const [focusedSuggestionIndex, setFocusedSuggestionIndex] = React.useState<number>(-1);
  const [showShortcutsModal, setShowShortcutsModal] = React.useState<boolean>(false);

  // Push a state snapshot before mutation (max 20 steps)
  const pushUndoSnapshot = React.useCallback(
    (description: string) => {
      setUndoStack((prev) => {
        const snapshot: PlanHistorySnapshot = {
          candidateSlotsMap: JSON.parse(JSON.stringify(candidateSlotsMap)),
          dismissedSlotIds: [...dismissedSlotIds],
          description,
        };
        return [...prev.slice(-19), snapshot];
      });
    },
    [candidateSlotsMap, dismissedSlotIds]
  );

  // Undo the last plan change (TASK 4)
  const handleUndo = React.useCallback(() => {
    if (undoStack.length === 0) {
      toast.info("Nothing to undo.");
      return;
    }
    const last = undoStack[undoStack.length - 1];
    setUndoStack((prev) => prev.slice(0, -1));
    setCandidateSlotsMap(last.candidateSlotsMap);
    setDismissedSlotIds(last.dismissedSlotIds);
    setHasUnsavedChanges(true);
    toast.success(`Undid: ${last.description}`);
  }, [undoStack]);

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

  const defaultInterviewerIds = React.useMemo(() => {
    return data?.interviewers?.map((i) => i.userId) || [];
  }, [data?.interviewers]);

  const effectiveFrame: InterviewFrameState = React.useMemo(() => {
    return {
      selectedInterviewerIds:
        frameOverrides.selectedInterviewerIds ?? defaultInterviewerIds,
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
    defaultInterviewerIds,
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
      pushUndoSnapshot(`Update slots for ${activeCandidate.candidateRef}`);
      setCandidateSlotsMap((prev) => ({
        ...prev,
        [activeCandidate.candidateRef]: newSlots,
      }));
      setHasUnsavedChanges(true);
    },
    [activeCandidate, pushUndoSnapshot]
  );

  // Suggestions query parameters derived from effective frame
  const suggestionsParams = React.useMemo(() => {
    return {
      from: effectiveFrame.earliestDate,
      durationMinutes: effectiveFrame.durationMinutes,
      method: effectiveFrame.method,
      interviewerIds: effectiveFrame.selectedInterviewerIds,
      candidateRef: activeCandidate?.candidateRef,
      limit: 10,
    };
  }, [
    effectiveFrame.earliestDate,
    effectiveFrame.durationMinutes,
    effectiveFrame.method,
    effectiveFrame.selectedInterviewerIds,
    activeCandidate?.candidateRef,
  ]);

  // Fetch server-ranked suggestions with keepPreviousData for in-place re-ranking
  const {
    data: suggestionsData,
    isLoading: isSuggestionsLoading,
    isFetching: isSuggestionsFetching,
  } = useInterviewSuggestions(requestId, suggestionsParams);

  // Handle adding a slot (from suggestion or calendar) to a candidate's plan
  const handleAddSuggestionToPlan = React.useCallback(
    (
      slot: { start: string; durationMinutes: number },
      targetCandidateRef: string
    ) => {
      const existingSlots =
        candidateSlotsMap[targetCandidateRef] ??
        data?.candidates.find((c) => c.candidateRef === targetCandidateRef)
          ?.proposal?.slots ??
        [];

      // Guard against duplicate slots
      if (existingSlots.some((s) => s.start === slot.start)) {
        toast.info(`Slot is already proposed for ${targetCandidateRef}.`);
        return;
      }

      // Guard against exceeding maximum 3 proposed slots
      if (existingSlots.length >= 3) {
        toast.warning(
          `${targetCandidateRef} already has 3 interview slots proposed.`
        );
        return;
      }

      pushUndoSnapshot(
        `Add ${getSlotDateLabel(slot.start, effectiveFrame.timezone)} to ${targetCandidateRef}`
      );

      const updated = [...existingSlots, slot];
      setCandidateSlotsMap((prev) => ({
        ...prev,
        [targetCandidateRef]: updated,
      }));
      setHasUnsavedChanges(true);
      toast.success(
        `Added ${getSlotDateLabel(slot.start, effectiveFrame.timezone)} to ${targetCandidateRef}`
      );
    },
    [candidateSlotsMap, data?.candidates, effectiveFrame.timezone, pushUndoSnapshot]
  );

  // Handle removing a slot from a candidate's plan
  const handleRemoveSlot = React.useCallback(
    (startUtc: string, targetCandidateRef?: string) => {
      const targetRef = targetCandidateRef || selectedCandidateRef;
      if (!targetRef) return;

      const existingSlots =
        candidateSlotsMap[targetRef] ??
        data?.candidates.find((c) => c.candidateRef === targetRef)?.proposal?.slots ??
        [];

      pushUndoSnapshot(`Remove slot from ${targetRef}`);

      setCandidateSlotsMap((prev) => ({
        ...prev,
        [targetRef]: existingSlots.filter((s) => s.start !== startUtc),
      }));
      setHasUnsavedChanges(true);
      toast.info(`Removed slot from ${targetRef}`);
    },
    [selectedCandidateRef, candidateSlotsMap, data?.candidates, pushUndoSnapshot]
  );

  // Handle dismissing a suggestion with undo support
  const handleDismissSuggestion = React.useCallback(
    (slotId: string) => {
      pushUndoSnapshot("Dismiss suggestion");
      setDismissedSlotIds((prev) => [...prev, slotId]);
      toast.info("Suggestion dismissed.", {
        action: {
          label: "Undo",
          onClick: handleUndo,
        },
      });
    },
    [handleUndo, pushUndoSnapshot]
  );

  // Handle restoring all dismissed suggestions with undo support
  const handleRestoreDismissed = React.useCallback(() => {
    pushUndoSnapshot("Restore dismissed suggestions");
    setDismissedSlotIds([]);
    toast.success("Restored dismissed suggestions.");
  }, [pushUndoSnapshot]);

  // Handle slots change from tray drag-and-drop
  const handleTraySlotsChange = React.useCallback(
    (cRef: string, newSlots: InterviewProposedSlot[]) => {
      pushUndoSnapshot(`Update slots for ${cRef}`);
      setCandidateSlotsMap((prev) => ({
        ...prev,
        [cRef]: newSlots,
      }));
      setHasUnsavedChanges(true);
    },
    [pushUndoSnapshot]
  );

  // Global keyboard shortcuts per UX Part 8 & UI §3.2 (TASK 3)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 1. Inertness guard: inert while a dialog or text input has focus
      const activeEl = document.activeElement;
      const isInput =
        activeEl instanceof HTMLInputElement ||
        activeEl instanceof HTMLTextAreaElement ||
        (activeEl as HTMLElement)?.isContentEditable;
      const isDialogOpen =
        Boolean(document.querySelector('[role="dialog"]')) ||
        Boolean(document.querySelector('[role="alertdialog"]'));

      if (isInput || isDialogOpen) {
        return;
      }

      // 2. ⌘Z / Ctrl+Z (Undo last plan change)
      if ((e.metaKey || e.ctrlKey) && (e.key === "z" || e.key === "Z") && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
        return;
      }

      // 3. 'C' (Toggle Calendar / Suggested times tabs)
      if ((e.key === "c" || e.key === "C") && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        handleSelectTab(activeTab === "suggested" ? "calendar" : "suggested");
        return;
      }

      // 4. '?' (Shortcut overlay)
      if (e.key === "?" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setShowShortcutsModal(true);
        return;
      }

      // 5. Tab (Switch active candidate in the tray)
      if (
        e.key === "Tab" &&
        !e.metaKey &&
        !e.ctrlKey &&
        data?.candidates &&
        data.candidates.length > 0
      ) {
        e.preventDefault();
        const cands = data.candidates;
        const currentIdx = cands.findIndex((c) => c.candidateRef === selectedCandidateRef);
        const nextIdx = e.shiftKey
          ? (currentIdx - 1 + cands.length) % cands.length
          : (currentIdx + 1) % cands.length;
        const nextCand = cands[nextIdx];
        if (nextCand) {
          setCandidateOverride(nextCand.candidateRef);
          toast.info(`Active candidate: ${nextCand.candidateRef}`, { duration: 1500 });
        }
        return;
      }

      // 6. Suggestions tab specific shortcuts (only active in 'suggested' view)
      if (activeTab === "suggested") {
        const currentSuggestions = (suggestionsData?.suggestions || []).filter(
          (s) => !dismissedSlotIds.includes(s.slotId)
        );

        // Arrow navigation (↑ / ↓)
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setFocusedSuggestionIndex((prev) =>
            prev < 0 ? 0 : Math.min(currentSuggestions.length - 1, prev + 1)
          );
          return;
        }
        if (e.key === "ArrowUp") {
          e.preventDefault();
          setFocusedSuggestionIndex((prev) => (prev <= 0 ? 0 : prev - 1));
          return;
        }

        // 'X' dismisses the focused suggestion
        if ((e.key === "x" || e.key === "X") && !e.metaKey && !e.ctrlKey) {
          if (currentSuggestions.length > 0) {
            e.preventDefault();
            const target =
              currentSuggestions[focusedSuggestionIndex] || currentSuggestions[0];
            if (target) {
              handleDismissSuggestion(target.slotId);
            }
          }
          return;
        }

        // '1' - '9' adds that suggestion to active candidate
        const num = parseInt(e.key, 10);
        if (!isNaN(num) && num >= 1 && num <= 9 && !e.metaKey && !e.ctrlKey) {
          const target = currentSuggestions[num - 1];
          if (target && activeCandidate) {
            e.preventDefault();
            handleAddSuggestionToPlan(
              { start: target.start, durationMinutes: target.durationMinutes },
              activeCandidate.candidateRef
            );
          }
          return;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    activeTab,
    activeCandidate,
    data?.candidates,
    selectedCandidateRef,
    suggestionsData?.suggestions,
    dismissedSlotIds,
    focusedSuggestionIndex,
    handleAddSuggestionToPlan,
    handleDismissSuggestion,
    handleSelectTab,
    handleUndo,
  ]);

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

  // Multi-candidate slot entries across all candidates for the unified calendar (TASK 2)
  const calendarCandidateSlots = React.useMemo<CalendarCandidateSlot[]>(() => {
    if (!data?.candidates) return [];
    const result: CalendarCandidateSlot[] = [];
    data.candidates.forEach((c, idx) => {
      const slots = candidateSlotsMap[c.candidateRef] ?? c.proposal?.slots ?? [];
      slots.forEach((s) => {
        result.push({
          slot: s,
          candidateRef: c.candidateRef,
          candidateIndex: idx,
          candidateTimezone: c.timezone,
          isOffshore: c.isOffshore,
          isActiveCandidate: c.candidateRef === selectedCandidateRef,
        });
      });
    });
    return result;
  }, [data?.candidates, candidateSlotsMap, selectedCandidateRef]);

  // Collisions computed dynamically across all planned candidate slots
  const allCollisions = React.useMemo<SlotCollision[]>(() => {
    const slotMap: Record<string, string[]> = {};
    if (!data?.candidates) return data?.collisions || [];

    data.candidates.forEach((c) => {
      const slots = candidateSlotsMap[c.candidateRef] ?? c.proposal?.slots ?? [];
      slots.forEach((s) => {
        if (!slotMap[s.start]) slotMap[s.start] = [];
        if (!slotMap[s.start].includes(c.candidateRef)) {
          slotMap[s.start].push(c.candidateRef);
        }
      });
    });

    const collisions: SlotCollision[] = [];
    for (const [start, refs] of Object.entries(slotMap)) {
      if (refs.length > 1) {
        collisions.push({ slotStart: start, alsoOfferedTo: refs });
      }
    }
    return collisions.length > 0 ? collisions : data?.collisions || [];
  }, [data?.candidates, data?.collisions, candidateSlotsMap]);

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
    <div className="flex flex-col min-h-full flex-1 bg-background text-foreground">
      {/* 1. Page Bar Breadcrumbs (Acts as page title per APP-SHELL-SPEC.md) */}
      <PageBarBreadcrumbs crumbs={breadcrumbs} />

      {/* 2. Page Bar Actions: ABSENT if isMainInterviewer is false */}
      {data.isMainInterviewer && (
        <PageBarActions>
          <div className="flex items-center gap-2">
            {data.bypass?.available && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowBypassModal(true)}
                className="h-9 px-3 text-xs font-medium text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/40 cursor-pointer"
              >
                Request bypass
              </Button>
            )}
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

      {/* 4. Sub-line Header Band: Position & Shortlisted count & Candidate Quick Switcher */}
      <div className="px-6 py-2.5 bg-muted/10 border-b border-border flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground truncate">
              {data.request.position}
            </span>
            <span className="text-muted-foreground">·</span>
            <span className="text-muted-foreground font-medium whitespace-nowrap">
              {data.request.shortlistedCount ?? data.candidates.length} shortlisted
            </span>
          </div>

          {/* Candidate Switcher Chips with prominent active highlight */}
          {data.candidates && data.candidates.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto py-0.5" role="tablist" aria-label="Select active candidate">
              <span className="text-muted-foreground text-[11px] font-medium mr-0.5 hidden sm:inline">Candidate:</span>
              {data.candidates.map((cand, idx) => {
                const isSelected = cand.candidateRef === selectedCandidateRef;
                const candColor = getCandidateColor(idx);
                const slotCount = candidateSlotsMap[cand.candidateRef]?.length ?? cand.proposal?.slots?.length ?? 0;
                return (
                  <button
                    key={cand.candidateRef}
                    type="button"
                    onClick={() => handleCandidateSelection(cand.candidateRef)}
                    role="tab"
                    aria-selected={isSelected}
                    className={cn(
                      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all cursor-pointer select-none",
                      isSelected
                        ? "bg-primary text-primary-foreground shadow-xs font-semibold ring-2 ring-primary/30"
                        : "bg-muted/70 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/80"
                    )}
                    title={`Select candidate ${cand.candidateRef} (or press Tab)`}
                  >
                    <span
                      className={cn(
                        "size-2 rounded-full shrink-0",
                        isSelected ? "bg-primary-foreground" : candColor.classes.avatar
                      )}
                    />
                    <span className="font-mono">{cand.candidateRef}</span>
                    <span
                      className={cn(
                        "text-[10px] px-1 rounded-full font-mono",
                        isSelected
                          ? "bg-primary-foreground/20 text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {slotCount}/3
                    </span>
                    {isSelected && (
                      <span className="text-[10px] uppercase font-bold tracking-wider opacity-90">
                        Active
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
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
        <div className="grid min-h-0 gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          {/* Main Working Area: Suggestions / Calendar */}
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

            {/* View Switcher: Underline Tab Pair per UX §4.4 & TASK 1 */}
            <div className="flex items-center justify-between gap-4 mb-6 border-b border-border">
              <div className="flex items-center gap-6">
                <button
                  type="button"
                  onClick={() => handleSelectTab("suggested")}
                  className={cn(
                    "relative pb-3 pt-1 text-sm font-semibold transition-colors cursor-pointer flex items-center gap-2",
                    activeTab === "suggested"
                      ? "text-foreground after:absolute after:bottom-0 after:inset-x-0 after:h-0.5 after:bg-primary"
                      : "text-muted-foreground hover:text-foreground after:absolute after:bottom-0 after:inset-x-0 after:h-0.5 after:bg-transparent"
                  )}
                  aria-label="View system proposed interview times"
                >
                  <Sparkles className="size-4 text-primary" />
                  <span>Suggested times</span>
                  {suggestionsData && (
                    <Badge
                      variant="secondary"
                      className="text-[10px] px-1.5 py-0 h-4 font-mono font-bold"
                    >
                      {
                        suggestionsData.suggestions.filter(
                          (s) => !dismissedSlotIds.includes(s.slotId)
                        ).length
                      }
                    </Badge>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectTab("calendar")}
                  className={cn(
                    "relative pb-3 pt-1 text-sm font-semibold transition-colors cursor-pointer flex items-center gap-2",
                    activeTab === "calendar"
                      ? "text-foreground after:absolute after:bottom-0 after:inset-x-0 after:h-0.5 after:bg-primary"
                      : "text-muted-foreground hover:text-foreground after:absolute after:bottom-0 after:inset-x-0 after:h-0.5 after:bg-transparent"
                  )}
                  aria-label="View manual calendar grid"
                >
                  <CalendarIcon className="size-4" />
                  <span>Calendar</span>
                  {calendarCandidateSlots.length > 0 && (
                    <Badge
                      variant="outline"
                      className="text-[10px] px-1.5 py-0 h-4 font-mono font-bold"
                    >
                      {calendarCandidateSlots.length}
                    </Badge>
                  )}
                </button>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-muted-foreground pb-3">
                {undoStack.length > 0 && (
                  <button
                    type="button"
                    onClick={handleUndo}
                    className="hidden sm:inline-flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer mr-2"
                    title="Undo last change (⌘Z)"
                  >
                    <RotateCcw className="size-3" />
                    <span>Undo ({undoStack.length})</span>
                  </button>
                )}
                <span className="hidden md:inline-flex items-center gap-1.5 font-medium">
                  Press <kbd className="px-1.5 py-0.5 rounded bg-muted border font-mono text-[10px] text-foreground">C</kbd> to toggle
                </span>
                <button
                  type="button"
                  onClick={() => setShowShortcutsModal(true)}
                  className="inline-flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer ml-1"
                  title="Keyboard shortcuts (?)"
                >
                  <kbd className="px-1.5 py-0.5 rounded bg-muted border font-mono text-[10px] text-foreground">?</kbd>
                  <span className="hidden sm:inline">Shortcuts</span>
                </button>
              </div>
            </div>

            {/* TAB 1: Suggested Slots (Primary Surface per UX 1.1 & 4.2) */}
            {activeTab === "suggested" && (
              <div className="space-y-6">
                <SuggestionList
                  suggestions={suggestionsData?.suggestions || []}
                  totalFound={suggestionsData?.totalFound || 0}
                  availabilityConnected={suggestionsData?.availabilityConnected ?? true}
                  isLoading={isSuggestionsLoading || isSuggestionsFetching}
                  candidates={candidatesWithLocalSlots}
                  activeCandidateRef={selectedCandidateRef}
                  focusedIndex={focusedSuggestionIndex}
                  dismissedSlotIds={dismissedSlotIds}
                  onAddToPlan={handleAddSuggestionToPlan}
                  onDismissSuggestion={handleDismissSuggestion}
                  onRestoreDismissed={handleRestoreDismissed}
                  onSwitchToCalendarTab={() => handleSelectTab("calendar")}
                  onOpenShortcutsModal={() => setShowShortcutsModal(true)}
                  onWidenDates={() => {
                    toast.info("Widening date range by 3 days...");
                    handleFrameChange({
                      ...effectiveFrame,
                      earliestDate: getTwoWorkingDaysOut(),
                    });
                  }}
                  onDropInterviewer={() => {
                    if (effectiveFrame.selectedInterviewerIds.length > 1) {
                      const updated = effectiveFrame.selectedInterviewerIds.slice(0, -1);
                      handleFrameChange({
                        ...effectiveFrame,
                        selectedInterviewerIds: updated,
                      });
                      toast.info("Dropped an interviewer from requirement.");
                    } else {
                      toast.warning("At least one interviewer must remain on panel.");
                    }
                  }}
                  timezone={effectiveFrame.timezone}
                />

                {/* Proposed Slots for Current Active Candidate (Compact Summary) */}
                {currentSlots.length > 0 && (
                  <div className="pt-4 border-t border-border">
                    <ProposedSlotsList
                      slots={currentSlots}
                      collisions={allCollisions}
                      candidateRef={activeCandidate?.candidateRef || ""}
                      candidateTimezone={activeCandidate?.timezone || "Asia/Dubai"}
                      isOffshore={activeCandidate?.isOffshore || false}
                      onRemoveSlot={(startUtc) => handleRemoveSlot(startUtc, activeCandidate?.candidateRef)}
                      isReadOnly={!data.isMainInterviewer}
                    />
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: Calendar Workspace (Secondary Surface per UX 4.4 & TASK 2) */}
            {activeTab === "calendar" && (
              <>
                <WeekCalendar
                  candidateSlots={calendarCandidateSlots}
                  activeCandidateRef={selectedCandidateRef}
                  onAddSlot={(slot, cRef) => handleAddSuggestionToPlan(slot, cRef || selectedCandidateRef)}
                  onRemoveSlot={(startUtc, cRef) => handleRemoveSlot(startUtc, cRef)}
                  availability={data.availability}
                  interviewers={data.interviewers}
                  collisions={allCollisions}
                  candidateTimezone={activeCandidate?.timezone || "Asia/Dubai"}
                  isOffshore={activeCandidate?.isOffshore || false}
                  defaultDurationMinutes={effectiveFrame.durationMinutes || data.settings.defaultDurationMinutes || 45}
                  isReadOnly={!data.isMainInterviewer}
                />

                <ProposedSlotsList
                  slots={currentSlots}
                  collisions={allCollisions}
                  candidateRef={activeCandidate?.candidateRef || ""}
                  candidateTimezone={activeCandidate?.timezone || "Asia/Dubai"}
                  isOffshore={activeCandidate?.isOffshore || false}
                  onRemoveSlot={(startUtc) => handleRemoveSlot(startUtc, activeCandidate?.candidateRef)}
                  isReadOnly={!data.isMainInterviewer}
                />
              </>
            )}
          </div>

          {/* Right Column: Sticky 340px Plan Tray per UX §4.3 */}
          <InterviewPlanTray
            candidates={candidatesWithLocalSlots}
            candidateSlotsMap={candidateSlotsMap}
            targetSlotsPerCandidate={3}
            selectedCandidateRef={selectedCandidateRef}
            onSelectCandidate={handleCandidateSelection}
            isReadOnly={!data.isMainInterviewer}
            onSlotsChange={handleTraySlotsChange}
            onReviewAndSend={() => {
              setIdempotencyKey(
                typeof crypto !== "undefined" && crypto.randomUUID
                  ? crypto.randomUUID()
                  : `idemp-${Date.now()}`
              );
              setSendError(null);
              setShowSendModal(true);
            }}
          />
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

      {/* Keyboard Shortcuts Overlay (TASK 5 & UX Part 8) */}
      <InterviewShortcutsModal
        isOpen={showShortcutsModal}
        onClose={() => setShowShortcutsModal(false)}
      />
    </div>
  );
}
