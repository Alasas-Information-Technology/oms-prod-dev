# Demo Data Integration — Connecting Every Page

Turns fourteen independently-built screens, each with its own isolated fixture,
into one navigable system backed by a single seeded dataset covering 14
requisitions across the full lifecycle.

**No backend changes.** This is entirely `src/lib/demo-data/` plus adapters —
every domain's existing types, components, and API contracts stand.

---

## Part 1 — What's actually broken

### 1.1 Fixtures almost certainly ignore the URL param 🔴

Every domain built so far — Requests, HR Review, Clarifications, Interview
Planning, Interview Evaluation, Budget Amendment, Vendor Documents — was
specced with its own `fixtures.ts` exporting **one reference case**. The data
hook reads `useParams()` but the fixture doesn't branch on it.

**The test:** open `/app/requests/OMS-2026-0148` and
`/app/requests/OMS-2026-0139` right now. If they show the same request, this
is confirmed. Fix it once, in the audit (DD1), before building anything else.

### 1.2 Nothing links between screens

HR Review's clarification banner doesn't link to
`/app/requests/{id}/clarifications/{id}`. Interview Evaluation's over-budget
Qualify doesn't route to `/app/requests/{id}/amendments/{id}`. Candidates
doesn't route to Interview Planning. Each screen was built to be opened
directly, never arrived at.

### 1.3 Fourteen datasets, one coincidental universe

Names like Mariam Al Mansoori, Omar Al Hashmi, and Khalid Al Suwaidi recur
across specs because I reused them for continuity while writing — not because
any two fixture files reference the same object. `OMS-2026-0148` in the HR
Review fixture and `OMS-2026-0148` in the Interview Evaluation fixture are
two unrelated JavaScript objects that happen to share a string.

### 1.4 Two role inconsistencies to fix while unifying

Across the reference screenshots, **Omar Al Hashmi** appears as Line Manager
in one and Section Head in another. **Fixed here**: Omar Al Hashmi is Line
Manager, Fatima Al Marri is Section Head. Applied everywhere in the seed.

---

## Part 2 — Architecture

```
src/lib/demo-data/
├── entities.ts       canonical types: Person, OrgUnit, BudgetLine,
│                      Requisition, Candidate, Interview, Evaluation,
│                      Amendment, Clarification, ApprovalTask, Onboarding,
│                      WorkforceMember
├── cast.ts            the ~16 people, Part 3
├── org.ts             departments and budget lines, Part 3
├── seed.ts            the 14 requisitions and everything connected to them
├── queries.ts         pure functions: getRequisition(id), listRequisitions
│                      (filters), getClarificationsForRequisition(id),
│                      getCandidatesForRequisition(id), getInterview(id),
│                      getEvaluation(requisitionId, candidateRef),
│                      getAmendment(id), getOnboarding(id),
│                      getWorkforceMember(id), getApprovalTasksForUser(userId)
└── index.ts
```

**Every existing domain's `fixtures.ts` becomes an adapter**, not a data
source: it calls a `demo-data` query, then maps the canonical entity into that
domain's already-defined response type — the exact shape specced in
`APPROVAL-API-CONTRACT.md`, `CLARIFICATION-API-CONTRACT.md`,
`INTERVIEW-EVALUATION-API-CONTRACT.md`, and so on. **No component changes.**
Only where the data comes from changes.

```ts
// src/lib/hr-review/fixtures.ts — after
import { getRequisition, getClarification } from '@/lib/demo-data';
import { mapToHrReviewDetail } from './mappers';

export function getHrReviewFixture(requestId: string) {
  const req = getRequisition(requestId);
  if (!req) return null; // real 404, not a fallback to the reference case
  return mapToHrReviewDetail(req, getClarification(req.id));
}
```

Each domain's `api.ts` hook (already built to read fixtures behind a flag)
calls this instead of importing a static constant.

---

## Part 3 — The cast

Fixed. Every prompt below references these people by name — do not invent new
names for entities these should touch.

