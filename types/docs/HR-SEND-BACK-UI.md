# HR Send Back — Clarification Authoring

Route: `/app/hr-review/{requestId}/send-back`

**Supersedes prompt HR5 TASK 2** in `HR-REVIEW-UI.md` — the send-back chooser
dialog is replaced by a page mirroring
`CLARIFICATION-RESPONSE-UI.md`.

---

## Part 1 — The gap

`CLARIFICATION-RESPONSE-UI.md` gives the requester:

- **`asks`** — a checklist of discrete things HR needs, each optionally bound
  to a field, that ticks itself as addressed
- **`editableFields`** — exactly the fields HR flagged, rendered as inline
  editors

Both arrive from the API fully formed. **Nothing creates them.** The HR side was
specced as a dialog with three radio cards and a comment box, which can only
produce free text.

Without an authoring surface, the requester's page degrades to what the
competitor's does: a paragraph of prose and no way to know whether you've
addressed everything.

**HR send-back is the authoring side of the requester's response page.** They
are two halves of one conversation and should be built as such.

---

## Part 2 — Symmetry

| Requester page | HR send-back page |
| :--- | :--- |
| Consequence banner — what happens when I submit | Consequence preview — what happens when I send this |
| **What HR needs** — checklist, read-only | **What you need** — ask composer |
| HR request + thread | Thread — previous cycles, if any |
| Your response — textarea | Your message — textarea |
| **What you're changing** — field editors | **Fields to change** — field selector |
| What will change — live diff | Preview — what the requester will see |
| Who approves next | Who it goes back through |
| Budget revalidation | Budget impact note |
| Save draft · Submit response | Save draft · Send back |

Same order, same panel names where they mean the same thing, same components
where possible.

---

## Part 3 — Shared components 🔴

Extract from the requester page and use on both sides. This is what guarantees
alignment — not a style guide, but literally the same code.

| Component | Requester | HR |
| :--- | :--- | :--- |
| `ConsequenceBanner` | What happens on submit | What happens on send |
| `ClarificationThread` | Read | Read |
| `AskList` | Read-only, with tick state | Editable |
| `FieldDiffTable` | Live diff of my changes | Preview and returned diff |
| `ReapprovalRoute` | Who approves after I submit | Who it returns through |
| `BudgetImpactPanel` | Revalidation | Impact note |
| `AttachmentList` | Upload and view | Upload and view |
| `ClarificationLayout` | Two-column shell | Two-column shell |

`AskList` takes a `mode` of `read` or `edit`. `FieldDiffTable` takes `live` or
`static`. Everything else is identical.

---

## Part 4 — The page

```
HR Review / OMS-2026-0139 / Send back
Send this back to Mariam Al Mansoori              [Save draft] [Send back]
Data Governance Specialist · OMS-2026-0139
────────────────────────────────────────────────────────────────────────
 WHAT SHOULD HAPPEN
 ( ) Ask a question
     She answers. Nothing needs re-approval and the request stays with you.
 (•) Ask for changes that need re-approval
     She updates the details, then it goes back through Omar Al Hashmi,
     Fatima Al Marri and Khalid Al Suwaidi before returning to you.
 ( ) Ask her to amend the request
     She revises it. Full approval and budget checks repeat.
────────────────────────────────────────────────────────────────────────
┌──────────────────────────────────┬─────────────────────────────────────┐
│ WHAT YOU NEED                    │ WHAT SHE WILL SEE                   │
│ 1 Clarify the deliverables    ✕  │ ┌─────────────────────────────────┐ │
│ 2 Update the engagement end   ✕  │ │ What HR needs         0 of 3    │ │
│   → linked to Engagement end date│ │ ○ Clarify the deliverables      │ │
│ 3 Attach the project plan     ✕  │ │ ○ Update the engagement end date │ │
│ + Add what you need              │ │ ○ Attach the project plan       │ │
│   Suggested: Job description ·   │ └─────────────────────────────────┘ │
│   Business justification         ├─────────────────────────────────────┤
│                                  │ WHO IT GOES BACK THROUGH            │
│ YOUR MESSAGE                     │ ① Mariam → ② Omar → ③ Fatima →      │
│ [                             ]  │ ④ Khalid → ⑤ You                    │
│ 📎 Add attachment                ├─────────────────────────────────────┤
│                                  │ BUDGET                              │
│ FIELDS SHE CAN CHANGE            │ Reserved  AED 240,000.00            │
│ ☑ Engagement end date            │ Changing the budget amount would    │
│ ☑ Duration                       │ start an amendment.                 │
│ ☑ Business justification         │                                     │
│ ☐ Budget amount  ⚠ amendment     │                                     │
│ ☐ Number of resources            │                                     │
└──────────────────────────────────┴─────────────────────────────────────┘
 🛈 Every message, change and approval is kept for audit.
```

