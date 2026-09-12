# Vendor Portal API Contract — Complete Specification

**Base Path**: `/api/v1/vendor`  
**Specification Source**: `docs/VENDOR-PORTAL-UI.md` Part 5 & Part 2  
**Companion Documents**: `CLAUDE.md`, `VENDOR-DOCUMENTS-API-CONTRACT.md`, `DEMO-DATA-INTEGRATION.md`, `INTERVIEW-PLANNING-UX.md`  
**Financial Standard**: Integer minor units throughout (`1 AED = 100 fils`). Zero floating-point currencies.

---

## 1. Architectural Guardrails & Six Server Requirements

> [!IMPORTANT]
> ### SERVER REQUIREMENT 1 (PROMINENT): Zero Budget Exposure at the API Layer
> **No requisition payload on ANY vendor route includes budget figures.**  
> - Fields strictly prohibited from vendor payloads: `budgetAmount`, `approvedBudget`, `allocations`, `fundingRoute`, `drawdownAmount`, `salaryGradeBudgetCeiling`, or any internal ledger calculations.
> - **Rationale**: This is a deliberate commercial and procurement concealment, **never an oversight**. Revealing internal budget ceilings invites vendors to inflate candidate quotes to match the ceiling rather than submitting competitive, authentic market rates.
> - **Enforcement**: This restriction **must hold unconditionally at the API and BFF serialization layer**. The client application must not receive, cache, or have access to budget figures anywhere in memory, ensuring the client is never even capable of rendering them.

> [!IMPORTANT]
> ### SERVER REQUIREMENT 2: Complete Competitor Isolation (Anti-Collusion)
> **No submission payload includes other vendors' data**, including competitor submission counts, competitive bids, or vendor identities.  
> - A vendor only sees their own invited requisitions, their own submitted candidates, and their own submission counts against open requirements.
> - **Rationale**: Preserves commercial confidentiality, anti-collusion boundaries, and fair agency competition under UAE procurement governance.

> [!IMPORTANT]
> ### SERVER REQUIREMENT 3: Blind Rejection Without Leaking Scorecard Details
> **Rejection reasons, ratings, priorities, and internal evaluator notes are never sent.**  
> - When a candidate is not selected, the vendor API returns solely the status code: `NOT_SELECTED`.
> - **Rationale**: Internal interview evaluation comments, priority tiers (P1/P2/P3), and subjective assessment disagreements are strictly privileged internal communications. Disclosing them exposes DIEZ to unwarranted commercial dispute and violates blind assessment governance.

> [!IMPORTANT]
> ### SERVER REQUIREMENT 4: Anonymity of Hiring Team on Interview Scheduling
> **Interviewer identity is never sent on interview proposal or response routes.**  
> - Evaluators and panel interviewers are represented generically as *"The hiring team for {PositionTitle}"*.
> - **Rationale**: Consistent with `INTERVIEW-PLANNING-UI.md` (`interviewerHiddenFromVendor: true`), this shields individual government employees and panel members from external lobbying, direct candidate outreach, or solicitation by agency coordinators.

> [!IMPORTANT]
> ### SERVER REQUIREMENT 5: Server-Side Rate Resolution in Negotiable Mode
> **Negotiable-mode candidate submissions must resolve their cost server-side against the vendor's own published rate card.**  
> - The client payload sends only a `gradeCode` (and optional `level`), never a computed currency amount. The backend validates and pulls the official rate from the vendor's active, approved rate card (`PUBLISHED` status).
> - **Rationale**: Guarantees contract compliance and prevents client-side price tampering or rate drift.

> [!IMPORTANT]
> ### SERVER REQUIREMENT 6: Silent 404 on Cross-Vendor or Unauthorized Access
> **Every resource query is scoped strictly to the authenticated vendor organization.**  
> - Any attempt to access a requisition, submission, contract, or onboarding case belonging to another vendor or an uninvited requisition MUST return `404 Not Found` (never `403 Forbidden`).
> - **Rationale**: Prevents ID enumeration attacks and resource sniffing that would confirm the existence of competitor contracts or requisitions.

---

## 2. Route Matrix

