# Clarification Response — API Contract (v1)

> **CRITICAL ARCHITECTURAL INVARIANT — MONETARY VALUES:**  
> **ALL MONETARY VALUES ARE INTEGERS IN MINOR UNITS (FILS). NEVER FLOATS, NEVER FORMATTED STRINGS.**  
> 1 AED = 100 fils (e.g., AED 240,000.00 is stored and transported as `24000000`).  
> All mathematical comparisons, delta computations, and ledger verifications are computed strictly as integer arithmetic. Rounding or floating-point conversions must never occur anywhere in the backend transport, storage, or BFF proxy layers.

---

## 1. Overview & System Context

This document defines the formal backend API contract for **Clarification Response workflows** (`/app/requests/{id}/clarifications/{clarificationId}`) within the Dubai Integrated Economic Zones (DIEZ) Outsource Management System (OMS).

When HR or Governance reviewers require additional context or modifications before approving a requisition, they raise a clarification. Depending on the clarification type, the response either resolves directly with HR or triggers re-approval across the organizational chain.

---

## 2. Clarification Types & Workflow Invariants

| Type Code | Business Type | Workflow Consequence | Re-approval Required | Client Panels Required |
| :--- | :--- | :--- | :--- | :--- |
| `MORE_INFO` | **More Information** | Response delivered directly to HR, Line Manager, and HOD for information. | **No** (Cycle continues without resetting approvals) | Message & Attachments only (Diff, Route & Budget panels **omitted**) |
| `INFO_WITH_APPROVAL` | **Information with Approval** | Requisition details altered. Re-runs Line Manager → Section Head → HOD approval before returning to HR. | **Yes** | Everything (Message, Checklist, Inline Editors, Live Diff, Stepper, Budget) |
| `AMEND` | **Amend Request** | Formal HR-requested amendment. Full governance approval and budget re-verification cycle. | **Yes** | Everything (Message, Checklist, Inline Editors, Live Diff, Stepper, Budget) |

---

## 3. Server Requirements (Non-Negotiable Invariants)

The backend MUST implement the following six core server behaviours:

1. **Diff, route, and budget are all computed server-side.**  
   *Rationale:* The client is a presentation layer; it renders server-calculated structures and never computes ledger totals, approval step counts, or diff trees. Client-side financial or workflow calculations inevitably diverge from server state.

2. **Re-validate on submit.**  
   *Rationale:* Figures returned by the preview endpoint are a point-in-time preview. Between page load/preview and final submission, concurrent ledger movements (e.g., another department committing funds on the same budget line) may have depleted available funds. The server MUST re-execute the budget verification atomically inside the transaction. If funds are no longer sufficient, submission MUST fail with `CLARIFICATION_BUDGET_CHANGED` and return updated numbers.

3. **Idempotency key mandatory on submit.**  
   *Rationale:* Network dropouts, user double-clicks, or automated retries MUST NOT trigger multiple clarification response events or duplicate approval records. A client-generated UUID `idempotencyKey` is mandatory for `POST .../submit`.

4. **Only the assigned requester may respond.**  
   *Rationale:* Out-of-scope callers or users without explicit assignment to the requisition draft receive read-only mode (`canRespond: false`, populated with a human-readable `readOnlyReason`).

5. **Malware and antivirus clearance mandatory.**  
   *Rationale:* In compliance with DIEZ Cybersecurity Standards, all uploaded attachments undergo asynchronous server-side antivirus scanning. Submission attempts containing attachments with `PENDING` or `FAILED` scan states MUST be rejected with `ATTACHMENT_SCAN_PENDING` or `ATTACHMENT_SCAN_FAILED`.

6. **Deadline and auto-closure governance.**  
   *Rationale:* Requests reaching their 30-day clarification deadline without response are subject to automated closure and fund reservation release. If a submission arrives after expiration, the backend authoritatively determines whether to allow execution or reject with `CLARIFICATION_CLOSED`.

