/**
 * Pure Query Functions for DIEZ OMS Demo Data
 * Specification: docs/DEMO-DATA-INTEGRATION.md Part 2
 *
 * Unknown IDs MUST return null. Callers render a real 404, never falling back to a default.
 */

import {
  Requisition,
  Candidate,
  InterviewPlan,
  Evaluation,
  Amendment,
  Clarification,
  ApprovalTask,
  OnboardingCase,
  WorkforceMember,
  ReconciliationVariance,
  Person,
  OrgUnit,
  BudgetLine,
  Vendor,
  RequisitionStage,
  RateCard,
  RateCardTemplate,
  RateCardStatus,
  RateCardGrade,
  VendorComplianceDocument,
  VendorRequisition,
  VendorActionItem,
  VendorDashboardData,
  VendorContract,
  CandidateSubmissionPayload,
  CandidateSubmissionReceipt,
  CostEntryMode,
  VendorSubmissionItem,
  VendorSubmissionStatus,
  VendorSubmissionStatusLabel,
  VendorInterviewProposalSlot,
  VendorInterviewProposalData,
  VendorProfileData,
  VendorSupportMessage,
  CandidateAccessToken,
} from "./entities";
import {
  CandidatePortalResponse,
  CandidatePortalTask,
} from "@/src/types/candidate-portal";
import { CAST, USER_ALIASES, CAST_LIST } from "./cast";
import { ORG_UNITS, BUDGET_LINES, VENDORS, ORG_UNITS_LIST, BUDGET_LINES_LIST, VENDORS_LIST } from "./org";
import {
  REQUISITIONS,
  REQUISITIONS_LIST,
  CANDIDATES,
  CANDIDATES_LIST,
  INTERVIEW_PLANS,
  INTERVIEW_PLANS_LIST,
  EVALUATIONS,
  AMENDMENTS,
  CLARIFICATIONS,
  CLARIFICATIONS_LIST,
  APPROVAL_TASKS,
  APPROVAL_TASKS_LIST,
  ONBOARDING_CASES,
  ONBOARDING_CASES_LIST,
  WORKFORCE_MEMBERS,
  WORKFORCE_MEMBERS_LIST,
  RECONCILIATION_VARIANCE_RECORD,
  RATE_CARDS,
  RATE_CARDS_LIST,
  VENDOR_COMPLIANCE_DOCUMENTS,
  VENDOR_COMPLIANCE_DOCUMENTS_LIST,
  VENDOR_CONTRACTS,
  VENDOR_CONTRACTS_LIST,
  VENDOR_PROFILES,
  VENDOR_SUPPORT_MESSAGES,
  CANDIDATE_ACCESS_TOKENS,
  CANDIDATE_ACCESS_TOKENS_LIST,
} from "./seed";

// ============================================================================
// 1. Requisitions
// ============================================================================

export interface RequisitionFilters {
  status?: RequisitionStage | RequisitionStage[];
  departmentId?: string;
  requestorId?: string;
  tab?: "all" | "drafts" | "needs_action" | "in_progress" | "closed";
  search?: string;
}

/**
 * Retrieves a single requisition by its canonical ID (e.g. "OMS-2026-0148").
 * Returns null if the requisition is unknown.
 */
export function getRequisition(id: string): Requisition | null {
  if (!id) return null;
  const canonicalId = id.trim().toUpperCase();
  return REQUISITIONS[canonicalId] || null;
}

/**
 * Lists requisitions with optional filters for tabs, status, department, etc.
 */
export function listRequisitions(filters?: RequisitionFilters): Requisition[] {
  let items = [...REQUISITIONS_LIST];

  if (!filters) return items;

  // Filter by department
  if (filters.departmentId) {
    items = items.filter((req) => req.departmentId === filters.departmentId);
  }

  // Filter by requestor
  if (filters.requestorId) {
    const canonicalRequestor = USER_ALIASES[filters.requestorId] || filters.requestorId;
    items = items.filter((req) => req.requestorId === canonicalRequestor);
  }

  // Filter by specific stage(s)
  if (filters.status) {
    const stages = Array.isArray(filters.status) ? filters.status : [filters.status];
    items = items.filter((req) => stages.includes(req.currentStage));
  }

  // Filter by tab
  if (filters.tab) {
    switch (filters.tab) {
      case "drafts":
        items = items.filter((req) => req.currentStage === "DRAFT");
        break;
      case "needs_action":
        items = items.filter(
          (req) =>
            req.currentStage === "PENDING_APPROVAL" ||
            req.currentStage === "HR_REVIEW" ||
            req.currentStage === "CLARIFICATION" ||
            req.currentStage === "AMENDMENT"
        );
        break;
      case "in_progress":
        items = items.filter(
          (req) =>
            req.currentStage !== "DRAFT" &&
            req.currentStage !== "ACTIVE" &&
            req.currentStage !== "ENDING_SOON" &&
            req.currentStage !== "TERMINATED"
        );
        break;
      case "closed":
        items = items.filter(
          (req) =>
            req.currentStage === "ACTIVE" ||
            req.currentStage === "ENDING_SOON" ||
            req.currentStage === "TERMINATED"
        );
        break;
      case "all":
      default:
        break;
    }
  }

  // Text search
  if (filters.search) {
    const q = filters.search.toLowerCase().trim();
    items = items.filter(
      (req) =>
        req.id.toLowerCase().includes(q) ||
        req.positionTitle.toLowerCase().includes(q) ||
        req.departmentName.toLowerCase().includes(q) ||
        req.stageLabel.toLowerCase().includes(q)
    );
  }

  return items;
}

// ============================================================================
// 2. Clarifications
// ============================================================================

/**
 * Returns all clarifications raised for a given requisition.
 */
export function getClarificationsForRequisition(requisitionId: string): Clarification[] {
  if (!requisitionId) return [];
  const reqId = requisitionId.trim().toUpperCase();
  return CLARIFICATIONS_LIST.filter((c) => c.requisitionId.toUpperCase() === reqId);
}

/**
 * Retrieves a single clarification by clarificationId or requisitionId.
 */
export function getClarification(id: string): Clarification | null {
  if (!id) return null;
  const match = CLARIFICATIONS[id];
  if (match) return match;

  // Fallback: look up by requisition ID
  const reqId = id.trim().toUpperCase();
  return CLARIFICATIONS_LIST.find((c) => c.requisitionId.toUpperCase() === reqId) || null;
}

// ============================================================================
// 3. Candidates
// ============================================================================

/**
 * Returns all candidates associated with a requisition.
 */
export function getCandidatesForRequisition(requisitionId: string): Candidate[] {
  if (!requisitionId) return [];
  const reqId = requisitionId.trim().toUpperCase();
  return CANDIDATES_LIST.filter((c) => c.requisitionId.toUpperCase() === reqId);
}

/**
 * Retrieves a single candidate by requisition ID and candidate reference.
 */
