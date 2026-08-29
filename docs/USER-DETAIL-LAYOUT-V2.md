# User Detail Page — Layout v2

Restructures `/app/administration/users/{id}` into a sticky profile card with
vertical navigation, plus a stacked-card content column.

**Supersedes Part 5 of `USER-DRAWER-VS-PAGE.md`.** The drawer-versus-page split
is unchanged — this is only the page layout.

---

## Part 1 — Structure

```
Administration / Users / Ahmed Al Mansouri              [⋯]  [Save changes]
──────────────────────────────────────────────────────────────────────────
┌──────────────────────┐  ┌────────────────────────────────────────────┐
│ ░░░░ status tint ░░░░ │  │ Recent activity            See all  ›      │
│         ⬤             │  │ ────────────────────────────────────────── │
│                       │  │ 4 Aug   Signed in                          │
│  Ahmed Al Mansouri    │  │ 2 Aug   Role added — Head of Department    │
│  Head of IT · Digital │  │ 1 Aug   Access scope changed               │
│  ✉  ⧉  ⋯              │  └────────────────────────────────────────────┘
│ ───────────────────── │
│  ▸ Overview           │  ┌────────────────────────────────────────────┐
│  ▸ Roles          2   │  │ Account                                    │
│  ▸ Access        47   │  │ ────────────────────────────────────────── │
│  ▪ What they can do 34│  │ Status              Active                 │
│  ▸ Standing in    1   │  │ Last signed in      2 hours ago            │
│  ▸ Activity           │  │ Invitation          Accepted 12 Jan 2026   │
│ ───────────────────── │  └────────────────────────────────────────────┘
│  ahmed@diez.ae        │
│  EMP-2841             │  ┌────────────────────────────────────────────┐
│  Digital Security     │  │ Details                                    │
│                       │  │ ────────────────────────────────────────── │
│  [HOD] [Finance]      │  │ …                                          │
│                       │  └────────────────────────────────────────────┘
│ [Reset password]      │
│ [Sign out everywhere] │
└──────────────────────┘
        340px                              1fr
```

- Grid `340px 1fr`, 24px gap.
- Left card **sticky**, 24px from the top of the content region.
- Right column scrolls independently.
- Below 1100px the left card becomes a horizontal header and the vertical nav
  becomes a scrollable tab row.

---

## Part 2 — The left card

### 2.1 Status band

The reference uses a decorative colour block. Ours **encodes status**, which is
what earns it the space:

| Status | Band |
| :--- | :--- |
| Active | `--bg-success` at low opacity |
| Hasn't signed in yet | `--bg-info` at low opacity |
| Locked out | `--bg-danger` at low opacity |
| Access turned off | `--fill-ghost` |

- Height **120px**. The reference's ~230px is a social-app proportion; this is
  an admin tool.
- Subtle gradient, low saturation. It should read as a tint, not a banner.
- No text on it — the status badge sits below with the name.

### 2.2 Identity

- Avatar **96px**, centred, overlapping the band by 48px, 4px card-coloured
  ring, initials fallback.
- Status dot on the avatar, bottom-right, matching the band.
- Name **22px/600**, centred, 16px below the avatar.
- Beneath: job title · department, 14px muted, one line, truncating.
- Status badge below that.

### 2.3 Quick actions

Three 32px icon buttons, centred, replacing the reference's social row:

| Icon | Action |
| :--- | :--- |
| ✉ | Open mail client |
| ⧉ | Copy email address |
| ⋯ | Menu: turn off access, remove |

Destructive items live only in the `⋯` menu, never as visible buttons.

### 2.4 Vertical navigation

Replaces the horizontal tabs. Six entries with counts where meaningful:

| Item | Count |
| :--- | :--- |
| Overview | — |
| Roles | number assigned |
| Access | departments visible |
| What they can do | permissions |
| Standing in | active delegations |
| Activity | — |

- Row height **40px**, 14px label, count right-aligned in `--text-muted` with
  `tabular-nums`.
- Active: tinted background, **2px accent bar on the left edge**, primary text.
- Counts absent rather than zero — a "0" reads as broken; nothing reads as
  nothing to show.

### 2.5 Key facts

Below the nav, separated by a hairline: email, employee ID, department. 13px,
label above value or in a `100px 1fr` grid. Email and employee ID in mono.

### 2.6 Role chips

Role names as chips, wrapping. Each with its plain-language explanation on
hover. If none: *"No roles yet"* in muted text, with the amber dot — a person
who can sign in but do nothing is worth flagging here too.

