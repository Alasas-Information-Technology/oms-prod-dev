# DIEZ OMS — Complete Design System Specification

> **Status**: Authoritative Reference Specification  
> **Target Audience**: Product Designers, Frontend Engineers, Security & Accessibility Auditors  
> **Applicability**: Entire DIEZ Outsource Management System (Internal OMS `/app/*` and Vendor Portal `/vendor/*`)

---

## 1. Vision & Core Philosophy

The DIEZ Outsource Management System (OMS) is an enterprise procurement, budget control, and contingent workforce platform engineered for Dubai Integrated Economic Zones (DIEZ).

The design system is grounded in four foundational tenets:

1. **"Colourful & Corporate" (Semantic Intentionality)**:  
   Color carries structural, quantitative, or semantic meaning—never arbitrary decoration. Every tint, border, and badge signals workflow state, financial exposure, availability, or deadline urgency.
2. **"The System Proposes; the Human Curates"**:  
   Users must never be forced to hunt through raw data or do mental math. The system calculates overlaps, suggests slots, detects collisions, and computes variances; the human user verifies and confirms.
3. **"Impressive Comes from Revealing What a List Cannot"**:  
   Monotonous tables and lists are elevated with visual depth: proportional stacked distributions, 20-tick gauge bars, 45° hatched trend areas, and 4px progress rails.
4. **Architectural Security at the Presentation Boundary**:  
   The UI never hides unauthorized data via CSS. Boundary concealment (such as blind candidate reviews, hidden vendor identities, concealed budget ceilings, and anonymized interviewers) is strictly enforced at the data contract and API layer so the DOM is fundamentally incapable of leaking sensitive information.

---

## 2. Design Tokens & Visual Foundation

