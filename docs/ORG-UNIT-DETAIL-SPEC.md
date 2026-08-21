# Org Unit Detail — Layout Redesign

Overview tab of the organization unit detail view.

**Palette unchanged.** Every value maps to an existing token.

---

## Part 1 — What's wrong

### Bugs

| | Issue |
| :--- | :--- |
| B1 | **"Business Unit 1" renders twice** — as the H1 and again right-aligned under Edit. The right-aligned slot should show the *type*, not the name. It's bound to the wrong field. |
| B2 | **"Assigned Head"** is a placeholder, not a person. Either the data isn't resolving or the label is being rendered as the value. |
| B3 | **"organisation"** in "DIEZ (Top of organisation)" — British spelling, inconsistent with "Organization" elsewhere. |

### Structure

| | Issue | Fix |
| :--- | :--- | :--- |
| S1 | **Card inside a card.** "Key Information" is bordered; "Who's in charge" is bordered inside it. | Remove all cards on this tab. Flat sections, hairline dividers. |
| S2 | Two heading systems — "Key Information" is 20px sentence-case accent; "BUDGET HELD BY" is 11px uppercase accent. | One system: 11px uppercase tracked, `--text-muted`. |
| S3 | Section headings use the accent colour. | Accent is for interactive elements only. Headings are muted. Using it for labels dilutes it everywhere else. |
| S4 | "Key Information" + "Operational details and leadership appointments" | Both deleted. The subtitle explains nothing; the heading states the obvious. |
| S5 | Vertical gaps range ~30–55px with no pattern. | Fixed rhythm: 32px between sections, 16px within. |
| S6 | Aside cards have ~100px padding around one line of text. | Flat sections, same treatment as the main column. |
| S7 | Sign-off chain wraps badly — "Business Unit 1" and "No one in charge" both break across lines. | Vertical stepper with a connector rule; aside widened to 300px. |
| S8 | ~200px dead space at the bottom. | Content flows naturally; no fixed-height container. |

### Detail

| | Issue | Fix |
| :--- | :--- | :--- |
| D1 | Title ~40px bold | **24px semibold** |
| D2 | Icon ~60px circle; cards use rounded squares | **36px, 10px radius** — match the cards |
| D3 | Tabs in a 55px pill container with icons | **Underline tabs, 40px, no icons** |
| D4 | "History (0)" shows a zero | Hide counts when zero |
| D5 | "No budget department assigned." in italic | Italic reads as an error. Normal weight, muted, plus an action |
| D6 | Code is bold mono, cost centre is regular mono | Same class of data, same treatment: **13px mono, 400** |
| D7 | "Part of" sits ~50px below the title, indented past the icon | Directly under the title, aligned to the title's left edge |
| D8 | Edit and ⋯ are ~48px tall | **32px** |
| D9 | "DIEZ (Top of organisation)" | "DIEZ" as a link, with a muted "Top level" tag |
| D10 | Panel padding ~60px | **24px** |

---

## Part 2 — Target layout

```
┌──────────────────────────────────────────────────────────────┐
│  PERF_BU_01 · Business Unit                       [⋯] [Edit] │  identity + actions
│                                                              │
│  ⬛  Business Unit 1                                          │  36px icon · 24px title
│      Part of  DIEZ ›                                         │  13px link
│                                                              │
│  ────────────────────────────────────────────────────────    │
│  Overview   Departments 15   People 8   History              │  underline tabs, 40px
│  ══════════                                                  │
│                                                              │
│  ┌────────────────────────────────┐  ┌────────────────────┐  │
│  │ WHO'S IN CHARGE                │  │ BUDGET HELD BY     │  │
│  │ ⬤ Ahmed Al Mansouri            │  │ Not assigned       │  │
│  │   Head · since 31 Dec 2025     │  │ Assign department  │  │
│  │ ──────────────────────────     │  │ ────────────────── │  │
│  │ DETAILS                        │  │ SIGN-OFF CHAIN     │  │
│  │ Code          PERF_BU_01       │  │ ① Business Unit 1  │  │
│  │ Cost centre   CC-BU-1          │  │ │  No one in charge│  │
│  │ Part of       DIEZ  Top level  │  │ ② DIEZ             │  │
│  │ Status        ● Active         │  │    No one in charge│  │
│  │ What's inside 15 departments   │  └────────────────────┘  │
│  └────────────────────────────────┘        300px fixed       │
│              flexible                                        │
└──────────────────────────────────────────────────────────────┘
```

The boxes above are drawn for clarity — **render no borders**. Sections are
separated by 1px hairlines, not containers.

