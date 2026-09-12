/**
 * Canonical Entities for DIEZ OMS Demo Data
 * Specification: docs/DEMO-DATA-INTEGRATION.md Part 2
 *
 * All monetary amounts are integers in minor units (fils: 1 AED = 100 fils).
 * All dates are ISO-8601 strings.
 * Every requisition-linked entity carries requisitionId (and candidateRef where relevant)
 * as its foreign key to enable unified cross-page navigation.
 */

// ============================================================================
// 1. Core Organization & Actors
// ============================================================================

export type UserType = "INTERNAL" | "VENDOR";

export interface Person {
  id: string; // e.g. "usr-mariam"
  name: string; // e.g. "Mariam Al Mansoori"
  email: string;
  role: string; // e.g. "Department Requestor", "Line Manager", "Section Head", etc.
  scope: string; // e.g. "Digital Security, Data Management", "Organisation-wide"
  departmentId: string; // e.g. "dept-digital-security"
  userType: UserType; // "INTERNAL" | "VENDOR"
  vendorId?: string | null; // e.g. "ven-falcon" for Layla Hassan
  initials: string; // e.g. "MM", "OH"
  title?: string; // Job title in directory
  avatarUrl?: string;
  departmentName?: string;
}

export type OrgUnitType = "ORGANIZATION" | "BUSINESS_UNIT" | "DEPARTMENT" | "SECTION";

export interface OrgUnit {
  id: string; // e.g. "dept-digital-security"
  code: string; // e.g. "DIG_SEC"
  name: string; // e.g. "Digital Security"
  type: OrgUnitType;
  parentId: string | null;
  managerId: string | null; // Person.id
  requisitionCount?: number;
}

export interface BudgetLine {
  id: string; // e.g. "line-cs-dig-001"
  code: string; // e.g. "CS-DIG-001"
  name: string; // e.g. "Cybersecurity Services FY2026"
  departmentId: string;
  fiscalYear: number; // e.g. 2026
  allocated: number; // in fils (e.g. 320000000 = AED 3,200,000.00)
  committed: number; // in fils
  spent: number; // in fils
  available: number; // in fils (allocated - committed - spent)
  currency: "AED";
  periodOpen: boolean;
}

export interface Vendor {
  id: string; // e.g. "ven-falcon"
  code: string; // e.g. "FALCON_TECH"
  name: string; // e.g. "Falcon Tech Resourcing"
  status: "ACTIVE" | "INACTIVE" | "PENDING";
  coordinatorId: string | null; // Person.id, e.g. "usr-layla"
  email?: string;
  phone?: string;
  tier?: string;
}

// ============================================================================
// 2. Requisition
// ============================================================================

export type RequisitionStage =
  | "DRAFT"
  | "PENDING_APPROVAL"
  | "HR_REVIEW"
  | "CLARIFICATION"
  | "SOURCING"
  | "INTERVIEW"
  | "EVALUATION"
  | "AMENDMENT"
  | "ONBOARDING"
  | "ACTIVE"
  | "ENDING_SOON"
  | "TERMINATED"
  | "RE_SOURCING";

export type ApprovalStageCode =
  | "REQUESTOR"
  | "LINE_MANAGER"
  | "SECTION_HEAD"
  | "HOD"
  | "HR_REVIEW"
  | "PROCUREMENT"
  | "FINANCE";

export type ApprovalStepState = "COMPLETE" | "CURRENT" | "PENDING" | "SKIPPED";

export interface RequisitionApprovalStep {
  index: number;
  stageCode: ApprovalStageCode;
  label: string;
  state: ApprovalStepState;
  userId?: string | null;
  userName?: string;
  actionedAt?: string | null;
  comment?: string | null;
}

export interface BudgetAllocation {
  budgetLineId: string;
  code: string;
  name: string;
  amount: number; // in fils
}

export interface RequisitionSla {
  targetDays: number;
  dueAt: string;
  daysRemaining: number;
  breached: boolean;
  overdueDays: number;
}

