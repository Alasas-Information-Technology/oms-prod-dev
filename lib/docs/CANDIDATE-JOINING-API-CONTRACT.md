# Candidate Joining Readiness API Contract — Third Surface

Route: `/api/v1/candidate-portal/{token}`  
Frontend Route: `/c/{token}` (token-scoped, magic link touchpoint, no persistent account)  
Specification Source: `docs/CANDIDATE-JOINING-READINESS.md` Part 4  
Companion Documents: `CLAUDE.md`, `VENDOR-DOCUMENTS-API-CONTRACT.md`, `PORTAL-SEPARATION-AND-USERS.md`

---

## 1. Architectural Principles & Critical Security Invariants

> [!CAUTION]
> ### 🔴 SERVER REQUIREMENT 1 (Candidate Data Isolation — STRICTEST ROUTE IN THE SYSTEM)
> **This is the strictest data-isolation route in the entire system.**  
> Unlike the internal portal (authenticated DIEZ employee) or vendor portal (authenticated accredited partner organization), the candidate portal is accessed via a time-limited magic link token.  
> **A single wrong join or unfiltered query exposes another candidate's personal data, compliance documents, and identification to someone who only proved control of one email inbox.**  
> 
> **Mandatory Invariants:**
> - The payload contains ONLY this specific `onboardingCase` / `candidateRef` fields.
> - **Zero exposure of sibling candidates.**
> - **Zero exposure of vendor entities or commercial terms.**
> - **Zero exposure of requisition metadata, financial allocations, salary grade, budget lines, or cost figures.**
> - Every database query and view must be strictly scoped to the validated `OnboardingId`.

---

## 2. All Five Server Requirements & Rationale

### Requirement 1: Candidate Data Isolation
- **Rule:** The payload contains only this `caseId`'s fields — no sibling candidates, no vendor, no requisition, no budget data, ever, on this route.
- **Rationale:** The candidate has neither an `auth.Users` record nor an organization scope. They are authenticated purely by possession of a token link delivered to their email inbox. Exposing cross-case fields would constitute an unmitigated privacy breach under DIFC/UAE data protection laws.

### Requirement 2: Location-Driven Task Generation
- **Rule:** `tasks` is generated from `residentStatus` server-side, never hardcoded on the client:
  - **`ONSHORE`**: Pre-employment medical, biometric enrollment (Saned), passport photo upload, plus shared compliance tasks (documents, NDA, joining date confirmation).
  - **`OFFSHORE`**: Remote-access readiness confirmation task in place of medical and biometric enrollment, plus shared compliance tasks.
- **Rationale:** An offshore candidate cannot and does not enroll in UAE Saned biometrics or pre-employment medical clinics. Server-side synthesis ensures that task lists remain legally accurate and actionable.

### Requirement 3: Internal Reviewer Anonymity
- **Rule:** No internal identity anywhere in the payload. Reviewer and approver entries carry generic role labels only (e.g. `"actorRole": "onboarding team"`, `"Reviewed by the onboarding team"`). The `coordinator` field is the sole deliberate exception — a designated, visible support contact (e.g. Layla Hassan) to whom the candidate can reach out for help.
- **Rationale:** Prevents external candidates from lobbying, contacting, or identifying internal DIEZ line managers, section heads, or HR evaluators, while preserving a friendly, designated support point of contact.

### Requirement 4: Constant-Time Non-Enumeration Token Validation
- **Rule:** Token is validated on every request. Expired, revoked, and unknown tokens all return the IDENTICAL generic response:
  `"This link is no longer valid. Contact your onboarding coordinator for a new one."`
- **Rationale:** Prevents token-probing, brute-force enumeration, and timing attacks. Attackers cannot determine whether a token was previously valid, has expired, or never existed.

### Requirement 5: Server-Computed Readiness Gates
- **Rule:** `readyToConfirm` (boolean) and `blockingTasksRemaining` (integer) are computed authoritatively on the server. The client never determines whether the final attestation CTA is enabled by counting rows itself.
- **Rationale:** Protects against client-side tampering, script overrides, or DOM race conditions where incomplete background checks or failed documents could be prematurely attested by the candidate.

---

## 3. Endpoint Specification

### `GET /api/v1/candidate-portal/{token}`

Retrieves the complete joining readiness state for a candidate identified by their 32-byte base64url access token.

#### URL Parameters
| Parameter | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `token` | `string` | Yes | 32 random bytes, base64url encoded token string |

#### Request Headers
```http
GET /api/v1/candidate-portal/uW7a9_xY8vZb2L9mK0qP3rS5tU1wX4yZ7aB0cD3eF6g HTTP/1.1
Host: localhost:3000
Accept: application/json
```

