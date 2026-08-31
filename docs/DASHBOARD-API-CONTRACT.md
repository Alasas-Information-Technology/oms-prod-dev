# Role-Aware Dashboard — API Contract (v1)

> **CRITICAL ARCHITECTURAL INVARIANT — MONETARY VALUES:**  
> **ALL MONETARY VALUES ARE INTEGERS IN MINOR UNITS (fils). NEVER FLOATS, NEVER PRE-FORMATTED STRINGS.**  
> 1 AED = 100 fils (e.g., AED 1,200,000.00 is stored and transported as `120000000`, AED 285,000.00 is `28500000`).  
> All mathematical aggregations, ledger rollups, and variance calculations are computed strictly using integer arithmetic on the server. Rounding or floating-point conversions must never occur anywhere in the backend transport, storage, or BFF proxy layers.

---

## 1. Overview & System Context

This document defines the formal backend API contract for the **Role-Aware Enterprise Dashboard** (`/app` and `/app/dashboard`) within the Dubai Integrated Economic Zones (DIEZ) Outsource Management System (OMS).

The dashboard presents an intelligent, permission-tailored operational cockpit. It computes the visual hierarchy and data scope dynamically on the server based on the caller's verified permissions and organizational tenancy boundaries.

The backend is implemented in NestJS (`oms-backend`), while the Next.js presentation layer (`oms-prod-dev`) consumes these endpoints through the BFF proxy layer.

---

## 2. Server Architecture Requirements (Non-Negotiable)

The backend MUST implement the following five core requirements for all dashboard interactions:

### 2.1 Scope is Resolved Server-Side (No Scope Parameter Accepted)
- **Requirement**: Neither `GET /api/v1/dashboard/layout` nor `GET /api/v1/dashboard/widgets/{widgetId}` accepts a `scope` query parameter.
- **Rationale**: A client-supplied scope is an unauthorized data-leak vector. The server inspects the caller's validated session token, resolves their organizational assignment (`SELF`, `SECTION`, `DEPARTMENT`, `BUSINESS_UNIT`, `ORGANIZATION`, or `GLOBAL`), and authoritatively binds data queries to that boundary.

### 2.2 Layout is Computed from Permissions (Never Role Names)
- **Requirement**: The layout response delivers widget placements based purely on the caller's held permissions (e.g., `BUDGET.VIEW`, `REQUISITION.VIEW`, `WORKFORCE.VIEW`) and organizational scope depth. Role names (such as `HOD`, `HR`, `FINANCE`) are never returned in the layout contract and must never appear in gating logic.
- **Rationale**: Roles are administrative containers that change across tenants; granular permissions define actual capabilities and UI layout rules.

### 2.3 Every Figure Arrives Pre-Aggregated (Zero Client Arithmetic)
- **Requirement**: The client performs zero calculations — no sum totals, no averages, no percentage divisions, no period variances, and no currency conversions.
- **Rationale**: Client-side arithmetic inevitably diverges from the authoritative database ledger due to rounding or partial data sets. Pre-aggregation guarantees consistency and trust across all dashboards and reports.

### 2.4 Per-User 60-Second Cache with Freshness Timestamp
- **Requirement**: Dashboard responses are cached per-user for 60 seconds. Every response payload carries an ISO 8601 `updatedAt` timestamp.
- **Rationale**: Dashboards are accessed and refreshed repeatedly during daily operations. A 60-second cache prevents database exhaustion while preserving high operational fidelity. The `updatedAt` field allows widget shells to display clear freshness indicators (e.g., *"as of 08:30"*).

### 2.5 Widget Failures are Isolated from the Layout Call
- **Requirement**: Widget data queries execute independently and in parallel following layout resolution.
- **Rationale**: If a downstream service or integration (e.g., Oracle ERP sync or Saned connector) experiences latency or failure, only that specific widget enters an error state with an inline retry option. The overall dashboard shell and all other widgets render without delay.

---

## 3. Endpoints Specification

### 3.1 Dashboard Layout Endpoint

#### `GET /api/v1/dashboard/layout`

Computes the user's customized dashboard structure, greeting, organizational scope, active fiscal period, and ordered widget placements grouped into 4 bands (`A`, `B`, `C`, `D`).

- **Authentication**: Required (HttpOnly Bearer cookie `oms_access_token`)
- **Query Parameters**: None (Scope is strictly determined server-side)
- **Cache**: 60 seconds per user

#### Layout Response (`200 OK`)

```jsonc
{
  "greeting": {
    "name": "Mariam",
    "period": "MORNING"
  },
  "scope": {
    "level": "DEPARTMENT",
    "label": "Digital Security",
    "orgUnitId": "dept-dig-002"
  },
  "fiscalPeriod": {
    "code": "FY2026",
    "label": "FY 2026",
    "isOpen": true
  },
  "bands": [
    {
      "band": "A",
      "widgets": [
        { "id": "needs-my-action", "span": 3, "priority": 10 },
        { "id": "requests-in-approval", "span": 3, "priority": 20 },
        { "id": "auto-close-watch", "span": 3, "priority": 30 },
        { "id": "expiring-documents", "span": 3, "priority": 40 }
      ]
    },
    {
      "band": "B",
      "widgets": [
        { "id": "requests-by-lifecycle-stage", "span": 6, "priority": 10 },
        { "id": "budget-exposure", "span": 6, "priority": 20 }
      ]
    },
    {
      "band": "C",
      "widgets": [
        { "id": "items-requiring-attention", "span": 8, "priority": 10 },
        { "id": "upcoming-milestones", "span": 4, "priority": 20 },
        { "id": "recent-activity", "span": 4, "priority": 30 }
      ]
    },
    {
      "band": "D",
      "widgets": [
        { "id": "draft-expiry-watch", "span": 6, "priority": 10 }
      ]
    }
  ],
  "updatedAt": "2026-08-31T08:30:00.000Z"
}
```

