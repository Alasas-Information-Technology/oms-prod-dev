# Candidate Documents & E-signature API Contract — Vendor Portal

Base Path: `/api/v1/vendor/onboarding/{onboardingId}`  
Specification Source: `docs/VENDOR-DOCUMENTS-UI.md` Part 5  
Companion Documents: `CLAUDE.md`, `GAP-ANALYSIS.md` §1.3, `CLARIFICATION-RESPONSE-UI.md`, `INTERVIEW-PLANNING-UX.md`

---

## 1. Overview & Architectural Principles

The Candidate Documents & E-signature workspace (`/vendor/onboarding/{onboardingId}/documents`) is the primary compliance gateway for accredited vendors submitting legal, identification, and background check documents for candidates entering DIEZ.

### Mandatory Principles & High-Priority Server Requirements

> [!IMPORTANT]
> **SERVER REQUIREMENT 1 (Location-Driven Document Sets):**  
> `requiredDocuments` is dynamically generated on the server strictly from `candidate.residentStatus`.  
> - **`ONSHORE`** requires: **Passport (bio page)**, **Emirates ID**, **Police Clearance**, and **NDA**.  
> - **`OFFSHORE`** requires: **Passport**, **National ID**, and **NDA**.  
> The client must NEVER hardcode or assume the requirement set.

> [!IMPORTANT]
> **SERVER REQUIREMENT 2 (Health Reconciliation Single Source of Truth):**  
> Document Health counts (`required`, `uploaded`, `approved`, `expiringSoon`, `missing`) must be derived directly from the SAME row data (`documents[].status` and `expiresOn`) returned in the response.  
> The legacy reference showed *Required 4 / Uploaded 3 / Approved 1 / Expiring 1 / Missing 1* against only 4 visible rows with zero missing items — arithmetic divergence destroys vendor trust. Server and client derive health strictly from the row array via `computeDocumentHealth(documents)`.

> [!IMPORTANT]
> **SERVER REQUIREMENT 3 (Malware Scanning as a Blocking Gate):**  
> Any row in `SCAN_FAILED` status strictly blocks submission server-side. The submit endpoint rejects requests with `409 Conflict (SCAN_FAILED)` naming the quarantined file. Client-side UI disables submit with an explanatory banner.

> [!IMPORTANT]
> **SERVER REQUIREMENT 4 (Vendor Portal Authorization & Coordinator Ownership):**  
> Only the assigned vendor coordinator from the authorized vendor organization owning the onboarding record may edit (`canEdit: true`). Internal DIEZ users and other vendors are blocked at the portal boundary (`proxy.ts` / Next.js middleware) and receive `403 Forbidden` on `/api/v1/vendor/*`.

> [!IMPORTANT]
> **SERVER REQUIREMENT 5 (Idempotency Key Mandatory on Submit):**  
> The `POST …/submit` endpoint mandates an `idempotencyKey` header or payload field generated once upon opening the submission confirmation dialog and reused across network retries.

> [!IMPORTANT]
> **SERVER REQUIREMENT 6 (Unmasked Contact Details for Record Owner):**  
> Because the vendor coordinator entered the candidate's mobile and email during Step 1 submission, full contact details (`email`, `mobile`) must be returned **unmasked** so the coordinator can verify information before triggering e-signature and final submission.

---

## 2. Endpoints

### Summary Matrix

