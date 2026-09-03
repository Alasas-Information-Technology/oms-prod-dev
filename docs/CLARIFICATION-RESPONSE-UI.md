# Respond to Clarification — UI

Route: `/app/requests/{id}/clarifications/{clarificationId}`

**UI-only build.** Part 4 defines the API contract. Follows
`APP-SHELL-SPEC.md`, `DASHBOARD-VISUAL-LANGUAGE.md`, and the money rules in
`BUDGET-API-CONTRACT.md`.

---

## Part 1 — Improvements over the reference

### 1.1 Edit the fields here 🔴

The reference asks the requester to *"update the engagement end date"*, then
renders "Changes Requiring Reapproval" as a **read-only** table. There is
nowhere on the page to make the change.

That forces: leave → open the request → find the field → edit → save → return →
hope the diff caught it.

**Fix: the fields are editable on this page.** HR flags which fields need
attention when raising the clarification; those fields render as an inline
editor, pre-highlighted. The diff table updates live as you type.

This is the difference between a page that reports a task and a page that
completes one.

### 1.2 The page adapts to the clarification type

The RFP defines three, with genuinely different consequences:

| Type | What happens | Page shows |
| :--- | :--- | :--- |
| **More information** | Answer goes to HR and all parties. **No re-approval.** Unlimited cycles | Message and attachments only |
| **Information with approval** | Changes repeat Line Manager → Section Head → HOD before returning to HR | Everything |
| **Amend request** | HR requests changes; standard approval and budget verification follow | Everything |

For "more information", the diff table, route preview and budget panel are
**absent** — not empty, not disabled. Showing three empty panels on a
two-sentence question makes a simple task feel heavy.

### 1.3 Break the ask into items

HR's message asks three things: clarify deliverables, update the end date,
attach the project plan. As one paragraph, it's easy to miss one and get sent
back again.

**Fix: HR can add discrete asks when raising the clarification** — free text
plus optional structured items, each optionally bound to a field. The requester
sees them as a checklist that ticks itself as each is addressed:

```
What HR needs                                    2 of 3 done
✓ Clarify the data-governance deliverables
✓ Update the engagement end date        → 31 Aug 2027
○ Attach the approved project plan
```

Submit warns when items remain unaddressed — it doesn't block, because HR's
structure won't always be right, but the requester should know.

### 1.4 Three save buttons is two too many

The reference has **Save Response**, **Save Draft**, and **Submit Response for
Approval**. Nobody can tell what the first two do differently.

Reduce to: **Save draft** and **Submit response**. Plus autosave — a long
response typed and lost to a session timeout is a genuinely bad experience, and
these responses are long.

### 1.5 The thread should be readable

The reference collapses prior cycles to one-line summaries — *"Initial response
submitted"* — with no way to read what was actually said. On a third
clarification cycle, that's the context you need.

Make each entry expandable with its full message and attachments. Most recent
expanded by default.

### 1.6 The deadline should escalate

"28 days remaining" is fine at 28. At 3 days, with the request auto-closing and
funds releasing, it should be impossible to miss.

| Remaining | Treatment |
| :--- | :--- |
| Over 7 days | Neutral, in the header |
| 3–7 days | Amber, with the closure date spelled out |
| Under 3 days | Red banner at the top of the page, stating the consequence |
| Overdue | Red banner; submission still allowed if the backend permits |

---

## Part 2 — Layout

