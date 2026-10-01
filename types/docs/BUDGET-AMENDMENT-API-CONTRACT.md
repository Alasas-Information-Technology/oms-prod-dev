# Candidate Budget Amendment — API Contract (v1)

> **CRITICAL ARCHITECTURAL INVARIANT 1 — SIGN CONVENTION (REQUIREMENT 1):**  
> **COST CHANGES ARE STRICTLY POSITIVE; REMAINING-BUDGET CHANGES ARE STRICTLY NEGATIVE.**  
> - **Cost Increase**: A candidate's salary moving from AED 310,000.00 to AED 330,000.00 represents an increase to cost, so its change figure is **`+20,000.00`** (`+2000000` fils).  
> - **Remaining Budget Decrease**: A budget line balance moving from AED 450,000.00 to AED 430,000.00 represents a decrease in remaining funds, so its change figure is **`−20,000.00`** (`-2000000` fils).  
> 
> *Rationale*: The reference implementation has the signs backwards on both rows of its revised-position table (showing `-20,000` for candidate cost increase and `+20,000` for line reduction). On a financial approval screen, a reversed sign gets an amendment rejected by anyone who checks the arithmetic. This convention is computed and enforced strictly server-side and applies identically across all preview and detail endpoints. It is never inferred or inverted per-row client-side.

> **CRITICAL ARCHITECTURAL INVARIANT 2 — MONETARY VALUES:**  
> **ALL MONETARY AMOUNTS ARE STORED AND TRANSPORTED AS INTEGERS IN MINOR UNITS (FILS: 1 AED = 100 FILS).**  
> Never floats, never pre-formatted currency strings. All additions, subtractions, and reconciliations are 64-bit integer operations. (Per `BUDGET-API-CONTRACT.md`).

---

## 1. Overview & Business Workflow

When an interview evaluation qualifies a candidate whose expected compensation exceeds the approved requisition budget (e.g. EV6 in `INTERVIEW-EVALUATION-UI.md`), the candidate enters the `QUALIFIED_PENDING_BUDGET` state.

To proceed with procurement and onboarding, the department must raise and submit a **Candidate Budget Amendment** at:
```
/app/requests/{requestId}/amendments/{amendmentId}
```

The amendment identifies how the shortfall will be covered, recalculates the revised position, confirms the approval chain (`ReapprovalRoute`), and submits for multi-stage approval.

---

## 2. Server Requirements & Behavioral Rules

### Requirement 1: Fixed and Tested Sign Convention
- **Cost Increases are POSITIVE (`+`)**: `change = revised - current > 0`.
- **Remaining Budget Decreases are NEGATIVE (`−`)**: `change = revised - current < 0`.
- Applied uniformly across the preview response `revisedPosition` and the final persistence layer.

### Requirement 2: All Figures Pre-Computed Server-Side
- Every monetary value, shortfall balance, percentage variance, and running total must originate from the server.
- The client performs **zero arithmetic** on financial fields (strictly verifiable via grep).

### Requirement 3: Atomic Re-Validation at Submit Time
- The preview response is an uncommitted snapshot. Between preview generation and final submission, other requisitions or amendments may draw down funds from the same line.
- The server re-executes full line availability and period open checks inside the submission database transaction. If available balance is insufficient at commit time, the transaction aborts with `AMENDMENT_INSUFFICIENT_FUNDS`.

### Requirement 4: Scoped and Filtered Budget Lines
- The server only returns budget lines within the department's authorized organizational scope (Domain 2/4).
- Out-of-scope line IDs return `404 Not Found` (preventing ID enumeration), never `403`.

### Requirement 5: Mandatory Idempotency Keys
- `POST …/submit` and `POST …/cancel` require an `X-Idempotency-Key` header (UUIDv4).
- Network retries or rapid double-clicks return the original result without re-executing ledger state changes.

### Requirement 6: Unbudgeted Route Disallows Allocations
- When `fundingRoute` is `"UNBUDGETED"`, the `allocations` array must be empty (`[]`).
- If any line allocation is supplied with `UNBUDGETED`, the server strictly rejects the request with HTTP `422 Unprocessable Entity` (`AMENDMENT_UNBUDGETED_ALLOCATIONS_FORBIDDEN`).

---

## 3. Endpoints Specification

### 3.1 Get Amendment Workspace

Retrieves complete amendment context, including approved vs. qualified costs, available scoped budget lines, reapproval hierarchy, deadline, and lineage.

```http
GET /api/v1/requests/{requestId}/amendments/{amendmentId}
```

#### Headers
| Header | Type | Description |
| :--- | :--- | :--- |
| `Authorization` | string | Bearer token (via HttpOnly `oms_access_token` cookie) |

#### Response (`200 OK`)

