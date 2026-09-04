# Interview Planning — API Contract (v1)

> 🚨 **CRITICAL ARCHITECTURAL INVARIANT 1 — ANONYMISED EVALUATION BOUNDARY (BLIND REVIEW):**  
> **THE INTERVIEWER MUST NEVER RECEIVE VENDOR IDENTITY IN ANY PAYLOAD ON THIS ROUTE, INCLUDING ERROR MESSAGES.**  
> The communication relay is entirely server-side. Interviewers communicate with candidates via the anonymous vendor relay. Under no circumstances may vendor names, vendor IDs, vendor contact details, or vendor quotations be returned in responses, headers, debug info, or validation error messages.  
> *(Reference: `PROCESS-GAP-ANALYSIS.md` §2.4 and `CLAUDE.md` Blind candidate review).*

> 🚨 **CRITICAL ARCHITECTURAL INVARIANT 2 — UTC ISO-8601 TIMESTAMPS:**  
> **ALL SLOT TIMES, BUSY BLOCKS, AND SCHEDULED TIMESTAMPS MUST BE STRICT UTC ISO-8601 STRINGS (e.g. `2026-08-10T06:00:00Z`).**  
> Never send or accept local time strings without timezone offsets (e.g. `10:00:00`). Local times without offsets produce catastrophic, silent scheduling errors for offshore candidates in different timezones (such as Asia/Kolkata).

---

## Route & Authority

- **Frontend Route:** `/app/candidates/interviews/plan/{requestId}`
- **Backend Base Path:** `/api/v1/requests/{requestId}/interviews/planning`
- **Required Permission:** `INTERVIEW.PLAN` (held by interview panel members)
- **Scheduling Authority:** Only the **Main Interviewer** (`isMainInterviewer: true`) has authority to draft, save, or send interview slots, and to request interview bypass (RFP Step 1). Non-main panel members have read-only access.

---

## Endpoints

### 1. Get Interview Planning Workspace

Retrieves the complete interview planning context for a shortlisted requisition, including the candidate queue, interviewer panel, working hours, live calendar availability, collisions, and settings.

```http
GET /api/v1/requests/{requestId}/interviews/planning
```

#### Headers
```http
Authorization: Bearer <token>
Accept: application/json
```

