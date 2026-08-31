export type HrReviewQueueStatus =
  | "Awaiting HR Review"
  | "New"
  | "Clarification Returned";

export type HrReviewSlaState =
  | "within-target"
  | "due-soon"
  | "overdue";

export type HrReviewTab =
  | "overview"
  | "approval-trail"
  | "budget"
  | "attachments"
  | "audit";

export type HrComplianceState =
  | "passed"
  | "review-required";

export type HrApprovalState =
  | "completed"
  | "pending";

export type HrDispositionAction =
  | "approve-oms"
  | "request-more-info"
  | "request-info-with-approval"
  | "amend-request"
  | "approve-permanent-hire"
  | "reject";

export type HrDispositionTone =
  | "primary"
  | "outline"
  | "danger";

export interface HrComplianceCheck {
  id: string;
  label: string;
  state: HrComplianceState;
  note?: string;
}

export interface HrApprovalTrailItem {
  id: string;
  stage: string;
  approver: string;
  completedAt?: string;
  state: HrApprovalState;
}

export interface HrBudgetLine {
  id: string;
  label: string;
  amount: number;
}

export interface HrBudgetPosition {
  approved: number;
  reserved: number;
  availableRemaining: number;
  fundingRoute: string;
  verified: boolean;
  budgetCode: string;
  budgetName: string;
  lines: HrBudgetLine[];
}

export interface HrAttachment {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface HrAuditEntry {
  id: string;
  action: string;
  actor: string;
  occurredAt: string;
  description: string;
}

export interface HrReviewRequest {
  id: string;
  requestId: string;
  position: string;
  department: string;
  resources: number;
  engagementMonths: number;
  expectedStart: string;
  grade: string;
  location: string;
  candidateVisibility: string;
  queueStatus: HrReviewQueueStatus;
  slaAgeDays: number;
  slaTargetDays: number;
  slaState: HrReviewSlaState;
  budgetVerified: boolean;
  businessNeed: string;
  complianceChecks: HrComplianceCheck[];
  budget: HrBudgetPosition;
  approvalTrail: HrApprovalTrailItem[];
  attachments: HrAttachment[];
  audit: HrAuditEntry[];
}

export interface HrDispositionDefinition {
  id: HrDispositionAction;
  label: string;
  description: string;
  tone: HrDispositionTone;
  requiresComment: true;
}

export interface HrDispositionSubmission {
  requestId: string;
  action: HrDispositionAction;
  comment: string;
}

export const HR_REVIEW_TABS: Array<{
  value: HrReviewTab;
  label: string;
}> = [
  {
    value: "overview",
    label: "Overview",
  },
  {
    value: "approval-trail",
    label: "Approval Trail",
  },
  {
    value: "budget",
    label: "Budget",
  },
  {
    value: "attachments",
    label: "Attachments",
  },
  {
    value: "audit",
    label: "Audit",
  },
];