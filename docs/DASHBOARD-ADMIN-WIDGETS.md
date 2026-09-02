# Dashboard — System Administrator Widgets

**Adds Band E to `DASHBOARD-PLAN.md`.** Everything in that document stands;
this extends the catalogue, the API contract, and the role matrix.

Follows `DASHBOARD-VISUAL-LANGUAGE.md` and the separate-KPI-cards amendment.

---

## Part 1 — What an admin actually needs

The current admin view is A1, A9, C5, D3, D4 — five widgets. Too thin for the
role that owns the platform.

The organising idea: **an administrator's job is catching failures nobody else
will notice.** A department head notices a slow approval. Nobody notices that
the nightly hygiene daemon stopped running three weeks ago and requests have
quietly stopped auto-closing.

Four categories:

| Category | Question |
| :--- | :--- |
| **Platform health** | Is anything broken right now? |
| **Data integrity** | Is anything quietly wrong? |
| **Access and privilege** | Who gained power recently, and who holds too much? |
| **Scheduled operations** | What will the system do tonight? |

---

## Part 2 — New widgets

### Band A additions (KPI cards)

| # | Widget | Permission | Notes |
| :--- | :--- | :--- | :--- |
| A10 | **Failing integrations** | `PLATFORM.HEALTH.VIEW` | Count of systems not healthy. Zero is GOOD |
| A11 | **Integrity issues** | `PLATFORM.INTEGRITY.VIEW` | Failed data-integrity checks. Zero is GOOD |
| A12 | **Elevated accounts** | `USER.VIEW` | Users with `SYSTEM_ADMIN` or GLOBAL scope. Zero is NOT good — there must be at least one |
| A13 | **Jobs failed (24h)** | `PLATFORM.HEALTH.VIEW` | Zero is GOOD |

### Band E — Platform (new)

| # | Widget | Permission | Span | Notes |
| :--- | :--- | :--- | :--- | :--- |
| E1 | **Background job health** 🔴 | `PLATFORM.HEALTH.VIEW` | 6 | The most important widget on the admin dashboard |
| E2 | **Data integrity checks** 🔴 | `PLATFORM.INTEGRITY.VIEW` | 6 | Silent-corruption detection |
| E3 | **Tonight's scheduled actions** | `PLATFORM.HEALTH.VIEW` | 6 | What the hygiene daemon will do, and the money involved |
| E4 | **Privilege changes (7 days)** | `SECURITY.EVENTS.VIEW` | 6 | Role grants, scope grants, overrides, delegations |
| E5 | **Elevated access register** | `USER.VIEW` | 4 | Who holds admin, GLOBAL scope, active overrides |
| E6 | **Active delegations** | `USER.VIEW` | 4 | Who is acting for whom, and until when |
| E7 | **Account hygiene** | `USER.VIEW` | 4 | Never signed in, dormant 90 days, expiring invitations |
| E8 | **Rate limit pressure** | `SECURITY.DASHBOARD.VIEW` | 6 | Hits per tier — tells you which limits are wrong |
| E9 | **Notification delivery** | `PLATFORM.HEALTH.VIEW` | 6 | Queued, sent, failed. Domain 3 invitations depend on this |
| E10 | **Document pipeline** | `PLATFORM.HEALTH.VIEW` | 6 | Stored, scan failures, expiring system-wide |
| E11 | **Audit log and retention** | `SECURITY.EVENTS.VIEW` | 4 | Volume, oldest retained, next purge |
| E12 | **Configuration drift** | `SECURITY.ADMIN` | 6 | Settings changed from default, by whom, when |

### The three that matter most

**E1 — Background job health.** The System Hygiene Daemon runs the 30-day
auto-close, the 60-day draft purge, and the retention job. If it stops, nothing
errors — requests simply stop closing and locked funds are never released.
Weeks could pass. Show every scheduled job with its last run, next run,
duration, and outcome; flag any job that has missed its window.

**E2 — Data integrity checks.** These fail silently and corrupt authorization:

