# DIEZ Operations Management System (OMS) — Live Demo Walkthrough

**Document Version**: 1.0.0  
**Target Audience**: DIEZ Leadership, Steering Committee, Procurement & HR Stakeholders  
**Scope**: End-to-end Demonstration Script covering 14 Seeded Requisitions, 16 Cast Personas, and 7 Integrated Storylines.

---

## Executive Presenter Overview

This document is the authoritative presenter's script for demonstrating the integrated **DIEZ Operations Management System (OMS)**. Every page, table, decision bar, and status badge shown is backed by a single canonical dataset (`src/lib/demo-data/`). There are no isolated mocks or parallel databases.

### Key System Invariants to Highlight
1. **Mathematical Financial Integrity**: All monetary values are tracked in integer minor units (fils: 1 AED = 100 fils). Requisition budgets, candidate rates, budget amendments, and Oracle ledger reconciliations match to the exact fils across all screens.
2. **Strict Segregation of Duties**: Requesters cannot approve their own requisitions. Approval buttons and sticky decision bars only appear when the signed-in persona is the designated pending approver with available budget authority.
3. **Blind Candidate & Vendor Isolation (Domain 3)**: Vendor names (e.g., *Falcon Tech Resourcing*) never appear on internal interviewer or requester views. Rejection workflows enforce statutory retention periods under the UAE Personal Data Protection Law (PDPL).
4. **Instant Persona Switching**: Presenters can switch personas dynamically from the global Topbar switcher without re-authenticating.

---

## Quick Reference: The 16 Cast Members

| ID | Persona | Role | Department / Scope |
| :--- | :--- | :--- | :--- |
| `usr-mariam` | **Mariam Al Mansoori** | Department Requestor | Digital Security, Data Management |
| `usr-ahmed` | **Ahmed Al Zaabi** | Department Requestor | IT Infrastructure |
| `usr-rfalasi` | **Rashid Al Falasi** | Department Requestor | Project Management Office (PMO) |
| `usr-hessa` | **Hessa Al Qassimi** | Department Requestor | Finance & Strategy |
| `usr-omar` | **Omar Al Hashmi** | Line Manager | Digital Security |
| `usr-fatima` | **Fatima Al Marri** | Section Head | Digital Security |
| `usr-khalid` | **Khalid Al Suwaidi** | Head of Department | Digital Security |
| `usr-youssef-b`| **Youssef Al Blooshi** | Head of Department | PMO (Direct after Line Manager) |
| `usr-mona` | **Mona Al Shamsi** | Head of Department | IT Infrastructure (Direct after LM) |
| `usr-aisha` | **Aisha Al Nuaimi** | HR Specialist | People & Operations (Org-wide) |
| `usr-rashid-m` | **Rashid Al Mansoori** | Finance Manager | Finance & Strategy (Org-wide) |
| `usr-salma` | **Salma Al Ketbi** | Procurement Officer | Corporate Procurement (Org-wide) |
| `usr-noura` | **Noura Al Mazrouei** | Main Interviewer | Digital Security, Data Management |
| `usr-yousef-f` | **Yousef Al Falasi** | Panel Interviewer | Digital Security |
| `usr-layla` | **Layla Hassan** | Vendor Coordinator | Falcon Tech Resourcing (External Vendor) |
| `usr-admin` | **Ahmed Al Dhaheri** | System Administrator | Enterprise / Global IT |

---

# Storyline Walkthroughs

---

## Storyline A: Full Requisition Lifecycle — Submission to HR Review

**Demonstration Objective**: Show a newly submitted requisition moving through a multi-tier departmental approval hierarchy, demonstrating separation of duties, sticky decision bars, and variable-length approval chains.

- **Primary Entities**: `OMS-2026-0170` (Security Architect, 3 departmental approval tiers), `OMS-2026-0128` (PMO Analyst, 2 departmental approval tiers).

### Detailed Click Path

#### Step 1: Requester View & Separation of Duties
1. **Persona**: `Mariam Al Mansoori` (`usr-mariam`)
2. **Starting URL**: `/app/requests`
3. **Actions**:
   - Locate `OMS-2026-0170` at the top of the list (Status: *In Approval*, Stage: *Line Manager*).
   - Click the row to open `/app/requests/OMS-2026-0170`.
