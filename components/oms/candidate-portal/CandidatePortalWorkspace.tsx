"use client";

import * as React from "react";
import { CandidatePortalResponse } from "@/src/types/candidate-portal";
import { CandidateMinimalHeader } from "./CandidateMinimalHeader";
import { CandidateStickyPageBar } from "./CandidateStickyPageBar";
import { CandidateTokenInvalidView } from "./CandidateTokenInvalidView";

interface CandidatePortalWorkspaceProps {
  initialData: CandidatePortalResponse | null;
  token: string;
}

/**
 * Candidate Portal Workspace (Third Surface).
 * Specification: docs/CANDIDATE-JOINING-READINESS.md Part 0, Part 1, Part 4 & Prompts JR2.
 *
 * Rules:
 * - If token is invalid/expired/revoked/unknown: renders CandidateTokenInvalidView with ZERO shell chrome.
 * - If token is valid: renders 44px minimal header + sticky page bar + teal theme styling.
 * - No sidebar, no search, no cross-case navigation.
 */
export function CandidatePortalWorkspace({
  initialData,
  token,
}: CandidatePortalWorkspaceProps) {
  // If data is absent or invalid, render the identical full-page error view with NO shell chrome
  if (!initialData || !initialData.valid) {
    return <CandidateTokenInvalidView />;
  }

  return (
    <div
      id="candidate-portal-root"
      className="min-h-screen flex flex-col bg-background text-foreground transition-colors selection:bg-[var(--brand-teal,#0D9488)]/20 selection:text-teal-900 dark:selection:text-teal-200"
      style={
        {
          "--primary": "var(--brand-teal, #0D9488)",
          "--primary-foreground": "#FFFFFF",
          "--ring": "var(--brand-teal, #0D9488)",
        } as React.CSSProperties
      }
    >
      {/* TASK 1: 44px Minimal Bar per Reference Section 1 */}
      <CandidateMinimalHeader coordinator={initialData.coordinator} />

      {/* Main Column: No sidebar, no search, strictly single-case scope */}
      <div className="flex-1 flex flex-col w-full min-w-0">
        {/* TASK 3: Sticky Page Bar per Reference Section 2 */}
        <CandidateStickyPageBar
          onboardingCase={initialData.onboardingCase}
          candidateRef={initialData.candidateRef}
          position={initialData.position}
          expectedJoining={initialData.expectedJoining}
          residentStatus={initialData.residentStatus}
          readyToConfirm={initialData.readyToConfirm}
          blockingTasksRemaining={initialData.blockingTasksRemaining}
        />

        {/* Workspace Body Area (Placeholder for JR3-JR6) */}
        <main
          id="candidate-main-content"
          className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6"
        >
          {/* Subtle onboarding context notice */}
          <div className="p-4 rounded-xl bg-card border border-border/60 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--brand-teal,#0D9488)] block">
                {initialData.residentStatus === "ONSHORE" ? "Onshore Joining Workflow" : "Offshore Remote Workflow"}
              </span>
              <p className="text-sm text-muted-foreground">
                Review and complete your required pre-joining tasks below. Once all tasks are complete, you can confirm your readiness to join.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono bg-muted/60 dark:bg-muted/30 px-3 py-1.5 rounded-lg border border-border/50 shrink-0 self-start sm:self-center">
              <span className="text-muted-foreground">Readiness:</span>
              <span className="font-bold text-[var(--brand-teal,#0D9488)] tabular-nums">{initialData.readinessScore}%</span>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
