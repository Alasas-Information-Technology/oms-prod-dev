# Dashboard — Visual Coverage & Gemini Build Prompts

**Read this whole document before writing any code.** This is written for
Gemini specifically, which means every prompt below is self-contained — it
restates the exact numbers it needs rather than pointing at "per U4" the way
prior docs could. If you are Gemini reading this: do not skip ahead to Part 3
and start coding. Part 0 and Part 1 change how you should read every prompt
that follows.

**Supplements, does not replace:** `DASHBOARD-PLAN.md`,
`DASHBOARD-REFINEMENT.md`, `DASHBOARD-VISUAL-LANGUAGE.md`,
`DASHBOARD-KPI-CARDS-AMENDMENT.md`, `DASHBOARD-VISUAL-DEPTH.md`,
`DASHBOARD-GRAPHICAL-REFRESH.md` (U1–U9, I1–I6). This document does not repeat
those rules — it makes one specific request ("more charts and visual cues,
everywhere") concrete, testable, and safe to hand to an agent without it
drifting into clutter.

---

## Part 0 — Guardrails. Read this section twice.

### 0.1 Why this document exists

The instruction driving this document is: **"use a hell lot of charts and
visual cues in the dashboard."** Taken literally and without constraints,
that instruction is dangerous — it is exactly the kind of prompt that causes
a coding agent to add radial speedometer gauges, drop shadows on every chart,
a gradient on every card instead of one, decorative icons that don't
represent data, and pie charts creeping back in because they're "more
visual." **Every one of those is a worse dashboard, not a better one**, and
every one of those directly undoes work already done in
`DASHBOARD-REFINEMENT.md`.

So the instruction is being translated here into something specific:
**breadth, not depth.** More of the dashboard's surface area should carry a
real chart or visual cue than currently does — nearly every widget should
have one. But **no single widget should carry more than one or two**, and
every chart that gets added must follow the exact same rules — one hue at
varying opacity, no donuts, no smoothing on discrete data, hatched fills, T7
tooltips — as the charts that already exist. "More charts" means more
widgets get a chart. It does not mean each widget gets more decoration.

### 0.2 Hard stop conditions

Stop and ask before proceeding, rather than guessing, if any of these come up
while working through Part 3:

- A task asks you to add a chart to a widget and you cannot tell from the
  API contract what data would drive it. Do not invent a data shape. Check
  `DASHBOARD-API-CONTRACT.md` and `DASHBOARD-ADMIN-WIDGETS.md` Part 3 first;
  if it's genuinely not there, stop and say so instead of fabricating a
  payload.
- A task seems to conflict with a rule from an earlier doc (for example, you
  think a widget "needs" a donut to look right). It doesn't — say so and
  propose the `DistributionBar` alternative instead of building the donut.
- You are more than one task into a prompt and realize you're improvising
  beyond what was asked. Stop, report what you've done, and confirm before
  continuing.

### 0.3 Forbidden, always, no exceptions

Grep for these after every task in Part 3, not just at the end:

- Pie or donut charts of any kind, anywhere.
- Radial/speedometer gauge charts.
- 3D bar, column, or pie effects.
- Drop shadows on chart elements themselves (bars, lines, points) — shadows
  are for card surfaces only, per `DASHBOARD-GRAPHICAL-REFRESH.md` U4, and
  only in light mode.
- A gradient background on any card other than the one hero/insight card per
  dashboard (`DASHBOARD-GRAPHICAL-REFRESH.md` U1).
- More than one hue used for categorical data in any single chart. Still
  `categoricalScale()` — one hue at descending opacity — everywhere except
  the two established semantic exceptions (success/failure colours,
  bronze/gold rarity accent).
- Smoothed curves on discrete daily/weekly counts. Still bars or step lines.
- An icon that doesn't represent something real about the data next to it.
  No decorative icons "because the card looked empty."
- More than 8 x-axis ticks on any chart, still.
- A widget that previously worked correctly and gets broken because a chart
  was added carelessly on top of it. Test the widget after every change, not
  just at the end of a whole prompt.

---

## Part 1 — The visual-coverage rule, made testable

### 1.1 The rule

**Every widget on every dashboard must carry at least one visual element
beyond plain text, unless it appears on the short allow-list in 1.2.** A
"visual element" is one of: a bar-behind-number KPI treatment, a
`DistributionBar`, a `SegmentedBar`, a `DotMatrix`, a line/area/bar chart, a
severity-coloured dot or left-accent bar tied to real data, or a trend
sparkline. A label plus a number plus nothing else does not qualify.

### 1.2 The allow-list — text-only is acceptable ONLY for these

- Single-fact widgets where the fact genuinely has no time dimension or
  breakdown to show: `elevated-access-register`'s admin count, for example —
  though even this should get a comparison-against-30-days-ago delta per its
  own spec in `DASHBOARD-ADMIN-WIDGETS.md`, which itself counts as a visual
  cue (a `DeltaChip`).
- Empty and zero states, per the existing rule that they render as a
  sentence, not a chart of nothing.
- Anything explicitly marked text-only in a prior doc for a stated reason.

If a widget isn't on this list and currently has no chart, it needs one.
That's most of them.

### 1.3 The minimum count — this is what makes "a hell lot" testable

**Every persona's dashboard, counting only Bands B/C/D/E (not the KPI row),
must contain at least ten distinct visual-element instances**, where each
instance is one of the forms listed in 1.1, and repeats of the exact same
form on different widgets each still count individually (four widgets each
using `SegmentedBar` count as four, not one). This is a floor, not a target
to stop at.

**Count the distinct visual FORMS separately from the count above**: across
one persona's full dashboard there must be at least six different forms from
the following list actually in use: bar-behind-number KPI, `DistributionBar`,
`SegmentedBar`, `DotMatrix`, line chart, area chart, horizontal bar chart,
sparkline, severity dot/accent bar, milestone timeline. Two adjacent widgets
should never use the same form — this rule already existed in
`DASHBOARD-VISUAL-DEPTH.md` item 11 and still applies.

### 1.4 The restraint rule that keeps this from becoming clutter

**No single widget may contain more than two visual-element instances.** A
table with a `SegmentedBar` in one column and a severity dot in another is
two — that's the ceiling. A KPI card gets exactly one (the bar-behind-number
treatment) plus its `DeltaChip`, which doesn't count toward the two-element
cap since it's part of the standard KPI treatment, not an addition.

