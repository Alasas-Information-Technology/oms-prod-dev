# Plan Interviews — UI

Route: `/app/candidates/interviews/plan/{requestId}`

**UI-only build.** Part 5 defines the API contract. Follows
`APP-SHELL-SPEC.md`, `DASHBOARD-VISUAL-LANGUAGE.md`, and the blind-review rules
in `PROCESS-GAP-ANALYSIS.md` §2.4.

---

## Part 1 — Improvements over the reference

### 1.1 One candidate at a time 🔴

The reference is ambiguous. Radio buttons on the candidate rail imply single
select; "Send to Selected Candidates" implies many; both candidates show
different statuses simultaneously.

**Propose to one candidate at a time.** The rail becomes a queue: pick a
candidate, propose their slots, send, move to the next. Each candidate carries
its own state.

Interview slots are consumed. Offering 10:00 Monday to two people and having
both accept is a clash with no rule to resolve it.

**When a slot is offered to more than one candidate**, mark it explicitly:

> ⓘ This slot is also offered to C-021. Whoever confirms first takes it; the
> other offer is withdrawn automatically and they're told.

That's honest, it's what the system will actually do, and it stops the
interviewer discovering it by accident.

### 1.2 A week calendar, not a time-row grid 🔴

The reference grid has time ranges as rows and days as columns, with three
interviewer initials and tick marks in each cell — 45 micro-indicators to read.
And 10:00–10:45 on Monday is a *different slot* from the same row on Tuesday,
which the layout hides.

**Use a week calendar.** Days as columns, half-hour rows, click or drag to
create a slot. It's the model everyone already knows from Google Calendar and
Calendly, and it makes a slot unmistakably one block of time on one day.

Interviewer availability becomes **cell shading**, not initials:

| Shading | Meaning |
| :--- | :--- |
| Clear | All interviewers free |
| Light hatch | One interviewer busy |
| Heavy hatch | Two or more busy |
| Solid muted | Outside working hours |

Hover reveals exactly who is busy. The interviewer scans for clear space rather
than parsing initials.

### 1.3 Honour the candidate's preference

The reference shows *"Method preference: Online"* and then offers a global
Physical / Online / No Preference toggle. Choosing Physical silently overrides
them.

Default the method to the candidate's preference. If it's changed to something
they didn't ask for, warn inline:

> C-014 asked for an online interview. You've selected in person.

Don't block — sometimes in person is required. But say it.

### 1.4 Two timezones for offshore candidates

Timezone is set to Asia/Dubai. An offshore candidate in India sees different
local times, and nothing on the page acknowledges that.

When the candidate's location differs, show both on every slot:
*"10:00 – 10:45 GST · 11:30 – 12:15 IST"*. And warn when a proposed slot falls
outside 08:00–20:00 in their local time.

### 1.5 "Availability: 2 weeks" is ambiguous

On a scheduling screen, "2 weeks" reads as interview availability. It is
almost certainly the **notice period or lead time to join**.

Relabel it "Notice period" and move it out of the scheduling context, or drop
it from this page — it belongs on the candidate profile, not the slot picker.

### 1.6 Separate service health from candidate status

The Scheduling Status card mixes *"Candidate C-014: Awaiting slot selection"*
with *"Vendor Relay: Ready"* and *"Calendar Service: Connected"*.

Candidate progress belongs on the page. Service health belongs to the admin
dashboard's integration health widget. Show it here only when something is
**down**, as a blocking banner.

### 1.7 One send action

The reference has "Send to Selected Candidates" in the status card *and* "Send
3 Proposed Slots" in the footer. Keep the footer one.

### 1.8 Add what's missing from the RFP

| Missing | Why it matters |
| :--- | :--- |
| **Response deadline** | Nothing tells the candidate when to reply, and nothing tells the interviewer when they'll be chased |
| **Bypass interview** | RFP Step 6 lets the Main Interviewer skip the interview with HOD approval. This is where they'd reach for it |
| **Reschedule** | RFP allows either party to reschedule via the same flow. Needs a state, not just a toggle |
| **Slot guidance** | "Propose 3–5 slots so the candidate has real choice" |

