# Interview Evaluation — UI

Route: `/app/candidates/interviews/evaluate/{requestId}/{candidateRef}`

**UI-only build.** Part 5 defines the API contract. Follows
`INTERVIEW-PLANNING-UX.md` (colour system, progress rail, motion),
`APP-SHELL-SPEC.md`, and the blind-review rules in `PROCESS-GAP-ANALYSIS.md`
§2.4.

---

## Part 1 — Gaps in the reference

### 1.1 Rejection has no reason — a compliance gap 🔴

The reference offers "Reject — Candidate does not meet requirements" and
nothing more.

RFP Step 5 requires **one of three**, and each carries a different data
retention outcome:

| Reason | Retention |
| :--- | :--- |
| Doesn't meet requirements — keep the CV | Stored centrally for future reference |
| Doesn't meet requirements — don't keep the CV | Deleted after the HR-defined period |
| Duplicate CV | Deleted after the HR-defined period |

With PDPL in scope, a rejection that doesn't record a retention decision is a
gap. Reject must require a reason, and each must state its consequence in
plain words with the actual deletion date.

### 1.2 "Did the interview take place?" is missing

RFP Step 6: *"The Interviewer(s) confirms whether the interview took place."*
The reference assumes it did.

Add a branch before the scorecard:

- **Yes** → the evaluation form
- **No, the candidate didn't attend** → no-show, propose new times or reject
- **No, it was cancelled** → back to scheduling
- **No, the candidate withdrew** → closes this candidate

Only "yes" produces an evaluation. The other paths must not require ratings.

### 1.3 Panel evaluation is ambiguous 🔴

The reference lists three contributors with Complete / Pending status beside a
**single** scorecard. Who filled it in? If three people rate independently,
where are the other two scorecards?

This is the open question from `PROCESS-GAP-ANALYSIS.md` §2.5. The page must
pick a model:

| Interviewers | Behaviour |
| :--- | :--- |
| One | One scorecard. No panel section |
| More than one | **Each rates independently.** The Main Interviewer sees their own scorecard, an aggregate, and each contributor's ratings. Only the Main Interviewer decides the outcome |

Per RFP Step 1 the Main Interviewer holds exclusive authority over status, so
the decision is theirs regardless of how the panel scored. But the panel's
ratings must be visible, and disagreement should be surfaced rather than
averaged away.

### 1.4 The weighted score hides its weights

"Weighted Overall Score 88%". Six criteria, all appearing equal. But
5+4+4+4+5+4 = 26/30 = 86.7% — so weights exist and aren't shown.

Show the weight beside each criterion. An interviewer should know that
Technical expertise counts for 25% and DIEZ environment fit for 10% *before*
they rate.

### 1.5 Rating levels have no meaning

Thirty numbered cells with no anchors. "3" means nothing to someone rating
their first candidate, and two interviewers will use the scale differently.

**Anchor every level.** On selection and on hover:

```
1 Well below requirement   2 Below   3 Meets   4 Above   5 Outstanding
```

Per-criterion anchors where they exist. This is the cheapest thing you can do
to make ratings comparable between interviewers.

### 1.6 The budget consequence should be prominent

Budget variance determines what happens next: within budget notifies
Procurement to onboard; over budget triggers a Budget Amendment.

The reference states this in a note below the outcome. It should be attached to
the **Qualify** option itself, because it changes what qualifying means.

### 1.7 Missing context

| Missing | Why |
| :--- | :--- |
| **Position progress** | The request needs 2 resources. "1 of 2 positions filled" tells the interviewer whether this decision closes the requisition |
| **Other candidates** | Qualifying this one affects C-021. At minimum, show where they stand |
| **Overdue treatment** | "Evaluation due 12 Aug (Today)" needs to escalate visibly when missed |
| **Immutability at submit** | Stated in the audit trail; belongs in the submit confirmation |

### 1.8 Layout

The audit trail occupies a third column for four entries. Move it to a
collapsible panel at the bottom. Two columns give the scorecard the room it
needs.

---

## Part 2 — Layout

