/**
 * Candidate Budget Amendment — TypeScript Definitions
 *
 * CRITICAL ARCHITECTURAL INVARIANT 1: SIGN CONVENTION
 * Cost changes are POSITIVE; remaining-budget changes are NEGATIVE.
 *  - An increase to candidate cost: +20,000.00 (+2,000,000 fils).
 *  - A decrease to budget line remaining: -20,000.00 (-2,000,000 fils).
 * All figures are server-computed. Never inferred or inverted per-row client-side.
 *
 * CRITICAL ARCHITECTURAL INVARIANT 2: MONETARY VALUES
 * All monetary amounts are strictly integers in minor units (fils: 1 AED = 100 fils).
 * Never floats. Never formatted currency strings.
 *
 * CRITICAL ARCHITECTURAL INVARIANT 3: SCOPING
 * Budget lines are strictly pre-filtered to the caller's authorized department scope.
 */

/**
 * Budget amendment status tone for candidate evaluation cost
 */
export type AmendmentCostStatus = "OVER_BUDGET" | "WITHIN_BUDGET";

/**
 * Summary of approved vs. qualified candidate cost
 */
export interface AmendmentCostSummary {
  approved: number; // in fils (e.g. 31000000 = AED 310,000.00)
  qualified: number; // in fils (e.g. 33000000 = AED 330,000.00)
  shortfall: number; // in fils (e.g. 2000000 = AED 20,000.00)
  variancePercent: number; // e.g. 6.45 for 6.45%
  status: AmendmentCostStatus;
}

/**
 * Lineage trigger metadata connecting amendment to interview evaluation
 */
export interface AmendmentTriggeredBy {
  event: "CANDIDATE_QUALIFIED" | string;
  at: string; // UTC ISO-8601 string e.g. "2026-08-12T11:46:00Z"
  evaluationId?: string;
}

/**
 * Supported funding route codes
 */
export type FundingRouteCode = "BUDGETED" | "UNALLOCATED" | "UNBUDGETED";

/**
 * Scoped available budget line eligible for fund drawdown
 */
export interface AvailableBudgetLine {
  lineId: string;
  code: string;
  name: string;
  available: number; // in fils
}

/**
 * Funding route descriptor with consequence sentence and eligible lines
 */
export interface FundingRouteOption {
  code: FundingRouteCode;
  label: string;
  consequence: string;
  availableLines: AvailableBudgetLine[];
}

/**
 * Reapproval workflow stage codes
 */
export type ReapprovalStageCode =
  | "REQUESTOR"
  | "LINE_MANAGER"
  | "SECTION_HEAD"
  | "HOD"
  | "HR"
  | "FINANCE";

/**
 * Named step in the ReapprovalRoute chain
 */
export interface ReapprovalRouteStep {
  stage: ReapprovalStageCode | string;
  user: {
    name: string;
    userId?: string;
    email?: string;
  };
  role?: string;
  status?: "COMPLETED" | "CURRENT" | "PENDING";
  rejectionConsequence: string;
}

/**
 * Deadline severity escalation states
 */
export type AmendmentDeadlineSeverity = "NORMAL" | "WARNING" | "CRITICAL";

/**
 * 30-day request deadline tracking
 */
export interface AmendmentDeadline {
  closesAt: string; // UTC ISO-8601 string
  daysRemaining: number;
  severity: AmendmentDeadlineSeverity;
}

/**
 * Revised budget position comparison row.
 * Sign Rule:
 *   - Cost increases are POSITIVE (e.g., +20,000.00)
 *   - Remaining budget decreases are NEGATIVE (e.g., -20,000.00)
 */
export interface RevisedPositionRow {
  item: string;
  current: number; // in fils
  revised: number; // in fils
  change: number; // in fils: POSITIVE for cost increase, NEGATIVE for remaining budget decrease
}

/**
 * Result of the server-computed preview calculation
 */