export interface Requisition {
  id: string; // Canonical format e.g. "OMS-2026-0148"
  positionTitle: string;
  departmentId: string;
  departmentName: string;
  requestorId: string;
  currentStage: RequisitionStage;
  stageLabel: string;
  positions: {
    required: number;
    filled: number;
    inProgress: number;
  };
  engagementMonths: number;
  workLocation: "DIEZ_PREMISES" | "HYBRID" | "REMOTE" | string;
  expectedStartDate: string; // ISO date YYYY-MM-DD
  salaryGrade: string; // e.g. "G8"
  candidateRoute: "KNOWN" | "UNKNOWN";
  justification: string;
  budgetAmount: number; // in fils (e.g. 62000000 = AED 620,000.00)
  currency: "AED";
  fundingRoute: "BUDGETED" | "UNALLOCATED" | "UNBUDGETED";
  allocations: BudgetAllocation[];
  approvalRoute: RequisitionApprovalStep[];
  submittedAt: string | null;
  createdAt: string;
  updatedAt: string;
  sla?: RequisitionSla;
  flags: string[]; // e.g. ["BUDGET_VERIFIED", "NEW", "RETURNED", "OVERDUE"]
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
    url?: string;
  }>;
  // Linkage for replacement workflows
  replacementRequisitionId?: string | null; // e.g. "OMS-2026-0074-R"
  replacementForRequisitionId?: string | null; // e.g. "OMS-2026-0074"
}

// ============================================================================
// 3. Candidate
// ============================================================================

export type CandidatePriority = "P1" | "P2" | "P3";

export type CandidateStatus =
  | "SOURCING"
  | "SHORTLISTED"
  | "INTERVIEW_PENDING"
  | "INTERVIEW_SCHEDULED"
  | "EVALUATED"
  | "QUALIFIED"
  | "QUALIFIED_PENDING_BUDGET"
  | "ONBOARDING"
  | "HIRED"
  | "REJECTED"
  | "WITHDRAWN";

export type ResidentStatus = "ONSHORE" | "OFFSHORE";

export interface Candidate {
  candidateRef: string; // e.g. "C-014"
  requisitionId: string; // foreign key to Requisition
  fullName: string; // Real name (anonymised during blind interview evaluation)
  anonymisedRef: string; // e.g. "Candidate C-014"
  priority: CandidatePriority;
  status: CandidateStatus;
  nationality: string;
  residentStatus: ResidentStatus;
  timezone: string; // e.g. "Asia/Dubai", "Asia/Kolkata"
  experienceYears: number;
  noticePeriod: string;
  leadTimeDays: number;
  expectedAnnualCost: number; // in fils (e.g. 33000000)
  approvedBudget: number; // in fils (e.g. 31000000)
  vendorId: string; // e.g. "ven-falcon"
  vendorHidden: boolean; // true during blind candidate review
  email: string;
  mobile: string;
  submittedAt?: string; // e.g. "2026-08-15T09:00:00Z"
  rejectionDetails?: {
    reasonCode: "NOT_SUITABLE_KEEP_CV" | "NOT_SUITABLE_DELETE_CV" | "DUPLICATE_CV";
    label: string;
    retentionConsequence: string;
    rejectedAt: string;
    retentionDeletionDate: string | null; // concrete date under PDPL if deleted
  } | null;
}

// ============================================================================
// 4. Interview Planning
// ============================================================================

export type InterviewSchedulingStatus =
  | "NOT_SENT"
  | "AWAITING_REPLY"
  | "DECLINED"
  | "CONFIRMED"
  | "SCHEDULED"
  | "RESCHEDULING"
  | "ALTERNATIVE_REQUESTED"
  | "AWAITING_OUTCOME"
  | "BYPASS_REQUESTED";

export interface InterviewProposedSlot {
  start: string; // UTC ISO-8601 string
  durationMinutes: number;
}

export interface InterviewProposalSettings {
  method: "ONLINE" | "PHYSICAL";
  platform?: "MICROSOFT_TEAMS" | "ZOOM" | "GOOGLE_MEET" | "OTHER" | null;
  location?: string | null;
  replyByDate: string; // YYYY-MM-DD
  allowAlternatives: boolean;
  allowReschedule: boolean;
}