4. **Presenter Talking Points**:
   - Point out that Mariam is the requester. The banner clearly indicates: *"Read-Only: You are the requester of this requisition (separation of duties)."*
   - There are no approval buttons. The audit route shows: *Step 1: Mariam submitted today → Step 2: Awaiting Omar Al Hashmi (Line Manager).*

#### Step 2: Line Manager Review & Approval
1. **Persona Switch**: Click Topbar Persona Switcher → Select **Omar Al Hashmi** (`usr-omar`).
2. **Starting URL**: `/app/requests?tab=needs-my-action` (or click Topbar attention notification).
3. **Actions**:
   - Notice `OMS-2026-0170` is in Omar's *Needs My Action* queue.
   - Click `OMS-2026-0170` to view the requisition.
   - The sticky decision bar appears at the bottom of the viewport (`canAct: true`).
   - Click **Approve Requisition**.
   - Optional: Add an approval note: *"Budget confirmed within Cybersecurity Services FY2026 allocation."*
   - Click **Confirm Approval**.
4. **Presenter Talking Points**:
   - The requisition stage immediately updates from *Line Manager* to *Section Head*.

#### Step 3: Section Head Endorsement
1. **Persona Switch**: Select **Fatima Al Marri** (`usr-fatima`).
2. **Starting URL**: `/app/requests/OMS-2026-0170`
3. **Actions**:
   - Fatima views `OMS-2026-0170`. Her role shows as *Section Head*.
   - Click **Endorse Requisition** on the decision bar.
4. **Presenter Talking Points**:
   - Step 2 is now marked *Approved by Omar Al Hashmi*; Step 3 is marked *Endorsed by Fatima Al Marri*.

#### Step 4: Head of Department Final Sign-Off
1. **Persona Switch**: Select **Khalid Al Suwaidi** (`usr-khalid`).
2. **Starting URL**: `/app/requests/OMS-2026-0170`
3. **Actions**:
   - Click **Approve Requisition**.
4. **Presenter Talking Points**:
   - Departmental approval is complete. The requisition transitions to **HR Review** stage.

#### Step 5: HR Review Queue & Variable Hierarchy Comparison
1. **Persona Switch**: Select **Aisha Al Nuaimi** (`usr-aisha`).
2. **Starting URL**: `/app/hr-review`
3. **Actions**:
   - Point out `OMS-2026-0170` has landed in Aisha's HR Review queue.
   - Now click on `OMS-2026-0128` (PMO Analyst, Rashid Al Falasi).
4. **Presenter Talking Points**:
   - Demonstrate variable-length approval hierarchies: `OMS-2026-0128` in the PMO department has **no Section Head**. The route skipped directly from Line Manager to Youssef Al Blooshi (HOD).
   - Point out the red SLA breach badge on `0128`: *"Overdue by 2 days"*.

---

## Storyline B: Bidirectional Clarification Cycle

**Demonstration Objective**: Demonstrate how HR requests information or amendments from a requester, and how requesters answer without losing requisition state or starting parallel workstreams.

- **Primary Entities**: `OMS-2026-0139` (Clarification returned to HR), `OMS-2026-0143` (Awaiting requester answer).

### Detailed Click Path

#### Direction 1: HR Processing a Returned Clarification (`0139`)
1. **Persona**: `Aisha Al Nuaimi` (`usr-aisha`)
2. **Starting URL**: `/app/hr-review`
3. **Actions**:
   - Click on requisition `OMS-2026-0139` (*Data Governance Specialist*).
   - Observe the prominent amber banner: *"Returned from Clarification — Requester Omar Tariq responded 1 day ago."*
   - Click the banner link: **View Clarification Response →**.
   - Lands on `/app/requests/OMS-2026-0139/clarifications/clar-2026-0089`.
