# Approval Workflow — API Contract & UI

Covers the hierarchy approval chain (Line Manager → Section Head → HOD → HR),
the approver inbox, the decision screen, and role visibility.

**UI-only build.** Part 3 defines the contract the backend is later built to
match.

---

## Part 1 — Approval is generic

Requisition approval is one of several approval types the RFP requires:

| Type | Route | Source |
| :--- | :--- | :--- |
| **Requisition** | Line Manager → Section Head → HOD → HR | RFP Steps 1–2 |
| Budget amendment | HR → Finance | Step 7 |
| Bypass interview | HOD | Step 6 |
| Closure request | Hierarchy → HOD | Step 14 |
| Termination | Hierarchy → HOD | Step 13 |
| Budget period close/reopen | Finance Analyst → Manager → HOD | Master Data |
| Leave | Line Manager | Leave module |
| Vendor rate card | Procurement | Master Data |

**Build one approval engine and inbox, with type-specific decision panels.**
Eight separate approval implementations is eight places to get segregation of
duties wrong.

This document specs the requisition type in full. Others reuse the shell and
supply their own context panel.

---

## Part 2 — Visibility 🔴

The core of the request. Three separate rights, commonly conflated:

| Right | Governed by | Who has it |
| :--- | :--- | :--- |
| **See the request exists** | Org scope + `REQUISITION.VIEW` | Anyone in scope — HR, Finance, the department |
| **See the approval detail** | Org scope + permission | Same, plus budget figures for those with `BUDGET.VIEW` |
| **Act on the approval** | **Task assignment only** | Exactly one user (or one claimable role queue) at a time |

### Rules

1. **`/app/approvals` shows only tasks assigned to the signed-in user.** Never a
   general list of pending approvals.
2. **The decision bar renders only for the current assignee.** Not disabled for
   everyone else — *absent*. A disabled Approve button invites the question
   "why can't I?"
3. **Everyone else in scope sees the same request read-only**, with a clear line:
   *"Awaiting HOD approval — Khalid Al Suwaidi, since 5 Aug."*
4. **The requester can never approve their own request.** Segregation of duties.
   If the requester is also the assignee at some stage, the task escalates to
   the next level. → open question Q1.
5. **A delegate sees the task** with a banner: *"You're acting for Khalid Al
   Suwaidi until 15 Aug."* Their decision records both identities.
6. **Out-of-scope requests return 404**, not 403.

### Assignment models

Two, because the RFP needs both:

- **Named assignee** — hierarchy stages resolve to a specific person from the AD
  route (Line Manager, Section Head, HOD). One person, no claiming.
- **Role queue** — HR Review, Procurement, Finance. Any user holding that role
  within the relevant scope can see and claim it. Claiming locks it to them;
  they can release it back.

Role queues need a visible claim state, or two HR staff will work the same item.

---

## Part 3 — API contract

Document this as `docs/APPROVAL-API-CONTRACT.md`. Every monetary value is an
**integer in minor units**, per the budget contract.

### 3.1 My approvals

```
GET /api/v1/approvals?status=pending&type=&page=&pageSize=
```

Returns only tasks where the caller is the named assignee, a member of the
assigned role queue, or an active delegate of either.

```jsonc
{
  "items": [{
    "approvalTaskId": "…",
    "type": "REQUISITION",
    "subjectId": "…",
    "subjectRef": "OMS-2026-0148",
    "title": "Senior Cybersecurity Analyst",
    "context": "Digital Security Department",
    "stage": { "code": "HOD", "label": "HOD Approval", "index": 4, "total": 6 },
    "assignment": { "mode": "NAMED", "assignedUserId": "…", "claimedBy": null },
    "actingFor": null,
    "amount": 62000000,
    "currency": "AED",
    "submittedAt": "2026-08-04T09:18:00Z",
    "assignedAt": "2026-08-05T10:06:00Z",
    "sla": { "dueAt": "2026-09-04T10:06:00Z", "daysRemaining": 22, "breached": false },
    "priority": "NORMAL"
  }],
  "counts": { "all": 6, "requisition": 4, "budget": 1, "other": 1, "breached": 0 }
}
```

### 3.2 Task detail

```
GET /api/v1/approvals/{taskId}
```

Returns everything the decision screen needs in **one call**. An approver
should never wait on four requests to see one decision.

