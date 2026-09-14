# RASIKH — UI System v3 (Primitives, Typography, Glass)

> Supersedes the typography and component sections of the v1/v2 brand spec. Colors and the logo system are unchanged and still apply.

---

## 0. What changed, and why it matters

| Area | v2 (previous) | v3 (this doc) | Why |
|---|---|---|---|
| Display font | Fraunces (serif) | **Urbanist** | Explicit instruction. This drops the "serif = gravitas" argument from v2 — the brand's distinctiveness now has to come from color, the ring motif, and the glass system instead of typography. If you want to keep one trace of the old idea, Fraunces can survive only in the wordmark lockup as a legacy mark; nowhere else. |
| UI/body font | Inter | **Google Sans Flex** | Explicit instruction. Google Sans Flex is a real, current Google Fonts release (Nov 2025) with a `ROND` (roundness) axis — set this axis high (see 1.2) and the body font itself echoes the rounded card/button system instead of just sitting next to it. |
| Components | Implied per-context variants (KPI card vs. panel card, primary vs. CTA button) | **One primitive per role, no exceptions** | Explicit instruction: no duplicate Card components, no duplicate Button components. Section 3 is the enforceable registry. |
| Surface style | Flat cards only | **Flat and glass from the same primitive** | Glass is a `surface` prop on the one Card component, not a second component. |
| Corners | 6–12px, functional | **Generous, pill-forward** | Matches the reference direction: pill buttons, big soft radii on cards, circular icon buttons. |

---

## 1. Typography

### 1.1 Roles

| Role | Typeface | Source | Used for |
|---|---|---|---|
| Display | **Urbanist** | Google Fonts, variable, weights 400–800 | H1 page titles, hero KPI numbers, empty-state headlines |
| UI / body | **Google Sans Flex** | Google Fonts, variable (`wght`, `wdth`, `ROND`, `opsz`, `slnt`, `GRAD`) | Nav, tables, forms, buttons, body copy, card labels |
| Financial / data | JetBrains Mono | unchanged from v2 | Money, IDs, timestamps, `tabular-nums` |
| Arabic | IBM Plex Sans Arabic | unchanged from v2 | RTL vendor portal, Arabic wordmark |

### 1.2 Google Sans Flex axis settings

Don't just import the default static weight — dial the variable axes to match the rest of the system:

```css
:root {
  --font-ui: 'Google Sans Flex', system-ui, sans-serif;
}
body {
  font-family: var(--font-ui);
  font-variation-settings: 'ROND' 60, 'wdth' 100, 'GRAD' 0;
}
```
`ROND 60` softens terminals just enough to agree with pill buttons and 24px card radii without going all the way to a bubbly display face. Push it toward 100 only on marketing/empty-state surfaces, never in dense tables — high roundness hurts legibility at 12–13px.

### 1.3 Scale

| Token | Size | Font | Weight |
|---|---|---|---|
| `--text-display` | 34–40px | Urbanist | 700 |
| `--text-h1` | 24px | Urbanist | 600 |
| `--text-h2` | 18px | Urbanist | 600 |
| `--text-h3` | 15px | Google Sans Flex | 600 |
| `--text-body` | 14px | Google Sans Flex | 400 |
| `--text-label` | 13px | Google Sans Flex | 500 |
| `--text-micro` | 12px | Google Sans Flex | 500 |
| `--text-mono` | 12–13px | JetBrains Mono | 400/500 |

---

## 2. Color and radius tokens (glass-ready)

Base palette is unchanged from v2 — bedrock indigo, root bronze, teal, sand neutrals. New tokens added for the glass system:

```css
:root {
  --radius-sm: 10px;
  --radius-md: 16px;
  --radius-lg: 24px;
  --radius-full: 999px;

  --glass-bg-light: rgba(255,255,255,0.55);
  --glass-bg-dark: rgba(26,23,18,0.45);
  --glass-border-light: rgba(255,255,255,0.45);
  --glass-border-dark: rgba(255,255,255,0.08);
  --glass-blur: 20px;
  --glass-saturate: 160%;
}
```

