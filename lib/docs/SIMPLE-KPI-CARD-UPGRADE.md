# SimpleKpiCard — Upgrade In Place

Keeps the existing component and its API. Fixes three real bugs, aligns it to
`DASHBOARD-VISUAL-LANGUAGE.md` T1/T2 and `DASHBOARD-VISUAL-DEPTH.md` V1, and
adds the capability those specs need.

**Supersedes the "build KpiCard" instruction** in the KPI cards amendment and in
prompt F2 / D3.

---

## Part 1 — Review

### Bugs

| # | Issue | Impact |
| :--- | :--- | :--- |
| **B1** | `useEffect` + `setTimeout(1500)` fakes a load on every mount. `isLoading` only wins when explicitly passed | Users wait 1.5s on cards whose data is already in cache. On a dashboard of 4–13 cards this is the slowest thing on the page, and it is entirely synthetic |
| **B2** | Shimmer uses `repeat: Number.POSITIVE_INFINITY` with no `prefers-reduced-motion` guard | Violates the motion rules; a genuine accessibility problem for vestibular sensitivity |
| **B3** | `select-none` on the card | Finance staff copy figures to paste into Oracle. This silently prevents it |
| **B4** | Skeleton overlay sits at `absolute inset-0 z-10` over live content | Screen readers may announce both the skeleton and the content. Needs `aria-busy` and the content hidden while loading |

### Missing capability

| # | Gap | Needed by |
| :--- | :--- | :--- |
| M1 | No delta/comparison support — `description` is a plain string | T1 comparison line, `DeltaChip` with `increaseIsGood` |
| M2 | No sparkline slot | V1 |
| M3 | `formatCompactNumber` returns one string, so no integer/decimal weight split | T2 |
| M4 | No zero-state semantics | E2 zero states |

### Style drift

| Property | Current | Spec |
| :--- | :--- | :--- |
| Height | `min-h-[120px]` — can grow | **Fixed 120px**, or 148px with a sparkline |
| Radius | `rounded-md` (6px) | **12px** |
| Border | `border-none` | **0.5px** |
| Shadow | `shadow-sm` at rest, `shadow-md` on hover | **None at rest**; hover darkens the border |
| Title | `text-sm` (14px) | **12px** `--text-muted` |
| Value | `text-2xl` (24px) | **30px** |
| Icon | 36px circle with `bg-primary/10` | See Part 2 |

### The icon question

The spec removes the tinted circle. If you're keeping this component
system-wide, that's a judgement call — but the current dashboard usage has
**three of four cards showing the identical document glyph**, which conveys
nothing.

Pick one and apply it consistently:

- **(a)** Remove icons on dashboard KPI cards. Cleanest, matches the spec.
- **(b)** Keep them, drop the tinted circle to a 16px muted glyph, and give
  every card a genuinely distinct icon.

Not: the same icon on every card in a tinted circle.

---

## Part 2 — Prompts

### K1 — Fix the bugs and align styling

```
CONTEXT
Read docs/SIMPLE-KPI-CARD-UPGRADE.md, then DASHBOARD-VISUAL-LANGUAGE.md T1 and
T2, DASHBOARD-KPI-CARDS-AMENDMENT.md, and CLAUDE.md.

We are keeping SimpleKpiCard rather than building a new component. Upgrade it in
place. It is used elsewhere in the app, so EVERY EXISTING PROP MUST KEEP
WORKING — icon, value, title, description, color, bg, className, isCurrency,
prefix, suffix, href, isLoading. Additions are optional props with safe
defaults.

TASK 1 — Fix B1, the fake loading timer
Remove the useEffect and setTimeout(1500) entirely, along with internalLoading.
Loading is driven ONLY by the isLoading prop, defaulting to false.

Right now every card fakes a 1.5 second load on mount regardless of whether its
data is already available. On a dashboard with 4 to 13 cards this is the slowest
thing on the page and it is entirely synthetic. Audit every existing call site
and pass real loading state where it is available.

TASK 2 — Fix B2, the looping shimmer
Replace the infinite motion animation with a CSS shimmer that respects
prefers-reduced-motion. Under reduced motion, render a static muted block with
no animation at all. Nothing on this dashboard loops.

TASK 3 — Fix B3
Remove select-none from the card. Finance staff copy figures to paste into
Oracle; silently blocking that is a real usability failure.

TASK 4 — Fix B4
While loading, set aria-busy="true" on the card and hide the real content from
assistive technology rather than layering a skeleton over it. Do not render both
to the accessibility tree at once.

TASK 5 — Align styling
  Height    exactly 120px (148px when a sparkline is present) — NOT min-height.
            Uneven card heights in a row are the most visible sign of an
            unrefined dashboard.
  Radius    12px
  Border    0.5px solid, using color-mix(in oklch, var(--foreground) 8%,
            transparent)
  Shadow    none at rest. Hover raises the border to 16% opacity. No shadow,
            no lift — these are links, not draggable objects.
  Title     12px, --text-muted, top
  Value     30px, weight 600
  Layout    label top, value middle, comparison bottom, justified

TASK 6 — Icons
Add an optional showIcon prop defaulting to true so existing call sites are
unaffected. When false, the icon and its container are omitted entirely.
When true, drop the tinted circle: a 16px muted glyph, top-right, no
background.

Then audit the dashboard call sites. Three of the four current cards pass the
same document icon, which conveys nothing. Either pass showIcon={false} on all
dashboard KPI cards, or give each a genuinely distinct icon. Tell me which you
did.

VERIFY: no card fakes a load, all cards in a row are exactly the same height,
the value is selectable, and reduced motion produces no animation.
```