### 4.1 Mode chooser

Three radio cards, always at the top. Each states its consequence and **names
the actual approvers** for modes 2 and 3.

Default: **ask a question** — the least disruptive.

The page adapts, exactly as the requester's does:

| Mode | Ask composer | Field selector | Route | Budget |
| :--- | :---: | :---: | :---: | :---: |
| Ask a question | ✅ | ❌ | ❌ | ❌ |
| Needs re-approval | ✅ | ✅ | ✅ | ✅ |
| Amend request | ✅ | ✅ | ✅ | ✅ |

For "ask a question" the page is short. Panels are **absent**, not disabled.

### 4.2 Ask composer

The counterpart to the requester's checklist.

- Type an item, press Enter, it's added. No dialog, no save button per item.
- Each item can be **linked to a field** — a small picker showing the fields
  selected below. Linking is what makes the requester's checklist tick itself.
- Reorder by drag; remove with ✕.
- **Suggested asks** beneath the input: the items HR raises most often —
  *"Attach the job description"*, *"Clarify the business justification"*,
  *"Update the engagement dates"*, *"Confirm the work location"*. One click
  adds one.

Suggestions matter. Someone clearing twelve reviews types the same three
sentences repeatedly.

Asks are optional. With none, the requester sees only the message — the
competitor's behaviour, as a floor rather than a ceiling.

### 4.3 Field selector

Checkbox list of every field the request exposes. Checked fields become the
requester's inline editors.

- Fields already linked to an ask are checked automatically and marked *"linked
  to ask 2"*.
- **Financial fields carry a warning beside them, before selection**: *"Letting
  her change this could start a budget amendment."*
- Fields that cannot be changed at this stage are absent, not disabled — with a
  short note saying why if the list looks short.

Selecting nothing is valid. It means "answer the question, change nothing."

### 4.4 Live preview

The right column shows the requester's checklist panel **rendered with the same
component she will see**, in read mode with nothing ticked.

This is the point of the symmetry: HR sees exactly what lands, not an
approximation of it.

### 4.5 Route and budget

`ReapprovalRoute` shows the return path by name. Absent for "ask a question".

`BudgetImpactPanel` shows the current reservation and a note about what would
happen if a financial field were changed. No revalidation happens here —
nothing has changed yet.

### 4.6 Deadline

Sending back restarts or continues the 30-day clock — see open question 3 in
`CLARIFICATION-RESPONSE-UI.md`. Whichever it is, **state it on this page**:
*"She has 30 days to respond, or the request closes automatically on 30
September."*

HR should know the consequence of sending something back on day 27.

---

## Part 5 — API additions

Extend `docs/HR-REVIEW-API-CONTRACT.md`.

```
GET /api/v1/hr-review/{requestId}/send-back/options
```

```jsonc
{
  "requester": { "userId": "…", "name": "Mariam Al Mansoori" },
  "modes": [{
    "code": "MORE_INFO",
    "label": "Ask a question",
    "consequence": "She answers. Nothing needs re-approval and the request stays with you.",
    "requiresFieldSelection": false,
    "showsRoute": false,
    "showsBudget": false
  }],
  "selectableFields": [{
    "key": "engagementEndDate", "label": "Engagement end date", "type": "DATE",
    "currentValue": "2027-06-30", "financialImpact": false,
    "warning": null, "selectable": true
  }, {
    "key": "budgetAmount", "label": "Budget amount", "type": "MONEY",
    "currentValue": 24000000, "financialImpact": true,
    "warning": "Letting her change this could start a budget amendment.",
    "selectable": true
  }],
  "suggestedAsks": [
    { "text": "Attach the job description", "fieldKey": null },
    { "text": "Clarify the business justification", "fieldKey": "justification" }
  ],
  "reapprovalRoute": [{ "stage": "LINE_MANAGER", "user": { "name": "Omar Al Hashmi" } }],
  "budget": { "reserved": 24000000, "note": "Changing the budget amount would start an amendment." },
  "deadline": { "daysAllowed": 30, "closesAt": "2026-09-30T00:00:00Z", "restartsOnSend": true },
  "thread": [ /* previous cycles */ ],
  "cycleNumber": 2
}
```