```
My Requests / OMS-2026-0139 / Clarification
Respond to HR clarification                          [Save draft] [Submit]
Data Governance Specialist · OMS-2026-0139
────────────────────────────────────────────────────────────────────────
 ⓘ  Your changes will need approval again
    Because you are changing approved details, this returns to Omar Al
    Hashmi, Fatima Al Marri and Khalid Al Suwaidi before it reaches HR.
                                              28 days left · closes 30 Sep
────────────────────────────────────────────────────────────────────────
┌──────────────────────────────────┬─────────────────────────────────────┐
│ WHAT HR NEEDS            2 of 3  │ WHAT WILL CHANGE                    │
│ ✓ Clarify deliverables           │ Engagement end  30 Jun → 31 Aug 2027│
│ ✓ Update engagement end date     │ Duration        10 → 12 months      │
│ ○ Attach the project plan        │ Justification   edited              │
│                                  │ Budget          unchanged           │
│ ── Aisha Al Nuaimi · 5 Aug ──    ├─────────────────────────────────────┤
│ "Please clarify the data-        │ WHO APPROVES NEXT                   │
│  governance deliverables…"       │ ① You → ② Omar → ③ Fatima →         │
│  📎 Original_Request_Details.pdf │ ④ Khalid → ⑤ HR                     │
│                                  ├─────────────────────────────────────┤
│ ▸ Earlier messages (2)           │ BUDGET                              │
│                                  │ Reserved   AED 240,000.00           │
│ YOUR RESPONSE                    │ Change     AED 0.00                 │
│ [                             ]  │ Available  AED 780,000.00           │
│ [                             ]  │ ✓ Still within budget               │
│ 📎 Add attachment                │                                     │
│                                  │                                     │
│ WHAT YOU'RE CHANGING             │                                     │
│ Engagement end date  [31/08/27]  │                                     │
│ Duration             [12] months │                                     │
│ Business justification [ ...  ]  │                                     │
└──────────────────────────────────┴─────────────────────────────────────┘
 🛈 Every message, change and approval is kept for audit.
```

Grid `1fr 420px`, 24px gap. Right column stacks below 1280px. Single column
below 1024px, with the right-column panels moving beneath the response.

---

## Part 3 — Panels

### 3.1 Consequence banner

Always present, and **written as a sentence naming actual people**:

- **More information** — *"Your answer goes to HR, your line manager and your
  HOD. No new approvals are needed."*
- **With approval** — *"Because you are changing approved details, this returns
  to Omar Al Hashmi, Fatima Al Marri and Khalid Al Suwaidi before it reaches
  HR."*
- **Amend** — *"HR has asked for changes. Once submitted, this goes through
  approval and budget checks again."*

Naming the individuals is what makes the consequence land. "Repeat Line Manager,
Section Head and HOD approval" is a process description; the names are people
the requester will have to chase.

### 3.2 What HR needs

Checklist of structured asks with a done count. Each item shows its resolution
inline once addressed — *"→ 31 Aug 2027"*. Items bound to a field link to that
field in the editor below.

When HR raised no structured items, this panel shows only the message.

### 3.3 The request and thread

Latest message expanded: avatar, name, role, timestamp, full text,
attachments. Earlier cycles collapse into *"Earlier messages (2)"*, each
expandable with full text.

*"No limit on clarification cycles"* appears only from the second cycle onward.
On the first it's noise.

### 3.4 Your response

- Rich-ish textarea, minimum 6 rows, auto-growing.
- **Autosave 2 seconds after typing stops.** Show "Saved 12:04" quietly.
- Attachments: drag-and-drop plus a button, with type and size limits stated
  before upload rather than after rejection.
- A virus-scan pending state — the cybersecurity document mandates server-side
  scanning, and a file can't be submitted until it clears.
- Character guidance, not a limit.

### 3.5 What you're changing

Inline editors for exactly the fields HR flagged, in the order HR listed them.
Each shows its current value as placeholder or helper text so the requester can
see what they're replacing.

- Field types drive the control: date picker, number with unit, textarea,
  select.
- Editing recomputes the diff and the budget panel live, debounced 500ms.
- **Fields with financial consequence are marked.** Changing budget amount
  triggers an amendment; say so beside the field, before they change it.
- A "Revert" link per field, and "Revert all changes".

### 3.6 What will change

Live diff, driven by 3.5. Rows: field, before, after, status.

- Unchanged fields HR flagged still appear, marked **Unchanged** — that's how a
  requester verifies they didn't touch something by accident.
