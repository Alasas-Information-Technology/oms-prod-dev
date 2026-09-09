# Candidate Budget Amendment — UI

Route: `/app/requests/{requestId}/amendments/{amendmentId}`

**UI-only build.** Part 5 defines the API contract. Reuses components from
`APPROVAL-WORKFLOW-SPEC.md`, `BUDGET-SELECTED-LINE-PANEL.md`,
`INTERVIEW-PLANNING-UX.md` and `BUDGET-API-CONTRACT.md`'s money rules. This is
the page `INTERVIEW-EVALUATION-UI.md` EV6 sends the requester to when a
qualified candidate is over budget.

---

## Part 1 — Gaps in the reference

### 1.1 Reversed sign — a real bug 🔴

Candidate allocation moves **310,000 → 330,000**, an increase. "Change" shows
**−20,000**. The "Budget line remaining after amendment" row moves the other
way — it should decrease, and shows **+20,000**.

On a financial approval screen, a reversed sign is the specific thing that gets
an amendment rejected by someone who actually checks the arithmetic. Every
figure must trace to a server value with an explicit, tested sign convention:
**increases to cost are positive; decreases to remaining budget are negative.**
State this rule once and apply it everywhere, never inferred per-row.

### 1.2 Two unexplained steppers

The five-stage lifecycle (Candidate Qualified → Amendment Draft → Department
Approval → HR Review → Finance Review → Onboarding) and the five-person
approval chain (Requestor → Line Manager → Section Head → HOD → HR) say
related but different things, with nothing explaining why both exist.

**Collapse the lifecycle to the 4px progress rail** from
`INTERVIEW-PLANNING-UX.md` Part 3. **Reuse `ReapprovalRoute`** from
`APPROVAL-WORKFLOW-SPEC.md` for the person-level chain — it already exists,
already renders variable-length routes, and already names approvers by name.
Building a third stepper here is how the three drift apart.

### 1.3 Only one funding route shows its consequence

Budgeted, Unallocated, and Unbudgeted are the same three options from RFP Step
1 — and the RFP defines different consequences for each:

| Route | What happens |
| :--- | :--- |
| Budgeted | Allocate from the department's own open budget lines |
| Unallocated | Draw from funds not yet assigned to any line. Per RFP: department may select relevant unallocated line(s) |
| Unbudgeted | **Requires HR approval, then Finance approval**, before procurement can proceed. Finance may add a new line or top up an existing one |

The reference only builds out Budgeted. All three need their consequence and
their form to appear on selection, and Unallocated needs its lock icon
explained or removed — ambiguous iconography on a money screen erodes trust.

### 1.4 Money formatting

No decimals, plain number spinners, no distinction between exact and
abbreviated. This is a financial approval; every figure is **exact**, per the
rules in `BUDGET-API-CONTRACT.md` and the `Amount` component from
`DASHBOARD-VISUAL-LANGUAGE.md` T2. The allocation input is a money field with
a mask and live validation, not a bare spinner.

### 1.5 Rejection consequences only cover HR

The note states what happens if HR rejects or approves. Line Manager, Section
Head, and HOD rejections are equally real and go unstated. Every stage in
`ReapprovalRoute` needs its rejection consequence, not just the last one.

### 1.6 No deadline

This amendment blocks the original request, which is still subject to the
30-day auto-close. Nothing here shows the clock. If the amendment sits
unresolved, the underlying request — and the candidate's slot — can expire
silently.

### 1.7 "Cancel Amendment" has no stated consequence

Does the candidate revert to qualified-pending-budget, or back to shortlisted?
The requester needs to know before clicking.

### 1.8 Budget lines aren't visibly scoped

Nothing shows why exactly these two lines are offered. They must be filtered
to lines the department can draw from, per the Domain 2/4 scope rules — and
the picker should say so, the way other pickers in this system show a live
count.

### 1.9 No lineage to where this came from

The breadcrumb reads "My Requests / OMS-2026-0148 / Budget Amendment" with no
mention of the candidate or the evaluation that triggered it. Show the path:
*"Triggered by qualifying candidate C-009 on 12 Aug."*

---

## Part 2 — Layout