#### Layout Field Descriptions

| Field | Type | Description |
| :--- | :--- | :--- |
| `greeting.name` | string | User's preferred first name. |
| `greeting.period` | string | Time-of-day indicator: `MORNING`, `AFTERNOON`, `EVENING`. |
| `scope.level` | string | Tenancy depth: `SELF`, `SECTION`, `DEPARTMENT`, `BUSINESS_UNIT`, `ORGANIZATION`, `GLOBAL`. |
| `scope.label` | string | Human-readable label for the resolved scope (e.g., `"Digital Security"`). |
| `scope.orgUnitId` | string (UUID) | Optional organization unit UUID. |
| `fiscalPeriod.code` | string | Active financial period code (e.g., `"FY2026"`). |
| `fiscalPeriod.label` | string | Display label (e.g., `"FY 2026"`). |
| `fiscalPeriod.isOpen` | boolean | `true` if current fiscal period is accepting budget requests. |
| `bands[].band` | string | Band identifier: `A` (Attention KPI strip), `B` (Position charts), `C` (Work tables & feeds), `D` (Role-specific governance). |
| `bands[].widgets[].id` | string | Unique widget identifier matching the widget catalogue. |
| `bands[].widgets[].span` | integer | Grid column span on a 12-column grid (`3`, `4`, `6`, `8`, or `12`). |
| `bands[].widgets[].priority`| integer | Sort order priority within the row band (ascending). |
| `updatedAt` | string (ISO 8601) | Timestamp of layout computation. |

---

### 3.2 Per-Widget Data Endpoint

#### `GET /api/v1/dashboard/widgets/{widgetId}`

Retrieves pre-aggregated data for a specific widget. Fetched in parallel by the frontend after layout resolution.

- **Authentication**: Required (HttpOnly Bearer cookie `oms_access_token`)
- **Path Parameters**:
  - `widgetId`: Target widget identifier (e.g., `budget-exposure`, `needs-my-action`).
- **Query Parameters**:
  - `period` (optional): Financial period filter (e.g., `FY2026`, `current`). Defaults to active fiscal period.
  - `window` (optional): Time window filter (e.g., `30d`, `90d`, `this_fy`). Defaults to widget standard (`90d`).
- **Scope Parameter**: **STRICTLY REJECTED**. Scope is determined server-side from session token.

#### Standard Response Envelope

```jsonc
{
  "widgetId": "budget-exposure",
  "scope": {
    "level": "DEPARTMENT",
    "label": "Digital Security",
    "orgUnitId": "dept-dig-002"
  },
  "period": "FY 2026",
  "updatedAt": "2026-08-31T08:30:00.000Z",
  "link": "/app/budget?department=dept-dig-002",
  "data": {
    /* Widget-specific typed payload */
  }
}
```

---

## 4. Widget Payload Specifications

### Band A — Attention Strip (KPI Tiles, default span 3)

#### 4.1 `needs-my-action`
Actionable task counter for current user.
- **Deep Link**: `/app/requests?tab=needs-my-action`
- **Data Shape**:
```jsonc
{
  "total": 4,
  "overdue": 2,
  "byType": {
    "APPROVE": 2,
    "REVISE": 1,
    "CLARIFY": 1
  }
}
```

#### 4.2 `requests-in-approval`
In-flight requisitions currently progressing through approval routes.
- **Deep Link**: `/app/requests?status=in-approval`
- **Data Shape**:
```jsonc
{
  "count": 6,
  // ALL MONETARY VALUES ARE INTEGERS IN MINOR UNITS (fils). Never floats. Never pre-formatted strings.
  "totalAmountFils": 342000000,
  "avgDaysInApproval": 4.2,
  "urgentCount": 1
}
```

#### 4.3 `onboarding-cases`
Active resource onboarding cases.
- **Deep Link**: `/app/workforce/onboarding`
- **Data Shape**:
```jsonc
{
  "activeCount": 3,
  "joiningThisWeek": 1,
  "pendingDocuments": 2,
  "completedThisMonth": 5
}
```

#### 4.4 `expiring-documents`
Resource compliance documents expiring within critical thresholds.
- **Deep Link**: `/app/workforce?filter=expiring-documents`
- **Data Shape**:
```jsonc
{
  "countWithin30Days": 4,
  "countWithin60Days": 9,
  "countWithin90Days": 15,
  "criticalCount": 2
}
```

