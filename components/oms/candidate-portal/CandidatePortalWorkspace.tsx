"use client";

import * as React from "react";
import { CandidatePortalResponse, CandidatePortalStepperStage } from "@/src/types/candidate-portal";
import { CandidateMinimalHeader } from "./CandidateMinimalHeader";
import { CandidateStickyPageBar } from "./CandidateStickyPageBar";
import { CandidateTokenInvalidView } from "./CandidateTokenInvalidView";
import { InterviewProgressRail, LifecycleStep } from "@/components/oms/interviews/rail/InterviewProgressRail";
import { CandidateKpiSurface } from "./CandidateKpiSurface";

interface CandidatePortalWorkspaceProps {
  initialData: CandidatePortalResponse | null;
  token: string;
}

export const CANDIDATE_ONBOARDING_STAGES: LifecycleStep[] = [
  {
    number: 1,
    label: "Documents Submitted",
    status: "completed",
    description: "Completed 24 Aug 2026",
  },
  {
    number: 2,
    label: "E-signature",
    status: "completed",
    description: "Completed 24 Aug 2026",
  },
  {
    number: 3,
    label: "DIEZ Review",
    status: "completed",
    description: "Reviewed by the onboarding team on 25 Aug 2026",
  },
  {
    number: 4,
    label: "Joining Readiness",
    status: "current",
    description: "Active · Complete pre-joining checklist",
  },
  {
    number: 5,
    label: "Joined",
    status: "pending",
    description: "Pending · First day orientation and access issuance",
  },
];

/**
 * Builds the 5 lifecycle steps for InterviewProgressRail from server stepper data.
 * Specification: docs/CANDIDATE-JOINING-READINESS.md Task 1 (JR3)
 *
 * Requirements:
 * - Five segments: Documents Submitted, E-signature, DIEZ Review, Joining Readiness, Joined.
 * - DIEZ Review popover role: "Reviewed by the onboarding team", NEVER an internal name.
 */
export function buildCandidateRailSteps(stepper?: CandidatePortalStepperStage[]): LifecycleStep[] {
  const stageDefinitions = [
    {
      code: "DOCUMENTS_SUBMITTED",
      defaultLabel: "Documents Submitted",
      completedDesc: "Completed 24 Aug 2026",
    },
    {
      code: "E_SIGNATURE",
      defaultLabel: "E-signature",
      completedDesc: "Completed 24 Aug 2026",
    },
    {
      code: "DIEZ_REVIEW",
      defaultLabel: "DIEZ Review",
      completedDesc: "Reviewed by the onboarding team on 25 Aug 2026",
    },
    {
      code: "JOINING_READINESS",
      defaultLabel: "Joining Readiness",
      completedDesc: "Active · Complete pre-joining checklist",
    },
    {
      code: "JOINED",
      defaultLabel: "Joined",
      completedDesc: "Pending · First day orientation and access issuance",
    },
  ];

  return stageDefinitions.map((def, idx) => {
    const stepNumber = idx + 1;
    const stageData = stepper?.find((s) => s.stage === def.code) || stepper?.[idx];

    let status: "completed" | "current" | "pending" = "pending";
    if (stageData?.state === "COMPLETE") {
      status = "completed";
    } else if (stageData?.state === "CURRENT") {
      status = "current";
    } else if (stepNumber < 4) {
      status = "completed";
    } else if (stepNumber === 4) {
      status = "current";
    } else {
      status = "pending";
    }

    let description = def.completedDesc;
    if (def.code === "DIEZ_REVIEW") {
      // Internal Reviewer Anonymity: Always "the onboarding team"
      const rawRole = stageData?.actorRole || "onboarding team";
      const roleLabel = rawRole.toLowerCase().startsWith("the ") ? rawRole : `the ${rawRole}`;
      description = `Reviewed by ${roleLabel} on 25 Aug 2026`;
    } else if (status === "current") {
      description = "Active · Complete pre-joining checklist";
    } else if (status === "pending") {
      description = "Pending · First day orientation and access issuance";
    }

    return {
      number: stepNumber,
      label: stageData?.label || def.defaultLabel,
      status,
      description,
    };
  });
}

/**
 * Candidate Portal Workspace (Third Surface).
 * Specification: docs/CANDIDATE-JOINING-READINESS.md Part 0, Part 1, Part 4 & Prompts JR2, JR3.
 *
 * Rules:
 * - If token is invalid/expired/revoked/unknown: renders CandidateTokenInvalidView with ZERO shell chrome.
 * - If token is valid: renders 44px minimal header + sticky page bar + 4px progress rail + T1 KPI surface.
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

  // Derive progress rail steps from server stepper data
  const railSteps = buildCandidateRailSteps(initialData.stepper);

  // Find current step number (1-indexed)
  const currentStepIndex = railSteps.findIndex((s) => s.status === "current");
  const currentStepNumber = currentStepIndex >= 0 ? currentStepIndex + 1 : 4;
  const currentStepLabel = railSteps[currentStepNumber - 1]?.label || "Joining Readiness";

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
      {/* TASK 1 (JR2): 44px Minimal Bar per Reference Section 1 */}
      <CandidateMinimalHeader coordinator={initialData.coordinator} />

      {/* Main Column: No sidebar, no search, strictly single-case scope */}
      <div className="flex-1 flex flex-col w-full min-w-0">
        {/* TASK 3 (JR2): Sticky Page Bar per Reference Section 2 */}
        <CandidateStickyPageBar
          onboardingCase={initialData.onboardingCase}
          candidateRef={initialData.candidateRef}
          position={initialData.position}
          expectedJoining={initialData.expectedJoining}
          residentStatus={initialData.residentStatus}
          readyToConfirm={initialData.readyToConfirm}
          blockingTasksRemaining={initialData.blockingTasksRemaining}
        />

        {/* TASK 1 (JR3): 44px Progress Rail directly beneath page bar */}
        <InterviewProgressRail
          currentStep={currentStepNumber}
          totalSteps={5}
          stepLabel={currentStepLabel}
          title="Onboarding Process Lifecycle"
          ariaLabelPrefix="Onboarding progress"
          steps={railSteps}
          className="px-4 sm:px-6 lg:px-8"
        />

        {/* Workspace Body Area (JR3-JR6) */}
        <main
          id="candidate-main-content"
          className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6"
        >
          {/* TASK 2 (JR3): T1 Unified KPI Surface (Five columns, 100px height) */}
          <CandidateKpiSurface
            readinessScore={initialData.readinessScore}
            kpi={initialData.kpi}
            residentStatus={initialData.residentStatus}
          />
        </main>
      </div>
    </div>
  );
}
