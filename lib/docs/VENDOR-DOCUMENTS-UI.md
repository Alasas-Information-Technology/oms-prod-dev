# Candidate Documents & E-signature — Vendor Portal

Route: `/vendor/onboarding/{onboardingId}/documents`

**UI-only build.** Part 5 defines the API contract. First vendor-portal screen
built — reuses the `AttachmentList` scanning-state pattern from
`CLARIFICATION-RESPONSE-UI.md`, the 4px progress rail from
`INTERVIEW-PLANNING-UX.md`, and the semantic colour tokens from
`DASHBOARD-VISUAL-LANGUAGE.md`. Portal isolation per `CLAUDE.md`: this route is
`VENDOR`-only, and an `INTERNAL` user must never reach it.

**Two flags before design:** the file storage service and malware scanning are
listed as not-yet-built in `GAP-ANALYSIS.md` §1.3. This page depends on both.
Build against fixtures with `TODO` markers, per usual.

---

## Part 1 — Gaps in the reference

### 1.1 Document Health doesn't reconcile with the rows 🔴

Required 4, Uploaded 3, Approved 1, Expiring within 90 days 1, Missing 1. Four
rows are visible (Passport, Emirates ID, Police Clearance, NDA); none show
Missing.

**Health must be a derived view, never an independently entered figure.**
Compute every count from `documents[].status` client-side from a single source
of truth, or — better — have the server return both from the same query so
they can never diverge. Either way, one wrong number here is the first thing a
vendor coordinator will distrust about the whole page.

### 1.2 "Callback status" is an engineering leak

A Vendor Coordinator doesn't operate DocuSign webhooks. Remove it, or if signal
delay genuinely matters to the user, rename to something a business user
understands: *"Signature link"* status — Not sent, Sent, Viewed, Signed.

### 1.3 Two competing primary actions

"Send for E-signature" and "Submit Documents to DIEZ" are both solid
dark-teal. Only the page-level submit should carry that weight. "Send for
E-signature" is a document-level action scoped to the DocuSign panel — it
becomes secondary, contained within that card.

### 1.4 No onshore / offshore branching 🔴

RFP Step 8 defines two document sets:

| Location | Required |
| :--- | :--- |
| Onshore | Passport, Emirates ID, Police Clearance, NDA |
| Offshore | Passport, National ID, NDA |

The reference hardcodes onshore. The document list must be driven by
`candidate.residentStatus`, with the requirement set coming from the server —
never assumed in the UI.

### 1.5 Masking direction is backwards — flag, don't silently fix

Per the RFP, **the vendor is who enters** the candidate's mobile and email in
Step 1. Masking it back to them on this review step doesn't reduce exposure —
it makes the person who typed it unable to verify what they typed.

This may be deliberate (limiting exposure even for the original submitter, in
case of vendor staff turnover) or an oversight in the reference. **Raise it as
a question rather than reversing it unilaterally** — see Part 7.

### 1.6 No rejected state

Step 4 of 5 is "DIEZ Review." Nothing on this page shows what a rejected
document looks like, and that vocabulary must exist before that step is built.
Add it to the status model now: **Rejected**, with a reason and a re-upload
action, distinct from *Uploaded* (submitted, not yet reviewed).

### 1.7 No malware scan failure state

Every row shows "Malware passed." The cybersecurity architecture mandates
server-side scanning as a blocking control — there must be a **Scan failed**
state that blocks submission and names the file, not just a passing state.

### 1.8 Expiry proximity isn't flagged

Police Clearance expires 30 Oct 2026 — inside the 90-day window the system
elsewhere treats as "expiring soon." Nothing here highlights it. Reuse the
same amber threshold as the rest of the system (§1.10 of
`PROCESS-GAP-ANALYSIS.md`), not a page-specific rule.

### 1.9 The security strip is six icons of noise

Six shield icons in a row, repeated on every page, dilutes rather than
reassures. Collapse to **one trust indicator** — a shield with "Secure" — that
expands on click or hover to the same six facts. Present, not shouted.

### 1.10 Timezone abbreviation is ambiguous for this audience

*"Audit time: 24 Aug 2026, 08:15 GST"* — for a candidate whose nationality is
India, "GST" reads as the tax, not Gulf Standard Time. Spell it out: *"Gulf
Standard Time"* or use the offset, `+04:00`.

### 1.11 The stepper