✅ `fix(ui): SimpleKpiCard loading, motion, selection and styling`

---

### K2 — Add the missing capability

```
CONTEXT
Read docs/SIMPLE-KPI-CARD-UPGRADE.md Part 1, DASHBOARD-VISUAL-LANGUAGE.md T2,
and DASHBOARD-VISUAL-DEPTH.md V1.

Extend SimpleKpiCard with four capabilities. All optional, all backwards
compatible.

TASK 1 — M3, numeral weight contrast
Add a valueParts renderer implementing T2:
  currency code   12px, --text-muted, 4px gap, baseline aligned
  integer part    30px weight 600, --text-primary
  decimal or unit 30px weight 400, --text-muted

  "AED 1.20M"  → "AED" muted, "1" bold, ".20M" muted
  "1,248,320.00" → "1,248,320" bold, ".00" muted
  "4" → all bold, no muted part

Extend formatCompactNumber (or add a sibling) to return { prefix, integer,
fraction } rather than a single string. Keep the existing single-string export
working for other call sites.

The eye should read magnitude before precision. This is the most noticeable
single refinement in the reference design.

TASK 2 — M1, comparison and delta
Add an optional delta prop:
  delta?: { value: number; direction: 'up'|'down'; increaseIsGood: boolean;
            label?: string }

Renders beneath the value at 11px --text-muted: the label (default "vs last
month"), then an arrow and percentage coloured by BOTH direction and
increaseIsGood.

More consumed budget is an up arrow in RED. More approved requests is an up
arrow in GREEN. Direction is not sentiment — do not default everything upward
to green.

When delta is absent, the existing description string renders in that slot
exactly as it does today.

TASK 3 — M2, sparkline
Add an optional sparkline prop: number[] of up to 30 daily values.
  28px tall, full card width minus padding
  No axes, no gridlines, no tooltip
  Line 1.5px in the accent, 3px dot on the final point only
  Fill beneath using HatchPattern at 12%
  Card height becomes 148px when present

  When a sparkline is present, apply it to EVERY card in that row. A row with
  mixed heights is worse than a row with no sparklines.

TASK 4 — M4, zero states
Add an optional zeroMeaning prop: 'GOOD' | 'NEEDS_ACTION' | 'NO_DATA'.

When the value is 0:
  GOOD          the comparison slot shows a muted check plus the zeroLabel
                text, e.g. "No overdue items"
  NEEDS_ACTION  the comparison slot renders in amber with the zeroLabel
  NO_DATA       the comparison slot reads "Nothing recorded yet"

  The VALUE STILL RENDERS AS 0 AT FULL 30px SIZE in every case. Do not shrink
  it, grey it, or replace it with a dash. A healthy dashboard should read as
  healthy, not as empty — three cards showing a bare "0" is why the security
  dashboard currently looks broken on a good day.

TASK 5 — Update dashboard call sites
Pass delta, sparkline, zeroMeaning and zeroLabel for every dashboard KPI card.
Specifically:
  needs-my-action     zeroMeaning GOOD, "Nothing waiting on you"
  auto-close-watch    zeroMeaning GOOD, "No requests closing soon"
  expiring-documents  zeroMeaning GOOD, "No documents expiring"
  failing-integrations zeroMeaning GOOD, "All integrations healthy"
  jobs-failed-24h     zeroMeaning GOOD, "All jobs completed"
  elevated-accounts   zeroMeaning NEEDS_ACTION, "No administrators — lockout
                      risk"

Add sparkline fixture data for every dashboard KPI widget.

VERIFY: render every dashboard card with a zero value and confirm the row reads
as reassuring rather than empty. Then confirm a card with increaseIsGood false
renders an upward arrow in red.
```

✅ `feat(ui): SimpleKpiCard delta, sparkline and zero states`

---

### K3 — Verify

```
Verify SimpleKpiCard and its call sites. Report: check | expected | actual |
pass.

BUGS
1. No setTimeout or internal loading state remains — grep for it.
2. Loading is driven only by the isLoading prop.
3. No animation loops; prefers-reduced-motion produces a static block.
4. Card text is selectable.
5. aria-busy is set while loading and the real content is hidden from assistive
   technology.

STYLING
6. Every card in a row is EXACTLY the same height — 120px, or 148px with
   sparklines. Measure, do not eyeball.
7. Radius 12px, border 0.5px, no shadow at rest.
8. Title 12px muted, value 30px weight 600.
9. No tinted circular icon backgrounds on dashboard cards.
10. No two dashboard cards use the same icon, or icons are omitted entirely.

CAPABILITY
11. Currency values show the T2 weight contrast — muted code, bold integer,
    muted fraction.
12. A delta with increaseIsGood false renders an up arrow in RED.
13. Sparklines render on every card in a row, or none.
14. Every zero value shows its specific sentence and the value stays at 30px.
15. No card shows a bare "0" with no context.

COMPATIBILITY
16. Every pre-existing call site still compiles and renders correctly. List
    every file using SimpleKpiCard and confirm each one.
17. formatCompactNumber's original single-string export still works for
    non-dashboard callers.
```

🛑 Item 16 matters — this component is used beyond the dashboard.
