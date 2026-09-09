# Portal Separation, RBAC Navigation, and Real Demo Users

Three fixes: the vendor and internal portals become unmistakably separate
products, internal navigation gets genuinely permission-filtered instead of
uniform, and the persona switcher is replaced by real logins against the real
auth system.

**Scope note:** Domains 1–3 (auth, org, users) have real backends per
`DOMAIN-1`–`DOMAIN-3` work. Requisitions, Budget, Candidates, and Vendor do
not — those pages still read `demo-data`. This work makes **login and
navigation real**. Business data behind them stays fixture-driven until those
domains are built. Said plainly here so it's never assumed otherwise.

---

## Part 1 — Portal separation, made structural not cosmetic

`VENDOR-PORTAL-UI.md` said "same tokens, distinct branding." Too weak. The
distinction needs to be architectural, so it's impossible to get wrong by
accident.

| | Internal (`/app/*`) | Vendor (`/vendor/*`) |
| :--- | :--- | :--- |
| Root layout | `app/(app)/layout.tsx` | `app/(vendor)/layout.tsx` — **separate route group, separate component tree** |
| Header component | `InternalHeader` | `VendorHeader` — different component, not the same one with a prop |
| Wordmark | "DIEZ · Outsource Management System" | "DIEZ · Vendor Portal" |
| Sidebar component | `InternalSidebar` | `VendorSidebar` — different component |
| Nav data source | RBAC-filtered internal nav map (Part 2) | Fixed vendor IA (`VENDOR-PORTAL-UI.md` Part 1) — never permission-computed, since a vendor session has no internal roles to check |
| Session cookie scope | `oms_session` with `userType=INTERNAL` | Same cookie name, `userType=VENDOR` — enforced at the route-group boundary |
| Accent treatment | Standard theme accent | Same palette, but the header carries a distinct secondary tone (e.g. a thin top bar in a muted teal) so a screenshot alone tells you which portal it is |

**What stays shared, deliberately:** design tokens, typography, `KpiCard`,
`AttachmentList`, `Amount`, the progress rail, `DataTable`, `StatusBadge`.
Sharing the *design system* is correct. Sharing the *shell* is the thing to
eliminate.

**The test that matters:** put a screenshot of each portal's header side by
side. If someone can't immediately tell which is which without reading body
text, this isn't done.

---

## Part 2 — Internal navigation, permission-mapped

This is the actual gap. Every nav item declares its required permission(s);
items the user lacks are **absent**, never disabled — consistent with every
other permission-gated affordance in this system.

### 2.1 The map

| Nav item | Permission | Notes |
| :--- | :--- | :--- |
| Dashboard | *(always, any authenticated internal user)* | Content varies by widget permission, per `DASHBOARD-PLAN.md` |
| My Requests | `REQUISITION.VIEW`, own scope | Anyone who can raise a request |
| All Requests | `REQUISITION.VIEW`, broader scope | HOD, HR, Finance, Procurement, Admin |
| HR Review | HR review permission | HR Specialist only |
| Budget | `BUDGET.VIEW` | Finance, HOD (own department), Admin |
| Candidates | `CANDIDATE.VIEW` | Main Interviewer, HR, Requestor (own), Procurement |
| Workforce / Onboarding | Workforce view permission | HR, Line Manager, HOD, Admin |
| Vendors | `VENDOR.VIEW` | Procurement, Admin |
| Reports | Reports view permission | Broad, scope-filtered |
| **Administration** *(group)* | `SYSTEM_ADMIN` role only | Organization, Users, Security Dashboard, Security Settings all live inside this group |

**Approvals is not a separate nav item.** Per `APPROVALS-IN-REQUESTS.md`, approval
tasks live inside My Requests / All Requests as the "Needs My Action" tab.
Repeating it as a standalone item would contradict that decision.

### 2.2 What each role's sidebar actually contains

The concrete answer to "menus segregated by role":