#### 4.5 `auto-close-watch` 🆕
Highest-value tile tracking requisitions nearing the 30-day inactivity auto-close deadline.
- **Deep Link**: `/app/requests?filter=closing-soon`
- **Data Shape**:
```jsonc
{
  "items": [
    {
      "requestId": "OMS-2026-0139",
      "position": "Lead DevOps Engineer",
      "departmentName": "Digital Security",
      "closesAt": "2026-09-05",
      "daysRemaining": 5,
      // ALL MONETARY VALUES ARE INTEGERS IN MINOR UNITS (fils). Never floats. Never pre-formatted strings.
      "fundsAtRisk": 28500000
    },
    {
      "requestId": "OMS-2026-0141",
      "position": "Information Security Specialist",
      "departmentName": "Digital Security",
      "closesAt": "2026-09-07",
      "daysRemaining": 7,
      // ALL MONETARY VALUES ARE INTEGERS IN MINOR UNITS (fils). Never floats. Never pre-formatted strings.
      "fundsAtRisk": 41500000
    },
    {
      "requestId": "OMS-2026-0135",
      "position": "Enterprise Data Architect",
      "departmentName": "Corporate Technology",
      "closesAt": "2026-09-08",
      "daysRemaining": 8,
      // ALL MONETARY VALUES ARE INTEGERS IN MINOR UNITS (fils). Never floats. Never pre-formatted strings.
      "fundsAtRisk": 50000000
    }
  ],
  // ALL MONETARY VALUES ARE INTEGERS IN MINOR UNITS (fils). Never floats. Never pre-formatted strings.
  "totalFundsAtRisk": 120000000
}
```

#### 4.6 `open-exceptions` 🆕
System variances, SLA breaches, and reconciliation exceptions.
- **Deep Link**: `/app/requests?filter=exceptions`
- **Data Shape**:
```jsonc
{
  "totalExceptions": 3,
  "slaBreaches": 2,
  "budgetMismatches": 0,
  "reconciliationVariances": 1
}
```

#### 4.7 `candidates-awaiting-review`
Shortlisted candidate CVs awaiting interviewer review.
- **Deep Link**: `/app/candidates?filter=awaiting-review`
- **Data Shape**:
```jsonc
{
  "totalAwaiting": 5,
  "urgentReview": 2,
  "interviewsScheduledThisWeek": 3,
  "avgWaitDays": 3.1
}
```

#### 4.8 `vendor-submissions`
Rate-card and candidate proposals submitted by suppliers awaiting procurement review.
- **Deep Link**: `/app/vendors?filter=pending-submissions`
- **Data Shape**:
```jsonc
{
  "totalPending": 8,
  "submittedThisWeek": 4,
  "overdueResponses": 2,
  "activeVendors": 6
}
```

#### 4.9 `security-events`
Enterprise security operations audit summary (Global scope).
- **Deep Link**: `/app/administration/security-dashboard`
- **Data Shape**:
```jsonc
{
  "totalEvents24h": 14,
  "failedLogins": 11,
  "accountLockouts": 2,
  "suspiciousActivities": 1
}
```

---

### Band B — Position (Charts, default span 6)

#### 4.10 `requests-by-lifecycle-stage`
Stacked distribution of requisitions across workflow stages.
- **Deep Link**: `/app/requests`
- **Data Shape**:
```jsonc
{
  "stages": [
    {
      "stage": "DRAFT",
      "label": "Draft",
      "count": 2,
      // ALL MONETARY VALUES ARE INTEGERS IN MINOR UNITS (fils). Never floats. Never pre-formatted strings.
      "totalAmountFils": 74000000
    },
    {
      "stage": "IN_APPROVAL",
      "label": "In Approval",
      "count": 6,
      // ALL MONETARY VALUES ARE INTEGERS IN MINOR UNITS (fils). Never floats. Never pre-formatted strings.
      "totalAmountFils": 342000000
    },
    {
      "stage": "HR_REVIEW",
      "label": "HR Review",
      "count": 3,
      // ALL MONETARY VALUES ARE INTEGERS IN MINOR UNITS (fils). Never floats. Never pre-formatted strings.
      "totalAmountFils": 185000000
    },
    {
      "stage": "PROCUREMENT",
      "label": "Procurement",
      "count": 4,
      // ALL MONETARY VALUES ARE INTEGERS IN MINOR UNITS (fils). Never floats. Never pre-formatted strings.
      "totalAmountFils": 260000000
    },
    {
      "stage": "ONBOARDING",
      "label": "Onboarding",
      "count": 3,
      // ALL MONETARY VALUES ARE INTEGERS IN MINOR UNITS (fils). Never floats. Never pre-formatted strings.
      "totalAmountFils": 160000000
    }
  ],
  "totalRequests": 18,
  "filterPeriod": "90d"
}
```

#### 4.11 `budget-exposure`
4-state ledger position for the scoped entity. Reuses `FundStateBar` from Budget Control Center.
- **Deep Link**: `/app/budget`
- **Data Shape**:
```jsonc
{
  // ALL MONETARY VALUES ARE INTEGERS IN MINOR UNITS (fils). Never floats. Never pre-formatted strings.
  "totalFils": 1020000000,
  "availableFils": 566000000,
  "reservedFils": 184000000,
  "lockedFils": 174000000,
  "consumedFils": 96000000,
  "breakdown": {
    "availablePercent": 55.5,
    "reservedPercent": 18.0,
    "lockedPercent": 17.1,
    "consumedPercent": 9.4
  },
  "currency": "AED",
  "isReconciled": true,
  "fiscalPeriod": "FY 2026"
}
```