---

## 4. Endpoints Specification

### 4.1 Get Clarification Detail

```http
GET /api/v1/requests/{requestId}/clarifications/{clarificationId}
```

Retrieves full clarification context, including HR's message, structured asks checklist, editable field schema, prior cycle thread, deadline severity, and draft state.

#### Response (`200 OK`)

```jsonc
{
  "clarificationId": "clar-2026-0089",
  "requestId": "OMS-2026-0139",
  "requestTitle": "Data Governance Specialist",
  "type": "INFO_WITH_APPROVAL", // "MORE_INFO" | "INFO_WITH_APPROVAL" | "AMEND"
  "status": "AWAITING_RESPONSE", // "AWAITING_RESPONSE" | "SUBMITTED" | "CLOSED"
  "canRespond": true,
  "readOnlyReason": null,

  "raisedBy": {
    "userId": "usr-hr-042",
    "name": "Aisha Al Nuaimi",
    "role": "HR Specialist",
    "avatarUrl": "/avatars/aisha.jpg"
  },
  "raisedAt": "2026-08-05T11:20:00Z",
  "message": "Please clarify the data-governance deliverables, update the engagement end date to match the Q3 project milestone, and attach the approved project plan.",
  "attachments": [
    {
      "id": "att-001",
      "name": "Original_Request_Details.pdf",
      "sizeBytes": 2457600,
      "url": "https://storage.diez.ae/requests/att-001.pdf",
      "scanStatus": "VERIFIED"
    }
  ],

  // Structured discrete asks checklist
  "asks": [
    {
      "id": "ask-1",
      "text": "Clarify the data-governance deliverables",
      "fieldKey": null,
      "addressed": true
    },
    {
      "id": "ask-2",
      "text": "Update the engagement end date",
      "fieldKey": "engagementEndDate",
      "addressed": true
    },
    {
      "id": "ask-3",
      "text": "Attach the approved project plan",
      "fieldKey": null,
      "addressed": false
    }
  ],

  // Inline editable fields flagged by HR
  "editableFields": [
    {
      "key": "engagementEndDate",
      "label": "Engagement end date",
      "type": "DATE",
      "currentValue": "2027-06-30",
      "proposedValue": "2027-08-31",
      "financialImpact": false,
      "helpText": "Aligned with Data Governance Phase 2 milestones"
    },
    {
      "key": "durationMonths",
      "label": "Duration (Months)",
      "type": "NUMBER",
      "unit": "months",
      "currentValue": 10,
      "proposedValue": 12,
      "financialImpact": false,
      "helpText": null
    },
    {
      "key": "justification",
      "label": "Business justification",
      "type": "TEXT",
      "currentValue": "Initial data governance scope.",
      "proposedValue": "Expanded scope covering regulatory compliance and metadata catalog implementation.",
      "financialImpact": false,
      "helpText": null
    },
    {
      "key": "budgetAmount",
      "label": "Budget amount",
      "type": "MONEY",
      "currentValue": 24000000, // AED 240,000.00 (in fils)
      "proposedValue": 24000000, // AED 240,000.00 (in fils)
      "financialImpact": true,
      "helpText": "Increasing this starts a budget amendment"
    }
  ],

  // Complete conversational history across clarification cycles
  "thread": [
    {
      "id": "th-01",
      "actor": {
        "userId": "usr-req-101",
        "name": "Omar Tariq",
        "role": "Requestor"
      },
      "action": "SUBMITTED",
      "message": "Initial requisition submitted for Data Governance Specialist.",
      "attachments": [],
      "at": "2026-08-01T09:00:00Z"
    },
    {
      "id": "th-02",
      "actor": {
        "userId": "usr-hr-042",
        "name": "Aisha Al Nuaimi",
        "role": "HR Specialist"
      },
      "action": "CLARIFICATION_REQUESTED",
      "message": "Please provide project deliverable breakdown.",
      "attachments": [],
      "at": "2026-08-03T10:15:00Z"
    },
    {
      "id": "th-03",
      "actor": {
        "userId": "usr-req-101",
        "name": "Omar Tariq",
        "role": "Requestor"
      },
      "action": "RESPONSE_SUBMITTED",
      "message": "Added deliverable details in scope document.",
      "attachments": [],
      "at": "2026-08-04T14:30:00Z"
    }
  ],
  "cycleNumber": 2,

  // Deadline calculation
  "deadline": {
    "closesAt": "2026-09-30T00:00:00Z",
    "daysRemaining": 28,
    "severity": "NORMAL" // "NORMAL" | "WARNING" | "CRITICAL" | "OVERDUE"
  },

  // Autosaved or manually saved draft
  "draft": {
    "message": "I have updated the engagement duration and deliverables as requested.",
    "fieldValues": {
      "engagementEndDate": "2027-08-31",
      "durationMonths": 12,
      "justification": "Expanded scope covering regulatory compliance and metadata catalog implementation.",
      "budgetAmount": 24000000
    },
    "attachments": [],
    "savedAt": "2026-08-06T12:04:00Z"
  },

  // Governance and workflow consequence
  "consequence": {
    "requiresReapproval": true,
    "approvers": [
      { "userId": "usr-lm-001", "name": "Omar Al Hashmi", "stage": "LINE_MANAGER" },
      { "userId": "usr-sh-002", "name": "Fatima Al Marri", "stage": "SECTION_HEAD" },
      { "userId": "usr-hod-003", "name": "Khalid Al Suwaidi", "stage": "HOD" }
    ],
    "summary": "Because you are changing approved details, this returns to Omar Al Hashmi, Fatima Al Marri and Khalid Al Suwaidi before it reaches HR."
  }
}
```

