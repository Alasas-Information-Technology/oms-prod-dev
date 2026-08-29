# Budget Control Center — UI

Route: `/app/budget`

**Backend does not exist yet.** Prompt B1 defines the API contract; the UI is
built against it with fixtures. The Budget domain is later built to match.

**Palette and shell unchanged** — the app shell, breadcrumb, and existing
components are already built.

---

## Part 1 — What the reference confirms

Useful corroboration for the Budget domain design:

| Reference | Our design |
| :--- | :--- |
| Fund states: Available → Reserved → Locked & Allocated → Consumed | Exactly the ledger states specced in Domain 2 §11.3 and the process gap analysis |
| Three-level period approval, reopening needs the same | RFP Master Data: *"close or reopen the period following a three-level approval process"* |
| Automatic release on rejection / closure | RFP Steps 13–14 |
| Multi-line allocation | RFP: *"multiple lines may be chosen as needed"* |
| Unbudgeted and top-up requests | RFP Step 1 and Step 7 |
| Reconciliation exceptions as a first-class item | Process gap analysis §2.3 — now confirmed as client expectation |
| Oracle reconciliation timestamp | System-of-record rule, gap analysis §3.1 |

The reference numbers are internally consistent (5.40 + 7.10 + 2.10 + 10.20 =
24.80, and every percentage checks out). Use them as fixture data.

---

## Part 2 — Changes from the reference

### 2.1 Selecting a budget line drives the right column 🔴

The reference has radio buttons on the budget lines table whose purpose is
never shown, and a "Fund State Monitor" pinned to one arbitrary request
(`OMS-2026-0148`) with no stated relationship to anything else on screen.

**Connect them.** Selecting a budget line populates the Fund State Monitor with
that line's fund movements. That gives the selection a purpose and the monitor
a reason to exist.

With nothing selected, the monitor shows the most recent movements across the
filtered department, with a quiet line saying so.

### 2.2 "Atomic HOD check" is engineering language

The Controls panel reads like a system health check written by the people who
built it. Finance staff shouldn't need to know what "atomic" means.

| Reference | Use |
| :--- | :--- |
| Atomic HOD check | **Double-spending prevented** |
| Multi-line allocation | **Funds can come from several budget lines** |
| Period validation | **Only open periods accept requests** |
| Automatic release on rejection/closure | **Unused funds return automatically** |
| Last Oracle reconciliation | **Last checked against Oracle** |

Keep the panel — for a government finance system, visible assurance that
controls are active has genuine value in an audit walkthrough. Rename it
**Safeguards**.

### 2.3 Period appears twice

It's in the header dropdown *and* the filter row. Consolidate: period lives in
the **header**, beside the open/closed badge, because it governs the entire
page rather than filtering part of it.

### 2.4 Money formatting is inconsistent

The reference shows "AED 3.20M" in one column and "1.25M" in the next. See
Part 4 — this is the single most error-prone thing on the page.

### 2.5 Scope-aware filters

Organisation / Business Unit / Department must respect the viewer's scope from
Domain 2 and 3. A department-scoped Finance Analyst gets those fields
**pre-filled and locked**, not as empty dropdowns they can't usefully change.

---

## Part 3 — Anatomy

