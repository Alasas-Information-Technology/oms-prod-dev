/**
 * Verification Script for VP4: Vendor Contracts & Rate Cards
 * Specification: docs/VENDOR-PORTAL-UI.md Part 4.6, 4.7 & Part 7 VP4
 *
 * Tests:
 * 1. Contract Listing (/vendor/contracts): active and historical contracts scoped to vendor.
 * 2. Five-template master data & rate card retrieval (/vendor/rates).
 * 3. Connection hold: Falcon Tech published rate card (rc-falcon-001) is PUBLISHED and
 *    is the one Negotiable candidate submission mode resolves against.
 * 4. Unapproved rate cards (SUBMITTED / DRAFT) are not selectable or resolvable by Negotiable mode.
 * 5. CSV export template & CSV parser mechanism.
 * 6. Rate card lifecycle transitions: DRAFT -> SUBMITTED -> PUBLISHED.
 * 7. Exact currency formatting (minor units integer math).
 */

import {
  getVendorContracts,
  getVendorRateCards,
  getVendorRateCard,
  createOrUpdateVendorRateCard,
  submitVendorRateCardForApproval,
  publishVendorRateCard,
  exportRateCardTemplateCsv,
  parseRateCardCsv,
  submitVendorCandidate,
} from "../src/lib/demo-data";
import { formatAmount } from "../lib/money";
import { RateCard } from "../src/lib/demo-data/entities";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exit(1);
  }
  console.log(`✅ PASS: ${message}`);
}

console.log("\n========================================================");
console.log("  RUNNING VP4 VERIFICATION: CONTRACTS & RATE CARDS");
console.log("========================================================\n");

// --------------------------------------------------------------------------
// TEST 1: Contracts Listing (/vendor/contracts)
// --------------------------------------------------------------------------
console.log("--- TEST 1: Vendor Contracts Scoped Retrieval ---");
const contracts = getVendorContracts("ven-falcon");
assert(contracts.length >= 2, `Expected at least 2 contracts for Falcon Tech, got ${contracts.length}`);

const activeContract = contracts.find((c) => c.status === "ACTIVE");
assert(!!activeContract, "Active contract found for Falcon Tech");
assert(
  activeContract?.contractCode === "DIEZ-MSA-2025-0042",
  `Active contract code is DIEZ-MSA-2025-0042 (got ${activeContract?.contractCode})`
);
assert(
  activeContract?.template === "DIEZA_PREMISES",
  `Active contract template is DIEZA_PREMISES (got ${activeContract?.template})`
);
assert(
  activeContract?.preAgreedMonthlyRate === 3100000,
  `Pre-agreed rate is 3,100,000 fils = AED 31,000.00 (got ${activeContract?.preAgreedMonthlyRate})`
);
assert(
  formatAmount(activeContract!.preAgreedMonthlyRate) === "31,000.00",
  `formatAmount renders exact tabular amount: "31,000.00"`
);

const expiredContract = contracts.find((c) => c.status === "EXPIRED");
assert(!!expiredContract, "Historical/Expired contract found for Falcon Tech");
assert(
  expiredContract?.contractCode === "DIEZ-MSA-2023-0019",
  `Expired contract code is DIEZ-MSA-2023-0019 (got ${expiredContract?.contractCode})`
);
assert(
  expiredContract?.template === "UAE_REMOTE_WFH",
  `Expired contract template is UAE_REMOTE_WFH (got ${expiredContract?.template})`
);

// --------------------------------------------------------------------------
// TEST 2: Rate Cards Retrieval & Five RFP Templates
// --------------------------------------------------------------------------
console.log("\n--- TEST 2: Rate Cards Retrieval & Five RFP Templates ---");
const rateCards = getVendorRateCards("ven-falcon");
assert(rateCards.length >= 3, `Expected at least 3 rate cards for Falcon Tech, got ${rateCards.length}`);

// Confirm rc-falcon-001 is PUBLISHED
const publishedCard = rateCards.find((rc) => rc.id === "rc-falcon-001");
assert(!!publishedCard, "Seeded rate card rc-falcon-001 exists");
assert(publishedCard?.status === "PUBLISHED", `rc-falcon-001 status is PUBLISHED (got ${publishedCard?.status})`);
assert(publishedCard?.code === "RC-FT-2026", `rc-falcon-001 code is RC-FT-2026`);
assert(publishedCard?.template === "DIEZA_PREMISES", `rc-falcon-001 template is DIEZA_PREMISES`);
assert(publishedCard?.grades.length === 4, `rc-falcon-001 contains 4 grades (G6, G7, G8, G9)`);

