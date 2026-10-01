/**
 * Interview Evaluation — TypeScript Definitions
 *
 * CRITICAL ARCHITECTURAL INVARIANT 1:
 * ALL MONETARY VALUES ARE INTEGERS IN MINOR UNITS (fils: 1 AED = 100 fils).
 * Never floats. Never pre-formatted strings.
 *
 * CRITICAL ARCHITECTURAL INVARIANT 2:
 * A REJECTION WITHOUT A REASON CODE LEAVES THE CV IN AN UNDEFINED RETENTION STATE.
 * RFP Step 5 defines three distinct rejection reasons with three different data
 * retention outcomes under UAE PDPL. Modeled as a discriminated union on outcome.
 *
 * CRITICAL ARCHITECTURAL INVARIANT 3:
 * VENDOR IDENTITY IS NEVER SENT ON THIS ROUTE, INCLUDING IN ERROR MESSAGES.
 * Blind Candidate Review boundary is strictly preserved.
 */

/**
 * Candidate review priority
 */
export type CandidatePriority = "P1" | "P2" | "P3";

/**
 * Interview delivery method
 */
export type InterviewMethod = "ONLINE" | "PHYSICAL";

/**
 * Interview occurrence confirmation branch choices (RFP Step 6)
 */
export type ConfirmationChoice =
  | "WENT_AHEAD"
  | "CANDIDATE_NO_SHOW"
  | "CANCELLED"
  | "CANDIDATE_WITHDREW";

/**
 * Valid score levels (1 through 5)
 */
export type CriterionRatingLevel = 1 | 2 | 3 | 4 | 5;

/**
 * Scale anchor descriptors for ratings 1-5
 */
export type CriterionAnchorMap = Record<"1" | "2" | "3" | "4" | "5", string>;

/**
 * Details of the interview session and confirmation of occurrence (RFP Step 6)
 */
export interface InterviewDetails {
  occurred: boolean;
  confirmedAt: string | null; // UTC ISO-8601 string or null
  method: InterviewMethod;
  scheduledFor: string; // UTC ISO-8601 string
  nonOccurrenceReason?: string | null;
  nonOccurrenceNotes?: string | null;
}

/**
 * Individual weighted evaluation criterion on the scorecard
 */
export interface EvaluationCriterion {
  code: string;
  label: string;
  weightPercent: number; // e.g. 25 for 25%
  anchors: CriterionAnchorMap;
  rating: CriterionRatingLevel | null;
}

/**
 * Rating recorded by an individual panel contributor
 */
export interface PanelContributorCriterion {
  code: string;
  rating: CriterionRatingLevel | null;
}

/**
 * Contributor completion status in a multi-interviewer panel
 */
export type PanelContributorStatus = "COMPLETE" | "PENDING";

/**
 * Individual contributor in a multi-interviewer panel
 */
export interface PanelContributor {
  userId: string;
  name: string;
  role: string;
  isYou: boolean;
  status: PanelContributorStatus;
  overallScore: number | null;
  criteria: PanelContributorCriterion[];
}

/**
 * Detected rating disagreement across panel contributors (> 1.5 spread)
 */
export interface PanelDisagreement {
  criterionCode: string;
  ratings: number[];
  spread: number;
}

/**
 * Multi-interviewer panel status, contributor breakdown, and disagreement alerts
 */
export interface PanelEvaluation {
  isPanel: boolean;
  targetCount: number;
  completedCount: number;
  contributors: PanelContributor[];
  disagreements: PanelDisagreement[];
}

/**
 * Candidate background and terms for evaluation context.
 * Strictly preserves the Blind Review boundary: vendor identity is never revealed.
 */
export interface CandidateEvaluationSummary {
  experienceYears: number;
  noticePeriod: string;
  leadTimeDays: number;
  specialTerms: string;
  vendorHidden: true; // Strictly literal true; vendor identity is never exposed
}

/**
 * Financial budget variance status
 */
export type BudgetStatus = "WITHIN_BUDGET" | "OVER_BUDGET";

/**
 * Budget and cost figures.
 * ALL MONETARY VALUES ARE INTEGERS IN MINOR UNITS (fils: 1 AED = 100 fils). Never floats.
 */
export interface EvaluationCostSummary {
  approvedBudget: number; // Integer minor units (fils)
  expectedAnnualCost: number; // Integer minor units (fils)
  variance: number; // Integer minor units (fils), negative means under budget
  status: BudgetStatus;
  overBudgetConsequence: string | null;
}

/**
 * Requisition position tracking
 */
export interface PositionProgress {
  required: number;
  filled: number;
  thisWouldFill: number;
}

