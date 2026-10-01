# Dashboard Widgets — Visual Refinement

Raises every widget from `DASHBOARD-PLAN.md` above the standard set by the
current security dashboard.

**Run after D1–D7 are complete.** These are refinement passes over built
widgets, not construction.

**Palette unchanged.** Everything here uses existing theme tokens.

---

## Part 1 — What reads as dated

Diagnosed from the current security dashboard. Each is a specific, fixable
thing — and each must be avoided in the new widgets.

| # | Problem | Why it dates the page |
| :--- | :--- | :--- |
| 1 | **Rainbow categorical bars** — seven hues in "Events by Type" | Colour carries no meaning. Reads as decoration, not data. The clearest single tell |
| 2 | **A donut with one segment** — "Unknown", 350px tall | A pie of one is not a chart. This is what an undesigned empty state looks like |
| 3 | **~40 crammed x-axis labels** in Success vs Failures | Unreadable. Nobody chose 40 ticks; nobody chose anything |
| 4 | **Smoothed bell curve over discrete daily counts** | Smoothing invents values between data points. The curve implies failures at 2.4 on a Wednesday afternoon. It's wrong, not just ugly |
| 5 | **Raw event codes on screen** — `REFRESH_TOKEN_ROTATED`, `RTR Events` | Engineering language leaking. "RTR" is unexplained anywhere |
| 6 | **Subtitle under every title** — "Client type distribution" | Restates the title, costs 20px per card, adds nothing |
| 7 | **Ragged card heights in one row** — 150px tiles beside a 500px panel | No rhythm. The eye finds no baseline |
| 8 | **Huge padding for one digit** | "Active Sessions / 1" occupies 150×400px |
| 9 | **Zeros everywhere with no framing** | Three cards read "0". A healthy system looks broken |
| 10 | **Three identical repeated events** in the SOC feed | Noise, not signal. No grouping |
| 11 | **A "Reload Data" button, no timestamp** | Implies staleness without saying how stale |
| 12 | **Icon treatment inconsistent** — tinted circles top-right on tiles, inline left on panels | No system |

---

## Part 2 — The standard

### 2.1 Colour in charts 🔴

The single biggest change.

- **Categorical data uses one hue at varying opacity** — 100%, 75%, 55%, 40%,
  28% — or a designed sequential ramp. Never one hue per category.
- **Semantic colour only where it means something.** Red is failure. Amber is
  warning. Green is healthy. If a bar is red because it's the third bar, that's
  wrong.
- **Maximum two semantic colours per chart.** Success versus failure is two.
  Six event types is one hue at six opacities.
- Never rely on colour alone — pair with position, label, or pattern.

### 2.2 KPI tiles

| Property | Value |
| :--- | :--- |
| Height | **120px fixed** — uniform across the row, no exceptions |
| Padding | 20px |
| Label | 13px muted, **above** the value |
| Value | **32px/600**, `tabular-nums` |
| Delta | 12px chip beside the value |
| Sparkline | 32px tall at the bottom, no axes, no gridlines |
| Icon | 20px muted, top-right. **No tinted circle** |
| Subtitle | **Deleted** |

**Delta direction is not delta sentiment.** More failed logins is bad — red up
arrow. More approved requests is good — green up arrow. Each tile declares
whether increase is positive.

### 2.3 Charts

- Height **200–260px**. Never 350px.
- **Maximum 8 x-axis ticks.** Beyond that, aggregate or thin — never crowd.
- Horizontal gridlines only, foreground at 6% opacity. **No vertical
  gridlines.**
- Axis labels 11px muted. No axis titles when the card title says it.
- **Direct labels instead of a legend** when there are three series or fewer.
- **No smoothing on discrete data.** Daily counts are bars or a step line.
  Curves are for continuous measures only.
- Area fill at most 12% opacity.
- Tooltip on hover with exact values, `tabular-nums`.
- Below 768px every chart becomes a table.

### 2.4 Cards

- **Uniform height per row.** Compute the tallest and match, or constrain
  content.
- Header **48px**: title 14px/600 left, meta 12px muted right.
- Padding 20px. Border 0.5px. Radius 12px. No shadow at rest.
- Hover darkens the border only — no lift on a non-interactive card.
- **No subtitle** unless it carries information the title doesn't.