---

## Part 2 — Per-widget visual assignment

Every widget from `DASHBOARD-PLAN.md` Parts 2 and `DASHBOARD-ADMIN-WIDGETS.md`
Part 2, with its assigned visual form. Build exactly these — do not invent
additional charts beyond this table, and do not skip any row.

### Band A — KPI cards (all of A1–A13)
Bar-behind-number per `DASHBOARD-GRAPHICAL-REFRESH.md` U2, on every single
one, no exceptions. This was already specified; confirm it's actually true of
all thirteen, not just the four visible in the screenshots.

### Band B — position/charts

| Widget | Visual form | Notes |
| :--- | :--- | :--- |
| B1 requests-by-lifecycle-stage | `DistributionBar` | Fixes the donut regression from `DASHBOARD-GRAPHICAL-REFRESH.md` U7 |
| B2 budget-exposure | `DistributionBar` | Already correct — verify it hasn't regressed |
| B3 budget-allocation-by-department | Horizontal bars, one per department | Already in `VISUAL-DEPTH` V6-style treatment |
| B4 workforce-by-department | Horizontal proportional bars | Per V6 — confirm built, not just specced |
| B5 budget-vs-actual-trend | Line chart, two series (planned/actual) | Confirm hatch fill on the gap area, not a solid tint |
| B6 time-in-stage | Horizontal bars, one hue by rank | Per V5 — confirm built |

### Band C — work/tables

