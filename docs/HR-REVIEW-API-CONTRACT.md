# HR Review — API Contract (v1)

> **CRITICAL ARCHITECTURAL INVARIANT — MONETARY VALUES:**
> **ALL MONETARY VALUES ARE INTEGERS IN MINOR UNITS (FILS). NEVER FLOATS, NEVER FORMATTED STRINGS.**
> 1 AED = 100 fils.

## Backend Dependencies & Permissions
The backend must enforce the following permissions for HR Review endpoints:
- `REQUISITION.HR_REVIEW`: Required for all queue, detail, and decision endpoints.
- `BUDGET.VIEW`: Required for viewing budget-specific details returned in the detail payload.

## Endpoints

### 1. Get Queue
```http
GET /api/v1/hr-review/queue?department=&status=&page=
```

**Response (`200 OK`)**
```jsonc
{
  "items": [{
    "requestId": "OMS-2026-0148",
    "position": "Senior Cybersecurity Analyst",
    "department": { "id": "...", "name": "Digital Security" },
    "ageDays": 1,
    "sla": { "targetDays": 3, "dueAt": "...", "overdueDays": 0, "breached": false },
    "flags": ["BUDGET_VERIFIED", "NEW"],
    "returnedFromClarification": false,
    "amount": 62000000
  }],
  "counts": { "total": 12, "overdue": 4, "returned": 1 },
  "slaTargetDays": 3
}
```

### 2. Get Detail
```http
GET /api/v1/hr-review/{requestId}
```

**Response (`200 OK`)**
```jsonc
{
  "request": {
    "id": "...",
    "position": "...",
    "badges": [],
    "resources": 2,
    "engagementMonths": 12,
    "expectedStart": "2026-09-01T00:00:00Z",
    "grade": "G8",
    "workLocation": "DIEZ Premises",
    "candidateRoute": "Unknown candidates",
    "justification": "..."
  },
  "canDecide": true,
  "readOnlyReason": null,

  "systemChecks": [
    {
      "code": "JOB_PROFILE_ATTACHED",
      "label": "Job profile attached",
      "state": "PASSED",
      "checkedAt": "2026-08-05T12:00:00Z",
      "blocksApproval": true,
      "failureReason": null
    }
  ],

  "hrConfirmations": [
    {
      "code": "OUTSOURCING_SUITABLE",
      "label": "Outsourcing is suitable for this role",
      "confirmed": false,
      "note": null,
      "context": null
    },
    {
      "code": "EMIRATISATION",
      "label": "Emiratisation position considered",
      "confirmed": false,
      "note": null,
      "context": { "current": 34.2, "target": 40.0, "unit": "PERCENT" }
    }
  ],

  "budget": {
    "approved": 62000000,
    "reserved": 62000000,
    "availableRemaining": 62000000,
    "fundingRoute": "BUDGETED",
    "verified": true,
    "lines": [{ "code": "CS-DIG-001", "name": "Cybersecurity", "amount": 40000000 }]
  },

  "approvalTrail": [{
    "stage": "REQUESTOR",
    "label": "Submitted",
    "user": { "id": "...", "name": "Mariam" },
    "at": "2026-08-04T09:18:00Z",
    "comment": null
  }],

  "clarificationContext": {
    "hadClarification": true,
    "askedAt": "...",
    "askedBy": { "id": "...", "name": "..." },
    "askMessage": "...",
    "respondedAt": "...",
    "respondedBy": { "id": "...", "name": "..." },
    "fieldsChanged": 3,
    "attachmentsAdded": 1,
    "diffLink": "..."
  },

  "availableDecisions": ["APPROVE_OMS", "SEND_BACK", "PERMANENT_HIRE", "REJECT"],
  "sendBackModes": ["MORE_INFO", "INFO_WITH_APPROVAL", "AMEND"],
  "reapprovalRoute": [{ "stage": "LINE_MANAGER", "user": { "name": "Omar Al Hashmi" } }]
}
```

### 3. Update Confirmations
```http
PUT /api/v1/hr-review/{requestId}/confirmations
```
**Request Body**
```jsonc
{
  "code": "OUTSOURCING_SUITABLE",
  "confirmed": true,
  "note": "Reviewed."
}
```

### 4. Submit Decision
```http
POST /api/v1/hr-review/{requestId}/decide
```
**Request Body**
```jsonc
{
  "decision": "APPROVE_OMS",
  "sendBackMode": "MORE_INFO", // Optional, only if decision is SEND_BACK
  "comment": "Proceeding with request.",
  "idempotencyKey": "uuid-v4"
}
```

---

## Send-Back Endpoints (Clarification Authoring)

