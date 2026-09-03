/**
 * HR Send Back — TypeScript Definitions
 * 
 * CRITICAL ARCHITECTURAL INVARIANT — MONETARY VALUES:
 * ALL MONETARY VALUES ARE INTEGERS IN MINOR UNITS (FILS). NEVER FLOATS, NEVER STRINGS.
 * 1 AED = 100 fils (e.g., AED 240,000.00 is represented as 24000000).
 * 
 * Asks and fields use the SAME interfaces on both sides:
 * Re-uses ClarificationAsk, ClarificationEditableField, ClarificationThreadEntry,
 * ClarificationAttachment, ClarificationType, etc. from src/types/clarification.ts.
 */

import {
  ClarificationType,
  ClarificationFieldType,
  ClarificationAsk,
  ClarificationAttachment,
  ClarificationThreadEntry,
  ClarificationUser,
  ClarificationRouteStep,
} from "./clarification";

export type {
  ClarificationType,
  ClarificationFieldType,
  ClarificationAsk,
  ClarificationAttachment,
  ClarificationThreadEntry,
  ClarificationUser,
  ClarificationRouteStep,
};

/**
 * Mode Option for HR Send-Back Mode Chooser (Part 4.1)
 */
export interface HrSendBackModeOption {
  code: ClarificationType;
  label: string;
  consequence: string;
  requiresFieldSelection: boolean;
  showsRoute: boolean;
  showsBudget: boolean;
}

/**
 * Selectable Field for HR Send-Back (Part 4.3)
 * Corresponds to the requester's ClarificationEditableField with server selection state.
 */
export interface HrSelectableField {
  key: string;
  label: string;
  type: ClarificationFieldType;
  currentValue: string | number;
  financialImpact: boolean;
  warning?: string | null;
  selectable: boolean;
}

/**
 * Suggested Ask for HR Composer (Part 4.2)
 */
export interface HrSuggestedAsk {
  id?: string;
  text: string;
  fieldKey: string | null;
}

/**
 * Authoring Ask Item (Counterpart to Requester's ClarificationAsk)
 */
export type HrSendBackAsk = ClarificationAsk;

/**
 * Re-approval route stage in HR Send-Back (Part 4.5)
 */
export interface HrSendBackRouteStage {
  stage: string;
  label?: string;
  user: {
    userId?: string;
    name: string;
    role?: string;
    avatarUrl?: string;
  };
}

/**
 * Budget information for HR Send-Back (Part 4.5)
 * Integer in minor units (fils).
 */
export interface HrSendBackBudget {
  reserved: number; // Integer in minor units (fils)
  note: string;
}

/**
 * 30-day deadline clock specification (Part 4.6)
 */
export interface HrSendBackDeadline {
  daysAllowed: number;
  closesAt: string; // ISO 8601 string
  restartsOnSend: boolean;
}

/**
 * Stored draft representation
 */
export interface HrSendBackDraft {
  mode: ClarificationType;
  message: string;
  asks: Array<{ id?: string; text: string; fieldKey: string | null }>;
  editableFieldKeys: string[];
  attachmentIds: string[];
  savedAt: string; // ISO 8601 string
}

/**
 * GET /api/v1/hr-review/{requestId}/send-back/options Response
 */
export interface HrSendBackOptionsResponse {
  requestId: string;
  requestTitle?: string;
  requester: {
    userId: string;
    name: string;
    role?: string;
    email?: string;
    avatarUrl?: string;
  };
  modes: HrSendBackModeOption[];
  selectableFields: HrSelectableField[];
  suggestedAsks: HrSuggestedAsk[];
  reapprovalRoute: HrSendBackRouteStage[];
  budget: HrSendBackBudget;
  deadline: HrSendBackDeadline;
  thread: ClarificationThreadEntry[];
  cycleNumber: number;
  draft?: HrSendBackDraft | null;
}

/**
 * PUT /api/v1/hr-review/{requestId}/send-back/draft Request & Response
 */
export interface HrSendBackDraftPayload {
  mode: ClarificationType;
  message: string;
  asks: Array<{ id?: string; text: string; fieldKey: string | null }>;
  editableFieldKeys: string[];
  attachmentIds: string[];
}

export interface HrSendBackDraftResponse {
  success: boolean;
  savedAt: string;
}

/**
 * POST /api/v1/hr-review/{requestId}/send-back Request & Response
 */
export interface HrSendBackSubmitPayload {
  mode: ClarificationType;
  message: string;
  asks: Array<{ id?: string; text: string; fieldKey: string | null }>;
  editableFieldKeys: string[];
  attachmentIds: string[];
  idempotencyKey: string;
}

export interface HrSendBackSubmitResponse {
  success: boolean;
  message: string;
  requestId: string;
  cycleNumber: number;
  nextStage: string;
  recipient?: {
    name: string;
    email?: string;
  };
}

/**
 * HR Send-Back Specific Error Codes
 */
export type HrSendBackErrorCode =
  | "FIELD_NOT_SELECTABLE"
  | "COMMENT_REQUIRED"
  | "MISSING_IDEMPOTENCY_KEY"
  | "INVALID_MODE_PAYLOAD"
  | "ATTACHMENT_SCAN_PENDING"
  | "ATTACHMENT_SCAN_FAILED"
  | "HR_REVIEW_CLOSED"
  | "NOT_ASSIGNED_REVIEWER";

export interface HrSendBackError {
  code: HrSendBackErrorCode;
  message: string;
  filename?: string;
  fieldKey?: string;
}
