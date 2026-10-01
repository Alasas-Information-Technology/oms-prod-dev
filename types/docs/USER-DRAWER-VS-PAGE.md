# User Module — Drawer and Detail Page

Resolves the relationship between the slide-over drawer and the route-based
detail page.

**Supersedes** Part 1, Part 3.3, Part 3.7 and Part 4 of
`DOMAIN-3-USER-ADMIN-UI.md`. Everything else in that document stands.

---

## Part 1 — The rule

> **The drawer is a peek. The page is the workspace.**

| | Drawer | Detail page |
| :--- | :--- | :--- |
| Purpose | See who this is, act on the obvious | Change anything consequential |
| Opens from | Clicking a list row | The drawer, or a direct link |
| Editing | Three immediate actions only | Everything |
| Save model | Immediate, with confirmation | Staged, with Save / Cancel |
| Tabs | None | Yes |
| Closes on | Escape, ✕, clicking another row | Navigating away |

Anything requiring more than one decision belongs on the page.

---

## Part 2 — What goes where

### Drawer

| Element | Behaviour |
| :--- | :--- |
| Identity header | Avatar, name, email, role and status badges |
| **Turn access on / off** | Toggle → confirm → applies immediately |
| **Unlock** | Shown only when locked. Button → applies immediately |
| **Resend invitation** | Shown only when invited. Button → applies immediately |
| Summary cards ×4 | **Read-only.** Every one navigates to its tab |
| Open full profile | Primary button → page, Overview tab |

Three actions, all single-click, all reversible or harmless. Nothing else.

### Detail page

| Tab | Contains |
| :--- | :--- |
| **Overview** | Profile fields, department, employment details. Editable |
| **Roles** | Assign and remove roles, effective dating |
| **Access** | Scope level and org unit, with the live count |
| **What they can do** | The permissions audit view |
| **Standing in** | Delegations, both directions |
| **Activity** | Sign-in history and change log |

Everything staged, committed with Save / Cancel per tab.

### Moved off the drawer

These were in the drawer spec and now live on the page:

- Roles section (was §3.5)
- What they can see (was §3.6)
- Standing in for someone (was §3.8)
- The Save / Cancel footer and dirty-state guard (was Part 4)

**"What they can do" is no longer a modal.** It was a modal only because the
drawer had no tabs. It's now the Permissions tab, which is better — linkable,
back-button friendly, and printable for auditors.

Two actions from the old §3.4 also move to the page, under Overview, because
both warrant more context than a drawer gives:

- Ask them to set a new password
- Sign them out everywhere

---

## Part 3 — Navigation

### URLs

| State | URL |
| :--- | :--- |
| List | `/app/administration/users` |
| List, drawer open | `/app/administration/users?selected={id}` |
| Detail page | `/app/administration/users/{id}?tab=overview` |

Putting the drawer in a query parameter means the back button closes it and the
state is shareable. Both currently fail if the drawer is component state.

Keep `?tab=` as a query parameter — it already exists and converting to route
segments is churn for no user-visible gain.

### The bug being fixed

All four summary cards navigate. Currently only one does.

| Card | Destination |
| :--- | :--- |
| Roles | `?tab=roles` |
| What they can see | `?tab=access` |
| What they can do | `?tab=permissions` |
| Last signed in | `?tab=activity` |
| Open full profile | `?tab=overview` |

Each card shows a chevron and behaves as a link — hover state, `Cmd`-click
opens a new tab, focusable, `Enter` activates.

### Transitions

**List → drawer.** Row click sets `?selected={id}`. Row stays highlighted.
List remains scrollable and interactive.

**Drawer → page.** Any card or the primary button. Drawer closes, full
navigation.

**Page → list.** Breadcrumb "Users", or browser back. **Returns to
`?selected={id}` with the drawer open and the row highlighted** — not to a bare
list. Losing your place after editing one person out of two hundred is the
thing that makes admin tools tiring.

**Below 1024px:** skip the drawer entirely. Row click goes straight to the
page. A 520px drawer on a narrow screen is worse than the page.

---

## Part 4 — Drawer, revised

```
┌──────────────────────────────────────┐
│  Person details                   ✕  │
│ ──────────────────────────────────── │
│  ⬤  Ahmed Al Mansouri                │
│      ahmed@diez.ae                   │
│      [Head of Department] [Active]   │
│ ──────────────────────────────────── │
│  Account active              [ ◉ ]   │
│ ──────────────────────────────────── │
│  Roles                      2   ›    │
│  What they can see    47 depts  ›    │
│  What they can do    34 things  ›    │
│  Last signed in       2h ago    ›    │
│ ──────────────────────────────────── │
│        [ Open full profile ]         │
└──────────────────────────────────────┘
```

- No footer. No Save. No dirty state. Nothing here is staged.
- Toggling access opens a confirmation, then applies immediately and refreshes
  the row in the list behind.
- When locked, a red-tinted row appears above the cards with the reason and an
  Unlock button.
- When invited, a blue-tinted row appears with "Sent 3 days ago" and Resend.
- Width 520px. Escape closes.

Removing the footer is the point. A drawer with a Save button implies you can
do everything from it, which is what created the confusion.

---

## Part 5 — Detail page

### Header

Per `APP-SHELL-SPEC.md`, the breadcrumb is the page title:

```
Administration / Users / Ahmed Al Mansouri        [⋯]  [Save changes]
```

Below it, an identity block mirroring the drawer header — avatar, name, email,
badges — so arriving from a direct link gives the same orientation the drawer
did.

