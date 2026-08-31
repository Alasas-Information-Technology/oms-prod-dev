import {
  ApprovalTaskDetail,
  ApprovalTaskSummary,
  UserSummary,
} from "../types/approval.types";

const mockUsers: Record<string, UserSummary> = {
  khalid: { id: "u-101", name: "Khalid Al Suwaidi", email: "khalid@diez.ae" },
  fatima: { id: "u-102", name: "Fatima Al Hashimi", email: "fatima@diez.ae" },
  omar: { id: "u-103", name: "Omar Tariq", email: "omar@diez.ae" },
  sarah: { id: "u-104", name: "Sarah Connor", email: "sarah@diez.ae" },
  ali: { id: "u-105", name: "Ali Saeed", email: "ali@diez.ae" },
};

export const createRequisitionTaskSummary = (
  overrides?: Partial<ApprovalTaskSummary>
): ApprovalTaskSummary => ({
  approvalTaskId: "tsk-99201",
  type: "REQUISITION",
  subjectId: "req-1029",
  subjectRef: "OMS-2026-0148",
  title: "Senior Cybersecurity Analyst",
  context: "Digital Security Department",
  stage: { code: "HOD", label: "HOD Approval", index: 4, total: 6 },
  assignment: { mode: "NAMED", assignedUserId: mockUsers.khalid.id, claimedBy: null },
  actingFor: null,
  amount: 62000000,
  currency: "AED",
  submittedAt: "2026-08-04T09:18:00Z",
  assignedAt: "2026-08-05T10:06:00Z",
  sla: { dueAt: "2026-09-04T10:06:00Z", daysRemaining: 22, breached: false },
  priority: "NORMAL",
  ...overrides,
});

export const baseApprovalDetail: ApprovalTaskDetail = {
  task: createRequisitionTaskSummary(),
  canAct: true,
  actingFor: null,
  readOnlyReason: null,
  route: [
    { index: 1, code: "REQUESTOR", label: "Requestor", state: "COMPLETE", user: mockUsers.omar, at: "2026-08-04T09:18:00Z" },
    { index: 2, code: "LINE_MANAGER", label: "Line Manager", state: "COMPLETE", user: mockUsers.fatima, at: "2026-08-04T14:42:00Z" },
    { index: 3, code: "SECTION_HEAD", label: "Section Head", state: "COMPLETE", user: mockUsers.sarah, at: "2026-08-05T10:06:00Z" },
    { index: 4, code: "HOD", label: "HOD", state: "CURRENT", user: mockUsers.khalid },
    { index: 5, code: "HR_REVIEW", label: "HR Review", state: "PENDING" },
    { index: 6, code: "PROCUREMENT", label: "Procurement", state: "PENDING" },
  ],
  subject: {
    requestId: "OMS-2026-0148",
    position: "Senior Cybersecurity Analyst",
    department: { id: "dept-10", name: "Digital Security" },
    resources: 2,
    engagementMonths: 12,
    workLocation: "DIEZ_PREMISES",
    expectedStart: "2026-09-01",
    salaryGrade: "G8",
    candidateRoute: "UNKNOWN",
    justification: "Critical hire required to fulfill Q3 compliance requirements and establish the new threat response unit.",
    evidence: {
      jobDescriptionAttached: true,
      supportingDocumentCount: 3,
      adHierarchyVerified: true,
    },
    attachments: [
      { id: "att-1", name: "JD_Senior_Cybersec_Analyst.pdf", sizeBytes: 1450000, uploadedAt: "2026-08-04T09:15:00Z" },
    ],
  },
  history: [
    { user: mockUsers.omar, action: "SUBMITTED", comment: "Request submitted for approval.", at: "2026-08-04T09:18:00Z" },
    { user: mockUsers.fatima, action: "APPROVE", stage: "LINE_MANAGER", comment: "Approved against Q3 cybersecurity expansion budget.", at: "2026-08-04T14:42:00Z" },
    { user: mockUsers.sarah, action: "APPROVE", stage: "SECTION_HEAD", comment: "Approved.", at: "2026-08-05T10:06:00Z" },
  ],
  impact: {
    fundingRoute: "BUDGETED",
    requested: 62000000,
    availableBefore: 124000000,
    reservedNow: 62000000,
    remainingAfter: 62000000,
    currency: "AED",
    allocations: [
      { budgetLineId: "bl-001", code: "CS-DIG-001", name: "Cybersecurity Services FY2026", amount: 40000000 },
      { budgetLineId: "bl-002", code: "CS-DIG-002", name: "Digital Transformation FY2026", amount: 22000000 },
    ],
    fundStateTransition: { from: "RESERVED", to: "LOCKED_ALLOCATED" },
    periodOpen: true,
  },
  preflight: {
    checks: [
      { code: "BUDGET_AVAILABILITY", label: "Budget availability", state: "PASSED" },
      { code: "APPROVAL_ROUTE", label: "Approval route", state: "VERIFIED" },
      { code: "SEGREGATION_OF_DUTIES", label: "Segregation of duties", state: "PASSED" },
      { code: "PERIOD_OPEN", label: "Budget period open", state: "PASSED" },
    ],
    allPassed: true,
    blockingMessage: null,
  },
  availableActions: ["APPROVE", "SEND_BACK", "REJECT"],
};