### 2.7 Footer actions

Two full-width ghost buttons, stacked, 8px apart:

- **Reset password** — sends a reset email
- **Sign out everywhere** — with the active session count

Both frequent, neither destructive. Save lives in the page bar per
`APP-SHELL-SPEC.md`; do not duplicate it here.

---

## Part 3 — The right column

### 3.1 Card primitive

Every card in this column shares one structure:

```
┌──────────────────────────────────────────┐
│ Card title                    See all  › │   56px header
│ ──────────────────────────────────────── │   hairline
│ Row                                      │   56px rows
│ Row                                      │
└──────────────────────────────────────────┘
```

- White, 12px radius, 0.5px border, no shadow at rest.
- Header title 15px/600. Optional right-aligned link, 13px accent.
- Rows separated by hairlines, not borders.
- 24px between cards.
- Empty state lives inside the card, never replaces it.

Build this once as `UserPanelCard` and use it for every card below.

### 3.2 What each nav item shows

| Nav item | Cards |
| :--- | :--- |
| **Overview** | Recent activity · Account · Details |
| **Roles** | Assigned roles · Available roles |
| **Access** | What they can see · Departments included |
| **What they can do** | One card per module — see 3.3 |
| **Standing in** | Standing in for others · Others standing in for them |
| **Activity** | Sign-in history · Changes |

### 3.3 What they can do — one card per module

This layout suits the permissions view better than a single long list. One card
per area: Requests, Budget, Candidates, Vendors, Administration.

Each row: the permission in plain words, and its source on the right —
*"From their Head of Department role"*. Blocked permissions in a final card,
struck through, with reasons.

Requirements from `DOMAIN-3-USER-ADMIN-UI.md` §3.7 still apply in full: plain
language throughout, no raw permission codes, full source attribution,
searchable, print-friendly.

### 3.4 Routing

Nav selection stays in `?tab=`, unchanged. Deep links keep working. Returning
to the list still restores `?selected={id}`.

Add: the active nav item scrolls into view on load when the card is scrolled.

---

## Part 4 — Save

Unchanged from `USER-DRAWER-VS-PAGE.md`:

- Save per tab, in the page bar, appearing only when something changed.
- Switching nav items with unsaved changes prompts Save / Discard / Stay.
- The left card is never part of the dirty state — nothing in it is staged.

---

## Part 5 — Prompts

### R1 — Layout and profile card

```
Read docs/USER-DETAIL-LAYOUT-V2.md, then CLAUDE.md, USER-DRAWER-VS-PAGE.md and
DOMAIN-3-USER-ADMIN-UI.md.

Restructure /app/administration/users/{id} per Part 1 and Part 2. Replace the
horizontal underline tabs with the sticky profile card and vertical navigation.

1. Grid 340px 1fr, 24px gap. Left card sticky 24px from the top of the content
   region. Right column scrolls independently.
2. Status band per 2.1: 120px, subtle low-opacity gradient using the existing
   status tokens, encoding the four states. No text on it. Not the reference's
   230px — this is an admin tool, not a social app.
3. Avatar 96px, centred, overlapping the band by 48px, 4px card-coloured ring,
   initials fallback, status dot bottom-right.
4. Name 22px/600 centred; job title · department 14px muted beneath, truncating
   on one line; status badge below.
5. Three 32px quick-action icon buttons per 2.3: open mail, copy email, and a ⋯
   menu holding turn-off-access and remove. Destructive items ONLY in the menu.
6. Key facts, role chips, and the two footer ghost buttons per 2.5–2.7. No Save
   button in this card — Save lives in the page bar.
7. Below 1100px the card becomes a horizontal header and the nav becomes a
   scrollable tab row.

Keep every existing string and permission gate. This is a layout change, not a
content change.
```

✅ `refactor(users-ui): restructure detail page layout`

---

### R2 — Vertical navigation

```
Build the vertical nav per Part 2.4 and 3.4.

1. Six items: Overview, Roles, Access, What they can do, Standing in, Activity.
2. Counts right-aligned in --text-muted with tabular-nums. A count is ABSENT
   when zero, never rendered as "0" — zero reads as broken, nothing reads as
   nothing to show.
3. Row height 40px, label 14px.
4. Active state: tinted background, 2px accent bar on the LEFT edge, primary
   text.
5. Selection continues to use ?tab= — deep links must keep working unchanged.
6. Keyboard: arrows move between items, Enter selects. Correct ARIA for a
   vertical tab list.
7. Unsaved changes prompt on switching, per Part 4.
8. Below 1100px this becomes a horizontal scrollable tab row with the same
   counts.

Remove the old horizontal underline tabs from this page entirely.
```

