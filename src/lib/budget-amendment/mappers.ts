/**
 * Candidate Budget Amendment Domain Mappers
 * Converts canonical Demo Data entities (Amendment, Requisition, BudgetLine)
 * into the BudgetAmendmentWorkspace API contract.
 */

import {
  BudgetAmendmentWorkspace,
  FundingRouteOption,
  ReapprovalRouteStep,
  AmendmentCostSummary,
  AmendmentDeadline,
  AmendmentTriggeredBy,
} from "@/src/types/budget-amendment";
import {
  Amendment,
  Requisition,
} from "@/src/lib/demo-data/entities";
import {
  getRequisition,
  listBudgetLines,
  getAmendment,
} from "@/src/lib/demo-data";

/**
 * Builds funding route options scoped to the requisition's department
 */
export function buildFundingRoutes(departmentId?: string): FundingRouteOption[] {
  const deptId = departmentId || "dept-digital-security";
  const deptLines = listBudgetLines(deptId);

  const availableLines = deptLines.map((bl) => ({
    lineId: bl.id,
    code: bl.code,
    name: bl.name,
    available: bl.available,
  }));

  return [
    {
      code: "BUDGETED",
      label: "Budgeted",
      consequence: "Draw from your department's open budget lines.",
      availableLines,
    },
    {
      code: "UNALLOCATED",
      label: "Unallocated",
      consequence: "Draw from funds not yet assigned to any line. Per RFP: department may select relevant unallocated pool(s).",
      availableLines: [
        {
          lineId: "line-unalloc-001",
          code: "UNALLOC-DIG-2026",
          name: "Department Unallocated Pool FY2026",
          available: 25000000,
        },
      ],
    },
    {
      code: "UNBUDGETED",
      label: "Unbudgeted",
      consequence: "HR reviews this first. If they approve, Finance selects or creates the funding line. Only then does this continue to procurement.",
      availableLines: [],
    },
  ];
}

/**
 * Maps canonical Amendment and Requisition to BudgetAmendmentWorkspace
 */
export function mapToBudgetAmendmentWorkspace(
  amd: Amendment,
  requisition?: Requisition | null,
  activeUserId?: string
): BudgetAmendmentWorkspace {
  const req = requisition || getRequisition(amd.requisitionId);

  const cost: AmendmentCostSummary = {
    approved: amd.cost.approved,
    qualified: amd.cost.qualified,
    shortfall: amd.cost.shortfall,
    variancePercent: amd.cost.variancePercent,
    status: amd.cost.status,
  };

  const triggeredBy: AmendmentTriggeredBy = {
    event: amd.triggeredBy.event,
    at: amd.triggeredBy.at,
    evaluationId: amd.triggeredBy.evaluationId,
  };

  const isFinanceActive = activeUserId === "usr-rashid-m";

  // Reapproval route strictly shows Omar Al Hashmi as Line Manager (Task 3 requirement)
  // When viewed by Rashid Al Mansoori (Finance Manager), the route advances to Finance
  const reapprovalRoute: ReapprovalRouteStep[] = [
    {
      stage: "LINE_MANAGER",
      user: {
        name: "Omar Al Hashmi",
        userId: "usr-omar",
        email: "omar.alhashmi@diez.ae",
      },
      role: "Line Manager",
      status: isFinanceActive ? "COMPLETED" : "CURRENT",
      rejectionConsequence: "Closes this candidate's path and releases reserved funds.",
    },
    {
      stage: "SECTION_HEAD",
      user: {
        name: "Fatima Al Marri",
        userId: "usr-fatima",
        email: "fatima.almarri@diez.ae",
      },
      role: "Section Head",
      status: isFinanceActive ? "COMPLETED" : "PENDING",
      rejectionConsequence: "Rejects amendment and returns to Line Manager.",
    },
    {
      stage: "HOD",
      user: {
        name: "Khalid Al Suwaidi",
        userId: "usr-khalid",
        email: "khalid.alsuwaidi@diez.ae",
      },
      role: "Head of Department",
      status: isFinanceActive ? "COMPLETED" : "PENDING",
      rejectionConsequence: "Rejects amendment back to section level.",
    },
    {
      stage: "FINANCE",
      user: {
        name: "Rashid Al Mansoori",
        userId: "usr-rashid-m",
        email: "rashid.almansoori@diez.ae",
      },
      role: "Finance Manager",
      status: isFinanceActive ? "CURRENT" : "PENDING",
      rejectionConsequence: "Declines budget re-allocation.",
    },
  ];

  const deadline: AmendmentDeadline = {
    closesAt: amd.deadline?.closesAt || "2026-09-11T23:59:59Z",
    daysRemaining: amd.deadline?.daysRemaining ?? 2,
    severity: amd.deadline?.severity || "WARNING",
  };

  const fundingRoutes = buildFundingRoutes(req?.departmentId);

  return {
    amendmentId: amd.id,
    requestId: amd.requisitionId,
    candidateRef: amd.candidateRef,
    position: amd.positionTitle || req?.positionTitle || "Senior Cybersecurity Analyst",
    triggeredBy,

    canAct: true,
    readOnlyReason: null,

    cost,
    fundingRoutes,
    reapprovalRoute,
    deadline,

    cancelConsequence:
      "Cancelling releases any reserved funds back to the selected line. Candidate evaluation remains qualified but unfunded.",

    draft: {
      fundingRoute: amd.fundingRoute,
      allocations: amd.selectedLines.map((l) => ({
        lineId: l.lineId,
        amount: l.drawdownAmount,
      })),
      justification: amd.justification,
      attachmentIds: [],
    },
  };
}