4. **Presenter Talking Points**:
   - Show the 3 asks requested by Aisha:
     1. Deliverables clarified (*Justification expanded*).
     2. Engagement end date updated (*30 Jun 2027 → 31 Aug 2027, Duration 10 → 12 months*).
     3. Project plan document attached (`Data_Governance_Requirements_v2.pdf`).
   - Highlight the side-by-side diff: values changed without altering the total AED 240,000 budget.
   - Point out the reapproval route consequence preview: Returning this to HR avoids a full financial reset.

#### Direction 2: Requester Responding to an HR Inquiry (`0143`)
1. **Persona Switch**: Select **Ahmed Al Zaabi** (`usr-ahmed`).
2. **Starting URL**: `/app/requests/OMS-2026-0143`
3. **Actions**:
   - Observe the stage banner: *"Awaiting Requester Action: HR has requested additional information."*
   - Click **Respond to Clarification** button.
   - Lands on `/app/requests/OMS-2026-0143/clarifications/clar-2026-0143-01`.
4. **Presenter Talking Points**:
   - Show clean page collapse: For a simple `MORE_INFO` query ("Confirm physical data center badge vs remote VPN access"), the complex financial drawdown panel and reapproval stepper disappear.
   - Enter response in the text field: *"Remote VPN access with MFA only. No physical badge access required."*
   - Click **Submit Response**.
   - Show instant feedback: Requisition returns to HR Review queue automatically.

---

## Storyline C: Flagship Talent Flow — Scheduling, Evaluation & Over-Budget Amendment

**Demonstration Objective**: The flagship showcase. Schedule candidate interviews with smart availability conflict detection, perform a blinded scorecard evaluation, qualify an over-budget candidate, and seamlessly trigger a candidate budget amendment.

- **Primary Entities**: `OMS-2026-0148` (Senior Cybersecurity Analyst), Candidates `C-014` (Samir Rahman) and `C-021` (Fatima Al-Hashimi), Amendment `amd-2026-0089`.

### Detailed Click Path

#### Step 1: Smart Interview Scheduling with Suggestion Engine
1. **Persona**: `Noura Al Mazrouei` (`usr-noura` — Main Interviewer)
2. **Starting URL**: `/app/candidates`
3. **Actions**:
   - Filter by Requisition: Select **OMS-2026-0148**.
   - Notice two candidates:
     - `C-014` (*Samir Rahman*): Evaluated & Qualified (Over Budget).
     - `C-021` (*Fatima Al-Hashimi*): Awaiting Interview Scheduling.
   - On `C-021`, click **Plan Interview**.
   - Lands on `/app/candidates/interviews/plan/OMS-2026-0148`.
4. **Presenter Talking Points**:
   - **Smart Suggestion Engine**: Outlook calendar synchronization pulls live availability for panel members (Noura, Yousef Al Falasi, Omar Al Hashmi).
   - Show collision warning: *"Slot conflict on 11 Aug: Omar Al Hashmi has Department Budget Review."*
   - System automatically proposes conflict-free slots on 12 Aug at 08:30 GST.
   - **Blind Candidate Boundary**: The scheduling panel displays the candidate ref and anonymized profile, relaying logistics without exposing vendor contact emails.

#### Step 2: Scorecard Evaluation & Blind Review
1. **Starting URL**: `/app/candidates/interviews/evaluate/OMS-2026-0148/C-014`
2. **Actions**:
   - Examine Samir Rahman's completed scorecard:
     - Overall Score: **86.7%** (*Above requirement*).
     - Weighted criteria: Technical Expertise (25%, Rating 5/5), Cybersecurity Ops (20%, Rating 4/5), Incident Response (15%, Rating 5/5).
   - Point out the **Blind Candidate Review Boundary**:
     - Candidate card shows: *Source: Accredited Agency (Vendor Identity Concealed)*.
     - Falcon Tech Resourcing is never mentioned anywhere on the evaluation screen.
3. **Presenter Talking Points**:
   - Scroll to the **Cost Comparison Panel**:
     - Approved Requisition Budget: **AED 310,000.00** (`31,000,000` fils).
     - Expected Contractor Annual Cost: **AED 330,000.00** (`33,000,000` fils).
     - Variance: **+AED 20,000.00** (`+2,000,000` fils, `+6.45%`).
     - Badge: Red pill **OVER_BUDGET**.
   - Click button **Qualify Candidate**.