| Widget | Visual form | Notes |
| :--- | :--- | :--- |
| C1 items-requiring-attention | Severity dot per row (High/Medium/Low), left-accent bar | Table stays a table — the visual cue is per-row, not a chart replacing the table |
| C2 contract-runway | `SegmentedBar` or bucket bars for the 0–30/31–90/91–180/180+ buckets | Plus the existing vendor sub-table |
| C3 request-exceptions | Severity dot per row, icon per exception type (never colour-per-type, icon only) | |
| C4 upcoming-milestones | Milestone timeline strip per V4, list remains beneath as fallback | |
| C5 recent-activity | Stays a plain feed — this is on the allow-list, it's a log, not data with a shape to chart | |

### Band D — role-specific

| Widget | Visual form | Notes |
| :--- | :--- | :--- |
| D1 emiratisation-quota | `SegmentedBar` against target, plus horizontal bars by business unit | |
| D2 budget-period-status | Approval-progress as a 4px stage rail (reuse the existing lifecycle-stepper pattern) | |
| D3 reconciliation-exceptions | Severity dot per row | |
| D4 integration-health | Status dot per system (green/amber/red) — this already exists, verify | |
| D5 interview-schedule | Stays a list — allow-list, it's a schedule, not aggregate data | |
| D6 vendor-performance | Horizontal bars for submission rate/acceptance rate | |
| D7 draft-expiry-watch | `DotMatrix` if more than one draft, otherwise text (allow-list for the single-item case) | |
| D8 pending-hr-decisions | Severity dot per row by what's needed | |

### Band E — System Administrator platform widgets

| Widget | Visual form | Notes |
| :--- | :--- | :--- |
| E1 background-job-health | Status dot per row, red row-tint for `missedWindows > 0` | Table-based, per-row visual cue only |
| E2 data-integrity-checks | Status dot per row, left accent bar for CRITICAL severity | |
| E3 scheduled-actions-tonight | Stays a list — allow-list, small enumerable set | |
| E4 privilege-changes | `DotMatrix` for the 7-day trend, `DeltaChip` for this-week-vs-last-week | |
| E5 elevated-access-register | Text plus `DeltaChip` vs 30 days ago — allow-list per 1.2 | |
| E6 active-delegations | Amber marker per row expiring within 3 days | |
| E7 account-hygiene | `DotMatrix` or small horizontal bars across the six figures | Currently six flat numbers — this is one of the most text-heavy widgets and a strong candidate |
| E8 rate-limit-pressure | `SegmentedBar` per tier, hits against limit | Already specced in `ADMIN-WIDGETS`, confirm built |
| E9 notification-delivery | Small horizontal bars: queued/sent/failed/retrying | Currently four flat numbers |
| E10 document-pipeline | Small horizontal bars: stored/scan failures/expiring | Currently flat numbers |
| E11 audit-retention | Sparkline of daily event volume if the data supports it, otherwise text | |
| E12 configuration-drift | Stays a table, severity dot if a severity field exists | |

---

## Part 3 — Prompts

Very explicit on purpose. Each restates its own numbers rather than
cross-referencing, because you should not need to hold the whole document in
context to execute one task correctly.

---

### J1 — Read and report before touching code

```
CONTEXT
You are working in the OMS frontend repo. Before writing any code, read these
five files in full and in this order:
  1. docs/DASHBOARD-VISUAL-COVERAGE-GEMINI.md (this file, all of it)
  2. docs/DASHBOARD-GRAPHICAL-REFRESH.md
  3. docs/DASHBOARD-VISUAL-LANGUAGE.md
  4. docs/DASHBOARD-KPI-CARDS-AMENDMENT.md
  5. docs/DASHBOARD-API-CONTRACT.md

TASK — Report only, no code changes in this task
For every widget listed in Part 2's four tables, report:
  - Does it currently exist in the codebase? File path if yes.
  - Does it currently have a chart/visual element, and if so which form?
  - Does the API contract (docs/DASHBOARD-API-CONTRACT.md and
    docs/DASHBOARD-ADMIN-WIDGETS.md Part 3) already return the data needed
    for the visual form assigned to it in Part 2's table?

If any widget's assigned visual form needs data the API contract doesn't
return, list it separately under a heading "BLOCKED — needs new payload
field" and do not attempt to invent the data client-side.

Do not start building anything in this task. Report back and wait.
```

