"use client";

import * as React from "react";
import {
  Users,
  Clock,
  Video,
  Building2,
  Calendar,
  Globe,
  Edit2,
  Check,
  AlertTriangle,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Interviewer,
  PhysicalLocation,
  InterviewPlatform,
  InterviewMethod,
} from "@/src/types/interview-planning";

export interface InterviewFrameState {
  selectedInterviewerIds: string[];
  durationMinutes: number;
  method: InterviewMethod;
  platform: InterviewPlatform | null;
  location: string | null;
  earliestDate: string; // YYYY-MM-DD
  timezone: string;
}

interface InterviewFrameBarProps {
  frame: InterviewFrameState;
  onFrameChange: (newFrame: InterviewFrameState) => void;
  availableInterviewers: Interviewer[];
  availablePlatforms?: InterviewPlatform[];
  availableLocations?: PhysicalLocation[];
  candidateRef?: string;
  candidatePreference?: "ONLINE" | "PHYSICAL" | "NO_PREFERENCE";
  candidateTimezone?: string;
  isReadOnly?: boolean;
  className?: string;
}

/**
 * Helper to format date as "10 Aug"
 */
function formatDateLabel(dateStr: string): string {
  if (!dateStr) return "Select date";
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  }
  return dateStr;
}

export function InterviewFrameBar({
  frame,
  onFrameChange,
  availableInterviewers,
  availablePlatforms = ["MICROSOFT_TEAMS", "ZOOM", "GOOGLE_MEET"],
  availableLocations = [
    { id: "loc-hq-rm3", name: "DIEZ HQ, Meeting Room 3" },
    { id: "loc-hq-board", name: "DIEZ HQ, Executive Boardroom" },
  ],
  candidateRef = "Candidate",
  candidatePreference = "ONLINE",
  candidateTimezone = "Asia/Dubai",
  isReadOnly = false,
  className,
}: InterviewFrameBarProps) {
  // Popover open states per chip
  const [openChip, setOpenChip] = React.useState<
    "interviewers" | "duration" | "method" | "date" | "timezone" | "all" | null
  >(null);

  // Compute interviewer summary label (e.g. "👤 Noura + 2")
  const interviewerLabel = React.useMemo(() => {
    const selected = availableInterviewers.filter((i) =>
      frame.selectedInterviewerIds.includes(i.userId)
    );
    if (selected.length === 0) return "No interviewers";

    const lead = selected.find((i) => i.isMain) || selected[0];
    const firstName = lead.name.split(" ")[0];
    const othersCount = selected.length - 1;

    return othersCount > 0 ? `${firstName} + ${othersCount}` : lead.name;
  }, [availableInterviewers, frame.selectedInterviewerIds]);

  // Method display label
  const methodLabel = React.useMemo(() => {
    if (frame.method === "ONLINE") {
      const p = frame.platform === "MICROSOFT_TEAMS" ? "Teams" : frame.platform === "ZOOM" ? "Zoom" : "Online";
      return `Online · ${p}`;
    }
    const loc = availableLocations.find((l) => l.id === frame.location);
    const shortName = loc ? loc.name.replace("DIEZ HQ, ", "") : "In person";
    return `In person · ${shortName}`;
  }, [frame.method, frame.platform, frame.location, availableLocations]);

  // Handle interviewer toggle
  const toggleInterviewer = (userId: string) => {
    const isMain = availableInterviewers.find((i) => i.userId === userId)?.isMain;
    if (isMain) return; // Main interviewer cannot be removed

    const current = frame.selectedInterviewerIds;
    const next = current.includes(userId)
      ? current.filter((id) => id !== userId)
      : [...current, userId];

    onFrameChange({
      ...frame,
      selectedInterviewerIds: next,
    });
  };

  const isOffshore = candidateTimezone && candidateTimezone !== "Asia/Dubai";

  return (
    <div
      className={cn(
        "px-6 py-2 bg-muted/20 border-b border-border flex flex-wrap items-center justify-between gap-3 text-xs shrink-0 transition-colors",
        className
      )}
    >
      {/* Chips row */}
      <div className="flex flex-wrap items-center gap-2">
        {/* 1. Interviewers Chip */}
        <Popover
          open={openChip === "interviewers"}
          onOpenChange={(o) => setOpenChip(o ? "interviewers" : null)}
        >
          <PopoverTrigger asChild>
            <button
              type="button"
              disabled={isReadOnly}
              className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-border/70 bg-card hover:bg-muted/50 transition-colors font-medium text-foreground cursor-pointer focus:outline-hidden focus-visible:ring-1 focus-visible:ring-primary",
                isReadOnly && "opacity-75 cursor-default hover:bg-card"
              )}
            >
              <Users className="size-3.5 text-primary shrink-0" />
              <span>{interviewerLabel}</span>
            </button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-72 p-3 space-y-3">
            <div className="border-b border-border pb-1.5">
              <h4 className="text-xs font-semibold text-foreground">Panel Interviewers</h4>
              <p className="text-[11px] text-muted-foreground">
                Required interviewers for calendar availability
              </p>
            </div>
            <div className="space-y-1.5">
              {availableInterviewers.map((intv) => {
                const isSelected = frame.selectedInterviewerIds.includes(intv.userId);
                return (
                  <label
                    key={intv.userId}
                    className="flex items-center justify-between gap-2 p-1.5 rounded-md hover:bg-muted/50 cursor-pointer text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="size-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px] shrink-0">
                        {intv.initials}
                      </div>
                      <div className="truncate">
                        <span className="font-medium text-foreground block truncate">
                          {intv.name}
                        </span>
                        <span className="text-[10px] text-muted-foreground block truncate">
                          {intv.role || (intv.isMain ? "Lead Interviewer" : "Panelist")}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {intv.isMain && (
                        <span className="text-[9px] px-1 py-0.2 rounded font-bold uppercase bg-primary/15 text-primary">
                          Lead
                        </span>
                      )}
                      <input
                        type="checkbox"
                        checked={isSelected}
                        disabled={intv.isMain}
                        onChange={() => toggleInterviewer(intv.userId)}
                        className="rounded border-border size-3.5 text-primary focus:ring-primary"
                      />
                    </div>
                  </label>
                );
              })}
            </div>
          </PopoverContent>
        </Popover>

        {/* 2. Duration Chip */}
        <Popover
          open={openChip === "duration"}
          onOpenChange={(o) => setOpenChip(o ? "duration" : null)}
        >
          <PopoverTrigger asChild>
            <button
              type="button"
              disabled={isReadOnly}
              className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-border/70 bg-card hover:bg-muted/50 transition-colors font-medium text-foreground cursor-pointer focus:outline-hidden focus-visible:ring-1 focus-visible:ring-primary",
                isReadOnly && "opacity-75 cursor-default hover:bg-card"
              )}
            >
              <Clock className="size-3.5 text-primary shrink-0" />
              <span>{frame.durationMinutes} min</span>
            </button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-56 p-3 space-y-3">
            <div className="border-b border-border pb-1.5">
              <h4 className="text-xs font-semibold text-foreground">Interview Duration</h4>
              <p className="text-[11px] text-muted-foreground">Target length for each proposed slot</p>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {[30, 45, 60, 90].map((dur) => (
                <Button
                  key={dur}
                  type="button"
                  variant={frame.durationMinutes === dur ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    onFrameChange({ ...frame, durationMinutes: dur });
                    setOpenChip(null);
                  }}
                  className="h-8 text-xs font-medium cursor-pointer"
                >
                  {dur} min {dur === 45 && "★"}
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* 3. Method Chip */}
        <Popover
          open={openChip === "method"}
          onOpenChange={(o) => setOpenChip(o ? "method" : null)}
        >
          <PopoverTrigger asChild>
            <button
              type="button"
              disabled={isReadOnly}
              className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-border/70 bg-card hover:bg-muted/50 transition-colors font-medium text-foreground cursor-pointer focus:outline-hidden focus-visible:ring-1 focus-visible:ring-primary",
                isReadOnly && "opacity-75 cursor-default hover:bg-card"
              )}
            >
              {frame.method === "ONLINE" ? (
                <Video className="size-3.5 text-primary shrink-0" />
              ) : (
                <Building2 className="size-3.5 text-primary shrink-0" />
              )}
              <span>{methodLabel}</span>
            </button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-72 p-3 space-y-3">
            <div className="border-b border-border pb-1.5">
              <h4 className="text-xs font-semibold text-foreground">Interview Method</h4>
              <p className="text-[11px] text-muted-foreground">Online platform or physical room</p>
            </div>

            {/* Method switch */}
            <div className="grid grid-cols-2 gap-1.5">
              <Button
                type="button"
                variant={frame.method === "ONLINE" ? "default" : "outline"}
                size="sm"
                onClick={() =>
                  onFrameChange({
                    ...frame,
                    method: "ONLINE",
                    platform: frame.platform || "MICROSOFT_TEAMS",
                    location: null,
                  })
                }
                className="h-8 text-xs cursor-pointer"
              >
                <Video className="size-3 mr-1" />
                Online
              </Button>
              <Button
                type="button"
                variant={frame.method === "PHYSICAL" ? "default" : "outline"}
                size="sm"
                onClick={() =>
                  onFrameChange({
                    ...frame,
                    method: "PHYSICAL",
                    platform: null,
                    location: frame.location || availableLocations[0]?.id || "loc-hq-rm3",
                  })
                }
                className="h-8 text-xs cursor-pointer"
              >
                <Building2 className="size-3 mr-1" />
                In person
              </Button>
            </div>

            {/* Method dependent options */}
            {frame.method === "ONLINE" ? (
              <div className="space-y-1 pt-1">
                <label className="text-[11px] text-muted-foreground font-medium block">
                  Platform
                </label>
                <div className="space-y-1">
                  {availablePlatforms.map((plat) => (
                    <button
                      key={plat}
                      type="button"
                      onClick={() => {
                        onFrameChange({ ...frame, platform: plat });
                        setOpenChip(null);
                      }}
                      className={cn(
                        "w-full text-left p-1.5 rounded text-xs flex items-center justify-between hover:bg-muted/50 cursor-pointer",
                        frame.platform === plat && "bg-primary/10 text-primary font-medium"
                      )}
                    >
                      <span>
                        {plat === "MICROSOFT_TEAMS"
                          ? "Microsoft Teams"
                          : plat === "ZOOM"
                          ? "Zoom"
                          : "Google Meet"}
                      </span>
                      {frame.platform === plat && <Check className="size-3 text-primary" />}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-1 pt-1">
                <label className="text-[11px] text-muted-foreground font-medium block">
                  Location
                </label>
                <div className="space-y-1">
                  {availableLocations.map((loc) => (
                    <button
                      key={loc.id}
                      type="button"
                      onClick={() => {
                        onFrameChange({ ...frame, location: loc.id });
                        setOpenChip(null);
                      }}
                      className={cn(
                        "w-full text-left p-1.5 rounded text-xs flex items-center justify-between hover:bg-muted/50 cursor-pointer",
                        frame.location === loc.id && "bg-primary/10 text-primary font-medium"
                      )}
                    >
                      <span className="truncate">{loc.name}</span>
                      {frame.location === loc.id && <Check className="size-3 text-primary shrink-0 ml-1" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Candidate preference feedback */}
            {candidatePreference !== "NO_PREFERENCE" && (
              <div
                className={cn(
                  "p-2 rounded text-[11px] flex items-center gap-1.5",
                  frame.method === candidatePreference
                    ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40"
                    : "bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40"
                )}
              >
                {frame.method === candidatePreference ? (
                  <>
                    <Check className="size-3 shrink-0 text-emerald-600" />
                    <span>Matches {candidateRef}&apos;s preference</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="size-3 shrink-0 text-amber-600" />
                    <span>{candidateRef} asked for {candidatePreference.toLowerCase()}</span>
                  </>
                )}
              </div>
            )}
          </PopoverContent>
        </Popover>

        {/* 4. Earliest Date Chip */}
        <Popover
          open={openChip === "date"}
          onOpenChange={(o) => setOpenChip(o ? "date" : null)}
        >
          <PopoverTrigger asChild>
            <button
              type="button"
              disabled={isReadOnly}
              className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-border/70 bg-card hover:bg-muted/50 transition-colors font-medium text-foreground cursor-pointer focus:outline-hidden focus-visible:ring-1 focus-visible:ring-primary",
                isReadOnly && "opacity-75 cursor-default hover:bg-card"
              )}
            >
              <Calendar className="size-3.5 text-primary shrink-0" />
              <span>From {formatDateLabel(frame.earliestDate)}</span>
            </button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-64 p-3 space-y-3">
            <div className="border-b border-border pb-1.5">
              <h4 className="text-xs font-semibold text-foreground">Earliest Slot Date</h4>
              <p className="text-[11px] text-muted-foreground">
                Two working days out gives candidates time to prepare
              </p>
            </div>
            <div className="space-y-2">
              <input
                type="date"
                value={frame.earliestDate}
                onChange={(e) => {
                  if (e.target.value) {
                    onFrameChange({ ...frame, earliestDate: e.target.value });
                  }
                }}
                className="w-full px-2.5 py-1.5 rounded-md border border-border bg-card text-xs font-mono text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
              />
              <p className="text-[10px] text-muted-foreground">
                Proposals before this date are automatically filtered out.
              </p>
            </div>
          </PopoverContent>
        </Popover>

        {/* 5. Timezone Chip */}
        <Popover
          open={openChip === "timezone"}
          onOpenChange={(o) => setOpenChip(o ? "timezone" : null)}
        >
          <PopoverTrigger asChild>
            <button
              type="button"
              disabled={isReadOnly}
              className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-border/70 bg-card hover:bg-muted/50 transition-colors font-medium text-foreground cursor-pointer focus:outline-hidden focus-visible:ring-1 focus-visible:ring-primary",
                isReadOnly && "opacity-75 cursor-default hover:bg-card"
              )}
            >
              <Globe className="size-3.5 text-primary shrink-0" />
              <span>GST</span>
              {isOffshore && <span className="text-[10px] text-muted-foreground">· IST</span>}
            </button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-72 p-3 space-y-2.5">
            <div className="border-b border-border pb-1.5">
              <h4 className="text-xs font-semibold text-foreground">Timezone Alignment</h4>
              <p className="text-[11px] text-muted-foreground">Scheduling coordinates in Gulf Standard Time</p>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="p-2 rounded bg-muted/40 flex items-center justify-between">
                <span className="text-muted-foreground">Hiring Team:</span>
                <strong className="text-foreground font-mono">GST (Asia/Dubai · UTC+4)</strong>
              </div>
              {isOffshore && (
                <div className="p-2 rounded bg-primary/5 border border-primary/15 flex items-center justify-between">
                  <span className="text-muted-foreground">Candidate ({candidateRef}):</span>
                  <strong className="text-primary font-mono">{candidateTimezone} (UTC+5:30)</strong>
                </div>
              )}
              <p className="text-[10px] text-muted-foreground leading-tight pt-1">
                Slots render candidate local time side-by-side automatically.
              </p>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Right side: Edit affordance per 4.1 */}
      {!isReadOnly && (
        <Popover
          open={openChip === "all"}
          onOpenChange={(o) => setOpenChip(o ? "all" : null)}
        >
          <PopoverTrigger asChild>
            <button
              type="button"
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors cursor-pointer px-2 py-0.5 rounded hover:bg-primary/5"
            >
              <Edit2 className="size-3 shrink-0" />
              <span>Edit</span>
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-4 space-y-4">
            <div className="border-b border-border pb-2">
              <h4 className="text-xs font-semibold text-foreground">
                Edit Interview Decisions
              </h4>
              <p className="text-[11px] text-muted-foreground">
                Quickly adjust duration, method, and earliest date
              </p>
            </div>

            {/* Duration */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-foreground block">
                Duration
              </label>
              <div className="grid grid-cols-4 gap-1">
                {[30, 45, 60, 90].map((dur) => (
                  <Button
                    key={dur}
                    type="button"
                    variant={frame.durationMinutes === dur ? "default" : "outline"}
                    size="sm"
                    onClick={() => onFrameChange({ ...frame, durationMinutes: dur })}
                    className="h-7 text-xs"
                  >
                    {dur}m
                  </Button>
                ))}
              </div>
            </div>

            {/* Method */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-foreground block">
                Method
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <Button
                  type="button"
                  variant={frame.method === "ONLINE" ? "default" : "outline"}
                  size="sm"
                  onClick={() =>
                    onFrameChange({
                      ...frame,
                      method: "ONLINE",
                      platform: frame.platform || "MICROSOFT_TEAMS",
                      location: null,
                    })
                  }
                  className="h-7 text-xs"
                >
                  Online
                </Button>
                <Button
                  type="button"
                  variant={frame.method === "PHYSICAL" ? "default" : "outline"}
                  size="sm"
                  onClick={() =>
                    onFrameChange({
                      ...frame,
                      method: "PHYSICAL",
                      platform: null,
                      location: frame.location || availableLocations[0]?.id || "loc-hq-rm3",
                    })
                  }
                  className="h-7 text-xs"
                >
                  In person
                </Button>
              </div>
            </div>

            {/* Earliest Date */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-foreground block">
                Earliest date
              </label>
              <input
                type="date"
                value={frame.earliestDate}
                onChange={(e) => {
                  if (e.target.value) {
                    onFrameChange({ ...frame, earliestDate: e.target.value });
                  }
                }}
                className="w-full px-2.5 py-1.5 rounded-md border border-border bg-card text-xs font-mono text-foreground focus:ring-1 focus:ring-primary"
              />
            </div>

            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={() => setOpenChip(null)}
              className="w-full h-8 text-xs font-semibold cursor-pointer"
            >
              Done
            </Button>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