/**
 * PDPL-compliant rejection reason codes mapping to retention actions
 */
export type RejectionReasonCode =
  | "NOT_SUITABLE_KEEP_CV"
  | "NOT_SUITABLE_DELETE_CV"
  | "DUPLICATE_CV";

/**
 * Rejection reason item with statutory retention consequence and deletion date
 */
export interface RejectionReason {
  code: RejectionReasonCode;
  label: string;
  retentionConsequence: string;
  deletionDate: string | null; // ISO Date YYYY-MM-DD or null if kept indefinitely
}

/**
 * Evaluation deadline severity classification
 */
export type DeadlineSeverity = "NORMAL" | "WARNING" | "CRITICAL" | "OVERDUE";

/**
 * Evaluation submission deadline and countdown
 */
export interface EvaluationDeadline {
  dueAt: string; // UTC ISO-8601 string
  daysRemaining: number;
  severity: DeadlineSeverity;
  overdueMessage?: string | null;
}

/**
 * Historical audit event entry
 */
export interface EvaluationAuditEvent {
  event: string;
  label: string;
  at: string; // UTC ISO-8601 string
  actor?: string;
}

/**
 * Primary evaluation workspace payload returned by GET
 */
export interface InterviewEvaluationWorkspace {
  candidateRef: string;
  priority: CandidatePriority;
  requestId: string;
  position: string;

  interview: InterviewDetails;

  canEvaluate: boolean;
  isMainInterviewer: boolean;
  readOnlyReason: string | null;

  criteria: EvaluationCriterion[];
  overallScore: number | null; // Server-computed percentage e.g. 86.7
  overallAnchor: string | null;

  comments: string;
  strengthTags: string[];
  developmentTags: string[];
  suggestedTags: string[];

  panel: PanelEvaluation;
  candidate: CandidateEvaluationSummary;
  cost: EvaluationCostSummary;
  positions: PositionProgress;
  rejectionReasons: RejectionReason[];
  deadline: EvaluationDeadline;
  auditTrail: EvaluationAuditEvent[];
  immutabilityNotice: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Request & Response Shapes for Mutations
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Rating value input for a criterion
 */
export interface EvaluationRatingInput {
  criterionCode: string;
  rating: CriterionRatingLevel;
}

/**
 * Payload for confirming or denying that the interview took place (RFP Step 6)
 */
export interface InterviewOutcomePayload {
  occurred: boolean;
  reason?: string | null;
  notes?: string | null;
}

/**
 * Response from confirming interview occurrence
 */
export interface InterviewOutcomeResponse {
  success: boolean;
  occurred: boolean;
  updatedAt: string; // UTC ISO-8601
}

/**
 * Payload for saving an evaluation draft (debounced at 2000ms)
 */
export interface InterviewEvaluationDraftPayload {
  ratings: EvaluationRatingInput[];
  comments: string;
  strengthTags: string[];
  developmentTags: string[];
}

/**
 * Response from saving an evaluation draft
 */
export interface InterviewEvaluationDraftResponse {
  success: boolean;
  savedAt: string; // UTC ISO-8601
  overallScore?: number | null;
  overallAnchor?: string | null;
}

/**
 * Discriminated union modeling the outcome of the evaluation.
 * When outcome is "REJECT", rejectionReasonCode is strictly REQUIRED.
 * When outcome is "QUALIFY", rejectionReasonCode must NOT be present.
 */
export type InterviewEvaluationOutcome =
  | {
      outcome: "QUALIFY";
      rejectionReasonCode?: never;
    }
  | {
      outcome: "REJECT";
      rejectionReasonCode: RejectionReasonCode;
    }
  | {
      outcome?: "RATINGS_ONLY" | null;
      rejectionReasonCode?: never;
    };

/**
 * Final submission payload using the discriminated union on outcome.
 */
export type InterviewEvaluationSubmitPayload = {
  ratings: EvaluationRatingInput[];
  comments: string;
  strengthTags: string[];
  developmentTags: string[];
  idempotencyKey: string;
} & InterviewEvaluationOutcome;

/**
 * Response from submitting final evaluation
 */
export interface InterviewEvaluationSubmitResponse {
  success: boolean;
  submittedAt: string; // UTC ISO-8601
  outcome?: "QUALIFY" | "REJECT" | "RATINGS_ONLY" | null;
  rejectionReasonCode?: RejectionReasonCode | null;
  budgetAmendmentQueued?: boolean;
  message: string;
}

/**
 * Standard interview evaluation API error representation
 */
export interface InterviewEvaluationError {
  statusCode: number;
  code: string;
  message: string;
  details?: Record<string, unknown>;
}
