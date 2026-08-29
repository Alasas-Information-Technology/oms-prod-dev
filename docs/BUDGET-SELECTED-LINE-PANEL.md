# Budget Control Center — Selected Line Panel

Replaces the Period Governance and Fund State Monitor panels with a single
master-detail arrangement driven by budget line selection.

**Supersedes prompts B7 and B8 of `BUDGET-CONTROL-CENTER-UI.md`.** Everything
else in that document stands, including all of Part 4 (money).

---

## Part 1 — What's wrong now

### 1.1 Period governance is the wrong scope

A budget period belongs to a **department**, not a budget line. FY 2026 being
open, its three-level approval, and its amendment history apply to every line
in Digital Security simultaneously.

Rendering it beside a selected line implies each line carries its own period.
It doesn't. Finance will notice.

### 1.2 It's also duplicated

"Manage Period" already exists in the page header. The panel repeats it. Period
management happens at year open and year close — twice a year — and currently
occupies roughly a third of the page permanently.

### 1.3 The Fund State Monitor shows a request, not a line

The reference pins it to `OMS-2026-0148` — a single **request** moving through
Submitted → HOD approved → Work completion → Release.

That's a request lifecycle. A budget line has many requests, each with its own
lifecycle, and holds amounts in several states at once. The stepper is the
right visual for a request and the wrong one for a line.

---

## Part 2 — The fix

Three moves:

| Element | From | To |
| :--- | :--- | :--- |
| Period governance detail | A permanent panel | A dialog behind the header's existing "Manage period" |
| Period **state** | Buried in that panel | A slim context strip at the top of the line panel — because it gates what you can do |
| Fund movements | A request stepper pinned to nothing | A chronological ledger for the selected line |
| Request stepper | The budget page | The request detail page, where it belongs |

Result: the right column becomes entirely about the selected line, the header
carries page-level context, and nothing claims a scope it doesn't have.

---

## Part 3 — Layout

Master-detail. Table left, panel right, sticky.

```
┌────────────────────────────────────┬──────────────────────────────────┐
│ Budget lines                       │ FY 2026 · Open — changes allowed │
│ ○ CS-DIG-001 Cybersecurity …       │                        Manage  › │
│ ● CS-DIG-002 Digital Transform…    │ ──────────────────────────────── │
│ ○ CS-DIG-003 Technology Ops        │ CS-DIG-002                       │
│                                    │ Digital Transformation           │
│ Showing 3 of 3                     │ AED 2,400,000.00                 │
│                                    │                                  │
│ Requests & exceptions              │ ▓▓▓▓░░▒▒▒▒▒░░░░░░░░░░░           │
│  3 unbudgeted · 2 top-up           │ Reserved   420,000.00            │
│  4 amendments · 1 exception        │ Locked     880,000.00            │
│                                    │ Consumed   300,000.00            │
│ OMS-2026-0152 Unbudgeted Approved  │ Available  800,000.00            │
│ OMS-2026-0146 Top-up    Awaiting   │ ──────────────────────────────── │
│ OMS-2026-0131 Variance  Exception  │ FUND MOVEMENTS                   │
│                     View all →     │ 5 Aug  OMS-…0148  Locked   620k  │
│                                    │ 4 Aug  OMS-…0148  Reserved 620k  │
│                                    │ 2 Aug  OMS-…0141  Consumed 300k  │
│                                    │                 View ledger  ›   │
│                                    │ ──────────────────────────────── │
│                                    │ REQUESTS ON THIS LINE         2  │
│                                    │ OMS-…0146  Top-up    Awaiting    │
│                                    │ OMS-…0131  Variance  Exception   │
│                                    │ ──────────────────────────────── │
│                                    │ [Raise amendment]                │
└────────────────────────────────────┴──────────────────────────────────┘
```

- Grid `1fr 420px`, 24px gap.
- Panel sticky, 24px from the top of the content region.
- Below 1280px the panel moves beneath the table.
- Below 1024px selecting a row opens the panel as a drawer instead.