#### Step 3: Candidate Budget Amendment Creation
1. **Actions**:
   - Clicking Qualify prompts: *"Candidate is qualified but exceeds approved budget by AED 20,000.00. Create Budget Amendment?"*
   - Click **Create Budget Amendment** (or click the direct banner link).
   - Lands on `/app/requests/OMS-2026-0148/amendments/amd-2026-0089`.
2. **Presenter Talking Points**:
   - **Zero Data Drift**: The financial figures on the Amendment page match the Evaluation page to the single fils:
     - Approved: AED 310,000.00
     - Qualified Cost: AED 330,000.00
     - Shortfall to Fund: AED 20,000.00
   - **Funding Route Selection**: The department selects *Budgeted Line Drawdown* from *Cybersecurity Services FY2026* (`line-cs-dig-001`, available balance: AED 566,000.00).
   - **Reapproval Route**:
     - Step 1: **Omar Al Hashmi** (Line Manager)
     - Step 2: **Fatima Al Marri** (Section Head)
     - Step 3: **Khalid Al Suwaidi** (Head of Department)
     - Step 4: **Rashid Al Mansoori** (Finance Manager)

#### Step 4: Finance Manager Review & Sign-Off
1. **Persona Switch**: Select **Rashid Al Mansoori** (`usr-rashid-m`).
2. **Starting URL**: `/app/requests/OMS-2026-0148/amendments/amd-2026-0089`
3. **Actions**:
   - View the reapproval route stepper: Department steps 1–3 are marked complete. Step 4 (*Finance Manager*) is highlighted as active (`CURRENT`).
   - Click **Approve Budget Allocation**.
4. **Presenter Talking Points**:
   - Requisition `0148` is now fully funded at AED 330,000.00 and advances to Procurement Sourcing / Contracting.

---

## Storyline D: PDPL-Compliant Candidate Rejection & Re-Sourcing

**Demonstration Objective**: Demonstrate compliance with the UAE Personal Data Protection Law (PDPL) upon candidate rejection and automatic trigger of procurement re-sourcing.

- **Primary Entities**: `OMS-2026-0161` (Penetration Tester), Candidate `C-040` (Kareem Mostafa).

### Detailed Click Path

1. **Persona**: `Noura Al Mazrouei` (`usr-noura`)
2. **Starting URL**: `/app/candidates`
3. **Actions**:
   - Filter pipeline by: **OMS-2026-0161**.
   - Click on candidate `C-040` (*Kareem Mostafa*).
   - Lands on `/app/candidates/interviews/evaluate/OMS-2026-0161/C-040`.
4. **Presenter Talking Points**:
   - Scorecard indicates score of **52.4%** (*Below requirement*).
   - Evaluator submitted rejection outcome: **REJECT**.
   - **Statutory PDPL Compliance**:
     - Rejection Reason Code: `NOT_SUITABLE_DELETE_CV`.
     - System displays legally binding retention notice: *"Candidate does not meet technical criteria. In accordance with UAE PDPL, CV will not be retained in the talent pool and is scheduled for automatic purge on 15 Feb 2027."*
5. **Follow-Up Action**:
   - Click link **View Requisition (OMS-2026-0161) →**.
   - Lands on `/app/requests/OMS-2026-0161`.
   - Point out that because `C-040` was rejected, the active candidate count dropped to 0, and the requisition stage transitioned to **Procurement Re-sourcing**.

---

## Storyline E: Vendor Onboarding — Onshore vs Offshore Compliance

**Demonstration Objective**: Demonstrate the external Vendor Portal experience, strict Domain 3 isolation, e-signatures, and regulatory differentiation between onshore and offshore contractors.

- **Primary Entities**: `ONB-2026-0119` (Tariq Al Hammadi, Onshore), `ONB-2026-0102` (Priya Sharma, Offshore).

### Detailed Click Path

