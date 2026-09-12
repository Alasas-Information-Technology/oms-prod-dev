import React from "react";
import ReactDOMServer from "react-dom/server";
import { VendorSubmissionHistoryWorkspace } from "../components/oms/vendor-portal/VendorSubmissionHistoryWorkspace";
import { VendorInterviewResponseWorkspace } from "../components/oms/vendor-portal/VendorInterviewResponseWorkspace";
import { INTERVIEW_PLANS } from "../src/lib/demo-data";

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${msg}`);
    process.exit(1);
  }
  console.log(`✅ ${msg}`);
}

console.log("=== VERIFYING VP3 REACT COMPONENT RENDERING & DOM GREP ===\n");

// 1. Render VendorSubmissionHistoryWorkspace
console.log("1. Rendering VendorSubmissionHistoryWorkspace...");
const historyHtml = ReactDOMServer.renderToString(
  <VendorSubmissionHistoryWorkspace vendorId="ven-falcon" />
);

assert(historyHtml.includes("Submitted Candidates"), "History page renders title");
assert(historyHtml.includes("Elena Rostova"), "History page renders candidate Elena Rostova");
assert(historyHtml.includes("C-021"), "History page renders C-021 reference");
assert(historyHtml.includes("Interview proposed"), "History page renders 'Interview proposed' status");
assert(historyHtml.includes("Respond to Slots"), "History page renders 'Respond to Slots' button");

// Check Server Requirement 3 in rendered DOM
assert(!historyHtml.toLowerCase().includes("rejectionreason"), "DOM contains no rejectionReason");
assert(!historyHtml.toLowerCase().includes("rejectiondetails"), "DOM contains no rejectionDetails");
assert(!historyHtml.toLowerCase().includes("priority"), "DOM contains no priority");
assert(!historyHtml.toLowerCase().includes("score"), "DOM contains no score");
assert(!historyHtml.toLowerCase().includes("rating"), "DOM contains no rating");

// Check C-040 is rendered as "Not selected"
assert(historyHtml.includes("C-040"), "C-040 is in DOM");
assert(historyHtml.includes("Not selected"), "'Not selected' is in DOM");

console.log("✅ History component rendered cleanly with Server Requirement 3 satisfied.");

// 2. Reset plan to AWAITING_REPLY to test interactive mode
const rawPlan = INTERVIEW_PLANS["int-plan-0148-C-021"];
rawPlan.status = "AWAITING_REPLY";
rawPlan.scheduledSlot = null;
rawPlan.confirmedAt = null;

console.log("\n2. Rendering VendorInterviewResponseWorkspace for C-021 (Interactive Mode)...");
const interviewHtml = ReactDOMServer.renderToString(
  <VendorInterviewResponseWorkspace candidateRef="C-021" vendorId="ven-falcon" />
);

assert(interviewHtml.includes("Interview Response"), "Interview page renders title");
assert(interviewHtml.includes("Elena Rostova"), "Interview page renders candidate name");
assert(interviewHtml.includes("The hiring team for Senior Cybersecurity Analyst."), "Interview page renders exact hiring team text");
assert(interviewHtml.includes("Option 1 of 3"), "Interview page renders proposed slot options");
assert(interviewHtml.includes("Confirm Selected Time Slot"), "Interview page renders confirm button");
assert(interviewHtml.includes("Request Alternative Slots"), "Interview page renders alternative slots trigger");

// Check Server Requirement 4 in rendered DOM
// Ensure NO interviewer names from the seed plan appear anywhere in the rendered HTML
for (const interviewer of rawPlan.interviewers) {
  assert(
    !interviewHtml.includes(interviewer.name),
    `DOM strictly does NOT contain interviewer name '${interviewer.name}'`
  );
  assert(
    !interviewHtml.includes(interviewer.userId),
    `DOM strictly does NOT contain interviewer userId '${interviewer.userId}'`
  );
}

// 3. Test Confirmed Read-Only Mode
console.log("\n3. Rendering VendorInterviewResponseWorkspace for C-021 (Confirmed Mode)...");
rawPlan.status = "SCHEDULED";
rawPlan.scheduledSlot = { start: "2026-09-12T08:30:00Z", durationMinutes: 45 };
rawPlan.confirmedAt = "2026-09-10T12:00:00Z";

const confirmedHtml = ReactDOMServer.renderToString(
  <VendorInterviewResponseWorkspace candidateRef="C-021" vendorId="ven-falcon" />
);

assert(confirmedHtml.includes("Agreed &amp; Confirmed Time") || confirmedHtml.includes("Agreed & Confirmed Time"), "Confirmed mode renders agreed time header");
assert(confirmedHtml.includes("Add to Calendar (.ics)"), "Confirmed mode renders Add to Calendar button");
assert(confirmedHtml.includes("Open Google Calendar"), "Confirmed mode renders Open Google Calendar button");

console.log("✅ Interview component rendered cleanly with Server Requirement 4 satisfied.");
console.log("\n🎉 ALL COMPONENT RENDERING AND DOM GREP TESTS PASSED!");
