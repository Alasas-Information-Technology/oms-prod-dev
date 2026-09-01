/**
 * Dashboard Types and API Contract Interfaces
 *
 * CRITICAL ARCHITECTURAL INVARIANTS:
 * 1. ALL MONETARY VALUES ARE INTEGERS IN MINOR UNITS (fils). Never floats. Never pre-formatted strings.
 *    1 AED = 100 fils (e.g., AED 1,200,000.00 is represented as 120000000).
 * 2. Scope is resolved server-side.
 * 3. Layout is computed from permissions, never returned as role names.
 * 4. Every figure arrives pre-aggregated; the client performs zero arithmetic.
 * 5. Per-user 60-second caching with updatedAt timestamps.
 * 6. Widget failures are isolated from the layout call.
 */

// =============================================================================
// Scope & Layout Hierarchy Types
// =============================================================================

export type DashboardScopeLevel =
  | "SELF"
  | "SECTION"
  | "DEPARTMENT"
  | "BUSINESS_UNIT"
  | "ORGANIZATION"
  | "GLOBAL";

export interface DashboardScope {
  level: DashboardScopeLevel;
  label: string;
  orgUnitId?: string;
}

export type GreetingPeriod = "MORNING" | "AFTERNOON" | "EVENING";

export interface DashboardGreeting {
  name: string;
  period: GreetingPeriod;
}

export interface FiscalPeriodSummary {
  code: string;
  label: string;
  isOpen: boolean;
}

export type BandIdentifier = "A" | "B" | "C" | "D";

export type WidgetId =
  // Band A — Attention strip (KPI tiles)
  | "needs-my-action"
  | "requests-in-approval"
  | "onboarding-cases"
  | "expiring-documents"
  | "auto-close-watch"
  | "open-exceptions"
  | "candidates-awaiting-review"
  | "vendor-submissions"
  | "security-events"
  // Band B — Position (Charts)
  | "requests-by-lifecycle-stage"
  | "budget-exposure"
  | "budget-allocation-by-department"
  | "workforce-by-department"
  | "budget-vs-actual-trend"
  | "time-in-stage"
  // Band C — Work (Tables & Feeds)
  | "items-requiring-attention"
  | "contract-runway"
  | "request-exceptions"
  | "upcoming-milestones"
  | "recent-activity"
  // Band D — Role-Specific Governance
  | "emiratisation-quota"
  | "budget-period-status"
  | "reconciliation-exceptions"
  | "integration-health"
  | "interview-schedule"
  | "vendor-performance"
  | "draft-expiry-watch"
  | "pending-hr-decisions";

export interface WidgetPlacement {
  id: WidgetId;
  span: number; // 12-column grid span (e.g. 3, 4, 6, 8, 12)
  priority: number; // Ordering within row band (ascending)
  minSpan?: number;
  maxSpan?: number;
}

export interface DashboardBand {
  band: BandIdentifier;
  widgets: WidgetPlacement[];
}

export interface DashboardLayout {
  greeting: DashboardGreeting;
  scope: DashboardScope;
  fiscalPeriod: FiscalPeriodSummary;
  bands: DashboardBand[];
  updatedAt: string;
}

// =============================================================================
// Generic Widget Response Envelope
// =============================================================================

export interface WidgetResponse<T = unknown> {
  widgetId: WidgetId;
  scope: DashboardScope;
  period: string;
  updatedAt: string;
  link: string;
  data: T;
}

// =============================================================================
// Band A Widget Payloads (KPI Tiles)
// =============================================================================

export interface NeedsMyActionData {
  total: number;
  overdue: number;
  byType: {
    APPROVE: number;
    REVISE: number;
    CLARIFY: number;
    [key: string]: number;
  };
}

export interface RequestsInApprovalData {
  count: number;
  /** ALL MONETARY VALUES ARE INTEGERS IN MINOR UNITS (fils) */
  totalAmountFils: number;
  avgDaysInApproval: number;
  urgentCount: number;
}

export interface OnboardingCasesData {
  activeCount: number;
  joiningThisWeek: number;
  pendingDocuments: number;
  completedThisMonth: number;
}

export interface ExpiringDocumentsData {
  countWithin30Days: number;
  countWithin60Days: number;
  countWithin90Days: number;
  criticalCount: number;
}

export interface AutoCloseWatchItem {
  requestId: string;
  position: string;
  departmentName?: string;
  closesAt: string;
  daysRemaining: number;
  /** ALL MONETARY VALUES ARE INTEGERS IN MINOR UNITS (fils) */
  fundsAtRisk: number;
}