| Name | Role | Scope |
| :--- | :--- | :--- |
| Mariam Al Mansoori | Department Requestor | Digital Security, Data Management |
| Ahmed Al Zaabi | Department Requestor | IT Infrastructure |
| Rashid Al Falasi | Department Requestor | PMO |
| Hessa Al Qassimi | Department Requestor | Finance |
| Omar Al Hashmi | Line Manager | Digital Security |
| Fatima Al Marri | Section Head | Digital Security |
| Khalid Al Suwaidi | Head of Department | Digital Security |
| Youssef Al Blooshi | Head of Department | PMO (no Section Head in this chain — variable-length route) |
| Mona Al Shamsi | Head of Department | IT Infrastructure (no Section Head) |
| Aisha Al Nuaimi | HR Specialist | Organisation-wide |
| Rashid Al Mansoori | Finance Manager | Organisation-wide |
| Salma Al Ketbi | Procurement Officer | Organisation-wide |
| Noura Al Mazrouei | Main Interviewer | Digital Security, Data Management |
| Yousef Al Falasi | Panel Interviewer | Digital Security |
| Layla Hassan | Vendor Coordinator | Vendor: **Falcon Tech Resourcing** (never shown to internal roles) |
| Ahmed Al Dhaheri | System Administrator | Global |

**Org structure**: DIEZ → Corporate Services (BU) → Digital Security, Data
Management, IT Infrastructure, Finance, HR, Procurement, PMO. Add a second BU,
**Free Zones**, with zero requisitions — an empty-state test.

**Budget lines** (Digital Security, reused from the Budget Control Center
reference): Cybersecurity Services FY2026 (3,200,000.00), Digital
Transformation FY2026 (2,400,000.00), Technology Operations FY2026
(1,800,000.00). Give each other department one or two lines with round
figures.

**Vendors**: Falcon Tech Resourcing (Layla Hassan), plus a second, **Meridian
Workforce Solutions**, unstaffed by a named coordinator — used only where a
vendor reference is needed without a portal user.

---

## Part 4 — The fourteen requisitions

Every field a prompt needs. Dates are relative to "today" — compute concrete
dates when seeding.

| ID | Position | Dept | Requestor | Stage | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **0148** | Senior Cybersecurity Analyst | Digital Security | Mariam | Amendment in progress | **Flagship.** C-014 evaluated, qualified over budget, amendment awaiting Omar's approval. C-021 still awaiting interview scheduling. Full 5-stage route |
| 0139 | Data Governance Specialist | Data Management | Mariam | HR Review, returned | Requester responded to a clarification 1 day ago; HR Review shows the "Returned" badge and clarification context banner |
| 0141 | Cloud Security Engineer | IT Infrastructure | Ahmed Al Zaabi | Procurement sourcing | HR approved, Salma owns it, zero candidates yet — empty-state test on Candidates |
| 0143 | Cloud Engineer | IT Infrastructure | Ahmed Al Zaabi | Awaiting requester | A "more info" clarification open — the *other* direction of the clarification flow from 0139 |
| 0128 | PMO Analyst | PMO | Rashid Al Falasi | HR Review, overdue | 5 days old, 2 days overdue. Route has **no Section Head** — Youssef is HOD directly after Line Manager |
| 0152 | Financial Compliance Officer | Finance | Hessa Al Qassimi | Draft | Never submitted. Tests the Drafts tab and the 60-day purge notice |
| 0155 | HR Coordinator | HR | Aisha Al Nuaimi | Awaiting Line Manager | HR raising its own requisition — the segregation-of-duties edge case from `APPROVAL-WORKFLOW-SPEC.md` Part 6 Q1 |
| 0119 | SOC Analyst (×2) | Digital Security | Mariam | Onboarding — onshore | C-030 qualified within budget. Vendor documents in progress via Falcon Tech / Layla. Second seat still sourcing |
| 0102 | Data Analyst | Data Management | Mariam | Onboarding — offshore | C-031, India. Three-document offshore set, real dual-timezone data |
| 0095 | Network Engineer | IT Infrastructure | Ahmed Al Zaabi | Active | Joined 3 months ago, ~9 months remaining. Normal Workforce row |
| 0081 | QA Engineer | IT Infrastructure | Ahmed Al Zaabi | Active, ending soon | Contract ends within 30 days — inside the 90-day replacement window. Drives the dashboard's contract-runway widget |
| 0074 | Business Analyst | PMO | Rashid Al Falasi | Terminated → replaced | Terminated 2 months ago. A linked replacement requisition (**0074-R**) exists, currently sourcing |
| 0161 | Penetration Tester | Digital Security | Mariam | Rejected, re-sourcing | C-040 evaluated and rejected — reason "doesn't meet requirements, CV not kept," real retention date computed. Zero candidates now, sourcing restarted |
| 0170 | Security Architect | Digital Security | Mariam | Just submitted | Submitted today, Requestor → Line Manager. Newest item everywhere it's sorted by recency |