---

## Part 2 — Layout

```
Interviews / OMS-2026-0148 / Plan interviews          [Save draft] [Send slots]
Senior Cybersecurity Analyst · 2 shortlisted
────────────────────────────────────────────────────────────────────────────
 ✓ Candidate review — ② Propose slots — ③ Confirmation — ④ Interview — ⑤ Evaluation
────────────────────────────────────────────────────────────────────────────
┌────────────────┬───────────────────────────────────┬─────────────────────┐
│ CANDIDATES  2  │  ‹  10 – 14 August 2026  ›  Today │ INTERVIEW SETTINGS  │
│                │      Mon  Tue  Wed  Thu  Fri      │ Method              │
│ ● C-014     P1 │  09  ░░░  ░░░  ░░░  ░░░  ░░░      │ (•) Online          │
│   Awaiting     │  10  ███  ▒▒▒       ░░░  ░░░      │ ( ) In person       │
│   reply · 2d   │  11  ███            ▒▒▒  ░░░      │ ⓘ Matches C-014     │
│   Prefers      │  12  ░░░  ░░░  ░░░  ░░░  ░░░      │                     │
│   online       │  14  ███  ███       ░░░  ░░░      │ Duration  45 min ▾  │
│                │  15       ▒▒▒  ░░░  ░░░  ░░░      │ Platform  Teams  ▾  │
│ ○ C-021     P2 │                                   │ Reply by  14 Aug ▾  │
│   Not sent     │  ███ proposed  ▒▒▒ busy  ░░░ free │                     │
│                │  3 slots proposed · aim for 3–5   │ ☑ Candidate can     │
│                │                                   │   suggest others    │
│ Bypass         │  PROPOSED SLOTS                   │ ☑ Rescheduling      │
│ interview ›    │  Mon 10 Aug  10:00–10:45  GST  ✕  │   allowed           │
│                │              11:30–12:15  IST     │                     │
│                │  Mon 10 Aug  14:00–14:45       ✕  │ WHAT THEY GET       │
│                │  Tue 11 Aug  14:00–14:45       ✕  │ Sent via vendor     │
│                │  ⓘ Tue 14:00 also offered to C-021│ relay. Vendor stays │
│                │                                   │ hidden from you.    │
│                │                                   │ [Preview email]     │
└────────────────┴───────────────────────────────────┴─────────────────────┘
 🛈 Either party can reschedule. Every change is audited.
```

Grid: `280px 1fr 320px`. Calendar column flexible. Below 1280px the settings
column moves beneath; below 1024px the candidate rail becomes a dropdown.

---

## Part 3 — Panels

### 3.1 Candidate rail

Queue of shortlisted candidates. One selected at a time.

Per candidate: reference, priority (P1/P2/P3), status, days waiting, and their
method preference. Status: Not sent · Awaiting reply · Slots declined ·
Confirmed · Rescheduling.

Selecting a candidate loads their proposal. Unsaved changes prompt first.

"Bypass interview" sits at the bottom — a link, not a button. It's an exception
route requiring HOD approval, per RFP Step 6.

### 3.2 Calendar

- Week view, days as columns, 30-minute rows, 08:00–20:00 with scroll.
- Click a cell to propose a slot at the configured duration; drag to set a
  custom length.
- Click a proposed slot to remove it.
- Navigation: previous, next, today. Weeks in the past are read-only.
- Availability shading per §1.2, with a hover card naming who's busy.
- **When calendar integration is unavailable**, show that plainly — *"Interviewer
  availability isn't connected. Check with them before proposing."* — rather
  than rendering everything as free.

### 3.3 Proposed slots

List beneath the calendar. Each: day, date, time, dual timezone where relevant,
remove.

Collision marker per §1.1 where a slot is also offered elsewhere.

Guidance: *"3 slots proposed · aim for 3–5"*. Warn below 2 — one slot isn't a
choice.

### 3.4 Settings

