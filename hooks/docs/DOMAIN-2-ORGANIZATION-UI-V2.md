# Domain 2 — Organization UI (v2)

**Supersedes `DOMAIN-2-ORGANIZATION-UI.md`.** Rewritten around an org-chart
canvas and a non-technical audience.

---

## Part 0 — What changes from v1

| From v1 | Status | Why |
| :--- | :--- | :--- |
| `HierarchySpine` | **Delete** | The chart draws real connector lines. Indentation rules are a file-explorer metaphor. |
| `OrgTypeSigil` (`ORG`/`BU`/`DEP`/`SEC`) | **Delete** | Abbreviations are the single clearest "built for engineers" tell. Replaced by an icon + the full word. |
| Tree component (U3) | **Demote** | Becomes "List view", one of three views. Keep the lazy-loading and a11y work — it's still needed. |
| Two-pane split layout (U4) | **Replace** | Becomes canvas + slide-over panel. |
| Detail tabs (U4) | **Keep, move** | Same tabs, now inside the slide-over. |
| `OrgBreadcrumb`, `UnitPath` | **Keep** | Still needed in the panel and in list/search results. |
| `OrgUnitPicker` (U6) | **Keep unchanged** | Domains 4 and 5 depend on it. |
| Move/delete flows (U5) | **Rebuild** | Dialog with code-typing confirmation is too technical. Becomes a guided flow. |
| API client, hooks, types | **Keep unchanged** | Backend contracts don't move. |

**Roughly a day of U2–U4 work is discarded.** Everything from the API layer
down survives intact.

---

## Part 1 — Design language

Taken from the reference, adapted. Map every value to existing theme tokens —
do not hardcode hex, and do not introduce a new palette. Most shadcn themes
already carry all of these.

### Surfaces

- Page background: one step darker than card white (`--muted` territory).
- Canvas: a large rounded container (16px) sitting on the page background,
  inset from the page edges.
- Cards: white, 1px neutral border, 12px radius, no shadow at rest.
- Selected card: 2px near-black border. Not a colour — a weight change.
  Colour-coding four levels turns the canvas into confetti.
- Slide-over panel: white, left edge shadow, ~600px, full height.

### Typography

- One sans throughout. Whatever the app already uses. Do **not** add a display
  face — this is a working tool, not a landing page.
- Card title: 14px semibold. Card subtitle: 12px muted.
- Panel title: 24px semibold.
- **Codes in monospace** (`DIEZ`, `CORP-IT`, `CC-1042`) — these get compared
  and typed, and mono makes transposition errors visible. This is the one mono
  usage that survives from v1.

### Status colours

Semantic only, as pastel badges — green active, amber pending, neutral
inactive. These are the *only* saturated colours on screen. Everything else is
neutral. That's what makes the reference feel calm.

### Motion

- Card expand/collapse: 150ms height.
- Panel slide-in: 200ms.
- Canvas pan/zoom: no easing, must feel direct.
- Nothing else animates. Respect `prefers-reduced-motion` throughout.

---

## Part 2 — Vocabulary

This is half the work of making it feel non-technical.

| Never say | Say instead |
| :--- | :--- |
| Organisation unit, node, entity | The actual type: Business Unit / Department / Section |
| Parent | Part of |
| Child, children | What's inside |
| Descendants | The departments and teams inside it |
| Hierarchy, tree | Organisation chart, or just "the chart" |
| Reparent, move node | Move to a different part of the organisation |
| Deactivate | Archive |
| Soft delete | Remove |
| Effective from / to | Started / Ended |
| Head, HOD, primary manager | Who's in charge |
| Scope | (never shown — see §6.2) |
| Rowversion conflict | Someone else changed this |

Rules:

- Actions keep one name end to end. Button "Move department" → flow header
  "Move department" → toast "Department moved".
- Errors say what happened and what to do next. Never a code.
  `ORG_MOVE_CYCLE` → *"You can't move a department into one of its own
  sections. Pick a different place."*
- Counts read as sentences: *"4 departments · 23 people"*, not `4 | 23`.
- Empty states invite: *"No sections yet. Add one to group this department's
  teams."*

---

## Part 3 — Screen structure

### 3.1 Header

```
Organisation                    [ Chart ]  List   Grouped        ⊕ Add
```

- Title: **"Organisation"**. Not "Org Management", not "Master Data".
- Three-view segmented control. **Chart is the default.**
- Primary action right-aligned, gated on `ORG.CREATE`.