```
My Requests / OMS-2026-0148 / Candidate C-009 / Budget amendment
                                              [Cancel] [Save draft] [Submit]
▬▬▬▬▬▬▬▬▬▬▬▬░░░░░░░░░░░░░░░░░░░░░░░  Amendment draft · 2 of 5
────────────────────────────────────────────────────────────────────────────
 Triggered by qualifying candidate C-009 for Senior Cybersecurity Analyst
 on 12 Aug 2026 · 24 days left on the original request
────────────────────────────────────────────────────────────────────────────
┌──────────────────────────┬──────────────────────────┬────────────────────┐
│ WHY THIS IS NEEDED       │ REVISED BUDGET POSITION   │ Approved  310,000.00│
│ Approved   AED 310,000.00│ Item          Now    →Revised│ Qualified 330,000.00│
│ Qualified  AED 330,000.00│ Candidate   310,000  330,000 (+20,000.00)      │
│ Short by   AED  20,000.00│ Line balance 450,000 430,000 (−20,000.00)     │
│ ● Over budget by 6.45%   │ ✓ Balanced after amendment │────────────────────│
│                          │                            │ WHO APPROVES       │
│ Justification            │ FUNDING ROUTE              │ ① You → ② Omar →   │
│ [                      ] │ (•) Budgeted               │ ③ Fatima → ④ Khalid│
│                          │     Draw from your open     │ → ⑤ HR             │
│ 📎 Market_Rate_Comp.pdf  │     budget lines             │ ⚠ Rejecting at any │
│    ✓ Verified            │ ( ) Unallocated              │  stage closes this │
│                          │     Use funds not yet        │  candidate and      │
│                          │     assigned to a line        │  releases reserved │
│                          │ ( ) Unbudgeted                │  funds              │
│                          │     Ask HR, then Finance,     │────────────────────│
│                          │     to approve new funds       │ FUND STATE ON      │
│                          │                                │ APPROVAL           │
│                          │ Cybersecurity Services         │ Reserved →         │
│                          │  Available 450,000.00          │ Locked & allocated │
│                          │  Add       [AED 20,000.00]     │────────────────────│
│                          │ Digital Transformation         │ Cancelling reverts  │
│                          │  Available 170,000.00          │ C-009 to Qualified, │
│                          │  Add       [AED 0.00]          │ pending budget.     │
│                          │                                │                     │
│                          │ Total added    AED 20,000.00   │                     │
│                          │ ✓ Sufficient funds available   │                     │
└──────────────────────────┴────────────────────────────┴────────────────────┘
 🛈 Before and after allocation, justification and approvals are kept for audit.
```

Grid `320px 1fr 320px`, 24px gap. Below 1280px the right column stacks below;
below 1024px single column, funding route last.

---

## Part 3 — Panels

### 3.1 Why this is needed

Approved, qualified, shortfall, and variance percentage — reusing the `Amount`
component with T2 weight contrast throughout.

**Status badge**: Over budget (red), Within budget after correction (neutral).

Justification textarea, required, minimum 40 characters with a live counter.
Attachment via `AttachmentList` from `CLARIFICATION-RESPONSE-UI.md` — same
scanning states, same component.

### 3.2 Revised budget position

Table: item, current, revised, change — with the sign rule from §1.1 stated as
a caption: *"Positive means an increase to cost. Negative means a decrease to
what remains."*

Balance status: **Balanced** (green, additions cover the shortfall exactly or
exceed it) or **Short by AED X** (red, submit blocked with the reason stated).

Every figure server-computed. No client arithmetic anywhere on this page —
grep-testable.

### 3.3 Funding route

Radio cards per §1.3, each showing its consequence sentence and revealing its
own form on selection. Unallocated's icon is a plain wallet, not a lock —
locks read as "unavailable," not as "draws from a restricted pool."

**Budgeted / Unallocated** — line picker filtered to the department's open
lines of the relevant category, with the live count: *"3 open lines available
to Digital Security."* Money-masked "Add" input per line, running total,
balance check against the shortfall.

**Unbudgeted** — no line picker. Instead: *"HR reviews this first. If they
approve, Finance selects or creates the funding line. Only then does this
continue to procurement."* The `ReapprovalRoute` panel gains an HR → Finance
branch when this is selected.