```
Interviews / OMS-2026-0148 / Candidate C-014        [Save draft] [Submit]
▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬░░░░░░░░  Evaluation · 4 of 5
────────────────────────────────────────────────────────────────────────
 Interview completed 12 Aug 2026, 11:45 · Online · Due today
────────────────────────────────────────────────────────────────────────
┌──────────────────────────────────────────┬───────────────────────────┐
│ HOW DID THEY DO                          │ CANDIDATE                 │
│                                          │ C-014 · Priority 1        │
│ Technical expertise              25%     │ 9 years experience        │
│  ①  ②  ③  ④ [⑤]   Outstanding           │ Available in 2 weeks      │
│                                          │ Lead time 14 days         │
│ Cybersecurity operations         20%     │ Vendor hidden             │
│  ①  ②  ③ [④] ⑤    Above requirement     ├───────────────────────────┤
│                                          │ COST                      │
│ ... four more ...                        │ Approved   AED 310,000.00 │
│                                          │ Expected   AED 298,000.00 │
│ ─────────────────────────────────────    │ ─────────────────────     │
│ Overall  86.7%   Above requirement       │ Under by   AED  12,000.00 │
│                                          │ ✓ Within budget           │
│ YOUR COMMENTS                            ├───────────────────────────┤
│ [                                     ]  │ OUTCOME                   │
│ Strengths     + SIEM & SOC  + Incident…  │ ( ) Qualify               │
│ To develop    + DIEZ processes           │     Procurement is told   │
│                                          │     to begin onboarding   │
│ THE PANEL                          2/3   │ ( ) Reject                │
│ ✓ Noura Al Mazrouei  86.7%  You          │     Choose a reason       │
│ ✓ Yousef Al Falasi   83.3%               │                           │
│ ⏱ Omar Al Hashmi     —      [Remind]     │ 1 of 2 positions filled   │
└──────────────────────────────────────────┴───────────────────────────┘
 ▸ Audit trail (4 entries)
```

Grid `1fr 360px`, 24px gap. Right column sticky. Below 1280px it stacks
beneath; the outcome block stays last so the flow reads rate → decide.

---

## Part 3 — Panels

### 3.1 Interview confirmation

Shown **only** when the outcome of the interview isn't yet recorded. Four
options as radio cards. Choosing anything other than "it happened" replaces the
whole evaluation form with the relevant action, so nobody fills in ratings for
an interview that never occurred.

### 3.2 Scorecard

- One row per criterion: name, weight, five-segment rating control, anchor label
- Rating control is a **segmented control**, minimum 40px targets — not thirty
  small cells
- Selected level shows its anchor; hovering any level previews its anchor
- Overall score updates live, with its own anchor label
- Unrated criteria are marked, and submit names them

### 3.3 Comments and tags

Free text plus two tag fields — Strengths and To develop.

Tags are **suggested from the job profile** with free entry allowed. Typing and
pressing Enter adds one. This makes evaluations comparable across candidates
without forcing a taxonomy.

### 3.4 The panel

Only when more than one interviewer is assigned.

Each contributor: name, role, their overall score, status. The Main Interviewer
sees each contributor's full scorecard on expand.

**Surface disagreement.** When scores differ by more than 1.5 points on any
criterion, flag it: *"Panel disagreed on Communication — 5, 3, 2."* Averaging
that away loses the most useful signal in the room.

"Remind" sits beside the pending contributor, not in the footer.

### 3.5 Candidate and cost

Candidate reference, priority, experience, availability, lead time, special
terms.

**Vendor renders as "Hidden"**, not an em dash. An em dash reads as missing
data; "Hidden" reads as working anonymisation.

Cost: approved per-candidate budget, expected annual cost, variance, status.
Over budget renders in warning tone with the amount over.

### 3.6 Outcome

Two radio cards, each stating its consequence:

**Qualify** — the consequence depends on budget, so it changes:
- Within budget: *"Procurement will be told to begin onboarding."*
- Over budget: *"This exceeds the approved budget by AED 12,000. Qualifying
  starts a Budget Amendment, which needs Finance approval before onboarding."*

**Reject** — reveals the three reasons from §1.1 as radio cards, each stating
its retention consequence with the **actual deletion date**: *"The CV will be
deleted on 11 Feb 2027."*

Comment required on reject. Optional on qualify.

Beneath: position progress — *"1 of 2 positions filled. Qualifying this
candidate fills the second."*

### 3.7 Audit trail

Collapsible, at the bottom, closed by default. Prompt sent, due date, saves,
submissions.

---

## Part 4 — Deadline