#### Response (`200 OK`)
```jsonc
{
  "request": {
    "id": "OMS-2026-0148",
    "position": "Senior Cybersecurity Analyst",
    "department": "Digital Security",
    "shortlistedCount": 2
  },
  "canSchedule": true,
  "isMainInterviewer": true,
  "readOnlyReason": null,

  "candidates": [
    {
      "candidateRef": "C-014",
      "priority": "P1",
      "status": "AWAITING_REPLY",
      "daysWaiting": 2,
      "methodPreference": "ONLINE",
      "timezone": "Asia/Dubai",
      "isOffshore": false,
      "rescheduleCount": 0,
      "withdrawnSlot": null,
      "proposal": {
        "slots": [
          { "start": "2026-08-10T06:00:00Z", "durationMinutes": 45 },
          { "start": "2026-08-10T10:00:00Z", "durationMinutes": 45 },
          { "start": "2026-08-11T10:00:00Z", "durationMinutes": 45 }
        ],
        "settings": {
          "method": "ONLINE",
          "platform": "MICROSOFT_TEAMS",
          "location": null,
          "replyByDate": "2026-08-08",
          "allowAlternatives": true,
          "allowReschedule": true
        },
        "sentAt": "2026-08-05T09:30:00Z"
      }
    },
    {
      "candidateRef": "C-021",
      "priority": "P2",
      "status": "NOT_SENT",
      "daysWaiting": 0,
      "methodPreference": "NO_PREFERENCE",
      "timezone": "Asia/Dubai",
      "isOffshore": false,
      "rescheduleCount": 0,
      "withdrawnSlot": null,
      "proposal": {
        "slots": [],
        "settings": {
          "method": "ONLINE",
          "platform": "MICROSOFT_TEAMS",
          "location": null,
          "replyByDate": "2026-08-14",
          "allowAlternatives": true,
          "allowReschedule": true
        },
        "sentAt": null
      }
    }
  ],

  "interviewers": [
    {
      "userId": "usr-091",
      "name": "Noura Al Mazrouei",
      "initials": "NA",
      "role": "Lead Security Architect",
      "isMain": true
    },
    {
      "userId": "usr-104",
      "name": "Yousef Al Falasi",
      "initials": "YF",
      "role": "Senior SOC Analyst",
      "isMain": false
    },
    {
      "userId": "usr-118",
      "name": "Omar Al Hashmi",
      "initials": "OH",
      "role": "Infrastructure Manager",
      "isMain": false
    }
  ],

  "availability": {
    "connected": true,
    "source": "OUTLOOK",
    "busy": [
      {
        "userId": "usr-091",
        "from": "2026-08-10T05:00:00Z",
        "to": "2026-08-10T06:00:00Z"
      },
      {
        "userId": "usr-104",
        "from": "2026-08-11T07:00:00Z",
        "to": "2026-08-11T08:30:00Z"
      }
    ],
    "workingHours": {
      "start": "09:00",
      "end": "17:00",
      "timezone": "Asia/Dubai",
      "workingDays": [1, 2, 3, 4, 5]
    }
  },

  "settings": {
    "defaultDurationMinutes": 45,
    "timezone": "Asia/Dubai",
    "platforms": ["MICROSOFT_TEAMS", "ZOOM"],
    "locations": [
      { "id": "loc-hq-rm3", "name": "DIEZ HQ, Meeting Room 3" },
      { "id": "loc-hq-board", "name": "DIEZ HQ, Executive Boardroom" }
    ],
    "defaultReplyDays": 3
  },

  "collisions": [
    {
      "slotStart": "2026-08-11T10:00:00Z",
      "alsoOfferedTo": ["C-021"]
    }
  ],

  "blindBoundary": {
    "vendorHiddenFromInterviewer": true,
    "interviewerHiddenFromVendor": true,
    "relayActive": true
  },

  "bypass": {
    "available": true,
    "requiresApprovalFrom": {
      "name": "Khalid Al Suwaidi",
      "role": "Head of Digital Security"
    }
  }
}
```

---

### 2. Save Candidate Proposal Draft

Saves an in-progress proposal draft for a specific candidate. Autosaved from the client with a 2-second debounce. Does not send or commit slots.

```http
PUT /api/v1/requests/{requestId}/interviews/planning/{candidateRef}/draft
```

#### Request Body
```jsonc
{
  "slots": [
    { "start": "2026-08-10T06:00:00Z", "durationMinutes": 45 },
    { "start": "2026-08-10T10:00:00Z", "durationMinutes": 45 },
    { "start": "2026-08-11T10:00:00Z", "durationMinutes": 45 }
  ],
  "method": "ONLINE",
  "platform": "MICROSOFT_TEAMS",
  "location": null,
  "replyByDate": "2026-08-14",
  "allowAlternatives": true,
  "allowReschedule": true
}
```

#### Response (`200 OK`)
```jsonc
{
  "success": true,
  "savedAt": "2026-08-06T14:15:30Z",
  "candidateRef": "C-014"
}
```

---

### 3. Send Proposed Slots to Candidate

Commits and transmits proposed interview slots to a candidate via the server-side vendor relay. Re-checks calendar availability and slot collisions atomically at send time. Requires an idempotency key.

```http
POST /api/v1/requests/{requestId}/interviews/planning/{candidateRef}/send
```

#### Headers
```http
Authorization: Bearer <token>
Content-Type: application/json
X-Idempotency-Key: <uuidv4>
```

#### Request Body
```jsonc
{
  "slots": [
    { "start": "2026-08-10T06:00:00Z", "durationMinutes": 45 },
    { "start": "2026-08-10T10:00:00Z", "durationMinutes": 45 },
    { "start": "2026-08-11T10:00:00Z", "durationMinutes": 45 }
  ],
  "method": "ONLINE",
  "platform": "MICROSOFT_TEAMS",
  "location": null,
  "replyByDate": "2026-08-14",
  "allowAlternatives": true,
  "allowReschedule": true,
  "idempotencyKey": "a9b8c7d6-e5f4-4321-8765-abcdef123456"
}
```

