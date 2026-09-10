# DIEZ OMS — Seeded Users & Credentials Reference

> **DEMO ENVIRONMENT ONLY**
> All canonical demo users share the password: `Demo@2026!`
> Login URL: `http://localhost:3000/login`
> You can sign in using **either** the **Username** or the **Email Address**.

---

## 1. Quick Reference — All 16 Canonical Demo Users

| # | Name | Username | Email Address | Password | Role | User Type | Portal Target | Org Scope / Department |
|---|---|---|---|---|---|---|---|---|
| 1 | **Mariam Al Mansoori** | `mariam.almansoori` | `mariam.almansoori@diez.ae` | `Demo@2026!` | Requestor (`REQUESTOR`) | INTERNAL | `/app` | Digital Security |
| 2 | **Ahmed Al Zaabi** | `ahmed.alzaabi` | `ahmed.alzaabi@diez.ae` | `Demo@2026!` | Requestor (`REQUESTOR`) | INTERNAL | `/app` | IT Infrastructure |
| 3 | **Rashid Al Falasi** | `rashid.alfalasi` | `rashid.alfalasi@diez.ae` | `Demo@2026!` | Requestor (`REQUESTOR`) | INTERNAL | `/app` | PMO |
| 4 | **Hessa Al Qassimi** | `hessa.alqassimi` | `hessa.alqassimi@diez.ae` | `Demo@2026!` | Requestor (`REQUESTOR`) | INTERNAL | `/app` | Finance |
| 5 | **Omar Al Hashmi** | `omar.alhashmi` | `omar.alhashmi@diez.ae` | `Demo@2026!` | Line Manager (`LINE_MANAGER`) | INTERNAL | `/app` | Digital Security |
| 6 | **Fatima Al Marri** | `fatima.almarri` | `fatima.almarri@diez.ae` | `Demo@2026!` | Section Head (`SECTION_HEAD`) | INTERNAL | `/app` | Digital Security |
| 7 | **Khalid Al Suwaidi** | `khalid.alsuwaidi` | `khalid.alsuwaidi@diez.ae` | `Demo@2026!` | Head of Department (`HOD`) | INTERNAL | `/app` | Digital Security |
| 8 | **Youssef Al Blooshi** | `youssef.alblooshi` | `youssef.alblooshi@diez.ae` | `Demo@2026!` | Head of Department (`HOD`) | INTERNAL | `/app` | PMO |
| 9 | **Mona Al Shamsi** | `mona.alshamsi` | `mona.alshamsi@diez.ae` | `Demo@2026!` | Head of Department (`HOD`) | INTERNAL | `/app` | IT Infrastructure |
| 10 | **Aisha Al Nuaimi** | `aisha.alnuaimi` | `aisha.alnuaimi@diez.ae` | `Demo@2026!` | HR Specialist (`HR`) | INTERNAL | `/app` | DIEZ (Organization) |
| 11 | **Rashid Al Mansoori** | `rashid.almansoori` | `rashid.almansoori@diez.ae` | `Demo@2026!` | Finance Manager (`FINANCE`) | INTERNAL | `/app` | DIEZ (Organization) |
| 12 | **Salma Al Ketbi** | `salma.alketbi` | `salma.alketbi@diez.ae` | `Demo@2026!` | Procurement Officer (`PROCUREMENT`) | INTERNAL | `/app` | DIEZ (Organization) |
| 13 | **Noura Al Mazrouei** | `noura.almazrouei` | `noura.almazrouei@diez.ae` | `Demo@2026!` | Main Interviewer (`MAIN_INTERVIEWER`) | INTERNAL | `/app` | Digital Security |
| 14 | **Yousef Al Falasi** | `yousef.alfalasi` | `yousef.alfalasi@diez.ae` | `Demo@2026!` | Panel Interviewer (`PANEL_INTERVIEWER`) | INTERNAL | `/app` | Digital Security |
| 15 | **Ahmed Al Dhaheri** | `ahmed.aldhaheri` | `ahmed.aldhaheri@diez.ae` | `Demo@2026!` | System Administrator (`SYSTEM_ADMIN`) | INTERNAL | `/app` | Global |
| 16 | **Layla Hassan** | `layla.hassan` | `layla.hassan@falcontech.ae` | `Demo@2026!` | Vendor Coordinator (`VENDOR`) | **VENDOR** | `/vendor` | Falcon Tech Resourcing |

---

## 2. Legacy / System Administrator Account