| Role | Sees |
| :--- | :--- |
| **Department Requestor** | Dashboard, My Requests |
| **Line Manager / Section Head** | Dashboard, My Requests, All Requests (own scope), Workforce |
| **HOD** | Dashboard, All Requests, Budget (own department), Workforce, Candidates, Reports |
| **HR Specialist** | Dashboard, All Requests, HR Review, Candidates, Workforce, Reports |
| **Finance Manager** | Dashboard, Budget, All Requests (read), Reports |
| **Procurement Officer** | Dashboard, All Requests (read), Candidates, Vendors, Reports |
| **Main Interviewer** | Dashboard, My Requests, Candidates |
| **System Administrator** | Dashboard, Administration (Organization, Users, Security Dashboard, Security Settings). **Not** Requests, Budget, or Candidates — an admin manages the platform, not the business flow |

A Requestor's sidebar has **two items**. That sparseness is the point — it's
the proof this works, not a bug to pad out.

### 2.3 Prompt

```
CONTEXT
Repo: OMS frontend. Read docs/PORTAL-SEPARATION-AND-USERS.md Parts 1 and 2,
then APP-SHELL-SPEC.md and CLAUDE.md.

TASK 1 — Structural portal separation per Part 1
Confirm or create separate root layouts, header components, and sidebar
components for (app) and (vendor) route groups — not one shell with swapped
props. Distinct wordmark per portal. A thin secondary-tone top bar on the
vendor portal so it's visually identifiable from a screenshot alone.
Grep for any component currently imported by BOTH route groups that renders
portal-specific chrome (header, sidebar) — flag and split it.

TASK 2 — RBAC-filtered internal navigation per Part 2
Build a nav map data structure keyed by item -> required permission(s),
exactly as the Part 2.1 table. The internal sidebar renders only items the
signed-in user's real permissions satisfy — items are ABSENT, never disabled,
consistent with every other permission gate in this system.
The Administration group renders only for SYSTEM_ADMIN.
Approvals is NOT a separate nav item — it lives inside My Requests / All
Requests per APPROVALS-IN-REQUESTS.md. Do not add a standalone entry.

TASK 3 — Report
For each of the 9 roles in Part 2.2, confirm the rendered sidebar matches
that row exactly. This cannot be verified until Part 3's real users exist —
flag this task as blocked on that and revisit after.
```

Commit: `feat(shell): structural portal separation and RBAC navigation`

---

## Part 3 — Real users

Same cast as `DEMO-DATA-INTEGRATION.md` Part 3 — same people, now real
`auth.Users` rows instead of fixture strings. **Do not rename or add anyone**;
consistency with the seeded requisition data depends on these being the same
identities.

### 3.1 The roster

| Name | Username | Email | Role(s) | Org scope | UserType |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Mariam Al Mansoori | mariam.almansoori | mariam.almansoori@diez.ae | Requestor | Digital Security | INTERNAL |
| Ahmed Al Zaabi | ahmed.alzaabi | ahmed.alzaabi@diez.ae | Requestor | IT Infrastructure | INTERNAL |
| Rashid Al Falasi | rashid.alfalasi | rashid.alfalasi@diez.ae | Requestor | PMO | INTERNAL |
| Hessa Al Qassimi | hessa.alqassimi | hessa.alqassimi@diez.ae | Requestor | Finance | INTERNAL |
| Omar Al Hashmi | omar.alhashmi | omar.alhashmi@diez.ae | Line Manager | Digital Security | INTERNAL |
| Fatima Al Marri | fatima.almarri | fatima.almarri@diez.ae | Section Head | Digital Security | INTERNAL |
| Khalid Al Suwaidi | khalid.alsuwaidi | khalid.alsuwaidi@diez.ae | HOD | Digital Security | INTERNAL |
| Youssef Al Blooshi | youssef.alblooshi | youssef.alblooshi@diez.ae | HOD | PMO | INTERNAL |
| Mona Al Shamsi | mona.alshamsi | mona.alshamsi@diez.ae | HOD | IT Infrastructure | INTERNAL |
| Aisha Al Nuaimi | aisha.alnuaimi | aisha.alnuaimi@diez.ae | HR Specialist | Organisation | INTERNAL |
| Rashid Al Mansoori | rashid.almansoori | rashid.almansoori@diez.ae | Finance Manager | Organisation | INTERNAL |
| Salma Al Ketbi | salma.alketbi | salma.alketbi@diez.ae | Procurement Officer | Organisation | INTERNAL |
| Noura Al Mazrouei | noura.almazrouei | noura.almazrouei@diez.ae | Main Interviewer | Digital Security, Data Management | INTERNAL |
| Yousef Al Falasi | yousef.alfalasi | yousef.alfalasi@diez.ae | Panel Interviewer | Digital Security | INTERNAL |
| Ahmed Al Dhaheri | ahmed.aldhaheri | ahmed.aldhaheri@diez.ae | System Administrator | Global | INTERNAL |
| Layla Hassan | layla.hassan | layla.hassan@falcontech.ae | Vendor Coordinator | Falcon Tech Resourcing | **VENDOR** |

