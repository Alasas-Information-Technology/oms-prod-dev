# Approvals in the Requests Workspace

**Amends `APPROVAL-WORKFLOW-SPEC.md`.** Parts 1, 2, 3 and 6 stand unchanged —
the generic engine, the visibility model, and the API contract are unaffected.

Parts 4 and 5 are replaced by this document.

---

## Part 1 — What changes

| | Before | Now |
| :--- | :--- | :--- |
| Approver inbox | `/app/approvals` | `/app/requests?tab=needs-my-action` |
| Decision screen | `/app/approvals/{taskId}` | `/app/requests/{id}` in decision mode |
| Task identity | Task is the object | Request is the object; the task is a state of it |
| API | Unchanged | Unchanged — see Part 4 |

`/app/approvals` is deleted. `GET /api/v1/approvals` still exists and still
returns only the caller's tasks; the Requests workspace consumes it to resolve
which rows need action and what the action is.

**The visibility model does not change.** Seeing a request is governed by org
scope. Acting on it is governed by task assignment. The decision bar is absent,
not disabled, for non-assignees.

---

## Part 2 — Where non-requisition approvals go 🔴

Requisition approvals live in Requests. The other seven types need a home.

**Each approval type lives in its own module's "Needs my action" tab.**

| Type | Lives in |
| :--- | :--- |
| Requisition | `/app/requests` |
| Budget amendment, period close | `/app/budget` |
| Interview bypass | `/app/candidates` |
| Closure, termination, replacement | `/app/workforce` |
| Leave | `/app/leave` |
| Vendor rate card | `/app/vendors` |

Rationale: an approver deciding on a vendor rate card needs vendor context, not
a generic queue. The decision happens where the evidence is.

**Cross-type awareness lives on the Dashboard**, which already exists in the IA
and already promises "pending approvals". It aggregates counts across every
module and links through:

```
Needs your attention
  4  Requisitions      →
  1  Budget amendment  →
  2  Interview bypass  →
```

Plus a count badge in the global header. That gives one place to see *what*
needs you, and the module gives the place to *do* it. No separate approvals
page.

**Every module reuses the same components** built here. Only the context panel
differs per type.

---

## Part 3 — Needs My Action

The tab is broader than approvals — it's everything the request lifecycle needs
from this user. That breadth is the reason this placement is better than a
separate page.

### Action types

| Code | Label | Who | Trigger |
| :--- | :--- | :--- | :--- |
| `APPROVE` | Approve | Current assignee | Awaiting your decision |
| `REVISE` | Revise and resubmit | Requester | Sent back with comment |
| `CLARIFY` | Answer a question | Requester | HR asked for more information |
| `COMPLETE_DRAFT` | Finish the draft | Requester | Never submitted |
| `REVIEW_CANDIDATES` | Review candidates | Main interviewer | CVs submitted |
| `CONFIRM_JOINING` | Confirm joining | Line manager | Start date reached |
| `LOG_COMPLETION` | Log monthly value | WC assignee | Monthly entry due |

### Sub-filters

Chips beneath the tab, since "needs my action" mixes very different work:

```
All 7    Approvals 2    Needs revision 1    Drafts 1    Other 3
```

### Row treatment

The existing table already has a **Next Action** column with a button. Approval
items use it directly — no new column.

- `APPROVE` → primary button **Review & approve**
- Everything else keeps its existing label
- Amount column shows the value under decision, exact
- **SLA indicator** on rows with a deadline: green over 7 days, amber 3–7, red
  under 3 or breached. The 30-day auto-close releases funds and closes the
  request, so this is a warning, not decoration.
- Role-queue items (HR Review, Procurement) show **Claim** until taken, then a
  claimed-by badge
- Delegated items carry an "Acting for Khalid" chip

### Ordering

Default sort: SLA urgency first, then oldest. An approver working top-down
should be working the right things.

### Empty

*"Nothing waiting on you."* A good state — no apologetic illustration.

### Not allowed

**No bulk approve.** Every one of these moves money or headcount.

---

## Part 4 — Decision mode

`/app/requests/{id}` gains a decision mode rather than a separate route.

### When `canAct` is true

The request detail page renders, and:

1. The **route stepper** appears below the header — data-driven, variable
   length, current step highlighted.
2. A **decision panel** occupies the right column: budget validation, budget
   allocation, fund state transition, preflight checks.
3. A **sticky decision bar** at the bottom: the audit note, then Approve, Send
   back, Reject.
4. Existing tabs stay — an approver can still open Documents or Timeline
   without losing the decision bar.

### When `canAct` is false

Identical page, **no decision bar**, plus a line under the header:

> Awaiting HOD approval — Khalid Al Suwaidi, since 5 Aug.

