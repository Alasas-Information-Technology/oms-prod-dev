/**
 * Dashboard Fixture Data and Mock Personas
 *
 * All figures use exact reference figures from DASHBOARD-PLAN.md where they exist,
 * and plausible, 100% reconciled figures for all new widgets.
 *
 * CRITICAL RULE: ALL MONETARY VALUES ARE INTEGERS IN MINOR UNITS (fils).
 * 1 AED = 100 fils. Never floats, never pre-formatted strings.
 */

import {
  DashboardLayout,
  DashboardPersona,
  WidgetId,
  WidgetResponse,
  WidgetDataMap,
} from "../../types/dashboard";

// =============================================================================
// Reference Fixture Payloads (Pre-Aggregated)
// =============================================================================

export const DASHBOARD_WIDGET_FIXTURES: {
  [K in WidgetId]: WidgetResponse<WidgetDataMap[K]>;
} = {
  // ---------------------------------------------------------------------------
  // Band A — Attention strip (KPI tiles)
  // ---------------------------------------------------------------------------
  "needs-my-action": {
    widgetId: "needs-my-action",
    scope: { level: "SELF", label: "My Tasks" },
    period: "Current",
    updatedAt: "2026-08-31T08:30:00.000Z",
    link: "/app/requests?tab=needs-my-action",
    data: {
      total: 4,
      overdue: 2,
      byType: {
        APPROVE: 2,
        REVISE: 1,
        CLARIFY: 1,
      },
    },
  },

  "requests-in-approval": {
    widgetId: "requests-in-approval",
    scope: { level: "SELF", label: "In Flight" },
    period: "Current",
    updatedAt: "2026-08-31T08:30:00.000Z",
    link: "/app/requests?status=in-approval",
    data: {
      count: 6,
      // 342,000,000 fils = AED 3,420,000.00
      totalAmountFils: 342000000,
      avgDaysInApproval: 4.2,
      urgentCount: 1,
    },
  },

  "onboarding-cases": {
    widgetId: "onboarding-cases",
    scope: { level: "SELF", label: "Active Onboardings" },
    period: "This Month",
    updatedAt: "2026-08-31T08:30:00.000Z",
    link: "/app/workforce/onboarding",
    data: {
      activeCount: 3,
      joiningThisWeek: 1,
      pendingDocuments: 2,
      completedThisMonth: 5,
    },
  },

  "expiring-documents": {
    widgetId: "expiring-documents",
    scope: { level: "DEPARTMENT", label: "Digital Security" },
    period: "Next 90 Days",
    updatedAt: "2026-08-31T08:30:00.000Z",
    link: "/app/workforce?filter=expiring-documents",
    data: {
      countWithin30Days: 4,
      countWithin60Days: 9,
      countWithin90Days: 15,
      criticalCount: 2,
    },
  },

  "auto-close-watch": {
    widgetId: "auto-close-watch",
    scope: { level: "DEPARTMENT", label: "Digital Security" },
    period: "Next 30 Days",
    updatedAt: "2026-08-31T08:30:00.000Z",
    link: "/app/requests?filter=closing-soon",
    data: {
      items: [
        {
          requestId: "OMS-2026-0139",
          position: "Lead DevOps Engineer",
          departmentName: "Digital Security",
          closesAt: "2026-09-05",
          daysRemaining: 5,
          fundsAtRisk: 28500000, // AED 285,000.00
        },
        {
          requestId: "OMS-2026-0141",
          position: "Information Security Specialist",
          departmentName: "Digital Security",
          closesAt: "2026-09-07",
          daysRemaining: 7,
          fundsAtRisk: 41500000, // AED 415,000.00
        },
        {
          requestId: "OMS-2026-0135",
          position: "Enterprise Data Architect",
          departmentName: "Corporate Technology",
          closesAt: "2026-09-08",
          daysRemaining: 8,
          fundsAtRisk: 50000000, // AED 500,000.00
        },
      ],
      // 28,500,000 + 41,500,000 + 50,000,000 = 120,000,000 fils (AED 1,200,000.00)
      totalFundsAtRisk: 120000000,
    },
  },

  "open-exceptions": {
    widgetId: "open-exceptions",
    scope: { level: "DEPARTMENT", label: "Digital Security" },
    period: "Current",
    updatedAt: "2026-08-31T08:30:00.000Z",
    link: "/app/requests?filter=exceptions",
    data: {
      totalExceptions: 3,
      slaBreaches: 2,
      budgetMismatches: 0,
      reconciliationVariances: 1,
    },
  },

  "candidates-awaiting-review": {
    widgetId: "candidates-awaiting-review",
    scope: { level: "SELF", label: "Interviewer Queue" },
    period: "Active",
    updatedAt: "2026-08-31T08:30:00.000Z",
    link: "/app/candidates?filter=awaiting-review",
    data: {
      totalAwaiting: 5,
      urgentReview: 2,
      interviewsScheduledThisWeek: 3,
      avgWaitDays: 3.1,
    },
  },

  "vendor-submissions": {
    widgetId: "vendor-submissions",
    scope: { level: "DEPARTMENT", label: "Procurement & Sourcing" },
    period: "This Week",
    updatedAt: "2026-08-31T08:30:00.000Z",
    link: "/app/vendors?filter=pending-submissions",
    data: {
      totalPending: 8,
      submittedThisWeek: 4,
      overdueResponses: 2,
      activeVendors: 6,
    },
  },

  "security-events": {
    widgetId: "security-events",
    scope: { level: "GLOBAL", label: "Enterprise Security" },
    period: "Last 24 Hours",
    updatedAt: "2026-08-31T08:30:00.000Z",
    link: "/app/administration/security-dashboard",
    data: {
      totalEvents24h: 14,
      failedLogins: 11,
      accountLockouts: 2,
      suspiciousActivities: 1,
    },
  },

  // ---------------------------------------------------------------------------
  // Band B — Position (Charts)
  // ---------------------------------------------------------------------------
  "requests-by-lifecycle-stage": {
    widgetId: "requests-by-lifecycle-stage",
    scope: { level: "DEPARTMENT", label: "Digital Security" },
    period: "Last 90 Days",
    updatedAt: "2026-08-31T08:30:00.000Z",
    link: "/app/requests",
    data: {
      stages: [
        {
          stage: "DRAFT",
          label: "Draft",
          count: 2,
          totalAmountFils: 74000000,
        },
        {
          stage: "IN_APPROVAL",
          label: "In Approval",
          count: 6,
          totalAmountFils: 342000000,
        },
        {
          stage: "HR_REVIEW",
          label: "HR Review",
          count: 3,
          totalAmountFils: 185000000,
        },
        {
          stage: "PROCUREMENT",
          label: "Procurement",
          count: 4,
          totalAmountFils: 260000000,
        },
        {
          stage: "ONBOARDING",
          label: "Onboarding",
          count: 3,
          totalAmountFils: 160000000,
        },
      ],
      totalRequests: 18,
      filterPeriod: "90d",
    },
  },

  "budget-exposure": {
    widgetId: "budget-exposure",
    scope: { level: "DEPARTMENT", label: "Digital Security" },
    period: "FY 2026",
    updatedAt: "2026-08-31T08:30:00.000Z",
    link: "/app/budget?department=dept-dig-002",
    data: {
      // 566,000,000 + 184,000,000 + 174,000,000 + 96,000,000 = 1,020,000,000 fils (AED 10.20M)
      totalFils: 1020000000,
      availableFils: 566000000,
      reservedFils: 184000000,
      lockedFils: 174000000,
      consumedFils: 96000000,
      breakdown: {
        availablePercent: 55.5,
        reservedPercent: 18.0,
        lockedPercent: 17.1,
        consumedPercent: 9.4,
      },
      currency: "AED",
      isReconciled: true,
      fiscalPeriod: "FY 2026",
    },
  },

  "budget-allocation-by-department": {
    widgetId: "budget-allocation-by-department",
    scope: { level: "BUSINESS_UNIT", label: "Corporate Technology & Ops" },
    period: "FY 2026",
    updatedAt: "2026-08-31T08:30:00.000Z",
    link: "/app/budget",
    data: {
      departments: [
        {
          orgUnitId: "dept-dig-002",
          name: "Digital Security",
          allocated: 320000000,
          consumed: 96000000,
          reserved: 54000000,
          utilisationPercent: 30.0,
        },
        {
          orgUnitId: "dept-corp-001",
          name: "Corporate Technology",
          allocated: 580000000,
          consumed: 70000000,
          reserved: 48000000,
          utilisationPercent: 12.1,
        },
        {
          orgUnitId: "dept-eng-003",
          name: "Engineering & Facilities",
          allocated: 440000000,
          consumed: 24000000,
          reserved: 32000000,
          utilisationPercent: 5.5,
        },
        {
          orgUnitId: "dept-hr-004",
          name: "People & Operations",
          allocated: 360000000,
          consumed: 12000000,
          reserved: 18000000,
          utilisationPercent: 3.3,
        },
        {
          orgUnitId: "dept-fin-005",
          name: "Finance & Strategy",
          allocated: 780000000,
          consumed: 8000000,
          reserved: 14000000,
          utilisationPercent: 1.0,
        },
      ],
      totals: {
        // 320 + 580 + 440 + 360 + 780 = 2,480,000,000 fils
        allocated: 2480000000,
        // 96 + 70 + 24 + 12 + 8 = 210,000,000 fils
        consumed: 210000000,
        reserved: 166000000,
        utilisationPercent: 8.5,
      },
    },
  },

  "workforce-by-department": {
    widgetId: "workforce-by-department",
    scope: { level: "ORGANIZATION", label: "DIEZ Enterprise" },
    period: "Active",
    updatedAt: "2026-08-31T08:30:00.000Z",
    link: "/app/workforce",
    data: {
      departments: [
        {
          orgUnitId: "dept-dig-002",
          name: "Digital Security",
          active: 23,
          onshore: 18,
          offshore: 5,
          onboarding: 3,
          endingWithin90Days: 4,
        },
        {
          orgUnitId: "dept-corp-001",
          name: "Corporate Technology",
          active: 45,
          onshore: 36,
          offshore: 9,
          onboarding: 5,
          endingWithin90Days: 8,
        },
        {
          orgUnitId: "dept-eng-003",
          name: "Engineering & Facilities",
          active: 32,
          onshore: 24,
          offshore: 8,
          onboarding: 2,
          endingWithin90Days: 3,
        },
        {
          orgUnitId: "dept-hr-004",
          name: "People & Operations",
          active: 18,
          onshore: 14,
          offshore: 4,
          onboarding: 1,
          endingWithin90Days: 2,
        },
        {
          orgUnitId: "dept-fin-005",
          name: "Finance & Strategy",
          active: 24,
          onshore: 18,
          offshore: 6,
          onboarding: 2,
          endingWithin90Days: 3,
        },
      ],
      totals: {
        // 23 + 45 + 32 + 18 + 24 = 142 active contractors
        active: 142,
        // 18 + 36 + 24 + 14 + 18 = 110 onshore
        onshore: 110,
        // 5 + 9 + 8 + 4 + 6 = 32 offshore
        offshore: 32,
        onboarding: 13,
        endingWithin90Days: 20,
      },
    },
  },

  "budget-vs-actual-trend": {
    widgetId: "budget-vs-actual-trend",
    scope: { level: "DEPARTMENT", label: "Digital Security" },
    period: "FY 2026",
    updatedAt: "2026-08-31T08:30:00.000Z",
    link: "/app/budget",
    data: {
      months: [
        { month: "Jan", plannedFils: 206000000, actualFils: 180000000, varianceFils: -26000000, isOverBudget: false },
        { month: "Feb", plannedFils: 206000000, actualFils: 195000000, varianceFils: -11000000, isOverBudget: false },
        { month: "Mar", plannedFils: 206000000, actualFils: 215000000, varianceFils: 9000000, isOverBudget: true },
        { month: "Apr", plannedFils: 206000000, actualFils: 202000000, varianceFils: -4000000, isOverBudget: false },
        { month: "May", plannedFils: 206000000, actualFils: 208000000, varianceFils: 2000000, isOverBudget: true },
        { month: "Jun", plannedFils: 206000000, actualFils: 210000000, varianceFils: 4000000, isOverBudget: true },
        { month: "Jul", plannedFils: 206000000, actualFils: 198000000, varianceFils: -8000000, isOverBudget: false },
        { month: "Aug", plannedFils: 206000000, actualFils: 210000000, varianceFils: 4000000, isOverBudget: true },
      ],
      totals: {
        plannedFils: 2480000000,
        actualFils: 1618000000,
        varianceFils: -862000000,
      },
    },
  },

  "time-in-stage": {
    widgetId: "time-in-stage",
    scope: { level: "DEPARTMENT", label: "Digital Security" },
    period: "Last 90 Days",
    updatedAt: "2026-08-31T08:30:00.000Z",
    link: "/app/requests",
    data: {
      stages: [
        { stage: "DRAFT", label: "Draft & Prep", avgDays: 2.1, targetDays: 3.0, isSlowest: false },
        { stage: "LINE_MANAGER", label: "Line Manager Endorsement", avgDays: 1.4, targetDays: 2.0, isSlowest: false },
        { stage: "HOD", label: "HOD Approval", avgDays: 3.8, targetDays: 2.0, isSlowest: false },
        { stage: "HR_REVIEW", label: "HR Review & Validation", avgDays: 5.2, targetDays: 3.0, isSlowest: true },
        { stage: "PROCUREMENT", label: "Procurement & Sourcing", avgDays: 4.1, targetDays: 4.0, isSlowest: false },
      ],
      overallAvgDays: 16.6,
      slowestStage: "HR Review & Validation",
    },
  },

  // ---------------------------------------------------------------------------
  // Band C — Work (Tables & Feeds)
  // ---------------------------------------------------------------------------
  "items-requiring-attention": {
    widgetId: "items-requiring-attention",
    scope: { level: "SELF", label: "My Action Required" },
    period: "Active",
    updatedAt: "2026-08-31T08:30:00.000Z",
    link: "/app/requests?tab=needs-my-action",
    data: {
      items: [
        {
          id: "act-001",
          item: "Respond to HR clarification",
          requestId: "req-0148",
          requestCode: "OMS-2026-0148",
          stage: "HR Review",
          due: "Today",
          dueDate: "2026-08-31",
          isOverdue: true,
          overdueDays: 1,
          priority: "HIGH",
          link: "/app/requests/OMS-2026-0148",
        },
        {
          id: "act-002",
          item: "Confirm candidate shortlist",
          requestId: "req-0146",
          requestCode: "OMS-2026-0146",
          stage: "Candidate Review",
          due: "07 Sep",
          dueDate: "2026-09-07",
          isOverdue: false,
          priority: "MEDIUM",
          link: "/app/candidates?request=OMS-2026-0146",
        },
        {
          id: "act-003",
          item: "Complete joining readiness",
          requestId: "req-0139",
          requestCode: "OMS-2026-0139",
          stage: "Onboarding",
          due: "12 Sep",
          dueDate: "2026-09-12",
          isOverdue: false,
          priority: "LOW",
          link: "/app/workforce/onboarding?request=OMS-2026-0139",
        },
      ],
      totalItems: 3,
    },
  },

  "contract-runway": {
    widgetId: "contract-runway",
    scope: { level: "DEPARTMENT", label: "Digital Security" },
    period: "Next 12 Months",
    updatedAt: "2026-08-31T08:30:00.000Z",
    link: "/app/workforce?filter=ending-soon",
    data: {
      buckets: [
        { range: "0-30", count: 4, label: "Ending within 30 days" },
        { range: "31-90", count: 11, label: "31 to 90 days" },
        { range: "91-180", count: 26, label: "3 to 6 months" },
        { range: "180+", count: 101, label: "Over 6 months" },
      ],
      // 4 + 11 + 26 + 101 = 142 total active contracts (reconciled with workforce total)
      byVendor: [
        { vendorId: "ven-001", name: "Adecco Middle East", active: 42, endingWithin90Days: 5 },
        { vendorId: "ven-002", name: "Hays Specialist Recruitment", active: 34, endingWithin90Days: 7 },
        { vendorId: "ven-003", name: "Michael Page International", active: 38, endingWithin90Days: 2 },
        { vendorId: "ven-004", name: "Robert Half UAE", active: 28, endingWithin90Days: 1 },
      ],
      // 42 + 34 + 38 + 28 = 142 active contracts. 5 + 7 + 2 + 1 = 15 ending within 90 days (4 + 11 = 15)
      replacementWindowOpen: 11,
    },
  },

  "request-exceptions": {
    widgetId: "request-exceptions",
    scope: { level: "DEPARTMENT", label: "Digital Security" },
    period: "Active",
    updatedAt: "2026-08-31T08:30:00.000Z",
    link: "/app/requests?filter=exceptions",
    data: {
      items: [
        {
          id: "exc-001",
          type: "RECONCILIATION_VARIANCE",
          requestId: "req-0131",
          requestCode: "OMS-2026-0131",
          detail: "Oracle PR not found",
          ageDays: 3,
          owner: {
            userId: "user-fa-001",
            name: "Rashid Al Nuaimi",
          },
          severity: "HIGH",
        },
        {
          id: "exc-002",
          type: "SLA_BREACH",
          requestId: "req-0129",
          requestCode: "OMS-2026-0129",
          detail: "HOD review exceeded 5-day SLA",
          ageDays: 6,
          owner: {
            userId: "user-hod-002",
            name: "Dr. Tariq Al Humaidi",
          },
          severity: "HIGH",
        },
        {
          id: "exc-003",
          type: "SLA_BREACH",
          requestId: "req-0134",
          requestCode: "OMS-2026-0134",
          detail: "Vendor candidate submission overdue",
          ageDays: 4,
          owner: {
            userId: "user-proc-004",
            name: "Mona Al Marri",
          },
          severity: "MEDIUM",
        },
      ],
      countsByType: {
        SLA_BREACH: 2,
        RECONCILIATION_VARIANCE: 1,
      },
    },
  },

  "upcoming-milestones": {
    widgetId: "upcoming-milestones",
    scope: { level: "SELF", label: "Schedule" },
    period: "Next 30 Days",
    updatedAt: "2026-08-31T08:30:00.000Z",
    link: "/app/workforce",
    data: {
      milestones: [
        {
          id: "ms-001",
          type: "INTERVIEW",
          label: "Interviews",
          detail: "3 candidates shortlisted",
          date: "2026-09-09",
          formattedDate: "09 Sep",
          link: "/app/candidates?tab=interviews",
        },
        {
          id: "ms-002",
          type: "JOINING",
          label: "Joining",
          detail: "Ahmed Rahman (DevOps Lead)",
          date: "2026-09-12",
          formattedDate: "12 Sep",
          link: "/app/workforce/onboarding",
        },
        {
          id: "ms-003",
          type: "DOCUMENT_EXPIRY",
          label: "Document Expiry",
          detail: "4 resources within 30 days",
          date: "2026-09-30",
          formattedDate: "30 Sep",
          link: "/app/workforce?filter=expiring-documents",
        },
        {
          id: "ms-004",
          type: "CONTRACT_END",
          label: "Contract Renewal",
          detail: "2 Senior Architects (Adecco)",
          date: "2026-10-15",
          formattedDate: "15 Oct",
          link: "/app/workforce?filter=ending-soon",
        },
      ],
      totalCount: 4,
    },
  },

  "recent-activity": {
    widgetId: "recent-activity",
    scope: { level: "SELF", label: "Audit Stream" },
    period: "Recent",
    updatedAt: "2026-08-31T08:30:00.000Z",
    link: "/app/reports",
    data: {
      activities: [
        {
          id: "act-01",
          actor: {
            userId: "user-hod-002",
            name: "Dr. Tariq Al Humaidi",
            roleDisplayName: "Head of Department",
          },
          action: "APPROVED",
          description: "HOD approved OMS-2026-0141",
          timestamp: "2026-08-31T06:30:00.000Z",
          relativeTime: "2 hours ago",
          subjectRef: "OMS-2026-0141",
          link: "/app/requests/OMS-2026-0141",
        },
        {
          id: "act-02",
          actor: {
            userId: "user-hr-003",
            name: "Fatima Al Mansoori",
            roleDisplayName: "HR Specialist",
          },
          action: "SHORTLISTED",
          description: "HR shortlisted 3 candidates for OMS-2026-0146",
          timestamp: "2026-08-31T04:15:00.000Z",
          relativeTime: "4 hours ago",
          subjectRef: "OMS-2026-0146",
          link: "/app/candidates?request=OMS-2026-0146",
        },
        {
          id: "act-03",
          actor: {
            userId: "user-fa-001",
            name: "Rashid Al Nuaimi",
            roleDisplayName: "Finance Analyst",
          },
          action: "RECONCILED",
          description: "Finance reconciled Oracle ERP batch #ORCL-SYNC-0831",
          timestamp: "2026-08-30T16:45:00.000Z",
          relativeTime: "Yesterday",
          subjectRef: "ORCL-SYNC-0831",
          link: "/app/budget",
        },
        {
          id: "act-04",
          actor: {
            userId: "user-req-001",
            name: "Mariam Al Hashimi",
            roleDisplayName: "Department Originator",
          },
          action: "SUBMITTED",
          description: "Mariam submitted requisition OMS-2026-0148",
          timestamp: "2026-08-30T14:20:00.000Z",
          relativeTime: "Yesterday",
          subjectRef: "OMS-2026-0148",
          link: "/app/requests/OMS-2026-0148",
        },
        {
          id: "act-05",
          actor: {
            userId: "user-sys-009",
            name: "System Scheduler",
            roleDisplayName: "Automation Engine",
          },
          action: "NOTIFICATION",
          description: "Auto-close warnings dispatched for 3 expiring requisitions",
          timestamp: "2026-08-30T10:00:00.000Z",
          relativeTime: "Yesterday",
          link: "/app/requests?filter=closing-soon",
        },
      ],
      totalCount: 5,
    },
  },

  // ---------------------------------------------------------------------------
  // Band D — Role-Specific Governance & Administration
  // ---------------------------------------------------------------------------
  "emiratisation-quota": {
    widgetId: "emiratisation-quota",
    scope: { level: "ORGANIZATION", label: "DIEZ Enterprise HR" },
    period: "FY 2026",
    updatedAt: "2026-08-31T08:30:00.000Z",
    link: "/app/workforce",
    data: {
      currentHeadcount: 142,
      uaeNationalHeadcount: 20,
      currentPercent: 14.1,
      targetPercent: 15.0,
      isCompliant: false,
      byBusinessUnit: [
        {
          businessUnitId: "bu-tech-001",
          name: "Corporate Technology",
          totalHeadcount: 68,
          uaeNationalHeadcount: 10,
          currentPercent: 14.7,
          targetPercent: 15.0,
        },
        {
          businessUnitId: "bu-ops-002",
          name: "Operations & Engineering",
          totalHeadcount: 50,
          uaeNationalHeadcount: 8,
          currentPercent: 16.0,
          targetPercent: 15.0,
        },
        {
          businessUnitId: "bu-fin-003",
          name: "Finance & Administration",
          totalHeadcount: 24,
          uaeNationalHeadcount: 2,
          currentPercent: 8.3,
          targetPercent: 15.0,
        },
      ],
    },
  },

  "budget-period-status": {
    widgetId: "budget-period-status",
    scope: { level: "DEPARTMENT", label: "Digital Security" },
    period: "FY 2026",
    updatedAt: "2026-08-31T08:30:00.000Z",
    link: "/app/budget",
    data: {
      periodId: "a1b2c3d4-0001-4000-8000-000000000001",
      periodCode: "FY2026",
      periodName: "Financial Year 2026",
      status: "OPEN",
      approvalProgress: {
        currentLevel: 3,
        totalLevels: 3,
        isComplete: true,
        lastApprovedBy: "Dr. Hamad Al Mutawa (Finance HOD)",
        lastApprovedAt: "2026-08-01T11:05:00.000Z",
      },
      lastAmendedAt: "2026-08-01T11:05:00.000Z",
      canAmend: true,
      canClose: true,
      canReopen: false,
    },
  },

  "reconciliation-exceptions": {
    widgetId: "reconciliation-exceptions",
    scope: { level: "DEPARTMENT", label: "Corporate Finance" },
    period: "Current",
    updatedAt: "2026-08-31T08:30:00.000Z",
    link: "/app/budget?tab=exceptions",
    data: {
      totalExceptions: 1,
      oldestAgeDays: 3,
      bySystem: [
        {
          system: "ORACLE",
          label: "Oracle ERP Cloud",
          exceptionCount: 1,
          oldestAgeDays: 3,
          lastCheckedAt: "2026-08-31T08:00:00.000Z",
        },
        {
          system: "DOCUSIGN",
          label: "DocuSign Envelope Service",
          exceptionCount: 0,
          oldestAgeDays: 0,
          lastCheckedAt: "2026-08-31T08:15:00.000Z",
        },
        {
          system: "SANED",
          label: "Saned Vendor Portal",
          exceptionCount: 0,
          oldestAgeDays: 0,
          lastCheckedAt: "2026-08-31T08:20:00.000Z",
        },
      ],
      link: "/app/budget?tab=exceptions",
    },
  },

  "integration-health": {
    widgetId: "integration-health",
    scope: { level: "GLOBAL", label: "Enterprise Architecture" },
    period: "Real-time",
    updatedAt: "2026-08-31T08:30:00.000Z",
    link: "/app/administration/security-dashboard",
    data: {
      systems: [
        {
          id: "sys-orcl",
          name: "Oracle ERP Cloud (Financials & PO)",
          code: "ORACLE",
          status: "HEALTHY",
          lastSyncAt: "2026-08-31T08:00:00.000Z",
          failureCount24h: 0,
          responseTimeMs: 142,
        },
        {
          id: "sys-docu",
          name: "DocuSign Electronic Signature",
          code: "DOCUSIGN",
          status: "HEALTHY",
          lastSyncAt: "2026-08-31T08:15:00.000Z",
          failureCount24h: 0,
          responseTimeMs: 310,
        },
        {
          id: "sys-saned",
          name: "Saned Contractor Platform",
          code: "SANED",
          status: "HEALTHY",
          lastSyncAt: "2026-08-31T08:20:00.000Z",
          failureCount24h: 0,
          responseTimeMs: 225,
        },
        {
          id: "sys-ad",
          name: "Azure Active Directory / Okta SSO",
          code: "ACTIVE_DIRECTORY",
          status: "HEALTHY",
          lastSyncAt: "2026-08-31T08:29:00.000Z",
          failureCount24h: 0,
          responseTimeMs: 88,
        },
      ],
      overallHealth: "HEALTHY",
    },
  },

  "interview-schedule": {
    widgetId: "interview-schedule",
    scope: { level: "SELF", label: "Interviewer Agenda" },
    period: "Next 7 Days",
    updatedAt: "2026-08-31T08:30:00.000Z",
    link: "/app/candidates",
    data: {
      interviews: [
        {
          id: "int-001",
          candidateName: "Zaid Al Nuaimi",
          candidateId: "cand-001",
          position: "Senior Cybersecurity Analyst",
          requestId: "OMS-2026-0148",
          scheduledAt: "2026-09-02T10:00:00.000Z",
          formattedDate: "02 Sep",
          formattedTime: "10:00 AM",
          medium: "ONLINE",
          locationOrLink: "Microsoft Teams",
          status: "SCHEDULED",
        },
        {
          id: "int-002",
          candidateName: "Priya Sharma",
          candidateId: "cand-002",
          position: "Cloud DevOps Consultant",
          requestId: "OMS-2026-0146",
          scheduledAt: "2026-09-03T14:30:00.000Z",
          formattedDate: "03 Sep",
          formattedTime: "02:30 PM",
          medium: "IN_PERSON",
          locationOrLink: "DIEZ HQ, Tower B, Room 402",
          status: "SCHEDULED",
        },
        {
          id: "int-003",
          candidateName: "Marcus Vance",
          candidateId: "cand-003",
          position: "Senior Infrastructure Architect",
          requestId: "OMS-2026-0139",
          scheduledAt: "2026-09-05T11:00:00.000Z",
          formattedDate: "05 Sep",
          formattedTime: "11:00 AM",
          medium: "ONLINE",
          locationOrLink: "Microsoft Teams",
          status: "SCHEDULED",
        },
      ],
      totalScheduled: 3,
    },
  },

  "vendor-performance": {
    widgetId: "vendor-performance",
    scope: { level: "DEPARTMENT", label: "Procurement & Contracts" },
    period: "FY 2026",
    updatedAt: "2026-08-31T08:30:00.000Z",
    link: "/app/vendors",
    data: {
      vendors: [
        {
          vendorId: "ven-001",
          name: "Adecco Middle East",
          submissionRatePercent: 94.5,
          avgTimeToSubmitDays: 3.2,
          acceptanceRatePercent: 78.0,
          activePlacements: 42,
          totalSubmissions: 54,
        },
        {
          vendorId: "ven-002",
          name: "Hays Specialist Recruitment",
          submissionRatePercent: 91.0,
          avgTimeToSubmitDays: 4.1,
          acceptanceRatePercent: 72.5,
          activePlacements: 34,
          totalSubmissions: 47,
        },
        {
          vendorId: "ven-003",
          name: "Michael Page International",
          submissionRatePercent: 88.5,
          avgTimeToSubmitDays: 4.8,
          acceptanceRatePercent: 69.0,
          activePlacements: 38,
          totalSubmissions: 55,
        },
        {
          vendorId: "ven-004",
          name: "Robert Half UAE",
          submissionRatePercent: 85.0,
          avgTimeToSubmitDays: 5.2,
          acceptanceRatePercent: 65.0,
          activePlacements: 28,
          totalSubmissions: 43,
        },
      ],
      period: "FY 2026",
    },
  },

  "draft-expiry-watch": {
    widgetId: "draft-expiry-watch",
    scope: { level: "SELF", label: "My Drafts" },
    period: "Next 30 Days",
    updatedAt: "2026-08-31T08:30:00.000Z",
    link: "/app/requests?tab=drafts",
    data: {
      draftsExpiringCount: 2,
      soonestDaysRemaining: 6,
      soonestDeletionDate: "2026-09-06",
      items: [
        {
          requestId: "req-draft-001",
          title: "ERP Security Compliance Auditor",
          daysRemaining: 6,
          expiresAt: "2026-09-06",
          estimatedAmountFils: 42000000,
        },
        {
          requestId: "req-draft-002",
          title: "Full Stack React Developer",
          daysRemaining: 9,
          expiresAt: "2026-09-09",
          estimatedAmountFils: 32000000,
        },
      ],
    },
  },

  "pending-hr-decisions": {
    widgetId: "pending-hr-decisions",
    scope: { level: "ORGANIZATION", label: "DIEZ Enterprise HR" },
    period: "Active",
    updatedAt: "2026-08-31T08:30:00.000Z",
    link: "/app/requests?tab=hr-review",
    data: {
      totalPending: 7,
      byClarificationType: {
        newReview: 3,
        responseToClarification: 2,
        amendmentReview: 1,
        salaryException: 1,
      },
      urgentCount: 2,
    },
  },
};

