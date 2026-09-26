import {
  FIXTURE_AMENDMENT_REFERENCE,
  FIXTURE_AMENDMENT_UNBUDGETED,
  FIXTURE_AMENDMENT_INSUFFICIENT_ALLOCATION,
  FIXTURE_AMENDMENT_DEADLINE_CRITICAL,
  computeMockAmendmentPreview,
} from "../src/lib/budget-amendment/fixtures";
import { budgetAmendmentApi } from "../src/lib/budget-amendment/api";

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${msg}`);
    process.exit(1);
  }
  console.log(`✓ PASS: ${msg}`);
}

async function runTests() {
  console.log("==================================================");
  console.log("BUDGET AMENDMENT — BA1 VERIFICATION SUITE");
  console.log("==================================================");

  // 1. Sign Rule Requirement 1:
  // Candidate cost increase is positive (+); Budget line balance decrease is negative (-)
  console.log("\n[TEST 1] Sign Convention Requirement 1 Verification");
  const preview = computeMockAmendmentPreview(
    FIXTURE_AMENDMENT_REFERENCE,
    "BUDGETED",
    [{ lineId: "line-cs-001", amount: 2000000 }]
  );

  assert(preview.revisedPosition.length === 2, "Preview has candidate row and line balance row");
  const candidateRow = preview.revisedPosition[0];
  const lineRow = preview.revisedPosition[1];

  assert(candidateRow.item === "Candidate allocation", "First row is candidate allocation");
  assert(candidateRow.current === 31000000, "Candidate current is 31,000,000 fils");
  assert(candidateRow.revised === 33000000, "Candidate revised is 33,000,000 fils");
  assert(candidateRow.change === 2000000, "Candidate cost increase is POSITIVE (+2,000,000 fils)");
  assert(candidateRow.change > 0, "Candidate cost change > 0");

  assert(lineRow.current === 45000000, "Line current is 45,000,000 fils");
  assert(lineRow.revised === 43000000, "Line revised is 43,000,000 fils");
  assert(lineRow.change === -2000000, "Line balance decrease is NEGATIVE (-2,000,000 fils)");
  assert(lineRow.change < 0, "Line balance change < 0");

  assert(preview.balanced === true, "Full allocation covers shortfall -> balanced is true");
  assert(preview.totalAllocated === 2000000, "Total allocated is 2,000,000 fils");
  assert(preview.shortfallRemaining === 0, "Shortfall remaining is 0 fils");

  // 2. Fixture A (Reference Case)
  console.log("\n[TEST 2] Fixture A: Reference Case");
  const ref = FIXTURE_AMENDMENT_REFERENCE;
  assert(ref.requestId === "OMS-2026-0148", "requestId is OMS-2026-0148");
  assert(ref.candidateRef === "C-009", "candidateRef is C-009");
  assert(ref.position === "Senior Cybersecurity Analyst", "position is Senior Cybersecurity Analyst");
  assert(ref.cost.approved === 31000000, "cost.approved is 31,000,000 fils");
  assert(ref.cost.qualified === 33000000, "cost.qualified is 33,000,000 fils");
  assert(ref.cost.shortfall === 2000000, "cost.shortfall is 2,000,000 fils");
  assert(ref.cost.variancePercent === 6.45, "cost.variancePercent is 6.45%");
  assert(ref.cost.status === "OVER_BUDGET", "cost.status is OVER_BUDGET");
  const budgetedRoute = ref.fundingRoutes.find(r => r.code === "BUDGETED");
  assert(budgetedRoute!.availableLines.length >= 2, "Available budget lines in budgeted route (2 or 3 open lines)");
  assert(budgetedRoute!.availableLines[0].available === 45000000, "Line 1 available is 45,000,000 fils");
  assert(budgetedRoute!.availableLines[1].available === 17000000, "Line 2 available is 17,000,000 fils");
  assert(ref.reapprovalRoute.length === 5, "5-step reapproval route");
  assert(ref.deadline.daysRemaining === 24, "24 days remaining on original request");
  assert(ref.deadline.severity === "NORMAL", "Deadline severity is NORMAL");

  // 3. Fixture B (UNBUDGETED Route Selected)
  console.log("\n[TEST 3] Fixture B: UNBUDGETED Route Selected");
  const unbudgeted = FIXTURE_AMENDMENT_UNBUDGETED;
  assert(unbudgeted.draft?.fundingRoute === "UNBUDGETED", "draft.fundingRoute is UNBUDGETED");
  assert(unbudgeted.draft?.allocations.length === 0, "No allocations sent with UNBUDGETED route");
  const unbudgetedRouteOption = unbudgeted.fundingRoutes.find(r => r.code === "UNBUDGETED");
  assert(unbudgetedRouteOption?.availableLines.length === 0, "Unbudgeted route has 0 available lines");
  assert(unbudgeted.reapprovalRoute.length === 6, "Reapproval route has 6 steps (with HR and Finance branch)");
  assert(unbudgeted.reapprovalRoute[4].stage === "HR", "Step 5 is HR");
  assert(unbudgeted.reapprovalRoute[5].stage === "FINANCE", "Step 6 is FINANCE");

  // 4. Fixture C (Insufficient Allocation)
  console.log("\n[TEST 4] Fixture C: Insufficient Allocation (Submit Blocked)");
  const insufficient = FIXTURE_AMENDMENT_INSUFFICIENT_ALLOCATION;
  const insufficientPreview = computeMockAmendmentPreview(
    insufficient,
    "BUDGETED",
    insufficient.draft!.allocations
  );
  assert(insufficientPreview.balanced === false, "insufficientPreview.balanced is FALSE");
  assert(insufficientPreview.totalAllocated === 500000, "Total allocated is 500,000 fils");
  assert(insufficientPreview.shortfallRemaining === 1500000, "Shortfall remaining is 1,500,000 fils (> 0)");

  // 5. Fixture D (Deadline CRITICAL)
  console.log("\n[TEST 5] Fixture D: Deadline CRITICAL");
  const critical = FIXTURE_AMENDMENT_DEADLINE_CRITICAL;
  assert(critical.deadline.daysRemaining === 2, "Deadline daysRemaining is 2");
  assert(critical.deadline.severity === "CRITICAL", "Deadline severity is CRITICAL");

  // 6. API Methods
  console.log("\n[TEST 6] budgetAmendmentApi Service Methods");
  const getRes = await budgetAmendmentApi.getAmendment("OMS-2026-0148", "amd-2026-0089");
  assert(getRes.amendmentId === "amd-2026-0089", "getAmendment returns reference workspace");

  const previewRes = await budgetAmendmentApi.previewAmendment("OMS-2026-0148", "amd-2026-0089", {
    fundingRoute: "BUDGETED",
    allocations: [{ lineId: "line-cs-001", amount: 2000000 }]
  });
  assert(previewRes.balanced === true, "previewAmendment returns balanced preview");

  const draftRes = await budgetAmendmentApi.saveDraft("OMS-2026-0148", "amd-2026-0089", {
    fundingRoute: "BUDGETED",
    allocations: [{ lineId: "line-cs-001", amount: 2000000 }],
    justification: "Valid justification with > 40 chars"
  });
  assert(draftRes.success === true, "saveDraft returns success");

  const submitRes = await budgetAmendmentApi.submitAmendment("OMS-2026-0148", "amd-2026-0089", {
    fundingRoute: "BUDGETED",
    allocations: [{ lineId: "line-cs-001", amount: 2000000 }],
    justification: "Valid justification",
    attachmentIds: [],
    idempotencyKey: "test-uuid-1234"
  });
  assert(submitRes.success === true, "submitAmendment returns success with nextApprover");
  assert(submitRes.nextApprover.name === "Omar Al Hashmi", "nextApprover is Omar Al Hashmi");

  const cancelRes = await budgetAmendmentApi.cancelAmendment("OMS-2026-0148", "amd-2026-0089", {
    reason: "Reverting to pool"
  });
  assert(cancelRes.success === true, "cancelAmendment returns success");
  assert(cancelRes.candidateStatus === "QUALIFIED_PENDING_BUDGET", "Candidate reverts to QUALIFIED_PENDING_BUDGET");

  console.log("\n==================================================");
  console.log("ALL VERIFICATION CHECKS PASSED SUCCESSFULLY! ✓");
  console.log("==================================================");
}

runTests().catch(err => {
  console.error("Test failed with error:", err);
  process.exit(1);
});