Same issue as every other multi-stage screen in this build. Replace the large
five-node horizontal stepper with the **4px progress rail** from
`INTERVIEW-PLANNING-UX.md` Part 3.

### 1.12 No joining-date pressure

Expected joining is shown top-right as a fact, not a deadline. If documents
aren't complete with enough lead time, joining slips. Add the same deadline
severity treatment used elsewhere in the system.

### 1.13 No upload interaction shown

The reference only shows already-uploaded rows. The actual drag-and-drop,
progress, retry and remove interaction needs building — reuse
`AttachmentList`'s scanning states rather than inventing a second pattern.

---

## Part 2 — Layout

```
Onboarding / ONB-2026-0061
Candidate documents & e-signature                    [Save draft] [Submit]
▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬░░░░░░░░░░░░░░░░░░░░  Required documents · 2 of 5
────────────────────────────────────────────────────────────────────────────
 Candidate C-014 · Senior Cybersecurity Analyst · Onshore
 Joining 1 Sep 2026 · 8 days left to complete documents
────────────────────────────────────────────────────────────────────────────
┌──────────────────┬──────────────────────────────────┬────────────────────┐
│ CANDIDATE         │ REQUIRED DOCUMENTS — ONSHORE   3/4│ SIGNATURE          │
│ ▸ View details    │                                    │ NDA — DIEZ         │
│                   │ Passport (bio page)                │ Outsourced Resource│
│ Samir Rahman      │ Passport_Samir.pdf         ✓ Approved│ NDA               │
│ India · Onshore   │ Expires 14 Mar 2031                 │                    │
│ Joining 1 Sep 2026│ ─────────────────────────────────  │ ① Samir Rahman     │
│                   │ Emirates ID                         │    (candidate)     │
│ ✓ Privacy notice  │ EID_Samir.pdf              ○ In review│ ② DIEZ            │
│   acknowledged    │ Expires 21 Nov 2027                 │    representative  │
│                   │ ─────────────────────────────────  │                    │
│ 🛡 Secure  ▾      │ Police Clearance                    │ Not sent yet       │
│                   │ Police_Clearance.pdf        ⚠ Uploaded│ [Send for signature]│
│                   │ Expires 30 Oct 2026 · soon           │                    │
│                   │ ─────────────────────────────────  │ [Preview NDA]       │
│                   │ NDA                                 │                    │
│                   │ Signature required          ✎ Pending│                    │
│                   │                                      ├────────────────────┤
│                   │ Optional documents (0)          ▾   │ DOCUMENT HEALTH     │
│                   │                                      │ Required        4  │
│                   │ + Add a document                    │ Uploaded        3  │
│                   │                                      │ Approved        1  │
│                   │                                      │ Expiring soon   1  │
│                   │                                      │ Missing         0  │
└──────────────────┴──────────────────────────────────┴────────────────────┘
 🛈 Documents are shared only with authorized DIEZ personnel. A receipt is
    issued on submission.
```

Grid `260px 1fr 320px`, 24px gap. Below 1280px right column stacks; below
1024px single column, signature panel last.

---

## Part 3 — Document status model 🔴

One enum, used everywhere on this page — the row, the health panel, and the
top badge all read from it. Nothing is entered twice.

| Status | Meaning | Colour |
| :--- | :--- | :--- |
| `NOT_STARTED` | No file, not yet due | Neutral |
| `UPLOADED` | Submitted, awaiting scan | Info |
| `SCAN_FAILED` | Failed malware scan — **blocks submission** | Danger |
| `UNDER_REVIEW` | Passed scan, awaiting DIEZ review | Info |
| `APPROVED` | Reviewed and accepted | Success |
| `REJECTED` | Reviewed and declined — reason shown, re-upload required | Danger |
| `PENDING_SIGNATURE` | Awaiting e-signature, not a file upload | Warning |
| `MISSING` | Required, nothing provided, past a reasonable point | Danger |

**Document Health is computed by counting rows in each status** — never a
separate field the server or client sets independently. Write it as a pure
function of the row list.

### Row anatomy

```
Police Clearance                                          ⚠ Uploaded
Police_Clearance.pdf                          Expires 30 Oct 2026 · soon
✓ Malware scan passed · ✓ File type valid
[ View ]  [ Replace ]
```

- Rejected rows show the reason inline in danger tone, with **Replace**
  as the primary action on that row.