| State | Treatment |
| :--- | :--- |
| Due in over 2 days | Neutral in the context bar |
| Due today or tomorrow | Amber, with the date spelled out |
| Overdue | Red banner at the top, stating who is waiting |

The RFP has the system prompt the interviewer after the interview date passes.
An overdue evaluation blocks the whole requisition, so it should look like it.

---

## Part 5 — API contract

Document as `docs/INTERVIEW-EVALUATION-API-CONTRACT.md`. Money in **integers,
minor units**.

```
GET /api/v1/requests/{requestId}/interviews/{candidateRef}/evaluation
```

```jsonc
{
  "candidateRef": "C-014",
  "priority": "P1",
  "requestId": "OMS-2026-0148",
  "position": "Senior Cybersecurity Analyst",

  "interview": {
    "occurred": true,
    "confirmedAt": "2026-08-12T07:45:00Z",
    "method": "ONLINE",
    "scheduledFor": "2026-08-12T07:00:00Z"
  },

  "canEvaluate": true,
  "isMainInterviewer": true,
  "readOnlyReason": null,

  "criteria": [{
    "code": "TECHNICAL_EXPERTISE",
    "label": "Technical expertise",
    "weightPercent": 25,
    "anchors": {
      "1": "Well below requirement", "2": "Below requirement",
      "3": "Meets requirement", "4": "Above requirement", "5": "Outstanding"
    },
    "rating": 5
  }],
  "overallScore": 86.7,
  "overallAnchor": "Above requirement",

  "comments": "…",
  "strengthTags": ["SIEM & SOC", "Incident response"],
  "developmentTags": ["DIEZ internal processes"],
  "suggestedTags": ["SIEM & SOC", "Threat hunting", "Regulatory knowledge"],

  "panel": {
    "isPanel": true,
    "targetCount": 3,
    "completedCount": 2,
    "contributors": [{
      "userId": "…", "name": "Noura Al Mazrouei", "role": "Main interviewer",
      "isYou": true, "status": "COMPLETE", "overallScore": 86.7,
      "criteria": [{ "code": "TECHNICAL_EXPERTISE", "rating": 5 }]
    }],
    "disagreements": [
      { "criterionCode": "COMMUNICATION", "ratings": [5, 3, 2], "spread": 3 }
    ]
  },

  "candidate": {
    "experienceYears": 9, "noticePeriod": "2 weeks", "leadTimeDays": 14,
    "specialTerms": "Standard", "vendorHidden": true
  },

  "cost": {
    "approvedBudget": 31000000, "expectedAnnualCost": 29800000,
    "variance": -1200000, "status": "WITHIN_BUDGET" | "OVER_BUDGET",
    "overBudgetConsequence": null
  },

  "positions": { "required": 2, "filled": 1, "thisWouldFill": 2 },

  "rejectionReasons": [{
    "code": "NOT_SUITABLE_KEEP_CV",
    "label": "Doesn't meet requirements — keep the CV",
    "retentionConsequence": "The CV is stored centrally for future roles.",
    "deletionDate": null
  }, {
    "code": "NOT_SUITABLE_DELETE_CV",
    "label": "Doesn't meet requirements — don't keep the CV",
    "retentionConsequence": "The CV will be deleted on 11 Feb 2027.",
    "deletionDate": "2027-02-11"
  }, {
    "code": "DUPLICATE_CV",
    "label": "Duplicate CV",
    "retentionConsequence": "The CV will be deleted on 11 Feb 2027.",
    "deletionDate": "2027-02-11"
  }],

  "deadline": { "dueAt": "2026-08-12T00:00:00Z", "daysRemaining": 0,
                "severity": "WARNING" | "CRITICAL" | "OVERDUE" | "NORMAL" },

  "auditTrail": [{ "event": "PROMPT_SENT", "label": "Evaluation prompt sent",
                   "at": "2026-08-12T07:45:00Z" }],

  "immutabilityNotice": "Once submitted, the outcome can only be changed under controlled correction."
}
```

```
POST …/evaluation/interview-outcome   { occurred, reason?, notes? }
PUT  …/evaluation/draft
POST …/evaluation/submit
{
  "ratings": [{ "criterionCode": "…", "rating": 5 }],
  "comments": "…",
  "strengthTags": [], "developmentTags": [],
  "outcome": "QUALIFY" | "REJECT",
  "rejectionReasonCode": "NOT_SUITABLE_KEEP_CV",
  "idempotencyKey": "uuid"
}
```