---

### 4.2 Preview Proposed Changes

```http
POST /api/v1/requests/{requestId}/clarifications/{clarificationId}/preview
```

Computes the live diff, dynamic approval route stepper, budget ledger verification, and ask checklist state based on the current field values in the client editor. Debounced 500ms on the client.

#### Request Body

```jsonc
{
  "fieldValues": {
    "engagementEndDate": "2027-08-31",
    "durationMonths": 12,
    "justification": "Expanded scope covering regulatory compliance and metadata catalog implementation.",
    "budgetAmount": 24000000 // Integer in minor units (fils)
  }
}
```

#### Response (`200 OK`)

```jsonc
{
  "type": "INFO_WITH_APPROVAL",
  "diff": [
    {
      "fieldKey": "engagementEndDate",
      "label": "Engagement end date",
      "before": "30 Jun 2027",
      "after": "31 Aug 2027",
      "changed": true
    },
    {
      "fieldKey": "durationMonths",
      "label": "Duration",
      "before": "10 months",
      "after": "12 months",
      "changed": true
    },
    {
      "fieldKey": "justification",
      "label": "Business justification",
      "before": "Initial data governance scope.",
      "after": "Expanded scope covering regulatory compliance and metadata catalog implementation.",
      "changed": true
    },
    {
      "fieldKey": "budgetAmount",
      "label": "Budget amount",
      "before": "AED 240,000.00",
      "after": "AED 240,000.00",
      "changed": false
    }
  ],
  "route": [
    { "index": 1, "stage": "REQUESTOR", "label": "You", "state": "CURRENT" },
    { "index": 2, "stage": "LINE_MANAGER", "label": "Omar Al Hashmi", "state": "PENDING" },
    { "index": 3, "stage": "SECTION_HEAD", "label": "Fatima Al Marri", "state": "PENDING" },
    { "index": 4, "stage": "HOD", "label": "Khalid Al Suwaidi", "state": "PENDING" },
    { "index": 5, "stage": "HR_REVIEW", "label": "HR Specialist (Aisha)", "state": "PENDING" }
  ],
  "budget": {
    "applicable": true,
    "currentReservation": 24000000, // AED 240,000.00 (in fils)
    "changeAmount": 0,             // AED 0.00 (in fils)
    "lineAvailable": 78000000,      // AED 780,000.00 (in fils)
    "result": "WITHIN_BUDGET",      // "WITHIN_BUDGET" | "REQUIRES_AMENDMENT" | "INSUFFICIENT"
    "message": "Still within budget"
  },
  "asksAddressed": ["ask-1", "ask-2"]
}
```