Method, duration, platform or location, reply-by date, and the two toggles.

- Method defaults to the candidate's preference, with a confirmation line when
  it matches and a warning when it doesn't (§1.3).
- **Online** shows platform; **In person** shows location. Never both.
- Reply-by defaults to 3 working days, minimum 1, maximum the earliest proposed
  slot minus 1 day. Proposing a slot the candidate can't reply in time for is a
  mistake worth preventing.

### 3.5 What they get

The blind boundary made visible:

> Sent through the vendor relay. The vendor's identity stays hidden from you,
> and your contact details stay hidden from them.
>
> They'll see: 3 proposed times, the interview method, and the duration.
> They won't see: interviewer names, department, or the request.

Plus **Preview email**, showing the exact message.

Per the process gap analysis §2.4, the interviewer must never learn the vendor
and the vendor must never learn the interviewer. Stating it reassures the
interviewer that the anonymisation is working rather than broken.

---

## Part 4 — Reschedule and follow-up

Two states the reference doesn't cover.

**Reschedule** — either party may. Reopens this page with the existing
confirmed slot shown as withdrawn, the reason, and a request to propose again.
Rescheduling counts are visible: *"Rescheduled twice"* is worth knowing.

**After the slot passes** — the RFP requires the interviewer to confirm whether
it happened. That's step 4 of the stepper, not this page, but the candidate rail
must show *"Awaiting outcome · 1 day overdue"* so nothing is silently dropped.

---

## Part 5 — API contract

Document as `docs/INTERVIEW-PLANNING-API-CONTRACT.md`.

```
GET /api/v1/requests/{requestId}/interviews/planning
```

```jsonc
{
  "request": { "id": "OMS-2026-0148", "position": "Senior Cybersecurity Analyst" },
  "canSchedule": true,
  "isMainInterviewer": true,
  "readOnlyReason": null,

  "candidates": [{
    "candidateRef": "C-014",
    "priority": "P1",
    "status": "NOT_SENT" | "AWAITING_REPLY" | "DECLINED" | "CONFIRMED"
            | "RESCHEDULING" | "AWAITING_OUTCOME",
    "daysWaiting": 2,
    "methodPreference": "ONLINE" | "PHYSICAL" | "NO_PREFERENCE",
    "timezone": "Asia/Kolkata",
    "isOffshore": true,
    "rescheduleCount": 0,
    "proposal": { "slots": [...], "settings": {...}, "sentAt": null }
  }],

  "interviewers": [
    { "userId": "…", "name": "Noura Al Mazrouei", "initials": "NA", "isMain": true }
  ],

  "availability": {
    "connected": true,
    "source": "OUTLOOK",
    "busy": [{ "userId": "…", "from": "2026-08-10T10:00:00Z", "to": "…" }],
    "workingHours": { "start": "09:00", "end": "17:00", "timezone": "Asia/Dubai",
                      "workingDays": [1,2,3,4,5] }
  },

  "settings": {
    "defaultDurationMinutes": 45,
    "timezone": "Asia/Dubai",
    "platforms": ["MICROSOFT_TEAMS", "ZOOM"],
    "locations": [{ "id": "…", "name": "DIEZ HQ, Meeting Room 3" }],
    "defaultReplyDays": 3
  },

  "collisions": [
    { "slotStart": "2026-08-11T14:00:00Z", "alsoOfferedTo": ["C-021"] }
  ],

  "blindBoundary": {
    "vendorHiddenFromInterviewer": true,
    "interviewerHiddenFromVendor": true,
    "relayActive": true
  },

  "bypass": { "available": true, "requiresApprovalFrom": { "name": "Khalid Al Suwaidi" } }
}
```

```
PUT  …/interviews/planning/{candidateRef}/draft
POST …/interviews/planning/{candidateRef}/send
{
  "slots": [{ "start": "2026-08-10T06:00:00Z", "durationMinutes": 45 }],
  "method": "ONLINE",
  "platform": "MICROSOFT_TEAMS",
  "location": null,
  "replyByDate": "2026-08-14",
  "allowAlternatives": true,
  "allowReschedule": true,
  "idempotencyKey": "uuid"
}
```

