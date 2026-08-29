export type RequestTab =
  | "all"
  | "draft"
  | "needs-action"
  | "in-progress"
  | "closed";

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
};