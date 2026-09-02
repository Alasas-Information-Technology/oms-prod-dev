# Dashboard — Visual Depth

Adds the dimensions the dashboard is currently missing. Extends
`DASHBOARD-PLAN.md`, `DASHBOARD-VISUAL-LANGUAGE.md` and the KPI card amendment.

---

## Part 1 — Diagnosis

### What's missing

The page currently answers one question: **what is it right now?**

| Dimension | Present? |
| :--- | :--- |
| Current state | ✅ Four KPI cards, two bars |
| **Change over time** | ❌ Nothing. No trend anywhere on the page |
| **Comparison** | ❌ No "vs last month", no target, no benchmark |
| **Rate and throughput** | ❌ No sense of how fast work moves |
| **Distribution over time** | ❌ Milestones are a list, so clustering is invisible |
| **Form variety** | ❌ Two identical stacked bars, three identical lists |

Both charts are the same visual form. All three lower widgets are the same
visual form. That monotony is why it reads flat even though the styling is now
correct.

### The principle

**Impressive comes from revealing something a list can't.** Not from gradients,
3D, or a radial gauge where a number would do. Every addition below carries
information the current page cannot express.

### Two bugs to fix first

**Bug 1 — mixed label placement.** In *Requests by lifecycle stage*, "Draft" is
absent from the header row and appears in a legend beneath. Same for "Consumed"
in *Budget exposure*. This is the narrow-segment fallback working as specified,
but **mixing** inline labels with a fallback legend produces a header row that
looks like it lost an item.

Fix: the fallback is all-or-nothing. If **any** segment is too narrow, move
**every** label into the legend row. Consistency beats density.

**Bug 2 — KPI icons.** The tinted circular backgrounds are still there, and
three of four cards use the identical document glyph. An icon that is the same
across every card conveys nothing. Remove them per the KPI amendment.

---

## Part 2 — New widgets

### V1 — Sparklines in KPI cards 🔴

Already in the visual language spec, not implemented. The cheapest way to add
a time dimension.

- 28px sparkline at the bottom of each KPI card, replacing or beside the
  comparison line
- 30 days of daily values, no axes, no gridlines, no dots
- Line at 1.5px in the accent; the final point gets a 3px dot
- Fill below at 12% using the hatch pattern

`4` tells you nothing. `4, and climbing for a week` tells you something.

### V2 — Budget burn vs year elapsed 🔴

The single most useful thing you can add, and it exists nowhere in the system.

```
Budget consumed        34.2%  ████████████░░░░░░░░░░░░░░░░░░░░░░░
Financial year elapsed 58.1%  ████████████████████░░░░░░░░░░░░░░░
                              ↑ 23.9 points behind — spending is under plan
```

- Two stacked tracks, 12px each, 8px apart, same width
- Consumed in the accent; elapsed in neutral at 40%
- A caption stating the gap **and what it means**: under plan, on plan, or
  ahead of plan
- Amber when consumption leads elapsed time by more than 10 points, red beyond
  20

A percentage on its own is a fact. A percentage against elapsed time is a
judgement, and that's what a Finance Manager or HOD actually wants.

### V3 — Throughput over time 🔴

The dashboard has no time series at all. This is the biggest single gap.

- Twelve weeks, two series: **requests created** and **requests completed**
- Area chart with the T4 hatch fill, 130px plot
- Where completed trails created, the divergence is the backlog — shade that
  region in amber at 10%
- Caption: *"Backlog grew by 4 requests over 12 weeks"*

This shows whether the department is keeping up. Nothing on the page currently
can.

### V4 — Milestone timeline

Replaces the *Upcoming milestones* list — or sits above it.

```
   Sep                    Oct                    Nov
   ├──●──●─────●──────────┼──●───────────────────┼──────
      │  │     │             │
      │  │     │             └ Contract renewal · 2 resources
      │  │     └ Document expiry · 4 resources
      │  └ Joining · Ahmed Rahman
      └ Interviews · 3 candidates
```

- Horizontal 60-day strip with month dividers, 80px tall
- One marker per milestone, coloured by type, sized by count
- **Today** marked with a vertical accent line
- Hover reveals detail; click navigates
- The list stays beneath as the accessible fallback and the detail view