Sixteen users: fifteen internal roles, one vendor, matching everything already
seeded in `demo-data`.

### 3.2 Password policy — demo only

**One shared password across all sixteen accounts, for presenter convenience:**

```
Demo@2026!
```

**This is a demo-only decision.** Flag it loudly in the seed script's header
comment and in any README: never reuse a shared password pattern in a real
deployment. `MustChangePassword` should be `false` for these accounts
specifically so a live demo isn't interrupted by a forced reset — the opposite
of the real invitation flow in `DOMAIN-3-USER-ADMINISTRATION.md`, and that
divergence should be commented in the script, not silent.

---

## Part 4 — Password seeding, correctly

**I don't know what hashing algorithm your `AuthService` uses.** Writing a raw
SQL `INSERT` with a guessed bcrypt string risks seeding a password that
doesn't actually verify against your login endpoint — a seed that silently
fails at the one moment you need it to work.

**The fix: audit first, then a script that calls the real function.**

### 4.1 Prompt — audit

```
CONTEXT
Repo: oms-backend. Read docs/PORTAL-SEPARATION-AND-USERS.md Part 4, then
CLAUDE.md and DOMAIN-3-USER-ADMINISTRATION.md.

Report only. Write no code, run no migrations.

TASK 1 — Locate the real password hashing implementation
Find wherever auth.LocalCredentials.PasswordHash is written today (the
invitation-acceptance path, or any existing seed script). Identify the exact
library and parameters — bcrypt, argon2, scrypt, or something else — and the
cost/rounds/salt configuration in use.

TASK 2 — Locate the real UserID generation
Confirm whether UserID uses NEWSEQUENTIALID() as a column default (per
readme.md) or is generated application-side.

TASK 3 — Confirm auth.UserOrganizationScopes shape
Per DOMAIN-3-USER-ADMINISTRATION.md section 0.2, this table has four nullable
columns (OrganizationID/BusinessUnitID/DepartmentID/SectionID). Confirm this
is still accurate and report the exact column names and the ScopeDefinitionID
values currently seeded for ORGANIZATION/DEPARTMENT levels.

TASK 4 — Confirm org.OrgUnits IDs
Report the actual OrgUnitId values for: DIEZ (root), Corporate Services (BU),
Digital Security, Data Management, IT Infrastructure, Finance, HR,
Procurement, PMO. If any of these departments from
DEMO-DATA-INTEGRATION.md's cast do not yet exist in org.OrgUnits, list exactly
which are missing — they must be created before Part 5 can run.

TASK 5 — Confirm role and permission IDs
Report the RoleID for each of: Requestor (if a distinct role exists, or
confirm requesting is unrestricted), Line Manager, Section Head, HOD, HR
Specialist, Finance Manager, Procurement Officer, Main Interviewer, Panel
Interviewer, System Administrator (SYSTEM_ADMIN). Flag any role from Part 3.1
that does not yet exist in auth.Roles.
```

Read this output before proceeding — it determines whether Part 5's SQL is
correct as written or needs adjusting to your actual schema state, and whether
any roles or org units need creating first.

### 4.2 Prompt — the seed script

