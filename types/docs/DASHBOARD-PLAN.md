# OMS Dashboard — Role-Aware Plan

Route: `/app` (and `/app/dashboard`)

**UI-only build.** Part 5 defines the API contract the backend is later built
to match. Palette, shell, and existing components unchanged.

---

## Part 1 — Principles

### 1.1 One page, permission-gated widgets

There is **one dashboard route**. No role-specific pages, no `if (role ===
'HOD')` anywhere in the codebase.

Each widget declares:

```ts
{
  id: 'budget-exposure',
  requiredPermissions: ['BUDGET.VIEW'],   // ALL must be held
  minimumScope: 'SELF',                   // lowest scope that makes it useful
  span: 4,                                // 12-column grid
  priority: 20                            // ordering within its row band
}
```

A widget renders when the user holds every required permission and their scope
meets the minimum. Role names never appear in the gating logic — consistent
with `CLAUDE.md` and the Domain 3 permission model.

### 1.2 Scope changes the widget, not the widget set

Most widgets are one component whose **data scope** follows the viewer's org
scope:

| Viewer scope | "Budget exposure" shows |
| :--- | :--- |
| SELF | Budget tied to requests they raised |
| DEPARTMENT | Their department's position |
| BUSINESS_UNIT | Rolled up across departments |
| GLOBAL | Organisation-wide |

The server resolves this. The client sends no scope parameter — it can't be
trusted to, and a client-supplied scope is a data leak waiting to happen.

Each widget shows its scope in the header: *"Digital Security · FY 2026"*. A
number without a scope label is a number someone will misread.

### 1.3 No customisation in v1

No drag-to-reorder, no add/remove widgets. Layout is derived from permissions
and scope. Personalisation is a reasonable v2; it is not worth the state
management now, and a badly arranged personal dashboard is a support ticket.

### 1.4 Every widget links somewhere

A dashboard that only informs wastes the click. Every widget has a destination —
usually a pre-filtered module view. "3 requests will auto-close in 5 days" must
open exactly those three.

---

## Part 2 — Widget catalogue

### Band A — Attention strip (KPI tiles, span 3)

| # | Widget | Permissions | Min scope | Notes |
| :--- | :--- | :--- | :--- | :--- |
| A1 | **Needs my action** | — | SELF | Count + overdue badge. Links to `/app/requests?tab=needs-my-action` |
| A2 | **Requests in approval** | `REQUISITION.VIEW` | SELF | In-flight requests |
| A3 | **Onboarding cases** | `WORKFORCE.VIEW` | SELF | Active onboardings |
| A4 | **Expiring documents** | `WORKFORCE.VIEW` | SELF | Within 30 days. Gap analysis §2.2 |
| A5 | **Auto-close watch** 🆕 | `REQUISITION.VIEW` | SELF | *"3 requests close in 5 days, releasing AED 1.2M"* |
| A6 | **Open exceptions** 🆕 | `REQUISITION.VIEW` | DEPARTMENT | SLA breaches, budget mismatches, reconciliation variances |
| A7 | **Candidates awaiting review** | `CANDIDATE.VIEW` | SELF | Main interviewer's queue |
| A8 | **Vendor submissions** | `VENDOR.VIEW` | DEPARTMENT | Procurement |
| A9 | **Security events** | `SECURITY.DASHBOARD.VIEW` | GLOBAL | Failed logins, lockouts |

**A5 is the one I'd add first.** The 30-day auto-close silently kills a request
and releases its funds. Nothing currently warns anyone. It's the highest-value
tile on the page and it costs almost nothing.

### Band B — Position (charts, span 6)