```
Administration / Budget / Budget Control Center
                              FY 2026 ▾  [Open]  [Upload budget]  [Manage period]
──────────────────────────────────────────────────────────────────────────────
 ⬤ Total        ⬤ Available    ⬤ Reserved    ⬤ Locked         ⬤ Consumed
 AED 24.80M     AED 10.20M     AED 5.40M     AED 7.10M        AED 2.10M
──────────────────────────────────────────────────────────────────────────────
 ▓▓▓▓▓▓▓░░░░░░░░░░░░▒▒▒▒▒▒▒▒▒▒░░░░░░░░░░░░░░░░░░░░░░  = AED 24.80M
 Reserved 21.8%  Locked 28.6%  Consumed 8.5%  Available 41.1%
──────────────────────────────────────────────────────────────────────────────
 Organisation ▾   Business unit ▾   Department ▾        [search budget lines]
──────────────────────────────────────────────────────────────────────────────
┌────────────────────────────────────┬───────────────────────────────────────┐
│ Budget lines                       │ Period governance                     │
│ ○ CS-DIG-001  Cybersecurity …      │ FY 2026 · Open · Last amended 1 Aug   │
│ ● CS-DIG-002  Digital Transform…   │ Three-level approval  Completed       │
│ ○ CS-DIG-003  Technology Ops       │ [Amend period]  [Close period]        │
│                                    │ ① Finance Analyst  1 Aug 09:10        │
│ Requests & exceptions              │ ② Finance Manager  1 Aug 10:25        │
│  3 unbudgeted · 2 top-up           │ ③ Finance HOD      1 Aug 11:05        │
│  4 amendments · 1 exception        │ ⓘ Reopening needs the same approvals  │
│                                    │───────────────────────────────────────│
│ OMS-2026-0152  Unbudgeted  Approved│ Fund movements — CS-DIG-002           │
│ OMS-2026-0146  Top-up      Awaiting│ ① Submitted    4 Aug   Reserved 620k  │
│ OMS-2026-0131  Variance    Exception│ ② HOD approved 5 Aug   Locked 620k    │
│                    View all →      │ ③ Work completion  —   Not started    │
│                                    │───────────────────────────────────────│
│                                    │ Safeguards                            │
└────────────────────────────────────┴───────────────────────────────────────┘
 [Export report]  [Approval history]
```

Grid: `1fr 420px`, 24px gap. Right column stacks below the left under 1280px.

### Sections

**Header** — title, period selector with open/closed badge, Upload budget
(ghost), Manage period (primary). One filled button only.

**KPI strip** — five cards. Total is visually distinct; the other four sum to
it. Each card: icon, label, amount, and a small delta against the previous
period where available.

**Fund state bar** — single stacked bar. Segments below ~8% show no inline
label; the legend beneath carries name, percentage, and amount for all four.
Hovering a segment highlights the matching legend entry.

**Filters** — Organisation, Business unit, Department, search. Scope-aware per
2.5. Period is *not* here.

**Budget lines** — selectable table. Columns: select, code (mono), name, total,
available, reserved, locked, consumed, status. Row click selects and drives the
Fund movements panel; the code is a separate link to the line's ledger detail.

**Requests & exceptions** — four count tiles, then the recent requests table.
Tiles filter the table below when clicked. The exception count is amber when
above zero, since it needs human action.

**Period governance** — status, three-level approval progress, Amend / Close,
approval history, and the reopening note.

**Fund movements** — vertical stepper, driven by budget line selection (2.1).

**Safeguards** — renamed control list per 2.2.

**Footer** — Export report, Approval history.

---

## Part 4 — Money 🔴

The most error-prone part of this page. Get it wrong and Finance loses trust in
the whole system.

### Rules

1. **Store and transport minor units as integers.** Never a float. `620000`
   fils, not `6200.00`. Format at the edge only.
2. **Currency once per context.** `AED` in the column header, plain numbers in
   cells. Not `AED 3.20M` beside `1.25M`.
3. **Abbreviate in KPIs, never in tables.** KPI cards show `AED 24.80M`. Table
   cells show `3,200,000.00`. Finance staff reconcile against Oracle to the
   fils — an abbreviated table is unusable for that.
4. **Exact value on hover** for every abbreviated figure.
5. `font-variant-numeric: tabular-nums` on every numeric cell, without
   exception.
6. Right-align all amounts. Align the decimal.
7. Two decimal places always, including `.00`. Never trailing-zero trimming.
8. Zero renders as `0.00`, not a dash. A dash means "no data"; zero means zero.
9. Negatives in red with a leading minus. Never parentheses — parentheses are
   an accounting convention many readers misread.
10. Percentages to one decimal: `21.8%`, not `21.77%`. The extra digit is noise
    at this scale.

### Sum integrity

Reserved + Locked + Consumed + Available must equal Total, always.

If the API returns figures that don't reconcile, **show a warning banner rather
than rendering them silently**. A budget page that quietly displays inconsistent
totals is worse than one that admits a problem.

---

## Part 5 — Scope and permissions

### Scope

- Filters pre-filled from the viewer's scope; locked at levels they can't
  change.
- A department-scoped user sees their department pre-selected with the
  Organisation and Business unit fields fixed and visibly read-only.
- KPI totals reflect **only what's in scope**. Never show organisation-wide
  totals to a department-scoped user.