export function getCandidate(requisitionId: string, candidateRef: string): Candidate | null {
  if (!requisitionId || !candidateRef) return null;
  const reqId = requisitionId.trim().toUpperCase();
  const ref = candidateRef.trim().toUpperCase();
  return (
    CANDIDATES_LIST.find(
      (c) => c.requisitionId.toUpperCase() === reqId && c.candidateRef.toUpperCase() === ref
    ) || null
  );
}

/**
 * Lists all candidates across the organization.
 */
export function listCandidates(): Candidate[] {
  return [...CANDIDATES_LIST];
}

// ============================================================================
// 4. Interview Planning & Evaluation
// ============================================================================

/**
 * Retrieves the interview plan for a specific candidate on a requisition.
 */
export function getInterview(requisitionId: string, candidateRef?: string): InterviewPlan | null {
  if (!requisitionId) return null;
  const reqId = requisitionId.trim().toUpperCase();

  if (candidateRef) {
    const ref = candidateRef.trim().toUpperCase();
    const key = `int-plan-${reqId.replace("OMS-2026-", "")}-${ref}`;
    if (INTERVIEW_PLANS[key]) return INTERVIEW_PLANS[key];

    return (
      Object.values(INTERVIEW_PLANS).find(
        (plan) =>
          plan.requisitionId.toUpperCase() === reqId && plan.candidateRef.toUpperCase() === ref
      ) || null
    );
  }

  // If candidateRef omitted, return first interview plan for requisition
  return (
    Object.values(INTERVIEW_PLANS).find((plan) => plan.requisitionId.toUpperCase() === reqId) ||
    null
  );
}

export const getInterviewPlan = getInterview;

/**
 * Retrieves the evaluation workspace for a specific candidate on a requisition.
 */
export function getEvaluation(requisitionId: string, candidateRef: string): Evaluation | null {
  if (!requisitionId || !candidateRef) return null;
  const reqId = requisitionId.trim().toUpperCase();
  const ref = candidateRef.trim().toUpperCase();

  return (
    Object.values(EVALUATIONS).find(
      (evalRecord) =>
        evalRecord.requisitionId.toUpperCase() === reqId &&
        evalRecord.candidateRef.toUpperCase() === ref
    ) || null
  );
}

// ============================================================================
// 5. Budget Amendments
// ============================================================================

/**
 * Retrieves a budget amendment by amendmentId or requisitionId.
 */
export function getAmendment(idOrRequisitionId: string): Amendment | null {
  if (!idOrRequisitionId) return null;
  const cleanId = idOrRequisitionId.trim();

  // Direct lookup by amendmentId
  if (AMENDMENTS[cleanId]) return AMENDMENTS[cleanId];

  // Lookup by requisitionId
  const reqId = cleanId.toUpperCase();
  return (
    Object.values(AMENDMENTS).find((amd) => amd.requisitionId.toUpperCase() === reqId) || null
  );
}

// ============================================================================
// 6. Approval Tasks (Persona Switcher & "Needs My Action")
// ============================================================================

/**
 * Returns all pending approval tasks assigned to a specific user.
 * Supports legacy aliases (e.g. "usr-omar-01" -> "usr-omar").
 */
export function getApprovalTasksForUser(userId: string): ApprovalTask[] {
  if (!userId) return [];
  const canonicalUserId = USER_ALIASES[userId] || userId;

  return APPROVAL_TASKS_LIST.filter(
    (task) =>
      task.assignment.assignedUserId === canonicalUserId && task.status === "PENDING"
  );
}

/**
 * Retrieves a single approval task by its ID or requisition ID.
 */
export function getApprovalTask(taskIdOrReqId: string): ApprovalTask | null {
  if (!taskIdOrReqId) return null;
  const direct = APPROVAL_TASKS[taskIdOrReqId];
  if (direct) return direct;

  const reqId = taskIdOrReqId.trim().toUpperCase();
  return (
    APPROVAL_TASKS_LIST.find(
      (t) => t.requisitionId.toUpperCase() === reqId
    ) || null
  );
}

/**
 * Lists all approval tasks across the system.
 */
export function listApprovalTasks(): ApprovalTask[] {
  return [...APPROVAL_TASKS_LIST];
}

// ============================================================================
// 7. Onboarding & Vendor Portal
// ============================================================================

/**
 * Retrieves an onboarding case by onboardingId or requisitionId.
 */
export function getOnboarding(idOrRequisitionId: string): OnboardingCase | null {
  if (!idOrRequisitionId) return null;
  const cleanId = idOrRequisitionId.trim();

  // Direct lookup
  if (ONBOARDING_CASES[cleanId]) return ONBOARDING_CASES[cleanId];

  // Lookup by requisition ID or legacy identifier
  const reqId = cleanId.toUpperCase();
  return (
    Object.values(ONBOARDING_CASES).find(
      (onb) =>
        onb.requisitionId.toUpperCase() === reqId ||
        `ONB-${onb.requisitionId.replace("OMS-", "")}` === reqId
    ) || null
  );
}

export function listOnboardingCases(): OnboardingCase[] {
  return [...ONBOARDING_CASES_LIST];
}

// ============================================================================
// 8. Workforce
// ============================================================================

/**
 * Retrieves a workforce member by memberId or requisitionId.
 */
export function getWorkforceMember(idOrRequisitionId: string): WorkforceMember | null {
  if (!idOrRequisitionId) return null;
  const cleanId = idOrRequisitionId.trim();

  // Direct lookup
  if (WORKFORCE_MEMBERS[cleanId]) return WORKFORCE_MEMBERS[cleanId];

  // Lookup by requisition ID
  const reqId = cleanId.toUpperCase();
  return (
    Object.values(WORKFORCE_MEMBERS).find(
      (member) => member.requisitionId.toUpperCase() === reqId
    ) || null
  );
}

export function listWorkforceMembers(filters?: { departmentId?: string; status?: string }): WorkforceMember[] {
  let items = [...WORKFORCE_MEMBERS_LIST];
  if (!filters) return items;

  if (filters.departmentId) {
    items = items.filter((m) => m.departmentId === filters.departmentId);
  }
  if (filters.status) {
    items = items.filter((m) => m.status === filters.status);
  }
  return items;
}

// ============================================================================
// 9. Organization, Cast & Budget
// ============================================================================

export function getPerson(userId: string): Person | null {
  if (!userId) return null;
  const canonicalId = USER_ALIASES[userId] || userId;
  return CAST[canonicalId] || null;
}

export function listPersons(): Person[] {
  return [...CAST_LIST];
}

export function getOrgUnit(id: string): OrgUnit | null {
  if (!id) return null;
  return ORG_UNITS[id] || null;
}

export function listOrgUnits(): OrgUnit[] {
  return [...ORG_UNITS_LIST];
}

export function getBudgetLine(idOrCode: string): BudgetLine | null {
  if (!idOrCode) return null;
  const clean = idOrCode.trim();
  if (BUDGET_LINES[clean]) return BUDGET_LINES[clean];

  return (
    BUDGET_LINES_LIST.find((line) => line.code.toUpperCase() === clean.toUpperCase()) || null
  );
}