The three views serve genuinely different jobs, which is why all three exist:

| View | Answers | Best for |
| :--- | :--- | :--- |
| **Chart** | "How is this organised?" | First-time understanding, presenting to leadership |
| **List** | "Where is the department called X?" | Finding something by name |
| **Grouped** | "Show me all departments" | Bulk review, e.g. which ones have no head |

### 3.2 Chart view — the canvas

```
┌──────────────────────────────────────────────────────────┐
│                    ┌──────────────────┐                  │
│                    │ 🏛  DIEZ         │                  │
│                    │ Dubai Integrated │                  │
│                    │ Economic Zones   │                  │
│                    │ Organisation     │                  │
│                    │ 3 business units │                  │
│                    │ [Details]  [⌄]   │                  │
│                    └────────┬─────────┘                  │
│              ┌──────────────┼──────────────┐             │
│         ┌────┴────┐    ┌────┴────┐    ┌────┴────┐        │
│         │ CORP    │    │ FREEZ   │    │ OPS     │        │
│         │ Corp…   │    │ Free Z… │    │ Operat… │        │
│         │ Business│    │ Business│    │ Business│        │
│         │  Unit   │    │  Unit   │    │  Unit   │        │
│         │ 6 depts │    │ 4 depts │    │ 5 depts │        │
│         └─────────┘    └─────────┘    └─────────┘        │
│  ┌──────────┐                              ┌───────────┐ │
│  │ minimap  │                              │ ⊖ ── ⊕ 80%│ │
│  └──────────┘                              └───────────┘ │
└──────────────────────────────────────────────────────────┘
```

Behaviour:

- **Top-down**, orthogonal elbow connectors, never diagonal.
- Pan by drag, zoom by scroll or the control. Zoom presets: Fit, 50, 80, 100.
- **Minimap** bottom-left, showing viewport position. Click to jump.
- Starts at the highest unit the user can see, zoomed to fit, with the first
  two levels expanded. Never open at 100% on a 5,000-node graph.
- Layout is computed, not authored — use a proper tree layout algorithm, not
  hand-rolled positioning.

### 3.3 Card anatomy

```
┌────────────────────────────────┐
│ 🏢  CORP-IT                    │   ← type icon + code (mono)
│                                │
│ Information Technology         │   ← name, 14px semibold
│ تقنية المعلومات                  │   ← Arabic, dir="rtl" on this node only
│ Department                     │   ← full type word, muted
│                                │
│ 👤 Ahmed Al Mansouri           │   ← who's in charge (avatar + name)
│ 4 sections · 23 people         │   ← counts as a sentence
│                                │
│ ─────────────────────────────  │
│  [ Details ]            [ ⌄ ]  │   ← open panel / expand children
└────────────────────────────────┘
```

- Fixed width ~240px. Height varies with content.
- Type icon in a soft tinted square — one icon per type, consistent everywhere.
  No logos: DIEZ departments don't have them and nobody wants to manage assets.
- **"Who's in charge" is on the card.** This is the single most humanising
  detail; it turns an abstract box into a person people recognise.
- `⌄` chevron expands children in place. Shows `⌃` when expanded. If the unit
  has no children, the chevron is absent — not disabled.
- Cards with unresolved issues (no head assigned) show a small amber dot. One
  indicator only; don't build a badge system.
- Archived units render at 50% opacity with a neutral "Archived" badge, and
  only when the "Show archived" toggle is on.

### 3.4 Slide-over detail panel

Opens from the right on "Details" or a card double-click. Canvas stays visible
and keeps its position — this is why it's a slide-over and not a route.

```
┌─────────────────────────────────────────────────┐
│ CORP-IT   Department details            [ ✕ ]   │
│ ─────────────────────────────────────────────── │
│                                                 │
│  🏢   Information Technology                    │
│       تقنية المعلومات                             │
│       Part of Corporate Services · DIEZ         │
│                              [ ⋯ ]  [ Edit ]    │
│ ─────────────────────────────────────────────── │
│  Overview  │ Sections │ People │ History        │
│ ─────────────────────────────────────────────── │
│                                                 │
│  Who's in charge                                │
│  👤 Ahmed Al Mansouri      Since 1 Jan 2026     │
│                                                 │
│  Code            CORP-IT                        │
│  Cost centre     CC-1042                        │
│  Part of         Corporate Services  ›          │
│  Status          ● Active                       │
│                                                 │
└─────────────────────────────────────────────────┘
```