export interface InterviewPlan {
  id: string; // e.g. "int-plan-0148-014"
  requisitionId: string; // foreign key
  candidateRef: string; // foreign key
  status: InterviewSchedulingStatus;
  daysWaiting: number;
  methodPreference: "ONLINE" | "PHYSICAL" | "NO_PREFERENCE";
  timezone: string;
  isOffshore: boolean;
  rescheduleCount: number;
  alternativeRequestNote?: string | null;
  withdrawnSlot?: {
    start: string;
    durationMinutes: number;
    reason: string;
  } | null;
  proposal: {
    slots: InterviewProposedSlot[];
    settings: InterviewProposalSettings;
    sentAt: string | null;
  };
  interviewers: Array<{
    userId: string;
    name: string;
    initials: string;
    role: string;
    isMain: boolean;
  }>;
  scheduledSlot?: InterviewProposedSlot | null;
  confirmedAt?: string | null;
  occurred?: boolean;
}

// ============================================================================
// 5. Interview Evaluation
// ============================================================================

export interface EvaluationCriterion {
  code: string;
  label: string;
  weightPercent: number;
  anchors: Record<string, string>;
  rating: number; // 1-5
}

export interface PanelContributorEvaluation {
  userId: string;
  name: string;
  role: string;
  status: "COMPLETE" | "PENDING";
  overallScore: number | null;
  criteria: Array<{ code: string; rating: number }>;
}

export interface DisagreementAlert {
  criterionCode: string;
  ratings: number[];
  spread: number;
}

export interface EvaluationCost {
  approvedBudget: number; // in fils
  expectedAnnualCost: number; // in fils
  variance: number; // in fils: positive if over budget, negative if under
  status: "WITHIN_BUDGET" | "OVER_BUDGET";
  overBudgetConsequence?: string | null;
}

export interface Evaluation {
  id: string; // e.g. "eval-2026-0148-014"
  requisitionId: string; // foreign key
  candidateRef: string; // foreign key
  interview: {
    occurred: boolean;
    confirmedAt: string;
    method: "ONLINE" | "PHYSICAL";
    scheduledFor: string;
    nonOccurrenceReason?: string | null;
    nonOccurrenceNotes?: string | null;
  };
  overallScore: number; // e.g. 86.7
  overallAnchor: string; // e.g. "Above requirement"
  outcome: "QUALIFY" | "REJECT" | "PENDING";
  criteria: EvaluationCriterion[];
  comments: string;
  strengthTags: string[];
  developmentTags: string[];
  suggestedTags: string[];
  panel: {
    isPanel: boolean;
    targetCount: number;
    completedCount: number;
    contributors: PanelContributorEvaluation[];
    disagreements: DisagreementAlert[];
  };
  cost: EvaluationCost;
  positions: {
    required: number;
    filled: number;
    thisWouldFill: number;
  };
  rejectionReasonCode?: string | null;
  rejectionRetentionDate?: string | null;
  submittedAt?: string | null;
  mainEvaluatorId: string; // Person.id
}

// ============================================================================
// 6. Budget Amendment
// ============================================================================

export interface AmendmentCost {
  approved: number; // in fils
  qualified: number; // in fils
  shortfall: number; // in fils
  variancePercent: number; // e.g. 6.45
  status: "OVER_BUDGET" | "WITHIN_BUDGET";
}

export interface AmendmentReapprovalStep {
  stage: ApprovalStageCode | string;
  user: {
    name: string;
    userId: string;
    email?: string;
  };
  role: string;
  status: "COMPLETED" | "CURRENT" | "PENDING";
  actionedAt?: string | null;
  rejectionConsequence: string;
}

export interface RevisedPositionRow {
  item: string;
  current: number; // in fils
  revised: number; // in fils
  change: number; // positive for cost increase, negative for budget line decrease
}

export interface Amendment {
  id: string; // e.g. "amd-2026-0089"
  requisitionId: string; // foreign key
  candidateRef: string; // foreign key
  positionTitle: string;
  status: "DRAFT" | "SUBMITTED" | "AWAITING_APPROVAL" | "APPROVED" | "REJECTED" | "CANCELLED";
  triggeredBy: {
    event: "CANDIDATE_QUALIFIED" | string;
    at: string;
    evaluationId: string;
  };
  cost: AmendmentCost;
  fundingRoute: "BUDGETED" | "UNALLOCATED" | "UNBUDGETED";
  selectedLines: Array<{
    lineId: string;
    code: string;
    name: string;
    drawdownAmount: number; // in fils
  }>;
  reapprovalRoute: AmendmentReapprovalStep[];
  revisedPosition: RevisedPositionRow[];
  deadline: {
    closesAt: string;
    daysRemaining: number;
    severity: "NORMAL" | "WARNING" | "CRITICAL";
  };
  currentAssigneeId: string; // Person.id who must act
  submittedAt: string;
  justification: string;
}

