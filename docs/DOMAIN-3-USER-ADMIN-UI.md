# Domain 3 — User Administration UI

Frontend spec for `oms-prod-dev`. Layout follows the list + slide-over pattern.

**Palette unchanged** — use the existing light theme tokens. Do not copy the
reference's dark treatment.

**Audience: non-technical.** HR staff and administrators, not engineers.

---

## Part 0 — Change from the backend spec

`DOMAIN-3-USER-ADMINISTRATION.md` §11 specified six tabs on the detail view:
Overview, Roles, Scope, Permissions, Delegations, Activity.

**Replaced by one scrolling panel with sections.** Tabs hide content behind
clicks people don't know to make. A scrolling panel shows everything that
matters and puts the two heavy views — the permissions audit and the activity
log — behind explicit "View all" links.

Backend contracts are unchanged.

---

## Part 1 — Structure

```
┌─────────────────────────────────────────┬──────────────────────────┐
│ People    Vendor users    Invite someone│  👤 Person details    ✕  │
│ ─────────────────────────────────────── │ ──────────────────────── │
│                                          │  ⬤  Ahmed Al Mansouri    │
│ [search]        [filters]                │     ahmed@diez.ae        │
│                                          │     [HOD] [Active]       │
│ Name        Email      Role     Last in  │                          │
│ ─────────────────────────────────────────│  ┌────────────────────┐  │
│ ⬤ Ahmed…    ahmed@…    HOD      2h ago   │  │ Roles          2 › │  │
│ ⬤ Sara…     sara@…     HR       Yesterday│  │ Can see       47 › │  │
│ ⬤ Omar…     omar@…     —        Never    │  │ Can do        34 › │  │
│ ⬤ Fatima…   fatima@…   Finance  3d ago   │  │ Last signed in   › │  │
│                                          │  └────────────────────┘  │
│                                          │                          │
│                                          │  ACCESS                  │
│ 24 people                                │  Account active    [ ◉]  │
└─────────────────────────────────────────┤                          │
                                           │  ROLES                   │
                                           │  ☑ Head of Department    │
                                           │  ☐ HR                    │
                                           │                          │
                                           │  WHAT THEY CAN SEE       │
                                           │  Department › IT         │
                                           │  47 departments          │
                                           ├──────────────────────────┤
                                           │  [Cancel] [Save changes] │
                                           └──────────────────────────┘
```

- Panel width **520px**, slides from the right, list stays visible and
  interactive behind it.
- Clicking another row swaps the panel content. **If there are unsaved changes,
  confirm first.**
- Sticky footer with Cancel / Save changes, only when something has changed.
- Panel scrolls; header and footer stay fixed.

### Tabs

Three tabs on the list, matching the reference:

| Tab | Contents |
| :--- | :--- |
| **People** | Internal staff |
| **Vendor users** | External vendor portal accounts, gated on `VENDORUSER.MANAGE` |
| **Invite someone** | Opens the guided invite flow inline in the list area |

Vendor users are a separate tab, never mixed into People — spec rule V9.

---

## Part 2 — Vocabulary

The single biggest factor in whether this feels usable.

| Never say | Say |
| :--- | :--- |
| Effective permissions | **What they can do** |
| Scope / organizational scope | **What they can see** |
| Deactivate | **Turn off access** |
| Soft delete / remove user | **Remove** |
| Permission override | **Special access** |
| Delegation | **Standing in for someone** |
| Invitation pending | **Hasn't signed in yet** |
| Account locked | **Locked out** |
| Force password change | **Ask them to set a new password** |
| Revoke sessions | **Sign them out everywhere** |
| Effective from / to | **Starts / Ends** |
| User type INTERNAL / VENDOR | **Staff / Vendor** |
| Assign role | **Give them a role** |

### Status — four plain states

| State | Label | Colour | Means |
| :--- | :--- | :--- | :--- |
| Active | **Active** | green | Normal |
| Invited | **Hasn't signed in yet** | blue | Invitation sent, not accepted |
| Locked | **Locked out** | red | Too many failed sign-ins |
| Inactive | **Access turned off** | neutral | Deactivated |

Every one of these needs a filter. "Locked out" and "Hasn't signed in yet" are
the two most common support questions.

### Copy rules

- Every role and scope option carries a one-line plain explanation. "Head of
  Department" means nothing on its own; *"Approves requests and locks budgets
  for their department"* does.
- Errors say what to do: not "USER_LAST_ADMIN" but *"You can't turn off the
  only administrator. Give someone else admin access first."*