A list hides clustering. A timeline shows that three things land in the same
week — which is the thing worth knowing.

### V5 — Time in stage with bottleneck

Specced as B6, not rendered. Worth prioritising because it's the only widget
that answers *"why is this slow?"*

- Horizontal bars, average days per stage, one hue by rank
- The slowest stage gets the warning colour and an explicit "Slowest stage"
  label
- A target line where an SLA exists
- Caption: *"HR Review is taking 2.3× the department average"*

### V6 — Workforce by department, proportional

Specced as B4. Render it as **proportional horizontal bars** rather than a
table — bar length shows relative headcount at a glance, with onshore and
offshore as two opacities of one hue.

### V7 — Activity rhythm (optional)

Twelve weeks × seven days as a small heatmap of actions taken.

Honest assessment: this is the **most decorative** item on the list. It shows
workload rhythm and gaps, which is mildly useful and visually strong. Build it
last, and drop it if the page already feels full.

---

## Part 3 — Layout rhythm

Uniform block heights are part of why it reads flat.

```
┌──────┬──────┬──────┬──────┐   Band A — 4 KPI cards, 120px
└──────┴──────┴──────┴──────┘

┌────────────────────┬───────┐   Band B — hero row, 280px
│  V3 Throughput (8) │V2 (4) │   One wide chart + one narrow gauge
└────────────────────┴───────┘

┌────────────┬────────────────┐   Band B2 — 215px
│ Lifecycle  │ Budget exposure│
└────────────┴────────────────┘

┌──────────────────────────────┐   Band C1 — V4 timeline, full width, 120px
└──────────────────────────────┘

┌────────────────────┬───────┐   Band C2 — 320px
│ Items requiring (8)│Recent │
└────────────────────┴───────┘
```

Three different heights — 120, 280, 215 — and three different widths give the
page rhythm. Currently every row is the same shape.

**The hero row matters.** One widget noticeably larger and more visual than the
rest gives the eye a place to land. V3 throughput is the right candidate for
most roles; Finance gets V2 instead.

---

## Part 4 — Prompts

Run after F1–F6 and G1–G4.

### H1 — Fix the two bugs and add sparklines

```
CONTEXT
Read docs/DASHBOARD-VISUAL-DEPTH.md Part 1 and 2, plus
DASHBOARD-VISUAL-LANGUAGE.md and DASHBOARD-KPI-CARDS-AMENDMENT.md.

TASK 1 — Fix mixed label placement in DistributionBar
Currently, when one segment is too narrow, only THAT segment's label moves to a
legend row while the others stay inline. The result is a header row that looks
like it lost an item — "Draft" is missing from Requests by lifecycle stage and
"Consumed" from Budget exposure.

Make the fallback ALL OR NOTHING: if any segment would render below the width
threshold, move EVERY label into the legend row beneath. Never mix inline
labels with a legend.

Also raise the threshold check to run against actual measured width, not an
assumed one — use a ResizeObserver so it responds to the container rather than
guessing.

TASK 2 — Remove KPI card icons
The tinted circular icon backgrounds are still present, and three of the four
cards use the identical document glyph — an icon repeated on every card conveys
nothing. Remove the icons entirely per the KPI amendment. If a card genuinely
needs disambiguating, use a 16px muted glyph with no background.

TASK 3 — Add sparklines to KPI cards
28px sparkline at the bottom of each card: 30 daily values, no axes, no
gridlines, no dots except a 3px dot on the final point. Line 1.5px in the
accent, fill below using HatchPattern at 12%.

Where a card has both a comparison line and a sparkline, the sparkline sits
beneath and the card grows to 148px — applied uniformly to every card in the
row, never per card.

"4" is a fact. "4, and climbing for a week" is information. Sparklines are the
cheapest way to add a time dimension to this page.

Add sparkline data to the fixtures for every KPI widget.

VERIFY: both distribution bars show all labels consistently, no card has a
tinted circle, and every KPI card is the same height.
```

✅ `fix(dashboard): consistent labels, remove icons, add sparklines`

---

### H2 — Budget burn and throughput