export function listBudgetLines(departmentId?: string): BudgetLine[] {
  if (!departmentId) return [...BUDGET_LINES_LIST];
  return BUDGET_LINES_LIST.filter((line) => line.departmentId === departmentId);
}

export function getVendor(id: string): Vendor | null {
  if (!id) return null;
  return VENDORS[id] || null;
}

export function listVendors(): Vendor[] {
  return [...VENDORS_LIST];
}

export function getReconciliationVariance(id?: string): ReconciliationVariance | null {
  if (id && id !== "OMS-2026-0131") return null;
  return RECONCILIATION_VARIANCE_RECORD;
}

// ============================================================================
// 11. Vendor Portal Queries (VENDOR-PORTAL-UI.md Part 5 & 6)
// ============================================================================

export function getVendorDashboard(vendorId: string = "ven-falcon"): VendorDashboardData {
  const openReqs = listVendorRequisitions(vendorId);
  const submissions = listVendorSubmissions(vendorId);
  const onbCases = listVendorOnboardingCases(vendorId);
  const compDocs = getVendorComplianceDocuments(vendorId);

  // Candidates awaiting review: status is SUBMITTED or UNDER_REVIEW
  const awaitingReview = submissions.filter(
    (s) => s.vendorStatus === "SUBMITTED" || s.vendorStatus === "UNDER_REVIEW"
  ).length;

  // Interviews to respond: status is INTERVIEW_PROPOSED
  const interviewsToRespond = submissions.filter(
    (s) => s.vendorStatus === "INTERVIEW_PROPOSED"
  ).length;

  // Onboarding in progress: all active onboarding cases
  const onboardingInProgress = onbCases.length;

  // Compliance docs or onboarding docs expiring within 30 days
  const docsExpiringSoon = compDocs.filter((d) => d.daysRemaining <= 30).length;

  const actionItems: VendorActionItem[] = [
    {
      id: "act-int-021",
      type: "INTERVIEW_PROPOSAL",
      subjectRef: "C-021",
      title: "Interview Slots Proposed — Senior Cybersecurity Analyst",
      context: "Digital Security · Elena Rostova",
      status: "ACTION_REQUIRED",
      urgency: "HIGH",
      daysRemaining: 2,
      dueAt: "2026-09-12T17:00:00Z",
      href: "/vendor/submissions/C-021/interview",
    },
    {
      id: "act-onb-0119",
      type: "ONBOARDING_DOCUMENT",
      subjectRef: "ONB-2026-0119",
      title: "Execute NDA & Compliance Package — Tariq Al Hammadi",
      context: "Digital Security · SOC Analyst",
      status: "PENDING_SIGNATURE",
      urgency: "NORMAL",
      daysRemaining: 5,
      dueAt: "2026-09-15T18:00:00Z",
      href: "/vendor/onboarding/ONB-2026-0119/documents",
    },
    {
      id: "act-req-0161",
      type: "SUBMISSION_WINDOW",
      subjectRef: "OMS-2026-0161",
      title: "Submission Window Open — Penetration Tester",
      context: "Digital Security · 1 Position Available",
      status: "OPEN",
      urgency: "NORMAL",
      daysRemaining: 4,
      dueAt: "2026-09-14T14:00:00Z",
      href: "/vendor/requisitions/OMS-2026-0161",
    },
    {
      id: "act-req-0141",
      type: "SUBMISSION_WINDOW",
      subjectRef: "OMS-2026-0141",
      title: "Submission Window Open — Cloud Security Engineer",
      context: "IT Infrastructure · 1 Position Available",
      status: "OPEN",
      urgency: "NORMAL",
      daysRemaining: 3,
      dueAt: "2026-09-12T14:00:00Z",
      href: "/vendor/requisitions/OMS-2026-0141",
    },
    {
      id: "act-doc-license",
      type: "COMPLIANCE_EXPIRY",
      subjectRef: "DOC-TL-2026",
      title: "Commercial Trade Licence Renewal Required",
      context: "Falcon Tech Resourcing · Expires in 24 days",
      status: "WARNING",
      urgency: "CRITICAL",
      daysRemaining: 24,
      dueAt: "2026-10-04T00:00:00Z",
      href: "/vendor/documents",
    },
  ];

  return {
    kpis: {
      openRequirements: openReqs.filter((r) => r.submissionWindow.isOpen).length,
      candidatesAwaitingReview: awaitingReview,
      interviewsToRespond,
      onboardingInProgress,
      documentsExpiringSoon: docsExpiringSoon,
    },
    actionItems,
  };
}

export function listVendorRequisitions(vendorId: string = "ven-falcon"): VendorRequisition[] {
  // Requisitions visible to Falcon Tech: 0141, 0161, 0148, and closed 0119
  const reqIds = ["OMS-2026-0141", "OMS-2026-0161", "OMS-2026-0148", "OMS-2026-0119"];
  const result: VendorRequisition[] = [];

  for (const id of reqIds) {
    const req = REQUISITIONS[id];
    if (!req) continue;

    // Count submissions by THIS vendor only
    const myCandidates = CANDIDATES_LIST.filter(
      (c) => c.requisitionId === id && c.vendorId === vendorId
    );

    const isClosed = id === "OMS-2026-0119" || req.currentStage === "TERMINATED";

    result.push({
      id: req.id,
      positionTitle: req.positionTitle,
      departmentName: req.departmentName,
      positions: {
        required: req.positions.required,
        filled: req.positions.filled,
        inProgress: req.positions.inProgress,
      },
      engagementMonths: req.engagementMonths,
      workLocation: req.workLocation,
      expectedStartDate: req.expectedStartDate,
      salaryGrade: req.salaryGrade,
      justification: req.justification,
      submissionWindow: {
        opensAt: req.submittedAt || req.createdAt,
        closesAt: isClosed ? "2026-08-30T18:00:00Z" : req.sla?.dueAt || "2026-09-20T18:00:00Z",
        daysRemaining: isClosed ? 0 : id === "OMS-2026-0141" ? 3 : id === "OMS-2026-0161" ? 4 : 4,
        isOpen: !isClosed,
        maxBatchSize: 10,
        closedReason: isClosed ? "Submission window closed — Candidate selected & in onboarding" : undefined,
      },
      mySubmissionsCount: myCandidates.length,
      requiredSkills:
        id === "OMS-2026-0148"
          ? ["Splunk / Sentinel SIEM", "Incident Response", "Threat Hunting", "MITRE ATT&CK"]
          : id === "OMS-2026-0141"
          ? ["AWS & Azure Security", "Kubernetes Hardening", "Terraform", "CI/CD Security"]
          : id === "OMS-2026-0161"
          ? ["Burp Suite Pro", "Web & Mobile App Pen Testing", "Network Exploitation", "OSCP / CEH"]
          : ["SIEM Alert Triage", "Phishing Analysis", "EDR Telemetry", "Log Analysis"],
      experienceYearsRequired:
        id === "OMS-2026-0148" ? 8 : id === "OMS-2026-0141" ? 5 : id === "OMS-2026-0161" ? 6 : 3,
      responsibilities:
        id === "OMS-2026-0141"
          ? [
              "Architect and enforce cloud security guardrails across AWS and Azure multi-account landing zones.",
              "Design and maintain automated security scanning in GitLab CI/CD pipelines for container and IaC compliance.",
              "Implement identity-aware infrastructure access controls and least-privilege IAM policies.",
              "Conduct continuous compliance monitoring and vulnerability remediation for production Kubernetes clusters.",
            ]
          : id === "OMS-2026-0161"
          ? [
              "Conduct grey-box and black-box penetration tests across public-facing web applications and mobile apps.",
              "Identify high-severity authentication bypasses, IDORs, and SSRF flaws with reproducible proofs of concept.",
              "Perform internal network exploitation assessments and Active Directory security audits.",
              "Produce comprehensive remediation guides and brief executive stakeholders on residual risk.",
            ]
          : id === "OMS-2026-0148"
          ? [
              "Lead 24/7 detection engineering and advanced threat hunting using Splunk ES and Microsoft Sentinel.",
              "Act as technical incident commander during critical P1 cyber security incidents.",
              "Map attack patterns against MITRE ATT&CK enterprise matrices and develop automated SOAR playbooks.",
              "Collaborate with government CERT and national cyber agencies during threat intelligence sharing.",
            ]
          : [
              "Perform Tier-2 security event triage and alert investigations in the Enterprise SOC.",
              "Analyze malicious network telemetry, phishing campaigns, and endpoint behavioral anomalies.",
              "Maintain and tune correlation rules across SIEM and EDR detection engines.",
            ],
      jobDescriptionHtml:
        id === "OMS-2026-0141"
          ? "The Cloud Security Engineer will lead the engineering and hardening of DIEZ's multi-cloud enterprise workloads across AWS and Microsoft Azure. The role enforces cloud infrastructure security standards, container security, and automated scanning within DevSecOps delivery pipelines."
          : id === "OMS-2026-0161"
          ? "The Senior Penetration Tester will execute proactive technical offensive security evaluations against DIEZ digital portals, smart zone platforms, and cloud services to discover security weaknesses prior to threat actor exploitation."
          : id === "OMS-2026-0148"
          ? "The Senior Cybersecurity Analyst leads threat intelligence, advanced SIEM detection engineering, and hands-on digital incident response operations across the DIEZ critical infrastructure ecosystem."
          : "The SOC Analyst monitors enterprise network events and triages security alerts across endpoint, identity, and perimeter telemetries.",
    });
  }

  return result;
}

