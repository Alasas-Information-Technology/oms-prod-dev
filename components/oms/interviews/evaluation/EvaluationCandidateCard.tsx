"use client";

import * as React from "react";
import { User, ShieldAlert, Clock, Calendar, FileText } from "lucide-react";
import {
  CandidateEvaluationSummary,
  CandidatePriority,
} from "@/src/types/interview-evaluation";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface EvaluationCandidateCardProps {
  candidateRef: string;
  priority: CandidatePriority;
  candidate: CandidateEvaluationSummary;
  className?: string;
}

const PRIORITY_STYLES: Record<CandidatePriority, string> = {
  P1: "border-primary/40 bg-primary/10 text-primary font-bold",
  P2: "border-border bg-muted text-muted-foreground font-semibold",
  P3: "border-border bg-muted/60 text-muted-foreground/80 font-normal",
};

/**
 * Candidate Panel Component (TASK 1 / Sections 1.6, 3.5)
 *
 * - Reference in mono
 * - Priority badge
 * - Experience, notice period, lead time, special terms
 * - Vendor renders strictly as the word "Hidden" (never an em dash or blank),
 *   with tooltip: "Vendor identity is hidden during evaluation."
 */
export function EvaluationCandidateCard({
  candidateRef,
  priority,
  candidate,
  className,
}: EvaluationCandidateCardProps) {
  return (
    <section
      aria-labelledby="candidate-panel-heading"
      className={cn(
        "bg-card border border-border rounded-xl p-5 space-y-4 shadow-2xs transition-colors",
        className
      )}
    >
      {/* ── Header: Reference in mono & Priority Badge ── */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <h3
          id="candidate-panel-heading"
          className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
        >
          Candidate
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-foreground">
            {candidateRef}
          </span>
          <Badge
            variant="outline"
            className={cn(
              "px-1.5 py-0.5 text-[10px] rounded uppercase tracking-wider",
              PRIORITY_STYLES[priority] || PRIORITY_STYLES.P2
            )}
          >
            {priority}
          </Badge>
        </div>
      </div>

      {/* ── Candidate Details ── */}
      <div className="space-y-2.5 text-xs divide-y divide-border/40">
        <div className="flex items-center justify-between pt-1 first:pt-0">
          <span className="text-muted-foreground flex items-center gap-1.5">
            <User className="size-3 text-muted-foreground/70" />
            Experience
          </span>
          <span className="font-medium text-foreground tabular-nums">
            {`${candidate.experienceYears} years`}
          </span>
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="text-muted-foreground flex items-center gap-1.5">
            <Clock className="size-3 text-muted-foreground/70" />
            Notice period
          </span>
          <span className="font-medium text-foreground">
            {candidate.noticePeriod}
          </span>
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="text-muted-foreground flex items-center gap-1.5">
            <Calendar className="size-3 text-muted-foreground/70" />
            Lead time
          </span>
          <span className="font-medium text-foreground tabular-nums">
            {`${candidate.leadTimeDays} days`}
          </span>
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="text-muted-foreground flex items-center gap-1.5">
            <FileText className="size-3 text-muted-foreground/70" />
            Special terms
          </span>
          <span className="font-medium text-foreground">
            {candidate.specialTerms}
          </span>
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="text-muted-foreground flex items-center gap-1.5">
            <ShieldAlert className="size-3 text-muted-foreground/70" />
            Vendor
          </span>
          {/* TASK 1: Vendor renders strictly as "Hidden", NOT an em dash or blank */}
          <Tooltip>
            <TooltipTrigger asChild>
              <span
                className="font-medium text-muted-foreground italic cursor-help underline decoration-dotted underline-offset-2 hover:text-foreground transition-colors"
                tabIndex={0}
                title="Vendor identity is hidden during evaluation."
              >
                Hidden
              </span>
            </TooltipTrigger>
            <TooltipContent side="top">
              Vendor identity is hidden during evaluation.
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </section>
  );
}
