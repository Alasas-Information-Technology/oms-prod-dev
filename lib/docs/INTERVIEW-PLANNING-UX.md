# Plan Interviews — UX Redesign

**Supersedes the layout and flow in `INTERVIEW-PLANNING-UI.md`.** The API
contract (Part 5), blind boundary rules (3.5) and validation logic all stand —
this changes *how the work is done*, not what it does.

---

## Part 1 — Invert the work

### 1.1 The system proposes; the human curates 🔴

Today the interviewer hunts: read three calendars, find overlap, check the
candidate's timezone, click cells, hope. That's a **computation**, and we're
asking a person to do it by eye.

**Flip it.** The system finds every time when the required interviewers are
free, ranks them, and presents them as decisions:

```
Tue 11 Aug · 10:00 – 10:45
All three free · Morning · 4 days out · 11:30 IST for the candidate
                                              [ Add to plan ]
```

She reads a recommendation and says yes or no. That's the whole difference
between filling in a form and making a decision — and it's where the
satisfaction comes from.

The calendar stays, as a second tab, for people who want manual control or need
a specific time. But it is no longer the primary surface.

### 1.2 Plan the round, not each candidate

She has two candidates. The old flow makes her do everything twice.

Reframe it as **one interview round**: pick good times once, then assign them.
"Both on Tuesday afternoon, back to back" is what she actually wants, and the
old flow can't express it.

### 1.3 No wizard

A four-step wizard would be worse than what exists. Instead: **one canvas** with
progressive disclosure.

- Settings collapse to a single summary bar once set
- Suggestions occupy the middle
- A live plan tray on the right shows what's been built
- Review and send is one action at the end

It should feel like a tool, not a queue of forms.

---

## Part 2 — The flow

```
1. FRAME       Three decisions, ~20 seconds
               Who interviews · how long · online or in person · earliest date
               Everything else has a sensible default.
               ↓ collapses to a summary bar

2. CURATE      Ranked suggestions. Add to plan, or dismiss.
               Toggle to Calendar for manual control.
               ↓ plan tray fills as you go

3. ASSIGN      Drag slots between candidates, or auto-assign.
               Collisions are visible, not discovered later.

4. SEND        One preview per candidate. One send.
```

No step navigation. The page flows top to bottom; the tray tracks progress.

---

## Part 3 — Stepper

The five-step rail (Candidate review → Propose slots → Confirmation →
Interview → Evaluation) is **lifecycle context**, not navigation for this page.
Rendered as a full stepper in the middle of the layout, it interrupts.

Replace with a **4px progress rail** directly beneath the breadcrumb, spanning
the content width:

```
Interviews / OMS-2026-0148 / Plan interviews
▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  Propose slots · 2 of 5
```

- Five segments, 2px gaps, 4px tall
- Completed segments in accent; current in accent at 100% with a subtle
  animated shimmer on load only; pending at 12% foreground
- Label right-aligned, 11px muted
- Hover or focus expands to the full five-step detail in a popover
- On mobile, the label alone

Present, informative, and out of the way.

---

## Part 4 — Layout

```
Interviews / OMS-2026-0148 / Plan interviews          [Save draft] [Review & send]
▬▬▬▬▬▬▬▬▬▬▬▬▬░░░░░░░░░░░░░░░░░░░  Propose slots · 2 of 5
────────────────────────────────────────────────────────────────────────────
 👤 Noura + 2   ⏱ 45 min   💻 Online   📅 From 10 Aug   🌍 GST          Edit
────────────────────────────────────────────────────────────────────────────
┌──────────────────────────────────────────────┬─────────────────────────┐
│  [ Suggested times ]  [ Calendar ]           │  YOUR PLAN              │
│                                              │                         │
│  ┌────────────────────────────────────────┐  │  ╭─ C-014 ────── P1 ─╮  │
│  │ ★ BEST MATCH                           │  │  │ Tue 11 Aug 10:00 ✕│  │
│  │ Tue 11 Aug        10:00 – 10:45        │  │  │ Wed 12 Aug 14:00 ✕│  │
│  │ ● ● ●  All three free                  │  │  │ Thu 13 Aug 09:30 ✕│  │
│  │ Morning · 4 days out · 11:30 IST       │  │  │ ✓ 3 of 3 · ready  │  │
│  │                        [ Add to plan ] │  │  ╰───────────────────╯  │
│  └────────────────────────────────────────┘  │                         │
│  ┌────────────────────────────────────────┐  │  ╭─ C-021 ────── P2 ─╮  │
│  │ Wed 12 Aug        14:00 – 14:45        │  │  │ Drop a time here  │  │
│  │ ● ● ●  All three free                  │  │  │ or add from the   │  │
│  │ Afternoon · 5 days out                 │  │  │ suggestions       │  │
│  │                        [ Add to plan ] │  │  │ 0 of 3            │  │
│  └────────────────────────────────────────┘  │  ╰───────────────────╯  │
│  ┌────────────────────────────────────────┐  │                         │
│  │ Thu 13 Aug        09:30 – 10:15        │  │  ⓘ Tue 10:00 is in     │
│  │ ● ● ○  Omar is busy                    │  │    both plans. First   │
│  │ Morning · 6 days out                   │  │    to confirm wins.    │
│  └────────────────────────────────────────┘  │                         │
│                            [ Show 6 more ]   │                         │
└──────────────────────────────────────────────┴─────────────────────────┘
```