// ============================================================================
// 7. Clarification
// ============================================================================

export type ClarificationType = "MORE_INFO" | "INFO_WITH_APPROVAL" | "AMEND";
export type ClarificationStatus = "AWAITING_RESPONSE" | "SUBMITTED" | "CLOSED";

export interface ClarificationAsk {
  id: string;
  text: string;
  fieldKey: string | null;
  addressed: boolean;
}

export interface ClarificationEditableField {
  key: string;
  label: string;
  type: "DATE" | "NUMBER" | "TEXT" | "MONEY";
  currentValue: any;
  proposedValue: any;
  financialImpact: boolean;
  helpText: string | null;
  unit?: string;
}

export interface ClarificationAttachment {
  id: string;
  name: string;
  sizeBytes: number;
  url: string;
  scanStatus: "VERIFIED" | "PENDING" | "FAILED";
}

export interface Clarification {
  id: string; // e.g. "clar-2026-0089"
  requisitionId: string; // foreign key
  type: ClarificationType;
  status: ClarificationStatus;
  raisedByUserId: string; // Person.id (e.g. "usr-aisha")
  raisedAt: string;
  message: string;
  attachments: ClarificationAttachment[];
  asks: ClarificationAsk[];
  editableFields: ClarificationEditableField[];
  response?: {
    respondedByUserId: string; // Person.id (e.g. "usr-mariam")
    respondedAt: string;
    message: string;
    attachments: ClarificationAttachment[];
    updatedValues: Record<string, any>;
  } | null;
  deadline: {
    closesAt: string;
    daysRemaining: number;
    severity: "NORMAL" | "WARNING" | "CRITICAL";
  };
}

// ============================================================================
// 8. Approval Task (Persona Switcher & "Needs My Action")
// ============================================================================

export type ApprovalTaskType = "REQUISITION" | "BUDGET_AMENDMENT" | "BYPASS_INTERVIEW" | "HR_REVIEW";

export interface ApprovalTask {
  id: string; // e.g. "task-appr-0148-omar"
  type: ApprovalTaskType;
  requisitionId: string; // foreign key
  subjectRef: string; // e.g. "OMS-2026-0148"
  title: string; // Position or Task title
  context: string; // Department name
  stage: {
    code: string;
    label: string;
    index: number;
    total: number;
  };
  assignment: {
    mode: "NAMED" | "ROLE_QUEUE";
    assignedUserId: string; // Person.id
    claimedBy?: string | null;
  };
  actingFor?: string | null;
  amount: number; // in fils
  currency: "AED";
  submittedAt: string;
  assignedAt: string;
  sla: {
    dueAt: string;
    daysRemaining: number;
    breached: boolean;
    overdueDays?: number;
  };
  priority: "LOW" | "NORMAL" | "HIGH" | "URGENT";
  status: "PENDING" | "COMPLETED" | "REJECTED";
  amendmentId?: string | null;
  clarificationId?: string | null;
}

// ============================================================================
// 9. Vendor Onboarding Case
// ============================================================================

export type DocumentStatusCode =
  | "NOT_STARTED"
  | "UPLOADED"
  | "SCAN_FAILED"
  | "UNDER_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "PENDING_SIGNATURE"
  | "MISSING";

export interface OnboardingDocument {
  code: string; // "PASSPORT" | "EMIRATES_ID" | "NATIONAL_ID" | "POLICE_CLEARANCE" | "NDA"
  label: string;
  status: DocumentStatusCode;
  file: {
    id: string;
    name: string;
    sizeBytes: number;
    mimeType?: string;
    uploadedAt?: string;
    downloadUrl?: string;
  } | null;
  expiresOn: string | null; // YYYY-MM-DD
  expiringWithinDays: number | null;
  malwareScanPassed: boolean | null;
  fileTypeValid: boolean | null;
  rejectionReason: string | null;
  requiresSignature?: boolean;
  isOptional?: boolean;
}