```jsonc
{
  "task": { /* as above */ },
  "canAct": true,
  "actingFor": null,
  "readOnlyReason": null,          // set when canAct is false
  "route": [
    { "index": 1, "code": "REQUESTOR",   "label": "Requestor",    "state": "COMPLETE", "user": {...}, "at": "2026-08-04T09:18:00Z" },
    { "index": 2, "code": "LINE_MANAGER","label": "Line Manager", "state": "COMPLETE", "user": {...}, "at": "2026-08-04T14:42:00Z" },
    { "index": 3, "code": "SECTION_HEAD","label": "Section Head", "state": "COMPLETE", "user": {...}, "at": "2026-08-05T10:06:00Z" },
    { "index": 4, "code": "HOD",         "label": "HOD",          "state": "CURRENT",  "user": {...} },
    { "index": 5, "code": "HR_REVIEW",   "label": "HR Review",    "state": "PENDING" },
    { "index": 6, "code": "PROCUREMENT", "label": "Procurement",  "state": "PENDING" }
  ],
  "subject": { /* type-specific — see 3.3 */ },
  "history": [
    { "user": {...}, "action": "SUBMITTED", "comment": "Request submitted for approval.", "at": "..." },
    { "user": {...}, "action": "APPROVED", "stage": "LINE_MANAGER", "comment": "Justification and budget confirmed.", "at": "..." }
  ],
  "impact": { /* see 3.4 */ },
  "preflight": { /* see 3.5 */ },
  "availableActions": ["APPROVE", "SEND_BACK", "REJECT"]
}
```

**The route array is variable length.** Not every department has a Section
Head. Never hardcode six steps.

### 3.3 Subject — requisition

```jsonc
{
  "requestId": "OMS-2026-0148",
  "position": "Senior Cybersecurity Analyst",
  "department": { "id": "…", "name": "Digital Security" },
  "resources": 2,
  "engagementMonths": 12,
  "workLocation": "DIEZ_PREMISES",
  "expectedStart": "2026-09-01",
  "salaryGrade": "G8",
  "candidateRoute": "UNKNOWN",
  "justification": "…",
  "evidence": {
    "jobDescriptionAttached": true,
    "supportingDocumentCount": 3,
    "adHierarchyVerified": true
  },
  "attachments": [{ "id": "…", "name": "…", "sizeBytes": 0, "uploadedAt": "…" }]
}
```

### 3.4 Impact — the money 🔴

The best idea on the reference screen. Computed **server-side**, never in the
UI.

```jsonc
{
  "fundingRoute": "BUDGETED",
  "requested": 62000000,
  "availableBefore": 124000000,
  "reservedNow": 62000000,
  "remainingAfter": 62000000,
  "currency": "AED",
  "allocations": [
    { "budgetLineId": "…", "code": "CS-DIG-001", "name": "Cybersecurity Services FY2026", "amount": 40000000 },
    { "budgetLineId": "…", "code": "CS-DIG-002", "name": "Digital Transformation FY2026", "amount": 22000000 }
  ],
  "fundStateTransition": { "from": "RESERVED", "to": "LOCKED_ALLOCATED" },
  "periodOpen": true
}
```

`fundStateTransition` is stage-dependent — HOD approval moves Reserved →
Locked; earlier stages don't move funds at all and return `null`. The UI must
render whatever it's given rather than assuming the HOD case.

### 3.5 Preflight

```jsonc
{
  "checks": [
    { "code": "BUDGET_AVAILABILITY",   "label": "Budget availability",   "state": "PASSED" },
    { "code": "APPROVAL_ROUTE",        "label": "Approval route",        "state": "VERIFIED" },
    { "code": "SEGREGATION_OF_DUTIES", "label": "Segregation of duties", "state": "PASSED" },
    { "code": "PERIOD_OPEN",           "label": "Budget period open",    "state": "PASSED" }
  ],
  "allPassed": true,
  "blockingMessage": null
}
```

Any check failing sets `allPassed: false` and disables Approve — with the
reason stated, not a silently dead button.

### 3.6 Decisions

```
POST /api/v1/approvals/{taskId}/approve
POST /api/v1/approvals/{taskId}/send-back
POST /api/v1/approvals/{taskId}/reject
```