### Server requirements

1. **`rejectionReasonCode` is mandatory when outcome is REJECT.** Each carries a
   distinct retention action; a rejection without one leaves the CV in an
   undefined retention state, which is a PDPL problem.
2. **Only the Main Interviewer may submit the outcome.** Other panel members
   submit ratings only. RFP Step 1 gives the Main Interviewer exclusive
   authority.
3. **The overall score is computed server-side** from weights. The client never
   calculates it.
4. **Re-check the budget at submit.** The variance shown is a preview.
   `EVALUATION_BUDGET_CHANGED` returns current figures.
5. **Vendor identity is never sent on this route**, including in errors.
6. Idempotency key mandatory.
7. Submitting when `interview.occurred` is false must be rejected.
8. Over-budget qualification queues a Budget Amendment; fail the submit if that
   cannot be queued rather than qualifying first.

---

## Part 6 — Prompts

Written for Antigravity. Explicit tasks, explicit acceptance criteria.

### EV1 — Contract, types, fixtures

```
CONTEXT
Repo: OMS frontend. Next.js 16, React 19, TypeScript, Tailwind 4, shadcn/ui.
Read before starting:
  docs/INTERVIEW-EVALUATION-UI.md    (this spec)
  docs/INTERVIEW-PLANNING-UX.md      (colour system, progress rail, motion)
  docs/APP-SHELL-SPEC.md
  docs/PROCESS-GAP-ANALYSIS.md       (section 2.4, blind boundary)
  CLAUDE.md

The evaluation backend does not exist. Define the contract, then build against
fixtures.

TASK 1
Write docs/INTERVIEW-EVALUATION-API-CONTRACT.md. Transcribe Part 5 in full:
the GET, interview-outcome POST, draft PUT, submit POST, every payload shape,
and all eight server requirements with their rationale.

State at the top and in every money field:
ALL MONETARY VALUES ARE INTEGERS IN MINOR UNITS. Never floats. Never
pre-formatted strings.

State requirement 1 prominently. A rejection without a reason code leaves the
CV in an undefined retention state. RFP Step 5 defines three reasons with three
different retention outcomes, and PDPL is in scope.

State requirement 5 prominently. Vendor identity is never sent on this route,
including in error messages.

TASK 2
Create src/types/interview-evaluation.ts with interfaces for every Part 5
shape. Model outcome as a discriminated union so REJECT carries a required
rejectionReasonCode and QUALIFY does not carry one at all.

TASK 3
Create src/lib/interview-evaluation/fixtures.ts with SIX fixtures:
  a) Reference case. C-014, P1, six criteria weighted 25/20/15/15/15/10,
     ratings 5/4/4/4/5/4, overall 86.7. Approved 31000000, expected 29800000,
     variance -1200000, WITHIN_BUDGET. Panel of three, two complete, Omar
     pending. Positions 2 required, 1 filled. Due today.
  b) OVER_BUDGET: expected 33500000, variance +2500000.
  c) Single interviewer, panel.isPanel false.
  d) Panel with a disagreement: Communication rated 5, 3, 2.
  e) interview.occurred false — not yet confirmed.
  f) Deadline OVERDUE by 2 days.

TASK 4
Create src/lib/interview-evaluation/api.ts with data hooks matching the pattern
already used in this repo. Inspect how the requests module fetches and match it
exactly. Include a draft save debounced at 2000ms.

ACCEPTANCE
- No UI files created.
- Types compile with no `any`.
- All six fixtures export and type-check.
```

✅ `feat(evaluation): contract, types and fixtures`

---

### EV2 — Shell, deadline, interview confirmation