export interface OnboardingSigner {
  order: number;
  name: string;
  role: "Candidate" | "DIEZ" | string;
  status?: "PENDING" | "SIGNED" | "DECLINED";
}

export interface OnboardingCase {
  id: string; // e.g. "ONB-2026-0119"
  requisitionId: string; // foreign key
  candidateRef: string; // foreign key
  positionTitle: string;
  vendorId: string; // "ven-falcon"
  vendorCoordinatorId: string; // "usr-layla"
  residentStatus: ResidentStatus; // "ONSHORE" | "OFFSHORE"
  candidate: {
    fullName: string;
    nationality: string;
    residentStatus: ResidentStatus;
    expectedJoining: string; // YYYY-MM-DD
    email: string;
    mobile: string;
    privacyNoticeAcknowledged: boolean;
  };
  documents: OnboardingDocument[];
  signature: {
    templateName: string;
    envelopeStatus: "NOT_SENT" | "SENT" | "VIEWED" | "SIGNED" | "DECLINED";
    signers: OnboardingSigner[];
    previewUrl: string;
    sentAt?: string | null;
    signedAt?: string | null;
  };
  deadline: {
    joiningDate: string;
    daysRemaining: number;
    severity: "NORMAL" | "WARNING" | "CRITICAL";
  };
  canEdit: boolean;
  submittedToDiez: boolean;
}

// ============================================================================
// 10. Workforce Member
// ============================================================================

export type WorkforceStatus = "ACTIVE" | "ENDING_SOON" | "TERMINATED" | "EXTENDED";

export interface WorkforceMember {
  id: string; // e.g. "wm-2026-0095"
  requisitionId: string; // foreign key
  candidateRef: string; // foreign key
  onboardingId?: string | null;
  fullName: string;
  positionTitle: string;
  departmentId: string;
  departmentName: string;
  vendorId: string;
  vendorName: string;
  status: WorkforceStatus;
  joinedDate: string; // YYYY-MM-DD
  contractEndDate: string; // YYYY-MM-DD
  daysRemaining: number;
  terminationDate?: string | null;
  replacementRequisitionId?: string | null; // e.g. "OMS-2026-0074-R"
  monthlyRate: number; // in fils
  annualCost: number; // in fils
}

// ============================================================================
// 11. Supplementary: Reconciliation Variance (OMS-2026-0131)
// ============================================================================

export interface ReconciliationVariance {
  id: "OMS-2026-0131";
  budgetLineId: string; // "line-cs-dig-001"
  budgetLineCode: string; // "CS-DIG-001"
  budgetLineName: string; // "Cybersecurity Services FY2026"
  departmentId: string;
  departmentName: string;
  type: "ORACLE_VS_BUDGET_VARIANCE";
  description: string;
  omsCommitted: number; // in fils
  oracleActuals: number; // in fils
  varianceAmount: number; // in fils: positive difference e.g. 4500000 = AED 45,000.00
  recordedAt: string;
  status: "UNRESOLVED" | "UNDER_REVIEW" | "RESOLVED";
}

// ============================================================================
// 12. Vendor Portal Entities (docs/VENDOR-PORTAL-UI.md Part 5 & 6)
// ============================================================================

export type RateCardTemplate =
  | "DIEZA_PREMISES"
  | "UAE_REMOTE_WFH"
  | "UAE_REMOTE_OFFICE"
  | "REMOTE_ABROAD"
  | "PRE_AGREED";

export type RateCardStatus = "DRAFT" | "SUBMITTED" | "PUBLISHED" | "ARCHIVED";

export interface RateCardGrade {
  gradeCode: string; // e.g. "G6", "G7", "G8", "G9"
  level: string; // "Junior", "Mid", "Senior", "Lead"
  roleTitle: string;
  minSalary: number; // in fils
  maxSalary: number; // in fils
  serviceChargePercent: number; // percentage e.g. 14
  monthlyRate: number; // in fils
  dailyRate: number; // in fils
}

export interface RateCard {
  id: string; // e.g. "rc-falcon-001"
  vendorId: string; // "ven-falcon"
  code: string; // "RC-FT-2026"
  name: string;
  template: RateCardTemplate;
  status: RateCardStatus;
  effectiveFrom: string; // YYYY-MM-DD
  effectiveTo: string; // YYYY-MM-DD
  currency: "AED";
  grades: RateCardGrade[];
}