#### Success Response (`200 OK`)
```jsonc
{
  "valid": true,
  "onboardingCase": "ONB-2026-0061",
  "candidateRef": "C-014",
  "position": "Senior Cybersecurity Analyst",
  "residentStatus": "ONSHORE",
  "expectedJoining": "2026-09-01",
  "readinessScore": 78,
  "kpi": {
    "documents": {
      "completed": 4,
      "total": 4
    },
    "offerReference": "LPO-260771",
    "biometricAppointment": "SCHEDULED",
    "joiningConfirmed": true
  },
  "tasks": [
    {
      "code": "PRE_EMPLOYMENT_MEDICAL",
      "label": "Pre-employment medical",
      "detail": "Book a slot at an accredited clinic",
      "dueAt": "2026-08-26",
      "status": "DANGER",
      "action": "BOOK_SLOT",
      "onshoreOnly": true
    },
    {
      "code": "BIOMETRIC_ENROLLMENT",
      "label": "Biometric enrollment",
      "detail": "Saned center biometric appointment",
      "dueAt": "2026-08-28",
      "status": "WARNING",
      "action": "BOOK_SLOT",
      "onshoreOnly": true
    },
    {
      "code": "PASSPORT_PHOTO_UPLOAD",
      "label": "Passport photo upload",
      "detail": "White background, JPEG/PNG only",
      "dueAt": "2026-08-29",
      "status": "INFO",
      "action": "UPLOAD",
      "onshoreOnly": true
    },
    {
      "code": "NDA_SIGNATURE",
      "label": "Non-Disclosure Agreement",
      "detail": "Electronic signature required",
      "dueAt": "2026-08-30",
      "status": "COMPLETE",
      "action": "VIEW_SIGNED",
      "onshoreOnly": false
    },
    {
      "code": "CONFIRM_JOINING_DATE",
      "label": "Confirm joining date",
      "detail": "Initial joining date acceptance",
      "dueAt": "2026-08-25",
      "status": "COMPLETE",
      "action": "CONFIRM_DATE",
      "onshoreOnly": false
    }
  ],
  "stepper": [
    {
      "stage": "DOCUMENTS_SUBMITTED",
      "label": "Documents Submitted",
      "state": "COMPLETE",
      "completedAt": "2026-08-24T10:15:00Z",
      "actorRole": "onboarding team"
    },
    {
      "stage": "E_SIGNATURE",
      "label": "E-signature",
      "state": "COMPLETE",
      "completedAt": "2026-08-24T14:30:00Z",
      "actorRole": "onboarding team"
    },
    {
      "stage": "DIEZ_REVIEW",
      "label": "DIEZ Review",
      "state": "COMPLETE",
      "completedAt": "2026-08-25T11:00:00Z",
      "actorRole": "onboarding team"
    },
    {
      "stage": "JOINING_READINESS",
      "label": "Joining Readiness",
      "state": "CURRENT",
      "completedAt": null,
      "actorRole": null
    },
    {
      "stage": "JOINED",
      "label": "Joined",
      "state": "PENDING",
      "completedAt": null,
      "actorRole": null
    }
  ],
  "firstDay": {
    "location": "DIEZ Headquarters, Building D2, 4th Floor, Dubai Silicon Oasis",
    "reportingTime": "08:30 AM GST",
    "dressCode": "Business Professional / Formal",
    "whatToBring": [
      "Original Passport",
      "Original Emirates ID (if resident)",
      "Attested Degree Certificate",
      "Printed Saned Biometric Receipt"
    ],
    "itReadiness": "IN_PROGRESS"
  },
  "coordinator": {
    "name": "Layla Hassan",
    "role": "Onboarding Coordinator"
  },
  "readyToConfirm": false,
  "blockingTasksRemaining": 2
}
```

---

## 4. Error Responses (Constant-Time Non-Enumeration)

Whenever a token is missing, ill-formed, unknown, expired, or revoked, the server returns an identical HTTP response:

```http
HTTP/1.1 400 Bad Request
Content-Type: application/json
```

```json
{
  "valid": false,
  "code": "CANDIDATE_TOKEN_INVALID_OR_EXPIRED",
  "message": "This link is no longer valid. Contact your onboarding coordinator for a new one."
}
```

> [!NOTE]
> The HTTP status code and response payload must never differentiate between:
> 1. Token string has never existed (`UNKNOWN`)
> 2. Token expiration datetime has passed (`EXPIRED`)
> 3. Token was manually cancelled or superseded (`REVOKED`)
> 4. Associated case was deleted or archived
