import {
  listVendorRequisitions,
  getVendorRequisition,
  getVendorRateCards,
  getVendorContracts,
  submitVendorCandidate,
  CANDIDATES,
  CANDIDATES_LIST,
  REQUISITIONS,
} from "../src/lib/demo-data";

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${msg}`);
    process.exit(1);
  }
  console.log(`✅ ${msg}`);
}

console.log("--- STARTING VENDOR PORTAL VP2 VERIFICATION ---\n");

// ----------------------------------------------------------------------------
// 1. TASK 1: Verify listVendorRequisitions
// ----------------------------------------------------------------------------
console.log("1. Verifying /vendor/requisitions scoping & closed windows...");
const reqs = listVendorRequisitions("ven-falcon");
assert(reqs.length >= 4, `listVendorRequisitions returns 4 requirements (got: ${reqs.length})`);

const req141 = reqs.find((r) => r.id === "OMS-2026-0141");
const req161 = reqs.find((r) => r.id === "OMS-2026-0161");
const req148 = reqs.find((r) => r.id === "OMS-2026-0148");
const req119 = reqs.find((r) => r.id === "OMS-2026-0119");

assert(Boolean(req141), "OMS-2026-0141 is present in vendor list");
assert(Boolean(req161), "OMS-2026-0161 is present in vendor list");
assert(Boolean(req148), "OMS-2026-0148 is present in vendor list");
assert(Boolean(req119), "OMS-2026-0119 is present in vendor list");

// Check submission counts (vendor-only, no competitor counts)
assert(req141!.mySubmissionsCount === 0, `0141 submissions by Falcon Tech is 0 (got: ${req141!.mySubmissionsCount})`);
assert(req161!.mySubmissionsCount === 1, `0161 submissions by Falcon Tech is 1 (C-040) (got: ${req161!.mySubmissionsCount})`);
assert(req148!.mySubmissionsCount === 2, `0148 submissions by Falcon Tech is 2 (C-014, C-021) (got: ${req148!.mySubmissionsCount})`);

// Check window open/closed status
assert(req141!.submissionWindow.isOpen === true, "0141 submission window is OPEN");
assert(req161!.submissionWindow.isOpen === true, "0161 submission window is OPEN");
assert(req119!.submissionWindow.isOpen === false, "0119 submission window is CLOSED");
assert(
  Boolean(req119!.submissionWindow.closedReason),
  `0119 closed window includes explicit reason: "${req119!.submissionWindow.closedReason}"`
);

// STRICT BUDGET CONCEALMENT: Confirm no budget fields exist
for (const r of reqs) {
  assert(!("budgetAmount" in r), `${r.id}: budgetAmount is completely omitted`);
  assert(!("allocations" in r), `${r.id}: allocations is completely omitted`);
  assert(!("fundingRoute" in r), `${r.id}: fundingRoute is completely omitted`);
}

// ----------------------------------------------------------------------------
// 2. TASK 2: Verify getVendorRequisition detail (No Budget Leakage)
// ----------------------------------------------------------------------------
console.log("\n2. Verifying /vendor/requisitions/[id] detail & zero budget figures...");
const detail141 = getVendorRequisition("OMS-2026-0141", "ven-falcon");
assert(Boolean(detail141), "getVendorRequisition returns 0141");
assert(detail141!.positionTitle === "Cloud Security Engineer", "0141 title matches");
assert(detail141!.experienceYearsRequired === 5, "0141 requires 5 years experience");
assert(detail141!.responsibilities!.length > 0, "0141 includes responsibilities");
assert(detail141!.requiredSkills.includes("AWS & Azure Security"), "0141 includes required skills");
assert(!("budgetAmount" in (detail141 as any)), "0141 detail strictly omits budgetAmount");
assert(!("allocations" in (detail141 as any)), "0141 detail strictly omits allocations");
assert(!("fundingRoute" in (detail141 as any)), "0141 detail strictly omits fundingRoute");

const unknownReq = getVendorRequisition("UNKNOWN-9999", "ven-falcon");
assert(unknownReq === null, "Unknown requirement returns null (strict 404)");

// ----------------------------------------------------------------------------
// 3. TASK 3 & 4: Cost Entry & Candidate Submission against 0141
// ----------------------------------------------------------------------------
console.log("\n3. Verifying Candidate Submission and Negotiable Rate Resolution against 0141...");

// Rate Card Check: Confirm Falcon Tech has published rate card rc-falcon-001
const rateCards = getVendorRateCards("ven-falcon");
const rcFalcon = rateCards.find((rc) => rc.status === "PUBLISHED");
assert(Boolean(rcFalcon), "Falcon Tech has a PUBLISHED rate card");

const gradeG8 = rcFalcon!.grades.find((g) => g.gradeCode === "G8");
assert(Boolean(gradeG8), "Rate card rc-falcon-001 has grade G8");
assert(gradeG8!.monthlyRate === 3648000, `G8 monthly rate is 3,648,000 fils (AED 36,480.00) (got: ${gradeG8!.monthlyRate})`);

// Submit new candidate using Negotiable mode selecting grade G8
const receipt = submitVendorCandidate({
  requisitionId: "OMS-2026-0141",
  vendorId: "ven-falcon",
  candidate: {
    fullName: "Nasser Al-Kaabi",
    email: "nasser.kaabi@falcontech-candidate.com",
    mobile: "+971 50 999 8877",
    nationality: "UAE",
    residentStatus: "ONSHORE",
    experienceYears: 7,
    noticePeriod: "Immediate",
  },
  cvAttachment: {
    id: "att-cv-nasser",
    name: "Nasser_AlKaabi_Cloud_Security_CV.pdf",
    sizeBytes: 1540000,
  },
  costMode: "NEGOTIABLE",
  rateCardGradeCode: "G8",
  leadTimeDays: 7,
  specialTerms: "Pre-cleared for UAE government security operations.",
});

assert(receipt.success === true, "Candidate submission returned success");
assert(receipt.costMode === "NEGOTIABLE", "Receipt confirms costMode === NEGOTIABLE");
assert(
  receipt.resolvedMonthlyFils === gradeG8!.monthlyRate,
  `Receipt resolved monthly rate from rate card: AED ${receipt.resolvedMonthlyFils / 100} (got: ${receipt.resolvedMonthlyFils})`
);
assert(
  receipt.resolvedAmountFils === gradeG8!.monthlyRate * 12,
  `Receipt resolved annual rate from rate card: AED ${receipt.resolvedAmountFils / 100} (got: ${receipt.resolvedAmountFils})`
);
assert(receipt.batchSubmissionNumber === 1, `Receipt batch submission number is 1 of 10 (got: ${receipt.batchSubmissionNumber})`);

// Verify candidate exists in unified CANDIDATES map
const submittedCandidate = CANDIDATES[receipt.candidateRef];
assert(Boolean(submittedCandidate), `Candidate ${receipt.candidateRef} exists in CANDIDATES`);
assert(submittedCandidate.fullName === "Nasser Al-Kaabi", "Candidate full name matches");
assert(submittedCandidate.vendorId === "ven-falcon", "Candidate vendorId is ven-falcon");
assert(submittedCandidate.status === "SOURCING", "Candidate initial status is SOURCING");
assert(submittedCandidate.expectedAnnualCost === gradeG8!.monthlyRate * 12, "Candidate expectedAnnualCost matches resolved rate");

// Verify mySubmissionsCount for 0141 increased to 1
const updatedReqs = listVendorRequisitions("ven-falcon");
const updatedReq141 = updatedReqs.find((r) => r.id === "OMS-2026-0141");
assert(updatedReq141!.mySubmissionsCount === 1, `0141 submissions count by Falcon Tech incremented to 1 (got: ${updatedReq141!.mySubmissionsCount})`);

// ----------------------------------------------------------------------------
// 4. Batch Limit & Window Enforcement Guard Tests
// ----------------------------------------------------------------------------
console.log("\n4. Verifying submission guards (window closed & batch limits)...");

// Guard 1: Submitting to closed window throws
let windowErrorThrown = false;
try {
  submitVendorCandidate({
    requisitionId: "OMS-2026-0119", // closed requirement
    vendorId: "ven-falcon",
    candidate: {
      fullName: "Test Candidate",
      email: "test@example.com",
      mobile: "+971 50 111 2233",
      nationality: "UAE",
      residentStatus: "ONSHORE",
      experienceYears: 4,
      noticePeriod: "Immediate",
    },
    cvAttachment: { id: "att-test", name: "test.pdf", sizeBytes: 1000 },
    costMode: "FIXED",
    fixedAmount: 25000000,
    leadTimeDays: 14,
  });
} catch (e: any) {
  windowErrorThrown = true;
  assert(e.message.includes("closed"), `Closed window error thrown as expected: "${e.message}"`);
}
assert(windowErrorThrown, "Submitting to closed window rejected with error");

console.log("\n✨ ALL PROMPT VP2 VERIFICATIONS PASSED SUCCESSFULLY!");
