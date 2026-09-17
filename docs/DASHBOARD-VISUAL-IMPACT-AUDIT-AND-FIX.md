# Dashboard — Visual Impact Audit & Forced Fix

The screenshot after running `DASHBOARD-VISUAL-COVERAGE-GEMINI.md` shows two
real changes (KPI bar visualization, the donut fixed to a distribution bar)
and none of the other changes that were specified. This document exists
because "re-run the same prompt" is not the right move when an agent silently
skips most of a task list — first find out what actually happened, then
re-issue only what's missing, with more precision than last time, not just
more insistence.

**Note on 3D charts**: no prior document asked for these, and
`DASHBOARD-VISUAL-COVERAGE-GEMINI.md` Part 0.3 explicitly forbids 3D chart
rendering. K3 below adds a legitimate depth technique — a subtle top-to-bottom
gradient shade on bars and cards — which is likely what actually looked
appealing about the reference. This is not 3D geometry and should not be
implemented as such.

---

## K1 — Forced honesty audit (run this before anything else)

```
CONTEXT
You previously received docs/DASHBOARD-VISUAL-COVERAGE-GEMINI.md and were
asked to execute J1 through J8 in sequence, stopping to report after each
one. A screenshot taken after that work shows only two changes present:
the KPI cards have a bar visualization, and requests-by-lifecycle-stage
renders as a distribution bar instead of a donut. Nothing else specified in
that document appears to have been applied.

TASK — Report, do not fix anything yet
For each of J1 through J8, answer honestly:
  1. Did you execute this task at all? Yes / No / Partially.
  2. If partially or no, what specifically stopped you — a missing file, an
     ambiguous instruction, a decision you made to skip it, a token/context
     limit, or something else?
  3. If you believe you DID execute a task but it isn't visible in the
     screenshot, state exactly what file you changed and what the change
     was, so it can be checked directly against the code.

Specifically account for these, since they are the most visually important
items in the document and are the ones missing from the screenshot:
  - I1 / U1: the hero/insight card. Does HeroInsightCard.tsx exist? Is it
    imported and rendered on any persona's dashboard page?
  - U4: card radius changed to 20px and hairline border replaced with a
    shadow. Check the actual card component's current border-radius and
    border values right now and report them literally.
  - U5: the comparison-period control in the page bar. Does it exist as a
    component? Is it rendered?
  - J2: were DotMatrix and the severity-dot primitives actually built as
    separate reusable components, or was something built inline that only
    superficially resembles them?

Do not attempt any fixes in this task. Report only, and be specific about
file paths and current values, not general statements like "it should be
there."
```

---

## K2 — Re-issue the two highest-impact items, maximally explicit

Do not run this until K1's report is back and reviewed. If K1 shows these
already exist correctly in code and simply aren't rendering, the fix is
different (a routing/import problem) — say so instead of rewriting working
code.

```
CONTEXT
Read this task's numbers literally. Do not approximate, round, or
substitute a "close enough" value — every number below is exact and was
chosen for a reason.

TASK 1 — Card radius and shadow, applied to the ACTUAL shared component
Find the single shared card component every dashboard widget uses (it is
one file — if you find more than one card component, that's a separate
problem to report, not something to fix silently in this task). In that one
file:
  - border-radius: 20px. Not 16px, not 18px — 20px.
  - border: none. Remove it entirely, don't set it to a lighter colour.
  - box-shadow (light mode only): 0 1px 2px rgba(0,0,0,0.04), 0 8px 24px
    rgba(0,0,0,0.06) — both shadow layers, exactly these values.
  - Dark mode: no box-shadow at all. Use whatever elevated-surface-contrast
    background token already exists for dark mode cards — do not add a dark
    mode shadow.
  - Verify this change actually appears on screen by taking a screenshot
    immediately after making it, before doing anything else in this
    session. If the corners in the screenshot are not visibly rounder than
    the current ~12px, the change did not take effect — check whether a
    different component is actually rendering the visible card (a wrapper,
    a Tailwind utility class overriding it, a different card variant).

TASK 2 — Hero insight card, built AND rendered AND visible in a screenshot
Do not consider this task complete until you have taken a screenshot showing
a filled, coloured card on an actual dashboard page — not just a component
file that exists but isn't used anywhere.
  - Create the component if it doesn't exist: filled background using the
    existing DIEZ-grounded accent token (the indigo one used for primary
    actions elsewhere in the app — find it in the token file, do not invent
    a new colour), light/white text, one large number or short phrase, one
    plain-language sentence, an optional thin progress track at the bottom.
  - Render it on the Requestor dashboard specifically first, since that's
    the persona in the screenshot under discussion: reframe "Auto-close
    watch" — the card currently showing "3 / 3 requests · AED 1.20M at
    risk" — into this treatment: "AED 1.20M will be released back to your
    budget in [X] days unless 3 requests are approved," using the real
    number of days from that widget's existing data, not a placeholder.
  - Take a screenshot of the Requestor dashboard after this change. Confirm
    by looking at the screenshot itself — not by describing what you
    intended — that there is now one visibly colourful/filled card among
    the otherwise white cards.

TASK 3 — Comparison-period control
  - Add a small control to the page bar, to the left of "View as": two date
    labels with "vs" between them, e.g. "Last 90 days vs Previous 90 days,"
    clickable to change.
  - It does not need to be fully functional yet if that requires backend
    changes beyond this session's scope — but it must be VISIBLE on the
    page. A control that exists in code but isn't rendered doesn't count.
  - Screenshot the page bar after this change and confirm the control is
    visible in the screenshot.

VERIFY — this is not optional
After all three tasks, take one full-page screenshot of the Requestor
dashboard. Before reporting this task complete, look at that screenshot and
confirm, item by item:
  [ ] Card corners are visibly more rounded than a sharp/12px corner.
  [ ] No card has a visible border line — separation comes from whitespace
      and shadow only.
  [ ] Exactly one card on the page has a filled, non-white background.
  [ ] The comparison control is visible in the page bar.
If any box above is unchecked after looking at the actual screenshot, the
task is not done — go back and find out why, don't report success anyway.
```

