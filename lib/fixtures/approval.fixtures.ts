/**
 * Approval Domain Fixtures (Demo Data Adapter)
 * Specification: docs/DEMO-DATA-INTEGRATION.md Part 2
 *
 * Calls pure demo-data queries and maps the canonical entities into
 * the domain's API contract shapes via lib/approvals/mappers.ts.
 * Unknown IDs return null for genuine 404 behavior.
 */

import {
  ApprovalTaskDetail,
  ApprovalTaskSummary,
  UserSummary,
} from "../types/approval.types";
import {
  getRequisition,
  getApprovalTask,
  getApprovalTasksForUser,
  listApprovalTasks,
  listRequisitions,
} from "@/src/lib/demo-data";
import {
  mapToApprovalTaskDetail,
  mapToApprovalTaskSummary,
  mapRequisitionToApprovalTaskSummary,
} from "../approvals/mappers";

/**
 * Retrieves the approval task detail fixture for a given requisition ID or task ID.
 * Returns null if the entity does not exist in demo-data.
 */
export function getApprovalDetailFixture(id: string, activeUserId?: string): ApprovalTaskDetail | null {
  if (!id) return null;

  // 1. Try finding requisition by ID (e.g. "OMS-2026-0148")
  const req = getRequisition(id);
  if (req) {
    const task = getApprovalTask(id) || null;
    return mapToApprovalTaskDetail(req, task, activeUserId);
  }

  // 2. Try finding approval task by ID (e.g. "task-appr-0148-omar")
  const task = getApprovalTask(id);
  if (task && task.requisitionId) {
    const taskReq = getRequisition(task.requisitionId);
    if (taskReq) {
      return mapToApprovalTaskDetail(taskReq, task, activeUserId);
    }
  }

  // Unknown ID -> Return null (do not fall back to baseline)
  return null;
}

/**
 * Returns approval task summaries for a specific user.
 */
export function getApprovalTasksForUserFixture(userId: string): ApprovalTaskSummary[] {
  if (!userId) return [];
  const tasks = getApprovalTasksForUser(userId);
  return tasks.map((t) => mapToApprovalTaskSummary(t));
}

/**
 * Lists all approval tasks across the system.
 */
export function listApprovalTasksFixture(): ApprovalTaskSummary[] {
  const tasks = listApprovalTasks();
  return tasks.map((t) => mapToApprovalTaskSummary(t));
}

/**
 * Legacy baseline fixture for testing backwards compatibility.
 * Dynamically generated from the flagship requisition OMS-2026-0148.
 */
const defaultFlagship = getApprovalDetailFixture("OMS-2026-0148");

export const baseApprovalDetail: ApprovalTaskDetail = defaultFlagship || {
  task: {
    approvalTaskId: "tsk-99201",
    type: "REQUISITION",
    subjectId: "req-1029",
    subjectRef: "OMS-2026-0148",
    title: "Senior Cybersecurity Analyst",
    context: "Digital Security Department",
    stage: { code: "HOD", label: "HOD Approval", index: 4, total: 6 },
    assignment: { mode: "NAMED", assignedUserId: "usr-khalid", claimedBy: null },
    actingFor: null,
    amount: 62000000,
    currency: "AED",
    submittedAt: "2026-08-04T09:18:00Z",
    assignedAt: "2026-08-05T10:06:00Z",
    sla: { dueAt: "2026-09-04T10:06:00Z", daysRemaining: 22, breached: false },
    priority: "NORMAL",
  },
  canAct: true,
  actingFor: null,
  readOnlyReason: null,
  route: [],
  subject: {
    requestId: "OMS-2026-0148",
    position: "Senior Cybersecurity Analyst",
    department: { id: "dept-digital-security", name: "Digital Security" },
    resources: 2,
    engagementMonths: 12,
    workLocation: "DIEZ_PREMISES",
    expectedStart: "2026-09-01",
    salaryGrade: "G8",
    candidateRoute: "UNKNOWN",
    justification: "Critical hire",
    evidence: {
      jobDescriptionAttached: true,
      supportingDocumentCount: 3,
      adHierarchyVerified: true,
    },
    attachments: [],
  },
  history: [],
  impact: {
    fundingRoute: "BUDGETED",
    requested: 62000000,
    availableBefore: 124000000,
    reservedNow: 62000000,
    remainingAfter: 62000000,
    currency: "AED",
    allocations: [],
    fundStateTransition: { from: "RESERVED", to: "LOCKED_ALLOCATED" },
    periodOpen: true,
  },
  preflight: {
    checks: [],
    allPassed: true,
    blockingMessage: null,
  },
  availableActions: ["APPROVE", "SEND_BACK", "REJECT"],
};

export const MOCK_APPROVAL_FIXTURES: Record<string, ApprovalTaskDetail> = {
  baseline: baseApprovalDetail,
  fourStepRoute: getApprovalDetailFixture("OMS-2026-0139") || baseApprovalDetail,
  roleQueue: getApprovalDetailFixture("OMS-2026-0143") || baseApprovalDetail,
  delegated: getApprovalDetailFixture("OMS-2026-0170") || baseApprovalDetail,
  breachedSla: getApprovalDetailFixture("OMS-2026-0128") || baseApprovalDetail,
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