**Glass only reads as glass if something is behind it.** A frosted card over a flat sand background just looks like a grey box. Every page that uses `surface="glass"` needs a background treatment: 2–3 large, softly blurred color fields (`--rasikh-bedrock`, `--rasikh-root-bronze`, `--rasikh-teal` at 15–25% opacity, `filter: blur(80px)`) fixed behind the content layer. This is a page-level background component, not part of the Card primitive itself — Card just needs a transparent-enough surface to show whatever's beneath it.

---

## 3. Primitive registry — the enforced list

This is the complete set of primitives allowed to exist in `components/ui/`. Anything that isn't page-specific composition must be one of these, with props for variation — never a sibling component for a different look.

| Primitive | Replaces / consolidates | Key props |
|---|---|---|
| `Card` | KPI card, panel card, glass card, modal shell | `surface`: `solid` \| `glass`; `padding`: `sm`\|`md`\|`lg`; `radius` defaults to `lg` |
| `Button` | Primary button, secondary button, CTA button, icon button | `variant`: `primary`\|`secondary`\|`ghost`; `size`: `sm`\|`md`\|`lg`; `iconOnly`: bool; always `radius-full` |
| `Input` | Text input, search input | `size`, `icon` (leading), `state`: `default`\|`error` |
| `Select` | — | same size/state props as `Input` |
| `Badge` | Status pill, filter chip, nav-count badge | `tone`: `neutral`\|`accent`\|`success`\|`warning`\|`danger`\|`bronze`; `removable`: bool |
| `Avatar` | User avatar, vendor logo tile | `size`, `fallback` (initials) |
| `Table` | — | `density`: `comfortable`\|`compact` |
| `Tabs` | — | — |
| `Tooltip` | — | — |
| `Modal` | Dialog, drawer, sheet | `surface` inherited from Card |
| `Switch` | — | — |
| `Divider` | — | `orientation` |
| `ProgressRail` | Brand-specific: the 4px lifecycle stepper and the ring-progress indicator from v2 | `variant`: `linear`\|`ring` |

**Rule for reviewers, and for whoever implements this**: if a PR introduces a second component whose only difference from an existing primitive is a visual style (a `GlassCard`, an `OutlineButton`, a `PillBadge`), that's a prop on the existing primitive, not a new file. The test is: does this new thing represent a different *kind* of object, or a different *look* of the same object? Only the former justifies a new primitive.

---

## 4. Card primitive — full spec

```tsx
type CardProps = {
  surface?: 'solid' | 'glass'
  padding?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}
```

```css
.card {
  border-radius: var(--radius-lg);
  transition: background 0.2s ease;
}
.card[data-surface="solid"] {
  background: var(--card);
  border: 1px solid var(--border);
}
.card[data-surface="glass"] {
  background: var(--glass-bg-light);
  backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturate));
  -webkit-backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturate));
  border: 1px solid var(--glass-border-light);
}
[data-theme="dark"] .card[data-surface="glass"] {
  background: var(--glass-bg-dark);
  border-color: var(--glass-border-dark);
}
```

Default `surface` is `solid` for dense data screens (tables, forms, approval queues) — glass is reserved for dashboard/overview surfaces where there's a background worth seeing through. Don't apply glass to a table row or a form panel; it hurts legibility exactly where legibility matters most.

---

## 5. Button primitive — full spec

- Always `border-radius: var(--radius-full)` — no square or soft-rounded buttons anywhere in the system.
- `variant="primary"`: bedrock indigo fill, white text.
- `variant="secondary"`: 1px border, transparent fill.
- `variant="ghost"`: no border, no fill, text only.
- Bronze is **not** a button variant — per the v2 rule, bronze stays reserved for rare milestone/attention moments, never a default interactive color.
- `iconOnly`: same component, square aspect ratio, `radius-full` makes it a circle — this is how the reference screenshot's circular icon buttons (search, lock, notification) get built without a separate `IconButton` component.
