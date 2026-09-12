# Candidate Joining Readiness — Third Surface

Route: `/c/{token}` (token-scoped, no persistent login)

**Builds on an already-excellent reference** (the uploaded spec). Most of it
transcribes directly into build prompts. This document folds in six
corrections and the pieces the reference assumed already existed but don't
yet: the token-auth mechanism, the demo-data reconciliation, and the API
contract.

---

## Part 0 — What the reference got right, unchanged

Transcribe as specified, no changes needed:

- 44px reduced shell, no sidebar, no `⌘K`
- 4px progress rail, five segments, teal-themed
- T1 unified KPI surface, five columns, T5 segmented tick bar for readiness
  score (never a donut — consistent with every other chart on this build)
- T9 floating-pill table rows for the to-do list
- `AttachmentList` reused verbatim for documents, with the existing expiry
  engine (30/90-day thresholds)
- `TraySlotChip` repurposed for medical and biometric appointment booking
- T10 clean card headers throughout
- Semantic matrix for every status — icon plus text, never colour alone
- Reviewer/reviewer-role anonymity extended to this surface — "the onboarding
  team," never a name
- No financial exposure — zero budget, rate, or margin fields in this
  contract
- Responsive collapse at 1024px and 768px as specified

---

## Part 1 — A third surface, not the vendor portal 🔴

The reference correctly inherits the **teal theme** but calls the auth model
"vendor-like." It isn't — it's genuinely different, and needs its own
mechanism.

| | Internal | Vendor | **Candidate link (new)** |
| :--- | :--- | :--- | :--- |
| Auth | Session, username/password | Session, username/password | **Time-limited token, no account** |
| Backing | `auth.Users`, `UserType=INTERNAL` | `auth.Users`, `UserType=VENDOR` | **No `auth.Users` row at all** |
| Scope | Org scope | One vendor | **One onboarding case, nothing else** |
| Session model | Persistent, revocable | Persistent, revocable | **Single-use link, short expiry, no session to revoke — it just stops working** |

This is deliberately the **lightest possible surface** — a magic link, not an
account. That's the right call for a pre-employment touchpoint: the person
isn't a DIEZ resource yet, so there's nothing to onboard into the user model.

**This also answers an open question from `PROCESS-GAP-ANALYSIS.md` §2.1
(Resource Self-Service).** That flagged a third portal for the outsourced
worker to manage profile, leave, and documents *after* joining. This screen is
different: a lightweight, single-case, pre-joining touchpoint. Reconciled
here: **pre-joining is a token link (this screen); post-joining
self-service is a separate, later product decision** requiring a real
account. Don't conflate the two — building this doesn't answer that question,
it narrows it.

### Token mechanism

New, small, backend addition — not part of Domain 3's user model:

```sql
CREATE TABLE onboarding.CandidateAccessTokens (
    TokenId       UNIQUEIDENTIFIER NOT NULL DEFAULT (NEWSEQUENTIALID()),
    OnboardingId  UNIQUEIDENTIFIER NOT NULL,
    TokenHash     VARBINARY(32)    NOT NULL,   -- SHA-256, same discipline as
                                                -- auth.UserInvitations
    ExpiresAt     DATETIME2(3)     NOT NULL,
    ConsumedCount INT              NOT NULL DEFAULT (0),
    RevokedAt     DATETIME2(3)     NULL,
    CreatedAt     DATETIME2(3)     NOT NULL DEFAULT (SYSUTCDATETIME()),
    CONSTRAINT PK_CandidateAccessTokens PRIMARY KEY (TokenId)
);
CREATE UNIQUE INDEX UX_CandidateAccessTokens_Hash
    ON onboarding.CandidateAccessTokens (TokenHash);
```

- Raw token: 32 random bytes, base64url, emailed once, **never stored** —
  only its hash, same pattern as `DOMAIN-3-USER-ADMINISTRATION.md` §2.2.
- Multi-use within its validity window (the candidate will return to this
  page repeatedly over several days) — not single-use like a password reset.
- Expiry generous (e.g. 14 days) since the candidate isn't checking email
  hourly.
- Expired/revoked/unknown tokens all render the **identical** message —
  same non-enumeration discipline as every invitation flow in this build:
  *"This link is no longer valid. Contact your onboarding coordinator for a
  new one."*

---

## Part 2 — Corrections to the reference

### 2.1 Bank/IBAN details — likely out of scope 🔴

