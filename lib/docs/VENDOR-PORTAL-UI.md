# Vendor Portal — Complete Build

Every remaining page under `/vendor/*`. Builds on the already-shipped
`/vendor/onboarding/{id}/documents` (`VENDOR-DOCUMENTS-UI.md`) and plugs into
the shared dataset from `DEMO-DATA-INTEGRATION.md` — **this does not create a
second isolated dataset.** That was exactly the bug DD1–DD9 fixed on the
internal side.

Route base is `/vendor`, matching the original IA document, not the cropped
five-item sidebar in the reference screenshot.

---

## Part 1 — Information architecture

```
/vendor                              Dashboard
/vendor/requisitions                 Open requirements
/vendor/requisitions/[id]            Requirement detail
/vendor/submissions                  Submit a candidate
/vendor/submissions/history          Submitted candidates + status
/vendor/submissions/[id]/interview   Respond to proposed interview slots  NEW
/vendor/contracts                    Contracts
/vendor/rates                        Rate cards
/vendor/onboarding                   Onboarding cases (index)
/vendor/onboarding/[id]/documents    Documents & e-signature - already built
/vendor/documents                    General compliance documents
/vendor/profile                      Vendor company profile
/vendor/support                      Support / messages
```

**One new route not in the original IA**: `interview`, under submissions. The
RFP routes the interview-slot email to the vendor, not the candidate directly
— *"An email containing a link is sent to the vendor, allowing them to select
a timeslot from the proposed options or request alternative slots."* Without
this page, the vendor has no way to act on that email.

Sidebar groups: **Requirements** (Open requirements), **Candidates** (Submit,
History), **Onboarding**, **Contracts & Rates**, then **Documents**,
**Profile**, **Support** — matching the reference screenshot's flatter feel
while keeping the full IA underneath.

---

## Part 2 — Blind boundary, vendor side (critical)

The internal side hides vendor identity and cost from interviewers. The vendor
side has its own hidden facts, and they need stating explicitly or they'll be
guessed inconsistently across ten pages.

| The vendor sees | The vendor never sees |
| :--- | :--- |
| Position, department, job description, requirements | **Approved/reserved budget for the requirement** — see below |
| Number of resources needed, engagement length, work location | Other vendors invited or their submissions |
| Their own candidates' status: Submitted, Under review, Shortlisted, Interview proposed, Qualified, Not selected | **Why** a candidate wasn't selected — internal evaluation comments, ratings, priority (P1/P2/P3) |
| Interview date/time once confirmed | **Individual interviewer names** — shown as "the hiring team" |
| Their own quoted cost | — |

**Budget concealment is an inference, not explicit RFP text** — RFP defines
the vendor's cost-entry mechanism (Fixed / Negotiable / Pre-Agreed) but never
states whether the approved budget is visible to them. Standard procurement
practice says no: showing it invites vendors to quote exactly at the ceiling
rather than their real rate. **Flagged as a question for DIEZ in Part 8** —
build the concealment now, but confirm before it's load-bearing.

**Interviewer anonymity** matches what `INTERVIEW-PLANNING-UI.md` already
specced (`interviewerHiddenFromVendor: true`) — this document doesn't
introduce it, just carries it forward consistently.

Every page below enforces this server-side per the pattern already
established: the client renders what it's given and is never capable of
showing what it wasn't sent.

---

## Part 3 — Reuse checklist

Nothing here is a new visual language. Import, don't reinvent:

| From | Reused for |
| :--- | :--- |
| `APP-SHELL-SPEC.md` | Breadcrumb-as-title, page bar, content region |
| `INTERVIEW-PLANNING-UX.md` Part 3 | 4px progress rail on submission/onboarding status |
| `DASHBOARD-VISUAL-LANGUAGE.md` / `DASHBOARD-KPI-CARDS-AMENDMENT.md` | Vendor dashboard KPI cards |
| `CLARIFICATION-RESPONSE-UI.md`'s `AttachmentList` | Every upload surface — candidate CVs, contract files, compliance documents |
| `lib/money.ts`, `Amount` component | Every quoted rate, exact, never abbreviated on a submission |
| `VENDOR-DOCUMENTS-UI.md`'s status enum pattern | Submission status, onboarding status — same technique, new enum |
| Persona switcher (`DEMO-DATA-INTEGRATION.md` DD7) | Testing as Layla Hassan |