- Expiry within 90 days gets the amber *"· soon"* suffix, consistent with the
  rest of the system's expiry treatment.
- `SCAN_FAILED` shows the failure reason and blocks the page-level Submit,
  with a banner naming which file.

---

## Part 4 — Panels

### 4.1 Candidate summary

Name, nationality, resident status, joining date. **Read-only reference** —
badge it *"From your submission"* so it's clear this isn't an editable form on
this step; personal details were entered in step 1.

Privacy acknowledgement status. Collapsed **Secure** trust indicator per §1.9,
expanding to the six original facts on click.

### 4.2 Required documents

Header states the count and the location-driven set: *"Required documents —
Onshore · 3/4."* Changing nothing about which documents appear — that's
server-driven from `residentStatus`.

Optional documents collapse by default, matching the reference's pattern.

**Upload interaction** reuses `AttachmentList`: drag-and-drop or button,
stated size/type limits before upload, scanning state, then the row updates to
its resulting status.

### 4.3 Signature

NDA template name, signer order by name and role, envelope status in plain
language (Not sent, Sent, Viewed, Signed, Declined), and **Send for
signature** as the only accent-weight action in this panel — never matching the
page-level Submit.

**Preview NDA** opens the actual document text before sending, so the vendor
coordinator isn't sending something unseen.

### 4.4 Document health

Derived counts per Part 3. Missing shown even at zero, in neutral — a
reassurance, not just a warning when non-zero.

---

## Part 5 — API contract

Document as `docs/VENDOR-DOCUMENTS-API-CONTRACT.md`.

```
GET /api/v1/vendor/onboarding/{onboardingId}/documents
```

```jsonc
{
  "onboardingId": "ONB-2026-0061",
  "candidateRef": "C-014",
  "position": "Senior Cybersecurity Analyst",
  "candidate": {
    "fullName": "Samir Rahman", "nationality": "India",
    "residentStatus": "ONSHORE" | "OFFSHORE",
    "expectedJoining": "2026-09-01",
    "email": "samir.rahman@example.com", "mobile": "+971 50 123 4567",
    "privacyNoticeAcknowledged": true
  },

  "canEdit": true,
  "readOnlyReason": null,

  "requiredDocuments": [{
    "code": "PASSPORT", "label": "Passport (bio page)",
    "status": "APPROVED",
    "file": { "id": "…", "name": "Passport_Samir.pdf", "sizeBytes": 0 },
    "expiresOn": "2031-03-14", "expiringWithinDays": null,
    "malwareScanPassed": true, "fileTypeValid": true,
    "rejectionReason": null
  }, {
    "code": "NDA", "label": "NDA", "status": "PENDING_SIGNATURE",
    "file": null, "expiresOn": null, "expiringWithinDays": null,
    "requiresSignature": true
  }],
  "optionalDocuments": [],

  "signature": {
    "templateName": "DIEZ Outsourced Resource NDA",
    "envelopeStatus": "NOT_SENT" | "SENT" | "VIEWED" | "SIGNED" | "DECLINED",
    "signers": [{ "order": 1, "name": "Samir Rahman", "role": "Candidate" },
                { "order": 2, "name": "DIEZ Representative", "role": "DIEZ" }],
    "previewUrl": "…"
  },

  "deadline": { "joiningDate": "2026-09-01", "daysRemaining": 8,
                "severity": "NORMAL" | "WARNING" | "CRITICAL" },

  "receiptIssued": false
}
```

```
POST …/documents/{documentCode}/upload      (multipart, returns updated row)
POST …/documents/{documentCode}/replace
POST …/signature/send
PUT  …/draft
POST …/submit    { idempotencyKey }
```

### Server requirements

1. **`requiredDocuments` is generated from `residentStatus`**, never hardcoded
   client-side.
2. **Document Health counts are computed from the same row data** returned in
   this response — client and server must never disagree on a total.
3. **Malware scanning blocks submission.** A `SCAN_FAILED` row makes submit
   unavailable server-side, not only in the UI.
4. **Only the assigned vendor coordinator for this onboarding may edit.**
   `canEdit` governs the page; others get read-only.
5. Idempotency key mandatory on submit.
6. Full contact details (`email`, `mobile`) are returned **unmasked** to the
   vendor who owns this onboarding record — see the open question in Part 7
   before building any masking logic.

---

## Part 6 — Prompts

Written for Antigravity.

