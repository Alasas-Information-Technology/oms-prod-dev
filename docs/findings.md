# Domain 2 — Organization Structure UI Audit Findings

**Reference Documents:**
- [`docs/DOMAIN-2-ORGANIZATION-UI.md`](file:///Users/aait/Documents/Development/DIEZ-OMS/oms-prod-dev/docs/DOMAIN-2-ORGANIZATION-UI.md)
- [`CLAUDE.md`](file:///Users/aait/Documents/Development/DIEZ-OMS/oms-prod-dev/CLAUDE.md)

**Scope:** `oms-prod-dev` (Next.js 16 Presentation Layer & BFF)  
**Date:** August 21, 2026

---

## 1. Inventory of Organization Files

| File Path | Description |
| :--- | :--- |
| **`app/app/administration/master-data/organization/page.tsx`** | Main 2-pane organization explorer with Tree view, Cards directory, level KPI filters, and unit inspector panel. |
| **`app/app/administration/master-data/organization/[id]/page.tsx`** | Full unit detail screen with four tabs: Overview, Children (Sub-units), People (Managers), and Change History. |
| **`app/app/administration/master-data/business-units/page.tsx`** | Flat list `DataTable` screen for Level 2 Business Units with filtering, export, and create modal. |
| **`app/app/administration/master-data/departments/page.tsx`** | Flat list `DataTable` screen for Level 3 Departments (budget owners) with cost center codes. |
| **`app/app/administration/master-data/sections/page.tsx`** | Flat list `DataTable` screen for Level 4 Operational Sections. |
| **`components/organization/OrgTree.tsx`** | Lazy-loading recursive hierarchical tree component with 1-click sub-unit creation and action menus. |
| **`components/organization/OrgUnitForm.tsx`** | Dynamic, layman-friendly RHF + Zod form with auto-code generation and progressive disclosure. |
| **`components/organization/OrgUnitPicker.tsx`** | Combobox popover selector for searching and picking units in forms and dialogs. |
| **`components/organization/MoveUnitDialog.tsx`** | Confirmation dialog for subtree reparenting requiring explicit unit code confirmation. |
| **`components/organization/DeleteUnitDialog.tsx`** | Destructive confirmation dialog for unit deletion requiring unit code confirmation. |
| **`components/organization/ManagerAssignmentPanel.tsx`** | Leadership management panel rendering current primary head, assignment dialogs, and temporal timeline. |
| **`hooks/useOrganization.ts`** | React Query hooks wrapping all Domain 2 BFF proxy endpoints with ancestor/tree cache invalidation. |
| **`lib/api/organization.ts`** | Client API proxy caller functions communicating with Next.js BFF route handlers. |
| **`lib/types/organization.types.ts`** | TypeScript interfaces, DTOs, enums, and `ORG_PERMISSIONS` constants matching Section 8.5 specs. |
| **`app/api/organization/**` (20 route handlers)** | BFF proxy route handlers forwarding client requests to `oms-backend` (NestJS). |

---

## 2. Evaluation of the Seven "Hard Problems" (Part 2)

### 2.1 Scoped Users See an Orphaned Fragment
* **Status:** 🔴 **IGNORED**
* **Evidence:** [`components/organization/OrgTree.tsx:310-348`](file:///Users/aait/Documents/Development/DIEZ-OMS/oms-prod-dev/components/organization/OrgTree.tsx#L310-L348)
* **Finding:** `OrgTree` hardcodes an initial query for roots at `depth: 0` (`useOrgUnits({ depth: 0, ... })`). When a user is scoped to a single Department (depth 2), `depth: 0` returns empty. The tree displays `"No root organization units found."` rather than rendering the visible scoped units as top-level entries under a `"Your departments"` header with an explanation note.

---

### 2.2 Move is the Dangerous Operation
* **Status:** 🟡 **PARTIALLY HANDLES IT**
* **Evidence:** [`components/organization/MoveUnitDialog.tsx:57-64, 85-89, 112-120`](file:///Users/aait/Documents/Development/DIEZ-OMS/oms-prod-dev/components/organization/MoveUnitDialog.tsx#L57-L89)
* **Finding:**
  * ✅ Explicit dialog action (no drag-and-drop as primary).
  * ✅ Shows affected descendant count (`descendantCount`).
  * ✅ Requires typing the exact unit code to enable confirmation.
  * ✅ Waits for server response (no optimistic UI).
  * ❌ Missing visual comparison: Does not show clear `Current Parent → New Parent` preview.
  * ❌ Missing descendant list preview: Does not show the first 5 affected child units.
  * ❌ Missing specific `ORG_MOVE_BLOCKED_BUDGET` error handling: Falls back to a generic toast rather than displaying blocking budget commitments with links.
  * ❌ Missing long-running move progress state (>5s notification).

---

### 2.3 Managers are Temporal, Not a Single Value
* **Status:** 🟡 **PARTIALLY HANDLES IT**
* **Evidence:** [`components/organization/ManagerAssignmentPanel.tsx:68-117, 153-180`](file:///Users/aait/Documents/Development/DIEZ-OMS/oms-prod-dev/components/organization/ManagerAssignmentPanel.tsx#L68-L180)
* **Finding:**
  * ✅ Uses `Timeline` (`components/oms/Timeline`) to display temporal tenures.
  * ✅ Distinguishes `HEAD`, `DEPUTY`, and `ACTING` roles.
  * ❌ Missing auto-end warning: Assigning a new primary head auto-ends the previous one in the database, but the UI dialog does **not** show a pre-confirmation warning explicitly naming who will be ended and on what date.
  * ❌ Missing inline `ORG_MANAGER_PERIOD_OVERLAP` validation on date fields.
  * ❌ User selection uses a raw text input (`userId` GUID) instead of an internal staff search combobox that filters out vendor users at query time.

---

### 2.4 Tree at 5,000 Nodes
* **Status:** 🟡 **PARTIALLY HANDLES IT**
* **Evidence:** [`components/organization/OrgTree.tsx:64-75, 230-260`](file:///Users/aait/Documents/Development/DIEZ-OMS/oms-prod-dev/components/organization/OrgTree.tsx#L64-L260)
* **Finding:**
  * ✅ **Lazy-load:** Supported via `useOrgUnitChildren(unit.orgUnitId, { enabled: isOpen })`.
  * ❌ **Virtualisation:** Missing (renders unbounded recursive DOM elements).
  * ❌ **Persistence:** Missing (expansion state is stored in component local state and lost on page navigation).
  * ❌ **Deep-linking:** Missing (`?node=<id>` is not parsed; ancestor path is not auto-expanded via `/units/:id/ancestors`).
  * ❌ **Server-side Search with Ancestor Path:** Missing in tree (search in `organization/page.tsx` is a flat client-side filter over preloaded cards).

---

### 2.5 Bilingual, Mixed Direction
* **Status:** 🟡 **PARTIALLY HANDLES IT**
* **Evidence:** [`components/organization/OrgTree.tsx:161`](file:///Users/aait/Documents/Development/DIEZ-OMS/oms-prod-dev/components/organization/OrgTree.tsx#L161), [`departments/page.tsx:102`](file:///Users/aait/Documents/Development/DIEZ-OMS/oms-prod-dev/app/app/administration/master-data/departments/page.tsx#L102), [`organization/[id]/page.tsx:187`](file:///Users/aait/Documents/Development/DIEZ-OMS/oms-prod-dev/app/app/administration/master-data/organization/[id]/page.tsx#L187)
* **Finding:**
  * ✅ `dir="rtl"` is correctly applied to individual Arabic text elements (`<p>`, `<span>`, `<Input>`) and is **never** applied to whole rows or table containers.
  * ❌ Missing `lang="ar"` attribute on all Arabic text nodes.

---

### 2.6 Permission-Driven Affordances
* **Status:** 🟢 **HANDLED**
* **Evidence:** [`components/organization/OrgTree.tsx:173, 203, 212, 222`](file:///Users/aait/Documents/Development/DIEZ-OMS/oms-prod-dev/components/organization/OrgTree.tsx#L173-L222), [`organization/page.tsx:143, 159`](file:///Users/aait/Documents/Development/DIEZ-OMS/oms-prod-dev/app/app/administration/master-data/organization/page.tsx#L143-L159), [`organization/[id]/page.tsx:106, 126, 219, 245`](file:///Users/aait/Documents/Development/DIEZ-OMS/oms-prod-dev/app/app/administration/master-data/organization/[id]/page.tsx#L106-L245)
* **Finding:**
  * ✅ 100% of UI action gates use `can(ORG_PERMISSIONS.*)`.
  * ✅ Zero occurrences of role-name checks (`role === ...`).
  * ✅ Actions the user cannot perform are hidden from view.

---

### 2.7 The States Nobody Builds
* **Status:** 🟡 **PARTIALLY HANDLES IT**
* **Evidence:** [`components/organization/OrgTree.tsx:339-348`](file:///Users/aait/Documents/Development/DIEZ-OMS/oms-prod-dev/components/organization/OrgTree.tsx#L339-L348), [`organization/[id]/page.tsx:270-292, 442-446`](file:///Users/aait/Documents/Development/DIEZ-OMS/oms-prod-dev/app/app/administration/master-data/organization/[id]/page.tsx#L270-L446), [`ManagerAssignmentPanel.tsx:251-261`](file:///Users/aait/Documents/Development/DIEZ-OMS/oms-prod-dev/components/organization/ManagerAssignmentPanel.tsx#L251-L261)
* **Finding:**
  * ❌ Loading states rely on centered `Loader2` spinners rather than indented skeleton trees, skeleton timelines, or skeleton definition lists.
  * ❌ Empty states use plain muted text rather than designed invitation states with contextual create actions.
  * ❌ Error states lack retry triggers.
  * ❌ Scope denial in `organization/[id]/page.tsx` renders an inline alert box rather than a genuine 404 Not Found page.

---

## 3. Component Inventory & Missing Primitives

### Currently Used Components
* **`components/oms/`**:
  * `DataTable` — Flat lists (`business-units`, `departments`, `sections`) and Sub-units tab.
  * `StatusBadge` — Status badges across all 5 screens, tree nodes, and dialogs.
  * `Timeline` — Temporal tenure display in `ManagerAssignmentPanel`.
* **`components/ui/` (shadcn primitives)**:
  * `Button`, `Input`, `Textarea`, `Label`, `Select`, `Dialog`, `Badge`, `Card`, `Tabs`, `Checkbox`, `Alert`, `DropdownMenu`, `Popover`, `Command`, `ScrollArea`, `Skeleton`.

### Expected Components Missing from `components/oms/org/` (Per Section 1.3 & Part 4)
1. ❌ **`OrgTypeSigil.tsx`** — Fixed-width monospace type indicator (`ORG`, `BU`, `DEP`, `SEC`) with column alignment and accessible labels (currently uses pill badges).
2. ❌ **`HierarchySpine.tsx`** — Presentation-only component rendering vertical lineage rules with last-child elbow handling across Tree, Picker, and Dialogs.
3. ❌ **`OrgBreadcrumb.tsx`** — Clickable multi-level breadcrumb with middle-truncation for deep hierarchies.
4. ❌ **`UnitPath.tsx`** — Reusable inline ancestor path component for flat list secondary text and picker items.
5. ❌ **Upgraded `OrgUnitPicker.tsx`** (`components/oms/org/`) — Reusable picker supporting `requiresBudgetCapability`, `rootId`, `allowedTypes`, debounce, and returning full unit entities.

---

## 4. Tree Component Specific Audit (`components/organization/OrgTree.tsx`)

| Capability | Status | Implementation Details |
| :--- | :---: | :--- |
| **Lazy-Loading** | **YES** | Lines 69–72: Child units fetched dynamically via `useOrgUnitChildren(unit.orgUnitId, { enabled: isOpen })`. |
| **Virtualisation** | **NO** | Recursively renders standard DOM `div` elements. No virtual windowing (`react-virtual` / `@tanstack/react-virtual`). |
| **Expansion Persistence** | **NO** | Stores state in component-level `useState`. State is wiped when navigating to unit detail and returning. |
| **Deep-Linking (`?node=<id>`)** | **NO** | Query parameter is ignored; does not call `/units/:id/ancestors` to expand path or scroll into view. |

---

## 5. Permission Gating Audit
* **Audit Result:** **100% COMPLIANT**.
* **Zero instances** of role names (`role === ...`, `roles.includes(...)`, `isSuperAdmin`, etc.).
* All gates check `can(ORG_PERMISSIONS.XXX)` via `usePermission()`.

---

## 6. Bilingual & RTL Audit
* **Audit Result:** **Isolated correctly to text nodes.**
* `dir="rtl"` is applied strictly to `<p>`, `<span>`, and `<Input>` text elements; it is **never** applied to rows, tables, or layout wrappers.
* **Deficiency Identified:** The `lang="ar"` attribute is missing across all Arabic text nodes.

---

## 7. Loading, Empty, Error, and Denied States Audit

| Surface | Loading State | Empty State | Error State | Denied / Scope State |
| :--- | :--- | :--- | :--- | :--- |
| **Tree Explorer** | ❌ Bare centered spinner | ❌ Plain text `"No root organization units found."` | ❌ No retry action | ❌ Fails on department-scoped users |
| **Unit Detail (Main)** | ❌ Bare centered spinner | — | ❌ No retry action | ❌ Inline alert instead of 404 |
| **Sub-units Tab** | ⚠️ Skeleton table | ❌ Plain text `"No child units"` | ❌ No retry action | — |
| **People (Managers) Tab** | ❌ Bare centered spinner | ❌ Plain text `"No manager assignments found."` | ❌ No retry action | ✅ Gated with `can()` |
| **Move Dialog** | ✅ Spinner on confirm button | — | ❌ Generic toast error | — |

---

# Actionable Remediation Checklist (Ordered by User Impact)

### Phase 1: Critical User Impact (Integrity & Data Safety)
- [ ] **Fix Scoped User Fragment (Problem 2.1)**: Update `OrgTree.tsx` to detect when root is missing and render visible scoped units under a `"Your departments"` header with a scope note.
- [ ] **Enhance MoveUnitDialog (Problem 2.2)**:
  - Add visual `Current Parent → New Parent` comparison card.
  - Display the first 5 affected child units in a preview list.
  - Map `ORG_MOVE_BLOCKED_BUDGET` to inline callouts with links to blocking commitments.
  - Add long-running progress notification for moves >5s.
- [ ] **Enhance ManagerAssignmentPanel (Problem 2.3)**:
  - Add pre-confirmation dialog warning that assigning a new primary head auto-ends the previous head on $T - 1$.
  - Replace raw `userId` text input with an internal employee searchable combobox that excludes vendor users at query level.
  - Display inline field error on `ORG_MANAGER_PERIOD_OVERLAP`.

### Phase 2: Architecture & Scalability (Tree at 5,000 Nodes & Primitives)
- [ ] **Build Shared Org Primitives (`components/oms/org/`)**:
  - `OrgTypeSigil.tsx` (fixed-width monospace sigil: `ORG`, `BU`, `DEP`, `SEC`).
  - `HierarchySpine.tsx` (structural vertical depth rules with elbow lines).
  - `OrgBreadcrumb.tsx` (clickable multi-level breadcrumb with middle truncation).
  - `UnitPath.tsx` (inline ancestor path secondary text).
- [ ] **Upgrade `OrgTree.tsx` (Problem 2.4)**:
  - Add `sessionStorage` persistence for user expansion state.
  - Add `?node=<id>` deep-link support with `/units/:id/ancestors` auto-expansion and scroll-into-view.
  - Add list virtualisation (`@tanstack/react-virtual`) when expanded rows exceed 200.
  - Add server-side tree search rendering matches with their `UnitPath`.
- [ ] **Upgrade `OrgUnitPicker.tsx` (Part 3.4)**:
  - Add contracts for `requiresBudgetCapability`, `rootId`, and `allowedTypes`.
  - Integrate `UnitPath` on every option.

### Phase 3: UI Polish, A11y & State Handling
- [ ] **Refine Loading, Empty & Error States (Problem 2.7)**:
  - Replace bare spinners in Tree and Detail views with indented skeleton lines.
  - Add invitation empty states with contextual `+ Add` actions.
  - Render genuine 404 page on scope-denied unit IDs.
- [ ] **Accessibility & RTL Polish (Problem 2.5 & A11y)**:
  - Add `lang="ar"` alongside all `dir="rtl"` text nodes.
  - Complete full WAI-ARIA treeview keyboard navigation (Arrow keys, Enter, Home/End).