```
CONTEXT
Read docs/INTERVIEW-EVALUATION-UI.md Parts 1.2, 2, 3.1, and Part 4.

TASK 1 — Route and shell
Create /app/candidates/interviews/evaluate/[requestId]/[candidateRef].
Breadcrumb is the page title per APP-SHELL-SPEC.md:
  Interviews / OMS-2026-0148 / Candidate C-014
Do NOT add a separate heading block.
Page-bar actions: Save draft (ghost), Submit (primary).

TASK 2 — Progress rail
Use the 4px progress rail from INTERVIEW-PLANNING-UX.md Part 3. Five segments,
label "Evaluation · 4 of 5", hover popover with full detail.
Do NOT build the large horizontal stepper shown in the reference.

TASK 3 — Context bar
One row beneath the rail: interview completed date and time, method, deadline
state. 13px, muted, with 16px icons.

TASK 4 — Deadline per Part 4
  NORMAL    neutral in the context bar
  WARNING   amber, date spelled out
  CRITICAL  amber, date spelled out
  OVERDUE   RED BANNER above everything: "This evaluation is 2 days overdue.
            Procurement is waiting to begin onboarding."
Test with fixture (f).

TASK 5 — Interview confirmation branch per 3.1
When interview.occurred is false (fixture e), render ONLY this panel. The
evaluation form must not appear.
Four radio cards:
  It went ahead              -> reveals the evaluation form
  The candidate didn't attend -> no-show: offer new times or reject
  It was cancelled            -> return to scheduling
  The candidate withdrew      -> closes this candidate
Each option states what happens next in one sentence.

RFP Step 6 requires the interviewer to confirm whether the interview took
place. Nobody should fill in ratings for an interview that never happened.

TASK 6 — Layout
Grid 1fr 360px, 24px gap. Right column sticky.
Below 1280px stack, with the outcome block LAST so the flow reads rate then
decide.

ACCEPTANCE
- Fixture (e) shows only the confirmation panel, no scorecard in the DOM.
- Fixture (f) shows the red overdue banner above all content.
- No large stepper anywhere on the page.
```

✅ `feat(evaluation): shell, deadline and interview confirmation`

---

### EV3 — Scorecard

```
CONTEXT
Read docs/INTERVIEW-EVALUATION-UI.md 1.4, 1.5, 3.2.

TASK 1 — Criterion row
One row per criterion:
  Left: criterion label at 14px/500, weight at 12px muted, e.g. "25%"
  Centre: a five-segment rating control
  Right: the anchor label for the selected rating, 13px

Show the WEIGHT beside every criterion. The reference hides them — its stated
88% cannot be produced by an unweighted average of its own ratings
(5+4+4+4+5+4 = 26/30 = 86.7%). An interviewer should know Technical expertise
counts for 25% before they rate it.

TASK 2 — Rating control
A segmented control, not thirty small cells. Each segment minimum 40x40px.
Selected segment uses the accent fill with inverse text.
Hovering any segment previews that level's anchor in the right-hand label.
Keyboard: arrow keys move, 1-5 set directly.
Each segment needs an accessible name combining the criterion and the anchor,
e.g. "Technical expertise, 5, Outstanding".

TASK 3 — Anchors per 1.5
Render the anchor text from criteria[].anchors. Never show a bare number
without its meaning. Two interviewers using an unanchored 1-5 scale will not
produce comparable ratings.

TASK 4 — Overall score
Beneath the criteria, separated by a hairline: the overall score and its anchor.
The score comes from the server. Do NOT compute it client-side — the client
does not own the weighting, and a client figure will eventually disagree with
the server's.
While a rating is being saved, show the previous value dimmed rather than
blanking it.

TASK 5 — Unrated criteria
Mark them visibly. Submit names them: "You haven't rated Communication or
Problem solving." Warn, do not block.

ACCEPTANCE
- Every criterion shows its weight.
- No rating segment is under 40x40px.
- Grep this component for arithmetic on ratings. There must be none.
- Keyboard reaches and sets every rating.
```

✅ `feat(evaluation): scorecard with weights and anchors`

---

### EV4 — Comments, tags, panel