export interface AmendmentPreviewResponse {
  revisedPosition: RevisedPositionRow[];
  balanced: boolean;
  totalAllocated: number; // in fils
  shortfallRemaining: number; // in fils
}

/**
 * Root workspace data for Candidate Budget Amendment (/app/requests/{requestId}/amendments/{amendmentId})
 */
export interface BudgetAmendmentWorkspace {
  amendmentId: string;
  requestId: string;
  candidateRef: string;
  position: string;
  triggeredBy: AmendmentTriggeredBy;

  canAct: boolean;
  readOnlyReason: string | null;

  cost: AmendmentCostSummary;
  fundingRoutes: FundingRouteOption[];
  reapprovalRoute: ReapprovalRouteStep[];
  unbudgetedReapprovalRoute?: ReapprovalRouteStep[];
  genericRejectionConsequence?: string;
  deadline: AmendmentDeadline;

  cancelConsequence: string;

  draft?: {
    fundingRoute: FundingRouteCode;
    allocations: AmendmentAllocationInput[];
    justification: string;
    attachmentIds: string[];
  } | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Request & Mutation Payloads
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Specific line allocation input
 */
export interface AmendmentAllocationInput {
  lineId: string;
  amount: number; // in fils
}

/**
 * Payload for POST …/preview (debounced at 500ms)
 */
export interface AmendmentPreviewPayload {
  fundingRoute: FundingRouteCode;
  allocations: AmendmentAllocationInput[];
}

/**
 * Payload for PUT …/draft (debounced at 2000ms)
 */
export interface BudgetAmendmentDraftPayload {
  fundingRoute: FundingRouteCode;
  allocations: AmendmentAllocationInput[];
  justification?: string;
  attachmentIds?: string[];
}

/**
 * Response for PUT …/draft
 */
export interface BudgetAmendmentDraftResponse {
  success: boolean;
  savedAt: string; // UTC ISO-8601 string
  amendmentId: string;
}

/**
 * Payload for POST …/submit
 */
export interface BudgetAmendmentSubmitPayload {
  fundingRoute: FundingRouteCode;
  allocations: AmendmentAllocationInput[];
  justification: string;
  attachmentIds: string[];
  idempotencyKey: string;
}

/**
 * Response for POST …/submit
 */
export interface BudgetAmendmentSubmitResponse {
  success: boolean;
  submittedAt: string; // UTC ISO-8601 string
  amendmentId: string;
  nextApprover: {
    name: string;
    stage: string;
  };
  message: string;
}

/**
 * Payload for POST …/cancel
 */
export interface BudgetAmendmentCancelPayload {
  reason?: string;
  idempotencyKey?: string;
}

/**
 * Response for POST …/cancel
 */
export interface BudgetAmendmentCancelResponse {
  success: boolean;
  cancelledAt: string; // UTC ISO-8601 string
  candidateRef: string;
  candidateStatus: "QUALIFIED_PENDING_BUDGET" | string;
  message: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Error Contract
// ─────────────────────────────────────────────────────────────────────────────

export type BudgetAmendmentErrorCode =
  | "AMENDMENT_INSUFFICIENT_FUNDS"
  | "AMENDMENT_LINE_CLOSED"
  | "AMENDMENT_ALREADY_DECIDED"
  | "AMENDMENT_IDEMPOTENCY_MISSING"
  | "AMENDMENT_IDEMPOTENCY_CONFLICT"
  | "AMENDMENT_UNBUDGETED_ALLOCATIONS_FORBIDDEN"
  | "AMENDMENT_SHORTFALL_UNMET"
  | "AMENDMENT_JUSTIFICATION_REQUIRED"
  | "AMENDMENT_NOT_FOUND"
  | "AMENDMENT_UNAUTHORIZED";

export interface BudgetAmendmentError {
  statusCode: number;
  code: BudgetAmendmentErrorCode | string;
  message: string;
  details?: Record<string, unknown>;
}