export interface AutoCloseWatchData {
  items: AutoCloseWatchItem[];
  /** ALL MONETARY VALUES ARE INTEGERS IN MINOR UNITS (fils) */
  totalFundsAtRisk: number;
}

export interface OpenExceptionsData {
  totalExceptions: number;
  slaBreaches: number;
  budgetMismatches: number;
  reconciliationVariances: number;
}

export interface CandidatesAwaitingReviewData {
  totalAwaiting: number;
  urgentReview: number;
  interviewsScheduledThisWeek: number;
  avgWaitDays: number;
}

export interface VendorSubmissionsData {
  totalPending: number;
  submittedThisWeek: number;
  overdueResponses: number;
  activeVendors: number;
}

export interface SecurityEventsData {
  totalEvents24h: number;
  failedLogins: number;
  accountLockouts: number;
  suspiciousActivities: number;
}

// =============================================================================
// Band B Widget Payloads (Position Charts)
// =============================================================================

export type LifecycleStageCode =
  | "DRAFT"
  | "IN_APPROVAL"
  | "HR_REVIEW"
  | "PROCUREMENT"
  | "ONBOARDING";

export interface LifecycleStageItem {
  stage: LifecycleStageCode;
  label: string;
  count: number;
  /** ALL MONETARY VALUES ARE INTEGERS IN MINOR UNITS (fils) */
  totalAmountFils: number;
}

export interface RequestsByLifecycleStageData {
  stages: LifecycleStageItem[];
  totalRequests: number;
  filterPeriod: string;
}

export interface FundStateBreakdown {
  availablePercent: number;
  reservedPercent: number;
  lockedPercent: number;
  consumedPercent: number;
}

export interface BudgetExposureData {
  /** ALL MONETARY VALUES ARE INTEGERS IN MINOR UNITS (fils) */
  totalFils: number;
  /** ALL MONETARY VALUES ARE INTEGERS IN MINOR UNITS (fils) */
  availableFils: number;
  /** ALL MONETARY VALUES ARE INTEGERS IN MINOR UNITS (fils) */
  reservedFils: number;
  /** ALL MONETARY VALUES ARE INTEGERS IN MINOR UNITS (fils) */
  lockedFils: number;
  /** ALL MONETARY VALUES ARE INTEGERS IN MINOR UNITS (fils) */
  consumedFils: number;
  breakdown: FundStateBreakdown;
  currency: "AED";
  isReconciled: boolean;
  fiscalPeriod: string;
}

export interface DepartmentBudgetAllocationItem {
  orgUnitId: string;
  name: string;
  /** ALL MONETARY VALUES ARE INTEGERS IN MINOR UNITS (fils) */
  allocated: number;
  /** ALL MONETARY VALUES ARE INTEGERS IN MINOR UNITS (fils) */
  consumed: number;
  /** ALL MONETARY VALUES ARE INTEGERS IN MINOR UNITS (fils) */
  reserved: number;
  utilisationPercent: number;
}

export interface BudgetAllocationTotals {
  /** ALL MONETARY VALUES ARE INTEGERS IN MINOR UNITS (fils) */
  allocated: number;
  /** ALL MONETARY VALUES ARE INTEGERS IN MINOR UNITS (fils) */
  consumed: number;
  /** ALL MONETARY VALUES ARE INTEGERS IN MINOR UNITS (fils) */
  reserved?: number;
  utilisationPercent?: number;
}

export interface BudgetAllocationByDepartmentData {
  departments: DepartmentBudgetAllocationItem[];
  totals: BudgetAllocationTotals;
}

export interface DepartmentWorkforceItem {
  orgUnitId: string;
  name: string;
  active: number;
  onshore: number;
  offshore: number;
  onboarding: number;
  endingWithin90Days: number;
}

export interface WorkforceTotals {
  active: number;
  onshore: number;
  offshore: number;
  onboarding?: number;
  endingWithin90Days?: number;
}

export interface WorkforceByDepartmentData {
  departments: DepartmentWorkforceItem[];
  totals: WorkforceTotals;
}

export interface MonthlyBudgetTrendItem {
  month: string;
  /** ALL MONETARY VALUES ARE INTEGERS IN MINOR UNITS (fils) */
  plannedFils: number;
  /** ALL MONETARY VALUES ARE INTEGERS IN MINOR UNITS (fils) */
  actualFils: number;
  /** ALL MONETARY VALUES ARE INTEGERS IN MINOR UNITS (fils) */
  varianceFils: number;
  isOverBudget: boolean;
}

