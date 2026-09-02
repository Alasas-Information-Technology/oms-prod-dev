import {
  NewRequestDraft,
  OmsRequest,
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

export const MOCK_REQUESTS: OmsRequest[] = [
  // 1. APPROVE: Baseline Requisition (OMS-2026-0148)
  createRequest({
    requestId: "OMS-2026-0148",
    position: "Senior Cybersecurity Analyst",
    resources: 2,
    actualStatus: "Department Approval",
    statusGroup: "needs-action",
    currentStage: "HOD Approval",
    currentStageIndex: 1,
    currentOwner: "Khalid Al Suwaidi",
    budget: 620000,
    updatedLabel: "12 min ago",
    updatedAt: "2026-08-27",
    nextAction: "Review & approve",
    actionType: "APPROVE",
    department: "Digital Security",
    startDate: "2026-09-01",
    endDate: "2027-08-31",
    isMine: false,
    needsSlaAttention: false,
    approvalTaskId: "baseline",
    sla: {
      dueAt: "2026-09-04T10:06:00Z",
      daysRemaining: 22,
      breached: false,
    },
    assignment: {
      mode: "NAMED",
      assignedUserId: "u-101",
      claimedBy: null,
    },
    justification:
      "Critical hire required to fulfill Q3 compliance requirements and establish the new threat response unit.",
  }),

  // 2. APPROVE (Delegated): Cloud Security Architect
  createRequest({
    requestId: "OMS-2026-0146",
    position: "Cloud Security Architect",
    resources: 1,
    actualStatus: "Department Approval",
    statusGroup: "needs-action",
    currentStage: "HOD Approval",
    currentStageIndex: 1,
    currentOwner: "Khalid Al Suwaidi",
    budget: 450000,
    updatedLabel: "1 hour ago",
    updatedAt: "2026-08-26",
    nextAction: "Review & approve",
    actionType: "APPROVE",
    department: "Digital Security",
    startDate: "2026-10-01",
    endDate: "2027-09-30",
    isMine: false,
    approvalTaskId: "delegated",
    actingFor: {
      id: "u-101",
      name: "Khalid Al Suwaidi",
    },
    sla: {
      dueAt: "2026-08-30T10:06:00Z",
      daysRemaining: 5,
      breached: false,
    },
    assignment: {
      mode: "NAMED",
      assignedUserId: "u-101",
      claimedBy: null,
    },
    justification:
      "Architectural lead required to oversee multi-cloud security fabric and secure landing zone expansion.",
  }),

  // 3. APPROVE (Role Queue, Breached SLA): Lead Infrastructure Engineer
  createRequest({
    requestId: "OMS-2026-0144",
    position: "Lead Infrastructure Engineer",
    resources: 1,
    actualStatus: "HR Approved",
    statusGroup: "needs-action",
    currentStage: "HR Review",
    currentStageIndex: 2,
    currentOwner: "HR Review Pool",
    budget: 380000,
    updatedLabel: "3 days ago",
    updatedAt: "2026-08-24",
    nextAction: "Claim",
    actionType: "APPROVE",
    department: "Infrastructure",
    startDate: "2026-09-15",
    endDate: "2027-09-14",
    isMine: false,
    approvalTaskId: "roleQueue",
    needsSlaAttention: true,
    sla: {
      dueAt: "2026-08-25T10:00:00Z",
      daysRemaining: -2,
      breached: true,
    },
    assignment: {
      mode: "ROLE_QUEUE",
      assignedUserId: null,
      claimedBy: null,
    },
  }),

  // 4. CLARIFY: Data Governance Specialist (HR Clarification Requested)
  createRequest({
    requestId: "OMS-2026-0139",
    position: "Data Governance Specialist",
    resources: 1,
    actualStatus: "More Information Required",
    statusGroup: "needs-action",
    currentStage: "HR Review",
    currentStageIndex: 1,
    currentOwner: "Aisha Al Nuaimi",
    budget: 240000,
    updatedLabel: "5 Aug 2026",
    updatedAt: "2026-08-05",
    nextAction: "Respond to HR",
    actionType: "CLARIFY",
    department: "Data Management",
    startDate: "2026-09-20",
    endDate: "2027-08-31",
    isMine: true,
    needsSlaAttention: true,
    sla: {
      dueAt: "2026-08-28T17:00:00Z",
      daysRemaining: 1,
      breached: false,
    },
  }),

  // 5. CLARIFY: Procurement Category Specialist (HR asked for clarification)
  createRequest({
    requestId: "OMS-2026-0098",
    position: "Procurement Category Specialist",
    resources: 1,
    actualStatus: "More Information Required",
    statusGroup: "needs-action",
    currentStage: "HR Review",
    currentStageIndex: 2,
    currentOwner: "Mariam Al Mansoori",
    budget: 240000,
    updatedLabel: "1 week ago",
    updatedAt: "2026-08-19",
    nextAction: "Answer question",
    actionType: "CLARIFY",
    department: "Procurement",
    startDate: "2026-10-10",
    endDate: "2027-10-09",
    isMine: true,
    sla: {
      dueAt: "2026-09-02T12:00:00Z",
      daysRemaining: 4,
      breached: false,
    },
  }),

  // 6. COMPLETE_DRAFT: PMO Analyst (Unsubmitted draft)
  createRequest({
    requestId: "OMS-2026-0114",
    position: "PMO Analyst",
    resources: 1,
    actualStatus: "Draft",
    statusGroup: "needs-action",
    currentStage: "Draft",
    currentStageIndex: 0,
    currentOwner: "Mariam Al Mansoori",
    budget: 220000,
    lockedBudget: 0,
    updatedLabel: "5 days ago",
    updatedAt: "2026-08-22",
    nextAction: "Finish draft",
    actionType: "COMPLETE_DRAFT",
    department: "Strategy & PMO",
    startDate: "2026-10-15",
    endDate: "2027-10-14",
    isMine: true,
  }),

  // 7. REVIEW_CANDIDATES: Enterprise Architect (CVs submitted)
  createRequest({
    requestId: "OMS-2026-0091",
    position: "Enterprise Architect",
    resources: 1,
    actualStatus: "Candidate Review",
    statusGroup: "needs-action",
    currentStage: "Candidate Review",
    currentStageIndex: 4,
    currentOwner: "Mariam Al Mansoori",
    budget: 410000,
    updatedLabel: "8 days ago",
    updatedAt: "2026-08-19",
    nextAction: "Review candidates",
    actionType: "REVIEW_CANDIDATES",
    department: "Enterprise Architecture",
    startDate: "2026-10-20",
    endDate: "2027-10-19",
    isMine: true,
    sla: {
      dueAt: "2026-09-06T18:00:00Z",
      daysRemaining: 8,
      breached: false,
    },
  }),

  // 8. CONFIRM_JOINING: SOC Analyst (Start date reached)
  createRequest({
    requestId: "OMS-2026-0122",
    position: "SOC Analyst",
    resources: 2,
    actualStatus: "Onboarding",
    statusGroup: "needs-action",
    currentStage: "Onboarding",
    currentStageIndex: 5,
    currentOwner: "Mariam Al Mansoori",
    budget: 340000,
    updatedLabel: "2 days ago",
    updatedAt: "2026-08-25",
    nextAction: "Confirm joining",
    actionType: "CONFIRM_JOINING",
    department: "Cybersecurity",
    startDate: "2026-09-01",
    endDate: "2027-08-31",
    isMine: true,
    sla: {
      dueAt: "2026-09-01T09:00:00Z",
      daysRemaining: 3,
      breached: false,
    },
  }),

  // 9. LOG_COMPLETION: Network Operations Engineer (Monthly logging)
  createRequest({
    requestId: "OMS-2026-0108",
    position: "Network Operations Engineer",
    resources: 2,
    actualStatus: "Active Engagement",
    statusGroup: "needs-action",
    currentStage: "Active Engagement",
    currentStageIndex: 6,
    currentOwner: "Mariam Al Mansoori",
    budget: 475000,
    updatedLabel: "6 days ago",
    updatedAt: "2026-08-21",
    nextAction: "Log monthly value",
    actionType: "LOG_COMPLETION",
    department: "Infrastructure",
    startDate: "2026-10-01",
    endDate: "2027-09-30",
    isMine: true,
    sla: {
      dueAt: "2026-08-31T23:59:00Z",
      daysRemaining: 2,
      breached: false,
    },
  }),

  // Standard In-Progress & Closed requests
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
    requestId: "OMS-2026-0087",
    position: "Finance Reporting Analyst",
    resources: 1,
    actualStatus: "Draft",
    statusGroup: "draft",
    currentStage: "Draft",
    currentStageIndex: 0,
    currentOwner: "Hessa Al Suwaidi",
    budget: 190000,
    lockedBudget: 0,
    updatedLabel: "9 days ago",
    updatedAt: "2026-08-18",
    nextAction: "Finish draft",
    actionType: "COMPLETE_DRAFT",
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