The reference lists "Bank/IBAN details for payroll" as a candidate task. The
RFP's own premise is that OMS **relieves HR of payroll administration** —
these are vendor-employed contractors; the vendor runs payroll, not DIEZ.

**Don't build this as a DIEZ-collected payroll field.** Two reasonable paths:
remove it entirely, or reframe it as *"Banking details for invoice
reconciliation"* collected for Work Completion Report purposes only, clearly
scoped as non-payroll. **Flagged as a question for DIEZ in Part 6** — don't
guess silently on something this close to a stated architectural boundary.

### 2.2 No onshore/offshore branching

The reference assumes one universal task list — pre-employment medical,
biometric enrollment via Saned. These are **onshore-specific** per RFP Step 9.
An offshore candidate doesn't enroll in Saned biometrics; they confirm remote
access readiness instead.

Same principle as `VENDOR-DOCUMENTS-UI.md`'s onshore/offshore document
branching — the task list is **server-generated from `residentStatus`**,
never hardcoded. Onshore gets medical + biometric enrollment; offshore gets a
remote-access-readiness task in their place.

### 2.3 Two "confirm" actions need distinct copy

"Confirm joining date" appears as an early completed to-do item, and "Confirm
I'm Ready to Join" is the final footer gate. Left as the reference wrote them,
these read as duplicates.

They're different events — keep both, name them so the difference is obvious:
- **"Confirm joining date"** — *"I plan to start on this date"* — early,
  low-stakes.
- **"Confirm I'm ready to join"** — *"Everything on my list is done"* — the
  final attestation, gated on every task being complete.

**Neither replaces the RFP's actual trigger event.** Per RFP Step 9, the
*Line Manager* is who officially confirms the joining date, with daily
reminders to vendor and Line Manager until it's confirmed. The candidate's
attestation here is a **supporting signal**, not the system-of-record event —
record both as distinct audit entries so it's never ambiguous which one
formally closes the step.

### 2.4 Add IT/workstation reassurance

RFP Step 9: facility provisioning (desk, IT hardware, biometric access) is
triggered via Saned once approved — but nothing tells the candidate their
side is progressing. Add a status line to "Your First Day" (§6.4):
*"Workstation & IT access: Being prepared"* → *"Ready"*. Read-only, no
action required — pure reassurance that DIEZ's side is moving too.

---

## Part 3 — Demo data reconciliation 🔴

**Extends `demo-data/seed.ts`.** Same discipline as every prior integration —
no parallel dataset.

1. **0148's amendment for C-014 is now `APPROVED`** — by Omar, Fatima, and
   Khalid in sequence, per the existing reapproval route. This unblocks the
   flagship story into onboarding.
2. **`ONB-2026-0061` becomes C-014's real onboarding case**, created as a
   consequence of that approval — matching what `VENDOR-DOCUMENTS-UI.md`
   already assumed. The vendor documents page and this joining-readiness page
   now read the **same onboarding entity**, sliced into two response
   contracts (vendor sees documents + signature; candidate sees the fuller
   readiness checklist, financial fields stripped, identities anonymised).
3. **A token is issued** for `ONB-2026-0061`, giving this page a real
   fixture to open with `residentStatus=ONSHORE`.
4. **Reuse `C-031` / `0102`** (already offshore, already onboarding) as the
   second fixture — proves the onshore/offshore branching from §2.2 without
   inventing a third candidate.

This means the flagship requisition now walks completely, across every
surface built so far: submitted → hierarchy approved → HR reviewed →
sourced (Falcon Tech / Layla) → C-014 evaluated over budget → amendment
approved → onboarding documents → **this joining-readiness screen** → active
resource.

---

## Part 4 — API contract

Document as `docs/CANDIDATE-JOINING-API-CONTRACT.md`.