### VD1 — Portal check and contract

```
CONTEXT
Repo: OMS frontend. Next.js 16, React 19, TypeScript, Tailwind 4, shadcn/ui.
Read first:
  docs/VENDOR-DOCUMENTS-UI.md          (this spec)
  docs/CLARIFICATION-RESPONSE-UI.md    (AttachmentList component)
  docs/INTERVIEW-PLANNING-UX.md        (progress rail, colour tokens)
  docs/GAP-ANALYSIS.md                 (section 1.3 — file storage not built)
  CLAUDE.md                            (portal isolation rules)

This is the FIRST vendor-portal screen in this build. Confirm the boundary
before writing anything.

TASK 1 — Audit portal isolation
Report only, no code:
  a) Does /vendor/* exist as a separate layout from /app/*? Show the file
     structure.
  b) Confirm an INTERNAL user session cannot reach /vendor/* routes and a
     VENDOR user cannot reach /app/* routes, per CLAUDE.md. If this is not
     already enforced, flag it as a blocking prerequisite — do not proceed to
     TASK 2 until this is confirmed or explicitly deferred with my sign-off.
  c) Confirm the vendor shell uses the same design tokens (colours, spacing,
     type scale) as the internal shell, but its own navigation and branding
     ("OEMS Vendor Portal"), consistent with the reference.

TASK 2 — Write docs/VENDOR-DOCUMENTS-API-CONTRACT.md
Transcribe Part 5 in full: the GET, upload, replace, signature send, draft and
submit endpoints, every payload shape, and all six server requirements.

State requirement 2 prominently: Document Health counts must be computed from
the SAME row data in the response. The reference this replaces shows Required
4 / Uploaded 3 / Approved 1 / Expiring 1 / Missing 1 against only 4 visible
rows with none actually missing — the numbers do not reconcile, which is
exactly what this requirement prevents.

State requirement 1 prominently: requiredDocuments is server-generated from
residentStatus. Onshore needs Passport, Emirates ID, Police Clearance, NDA.
Offshore needs Passport, National ID, NDA. Never hardcode one set.

TASK 3 — Types in src/types/vendor-documents.ts
Model status as the Part 3 enum exactly. Health must be a TYPE-LEVEL derived
value, not a field the fixture sets independently — implement it as a pure
function over the document array, and use that same function wherever health
is displayed.

TASK 4 — Fixtures in src/lib/vendor-documents/fixtures.ts, FIVE cases:
  a) Reference case, onshore, C-014, 3 of 4 uploaded, one pending signature.
  b) OFFSHORE candidate — different required document set (Passport, National
     ID, NDA only).
  c) A SCAN_FAILED row, to test the blocking state.
  d) A REJECTED row with a reason, to test re-upload.
  e) Deadline CRITICAL — 2 days remaining to joining.

TASK 5 — Data hooks in src/lib/vendor-documents/api.ts matching the existing
pattern, with a 2s debounced draft save.

Add TODO markers wherever this depends on the file storage or malware scanning
services flagged as not-yet-built in GAP-ANALYSIS.md — e.g.
// TODO(file-storage): wire real upload when the storage service ships
// TODO(malware-scan): wire real scan results when the scanning service ships

No UI in this task.
```

🛑 Do not proceed past TASK 1(b) without confirming portal isolation.

✅ `feat(vendor-documents): portal audit, contract and fixtures`

---

### VD2 — Shell, deadline, candidate panel

```
CONTEXT
Read docs/VENDOR-DOCUMENTS-UI.md 1.11, 1.12, Part 2, 4.1.

TASK 1 — Route and shell
/vendor/onboarding/[onboardingId]/documents, inside the vendor portal layout.
Breadcrumb: Onboarding / ONB-2026-0061.
Sub-line: candidate, position, resident status.
Page-bar actions: Save draft (ghost), Submit (primary).

TASK 2 — Progress rail
Replace the large five-node stepper from the reference with the 4px progress
rail from INTERVIEW-PLANNING-UX.md Part 3: "Required documents · 2 of 5",
hover popover for the full five-stage detail. Same component used across the
internal portal — the vendor portal follows the same design system, just its
own navigation shell.

TASK 3 — Deadline per 1.12
Context line: "Joining 1 Sep 2026 · 8 days left to complete documents."
Same severity escalation as elsewhere: neutral over 7 days, amber 3-7, red
under 3, stating that joining is at risk. Test with fixture (e).

TASK 4 — Candidate panel, 260px
Name, nationality, resident status, joining date, all read-only, with a
"From your submission" label so it is clear this is reference, not an editable
form on this step.
Privacy acknowledgement status.
Collapsed Secure trust indicator per 1.9 and 4.1: one shield, expanding on
click to the six original facts (signed session, file types validated,
malware scans, encryption, access audited, consent recorded). Do not render
six icons across the page by default — that dilutes the signal on every
screen it appears on.

TASK 5 — Timezone per 1.10
Anywhere a timestamp with GST appears, spell it "Gulf Standard Time" or use
the +04:00 offset. Never the bare abbreviation "GST" — for this candidate
population it reads as a tax reference, not a timezone.
```

