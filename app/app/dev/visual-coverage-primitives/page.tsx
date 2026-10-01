"use client";

import React from "react";
import { KpiCard } from "@/components/oms/dashboard/KpiCard";
import { SimpleKpiCard } from "@/components/budget/SimpleKpiCard";
import { DistributionBar, DistributionSegment } from "@/components/oms/dashboard/DistributionBar";
import { SegmentedBar } from "@/components/oms/dashboard/SegmentedBar";
import { DotMatrix } from "@/components/oms/dashboard/charts/DotMatrix";
import { Sparkline } from "@/components/oms/dashboard/charts/Sparkline";
import { SeverityDot, SeverityLevel } from "@/components/oms/dashboard/SeverityDot";
import { Amount } from "@/components/budget/Amount";
import {
  ItemsRequiringAttentionTable,
  ContractRunwayWidget,
  RequestExceptionsTable,
  UpcomingMilestonesWidget,
  RecentActivityFeed,
  EmiratisationQuotaWidget,
  BudgetPeriodStatusWidget,
  ReconciliationExceptionsWidget,
  IntegrationHealthWidget,
  InterviewScheduleWidget,
  VendorPerformanceWidget,
  DraftExpiryWatchWidget,
  PendingHrDecisionsWidget,
  BackgroundJobHealthWidget,
  DataIntegrityChecksWidget,
  ScheduledActionsTonightWidget,
  PrivilegeChangesWidget,
  ElevatedAccessRegisterWidget,
  ActiveDelegationsWidget,
  AccountHygieneWidget,
  RateLimitPressureWidget,
  NotificationDeliveryWidget,
  DocumentPipelineWidget,
  AuditRetentionWidget,
  ConfigurationDriftWidget,
} from "@/components/oms/dashboard/widgets";
import { getMockWidgetData } from "@/lib/dashboard/fixtures";

