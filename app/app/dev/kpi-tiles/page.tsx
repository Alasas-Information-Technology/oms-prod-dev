"use client";

import React from "react";
import { NeedsMyActionTile } from "@/components/oms/dashboard/widgets/NeedsMyActionTile";
import { RequestsInApprovalTile } from "@/components/oms/dashboard/widgets/RequestsInApprovalTile";
import { OnboardingCasesTile } from "@/components/oms/dashboard/widgets/OnboardingCasesTile";
import { ExpiringDocumentsTile } from "@/components/oms/dashboard/widgets/ExpiringDocumentsTile";
import { AutoCloseWatchTile } from "@/components/oms/dashboard/widgets/AutoCloseWatchTile";
import { OpenExceptionsTile } from "@/components/oms/dashboard/widgets/OpenExceptionsTile";
import { CandidatesAwaitingReviewTile } from "@/components/oms/dashboard/widgets/CandidatesAwaitingReviewTile";
import { VendorSubmissionsTile } from "@/components/oms/dashboard/widgets/VendorSubmissionsTile";
import { SecurityEventsTile } from "@/components/oms/dashboard/widgets/SecurityEventsTile";
import { KpiTile } from "@/components/oms/dashboard/KpiTile";
import { Activity } from "lucide-react";

export default function KpiTilesDevPage() {
  const scope = { level: "SELF" as const, label: "My Scope" };
  const nowIso = new Date().toISOString();

  const activeSparklineData = [
    { value: 10 },
    { value: 15 },
    { value: 12 },
    { value: 24 },
    { value: 18 },
    { value: 32 },
  ];

  return (
    <div className="p-8 pb-32 max-w-7xl mx-auto space-y-12">
      <div>
        <h1 className="text-3xl font-display font-bold text-heading">KPI Tiles Refinement Verification (E2)</h1>
        <p className="text-muted-foreground mt-2">
          Verifying 120px fixed height, 20px padding, 13px label above value, 32px tabular-nums, 20px unboxed icons, freshness timestamps, deltas, sparklines, and reassuring zero states.
        </p>
      </div>

      {/* 1. ALL 9 TILES WITH ZERO VALUES */}
      <section className="space-y-4">
        <div className="border-b pb-2">
          <h2 className="text-xl font-bold">1. All 9 Tiles in Zero State (Reassuring framing, no bare &quot;0&quot;)</h2>
          <p className="text-xs text-muted-foreground">Each tile displays &quot;0&quot; paired with a reassuring sentence and checkmark instead of an empty state.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <NeedsMyActionTile
            widgetId="needs-my-action"
            scope={scope}
            data={{ total: 0, overdue: 0, byType: { APPROVE: 0, REVISE: 0, CLARIFY: 0 } }}
            updatedAt={nowIso}
          />
          <RequestsInApprovalTile
            widgetId="requests-in-approval"
            scope={scope}
            data={{ count: 0, urgentCount: 0, totalAmountFils: 0, avgDaysInApproval: 0 }}
            updatedAt={nowIso}
          />
          <OnboardingCasesTile
            widgetId="onboarding-cases"
            scope={scope}
            data={{ activeCount: 0, joiningThisWeek: 0, pendingDocuments: 0, completedThisMonth: 0 }}
            updatedAt={nowIso}
          />
          <ExpiringDocumentsTile
            widgetId="expiring-documents"
            scope={scope}
            data={{ countWithin30Days: 0, countWithin60Days: 0, countWithin90Days: 0, criticalCount: 0 }}
            updatedAt={nowIso}
          />
          <AutoCloseWatchTile
            widgetId="auto-close-watch"
            scope={scope}
            data={{ totalFundsAtRisk: 0, items: [] }}
            updatedAt={nowIso}
          />
          <OpenExceptionsTile
            widgetId="open-exceptions"
            scope={scope}
            data={{ totalExceptions: 0, slaBreaches: 0, budgetMismatches: 0, reconciliationVariances: 0 }}
            updatedAt={nowIso}
          />
          <CandidatesAwaitingReviewTile
            widgetId="candidates-awaiting-review"
            scope={scope}
            data={{ totalAwaiting: 0, urgentReview: 0, interviewsScheduledThisWeek: 0, avgWaitDays: 0 }}
            updatedAt={nowIso}
          />
          <VendorSubmissionsTile
            widgetId="vendor-submissions"
            scope={scope}
            data={{ totalPending: 0, submittedThisWeek: 0, overdueResponses: 0, activeVendors: 0 }}
            updatedAt={nowIso}
          />
          <SecurityEventsTile
            widgetId="security-events"
            scope={scope}
            data={{ totalEvents24h: 0, failedLogins: 0, accountLockouts: 0, suspiciousActivities: 0 }}
            updatedAt={nowIso}
          />
        </div>
      </section>

      {/* 2. ALL 9 TILES WITH ACTIVE DATA */}
      <section className="space-y-4">
        <div className="border-b pb-2">
          <h2 className="text-xl font-bold">2. All 9 Tiles with Active Data (120px Fixed Height Baseline)</h2>
          <p className="text-xs text-muted-foreground">Notice uniform 120px alignment across columns, badges, and typography.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <NeedsMyActionTile
            widgetId="needs-my-action"
            scope={scope}
            data={{ total: 4, overdue: 2, byType: { APPROVE: 2, REVISE: 1, CLARIFY: 1 } }}
            updatedAt={nowIso}
          />
          <RequestsInApprovalTile
            widgetId="requests-in-approval"
            scope={scope}
            data={{ count: 6, urgentCount: 1, totalAmountFils: 342000000, avgDaysInApproval: 4.2 }}
            updatedAt={nowIso}
          />
          <OnboardingCasesTile
            widgetId="onboarding-cases"
            scope={scope}
            data={{ activeCount: 3, joiningThisWeek: 2, pendingDocuments: 1, completedThisMonth: 5 }}
            updatedAt={nowIso}
          />
          <ExpiringDocumentsTile
            widgetId="expiring-documents"
            scope={scope}
            data={{ countWithin30Days: 4, countWithin60Days: 9, countWithin90Days: 15, criticalCount: 1 }}
            updatedAt={nowIso}
          />
          <AutoCloseWatchTile
            widgetId="auto-close-watch"
            scope={scope}
            data={{ totalFundsAtRisk: 245000000, items: [] }}
            updatedAt={nowIso}
          />
          <OpenExceptionsTile
            widgetId="open-exceptions"
            scope={scope}
            data={{ totalExceptions: 5, slaBreaches: 2, budgetMismatches: 1, reconciliationVariances: 2 }}
            updatedAt={nowIso}
          />
          <CandidatesAwaitingReviewTile
            widgetId="candidates-awaiting-review"
            scope={scope}
            data={{ totalAwaiting: 8, urgentReview: 3, interviewsScheduledThisWeek: 4, avgWaitDays: 2.5 }}
            updatedAt={nowIso}
          />
          <VendorSubmissionsTile
            widgetId="vendor-submissions"
            scope={scope}
            data={{ totalPending: 12, submittedThisWeek: 4, overdueResponses: 2, activeVendors: 4 }}
            updatedAt={nowIso}
          />
          <SecurityEventsTile
            widgetId="security-events"
            scope={scope}
            data={{ totalEvents24h: 18, failedLogins: 4, accountLockouts: 1, suspiciousActivities: 0 }}
            updatedAt={nowIso}
          />
        </div>
      </section>

      {/* 3. EXTENDED PRIMITIVE FEATURES (SPARKLINE, DELTA, NEEDS_ACTION, NO_DATA) */}
      <section className="space-y-4">
        <div className="border-b pb-2">
          <h2 className="text-xl font-bold">3. Advanced KPI Primitives (Deltas, Sparklines, Needs Action, No Data)</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KpiTile
            title="Active Sessions"
            value={142}
            href="#"
            icon={Activity}
            updatedAt={nowIso}
            delta={{ value: 14.2, direction: "up", increaseIsGood: true }}
          />

          <KpiTile
            title="Failed Login Attempts"
            value={8}
            href="#"
            icon={Activity}
            updatedAt={nowIso}
            delta={{ value: 25.0, direction: "up", increaseIsGood: false }}
          />

          <KpiTile
            title="Weekly Trend"
            value={89}
            href="#"
            icon={Activity}
            updatedAt={nowIso}
            sparklineData={activeSparklineData}
            sparklineKey="value"
          />

          <KpiTile
            title="Budget Uploaded"
            value={0}
            href="#"
            icon={Activity}
            updatedAt={nowIso}
            zeroMeaning="NEEDS_ACTION"
            zeroMessage="No budget uploaded for FY26"
          />
        </div>
      </section>
    </div>
  );
}
