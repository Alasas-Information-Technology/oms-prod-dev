# HR Review — UI

Route: `/app/hr-review` (queue) · `/app/hr-review/{requestId}` (detail)

**UI-only build.** Part 5 defines the API contract. Follows
`APP-SHELL-SPEC.md`, `DASHBOARD-VISUAL-LANGUAGE.md`, `APPROVAL-WORKFLOW-SPEC.md`
and the money rules in `BUDGET-API-CONTRACT.md`.

A partial version exists. Prompt HR1 audits it before anything is rebuilt.

---

## Part 1 — Improvements over the reference

### 1.1 Six buttons become four decisions 🔴

The reference renders all six RFP actions as equal-weight buttons in one row.
Two problems:

**Three of them are the same action with different consequences.** Request More
Info, Request Info with Approval, and Amend Request all send it back to the
requester. They differ only in what happens *next* — and the button labels
don't say.

**Two of them are approvals with opposite outcomes.** "Approve as OMS"
continues the process. "Approve as Permanent Hire" **leaves OMS entirely** —
per the RFP it uploads to Oracle and closes the requisition with status
"Permanent Hire". Placing them adjacent at equal weight invites a misclick with
no undo.

Restructure:

```
[ Approve as OMS ]   [ Send back ▾ ]        [ Convert to permanent hire ]  [ Reject ]
     primary          3 explained modes         separated, secondary          danger
```

Send back opens a chooser explaining each mode in a sentence:

| Mode | Explanation shown |
| :--- | :--- |
| Ask a question | *"The requester answers. Nothing needs re-approval and the request stays where it is."* |
| Ask for changes that need re-approval | *"The requester updates the details. It then goes back through Omar, Fatima and Khalid before returning to you."* |
| Ask them to amend the request | *"The requester revises the request. It repeats the full approval and budget checks."* |

Four visual elements instead of six, and the three confusing ones collapse into
one clear choice with its consequence stated at the point of decision.

### 1.2 Separate system checks from HR judgements 🔴

The reference lists five checks together. But "Job profile attached" is
something the system verified, while "Outsourcing suitability" is a call only
HR can make — and it shows "Review required" with no way to resolve it.

Split them:

**Verified by the system** — read-only, automatic:
- Job profile attached
- Approval route completed
- Budget availability
- Segregation of duties

**For you to confirm** — HR ticks each, with an optional note:
- Outsourcing is suitable for this role
- Emiratisation position considered
- Complies with workforce policy

The second group is the actual work of HR review, and the reference gives it no
affordance at all.

### 1.3 Emiratisation is missing

The RFP states HR *"monitors Emiratisation quotas"* as part of reviewing
requisitions. It appears nowhere on this screen, and nowhere else in the build.

Add it to the HR confirmations, with the department's current position shown
beside it where the data exists. Note: the calculation basis is an open
question — see Part 6.

### 1.4 The queue should sort by urgency

The footer says *"4 of 12 overdue"* but nothing in the list shows which four.
With a 3-business-day SLA, overdue items should sort first and carry a visible
marker on the card, not just a count at the bottom.

Default order: overdue, then oldest. A returned clarification jumps the queue —
the requester has already waited once.

### 1.5 Queue work needs keyboard flow

HR clearing twelve reviews wants: read, decide, next. Not: decide, find the
mouse, click the next card, wait.

- `J` / `K` or arrows move through the queue
- After a decision, **advance to the next item automatically** and say so
- `A` opens approve, `S` opens send back, `R` opens reject
- `?` shows the shortcuts

This is the single biggest time saver for a queue worker and it costs almost
nothing.

### 1.6 Overview and tabs currently duplicate

The reference shows Budget Position and Department Approval Trail on Overview,
*and* has Budget and Approval Trail tabs. Same content twice.

Overview shows **summaries with "View all"**; the tabs hold the detail.

### 1.7 Returned clarifications need context

A card badged "Clarification returned" means HR already asked something. The
detail must show **what was asked and what came back**, at the top — not buried
in an audit tab. Otherwise HR re-reads the whole request to remember why it
left.