export interface BudgetTrendTotals {
  /** ALL MONETARY VALUES ARE INTEGERS IN MINOR UNITS (fils) */
  plannedFils: number;
  /** ALL MONETARY VALUES ARE INTEGERS IN MINOR UNITS (fils) */
  actualFils: number;
  /** ALL MONETARY VALUES ARE INTEGERS IN MINOR UNITS (fils) */
  varianceFils: number;
}

export interface BudgetVsActualTrendData {
  months: MonthlyBudgetTrendItem[];
  totals: BudgetTrendTotals;
}

export interface TimeInStageItem {
  stage: string;
  label: string;
  avgDays: number;
  targetDays: number;
  isSlowest: boolean;
}

export interface TimeInStageData {
  stages: TimeInStageItem[];
  overallAvgDays: number;
  slowestStage: string;
}

// =============================================================================
// Band C Widget Payloads (Work Queue & Feeds)
// =============================================================================

export type ActionPriority = "HIGH" | "MEDIUM" | "LOW";

export interface AttentionQueueItem {
  id: string;
  item: string;
  requestId: string;
  requestCode: string;
  stage: string;
  due: string;
  dueDate: string;
  isOverdue: boolean;
  overdueDays?: number;
  priority: ActionPriority;
  link: string;
}

export interface ItemsRequiringAttentionData {
  items: AttentionQueueItem[];
  totalItems: number;
}

export type ContractRunwayRange = "0-30" | "31-90" | "91-180" | "180+";

export interface ContractRunwayBucket {
  range: ContractRunwayRange;
  count: number;
  label: string;
}

export interface VendorContractRunwayItem {
  vendorId: string;
  name: string;
  active: number;
  endingWithin90Days: number;
}

export interface ContractRunwayData {
  buckets: ContractRunwayBucket[];
  byVendor: VendorContractRunwayItem[];
  replacementWindowOpen: number;
}

export type RequestExceptionType =
  | "SLA_BREACH"
  | "BUDGET_MISMATCH"
  | "RECONCILIATION_VARIANCE"
  | "STALLED"
  | "APPROVER_UNAVAILABLE";

export interface RequestExceptionItem {
  id: string;
  type: RequestExceptionType;
  requestId: string;
  requestCode?: string;
  detail: string;
  ageDays: number;
  owner: {
    userId: string;
    name: string;
  };
  severity: ActionPriority;
}

export interface RequestExceptionsData {
  items: RequestExceptionItem[];
  countsByType: Record<string, number>;
}

export type MilestoneType =
  | "INTERVIEW"
  | "JOINING"
  | "DOCUMENT_EXPIRY"
  | "CONTRACT_END";

export interface UpcomingMilestoneItem {
  id: string;
  type: MilestoneType;
  label: string;
  detail: string;
  date: string;
  formattedDate: string;
  link: string;
}

export interface UpcomingMilestonesData {
  milestones: UpcomingMilestoneItem[];
  totalCount: number;
}

export interface ActivityFeedActor {
  userId: string;
  name: string;
  roleDisplayName?: string;
}

export interface RecentActivityItem {
  id: string;
  actor: ActivityFeedActor;
  action: string;
  description: string;
  timestamp: string;
  relativeTime: string;
  subjectRef?: string;
  link?: string;
}

export interface RecentActivityData {
  activities: RecentActivityItem[];
  totalCount: number;
}

// =============================================================================
// Band D Widget Payloads (Role-Specific Governance)
// =============================================================================

export interface BusinessUnitEmiratisationItem {
  businessUnitId: string;
  name: string;
  totalHeadcount: number;
  uaeNationalHeadcount: number;
  currentPercent: number;
  targetPercent: number;
}

export interface EmiratisationQuotaData {
  currentHeadcount: number;
  uaeNationalHeadcount: number;
  currentPercent: number;
  targetPercent: number;
  isCompliant: boolean;
  byBusinessUnit: BusinessUnitEmiratisationItem[];
}

export interface PeriodApprovalProgress {
  currentLevel: number;
  totalLevels: number;
  isComplete: boolean;
  lastApprovedBy?: string;
  lastApprovedAt?: string;
}

export interface BudgetPeriodStatusData {
  periodId: string;
  periodCode: string;
  periodName: string;
  status: "OPEN" | "CLOSED" | "AMENDING";
  approvalProgress: PeriodApprovalProgress;
  lastAmendedAt?: string;
  canAmend: boolean;
  canClose: boolean;
  canReopen: boolean;
}

export interface ExternalSystemReconciliationItem {
  system: "ORACLE" | "DOCUSIGN" | "SANED";
  label: string;
  exceptionCount: number;
  oldestAgeDays: number;
  lastCheckedAt: string;
}

