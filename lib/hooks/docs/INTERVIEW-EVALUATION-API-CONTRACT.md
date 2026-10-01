# Interview Evaluation — API Contract (v1)

> 🚨 **CRITICAL ARCHITECTURAL INVARIANT 1 — MONETARY VALUES IN MINOR UNITS:**  
> **ALL MONETARY VALUES ARE INTEGERS IN MINOR UNITS. Never floats. Never pre-formatted strings.**  
> In the UAE, currency is AED (Dirhams) and the minor unit is fils (1 AED = 100 fils). For example, AED 310,000.00 is represented strictly as integer `31000000`, AED 298,000.00 as `29800000`, and an under-budget variance of -AED 12,000.00 as `-1200000`. Floating-point representations or pre-formatted display strings in API payloads introduce precision hazards and are strictly prohibited.

> 🚨 **CRITICAL ARCHITECTURAL INVARIANT 2 — COMPLIANCE-MANDATORY REJECTION REASON (PDPL):**  
> **A REJECTION WITHOUT A REASON CODE LEAVES THE CV IN AN UNDEFINED RETENTION STATE.**  
> RFP Step 5 explicitly defines three distinct rejection reasons, each mapping to a concrete data retention consequence under UAE Personal Data Protection Law (PDPL):
> 1. `NOT_SUITABLE_KEEP_CV`: The CV is stored centrally for future roles (retention: indefinitely/active talent pool, deletionDate: `null`).
> 2. `NOT_SUITABLE_DELETE_CV`: The CV will be permanently deleted after the HR-defined retention window (deletionDate: explicit date e.g. `2027-02-11`).
> 3. `DUPLICATE_CV`: Duplicate CV submission; deleted after the HR-defined retention window (deletionDate: explicit date e.g. `2027-02-11`).  
> Submitting `outcome: "REJECT"` without a valid `rejectionReasonCode` is a compliance violation and will be rejected with HTTP 422 (`EVALUATION_REJECTION_REASON_REQUIRED`).

> 🚨 **CRITICAL ARCHITECTURAL INVARIANT 3 — ANONYMISED EVALUATION BOUNDARY (BLIND REVIEW):**  
> **VENDOR IDENTITY IS NEVER SENT ON THIS ROUTE, INCLUDING IN ERROR MESSAGES.**  
> In accordance with the Blind Candidate Review mandate (`PROCESS-GAP-ANALYSIS.md` §2.4 and `CLAUDE.md`), interviewers evaluate candidates solely on merit without knowledge of vendor agency affiliations or raw commercial markups. Under no circumstances may vendor names, vendor IDs, vendor contact info, or agency metadata be returned in responses, headers, debug traces, or error payloads. The API payload explicitly sets `"vendorHidden": true`.

---

## Route & Authority

- **Frontend Route:** `/app/candidates/interviews/evaluate/{requestId}/{candidateRef}`
- **Backend Base Path:** `/api/v1/requests/{requestId}/interviews/{candidateRef}/evaluation`
- **Required Permission:** `INTERVIEW.EVALUATE` (held by designated interview panel members)
- **Evaluation Authority:**  
  - **Main Interviewer (`isMainInterviewer: true`):** Holds exclusive authority to submit the final hiring outcome (`QUALIFY` or `REJECT`) per RFP Step 1.
  - **Panel Contributors (`isMainInterviewer: false`):** May submit their individual criterion ratings and qualitative comments, but cannot submit an outcome. The outcome section is omitted for non-main evaluators.

---

## Endpoints

### 1. Get Interview Evaluation Workspace

Retrieves the complete evaluation workspace for a candidate, including interview confirmation status, criterion scorecard with weights and anchor descriptors, current ratings, qualitative feedback, panel contributors' status and disagreement alerts, candidate summary (anonymised), cost variance against approved budget, position fill progress, available rejection reasons with retention dates, deadline severity, and audit trail.

```http
GET /api/v1/requests/{requestId}/interviews/{candidateRef}/evaluation
```