Grid `1fr 340px`. Tray sticky. Below 1280px the tray moves beneath;
below 1024px it becomes a bottom sheet showing the count, expanding on tap.

### 4.1 Frame bar

One row of chips summarising the four decisions. Click any chip to edit inline —
a small popover, not a modal, not a panel.

Changing anything recomputes suggestions with a 200ms crossfade. Never a full
reload; the list re-ranks in place.

### 4.2 Suggestion card

The centrepiece. Every element earns its place:

| Element | Purpose |
| :--- | :--- |
| **Rank badge** | "Best match" on the top card only. Nothing else is ranked visually |
| **Date and time**, large | The decision |
| **Availability dots** | One per interviewer, filled if free. Names on hover |
| **Reason line** | *"Morning · 4 days out · 11:30 IST"* — why this is good |
| **Add to plan** | The action. Splits into a per-candidate menu when more than one candidate needs slots |

Cards with a busy interviewer sort lower, render at 85% opacity, and name who's
busy. Not hidden — sometimes you proceed anyway.

**Dismissing** a card slides it out and pulls the next one up. Dismissed
suggestions collect behind a "3 dismissed" link.

### 4.3 Plan tray

One card per candidate, tinted with that candidate's identity colour (§5.2).

- Slot chips, removable, drag-reorderable
- **Drag between candidates** to reassign
- Progress: "2 of 3" → "✓ 3 of 3 · ready" in success green
- Empty: a dashed drop zone, not blank
- Collision note when a slot appears in two plans

When every candidate is ready, **Review & send** becomes primary and lifts
once. That single moment of feedback is the reward for finishing.

### 4.4 Calendar tab

Everything from `INTERVIEW-PLANNING-UI.md` §3.2 — week grid, availability
shading, click and drag. Unchanged, just no longer the default.

Slots added here appear in the tray identically. The two tabs are two ways into
one plan.

---

## Part 5 — Colour

"Colourful and corporate" means **confident semantic colour**, not decoration.
Every hue carries a fixed meaning, used the same way everywhere.

### 5.1 Semantic palette — five meanings

| Meaning | Use |
| :--- | :--- |
| **Accent** | Primary actions, selection, progress |
| **Success** | Everyone free, plan ready, confirmed |
| **Warning** | Partial availability, tight timing, preference mismatch |
| **Danger** | Conflict, declined, blocked |
| **Info** | System-generated suggestions, automation notices |

Each needs a **surface** tint, a **border**, and a **text** value that clears
contrast on both — fifteen tokens, defined once.

Nothing on this page uses colour for any other reason.

### 5.2 Candidate identity colours

This is where colour genuinely adds information. Each candidate in the round
gets a hue, used consistently for their tray card, their chips, and their slots
on the calendar.

- A fixed palette of six, assigned by position: violet, teal, amber, rose, sky,
  lime
- Used only as a **left border, a soft tint, and an avatar background** —
  never as a full fill, never behind body text
- **Always paired with the candidate reference**, never colour alone

Two candidates on one calendar are instantly separable. That's the payoff.

### 5.3 Contrast — non-negotiable

