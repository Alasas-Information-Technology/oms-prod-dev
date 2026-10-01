# Dashboard Visual Language

Concrete techniques, with exact values. Supplements
`DASHBOARD-REFINEMENT.md`, which said what to avoid; this says what to build.

**Uses existing theme tokens.** The reference is purple; ours is not. Adopt the
techniques, not the palette.

---

## Part 0 — Why E3 didn't land

`DASHBOARD-REFINEMENT.md` was a list of prohibitions — no rainbow, no
smoothing, no vertical gridlines, no donuts. Following it removes the things
that look wrong. It does not produce the things that look right.

This document is the positive half. Every technique below has exact numbers.

---

## Part 1 — Techniques

### T1 — The KPI row is one surface 🔴

Not four cards. **One card, four columns, hairline dividers.**

```
┌──────────────────────────────────────────────────────────────────┐
│ Reserved          │ Locked          │ Consumed        │ Available│
│ AED 5,400,000.00  │ AED 7,100,000…  │ AED 2,100,000…  │ AED 10,2…│
│ vs last month ↗3% │ vs last month …  │ vs last month … │ …        │
└──────────────────────────────────────────────────────────────────┘
```

| Property | Value |
| :--- | :--- |
| Card height | **100px** |
| Columns | Equal width, `1px` divider at 8% foreground opacity, full height minus 20px inset |
| Padding | 20px |
| Label | 12px, `--text-muted`, top |
| Value | 30px, see T2 |
| Comparison | 11px `--text-muted` + arrow + percentage in semantic colour |

Four separate bordered cards with tinted circular icons is the single most
dated pattern on the current dashboard. Delete it.

### T2 — Numeral weight contrast 🔴

The signature move in the reference. `$1 248,320` sets the leading group dark
and the trailing group light, so magnitude reads first.

For our currency:

```
AED  1,248,320 .00
 ↑        ↑      ↑
12px   30px/600  30px/400
muted  fg        muted
```

- **Currency code**: 12px, `--text-muted`, 4px gap, baseline-aligned
- **Integer part**: 30px/600, `--text-primary`
- **Decimal part**: 30px/400, `--text-muted`
- Abbreviated form `AED 24.80M`: code muted, `24` at 600, `.80M` at 400 muted

Extend `lib/money.ts` with a `<Amount variant="display">` that returns these
three spans. Every large figure uses it — KPI rows, chart tooltips, table
totals.

### T3 — Charts are short

My earlier spec said 200–260px. **That's too tall.** The reference plot area is
roughly 130px.

| Part | Height |
| :--- | :--- |
| Card header | 44px |
| Plot area | **130px** |
| X-axis labels | 24px |
| Card padding | 20px top, 16px bottom |
| **Total card** | **~215px** |

A short, wide plot reads as a trend. A tall one reads as a report.

### T4 — Hatched fill, not solid

Area fills are a **45° diagonal hatch**, not a tint.

```svg
<pattern id="hatch" width="6" height="6" patternTransform="rotate(45)"
         patternUnits="userSpaceOnUse">
  <line x1="0" y="0" x2="0" y2="6" stroke="currentColor"
        stroke-width="1" opacity="0.18"/>
</pattern>
```

- Lines 1px, 6px apart, 18% opacity of the series colour
- Solid tint only where a fill must read as a solid quantity
- Series lines themselves: **1.5px**, no dots except at the hovered point

Hatch is quieter than a tint at the same visual weight, and it stops two
overlapping areas turning into mud.

### T5 — Segmented progress bars

Not a continuous filled bar. **Discrete ticks.**

```
(72%)  ▮▮▮▮▮▮▮▮▮▮▮▮▮▮▯▯▯▯▯▯
```

| Property | Value |
| :--- | :--- |
| Ticks | 20 |
| Tick size | 2px wide × 12px tall, 1px radius |
| Gap | 2px |
| Filled | Series colour |
| Unfilled | Foreground at 10% |
| Percentage | 12px muted, in parentheses, **left** of the bar |

Reads as a gauge rather than a loading bar, and the discrete steps make small
differences legible.

### T6 — Distribution is one stacked bar

For "what makes up this total", never a pie, never separate bars.

```
Reserved        Locked          Consumed    Available
AED 5.40M       AED 7.10M       AED 2.10M   AED 10.20M
├──────────────┼───────────────┼───────────┼──────────┤
▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒░░░░░░░░░░░░⋰⋰⋰⋰⋰⋰⋰⋰⋰⋰
21.8%           28.6%           8.5%        41.1%
```

- **Labels and values above**, left-aligned to each segment's start, with a
  1px vertical divider marking the boundary