### 2.5 Zero and empty are different

| State | Treatment |
| :--- | :--- |
| **Zero, and that's good** | `0` with a muted check and *"No failed logins in 24 hours"* |
| **Zero, and that needs action** | `0` with amber and *"No budget uploaded for this period"* |
| **No data yet** | *"Nothing recorded yet"* with the action that would create some |
| **Never** | A bare "0", "No data", or a single-segment donut |

A dashboard on a healthy day should read as *healthy*, not as broken.

### 2.6 Freshness

Replace refresh buttons with **"as of 08:30"** in the card header. Auto-refresh
on the 60-second cache; update the timestamp silently. Manual refresh, if kept,
is an icon in the page bar — not per card.

### 2.7 Language

No raw event codes, permission codes, table names, or unexplained acronyms
anywhere. `REFRESH_TOKEN_ROTATED` → *"Session refreshed"*. `RTR Events` →
*"Token reuse detected"*.

### 2.8 Motion

| Interaction | Duration |
| :--- | :--- |
| Chart mount | 300ms, once |
| Number change | 200ms count-up, only when the change is user-triggered |
| Hover | 120ms |
| Skeleton → content | 150ms crossfade |

One easing curve: `cubic-bezier(0.2, 0, 0, 1)`. Respect
`prefers-reduced-motion`. Nothing loops. Nothing pulses.

---

## Part 3 — Prompts

Run after D1–D7. Sized for Antigravity.

---

### E1 — Chart tokens and primitives

```
CONTEXT
Read docs/DASHBOARD-REFINEMENT.md Part 2, docs/DASHBOARD-PLAN.md, and
CLAUDE.md. The dashboard widgets from D1-D7 are built; this task raises their
visual standard.

Do not introduce new colours. Everything below maps to existing theme tokens.

TASK 1 — Create src/lib/dashboard/chart-tokens.ts
Export a single source of truth for all chart styling:

  categoricalScale(count: number): string[]
    Returns ONE hue at descending opacity: 1.0, 0.75, 0.55, 0.4, 0.28, 0.2...
    NOT one hue per category. This is the most important function in the file.
    Our current security dashboard uses seven different hues for seven event
    types, which makes colour meaningless. Do not repeat that.

  semanticColors: { success, failure, warning, neutral }
    Used ONLY where the colour means something. A bar is never red because it
    is third.

  gridStyle:    horizontal only, foreground at 6% opacity, no vertical lines
  axisStyle:    11px, --text-muted, no axis titles
  tooltipStyle: matches the app's popover, tabular-nums

TASK 2 — Create src/components/oms/dashboard/charts/
Wrapper components over Recharts that bake in the rules so no widget can
violate them:

  <BarChartCard>   horizontal or vertical bars
  <LineChartCard>  step or linear ONLY — expose no smoothing/monotone option
  <AreaChartCard>  fill capped at 12% opacity
  <Sparkline>      32px, no axes, no grid, no tooltip

  All enforce:
  - height between 200 and 260px
  - maximum 8 x-axis ticks; if more data points, aggregate or thin and log a
    console warning in development
  - direct labels instead of a legend when series <= 3
  - a table fallback below 768px, rendered from the same data
  - an accessible text summary via aria-label

  LineChartCard must NOT accept a smoothing prop. Our security dashboard renders
  daily failed-login counts as a smooth bell curve, which invents values between
  data points and is factually wrong. Discrete data gets bars or a step line.

TASK 3 — Create src/components/oms/dashboard/DeltaChip.tsx
  Props: value (number), direction ('up'|'down'), increaseIsGood (boolean)
  Renders an arrow, the percentage, and a colour derived from BOTH direction and
  increaseIsGood. More failed logins is an up arrow in red. More approved
  requests is an up arrow in green. Direction is not sentiment.

VERIFY: build a demo page at /app/dev/chart-tokens showing every primitive with
2, 5 and 12 categories, and confirm the 12-category case is one hue at twelve
opacities — not twelve hues.
```

✅ `feat(dashboard): add chart tokens and constrained chart primitives`

---

### E2 — KPI tiles