- Long text diffs show the first two lines with "View full change".
- Empty state before any edit: *"Nothing changed yet."*

### 3.7 Who approves next

Horizontal stepper of the route **after** submission: you, then each approver
by name, then HR. Data-driven and variable length — not every department has a
Section Head.

Absent entirely for "more information".

### 3.8 Budget

Current reservation, change in amount, available on the selected line, and a
result badge.

Every figure comes from the server. **The client computes nothing** — same rule
as the approval screen. A note states the check runs again at each approval and
atomically at HOD, because the figures shown are a preview.

Absent for "more information", and for other types when no financial field
changed.

---

## Part 4 — API contract

Document as `docs/CLARIFICATION-API-CONTRACT.md`. Money in integers, minor
units.

```
GET /api/v1/requests/{requestId}/clarifications/{clarificationId}
```

```jsonc
{
  "clarificationId": "…",
  "requestId": "OMS-2026-0139",
  "requestTitle": "Data Governance Specialist",
  "type": "MORE_INFO" | "INFO_WITH_APPROVAL" | "AMEND",
  "status": "AWAITING_RESPONSE" | "SUBMITTED" | "CLOSED",
  "canRespond": true,
  "readOnlyReason": null,

  "raisedBy": { "userId": "…", "name": "Aisha Al Nuaimi", "role": "HR Specialist" },
  "raisedAt": "2026-08-05T11:20:00Z",
  "message": "…",
  "attachments": [{ "id": "…", "name": "…", "sizeBytes": 0, "url": "…" }],

  "asks": [
    { "id": "…", "text": "Clarify the data-governance deliverables", "fieldKey": null, "addressed": true },
    { "id": "…", "text": "Update the engagement end date", "fieldKey": "engagementEndDate", "addressed": true },
    { "id": "…", "text": "Attach the approved project plan", "fieldKey": null, "addressed": false }
  ],

  "editableFields": [
    { "key": "engagementEndDate", "label": "Engagement end date", "type": "DATE",
      "currentValue": "2027-06-30", "proposedValue": "2027-08-31",
      "financialImpact": false, "helpText": null },
    { "key": "budgetAmount", "label": "Budget amount", "type": "MONEY",
      "currentValue": 24000000, "proposedValue": 24000000,
      "financialImpact": true,
      "helpText": "Increasing this starts a budget amendment" }
  ],

  "thread": [
    { "id": "…", "actor": {...}, "action": "CLARIFICATION_REQUESTED",
      "message": "…", "attachments": [], "at": "2026-08-03T10:15:00Z" }
  ],
  "cycleNumber": 2,

  "deadline": { "closesAt": "2026-09-30T00:00:00Z", "daysRemaining": 28,
                "severity": "NORMAL" | "WARNING" | "CRITICAL" | "OVERDUE" },

  "draft": { "message": "…", "fieldValues": {}, "attachments": [],
             "savedAt": "2026-08-06T12:04:00Z" },

  "consequence": {
    "requiresReapproval": true,
    "approvers": [{ "userId": "…", "name": "Omar Al Hashmi", "stage": "LINE_MANAGER" }],
    "summary": "Because you are changing approved details, this returns to Omar Al Hashmi, Fatima Al Marri and Khalid Al Suwaidi before it reaches HR."
  }
}
```

**Preview the impact of proposed changes:**

```
POST /api/v1/requests/{requestId}/clarifications/{clarificationId}/preview
{ "fieldValues": { "engagementEndDate": "2027-08-31" } }
```

```jsonc
{
  "diff": [{ "fieldKey": "engagementEndDate", "label": "Engagement end date",
             "before": "30 Jun 2027", "after": "31 Aug 2027", "changed": true }],
  "route": [{ "index": 1, "stage": "REQUESTOR", "label": "You", "state": "CURRENT" }],
  "budget": { "applicable": true, "currentReservation": 24000000,
              "changeAmount": 0, "lineAvailable": 78000000,
              "result": "WITHIN_BUDGET" | "REQUIRES_AMENDMENT" | "INSUFFICIENT",
              "message": "Still within budget" },
  "asksAddressed": ["ask-1", "ask-2"]
}
```

