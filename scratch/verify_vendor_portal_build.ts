import {
  getVendorDashboard,
  listVendorRequisitions,
  getVendorRateCards,
  getVendorComplianceDocuments,
  CANDIDATES,
  REQUISITIONS,
  RATE_CARDS,
  INTERVIEW_PLANS,
} from "../src/lib/demo-data";

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${msg}`);
    process.exit(1);
  }
  console.log(`✅ ${msg}`);
}

console.log("--- STARTING VENDOR PORTAL VERIFICATION (Prompt VP1) ---\n");

// 1. Verify Falcon Tech / Layla Hassan assigned as vendor for C-014 and C-021 on 0148
const c014 = CANDIDATES["C-014"];
const c021 = CANDIDATES["C-021"];
assert(Boolean(c014), "C-014 exists");
assert(c014.vendorId === "ven-falcon", `C-014 vendorId is ven-falcon (got: ${c014.vendorId})`);
assert(c014.requisitionId === "OMS-2026-0148", `C-014 requisitionId is OMS-2026-0148 (got: ${c014.requisitionId})`);

assert(Boolean(c021), "C-021 exists");
assert(c021.vendorId === "ven-falcon", `C-021 vendorId is ven-falcon (got: ${c021.vendorId})`);
assert(c021.requisitionId === "OMS-2026-0148", `C-021 requisitionId is OMS-2026-0148 (got: ${c021.requisitionId})`);
assert(c021.status === "INTERVIEW_PENDING", `C-021 is in INTERVIEW_PENDING status (got: ${c021.status})`);

// 2. Verify C-021 interview plan
const intPlan = INTERVIEW_PLANS["int-plan-0148-C-021"];
assert(Boolean(intPlan), "int-plan-0148-C-021 exists");
assert(intPlan.status === "AWAITING_REPLY", `Interview plan status is AWAITING_REPLY (got: ${intPlan.status})`);
assert(intPlan.proposal.slots.length === 3, `Interview plan has 3 proposed slots (got: ${intPlan.proposal.slots.length})`);

// 3. Verify Requisitions 0141 and 0161 are open
const req141 = REQUISITIONS["OMS-2026-0141"];
const req161 = REQUISITIONS["OMS-2026-0161"];
assert(Boolean(req141), "OMS-2026-0141 exists");
assert(req141.currentStage === "SOURCING", `OMS-2026-0141 is SOURCING (got: ${req141.currentStage})`);
assert(Boolean(req161), "OMS-2026-0161 exists");
assert(req161.currentStage === "RE_SOURCING", `OMS-2026-0161 is RE_SOURCING (got: ${req161.currentStage})`);

// 4. Verify Falcon Tech published rate card
const rcFalcon = RATE_CARDS["rc-falcon-001"];
assert(Boolean(rcFalcon), "Rate card rc-falcon-001 exists");
assert(rcFalcon.vendorId === "ven-falcon", `Rate card vendor is ven-falcon (got: ${rcFalcon.vendorId})`);
assert(rcFalcon.status === "PUBLISHED", `Rate card status is PUBLISHED (got: ${rcFalcon.status})`);
assert(rcFalcon.grades.length >= 4, `Rate card has grades G6-G9 (count: ${rcFalcon.grades.length})`);

// 5. Verify listVendorRequisitions strictly omits budget figures (Requirement 1)
const vendorReqs = listVendorRequisitions("ven-falcon");
assert(vendorReqs.length >= 3, `listVendorRequisitions returns at least 3 reqs (got: ${vendorReqs.length})`);
for (const vReq of vendorReqs) {
  assert(!("budgetAmount" in vReq), `Requisition ${vReq.id} does NOT include budgetAmount`);
  assert(!("allocations" in vReq), `Requisition ${vReq.id} does NOT include allocations`);
  assert(!("fundingRoute" in vReq), `Requisition ${vReq.id} does NOT include fundingRoute`);
  assert(typeof vReq.mySubmissionsCount === "number", `Requisition ${vReq.id} has mySubmissionsCount`);
}

// 6. Verify getVendorDashboard returns the exact 5 KPI values and 5 action items
const dash = getVendorDashboard("ven-falcon");
assert(Boolean(dash), "getVendorDashboard returns valid object");
assert(dash.kpis.openRequirements === 3, `openRequirements === 3 (got: ${dash.kpis.openRequirements})`);
assert(dash.kpis.candidatesAwaitingReview === 1, `candidatesAwaitingReview === 1 (got: ${dash.kpis.candidatesAwaitingReview})`);
assert(dash.kpis.interviewsToRespond === 1, `interviewsToRespond === 1 (got: ${dash.kpis.interviewsToRespond})`);
assert(dash.kpis.onboardingInProgress === 2, `onboardingInProgress === 2 (got: ${dash.kpis.onboardingInProgress})`);
assert(dash.kpis.documentsExpiringSoon === 1, `documentsExpiringSoon === 1 (got: ${dash.kpis.documentsExpiringSoon})`);

assert(dash.actionItems.length === 5, `actionItems has 5 items (got: ${dash.actionItems.length})`);
const actionRefs = dash.actionItems.map((a) => a.subjectRef);
assert(actionRefs.includes("C-021"), "Action queue includes C-021 interview slot proposal");
assert(actionRefs.includes("ONB-2026-0119"), "Action queue includes ONB-2026-0119 onboarding doc");
assert(actionRefs.includes("OMS-2026-0161"), "Action queue includes OMS-2026-0161 submission window");
assert(actionRefs.includes("OMS-2026-0141"), "Action queue includes OMS-2026-0141 submission window");
assert(actionRefs.includes("DOC-TL-2026"), "Action queue includes DOC-TL-2026 trade licence renewal");

// 7. Verify Compliance docs and Rate cards
const rCards = getVendorRateCards("ven-falcon");
assert(rCards.length >= 1, `getVendorRateCards returns at least 1 card (got: ${rCards.length})`);

const compDocs = getVendorComplianceDocuments("ven-falcon");
assert(compDocs.length >= 4, `getVendorComplianceDocuments returns 4 docs (got: ${compDocs.length})`);
const expiring = compDocs.filter((d) => d.status === "EXPIRING_SOON");
assert(expiring.length === 1, `1 compliance document expiring soon (got: ${expiring.length})`);

console.log("\n✨ ALL VENDOR PORTAL VERIFICATIONS PASSED SUCCESSFULLY!");