#### Headers
```http
Authorization: Bearer <token>
Accept: application/json
```

#### Response (`200 OK`)
```jsonc
{
  "candidateRef": "C-014",
  "priority": "P1",
  "requestId": "OMS-2026-0148",
  "position": "Senior Cybersecurity Analyst",

  // 1. Interview Occurrence Status (RFP Step 6)
  "interview": {
    "occurred": true,
    "confirmedAt": "2026-08-12T07:45:00Z",
    "method": "ONLINE",
    "scheduledFor": "2026-08-12T07:00:00Z",
    "nonOccurrenceReason": null,
    "nonOccurrenceNotes": null
  },

  // 2. Evaluator Authority & State
  "canEvaluate": true,
  "isMainInterviewer": true,
  "readOnlyReason": null,

  // 3. Weighted Criteria & Scorecard
  "criteria": [
    {
      "code": "TECHNICAL_EXPERTISE",
      "label": "Technical expertise",
      "weightPercent": 25,
      "anchors": {
        "1": "Well below requirement",
        "2": "Below requirement",
        "3": "Meets requirement",
        "4": "Above requirement",
        "5": "Outstanding"
      },
      "rating": 5
    },
    {
      "code": "CYBERSECURITY_OPS",
      "label": "Cybersecurity operations",
      "weightPercent": 20,
      "anchors": {
        "1": "Well below requirement",
        "2": "Below requirement",
        "3": "Meets requirement",
        "4": "Above requirement",
        "5": "Outstanding"
      },
      "rating": 4
    },
    {
      "code": "PROBLEM_SOLVING",
      "label": "Problem solving & incident handling",
      "weightPercent": 15,
      "anchors": {
        "1": "Well below requirement",
        "2": "Below requirement",
        "3": "Meets requirement",
        "4": "Above requirement",
        "5": "Outstanding"
      },
      "rating": 4
    },
    {
      "code": "COMMUNICATION",
      "label": "Communication & stakeholder management",
      "weightPercent": 15,
      "anchors": {
        "1": "Well below requirement",
        "2": "Below requirement",
        "3": "Meets requirement",
        "4": "Above requirement",
        "5": "Outstanding"
      },
      "rating": 4
    },
    {
      "code": "INCIDENT_RESPONSE",
      "label": "Incident response under pressure",
      "weightPercent": 15,
      "anchors": {
        "1": "Well below requirement",
        "2": "Below requirement",
        "3": "Meets requirement",
        "4": "Above requirement",
        "5": "Outstanding"
      },
      "rating": 5
    },
    {
      "code": "DIEZ_FIT",
      "label": "DIEZ environment & culture fit",
      "weightPercent": 10,
      "anchors": {
        "1": "Well below requirement",
        "2": "Below requirement",
        "3": "Meets requirement",
        "4": "Above requirement",
        "5": "Outstanding"
      },
      "rating": 4
    }
  ],
  "overallScore": 86.7,
  "overallAnchor": "Above requirement",

  // 4. Qualitative Feedback & Suggested Tags
  "comments": "Strong technical foundation in SIEM and SOC operations. Demonstrated sound incident triage methodology.",
  "strengthTags": ["SIEM & SOC", "Incident response"],
  "developmentTags": ["DIEZ internal processes"],
  "suggestedTags": ["SIEM & SOC", "Threat hunting", "Regulatory knowledge", "Cloud Security", "Vulnerability Management"],

  // 5. Multi-Interviewer Panel Evaluation
  "panel": {
    "isPanel": true,
    "targetCount": 3,
    "completedCount": 2,
    "contributors": [
      {
        "userId": "usr-091",
        "name": "Noura Al Mazrouei",
        "role": "Main interviewer",
        "isYou": true,
        "status": "COMPLETE",
        "overallScore": 86.7,
        "criteria": [
          { "code": "TECHNICAL_EXPERTISE", "rating": 5 },
          { "code": "CYBERSECURITY_OPS", "rating": 4 },
          { "code": "PROBLEM_SOLVING", "rating": 4 },
          { "code": "COMMUNICATION", "rating": 4 },
          { "code": "INCIDENT_RESPONSE", "rating": 5 },
          { "code": "DIEZ_FIT", "rating": 4 }
        ]
      },
      {
        "userId": "usr-104",
        "name": "Yousef Al Falasi",
        "role": "Senior SOC Analyst",
        "isYou": false,
        "status": "COMPLETE",
        "overallScore": 83.3,
        "criteria": [
          { "code": "TECHNICAL_EXPERTISE", "rating": 5 },
          { "code": "CYBERSECURITY_OPS", "rating": 4 },
          { "code": "PROBLEM_SOLVING", "rating": 4 },
          { "code": "COMMUNICATION", "rating": 3 },
          { "code": "INCIDENT_RESPONSE", "rating": 5 },
          { "code": "DIEZ_FIT", "rating": 4 }
        ]
      },
      {
        "userId": "usr-118",
        "name": "Omar Al Hashmi",
        "role": "Infrastructure Manager",
        "isYou": false,
        "status": "PENDING",
        "overallScore": null,
        "criteria": []
      }
    ],
    "disagreements": [
      {
        "criterionCode": "COMMUNICATION",
        "ratings": [5, 3, 2],
        "spread": 3
      }
    ]
  },

  // 6. Anonymised Candidate Profile
  "candidate": {
    "experienceYears": 9,
    "noticePeriod": "2 weeks",
    "leadTimeDays": 14,
    "specialTerms": "Standard",
    "vendorHidden": true
  },

  // 7. Cost & Budget Tracking
  // ALL MONETARY VALUES ARE INTEGERS IN MINOR UNITS (fils: 1 AED = 100 fils). Never floats. Never pre-formatted strings.
  "cost": {
    "approvedBudget": 31000000,      // AED 310,000.00 in minor units (fils)
    "expectedAnnualCost": 29800000,  // AED 298,000.00 in minor units (fils)
    "variance": -1200000,            // -AED 12,000.00 (under budget) in minor units (fils)
    "status": "WITHIN_BUDGET",       // "WITHIN_BUDGET" | "OVER_BUDGET"
    "overBudgetConsequence": null
  },

  // 8. Requisition Position Progress
  "positions": {
    "required": 2,
    "filled": 1,
    "thisWouldFill": 2
  },

  // 9. Rejection Reasons with Concrete PDPL Retention Dates
  "rejectionReasons": [
    {
      "code": "NOT_SUITABLE_KEEP_CV",
      "label": "Doesn't meet requirements — keep the CV",
      "retentionConsequence": "The CV is stored centrally for future roles.",
      "deletionDate": null
    },
    {
      "code": "NOT_SUITABLE_DELETE_CV",
      "label": "Doesn't meet requirements — don't keep the CV",
      "retentionConsequence": "The CV will be deleted on 11 Feb 2027.",
      "deletionDate": "2027-02-11"
    },
    {
      "code": "DUPLICATE_CV",
      "label": "Duplicate CV",
      "retentionConsequence": "The CV will be deleted on 11 Feb 2027.",
      "deletionDate": "2027-02-11"
    }
  ],

  // 10. Submission Deadline & Escalation Severity
  "deadline": {
    "dueAt": "2026-08-12T00:00:00Z",
    "daysRemaining": 0,
    "severity": "WARNING", // "NORMAL" | "WARNING" | "CRITICAL" | "OVERDUE"
    "overdueMessage": null
  },

  // 11. Immutable Audit Trail
  "auditTrail": [
    {
      "event": "PROMPT_SENT",
      "label": "Evaluation prompt sent",
      "at": "2026-08-12T07:45:00Z",
      "actor": "System"
    },
    {
      "event": "INTERVIEW_CONFIRMED",
      "label": "Interview confirmed as completed",
      "at": "2026-08-12T07:45:00Z",
      "actor": "Noura Al Mazrouei"
    }
  ],

  // 12. Immutability Warning
  "immutabilityNotice": "Once submitted, the outcome can only be changed under controlled correction."
}
```

