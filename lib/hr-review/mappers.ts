/**
 * Mappers for HR Review Domain
 * Maps canonical demo-data Requisition into HrReviewQueueResponse and HrReviewDetailResponse
 */

import {
  Requisition,
  Clarification,
  getPerson,
  getOrgUnit,
  getClarification,
  getClarificationsForRequisition,
} from "@/src/lib/demo-data";
import {
  HrReviewDetailResponse,
  HrReviewQueueItem,
  HrReviewQueueResponse,
} from "@/types/hr-review";

export function mapToHrReviewQueueItem(req: Requisition): HrReviewQueueItem {
  const org = getOrgUnit(req.departmentId);
  const now = new Date("2026-09-09T13:00:00Z").getTime();
  const createdTime = req.submittedAt ? new Date(req.submittedAt).getTime() : now;
  const ageDays = Math.max(1, Math.floor((now - createdTime) / (1000 * 60 * 60 * 24)));

  const sla = req.sla || {
    targetDays: 3,
    dueAt: new Date(now + 3 * 24 * 60 * 60 * 1000).toISOString(),
    daysRemaining: 3,
    breached: false,
    overdueDays: 0,
  };

  const hasClarificationReturned = req.flags.includes("RETURNED");

  return {
    requestId: req.id,
    position: req.positionTitle,
    department: {
      id: req.departmentId,
      name: req.departmentName || org?.name || "Department",
    },
    ageDays,
    sla: {
      targetDays: sla.targetDays,
      dueAt: sla.dueAt,
      overdueDays: sla.overdueDays,
      breached: sla.breached,
    },
    flags: ["BUDGET_VERIFIED", ...(req.flags.includes("NEW") ? ["NEW" as const] : [])],
    returnedFromClarification: hasClarificationReturned,
    amount: req.budgetAmount,
  };
}

export function mapToHrReviewDetail(
  req: Requisition | null,
  clarification?: Clarification | null
): HrReviewDetailResponse | null {
  if (!req) return null;

  const clar =
    clarification !== undefined
      ? clarification
      : getClarificationsForRequisition(req.id)[0] || getClarification(req.id);

  const approvalTrail = req.approvalRoute
    .filter((step) => step.state === "COMPLETE")
    .map((step) => ({
      stage: step.stageCode,
      label: step.label,
      user: {
        id: step.userId || "usr-unknown",
        name: step.userName || getPerson(step.userId || "")?.name || "Approver",
      },
      at: step.actionedAt || req.submittedAt || req.createdAt,
      comment: step.comment || null,
    }));

  const clarificationContext = clar && clar.status === "SUBMITTED"
    ? {
        hadClarification: true,
        askedAt: clar.raisedAt,
        askedBy: {
          id: clar.raisedByUserId,
          name: getPerson(clar.raisedByUserId)?.name || "Aisha Al Nuaimi",
        },
        askMessage: clar.message,
        respondedAt: clar.response?.respondedAt || clar.raisedAt,
        respondedBy: {
          id: clar.response?.respondedByUserId || req.requestorId,
          name: getPerson(clar.response?.respondedByUserId || req.requestorId)?.name || "Mariam Al Mansoori",
        },
        fieldsChanged: clar.response ? Object.keys(clar.response.updatedValues).length : 3,
        attachmentsAdded: clar.response ? clar.response.attachments.length : 1,
        // Wire navigation link directly to the clarification page per Task 4
        diffLink: `/app/requests/${req.id}/clarifications/${clar.id}`,
      }
    : null;

  const reapprovalRoute = req.approvalRoute
    .filter((step) => step.stageCode === "LINE_MANAGER" || step.stageCode === "SECTION_HEAD" || step.stageCode === "HOD")
    .map((step) => ({
      stage: step.stageCode,
      user: {
        name: step.userName || getPerson(step.userId || "")?.name || "Approver",
      },
    }));

  return {
    request: {
      id: req.id,
      position: req.positionTitle,
      badges: req.flags,
      resources: req.positions.required,
      engagementMonths: req.engagementMonths,
      expectedStart: req.expectedStartDate,
      grade: req.salaryGrade,
      workLocation: req.workLocation,
      candidateRoute: req.candidateRoute === "KNOWN" ? "Known candidates" : "Unknown candidates",
      justification: req.justification,
    },
    canDecide: req.currentStage === "HR_REVIEW",
    readOnlyReason: req.currentStage !== "HR_REVIEW" ? "This request is not currently in HR Review stage." : null,
    systemChecks: [
      {
        code: "JOB_PROFILE_ATTACHED",
        label: "Job profile attached",
        state: "PASSED",
        checkedAt: req.createdAt,
        blocksApproval: true,
        failureReason: null,
      },
      {
        code: "BUDGET_VERIFIED",
        label: "Budget availability verified",
        state: "PASSED",
        checkedAt: req.createdAt,
        blocksApproval: true,
        failureReason: null,
      },
    ],
    hrConfirmations: [
      {
        code: "OUTSOURCING_SUITABLE",
        label: "Outsourcing is suitable for this role",
        confirmed: false,
        note: null,
        context: null,
      },
      {
        code: "EMIRATISATION",
        label: "Emiratisation position considered",
        confirmed: false,
        note: null,
        context: { current: 34.2, target: 40.0, unit: "PERCENT" },
      },
    ],
    budget: {
      approved: req.budgetAmount,
      reserved: req.budgetAmount,
      availableRemaining: req.allocations[0]?.amount || req.budgetAmount,
      fundingRoute: req.fundingRoute,
      verified: true,
      lines: req.allocations.map((alloc) => ({
        code: alloc.code,
        name: alloc.name,
        amount: alloc.amount,
      })),
    },
    approvalTrail,
    clarificationContext,
    availableDecisions: ["APPROVE_OMS", "SEND_BACK", "PERMANENT_HIRE", "REJECT"],
    sendBackModes: ["MORE_INFO", "INFO_WITH_APPROVAL", "AMEND"],
    reapprovalRoute,
  };
}
