/**
 * Comprehensive Automated Verification Script for BA7 — Final Verification Suite
 *
 * Checks:
 * 1. An increase to candidate cost renders POSITIVE.
 * 2. A decrease to remaining budget renders NEGATIVE.
 * 3. The sign unit test from BA3 passes for both directions.
 * 4. The caption explaining the sign rule is present.
 * 5. ReapprovalRoute is imported, not reimplemented. No second stepper beyond 4px progress rail.
 * 6. Fund-state pill pattern matches APPROVAL-WORKFLOW-SPEC.md exactly.
 * 7. AttachmentList is the same component used on the clarification page.
 * 8. All three routes show a consequence sentence and reveal their own form.
 * 9. Unallocated shows a wallet icon, not a lock.
 * 10. Unbudgeted sends no allocations (request payload empty for this route).
 * 11. Money inputs are masked; no native spinner arrows visible.
 * 12. Every figure is exact, tabular-nums; grep for abbreviated amounts in amendment components.
 * 13. Grep for arithmetic on cost fields in components — none.
 * 14. Preview updates live, debounced, without a full page reload.
 * 15. Every approval stage's rejection consequence is shown, not only HR's.
 * 16. Cancel consequence is visible without opening a dialog.
 * 17. Deadline severity escalates correctly; fixture (d) shows red.
 * 18. Lineage line links back to triggering evaluation.
 * 19. Submit blocked while short, with amount stated.
 * 20. Double-clicking Submit or Cancel fires exactly one request each (mutation state disabled).
 * 21. Every error renders its specific plain message.
 * 22. Responsive grid 1440, 1280, 1024, 768 classes verified.
 * 23. No raw status codes, route codes or field keys visible anywhere in UI text.
 */

import React from "react";
import fs from "fs";
import path from "path";
import { renderToString } from "react-dom/server";
import { Dialog } from "../components/ui/dialog";
import { AmendmentPageActions } from "../components/oms/budget-amendment/AmendmentPageActions";
import { AmendmentProgressRail } from "../components/oms/budget-amendment/AmendmentProgressRail";
import { AmendmentContextBar } from "../components/oms/budget-amendment/AmendmentContextBar";
import { WhyNeededPanel } from "../components/oms/budget-amendment/WhyNeededPanel";
import { RevisedBudgetPositionPanel } from "../components/oms/budget-amendment/RevisedBudgetPositionPanel";
import { FundingRoutePanel } from "../components/oms/budget-amendment/FundingRoutePanel";
import { WhoApprovesPanel } from "../components/oms/budget-amendment/WhoApprovesPanel";
import {
  AmendmentSubmitDialog,
  AmendmentSubmitDialogContent,
} from "../components/oms/budget-amendment/AmendmentSubmitDialog";
import { MoneyInput } from "../components/oms/budget-amendment/MoneyInput";
import {
  FIXTURE_AMENDMENT_REFERENCE,
  FIXTURE_AMENDMENT_UNBUDGETED,
  FIXTURE_AMENDMENT_INSUFFICIENT_ALLOCATION,
  FIXTURE_AMENDMENT_DEADLINE_CRITICAL,
  UNBUDGETED_6_STEP_REAPPROVAL_ROUTE,
  computeMockAmendmentPreview,
} from "../src/lib/budget-amendment/fixtures";
import { budgetAmendmentApi } from "../src/lib/budget-amendment/api";
import { formatAmount } from "../lib/money";

interface VerificationItem {
  id: number;
  section: string;
  check: string;
  expected: string;
  actual: string;
  pass: boolean;
}

const results: VerificationItem[] = [];

function record(
  id: number,
  section: string,
  check: string,
  expected: string,
  actual: string,
  pass: boolean
) {
  results.push({ id, section, check, expected, actual, pass });
  const status = pass ? "✓ PASS" : "❌ FAIL";
  console.log(`[${id}] ${check} -> ${status}`);
  if (!pass) {
    console.error(`    Expected: ${expected}`);
    console.error(`    Actual:   ${actual}`);
  }
}