- Bar 28px tall, 6px radius on the outer ends only
- Segments in **one hue at 100% / 72% / 48% / 30%**
- A residual segment ("Other", "Available") uses the **T4 hatch**
- **Percentages below**, 11px muted, aligned to segment starts
- 2px gap between segments

This is the "one hue at varying opacity" rule executed properly. It replaces
the donut in `sessions-by-device` and the separate bars in `budget-exposure`.

### T7 — Tooltip

Dark card, not a light popover.

| Property | Value |
| :--- | :--- |
| Surface | `--surface-inverse` or foreground at 92% |
| Radius | 8px, padding 10px 12px |
| Series row | 2px × 12px colour bar, 8px gap, value in `tabular-nums` |
| Value | 13px, inverse foreground |
| Date | 11px muted inverse, **below** the values, separated by 8px |
| Shadow | `0 4px 16px rgba(0,0,0,.16)` |

Values first, date last. The reader already knows roughly where they hovered;
they came for the number.

### T8 — Legend inline in the header

Top-right of the chart card header, not below the plot.

- 2px × 12px colour bar, 6px gap, 12px `--text-muted` label
- 16px between entries
- Omit entirely when there's one series

### T9 — Table rows

- Row height 44px
- Hover and selected: background at 3% foreground, **8px radius, inset 4px** —
  a floating pill, not a full-bleed stripe
- No row separators. Spacing does the work
- Leading icon 20px in a 28px rounded square at 8% tint
- Trailing value right-aligned, 14px/600, `tabular-nums`

### T10 — Card header

- Height 44px
- Title 14px/600 left
- `⋯` icon button right, 28px, revealed on card hover
- **No subtitle. No bottom border.** Spacing separates header from content

### T11 — Axes

- Y-axis: **4 labels maximum**, at round values, 11px muted, no axis line, no
  ticks
- X-axis: **7 labels maximum**, 11px muted, no axis line
- Horizontal gridlines only, foreground at 4% — lower than the 6% I specified
  earlier
- No vertical gridlines
- No axis titles

---

## Part 2 — Prompts

Run after E1–E7. These revise that work.

---

### F1 — Extend the primitives

```
CONTEXT
Read docs/DASHBOARD-VISUAL-LANGUAGE.md Part 1, then DASHBOARD-REFINEMENT.md and
CLAUDE.md.

The E1-E3 refinement removed the wrong things but did not add the right ones.
This task builds the specific techniques.

Use existing theme tokens only. The reference design is purple; ours is not.
Adopt the techniques, not the palette.

TASK 1 — Extend src/lib/money.ts
Add a display variant returning three spans per T2:
  - currency code: 12px, --text-muted, 4px gap, baseline aligned
  - integer part: 30px weight 600, --text-primary
  - decimal part: 30px weight 400, --text-muted
Abbreviated form "AED 24.80M": code muted, "24" at 600, ".80M" at 400 muted.

Export <Amount variant="display" | "table" | "inline" />. Every large figure on
every dashboard uses the display variant. This weight contrast is the single
most noticeable refinement in the reference — the eye reads magnitude before
precision.

TASK 2 — Create src/components/oms/dashboard/HatchPattern.tsx
An SVG pattern per T4: 45 degrees, 1px lines, 6px apart, 18% opacity of the
passed colour. Exported as a reusable <defs> block with a generated id so
multiple charts on one page do not collide.

TASK 3 — Create src/components/oms/dashboard/SegmentedBar.tsx
Per T5: 20 ticks, each 2px wide by 12px tall with 1px radius and a 2px gap.
Filled ticks in the series colour, unfilled at 10% foreground. Percentage label
12px muted in parentheses to the LEFT of the bar.
Props: value, max, color, showPercent.

TASK 4 — Create src/components/oms/dashboard/DistributionBar.tsx
Per T6. This is the most important new component.
  - Labels and values ABOVE, left-aligned to each segment start, with a 1px
    vertical divider at each boundary
  - Bar 28px tall, 6px radius on outer ends only, 2px gap between segments
  - Segments use categoricalScale from E1: one hue at 100/72/48/30 percent
  - A segment flagged isResidual renders with HatchPattern instead of a fill
  - Percentages BELOW, 11px muted, aligned to segment starts
  Props: segments [{ label, value, formatted, percent, isResidual }]

TASK 5 — Create src/components/oms/dashboard/ChartTooltip.tsx
Per T7: dark surface, 8px radius, 10px by 12px padding. Each series row is a
2px by 12px colour bar, 8px gap, then the value in tabular-nums at 13px. Date
BELOW the values, 11px muted, 8px separation. Shadow 0 4px 16px rgba(0,0,0,.16).
Values first, date last — the reader came for the number.

TASK 6 — Update the E1 chart wrappers
  - Plot area height to 130px, total card ~215px per T3. My earlier 200-260px
    plot spec was too tall — a short wide plot reads as a trend, a tall one
    reads as a report.
  - Series lines 1.5px, no dots except the hovered point
  - Area fills use HatchPattern, not a solid tint
  - Y-axis maximum 4 labels, X-axis maximum 7, both 11px muted with no axis line
  - Horizontal gridlines at 4% opacity, down from 6%
  - Legend moves into the card header per T8: 2px by 12px bar, 6px gap, 12px
    muted label, 16px between entries. Omit for a single series.
  - Tooltip uses ChartTooltip

VERIFY: build a demo page at /app/dev/visual-language showing every component
with real-looking data, in light and dark.
```