export function getVendorRequisition(id: string, vendorId: string = "ven-falcon"): VendorRequisition | null {
  const reqs = listVendorRequisitions(vendorId);
  return reqs.find((r) => r.id.toUpperCase() === id.toUpperCase()) || null;
}

export function getVendorContracts(vendorId: string = "ven-falcon"): VendorContract[] {
  return VENDOR_CONTRACTS_LIST.filter((c) => c.vendorId === vendorId);
}

export function submitVendorCandidate(
  payload: CandidateSubmissionPayload
): CandidateSubmissionReceipt {
  const req = REQUISITIONS[payload.requisitionId];
  if (!req) {
    throw new Error(`Requisition ${payload.requisitionId} not found.`);
  }

  // Check submission window
  const vendorReq = getVendorRequisition(payload.requisitionId, payload.vendorId);
  if (!vendorReq?.submissionWindow.isOpen) {
    throw new Error(
      `Submission window for ${payload.requisitionId} is closed: ${
        vendorReq?.submissionWindow.closedReason || "Window expired"
      }`
    );
  }

  // Enforce batch limit (max 10 per vendor per requirement)
  const existingSubmissions = CANDIDATES_LIST.filter(
    (c) => c.requisitionId === payload.requisitionId && c.vendorId === payload.vendorId
  );
  if (existingSubmissions.length >= 10) {
    throw new Error(
      `Batch limit reached: Maximum 10 candidate submissions permitted per vendor for this requirement.`
    );
  }

  // Resolve rate according to cost mode
  let resolvedAmountFils = 0;
  let resolvedMonthlyFils = 0;

  if (payload.costMode === "FIXED") {
    if (!payload.fixedAmount || payload.fixedAmount <= 0) {
      throw new Error("Fixed cost mode requires a valid positive amount.");
    }
    resolvedAmountFils = payload.fixedAmount;
    resolvedMonthlyFils = Math.round(payload.fixedAmount / 12);
  } else if (payload.costMode === "NEGOTIABLE") {
    if (!payload.rateCardGradeCode) {
      throw new Error("Negotiable cost mode requires selecting a rate card grade.");
    }
    const rateCards = getVendorRateCards(payload.vendorId);
    const activeRateCard = rateCards.find((rc) => rc.status === "PUBLISHED");
    if (!activeRateCard) {
      throw new Error("No published rate card found for this vendor.");
    }
    const grade = activeRateCard.grades.find((g) => g.gradeCode === payload.rateCardGradeCode);
    if (!grade) {
      throw new Error(`Grade ${payload.rateCardGradeCode} not found on published rate card.`);
    }
    resolvedMonthlyFils = grade.monthlyRate;
    resolvedAmountFils = grade.monthlyRate * 12;
  } else if (payload.costMode === "PRE_AGREED") {
    const contracts = getVendorContracts(payload.vendorId);
    const contract = contracts.find((c) => c.status === "ACTIVE") || VENDOR_CONTRACTS["ct-falcon-001"];
    if (!contract) {
      throw new Error("No active contract with pre-agreed rate found for this vendor.");
    }
    resolvedMonthlyFils = contract.preAgreedMonthlyRate;
    resolvedAmountFils = contract.preAgreedMonthlyRate * 12;
  }

  // Generate candidate ref
  const newRefNum = CANDIDATES_LIST.length + 1;
  const candidateRef = `C-0${newRefNum < 10 ? "0" + newRefNum : newRefNum}`;

  const newCandidate: Candidate = {
    candidateRef,
    requisitionId: payload.requisitionId,
    fullName: payload.candidate.fullName,
    anonymisedRef: `Candidate ${candidateRef}`,
    priority: "P2",
    status: "SOURCING", // maps to "SUBMITTED" on vendor side
    nationality: payload.candidate.nationality,
    residentStatus: payload.candidate.residentStatus,
    timezone: payload.candidate.residentStatus === "ONSHORE" ? "Asia/Dubai" : "Asia/Kolkata",
    experienceYears: payload.candidate.experienceYears,
    noticePeriod: payload.candidate.noticePeriod,
    leadTimeDays: payload.leadTimeDays,
    expectedAnnualCost: resolvedAmountFils,
    approvedBudget: 0, // Hidden from vendor
    vendorId: payload.vendorId,
    vendorHidden: true, // blind review internal rule
    email: payload.candidate.email,
    mobile: payload.candidate.mobile,
  };

  CANDIDATES[candidateRef] = newCandidate;
  CANDIDATES_LIST.push(newCandidate);

  return {
    success: true,
    candidateRef,
    requisitionId: payload.requisitionId,
    positionTitle: req.positionTitle,
    costMode: payload.costMode,
    resolvedAmountFils,
    resolvedMonthlyFils,
    leadTimeDays: payload.leadTimeDays,
    batchSubmissionNumber: existingSubmissions.length + 1,
    maxBatchSize: 10,
    submittedAt: new Date().toISOString(),
    message: `Candidate ${payload.candidate.fullName} successfully submitted against ${req.positionTitle}.`,
  };
}

