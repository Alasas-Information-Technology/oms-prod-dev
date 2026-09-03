export interface HrReviewDepartment {
  id: string;
  name: string;
}

export interface HrReviewSla {
  targetDays: number;
  dueAt: string;
  overdueDays: number;
  breached: boolean;
}

export type HrReviewFlag = "BUDGET_VERIFIED" | "NEW";

export interface HrReviewQueueItem {
  requestId: string;
  position: string;
  department: HrReviewDepartment;
  ageDays: number;
  sla: HrReviewSla;
  flags: HrReviewFlag[];
  returnedFromClarification: boolean;
  amount: number;
}

export interface HrReviewQueueCounts {
  total: number;
  overdue: number;
  returned: number;
}

export interface HrReviewQueueResponse {
  items: HrReviewQueueItem[];
  counts: HrReviewQueueCounts;
  slaTargetDays: number;
}

export interface HrReviewRequestDetail {
  id: string;
  position: string;
  badges: string[];
  resources: number;
  engagementMonths: number;
  expectedStart: string;
  grade: string;
  workLocation: string;
  candidateRoute: string;
  justification: string;
}

export type HrSystemCheckState = "PASSED" | "FAILED";

export interface HrSystemCheck {
  code: string;
  label: string;
  state: HrSystemCheckState;
  checkedAt: string;
  blocksApproval: boolean;
  failureReason: string | null;
}

export interface HrConfirmationContext {
  current: number;
  target: number;
  unit: string;
}

export interface HrConfirmation {
  code: string;
  label: string;
  confirmed: boolean;
  note: string | null;
  context: HrConfirmationContext | null;
}

export interface HrBudgetLine {
  code: string;
  name: string;
  amount: number;
}

export interface HrBudget {
  approved: number;
  reserved: number;
  availableRemaining: number;
  fundingRoute: string;
  verified: boolean;
  lines: HrBudgetLine[];
}

export interface HrApprovalUser {
  id: string;
  name: string;
}

export interface HrApprovalTrailItem {
  stage: string;
  label: string;
  user: HrApprovalUser;
  at: string;
  comment: string | null;
}

export interface HrClarificationContext {
  hadClarification: boolean;
  askedAt: string;
  askedBy: HrApprovalUser;
  askMessage: string;
  respondedAt: string;
  respondedBy: HrApprovalUser;
  fieldsChanged: number;
  attachmentsAdded: number;
  diffLink: string;
}

export interface HrReapprovalRouteItem {
  stage: string;
  user: {
    name: string;
  };
}

export type HrReviewDecision = "APPROVE_OMS" | "SEND_BACK" | "PERMANENT_HIRE" | "REJECT";
export type HrReviewSendBackMode = "MORE_INFO" | "INFO_WITH_APPROVAL" | "AMEND";

export interface HrReviewDetailResponse {
  request: HrReviewRequestDetail;
  canDecide: boolean;
  readOnlyReason: string | null;
  systemChecks: HrSystemCheck[];
  hrConfirmations: HrConfirmation[];
  budget: HrBudget;
  approvalTrail: HrApprovalTrailItem[];
  clarificationContext: HrClarificationContext | null;
  availableDecisions: HrReviewDecision[];
  sendBackModes: HrReviewSendBackMode[];
  reapprovalRoute: HrReapprovalRouteItem[];
}

export interface HrConfirmationUpdatePayload {
  code: string;
  confirmed: boolean;
  note?: string;
}

export interface HrDecisionPayload {
  decision: HrReviewDecision;
  sendBackMode?: HrReviewSendBackMode;
  comment: string;
  idempotencyKey: string;
}

export type HrReviewTab =
  | "overview"
  | "approval-trail"
  | "budget"
  | "attachments"
  | "audit";

export const HR_REVIEW_TABS: { value: HrReviewTab; label: string }[] = [
  { value: "overview", label: "Overview" },
  { value: "approval-trail", label: "Approval trail" },
  { value: "budget", label: "Budget" },
  { value: "attachments", label: "Attachments" },
  { value: "audit", label: "Audit" },
];

export type HrReviewQueueStatus = "new" | "awaiting_hr" | "clarification_returned";
export type HrReviewSlaState = "within-target" | "due-soon" | "overdue";
export interface HrAttachment {
  id: string;
  name: string;
  size: number;
  uploadedAt: string;
  uploadedBy: string;
  type: string;
}
export interface HrAuditEntry {
  id: string;
  action: string;
  occurredAt: string;
  actor: string;
  description?: string;
}