| Element | Minimum |
| :--- | :--- |
| Body text | **4.5:1** |
| Large text (≥18.66px bold / ≥24px) | **3:1** |
| Icons and borders carrying meaning | **3:1** |
| Focus ring against both surfaces | **3:1** |
| Disabled text | 4.5:1 — disabled is not exempt when it must be readable |

**Never colour alone.** Availability dots carry an icon or fill state.
Candidate colours carry the reference. Status carries a label.

Test every token pair in both themes and report actual ratios.

---

## Part 6 — Dark mode

Dark mode is a **redesign at lower luminance**, not an inversion.

| Aspect | Light | Dark |
| :--- | :--- | :--- |
| Surfaces | White, one step down for the page | **Three elevations**, each ~4% lighter than the last. Cards must lift off the page |
| Accent | As defined | **Lighten ~15%** — dark backgrounds swallow saturated mid-tones |
| Semantic hues | As defined | **Desaturate ~20%, lighten ~10%.** Full-saturation red on near-black vibrates |
| Borders | 8% foreground | **14%** — the same value disappears in dark |
| Candidate tints | 8% | **12%**, on a lighter surface |
| Shadows | Two-layer | Replace with **borders and elevation**; shadows do nothing on dark |
| Hatch patterns | 18% | **24%** |

Common failure to check for: a card tinted with a candidate colour at 8% is
invisible on a dark surface, so candidate identity silently disappears.

---

## Part 7 — Motion

Engagement comes from **responsiveness and good feedback**, not decoration.

| Interaction | Treatment |
| :--- | :--- |
| Add to plan | Chip animates from card to tray, 240ms, with a spring-free ease |
| Dismiss | Card slides right and out, 180ms; list closes the gap |
| Recompute | 200ms crossfade; the list never blanks |
| Plan complete | Tray card border transitions to success, 300ms, once |
| Review becomes ready | Button lifts 2px and settles, once |
| Drag | Chip follows the cursor at 1.02 scale; valid targets outline |

One easing curve: `cubic-bezier(0.2, 0, 0, 1)`. Nothing loops. Nothing pulses
more than once. `prefers-reduced-motion` replaces every movement with an opacity
change.

**No confetti, no sound, no celebration animation.** This is someone's job.

---

## Part 8 — Keyboard

Enjoyment for a repeat user is speed.

| Key | Action |
| :--- | :--- |
| `1`–`9` | Add that suggestion to the active candidate |
| `↑` `↓` | Move through suggestions |
| `X` | Dismiss the focused suggestion |
| `Tab` | Switch active candidate in the tray |
| `⌘Z` | Undo the last plan change |
| `C` | Toggle Calendar / Suggested |
| `?` | Shortcut overlay |

Every plan change is undoable. Nothing here should feel risky.

---

## Part 9 — API addition

One new endpoint, and it is real computation — calendar intersection plus
ranking. **Server-side only.**

```
GET /api/v1/requests/{id}/interviews/suggestions
    ?from=&durationMinutes=&method=&interviewerIds=&candidateRef=&limit=
```

```jsonc
{
  "suggestions": [{
    "slotId": "…",
    "start": "2026-08-11T06:00:00Z",
    "durationMinutes": 45,
    "score": 0.94,
    "rank": 1,
    "isBestMatch": true,
    "availability": [
      { "userId": "…", "name": "Noura Al Mazrouei", "free": true },
      { "userId": "…", "name": "Omar Al Hashmi", "free": false, "reason": "Busy" }
    ],
    "allFree": false,
    "reasons": ["MORNING", "FOUR_DAYS_OUT", "WITHIN_CANDIDATE_HOURS"],
    "candidateLocalTime": { "timezone": "Asia/Kolkata", "start": "11:30", "end": "12:15" },
    "warnings": []
  }],
  "totalFound": 9,
  "availabilityConnected": true,
  "computedAt": "2026-08-06T09:12:00Z"
}
```

**Requirements**

1. **Ranking is server-side.** The client never scores or sorts — a client
   ranking will diverge from the reasons shown beside it.
2. `reasons` are **codes**, not sentences. The client renders the wording so it
   can be localised.
3. Suggestions honour the candidate's working hours and timezone.
4. Slots already in a plan are excluded.
5. When availability is not connected, return an empty list with
   `availabilityConnected: false` — **never** return every slot as free.
