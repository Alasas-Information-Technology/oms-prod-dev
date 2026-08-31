# Approval Workflow — API Contract (v1)

> **CRITICAL ARCHITECTURAL INVARIANT — MONETARY VALUES:**
> **ALL MONETARY VALUES ARE INTEGERS IN MINOR UNITS (FILS). NEVER FLOATS, NEVER FORMATTED STRINGS.**
> 1 AED = 100 fils (e.g., AED 620,000.00 is stored and transported as `62000000`).

---

## 1. Visibility & Permissions Model

The visibility and action model is governed strictly at the API layer. 
The endpoint `GET /api/v1/approvals` **returns ONLY the caller's own tasks**. It is not a filtered view of all pending approvals. The filtering happens entirely server-side, and there is no parameter to widen it.

### Required Permissions

| Right | Governed by | Rule |
| :--- | :--- | :--- |
| **See the request exists** | Org scope + `REQUISITION.VIEW` | Anyone in scope (HR, Finance, Department) can see it read-only. |
| **See the approval detail** | Org scope + permission | Budget figures visible only to those with `BUDGET.VIEW`. |
| **Act on the approval** | **Task assignment only** | Exactly one user (named) or one claimable role queue at a time. |

---

## 2. Server Behaviours (Non-Negotiable Requirements)

The backend MUST implement the following five server behaviours for all approval decisions:

1. **Re-validation at decision time.** The `impact` figures the approver saw on screen are a *preview*. Between page load and click, another process may have reserved or locked funds. The server MUST re-run the availability check inside the transaction. If it no longer holds, the transaction fails with `APPROVAL_BUDGET_CHANGED` and returns the new figures. This guarantees the atomic check the screen promises.
2. **Idempotency is mandatory.** A double-click, a UI retry, or a flaky connection MUST NOT approve a task twice. A unique `idempotencyKey` is required on every decision. Repeating a key returns the original result safely.
3. **Assignment re-check.** The server MUST verify the caller is still the active assignee at the exact moment of decision. Delegations expire, and roles get revoked; a cached UI state does not authorize a decision.
4. **Dual-identity audit.** When acting under delegation, the decision record MUST audit both identities — the actor (the delegate) and the principal (the original assignee).
5. **Comment required on send-back and reject.** A `comment` is optional on approval, but it is strictly REQUIRED when sending back or rejecting a request. Rejections also require a reason code.

---

## 3. Endpoints

### 3.1 My Approvals

```http
GET /api/v1/approvals?status=pending&type=&page=&pageSize=
```

Returns only tasks where the caller is the named assignee, a member of the assigned role queue, or an active delegate of either. Out-of-scope requests return 404, not 403.

**Response Shape:**
```jsonc
{
  "items": [{
    "approvalTaskId": "…",
    "type": "REQUISITION",
    "subjectId": "…",
    "subjectRef": "OMS-2026-0148",
    "title": "Senior Cybersecurity Analyst",
    "context": "Digital Security Department",
    "stage": { "code": "HOD", "label": "HOD Approval", "index": 4, "total": 6 },
    "assignment": { "mode": "NAMED", "assignedUserId": "…", "claimedBy": null },
    "actingFor": null,
    "amount": 62000000,
    "currency": "AED",
    "submittedAt": "2026-08-04T09:18:00Z",
    "assignedAt": "2026-08-05T10:06:00Z",
    "sla": { "dueAt": "2026-09-04T10:06:00Z", "daysRemaining": 22, "breached": false },
    "priority": "NORMAL"
  }],
  "counts": { "all": 6, "requisition": 4, "budget": 1, "other": 1, "breached": 0 }
}
```

### 3.2 Task Detail

```http
GET /api/v1/approvals/{taskId}
```

Returns everything the decision screen needs in one call. The `route` array is variable length and dynamically maps the required steps.

