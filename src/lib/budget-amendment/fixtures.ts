/**
 * Candidate Budget Amendment — Mock Fixtures
 *
 * FOUR comprehensive fixtures exercising:
 *  a) Reference case (FIXTURE_AMENDMENT_REFERENCE):
 *     OMS-2026-0148, C-009, Senior Cybersecurity Analyst.
 *     Approved 31000000, qualified 33000000, shortfall 2000000, variance 6.45%.
 *     Two budget lines:
 *       - Cybersecurity Services FY2026 (available 45000000)
 *       - Digital Transformation FY2026 (available 17000000)
 *     5-step reapproval route. 24 days remaining on the original request.
 *  b) UNBUDGETED route selected (FIXTURE_AMENDMENT_UNBUDGETED):
 *     Route UNBUDGETED with no available lines, gaining the HR-then-Finance branch.
 *  c) Submit blocked by insufficient allocation (FIXTURE_AMENDMENT_INSUFFICIENT_ALLOCATION):
 *     Allocated 500000 vs shortfall 2000000 -> shortfallRemaining 1500000, balanced: false.
 *  d) Deadline CRITICAL (FIXTURE_AMENDMENT_DEADLINE_CRITICAL):
 *     2 days remaining, severity CRITICAL (triggers red urgency banner).
 *
 * CRITICAL ARCHITECTURAL INVARIANT 1 — SIGN CONVENTION:
 *   Cost increases are POSITIVE; remaining-budget changes are NEGATIVE.
 *
 * CRITICAL ARCHITECTURAL INVARIANT 2 — MONETARY VALUES:
 *   All monetary amounts are strictly integers in minor units (fils: 1 AED = 100 fils).
 */

import {
  BudgetAmendmentWorkspace,
  FundingRouteOption,
  ReapprovalRouteStep,
  AmendmentPreviewResponse,
  AmendmentAllocationInput,
  FundingRouteCode,
} from "@/src/types/budget-amendment";

// ─────────────────────────────────────────────────────────────────────────────
// Shared Reference Funding Routes
// ─────────────────────────────────────────────────────────────────────────────

