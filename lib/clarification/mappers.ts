/**
 * Mappers for Clarification Domain
 * Maps canonical demo-data Clarification & Requisition into ClarificationDetail
 */

import {
  Clarification,
  Requisition,
  getPerson,
  getRequisition,
} from "@/src/lib/demo-data";
import {
  ClarificationDetail,
  InfoWithApprovalClarificationDetail,
  MoreInfoClarificationDetail,
  AmendClarificationDetail,
  ClarificationUser,
  ClarificationRouteStep,
  ClarificationThreadEntry,
} from "@/types/clarification";

export function mapToClarificationDetail(
  clarification: Clarification | null,
  requisition?: Requisition | null
): ClarificationDetail | null {
  if (!clarification) return null;

  const req = requisition || getRequisition(clarification.requisitionId);
  if (!req) return null;

  const raisedByPerson = getPerson(clarification.raisedByUserId);
  const raisedByUser: ClarificationUser = {
    userId: clarification.raisedByUserId,
    name: raisedByPerson?.name || "Aisha Al Nuaimi",
    role: raisedByPerson?.role || "HR Specialist",
    avatarUrl: raisedByPerson?.avatarUrl || "/avatars/aisha.jpg",
  };

  const baseDetail = {
    clarificationId: clarification.id,
    requestId: req.id,
    requestTitle: req.positionTitle,
    type: clarification.type,
    status: clarification.status,
    canRespond: clarification.status === "AWAITING_RESPONSE",
    readOnlyReason: clarification.status !== "AWAITING_RESPONSE" ? "Response has already been submitted." : null,
    raisedBy: raisedByUser,
    raisedAt: clarification.raisedAt,
    message: clarification.message,
    attachments: clarification.attachments.map((att) => ({
      id: att.id,
      name: att.name,
      sizeBytes: att.sizeBytes,
      url: att.url,
      scanStatus: att.scanStatus,
    })),
    asks: clarification.asks.map((ask) => ({
      id: ask.id,
      text: ask.text,
      fieldKey: ask.fieldKey,
      addressed: ask.addressed,
    })),
    deadline: {
      closesAt: clarification.deadline.closesAt,
      daysRemaining: clarification.deadline.daysRemaining,
      severity: clarification.deadline.severity as any,
    },
    thread: [
      {
        id: "thread-1",
        actor: {
          userId: req.requestorId,
          name: getPerson(req.requestorId)?.name || "Department Requestor",
          role: "Requester",
          avatarUrl: getPerson(req.requestorId)?.avatarUrl,
        },
        action: "SUBMITTED" as const,
        message: "Initial requisition submitted for approval.",
        attachments: [],
        at: req.submittedAt || clarification.raisedAt,
      },
      {
        id: "thread-2",
        actor: raisedByUser,
        action: "CLARIFICATION_REQUESTED" as const,
        message: clarification.message,
        attachments: clarification.attachments,
        at: clarification.raisedAt,
      },
    ] as ClarificationThreadEntry[],
    cycleNumber: 1,
  };

  if (clarification.type === "MORE_INFO") {
    const moreInfoDetail: MoreInfoClarificationDetail = {
      ...baseDetail,
      type: "MORE_INFO",
      consequence: {
        requiresReapproval: false,
        approvers: [] as never[],
        summary: "This is an informational clarification. No re-approvals are required upon submission.",
      },
    };
    return moreInfoDetail;
  }

  const editableFields = (clarification.editableFields || []).map((f) => ({
    key: f.key,
    label: f.label,
    type: f.type,
    currentValue: f.currentValue,
    proposedValue: f.proposedValue || f.currentValue,
    financialImpact: f.financialImpact,
    helpText: f.helpText,
    unit: f.unit,
  }));

  if (clarification.type === "INFO_WITH_APPROVAL") {
    const infoWithApprovalDetail: InfoWithApprovalClarificationDetail = {
      ...baseDetail,
      type: "INFO_WITH_APPROVAL",
      editableFields,
      consequence: {
        requiresReapproval: true,
        approvers: [
          {
            stage: "LINE_MANAGER",
            name: "Omar Al Hashmi",
            userId: "usr-omar",
          },
        ],
        summary: "Changes will require re-approval from the Line Manager.",
      },
    };
    return infoWithApprovalDetail;
  }

  const amendDetail: AmendClarificationDetail = {
    ...baseDetail,
    type: "AMEND",
    editableFields,
    consequence: {
      requiresReapproval: true,
      approvers: [
        {
          stage: "LINE_MANAGER",
          name: "Omar Al Hashmi",
          userId: "usr-omar",
        },
        {
          stage: "HOD",
          name: "Khalid Al Suwaidi",
          userId: "usr-khalid",
        },
      ],
      summary: "Changes modify budget lines and require full re-approval.",
    },
  };
  return amendDetail;
}