- Out-of-scope budget line accessed directly → 404, not 403.

### Permissions

Existing: `BUDGET.VIEW`, `BUDGET.LOCK`, `BUDGET.RELEASE`.

Needed — flag as a backend dependency:

| Permission | Gates |
| :--- | :--- |
| `BUDGET.UPLOAD` | Upload budget |
| `BUDGET.PERIOD.MANAGE` | Amend period, Close period |
| `BUDGET.AMEND` | Raise an amendment |
| `BUDGET.RECONCILE` | Reconciliation exceptions |
| `BUDGET.EXPORT` | Export report |

Hide unavailable actions rather than disabling. A view-only Finance Analyst
should see a clean read-only page that looks deliberate.

---

## Part 6 — States

| Surface | Loading | Empty | Error |
| :--- | :--- | :--- | :--- |
| KPI cards | Skeletons at final size | `0.00`, never blank | Retry, keep the layout |
| Fund bar | Skeleton bar | "No budget uploaded for this period" + Upload | Inline retry |
| Budget lines | Skeleton rows | "No budget lines for this department" + Upload | Retry |
| Requests | Skeleton | "No open requests" | Retry |
| Fund movements | Skeleton | "Select a budget line to see its fund movements" | Retry |
| Closed period | — | Amend and Close disabled with a reason; data still readable | — |

**Closed period** is a real state, not an error. Everything stays readable;
only mutations are blocked, with a visible explanation and a Reopen action for
those with `BUDGET.PERIOD.MANAGE`.

---

## Part 7 — Prompts

### B1 — Contract and fixtures 🔴

```
Read docs/BUDGET-CONTROL-CENTER-UI.md, then CLAUDE.md.

The Budget backend does not exist. Define the contract first so the backend is
later built to match, rather than reconciled afterwards.

1. Write docs/BUDGET-API-CONTRACT.md specifying every endpoint this page needs:
   - GET /api/v1/budget/summary — the five KPI figures and fund state
     breakdown, scope-filtered
   - GET /api/v1/budget/lines — paginated, filtered by org unit and period
   - GET /api/v1/budget/lines/:id/movements — fund state events for one line
   - GET /api/v1/budget/periods/:id — period status and approval history
   - GET /api/v1/budget/requests — unbudgeted, top-up, amendments, exceptions
   - GET /api/v1/budget/safeguards — control status
   Include request params, response shapes, error codes, and the permissions
   each requires.

2. ALL MONETARY VALUES ARE INTEGERS IN MINOR UNITS (fils). Never floats, never
   formatted strings. State this at the top of the contract and in every field
   description. This is the single most important line in the document.

3. Flag the new permissions from Part 5 as a backend dependency, with the exact
   codes.

4. Build TypeScript types from the contract and a fixtures module using the
   reference figures: total 24.80M, available 10.20M, reserved 5.40M, locked
   7.10M, consumed 2.10M. These reconcile exactly — keep it that way.

5. Data hooks matching the existing pattern in this repo, reading from fixtures
   behind a single flag so switching to the real API is a one-line change.

No UI in this task.
```

✅ `feat(budget): define API contract and fixtures`

---

### B2 — Money and primitives 🔴

```
Build the shared pieces before any screen. Every rule in Part 4 is
non-negotiable — this is a government finance system.

1. lib/money.ts:
   - Input is always an integer in minor units.
   - formatAmount(value) → "3,200,000.00" — two decimals ALWAYS, never trimmed
   - formatAbbreviated(value) → "AED 24.80M" — for KPI cards only
   - formatPercent(value) → one decimal, "21.8%"
   - Zero renders "0.00", never a dash. Negative is red with a leading minus,
     never parentheses.
   - Never use floating point arithmetic anywhere in this file.
   Unit test it, including zero, negative, very large, and rounding boundaries.

2. components/oms/budget/Amount.tsx — renders a formatted amount with
   tabular-nums, right-aligned, exact value in a title attribute when
   abbreviated.

3. components/oms/budget/FundStateBadge.tsx — Available, Reserved, Locked &
   Allocated, Consumed. Each with a consistent colour used everywhere on the
   page, drawn from existing theme tokens.

4. components/oms/budget/KpiCard.tsx — icon, label, amount, optional delta.

5. components/oms/budget/FundStateBar.tsx — stacked bar. Segments below 8% show
   no inline label. Legend beneath shows name, percentage and amount for all
   four. Hovering a segment highlights its legend entry.
   CRITICAL: if the four values do not sum to the total, render a warning
   instead of drawing a misleading bar. Do not silently normalise.

Demo page showing every component, including the mismatch warning case.
```