The route stepper still shows. Anyone in scope should be able to see where a
request sits.

### Delegated

Full decision mode plus a persistent banner: *"You're acting for Khalid Al
Suwaidi until 15 Aug. Your decision will be recorded under both names."*
Sticky — it must not scroll out of view.

### Arriving from the tab

Clicking **Review & approve** opens `/app/requests/{id}?action=approve`, which
scrolls the decision panel into view and focuses it. The parameter affects
scroll position only — it never grants the right to act. That comes from
`canAct`.

### Returning

Back returns to `?tab=needs-my-action` with filters and scroll position intact.
After a decision, return to the tab with a confirmation and the item removed.

---

## Part 5 — Prompts

Replaces AP3–AP8. **AP1 (contract) and AP2 (visibility) are unchanged — run
those first.**

### AP3r — Needs My Action tab

```
Read docs/APPROVALS-IN-REQUESTS.md and docs/APPROVAL-WORKFLOW-SPEC.md, then
CLAUDE.md.

Approvals move into the Requests workspace. There is no /app/approvals page.

Extend the existing "Needs My Action" tab in RequestWorkspace per Part 3.

1. The tab consumes GET /api/v1/approvals to resolve which rows need action and
   what kind. It also covers non-approval actions — revisions, clarifications,
   drafts, candidate reviews, joining confirmations, monthly logging. Support
   all seven action types from the Part 3 table.
2. Sub-filter chips beneath the tab: All, Approvals, Needs revision, Drafts,
   Other — each with a count.
3. Reuse the EXISTING Next Action column. APPROVE items get a primary "Review &
   approve" button. Do not add a new column.
4. Add an SLA indicator to rows with a deadline: green over 7 days, amber 3-7,
   red under 3 or breached. The 30-day auto-close releases funds and closes the
   request — this is a warning, not decoration.
5. Role-queue items show Claim until taken, then a claimed-by badge and a
   Release action for the claimer.
6. Delegated items carry an "Acting for {name}" chip.
7. Default sort: SLA urgency, then oldest first.
8. Empty: "Nothing waiting on you." Treat it as a good state.
9. NO BULK APPROVE. Do not add multi-select to this tab.
10. Amounts through lib/money.ts, exact.

The tab count badge reflects the total across all action types.
```

✅ `feat(requests): extend needs-my-action with approval tasks`

---

### AP4r — Decision mode on request detail

```
Add decision mode to /app/requests/{id} per Part 4. Do NOT create a separate
approval route.

1. Route stepper below the header — data-driven from the route array, VARIABLE
   LENGTH. Not every department has a Section Head; test with the 4-step
   fixture. Complete steps show a check and the approver's name, current step
   is filled, pending steps are numbered and muted.

2. The stepper renders for EVERYONE in scope, not just the assignee. Seeing
   where a request sits is a scope right, not an assignment right.

3. When canAct is true: decision panel in the right column and a sticky decision
   bar at the bottom.

4. When canAct is false: identical page, NO decision bar, plus a line under the
   header — "Awaiting HOD approval — Khalid Al Suwaidi, since 5 Aug."

5. Existing request tabs stay functional. An approver can open Documents or
   Timeline without losing the decision bar.

6. ?action=approve scrolls the decision panel into view and focuses it. It
   affects scroll position ONLY — it must never grant the right to act. That
   comes from the server's canAct field, per AP2.

7. Back returns to ?tab=needs-my-action with filters and scroll intact.

Everything loads from one call to GET /approvals/{taskId} alongside the request
data. An approver must not wait on four requests to see one decision.
```

✅ `feat(requests): add approval decision mode to request detail`

---

### AP5r — Decision panel

```
Build the decision panel per APPROVAL-WORKFLOW-SPEC.md Part 4.2, rendered in
the right column of the request detail page.

1. Budget validation: funding route, requested, available before approval,
   reserved now, remaining after approval, plus the before/after bar. Status
   badge for funds available.

2. Budget allocation: the budget lines funding this request with amounts and a
   total. Multi-line is an RFP requirement — never assume one line.

3. Fund state on approval: two pills with an arrow, "Reserved → Locked &
   Allocated", plus the note about the availability check.
   OMIT THE PANEL ENTIRELY when fundStateTransition is null — earlier stages
   don't move funds, and showing a transition that won't happen is a lie.

4. Preflight checks with their states.

ALL figures come from the server's impact object. Compute NOTHING in the UI —
not the remainder, not the percentage, not the total. A client-calculated figure
will eventually disagree with the server's and the approver will trust the wrong
one.

Amounts through lib/money.ts, exact, tabular-nums. Reuse FundStateBar from the
budget work — do not build a second bar.
```

🛑 Grep this component for arithmetic. Every figure must trace to a server
field.