---

## Part 4 — The panel

### 4.1 Period context strip

A single row at the top, above the line identity:

| Period state | Strip |
| :--- | :--- |
| Open | *"FY 2026 · Open — changes allowed"* |
| Closed | *"FY 2026 · Closed — no changes possible"*, neutral tint |
| Pending approval | *"FY 2026 · Closing — awaiting Finance HOD"*, amber tint |

Right-aligned **Manage ›** opens the period dialog. Visible only with
`BUDGET.PERIOD.MANAGE`.

This is honest about scope: it says *this line sits in this period*, not *this
period belongs to this line*. And it earns its place, because a closed period
disables every action below it.

When the period is closed, the panel's actions are disabled and this strip is
the stated reason.

### 4.2 Line identity

- Code in mono, 12px, muted.
- Name 18px/600.
- Total amount 15px, exact, `tabular-nums`.
- A `⋯` menu on the right: view full ledger, export line, raise amendment.

### 4.3 Fund state for this line

The same stacked bar component as the page KPI strip, scoped to this line, with
a four-row legend beneath showing exact amounts right-aligned.

**Reuse `FundStateBar` from prompt B2.** Same component, same colours, same
sum-mismatch warning. A second implementation is how the two drift apart.

### 4.4 Fund movements — a ledger, not a stepper

Chronological, most recent first. Each row:

```
5 Aug 2026   OMS-2026-0148   Locked & allocated    620,000.00
```

Date · request (link) · event · amount, with the amount right-aligned.

Show the most recent 5, then **View ledger ›** to the full transaction list.

Movements that decrease a state show the amount with a leading minus in red —
a release returning funds is not the same as a reservation consuming them, and
the sign is how you tell.

Empty: *"No movements yet on this budget line."*

### 4.5 Requests on this line

Only requests touching this line. Request ID, type, status badge, amount.
Count in the section header. Links to the request detail.

This is the drill-down path to the stepper: the request lifecycle
(Submitted → HOD approved → Work completion → Release) lives on the request
page, where it describes exactly one thing.

Empty: *"No open requests on this line."*

### 4.6 Nothing selected

Don't render an empty panel. Show department-level context:

- The department's fund state bar
- The 5 most recent movements across all its lines
- A quiet line: *"Select a budget line to see its detail."*

The panel stays useful before the first click.

---

## Part 5 — Period dialog

Everything from the old Period Governance panel, opened from either the header
button or the strip's Manage link:

- Period, status, last amended
- Three-level approval progress
- Approval history: role, name, timestamp
- Amend period · Close period · Reopen period
- The note: *"Reopening requires the same three-level approval."*

Gated on `BUDGET.PERIOD.MANAGE`. Closing and reopening confirm, naming how many
budget lines and open requests are affected — a period close is not a small
action.

---

## Part 6 — Prompts

### BL1 — Move period governance into a dialog

```
Read docs/BUDGET-SELECTED-LINE-PANEL.md, then CLAUDE.md and
BUDGET-CONTROL-CENTER-UI.md.

This supersedes prompts B7 and B8 of the Budget Control Center spec.

1. REMOVE the standalone Period Governance panel from the page.
2. Move its entire contents into a dialog per Part 5, opened from the existing
   "Manage period" button in the page header. That button already exists — the
   panel duplicated it.
3. The dialog holds: period, status, last amended, three-level approval
   progress, approval history with role/name/timestamp, Amend / Close / Reopen,
   and the note "Reopening requires the same three-level approval."
4. Gate on BUDGET.PERIOD.MANAGE.
5. Closing or reopening confirms first, naming how many budget lines and open
   requests are affected. A period close is not a small action.

Reason for the change: a period belongs to a DEPARTMENT and governs every line
in it. Rendering it beside a selected line implies each line has its own
period, which is false. And period management happens twice a year — it should
not occupy a third of the page permanently.
```