✅ `feat(dashboard): add refined visual primitives`

---

### F2 — Rebuild the KPI row

```
CONTEXT
Read docs/DASHBOARD-VISUAL-LANGUAGE.md T1, T2, T10.

The Band A tiles are currently four separate bordered cards with tinted
circular icons. That pattern is the most dated thing on the page. Replace it.

TASK 1 — Create src/components/oms/dashboard/KpiRow.tsx
ONE card containing all Band A metrics as columns per T1:
  - Card height 100px, padding 20px
  - Equal-width columns separated by a 1px divider at 8% foreground opacity,
    running full height minus a 20px inset top and bottom
  - Per column: label 12px --text-muted at the top; value using
    <Amount variant="display"/> from F1; comparison line 11px muted reading
    "vs last month" plus an arrow and percentage in a semantic colour
  - The whole column is one link target, with a 3% background on hover at 8px
    radius inset 4px
  - NO icons. NO tinted circles. NO card borders between metrics.

TASK 2 — Delete the old KpiTile card treatment
Replace every Band A usage with KpiRow. The registry now groups Band A widgets
into a single row component rather than placing them individually in the grid.

TASK 3 — Zero states inside the row
Keep the E2 zero-state meanings, rendered in the column's comparison slot:
"No overdue items" with a muted check instead of a delta. The value still shows
0 at full size — do not shrink or grey it.

TASK 4 — Responsive
  - 4 columns at 1024px and above
  - 2 columns at 768-1023, with a horizontal divider between the rows
  - 1 column below 768, dividers become horizontal

VERIFY: screenshot the row beside the reference. The eye should land on the
values first, then the labels, then the deltas.
```

✅ `refactor(dashboard): rebuild KPI row as a single divided surface`

---

### F3 — Distribution and charts

```
CONTEXT
Read docs/DASHBOARD-VISUAL-LANGUAGE.md T3, T4, T6, T8, T11.

TASK 1 — Replace fund state and distribution displays with DistributionBar
  - budget-exposure: one stacked bar showing Reserved, Locked & Allocated,
    Consumed, Available. Available is the residual segment and uses the hatch.
    Labels and amounts above, percentages below.
  - requests-by-lifecycle-stage: one stacked bar across the five stages, one hue
    at descending opacity.
  - Security dashboard sessions-by-device: delete the donut entirely and use
    DistributionBar, or a single stat with a sentence when there is one
    category.

  This replaces both the donut and the separate-bars patterns. A distribution
  is one bar.

TASK 2 — Apply T3 heights everywhere
Every chart card drops to roughly 215px total with a 130px plot area. Audit
each Band B widget and reduce.

TASK 3 — Apply T4 hatch to all area fills
No solid area tints remain. Series lines to 1.5px, dots only on hover.

TASK 4 — Move every legend into the card header per T8
Delete legends beneath plots. Single-series charts lose their legend entirely.

TASK 5 — Apply T11 axes
Four Y labels maximum, seven X labels maximum, no axis lines, gridlines at 4%,
no axis titles. Where a dataset has more points than ticks, aggregate rather
than thin where the aggregation is meaningful — weekly instead of daily, for
example.

TASK 6 — Apply T10 card headers
44px, title 14px/600, ⋯ button revealed on hover, no subtitle, no bottom
border.

VERIFY: no chart card exceeds 230px. No legend sits below a plot. No solid area
fill remains.
```

✅ `refactor(dashboard): apply chart visual language`

---

### F4 — Tables and rows