---

### J2 — Shared primitives audit and completion

```
CONTEXT
Read docs/DASHBOARD-VISUAL-COVERAGE-GEMINI.md Part 0 and Part 1 in full
before starting. These primitives are referenced throughout Part 2 and must
all exist and work correctly before you touch any individual widget:
  - KpiCard with bar-behind-number (should exist from a prior task — verify)
  - DistributionBar
  - SegmentedBar
  - DotMatrix (may not exist yet — check)
  - Sparkline
  - A severity-dot component (small filled circle, three colours only: the
    existing danger/warning/neutral semantic tokens — check if this exists
    as a shared component or if severity dots are currently drawn ad hoc
    per-widget, which would need consolidating)

TASK 1 — For each primitive above that does not yet exist, build it now,
before any widget work. Do not build a one-off version of a primitive inside
a single widget file — every primitive lives in
src/components/oms/dashboard/ (or src/components/oms/dashboard/charts/ for
chart-specific ones) and gets imported everywhere it's used.

TASK 2 — For DotMatrix specifically, if it doesn't exist:
  - One column per period.
  - Dot count per column proportional to that period's value, rounded to the
    nearest whole dot — never a fractional or partial dot.
  - One hue, 100% opacity, consistent gap between dots (match the existing
    spacing scale used elsewhere in the dashboard, do not invent a new one).
  - No axes, no gridlines, no legend.
  - Export it with the same prop pattern as the existing chart wrappers
    (check how BarChartCard or AreaChartCard take their props and match
    that pattern, don't invent a different API shape).

TASK 3 — For the severity-dot component if it doesn't exist as shared:
  - 8px filled circle.
  - Exactly three allowed colours: the existing danger, warning, and neutral
    semantic tokens. Never a fourth colour, never a custom hex.
  - Accepts a severity prop of 'high' | 'medium' | 'low' or
    'critical' | 'high' | 'medium' depending on what each widget's data
    actually uses — check DASHBOARD-ADMIN-WIDGETS.md Part 3 payloads for the
    real enum values rather than guessing.

VERIFY: build a demo page at /app/dev/visual-coverage-primitives showing
every primitive listed above with real-looking data. Confirm DotMatrix
renders whole numbers of dots only, and the severity dot never uses a colour
outside the three allowed tokens.

STOP after this task and report what you built before proceeding to J3.
```

---

### J3 — Band A and Band B

```
CONTEXT
Read docs/DASHBOARD-VISUAL-COVERAGE-GEMINI.md Part 2, tables "Band A" and
"Band B" only for this task. Primitives from J2 must already exist — if any
are missing, stop and say so rather than building an inline substitute.

TASK 1 — Confirm bar-behind-number on ALL of A1 through A13
Not just the four KPI cards visible in the current screenshots. Check the
widget registry for every Band A entry across every persona fixture and
confirm each renders the bar-behind-number treatment. List any that don't
and fix them.

TASK 2 — B1 requests-by-lifecycle-stage
Currently renders as a donut with a centre total. Replace with
DistributionBar. This is a bug fix against an existing rule
(DASHBOARD-VISUAL-LANGUAGE.md T6), not a new design choice — do not ask
whether to keep the donut, just fix it.

TASK 3 — B2 budget-exposure
Verify it still renders as DistributionBar and has not regressed. If it has,
fix it the same way as B1.

TASK 4 — B3, B4
Confirm horizontal bar treatment exists per Part 2's table. If either widget
is still a plain table with no bar visualisation, add horizontal bars: bar
length proportional to the value, one hue, values labelled at the bar's end
in 12px muted text.

TASK 5 — B5, B6
Confirm B5's chart uses a hatched fill (not solid) for the gap between
planned and actual, and B6 shows horizontal bars with the slowest stage
called out per its existing spec in DASHBOARD-VISUAL-DEPTH.md V5. If either
is missing entirely, build it per that spec, not from scratch — the spec
already exists, follow it exactly.

RULES FOR THIS ENTIRE TASK
- No chart in this task may use more than one hue for categorical data.
- No chart in this task may exceed 8 x-axis ticks.
- Every chart added or fixed in this task must have a table fallback below
  768px and an aria-label text summary — this was already required by prior
  docs and does not change here.
- Maximum two visual elements per widget, per Part 1.4. None of the widgets
  in this task should need more than one.

VERIFY: screenshot Band A and Band B for one persona. Confirm zero donuts,
confirm every Band A card has bar-behind-number, confirm B3-B6 all show a
chart rather than plain text/table.

STOP after this task and report before proceeding to J4.
```