✅ `feat(vendor-documents): shell, deadline and candidate panel`

---

### VD3 — Document status model and rows 🔴

```
CONTEXT
Read docs/VENDOR-DOCUMENTS-UI.md Part 3, 1.4, 1.6, 1.7, 1.8. Plan first and
show me the plan.

This is the core of the page.

TASK 1 — Status enum and derived health
Implement the Part 3 enum exactly: NOT_STARTED, UPLOADED, SCAN_FAILED,
UNDER_REVIEW, APPROVED, REJECTED, PENDING_SIGNATURE, MISSING.

Write computeDocumentHealth(documents) as a pure function returning the
Required/Uploaded/Approved/Expiring/Missing counts FROM THE ROW DATA. This
function is the single source of truth for the health panel AND the page-level
status badge — nothing else may set these numbers independently. Unit test it
against fixture (a) and confirm the counts match the visible rows exactly.

TASK 2 — Location-driven document list per 1.4
Render requiredDocuments exactly as returned by the API — do not filter or
reorder based on assumed onshore/offshore logic in the client. Test against
fixture (b), the offshore case, and confirm Emirates ID does not appear while
National ID does.

TASK 3 — Row anatomy per Part 3
Document name, status badge, filename, expiry with the ".soon" suffix inside
90 days (reuse the same threshold and colour as the rest of the system's
expiry treatment — do not invent a new one), scan and file-type checks, and row
actions (View, Replace).

TASK 4 — Rejected state per 1.6
REJECTED rows show the reason inline in danger tone. Replace is the primary
action on that row specifically. This vocabulary must exist now even though
the DIEZ Review step is not yet built — it is the state that step will produce.

TASK 5 — Scan failed state per 1.7
SCAN_FAILED rows show the failure reason and a danger-tone banner naming the
file. The page-level Submit is DISABLED while any row is in this state, with
the reason stated next to the button, not only in the row.

TASK 6 — Expiry proximity per 1.8
Any document expiring within 90 days gets the amber "soon" treatment,
consistent with the rest of the system.

In your plan, state how you will prevent the health counts and the visible
rows from ever disagreeing, given this was the primary defect in the
reference.
```

🛑 Read the plan. Then verify the health unit test passes against all five
fixtures before continuing.

✅ `feat(vendor-documents): document status model and rows`

---

### VD4 — Upload interaction

```
CONTEXT
Read docs/VENDOR-DOCUMENTS-UI.md 1.13, 4.2.

TASK 1 — Reuse AttachmentList
Adapt the AttachmentList component from CLARIFICATION-RESPONSE-UI.md for this
page rather than building a second upload pattern. Drag-and-drop plus a
button, accepted types and size limit stated BEFORE upload, a scanning-pending
state, then the row resolves to UPLOADED, SCAN_FAILED, or UNDER_REVIEW based
on the result.

TASK 2 — Replace flow
Clicking Replace on an existing row opens the same upload control scoped to
that document. The previous file is retained until the new one clears
scanning, so a failed replace does not leave the requirement empty.

TASK 3 — Optional documents
Collapsed by default, "Optional documents (0)" with a chevron, matching the
reference's pattern. Same row anatomy when expanded.

TASK 4 — Add a document
A "+ Add a document" affordance for anything outside the required and optional
lists, if the API supports it — otherwise omit it and tell me you found no
supporting endpoint.
```

✅ `feat(vendor-documents): upload and replace interaction`

---

### VD5 — Signature panel