```jsonc
// request
{
  "comment": "…",                     // optional on approve, REQUIRED on send-back and reject
  "sendBackToStage": "REQUESTOR",     // send-back only
  "idempotencyKey": "uuid"            // REQUIRED on all three
}
```

Response returns the new task and subject state so the UI doesn't refetch and
guess.

**Non-negotiable server behaviour — document it explicitly:**

1. **Re-validate at decision time.** The `impact` figures the approver saw are a
   *preview*. Between page load and click, someone else may have reserved
   funds. The server re-runs the availability check inside the transaction and
   fails with `APPROVAL_BUDGET_CHANGED`, returning the new figures, if it no
   longer holds. This is the atomic check the reference screen promises.
2. **Idempotency is mandatory.** A double-click, a retry, or a flaky connection
   must not approve twice. Repeating a key returns the original result.
3. **Assignment re-check.** Verify the caller is still the assignee. Delegations
   expire; roles get revoked.
4. **Audit both identities** when acting under delegation — actor and principal.
5. **Comment required** on send-back and reject. Reject also requires a reason
   code.

### 3.7 Errors

| Code | Meaning | UI message |
| :--- | :--- | :--- |
| `APPROVAL_NOT_ASSIGNED` | No longer yours | "This is no longer waiting on you. It moved to HR Review." |
| `APPROVAL_ALREADY_DECIDED` | Someone else acted | "Already approved by Khalid Al Suwaidi." |
| `APPROVAL_BUDGET_CHANGED` | Funds moved | "The available budget changed while you were reviewing. Here are the current figures." |
| `APPROVAL_PERIOD_CLOSED` | Period closed | "The budget period closed. Reopen it before approving." |
| `APPROVAL_SELF` | Own request | "You can't approve a request you raised." |
| `APPROVAL_PREFLIGHT_FAILED` | A check failed | The specific check's message |

---

## Part 4 — Screens

### 4.1 My Approvals — inbox

`/app/approvals`

- Type tabs with counts: All · Requisitions · Budget · Other. Plus **Overdue**
  when any SLA is breached.
- Rows: subject reference, title, context, stage badge, amount, waiting-since,
  SLA indicator, and a primary "Review" action.
- SLA: green over 7 days, amber 3–7, red under 3 or breached. The 30-day
  auto-close makes this real — an ignored request closes itself and releases
  the funds.
- Role-queue items show **Claim** instead of Review, and a claimed-by badge once
  taken.
- Delegated items carry an "Acting for Khalid" chip.
- Empty state: *"Nothing waiting on you."* — a good state, not a sad one.
- **No bulk approve.** Every one of these moves money or headcount.

### 4.2 Decision screen

`/app/approvals/{taskId}`

Header: breadcrumb, position as title, `OMS-2026-0148 · Digital Security
Department` beneath, stage badge, submitted date right-aligned.

**Route stepper** — horizontal, data-driven from `route`. Complete steps show a
check and the approver's name; the current step is filled; pending steps are
numbered and muted. Variable length. Each completed step shows its timestamp on
hover.

Two columns, `1fr 420px`:

**Left**
- Request summary — a definition grid, not free-floating pairs
- Business justification — full text, never truncated. It's the reason to
  approve.
- Evidence chips: job description, supporting documents (count links to them),
  AD hierarchy verified
- Approval history — vertical timeline, name, action, comment, timestamp

**Right**
- **Budget validation** — funding route, requested, available before, reserved
  now, remaining after, plus the before/after bar. Status badge: funds
  available or not.
- **Budget allocation** — the lines funding this, with a total. Multi-line is an
  RFP requirement.
- **Fund state on approval** — `Reserved → Locked & Allocated` as two pills with
  an arrow, plus the note about the availability check. Omitted entirely when
  the stage doesn't move funds.
- **Preflight checks** — each with its state.

**Decision bar** — sticky at the bottom of the right column:
- The audit note: *"Your decision and the budget before/after values will be
  written to the audit history."*
- **Approve** (primary) · **Send back** (outline) · **Reject** (danger outline)
- Approve disabled with a stated reason when `allPassed` is false.

### 4.3 Decision dialogs

| Action | Comment | Extra |
| :--- | :--- | :--- |
| Approve | Optional | Confirmation restating the money: *"AED 620,000 will move from Reserved to Locked & Allocated."* |
| Send back | **Required** | Choose which stage to return to. Default: the requester. |
| Reject | **Required** | Reason code plus free text. Warns that reserved funds are released and the request closes. |