- Counts read as sentences: *"Can see 47 departments"*, not `47`.

---

## Part 3 — Screens

### 3.1 People list

Columns: Name (avatar + name), Email, Role, Last signed in, Status.

- Multiple roles show the first plus "+2".
- No role shows a muted em dash **and an amber dot** — a person who can sign in
  but do nothing is a real problem worth surfacing.
- Last signed in as relative time ("2 hours ago", "Never").
- Row click opens the panel; the row highlights while open.
- Footer chip: "24 people".
- Filters: Status, Role, Department, and a "No role" toggle.
- Search matches name, email, and employee ID.

### 3.2 Panel header

```
⬤  Ahmed Al Mansouri
    ahmed@diez.ae
    [Head of Department]  [Active]
```

Avatar 56px with initials fallback. Name 20px/600. Badges inline.

### 3.3 Summary cards

Four rows, each with a value and a chevron, matching the reference's metric
cards:

| Card | Value | Opens |
| :--- | :--- | :--- |
| **Roles** | "2 roles" | Scrolls to the Roles section |
| **What they can see** | "47 departments" | Scrolls to the Access section |
| **What they can do** | "34 things" | Full permissions view (3.7) |
| **Last signed in** | "2 hours ago" | Activity history |

"What they can do" is the important one — it's the audit answer, and putting a
count on it is what makes people click it.

### 3.4 Access section

- **Account active** — a toggle. Turning it off warns: *"They'll be signed out
  immediately and won't be able to sign in."*
- **Locked out** — shown only when locked, in a red-tinted row with an
  **Unlock** button and the reason: *"Locked after 5 failed sign-in attempts."*
- **Hasn't signed in yet** — shown only when invited, with **Resend invitation**
  and when it was sent.
- **Ask them to set a new password** — a button, never a password field.
- **Sign them out everywhere** — a button, with the active session count.

**There is no password input anywhere in this UI.** Ever.

### 3.5 Roles section

Checkbox list of available roles, each with its one-line explanation.

- Requires `USER.ROLE.ASSIGN`. Without it, read-only, no checkboxes.
- Removing the last role warns: *"They'll be able to sign in but won't be able
  to do anything."*
- Existing assignments with a future start date show "Starts 1 Oct".
- Advanced dating lives behind a "Set dates" link per role — hidden by default,
  because most assignments start today and never end.

### 3.6 What they can see section

Two controls:

1. **Level** — radio list with plain explanations:
   - Everything — *"All departments across DIEZ"*
   - One business unit — *"That business unit and everything inside it"*
   - One department — *"That department and its sections"*
   - One section — *"Just that section"*
   - Only themselves — *"Only their own requests"*
2. **Which one** — `OrgUnitPicker` from Domain 2, filtered to the matching type.
   Hidden for "Everything" and "Only themselves".

Below, always: **"This gives access to 47 departments."** Live, updating as
they choose. Abstract scope levels are meaningless without that number.

Requires `USER.SCOPE.ASSIGN`. Options broader than the current user's own scope
are **hidden**, not disabled — rule S4.

### 3.7 What they can do — the audit view

Opens as a full-width modal, not a panel section. This is the screen someone
opens when asked *"why can this person lock budgets?"*

Grouped by area (Requests, Budget, Candidates, Vendors, Administration). Each
row: the permission in plain words, and where it came from:

| Source | Shown as |
| :--- | :--- |
| Role | "From their Head of Department role" |
| Inherited role | "From Head of Department, which includes Finance Approver" |
| Special access | "Given directly by Sara Ahmed — 'Temporary for audit'. Ends 30 Sept" |
| Standing in | "While standing in for Ahmed Al Mansouri until 5 Sept" |

Blocked permissions in a separate section at the bottom, struck through, with
the reason.

Search box and a source filter. Read-only.

### 3.8 Standing in for someone

Compact section listing active and upcoming delegations both ways. "Add"
requires `USER.DELEGATION.MANAGE` or being the user themselves.

If the backend shipped all-or-nothing delegation (spec gap G6), this section
must carry a visible warning: *"They'll be able to do everything Ahmed can do
while standing in."*

### 3.9 Invite someone

Guided, one decision per screen:

1. **Staff or vendor?**
2. **Who are they?** — name, email, employee ID, mobile, job title
3. **Where do they work?** — department and section
4. **What should they be able to do?** — roles and access, skippable