```
CONTEXT
Read docs/DASHBOARD-REFINEMENT.md Part 2.2 and 2.5. Refine all nine Band A
tiles built in D3.

TASK 1 — Rebuild KpiTile to the Part 2.2 spec
  - Height EXACTLY 120px. Every tile in a row must match. Our security dashboard
    has 150px tiles beside a 500px panel in the same row, which destroys the
    baseline.
  - Padding 20px
  - Label 13px muted ABOVE the value (currently many dashboards put it below;
    above reads faster)
  - Value 32px/600 with tabular-nums
  - DeltaChip beside the value where a comparison exists
  - Sparkline 32px at the bottom where a trend exists — no axes, no gridlines,
    no tooltip
  - Icon 20px muted, top-right. REMOVE the tinted circle background.
  - DELETE the subtitle line entirely. "Currently active" under "Active
    Sessions / 1" adds nothing.
  - Whole tile is one link target

TASK 2 — Apply the Part 2.5 zero states to every tile
Each tile declares zeroMeaning: 'GOOD' | 'NEEDS_ACTION' | 'NO_DATA'.

  GOOD         → 0 with a muted check and a sentence: "No overdue items"
  NEEDS_ACTION → 0 in amber with a sentence: "No budget uploaded"
  NO_DATA      → "Nothing recorded yet" plus the action that would create some

  A bare "0" must not appear anywhere. Our security dashboard shows three cards
  reading "0" with no framing, so a perfectly healthy system looks broken.

  Specifically:
    needs-my-action     zero is GOOD  → "Nothing waiting on you"
    auto-close-watch    zero is GOOD  → "No requests closing soon"
    open-exceptions     zero is GOOD  → "No open exceptions"
    expiring-documents  zero is GOOD  → "No documents expiring"
    security-events     zero is GOOD  → "No security events in 24 hours"

TASK 3 — Freshness per Part 2.6
  Add "as of HH:MM" to each tile's shell header, from the response updatedAt.
  Remove any per-card refresh control.

VERIFY: render all nine tiles with zero values and confirm the row reads as
reassuring rather than empty.
```

✅ `refactor(dashboard): refine KPI tiles`

---

### E3 — Band B charts

```
CONTEXT
Read docs/DASHBOARD-REFINEMENT.md Part 2.1 and 2.3. Refine the six Band B
charts from D4 to use the E1 primitives.

Replace every direct Recharts usage with the wrappers from E1. No widget should
import Recharts directly after this task — grep to confirm.

B1 requests-by-lifecycle-stage
  Horizontal stacked bar via BarChartCard, ONE hue at five opacities via
  categoricalScale(5). Not five colours.
  Direct labels beneath segments: stage name and count. No legend.
  Height 200px.

B2 budget-exposure
  Continue reusing FundStateBar from the budget module. Fund states ARE
  semantic — reserved, locked, consumed have fixed meanings — so this is the
  one place per-category colour is correct. Confirm the colours match the
  budget module exactly; if they drift, that is a bug.

B3 budget-allocation-by-department
  Horizontal bars, one hue at descending opacity by rank.
  Utilisation threshold is the ONLY semantic colour: amber above 80%, red above
  95%. Everything else is neutral.
  Maximum 8 departments; beyond that show the top 8 and a "+N more" row linking
  to the full view.

B4 workforce-by-department
  Grouped bars, onshore and offshore. Two opacities of one hue.
  Direct labels, no legend.

B5 budget-vs-actual-trend
  Twelve monthly points. Use a STEP or BAR chart, never a smooth line — monthly
  consumption is discrete. Our security dashboard renders daily counts as a
  smooth bell curve, which implies values that do not exist.
  Highlight overspend months with the semantic warning colour, nothing else.
  Maximum 8 x-axis ticks: label every other month if needed.

B6 time-in-stage
  Horizontal bars, one hue by rank. The slowest stage gets the semantic warning
  colour and a "Slowest stage" label.

RULES FOR ALL
- Height 200-260px. None taller.
- Horizontal gridlines only at 6% opacity. No vertical gridlines.
- Axis labels 11px muted. No axis titles.
- Table fallback below 768px.
- aria-label text summary on every chart.
- Delete every subtitle line beneath a chart title. "Authentication trend
  comparison" under "Success vs Failures" is restating the title.
- All money via lib/money.ts.

NEVER: a pie or donut for fewer than three meaningful segments. If a
distribution has one category, render a single stat with a sentence, not a
ring. Our security dashboard has a 350px donut with one segment labelled
"Unknown" — that is an undesigned empty state, not a chart.
```