| # | Widget | Permissions | Min scope | Notes |
| :--- | :--- | :--- | :--- | :--- |
| B1 | **Requests by lifecycle stage** | `REQUISITION.VIEW` | SELF | Stacked bar. Period filter |
| B2 | **Budget exposure** | `BUDGET.VIEW` | SELF | Reserved / Locked / Consumed. Reuse `FundStateBar` |
| B3 | **Budget allocation by department** 🆕 | `BUDGET.VIEW` | BUSINESS_UNIT | *Your suggestion 1.* Horizontal bars, allocated vs consumed, sorted by utilisation |
| B4 | **Workforce by department** 🆕 | `WORKFORCE.VIEW` | DEPARTMENT | *Your suggestion 2.* Active resources per department, onshore/offshore split |
| B5 | **Budget vs actual trend** 🆕 | `BUDGET.VIEW` | DEPARTMENT | Monthly consumption against plan. RFP requires budget-vs-cost by financial year |
| B6 | **Time in stage** 🆕 | `REQUISITION.VIEW` | DEPARTMENT | Average days per workflow stage — finds the bottleneck |

### Band C — Work (tables, span 8 + rail span 4)

| # | Widget | Permissions | Min scope | Notes |
| :--- | :--- | :--- | :--- | :--- |
| C1 | **Items requiring attention** | — | SELF | The main queue. Item, request, stage, due, priority |
| C2 | **Contract runway** 🆕 | `WORKFORCE.VIEW` | DEPARTMENT | *Your suggestion 3.* Engagements by remaining time, grouped by vendor. Flags the 90-day replacement window |
| C3 | **Request exceptions** 🆕 | `REQUISITION.VIEW` | DEPARTMENT | *Your suggestion 4.* Type, request, detail, age, owner |
| C4 | **Upcoming milestones** | — | SELF | Interviews, joinings, document expiries |
| C5 | **Recent activity** | — | SELF | Scoped audit feed |

### Band D — Role-specific (span 4–6)

| # | Widget | Permissions | Min scope | Notes |
| :--- | :--- | :--- | :--- | :--- |
| D1 | **Emiratisation quota** 🆕 | `HR` module perms | ORGANIZATION | RFP: *"HR monitors Emiratisation quotas."* Currently has no home anywhere in the build |
| D2 | **Budget period status** | `BUDGET.PERIOD.MANAGE` | DEPARTMENT | Open/closed, three-level approval progress |
| D3 | **Reconciliation exceptions** | `BUDGET.RECONCILE` | DEPARTMENT | Gap analysis §2.3 |
| D4 | **Integration health** 🆕 | `SECURITY.ADMIN` | GLOBAL | Oracle, DocuSign, Saned, AD — last sync and failures |
| D5 | **Interview schedule** | `INTERVIEW.SCHEDULE` | SELF | Next 7 days |
| D6 | **Vendor performance** | `VENDOR.VIEW` | DEPARTMENT | Submission rate, time to submit, acceptance rate |
| D7 | **Draft expiry watch** 🆕 | `REQUISITION.VIEW` | SELF | Drafts nearing 60-day deletion |
| D8 | **Pending HR decisions** | HR perms | ORGANIZATION | Awaiting HR review, split by clarification type |

---

## Part 3 — What each role sees

Illustrative, derived from permissions rather than hardcoded.

**Department Requestor** — A1, A2, A3, A4, A5 · B1, B2 · C1, C4, C5 · D7
*The reference screenshot, plus auto-close and draft warnings.*

**Line Manager / Section Head** — A1, A2, A3, A4 · B1, B2 · C1, C2, C4, C5
*Adds contract runway — they own day-to-day resource management.*

**HOD** — A1, A2, A5, A6 · B1, B2, B3, B4, B6 · C1, C2, C3, C4, C5 · D2
*Department-scoped totals. Gains allocation, workforce and bottleneck views.*

**HR** — A1, A2, A4, A6 · B1, B4, B6 · C1, C3, C4, C5 · D1, D8
*Organisation-scoped. Emiratisation and pending HR decisions.*

**Finance** — A1, A6 · B2, B3, B5 · C3, C5 · D2, D3
*Financial position, allocation, reconciliation. No candidate widgets.*

**Procurement** — A1, A8 · B1 · C1, C4, C5 · D6
*Vendor-facing.*

**Main Interviewer** — A1, A7 · B1 · C1, C4 · D5
*Candidate pipeline and interview schedule.*