| Check | Detects |
| :--- | :--- |
| Org closure integrity | The Domain 2 §6.3 query. A drifting closure table breaks scope resolution without any error |
| Budget sum reconciliation | Reserved + locked + consumed + available ≠ total on any line |
| Orphaned scopes | `UserOrganizationScopes` pointing at deleted org units |
| Users without roles | Can sign in, can do nothing |
| Org units without a head | Approval routing has nowhere to go |
| Expired delegations still active | Should be inert; verify they are |
| Requisitions with no valid approver | Stuck permanently |

Each shows pass or fail with a count and a link to the affected records.

**E4 — Privilege changes.** The audit question that actually gets asked: *who
gained access recently, and who granted it?* Role assignments, scope grants,
permission overrides, and delegations created in the last seven days, with the
actor. Rising counts are the signal.

---

## Part 3 — API payloads

Add to `DASHBOARD-API-CONTRACT.md`. Money in integers, minor units.

**`background-job-health`**
```jsonc
{
  "jobs": [{
    "code": "REQUEST_AUTO_CLOSE",
    "label": "Auto-close stale requests",
    "schedule": "Daily 02:00",
    "lastRunAt": "2026-08-31T02:00:12Z",
    "lastOutcome": "SUCCESS" | "FAILED" | "PARTIAL",
    "durationMs": 4210,
    "itemsProcessed": 3,
    "nextRunAt": "2026-09-01T02:00:00Z",
    "missedWindows": 0,
    "lastError": null
  }],
  "anyFailing": false,
  "anyMissedWindow": false
}
```

`missedWindows` is the key field. A job that has not run in three days but
never *errored* is the failure mode this widget exists to catch.

**`data-integrity-checks`**
```jsonc
{
  "checks": [{
    "code": "ORG_CLOSURE_INTEGRITY",
    "label": "Organisation structure integrity",
    "state": "PASSED" | "FAILED" | "NOT_RUN",
    "affectedCount": 0,
    "lastRunAt": "2026-08-31T02:15:00Z",
    "detailLink": "/app/administration/integrity/org-closure",
    "severity": "CRITICAL" | "HIGH" | "MEDIUM"
  }],
  "allPassed": true,
  "lastFullRunAt": "2026-08-31T02:15:00Z"
}
```

**`scheduled-actions-tonight`**
```jsonc
{
  "runsAt": "2026-09-01T02:00:00Z",
  "actions": [
    { "code": "AUTO_CLOSE", "label": "Requests will auto-close", "count": 3, "fundsReleased": 120000000 },
    { "code": "DRAFT_PURGE", "label": "Drafts will be deleted", "count": 7, "fundsReleased": 0 },
    { "code": "DOC_EXPIRY_REMINDER", "label": "Document reminders will send", "count": 12, "fundsReleased": 0 }
  ],
  "totalFundsReleased": 120000000
}
```

**`privilege-changes`**
```jsonc
{
  "windowDays": 7,
  "changes": [{
    "type": "ROLE_GRANTED" | "ROLE_REVOKED" | "SCOPE_GRANTED" | "SCOPE_REVOKED"
          | "OVERRIDE_GRANTED" | "OVERRIDE_REVOKED" | "DELEGATION_CREATED",
    "subject": { "userId": "…", "name": "Sara Ahmed" },
    "actor": { "userId": "…", "name": "Ahmed Al Mansouri" },
    "detail": "Head of Department",
    "at": "2026-08-29T11:02:00Z"
  }],
  "counts": { "ROLE_GRANTED": 3, "SCOPE_GRANTED": 1, "OVERRIDE_GRANTED": 1 },
  "trend": { "thisWeek": 5, "lastWeek": 2 }
}
```

**`elevated-access-register`**
```jsonc
{
  "systemAdmins": { "count": 3, "users": [{ "userId": "…", "name": "…" }] },
  "globalScope": { "count": 4 },
  "activeOverrides": { "count": 2, "expiringWithin7Days": 1 },
  "activeDelegations": { "count": 3 }
}
```

**`account-hygiene`**
```jsonc
{
  "neverSignedIn": 4,
  "dormant90Days": 11,
  "invitationsExpiringSoon": 2,
  "invitationsExpired": 1,
  "usersWithoutRoles": 3,
  "lockedOut": 0
}
```

