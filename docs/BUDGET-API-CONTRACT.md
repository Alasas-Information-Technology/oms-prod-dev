# Budget Control Center — API Contract (v1)

> **CRITICAL ARCHITECTURAL INVARIANT — MONETARY VALUES:**  
> **ALL MONETARY VALUES ARE INTEGERS IN MINOR UNITS (FILS). NEVER FLOATS, NEVER FORMATTED STRINGS.**  
> 1 AED = 100 fils (e.g., AED 24,800,000.00 is stored and transported as `2480000000`).  
> All mathematical sums, ledger transitions, and reconciliations are computed strictly as 64-bit integer arithmetic. Rounding or floating-point conversions must never occur anywhere in the backend transport, storage, or BFF proxy layers.

---

## 1. Overview & System Context

This document defines the formal backend API contract for the **Budget Control Center** (`/app/budget`) within the Dubai Integrated Economic Zones (DIEZ) Outsource Management System (OMS).

The Budget domain functions as an authoritative ledger and control center for organizational allocations, fund reservations, and three-level financial period governance. The backend is implemented in NestJS (`oms-backend`), while the Next.js presentation layer (`oms-prod-dev`) consumes these endpoints through the BFF proxy layer.

### 1.1 Backend Dependency — Required Permissions (Part 5)

Authorization is strictly permission-based. The following permissions must be seeded and assigned to corresponding operational roles in `oms-backend`:

| Permission Code | Name | Description | Gated UI / API Surface | Status |
| :--- | :--- | :--- | :--- | :--- |
| `BUDGET.VIEW` | View Budget | View budget lines, KPIs, fund movements, and governance status | All `GET /api/v1/budget/*` endpoints | Existing |
| `BUDGET.LOCK` | Lock Budget | Manually lock fund allocation on a budget line | Ledger lock mutations | Existing |
| `BUDGET.RELEASE` | Release Budget | Release reserved or locked allocations back to Available | Ledger release mutations | Existing |
| `BUDGET.UPLOAD` | **Upload Budget** | Upload annual/quarterly budget baseline spreadsheets | `POST /api/v1/budget/upload` | **New (Backend Dependency)** |
| `BUDGET.PERIOD.MANAGE` | **Manage Period** | Open, amend, close, and reopen financial periods (3-level approval) | `POST /api/v1/budget/periods/:id/actions` | **New (Backend Dependency)** |
| `BUDGET.AMEND` | **Amend Budget** | Raise formal budget line top-up or transfer amendments | `POST /api/v1/budget/requests/amendments` | **New (Backend Dependency)** |
| `BUDGET.RECONCILE` | **Reconcile Budget** | Investigate and resolve Oracle ERP reconciliation exceptions | `POST /api/v1/budget/reconciliations/resolve` | **New (Backend Dependency)** |
| `BUDGET.EXPORT` | **Export Budget** | Export audit ledger reports and financial summary CSV/PDFs | `GET /api/v1/budget/export` | **New (Backend Dependency)** |

---

## 2. Core Ledger Invariants & Mathematical Reconciliation

The budget ledger strictly maintains four discrete fund states per line:

$$\text{Available} \longrightarrow \text{Reserved} \longrightarrow \text{Locked \& Allocated} \longrightarrow \text{Consumed}$$

$$\text{Total Fils} = \text{Available Fils} + \text{Reserved Fils} + \text{Locked Fils} + \text{Consumed Fils}$$

- **Available**: Uncommitted funds ready for requisition allocation.
- **Reserved**: Funds earmarked when a requisition is submitted for approval.
- **Locked**: Funds committed following Department Head / HOD sign-off.
- **Consumed**: Funds permanently debited upon timesheet/milestone completion and invoice clearance.
- **Sum Integrity**: If the sum of the four states does not exactly equal `totalFils`, the API marks `isReconciled: false` and the frontend renders an audit warning banner.

---

## 3. Scope & Multi-Tenancy Enforcement

Endpoints automatically enforce user visibility boundaries resolved from the caller's JWT:
- **Global Scope (ORGANIZATION)**: Can query any Business Unit or Department.
- **Business Unit Scope**: Can query any Department within the assigned Business Unit.
- **Department Scope**: Restricted to the user's assigned Department. Org unit query params are forced to the user's department.
- **Out-of-Scope Requests**: Accessing an out-of-scope budget line directly by ID returns **`404 Not Found`** (preventing ID enumeration), never `403`.