**System Administrator** — A1, A9 · C5 · D3, D4
*Operations, not business volume.*

---

## Part 4 — Layout

12-column grid, 24px gutter.

```
┌────────────────────────────────────────────────────────────────┐
│ Good morning, Mariam. Here's what needs your attention today.  │
│                                            [+ New requisition] │
├──────────┬──────────┬──────────┬──────────┬────────────────────┤
│ A1  (3)  │ A2  (3)  │ A5  (3)  │ A4  (3)  │   Band A           │
├──────────┴──────────┴──────┬───┴──────────┴────────────────────┤
│ B1  Lifecycle stages   (6) │ B2  Budget exposure           (6) │
├────────────────────────────┴───────────────────┬───────────────┤
│ C1  Items requiring attention              (8) │ C4  (4)       │
│                                                │ C5  (4)       │
├────────────────────────────────────────────────┴───────────────┤
│ Band D — role-specific, 4 or 6 columns each                    │
└────────────────────────────────────────────────────────────────┘
```

- Bands render in order. A band with no visible widgets is omitted entirely,
  including its spacing.
- Within a band, widgets sort by `priority`.
- **Never leave a hole.** If Band A resolves to three tiles, they expand to
  span 4 each. A grid with a gap looks broken, not personalised.

Responsive: 12 cols ≥1440px · 8 cols 1024–1439 · 4 cols 768–1023 · 1 col
<768px. Charts become tables below 768.

### Widget shell

Every widget uses one component:

```
┌──────────────────────────────────────────┐
│ Title                    Scope · Period ›│  56px header
│ ──────────────────────────────────────── │
│ Content                                  │
└──────────────────────────────────────────┘
```

- Title 15px/600. Scope label 12px muted, right-aligned, with a chevron link.
- Loading: skeleton **at final height** — the layout must not jump as widgets
  arrive.
- Error: inline retry inside the widget. One failing widget never breaks the
  page.
- Empty: a meaningful sentence, not "No data". *"No requests are close to
  auto-closing."*

---

## Part 5 — API contract

Document as `docs/DASHBOARD-API-CONTRACT.md`. Money in **integers, minor
units**, per the budget contract.

### 5.1 Layout

```
GET /api/v1/dashboard/layout
```

The server decides which widgets the user sees. The client never computes
visibility from roles.

```jsonc
{
  "greeting": { "name": "Mariam", "period": "MORNING" },
  "scope": { "level": "DEPARTMENT", "label": "Digital Security", "orgUnitId": "…" },
  "fiscalPeriod": { "code": "FY2026", "label": "FY 2026", "isOpen": true },
  "bands": [
    { "band": "A", "widgets": [
      { "id": "needs-my-action", "span": 3, "priority": 10 },
      { "id": "requests-in-approval", "span": 3, "priority": 20 },
      { "id": "auto-close-watch", "span": 3, "priority": 30 },
      { "id": "expiring-documents", "span": 3, "priority": 40 }
    ]},
    { "band": "B", "widgets": [ … ] }
  ]
}
```

### 5.2 Widget data

```
GET /api/v1/dashboard/widgets/{widgetId}?period=FY2026&window=90d
```

Fetched **in parallel** after the layout resolves. A slow chart must not block
the KPI tiles.

Every response carries its own scope so the widget can label itself:

```jsonc
{
  "widgetId": "budget-exposure",
  "scope": { "level": "DEPARTMENT", "label": "Digital Security" },
  "period": "FY 2026",
  "updatedAt": "2026-08-31T08:30:00Z",
  "link": "/app/budget?department=…",
  "data": { /* widget-specific */ }
}
```

### 5.3 Selected payloads

**`needs-my-action`**
```jsonc
{ "total": 4, "overdue": 2, "byType": { "APPROVE": 2, "REVISE": 1, "CLARIFY": 1 } }
```

**`auto-close-watch`** 🆕
```jsonc
{
  "items": [{ "requestId": "OMS-2026-0139", "position": "…", "closesAt": "2026-09-05",
              "daysRemaining": 5, "fundsAtRisk": 28500000 }],
  "totalFundsAtRisk": 120000000
}
```