### 3.4 Who approves

`ReapprovalRoute`, reused verbatim, naming actual approvers. Beneath it, **every
stage's rejection consequence**, not only HR's: *"A rejection at any stage
closes this candidate's path and releases the reserved funds."* If a stage has
a distinct consequence (e.g. HOD may instead request more justification),
state that stage specifically.

### 3.5 Fund state on approval

Reuse the "Reserved → Locked & Allocated" pill pattern from
`APPROVAL-WORKFLOW-SPEC.md` §3.4, not a new component. Same visual, because it
is the same underlying transition.

### 3.6 Cancel consequence

A quiet note near the Cancel action, always visible, not hidden in a
confirmation dialog: *"Cancelling reverts C-009 to Qualified, pending budget.
No funds are moved."* Clicking Cancel then confirms once, restating it.

### 3.7 Deadline

Context bar per §1.6: *"24 days left on the original request."* Same severity
escalation as the rest of the system — amber under 7 days, red under 3,
stating that the request (and this candidate) will close automatically.

---

## Part 4 — Submit

- Blocked while balance is **Short**, with the shortfall amount stated.
- Confirmation restates: the shortfall, the funding route chosen, the lines
  drawn from, who it goes to next by name, and the deadline.
- Idempotency key generated once, reused on retry.
- Errors: `AMENDMENT_INSUFFICIENT_FUNDS` (show current availability, don't
  auto-resubmit), `AMENDMENT_LINE_CLOSED` (name the line, ask to reselect),
  `AMENDMENT_ALREADY_DECIDED` (name who decided).

---

## Part 5 — API contract

Document as `docs/BUDGET-AMENDMENT-API-CONTRACT.md`. Money in **integers,
minor units**.

```
GET /api/v1/requests/{requestId}/amendments/{amendmentId}
```

```jsonc
{
  "amendmentId": "…",
  "requestId": "OMS-2026-0148",
  "candidateRef": "C-009",
  "position": "Senior Cybersecurity Analyst",
  "triggeredBy": { "event": "CANDIDATE_QUALIFIED", "at": "2026-08-12T11:46:00Z" },

  "canAct": true,
  "readOnlyReason": null,

  "cost": { "approved": 31000000, "qualified": 33000000, "shortfall": 2000000,
            "variancePercent": 6.45, "status": "OVER_BUDGET" },

  "fundingRoutes": [{
    "code": "BUDGETED", "label": "Budgeted",
    "consequence": "Draw from your open budget lines.",
    "availableLines": [{ "lineId": "…", "code": "CS-DIG-001",
                          "name": "Cybersecurity Services FY2026",
                          "available": 45000000 }]
  }, {
    "code": "UNBUDGETED", "label": "Unbudgeted",
    "consequence": "HR reviews this first. If they approve, Finance selects or creates the funding line. Only then does this continue to procurement.",
    "availableLines": []
  }],

  "reapprovalRoute": [{ "stage": "LINE_MANAGER", "user": { "name": "Omar Al Hashmi" },
                        "rejectionConsequence": "Closes this candidate's path and releases reserved funds." }],

  "deadline": { "closesAt": "…", "daysRemaining": 24, "severity": "NORMAL" },

  "cancelConsequence": "Reverts C-009 to Qualified, pending budget. No funds are moved."
}
```

```
POST …/amendments/{amendmentId}/preview
{ "fundingRoute": "BUDGETED", "allocations": [{ "lineId": "…", "amount": 2000000 }] }
```

```jsonc
{
  "revisedPosition": [{ "item": "Candidate allocation", "current": 31000000,
                         "revised": 33000000, "change": 2000000 }],
  "balanced": true, "totalAllocated": 2000000, "shortfallRemaining": 0
}
```

```
PUT  …/amendments/{amendmentId}/draft
POST …/amendments/{amendmentId}/submit   { fundingRoute, allocations, justification, attachmentIds, idempotencyKey }
POST …/amendments/{amendmentId}/cancel   { reason? }
```

### Server requirements

1. **Sign convention fixed and tested**: cost changes positive, remaining-budget
   changes negative. Applied identically in preview and detail responses —
   never inferred client-side.