```
GET  …/interviews/planning/{candidateRef}/preview-email
POST …/interviews/planning/{candidateRef}/bypass-request
```

### Server requirements

1. **All slot times are UTC ISO strings.** The client renders in the configured
   timezone and the candidate's. Never send local times without an offset.
2. **Re-check availability and collisions at send time.** What the interviewer
   saw is a preview; a colleague may have booked the slot since.
3. **The interviewer must never receive vendor identity** in any payload on this
   route, including error messages. The relay is server-side.
4. **Only the Main Interviewer may send.** Other interviewers get read-only —
   RFP Step 1 gives the Main Interviewer exclusive authority.
5. Idempotency key mandatory on send.
6. Reject a `replyByDate` on or after the earliest proposed slot.
7. Bypass requests route to the HOD and do not schedule anything.

---

## Part 6 — Prompts

### IV1 — Contract, types, fixtures

```
CONTEXT
You are in the OMS frontend repo (Next.js 16, React 19, TypeScript, Tailwind 4,
shadcn/ui). Read first:
  docs/INTERVIEW-PLANNING-UI.md   (this spec)
  CLAUDE.md
  docs/APP-SHELL-SPEC.md
  docs/DASHBOARD-VISUAL-LANGUAGE.md
  docs/PROCESS-GAP-ANALYSIS.md   (section 2.4, the anonymised evaluation boundary)

The interview backend does not exist. Define the contract, then build against
fixtures.

TASK 1 — Write docs/INTERVIEW-PLANNING-API-CONTRACT.md
Transcribe Part 5 in full: the planning GET, draft PUT, send POST, preview and
bypass endpoints, every payload shape, and all seven server requirements with
rationale.

State requirement 3 prominently: the interviewer must NEVER receive vendor
identity in any payload on this route, including error messages. The relay is
server-side. This is the anonymised evaluation boundary and a leak here defeats
blind review entirely.

State requirement 1 prominently too: all slot times are UTC ISO strings. Local
times without an offset will produce wrong slots for offshore candidates, and
that failure is silent.

TASK 2 — src/types/interview-planning.ts
Interfaces for every Part 5 shape. Model status as a union so impossible states
are unrepresentable.

TASK 3 — src/lib/interview-planning/fixtures.ts
Build FIVE fixtures — the variety matters more than the volume:
  a) The reference case: OMS-2026-0148, Senior Cybersecurity Analyst, two
     candidates C-014 (P1, prefers online, awaiting reply 2 days) and C-021
     (P2, no preference, not sent). Three interviewers: Noura Al Mazrouei
     (main), Yousef Al Falasi, Omar Al Hashmi. Working hours 09:00-17:00
     Asia/Dubai. Busy blocks producing clear, one-busy and two-busy cells.
     One collision on Tue 11 Aug 14:00 shared with C-021.
  b) An OFFSHORE candidate in Asia/Kolkata, to exercise dual-timezone display.
  c) availability.connected = false, to exercise the disconnected state.
  d) A candidate in RESCHEDULING with rescheduleCount 2.
  e) isMainInterviewer false, to exercise read-only.

TASK 4 — src/lib/interview-planning/api.ts
Data hooks matching the existing pattern in this repo — check how the requests
module fetches and match it exactly. Include a 2s debounced draft save.

No UI in this task.
```

✅ `feat(interviews): define planning contract and fixtures`

---

### IV2 — Shell, stepper, candidate rail