```
GET  /api/v1/candidate-portal/{token}
```

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
    "documents": { "completed": 4, "total": 4 },
    "offerReference": "LPO-260771",
    "biometricAppointment": "SCHEDULED",
    "joiningConfirmed": true
  },
  "tasks": [{
    "code": "PRE_EMPLOYMENT_MEDICAL", "label": "Pre-employment medical",
    "detail": "Book a slot", "dueAt": "2026-08-26", "status": "DANGER",
    "action": "BOOK_SLOT", "onshoreOnly": true
  }],
  "stepper": [{ "stage": "DOCUMENTS_SUBMITTED", "state": "COMPLETE",
                "completedAt": "…", "actorRole": "onboarding team" }],
  "firstDay": { "location": "…", "reportingTime": "…", "dressCode": "…",
                "whatToBring": [], "itReadiness": "IN_PROGRESS" | "READY" },
  "coordinator": { "name": "Layla Hassan", "role": "Onboarding Coordinator" },
  "readyToConfirm": false,
  "blockingTasksRemaining": 2
}
```

### Server requirements

1. **Candidate Data Isolation.** The payload contains only this `caseId`'s
   fields — no sibling candidates, no vendor, no requisition, no budget data,
   ever, on this route.
2. **`tasks` is generated from `residentStatus`** server-side, per §2.2.
3. **No internal identity anywhere.** Reviewer entries carry role labels
   only. The `coordinator` field is the one deliberate exception — a named
   support contact is meant to be visible, unlike an internal reviewer.
4. Token validated on every request; expired/revoked/unknown all return the
   identical generic response.
5. `readyToConfirm` and `blockingTasksRemaining` are server-computed — the
   client never determines whether the footer CTA is enabled by counting rows
   itself.

---

## Part 5 — Prompts

Written for Antigravity, Gemini 3.8 Flash (high).

### JR1 — Token mechanism and contract

```
CONTEXT
Repo: oms-backend for TASK 1, oms-frontend for TASKS 2-4. Read
docs/CANDIDATE-JOINING-READINESS.md in full first, then CLAUDE.md.

TASK 1 (oms-backend) — Token table and issuance
Create onboarding.CandidateAccessTokens per Part 1's DDL. Implement issuance
(32 random bytes, SHA-256 stored, raw token never persisted) and validation,
following the exact discipline already used for auth.UserInvitations in
Domain 3 - same hashing approach, same non-enumeration response for
expired/revoked/unknown tokens.

TASK 2 (frontend) - Write docs/CANDIDATE-JOINING-API-CONTRACT.md
Transcribe Part 4 in full, all five server requirements with rationale.
State requirement 1 prominently: this is the strictest data-isolation route
in the system - a single wrong join exposes another candidate's case to
someone who only proved control of one email inbox.

TASK 3 - Types in src/types/candidate-portal.ts from Part 4's shape.

TASK 4 - Extend demo-data per Part 3
Mark 0148's amendment for C-014 APPROVED through the existing reapproval
route (Omar, Fatima, Khalid in sequence). Create ONB-2026-0061 as C-014's
resulting onboarding case, ONSHORE. Issue a demo token for it. Confirm
VENDOR-DOCUMENTS-UI.md's existing vendor-side fixture for this same
onboarding case still resolves correctly against the now-approved amendment -
do not create a second onboarding record for the same case.
Do NOT create a parallel fixtures module - extend demo-data/seed.ts and
queries.ts per the established discipline.
```

Commit: `feat(candidate-portal): token mechanism, contract, and demo-data reconciliation`

---

### JR2 — Shell and page bar

```
CONTEXT
Read docs/CANDIDATE-JOINING-READINESS.md Part 0 and Part 1, and the original
uploaded spec section 1-2 for exact layout.

TASK 1 - Reduced shell at /c/[token]
44px minimal bar per the reference section 1: DIEZ mark, "Onboarding ·
Candidate View", theme toggle, single Help entry. No sidebar, no search, no
cross-case navigation of any kind - this route has nothing else to navigate
to.
Teal theme (--brand-teal), not internal indigo.

TASK 2 - Token validation on load
Invalid, expired, revoked, and unknown tokens ALL render the identical
full-page message per Part 1: "This link is no longer valid. Contact your
onboarding coordinator for a new one." No shell chrome on this state. Never
vary the response by which failure occurred.

TASK 3 - Sticky page bar per the reference section 2
Breadcrumb-as-title: "Onboarding · ONB-2026-0061" muted, then "Your Joining
Readiness" as the real heading, candidate reference in mono beneath with
position. Status chip (Ready / Action Needed From You) from the semantic
matrix. Expected joining date in mono tabular-nums. No subtitle.
```

Commit: `feat(candidate-portal): reduced shell and page bar`

---

### JR3 — Progress rail and KPI surface

```
CONTEXT
Read the reference spec sections 3-4, and
docs/INTERVIEW-PLANNING-UX.md Part 3 for the progress rail component -
IMPORT it, do not rebuild it.

TASK 1 - 4px progress rail
Five segments per the reference: Documents Submitted, E-signature, DIEZ
Review, Joining Readiness, Joined. Teal fill for completed segments.
Hover/focus popover shows stage, completion date, and role only for DIEZ
Review - "Reviewed by the onboarding team," never an internal name. Initial
shimmer once on mount only, respecting prefers-reduced-motion.

