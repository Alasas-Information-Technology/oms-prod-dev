import {
  IBudgetSummaryDto,
  BudgetSummaryQueryDto,
  IBudgetLineDto,
  IBudgetLinesResponseDto,
  IFundMovementsResponseDto,
  IBudgetPeriodDto,
  IBudgetRequestDto,
  IBudgetRequestsResponseDto,
  IBudgetSafeguardsResponseDto,
  IBudgetLinesQueryDto,
  IBudgetRequestsQueryDto,
} from "../types/budget.types";

/**
 * Budget Control Center — Reference Fixtures
 *
 * CRITICAL MONEY INVARIANT:
 * ALL MONETARY VALUES ARE INTEGERS IN MINOR UNITS (FILS). NEVER FLOATS.
 *
 * Reference Numbers:
 * - Total:      24.80M AED (2,480,000,000 fils)
 * - Available:  10.20M AED (1,020,000,000 fils, 41.1%)
 * - Reserved:    5.40M AED (  540,000,000 fils, 21.8%)
 * - Locked:      7.10M AED (  710,000,000 fils, 28.6%)
 * - Consumed:    2.10M AED (  210,000,000 fils,  8.5%)
 * Reconciles exactly: 1020000000 + 540000000 + 710000000 + 210000000 === 2480000000.
 */

// =============================================================================
// 1. Budget Summary Fixture
// =============================================================================

export const mockBudgetSummary: IBudgetSummaryDto = {
  periodId: "period-fy2026-001",
  periodCode: "FY2026",
  periodName: "Financial Year 2026",
  scopeLevel: "ORGANIZATION",
  orgUnitId: "dept-dig-002",
  orgUnitName: "Digital Transformation & Cybersecurity",
  totalFils: 2480000000, // AED 24.80M
  availableFils: 1020000000, // AED 10.20M
  reservedFils: 540000000, // AED 5.40M
  lockedFils: 710000000, // AED 7.10M
  consumedFils: 210000000, // AED 2.10M
  breakdown: {
    availablePercent: 41.1,
    reservedPercent: 21.8,
    lockedPercent: 28.6,
    consumedPercent: 8.5,
  },
  deltaAgainstPreviousPeriod: {
    totalDeltaFils: 180000000, // +AED 1.80M
    totalDeltaPercent: 7.8,
    availableDeltaFils: -50000000,
    consumedDeltaFils: 80000000,
  },
  isReconciled: true,
  lastOracleSyncAt: "2026-08-01T08:30:00.000Z",
  currency: "AED",
};