**`budget-allocation-by-department`** 🆕
```jsonc
{
  "departments": [{ "orgUnitId": "…", "name": "Digital Security",
                    "allocated": 320000000, "consumed": 96000000,
                    "reserved": 54000000, "utilisationPercent": 30.0 }],
  "totals": { "allocated": 2480000000, "consumed": 210000000 }
}
```

**`workforce-by-department`** 🆕
```jsonc
{
  "departments": [{ "orgUnitId": "…", "name": "Digital Security",
                    "active": 23, "onshore": 18, "offshore": 5,
                    "onboarding": 3, "endingWithin90Days": 4 }],
  "totals": { "active": 142, "onshore": 110, "offshore": 32 }
}
```

**`contract-runway`** 🆕
```jsonc
{
  "buckets": [
    { "range": "0-30",  "count": 4,  "label": "Ending within 30 days" },
    { "range": "31-90", "count": 11, "label": "31 to 90 days" },
    { "range": "91-180","count": 26, "label": "3 to 6 months" },
    { "range": "180+",  "count": 101,"label": "Over 6 months" }
  ],
  "byVendor": [{ "vendorId": "…", "name": "…", "active": 34, "endingWithin90Days": 7 }],
  "replacementWindowOpen": 11
}
```

`replacementWindowOpen` counts engagements inside the RFP's 90-day
pre-expiry replacement window.

**`request-exceptions`** 🆕
```jsonc
{
  "items": [{
    "type": "SLA_BREACH" | "BUDGET_MISMATCH" | "RECONCILIATION_VARIANCE"
          | "STALLED" | "APPROVER_UNAVAILABLE",
    "requestId": "OMS-2026-0131", "detail": "Oracle PR not found",
    "ageDays": 3, "owner": { "userId": "…", "name": "…" },
    "severity": "HIGH" | "MEDIUM" | "LOW"
  }],
  "countsByType": { "SLA_BREACH": 2, "RECONCILIATION_VARIANCE": 1 }
}
```

### 5.4 Server requirements

1. **Scope is resolved server-side.** No scope parameter is accepted. A
   client-supplied scope is a data-leak vector.
2. **Layout is computed from permissions**, never returned as role names.
3. **Every figure is pre-aggregated.** The client performs no arithmetic — no
   totals, no percentages, no currency conversion.
4. **Cache per user, 60 seconds.** Dashboards are re-opened constantly and
   nothing here needs to be second-accurate. Return `updatedAt` so the widget
   can say "as of 08:30".
5. **Widget failures are isolated.** A failing widget returns its own error;
   the layout call still succeeds.

---

## Part 6 — Prompts

Written for Antigravity — explicit file paths and step-by-step. Run in order.

---

### D1 — API contract, types and fixtures

