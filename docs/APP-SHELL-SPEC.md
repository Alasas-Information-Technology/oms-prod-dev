# OMS — Application Shell

Header, breadcrumb, sidebar, and content region. Applies to every page, not
just Organization.

**Palette unchanged.** Every value maps to an existing theme token.

---

## Part 1 — The problem

Current vertical budget above content:

| Band | Height |
| :--- | ---: |
| Global bar (logo, search, utilities) | ~90px |
| Breadcrumb row | ~60px |
| Page title (48px) + subtitle | ~100px |
| Gap before content | ~30px |
| **Total chrome** | **~280px** |

On a 1366×768 laptop — which is what most DIEZ staff will be on — that leaves
about 480px of usable height. The canvas gets less than half the screen.

Three separate bands also mean three competing horizontal rules and three
different left-alignment origins, which is why the top of the page reads as
noisy.

---

## Part 2 — Target structure

Two bands, 108px total. A **62% reduction** in chrome.

```
┌────────────────────────────────────────────────────────────────┐
│ [☰] DIEZ            [ search 420px ]        [🔔] [◐] [avatar]  │  52px  fixed
├──────────┬─────────────────────────────────────────────────────┤
│          │ Administration / Master data / Organization  [tools]│  56px  sticky
│ Sidebar  ├─────────────────────────────────────────────────────┤
│  240px   │                                                     │
│          │                    CONTENT                          │  fills
│          │              (fills all remaining space)            │
└──────────┴─────────────────────────────────────────────────────┘
```

Three structural changes:

1. **The breadcrumb becomes the page title.** The last crumb is the page name.
   No separate 48px heading. This is how Linear, Vercel, and GitHub handle it,
   and it removes ~160px.
2. **Page actions move into the breadcrumb row.** View switcher, Export, Add —
   all right-aligned on the same 56px band.
3. **The subtitle is deleted.** *"Explore and understand the reporting lines,
   departments, teams, and leadership"* is marketing copy. It's read once and
   then costs 40px forever. If the orientation is genuinely needed, it belongs
   in the first-run empty state.

---

## Part 3 — Global bar

Height **52px**, fixed, full width, `--surface-2`, 0.5px bottom border.

```
[☰] [DIEZ logo]        [  search  ]        [🔔] [◐] [avatar]
 32px    ~90px            420px             32px each, 4px gap
```

- **Sidebar toggle first, then logo.** Currently the logo sits inside the
  sidebar, so collapsing the sidebar orphans it. Move the logo into the global
  bar permanently.
- Logo max height 28px, vertically centred.
- **Search: 420px max, centred.** Not full width. Keep the ⌘K chip — set it at
  11px in `--text-muted` inside a subtle bordered pill on the right of the
  field.
- Utility icons 32×32 hit area, 18px glyph, 4px apart, right-aligned with 16px
  page margin.
- Avatar 28px.
- Horizontal padding 16px.

Below 1024px the search collapses to an icon that opens a command palette
overlay.

---

## Part 4 — Page bar

Height **56px**, sticky directly beneath the global bar, `--surface-0`
(page background, not white), 0.5px bottom border.

```
Administration / Master data / Organization      [Chart·List·Grouped] [Export] [Add]
```

- Breadcrumb left, actions right, both vertically centred.
- Padding: 24px left, 24px right.
- All controls in the action group are **36px tall** — currently they aren't,
  which is why the toolbar looks uneven.
- Gaps: 16px between the segmented control and Export, 8px between Export and
  Add.
- Exactly **one filled button** per page. Add is it. Export is ghost.

Because it's sticky, actions stay reachable when content scrolls. That matters
on long tables.

---

## Part 5 — Breadcrumb rules

The breadcrumb is now doing two jobs — location *and* page title — so it needs
to be treated as typography, not navigation garnish.

### Type

| Element | Size | Weight | Colour |
| :--- | :--- | :--- | :--- |
| Ancestor crumbs | 14px | 400 | `--text-secondary` |
| Separator | 14px | 400 | `--text-muted` |
| **Current page** | **15px** | **500** | `--text-primary` |

The final crumb is not a link, has no hover state, and carries `aria-current="page"`.

### Separator

