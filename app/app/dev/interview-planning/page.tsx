"use client";

import * as React from "react";
import {
  Sparkles,
  Layers,
  Calendar as CalendarIcon,
  ShieldCheck,
  RotateCcw,
  CheckCircle2,
  CalendarOff,
  AlertTriangle,
  Globe,
  Keyboard,
} from "lucide-react";
import {
  getInterviewPlanningFixture,
  FIXTURE_SUGGESTIONS_REFERENCE,
  FIXTURE_SUGGESTIONS_OFFSHORE,
  FIXTURE_SUGGESTIONS_DISCONNECTED,
  FIXTURE_INTERVIEW_REFERENCE,
} from "@/src/lib/interview-planning/fixtures";
import { ExternalLink } from "lucide-react";
import { SuggestionList } from "@/components/oms/interviews/suggestions/SuggestionList";
import { SuggestionCard } from "@/components/oms/interviews/suggestions/SuggestionCard";
import {
  WeekCalendar,
  CalendarCandidateSlot,
  ProposedSlotsList,
} from "@/components/oms/interviews/calendar";
import { InterviewPlanTray } from "@/components/oms/interviews/tray";
import { InterviewShortcutsModal } from "@/components/oms/interviews/dialogs";
import {
  InterviewSuggestion,
  InterviewCandidate,
  InterviewProposedSlot,
  SlotCollision,
} from "@/src/types/interview-planning";
import { getCandidateColor } from "@/src/lib/interview-planning/candidate-colors";
import { getSlotDateLabel, formatSlotTimeRange } from "@/components/oms/interviews/calendar/calendar-utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type TestScenario = "reference" | "offshore" | "disconnected" | "empty";