export default function VisualCoveragePrimitivesDemo() {
  // 1. Bar-behind-number KPI data
  const kpiData30 = [
    4, 5, 6, 7, 5, 8, 6, 7, 9, 8, 7, 6, 8, 9, 11, 10, 8, 9, 12, 11, 10, 13, 12, 14, 13, 15, 14, 16, 15, 18,
  ];
  const kpiData7 = [12, 15, 14, 18, 16, 19, 24];

  // 2. DistributionBar segments
  const distributionSegments: DistributionSegment[] = [
    {
      label: "Reserved",
      value: 184000000,
      formatted: <Amount value={184000000} abbreviate variant="inline" currency="AED" />,
      percent: 18.0,
    },
    {
      label: "Locked",
      value: 174000000,
      formatted: <Amount value={174000000} abbreviate variant="inline" currency="AED" />,
      percent: 17.1,
    },
    {
      label: "Consumed",
      value: 96000000,
      formatted: <Amount value={96000000} abbreviate variant="inline" currency="AED" />,
      percent: 9.4,
    },
    {
      label: "Available",
      value: 566000000,
      formatted: <Amount value={566000000} abbreviate variant="inline" currency="AED" />,
      percent: 55.5,
      isResidual: true, // T4 Hatched fill
    },
  ];

  // 3. DotMatrix data (Discrete entity counts)
  const onboardingWeeklyData = [
    { label: "W1", count: 3 },
    { label: "W2", count: 5 },
    { label: "W3", count: 2 },
    { label: "W4", count: 7 },
    { label: "W5", count: 4 },
    { label: "W6", count: 6 },
    { label: "W7", count: 8 },
    { label: "W8", count: 5 },
  ];

  const notificationDailyData = [
    { day: "Mon", sent: 120 },
    { day: "Tue", sent: 145 },
    { day: "Wed", sent: 190 },
    { day: "Thu", sent: 160 },
    { day: "Fri", sent: 210 },
    { day: "Sat", sent: 45 },
    { day: "Sun", sent: 30 },
  ];

  // 4. Severity levels for testing
  const testSeverities: Array<{ level: SeverityLevel; label: string; token: string }> = [
    { level: "CRITICAL", label: "Critical Severity", token: "var(--danger-border)" },
    { level: "HIGH", label: "High Severity", token: "var(--danger-border)" },
    { level: "MEDIUM", label: "Medium Severity", token: "var(--warning-border)" },
    { level: "LOW", label: "Low Severity", token: "var(--muted-foreground)" },
    { level: "NEUTRAL", label: "Neutral Severity", token: "var(--muted-foreground)" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground p-8 max-w-6xl mx-auto space-y-12">
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-1">
          Visual Coverage Shared Primitives (Task J2)
        </h1>
        <p className="text-sm text-muted-foreground">
          Shared chart primitives and semantic visual indicators per docs/DASHBOARD-VISUAL-COVERAGE-GEMINI.md J2.
        </p>
      </div>

      {/* 1. Bar-behind-number KPI Treatment */}
      <section className="space-y-4">
        <div className="border-b border-border/60 pb-2">
          <h2 className="text-base font-semibold">
            1. KpiCard with Bar-Behind-Number (U2 / H1)
          </h2>
          <p className="text-xs text-muted-foreground">
            Bars span the card width behind the value (30 or 7 periods). Hatched prior periods, solid current period,
            hover shows T7 ChartTooltip.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            title="Needs my action"
            value={18}
            prefix=""
            icon="lucide:inbox"
            sparkline={kpiData30}
            delta={{ value: 12, direction: "up", increaseIsGood: false, label: "vs last week" }}
          />

          <KpiCard
            title="Requests in approval"
            value={2480000}
            isCurrency
            sparkline={kpiData30}
            delta={{ value: 8, direction: "up", increaseIsGood: true, label: "vs last month" }}
          />

          <KpiCard
            title="Onboarding cases (7d)"
            value={24}
            sparkline={kpiData7}
            delta={{ value: 4, direction: "down", increaseIsGood: false, label: "vs prior 7d" }}
          />

          <SimpleKpiCard
            title="Sparkline Line Fallback"
            value={42}
            sparkline={kpiData30}
            visualTreatment="sparkline"
            delta={{ value: 5, direction: "up", increaseIsGood: true }}
          />
        </div>
      </section>

      {/* 2. DotMatrix Primitive */}
      <section className="space-y-4">
        <div className="border-b border-border/60 pb-2">
          <h2 className="text-base font-semibold">
            2. DotMatrix Primitive (U3 / J2 Task 2)
          </h2>
          <p className="text-xs text-muted-foreground">
            Proportional whole dots per period (never fractional). Reserved strictly for discrete entity counts. One hue,
            100% opacity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 rounded-lg border border-border/70 bg-card/60 backdrop-blur-xs">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-muted-foreground">Onboarding Cases per Week</span>
              <span className="text-xs text-muted-foreground tabular-nums font-medium">8 Weeks</span>
            </div>
            <DotMatrix
              data={onboardingWeeklyData}
              valueKey="count"
              periodKey="label"
              accessibilitySummary="Onboarding cases completed per week over the last 8 weeks"
              color="var(--accent-interactive, var(--primary))"
              maxDotsPerColumn={6}
              height={100}
            />
          </div>

          <div className="p-4 rounded-lg border border-border/70 bg-card/60 backdrop-blur-xs">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-muted-foreground">Notifications Sent per Day</span>
              <span className="text-xs text-muted-foreground tabular-nums font-medium">Last 7 Days</span>
            </div>
            <DotMatrix
              data={notificationDailyData}
              valueKey="sent"
              periodKey="day"
              accessibilitySummary="Transactional notification volume per day across 7 days"
              color="var(--rasikh-teal, #23879C)"
              maxDotsPerColumn={6}
              height={100}
            />
          </div>
        </div>
      </section>

      {/* 3. DistributionBar Primitive */}
      <section className="space-y-4">
        <div className="border-b border-border/60 pb-2">
          <h2 className="text-base font-semibold">
            3. DistributionBar Primitive (T6)
          </h2>
          <p className="text-xs text-muted-foreground">
            Stacked 100% distribution bar with T4 diagonal hatch pattern on residual available segment.
          </p>
        </div>

        <div className="p-4 rounded-lg border border-border/70 bg-card/60 backdrop-blur-xs space-y-4">
          <DistributionBar
            segments={distributionSegments}
          />
        </div>
      </section>

      {/* 4. SegmentedBar Primitive */}
      <section className="space-y-4">
        <div className="border-b border-border/60 pb-2">
          <h2 className="text-base font-semibold">
            4. SegmentedBar Primitive (T5)
          </h2>
          <p className="text-xs text-muted-foreground">
            5-segment track showing percentage progress against target.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg border border-border/70 bg-card/60 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-medium text-muted-foreground">Emiratisation (14.1% / 15%)</span>
              <span className="font-semibold text-amber-600 dark:text-amber-400">14.1%</span>
            </div>
            <SegmentedBar value={14.1} color="var(--warning-border)" />
          </div>

          <div className="p-4 rounded-lg border border-border/70 bg-card/60 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-medium text-muted-foreground">Compliant Quota (18.5% / 15%)</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">18.5%</span>
            </div>
            <SegmentedBar value={18.5} color="var(--success-border)" />
          </div>

          <div className="p-4 rounded-lg border border-border/70 bg-card/60 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-medium text-muted-foreground">Vendor Acceptance Rate</span>
              <span className="font-semibold text-foreground">78.0%</span>
            </div>
            <SegmentedBar value={78.0} />
          </div>
        </div>
      </section>

      {/* 5. SeverityDot Primitive */}
      <section className="space-y-4">
        <div className="border-b border-border/60 pb-2">
          <h2 className="text-base font-semibold">
            5. SeverityDot Primitive (J2 Task 3)
          </h2>
          <p className="text-xs text-muted-foreground">
            8px filled circle. Exactly three allowed colors (danger, warning, neutral). Never custom hex.
          </p>
        </div>

        <div className="p-4 rounded-lg border border-border/70 bg-card/60 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            {testSeverities.map((item) => (
              <div
                key={item.level}
                className="flex items-center gap-3 p-2.5 rounded-lg border border-border/40 bg-muted/20"
              >
                <SeverityDot severity={item.level} />
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-foreground">{item.level}</span>
                  <span className="text-[10px] text-muted-foreground">{item.token}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Test in simulated table row */}
          <div className="pt-3 border-t border-border/40 space-y-1.5">
            <span className="text-xs font-semibold text-muted-foreground">Example row integration:</span>
            <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30 text-xs">
              <div className="flex items-center gap-2.5">
                <SeverityDot severity="CRITICAL" />
                <span className="font-medium text-foreground">Organisation closure table integrity</span>
              </div>
              <span className="text-muted-foreground">Domain 2 hierarchy</span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30 text-xs">
              <div className="flex items-center gap-2.5">
                <SeverityDot severity="MEDIUM" />
                <span className="font-medium text-foreground">Reconciliation sync pending</span>
              </div>
              <span className="text-muted-foreground">Oracle ERP PO batch</span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30 text-xs">
              <div className="flex items-center gap-2.5">
                <SeverityDot severity="LOW" />
                <span className="font-medium text-foreground">Standard audit log rotation</span>
              </div>
              <span className="text-muted-foreground">Daily job complete</span>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Sparkline Primitive */}
      <section className="space-y-4">
        <div className="border-b border-border/60 pb-2">
          <h2 className="text-base font-semibold">
            6. Sparkline Primitive (T1 amendment)
          </h2>
          <p className="text-xs text-muted-foreground">
            28px line-only sparkline with hatched fill under curve and terminal dot.
          </p>
        </div>

        <div className="p-4 rounded-lg border border-border/70 bg-card/60">
          <Sparkline data={kpiData30} height={28} color="var(--accent-interactive, var(--primary))" />
        </div>
      </section>

      {/* 7. Band C Verification (J4) */}
      <section className="space-y-4">
        <div className="border-b border-border/60 pb-2">
          <h2 className="text-base font-semibold">
            7. Band C Visual Coverage Verification (C1 to C5 per Prompt J4)
          </h2>
          <p className="text-xs text-muted-foreground">
            C1 (severity dots), C2 (bucket-style bars), C3 (severity dots + neutral icons), C4 (60d milestone timeline with today marker), C5 (recent activity log unchanged).
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ItemsRequiringAttentionTable
            widgetId="items-requiring-attention"
            scope={{ level: "DEPARTMENT", label: "Information Technology" }}
            data={getMockWidgetData("items-requiring-attention")?.data as any}
          />
          <ContractRunwayWidget
            widgetId="contract-runway"
            scope={{ level: "DEPARTMENT", label: "Information Technology" }}
            data={getMockWidgetData("contract-runway")?.data as any}
          />
          <RequestExceptionsTable
            widgetId="request-exceptions"
            scope={{ level: "DEPARTMENT", label: "Information Technology" }}
            data={getMockWidgetData("request-exceptions")?.data as any}
          />
          <UpcomingMilestonesWidget
            widgetId="upcoming-milestones"
            scope={{ level: "DEPARTMENT", label: "Information Technology" }}
            data={getMockWidgetData("upcoming-milestones")?.data as any}
          />
        </div>

        <div className="w-full">
          <RecentActivityFeed
            widgetId="recent-activity"
            scope={{ level: "DEPARTMENT", label: "Information Technology" }}
            data={getMockWidgetData("recent-activity")?.data as any}
          />
        </div>
      </section>

      {/* 8. Band D Verification (J5) */}
      <section className="space-y-4">
        <div className="border-b border-border/60 pb-2">
          <h2 className="text-base font-semibold">
            8. Band D Visual Coverage Verification (D1 to D8 per Prompt J5)
          </h2>
          <p className="text-xs text-muted-foreground">
            D1 (SegmentedBar + BU horizontal bars), D2 (4px stage rail approval progress), D3 (SeverityDot per system), D4 (Status dot per system intact), D5 (Interview schedule list allow-list unchanged), D6 (Top 5 vendors horizontal bars), D7 (DotMatrix when &gt; 1 draft, text-only when 1 draft), D8 (SeverityDot per HR decision type).
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* D1: Emiratisation Quota */}
          <EmiratisationQuotaWidget
            widgetId="emiratisation-quota"
            scope={{ level: "ORGANIZATION", label: "DIEZ Enterprise" }}
            data={getMockWidgetData("emiratisation-quota")?.data as any}
          />

          {/* D2: Budget Period Status */}
          <BudgetPeriodStatusWidget
            widgetId="budget-period-status"
            scope={{ level: "DEPARTMENT", label: "Finance & Accounting" }}
            data={getMockWidgetData("budget-period-status")?.data as any}
          />

          {/* D3: Reconciliation Exceptions */}
          <ReconciliationExceptionsWidget
            widgetId="reconciliation-exceptions"
            scope={{ level: "DEPARTMENT", label: "Finance & Accounting" }}
            data={getMockWidgetData("reconciliation-exceptions")?.data as any}
          />

          {/* D4: Integration Health */}
          <IntegrationHealthWidget
            widgetId="integration-health"
            scope={{ level: "GLOBAL", label: "Enterprise Infrastructure" }}
            data={getMockWidgetData("integration-health")?.data as any}
          />

          {/* D5: Interview Schedule (Allow-list unchanged) */}
          <InterviewScheduleWidget
            widgetId="interview-schedule"
            scope={{ level: "SELF", label: "My Schedule" }}
            data={getMockWidgetData("interview-schedule")?.data as any}
          />

          {/* D6: Vendor Performance (Top 5 horizontal bars) */}
          <VendorPerformanceWidget
            widgetId="vendor-performance"
            scope={{ level: "DEPARTMENT", label: "Procurement" }}
            data={getMockWidgetData("vendor-performance")?.data as any}
          />

          {/* D7 (Multi-draft): DotMatrix Chart */}
          <DraftExpiryWatchWidget
            widgetId="draft-expiry-watch"
            scope={{ level: "SELF", label: "My Drafts (Multi-Draft: DotMatrix)" }}
            data={getMockWidgetData("draft-expiry-watch")?.data as any}
          />

          {/* D7 (Single-draft): Text-only Allow-list */}
          <DraftExpiryWatchWidget
            widgetId="draft-expiry-watch"
            scope={{ level: "SELF", label: "My Drafts (Single-Draft: Allow-list Text-Only)" }}
            data={{
              draftsExpiringCount: 1,
              soonestDaysRemaining: 4,
              soonestDeletionDate: "2026-09-04",
              items: [
                {
                  requestId: "req-draft-009",
                  title: "Senior Cloud Infrastructure Architect",
                  daysRemaining: 4,
                  expiresAt: "2026-09-04",
                  estimatedAmountFils: 55000000,
                },
              ],
            }}
          />

          {/* D8: Pending HR Decisions */}
          <PendingHrDecisionsWidget
            widgetId="pending-hr-decisions"
            scope={{ level: "ORGANIZATION", label: "DIEZ Enterprise HR" }}
            data={getMockWidgetData("pending-hr-decisions")?.data as any}
          />
        </div>

        {/* Persona Specific Band D Sections per Verification Requirement */}
        <div className="pt-8 space-y-8 border-t border-border/60">
          {/* HR Persona Band D */}
          <div className="space-y-3 p-4 rounded-lg border border-border/70 bg-card/40">
            <div className="border-b border-border/40 pb-2 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-primary">
                  HR Persona — Band D Widgets
                </h3>
                <p className="text-xs text-muted-foreground">
                  D1 (Emiratisation Quota with BU horizontal bars) &amp; D8 (Pending HR Decisions with severity dots)
                </p>
              </div>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                HR Scope
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <EmiratisationQuotaWidget
                widgetId="emiratisation-quota"
                scope={{ level: "ORGANIZATION", label: "DIEZ Enterprise" }}
                data={getMockWidgetData("emiratisation-quota")?.data as any}
              />
              <PendingHrDecisionsWidget
                widgetId="pending-hr-decisions"
                scope={{ level: "ORGANIZATION", label: "DIEZ Enterprise HR" }}
                data={getMockWidgetData("pending-hr-decisions")?.data as any}
              />
            </div>
          </div>

          {/* Finance Persona Band D */}
          <div className="space-y-3 p-4 rounded-lg border border-border/70 bg-card/40">
            <div className="border-b border-border/40 pb-2 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-primary">
                  Finance Persona — Band D Widgets
                </h3>
                <p className="text-xs text-muted-foreground">
                  D2 (Budget Period Status with 4px stage rail) &amp; D3 (Reconciliation Exceptions with severity dots)
                </p>
              </div>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                Finance Scope
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <BudgetPeriodStatusWidget
                widgetId="budget-period-status"
                scope={{ level: "DEPARTMENT", label: "Finance & Accounting" }}
                data={getMockWidgetData("budget-period-status")?.data as any}
              />
              <ReconciliationExceptionsWidget
                widgetId="reconciliation-exceptions"
                scope={{ level: "DEPARTMENT", label: "Finance & Accounting" }}
                data={getMockWidgetData("reconciliation-exceptions")?.data as any}
              />
            </div>
          </div>

          {/* Line Manager Persona Band D */}
          <div className="space-y-3 p-4 rounded-lg border border-border/70 bg-card/40">
            <div className="border-b border-border/40 pb-2 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-primary">
                  Line Manager Persona — Band D Widgets
                </h3>
                <p className="text-xs text-muted-foreground">
                  D5 (Interview Schedule list unchanged per allow-list) &amp; D7 (Draft Expiry Watch with DotMatrix)
                </p>
              </div>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                Line Manager Scope
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <InterviewScheduleWidget
                widgetId="interview-schedule"
                scope={{ level: "SELF", label: "My Schedule" }}
                data={getMockWidgetData("interview-schedule")?.data as any}
              />
              <DraftExpiryWatchWidget
                widgetId="draft-expiry-watch"
                scope={{ level: "SELF", label: "My Drafts" }}
                data={getMockWidgetData("draft-expiry-watch")?.data as any}
              />
            </div>
          </div>
        </div>
      </section>

      {/* 9. Band E — Platform Operations & Integrity (Task J6) */}
      <section className="space-y-6 pt-6 border-t border-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-primary/10 text-primary">
              Prompt J6
            </span>
            <h2 className="text-xl font-semibold tracking-tight">
              9. Band E — Platform Operations &amp; Integrity (All 12 Widgets)
            </h2>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            System Administrator widgets: Failure-detection preservation (E1/E2), DotMatrix trend (E4), horizontal bars (E7/E9/E10), SegmentedBar (E8), text-only allow-list (E3/E5/E6/E11), and configuration drift (E12).
          </p>
        </div>

        {/* Task 1: High-Stakes Correctness & Failure Detection (E1, E2) - Degraded Fixture */}
        <div className="space-y-4 p-5 rounded-lg border-2 border-danger-border/60 bg-danger-surface/20">
          <div className="border-b border-danger-border/40 pb-3 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-0.5 rounded bg-danger-surface text-danger-text font-bold border border-danger-border">
                  CRITICAL TEST — DEGRADED FIXTURE
                </span>
                <h3 className="text-base font-bold text-foreground">
                  Task 1: Failure Detection Active (E1 &amp; E2 Degraded State)
                </h3>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Verifies correctness features: E1 shows red row tint, high-contrast missedWindows badge (3 missed), SeverityDot (CRITICAL), and error dropdown. E2 shows CRITICAL left accent bar (4px red), SeverityDot (CRITICAL), and failed count.
              </p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-md bg-danger-surface text-danger-text font-semibold border border-danger-border">
              Degraded Mode
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
            <div className="lg:col-span-7">
              <BackgroundJobHealthWidget
                widgetId="background-job-health"
                scope={{ level: "GLOBAL", label: "Daemon Operations" }}
                data={getMockWidgetData("background-job-health", { degraded: true })?.data as any}
              />
            </div>
            <div className="lg:col-span-5">
              <DataIntegrityChecksWidget
                widgetId="data-integrity-checks"
                scope={{ level: "GLOBAL", label: "Platform Data Integrity" }}
                data={getMockWidgetData("data-integrity-checks", { degraded: true })?.data as any}
              />
            </div>
          </div>
        </div>

        {/* Task 1 Baseline: Healthy State (E1, E2) */}
        <div className="space-y-4 p-5 rounded-lg border border-border/70 bg-card/40">
          <div className="border-b border-border/40 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-foreground">
                Task 1 Baseline: Healthy Operations (E1 &amp; E2 Healthy State)
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                E1 jobs running nominally with green dots and 0 missed windows; E2 data integrity checks 100% passed with green dots.
              </p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-md bg-muted/60 text-foreground font-medium border border-border/40">
              Healthy Mode
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
            <div className="lg:col-span-7">
              <BackgroundJobHealthWidget
                widgetId="background-job-health"
                scope={{ level: "GLOBAL", label: "Daemon Operations" }}
                data={getMockWidgetData("background-job-health")?.data as any}
              />
            </div>
            <div className="lg:col-span-5">
              <DataIntegrityChecksWidget
                widgetId="data-integrity-checks"
                scope={{ level: "GLOBAL", label: "Platform Data Integrity" }}
                data={getMockWidgetData("data-integrity-checks")?.data as any}
              />
            </div>
          </div>
        </div>

        {/* Task 2 & Task 4: Trend Visuals (E4 DotMatrix) & Limits (E8 SegmentedBar) */}
        <div className="space-y-4 p-5 rounded-lg border border-border/70 bg-card/40">
          <div className="border-b border-border/40 pb-3">
            <h3 className="text-base font-bold text-foreground">
              Task 2 &amp; Task 4: Privilege Changes (E4) &amp; Rate Limit Pressure (E8)
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              E4 features DotMatrix (7-day trend) + DeltaChip (exactly 2 visual forms per Part 1.4 ceiling). E8 features SegmentedBar per tier (hits against limit).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <PrivilegeChangesWidget
              widgetId="privilege-changes"
              scope={{ level: "GLOBAL", label: "Enterprise Security" }}
              data={getMockWidgetData("privilege-changes")?.data as any}
            />
            <RateLimitPressureWidget
              widgetId="rate-limit-pressure"
              scope={{ level: "GLOBAL", label: "API Gateway" }}
              data={getMockWidgetData("rate-limit-pressure")?.data as any}
            />
          </div>
        </div>

        {/* Task 3: Proportional Horizontal Bars (E7, E9, E10) */}
        <div className="space-y-4 p-5 rounded-lg border border-border/70 bg-card/40">
          <div className="border-b border-border/40 pb-3">
            <h3 className="text-base font-bold text-foreground">
              Task 3: Horizontal Bars Replaced Flat Numbers (E7, E9, E10)
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Replaced flat lists with proportional horizontal bars in a single hue, values labelled at bar ends. E7 has 6 figures, E9 has 4 figures, E10 has 3 figures.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
            <AccountHygieneWidget
              widgetId="account-hygiene"
              scope={{ level: "GLOBAL", label: "Identity & Directory" }}
              data={getMockWidgetData("account-hygiene")?.data as any}
            />
            <NotificationDeliveryWidget
              widgetId="notification-delivery"
              scope={{ level: "GLOBAL", label: "Transactional Messaging" }}
              data={getMockWidgetData("notification-delivery")?.data as any}
            />
            <DocumentPipelineWidget
              widgetId="document-pipeline"
              scope={{ level: "GLOBAL", label: "Document Storage" }}
              data={getMockWidgetData("document-pipeline")?.data as any}
            />
          </div>
        </div>

        {/* Task 5 & Task 6: Allow-List & Semantic Statuses (E3, E5, E6, E11, E12) */}
        <div className="space-y-4 p-5 rounded-lg border border-border/70 bg-card/40">
          <div className="border-b border-border/40 pb-3">
            <h3 className="text-base font-bold text-foreground">
              Task 5 &amp; Task 6: Allow-List Text Widgets &amp; Semantic Status (E3, E5, E6, E11, E12)
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              E3 and E5 on text-only allow-list. E6 keeps amber marker for expiring soon. E11 remains text-only (no daily event-volume array in payload). E12 uses SeverityDot per drifted setting row.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
            <ScheduledActionsTonightWidget
              widgetId="scheduled-actions-tonight"
              scope={{ level: "GLOBAL", label: "System Schedules" }}
              data={getMockWidgetData("scheduled-actions-tonight")?.data as any}
            />
            <ElevatedAccessRegisterWidget
              widgetId="elevated-access-register"
              scope={{ level: "GLOBAL", label: "Access Governance" }}
              data={getMockWidgetData("elevated-access-register")?.data as any}
            />
            <ActiveDelegationsWidget
              widgetId="active-delegations"
              scope={{ level: "GLOBAL", label: "Authority Delegation" }}
              data={getMockWidgetData("active-delegations")?.data as any}
            />
            <AuditRetentionWidget
              widgetId="audit-retention"
              scope={{ level: "GLOBAL", label: "Compliance & Archive" }}
              data={getMockWidgetData("audit-retention")?.data as any}
            />
            <div className="md:col-span-2">
              <ConfigurationDriftWidget
                widgetId="configuration-drift"
                scope={{ level: "GLOBAL", label: "Environment Integrity" }}
                data={getMockWidgetData("configuration-drift")?.data as any}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