Use `/` at `--text-muted`, with 8px on each side. Chevrons at three or four
levels start to look like a stack of arrowheads; a slash is quieter and reads
as a path.

### Home

Drop the house icon. It's a 20px target that competes with the text and adds a
level nobody uses. Start the trail at the first real section.

### Truncation

Never wrap to a second line — that would break the fixed 56px band.

- Up to 4 crumbs: show all.
- 5 or more: show the first, then `…`, then the last two. The `…` is a button
  opening a menu of the hidden levels.
- Any single crumb over 28 characters truncates with an ellipsis and a tooltip
  carrying the full name.

### What belongs in it

The trail mirrors the route, not the sidebar's grouping. `/app/administration/
master-data/organization` renders as *Administration / Master data /
Organization*. Detail pages append the record: *… / Organization / Information
Technology*.

Deep drill-downs replace crumbs rather than growing forever — a unit five
levels into the org tree still shows *… / Organization / Information
Technology*, because the org chart already communicates depth.

---

## Part 6 — Sidebar

- Width **240px** expanded, **56px** collapsed to an icon rail.
- Collapse state persists per user.
- Item height **36px**, font 14px, icon 16px at 1.5px stroke.
- Group label: 11px uppercase, 0.05em tracking, `--text-muted`, 24px top margin.
- Horizontal padding 12px; 10px between icon and label.
- Groups collapse by default. Only the group containing the active route
  expands.
- **One active item at a time.** The active item gets `--fill-ghost-selected`
  and primary text. Its parent group gets a 2px accent bar on the left edge of
  the group label — not the same treatment as the child.
- On the icon rail, labels appear as tooltips on hover after 400ms.
- Sidebar scrolls independently only if it overflows; with groups collapsed it
  usually won't.

---

## Part 7 — Content region

This is where the space you're reclaiming goes.

```css
height: calc(100vh - 108px);
overflow: auto;
```

Padding depends on what the view is — this is the part that's currently
uniform and shouldn't be:

| View type | Padding | Reason |
| :--- | :--- | :--- |
| **Canvas** (org chart) | **0** — full bleed | Every pixel is layout space. Controls float over it. |
| Table / list | 24px | Needs breathing room at the edges |
| Form / detail | 24px, content max 880px | Long measure hurts readability |
| Dashboard | 24px, 16px grid gap | — |

**Drop the rounded white card wrapper around the canvas.** It costs ~48px of
width and ~48px of height, and it visually shrinks the workspace for no
functional gain. The canvas should meet the sidebar and the page bar directly,
with its own subtle grid providing the surface treatment.

For canvas views, the minimap and zoom controls float at 16px inset from the
content region edges rather than the card edges.

---

## Part 8 — Scroll behaviour

```
html, body        overflow: hidden
app shell         h-screen, flex column
global bar        fixed, z-30
sidebar           fixed, z-20, own scroll if needed
page bar          sticky top-0 within content column, z-10
content           the only scroll container
```

There must be exactly **one** page-level scrollbar visible, and on canvas views
**zero** — the canvas pans internally.

The current build has two. That's the tell that the shell isn't height-locked.

---

## Part 9 — Responsive

| Width | Behaviour |
| :--- | :--- |
| ≥1280px | Full shell as specified |
| 1024–1279px | Sidebar auto-collapses to the icon rail |
| 768–1023px | Sidebar becomes an overlay drawer; search collapses to an icon |
| <768px | Global bar 48px; page bar wraps actions to a second row; breadcrumb shows last two crumbs only; canvas views default to List |

---

## Part 10 — Prompts

### S1 — Shell structure

```
Read docs/APP-SHELL-SPEC.md, then CLAUDE.md.

Rebuild the application shell per Parts 2, 3, 8 and 9. This is app-wide, not
Organization-specific — every page uses it.

1. Two bands only: global bar 52px fixed, page bar 56px sticky. Delete the
   separate page-title block entirely, including the subtitle.
2. Move the DIEZ logo out of the sidebar and into the global bar, after the
   sidebar toggle. It must stay visible when the sidebar collapses.
3. Global bar per Part 3: 52px, search constrained to 420px centred with the
   ⌘K chip at 11px in --text-muted, utility icons 32px hit area with 18px
   glyphs, avatar 28px, 16px horizontal padding.