In addition to the 16 canonical demo users, the initial system provisioning account:

| Username | Email Address | Password | Role | User Type | Portal Target | Notes |
|---|---|---|---|---|---|---|
| `admin` | `admin@oms.local` | `Admin@123` | System Administrator (`SYSTEM_ADMIN`) | INTERNAL | `/app` | Initial setup / root administrator |

---

## 3. Detailed Persona Breakdown & Navigation Access

### A. Department Requestors
*Can create and monitor requisitions within their department.*
- **Mariam Al Mansoori** (`mariam.almansoori` / `Demo@2026!`) — Senior Information Security Officer (Digital Security)
- **Ahmed Al Zaabi** (`ahmed.alzaabi` / `Demo@2026!`) — Lead Systems Engineer (IT Infrastructure)
- **Rashid Al Falasi** (`rashid.alfalasi` / `Demo@2026!`) — Senior Project Manager (PMO)
- **Hessa Al Qassimi** (`hessa.alqassimi` / `Demo@2026!`) — Financial Analyst (Finance)
- **Visible Sidebar Items**: `Dashboard`, `My Requests`

### B. Department Leadership & Approval Chain
*Manage and review team requisitions, approvals, and interviews.*
- **Omar Al Hashmi** (`omar.alhashmi` / `Demo@2026!`) — Information Security Operations Manager (Line Manager)
  - **Visible Sidebar Items**: `Dashboard`, `My Requests`, `Interviews`
- **Fatima Al Marri** (`fatima.almarri` / `Demo@2026!`) — Section Head - Cyber Defence
  - **Visible Sidebar Items**: `Dashboard`, `My Requests`, `Interviews`
- **Khalid Al Suwaidi** (`khalid.alsuwaidi` / `Demo@2026!`) — Head of Digital Security Department (HOD)
  - **Visible Sidebar Items**: `Dashboard`, `My Requests`, `Interviews`
- **Youssef Al Blooshi** (`youssef.alblooshi` / `Demo@2026!`) — Director of Enterprise PMO (HOD)
  - **Visible Sidebar Items**: `Dashboard`, `My Requests`, `Interviews`
- **Mona Al Shamsi** (`mona.alshamsi` / `Demo@2026!`) — Head of IT Infrastructure Department (HOD)
  - **Visible Sidebar Items**: `Dashboard`, `My Requests`, `Interviews`

### C. Enterprise Review & Operations
*Cross-departmental management of workforce, budget, and procurement.*
- **Aisha Al Nuaimi** (`aisha.alnuaimi` / `Demo@2026!`) — Senior HR Business Partner & Workforce Specialist
  - **Visible Sidebar Items**: `Dashboard`, `All Requests`, `Workforce`, `HR Review`, `Reports`
- **Rashid Al Mansoori** (`rashid.almansoori` / `Demo@2026!`) — Finance Operations & Budget Manager
  - **Visible Sidebar Items**: `Dashboard`, `All Requests`, `Workforce`, `Reports`
- **Salma Al Ketbi** (`salma.alketbi` / `Demo@2026!`) — Senior Procurement Officer
  - **Visible Sidebar Items**: `Dashboard`, `All Requests`, `Vendors`, `Contracts`, `Reports`

### D. Assessment & Interview Panel
- **Noura Al Mazrouei** (`noura.almazrouei` / `Demo@2026!`) — Lead Security Architect (Main Interviewer)
  - **Visible Sidebar Items**: `Dashboard`, `Interviews`
- **Yousef Al Falasi** (`yousef.alfalasi` / `Demo@2026!`) — Senior SOC Analyst (Panel Interviewer)
  - **Visible Sidebar Items**: `Dashboard`, `Interviews`

### E. System Administrator
- **Ahmed Al Dhaheri** (`ahmed.aldhaheri` / `Demo@2026!`) — Enterprise Systems Administrator
  - **Visible Sidebar Items**: `Dashboard`, `All Requests`, `Workforce`, `Vendors`, `Contracts`, `Interviews`, `HR Review`, `Reports`, `Users`, `Roles & Permissions`, `Master Data`, `Audit Logs`

### F. Vendor Portal (External)
- **Layla Hassan** (`layla.hassan` / `Demo@2026!`) — Senior Account Coordinator (Falcon Tech Resourcing)
  - **Portal Target**: `/vendor` (Landing: `/vendor/dashboard`)
  - **Access Restriction**: External only. All `/app/*` requests are strictly rejected and redirected to `/vendor`.
  - **Visible Vendor Navigation**: `Dashboard`, `Job Opportunities`, `Candidate Submissions`, `Interviews`, `Contracts & POs`, `Candidate Onboarding`, `Company Profile`