TASK 2 - T1 KPI surface, five columns
Readiness Score as the T5 segmented tick bar (20 ticks) - explicitly NOT a
donut or ring, consistent with every other chart in this system. Documents
(4/4, T2 weight contrast). Offer reference in mono. Biometric appointment
status chip. Joining confirmation status chip.
100px height, 1px hairline dividers at 8% opacity, per the existing T1 spec.
```

Commit: `feat(candidate-portal): progress rail and KPI surface`

---

### JR4 — To-do list, location-driven 🔴

```
CONTEXT
Read the reference spec section 5, and docs/CANDIDATE-JOINING-READINESS.md
section 2.2. This task implements the correction to the reference.

TASK 1 - To-do table
Columns per the reference: Task, Details, Due, Status, Action. T9 floating
pill rows, 44px, status as icon+text always paired, never colour alone.

TASK 2 - LOCATION-DRIVEN TASK SET - the correction
The task list is NOT universal. Render exactly what the API returns for this
candidate's residentStatus:
  ONSHORE:  pre-employment medical, biometric enrollment (Saned), passport
            photo upload, plus the shared tasks (documents, NDA, joining
            date confirmation)
  OFFSHORE: a remote-access-readiness confirmation task in place of medical
            and biometric enrollment, plus the same shared tasks

Test against BOTH demo fixtures: C-014/ONB-2026-0061 (onshore) and
C-031/0102 (offshore, already seeded). Confirm the offshore fixture shows NO
medical or biometric tasks and DOES show the remote-access task.

TASK 3 - Deadline urgency
Warning at under 2 days, escalating to danger under 24 hours, independent of
manual status - purely date math, recomputed on load. Urgency stated in text
("Urgent: less than 24 hours remaining"), never colour alone, per the
reference section 5's explicit accessibility note.

TASK 4 - Row actions
Inline expand or a modal for the action button - never a full navigation
away from this page. "Book Slot" opens the appointment booking pattern built
in JR5.
```

Commit: `feat(candidate-portal): location-driven to-do list`

---

### JR5 — Right column cards

```
CONTEXT
Read the reference spec section 6 in full, and
docs/CANDIDATE-JOINING-READINESS.md sections 2.3 and 2.4.

TASK 1 - "What You Need To Do Next"
Single highest-priority incomplete item: danger status beats earliest-due
warning. Primary CTA in --brand-teal. Reassurance microcopy beneath: "You'll
get a reminder if this isn't completed in time."

TASK 2 - "Compliance Documents"
Reuse AttachmentList VERBATIM - do not fork it. Apply the existing expiry
engine (critical under 30 days, warning under 90, normal above) to passport,
Emirates ID, visa where applicable. Confirm AttachmentList supports a
per-document MIME override (passport photo needs JPEG/PNG only, distinct from
the general PDF/DOCX/PNG set) - if it doesn't yet, add that capability rather
than forking the component.

TASK 3 - "Book Your Appointments"
Repurpose the TraySlotChip pattern from interview scheduling for medical and
biometric bookings. Selectable radio chips, GST-formatted times, one-click
.ics and Google Calendar add. Keep dual-timezone capability in the component
even though this specific onshore fixture doesn't need it - the offshore
remote-access task (JR4) does not use this component at all, so this stays
simple.

