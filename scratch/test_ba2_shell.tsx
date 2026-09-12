import React from "react";
import ReactDOMServer from "react-dom/server";
import { AmendmentProgressRail, AMENDMENT_LIFECYCLE_STEPS } from "../components/oms/budget-amendment/AmendmentProgressRail";
import { AmendmentContextBar } from "../components/oms/budget-amendment/AmendmentContextBar";
import { BudgetAmendmentWorkspace } from "../components/oms/budget-amendment/BudgetAmendmentWorkspace";
import {
  FIXTURE_AMENDMENT_REFERENCE,
  FIXTURE_AMENDMENT_DEADLINE_CRITICAL,
  FIXTURE_AMENDMENT_UNBUDGETED,
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

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${msg}`);
    process.exit(1);
  }
  console.log(`✓ PASS: ${msg}`);
}

async function runTests() {
  console.log("==================================================");
  console.log("BUDGET AMENDMENT — BA2 SHELL & VERIFICATION SUITE");
  console.log("==================================================");

  // ─────────────────────────────────────────────────────────────────────────────
  // TASK 2: Progress Rail Verification
  // ─────────────────────────────────────────────────────────────────────────────
  console.log("\n[TEST 1] Task 2: 4px Progress Rail & Lifecycle Popover");

  const railHtml = ReactDOMServer.renderToString(
    React.createElement(AmendmentProgressRail, {
      currentStep: 2,
      totalSteps: 5,
      stepLabel: "Amendment draft",
      defaultOpen: true,
    })
  );

  assert(railHtml.includes("Amendment draft · 2 of 5"), "Rail displays label: 'Amendment draft · 2 of 5'");
  assert(railHtml.includes("h-1"), "Rail has 4px height (h-1)");
  assert(railHtml.includes("grid-template-columns:repeat(5, minmax(0, 1fr))"), "Rail has 5 segments");
  assert(railHtml.includes("aria-label=\"Amendment lifecycle progress: Amendment draft, step 2 of 5"), "Rail has proper accessibility label");

  // Lifecycle steps verification
  assert(AMENDMENT_LIFECYCLE_STEPS.length === 5, "Lifecycle has 5 stages");
  assert(AMENDMENT_LIFECYCLE_STEPS[0].label === "Candidate qualified", "Lifecycle Step 1 is 'Candidate qualified'");
  assert(AMENDMENT_LIFECYCLE_STEPS[0].status === "completed", "Lifecycle Step 1 status is completed");
  assert(AMENDMENT_LIFECYCLE_STEPS[1].label === "Amendment draft", "Lifecycle Step 2 is 'Amendment draft'");
  assert(AMENDMENT_LIFECYCLE_STEPS[1].status === "current", "Lifecycle Step 2 status is current");
  assert(AMENDMENT_LIFECYCLE_STEPS[2].label === "Department approval", "Lifecycle Step 3 is 'Department approval'");
  assert(AMENDMENT_LIFECYCLE_STEPS[2].status === "pending", "Lifecycle Step 3 status is pending");
  assert(AMENDMENT_LIFECYCLE_STEPS[3].label === "HR review", "Lifecycle Step 4 is 'HR review'");
  assert(AMENDMENT_LIFECYCLE_STEPS[3].status === "pending", "Lifecycle Step 4 status is pending");
  assert(AMENDMENT_LIFECYCLE_STEPS[4].label === "Finance review & allocation", "Lifecycle Step 5 is 'Finance review & allocation'");
  assert(AMENDMENT_LIFECYCLE_STEPS[4].status === "pending", "Lifecycle Step 5 status is pending");

  // ─────────────────────────────────────────────────────────────────────────────
  // TASK 3: Lineage Line Beneath Rail
  // ─────────────────────────────────────────────────────────────────────────────
  console.log("\n[TEST 2] Task 3: Lineage Line & Evaluation Link");

  const contextBarHtmlRef = ReactDOMServer.renderToString(
    React.createElement(AmendmentContextBar, {
      requestId: FIXTURE_AMENDMENT_REFERENCE.requestId,
      candidateRef: FIXTURE_AMENDMENT_REFERENCE.candidateRef,
      position: FIXTURE_AMENDMENT_REFERENCE.position,
      triggeredBy: FIXTURE_AMENDMENT_REFERENCE.triggeredBy,
      deadline: FIXTURE_AMENDMENT_REFERENCE.deadline,
    })
  );

  assert(
    contextBarHtmlRef.includes("Triggered by qualifying candidate"),
    "Context bar contains 'Triggered by qualifying candidate'"
  );
  assert(
    contextBarHtmlRef.includes("C-009"),
    "Context bar identifies candidate 'C-009'"
  );
  assert(
    contextBarHtmlRef.includes(
      "/app/candidates/interviews/evaluate/OMS-2026-0148/C-009"
    ),
    "Candidate links back to evaluation URL: /app/candidates/interviews/evaluate/OMS-2026-0148/C-009"
  );
  assert(
    contextBarHtmlRef.includes("Senior Cybersecurity Analyst"),
    "Context bar specifies role 'Senior Cybersecurity Analyst'"
  );
  assert(
    contextBarHtmlRef.includes("12 Aug 2026"),
    "Context bar formats triggered date as '12 Aug 2026'"
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // TASK 4: Deadline Severity Escalation States
  // ─────────────────────────────────────────────────────────────────────────────
  console.log("\n[TEST 3] Task 4: Deadline Severity States (Normal, Warning, Critical)");

  // State 1: Neutral (> 7 days, 24 days in reference fixture)
  assert(
    contextBarHtmlRef.includes("24 days left on the original request"),
    "Normal (>7 days) displays '24 days left on the original request'"
  );
  assert(
    !contextBarHtmlRef.includes("text-destructive"),
    "Normal state does not use destructive text"
  );

  // State 2: Amber (3-7 days, e.g. 5 days)
  const contextBarHtmlWarning = ReactDOMServer.renderToString(
    React.createElement(AmendmentContextBar, {
      requestId: "OMS-2026-0148",
      candidateRef: "C-009",
      position: "Senior Cybersecurity Analyst",
      triggeredBy: FIXTURE_AMENDMENT_REFERENCE.triggeredBy,
      deadline: {
        closesAt: "2026-08-17T00:00:00Z",
        daysRemaining: 5,
        severity: "WARNING",
      },
    })
  );

  assert(
    contextBarHtmlWarning.includes("5 days left on the original request"),
    "Warning (3-7 days) displays '5 days left on the original request'"
  );
  assert(
    contextBarHtmlWarning.includes("Request and candidate will close automatically"),
    "Warning state states 'Request and candidate will close automatically'"
  );
  assert(
    contextBarHtmlWarning.includes("text-amber-800") || contextBarHtmlWarning.includes("text-amber-600"),
    "Warning state uses amber severity colors"
  );

  // State 3: Red (< 3 days, Fixture d: 2 days critical)
  const contextBarHtmlCritical = ReactDOMServer.renderToString(
    React.createElement(AmendmentContextBar, {
      requestId: FIXTURE_AMENDMENT_DEADLINE_CRITICAL.requestId,
      candidateRef: FIXTURE_AMENDMENT_DEADLINE_CRITICAL.candidateRef,
      position: FIXTURE_AMENDMENT_DEADLINE_CRITICAL.position,
      triggeredBy: FIXTURE_AMENDMENT_DEADLINE_CRITICAL.triggeredBy,
      deadline: FIXTURE_AMENDMENT_DEADLINE_CRITICAL.deadline,
    })
  );

  assert(
    contextBarHtmlCritical.includes("2 days left on the original request"),
    "Critical fixture (d) displays '2 days left on the original request'"
  );
  assert(
    contextBarHtmlCritical.includes("Request and candidate will close automatically"),
    "Critical state warns 'Request and candidate will close automatically'"
  );
  assert(
    contextBarHtmlCritical.includes("text-destructive"),
    "Critical state uses red text-destructive"
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // TASK 1 & TASK 5: Workspace Shell & Layout Grid
  // ─────────────────────────────────────────────────────────────────────────────
  console.log("\n[TEST 4] Task 1 & 5: Shell Actions & Responsive 3-Column Layout");

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const workspaceHtml = ReactDOMServer.renderToString(
    React.createElement(
      QueryClientProvider,
      { client: queryClient },
      React.createElement(
        AppRouterContext.Provider,
        { value: mockRouter as any },
        React.createElement(
          PageBarProvider,
          null,
          React.createElement(BudgetAmendmentWorkspace, {
            requestId: "OMS-2026-0148",
            amendmentId: "amd-2026-0089",
            initialData: FIXTURE_AMENDMENT_REFERENCE,
          })
        )
      )
    )
  );

  // Shell actions
  assert(workspaceHtml.includes("Cancel"), "Workspace renders Cancel action");
  assert(workspaceHtml.includes("text-destructive"), "Cancel action uses danger text (text-destructive)");
  assert(workspaceHtml.includes("Save draft"), "Workspace renders Save draft action");
  assert(workspaceHtml.includes("Submit"), "Workspace renders Submit action");

  // Quiet cancel note & dialog
  assert(
    workspaceHtml.includes("Cancelling reverts Candidate C-009 to Qualified, pending budget. No funds are moved."),
    "Cancel consequence is clearly stated: 'Cancelling reverts Candidate C-009 to Qualified...'"
  );

  // Layout check per TASK 5:
  // Grid 320px 1fr 320px, 24px gap
  assert(
    workspaceHtml.includes("xl:grid-cols-[320px_1fr_320px]"),
    "Grid defines 320px 1fr 320px on xl screens (>= 1280px)"
  );
  assert(
    workspaceHtml.includes("gap-6"),
    "Grid defines 24px gap (gap-6)"
  );

  // Below 1280px: right column stacks
  assert(
    workspaceHtml.includes("lg:col-span-2 lg:row-start-3"),
    "Right column stacks below on < 1280px (lg:col-span-2 lg:row-start-3)"
  );

  // Below 1024px: single column with funding route last
  assert(
    workspaceHtml.includes("order-4"),
    "Funding route panel has order-4 (rendered last below 1024px)"
  );
  assert(
    workspaceHtml.includes("order-1"),
    "Why this is needed panel has order-1"
  );
  assert(
    workspaceHtml.includes("order-2"),
    "Revised budget position panel has order-2"
  );
  assert(
    workspaceHtml.includes("order-3"),
    "Approval panel has order-3 (before funding route on mobile)"
  );

  // Audit retention note
  assert(
    workspaceHtml.includes("permanently retained for audit compliance"),
    "Audit footer retention note rendered"
  );

  console.log("\n==================================================");
  console.log("ALL BA2 VERIFICATION TESTS PASSED SUCCESSFULLY! 🎉");
  console.log("==================================================");
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
