import {
  NewRequestDraft,
  OmsRequest,
  RequestLifecycleStep,
  RequestStatusGroup,
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

export const MOCK_REQUESTS: OmsRequest[] = [
  createRequest({
    requestId: "OMS-2026-0148",
    position: "Senior Cybersecurity Analyst",
    resources: 2,
    actualStatus: "Candidate Review",
    statusGroup: "in-progress",
    currentStage: "Candidate Review",
    currentStageIndex: 4,
    currentOwner: "Noura Al Mazrouei",
    budget: 620000,
    updatedLabel: "12 min ago",
    updatedAt: "2026-08-27",
    nextAction: "Review candidates",
    department: "Cybersecurity",
    startDate: "2026-09-15",
    endDate: "2027-09-14",
    isMine: true,
    needsSlaAttention: true,
  }),

  createRequest({
    requestId: "OMS-2026-0141",
    position: "Cloud Security Engineer",
    resources: 1,
    actualStatus: "HR Approved",
    statusGroup: "in-progress",
    currentStage: "Procurement",
    currentStageIndex: 3,
    currentOwner: "Salma Al Ketbi",
    budget: 310000,
    updatedLabel: "2 hours ago",
    updatedAt: "2026-08-27",
    nextAction: "Start sourcing",
    department: "Cybersecurity",
    startDate: "2026-10-01",
    endDate: "2027-09-30",
    isMine: true,
  }),

  createRequest({
    requestId: "OMS-2026-0139",
    position: "Data Governance Specialist",
    resources: 1,
    actualStatus: "More Information Required",
    statusGroup: "needs-action",
    currentStage: "HR Review",
    currentStageIndex: 2,
    currentOwner: "Mariam Al Mansoori",
    budget: 285000,
    updatedLabel: "Yesterday",
    updatedAt: "2026-08-26",
    nextAction: "Respond today",
    department: "Data Management",
    startDate: "2026-09-20",
    endDate: "2027-09-19",
    isMine: true,
    needsSlaAttention: true,
  }),

  createRequest({
    requestId: "OMS-2026-0122",
    position: "SOC Analyst",
    resources: 2,
    actualStatus: "Onboarding",
    statusGroup: "in-progress",
    currentStage: "Onboarding",
    currentStageIndex: 5,
    currentOwner: "Aisha Al Nuaimi",
    budget: 340000,
    updatedLabel: "2 days ago",
    updatedAt: "2026-08-25",
    nextAction: "Monitor",
    department: "Cybersecurity",
    startDate: "2026-09-01",
    endDate: "2027-08-31",
    isMine: true,
  }),

  createRequest({
    requestId: "OMS-2026-0114",
    position: "PMO Analyst",
    resources: 1,
    actualStatus: "Draft",
    statusGroup: "draft",
    currentStage: "Requisition",
    currentStageIndex: 0,
    currentOwner: "Mariam Al Mansoori",
    budget: 220000,
    lockedBudget: 0,
    updatedLabel: "5 days ago",
    updatedAt: "2026-08-22",
    nextAction: "Complete draft",
    department: "Strategy & PMO",
    startDate: "2026-10-15",
    endDate: "2027-10-14",
    isMine: true,
  }),

  createRequest({
    requestId: "OMS-2026-0108",
    position: "Network Operations Engineer",
    resources: 2,
    actualStatus: "Procurement",
    statusGroup: "in-progress",
    currentStage: "Procurement",
    currentStageIndex: 3,
    currentOwner: "Omar Al Falasi",
    budget: 475000,
    updatedLabel: "6 days ago",
    updatedAt: "2026-08-21",
    nextAction: "Evaluate vendors",
    department: "Infrastructure",
    startDate: "2026-10-01",
    endDate: "2027-09-30",
  }),

  createRequest({
    requestId: "OMS-2026-0102",
    position: "Business Process Consultant",
    resources: 1,
    actualStatus: "Closed",
    statusGroup: "closed",
    currentStage: "Active Engagement",
    currentStageIndex: 6,
    currentOwner: "Layla Al Marri",
    budget: 255000,
    lockedBudget: 255000,
    updatedLabel: "1 week ago",
    updatedAt: "2026-08-20",
    nextAction: "View summary",
    department: "Operational Excellence",
    startDate: "2025-08-20",
    endDate: "2026-08-19",
  }),

  createRequest({
    requestId: "OMS-2026-0098",
    position: "Procurement Category Specialist",
    resources: 1,
    actualStatus: "Department Approval",
    statusGroup: "needs-action",
    currentStage: "Department Approval",
    currentStageIndex: 1,
    currentOwner: "Mariam Al Mansoori",
    budget: 240000,
    updatedLabel: "1 week ago",
    updatedAt: "2026-08-19",
    nextAction: "Add justification",
    department: "Procurement",
    startDate: "2026-10-10",
    endDate: "2027-10-09",
    isMine: true,
  }),

  createRequest({
    requestId: "OMS-2026-0091",
    position: "Enterprise Architect",
    resources: 1,
    actualStatus: "Candidate Review",
    statusGroup: "in-progress",
    currentStage: "Candidate Review",
    currentStageIndex: 4,
    currentOwner: "Noura Al Mazrouei",
    budget: 410000,
    updatedLabel: "8 days ago",
    updatedAt: "2026-08-19",
    nextAction: "Shortlist",
    department: "Enterprise Architecture",
    startDate: "2026-10-20",
    endDate: "2027-10-19",
    isMine: true,
  }),

  createRequest({
    requestId: "OMS-2026-0087",
    position: "Finance Reporting Analyst",
    resources: 1,
    actualStatus: "Draft",
    statusGroup: "draft",
    currentStage: "Requisition",
    currentStageIndex: 0,
    currentOwner: "Hessa Al Suwaidi",
    budget: 190000,
    lockedBudget: 0,
    updatedLabel: "9 days ago",
    updatedAt: "2026-08-18",
    nextAction: "Complete draft",
    department: "Finance",
    startDate: "2026-11-01",
    endDate: "2027-10-31",
  }),
];

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
    currentStage: "Requisition",
    currentStageIndex: 0,
    currentOwner: "Current user",
    budget: input.budget,
    lockedBudget: 0,
    updatedLabel: "Just now",
    updatedAt: today,
    nextAction: "Complete draft",
    department: input.department,
    startDate: today,
    endDate: endDate.toISOString().slice(0, 10),
    justification:
      input.justification || "Business justification to be completed.",
    isMine: true,
  });
}