✅ `feat(users-ui): add vertical detail navigation`

---

### R3 — Card primitive and Overview

```
Build the right column card system per Part 3.1, then the Overview content.

1. components/oms/users/UserPanelCard.tsx — the shared card from 3.1: 56px
   header with a 15px/600 title and optional right-aligned "See all ›" link, a
   hairline, then rows. White, 12px radius, 0.5px border, no shadow. 24px
   between cards. Empty state renders INSIDE the card, never replacing it.
   Every card in this column uses it.

2. Overview shows three cards:
   - Recent activity — last 5 events, date and plain-language description,
     "See all" linking to the Activity tab
   - Account — status, last signed in, invitation state, lockout state if
     locked
   - Details — profile fields, editable

3. Rows 56px, hairline separated.
4. Dates as "4 Aug 2026" or relative for recent. Never ISO.
5. Every string per the DOMAIN-3-USER-ADMIN-UI.md Part 2 vocabulary table.
```

✅ `feat(users-ui): add panel card primitive and overview`

---

### R4 — Roles and Access

```
Move the Roles and Access content into the new card layout.

Roles — two cards:
- Assigned roles: current assignments with dates, remove action per row
- Available roles: roles not yet assigned, add action per row

Access — two cards:
- What they can see: scope level radios with plain explanations, plus
  OrgUnitPicker, plus the live "This gives access to 47 departments" count
- Departments included: the resolved list, read-only, collapsed beyond 10 with
  "show all"

Keep every rule from DOMAIN-3-USER-ADMIN-UI.md §3.5 and §3.6 — the plain
explanations per role, hiding scope levels broader than the viewer's own,
warnings on removing the last role, advanced dating collapsed behind "Set
dates".

Both tabs stage changes and commit via the page-bar Save.
```

✅ `feat(users-ui): move roles and access into card layout`

---

### R5 — What they can do

```
Rebuild the permissions view as stacked cards per Part 3.3 — one card per
module: Requests, Budget, Candidates, Vendors, Administration.

Each row: the permission in PLAIN WORDS on the left, its source on the right.
Sources phrased per DOMAIN-3-USER-ADMIN-UI.md §3.7:
- "From their Head of Department role"
- "From Head of Department, which includes Finance Approver"
- "Given directly by Sara Ahmed — 'Temporary for audit'. Ends 30 Sept"
- "While standing in for Ahmed Al Mansouri until 5 Sept"

A final card holds blocked permissions, struck through, with reasons.

Keep every §3.7 requirement: no raw permission codes anywhere on screen, search
across all cards, filter by source, read-only, print-friendly.

Module cards with no permissions are omitted entirely rather than rendered
empty — a Finance-only user should not see four empty cards.

This is the screen an auditor uses to answer "why can this person lock
budgets". The card grouping should make that easier to scan, not harder.
```

✅ `feat(users-ui): rebuild permissions view as module cards`

---

### R6 — Remaining tabs and quality

```
Move Standing in and Activity into the card layout, then run a quality pass.

Standing in — two cards: standing in for others, others standing in for them.
Keep §3.8 rules including the all-or-nothing warning if that is what the
backend shipped.

Activity — two cards: sign-in history, changes made to this person.

Quality pass, reporting issue | severity | file | fixed:
1. Left card stays sticky while the right column scrolls, at every viewport.
2. Status band renders the correct tint for all four states.
3. Counts absent rather than zero on every nav item.
4. Every ?tab= value deep-links correctly and the old horizontal tabs are gone.
5. Unsaved-changes prompt fires on nav switch, breadcrumb, and browser back.
6. Below 1100px the layout collapses correctly and the nav scrolls horizontally.
7. Keyboard: arrows through the nav, tab into cards, reach every action.
8. Light and dark theme — find hardcoded colours, especially in the status band
   gradient.
9. No raw permission codes, error codes, or database field names visible
   anywhere.
10. A view-only user sees a clean read-only page that looks deliberate.
11. Long values: a 60-character name, a 40-character job title, 8 role chips.
12. Arabic name renders with dir="rtl" lang="ar" on that text node only.
```

🛑 Final gate.