```
CONTEXT
Read docs/DASHBOARD-VISUAL-LANGUAGE.md T5, T9, T10.

TASK 1 — Apply T9 to every dashboard table
  - Row height 44px
  - Hover and selected states: 3% foreground background, 8px radius, inset 4px
    horizontally — a floating pill, NOT a full-bleed stripe
  - REMOVE row separator lines entirely. Spacing does the work.
  - Leading icon 20px inside a 28px rounded square tinted at 8%
  - Trailing value right-aligned, 14px/600, tabular-nums

Applies to: items-requiring-attention, request-exceptions, contract-runway,
recent-activity, upcoming-milestones, vendor-performance, pending-hr-decisions,
and the security dashboard event feed.

TASK 2 — Use SegmentedBar wherever a proportion appears in a row
  - budget-allocation-by-department: utilisation as a SegmentedBar with the
    percentage to its left
  - workforce-by-department: capacity or fill where applicable
  - Any progress indicator inside a table row

  Continuous filled bars in table rows read as loading indicators. Segmented
  ticks read as gauges.

TASK 3 — Value emphasis in rows
Trailing amounts use <Amount variant="table"/> — exact, tabular-nums, 14px/600.
Not the display variant; that is for KPI rows only.

TASK 4 — Apply T10 headers to every list widget

VERIFY: hover a table row and confirm the highlight is an inset rounded pill,
not a full-width band.
```

✅ `refactor(dashboard): apply table visual language`

---

### F5 — Consistency sweep

```
CONTEXT
Read docs/DASHBOARD-VISUAL-LANGUAGE.md in full.

Apply the same language to the security dashboard so both surfaces match.

TASK 1 — Security dashboard KPI row
Replace all nine separate cards with KpiRow instances: two rows of four or five
columns. Remove every tinted circular icon.

TASK 2 — Security dashboard charts
  - Failed Logins (7 Days): bars, 130px plot, 7 X labels
  - Success vs Failures: aggregate to weekly, 7 X labels maximum, hatch fill,
    legend in the header
  - Events by Type: horizontal bars, one hue at descending opacity, values
    right of each bar at 12px muted
  - Sessions by Device: DistributionBar or a single stat. The donut goes.

TASK 3 — Security dashboard event feed
T9 row treatment, grouped consecutive duplicates, plain-language labels from
E6.

TASK 4 — Cross-surface audit
Screenshot the OMS dashboard and the security dashboard at 1440px in both
themes. List every visual difference. There should be none beyond content.

TASK 5 — Delete dead patterns
Grep both dashboards and remove:
  - Any remaining tinted circular icon background on a KPI
  - Any subtitle caption beneath a card title
  - Any legend beneath a plot
  - Any solid area fill
  - Any donut or pie
  - Any full-bleed row stripe
  - Any continuous progress bar inside a table row
```

✅ `refactor(dashboard): unify visual language across dashboards`

---

### F6 — Verify

```
CONTEXT
Verify both dashboards against docs/DASHBOARD-VISUAL-LANGUAGE.md. Report a
table: check | expected | actual | pass.

STRUCTURE
1. KPI metrics render as ONE divided surface, not separate cards.
2. No tinted circular icons on any KPI.
3. No card exceeds 230px for a chart.
4. Plot areas are 130px.
5. Card headers are 44px with no subtitle and no bottom border.

TYPOGRAPHY
6. Every large figure uses the T2 weight contrast: muted currency code, bold
   integer, muted decimals.
7. tabular-nums on every number.
8. Six type sizes maximum across both dashboards.

CHARTS
9. No solid area fills — all hatched.
10. Series lines are 1.5px with dots only on hover.
11. Four Y labels maximum, seven X labels maximum.
12. Gridlines horizontal only at 4%.
13. Every legend is in the card header; none below a plot.
14. Tooltips are dark with values above the date.
15. No donut or pie anywhere.

COMPONENTS
16. Every distribution uses DistributionBar.
17. Every in-row proportion uses SegmentedBar.
18. Table row hover is an inset rounded pill, not a full-bleed stripe.
19. No row separator lines in dashboard tables.

CONSISTENCY
20. Screenshot both dashboards at 1440px, light and dark, side by side. List
    every difference. There should be none beyond content.
21. Grep for direct Recharts imports outside the wrappers — zero.
22. Grep for hardcoded hex, rgb, hsl in dashboard code — zero.
```

🛑 Item 20 is the real test.

---

## Part 3 — Check yourself

1. **Cover the labels.** Can you still tell which number matters most? If every
   figure has the same weight, T2 isn't applied.
2. **Squint.** The page should resolve into a few horizontal bands, not a grid
   of boxes. If you see boxes, the KPI row is still four cards.
3. **Count the hues.** Excluding semantic red, amber and green, there should be
   one.