Grid: `1fr 300px`, 32px gap. Below 1100px the aside stacks underneath.

---

## Part 3 — Component specs

### 3.1 Identity row

```
PERF_BU_01 · Business Unit                              [⋯] [Edit]
```

- Code chip: 11px mono, `--text-secondary`, `--fill-ghost` background, 4px
  radius, 3px/7px padding.
- Separator `·` then type as plain 13px `--text-secondary`. **This is the only
  place the type appears** — fixes B1.
- `⋯` and Edit: 32px tall, 8px radius. Edit is ghost, not filled — the primary
  action on a detail view is contextual, not "Edit".

### 3.2 Title block

- Icon: 36px, 10px radius, tinted background matching the card treatment.
- Title: 24px/600, 12px after the icon.
- Arabic name (when present): 13px `--text-secondary`, 4px below, `dir="rtl"
  lang="ar"` on that node only.
- "Part of": 13px, 6px below the title, **aligned to the title's left edge**,
  not indented past the icon. Label in `--text-muted`, value as a link in
  `--text-primary` with a `›`.

### 3.3 Tabs

Underline, not pills.

- Row height 40px, 1px bottom hairline across the full width.
- Item padding 0 16px, first item flush left.
- Label 14px. Inactive `--text-secondary`, active `--text-primary` 500 with a
  2px accent underline sitting on the hairline.
- Counts: 13px `--text-muted`, 6px after the label, **no parentheses**, hidden
  when zero.
- No icons. The labels are unambiguous and the icons are noise.
- 24px below the tab row before content.

### 3.4 Section label

One treatment everywhere on this page:

11px · 600 · 0.06em tracking · uppercase · `--text-muted` · 12px below

Never the accent colour.

### 3.5 Who's in charge

```
⬤  Ahmed Al Mansouri
    Head · since 31 Dec 2025
```

- Avatar 32px. Initials on a tinted background when there's no photo.
- Name 15px/500 `--text-primary`.
- Meta 13px `--text-secondary` — role and start date on one line, separated by
  `·`. **Not** a right-aligned "Started 2025-12-31" floating opposite.
- Dates render as "31 Dec 2025", never ISO.
- Empty: "No one in charge" in normal weight `--text-secondary`, plus an
  "Assign" text button gated on `ORG.MANAGER.ASSIGN`.

**No box around this.** It's a section like any other.

### 3.6 Details

A two-column definition grid, not free-floating pairs.

- `grid-template-columns: 140px 1fr`, 12px row gap.
- Label 13px `--text-muted`, value 13px `--text-primary`.
- Codes and cost centres: 13px mono, weight 400 — same treatment for both
  (fixes D6).
- "Part of" value is a link, followed by a muted "Top level" tag when the
  parent is the root.
- Status renders as a badge, not plain text with a dot.
- Rows are ordered by how often they're read: Code, Cost centre, Part of,
  Status, What's inside.

Single column below 640px.

### 3.7 Aside

Same flat treatment. Sections separated by a hairline with 24px above and below.

**Budget held by** — value or "Not assigned" in normal weight, with an "Assign
department" text button when permitted.

**Sign-off chain** — a vertical stepper, since it's a sequence:

```
①  Business Unit 1
│   No one in charge
②  Dubai Integrated Economic Zones
    No one in charge
```

- Step number 11px in a 20px circle, `--fill-ghost` background.
- 1px connector rule between circles.
- Unit name 13px `--text-primary`, wrapping to two lines if needed.
- Person 13px `--text-secondary` beneath — **on its own line**, not
  right-aligned into a narrow column. That right-alignment is what's causing
  the current wrapping mess.
- Steps with no one assigned get a small amber dot after the unit name.

---

## Part 4 — Rhythm

| Gap | Value |
| :--- | ---: |
| Panel padding | 24px |
| Identity row → title | 16px |
| Title → "Part of" | 6px |
| "Part of" → tab row | 20px |
| Tab row → content | 24px |
| Between sections | 32px |
| Section label → content | 12px |
| Within a section | 12px |
| Grid column gap | 32px |

Every value from the 4/8 scale. No 6, 10, 14, 18, or 22 anywhere except the
6px noted above.

---

## Part 5 — Prompts

Run in `oms-prod-dev`.

### DT1 — Bugs