- Breadcrumb-style header: code chip + what this panel is.
- "Part of" is a clickable path — this is the breadcrumb, expressed in plain
  words.
- `⋯` menu holds Move, Archive, Remove. Destructive actions live behind one
  extra click, not on the surface.
- Tabs, with the second tab **named for the actual child type** — "Sections"
  under a department, "Departments" under a business unit. Never "Children".

**Overview** — plain definition list, read-only. Edit opens a form.

**Sections / Departments** — table: name, who's in charge, people count,
status. Row click navigates the canvas to that card *and* updates the panel.
"⊕ Add section" respects hierarchy rules.

**People** — everyone assigned, with a small timeline above showing who has
been in charge and when. Reuse `components/oms/Timeline`.

**History** — plain-language change log. *"Moved from Operations to Corporate
Services — Sara Ahmed, 12 March 2026"*, not a JSON diff.

### 3.5 List view

The v1 tree, kept. Indented rows, search, lazy loading. This is the
"I know the name, find it" view. Keep the ARIA treeview work from U3 — it's
still the correct pattern here.

### 3.6 Grouped view

Flat, filterable tables grouped by type, replacing the three separate
`/business-units`, `/departments`, `/sections` routes. Every row shows its full
"part of" path — that path is why this view exists, given duplicate names.

Useful preset filters: *No one in charge*, *Archived*, *Added this year*.

---

## Part 4 — Guided flows

Dialogs become short guided flows. Non-technical users do better with one
decision per screen than one form with everything.

### 4.1 Add

**Step 1 — Where does it go?** Pre-filled if launched from a card. Shows the
chosen parent as a card preview.

**Step 2 — What kind?** Large radio cards, only types valid under that parent
per `/unit-types/:id/allowed-parents`. Each with icon, name, and a one-line
explanation: *"A department groups related teams and holds its own budget."*

**Step 3 — Details.** Name, Arabic name, code, cost centre. Code
auto-suggested from the name, editable, with live availability check.

**Step 4 — Who's in charge?** Optional, skippable. Skipping produces the amber
dot on the card.

Confirmation: the new card animates into position on the canvas. Toast:
*"Information Technology added under Corporate Services."*

### 4.2 Move 🔴

The dangerous one. Rewrites the closure table for the whole subtree.

**Step 1 — Where should it move to?** `OrgUnitPicker`, constrained to valid
parent types. Shows the full path of each option.

**Step 2 — Confirm what moves.** In plain words, not counts alone:

> **Information Technology and everything inside it will move.**
>
> That's **4 sections** and **23 people**.
>
> From: DIEZ › Operations
> To: DIEZ › Corporate Services
>
> - Infrastructure
> - Application Development
> - Data & Analytics
> - Service Desk

**Step 3 — Confirm.** A single "Move department" button. **No code typing** —
that's a technical ritual. The safety comes from step 2 making the consequence
unmissable, plus the action being undoable for 10 seconds via the toast.

Then:

- Sends `rowVersion`. On 409: *"Someone else changed this department while you
  were working. Reload to see the latest."* with a Reload button.
- On `ORG_MOVE_CYCLE`: *"You can't move a department into one of its own
  sections. Pick a different place."*
- On `ORG_MOVE_BLOCKED_BUDGET`: name the blocking commitments with links, never
  a generic failure.
- **No optimistic UI.** Show progress; a large subtree can take seconds.
- On success, the canvas animates the card to its new position — that animation
  *is* the confirmation.

### 4.3 Archive and Remove

Two separate, clearly distinguished actions:

- **Archive** — *"Hide this department from everyday use. Its history and past
  budgets stay."*
- **Remove** — *"Delete this department. Only possible if nothing is using it."*

Blocking reasons in plain words, each specific:

| Code | Message |
| :--- | :--- |
| `ORG_HAS_CHILDREN` | "Remove or move the 4 sections inside it first." |
| `ORG_HAS_ASSIGNED_USERS` | "23 people are still assigned here. Move them first." |
| `ORG_REFERENCED` | "This department has budget records and can't be removed. You can archive it instead." |
| `ORG_ROOT_PROTECTED` | "This is the top of your organisation and can't be removed." |

Each message ends with the action that resolves it, as a button where possible.

---

## Part 5 — Scale

5,000 nodes cannot all render. The reference's expand-in-place pattern is the
answer, not an afterthought.

- Fetch **one level at a time** via `/units/:id/children`. Never the whole tree.
- Render only cards within the viewport plus one screen of margin.
- Collapse siblings beyond 12 into a *"+ 8 more departments"* card that expands
  on click. Twelve cards in a row is already past comfortable scanning.