export interface VendorComplianceDocument {
  id: string; // e.g. "doc-tl-001"
  vendorId: string; // "ven-falcon"
  documentType: "TRADE_LICENCE" | "TAX_REGISTRATION" | "INSURANCE" | "ISO_CERTIFICATE";
  title: string;
  issuingAuthority: string;
  licenceNumber?: string;
  status: "ACTIVE" | "EXPIRING_SOON" | "EXPIRED" | "PENDING_VERIFICATION";
  expiresOn: string; // YYYY-MM-DD
  daysRemaining: number;
  severity: "NORMAL" | "WARNING" | "CRITICAL";
  file: {
    id: string;
    name: string;
    sizeBytes: number;
    uploadedAt: string;
  };
}

export interface VendorRequisition {
  id: string; // "OMS-2026-0141", "OMS-2026-0161", "OMS-2026-0148"
  positionTitle: string;
  departmentName: string;
  positions: {
    required: number;
    filled: number;
    inProgress: number;
  };
  engagementMonths: number;
  workLocation: string;
  expectedStartDate: string;
  salaryGrade: string;
  justification: string;
  submissionWindow: {
    opensAt: string;
    closesAt: string;
    daysRemaining: number;
    isOpen: boolean;
    maxBatchSize: number;
    closedReason?: string;
  };
  mySubmissionsCount: number;
  requiredSkills: string[];
  experienceYearsRequired?: number;
  responsibilities?: string[];
  jobDescriptionHtml?: string;
}

export interface VendorContract {
  id: string; // e.g. "ct-falcon-001"
  contractCode: string; // e.g. "DIEZ-MSA-2025-0042"
  vendorId: string; // "ven-falcon"
  title: string;
  status: "ACTIVE" | "EXPIRED" | "TERMINATED";
  template: RateCardTemplate;
  validFrom: string;
  validTo: string;
  preAgreedMonthlyRate: number; // in fils
  preAgreedDailyRate: number; // in fils
  applicablePositions: string[];
}

export type CostEntryMode = "FIXED" | "NEGOTIABLE" | "PRE_AGREED";

export interface CandidateSubmissionPayload {
  requisitionId: string;
  vendorId: string;
  candidate: {
    fullName: string;
    email: string;
    mobile: string;
    nationality: string;
    residentStatus: "ONSHORE" | "OFFSHORE";
    experienceYears: number;
    noticePeriod: string;
  };
  cvAttachment: {
    id: string;
    name: string;
    sizeBytes: number;
    url?: string;
  };
  costMode: CostEntryMode;
  rateCardGradeCode?: string; // required if costMode === "NEGOTIABLE"
  fixedAmount?: number; // required if costMode === "FIXED", in fils
  contractId?: string; // required if costMode === "PRE_AGREED"
  leadTimeDays: number;
  specialTerms?: string;
}

export interface CandidateSubmissionReceipt {
  success: boolean;
  candidateRef: string; // e.g. "C-041"
  requisitionId: string;
  positionTitle: string;
  costMode: CostEntryMode;
  resolvedAmountFils: number;
  resolvedMonthlyFils: number;
  leadTimeDays: number;
  batchSubmissionNumber: number; // e.g. 1 (of 10)
  maxBatchSize: number;
  submittedAt: string;
  message: string;
}

export interface VendorActionItem {
  id: string;
  type: "INTERVIEW_PROPOSAL" | "ONBOARDING_DOCUMENT" | "SUBMISSION_WINDOW" | "COMPLIANCE_EXPIRY";
  subjectRef: string; // e.g. "C-021", "ONB-2026-0119", "OMS-2026-0161", "DOC-TL-2026"
  title: string;
  context: string;
  status: string;
  urgency: "NORMAL" | "HIGH" | "CRITICAL";
  daysRemaining: number;
  dueAt: string;
  href: string;
}

export interface VendorDashboardData {
  kpis: {
    openRequirements: number;
    candidatesAwaitingReview: number;
    interviewsToRespond: number;
    onboardingInProgress: number;
    documentsExpiringSoon: number;
  };
  actionItems: VendorActionItem[];
}

