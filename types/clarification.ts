/**
 * Clarification Response TypeScript Definitions
 * 
 * CRITICAL ARCHITECTURAL INVARIANT — MONETARY VALUES:
 * ALL MONETARY VALUES ARE INTEGERS IN MINOR UNITS (FILS). NEVER FLOATS, NEVER STRINGS.
 * 1 AED = 100 fils (e.g., AED 240,000.00 is represented as 24000000).
 */

export type ClarificationType = "MORE_INFO" | "INFO_WITH_APPROVAL" | "AMEND";

export type ClarificationStatus = "AWAITING_RESPONSE" | "SUBMITTED" | "CLOSED";

export type ClarificationDeadlineSeverity = "NORMAL" | "WARNING" | "CRITICAL" | "OVERDUE";

export type ClarificationFieldType = "DATE" | "MONEY" | "NUMBER" | "TEXT" | "SELECT";

export type ClarificationScanStatus = "PENDING" | "VERIFIED" | "FAILED";

export type ClarificationBudgetResultStatus = "WITHIN_BUDGET" | "REQUIRES_AMENDMENT" | "INSUFFICIENT";

export interface ClarificationUser {
  userId: string;
  name: string;
  role: string;
  avatarUrl?: string;
}

export interface ClarificationAttachment {
  id: string;
  name: string;
  sizeBytes: number;
  url?: string;
  scanStatus?: ClarificationScanStatus;
}

export interface ClarificationAsk {
  id: string;
  text: string;
  fieldKey: string | null;
  addressed: boolean;
}

export interface ClarificationEditableField {
  key: string;
  label: string;
  type: ClarificationFieldType;
  currentValue: string | number;
  proposedValue: string | number;
  financialImpact: boolean;
  helpText?: string | null;
  unit?: string;
  options?: Array<{ label: string; value: string | number }>;
}

export interface ClarificationThreadEntry {
  id: string;
  actor: ClarificationUser;
  action: "SUBMITTED" | "CLARIFICATION_REQUESTED" | "RESPONSE_SUBMITTED" | "DRAFT_SAVED" | "APPROVAL_RESTARTED";
  message: string;
  attachments: ClarificationAttachment[];
  at: string; // ISO 8601 string
}

export interface ClarificationDeadline {
  closesAt: string; // ISO 8601 string
  daysRemaining: number;
  severity: ClarificationDeadlineSeverity;
}

export interface ClarificationDraft {
  message: string;
  fieldValues: Record<string, any>;
  attachments: ClarificationAttachment[];
  savedAt: string; // ISO 8601 string
}

export interface ClarificationApprover {
  userId: string;
  name: string;
  stage: string;
}

export interface ClarificationDiffItem {
  fieldKey: string;
  label: string;
  before: string;
  after: string;
  changed: boolean;
}

export interface ClarificationRouteStep {
  index: number;
  stage: string;
  label: string;
  state: "COMPLETE" | "CURRENT" | "PENDING" | "SKIPPED";
  user?: {
    id?: string;
    userId?: string;
    name: string;
    role?: string;
  };
  at?: string;
}

export interface ClarificationBudgetResult {
  applicable: boolean;
  currentReservation: number; // Integer in minor units (fils)
  changeAmount: number;       // Integer in minor units (fils)
  lineAvailable: number;      // Integer in minor units (fils)
  result: ClarificationBudgetResultStatus;
  message: string;
}

/**
 * Base Clarification Detail Properties
 */
interface BaseClarificationDetail {
  clarificationId: string;
  requestId: string;
  requestTitle: string;
  status: ClarificationStatus;
  canRespond: boolean;
  readOnlyReason: string | null;
  raisedBy: ClarificationUser;
  raisedAt: string; // ISO 8601 string
  message: string;
  attachments: ClarificationAttachment[];
  asks: ClarificationAsk[];
  thread: ClarificationThreadEntry[];
  cycleNumber: number;
  deadline: ClarificationDeadline;
  draft?: ClarificationDraft;
}

/**
 * Discriminated Union Member 1: MORE_INFO
 * For "MORE_INFO", diff, route, and budget panels are strictly absent.
 */
export interface MoreInfoClarificationDetail extends BaseClarificationDetail {
  type: "MORE_INFO";
  editableFields?: never[];
  consequence: {
    requiresReapproval: false;
    approvers: never[];
    summary: string;
  };
}

/**
 * Discriminated Union Member 2: INFO_WITH_APPROVAL
 */
export interface InfoWithApprovalClarificationDetail extends BaseClarificationDetail {
  type: "INFO_WITH_APPROVAL";
  editableFields: ClarificationEditableField[];
  consequence: {
    requiresReapproval: true;
    approvers: ClarificationApprover[];
    summary: string;
  };
}

/**
 * Discriminated Union Member 3: AMEND
 */
export interface AmendClarificationDetail extends BaseClarificationDetail {
  type: "AMEND";
  editableFields: ClarificationEditableField[];
  consequence: {
    requiresReapproval: true;
    approvers: ClarificationApprover[];
    summary: string;
  };
}

/**
 * Full Discriminated Union for Clarification Details
 */
export type ClarificationDetail =
  | MoreInfoClarificationDetail
  | InfoWithApprovalClarificationDetail
  | AmendClarificationDetail;

/**
 * Preview API Request & Response Shapes
 */
export interface ClarificationPreviewPayload {
  fieldValues: Record<string, any>;
}

export interface MoreInfoClarificationPreviewResponse {
  type: "MORE_INFO";
  asksAddressed: string[];
  diff?: never;
  route?: never;
  budget?: never;
}

export interface ApprovalClarificationPreviewResponse {
  type: "INFO_WITH_APPROVAL" | "AMEND";
  diff: ClarificationDiffItem[];
  route: ClarificationRouteStep[];
  budget: ClarificationBudgetResult;
  asksAddressed: string[];
}

export type ClarificationPreviewResponse =
  | MoreInfoClarificationPreviewResponse
  | ApprovalClarificationPreviewResponse;

/**
 * Draft Save Payload & Response
 */
export interface ClarificationDraftPayload {
  message: string;
  fieldValues: Record<string, any>;
  attachmentIds: string[];
}

export interface ClarificationDraftResponse {
  success: boolean;
  savedAt: string;
}

/**
 * Final Submit Payload & Response
 */
export interface ClarificationSubmitPayload {
  message: string;
  fieldValues: Record<string, any>;
  attachmentIds: string[];
  idempotencyKey: string;
}

export interface ClarificationSubmitResponse {
  success: boolean;
  message: string;
  requestId: string;
  nextStage?: string;
  nextApproverName?: string;
}

export type ClarificationErrorCode =
  | "MISSING_IDEMPOTENCY_KEY"
  | "INVALID_FIELD_PAYLOAD"
  | "NOT_ASSIGNED_REQUESTOR"
  | "CLARIFICATION_NOT_FOUND"
  | "CLARIFICATION_BUDGET_CHANGED"
  | "CLARIFICATION_ALREADY_SUBMITTED"
  | "CLARIFICATION_CLOSED"
  | "ATTACHMENT_SCAN_PENDING"
  | "ATTACHMENT_SCAN_FAILED";

export interface ClarificationSubmitError {
  code: ClarificationErrorCode;
  message: string;
  filename?: string;
  submittedAt?: string;
  newBudget?: ClarificationBudgetResult;
}