6. Recompute on every frame change; do not cache across parameter sets.

---

## Part 10 — Prompts

Run after IV1–IV2. Replaces IV3–IV6.

### UX1 — Tokens, contrast, dark mode 🔴

```
CONTEXT
You are in the OMS frontend repo (Next.js 16, React 19, TypeScript, Tailwind 4,
shadcn/ui). Read:
  docs/INTERVIEW-PLANNING-UX.md      (this spec)
  docs/INTERVIEW-PLANNING-UI.md
  docs/DASHBOARD-VISUAL-LANGUAGE.md
  CLAUDE.md

Build the colour foundation before any UI. Everything else depends on it.

TASK 1 — Semantic tokens per 5.1
Define five meanings — accent, success, warning, danger, info — each with a
surface tint, a border, and a text value. Fifteen tokens, defined once, in the
theme. Extend the existing theme; do not create a parallel system.

TASK 2 — Candidate identity palette per 5.2
Six hues assigned by position: violet, teal, amber, rose, sky, lime.
Each used ONLY as a left border, a soft surface tint, and an avatar background.
NEVER as a full fill, NEVER behind body text.
Export getCandidateColor(index) so the tray, chips and calendar all resolve the
same hue for the same candidate.

TASK 3 — Contrast audit per 5.3
Compute and REPORT the actual ratio for every token pair in BOTH themes:
  body text 4.5:1 · large text 3:1 · meaningful icons and borders 3:1 ·
  focus rings 3:1 · disabled text 4.5:1
Output a table: token | light ratio | dark ratio | pass.
Fix anything failing by adjusting the token, not by changing the requirement.

TASK 4 — Dark mode per Part 6
This is a redesign at lower luminance, not an inversion.
  Three surface elevations, each ~4% lighter than the last — cards must lift
  off the page
  Accent lightened ~15%
  Semantic hues desaturated ~20% and lightened ~10% — full-saturation red on
  near-black vibrates
  Borders 14%, up from 8% — the same value disappears in dark
  Candidate tints 12%, up from 8%
  Shadows replaced by borders and elevation
  Hatch patterns 24%, up from 18%

CHECK SPECIFICALLY: a card tinted with a candidate colour at 8% is invisible on
a dark surface. Candidate identity must survive both themes.

TASK 5 — Demo page at /app/dev/interview-tokens
Every token, both themes, side by side, with contrast ratios rendered on screen.
```

🛑 Read the contrast table yourself. Anything failing is a defect, not a
preference.

✅ `feat(interviews): add semantic and candidate colour system`

---

### UX2 — Progress rail and frame bar

```
CONTEXT
Read docs/INTERVIEW-PLANNING-UX.md Parts 3 and 4.1.

TASK 1 — Replace the five-step stepper
The current stepper sits in the middle of the layout and interrupts. It is
lifecycle CONTEXT, not navigation for this page.

Build a 4px progress rail directly beneath the breadcrumb, spanning the content
width:
  Five segments, 2px gaps, 4px tall
  Completed in accent, current at full accent, pending at 12% foreground
  Label right-aligned, 11px muted: "Propose slots · 2 of 5"
  Hover or keyboard focus expands the full five-step detail in a popover
  Mobile shows the label only
  The current segment shimmers ONCE on load, never repeating

Delete the old stepper from this page entirely.

TASK 2 — Frame bar per 4.1
One row of chips summarising four decisions:
  Interviewers · duration · method · earliest date · timezone
Each chip opens a small inline popover to edit. Not a modal. Not a side panel.
An "Edit" affordance at the right opens all of them.

Changing any value recomputes suggestions with a 200ms crossfade. The list
re-ranks IN PLACE — never blank the list, never full-reload the page.

TASK 3 — Defaults
Interviewers from the request. Duration 45 minutes. Method from the selected
candidate's preference. Earliest date is two working days out — proposing
tomorrow rarely works.

The frame should take about twenty seconds. Everything has a sensible default;
the interviewer only touches what is wrong.
```

✅ `feat(interviews): add progress rail and frame bar`

---

### UX3 — Suggestion engine 🔴