```
CONTEXT
You are working in the OMS frontend repo (Next.js 16, React 19, TypeScript,
Tailwind 4, shadcn/ui). Read these files first:
  - docs/DASHBOARD-PLAN.md          (this plan)
  - CLAUDE.md                       (project conventions)
  - docs/BUDGET-API-CONTRACT.md     (money rules)
  - docs/APPROVAL-API-CONTRACT.md   (task shapes)

The dashboard backend does not exist. This task defines the contract it will be
built to match, plus the types and fixtures the UI develops against.

TASK 1 — Write docs/DASHBOARD-API-CONTRACT.md
Transcribe Part 5 of the plan in full: the layout endpoint, the per-widget data
endpoint, every payload shape in 5.3, and all five server requirements in 5.4.

State prominently at the top, and repeat in every monetary field description:
"ALL MONETARY VALUES ARE INTEGERS IN MINOR UNITS (fils). Never floats. Never
pre-formatted strings."

Document these as REQUIREMENTS with their rationale:
  - Scope is resolved server-side; no scope parameter is accepted, because a
    client-supplied scope is a data-leak vector.
  - Layout is computed from permissions, never returned as role names.
  - Every figure arrives pre-aggregated; the client performs no arithmetic.
  - Per-user 60-second cache, with updatedAt returned.
  - Widget failures are isolated from the layout call.

TASK 2 — Create src/types/dashboard.ts
TypeScript interfaces for: DashboardLayout, DashboardBand, WidgetPlacement,
WidgetResponse<T>, and a payload interface per widget in 5.3. Use a discriminated
union on widgetId so each widget's data is typed.

TASK 3 — Create src/lib/dashboard/fixtures.ts
Fixture data for every widget, using the reference figures where they exist:
  needs-my-action: total 4, overdue 2
  requests-in-approval: 6
  onboarding-cases: 3
  expiring-documents: 4 within 30 days
  requests-by-stage: Draft 2, In Approval 6, HR Review 3, Procurement 4,
                     Onboarding 3
  budget-exposure: reserved 184000000, locked 174000000, consumed 96000000
  items-requiring-attention: the three rows from the reference
Invent plausible data for the new widgets, keeping every total internally
consistent — figures that do not reconcile will be spotted immediately.

Also create fixture SETS for five personas so the layout can be tested:
requestor, hod, hr, finance, systemAdmin. Each returns a different layout per
Part 3.

TASK 4 — Create src/lib/dashboard/api.ts
Data hooks matching the pattern already used in this repo (check how the
requests module fetches — match it exactly). Read from fixtures behind a single
flag so switching to the real API is a one-line change.

DO NOT build any UI in this task.
```

✅ `feat(dashboard): define API contract, types and fixtures`

---

### D2 — Widget registry and shell

```
CONTEXT
Read docs/DASHBOARD-PLAN.md Parts 1 and 4, and CLAUDE.md.

This task builds the framework every widget plugs into. No individual widgets
yet.

TASK 1 — Create src/lib/dashboard/registry.ts
A registry mapping widget id to its metadata and component:

  export interface WidgetDefinition {
    id: string;
    title: string;
    requiredPermissions: string[];
    minimumScope: 'SELF'|'SECTION'|'DEPARTMENT'|'BUSINESS_UNIT'|'ORGANIZATION'|'GLOBAL';
    defaultSpan: number;
    component: React.ComponentType<WidgetProps>;
  }

Seed it with every widget id from Part 2 pointing at a placeholder component.
Later tasks replace the placeholders.

CRITICAL: gating uses PERMISSIONS ONLY. There must be no role-name string
anywhere in this file or any widget. Grep for 'HOD', 'HR', 'FINANCE' at the end
of this task and confirm zero matches in dashboard code.

TASK 2 — Create src/components/oms/dashboard/WidgetShell.tsx
The shared frame from Part 4:
  - 56px header: title at 15px/600 on the left; scope label at 12px muted on the
    right with a chevron, linking to the widget's destination
  - Hairline, then content
  - White surface, 12px radius, 0.5px border, no shadow at rest
  - Props: title, scopeLabel, href, isLoading, error, onRetry, children

  Loading renders a skeleton AT FINAL HEIGHT. The layout must not jump as
  widgets arrive — pass an explicit minHeight per widget.
  Error renders an inline retry INSIDE the shell. One failing widget must never
  break the page.

TASK 3 — Create src/components/oms/dashboard/DashboardGrid.tsx
  - 12-column CSS grid, 24px gutter
  - Renders bands in order; a band with no visible widgets is omitted entirely
    including its spacing
  - Within a band, sorts by priority
  - NEVER leaves a hole: if a band resolves to 3 widgets of span 3, expand them
    to span 4 each so the row fills. A gap looks broken, not personalised.
  - Responsive: 12 cols ≥1440, 8 cols 1024-1439, 4 cols 768-1023, 1 col <768

TASK 4 — Create src/app/(app)/dashboard/page.tsx
  - Fetches the layout, then fetches each widget's data IN PARALLEL
  - Renders the greeting: "Good morning, {name}. Here's what needs your
    attention today." Time-of-day aware.
  - Primary action button top-right, gated on REQUISITION.CREATE
  - Uses the existing app shell; the breadcrumb is the page title per
    APP-SHELL-SPEC.md — do not add a separate heading block

VERIFY before finishing: switch between the five persona fixtures and confirm
each renders a different, hole-free layout.
```