---

## Part 2 — Layout

```
Administration / HR Review                    [All departments ▾] [Awaiting ▾] [search]
────────────────────────────────────────────────────────────────────────────────────
┌────────────────────┬──────────────────────────────────────────────────────────────┐
│ REVIEW QUEUE   12  │ Senior Cybersecurity Analyst          OMS-2026-0148          │
│ 4 overdue          │ [Awaiting HR review] [Unknown candidates] [DIEZ Premises]    │
│                    │                                                              │
│ ⚠ OMS-2026-0128    │ Resources 2 · Engagement 12 months · Start 1 Sep · Grade G8  │
│   PMO Analyst      │ ──────────────────────────────────────────────────────────── │
│   PMO · 5 days     │ Overview │ Approval trail │ Budget │ Attachments │ Audit     │
│   ⚠ 2 days overdue │                                                              │
│                    │ ┌───────────────────────┬────────────────────────────────┐  │
│ ● OMS-2026-0148    │ │ BUSINESS NEED         │ BUDGET POSITION      ✓ Verified│  │
│   Senior Cyber…    │ │ Enhance cyber-risk …  │ Approved   AED 620,000.00      │  │
│   Digital Sec·1 day│ │                       │ Reserved   AED 620,000.00      │  │
│   ✓ Budget verified│ │ VERIFIED BY THE SYSTEM│ Available  AED 620,000.00      │  │
│                    │ │ ✓ Job profile attached│ Route      Budgeted            │  │
│   OMS-2026-0139    │ │ ✓ Approval route      │              View detail ›     │  │
│   Data Governance  │ │ ✓ Budget availability │                                │  │
│   ↩ Returned       │ │ ✓ Segregation of duty │ APPROVAL TRAIL                 │  │
│                    │ │                       │ ① Mariam submitted  4 Aug 09:18│  │
│                    │ │ FOR YOU TO CONFIRM    │ ② Omar approved     4 Aug 14:42│  │
│                    │ │ ☑ Outsourcing suitable│ ③ Fatima approved   5 Aug 10:08│  │
│                    │ │ ☐ Emiratisation       │ ④ Khalid approved   5 Aug 11:15│  │
│                    │ │ ☐ Workforce policy    │              View all ›        │  │
│ SLA 3 business days│ └───────────────────────┴────────────────────────────────┘  │
├────────────────────┴──────────────────────────────────────────────────────────────┤
│ Every decision needs a comment and is recorded in the audit history.              │
│ [Approve as OMS]  [Send back ▾]        [Convert to permanent hire]      [Reject]  │
└───────────────────────────────────────────────────────────────────────────────────┘
```

Queue 340px fixed, detail flexible. Decision bar sticky at the bottom. Below
1280px the queue becomes a collapsible drawer.

---

## Part 3 — Panels

### 3.1 Queue card

- Request ID in mono, position, department, age
- **Overdue marker** — amber left border and "2 days overdue"
- Badges: Budget verified, New, Returned
- Selected: accent left border, tinted background
- Sorted overdue → returned → oldest

Header shows the count and the overdue count. Footer shows the SLA target.

### 3.2 Detail header

Position as title, request ID right, status and context badges beneath.

Metric strip: resources, engagement, expected start, grade — four figures with
icons, no cards.

### 3.3 Returned clarification banner

When the request is returning from a clarification, a panel above Overview:

> **You asked for more information on 5 Aug**
> "Please clarify the data-governance deliverables…"
>
> **Mariam responded on 6 Aug** — 3 fields changed · 1 attachment added
> [View what changed]

Without this, HR re-reads everything to remember why it left.

### 3.4 Business need

The justification in full. Never truncated — it is the thing being judged.

### 3.5 Verified by the system

Read-only list, each with a pass state and the timestamp it was checked on
hover. A failure is red with a stated reason and blocks approval.

### 3.6 For you to confirm

Checkboxes HR ticks, each with an optional note field revealed when ticked.

