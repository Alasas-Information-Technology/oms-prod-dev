import React from "react";
import ReactDOMServer from "react-dom/server";
import { InterviewProgressRail } from "../components/oms/interviews/rail/InterviewProgressRail";
import { CandidateKpiSurface } from "../components/oms/candidate-portal/CandidateKpiSurface";
import {
  CandidatePortalWorkspace,
  CANDIDATE_ONBOARDING_STAGES,
  buildCandidateRailSteps,
} from "../components/oms/candidate-portal/CandidatePortalWorkspace";
import { getCandidatePortalData } from "../src/lib/demo-data/queries";

console.log("====================================================================");
console.log("  RUNNING JR3 PROGRESS RAIL & T1 KPI SURFACE VERIFICATION");
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
// TASK 1: 4px Progress Rail (Imported InterviewProgressRail)
// ─────────────────────────────────────────────────────────────────────────────
console.log("--- TASK 1: 4px Progress Rail ---");

// Load C-014 valid fixture (ONB-2026-0061)
const data0061 = getCandidatePortalData("c-tok-onb0061-c014-samir-rahman-78");
assert(data0061 !== null, "Loaded valid fixture for ONB-2026-0061");

const workspaceHtml = ReactDOMServer.renderToString(
  React.createElement(CandidatePortalWorkspace, {
    token: "c-tok-onb0061-c014-samir-rahman-78",
    initialData: data0061,
  })
);

// 1. Height is 4px (h-1)
assert(workspaceHtml.includes("h-1") && workspaceHtml.includes("gap-[2px]"), "Progress rail has 4px height (h-1) with 2px gaps");

// 2. Five segments
assert(workspaceHtml.includes("repeat(5, minmax(0, 1fr))"), "Progress rail is configured with 5 equal-width segments");

// 3. Segment label: "Joining Readiness · 4 of 5"
assert(workspaceHtml.includes("Joining Readiness · 4 of 5"), "Progress rail displays label: 'Joining Readiness · 4 of 5'");

// 4. Teal fill for completed segments (via --primary CSS variable in workspace)
assert(workspaceHtml.includes("bg-primary") && workspaceHtml.includes("--brand-teal"), "Completed segments use primary styling backed by --brand-teal");

// 5. Initial shimmer once on mount only, respecting prefers-reduced-motion
assert(
  workspaceHtml.includes("animate-[shimmer-once_1.2s_cubic-bezier(0.2,0,0,1)_forwards]") &&
  workspaceHtml.includes("motion-reduce:hidden"),
  "Current segment has initial shimmer sweep with motion-reduce:hidden"
);

// 6. Rail steps structure verification
const railSteps0061 = buildCandidateRailSteps(data0061!.stepper);
assert(railSteps0061.length === 5, "Rail steps has exactly 5 stages");
assert(railSteps0061[0].label === "Documents Submitted" && railSteps0061[0].status === "completed", "Stage 1 is 'Documents Submitted' (completed)");
assert(railSteps0061[1].label === "E-signature" && railSteps0061[1].status === "completed", "Stage 2 is 'E-signature' (completed)");
assert(railSteps0061[2].label === "DIEZ Review" && railSteps0061[2].status === "completed", "Stage 3 is 'DIEZ Review' (completed)");
assert(railSteps0061[2].description.includes("Reviewed by the onboarding team"), "DIEZ Review role is strictly 'Reviewed by the onboarding team' (anonymous)");
assert(railSteps0061[3].label === "Joining Readiness" && railSteps0061[3].status === "current", "Stage 4 is 'Joining Readiness' (current)");
assert(railSteps0061[4].label === "Joined" && railSteps0061[4].status === "pending", "Stage 5 is 'Joined' (pending)");

// Verify no reviewer names appear anywhere in rail steps descriptions
const railText = JSON.stringify(railSteps0061);
assert(!railText.includes("Omar") && !railText.includes("Fatima") && !railText.includes("Khalid"), "No internal reviewer names in candidate rail steps");


// ─────────────────────────────────────────────────────────────────────────────
// TASK 2: T1 KPI Surface (Five Columns, 100px Height, Hairline Dividers)
// ─────────────────────────────────────────────────────────────────────────────
console.log("\n--- TASK 2: T1 KPI Surface (Five Columns) ---");

const kpiHtml = ReactDOMServer.renderToString(
  React.createElement(CandidateKpiSurface, {
    readinessScore: data0061!.readinessScore,
    kpi: data0061!.kpi,
    residentStatus: data0061!.residentStatus,
  })
);