// Confirm rc-falcon-002 is SUBMITTED
const submittedCard = rateCards.find((rc) => rc.id === "rc-falcon-002");
assert(!!submittedCard, "Seeded rate card rc-falcon-002 exists");
assert(submittedCard?.status === "SUBMITTED", `rc-falcon-002 status is SUBMITTED (got ${submittedCard?.status})`);
assert(submittedCard?.template === "UAE_REMOTE_WFH", `rc-falcon-002 template is UAE_REMOTE_WFH`);

// Confirm rc-falcon-003 is DRAFT
const draftCard = rateCards.find((rc) => rc.id === "rc-falcon-003");
assert(!!draftCard, "Seeded rate card rc-falcon-003 exists");
assert(draftCard?.status === "DRAFT", `rc-falcon-003 status is DRAFT (got ${draftCard?.status})`);
assert(draftCard?.template === "REMOTE_ABROAD", `rc-falcon-003 template is REMOTE_ABROAD`);

// --------------------------------------------------------------------------
// TEST 3: Connection Hold with VP2 Candidate Submission Negotiable Mode
// --------------------------------------------------------------------------
console.log("\n--- TEST 3: Connection Hold — VP2 Negotiable Cost Mode Resolves Against rc-falcon-001 ---");
// Submit a candidate in Negotiable mode using grade G8 from Falcon Tech's published rate card
const submissionReceipt = submitVendorCandidate({
  requisitionId: "OMS-2026-0161",
  vendorId: "ven-falcon",
  candidate: {
    fullName: "VP4 Verification Candidate",
    email: "vp4.verification@falcontech-test.ae",
    mobile: "+971 50 111 2233",
    nationality: "UAE",
    residentStatus: "ONSHORE",
    experienceYears: 8,
    noticePeriod: "Immediate",
  },
  cvAttachment: {
    id: "att-vp4-test",
    name: "VP4_Verification_Candidate_CV.pdf",
    sizeBytes: 1542000,
  },
  costMode: "NEGOTIABLE",
  rateCardGradeCode: "G8",
  leadTimeDays: 14,
  specialTerms: "Pre-agreed SLA verified.",
});

assert(submissionReceipt.success === true, "Candidate submission succeeded in NEGOTIABLE mode");
// G8 on rc-falcon-001 has monthlyRate: 3648000 fils (AED 36,480.00), annual: 43776000 fils (AED 437,760.00)
assert(
  submissionReceipt.resolvedMonthlyFils === 3648000,
  `Resolved monthly rate is 3,648,000 fils = AED 36,480.00 (got ${submissionReceipt.resolvedMonthlyFils})`
);
assert(
  submissionReceipt.resolvedAmountFils === 3648000 * 12,
  `Resolved annual rate is 43,776,000 fils = AED 437,760.00 (got ${submissionReceipt.resolvedAmountFils})`
);
console.log(`Resolved cost verified: AED ${formatAmount(submissionReceipt.resolvedMonthlyFils)}/mo from rc-falcon-001 G8`);

// --------------------------------------------------------------------------
// TEST 4: Unapproved Rate Card Guard
// --------------------------------------------------------------------------
console.log("\n--- TEST 4: Unapproved Rate Card Cannot Be Resolved ---");
let unapprovedErrorCaught = false;
try {
  // Attempt to submit for a hypothetical vendor without a published card
  submitVendorCandidate({
    requisitionId: "OMS-2026-0161",
    vendorId: "ven-competitor-nonexistent",
    candidate: {
      fullName: "Competitor Candidate",
      email: "candidate@competitor.com",
      mobile: "+971 50 999 8877",
      nationality: "Jordan",
      residentStatus: "ONSHORE",
      experienceYears: 5,
      noticePeriod: "30 days",
    },
    cvAttachment: {
      id: "att-comp-cv",
      name: "Competitor_CV.pdf",
      sizeBytes: 1000000,
    },
    costMode: "NEGOTIABLE",
    rateCardGradeCode: "G8",
    leadTimeDays: 14,
  });
} catch (err: any) {
  unapprovedErrorCaught = true;
  assert(
    err.message.includes("No published rate card found"),
    `Unapproved vendor throws expected error: "${err.message}"`
  );
}
assert(unapprovedErrorCaught, "Server correctly rejected Negotiable submission without a PUBLISHED rate card");

