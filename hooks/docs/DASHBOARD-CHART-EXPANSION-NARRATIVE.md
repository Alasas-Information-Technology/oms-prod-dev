# Dashboard — Chart Expansion & Narrative Pass

**This document deliberately reverses two prior rules**: `T6` in
`DASHBOARD-VISUAL-LANGUAGE.md` (no donuts) and the implicit gauge-avoidance
in that same document (segmented tick bars preferred over gauges). That
reversal is stated here explicitly, on purpose, rather than happening
silently — the form was never actually the problem; a one-segment donut with
nothing else on the card was. Part 1 is the quality bar that keeps these
forms from regressing back to what got them banned the first time.

**Also addresses**: "charts should do the talking, lists should be accents,"
"a story," and "fluidic motion" — Part 3 turns those into a concrete
reading-order and visual-weight spec, not a mood.

**Supplements** every prior dashboard doc. `DASHBOARD-VISUAL-COVERAGE-GEMINI.md`'s
Part 0.3 forbidden list still applies in full **except** for the donut and
gauge lines, which this document supersedes. Everything else in that
forbidden list — 3D effects, chart-element shadows, more than one hue on
categorical data outside the new exceptions below, smoothing on discrete
data — still stands without exception.

---

## Part 1 — Quality rules for each new form

### M1 — Donut / circular (`DistributionRing`)

A sibling component to the existing `DistributionBar`, not a new colour
system. Build it to share `DistributionBar`'s exact segment-colour logic —
one hue at descending opacity per segment, same `categoricalScale()` call —
so a ring and a bar showing similar data always look like they belong to the
same app.

- **Minimum three meaningful segments.** Never build one for a widget with
  fewer than three real categories — that's the exact pattern that got this
  banned before.
- Centre shows the total, in T2's large-number treatment.
- Ring thickness: consistent, roughly 14–18% of the ring's outer radius —
  thin enough to read as a ring, not a filled disc.
- Legend: same T8 header-embedded pattern as everything else, never floating
  beside the chart.
- Hover: T7 tooltip, segment value and percentage.
- **Never adjacent to a `DistributionBar`** showing conceptually similar data
  on the same screen — pick one form per concept per page, per the existing
  "no two adjacent widgets share a form" rule.

### M2 — Heatmap

- Single hue, varying opacity 0–100%, representing magnitude. This is the
  same principle as everywhere else in the system, just applied to a grid
  instead of a bar.
- **Never a red-green diverging rainbow.** If the data is genuinely
  divergent (values meaningfully above vs below a baseline), use the
  existing danger/success semantic pair — nothing else.
- Always a legend showing what the lightest and darkest cell represent.
- Rounded cell corners (2–3px), consistent with the card radius language.
- Hover: T7 tooltip with the exact value and the cell's date/label.
- Cap at roughly 90 cells visible without scrolling or pagination — a
  calendar heatmap shows one quarter per view, not a full year crammed in.

### M3 — Area chart

Already established via T4's hatch-fill treatment. No new rule — this
section exists only to confirm it's in scope for wider use across Part 2.

### M4 — Column chart

Vertical sibling to the existing horizontal-bar treatment.

- Same T4/T11 rules: hatch fill for non-primary series, max ~8 columns
  visible before needing aggregation or a "view more."
- Apply K3's gradient-shading technique (top-to-bottom, 100% to ~85%
  opacity) — this is a 2D gradient, not 3D, per the existing rule.
- Column top corners: 4px radius, matching the card radius language at a
  smaller scale.

### M5 — Steamgraph

The highest-risk form on this list — genuinely beautiful when the data
supports it, meaningless decoration when it doesn't.

- **Minimum three category series over a continuous time axis. Never build
  one for two series** — that's just an area chart in a costume, and it will
  look like exactly that.
- Colours: a small family of harmonious tints derived from the brand accent
  (the same tint logic used in `DistributionRing`, not a new palette).
- Organic wiggle baseline is fine — that's the point of the form — but it
  sacrifices precise value-reading by design. **Every steamgraph must have a
  "view as table" link next to it**, more strictly enforced here than the
  general chart-fallback rule, since this form is the least precise of
  anything in the system.