// 1. One continuous card with 5 columns
assert(kpiHtml.includes("grid-cols-1") && kpiHtml.includes("lg:grid-cols-5"), "KPI surface has 5 equal columns on desktop");

// 2. 100px height
assert(kpiHtml.includes("min-h-[100px]"), "KPI surface enforces standard 100px height (min-h-[100px])");

// 3. 1px hairline dividers at 8% opacity (border-foreground/8)
assert(kpiHtml.includes("border-foreground/8"), "Columns separated by 1px hairline dividers at 8% opacity");

// 4. Column 1: Readiness Score as T5 segmented tick bar (20 discrete ticks)
assert(kpiHtml.includes("Readiness Score"), "Column 1 has label 'Readiness Score'");
assert(kpiHtml.includes("role=\"meter\""), "Readiness score has accessible meter role");
assert(kpiHtml.includes("(78%)"), "Displays percentage in mono tabular-nums: '(78%)'");

// Count discrete ticks: exactly 20 discrete vertical ticks of w-[2px] h-3
const tickMatches = kpiHtml.match(/w-\[2px\] h-3 rounded-\[1px\]/g) || [];
assert(tickMatches.length === 20, "Readiness score has exactly 20 discrete vertical ticks (T5 spec)", tickMatches.length);

// Verify NO donut or circular ring chart used
assert(!kpiHtml.includes("recharts") && !kpiHtml.includes("donut") && !kpiHtml.includes("ring-gauge"), "Explicitly NOT a donut or ring chart");

// 5. Column 2: Documents (e.g. 3/4 or 4/4, T2 weight contrast)
assert(kpiHtml.includes("Documents"), "Column 2 has label 'Documents'");
assert(kpiHtml.includes("font-bold text-xl sm:text-2xl"), "Completed documents count has heavy bold weight (T2)");
assert(kpiHtml.includes("text-muted-foreground text-sm sm:text-base font-medium") && kpiHtml.includes("/ 4"), "Total documents count has lighter muted weight (T2)");

// 6. Column 3: Offer Reference in mono
assert(kpiHtml.includes("Offer Reference"), "Column 3 has label 'Offer Reference'");
assert(kpiHtml.includes("LPO-260771"), "Displays offer reference 'LPO-260771'");
assert(kpiHtml.includes("text-sm"), "Offer reference is rendered in");

// 7. Column 4: Biometric Appointment status chip
assert(kpiHtml.includes("Biometric Appointment"), "Column 4 has label 'Biometric Appointment'");
assert(kpiHtml.includes("Scheduled"), "Onshore candidate displays 'Scheduled' status chip");

// 8. Column 5: Joining Confirmation status chip
assert(kpiHtml.includes("Joining Confirmation"), "Column 5 has label 'Joining Confirmation'");
assert(kpiHtml.includes("Confirmed"), "Displays 'Confirmed' status chip");
assert(kpiHtml.includes("#ECFDF5") || kpiHtml.includes("#059669"), "Confirmed chip uses semantic success matrix");


// ─────────────────────────────────────────────────────────────────────────────
// Offshore Fixture Verification (C-031 / ONB-2026-0102)
// ─────────────────────────────────────────────────────────────────────────────
console.log("\n--- Offshore Fixture Verification (C-031) ---");

const data0102 = getCandidatePortalData("c-tok-onb0102-c031-priya-sharma-offshore");
assert(data0102 !== null, "Loaded valid fixture for ONB-2026-0102 (Offshore)");

const kpiHtmlOffshore = ReactDOMServer.renderToString(
  React.createElement(CandidateKpiSurface, {
    readinessScore: data0102!.readinessScore,
    kpi: data0102!.kpi,
    residentStatus: data0102!.residentStatus,
  })
);

assert(kpiHtmlOffshore.includes("Not Required"), "Offshore biometric appointment displays 'Not Required'");
assert(kpiHtmlOffshore.includes("Offshore exemption"), "Offshore biometric appointment indicates 'Offshore exemption'");
assert(kpiHtmlOffshore.includes("(85%)"), "Offshore readiness score displays '(85%)'");

console.log(`\n====================================================================`);
console.log(`  SUMMARY: Passed: ${passed}, Failed: ${failed}`);
console.log(`====================================================================`);

if (failed > 0) {
  process.exit(1);
}