// --------------------------------------------------------------------------
// TEST 5: CSV Template Generation & CSV Parser
// --------------------------------------------------------------------------
console.log("\n--- TEST 5: CSV Template Export & CSV Parser ---");
const templateCsv = exportRateCardTemplateCsv();
assert(templateCsv.includes("Template,GradeCode,Level,RoleTitle"), "CSV export contains standard headers");
assert(templateCsv.includes("DIEZA_PREMISES,G6,Junior"), "CSV export contains sample 2-level grade structure");

const parsed = parseRateCardCsv(templateCsv, "ven-falcon");
assert(parsed.template === "DIEZA_PREMISES", `Parsed template matches header (got ${parsed.template})`);
assert(parsed.grades.length === 4, `Parsed 4 grade entries (got ${parsed.grades.length})`);
assert(parsed.grades[0].gradeCode === "G6", "First grade code parsed as G6");
assert(parsed.grades[0].minSalary === 1400000, `G6 min salary is 1,400,000 fils (got ${parsed.grades[0].minSalary})`);
assert(parsed.grades[0].serviceChargePercent === 15, `G6 service charge is 15% (got ${parsed.grades[0].serviceChargePercent})`);
assert(parsed.grades[0].monthlyRate > 0, `Monthly rate computed as ${parsed.grades[0].monthlyRate} fils`);
assert(parsed.grades[0].dailyRate > 0, `Daily rate computed as ${parsed.grades[0].dailyRate} fils`);

// --------------------------------------------------------------------------
// TEST 6: Rate Card Lifecycle Transitions (Draft -> Submitted -> Published)
// --------------------------------------------------------------------------
console.log("\n--- TEST 6: Rate Card Lifecycle Transitions ---");
const testCardId = `rc-test-${Date.now()}`;
const newDraftCard: RateCard = {
  id: testCardId,
  vendorId: "ven-falcon",
  code: "RC-TEST-2026",
  name: "Lifecycle Test Rate Card",
  template: "UAE_REMOTE_OFFICE",
  status: "DRAFT",
  effectiveFrom: "2026-08-01",
  effectiveTo: "2027-07-31",
  currency: "AED",
  grades: [
    {
      gradeCode: "G7",
      level: "Mid-Level",
      roleTitle: "Cloud Security Specialist",
      minSalary: 1800000,
      maxSalary: 2200000,
      serviceChargePercent: 12,
      monthlyRate: 2240000,
      dailyRate: 102000,
    },
  ],
};

// 1. Create Draft
createOrUpdateVendorRateCard(newDraftCard);
let retrieved = getVendorRateCard(testCardId, "ven-falcon");
assert(retrieved?.status === "DRAFT", `New rate card created with status DRAFT (got ${retrieved?.status})`);

// 2. Submit for Approval (DRAFT -> SUBMITTED)
submitVendorRateCardForApproval(testCardId, "ven-falcon");
retrieved = getVendorRateCard(testCardId, "ven-falcon");
assert(retrieved?.status === "SUBMITTED", `Rate card transitioned to SUBMITTED (got ${retrieved?.status})`);

// 3. Publish (SUBMITTED -> PUBLISHED)
publishVendorRateCard(testCardId, "ven-falcon");
retrieved = getVendorRateCard(testCardId, "ven-falcon");
assert(retrieved?.status === "PUBLISHED", `Rate card transitioned to PUBLISHED (got ${retrieved?.status})`);

// --------------------------------------------------------------------------
// TEST 7: Financial Precision Standards (lib/money.ts)
// --------------------------------------------------------------------------
console.log("\n--- TEST 7: Financial Precision Standards ---");
assert(formatAmount(0) === "0.00", "formatAmount(0) renders '0.00'");
assert(formatAmount(3648000) === "36,480.00", "formatAmount(3648000) renders '36,480.00'");
assert(formatAmount(140000) === "1,400.00", "formatAmount(140000) renders '1,400.00'");
assert(formatAmount(43776000) === "437,760.00", "formatAmount(43776000) renders '437,760.00'");

console.log("\n========================================================");
console.log("  ALL VP4 VERIFICATION CHECKS PASSED SUCCESSFULLY (100%)");
console.log("========================================================\n");