---

### 4.3 Save Draft

```http
PUT /api/v1/requests/{requestId}/clarifications/{clarificationId}/draft
```

Autosaves (debounced 2s) or manually saves the user's drafted response message, attachment references, and modified field values without executing workflow transitions.

#### Request Body

```jsonc
{
  "message": "Drafted clarification response text...",
  "fieldValues": {
    "engagementEndDate": "2027-08-31",
    "durationMonths": 12,
    "budgetAmount": 24000000
  },
  "attachmentIds": ["att-001", "att-002"]
}
```

#### Response (`200 OK`)

```jsonc
{
  "success": true,
  "savedAt": "2026-08-06T12:04:00Z"
}
```

---

### 4.4 Submit Clarification Response

```http
POST /api/v1/requests/{requestId}/clarifications/{clarificationId}/submit
```

Finalizes and submits the clarification response. Atomically commits changes, creates audit logs, clears local draft, and transitions requisition stage.

#### Request Body

```jsonc
{
  "message": "Clarification response with deliverable breakdown and updated dates.",
  "fieldValues": {
    "engagementEndDate": "2027-08-31",
    "durationMonths": 12,
    "justification": "Expanded scope covering regulatory compliance and metadata catalog implementation.",
    "budgetAmount": 24000000
  },
  "attachmentIds": ["att-001", "att-002"],
  "idempotencyKey": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d" // Mandatory UUID
}
```

#### Response (`200 OK`)

```jsonc
{
  "success": true,
  "message": "Clarification response submitted successfully.",
  "requestId": "OMS-2026-0139",
  "nextStage": "LINE_MANAGER",
  "nextApproverName": "Omar Al Hashmi"
}
```

---

## 5. Error Protocol & Status Codes

All errors follow the DIEZ RFC 7807 Error Envelope:

```jsonc
{
  "statusCode": 409,
  "code": "CLARIFICATION_BUDGET_CHANGED",
  "message": "Budget availability shifted during review. Please review the updated figures.",
  "timestamp": "2026-08-06T12:05:00Z",
  "path": "/api/v1/requests/OMS-2026-0139/clarifications/clar-001/submit"
}
```

| HTTP Status | Error Code | Description / Client Handling |
| :--- | :--- | :--- |
| `400` | `MISSING_IDEMPOTENCY_KEY` | Submit request lacked an `idempotencyKey` UUID. |
| `400` | `INVALID_FIELD_PAYLOAD` | Proposed field value does not conform to field schema. |
| `403` | `NOT_ASSIGNED_REQUESTOR` | Caller is not the assigned requisition owner. Render read-only view. |
| `404` | `CLARIFICATION_NOT_FOUND` | Clarification ID or Request ID does not exist or out of scope. |
| `409` | `CLARIFICATION_BUDGET_CHANGED` | Atomic budget verification detected funds moved since preview. Display new figures; do not auto-resubmit. |
| `409` | `CLARIFICATION_ALREADY_SUBMITTED` | Clarification has already been submitted. Message: "This was already submitted on {date}." |
| `409` | `CLARIFICATION_CLOSED` | Clarification request expired or closed. Message: "This request was closed automatically. Contact HR to reopen it." |
| `422` | `ATTACHMENT_SCAN_PENDING` | One or more attachments are still undergoing antivirus scan. Message: "One attachment is still being checked. Try again in a moment." |
| `422` | `ATTACHMENT_SCAN_FAILED` | One or more attachments failed security scan. Name the file and block submission. |