```
CONTEXT
Read docs/VENDOR-DOCUMENTS-UI.md 1.2, 1.3, 4.3.

TASK 1 — Panel content
Template name, signer order with names and roles, envelope status in PLAIN
LANGUAGE: Not sent, Sent, Viewed, Signed, Declined.

REMOVE "Callback status" entirely — it is a webhook implementation detail a
Vendor Coordinator has no use for. If signal delay is genuinely useful to
communicate, fold it into the envelope status itself (e.g. "Sent 2 hours ago,
not yet viewed") rather than a separate technical field.

TASK 2 — Action hierarchy per 1.3
"Send for signature" is a SECONDARY action, contained within this panel. It
must never match the visual weight of the page-level Submit button. Only one
solid primary-coloured action exists on this entire page.

TASK 3 — Preview
"Preview NDA" opens the actual document text in a modal before sending. Never
let the vendor coordinator send something they have not seen rendered.

TASK 4 — Sync with the document row
The NDA row in the documents table (VD3) reflects this panel's envelope
status — PENDING_SIGNATURE until signed, then APPROVED or whatever the
post-signature state is. One state, read in two places, never two separate
trackers.
```

✅ `feat(vendor-documents): signature panel`

---

### VD6 — Submit flow

```
CONTEXT
Read docs/VENDOR-DOCUMENTS-UI.md Part 5 server requirements.

TASK 1 — Submit gating
Disabled while any required document is missing, rejected-and-not-replaced, or
SCAN_FAILED, or the NDA is not signed. State the specific blocking reason next
to the button.

TASK 2 — Confirmation
Restate before submitting: the candidate, how many documents are approved
versus pending, the signature status, and that a receipt will be issued.

TASK 3 — Idempotency and success
Key generated once when the confirmation opens, reused on retry.
On success: "Documents submitted to DIEZ. A receipt has been issued." with a
link to download or view the receipt. Advance the progress rail to the next
stage.

TASK 4 — Read-only
When canEdit is false, the whole page renders read-only: no upload controls,
no Send for signature, both page-bar actions ABSENT.
```

✅ `feat(vendor-documents): submit flow`

---

### VD7 — Verify

```
Verify. Report: check | expected | actual | pass.

PORTAL ISOLATION — highest priority
1. Confirm an INTERNAL session cannot open this route and a VENDOR session
   cannot open any /app/* route.

HEALTH RECONCILIATION — highest priority
2. computeDocumentHealth output matches the visible rows exactly for all five
   fixtures. No count is ever set independently of the row data.

DOCUMENT MODEL
3. Offshore fixture shows the correct three-document set, not the onshore
   four.
4. SCAN_FAILED blocks Submit with the reason stated.
5. REJECTED rows show their reason and offer Replace as the primary action.
6. Documents expiring within 90 days show the "soon" treatment in the correct
   colour.

SIGNATURE
7. No "Callback status" or other webhook language appears anywhere on the
   page. Grep for it.
8. Only one solid primary-coloured action exists on the entire page.
9. The NDA row and the signature panel show the same status at all times.

REST
10. Timezone never renders as the bare abbreviation "GST".
11. The trust indicator is collapsed to one icon by default, expanding on
    interaction.
12. Deadline severity escalates correctly; fixture (e) shows the critical
    state.
13. Read-only mode hides all editing controls, not just disables them.
14. Double-clicking Submit fires one request.
15. Responsive 1440, 1280, 1024, 768. Light and dark.
16. No status codes or field keys visible anywhere.
```

🛑 Final gate. Items 1 and 2 are the ones that matter most.

---

## Part 7 — Questions for DIEZ

1. **Should the vendor see full contact details for a candidate they
   submitted,** or masked? §1.5 — the vendor is the one who entered this data
   per RFP Step 8, so masking it back to them prevents the very verification
   this review step exists for. If masking is intentional (e.g. limiting
   exposure against vendor staff turnover), confirm the rule so it can be
   applied consistently rather than guessed.
2. **Does DIEZ counter-sign the NDA,** or is the candidate the sole signer? The
   reference shows two signers; the RFP names the NDA as a document to be
   signed but doesn't specify a DIEZ counter-signature.
3. **What is the document-completion deadline relative to joining date?** The
   RFP ties documents to Step 8 without a stated lead time. Confirm a number so
   the deadline severity treatment can be accurate rather than assumed.
4. **Does a rejected document reopen the whole DIEZ Review stage,** or only
   that document? Affects how the resubmission flow should be built when Step
   4 is specced.
