/**
 * Dashboard Widget Registry
 *
 * Maps widget IDs to their metadata, permission gating rules, and components.
 *
 * CRITICAL ARCHITECTURAL RULES:
 * 1. Gating is evaluated strictly on PERMISSIONS and MINIMUM SCOPE.
 * 2. Role names must NEVER appear in gating logic or permission checks.
 */

import React from "react";
import {
  WidgetId,
  DashboardScope,
  DashboardScopeLevel,
} from "../../types/dashboard";
import { WidgetShell } from "../../components/oms/dashboard/WidgetShell";

// =============================================================================
// Widget Definition & Props Interfaces
// =============================================================================

export interface WidgetProps<T = unknown> {
  widgetId: WidgetId;
  scope: DashboardScope;
  period?: string;
  data?: T;
  updatedAt?: string;
  isLoading?: boolean;
  error?: Error | string | null;
  onRetry?: () => void;
}

export interface WidgetDefinition {
  id: WidgetId;
  title: string;
  requiredPermissions: string[];
  minimumScope: DashboardScopeLevel;
  defaultSpan: number;
  minHeight?: number;
  component: React.ComponentType<WidgetProps>;
}

// =============================================================================
// Placeholder Component for unbuilt widgets
// =============================================================================

export function PlaceholderWidget({
  widgetId,
  scope,
  isLoading,
  error,
  onRetry,
}: WidgetProps) {
  const definition = WIDGET_REGISTRY[widgetId];
  const title = definition ? definition.title : widgetId;

  return React.createElement(
    WidgetShell,
    {
      title,
      scopeLabel: scope?.label,
      isLoading,
      error,
      onRetry,
      minHeight: definition?.minHeight ?? 140,
    },
    React.createElement(
      "div",
      { className: "flex flex-col items-center justify-center py-6 px-4 text-center" },
      React.createElement("p", { className: "text-sm font-medium text-foreground" }, title),
      React.createElement(
        "p",
        { className: "text-xs text-muted-foreground mt-1" },
        `Widget implementation pending (${widgetId})`
      )
    )
  );
}

import {
  NeedsMyActionTile,
  RequestsInApprovalTile,
  OnboardingCasesTile,
  ExpiringDocumentsTile,
  AutoCloseWatchTile,
  OpenExceptionsTile,
  CandidatesAwaitingReviewTile,
  VendorSubmissionsTile,
  SecurityEventsTile,
  RequestsByLifecycleStageChart,
  BudgetExposureChart,
  BudgetBurnVsElapsedWidget,
  RequestThroughputWidget,
  BudgetAllocationByDepartmentChart,
  WorkforceByDepartmentChart,
  BudgetVsActualTrendChart,
  TimeInStageChart,
} from "../../components/oms/dashboard/widgets";

// Band C widgets
import {
  ItemsRequiringAttentionTable,
  ContractRunwayWidget,
  RequestExceptionsTable,
  UpcomingMilestonesWidget,
  MilestoneTimelineWidget,
  RecentActivityFeed,
} from "../../components/oms/dashboard/widgets";

// Band D widgets
import {
  EmiratisationQuotaWidget,
  BudgetPeriodStatusWidget,
  ReconciliationExceptionsWidget,
  IntegrationHealthWidget,
  InterviewScheduleWidget,
  VendorPerformanceWidget,
  DraftExpiryWatchWidget,
  PendingHrDecisionsWidget,
} from "../../components/oms/dashboard/widgets";

// Band A & Band E Admin Widgets
import {
  FailingIntegrationsTile,
  JobsFailedTile,
  IntegrityIssuesTile,
  ElevatedAccountsTile,
  BackgroundJobHealthWidget,
  ScheduledActionsTonightWidget,
  NotificationDeliveryWidget,
  DocumentPipelineWidget,
  DataIntegrityChecksWidget,
  PrivilegeChangesWidget,
  ElevatedAccessRegisterWidget,
  ActiveDelegationsWidget,
  AccountHygieneWidget,
  RateLimitPressureWidget,
  AuditRetentionWidget,
  ConfigurationDriftWidget,
} from "../../components/oms/dashboard/widgets";

// =============================================================================
// Complete Widget Registry (Seeded from DASHBOARD-PLAN.md Part 2)
// =============================================================================