**Draft and submit:**

```
PUT    …/draft     { message, fieldValues, attachmentIds }
POST   …/submit    { message, fieldValues, attachmentIds, idempotencyKey }
```

### Server requirements

1. **Diff, route and budget are all computed server-side.** The client renders;
   it never calculates.
2. **Re-validate on submit.** Preview figures are a preview — budget may have
   moved. Fail with `CLARIFICATION_BUDGET_CHANGED` and return current figures.
3. **Idempotency key mandatory** on submit.
4. **Only the assigned requester may respond.** Others get read-only.
5. Attachments must clear malware scanning before submit succeeds.
6. Submitting after the deadline is the backend's decision; the UI must handle
   both allow and reject.

---

## Part 5 — Prompts

Written for Antigravity.

### CL1 — Contract, types, fixtures

```
CONTEXT
You are in the OMS frontend repo (Next.js 16, React 19, TypeScript, Tailwind 4,
shadcn/ui). Read first:
  docs/CLARIFICATION-RESPONSE-UI.md   (this spec)
  CLAUDE.md
  docs/APPROVAL-API-CONTRACT.md
  docs/BUDGET-API-CONTRACT.md
  docs/APP-SHELL-SPEC.md

The clarification backend does not exist. Define the contract, then build the
UI against fixtures.

TASK 1 — Write docs/CLARIFICATION-API-CONTRACT.md
Transcribe Part 4 in full: the GET, preview, draft and submit endpoints, every
payload shape, and all six server requirements with their rationale.

State at the top and in every money field: ALL MONETARY VALUES ARE INTEGERS IN
MINOR UNITS. Never floats, never pre-formatted strings.

TASK 2 — Create src/types/clarification.ts
Interfaces for every shape in Part 4. Use a discriminated union on `type` so
MORE_INFO does not carry diff, route or budget fields at all — the type system
should make it impossible to render panels that do not apply.

TASK 3 — Create src/lib/clarification/fixtures.ts
Build FOUR fixtures. The variety matters more than the volume:
  a) INFO_WITH_APPROVAL — the full case. Use the seeded request OMS-2026-0139,
     Data Governance Specialist, raised by Aisha Al Nuaimi 5 Aug. Three asks,
     two addressed. Editable fields: engagement end date 2027-06-30, duration
     10 months, business justification, budget amount 24000000 unchanged.
     Route: Omar Al Hashmi, Fatima Al Marri, Khalid Al Suwaidi, then HR.
     Budget: reservation 24000000, change 0, available 78000000, WITHIN_BUDGET.
     28 days remaining, cycle 2, thread of 3 entries.
  b) MORE_INFO — simple. A two-sentence question, no editable fields, no route,
     no budget. This proves the page collapses correctly.
  c) AMEND with a budget increase — budgetAmount raised, result
     REQUIRES_AMENDMENT.
  d) CRITICAL deadline — 2 days remaining, to test the escalation.

TASK 4 — Create src/lib/clarification/api.ts
Data hooks matching the existing pattern in this repo — check how the requests
module fetches and match it exactly. Read from fixtures behind one flag.
Include a preview hook debounced 500ms and a draft-save hook debounced 2s.

No UI in this task.
```

✅ `feat(clarification): define contract, types and fixtures`

---

### CL2 — Shell, header, consequence banner

