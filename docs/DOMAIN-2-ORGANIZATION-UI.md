# Domain 2 — Organization UI Refinement

Design direction and prompt sequence for polishing the Organization Structure
screens in `oms-prod-dev`.

Use this whether the screens are already built (refinement pass) or not yet
built (build to this instead of the thinner §13 in the domain spec).

---

## Part 1 — Direction

### 1.1 What this module actually is

An administrator for a Dubai government economic zone authority, editing the
structure that every budget, requisition, and approval in the system routes
through. They open this screen rarely, and when they do, a mistake is
expensive — moving a department reparents its entire subtree and can strand
budget commitments.

That gives three design priorities, in order:

1. **Legibility of lineage.** Where does this unit sit, and what hangs off it?
2. **Consequence before action.** Never let someone move or delete without
   seeing what else changes.
3. **Density without noise.** Administrators scan; they don't browse.

Anything that doesn't serve one of those three gets cut.

### 1.2 Don't reinvent the visual language

The existing system already has `DataTable`, `StatusBadge`, `Timeline`,
`AppSidebar`, and the shadcn/ui primitives. **Consistency with those wins over
anything proposed here.** An admin module that looks different from the rest of
the app reads as a bug, not a statement.

Work within the existing CSS variables. Do not introduce a new palette. If the
theme lacks a token you need, add it to the theme — don't hardcode a hex in a
component.

### 1.3 The one idea worth spending on: the hierarchy spine

Depth in this system is genuinely meaningful **and genuinely irregular** — the
RFP allows a Department to sit under the holding Organization *or* under a
Business Unit, so the same unit type appears at depth 1 or depth 2. Users
cannot infer level from type, which means lineage has to be visible rather than
inferred.

So the signature element is a **consistent visual encoding of lineage** applied
across every surface where a unit appears:

- A thin vertical rule per ancestor level, drawn in the tree, the breadcrumb,
  the picker, and the move dialog — same geometry, same colour, everywhere.
- Type identity carried by a **fixed-width monospace type sigil** (`ORG` `BU`
  `DEP` `SEC`) rather than a coloured pill. Monospace because these align into
  a column and become scannable; coloured pills at four levels turns the screen
  into confetti.
- The spine is structural, not decorative — it encodes real depth. Do not draw
  it where depth isn't the point.

That's the whole aesthetic risk. Everything else stays quiet.

### 1.4 Typography and density

- Body and UI: whatever the app already uses. Don't change it.
- **Add one utility face: a monospace for codes, cost centres, and type
  sigils.** Org codes (`DIEZ`, `CORP-IT`, `CC-1042`) are identifiers that get
  compared and typed. Setting them in mono makes transposition errors visible.
  Use the existing Tailwind `font-mono` stack unless the theme defines one.
- Tree row height: compact. Target ~32px. These are dense lists, not cards.
- Numeric columns (descendant counts, depth) right-aligned and tabular.

### 1.5 Copy rules

- Name things as the administrator understands them: "Move department", not
  "Reparent node". "Reports to", not "ParentOrgUnitId".
- Actions keep their name through the whole flow. The button says "Move
  department" → the dialog header says "Move department" → the toast says
  "Department moved".
- Errors say what happened and what to do. Not "ORG_MOVE_CYCLE" — *"A
  department can't be moved into one of its own sections. Choose a different
  parent."*
- Empty states are invitations: *"No sections yet. Add one to organise this
  department's teams."*

---

## Part 2 — The hard problems

These are the parts that will be wrong if nobody thinks about them explicitly.

### 2.1 Scoped users see an orphaned fragment

A user scoped to a single Department sees that department and its sections —
**and no ancestors**. A naive tree renders either nothing or a subtree floating
with no root, which looks broken.

Handle it: when the visible set has no root node, render the scoped units as
top-level entries under a non-interactive header reading *"Your departments"*,
with a quiet one-line note explaining the view is limited to their assigned
scope. Never render a fake parent placeholder — that implies structure they
can't see and invites support tickets.

### 2.2 Move is the dangerous operation

Moving a unit rewrites the closure table for its entire subtree. The UI must
make the blast radius unmissable.

- **No drag-and-drop as the primary mechanism.** Drag is fine as an
  accelerator, but a mis-drop on a 500-node subtree is a genuinely bad
  afternoon. Primary path is an explicit "Move department" action opening a
  dialog.
- The dialog shows, before the confirm button is live: current parent → new
  parent, the **count of units that will move with it**, and a preview list of
  the first few descendants.