export type VendorSubmissionStatus =
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "SHORTLISTED"
  | "INTERVIEW_PROPOSED"
  | "INTERVIEW_CONFIRMED"
  | "QUALIFIED"
  | "NOT_SELECTED";

export type VendorSubmissionStatusLabel =
  | "Submitted"
  | "Under review"
  | "Shortlisted"
  | "Interview proposed"
  | "Interview confirmed"
  | "Qualified"
  | "Not selected";

/**
 * Server Requirement 3: Rejection reasons are never sent.
 * Only the status code NOT_SELECTED is exposed.
 * Absolutely no ratings, scores, internal comments, or priority fields.
 */
export interface VendorSubmissionItem {
  candidateRef: string;
  candidateName: string;
  requisitionId: string;
  positionTitle: string;
  departmentName: string;
  vendorStatus: VendorSubmissionStatus;
  vendorStatusLabel: VendorSubmissionStatusLabel;
  quotedCost: number; // in fils (exact minor units)
  leadTimeDays: number;
  submittedAt: string;
  interviewSlotId?: string;
  interviewPlanId?: string;
  actionRequired?: boolean;
  confirmedInterviewSlot?: {
    start: string;
    durationMinutes: number;
  } | null;
}

export interface VendorInterviewProposalSlot {
  slotId: string;
  start: string; // ISO 8601 UTC
  durationMinutes: number;
  dateLabel: string; // e.g. "Sat 12 Sep"
  timeRange: string; // e.g. "12:30 – 13:15 GST"
}

/**
 * Server Requirement 4: Interviewer identity is never sent on the interview-response route.
 * Renders strictly as "The hiring team for {Position}."
 * Absolutely no interviewer names, initials, emails, or user IDs.
 */
export interface VendorInterviewProposalData {
  planId: string;
  candidateRef: string;
  candidateName: string;
  requisitionId: string;
  positionTitle: string;
  departmentName: string;
  hiringTeam: string; // Strictly "The hiring team for {Position}."
  status: "AWAITING_REPLY" | "CONFIRMED" | "ALTERNATIVE_REQUESTED";
  statusLabel: string;
  method: "ONLINE" | "PHYSICAL" | "HYBRID" | "NO_PREFERENCE";
  platform?: string | null; // e.g. "MICROSOFT_TEAMS"
  location?: string | null;
  replyByDate: string; // e.g. "2026-09-12"
  daysRemaining: number;
  isUrgent: boolean;
  urgencySeverity: "normal" | "amber" | "red"; // amber under 2 days, red under 1
  proposedSlots: VendorInterviewProposalSlot[];
  scheduledSlot?: {
    start: string;
    durationMinutes: number;
    dateLabel: string;
    timeRange: string;
  } | null;
  confirmedAt?: string | null;
  alternativeRequestNote?: string | null;
}

export interface VendorCoordinator {
  id: string; // e.g. "usr-layla"
  name: string;
  email: string;
  phone: string;
  role: string;
  isPrimary: boolean;
  status: "ACTIVE" | "INACTIVE";
  addedAt: string;
}

export interface VendorProfileData {
  vendorId: string;
  companyName: string;
  tradeLicenceNumber: string;
  taxRegistrationNumber: string; // TRN
  jurisdiction: string;
  businessAddress: string;
  primaryEmail: string;
  primaryPhone: string;
  tier: string;
  status: "ACTIVE" | "INACTIVE" | "PENDING";
  website: string;
  primaryContact: {
    name: string;
    role: string;
    email: string;
    phone: string;
  };
  coordinators: VendorCoordinator[];
  complianceScore: number;
  activeContractsCount: number;
}

export interface VendorSupportAttachment {
  id: string;
  name: string;
  sizeBytes: number;
  url?: string;
  mimeType?: string;
}

export interface VendorSupportMessage {
  id: string;
  vendorId: string;
  senderName: string;
  senderRole: string;
  isVendor: boolean;
  subject: string;
  body: string;
  sentAt: string;
  category: "GENERAL_INQUIRY" | "TECHNICAL_ISSUE" | "CONTRACT_QUERY" | "BILLING";
  attachments?: VendorSupportAttachment[];
}