- Persist expansion state and canvas position per user across navigation.
- Deep link `?unit=<id>` — expand the ancestor path via `/units/:id/ancestors`,
  centre and select that card.
- Search from the header jumps the canvas to the match and opens its panel.

**Performance targets:** initial render < 1s at 5,000 units; expanding a
20-child node < 200ms; pan and zoom hold 60fps.

---

## Part 6 — Hard cases

### 6.1 Deep or wide graphs

At depth 4 with many siblings, top-down layout gets very wide. Provide a
**horizontal (left-to-right) layout toggle** — it handles depth far better and
matches how people read a reporting line. The reference has a layout toggle in
the bottom-right controls; that's what it's for.

### 6.2 Users who can only see part of the chart

A department-scoped user's visible set has no top node. **This will look broken
unless handled deliberately.**

Render their visible units as the top row, under a quiet line reading *"You're
seeing the parts of the organisation you work with."* Never draw a placeholder
box for units they can't see — it implies structure they can't reach and
generates support tickets. Never use the word "scope".

### 6.3 Arabic names

`dir="rtl" lang="ar"` on the Arabic text node **only**. Never the card, never
the row. A card that flips wholesale scrambles the icon, code, and action
positions.

### 6.4 Permissions

Hide actions the user can't perform rather than disabling them. Gate with
`can()`, never a role name. A user with only `ORG.VIEW` sees a clean read-only
chart with no `⋯` menus and no Add button — and that should look intentional,
not stripped.

### 6.5 States

| Surface | Loading | Empty | Error |
| :--- | :--- | :--- | :--- |
| Canvas | Skeleton cards in tree formation | First-run: "Let's set up your organisation" + Add | Retry, with reason |
| Card children | Chevron spinner | Chevron absent | Inline retry on card |
| Panel | Skeleton | — | Retry |
| Panel tab | Skeleton rows | "No sections yet" + Add | Retry |
| Move step 2 | Disabled continue + spinner | — | Inline, specific |
| Out-of-scope unit | — | — | Genuine 404 page (a 403 confirms it exists) |

---

## Part 7 — Prompt sequence

Run in order in `oms-prod-dev`.

---

### V1 — Salvage audit

```
Read docs/DOMAIN-2-ORGANIZATION-UI-V2.md fully, then CLAUDE.md.

We are changing direction: the org tree becomes an org CHART canvas, and the
audience is non-technical staff, not administrators.

Report only — write no code.

1. List everything built for the Organization UI so far, with file paths.
2. Against Part 0 of the v2 doc, classify each file: KEEP AS IS / KEEP AND
   MOVE / REBUILD / DELETE. Give a reason per file.
3. Confirm the API client layer and React Query hooks need no changes. If any
   do, say which and why.
4. Recommend a chart rendering library. Evaluate React Flow, D3 hierarchy, and
   Dagre-based options against: 5,000 nodes with lazy expansion, orthogonal
   connectors, pan/zoom + minimap, both vertical and horizontal layouts,
   accessibility, and bundle size. Give one recommendation with reasoning, plus
   a fallback.
5. Audit every user-facing string in the current org screens against the Part 2
   vocabulary table. List each violation with file and line.
6. Estimate the work in half-day units.

Do not start deleting anything yet.
```

🛑 Read this. The library choice in item 4 shapes everything after.

---

### V2 — Foundations

```
Set up the chart foundations. No screens yet.

1. Install and configure the chart library agreed in the previous task.
2. Delete HierarchySpine and OrgTypeSigil, and every usage. Per Part 0 these
   are replaced by real connectors and full type words.
3. Build components/oms/org/OrgUnitCard.tsx to the Part 3.3 anatomy exactly:
   type icon in a tinted square, mono code, name, Arabic name (dir="rtl"
   lang="ar" on that text node only), full type word, who's-in-charge with
   avatar, counts as a sentence, Details button, expand chevron.
   States: default, hover, selected (2px near-black border — a weight change,
   not a colour), archived (50% opacity), needs-attention (amber dot when no
   head assigned).
   Presentation only. No data fetching.
4. Build components/oms/org/OrgTypeIcon.tsx — one icon per type, used
   everywhere a type appears.
5. Map every colour, radius, and spacing value in Part 1 to existing theme
   tokens. Report which tokens you used. If any are missing, add them to the
   theme — never a hardcoded hex in a component.

Build a demo page showing every card state in light and dark theme.
```