```
CONTEXT
Read docs/INTERVIEW-PLANNING-UX.md Parts 1.1, 4.2, 9. Plan first and show me
the plan.

This is the core change. Today the interviewer hunts through three calendars
for overlap — a computation we are asking a person to do by eye. Invert it: the
system proposes, the human curates.

TASK 1 — Extend the API contract
Add the suggestions endpoint from Part 9 to
docs/INTERVIEW-PLANNING-API-CONTRACT.md with all six requirements and their
rationale.

State requirement 1 prominently: ranking is SERVER-SIDE. The client never
scores or sorts. A client-side ranking will eventually disagree with the
reasons displayed beside it, and the interviewer will trust the wrong one.

State requirement 5 prominently: when availability is not connected, return an
EMPTY list with availabilityConnected false. Never return every slot as free —
that is a lie that causes double-booking.

TASK 2 — Fixtures
Nine suggestions for the reference case: three with all interviewers free, four
with one busy, two with two busy. One best match. One offshore candidate
variant with candidateLocalTime populated. One with availabilityConnected
false.

TASK 3 — SuggestionCard per 4.2
  "Best match" rank badge on the top card ONLY
  Date and time, large — this is the decision
  One availability dot per interviewer, filled when free, names on hover.
  Dots carry a fill state as well as colour — never colour alone.
  Reason line rendered from the reasons CODES: "Morning · 4 days out · 11:30
  IST". The client owns the wording so it can be localised.
  "Add to plan" — splits into a per-candidate menu when more than one candidate
  still needs slots.

  Cards with a busy interviewer sort lower, render at 85% opacity, and NAME who
  is busy. Do not hide them — sometimes you proceed anyway.

TASK 4 — Dismiss
Slides right and out over 180ms; the list closes the gap. Dismissed suggestions
collect behind a "3 dismissed" link that restores them.

TASK 5 — Show more
Five suggestions initially, then "Show 6 more". Do not render nine cards at
once — the point is a short list of good options, not a long list of all
options.

TASK 6 — Empty and disconnected
  No suggestions found: "No times work for all three in this range. Try widening
  the dates or dropping an interviewer." with both as actions.
  availabilityConnected false: "Interviewer calendars aren't connected. Use the
  Calendar tab to propose times manually." Do NOT show suggestions.

In your plan, state how the list re-ranks without blanking during a recompute,
and how the per-candidate Add menu behaves with one candidate versus three.
```

🛑 Read the plan. Then test the disconnected fixture — no suggestion may imply
availability that was never checked.

✅ `feat(interviews): add suggestion engine UI`

---

### UX4 — Plan tray

```
CONTEXT
Read docs/INTERVIEW-PLANNING-UX.md 1.2, 4.3, Part 7.

TASK 1 — Tray, 340px, sticky
One card per candidate in the round, tinted with getCandidateColor from UX1 —
left border plus soft surface tint. Header: reference, priority badge, progress.

TASK 2 — Slot chips
Removable, drag-reorderable within a candidate, and DRAGGABLE BETWEEN
CANDIDATES to reassign. Each chip shows day, date and time; offshore candidates
also show local time.

TASK 3 — Progress
"2 of 3" in muted, becoming "✓ 3 of 3 · ready" in success when the target is
met. Target is 3 by default, configurable in the frame bar.

TASK 4 — Empty state
A dashed drop zone reading "Drop a time here, or add one from the suggestions."
Never a blank card.

TASK 5 — Collisions per 4.3
When a slot appears in two plans, both chips get a link marker and the tray
shows a note: "Tue 10:00 is in both plans. Whoever confirms first takes it; the
other offer is withdrawn automatically."
Honest about what the system does, so it is not discovered by accident.

TASK 6 — Completion
When every candidate is ready, "Review & send" becomes primary and lifts 2px
once, then settles. That single moment is the reward for finishing.
NO confetti, NO sound, NO celebration animation. This is someone's job.

TASK 7 — Motion per Part 7
Adding a slot animates the chip from the card to the tray over 240ms.
One easing curve: cubic-bezier(0.2, 0, 0, 1).
prefers-reduced-motion replaces every movement with an opacity change.

TASK 8 — Responsive
Below 1280px the tray moves beneath the suggestions. Below 1024px it becomes a
bottom sheet showing the count, expanding on tap.
```