```
CONTEXT
Read docs/CLARIFICATION-RESPONSE-UI.md Parts 1.2, 1.6, 2, 3.1.

TASK 1 — Route and shell
Create /app/requests/[id]/clarifications/[clarificationId].
Breadcrumb is the page title per APP-SHELL-SPEC.md: My Requests / OMS-2026-0139
/ Clarification. Do not add a separate heading block above the content.
Sub-line beneath: request title and ID.
Page-bar actions: Save draft (ghost), Submit response (primary).

TASK 2 — Grid
1fr 420px, 24px gap. Right column stacks below 1280px. Single column below
1024px with the right-hand panels moving beneath the response composer, NOT
above it — the composer is the task.

TASK 3 — Consequence banner per 3.1
Always present, directly under the header. Written as a sentence that NAMES THE
ACTUAL PEOPLE:
  MORE_INFO         "Your answer goes to HR, your line manager and your HOD.
                     No new approvals are needed."
  INFO_WITH_APPROVAL "Because you are changing approved details, this returns
                     to Omar Al Hashmi, Fatima Al Marri and Khalid Al Suwaidi
                     before it reaches HR."
  AMEND             "HR has asked for changes. Once submitted, this goes
                     through approval and budget checks again."

Use consequence.summary from the API; do not compose it client-side.

Naming individuals is what makes the consequence land. "Repeat Line Manager,
Section Head and HOD approval" is a process description; names are people the
requester will have to chase.

TASK 4 — Deadline per 1.6
  Over 7 days   neutral, in the header: "28 days left · closes 30 Sep"
  3-7 days      amber, same position, closure date spelled out
  Under 3 days  RED BANNER at the top of the page above the consequence banner,
                stating the consequence: "This request closes in 2 days. If you
                do not respond, it will be closed automatically and the
                reserved funds released."
  Overdue       red banner, past tense

TASK 5 — Type-driven panel visibility
This is critical to the design. For MORE_INFO the diff table, route preview and
budget panel are ABSENT — not rendered empty, not disabled, not collapsed. Use
the discriminated union from CL1 so they cannot render.

Showing three empty panels beside a two-sentence question makes a two-minute
task feel like a twenty-minute one.

VERIFY: load fixtures (a) and (b) and confirm (b) shows a visibly simpler page.
```

✅ `feat(clarification): add page shell and consequence banner`

---

### CL3 — What HR needs, and the thread

```
CONTEXT
Read docs/CLARIFICATION-RESPONSE-UI.md 1.3, 3.2, 3.3.

TASK 1 — "What HR needs" checklist per 3.2
Header shows a done count: "2 of 3 done".
Each ask: a check circle, the text, and its resolution inline once addressed —
"Update the engagement end date  → 31 Aug 2027".
Asks bound to a fieldKey link to that field in the editor; clicking scrolls to
it and focuses it.
Addressed state comes from the preview response's asksAddressed array — do not
compute it client-side.
When asks is empty, omit this panel and show only the message.

As one paragraph it is easy to miss an item and get sent back for a third
cycle. A checklist that ticks itself is the fix.

TASK 2 — HR request panel per 3.3
Avatar, name, role, timestamp, full message text, attachments with a View
action.
Never truncate the message. It is the reason the page exists.

TASK 3 — Thread
Latest entry expanded. Earlier cycles collapse to "Earlier messages (2)",
expandable, each showing full text and attachments — NOT one-line summaries.
On a third clarification cycle, what was said before is exactly the context
needed.
Each entry: actor, role, action in plain words ("asked for more information",
"you responded"), timestamp.

"No limit on clarification cycles" appears only when cycleNumber is 2 or more.
On the first cycle it is noise.

TASK 4 — Plain language
No status codes on screen. "CLARIFICATION_REQUESTED" renders as "asked for more
information".
```

✅ `feat(clarification): add ask checklist and thread`

---

### CL4 — Response composer and inline field editing