#### 4.12 `budget-allocation-by-department` 🆕
Departmental budget utilisation breakdown sorted by percentage descending.
- **Deep Link**: `/app/budget`
- **Data Shape**:
```jsonc
{
  "departments": [
    {
      "orgUnitId": "dept-dig-002",
      "name": "Digital Security",
      // ALL MONETARY VALUES ARE INTEGERS IN MINOR UNITS (fils). Never floats. Never pre-formatted strings.
      "allocated": 320000000,
      "consumed": 96000000,
      "reserved": 54000000,
      "utilisationPercent": 30.0
    },
    {
      "orgUnitId": "dept-corp-001",
      "name": "Corporate Technology",
      // ALL MONETARY VALUES ARE INTEGERS IN MINOR UNITS (fils). Never floats. Never pre-formatted strings.
      "allocated": 580000000,
      "consumed": 70000000,
      "reserved": 48000000,
      "utilisationPercent": 12.1
    },
    {
      "orgUnitId": "dept-eng-003",
      "name": "Engineering & Facilities",
      // ALL MONETARY VALUES ARE INTEGERS IN MINOR UNITS (fils). Never floats. Never pre-formatted strings.
      "allocated": 440000000,
      "consumed": 24000000,
      "reserved": 32000000,
      "utilisationPercent": 5.5
    },
    {
      "orgUnitId": "dept-hr-004",
      "name": "People & Operations",
      // ALL MONETARY VALUES ARE INTEGERS IN MINOR UNITS (fils). Never floats. Never pre-formatted strings.
      "allocated": 360000000,
      "consumed": 12000000,
      "reserved": 18000000,
      "utilisationPercent": 3.3
    },
    {
      "orgUnitId": "dept-fin-005",
      "name": "Finance & Strategy",
      // ALL MONETARY VALUES ARE INTEGERS IN MINOR UNITS (fils). Never floats. Never pre-formatted strings.
      "allocated": 780000000,
      "consumed": 8000000,
      "reserved": 14000000,
      "utilisationPercent": 1.0
    }
  ],
  "totals": {
    // ALL MONETARY VALUES ARE INTEGERS IN MINOR UNITS (fils). Never floats. Never pre-formatted strings.
    "allocated": 2480000000,
    "consumed": 210000000,
    "reserved": 166000000,
    "utilisationPercent": 8.5
  }
}
```

#### 4.13 `workforce-by-department` 🆕
Active contractor headcount per department with onshore/offshore distribution.
- **Deep Link**: `/app/workforce`
- **Data Shape**:
```jsonc
{
  "departments": [
    {
      "orgUnitId": "dept-dig-002",
      "name": "Digital Security",
      "active": 23,
      "onshore": 18,
      "offshore": 5,
      "onboarding": 3,
      "endingWithin90Days": 4
    },
    {
      "orgUnitId": "dept-corp-001",
      "name": "Corporate Technology",
      "active": 45,
      "onshore": 36,
      "offshore": 9,
      "onboarding": 5,
      "endingWithin90Days": 8
    },
    {
      "orgUnitId": "dept-eng-003",
      "name": "Engineering & Facilities",
      "active": 32,
      "onshore": 24,
      "offshore": 8,
      "onboarding": 2,
      "endingWithin90Days": 3
    },
    {
      "orgUnitId": "dept-hr-004",
      "name": "People & Operations",
      "active": 18,
      "onshore": 14,
      "offshore": 4,
      "onboarding": 1,
      "endingWithin90Days": 2
    },
    {
      "orgUnitId": "dept-fin-005",
      "name": "Finance & Strategy",
      "active": 24,
      "onshore": 18,
      "offshore": 6,
      "onboarding": 2,
      "endingWithin90Days": 3
    }
  ],
  "totals": {
    "active": 142,
    "onshore": 110,
    "offshore": 32,
    "onboarding": 13,
    "endingWithin90Days": 20
  }
}
```

#### 4.14 `budget-vs-actual-trend` 🆕
Monthly financial consumption against budgeted plan.
- **Deep Link**: `/app/budget`
- **Data Shape**:
```jsonc
{
  "months": [
    {
      "month": "Jan",
      // ALL MONETARY VALUES ARE INTEGERS IN MINOR UNITS (fils). Never floats. Never pre-formatted strings.
      "plannedFils": 206000000,
      "actualFils": 180000000,
      "varianceFils": -26000000,
      "isOverBudget": false
    },
    {
      "month": "Feb",
      // ALL MONETARY VALUES ARE INTEGERS IN MINOR UNITS (fils). Never floats. Never pre-formatted strings.
      "plannedFils": 206000000,
      "actualFils": 195000000,
      "varianceFils": -11000000,
      "isOverBudget": false
    },
    {
      "month": "Mar",
      // ALL MONETARY VALUES ARE INTEGERS IN MINOR UNITS (fils). Never floats. Never pre-formatted strings.
      "plannedFils": 206000000,
      "actualFils": 215000000,
      "varianceFils": 9000000,
      "isOverBudget": true
    },
    {
      "month": "Apr",
      // ALL MONETARY VALUES ARE INTEGERS IN MINOR UNITS (fils). Never floats. Never pre-formatted strings.
      "plannedFils": 206000000,
      "actualFils": 202000000,
      "varianceFils": -4000000,
      "isOverBudget": false
    },
    {
      "month": "May",
      // ALL MONETARY VALUES ARE INTEGERS IN MINOR UNITS (fils). Never floats. Never pre-formatted strings.
      "plannedFils": 206000000,
      "actualFils": 208000000,
      "varianceFils": 2000000,
      "isOverBudget": true
    },
    {
      "month": "Jun",
      // ALL MONETARY VALUES ARE INTEGERS IN MINOR UNITS (fils). Never floats. Never pre-formatted strings.
      "plannedFils": 206000000,
      "actualFils": 210000000,
      "varianceFils": 4000000,
      "isOverBudget": true
    },
    {
      "month": "Jul",
      // ALL MONETARY VALUES ARE INTEGERS IN MINOR UNITS (fils). Never floats. Never pre-formatted strings.
      "plannedFils": 206000000,
      "actualFils": 198000000,
      "varianceFils": -8000000,
      "isOverBudget": false
    },
    {
      "month": "Aug",
      // ALL MONETARY VALUES ARE INTEGERS IN MINOR UNITS (fils). Never floats. Never pre-formatted strings.
      "plannedFils": 206000000,
      "actualFils": 210000000,
      "varianceFils": 4000000,
      "isOverBudget": true
    }
  ],
  "totals": {
    // ALL MONETARY VALUES ARE INTEGERS IN MINOR UNITS (fils). Never floats. Never pre-formatted strings.
    "plannedFils": 2480000000,
    "actualFils": 1618000000,
    "varianceFils": -862000000
  }
}
```

