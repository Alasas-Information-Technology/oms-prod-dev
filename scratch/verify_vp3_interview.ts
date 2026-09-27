import {
  listVendorSubmissions,
  getVendorInterviewProposal,
  selectVendorInterviewSlot,
  requestVendorAlternativeSlots,
  getInterviewPlan,
  CANDIDATES,
  INTERVIEW_PLANS,
  REQUISITIONS,
} from "../src/lib/demo-data";

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${msg}`);
    process.exit(1);
  }
  console.log(`✅ ${msg}`);
}

console.log("=== STARTING VENDOR PORTAL VP3 VERIFICATION ===\n");

// ============================================================================
// 1. TASK 1: /vendor/submissions/history & Server Requirement 3
// ============================================================================
console.log("1. Verifying /vendor/submissions/history...");

const submissions = listVendorSubmissions("ven-falcon");
assert(submissions.length >= 5, `Returns at least 5 submissions for Falcon Tech (got: ${submissions.length})`);

// 1.1 "Interview proposed" rows sort first with a visible badge
const firstSubmission = submissions[0];
assert(
  firstSubmission.vendorStatus === "INTERVIEW_PROPOSED",
  `First row is 'INTERVIEW_PROPOSED' (got: ${firstSubmission.vendorStatus} for ${firstSubmission.candidateRef})`
);
assert(
  firstSubmission.candidateRef === "C-021",
  `First row is C-021 (got: ${firstSubmission.candidateRef} - ${firstSubmission.candidateName})`
);
assert(
  firstSubmission.vendorStatusLabel === "Interview proposed",
  `Status label is 'Interview proposed' (got: ${firstSubmission.vendorStatusLabel})`
);
assert(
  firstSubmission.actionRequired === true,
  "actionRequired flag is true for C-021"
);

// 1.2 Verify exact status vocabulary per 4.5:
const validStatuses = new Set([
  "Submitted",
  "Under review",
  "Shortlisted",
  "Interview proposed",
  "Interview confirmed",
  "Qualified",
  "Not selected",
]);

for (const s of submissions) {
  assert(
    validStatuses.has(s.vendorStatusLabel),
    `Status label '${s.vendorStatusLabel}' is in exact allowed 4.5 vocabulary`
  );
}

// 1.3 Server Requirement 3: Rejection reasons are NEVER shown.
// "Not selected" carries no further detail.
// Grep payload consumed by this page to confirm no rating, comment, or priority field is present.
console.log("\n1.3 Checking Server Requirement 3 (Thin Rejection Boundary)...");
for (const s of submissions) {
  assert(!("rating" in s), `Candidate ${s.candidateRef} payload does NOT contain 'rating'`);
  assert(!("comment" in s), `Candidate ${s.candidateRef} payload does NOT contain 'comment'`);
  assert(!("comments" in s), `Candidate ${s.candidateRef} payload does NOT contain 'comments'`);
  assert(!("priority" in s), `Candidate ${s.candidateRef} payload does NOT contain 'priority'`);
  assert(!("score" in s), `Candidate ${s.candidateRef} payload does NOT contain 'score'`);
  assert(!("rejectionReason" in s), `Candidate ${s.candidateRef} payload does NOT contain 'rejectionReason'`);
  assert(!("rejectionDetails" in s), `Candidate ${s.candidateRef} payload does NOT contain 'rejectionDetails'`);
}

const c040Submission = submissions.find((s) => s.candidateRef === "C-040");
assert(Boolean(c040Submission), "C-040 (rejected candidate on 0161) is present in Falcon Tech submissions");
assert(
  c040Submission!.vendorStatus === "NOT_SELECTED",
  `C-040 status is strictly 'NOT_SELECTED' (got: ${c040Submission!.vendorStatus})`
);
assert(
  c040Submission!.vendorStatusLabel === "Not selected",
  `C-040 status label is 'Not selected' (got: ${c040Submission!.vendorStatusLabel})`
);

// ============================================================================
// 2. TASK 2: /vendor/submissions/[id]/interview & Server Requirement 4
// ============================================================================
console.log("\n2. Verifying /vendor/submissions/[id]/interview...");

const proposal = getVendorInterviewProposal("C-021", "ven-falcon");
assert(Boolean(proposal), "getVendorInterviewProposal returns proposal for C-021");

// 2.1 Server Requirement 4: The interviewer renders ONLY as "The hiring team for {Position}."
// Grep this API response for any interviewer name field - none should be present.
console.log("2.1 Checking Server Requirement 4 (Interviewer Anonymity)...");
assert(
  proposal!.hiringTeam === "The hiring team for Senior Cybersecurity Analyst.",
  `hiringTeam renders strictly as 'The hiring team for Senior Cybersecurity Analyst.' (got: '${proposal!.hiringTeam}')`
);
assert(!("interviewers" in proposal!), "Proposal payload does NOT contain 'interviewers'");
assert(!("interviewerNames" in proposal!), "Proposal payload does NOT contain 'interviewerNames'");
assert(!("interviewerName" in proposal!), "Proposal payload does NOT contain 'interviewerName'");
assert(!("leadInterviewer" in proposal!), "Proposal payload does NOT contain 'leadInterviewer'");

// Verify no raw interviewer name from seed leaked into stringified proposal JSON
const rawPlan = INTERVIEW_PLANS["int-plan-0148-C-021"];
for (const interviewer of rawPlan.interviewers) {
  const jsonStr = JSON.stringify(proposal);
  assert(
    !jsonStr.includes(interviewer.name),
    `JSON payload does NOT leak interviewer name '${interviewer.name}'`
  );
  assert(
    !jsonStr.includes(interviewer.userId),
    `JSON payload does NOT leak interviewer userId '${interviewer.userId}'`
  );
}

// 2.2 Proposed slots visual style data
assert(
  proposal!.proposedSlots.length === 3,
  `Proposal has 3 proposed slots (got: ${proposal!.proposedSlots.length})`
);
for (const slot of proposal!.proposedSlots) {
  assert(Boolean(slot.dateLabel), `Slot has dateLabel (got: ${slot.dateLabel})`);
  assert(Boolean(slot.timeRange), `Slot has timeRange (got: ${slot.timeRange})`);
  assert(slot.timeRange.includes("GST"), `Slot timeRange is in GST (got: ${slot.timeRange})`);
  assert(slot.durationMinutes === 45, `Slot duration is 45 mins (got: ${slot.durationMinutes})`);
}

// 2.3 Deadline severity matches system: amber under 2 days, red under 1
assert(
  proposal!.replyByDate === "2026-09-12",
  `replyByDate is 2026-09-12 (got: ${proposal!.replyByDate})`
);
assert(
  proposal!.urgencySeverity === "amber" || proposal!.urgencySeverity === "red",
  `urgencySeverity is amber or red (got: ${proposal!.urgencySeverity}, daysRemaining: ${proposal!.daysRemaining})`
);

// 2.4 Test alternative slots request with note
console.log("\n2.4 Testing Alternative Slots Request...");
const altResult = requestVendorAlternativeSlots(
  "C-021",
  "Candidate has client audit on 12-14 Sep, available starting 15 Sep mornings.",
  "ven-falcon"
);
assert(altResult.success === true, "requestVendorAlternativeSlots returns success: true");
assert(
  altResult.proposal.status === "ALTERNATIVE_REQUESTED",
  `Proposal status updated to ALTERNATIVE_REQUESTED (got: ${altResult.proposal.status})`
);
assert(
  altResult.proposal.alternativeRequestNote?.includes("audit") === true,
  "alternativeRequestNote is preserved on proposal"
);

// 2.5 Test selecting a slot & confirming
console.log("\n2.5 Testing Slot Selection & Read-only Confirmation...");
const selectedSlotStart = proposal!.proposedSlots[0].start; // 2026-09-12T08:30:00Z
const confirmResult = selectVendorInterviewSlot("C-021", selectedSlotStart, "ven-falcon");

assert(confirmResult.success === true, "selectVendorInterviewSlot returns success: true");
assert(
  confirmResult.proposal.status === "CONFIRMED",
  `Proposal status updated to CONFIRMED (got: ${confirmResult.proposal.status})`
);
assert(
  Boolean(confirmResult.proposal.scheduledSlot),
  "Proposal scheduledSlot is populated"
);
assert(
  confirmResult.proposal.scheduledSlot!.start === selectedSlotStart,
  `Scheduled slot start matches selected slot (got: ${confirmResult.proposal.scheduledSlot!.start})`
);
assert(
  Boolean(confirmResult.proposal.confirmedAt),
  `confirmedAt timestamp is populated (got: ${confirmResult.proposal.confirmedAt})`
);

// Verify candidate status updated
assert(
  CANDIDATES["C-021"].status === "INTERVIEW_SCHEDULED",
  `Candidate C-021 status updated to INTERVIEW_SCHEDULED (got: ${CANDIDATES["C-021"].status})`
);

// Verify updated history
const updatedSubmissions = listVendorSubmissions("ven-falcon");
const updatedC021 = updatedSubmissions.find((s) => s.candidateRef === "C-021");
assert(
  updatedC021!.vendorStatus === "INTERVIEW_CONFIRMED",
  `C-021 submission status in history is now INTERVIEW_CONFIRMED (got: ${updatedC021!.vendorStatus})`
);
assert(
  updatedC021!.vendorStatusLabel === "Interview confirmed",
  `C-021 submission status label is 'Interview confirmed' (got: ${updatedC021!.vendorStatusLabel})`
);
assert(
  Boolean(updatedC021!.confirmedInterviewSlot),
  "C-021 submission history includes confirmedInterviewSlot"
);

// ============================================================================
// 3. TASK 3: Cross-Portal Seed Connection
// ============================================================================
console.log("\n3. Verifying Cross-Portal Connection (TASK 3)...");

// Read from internal query
const internalPlan = getInterviewPlan("OMS-2026-0148", "C-021");
assert(Boolean(internalPlan), "Internal portal getInterviewPlan retrieves C-021 plan");
assert(
  internalPlan!.id === "int-plan-0148-C-021",
  `Internal plan ID is int-plan-0148-C-021 (got: ${internalPlan!.id})`
);
assert(
  internalPlan!.scheduledSlot?.start === selectedSlotStart,
  `Internal plan reflects the exact same agreed slot selected by vendor (${internalPlan!.scheduledSlot?.start})`
);
assert(
  internalPlan!.proposal.slots.length === 3,
  `Same underlying 3 proposed slots exist on both sides (count: ${internalPlan!.proposal.slots.length})`
);

console.log("\n🎉 ALL VP3 CHECKS PASSED PERFECTLY!");
