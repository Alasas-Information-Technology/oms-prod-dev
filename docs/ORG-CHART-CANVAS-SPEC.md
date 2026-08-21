# Org Chart Canvas — Dotted Grid, Drag, and Reset

Adds a dot grid surface, free card positioning, and a layout reset to the
organization chart canvas.

**Palette unchanged.**

---

## Part 1 — Decisions

### 1.1 Drag does not reparent 🔴

Dragging a card changes **where it sits on screen**. It does **not** change
where it sits in the organization.

Moving a unit in the hierarchy rewrites the closure table for its whole
subtree, can strand budget commitments, and is guarded by `ORG.MOVE`. That
stays behind the guided Move flow. A drag gesture must never trigger it.

Consequences for the build:

- Connectors follow the dragged card and keep pointing at its real parent. A
  card dragged next to a different branch still connects to its actual parent —
  and that visibly wrong-looking line is correct behaviour.
- No drop targets, no "drop onto a card to reparent", no hover highlighting of
  other cards during a drag.
- No API call on drag end. Positions are a client-side view preference.

### 1.2 Positions are personal, not shared

Custom layout is saved per user in `localStorage`, keyed by user and root unit,
with a schema version. It is not sent to the server and does not affect what
anyone else sees.

Rationale: it's a view preference, like zoom level. Making it shared would need
a permission, a conflict model, and an audit trail for something with no
business meaning.

### 1.3 Reset and Fit are two different things

| Control | Restores |
| :--- | :--- |
| **Reset layout** | Card positions back to the computed auto-layout. Leaves zoom and pan alone. |
| **Fit to view** | Zoom and pan. Leaves card positions alone. |

Keep them separate. Merging them means someone who just wanted to re-centre
loses ten minutes of arranging.

### 1.4 Snap to the grid

Cards snap to the 24px dot grid. This is the reason the grid is dotted rather
than plain — the dots aren't decoration, they're the snap increment made
visible. Hold **Option** to drag freely.

### 1.5 New units under a custom layout

When a unit is added or expanded while a custom layout is active, place it at
its computed auto-layout position. If that overlaps an existing card, offset by
one grid step until clear. Never silently discard the user's arrangement.

---

## Part 2 — Dot grid

| Property | Value |
| :--- | :--- |
| Dot size | 1px |
| Spacing | 24px — must equal the snap increment |
| Colour | `--text-primary` at 6% opacity |
| While dragging | 12% opacity, 120ms transition |
| Edge treatment | Radial mask fading toward the canvas edges |
| Zoom behaviour | Scales with content; below 50% zoom the grid fades out |

Raising opacity during a drag turns the grid into an active snapping surface,
then returns it to a quiet texture. Cheap to build, and it makes the snap feel
intentional rather than jerky.

Implement as a CSS `background-image` with `radial-gradient`, not as DOM
elements. At 5,000 units that's the difference between smooth and unusable.

---

## Part 3 — Drag

### 3.1 Gesture

- Whole card is the handle. No separate grab affordance.
- Cursor `grab` on hover, `grabbing` while dragging.
- **4px movement threshold** before a drag begins, so a click that wobbles
  still registers as a click and opens the panel.
- Canvas pan is drag-on-empty-space, plus **Space + drag** anywhere. These must
  not conflict — a drag starting on a card is always a card drag.
- Drag is disabled while the Move flow, Add flow, or detail panel is open.

### 3.2 While dragging

- Card lifts: shadow `0 4px 8px rgba(0,0,0,.06), 0 12px 32px rgba(0,0,0,.10)`,
  `scale(1.02)`.
- Dragged card renders above all others.
- Its connectors recalculate live, throttled to `requestAnimationFrame`.
- Grid steps up to 12% opacity.
- Auto-pan when dragging within 60px of a canvas edge, capped at 8px/frame.

### 3.3 On release

- Snap to the nearest 24px intersection, 120ms ease.
- Persist to `localStorage`.
- Show the "Custom layout" indicator if not already visible.
- No toast. Dragging is low-stakes and confirmation would be noise.

### 3.4 Undo