---

### J4 — Band C

```
CONTEXT
Read docs/DASHBOARD-VISUAL-COVERAGE-GEMINI.md Part 2, table "Band C" only.
The severity-dot primitive from J2 must exist before starting this task.

TASK 1 — C1 items-requiring-attention
Add a severity dot (High/Medium/Low, using the three allowed semantic
colours from J2) to the left of each row, replacing or supplementing the
existing text-based priority badge — check the current implementation first;
if a text badge already conveys this, the dot is IN ADDITION to it as a
faster visual scan cue, not a replacement, since the badge's text label is
still required by the "never colour alone" accessibility rule.

TASK 2 — C2 contract-runway
Add SegmentedBar or bucket-style bars for the four buckets (0-30, 31-90,
91-180, 180+ days). The existing vendor sub-table beneath stays as-is — this
task only adds the visual to the bucket summary, not a chart replacing the
whole widget.

TASK 3 — C3 request-exceptions
Severity dot per row, same three-colour rule as C1. Exception TYPE (SLA
breach, budget mismatch, etc.) is still conveyed by icon, never by colour —
this was already a rule in DASHBOARD-ADMIN-WIDGETS.md and does not change.

TASK 4 — C4 upcoming-milestones
Build the MilestoneTimeline strip per DASHBOARD-VISUAL-DEPTH.md V4 if it
does not already exist: 60-day horizontal strip, month dividers, today marked
with a vertical line, markers coloured by type and sized by count, hover
shows detail, click navigates. The existing list stays beneath as the
accessible fallback — do not remove it.

TASK 5 — C5 recent-activity
No change. This widget is on the text-only allow-list from Part 1.2 — it's a
log feed, not aggregate data with a shape to chart. Do not add a chart here
just to hit the coverage count; that would violate Part 1.4's restraint rule
and the log format is genuinely the right form for this content.

VERIFY: screenshot Band C. Confirm C1 and C3 show severity dots, C2 shows
bucket bars, C4 shows the timeline strip with a visible today-marker, and C5
is unchanged. Confirm no widget in this task has more than two visual
elements.

STOP after this task and report before proceeding to J5.
```

---

### J5 — Band D

```
CONTEXT
Read docs/DASHBOARD-VISUAL-COVERAGE-GEMINI.md Part 2, table "Band D" only.

TASK 1 — D1 emiratisation-quota
SegmentedBar showing current percentage against target, plus horizontal bars
for the breakdown by business unit. Amber below target, green at or above —
this colour rule already existed in DASHBOARD-PLAN.md D1, don't change it,
just add the visual forms.

TASK 2 — D2 budget-period-status
Render approval progress as a 4px stage rail, reusing the existing lifecycle
progress-rail pattern from DASHBOARD-PLAN.md 6.1 rather than building a new
progress component.

TASK 3 — D3, D8
Severity dot per row using the same shared component and three-colour rule
as C1/C3. Do not build a second severity-dot component — import the one from
J2.

TASK 4 — D4
Verify the existing status-dot-per-system treatment (green/amber/red) is
intact — this widget was already specced this way in
DASHBOARD-ADMIN-WIDGETS.md D4/G2. If it's missing, add it; if it exists,
leave it alone.

TASK 5 — D6
Horizontal bars for submission rate and acceptance rate, top 5 vendors by
activity, per the existing spec.

TASK 6 — D7
If more than one draft is expiring, use DotMatrix. If exactly one, this
widget falls onto the text-only allow-list per Part 1.2 — a single fact does
not need a chart. Implement the conditional, don't force a chart onto a
single data point.

TASK 7 — D5
No change. Allow-list per Part 1.2 — it's a schedule of specific
appointments, not aggregate data.

VERIFY: screenshot Band D for HR, Finance, and Line Manager personas (the
roles that see these widgets per DASHBOARD-PLAN.md Part 3). Confirm every
widget matches its assigned form from Part 2, and D5 is confirmed unchanged.

STOP after this task and report before proceeding to J6.
```