> **PRIMARY ARCHITECTURAL PRINCIPLE:**
> **The `asks` and `editableFieldKeys` sent here BECOME the requester's `asks` and `editableFields`. This endpoint is what populates that page. If it sends nothing structured, the requester gets a paragraph of prose and no way to know whether she has addressed everything.**
>
> **MONETARY VALUES:**
> **All monetary values (e.g. `budget.reserved`, `currentValue`) remain strictly integers in minor units (fils). Never floats, never formatted strings. 1 AED = 100 fils.**

### 5. Get Send-Back Options
Fetch dynamic authoring options, selectable fields, suggested asks, return route, and reservation info for constructing a send-back request.

```http
GET /api/v1/hr-review/{requestId}/send-back/options
```

**Response (`200 OK`)**
```jsonc
{
  "requestId": "OMS-2026-0139",
  "requestTitle": "Data Governance Specialist",
  "requester": {
    "userId": "usr-req-001",
    "name": "Mariam Al Mansoori",
    "role": "Data Management Lead",
    "email": "mariam.almansoori@diez.ae"
  },
  "modes": [
    {
      "code": "MORE_INFO",
      "label": "Ask a question",
      "consequence": "She answers. Nothing needs re-approval and the request stays with you.",
      "requiresFieldSelection": false,
      "showsRoute": false,
      "showsBudget": false
    },
    {
      "code": "INFO_WITH_APPROVAL",
      "label": "Ask for changes that need re-approval",
      "consequence": "She updates the details, then it goes back through Omar Al Hashmi, Fatima Al Marri and Khalid Al Suwaidi before returning to you.",
      "requiresFieldSelection": true,
      "showsRoute": true,
      "showsBudget": true
    },
    {
      "code": "AMEND",
      "label": "Ask her to amend the request",
      "consequence": "She revises it. Full approval and budget checks repeat.",
      "requiresFieldSelection": true,
      "showsRoute": true,
      "showsBudget": true
    }
  ],
  "selectableFields": [
    {
      "key": "engagementEndDate",
      "label": "Engagement end date",
      "type": "DATE",
      "currentValue": "2027-06-30",
      "financialImpact": false,
      "warning": null,
      "selectable": true
    },
    {
      "key": "duration",
      "label": "Duration",
      "type": "NUMBER",
      "currentValue": 10,
      "financialImpact": false,
      "warning": null,
      "selectable": true
    },
    {
      "key": "justification",
      "label": "Business justification",
      "type": "TEXT",
      "currentValue": "Initial scope for corporate data governance setup across central administration departments.",
      "financialImpact": false,
      "warning": null,
      "selectable": true
    },
    {
      "key": "budgetAmount",
      "label": "Budget amount",
      "type": "MONEY",
      "currentValue": 24000000,
      "financialImpact": true,
      "warning": "Letting her change this could start a budget amendment.",
      "selectable": true
    },
    {
      "key": "resourceCount",
      "label": "Number of resources",
      "type": "NUMBER",
      "currentValue": 1,
      "financialImpact": false,
      "warning": null,
      "selectable": true
    }
  ],
  "suggestedAsks": [
    { "text": "Attach the job description", "fieldKey": null },
    { "text": "Clarify the business justification", "fieldKey": "justification" },
    { "text": "Update the engagement end date", "fieldKey": "engagementEndDate" },
    { "text": "Confirm the work location", "fieldKey": null }
  ],
  "reapprovalRoute": [
    { "stage": "LINE_MANAGER", "user": { "name": "Omar Al Hashmi" } },
    { "stage": "HOD", "user": { "name": "Fatima Al Marri" } },
    { "stage": "BUDGET_OFFICER", "user": { "name": "Khalid Al Suwaidi" } },
    { "stage": "HR_REVIEW", "user": { "name": "Aisha Al Nuaimi" } }
  ],
  "budget": {
    "reserved": 24000000,
    "note": "Changing the budget amount would start an amendment."
  },
  "deadline": {
    "daysAllowed": 30,
    "closesAt": "2026-09-30T00:00:00Z",
    "restartsOnSend": true
  },
  "thread": [
    {
      "id": "thread-cycle-1",
      "actor": {
        "userId": "usr-hr-042",
        "name": "Aisha Al Nuaimi",
        "role": "HR Specialist"
      },
      "action": "CLARIFICATION_REQUESTED",
      "message": "Please clarify the data-governance deliverables and verify end date.",
      "attachments": [],
      "at": "2026-08-01T10:00:00Z"
    }
  ],
  "cycleNumber": 2,
  "draft": null
}
```

### 6. Save Send-Back Draft
Quietly autosaves or manually stores HR's in-progress send-back draft.

```http
PUT /api/v1/hr-review/{requestId}/send-back/draft
```