- Outsourcing is suitable for this role
- Emiratisation position considered — shows department position where available
- Complies with workforce policy

**Unticked items do not block a decision** — they are recorded as unconfirmed
in the audit trail, and the approve confirmation names them. HR judgement,
not a gate.

### 3.7 Budget position

Approved, reserved, available remaining, funding route, verified badge. Budget
lines with a total on the Budget tab.

Every figure from the server. No client arithmetic.

### 3.8 Approval trail

Vertical stepper: stage, name, timestamp. Summary on Overview, full detail with
comments on its tab.

---

## Part 4 — The six decisions

Every decision requires a comment. Every decision is audited.

| Decision | Effect | Confirmation |
| :--- | :--- | :--- |
| **Approve as OMS** | Proceeds to procurement | Names unconfirmed HR checks, if any |
| **Send back — ask a question** | Returns to requester. **No re-approval.** Unlimited cycles | States that nothing needs re-approval |
| **Send back — changes needing re-approval** | Returns to requester. Repeats Line Manager → Section Head → HOD | **Names the approvers** it will return through |
| **Send back — amend request** | Requester revises. Full approval and budget checks repeat | Same, plus the budget note |
| **Convert to permanent hire** | **Exits OMS.** Uploads to Oracle. Closes as "Permanent Hire" | Strong: states this leaves OMS, cannot be undone here, and releases reserved funds |
| **Reject** | Closes the request, releases all reserved and locked funds | Names the amount released |

### Convert to permanent hire needs a stronger gate

It is the only action that removes the request from OMS and hands it to another
system. Confirmation must state: this leaves OMS, it uploads the job profile,
justification and any CV to Oracle, the requisition closes, and reserved funds
are released. Require typed confirmation of the request ID.

### Send back chooser

Three modes as radio cards, each with its consequence sentence from §1.1, plus
a required comment. Default: ask a question — the least disruptive.

For modes 2 and 3, name the actual approvers it will return through. "Repeats
hierarchy approval" is a process description; "returns to Omar Al Hashmi,
Fatima Al Marri and Khalid Al Suwaidi" is people the requester will chase.

---

## Part 5 — API contract

Document as `docs/HR-REVIEW-API-CONTRACT.md`. Money in integers, minor units.

```
GET /api/v1/hr-review/queue?department=&status=&page=
```

```jsonc
{
  "items": [{
    "requestId": "OMS-2026-0148", "position": "Senior Cybersecurity Analyst",
    "department": { "id": "…", "name": "Digital Security" },
    "ageDays": 1,
    "sla": { "targetDays": 3, "dueAt": "…", "overdueDays": 0, "breached": false },
    "flags": ["BUDGET_VERIFIED", "NEW"],
    "returnedFromClarification": false,
    "amount": 62000000
  }],
  "counts": { "total": 12, "overdue": 4, "returned": 1 },
  "slaTargetDays": 3
}
```

```
GET /api/v1/hr-review/{requestId}
```

```jsonc
{
  "request": { /* position, ids, badges, resources, engagementMonths,
                  expectedStart, grade, workLocation, candidateRoute,
                  justification */ },
  "canDecide": true,
  "readOnlyReason": null,

  "systemChecks": [
    { "code": "JOB_PROFILE_ATTACHED", "label": "Job profile attached",
      "state": "PASSED"|"FAILED", "checkedAt": "…", "blocksApproval": true,
      "failureReason": null }
  ],

  "hrConfirmations": [
    { "code": "OUTSOURCING_SUITABLE", "label": "Outsourcing is suitable for this role",
      "confirmed": false, "note": null, "context": null },
    { "code": "EMIRATISATION", "label": "Emiratisation position considered",
      "confirmed": false, "note": null,
      "context": { "current": 34.2, "target": 40.0, "unit": "PERCENT" } }
  ],

  "budget": { "approved": 62000000, "reserved": 62000000,
              "availableRemaining": 62000000, "fundingRoute": "BUDGETED",
              "verified": true,
              "lines": [{ "code": "…", "name": "…", "amount": 40000000 }] },

  "approvalTrail": [{ "stage": "REQUESTOR", "label": "Submitted",
                      "user": {...}, "at": "…", "comment": null }],

  "clarificationContext": {
    "hadClarification": true,
    "askedAt": "…", "askedBy": {...}, "askMessage": "…",
    "respondedAt": "…", "fieldsChanged": 3, "attachmentsAdded": 1,
    "diffLink": "…"
  },

  "availableDecisions": ["APPROVE_OMS", "SEND_BACK", "PERMANENT_HIRE", "REJECT"],
  "sendBackModes": ["MORE_INFO", "INFO_WITH_APPROVAL", "AMEND"],
  "reapprovalRoute": [{ "stage": "LINE_MANAGER", "user": { "name": "Omar Al Hashmi" } }]
}
```