```jsonc
{
  "amendmentId": "amd-2026-0089",
  "requestId": "OMS-2026-0148",
  "candidateRef": "C-009",
  "position": "Senior Cybersecurity Analyst",
  "triggeredBy": {
    "event": "CANDIDATE_QUALIFIED",
    "at": "2026-08-12T11:46:00Z",
    "evaluationId": "eval-2026-0042"
  },

  "canAct": true,
  "readOnlyReason": null,

  "cost": {
    "approved": 31000000,
    "qualified": 33000000,
    "shortfall": 2000000,
    "variancePercent": 6.45,
    "status": "OVER_BUDGET"
  },

  "fundingRoutes": [
    {
      "code": "BUDGETED",
      "label": "Budgeted",
      "consequence": "Draw from your open budget lines.",
      "availableLines": [
        {
          "lineId": "line-cs-001",
          "code": "CS-DIG-001",
          "name": "Cybersecurity Services FY2026",
          "available": 45000000
        },
        {
          "lineId": "line-cs-002",
          "code": "CS-DIG-002",
          "name": "Digital Transformation FY2026",
          "available": 17000000
        }
      ]
    },
    {
      "code": "UNALLOCATED",
      "label": "Unallocated",
      "consequence": "Use funds not yet assigned to any line. Department may select eligible unallocated pools.",
      "availableLines": [
        {
          "lineId": "line-unalloc-001",
          "code": "UNALLOC-DIG-2026",
          "name": "Department Unallocated Pool FY2026",
          "available": 25000000
        }
      ]
    },
    {
      "code": "UNBUDGETED",
      "label": "Unbudgeted",
      "consequence": "HR reviews this first. If they approve, Finance selects or creates the funding line. Only then does this continue to procurement.",
      "availableLines": []
    }
  ],

  "reapprovalRoute": [
    {
      "stage": "LINE_MANAGER",
      "user": {
        "name": "Omar Al Hashmi",
        "userId": "usr-omar-01"
      },
      "role": "Line Manager",
      "rejectionConsequence": "Closes this candidate's path and releases reserved funds."
    },
    {
      "stage": "SECTION_HEAD",
      "user": {
        "name": "Fatima Al Zaabi",
        "userId": "usr-fatima-02"
      },
      "role": "Section Head",
      "rejectionConsequence": "Closes this candidate's path and releases reserved funds."
    },
    {
      "stage": "HOD",
      "user": {
        "name": "Khalid Al Suwaidi",
        "userId": "usr-khalid-03"
      },
      "role": "Department Head",
      "rejectionConsequence": "Closes this candidate's path and releases reserved funds."
    },
    {
      "stage": "HR",
      "user": {
        "name": "Maryam Al Nuaimi",
        "userId": "usr-maryam-04"
      },
      "role": "HR Review",
      "rejectionConsequence": "Closes this candidate's path and releases reserved funds."
    }
  ],

  "deadline": {
    "closesAt": "2026-09-05T23:59:59Z",
    "daysRemaining": 24,
    "severity": "NORMAL"
  },

  "cancelConsequence": "Reverts C-009 to Qualified, pending budget. No funds are moved."
}
```

---

### 3.2 Preview Amendment Position

Calculates the server-authoritative revised budget position, checks whether proposed allocations cover the shortfall, and validates sufficiency against open lines. Debounced at 500ms on the client.

```http
POST /api/v1/requests/{requestId}/amendments/{amendmentId}/preview
```

#### Request Payload

```jsonc
{
  "fundingRoute": "BUDGETED",
  "allocations": [
    {
      "lineId": "line-cs-001",
      "amount": 2000000
    }
  ]
}
```

#### Response (`200 OK`)

```jsonc
{
  "revisedPosition": [
    {
      "item": "Candidate allocation",
      "current": 31000000,
      "revised": 33000000,
      "change": 2000000 // Positive: increase to candidate cost
    },
    {
      "item": "Cybersecurity Services FY2026 balance",
      "current": 45000000,
      "revised": 43000000,
      "change": -2000000 // Negative: decrease in remaining budget
    }
  ],
  "balanced": true,
  "totalAllocated": 2000000,
  "shortfallRemaining": 0
}
```

*When allocations do not cover the shortfall:*
```jsonc
{
  "revisedPosition": [
    {
      "item": "Candidate allocation",
      "current": 31000000,
      "revised": 33000000,
      "change": 2000000
    },
    {
      "item": "Cybersecurity Services FY2026 balance",
      "current": 45000000,
      "revised": 44500000,
      "change": -500000
    }
  ],
  "balanced": false,
  "totalAllocated": 500000,
  "shortfallRemaining": 1500000
}
```

---

### 3.3 Save Amendment Draft

Autosaves the requester's progress without triggering ledger reservations or routing to approvers. Debounced at 2000ms on the client.