All tokens are defined in [`app/globals.css`](file:///Users/aait/Documents/Development/DIEZ-OMS/oms-prod-dev/app/globals.css) and exposed through Tailwind CSS v4 variables.

### 2.1 Color Palette

#### Core Brand & Base Palette
| Token | Light Value | Dark Value | Purpose / Usage |
| :--- | :--- | :--- | :--- |
| `--background` | `#FAFBFC` | `#0F1419` | Root page background |
| `--background-secondary` | `#F1F5F9` | `#1A1F2E` | Secondary background, panel strips |
| `--background-tertiary` | `#E8EEF5` | `#252D3D` | Embedded container backgrounds |
| `--foreground` | `#0F1419` | `#F9FAFB` | Primary high-contrast text |
| `--foreground-secondary` | `#475569` | `#D1D5DB` | Secondary body text, descriptions |
| `--foreground-tertiary` | `#64748B` | `#9CA3AF` | Supporting labels, muted captions |
| `--card` | `#FFFFFF` | `#1A1F2E` | Card surfaces |
| `--card-foreground` | `#0F1419` | `#F9FAFB` | Card primary text |
| `--primary` | `#5B5FE1` (Vibrant Indigo) | `#818CF8` | Primary brand accent, primary CTA |
| `--primary-foreground` | `#FFFFFF` | `#0F1419` | Text on primary elements |
| `--secondary` | `#0C3A8F` (Deep Blue) | `#42A5F5` | Secondary brand actions, navigation active states |
| `--brand-teal` | `#34BCB2` (DIEZ Teal) | `#34BCB2` | Vendor portal branding, verified checkmarks |
| `--border` | `#E2E8F0` | `#222B3C` | Subtle dividers, container borders |
| `--input` | `#F8FAFC` | `#1A1F2E` | Input field surface |
| `--ring` | `#5B5FE1` | `#818CF8` | Focus rings (3:1 contrast minimum) |

#### Semantic Matrix (15-Token System)
Every semantic meaning is paired as a tri-token: **Surface Tint**, **Border**, and **Text Value**.

| Semantic Meaning | Surface Token | Border Token | Text Token | Typical Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Accent** | `--accent-surface` (`#EEF2FF` / `#1E2540`) | `--accent-border` (`#4F46E5` / `#818CF8`) | `--accent-text` (`#3730A3` / `#C7D2FE`) | Selections, active stages, focus states |
| **Success** | `--success-surface` (`#ECFDF5` / `#142924`) | `--success-border` (`#059669` / `#34D399`) | `--success-text` (`#065F46` / `#A7F3D0`) | Confirmed interviews, approved budgets |
| **Warning** | `--warning-surface` (`#FFFBEB` / `#2E2416`) | `--warning-border` (`#B45309` / `#FBBF24`) | `--warning-text` (`#78350F` / `#FDE68A`) | Tight deadlines (<2 days), pending review |
| **Danger** | `--danger-surface` (`#FFF1F2` / `#2E1B22`) | `--danger-border` (`#E11D48` / `#FB7185`) | `--danger-text` (`#881337` / `#FECDD3`) | Urgent deadline (<24h), over-budget, errors |
| **Info** | `--info-surface` (`#F0F9FF` / `#142538`) | `--info-border` (`#0284C7` / `#38BDF8`) | `--info-text` (`#075985` / `#BAE6FD`) | System notices, automated recommendations |

#### Candidate Identity Palette (Interview Planning)
To differentiate multiple candidates on a single calendar or tray without confusion, candidates are assigned a deterministic chromatic accent:
- **Violet**: `#8B5CF6`
- **Teal**: `#0D9488`
- **Amber**: `#F59E0B`
- **Rose**: `#F43F5E`
- **Sky**: `#0284C7`
- **Lime**: `#65A30D`

*Rule*: Used exclusively for left borders (3px), avatar backgrounds, and soft tints (8% light / 12% dark). Never as full solid fills behind body copy. Always paired with the candidate reference (`C-021`).

---

### 2.2 Surface Elevation & Dark Mode Physics

Dark mode is a **redesign at lower luminance**, not a crude color inversion.

```
Elevation 3: Popover / Modal     (--surface-popover)    [#2D364A]
Elevation 2: Floating Card       (--surface-elevated)   [#212838]
Elevation 1: Base Card           (--surface-card)       [#161B26]
Elevation 0: Canvas Background   (--surface-base)       [#0B0F17]
```

- **Luminance Steps**: Each surface elevation step in dark mode is ~4% lighter than the previous layer to establish physical depth.
- **Shadow Elimination on Dark**: CSS drop shadows are invisible on near-black surfaces. In dark mode, shadows are replaced by elevated surface contrast and **14% opacity borders** (up from 8% in light mode).
- **Hatch Opacity**: Pattern fills (`--hatch-alpha`) increase from 18% in light mode to 24% in dark mode to maintain legibility against dark backgrounds.
- **Vibration Prevention**: Semantic saturated reds and greens are desaturated by ~20% and lightened by ~10% in dark mode to prevent visual vibration.

---

### 2.3 Typography & Font Hierarchy

The system employs four specialized font families loaded via Next.js Font Optimization:

1. **Display / Headlines (`--font-display`)**: `Montserrat`, sans-serif. Used for all `h1`-`h6` headers, modal titles, and section headlines.
2. **Body & Controls (`--font-sans`)**: `Inter`, sans-serif. Used for standard UI controls, tables, buttons, form inputs, and narrative body copy.
3. **Monospace & Financials (`--font-mono`)**: `JetBrains Mono`, monospace. Strictly enforced for all monetary figures, ledger codes, requisition IDs, candidate references, and timestamps (`tabular-nums`).
4. **Editorial Serif (`--font-serif`)**: `Merriweather`, serif. Reserved for legal terms, formal contractual clauses, and compliance attestations.

#### Typographic Scale
- **Display 1**: `36px` / `line-height: 1.15` / `font-bold` / `tracking-tight` (Hero dashboards)
- **Heading 1**: `24px` / `line-height: 1.25` / `font-bold` (Main page titles)
- **Heading 2**: `20px` / `line-height: 1.3` / `font-semibold` (Section panels, workspace cards)
- **Heading 3**: `16px` / `line-height: 1.4` / `font-semibold` (Sub-sections, modal headers)
- **Body Regular**: `14px` / `line-height: 1.5` / `font-normal` (Standard text, tables)
- **Body Small**: `12px` / `line-height: 1.4` / `font-medium` (Secondary labels, metadata)
- **Micro Caption**: `10px` or `11px` / `font-mono` / `uppercase` / `tracking-wider` (Status badges, column headers)

---

## 3. Application Shell & Chrome Budget

The OMS shell reduces legacy chrome height by **62% (from 280px down to 108px total)** to maximize usable viewport on typical corporate 1366×768 displays.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ [☰] DIEZ OMS               [ ⌘K Search (420px max) ]         [🔔] [◐] [Avatar]  │  52px Global Bar
├──────────────┬──────────────────────────────────────────────────────────────────┤
│              │ Breadcrumb / Page Title                  [Action 1] [Primary CTA]│  56px Sticky Page Bar
│ Sidebar      ├──────────────────────────────────────────────────────────────────┤
│ 240px exp.   │                                                                  │
│  56px col.   │                        WORKPLACE CANVAS                          │  Responsive Content
│              │                  (Fills all remaining height)                    │
└──────────────┴──────────────────────────────────────────────────────────────────┘
```

### 3.1 Global Bar (52px Fixed)
- Position: Fixed top, full width, 0.5px bottom border.
- Elements:
  - Sidebar Collapse Toggle (`32×32px`).
  - Brand Logo: Fixed height `28px`.
  - Centered Search: Fixed `420px` max width with `⌘K` keyboard shortcut chip.
  - Right Utility Group: Notification Bell (`32×32px`), Animated Theme Toggler (`32×32px`), User Avatar (`28×28px`).

### 3.2 Sticky Page Bar (56px Sticky)
- **Breadcrumb as Page Title**: The final crumb in the breadcrumb is styled as the authoritative page name. Eliminates redundant `48px` standalone headers.
- **Unified Action Alignment**: All page-level action buttons (Export, Filter, Create) live on the right side of this 56px bar, standardized to **36px control height**.
- **Removal of Marketing Subtitles**: Verbose explanatory subtitles are relegated to empty states or help popovers.

### 3.3 Sidebars & Portal Navigation Separation
The shell maintains two strictly separated sidebar configurations depending on the portal:

#### Internal OMS Sidebar (`/app/*`)
- Theme: Deep Slate / Indigo accents (`--sidebar`).
- Grouped IA:
  - **Overview**: Dashboard
  - **Workforce**: Requests & Requisitions, Candidate Pipeline, Approvals
  - **Budget**: Budget Control Center, Amendments, Line Items
  - **Management**: Organization Chart, Job Catalog, Vendor Directory, Compliance
  - **System**: Users & Permissions, Audit Trail

#### Vendor Portal Sidebar (`/vendor/*`)
- Theme: Clean Slate / DIEZ Teal branding (`--brand-teal`).
- Grouped IA:
  - **Dashboard**: Vendor Home (`/vendor`)
  - **Requirements**: Open Requirements (`/vendor/requisitions`)
  - **Candidates**: Submit Candidate (`/vendor/submissions`), Submission History (`/vendor/submissions/history`)
  - **Onboarding**: Active Onboarding Cases (`/vendor/onboarding`)
  - **Contracts & Rates**: Contracts (`/vendor/contracts`), Published Rate Cards (`/vendor/rates`)
  - **Compliance & Account**: Compliance Documents, Profile, Support

---

## 4. Financial & Numerical Design Standards (`lib/money.ts`)

Money in DIEZ OMS represents legally binding governmental and corporate commitments. It is governed by seven architectural rules:

1. **Integer Minor Units**: All monetary amounts are stored, transmitted, and calculated strictly as integer **fils** (`1 AED = 100 fils`).
2. **Zero Floating-Point Arithmetic**: Conversions, percentages, and allocations utilize `BigInt` arithmetic exclusively to eliminate binary float rounding errors.
3. **Always Two Decimal Places**: Amounts render as `"3,200,000.00"`—never trimmed to `"3,200,000"`.
4. **T2 Numeral Weight Contrast**:
   Large financial figures decompose into three visually distinct spans:
   ```
   AED   1,248,320   .00
    ↑        ↑        ↑
   12px   30px/600  30px/400
   muted  primary   muted
   ```
5. **Standardized Abbreviations**:
   Abbreviated forms (`AED 24.80M`, `AED 620.00K`) are restricted to KPI summary cards. Detailed tables and submission receipts always display full precision.
6. **Zero Rendering**: Zero always renders as `"0.00"` (or `"AED 0.00"`), never as a dash `"-"` or blank.
7. **Negative Numbers**: Render with a leading minus sign (`-AED 50,000.00`), never accounting parentheses.

---

## 5. Visual Techniques & Widget Architecture (T1 – T11)

### T1 — Unified KPI Surface
Multiple KPI metrics are consolidated into **one continuous card with four or five columns separated by 1px hairline dividers** (at 8% foreground opacity).
- Height: Standard `100px` (or `148px` with sparkline).
- Eliminates cluttered, multi-box visual noise.

### T2 — Display Amount (`<Amount variant="display">`)
Renders currency code in small muted text, the integer group in heavy font-semibold, and the cents group in light muted text for rapid magnitude scanning.

### T3 — Short Trend Charts
Chart plot areas are limited to **130px height** (total card `~215px`). Short, wide charts read as actionable trend indicators rather than dense analytical reports.

### T4 — 45° Diagonal Hatched Fills
Area fills in charts use SVG 45° diagonal hatching (1px lines, 6px spacing, 18% light / 24% dark opacity). Prevents overlapping areas from turning into muddy solid blocks.

```svg
<pattern id="hatch" width="6" height="6" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
  <line x1="0" y1="0" x2="0" y2="6" stroke="currentColor" stroke-width="1" opacity="0.18"/>
</pattern>
```

### T5 — Segmented Tick Progress Bars
Progress gauges are rendered as **20 discrete vertical ticks** (2px wide × 12px tall, 2px gap, 1px radius) with percentage left-aligned in muted parentheses:
```
(72%)  ▮▮▮▮▮▮▮▮▮▮▮▮▮▮▯▯▯▯▯▯
```

### T6 — Stacked Distribution Bar
Replaces pie charts and donut charts. A single 28px tall horizontal bar partitioned into proportional segments with 2px gaps.
- Labels and currency values are left-aligned above each segment boundary.
- Outer segments have a 6px border radius.
- Residual or available segments use the T4 diagonal hatch pattern.
- Percentages are left-aligned beneath segment start points.

### T7 — Inverse High-Contrast Tooltip
Chart tooltips render on an inverse dark surface (`--surface-inverse` or 92% foreground opacity) with an 8px border radius, values in `tabular-nums`, and timestamps placed last.

### T8 — Card Header Legend
Legends sit inline within the top-right of the 44px card header using 2×12px color bars. Never placed beneath the plot area.

### T9 — Floating Pill Table Rows
Table rows feature a 44px height. On hover or selection, the row highlights as an **inset floating pill** (8px border radius, inset 4px from table edges) with a subtle 3% background tint, dispensing with heavy horizontal border lines.

### T10 — Clean Card Headers
Card headers are standardized to 44px height with bold 14px titles on the left and contextual action buttons (`⋯`) revealed on hover. Subtitles and heavy bottom borders are omitted.

### T11 — Minimalist Chart Axes
- Y-Axis: Maximum of 4 round labels, 11px muted, no vertical axis line, no ticks.
- X-Axis: Maximum of 7 labels, 11px muted.
- Grid: Horizontal lines only at 4% foreground opacity; zero vertical gridlines.

---

## 6. Domain-Specific UX Patterns

### 6.1 The 4px Progress Rail (Lifecycle Stepper)
Replaces obstructive, full-height form wizards. Positioned directly beneath the sticky page bar spanning the canvas width:
- Height: `4px`, partitioned into discrete stages with 2px gaps.
- Active Stage: Saturated brand accent with an initial 2s shimmer animation on mount.
- Completed Stages: Solid brand accent.
- Future Stages: Foreground at 10% opacity.
- Hover / Focus: Expands into an interactive popover detailing reviewer names, SLAs, and approval dates.

### 6.2 Interview Slot-Chip Architecture (`TraySlotChip`)
Used identically in internal interview planning and the vendor interview response screen:
- **Card-Chip Container**: Rounded-lg border, shadow-2xs, selectable radio circle.
- **GST Time Formatting**: Date label (`Sat 12 Sep`) + 24-hour time range in Gulf Standard Time (`12:30 – 13:15 GST`).
- **Offshore Candidate Dual-Time**: Displays the candidate's local time below GST time (e.g. `14:00 – 14:45 IST`) to prevent anti-social scheduling.
- **Shared Offer / Collision Marker**: Amber badge alerting interviewers when a slot is simultaneously proposed to another candidate.
- **Calendar-Add Action**: One-click generation of `.ics` calendar files and direct Google Calendar launch.

### 6.3 Standardized Document Repository (`AttachmentList`)
Unified file upload and compliance management surface:
- Drag-and-drop zone with MIME-type filtering (`PDF`, `DOCX`, `PNG`).
- Real-time scanning animation states (`Scanning`, `Clean`, `Quarantined`).
- Expiry Tracking Engine:
  - Critical Red: Expired or `< 30 days` remaining.
  - Warning Amber: `< 90 days` remaining.
  - Normal Green: `> 90 days` remaining.

### 6.4 RFP Candidate Cost-Entry Modes
The vendor candidate submission workflow strictly enforces three pricing modes:
1. **Fixed**: Single money-masked entry in AED fils.
2. **Negotiable**: Grade selected from the vendor's own **Published Rate Card**; the monthly and annual figures resolve automatically from the rate card and cannot be hand-typed.
3. **Pre-Agreed**: Read-only rate pulled automatically from an executed master contract.

---

## 7. Security & Blind Boundary UX Enforcement

The design system directly implements compliance with DIEZ procurement regulations:

| Security Rule | Presentation Layer Enforcement | Implementation Reference |
| :--- | :--- | :--- |
| **Budget Concealment (Rule 1)** | Zero budget fields, reserved amounts, or approval ceilings are sent to or rendered in `/vendor/*`. | [`VendorRequisitionDetailWorkspace.tsx`](file:///Users/aait/Documents/Development/DIEZ-OMS/oms-prod-dev/components/oms/vendor-portal/VendorRequisitionDetailWorkspace.tsx) |
| **Blind Candidate Review (Rule 2)** | Candidate names, emails, and vendor identities are masked (`Candidate C-014`) during technical evaluations. | [`CandidateReviewWorkspace.tsx`](file:///Users/aait/Documents/Development/DIEZ-OMS/oms-prod-dev/components/oms/candidates/CandidateReviewWorkspace.tsx) |
| **Thin Rejection Boundary (Rule 3)** | Rejected vendor candidates receive solely the status code `NOT_SELECTED` (`"Not selected"`). Zero ratings, scores, or comments exist in the payload or DOM. | [`VendorSubmissionHistoryWorkspace.tsx`](file:///Users/aait/Documents/Development/DIEZ-OMS/oms-prod-dev/components/oms/vendor-portal/VendorSubmissionHistoryWorkspace.tsx) |
| **Interviewer Anonymity (Rule 4)** | Interviewers render exclusively as `"The hiring team for {Position}."` on vendor routes. No employee names or IDs exist in API payloads. | [`VendorInterviewResponseWorkspace.tsx`](file:///Users/aait/Documents/Development/DIEZ-OMS/oms-prod-dev/components/oms/vendor-portal/VendorInterviewResponseWorkspace.tsx) |
| **Batch Cap Enforcement (Rule 5)** | Enforces a strict 10-CV cap per requisition batch with a visible meter (`"7 of 10 CVs in this batch"`). | [`CandidateSubmissionForm.tsx`](file:///Users/aait/Documents/Development/DIEZ-OMS/oms-prod-dev/components/oms/vendor-portal/CandidateSubmissionForm.tsx) |

---

## 8. Component Registry

### 8.1 UI Primitives (`components/ui/`)
Built upon Radix UI primitives with Tailwind CSS v4 styling:
- **Layout & Structure**: `sidebar`, `resizable`, `scroll-area`, `separator`, `aspect-ratio`
- **Actions & Inputs**: `button`, `input`, `textarea`, `select`, `checkbox`, `switch`, `slider`, `radio-group`, `toggle`, `toggle-group`, `input-otp`
- **Overlays & Feedback**: `dialog`, `sheet`, `drawer`, `popover`, `tooltip`, `alert`, `alert-dialog`, `sonner`
- **Data Display**: `table`, `card`, `badge`, `avatar`, `breadcrumb`, `pagination`, `accordion`, `collapsible`, `tabs`
- **Data Visualization**: `chart` (Recharts integration with T4 hatch patterns and T7 tooltips)

### 8.2 Domain Modules (`components/oms/`)
High-level enterprise workflows built on the design system:
- **`approvals/`**: Multi-tier approval matrices, delegation selectors, audit timelines.
- **`budget/`**: Budget Control Center, variance trackers, allocation distributions, period governance.
- **`candidates/`**: Blind candidate dossiers, evaluation scorecards, ranking matrices.
- **`interviews/`**: Smart scheduling tray (`TraySlotChip`), calendar grid, collision detectors.
- **`vendor-portal/`**: Vendor dashboard KPI rows, open requirements catalog, 3-mode cost submission form, submission history table, interview response workspace.
- **`shared/`**: Unified `<Amount>` component, `<AttachmentList>` compliance uploader, 4px progress rails.

---

## 9. Accessibility & Browser Verification Standards

1. **Contrast Ratios (WCAG 2.1 AA / AAA)**:
   - Normal text: `≥ 4.5:1` against base and card surfaces.
   - Large text (`≥ 18px bold` or `≥ 24px`): `≥ 3:1`.
   - Meaningful graphics, icons, and borders: `≥ 3:1`.
   - Focus rings: Double-offset focus rings (`2px offset`, `2px thickness`, `outline-primary`) with minimum `3:1` contrast against adjacent surfaces.
2. **Never Color Alone**:
   - Availability dots are accompanied by iconography or text labels.
   - Candidate color bars always include the alphanumeric reference code.
   - Deadline urgency pairs color with textual warnings (`"Urgent: less than 24 hours remaining"`).
3. **Motion & Transitions**:
   - High-performance CSS transforms (`translate`, `scale`, `opacity`).
   - All animations strictly respect `@media (prefers-reduced-motion: reduce)` by disabling transforms and falling back to instant opacity switches.
4. **Responsive Breakpoints**:
   - Desktop Wide: `1440px+` (Full 2-column grids and expanded trays).
   - Standard Laptop: `1280px` – `1366px` (Default DIEZ corporate laptop profile).
   - Compact Desktop / Tablet Landscape: `1024px` (Sidebar collapsible to 56px, trays dock).
   - Tablet Portrait / Mobile: `768px` (Full drawer overlays, stacked single columns).