---

### J6 — Band E, System Administrator

```
CONTEXT
Read docs/DASHBOARD-VISUAL-COVERAGE-GEMINI.md Part 2, table "Band E" only,
and DASHBOARD-ADMIN-WIDGETS.md Part 2's "three that matter most" section
again before starting — E1 and E2 are the highest-stakes widgets in the
entire dashboard and must not have their existing correctness compromised by
this visual pass.

TASK 1 — E1, E2, E12
Status dot / left-accent-bar per row, using the shared severity component.
CRITICAL: do not let this visual addition obscure or replace the existing
`missedWindows` prominence rule for E1, or the CRITICAL-severity left accent
bar for E2 — those are correctness features, not decoration, and this task
adds a visual cue alongside them, never instead of them.

TASK 2 — E4
Add DotMatrix for the 7-day trend of privilege changes. The existing
DeltaChip (this week vs last week) stays — the DotMatrix is the added visual
form, giving this widget two elements total, at the Part 1.4 ceiling. Do not
add a third.

TASK 3 — E7, E9, E10
These are currently the most text-heavy widgets in Band E — flat lists of
numbers with no visual form at all. Add small horizontal bars across the
figures in each (six figures for E7, four for E9, three for E10). Bar length
proportional to value within each widget's own set, one hue, value labelled
at the bar's end.

TASK 4 — E8
Confirm SegmentedBar per tier (hits against limit) is built per the existing
spec in DASHBOARD-ADMIN-WIDGETS.md E8/G3. If missing, build it now.

TASK 5 — E11
If daily event-volume data exists in the audit-retention payload, add a
sparkline. If it doesn't, leave this widget as text — do not request a new
API field just to add a chart here; check J1's blocked-widgets report first.

TASK 6 — E3, E5, E6
No forced chart addition. E3 and E5 are on the text-only allow-list per Part
1.2 (E5 already gets a DeltaChip vs 30 days ago, which counts). E6 gets its
existing amber-marker-for-expiring-soon treatment, which is itself the
visual cue — don't add a second one on top of it.

VERIFY: screenshot the full System Administrator dashboard, all of Band E.
Confirm E1 and E2's existing failure-detection behavior (missedWindows,
CRITICAL accent bars) is completely intact — load the degraded fixture set
specifically to check this, not just the healthy one. Confirm E7/E9/E10 now
show bars instead of flat numbers.

STOP after this task and report before proceeding to J7.
```

---

### J7 — Density pass and count check

```
CONTEXT
Read docs/DASHBOARD-VISUAL-COVERAGE-GEMINI.md Part 1.3 and 1.4, and
DASHBOARD-GRAPHICAL-REFRESH.md U9.

TASK 1 — Count visual elements per persona
For each of the five personas (Requestor, HOD, HR, Finance, System Admin),
count every visual-element instance across Bands B through E (not the KPI
row) using the definition in Part 1.1. Report the count per persona.

If any persona is below ten, identify which allow-listed widgets from Part
1.2 could reasonably take a visual element without violating Part 1.4's
two-element ceiling, and add one — but only where it's genuinely defensible,
not just to hit the number. A widget correctly staying text-only (like
recent-activity) should stay that way even if the count is short; find the
shortfall elsewhere first.

TASK 2 — Count distinct visual FORMS per persona
Confirm at least six different forms are in use per persona per Part 1.3,
and that no two adjacent widgets in the same band use the same form. List any
adjacent-duplicate you find and fix by swapping one to an equally valid
alternative form from Part 1.1's list.

TASK 3 — Re-apply the U9 density fix from DASHBOARD-GRAPHICAL-REFRESH.md
On System Administrator specifically: confirm Background job health, Data
integrity, Tonight's scheduled actions, and Privilege changes are
consolidated to at most three widgets visible without scrolling at a
standard viewport, with the "View all" row ceiling at 4 rather than 5. If
the visual additions from J6 made these widgets taller and reintroduced the
scrolling problem, that's a regression to fix in this task, not something to
leave for later.

VERIFY: report the final per-persona counts for both TASK 1 and TASK 2 in a
table. Screenshot all five personas.

STOP after this task and report before proceeding to J8.
```