```
CONTEXT
Read docs/CLARIFICATION-RESPONSE-UI.md 1.1, 1.4, 3.4, 3.5. This is the most
important task in the set.

TASK 1 — Response composer per 3.4
Auto-growing textarea, minimum 6 rows.
AUTOSAVE 2 seconds after typing stops, via the draft hook. Show "Saved 12:04"
quietly beside the field — not a toast.
Character guidance, not a hard limit.

TASK 2 — Attachments
Drag-and-drop plus a button. State the accepted types and size limit BEFORE
upload, not as a rejection message afterwards.
Show a scanning state — the cybersecurity spec mandates server-side malware
scanning, and a file cannot be submitted until it clears. Render pending,
verified and failed states distinctly.
Remove action per file.

TASK 3 — Inline field editing per 3.5 — THE KEY IMPROVEMENT
The reference design asks the requester to "update the engagement end date" and
then shows the changes table as READ-ONLY, with nowhere on the page to make the
change. The requester has to leave, edit the request, and come back.

Build the fields as editable HERE.

  - Render an editor for each entry in editableFields, in the order the API
    returned them.
  - The control follows the field type: DATE picker, NUMBER with unit, TEXT
    area, SELECT, MONEY input.
  - Show the current value as helper text so the requester can see what they
    are replacing: "Currently 30 Jun 2027".
  - Fields HR flagged via an ask are highlighted with a subtle accent left
    border.
  - Editing triggers the preview call, debounced 500ms, which updates the diff,
    route and budget panels.
  - Fields with financialImpact true show their helpText BESIDE the field
    BEFORE it is changed: "Increasing this starts a budget amendment". Warning
    someone after they have made a change is too late.
  - "Revert" link per changed field, and "Revert all changes" in the panel
    header.

TASK 4 — Reduce the save actions
The reference has Save Response, Save Draft and Submit Response for Approval —
nobody can tell what the first two do differently.
There are exactly TWO actions: Save draft and Submit response. Autosave handles
the rest.
```

🛑 Verify by hand: change the engagement end date and confirm the diff, route
and budget panels all update without a page reload.

✅ `feat(clarification): add response composer with inline field editing`

---

### CL5 — Diff, route and budget panels

```
CONTEXT
Read docs/CLARIFICATION-RESPONSE-UI.md 3.6, 3.7, 3.8.

TASK 1 — "What will change" per 3.6
Table driven live by the preview response: field, before, after, status badge.
  - Fields HR flagged that are still UNCHANGED still appear, marked "Unchanged".
    That is how a requester verifies they did not alter something by accident.
  - Long text values show the first two lines with a "View full change" link
    opening a side-by-side comparison.
  - Empty state before any edit: "Nothing changed yet."
  - Changed rows get a subtle accent left border matching the field editor.

TASK 2 — "Who approves next" per 3.7
Horizontal stepper of the route AFTER submission: you, then each approver by
name and stage, then HR.
DATA-DRIVEN AND VARIABLE LENGTH — not every department has a Section Head. Do
not hardcode five steps. Test with a four-step fixture.
Absent entirely for MORE_INFO.
Note beneath: "Everyone in this list is notified in the system and by email."

TASK 3 — Budget per 3.8
Current reservation, change in amount, available on the selected line, result
badge.
  WITHIN_BUDGET       green, "Still within budget"
  REQUIRES_AMENDMENT  amber, "This starts a budget amendment"
  INSUFFICIENT        red, "Not enough budget on the selected line"

EVERY FIGURE COMES FROM THE SERVER. Compute nothing in the UI — not the
remainder, not the change amount. A client-calculated figure will eventually
disagree with the server's and the wrong one will be trusted.

Note beneath: "Budget is checked again at each approval and finally when your
HOD approves." The figures shown are a preview.

Absent for MORE_INFO, and for other types when budget.applicable is false.

All amounts through lib/money.ts, exact, tabular-nums.

TASK 4 — Loading
While a preview is in flight, keep the panels at their current height and dim
them slightly. Do NOT collapse and re-expand on every keystroke — the debounce
plus a stable height is what keeps typing comfortable.
```

✅ `feat(clarification): add diff, route and budget panels`

---

### CL6 — Submit flow