- Label only the two largest series directly on the chart; the rest go in a
  compact legend.
- **Before building one, check whether the underlying data actually has
  three-plus category series.** If a widget's data is currently just a
  total, or two series, flag it as blocked rather than inventing a
  breakdown that doesn't exist in the API contract.

### M6 — Gauge

- One value against one reference/threshold per gauge. Never more than that
  — a gauge trying to show several things at once is chart junk with extra
  steps.
- Semi-circular or 270° arc. Flat, modern rendering — no glossy dial bezel,
  no needle skeuomorphism, no drop shadow on the arc itself.
- The reference/threshold renders as a tick mark or a secondary arc segment,
  not a second needle competing with the first.
- Centre shows the value in T2's large-number style.
- Colour: neutral/accent by default. Only shift to the danger or success
  semantic token when crossing the threshold actually means something bad or
  good — never decorative rainbow arc colouring.

### M7 — Waffle

- 10×10 grid, 100 squares, each representing 1%.
- Filled squares: accent hue, 100% opacity. Unfilled: a faint neutral tint,
  not fully transparent.
- **Reserved specifically for progress-of-one-quantity-toward-one-target**
  concepts — a quota, a completion rate against a goal. This is what keeps
  it from being redundant with `DistributionRing`/`DistributionBar`, which
  own "breakdown of a whole into several parts." If a widget is really a
  breakdown, it gets a ring or a bar, not a waffle.

---

## Part 2 — Widget assignment

Heaviest on System Administrator, per the specific callout — those widgets
are currently the flattest in the whole system (several are six numbers with
nothing else).

### System Administrator

| Widget | New form | Why |
| :--- | :--- | :--- |
| E1 background-job-health | Calendar **heatmap** (M2) above the existing table, 30–60 days, pass/fail per day | The table stays as the accessible detail view — the heatmap is the at-a-glance addition |
| E2 data-integrity-checks | Same heatmap treatment, or merge E1+E2 into one combined platform-health heatmap if that reads better | Same reasoning as E1 |
| E4 privilege-changes | **Heatmap** (M2): role rows × day columns, cell = count | Upgrades the existing DotMatrix trend into something that shows WHO, not just how many |
| E7 account-hygiene | **Waffle** (M7) | Literally "what percentage of accounts are compliant" — the canonical waffle use case |
| E8 rate-limit-pressure | **Gauge** (M6), one per tier, threshold marked | Replaces the existing SegmentedBar — "how close to the limit" is the canonical gauge use case |
| E9 notification-delivery | **Donut** (M1, `DistributionRing`) — queued/sent/failed/retrying, four real segments | This is exactly the multi-segment case M1 requires — a strong, legitimate donut |
| E10 document-pipeline | **Column chart** (M4) — stored/scan failures/expiring | Currently three flat numbers |
| E11 audit-retention | **Steamgraph** (M5) — only if the API contract has an event-type breakdown, not just a daily total. Check first; if it's only a total, this stays an area chart and the type breakdown gets flagged as a blocked/future field | Follow M5's rule literally — do not invent a breakdown that doesn't exist |
| E12 configuration-drift | **Heatmap** (M2) — config item rows × time columns | |

### Other personas