| Method | Route | Description | Scope |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/vendor/dashboard` | Executive KPI cards and "Needs my action" queue | Vendor Org |
| `GET` | `/api/v1/vendor/requisitions` | Open requirements invited to this vendor | Vendor Org |
| `GET` | `/api/v1/vendor/requisitions/{id}` | Detailed job spec and submission window (NO budget) | Vendor Org |
| `POST` | `/api/v1/vendor/submissions` | Submit candidate CV and cost quote | Vendor Org |
| `GET` | `/api/v1/vendor/submissions/history` | Historical submissions with vendor-safe statuses | Vendor Org |
| `GET` | `/api/v1/vendor/submissions/{id}/interview` | Proposed interview slots from the hiring team | Vendor Org |
| `POST` | `/api/v1/vendor/submissions/{id}/interview/select` | Confirm selected interview timeslot | Vendor Org |
| `POST` | `/api/v1/vendor/submissions/{id}/interview/request-alternative` | Request alternative interview timeslots | Vendor Org |
| `GET` | `/api/v1/vendor/contracts` | Master services agreements and active contracts | Vendor Org |
| `GET` | `/api/v1/vendor/rates` | Active and draft rate card schedules | Vendor Org |
| `POST` | `/api/v1/vendor/rates/upload` | Upload and preview CSV/Excel rate card spreadsheet | Vendor Org |
| `POST` | `/api/v1/vendor/rates/{id}/submit-for-approval` | Submit draft rate card to DIEZ Procurement | Vendor Org |
| `GET` | `/api/v1/vendor/onboarding` | Active candidate onboarding cases | Vendor Org |
| `GET` | `/api/v1/vendor/documents` | Vendor's own enterprise compliance document repository | Vendor Org |
| `GET` | `/api/v1/vendor/profile` | Company registration profile and coordinator directory | Vendor Org |
| `GET` | `/api/v1/vendor/support/messages` | Operational communication thread with Procurement | Vendor Org |
| `POST` | `/api/v1/vendor/support/messages` | Send message or attachment to Procurement | Vendor Org |

---

## 3. Endpoint Specifications & Data Contracts

### 3.1 GET `/api/v1/vendor/dashboard`
Returns executive KPI totals and pending actionable items for the authenticated vendor coordinator.

#### Response Body:
```json
{
  "kpis": {
    "openRequirements": 2,
    "candidatesAwaitingReview": 1,
    "interviewsToRespond": 1,
    "onboardingInProgress": 2,
    "documentsExpiringSoon": 1
  },
  "actionItems": [
    {
      "id": "act-int-021",
      "type": "INTERVIEW_PROPOSAL",
      "subjectRef": "C-021",
      "title": "Interview Slots Proposed — Senior Cybersecurity Analyst",
      "context": "Digital Security · Elena Rostova",
      "status": "ACTION_REQUIRED",
      "urgency": "HIGH",
      "daysRemaining": 2,
      "dueAt": "2026-09-12T17:00:00Z",
      "href": "/vendor/submissions/C-021/interview"
    },
    {
      "id": "act-onb-0119",
      "type": "ONBOARDING_DOCUMENT",
      "subjectRef": "ONB-2026-0119",
      "title": "Execute NDA & Compliance Package — Tariq Al Hammadi",
      "context": "Digital Security · SOC Analyst",
      "status": "PENDING_SIGNATURE",
      "urgency": "NORMAL",
      "daysRemaining": 5,
      "dueAt": "2026-09-15T18:00:00Z",
      "href": "/vendor/onboarding/ONB-2026-0119/documents"
    },
    {
      "id": "act-req-0161",
      "type": "SUBMISSION_WINDOW",
      "subjectRef": "OMS-2026-0161",
      "title": "Submission Window Open — Penetration Tester",
      "context": "Digital Security · 1 Position",
      "status": "OPEN",
      "urgency": "NORMAL",
      "daysRemaining": 4,
      "dueAt": "2026-09-14T14:00:00Z",
      "href": "/vendor/requisitions/OMS-2026-0161"
    },
    {
      "id": "act-doc-license",
      "type": "COMPLIANCE_EXPIRY",
      "subjectRef": "DOC-TL-2026",
      "title": "Commercial Trade Licence Renewal Required",
      "context": "Falcon Tech Resourcing · Expires in 24 days",
      "status": "WARNING",
      "urgency": "CRITICAL",
      "daysRemaining": 24,
      "dueAt": "2026-10-04T00:00:00Z",
      "href": "/vendor/documents"
    }
  ]
}
```

---

### 3.2 GET `/api/v1/vendor/requisitions` & GET `/api/v1/vendor/requisitions/{id}`
Provides requirements invited to this vendor. **Strictly stripped of all budget and cost allocation fields.**

#### Item Response Schema:
```json
{
  "id": "OMS-2026-0148",
  "positionTitle": "Senior Cybersecurity Analyst",
  "departmentName": "Digital Security",
  "positions": {
    "required": 1,
    "filled": 0
  },
  "engagementMonths": 12,
  "workLocation": "DIEZ_PREMISES",
  "expectedStartDate": "2026-10-01",
  "salaryGrade": "G8",
  "justification": "Threat monitoring, incident response, and SIEM rule engineering for DIEZ Free Zone infrastructure.",
  "submissionWindow": {
    "opensAt": "2026-08-10T08:00:00Z",
    "closesAt": "2026-09-15T18:00:00Z",
    "daysRemaining": 5,
    "isOpen": true,
    "maxBatchSize": 10
  },
  "mySubmissionsCount": 2,
  "experienceYearsRequired": 7,
  "requiredSkills": [
    "Splunk / Sentinel SIEM",
    "Incident Response",
    "Threat Hunting",
    "MITRE ATT&CK Framework"
  ],
  "jobDescriptionHtml": "<p>Detailed terms of reference...</p>"
}
```
*(Notice: `budgetAmount`, `currency`, `allocations`, `fundingRoute` are completely absent).*

---

### 3.3 POST `/api/v1/vendor/submissions`
Submits a candidate against an open requirement.

#### Request Payload:
```json
{
  "requisitionId": "OMS-2026-0161",
  "candidate": {
    "fullName": "Zaid Al-Mansoori",
    "email": "zaid.mansoori@falcontech-candidate.com",
    "mobile": "+971 50 888 7766",
    "nationality": "Jordan",
    "residentStatus": "ONSHORE",
    "experienceYears": 8,
    "noticePeriodDays": 30
  },
  "cvAttachmentId": "att-cv-987123",
  "costMode": "NEGOTIABLE",
  "rateCardGradeCode": "G8",
  "fixedAmount": null,
  "specialTerms": "Overtime pre-authorized for critical incident response shifts at 1.25x standard hourly rate.",
  "leadTimeDays": 14
}
```

#### Server Processing Rules:
1. If `costMode === "FIXED"`, `fixedAmount` must be an integer in fils (`> 0`).
2. If `costMode === "NEGOTIABLE"`, the server retrieves the vendor's active published rate card (`PUBLISHED`) and maps `rateCardGradeCode` to the official approved rate. `fixedAmount` must be omitted.
3. If `costMode === "PRE_AGREED"`, the rate resolves strictly from the active contract between DIEZ and this vendor.
4. Checks batch limit (RFP limit: max 10 submissions per vendor per requisition).
5. Returns `409 Conflict` if submission window is closed.

---

### 3.4 GET `/api/v1/vendor/submissions/history`
Lists all candidate submissions made by this vendor organization across all requisitions.

#### Status Mapping (Internal vs Vendor-Visible):
| Internal Candidate Status | Vendor-Visible Status | Description Shown to Vendor |
| :--- | :--- | :--- |
| `SOURCING` | `SUBMITTED` | Candidate submitted; awaiting initial screening |
| `SHORTLISTED` | `UNDER_REVIEW` | Candidate selected for department review |
| `INTERVIEW_PENDING` | `INTERVIEW_PROPOSED` | **Action Required**: Hiring team proposed slots |
| `INTERVIEW_SCHEDULED` | `INTERVIEW_CONFIRMED`| Interview confirmed; date & time finalized |
| `EVALUATED` | `UNDER_REVIEW` | Evaluation complete; awaiting approval sign-off |
| `QUALIFIED`, `QUALIFIED_PENDING_BUDGET` | `QUALIFIED` | Candidate qualified; preparing onboarding |
| `ONBOARDING`, `HIRED` | `ONBOARDING` | Moving through onboarding & documentation |
| `REJECTED`, `WITHDRAWN` | `NOT_SELECTED` | Requisition closed / candidate not selected (NO reasons) |

---

### 3.5 GET `/api/v1/vendor/submissions/{id}/interview` & Action Endpoints
Handles responding to proposed interview timeslots for candidates.

#### Interview Proposal Response:
```json
{
  "candidateRef": "C-021",
  "candidateName": "Elena Rostova",
  "requisitionId": "OMS-2026-0148",
  "positionTitle": "Senior Cybersecurity Analyst",
  "hiringTeam": "The hiring team for Senior Cybersecurity Analyst",
  "status": "AWAITING_REPLY",
  "method": "ONLINE",
  "platform": "MICROSOFT_TEAMS",
  "durationMinutes": 45,
  "candidateTimezone": "Asia/Dubai (+04:00 GST)",
  "replyByDate": "2026-09-12T17:00:00Z",
  "daysRemaining": 2,
  "proposedSlots": [
    {
      "slotId": "slot-0148-001",
      "start": "2026-09-12T08:30:00Z",
      "durationMinutes": 45,
      "label": "Tue 12 Sep · 12:30 – 13:15 GST"
    },
    {
      "slotId": "slot-0148-002",
      "start": "2026-09-13T10:00:00Z",
      "durationMinutes": 45,
      "label": "Wed 13 Sep · 14:00 – 14:45 GST"
    }
  ]
}
```
*(Notice: Interviewer names like "Noura Al Mazrouei" or "Omar Al Hashmi" are strictly sanitized to `hiringTeam`).*

#### Confirmation Action: `POST …/interview/select`
```json
{ "slotId": "slot-0148-001" }
```

#### Alternative Request Action: `POST …/interview/request-alternative`
```json
{
  "note": "Candidate is on customer duty on 12 Sep morning; available from 14 Sep onwards between 09:00 and 13:00 GST."
}
```

---

### 3.6 GET `/api/v1/vendor/rates` & POST `/api/v1/vendor/rates/upload`
Manages master data rate cards per RFP requirements (DIEZA Premises, UAE Remote WFH, UAE Remote Office, Remote Abroad, Pre-Agreed).

#### Rate Card Schema:
```json
{
  "id": "rc-falcon-001",
  "vendorId": "ven-falcon",
  "code": "RC-FT-2026",
  "name": "Falcon Tech IT Specialist Rate Card 2026",
  "template": "DIEZA_PREMISES",
  "status": "PUBLISHED",
  "effectiveFrom": "2026-01-01",
  "effectiveTo": "2026-12-31",
  "currency": "AED",
  "grades": [
    {
      "gradeCode": "G6",
      "level": "Associate",
      "roleTitle": "Junior Security / Systems Analyst",
      "minSalary": 1400000,
      "maxSalary": 1800000,
      "serviceChargePercent": 15,
      "monthlyRate": 2070000,
      "dailyRate": 95000
    },
    {
      "gradeCode": "G8",
      "level": "Senior",
      "roleTitle": "Senior Cybersecurity / Systems Specialist",
      "minSalary": 2200000,
      "maxSalary": 2800000,
      "serviceChargePercent": 14,
      "monthlyRate": 3192000,
      "dailyRate": 145000
    }
  ]
}
```
*(All rates in minor units fils: `2070000` fils = `AED 20,700.00`).*

---

### 3.7 GET `/api/v1/vendor/documents`
Provides the vendor company's own statutory compliance files (trade license, VAT certificate, civil liability insurance, ISO accreditations).

#### Response Schema:
```json
[
  {
    "id": "doc-tl-001",
    "documentType": "TRADE_LICENCE",
    "title": "Commercial Trade Licence",
    "issuingAuthority": "Dubai Economy & Tourism (DET)",
    "licenceNumber": "DET-849201",
    "status": "ACTIVE",
    "expiresOn": "2026-10-04",
    "daysRemaining": 24,
    "severity": "WARNING",
    "file": {
      "id": "f-tl-2026",
      "name": "Falcon_Tech_Trade_Licence_2026.pdf",
      "sizeBytes": 1482092,
      "uploadedAt": "2025-10-05T09:00:00Z"
    }
  }
]
```

---

## 4. Error Responses

| Status Code | Error Code | Meaning |
| :--- | :--- | :--- |
| `400 Bad Request` | `VALIDATION_FAILED` | Malformed payload, invalid email, negative cost |
| `401 Unauthorized` | `UNAUTHENTICATED` | Missing or expired JWT session |
| `403 Forbidden` | `INTERNAL_PORTAL_ONLY` | Internal user attempted to access vendor API |
| `404 Not Found` | `RESOURCE_NOT_FOUND` | Resource does not exist or belongs to another vendor |
| `409 Conflict` | `WINDOW_CLOSED` | Submission attempted after window closed |
| `409 Conflict` | `BATCH_LIMIT_EXCEEDED` | Attempted to submit >10 CVs in single batch |
| `422 Unprocessable` | `INVALID_RATE_GRADE` | Rate card grade does not exist in published card |