Reject is final and releases funds. Its confirmation must say so plainly.

### 4.4 Read-only view

Anyone in scope who isn't the assignee sees the identical screen **minus the
decision bar**, with a line at the top: *"Awaiting HOD approval — Khalid Al
Suwaidi, since 5 Aug."*

Not a stripped-down page. Same information, no actions.

### 4.5 Delegated view

Full decision screen with a persistent banner: *"You're acting for Khalid Al
Suwaidi until 15 Aug. Your decision will be recorded under both names."*

---

## Part 5 — Prompts

### AP1 — API contract

```
Read docs/APPROVAL-WORKFLOW-SPEC.md, then CLAUDE.md, BUDGET-API-CONTRACT.md and
DOMAIN-3-USER-ADMINISTRATION.md.

Write docs/APPROVAL-API-CONTRACT.md from Part 3. The backend does not exist —
this is the contract it will be built to match.

Include every endpoint, request shape, response shape, error code, and required
permission. Copy the Part 3 JSON shapes exactly.

State prominently, at the top and in every money field description:
ALL MONETARY VALUES ARE INTEGERS IN MINOR UNITS. Same rule as the budget
contract.

Document Part 3.6's five server behaviours as REQUIREMENTS, not suggestions.
Explain each rationale:
- Re-validation at decision time, because the impact figures the approver saw
  are a preview and funds may have moved
- Mandatory idempotency keys, because a double-click must not approve twice
- Assignment re-check, because delegations expire
- Dual-identity audit under delegation
- Comment required on send-back and reject

Also document the visibility model from Part 2 as an API-level concern:
GET /approvals returns ONLY the caller's own tasks. It is not a filtered view
of all pending approvals — the filtering happens server-side and there is no
parameter to widen it.

Then build TypeScript types and a fixtures module using the reference data:
OMS-2026-0148, Senior Cybersecurity Analyst, Digital Security, 2 resources,
12 months, AED 620,000 requested, 1,240,000 available before, 620,000 remaining
after, allocated 400,000 + 220,000 across two lines, currently at HOD in a
6-step route.

Include fixture variants: a 4-step route with no Section Head, a role-queue
task, a delegated task, a breached-SLA task, and a failing-preflight task.

No UI in this task.
```

✅ `feat(approvals): define approval API contract and fixtures`

---

### AP2 — Visibility 🔴

```
Plan first. This is the security boundary — show me the plan.

Implement the Part 2 visibility model as shared logic, before any screen.

Three separate rights, and they must not be conflated:
1. See the request exists — org scope + REQUISITION.VIEW
2. See approval detail — org scope + permission
3. ACT on the approval — task assignment ONLY

Build:
- useApprovalPermissions(task) returning { canAct, canView, actingFor,
  readOnlyReason }
- An ApprovalGuard wrapper rendering the decision bar only when canAct is true

Non-negotiable:
- The decision bar is ABSENT for non-assignees, never disabled. A disabled
  Approve button invites "why can't I?" and leaks that an action exists.
- /app/approvals renders ONLY the caller's tasks. There is no filter, toggle, or
  URL parameter that widens it to other people's approvals.
- A delegate gets canAct true with actingFor populated.
- The requester never gets canAct on their own request, at any stage.
- Out-of-scope requests render a genuine 404, not "access denied".

canAct must derive from the server's `canAct` field, never from client-side
role comparison. The client may render based on it; it must never compute it.

In your plan, state how you prevent a non-assignee from triggering a decision
by any route — direct URL, stale page, or a task that moved on while open.
```

🛑 Read the plan. Then verify by hand: open an approval as a non-assignee and
confirm no decision affordance exists anywhere in the DOM.

✅ `feat(approvals): implement approval visibility model`

---

### AP3 — Inbox

```
Build /app/approvals per Part 4.1.

- Type tabs with counts: All, Requisitions, Budget, Other. Add an Overdue tab
  that appears only when something is breached.
- Rows: subject reference (mono), title, context, stage badge, amount,
  waiting-since, SLA indicator, primary Review action.
- SLA colours: green over 7 days, amber 3-7, red under 3 or breached. This is
  real — the 30-day auto-close releases funds on an ignored request, so the
  indicator is a warning, not decoration.
- Role-queue items show Claim instead of Review, with a claimed-by badge once
  taken and a Release action for the claimer.
- Delegated items carry an "Acting for {name}" chip.
- Empty: "Nothing waiting on you." Treat it as a good state — no sad
  illustration, no apology.
- NO BULK APPROVE. Every item here moves money or headcount. Do not add
  multi-select.
- Amounts through lib/money.ts. Exact, never abbreviated.

Reuse DataTable and StatusBadge. Server-side pagination via the Step 0
framework.
```

