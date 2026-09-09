/**
 * Pure Query Functions for DIEZ OMS Demo Data
 * Specification: docs/DEMO-DATA-INTEGRATION.md Part 2
 *
 * Unknown IDs MUST return null. Callers render a real 404, never falling back to a default.
 */

import {
  Requisition,
  Candidate,
  InterviewPlan,
  Evaluation,
  Amendment,
  Clarification,
  ApprovalTask,
  OnboardingCase,
  WorkforceMember,
  ReconciliationVariance,
  Person,
  OrgUnit,
  BudgetLine,
  Vendor,
  RequisitionStage,
} from "./entities";
import { CAST, USER_ALIASES, CAST_LIST } from "./cast";
import { ORG_UNITS, BUDGET_LINES, VENDORS, ORG_UNITS_LIST, BUDGET_LINES_LIST, VENDORS_LIST } from "./org";
import {
  REQUISITIONS,
  REQUISITIONS_LIST,
  CANDIDATES,
  CANDIDATES_LIST,
  INTERVIEW_PLANS,
  EVALUATIONS,
  AMENDMENTS,
  CLARIFICATIONS,
  CLARIFICATIONS_LIST,
  APPROVAL_TASKS,
  APPROVAL_TASKS_LIST,
  ONBOARDING_CASES,
  ONBOARDING_CASES_LIST,
  WORKFORCE_MEMBERS,
  WORKFORCE_MEMBERS_LIST,
  RECONCILIATION_VARIANCE_RECORD,
} from "./seed";

// ============================================================================
// 1. Requisitions
// ============================================================================

export interface RequisitionFilters {
  status?: RequisitionStage | RequisitionStage[];
  departmentId?: string;
  requestorId?: string;
  tab?: "all" | "drafts" | "needs_action" | "in_progress" | "closed";
  search?: string;
}

/**
 * Retrieves a single requisition by its canonical ID (e.g. "OMS-2026-0148").
 * Returns null if the requisition is unknown.
 */
export function getRequisition(id: string): Requisition | null {
  if (!id) return null;
  const canonicalId = id.trim().toUpperCase();
  return REQUISITIONS[canonicalId] || null;
}

/**
 * Lists requisitions with optional filters for tabs, status, department, etc.
 */
export function listRequisitions(filters?: RequisitionFilters): Requisition[] {
  let items = [...REQUISITIONS_LIST];

  if (!filters) return items;

  // Filter by department
  if (filters.departmentId) {
    items = items.filter((req) => req.departmentId === filters.departmentId);
  }

  // Filter by requestor
  if (filters.requestorId) {
    const canonicalRequestor = USER_ALIASES[filters.requestorId] || filters.requestorId;
    items = items.filter((req) => req.requestorId === canonicalRequestor);
  }

  // Filter by specific stage(s)
  if (filters.status) {
    const stages = Array.isArray(filters.status) ? filters.status : [filters.status];
    items = items.filter((req) => stages.includes(req.currentStage));
  }

  // Filter by tab
  if (filters.tab) {
    switch (filters.tab) {
      case "drafts":
        items = items.filter((req) => req.currentStage === "DRAFT");
        break;
      case "needs_action":
        items = items.filter(
          (req) =>
            req.currentStage === "PENDING_APPROVAL" ||
            req.currentStage === "HR_REVIEW" ||
            req.currentStage === "CLARIFICATION" ||
            req.currentStage === "AMENDMENT"
        );
        break;
      case "in_progress":
        items = items.filter(
          (req) =>
            req.currentStage !== "DRAFT" &&
            req.currentStage !== "ACTIVE" &&
            req.currentStage !== "ENDING_SOON" &&
            req.currentStage !== "TERMINATED"
        );
        break;
      case "closed":
        items = items.filter(
          (req) =>
            req.currentStage === "ACTIVE" ||
            req.currentStage === "ENDING_SOON" ||
            req.currentStage === "TERMINATED"
        );
        break;
      case "all":
      default:
        break;
    }
  }

  // Text search
  if (filters.search) {
    const q = filters.search.toLowerCase().trim();
    items = items.filter(
      (req) =>
        req.id.toLowerCase().includes(q) ||
        req.positionTitle.toLowerCase().includes(q) ||
        req.departmentName.toLowerCase().includes(q) ||
        req.stageLabel.toLowerCase().includes(q)
    );
  }

  return items;
}

// ============================================================================
// 2. Clarifications
// ============================================================================