✅ `feat(dashboard): add widget registry, shell and grid`

---

### D3 — Band A tiles

```
CONTEXT
Read docs/DASHBOARD-PLAN.md Part 2 Band A. Build all nine KPI tiles.

Create src/components/oms/dashboard/widgets/ and one file per widget.

TASK 1 — Create a shared KpiTile component
  Props: label, value, delta (optional), badge (optional), href, icon, tone
  - Value 28px/600 with tabular-nums
  - Label 13px muted above
  - Optional badge bottom-left (e.g. "2 overdue" in amber, "Within 30 days" in
    neutral)
  - The WHOLE TILE is a link, not just the number
  - 32px icon in a tinted square, top-left

TASK 2 — Build these tiles:
  A1 needs-my-action        → /app/requests?tab=needs-my-action
     Badge "{n} overdue" in amber when overdue > 0
  A2 requests-in-approval   → /app/requests?status=in-approval
  A3 onboarding-cases       → /app/workforce/onboarding
  A4 expiring-documents     → /app/workforce?filter=expiring-documents
     Badge "Within 30 days"
  A5 auto-close-watch       → /app/requests?filter=closing-soon
     This is the highest-value tile on the page. The 30-day auto-close silently
     kills a request and releases its funds. Show the count AND the money:
     "3 requests · AED 1.2M at risk". Amber when count > 0, neutral when zero.
  A6 open-exceptions        → /app/requests?filter=exceptions
     Amber when > 0
  A7 candidates-awaiting-review → /app/candidates?filter=awaiting-review
  A8 vendor-submissions     → /app/vendors?filter=pending-submissions
  A9 security-events        → /app/administration/security-dashboard

TASK 3 — Register all nine in registry.ts with the permissions and minimum
scopes from the Part 2 table.

RULES
- All money through lib/money.ts. Tiles may abbreviate (AED 1.2M); everything
  else on this page shows exact figures.
- Zero renders as "0", never blank or a dash.
- Empty states are meaningful sentences, never "No data".
- Every tile shows its scope label in the shell header.

VERIFY: a user with only REQUISITION.VIEW sees A1, A2, A5, A6 and no others,
and the row still fills without gaps.
```

✅ `feat(dashboard): add attention strip tiles`

---

### D4 — Band B charts

```
CONTEXT
Read docs/DASHBOARD-PLAN.md Part 2 Band B. Build six chart widgets.
Charts use Recharts, already in this project.

B1 requests-by-lifecycle-stage
  Horizontal stacked bar: Draft, In Approval, HR Review, Procurement,
  Onboarding. Counts beneath each segment as label + number.
  A period filter in the widget header: Last 30 / 90 days / This FY. Default 90.
  Clicking a segment navigates to /app/requests filtered to that stage.

B2 budget-exposure
  Reserved / Locked & Allocated / Consumed with amounts and a stacked bar.
  REUSE FundStateBar from the budget module — do not build a second bar
  component. Import it; if the colours or sum-mismatch warning differ, that is a
  bug.
  Header shows the fiscal period.

B3 budget-allocation-by-department
  Horizontal bars, one per department, showing consumed against allocated with
  a utilisation percentage. Sorted by utilisation descending so the department
  closest to its limit is first.
  Amber bar above 80% utilisation, red above 95%.
  Row click → /app/budget?department={id}

B4 workforce-by-department
  Grouped bars per department: onshore and offshore active resources.
  Secondary line per row: "3 onboarding · 4 ending within 90 days".
  Row click → /app/workforce?department={id}

B5 budget-vs-actual-trend
  Line or bar over months of the fiscal year: planned versus actual
  consumption. RFP requires budget-versus-cost by financial year.
  Highlight months where actual exceeds plan.

B6 time-in-stage
  Average days spent in each workflow stage, as horizontal bars.
  This is the bottleneck finder — mark the slowest stage explicitly with a
  label like "Slowest stage".

RULES
- ALL figures come pre-aggregated from the server. Compute nothing in the UI —
  no totals, no percentages, no averages. A client-calculated figure will
  eventually disagree with the server's and the wrong one will be trusted.
- All money through lib/money.ts.
- Every chart needs a table fallback below 768px — charts are unreadable at
  that width.
- Every chart needs an accessible text summary for screen readers.
- Empty: a sentence explaining why, e.g. "No requests in the last 90 days."

Register all six with their Part 2 permissions and scopes.
```

