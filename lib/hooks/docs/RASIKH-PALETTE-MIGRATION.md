# RASIKH Palette Migration

Replaces the token *values* underlying every existing screen. Because this
build has consistently used semantic tokens and never hardcoded hex — a rule
enforced and grepped-for in every prior spec — this should be a contained,
single-source change. The risk isn't scope; it's contrast and collision, and
both get a hard gate before anything ships.

**Naming note:** the source document is a colour and logo-asset spec. Nothing
in it renames the product. Every existing wordmark ("DIEZ · Outsource
Management System," etc.) stays as-is. If RASIKH is meant to become a visible
product name, that's a separate, explicit follow-up — not inferred here.

**Provenance caveat, carried forward from the source document itself:** these
hex values are read from DIEZ's public site, not an official brand guideline.
If DIEZ hands over a real brand PDF, reconcile against it before this reaches
production.

---

## Part 1 — Three things to resolve before implementation

### 1.1 Teal collision (critical)

DIEZ Teal now carries a fixed meaning: vendor-portal identity and the `info`
semantic state. `INTERVIEW-PLANNING-UX.md` section 5.2 uses teal as one of
six *arbitrary* rotating candidate-identity hues.

**Concrete break:** on `/app/candidates/interviews/plan/{requestId}`, a
suggestion card's `info`-toned reason line and Candidate #2's tint chip can
both render teal simultaneously. Not theoretical — that's a real screen
already built.

**Fix:** remove teal from the six-hue candidate rotation. Replace with a
sixth hue distinct from every claimed colour — navy, teal, indigo, gold,
success-green, warning-amber, danger-red. Direction: a muted plum/magenta.
Exact value gets fixed during the contrast gate (Part 5), not guessed here.

### 1.2 Gold needs deliberate, rare placement

Gold has no prior role in this build — it's a new token with a strict rarity
rule (*"never a default button or link colour, in either mode"*). A rule with
zero assigned use sites is a rule nobody follows. Part 4 proposes exactly two
candidates. **Not both, not more** — pick one, possibly two, across the
entire system. Adding a third defeats the rarity that makes it work.

### 1.3 Two-mode architecture is new — needs a concrete page map

The `dashboard`/`operational` surface-mode split doesn't exist anywhere in
this build yet. Left undecided, every future page build re-litigates which
mode it's in. Part 3 fixes the assignment now, for every screen already
shipped.

**Scope decision:** the two-mode split applies **only to `/app/*`**. The
vendor portal and the candidate joining-readiness surface already have their
own consistent teal identity throughout (`PORTAL-SEPARATION-AND-USERS.md`,
`CANDIDATE-JOINING-READINESS.md`) — they don't also toggle between navy and
indigo. Layering the two-mode split onto them would contradict work already
done.

---

## Part 2 — Token mapping

Every value below replaces the current abstract placeholder in the central
theme file. Success/warning/danger have never had concrete hex assigned in
this build before — every prior spec referred to them functionally ("green,"
"amber," "red"). This is their first concrete assignment, not a rewrite of a
conflicting prior value.

| Semantic token | Light | Dark | Replaces / first assignment |
| :--- | :--- | :--- | :--- |
| `--rasikh-primary` | `#1B2B5C` | `#8C97C9` | Operational-mode interactive accent |
| `--rasikh-primary-deep` | `#101B3D` | `#101B3D` | Global bar, formal documents |
| `--rasikh-teal` | `#23879C` | `#5CB8CC` | Vendor/candidate-portal identity, `info` triad |
| `--rasikh-indigo-accent` | `#6669A3` | `#9B9DCB` | Dashboard-mode interactive accent |
| `--rasikh-gold` | `#CBA876` | `#E0C79A` | Rare milestone accent — Part 4 |
| `--rasikh-wash` | `#E9EAF4` | `#161A2B` | Dashboard-mode page background |
| `success` triad | `#EBF5EE` / `#3A8F6B` / `#1E5C42` | `#12271F` / `#5FC79A` / `#A7E8C7` | First concrete assignment |
| `warning` triad | `#FBF2E3` / `#B4791F` / `#7A4E0C` | `#2E2416` / `#E0A94A` / `#F5D89A` | First concrete assignment |
| `danger` triad | `#FBEDEA` / `#B0432C` / `#7A2818` | `#2E1B18` / `#E8795C` / `#F5B8A5` | First concrete assignment |
| `info` triad | `#E9F4F6` / `#23879C` / `#144F5C` | `#122A2E` / `#5CB8CC` / `#A9DCE6` | Built on `--rasikh-teal` |

**Unaffected, deliberately:** the warm-sand neutral scale (`--surface-1/2/3`,
`--text-muted`, `--border`) — this is the operational-mode base for dense
tables and approvals, and the source document explicitly keeps it. The
lavender wash is dashboard-mode only, not a global background swap.

---

## Part 3 — Two-mode page assignment

The clean rule: **one overview screen per area is dashboard mode; every dense
working screen is operational mode.**

| Dashboard mode (indigo, lavender wash) | Operational mode (navy, sand) |
| :--- | :--- |
| `/app/dashboard` | `/app/requests`, `/app/requests/{id}`, clarifications, amendments |
| `/app/reports` | `/app/hr-review`, HR send-back |
| | `/app/budget` and all budget sub-routes |
| | `/app/candidates`, interview planning, interview evaluation |
| | `/app/workforce`, `/app/onboarding` |
| | `/app/administration/*` — Organization, Users, Security |

Everything under `/vendor/*` and `/c/{token}` stays teal throughout, no mode
attribute.

---

## Part 4 — Gold placement, exactly two candidates

Pick one, evaluate the second, do not add a third.

1. **"Qualified" outcome badge**, `INTERVIEW-EVALUATION-UI.md` section 3.6.
   The most narratively significant state a candidate reaches in this
   system — genuinely rarer and more meaningful than a routine "document
   uploaded" success tick. Replaces the current success-green treatment for
   this one specific badge only; ordinary task-complete states keep green.
2. **The plan-complete lift**, `INTERVIEW-PLANNING-UX.md` Part 7 — "when
   every candidate is ready, Review & send becomes primary and lifts once."
   Already a one-time, rare moment by design; gold suits it better than the
   current accent tint.

If both ship, confirm they never appear on the same screen at the same time —
rarity is partly about frequency *per session*, not just per component.

---

## Part 5 — Prompts

Written for Antigravity. **Verify before you write** — the contrast gate runs
against a sandbox, not the live theme file, so a failure costs nothing.

### RP1 — Audit

```
CONTEXT
Repo: OMS frontend. Read docs/RASIKH-PALETTE-MIGRATION.md in full, then
DASHBOARD-VISUAL-LANGUAGE.md and INTERVIEW-PLANNING-UX.md (UX1) - these
originally defined the tokens and dark-mode physics this migration replaces.

Report only. Write no code.

TASK 1 - Locate every current token definition
Find the central theme file(s) defining --text-primary, --surface-1/2/3,
--border, the accent triad, and the success/warning/danger/info triads, in
both light and dark. Quote current values.

TASK 2 - Locate every special-cased colour allocation
  - categoricalScale() from DASHBOARD-VISUAL-LANGUAGE.md - what base hue does
    it currently ramp?
  - getCandidateColor() from INTERVIEW-PLANNING-UX.md - confirm the current
    six hues and exactly which components consume it.
  - Any fund-state or budget-specific colour constants.
  - HatchPattern's currentColor usage sites.

TASK 3 - Confirm zero hardcoded hex
Grep the entire frontend for hardcoded hex/rgb/hsl values outside the theme
definition files. Report every hit - each one is a place this migration
cannot reach automatically and must be fixed by hand.

TASK 4 - List every page/layout currently rendered
Cross-reference against Part 3's mode assignment table and confirm nothing
built is missing from it.
```

Read this fully before RP2. Item 3's hit list determines how much manual work
this migration actually needs beyond the token swap.

---

### RP2 — Contrast gate, in a sandbox (critical)

```
CONTEXT
Read docs/RASIKH-PALETTE-MIGRATION.md Part 2 in full.

Do NOT touch the live theme file in this task. Build a temporary demo route
(e.g. /app/dev/rasikh-tokens) rendering every pairing from the Part 2 table
at real size, in both light and dark, alongside a computed contrast ratio for
each.

Required minimums, per the standard already enforced elsewhere in this
system:
  body text                          4.5:1
  large text (>=18.66px bold, >=24px) 3:1
  meaningful icons and borders       3:1
  focus rings against both surfaces  3:1

Specifically compute:
  - rasikh-indigo-accent text/links against rasikh-wash (dashboard-mode
    combination that did not exist before this migration)
  - Each semantic triad's text value against its own surface value, light
    and dark
  - rasikh-primary as body/link text against the sand neutral surfaces
    (operational mode)

Output a table: pairing | light ratio | dark ratio | pass/fail. Any failure
is a defect in the SOURCE VALUES, not a rule to relax - flag it and propose
an adjusted value that still reads as "DIEZ's colour" (nudge lightness or
saturation, do not swap the hue) rather than silently passing a failing
pair.
```

Read the ratio table yourself. Nothing proceeds past this gate on a guess.

---

### RP3 — Implement tokens and resolve the collision

```
CONTEXT
Read docs/RASIKH-PALETTE-MIGRATION.md Part 1.1, Part 2, and the RP2 gate
output - use whatever values RP2 confirmed pass, not the raw Part 2 table if
any were adjusted.

TASK 1 - Write the confirmed values into the central theme file(s) located in
RP1, light and dark, for every token in Part 2.

TASK 2 - Resolve the teal collision per Part 1.1
Remove teal from getCandidateColor()'s six-hue rotation. Add a sixth hue in
the muted plum/magenta direction, verified against the same contrast minimums
as RP2 before it's finalised. Update every consumer of getCandidateColor() -
grep to confirm none still reference the old teal slot by index assumption.

TASK 3 - Verify categoricalScale() and HatchPattern
Confirm both now ramp from --rasikh-primary (operational) or
--rasikh-indigo-accent (dashboard), matching whichever mode the consuming
chart is in. If a chart currently hardcodes which accent it ramps from
rather than reading the active mode, fix that binding.

TASK 4 - Do NOT yet wire the two-mode data attribute or touch page layouts.
That is RP4. This task is the token layer only.
```

Commit: `feat(theme): implement RASIKH token values`

---

### RP4 — Two-mode architecture

```
CONTEXT
Read docs/RASIKH-PALETTE-MIGRATION.md Part 1.3 and Part 3 in full.

TASK 1 - Implement the data-attribute mechanism
data-surface-mode="dashboard" | "operational" on the appropriate layout
ancestor within (app), resolving --page-bg and --accent-interactive per the
CSS already specified in the source document's mode rule.

TASK 2 - Apply per the Part 3 table
/app/dashboard and /app/reports get dashboard mode. Every other /app/* route
gets operational mode - Requests, HR Review, Budget, Candidates, Interview
Planning/Evaluation, Workforce, Administration.

TASK 3 - Confirm /vendor/* and /c/{token} carry NO surface-mode attribute at
all and are unaffected by this task - they keep their existing teal identity
throughout, per the Part 1.3 scope decision. Grep to confirm neither route
tree references data-surface-mode.

TASK 4 - Screenshot one page from each mode, light and dark, and confirm the
background and accent visibly differ between /app/dashboard and
/app/requests.
```

Commit: `feat(theme): implement dashboard/operational surface modes`

---

### RP5 — Gold, exactly two sites

```
CONTEXT
Read docs/RASIKH-PALETTE-MIGRATION.md Part 4.

TASK 1 - Apply gold to the "Qualified" outcome badge in Interview Evaluation
only. Every other success state on that page and elsewhere in the system
keeps ordinary green - do not let gold bleed into routine completion states.

TASK 2 - Apply gold to the interview-planning plan-complete lift moment.

TASK 3 - Confirm these two never render on screen simultaneously in any
single session flow, and that no third site in the codebase now uses
--rasikh-gold. Grep for it - exactly two consumers.
```

Commit: `feat(theme): apply rare gold accent to two milestone moments`

---

### RP6 — Full-system regression

```
CONTEXT
This is a global token change touching every screen built so far. Read
docs/RASIKH-PALETTE-MIGRATION.md in full before starting.

TASK 1 - Re-screenshot every major screen at 1440px, light and dark:
dashboard, requests list and detail, clarification response, HR review and
send-back, budget control center and amendment, interview planning and
evaluation, vendor portal (all pages from VENDOR-PORTAL-UI.md), candidate
joining readiness, administration (organization, users, security).

TASK 2 - Re-run every contrast-sensitive verification this build has
required elsewhere, now against the new values:
  - DASHBOARD-VISUAL-DEPTH.md item 1's colour audit
  - INTERVIEW-PLANNING-UX.md UX6 item 1's contrast table
  - Any zero-state or semantic-colour check from prior specs that asserted a
    specific tone

TASK 3 - Confirm the candidate identity palette change (RP3 task 2) renders
correctly across every screen that uses it: interview planning, interview
evaluation's panel section, and anywhere a candidate chip appears.

TASK 4 - Grep the full frontend one more time for hardcoded hex, rgb, or hsl
- zero, matching RP1's baseline plus resolution of every hit it found.

TASK 5 - Report anything that visually regressed and why, before calling
this complete.
```

Final gate. This migration touches everything already built - treat this
task as seriously as the original build's own verification steps.

---

## Part 6 — Open items

1. **Confirm the naming scope.** This migration changes colour only. If
   RASIKH is meant to appear as a visible product name anywhere in the UI,
   that's a separate, explicit task — say so and it can be scoped properly
   rather than inferred from a colour document.
2. **Confirm these hex values against an official DIEZ brand guideline** if
   and when one exists, before this reaches production — carried forward
   from the source document's own caveat.
3. **Confirm the sixth candidate-identity hue** (Part 1.1) once RP2's
   contrast gate settles on a final value — a direction was given, not a
   final answer.