---

### J8 — Final verification

```
CONTEXT
Verify the complete dashboard against docs/DASHBOARD-VISUAL-COVERAGE-GEMINI.md
in full, plus re-check every rule from DASHBOARD-GRAPHICAL-REFRESH.md,
DASHBOARD-VISUAL-LANGUAGE.md, and DASHBOARD-REFINEMENT.md that this work
touches. Report a table: check | expected | actual | pass.

FORBIDDEN PATTERNS — check these first, they are the highest-risk regressions
1. Grep the entire dashboard codebase for pie or donut chart usage. Zero.
2. Grep for radial/gauge chart components. Zero.
3. Grep for any 3D chart rendering options passed to the charting library.
   Zero.
4. Grep for box-shadow or drop-shadow applied to chart elements (bars,
   lines, points) rather than card surfaces. Zero.
5. Count cards with a non-white filled/gradient background per persona.
   Exactly one (the hero/insight card) — not zero, not two or more.
6. Grep every chart for hardcoded multi-colour arrays. All categorical
   colour must still come from categoricalScale().

COVERAGE
7. Report the Part 1.3 minimum-count table again, final numbers, all five
   personas at or above ten.
8. Confirm at least six distinct visual forms per persona, no two adjacent
   widgets sharing a form.
9. Confirm no widget exceeds two visual elements (Part 1.4).
10. Confirm every widget in Part 2's four tables matches its assigned form,
    or is a documented allow-list exception.

CORRECTNESS NOT COMPROMISED BY THIS PASS
11. Load the degraded fixture set. Confirm E1's missedWindows detection and
    E2's CRITICAL severity accent bars are still fully functional and
    visually prominent — this is the most important check in this entire
    document, since these two widgets exist specifically to catch silent
    failures and must not be visually diminished by a decoration pass.
12. Confirm all money still flows through lib/money.ts, still integers in
    minor units end to end.
13. Confirm no arithmetic on data fields in any widget component — grep for
    it. Zero, still.
14. Confirm every chart still has a table fallback below 768px and an
    aria-label summary, including every chart added in this document.
15. Confirm permission gating is untouched — grep for role-name strings in
    dashboard code. Zero, still.

VISUAL CONSISTENCY
16. Screenshot all five personas, light and dark, at 1440px. Place them
    beside the screenshots attached to this conversation. The dashboard
    should now be visibly denser with real charts while still looking calm,
    not cluttered — if it looks busy or chaotic in any screenshot, that is a
    FAIL on this document's actual goal even if every individual rule above
    passes.

List every TODO marker found, grouped by the module that resolves it, same
as every prior doc's final gate.
```

🛑 Final gate. Item 16 is the real test — the numeric checks can all pass and
the page can still look wrong. Trust the screenshot over the checklist if
they disagree.

---

## Part 4 — If you are Gemini and something in here is ambiguous

Ask. Specifically:

- If Part 2's table assigns a visual form to a widget and you genuinely
  cannot find the data for it anywhere in the API contract, say so in your
  J1 report rather than inventing a plausible-looking payload.
- If a task in Part 3 seems to require more than two visual elements on one
  widget to look right, that's a sign the widget's underlying design is
  wrong, not that Part 1.4's ceiling should be ignored — flag it instead of
  quietly exceeding the limit.
- If you're unsure whether something counts as "decoration" versus a
  genuine visual cue, the test is: **does removing it lose real information,
  or just lose visual interest?** If removing it loses nothing, it's
  decoration and it shouldn't be added, no matter how empty the widget looks
  without it.