export interface ReconciliationExceptionsData {
  totalExceptions: number;
  oldestAgeDays: number;
  bySystem: ExternalSystemReconciliationItem[];
  link: string;
}

export type IntegrationHealthStatus = "HEALTHY" | "DEGRADED" | "FAILING";

export interface IntegrationSystemHealthItem {
  id: string;
  name: string;
  code: "ORACLE" | "DOCUSIGN" | "SANED" | "ACTIVE_DIRECTORY";
  status: IntegrationHealthStatus;
  lastSyncAt: string;
  failureCount24h: number;
  responseTimeMs?: number;
}

export interface IntegrationHealthData {
  systems: IntegrationSystemHealthItem[];
  overallHealth: IntegrationHealthStatus;
}

export interface ScheduledInterviewItem {
  id: string;
  candidateName: string;
  candidateId: string;
  position: string;
  requestId: string;
  scheduledAt: string;
  formattedDate: string;
  formattedTime: string;
  medium: "IN_PERSON" | "ONLINE";
  locationOrLink?: string;
  status: "SCHEDULED" | "COMPLETED" | "CANCELLED";
}

export interface InterviewScheduleData {
  interviews: ScheduledInterviewItem[];
  totalScheduled: number;
}

export interface VendorPerformanceItem {
  vendorId: string;
  name: string;
  submissionRatePercent: number;
  avgTimeToSubmitDays: number;
  acceptanceRatePercent: number;
  activePlacements: number;
  totalSubmissions: number;
}

export interface VendorPerformanceData {
  vendors: VendorPerformanceItem[];
  period: string;
}

export interface ExpiringDraftItem {
  requestId: string;
  title: string;
  daysRemaining: number;
  expiresAt: string;
  /** ALL MONETARY VALUES ARE INTEGERS IN MINOR UNITS (fils) */
  estimatedAmountFils?: number;
}

export interface DraftExpiryWatchData {
  draftsExpiringCount: number;
  soonestDaysRemaining: number;
  soonestDeletionDate: string;
  items: ExpiringDraftItem[];
}

export interface PendingHrDecisionsData {
  totalPending: number;
  byClarificationType: {
    newReview: number;
    responseToClarification: number;
    amendmentReview: number;
    salaryException: number;
    [key: string]: number;
  };
  urgentCount: number;
}

// =============================================================================
// Discriminated Unions & Mapping Types
// =============================================================================

export interface WidgetDataMap {
  // Band A
  "needs-my-action": NeedsMyActionData;
  "requests-in-approval": RequestsInApprovalData;
  "onboarding-cases": OnboardingCasesData;
  "expiring-documents": ExpiringDocumentsData;
  "auto-close-watch": AutoCloseWatchData;
  "open-exceptions": OpenExceptionsData;
  "candidates-awaiting-review": CandidatesAwaitingReviewData;
  "vendor-submissions": VendorSubmissionsData;
  "security-events": SecurityEventsData;
  // Band B
  "requests-by-lifecycle-stage": RequestsByLifecycleStageData;
  "budget-exposure": BudgetExposureData;
  "budget-allocation-by-department": BudgetAllocationByDepartmentData;
  "workforce-by-department": WorkforceByDepartmentData;
  "budget-vs-actual-trend": BudgetVsActualTrendData;
  "time-in-stage": TimeInStageData;
  // Band C
  "items-requiring-attention": ItemsRequiringAttentionData;
  "contract-runway": ContractRunwayData;
  "request-exceptions": RequestExceptionsData;
  "upcoming-milestones": UpcomingMilestonesData;
  "recent-activity": RecentActivityData;
  // Band D
  "emiratisation-quota": EmiratisationQuotaData;
  "budget-period-status": BudgetPeriodStatusData;
  "reconciliation-exceptions": ReconciliationExceptionsData;
  "integration-health": IntegrationHealthData;
  "interview-schedule": InterviewScheduleData;
  "vendor-performance": VendorPerformanceData;
  "draft-expiry-watch": DraftExpiryWatchData;
  "pending-hr-decisions": PendingHrDecisionsData;
}

export type TypedWidgetResponse = {
  [K in WidgetId]: {
    widgetId: K;
    scope: DashboardScope;
    period: string;
    updatedAt: string;
    link: string;
    data: WidgetDataMap[K];
  };
}[WidgetId];

// =============================================================================
// Dashboard Personas (for Fixtures & Layout Simulation)
// =============================================================================

export type DashboardPersona =
  | "requestor"
  | "hod"
  | "hr"
  | "finance"
  | "systemAdmin";

export interface WidgetQueryParams {
  period?: string;
  window?: string;
}