✅ `feat(org-ui): add org chart card and type icons`

---

### V3 — The canvas 🔴

```
Plan first. Show me the plan before writing code.

Build the org chart canvas per Part 3.2, Part 5, and Part 6.1.

Requirements:
- Top-down layout, orthogonal elbow connectors, never diagonal.
- Computed layout via the library's tree algorithm. Do not hand-position nodes.
- Lazy expansion: fetch one level at a time via /units/:id/children. Never
  fetch the whole tree.
- Viewport virtualisation — render only cards in view plus one screen margin.
- Collapse siblings beyond 12 into a "+ N more departments" card.
- Pan by drag, zoom by scroll and control. Presets: Fit, 50%, 80%, 100%.
- Minimap bottom-left with viewport indicator, click to jump.
- Layout toggle: vertical and horizontal (Part 6.1).
- Opens at the highest visible unit, zoomed to fit, first two levels expanded.
- Persists expansion state and canvas position per user across navigation.
- Deep link ?unit=<id> expands the ancestor path via /units/:id/ancestors,
  centres and selects.
- Part 6.2 scoped-user case: when the visible set has no top node, render
  visible units as the top row under "You're seeing the parts of the
  organisation you work with." Never draw placeholder boxes for units they
  can't see. Never use the word "scope".
- Keyboard: arrows move between cards, Enter opens the panel, +/- zoom, 0 fits.
  Every card must be reachable without a mouse.

In your plan, state how you will handle a node with 200 children and how you
will keep pan/zoom at 60fps while cards are mounted.

Test against the 5,000-unit perf seed. Report the Part 5 timings.
```

🛑 Read the plan. Then test the scoped-user case by hand — it must look
deliberate, not broken.

✅ `feat(org-ui): implement org chart canvas`

---

### V4 — Detail panel

```
Build the slide-over detail panel per Part 3.4.

- Opens right on Details or card double-click. Canvas stays mounted and keeps
  its position — this is a slide-over, not a route change.
- Header: code chip, panel label, close. Then icon, name, Arabic name,
  "Part of" as a clickable path, ⋯ menu, Edit.
- Tabs: Overview, [dynamic child type], People, History.
- The child tab is named for the ACTUAL child type — "Sections" under a
  department, "Departments" under a business unit. Derive from
  /unit-types/:id/allowed-parents. Never "Children".
- Overview: read-only definition list. Edit opens a form.
- Child tab: table with name, who's in charge, people count, status. Row click
  navigates the canvas to that card AND updates the panel.
- People: assigned users, with a Timeline above showing who has been in charge
  and when. Reuse components/oms/Timeline.
- History: plain-language change log. "Moved from Operations to Corporate
  Services — Sara Ahmed, 12 March 2026". Never a JSON diff, never a code.
- ⋯ menu holds Move, Archive, Remove — destructive actions one click deep.
- Every string follows the Part 2 vocabulary table.
- Every action gated with can(); hide rather than disable.
- All Part 6.5 states implemented. Out-of-scope renders a genuine 404.
```

✅ `feat(org-ui): implement organization detail panel`

---

### V5 — Add flow

```
Build the four-step Add flow per Part 4.1.

Step 1: where it goes — OrgUnitPicker, pre-filled when launched from a card,
showing the chosen parent as a card preview.
Step 2: what kind — large radio cards, only valid types per
/unit-types/:id/allowed-parents, each with icon, name, and a one-line plain
explanation of what that type is for.
Step 3: details — name, Arabic name, code, cost centre. Code auto-suggested
from the name, editable, live availability check against the API.
Step 4: who's in charge — optional and skippable. Skipping leaves the card
showing the amber needs-attention dot.

One decision per screen. Back must preserve entries. Progress indicator across
the top.

On success, the new card animates into position on the canvas. Toast names
both units: "Information Technology added under Corporate Services."

All validation messages in plain language — never an error code.
```

✅ `feat(org-ui): implement guided add flow`

---

### V6 — Move and archive 🔴