✅ `feat(approvals): add approvals inbox`

---

### AP4 — Decision screen shell and route stepper

```
Build /app/approvals/{taskId} shell per Part 4.2.

1. Header: breadcrumb, position as title, "OMS-2026-0148 · Digital Security
   Department" beneath, stage badge, submitted date right-aligned.

2. Route stepper — horizontal, DATA-DRIVEN from the route array. Complete steps
   show a check plus the approver's name; the current step is filled and
   prominent; pending steps are numbered and muted. Timestamp on hover for
   completed steps.

   CRITICAL: the route is VARIABLE LENGTH. Not every department has a Section
   Head. Do not hardcode six steps. Test with the 4-step fixture.

3. Two-column body, 1fr 420px, 24px gap. Right column stacks below 1280px.

4. Loading: skeleton matching the final layout, including the stepper at the
   correct step count once known.

5. The whole screen loads from ONE call to GET /approvals/{taskId}. An approver
   must not wait on four requests to see one decision.

Use the existing app shell. Breadcrumb is the title per APP-SHELL-SPEC.md.
```

✅ `feat(approvals): add decision screen shell and route stepper`

---

### AP5 — Left column

```
Build the left column per Part 4.2.

1. Request summary as a definition grid: resources, engagement, work location,
   expected start, salary grade, candidate route. Aligned columns, not
   free-floating pairs.
2. Business justification — full text, NEVER truncated, no "read more". This is
   the reason the approver is being asked to approve; hiding it defeats the
   screen.
3. Evidence chips: job description attached, N supporting documents (the count
   links to them), AD hierarchy verified. Each with a check or paperclip icon.
   A missing item shows as absent-and-flagged, not silently omitted — an
   approver needs to know the job description ISN'T attached.
4. Approval history as a vertical timeline: name, action, comment, timestamp.
   Reuse the stepper pattern from ORG-UNIT-DETAIL-SPEC.md §3.7 — numbered
   circles with a connector rule.
5. Dates as "4 Aug 2026, 09:18". Never ISO.

Every string in plain language. No status codes visible.
```

✅ `feat(approvals): add request summary and history`

---

### AP6 — Budget impact 🔴

```
Build the right column's budget panels per Part 4.2. This is the most important
part of the screen — it shows the approver the financial consequence before
they click.

1. Budget validation: funding route, requested, available before approval,
   reserved now, remaining after approval. Plus the before/after bar showing
   the proportion reserved versus remaining. Status badge for funds
   available/unavailable.

2. Budget allocation: the budget lines funding this request with amounts and a
   total. Multi-line allocation is an RFP requirement — never assume one line.
   Period-open badge.

3. Fund state on approval: two pills with an arrow, "Reserved → Locked &
   Allocated", plus the note that the availability check runs on approval.
   OMIT THIS PANEL ENTIRELY when fundStateTransition is null — earlier approval
   stages don't move funds, and showing a transition that won't happen is a lie.

4. Preflight checks: each with its state — budget availability, approval route,
   segregation of duties, period open.

ALL figures come from the server's impact object. Compute NOTHING in the UI —
not the remainder, not the percentage, not the total. If the client calculates
a figure the server didn't send, the two will disagree eventually and the
approver will trust the wrong one.

All amounts through lib/money.ts, exact, tabular-nums. Reuse FundStateBar from
the budget work rather than building a second bar.
```

🛑 Verify every displayed figure traces to a server field. Grep for arithmetic
in this component.

✅ `feat(approvals): add budget impact panel`

---

### AP7 — Decision bar and dialogs