export const REFERENCE_FUNDING_ROUTES: FundingRouteOption[] = [
  {
    code: "BUDGETED",
    label: "Budgeted",
    consequence: "Draw from your department's open budget lines.",
    availableLines: [
      {
        lineId: "line-cs-001",
        code: "CS-DIG-001",
        name: "Cybersecurity Services FY2026",
        available: 45000000, // AED 450,000.00
      },
      {
        lineId: "line-cs-002",
        code: "CS-DIG-002",
        name: "Digital Transformation FY2026",
        available: 17000000, // AED 170,000.00
      },
      {
        lineId: "line-cs-003",
        code: "CS-DIG-003",
        name: "Cloud Security Operations FY2026",
        available: 85000000, // AED 850,000.00
      },
    ],
  },
  {
    code: "UNALLOCATED",
    label: "Unallocated",
    consequence:
      "Draw from funds not yet assigned to any line. Per RFP: department may select relevant unallocated pool(s).",
    availableLines: [
      {
        lineId: "line-unalloc-001",
        code: "UNALLOC-DIG-2026",
        name: "Department Unallocated Pool FY2026",
        available: 25000000, // AED 250,000.00
      },
    ],
  },
  {
    code: "UNBUDGETED",
    label: "Unbudgeted",
    consequence:
      "HR reviews this first. If they approve, Finance selects or creates the funding line. Only then does this continue to procurement.",
    availableLines: [],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Shared 5-Step Reapproval Route (Standard Requisition Hierarchy)
// ─────────────────────────────────────────────────────────────────────────────

export const REFERENCE_5_STEP_REAPPROVAL_ROUTE: ReapprovalRouteStep[] = [
  {
    stage: "REQUESTOR",
    user: {
      name: "Tariq Mansoor",
      userId: "usr-tariq-01",
      email: "tariq.mansoor@diez.ae",
    },
    role: "Requester",
    status: "CURRENT",
    rejectionConsequence:
      "Cancelling or withdrawing closes this amendment. Candidate remains Qualified pending budget.",
  },
  {
    stage: "LINE_MANAGER",
    user: {
      name: "Omar Al Hashmi",
      userId: "usr-omar-02",
      email: "omar.alhashmi@diez.ae",
    },
    role: "Line Manager",
    status: "PENDING",
    rejectionConsequence:
      "Rejection at this stage closes this candidate's path and releases reserved funds.",
  },
  {
    stage: "SECTION_HEAD",
    user: {
      name: "Fatima Al Zaabi",
      userId: "usr-fatima-03",
      email: "fatima.alzaabi@diez.ae",
    },
    role: "Section Head",
    status: "PENDING",
    rejectionConsequence:
      "Rejection at this stage closes this candidate's path and releases reserved funds.",
  },
  {
    stage: "HOD",
    user: {
      name: "Khalid Al Suwaidi",
      userId: "usr-khalid-04",
      email: "khalid.alsuwaidi@diez.ae",
    },
    role: "Department Head",
    status: "PENDING",
    rejectionConsequence:
      "Rejection by Department Head closes this candidate's path and releases reserved funds.",
  },
  {
    stage: "HR",
    user: {
      name: "Maryam Al Nuaimi",
      userId: "usr-maryam-05",
      email: "maryam.alnuaimi@diez.ae",
    },
    role: "HR Review",
    status: "PENDING",
    rejectionConsequence:
      "Rejection by HR closes this candidate's path and cancels the onboarding notification.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Shared 6-Step Reapproval Route with HR-then-Finance Branch (Unbudgeted)
// ─────────────────────────────────────────────────────────────────────────────

export const UNBUDGETED_6_STEP_REAPPROVAL_ROUTE: ReapprovalRouteStep[] = [
  {
    stage: "REQUESTOR",
    user: {
      name: "Tariq Mansoor",
      userId: "usr-tariq-01",
    },
    role: "Requester",
    status: "CURRENT",
    rejectionConsequence:
      "Cancelling closes this amendment. Candidate remains Qualified pending budget.",
  },
  {
    stage: "LINE_MANAGER",
    user: {
      name: "Omar Al Hashmi",
      userId: "usr-omar-02",
    },
    role: "Line Manager",
    status: "PENDING",
    rejectionConsequence:
      "Rejection closes this candidate's path and releases reserved funds.",
  },
  {
    stage: "SECTION_HEAD",
    user: {
      name: "Fatima Al Zaabi",
      userId: "usr-fatima-03",
    },
    role: "Section Head",
    status: "PENDING",
    rejectionConsequence:
      "Rejection closes this candidate's path and releases reserved funds.",
  },
  {
    stage: "HOD",
    user: {
      name: "Khalid Al Suwaidi",
      userId: "usr-khalid-04",
    },
    role: "Department Head",
    status: "PENDING",
    rejectionConsequence:
      "Rejection closes this candidate's path and releases reserved funds.",
  },
  {
    stage: "HR",
    user: {
      name: "Maryam Al Nuaimi",
      userId: "usr-maryam-05",
    },
    role: "HR Review & Endorsement",
    status: "PENDING",
    rejectionConsequence:
      "HR rejection terminates the unbudgeted request. Procurement will not proceed.",
  },
  {
    stage: "FINANCE",
    user: {
      name: "Saeed Al Marri",
      userId: "usr-saeed-06",
    },
    role: "Finance Budget Allocation",
    status: "PENDING",
    rejectionConsequence:
      "Finance rejection terminates unbudgeted request. No new budget line will be created.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// FIXTURE A: Reference Case (OMS-2026-0148, C-009)
// ─────────────────────────────────────────────────────────────────────────────

export const FIXTURE_AMENDMENT_REFERENCE: BudgetAmendmentWorkspace = {
  amendmentId: "amd-2026-0089",
  requestId: "OMS-2026-0148",
  candidateRef: "C-009",
  position: "Senior Cybersecurity Analyst",
  triggeredBy: {
    event: "CANDIDATE_QUALIFIED",
    at: "2026-08-12T11:46:00Z",
    evaluationId: "eval-2026-0042",
  },

  canAct: true,
  readOnlyReason: null,

  cost: {
    approved: 31000000, // AED 310,000.00
    qualified: 33000000, // AED 330,000.00
    shortfall: 2000000, // AED 20,000.00
    variancePercent: 6.45,
    status: "OVER_BUDGET",
  },

  fundingRoutes: REFERENCE_FUNDING_ROUTES,
  reapprovalRoute: REFERENCE_5_STEP_REAPPROVAL_ROUTE,
  unbudgetedReapprovalRoute: UNBUDGETED_6_STEP_REAPPROVAL_ROUTE,
  genericRejectionConsequence:
    "A rejection at any stage closes this candidate's path and releases reserved funds.",

  deadline: {
    closesAt: "2026-09-05T23:59:59Z",
    daysRemaining: 24,
    severity: "NORMAL",
  },

  cancelConsequence:
    "Cancelling reverts Candidate C-009 to Qualified, pending budget. No funds are moved.",

  draft: {
    fundingRoute: "BUDGETED",
    allocations: [
      {
        lineId: "line-cs-001",
        amount: 2000000, // AED 20,000.00 covering the shortfall
      },
    ],
    justification:
      "Market rate for Senior Cybersecurity Analyst with 9+ years experience exceeds initial requisition budget by 6.45%. Candidate demonstrated rare SIEM & threat hunting capabilities critical for the Q4 cybersecurity posture initiative.",
    attachmentIds: ["att-market-rate-01"],
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// FIXTURE B: UNBUDGETED Route Selected (HR-then-Finance Branch)
// ─────────────────────────────────────────────────────────────────────────────

export const FIXTURE_AMENDMENT_UNBUDGETED: BudgetAmendmentWorkspace = {
  ...FIXTURE_AMENDMENT_REFERENCE,
  amendmentId: "amd-2026-0090",
  reapprovalRoute: UNBUDGETED_6_STEP_REAPPROVAL_ROUTE,
  draft: {
    fundingRoute: "UNBUDGETED",
    allocations: [], // Server requirement 6: Unbudgeted accepts no allocations
    justification:
      "Digital Security department has committed all open FY2026 budget lines for contracted vendors. Requesting unbudgeted allocation endorsement from HR and creation of an ad-hoc line by Finance to complete onboarding.",
    attachmentIds: ["att-business-case-02"],
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// FIXTURE C: Submit Blocked by Insufficient Allocation (shortfallRemaining > 0)
// ─────────────────────────────────────────────────────────────────────────────

export const FIXTURE_AMENDMENT_INSUFFICIENT_ALLOCATION: BudgetAmendmentWorkspace = {
  ...FIXTURE_AMENDMENT_REFERENCE,
  amendmentId: "amd-2026-0091",
  draft: {
    fundingRoute: "BUDGETED",
    allocations: [
      {
        lineId: "line-cs-001",
        amount: 500000, // AED 5,000.00 allocated vs AED 20,000.00 needed
      },
    ],
    justification:
      "Partial allocation identified so far from open line CS-DIG-001. Additional lines under review.",
    attachmentIds: [],
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// FIXTURE D: Deadline CRITICAL (2 days remaining)
// ─────────────────────────────────────────────────────────────────────────────

export const FIXTURE_AMENDMENT_DEADLINE_CRITICAL: BudgetAmendmentWorkspace = {
  ...FIXTURE_AMENDMENT_REFERENCE,
  amendmentId: "amd-2026-0092",
  deadline: {
    closesAt: "2026-08-14T23:59:59Z",
    daysRemaining: 2,
    severity: "CRITICAL",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Fixture Registry Map
// ─────────────────────────────────────────────────────────────────────────────

export const MOCK_BUDGET_AMENDMENT_FIXTURES: Record<
  string,
  BudgetAmendmentWorkspace
> = {
  "reference": FIXTURE_AMENDMENT_REFERENCE,
  "unbudgeted": FIXTURE_AMENDMENT_UNBUDGETED,
  "insufficient": FIXTURE_AMENDMENT_INSUFFICIENT_ALLOCATION,
  "critical": FIXTURE_AMENDMENT_DEADLINE_CRITICAL,

  // Direct composite key matches
  "OMS-2026-0148-amd-2026-0089": FIXTURE_AMENDMENT_REFERENCE,
  "OMS-2026-0148-amd-2026-0090": FIXTURE_AMENDMENT_UNBUDGETED,
  "OMS-2026-0148-amd-2026-0091": FIXTURE_AMENDMENT_INSUFFICIENT_ALLOCATION,
  "OMS-2026-0148-amd-2026-0092": FIXTURE_AMENDMENT_DEADLINE_CRITICAL,
  "OMS-2026-0148-C-009": FIXTURE_AMENDMENT_REFERENCE,
};

// ─────────────────────────────────────────────────────────────────────────────
// Server-Authoritative Preview Calculation Helper (Matches Server Invariant 1)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Computes an exact, server-authoritative preview calculation respecting Sign Rule Requirement 1:
 *  - Cost increase is POSITIVE (+)
 *  - Remaining budget decrease is NEGATIVE (−)
 */
export function computeMockAmendmentPreview(
  workspace: BudgetAmendmentWorkspace,
  fundingRoute: FundingRouteCode,
  allocations: AmendmentAllocationInput[]
): AmendmentPreviewResponse {
  const shortfall = workspace.cost.shortfall;
  const approved = workspace.cost.approved;
  const qualified = workspace.cost.qualified;

  // For UNBUDGETED route, HR & Finance determine funds; no direct line reductions
  if (fundingRoute === "UNBUDGETED") {
    return {
      revisedPosition: [
        {
          item: "Candidate allocation",
          current: approved,
          revised: qualified,
          change: qualified - approved, // Positive: cost increase (+2,000,000 fils)
        },
        {
          item: "Unbudgeted pool allocation (to be designated by Finance)",
          current: 0,
          revised: shortfall,
          change: -shortfall, // Negative: remaining unallocated pool decreases
        },
      ],
      balanced: true,
      totalAllocated: shortfall,
      shortfallRemaining: 0,
    };
  }

  // Find line details from the chosen funding route
  const routeOption = workspace.fundingRoutes.find((r) => r.code === fundingRoute);
  const linesMap = new Map(
    (routeOption?.availableLines || []).map((line) => [line.lineId, line])
  );

  let totalAllocated = 0;
  const revisedPosition = [
    {
      item: "Candidate allocation",
      current: approved,
      revised: qualified,
      change: qualified - approved, // Positive: cost increase (+2,000,000 fils)
    },
  ];

  for (const alloc of allocations) {
    if (!alloc.amount || alloc.amount <= 0) continue;
    totalAllocated += alloc.amount;

    const line = linesMap.get(alloc.lineId);
    const lineName = line ? line.name : `Budget line (${alloc.lineId})`;
    const currentAvailable = line ? line.available : 45000000;
    const revisedAvailable = Math.max(0, currentAvailable - alloc.amount);

    revisedPosition.push({
      item: `${lineName} balance`,
      current: currentAvailable,
      revised: revisedAvailable,
      change: -alloc.amount, // Negative: remaining budget decreases (-2,000,000 fils)
    });
  }

  // If no allocations entered yet, show the primary available line as reference
  if (allocations.length === 0 && (routeOption?.availableLines || []).length > 0) {
    const primaryLine = routeOption!.availableLines[0];
    revisedPosition.push({
      item: `${primaryLine.name} balance`,
      current: primaryLine.available,
      revised: primaryLine.available,
      change: 0,
    });
  }

  const shortfallRemaining = Math.max(0, shortfall - totalAllocated);
  const balanced = totalAllocated >= shortfall;

  return {
    revisedPosition,
    balanced,
    totalAllocated,
    shortfallRemaining,
  };
}

import { getAmendment, getRequisition } from "@/src/lib/demo-data";
import { mapToBudgetAmendmentWorkspace } from "./mappers";

/**
 * Demo-data backed Budget Amendment fixture.
 * Returns null if the amendment does not exist in demo-data (real 404).
 */
export function getBudgetAmendmentFixture(
  requestId: string,
  amendmentId: string,
  activeUserId?: string
): BudgetAmendmentWorkspace | null {
  if (!requestId || !amendmentId) return null;

  const req = getRequisition(requestId);
  if (!req) return null;

  const amd = getAmendment(amendmentId);
  if (!amd) return null;

  if (
    amd.id.toLowerCase() !== amendmentId.trim().toLowerCase() ||
    amd.requisitionId.toUpperCase() !== requestId.trim().toUpperCase()
  ) {
    return null;
  }

  return mapToBudgetAmendmentWorkspace(amd, req, activeUserId);
}