```
CONTEXT
Read docs/DASHBOARD-VISUAL-DEPTH.md V2 and V3. These are the two highest-value
additions — they add comparison and time, neither of which exists on the page
today.

TASK 1 — Build BurnVsElapsed, widget id budget-burn-vs-elapsed
Two stacked horizontal tracks, 12px tall, 8px apart, identical width:
  - Track 1: budget consumed as a percentage, accent fill
  - Track 2: financial year elapsed as a percentage, neutral at 40%
  - Percentage labels right-aligned on each track

Beneath, a caption stating the gap AND its meaning:
  under plan  → "23.9 points behind — spending is under plan"
  on plan     → "In line with the year to date"
  ahead       → "12.4 points ahead — spending is outpacing the year"

Tone: neutral when consumption trails elapsed, amber when it leads by more than
10 points, red beyond 20.

This is the most useful thing on the dashboard and it exists nowhere in the
system today. A consumption percentage alone is a fact; measured against
elapsed time it becomes a judgement, which is what a Finance Manager or HOD
actually needs.

API payload:
{ "consumedPercent": 34.2, "elapsedPercent": 58.1, "gapPoints": -23.9,
  "assessment": "UNDER_PLAN"|"ON_PLAN"|"AHEAD_OF_PLAN",
  "consumedAmount": 96000000, "totalBudget": 280000000,
  "periodStart": "2026-01-01", "periodEnd": "2026-12-31" }

TASK 2 — Build ThroughputTrend, widget id request-throughput
Twelve weeks, two series: requests created and requests completed.
  - Area chart via the F1 wrapper, 130px plot, HatchPattern fills
  - Where completed trails created, shade the divergence in amber at 10% — that
    region IS the backlog
  - Legend in the card header per T8
  - Caption: "Backlog grew by 4 requests over 12 weeks" or "Backlog cleared by
    2 requests over 12 weeks"

The dashboard currently has NO time series at all. This is the single biggest
gap — nothing on the page shows whether the department is keeping up.

API payload:
{ "weeks": [{ "weekStarting": "2026-06-08", "created": 5, "completed": 3 }],
  "backlogChange": 4, "trend": "GROWING"|"STABLE"|"CLEARING" }

TASK 3 — Add both to the registry
  budget-burn-vs-elapsed: BUDGET.VIEW, minimum scope SELF, span 4
  request-throughput: REQUISITION.VIEW, minimum scope SELF, span 8

Add fixtures for healthy and concerning variants of each.
```

✅ `feat(dashboard): add budget burn and throughput widgets`

---

### H3 — Timeline, bottleneck, proportional workforce

```
CONTEXT
Read docs/DASHBOARD-VISUAL-DEPTH.md V4, V5, V6.

TASK 1 — Build MilestoneTimeline, widget id milestone-timeline
Horizontal 60-day strip, 80px tall, full card width:
  - Month dividers with labels
  - A vertical accent line marking TODAY
  - One marker per milestone, positioned by date, coloured by type, sized by
    count (12px base, up to 20px)
  - Overlapping markers within 2 days cluster into one with a count badge
  - Hover shows a tooltip with type, detail and date; click navigates
  - The existing Upcoming milestones LIST remains beneath as both the
    accessible fallback and the detail view

A list hides clustering. A timeline shows that three things land in the same
week, which is the thing actually worth knowing.

Below 768px, render only the list.

TASK 2 — Build TimeInStage, widget id time-in-stage
Specced as B6 but never rendered. It is the only widget that answers "why is
this slow?"
  - Horizontal bars, average days per workflow stage, one hue by rank
  - The slowest stage takes the warning colour and an explicit "Slowest stage"
    label
  - A dashed target line where an SLA exists for that stage
  - Caption: "HR Review is taking 2.3x the department average"

TASK 3 — Render WorkforceByDepartment proportionally, widget id
workforce-by-department
Specced as B4. Build it as proportional horizontal bars, not a table — bar
length shows relative headcount at a glance. Onshore and offshore as two
opacities of one hue, stacked within each bar.
Secondary line per row: "3 onboarding · 4 ending within 90 days".
Maximum 8 departments, then "+N more".

RULES
- All three follow DASHBOARD-VISUAL-LANGUAGE.md: T3 heights, T4 hatch, T8
  header legends, T10 headers, T11 axes.
- All figures pre-aggregated from the server. No arithmetic in the UI.
- Every chart has a table fallback below 768px and an aria-label summary.
```