#### Storyline E1: Onshore Onboarding & NDA E-Signature
1. **Persona Switch**: Select **Layla Hassan** (`usr-layla` — Vendor Coordinator, Falcon Tech Resourcing).
2. **Portal Redirection**:
   - Notice that Layla is immediately routed away from `/app/*` to `/vendor/onboarding`.
   - Any attempt to access `/app/requests` or `/app/budget` yields an immediate 403 / redirect to the Vendor Portal.
3. **Actions**:
   - Click on onboarding case **ONB-2026-0119** (*Tariq Al Hammadi*, SOC Analyst).
   - Review the required 6-document onshore compliance package:
     1. Passport Copy (Approved)
     2. Emirates ID (Approved)
     3. Attested Degree Certificate (Uploaded)
     4. UAE Police Clearance Certificate (Verified)
     5. Medical Fitness Certificate (Verified)
     6. DIEZ Standard Contractor NDA v3.2 (Awaiting Signature)
   - Click **Preview & Sign NDA**.
   - Review the envelope: Candidate signed on 16 Aug; DIEZ counter-signature executed by Aisha Al Nuaimi.
4. **Presenter Talking Points**:
   - Vendor users have write access only to document uploads and candidate profile management until final submission to DIEZ.

#### Storyline E2: Offshore Onboarding & Timezone Handling
1. **Starting URL**: `/vendor/onboarding`
2. **Actions**:
   - Click on onboarding case **ONB-2026-0102** (*Priya Sharma*, Data Analyst).
3. **Presenter Talking Points**:
   - Notice the offshore badge: Resident status is **OFFSHORE** (India).
   - Document checklist dynamically changes: Emirates ID and UAE Medical Fitness are replaced with **Cross-Border Remote Data Access Authorization** and **Apostilled Police Clearance**.
   - Timezone comparison widget shows: *Candidate Timezone: Asia/Kolkata (UTC+5:30) · DIEZ Core Hours: 09:00–17:00 GST (UTC+4:00)*.

---

## Storyline F: Active Workforce, Contract Runway & Succession Lineage

**Demonstration Objective**: Demonstrate the workforce management roster, contract expiration runway monitoring on the executive dashboard, and lineage tracking from a terminated resource to its replacement requisition.

- **Primary Entities**: `wm-2026-0081` (QA Engineer, contract ending in 21 days), `wm-2026-0074` (Terminated BA), `OMS-2026-0074-R` (Replacement Requisition).

### Detailed Click Path

#### Step 1: Executive Dashboard & Contract Runway
1. **Persona Switch**: Select **Mariam Al Mansoori** (`usr-mariam`).
2. **Starting URL**: `/app/dashboard`
3. **Actions**:
   - Scroll to the **Contract Runway** widget in Band C.
   - Point out Sarah Jenkins (`wm-2026-0081`, QA Engineer) highlighted in the amber 30-day countdown bucket:
     - Contract End: **30 Sep 2026** (21 days remaining).
   - Click the widget title or "View All Ending Soon".
   - Lands on `/app/workforce?filter=ending-soon`.
4. **Presenter Talking Points**:
   - On Sarah Jenkins' row, click button **Review Extension**.
   - Directly opens original requisition `/app/requests/OMS-2026-0081` to initiate extension or replacement.

#### Step 2: Terminated Resource & Replacement Lineage
1. **Starting URL**: `/app/workforce`
2. **Actions**:
   - Filter roster by status: **Terminated**.
   - Locate **David Miller** (`wm-2026-0074`, Business Analyst).
   - Point out details: Joined 01 Jul 2025, terminated 09 Jul 2026.
   - Notice the prominent blue action button: **Replacement (OMS-2026-0074-R) →**.
   - Click the button.
   - Lands on `/app/requests/OMS-2026-0074-R`.
3. **Presenter Talking Points**:
   - Requisition `OMS-2026-0074-R` (*Business Analyst (Replacement)*) maintains a permanent foreign-key link to `wm-2026-0074`.
   - The justification highlights: *"Backfill for David Miller following contract cessation on 09 Jul 2026."*

---

## Storyline G: Platform Governance & System Health View

**Demonstration Objective**: Demonstrate enterprise administration, role-based access control, security posture, and financial reconciliation variance monitoring.