🛑 Grep Band B for direct Recharts imports and for smoothing props. There should
be none of either.

✅ `refactor(dashboard): refine position charts`

---

### E4 — Band C and D list widgets

```
CONTEXT
Read docs/DASHBOARD-REFINEMENT.md Part 2.4 and 2.7. Refine the table and list
widgets from D5 and D6.

TASK 1 — Uniform card heights
Widgets sharing a grid row must render at the same height. Compute the row's
tallest and match, or constrain rows shown. A row of mismatched cards is the
most visible sign of an unrefined dashboard.

TASK 2 — Row density
  - Row height 48px, not 56px. These are scan lists, not forms.
  - 20px card padding, 48px header.
  - Hairline separators at 6% opacity, not solid borders.
  - Maximum 5 rows, then a "View all" link. Never scroll inside a widget.

TASK 3 — Language audit per Part 2.7
Read every string in these widgets and remove engineering language.
  - No raw event codes. Our security dashboard shows "REFRESH_TOKEN_ROTATED" as
    a badge and "RTR Events" as a card title, with RTR unexplained anywhere.
  - No permission codes, table names, or field names.
  - Acronyms are expanded or removed.
  - recent-activity renders "HOD approved OMS-2026-0141", never
    "APPROVAL_GRANTED".

TASK 4 — Deduplicate feeds
recent-activity and any event feed must GROUP consecutive identical events:
"Session refreshed ×3 — last at 06:06". Our security dashboard shows three
identical REFRESH_TOKEN_ROTATED entries from the same IP within twelve minutes,
which is noise crowding out signal.

TASK 5 — Severity without rainbow
request-exceptions and integration-health use exactly three semantic colours —
red, amber, neutral. Type is conveyed by ICON, never by hue. Five exception
types must not become five colours.

TASK 6 — Delete subtitles
Remove every explanatory caption beneath a widget title unless it carries
information the title does not.

VERIFY: screenshot each Band C and D row and confirm cards are the same height.
```

✅ `refactor(dashboard): refine list and table widgets`

---

### E5 — States and motion

```
CONTEXT
Read docs/DASHBOARD-REFINEMENT.md Part 2.5, 2.6, 2.8.

TASK 1 — Loading
Every widget's skeleton renders at its FINAL height. The dashboard must not
reflow as widgets arrive. Set an explicit minHeight per widget in the registry.
Skeleton shapes mirror the content — bars for charts, rows for tables, a block
for a KPI value. Not a generic grey rectangle.

TASK 2 — Zero and empty per Part 2.5
Audit every widget. Each must declare which of the four states applies and
render the right one. Grep for "No data" and remove every instance — each
becomes a specific sentence.

TASK 3 — Error
Inline within the widget shell: a short message and a retry. One failing widget
never breaks the page or shifts the layout. The widget keeps its height.

TASK 4 — Freshness per Part 2.6
"as of 08:30" in every widget header from the response updatedAt. Auto-refresh
on the 60-second cache and update the timestamp silently — no spinner, no
flash. A single manual refresh icon in the page bar; remove any per-card
refresh control.

TASK 5 — Motion per Part 2.8
  Chart mount 300ms, once — not on every re-render
  Number count-up 200ms, only when user-triggered
  Hover 120ms
  Skeleton to content 150ms crossfade
  One easing: cubic-bezier(0.2, 0, 0, 1)
  Nothing loops, nothing pulses, nothing bounces
  Respect prefers-reduced-motion throughout

VERIFY: throttle the network to Slow 3G and load the dashboard. The layout must
not shift once. Then force three widgets to error and confirm the page is
otherwise intact.
```

✅ `refactor(dashboard): refine states and motion`

---

### E6 — Bring the security dashboard up