/**
 * Returns all clarifications raised for a given requisition.
 */
export function getClarificationsForRequisition(requisitionId: string): Clarification[] {
  if (!requisitionId) return [];
  const reqId = requisitionId.trim().toUpperCase();
  return CLARIFICATIONS_LIST.filter((c) => c.requisitionId.toUpperCase() === reqId);
}

/**
 * Retrieves a single clarification by clarificationId or requisitionId.
 */
export function getClarification(id: string): Clarification | null {
  if (!id) return null;
  const match = CLARIFICATIONS[id];
  if (match) return match;

  // Fallback: look up by requisition ID
  const reqId = id.trim().toUpperCase();
  return CLARIFICATIONS_LIST.find((c) => c.requisitionId.toUpperCase() === reqId) || null;
}

// ============================================================================
// 3. Candidates
// ============================================================================

/**
 * Returns all candidates associated with a requisition.
 */
export function getCandidatesForRequisition(requisitionId: string): Candidate[] {
  if (!requisitionId) return [];
  const reqId = requisitionId.trim().toUpperCase();
  return CANDIDATES_LIST.filter((c) => c.requisitionId.toUpperCase() === reqId);
}

/**
 * Retrieves a single candidate by requisition ID and candidate reference.
 */
export function getCandidate(requisitionId: string, candidateRef: string): Candidate | null {
  if (!requisitionId || !candidateRef) return null;
  const reqId = requisitionId.trim().toUpperCase();
  const ref = candidateRef.trim().toUpperCase();
  return (
    CANDIDATES_LIST.find(
      (c) => c.requisitionId.toUpperCase() === reqId && c.candidateRef.toUpperCase() === ref
    ) || null
  );
}

/**
 * Lists all candidates across the organization.
 */
export function listCandidates(): Candidate[] {
  return [...CANDIDATES_LIST];
}

// ============================================================================
// 4. Interview Planning & Evaluation
// ============================================================================

/**
 * Retrieves the interview plan for a specific candidate on a requisition.
 */
export function getInterview(requisitionId: string, candidateRef?: string): InterviewPlan | null {
  if (!requisitionId) return null;
  const reqId = requisitionId.trim().toUpperCase();

  if (candidateRef) {
    const ref = candidateRef.trim().toUpperCase();
    const key = `int-plan-${reqId.replace("OMS-2026-", "")}-${ref}`;
    if (INTERVIEW_PLANS[key]) return INTERVIEW_PLANS[key];

    return (
      Object.values(INTERVIEW_PLANS).find(
        (plan) =>
          plan.requisitionId.toUpperCase() === reqId && plan.candidateRef.toUpperCase() === ref
      ) || null
    );
  }

  // If candidateRef omitted, return first interview plan for requisition
  return (
    Object.values(INTERVIEW_PLANS).find((plan) => plan.requisitionId.toUpperCase() === reqId) ||
    null
  );
}

/**
 * Retrieves the evaluation workspace for a specific candidate on a requisition.
 */
export function getEvaluation(requisitionId: string, candidateRef: string): Evaluation | null {
  if (!requisitionId || !candidateRef) return null;
  const reqId = requisitionId.trim().toUpperCase();
  const ref = candidateRef.trim().toUpperCase();

  return (
    Object.values(EVALUATIONS).find(
      (evalRecord) =>
        evalRecord.requisitionId.toUpperCase() === reqId &&
        evalRecord.candidateRef.toUpperCase() === ref
    ) || null
  );
}

// ============================================================================
// 5. Budget Amendments
// ============================================================================

/**
 * Retrieves a budget amendment by amendmentId or requisitionId.
 */
export function getAmendment(idOrRequisitionId: string): Amendment | null {
  if (!idOrRequisitionId) return null;
  const cleanId = idOrRequisitionId.trim();

  // Direct lookup by amendmentId
  if (AMENDMENTS[cleanId]) return AMENDMENTS[cleanId];

  // Lookup by requisitionId
  const reqId = cleanId.toUpperCase();
  return (
    Object.values(AMENDMENTS).find((amd) => amd.requisitionId.toUpperCase() === reqId) || null
  );
}

// ============================================================================
// 6. Approval Tasks (Persona Switcher & "Needs My Action")
// ============================================================================

/**
 * Returns all pending approval tasks assigned to a specific user.
 * Supports legacy aliases (e.g. "usr-omar-01" -> "usr-omar").
 */