Confirmation: *"Invitation sent to ahmed@diez.ae. They'll set their own
password."*

### 3.10 Accept invitation — public

- Validates the token on load.
- **Invalid, expired, used, and unknown tokens all show the identical
  message:** *"This link is no longer valid. Ask an administrator to send you a
  new invitation."* Never reveal whether the token or the email existed.
- Password form with live strength feedback and rules stated up front,
  including "can't be one of your last 5 passwords".
- On success, redirect to sign-in with a confirmation.

### 3.11 Vendor users

Same list and panel pattern, but:

- No roles section, no "what they can see" section — vendor users get neither
  (rules V3, V4).
- Shows which vendor they belong to.
- Requires `VENDORUSER.MANAGE`.

---

## Part 4 — Save behaviour

The panel is edit-then-save, not auto-save. Non-technical users do better with
an explicit commit.

- Footer appears only when something has changed. Before that, the panel is
  read-only in feel.
- "Cancel" reverts. Closing the panel or clicking another row with unsaved
  changes prompts: *"You have unsaved changes. Save them?"* → Save / Discard /
  Keep editing.
- Dangerous changes get a confirmation inside the save, listing them:
  *"You're about to turn off Ahmed's access and remove their Head of Department
  role."*
- Save is one request per changed area, run in sequence. If one fails, stop,
  show which succeeded and which didn't, and leave the failed change in the
  form.
- After saving, refetch and show a brief inline confirmation. No toast — the
  panel is right there.

---

## Part 5 — Prompts

Run in order in `oms-prod-dev`.

---

### U1 — Foundations

```
Read docs/DOMAIN-3-USER-ADMINISTRATION-UI.md, then CLAUDE.md and the Domain 3
backend spec.

Build the shared pieces before any screen. Use existing theme tokens only — the
reference design is dark, our app is not. Do not introduce new colours.

1. components/oms/users/UserStatusBadge.tsx — the four states from Part 2 with
   their exact plain-language labels: Active, "Hasn't signed in yet", "Locked
   out", "Access turned off". Never show raw status codes.
2. components/oms/users/UserAvatar.tsx — initials fallback on a tinted
   background, sizes 24/32/56.
3. components/oms/users/RoleChip.tsx — role name with a tooltip carrying its
   one-line explanation.
4. components/oms/users/RoleOption.tsx — checkbox row with role name and its
   plain explanation beneath. Used in the panel and the invite flow.
5. components/oms/users/SummaryCard.tsx — the label/value/chevron row from Part
   3.3.
6. A constants file mapping every role code to a plain one-line explanation,
   and every backend error code from the Domain 3 spec to a plain actionable
   message. Both are referenced everywhere — get them in one place now.

Demo page showing every component and state.
```

✅ `feat(users-ui): add user administration primitives`

---

### U2 — People list

```
Build the People list and the three-tab structure per Part 1 and Part 3.1.

- Tabs: People, Vendor users, Invite someone. Vendor users hidden without
  VENDORUSER.MANAGE.
- DataTable from components/oms/. Columns: Name (avatar + name), Email, Role,
  Last signed in, Status.
- Multiple roles show the first plus "+2". No role shows a muted dash AND an
  amber dot — someone who can sign in but do nothing is worth surfacing.
- Last signed in as relative time. "Never" when null.
- Filters: Status (all four states), Role, Department (OrgUnitPicker), and a
  "No role" toggle.
- Search across name, email, employee ID. 500ms debounce (rate tier 5).
- Server-side pagination, sorting, filtering via the Step 0 framework.
- Footer count chip.
- Row click opens the detail panel; the open row stays highlighted.
- Empty state: "No one matches these filters" with a clear-filters action.

Every string from the Part 2 vocabulary table. Gate actions with can(), never a
role name.
```

✅ `feat(users-ui): add people list`

---

### U3 — Panel shell and summary

```
Build the detail panel shell per Part 1, 3.2, 3.3, and Part 4.

- 520px, slides from the right, list stays visible and interactive.
- Header per 3.2: 56px avatar, name 20px/600, email, role and status badges
  inline, close button.
- Four summary cards per 3.3: Roles, What they can see, What they can do, Last
  signed in. Each with a value and chevron. First two scroll to their section;
  "What they can do" opens the modal built in U7; "Last signed in" opens
  activity history.
- Values read as sentences: "47 departments", not "47".
- Panel body scrolls; header and footer fixed.
- Sticky footer with Cancel and Save changes, appearing ONLY when something has
  changed.
- Dirty-state guard per Part 4: closing the panel or clicking another row with
  unsaved changes prompts Save / Discard / Keep editing.
- Loading: skeleton matching the real layout, not a spinner.
- Out-of-scope user renders a genuine not-found state, not "access denied" — a
  403 confirms the person exists.
```

