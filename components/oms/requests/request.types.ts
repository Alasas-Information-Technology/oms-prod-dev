export type RequestTab =
  | "all"
  | "draft"
  | "needs-action"
  | "in-progress"
  | "closed";

export type RequestStatusGroup = Exclude<RequestTab, "all">;

export type RequestActualStatus =
  | "Draft"
  | "Department Approval"
  | "More Information Required"
  | "HR Approved"
  | "Procurement"
  | "Candidate Review"
  | "Onboarding"
  | "Active Engagement"
  | "Closed";

export type LifecycleStepState =
  | "completed"
  | "current"
  | "upcoming";

export interface RequestLifecycleStep {
  id: string;
  label: string;
  state: LifecycleStepState;
  completedAt?: string;
  description?: string;
}

export type NeedsActionType =
  | "APPROVE"
  | "REVISE"
  | "CLARIFY"
  | "COMPLETE_DRAFT"
  | "REVIEW_CANDIDATES"
  | "CONFIRM_JOINING"
  | "LOG_COMPLETION";

export type NeedsActionSubFilter =
  | "all"
  | "approvals"
  | "revision"
  | "drafts"
  | "other";

export interface OmsRequest {
  id: string;
  requestId: string;

  position: string;
  resources: number;

  actualStatus: RequestActualStatus;
  statusGroup: Exclude<RequestTab, "all">;

  currentStage: string;
  currentOwner: string;

  budget: number;
  lockedBudget: number;

  updatedLabel: string;
  updatedAt: string;

  nextAction: string;
  actionType?: NeedsActionType;

  sla?: {
    dueAt: string;
    daysRemaining: number;
    breached: boolean;
  };

  assignment?: {
    mode: "NAMED" | "ROLE_QUEUE";
    assignedUserId: string | null;
    claimedBy: { id: string; name: string } | null;
  };

  actingFor?: { id: string; name: string } | null;
  approvalTaskId?: string;

  organization: string;
  businessUnit: string;
  department: string;

  requestedBy: string;
  requestedOn: string;

  engagementType: string;
  location: string;

  startDate: string;
  endDate: string;

  justification: string;

  isMine: boolean;
  isActive: boolean;
  needsSlaAttention: boolean;

  lifecycle: RequestLifecycleStep[];
}

export type RequestSavedView =
  | "default"
  | "my-active"
  | "needs-action"
  | "sla-attention"
  | string;

export interface RequestFilters {
  search: string;
  organization: string;
  department: string;
  actualStatus: string;
  currentOwner: string;

  startDate: string;
  endDate: string;

  activeOnly: boolean;
  slaOnly: boolean;
  needsActionOnly: boolean;
  savedView?: RequestSavedView;
}

export type RequestFiltersState = RequestFilters;

export interface NewRequestDraft {
  position: string;
  resources: number;
  department: string;
  budget: number;
  justification?: string;
}

export const EMPTY_REQUEST_FILTERS: RequestFilters = {
  search: "",
  organization: "all",
  department: "all",
  actualStatus: "all",
  currentOwner: "all",

  startDate: "",
  endDate: "",

  activeOnly: false,
  slaOnly: false,
  needsActionOnly: false,
  savedView: "default",
};