```
PUT  /api/v1/hr-review/{requestId}/confirmations   { code, confirmed, note }
POST /api/v1/hr-review/{requestId}/decide
     { decision, sendBackMode?, comment, idempotencyKey }
```

### Server requirements

1. **The queue returns only requests assigned to HR review within the caller's
   scope.** Not a filtered view of all requests.
2. **Re-validate budget at decision time** — figures shown are a preview.
   `HR_REVIEW_BUDGET_CHANGED` returns current figures.
3. **Idempotency key mandatory** on decide.
4. **Comment required** on every decision, without exception.
5. **A failed system check with `blocksApproval` prevents approval** server-side,
   not only in the UI.
6. **Unconfirmed HR confirmations do not block** but are recorded in the audit
   entry.
7. Permanent hire triggers the Oracle handoff; fail the decision if that
   handoff cannot be queued, rather than closing the request first.

---

## Part 6 — Prompts

### HR1 — Audit and contract

```
CONTEXT
You are in the OMS frontend repo (Next.js 16, React 19, TypeScript, Tailwind 4,
shadcn/ui). Read first:
  docs/HR-REVIEW-UI.md    (this spec)
  CLAUDE.md
  docs/APPROVAL-WORKFLOW-SPEC.md
  docs/CLARIFICATION-RESPONSE-UI.md
  docs/BUDGET-API-CONTRACT.md
  docs/APP-SHELL-SPEC.md

A partial HR Review page exists. Audit it before rebuilding.

TASK 1 — Audit. Report only, write no code.
  a) List every file implementing HR review today, with a one-line description.
  b) For each of the seven improvements in Part 1, state whether the current
     build handles it, partly handles it, or ignores it. Give file and line
     evidence.
  c) List which of the six RFP decisions are implemented and how they render.
  d) Identify anything reusable: queue, tabs, budget panel, approval trail.
  e) Flag anything that violates CLAUDE.md — role-name gating, client-side
     money arithmetic, raw status codes on screen.
  f) Classify every file KEEP / REBUILD / DELETE with a reason.

TASK 2 — Write docs/HR-REVIEW-API-CONTRACT.md
Transcribe Part 5 in full: both GET endpoints, the confirmations PUT, the decide
POST, and all seven server requirements with rationale.
State at the top and in every money field: ALL MONETARY VALUES ARE INTEGERS IN
MINOR UNITS.
Flag the permissions this needs as a backend dependency — at minimum
REQUISITION.HR_REVIEW, plus BUDGET.VIEW for the budget panel.

TASK 3 — Types and fixtures
src/types/hr-review.ts from the Part 5 shapes.
src/lib/hr-review/fixtures.ts with SIX queue items and FOUR detail fixtures:
  a) The reference case — OMS-2026-0148, Senior Cybersecurity Analyst, Digital
     Security, 2 resources, 12 months, start 1 Sep 2026, grade G8, budget
     62000000 across two lines (40000000 + 22000000), four completed approval
     stages, all system checks passed, no HR confirmations ticked.
  b) Overdue — 5 days old against a 3-day SLA.
  c) Returned from clarification — with clarificationContext populated.
  d) A failed system check that blocks approval.

TASK 4 — Data hooks matching the existing pattern in this repo. Check how the
requests module fetches and match it exactly.

Do not delete or rebuild anything yet.
```