✅ `feat(interviews): add plan tray with drag assignment`

---

### UX5 — Calendar tab and keyboard

```
CONTEXT
Read docs/INTERVIEW-PLANNING-UX.md 4.4, Part 8, and
INTERVIEW-PLANNING-UI.md 3.2.

TASK 1 — Tabs
"Suggested times" and "Calendar" as an underline tab pair above the working
area. Suggested is the default.
Selection persists per user — someone who prefers manual control should not
have to switch every time.

TASK 2 — Calendar tab
Everything from INTERVIEW-PLANNING-UI.md 3.2: week grid, availability shading
using HatchPattern, click to create, drag to size, past weeks read-only,
disconnected banner.

Slots added here appear in the tray identically. Two tabs, one plan.
Slots already in a plan render in that candidate's identity colour.

TASK 3 — Keyboard per Part 8
  1-9   add that suggestion to the active candidate
  ↑ ↓   move through suggestions
  X     dismiss the focused suggestion
  Tab   switch active candidate in the tray
  ⌘Z    undo the last plan change
  C     toggle Calendar / Suggested
  ?     shortcut overlay
Inert while a dialog or text input has focus.

TASK 4 — Undo
EVERY plan change is undoable — add, remove, reassign, dismiss. Maintain a
20-step history. Nothing on this page should feel risky.

TASK 5 — Discoverability
A small keyboard hint beneath the suggestion list, and the ? overlay.
```

✅ `feat(interviews): add calendar tab and keyboard flow`

---

### UX6 — Verify

```
Verify. Report: check | expected | actual | pass.

CONTRAST — highest priority
1. Compute every token pair in BOTH themes. Output the table with actual
   ratios. Body 4.5:1, large 3:1, meaningful icons and borders 3:1, focus
   rings 3:1, disabled text 4.5:1.
2. Confirm no information is conveyed by colour alone — availability dots have
   fill states, candidate chips carry references, statuses carry labels.
3. Dark mode: confirm three distinct surface elevations and that cards lift off
   the page.
4. Dark mode: confirm candidate tints remain visible at 12%. Screenshot two
   candidates side by side in dark.
5. Confirm accent is lightened and semantic hues desaturated in dark. No
   full-saturation red on near-black.

FLOW
6. The frame bar takes under 20 seconds with defaults — time it.
7. Changing the frame re-ranks suggestions in place with no blank state.
8. Suggestions are server-ranked. Grep for client-side scoring or sorting —
   none.
9. Disconnected fixture shows no suggestions and directs to the Calendar tab.
10. Adding from the Calendar tab produces an identical tray chip.

TRAY
11. Chips drag between candidates and reassign correctly.
12. Collision markers appear on both chips with the explanatory note.
13. Progress reaches "✓ 3 of 3 · ready" and Review lifts ONCE.
14. Every plan change is undoable with ⌘Z, 20 steps.

STEPPER
15. The old five-step stepper is gone from this page.
16. The progress rail is 4px, beneath the breadcrumb, with a hover popover.
17. Its shimmer runs once and never repeats.

MOTION
18. prefers-reduced-motion replaces all movement with opacity changes.
19. Nothing loops or pulses more than once.
20. No confetti, sound, or celebration animation anywhere.

BLIND BOUNDARY
21. Grep every component on this route for vendor fields — none.
22. Search the rendered DOM across all fixtures for a vendor name — none.

REST
23. Keyboard: 1-9, arrows, X, Tab, ⌘Z, C, ? all work and are inert in inputs.
24. Responsive 1440, 1280, 1024, 768. Tray becomes a bottom sheet below 1024.
25. Offshore fixture shows dual timezones on suggestions, chips and calendar.
```

🛑 Final gate. Item 1 is a defect list, not a preference list.

---

## Part 11 — What this is not

Worth stating, because "engaging" invites the wrong instincts.

- **No gamification.** No streaks, badges, points, or celebration screens. She
  is scheduling interviews, not playing.
- **No decorative animation.** Every movement in Part 7 communicates a state
  change.
- **No hiding information to feel cleaner.** The busy interviewer is named, the
  collision is stated, the disconnected calendar is admitted.

The enjoyment comes from three things: the system doing the hard part, the
interface responding instantly, and never being afraid to click because
everything is undoable.