export function getApprovalTasksForUser(userId: string): ApprovalTask[] {
  if (!userId) return [];
  const canonicalUserId = USER_ALIASES[userId] || userId;

  return APPROVAL_TASKS_LIST.filter(
    (task) =>
      task.assignment.assignedUserId === canonicalUserId && task.status === "PENDING"
  );
}

/**
 * Retrieves a single approval task by its ID or requisition ID.
 */
export function getApprovalTask(taskIdOrReqId: string): ApprovalTask | null {
  if (!taskIdOrReqId) return null;
  const direct = APPROVAL_TASKS[taskIdOrReqId];
  if (direct) return direct;

  const reqId = taskIdOrReqId.trim().toUpperCase();
  return (
    APPROVAL_TASKS_LIST.find(
      (t) => t.requisitionId.toUpperCase() === reqId
    ) || null
  );
}

/**
 * Lists all approval tasks across the system.
 */
export function listApprovalTasks(): ApprovalTask[] {
  return [...APPROVAL_TASKS_LIST];
}

// ============================================================================
// 7. Onboarding & Vendor Portal
// ============================================================================

/**
 * Retrieves an onboarding case by onboardingId or requisitionId.
 */
export function getOnboarding(idOrRequisitionId: string): OnboardingCase | null {
  if (!idOrRequisitionId) return null;
  const cleanId = idOrRequisitionId.trim();

  // Direct lookup
  if (ONBOARDING_CASES[cleanId]) return ONBOARDING_CASES[cleanId];

  // Lookup by requisition ID
  const reqId = cleanId.toUpperCase();
  return (
    Object.values(ONBOARDING_CASES).find(
      (onb) => onb.requisitionId.toUpperCase() === reqId
    ) || null
  );
}

export function listOnboardingCases(): OnboardingCase[] {
  return [...ONBOARDING_CASES_LIST];
}

// ============================================================================
// 8. Workforce
// ============================================================================

/**
 * Retrieves a workforce member by memberId or requisitionId.
 */
export function getWorkforceMember(idOrRequisitionId: string): WorkforceMember | null {
  if (!idOrRequisitionId) return null;
  const cleanId = idOrRequisitionId.trim();

  // Direct lookup
  if (WORKFORCE_MEMBERS[cleanId]) return WORKFORCE_MEMBERS[cleanId];

  // Lookup by requisition ID
  const reqId = cleanId.toUpperCase();
  return (
    Object.values(WORKFORCE_MEMBERS).find(
      (member) => member.requisitionId.toUpperCase() === reqId
    ) || null
  );
}

export function listWorkforceMembers(filters?: { departmentId?: string; status?: string }): WorkforceMember[] {
  let items = [...WORKFORCE_MEMBERS_LIST];
  if (!filters) return items;

  if (filters.departmentId) {
    items = items.filter((m) => m.departmentId === filters.departmentId);
  }
  if (filters.status) {
    items = items.filter((m) => m.status === filters.status);
  }
  return items;
}

// ============================================================================
// 9. Organization, Cast & Budget
// ============================================================================

export function getPerson(userId: string): Person | null {
  if (!userId) return null;
  const canonicalId = USER_ALIASES[userId] || userId;
  return CAST[canonicalId] || null;
}

export function listPersons(): Person[] {
  return [...CAST_LIST];
}

export function getOrgUnit(id: string): OrgUnit | null {
  if (!id) return null;
  return ORG_UNITS[id] || null;
}

export function listOrgUnits(): OrgUnit[] {
  return [...ORG_UNITS_LIST];
}

export function getBudgetLine(idOrCode: string): BudgetLine | null {
  if (!idOrCode) return null;
  const clean = idOrCode.trim();
  if (BUDGET_LINES[clean]) return BUDGET_LINES[clean];

  return (
    BUDGET_LINES_LIST.find((line) => line.code.toUpperCase() === clean.toUpperCase()) || null
  );
}

export function listBudgetLines(departmentId?: string): BudgetLine[] {
  if (!departmentId) return [...BUDGET_LINES_LIST];
  return BUDGET_LINES_LIST.filter((line) => line.departmentId === departmentId);
}

export function getVendor(id: string): Vendor | null {
  if (!id) return null;
  return VENDORS[id] || null;
}

export function listVendors(): Vendor[] {
  return [...VENDORS_LIST];
}

export function getReconciliationVariance(id?: string): ReconciliationVariance | null {
  if (id && id !== "OMS-2026-0131") return null;
  return RECONCILIATION_VARIANCE_RECORD;
}