🛑 Read the audit before HR2.

✅ `feat(hr-review): audit, contract and fixtures`

---

### HR2 — Queue

```
CONTEXT
Read docs/HR-REVIEW-UI.md Parts 1.4, 2, 3.1.

TASK 1 — Queue panel, 340px fixed, own scroll
Header: "Review queue", total count, and the overdue count in amber when above
zero.
Footer: "SLA target: 3 business days".

TASK 2 — Queue card per 3.1
  Request ID in mono, position, department, age.
  Badges: Budget verified, New, Returned.
  Selected: accent left border and tinted background.
  OVERDUE: amber left border and "2 days overdue" on the card itself.

  The reference only shows "4 of 12 overdue" in the footer with nothing marking
  WHICH four. With a 3-day SLA that is the most important thing in the list.

TASK 3 — Sorting and filters
Default order: overdue first, then returned clarifications, then oldest.
A returned clarification jumps the queue — the requester has already waited
once.
Filters in the page bar: department, status, search. Add an "Overdue only"
toggle.

TASK 4 — Selection and routing
Selection sets ?request={id} so a view is shareable and the back button works.
Below 1280px the queue becomes a collapsible drawer with a toggle in the page
bar.

TASK 5 — Empty and loading
Empty: "Nothing waiting for review." Treat it as a good state.
Loading: skeleton cards at final height. The list must not reflow.
```

✅ `feat(hr-review): rebuild review queue`

---

### HR3 — Detail shell, tabs, clarification context

```
CONTEXT
Read docs/HR-REVIEW-UI.md 1.6, 1.7, 3.2, 3.3, 3.8.

TASK 1 — Detail header per 3.2
Position as title, request ID right in mono, status and context badges beneath.
Metric strip: resources, engagement, expected start, grade — four figures with
16px muted icons. NOT four cards; this is a strip.

TASK 2 — Tabs
Overview, Approval trail, Budget, Attachments, Audit. Underline style per
APP-SHELL-SPEC.md, not pills.

CRITICAL per 1.6: Overview shows SUMMARIES with "View all" links; the tabs hold
the detail. The reference renders Budget Position and the full Approval Trail on
Overview AND has Budget and Approval Trail tabs — the same content twice. Do not
reproduce that.

Overview shows: business need, system checks, HR confirmations, a budget
summary with "View detail", and a compact approval trail with "View all".

TASK 3 — Returned clarification banner per 3.3
When clarificationContext.hadClarification is true, render a panel ABOVE
Overview:
  "You asked for more information on 5 Aug" plus the ask message
  "Mariam responded on 6 Aug — 3 fields changed · 1 attachment added"
  A "View what changed" link to the diff

Without this, HR re-reads the entire request to remember why it left. Do not
bury it in the Audit tab.

TASK 4 — Business need per 3.4
Full justification, NEVER truncated, no "read more". It is the thing being
judged.

TASK 5 — Approval trail per 3.8
Vertical stepper: stage, name, timestamp. Reuse the stepper from
ORG-UNIT-DETAIL-SPEC.md §3.7 rather than building a third one.
Dates as "4 Aug 2026, 09:18". Never ISO.
```

✅ `feat(hr-review): rebuild detail shell and tabs`

---

### HR4 — Checks and confirmations