2. **All figures pre-computed server-side.** No client arithmetic.
3. **Re-validate availability at submit.** Preview figures are a preview.
4. **Budget lines are pre-filtered to the caller's scope** — never return a line
   the department cannot draw from.
5. Idempotency key mandatory on submit and cancel.
6. Unbudgeted route accepts no `allocations` — reject if present.

---

## Part 6 — Prompts

Written for Antigravity.

### BA1 — Contract, types, fixtures

```
CONTEXT
Repo: OMS frontend. Next.js 16, React 19, TypeScript, Tailwind 4, shadcn/ui.
Read first:
  docs/BUDGET-AMENDMENT-UI.md          (this spec)
  docs/APPROVAL-WORKFLOW-SPEC.md       (ReapprovalRoute, fund state pills)
  docs/BUDGET-SELECTED-LINE-PANEL.md
  docs/INTERVIEW-EVALUATION-UI.md      (where this page is triggered from)
  docs/BUDGET-API-CONTRACT.md
  CLAUDE.md

TASK 1
Write docs/BUDGET-AMENDMENT-API-CONTRACT.md transcribing Part 5 in full: the
GET, preview POST, draft PUT, submit POST, cancel POST, every payload shape,
and all six server requirements with rationale.

State requirement 1 prominently: cost changes are POSITIVE, remaining-budget
changes are NEGATIVE, applied identically everywhere. The reference this is
based on has the signs backwards on both rows of its revised-position table,
which is the kind of error that gets a financial amendment rejected by anyone
who checks the arithmetic.

Money stays integers in minor units, per BUDGET-API-CONTRACT.md.

TASK 2
Create src/types/budget-amendment.ts from the Part 5 shapes.

TASK 3
Create src/lib/budget-amendment/fixtures.ts with FOUR fixtures:
  a) Reference case: OMS-2026-0148, C-009, Senior Cybersecurity Analyst,
     approved 31000000, qualified 33000000, shortfall 2000000, variance 6.45%,
     two budget lines (Cybersecurity Services FY2026 available 45000000,
     Digital Transformation FY2026 available 17000000), 5-step reapproval
     route, 24 days remaining on the original request.
  b) UNBUDGETED route selected — no available lines, HR-then-Finance branch.
  c) A submit blocked by insufficient allocation (shortfallRemaining > 0).
  d) Deadline CRITICAL — 2 days remaining.

TASK 4
Create src/lib/budget-amendment/api.ts with hooks matching the existing pattern
in this repo, including a preview hook debounced 500ms and a draft hook
debounced 2000ms.

No UI in this task.
```

✅ `feat(budget-amendment): contract, types and fixtures`

---

### BA2 — Shell, lineage, deadline

```
CONTEXT
Read docs/BUDGET-AMENDMENT-UI.md 1.2, 1.6, 1.9, Part 2, 3.7.

TASK 1 — Route and shell
/app/requests/[requestId]/amendments/[amendmentId].
Breadcrumb: My Requests / OMS-2026-0148 / Candidate C-009 / Budget amendment.
Page-bar actions: Cancel (ghost, danger text), Save draft (ghost), Submit
(primary).

TASK 2 — Progress rail
The reference builds a large five-stage horizontal stepper for the amendment
LIFECYCLE. Replace it with the 4px progress rail from
INTERVIEW-PLANNING-UX.md Part 3: "Amendment draft · 2 of 5", hover popover for
detail. Do not build a third stepper system on this page — one already exists
for the lifecycle and one exists for the person-level approval chain
(ReapprovalRoute, built next task); this page needs both concepts but not two
custom-built widgets.

TASK 3 — Lineage line beneath the rail
"Triggered by qualifying candidate C-009 for Senior Cybersecurity Analyst on
12 Aug 2026" — a link back to the interview evaluation that caused this.
Nothing in the reference shows where this page came from.

TASK 4 — Deadline
Same severity states as the rest of the system: neutral over 7 days, amber
3-7, red under 3, stating the request AND the candidate will close
automatically. Test with fixture (d).

TASK 5 — Layout
Grid 320px 1fr 320px, 24px gap. Below 1280px right column stacks; below 1024px
single column with funding route last.
```

