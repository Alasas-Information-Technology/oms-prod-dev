# Amendment — Separate KPI Cards

**Replaces T1 and prompt F2 in `DASHBOARD-VISUAL-LANGUAGE.md`.**

Everything else in that document is unchanged — T2 numeral weight contrast, T3
chart heights, T4 hatch fills, T5 segmented bars, T6 distribution bar, T7
tooltip, T8 header legend, T9 table rows, T10 card headers, T11 axes all stand,
as do prompts F1 and F3–F6.

---

## T1 (revised) — Separate KPI cards

One card per metric. What made the previous version look dated was not the
separation — it was the tinted circular icons, the subtitle captions, the
uneven heights, and a small value floating in a large box.

```
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│ Reserved         │  │ Locked           │  │ Consumed         │
│                  │  │                  │  │                  │
│ AED 5,400,000.00 │  │ AED 7,100,000.00 │  │ AED 2,100,000.00 │
│                  │  │                  │  │                  │
│ vs last month ↗3%│  │ vs last month ↗8%│  │ vs last month ↗14%│
└──────────────────┘  └──────────────────┘  └──────────────────┘
        16px gap
```

| Property | Value |
| :--- | :--- |
| Height | **120px fixed** — identical across the row, no exceptions |
| Grid gap | **16px** — tighter than the 24px page gutter, so the cards read as one set |
| Surface | `--surface-2`, 0.5px border, 12px radius, **no shadow at rest** |
| Padding | 20px |
| Label | 12px `--text-muted`, top |
| Value | 30px, **T2 weight contrast**, 8px below the label |
| Comparison | 11px `--text-muted` + arrow + percentage in a semantic colour, 8px below the value |
| Icon | 16px `--text-muted`, top-right. **No tinted circle.** Optional — omit unless it disambiguates |
| Hover | Border to 16% opacity. **No lift, no shadow** — these are links, not draggable objects |
| Link | The whole card |

### Rules

- **Uniform height is the one that matters most.** A row of 120px cards beside
  a 150px card is the most visible sign of an unrefined dashboard.
- **No subtitle line.** "Currently active" under "Active Sessions / 1" adds
  nothing and costs 20px.
- **No tinted circular icon backgrounds.** If an icon is used at all, it is a
  16px muted glyph.
- A **sparkline** may replace the comparison line where a trend matters more
  than a delta: 28px tall, no axes, no gridlines, no tooltip.
- Zero states from E2 render in the comparison slot — *"No overdue items"* with
  a muted check. **The value still shows `0` at full size.** Do not shrink it or
  grey it out.

### Responsive

| Width | Columns |
| :--- | :--- |
| ≥1280px | 4 |
| 1024–1279 | 4, value drops to 26px |
| 768–1023 | 2 |
| <768 | 2, height 100px, value 24px |

Two columns rather than one on mobile — a single column of KPI cards is a lot
of scrolling before any content.

---

## F2 (revised) — Rebuild the KPI cards

```
CONTEXT
Read docs/DASHBOARD-KPI-CARDS-AMENDMENT.md and
docs/DASHBOARD-VISUAL-LANGUAGE.md, then CLAUDE.md.

KPI metrics stay as separate cards. This task refines them rather than merging
them.

TASK 1 — Rebuild src/components/oms/dashboard/KpiCard.tsx to the revised T1
  - Height EXACTLY 120px. Every card in a row must match — uneven heights are
    the most visible sign of an unrefined dashboard.
  - Surface --surface-2, 0.5px border, 12px radius, NO shadow at rest.
  - Padding 20px.
  - Label 12px --text-muted at the top.
  - Value at 30px using <Amount variant="display"/> from F1 — muted currency
    code, bold integer part, muted decimals. 8px below the label.
  - Comparison line 11px muted, 8px below the value: "vs last month" plus a
    DeltaChip. Remember DeltaChip takes increaseIsGood — more consumption is
    bad and renders red even though the arrow points up.
  - Icon 16px --text-muted, top-right. REMOVE every tinted circular background.
    Prefer omitting the icon entirely unless it disambiguates two similar
    cards.
  - DELETE every subtitle line.
  - Hover darkens the border to 16% opacity. No lift, no shadow — these are
    links, not draggable objects.
  - The whole card is one link target.

TASK 2 — Optional sparkline variant
Where a trend matters more than a single delta, the comparison line is replaced
by a 28px sparkline: no axes, no gridlines, no tooltip, no dots. Props decide
which variant renders.

TASK 3 — Grid
KPI cards use a 16px gap, tighter than the 24px page gutter, so the row reads
as one set rather than four unrelated cards.
Responsive per the amendment table: 4 columns at 1280+, 4 at 1024-1279 with the
value at 26px, 2 columns at 768-1023, 2 columns at 100px height with a 24px
value below 768.

TASK 4 — Zero states
Keep the E2 zero-state meanings, rendered in the comparison slot: "No overdue
items" with a muted check instead of a delta. The value still shows 0 at FULL
SIZE — do not shrink or grey it. A healthy dashboard should read as healthy,
not as empty.

VERIFY: screenshot the KPI row and confirm every card is exactly the same
height, no card has a tinted circular icon, and no card has a subtitle.
```

---

## Everything else unchanged

Run F1, then this revised F2, then F3, F4, F5, F6 as written in
`DASHBOARD-VISUAL-LANGUAGE.md`.