**`rate-limit-pressure`**
```jsonc
{
  "windowHours": 24,
  "tiers": [
    { "tier": 1, "label": "Sign-in", "limit": 10, "hits": 0, "uniqueUsers": 0 },
    { "tier": 4, "label": "Standard requests", "limit": 120, "hits": 34, "uniqueUsers": 6 }
  ],
  "totalHits": 34
}
```

Tiers are hit counts, not request counts — how often a user was *throttled*. A
tier being hit repeatedly means the limit is wrong, not that the system is
under attack.

**`notification-delivery`**
```jsonc
{
  "windowHours": 24,
  "queued": 4, "sent": 118, "failed": 2, "retrying": 1,
  "oldestQueuedAgeMinutes": 6,
  "failuresByType": { "INVITATION": 1, "SLA_REMINDER": 1 }
}
```

**`configuration-drift`**
```jsonc
{
  "changes": [{
    "setting": "Request auto-close days", "defaultValue": "30", "currentValue": "45",
    "changedBy": { "userId": "…", "name": "…" }, "changedAt": "2026-07-14T09:00:00Z"
  }],
  "count": 3
}
```

---

## Part 4 — Revised admin view

**System Administrator** sees:

```
Band A   A1 Needs my action · A10 Failing integrations
         A11 Integrity issues · A13 Jobs failed

Band E   E1 Background job health (6) │ E2 Data integrity checks (6)
         E3 Tonight's scheduled actions (6) │ E4 Privilege changes (6)
         E5 Elevated access (4) │ E6 Active delegations (4) │ E7 Account hygiene (4)
         E8 Rate limit pressure (6) │ E9 Notification delivery (6)
         E10 Document pipeline (6) │ E11 Audit and retention (4)
         E12 Configuration drift (6)

Band C   C5 Recent activity (4)

Band D   D3 Reconciliation exceptions · D4 Integration health
```

Nothing business-facing. An administrator does not need requisition counts —
they need to know whether the machine is running.

Band E renders **only** for users holding `PLATFORM.HEALTH.VIEW` or
`PLATFORM.INTEGRITY.VIEW`. Both are new; flag as a backend dependency alongside
`SECURITY.ADMIN`.

---

## Part 5 — Prompts

Run after F1–F6.

### G1 — Contract, types, fixtures

```
CONTEXT
Read docs/DASHBOARD-ADMIN-WIDGETS.md, docs/DASHBOARD-PLAN.md,
docs/DASHBOARD-VISUAL-LANGUAGE.md and CLAUDE.md.

Extend the dashboard for System Administrators. Twelve new Band E widgets plus
four Band A cards.

TASK 1 — Extend docs/DASHBOARD-API-CONTRACT.md
Add every Part 3 payload verbatim. Add the two new permissions,
PLATFORM.HEALTH.VIEW and PLATFORM.INTEGRITY.VIEW, and mark them as a backend
dependency alongside SECURITY.ADMIN.

Money stays integers in minor units.

TASK 2 — Extend src/types/dashboard.ts
Add typed payloads for all twelve Band E widgets and the four Band A cards,
extending the existing discriminated union on widgetId.

TASK 3 — Extend src/lib/dashboard/fixtures.ts
Realistic fixtures for every new widget. Create BOTH a healthy set and a
degraded set:

  healthy  — all jobs succeeded, all integrity checks passed, no failing
             integrations, no notification failures
  degraded — REQUEST_AUTO_CLOSE has missedWindows: 3 with lastOutcome FAILED,
             ORG_CLOSURE_INTEGRITY failed with affectedCount 7, DocuSign
             integration failing, 2 notification failures, 5 privilege changes
             this week against 2 last week

The degraded set matters: an admin dashboard that has only ever been seen in a
healthy state has untested failure rendering, and failure rendering is the
entire point of these widgets.

TASK 4 — Extend the systemAdmin persona fixture to the Part 4 layout.

TASK 5 — Register all sixteen widgets in registry.ts with their permissions.
Band E requires PLATFORM.HEALTH.VIEW or PLATFORM.INTEGRITY.VIEW as listed.

No UI in this task.
```