**Request Body**
```jsonc
{
  "mode": "INFO_WITH_APPROVAL",
  "message": "Please clarify the deliverables and update the engagement end date.",
  "asks": [
    { "text": "Clarify the deliverables", "fieldKey": "justification" },
    { "text": "Update the engagement end date", "fieldKey": "engagementEndDate" }
  ],
  "editableFieldKeys": ["engagementEndDate", "justification"],
  "attachmentIds": ["att-hr-01"]
}
```

**Response (`200 OK`)**
```jsonc
{
  "success": true,
  "savedAt": "2026-08-05T14:22:10Z"
}
```

### 7. Execute Send-Back
Final submission of the send-back. Transitions the request to clarification status, sets the deadline clock, registers asks, unlocks designated fields, and notifies the requester.

```http
POST /api/v1/hr-review/{requestId}/send-back
```

**Request Body**
```jsonc
{
  "mode": "INFO_WITH_APPROVAL",
  "message": "Please update the engagement end date to 31 Aug 2027 and clarify deliverables.",
  "asks": [
    { "text": "Clarify the deliverables", "fieldKey": "justification" },
    { "text": "Update the engagement end date", "fieldKey": "engagementEndDate" }
  ],
  "editableFieldKeys": ["engagementEndDate", "duration", "justification"],
  "attachmentIds": ["att-hr-01"],
  "idempotencyKey": "a8f6e2b1-98c4-4b52-9b2f-12d8a4e892c1"
}
```

**Response (`200 OK`)**
```jsonc
{
  "success": true,
  "message": "Request sent back to Mariam Al Mansoori.",
  "requestId": "OMS-2026-0139",
  "cycleNumber": 2,
  "nextStage": "REQUESTOR",
  "recipient": {
    "name": "Mariam Al Mansoori",
    "email": "mariam.almansoori@diez.ae"
  }
}
```

---

## Send-Back Server Requirements

1. **Structured Asks & Field Transfer (Crucial Invariant)**:
   - **`asks` and `editableFieldKeys` sent here BECOME the requester's `asks` and `editableFields`.** This endpoint is what populates that page.
   - *Rationale*: If HR sends nothing structured, the requester gets a paragraph of prose and has no way to know whether she has addressed everything. The checklist and inline field editors are directly hydrated from this payload.
2. **Field Lock Protection**:
   - A field key in `editableFieldKeys` must be `selectable: true`. Reject with `400 FIELD_NOT_SELECTABLE` otherwise.
   - *Rationale*: The client must not be able to grant edit rights to any field the server considers locked or non-modifiable at this stage of the review.
3. **Mandatory Message**:
   - Comment (`message`) is required for every mode (`MORE_INFO`, `INFO_WITH_APPROVAL`, `AMEND`). Reject with `400 COMMENT_REQUIRED` if empty or whitespace-only.
   - *Rationale*: HR must supply an authoritative narrative explaining why the request is being returned or what information is missing.
4. **Mandatory Idempotency**:
   - `idempotencyKey` is strictly mandatory on `POST /send-back`. Reject with `400 MISSING_IDEMPOTENCY_KEY` if missing.
   - *Rationale*: Network retries or rapid double-clicks must not create duplicate clarification cycles, increment the cycle count more than once, or trigger duplicate notification cascades.
5. **Mode Consistency (`MORE_INFO` Invariant)**:
   - `MORE_INFO` must not carry `editableFieldKeys`. Reject with `400 INVALID_MODE_PAYLOAD` if any editable field keys are provided.
   - *Rationale*: "Ask a question" is strictly an informational query; it does not permit altering request data or triggering re-approval.
6. **Malware & Virus Scan Clearance**:
   - Any attachment referenced in `attachmentIds` must have completed scanning with a `VERIFIED` status before send succeeds. Reject with `400 ATTACHMENT_SCAN_PENDING` if still scanning, or `400 ATTACHMENT_SCAN_FAILED` if malware is detected.
   - *Rationale*: Ensures malicious files cannot be sent to requesters or stored within official organizational audit trails.

---

## General Server Requirements
1. **Scope restrictions**: The queue returns only requests assigned to HR review within the caller's scope, not a filtered view of all requests.
2. **Re-validate budget at decision time**: Figures shown are a preview. If they change, throw `HR_REVIEW_BUDGET_CHANGED` returning current figures.
3. **Idempotency key mandatory** on decide.
4. **Comment required** on every decision, without exception.
5. **A failed system check with `blocksApproval` prevents approval** server-side, not only in the UI.
6. **Unconfirmed HR confirmations do not block** but are recorded in the audit entry.
7. **Permanent hire triggers the Oracle handoff**: Fail the decision if that handoff cannot be queued, rather than closing the request first.