✅ `feat(users-ui): add user detail panel shell`

---

### U4 — Access section

```
Build the Access section per Part 3.4.

- "Account active" toggle. Turning off warns: "They'll be signed out
  immediately and won't be able to sign in."
- "Locked out" row, shown only when locked: red-tinted, with an Unlock button
  and "Locked after 5 failed sign-in attempts."
- "Hasn't signed in yet" row, shown only when invited: Resend invitation button
  and when it was sent.
- "Ask them to set a new password" button.
- "Sign them out everywhere" button, showing the active session count.

CRITICAL: there is NO password input anywhere in this UI. Not in this section,
not in the invite flow, not anywhere. Administrators trigger reset emails; they
never see or set a password. If you find an existing password field in this
module, remove it and tell me where it was.

Map every backend error to its plain message from the U1 constants file. In
particular USER_LAST_ADMIN must read: "You can't turn off the only
administrator. Give someone else admin access first."

Gate each control on its permission; hide rather than disable.
```

✅ `feat(users-ui): add account access section`

---

### U5 — Roles section

```
Build the Roles section per Part 3.5.

- Checkbox list of available roles using RoleOption from U1 — each with its
  plain one-line explanation beneath the name.
- Requires USER.ROLE.ASSIGN. Without it, render read-only with no checkboxes,
  and make that look intentional rather than broken.
- Unchecking the last role warns: "They'll be able to sign in but won't be able
  to do anything."
- Assignments with a future start date show "Starts 1 Oct" beside the role.
- Advanced dating behind a "Set dates" link per role, collapsed by default. Most
  assignments start today and never end; do not make everyone see date pickers.
- Vendor users never see this section at all (rule V3).
- Changes are staged and committed on Save per Part 4, not applied on click.

Dates display as "1 Oct 2026", never ISO.
```

✅ `feat(users-ui): add roles section`

---

### U6 — What they can see

```
Build the scope section per Part 3.6. This is the hardest concept in the module
for a non-technical user — the plain explanations are not optional decoration.

- Level as a radio list with the exact explanations from Part 3.6: Everything,
  One business unit, One department, One section, Only themselves.
- "Which one" uses OrgUnitPicker from Domain 2, filtered to the type matching
  the chosen level. Hidden for Everything and Only themselves.
- ALWAYS show the resulting count beneath: "This gives access to 47
  departments." Live, updating as the selection changes. Call the backend
  helper added in Domain 3 prompt D2.
- Requires USER.SCOPE.ASSIGN.
- Levels broader than the current user's own scope are HIDDEN, not disabled —
  backend rule S4 rejects them anyway, and showing an option that always fails
  is worse than not showing it.
- Vendor users never see this section (rule V4).
- Removing your own last scope is blocked; surface the plain message.

Never use the word "scope" in any visible string.
```

✅ `feat(users-ui): add access scope section`

---

### U7 — What they can do 🔴

```
Build the permissions audit view per Part 3.7. Full-width modal, not a panel
section.

This is the screen someone opens when asked "why can this person lock
budgets?". Source attribution is the entire point.

- Renders GET /users/:id/effective-permissions.
- Grouped by area: Requests, Budget, Candidates, Vendors, Administration.
- Each permission rendered in PLAIN WORDS, not as a code. Use the mapping from
  the U1 constants file. "REQUISITION.APPROVE" must never appear on screen.
- Every row shows where it came from, phrased per the Part 3.7 table:
  - "From their Head of Department role"
  - "From Head of Department, which includes Finance Approver"
  - "Given directly by Sara Ahmed — 'Temporary for audit'. Ends 30 Sept"
  - "While standing in for Ahmed Al Mansouri until 5 Sept"
- Blocked permissions in a separate section at the bottom, struck through, with
  the reason.
- Search box and a filter by source.
- Read-only. Changes happen in the panel sections.
- Print-friendly — auditors will want a copy.

Do not render a flat list of permission codes under any circumstances.
```

🛑 Show this screen to someone who doesn't work in IT and ask them who gave this
person budget access. If they can't answer, it isn't done.

✅ `feat(users-ui): add permissions audit view`

---

### U8 — Standing in for someone

