"use client";

import * as React from "react";
import {
  Video,
  Building2,
  Clock,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  ShieldCheck,
  Eye,
} from "lucide-react";
import {
  InterviewCandidate,
  InterviewProposalSettings,
  InterviewProposedSlot,
  InterviewPlanningSettings,
  InterviewAvailability,
  Interviewer,
  InterviewMethod,
  InterviewPlatform,
} from "@/src/types/interview-planning";
import {
  addWorkingDays,
  formatReplyByDateDisplay,
  formatSlotTimeRange,
  getSlotDateLabel,
} from "../calendar/calendar-utils";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/components/ui/utils";
import { PreviewEmailModal } from "../preview/PreviewEmailModal";

interface InterviewSettingsPanelProps {
  candidate: InterviewCandidate;
  position?: string;
  settings: InterviewProposalSettings;
  onSettingsChange: (newSettings: InterviewProposalSettings) => void;
  proposedSlots: InterviewProposedSlot[];
  onSlotsChange: (newSlots: InterviewProposedSlot[]) => void;
  globalSettings: InterviewPlanningSettings;
  availability: InterviewAvailability;
  interviewers: Interviewer[];
  isReadOnly?: boolean;
}

const DURATION_OPTIONS = [15, 30, 45, 60, 90];

export function InterviewSettingsPanel({
  candidate,
  position = "Shortlisted Position",
  settings,
  onSettingsChange,
  proposedSlots,
  onSlotsChange,
  globalSettings,
  availability,
  interviewers,
  isReadOnly = false,
}: InterviewSettingsPanelProps) {
  // Modal state for Candidate Email Preview (Task 2)
  const [showPreviewModal, setShowPreviewModal] = React.useState(false);

  // Platform or Location display text
  const platformOrLocationDisplay = React.useMemo(() => {
    if (settings.method === "ONLINE") {
      switch (settings.platform) {
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
    const loc = globalSettings.locations.find((l) => l.id === settings.location);
    return loc ? loc.name : "DIEZ HQ, Meeting Room 3";
  }, [globalSettings.locations, settings.location, settings.method, settings.platform]);

  // Reference baseline date for working days (defaulting to week start 10 Aug 2026)
  const baselineDate = React.useMemo(() => new Date("2026-08-10T00:00:00Z"), []);

  // Duration change handler with automatic slot resizing and conflict check (Task 5)
  const [durationConflictWarning, setDurationConflictWarning] = React.useState<string | null>(null);

  const handleDurationChange = (newDurationStr: string) => {
    if (isReadOnly) return;
    const newDuration = parseInt(newDurationStr, 10);
    if (isNaN(newDuration)) return;

    // 1. Update settings
    onSettingsChange({
      ...settings,
      method: settings.method,
      platform: settings.platform,
      location: settings.location,
      replyByDate: settings.replyByDate,
      allowAlternatives: settings.allowAlternatives,
      allowReschedule: settings.allowReschedule,
    });

    // 2. Resize all proposed slots
    const resizedSlots = proposedSlots.map((slot) => ({
      ...slot,
      durationMinutes: newDuration,
    }));
    onSlotsChange(resizedSlots);

    // 3. Re-check availability conflicts
    if (availability.connected && availability.busy) {
      const conflicts: string[] = [];
      resizedSlots.forEach((slot) => {
        const slotStart = new Date(slot.start);
        const slotEnd = new Date(slotStart.getTime() + newDuration * 60 * 1000);

        availability.busy.forEach((b) => {
          const bStart = new Date(b.from);
          const bEnd = new Date(b.to);
          if (slotStart < bEnd && slotEnd > bStart) {
            const intv = interviewers.find((i) => i.userId === b.userId);
            const dateLabel = getSlotDateLabel(slot.start, "Asia/Dubai");
            const timeLabel = formatSlotTimeRange(slot.start, newDuration, "Asia/Dubai");
            conflicts.push(
              `${dateLabel} ${timeLabel} (${intv?.name || "an interviewer"} is busy)`
            );
          }
        });
      });

      if (conflicts.length > 0) {
        setDurationConflictWarning(
          `Resizing to ${newDuration}m creates ${conflicts.length === 1 ? "a conflict" : "conflicts"} on: ${conflicts.join(", ")}.`
        );
      } else {
        setDurationConflictWarning(null);
      }
    }
  };

  // Method preference comparison (Task 2)
  const isMethodMatching =
    candidate.methodPreference === "NO_PREFERENCE" ||
    settings.method === candidate.methodPreference;

  const handleMethodChange = (newMethod: InterviewMethod) => {
    if (isReadOnly) return;
    onSettingsChange({
      ...settings,
      method: newMethod,
      // Clear alternative method fields
      platform: newMethod === "ONLINE" ? settings.platform || "MICROSOFT_TEAMS" : null,
      location:
        newMethod === "PHYSICAL"
          ? settings.location || globalSettings.locations[0]?.id || null
          : null,
    });
  };

  // Earliest proposed slot and maximum allowed reply-by date calculation (Task 4)
  const earliestSlot = React.useMemo(() => {
    if (!proposedSlots || proposedSlots.length === 0) return null;
    return [...proposedSlots].sort((a, b) => a.start.localeCompare(b.start))[0];
  }, [proposedSlots]);

  const earliestSlotDate = earliestSlot ? earliestSlot.start.split("T")[0] : null;

  // Validate reply-by date against earliest proposed slot (must be strictly earlier)
  const isReplyDateInvalid = React.useMemo(() => {
    if (!earliestSlotDate || !settings.replyByDate) return false;
    return settings.replyByDate >= earliestSlotDate;
  }, [earliestSlotDate, settings.replyByDate]);

  // Reply-by preset options: 1, 2, 3, 5 working days
  const replyDatePresets = React.useMemo(() => {
    const presets = [1, 2, 3, 5].map((days) => {
      const target = addWorkingDays(baselineDate, days);
      const isoDate = target.toISOString().split("T")[0];
      const label = formatReplyByDateDisplay(isoDate, baselineDate);
      return { days, date: isoDate, label };
    });
    return presets;
  }, [baselineDate]);

  // Active duration from active proposed slot or global default
  const activeDuration =
    proposedSlots[0]?.durationMinutes ||
    globalSettings.defaultDurationMinutes ||
    45;

  return (
    <div className="w-full xl:w-[320px] shrink-0 flex flex-col rounded-xl border border-border bg-card shadow-xs overflow-hidden">
      {/* 1. Header */}
      <div className="px-4 py-3.5 border-b border-border bg-muted/30 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Sliders className="size-4 text-primary" />
          <h3 className="text-[13px] font-semibold text-foreground tracking-tight">
            Interview Settings
          </h3>
        </div>
        <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-full bg-muted border border-border text-foreground">
          {candidate.candidateRef}
        </span>
      </div>

      {/* 2. Scrollable Settings Content */}
      <div className="p-4 space-y-5 overflow-y-auto max-h-[calc(100vh-280px)]">
        {/* Method Section (Task 1, 2, 3) */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-foreground block">
            Interview Method
          </label>

          {/* Segmented Selector for Online vs Physical */}
          <div className="grid grid-cols-2 gap-1.5 p-1 rounded-lg border border-border bg-muted/40">
            <button
              type="button"
              disabled={isReadOnly}
              onClick={() => handleMethodChange("ONLINE")}
              className={cn(
                "flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-md text-xs font-semibold transition-all cursor-pointer",
                settings.method === "ONLINE"
                  ? "bg-background text-foreground shadow-2xs border border-border/80"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Video className="size-3.5" />
              <span>Online</span>
            </button>

            <button
              type="button"
              disabled={isReadOnly}
              onClick={() => handleMethodChange("PHYSICAL")}
              className={cn(
                "flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-md text-xs font-semibold transition-all cursor-pointer",
                settings.method === "PHYSICAL"
                  ? "bg-background text-foreground shadow-2xs border border-border/80"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Building2 className="size-3.5" />
              <span>In person</span>
            </button>
          </div>

          {/* Candidate Preference Feedback (Task 2) */}
          {isMethodMatching ? (
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium pt-0.5">
              <CheckCircle2 className="size-3.5 shrink-0" />
              <span>
                {candidate.methodPreference === "NO_PREFERENCE"
                  ? `${candidate.candidateRef} has no method preference`
                  : `Matches ${candidate.candidateRef}'s preference`}
              </span>
            </div>
          ) : (
            <div className="p-2.5 rounded-md border border-amber-300 dark:border-amber-800 bg-amber-50/90 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-[11px] flex items-start gap-2">
              <AlertTriangle className="size-3.5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
              <div className="leading-snug">
                {candidate.candidateRef} asked for an{" "}
                {candidate.methodPreference === "ONLINE" ? "online" : "in-person"}{" "}
                interview. You&apos;ve selected{" "}
                {settings.method === "ONLINE" ? "online" : "in person"}.
              </div>
            </div>
          )}
        </div>

        {/* Method-dependent selector (Task 3: Online shows platform, Physical shows location. Never both!) */}
        {settings.method === "ONLINE" && (
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground block">
              Meeting Platform
            </label>
            <Select
              disabled={isReadOnly}
              value={settings.platform || "MICROSOFT_TEAMS"}
              onValueChange={(val: InterviewPlatform) => {
                onSettingsChange({ ...settings, platform: val });
              }}
            >
              <SelectTrigger className="h-8.5 text-xs bg-background">
                <SelectValue placeholder="Select platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MICROSOFT_TEAMS">Microsoft Teams</SelectItem>
                <SelectItem value="ZOOM">Zoom</SelectItem>
                <SelectItem value="GOOGLE_MEET">Google Meet</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {settings.method === "PHYSICAL" && (
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground block">
              Interview Location
            </label>
            <Select
              disabled={isReadOnly}
              value={settings.location || globalSettings.locations[0]?.id || ""}
              onValueChange={(val: string) => {
                onSettingsChange({ ...settings, location: val });
              }}
            >
              <SelectTrigger className="h-8.5 text-xs bg-background">
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                {globalSettings.locations.map((loc) => (
                  <SelectItem key={loc.id} value={loc.id}>
                    {loc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Duration Section (Task 5: Resizes every slot and re-checks conflicts) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Clock className="size-3.5 text-muted-foreground" />
              <span>Duration</span>
            </label>
            <span className="text-[11px] font-mono text-muted-foreground">
              {activeDuration} min
            </span>
          </div>

          <Select
            disabled={isReadOnly}
            value={String(activeDuration)}
            onValueChange={handleDurationChange}
          >
            <SelectTrigger className="h-8.5 text-xs bg-background">
              <SelectValue placeholder="Duration" />
            </SelectTrigger>
            <SelectContent>
              {DURATION_OPTIONS.map((mins) => (
                <SelectItem key={mins} value={String(mins)}>
                  {mins} minutes
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Duration resize conflict warning (Task 5) */}
          {durationConflictWarning && (
            <div className="p-2.5 rounded-md border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-[11px] flex items-start gap-2">
              <AlertTriangle className="size-3.5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
              <span className="leading-snug">{durationConflictWarning}</span>
            </div>
          )}
        </div>

        {/* Reply-By Date Section (Task 4: Defaults to 3 working days, max earliest proposed slot minus 1) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Calendar className="size-3.5 text-muted-foreground" />
              <span>Reply Deadline</span>
            </label>
          </div>

          <Select
            disabled={isReadOnly}
            value={settings.replyByDate}
            onValueChange={(val: string) => {
              onSettingsChange({ ...settings, replyByDate: val });
            }}
          >
            <SelectTrigger className="h-8.5 text-xs bg-background">
              <SelectValue placeholder="Select reply deadline" />
            </SelectTrigger>
            <SelectContent>
              {replyDatePresets.map((preset) => (
                <SelectItem key={preset.date} value={preset.date}>
                  {preset.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Formatted Reply-By Display */}
          <div className="text-[11px] text-muted-foreground font-medium">
            {formatReplyByDateDisplay(settings.replyByDate, baselineDate)}
          </div>

          {/* Invalid Reply-by date rejection notice (Task 4) */}
          {isReplyDateInvalid && (
            <div className="p-2.5 rounded-md border border-destructive/40 bg-destructive/10 text-destructive text-[11px] flex items-start gap-2">
              <AlertTriangle className="size-3.5 text-destructive mt-0.5 shrink-0" />
              <span className="leading-snug">
                Reply deadline must be before the earliest proposed slot (
                {earliestSlotDate}) so the candidate has time to respond.
              </span>
            </div>
          )}
        </div>

        {/* Two Policy Toggles (Task 1) */}
        <div className="pt-2 border-t border-border space-y-3">
          {/* Toggle 1: Candidate can suggest other times */}
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <label
                htmlFor="toggle-alternatives"
                className="text-xs font-medium text-foreground block cursor-pointer"
              >
                Candidate can suggest times
              </label>
              <p className="text-[11px] text-muted-foreground leading-tight">
                Allows candidate to propose alternatives if all slots clash
              </p>
            </div>
            <Switch
              id="toggle-alternatives"
              disabled={isReadOnly}
              checked={settings.allowAlternatives}
              onCheckedChange={(checked) => {
                onSettingsChange({ ...settings, allowAlternatives: checked });
              }}
            />
          </div>

          {/* Toggle 2: Rescheduling allowed */}
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <label
                htmlFor="toggle-reschedule"
                className="text-xs font-medium text-foreground block cursor-pointer"
              >
                Rescheduling allowed
              </label>
              <p className="text-[11px] text-muted-foreground leading-tight">
                Either party may reschedule confirmed interviews
              </p>
            </div>
            <Switch
              id="toggle-reschedule"
              disabled={isReadOnly}
              checked={settings.allowReschedule}
              onCheckedChange={(checked) => {
                onSettingsChange({ ...settings, allowReschedule: checked });
              }}
            />
          </div>
        </div>
      </div>

      {/* 3. Footer: "What they get" Panel & Preview Email (Task 1 & 2) */}
      <div className="mt-auto p-4 border-t border-border bg-muted/20 space-y-3.5">
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-foreground font-semibold text-xs">
            <ShieldCheck className="size-4 text-primary shrink-0" />
            <span>What they get</span>
          </div>

          <p className="text-[11px] leading-relaxed text-muted-foreground">
            Sent through the vendor relay. The vendor&apos;s identity stays hidden from you,
            and your contact details stay hidden from them.
          </p>

          <div className="space-y-1.5 text-[11px] rounded-lg bg-card p-2.5 border border-border">
            <div className="flex items-start gap-1.5">
              <span className="font-semibold text-foreground shrink-0">They&apos;ll see:</span>
              <span className="text-muted-foreground">
                {proposedSlots.length} proposed {proposedSlots.length === 1 ? "time" : "times"}, the interview method, and the duration.
              </span>
            </div>
            <div className="flex items-start gap-1.5">
              <span className="font-semibold text-foreground shrink-0">They won&apos;t see:</span>
              <span className="text-muted-foreground">
                interviewer names, department, or the request.
              </span>
            </div>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowPreviewModal(true)}
          className="w-full h-8.5 text-xs font-semibold gap-2 cursor-pointer bg-background hover:bg-muted"
        >
          <Eye className="size-3.5 text-primary" />
          <span>Preview email</span>
        </Button>
      </div>

      {/* Candidate Email Preview Modal (Task 2) */}
      <PreviewEmailModal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        candidateRef={candidate.candidateRef}
        position={position}
        method={settings.method}
        platformOrLocation={platformOrLocationDisplay}
        durationMinutes={activeDuration}
        slots={proposedSlots}
        replyByDate={settings.replyByDate}
        candidateTimezone={candidate.timezone}
        isOffshore={candidate.isOffshore}
        allowAlternatives={settings.allowAlternatives}
      />
    </div>
  );
}