```
CONTEXT
Read docs/CLARIFICATION-RESPONSE-UI.md Part 4 server requirements.

TASK 1 — Submit confirmation
Before submitting, a confirmation restating the consequence in full:
  - What HR asked, and how many items were addressed
  - What is changing, as a short list
  - Who it goes to next, by name
  - The budget result if applicable

When asks remain unaddressed, WARN but do not block: "You have not addressed:
Attach the approved project plan. Submit anyway?" HR's structuring will not
always be right, but the requester should know before sending.

TASK 2 — Idempotency
Generate an idempotencyKey once when the confirmation opens, not per attempt,
so a retry reuses it. Disable the button during submission.

TASK 3 — Error handling, each with a specific plain message
  CLARIFICATION_BUDGET_CHANGED  Show the new figures inline and ask them to
                                review. Do NOT auto-resubmit.
  CLARIFICATION_ALREADY_SUBMITTED  "This was already submitted on 6 Aug."
  CLARIFICATION_CLOSED          "This request was closed automatically. Contact
                                HR to reopen it."
  ATTACHMENT_SCAN_PENDING       "One attachment is still being checked. Try
                                again in a moment."
  ATTACHMENT_SCAN_FAILED        Name the file and say it cannot be used.

TASK 4 — Success
Return to the request detail with a confirmation naming what happens next:
"Response submitted. It now goes to Omar Al Hashmi for approval."
Clear the local draft.

TASK 5 — Read-only
When canRespond is false, the whole page renders read-only with
readOnlyReason shown at the top, both action buttons ABSENT — not disabled —
and the field editors rendered as plain values.
```

✅ `feat(clarification): add submit flow and error handling`

---

### CL7 — Verify

```
Verify. Report: check | expected | actual | pass.

TYPE ADAPTATION
1. MORE_INFO fixture: diff, route and budget panels are ABSENT from the DOM,
   not hidden or disabled.
2. INFO_WITH_APPROVAL fixture: all panels present.
3. The MORE_INFO page is visibly and substantially simpler.

INLINE EDITING — the key improvement
4. Every field HR flagged is editable on this page.
5. Changing a field updates the diff, route and budget without a reload.
6. Fields with financialImpact show their warning BEFORE the field is changed.
7. Revert per field and revert all both work.
8. Panels do not collapse and re-expand while typing.

ASKS
9. The done count is accurate and comes from the server, not client logic.
10. Clicking an ask bound to a field scrolls to and focuses that field.
11. Submitting with unaddressed asks warns but does not block.

DEADLINE
12. All four severity states render correctly. Load the 2-day fixture and
    confirm the red banner appears above everything.

DRAFT AND SUBMIT
13. Autosave fires 2s after typing stops and shows a quiet timestamp.
14. Reloading mid-draft restores the response and field values.
15. Exactly two actions exist: Save draft and Submit response.
16. Double-clicking Submit fires one request.
17. Every error code renders its specific plain message.
18. CLARIFICATION_BUDGET_CHANGED shows new figures and does not auto-resubmit.

MONEY
19. Every figure traces to a server field. Grep the panels for arithmetic.
20. All amounts exact, tabular-nums, via lib/money.ts.

REST
21. Read-only mode: action buttons absent, fields render as plain values.
22. Route stepper handles a four-step fixture without hardcoding.
23. Responsive 1440, 1280, 1024, 768. Below 1024 the right panels sit BELOW
    the composer.
24. Keyboard: reach every field, attachment control and action.
25. No status codes, field keys or error codes visible anywhere.
26. Light and dark theme.
```

🛑 Final gate. Item 5 is the one that matters.

---

## Part 6 — Questions for DIEZ

1. **Can HR add structured asks when raising a clarification,** or only free
   text? §1.3 assumes they can. If not, the checklist is unbuildable and the
   requester loses the strongest ease-of-use feature on the page.
2. **Which fields may a requester change during a clarification?** Budget
   amount triggers an amendment. Can they change the department, the number of
   resources, the job title?
3. **Does the 30-day clock reset when a response is submitted,** or continue
   from the original request? A request on its third cycle could otherwise
   auto-close while actively being worked.
4. **May a requester submit after the deadline** if the request has not yet
   been auto-closed?