```
PUT  /api/v1/hr-review/{requestId}/send-back/draft
POST /api/v1/hr-review/{requestId}/send-back
{
  "mode": "INFO_WITH_APPROVAL",
  "message": "…",
  "asks": [{ "text": "Update the engagement end date", "fieldKey": "engagementEndDate" }],
  "editableFieldKeys": ["engagementEndDate", "duration", "justification"],
  "attachmentIds": [],
  "idempotencyKey": "uuid"
}
```

### Server requirements

1. **`asks` and `editableFieldKeys` become the requester's `asks` and
   `editableFields`.** This endpoint is what populates that page.
2. A field key in `editableFieldKeys` must be `selectable: true`. Reject
   otherwise — the client must not be able to grant edit rights to a field the
   server considers locked.
3. **Comment (`message`) required** for every mode.
4. Idempotency key mandatory.
5. `MORE_INFO` must not carry `editableFieldKeys`. Reject if present.
6. Attachments must clear malware scanning before send succeeds.

---

## Part 6 — Prompts

### SB1 — Extract shared components 🔴

```
CONTEXT
You are in the OMS frontend repo. Read:
  docs/HR-SEND-BACK-UI.md            (this spec)
  docs/CLARIFICATION-RESPONSE-UI.md
  docs/HR-REVIEW-UI.md
  CLAUDE.md

The requester's clarification page and HR's send-back page are two halves of
one conversation. Alignment must come from shared code, not a shared style
guide.

TASK 1 — Extract the Part 3 components from the requester's page into
src/components/oms/clarification/:

  ConsequenceBanner   props: mode, consequence text, approvers, direction
                      ('sending'|'receiving')
  ClarificationThread props: entries, expandable, latest expanded by default
  AskList             props: asks, mode ('read'|'edit'), onChange
                      read mode = the requester's checklist with tick state
                      edit mode = HR's composer
  FieldDiffTable      props: rows, variant ('live'|'static')
  ReapprovalRoute     props: route, variant ('after-submit'|'return-path')
  BudgetImpactPanel   props: figures, variant ('revalidation'|'note')
  AttachmentList      props: attachments, editable, scanning states
  ClarificationLayout the two-column shell with the sticky action bar

TASK 2 — Refactor the requester's page to consume them
It must render and behave identically afterwards. Run its existing verification
(CLARIFICATION-RESPONSE-UI.md CL7) and confirm nothing regressed.

TASK 3 — Report
List every component extracted, its props, and which page uses which variant.
Note anything you could NOT share and why — those are the places the two pages
will drift.

Do not build the HR page yet.
```

🛑 Re-run the requester page's checks before continuing.

✅ `refactor(clarification): extract shared components`

---

### SB2 — Contract and fixtures

```
CONTEXT
Read docs/HR-SEND-BACK-UI.md Part 5.

TASK 1 — Extend docs/HR-REVIEW-API-CONTRACT.md
Add the options GET, the draft PUT and the send POST exactly as specced,
including all six server requirements with rationale.

State the most important one prominently: the asks and editableFieldKeys sent
here BECOME the requester's asks and editableFields. This endpoint is what
populates that page. If it sends nothing structured, the requester gets a
paragraph of prose and no way to know whether she has addressed everything.

Money stays integers in minor units.

TASK 2 — Types in src/types/hr-send-back.ts, reusing the clarification types
from src/types/clarification.ts wherever the shapes match. Asks and fields must
use the SAME interfaces on both sides — if they diverge, the pages will.

TASK 3 — Fixtures in src/lib/hr-send-back/fixtures.ts:
  a) OMS-2026-0139, Data Governance Specialist, requester Mariam Al Mansoori,
     five selectable fields including budgetAmount with financialImpact true,
     four suggested asks, a four-step reapproval route, reserved 24000000,
     30-day deadline, cycle 2 with one prior thread entry.
  b) Cycle 1 — empty thread, to check the thread panel is omitted.
  c) A request with only two selectable fields, to check the "short list" note.

TASK 4 — Data hooks matching the existing pattern, with a 2s debounced draft
save.
```