---

## K3 — Legitimate depth technique (the likely actual "3D" request)

```
CONTEXT
This task adds a subtle gradient-shading technique to bars and the hero
card, which is likely what read as "3D" or "flat" in the comparison — real
depth cues without literal 3D chart geometry, which stays forbidden.

TASK 1 — Bar gradient shading
On every bar-based chart (bar-behind-number KPI bars, horizontal bars in
Band B/D/E widgets, DistributionBar segments), change the fill from a flat
single colour to a subtle vertical linear-gradient: the accent colour at
100% opacity at the bar's top, softening to about 85% opacity at the bar's
bottom. This is a 2D CSS/SVG linear gradient, not a 3D rendering effect —
do not add perspective, extrusion, bevels, or any transform that makes the
bar appear to have physical depth or a 3D side face.

TASK 2 — Hero card gradient
The hero/insight card's filled background (from K2 Task 2) uses a subtle
diagonal gradient between two close shades of the same accent colour (for
example the accent at its normal value in one corner, about 15% darker in
the opposite corner) rather than one completely flat fill. Still one hue,
still no literal 3D.

TASK 3 — What NOT to do, explicitly
  - Do not add any 3D chart type (3D bar, 3D pie, 3D donut) to any charting
    library configuration.
  - Do not add perspective transforms, rotateX/rotateY, or extrusion to any
    chart element.
  - Do not add drop shadows to individual bars or chart elements — the
    gradient IS the depth cue, a shadow on top of it would be double
    treatment and look cluttered.

VERIFY: screenshot the KPI row and one Band B bar chart. Confirm the bars
have a visible top-to-bottom gradient, and confirm no chart anywhere uses
3D rendering — grep the charting library's config objects for any 3D-related
option (commonly named something like `enable3D`, `perspective`, or similar
depending on the library in use) and confirm none are set to true.
```

---

## K4 — Precision layout and padding pass

```
CONTEXT
This task addresses "precision layouts and paddings" specifically — the
current page has inconsistent spacing that reads as imprecise even where
the right elements are present.

TASK 1 — Audit current spacing
Report the actual computed padding/margin/gap values currently used across:
  the page container's outer padding, the gap between KPI cards, the gap
  between Band B/C/D cards, the padding inside a card (top/right/bottom/
  left, and confirm whether they're symmetric), and the gap between a
  card's header and its content.

TASK 2 — Standardize to an explicit spacing scale
Use exactly these values everywhere, replacing whatever inconsistent values
the audit found:
  - Page outer padding: 24px.
  - Gap between cards in any row (KPI row, Band B/C/D rows): 16px.
  - Card internal padding: 20px on all four sides, no exceptions for
    "headerless" cards or list-style cards — the 20px applies uniformly.
  - Gap between a card's header row and its content below: 16px.
  - Gap between rows/bands (KPI row to Band B, Band B to Band C, etc.): 24px.

TASK 3 — Alignment check
Confirm every card in the same row has the same height where the content
allows it (KPI row already required this per DASHBOARD-KPI-CARDS-AMENDMENT.md
— confirm it's still true), and that text baselines for card titles align
horizontally across a row.

VERIFY: screenshot the full page. Use a ruler/measurement tool if your
environment provides one to confirm actual rendered gaps match the 16px/20px/
24px values above within a pixel or two — do not just visually estimate.
```

---

## K5 — Final side-by-side verification

```
CONTEXT
Take a full-page screenshot of the Requestor dashboard now. Place it
side-by-side, in your report, with the screenshot from before K1 (the one
showing only the KPI bars and the fixed distribution bar).

Answer directly, do not soften this:
1. Is a filled, coloured hero card visible in the new screenshot? Yes/No —
   if the answer to this alone is No, none of the rest of the report
   matters, go back to K2 Task 2.
2. Are the card corners visibly rounder in the new screenshot? Yes/No.
3. Are the card borders visibly gone, replaced by shadow-based separation?
   Yes/No.
4. Is the comparison control visible in the page bar? Yes/No.
5. Do the bars in the KPI row and Band B charts show a visible gradient
   rather than a flat fill? Yes/No.
6. Is spacing visibly more consistent — do cards in the same row line up,
   do gaps look uniform? Yes/No.

If any answer is No, that specific task did not actually complete
regardless of what was reported earlier in this document — return to the
matching K-task and find out why before reporting this work as finished.
```
