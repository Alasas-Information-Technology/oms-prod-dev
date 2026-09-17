# Dashboard — Graphical Refresh

The client has rejected all three live personas (System Administrator,
Requestor, Finance) as generic and cluttered — independent of whether prior
specs were followed. They were followed. This document is what "followed
correctly, still not appealing" actually requires next.

A reference was finally seen this time (a dashboard product called Zentra) —
unlike the earlier Dribbble attempt, which both `web_fetch` and `image_search`
failed on. That thread is resolved: this document replaces it.

**Supplements, does not replace,** `DASHBOARD-PLAN.md`, `DASHBOARD-REFINEMENT.md`,
`DASHBOARD-VISUAL-LANGUAGE.md`, `DASHBOARD-KPI-CARDS-AMENDMENT.md`, and
`DASHBOARD-VISUAL-DEPTH.md`. The permission-gating architecture, the T1–T11
techniques, and the V1–V7 widgets all stand. This adds graphical weight on top
of them and fixes two things that regressed.

---

## Part 1 — Why it still reads as generic

Diagnosed directly against the three attached screenshots, with the reference
as the contrast case.

| # | Problem | Why it still reads flat |
| :--- | :--- | :--- |
| 1 | **Every card is the same visual weight.** Uniform white, 12px radius, hairline border, on all three dashboards | Despite H4's band-height variation, nothing on the page is ever *louder* than anything else. The reference has exactly one colourful, filled-background card per screen — everything else is quiet specifically so that one card has somewhere to be loud |
| 2 | **`requests-by-lifecycle-stage` renders as a donut with a centre total** | T6 exists specifically to replace this pattern with one stacked distribution bar. This is a regression against an existing rule, not a design question |
| 3 | **KPI cards are a number plus a 28px sparkline and nothing else** | The reference's KPI row *is* a chart — bars rise behind each column, the active column gets a live tooltip on hover. Ours is a number with a thin line underneath it |
| 4 | **Every chart on the page is the same shape** — line, area, or bar, repeated across Request throughput, Budget vs actual trend, and every KPI sparkline | VISUAL-DEPTH raised this exact complaint (V7, "form variety") and it's only partially resolved. The reference uses at least four distinct chart forms across one screen: bar-behind-number, hybrid bar+step-line, dot-matrix, and a plain stat |
| 5 | **Comparison exists only as a caption sentence** — "23.9 points behind" | The reference has an actual date-range comparison control in the page bar that every widget reads from. One sentence on one widget is not a comparison feature |
| 6 | **Hairline borders on every card, at every zoom level** | Squint at any of the three screenshots and it resolves into a grid of boxes — exactly the failure mode `VISUAL-LANGUAGE`'s own self-check warns about ("the page should resolve into a few horizontal bands, not a grid of boxes") |
| 7 | **12px radius, flat white surface** reads closer to an admin panel than a product | The reference's ~20px radius plus shadow-only separation (no visible border) reads materially more premium at identical information density |
| 8 | **Tinted circular icons are still present** on "Needs my action" and "Open exceptions" in the System Admin and Finance screenshots | H1 Task 2 was supposed to remove every tinted circular icon across the dashboard. It landed on most cards, not all — a completion gap, not a new rule |
| 9 | **Nothing on the page is colourful except the one accent hue plus semantic red/amber** | Correct by the letter of the categorical-colour rule from `REFINEMENT` — but the aggregate effect is a page that reads monochrome, not clean. The reference proves richness comes from *chart-form variety*, not from adding hues to categorical data |
| 10 | **The System Administrator screen stacks four dense list panels** in one viewport — Background job health, Data integrity, Tonight's scheduled actions, Privilege changes | This is the literal "a lot of clustered data" complaint. Four competing tables in one screen-height is density without hierarchy |

---

## Part 2 — The standard

Continues the T-series numbering from `VISUAL-LANGUAGE.md` as **U1–U9**.
Existing tokens and the one-hue categorical rule stay in force except where
U1 states an explicit exception.

### U1 — One hero/insight card per dashboard 🔴

**This is a stated, deliberate exception to the one-hue rule — not a licence
to recolour the page.** Every persona dashboard gets exactly one card that
breaks the flat-white convention: a filled background in the DIEZ-grounded
accent (indigo or gold per the palette work already specced), light text, one
large figure, one plain-language sentence stating what it means, and a thin
progress or comparison track at the base. This is the *only* non-white,
non-hairline-bordered surface allowed on the page — it exists purely to give
the eye a place to land, the same job the reference's "Authorization rate
increased" tile does on an otherwise white screen.

Candidate content per persona — reusing data that already exists, not new
widgets:

| Persona | Hero content |
| :--- | :--- |
| Requestor / Line Manager / HOD | Auto-close watch, reframed: *"AED 1.2M will be released back to your budget in 5 days unless 3 requests are approved."* |
| Finance | Budget burn vs elapsed, reframed: the existing V2 caption ("23.9 points behind — spending is under plan") moved into this treatment instead of a plain white card |
| System Administrator | If everything is healthy: *"Every scheduled job ran on time this week — nothing needs your attention."* If something is failing, that finding becomes the hero card in the danger tone, replacing whichever KPI is currently dullest |

One card. If a second widget starts wanting this treatment, that's the signal
to stop — rarity is what makes it work, the same argument already established
for the bronze/gold accent.

### U2 — The KPI row becomes a chart, not a number with a sparkline underneath

Extend the KpiCard so the value sits **on top of** a bar visualisation spanning
the card's full width behind it — one bar per recent period (7 or 30 days),
in the T4 hatch treatment, with the *current* period's bar solid instead of
hatched. Hovering reveals a T7 tooltip with that period's exact value and its
delta — the same interaction the reference's Payments card uses. This replaces
the current 28px line-only sparkline with something that has actual visual
weight, without inventing any data that isn't already being fetched.

### U3 — Dot-matrix as a fifth chart form

New primitive: `<DotMatrix>`. Small rounded dots, one column per period, dot
count per column proportional to that period's value, one hue at 100%
opacity. Reserved specifically for **counts of discrete things** — onboarding
cases per week, candidates interviewed per week, notifications sent per day —
never for continuous or monetary values, where the existing bar/area forms
are correct. This is the fifth distinct visual form `VISUAL-DEPTH`'s own
checklist asked for (item 10: "at least five... previously there were three")
and never got built.

### U4 — Radius and border, revised

- Card radius: `12px → 20px`.
- Hairline border removed in favour of a single soft shadow in light mode:
  `0 1px 2px rgba(0,0,0,.04), 0 8px 24px rgba(0,0,0,.06)`.
- **Dark mode keeps the existing elevated-surface-contrast approach** from
  `REFINEMENT` 2.2 — do not add a shadow there. Shadows are already
  established as invisible on near-black surfaces; that finding doesn't change
  because the radius did.

Highest ratio of "looks premium" to pixels changed of anything in this
document.

### U5 — A real comparison control, not a caption

One control in the page bar: two date ranges with "vs" between them, matching
the reference's pattern. Every widget currently computing its own hardcoded
"vs last month" instead reads both ranges from this shared control and
computes its delta against whatever the user actually selected. `DeltaChip`
and the T2 weight-contrast rendering don't change — only what they're being
compared against.

### U6 — Chart-embedded annotations on hover

Extend `ChartTooltip` (T7) so a chart with one obviously meaningful point can
pin a small floating label directly on that point without requiring a hover —
the reference pins "42%" on the Retention peak and "Peak: Wed" above the
Transactions dot-matrix with no interaction needed. One pinned annotation per
chart, maximum, positioned from server-computed data — never guessed
client-side.

### U7 — Fix the donut regression

`requests-by-lifecycle-stage` currently renders as a donut with a centre
total. Revert to `DistributionBar` per T6. This is a bug against an existing,
explicitly-justified rule — not a new decision to make.

### U8 — Finish the KPI icon removal

"Needs my action" and "Open exceptions" still show a tinted circular icon in
the current screenshots. Grep and remove; H1 Task 2 already specified this,
it's a completion gap on three of four cards, not four of four.

### U9 — Fewer, larger widgets over more, smaller ones