---

## 4. Machine-Readable Format (JSON)

```json
[
  { "username": "mariam.almansoori", "email": "mariam.almansoori@diez.ae", "password": "Demo@2026!", "name": "Mariam Al Mansoori", "role": "REQUESTOR", "userType": "INTERNAL", "portal": "/app" },
  { "username": "ahmed.alzaabi", "email": "ahmed.alzaabi@diez.ae", "password": "Demo@2026!", "name": "Ahmed Al Zaabi", "role": "REQUESTOR", "userType": "INTERNAL", "portal": "/app" },
  { "username": "rashid.alfalasi", "email": "rashid.alfalasi@diez.ae", "password": "Demo@2026!", "name": "Rashid Al Falasi", "role": "REQUESTOR", "userType": "INTERNAL", "portal": "/app" },
  { "username": "hessa.alqassimi", "email": "hessa.alqassimi@diez.ae", "password": "Demo@2026!", "name": "Hessa Al Qassimi", "role": "REQUESTOR", "userType": "INTERNAL", "portal": "/app" },
  { "username": "omar.alhashmi", "email": "omar.alhashmi@diez.ae", "password": "Demo@2026!", "name": "Omar Al Hashmi", "role": "LINE_MANAGER", "userType": "INTERNAL", "portal": "/app" },
  { "username": "fatima.almarri", "email": "fatima.almarri@diez.ae", "password": "Demo@2026!", "name": "Fatima Al Marri", "role": "SECTION_HEAD", "userType": "INTERNAL", "portal": "/app" },
  { "username": "khalid.alsuwaidi", "email": "khalid.alsuwaidi@diez.ae", "password": "Demo@2026!", "name": "Khalid Al Suwaidi", "role": "HOD", "userType": "INTERNAL", "portal": "/app" },
  { "username": "youssef.alblooshi", "email": "youssef.alblooshi@diez.ae", "password": "Demo@2026!", "name": "Youssef Al Blooshi", "role": "HOD", "userType": "INTERNAL", "portal": "/app" },
  { "username": "mona.alshamsi", "email": "mona.alshamsi@diez.ae", "password": "Demo@2026!", "name": "Mona Al Shamsi", "role": "HOD", "userType": "INTERNAL", "portal": "/app" },
  { "username": "aisha.alnuaimi", "email": "aisha.alnuaimi@diez.ae", "password": "Demo@2026!", "name": "Aisha Al Nuaimi", "role": "HR", "userType": "INTERNAL", "portal": "/app" },
  { "username": "rashid.almansoori", "email": "rashid.almansoori@diez.ae", "password": "Demo@2026!", "name": "Rashid Al Mansoori", "role": "FINANCE", "userType": "INTERNAL", "portal": "/app" },
  { "username": "salma.alketbi", "email": "salma.alketbi@diez.ae", "password": "Demo@2026!", "name": "Salma Al Ketbi", "role": "PROCUREMENT", "userType": "INTERNAL", "portal": "/app" },
  { "username": "noura.almazrouei", "email": "noura.almazrouei@diez.ae", "password": "Demo@2026!", "name": "Noura Al Mazrouei", "role": "MAIN_INTERVIEWER", "userType": "INTERNAL", "portal": "/app" },
  { "username": "yousef.alfalasi", "email": "yousef.alfalasi@diez.ae", "password": "Demo@2026!", "name": "Yousef Al Falasi", "role": "PANEL_INTERVIEWER", "userType": "INTERNAL", "portal": "/app" },
  { "username": "ahmed.aldhaheri", "email": "ahmed.aldhaheri@diez.ae", "password": "Demo@2026!", "name": "Ahmed Al Dhaheri", "role": "SYSTEM_ADMIN", "userType": "INTERNAL", "portal": "/app" },
  { "username": "layla.hassan", "email": "layla.hassan@falcontech.ae", "password": "Demo@2026!", "name": "Layla Hassan", "role": "VENDOR", "userType": "VENDOR", "portal": "/vendor" },
  { "username": "admin", "email": "admin@oms.local", "password": "Admin@123", "name": "System Administrator", "role": "SYSTEM_ADMIN", "userType": "INTERNAL", "portal": "/app" }
]
```