export const MOCK_APPROVAL_FIXTURES = {
  // Baseline matching reference data exactly
  baseline: baseApprovalDetail,

  // 4-step route, no section head
  fourStepRoute: {
    ...baseApprovalDetail,
    task: createRequisitionTaskSummary({
      stage: { code: "HOD", label: "HOD Approval", index: 3, total: 4 },
    }),
    route: [
      { index: 1, code: "REQUESTOR", label: "Requestor", state: "COMPLETE", user: mockUsers.omar, at: "2026-08-04T09:18:00Z" },
      { index: 2, code: "LINE_MANAGER", label: "Line Manager", state: "COMPLETE", user: mockUsers.fatima, at: "2026-08-04T14:42:00Z" },
      { index: 3, code: "HOD", label: "HOD", state: "CURRENT", user: mockUsers.khalid },
      { index: 4, code: "HR_REVIEW", label: "HR Review", state: "PENDING" },
    ],
  },

  // Role queue task
  roleQueue: {
    ...baseApprovalDetail,
    task: createRequisitionTaskSummary({
      stage: { code: "HR_REVIEW", label: "HR Review", index: 5, total: 6 },
      assignment: { mode: "ROLE_QUEUE", assignedUserId: null, claimedBy: null },
    }),
    route: [
      { index: 1, code: "REQUESTOR", label: "Requestor", state: "COMPLETE", user: mockUsers.omar, at: "2026-08-04T09:18:00Z" },
      { index: 2, code: "LINE_MANAGER", label: "Line Manager", state: "COMPLETE", user: mockUsers.fatima, at: "2026-08-04T14:42:00Z" },
      { index: 3, code: "SECTION_HEAD", label: "Section Head", state: "COMPLETE", user: mockUsers.sarah, at: "2026-08-05T10:06:00Z" },
      { index: 4, code: "HOD", label: "HOD", state: "COMPLETE", user: mockUsers.khalid, at: "2026-08-06T10:06:00Z" },
      { index: 5, code: "HR_REVIEW", label: "HR Review", state: "CURRENT" },
      { index: 6, code: "PROCUREMENT", label: "Procurement", state: "PENDING" },
    ],
  },

  // Delegated task
  delegated: {
    ...baseApprovalDetail,
    task: createRequisitionTaskSummary({
      actingFor: mockUsers.khalid,
    }),
    actingFor: mockUsers.khalid,
    route: [
      { index: 1, code: "REQUESTOR", label: "Requestor", state: "COMPLETE", user: mockUsers.omar, at: "2026-08-04T09:18:00Z" },
      { index: 2, code: "LINE_MANAGER", label: "Line Manager", state: "COMPLETE", user: mockUsers.fatima, at: "2026-08-04T14:42:00Z" },
      { index: 3, code: "SECTION_HEAD", label: "Section Head", state: "COMPLETE", user: mockUsers.sarah, at: "2026-08-05T10:06:00Z" },
      { index: 4, code: "HOD", label: "HOD (Delegated to Ali)", state: "CURRENT", user: mockUsers.ali },
      { index: 5, code: "HR_REVIEW", label: "HR Review", state: "PENDING" },
      { index: 6, code: "PROCUREMENT", label: "Procurement", state: "PENDING" },
    ],
  },

  // Breached SLA task
  breachedSla: {
    ...baseApprovalDetail,
    task: createRequisitionTaskSummary({
      sla: { dueAt: "2026-08-05T10:06:00Z", daysRemaining: -2, breached: true },
    }),
  },

  // Failing preflight task
  failingPreflight: {
    ...baseApprovalDetail,
    canAct: false,
    readOnlyReason: "PREFLIGHT_FAILED",
    availableActions: [],
    preflight: {
      checks: [
        { code: "BUDGET_AVAILABILITY", label: "Budget availability", state: "FAILED" },
        { code: "APPROVAL_ROUTE", label: "Approval route", state: "VERIFIED" },
        { code: "SEGREGATION_OF_DUTIES", label: "Segregation of duties", state: "PASSED" },
        { code: "PERIOD_OPEN", label: "Budget period open", state: "PASSED" },
      ],
      allPassed: false,
      blockingMessage: "Insufficient funds available. A recent budget transfer reduced the available amount below the requested AED 620,000.",
    },
  },
};
