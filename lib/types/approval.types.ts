export type ApprovalType = "REQUISITION" | "BUDGET_AMENDMENT" | "BYPASS_INTERVIEW" | "CLOSURE_REQUEST" | "TERMINATION" | "PERIOD_CLOSE_REOPEN" | "LEAVE" | "VENDOR_RATE_CARD";
export type AssignmentMode = "NAMED" | "ROLE_QUEUE";
export type PriorityLevel = "LOW" | "NORMAL" | "HIGH" | "URGENT";
export type StageState = "PENDING" | "CURRENT" | "COMPLETE" | "SKIPPED";
export type CheckState = "PASSED" | "FAILED" | "VERIFIED" | "PENDING";
export type DecisionAction = "APPROVE" | "SEND_BACK" | "REJECT" | "SUBMITTED";

export interface UserSummary {
  id: string;
  name: string;
  email?: string;
  avatarUrl?: string;
}

export interface ApprovalStage {
  index: number;
  code: string;
  label: string;
  state: StageState;
  user?: UserSummary;
  at?: string;
}

export interface ApprovalHistoryItem {
  user: UserSummary;
  action: DecisionAction;
  stage?: string;
  comment?: string;
  at: string;
}

export interface RequisitionSubject {
  requestId: string;
  position: string;
  department: {
    id: string;
    name: string;
  };
  resources: number;
  engagementMonths: number;
  workLocation: string;
  expectedStart: string;
  salaryGrade: string;
  candidateRoute: string;
  justification: string;
  evidence: {
    jobDescriptionAttached: boolean;
    supportingDocumentCount: number;
    adHierarchyVerified: boolean;
  };
  attachments: Array<{
    id: string;
    name: string;
    sizeBytes: number;
    uploadedAt: string;
  }>;
}

export interface RequisitionImpact {
  fundingRoute: string;
  requested: number;
  availableBefore: number;
  reservedNow: number;
  remainingAfter: number;
  currency: string;
  allocations: Array<{
    budgetLineId: string;
    code: string;
    name: string;
    amount: number;
  }>;
  fundStateTransition: {
    from: string;
    to: string;
  } | null;
  periodOpen: boolean;
}

export interface PreflightCheck {
  code: string;
  label: string;
  state: CheckState;
}

export interface PreflightResult {
  checks: PreflightCheck[];
  allPassed: boolean;
  blockingMessage: string | null;
}

export interface ApprovalTaskSummary {
  approvalTaskId: string;
  type: ApprovalType;
  subjectId: string;
  subjectRef: string;
  title: string;
  context: string;
  stage: {
    code: string;
    label: string;
    index: number;
    total: number;
  };
  assignment: {
    mode: AssignmentMode;
    assignedUserId: string | null;
    claimedBy: UserSummary | null;
  };
  actingFor: UserSummary | null;
  amount: number;
  currency: string;
  submittedAt: string;
  assignedAt: string;
  sla: {
    dueAt: string;
    daysRemaining: number;
    breached: boolean;
  };
  priority: PriorityLevel;
}

export interface ApprovalTaskDetail {
  task: ApprovalTaskSummary;
  canAct: boolean;
  actingFor: UserSummary | null;
  readOnlyReason: string | null;
  route: ApprovalStage[];
  subject: RequisitionSubject; // Extensible for other types in the future via union
  history: ApprovalHistoryItem[];
  impact: RequisitionImpact;
  preflight: PreflightResult;
  availableActions: DecisionAction[];
}

export interface ApprovalsListResponse {
  items: ApprovalTaskSummary[];
  counts: {
    all: number;
    requisition: number;
    budget: number;
    other: number;
    breached: number;
  };
}

export interface ApprovalDecisionRequest {
  comment?: string;
  sendBackToStage?: string;
  reasonCode?: string;
  idempotencyKey: string;
}

export type ApprovalErrorCode =
  | "APPROVAL_NOT_ASSIGNED"
  | "APPROVAL_ALREADY_DECIDED"
  | "APPROVAL_BUDGET_CHANGED"
  | "APPROVAL_PERIOD_CLOSED"
  | "APPROVAL_SELF"
  | "APPROVAL_PREFLIGHT_FAILED";

export interface ApprovalApiError {
  code: ApprovalErrorCode | string;
  message: string;
  decidedBy?: string;
  movedTo?: string;
  newImpact?: RequisitionImpact;
}
