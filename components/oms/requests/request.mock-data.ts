import {
  NewRequestDraft,
  OmsRequest,
  RequestLifecycleStep,
  RequestStatusGroup,
} from "./request.types";
import { listRequisitions } from "@/src/lib/demo-data";
import { mapRequisitionToOmsRequest } from "./mappers";

export const REQUEST_LIFECYCLE_LABELS = [
  "Submitted",
  "Department Approval",
  "HR Review",
  "Procurement",
  "Candidate Review",
  "Onboarding",
  "Active Engagement",
] as const;

const COMPLETED_DATES = [
  "04 Aug 09:18",
  "04 Aug 09:45",
  "04 Aug 10:30",
  "04 Aug 11:15",
  "06 Aug 14:20",
  "12 Aug 08:30",
  "15 Aug 09:00",
];

function createLifecycle(
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
    completedAt:
      isClosed || index < currentIndex
        ? COMPLETED_DATES[index]
        : undefined,
  }));
}

type RequestSeed = Pick<
  OmsRequest,
  | "requestId"
  | "position"
  | "resources"
  | "actualStatus"
  | "statusGroup"
  | "currentStage"
  | "currentOwner"
  | "budget"
  | "updatedLabel"
  | "updatedAt"
  | "nextAction"
  | "department"
  | "startDate"
  | "endDate"
> & {
  currentStageIndex: number;
} & Partial<
    Pick<
      OmsRequest,
      | "organization"
      | "businessUnit"
      | "requestedBy"
      | "requestedOn"
      | "engagementType"
      | "location"
      | "justification"
      | "isMine"
      | "isActive"
      | "needsSlaAttention"
      | "lockedBudget"
      | "actionType"
      | "sla"
      | "assignment"
      | "actingFor"
      | "approvalTaskId"
    >
  >;

function createRequest(seed: RequestSeed): OmsRequest {
  return {
    id: seed.requestId,
    requestId: seed.requestId,
    position: seed.position,
    resources: seed.resources,
    actualStatus: seed.actualStatus,
    statusGroup: seed.statusGroup,
    currentStage: seed.currentStage,
    currentOwner: seed.currentOwner,
    budget: seed.budget,
    lockedBudget: seed.lockedBudget ?? Math.round(seed.budget * 0.72),
    updatedLabel: seed.updatedLabel,
    updatedAt: seed.updatedAt,
    nextAction: seed.nextAction,
    actionType: seed.actionType,
    sla: seed.sla,
    assignment: seed.assignment,
    actingFor: seed.actingFor,
    approvalTaskId: seed.approvalTaskId,
    organization:
      seed.organization ?? "Dubai Integrated Economic Zones Authority",
    businessUnit: seed.businessUnit ?? "Corporate Services",
    department: seed.department,
    requestedBy: seed.requestedBy ?? "Mariam Al Mansoori",
    requestedOn: seed.requestedOn ?? "2026-08-04",
    engagementType: seed.engagementType ?? "Full-time contract",
    location: seed.location ?? "Dubai, UAE",
    startDate: seed.startDate,
    endDate: seed.endDate,
    justification:
      seed.justification ??
      "Additional specialist capacity is required to deliver the approved operating plan and maintain service coverage.",
    isMine: seed.isMine ?? false,
    isActive: seed.isActive ?? seed.statusGroup !== "closed",
    needsSlaAttention: seed.needsSlaAttention ?? false,
    lifecycle: createLifecycle(
      seed.currentStageIndex,
      seed.statusGroup
    ),
  };
}

export const MOCK_REQUESTS: OmsRequest[] = listRequisitions().map((req) =>
  mapRequisitionToOmsRequest(req)
);


export function createMockDraft(
  input: NewRequestDraft
): OmsRequest {
  const sequence = String(Date.now()).slice(-5);
  const requestId = `OMS-DRAFT-${sequence}`;
  const today = new Date().toISOString().slice(0, 10);

  const endDate = new Date();
  endDate.setFullYear(endDate.getFullYear() + 1);

  return createRequest({
    requestId,
    position: input.position,
    resources: input.resources,
    actualStatus: "Draft",
    statusGroup: "draft",
    currentStage: "Draft",
    currentStageIndex: 0,
    currentOwner: "Current user",
    budget: input.budget,
    lockedBudget: 0,
    updatedLabel: "Just now",
    updatedAt: today,
    nextAction: "Finish draft",
    actionType: "COMPLETE_DRAFT",
    department: input.department,
    startDate: today,
    endDate: endDate.toISOString().slice(0, 10),
    justification:
      input.justification || "Business justification to be completed.",
    isMine: true,
  });
}