✅ `feat(requests): add approval decision panel`

---

### AP6r — Decision bar and dialogs

```
Build the decision bar and dialogs per APPROVAL-WORKFLOW-SPEC.md Part 4.2 and
4.3.

Sticky decision bar at the bottom of the request detail page:
- Audit note: "Your decision and the budget before/after values will be written
  to the audit history."
- Approve (primary), Send back (outline), Reject (danger outline).
- Approve disabled with a STATED REASON when preflight.allPassed is false.
- The whole bar renders only when canAct is true, per AP2. Absent otherwise —
  never disabled.

Dialogs:
- Approve — optional comment. Confirmation restates the money: "AED 620,000
  will move from Reserved to Locked & Allocated."
- Send back — comment REQUIRED, plus a stage selector defaulting to the
  requester.
- Reject — reason code and free text, both REQUIRED. Warns plainly that
  reserved funds are released and the request closes.

Every submission sends an idempotencyKey generated once when the dialog opens,
so a retry reuses it. Disable buttons during submission.

Errors per Part 3.7, each with its specific plain message:
- APPROVAL_BUDGET_CHANGED — show the new figures inline and ask them to review
  again. Do NOT silently resubmit.
- APPROVAL_ALREADY_DECIDED — name who decided.
- APPROVAL_NOT_ASSIGNED — say where it moved to.
- APPROVAL_SELF — "You can't approve a request you raised."

After a successful decision, return to ?tab=needs-my-action with a confirmation
and the item removed from the list.
```

✅ `feat(requests): add approval decision bar and dialogs`

---

### AP7r — Delegated view and dashboard aggregation

```
Two pieces.

1. Delegated decision mode: full decision capability plus a persistent sticky
   banner — "You're acting for Khalid Al Suwaidi until 15 Aug. Your decision
   will be recorded under both names." It must not scroll out of view, and the
   dialog confirmations repeat the acting-for context.

2. Dashboard aggregation per Part 2. The Dashboard becomes the cross-type
   awareness surface now that there is no approvals page:

   Needs your attention
     4  Requisitions      →  /app/requests?tab=needs-my-action
     1  Budget amendment  →  /app/budget?tab=needs-my-action
     2  Interview bypass  →  /app/candidates?tab=needs-my-action

   Only render types with a count above zero. Add the total as a badge in the
   global header.

   Modules for budget, candidates, workforce, leave and vendors do not exist
   yet. Render their counts from fixtures and add:
   // TODO(module): wire when the module ships
   so each one has a checklist item.

The point of this: one place to see WHAT needs you, and the module is where you
DO it. No separate approvals page.
```

✅ `feat(requests): add delegated view and dashboard aggregation`

---

### AP8r — Verify

```
Verify. Report: check | expected | actual | pass.

PLACEMENT
1. /app/approvals does not exist and is not linked from anywhere.
2. Approvals appear in the Needs My Action tab with the correct action type.
3. All seven action types render with their correct labels and buttons.
4. Sub-filter chips filter correctly and counts are accurate.
5. Dashboard aggregation links to each module's tab.

VISIBILITY — highest priority
6. As a non-assignee in scope: the decision bar is ABSENT. Inspect the DOM to
   confirm no hidden buttons.
7. The route stepper IS visible to non-assignees — seeing where a request sits
   is a scope right.
8. ?action=approve does not grant the ability to act. Test as a non-assignee.
9. The requester cannot act on their own request at any stage.
10. Out-of-scope request returns 404, not 403.
11. Grep approval components for role-name comparisons — canAct must come from
    the server.

ROUTE AND MONEY
12. 4-step fixture renders correctly — no hardcoded six steps.
13. Fund-state panel absent when fundStateTransition is null.
14. Every budget figure traces to a server field. Grep for arithmetic.
15. Amounts exact, tabular-nums, through lib/money.ts.

DECISIONS
16. Approve disabled with a stated reason when preflight fails.
17. Double-click Approve fires exactly one request.
18. Send back and Reject block submission without a comment.
19. APPROVAL_BUDGET_CHANGED shows new figures and does not auto-resubmit.
20. After deciding, returns to the tab with the item removed.
21. Back from the detail preserves tab, filters, and scroll.

REST
22. Responsive 1440, 1280, 1024, 768. Light and dark.
23. Keyboard: tab through the stepper, panel, and all three decisions.
24. Delegated banner stays visible while scrolling.
```

🛑 Final gate.

---

## Part 6 — Additional question for DIEZ

Adds to the five in `APPROVAL-WORKFLOW-SPEC.md` Part 6:

6. **Should an approver be able to see the full request history — including
   comments between the requester and earlier approvers — before deciding?**
   The reference screen shows all prior comments. Confirm this is intended, or
   whether some stages should be private to their participants.