🛑 Review `lib/money.ts` yourself. Every number on this page flows through it.

✅ `feat(budget): add money formatting and budget primitives`

---

### B3 — Header, KPIs, fund bar

```
Build the top of the page per Part 3.

1. Header: title "Budget Control Center", subtitle "Annual budgets, fund states
   and period governance". Period selector with an open/closed badge beside it.
   Upload budget (ghost) and Manage period (primary). One filled button only.
2. Period lives in the HEADER, not the filter row — it governs the whole page
   rather than filtering part of it (Part 2.3).
3. KPI strip: five cards. Total visually distinct from the four that sum to it.
4. Fund state bar with legend, using FundStateBar from B2.
5. All amounts through the B2 helpers. KPI cards abbreviated; nothing else.
6. Gate Upload on BUDGET.UPLOAD and Manage period on BUDGET.PERIOD.MANAGE. Hide
   rather than disable.
7. When the period is closed, the badge says so and mutating actions are
   disabled with a visible reason — this is a normal state, not an error.

Use the existing shell. Do not add a page title block — the breadcrumb is the
title per APP-SHELL-SPEC.md.
```

✅ `feat(budget): add control center header and KPIs`

---

### B4 — Scope-aware filters

```
Build the filter row per Part 3 and Part 5.

1. Organisation, Business unit, Department using OrgUnitPicker from Domain 2,
   plus a budget line search.
2. SCOPE-AWARE per Part 2.5: pre-fill from the viewer's scope and lock the
   levels they cannot change. A department-scoped Finance Analyst gets their
   department pre-selected with Organisation and Business unit visibly
   read-only — not empty dropdowns they can't usefully use.
3. Cascading: choosing a business unit narrows the department list.
4. Filter state in the URL as query params so a filtered view is shareable and
   the back button works.
5. KPI totals recalculate on filter change and reflect ONLY what is in scope.
   Never show organisation-wide totals to a department-scoped user.
6. Search debounced 500ms (rate tier 5).
7. Period is NOT in this row.

Verify with a department-scoped test user that the locked fields look
deliberate rather than broken.
```

✅ `feat(budget): add scope-aware budget filters`

---

### B5 — Budget lines table

```
Build the budget lines table per Part 3.

Columns: select, budget code (mono, links to the line's ledger detail), budget
line name, total, available, reserved, locked, consumed, period status.

- All amounts EXACT, never abbreviated. Finance reconciles against Oracle to
  the fils (Part 4 rule 3). Right-aligned, tabular-nums, decimals aligned.
- AED appears once in each column header, not in every cell.
- Single-row selection. Selecting a row drives the Fund movements panel built
  in B8 — this is the fix for the reference's unexplained radio buttons
  (Part 2.1).
- The budget code is a separate link to the ledger detail; clicking elsewhere
  in the row selects.
- Server-side pagination, sorting, filtering via the Step 0 framework.
- A line whose four states do not sum to its total shows a warning icon with an
  explanation on hover.
- Empty: "No budget lines for this department" with an Upload action gated on
  BUDGET.UPLOAD.

Reuse DataTable from components/oms/.
```

✅ `feat(budget): add budget lines table`

---

### B6 — Requests and exceptions

```
Build the requests section per Part 3.

1. Four count tiles: unbudgeted requests, top-up requests, pending amendments,
   reconciliation exceptions.
2. The exception tile is AMBER when above zero — it needs human action, unlike
   the other three which are informational.
3. Clicking a tile filters the table beneath it. Show the active filter clearly
   and offer a way to clear it.
4. Table: request ID (links to the request), type, description, amount, status,
   owner, requested on.
5. Status badges: Approved (green), Awaiting approval (amber), Exception (red),
   Rejected (neutral). Use the existing StatusBadge.
6. "View all requests" links to the full requests screen.
7. Dates as "3 Aug 2026", never ISO.
8. Empty: "No open requests".

Reconciliation exceptions come from the Integration Operations work in the
process gap analysis §2.3. That module does not exist yet — render the count
from fixtures and add:
// TODO(integration-ops): wire to the real reconciliation exception queue
```