Where a persona's Band C/D currently stacks four dense list panels in one
viewport (System Administrator: Background job health, Data integrity,
Tonight's scheduled actions, Privilege changes), consolidate to at most three
widgets per screen-height and give each more breathing room — more row
padding, and drop the "max 5 rows then View all" ceiling to 4. This doesn't
remove information, it paginates more aggressively behind the existing "View
all" pattern. Four competing tables in one viewport is density without
hierarchy, which is the literal complaint.

---

## Part 3 — Prompts

Run after H1–H5. Sized for Antigravity, same format as prior docs.

---

### I1 — Hero card and surface pass

```
CONTEXT
Read docs/DASHBOARD-GRAPHICAL-REFRESH.md Part 2 U1 and U4, then
DASHBOARD-VISUAL-LANGUAGE.md and CLAUDE.md.

TASK 1 — Create src/components/oms/dashboard/HeroInsightCard.tsx
Filled background using the DIEZ-grounded accent token, light text. Props:
value (large figure, T2-style if monetary), sentence (plain language, what it
means), track (optional progress/comparison bar at the base), tone
('accent' | 'danger' for the System Admin failing case).

This is the ONLY component in the dashboard allowed a non-white,
non-hairline-bordered surface. Do not add a second use of this component
without checking with me first — the rarity is the point, same rule already
established for the bronze/gold accent elsewhere in the system.

TASK 2 — Wire it into each persona layout
  Requestor/Line Manager/HOD: reframe auto-close-watch as the hero, using its
    existing data — "AED X will be released back to your budget in N days
    unless Y requests are approved."
  Finance: reframe budget-burn-vs-elapsed as the hero, reusing its existing
    caption logic from V2.
  System Administrator: if all E1/E2 checks pass, a reassuring sentence in
    tone='accent'. If anything is failing, that finding becomes the hero in
    tone='danger', replacing whichever KPI card is currently least useful.

TASK 3 — Card radius and shadow, everywhere else
Update the shared card primitive: radius 12px to 20px, remove the hairline
border, add the light-mode shadow from U4 exactly as specified. Dark mode
keeps the existing elevated-surface-contrast treatment from
DASHBOARD-REFINEMENT.md 2.2 unchanged — do NOT add a shadow there.

VERIFY: screenshot all four personas. Confirm exactly one filled/coloured
card exists per dashboard, and every other card has the new radius and no
visible border.
```

✅ `feat(dashboard): add hero insight card and revise surface treatment`

---

### I2 — KPI row becomes a chart

```
CONTEXT
Read docs/DASHBOARD-GRAPHICAL-REFRESH.md U2, then
DASHBOARD-KPI-CARDS-AMENDMENT.md (the current KpiCard spec this replaces the
sparkline portion of).

TASK 1 — Extend KpiCard with a bar-behind-number visualisation
Replace the 28px line sparkline with bars spanning the card's full width,
positioned behind the value, one bar per recent period (7 or 30 days per
widget). Use the existing HatchPattern (T4) for all bars except the current
period, which renders solid in the accent colour.

TASK 2 — Hover tooltip
On hover of any bar, show a T7 ChartTooltip with that period's exact value
and delta versus the period before it. Reuse ChartTooltip — do not build a
second tooltip component.

TASK 3 — Keep everything else from the KPI amendment unchanged
Height still exactly 120px, no tinted icon circles, no subtitle, the whole
card still one link target. This task only changes what renders in the
bottom third of the card.

VERIFY: screenshot one KPI row. Confirm the current period's bar is visually
distinct (solid vs hatched) from the rest, and hovering any bar shows the
correct period's value.
```

✅ `feat(dashboard): kpi cards render a bar chart behind the value`

---

### I3 — Dot-matrix primitive

```
CONTEXT
Read docs/DASHBOARD-GRAPHICAL-REFRESH.md U3.

TASK 1 — Create src/components/oms/dashboard/charts/DotMatrix.tsx
One column per period. Dot count per column proportional to that period's
value (round to nearest dot, don't invent fractional dots). One hue, 100%
opacity, small rounded-square or circular dots with consistent gap. No axes,
no gridlines.

TASK 2 — Apply it only where the underlying data is a COUNT of discrete
things, never a continuous or monetary value:
  - onboarding-cases: dot-matrix of candidates onboarding per week
  - interview-schedule or candidates-awaiting-review: candidates interviewed
    per week
  - notification-delivery: notifications sent per day (System Admin)

Do not apply this to anything monetary or continuous — those keep their
existing bar/area chart forms per DASHBOARD-VISUAL-LANGUAGE.md.

VERIFY: build a demo page at /app/dev/dot-matrix showing the primitive with
3, 7, and 12 periods. Confirm every application of it in TASK 2 is a genuine
count, not a repurposed continuous value.
```

✅ `feat(dashboard): add dot-matrix chart primitive`

---

### I4 — Comparison period control

```
CONTEXT
Read docs/DASHBOARD-GRAPHICAL-REFRESH.md U5, then
docs/DASHBOARD-API-CONTRACT.md.

TASK 1 — Add a comparison-period control to the dashboard page bar
Two date ranges with "vs" between them. Persist the selection per session,
default to "this period vs last period" at whatever window each widget
already uses (30d, 90d, FY).

TASK 2 — Every widget currently computing a hardcoded "vs last month" delta
reads both ranges from this shared control instead. This changes what the
comparison IS, not how DeltaChip or the T2 rendering displays it — those stay
as built.

TASK 3 — Update DASHBOARD-API-CONTRACT.md
Widget data requests now accept the two selected ranges as query parameters.
Server still computes every delta — the client sends which periods to
compare, never the computed result of comparing them.

VERIFY: change the comparison control and confirm every widget's delta
updates to match, including the KPI row's bar-behind-number highlighting from
I2.
```

✅ `feat(dashboard): add real comparison period control`

---

### I5 — Annotations, donut fix, icon audit

```
CONTEXT
Read docs/DASHBOARD-GRAPHICAL-REFRESH.md U6, U7, U8.

TASK 1 — Pinned chart annotations (U6)
Extend ChartTooltip so a chart can pin one label directly on a
server-flagged meaningful point without requiring hover — e.g. the peak week
in a DotMatrix, or the point where request-throughput's backlog divergence is
largest. Maximum one pinned annotation per chart. The point to annotate comes
from the API response, never computed or guessed client-side.

TASK 2 — Fix the donut regression (U7)
requests-by-lifecycle-stage currently renders as a donut with a centre total.
Revert to DistributionBar per T6. Grep the codebase for any other chart using
a pie or donut form and fix those too — there should be zero.

TASK 3 — Finish KPI icon removal (U8)
Grep every KPI card for a tinted circular icon background. "Needs my action"
and "Open exceptions" still have one as of this screenshot. Remove per the
existing H1 Task 2 rule — 16px muted glyph with no background, or omit
entirely.

TASK 4 — Consolidate dense Band C/D screens (U9)
On the System Administrator dashboard specifically: reduce Background job
health, Data integrity, Tonight's scheduled actions, and Privilege changes to
at most three widgets visible without scrolling in a typical viewport. Drop
the "View all" row ceiling from 5 to 4 on all affected tables to give each
more padding.

VERIFY: confirm zero donuts/pies anywhere in the codebase. Confirm all four
KPI cards on every persona have no tinted circle. Confirm the System Admin
dashboard's Band C/D no longer requires scrolling to see a clear hierarchy
among its widgets.
```

✅ `fix(dashboard): pinned annotations, donut regression, icon audit, density`

---

### I6 — Verify

```
CONTEXT
Read docs/DASHBOARD-GRAPHICAL-REFRESH.md in full. Verify all three personas
plus System Administrator. Report a table: check | expected | actual | pass.

HERO CARD
1. Exactly one filled/coloured card per persona dashboard, never zero, never
   two.
2. Its content matches Part 2's table for that persona.
3. No other card on the page has a non-white or non-shadow-based surface.

SURFACE
4. Every card is 20px radius with no visible border in light mode.
5. Dark mode cards still use elevated-surface-contrast, not a shadow.

KPI ROW
6. Every KPI card shows a bar-behind-number visualisation, not a line
   sparkline.
7. The current period's bar is visually distinct from prior periods.
8. Hovering any bar shows the correct period's value and delta.
9. Zero tinted circular icon backgrounds anywhere on any persona.

FORM VARIETY
10. Count distinct chart forms across one persona's dashboard: hero card,
    bar-behind-number KPI, dot-matrix (where applicable), hatched
    area/line, DistributionBar. At least five, matching the original
    VISUAL-DEPTH ask.
11. DotMatrix is used only for genuine discrete counts — audit every usage.

COMPARISON
12. The page-bar comparison control exists and every widget's delta responds
    to changing it.

REGRESSIONS FIXED
13. Zero donuts or pies anywhere in dashboard code — grep to confirm.
14. requests-by-lifecycle-stage renders as DistributionBar.

DENSITY
15. System Administrator Band C/D shows a clear hierarchy among its widgets
    without requiring scroll on a standard viewport, per U9.

CONSISTENCY WITH EXISTING RULES
16. Categorical chart colour is still one hue at varying opacity everywhere
    except the hero card.
17. All T1–T11 and V1–V7 rules from prior docs still hold — spot-check three
    at random.
18. Grep for arithmetic on data fields in widget components — zero, still.

Screenshot all four personas, light and dark, at 1440px. Place them beside
the three originally-attached screenshots. The difference should be
immediately visible without reading the report.
```

🛑 Final gate. Item 18's screenshot comparison is the real test — same as
every prior doc's closing gate.

---

## Part 4 — Check yourself

1. **Cover the hero card.** Does the rest of the page still look complete
   without it, or has all the visual interest been offloaded onto one tile
   that's now doing all the work? If so, U2/U3/U4 aren't pulling their
   weight.
2. **Count the chart forms on one screen**, same test as `VISUAL-DEPTH`'s
   check — there should be at least five, and no two adjacent widgets should
   share a form.
3. **Put this dashboard next to Zentra.** Not to match it exactly — the data
   and domain are different — but if an unfamiliar viewer couldn't tell which
   one took more design attention, this document succeeded.
4. **Put this dashboard next to the version from before this document.** If
   you can't immediately point at what changed, U1 and U4 — the two highest
   visual-impact, lowest-effort items — probably didn't ship.