```
Build the decision bar and the three dialogs per Part 4.2 and 4.3.

Decision bar — sticky at the bottom of the right column:
- Audit note: "Your decision and the budget before/after values will be written
  to the audit history."
- Approve (primary), Send back (outline), Reject (danger outline).
- Approve disabled with a STATED REASON when preflight.allPassed is false —
  never a silently dead button.
- The whole bar renders only when canAct is true, per AP2.

Dialogs:
- Approve — optional comment. Confirmation restates the money: "AED 620,000
  will move from Reserved to Locked & Allocated."
- Send back — comment REQUIRED, plus a stage selector defaulting to the
  requester.
- Reject — reason code plus free text, both REQUIRED. Warns plainly that
  reserved funds are released and the request closes. This is final.

Every submission sends an idempotencyKey. Generate it once when the dialog
opens, not per attempt, so a retry reuses it.

Error handling per Part 3.7 — each code gets its specific plain message:
- APPROVAL_BUDGET_CHANGED: show the new figures inline and ask them to review
  again. Do NOT silently re-submit.
- APPROVAL_ALREADY_DECIDED: name who decided, and offer to view the request.
- APPROVAL_NOT_ASSIGNED: say where it moved to.
- APPROVAL_SELF: "You can't approve a request you raised."

Disable the buttons during submission and show progress. A double-click must
not fire twice even before the server's idempotency check catches it.
```

✅ `feat(approvals): add decision bar and dialogs`

---

### AP8 — Read-only and delegated views

```
Build the two alternate views per Part 4.4 and 4.5.

Read-only (canAct false, canView true):
- The IDENTICAL screen minus the decision bar. Not a stripped-down page — same
  summary, same history, same budget panels.
- A line at the top: "Awaiting HOD approval — Khalid Al Suwaidi, since 5 Aug."
- No decision affordance anywhere in the DOM.

Delegated (canAct true, actingFor set):
- The full decision screen plus a persistent banner: "You're acting for Khalid
  Al Suwaidi until 15 Aug. Your decision will be recorded under both names."
- The banner stays visible while scrolling — it must not be missable.
- Dialog confirmations repeat the acting-for context.

Also add the read-only approval view to the request detail page, so anyone in
scope can see where a request sits in its route without visiting /approvals.
```

✅ `feat(approvals): add read-only and delegated views`

---

### AP9 — Verify

```
Verify the approval flow. Report: check | expected | actual | pass.

VISIBILITY — highest priority
1. Sign in as a non-assignee in scope: the decision bar is ABSENT, not disabled.
   Inspect the DOM to confirm no hidden buttons.
2. Confirm /app/approvals shows only the caller's tasks, and that no filter,
   toggle, or URL parameter widens it.
3. Confirm the requester cannot act on their own request at any stage.
4. Confirm an out-of-scope request returns 404, not 403.
5. Confirm canAct comes from the server field and is never computed client-side.
   Grep for role-name comparisons in approval components.

ROUTE
6. Test the 4-step fixture with no Section Head — the stepper must not assume
   six.
7. Test a role-queue task: Claim, claimed-by badge, Release.
8. Test a delegated task: banner persists on scroll, dialogs repeat the context.

MONEY
9. Confirm every figure in the budget panel traces to a server field. Grep for
   arithmetic in the component.
10. Confirm the fund-state panel is absent when fundStateTransition is null.
11. Amounts exact everywhere, tabular-nums, through lib/money.ts.

DECISIONS
12. Approve disabled with a stated reason when preflight fails.
13. Every error code from Part 3.7 renders its specific message.
14. APPROVAL_BUDGET_CHANGED shows new figures and does NOT auto-resubmit.
15. Double-click Approve fires exactly one request.
16. Send back and Reject both block submission without a comment.

REST
17. Responsive: 1440, 1280, 1024, 768.
18. Light and dark theme.
19. Keyboard: reach the stepper, every panel, and all three decisions.
20. Justification text is never truncated.
```

🛑 Final gate.

---

## Part 6 — Questions for DIEZ

1. **If the HOD is the requester, who approves?** Segregation of duties says not
   them. Escalate to the next level, or route to a peer HOD?
2. **Can HR Review be claimed by any HR user,** or is it assigned to a named
   person?
3. **Send back — which stages can it target?** Always the requester, or any
   earlier stage?
4. **What happens to an approval task when its assignee leaves or is
   deactivated?** Auto-reassign to their replacement in the org tree, or hold
   for an administrator?
5. **Does the SLA clock pause while a request is sent back?** The 30-day
   auto-close is severe; a request sent back and returned should probably
   restart rather than continue.