✅ `feat(budget): add requests and exceptions section`

---

### B7 — Period governance and safeguards

```
Build the right column's first two panels per Part 3 and Part 2.2.

Period governance:
- Period, status badge, last amended date.
- Three-level approval progress with a completed indicator.
- Amend period and Close period, both gated on BUDGET.PERIOD.MANAGE, both
  disabled with a visible reason when the period is closed.
- Approval history as a numbered list: role, name, timestamp.
- Note: "Reopening requires the same three-level approval." This is an RFP
  requirement, not decoration.
- When closed, offer Reopen to those with the permission, with the same
  three-level warning.

Safeguards — rename the reference's "Controls" panel and translate every label
out of engineering language per the Part 2.2 table:
  "Atomic HOD check"                    → "Double-spending prevented"
  "Multi-line allocation"               → "Funds can come from several budget lines"
  "Period validation"                   → "Only open periods accept requests"
  "Automatic release on rejection/closure" → "Unused funds return automatically"
  "Last Oracle reconciliation"          → "Last checked against Oracle"

Each row shows an Active indicator; the Oracle row shows a timestamp instead.
Keep the panel — visible assurance that controls are active has real value in
an audit walkthrough. Just say it in the reader's language.
```

✅ `feat(budget): add period governance and safeguards`

---

### B8 — Fund movements

```
Build the Fund movements panel per Part 2.1 and Part 3.

- Driven by the budget line SELECTED in B5. This is the fix for the reference,
  where the panel showed one arbitrary request with no stated relationship to
  anything on screen.
- With a line selected: vertical stepper of that line's fund state events —
  Submitted / Reserved, HOD approved / Locked & Allocated, Work completion /
  Consumed, Release event. Each with a date and amount.
- With nothing selected: the most recent movements across the filtered
  department, with a quiet line saying so.
- Panel header names the selected line so the relationship is unambiguous.
- Steps not yet reached render muted with "Not started", never blank.
- "View before/after audit" opens the ledger detail for that movement.
- Amounts through the B2 helpers, exact.

The stepper is the same visual pattern as the sign-off chain from
ORG-UNIT-DETAIL-SPEC.md §3.7 — numbered circles with a connector rule. Reuse
it rather than building a second stepper.
```

✅ `feat(budget): add fund movements panel`

---

### B9 — Quality pass

```
Final pass. Report: issue | severity | file | fixed.

MONEY — highest priority
1. Confirm every amount on the page flows through lib/money.ts. Grep for any
   number formatting done inline.
2. Confirm no floating point arithmetic anywhere in budget code.
3. Confirm tabular-nums on every numeric cell.
4. Confirm two decimals always, zero renders 0.00, negatives are red with a
   minus not parentheses.
5. Confirm table amounts are exact and only KPI cards abbreviate.
6. Test the sum-mismatch case: feed values that do not reconcile and confirm a
   warning renders rather than a misleading bar.

REST
7. Scope: verify with a department-scoped user that filters lock correctly, KPI
   totals reflect scope only, and an out-of-scope line returns 404 not 403.
8. Confirm no engineering language remains in any visible string — check
   specifically for "atomic", "validation", "allocation logic".
9. Permissions: a view-only user sees a clean read-only page that looks
   deliberate, not stripped.
10. Closed period: everything readable, mutations blocked with a stated reason.
11. Responsive: 1440, 1280, 1024, 768. Right column stacks below 1280.
12. Light and dark theme; find hardcoded colours.
13. Keyboard: reach and activate every filter, row selection, tile filter, and
    action.
14. Fund bar at extreme values — one state at 99%, another at 0.1%. Confirm
    labels don't overflow.
```

🛑 Final gate.

---

## Part 8 — Check yourself

1. **Ask a Finance person to reconcile one budget line against a figure you
   give them.** If they have to hover or convert an abbreviation, the table
   formatting is wrong.
2. **Feed it numbers that don't sum.** It must warn, not draw.
3. **Log in scoped to one department.** Totals must reflect that department
   only — showing organisation-wide figures to a department user is a data
   leak, not a display bug.