✅ `feat(hr-send-back): contract, types and fixtures`

---

### SB3 — Page shell and mode chooser

```
CONTEXT
Read docs/HR-SEND-BACK-UI.md Part 4.1 and Part 2.

TASK 1 — Route /app/hr-review/[requestId]/send-back
Use ClarificationLayout from SB1 — the same shell as the requester's page.
Breadcrumb is the title: HR Review / OMS-2026-0139 / Send back.
Sub-line: "Send this back to Mariam Al Mansoori" plus the request title and ID.
Page-bar actions: Save draft (ghost), Send back (primary).

TASK 2 — Mode chooser
Three radio cards at the top, each with its consequence sentence from the
options payload. NAME THE ACTUAL APPROVERS for modes 2 and 3 from
reapprovalRoute — "returns through Omar Al Hashmi, Fatima Al Marri and Khalid
Al Suwaidi", never "repeats hierarchy approval".

Default: ask a question. It is the least disruptive.

TASK 3 — Mode-driven panels, per the Part 4.1 table
  Ask a question       ask composer only
  Needs re-approval    everything
  Amend request        everything

Absent, not disabled, not collapsed. Use a discriminated union on mode so
inapplicable panels cannot render — the same approach as the requester's page.

TASK 4 — Deadline note per 4.6
State the consequence of sending back: "She has 30 days to respond, or the
request closes automatically on 30 September."
HR needs to know this when sending something back on day 27.

TASK 5 — Autosave the draft 2s after changes stop, with a quiet "Saved 12:04".

VERIFY: switch between modes and confirm the page visibly shortens for "ask a
question".
```

✅ `feat(hr-send-back): page shell and mode chooser`

---

### SB4 — Ask composer and field selector 🔴

```
CONTEXT
Read docs/HR-SEND-BACK-UI.md 4.2 and 4.3. This is the core of the feature —
these two panels author the requester's page.

TASK 1 — Ask composer, using AskList in edit mode
  - Type an item, press Enter, it is added. No dialog, no per-item save.
  - Each item can be LINKED to a field via a small picker listing the fields
    checked in the selector below. Linking is what makes the requester's
    checklist tick itself as she addresses each item.
  - Reorder by drag. Remove with an ✕.
  - Suggested asks beneath the input from suggestedAsks — one click adds one.
    Someone clearing twelve reviews types the same three sentences over and
    over; this is the fix.
  - Asks are OPTIONAL. With none, the requester sees only the message.

TASK 2 — Field selector
Checkbox list from selectableFields. Checked fields become the requester's
inline editors — this is the mechanism that lets her change the engagement end
date on the page where she was asked to.

  - A field linked to an ask is checked automatically and marked "linked to
    ask 2". Unchecking it also unlinks the ask; warn before doing so.
  - FINANCIAL FIELDS show their warning BESIDE the checkbox, BEFORE selection:
    "Letting her change this could start a budget amendment." Warning after the
    fact is too late.
  - Fields with selectable false are ABSENT, not disabled. If fewer than three
    fields are selectable, add a short note explaining why the list is short.
  - Selecting nothing is valid — it means "answer the question, change
    nothing."

TASK 3 — Message and attachments
Textarea, minimum 5 rows, auto-growing. Required for every mode.
AttachmentList from SB1 with the same scanning states as the requester's page.

TASK 4 — Validation
Send is disabled until a message exists, with the reason stated.
Warn on send when the mode requires re-approval but no fields were selected:
"You have asked for changes that need re-approval, but she cannot change any
fields. Did you mean to ask a question instead?"

That mismatch is the most likely mistake on this page.
```

🛑 Verify: select a field, link an ask to it, and confirm the preview updates.

✅ `feat(hr-send-back): ask composer and field selector`

---

### SB5 — Preview, route and budget