// =============================================================================
// Five Persona Layout Fixture Sets (Part 3 of DASHBOARD-PLAN.md)
// =============================================================================

export const DASHBOARD_PERSONA_LAYOUTS: Record<DashboardPersona, DashboardLayout> = {
  // ---------------------------------------------------------------------------
  // 1. Department Requestor
  // Part 3: A1, A2, A3, A4, A5 · B1, B2 · C1, C4, C5 · D7
  // ---------------------------------------------------------------------------
  requestor: {
    greeting: {
      name: "Mariam",
      period: "MORNING",
    },
    scope: {
      level: "SELF",
      label: "Digital Security Department",
      orgUnitId: "dept-dig-002",
    },
    fiscalPeriod: {
      code: "FY2026",
      label: "FY 2026",
      isOpen: true,
    },
    bands: [
      {
        band: "A",
        widgets: [
          { id: "needs-my-action", span: 3, priority: 10 },
          { id: "requests-in-approval", span: 3, priority: 20 },
          { id: "auto-close-watch", span: 3, priority: 30 },
          { id: "expiring-documents", span: 3, priority: 40 },
        ],
      },
      {
        band: "B",
        widgets: [
          { id: "requests-by-lifecycle-stage", span: 6, priority: 10 },
          { id: "budget-exposure", span: 6, priority: 20 },
        ],
      },
      {
        band: "C",
        widgets: [
          { id: "items-requiring-attention", span: 6, priority: 10 },
          { id: "upcoming-milestones", span: 3, priority: 20 },
          { id: "recent-activity", span: 3, priority: 30 },
        ],
      },
      {
        band: "D",
        widgets: [
          { id: "draft-expiry-watch", span: 6, priority: 10 },
          { id: "onboarding-cases", span: 6, priority: 20 },
        ],
      },
    ],
    updatedAt: "2026-08-31T08:30:00.000Z",
  },

  // ---------------------------------------------------------------------------
  // 2. Head of Department (HOD)
  // Part 3: A1, A2, A5, A6 · B1, B2, B3, B4, B6 · C1, C2, C3, C4, C5 · D2
  // ---------------------------------------------------------------------------
  hod: {
    greeting: {
      name: "Dr. Tariq",
      period: "MORNING",
    },
    scope: {
      level: "DEPARTMENT",
      label: "Digital Security",
      orgUnitId: "dept-dig-002",
    },
    fiscalPeriod: {
      code: "FY2026",
      label: "FY 2026",
      isOpen: true,
    },
    bands: [
      {
        band: "A",
        widgets: [
          { id: "needs-my-action", span: 3, priority: 10 },
          { id: "requests-in-approval", span: 3, priority: 20 },
          { id: "auto-close-watch", span: 3, priority: 30 },
          { id: "open-exceptions", span: 3, priority: 40 },
        ],
      },
      {
        band: "B",
        widgets: [
          { id: "requests-by-lifecycle-stage", span: 4, priority: 10 },
          { id: "budget-exposure", span: 4, priority: 20 },
          { id: "budget-allocation-by-department", span: 4, priority: 30 },
        ],
      },
      {
        band: "C",
        widgets: [
          { id: "items-requiring-attention", span: 6, priority: 10 },
          { id: "contract-runway", span: 6, priority: 20 },
          { id: "request-exceptions", span: 4, priority: 30 },
          { id: "upcoming-milestones", span: 4, priority: 40 },
          { id: "recent-activity", span: 4, priority: 50 },
        ],
      },
      {
        band: "D",
        widgets: [
          { id: "budget-period-status", span: 6, priority: 10 },
          { id: "workforce-by-department", span: 6, priority: 20 },
        ],
      },
    ],
    updatedAt: "2026-08-31T08:30:00.000Z",
  },

  // ---------------------------------------------------------------------------
  // 3. HR Specialist / Manager
  // Part 3: A1, A2, A4, A6 · B1, B4, B6 · C1, C3, C4, C5 · D1, D8
  // ---------------------------------------------------------------------------
  hr: {
    greeting: {
      name: "Fatima",
      period: "MORNING",
    },
    scope: {
      level: "ORGANIZATION",
      label: "DIEZ Enterprise HR",
      orgUnitId: "dept-hr-004",
    },
    fiscalPeriod: {
      code: "FY2026",
      label: "FY 2026",
      isOpen: true,
    },
    bands: [
      {
        band: "A",
        widgets: [
          { id: "needs-my-action", span: 3, priority: 10 },
          { id: "requests-in-approval", span: 3, priority: 20 },
          { id: "expiring-documents", span: 3, priority: 30 },
          { id: "open-exceptions", span: 3, priority: 40 },
        ],
      },
      {
        band: "B",
        widgets: [
          { id: "requests-by-lifecycle-stage", span: 4, priority: 10 },
          { id: "workforce-by-department", span: 4, priority: 20 },
          { id: "time-in-stage", span: 4, priority: 30 },
        ],
      },
      {
        band: "C",
        widgets: [
          { id: "items-requiring-attention", span: 6, priority: 10 },
          { id: "request-exceptions", span: 6, priority: 20 },
          { id: "upcoming-milestones", span: 6, priority: 30 },
          { id: "recent-activity", span: 6, priority: 40 },
        ],
      },
      {
        band: "D",
        widgets: [
          { id: "emiratisation-quota", span: 6, priority: 10 },
          { id: "pending-hr-decisions", span: 6, priority: 20 },
        ],
      },
    ],
    updatedAt: "2026-08-31T08:30:00.000Z",
  },

  // ---------------------------------------------------------------------------
  // 4. Corporate Finance
  // Part 3: A1, A6 · B2, B3, B5 · C3, C5 · D2, D3
  // ---------------------------------------------------------------------------
  finance: {
    greeting: {
      name: "Rashid",
      period: "MORNING",
    },
    scope: {
      level: "GLOBAL",
      label: "Corporate Finance & Budget Office",
      orgUnitId: "dept-fin-005",
    },
    fiscalPeriod: {
      code: "FY2026",
      label: "FY 2026",
      isOpen: true,
    },
    bands: [
      {
        band: "A",
        widgets: [
          { id: "needs-my-action", span: 6, priority: 10 },
          { id: "open-exceptions", span: 6, priority: 20 },
        ],
      },
      {
        band: "B",
        widgets: [
          { id: "budget-exposure", span: 4, priority: 10 },
          { id: "budget-allocation-by-department", span: 4, priority: 20 },
          { id: "budget-vs-actual-trend", span: 4, priority: 30 },
        ],
      },
      {
        band: "C",
        widgets: [
          { id: "request-exceptions", span: 6, priority: 10 },
          { id: "recent-activity", span: 6, priority: 20 },
        ],
      },
      {
        band: "D",
        widgets: [
          { id: "budget-period-status", span: 6, priority: 10 },
          { id: "reconciliation-exceptions", span: 6, priority: 20 },
        ],
      },
    ],
    updatedAt: "2026-08-31T08:30:00.000Z",
  },

  // ---------------------------------------------------------------------------
  // 5. System & Security Administrator
  // Part 3: A1, A9 · C5 · D3, D4
  // ---------------------------------------------------------------------------
  systemAdmin: {
    greeting: {
      name: "Sultan",
      period: "MORNING",
    },
    scope: {
      level: "GLOBAL",
      label: "Enterprise IT & Security Operations",
    },
    fiscalPeriod: {
      code: "FY2026",
      label: "FY 2026",
      isOpen: true,
    },
    bands: [
      {
        band: "A",
        widgets: [
          { id: "needs-my-action", span: 6, priority: 10 },
          { id: "security-events", span: 6, priority: 20 },
        ],
      },
      {
        band: "C",
        widgets: [
          { id: "recent-activity", span: 12, priority: 10 },
        ],
      },
      {
        band: "D",
        widgets: [
          { id: "reconciliation-exceptions", span: 6, priority: 10 },
          { id: "integration-health", span: 6, priority: 20 },
        ],
      },
    ],
    updatedAt: "2026-08-31T08:30:00.000Z",
  },
};

