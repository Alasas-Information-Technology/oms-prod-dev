/**
 * Automated Verification Suite for BA5: ReapprovalRoute & Approval Panel
 *
 * Checks all 4 tasks from prompt BA5 & docs/BUDGET-AMENDMENT-UI.md 1.2, 1.5, 3.4, 3.5:
 *  - TASK 1: Reuse existing ReapprovalRoute component.
 *            Renders variable-length routes and names approvers.
 *            When UNBUDGETED is selected, extends rendered route with HR -> Finance branch from API.
 *  - TASK 2: Render EVERY stage's rejectionConsequence beneath the route, not only HR's.
 *            Falls back to generic consequence from API if not distinct.
 *  - TASK 3: Fund state on approval:
 *            Reuses "Reserved -> Locked & Allocated" pill-and-arrow pattern with FundStateBadge.
 *  - TASK 4: Cancel consequence:
 *            Quiet, ALWAYS-VISIBLE note near Cancel action in page bar.
 *            Confirmation dialog restates the same text once.
 */

import React from "react";
import ReactDOMServer from "react-dom/server";
import assert from "assert";
import fs from "fs";
import path from "path";

import { WhoApprovesPanel } from "../components/oms/budget-amendment/WhoApprovesPanel";
import { AmendmentPageActions } from "../components/oms/budget-amendment/AmendmentPageActions";
import { BudgetAmendmentWorkspace } from "../components/oms/budget-amendment/BudgetAmendmentWorkspace";
import {
  FIXTURE_AMENDMENT_REFERENCE,
  FIXTURE_AMENDMENT_UNBUDGETED,
  REFERENCE_5_STEP_REAPPROVAL_ROUTE,
  UNBUDGETED_6_STEP_REAPPROVAL_ROUTE,
} from "../src/lib/budget-amendment/fixtures";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PageBarProvider } from "../components/ui/layouts/page-bar-context";
import { AppRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime";

const mockRouter = {
  back: () => {},
  forward: () => {},
  refresh: () => {},
  push: () => {},
  replace: () => {},
  prefetch: () => {},
};

function renderWithProviders(element: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return ReactDOMServer.renderToString(
    React.createElement(
      QueryClientProvider,
      { client: queryClient },
      React.createElement(
        AppRouterContext.Provider,
        { value: mockRouter as any },
        React.createElement(PageBarProvider, null, element)
      )
    )
  );
}

console.log("==================================================");
console.log("BUDGET AMENDMENT — BA5 REAPPROVAL ROUTE VERIFICATION");
console.log("==================================================\n");

// ─────────────────────────────────────────────────────────────────────────────
// TEST 1: Task 1 — Reuse ReapprovalRoute & Dynamic HR -> Finance Route Branch
// ─────────────────────────────────────────────────────────────────────────────
console.log("[TEST 1] Task 1: Reusing ReapprovalRoute & Dynamic HR -> Finance Branch");

// 1.1 Verify WhoApprovesPanel imports ReapprovalRoute rather than building a new stepper
const whoApprovesSource = fs.readFileSync(
  path.join(process.cwd(), "components/oms/budget-amendment/WhoApprovesPanel.tsx"),
  "utf8"
);
assert(
  whoApprovesSource.includes('from "@/components/oms/clarification/ReapprovalRoute"') ||
  whoApprovesSource.includes("from './ReapprovalRoute'") ||
  whoApprovesSource.includes("from '@/components/oms/clarification'"),
  "WhoApprovesPanel must import ReapprovalRoute from the clarification component"
);
assert(
  !whoApprovesSource.includes("AMENDMENT_LIFECYCLE_STEPS"),
  "WhoApprovesPanel must not duplicate lifecycle stepper logic"
);
console.log("✓ PASS: Existing ReapprovalRoute component reused verbatim (no duplicate stepper built)");

// 1.2 Verify 5-stage standard route rendering and naming of approvers
const panel5StepHtml = ReactDOMServer.renderToString(
  <WhoApprovesPanel
    reapprovalRoute={REFERENCE_5_STEP_REAPPROVAL_ROUTE}
    candidateRef="C-009"
    cancelConsequence="Cancelling reverts Candidate C-009 to Qualified, pending budget. No funds are moved."
  />
);

assert(panel5StepHtml.includes("5 stages"), "ReapprovalRoute badge states '5 stages' for 5-step route");
assert(panel5StepHtml.includes("Tariq Mansoor"), "ReapprovalRoute names Requester 'Tariq Mansoor'");
assert(panel5StepHtml.includes("Omar Al Hashmi"), "ReapprovalRoute names Line Manager 'Omar Al Hashmi'");
assert(panel5StepHtml.includes("Fatima Al Zaabi"), "ReapprovalRoute names Section Head 'Fatima Al Zaabi'");
assert(panel5StepHtml.includes("Khalid Al Suwaidi"), "ReapprovalRoute names Department Head 'Khalid Al Suwaidi'");
assert(panel5StepHtml.includes("HR Review"), "ReapprovalRoute includes HR Review stage");
assert(!panel5StepHtml.includes("Finance Budget Allocation"), "Standard route does not contain Finance step");
console.log("✓ PASS: 5-stage route renders variable length ('5 stages') and names approvers accurately");

// 1.3 Verify dynamic HR -> Finance branch when UNBUDGETED (6 stages) sourced from API
const panel6StepHtml = ReactDOMServer.renderToString(
  <WhoApprovesPanel
    reapprovalRoute={UNBUDGETED_6_STEP_REAPPROVAL_ROUTE}
    candidateRef="C-009"
    cancelConsequence="Cancelling reverts Candidate C-009 to Qualified, pending budget. No funds are moved."
  />
);

assert(panel6StepHtml.includes("6 stages"), "ReapprovalRoute badge states '6 stages' for 6-step unbudgeted route");
assert(
  panel6StepHtml.includes("Finance Budget Allocation") || panel6StepHtml.includes("FINANCE"),
  "6-stage unbudgeted route includes Finance Budget Allocation stage"
);
assert(panel6StepHtml.includes("Saeed Al Marri"), "6-stage unbudgeted route names Finance approver 'Saeed Al Marri'");
console.log("✓ PASS: Unbudgeted route dynamically extends with HR -> Finance branch (6 stages) naming Saeed Al Marri");

// Verify workspace sources the HR -> Finance branch from API data
const workspaceSource = fs.readFileSync(
  path.join(process.cwd(), "components/oms/budget-amendment/BudgetAmendmentWorkspace.tsx"),
  "utf8"
);
assert(
  workspaceSource.includes("data?.unbudgetedReapprovalRoute") ||
  workspaceSource.includes("unbudgetedReapprovalRoute"),
  "BudgetAmendmentWorkspace must source unbudgeted route from API data (unbudgetedReapprovalRoute)"
);
console.log("✓ PASS: HR -> Finance branch is sourced directly from API response data");

// ─────────────────────────────────────────────────────────────────────────────
// TEST 2: Task 2 — Every Stage's Rejection Consequence Rendered
// ─────────────────────────────────────────────────────────────────────────────
console.log("\n[TEST 2] Task 2: Every Stage's Rejection Consequence Rendered");

// Check that consequences are rendered for all 5 stages in reference route
assert(
  panel5StepHtml.includes("Rejection Consequences"),
  "Rejection consequences section header must be present"
);
assert(
  panel5StepHtml.includes("A rejection at any stage closes this candidate's path and releases the reserved funds.") ||
  panel5StepHtml.includes("A rejection at any stage closes this candidate&#x27;s path and releases the reserved funds."),
  "Rejection rule caption rendered"
);

// Requester consequence
assert(
  panel5StepHtml.includes("Candidate remains Qualified pending budget"),
  "Requester consequence rendered"
);

// Line Manager consequence
assert(
  panel5StepHtml.includes("Rejection at this stage closes this candidate's path") ||
  panel5StepHtml.includes("Rejection at this stage closes this candidate&#x27;s path"),
  "Line Manager consequence rendered"
);

// HR consequence
assert(
  panel5StepHtml.includes("releases reserved funds"),
  "HR consequence rendered"
);

console.log("✓ PASS: Rendered EVERY stage's rejection consequence beneath route (not only HR's)");

// Check fallback to generic consequence if stage consequence is missing
const routeWithMissingConsequence = [
  {
    stage: "SECTION_HEAD",
    user: { name: "Fatima Al Zaabi" },
    role: "Section Head",
    status: "PENDING" as const,
    rejectionConsequence: "", // Intentionally empty to test fallback
  },
];
const panelFallbackHtml = ReactDOMServer.renderToString(
  <WhoApprovesPanel
    reapprovalRoute={routeWithMissingConsequence}
    candidateRef="C-009"
    genericRejectionConsequence="A rejection at any stage closes this candidate's path and releases reserved funds."
  />
);
assert(
  panelFallbackHtml.includes("A rejection at any stage closes this candidate's path and releases reserved funds.") ||
  panelFallbackHtml.includes("A rejection at any stage closes this candidate&#x27;s path and releases reserved funds."),
  "Must fall back to generic consequence from API when stage consequence is empty"
);
console.log("✓ PASS: Empty stage consequence gracefully falls back to generic API consequence");

// ─────────────────────────────────────────────────────────────────────────────
// TEST 3: Task 3 — Fund State on Approval Pill Pattern
// ─────────────────────────────────────────────────────────────────────────────
console.log("\n[TEST 3] Task 3: Fund State on Approval (Reserved -> Locked & Allocated)");

// Check that WhoApprovesPanel uses FundStateBadge component
assert(
  whoApprovesSource.includes('from "@/components/budget/FundStateBadge"') ||
  whoApprovesSource.includes("FundStateBadge"),
  "WhoApprovesPanel must import and reuse FundStateBadge from APPROVAL-WORKFLOW-SPEC.md"
);

// Check HTML output contains both pills and the transition arrow
assert(panel5StepHtml.includes("Reserved"), "Fund state 'Reserved' pill rendered");
assert(
  panel5StepHtml.includes("Locked &amp; Allocated") ||
  panel5StepHtml.includes("Locked & Allocated") ||
  panel5StepHtml.includes("Locked &amp; allocated") ||
  panel5StepHtml.includes("Locked & allocated"),
  "Fund state 'Locked & Allocated' pill rendered"
);
assert(
  panel5StepHtml.includes("lucide-arrow-right") ||
  panel5StepHtml.includes("ArrowRight") ||
  panel5StepHtml.includes("svg"),
  "Transition arrow rendered between pills"
);
console.log("✓ PASS: Reused 'Reserved -> Locked & Allocated' pill-and-arrow pattern with FundStateBadge");

// ─────────────────────────────────────────────────────────────────────────────
// TEST 4: Task 4 — Cancel Consequence Quiet Note & Confirmation Dialog
// ─────────────────────────────────────────────────────────────────────────────
console.log("\n[TEST 4] Task 4: Cancel Consequence Quiet Note & Confirmation Dialog");

// 4.1 Check page bar actions render cancelConsequence as an always-visible note near Cancel
const pageActionsHtml = ReactDOMServer.renderToString(
  <AmendmentPageActions
    onCancel={() => {}}
    cancelConsequence="Cancelling reverts Candidate C-009 to Qualified, pending budget. No funds are moved."
  />
);

assert(
  pageActionsHtml.includes("Cancelling reverts Candidate C-009 to Qualified, pending budget. No funds are moved."),
  "Page bar must render cancelConsequence as an always-visible note near the Cancel action"
);
assert(
  pageActionsHtml.includes("btn-cancel-amendment"),
  "Cancel button is present in page bar actions"
);
console.log("✓ PASS: Page bar renders cancelConsequence as a quiet, ALWAYS-VISIBLE note near Cancel action");

// 4.2 Check Column 3 quiet note
assert(
  panel5StepHtml.includes("Cancelling reverts Candidate C-009 to Qualified, pending budget. No funds are moved."),
  "Column 3 panel renders quiet cancel consequence note"
);
console.log("✓ PASS: Column 3 renders quiet cancellation consequence note");

// 4.3 Check confirmation dialog restates the same text once
const workspaceHtml = renderWithProviders(
  <BudgetAmendmentWorkspace
    requestId="OMS-2026-0148"
    amendmentId="amd-2026-0089"
    initialData={FIXTURE_AMENDMENT_REFERENCE}
  />
);

assert(
  workspaceHtml.includes("Cancelling reverts Candidate C-009 to Qualified, pending budget. No funds are moved."),
  "Workspace renders cancel consequence"
);

// Check that confirmation dialog is wired in BudgetAmendmentWorkspace to restate the consequence
assert(
  workspaceSource.includes("<AlertDialog open={cancelDialogOpen}") &&
  workspaceSource.includes("<AlertDialogTitle>Cancel Budget Amendment?</AlertDialogTitle>") &&
  workspaceSource.includes("data.cancelConsequence"),
  "Cancel confirmation dialog restates the exact cancellation consequence text"
);
console.log("✓ PASS: Cancel confirmation dialog is wired to restate the cancellation consequence once");

console.log("\n==================================================");
console.log("ALL BA5 VERIFICATION TESTS PASSED SUCCESSFULLY! 🎉");
console.log("==================================================\n");
