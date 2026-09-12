import React from "react";
import ReactDOMServer from "react-dom/server";
import fs from "fs";
import path from "path";
import { WhyNeededPanel } from "../components/oms/budget-amendment/WhyNeededPanel";
import { RevisedBudgetPositionPanel } from "../components/oms/budget-amendment/RevisedBudgetPositionPanel";
import { BudgetAmendmentWorkspace } from "../components/oms/budget-amendment/BudgetAmendmentWorkspace";
import {
  FIXTURE_AMENDMENT_REFERENCE,
  FIXTURE_AMENDMENT_INSUFFICIENT_ALLOCATION,
  computeMockAmendmentPreview,
} from "../src/lib/budget-amendment/fixtures";
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

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${msg}`);
    process.exit(1);
  }
  console.log(`✓ PASS: ${msg}`);
}

async function runTests() {
  console.log("==================================================");
  console.log("BUDGET AMENDMENT — BA3 PANELS & SIGN FIX VERIFICATION");
  console.log("==================================================");

  // ─────────────────────────────────────────────────────────────────────────────
  // TASK 1: "Why this is needed" Panel Verification
  // ─────────────────────────────────────────────────────────────────────────────
  console.log("\n[TEST 1] Task 1: 'Why this is needed' Panel");

  const whyPanelHtml = ReactDOMServer.renderToString(
    React.createElement(WhyNeededPanel, {
      cost: FIXTURE_AMENDMENT_REFERENCE.cost,
      justification: "Senior candidate exceeds target band due to specialized OT/ICS security certs. Market benchmark attached confirms alignment.",
      onJustificationChange: () => {},
      attachments: [
        {
          id: "att-001",
          name: "Market_Rate_Comp.pdf",
          sizeBytes: 1240000,
          scanStatus: "VERIFIED",
        },
      ],
    })
  );

  // 1. Figures with T2 weight contrast (Exact, Never Abbreviated)
  assert(whyPanelHtml.includes("Approved"), "Panel displays 'Approved'");
  assert(whyPanelHtml.includes("310,000"), "Panel displays Approved integer 310,000");
  assert(whyPanelHtml.includes(".00"), "Panel displays exact decimals .00 (never abbreviated)");
  assert(whyPanelHtml.includes("Qualified"), "Panel displays 'Qualified'");
  assert(whyPanelHtml.includes("330,000"), "Panel displays Qualified integer 330,000");
  assert(whyPanelHtml.includes("Short by"), "Panel displays 'Short by'");
  assert(whyPanelHtml.includes("20,000"), "Panel displays Shortfall integer 20,000");

  // 2. Status Badge
  assert(whyPanelHtml.includes("Over budget by 6.45%"), "Panel displays 'Over budget by 6.45%' status badge");
  assert(whyPanelHtml.includes("text-destructive"), "Over budget badge is in red danger tone");

  // Status Badge when within budget
  const whyPanelWithinBudgetHtml = ReactDOMServer.renderToString(
    React.createElement(WhyNeededPanel, {
      cost: {
        approved: 33000000,
        qualified: 33000000,
        shortfall: 0,
        variancePercent: 0,
        status: "WITHIN_BUDGET",
      },
      justification: "Candidate aligned with approved band following renegotiation with agency.",
      onJustificationChange: () => {},
      attachments: [],
    })
  );
  assert(
    whyPanelWithinBudgetHtml.includes("Within budget after correction"),
    "When within budget, badge renders 'Within budget after correction'"
  );

  // 3. Justification Textarea & 40-character Live Counter
  assert(
    whyPanelHtml.includes("amendment-justification-input"),
    "Justification textarea has accessible ID"
  );
  assert(
    whyPanelHtml.includes("/ 40 min"),
    "Live counter displays minimum 40 character requirement"
  );

  // Short justification warning
  const whyPanelShortJustHtml = ReactDOMServer.renderToString(
    React.createElement(WhyNeededPanel, {
      cost: FIXTURE_AMENDMENT_REFERENCE.cost,
      justification: "Too short", // 9 chars
      onJustificationChange: () => {},
      attachments: [],
    })
  );
  assert(
    whyPanelShortJustHtml.includes("9 / 40 min"),
    "Live counter counts 9 / 40 min"
  );
  assert(
    whyPanelShortJustHtml.includes("Minimum 40 characters required (31 more needed to submit)"),
    "Displays warning stating exact number of characters needed"
  );

  // 4. Attachments via existing AttachmentList component
  assert(
    whyPanelHtml.includes("Market_Rate_Comp.pdf"),
    "AttachmentList renders Market_Rate_Comp.pdf"
  );
  assert(
    whyPanelHtml.includes("Clean") || whyPanelHtml.includes("Verified") || whyPanelHtml.includes("ShieldCheck") || whyPanelHtml.includes("lucide-shield-check"),
    "AttachmentList displays security scan verification status"
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // TASK 2: Revised Budget Position Table — FIX THE SIGN BUG
  // ─────────────────────────────────────────────────────────────────────────────
  console.log("\n[TEST 2] Task 2: Revised Budget Position Table — Sign Bug Fix");

  const previewBalanced = computeMockAmendmentPreview(
    FIXTURE_AMENDMENT_REFERENCE,
    "BUDGETED",
    [{ lineId: "line-cs-001", amount: 2000000 }]
  );

  const revisedTableHtml = ReactDOMServer.renderToString(
    React.createElement(RevisedBudgetPositionPanel, {
      revisedPosition: previewBalanced.revisedPosition,
      balanced: previewBalanced.balanced,
      shortfallRemaining: previewBalanced.shortfallRemaining,
    })
  );

  // Sign rule caption
  const requiredCaption = "Positive means an increase to cost. Negative means a decrease to what remains.";
  assert(
    revisedTableHtml.includes(requiredCaption),
    `Caption states rule exactly: '${requiredCaption}'`
  );

  // UNIT TEST ASSERTING THE SIGN FOR BOTH INCREASE AND DECREASE CASES
  console.log("\n  -> Unit Test: Explicitly checking increase and decrease rows");
  const candidateAllocationRow = previewBalanced.revisedPosition.find(
    (r) => r.item === "Candidate allocation"
  );
  const lineBalanceRow = previewBalanced.revisedPosition.find(
    (r) => r.item.toLowerCase().includes("balance")
  );

  assert(Boolean(candidateAllocationRow), "Candidate allocation row exists in preview");
  assert(Boolean(lineBalanceRow), "Line balance row exists in preview");

  // 1. Cost figure increasing: MUST be POSITIVE change
  assert(
    candidateAllocationRow!.current < candidateAllocationRow!.revised,
    "Candidate cost increases (310,000 -> 330,000)"
  );
  assert(
    candidateAllocationRow!.change === 2000000,
    "Candidate allocation change is strictly POSITIVE (+2,000,000 fils)"
  );
  assert(
    candidateAllocationRow!.change > 0,
    "Candidate allocation change > 0"
  );
  assert(
    revisedTableHtml.includes("+20,000.00"),
    "HTML table displays '+20,000.00' (NOT -20,000.00 as in broken reference)"
  );
  assert(
    revisedTableHtml.includes("text-amber-800") || revisedTableHtml.includes("text-amber-300"),
    "Positive cost increase change is shown in warning tone (amber)"
  );

  // 2. Remaining-budget figure decreasing: MUST be NEGATIVE change
  assert(
    lineBalanceRow!.current > lineBalanceRow!.revised,
    "Line balance decreases (450,000 -> 430,000)"
  );
  assert(
    lineBalanceRow!.change === -2000000,
    "Line balance change is strictly NEGATIVE (-2,000,000 fils)"
  );
  assert(
    lineBalanceRow!.change < 0,
    "Line balance change < 0"
  );
  assert(
    revisedTableHtml.includes("-20,000.00") || revisedTableHtml.includes("−20,000.00"),
    "HTML table displays '-20,000.00' (NOT +20,000.00 as in broken reference)"
  );
  assert(
    revisedTableHtml.includes("text-muted-foreground"),
    "Negative remaining-budget change is shown in neutral tone"
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // TASK 3: Balance Status & Zero Client Arithmetic
  // ─────────────────────────────────────────────────────────────────────────────
  console.log("\n[TEST 3] Task 3: Balance Status & Zero Client Arithmetic");

  // 1. Balanced Case
  assert(
    revisedTableHtml.includes("Balanced after amendment"),
    "When balanced is true, renders 'Balanced after amendment'"
  );
  assert(
    revisedTableHtml.includes("text-emerald-800") || revisedTableHtml.includes("text-emerald-300"),
    "Balanced status renders in success tone"
  );

  // 2. Shortfall / Insufficient Case
  const previewShort = computeMockAmendmentPreview(
    FIXTURE_AMENDMENT_INSUFFICIENT_ALLOCATION,
    "BUDGETED",
    [{ lineId: "line-cs-001", amount: 500000 }] // short by 15,000 AED
  );

  const revisedTableShortHtml = ReactDOMServer.renderToString(
    React.createElement(RevisedBudgetPositionPanel, {
      revisedPosition: previewShort.revisedPosition,
      balanced: previewShort.balanced,
      shortfallRemaining: previewShort.shortfallRemaining,
    })
  );

  assert(
    previewShort.balanced === false,
    "previewShort balanced is false"
  );
  assert(
    previewShort.shortfallRemaining === 1500000,
    "previewShort shortfallRemaining is 1,500,000 fils (AED 15,000.00)"
  );
  assert(
    revisedTableShortHtml.includes("Short by AED 15,000.00"),
    "When short, renders 'Short by AED 15,000.00' in danger tone"
  );
  assert(
    revisedTableShortHtml.includes("Submit blocked: Position is short"),
    "Displays warning stating 'Submit blocked: Position is short'"
  );

  // 3. GREP TEST: Assert zero client-side arithmetic on cost fields
  console.log("\n  -> Grep Test: Checking for client-side arithmetic in RevisedBudgetPositionPanel.tsx");
  const panelFilePath = path.join(
    __dirname,
    "../components/oms/budget-amendment/RevisedBudgetPositionPanel.tsx"
  );
  const fileContent = fs.readFileSync(panelFilePath, "utf-8");

  // Patterns that would indicate arithmetic on cost variables
  const forbiddenPatterns = [
    /revised\s*-\s*current/i,
    /current\s*-\s*revised/i,
    /approved\s*-\s*qualified/i,
    /qualified\s*-\s*approved/i,
    /shortfall\s*-\s*allocated/i,
    /\.cost\s*[-+*\/]/,
    /row\.change\s*=/i,
  ];

  for (const pattern of forbiddenPatterns) {
    const match = fileContent.match(pattern);
    assert(
      !match,
      `Zero client-side cost arithmetic: pattern ${pattern} not found in RevisedBudgetPositionPanel.tsx`
    );
  }
  console.log("✓ PASS: Zero client arithmetic confirmed via static code analysis!");

  // 4. Full Workspace Integration: Submit button is disabled when balance is short
  console.log("\n  -> Full Workspace Integration: Submit button disabled on short position");
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  const workspaceShortHtml = ReactDOMServer.renderToString(
    React.createElement(
      QueryClientProvider,
      { client: queryClient },
      React.createElement(
        AppRouterContext.Provider,
        { value: mockRouter as any },
        React.createElement(
          PageBarProvider,
          null,
          React.createElement(BudgetAmendmentWorkspace, {
            requestId: "OMS-2026-0148",
            amendmentId: "amd-2026-0091",
            initialData: FIXTURE_AMENDMENT_INSUFFICIENT_ALLOCATION,
          })
        )
      )
    )
  );

  assert(
    workspaceShortHtml.includes("disabled"),
    "Workspace submit action has disabled attribute when short"
  );

  console.log("\n==================================================");
  console.log("ALL BA3 VERIFICATION TESTS PASSED SUCCESSFULLY! 🎉");
  console.log("==================================================");
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
