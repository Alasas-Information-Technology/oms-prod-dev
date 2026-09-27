/**
 * Approval Domain Mappers
 * Converts canonical Demo Data entities (Requisition, ApprovalTask)
 * into the exact API contract types defined in lib/types/approval.types.ts.
 */

import {
  ApprovalTaskDetail,
  ApprovalTaskSummary,
  ApprovalStage,
  ApprovalHistoryItem,
  RequisitionSubject,
  RequisitionImpact,
  PreflightResult,
  ApprovalType,
  DecisionAction,
  CheckState,
  UserSummary,
} from "../types/approval.types";
import {
  Requisition,
  ApprovalTask,
  Person,
} from "@/src/lib/demo-data/entities";
import {
  getRequisition,
  getPerson,
  getBudgetLine,
  getClarificationsForRequisition,
  getAmendment,
  getCandidatesForRequisition,
  getOnboarding,
  USER_ALIASES,
} from "@/src/lib/demo-data";

/**
 * Maps a Person or userId to a UserSummary
 */
export function mapToUserSummary(userIdOrPerson: string | Person): UserSummary {
  if (typeof userIdOrPerson === "string") {
    const person = getPerson(userIdOrPerson);
    return {
      id: userIdOrPerson,
      name: person?.name || userIdOrPerson,
      email: person?.email,
      avatarUrl: person?.avatarUrl,
    };
  }

  return {
    id: userIdOrPerson.id,
    name: userIdOrPerson.name,
    email: userIdOrPerson.email,
    avatarUrl: userIdOrPerson.avatarUrl,
  };
}

/**
 * Maps a canonical ApprovalTask (and optional linked Requisition) to ApprovalTaskSummary
 */
export function mapToApprovalTaskSummary(
  task: ApprovalTask,
  requisition?: Requisition | null
): ApprovalTaskSummary {
  const req = requisition ?? (task.requisitionId ? getRequisition(task.requisitionId) : null);
  const assigneePerson = task.assignment.assignedUserId
    ? getPerson(task.assignment.assignedUserId)
    : null;

  return {
    approvalTaskId: task.id,
    type: (task.type || "REQUISITION") as ApprovalType,
    subjectId: task.requisitionId,
    subjectRef: task.subjectRef || task.requisitionId,
    title: task.title || req?.positionTitle || "Requisition Approval",
    context: task.context || (req ? `${req.departmentName} Department` : "Corporate Services"),
    stage: {
      code: task.stage.code,
      label: task.stage.label,
      index: task.stage.index,
      total: task.stage.total,
    },
    assignment: {
      mode: task.assignment.mode,
      assignedUserId: task.assignment.assignedUserId,
      claimedBy: task.assignment.claimedBy
        ? mapToUserSummary(task.assignment.claimedBy)
        : null,
    },
    actingFor: task.actingFor ? mapToUserSummary(task.actingFor) : null,
    amount: task.amount || req?.budgetAmount || 0,
    currency: task.currency || req?.currency || "AED",
    submittedAt: task.submittedAt || req?.submittedAt || req?.createdAt || new Date().toISOString(),
    assignedAt: task.assignedAt || req?.updatedAt || new Date().toISOString(),
    sla: {
      dueAt: task.sla?.dueAt || new Date(Date.now() + 3 * 86400000).toISOString(),
      daysRemaining: task.sla?.daysRemaining ?? 3,
      breached: task.sla?.breached ?? false,
    },
    priority: task.priority || "NORMAL",
  };
}

/**
 * Synthesizes an ApprovalTaskSummary from a Requisition directly
 */
export function mapRequisitionToApprovalTaskSummary(
  req: Requisition,
  task?: ApprovalTask | null
): ApprovalTaskSummary {
  if (task) {
    return mapToApprovalTaskSummary(task, req);
  }

  const currentStep = req.approvalRoute.find((s) => s.state === "CURRENT") || req.approvalRoute[0];
  const isBreached = req.sla?.breached ?? false;

  return {
    approvalTaskId: `task-appr-${req.id.toLowerCase()}`,
    type: req.currentStage === "AMENDMENT" ? "BUDGET_AMENDMENT" : "REQUISITION",
    subjectId: req.id,
    subjectRef: req.id,
    title: req.positionTitle,
    context: `${req.departmentName} Department`,
    stage: {
      code: currentStep.stageCode,
      label: currentStep.label,
      index: currentStep.index,
      total: req.approvalRoute.length,
    },
    assignment: {
      mode: "NAMED",
      assignedUserId: currentStep.userId || null,
      claimedBy: null,
    },
    actingFor: null,
    amount: req.budgetAmount,
    currency: req.currency || "AED",
    submittedAt: req.submittedAt || req.createdAt,
    assignedAt: req.updatedAt || req.submittedAt || req.createdAt,
    sla: {
      dueAt: req.sla?.dueAt || new Date(Date.now() + 5 * 86400000).toISOString(),
      daysRemaining: req.sla?.daysRemaining ?? 5,
      breached: isBreached,
    },
    priority: isBreached ? "URGENT" : "NORMAL",
  };
}