---

### 2. Confirm Interview Occurrence

Per RFP Step 6: *"The Interviewer(s) confirms whether the interview took place."*  
If the interview did not take place, the interviewer records why. Choosing anything other than `occurred: true` prevents scorecard entry and redirects the requisition flow accordingly (e.g. no-show allows proposing new times or rejecting, cancellation returns to scheduling, withdrawal closes candidate).

```http
POST /api/v1/requests/{requestId}/interviews/{candidateRef}/evaluation/interview-outcome
```

#### Request Body
```jsonc
{
  "occurred": true,                       // boolean (required)
  "reason": null,                         // "CANDIDATE_NO_SHOW" | "CANCELLED" | "CANDIDATE_WITHDREW" | null
  "notes": "Candidate attended on Teams on time." // optional free-text notes
}
```

#### Response (`200 OK`)
```jsonc
{
  "success": true,
  "occurred": true,
  "updatedAt": "2026-08-12T07:45:00Z"
}
```

---

### 3. Save Evaluation Draft

Saves in-progress ratings, comments, and tags. Autosaved periodically or triggered manually. Debounced on the client at 2000ms. The server recalculates and returns the provisional `overallScore` and `overallAnchor`.

```http
PUT /api/v1/requests/{requestId}/interviews/{candidateRef}/evaluation/draft
```