#### Response (`200 OK` or `201 Created`)
```jsonc
{
  "success": true,
  "message": "3 interview slots sent to candidate C-014 via vendor relay.",
  "candidateRef": "C-014",
  "sentAt": "2026-08-06T14:18:00Z",
  "status": "AWAITING_REPLY"
}
```

---

### 4. Preview Candidate Email (Blind Boundary Modal)

Generates the exact rendered message delivered to the candidate. Verifies client-side and server-side that no interviewer identity, department name, request reference, or vendor identity appears in the communication.

```http
GET /api/v1/requests/{requestId}/interviews/planning/{candidateRef}/preview-email
```

#### Response (`200 OK`)
```jsonc
{
  "subject": "Interview Invitation — Senior Cybersecurity Analyst",
  "bodyText": "You are invited to an interview for the Senior Cybersecurity Analyst position.\n\nMethod: Online (Microsoft Teams)\nDuration: 45 minutes\n\nProposed Times:\n- Mon, 10 Aug 2026 at 10:00 GST (11:30 IST)\n- Mon, 10 Aug 2026 at 14:00 GST (15:30 IST)\n- Tue, 11 Aug 2026 at 14:00 GST (15:30 IST)\n\nPlease confirm your preferred time by 14 Aug 2026.",
  "bodyHtml": "<div class=\"email-preview\">...</div>",
  "candidateRef": "C-014",
  "proposedSlots": [
    {
      "startUtc": "2026-08-10T06:00:00Z",
      "endUtc": "2026-08-10T06:45:00Z",
      "localTimeCandidate": "10:00 – 10:45 GST · 11:30 – 12:15 IST",
      "durationMinutes": 45
    }
  ],
  "replyByDate": "2026-08-14",
  "method": "ONLINE",
  "platformOrLocation": "Microsoft Teams",
  "blindBoundaryNotice": "This invitation is transmitted via the secure DIEZ vendor relay. Interviewer names and department details remain private."
}
```

---

### 5. Request Interview Bypass (Exception Route)

Pursuant to RFP Step 6, the Main Interviewer may request to bypass the interview stage with HOD approval. This endpoint creates the approval routing task and does not schedule interview slots.

```http
POST /api/v1/requests/{requestId}/interviews/planning/{candidateRef}/bypass-request
```

#### Request Body
```jsonc
{
  "justification": "Candidate has verified past DIEZ security clearances and directly supervised equivalent scope on our cloud migration project."
}
```

#### Response (`200 OK` or `202 Accepted`)
```jsonc
{
  "success": true,
  "message": "Interview bypass request submitted to Khalid Al Suwaidi for approval.",
  "candidateRef": "C-014",
  "routedTo": "Khalid Al Suwaidi",
  "status": "BYPASS_REQUESTED"
}
```

---

## Server Requirements & Architectural Rationale

### 1. All Slot Times Are UTC ISO Strings
- **Rule:** Every timestamp (`start`, `from`, `to`, `sentAt`) must be formatted as an ISO-8601 UTC string ending in `Z` (e.g. `2026-08-10T06:00:00Z`).
- **Rationale:** Local times lacking timezone offsets are ambiguous. When an offshore candidate in India (`Asia/Kolkata`, UTC+5:30) or Europe receives a local GST time without offset, client calculations produce wrong slots, and this failure is completely silent to both candidate and interviewer. The client handles dual-timezone conversion solely from unambiguous UTC inputs.

### 2. Atomic Re-Check of Availability & Collisions at Send Time
- **Rule:** At the moment of `POST .../send`, the backend must re-query interviewer calendar free/busy blocks and active slot reservations across all candidates.
- **Rationale:** The client workspace shows a point-in-time snapshot. An interviewer’s colleague or another hiring team could book one of the proposed times between page load and final submission. If a collision occurred, the server must return `INTERVIEW_SLOT_TAKEN` with the colliding slot details rather than creating a double-booking.