```
CONTEXT
Read docs/INTERVIEW-PLANNING-UI.md Parts 1.1, 1.5, 2, 3.1.

TASK 1 — Route and shell
/app/candidates/interviews/plan/[requestId].
Breadcrumb is the page title per APP-SHELL-SPEC.md: Interviews / OMS-2026-0148
/ Plan interviews. Do NOT add a separate heading block.
Sub-line: position and shortlisted count.
Page-bar actions: Save draft (ghost), Send slots (primary).

TASK 2 — Stepper
Five steps: Candidate review, Propose slots, Confirmation, Interview,
Evaluation. Current step filled, completed steps checked, pending muted.
Reuse the stepper from APPROVAL-WORKFLOW-SPEC.md rather than building a third
one. Grep for existing stepper components first and report what you find.

TASK 3 — Candidate rail, 280px, own scroll
ONE candidate selected at a time. The reference is ambiguous — radio buttons
imply single select but "Send to Selected Candidates" implies many, and
interview slots are consumed, so proposing the same slot to two people is a
clash with no resolution rule.

Per candidate: reference in mono, priority badge, status, days waiting, method
preference.
Statuses with distinct treatment: Not sent, Awaiting reply, Declined,
Confirmed, Rescheduling, Awaiting outcome.
"Awaiting outcome" past its slot shows overdue in amber — the RFP requires the
interviewer to confirm whether the interview happened, and nothing must silently
drop.

Selecting a candidate loads their proposal. Unsaved changes prompt first.

TASK 4 — Relabel "Availability"
The reference shows "Availability: 2 weeks" which on a scheduling screen reads
as interview availability. It is a notice period. Relabel it "Notice period" or
remove it from this page — it belongs on the candidate profile.

TASK 5 — Bypass link at the bottom of the rail
A text link, not a button. Per RFP Step 6 the Main Interviewer may bypass the
interview with HOD approval. Name the approver from the bypass payload.
Visible only when bypass.available is true.

TASK 6 — Read-only
When isMainInterviewer is false, the whole page is read-only with
readOnlyReason shown, and both page-bar actions ABSENT — not disabled. Per RFP
Step 1 only the Main Interviewer has scheduling authority.
```

✅ `feat(interviews): add planning shell and candidate rail`

---

### IV3 — Calendar 🔴

```
CONTEXT
Read docs/INTERVIEW-PLANNING-UI.md 1.2, 1.4, 3.2, 3.3. Plan first and show me
the plan.

This replaces the reference's time-row grid, which has time ranges as rows and
days as columns with three interviewer initials per cell — 45 micro-indicators
to parse. It also hides that 10:00 Monday and 10:00 Tuesday are different slots.

TASK 1 — Week calendar
Days as columns, 30-minute rows, 08:00 to 20:00 with scroll.
Header: previous, week range, next, Today.
Weeks in the past are read-only.
This is the Google Calendar / Calendly model everyone already knows.

TASK 2 — Availability shading, NOT initials
  Clear        all interviewers free
  Light hatch  one busy
  Heavy hatch  two or more busy
  Solid muted  outside working hours or a non-working day

Use HatchPattern from the dashboard work rather than a new pattern.
Hover shows a card naming exactly who is busy.
The interviewer should scan for clear space, not decode initials.

TASK 3 — Creating slots
Click a cell to propose a slot at the configured duration.
Drag to set a custom length, snapping to 15 minutes.
Click a proposed slot to remove it.
Proposed slots render solid in the accent.
Keyboard: arrows move a cursor cell, Enter proposes, Delete removes.

TASK 4 — Disconnected availability (fixture c)
When availability.connected is false, do NOT render every cell as free — that
is a lie. Show a banner: "Interviewer availability isn't connected. Check with
them before proposing." Cells render neutral with no shading.

TASK 5 — Proposed slots list beneath
Day, date, time, remove. Guidance line: "3 slots proposed · aim for 3-5".
Warn below 2 — one slot is not a choice.

TASK 6 — Dual timezone (fixture b)
When the candidate is offshore, EVERY slot shows both times:
"10:00 - 10:45 GST · 11:30 - 12:15 IST".
Warn when a slot falls outside 08:00-20:00 in their local time.
The reference ignores this entirely, and the resulting mistake is silent.

TASK 7 — Collisions
A slot also offered to another candidate shows an inline note: "Also offered to
C-021. Whoever confirms first takes it; the other offer is withdrawn
automatically."
Honest about what the system does, so the interviewer does not discover it by
accident.

In your plan, state how drag-to-create interacts with the availability shading,
and how you keep the grid performant across a full week.
```