```
CONTEXT
Read docs/INTERVIEW-EVALUATION-UI.md 1.3, 3.3, 3.4.

TASK 1 — Comments
Auto-growing textarea, minimum 5 rows. Autosave 2000ms after typing stops, with
a quiet "Saved 11:46" beside the field. Not a toast.

TASK 2 — Tag fields
Two fields: Strengths, and To develop.
Type and press Enter to add. Remove with an x.
Show suggestedTags beneath as one-click chips.
Free entry is allowed — do not restrict to the suggestions.

TASK 3 — Panel section
Render ONLY when panel.isPanel is true. With a single interviewer (fixture c)
this section must be absent from the DOM, not empty.

Each contributor row: name, role, their overall score, status.
"You" marked on the current user's row.
Expand a row to see that contributor's full per-criterion ratings.
Header shows "2 of 3".

TASK 4 — Disagreement (fixture d)
When panel.disagreements is non-empty, render a callout per entry:
"The panel disagreed on Communication — 5, 3, 2."
Use the warning tone. Do NOT hide or average this away; a split panel is the
most useful signal in the room and the Main Interviewer needs to see it before
deciding.

TASK 5 — Remind
A "Remind" action beside each PENDING contributor, inline. NOT a footer button.
The reference puts "Request Missing Comment" in the footer at the same weight
as Submit, which is the wrong prominence for chasing one person.

ACCEPTANCE
- Fixture (c) renders no panel section at all.
- Fixture (d) shows the disagreement callout with all three ratings.
- Remind appears only next to pending contributors.
```

✅ `feat(evaluation): comments, tags and panel`

---

### EV5 — Candidate and cost

```
CONTEXT
Read docs/INTERVIEW-EVALUATION-UI.md 1.6, 3.5.

TASK 1 — Candidate panel
Reference in mono, priority badge, experience, notice period, lead time,
special terms.

Vendor renders as the word "Hidden", NOT an em dash. An em dash reads as
missing data; "Hidden" reads as anonymisation working correctly. Add a tooltip:
"Vendor identity is hidden during evaluation."

TASK 2 — Cost panel
Approved per-candidate budget, expected annual cost, variance, status badge.
All amounts via lib/money.ts, exact, tabular-nums. No abbreviation.
Compute nothing — variance comes from the server.

WITHIN_BUDGET: variance in success tone, "Under by AED 12,000.00"
OVER_BUDGET:   variance in warning tone, "Over by AED 25,000.00", and the panel
               carries a warning border

TASK 3 — Position progress
Beneath the cost panel: "1 of 2 positions filled." When positions.thisWouldFill
equals positions.required, add: "Qualifying this candidate fills the last
position."
This tells the interviewer whether their decision closes the requisition.

TASK 4 — Blind boundary audit
Grep every component on this route for vendor fields. Confirm the fixtures
carry no vendor identity and that no component would render it if the API
mistakenly sent it.

ACCEPTANCE
- Fixture (b) shows the over-budget warning tone.
- Vendor shows "Hidden", never an em dash or blank.
- Grep for arithmetic on cost fields returns nothing.
- Rendered DOM across all fixtures contains no vendor name.
```

✅ `feat(evaluation): candidate and cost panels`

---

### EV6 — Outcome and submit

```
CONTEXT
Read docs/INTERVIEW-EVALUATION-UI.md 1.1, 3.6, and Part 5 server requirements.
This task contains the compliance-critical work.

TASK 1 — Outcome cards
Two radio cards. Each states its consequence.

QUALIFY — the consequence DEPENDS ON BUDGET and must change with it:
  WITHIN_BUDGET: "Procurement will be told to begin onboarding."
  OVER_BUDGET:   "This is AED 25,000.00 over the approved budget. Qualifying
                  starts a Budget Amendment, which needs Finance approval
                  before onboarding can begin."
Read it from cost.status; do not hardcode the within-budget wording.

TASK 2 — Rejection reasons — REQUIRED
Selecting Reject reveals three radio cards from rejectionReasons. Each shows
its label AND its retentionConsequence with the actual deletion date:
  "Doesn't meet requirements - keep the CV
   The CV is stored centrally for future roles."
  "Doesn't meet requirements - don't keep the CV
   The CV will be deleted on 11 Feb 2027."
  "Duplicate CV
   The CV will be deleted on 11 Feb 2027."

Submit is BLOCKED until a reason is selected, with the reason stated.

This is the largest gap in the reference, which offers Reject with no reason at
all. RFP Step 5 defines three, each with a different data retention outcome,
and PDPL is in scope. A rejection without a recorded retention decision is a
compliance problem, not a UX preference.

TASK 3 — Comment rules
Required on reject. Optional on qualify. State which in the field label.

TASK 4 — Submit confirmation
Restate before submitting:
  the outcome, the overall score, the rejection reason and its retention
  consequence if rejecting, what happens next, any unrated criteria, and any
  pending panel contributors.
Include the immutabilityNotice text: once submitted this can only be changed
under controlled correction.

TASK 5 — Idempotency and errors
Generate idempotencyKey once when the confirmation opens; reuse on retry.
Disable the button during submission.
Errors, each with a plain message:
  EVALUATION_BUDGET_CHANGED   show current figures, do NOT auto-resubmit
  EVALUATION_NOT_MAIN         "Only the main interviewer can submit the
                               outcome."
  EVALUATION_ALREADY_SUBMITTED name who submitted and when
  EVALUATION_INTERVIEW_NOT_CONFIRMED "Confirm whether the interview took place
                               first."

TASK 6 — Read-only
When isMainInterviewer is false, panel members can still submit their RATINGS
but the outcome section is absent and the page-bar Submit reads "Submit my
ratings". Per RFP Step 1 only the Main Interviewer decides the outcome.

ACCEPTANCE
- Reject without a reason cannot be submitted.
- Every rejection reason shows its retention consequence and deletion date.
- Fixture (b) shows the amendment wording on Qualify.
- Non-main interviewer sees no outcome section.
- Double-clicking Submit fires one request.
```