🛑 Grep Band B components for arithmetic operators on data fields. There should
be none.

✅ `feat(dashboard): add position charts`

---

### D5 — Band C work queue

```
CONTEXT
Read docs/DASHBOARD-PLAN.md Part 2 Band C.

C1 items-requiring-attention (span 8)
  Table: Item, Request, Current Stage, Due, Priority.
  - Item is the action in plain words: "Respond to HR clarification",
    "Confirm candidate shortlist", "Complete joining readiness"
  - Request is the mono ID, linking to the request
  - Due shows "Today" in red, "07 Aug" otherwise, "Overdue by 2 days" in red
  - Priority badge: High red, Medium amber, Low neutral
  - Maximum 5 rows, then "View all items" linking to
    /app/requests?tab=needs-my-action
  - Sorted by due date ascending, overdue first
  - Row click opens the request

C2 contract-runway (span 6)
  Engagements grouped by remaining time: 0-30 days, 31-90, 3-6 months, over 6
  months. Horizontal bar or bucket cards with counts.
  Below it, a short table by vendor: vendor name, active resources, ending
  within 90 days.
  CRITICAL: the RFP allows a replacement to be initiated within 90 days of
  contract end. Surface that explicitly — "11 engagements are inside the
  replacement window" with a link. Departments miss this deadline and then
  cannot replace someone.
  Link → /app/workforce?filter=ending-soon

C3 request-exceptions (span 6)
  Table: Type, Request, Detail, Age, Owner, Severity.
  Types: SLA breach, Budget mismatch, Reconciliation variance, Stalled,
  Approver unavailable. Each with a distinct icon.
  Sorted by severity then age descending.
  Reconciliation variance rows link to the reconciliation queue when that module
  ships — for now add:
  // TODO(integration-ops): link to reconciliation exception queue

C4 upcoming-milestones (span 4)
  Compact list: icon, label, detail, date.
  Interviews (3 candidates, 09 Aug) · Joining (Ahmed Rahman, 12 Aug) ·
  Document expiry (4 resources, within 30 days)
  Each row links to its module.

C5 recent-activity (span 4)
  Scoped audit feed. Each entry: dot, plain-language description, relative time.
  "HOD approved OMS-2026-0141 — 2 hours ago"
  Maximum 5, then "View all".
  NEVER show raw event codes, table names, or field names.

RULES
- Dates as "07 Aug 2026" or relative for recent. Never ISO.
- All money exact via lib/money.ts.
- Every empty state is a meaningful sentence.
- Reuse DataTable and StatusBadge from components/oms/.
```

✅ `feat(dashboard): add work queue widgets`

---

### D6 — Band D role-specific