🛑 Read the plan. Then test the disconnected fixture — no cell may imply
availability that was never checked.

✅ `feat(interviews): add week calendar and slot selection`

---

### IV4 — Settings and preferences

```
CONTEXT
Read docs/INTERVIEW-PLANNING-UI.md 1.3, 3.4.

TASK 1 — Settings panel, 320px
Method, duration, platform or location, reply-by date, and two toggles:
"Candidate can suggest other times" and "Rescheduling allowed".

TASK 2 — Honour the candidate's preference
Method DEFAULTS to the selected candidate's methodPreference.
  When it matches:    a quiet confirmation, "Matches C-014's preference"
  When it does not:   an inline warning, "C-014 asked for an online interview.
                      You've selected in person."
Warn, do not block — sometimes in person is required. But the reference shows
the preference and then lets you silently override it, which is worse than not
showing it at all.

TASK 3 — Method-dependent fields
ONLINE shows the platform selector and hides location.
PHYSICAL shows the location selector and hides platform.
Never both. The reference renders both with "Location: –", which is clutter.

TASK 4 — Reply-by date
Defaults to 3 working days from today.
Minimum 1 day. MAXIMUM is the earliest proposed slot minus 1 day — reject
anything later with the reason stated. Proposing a slot the candidate cannot
reply in time for is a mistake worth preventing outright.
Show it as "Reply by Thu 14 Aug (3 working days)".

TASK 5 — Duration
Changing duration resizes every existing proposed slot and re-checks
availability. Warn if a resize creates a conflict.

TASK 6 — Settings are per candidate
Switching candidates loads their settings, not the previous candidate's.
```

✅ `feat(interviews): add interview settings with preference handling`

---

### IV5 — Blind boundary and email preview

```
CONTEXT
Read docs/INTERVIEW-PLANNING-UI.md 3.5 and PROCESS-GAP-ANALYSIS.md 2.4.

TASK 1 — "What they get" panel
Make the blind boundary visible and reassuring:

  "Sent through the vendor relay. The vendor's identity stays hidden from you,
   and your contact details stay hidden from them.

   They'll see: 3 proposed times, the interview method, and the duration.
   They won't see: interviewer names, department, or the request."

Interviewers who do not understand why they cannot see the vendor assume the
system is broken. Stating it turns a limitation into a feature.

TASK 2 — Preview email
Opens a modal showing the exact message the candidate receives, rendered as it
will appear.
It must contain NO interviewer names, NO department, NO request reference, and
NO vendor identity.
Add a note in the modal: "This is exactly what they receive."

TASK 3 — Enforcement audit
Grep every component on this route for vendor fields. Confirm the fixtures
carry no vendor identity at all, and that no component would render it if the
API mistakenly sent it.

Requirement 3 of the contract is that the server never sends it. The client
should also never be capable of showing it — defence in depth on the one
boundary that makes blind review real.

Report what you checked.
```

🛑 Verify by hand: search the rendered DOM for any vendor name in the fixtures.

✅ `feat(interviews): add blind boundary panel and email preview`

---

### IV6 — Send, status and reschedule