export function getMockBudgetSummaryResponse(
  query?: BudgetSummaryQueryDto & { search?: string }
): IBudgetSummaryDto {
  // If no filters are applied, return the reference organisation summary
  if (!query?.departmentId && !query?.businessUnitId && !query?.orgUnitId && !query?.search) {
    return mockBudgetSummary;
  }

  // Filter lines based on query
  let matchingLines = [...mockBudgetLines];
  if (query.search) {
    const s = query.search.toLowerCase();
    matchingLines = matchingLines.filter(
      (l) => l.code.toLowerCase().includes(s) || l.name.toLowerCase().includes(s)
    );
  }

  if (query?.departmentId) {
    const deptId = query.departmentId.toLowerCase();
    matchingLines = matchingLines.filter(
      (l) => l.departmentId.toLowerCase() === deptId || l.departmentName.toLowerCase().includes(deptId)
    );
  }

  // Calculate totals from matched lines
  let totalFils = matchingLines.reduce((acc, l) => acc + l.totalFils, 0);
  let availableFils = matchingLines.reduce((acc, l) => acc + l.availableFils, 0);
  let reservedFils = matchingLines.reduce((acc, l) => acc + l.reservedFils, 0);
  let lockedFils = matchingLines.reduce((acc, l) => acc + l.lockedFils, 0);
  let consumedFils = matchingLines.reduce((acc, l) => acc + l.consumedFils, 0);

  // Fallback if no matching lines found
  if (totalFils === 0) {
    totalFils = 680000000;
    availableFils = 320000000;
    reservedFils = 140000000;
    lockedFils = 180000000;
    consumedFils = 40000000;
  }

  // Precise breakdown calculation
  const total = Number(totalFils);
  const availablePercent = Number(((Number(availableFils) / total) * 100).toFixed(1));
  const reservedPercent = Number(((Number(reservedFils) / total) * 100).toFixed(1));
  const lockedPercent = Number(((Number(lockedFils) / total) * 100).toFixed(1));
  const consumedPercent = Number(((Number(consumedFils) / total) * 100).toFixed(1));

  const scopeLevel: "ORGANIZATION" | "BUSINESS_UNIT" | "DEPARTMENT" = query.departmentId
    ? "DEPARTMENT"
    : query.businessUnitId
    ? "BUSINESS_UNIT"
    : "ORGANIZATION";

  return {
    periodId: query.periodId || mockBudgetSummary.periodId,
    periodCode: "FY 2026",
    periodName: "Financial Year 2026",
    scopeLevel,
    orgUnitId: query.departmentId || query.businessUnitId || query.orgUnitId,
    orgUnitName: query.departmentId ? "Digital Transformation & Cybersecurity" : "Corporate Technology & Services",
    totalFils,
    availableFils,
    reservedFils,
    lockedFils,
    consumedFils,
    breakdown: {
      availablePercent,
      reservedPercent,
      lockedPercent,
      consumedPercent,
    },
    deltaAgainstPreviousPeriod: {
      totalDeltaFils: Math.round(totalFils * 0.05),
      totalDeltaPercent: 5.0,
      availableDeltaFils: -Math.round(availableFils * 0.02),
      consumedDeltaFils: Math.round(consumedFils * 0.08),
    },
    isReconciled: availableFils + reservedFils + lockedFils + consumedFils === totalFils,
    lastOracleSyncAt: "2026-08-01T08:30:00.000Z",
    currency: "AED",
  };
}

// =============================================================================
// 2. Budget Lines Fixtures
// =============================================================================