### 3. The Interviewer Must Never Receive Vendor Identity
- **Rule:** Vendor IDs, vendor corporate names, vendor contact persons, quote details, and relay technical tokens must NEVER appear in any response payload or error message on `/api/v1/requests/{requestId}/interviews/planning/*`.
- **Rationale:** This is the core anonymised evaluation boundary established in RFP Blind Review rules (`PROCESS-GAP-ANALYSIS.md` §2.4). Anonymised candidate references (`C-014`, `C-021`) are used exclusively. If a vendor identifier leaks into the DOM or network payload, the legal integrity of the public tender evaluation is compromised.

### 4. Main Interviewer Exclusive Scheduling Authority
- **Rule:** Only the designated Main Interviewer (`isMainInterviewer === true`) can save drafts, send slots, or submit bypass requests.
- **Rationale:** Per RFP Step 1, a single lead interviewer holds scheduling authority for the panel to avoid conflicting messages, multiple contradictory invitations, or uncoordinated bypass submissions. Non-main interviewers are presented with a read-only view with scheduling action buttons completely removed.

### 5. Mandatory Idempotency on Send
- **Rule:** The `X-Idempotency-Key` header (UUIDv4) is mandatory on all `POST .../send` requests. The key must be generated when the confirmation modal opens and reused across automatic or user-initiated network retries.
- **Rationale:** Network delays or repeated clicks must never fire duplicate relay emails or lock multiple duplicate calendar slots.

### 6. Strict Validation of Reply-By Date
- **Rule:** `replyByDate` must be strictly earlier than the earliest proposed slot date (`replyByDate < earliestSlotDate - 1 day`). Minimum response window is 1 working day.
- **Rationale:** Offering a candidate a slot on Monday 10 August while giving them until Monday 10 August to reply causes missed interviews and planning paralysis. If `replyByDate >= earliestSlot`, the server rejects with `INTERVIEW_REPLY_DATE_INVALID`.

### 7. Bypass Requests Route to HOD and Schedule Nothing
- **Rule:** A bypass submission must create an administrative approval task for the Head of Department (HOD) and transition the candidate state to `BYPASS_REQUESTED`. It must not allocate calendar slots or notify the vendor relay.
- **Rationale:** RFP Step 6 dictates that bypassing interviews is an exceptional administrative concession. If the HOD rejects the bypass request, the candidate returns cleanly to `NOT_SENT` (Shortlisted) so interviews can be scheduled normally.

---

## Error Codes & Payloads

Errors return structured JSON:

```jsonc
{
  "statusCode": 409,
  "code": "INTERVIEW_SLOT_TAKEN",
  "message": "The slot on Tue 11 Aug at 14:00 GST was booked by a colleague since this page loaded.",
  "slotStart": "2026-08-11T10:00:00Z"
}
```

| Error Code | HTTP Status | Plain Language Message | Client Behavior |
| :--- | :--- | :--- | :--- |
| `INTERVIEW_SLOT_TAKEN` | `409 Conflict` | "This slot was booked by a colleague since this page loaded. Please choose another." | Highlights the conflicting slot in red on calendar. Does NOT auto-resubmit. |
| `INTERVIEW_RELAY_UNAVAILABLE` | `503 Service Unavailable` | "Slots can't be sent right now. Save as a draft and try again shortly." | Prompts user to save draft; displays blocking system banner. |
| `INTERVIEW_NOT_MAIN` | `403 Forbidden` | "Only the main interviewer can send slots." | Refreshes workspace into read-only mode. |
| `INTERVIEW_REPLY_DATE_INVALID` | `422 Unprocessable` | "The reply deadline must be at least 1 day before the earliest proposed slot ({earliestSlot})." | Focuses reply-by picker with maximum valid date constraint. |
| `INTERVIEW_NO_SLOTS` | `400 Bad Request` | "Please propose at least one interview slot." | Highlights slot picker guidance. |
| `INTERVIEW_ALREADY_CONFIRMED` | `409 Conflict` | "An interview has already been confirmed for this candidate." | Transitions workspace to Confirmed view. |