- Confirmation by typing the unit's code. Not a checkbox.
- If the backend returns `ORG_MOVE_BLOCKED_BUDGET`, don't show a generic
  error — show which budget commitments are blocking, with links.
- Optimistic UI is wrong here. Wait for the server.

### 2.3 Managers are temporal, not a single value

`OrgUnitManagers` is effective-dated: a unit has a head *as of a date*, plus
deputies and acting assignments. Rendering it as one "Head: Ahmed" field
discards the model.

Use a horizontal timeline (reuse `components/oms/Timeline`) showing assignment
periods, with today marked. Assigning a new primary head auto-ends the previous
one — the UI must show that consequence in the dialog *before* confirming,
because it's a second mutation the user didn't explicitly ask for.

### 2.4 Tree at 5,000 nodes

- Lazy-load children via `/units/:id/children`. Never fetch the whole tree.
- Virtualise the rendered list once expanded nodes exceed ~200 rows.
- Persist expansion state per user (session storage is fine) so navigating to a
  detail page and back doesn't collapse everything.
- Deep-link: `?node=<id>` should expand the path to that node and scroll it
  into view. Use `/units/:id/ancestors` to know what to expand.
- Search inside the tree filters server-side and shows matches **with their
  ancestor path**, not as a flat list — otherwise results are unidentifiable
  when three departments are all called "Operations".

### 2.5 Bilingual, mixed direction

Arabic unit names sit alongside English ones in the same table. Set `dir="rtl"`
and `lang="ar"` on the Arabic text node only — not the row, not the container.
A row that flips direction wholesale will scramble the spine, the sigil column,
and the action menu.

### 2.6 Permission-driven affordances

Hide actions the user can't perform; don't render them disabled. A disabled
"Delete" invites a support ticket asking why. The exception is when absence
would be confusing — then disable *with* a tooltip explaining the requirement.

Gate on permission via `can()`, never role name.

### 2.7 The states nobody builds

Each of these needs a designed state, not a spinner:

| Surface | Loading | Empty | Error | Denied |
| :--- | :--- | :--- | :--- | :--- |
| Tree | Skeleton rows at correct indent | "Your departments" fragment or first-run prompt | Retry with reason | — |
| Children tab | Skeleton | "No sections yet" + add action | Retry | — |
| Managers | Skeleton timeline | "No head assigned" + assign action | Retry | Hide assign |
| Detail | Skeleton | — | Retry | 404 page (scope) |
| Move dialog | Disabled confirm + spinner | — | Inline, specific | — |

Note the scope case resolves to **404**, per §9.3 of the domain spec. The UI
must render a genuine not-found, not "access denied" — a 403 confirms the unit
exists.

---

## Part 3 — Screen decisions

### 3.1 `/app/administration/master-data/organization` — the main screen

Two-pane on desktop, stacked on mobile.

```
┌────────────────────────┬──────────────────────────────────────────┐
│ SEARCH                 │ DIEZ › Corporate Services › IT           │
│ ─────────────────────  │                                          │
│ ▾ DIEZ            ORG  │  Information Technology         DEP      │
│   ▾ Corporate…    BU   │  تقنية المعلومات                          │
│     │ ▸ Finance   DEP  │  ─────────────────────────────────────   │
│     │ ▾ IT        DEP  │  Overview │ Sections │ People │ History  │
│     │   │ Infra   SEC  │                                          │
│     │   │ AppDev  SEC  │  Code          IT                        │
│   ▸ Free Zones    BU   │  Reports to    Corporate Services        │
│                        │  Cost centre   CC-1042                   │
│ 5,012 units            │  Head          Ahmed Al Mansouri          │
└────────────────────────┴──────────────────────────────────────────┘
```

- Left pane: tree, search, unit count. Fixed width, independently scrollable.
- Right pane: detail with tabs. Breadcrumb at top is clickable at every level.
- Mobile: tree is the screen; tapping a unit pushes detail as a full route.
  Back returns with expansion state intact.
- The spine (`│`) is the vertical rules from §1.3. Sigils right-aligned in a
  fixed column.