```
CONTEXT
Read docs/DASHBOARD-PLAN.md Part 2 Band D. Build eight widgets.

D1 emiratisation-quota
  The RFP states HR monitors Emiratisation quotas. This requirement currently
  has no home anywhere in the build — this widget is its first appearance.
  Show: current percentage against target, a progress bar, and a breakdown by
  business unit. Amber below target, green at or above.
  Because the underlying data model does not exist yet, add:
  // TODO(hr): confirm quota calculation basis with DIEZ — headcount or cost?
  Flag this to me in your summary: the calculation basis is an open question.

D2 budget-period-status
  Period, open/closed badge, three-level approval progress, last amended.
  Links to the budget period dialog.

D3 reconciliation-exceptions
  Count by external system: Oracle, DocuSign, Saned. Age of the oldest.
  From gap analysis §2.3. Module does not exist — fixtures plus:
  // TODO(integration-ops): wire to the real exception queue

D4 integration-health
  One row per system: Oracle ERP, DocuSign, Saned, Active Directory.
  Status dot, last successful sync, failure count in 24h.
  Green healthy, amber degraded, red failing.
  // TODO(integration-ops): wire to real health checks

D5 interview-schedule
  Next 7 days: candidate, position, date and time, medium (in person / online).
  Links to the interview calendar.

D6 vendor-performance
  Per vendor: submission rate, average time to submit, acceptance rate.
  Top 5 by activity.

D7 draft-expiry-watch
  Drafts nearing the 60-day deletion. Count plus the soonest date.
  "2 drafts will be deleted in 6 days."
  Links to /app/requests?tab=drafts

D8 pending-hr-decisions
  Requests awaiting HR review, split by what is needed: new review, response to
  clarification, amendment review.

Register all eight with their Part 2 permissions and scopes.

RULES
- Widgets whose backing module does not exist render from fixtures with a
  clearly marked TODO. Do not hide them — they are part of the design and the
  TODOs are the integration checklist.
- No role names in gating logic.
```

✅ `feat(dashboard): add role-specific widgets`

---

### D7 — Verification

```
CONTEXT
Read docs/DASHBOARD-PLAN.md in full. Verify the dashboard and report a table:
check | expected | actual | pass.

PERMISSIONS AND SCOPE — highest priority
1. Grep all dashboard code for role-name strings: 'HOD', 'HR', 'FINANCE',
   'PROCUREMENT', 'SYSTEM_ADMIN', 'REQUESTOR'. There must be ZERO matches in
   gating logic.
2. Switch between all five persona fixtures. Confirm each produces a different
   layout matching Part 3.
3. Confirm no widget renders for a user lacking its required permissions.
4. Confirm every widget displays its scope label, and that the label matches
   the data shown.
5. Confirm the client sends no scope parameter to any dashboard endpoint.

LAYOUT
6. With a band resolving to 3 widgets, confirm they expand to fill the row. No
   holes.
7. With a band resolving to zero widgets, confirm the band and its spacing are
   omitted entirely.
8. Confirm skeletons render at final height and the layout does not jump as
   widgets load.
9. Force one widget to error. Confirm it shows an inline retry and the rest of
   the page is unaffected.

DATA
10. Grep Band B and C components for arithmetic on data fields. There should be
    none — everything arrives pre-aggregated.
11. Confirm all money flows through lib/money.ts.
12. Confirm tiles abbreviate and everything else is exact.
13. Confirm B2 imports FundStateBar from the budget module rather than
    reimplementing it.
14. Confirm no empty state says "No data" — each must be a meaningful sentence.

REST
15. Responsive at 1440, 1280, 1024, 768, 375. Charts become tables below 768.
16. Light and dark theme; find hardcoded colours.
17. Keyboard: tab through every widget and reach every link.
18. Screen reader: every chart has a text summary.
19. Confirm every widget links somewhere and the destination is pre-filtered to
    what the widget showed.
20. Confirm no raw event codes, table names, or permission codes appear anywhere
    on screen.

List every TODO marker you find, grouped by the module that will resolve it.
```

🛑 Final gate.

---

## Part 7 — Questions for DIEZ

1. **Emiratisation quota (D1)** — is it measured by headcount or by cost? Against
   what target, and at what level? The RFP names the requirement but not the
   calculation.
2. **Should the dashboard default period be 90 days or the fiscal year?** The
   reference shows 90 days; Finance will likely want the FY.
3. **Contract runway (C2)** — should the 90-day replacement window trigger a
   notification as well as a dashboard flag? Missing it means a department
   cannot replace someone.
4. **Is a personalised layout wanted in a later phase**, or is a
   permission-derived layout sufficient permanently?