```
Build the delegation section per Part 3.8.

- Compact list of active and upcoming delegations, both directions: who this
  person stands in for, and who stands in for them.
- Each shows the other person, the dates as "1–15 Oct 2026", and the reason.
- Add requires USER.DELEGATION.MANAGE, or the user managing their own.
- Add flow: choose the person, choose the dates (max 90 days), state a reason.
  Reason is mandatory.
- Never use the word "delegation" in a visible string.

If the backend shipped all-or-nothing delegation (Domain 3 spec gap G6), this
section MUST show a warning when adding: "They'll be able to do everything
Ahmed can do while standing in." Check docs/DOMAIN-3-RECONCILIATION.md for
which option was implemented and tell me which you built against.
```

✅ `feat(users-ui): add delegation section`

---

### U9 — Invite and accept 🔴

```
Build the invite flow (Part 3.9) and the public accept-invitation page (Part
3.10).

Invite — guided, one decision per screen, opening in the list area from the
"Invite someone" tab:
1. Staff or vendor?
2. Who are they? — name, email, employee ID, mobile, job title
3. Where do they work? — department and section via OrgUnitPicker
4. What should they be able to do? — roles and access, skippable with a note
   that they can sign in but do nothing until given a role

Back preserves entries. Progress indicator. Confirmation: "Invitation sent to
ahmed@diez.ae. They'll set their own password."

Accept invitation — public route, no auth:
- Validates the token on load.
- CRITICAL: invalid, expired, already-used, and unknown tokens must ALL render
  the IDENTICAL message: "This link is no longer valid. Ask an administrator to
  send you a new invitation." Never reveal whether the token existed, and never
  reveal whether an email is registered. Do not vary the wording, the layout,
  or the response timing between these cases.
- Password form with live strength feedback and rules stated up front,
  including "can't be one of your last 5 passwords".
- On success, redirect to sign-in with a confirmation.

No password field appears anywhere in the invite flow — the administrator never
sets it.
```

🛑 Test all four token failure cases and confirm the screens are byte-identical.

✅ `feat(users-ui): add invite and accept invitation flows`

---

### U10 — Vendor users and import

```
Build the Vendor users tab (Part 3.11) and the bulk import screen.

Vendor users:
- Same list and panel pattern.
- NO roles section and NO "what they can see" section — vendor users receive
  neither (rules V3, V4). Do not render them disabled; omit them.
- Show which vendor the person belongs to.
- Whole tab gated on VENDORUSER.MANAGE.

Bulk import:
- Upload CSV or XLSX, then per-row validation results with specific plain-
  language errors, then confirm and commit.
- Two phases, never single-shot — matches the backend validate-then-commit.
- Downloadable template.
- Clear summary before commit: "24 people will be invited. 3 rows have problems
  and won't be imported."
- Explain that everyone imported gets an invitation email, not a password.
- Max 500 rows; say so up front.
```

✅ `feat(users-ui): add vendor users and bulk import`

---

### U11 — Quality and copy pass

```
Final pass across every user administration screen.

1. Copy audit: every visible string against the Part 2 vocabulary table. The
   words "scope", "permission override", "delegation", "deactivate", and
   "effective permissions" must not appear anywhere a user can see. Report each
   violation with file and line, then fix.
2. Confirm every permission and role is shown in plain words with an
   explanation. No raw codes anywhere on screen.
3. Confirm NO password input exists in this module. Grep for it.
4. Confirm the four token failure cases render identically.
5. Accessibility: keyboard-only through the list, panel, all sections, and the
   invite flow. Panel traps focus and restores it on close. Every icon-only
   button has an accessible name.
6. Responsive: 1440, 1280, 1024, 768. Below 1024 the panel becomes full-screen.
7. Light and dark theme — find hardcoded colours.
8. Permissions: a view-only user sees a clean read-only panel that looks
   intentional, not stripped. Verify no role-name gating.
9. Every backend error code maps to a plain actionable message. List any that
   still fall through to a generic error.
10. Dirty-state guard works from every exit path: close button, another row, a
    tab change, browser back.

Report: issue | severity | file | fixed.
```

🛑 Final gate.

---

## Part 6 — Check yourself

1. **The layman test.** Ask someone outside IT to find who has budget access and
   why. Watch where they hesitate.
2. **No password fields.** Grep the module. There should be none.
3. **Token responses.** All four failure cases, byte-identical.
4. **The no-role case.** A user with no roles must be visibly flagged in the
   list, not silently normal.