```
CONTEXT
Read docs/PORTAL-SEPARATION-AND-USERS.md Parts 3 and 4, and the audit output
from the previous task.

Write a TypeScript seed script at db/seeds/demo-users.seed.ts, run via
ts-node or the project's existing seed runner (check package.json for one
first).

REQUIREMENTS
1. Use the SAME hashing function/library found in the audit — call it
   directly, or replicate its exact configuration. Do not invent a hash
   value. If the real function lives in a service class, import and call it;
   do not reimplement password hashing logic in the seed script.
2. Idempotent: running twice must not create duplicates or error. Check for
   an existing Username before inserting; update rather than fail on rerun.
3. Insert order respects foreign keys: auth.Users -> auth.UserProfiles ->
   auth.LocalCredentials -> auth.UserRoles -> auth.UserOrganizationScopes.
4. All sixteen users from Part 3.1, with the shared password Demo@2026! per
   Part 3.2, MustChangePassword = false, IsActive = true.
5. Layla Hassan gets UserType = VENDOR and NO auth.UserOrganizationScopes row
   — per Domain 3 rule V4, vendor users receive no organizational scope.
6. Every other user gets exactly one auth.UserOrganizationScopes row matching
   their Part 3.1 org scope, using the real OrgUnitId values from the audit.
7. Role assignments via auth.UserRoles with EffectiveFrom = today,
   EffectiveTo = null, IsActive = true, using the real RoleID values from the
   audit.
8. If the audit found any role or org unit missing, either create it first
   (if that's a reasonable seed responsibility) or STOP and report exactly
   what's missing rather than silently skipping that user.
9. A loud comment block at the top of the file: this password is for demo
   use only, never reuse this pattern in a production seed.
10. On completion, print a table of Username | Email | Role | Password to the
    console — this is the credential sheet DD9's demo script references.

Do not touch org.OrgUnits, auth.Roles, or auth.Permissions structurally in
this script — it only creates USERS and their assignments against what
already exists.
```

Run this yourself against a dev database. Confirm the printed credential table
matches Part 3.1 before treating it as done.

### 4.3 Prompt — verify real login

```
CONTEXT
Read docs/PORTAL-SEPARATION-AND-USERS.md Part 2.2.

For each of the 16 seeded users, log in through the REAL login page (not the
persona switcher — retire that per Part 5) with their email and
Demo@2026!.

For each, report: did login succeed, and does the rendered sidebar match
their row in Part 2.2 exactly? List any mismatch with the specific item that
is wrongly present or wrongly absent.

Confirm Layla Hassan's login lands in the vendor portal and that attempting
to navigate to any /app/* URL while authenticated as her is rejected.
Confirm no internal user can reach any /vendor/* URL.
```

Final gate for this phase. A mismatch here is a real RBAC bug, not a demo
inconvenience — treat it accordingly.

---

## Part 5 — Retire the persona switcher

`DEMO-DATA-INTEGRATION.md` DD7 specced a cookie-based fake session switcher.
**Superseded by Part 4.** Real users through the real login page test the real
system; a fake session cookie tests nothing the real thing doesn't also
prove, and it risks masking an RBAC bug that only shows up with genuine
authentication.

```
CONTEXT
Read docs/DEMO-DATA-INTEGRATION.md DD7 and docs/PORTAL-SEPARATION-AND-USERS.md
Part 3.

Remove the persona-switcher cookie-injection mechanism built for DD7. Update
docs/DEMO-WALKTHROUGH.md so every storyline's "as {persona}" instruction
becomes "log in as {email} / Demo@2026!" instead of "switch persona to
{name}."

Keep the vendor cookie injector ONLY if it is still needed for the isolated
/app/dev/vendor-documents workbench's non-authenticated sandbox mode — check
whether that workbench requires it independent of real login, and report
which you kept and why.
```

---

## Part 6 — What this doesn't fix yet

Said plainly, per the scope note at the top: after this work, **login,
permissions, and navigation are real.** Opening `/app/requests` as Mariam
still shows `demo-data`'s fixture content, filtered by her real org scope
where the frontend fixture logic already respects it — not a live query
against a Requisition backend, because that backend doesn't exist. That gap
closes when Requisitions, Budget, Candidates, and Vendor get real Domain
backends, not before.