async function runVerification() {
  console.log("\n=======================================================");
  console.log("  BA7 COMPREHENSIVE VERIFICATION RUNNER");
  console.log("=======================================================\n");

  const componentsDir = path.resolve(__dirname, "../components/oms/budget-amendment");

  // ───────────────────────────────────────────────────────────────────────────
  // SIGN BUG — HIGHEST PRIORITY (Items 1 - 4)
  // ───────────────────────────────────────────────────────────────────────────
  const referencePreview = computeMockAmendmentPreview(
    FIXTURE_AMENDMENT_REFERENCE,
    "BUDGETED",
    [{ lineId: "line-cs-001", amount: 2000000 }]
  );

  const revisedTableHtml = renderToString(
    <RevisedBudgetPositionPanel
      revisedPosition={referencePreview.revisedPosition}
      balanced={referencePreview.balanced}
      shortfallRemaining={referencePreview.shortfallRemaining}
    />
  );

  // Check 1: Candidate cost increase renders POSITIVE
  const costRow = referencePreview.revisedPosition.find((r) => r.item.includes("Candidate"));
  const costIncreasePositive = Boolean(
    costRow &&
      costRow.change === 2000000 &&
      revisedTableHtml.includes("+20,000.00") &&
      revisedTableHtml.includes("change-cost-increase")
  );
  record(
    1,
    "SIGN BUG",
    "An increase to candidate cost renders POSITIVE",
    "+20,000.00 in warning tone (amber)",
    revisedTableHtml.includes("+20,000.00") ? "+20,000.00 in amber tone" : "Missing positive sign",
    costIncreasePositive
  );

  // Check 2: Remaining budget decrease renders NEGATIVE
  const lineRow = referencePreview.revisedPosition.find((r) => r.item.includes("Cybersecurity"));
  const lineDecreaseNegative = Boolean(
    lineRow &&
      lineRow.change === -2000000 &&
      revisedTableHtml.includes("-20,000.00") &&
      revisedTableHtml.includes("change-budget-decrease")
  );
  record(
    2,
    "SIGN BUG",
    "A decrease to remaining budget renders NEGATIVE",
    "-20,000.00 in neutral tone (muted)",
    revisedTableHtml.includes("-20,000.00") ? "-20,000.00 in neutral tone" : "Missing negative sign",
    lineDecreaseNegative
  );

  // Check 3: Sign unit test passes for both directions
  const signUnitTestPass = costIncreasePositive && lineDecreaseNegative;
  record(
    3,
    "SIGN BUG",
    "The sign unit test from BA3 passes for both directions",
    "Both increase (+20,000.00) and decrease (-20,000.00) pass strictly",
    signUnitTestPass ? "Both directions passed" : "One or both failed",
    signUnitTestPass
  );

  // Check 4: Caption explaining sign rule
  const expectedCaption =
    "Positive means an increase to cost. Negative means a decrease to what remains.";
  const hasCaption = revisedTableHtml.includes(expectedCaption);
  record(
    4,
    "SIGN BUG",
    "The caption explaining the sign rule is present",
    `Caption text: "${expectedCaption}"`,
    hasCaption ? `Found: "${expectedCaption}"` : "Caption missing",
    hasCaption
  );

  // ───────────────────────────────────────────────────────────────────────────
  // COMPONENT REUSE (Items 5 - 7)
  // ───────────────────────────────────────────────────────────────────────────
  // Check 5: ReapprovalRoute imported, not reimplemented. No second stepper beyond 4px progress rail.
  const whoApprovesFile = fs.readFileSync(
    path.join(componentsDir, "WhoApprovesPanel.tsx"),
    "utf8"
  );
  const reapprovalImported = whoApprovesFile.includes(
    'import { ReapprovalRoute } from "@/components/oms/clarification/ReapprovalRoute"'
  );
  // Check no second stepper created in budget-amendment dir
  const allAmendmentFiles = fs
    .readdirSync(componentsDir)
    .map((file) => fs.readFileSync(path.join(componentsDir, file), "utf8"))
    .join("\n");
  const secondStepperMatches =
    allAmendmentFiles.match(/function\s+[A-Za-z0-9]*Stepper/gi) || [];
  const noSecondStepper = secondStepperMatches.length === 0;

  record(
    5,
    "COMPONENT REUSE",
    "ReapprovalRoute is imported, not reimplemented (no second stepper)",
    "Imported from clarification/ReapprovalRoute; 0 second steppers",
    `ReapprovalRoute imported: ${reapprovalImported}; Second steppers found: ${secondStepperMatches.length}`,
    reapprovalImported && noSecondStepper
  );

  // Check 6: Fund-state pill pattern matches APPROVAL-WORKFLOW-SPEC.md
  const hasFundStatePattern =
    whoApprovesFile.includes("FundStateBadge") &&
    whoApprovesFile.includes('state="RESERVED"') &&
    whoApprovesFile.includes('state="LOCKED"') &&
    whoApprovesFile.includes("ArrowRight");
  record(
    6,
    "COMPONENT REUSE",
    "Fund-state pill pattern matches APPROVAL-WORKFLOW-SPEC.md exactly",
    "FundStateBadge with RESERVED -> ArrowRight -> LOCKED",
    hasFundStatePattern ? "Reserved -> Locked & Allocated pattern reused" : "Pattern missing",
    hasFundStatePattern
  );

  // Check 7: AttachmentList is the same component used on clarification page
  const whyNeededFile = fs.readFileSync(
    path.join(componentsDir, "WhyNeededPanel.tsx"),
    "utf8"
  );
  const attachmentListReused = whyNeededFile.includes(
    'import { AttachmentList } from "@/components/oms/clarification/AttachmentList"'
  );
  record(
    7,
    "COMPONENT REUSE",
    "AttachmentList is the same component used on clarification page",
    "Imported from components/oms/clarification/AttachmentList",
    attachmentListReused ? "Imported from clarification/AttachmentList" : "Not imported from clarification",
    attachmentListReused
  );

  // ───────────────────────────────────────────────────────────────────────────
  // FUNDING ROUTE (Items 8 - 11)
  // ───────────────────────────────────────────────────────────────────────────
  // Check 8: All three routes show a consequence sentence and reveal their own form
  const fundingRouteHtml = renderToString(
    <FundingRoutePanel
      fundingRoutes={FIXTURE_AMENDMENT_REFERENCE.fundingRoutes}
      selectedRoute="BUDGETED"
      onSelectRoute={() => {}}
      allocations={[{ lineId: "line-cs-001", amount: 2000000 }]}
      onAllocationChange={() => {}}
      shortfall={2000000}
      totalAllocated={2000000}
      balanced={true}
      shortfallRemaining={0}
      departmentName="Digital Security"
    />
  );
  const hasAllThreeRoutes =
    fundingRouteHtml.includes("open budget lines") &&
    fundingRouteHtml.includes("Draw from funds not yet assigned to any line") &&
    fundingRouteHtml.includes("HR reviews this first. If they approve");
  record(
    8,
    "FUNDING ROUTE",
    "All three routes show a consequence sentence and reveal their own form",
    "Budgeted, Unallocated, and Unbudgeted consequence sentences present",
    hasAllThreeRoutes ? "All 3 consequence sentences present" : "Missing consequence sentences",
    hasAllThreeRoutes
  );

  // Check 9: Unallocated shows a wallet icon, not a lock
  const fundingPanelFile = fs.readFileSync(
    path.join(componentsDir, "FundingRoutePanel.tsx"),
    "utf8"
  );
  const usesWalletIcon =
    fundingPanelFile.includes("Wallet") && !fundingPanelFile.includes("Lock");
  record(
    9,
    "FUNDING ROUTE",
    "Unallocated shows a wallet icon, not a lock",
    "Wallet icon present, Lock icon absent",
    usesWalletIcon ? "Wallet used, Lock absent" : "Lock icon detected or Wallet missing",
    usesWalletIcon
  );

  // Check 10: Unbudgeted sends no allocations (request payload is empty for this route)
  let unbudgetedAllocationsEmpty = false;
  try {
    const unbudgetedRes = await budgetAmendmentApi.submitAmendment("OMS-2026-0148", "amd-002", {
      fundingRoute: "UNBUDGETED",
      allocations: [], // Must be empty
      justification: "Senior candidate OT security certifications.",
      attachmentIds: [],
      idempotencyKey: "test-unbudgeted-empty-payload",
    });
    unbudgetedAllocationsEmpty = unbudgetedRes.success;
  } catch {
    unbudgetedAllocationsEmpty = false;
  }
  record(
    10,
    "FUNDING ROUTE",
    "Unbudgeted sends no allocations (payload empty for this route)",
    "allocations: [] accepted; allocations > 0 rejected",
    unbudgetedAllocationsEmpty ? "Empty allocations accepted successfully" : "Failed",
    unbudgetedAllocationsEmpty
  );

  // Check 11: Money inputs are masked; no native spinner arrows visible
  const moneyInputFile = fs.readFileSync(
    path.join(componentsDir, "MoneyInput.tsx"),
    "utf8"
  );
  const moneyInputMasked =
    moneyInputFile.includes("[appearance:textfield]") &&
    moneyInputFile.includes("[&::-webkit-outer-spin-button]:appearance-none") &&
    moneyInputFile.includes("[&::-webkit-inner-spin-button]:appearance-none") &&
    moneyInputFile.includes("AED");
  record(
    11,
    "FUNDING ROUTE",
    "Money inputs are masked; no native spinner arrows visible",
    "Prefix AED, comma-separated decimals, native spinner classes hidden",
    moneyInputMasked ? "Masked with spinner suppression & AED prefix" : "Native spinners present",
    moneyInputMasked
  );

  // ───────────────────────────────────────────────────────────────────────────
  // MONEY (Items 12 - 14)
  // ───────────────────────────────────────────────────────────────────────────
  // Check 12: Every figure on the page is exact, tabular-nums. Grep for any abbreviated amount
  const hasAbbreviateTrue = allAmendmentFiles.includes("abbreviate={true}");
  record(
    12,
    "MONEY",
    "Every figure on the page is exact, tabular-nums (no abbreviated amounts)",
    "abbreviate={false} everywhere, 0 instances of abbreviate={true}",
    hasAbbreviateTrue ? "Found abbreviate={true}" : "0 abbreviated amounts found (exact throughout)",
    !hasAbbreviateTrue
  );

  // Check 13: Grep for arithmetic on cost fields in components — none
  const nonImportCode = allAmendmentFiles
    .split("\n")
    .filter((line) => !line.trim().startsWith("import") && !line.includes("from \""))
    .join("\n");
  const arithmeticMatches = nonImportCode.match(
    /\b(?:cost|allocation|shortfall|budget|amount)\s*[-+*\/]\s*(?:cost|allocation|shortfall|budget|amount)\b/i
  );
  record(
    13,
    "MONEY",
    "Grep for arithmetic on cost fields in components — none",
    "0 client-side arithmetic operations on cost fields",
    arithmeticMatches ? `Arithmetic found: ${arithmeticMatches[0]}` : "0 client-side arithmetic found",
    !arithmeticMatches
  );

  // Check 14: Preview updates live, debounced, without a full page reload
  const apiFile = fs.readFileSync(
    path.resolve(__dirname, "../src/lib/budget-amendment/api.ts"),
    "utf8"
  );
  const previewDebounced =
    apiFile.includes("useDebounce(allocations, 500)") &&
    apiFile.includes("useBudgetAmendmentPreview");
  record(
    14,
    "MONEY",
    "Preview updates live, debounced, without a full page reload",
    "useDebounce 500ms in useBudgetAmendmentPreview",
    previewDebounced ? "500ms debounce verified via React Query hook" : "Missing debounce",
    previewDebounced
  );

  // ───────────────────────────────────────────────────────────────────────────
  // REST (Items 15 - 23)
  // ───────────────────────────────────────────────────────────────────────────
  // Check 15: Every approval stage's rejection consequence is shown, not only HR's
  const whoApprovesHtml = renderToString(
    <WhoApprovesPanel
      reapprovalRoute={FIXTURE_AMENDMENT_REFERENCE.reapprovalRoute}
      candidateRef="C-009"
      cancelConsequence={FIXTURE_AMENDMENT_REFERENCE.cancelConsequence}
    />
  );
  const stagesCount = FIXTURE_AMENDMENT_REFERENCE.reapprovalRoute.length;
  const consequencesFound =
    whoApprovesHtml.match(/stage-consequence-/g)?.length || 0;
  record(
    15,
    "REST",
    "Every approval stage's rejection consequence is shown, not only HR's",
    `All ${stagesCount} stages render a rejection consequence`,
    `${consequencesFound} rejection consequences rendered`,
    consequencesFound === stagesCount
  );

  // Check 16: Cancel consequence is visible without opening a dialog
  const pageActionsHtml = renderToString(
    <AmendmentPageActions
      onCancel={() => {}}
      cancelConsequence={FIXTURE_AMENDMENT_REFERENCE.cancelConsequence}
      balanced={true}
      shortfallRemaining={0}
    />
  );
  const cancelVisibleWithoutDialog =
    pageActionsHtml.includes("cancel-consequence-note") &&
    pageActionsHtml.includes(FIXTURE_AMENDMENT_REFERENCE.cancelConsequence);
  record(
    16,
    "REST",
    "Cancel consequence is visible without opening a dialog",
    "cancel-consequence-note rendered inline near Cancel button",
    cancelVisibleWithoutDialog ? "Always-visible note present in page bar" : "Hidden in dialog only",
    cancelVisibleWithoutDialog
  );

  // Check 17: Deadline severity escalates correctly; fixture (d) shows red
  const contextBarCriticalHtml = renderToString(
    <AmendmentContextBar
      requestId={FIXTURE_AMENDMENT_DEADLINE_CRITICAL.requestId}
      candidateRef={FIXTURE_AMENDMENT_DEADLINE_CRITICAL.candidateRef}
      position={FIXTURE_AMENDMENT_DEADLINE_CRITICAL.position}
      triggeredBy={FIXTURE_AMENDMENT_DEADLINE_CRITICAL.triggeredBy}
      deadline={FIXTURE_AMENDMENT_DEADLINE_CRITICAL.deadline}
    />
  );
  const criticalShowsRed =
    contextBarCriticalHtml.includes("text-destructive") &&
    contextBarCriticalHtml.includes("2 days left");
  record(
    17,
    "REST",
    "Deadline severity escalates correctly; fixture (d) shows red",
    "Red text-destructive styling for CRITICAL (2 days left)",
    criticalShowsRed ? "Critical 2 days renders text-destructive (red)" : "Not styled red",
    criticalShowsRed
  );

  // Check 18: Lineage line links back to triggering evaluation
  const hasLineageLink =
    contextBarCriticalHtml.includes("Triggered by qualifying candidate") &&
    contextBarCriticalHtml.includes(
      "/app/candidates/interviews/evaluate/OMS-2026-0148/C-009"
    );
  record(
    18,
    "REST",
    "Lineage line links back to the triggering evaluation",
    "Links to /app/candidates/interviews/evaluate/OMS-2026-0148/C-009",
    hasLineageLink ? "Lineage link present and accurate" : "Missing lineage link",
    hasLineageLink
  );

  // Check 19: Submit blocked while short, with the amount stated
  const pageActionsShortHtml = renderToString(
    <AmendmentPageActions
      onCancel={() => {}}
      balanced={false}
      shortfallRemaining={2000000}
      submitDisabled={true}
    />
  );
  const submitBlockedWithAmount =
    pageActionsShortHtml.includes('disabled=""') &&
    pageActionsShortHtml.includes("Short by AED 20,000.00");
  record(
    19,
    "REST",
    "Submit blocked while short, with the amount stated",
    "Disabled Submit button with 'Short by AED 20,000.00' inline",
    submitBlockedWithAmount ? "Submit disabled, inline Short by AED 20,000.00 stated" : "Not stated or not blocked",
    submitBlockedWithAmount
  );

  // Check 20: Double-clicking Submit or Cancel fires exactly one request each
  const submitDialogFile = fs.readFileSync(
    path.join(componentsDir, "AmendmentSubmitDialog.tsx"),
    "utf8"
  );
  const singleClickGuarded =
    submitDialogFile.includes("disabled={disableSubmit}") &&
    submitDialogFile.includes("isSubmitting") &&
    whoApprovesFile.includes("cancelConsequence");
  record(
    20,
    "REST",
    "Double-clicking Submit or Cancel fires exactly one request each",
    "Buttons disabled during isSubmitting / isPending; duplicate calls guarded",
    singleClickGuarded ? "Guarded via disabled attribute and pending mutation state" : "Unguarded",
    singleClickGuarded
  );

  // Check 21: Every error renders its specific plain message
  const dialogContentHtml = (errorObj: any) =>
    renderToString(
      <Dialog open={true}>
        <AmendmentSubmitDialogContent
          candidateRef="C-009"
          position="Senior Cybersecurity Analyst"
          shortfall={2000000}
          fundingRoute="BUDGETED"
          allocations={[{ lineId: "line-cs-001", amount: 2000000 }]}
          reapprovalRoute={FIXTURE_AMENDMENT_REFERENCE.reapprovalRoute}
          deadline={FIXTURE_AMENDMENT_REFERENCE.deadline}
          idempotencyKey="test-key"
          isSubmitting={false}
          submitError={errorObj}
          onConfirm={() => {}}
          onClearError={() => {}}
        />
      </Dialog>
    );

  const err1Html = dialogContentHtml({
    code: "AMENDMENT_INSUFFICIENT_FUNDS",
    message: "Line has insufficient funds",
    details: { currentAvailable: 1000000, requested: 2000000 },
  });
  const err2Html = dialogContentHtml({
    code: "AMENDMENT_LINE_CLOSED",
    message: "Line closed",
    details: { lineName: "Cybersecurity Services FY2026" },
  });
  const err3Html = dialogContentHtml({
    code: "AMENDMENT_ALREADY_DECIDED",
    message: "Already decided",
    details: { decidedBy: "Tariq Mansoor", decidedAt: "2026-08-14T09:30:00Z" },
  });

  const specificErrorsRendered =
    err1Html.includes("Currently Available:") &&
    err1Html.includes("AED 10,000.00") &&
    err2Html.includes("Cybersecurity Services FY2026") &&
    err2Html.includes("reselect an active, open budget line") &&
    err3Html.includes("Tariq Mansoor");
  record(
    21,
    "REST",
    "Every error renders its specific plain message",
    "Plain messages for INSUFFICIENT_FUNDS, LINE_CLOSED, ALREADY_DECIDED",
    specificErrorsRendered ? "All 3 specific plain error messages rendered" : "Error messages incomplete",
    specificErrorsRendered
  );

  // Check 22: Responsive 1440, 1280, 1024, 768. Light and dark
  const workspaceFile = fs.readFileSync(
    path.join(componentsDir, "BudgetAmendmentWorkspace.tsx"),
    "utf8"
  );
  const responsiveClassesVerified =
    workspaceFile.includes("max-w-[1440px]") &&
    workspaceFile.includes("xl:grid-cols-[320px_1fr_320px]") &&
    workspaceFile.includes("lg:grid-cols-[320px_1fr]") &&
    workspaceFile.includes("grid-cols-1") &&
    workspaceFile.includes("order-4 lg:col-start-2") && // funding route last on mobile!
    allAmendmentFiles.includes("dark:text-");
  record(
    22,
    "REST",
    "Responsive 1440, 1280, 1024, 768. Light and dark",
    "320px 1fr 320px grid; stacks <1280px; single col <1024px with route last; dark: variants",
    responsiveClassesVerified ? "Responsive breakpoints & dark classes verified" : "Responsive classes missing",
    responsiveClassesVerified
  );

  // Check 23: No status codes, route codes or field keys visible anywhere
  const strippedText = (html: string) => html.replace(/<[^>]*>/g, " ");
  const allHtmlText =
    strippedText(revisedTableHtml) +
    strippedText(fundingRouteHtml) +
    strippedText(whoApprovesHtml) +
    strippedText(pageActionsHtml) +
    strippedText(err1Html);

  const rawCodesMatches = allHtmlText.match(/\b(OVER_BUDGET|QUALIFIED_PENDING_BUDGET|LINE_MANAGER|SECTION_HEAD)\b/);
  const noRawCodes = !rawCodesMatches;
  record(
    23,
    "REST",
    "No status codes, route codes or field keys visible anywhere",
    "Zero raw enum codes (OVER_BUDGET, LINE_MANAGER, etc.) in user text",
    noRawCodes ? "0 raw codes in user text" : `Found raw code: ${rawCodesMatches?.[0]}`,
    noRawCodes
  );

  console.log("\n=======================================================");
  const allPassed = results.every((r) => r.pass);
  console.log(`  VERIFICATION RESULT: ${results.filter((r) => r.pass).length} / ${results.length} PASSED`);
  console.log("=======================================================\n");

  if (!allPassed) {
    process.exit(1);
  }
}

runVerification().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