| Widget | New form | Why |
| :--- | :--- | :--- |
| Budget burn vs year elapsed (Finance/Requestor) | **Gauge** (M6) — arc shows % consumed, threshold tick marks year-elapsed % | This is the flagship non-admin gauge case: two numbers being compared against each other is exactly what M6 is for. Replaces the two stacked linear bars |
| Budget allocation by department (B3) | **Column chart** (M4) instead of horizontal bars | Variety — B4 or another widget can keep the horizontal form so they don't match |
| Emiratisation quota (D1) | **Waffle** (M7) | Quota-toward-target, the same shape of concept as E7 |
| Request throughput | **Steamgraph** (M5) only if request-TYPE breakdown exists in the data (not just Created/Completed, which is two series and fails M5's minimum). Check the contract before building | Follow the rule, don't force it |
| New: request-activity-by-time | **Heatmap** (M2), day-of-week × hour-of-day | Genuinely new insight, not just decoration — worth adding as a new widget if it doesn't already exist, HR/ops-relevant personas only |

**Everything not listed above keeps its current form.** "All the charts we
have are fine" — this table adds coverage, it doesn't mandate replacing
things that already work.

---

## Part 3 — The story: reading order and visual weight

### Reading order, per persona

Every dashboard should resolve into this sequence, top to bottom:

1. **Hero card** — the headline. What matters most right now, one sentence.
2. **The "why"** — the primary trend or gauge that explains the hero (budget
   pace gauge, throughput trend).
3. **The "where"** — a breakdown (donut, waffle, column, or bar) showing
   which part of the "why" is driving it.
4. **Supporting KPIs** — secondary numbers, still charted per
   `DASHBOARD-VISUAL-COVERAGE-GEMINI.md`'s bar-behind-number rule.
5. **Lists/tables — the "what to do"** — rendered as accents per below, not
   as equal-weight cards.

This ordering is a layout instruction, not just a conceptual one: bands
should actually be arranged in this sequence top-to-bottom on every persona's
page, adjusted for which widgets that persona actually has.

### Lists and tables are accents, not peers

Table/list widgets (recent-activity, background-job-health's detail rows,
scheduled-actions, any Band C list) get a visually quieter treatment than
chart cards:

- No shadow. A flat, faintly tinted background (`--background-secondary`,
  not `--card`) instead of the white elevated surface charts use.
- A 3px left accent bar in the single brand hue, not a full coloured
  surface — enough to say "this belongs to the system," not enough to
  compete with the charts above it.
- Smaller title text (14px vs the 16-18px chart card titles).
- Positioned toward the bottom of the layout, consistently, per the reading
  order above.

The goal: a viewer's eye should land on charts first, lists second, every
time, on every persona.

### Fluidic motion, made concrete

- **Colour threading**: the hero card's accent colour should be the same
  hue driving the gauge's arc, the donut's dominant segment, and the
  column chart's fill directly below it. The eye recognizes continuity
  across a page that reuses one thread of colour through its hierarchy,
  rather than every widget picking independently.
- **Staggered reveal on load**: charts fade/rise in top-to-bottom, in the
  reading order above, using the existing single easing curve
  (`cubic-bezier(0.2, 0, 0, 1)`) already established elsewhere in the
  system. Roughly 40–60ms stagger between bands. Respect
  `prefers-reduced-motion` — reduce to an instant opacity change, same rule
  as everywhere else in this system.
- **No abrupt size jumps** between vertically adjacent rows — if the hero
  row is tall, the row directly beneath it shouldn't be dramatically
  shorter; use the existing band-height rhythm work from
  `DASHBOARD-VISUAL-DEPTH.md` H4 to keep transitions smooth rather than
  building this from scratch.

---

## Part 4 — Prompts

Continues the letter sequence from `DASHBOARD-VISUAL-IMPACT-AUDIT-AND-FIX.md`
(K1–K5). Same rules as before: self-contained, stop and report after each
one, do not batch.

---

### L1 — Data audit before any new chart form

```
CONTEXT
Read docs/DASHBOARD-CHART-EXPANSION-NARRATIVE.md Part 1 and Part 2 in full
before starting.

TASK — Report only, no code
For every widget listed in Part 2's two tables, check
docs/DASHBOARD-API-CONTRACT.md and docs/DASHBOARD-ADMIN-WIDGETS.md Part 3 and
report whether the data needed for its assigned new form already exists.
Specifically:
  - E9 notification-delivery: confirm four real segments (queued/sent/
    failed/retrying) exist in the payload, not just a total.
  - E11 audit-retention and request-throughput: confirm whether an
    event-type or request-type breakdown exists. Per M5's rule, if only a
    daily total exists, these do NOT get a steamgraph — report this clearly
    rather than building one anyway.
  - E1/E2/E4/E12: confirm daily/per-role granularity exists for the heatmap
    treatments — a heatmap needs a value per cell, check the data actually
    supports the grid size proposed.

List every widget under one of three headings: "Ready — data exists",
"Blocked — needs a new API field, specify what field", or "Needs
verification — ambiguous, ask before proceeding."

Do not build anything in this task.
```

---

### L2 — Shared chart primitives

```
CONTEXT
Read docs/DASHBOARD-CHART-EXPANSION-NARRATIVE.md Part 1 (M1–M7) in full.
Build each primitive exactly to its quality rules — these rules exist
specifically to prevent recreating the dated versions of these forms that
were banned in DASHBOARD-VISUAL-LANGUAGE.md.

TASK 1 — DistributionRing (M1)
Share categoricalScale() and segment-colour logic with the existing
DistributionBar — do not invent a new colour system for this component.
Minimum 3 segments enforced in the component itself (if fewer than 3 are
passed in, render a console warning in development and fall back to
DistributionBar instead of rendering a degenerate ring).

TASK 2 — Heatmap (M2)
Generic grid component: rows, columns, and a value-per-cell accessor.
Single-hue opacity scale by default. Accept an optional "diverging" mode
that uses the danger/success semantic pair specifically — do not add any
other colour mode.

TASK 3 — Gauge (M6)
Semi-circular arc, value + threshold props. Flat rendering, no gradient
bezel, no needle. Colour prop defaults to the accent token; only switches to
danger/success semantic tokens when a threshold-crossed prop is true.

TASK 4 — Waffle (M7)
10x10 grid, fixed square size, small consistent gap. Value 0-100 fills that
many squares in reading order (left-to-right, top-to-bottom).

TASK 5 — Column chart (M4)
Vertical sibling to the existing horizontal bar component — share as much
underlying code as sensibly possible rather than building a fully separate
component. Apply K3's gradient shading (100% to 85% opacity, top to bottom).
4px top corner radius on columns.

TASK 6 — Steamgraph (M5)
Only build this if L1's report shows at least one widget with genuine
3+ category time-series data. If L1 reported every candidate widget as
blocked or two-series-only, skip this task entirely and say so — do not
build a steamgraph with no real use case waiting for it.

VERIFY: build/update the dev demo page (from J2 earlier, or create one if it
doesn't exist) showing all primitives from this task with realistic dummy
data. Confirm DistributionRing refuses fewer than 3 segments, confirm
Heatmap's default mode never uses more than one hue, confirm Gauge has no
needle or bezel.

STOP after this task and report before proceeding to L3.
```

---

### L3 — Apply to System Administrator

```
CONTEXT
Read docs/DASHBOARD-CHART-EXPANSION-NARRATIVE.md Part 2, "System
Administrator" table only. Primitives from L2 must exist. Use L1's report to
skip anything marked Blocked — do not build against invented data.

TASK — one sub-task per row of the table
  E1/E2: add the calendar heatmap above the existing table (or merged, your
    call, note which you chose and why).
  E4: heatmap, role rows x day columns.
  E7: waffle.
  E8: gauge per tier, with the tier's limit as the threshold.
  E9: DistributionRing, four segments — only if L1 confirmed the data
    exists.
  E10: column chart.
  E11: steamgraph only if L1 confirmed 3+ series exist; otherwise leave as
    an area chart and note it as still blocked.
  E12: heatmap.

Do not remove or replace the existing detail tables/lists beneath any of
these — the new chart form is additive, the accessible detail view stays.

VERIFY: screenshot the full System Administrator dashboard. Confirm every
non-blocked widget from the table now shows its assigned new form, and no
widget lost its existing table/list content.

STOP after this task and report before proceeding to L4.
```

---

### L4 — Apply to other personas

```
CONTEXT
Read docs/DASHBOARD-CHART-EXPANSION-NARRATIVE.md Part 2, "Other personas"
table only.

TASK
  Budget burn vs year elapsed: replace the two stacked linear bars with a
    Gauge — arc shows % consumed, a tick mark on the arc shows year-elapsed
    % as the threshold reference. Keep the existing caption sentence ("23.9
    points behind...") beneath it.
  Budget allocation by department: convert from horizontal bars to a
    column chart.
  Emiratisation quota: convert to a waffle, target percentage determines
    fill.
  Request throughput: steamgraph only if L1 confirmed request-type
    breakdown data exists; otherwise leave unchanged and note it's still
    blocked.

VERIFY: screenshot Finance, Requestor, and HR dashboards. Confirm the gauge
shows both the value and the threshold clearly, confirm the waffle's fill
percentage matches the underlying quota data exactly (not rounded
differently than the existing text display of the same number elsewhere on
the page).

STOP after this task and report before proceeding to L5.
```

---

### L5 — Narrative pass: reading order and list-as-accent

```
CONTEXT
Read docs/DASHBOARD-CHART-EXPANSION-NARRATIVE.md Part 3 in full.

TASK 1 — Reorder bands per the reading order
For every persona: hero card first, then the primary trend/gauge, then a
breakdown chart, then supporting KPIs, then lists/tables last. Reorder the
actual layout, not just visually reshuffle via CSS order — the DOM order
should match, for accessibility.

TASK 2 — List/table visual treatment
For every list/table widget (recent-activity, the detail tables beneath the
new heatmaps, scheduled-actions, any Band C list): remove the shadow, change
background to --background-secondary instead of --card, add a 3px left
accent bar in the brand hue, reduce title text to 14px. This should look
noticeably quieter than the chart cards above it, not just subtly different.

TASK 3 — Colour threading
Confirm the hero card's accent hue is the same hue used in that persona's
gauge arc, donut dominant segment, and column chart fill. If any of these
currently use a different shade, align them to one consistent thread.

TASK 4 — Staggered reveal animation
Implement a top-to-bottom stagger on page load, 40-60ms between bands, using
the existing cubic-bezier(0.2, 0, 0, 1) easing curve already used elsewhere
in this system — do not introduce a second easing curve. Respect
prefers-reduced-motion: reduce to an instant opacity change with no stagger
when that preference is set.

VERIFY: screenshot one persona's full page and confirm visually that lists
read as quieter than charts. Record a screen capture (or describe frame by
frame if recording isn't available) of the page load and confirm the
stagger is visible and top-to-bottom. Toggle prefers-reduced-motion and
confirm the stagger disables.

STOP after this task and report before proceeding to L6.
```

---

### L6 — Final verification

```
CONTEXT
Verify the complete dashboard against
docs/DASHBOARD-CHART-EXPANSION-NARRATIVE.md in full. Report a table: check |
expected | actual | pass.

NEW FORMS
1. DistributionRing exists, used at minimum on E9 (if unblocked), never with
   fewer than 3 segments anywhere.
2. Heatmap exists, used on E1/E2, E4, E12, single-hue by default.
3. Gauge exists, used on E8 and Budget-burn-vs-year-elapsed, no needle, no
   bezel, no gradient dial.
4. Waffle exists, used on E7 and Emiratisation quota, 10x10 grid.
5. Column chart exists, used on E10 and Budget-allocation-by-department,
   gradient-shaded per K3.
6. Steamgraph: either genuinely built with 3+ series where data supports it,
   or explicitly absent with a documented blocked reason. No steamgraph
   with 2 series or fewer exists anywhere.

QUALITY GUARDRAILS STILL HOLD
7. Zero 3D chart rendering anywhere — same grep as
   DASHBOARD-VISUAL-COVERAGE-GEMINI.md J8, still zero.
8. All heatmaps use one hue by default; diverging mode only where genuinely
   diverging, using only the existing danger/success tokens.
9. All donuts/rings have 3+ segments, no exceptions found anywhere.
10. All gauges show exactly one value against one threshold — none showing
    more than that.

NARRATIVE
11. Every persona's page resolves hero -> trend/gauge -> breakdown ->
    KPIs -> lists, top to bottom, in actual DOM order.
12. Every list/table widget is visually quieter than chart cards (no
    shadow, secondary background, left accent bar).
13. Colour threading: spot-check three personas, confirm the hero/gauge/
    donut/column all share one accent hue per page.
14. Load animation staggers top-to-bottom and respects
    prefers-reduced-motion.

REGRESSIONS
15. Every detail table/list beneath a new heatmap is still present and
    functional — the new charts are additive.
16. E1/E2's missedWindows and CRITICAL-severity detection are still fully
    intact and visually prominent, same check as every prior verification
    document in this lineage.

Screenshot all five personas, light and dark, at 1440px. This is the
highest-stakes visual change in this whole lineage of documents — trust the
screenshots over the checklist if anything disagrees.
```

🛑 Final gate.