`Cmd+Z` undoes the last position change, up to 20 steps. `Cmd+Shift+Z` redoes.
Scoped to positions only — it must never undo a real Move, Add, or Archive.

### 3.5 Keyboard

Dragging is mouse-only, so provide an equivalent:

- Card focused + **Shift + arrow** nudges 24px.
- Card focused + **Option + Shift + arrow** nudges 1px.
- Plain arrows keep moving focus between cards.

---

## Part 4 — Controls

Bottom-right cluster, extending the existing zoom pill:

```
[ ⊖ ] 80% [ ⊕ ]  │  [ ⤢ ]  │  [ ⇅ ]  │  [ ↺ ]
  zoom            fit      layout    reset
```

- **↺ Reset layout** — disabled and at 40% opacity when the layout is
  unmodified. Tooltip: *"Reset card positions"*.
- Confirmation only when more than 5 cards have been moved: *"Reset all card
  positions? Your arrangement will be lost."* Below that, just do it — with
  `Cmd+Z` available.
- Reset animates cards to their computed positions over 300ms. The animation is
  the feedback.

### Custom layout indicator

When any card has been moved, show a chip at the **top-left** of the canvas,
16px inset:

```
● Custom layout    Reset
```

- 12px text, `--text-secondary`, `--surface-2` background at 90% with backdrop
  blur, 0.5px border, 8px radius, 6px/10px padding.
- "Reset" is an inline text button.
- Fades out after 4s, returns on hover near the top-left, and stays permanently
  visible while dragging.

This exists so nobody wonders why their chart looks different from a
colleague's.

---

## Part 5 — Persistence

```ts
// Key: oms.orgchart.layout.v1.{userId}.{rootUnitId}
{
  version: 1,
  rootUnitId: string,
  updatedAt: string,
  positions: Record<string /* unitId */, { x: number; y: number }>
}
```

- Write debounced 500ms after the last drag.
- On load, apply saved positions to units that still exist; drop entries for
  units that don't.
- Discard the whole entry if `version` doesn't match — never migrate silently.
- Cap at 500 entries; beyond that, keep only currently visible units.
- Wrap every access in try/catch. Private browsing and quota limits must
  degrade to auto-layout, never throw.

---

## Part 6 — Prompts

### C1 — Dot grid

```
Read docs/ORG-CHART-CANVAS-SPEC.md, then CLAUDE.md.

Implement Part 2 — the dotted canvas grid.

1. Replace the plain canvas background with a dot grid: 1px dots, 24px
   spacing, --text-primary at 6% opacity.
2. Implement as a CSS background-image using radial-gradient. Do NOT render dots
   as DOM elements — at 5,000 units that difference is fatal for performance.
3. The grid scales with canvas content on zoom and fades out below 50% zoom.
4. Apply a radial mask fading the grid toward the canvas edges so it reads as a
   surface rather than graph paper.
5. Expose a prop or state that raises the grid to 12% opacity with a 120ms
   transition — C2 will use it during drags.
6. Verify in both light and dark theme. Use theme tokens only; no hardcoded
   colour values.

Confirm pan and zoom still hold 60fps with the grid in place.
```

✅ `feat(org-ui): add dotted canvas grid`

---

### C2 — Drag 🔴