#### 4.15 `time-in-stage` 🆕
Average days spent per lifecycle stage to identify process bottlenecks.
- **Deep Link**: `/app/requests`
- **Data Shape**:
```jsonc
{
  "stages": [
    { "stage": "DRAFT", "label": "Draft & Prep", "avgDays": 2.1, "targetDays": 3.0, "isSlowest": false },
    { "stage": "LINE_MANAGER", "label": "Line Manager Endorsement", "avgDays": 1.4, "targetDays": 2.0, "isSlowest": false },
    { "stage": "HOD", "label": "HOD Approval", "avgDays": 3.8, "targetDays": 2.0, "isSlowest": false },
    { "stage": "HR_REVIEW", "label": "HR Review & Validation", "avgDays": 5.2, "targetDays": 3.0, "isSlowest": true },
    { "stage": "PROCUREMENT", "label": "Procurement & Sourcing", "avgDays": 4.1, "targetDays": 4.0, "isSlowest": false }
  ],
  "overallAvgDays": 16.6,
  "slowestStage": "HR_REVIEW"
}
```

---

### Band C — Work Queue & Operational Feeds

#### 4.16 `items-requiring-attention` (span 8)
Main operational inbox table displaying up to 5 prioritized actionable tasks.
- **Deep Link**: `/app/requests?tab=needs-my-action`
- **Data Shape**:
```jsonc
{
  "items": [
    {
      "id": "act-001",
      "item": "Respond to HR clarification",
      "requestId": "req-0148",
      "requestCode": "OMS-2026-0148",
      "stage": "HR Review",
      "due": "Today",
      "dueDate": "2026-08-31",
      "isOverdue": true,
      "overdueDays": 1,
      "priority": "HIGH",
      "link": "/app/requests/OMS-2026-0148"
    },
    {
      "id": "act-002",
      "item": "Confirm candidate shortlist",
      "requestId": "req-0146",
      "requestCode": "OMS-2026-0146",
      "stage": "Candidate Review",
      "due": "07 Sep",
      "dueDate": "2026-09-07",
      "isOverdue": false,
      "priority": "MEDIUM",
      "link": "/app/candidates?request=OMS-2026-0146"
    },
    {
      "id": "act-003",
      "item": "Complete joining readiness",
      "requestId": "req-0139",
      "requestCode": "OMS-2026-0139",
      "stage": "Onboarding",
      "due": "12 Sep",
      "dueDate": "2026-09-12",
      "isOverdue": false,
      "priority": "LOW",
      "link": "/app/workforce/onboarding?request=OMS-2026-0139"
    }
  ],
  "totalItems": 3
}
```

#### 4.17 `contract-runway` (span 6) 🆕
Contract end countdown buckets and 90-day replacement window tracker.
- **Deep Link**: `/app/workforce?filter=ending-soon`
- **Data Shape**:
```jsonc
{
  "buckets": [
    { "range": "0-30", "count": 4, "label": "Ending within 30 days" },
    { "range": "31-90", "count": 11, "label": "31 to 90 days" },
    { "range": "91-180", "count": 26, "label": "3 to 6 months" },
    { "range": "180+", "count": 101, "label": "Over 6 months" }
  ],
  "byVendor": [
    { "vendorId": "ven-001", "name": "Adecco Middle East", "active": 42, "endingWithin90Days": 5 },
    { "vendorId": "ven-002", "name": "Hays Specialist Recruitment", "active": 34, "endingWithin90Days": 7 },
    { "vendorId": "ven-003", "name": "Michael Page International", "active": 38, "endingWithin90Days": 2 },
    { "vendorId": "ven-004", "name": "Robert Half UAE", "active": 28, "endingWithin90Days": 1 }
  ],
  "replacementWindowOpen": 11
}
```

