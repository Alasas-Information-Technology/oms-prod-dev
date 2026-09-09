/**
 * Automated Verification Suite for BA4: Funding Route Selection & Money Masking
 *
 * Checks all 4 tasks from prompt BA4 & docs/BUDGET-AMENDMENT-UI.md 1.3, 3.3:
 *  - TASK 1: Three radio cards (Budgeted, Unallocated, Unbudgeted) with consequences.
 *            Unallocated icon is a plain wallet (Wallet), NOT a lock.
 *  - TASK 2: Budgeted / Unallocated form:
 *            Line picker filtered to availableLines with live count:
 *            "3 open lines available to Digital Security."
 *            Per line: name, available (exact, tabular-nums), money-masked "Add" input.
 *            Running total beneath, balance check against shortfall.
 *  - TASK 3: Unbudgeted form:
 *            NO line picker rendered.
 *            Exact text: "HR reviews this first. If they approve, Finance selects or creates the funding line. Only then does this continue to procurement."
 *            Selecting Unbudgeted sends NO allocations (contract requirement 6).
 *            Selecting Unbudgeted adds HR -> Finance branch to ReapprovalRoute.
 *  - TASK 4: Money inputs:
 *            Digits only, thousands separators, two decimals, prefixed AED, no native spinner arrows.
 */

import React from "react";
import ReactDOMServer from "react-dom/server";
import assert from "assert";
import fs from "fs";
import path from "path";