export function listVendorSubmissions(vendorId: string = "ven-falcon"): VendorSubmissionItem[] {
  const vendorCandidates = CANDIDATES_LIST.filter((c) => c.vendorId === vendorId);

  const items: VendorSubmissionItem[] = vendorCandidates.map((c) => {
    const req = REQUISITIONS[c.requisitionId];
    let vendorStatus: VendorSubmissionStatus = "UNDER_REVIEW";
    let vendorStatusLabel: VendorSubmissionStatusLabel = "Under review";
    let actionRequired = false;

    // Check if there is an interview plan for this candidate
    const plan = INTERVIEW_PLANS_LIST.find((p) => p.candidateRef === c.candidateRef);

    switch (c.status) {
      case "SOURCING":
        vendorStatus = "SUBMITTED";
        vendorStatusLabel = "Submitted";
        break;
      case "SHORTLISTED":
        vendorStatus = "SHORTLISTED";
        vendorStatusLabel = "Shortlisted";
        break;
      case "INTERVIEW_PENDING":
        vendorStatus = "INTERVIEW_PROPOSED";
        vendorStatusLabel = "Interview proposed";
        actionRequired = true;
        break;
      case "INTERVIEW_SCHEDULED":
        vendorStatus = "INTERVIEW_CONFIRMED";
        vendorStatusLabel = "Interview confirmed";
        break;
      case "EVALUATED":
      case "QUALIFIED_PENDING_BUDGET":
        vendorStatus = "UNDER_REVIEW";
        vendorStatusLabel = "Under review";
        break;
      case "QUALIFIED":
      case "ONBOARDING":
      case "HIRED":
        vendorStatus = "QUALIFIED";
        vendorStatusLabel = "Qualified";
        break;
      case "REJECTED":
      case "WITHDRAWN":
        vendorStatus = "NOT_SELECTED";
        vendorStatusLabel = "Not selected";
        break;
      default:
        vendorStatus = "UNDER_REVIEW";
        vendorStatusLabel = "Under review";
        break;
    }

    // Direct plan status alignment if candidate is in interview phase
    if (plan && (c.status === "INTERVIEW_PENDING" || c.status === "INTERVIEW_SCHEDULED")) {
      if (plan.status === "AWAITING_REPLY") {
        vendorStatus = "INTERVIEW_PROPOSED";
        vendorStatusLabel = "Interview proposed";
        actionRequired = true;
      } else if (plan.status === "SCHEDULED" || plan.status === "CONFIRMED" || plan.scheduledSlot) {
        vendorStatus = "INTERVIEW_CONFIRMED";
        vendorStatusLabel = "Interview confirmed";
        actionRequired = false;
      }
    }

    return {
      candidateRef: c.candidateRef,
      candidateName: c.fullName,
      requisitionId: c.requisitionId,
      positionTitle: req?.positionTitle || "Specialist",
      departmentName: req?.departmentName || "Digital Security",
      vendorStatus,
      vendorStatusLabel,
      quotedCost: c.expectedAnnualCost,
      leadTimeDays: c.leadTimeDays,
      submittedAt: c.submittedAt || req?.submittedAt || "2026-08-15T09:00:00Z",
      actionRequired,
      interviewPlanId: plan?.id,
      confirmedInterviewSlot: plan?.scheduledSlot || null,
    };
  });

  // "Interview proposed" rows sort first with a visible badge - this is the vendor's most time-sensitive queue.
  return items.sort((a, b) => {
    if (a.vendorStatus === "INTERVIEW_PROPOSED" && b.vendorStatus !== "INTERVIEW_PROPOSED") return -1;
    if (b.vendorStatus === "INTERVIEW_PROPOSED" && a.vendorStatus !== "INTERVIEW_PROPOSED") return 1;
    return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
  });
}

function formatTimeGST(iso: string): string {
  const d = new Date(iso);
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Dubai",
  }).format(d);
}

function formatSlotDateLabelGST(iso: string): string {
  const d = new Date(iso);
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "Asia/Dubai",
  }).format(d);
}

function formatTimeRangeGST(startIso: string, durationMinutes: number): string {
  const start = new Date(startIso);
  const end = new Date(start.getTime() + durationMinutes * 60 * 1000);
  return `${formatTimeGST(start.toISOString())} – ${formatTimeGST(end.toISOString())} GST`;
}

/**
 * Server Requirement 4: Interviewer identity is never sent on the interview-response route.
 * Renders ONLY as "The hiring team for {Position}."
 * Grep this page and its API response for any interviewer name field - none should be present.
 */
export function getVendorInterviewProposal(
  candidateRef: string,
  vendorId: string = "ven-falcon"
): VendorInterviewProposalData | null {
  const candidate = CANDIDATES[candidateRef];
  if (!candidate || candidate.vendorId !== vendorId) return null;

  const plan = INTERVIEW_PLANS_LIST.find((p) => p.candidateRef === candidateRef);
  if (!plan) return null;

  const req = REQUISITIONS[plan.requisitionId];
  const positionTitle = req?.positionTitle || "Specialist";
  const departmentName = req?.departmentName || "Digital Security";

  // Deadline calculation: amber under 2 days, red under 1
  const replyBy = plan.proposal?.settings?.replyByDate || "2026-09-12";
  const replyDate = new Date(replyBy);
  const simDate = new Date("2026-09-10");
  const diffTime = replyDate.getTime() - simDate.getTime();
  const daysRemaining = Math.max(0, Math.round(diffTime / (1000 * 60 * 60 * 24)));

  let urgencySeverity: "normal" | "amber" | "red" = "normal";
  if (daysRemaining < 1) {
    urgencySeverity = "red";
  } else if (daysRemaining <= 2) {
    urgencySeverity = "amber";
  }

  // Format proposed slots matching TraySlotChip visual style
  const proposedSlots: VendorInterviewProposalSlot[] = (plan.proposal?.slots || []).map((slot, idx) => ({
    slotId: `slot-${idx + 1}-${slot.start}`,
    start: slot.start,
    durationMinutes: slot.durationMinutes,
    dateLabel: formatSlotDateLabelGST(slot.start),
    timeRange: formatTimeRangeGST(slot.start, slot.durationMinutes),
  }));

  let status: VendorInterviewProposalData["status"] = "AWAITING_REPLY";
  let statusLabel = "Action required: select slot";

  if (plan.scheduledSlot || plan.status === "SCHEDULED") {
    status = "CONFIRMED";
    statusLabel = "Interview confirmed";
  } else if (plan.status === "ALTERNATIVE_REQUESTED") {
    status = "ALTERNATIVE_REQUESTED";
    statusLabel = "Alternative slots requested";
  }

  return {
    planId: plan.id,
    candidateRef: candidate.candidateRef,
    candidateName: candidate.fullName,
    requisitionId: plan.requisitionId,
    positionTitle,
    departmentName,
    // Strictly anonymized per Server Requirement 4
    hiringTeam: `The hiring team for ${positionTitle}.`,
    status,
    statusLabel,
    method: plan.proposal?.settings?.method || "ONLINE",
    platform: plan.proposal?.settings?.platform || "MICROSOFT_TEAMS",
    location: plan.proposal?.settings?.location || null,
    replyByDate: replyBy,
    daysRemaining,
    isUrgent: urgencySeverity !== "normal",
    urgencySeverity,
    proposedSlots,
    scheduledSlot: plan.scheduledSlot
      ? {
          start: plan.scheduledSlot.start,
          durationMinutes: plan.scheduledSlot.durationMinutes,
          dateLabel: formatSlotDateLabelGST(plan.scheduledSlot.start),
          timeRange: formatTimeRangeGST(
            plan.scheduledSlot.start,
            plan.scheduledSlot.durationMinutes
          ),
        }
      : null,
    confirmedAt: plan.confirmedAt || null,
    alternativeRequestNote: (plan as any).alternativeRequestNote || null,
  };
}