#### Request Body
```jsonc
{
  "ratings": [
    { "criterionCode": "TECHNICAL_EXPERTISE", "rating": 5 },
    { "criterionCode": "CYBERSECURITY_OPS", "rating": 4 },
    { "criterionCode": "PROBLEM_SOLVING", "rating": 4 },
    { "criterionCode": "COMMUNICATION", "rating": 4 },
    { "criterionCode": "INCIDENT_RESPONSE", "rating": 5 },
    { "criterionCode": "DIEZ_FIT", "rating": 4 }
  ],
  "comments": "Strong technical background with SIEM architectures.",
  "strengthTags": ["SIEM & SOC", "Incident response"],
  "developmentTags": ["DIEZ internal processes"]
}
```

#### Response (`200 OK`)
```jsonc
{
  "success": true,
  "savedAt": "2026-08-12T08:15:30Z",
  "overallScore": 86.7,
  "overallAnchor": "Above requirement"
}
```

---

### 4. Submit Final Evaluation

Submits the evaluator's final scorecard and, if submitted by the Main Interviewer, the binding hiring outcome.

```http
POST /api/v1/requests/{requestId}/interviews/{candidateRef}/evaluation/submit
```

#### Headers
```http
Authorization: Bearer <token>
Content-Type: application/json
X-Idempotency-Key: <uuid>
```

#### Request Body (Outcome: QUALIFY)
When qualifying, `rejectionReasonCode` must NOT be sent.
```jsonc
{
  "ratings": [
    { "criterionCode": "TECHNICAL_EXPERTISE", "rating": 5 },
    { "criterionCode": "CYBERSECURITY_OPS", "rating": 4 },
    { "criterionCode": "PROBLEM_SOLVING", "rating": 4 },
    { "criterionCode": "COMMUNICATION", "rating": 4 },
    { "criterionCode": "INCIDENT_RESPONSE", "rating": 5 },
    { "criterionCode": "DIEZ_FIT", "rating": 4 }
  ],
  "comments": "Candidate demonstrated outstanding technical competence and fits well within the Digital Security engineering team.",
  "strengthTags": ["SIEM & SOC", "Incident response"],
  "developmentTags": ["DIEZ internal processes"],
  "outcome": "QUALIFY",
  "idempotencyKey": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d"
}
```

