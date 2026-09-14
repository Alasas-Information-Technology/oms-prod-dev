"use client";

import * as React from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { CandidateResidentStatus } from "@/src/types/candidate-portal";

interface CandidateStickyPageBarProps {
  onboardingCase: string;             // e.g. "ONB-2026-0061"
  candidateRef: string;               // e.g. "C-014"
  position: string;                   // e.g. "Senior Cybersecurity Analyst"
  expectedJoining: string;            // e.g. "2026-09-01"
  residentStatus?: CandidateResidentStatus;
  readyToConfirm: boolean;
  blockingTasksRemaining: number;
}

/**
 * Formats YYYY-MM-DD into clean British English format: "01 Sep 2026"
 */
const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

function formatExpectedJoiningDate(dateStr: string): string {
  if (!dateStr) return "—";
  try {
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      const year = parts[0];
      const monthIdx = parseInt(parts[1], 10) - 1;
      const day = parts[2].padStart(2, "0");
      if (monthIdx >= 0 && monthIdx < 12) {
        return `${day} ${MONTH_NAMES[monthIdx]} ${year}`;
      }
    }
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      const day = String(d.getUTCDate()).padStart(2, "0");
      const month = MONTH_NAMES[d.getUTCMonth()];
      const year = d.getUTCFullYear();
      return `${day} ${month} ${year}`;
    }
    return dateStr;
  } catch {
    return dateStr;
  }
}

/**
 * Sticky Page Bar for Candidate Joining Readiness (Reference Section 2).
 * Specification: docs/CANDIDATE-JOINING-READINESS.md Task 3 (JR2)
 *
 * Requirements:
 * 1. Breadcrumb-as-title: "Onboarding · ONB-2026-0061" muted
 * 2. Real heading: "Your Joining Readiness"
 * 3. Candidate reference in mono beneath with position
 * 4. Status chip (Ready / Action Needed From You) from semantic matrix
 * 5. Expected joining date in mono tabular-nums
 * 6. NO subtitle.
 */
export function CandidateStickyPageBar({
  onboardingCase,
  candidateRef,
  position,
  expectedJoining,
  readyToConfirm,
  blockingTasksRemaining,
}: CandidateStickyPageBarProps) {
  const isReady = readyToConfirm || blockingTasksRemaining === 0;
  const formattedDate = formatExpectedJoiningDate(expectedJoining);

  return (
    <div
      id="candidate-sticky-page-bar"
      className="sticky top-11 z-20 bg-background/95 backdrop-blur-md border-b border-border/40 py-3.5 px-4 sm:px-6 lg:px-8 transition-colors shadow-2xs"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-6">
        {/* Left Column: Breadcrumb-as-title + Real Heading + Mono Reference & Position */}
        <div className="min-w-0">
          {/* Breadcrumb-as-title: "Onboarding · ONB-2026-0061" muted */}
          <div
            id="candidate-breadcrumb-title"
            className="text-xs text-muted-foreground tracking-tight mb-1"
          >
            {`Onboarding · ${onboardingCase}`}
          </div>

          {/* Real Heading: "Your Joining Readiness" (No subtitle beneath) */}
          <h1
            id="candidate-main-heading"
            className="text-xl sm:text-2xl font-bold tracking-tight text-foreground leading-tight"
          >
            Your Joining Readiness
          </h1>

          {/* Candidate reference in mono beneath with position */}
          <div
            id="candidate-reference-line"
            className="flex items-center gap-2 mt-1 flex-wrap"
          >
            <span className="text-xs font-semibold text-muted-foreground bg-muted/60 dark:bg-muted/40 px-1.5 py-0.5 rounded border border-border/50">
              {candidateRef}
            </span>
            <span className="text-muted-foreground/60 text-xs" aria-hidden="true">
              ·
            </span>
            <span className="text-xs sm:text-sm font-medium text-foreground/80 truncate">
              {position}
            </span>
          </div>
        </div>

        {/* Right Column: Semantic Status Chip + Expected Joining Date */}
        <div className="flex items-center gap-4 sm:gap-6 shrink-0 self-start md:self-center">
          {/* Status Chip (Semantic Matrix: Surface Tint, Border, Text + Icon paired) */}
          {isReady ? (
            <div
              id="candidate-status-chip"
              data-status="READY"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold tracking-tight border bg-[#ECFDF5] dark:bg-[#142924] border-[#059669] dark:border-[#34D399] text-[#065F46] dark:text-[#A7F3D0] shadow-2xs"
              role="status"
              aria-label="Status: Ready"
            >
              <CheckCircle2 className="size-3.5 shrink-0" aria-hidden="true" />
              <span>Ready</span>
            </div>
          ) : (
            <div
              id="candidate-status-chip"
              data-status="ACTION_NEEDED"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold tracking-tight border bg-[#FFFBEB] dark:bg-[#2E2416] border-[#B45309] dark:border-[#FBBF24] text-[#78350F] dark:text-[#FDE68A] shadow-2xs"
              role="status"
              aria-label="Status: Action Needed From You"
            >
              <AlertCircle className="size-3.5 shrink-0" aria-hidden="true" />
              <span>Action Needed From You</span>
            </div>
          )}

          <div className="h-7 w-px bg-border/60 hidden sm:block" aria-hidden="true" />

          {/* Expected Joining Date in mono tabular-nums */}
          <div
            id="candidate-expected-joining"
            className="flex flex-col sm:items-end gap-0.5"
          >
            <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Expected Joining
            </span>
            <span className="text-sm sm:text-base font-bold tabular-nums text-foreground">
              {formattedDate}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