---

## 4. Endpoints Specification

### 4.1 `GET /api/v1/budget/summary`

Retrieves the 5 headline KPI figures, fund state percentages, period comparative delta, and reconciliation metadata, filtered by organizational scope.

- **Required Permission**: `BUDGET.VIEW`
- **Rate Limit Tier**: Tier 2 (Standard Data)

#### Query Parameters

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `periodId` | string (UUID) | No | Target financial period ID. Defaults to current active period. |
| `orgUnitId` | string (UUID) | No | Filter by specific organization unit (Organization, BU, or Dept). |
| `businessUnitId` | string (UUID) | No | Filter by Business Unit. |
| `departmentId` | string (UUID) | No | Filter by Department. |

#### Response (`200 OK`)

```json
{
  "periodId": "a1b2c3d4-0001-4000-8000-000000000001",
  "periodCode": "FY2026",
  "periodName": "Financial Year 2026",
  "scopeLevel": "DEPARTMENT",
  "orgUnitId": "dept-dig-002",
  "orgUnitName": "Digital Transformation & Cybersecurity",
  "totalFils": 2480000000,
  "availableFils": 1020000000,
  "reservedFils": 540000000,
  "lockedFils": 710000000,
  "consumedFils": 210000000,
  "breakdown": {
    "availablePercent": 41.1,
    "reservedPercent": 21.8,
    "lockedPercent": 28.6,
    "consumedPercent": 8.5
  },
  "deltaAgainstPreviousPeriod": {
    "totalDeltaFils": 180000000,
    "totalDeltaPercent": 7.8,
    "availableDeltaFils": -50000000,
    "consumedDeltaFils": 80000000
  },
  "isReconciled": true,
  "lastOracleSyncAt": "2026-08-01T08:30:00.000Z",
  "currency": "AED"
}
```

#### Field Descriptions

| Field | Type | Description |
| :--- | :--- | :--- |
| `totalFils` | integer | Total allocated baseline budget in **minor units (fils)**. |
| `availableFils` | integer | Uncommitted funds in **minor units (fils)**. |
| `reservedFils` | integer | Pending approval requisition funds in **minor units (fils)**. |
| `lockedFils` | integer | Approved and committed funds in **minor units (fils)**. |
| `consumedFils` | integer | Disbursed and cleared funds in **minor units (fils)**. |
| `breakdown.*Percent` | number | Percentage of total rounded to 1 decimal place (e.g. `21.8`). |
| `deltaAgainstPreviousPeriod` | object | Delta comparison against preceding financial period in **minor units (fils)**. |
| `isReconciled` | boolean | `true` if $\text{Available} + \text{Reserved} + \text{Locked} + \text{Consumed} == \text{Total}$. |

#### Error Responses
- `400 Bad Request`: Invalid period UUID or malformed query filters.
- `401 Unauthorized`: Missing or invalid session token.
- `403 Forbidden`: User lacks `BUDGET.VIEW` permission.
- `404 Not Found`: Specified `periodId` does not exist.

---

### 4.2 `GET /api/v1/budget/lines`

Retrieves a paginated, searchable, and filtered list of budget lines.

- **Required Permission**: `BUDGET.VIEW`
- **Rate Limit Tier**: Tier 2

#### Query Parameters

| Parameter | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `periodId` | string (UUID) | No | Active | Filter by financial period. |
| `orgUnitId` | string (UUID) | No | User Scope | Organization unit filter. |
| `businessUnitId` | string (UUID) | No | — | Business unit filter. |
| `departmentId` | string (UUID) | No | — | Department filter. |
| `search` | string | No | — | Search query against `code` and `name` (debounced 500ms on client). |
| `status` | string | No | `ALL` | Status filter: `ACTIVE`, `FROZEN`, `DEPLETED`, `CLOSED`. |
| `page` | integer | No | `1` | Page number (1-indexed). |
| `limit` | integer | No | `10` | Items per page (max 100). |
| `sortBy` | string | No | `code` | Field to sort: `code`, `name`, `totalFils`, `availableFils`, `consumedFils`. |
| `sortOrder` | string | No | `asc` | Sort direction: `asc` or `desc`. |

#### Response (`200 OK`)