/**
 * Maps a canonical Requisition and optional ApprovalTask to ApprovalTaskDetail.
 * Returns genuine, unique details for each requisition across the 14 seeds.
 */
export function mapToApprovalTaskDetail(
  req: Requisition,
  task?: ApprovalTask | null,
  activeUserId?: string
): ApprovalTaskDetail {
  const currentStep = req.approvalRoute.find((s) => s.state === "CURRENT");
  const taskSummary = task
    ? mapToApprovalTaskSummary(task, req)
    : mapRequisitionToApprovalTaskSummary(req);

  // 1. Approval Route Stepper Mapping
  const route: ApprovalStage[] = req.approvalRoute.map((step) => {
    const person = step.userId ? getPerson(step.userId) : null;
    return {
      index: step.index,
      code: step.stageCode,
      label: step.label,
      state: step.state,
      user: step.userId
        ? {
            id: step.userId,
            name: step.userName || person?.name || step.userId,
            email: person?.email,
            avatarUrl: person?.avatarUrl,
          }
        : undefined,
      at: step.actionedAt || undefined,
    };
  });

  // 2. Requisition Subject Mapping
  const attachments = (req.attachments || []).map((att) => ({
    id: att.id,
    name: att.name,
    sizeBytes: att.sizeBytes,
    uploadedAt: att.uploadedAt,
  }));

  // Ensure default job description attachment exists if marked in evidence
  if (attachments.length === 0 && req.evidence?.jobDescriptionAttached) {
    attachments.push({
      id: `att-${req.id.toLowerCase()}-jd`,
      name: `JD_${req.positionTitle.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`,
      sizeBytes: 245000,
      uploadedAt: req.submittedAt || req.createdAt,
    });
  }

  const subject: RequisitionSubject = {
    requestId: req.id,
    position: req.positionTitle,
    department: {
      id: req.departmentId,
      name: req.departmentName,
    },
    resources: req.positions.required,
    engagementMonths: req.engagementMonths,
    workLocation: req.workLocation,
    expectedStart: req.expectedStartDate,
    salaryGrade: req.salaryGrade,
    candidateRoute: req.candidateRoute,
    justification: req.justification,
    evidence: {
      jobDescriptionAttached: req.evidence?.jobDescriptionAttached ?? true,
      supportingDocumentCount: req.evidence?.supportingDocumentCount ?? 1,
      adHierarchyVerified: req.evidence?.adHierarchyVerified ?? true,
    },
    attachments,
  };

  // 3. History Mapping
  const history: ApprovalHistoryItem[] = [];
  if (req.submittedAt) {
    const reqPerson = getPerson(req.requestorId);
    history.push({
      user: {
        id: req.requestorId,
        name: reqPerson?.name || "Requestor",
        email: reqPerson?.email,
        avatarUrl: reqPerson?.avatarUrl,
      },
      action: "SUBMITTED",
      comment: "Request submitted for approval.",
      at: req.submittedAt,
    });
  }

  req.approvalRoute
    .filter((s) => s.state === "COMPLETE" && s.stageCode !== "REQUESTOR")
    .forEach((step) => {
      const person = step.userId ? getPerson(step.userId) : null;
      history.push({
        user: {
          id: step.userId || "usr-approver",
          name: step.userName || person?.name || "Approver",
          email: person?.email,
          avatarUrl: person?.avatarUrl,
        },
        action: "APPROVE",
        stage: step.stageCode,
        comment: step.comment || "Approved.",
        at: step.actionedAt || req.updatedAt,
      });
    });

  // 4. Budget Impact Mapping
  let totalAvailableBefore = 0;
  const allocations = req.allocations.map((a) => {
    const bl = getBudgetLine(a.budgetLineId) || getBudgetLine(a.code);
    const lineAvailable = bl ? bl.available : a.amount * 2;
    totalAvailableBefore += lineAvailable;
    return {
      budgetLineId: a.budgetLineId,
      code: a.code,
      name: a.name || bl?.name || a.code,
      amount: a.amount,
    };
  });

  if (totalAvailableBefore === 0) {
    totalAvailableBefore = req.budgetAmount * 2;
  }

  const isFailingPreflight = req.flags?.includes("PREFLIGHT_FAILED");
  const isBudgetAvailable = !isFailingPreflight && totalAvailableBefore >= req.budgetAmount;

  const impact: RequisitionImpact = {
    fundingRoute: req.fundingRoute,
    requested: req.budgetAmount,
    availableBefore: isFailingPreflight ? Math.floor(req.budgetAmount * 0.5) : totalAvailableBefore,
    reservedNow: req.budgetAmount,
    remainingAfter: isFailingPreflight
      ? 0
      : Math.max(0, totalAvailableBefore - req.budgetAmount),
    currency: "AED",
    allocations,
    fundStateTransition: { from: "RESERVED", to: "LOCKED_ALLOCATED" },
    periodOpen: true,
  };

  // 5. Preflight Checks Mapping
  const preflight: PreflightResult = {
    checks: [
      {
        code: "BUDGET_AVAILABILITY",
        label: "Budget availability",
        state: (isBudgetAvailable ? "PASSED" : "FAILED") as CheckState,
      },
      {
        code: "APPROVAL_ROUTE",
        label: "Approval route",
        state: "VERIFIED" as CheckState,
      },
      {
        code: "SEGREGATION_OF_DUTIES",
        label: "Segregation of duties",
        state: "PASSED" as CheckState,
      },
      {
        code: "PERIOD_OPEN",
        label: "Budget period open",
        state: "PASSED" as CheckState,
      },
    ],
    allPassed: isBudgetAvailable,
    blockingMessage: isBudgetAvailable
      ? null
      : `Insufficient funds available. A recent budget transfer reduced the available amount below the requested AED ${(req.budgetAmount / 100).toLocaleString()}.`,
  };

  // 6. Actionability & Read-Only States
  const effectiveUserId =
    activeUserId ||
    (typeof window !== "undefined" ? localStorage.getItem("oms_demo_persona") : undefined) ||
    undefined;

  const canonicalActiveUser = effectiveUserId ? (USER_ALIASES[effectiveUserId] || effectiveUserId) : undefined;
  const isRequester = canonicalActiveUser !== undefined && req.requestorId === canonicalActiveUser;

  const isTaskAssigned =
    canonicalActiveUser !== undefined &&
    task !== undefined &&
    task !== null &&
    task.status === "PENDING" &&
    (task.assignment.assignedUserId === canonicalActiveUser ||
      USER_ALIASES[task.assignment.assignedUserId || ""] === canonicalActiveUser);

  const isCurrentStepApprover =
    canonicalActiveUser !== undefined &&
    currentStep !== undefined &&
    currentStep.state === "CURRENT" &&
    (currentStep.userId === canonicalActiveUser ||
      USER_ALIASES[currentStep.userId || ""] === canonicalActiveUser);

  const isCurrentApprover = isTaskAssigned || isCurrentStepApprover;

  const isPending =
    (currentStep !== undefined && currentStep.state === "CURRENT") ||
    (task !== undefined && task !== null && task.status === "PENDING");

  let canAct = false;
  let readOnlyReason: string | null = null;

  if (isRequester) {
    canAct = false;
    readOnlyReason = "You are the requester of this requisition (separation of duties).";
  } else if (isCurrentApprover) {
    canAct = isBudgetAvailable;
    readOnlyReason = isBudgetAvailable ? null : "PREFLIGHT_FAILED";
  } else if (isPending) {
    canAct = false;
    const approverName =
      (task?.assignment?.assignedUserId ? getPerson(task.assignment.assignedUserId)?.name : null) ||
      currentStep?.userName ||
      (currentStep?.userId ? getPerson(currentStep.userId)?.name : null) ||
      "Assigned Approver";
    readOnlyReason = `Awaiting ${task?.stage?.label || currentStep?.label || "approval"} (${approverName}).`;
  } else {
    canAct = false;
    readOnlyReason = `This requisition is currently ${req.stageLabel}.`;
  }

  // Fallback if no user context was specified at all
  if (!canonicalActiveUser) {
    canAct = isPending && isBudgetAvailable;
    readOnlyReason = !isBudgetAvailable
      ? "PREFLIGHT_FAILED"
      : !isPending
      ? `This requisition is currently ${req.stageLabel}.`
      : null;
  }

  const availableActions: DecisionAction[] = canAct
    ? ["APPROVE", "SEND_BACK", "REJECT"]
    : [];

  // 7. Navigation Linkage (Part 5 Requirements)
  const clarifications = getClarificationsForRequisition(req.id);
  const clar = clarifications[0] || null;
  const amd = getAmendment(req.id);
  const candidates = getCandidatesForRequisition(req.id);
  const onb = getOnboarding(req.id);

  return {
    task: taskSummary,
    canAct,
    actingFor: taskSummary.actingFor,
    readOnlyReason,
    route,
    subject,
    history,
    impact,
    preflight,
    availableActions,
    linkedClarification: clar
      ? {
          id: clar.id,
          url: `/app/requests/${req.id}/clarifications/${clar.id}`,
          type: clar.type,
          status: clar.status,
        }
      : null,
    linkedAmendment: amd
      ? {
          id: amd.id,
          url: `/app/requests/${req.id}/amendments/${amd.id}`,
          status: amd.status,
          variancePercent: amd.cost.variancePercent,
        }
      : null,
    linkedCandidatesCount: candidates.length,
    linkedOnboarding: onb
      ? {
          id: onb.id,
          url: `/vendor/onboarding/${onb.id}/documents`,
        }
      : null,
  };
}
