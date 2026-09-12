"use client";

import * as React from "react";
import {
  Video,
  Building2,
  HelpCircle,
  Clock,
  CheckCircle2,
  XCircle,
  RotateCcw,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import {
  InterviewCandidate,
  InterviewBypassInfo,
  InterviewCandidateStatus,
  CandidatePriority,
} from "@/src/types/interview-planning";
import { cn } from "@/components/ui/utils";
import { Badge } from "@/components/ui/badge";

interface CandidateRailProps {
  candidates: InterviewCandidate[];
  selectedCandidateRef: string;
  onSelectCandidate: (candidateRef: string) => void;
  bypass: InterviewBypassInfo;
  onBypassClick: () => void;
}

/**
 * Status visual badge configuration for all 6 interview states
 */
function StatusPill({
  status,
  daysWaiting,
  isOverdue = false,
  rescheduleCount = 0,
}: {
  status: InterviewCandidateStatus;
  daysWaiting: number;
  isOverdue?: boolean;
  rescheduleCount?: number;
}) {
  switch (status) {
    case "NOT_SENT":
      return (
        <Badge
          variant="outline"
          className="rounded-md border-border bg-muted/60 text-muted-foreground px-2 py-0.5 text-[11px] font-medium"
        >
          Not sent
        </Badge>
      );
    case "AWAITING_REPLY":
      return (
        <Badge
          variant="outline"
          className="rounded-md border-blue-200 dark:border-blue-800/40 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 px-2 py-0.5 text-[11px] font-medium"
        >
          <Clock className="size-3 mr-1 shrink-0" />
          Awaiting reply {daysWaiting > 0 && `· ${daysWaiting}d`}
        </Badge>
      );
    case "DECLINED":
      return (
        <Badge
          variant="outline"
          className="rounded-md border-red-200 dark:border-red-800/40 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 px-2 py-0.5 text-[11px] font-medium"
        >
          <XCircle className="size-3 mr-1 shrink-0" />
          Slots declined
        </Badge>
      );
    case "CONFIRMED":
      return (
        <Badge
          variant="outline"
          className="rounded-md border-emerald-200 dark:border-emerald-800/40 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 text-[11px] font-medium"
        >
          <CheckCircle2 className="size-3 mr-1 shrink-0" />
          Confirmed
        </Badge>
      );
    case "RESCHEDULING": {
      const rescheduleLabel =
        rescheduleCount === 1
          ? "Rescheduled once"
          : rescheduleCount === 2
          ? "Rescheduled twice"
          : rescheduleCount > 2
          ? `Rescheduled ${rescheduleCount}x`
          : "Rescheduling";

      return (
        <Badge
          variant="outline"
          className="rounded-md border-amber-200 dark:border-amber-800/40 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 px-2 py-0.5 text-[11px] font-medium"
        >
          <RotateCcw className="size-3 mr-1 shrink-0" />
          {rescheduleLabel}
        </Badge>
      );
    }
    case "AWAITING_OUTCOME":
      return (
        <Badge
          variant="outline"
          className={cn(
            "rounded-md px-2 py-0.5 text-[11px] font-medium",
            isOverdue
              ? "border-amber-300 dark:border-amber-700/60 bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 ring-1 ring-amber-500/20"
              : "border-border bg-muted/70 text-foreground"
          )}
        >
          <AlertCircle className="size-3 mr-1 shrink-0" />
          Awaiting outcome
          {isOverdue && " · 1 day overdue"}
        </Badge>
      );
    case "BYPASS_REQUESTED":
      return (
        <Badge
          variant="outline"
          className="rounded-md border-purple-200 dark:border-purple-800/40 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 px-2 py-0.5 text-[11px] font-medium"
        >
          <Clock className="size-3 mr-1 shrink-0" />
          Bypass requested
        </Badge>
      );
    default:
      return null;
  }
}

/**
 * Priority indicator styling
 */
function PriorityPill({ priority }: { priority: CandidatePriority }) {
  const styles = {
    P1: "border-primary/30 bg-primary/10 text-primary dark:text-primary font-bold",
    P2: "border-border bg-muted text-muted-foreground font-semibold",
    P3: "border-border bg-muted/60 text-muted-foreground/80 font-normal",
  };

  return (
    <Badge
      variant="outline"
      className={cn("px-1.5 py-0 text-[10px] rounded font-mono", styles[priority])}
    >
      {priority}
    </Badge>
  );
}

/**
 * Candidate preference icon and text
 */
function PreferenceIndicator({
  preference,
}: {
  preference: InterviewCandidate["methodPreference"];
}) {
  switch (preference) {
    case "ONLINE":
      return (
        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <Video className="size-3 text-muted-foreground/70 shrink-0" />
          <span>Prefers online</span>
        </div>
      );
    case "PHYSICAL":
      return (
        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <Building2 className="size-3 text-muted-foreground/70 shrink-0" />
          <span>Prefers in person</span>
        </div>
      );
    case "NO_PREFERENCE":
    default:
      return (
        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <HelpCircle className="size-3 text-muted-foreground/50 shrink-0" />
          <span>No preference</span>
        </div>
      );
  }
}

export function CandidateRail({
  candidates,
  selectedCandidateRef,
  onSelectCandidate,
  bypass,
  onBypassClick,
}: CandidateRailProps) {
  return (
    <div className="w-full xl:w-[280px] shrink-0 flex flex-col rounded-xl border border-border bg-card shadow-xs overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3.5 border-b border-border bg-muted/30 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-semibold text-foreground tracking-tight">
            Candidates
          </span>
          <span className="text-[11px] font-medium text-muted-foreground px-1.5 py-0.5 rounded-full bg-muted border border-border tabular-nums">
            {candidates.length}
          </span>
        </div>
        <span className="text-[11px] text-muted-foreground">
          Select one
        </span>
      </div>

      {/* Candidate Queue with Independent Scroll */}
      <div className="p-3 space-y-2 overflow-y-auto max-h-[calc(100vh-280px)] min-h-[300px]">
        {candidates.map((cand) => {
          const isSelected = cand.candidateRef === selectedCandidateRef;
          const isOverdue =
            cand.status === "AWAITING_OUTCOME" && cand.daysWaiting > 0;

          return (
            <button
              key={cand.candidateRef}
              type="button"
              onClick={() => onSelectCandidate(cand.candidateRef)}
              className={cn(
                "w-full text-left p-3 rounded-lg border transition-all relative group cursor-pointer",
                isSelected
                  ? "bg-background border-primary shadow-xs ring-2 ring-primary/10"
                  : "bg-card hover:bg-muted/40 border-border/80 text-foreground"
              )}
            >
              {/* Top row: Reference and Priority */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "font-mono text-xs font-bold tracking-tight",
                      isSelected ? "text-primary" : "text-foreground"
                    )}
                  >
                    {cand.candidateRef}
                  </span>
                  <PriorityPill priority={cand.priority} />
                </div>

                {cand.isOffshore && (
                  <span className="text-[10px] font-medium text-muted-foreground px-1 py-0.2 rounded bg-muted/50 border border-border">
                    Offshore
                  </span>
                )}
              </div>

              {/* Status row */}
              <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                <StatusPill
                  status={cand.status}
                  daysWaiting={cand.daysWaiting}
                  isOverdue={isOverdue}
                  rescheduleCount={cand.rescheduleCount}
                />
              </div>

              {/* Method preference row */}
              <div className="mt-2 pt-2 border-t border-border/50 flex items-center justify-between">
                <PreferenceIndicator preference={cand.methodPreference} />
                {cand.proposal?.slots?.length > 0 && (
                  <span className="text-[10px] font-medium text-primary/80 tabular-nums">
                    {cand.proposal.slots.length} {cand.proposal.slots.length === 1 ? "slot" : "slots"}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Bypass Link Footer (Task 5) */}
      {bypass.available && (
        <div className="mt-auto p-3.5 border-t border-border bg-muted/20">
          <button
            type="button"
            onClick={onBypassClick}
            className="group flex flex-col items-start gap-1 text-left w-full cursor-pointer"
          >
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary group-hover:underline">
              Bypass interview
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
            </span>
            <span className="text-[11px] text-muted-foreground leading-tight">
              Requires HOD approval from {bypass.requiresApprovalFrom.name}
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