```
CONTEXT
Read docs/HR-REVIEW-UI.md 1.2, 1.3, 3.5, 3.6. This is the substantive change to
the reference.

The reference lists five checks together. But "Job profile attached" is
something the SYSTEM verified, while "Outsourcing suitability" is a judgement
only HR can make — and it renders "Review required" with no way to resolve it.

TASK 1 — "Verified by the system" panel per 3.5
Read-only list from systemChecks. Each: label, pass or fail state, and the
check timestamp on hover.
A FAILED check with blocksApproval true renders in red with its failureReason
and disables the Approve action with that reason stated.

TASK 2 — "For you to confirm" panel per 3.6
Checkboxes from hrConfirmations, each with an optional note field revealed on
tick. Ticking calls the confirmations PUT immediately — these are not staged
with the decision.

Include Emiratisation. The RFP states HR monitors Emiratisation quotas as part
of reviewing requisitions, and it appears NOWHERE in the build today. Where
context is present, show the department position beside the label: "Currently
34.2% against a 40% target".
Add:
// TODO(hr): confirm Emiratisation calculation basis with DIEZ — headcount or
// cost, and against which target
Flag this in your summary as an open question.

TASK 3 — Unconfirmed items do not block
Leaving a confirmation unticked must NOT prevent a decision. They are recorded
as unconfirmed in the audit entry, and the approve confirmation names them:
"You have not confirmed: Emiratisation position considered. Approve anyway?"

This is HR judgement, not a system gate. Blocking would push people to tick
boxes without thinking, which defeats the purpose.

TASK 4 — Budget position per 3.7
Approved, reserved, available remaining, funding route, verified badge, with
"View detail" linking to the Budget tab. Lines with a total live on that tab.
Every figure from the server. Compute nothing — grep this component for
arithmetic when done. All amounts via lib/money.ts, exact, tabular-nums.
```

✅ `feat(hr-review): split system checks from HR confirmations`

---

### HR5 — Decisions 🔴

```
CONTEXT
Read docs/HR-REVIEW-UI.md 1.1 and Part 4. Plan first and show me the plan.

The reference renders all six RFP actions as equal-weight buttons in one row.
Restructure into four elements per 1.1.

TASK 1 — Sticky decision bar
Note above: "Every decision needs a comment and is recorded in the audit
history."

  [Approve as OMS]  [Send back ▾]     [Convert to permanent hire]  [Reject]
     primary          secondary            secondary, SEPARATED       danger

Separate "Convert to permanent hire" with extra spacing. It is the only action
that removes the request from OMS entirely — per the RFP it uploads to Oracle
and closes the requisition as "Permanent Hire". Placing it beside "Approve as
OMS" at equal weight, as the reference does, invites a misclick with no undo.

The whole bar renders only when canDecide is true. Absent otherwise, never
disabled.

TASK 2 — Send back chooser
Opens a dialog with three radio cards, each showing its consequence sentence:
  Ask a question
    "The requester answers. Nothing needs re-approval and the request stays
     where it is."
  Ask for changes that need re-approval
    "The requester updates the details. It then goes back through Omar Al
     Hashmi, Fatima Al Marri and Khalid Al Suwaidi before returning to you."
  Ask them to amend the request
    "The requester revises the request. It repeats the full approval and budget
     checks."

Name the ACTUAL approvers from reapprovalRoute for modes 2 and 3. "Repeats
hierarchy approval" is a process description; names are people the requester
will have to chase.

Default: ask a question — the least disruptive. Comment required.

TASK 3 — Approve as OMS
Comment required. Confirmation names any unconfirmed HR checks.

TASK 4 — Convert to permanent hire — strongest gate
Confirmation must state plainly:
  - This request leaves OMS
  - The job profile, justification and any CV upload to Oracle
  - The requisition closes with status "Permanent Hire"
  - Reserved funds are released — name the amount
Require typed confirmation of the request ID. This is the only decision that
hands the request to another system.

TASK 5 — Reject
Comment required plus a reason code. Confirmation names the amount released:
"AED 620,000.00 will be released back to the department."

TASK 6 — Submission
idempotencyKey generated once when a dialog opens, reused on retry. Buttons
disabled during submission.
Errors, each with a plain message:
  HR_REVIEW_BUDGET_CHANGED   show new figures, do NOT auto-resubmit
  HR_REVIEW_ALREADY_DECIDED  name who decided
  HR_REVIEW_CHECK_FAILED     name the failing check

In your plan, state how you prevent a misclick on permanent hire and how the
send-back modes stay distinguishable at a glance.
```