Then underline tabs, per the shell spec. Not pills.

### Save model

- Save is per tab. Editing Roles and switching to Access with unsaved changes
  prompts: *"Save your changes to roles first?"* → Save / Discard / Stay.
- The Save button lives in the page bar and appears only when something has
  changed.
- Dangerous changes confirm on save, listing them.
- After saving, refetch and show a brief inline confirmation.

### Prev / next

Small `‹ ›` controls beside the breadcrumb, moving through the filtered list in
its current order, with "3 of 24". Administrators frequently work through a
filtered set — "everyone with no role" — one person at a time.

Skip this if it complicates state management; it's a convenience, not a
requirement.

---

## Part 6 — Prompts

### P1 — Navigation model

```
Read docs/USER-DRAWER-VS-PAGE.md, then CLAUDE.md and
docs/DOMAIN-3-USER-ADMIN-UI.md.

Fix the drawer / detail page relationship. Navigation only in this task — do
not move content yet.

1. Drawer open state moves into a query parameter: ?selected={id} on
   /app/administration/users. It is currently component state, which means the
   back button doesn't close it and the state isn't shareable. Both must work.
2. Make ALL FOUR summary cards navigate, per the Part 3 table. Currently only
   "What they can do" does — that inconsistency is the reported bug.
   Roles → ?tab=roles
   What they can see → ?tab=access
   What they can do → ?tab=permissions
   Last signed in → ?tab=activity
3. Each card must behave as a real link: chevron, hover state, focusable,
   Enter activates, Cmd-click opens a new tab.
4. Add an "Open full profile" primary button at the bottom of the drawer going
   to ?tab=overview.
5. Returning from the detail page to the list — via breadcrumb or browser back
   — must restore ?selected={id} with the drawer open and the row highlighted.
   Not a bare list.
6. Below 1024px, skip the drawer entirely: a row click navigates straight to
   the detail page.

Verify: browser back closes the drawer; a ?selected= URL opens it; every card
lands on the right tab; returning from the page restores the drawer.
```

✅ `fix(users-ui): unify drawer and detail page navigation`

---

### P2 — Strip the drawer

```
Reduce the drawer to a peek, per Part 1, 2 and 4.

REMOVE from the drawer — these move to the detail page:
- Roles section
- What they can see section
- Standing in for someone section
- The Save / Cancel footer and the dirty-state guard
- "Ask them to set a new password"
- "Sign them out everywhere"

KEEP in the drawer:
- Identity header
- Account active toggle — confirm, then apply IMMEDIATELY. No staging.
- Unlock button, shown only when locked, with the reason
- Resend invitation, shown only when invited, with when it was sent
- The four read-only summary cards
- Open full profile

The drawer must have NO footer and NO dirty state after this task. Nothing in
it is staged; every action applies on confirm and refreshes the list row
behind.

Layout per the Part 4 diagram. 520px, Escape closes.
```

✅ `refactor(users-ui): reduce drawer to quick actions`

---

### P3 — Detail page

```
Build out the detail page to hold everything removed from the drawer.

1. Header per Part 5: breadcrumb as page title (see APP-SHELL-SPEC.md), then an
   identity block mirroring the drawer header so a direct link gives the same
   orientation.
2. Underline tabs per APP-SHELL-SPEC.md, not pills: Overview, Roles, Access,
   What they can do, Standing in, Activity.
3. Move in the sections removed in P2, keeping their existing specs from
   DOMAIN-3-USER-ADMIN-UI.md:
   - Roles → Roles tab (spec §3.5)
   - What they can see → Access tab (spec §3.6, including the live "This gives
     access to 47 departments" count)
   - Standing in → Standing in tab (spec §3.8)
   - Password reset and sign-out-everywhere → Overview tab
4. "What they can do" becomes the Permissions TAB, not a modal. It was only a
   modal because the drawer had no tabs. Keep every requirement from spec §3.7
   — plain-language permission names, full source attribution, blocked
   permissions section, search, source filter, print-friendly.
5. Save model per Part 5: per tab, Save button in the page bar appearing only
   when something changed. Switching tabs with unsaved changes prompts Save /
   Discard / Stay.
6. Dangerous changes confirm on save, listing what will change.
7. Every tab handles deep linking — ?tab=permissions must load that tab
   directly.
8. Out-of-scope user renders a genuine not-found, not "access denied".

Vocabulary rules from DOMAIN-3-USER-ADMIN-UI.md Part 2 apply throughout.
```

✅ `feat(users-ui): build out user detail page tabs`

---

### P4 — Verify

```
Verify the drawer and detail page. Report: check | expected | actual | pass.

1. Row click opens the drawer and sets ?selected={id}.
2. Browser back closes the drawer.
3. Pasting a ?selected={id} URL opens the drawer on that person.
4. All four summary cards navigate to their correct tab.
5. Cmd-click on a card opens a new tab.
6. Every card is keyboard-focusable and activates on Enter.
7. The drawer has NO footer and NO Save button.
8. Toggling access from the drawer applies immediately and updates the list row
   behind it.
9. Returning from the detail page restores the drawer and the row highlight.
10. Every ?tab= value deep-links correctly.
11. Switching tabs with unsaved changes prompts.
12. Below 1024px, a row click skips the drawer and goes to the page.
13. No section appears in both the drawer and the page.
14. Keyboard-only: list → drawer → card → page tab → edit → save.
15. Light and dark theme.
```

🛑 Final gate.