---

## Part 4 — Pages

### 4.1 Dashboard (`/vendor`)

KPI row: Open requirements, Candidates awaiting review, Interviews to respond
to, Onboarding cases in progress, Documents expiring within 30 days. Reuse
`KpiCard` exactly as built for the internal dashboard.

Below: a compact table of items needing action — mirroring "Needs my action"
from the internal side but scoped entirely to this vendor. Each row links to
the specific page below.

### 4.2 Open requirements (`/vendor/requisitions`)

List of requirements this vendor is invited to submit against. Card or table:
position, department, resources needed, submission window (*"3 of 5 working
days left"*), candidates submitted so far **by this vendor only** — never a
count including competitors.

Closed windows show as read-only with *"Submission window closed."*

### 4.3 Requirement detail (`/vendor/requisitions/{id}`)

Full job description, required experience, work location, engagement length,
submission window and its deadline (same severity treatment as elsewhere —
amber under 2 days, red under 1). **No budget figure anywhere on this page.**

Primary action: **Submit a candidate**, opening 4.4 pre-filled to this
requirement.

### 4.4 Submit a candidate (`/vendor/submissions`)

The core vendor action, and the one place the RFP's cost-entry rules live.

- CV upload via `AttachmentList` — required, with scanning states.
- **Cost entry**, one of three modes, matching RFP Step 4 exactly:
  - **Fixed** — a single amount, money-masked, exact.
  - **Negotiable** — select a grade from the vendor's own published rate
    card (4.6); the rate resolves from there, not a free-text figure.
  - **Pre-Agreed** — read-only, pulled from an existing contract rate for
    this position type.
- Special terms — free text, optional.
- Lead time — number of days, required.
- **Batch limit enforced visibly**: *"7 of 10 CVs in this batch"* — RFP caps
  batches at 10.
- Submitting past the window shows the specific reason, not a generic error.

Confirmation restates: position, cost mode and amount, lead time, and that
this is visible to DIEZ but not to other vendors.

### 4.5 Submitted candidates (`/vendor/submissions/history`)

Table: candidate reference (the vendor's own naming — DIEZ assigns the
anonymised `C-0XX` reference the vendor never sees; this list shows the
vendor's own label plus the DIEZ reference once assigned), requirement,
status, submitted date, cost, lead time.

Status vocabulary — plain, and deliberately **thin** on the rejection side per
Part 2:

| Status | Meaning shown to vendor |
| :--- | :--- |
| Submitted | Awaiting review |
| Under review | DIEZ is reviewing |
| Shortlisted | Selected for interview |
| Interview proposed | **Action needed** — links to 4.5a |
| Interview confirmed | Scheduled, date shown |
| Qualified | Moving to onboarding |
| Not selected | Closed — no further detail |

Rows in "Interview proposed" get a visible badge and sort first — this is the
vendor's most time-sensitive queue item.

### 4.5a Respond to interview slots (`/vendor/submissions/{id}/interview`) NEW

The page the RFP's vendor-routed email links to.

- Proposed slots from the interviewer, each with date, time, and method
  (online/physical/no preference) — reuse the slot-chip visual from
  `INTERVIEW-PLANNING-UX.md`'s plan tray.
- **Interviewer shown only as "The hiring team for {Position}."** Never a
  name.
- Vendor selects one slot, or **requests alternatives** with a short note —
  matching the RFP's "select a timeslot... or request alternative slots."
- Once confirmed, the row becomes read-only with the agreed time and a
  calendar-add action.
- Deadline severity matches the rest of the system.

### 4.6 Contracts (`/vendor/contracts`)

List of the vendor's active and historical contracts with DIEZ: contract
code, work-location type, start/end date, status. Read-mostly — contracts
originate from Procurement, not the vendor.

### 4.7 Rate cards (`/vendor/rates`)

Per RFP Master Data: five templates (DIEZA Premises, UAE Remote WFH, UAE
Remote Vendor Office, Remote Abroad, Pre-Agreed) with a two-level grading
structure.

- Upload via Excel/CSV, matching the RFP's stated mechanism, with a
  downloadable template.
- Parsed preview before submit — grade, level, salary range, service charge —
  editable in a table, not just a file-upload-and-hope.
- **Status: Draft → Submitted for approval → Published.** Procurement
  approves before a rate becomes usable in candidate submissions (4.4's
  Negotiable mode reads only from **Published** rates).
- Effective dates per contract type, per the RFP.

### 4.8 Onboarding (`/vendor/onboarding`)

Index of onboarding cases, each linking to the already-built
`/vendor/onboarding/{id}/documents`. Row: candidate, position, joining date,
document completion (*"3 of 4"*), signature status. Reuses the document
health computation pattern from `VENDOR-DOCUMENTS-UI.md` — never a
separately entered count.

### 4.9 Documents (`/vendor/documents`)

Distinct from candidate onboarding documents — this is the **vendor's own**
compliance repository: trade licence, insurance certificate, ISO
certifications where applicable. Same `AttachmentList` pattern, with expiry
tracking identical to candidate documents.

### 4.10 Profile (`/vendor/profile`)

Company details, primary contact, coordinators (`VENDORUSER.MANAGE` governs
who can be added — Domain 3 rule V8, managed by Procurement, not the vendor
themselves editing their own user list). Read-mostly for the vendor; editable
fields clearly marked.

### 4.11 Support (`/vendor/support`)

A message thread to Procurement. Plain list, compose box, `AttachmentList` for
supporting files. Not the blind-review messaging channel — this is
operational support, general questions, technical issues.

---

## Part 5 — API contract

Document as `docs/VENDOR-PORTAL-API-CONTRACT.md`, following the existing
integer-minor-units money rule throughout. Representative shapes:

```
GET  /api/v1/vendor/dashboard
GET  /api/v1/vendor/requisitions?status=
GET  /api/v1/vendor/requisitions/{id}
POST /api/v1/vendor/submissions          { requisitionId, cv, costMode, amount?, gradeCode?, specialTerms, leadTimeDays }
GET  /api/v1/vendor/submissions/history
GET  /api/v1/vendor/submissions/{id}/interview
POST /api/v1/vendor/submissions/{id}/interview/select     { slotId }
POST /api/v1/vendor/submissions/{id}/interview/request-alternative  { note }
GET  /api/v1/vendor/contracts
GET  /api/v1/vendor/rates
POST /api/v1/vendor/rates/upload         (multipart, returns parsed preview)
POST /api/v1/vendor/rates/{id}/submit-for-approval
GET  /api/v1/vendor/onboarding
GET  /api/v1/vendor/documents
GET  /api/v1/vendor/profile
GET  /api/v1/vendor/support/messages
POST /api/v1/vendor/support/messages
```

### Server requirements

1. **No requisition payload on any `/vendor/*` route includes budget figures.**
   Confirm at the contract level, not just the UI.
2. **No submission payload includes other vendors' data**, including counts.
3. **Rejection reasons are never sent** — only the status code `NOT_SELECTED`.
4. **Interviewer identity is never sent** on the interview-response route.
5. Negotiable-mode cost resolves server-side from the vendor's own published
   rate card — the client sends a grade code, never a computed amount.
6. Every list scoped to the calling vendor only — cross-vendor access returns
   404, not 403.

---

## Part 6 — Demo data tie-in

**Extends `demo-data/seed.ts`. Does not create a parallel dataset** — this is
the same discipline `DEMO-DATA-INTEGRATION.md` established, applied to the
vendor side.

- **Layla Hassan / Falcon Tech Resourcing** becomes the vendor for **C-014 and
  C-021 on 0148** (previously unassigned), in addition to C-030 (0119) and
  C-031 (0102) already seeded. This makes 0148 — the flagship — walkable end
  to end from *both* portals: submit → interview response → evaluation
  (internal) → over-budget amendment (internal, invisible to Layla) →
  onboarding.
- **0141** (Cloud Security Engineer, zero candidates) becomes an **open
  requirement** visible to Falcon Tech with no submissions yet.
- **0161** (rejected, re-sourcing) becomes open again after C-040's rejection
  — Falcon Tech sees it as available with C-040 in their history marked "Not
  selected."
- Add one **published rate card** for Falcon Tech covering the DIEZA Premises
  and UAE Remote (WFH) templates, so 4.4's Negotiable mode has real data to
  resolve against.
- C-021's interview slots, once proposed internally via the suggestion engine,
  should appear in Layla's `/vendor/submissions/{id}/interview` — this is the
  cross-portal proof point for the whole build.

---

## Part 7 — Prompts

Written for Antigravity, Gemini 3.8 Flash (high). Run as one continuous
session; gates stay in place.

### VP1 — Contract, shell, dashboard

```
CONTEXT
Repo: OMS frontend. Read first:
  docs/VENDOR-PORTAL-UI.md             (this spec)
  docs/VENDOR-DOCUMENTS-UI.md          (already-built onboarding page - match
                                        its patterns, do not diverge)
  docs/DEMO-DATA-INTEGRATION.md        (the shared dataset - extend, do not
                                        duplicate)
  docs/INTERVIEW-PLANNING-UX.md        (progress rail, colour tokens)
  CLAUDE.md                            (portal isolation rules)

TASK 1 - Write docs/VENDOR-PORTAL-API-CONTRACT.md
Transcribe Part 5 in full, all six server requirements with rationale. State
requirement 1 prominently: no requisition payload on ANY vendor route includes
budget figures - this is a deliberate concealment, not an oversight, and it
must hold at the API layer so the client is never even capable of rendering
it.

TASK 2 - Vendor shell
Confirm the vendor layout already established for /vendor/onboarding extends
cleanly to the full IA in Part 1. Sidebar groups: Requirements, Candidates
(Submit, History), Onboarding, Contracts & Rates, Documents, Profile, Support.
Same design tokens as the internal portal; distinct navigation and branding,
per the already-confirmed portal isolation.

TASK 3 - Dashboard at /vendor
Five KPI cards per 4.1, reusing KpiCard exactly as built internally: Open
requirements, Candidates awaiting review, Interviews to respond to, Onboarding
in progress, Documents expiring within 30 days.
Below: an action table mirroring "Needs my action," scoped entirely to the
signed-in vendor, each row linking to its specific page.

TASK 4 - Extend demo-data per Part 6
Assign Falcon Tech / Layla Hassan as vendor for C-014 and C-021 on 0148 (in
addition to existing C-030/0119 and C-031/0102). Mark 0141 and 0161 as open
requirements. Add one published Falcon Tech rate card. Extend
demo-data/seed.ts and queries.ts - do NOT create a second fixtures module for
the vendor portal. This is the same discipline the earlier data-integration
work established.

No further pages in this task.
```

Commit: `feat(vendor-portal): contract, shell and dashboard`

---

### VP2 — Requirements and submission

```
CONTEXT
Read docs/VENDOR-PORTAL-UI.md 4.2, 4.3, 4.4, Part 2.

TASK 1 - /vendor/requisitions
List scoped to this vendor's invitations only. Card/row: position, department,
resources, submission window with days remaining, candidates already
submitted BY THIS VENDOR (never a total including competitors). Closed windows
render read-only with the reason stated.
0141 and 0161 must both appear here from the seed.

TASK 2 - /vendor/requisitions/[id]
Full job description, requirements, work location, engagement length,
submission window and deadline with the standard severity colours. NO BUDGET
FIGURE ANYWHERE ON THIS PAGE - grep it when done to confirm. Primary action
opens Submit a Candidate pre-filled to this requirement.

TASK 3 - /vendor/submissions - the core RFP mechanism
Cost entry with three modes exactly as specced:
  Fixed        money-masked single amount
  Negotiable   select a grade from THIS VENDOR'S OWN PUBLISHED rate card; the
               amount resolves from the rate card, never free-typed
  Pre-Agreed   read-only, pulled from an existing contract

CV upload via the existing AttachmentList component - do not build a second
upload pattern.
Batch limit visibly enforced: "7 of 10 CVs in this batch," per the RFP's
10-CV cap.
Lead time required, special terms optional.
Confirmation before submit restates position, cost, lead time, and states this
is visible to DIEZ only, never other vendors.

TASK 4 - Test against the seed
Submit a new candidate against 0141 using the Falcon Tech rate card added in
VP1. Confirm the Negotiable-mode amount resolves from the rate card and not
from a hand-typed figure.
```

Commit: `feat(vendor-portal): requirements and candidate submission`

---

### VP3 — Submission history and interview response (critical)

```
CONTEXT
Read docs/VENDOR-PORTAL-UI.md 4.5, 4.5a, Part 2. This task implements the RFP
mechanism this spec exists to surface: the interview-slot email routes to the
vendor, not the candidate.

TASK 1 - /vendor/submissions/history
Table per 4.5 with the exact status vocabulary given - Submitted, Under
review, Shortlisted, Interview proposed, Interview confirmed, Qualified, Not
selected. "Interview proposed" rows sort first with a visible badge - this is
the vendor's most time-sensitive queue.
REJECTION REASONS ARE NEVER SHOWN. "Not selected" carries no further detail -
grep the payload consumed by this page to confirm no rating, comment, or
priority field is present, per server requirement 3.

TASK 2 - /vendor/submissions/[id]/interview
Proposed slots rendered with the slot-chip visual style from
INTERVIEW-PLANNING-UX.md's plan tray - reuse that visual language, do not
invent a new one.
The interviewer renders ONLY as "The hiring team for {Position}." Grep this
page and its API response for any interviewer name field - none should be
present per server requirement 4.
Vendor selects one slot, or requests alternatives with a short required note
- per the RFP's "select a timeslot... or request alternative slots."
Once confirmed, the page becomes read-only showing the agreed time with a
calendar-add action.
Deadline severity matches the rest of the system: amber under 2 days, red
under 1.

TASK 3 - Connect to the seed
C-021 on 0148 should reach this page once the internal Interview Planning
suggestion engine (already built) proposes slots for that candidate. Confirm
the same underlying slot data appears identically on both the internal
planning page and this vendor response page - this is the cross-portal proof
point the whole vendor portal exists to demonstrate.
```

Verify by hand: as Layla Hassan, open C-021's interview page and confirm no
interviewer name appears anywhere in the rendered DOM or network payload.

Commit: `feat(vendor-portal): submission history and interview response`

---

### VP4 — Contracts and rate cards

```
CONTEXT
Read docs/VENDOR-PORTAL-UI.md 4.6, 4.7.

TASK 1 - /vendor/contracts
List of the vendor's contracts: code, work-location type, start/end date,
status. Read-mostly - contracts originate from Procurement.

TASK 2 - /vendor/rates - the RFP's five-template mechanism
Excel/CSV upload with a downloadable template, per the RFP's stated master
data mechanism.
Parsed preview BEFORE submit: an editable table of grade, level, salary range,
service charge - never a blind file-upload-and-hope.
Status lifecycle: Draft -> Submitted for approval -> Published. Only
Published rates are readable by the Negotiable cost mode in Submit a
Candidate (VP2) - confirm that connection holds: an unapproved rate must not
appear as selectable there.
Five templates per the RFP: DIEZA Premises, UAE Remote (WFH), UAE Remote
(Vendor Office), Remote (Abroad), Pre-Agreed Contracted Rate. Two-level grading
structure per template, with effective start/end dates.

TASK 3 - Verify
Confirm the Falcon Tech rate card seeded in VP1 shows as Published here and
is the one VP2's Negotiable mode actually resolved against.
```

Commit: `feat(vendor-portal): contracts and rate cards`

---

### VP5 — Onboarding index, documents, profile, support

```
CONTEXT
Read docs/VENDOR-PORTAL-UI.md 4.8, 4.9, 4.10, 4.11, and
docs/VENDOR-DOCUMENTS-UI.md for the already-built detail page and its status
model.

TASK 1 - /vendor/onboarding
Index linking to the existing /vendor/onboarding/[id]/documents. Row:
candidate, position, joining date, document completion ("3 of 4" - computed
from the SAME health function already built, never a separate count),
signature status.
Must list both seeded onboarding cases: 0119 (onshore, C-030) and 0102
(offshore, C-031).

TASK 2 - /vendor/documents
The vendor's OWN compliance repository - trade licence, insurance
certificate, certifications. Distinct from candidate onboarding documents.
Reuse AttachmentList and the same expiry-tracking treatment as candidate
documents (90-day "soon" threshold, consistent colour).

TASK 3 - /vendor/profile
Company details, primary contact, coordinators list. Coordinator management
is governed by VENDORUSER.MANAGE, held by Procurement per Domain 3 rule V8 -
the vendor's own profile page is read-mostly for that section, with a note
explaining who can make changes.

TASK 4 - /vendor/support
Message thread to Procurement: list, compose box, AttachmentList for files.
State clearly in the UI that this is general support, distinct from the
blind-review candidate evaluation process - this channel is never used to
discuss a specific candidate's evaluation.
```

Commit: `feat(vendor-portal): onboarding index, documents, profile, support`

---

### VP6 — Verify

```
CONTEXT
Read docs/VENDOR-PORTAL-UI.md in full.

TASK 1 - Verification. Report: check | expected | actual | pass.

BLIND BOUNDARY - highest priority
1. Grep every /vendor/* page and API response for budget/reserved/approved
   amount fields - none.
2. Grep for interviewer name fields on any vendor route - none.
3. Grep for rejection reason, rating, or priority fields on any vendor
   route - none, only NOT_SELECTED as a bare status.
4. Confirm no page shows another vendor's submissions or counts.

PORTAL ISOLATION
5. An INTERNAL session cannot reach any /vendor/* route; a VENDOR session
   cannot reach any /app/* route.

DATA CONNECTION
6. Falcon Tech's dashboard, requirements list, and submission history all
   derive from the SAME demo-data/seed.ts as the internal portal - grep for
   a second vendor-only fixtures module. None should exist.
7. 0141 and 0161 appear as open requirements.
8. C-021's interview slots match exactly between the internal Interview
   Planning page and the vendor's interview response page for the same
   candidate.
9. The Falcon Tech rate card is Published and is what VP2's Negotiable mode
   actually resolves against - not a hand-typed figure.

MONEY
10. Every quoted amount is exact, tabular-nums, via lib/money.ts. No
    abbreviation on a submission or rate card.

REST
11. Document health counts on /vendor/onboarding match the existing computed
    function from VENDOR-DOCUMENTS-UI.md - never a separately entered number.
12. Batch limit visibly enforced at 10 CVs.
13. Responsive 1440, 1280, 1024, 768. Light and dark.
14. No status codes, field keys, or internal terminology visible on any
    vendor-facing screen.

TASK 2 - Extend docs/DEMO-WALKTHROUGH.md
Add a vendor-portal storyline: as Layla Hassan, submit a candidate against
0141, respond to C-021's proposed interview slots, and check the onboarding
status of C-030 and C-031 - the click path a presenter would follow to show
the vendor side alongside the internal side for the same flagship
requisition.
```

Final gate. Items 1-4 matter more than anything else in this build.

---

## Part 8 — Questions for DIEZ

1. **Is the approved budget genuinely hidden from vendors,** or should they see
   a ceiling to guide their quote? Part 2's concealment is inferred from
   standard procurement practice, not stated in the RFP. This is
   load-bearing across the whole submission flow — confirm before it ships.
2. **When a vendor requests alternative interview slots, who re-proposes** —
   does it return to the Main Interviewer's queue, or does the system
   auto-suggest again using the engine already built?
3. **Can a vendor see aggregate performance stats about themselves** (fill
   rate, average time to submit) as a trust signal, or is that internal-only
   reporting?
4. **Rate card approval** — does Procurement review every submitted rate card
   individually, or can some auto-publish under a threshold?