✅ `feat(dashboard): add admin widget contract and fixtures`

---

### G2 — Health and operations

```
CONTEXT
Read docs/DASHBOARD-ADMIN-WIDGETS.md Part 2 and 3.

Build E1, E3, E9, E10 plus Band A cards A10 and A13. Use the F1 visual
primitives — KpiCard, WidgetShell, SegmentedBar, DistributionBar,
ChartTooltip.

E1 background-job-health — the most important widget on this dashboard
  Table, one row per scheduled job: job name, schedule, last run (relative),
  outcome badge, duration, items processed, next run.

  CRITICAL: surface missedWindows prominently. A job that has not run for three
  days but never ERRORED is exactly the failure this widget exists to catch —
  the System Hygiene Daemon stopping means requests silently stop auto-closing
  and locked funds are never released. Nobody else in the system would notice.

  A job with missedWindows > 0 renders the whole row in the danger tone with
  "Missed 3 runs" replacing the duration. Sort failing and missed jobs first.
  Expand a row to show lastError.

E3 scheduled-actions-tonight
  A short list of what the daemon will do at its next run: "3 requests will
  auto-close, releasing AED 1.2M", "7 drafts will be deleted", "12 document
  reminders will send".
  Show the total funds released prominently — an admin should be able to see
  the financial consequence of tonight's run before it happens.
  Header shows the run time. Each row links to the affected records.

E9 notification-delivery
  Queued, sent, failed, retrying as four figures. Oldest queued age.
  Failures broken down by type.
  The notification service does not exist yet — render from fixtures and add:
  // TODO(notifications): wire to the real delivery service
  Note in your summary that Domain 3 invitations depend on this service and it
  has not been built.

E10 document-pipeline
  Documents stored, malware scan failures, expiring within 30 days system-wide.
  File storage does not exist yet:
  // TODO(file-storage): wire when the storage service ships

A10 failing-integrations — count, zero is GOOD: "All integrations healthy"
A13 jobs-failed-24h — count, zero is GOOD: "All jobs completed"

Both use the separate KpiCard from the amendment: 120px fixed, no tinted
circles, no subtitles, zero states in the comparison slot.
```

✅ `feat(dashboard): add platform health widgets`

---

### G3 — Integrity and access

```
CONTEXT
Read docs/DASHBOARD-ADMIN-WIDGETS.md Part 2 and 3.

Build E2, E4, E5, E6, E7, E8, E11, E12 plus Band A cards A11 and A12.

E2 data-integrity-checks — silent-corruption detection
  One row per check with a pass/fail state, affected count, last run, and a
  link to the affected records.
  Checks: organisation structure integrity (the Domain 2 section 6.3 closure
  query), budget sum reconciliation, orphaned scopes, users without roles, org
  units without a head, expired delegations still active, requisitions with no
  valid approver.

  These fail SILENTLY and corrupt authorization — a drifting closure table
  breaks scope resolution with no error anywhere. Failed checks sort first and
  render in the danger tone with their affected count. Severity CRITICAL rows
  get a left accent bar.

  Add a "Run checks now" action gated on PLATFORM.INTEGRITY.VIEW.

E4 privilege-changes
  Last 7 days: role granted/revoked, scope granted/revoked, override
  granted/revoked, delegation created. Each row: what changed, to whom, by
  whom, when.
  Show the trend — this week against last week — using DeltaChip with
  increaseIsGood false. Rising privilege grants is a signal worth noticing.
  This is the audit question that actually gets asked: who gained access, and
  who granted it.

E5 elevated-access-register
  System administrators (count plus names), users with GLOBAL scope, active
  permission overrides with how many expire within 7 days, active delegations.
  This list should be SHORT. Growth is the signal — add a comparison against 30
  days ago.

E6 active-delegations
  Who is acting for whom, and until when. Rows expiring within 3 days get an
  amber marker.
  Delegations are a real security surface and easy to forget about.

E7 account-hygiene
  Never signed in, dormant 90 days, invitations expiring soon, invitations
  expired, users without roles, locked out. Each figure links to the user list
  pre-filtered to exactly that set.

E8 rate-limit-pressure
  One row per configured tier: tier name, limit, hits in 24h, unique users
  affected. Use SegmentedBar for hits against limit.
  Hits mean users were THROTTLED, not total requests. A tier hit repeatedly
  usually means the limit is wrong, not that the system is under attack — say
  so in the widget's empty/context copy.

E11 audit-retention
  Events written in 24h, total retained, oldest retained date, next purge date.

E12 configuration-drift
  Settings differing from their defaults: setting, default, current, changed by,
  changed when. Empty state: "All settings are at their defaults."

A11 integrity-issues — count of failed checks. Zero is GOOD: "All checks
passed"
A12 elevated-accounts — count. Zero is NOT good; there must be at least one
administrator. If the count is 0, render in the danger tone with "No
administrators — this is a lockout risk."

RULES
- Follow DASHBOARD-VISUAL-LANGUAGE.md throughout: T9 row treatment, T10 headers,
  no monospace except genuine codes, no subtitle captions.
- Three semantic colours only: red, amber, neutral. Severity is conveyed by
  position and icon, not by five hues.
- No raw event codes, table names, or permission codes on screen. "ROLE_GRANTED"
  renders as "Role given".
```

