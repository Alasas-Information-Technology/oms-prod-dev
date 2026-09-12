/**
 * Mappers for HR Send-Back Domain
 * Maps canonical demo-data Requisition into HrSendBackOptionsResponse
 */

import {
  Requisition,
  getPerson,
  getRequisition,
} from "@/src/lib/demo-data";
import {
  HrSendBackOptionsResponse,
  HrSendBackModeOption,
  HrSelectableField,
  HrSuggestedAsk,
  HrSendBackRouteStage,
} from "@/src/types/hr-send-back";

export function mapToHrSendBackOptions(
  reqOrId: Requisition | string | null
): HrSendBackOptionsResponse | null {
  const req = typeof reqOrId === "string" ? getRequisition(reqOrId) : reqOrId;
  if (!req) return null;

  const requesterPerson = getPerson(req.requestorId);
  const requester = {
    userId: req.requestorId,
    name: requesterPerson?.name || "Department Requestor",
    role: requesterPerson?.role || "Requestor",
    email: requesterPerson?.email || "requestor@diez.ae",
    avatarUrl: requesterPerson?.avatarUrl || "/avatars/mariam.jpg",
  };

  const modes: HrSendBackModeOption[] = [
    {
      code: "MORE_INFO",
      label: "Ask a question",
      consequence: "The requester answers. Nothing needs re-approval and the request stays with you.",
      requiresFieldSelection: false,
      showsRoute: false,
      showsBudget: false,
    },
    {
      code: "INFO_WITH_APPROVAL",
      label: "Ask for changes that need re-approval",
      consequence:
        "The requester updates the details, then it goes back through Line Manager and HOD before returning to you.",
      requiresFieldSelection: true,
      showsRoute: true,
      showsBudget: true,
    },
    {
      code: "AMEND",
      label: "Ask to amend the request",
      consequence: "The requester revises it. Full approval and budget checks repeat.",
      requiresFieldSelection: true,
      showsRoute: true,
      showsBudget: true,
    },
  ];

  const selectableFields: HrSelectableField[] = [
    {
      key: "engagementEndDate",
      label: "Engagement end date",
      type: "DATE",
      currentValue: req.expectedStartDate,
      financialImpact: false,
      warning: null,
      selectable: true,
    },
    {
      key: "durationMonths",
      label: "Duration (months)",
      type: "NUMBER",
      currentValue: req.engagementMonths,
      financialImpact: false,
      warning: null,
      selectable: true,
    },
    {
      key: "justification",
      label: "Business justification",
      type: "TEXT",
      currentValue: req.justification,
      financialImpact: false,
      warning: null,
      selectable: true,
    },
    {
      key: "budgetAmount",
      label: "Budget amount",
      type: "MONEY",
      currentValue: req.budgetAmount,
      financialImpact: true,
      warning: "Changes to budget will trigger financial re-approval.",
      selectable: true,
    },
  ];

  const suggestedAsks: HrSuggestedAsk[] = [
    { text: "Clarify project deliverables and scope milestones", fieldKey: "justification" },
    { text: "Update engagement end date to match project schedule", fieldKey: "engagementEndDate" },
    { text: "Attach the approved project plan or signed SOW", fieldKey: null },
  ];

  const reapprovalRoute: HrSendBackRouteStage[] = req.approvalRoute
    .filter((s) => s.stageCode !== "REQUESTOR" && s.stageCode !== "PROCUREMENT")
    .map((step) => ({
      stage: step.stageCode,
      label: step.label,
      user: {
        userId: step.userId || undefined,
        name: step.userName || getPerson(step.userId || "")?.name || "Approver",
        role: step.label,
      },
    }));

  return {
    requestId: req.id,
    requestTitle: req.positionTitle,
    requester,
    modes,
    selectableFields,
    suggestedAsks,
    reapprovalRoute,
    budget: {
      reserved: req.budgetAmount,
      note: "Budget line confirmed. Unaltered if change is non-financial.",
    },
    deadline: {
      daysAllowed: 30,
      closesAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      restartsOnSend: true,
    },
    thread: [
      {
        id: "thread-1",
        actor: {
          userId: req.requestorId,
          name: requester.name,
          role: requester.role,
          avatarUrl: requester.avatarUrl,
        },
        action: "SUBMITTED",
        message: "Initial requisition submitted for approval.",
        attachments: [],
        at: req.submittedAt || req.createdAt,
      },
    ],
    cycleNumber: 1,
    draft: null,
  };
}