✅ `feat(budget-amendment): shell, lineage and deadline`

---

### BA3 — Why this is needed, revised position

```
CONTEXT
Read docs/BUDGET-AMENDMENT-UI.md 1.1, 1.4, 3.1, 3.2. This task contains the
bug fix.

TASK 1 — "Why this is needed" panel
Approved, qualified, shortfall, variance percentage, status badge. Use the
Amount component with T2 weight contrast throughout — muted currency code,
bold integer, muted decimals. EXACT figures, never abbreviated; this is a
financial approval.
Justification textarea, required, 40-character minimum with a live counter.
Attachments via the existing AttachmentList component from the clarification
work — same scanning states, do not rebuild it.

TASK 2 — Revised budget position table — FIX THE SIGN BUG
Item, current, revised, change. The change column MUST follow this rule
exactly, with no per-row exceptions:
  Cost figures increasing  -> POSITIVE change, shown in warning tone
  Remaining-budget figures decreasing -> NEGATIVE change, shown in neutral tone
Add a caption stating the rule: "Positive means an increase to cost. Negative
means a decrease to what remains."

The reference this replaces has BOTH signs backwards — candidate allocation
increasing shows -20,000, and remaining budget decreasing shows +20,000. Write
a unit test asserting the sign for both an increase and a decrease case before
considering this task complete.

TASK 3 — Balance status
"Balanced" in success tone when allocations cover the shortfall; "Short by AED
X" in danger tone otherwise, with Submit blocked and the reason stated.

Compute NOTHING client-side. Every value in this table comes from the preview
response. Grep this component for arithmetic on cost fields when done — there
must be none.
```

🛑 Confirm the sign test passes for both directions before moving on.

✅ `feat(budget-amendment): why-needed panel and revised position table`

---

### BA4 — Funding route

```
CONTEXT
Read docs/BUDGET-AMENDMENT-UI.md 1.3, 3.3.

TASK 1 — Three radio cards
Budgeted, Unallocated, Unbudgeted — reusing the same three concepts from RFP
Step 1. Each card shows its consequence sentence from fundingRoutes[].
consequence and reveals its own form on selection.
Unallocated's icon is a plain wallet, not a lock. A lock reads as "you cannot
use this," which is wrong — it is a legitimate route with its own rules, not a
restricted one.

TASK 2 — Budgeted / Unallocated form
Line picker filtered to availableLines, with the live count stated: "3 open
lines available to Digital Security." Per line: name, available (exact,
tabular-nums), and a MONEY-MASKED "Add" input, not a bare number spinner.
Running total beneath. Balance check against the shortfall, live, debounced
500ms via the preview endpoint.

TASK 3 — Unbudgeted form
No line picker. Render exactly: "HR reviews this first. If they approve,
Finance selects or creates the funding line. Only then does this continue to
procurement." Selecting this route must send NO allocations — the server
rejects them if present per contract requirement 6.
Selecting Unbudgeted also adds an HR -> Finance branch to the ReapprovalRoute
panel built in BA5; wire that connection now if BA5 has not landed yet, or flag
it for BA5 explicitly.

TASK 4 — Money inputs
All "Add" fields use a money-masked input: digits only, thousands separators,
two decimals, prefixed AED. No native number spinner arrows.
```

✅ `feat(budget-amendment): funding route selection`

---

### BA5 — Who approves and fund state

```
CONTEXT
Read docs/BUDGET-AMENDMENT-UI.md 1.2, 1.5, 3.4, 3.5, and
APPROVAL-WORKFLOW-SPEC.md section 4.2 for the ReapprovalRoute component.

TASK 1 — Reuse ReapprovalRoute
Import the existing component rather than building a new stepper. Pass
reapprovalRoute from the API response. It must already render variable-length
routes and name approvers — confirm that and do not duplicate the logic.

If UNBUDGETED is the selected funding route, extend the rendered route with an
HR -> Finance branch, sourced from the API rather than hardcoded.

TASK 2 — Every stage's rejection consequence
The reference states a consequence only for HR. Render EVERY stage's
rejectionConsequence beneath the route, not only the last one. If a stage has
no distinct consequence, fall back to the generic one from the API rather than
inventing wording.

TASK 3 — Fund state on approval
Reuse the "Reserved -> Locked & Allocated" pill-and-arrow pattern from
APPROVAL-WORKFLOW-SPEC.md section 4.2 exactly — same component, same visual.
Do not build a second version of this widget; it is the same underlying state
transition already specced there.

TASK 4 — Cancel consequence
Render cancelConsequence as a quiet, ALWAYS-VISIBLE note near the Cancel
action in the page bar, not hidden inside a confirmation dialog. Clicking
Cancel opens a confirmation that restates the same text once.
```