#### 4.18 `request-exceptions` (span 6) 🆕
Detailed exception queue tracking stalled workflows and ledger variances.
- **Deep Link**: `/app/requests?filter=exceptions`
- **Data Shape**:
```jsonc
{
  "items": [
    {
      "id": "exc-001",
      "type": "RECONCILIATION_VARIANCE",
      "requestId": "req-0131",
      "requestCode": "OMS-2026-0131",
      "detail": "Oracle PR not found",
      "ageDays": 3,
      "owner": {
        "userId": "user-fa-001",
        "name": "Rashid Al Nuaimi"
      },
      "severity": "HIGH"
    },
    {
      "id": "exc-002",
      "type": "SLA_BREACH",
      "requestId": "req-0129",
      "requestCode": "OMS-2026-0129",
      "detail": "HOD review exceeded 5-day SLA",
      "ageDays": 6,
      "owner": {
        "userId": "user-hod-002",
        "name": "Dr. Tariq Al Humaidi"
      },
      "severity": "HIGH"
    },
    {
      "id": "exc-003",
      "type": "SLA_BREACH",
      "requestId": "req-0134",
      "requestCode": "OMS-2026-0134",
      "detail": "Vendor candidate submission overdue",
      "ageDays": 4,
      "owner": {
        "userId": "user-proc-004",
        "name": "Mona Al Marri"
      },
      "severity": "MEDIUM"
    }
  ],
  "countsByType": {
    "SLA_BREACH": 2,
    "RECONCILIATION_VARIANCE": 1
  }
}
```

#### 4.19 `upcoming-milestones` (span 4)
Chronological agenda of interviews, joinings, and document renewals.
- **Deep Link**: `/app/workforce`
- **Data Shape**:
```jsonc
{
  "milestones": [
    {
      "id": "ms-001",
      "type": "INTERVIEW",
      "label": "Interviews",
      "detail": "3 candidates shortlisted",
      "date": "2026-09-09",
      "formattedDate": "09 Sep",
      "link": "/app/candidates?tab=interviews"
    },
    {
      "id": "ms-002",
      "type": "JOINING",
      "label": "Joining",
      "detail": "Ahmed Rahman (DevOps Lead)",
      "date": "2026-09-12",
      "formattedDate": "12 Sep",
      "link": "/app/workforce/onboarding"
    },
    {
      "id": "ms-003",
      "type": "DOCUMENT_EXPIRY",
      "label": "Document Expiry",
      "detail": "4 resources within 30 days",
      "date": "2026-09-30",
      "formattedDate": "30 Sep",
      "link": "/app/workforce?filter=expiring-documents"
    },
    {
      "id": "ms-004",
      "type": "CONTRACT_END",
      "label": "Contract Renewal",
      "detail": "2 Senior Architects (Adecco)",
      "date": "2026-10-15",
      "formattedDate": "15 Oct",
      "link": "/app/workforce?filter=ending-soon"
    }
  ],
  "totalCount": 4
}
```

#### 4.20 `recent-activity` (span 4)
Scoped human-readable audit stream.
- **Deep Link**: `/app/reports`
- **Data Shape**:
```jsonc
{
  "activities": [
    {
      "id": "act-01",
      "actor": {
        "userId": "user-hod-002",
        "name": "Dr. Tariq Al Humaidi",
        "roleDisplayName": "Head of Department"
      },
      "action": "APPROVED",
      "description": "HOD approved OMS-2026-0141",
      "timestamp": "2026-08-31T06:30:00.000Z",
      "relativeTime": "2 hours ago",
      "subjectRef": "OMS-2026-0141",
      "link": "/app/requests/OMS-2026-0141"
    },
    {
      "id": "act-02",
      "actor": {
        "userId": "user-hr-003",
        "name": "Fatima Al Mansoori",
        "roleDisplayName": "HR Specialist"
      },
      "action": "SHORTLISTED",
      "description": "HR shortlisted 3 candidates for OMS-2026-0146",
      "timestamp": "2026-08-31T04:15:00.000Z",
      "relativeTime": "4 hours ago",
      "subjectRef": "OMS-2026-0146",
      "link": "/app/candidates?request=OMS-2026-0146"
    },
    {
      "id": "act-03",
      "actor": {
        "userId": "user-fa-001",
        "name": "Rashid Al Nuaimi",
        "roleDisplayName": "Finance Analyst"
      },
      "action": "RECONCILED",
      "description": "Finance reconciled Oracle ERP batch #ORCL-SYNC-0831",
      "timestamp": "2026-08-30T16:45:00.000Z",
      "relativeTime": "Yesterday",
      "subjectRef": "ORCL-SYNC-0831",
      "link": "/app/budget"
    },
    {
      "id": "act-04",
      "actor": {
        "userId": "user-req-001",
        "name": "Mariam Al Hashimi",
        "roleDisplayName": "Department Originator"
      },
      "action": "SUBMITTED",
      "description": "Mariam submitted requisition OMS-2026-0148",
      "timestamp": "2026-08-30T14:20:00.000Z",
      "relativeTime": "Yesterday",
      "subjectRef": "OMS-2026-0148",
      "link": "/app/requests/OMS-2026-0148"
    },
    {
      "id": "act-05",
      "actor": {
        "userId": "user-sys-009",
        "name": "System Scheduler",
        "roleDisplayName": "Automation Engine"
      },
      "action": "NOTIFICATION",
      "description": "Auto-close warnings dispatched for 3 expiring requisitions",
      "timestamp": "2026-08-30T10:00:00.000Z",
      "relativeTime": "Yesterday",
      "link": "/app/requests?filter=closing-soon"
    }
  ],
  "totalCount": 5
}
```