4. Page bar per Part 4: breadcrumb left, page actions right, 24px padding, all
   action controls 36px tall, 16px gap before Export and 8px before Add.
5. Scroll lock per Part 8: html and body overflow hidden, shell is h-screen
   flex column, content is the ONLY scroll container. There must be exactly one
   page scrollbar, and zero on canvas views.
6. Responsive breakpoints per Part 9.

Verify no page has a double scrollbar afterwards.
```

✅ `feat(shell): rebuild header into two bands`

---

### S2 — Breadcrumb

```
Rebuild the breadcrumb component per Part 5 of docs/APP-SHELL-SPEC.md.

The breadcrumb now serves as the page title, so treat it as typography.

1. Type scale per the Part 5 table: ancestors 14px/400/--text-secondary,
   separator 14px/--text-muted, current page 15px/500/--text-primary.
2. Separator is "/" with 8px each side. Not a chevron.
3. Remove the home icon entirely. Start at the first real section.
4. Final crumb is not a link, has no hover state, carries aria-current="page".
5. Truncation per Part 5: up to 4 crumbs show all; 5+ shows first, then a "…"
   button opening a menu of hidden levels, then the last two. Never wrap to a
   second line.
6. Any crumb over 28 characters truncates with a tooltip carrying the full
   name.
7. Trail mirrors the route, not the sidebar grouping. Detail pages append the
   record name.
8. For org units nested deeper than three levels, replace rather than extend —
   the chart already communicates depth.

Build a demo page showing 2, 3, 4, 6 crumb cases and a very long crumb name.
```

✅ `feat(shell): rebuild breadcrumb as page title`

---

### S3 — Sidebar

```
Apply Part 6 of docs/APP-SHELL-SPEC.md.

1. 240px expanded, 56px icon rail collapsed, state persisted per user.
2. Item metrics: 36px height, 14px font, 16px icon at 1.5px stroke, 12px
   horizontal padding, 10px icon-to-label gap.
3. Group labels: 11px uppercase, 0.05em tracking, --text-muted, 24px top
   margin.
4. Groups collapse by default; only the group containing the active route
   expands.
5. Exactly ONE item shows the active state. The active item gets
   --fill-ghost-selected with primary text. Its parent group gets a 2px accent
   bar on the group label — NOT the same treatment as the child. Currently four
   items highlight at once.
6. Icon rail: labels as tooltips on hover after 400ms.
7. Sidebar scrolls only on overflow.

Verify on every route that exactly one item is active.
```

✅ `feat(shell): tighten sidebar density and active state`

---

### S4 — Content region

```
Apply Part 7 of docs/APP-SHELL-SPEC.md.

1. Content region: height calc(100vh - 108px), overflow auto, the only scroll
   container.
2. Padding becomes view-dependent, not uniform:
   - Canvas views: 0, full bleed
   - Table and list views: 24px
   - Form and detail views: 24px with content max-width 880px
   - Dashboards: 24px with 16px grid gap
3. DELETE the rounded white card wrapper around the org chart canvas. The
   canvas meets the sidebar and page bar directly. Its own grid provides the
   surface treatment.
4. Canvas minimap and zoom controls float at 16px inset from the content region
   edges, not from a card.
5. Re-run fit-to-content after this change — the canvas viewport is now larger,
   so the zoom calculation needs to reflect it.

Report the measured usable content height at 1366x768 before and after.
```

✅ `feat(shell): view-aware content padding and full-bleed canvas`

---

### S5 — Verify

```
Verify the shell across the application.

1. Measure and report chrome height above content. Target is 108px.
2. Measure usable content height at 1366x768, 1440x900, 1920x1080.
3. Confirm exactly one page scrollbar on table views and zero on canvas views.
4. Confirm the logo stays visible with the sidebar collapsed.
5. Confirm exactly one sidebar item is active on every route.
6. Screenshot the breadcrumb at 2, 3, 4, and 6 levels plus a long crumb name.
7. Check every breakpoint from Part 9.
8. Keyboard: tab from the sidebar toggle through to the first content element.
   Report anything skipped or trapped.
9. Confirm all page-bar action controls are exactly 36px tall.

Report a table: check | expected | actual | pass.
```

🛑 Final gate.