**Supplementary, not a full lifecycle**: `OMS-2026-0131` — a reconciliation
variance record ("Oracle vs budget variance") against the 0148 budget line, for
the Budget page's exceptions table only.

---

## Part 5 — Navigation requirements

Every one of these must be a real link using the canonical ID, not a
placeholder:

| From | To |
| :--- | :--- |
| Request detail | Its clarifications, candidates, amendment (if any), onboarding (if any), approval trail |
| HR Review clarification banner | The actual clarification response page |
| Interview Evaluation over-budget Qualify | The amendment it creates |
| Candidates list row | Interview Planning or Evaluation, whichever stage it's at |
| Workforce active row | The requisition and onboarding it originated from |
| Dashboard "Needs my action" | Filtered to the signed-in persona's real tasks |
| Dashboard "Auto-close watch", "Contract runway" | The real filtered request/workforce list |
| Budget exceptions table | `OMS-2026-0131` detail |

---

## Part 6 — Persona switcher

Generalise the vendor cookie injector already built for the Vendor Documents
dev workbench into one global control.

- A dev-visible switcher (behind `NEXT_PUBLIC_DEMO_MODE`) listing all sixteen
  cast members with role and department
- Selecting one sets the mock session — permissions, scope, and `canAct`
  resolve exactly as they would for a real login
- Persists across navigation until changed
- The point: click through 0148 as Mariam (submitting), then as Omar
  (approving), then as Aisha (HR review), then as Noura (evaluating), without
  re-authenticating

---

## Part 7 — Prompts

Written for Antigravity, Gemini 3.8 Flash (high). Run in order.

### DD1 — Audit 🔴

```
CONTEXT
Repo: OMS frontend, Next.js 16. This app has ~40 pages built across separate
work streams (requests, approvals, HR review, clarifications, interview
planning, interview evaluation, budget amendments, vendor documents,
workforce, budget). Read docs/DEMO-DATA-INTEGRATION.md fully, then CLAUDE.md.

Report only. Write no code.

TASK 1 — Fixture isolation test
For each of these routes, load it with two DIFFERENT ids and report whether
the rendered content changes:
  /app/requests/[id]
  /app/requests/[id]/clarifications/[clarificationId]
  /app/requests/[id]/amendments/[amendmentId]
  /app/hr-review/[requestId]/send-back
  /app/candidates/interviews/plan/[requestId]
  /app/candidates/interviews/evaluate/[requestId]/[candidateRef]
  /vendor/onboarding/[onboardingId]/documents
For each: does the data hook branch on the param, or does it always return
the same fixture regardless of the URL? Quote the relevant code.

TASK 2 — Fixture inventory
List every fixtures.ts / mock data file in the repo, one row each: file path,
what domain it serves, what IDs/entities it hardcodes, whether it exports a
single object or a lookup keyed by ID.

TASK 3 — List page inventory
For /app/requests, /app/candidates, /app/workforce, /app/budget, /app/vendors,
/app/hr-review, /app/approvals, /app/dashboard: how many rows does each render
today, and are they hardcoded or generated?

TASK 4 — Dead-end audit
For every page in Part 5 of docs/DEMO-DATA-INTEGRATION.md, confirm whether the
link/button described exists, is a dead link, or is entirely absent.

TASK 5 — Duplication check
Confirm whether /users/* (legacy) and /app/administration/users/* maintain
separate user data or share a source.

Output as tables. Do not fix anything yet — this establishes the starting
point for every task after it.
```

🛑 Read this fully before DD2. It tells you exactly how much rework each
domain needs.

---

### DD2 — Canonical schema and seed 🔴