export function selectVendorInterviewSlot(
  candidateRef: string,
  slotStart: string,
  vendorId: string = "ven-falcon"
): { success: boolean; message: string; proposal: VendorInterviewProposalData } {
  const candidate = CANDIDATES[candidateRef];
  if (!candidate || candidate.vendorId !== vendorId) {
    throw new Error(`Candidate ${candidateRef} not found for vendor ${vendorId}`);
  }

  const plan = INTERVIEW_PLANS_LIST.find((p) => p.candidateRef === candidateRef);
  if (!plan) {
    throw new Error(`Interview plan not found for candidate ${candidateRef}`);
  }

  const matchedSlot = plan.proposal?.slots?.find((s) => s.start === slotStart);
  const duration = matchedSlot ? matchedSlot.durationMinutes : 45;

  // Mutate plan in memory (cross-portal consistency proof point)
  plan.status = "SCHEDULED";
  plan.scheduledSlot = {
    start: slotStart,
    durationMinutes: duration,
  };
  plan.confirmedAt = new Date().toISOString();

  // Mutate candidate status
  candidate.status = "INTERVIEW_SCHEDULED";

  const updatedProposal = getVendorInterviewProposal(candidateRef, vendorId);
  if (!updatedProposal) {
    throw new Error("Failed to load updated interview proposal");
  }

  return {
    success: true,
    message: "Interview slot successfully confirmed and scheduled.",
    proposal: updatedProposal,
  };
}

export function requestVendorAlternativeSlots(
  candidateRef: string,
  note: string,
  vendorId: string = "ven-falcon"
): { success: boolean; message: string; proposal: VendorInterviewProposalData } {
  if (!note || note.trim().length === 0) {
    throw new Error("A note explaining the alternative request is required.");
  }

  const candidate = CANDIDATES[candidateRef];
  if (!candidate || candidate.vendorId !== vendorId) {
    throw new Error(`Candidate ${candidateRef} not found for vendor ${vendorId}`);
  }

  const plan = INTERVIEW_PLANS_LIST.find((p) => p.candidateRef === candidateRef);
  if (!plan) {
    throw new Error(`Interview plan not found for candidate ${candidateRef}`);
  }

  (plan as any).alternativeRequestNote = note.trim();
  plan.status = "ALTERNATIVE_REQUESTED";

  const updatedProposal = getVendorInterviewProposal(candidateRef, vendorId);
  if (!updatedProposal) {
    throw new Error("Failed to load updated interview proposal");
  }

  return {
    success: true,
    message: "Alternative slot request submitted to the hiring team.",
    proposal: updatedProposal,
  };
}

export function getVendorRateCards(vendorId: string = "ven-falcon"): RateCard[] {
  return RATE_CARDS_LIST.filter((rc) => rc.vendorId === vendorId);
}

export function getVendorRateCard(id: string, vendorId: string = "ven-falcon"): RateCard | null {
  const card = RATE_CARDS[id];
  if (!card || card.vendorId !== vendorId) return null;
  return card;
}

export function createOrUpdateVendorRateCard(card: RateCard): RateCard {
  RATE_CARDS[card.id] = card;
  const idx = RATE_CARDS_LIST.findIndex((rc) => rc.id === card.id);
  if (idx >= 0) {
    RATE_CARDS_LIST[idx] = card;
  } else {
    RATE_CARDS_LIST.unshift(card);
  }
  return card;
}

export function submitVendorRateCardForApproval(
  id: string,
  vendorId: string = "ven-falcon"
): RateCard {
  const card = RATE_CARDS[id];
  if (!card || card.vendorId !== vendorId) {
    throw new Error(`Rate card ${id} not found.`);
  }
  if (card.status !== "DRAFT") {
    throw new Error(
      `Only rate cards in Draft status can be submitted for approval (current status: ${card.status}).`
    );
  }
  card.status = "SUBMITTED";
  const idx = RATE_CARDS_LIST.findIndex((rc) => rc.id === id);
  if (idx >= 0) {
    RATE_CARDS_LIST[idx] = card;
  }
  return card;
}

export function publishVendorRateCard(
  id: string,
  vendorId: string = "ven-falcon"
): RateCard {
  const card = RATE_CARDS[id];
  if (!card || card.vendorId !== vendorId) {
    throw new Error(`Rate card ${id} not found.`);
  }
  card.status = "PUBLISHED";
  const idx = RATE_CARDS_LIST.findIndex((rc) => rc.id === id);
  if (idx >= 0) {
    RATE_CARDS_LIST[idx] = card;
  }
  return card;
}

export function exportRateCardTemplateCsv(): string {
  const header =
    "Template,GradeCode,Level,RoleTitle,MinSalaryAED,MaxSalaryAED,ServiceChargePercent,EffectiveFrom,EffectiveTo";
  const rows = [
    "DIEZA_PREMISES,G6,Junior,Associate Systems / Security Analyst,14000,18000,15,2026-01-01,2026-12-31",
    "DIEZA_PREMISES,G7,Mid-Level,Cybersecurity Analyst / Infrastructure Engineer,18000,24000,15,2026-01-01,2026-12-31",
    "DIEZA_PREMISES,G8,Senior,Senior Cybersecurity Specialist / Systems Architect,24000,32000,14,2026-01-01,2026-12-31",
    "DIEZA_PREMISES,G9,Lead,Principal Security Architect / Project Director,32000,42000,12,2026-01-01,2026-12-31",
  ];
  return [header, ...rows].join("\n");
}