```
CONTEXT
Read docs/HR-SEND-BACK-UI.md 4.4 and 4.5.

TASK 1 — Live preview, "What she will see"
Render the requester's checklist panel using AskList in READ mode — the exact
component she will see, with nothing ticked and the done count at 0.

This is the point of the shared components: HR sees what actually lands, not an
approximation. If the preview and the requester's page can differ, they will.

Beneath the checklist, preview the message as it will appear, and list the
fields she will be able to change.

Update live as asks and fields change, debounced 300ms.

TASK 2 — ReapprovalRoute in 'return-path' variant
Shows the path back: her, then each approver by name, then you.
Data-driven and VARIABLE LENGTH — not every department has a Section Head.
Absent for "ask a question".

TASK 3 — BudgetImpactPanel in 'note' variant
Current reservation plus a note about what would happen if a financial field
were changed. NO revalidation here — nothing has changed yet, and showing a
recalculated figure would imply otherwise.
All amounts via lib/money.ts, exact, tabular-nums. No client arithmetic.
Absent for "ask a question".
```

✅ `feat(hr-send-back): preview, route and budget panels`

---

### SB6 — Send flow

```
CONTEXT
Read docs/HR-SEND-BACK-UI.md Part 5 server requirements.

TASK 1 — Confirmation
Restate before sending:
  - Which mode, in plain words
  - How many things you are asking for
  - Which fields she can change
  - Who it returns through, by name
  - When it closes if she does not respond

TASK 2 — Warnings that do not block
  - Re-approval mode with no fields selected (SB4 TASK 4)
  - No asks added: "She will see only your message. Add specific items so she
    knows exactly what to address."
  Both warn and allow. HR's judgement, not a gate.

TASK 3 — Idempotency
Key generated once when the confirmation opens, reused on retry. Button
disabled during submission.

TASK 4 — Errors, each with a plain message
  SEND_BACK_FIELD_NOT_SELECTABLE  Name the field; it may have been locked since
                                  the page loaded. Remove it and retry.
  SEND_BACK_ALREADY_DECIDED       "This request was already decided by {name}."
  ATTACHMENT_SCAN_PENDING         "One attachment is still being checked."
  HR_REVIEW_BUDGET_CHANGED        Show current figures; do not auto-resubmit.

TASK 5 — Success
Return to the HR review queue with a confirmation naming what happened: "Sent
back to Mariam Al Mansoori. She has until 30 September to respond."
Advance to the next queue item per HR6, and clear the local draft.

TASK 6 — Remove the old dialog
Delete the send-back dialog built in HR5 TASK 2 and point the queue's "Send
back" action at this page. Confirm no route still opens the dialog.
```

✅ `feat(hr-send-back): send flow`

---

### SB7 — Verify symmetry

```
Verify both sides of the clarification conversation. Report: check | expected |
actual | pass.

SYMMETRY — the point of this work
1. Both pages use ClarificationLayout, and their panel order matches Part 2.
2. AskList renders in edit mode on HR's page and read mode on the requester's —
   the same component. Grep for a second implementation; there must be none.
3. ReapprovalRoute, BudgetImpactPanel, ConsequenceBanner, ClarificationThread
   and AttachmentList are each single implementations used by both.
4. Screenshot both pages side by side at 1440px. They must read as two views of
   one thing.

AUTHORING — the core mechanism
5. Asks added on HR's page appear as the requester's checklist.
6. Fields checked on HR's page appear as the requester's inline editors.
7. An ask linked to a field ticks itself when that field is changed by the
   requester.
8. Financial field warnings appear BEFORE selection, not after.
9. Fields with selectable false are absent, not disabled.

MODE ADAPTATION
10. "Ask a question" hides the field selector, route and budget — absent from
    the DOM.
11. That page is visibly and substantially shorter.
12. Switching modes preserves the message and asks already entered.

VALIDATION
13. Send is blocked without a message, with the reason stated.
14. Re-approval mode with no fields selected warns but does not block.
15. No asks warns but does not block.

REST
16. Autosave fires 2s after changes stop; reload restores the draft.
17. Double-clicking Send fires one request.
18. Every error renders its specific plain message.
19. Success advances to the next queue item and names the deadline.
20. The old send-back dialog is gone; nothing routes to it.
21. Amounts exact, tabular-nums, no client arithmetic.
22. Responsive 1440, 1280, 1024, 768. Light and dark.
23. No status codes, field keys or mode codes visible anywhere.

Re-run CLARIFICATION-RESPONSE-UI.md CL7 in full and confirm no regression from
the SB1 refactor.
```

🛑 Final gate. Item 4 is the real test.