```
CONTEXT
Read docs/DEMO-DATA-INTEGRATION.md Parts 2, 3, 4 in full — the architecture,
the cast, and the fourteen-requisition table. Also read every existing API
contract doc referenced there (APPROVAL-API-CONTRACT.md,
CLARIFICATION-API-CONTRACT.md, INTERVIEW-PLANNING-API-CONTRACT.md,
INTERVIEW-EVALUATION-API-CONTRACT.md, BUDGET-AMENDMENT-API-CONTRACT.md,
VENDOR-DOCUMENTS-API-CONTRACT.md, HR-REVIEW-API-CONTRACT.md) so the canonical
entities can losslessly map into every domain's already-defined response
shape.

TASK 1 — src/lib/demo-data/entities.ts
Canonical types: Person, OrgUnit, BudgetLine, Vendor, Requisition (with
approval route, current stage, position count), Candidate, InterviewPlan,
Evaluation, Amendment, Clarification, ApprovalTask, OnboardingCase,
WorkforceMember. Each requisition-linked entity carries the requisitionId (and
candidateRef where relevant) as its foreign key — this is what makes
cross-page navigation possible.

TASK 2 — src/lib/demo-data/cast.ts and org.ts
Encode the Part 3 cast table and org/budget structure EXACTLY as given — do
not invent additional people or rename anyone. Omar Al Hashmi is Line Manager,
Fatima Al Marri is Section Head — this corrects an inconsistency across
earlier specs; apply it everywhere.

TASK 3 — src/lib/demo-data/seed.ts
Build all FOURTEEN requisitions from the Part 4 table, plus the supplementary
OMS-2026-0131 reconciliation record. For each, generate every connected
entity implied by its stage — e.g. 0148 needs a full Interview record for
C-014, a full Evaluation record with real weighted ratings, a full Amendment
record referencing real budget line figures, AND a partial state for C-021
(interview not yet scheduled). Compute concrete dates relative to today from
the relative descriptions given ("3 days ago", "ends within 30 days").

Money: integers in minor units throughout, per every contract's stated rule.
Every figure that appears in more than one place (e.g. C-014's cost appears in
both the Evaluation and the Amendment) MUST be the identical number in both —
this is the entire point of the exercise.

TASK 4 — src/lib/demo-data/queries.ts
Pure functions per Part 2: getRequisition(id), listRequisitions(filters),
getClarificationsForRequisition(id), getCandidatesForRequisition(id),
getInterview(requisitionId, candidateRef),
getEvaluation(requisitionId, candidateRef), getAmendment(id),
getOnboarding(id), getWorkforceMember(id),
getApprovalTasksForUser(userId) — this last one is what makes the persona
switcher and "Needs my action" actually work per-person.
getRequisition on an unknown id returns null — callers must render a real
404, never fall back to a default.

TASK 5 — Report
List every requisition you seeded with its final computed dates and a one-line
confirmation that its connected entities exist. Flag anything from the Part 4
table you could not fully seed and why.

Do not touch any existing domain's fixtures.ts yet.
```

✅ `feat(demo-data): canonical schema and fourteen-requisition seed`

---

### DD3 — Migrate request-centric domains

```
CONTEXT
Read the DD1 audit output and docs/DEMO-DATA-INTEGRATION.md Part 2.

Migrate these domains to read from demo-data instead of their isolated
fixtures. For each, KEEP the existing exported response type exactly as
specced in its API contract — only the data source changes, so no component
should need edits.

  /app/requests, /app/requests/[id], /app/requests/mine
  /app/approvals, /app/approvals/[id]
  /app/hr-review, /app/hr-review/[requestId]/send-back
  /app/requests/[id]/clarifications/[clarificationId]

TASK 1 — For each domain's fixtures.ts, replace the static export with a
function that calls the relevant demo-data query, then maps the canonical
entity into that domain's response shape via a small mapper file
(<domain>/mappers.ts). Unknown IDs return null/undefined so the page can
render a real not-found state — do not fall back to the old reference case.

TASK 2 — List pages (/app/requests, /app/hr-review, /app/approvals) now render
ALL FOURTEEN requisitions from demo-data, filtered appropriately:
  /app/requests            — all, with the existing tabs (All/Drafts/Needs My
                              Action/In Progress/Closed) now reflecting REAL
                              counts across the seed
  /app/hr-review            — only requisitions currently at the HR Review
                              stage (0139, 0128), scoped
  /app/approvals             — driven by getApprovalTasksForUser for whichever
                              persona is active

TASK 3 — Confirm the fixture isolation bug from DD1 is fixed: load
/app/requests/OMS-2026-0148 and /app/requests/OMS-2026-0139 and report that
they now show genuinely different content.

TASK 4 — Wire the navigation links from Part 5 of the spec that apply to these
domains: request detail to its clarifications and amendment where present, HR
Review's clarification banner to the real clarification page.
```

✅ `feat(demo-data): connect requests, approvals and HR review`