```http
PUT /api/v1/requests/{requestId}/amendments/{amendmentId}/draft
```

#### Request Payload

```jsonc
{
  "fundingRoute": "BUDGETED",
  "allocations": [
    {
      "lineId": "line-cs-001",
      "amount": 2000000
    }
  ],
  "justification": "Market rate for Senior Cybersecurity Analyst with 9+ years experience exceeds initial band by 6.45%. Candidate possesses rare SIEM expertise critical for immediate project delivery.",
  "attachmentIds": ["att-rate-comp-001"]
}
```

#### Response (`200 OK`)

```jsonc
{
  "success": true,
  "savedAt": "2026-08-12T14:22:00Z",
  "amendmentId": "amd-2026-0089"
}
```

---

### 3.4 Submit Amendment for Approval

Submits the finalized amendment into the formal approval workflow. Atomically verifies balance sufficiency, locks funds on the selected lines, and assigns the task to the first approver in the route.

```http
POST /api/v1/requests/{requestId}/amendments/{amendmentId}/submit
```

#### Headers
| Header | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `X-Idempotency-Key` | string (UUIDv4) | **Yes** | Client-generated key preventing duplicate submissions |

#### Request Payload

```jsonc
{
  "fundingRoute": "BUDGETED",
  "allocations": [
    {
      "lineId": "line-cs-001",
      "amount": 2000000
    }
  ],
  "justification": "Market rate for Senior Cybersecurity Analyst with 9+ years experience exceeds initial band by 6.45%. Candidate possesses rare SIEM expertise critical for immediate project delivery.",
  "attachmentIds": ["att-rate-comp-001"],
  "idempotencyKey": "e4b2d184-78fb-4d43-85dc-f661413a9681"
}
```

#### Response (`200 OK`)

```jsonc
{
  "success": true,
  "submittedAt": "2026-08-12T14:30:00Z",
  "amendmentId": "amd-2026-0089",
  "nextApprover": {
    "name": "Omar Al Hashmi",
    "stage": "LINE_MANAGER"
  },
  "message": "Amendment submitted. It now goes to Omar Al Hashmi for approval."
}
```

---

### 3.5 Cancel Amendment

Cancels the active amendment draft. Reverts the candidate to `QUALIFIED_PENDING_BUDGET` with no fund movements.

```http
POST /api/v1/requests/{requestId}/amendments/{amendmentId}/cancel
```

#### Headers
| Header | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `X-Idempotency-Key` | string (UUIDv4) | No | Optional idempotency protection |

#### Request Payload

```jsonc
{
  "reason": "Department decided to pursue alternative candidate within original budget."
}
```

#### Response (`200 OK`)

```jsonc
{
  "success": true,
  "cancelledAt": "2026-08-12T15:00:00Z",
  "candidateRef": "C-009",
  "candidateStatus": "QUALIFIED_PENDING_BUDGET",
  "message": "Amendment cancelled. C-009 is Qualified, pending budget."
}
```

---

## 4. Error Responses

All error responses adhere to standard OMS API envelopes:

```jsonc
{
  "success": false,
  "error": {
    "code": "AMENDMENT_INSUFFICIENT_FUNDS",
    "message": "The available budget on Cybersecurity Services FY2026 changed while you were editing. Available: AED 10,000.00, requested: AED 20,000.00.",
    "details": {
      "lineId": "line-cs-001",
      "available": 1000000,
      "requested": 2000000
    }
  }
}
```

| HTTP Status | Error Code | Meaning | User-Facing Action |
| :--- | :--- | :--- | :--- |
| `400 Bad Request` | `AMENDMENT_IDEMPOTENCY_MISSING` | Missing idempotency key on submit | Client generates new UUID and retries |
| `400 Bad Request` | `AMENDMENT_SHORTFALL_UNMET` | Submitting while balance is short | Shows deficit amount inline next to submit |
| `409 Conflict` | `AMENDMENT_INSUFFICIENT_FUNDS` | Line available balance depleted prior to commit | Displays updated availability; prompts re-allocation |
| `409 Conflict` | `AMENDMENT_LINE_CLOSED` | Line closed or period locked before submit | Prompts requester to select open budget lines |
| `409 Conflict` | `AMENDMENT_ALREADY_DECIDED` | Amendment already approved, rejected, or submitted | Names who decided and when; disables editing |
| `422 Unprocessable` | `AMENDMENT_JUSTIFICATION_REQUIRED`| Justification missing or under 40 characters | Focuses justification input with counter |
| `422 Unprocessable` | `AMENDMENT_UNBUDGETED_ALLOCATIONS_FORBIDDEN` | Allocations submitted on UNBUDGETED route | Server rejects allocation payload |
| `404 Not Found` | `AMENDMENT_NOT_FOUND` | Amendment or request not in caller's scope | Returns standard 404 boundary error |