```
CONTEXT
Read docs/DASHBOARD-REFINEMENT.md in full.

The security dashboard at /app/administration/security-dashboard is now the
lowest-quality surface in the application. Two dashboards at different standards
is itself a defect. Apply the same treatment.

TASK 1 — Charts
  - "Events by Type": replace seven hues with categoricalScale(6). One hue.
  - "Failed Logins (7 Days)": replace the smoothed area curve with bars. Seven
    daily counts are discrete; the bell curve implies values between days.
  - "Success vs Failures": ~40 x-axis labels is unreadable. Aggregate to weekly,
    or thin to 8 ticks. Keep the two semantic colours — success and failure
    genuinely mean something.
  - "Sessions by Device": a 350px donut with one segment is not a chart.
    Replace with a stat plus a sentence: "All 1 session from an unrecognised
    client type." If more device types exist, a horizontal bar, still not a
    donut.

TASK 2 — Tiles
Rebuild all nine KPI cards with the E2 KpiTile. Fixed 120px, no tinted circles,
no subtitles, and Part 2.5 zero states. "Failed Logins 0" becomes "0 — no
failed logins in 24 hours" with a check.

TASK 3 — Language
  REFRESH_TOKEN_ROTATED  → "Session refreshed"
  RATE LIMIT EXCEEDED    → "Rate limit reached"
  RTR Events             → "Token reuse detected"
  Token Revoked          → "Session ended"
  Session Auto-Revoked   → "Session expired"
Audit every remaining string. No raw codes anywhere.

TASK 4 — SOC feed
Group consecutive identical events: "Session refreshed ×3 — last at 06:06".
Three identical entries from the same IP within twelve minutes is noise.

TASK 5 — Layout
Cards in a row share a height. Remove every subtitle caption. Replace the
"Reload Data" button with "as of HH:MM" plus silent auto-refresh.

VERIFY: place screenshots of both dashboards side by side. They must look like
the same product.
```

✅ `refactor(security): bring security dashboard to the new standard`

---

### E7 — Verification

```
CONTEXT
Read docs/DASHBOARD-REFINEMENT.md. Verify both dashboards. Report a table:
check | expected | actual | pass.

COLOUR — highest priority
1. Grep every chart for hardcoded colour arrays. All categorical colour must
   come from categoricalScale().
2. Confirm no chart uses more than two semantic colours.
3. Confirm no categorical chart uses more than one hue.
4. Confirm no information is conveyed by colour alone.

CHARTS
5. No chart exceeds 260px height.
6. No chart has more than 8 x-axis ticks.
7. No vertical gridlines anywhere.
8. No smoothing on discrete data — grep for monotone, natural, basis.
9. No pie or donut with fewer than three meaningful segments.
10. No widget imports Recharts directly — all go through the E1 wrappers.
11. Every chart has a table fallback below 768px and an aria-label summary.

CARDS AND TILES
12. Every KPI tile is exactly 120px.
13. Cards sharing a row share a height. Screenshot each row to confirm.
14. No tinted circle icon backgrounds.
15. No subtitle captions beneath titles.

STATES
16. Grep for "No data" — zero results.
17. Every widget renders a specific sentence for its zero state.
18. Load on Slow 3G: the layout must not shift once.
19. Force three widgets to error: the page stays intact and heights hold.

LANGUAGE
20. Grep both dashboards for uppercase-underscore strings — no raw event codes.
21. No unexpanded acronyms.
22. No permission codes, table names, or field names on screen.

FRESHNESS AND MOTION
23. Every widget shows "as of HH:MM".
24. No per-card refresh buttons.
25. Nothing loops or pulses. prefers-reduced-motion is respected.

CONSISTENCY
26. Screenshot the OMS dashboard and the security dashboard side by side at
    1440px, light and dark. They must look like the same product. List every
    difference you find.
```

🛑 Final gate. Item 26 is the real test.

---

## Part 4 — Check yourself

1. **Squint at the page.** If your eye jumps to a colour, ask what that colour
   means. If the answer is "it's the third bar", it's wrong.
2. **Load it on a healthy day** with everything at zero. Does it read as *all
   clear* or as *broken*?
3. **Put both dashboards side by side.** If you can tell which was built first,
   E6 isn't finished.