#### Request Body (Outcome: REJECT)
When rejecting, `rejectionReasonCode` is **MANDATORY**. Comments are also required.
```jsonc
{
  "ratings": [
    { "criterionCode": "TECHNICAL_EXPERTISE", "rating": 2 },
    { "criterionCode": "CYBERSECURITY_OPS", "rating": 2 },
    { "criterionCode": "PROBLEM_SOLVING", "rating": 3 },
    { "criterionCode": "COMMUNICATION", "rating": 2 },
    { "criterionCode": "INCIDENT_RESPONSE", "rating": 2 },
    { "criterionCode": "DIEZ_FIT", "rating": 3 }
  ],
  "comments": "Candidate does not possess sufficient depth in enterprise SOC detection engineering.",
  "strengthTags": [],
  "developmentTags": ["SIEM & SOC", "Incident response"],
  "outcome": "REJECT",
  "rejectionReasonCode": "NOT_SUITABLE_KEEP_CV", // MANDATORY
  "idempotencyKey": "e89f1a23-4567-489c-b123-abcdef012345"
}
```

#### Response (`200 OK`)
```jsonc
{
  "success": true,
  "submittedAt": "2026-08-12T08:30:00Z",
  "outcome": "QUALIFY",
  "rejectionReasonCode": null,
  "budgetAmendmentQueued": false,
  "message": "Candidate C-014 qualified. Procurement has been notified to begin onboarding."
}
```

---

## Server Requirements and Architectural Rationale

### 1. `rejectionReasonCode` is Mandatory When Outcome is REJECT
- **Requirement:** If `outcome === "REJECT"`, `rejectionReasonCode` is strictly required and must match one of the defined codes (`NOT_SUITABLE_KEEP_CV`, `NOT_SUITABLE_DELETE_CV`, `DUPLICATE_CV`). If missing or invalid, the server must return HTTP 422 with code `EVALUATION_REJECTION_REASON_REQUIRED`.
- **Rationale:** A rejection without a reason code leaves the candidate's CV in an undefined data retention state. RFP Step 5 establishes three distinct retention rules, and UAE Personal Data Protection Law (PDPL) mandates explicit, auditable retention policies for personal data. Retaining CVs without valid consent or legal basis exposes the organization to compliance penalties.

### 2. Only the Main Interviewer May Submit the Final Outcome
- **Requirement:** Only an evaluator with `isMainInterviewer: true` can submit an `outcome` (`QUALIFY` or `REJECT`). Other panel contributors submit ratings and feedback only (`POST /submit` without `outcome` or with outcome ignored). If a non-main interviewer attempts to submit an outcome, the server returns HTTP 403 `EVALUATION_NOT_MAIN`.
- **Rationale:** Per RFP Step 1, the Main Interviewer holds exclusive statutory authority over candidate status. Panel evaluations inform the decision, but individual contributors cannot unilaterally make binding hiring or rejection determinations.

### 3. The Overall Score is Computed Server-Side from Weights
- **Requirement:** The client never computes or submits an aggregate `overallScore`. The server calculates it as the weighted sum:
  $$\text{Score} = \left( \sum_{i=1}^n \frac{\text{Rating}_i}{5} \times \text{Weight}_i \right) \times 100$$
- **Rationale:** Criterion weights and calculation rules belong to the backend domain model. If calculated clientside, discrepancies between client arithmetic and backend formulas will erode trust, confuse panel members, and corrupt audit reports.

### 4. Re-check the Budget at Submit
- **Requirement:** When the Main Interviewer submits `QUALIFY`, the server must verify live budget reservations and candidate quotation figures within an atomic transaction. If financial figures or reservation pools changed concurrently since the page loaded, the submit is rejected with HTTP 409 `EVALUATION_BUDGET_CHANGED`, returning fresh figures in minor units.
- **Rationale:** The cost variance shown on the evaluation page is an informational snapshot. Between initial page load and final submission, concurrent requisitions or budget amendments could alter available funds. Re-checking prevents unauthorized over-allocation.

