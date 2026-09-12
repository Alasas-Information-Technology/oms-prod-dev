/**
 * DD7 Verification Test: Global Persona Switcher & Session Hydration
 * Tests:
 * 1. All 16 cast members from cast.ts are present and valid
 * 2. signPersonaToken produces genuine HMAC-SHA256 tokens verifiable with jose jwtVerify
 * 3. Hop 1: Mariam viewing OMS-2026-0148 -> canAct: false, separation-of-duties readOnlyReason
 * 4. Hop 2: Omar viewing OMS-2026-0148 -> canAct: true, appears in Omar's approval tasks
 * 5. Hop 3: Aisha viewing OMS-2026-0139 in HR Review -> clarification returned banner with Aisha's attribution
 * 6. Hop 4: Noura evaluating C-014 on OMS-2026-0148 -> canEvaluate: true, isMainInterviewer: true, over-budget linked to amd-2026-0089
 * 7. Hop 5: Rashid Al Mansoori viewing amd-2026-0089 -> reapproval route shows FINANCE as CURRENT
 * 8. Vendor vs Internal typing: Layla has userType VENDOR, vendorId ven-falcon; internal personas have INTERNAL
 */

import { CAST, CAST_LIST } from "../src/lib/demo-data/cast";
import {
  PERSONA_AUTH_MAP,
  signPersonaToken,
} from "../src/lib/demo-data/persona-auth";
import { jwtVerify } from "jose";
import { getApprovalDetailFixture, getApprovalTasksForUserFixture } from "../lib/fixtures/approval.fixtures";
import { getHrReviewDetailFixture, getHrReviewQueueFixture } from "../lib/hr-review/fixtures";
import { getInterviewEvaluationFixture } from "../src/lib/interview-evaluation/fixtures";
import { getBudgetAmendmentFixture } from "../src/lib/budget-amendment/fixtures";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ||
    "6000576da50db77526e8258b4b29353405b3d0936678de321cf5c781b29a6b5eca007840ea28c5caddd1ec155174303d0251ab2000d7b4e9f904d419d569e94a"
);
const JWT_ISSUER = "OMS";
const JWT_AUDIENCE = "OMS_USERS";