```json
{
  "items": [
    {
      "id": "line-cs-dig-001",
      "code": "CS-DIG-001",
      "name": "Cybersecurity Operations & Infrastructure",
      "periodId": "a1b2c3d4-0001-4000-8000-000000000001",
      "departmentId": "dept-dig-002",
      "departmentName": "Digital Transformation & Cybersecurity",
      "businessUnitName": "Corporate Technology",
      "totalFils": 680000000,
      "availableFils": 240000000,
      "reservedFils": 120000000,
      "lockedFils": 220000000,
      "consumedFils": 100000000,
      "status": "ACTIVE",
      "isReconciled": true,
      "lastReconciledAt": "2026-08-01T08:30:00.000Z",
      "activeRequisitionsCount": 4
    },
    {
      "id": "line-cs-dig-002",
      "code": "CS-DIG-002",
      "name": "Digital Transformation Systems & Engineering",
      "periodId": "a1b2c3d4-0001-4000-8000-000000000001",
      "departmentId": "dept-dig-002",
      "departmentName": "Digital Transformation & Cybersecurity",
      "businessUnitName": "Corporate Technology",
      "totalFils": 1120000000,
      "availableFils": 460000000,
      "reservedFils": 280000000,
      "lockedFils": 310000000,
      "consumedFils": 70000000,
      "status": "ACTIVE",
      "isReconciled": true,
      "lastReconciledAt": "2026-08-01T08:30:00.000Z",
      "activeRequisitionsCount": 7
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "totalItems": 24,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

#### Field Descriptions
- All `*Fils` amounts are exact **integers in minor units (fils)**.
- `isReconciled`: `true` if $\text{Available} + \text{Reserved} + \text{Locked} + \text{Consumed} == \text{Total}$. If `false`, the client displays a line warning icon.

---

### 4.3 `GET /api/v1/budget/lines/:id/movements`

Retrieves the sequential fund state movement events for a specific budget line. If `:id` is passed as `"department-recent"`, returns the most recent fund movements across the user's scoped department.

- **Required Permission**: `BUDGET.VIEW`
- **Rate Limit Tier**: Tier 2

#### Path & Query Parameters

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | string | Yes | Budget Line UUID or `"department-recent"`. |
| `limit` | integer | No | Max movement events to return (default 10). |

#### Response (`200 OK`)

```json
{
  "budgetLineId": "line-cs-dig-002",
  "budgetLineCode": "CS-DIG-002",
  "budgetLineName": "Digital Transformation Systems & Engineering",
  "isLineSpecific": true,
  "movements": [
    {
      "id": "mov-001",
      "stepNumber": 1,
      "stepType": "SUBMITTED_RESERVED",
      "label": "Requisition Submitted",
      "description": "Funds reserved upon requisition submission",
      "amountFils": 62000000,
      "fromState": "AVAILABLE",
      "toState": "RESERVED",
      "requestId": "req-0148",
      "requestCode": "OMS-2026-0148",
      "requisitionTitle": "Senior Cloud Infrastructure Architect",
      "actorName": "Fatima Al Mansoori",
      "actorRole": "Department Originator",
      "timestamp": "2026-08-04T09:15:00.000Z",
      "isCompleted": true
    },
    {
      "id": "mov-002",
      "stepNumber": 2,
      "stepType": "HOD_APPROVED_LOCKED",
      "label": "HOD Approved & Locked",
      "description": "Allocation locked upon departmental sign-off",
      "amountFils": 62000000,
      "fromState": "RESERVED",
      "toState": "LOCKED",
      "requestId": "req-0148",
      "requestCode": "OMS-2026-0148",
      "requisitionTitle": "Senior Cloud Infrastructure Architect",
      "actorName": "Dr. Tariq Al Humaidi",
      "actorRole": "Head of Department (HOD)",
      "timestamp": "2026-08-05T11:30:00.000Z",
      "isCompleted": true
    },
    {
      "id": "mov-003",
      "stepNumber": 3,
      "stepType": "WORK_COMPLETED_CONSUMED",
      "label": "Work Completion & Clearance",
      "description": "Permanent consumption on timesheet & invoice approval",
      "amountFils": 62000000,
      "fromState": "LOCKED",
      "toState": "CONSUMED",
      "requestId": "req-0148",
      "requestCode": "OMS-2026-0148",
      "requisitionTitle": "Senior Cloud Infrastructure Architect",
      "actorName": null,
      "actorRole": null,
      "timestamp": null,
      "isCompleted": false
    }
  ]
}
```

#### Field Descriptions
- `amountFils`: Exact transaction amount in **minor units (fils)**.
- `stepType`: `SUBMITTED_RESERVED`, `HOD_APPROVED_LOCKED`, `WORK_COMPLETED_CONSUMED`, `RELEASED`, `REJECTED_RELEASED`.
- `isCompleted`: `false` for pending milestones (rendered as "Not started" with muted styling).

---

### 4.4 `GET /api/v1/budget/periods/:id`

Retrieves the governance status and the mandatory 3-level approval history for a financial period.

- **Required Permission**: `BUDGET.VIEW`
- **Rate Limit Tier**: Tier 2

#### Path Parameters

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | string | Yes | Period UUID or period code (e.g. `"FY2026"` or `"active"`). |

#### Response (`200 OK`)

```json
{
  "id": "a1b2c3d4-0001-4000-8000-000000000001",
  "code": "FY 2026",
  "name": "Financial Year 2026",
  "startDate": "2026-01-01T00:00:00.000Z",
  "endDate": "2026-12-31T23:59:59.999Z",
  "status": "OPEN",
  "lastAmendedAt": "2026-08-01T11:05:00.000Z",
  "threeLevelApproval": {
    "isComplete": true,
    "currentLevel": 3,
    "totalLevels": 3,
    "steps": [
      {
        "level": 1,
        "role": "Finance Analyst",
        "roleDisplayName": "Finance Analyst Review",
        "approverName": "Rashid Al Nuaimi",
        "approverId": "user-fa-001",
        "approvedAt": "2026-08-01T09:10:00.000Z",
        "status": "APPROVED",
        "comments": "Baseline allocations validated against departmental submissions."
      },
      {
        "level": 2,
        "role": "Finance Manager",
        "roleDisplayName": "Finance Manager Endorsement",
        "approverName": "Muna Al Zarooni",
        "approverId": "user-fm-002",
        "approvedAt": "2026-08-01T10:25:00.000Z",
        "status": "APPROVED",
        "comments": "Endorsed with Q3 contingency reserves."
      },
      {
        "level": 3,
        "role": "Finance HOD",
        "roleDisplayName": "Finance HOD Executive Approval",
        "approverName": "Dr. Hamad Al Mutawa",
        "approverId": "user-fhod-003",
        "approvedAt": "2026-08-01T11:05:00.000Z",
        "status": "APPROVED",
        "comments": "Authorized for operational execution."
      }
    ]
  },
  "reopenGovernanceRule": "Reopening a closed period requires the full three-level approval process.",
  "canAmend": true,
  "canClose": true,
  "canReopen": false
}
```

---

### 4.5 `GET /api/v1/budget/requests`

Retrieves unbudgeted, top-up, amendment, and reconciliation exception requests.

- **Required Permission**: `BUDGET.VIEW`
- **Rate Limit Tier**: Tier 2

#### Query Parameters

| Parameter | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `periodId` | string (UUID) | No | Active | Filter by financial period. |
| `orgUnitId` | string (UUID) | No | User Scope | Organization unit filter. |
| `type` | string | No | `ALL` | `ALL`, `UNBUDGETED`, `TOP_UP`, `AMENDMENT`, `EXCEPTION`. |
| `status` | string | No | `ALL` | `ALL`, `APPROVED`, `AWAITING_APPROVAL`, `EXCEPTION`, `REJECTED`. |
| `page` | integer | No | `1` | Page number. |
| `limit` | integer | No | `10` | Page limit. |

#### Response (`200 OK`)

```json
{
  "summaryCounts": {
    "unbudgetedCount": 3,
    "topUpCount": 2,
    "amendmentsCount": 4,
    "exceptionsCount": 1
  },
  "items": [
    {
      "id": "req-0152",
      "requestCode": "OMS-2026-0152",
      "type": "UNBUDGETED",
      "typeLabel": "Unbudgeted Request",
      "description": "Emergency AI Security Compliance Audit Specialist",
      "amountFils": 18500000,
      "status": "APPROVED",
      "ownerName": "Khalfan Al Suwaidi",
      "departmentName": "Information Security",
      "requestedOn": "2026-08-03T14:20:00.000Z",
      "budgetLineCode": "CS-DIG-001"
    },
    {
      "id": "req-0146",
      "requestCode": "OMS-2026-0146",
      "type": "TOP_UP",
      "typeLabel": "Budget Top-Up",
      "description": "Extended contract for Cloud DevOps Consultant",
      "amountFils": 9200000,
      "status": "AWAITING_APPROVAL",
      "ownerName": "Sara Al Marzooqi",
      "departmentName": "Digital Transformation",
      "requestedOn": "2026-08-04T10:05:00.000Z",
      "budgetLineCode": "CS-DIG-002"
    },
    {
      "id": "req-0131",
      "requestCode": "OMS-2026-0131",
      "type": "EXCEPTION",
      "typeLabel": "Reconciliation Exception",
      "description": "Oracle ERP PO Variance on Rate Card reconciliation",
      "amountFils": 450000,
      "status": "EXCEPTION",
      "ownerName": "Finance Reconciliation Queue",
      "departmentName": "Digital Transformation",
      "requestedOn": "2026-08-05T08:12:00.000Z",
      "budgetLineCode": "CS-DIG-002"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "totalItems": 10,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPreviousPage": false
  }
}
```

#### Field Descriptions
- `summaryCounts.exceptionsCount`: If $> 0$, the frontend renders an amber alert indicator requiring human intervention.
- `amountFils`: Integer transaction value in **minor units (fils)**.

---

### 4.6 `GET /api/v1/budget/safeguards`

Retrieves the operational status of the 5 financial integrity safeguards, presented in clear business language (without internal engineering jargon per Part 2.2).

- **Required Permission**: `BUDGET.VIEW`
- **Rate Limit Tier**: Tier 2

#### Response (`200 OK`)

```json
{
  "safeguards": [
    {
      "id": "sg-double-spending",
      "label": "Double-spending prevented",
      "description": "Requisition locks funds immediately upon HOD approval",
      "status": "ACTIVE",
      "isHealthy": true
    },
    {
      "id": "sg-multiline-allocation",
      "label": "Funds can come from several budget lines",
      "description": "Cross-line split allocation permitted with individual line ledger tracking",
      "status": "ACTIVE",
      "isHealthy": true
    },
    {
      "id": "sg-period-validation",
      "label": "Only open periods accept requests",
      "description": "Closed financial periods strictly reject new fund reservations and amendments",
      "status": "ACTIVE",
      "isHealthy": true
    },
    {
      "id": "sg-auto-release",
      "label": "Unused funds return automatically",
      "description": "Rejected or cancelled requisitions restore reserved funds back to Available balance",
      "status": "ACTIVE",
      "isHealthy": true
    },
    {
      "id": "sg-oracle-sync",
      "label": "Last checked against Oracle",
      "description": "Automated system-of-record reconciliation with Oracle Financials Cloud",
      "status": "ACTIVE",
      "isHealthy": true,
      "lastReconciledAt": "2026-08-05T08:30:00.000Z",
      "syncBatchId": "ORCL-SYNC-20260805-01"
    }
  ]
}
```

---

## 5. Summary of Status Codes & Error Protocol

All error responses conform to the standard DIEZ OMS RFC 7807 Error Envelope:

```json
{
  "statusCode": 400,
  "code": "BUDGET_SUM_MISMATCH",
  "message": "Calculated ledger states do not equal total allocated budget line amount.",
  "timestamp": "2026-08-27T17:20:00.000Z",
  "path": "/api/v1/budget/summary"
}
```

| HTTP Status | Error Code | Description |
| :--- | :--- | :--- |
| `400` | `INVALID_PERIOD_ID` | Specified period ID is malformed or invalid. |
| `400` | `BUDGET_SUM_MISMATCH` | Internal line verification detected that states do not reconcile. |
| `401` | `UNAUTHORIZED` | Session expired or invalid authentication token. |
| `403` | `FORBIDDEN` | Missing required budget permission (e.g. `BUDGET.VIEW`). |
| `404` | `BUDGET_LINE_NOT_FOUND` | Line ID does not exist or is outside caller's authorized scope. |
| `404` | `PERIOD_NOT_FOUND` | Financial period not found. |
| `409` | `PERIOD_CLOSED` | Mutation attempted on a closed financial period. |