---

### Band D — Role-Specific Governance & Administration

#### 4.21 `emiratisation-quota` 🆕
HR quota compliance tracker against UAE statutory targets.
- **Deep Link**: `/app/workforce`
- **Data Shape**:
```jsonc
{
  "currentHeadcount": 142,
  "uaeNationalHeadcount": 20,
  "currentPercent": 14.1,
  "targetPercent": 15.0,
  "isCompliant": false,
  "byBusinessUnit": [
    {
      "businessUnitId": "bu-tech-001",
      "name": "Corporate Technology",
      "totalHeadcount": 68,
      "uaeNationalHeadcount": 10,
      "currentPercent": 14.7,
      "targetPercent": 15.0
    },
    {
      "businessUnitId": "bu-ops-002",
      "name": "Operations & Engineering",
      "totalHeadcount": 50,
      "uaeNationalHeadcount": 8,
      "currentPercent": 16.0,
      "targetPercent": 15.0
    },
    {
      "businessUnitId": "bu-fin-003",
      "name": "Finance & Administration",
      "totalHeadcount": 24,
      "uaeNationalHeadcount": 2,
      "currentPercent": 8.3,
      "targetPercent": 15.0
    }
  ]
}
```

#### 4.22 `budget-period-status`
Governance state and 3-level sign-off tracker for the active financial period.
- **Deep Link**: `/app/budget`
- **Data Shape**:
```jsonc
{
  "periodId": "a1b2c3d4-0001-4000-8000-000000000001",
  "periodCode": "FY2026",
  "periodName": "Financial Year 2026",
  "status": "OPEN",
  "approvalProgress": {
    "currentLevel": 3,
    "totalLevels": 3,
    "isComplete": true,
    "lastApprovedBy": "Dr. Hamad Al Mutawa (Finance HOD)",
    "lastApprovedAt": "2026-08-01T11:05:00.000Z"
  },
  "lastAmendedAt": "2026-08-01T11:05:00.000Z",
  "canAmend": true,
  "canClose": true,
  "canReopen": false
}
```

#### 4.23 `reconciliation-exceptions`
External ERP ledger sync exception counts and oldest age.
- **Deep Link**: `/app/budget`
- **Data Shape**:
```jsonc
{
  "totalExceptions": 1,
  "oldestAgeDays": 3,
  "bySystem": [
    {
      "system": "ORACLE",
      "label": "Oracle ERP Cloud",
      "exceptionCount": 1,
      "oldestAgeDays": 3,
      "lastCheckedAt": "2026-08-31T08:00:00.000Z"
    },
    {
      "system": "DOCUSIGN",
      "label": "DocuSign Envelope Service",
      "exceptionCount": 0,
      "oldestAgeDays": 0,
      "lastCheckedAt": "2026-08-31T08:15:00.000Z"
    },
    {
      "system": "SANED",
      "label": "Saned Vendor Portal",
      "exceptionCount": 0,
      "oldestAgeDays": 0,
      "lastCheckedAt": "2026-08-31T08:20:00.000Z"
    }
  ],
  "link": "/app/budget?tab=exceptions"
}
```

#### 4.24 `integration-health` 🆕
System uptime and sync health status across all external enterprise connections.
- **Deep Link**: `/app/administration/security-dashboard`
- **Data Shape**:
```jsonc
{
  "systems": [
    {
      "id": "sys-orcl",
      "name": "Oracle ERP Cloud (Financials & PO)",
      "code": "ORACLE",
      "status": "HEALTHY",
      "lastSyncAt": "2026-08-31T08:00:00.000Z",
      "failureCount24h": 0,
      "responseTimeMs": 142
    },
    {
      "id": "sys-docu",
      "name": "DocuSign Electronic Signature",
      "code": "DOCUSIGN",
      "status": "HEALTHY",
      "lastSyncAt": "2026-08-31T08:15:00.000Z",
      "failureCount24h": 0,
      "responseTimeMs": 310
    },
    {
      "id": "sys-saned",
      "name": "Saned Contractor Platform",
      "code": "SANED",
      "status": "HEALTHY",
      "lastSyncAt": "2026-08-31T08:20:00.000Z",
      "failureCount24h": 0,
      "responseTimeMs": 225
    },
    {
      "id": "sys-ad",
      "name": "Azure Active Directory / Okta SSO",
      "code": "ACTIVE_DIRECTORY",
      "status": "HEALTHY",
      "lastSyncAt": "2026-08-31T08:29:00.000Z",
      "failureCount24h": 0,
      "responseTimeMs": 88
    }
  ],
  "overallHealth": "HEALTHY"
}
```

