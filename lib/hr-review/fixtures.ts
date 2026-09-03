import {
  HrReviewQueueResponse,
  HrReviewDetailResponse,
} from "@/types/hr-review";

export const MOCK_HR_QUEUE: HrReviewQueueResponse = {
  items: [
    {
      requestId: "OMS-2026-0148",
      position: "Senior Cybersecurity Analyst",
      department: { id: "dept-1", name: "Digital Security" },
      ageDays: 1,
      sla: { targetDays: 3, dueAt: "2026-09-04T00:00:00Z", overdueDays: 0, breached: false },
      flags: ["BUDGET_VERIFIED", "NEW"],
      returnedFromClarification: false,
      amount: 62000000,
    },
    {
      requestId: "OMS-2026-0139",
      position: "Data Governance Specialist",
      department: { id: "dept-2", name: "Data Management" },
      ageDays: 5,
      sla: { targetDays: 3, dueAt: "2026-08-30T00:00:00Z", overdueDays: 2, breached: true },
      flags: ["BUDGET_VERIFIED"],
      returnedFromClarification: true,
      amount: 28500000,
    },
    {
      requestId: "OMS-2026-0128",
      position: "PMO Analyst",
      department: { id: "dept-3", name: "Project Management Office" },
      ageDays: 5,
      sla: { targetDays: 3, dueAt: "2026-08-30T00:00:00Z", overdueDays: 2, breached: true },
      flags: ["NEW"],
      returnedFromClarification: false,
      amount: 22000000,
    },
    {
      requestId: "OMS-2026-0143",
      position: "Cloud Engineer",
      department: { id: "dept-4", name: "IT Infrastructure" },
      ageDays: 3,
      sla: { targetDays: 3, dueAt: "2026-09-02T00:00:00Z", overdueDays: 0, breached: false },
      flags: ["BUDGET_VERIFIED", "NEW"],
      returnedFromClarification: false,
      amount: 31000000,
    },
    {
      requestId: "OMS-2026-0124",
      position: "Network Operations Engineer",
      department: { id: "dept-4", name: "IT Infrastructure" },
      ageDays: 2,
      sla: { targetDays: 3, dueAt: "2026-09-03T00:00:00Z", overdueDays: 0, breached: false },
      flags: ["BUDGET_VERIFIED"],
      returnedFromClarification: false,
      amount: 47500000,
    },
    {
      requestId: "OMS-2026-0119",
      position: "Procurement Category Specialist",
      department: { id: "dept-5", name: "Procurement" },
      ageDays: 1,
      sla: { targetDays: 3, dueAt: "2026-09-04T00:00:00Z", overdueDays: 0, breached: false },
      flags: ["BUDGET_VERIFIED", "NEW"],
      returnedFromClarification: false,
      amount: 24000000,
    },
  ],
  counts: { total: 12, overdue: 4, returned: 1 },
  slaTargetDays: 3,
};