**Response Shape:**
```jsonc
{
  "task": { /* shape from 3.1 */ },
  "canAct": true,
  "actingFor": null,
  "readOnlyReason": null,
  "route": [
    { "index": 1, "code": "REQUESTOR",   "label": "Requestor",    "state": "COMPLETE", "user": {...}, "at": "2026-08-04T09:18:00Z" },
    { "index": 2, "code": "LINE_MANAGER","label": "Line Manager", "state": "COMPLETE", "user": {...}, "at": "2026-08-04T14:42:00Z" },
    { "index": 3, "code": "SECTION_HEAD","label": "Section Head", "state": "COMPLETE", "user": {...}, "at": "2026-08-05T10:06:00Z" },
    { "index": 4, "code": "HOD",         "label": "HOD",          "state": "CURRENT",  "user": {...} },
    { "index": 5, "code": "HR_REVIEW",   "label": "HR Review",    "state": "PENDING" },
    { "index": 6, "code": "PROCUREMENT", "label": "Procurement",  "state": "PENDING" }
  ],
  "subject": {
    "requestId": "OMS-2026-0148",
    "position": "Senior Cybersecurity Analyst",
    "department": { "id": "…", "name": "Digital Security" },
    "resources": 2,
    "engagementMonths": 12,
    "workLocation": "DIEZ_PREMISES",
    "expectedStart": "2026-09-01",
    "salaryGrade": "G8",
    "candidateRoute": "UNKNOWN",
    "justification": "…",
    "evidence": {
      "jobDescriptionAttached": true,
      "supportingDocumentCount": 3,
      "adHierarchyVerified": true
    },
    "attachments": [{ "id": "…", "name": "…", "sizeBytes": 0, "uploadedAt": "…" }]
  },
  "history": [
    { "user": {...}, "action": "SUBMITTED", "comment": "Request submitted for approval.", "at": "2026-08-04T09:18:00Z" },
    { "user": {...}, "action": "APPROVED", "stage": "LINE_MANAGER", "comment": "Justification and budget confirmed.", "at": "2026-08-04T14:42:00Z" }
  ],
  "impact": {
    "fundingRoute": "BUDGETED",
    "requested": 62000000,
    "availableBefore": 124000000,
    "reservedNow": 62000000,
    "remainingAfter": 62000000,
    "currency": "AED",
    "allocations": [
      { "budgetLineId": "…", "code": "CS-DIG-001", "name": "Cybersecurity Services FY2026", "amount": 40000000 },
      { "budgetLineId": "…", "code": "CS-DIG-002", "name": "Digital Transformation FY2026", "amount": 22000000 }
    ],
    "fundStateTransition": { "from": "RESERVED", "to": "LOCKED_ALLOCATED" },
    "periodOpen": true
  },
  "preflight": {
    "checks": [
      { "code": "BUDGET_AVAILABILITY",   "label": "Budget availability",   "state": "PASSED" },
      { "code": "APPROVAL_ROUTE",        "label": "Approval route",        "state": "VERIFIED" },
      { "code": "SEGREGATION_OF_DUTIES", "label": "Segregation of duties", "state": "PASSED" },
      { "code": "PERIOD_OPEN",           "label": "Budget period open",    "state": "PASSED" }
    ],
    "allPassed": true,
    "blockingMessage": null
  },
  "availableActions": ["APPROVE", "SEND_BACK", "REJECT"]
}
```

### 3.3 Decisions

```http
POST /api/v1/approvals/{taskId}/approve
POST /api/v1/approvals/{taskId}/send-back
POST /api/v1/approvals/{taskId}/reject
```

**Request Shape:**
```jsonc
{
  "comment": "…",                     // Optional on approve, REQUIRED on send-back and reject
  "sendBackToStage": "REQUESTOR",     // Required on send-back only
  "idempotencyKey": "uuid"            // REQUIRED on all endpoints
}
```

**Error Codes:**
- `400 Bad Request`: Missing `idempotencyKey`, or missing `comment` on reject/send-back.
- `403 Forbidden`: Caller is no longer the active assignee (`ASSIGNMENT_CHANGED`).
- `404 Not Found`: Task does not exist or caller has no scope visibility.
- `409 Conflict`: `APPROVAL_BUDGET_CHANGED` (budget re-validation failed).