✅ `feat(budget-amendment): approval route and fund state`

---

### BA6 — Submit and cancel flows

```
CONTEXT
Read docs/BUDGET-AMENDMENT-UI.md Part 4 and Part 5 server requirements.

TASK 1 — Submit gating
Disabled while balanced is false, with the shortfall amount stated inline next
to the button, not only in the panel above.

TASK 2 — Submit confirmation
Restate: the shortfall amount, the chosen funding route, which lines and
amounts if Budgeted or Unallocated, who it goes to next by name from the
reapproval route, and the deadline.

TASK 3 — Idempotency and errors
Key generated once when the confirmation opens, reused on retry.
  AMENDMENT_INSUFFICIENT_FUNDS  show current availability inline, do NOT
                                 auto-resubmit
  AMENDMENT_LINE_CLOSED         name the closed line, prompt to reselect
  AMENDMENT_ALREADY_DECIDED     name who decided and when

TASK 4 — Cancel flow
Confirmation restates cancelConsequence. On success, return to the request
detail with a plain confirmation: "Amendment cancelled. C-009 is Qualified,
pending budget."

TASK 5 — Success
On submit, return to the request detail naming the next approver: "Amendment
submitted. It now goes to Omar Al Hashmi for approval."
```

✅ `feat(budget-amendment): submit and cancel flows`

---

### BA7 — Verify

```
Verify. Report: check | expected | actual | pass.

SIGN BUG — highest priority
1. An increase to candidate cost renders POSITIVE.
2. A decrease to remaining budget renders NEGATIVE.
3. The sign unit test from BA3 passes for both directions.
4. The caption explaining the sign rule is present.

COMPONENT REUSE
5. ReapprovalRoute is imported, not reimplemented. Grep for a second stepper
   component on this page — none beyond the 4px progress rail.
6. The fund-state pill pattern matches APPROVAL-WORKFLOW-SPEC.md exactly.
7. AttachmentList is the same component used on the clarification page.

FUNDING ROUTE
8. All three routes show a consequence sentence and reveal their own form.
9. Unallocated shows a wallet icon, not a lock.
10. Unbudgeted sends no allocations. Test that the request payload is empty
    for this route.
11. Money inputs are masked; no native spinner arrows visible.

MONEY
12. Every figure on the page is exact, tabular-nums, via lib/money.ts. Grep
    for any abbreviated amount.
13. Grep for arithmetic on cost fields in components — none.
14. Preview updates live, debounced, without a full page reload.

REST
15. Every approval stage's rejection consequence is shown, not only HR's.
16. Cancel consequence is visible without opening a dialog.
17. Deadline severity escalates correctly; fixture (d) shows red.
18. Lineage line links back to the triggering evaluation.
19. Submit blocked while short, with the amount stated.
20. Double-clicking Submit or Cancel fires exactly one request each.
21. Every error renders its specific plain message.
22. Responsive 1440, 1280, 1024, 768. Light and dark.
23. No status codes, route codes or field keys visible anywhere.
```

🛑 Final gate. Items 1–4 are the ones that matter most.

---

## Part 7 — Questions for DIEZ

1. **Does the Unbudgeted route's HR-then-Finance approval replace or extend the
   standard department chain** (Line Manager → Section Head → HOD)? The RFP
   describes both processes but not how they combine on an amendment.
2. **Can a department mix Budgeted and Unallocated funding on one amendment,**
   or must all additional funds come from a single route?
3. **What happens to the candidate's interview outcome if the amendment is
   rejected at any stage** — does it revert to Qualified-pending-budget
   indefinitely, or does it eventually expire and require re-evaluation?