✅ `feat(dashboard): add integrity and access widgets`

---

### G4 — Verify

```
CONTEXT
Verify the System Administrator dashboard. Report: check | expected | actual |
pass.

DEGRADED STATE — most important
1. Load the degraded fixture set. Confirm every failure renders visibly:
   failed job, missed windows, failed integrity check, failing integration,
   notification failures, elevated privilege-change trend.
2. Confirm a job with missedWindows > 0 but no error still renders as a
   failure. This is the specific silent failure these widgets exist to catch.
3. Confirm failed integrity checks sort above passing ones.
4. Confirm A12 with a count of 0 renders in the danger tone with the lockout
   warning.

HEALTHY STATE
5. Load the healthy fixture set. The dashboard should read as reassuring, not
   empty. Every zero shows a specific sentence.
6. Confirm no widget shows a bare "0" or "No data".

PERMISSIONS
7. Band E renders only with PLATFORM.HEALTH.VIEW or PLATFORM.INTEGRITY.VIEW.
8. Grep admin dashboard code for role-name strings — zero matches.
9. Confirm a user with SECURITY.DASHBOARD.VIEW but not PLATFORM.HEALTH.VIEW
   sees E8 and E11 but not E1, E2, E3.

VISUAL LANGUAGE
10. Every KPI card is exactly 120px with no tinted circle and no subtitle.
11. No monospace outside genuine codes and identifiers.
12. Card headers 44px, no subtitles, no bottom borders.
13. Three semantic colours only across all Band E widgets.
14. Table rows use the T9 inset pill hover, no separator lines.

LANGUAGE
15. Grep for uppercase-underscore strings rendered to screen — zero.
16. "ROLE_GRANTED" renders as "Role given" and similar throughout.

REST
17. Every widget links somewhere, pre-filtered to what it showed.
18. Responsive 1440, 1280, 1024, 768.
19. Light and dark theme.
20. List every TODO marker, grouped by the module that resolves it.
```

🛑 Final gate. Item 2 is the one that matters.

---

## Part 6 — Questions for DIEZ

1. **Who receives an alert when a background job fails or misses its window?**
   A dashboard widget only helps someone who is looking. The auto-close daemon
   failing silently for a week has real financial consequences.
2. **Should data integrity checks run on a schedule**, and if so how often? The
   org closure check is cheap; budget reconciliation across all lines is not.
3. **Is there a maximum acceptable number of `SYSTEM_ADMIN` accounts** or users
   with GLOBAL scope? If so, E5 should warn above it.
4. **Should privilege changes require a second approver?** E4 surfaces them
   after the fact. For a government financial system, four-eyes on granting
   `BUDGET.LOCK` may be expected.