```
Plan first. Show me the plan before writing code.

Implement Part 1 and Part 3 — draggable cards.

CRITICAL CONSTRAINT: dragging a card changes its POSITION ON SCREEN ONLY. It
must NEVER reparent the unit. Moving a unit in the hierarchy rewrites the
closure table for its entire subtree and stays behind the guided Move flow,
gated on ORG.MOVE. Specifically:
- No drop targets, no reparent-on-drop, no highlighting other cards during a
  drag.
- No API call on drag end. Positions are client-side only.
- Connectors follow the dragged card and keep pointing at its REAL parent. A
  card dragged beside another branch still connects to its actual parent. That
  visually odd line is correct.

Implementation per Part 3:
1. Whole card is the drag handle. Cursor grab / grabbing.
2. 4px movement threshold before a drag starts, so a click that wobbles still
   opens the detail panel.
3. Canvas pan stays as drag-on-empty-space plus Space+drag. A drag starting on
   a card is always a card drag — these must not conflict.
4. Disable dragging while the Move flow, Add flow, or detail panel is open.
5. While dragging: lift shadow and scale(1.02) per 3.2, dragged card above all
   others, connectors recalculating on requestAnimationFrame, grid to 12%.
6. Auto-pan when within 60px of a canvas edge, capped at 8px per frame.
7. On release: snap to the nearest 24px intersection over 120ms. No toast.
8. Cmd+Z / Cmd+Shift+Z for position undo/redo, 20 steps, scoped to positions
   ONLY. It must never undo a real Move, Add, or Archive.
9. Keyboard equivalents per 3.5: Shift+arrow nudges 24px, Option+Shift+arrow
   nudges 1px, plain arrows still move focus.

Persistence per Part 5: localStorage, versioned key, 500ms debounced write,
positions dropped for units that no longer exist, whole entry discarded on
version mismatch, every access in try/catch so private browsing degrades to
auto-layout rather than throwing.

Part 1.5: when a unit is added or expanded while a custom layout is active,
place it at its computed auto-layout position, offsetting by one grid step
until it doesn't overlap. Never discard the user's arrangement.

In your plan, state how you will keep card drag and canvas pan from conflicting,
and how connector recalculation stays at 60fps when dragging a card with 20
children.
```

🛑 Read the plan. Then verify by hand: drag a card next to a different branch,
reload, and confirm the hierarchy is unchanged and the connector still points
at the real parent.

✅ `feat(org-ui): add draggable card positioning`

---

### C3 — Reset and indicator

```
Implement Part 1.3 and Part 4 — reset layout and the custom layout indicator.

1. Add a Reset control to the existing bottom-right zoom cluster per the Part 4
   diagram. Disabled at 40% opacity when the layout is unmodified. Tooltip
   "Reset card positions".
2. Reset restores computed auto-layout positions and clears the stored entry. It
   must NOT change zoom or pan — "Fit to view" owns those. Keep the two
   controls separate.
3. Cards animate to their computed positions over 300ms. That animation is the
   confirmation; no toast.
4. Confirm before resetting only when more than 5 cards have been moved:
   "Reset all card positions? Your arrangement will be lost." Below that
   threshold just do it — Cmd+Z is available.
5. Reset is undoable via Cmd+Z.
6. Custom layout indicator per Part 4: top-left of the canvas, 16px inset, with
   an inline Reset text button. Fades after 4s, returns on hover near the
   top-left, stays visible throughout a drag.
7. Verify the indicator does not overlap the minimap or the first row of cards.

Use theme tokens only.
```

✅ `feat(org-ui): add layout reset and custom layout indicator`

---

### C4 — Verify

```
Verify the canvas. Report: check | expected | actual | pass.

1. Drag a card next to a different branch. Reload. Confirm the hierarchy is
   unchanged and the connector still points at the real parent.
2. Confirm no network request fires on drag end.
3. Confirm a click that moves 2-3px opens the detail panel rather than
   registering as a drag.
4. Confirm dragging from empty canvas pans, and dragging from a card moves the
   card, with no conflict.
5. Confirm cards snap to 24px intersections and that Option bypasses snap.
6. Confirm the grid raises to 12% during a drag and returns after.
7. Reset with 3 cards moved (no confirmation) and with 8 moved (confirmation).
8. Confirm Reset does not alter zoom or pan.
9. Confirm Cmd+Z undoes a drag and a reset, and never undoes a real Move.
10. Add a unit while a custom layout is active. Confirm it places sensibly
    without overlapping and without clearing the arrangement.
11. Test in private browsing with localStorage unavailable — must fall back to
    auto-layout without throwing.
12. Corrupt the stored entry manually and reload — must discard and fall back.
13. Measure fps while dragging a card with 20 children on the 5,000-unit seed.
14. Keyboard: focus a card, Shift+arrow to nudge, Option+Shift+arrow for fine
    nudge, plain arrows to move focus.
15. Light and dark theme.
```

🛑 Final gate.