export const mockBudgetLines: IBudgetLineDto[] = [
  {
    id: "line-cs-dig-001",
    code: "CS-DIG-001",
    name: "Cybersecurity Operations & Threat Defense",
    periodId: "period-fy2026-001",
    departmentId: "dept-dig-002",
    departmentName: "Cybersecurity & Infosec",
    businessUnitName: "Corporate Technology",
    totalFils: 680000000, // AED 6.80M
    availableFils: 240000000, // AED 2.40M
    reservedFils: 120000000, // AED 1.20M
    lockedFils: 220000000, // AED 2.20M
    consumedFils: 100000000, // AED 1.00M
    status: "ACTIVE",
    isReconciled: true,
    lastReconciledAt: "2026-08-01T08:30:00.000Z",
    activeRequisitionsCount: 4,
  },
  {
    id: "line-cs-dig-002",
    code: "CS-DIG-002",
    name: "Digital Transformation & Cloud Platforms",
    periodId: "period-fy2026-001",
    departmentId: "dept-dig-002",
    departmentName: "Digital Transformation & Cybersecurity",
    businessUnitName: "Corporate Technology",
    totalFils: 1120000000, // AED 11.20M
    availableFils: 460000000, // AED 4.60M
    reservedFils: 280000000, // AED 2.80M
    lockedFils: 310000000, // AED 3.10M
    consumedFils: 70000000, // AED 0.70M
    status: "ACTIVE",
    isReconciled: true,
    lastReconciledAt: "2026-08-01T08:30:00.000Z",
    activeRequisitionsCount: 7,
  },
  {
    id: "line-cs-dig-003",
    code: "CS-DIG-003",
    name: "Enterprise Architecture & Technology Ops",
    periodId: "period-fy2026-001",
    departmentId: "dept-dig-002",
    departmentName: "Enterprise Applications",
    businessUnitName: "Corporate Technology",
    totalFils: 680000000, // AED 6.80M
    availableFils: 320000000, // AED 3.20M
    reservedFils: 140000000, // AED 1.40M
    lockedFils: 180000000, // AED 1.80M
    consumedFils: 40000000, // AED 0.40M
    status: "ACTIVE",
    isReconciled: true,
    lastReconciledAt: "2026-08-01T08:30:00.000Z",
    activeRequisitionsCount: 3,
  },
  {
    id: "line-cs-dig-004",
    code: "CS-DIG-004",
    name: "Data Analytics & AI Engineering",
    periodId: "period-fy2026-001",
    departmentId: "dept-dig-002",
    departmentName: "Digital Transformation & Cybersecurity",
    businessUnitName: "Corporate Technology",
    totalFils: 420000000, // AED 4.20M
    availableFils: 180000000, // AED 1.80M
    reservedFils: 80000000, // AED 0.80M
    lockedFils: 120000000, // AED 1.20M
    consumedFils: 40000000, // AED 0.40M
    status: "ACTIVE",
    isReconciled: true,
    lastReconciledAt: "2026-08-01T08:30:00.000Z",
    activeRequisitionsCount: 2,
  },
  {
    id: "line-cs-fin-001",
    code: "CS-FIN-001",
    name: "Financial Auditing & ERP Modernization",
    periodId: "period-fy2026-001",
    departmentId: "dept-fin-001",
    departmentName: "Finance & Accounting",
    businessUnitName: "Corporate Services",
    totalFils: 850000000, // AED 8.50M
    availableFils: 350000000, // AED 3.50M
    reservedFils: 180000000, // AED 1.80M
    lockedFils: 220000000, // AED 2.20M
    consumedFils: 100000000, // AED 1.00M
    status: "ACTIVE",
    isReconciled: true,
    lastReconciledAt: "2026-08-01T08:30:00.000Z",
    activeRequisitionsCount: 5,
  },
  {
    id: "line-cs-hr-001",
    code: "CS-HR-001",
    name: "Talent Acquisition & Executive Search",
    periodId: "period-fy2026-001",
    departmentId: "dept-hr-001",
    departmentName: "Human Capital Management",
    businessUnitName: "Corporate Services",
    totalFils: 380000000, // AED 3.80M
    availableFils: 120000000, // AED 1.20M
    reservedFils: 90000000, // AED 0.90M
    lockedFils: 110000000, // AED 1.10M
    consumedFils: 60000000, // AED 0.60M
    status: "ACTIVE",
    isReconciled: true,
    lastReconciledAt: "2026-08-01T08:30:00.000Z",
    activeRequisitionsCount: 2,
  },
  {
    id: "line-cs-ops-001",
    code: "CS-OPS-001",
    name: "Strategic Facilities & Office Infrastructure",
    periodId: "period-fy2026-001",
    departmentId: "dept-ops-001",
    departmentName: "Operations Management",
    businessUnitName: "Operations",
    totalFils: 520000000, // AED 5.20M
    availableFils: 190000000, // AED 1.90M
    reservedFils: 100000000, // AED 1.00M
    lockedFils: 150000000, // AED 1.50M
    consumedFils: 80000000, // AED 0.80M
    status: "ACTIVE",
    isReconciled: true,
    lastReconciledAt: "2026-08-01T08:30:00.000Z",
    activeRequisitionsCount: 1,
  },
];

