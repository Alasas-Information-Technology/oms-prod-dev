# DIEZ-OMS Frontend Pages Catalog

Complete directory of all pages (`page.tsx`) across the OEMS frontend Next.js 16 application.

---

## 🌟 Recently Created Pages (Current Build Streams)

| Route Path | Description | Source File |
| :--- | :--- | :--- |
| `/vendor/onboarding/[onboardingId]/documents` | **Vendor Portal Candidate Documents & E-Signature**: 3-column workspace with location-driven document model, malware scan quarantine gating, rejection replace flow, e-signature panel with plain statuses, and tamper-evident audit receipt. | [`app/vendor/onboarding/[onboardingId]/documents/page.tsx`](file:///Users/aait/Documents/Development/DIEZ-OMS/oms-prod-dev/app/vendor/onboarding/%5BonboardingId%5D/documents/page.tsx) |
| `/app/dev/vendor-documents` | **Vendor Documents Dev Workbench**: Publicly accessible sandbox with an interactive 5-fixture switcher (`reference`, `offshore`, `scan-failed`, `rejected`, `deadline-critical`), read-only toggle, and vendor cookie injector. | [`app/app/dev/vendor-documents/page.tsx`](file:///Users/aait/Documents/Development/DIEZ-OMS/oms-prod-dev/app/app/dev/vendor-documents/page.tsx) |
| `/app/requests/[id]/amendments/[amendmentId]` | **Budget Amendment Workspace**: 3 funding routes (Budgeted, Unallocated, Unbudgeted), shortfall gating, money masking, reapproval route stepper, idempotency, and cancel flow. | [`app/app/requests/[id]/amendments/[amendmentId]/page.tsx`](file:///Users/aait/Documents/Development/DIEZ-OMS/oms-prod-dev/app/app/requests/%5Bid%5D/amendments/%5BamendmentId%5D/page.tsx) |
| `/app/requests/[id]/clarifications/[clarificationId]` | **Clarification Response Workspace**: Clarification details, file attachments (`AttachmentList`), response submission, and approval flow. | [`app/app/requests/[id]/clarifications/[clarificationId]/page.tsx`](file:///Users/aait/Documents/Development/DIEZ-OMS/oms-prod-dev/app/app/requests/%5Bid%5D/clarifications/%5BclarificationId%5D/page.tsx) |
| `/app/dev/clarifications` | **Clarifications Dev Workbench**: Interactive fixture switcher for full approval, more info, budget amend, and critical 2-day deadline states. | [`app/app/dev/clarifications/page.tsx`](file:///Users/aait/Documents/Development/DIEZ-OMS/oms-prod-dev/app/app/dev/clarifications/page.tsx) |
| `/app/candidates/interviews/plan/[requestId]` | **Interview Planning Workspace**: Smart AI suggestions, 4px progress rail, drag-and-drop calendar slots, collision detection, and candidate color tokens. | [`app/app/candidates/interviews/plan/[requestId]/page.tsx`](file:///Users/aait/Documents/Development/DIEZ-OMS/oms-prod-dev/app/app/candidates/interviews/plan/%5BrequestId%5D/page.tsx) |
| `/app/candidates/interviews/evaluate/[requestId]/[candidateRef]` | **Interview Evaluation Scorecard**: Candidate rating rubric, criteria grading, and feedback submission. | [`app/app/candidates/interviews/evaluate/[requestId]/[candidateRef]/page.tsx`](file:///Users/aait/Documents/Development/DIEZ-OMS/oms-prod-dev/app/app/candidates/interviews/evaluate/%5BrequestId%5D/%5BcandidateRef%5D/page.tsx) |
| `/app/dev/interview-planning` | **Interview Planning Dev Workbench**: Test scenarios for reference, offshore, disconnected, and empty calendar states. | [`app/app/dev/interview-planning/page.tsx`](file:///Users/aait/Documents/Development/DIEZ-OMS/oms-prod-dev/app/app/dev/interview-planning/page.tsx) |
| `/app/hr-review/[requestId]/send-back` | **HR Send-Back Flow**: Structured reason capture, impact review, and return routing for workforce requests. | [`app/app/hr-review/[requestId]/send-back/page.tsx`](file:///Users/aait/Documents/Development/DIEZ-OMS/oms-prod-dev/app/app/hr-review/%5BrequestId%5D/send-back/page.tsx) |
| `/app/dev/hr-send-back` | **HR Send-Back Dev Workbench**: Interactive preview for the HR return decision experience. | [`app/app/dev/hr-send-back/page.tsx`](file:///Users/aait/Documents/Development/DIEZ-OMS/oms-prod-dev/app/app/dev/hr-send-back/page.tsx) |

---

## 📂 Full Directory by Functional Domain

### 1. Vendor Portal (`/vendor/*`)
> **Access Rule**: Strictly isolated from internal routes via `proxy.ts`. Requires a valid JWT session with `userType: 'VENDOR'`.

| Route Path | Description | Source File |
| :--- | :--- | :--- |
| `/vendor/onboarding/[onboardingId]/documents` | Candidate onboarding documents upload, replacement, and e-signature workspace | [`app/vendor/onboarding/[onboardingId]/documents/page.tsx`](file:///Users/aait/Documents/Development/DIEZ-OMS/oms-prod-dev/app/vendor/onboarding/%5BonboardingId%5D/documents/page.tsx) |

---

### 2. Requests & Approvals (`/app/requests/*`, `/app/approvals/*`, `/app/hr-review/*`)

| Route Path | Description | Source File |
| :--- | :--- | :--- |
| `/app/requests` | All requisition requests directory | [`app/app/requests/page.tsx`](file:///Users/aait/Documents/Development/DIEZ-OMS/oms-prod-dev/app/app/requests/page.tsx) |
| `/app/requests/[id]` | Request detail view | [`app/app/requests/[id]/page.tsx`](file:///Users/aait/Documents/Development/DIEZ-OMS/oms-prod-dev/app/app/requests/%5Bid%5D/page.tsx) |
| `/app/requests/new` | Create new resource request | [`app/app/requests/new/page.tsx`](file:///Users/aait/Documents/Development/DIEZ-OMS/oms-prod-dev/app/app/requests/new/page.tsx) |
| `/app/requests/mine` | Current user's requests dashboard | [`app/app/requests/mine/page.tsx`](file:///Users/aait/Documents/Development/DIEZ-OMS/oms-prod-dev/app/app/requests/mine/page.tsx) |
| `/app/requests/mine/new` | Submit personal requisition request | [`app/app/requests/mine/new/page.tsx`](file:///Users/aait/Documents/Development/DIEZ-OMS/oms-prod-dev/app/app/requests/mine/new/page.tsx) |
| `/app/requests/[id]/amendments/[amendmentId]` | Budget amendment resolution workbench | [`app/app/requests/[id]/amendments/[amendmentId]/page.tsx`](file:///Users/aait/Documents/Development/DIEZ-OMS/oms-prod-dev/app/app/requests/%5Bid%5D/amendments/%5BamendmentId%5D/page.tsx) |
| `/app/requests/[id]/clarifications/[clarificationId]` | Request clarification flow & response | [`app/app/requests/[id]/clarifications/[clarificationId]/page.tsx`](file:///Users/aait/Documents/Development/DIEZ-OMS/oms-prod-dev/app/app/requests/%5Bid%5D/clarifications/%5BclarificationId%5D/page.tsx) |
| `/app/approvals` | Pending approvals queue | [`app/app/approvals/page.tsx`](file:///Users/aait/Documents/Development/DIEZ-OMS/oms-prod-dev/app/app/approvals/page.tsx) |
| `/app/approvals/[id]` | Approval decision action page | [`app/app/approvals/[id]/page.tsx`](file:///Users/aait/Documents/Development/DIEZ-OMS/oms-prod-dev/app/app/approvals/%5Bid%5D/page.tsx) |
| `/app/hr-review` | HR Review dashboard | [`app/app/hr-review/page.tsx`](file:///Users/aait/Documents/Development/DIEZ-OMS/oms-prod-dev/app/app/hr-review/page.tsx) |
| `/app/hr-review/[requestId]/send-back` | HR send-back action screen | [`app/app/hr-review/[requestId]/send-back/page.tsx`](file:///Users/aait/Documents/Development/DIEZ-OMS/oms-prod-dev/app/app/hr-review/%5BrequestId%5D/send-back/page.tsx) |

---

### 3. Candidates, Workforce & Onboarding (`/app/candidates/*`, `/app/workforce/*`)

| Route Path | Description | Source File |
| :--- | :--- | :--- |
| `/app/candidates` | Candidate pipeline and recruitment tracker | [`app/app/candidates/page.tsx`](file:///Users/aait/Documents/Development/DIEZ-OMS/oms-prod-dev/app/app/candidates/page.tsx) |
| `/app/candidates/interviews/plan/[requestId]` | Multi-candidate interview planner & slot coordination | [`app/app/candidates/interviews/plan/[requestId]/page.tsx`](file:///Users/aait/Documents/Development/DIEZ-OMS/oms-prod-dev/app/app/candidates/interviews/plan/%5BrequestId%5D/page.tsx) |
| `/app/candidates/interviews/evaluate/[requestId]/[candidateRef]` | Candidate interview evaluation scorecard | [`app/app/candidates/interviews/evaluate/[requestId]/[candidateRef]/page.tsx`](file:///Users/aait/Documents/Development/DIEZ-OMS/oms-prod-dev/app/app/candidates/interviews/evaluate/%5BrequestId%5D/%5BcandidateRef%5D/page.tsx) |
| `/app/workforce` | Workforce planning dashboard | [`app/app/workforce/page.tsx`](file:///Users/aait/Documents/Development/DIEZ-OMS/oms-prod-dev/app/app/workforce/page.tsx) |
| `/app/workforce/onboarding` | Internal onboarding tracker | [`app/app/workforce/onboarding/page.tsx`](file:///Users/aait/Documents/Development/DIEZ-OMS/oms-prod-dev/app/app/workforce/onboarding/page.tsx) |
| `/app/onboarding` | General onboarding overview | [`app/app/onboarding/page.tsx`](file:///Users/aait/Documents/Development/DIEZ-OMS/oms-prod-dev/app/app/onboarding/page.tsx) |

---

### 4. Budget & Financial Operations (`/app/budget/*`)

| Route Path | Description | Source File |
| :--- | :--- | :--- |
| `/app/budget` | Budget operations hub | [`app/app/budget/page.tsx`](file:///Users/aait/Documents/Development/DIEZ-OMS/oms-prod-dev/app/app/budget/page.tsx) |
| `/app/budget/dashboard` | Budget analytics and fund allocation dashboard | [`app/app/budget/dashboard/page.tsx`](file:///Users/aait/Documents/Development/DIEZ-OMS/oms-prod-dev/app/app/budget/dashboard/page.tsx) |
| `/app/budget/dept-budget` | Departmental budget line allocation | [`app/app/budget/dept-budget/page.tsx`](file:///Users/aait/Documents/Development/DIEZ-OMS/oms-prod-dev/app/app/budget/dept-budget/page.tsx) |
| `/app/budget/primitives-demo` | Financial inputs and currency masking primitives demo | [`app/app/budget/primitives-demo/page.tsx`](file:///Users/aait/Documents/Development/DIEZ-OMS/oms-prod-dev/app/app/budget/primitives-demo/page.tsx) |

---

### 5. Administration, Security & Master Data (`/app/administration/*`)

| Route Path | Description | Source File |
| :--- | :--- | :--- |
| `/app/administration/security-dashboard` | Security Operations Center (SOC) & authentication metrics | [`app/app/administration/security-dashboard/page.tsx`](file:///Users/aait/Documents/Development/DIEZ-OMS/oms-prod-dev/app/app/administration/security-dashboard/page.tsx) |
| `/app/administration/security/settings` | Security policies and authentication configuration | [`app/app/administration/security/settings/page.tsx`](file:///Users/aait/Documents/Development/DIEZ-OMS/oms-prod-dev/app/app/administration/security/settings/page.tsx) |
| `/app/administration/settings` | General platform configuration | [`app/app/administration/settings/page.tsx`](file:///Users/aait/Documents/Development/DIEZ-OMS/oms-prod-dev/app/app/administration/settings/page.tsx) |
| `/app/administration/roles` | Role-based access control (RBAC) permission definitions | [`app/app/administration/roles/page.tsx`](file:///Users/aait/Documents/Development/DIEZ-OMS/oms-prod-dev/app/app/administration/roles/page.tsx) |
| `/app/administration/users` | User management directory | [`app/app/administration/users/page.tsx`](file:///Users/aait/Documents/Development/DIEZ-OMS/oms-prod-dev/app/app/administration/users/page.tsx) |
| `/app/administration/users/new` | Create new system user | [`app/app/administration/users/new/page.tsx`](file:///Users/aait/Documents/Development/DIEZ-OMS/oms-prod-dev/app/app/administration/users/new/page.tsx) |
| `/app/administration/users/[id]` | User profile & permission inspector | [`app/app/administration/users/[id]/page.tsx`](file:///Users/aait/Documents/Development/DIEZ-OMS/oms-prod-dev/app/app/administration/users/%5Bid%5D/page.tsx) |
| `/app/administration/users/import` | Bulk user CSV import | [`app/app/administration/users/import/page.tsx`](file:///Users/aait/Documents/Development/DIEZ-OMS/oms-prod-dev/app/app/administration/users/import/page.tsx) |
| `/app/administration/users/vendors` | Vendor coordinator user management | [`app/app/administration/users/vendors/page.tsx`](file:///Users/aait/Documents/Development/DIEZ-OMS/oms-prod-dev/app/app/administration/users/vendors/page.tsx) |
| `/app/administration/users/primitives-demo` | User picker primitives demonstration | [`app/app/administration/users/primitives-demo/page.tsx`](file:///Users/aait/Documents/Development/DIEZ-OMS/oms-prod-dev/app/app/administration/users/primitives-demo/page.tsx) |
| `/app/administration/master-data/organization` | Organization units hierarchy tree | [`app/app/administration/master-data/organization/page.tsx`](file:///Users/aait/Documents/Development/DIEZ-OMS/oms-prod-dev/app/app/administration/master-data/organization/page.tsx) |
| `/app/administration/master-data/organization/[id]` | Org unit detail view | [`app/app/administration/master-data/organization/[id]/page.tsx`](file:///Users/aait/Documents/Development/DIEZ-OMS/oms-prod-dev/app/app/administration/master-data/organization/%5Bid%5D/page.tsx) |
| `/app/administration/master-data/departments` | Department master catalog | [`app/app/administration/master-data/departments/page.tsx`](file:///Users/aait/Documents/Development/DIEZ-OMS/oms-prod-dev/app/app/administration/master-data/departments/page.tsx) |
| `/app/administration/master-data/sections` | Section master catalog | [`app/app/administration/master-data/sections/page.tsx`](file:///Users/aait/Documents/Development/DIEZ-OMS/oms-prod-dev/app/app/administration/master-data/sections/page.tsx) |
| `/app/administration/master-data/business-units` | Business units catalog | [`app/app/administration/master-data/business-units/page.tsx`](file:///Users/aait/Documents/Development/DIEZ-OMS/oms-prod-dev/app/app/administration/master-data/business-units/page.tsx) |
| `/app/administration/master-data/breadcrumb-demo` | Dynamic hierarchical breadcrumb demo | [`app/app/administration/master-data/breadcrumb-demo/page.tsx`](file:///Users/aait/Documents/Development/DIEZ-OMS/oms-prod-dev/app/app/administration/master-data/breadcrumb-demo/page.tsx) |
| `/app/administration/master-data/org-primitives-demo` | Org unit picker component showcase | [`app/app/administration/master-data/org-primitives-demo/page.tsx`](file:///Users/aait/Documents/Development/DIEZ-OMS/oms-prod-dev/app/app/administration/master-data/org-primitives-demo/page.tsx) |

---

### 6. Procurement, Vendors & Reporting

| Route Path | Description | Source File |
| :--- | :--- | :--- |
| `/app/vendors` | External suppliers & vendors directory | [`app/app/vendors/page.tsx`](file:///Users/aait/Documents/Development/DIEZ-OMS/oms-prod-dev/app/app/vendors/page.tsx) |
| `/app/procurement` | Procurement tracking operations | [`app/app/procurement/page.tsx`](file:///Users/aait/Documents/Development/DIEZ-OMS/oms-prod-dev/app/app/procurement/page.tsx) |
| `/app/reports` | Analytics & executive reporting | [`app/app/reports/page.tsx`](file:///Users/aait/Documents/Development/DIEZ-OMS/oms-prod-dev/app/app/reports/page.tsx) |
| `/app/dashboard` | Main internal portal dashboard | [`app/app/dashboard/page.tsx`](file:///Users/aait/Documents/Development/DIEZ-OMS/oms-prod-dev/app/app/dashboard/page.tsx) |
| `/app/profile` | Current user profile & preferences | [`app/app/profile/page.tsx`](file:///Users/aait/Documents/Development/DIEZ-OMS/oms-prod-dev/app/app/profile/page.tsx) |
| `/app` | Internal portal entry redirector | [`app/app/page.tsx`](file:///Users/aait/Documents/Development/DIEZ-OMS/oms-prod-dev/app/app/page.tsx) |

---

### 7. Dev Sandboxes & Design System Workbenches (`/app/dev/*`, `/design-system`)
> **Access Rule**: Publicly bypassed in `proxy.ts`. No authentication required for immediate local testing.

| Route Path | Description | Source File |
| :--- | :--- | :--- |
| `/app/dev/vendor-documents` | Vendor Documents interactive fixture switcher sandbox | [`app/app/dev/vendor-documents/page.tsx`](file:///Users/aait/Documents/Development/DIEZ-OMS/oms-prod-dev/app/app/dev/vendor-documents/page.tsx) |
| `/app/dev/clarifications` | Clarification response scenario switcher | [`app/app/dev/clarifications/page.tsx`](file:///Users/aait/Documents/Development/DIEZ-OMS/oms-prod-dev/app/app/dev/clarifications/page.tsx) |
| `/app/dev/interview-planning` | Multi-candidate calendar planner sandbox | [`app/app/dev/interview-planning/page.tsx`](file:///Users/aait/Documents/Development/DIEZ-OMS/oms-prod-dev/app/app/dev/interview-planning/page.tsx) |
| `/app/dev/interview-tokens` | Candidate tint tokens & color palette preview | [`app/app/dev/interview-tokens/page.tsx`](file:///Users/aait/Documents/Development/DIEZ-OMS/oms-prod-dev/app/app/dev/interview-tokens/page.tsx) |
| `/app/dev/hr-send-back` | HR send-back review sandbox | [`app/app/dev/hr-send-back/page.tsx`](file:///Users/aait/Documents/Development/DIEZ-OMS/oms-prod-dev/app/app/dev/hr-send-back/page.tsx) |
| `/app/dev/kpi-tiles` | Metric KPI tiles component showcase | [`app/app/dev/kpi-tiles/page.tsx`](file:///Users/aait/Documents/Development/DIEZ-OMS/oms-prod-dev/app/app/dev/kpi-tiles/page.tsx) |
| `/app/dev/chart-tokens` | Chart color schemes & Recharts token preview | [`app/app/dev/chart-tokens/page.tsx`](file:///Users/aait/Documents/Development/DIEZ-OMS/oms-prod-dev/app/app/dev/chart-tokens/page.tsx) |
| `/app/dev/band-b` | Band-B workflow state preview | [`app/app/dev/band-b/page.tsx`](file:///Users/aait/Documents/Development/DIEZ-OMS/oms-prod-dev/app/app/dev/band-b/page.tsx) |
| `/app/dev/visual-language` | Typography, surfaces, and shadow tokens | [`app/app/dev/visual-language/page.tsx`](file:///Users/aait/Documents/Development/DIEZ-OMS/oms-prod-dev/app/app/dev/visual-language/page.tsx) |
| `/design-system` | Global shadcn/ui and custom OEMS component catalog | [`app/design-system/page.tsx`](file:///Users/aait/Documents/Development/DIEZ-OMS/oms-prod-dev/app/design-system/page.tsx) |

---

### 8. Public Authentication & System Entry

| Route Path | Description | Source File |
| :--- | :--- | :--- |
| `/login` | Enterprise login screen with device fingerprinting | [`app/login/page.tsx`](file:///Users/aait/Documents/Development/DIEZ-OMS/oms-prod-dev/app/login/page.tsx) |
| `/register` | User registration screen | [`app/register/page.tsx`](file:///Users/aait/Documents/Development/DIEZ-OMS/oms-prod-dev/app/register/page.tsx) |
| `/` | Application root entry redirector | [`app/page.tsx`](file:///Users/aait/Documents/Development/DIEZ-OMS/oms-prod-dev/app/page.tsx) |
| `/users` | Legacy users directory | [`app/users/page.tsx`](file:///Users/aait/Documents/Development/DIEZ-OMS/oms-prod-dev/app/users/page.tsx) |
| `/users/[id]` | Legacy user detail view | [`app/users/[id]/page.tsx`](file:///Users/aait/Documents/Development/DIEZ-OMS/oms-prod-dev/app/users/[id]/page.tsx) |
| `/users/new` | Legacy create user screen | [`app/users/new/page.tsx`](file:///Users/aait/Documents/Development/DIEZ-OMS/oms-prod-dev/app/users/new/page.tsx) |
| `/users/vendors` | Legacy vendor users list | [`app/users/vendors/page.tsx`](file:///Users/aait/Documents/Development/DIEZ-OMS/oms-prod-dev/app/users/vendors/page.tsx) |
| `/users-demo` | User component demonstration | [`app/users-demo/page.tsx`](file:///Users/aait/Documents/Development/DIEZ-OMS/oms-prod-dev/app/users-demo/page.tsx) |