🛑 Verify by hand: attempt to submit a rejection with no reason selected.

✅ `feat(evaluation): outcome, rejection reasons and submit`

---

### EV7 — Audit trail and verify

```
CONTEXT
Read docs/INTERVIEW-EVALUATION-UI.md 1.8, 3.7.

TASK 1 — Audit trail
Collapsible panel at the bottom of the page, closed by default, labelled
"Audit trail (4 entries)".
Each entry: icon, plain-language label, timestamp.
The reference gives this a full third column for four entries. It does not need
one.

TASK 2 — Verification. Report a table: check | expected | actual | pass.

COMPLIANCE
1. Reject cannot be submitted without a reason code.
2. All three rejection reasons render with their retention consequence and
   deletion date.
3. Submitting when interview.occurred is false is blocked.

SCORECARD
4. Every criterion shows its weight.
5. Every rating shows its anchor text; no bare numbers.
6. Rating segments are at least 40x40px.
7. Overall score comes from the server. Grep for client-side arithmetic on
   ratings or weights.
8. Unrated criteria are flagged and named at submit.

PANEL
9. Single-interviewer fixture renders no panel section in the DOM.
10. Disagreement fixture shows the callout with all ratings.
11. Non-main interviewer sees no outcome section; Submit reads "Submit my
    ratings".

BUDGET
12. Over-budget fixture shows the Budget Amendment wording on Qualify.
13. All amounts exact, tabular-nums, via lib/money.ts.
14. Grep for arithmetic on cost fields — none.

BLIND BOUNDARY
15. Vendor renders as "Hidden" with a tooltip, never an em dash.
16. Rendered DOM across all six fixtures contains no vendor name.
17. Grep every component for vendor fields — none.

DEADLINE
18. All four severity states render. Overdue shows the red banner above
    everything.

STYLE
19. Progress rail is 4px beneath the breadcrumb. No large stepper.
20. Semantic and candidate colours from INTERVIEW-PLANNING-UX.md UX1.
21. Contrast: body 4.5:1, large 3:1, meaningful icons and borders 3:1, in BOTH
    themes. Report actual ratios.
22. Dark mode: three surface elevations, borders at 14%.
23. prefers-reduced-motion respected; nothing loops.

REST
24. Autosave fires 2000ms after typing stops; reload restores the draft.
25. Every error renders its specific plain message.
26. Responsive 1440, 1280, 1024, 768.
27. No status codes, criterion codes or reason codes visible on screen.
```

🛑 Final gate. Item 1 is a compliance requirement, not a preference.

---

## Part 7 — Questions for DIEZ

1. **Panel evaluation** — does each interviewer rate independently, or does the
   Main Interviewer record one scorecard on the panel's behalf? §1.3 assumes
   independent. This is still open from `PROCESS-GAP-ANALYSIS.md` §2.5.
2. **Criterion weights** — who defines them, and do they vary by job profile or
   grade? They must exist somewhere, since the reference's own figure implies
   them.
3. **What is the CV retention period** after a "delete" rejection reason? The
   RFP says "HR to define duration". This drives the deletion date shown to the
   interviewer.
4. **Can an evaluation be corrected after submission,** and by whom? The
   reference mentions "controlled correction" without defining it.
5. **When the panel disagrees sharply,** does anything escalate, or is it purely
   the Main Interviewer's call?