---

### DD4 — Migrate candidate and interview domains

```
CONTEXT
Same pattern as DD3, applied to:
  /app/candidates
  /app/candidates/interviews/plan/[requestId]
  /app/candidates/interviews/evaluate/[requestId]/[candidateRef]
  /app/requests/[id]/amendments/[amendmentId]

TASK 1 — Migrate each domain's fixtures.ts to a demo-data-backed function via
a mapper, exactly as in DD3. Response shapes unchanged.

TASK 2 — /app/candidates becomes a real pipeline view across all candidates
in the seed: C-014, C-021 (0148), C-030 (0119), C-031 (0102), C-040 (0161,
rejected), plus 0143 and 0141's empty states. Group or filter by requisition.

TASK 3 — Confirm cross-entity consistency specifically:
  - C-014's cost figures in the Evaluation page and the Amendment page for
    0148 must be the IDENTICAL numbers — this is the primary proof that the
    integration worked. Screenshot both and confirm.
  - The Amendment page's "who approves" route must show Omar Al Hashmi as
    Line Manager (not Section Head — this was a naming inconsistency in
    earlier specs, now fixed in the seed).

TASK 4 — Wire navigation: Candidates row -> Interview Planning or Evaluation
depending on stage; Evaluation's over-budget Qualify -> the real Amendment
page for that candidate, using the actual amendment id from demo-data, not a
placeholder.
```

✅ `feat(demo-data): connect candidates, interviews and amendments`

---

### DD5 — Migrate vendor, workforce and budget domains

```
CONTEXT
Same pattern, applied to:
  /vendor/onboarding/[onboardingId]/documents
  /app/workforce, /app/workforce/onboarding, /app/onboarding
  /app/budget, /app/budget/dashboard, /app/budget/dept-budget
  /app/vendors
  /app/administration/users (confirm the cast exists here as real user
  records, correctly typed INTERNAL vs VENDOR per Domain 3 rules)

TASK 1 — Migrate fixtures per the established pattern.

TASK 2 — Vendor Documents: 0119's onboarding case (onshore, Layla Hassan /
Falcon Tech) and 0102's (offshore, C-031) must be reachable by their real
onboarding IDs from demo-data, not the dev-sandbox fixtures. Confirm
vendorHidden behaviour still holds — internal pages must never surface
"Falcon Tech Resourcing" anywhere; only Layla's own vendor-portal session and
Procurement's vendor management screens may see it.

TASK 3 — Workforce shows 0095 (active, normal), 0081 (active, ending within
30 days, amber badge), and 0074 (terminated, with a link to its replacement
requisition 0074-R).

TASK 4 — Budget page's exceptions table includes the supplementary
OMS-2026-0131 reconciliation record against the Digital Security Cybersecurity
Services line.

TASK 5 — Confirm /app/administration/users lists all sixteen cast members
with correct UserType, and that Layla Hassan is VENDOR-typed and rejected on
any /app/* route per the Domain 3 isolation rules — this should already be
enforced; this task only confirms the seeded record is consistent with it.
```

✅ `feat(demo-data): connect vendor, workforce and budget`

---

### DD6 — Navigation and dashboard wiring

```
CONTEXT
Read docs/DEMO-DATA-INTEGRATION.md Part 5 in full — every row is a
requirement, not a suggestion.

TASK 1 — Go through every link in the Part 5 table. For each, confirm it
exists, uses a real canonical ID from demo-data (never a hardcoded
placeholder), and lands on a page that actually shows connected data.

TASK 2 — Dashboard widgets (from DASHBOARD-PLAN.md and its extensions) now
read from demo-data:
  "Needs my action"      -> getApprovalTasksForUser for the active persona
  "Auto-close watch"     -> requisitions from the seed approaching their
                             deadline (compute from seeded dates)
  "Contract runway"      -> 0081 specifically should appear inside the 30-day
                             bucket
  "Requests by lifecycle stage" -> real counts across all fourteen
  "Budget exposure"      -> real figures from the Digital Security budget
                             lines in demo-data

TASK 3 — Every dashboard widget link opens the correctly FILTERED list view
(e.g. clicking auto-close-watch opens /app/requests filtered to exactly the
requisitions it counted), not the unfiltered list.

TASK 4 — Report any link from Part 5 you could not wire and why.
```

✅ `feat(demo-data): wire navigation and dashboard widgets`