#### 4.25 `interview-schedule`
Upcoming candidate interview calendar for the next 7 days.
- **Deep Link**: `/app/candidates`
- **Data Shape**:
```jsonc
{
  "interviews": [
    {
      "id": "int-001",
      "candidateName": "Zaid Al Nuaimi",
      "candidateId": "cand-001",
      "position": "Senior Cybersecurity Analyst",
      "requestId": "OMS-2026-0148",
      "scheduledAt": "2026-09-02T10:00:00.000Z",
      "formattedDate": "02 Sep",
      "formattedTime": "10:00 AM",
      "medium": "ONLINE",
      "locationOrLink": "Microsoft Teams",
      "status": "SCHEDULED"
    },
    {
      "id": "int-002",
      "candidateName": "Priya Sharma",
      "candidateId": "cand-002",
      "position": "Cloud DevOps Consultant",
      "requestId": "OMS-2026-0146",
      "scheduledAt": "2026-09-03T14:30:00.000Z",
      "formattedDate": "03 Sep",
      "formattedTime": "02:30 PM",
      "medium": "IN_PERSON",
      "locationOrLink": "DIEZ HQ, Tower B, Room 402",
      "status": "SCHEDULED"
    },
    {
      "id": "int-003",
      "candidateName": "Marcus Vance",
      "candidateId": "cand-003",
      "position": "Senior Infrastructure Architect",
      "requestId": "OMS-2026-0139",
      "scheduledAt": "2026-09-05T11:00:00.000Z",
      "formattedDate": "05 Sep",
      "formattedTime": "11:00 AM",
      "medium": "ONLINE",
      "locationOrLink": "Microsoft Teams",
      "status": "SCHEDULED"
    }
  ],
  "totalScheduled": 3
}
```

#### 4.26 `vendor-performance`
Supplier engagement SLAs, submission turnarounds, and acceptance rates.
- **Deep Link**: `/app/vendors`
- **Data Shape**:
```jsonc
{
  "vendors": [
    {
      "vendorId": "ven-001",
      "name": "Adecco Middle East",
      "submissionRatePercent": 94.5,
      "avgTimeToSubmitDays": 3.2,
      "acceptanceRatePercent": 78.0,
      "activePlacements": 42,
      "totalSubmissions": 54
    },
    {
      "vendorId": "ven-002",
      "name": "Hays Specialist Recruitment",
      "submissionRatePercent": 91.0,
      "avgTimeToSubmitDays": 4.1,
      "acceptanceRatePercent": 72.5,
      "activePlacements": 34,
      "totalSubmissions": 47
    },
    {
      "vendorId": "ven-003",
      "name": "Michael Page International",
      "submissionRatePercent": 88.5,
      "avgTimeToSubmitDays": 4.8,
      "acceptanceRatePercent": 69.0,
      "activePlacements": 38,
      "totalSubmissions": 55
    },
    {
      "vendorId": "ven-004",
      "name": "Robert Half UAE",
      "submissionRatePercent": 85.0,
      "avgTimeToSubmitDays": 5.2,
      "acceptanceRatePercent": 65.0,
      "activePlacements": 28,
      "totalSubmissions": 43
    }
  ],
  "period": "FY 2026"
}
```

#### 4.27 `draft-expiry-watch` 🆕
Requisition drafts approaching the 60-day auto-deletion purge window.
- **Deep Link**: `/app/requests?tab=drafts`
- **Data Shape**:
```jsonc
{
  "draftsExpiringCount": 2,
  "soonestDaysRemaining": 6,
  "soonestDeletionDate": "2026-09-06",
  "items": [
    {
      "requestId": "req-draft-001",
      "title": "ERP Security Compliance Auditor",
      "daysRemaining": 6,
      "expiresAt": "2026-09-06",
      // ALL MONETARY VALUES ARE INTEGERS IN MINOR UNITS (fils). Never floats. Never pre-formatted strings.
      "estimatedAmountFils": 42000000
    },
    {
      "requestId": "req-draft-002",
      "title": "Full Stack React Developer",
      "daysRemaining": 9,
      "expiresAt": "2026-09-09",
      // ALL MONETARY VALUES ARE INTEGERS IN MINOR UNITS (fils). Never floats. Never pre-formatted strings.
      "estimatedAmountFils": 32000000
    }
  ]
}
```

#### 4.28 `pending-hr-decisions`
Requisitions currently queued at the HR review desk categorized by action needed.
- **Deep Link**: `/app/requests?tab=hr-review`
- **Data Shape**:
```jsonc
{
  "totalPending": 7,
  "byClarificationType": {
    "newReview": 3,
    "responseToClarification": 2,
    "amendmentReview": 1,
    "salaryException": 1
  },
  "urgentCount": 2
}
```

---

## 5. RFC 7807 Error Protocol

All error responses return the standard DIEZ OMS RFC 7807 Error Envelope:

```jsonc
{
  "statusCode": 404,
  "code": "WIDGET_NOT_FOUND",
  "message": "Widget with ID 'unknown-widget' is not registered or unavailable.",
  "timestamp": "2026-08-31T08:30:00.000Z",
  "path": "/api/v1/dashboard/widgets/unknown-widget"
}
```

### Standard Error Codes

| HTTP Status | Error Code | Description |
| :--- | :--- | :--- |
| `400 Bad Request` | `INVALID_QUERY_PARAMS` | Unsupported query filters or invalid date format. |
| `401 Unauthorized` | `UNAUTHORIZED` | Expired or missing authentication token. |
| `403 Forbidden` | `FORBIDDEN` | Caller lacks required permissions to access this widget data. |
| `404 Not Found` | `WIDGET_NOT_FOUND` | Widget ID does not exist. |
| `500 Internal Server Error` | `DASHBOARD_AGGREGATION_FAILED` | Internal error during data aggregation. Other widgets remain isolated. |
| `504 Gateway Timeout` | `UPSTREAM_TIMEOUT` | External dependency (e.g., Oracle ERP) timed out. Widget enters isolated retry state. |