export const WIDGET_REGISTRY: Record<WidgetId, WidgetDefinition> = {
  // ---------------------------------------------------------------------------
  // Band A — Attention strip (KPI tiles, span 3)
  // ---------------------------------------------------------------------------
  "needs-my-action": {
    id: "needs-my-action",
    title: "Needs my action",
    requiredPermissions: [],
    minimumScope: "SELF",
    defaultSpan: 3,
    minHeight: 120,
    component: NeedsMyActionTile as React.ComponentType<WidgetProps>,
  },
  "requests-in-approval": {
    id: "requests-in-approval",
    title: "Requests in approval",
    requiredPermissions: ["REQUISITION.VIEW"],
    minimumScope: "SELF",
    defaultSpan: 3,
    minHeight: 120,
    component: RequestsInApprovalTile as React.ComponentType<WidgetProps>,
  },
  "onboarding-cases": {
    id: "onboarding-cases",
    title: "Onboarding cases",
    requiredPermissions: ["WORKFORCE.VIEW"],
    minimumScope: "SELF",
    defaultSpan: 3,
    minHeight: 120,
    component: OnboardingCasesTile as React.ComponentType<WidgetProps>,
  },
  "expiring-documents": {
    id: "expiring-documents",
    title: "Expiring documents",
    requiredPermissions: ["WORKFORCE.VIEW"],
    minimumScope: "SELF",
    defaultSpan: 3,
    minHeight: 120,
    component: ExpiringDocumentsTile as React.ComponentType<WidgetProps>,
  },
  "auto-close-watch": {
    id: "auto-close-watch",
    title: "Auto-close watch",
    requiredPermissions: ["REQUISITION.VIEW"],
    minimumScope: "SELF",
    defaultSpan: 3,
    minHeight: 120,
    component: AutoCloseWatchTile as React.ComponentType<WidgetProps>,
  },
  "open-exceptions": {
    id: "open-exceptions",
    title: "Open exceptions",
    requiredPermissions: ["REQUISITION.VIEW"],
    minimumScope: "DEPARTMENT",
    defaultSpan: 3,
    minHeight: 120,
    component: OpenExceptionsTile as React.ComponentType<WidgetProps>,
  },
  "candidates-awaiting-review": {
    id: "candidates-awaiting-review",
    title: "Candidates awaiting review",
    requiredPermissions: ["CANDIDATE.VIEW"],
    minimumScope: "SELF",
    defaultSpan: 3,
    minHeight: 120,
    component: CandidatesAwaitingReviewTile as React.ComponentType<WidgetProps>,
  },
  "vendor-submissions": {
    id: "vendor-submissions",
    title: "Vendor submissions",
    requiredPermissions: ["VENDOR.VIEW"],
    minimumScope: "DEPARTMENT",
    defaultSpan: 3,
    minHeight: 120,
    component: VendorSubmissionsTile as React.ComponentType<WidgetProps>,
  },
  "security-events": {
    id: "security-events",
    title: "Security events",
    requiredPermissions: ["SECURITY.DASHBOARD.VIEW"],
    minimumScope: "GLOBAL",
    defaultSpan: 3,
    minHeight: 120,
    component: SecurityEventsTile as React.ComponentType<WidgetProps>,
  },

  // ---------------------------------------------------------------------------
  // Band B — Position (Charts, span 6)
  // ---------------------------------------------------------------------------
  "requests-by-lifecycle-stage": {
    id: "requests-by-lifecycle-stage",
    title: "Requests by lifecycle stage",
    requiredPermissions: ["REQUISITION.VIEW"],
    minimumScope: "SELF",
    defaultSpan: 6,
    minHeight: 280,
    component: RequestsByLifecycleStageChart as React.ComponentType<WidgetProps>,
  },
  "budget-exposure": {
    id: "budget-exposure",
    title: "Budget exposure",
    requiredPermissions: ["BUDGET.VIEW"],
    minimumScope: "SELF",
    defaultSpan: 6,
    minHeight: 280,
    component: BudgetExposureChart as React.ComponentType<WidgetProps>,
  },
  "budget-burn-vs-elapsed": {
    id: "budget-burn-vs-elapsed",
    title: "Budget burn vs year elapsed",
    requiredPermissions: ["BUDGET.VIEW"],
    minimumScope: "SELF",
    defaultSpan: 4,
    minHeight: 215,
    component: BudgetBurnVsElapsedWidget as React.ComponentType<WidgetProps>,
  },
  "request-throughput": {
    id: "request-throughput",
    title: "Request throughput",
    requiredPermissions: ["REQUISITION.VIEW"],
    minimumScope: "SELF",
    defaultSpan: 8,
    minHeight: 215,
    component: RequestThroughputWidget as React.ComponentType<WidgetProps>,
  },
  "budget-allocation-by-department": {
    id: "budget-allocation-by-department",
    title: "Budget allocation by department",
    requiredPermissions: ["BUDGET.VIEW"],
    minimumScope: "BUSINESS_UNIT",
    defaultSpan: 6,
    minHeight: 280,
    component: BudgetAllocationByDepartmentChart as React.ComponentType<WidgetProps>,
  },
  "workforce-by-department": {
    id: "workforce-by-department",
    title: "Workforce by department",
    requiredPermissions: ["WORKFORCE.VIEW"],
    minimumScope: "DEPARTMENT",
    defaultSpan: 6,
    minHeight: 280,
    component: WorkforceByDepartmentChart as React.ComponentType<WidgetProps>,
  },
  "budget-vs-actual-trend": {
    id: "budget-vs-actual-trend",
    title: "Budget vs actual trend",
    requiredPermissions: ["BUDGET.VIEW"],
    minimumScope: "DEPARTMENT",
    defaultSpan: 6,
    minHeight: 280,
    component: BudgetVsActualTrendChart as React.ComponentType<WidgetProps>,
  },
  "time-in-stage": {
    id: "time-in-stage",
    title: "Time in stage",
    requiredPermissions: ["REQUISITION.VIEW"],
    minimumScope: "DEPARTMENT",
    defaultSpan: 6,
    minHeight: 280,
    component: TimeInStageChart as React.ComponentType<WidgetProps>,
  },

  // ---------------------------------------------------------------------------
  // Band C — Work (Tables & Feeds, span 4–8)
  // ---------------------------------------------------------------------------
  "items-requiring-attention": {
    id: "items-requiring-attention",
    title: "Items requiring attention",
    requiredPermissions: [],
    minimumScope: "SELF",
    defaultSpan: 8,
    minHeight: 320,
    component: ItemsRequiringAttentionTable as React.ComponentType<WidgetProps>,
  },
  "contract-runway": {
    id: "contract-runway",
    title: "Contract runway",
    requiredPermissions: ["WORKFORCE.VIEW"],
    minimumScope: "DEPARTMENT",
    defaultSpan: 6,
    minHeight: 320,
    component: ContractRunwayWidget as React.ComponentType<WidgetProps>,
  },
  "request-exceptions": {
    id: "request-exceptions",
    title: "Request exceptions",
    requiredPermissions: ["REQUISITION.VIEW"],
    minimumScope: "DEPARTMENT",
    defaultSpan: 6,
    minHeight: 320,
    component: RequestExceptionsTable as React.ComponentType<WidgetProps>,
  },
  "upcoming-milestones": {
    id: "upcoming-milestones",
    title: "Upcoming milestones",
    requiredPermissions: [],
    minimumScope: "SELF",
    defaultSpan: 4,
    minHeight: 320,
    component: UpcomingMilestonesWidget as React.ComponentType<WidgetProps>,
  },
  "milestone-timeline": {
    id: "milestone-timeline",
    title: "Milestone timeline",
    requiredPermissions: [],
    minimumScope: "SELF",
    defaultSpan: 12,
    minHeight: 280,
    component: MilestoneTimelineWidget as React.ComponentType<WidgetProps>,
  },
  "recent-activity": {
    id: "recent-activity",
    title: "Recent activity",
    requiredPermissions: [],
    minimumScope: "SELF",
    defaultSpan: 4,
    minHeight: 320,
    component: RecentActivityFeed as React.ComponentType<WidgetProps>,
  },

  // ---------------------------------------------------------------------------
  // Band D — Role-Specific Governance (span 4–6)
  // ---------------------------------------------------------------------------
  "emiratisation-quota": {
    id: "emiratisation-quota",
    title: "Emiratisation quota",
    requiredPermissions: ["WORKFORCE.VIEW"],
    minimumScope: "ORGANIZATION",
    defaultSpan: 6,
    minHeight: 240,
    component: EmiratisationQuotaWidget as React.ComponentType<WidgetProps>,
  },
  "budget-period-status": {
    id: "budget-period-status",
    title: "Budget period status",
    requiredPermissions: ["BUDGET.PERIOD.MANAGE"],
    minimumScope: "DEPARTMENT",
    defaultSpan: 6,
    minHeight: 240,
    component: BudgetPeriodStatusWidget as React.ComponentType<WidgetProps>,
  },
  "reconciliation-exceptions": {
    id: "reconciliation-exceptions",
    title: "Reconciliation exceptions",
    requiredPermissions: ["BUDGET.RECONCILE"],
    minimumScope: "DEPARTMENT",
    defaultSpan: 6,
    minHeight: 240,
    component: ReconciliationExceptionsWidget as React.ComponentType<WidgetProps>,
  },
  "integration-health": {
    id: "integration-health",
    title: "Integration health",
    requiredPermissions: ["SECURITY.ADMIN"],
    minimumScope: "GLOBAL",
    defaultSpan: 6,
    minHeight: 240,
    component: IntegrationHealthWidget as React.ComponentType<WidgetProps>,
  },
  "interview-schedule": {
    id: "interview-schedule",
    title: "Interview schedule",
    requiredPermissions: ["INTERVIEW.SCHEDULE"],
    minimumScope: "SELF",
    defaultSpan: 6,
    minHeight: 240,
    component: InterviewScheduleWidget as React.ComponentType<WidgetProps>,
  },
  "vendor-performance": {
    id: "vendor-performance",
    title: "Vendor performance",
    requiredPermissions: ["VENDOR.VIEW"],
    minimumScope: "DEPARTMENT",
    defaultSpan: 6,
    minHeight: 240,
    component: VendorPerformanceWidget as React.ComponentType<WidgetProps>,
  },
  "draft-expiry-watch": {
    id: "draft-expiry-watch",
    title: "Draft expiry watch",
    requiredPermissions: ["REQUISITION.VIEW"],
    minimumScope: "SELF",
    defaultSpan: 6,
    minHeight: 240,
    component: DraftExpiryWatchWidget as React.ComponentType<WidgetProps>,
  },
  "pending-hr-decisions": {
    id: "pending-hr-decisions",
    title: "Pending HR decisions",
    requiredPermissions: ["REQUISITION.VIEW"],
    minimumScope: "ORGANIZATION",
    defaultSpan: 6,
    minHeight: 240,
    component: PendingHrDecisionsWidget as React.ComponentType<WidgetProps>,
  },

  // ---------------------------------------------------------------------------
  // Band A — Admin Additions (KPI tiles)
  // ---------------------------------------------------------------------------
  "failing-integrations": {
    id: "failing-integrations",
    title: "Failing integrations",
    requiredPermissions: ["PLATFORM.HEALTH.VIEW"],
    minimumScope: "GLOBAL",
    defaultSpan: 3,
    minHeight: 120,
    component: FailingIntegrationsTile as React.ComponentType<WidgetProps>,
  },
  "integrity-issues": {
    id: "integrity-issues",
    title: "Integrity issues",
    requiredPermissions: ["PLATFORM.INTEGRITY.VIEW"],
    minimumScope: "GLOBAL",
    defaultSpan: 3,
    minHeight: 120,
    component: IntegrityIssuesTile as React.ComponentType<WidgetProps>,
  },
  "elevated-accounts": {
    id: "elevated-accounts",
    title: "Elevated accounts",
    requiredPermissions: ["USER.VIEW"],
    minimumScope: "GLOBAL",
    defaultSpan: 3,
    minHeight: 120,
    component: ElevatedAccountsTile as React.ComponentType<WidgetProps>,
  },
  "jobs-failed-24h": {
    id: "jobs-failed-24h",
    title: "Jobs failed (24h)",
    requiredPermissions: ["PLATFORM.HEALTH.VIEW"],
    minimumScope: "GLOBAL",
    defaultSpan: 3,
    minHeight: 120,
    component: JobsFailedTile as React.ComponentType<WidgetProps>,
  },

  // ---------------------------------------------------------------------------
  // Band E — Platform Operations & Integrity (12 Widgets)
  // ---------------------------------------------------------------------------
  "background-job-health": {
    id: "background-job-health",
    title: "Background job health",
    requiredPermissions: ["PLATFORM.HEALTH.VIEW"],
    minimumScope: "GLOBAL",
    defaultSpan: 6,
    minHeight: 240,
    component: BackgroundJobHealthWidget as React.ComponentType<WidgetProps>,
  },
  "data-integrity-checks": {
    id: "data-integrity-checks",
    title: "Data integrity checks",
    requiredPermissions: ["PLATFORM.INTEGRITY.VIEW"],
    minimumScope: "GLOBAL",
    defaultSpan: 6,
    minHeight: 240,
    component: DataIntegrityChecksWidget as React.ComponentType<WidgetProps>,
  },
  "scheduled-actions-tonight": {
    id: "scheduled-actions-tonight",
    title: "Tonight's scheduled actions",
    requiredPermissions: ["PLATFORM.HEALTH.VIEW"],
    minimumScope: "GLOBAL",
    defaultSpan: 6,
    minHeight: 240,
    component: ScheduledActionsTonightWidget as React.ComponentType<WidgetProps>,
  },
  "privilege-changes": {
    id: "privilege-changes",
    title: "Privilege changes",
    requiredPermissions: ["SECURITY.EVENTS.VIEW"],
    minimumScope: "GLOBAL",
    defaultSpan: 6,
    minHeight: 240,
    component: PrivilegeChangesWidget as React.ComponentType<WidgetProps>,
  },
  "elevated-access-register": {
    id: "elevated-access-register",
    title: "Elevated access register",
    requiredPermissions: ["USER.VIEW"],
    minimumScope: "GLOBAL",
    defaultSpan: 4,
    minHeight: 240,
    component: ElevatedAccessRegisterWidget as React.ComponentType<WidgetProps>,
  },
  "active-delegations": {
    id: "active-delegations",
    title: "Active delegations",
    requiredPermissions: ["USER.VIEW"],
    minimumScope: "GLOBAL",
    defaultSpan: 4,
    minHeight: 240,
    component: ActiveDelegationsWidget as React.ComponentType<WidgetProps>,
  },
  "account-hygiene": {
    id: "account-hygiene",
    title: "Account hygiene",
    requiredPermissions: ["USER.VIEW"],
    minimumScope: "GLOBAL",
    defaultSpan: 4,
    minHeight: 240,
    component: AccountHygieneWidget as React.ComponentType<WidgetProps>,
  },
  "rate-limit-pressure": {
    id: "rate-limit-pressure",
    title: "Rate limit pressure",
    requiredPermissions: ["SECURITY.DASHBOARD.VIEW"],
    minimumScope: "GLOBAL",
    defaultSpan: 6,
    minHeight: 240,
    component: RateLimitPressureWidget as React.ComponentType<WidgetProps>,
  },
  "notification-delivery": {
    id: "notification-delivery",
    title: "Notification delivery",
    requiredPermissions: ["PLATFORM.HEALTH.VIEW"],
    minimumScope: "GLOBAL",
    defaultSpan: 6,
    minHeight: 240,
    component: NotificationDeliveryWidget as React.ComponentType<WidgetProps>,
  },
  "document-pipeline": {
    id: "document-pipeline",
    title: "Document pipeline",
    requiredPermissions: ["PLATFORM.HEALTH.VIEW"],
    minimumScope: "GLOBAL",
    defaultSpan: 6,
    minHeight: 240,
    component: DocumentPipelineWidget as React.ComponentType<WidgetProps>,
  },
  "audit-retention": {
    id: "audit-retention",
    title: "Audit & retention",
    requiredPermissions: ["SECURITY.EVENTS.VIEW"],
    minimumScope: "GLOBAL",
    defaultSpan: 6,
    minHeight: 240,
    component: AuditRetentionWidget as React.ComponentType<WidgetProps>,
  },
  "configuration-drift": {
    id: "configuration-drift",
    title: "Configuration drift",
    requiredPermissions: ["SECURITY.ADMIN"],
    minimumScope: "GLOBAL",
    defaultSpan: 6,
    minHeight: 240,
    component: ConfigurationDriftWidget as React.ComponentType<WidgetProps>,
  },
};

/**
 * Returns widget definition if registered.
 */
export function getWidgetDefinition(id: WidgetId): WidgetDefinition | undefined {
  return WIDGET_REGISTRY[id];
}