🛑 Read the plan. Then confirm the permanent hire confirmation states all four
consequences.

✅ `feat(hr-review): restructure HR decisions`

---

### HR6 — Queue flow and keyboard

```
CONTEXT
Read docs/HR-REVIEW-UI.md 1.5. This is the biggest time saver on the page.

HR clearing twelve reviews wants: read, decide, next. Not: decide, find the
mouse, click the next card, wait for it to load.

TASK 1 — Shortcuts
  J / down arrow   next request in the queue
  K / up arrow     previous
  A                open Approve as OMS
  S                open Send back
  R                open Reject
  Esc              close any dialog
  ?                shortcut overlay

Shortcuts are inert while a dialog or text field has focus.

TASK 2 — Auto-advance
After a successful decision, move to the next queue item automatically and show
a brief confirmation naming what happened: "Approved. Moved to OMS-2026-0143."
Offer an undo affordance only where the backend supports it — otherwise say
nothing about undo.

TASK 3 — Prefetch
Prefetch the next queue item's detail when the current one is selected, so
advancing feels instant.

TASK 4 — Progress
Show position in the queue: "3 of 12". After the last item: "Queue clear."

TASK 5 — Discoverability
A small keyboard hint in the queue footer, and the ? overlay listing every
shortcut.
```

✅ `feat(hr-review): add queue keyboard flow`

---

### HR7 — Verify

```
Verify HR Review. Report: check | expected | actual | pass.

DECISIONS
1. Four visual elements in the decision bar, not six.
2. Send back opens a chooser with three explained modes.
3. Modes 2 and 3 name the actual approvers from reapprovalRoute.
4. Convert to permanent hire is visually separated and requires typed
   confirmation of the request ID.
5. Its confirmation states all four consequences: leaves OMS, uploads to Oracle,
   closes as Permanent Hire, releases funds with the amount named.
6. Reject names the amount released.
7. Every decision requires a comment — none can be submitted without one.
8. Double-clicking any decision fires exactly one request.

CHECKS
9. System checks and HR confirmations are visibly separate panels.
10. A failed blocking system check disables Approve with the reason stated.
11. Unticked HR confirmations do NOT block, and the approve confirmation names
    them.
12. Emiratisation appears with department context where available.

QUEUE
13. Overdue items are marked on the card, not only counted in the footer.
14. Order is overdue, then returned, then oldest.
15. Selection sets ?request={id} and reload restores it.

FLOW
16. J/K move through the queue; A/S/R open the dialogs.
17. Shortcuts are inert while a dialog or input has focus.
18. After a decision it auto-advances and names the next item.
19. The next item is prefetched — advancing does not show a spinner.

CONTENT
20. Overview shows summaries with View all links; no content is duplicated
    between Overview and the tabs.
21. The returned-clarification banner appears above Overview when applicable.
22. Business justification is never truncated.
23. Every budget figure traces to a server field. Grep for arithmetic.
24. Amounts exact, tabular-nums, via lib/money.ts.

REST
25. canDecide false: the decision bar is ABSENT from the DOM, not disabled.
26. Responsive 1440, 1280 (queue drawer), 1024, 768.
27. No status codes, permission codes or field keys visible anywhere.
28. Light and dark theme.
```

🛑 Final gate.

---

## Part 7 — Questions for DIEZ

1. **Emiratisation** — measured by headcount or cost, against what target, and
   at which organisational level? The RFP names the requirement without
   defining the calculation. This blocks §1.3.
2. **Can HR approve when a system check has failed,** with justification, or is
   it an absolute block?
3. **Who reviews when the HR Specialist raised the request themselves?**
   Segregation of duties applies here as it does to hierarchy approval.
4. **Is HR review a role queue any HR user can claim, or assigned per request?**
   The queue shows twelve items with no ownership — two HR staff could work the
   same one.
5. **Does converting to permanent hire require a second approver?** It closes a
   funded requisition and hands it to Oracle, and is irreversible in OMS.
