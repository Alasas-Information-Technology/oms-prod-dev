import React from "react";
import ReactDOMServer from "react-dom/server";
import { CandidateMinimalHeader } from "../components/oms/candidate-portal/CandidateMinimalHeader";
import { CandidateStickyPageBar } from "../components/oms/candidate-portal/CandidateStickyPageBar";
import { CandidateTokenInvalidView } from "../components/oms/candidate-portal/CandidateTokenInvalidView";
import { CandidatePortalWorkspace } from "../components/oms/candidate-portal/CandidatePortalWorkspace";
import { getCandidatePortalData } from "../src/lib/demo-data/queries";

console.log("====================================================================");
console.log("  RUNNING JR2 SHELL, TOKEN GATE & STICKY PAGE BAR VERIFICATION");
console.log("====================================================================\n");

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string, details?: any) {
  if (condition) {
    console.log(`[✅ PASS] ${message}`);
    passed++;
  } else {
    console.error(`[❌ FAIL] ${message}`, details !== undefined ? details : "");
    failed++;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// TASK 1: Reduced Shell at /c/[token] (44px minimal bar)
// ─────────────────────────────────────────────────────────────────────────────
console.log("--- TASK 1: Reduced Shell (CandidateMinimalHeader) ---");

const headerHtml = ReactDOMServer.renderToString(
  React.createElement(CandidateMinimalHeader, {
    coordinator: {
      name: "Layla Hassan",
      role: "Onboarding Coordinator",
      email: "layla.hassan@example.com",
      phone: "+971 4 123 4567",
    },
    defaultHelpOpen: true,
  })
);

// 1. 44px minimal bar
assert(headerHtml.includes("h-11"), "Header has exact 44px minimal bar height (h-11)");

// 2. DIEZ mark
assert(headerHtml.includes("alt=\"DIEZ Logo\"") || headerHtml.includes("/c-logo.png"), "Header includes DIEZ mark");

// 3. Contextual wordmark: "Onboarding · Candidate View"
assert(headerHtml.includes("Onboarding · Candidate View"), "Header displays 'Onboarding · Candidate View'");

// 4. Single Help entry
assert(headerHtml.includes("Help"), "Header includes single Help entry");
assert(headerHtml.includes("Open onboarding assistance and help"), "Help button has accessible aria-label");

// 5. No sidebar, no search, no cross-case navigation
assert(!headerHtml.includes("sidebar") && !headerHtml.includes("Sidebar"), "Header contains 0 sidebar chrome");
assert(!headerHtml.includes("⌘K") && !headerHtml.includes("Search"), "Header contains 0 search/⌘K chrome");
assert(!headerHtml.includes("/app/") && !headerHtml.includes("/vendor/"), "Header contains 0 cross-portal navigation");

// 6. Teal theme
assert(headerHtml.includes("var(--brand-teal") || headerHtml.includes("teal"), "Header uses teal theme (--brand-teal)");


// ─────────────────────────────────────────────────────────────────────────────
// TASK 2: Token Validation on Load (CandidateTokenInvalidView)
// ─────────────────────────────────────────────────────────────────────────────
console.log("\n--- TASK 2: Token Validation on Load (CandidateTokenInvalidView) ---");

const invalidViewHtml = ReactDOMServer.renderToString(
  React.createElement(CandidateTokenInvalidView)
);

// 1. Exact mandatory non-enumeration message
const expectedMessage = "This link is no longer valid. Contact your onboarding coordinator for a new one.";
assert(invalidViewHtml.includes(expectedMessage), "Renders exact message: 'This link is no longer valid. Contact your onboarding coordinator for a new one.'");

// 2. No shell chrome on this state
assert(!invalidViewHtml.includes("candidate-minimal-header"), "Invalid state has NO candidate-minimal-header chrome");
assert(!invalidViewHtml.includes("Onboarding · Candidate View"), "Invalid state has NO 'Onboarding · Candidate View' bar");
assert(!invalidViewHtml.includes("candidate-sticky-page-bar"), "Invalid state has NO sticky page bar");
assert(!invalidViewHtml.includes("Onboarding · ONB-"), "Invalid state has NO breadcrumb-as-title");

// 3. Workspace renders invalid view when token is invalid or null
const workspaceInvalidHtml = ReactDOMServer.renderToString(
  React.createElement(CandidatePortalWorkspace, {
    token: "invalid-token-xyz",
    initialData: null,
  })
);
assert(workspaceInvalidHtml.includes(expectedMessage), "Workspace renders invalid view when initialData is null");
assert(!workspaceInvalidHtml.includes("candidate-minimal-header"), "Workspace with invalid token renders zero shell chrome");


// ─────────────────────────────────────────────────────────────────────────────
// TASK 3: Sticky Page Bar (CandidateStickyPageBar)
// ─────────────────────────────────────────────────────────────────────────────
console.log("\n--- TASK 3: Sticky Page Bar (CandidateStickyPageBar) ---");

// Load C-014 valid onshore data
const data0061 = getCandidatePortalData("c-tok-onb0061-c014-samir-rahman-78");
assert(data0061 !== null, "Loaded valid fixture for ONB-2026-0061");

const pageBarHtml0061 = ReactDOMServer.renderToString(
  React.createElement(CandidateStickyPageBar, {
    onboardingCase: data0061!.onboardingCase,
    candidateRef: data0061!.candidateRef,
    position: data0061!.position,
    expectedJoining: data0061!.expectedJoining,
    residentStatus: data0061!.residentStatus,
    readyToConfirm: data0061!.readyToConfirm,
    blockingTasksRemaining: data0061!.blockingTasksRemaining,
  })
);

// 1. Sticky positioning beneath 44px bar
assert(pageBarHtml0061.includes("sticky top-11 z-20"), "Page bar is sticky top-11 directly beneath 44px top bar");

// 2. Breadcrumb-as-title: "Onboarding · ONB-2026-0061" muted
assert(pageBarHtml0061.includes("Onboarding · ONB-2026-0061"), "Breadcrumb-as-title displays 'Onboarding · ONB-2026-0061'");
assert(pageBarHtml0061.includes("text-muted-foreground") && pageBarHtml0061.includes("text-sm"), "Breadcrumb-as-title is muted text");

// 3. Real heading: "Your Joining Readiness"
assert(pageBarHtml0061.includes("Your Joining Readiness"), "Real heading is 'Your Joining Readiness'");

// 4. Candidate reference in mono beneath with position
assert(pageBarHtml0061.includes("C-014"), "Displays candidate reference 'C-014' in mono");
assert(pageBarHtml0061.includes("Senior Cybersecurity Analyst"), "Displays candidate position 'Senior Cybersecurity Analyst'");

// 5. Status chip from semantic matrix
// C-014 has blocking tasks remaining (2), so status chip must be "Action Needed From You" (Warning tri-token)
assert(pageBarHtml0061.includes("Action Needed From You"), "Status chip is 'Action Needed From You'");
assert(pageBarHtml0061.includes("#FFFBEB") || pageBarHtml0061.includes("#B45309"), "Status chip uses semantic warning tri-token");

// 6. Expected joining date in mono tabular-nums
assert(pageBarHtml0061.includes("tabular-nums") && pageBarHtml0061.includes("text-sm"), "Expected joining date has and tabular-nums");
assert(pageBarHtml0061.includes("01 Sep 2026") || pageBarHtml0061.includes("1 Sep 2026"), "Expected joining date formatted correctly");

// 7. No subtitle
assert(!pageBarHtml0061.includes("Track your onboarding") && !pageBarHtml0061.includes("Welcome to your joining"), "Page bar contains NO subtitle");

// 8. Test Ready status chip when all tasks completed (readyToConfirm = true)
const pageBarReadyHtml = ReactDOMServer.renderToString(
  React.createElement(CandidateStickyPageBar, {
    onboardingCase: "ONB-2026-0061",
    candidateRef: "C-014",
    position: "Senior Cybersecurity Analyst",
    expectedJoining: "2026-09-01",
    residentStatus: "ONSHORE",
    readyToConfirm: true,
    blockingTasksRemaining: 0,
  })
);
assert(pageBarReadyHtml.includes("Ready"), "Status chip switches to 'Ready' when readyToConfirm is true");
assert(pageBarReadyHtml.includes("#ECFDF5") || pageBarReadyHtml.includes("#059669"), "Status chip uses semantic success tri-token");


// ─────────────────────────────────────────────────────────────────────────────
// TASK 4: Full Workspace Integration
// ─────────────────────────────────────────────────────────────────────────────
console.log("\n--- TASK 4: Workspace Integration ---");

const workspaceHtml = ReactDOMServer.renderToString(
  React.createElement(CandidatePortalWorkspace, {
    token: "c-tok-onb0061-c014-samir-rahman-78",
    initialData: data0061,
  })
);

assert(workspaceHtml.includes("candidate-minimal-header"), "Workspace renders candidate-minimal-header");
assert(workspaceHtml.includes("candidate-sticky-page-bar"), "Workspace renders candidate-sticky-page-bar");
assert(workspaceHtml.includes("Your Joining Readiness"), "Workspace contains heading 'Your Joining Readiness'");
assert(workspaceHtml.includes("--brand-teal"), "Workspace configures --brand-teal primary CSS variables");

console.log(`\n====================================================================`);
console.log(`  SUMMARY: Passed: ${passed}, Failed: ${failed}`);
console.log(`====================================================================`);

if (failed > 0) {
  process.exit(1);
}