Tab naming: **"Sections"** not "Children" — but the label must be dynamic to
the child type (a BU's tab says "Departments"). **"People"** not "Managers" —
it holds heads, deputies, and acting assignments.

### 3.2 Unit detail tabs

**Overview** — a definition list, not a form. Editing opens a dialog or a
distinct edit mode. Read is the default because these records are read far more
than written.

**Sections / Departments** — `DataTable` with code, name, type sigil, head,
descendant count, status. Row click navigates. Inline "Add" respects hierarchy
rules from `/unit-types/:id/allowed-parents`.

**People** — the timeline from §2.3.

**History** — `org.OrgUnitChangeLog`, reverse chronological. Moves show
old parent → new parent and affected count. This is the forensic view; make it
readable, not pretty.

### 3.3 The flat list screens

`/business-units`, `/departments`, `/sections` are filtered `DataTable` views
of the same data — useful when someone knows the name but not the location.
Each row shows its **full ancestor path** as secondary text. That path is the
entire reason these screens exist.

### 3.4 `OrgUnitPicker` — build this properly

Budget and Requisition will both consume it. Requirements:

- Searchable, lazy, keyboard-navigable.
- Constrainable by type (`allowedTypes`), by "must allow budget"
  (`requiresBudgetCapability`), and by subtree (`rootId`).
- Shows the ancestor path on every option — non-negotiable, given duplicate
  names across departments.
- Returns the full unit object, not just an ID, so consumers don't re-fetch.
- Respects scope automatically; never shows units the caller can't see.

Get this right once. Two domains depend on it.

---

## Part 4 — Prompt sequence

Run in order in Claude Code, from the `oms-prod-dev` repo.

---

### Prompt U1 — Audit what exists

```
Read docs/DOMAIN-2-ORGANIZATION-UI.md and CLAUDE.md.

Audit the current state of the Organization Structure UI. Report only — write
no code in this task.

1. List every file currently implementing the org screens, with a one-line
   description of each.
2. For each of the seven "hard problems" in Part 2 of the UI doc, state whether
   the current implementation handles it, partially handles it, or ignores it.
   Give file and line evidence.
3. List which components from components/oms/ and components/ui/ are currently
   used, and which the UI doc expects that are missing.
4. Check the tree component specifically: does it lazy-load, virtualise, persist
   expansion state, and support deep-linking? Answer each separately.
5. Identify anywhere permission gating uses a role name instead of can().
6. Identify anywhere dir="rtl" is applied to a container rather than to the
   Arabic text node itself.
7. List all loading, empty, error, and denied states that are missing or are
   just a bare spinner.

Output as a checklist I can work through, ordered by user impact.
```

🛑 Read this yourself. It determines how much of what follows is build vs fix.

---

### Prompt U2 — Design tokens and the spine primitive

```
Implement the shared visual foundation from Part 1 of the UI doc, before
touching any screen.

1. Check the existing theme (globals.css / tailwind config) and report what
   tokens already exist. Do NOT introduce a new palette — work within the
   current CSS variables. If a needed token is missing, add it to the theme,
   never a hardcoded hex in a component.

2. Build components/oms/org/OrgTypeSigil.tsx — the fixed-width monospace type
   indicator (ORG / BU / DEP / SEC). Not a coloured pill. Must align into a
   column across rows. Include an accessible label.

3. Build components/oms/org/HierarchySpine.tsx — renders N vertical rules for
   depth, with correct last-child elbow handling. This is used identically by
   the tree, the picker, and the move dialog, so its API must be
   presentation-only: it takes depth, isLast, and hasChildren. No data
   fetching, no business logic.

4. Build components/oms/org/OrgBreadcrumb.tsx — variable-depth, every level
   clickable, truncating intelligently in the middle when deep rather than at
   the end. The last two levels must always be visible.

5. Build components/oms/org/UnitPath.tsx — inline ancestor path for use as
   secondary text in flat lists and picker options.

Requirements for all: responsive to mobile, visible keyboard focus, respects
prefers-reduced-motion, works in both light and dark theme. Write a small
Storybook-style demo route or test page so I can view all four in isolation.
```

✅ Commit: `feat(org-ui): add hierarchy spine and shared org primitives`

---

### Prompt U3 — The tree

```
Rebuild or refine the org tree component against Part 2.1, 2.4, 2.5, 2.7 and
Part 3.1 of the UI doc.

Required behaviours, each individually verifiable:
- Lazy-loads children via /units/:id/children. Never fetches the whole tree.
- Virtualises once expanded rows exceed 200.
- Persists expansion state per user across navigation.
- Deep-link support: ?node=<id> expands the ancestor path (via
  /units/:id/ancestors) and scrolls the node into view.
- Server-side search; results render WITH their ancestor path, not flat.
- Full keyboard navigation: arrows to move and expand/collapse, Enter to
  select, Home/End. Follow the WAI-ARIA treeview pattern including
  aria-expanded, aria-level, aria-setsize, aria-posinset.
- Handles the scoped-fragment case from Part 2.1: when the visible set has no
  root, render scoped units as top-level under a "Your departments" header with
  a one-line scope note. Do NOT render a placeholder parent.
- Skeleton rows at correct indent while loading, not a centred spinner.
- Arabic names: dir="rtl" lang="ar" on the text node only, never the row.

Use HierarchySpine and OrgTypeSigil from the previous task. Row height ~32px.

Test with the 5,000-unit perf seed and report render performance for: initial
load, expanding a 200-child node, and searching.
```

🛑 Test the scoped-user case manually. Log in as a department-scoped user and
confirm the tree looks intentional, not broken.

✅ Commit: `feat(org-ui): rebuild org tree with lazy loading and a11y`

---

### Prompt U4 — Detail screen and tabs

```
Implement the unit detail screen per Part 3.1 and 3.2 of the UI doc.

- Two-pane desktop layout, stacked mobile with detail as a pushed route.
  Back must preserve tree expansion state.
- Overview tab is a read-first definition list, not a live form. Editing opens
  a dialog.
- Child tab label is DYNAMIC to the child type: "Departments" under a BU,
  "Sections" under a department. Use /unit-types/:id/allowed-parents to derive.
- People tab per Part 2.3 — reuse components/oms/Timeline. Show assignment
  periods with today marked.
- History tab renders org.OrgUnitChangeLog reverse-chronologically. MOVED
  entries must show old parent → new parent and affected unit count.
- Every state in the Part 2.7 table implemented. Scope denial renders a genuine
  404 page, not "access denied" — a 403 would confirm the unit exists.
- Copy follows Part 1.5: "Reports to" not "Parent", "Move department" not
  "Reparent".

Gate every action with can(). Hide unavailable actions rather than disabling,
except where absence is confusing — then disable with an explanatory tooltip.
```

✅ Commit: `feat(org-ui): implement unit detail screen`

---

### Prompt U5 — Move and delete 🔴

```
This covers the destructive operations. Plan first and show me the plan before
writing code.

Implement MoveUnitDialog and the delete flow per Part 2.2 of the UI doc.

Move dialog requirements:
- Explicit action, not drag-and-drop. (Drag may be added later as an
  accelerator; it is not the primary path.)
- New parent chosen via OrgUnitPicker, constrained to types valid under the
  hierarchy rules for this unit's type.
- Before the confirm button becomes active, display: current parent → new
  parent, the count of units moving with it, and a preview of the first five
  descendants.
- Confirmation by typing the unit's code exactly. Not a checkbox.
- Sends rowVersion. On 409 ORG_CONCURRENCY_CONFLICT, show "This department was
  changed by someone else. Reload and try again." with a reload action.
- On ORG_MOVE_CYCLE: "A department can't be moved into one of its own
  sections. Choose a different parent."
- On ORG_MOVE_BLOCKED_BUDGET: list the blocking commitments with links, not a
  generic error.
- No optimistic UI. Wait for the server. Show progress — a large subtree move
  can take seconds.
- On success, invalidate the tree, the moved node, and all ancestors of BOTH
  old and new parents.

Delete flow: same confirmation rigour, showing descendant count and the
specific blocking reason on 409 (ORG_HAS_CHILDREN, ORG_HAS_ASSIGNED_USERS,
ORG_REFERENCED, ORG_ROOT_PROTECTED) — each with its own actionable message.

In your plan, state explicitly how you will handle a move that takes longer
than 5 seconds.
```

🛑 Read the plan. Then test a move on the perf-seeded data and confirm the
count shown matches what actually moved.

✅ Commit: `feat(org-ui): implement move and delete flows`

---

### Prompt U6 — OrgUnitPicker

```
Build components/oms/org/OrgUnitPicker.tsx to the spec in Part 3.4 of the UI
doc. Treat this as a shared component, not an org-module component — Budget
(Domain 4) and Requisition (Domain 5) will both consume it.

API:
  allowedTypes?: OrgUnitTypeCode[]
  requiresBudgetCapability?: boolean
  rootId?: string
  value / onChange returning the full unit object, not just an ID
  disabled, placeholder, error

Behaviour:
- Searchable, server-side, debounced 500ms (rate limit tier 5).
- Lazy tree browse mode AND flat search mode, toggleable.
- Every option shows its ancestor path via UnitPath — mandatory, because unit
  names duplicate across departments.
- Full keyboard support, correct combobox ARIA.
- Respects scope automatically; never surfaces units outside the caller's
  visible set.
- Uses HierarchySpine in browse mode.

Write it with its own tests. Document its props in a JSDoc block stating that
Domains 4 and 5 depend on this contract.
```

✅ Commit: `feat(org-ui): add reusable OrgUnitPicker`

---

### Prompt U7 — Managers and assignment

```
Implement ManagerAssignmentPanel per Part 2.3 of the UI doc.

- Horizontal timeline of assignment periods using components/oms/Timeline,
  with today marked and role (HEAD / DEPUTY / ACTING) distinguished.
- Assigning a new primary head auto-ends the current one. The dialog MUST show
  this consequence before confirming — name the person being ended and the date
  their assignment closes. The user did not explicitly ask for that second
  mutation; do not let it happen silently.
- Overlap errors (ORG_MANAGER_PERIOD_OVERLAP) render inline against the date
  field, not as a toast.
- Rejecting a vendor user (ORG_MANAGER_INVALID_USER) explains why: "Only
  internal staff can be assigned as a department head."
- Empty state: "No head assigned" with an assign action, gated on
  ORG.MANAGER.ASSIGN.
- User selection must exclude vendor users at the query level, not just
  validate after selection.
```

✅ Commit: `feat(org-ui): implement manager assignment timeline`

---

### Prompt U8 — Flat list screens

```
Implement the three flat list screens per Part 3.3: /business-units,
/departments, /sections.

Each is a filtered DataTable over org units of that type. Every row must show
its full ancestor path as secondary text via UnitPath — that path is the entire
reason these screens exist alongside the tree.

Columns: code (mono), name, Arabic name, ancestor path, head, descendant count
(right-aligned tabular), status badge, actions.

- Server-side pagination, sorting, filtering using the Step 0 framework.
- Filters: by parent unit (OrgUnitPicker), by status, by whether a head is
  assigned.
- Row click navigates to the unit detail screen.
- Export action gated on ORG.EXPORT, rate limit tier 7.
- Reuse DataTable and StatusBadge from components/oms/.
```

✅ Commit: `feat(org-ui): add flat organization list screens`

---

### Prompt U9 — Quality pass

```
Final quality pass across every Organization screen. Fix what you find; report
what you fix.

1. Accessibility: run through the tree with keyboard only and confirm the
   WAI-ARIA treeview pattern is complete. Verify focus is visible everywhere,
   dialogs trap focus and restore it on close, and every icon-only button has
   an accessible name.
2. Responsive: check every screen at 375px, 768px, 1024px, 1440px. The tree
   and detail split must degrade sensibly, not overflow.
3. Theme: verify every screen in both light and dark. Look specifically for
   hardcoded colours that break in dark mode.
4. RTL: confirm dir="rtl" is applied to Arabic text nodes only, never to rows
   or containers. Verify the spine and sigil column do not flip.
5. Motion: confirm prefers-reduced-motion is respected. Remove any animation
   that does not serve comprehension — expand/collapse and dialog entry are
   justified; decorative transitions are not.
6. Copy: audit every string against Part 1.5. Flag anything naming a system
   concept instead of a user concept, any passive-voice button, and any action
   whose name changes between button, dialog, and toast.
7. Permissions: confirm every action is gated with can() and none with a role
   name.
8. Error handling: confirm every backend error code from the domain spec maps
   to a specific, actionable message — no generic fallbacks on the paths users
   will actually hit.

Report as a table: issue | severity | file | fixed yes/no.
```

🛑 Final gate.

✅ Commit: `polish(org-ui): accessibility, responsive, and copy pass`

---

## Part 5 — What to check yourself

Claude Code will report these as done. Verify three by hand:

1. **The scoped fragment.** Log in as a department-scoped user. Does the tree
   look deliberate, or does it look broken? This is the one most likely to be
   technically correct and experientially wrong.
2. **A real move.** On the 5,000-unit seed, move a mid-tree department. Does
   the count in the dialog match what actually moved? Run the §6.3 integrity
   check after.
3. **Keyboard-only tree navigation.** Unplug the mouse. If you can't reach and
   expand a depth-3 section, the ARIA pattern is incomplete regardless of what
   the audit says.