- **Primary Entities**: `Ahmed Al Dhaheri` (`usr-admin`), Security Audit Dashboard, User Administration, Supplementary Reconciliation Record `OMS-2026-0131`.

### Detailed Click Path

#### Step 1: Enterprise User Administration & Cast Validation
1. **Persona Switch**: Select **Ahmed Al Dhaheri** (`usr-admin` — System Administrator).
2. **Starting URL**: `/app/administration/users`
3. **Actions**:
   - Search the table for cast members.
   - Filter by User Type: **Internal** vs **Vendor**.
4. **Presenter Talking Points**:
   - Confirm all 16 cast personas are registered with valid roles, departments, and access scopes.
   - Highlight **Layla Hassan**: Classified strictly as `VENDOR` with `vendorId: ven-falcon`. She cannot access internal administration or financial routes.
   - All other 15 cast members are classified as `INTERNAL`.

#### Step 2: Enterprise Security Dashboard
1. **Starting URL**: `/app/administration/security-dashboard`
2. **Actions**:
   - Review real-time KPI tiles: Authentication events, zero account lockouts, active session tokens.
   - View the Security Charts: Authentication trends by business unit (Corporate Services vs Free Zones).
   - Audit trail logs show persona switches, sign-offs, and PDPL document purge scheduling.

#### Step 3: Budget Control Center & Financial Reconciliation
1. **Starting URL**: `/app/budget`
2. **Actions**:
   - Review department allocation for **Digital Security** (Total Budget: AED 10.20M across 3 budget lines).
   - Scroll to the **Exceptions & Reconciliation Variances** table.
   - Locate record **OMS-2026-0131**:
     - Budget Line: *Cybersecurity Services FY2026* (`line-cs-dig-001`).
     - Type: *Oracle ERP vs OMS Committed Funds Variance*.
     - OMS Committed: **AED 1,600,000.00** (`160,000,000` fils).
     - Oracle Actuals: **AED 1,645,000.00** (`164,500,000` fils).
     - Variance: **AED 45,000.00** (`4,500,000` fils).
     - Status: *Unresolved (Pending ERP sync)*.
3. **Presenter Talking Points**:
   - Demonstrates that the system connects operational requisitions to Oracle ERP financial ledgers, flagging discrepancies before fiscal period closure.

---

## Verification Sign-Off Matrix

| Storyline | Core Requisition / Entity | Primary Cast Persona | Key Verification Indicator | Status |
| :--- | :--- | :--- | :--- | :---: |
| **A: Lifecycle Approval** | `OMS-2026-0170`, `0128` | Mariam → Omar → Fatima → Khalid → Aisha | Sticky decision bar toggles on `canAct`; variable route lengths match department policy | **PASS** |
| **B: Clarification Flow** | `OMS-2026-0139`, `0143` | Aisha (HR) & Ahmed (Requester) | Side-by-side diffs rendered; reapproval consequence dynamically computed | **PASS** |
| **C: Flagship Talent Flow** | `OMS-2026-0148` (`C-014`, `C-021`) | Noura (Interviewer) & Rashid (Finance) | Minor-unit cost equality (AED 310k vs 330k); blind candidate review preserved | **PASS** |
| **D: PDPL Rejection** | `OMS-2026-0161` (`C-040`) | Noura (Interviewer) & Salma (Procurement)| Statutory retention purge date computed; requisition returns to Procurement re-sourcing | **PASS** |
| **E: Vendor Onboarding** | `ONB-2026-0119`, `0102` | Layla Hassan (Vendor Coordinator) | Domain 3 portal redirection enforced; 6-doc onshore vs 3-doc offshore compliance packages | **PASS** |
| **F: Workforce Lineage** | `wm-2026-0081`, `0074` | Mariam & Aisha | Runway countdown bucket triggers review; terminated BA links to `0074-R` | **PASS** |
| **G: System Administration**| `OMS-2026-0131` | Ahmed Al Dhaheri (Admin) | 16 cast members verified; Oracle reconciliation variance flagged at AED 45,000.00 | **PASS** |

---

*End of Presenter Script.*