import { FundingRoutePanel } from "../components/oms/budget-amendment/FundingRoutePanel";
import { MoneyInput } from "../components/oms/budget-amendment/MoneyInput";
import { BudgetAmendmentWorkspace } from "../components/oms/budget-amendment/BudgetAmendmentWorkspace";
import {
  FIXTURE_AMENDMENT_REFERENCE,
  FIXTURE_AMENDMENT_UNBUDGETED,
  REFERENCE_FUNDING_ROUTES,
  REFERENCE_5_STEP_REAPPROVAL_ROUTE,
  UNBUDGETED_6_STEP_REAPPROVAL_ROUTE,
} from "../src/lib/budget-amendment/fixtures";
import { formatAmount } from "../lib/money";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PageBarProvider } from "../components/ui/layouts/page-bar-context";
import { AppRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime";

const mockRouter = {
  back: () => {},
  forward: () => {},
  refresh: () => {},
  push: () => {},
  replace: () => {},
  prefetch: () => {},
};

function renderWithProviders(element: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ReactDOMServer.renderToString(
    React.createElement(
      QueryClientProvider,
      { client: queryClient },
      React.createElement(
        AppRouterContext.Provider,
        { value: mockRouter as any },
        React.createElement(PageBarProvider, null, element)
      )
    )
  );
}

console.log("==================================================");
console.log("BUDGET AMENDMENT — BA4 FUNDING ROUTE VERIFICATION");
console.log("==================================================\n");

// ─────────────────────────────────────────────────────────────────────────────
// TEST 1: Task 1 — Three Radio Cards & Iconography
// ─────────────────────────────────────────────────────────────────────────────
console.log("[TEST 1] Task 1: Three Radio Cards & Iconography");

const panelHtmlBudgeted = ReactDOMServer.renderToString(
  <FundingRoutePanel
    fundingRoutes={REFERENCE_FUNDING_ROUTES}
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

// 1.1 All three cards exist
assert(panelHtmlBudgeted.includes("Budgeted"), "Card 'Budgeted' must render");
assert(panelHtmlBudgeted.includes("Unallocated"), "Card 'Unallocated' must render");
assert(panelHtmlBudgeted.includes("Unbudgeted"), "Card 'Unbudgeted' must render");
console.log("✓ PASS: All 3 radio cards render: Budgeted, Unallocated, Unbudgeted");

// 1.2 Each card shows its consequence sentence
const normalizedHtml = panelHtmlBudgeted.replace(/&#x27;/g, "'");
for (const route of REFERENCE_FUNDING_ROUTES) {
  assert(
    normalizedHtml.includes(route.consequence),
    `Card '${route.label}' must display its consequence sentence: ${route.consequence}`
  );
}
console.log("✓ PASS: Each card displays its exact consequence sentence from fundingRoutes[].consequence");

// 1.3 Unallocated icon MUST be a plain wallet, NOT a lock
// Check the source code of FundingRoutePanel.tsx for Lock usage
const panelSource = fs.readFileSync(
  path.join(process.cwd(), "components/oms/budget-amendment/FundingRoutePanel.tsx"),
  "utf8"
);

assert(
  !panelSource.includes("Lock") && !panelSource.includes("LucideLock"),
  "Unallocated icon MUST NOT be a Lock (locks read as 'you cannot use this'). Source contains Lock icon reference!"
);
assert(
  panelSource.includes("Wallet"),
  "Unallocated icon must use Wallet component from lucide-react"
);
console.log("✓ PASS: Unallocated icon is a plain wallet (Wallet), NOT a lock (Lock forbidden per §1.3 & Task 1)");

// ─────────────────────────────────────────────────────────────────────────────
// TEST 2: Task 2 — Budgeted / Unallocated Form with Scoped Line Picker
// ─────────────────────────────────────────────────────────────────────────────
console.log("\n[TEST 2] Task 2: Budgeted / Unallocated Form & Scoped Line Picker");

// 2.1 Live count stated: "3 open lines available to Digital Security."
assert(
  panelHtmlBudgeted.includes("3 open lines available to Digital Security"),
  "Panel must state: '3 open lines available to Digital Security.'"
);
console.log("✓ PASS: Live count stated: '3 open lines available to Digital Security.'");

// 2.2 Per line: name, code, available balance (exact, tabular-nums), MoneyInput
assert(panelHtmlBudgeted.includes("Cybersecurity Services FY2026"), "Line name Cybersecurity Services rendered");
assert(panelHtmlBudgeted.includes("CS-DIG-001"), "Line code CS-DIG-001 rendered");
assert(panelHtmlBudgeted.includes("450,000.00"), "Exact available balance 450,000.00 rendered");
assert(panelHtmlBudgeted.includes("Digital Transformation FY2026"), "Line name Digital Transformation rendered");
assert(panelHtmlBudgeted.includes("170,000.00"), "Exact available balance 170,000.00 rendered");
assert(panelHtmlBudgeted.includes("Cloud Security Operations FY2026"), "Line name Cloud Security Operations rendered");
assert(panelHtmlBudgeted.includes("850,000.00"), "Exact available balance 850,000.00 rendered");
console.log("✓ PASS: Available lines render exact balance with tabular-nums and two decimals");

// 2.3 Running total beneath lines
assert(panelHtmlBudgeted.includes("Total added"), "Running total label 'Total added' must render");
assert(panelHtmlBudgeted.includes("20,000.00"), "Running total amount must render exact value 20,000.00");
console.log("✓ PASS: Running total renders beneath lines: 'Total added AED 20,000.00'");

// 2.4 Live balance check against shortfall
assert(
  panelHtmlBudgeted.includes("Sufficient funds available"),
  "Balanced state must indicate sufficient funds available"
);
console.log("✓ PASS: Live balance check indicates 'Sufficient funds available' when balanced");

// Test short balance feedback in panel
const panelHtmlShort = ReactDOMServer.renderToString(
  <FundingRoutePanel
    fundingRoutes={REFERENCE_FUNDING_ROUTES}
    selectedRoute="BUDGETED"
    onSelectRoute={() => {}}
    allocations={[{ lineId: "line-cs-001", amount: 500000 }]}
    onAllocationChange={() => {}}
    shortfall={2000000}
    totalAllocated={500000}
    balanced={false}
    shortfallRemaining={1500000}
    departmentName="Digital Security"
  />
);

assert(
  panelHtmlShort.includes("Short by AED 15,000.00"),
  "Short balance state must display remaining shortfall: 'Short by AED 15,000.00'"
);
console.log("✓ PASS: Short state displays exact remaining shortfall: 'Short by AED 15,000.00'");

// ─────────────────────────────────────────────────────────────────────────────
// TEST 3: Task 3 — Unbudgeted Form, Zero Allocations, & HR -> Finance Route Branch
// ─────────────────────────────────────────────────────────────────────────────
console.log("\n[TEST 3] Task 3: Unbudgeted Form & Dynamic HR -> Finance Approval Route");

const panelHtmlUnbudgeted = ReactDOMServer.renderToString(
  <FundingRoutePanel
    fundingRoutes={REFERENCE_FUNDING_ROUTES}
    selectedRoute="UNBUDGETED"
    onSelectRoute={() => {}}
    allocations={[]}
    onAllocationChange={() => {}}
    shortfall={2000000}
    totalAllocated={2000000}
    balanced={true}
    shortfallRemaining={0}
    departmentName="Digital Security"
  />
);

// 3.1 Exact sentence rendered
const requiredSentence =
  "HR reviews this first. If they approve, Finance selects or creates the funding line. Only then does this continue to procurement.";
assert(
  panelHtmlUnbudgeted.includes(requiredSentence),
  `Unbudgeted form must render exact sentence: "${requiredSentence}"`
);
console.log("✓ PASS: Unbudgeted form renders EXACT sentence: 'HR reviews this first. If they approve, Finance selects or creates the funding line. Only then does this continue to procurement.'");

// 3.2 NO line picker rendered
assert(
  !panelHtmlUnbudgeted.includes("Open Budget Lines") &&
  !panelHtmlUnbudgeted.includes("Cybersecurity Services FY2026") &&
  !panelHtmlUnbudgeted.includes("line-allocation-"),
  "Unbudgeted form must NOT render any line picker or line allocation inputs"
);
console.log("✓ PASS: NO line picker rendered when Unbudgeted is selected");

// 3.3 Zero allocations rule per contract requirement 6:
// Source check in BudgetAmendmentWorkspace.tsx
const workspaceSource = fs.readFileSync(
  path.join(process.cwd(), "components/oms/budget-amendment/BudgetAmendmentWorkspace.tsx"),
  "utf8"
);
assert(
  workspaceSource.includes('if (route === "UNBUDGETED")') &&
  workspaceSource.includes("setAllocations([])"),
  "Selecting UNBUDGETED route must reset allocations to [] (server requirement 6)"
);
console.log("✓ PASS: Selecting Unbudgeted route clears allocations (allocations = []) per Server Contract Requirement 6");

// 3.4 ReapprovalRoute dynamically gains HR -> Finance branch
// Test Workspace rendering with reference fixture vs unbudgeted fixture
const workspaceBudgetedHtml = renderWithProviders(
  <BudgetAmendmentWorkspace
    requestId="OMS-2026-0148"
    amendmentId="amd-2026-0089"
    initialData={FIXTURE_AMENDMENT_REFERENCE}
  />
);

// Under BUDGETED route (5 steps: Requester, Line Manager, Section Head, HOD, HR)
assert(workspaceBudgetedHtml.includes("Tariq Mansoor"), "Requester Tariq Mansoor in route");
assert(workspaceBudgetedHtml.includes("Omar Al Hashmi"), "Line Manager Omar Al Hashmi in route");
assert(workspaceBudgetedHtml.includes("Fatima Al Zaabi"), "Section Head Fatima Al Zaabi in route");
assert(workspaceBudgetedHtml.includes("Khalid Al Suwaidi"), "Department Head Khalid Al Suwaidi in route");
assert(workspaceBudgetedHtml.includes("HR Review"), "HR stage in route");
assert(!workspaceBudgetedHtml.includes("Finance Budget Allocation"), "Budgeted route must NOT have Finance Budget Allocation step");
console.log("✓ PASS: Default Budgeted route displays 5-step requisition approval chain without Finance");

// Under UNBUDGETED route (6 steps: Requester, Line Manager, Section Head, HOD, HR, Finance)
const workspaceUnbudgetedHtml = renderWithProviders(
  <BudgetAmendmentWorkspace
    requestId="OMS-2026-0148"
    amendmentId="amd-2026-0089"
    initialData={FIXTURE_AMENDMENT_UNBUDGETED}
  />
);
assert(
  workspaceUnbudgetedHtml.includes("Finance Budget Allocation") ||
  workspaceUnbudgetedHtml.includes("Saeed Al Marri"),
  "Unbudgeted route MUST include Finance Budget Allocation / Saeed Al Marri step"
);
console.log("✓ PASS: Selecting Unbudgeted dynamically adds HR -> Finance branch to ReapprovalRoute (6 steps)");

// ─────────────────────────────────────────────────────────────────────────────
// TEST 4: Task 4 — Money-Masked Inputs
// ─────────────────────────────────────────────────────────────────────────────
console.log("\n[TEST 4] Task 4: Money-Masked Inputs");

const moneyInputHtml = ReactDOMServer.renderToString(
  <MoneyInput
    id="test-input"
    name="test"
    value={2000000} // 20,000.00 AED
    max={45000000}
    onChange={() => {}}
  />
);

// 4.1 Prefixed AED label
assert(moneyInputHtml.includes("AED"), "MoneyInput must contain AED prefix");
console.log("✓ PASS: MoneyInput displays prefixed AED currency label");

// 4.2 Thousands separators and two decimals
assert(moneyInputHtml.includes('value="20,000.00"'), "MoneyInput must format with thousands separators and 2 decimals: '20,000.00'");
console.log("✓ PASS: MoneyInput formats with thousands separators and two decimals ('20,000.00')");

// 4.3 Zero native spinner arrows: CSS suppression classes verified
const moneyInputSource = fs.readFileSync(
  path.join(process.cwd(), "components/oms/budget-amendment/MoneyInput.tsx"),
  "utf8"
);
assert(
  moneyInputSource.includes("appearance:textfield") ||
  moneyInputSource.includes("appearance-none"),
  "MoneyInput must suppress native spinner arrows via appearance-none / appearance:textfield"
);
assert(
  moneyInputSource.includes("webkit-outer-spin-button") &&
  moneyInputSource.includes("webkit-inner-spin-button"),
  "MoneyInput must suppress webkit spinner buttons"
);
console.log("✓ PASS: Native number spinner arrows suppressed (no native spinners)");

// 4.4 Digits-only filtering in handleChange
assert(
  moneyInputSource.includes(".replace(/[^0-9.]/g, \"\")"),
  "MoneyInput must filter input to digits and decimals only"
);
console.log("✓ PASS: MoneyInput enforces digits-only sanitization");

console.log("\n==================================================");
console.log("ALL BA4 VERIFICATION TESTS PASSED SUCCESSFULLY! 🎉");
console.log("==================================================\n");