TASK 4 - "Your First Day" - includes the addition from section 2.4
Reporting location, time, dress code, what-to-bring checklist, "Get
Directions" secondary button. ADD an IT readiness status line: "Workstation &
IT access: Being prepared" or "Ready", read-only, sourced from
firstDay.itReadiness. This reassures the candidate that DIEZ's own
provisioning (RFP Step 9's Saned-triggered facility work) is progressing,
without giving them anything to action.

TASK 5 - "Need Help?"
Coordinator name, role, avatar - explicitly NOT subject to the anonymity
rule, since this is a designated visible support contact, not an internal
reviewer. Message and Call actions.

TASK 6 - Joining Date Confirmation - the copy fix from section 2.3
Label this clearly as "Confirm joining date" and its own distinct action from
the footer's final confirmation. Confirmed date in mono, success tone.
"Request Date Change" secondary action if still editable.
```

Commit: `feat(candidate-portal): right-column cards`

---

### JR6 — FAQ, audit trail, footer

```
CONTEXT
Read the reference spec sections 7-9, and
docs/CANDIDATE-JOINING-READINESS.md section 2.3 for the footer copy
correction.

TASK 1 - FAQ accordion
3-5 items per the reference. Standard accordion primitive. Chevron rotation
respects prefers-reduced-motion - instant state change when reduced motion is
set, never a suppressed-but-still-running animation.

TASK 2 - Audit trail
REUSE the existing audit-timeline component from the approvals/budget
modules - do not build a bespoke one for this page. Role labels only for any
internal step ("by the onboarding team"), actual name only where the actor is
external (candidate, vendor) or the designated coordinator.
Record "Candidate confirmed readiness" and "Line Manager confirmed joining"
as TWO DISTINCT entries when both occur - never merge them, since per RFP
Step 9 the Line Manager's confirmation is the actual system-of-record event
and the candidate's is a supporting signal.

TASK 3 - Footer action bar - copy correction from section 2.3
Secondary: "Contact HR" / "Message Coordinator".
Primary, teal: "Confirm I'm ready to join" - distinct wording from "Confirm
joining date" (JR5 task 6), so the two actions never read as duplicates.
DISABLED until every candidate-owned task is complete, with the blocking
reason stated as TEXT next to the button, not just a greyed-out state: "2
tasks still need your attention." Read blockingTasksRemaining from the API,
never compute it client-side.
```

Commit: `feat(candidate-portal): FAQ, audit trail, and footer`

---

### JR7 — Verify

```
CONTEXT
Read docs/CANDIDATE-JOINING-READINESS.md in full.

TASK 1 - Verification. Report: check | expected | actual | pass.

DATA ISOLATION - highest priority
1. The API payload for this route contains no fields belonging to any other
   onboarding case, candidate, vendor, or requisition. Grep the response
   shape and the query used to build it.
2. No budget, rate, or margin field appears anywhere on this route.
3. Expired, revoked, and unknown tokens render the IDENTICAL message with no
   variation in wording or response timing.

ONSHORE/OFFSHORE
4. C-014/ONB-2026-0061 (onshore) shows medical and biometric tasks, no
   remote-access task.
5. C-031/0102 (offshore) shows the remote-access task, no medical or
   biometric tasks.

ANONYMITY
6. No internal reviewer name appears anywhere on this route. The
   coordinator's name is the sole deliberate exception.
7. DIEZ Review stage on the progress rail shows only "the onboarding team."

CONTINUITY
8. 0148's amendment shows APPROVED, and ONB-2026-0061 is reachable as
   C-014's real onboarding case from both this page and the existing vendor
   documents page.
9. Confirm no second onboarding record was created for the same case - grep
   demo-data for duplicate ONB-2026-0061 entries.

COPY AND ACTIONS
10. "Confirm joining date" and "Confirm I'm ready to join" read as clearly
    distinct actions, not duplicates.
11. Both, when triggered, produce SEPARATE audit trail entries.
12. The footer CTA's disabled reason is visible as text, not just a greyed
    button.

REUSE
13. AttachmentList, TraySlotChip, the audit-timeline component, and the 4px
    progress rail are all IMPORTED from their existing locations - grep for
    any duplicate/forked implementation on this route.

REST
14. Deadline urgency escalates from warning to danger under 24 hours, driven
    by date math, independent of manual status.
15. Responsive collapse at 1024px and 768px per the reference section 12.
16. Contrast ratios verified for teal-on-white body and mono numerals, light
    and dark. Report actual ratios.
17. prefers-reduced-motion degrades the stepper shimmer, accordion rotation,
    and skeleton pulse to instant/opacity-only.
```

Final gate. Items 1-3 matter more than everything else on this page combined
— a data leak here exposes one candidate's compliance documents to whoever
guesses or intercepts another candidate's link.

---

## Part 6 — Questions for DIEZ

1. **Bank/IBAN details** — is this genuinely collected by DIEZ, and if so for
   what purpose, given the RFP's stated premise that OMS relieves HR of
   payroll administration? If it's for Work Completion Report reconciliation
   only, say so explicitly in the field's own label so it can never be
   mistaken for payroll processing.
2. **Is the candidate's "Confirm I'm ready to join" attestation used for
   anything operationally**, or is it purely a courtesy status shown to the
   Line Manager — confirm it never substitutes for the Line Manager's own
   RFP Step 9 confirmation.
3. **Token validity window** — 14 days was assumed here. Confirm against
   the typical gap between offer and joining date.
4. **Does the internal "Joining Readiness" mirror screen** (Department
   Head/Line Manager view, referenced by the original spec as already
   existing) actually exist yet, or does `/app/workforce/onboarding`'s list
   view need a matching single-case detail companion built alongside this?