```
Plan first. This covers the destructive operations.

Build the Move flow per Part 4.2 and Archive/Remove per Part 4.3.

Move — three steps:
1. Where to — OrgUnitPicker constrained to valid parent types, showing full
   paths.
2. Confirm what moves — render exactly the plain-language block in Part 4.2:
   what moves, how many sections and people, from-path, to-path, and a list of
   the affected sections. Continue stays disabled until counts have loaded.
3. Confirm — single "Move department" button.

Explicitly: NO code-typing confirmation. Safety comes from step 2 making the
consequence unmissable, plus a 10-second undo in the success toast.

- Sends rowVersion. 409 → "Someone else changed this department while you were
  working. Reload to see the latest." with a Reload button.
- ORG_MOVE_CYCLE → "You can't move a department into one of its own sections.
  Pick a different place."
- ORG_MOVE_BLOCKED_BUDGET → list the blocking commitments with links.
- No optimistic UI. Show progress. On success, animate the card to its new
  position on the canvas — that animation is the confirmation.
- Invalidate the moved unit, and all ancestors of BOTH old and new parents.

Archive and Remove are separate actions with the Part 4.3 wording. Every
blocking reason gets its specific message from the Part 4.3 table, each ending
with the action that resolves it as a button where possible.

In your plan, state how the undo works and what happens if it fails.
```

🛑 Read the plan. Then move a mid-tree department on the perf seed and confirm
the counts shown match what actually moved.

✅ `feat(org-ui): implement move, archive and remove flows`

---

### V7 — List and Grouped views

```
Build the remaining two views and the header switcher per Part 3.1, 3.5, 3.6.

- Segmented control: Chart (default), List, Grouped. Selection persists per
  user.
- List view: adapt the existing tree component. Keep its lazy loading and ARIA
  treeview implementation from the earlier work — that pattern is still correct
  here. Replace the spine with plain indentation, and the sigil with the type
  icon plus word.
- Grouped view: flat filterable tables grouped by type, replacing the separate
  /business-units, /departments, /sections routes. Every row shows its full
  "part of" path via UnitPath.
- Preset filters: "No one in charge", "Archived", "Added this year".
- Global search in the header works across all three views. In Chart view it
  jumps the canvas to the match and opens its panel.
- Export gated on ORG.EXPORT, rate limit tier 7.
- Redirect the old three routes to Grouped view with the relevant filter
  pre-applied so existing links don't break.
```

✅ `feat(org-ui): add list and grouped views`

---

### V8 — Copy pass

```
Audit every user-facing string across all Organization screens against Part 2
of the v2 doc.

1. Replace every violation from the vocabulary table.
2. Verify each action keeps ONE name across button, flow header, and toast.
3. Verify no error code, field name, or database term is ever shown to a user.
   Every backend error code from the domain spec must map to a specific,
   actionable sentence.
4. Verify every empty state names the action that fills it.
5. Verify counts read as sentences, not bare numbers.
6. Read every screen as if you have never used this system and do not work in
   IT. Flag anything you would have to guess at.

Report a table: string | file | problem | replacement. Then apply the changes.
```

✅ `polish(org-ui): plain-language copy pass`

---

### V9 — Quality pass

```
Final pass across every Organization screen.

1. Accessibility: full keyboard navigation of the canvas (arrows, Enter, +/-,
   0). Every card reachable without a mouse. Dialogs trap and restore focus.
   Every icon-only button has an accessible name. Provide a "Switch to list
   view" affordance for screen reader users, since a canvas is inherently hard
   to navigate non-visually — this is a genuine accessibility requirement,
   not a nice-to-have.
2. Responsive: 375, 768, 1024, 1440. On mobile the canvas is unusable —
   default to List view below 768px and say so with a one-line note, rather
   than shipping a cramped chart.
3. Theme: every screen in light and dark. Find hardcoded colours.
4. RTL: dir="rtl" on Arabic text nodes only, never cards or rows. Confirm icon,
   code, and action positions do not flip.
5. Motion: only card expand, panel slide, and the move animation. Remove
   anything else. Confirm prefers-reduced-motion is respected.
6. Permissions: a view-only user sees a clean read-only chart that looks
   intentional, not stripped. Verify no role-name gating anywhere.
7. Performance: confirm the Part 5 targets at 5,000 units.

Report: issue | severity | file | fixed yes/no.
```

🛑 Final gate.

---

## Part 8 — Check these yourself

1. **The scoped user.** Log in as someone who can see one department. Does the
   chart look deliberate?
2. **A real move.** On the 5,000-unit seed, move a mid-tree department. Do the
   counts match? Run the §6.3 integrity check after.
3. **Mobile.** Open it on a phone. Does it fall back to List view cleanly?
4. **The layman test.** Show it to someone who doesn't work in IT and ask them
   to add a section under a department, without help. Watch where they hesitate.
   That's your real backlog.