```
Read docs/ORG-UNIT-DETAIL-SPEC.md, then CLAUDE.md.

Fix Part 1 bugs B1-B3 only. No layout changes yet.

1. B1: the unit NAME renders twice — as the H1 and again right-aligned under
   the Edit button. That right-aligned slot is meant to show the unit TYPE. Find
   the binding and fix it. Per Part 3.1 the type then moves into the identity
   row next to the code chip, and the right-aligned element is deleted entirely.
2. B2: "Assigned Head" appears where a person's name should be. Determine
   whether the API is returning a placeholder, the field is unresolved, or a
   label is being rendered as a value. Report the root cause, then fix it.
   Verify against /units/:id/managers/current.
3. B3: replace "organisation" with "organization" in this component and
   anywhere else it appears.

Report what caused B2 before fixing it.
```

✅ `fix(org-ui): correct unit detail data bindings`

---

### DT2 — Header and tabs

```
Rebuild the detail header and tabs per Part 2, 3.1, 3.2, 3.3.

1. Identity row: code chip (11px mono, --fill-ghost, 4px radius) · type as
   plain 13px --text-secondary · actions right. Delete the right-aligned type
   element entirely.
2. Actions to 32px tall, 8px radius. Edit becomes ghost, not filled.
3. Icon to 36px with 10px radius and a tinted background matching the org card
   treatment. Not a circle.
4. Title to 24px/600. Arabic name 13px --text-secondary below it with
   dir="rtl" lang="ar" on that text node only.
5. "Part of" sits 6px under the title, aligned to the TITLE's left edge — not
   indented past the icon. Label muted, value a link with a chevron.
6. Replace the pill tab container with underline tabs per 3.3: 40px row, 1px
   full-width hairline, 2px accent underline on the active item, no icons,
   counts as muted numbers with no parentheses, hidden when zero.
7. Panel padding to 24px.

Apply the Part 4 spacing table exactly.
```

✅ `feat(org-ui): rebuild unit detail header and tabs`

---

### DT3 — Overview body

```
Rebuild the Overview tab body per Part 2, 3.4, 3.5, 3.6, 3.7.

The single biggest change: REMOVE ALL CARDS from this tab. Currently "Key
Information" is a bordered card containing another bordered box for "Who's in
charge". Replace both with flat sections separated by 1px hairlines.

1. Delete the "Key Information" heading and its "Operational details and
   leadership appointments" subtitle. Both are filler.
2. One section-label treatment everywhere (Part 3.4): 11px, 600, 0.06em
   tracking, uppercase, --text-muted. Never the accent colour — accent is
   reserved for interactive elements.
3. Who's in charge per 3.5: 32px avatar, name 15px/500, meta as "Head · since
   31 Dec 2025" on one line beneath. Not a right-aligned floating date. Dates
   as "31 Dec 2025", never ISO. Empty state in normal weight with an Assign
   action gated on ORG.MANAGER.ASSIGN.
4. Details as a definition grid per 3.6: grid-template-columns 140px 1fr, 12px
   row gap. Codes and cost centres both 13px mono weight 400. "Part of" is a
   link with a muted "Top level" tag when the parent is root. Status as a
   badge. Single column below 640px.
5. Layout: grid 1fr 300px, 32px gap, aside stacks below 1100px.
6. Aside sections use the same flat treatment — no cards, no large padding
   blocks.
7. Sign-off chain as a vertical stepper per 3.7: numbered 20px circles with a
   1px connector, unit name on its own line, assigned person on the line
   BENEATH it. The current right-aligned narrow column is what causes the text
   to wrap badly. Amber dot after any unit with no one assigned.
8. Remove italic from every empty state. Add an action where the user has
   permission to resolve it.
9. Remove the fixed-height container causing dead space at the bottom.

Apply the Part 4 spacing table. Every value from the 4/8 scale.
```

✅ `feat(org-ui): flatten unit detail overview layout`

---

### DT4 — Verify

```
Verify the unit detail page. Report: check | expected | actual | pass.

1. Screenshot at 1440, 1280, 1100, 768, 640 in light and dark.
2. Confirm the unit name appears exactly once.
3. Confirm no nested bordered containers anywhere on the Overview tab.
4. Confirm no section heading uses the accent colour.
5. Confirm no italic text.
6. Confirm codes and cost centres share identical type treatment.
7. Confirm the sign-off chain does not wrap awkwardly at 300px aside width, and
   test with a unit name over 40 characters.
8. Grep for hardcoded hex, rgb, hsl in this component. Should be none.
9. Confirm all spacing values are multiples of 4 except the single 6px noted in
   Part 4.
10. Keyboard: tab through the header actions, tabs, and every link and action
    in the body. Report anything unreachable.
11. Test with an Arabic name present and confirm dir is on the text node only.
12. Test the empty states: no head, no budget department, no departments.
```

🛑 Final gate.