export default function InterviewPlanningDevPage() {
  const [scenario, setScenario] = React.useState<TestScenario>("reference");

  // Tab persistence per TASK 1
  const TAB_STORAGE_KEY = "oms_dev_interview_planning_tab";
  const [activeTab, setActiveTab] = React.useState<"suggested" | "calendar">("suggested");

  React.useEffect(() => {
    try {
      const saved = localStorage.getItem(TAB_STORAGE_KEY);
      if (saved === "suggested" || saved === "calendar") {
        setActiveTab(saved);
      }
    } catch {
      // Ignore
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

  const scenarioRequisitionId = React.useMemo(() => {
    switch (scenario) {
      case "reference":
        return "OMS-2026-0148";
      case "offshore":
        return "OMS-2026-0102";
      case "disconnected":
        return "OMS-2026-0148";
      case "empty":
        return "OMS-2026-0141";
    }
  }, [scenario]);

  // Candidates state initialized from demo-data
  const [candidates, setCandidates] = React.useState<InterviewCandidate[]>(() => {
    const fixture = getInterviewPlanningFixture("OMS-2026-0148");
    return fixture?.candidates || FIXTURE_INTERVIEW_REFERENCE.candidates;
  });
  const [selectedCandidateRef, setSelectedCandidateRef] = React.useState<string>(() => {
    const fixture = getInterviewPlanningFixture("OMS-2026-0148");
    return fixture?.candidates[0]?.candidateRef || "C-014";
  });

  // Re-sync candidates whenever scenario changes
  React.useEffect(() => {
    const fixture = getInterviewPlanningFixture(scenarioRequisitionId);
    if (fixture && fixture.candidates.length > 0) {
      setCandidates(fixture.candidates);
      setSelectedCandidateRef(fixture.candidates[0].candidateRef);
    } else if (scenario === "empty") {
      setCandidates([]);
      setSelectedCandidateRef("");
    } else {
      setCandidates(FIXTURE_INTERVIEW_REFERENCE.candidates);
      setSelectedCandidateRef(FIXTURE_INTERVIEW_REFERENCE.candidates[0].candidateRef);
    }
    setDismissedSlotIds([]);
  }, [scenario, scenarioRequisitionId]);

  // Suggestions state based on scenario
  const currentDataset = React.useMemo(() => {
    switch (scenario) {
      case "reference":
        return FIXTURE_SUGGESTIONS_REFERENCE;
      case "offshore":
        return FIXTURE_SUGGESTIONS_OFFSHORE;
      case "disconnected":
        return FIXTURE_SUGGESTIONS_DISCONNECTED;
      case "empty":
        return {
          suggestions: [],
          totalFound: 0,
          availabilityConnected: true,
          computedAt: "2026-08-06T09:12:00Z",
        };
    }
  }, [scenario]);

  const [dismissedSlotIds, setDismissedSlotIds] = React.useState<string[]>([]);
  const [focusedSuggestionIndex, setFocusedSuggestionIndex] = React.useState<number>(-1);
  const [showShortcutsModal, setShowShortcutsModal] = React.useState<boolean>(false);

  // 20-step undo history (TASK 4)
  interface DevPlanSnapshot {
    candidates: InterviewCandidate[];
    dismissedSlotIds: string[];
    description: string;
  }
  const [undoStack, setUndoStack] = React.useState<DevPlanSnapshot[]>([]);

  const pushUndoSnapshot = React.useCallback(
    (description: string) => {
      setUndoStack((prev) => {
        const snapshot: DevPlanSnapshot = {
          candidates: JSON.parse(JSON.stringify(candidates)),
          dismissedSlotIds: [...dismissedSlotIds],
          description,
        };
        return [...prev.slice(-19), snapshot];
      });
    },
    [candidates, dismissedSlotIds]
  );

  const handleUndo = React.useCallback(() => {
    if (undoStack.length === 0) {
      toast.info("Nothing to undo.");
      return;
    }
    const last = undoStack[undoStack.length - 1];
    setUndoStack((prev) => prev.slice(0, -1));
    setCandidates(last.candidates);
    setDismissedSlotIds(last.dismissedSlotIds);
    toast.success(`Undid: ${last.description}`);
  }, [undoStack]);

  // Handle adding slot to candidate (from suggestions or calendar)
  const handleAddToPlan = React.useCallback(
    (
      slot: { start: string; durationMinutes: number },
      targetCandidateRef: string
    ) => {
      const targetCandidate = candidates.find((c) => c.candidateRef === targetCandidateRef);
      if (!targetCandidate) return;

      const currentSlots = targetCandidate.proposal?.slots || [];
      if (currentSlots.some((s) => s.start === slot.start)) {
        toast.info(`Slot is already in ${targetCandidateRef}'s plan.`);
        return;
      }
      if (currentSlots.length >= 3) {
        toast.warning(`${targetCandidateRef} already has 3 slots.`);
        return;
      }

      pushUndoSnapshot(`Add slot to ${targetCandidateRef}`);
      setCandidates((prev) =>
        prev.map((c) => {
          if (c.candidateRef !== targetCandidateRef) return c;
          return {
            ...c,
            proposal: {
              ...c.proposal,
              slots: [...(c.proposal?.slots || []), slot],
            },
          };
        })
      );
      toast.success(`Added slot to ${targetCandidateRef}!`);
    },
    [candidates, pushUndoSnapshot]
  );

  // Remove slot from candidate plan
  const handleRemoveSlot = React.useCallback(
    (startUtc: string, targetRef?: string) => {
      const targetCandidateRef = targetRef || selectedCandidateRef;
      pushUndoSnapshot(`Remove slot from ${targetCandidateRef}`);
      setCandidates((prev) =>
        prev.map((c) => {
          if (c.candidateRef !== targetCandidateRef) return c;
          return {
            ...c,
            proposal: {
              ...c.proposal,
              slots: (c.proposal?.slots || []).filter((s) => s.start !== startUtc),
            },
          };
        })
      );
      toast.info(`Removed slot from ${targetCandidateRef}`);
    },
    [selectedCandidateRef, pushUndoSnapshot]
  );

  // Dismiss a suggestion
  const handleDismissSuggestion = React.useCallback(
    (slotId: string) => {
      pushUndoSnapshot("Dismiss suggestion");
      setDismissedSlotIds((prev) => [...prev, slotId]);
      toast.info("Suggestion dismissed. Press ⌘Z to undo.", {
        action: {
          label: "Undo",
          onClick: handleUndo,
        },
      });
    },
    [handleUndo, pushUndoSnapshot]
  );

  const handleRestoreDismissed = React.useCallback(() => {
    pushUndoSnapshot("Restore dismissed suggestions");
    setDismissedSlotIds([]);
    toast.success("Restored all dismissed suggestions.");
  }, [pushUndoSnapshot]);

  // Global keyboard shortcuts (TASK 3)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInput =
        activeEl instanceof HTMLInputElement ||
        activeEl instanceof HTMLTextAreaElement ||
        (activeEl as HTMLElement)?.isContentEditable;
      const isDialogOpen =
        Boolean(document.querySelector('[role="dialog"]')) ||
        Boolean(document.querySelector('[role="alertdialog"]'));

      if (isInput || isDialogOpen) return;

      // ⌘Z / Ctrl+Z (Undo)
      if ((e.metaKey || e.ctrlKey) && (e.key === "z" || e.key === "Z") && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
        return;
      }

      // 'C' (Toggle view)
      if ((e.key === "c" || e.key === "C") && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        handleSelectTab(activeTab === "suggested" ? "calendar" : "suggested");
        return;
      }

      // '?' (Shortcut overlay)
      if (e.key === "?" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setShowShortcutsModal(true);
        return;
      }

      // Tab (Switch active candidate in tray)
      if (e.key === "Tab" && !e.metaKey && !e.ctrlKey && candidates.length > 0) {
        e.preventDefault();
        const currentIdx = candidates.findIndex((c) => c.candidateRef === selectedCandidateRef);
        const nextIdx = e.shiftKey
          ? (currentIdx - 1 + candidates.length) % candidates.length
          : (currentIdx + 1) % candidates.length;
        const nextCand = candidates[nextIdx];
        if (nextCand) {
          setSelectedCandidateRef(nextCand.candidateRef);
          toast.info(`Active candidate: ${nextCand.candidateRef}`, { duration: 1200 });
        }
        return;
      }

      // Suggestions specific
      if (activeTab === "suggested") {
        const activeList = currentDataset.suggestions.filter(
          (s) => !dismissedSlotIds.includes(s.slotId)
        );

        if (e.key === "ArrowDown") {
          e.preventDefault();
          setFocusedSuggestionIndex((prev) =>
            prev < 0 ? 0 : Math.min(activeList.length - 1, prev + 1)
          );
          return;
        }
        if (e.key === "ArrowUp") {
          e.preventDefault();
          setFocusedSuggestionIndex((prev) => (prev <= 0 ? 0 : prev - 1));
          return;
        }
        if ((e.key === "x" || e.key === "X") && !e.metaKey && !e.ctrlKey) {
          if (activeList.length > 0) {
            e.preventDefault();
            const target = activeList[focusedSuggestionIndex] || activeList[0];
            if (target) {
              handleDismissSuggestion(target.slotId);
            }
          }
          return;
        }

        const num = parseInt(e.key, 10);
        if (!isNaN(num) && num >= 1 && num <= 9 && !e.metaKey && !e.ctrlKey) {
          const target = activeList[num - 1];
          if (target) {
            e.preventDefault();
            handleAddToPlan(
              { start: target.start, durationMinutes: target.durationMinutes },
              selectedCandidateRef
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
    candidates,
    currentDataset.suggestions,
    dismissedSlotIds,
    focusedSuggestionIndex,
    handleAddToPlan,
    handleDismissSuggestion,
    handleSelectTab,
    handleUndo,
    selectedCandidateRef,
  ]);

  // Derive slots for candidate slots map
  const candidateSlotsMap = React.useMemo(() => {
    return candidates.reduce((acc, c) => {
      acc[c.candidateRef] = c.proposal?.slots || [];
      return acc;
    }, {} as Record<string, InterviewProposedSlot[]>);
  }, [candidates]);

  // Multi-candidate slots on calendar (TASK 2)
  const calendarCandidateSlots = React.useMemo<CalendarCandidateSlot[]>(() => {
    const result: CalendarCandidateSlot[] = [];
    candidates.forEach((c, idx) => {
      (c.proposal?.slots || []).forEach((s) => {
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
  }, [candidates, selectedCandidateRef]);

  // Dynamic collisions
  const collisions = React.useMemo<SlotCollision[]>(() => {
    const slotMap: Record<string, string[]> = {};
    for (const [cRef, slots] of Object.entries(candidateSlotsMap)) {
      for (const s of slots) {
        if (!slotMap[s.start]) slotMap[s.start] = [];
        if (!slotMap[s.start].includes(cRef)) slotMap[s.start].push(cRef);
      }
    }
    const result: SlotCollision[] = [];
    for (const [start, refs] of Object.entries(slotMap)) {
      if (refs.length > 1) {
        result.push({ slotStart: start, alsoOfferedTo: refs });
      }
    }
    return result;
  }, [candidateSlotsMap]);

  const activeCandidate = candidates.find((c) => c.candidateRef === selectedCandidateRef) || candidates[0];

  return (
    <div className="p-8 pb-32 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-mono text-primary font-semibold mb-1 tracking-wider uppercase">
          UX5 · Calendar Tab &amp; Keyboard Engine
        </div>
        <h1 className="text-3xl font-display font-bold text-heading">
          Interview Planning Interactive Harness
        </h1>
        <p className="text-muted-foreground mt-2 text-sm max-w-3xl leading-relaxed">
          Verify underline tab persistence, multi-candidate calendar with identity colors,
          keyboard engine (1-9, ↑↓, X, Tab, ⌘Z, C, ?), 20-step undo history, and discoverability overlay.
        </p>
      </div>

      {/* Test Controls Bar */}
      <div className="p-4 rounded-xl border border-border bg-card shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="font-mono text-xs bg-primary/10 text-primary border-primary/20 mr-1">
            DEV WORKBENCH
          </Badge>
          <Button
            size="sm"
            variant={scenario === "reference" ? "default" : "outline"}
            onClick={() => setScenario("reference")}
            className="text-xs font-semibold cursor-pointer"
          >
            (a) Reference 0148 (C-014 Samir Rahman)
          </Button>

          <Button
            size="sm"
            variant={scenario === "offshore" ? "default" : "outline"}
            onClick={() => setScenario("offshore")}
            className="text-xs font-semibold cursor-pointer"
          >
            (b) Offshore 0102 (C-031 Priya Sharma)
          </Button>

          <Button
            size="sm"
            variant={scenario === "disconnected" ? "default" : "outline"}
            onClick={() => setScenario("disconnected")}
            className="text-xs font-semibold cursor-pointer"
          >
            (c) Disconnected Calendar (0148)
          </Button>

          <Button
            size="sm"
            variant={scenario === "empty" ? "default" : "outline"}
            onClick={() => setScenario("empty")}
            className="text-xs font-semibold cursor-pointer"
          >
            (d) Empty Sourcing (0141)
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleUndo}
            disabled={undoStack.length === 0}
            className="text-xs font-semibold gap-1.5 cursor-pointer"
          >
            <RotateCcw className="size-3.5" />
            <span>Undo ({undoStack.length})</span>
          </Button>

          <Button
            size="sm"
            variant="secondary"
            onClick={() => window.open(`/app/candidates/interviews/plan/${scenarioRequisitionId}`, '_blank')}
            className="text-xs font-semibold gap-1.5 cursor-pointer"
            title="Open real interview planning route in new tab"
          >
            <span>Open Real Page</span>
            <ExternalLink className="size-3.5" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowShortcutsModal(true)}
            className="text-xs font-semibold gap-1.5 cursor-pointer"
          >
            <Keyboard className="size-3.5 text-primary" />
            <span>Shortcuts (?)</span>
          </Button>
        </div>
      </div>

      {/* Candidate Quick Switcher Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl border border-border bg-card/60 shadow-2xs">
        <div className="flex items-center gap-2 overflow-x-auto" role="tablist" aria-label="Select active candidate">
          <span className="text-muted-foreground text-xs font-medium mr-1">Active candidate:</span>
          {candidates.map((cand, idx) => {
            const isSelected = cand.candidateRef === selectedCandidateRef;
            const candColor = getCandidateColor(idx);
            const slotCount = cand.proposal?.slots?.length ?? 0;
            return (
              <button
                key={cand.candidateRef}
                type="button"
                onClick={() => setSelectedCandidateRef(cand.candidateRef)}
                role="tab"
                aria-selected={isSelected}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer select-none",
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
        <span className="text-[11px] text-muted-foreground font-mono">
          Tip: Press <kbd className="px-1 py-0.5 rounded bg-muted border text-foreground">Tab</kbd> to cycle candidate
        </span>
      </div>

      {/* Main 2-Column Planning Area */}
      <div className="grid min-h-0 gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        {/* Working Area */}
        <div className="min-w-0 flex flex-col">
          {/* TASK 1: Underline Tab Pair with User Persistence */}
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
                aria-label="View suggested times"
              >
                <Sparkles className="size-4 text-primary" />
                <span>Suggested times</span>
                <Badge
                  variant="secondary"
                  className="text-[10px] px-1.5 py-0 h-4 font-mono font-bold"
                >
                  {currentDataset.suggestions.filter((s) => !dismissedSlotIds.includes(s.slotId)).length}
                </Badge>
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
                aria-label="View calendar"
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
              <span className="hidden sm:inline-flex items-center gap-1.5 font-medium">
                Press <kbd className="px-1.5 py-0.5 rounded bg-muted border font-mono text-[10px] text-foreground">C</kbd> to toggle view
              </span>
            </div>
          </div>

          {/* TAB 1: Suggested times */}
          {activeTab === "suggested" && (
            <div className="space-y-6">
              <SuggestionList
                suggestions={currentDataset.suggestions}
                totalFound={currentDataset.totalFound}
                availabilityConnected={currentDataset.availabilityConnected}
                candidates={candidates}
                activeCandidateRef={selectedCandidateRef}
                focusedIndex={focusedSuggestionIndex}
                dismissedSlotIds={dismissedSlotIds}
                onAddToPlan={handleAddToPlan}
                onDismissSuggestion={handleDismissSuggestion}
                onRestoreDismissed={handleRestoreDismissed}
                onSwitchToCalendarTab={() => handleSelectTab("calendar")}
                onOpenShortcutsModal={() => setShowShortcutsModal(true)}
                timezone="Asia/Dubai"
              />

              {activeCandidate.proposal.slots.length > 0 && (
                <div className="pt-4 border-t border-border">
                  <ProposedSlotsList
                    slots={activeCandidate.proposal.slots}
                    collisions={collisions}
                    candidateRef={activeCandidate.candidateRef}
                    candidateTimezone={activeCandidate.timezone}
                    isOffshore={activeCandidate.isOffshore}
                    onRemoveSlot={(startUtc) => handleRemoveSlot(startUtc, activeCandidate.candidateRef)}
                  />
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Calendar Tab (TASK 2) */}
          {activeTab === "calendar" && (
            <div className="space-y-6">
              <WeekCalendar
                candidateSlots={calendarCandidateSlots}
                activeCandidateRef={selectedCandidateRef}
                onAddSlot={(slot, cRef) => handleAddToPlan(slot, cRef || selectedCandidateRef)}
                onRemoveSlot={(startUtc, cRef) => handleRemoveSlot(startUtc, cRef)}
                availability={FIXTURE_INTERVIEW_REFERENCE.availability}
                interviewers={FIXTURE_INTERVIEW_REFERENCE.interviewers}
                collisions={collisions}
                candidateTimezone={activeCandidate.timezone}
                isOffshore={activeCandidate.isOffshore}
                defaultDurationMinutes={45}
              />

              <ProposedSlotsList
                slots={activeCandidate.proposal.slots}
                collisions={collisions}
                candidateRef={activeCandidate.candidateRef}
                candidateTimezone={activeCandidate.timezone}
                isOffshore={activeCandidate.isOffshore}
                onRemoveSlot={(startUtc) => handleRemoveSlot(startUtc, activeCandidate.candidateRef)}
              />
            </div>
          )}
        </div>

        {/* Right Column: Sticky 340px Plan Tray */}
        <InterviewPlanTray
          candidates={candidates}
          candidateSlotsMap={candidateSlotsMap}
          targetSlotsPerCandidate={3}
          selectedCandidateRef={selectedCandidateRef}
          onSelectCandidate={setSelectedCandidateRef}
          onSlotsChange={(targetRef, newSlots) => {
            pushUndoSnapshot(`Reassign slots for ${targetRef}`);
            setCandidates((prev) =>
              prev.map((c) =>
                c.candidateRef === targetRef
                  ? { ...c, proposal: { ...c.proposal, slots: newSlots } }
                  : c
              )
            );
          }}
          onReviewAndSend={() => {
            toast.success("Review & send opened! Round is ready.");
          }}
        />
      </div>

      {/* Keyboard Shortcuts Overlay Modal (TASK 5) */}
      <InterviewShortcutsModal
        isOpen={showShortcutsModal}
        onClose={() => setShowShortcutsModal(false)}
      />

      {/* Verification Matrix per UX5 */}
      <section className="pt-8 border-t border-border space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <ShieldCheck className="size-5 text-emerald-600" />
          <span>UX5 Specification Verification Matrix</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border border-border bg-card space-y-1.5 shadow-2xs">
            <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
              <CheckCircle2 className="size-4 text-emerald-600" />
              Task 1 — Underline Tabs
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Underline pair above working area. &ldquo;Suggested times&rdquo; is default. Selection persists in localStorage.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-border bg-card space-y-1.5 shadow-2xs">
            <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
              <CheckCircle2 className="size-4 text-emerald-600" />
              Task 2 — Calendar &amp; Identity Colours
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Two tabs, one plan. Slots appear identically in tray. Slots render in candidate&apos;s identity colour (left border, soft tint, reference badge).
            </p>
          </div>

          <div className="p-4 rounded-xl border border-border bg-card space-y-1.5 shadow-2xs">
            <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
              <CheckCircle2 className="size-4 text-emerald-600" />
              Task 3 — Keyboard Engine
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              1-9 add to plan, ↑↓ navigate suggestions, X dismiss, Tab cycle candidate in tray, C toggle view, ? shortcut overlay.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-border bg-card space-y-1.5 shadow-2xs">
            <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
              <CheckCircle2 className="size-4 text-emerald-600" />
              Task 4 — 20-Step Undo History
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Every plan change is undoable: add, remove, reassign, dismiss. ⌘Z pops snapshot and restores cleanly.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-border bg-card space-y-1.5 shadow-2xs">
            <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
              <CheckCircle2 className="size-4 text-emerald-600" />
              Task 5 — Discoverability
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Small keyboard hint beneath suggestion list with keycaps, plus the ? modal overlay.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-border bg-card space-y-1.5 shadow-2xs">
            <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
              <CheckCircle2 className="size-4 text-emerald-600" />
              Inertness Guard
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Shortcuts are completely inert while focused inside text inputs, textareas, or open dialogs.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