### 5. Vendor Identity is Never Sent on This Route, Including in Errors
- **Requirement:** The API response must never include vendor agency names, vendor trade IDs, vendor contact details, or raw agency quotations. Any server errors (e.g. database exceptions, validation failures) must sanitize vendor references before returning. The payload explicitly returns `"vendorHidden": true`.
- **Rationale:** Blind candidate review (`PROCESS-GAP-ANALYSIS.md` §2.4 and `CLAUDE.md`) is a core governance invariant. Disclosing vendor identity introduces commercial bias, vendor favoritism, and undermines objective technical qualification.

### 6. Idempotency Key Mandatory
- **Requirement:** The `X-Idempotency-Key` header (or `idempotencyKey` in the payload) is mandatory for state-changing POST operations. If repeated with the same key, the server returns the cached response without re-executing actions.
- **Rationale:** Network latency or double-clicks on the submission button must not produce duplicate audit entries, double-qualifications, or race conditions in procurement onboarding queues.

### 7. Submitting When `interview.occurred` is False Must Be Rejected
- **Requirement:** If `interview.occurred` has not been confirmed as `true`, calling `POST /submit` or `PUT /draft` with scores must be rejected with HTTP 400 `EVALUATION_INTERVIEW_NOT_CONFIRMED`.
- **Rationale:** Per RFP Step 6, confirmation that the interview took place is a mandatory gate. Recording performance ratings for an interview that never took place corrupts candidate evaluation records.

### 8. Over-Budget Qualification Queues a Budget Amendment Atomically
- **Requirement:** When qualifying an `OVER_BUDGET` candidate, the server must atomically queue a Budget Amendment with Finance. If the amendment cannot be initiated (e.g. Finance workflow locked, ceiling exceeded), the submission MUST fail completely rather than qualifying the candidate first.
- **Rationale:** Qualifying an over-budget candidate without an active, linked Budget Amendment violates DIEZ financial governance controls and creates unbudgeted procurement liabilities.

---

## Error Handling & Status Codes

All errors follow the standard OMS error schema. Monetary values in errors are integers in minor units.

```jsonc
{
  "statusCode": 400,
  "code": "EVALUATION_INTERVIEW_NOT_CONFIRMED",
  "message": "The interview must be confirmed as completed before submitting an evaluation.",
  "details": {}
}
```

### Domain Error Codes

| HTTP Status | Code | Message | Description |
| :--- | :--- | :--- | :--- |
| `400 Bad Request` | `EVALUATION_INTERVIEW_NOT_CONFIRMED` | "Confirm whether the interview took place first." | Attempted to evaluate or submit an unconfirmed or non-occurred interview. |
| `400 Bad Request` | `EVALUATION_IDEMPOTENCY_MISSING` | "Idempotency key is required." | Missing `X-Idempotency-Key` or payload `idempotencyKey`. |
| `403 Forbidden` | `EVALUATION_NOT_MAIN` | "Only the main interviewer can submit the outcome." | Contributor attempted to submit `QUALIFY` or `REJECT`. |
| `409 Conflict` | `EVALUATION_ALREADY_SUBMITTED` | "Evaluation already submitted by Noura Al Mazrouei on 12 Aug 2026." | Candidate evaluation was already finalized and locked. |
| `409 Conflict` | `EVALUATION_BUDGET_CHANGED` | "Budget figures have changed. Please review the updated figures." | Budget changed concurrently. Payload includes fresh minor-unit figures. |
| `422 Unprocessable` | `EVALUATION_REJECTION_REASON_REQUIRED` | "A rejection reason must be selected." | `outcome: "REJECT"` was provided without a valid `rejectionReasonCode`. |
| `422 Unprocessable` | `EVALUATION_UNRATED_CRITERIA` | "All required criteria must be rated." | Rating missing for one or more criteria on strict submission. |
| `422 Unprocessable` | `EVALUATION_AMENDMENT_FAILED` | "Could not queue budget amendment. Candidate not qualified." | Finance amendment creation failed; submission aborted. |