---

### DD7 — Persona switcher

```
CONTEXT
Read docs/DEMO-DATA-INTEGRATION.md Part 6. Find the existing vendor cookie
injector built for the /app/dev/vendor-documents workbench and generalise its
pattern — do not build a second, unrelated mechanism.

TASK 1 — Build a global persona switcher, visible only when
NEXT_PUBLIC_DEMO_MODE is set, listing all sixteen cast members from
demo-data/cast.ts with their role and department.

TASK 2 — Selecting a persona sets the mock session exactly as a real login
would — permissions, scope, and every canAct/readOnlyReason field across every
page must resolve correctly for that person. This should require no new
authorization logic; it only needs to set the identity that the existing
permission system already reads.

TASK 3 — Persists across navigation via a cookie or similar, until changed.

TASK 4 — Verify the actual walkthrough this exists for: as Mariam, view 0148;
switch to Omar, see it in his Needs My Action and approve it; switch to Aisha,
see 0139 in HR Review with the clarification banner; switch to Noura, evaluate
C-014 on 0148 and confirm the over-budget path opens the real amendment;
switch to Rashid Al Mansoori, see the amendment awaiting Finance if routed
there. Report each hop.
```

✅ `feat(demo-data): add persona switcher`

---

### DD8 — Consolidate dev sandboxes and legacy routes

```
CONTEXT
Read DD1's duplication findings.

TASK 1 — For every /app/dev/* fixture-switcher workbench (vendor-documents,
clarifications, interview-planning, hr-send-back), repoint their scenario
buttons at the corresponding REAL requisition IDs from demo-data rather than a
separate parallel fixture set. "Reference" -> 0148/C-014, "offshore" ->
0102/C-031, "rejected" -> 0161/C-040, and so on. Keep the workbenches — they
are useful for isolated testing — but they must show the same data as the real
pages, not a second copy that can drift.

TASK 2 — Legacy /users/*, /users/[id], /users/new, /users/vendors: if DD1
confirmed these hold separate data from /app/administration/users/*, either
redirect them to the equivalent /app/administration/users/* route, or remove
them. Report which you chose and why.

TASK 3 — Confirm no page in the app still imports a standalone fixtures.ts
that is NOT an adapter over demo-data. Grep for it.
```

✅ `chore(demo-data): consolidate dev workbenches and legacy routes`

---

### DD9 — Verify and produce the demo script

```
CONTEXT
Read docs/DEMO-DATA-INTEGRATION.md in full.

TASK 1 — Verification. Report: check | expected | actual | pass.
  1. /app/requests/OMS-2026-0148 and /app/requests/OMS-2026-0139 show
     genuinely different content.
  2. Every route in DD1's isolation test now branches correctly on its param.
  3. C-014's cost figures match exactly between the Evaluation page and the
     Amendment page for 0148.
  4. Omar Al Hashmi renders as Line Manager everywhere he appears, never
     Section Head.
  5. All fourteen requisitions appear in /app/requests with correct stage
     badges.
  6. Every link in Part 5's table works and lands on connected data.
  7. The persona switcher correctly changes scope and canAct across at least
     four different pages.
  8. Falcon Tech Resourcing never appears on any /app/* route.
  9. 0074's Workforce entry links to 0074-R.
  10. Dev workbenches and real pages show identical data for the same
      scenario.
  11. No fixtures.ts remains that is not a demo-data adapter.

TASK 2 — Write docs/DEMO-WALKTHROUGH.md: a presenter's script. For each of the
following storylines, list the exact click path (persona, starting page,
each click) a presenter would follow to demonstrate it live:
  a) A full requisition from submission through hierarchy approval to HR
     review (use 0170 -> 0128 stages)
  b) A clarification cycle from both directions (0139 as HR, 0143 as
     requester)
  c) Interview scheduling with the suggestion engine, through evaluation, to
     an over-budget amendment (0148, the flagship)
  d) A rejected candidate and re-sourcing (0161)
  e) Vendor onboarding, onshore and offshore (0119, 0102)
  f) An active resource approaching contract end and its replacement lineage
     (0081, 0074/0074-R)
  g) The System Administrator's platform-health view (Ahmed Al Dhaheri persona)

This document is the actual deliverable for showing this to DIEZ.
```

🛑 Final gate. This is the one that proves the integration actually works,
end to end, as a human would experience it.