✅ `refactor(budget): move period governance into a dialog`

---

### BL2 — Selected line panel

```
Build the selected line panel per Part 3 and Part 4. This replaces the Fund
State Monitor.

1. Grid 1fr 420px, 24px gap. Panel sticky 24px from the top of the content
   region. Below 1280px it moves beneath the table; below 1024px selecting a
   row opens it as a drawer.

2. Period context strip per 4.1 — a single row at the top with the three states
   and their exact wording. Right-aligned "Manage ›" opening the BL1 dialog,
   visible only with BUDGET.PERIOD.MANAGE. When the period is closed, every
   action in the panel is disabled and this strip is the stated reason.

3. Line identity per 4.2: code in mono 12px muted, name 18px/600, exact total
   with tabular-nums, and a ⋯ menu holding view ledger, export line, raise
   amendment.

4. Fund state bar per 4.3 — REUSE FundStateBar from prompt B2 scoped to this
   line. Do not write a second implementation; that is how the two drift apart.
   Four-row legend beneath with exact amounts, right-aligned.

5. Fund movements per 4.4 — a chronological LEDGER, not a stepper. Rows of
   date · request link · event · amount. Most recent 5, then "View ledger ›".
   Movements that decrease a state show a leading minus in red — a release
   returning funds must be visually distinct from a reservation.

6. Requests on this line per 4.5 — filtered to this line only, with a count in
   the section header, linking to request detail.

7. Nothing selected per 4.6: show the department fund bar, the 5 most recent
   movements across all lines, and "Select a budget line to see its detail."
   Never render an empty panel.

All amounts through lib/money.ts from prompt B2. Exact, never abbreviated.

Note: the request lifecycle stepper (Submitted → HOD approved → Work completion
→ Release) does NOT belong here. It describes one request, not one line. It
lives on the request detail page.
```

✅ `feat(budget): add selected line detail panel`

---

### BL3 — Wire up selection

```
Connect the budget lines table to the panel.

1. Selecting a row populates the panel. Selection persists in the URL as
   ?line={id} so a selected view is shareable and the back button works.
2. Clicking the budget code still navigates to the line's full ledger — only
   clicking elsewhere in the row selects.
3. The selected row is clearly highlighted in the table.
4. Changing any filter clears the selection and returns the panel to its
   nothing-selected state.
5. Keyboard: up and down arrows move selection between rows when the table has
   focus; Enter opens the full ledger.
6. The panel shows a skeleton while loading, never a spinner, and never
   collapses to zero height between selections — the layout must not jump.
7. Below 1024px, row selection opens the drawer; closing it clears ?line=.

Verify: select a line, reload the page, and confirm the same line is still
selected.
```

✅ `feat(budget): wire line selection to detail panel`

---

### BL4 — Verify

```
Verify the selection behaviour. Report: check | expected | actual | pass.

1. Period governance no longer appears as a page panel; the dialog opens from
   the header button and from the strip's Manage link.
2. The period context strip shows correct wording for open, closed, and pending
   approval.
3. With the period closed, every panel action is disabled and the strip states
   why.
4. Selecting a line updates the panel and sets ?line={id}.
5. Reloading with ?line={id} restores the selection.
6. Changing a filter clears the selection and the panel returns to its
   department summary.
7. The panel never renders empty — with nothing selected it shows department
   context.
8. Fund movements show a leading minus in red for decreasing events.
9. The panel's fund bar is the same FundStateBar component as the KPI strip —
   grep to confirm there is only one implementation.
10. Amounts are exact everywhere in the panel, never abbreviated.
11. Layout does not jump when switching between lines.
12. Responsive: 1440, 1280 (panel moves below), 1024 (drawer), 768.
13. Keyboard: arrows move selection, Enter opens the ledger, the panel is
    reachable by tab.
14. A user without BUDGET.PERIOD.MANAGE sees no Manage link and no period
    dialog, and the page still looks deliberate.
```

🛑 Final gate.