export function parseRateCardCsv(
  csvContent: string,
  vendorId: string = "ven-falcon"
): {
  template: RateCardTemplate;
  effectiveFrom: string;
  effectiveTo: string;
  grades: RateCardGrade[];
} {
  const lines = csvContent
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith("#"));

  if (lines.length < 2) {
    throw new Error("CSV must contain at least a header row and one grade data row.");
  }

  // Parse header
  const header = lines[0].split(",").map((col) => col.trim().toLowerCase());
  const templateIdx = header.findIndex((h) => h.includes("template"));
  const gradeIdx = header.findIndex((h) => h.includes("grade"));
  const levelIdx = header.findIndex((h) => h.includes("level"));
  const titleIdx = header.findIndex((h) => h.includes("role") || h.includes("title"));
  const minSalIdx = header.findIndex((h) => h.includes("min"));
  const maxSalIdx = header.findIndex((h) => h.includes("max"));
  const serviceChargeIdx = header.findIndex((h) => h.includes("service") || h.includes("charge"));
  const effectiveFromIdx = header.findIndex((h) => h.includes("from") || h.includes("start"));
  const effectiveToIdx = header.findIndex((h) => h.includes("to") || h.includes("end"));

  const grades: RateCardGrade[] = [];
  let detectedTemplate: RateCardTemplate = "DIEZA_PREMISES";
  let detectedFrom = "2026-01-01";
  let detectedTo = "2026-12-31";

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",").map((c) => c.trim());
    if (cols.length < 4) continue;

    if (templateIdx >= 0 && cols[templateIdx]) {
      const rawTmpl = cols[templateIdx].toUpperCase().replace(/\s+/g, "_");
      if (
        rawTmpl === "DIEZA_PREMISES" ||
        rawTmpl === "UAE_REMOTE_WFH" ||
        rawTmpl === "UAE_REMOTE_OFFICE" ||
        rawTmpl === "REMOTE_ABROAD" ||
        rawTmpl === "PRE_AGREED"
      ) {
        detectedTemplate = rawTmpl as RateCardTemplate;
      }
    }

    if (effectiveFromIdx >= 0 && cols[effectiveFromIdx]) {
      detectedFrom = cols[effectiveFromIdx];
    }
    if (effectiveToIdx >= 0 && cols[effectiveToIdx]) {
      detectedTo = cols[effectiveToIdx];
    }

    const gradeCode = (gradeIdx >= 0 && cols[gradeIdx] ? cols[gradeIdx] : `G${i + 5}`).toUpperCase();
    const level = levelIdx >= 0 && cols[levelIdx] ? cols[levelIdx] : (i <= 2 ? "Junior" : "Senior");
    const roleTitle = titleIdx >= 0 && cols[titleIdx] ? cols[titleIdx] : `IT Specialist (${gradeCode})`;
    const minSalaryAed = parseFloat(minSalIdx >= 0 ? cols[minSalIdx] : "15000") || 15000;
    const maxSalaryAed = parseFloat(maxSalIdx >= 0 ? cols[maxSalIdx] : "20000") || 20000;
    const serviceChargePercent = parseFloat(serviceChargeIdx >= 0 ? cols[serviceChargeIdx] : "15") || 15;

    // Convert AED to fils (1 AED = 100 fils)
    const minSalary = Math.round(minSalaryAed * 100);
    const maxSalary = Math.round(maxSalaryAed * 100);
    const midSalaryAed = (minSalaryAed + maxSalaryAed) / 2;
    const monthlyRateAed = midSalaryAed * (1 + serviceChargePercent / 100);
    const monthlyRate = Math.round(monthlyRateAed * 100);
    const dailyRate = Math.round(monthlyRate / 22);

    grades.push({
      gradeCode,
      level,
      roleTitle,
      minSalary,
      maxSalary,
      serviceChargePercent,
      monthlyRate,
      dailyRate,
    });
  }

  if (grades.length === 0) {
    throw new Error("No valid grade entries could be parsed from the CSV file.");
  }

  return {
    template: detectedTemplate,
    effectiveFrom: detectedFrom,
    effectiveTo: detectedTo,
    grades,
  };
}

export function getVendorComplianceDocuments(vendorId: string = "ven-falcon"): VendorComplianceDocument[] {
  return VENDOR_COMPLIANCE_DOCUMENTS_LIST.filter((doc) => doc.vendorId === vendorId);
}

export function listVendorOnboardingCases(vendorId: string = "ven-falcon"): OnboardingCase[] {
  const seen = new Set<string>();
  const cases: OnboardingCase[] = [];

  for (const onb of ONBOARDING_CASES_LIST) {
    if (seen.has(onb.id)) continue;
    seen.add(onb.id);
    if (onb.vendorId !== vendorId) continue;

    const candidate = CANDIDATES[onb.candidateRef];
    if (candidate && (candidate.status === "ONBOARDING" || candidate.status === "HIRED")) {
      cases.push(onb);
    }
  }

  return cases;
}

export function getVendorProfile(vendorId: string = "ven-falcon"): VendorProfileData | null {
  return VENDOR_PROFILES[vendorId] || null;
}

export function listVendorSupportMessages(vendorId: string = "ven-falcon"): VendorSupportMessage[] {
  return VENDOR_SUPPORT_MESSAGES[vendorId] || [];
}

export function sendVendorSupportMessage(
  payload: Omit<VendorSupportMessage, "id" | "sentAt">
): VendorSupportMessage {
  const list = VENDOR_SUPPORT_MESSAGES[payload.vendorId] || [];
  const newMsg: VendorSupportMessage = {
    ...payload,
    id: `msg-sup-${Date.now()}`,
    sentAt: new Date().toISOString(),
  };
  list.push(newMsg);
  VENDOR_SUPPORT_MESSAGES[payload.vendorId] = list;
  return newMsg;
}

export function uploadOrReplaceVendorComplianceDocument(
  docId: string,
  file: {
    id: string;
    name: string;
    sizeBytes: number;
    uploadedAt?: string;
  },
  vendorId: string = "ven-falcon"
): VendorComplianceDocument {
  const doc = VENDOR_COMPLIANCE_DOCUMENTS[docId];
  if (!doc || doc.vendorId !== vendorId) {
    throw new Error(`Compliance document ${docId} not found.`);
  }
  doc.file = {
    id: file.id,
    name: file.name,
    sizeBytes: file.sizeBytes,
    uploadedAt: file.uploadedAt || new Date().toISOString(),
  };
  doc.status = "ACTIVE";
  const idx = VENDOR_COMPLIANCE_DOCUMENTS_LIST.findIndex((d) => d.id === docId);
  if (idx >= 0) {
    VENDOR_COMPLIANCE_DOCUMENTS_LIST[idx] = doc;
  }
  return doc;
}

// ============================================================================
// 12. Candidate Portal (Third Surface)
// Specification: docs/CANDIDATE-JOINING-READINESS.md Part 1 & Part 4
// ============================================================================

/**
 * Resolves a candidate access token from memory.
 * Checks non-revoked and non-expired.
 */