// =============================================================================
// Fixture Query Resolution Helpers
// =============================================================================

/**
 * Returns mock dashboard layout for specified persona with optional user profile overrides.
 */
export function getMockDashboardLayout(
  persona: DashboardPersona = "requestor",
  userOverride?: { name?: string; department?: string }
): DashboardLayout {
  const base = DASHBOARD_PERSONA_LAYOUTS[persona] ?? DASHBOARD_PERSONA_LAYOUTS.requestor;
  const layout = JSON.parse(JSON.stringify(base)) as DashboardLayout;

  if (userOverride?.name) {
    layout.greeting.name = userOverride.name;
  }
  if (userOverride?.department) {
    layout.scope.label = userOverride.department;
  }

  return layout;
}

/**
 * Returns mock widget data for specified widgetId with optional period/window overrides.
 */
export function getMockWidgetData<K extends WidgetId>(
  widgetId: K,
  query?: { period?: string; window?: string }
): WidgetResponse<WidgetDataMap[K]> {
  const fixture = DASHBOARD_WIDGET_FIXTURES[widgetId];
  if (!fixture) {
    throw new Error(`Widget fixture for '${widgetId}' does not exist.`);
  }

  // Clone to avoid accidental mutations
  const response = JSON.parse(JSON.stringify(fixture)) as WidgetResponse<WidgetDataMap[K]>;

  if (query?.period) {
    response.period = query.period;
  }

  return response;
}