| Method | Endpoint | Description | Idempotent |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/v1/vendor/onboarding/{onboardingId}/documents` | Load complete documents workspace, candidate details, signature state, and deadline | Yes |
| `POST` | `/api/v1/vendor/onboarding/{onboardingId}/documents/{documentCode}/upload` | Upload a new document file (multipart/form-data) | No |
| `POST` | `/api/v1/vendor/onboarding/{onboardingId}/documents/{documentCode}/replace` | Replace an existing document file with scanning retention | No |
| `POST` | `/api/v1/vendor/onboarding/{onboardingId}/signature/send` | Dispatch NDA e-signature envelope to candidate | Yes |
| `PUT` | `/api/v1/vendor/onboarding/{onboardingId}/draft` | Auto-save draft changes (debounced 2s) | Yes |
| `POST` | `/api/v1/vendor/onboarding/{onboardingId}/submit` | Final submission to DIEZ with receipt generation | Yes (with key) |

---

### 2.1 GET `/api/v1/vendor/onboarding/{onboardingId}/documents`

Retrieves the workspace state for candidate document management.

#### Path Parameters
- `onboardingId` (string, required): Format `ONB-YYYY-NNNN` (e.g., `ONB-2026-0061`).

#### Success Response `200 OK`
```jsonc
{
  "onboardingId": "ONB-2026-0061",
  "candidateRef": "C-014",
  "position": "Senior Cybersecurity Analyst",
  "candidate": {
    "fullName": "Samir Rahman",
    "nationality": "India",
    "residentStatus": "ONSHORE", // "ONSHORE" | "OFFSHORE"
    "expectedJoining": "2026-09-01",
    "email": "samir.rahman@example.com",
    "mobile": "+971 50 123 4567",
    "privacyNoticeAcknowledged": true
  },

  "canEdit": true,
  "readOnlyReason": null,

  "requiredDocuments": [
    {
      "code": "PASSPORT",
      "label": "Passport (bio page)",
      "status": "APPROVED",
      "file": {
        "id": "file-pass-001",
        "name": "Passport_Samir.pdf",
        "sizeBytes": 2457600,
        "mimeType": "application/pdf",
        "uploadedAt": "2026-08-20T10:15:00Z"
      },
      "expiresOn": "2031-03-14",
      "expiringWithinDays": 1648,
      "malwareScanPassed": true,
      "fileTypeValid": true,
      "rejectionReason": null
    },
    {
      "code": "EMIRATES_ID",
      "label": "Emirates ID",
      "status": "UNDER_REVIEW",
      "file": {
        "id": "file-eid-001",
        "name": "EID_Samir.pdf",
        "sizeBytes": 1843200,
        "mimeType": "application/pdf",
        "uploadedAt": "2026-08-21T08:30:00Z"
      },
      "expiresOn": "2027-11-21",
      "expiringWithinDays": 439,
      "malwareScanPassed": true,
      "fileTypeValid": true,
      "rejectionReason": null
    },
    {
      "code": "POLICE_CLEARANCE",
      "label": "Police Clearance",
      "status": "UPLOADED",
      "file": {
        "id": "file-pcc-001",
        "name": "Police_Clearance.pdf",
        "sizeBytes": 3145728,
        "mimeType": "application/pdf",
        "uploadedAt": "2026-08-24T08:15:00Z"
      },
      "expiresOn": "2026-10-30",
      "expiringWithinDays": 67, // <= 90 triggers amber "· soon" suffix
      "malwareScanPassed": true,
      "fileTypeValid": true,
      "rejectionReason": null
    },
    {
      "code": "NDA",
      "label": "NDA",
      "status": "PENDING_SIGNATURE",
      "file": null,
      "expiresOn": null,
      "expiringWithinDays": null,
      "malwareScanPassed": null,
      "fileTypeValid": null,
      "rejectionReason": null,
      "requiresSignature": true
    }
  ],
  "optionalDocuments": [],

  "signature": {
    "templateName": "DIEZ Outsourced Resource NDA",
    "envelopeStatus": "NOT_SENT", // "NOT_SENT" | "SENT" | "VIEWED" | "SIGNED" | "DECLINED"
    "signers": [
      { "order": 1, "name": "Samir Rahman", "role": "Candidate" },
      { "order": 2, "name": "DIEZ Representative", "role": "DIEZ" }
    ],
    "previewUrl": "/api/v1/vendor/onboarding/ONB-2026-0061/signature/preview",
    "sentAt": null,
    "signedAt": null
  },

  "deadline": {
    "joiningDate": "2026-09-01",
    "daysRemaining": 8,
    "severity": "NORMAL" // "NORMAL" (>7d) | "WARNING" (3-7d) | "CRITICAL" (<3d)
  },

  "receiptIssued": false,
  "receiptNumber": null
}
```

---

### 2.2 POST `/api/v1/vendor/onboarding/{onboardingId}/documents/{documentCode}/upload`

Uploads a document file for a required or optional document item.

#### Request Headers
- `Content-Type`: `multipart/form-data`

#### Form Data Fields
- `file` (File, required): Accepted MIME types: `application/pdf`, `image/png`, `image/jpeg`. Max 10MB.
- `expiresOn` (string, optional): Expiry date `YYYY-MM-DD` if required for the document type.

#### Success Response `200 OK`
Returns the updated `VendorDocument` row:
```jsonc
{
  "code": "POLICE_CLEARANCE",
  "label": "Police Clearance",
  "status": "UPLOADED",
  "file": {
    "id": "file-pcc-002",
    "name": "Police_Clearance.pdf",
    "sizeBytes": 3145728,
    "mimeType": "application/pdf",
    "uploadedAt": "2026-08-24T08:15:00Z"
  },
  "expiresOn": "2026-10-30",
  "expiringWithinDays": 67,
  "malwareScanPassed": true,
  "fileTypeValid": true,
  "rejectionReason": null
}
```

#### Error Response `422 Unprocessable Entity (SCAN_FAILED)`
```jsonc
{
  "code": "SCAN_FAILED",
  "message": "The uploaded file failed the security malware scan and has been quarantined.",
  "details": {
    "fileName": "Police_Clearance_Infected.pdf",
    "scanEngine": "DIEZ-AV-Gateway",
    "reason": "Threat detected: EICAR-Test-File"
  }
}
```

---

### 2.3 POST `/api/v1/vendor/onboarding/{onboardingId}/documents/{documentCode}/replace`

Replaces an existing document. The previous file is retained until the newly uploaded file clears the malware scan and validation checks, preventing accidental deletion of valid files if a replacement scan fails.

#### Request Headers & Body
Same as upload (`multipart/form-data`).

#### Success Response `200 OK`
Returns the updated `VendorDocument` row with new file metadata and updated scan results.

---

### 2.4 POST `/api/v1/vendor/onboarding/{onboardingId}/signature/send`

Dispatches the e-signature envelope for the NDA to the candidate via DocuSign.

#### Success Response `200 OK`
```jsonc
{
  "templateName": "DIEZ Outsourced Resource NDA",
  "envelopeStatus": "SENT",
  "signers": [
    { "order": 1, "name": "Samir Rahman", "role": "Candidate", "status": "PENDING" },
    { "order": 2, "name": "DIEZ Representative", "role": "DIEZ", "status": "PENDING" }
  ],
  "previewUrl": "/api/v1/vendor/onboarding/ONB-2026-0061/signature/preview",
  "sentAt": "2026-08-24T09:00:00Z",
  "signedAt": null
}
```

---

### 2.5 PUT `/api/v1/vendor/onboarding/{onboardingId}/draft`

Auto-saves optional document entries, metadata, or draft notes. Debounced by the client at 2000ms.

#### Request Body
```jsonc
{
  "optionalDocuments": [
    {
      "code": "OPT_CERT_01",
      "label": "CISSP Certificate",
      "status": "UPLOADED",
      "file": {
        "id": "file-cert-001",
        "name": "CISSP_Samir.pdf",
        "sizeBytes": 1048576
      },
      "expiresOn": "2028-05-15",
      "isOptional": true
    }
  ]
}
```

#### Success Response `200 OK`
```jsonc
{
  "success": true,
  "savedAt": "2026-08-24T09:05:00Z"
}
```

---

### 2.6 POST `/api/v1/vendor/onboarding/{onboardingId}/submit`

Final submission of candidate onboarding documents to DIEZ.

#### Request Body
```jsonc
{
  "idempotencyKey": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d"
}
```

#### Success Response `200 OK`
```jsonc
{
  "success": true,
  "receiptNumber": "RCT-2026-0824-0014",
  "submittedAt": "2026-08-24T09:30:00Z",
  "receiptDownloadUrl": "/api/v1/vendor/onboarding/ONB-2026-0061/receipt/RCT-2026-0824-0014.pdf",
  "nextStage": "DIEZ_REVIEW"
}
```

#### Error Response `409 Conflict (SCAN_FAILED)`
```jsonc
{
  "code": "AMENDMENT_OR_ONBOARDING_SCAN_FAILED",
  "message": "Submission blocked: one or more documents failed malware scanning.",
  "details": {
    "failedDocumentCodes": ["POLICE_CLEARANCE"],
    "fileNames": ["Police_Clearance_Infected.pdf"]
  }
}
```

#### Error Response `422 Unprocessable Entity (DOCUMENT_MISSING)`
```jsonc
{
  "code": "DOCUMENT_MISSING",
  "message": "All required documents must be uploaded and approved or under review before submission.",
  "details": {
    "missingCodes": ["EMIRATES_ID"]
  }
}
```

#### Error Response `422 Unprocessable Entity (SIGNATURE_PENDING)`
```jsonc
{
  "code": "SIGNATURE_PENDING",
  "message": "The NDA must be signed before submission.",
  "details": {
    "envelopeStatus": "SENT"
  }
}
```

---

## 3. Integration & Implementation Flags

Per `GAP-ANALYSIS.md` §1.3:
- File Storage (S3 / Azure Blob) and Server-side Malware Scanning are listed as not yet built in the backend.
- The frontend implements full API interfaces, data hooks, and fixtures with explicit TODO markers:
  - `// TODO(file-storage): wire real upload when the storage service ships`
  - `// TODO(malware-scan): wire real scan results when the scanning service ships`