export function getMockBudgetLinesResponse(
  query?: IBudgetLinesQueryDto
): IBudgetLinesResponseDto {
  let filtered = [...mockBudgetLines];

  if (query?.search) {
    const s = query.search.toLowerCase();
    filtered = filtered.filter(
      (l) =>
        l.code.toLowerCase().includes(s) ||
        l.name.toLowerCase().includes(s) ||
        l.departmentName.toLowerCase().includes(s)
    );
  }

  if (query?.departmentId) {
    const dId = query.departmentId.toLowerCase();
    filtered = filtered.filter(
      (l) => l.departmentId.toLowerCase() === dId || l.departmentName.toLowerCase().includes(dId)
    );
  }

  if (query?.businessUnitId) {
    const bu = query.businessUnitId.toLowerCase();
    filtered = filtered.filter(
      (l) => l.businessUnitName?.toLowerCase().includes(bu) || l.businessUnitName?.toLowerCase().includes("corporate")
    );
  }

  if (query?.status && query.status !== "ALL") {
    filtered = filtered.filter((l) => l.status === query.status);
  }

  // Sorting
  if (query?.sortBy) {
    const field = query.sortBy;
    const isAsc = query.sortOrder === "asc";
    filtered.sort((a, b) => {
      const aVal = a[field] ?? 0;
      const bVal = b[field] ?? 0;
      if (typeof aVal === "string" && typeof bVal === "string") {
        return isAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return isAsc ? Number(aVal) - Number(bVal) : Number(bVal) - Number(aVal);
    });
  }

  const page = query?.page || 1;
  const limit = query?.limit || 10;
  const startIndex = (page - 1) * limit;
  const pagedItems = filtered.slice(startIndex, startIndex + limit);

  return {
    items: pagedItems,
    meta: {
      page,
      limit,
      totalItems: filtered.length,
      totalPages: Math.ceil(filtered.length / limit) || 1,
      hasNextPage: startIndex + limit < filtered.length,
      hasPreviousPage: page > 1,
    },
  };
}

// =============================================================================
// 3. Fund Movements Stepper Fixtures
// =============================================================================

export const mockFundMovementsLine002: IFundMovementsResponseDto = {
  budgetLineId: "line-cs-dig-002",
  budgetLineCode: "CS-DIG-002",
  budgetLineName: "Digital Transformation Systems & Engineering",
  isLineSpecific: true,
  movements: [
    {
      id: "mov-001",
      stepNumber: 1,
      stepType: "SUBMITTED_RESERVED",
      label: "Requisition Submitted",
      description: "Funds reserved upon requisition submission",
      amountFils: 62000000, // AED 620,000.00
      fromState: "AVAILABLE",
      toState: "RESERVED",
      requestId: "req-0148",
      requestCode: "OMS-2026-0148",
      requisitionTitle: "Senior Cloud Infrastructure Architect",
      actorName: "Fatima Al Mansoori",
      actorRole: "Department Originator",
      timestamp: "2026-08-04T09:15:00.000Z",
      isCompleted: true,
    },
    {
      id: "mov-002",
      stepNumber: 2,
      stepType: "HOD_APPROVED_LOCKED",
      label: "HOD Approved & Locked",
      description: "Allocation locked upon departmental sign-off",
      amountFils: 62000000, // AED 620,000.00
      fromState: "RESERVED",
      toState: "LOCKED",
      requestId: "req-0148",
      requestCode: "OMS-2026-0148",
      requisitionTitle: "Senior Cloud Infrastructure Architect",
      actorName: "Dr. Tariq Al Humaidi",
      actorRole: "Head of Department (HOD)",
      timestamp: "2026-08-05T11:30:00.000Z",
      isCompleted: true,
    },
    {
      id: "mov-003",
      stepNumber: 3,
      stepType: "WORK_COMPLETED_CONSUMED",
      label: "Work Completion & Consumed",
      description: "Permanent consumption on timesheet & invoice clearance",
      amountFils: 62000000, // AED 620,000.00
      fromState: "LOCKED",
      toState: "CONSUMED",
      requestId: "req-0148",
      requestCode: "OMS-2026-0148",
      requisitionTitle: "Senior Cloud Infrastructure Architect",
      actorName: null,
      actorRole: null,
      timestamp: null,
      isCompleted: false,
    },
    {
      id: "mov-004",
      stepNumber: 4,
      stepType: "RELEASED",
      label: "Release Event / Reconciled",
      description: "Residual funds returned to Available balance upon contract closure",
      amountFils: 0,
      fromState: "LOCKED",
      toState: "AVAILABLE",
      requestId: "req-0148",
      requestCode: "OMS-2026-0148",
      requisitionTitle: "Senior Cloud Infrastructure Architect",
      actorName: null,
      actorRole: null,
      timestamp: null,
      isCompleted: false,
    },
  ],
};

export const mockDepartmentRecentMovements: IFundMovementsResponseDto = {
  budgetLineId: undefined,
  budgetLineCode: undefined,
  budgetLineName: undefined,
  isLineSpecific: false,
  movements: [
    {
      id: "mov-dept-001",
      stepNumber: 1,
      stepType: "HOD_APPROVED_LOCKED",
      label: "HOD Approved & Locked",
      description: "Allocation locked upon departmental sign-off",
      amountFils: 62000000, // AED 620k
      fromState: "RESERVED",
      toState: "LOCKED",
      requestId: "req-0148",
      requestCode: "OMS-2026-0148",
      requisitionTitle: "Senior Cloud Infrastructure Architect",
      actorName: "Dr. Tariq Al Humaidi",
      actorRole: "Head of Department (HOD)",
      timestamp: "2026-08-05T11:30:00.000Z",
      isCompleted: true,
    },
    {
      id: "mov-dept-002",
      stepNumber: 2,
      stepType: "SUBMITTED_RESERVED",
      label: "Requisition Submitted",
      description: "Funds reserved upon requisition submission",
      amountFils: 34000000, // AED 340k
      fromState: "AVAILABLE",
      toState: "RESERVED",
      requestId: "req-0151",
      requestCode: "OMS-2026-0151",
      requisitionTitle: "SOC Security Analyst Level 2",
      actorName: "Khalfan Al Suwaidi",
      actorRole: "Security Operations Lead",
      timestamp: "2026-08-05T09:40:00.000Z",
      isCompleted: true,
    },
    {
      id: "mov-dept-003",
      stepNumber: 3,
      stepType: "WORK_COMPLETED_CONSUMED",
      label: "Work Completion & Clearance",
      description: "Monthly contractor billing cleared",
      amountFils: 45000000, // AED 450k
      fromState: "LOCKED",
      toState: "CONSUMED",
      requestId: "req-0120",
      requestCode: "OMS-2026-0120",
      requisitionTitle: "Fullstack Systems Integrator",
      actorName: "Finance AP Automation",
      actorRole: "System Clearing",
      timestamp: "2026-08-01T15:20:00.000Z",
      isCompleted: true,
    },
  ],
};

// =============================================================================
// 4. Period Governance Fixture
// =============================================================================

export const mockBudgetPeriod: IBudgetPeriodDto = {
  id: "period-fy2026-001",
  code: "FY 2026",
  name: "Financial Year 2026",
  startDate: "2026-01-01T00:00:00.000Z",
  endDate: "2026-12-31T23:59:59.999Z",
  status: "OPEN",
  lastAmendedAt: "2026-08-01T11:05:00.000Z",
  threeLevelApproval: {
    isComplete: true,
    currentLevel: 3,
    totalLevels: 3,
    steps: [
      {
        level: 1,
        role: "Finance Analyst",
        roleDisplayName: "Finance Analyst Review",
        approverName: "Rashid Al Nuaimi",
        approverId: "user-fa-001",
        approvedAt: "2026-08-01T09:10:00.000Z",
        status: "APPROVED",
        comments: "Baseline allocations validated against departmental submissions.",
      },
      {
        level: 2,
        role: "Finance Manager",
        roleDisplayName: "Finance Manager Endorsement",
        approverName: "Muna Al Zarooni",
        approverId: "user-fm-002",
        approvedAt: "2026-08-01T10:25:00.000Z",
        status: "APPROVED",
        comments: "Endorsed with Q3 contingency reserves.",
      },
      {
        level: 3,
        role: "Finance HOD",
        roleDisplayName: "Finance HOD Executive Approval",
        approverName: "Dr. Hamad Al Mutawa",
        approverId: "user-fhod-003",
        approvedAt: "2026-08-01T11:05:00.000Z",
        status: "APPROVED",
        comments: "Authorized for operational execution.",
      },
    ],
  },
  reopenGovernanceRule: "Reopening a closed period requires the full three-level approval process.",
  canAmend: true,
  canClose: true,
  canReopen: false,
};

// =============================================================================
// 5. Requests & Exceptions Fixtures
// =============================================================================

export const mockBudgetRequests: IBudgetRequestDto[] = [
  {
    id: "req-0152",
    requestCode: "OMS-2026-0152",
    type: "UNBUDGETED",
    typeLabel: "Unbudgeted Request",
    description: "Emergency AI Security Compliance Audit Specialist",
    amountFils: 18500000, // AED 185,000.00
    status: "APPROVED",
    ownerName: "Khalfan Al Suwaidi",
    departmentName: "Information Security",
    requestedOn: "2026-08-03T14:20:00.000Z",
    budgetLineCode: "CS-DIG-001",
  },
  {
    id: "req-0146",
    requestCode: "OMS-2026-0146",
    type: "TOP_UP",
    typeLabel: "Budget Top-Up",
    description: "Extended contract for Cloud DevOps Consultant",
    amountFils: 9200000, // AED 92,000.00
    status: "AWAITING_APPROVAL",
    ownerName: "Sara Al Marzooqi",
    departmentName: "Digital Transformation",
    requestedOn: "2026-08-04T10:05:00.000Z",
    budgetLineCode: "CS-DIG-002",
  },
  {
    id: "req-0131",
    requestCode: "OMS-2026-0131",
    type: "EXCEPTION",
    typeLabel: "Reconciliation Exception",
    description: "Oracle ERP PO Variance on Rate Card reconciliation",
    amountFils: 450000, // AED 4,500.00
    status: "EXCEPTION",
    ownerName: "Finance Reconciliation Queue",
    departmentName: "Digital Transformation",
    requestedOn: "2026-08-05T08:12:00.000Z",
    budgetLineCode: "CS-DIG-002",
  },
  {
    id: "req-0141",
    requestCode: "OMS-2026-0141",
    type: "AMENDMENT",
    typeLabel: "Budget Amendment",
    description: "Inter-line reallocation from CS-DIG-003 to CS-DIG-002",
    amountFils: 15000000, // AED 150,000.00
    status: "APPROVED",
    ownerName: "Rashid Al Nuaimi",
    departmentName: "Corporate Technology",
    requestedOn: "2026-08-02T16:30:00.000Z",
    budgetLineCode: "CS-DIG-002",
  },
];

export function getMockBudgetRequestsResponse(
  query?: IBudgetRequestsQueryDto
): IBudgetRequestsResponseDto {
  let filtered = [...mockBudgetRequests];

  if (query?.type && query.type !== "ALL") {
    filtered = filtered.filter((r) => r.type === query.type);
  }

  if (query?.status && query.status !== "ALL") {
    filtered = filtered.filter((r) => r.status === query.status);
  }

  const page = query?.page || 1;
  const limit = query?.limit || 10;
  const startIndex = (page - 1) * limit;
  const pagedItems = filtered.slice(startIndex, startIndex + limit);

  return {
    summaryCounts: {
      unbudgetedCount: 3,
      topUpCount: 2,
      amendmentsCount: 4,
      exceptionsCount: 1,
    },
    items: pagedItems,
    meta: {
      page,
      limit,
      totalItems: filtered.length,
      totalPages: Math.ceil(filtered.length / limit) || 1,
      hasNextPage: startIndex + limit < filtered.length,
      hasPreviousPage: page > 1,
    },
  };
}

// =============================================================================
// 6. Safeguards Fixture
// =============================================================================

export const mockBudgetSafeguards: IBudgetSafeguardsResponseDto = {
  safeguards: [
    {
      id: "sg-double-spending",
      label: "Double-spending prevented",
      description: "Requisition locks funds immediately upon HOD approval",
      status: "ACTIVE",
      isHealthy: true,
    },
    {
      id: "sg-multiline-allocation",
      label: "Funds can come from several budget lines",
      description: "Cross-line split allocation permitted with individual line ledger tracking",
      status: "ACTIVE",
      isHealthy: true,
    },
    {
      id: "sg-period-validation",
      label: "Only open periods accept requests",
      description: "Closed financial periods strictly reject new fund reservations and amendments",
      status: "ACTIVE",
      isHealthy: true,
    },
    {
      id: "sg-auto-release",
      label: "Unused funds return automatically",
      description: "Rejected or cancelled requisitions restore reserved funds back to Available balance",
      status: "ACTIVE",
      isHealthy: true,
    },
    {
      id: "sg-oracle-sync",
      label: "Last checked against Oracle",
      description: "Automated system-of-record reconciliation with Oracle Financials Cloud",
      status: "ACTIVE",
      isHealthy: true,
      lastReconciledAt: "2026-08-05T08:30:00.000Z",
      syncBatchId: "ORCL-SYNC-20260805-01",
    },
  ],
};