// Fixture A: The reference case
export const MOCK_HR_DETAIL_REFERENCE: HrReviewDetailResponse = {
  request: {
    id: "OMS-2026-0148",
    position: "Senior Cybersecurity Analyst",
    badges: ["BUDGET_VERIFIED", "NEW"],
    resources: 2,
    engagementMonths: 12,
    expectedStart: "2026-09-01T00:00:00Z",
    grade: "G8",
    workLocation: "DIEZ Premises",
    candidateRoute: "Unknown candidates",
    justification: "Enhance cyber-risk monitoring, threat detection and incident response capability.",
  },
  canDecide: true,
  readOnlyReason: null,
  systemChecks: [
    { code: "JOB_PROFILE_ATTACHED", label: "Job profile attached", state: "PASSED", checkedAt: "2026-08-05T12:00:00Z", blocksApproval: true, failureReason: null },
    { code: "APPROVAL_ROUTE", label: "Approval route completed", state: "PASSED", checkedAt: "2026-08-05T12:00:00Z", blocksApproval: true, failureReason: null },
    { code: "BUDGET_AVAILABILITY", label: "Budget availability", state: "PASSED", checkedAt: "2026-08-05T12:00:00Z", blocksApproval: true, failureReason: null },
    { code: "SEGREGATION_OF_DUTIES", label: "Segregation of duties", state: "PASSED", checkedAt: "2026-08-05T12:00:00Z", blocksApproval: true, failureReason: null },
  ],
  hrConfirmations: [
    { code: "OUTSOURCING_SUITABLE", label: "Outsourcing is suitable for this role", confirmed: false, note: null, context: null },
    { code: "EMIRATISATION", label: "Emiratisation position considered", confirmed: false, note: null, context: { current: 34.2, target: 40.0, unit: "PERCENT" } },
    { code: "WORKFORCE_POLICY", label: "Complies with workforce policy", confirmed: false, note: null, context: null },
  ],
  budget: {
    approved: 62000000,
    reserved: 62000000,
    availableRemaining: 62000000,
    fundingRoute: "BUDGETED",
    verified: true,
    lines: [
      { code: "CS-DIG-001", name: "Cybersecurity Personnel", amount: 40000000 },
      { code: "CS-DIG-002", name: "Cybersecurity Operations", amount: 22000000 },
    ],
  },
  approvalTrail: [
    { stage: "REQUESTOR", label: "Submitted", user: { id: "u1", name: "Mariam Al Mansoori" }, at: "2026-08-04T09:18:00Z", comment: null },
    { stage: "LINE_MANAGER", label: "Approved", user: { id: "u2", name: "Omar Al Hashmi" }, at: "2026-08-04T14:42:00Z", comment: null },
    { stage: "SECTION_HEAD", label: "Approved", user: { id: "u3", name: "Fatima Al Marri" }, at: "2026-08-05T10:08:00Z", comment: null },
    { stage: "HOD", label: "Approved", user: { id: "u4", name: "Khalid Al Suwaidi" }, at: "2026-08-05T11:15:00Z", comment: null },
  ],
  clarificationContext: null,
  availableDecisions: ["APPROVE_OMS", "SEND_BACK", "PERMANENT_HIRE", "REJECT"],
  sendBackModes: ["MORE_INFO", "INFO_WITH_APPROVAL", "AMEND"],
  reapprovalRoute: [
    { stage: "LINE_MANAGER", user: { name: "Omar Al Hashmi" } },
    { stage: "SECTION_HEAD", user: { name: "Fatima Al Marri" } },
    { stage: "HOD", user: { name: "Khalid Al Suwaidi" } },
  ],
};

// Fixture B: Overdue
export const MOCK_HR_DETAIL_OVERDUE: HrReviewDetailResponse = {
  ...MOCK_HR_DETAIL_REFERENCE,
  request: {
    ...MOCK_HR_DETAIL_REFERENCE.request,
    id: "OMS-2026-0128",
    position: "PMO Analyst",
  },
};

// Fixture C: Returned from clarification
export const MOCK_HR_DETAIL_RETURNED: HrReviewDetailResponse = {
  ...MOCK_HR_DETAIL_REFERENCE,
  request: {
    ...MOCK_HR_DETAIL_REFERENCE.request,
    id: "OMS-2026-0139",
    position: "Data Governance Specialist",
    badges: ["BUDGET_VERIFIED", "RETURNED"],
  },
  clarificationContext: {
    hadClarification: true,
    askedAt: "2026-08-05T14:00:00Z",
    askedBy: { id: "u5", name: "HR Team" },
    askMessage: "Please clarify the data-governance deliverables.",
    respondedAt: "2026-08-06T09:00:00Z",
    respondedBy: { id: "u1", name: "Mariam Al Mansoori" },
    fieldsChanged: 3,
    attachmentsAdded: 1,
    diffLink: "/diffs/OMS-2026-0139",
  },
};

// Fixture D: Failed system check
export const MOCK_HR_DETAIL_FAILED_CHECK: HrReviewDetailResponse = {
  ...MOCK_HR_DETAIL_REFERENCE,
  request: {
    ...MOCK_HR_DETAIL_REFERENCE.request,
    id: "OMS-2026-0143",
    position: "Cloud Engineer",
  },
  systemChecks: [
    { code: "JOB_PROFILE_ATTACHED", label: "Job profile attached", state: "PASSED", checkedAt: "2026-08-05T12:00:00Z", blocksApproval: true, failureReason: null },
    { code: "APPROVAL_ROUTE", label: "Approval route completed", state: "PASSED", checkedAt: "2026-08-05T12:00:00Z", blocksApproval: true, failureReason: null },
    { code: "BUDGET_AVAILABILITY", label: "Budget availability", state: "FAILED", checkedAt: "2026-08-05T12:00:00Z", blocksApproval: true, failureReason: "Insufficient funds in CS-DIG-003" },
    { code: "SEGREGATION_OF_DUTIES", label: "Segregation of duties", state: "PASSED", checkedAt: "2026-08-05T12:00:00Z", blocksApproval: true, failureReason: null },
  ],
  canDecide: false,
  readOnlyReason: "A blocking system check has failed.",
};
