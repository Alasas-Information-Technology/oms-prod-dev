# CLAUDE.md — oms-prod-dev

Next.js frontend for the DIEZ Outsource Management System (OMS).

**This repo is a presentation layer and BFF. It does not own data.**
All business logic, SQL, token issuance, and authorization decisions belong
to `oms-backend` (NestJS).

---

## Project Context

| Item | Value |
| :--- | :--- |
| Client | Dubai Integrated Economic Zones (DIEZ) |
| Framework | Next.js 16 (App Router) |
| Runtime | React 19 |
| Language | TypeScript 5 |
| UI | shadcn/ui + Radix + Tailwind CSS 4 |
| Charts | Recharts 3.8 |
| Forms | React Hook Form + Zod |
| Animation | Framer Motion 12 |
| Package manager | pnpm 10 |
| Companion repo | `oms-backend` (NestJS) — owns the database |

---

## Migration In Progress — Read This First

This repo currently contains a full server-side data layer that **is being
removed**: `lib/services/`, `lib/repositories/`, `lib/use-cases/`, and
`lib/db.ts`. These duplicate services that exist (or will exist) in NestJS.

See `MIGRATION.md` for the ordered plan.

### Rules during migration

- **Never add** a new `mssql` import, repository, or direct database query.
- **Never add** a new use case or service that queries the database.
- When touching an existing route handler, prefer converting it to a proxy
  call against `BACKEND_BASE_URL` over extending its DB logic.
- New features call NestJS. No exceptions.

### Target end state

```
Browser → Next.js (cookies, SSR, UI) → NestJS (auth, logic, SQL) → SQL Server
```

Next.js keeps: HttpOnly cookie handling, SSR/RSC, route handlers that proxy,
and all UI.

Next.js loses: JWT verification, session lookups, RBAC resolution, device
fingerprint validation, and every database call.

---

## Auth Model

- Access + refresh token pair, delivered as **HttpOnly, Secure,
  SameSite=Strict** cookies. Cookie name: `oms_access_token`.
- The browser never reads the raw JWT.
- Cookie *handling* stays here. Token *minting and validation* moves to
  NestJS.
- Middleware's job (post-migration) is: read cookie → attach as bearer →
  forward. Nothing more.

### Portal isolation

Internal users and vendor users are strictly separated:

- `/app/*` and `/api/internal/*` → INTERNAL users only
- `/vendor/*` and `/api/vendor/*` → VENDOR users only

Cross-portal access must always be rejected.

---

## UI Authorization

Gate on **permission**, never on role.

```ts
can("REQUISITION.CREATE")   // correct
role === "HR"               // wrong
```

Roles determine permissions. Permissions determine UI behaviour. Server-side
enforcement is authoritative — UI gating is a usability affordance, never a
security control.

### Blind candidate review

The requesting department must not see vendor identity or vendor quotations
during candidate review. They *may* see cost, special terms, and lead time.
HOD unmasking is conditional and happens only during bypass-interview
approval. Never render masked fields into the DOM and hide them with CSS —
masked data must not reach the client.

---

## Route Structure

Public: `/`, `/login`, `/register`, `/forgot-password`, `/reset-password`,
`/access-denied`, `/maintenance`

Internal portal, base `/app`:

| Area | Base route |
| :--- | :--- |
| Workspace / profile | `/app`, `/app/profile` |
| Requisitions | `/app/requisitions` |
| Candidates | `/app/candidates` |
| Workforce | `/app/workforce` |
| Budget | `/app/budget` |
| Vendors | `/app/vendors` |
| Leave | `/app/leave` |
| Reports | `/app/reports` |
| Administration | `/app/administration` |

Vendor portal, base `/vendor` — separate layout, separate navigation.

Full route inventory: `Enterprise_Outsource_Management_System__OMS_-UI-navigation-Info-Arch-1_01.pdf`.

---

## Component Conventions

- Reuse from `components/oms/` before writing new: `DataTable`,
  `SimpleKpiCard`, `BudgetKpiCard`, `StatusBadge`, `Timeline`,
  `ApprovalWorkflow`, `MultiSelect`, `DatePickerField`, and the budget
  chart set.
- UI primitives are shadcn/ui in `components/ui/`. Extend rather than fork.
- Layout shell: `AppSidebar`, `AppTopbar`, `AppBreadcrumb`,
  `AccountDropdown`, `NotificationDropdown`.
- Sidebar visibility is driven entirely by RBAC.
- Forms use React Hook Form + Zod. Validate client-side for UX; the server
  validates authoritatively.
- Dark/light theme via `next-themes` — respect both in new components.

---

## Do Not

- Import `mssql` or query the database
- Add a new repository, service, or use case with DB access
- Store business logic in the browser
- Expose secrets in client code
- Store the raw JWT anywhere the browser can read it
- Gate UI on role name instead of permission
- Send masked data to the client and hide it with CSS