async function runTests() {
  console.log("=== DD7 VERIFICATION SUITE ===");
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, msg: string) {
    if (condition) {
      console.log(`✅ PASS: ${msg}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${msg}`);
      failed++;
    }
  }

  // TEST 1: Exactly 16 Cast Members
  const castKeys = Object.keys(CAST);
  assert(castKeys.length === 16, `Cast contains exactly 16 members (found ${castKeys.length})`);
  assert(CAST_LIST.length === 16, `CAST_LIST contains exactly 16 items`);

  // TEST 2: Cryptographic Token Signing for All 16 Personas
  console.log("\n--- Testing Token Signing & Verification for 16 Personas ---");
  for (const person of CAST_LIST) {
    const token = await signPersonaToken(person);
    assert(!!token && token.split(".").length === 3, `Signed JWT generated for ${person.id} (${person.name})`);

    const { payload } = await jwtVerify(token, JWT_SECRET, {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    });
    assert(payload.userId === person.id, `Payload userId matches ${person.id}`);
    assert(payload.userType === person.userType, `Payload userType matches ${person.userType}`);
    assert(Array.isArray(payload.roles) && payload.roles.length > 0, `Payload roles present for ${person.id}`);
  }

  // TEST 3: Hop 1 — Mariam viewing OMS-2026-0148
  console.log("\n--- Testing Hop 1: Mariam viewing OMS-2026-0148 ---");
  const mariamDetail = getApprovalDetailFixture("OMS-2026-0148", "usr-mariam");
  assert(!!mariamDetail, "Approval detail found for OMS-2026-0148");
  assert(mariamDetail?.canAct === false, "Mariam canAct is FALSE (requester cannot approve own requisition)");
  assert(
    typeof mariamDetail?.readOnlyReason === "string" &&
      mariamDetail.readOnlyReason.includes("separation of duties"),
    `Separation of duties readOnlyReason returned: "${mariamDetail?.readOnlyReason}"`
  );

  // TEST 4: Hop 2 — Omar viewing OMS-2026-0148
  console.log("\n--- Testing Hop 2: Omar viewing OMS-2026-0148 ---");
  const omarDetail = getApprovalDetailFixture("OMS-2026-0148", "usr-omar");
  assert(omarDetail?.canAct === true, "Omar canAct is TRUE (Line Manager can approve)");
  assert(omarDetail?.readOnlyReason === null, "Omar readOnlyReason is null");

  const omarTasks = getApprovalTasksForUserFixture("usr-omar");
  const has0148InOmarTasks = omarTasks.some(
    (t) => t.subjectId === "OMS-2026-0148" || t.approvalTaskId.includes("0148")
  );
  assert(has0148InOmarTasks, "OMS-2026-0148 appears in Omar's Needs My Action tasks");

  // TEST 5: Hop 3 — Aisha viewing OMS-2026-0139 in HR Review
  console.log("\n--- Testing Hop 3: Aisha viewing OMS-2026-0139 ---");
  const hrQueue = getHrReviewQueueFixture();
  const queue0139 = hrQueue.items.find((i) => i.requestId === "OMS-2026-0139");
  assert(!!queue0139, "OMS-2026-0139 is present in HR Review queue");
  assert(queue0139?.returnedFromClarification === true, "0139 has returnedFromClarification === true");

  const hrDetail0139 = getHrReviewDetailFixture("OMS-2026-0139");
  assert(!!hrDetail0139, "HR Review detail loaded for OMS-2026-0139");
  assert(
    hrDetail0139?.clarificationContext?.hadClarification === true,
    "0139 clarificationContext.hadClarification is true"
  );
  assert(
    hrDetail0139?.clarificationContext?.askedBy.name === "Aisha Al Nuaimi" ||
      hrDetail0139?.clarificationContext?.askedBy.id === "usr-aisha",
    `Clarification was asked by Aisha Al Nuaimi (${hrDetail0139?.clarificationContext?.askedBy.name})`
  );

  // TEST 6: Hop 4 — Noura evaluating C-014 on OMS-2026-0148
  console.log("\n--- Testing Hop 4: Noura evaluating C-014 on OMS-2026-0148 ---");
  const nouraEval = getInterviewEvaluationFixture("OMS-2026-0148", "C-014", "usr-noura");
  assert(!!nouraEval, "Evaluation workspace loaded for C-014 on OMS-2026-0148");
  assert(nouraEval?.canEvaluate === true, "Noura canEvaluate === true");
  assert(nouraEval?.isMainInterviewer === true, "Noura isMainInterviewer === true");
  assert(nouraEval?.cost.status === "OVER_BUDGET", "C-014 cost status is OVER_BUDGET (triggers amendment)");

  // Check co-interviewer permissions: Yousef Al Falasi
  const yousefEval = getInterviewEvaluationFixture("OMS-2026-0148", "C-014", "usr-yousef-f");
  assert(yousefEval?.isMainInterviewer === false, "Yousef isMainInterviewer === false (panel interviewer)");

  // TEST 7: Hop 5 — Rashid Al Mansoori viewing amd-2026-0089
  console.log("\n--- Testing Hop 5: Rashid Al Mansoori viewing amd-2026-0089 ---");
  const amendmentForRashid = getBudgetAmendmentFixture("OMS-2026-0148", "amd-2026-0089", "usr-rashid-m");
  assert(!!amendmentForRashid, "Budget amendment amd-2026-0089 loaded");
  const financeStep = amendmentForRashid?.reapprovalRoute.find((s) => s.stage === "FINANCE");
  assert(!!financeStep, "FINANCE step is present in reapproval route");
  assert(
    financeStep?.user.userId === "usr-rashid-m" || financeStep?.user.name === "Rashid Al Mansoori",
    `Finance approver is Rashid Al Mansoori (${financeStep?.user.name})`
  );
  assert(
    financeStep?.status === "CURRENT",
    `FINANCE step status is CURRENT when viewed by Rashid Al Mansoori (status: ${financeStep?.status})`
  );

  // TEST 8: Domain 3 Isolation & Cast Typing
  console.log("\n--- Testing Domain 3 Vendor Typing ---");
  const layla = CAST["usr-layla"];
  assert(layla.userType === "VENDOR", "Layla Hassan userType === VENDOR");
  assert(layla.vendorId === "ven-falcon", "Layla vendorId === ven-falcon");

  const internalPersons = CAST_LIST.filter((p) => p.id !== "usr-layla");
  assert(
    internalPersons.every((p) => p.userType === "INTERNAL"),
    "All other 15 cast members have userType === INTERNAL"
  );

  console.log(`\n========================================`);
  console.log(`TOTAL: ${passed} passed, ${failed} failed.`);
  console.log(`========================================`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