```
CONTEXT
Read docs/INTERVIEW-PLANNING-UI.md 1.6, 1.7, Part 4, Part 5 server
requirements.

TASK 1 — One send action
The reference has "Send to Selected Candidates" in a status card AND "Send 3
Proposed Slots" in the footer. Keep only the page-bar action, labelled with the
count: "Send 3 slots".

TASK 2 — Remove service health from candidate status
The reference mixes "Candidate C-014: Awaiting slot selection" with "Vendor
Relay: Ready" and "Calendar Service: Connected". Candidate progress belongs
here; service health belongs to the admin dashboard's integration health
widget.
Show service state on this page ONLY when something is down, as a blocking
banner: "The vendor relay is unavailable. Slots can't be sent right now."

TASK 3 — Send confirmation
Restate before sending: candidate reference, number of slots with their times,
method, reply-by date, and that it goes via the vendor relay.
Warn but do not block when fewer than 2 slots are proposed.

TASK 4 — Idempotency and errors
Key generated once when the confirmation opens, reused on retry.
Errors, each with a plain message:
  INTERVIEW_SLOT_TAKEN        Name the slot; a colleague booked it since. Ask
                              them to choose another. Do NOT auto-resubmit.
  INTERVIEW_RELAY_UNAVAILABLE "Slots can't be sent right now. Save as a draft
                              and try again shortly."
  INTERVIEW_NOT_MAIN          "Only the main interviewer can send slots."
  INTERVIEW_REPLY_DATE_INVALID Name the earliest slot and the latest valid
                              reply date.

TASK 5 — Reschedule state (fixture d)
When a candidate is RESCHEDULING, the page opens with the withdrawn slot shown,
the reason, and a prompt to propose again.
Show the reschedule count where above zero: "Rescheduled twice" — worth knowing
before you propose a third time.

TASK 6 — Bypass request
The rail link opens a dialog: justification required, naming the HOD who will
decide. On submit it routes for approval and schedules nothing. Per RFP Step 6,
if the HOD rejects it the candidate returns to shortlisted — state that in the
dialog.

TASK 7 — Success
Return to the candidate rail with the sent candidate updated to "Awaiting
reply" and, if another candidate is Not sent, offer to move to them.
```

✅ `feat(interviews): add send flow, status and reschedule`

---

### IV7 — Verify

```
Verify. Report: check | expected | actual | pass.

CANDIDATE MODEL
1. Exactly one candidate is selected at a time.
2. Switching candidates loads that candidate's slots AND settings.
3. Unsaved changes prompt before switching.
4. A collision shows the inline note naming the other candidate.

CALENDAR
5. Week view with days as columns and 30-minute rows.
6. Availability renders as shading, not initials.
7. Hover names exactly who is busy.
8. Click creates a slot; drag sets a custom length snapping to 15 minutes.
9. Keyboard: arrows move, Enter proposes, Delete removes.
10. Past weeks are read-only.
11. DISCONNECTED fixture: no cell implies availability that was never checked.

TIMEZONE
12. Offshore fixture shows both timezones on every slot.
13. A slot outside 08:00-20:00 local warns.
14. Grep for local time strings sent to the API — all times must be UTC ISO.

PREFERENCES
15. Method defaults to the candidate's preference.
16. A mismatch warns inline and does not block.
17. Online shows platform only; in person shows location only. Never both.
18. Reply-by cannot be on or after the earliest slot.

BLIND BOUNDARY — highest priority
19. Grep every component on this route for vendor fields — none.
20. The email preview contains no interviewer name, department, request
    reference or vendor identity.
21. Search the rendered DOM across all fixtures for any vendor name — none.

SEND
22. One send action only.
23. Service health appears only when something is down.
24. Fewer than 2 slots warns but does not block.
25. Double-clicking Send fires one request.
26. Every error renders its specific plain message.
27. INTERVIEW_SLOT_TAKEN does not auto-resubmit.

REST
28. isMainInterviewer false: both actions ABSENT, not disabled.
29. Reschedule fixture opens correctly and shows the count.
30. Responsive 1440, 1280, 1024, 768. Light and dark.
31. No status codes or field keys visible anywhere.
```

🛑 Final gate. Item 21 is the one that matters.

---

## Part 7 — Questions for DIEZ

1. **Are candidate names visible to the interviewer, or only references like
   C-014?** The RFP hides *vendor* identity and quotes during blind review, not
   candidate identity. The reference shows references only. Confirm which.
2. **Can the same slot be offered to two candidates?** §1.1 assumes yes with
   first-come resolution. The alternative is blocking it outright.
3. **Is interviewer calendar availability integrated at launch,** or manual? The
   architecture names Email & Calendar as an integration, but nothing is built.
4. **How many reschedules are allowed** before it escalates?
5. **When the reply-by date passes with no response,** what happens — automatic
   withdrawal, a reminder, or interviewer action?
