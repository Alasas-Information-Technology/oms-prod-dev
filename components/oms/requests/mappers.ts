/**
 * Mappers for Requests Domain
 * Maps canonical demo-data Requisition into OmsRequest
 */

import {
  Requisition,
  getPerson,
} from "@/src/lib/demo-data";
import {
  OmsRequest,
  RequestActualStatus,
  RequestLifecycleStep,
  RequestStatusGroup,
  NeedsActionType,
} from "./request.types";

export const REQUEST_LIFECYCLE_LABELS = [
  "Submitted",
  "Department Approval",
  "HR Review",
  "Procurement",
  "Candidate Review",
  "Onboarding",
  "Active Engagement",
] as const;

export function createLifecycleSteps(
  currentIndex: number,
  statusGroup: RequestStatusGroup
): RequestLifecycleStep[] {
  const isClosed = statusGroup === "closed";

  return REQUEST_LIFECYCLE_LABELS.map((label, index) => ({
    id: label.toLowerCase().replaceAll(" ", "-"),
    label,
    state: isClosed
      ? "completed"
      : index < currentIndex
        ? "completed"
        : index === currentIndex
          ? "current"
          : "upcoming",
    completedAt: index < currentIndex ? "Completed" : undefined,
  }));
}

export function mapRequisitionToOmsRequest(
  req: Requisition,
  currentUserId: string = "usr-mariam"
): OmsRequest {
  const requestor = getPerson(req.requestorId);

  let actualStatus: RequestActualStatus = "Department Approval";
  let statusGroup: RequestStatusGroup = "in-progress";
  let currentStageIndex = 1;
  let currentOwner = requestor?.name || "Requestor";
  let nextAction = "Review request";
  let actionType: NeedsActionType | undefined = undefined;

  switch (req.currentStage) {
    case "DRAFT":
      actualStatus = "Draft";
      statusGroup = "draft";
      currentStageIndex = 0;
      currentOwner = requestor?.name || "Requestor";
      nextAction = "Complete & submit draft";
      actionType = "COMPLETE_DRAFT";
      break;

    case "PENDING_APPROVAL":
      actualStatus = "Department Approval";
      statusGroup = "needs-action";
      currentStageIndex = 1;
      const currentStep = req.approvalRoute.find((s) => s.state === "CURRENT");
      currentOwner = currentStep?.userName || getPerson(currentStep?.userId || "")?.name || "Line Manager";
      nextAction = "Review & approve";
      actionType = "APPROVE";
      break;

    case "HR_REVIEW":
      actualStatus = "Department Approval";
      statusGroup = "needs-action";
      currentStageIndex = 2;
      currentOwner = "Aisha Al Nuaimi";
      nextAction = req.flags.includes("RETURNED")
        ? "Review clarified deliverables"
        : "HR review & decision";
      actionType = "APPROVE";
      break;

    case "CLARIFICATION":
      actualStatus = "More Information Required";
      statusGroup = "needs-action";
      currentStageIndex = 2;
      currentOwner = requestor?.name || "Requestor";
      nextAction = "Respond to clarification";
      actionType = "CLARIFY";
      break;

    case "SOURCING":
      actualStatus = "Procurement";
      statusGroup = "in-progress";
      currentStageIndex = 3;
      currentOwner = "Salma Al Ketbi";
      nextAction = "Sourcing candidates via vendors";
      break;

    case "INTERVIEW":
    case "EVALUATION":
      actualStatus = "Candidate Review";
      statusGroup = "in-progress";
      currentStageIndex = 4;
      currentOwner = "Noura Al Mazrouei";
      nextAction = "Complete candidate evaluation";
      actionType = "REVIEW_CANDIDATES";
      break;

    case "AMENDMENT":
      actualStatus = "Candidate Review";
      statusGroup = "needs-action";
      currentStageIndex = 4;
      currentOwner = "Omar Al Hashmi";
      nextAction = "Review candidate budget amendment";
      actionType = "APPROVE";
      break;

    case "ONBOARDING":
      actualStatus = "Onboarding";
      statusGroup = "in-progress";
      currentStageIndex = 5;
      currentOwner = "Layla Hassan";
      nextAction = "Verify compliance documents";
      actionType = "CONFIRM_JOINING";
      break;

    case "ACTIVE":
      actualStatus = "Active Engagement";
      statusGroup = "closed";
      currentStageIndex = 6;
      currentOwner = requestor?.name || "Department";
      nextAction = "Active contractor assignment";
      break;

    case "ENDING_SOON":
      actualStatus = "Active Engagement";
      statusGroup = "closed";
      currentStageIndex = 6;
      currentOwner = requestor?.name || "Department";
      nextAction = "Contract ending within 30 days — review runway";
      break;

    case "TERMINATED":
      actualStatus = "Closed";
      statusGroup = "closed";
      currentStageIndex = 6;
      currentOwner = requestor?.name || "Department";
      nextAction = req.replacementRequisitionId
        ? `Terminated — replacement ${req.replacementRequisitionId} sourcing`
        : "Assignment terminated";
      break;

    case "RE_SOURCING":
      actualStatus = "Procurement";
      statusGroup = "in-progress";
      currentStageIndex = 3;
      currentOwner = "Salma Al Ketbi";
      nextAction = "Re-sourcing after candidate rejection";
      break;
  }

  // Calculate end date from startDate + engagementMonths
  const start = new Date(req.expectedStartDate || "2026-09-01");
  const end = new Date(start);
  end.setMonth(end.getMonth() + (req.engagementMonths || 12));
  const endDateStr = end.toISOString().slice(0, 10);

  return {
    id: req.id,
    requestId: req.id,
    position: req.positionTitle,
    resources: req.positions.required,
    actualStatus,
    statusGroup,
    currentStage: req.stageLabel,
    currentOwner,
    // budget is in AED units for OmsRequest presentation
    budget: Math.round(req.budgetAmount / 100),
    lockedBudget: Math.round(req.budgetAmount / 100),
    updatedLabel: req.updatedAt.slice(0, 10),
    updatedAt: req.updatedAt,
    nextAction,
    actionType,
    sla: req.sla
      ? {
          dueAt: req.sla.dueAt,
          daysRemaining: req.sla.daysRemaining,
          breached: req.sla.breached,
        }
      : undefined,
    assignment: {
      mode: "NAMED",
      assignedUserId: req.approvalRoute.find((s) => s.state === "CURRENT")?.userId || null,
      claimedBy: null,
    },
    organization: "Dubai Integrated Economic Zones Authority",
    businessUnit: "Corporate Services",
    department: req.departmentName,
    requestedBy: requestor?.name || "Mariam Al Mansoori",
    requestedOn: req.submittedAt ? req.submittedAt.slice(0, 10) : req.createdAt.slice(0, 10),
    engagementType: "Full-time contract",
    location: req.workLocation === "DIEZ_PREMISES" ? "DIEZ Premises" : req.workLocation,
    startDate: req.expectedStartDate,
    endDate: endDateStr,
    justification: req.justification,
    isMine: req.requestorId === currentUserId,
    isActive: statusGroup !== "closed",
    needsSlaAttention: req.sla?.breached || false,
    lifecycle: createLifecycleSteps(currentStageIndex, statusGroup),
  };
}