✅ `feat(dashboard): add timeline, bottleneck and workforce widgets`

---

### H4 — Layout rhythm

```
CONTEXT
Read docs/DASHBOARD-VISUAL-DEPTH.md Part 3.

Every row on the dashboard is currently the same shape and height, which is
half the reason it reads flat even with correct styling.

TASK 1 — Introduce a hero row
Add a band between the KPI cards and the existing charts, 280px tall:
  - Most roles: request-throughput at span 8 + budget-burn-vs-elapsed at span 4
  - Finance: budget-burn-vs-elapsed at span 8 + budget-vs-actual-trend at span 4
  - System Admin: background-job-health at span 8 + data-integrity-checks at
    span 4

One widget noticeably larger and more visual than the rest gives the eye a
place to land. Currently there is no focal point.

TASK 2 — Vary band heights
  Band A   KPI cards        148px (with sparklines)
  Band B   hero             280px
  Band B2  existing charts  215px
  Band C1  milestone timeline, full width, 120px
  Band C2  lists            320px

Three distinct heights across the page. Uniform blocks are why it reads as a
grid rather than a composition.

TASK 3 — Extend the layout contract
The layout endpoint returns a height hint per band so the client does not
hardcode it:
  { "band": "B", "height": "hero" | "standard" | "compact" | "strip",
    "widgets": [...] }

TASK 4 — Update every persona fixture to the new band structure, including the
System Admin layout from DASHBOARD-ADMIN-WIDGETS.md Part 4.

VERIFY: screenshot the dashboard for requestor, HOD, finance and systemAdmin.
Each should have a clear focal point and visible height variation, with no
empty gaps in any band.
```

✅ `feat(dashboard): add layout rhythm and hero row`

---

### H5 — Verify

```
CONTEXT
Verify against docs/DASHBOARD-VISUAL-DEPTH.md. Report: check | expected |
actual | pass.

BUGS
1. Both distribution bars show all labels consistently — either all inline or
   all in the legend, never mixed.
2. No KPI card has a tinted circular icon background.
3. Every KPI card in a row is exactly the same height.

NEW DIMENSIONS
4. Every KPI card has a 28px sparkline with 30 days of data.
5. budget-burn-vs-elapsed renders two tracks with a caption stating the gap AND
   its meaning, not just the number.
6. Its tone changes correctly: neutral under plan, amber above 10 points ahead,
   red above 20.
7. request-throughput renders 12 weeks with the backlog divergence shaded.
8. milestone-timeline shows a today marker and clusters milestones within 2
   days.
9. time-in-stage marks the slowest stage explicitly.

FORM VARIETY
10. Count the distinct visual forms on the page. There should be at least five:
    sparkline, stacked distribution bar, area chart, timeline strip, horizontal
    bars, list. Previously there were three.
11. Confirm no two adjacent widgets use the same visual form.

RHYTHM
12. At least three distinct band heights.
13. A clear focal point in the hero row for every persona.
14. No empty gaps in any band for any persona.

STANDARDS HELD
15. All charts still within 130px plot / 230px card, except the hero row.
16. All fills hatched, no solid area tints.
17. Legends in card headers, none below plots.
18. No monospace outside genuine codes.
19. Grep for arithmetic on data fields in widget components — zero.
20. Every chart has a table fallback below 768px and an aria-label summary.

Screenshot all four personas at 1440px, light and dark.
```

🛑 Final gate. Item 10 is the real test.

---

## Part 5 — Priority

If you build only three:

1. **V2 budget burn vs elapsed** — the only widget that turns a number into a
   judgement, and it does not exist anywhere in the system
2. **V3 throughput** — closes the total absence of a time dimension
3. **V1 sparklines** — cheapest possible depth, four cards at once

V4 and V5 add real value. V7 is decorative; build it last or not at all.