export function getCandidateAccessToken(rawToken: string): CandidateAccessToken | null {
  if (!rawToken) return null;
  const cleanToken = rawToken.trim();

  const tokenRecord = Object.values(CANDIDATE_ACCESS_TOKENS).find(
    (t) => t.rawToken === cleanToken || t.tokenId === cleanToken,
  );

  if (!tokenRecord) return null;

  // Non-enumeration check: revoked or expired tokens return null
  if (tokenRecord.revokedAt) return null;
  if (new Date(tokenRecord.expiresAt).getTime() <= Date.now()) return null;

  return tokenRecord;
}

export function listCandidateAccessTokens(): CandidateAccessToken[] {
  return [...CANDIDATE_ACCESS_TOKENS_LIST];
}

/**
 * Returns candidate joining readiness portal data strictly scoped to the token's case.
 * Enforces Server Requirement 1: Candidate Data Isolation.
 * Enforces Server Requirement 2: Location-driven task synthesis.
 * Enforces Server Requirement 3: Internal Reviewer Anonymity.
 * Enforces Server Requirement 5: Authoritative server-computed readiness score and gates.
 */
export function getCandidatePortalData(rawToken: string): CandidatePortalResponse | null {
  const tokenRecord = getCandidateAccessToken(rawToken);
  if (!tokenRecord) return null;

  const onb = getOnboarding(tokenRecord.onboardingId);
  if (!onb) return null;

  const isOnshore = onb.residentStatus === "ONSHORE";

  // Location-driven task generation (§2.2 & Part 4)
  const tasks: CandidatePortalTask[] = isOnshore
    ? [
        {
          code: "PRE_EMPLOYMENT_MEDICAL",
          label: "Pre-employment medical",
          detail: "Book a slot at an accredited clinic",
          dueAt: "2026-08-26",
          status: "DANGER",
          action: "BOOK_SLOT",
          onshoreOnly: true,
        },
        {
          code: "BIOMETRIC_ENROLLMENT",
          label: "Biometric enrollment",
          detail: "Saned center biometric appointment",
          dueAt: "2026-08-28",
          status: "WARNING",
          action: "BOOK_SLOT",
          onshoreOnly: true,
        },
        {
          code: "PASSPORT_PHOTO_UPLOAD",
          label: "Passport photo upload",
          detail: "White background, JPEG/PNG only",
          dueAt: "2026-08-29",
          status: "INFO",
          action: "UPLOAD",
          onshoreOnly: true,
        },
        {
          code: "NDA_SIGNATURE",
          label: "Non-Disclosure Agreement",
          detail: "Electronic signature required",
          dueAt: "2026-08-30",
          status: onb.signature?.envelopeStatus === "SIGNED" ? "COMPLETE" : "PENDING",
          action: onb.signature?.envelopeStatus === "SIGNED" ? "VIEW_SIGNED" : "NONE",
          onshoreOnly: false,
        },
        {
          code: "CONFIRM_JOINING_DATE",
          label: "Confirm joining date",
          detail: "Initial joining date acceptance",
          dueAt: "2026-08-25",
          status: "COMPLETE",
          action: "CONFIRM_DATE",
          onshoreOnly: false,
        },
      ]
    : [
        {
          code: "REMOTE_ACCESS_READINESS",
          label: "Remote access readiness",
          detail: "Confirm MFA, VPN, and secure workspace readiness",
          dueAt: "2026-09-02",
          status: "INFO",
          action: "CONFIRM_READINESS",
          onshoreOnly: false,
        },
        {
          code: "NDA_SIGNATURE",
          label: "Non-Disclosure Agreement",
          detail: "Electronic signature required",
          dueAt: "2026-09-03",
          status: onb.signature?.envelopeStatus === "SIGNED" ? "COMPLETE" : "PENDING",
          action: onb.signature?.envelopeStatus === "SIGNED" ? "VIEW_SIGNED" : "NONE",
          onshoreOnly: false,
        },
        {
          code: "CONFIRM_JOINING_DATE",
          label: "Confirm joining date",
          detail: "Initial joining date acceptance",
          dueAt: "2026-09-01",
          status: "COMPLETE",
          action: "CONFIRM_DATE",
          onshoreOnly: false,
        },
      ];

  const blockingTasksRemaining = tasks.filter(
    (t) => t.status !== "COMPLETE",
  ).length;

  const completedDocsCount = onb.documents.filter(
    (d) => d.status === "APPROVED" || d.status === "UPLOADED" || d.status === "UNDER_REVIEW",
  ).length;

  return {
    valid: true,
    onboardingCase: onb.id,
    candidateRef: onb.candidateRef,
    candidateName: onb.candidate.fullName,
    candidateFirstName: onb.candidate.fullName.split(" ")[0],
    position: onb.positionTitle,
    residentStatus: onb.residentStatus,
    expectedJoining: onb.candidate.expectedJoining,
    readinessScore: isOnshore ? 78 : 85,
    kpi: {
      documents: {
        completed: completedDocsCount,
        total: onb.documents.length,
      },
      offerReference: "LPO-260771",
      biometricAppointment: isOnshore ? "SCHEDULED" : "NOT_REQUIRED",
      joiningConfirmed: true,
    },
    tasks,
    stepper: [
      {
        stage: "DOCUMENTS_SUBMITTED",
        label: "Documents Submitted",
        state: "COMPLETE",
        completedAt: "2026-08-24T10:15:00Z",
        actorRole: "onboarding team",
      },
      {
        stage: "E_SIGNATURE",
        label: "E-signature",
        state: "COMPLETE",
        completedAt: "2026-08-24T14:30:00Z",
        actorRole: "onboarding team",
      },
      {
        stage: "DIEZ_REVIEW",
        label: "DIEZ Review",
        state: "COMPLETE",
        completedAt: "2026-08-25T11:00:00Z",
        actorRole: "onboarding team",
      },
      {
        stage: "JOINING_READINESS",
        label: "Joining Readiness",
        state: "CURRENT",
        completedAt: null,
        actorRole: null,
      },
      {
        stage: "JOINED",
        label: "Joined",
        state: "PENDING",
        completedAt: null,
        actorRole: null,
      },
    ],
    firstDay: {
      location: isOnshore
        ? "DIEZ Headquarters, Building D2, 4th Floor, Dubai Silicon Oasis"
        : "Remote (Virtual Orientation via Microsoft Teams)",
      reportingTime: "08:30 AM GST",
      dressCode: isOnshore
        ? "Business Professional / Formal"
        : "Business Casual",
      whatToBring: isOnshore
        ? [
            "Original Passport",
            "Original Emirates ID (if resident)",
            "Attested Degree Certificate",
            "Printed Saned Biometric Receipt",
          ]
        : [
            "Scanned Passport Copy",
            "Digital Signed Offer & NDA",
            "Broadband Speed Test Confirmation",
          ],
      itReadiness: "IN_PROGRESS",
    },
    coordinator: {
      name: "Layla Hassan",
      role: "Onboarding Coordinator",
      email: "layla.hassan@falcontech.ae",
      phone: "+971 4 234 5678",
    },
    readyToConfirm: blockingTasksRemaining === 0,
    blockingTasksRemaining,
  };
}



