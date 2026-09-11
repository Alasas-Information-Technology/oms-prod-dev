/**
 * Canonical Seed Data for DIEZ OMS
 * Specification: docs/DEMO-DATA-INTEGRATION.md Parts 3 and 4
 *
 * Current Anchor Date: 2026-09-09T13:00:00Z
 * All monetary amounts are integers in minor units (fils: 1 AED = 100 fils).
 * Cross-entity numeric invariants: C-014 cost in Evaluation matches Amendment identically.
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
  RateCard,
  VendorComplianceDocument,
  VendorContract,
} from "./entities";

// ============================================================================
// 1. Requisitions (Fourteen Core + 0074-R Replacement)
// ============================================================================

export const REQUISITIONS: Record<string, Requisition> = {
  // --------------------------------------------------------------------------
  // 0148 — Senior Cybersecurity Analyst (Flagship: Amendment in progress)
  // --------------------------------------------------------------------------
  "OMS-2026-0148": {
    id: "OMS-2026-0148",
    positionTitle: "Senior Cybersecurity Analyst",
    departmentId: "dept-digital-security",
    departmentName: "Digital Security",
    requestorId: "usr-mariam",
    currentStage: "AMENDMENT",
    stageLabel: "Amendment in progress",
    positions: {
      required: 2,
      filled: 0,
      inProgress: 2,
    },
    engagementMonths: 12,
    workLocation: "DIEZ_PREMISES",
    expectedStartDate: "2026-09-01",
    salaryGrade: "G8",
    candidateRoute: "UNKNOWN",
    justification:
      "Critical expansion of the Security Operations Center (SOC) to address increased threat intelligence requirements and 24/7 incident response capability.",
    budgetAmount: 62000000, // AED 620,000.00 (fils) for 2 positions
    currency: "AED",
    fundingRoute: "BUDGETED",
    allocations: [
      {
        budgetLineId: "line-cs-dig-001",
        code: "CS-DIG-001",
        name: "Cybersecurity Services FY2026",
        amount: 40000000, // AED 400,000.00
      },
      {
        budgetLineId: "line-cs-dig-002",
        code: "CS-DIG-002",
        name: "Digital Transformation FY2026",
        amount: 22000000, // AED 220,000.00
      },
    ],
    approvalRoute: [
      {
        index: 1,
        stageCode: "REQUESTOR",
        label: "Requestor Submission",
        state: "COMPLETE",
        userId: "usr-mariam",
        userName: "Mariam Al Mansoori",
        actionedAt: "2026-08-04T09:18:00Z",
        comment: "Request submitted for approval.",
      },
      {
        index: 2,
        stageCode: "LINE_MANAGER",
        label: "Line Manager",
        state: "COMPLETE",
        userId: "usr-omar",
        userName: "Omar Al Hashmi",
        actionedAt: "2026-08-04T14:42:00Z",
        comment: "Justification and budget confirmed.",
      },
      {
        index: 3,
        stageCode: "SECTION_HEAD",
        label: "Section Head",
        state: "COMPLETE",
        userId: "usr-fatima",
        userName: "Fatima Al Marri",
        actionedAt: "2026-08-05T10:06:00Z",
        comment: "Approved for technical scoping.",
      },
      {
        index: 4,
        stageCode: "HOD",
        label: "Head of Department",
        state: "COMPLETE",
        userId: "usr-khalid",
        userName: "Khalid Al Suwaidi",
        actionedAt: "2026-08-05T16:30:00Z",
        comment: "Authorized under FY2026 security budget.",
      },
      {
        index: 5,
        stageCode: "HR_REVIEW",
        label: "HR Review",
        state: "COMPLETE",
        userId: "usr-aisha",
        userName: "Aisha Al Nuaimi",
        actionedAt: "2026-08-06T11:15:00Z",
        comment: "Role grade G8 verified, market rate aligned.",
      },
      {
        index: 6,
        stageCode: "PROCUREMENT",
        label: "Procurement Sourcing",
        state: "COMPLETE",
        userId: "usr-salma",
        userName: "Salma Al Ketbi",
        actionedAt: "2026-08-07T08:45:00Z",
        comment: "Sourcing initiated via accredited vendors.",
      },
    ],
    submittedAt: "2026-08-04T09:18:00Z",
    createdAt: "2026-08-01T10:00:00Z",
    updatedAt: "2026-08-12T11:46:00Z",
    sla: {
      targetDays: 3,
      dueAt: "2026-08-07T09:18:00Z",
      daysRemaining: 0,
      breached: false,
      overdueDays: 0,
    },
    flags: ["BUDGET_VERIFIED", "AMENDMENT_IN_PROGRESS"],
    evidence: {
      jobDescriptionAttached: true,
      supportingDocumentCount: 3,
      adHierarchyVerified: true,
    },
    attachments: [
      {
        id: "att-0148-jd",
        name: "JD_Senior_Cybersecurity_Analyst_G8.pdf",
        sizeBytes: 1542000,
        uploadedAt: "2026-08-04T09:15:00Z",
        url: "https://storage.diez.ae/requests/att-0148-jd.pdf",
      },
      {
        id: "att-0148-struct",
        name: "SOC_24x7_Organogram_Expansion.pdf",
        sizeBytes: 2311000,
        uploadedAt: "2026-08-04T09:16:00Z",
        url: "https://storage.diez.ae/requests/att-0148-struct.pdf",
      },
    ],
  },

  // --------------------------------------------------------------------------
  // 0139 — Data Governance Specialist (HR Review, returned)
  // --------------------------------------------------------------------------
  "OMS-2026-0139": {
    id: "OMS-2026-0139",
    positionTitle: "Data Governance Specialist",
    departmentId: "dept-data-mgmt",
    departmentName: "Data Management",
    requestorId: "usr-mariam",
    currentStage: "HR_REVIEW",
    stageLabel: "HR Review (Returned)",
    positions: {
      required: 1,
      filled: 0,
      inProgress: 1,
    },
    engagementMonths: 12,
    workLocation: "DIEZ_PREMISES",
    expectedStartDate: "2026-10-01",
    salaryGrade: "G7",
    candidateRoute: "UNKNOWN",
    justification:
      "Implementation of enterprise data catalog, data classification standards, and compliance governance framework.",
    budgetAmount: 28500000, // AED 285,000.00
    currency: "AED",
    fundingRoute: "BUDGETED",
    allocations: [
      {
        budgetLineId: "line-dm-dat-001",
        code: "DM-DAT-001",
        name: "Data Governance & Analytics FY2026",
        amount: 28500000,
      },
    ],
    approvalRoute: [
      {
        index: 1,
        stageCode: "REQUESTOR",
        label: "Requestor",
        state: "COMPLETE",
        userId: "usr-mariam",
        userName: "Mariam Al Mansoori",
        actionedAt: "2026-08-30T10:00:00Z",
      },
      {
        index: 2,
        stageCode: "LINE_MANAGER",
        label: "Line Manager",
        state: "COMPLETE",
        userId: "usr-omar",
        userName: "Omar Al Hashmi",
        actionedAt: "2026-08-30T15:30:00Z",
      },
      {
        index: 3,
        stageCode: "SECTION_HEAD",
        label: "Section Head",
        state: "COMPLETE",
        userId: "usr-fatima",
        userName: "Fatima Al Marri",
        actionedAt: "2026-08-31T09:15:00Z",
      },
      {
        index: 4,
        stageCode: "HOD",
        label: "Head of Department",
        state: "COMPLETE",
        userId: "usr-khalid",
        userName: "Khalid Al Suwaidi",
        actionedAt: "2026-08-31T14:40:00Z",
      },
      {
        index: 5,
        stageCode: "HR_REVIEW",
        label: "HR Review",
        state: "CURRENT",
        userId: "usr-aisha",
        userName: "Aisha Al Nuaimi",
        actionedAt: null,
      },
    ],
    submittedAt: "2026-08-30T10:00:00Z",
    createdAt: "2026-08-28T09:00:00Z",
    updatedAt: "2026-09-08T14:20:00Z", // Responded to clarification 1 day ago
    sla: {
      targetDays: 3,
      dueAt: "2026-09-11T14:20:00Z",
      daysRemaining: 2,
      breached: false,
      overdueDays: 0,
    },
    flags: ["BUDGET_VERIFIED", "RETURNED"],
    evidence: {
      jobDescriptionAttached: true,
      supportingDocumentCount: 2,
      adHierarchyVerified: true,
    },
    attachments: [
      {
        id: "att-0139-plan",
        name: "Approved_Data_Gov_Project_Plan_v2.pdf",
        sizeBytes: 3120000,
        uploadedAt: "2026-09-08T14:18:00Z",
        url: "https://storage.diez.ae/requests/att-0139-plan.pdf",
      },
    ],
  },

  // --------------------------------------------------------------------------
  // 0141 — Cloud Security Engineer (Procurement sourcing, empty candidates)
  // --------------------------------------------------------------------------
  "OMS-2026-0141": {
    id: "OMS-2026-0141",
    positionTitle: "Cloud Security Engineer",
    departmentId: "dept-it-infra",
    departmentName: "IT Infrastructure",
    requestorId: "usr-ahmed-z",
    currentStage: "SOURCING",
    stageLabel: "Procurement sourcing",
    positions: {
      required: 1,
      filled: 0,
      inProgress: 0,
    },
    engagementMonths: 12,
    workLocation: "HYBRID",
    expectedStartDate: "2026-10-15",
    salaryGrade: "G8",
    candidateRoute: "UNKNOWN",
    justification: "AWS and Azure security posture hardening and CI/CD security pipeline enforcement.",
    budgetAmount: 35000000, // AED 350,000.00
    currency: "AED",
    fundingRoute: "BUDGETED",
    allocations: [
      {
        budgetLineId: "line-it-inf-001",
        code: "IT-INF-001",
        name: "Cloud Infrastructure & Architecture FY2026",
        amount: 35000000,
      },
    ],
    approvalRoute: [
      { index: 1, stageCode: "REQUESTOR", label: "Requestor", state: "COMPLETE", userId: "usr-ahmed-z", actionedAt: "2026-08-20T08:00:00Z" },
      { index: 2, stageCode: "HOD", label: "Head of Department", state: "COMPLETE", userId: "usr-mona", actionedAt: "2026-08-21T11:00:00Z" },
      { index: 3, stageCode: "HR_REVIEW", label: "HR Review", state: "COMPLETE", userId: "usr-aisha", actionedAt: "2026-08-22T14:00:00Z" },
      { index: 4, stageCode: "PROCUREMENT", label: "Procurement Sourcing", state: "CURRENT", userId: "usr-salma", actionedAt: null },
    ],
    submittedAt: "2026-08-20T08:00:00Z",
    createdAt: "2026-08-18T10:00:00Z",
    updatedAt: "2026-08-22T14:00:00Z",
    sla: {
      targetDays: 14,
      dueAt: "2026-09-12T14:00:00Z",
      daysRemaining: 3,
      breached: false,
      overdueDays: 0,
    },
    flags: ["BUDGET_VERIFIED", "SOURCING"],
    evidence: {
      jobDescriptionAttached: true,
      supportingDocumentCount: 1,
      adHierarchyVerified: true,
    },
    attachments: [],
  },

  // --------------------------------------------------------------------------
  // 0143 — Cloud Engineer (Awaiting requester clarification)
  // --------------------------------------------------------------------------
  "OMS-2026-0143": {
    id: "OMS-2026-0143",
    positionTitle: "Cloud Engineer",
    departmentId: "dept-it-infra",
    departmentName: "IT Infrastructure",
    requestorId: "usr-ahmed-z",
    currentStage: "CLARIFICATION",
    stageLabel: "Awaiting requester",
    positions: {
      required: 1,
      filled: 0,
      inProgress: 1,
    },
    engagementMonths: 12,
    workLocation: "DIEZ_PREMISES",
    expectedStartDate: "2026-11-01",
    salaryGrade: "G7",
    candidateRoute: "UNKNOWN",
    justification: "Support multi-cloud landing zones and Kubernetes cluster orchestration.",
    budgetAmount: 31000000, // AED 310,000.00
    currency: "AED",
    fundingRoute: "BUDGETED",
    allocations: [
      {
        budgetLineId: "line-it-inf-001",
        code: "IT-INF-001",
        name: "Cloud Infrastructure & Architecture FY2026",
        amount: 31000000,
      },
    ],
    approvalRoute: [
      { index: 1, stageCode: "REQUESTOR", label: "Requestor", state: "COMPLETE", userId: "usr-ahmed-z", actionedAt: "2026-09-01T09:00:00Z" },
      { index: 2, stageCode: "HOD", label: "Head of Department", state: "COMPLETE", userId: "usr-mona", actionedAt: "2026-09-02T16:00:00Z" },
      { index: 3, stageCode: "HR_REVIEW", label: "HR Review", state: "CURRENT", userId: "usr-aisha", actionedAt: null },
    ],
    submittedAt: "2026-09-01T09:00:00Z",
    createdAt: "2026-08-30T11:00:00Z",
    updatedAt: "2026-09-07T10:30:00Z",
    sla: {
      targetDays: 30,
      dueAt: "2026-10-07T23:59:59Z",
      daysRemaining: 28,
      breached: false,
      overdueDays: 0,
    },
    flags: ["BUDGET_VERIFIED", "AWAITING_REQUESTER"],
    evidence: {
      jobDescriptionAttached: true,
      supportingDocumentCount: 1,
      adHierarchyVerified: true,
    },
    attachments: [],
  },

  // --------------------------------------------------------------------------
  // 0128 — PMO Analyst (HR Review, overdue — no Section Head in chain)
  // --------------------------------------------------------------------------
  "OMS-2026-0128": {
    id: "OMS-2026-0128",
    positionTitle: "PMO Analyst",
    departmentId: "dept-pmo",
    departmentName: "Project Management Office",
    requestorId: "usr-rashid-f",
    currentStage: "HR_REVIEW",
    stageLabel: "HR Review (Overdue)",
    positions: {
      required: 1,
      filled: 0,
      inProgress: 1,
    },
    engagementMonths: 12,
    workLocation: "DIEZ_PREMISES",
    expectedStartDate: "2026-10-01",
    salaryGrade: "G6",
    candidateRoute: "UNKNOWN",
    justification: "Strategic portfolio tracking, project dashboards, and executive reporting governance.",
    budgetAmount: 22000000, // AED 220,000.00
    currency: "AED",
    fundingRoute: "BUDGETED",
    allocations: [
      {
        budgetLineId: "line-pmo-prj-001",
        code: "PMO-PRJ-001",
        name: "Strategic PMO & Delivery FY2026",
        amount: 22000000,
      },
    ],
    approvalRoute: [
      { index: 1, stageCode: "REQUESTOR", label: "Requestor", state: "COMPLETE", userId: "usr-rashid-f", userName: "Rashid Al Falasi", actionedAt: "2026-09-04T10:00:00Z" },
      { index: 2, stageCode: "HOD", label: "Head of Department", state: "COMPLETE", userId: "usr-youssef-b", userName: "Youssef Al Blooshi", actionedAt: "2026-09-05T09:30:00Z" },
      { index: 3, stageCode: "HR_REVIEW", label: "HR Review", state: "CURRENT", userId: "usr-aisha", userName: "Aisha Al Nuaimi", actionedAt: null },
      { index: 4, stageCode: "PROCUREMENT", label: "Procurement Sourcing", state: "PENDING", userId: "usr-salma", actionedAt: null },
    ],
    submittedAt: "2026-09-04T10:00:00Z", // 5 days ago
    createdAt: "2026-09-02T08:00:00Z",
    updatedAt: "2026-09-05T09:30:00Z",
    sla: {
      targetDays: 3,
      dueAt: "2026-09-07T09:30:00Z", // 2 days overdue
      daysRemaining: -2,
      breached: true,
      overdueDays: 2,
    },
    flags: ["OVERDUE", "VARIABLE_ROUTE"],
    evidence: {
      jobDescriptionAttached: true,
      supportingDocumentCount: 1,
      adHierarchyVerified: true,
    },
    attachments: [],
  },

  // --------------------------------------------------------------------------
  // 0152 — Financial Compliance Officer (Draft — tests 60-day purge notice)
  // --------------------------------------------------------------------------
  "OMS-2026-0152": {
    id: "OMS-2026-0152",
    positionTitle: "Financial Compliance Officer",
    departmentId: "dept-finance",
    departmentName: "Finance",
    requestorId: "usr-hessa",
    currentStage: "DRAFT",
    stageLabel: "Draft",
    positions: {
      required: 1,
      filled: 0,
      inProgress: 0,
    },
    engagementMonths: 12,
    workLocation: "DIEZ_PREMISES",
    expectedStartDate: "2026-11-15",
    salaryGrade: "G7",
    candidateRoute: "UNKNOWN",
    justification: "Internal audits, compliance monitoring, and quarterly financial reconciliation support.",
    budgetAmount: 26000000, // AED 260,000.00
    currency: "AED",
    fundingRoute: "BUDGETED",
    allocations: [
      {
        budgetLineId: "line-fin-ops-001",
        code: "FIN-OPS-001",
        name: "Financial Compliance & Operations FY2026",
        amount: 26000000,
      },
    ],
    approvalRoute: [
      { index: 1, stageCode: "REQUESTOR", label: "Requestor", state: "PENDING", userId: "usr-hessa", actionedAt: null },
      { index: 2, stageCode: "HOD", label: "Head of Department", state: "PENDING", userId: "usr-rashid-m", actionedAt: null },
      { index: 3, stageCode: "HR_REVIEW", label: "HR Review", state: "PENDING", userId: "usr-aisha", actionedAt: null },
    ],
    submittedAt: null,
    createdAt: "2026-08-25T11:00:00Z", // 15 days ago (45 days remaining until 60-day purge)
    updatedAt: "2026-08-25T11:00:00Z",
    flags: ["DRAFT", "PURGE_WATCH"],
    evidence: {
      jobDescriptionAttached: false,
      supportingDocumentCount: 0,
      adHierarchyVerified: false,
    },
    attachments: [],
  },

  // --------------------------------------------------------------------------
  // 0155 — HR Coordinator (Awaiting Line Manager — SoD edge case)
  // --------------------------------------------------------------------------
  "OMS-2026-0155": {
    id: "OMS-2026-0155",
    positionTitle: "HR Coordinator",
    departmentId: "dept-hr",
    departmentName: "Human Resources",
    requestorId: "usr-aisha", // Aisha requests for her own department
    currentStage: "PENDING_APPROVAL",
    stageLabel: "Awaiting Line Manager",
    positions: {
      required: 1,
      filled: 0,
      inProgress: 0,
    },
    engagementMonths: 12,
    workLocation: "DIEZ_PREMISES",
    expectedStartDate: "2026-10-01",
    salaryGrade: "G5",
    candidateRoute: "UNKNOWN",
    justification: "Coordination of workforce compliance, visa paperwork, and HR onboarding documentation.",
    budgetAmount: 18000000, // AED 180,000.00
    currency: "AED",
    fundingRoute: "BUDGETED",
    allocations: [
      {
        budgetLineId: "line-hr-tal-001",
        code: "HR-TAL-001",
        name: "People & Talent Management FY2026",
        amount: 18000000,
      },
    ],
    approvalRoute: [
      {
        index: 1,
        stageCode: "REQUESTOR",
        label: "Requestor",
        state: "COMPLETE",
        userId: "usr-aisha",
        userName: "Aisha Al Nuaimi",
        actionedAt: "2026-09-08T09:00:00Z",
      },
      {
        index: 2,
        stageCode: "LINE_MANAGER",
        label: "Acting Line Manager",
        state: "CURRENT",
        userId: "usr-rashid-m", // Rashid Al Mansoori acting for SoD
        userName: "Rashid Al Mansoori",
        actionedAt: null,
      },
      {
        index: 3,
        stageCode: "HOD",
        label: "Head of Department",
        state: "PENDING",
        userId: "usr-khalid",
        actionedAt: null,
      },
    ],
    submittedAt: "2026-09-08T09:00:00Z", // 1 day ago
    createdAt: "2026-09-07T14:00:00Z",
    updatedAt: "2026-09-08T09:00:00Z",
    sla: {
      targetDays: 3,
      dueAt: "2026-09-11T09:00:00Z",
      daysRemaining: 2,
      breached: false,
      overdueDays: 0,
    },
    flags: ["SEGREGATION_OF_DUTIES_RULE", "HR_INTERNAL"],
    evidence: {
      jobDescriptionAttached: true,
      supportingDocumentCount: 1,
      adHierarchyVerified: true,
    },
    attachments: [],
  },

  // --------------------------------------------------------------------------
  // 0119 — SOC Analyst (×2) (Onboarding — onshore)
  // --------------------------------------------------------------------------
  "OMS-2026-0119": {
    id: "OMS-2026-0119",
    positionTitle: "SOC Analyst (×2)",
    departmentId: "dept-digital-security",
    departmentName: "Digital Security",
    requestorId: "usr-mariam",
    currentStage: "ONBOARDING",
    stageLabel: "Onboarding — onshore",
    positions: {
      required: 2,
      filled: 1,
      inProgress: 1, // Second seat still sourcing
    },
    engagementMonths: 12,
    workLocation: "DIEZ_PREMISES",
    expectedStartDate: "2026-10-01",
    salaryGrade: "G7",
    candidateRoute: "UNKNOWN",
    justification: "24/7 Tier-1/Tier-2 SOC event triage and threat mitigation operations.",
    budgetAmount: 56000000, // AED 560,000.00 for 2 positions
    currency: "AED",
    fundingRoute: "BUDGETED",
    allocations: [
      {
        budgetLineId: "line-cs-dig-001",
        code: "CS-DIG-001",
        name: "Cybersecurity Services FY2026",
        amount: 56000000,
      },
    ],
    approvalRoute: [
      { index: 1, stageCode: "REQUESTOR", label: "Requestor", state: "COMPLETE", userId: "usr-mariam", actionedAt: "2026-07-15T08:00:00Z" },
      { index: 2, stageCode: "LINE_MANAGER", label: "Line Manager", state: "COMPLETE", userId: "usr-omar", actionedAt: "2026-07-15T12:00:00Z" },
      { index: 3, stageCode: "SECTION_HEAD", label: "Section Head", state: "COMPLETE", userId: "usr-fatima", actionedAt: "2026-07-16T09:00:00Z" },
      { index: 4, stageCode: "HOD", label: "Head of Department", state: "COMPLETE", userId: "usr-khalid", actionedAt: "2026-07-16T15:00:00Z" },
      { index: 5, stageCode: "HR_REVIEW", label: "HR Review", state: "COMPLETE", userId: "usr-aisha", actionedAt: "2026-07-17T11:00:00Z" },
      { index: 6, stageCode: "PROCUREMENT", label: "Procurement", state: "COMPLETE", userId: "usr-salma", actionedAt: "2026-07-18T10:00:00Z" },
    ],
    submittedAt: "2026-07-15T08:00:00Z",
    createdAt: "2026-07-10T10:00:00Z",
    updatedAt: "2026-08-24T08:15:00Z",
    sla: {
      targetDays: 30,
      dueAt: "2026-10-01T00:00:00Z",
      daysRemaining: 22,
      breached: false,
      overdueDays: 0,
    },
    flags: ["ONBOARDING_IN_PROGRESS", "MULTI_SEAT"],
    evidence: {
      jobDescriptionAttached: true,
      supportingDocumentCount: 2,
      adHierarchyVerified: true,
    },
    attachments: [],
  },

  // --------------------------------------------------------------------------
  // 0102 — Data Analyst (Onboarding — offshore)
  // --------------------------------------------------------------------------
  "OMS-2026-0102": {
    id: "OMS-2026-0102",
    positionTitle: "Data Analyst",
    departmentId: "dept-data-mgmt",
    departmentName: "Data Management",
    requestorId: "usr-mariam",
    currentStage: "ONBOARDING",
    stageLabel: "Onboarding — offshore",
    positions: {
      required: 1,
      filled: 1,
      inProgress: 0,
    },
    engagementMonths: 12,
    workLocation: "REMOTE",
    expectedStartDate: "2026-10-15",
    salaryGrade: "G6",
    candidateRoute: "UNKNOWN",
    justification: "Offshore data cleaning, dashboard creation in PowerBI, and data warehouse ETL pipeline testing.",
    budgetAmount: 24000000, // AED 240,000.00
    currency: "AED",
    fundingRoute: "BUDGETED",
    allocations: [
      {
        budgetLineId: "line-dm-dat-001",
        code: "DM-DAT-001",
        name: "Data Governance & Analytics FY2026",
        amount: 24000000,
      },
    ],
    approvalRoute: [
      { index: 1, stageCode: "REQUESTOR", label: "Requestor", state: "COMPLETE", userId: "usr-mariam", actionedAt: "2026-07-01T09:00:00Z" },
      { index: 2, stageCode: "LINE_MANAGER", label: "Line Manager", state: "COMPLETE", userId: "usr-omar", actionedAt: "2026-07-01T14:00:00Z" },
      { index: 3, stageCode: "SECTION_HEAD", label: "Section Head", state: "COMPLETE", userId: "usr-fatima", actionedAt: "2026-07-02T10:00:00Z" },
      { index: 4, stageCode: "HOD", label: "Head of Department", state: "COMPLETE", userId: "usr-khalid", actionedAt: "2026-07-02T16:00:00Z" },
      { index: 5, stageCode: "HR_REVIEW", label: "HR Review", state: "COMPLETE", userId: "usr-aisha", actionedAt: "2026-07-03T11:00:00Z" },
    ],
    submittedAt: "2026-07-01T09:00:00Z",
    createdAt: "2026-06-28T10:00:00Z",
    updatedAt: "2026-09-05T10:30:00Z",
    sla: {
      targetDays: 30,
      dueAt: "2026-10-15T00:00:00Z",
      daysRemaining: 36,
      breached: false,
      overdueDays: 0,
    },
    flags: ["OFFSHORE_ONBOARDING", "DUAL_TIMEZONE"],
    evidence: {
      jobDescriptionAttached: true,
      supportingDocumentCount: 1,
      adHierarchyVerified: true,
    },
    attachments: [],
  },

  // --------------------------------------------------------------------------
  // 0095 — Network Engineer (Active workforce)
  // --------------------------------------------------------------------------
  "OMS-2026-0095": {
    id: "OMS-2026-0095",
    positionTitle: "Network Engineer",
    departmentId: "dept-it-infra",
    departmentName: "IT Infrastructure",
    requestorId: "usr-ahmed-z",
    currentStage: "ACTIVE",
    stageLabel: "Active",
    positions: {
      required: 1,
      filled: 1,
      inProgress: 0,
    },
    engagementMonths: 12,
    workLocation: "DIEZ_PREMISES",
    expectedStartDate: "2026-06-09",
    salaryGrade: "G7",
    candidateRoute: "UNKNOWN",
    justification: "Core networking, firewall management, and campus switch infrastructure administration.",
    budgetAmount: 30000000, // AED 300,000.00
    currency: "AED",
    fundingRoute: "BUDGETED",
    allocations: [
      {
        budgetLineId: "line-it-inf-002",
        code: "IT-INF-002",
        name: "Network Operations & Connectivity FY2026",
        amount: 30000000,
      },
    ],
    approvalRoute: [
      { index: 1, stageCode: "REQUESTOR", label: "Requestor", state: "COMPLETE", userId: "usr-ahmed-z", actionedAt: "2026-05-01T08:00:00Z" },
      { index: 2, stageCode: "HOD", label: "Head of Department", state: "COMPLETE", userId: "usr-mona", actionedAt: "2026-05-02T11:00:00Z" },
      { index: 3, stageCode: "HR_REVIEW", label: "HR Review", state: "COMPLETE", userId: "usr-aisha", actionedAt: "2026-05-03T15:00:00Z" },
      { index: 4, stageCode: "PROCUREMENT", label: "Procurement", state: "COMPLETE", userId: "usr-salma", actionedAt: "2026-05-04T10:00:00Z" },
    ],
    submittedAt: "2026-05-01T08:00:00Z",
    createdAt: "2026-04-25T10:00:00Z",
    updatedAt: "2026-06-09T08:00:00Z",
    flags: ["WORKFORCE_ACTIVE"],
    evidence: {
      jobDescriptionAttached: true,
      supportingDocumentCount: 2,
      adHierarchyVerified: true,
    },
    attachments: [],
  },

  // --------------------------------------------------------------------------
  // 0081 — QA Engineer (Active, ending within 30 days — runway alert)
  // --------------------------------------------------------------------------
  "OMS-2026-0081": {
    id: "OMS-2026-0081",
    positionTitle: "QA Engineer",
    departmentId: "dept-it-infra",
    departmentName: "IT Infrastructure",
    requestorId: "usr-ahmed-z",
    currentStage: "ENDING_SOON",
    stageLabel: "Active, ending soon",
    positions: {
      required: 1,
      filled: 1,
      inProgress: 0,
    },
    engagementMonths: 12,
    workLocation: "HYBRID",
    expectedStartDate: "2025-10-01",
    salaryGrade: "G6",
    candidateRoute: "UNKNOWN",
    justification: "Automated regression testing and test framework maintenance for portal releases.",
    budgetAmount: 28000000, // AED 280,000.00
    currency: "AED",
    fundingRoute: "BUDGETED",
    allocations: [
      {
        budgetLineId: "line-it-inf-001",
        code: "IT-INF-001",
        name: "Cloud Infrastructure & Architecture FY2026",
        amount: 28000000,
      },
    ],
    approvalRoute: [
      { index: 1, stageCode: "REQUESTOR", label: "Requestor", state: "COMPLETE", userId: "usr-ahmed-z", actionedAt: "2025-08-15T09:00:00Z" },
      { index: 2, stageCode: "HOD", label: "Head of Department", state: "COMPLETE", userId: "usr-mona", actionedAt: "2025-08-16T14:00:00Z" },
      { index: 3, stageCode: "HR_REVIEW", label: "HR Review", state: "COMPLETE", userId: "usr-aisha", actionedAt: "2025-08-18T11:00:00Z" },
    ],
    submittedAt: "2025-08-15T09:00:00Z",
    createdAt: "2025-08-10T10:00:00Z",
    updatedAt: "2026-09-01T08:00:00Z",
    sla: {
      targetDays: 21,
      dueAt: "2026-09-30T23:59:59Z", // Contract ends in 21 days!
      daysRemaining: 21,
      breached: false,
      overdueDays: 0,
    },
    flags: ["ENDING_SOON", "RUNWAY_ALERT"],
    evidence: {
      jobDescriptionAttached: true,
      supportingDocumentCount: 1,
      adHierarchyVerified: true,
    },
    attachments: [],
  },

  // --------------------------------------------------------------------------
  // 0074 — Business Analyst (Terminated 2 months ago, replaced by 0074-R)
  // --------------------------------------------------------------------------
  "OMS-2026-0074": {
    id: "OMS-2026-0074",
    positionTitle: "Business Analyst",
    departmentId: "dept-pmo",
    departmentName: "Project Management Office",
    requestorId: "usr-rashid-f",
    currentStage: "TERMINATED",
    stageLabel: "Terminated → replaced",
    positions: {
      required: 1,
      filled: 0,
      inProgress: 0,
    },
    engagementMonths: 12,
    workLocation: "DIEZ_PREMISES",
    expectedStartDate: "2025-07-01",
    salaryGrade: "G7",
    candidateRoute: "UNKNOWN",
    justification: "Business process re-engineering and stakeholder requirements traceability.",
    budgetAmount: 25000000, // AED 250,000.00
    currency: "AED",
    fundingRoute: "BUDGETED",
    allocations: [
      {
        budgetLineId: "line-pmo-prj-001",
        code: "PMO-PRJ-001",
        name: "Strategic PMO & Delivery FY2026",
        amount: 25000000,
      },
    ],
    approvalRoute: [
      { index: 1, stageCode: "REQUESTOR", label: "Requestor", state: "COMPLETE", userId: "usr-rashid-f", actionedAt: "2025-06-01T08:00:00Z" },
      { index: 2, stageCode: "HOD", label: "Head of Department", state: "COMPLETE", userId: "usr-youssef-b", actionedAt: "2025-06-02T11:00:00Z" },
      { index: 3, stageCode: "HR_REVIEW", label: "HR Review", state: "COMPLETE", userId: "usr-aisha", actionedAt: "2025-06-03T15:00:00Z" },
    ],
    submittedAt: "2025-06-01T08:00:00Z",
    createdAt: "2025-05-25T10:00:00Z",
    updatedAt: "2026-07-09T00:00:00Z", // Terminated 2 months ago
    replacementRequisitionId: "OMS-2026-0074-R",
    flags: ["TERMINATED", "REPLACED"],
    evidence: {
      jobDescriptionAttached: true,
      supportingDocumentCount: 1,
      adHierarchyVerified: true,
    },
    attachments: [],
  },

  // Replacement requisition for 0074
  "OMS-2026-0074-R": {
    id: "OMS-2026-0074-R",
    positionTitle: "Business Analyst (Replacement)",
    departmentId: "dept-pmo",
    departmentName: "Project Management Office",
    requestorId: "usr-rashid-f",
    currentStage: "SOURCING",
    stageLabel: "Procurement sourcing",
    positions: {
      required: 1,
      filled: 0,
      inProgress: 1,
    },
    engagementMonths: 12,
    workLocation: "DIEZ_PREMISES",
    expectedStartDate: "2026-10-01",
    salaryGrade: "G7",
    candidateRoute: "UNKNOWN",
    justification: "Replacement headcount for terminated contractor (OMS-2026-0074) covering strategic PMO deliverables.",
    budgetAmount: 25000000,
    currency: "AED",
    fundingRoute: "BUDGETED",
    allocations: [
      {
        budgetLineId: "line-pmo-prj-001",
        code: "PMO-PRJ-001",
        name: "Strategic PMO & Delivery FY2026",
        amount: 25000000,
      },
    ],
    approvalRoute: [
      { index: 1, stageCode: "REQUESTOR", label: "Requestor", state: "COMPLETE", userId: "usr-rashid-f", actionedAt: "2026-07-15T10:00:00Z" },
      { index: 2, stageCode: "HOD", label: "Head of Department", state: "COMPLETE", userId: "usr-youssef-b", actionedAt: "2026-07-16T14:00:00Z" },
      { index: 3, stageCode: "HR_REVIEW", label: "HR Review", state: "COMPLETE", userId: "usr-aisha", actionedAt: "2026-07-17T11:00:00Z" },
      { index: 4, stageCode: "PROCUREMENT", label: "Procurement Sourcing", state: "CURRENT", userId: "usr-salma", actionedAt: null },
    ],
    submittedAt: "2026-07-15T10:00:00Z",
    createdAt: "2026-07-12T09:00:00Z",
    updatedAt: "2026-07-17T11:00:00Z",
    replacementForRequisitionId: "OMS-2026-0074",
    flags: ["REPLACEMENT_HEADCOUNT", "SOURCING"],
    evidence: {
      jobDescriptionAttached: true,
      supportingDocumentCount: 1,
      adHierarchyVerified: true,
    },
    attachments: [],
  },

  // --------------------------------------------------------------------------
  // 0161 — Penetration Tester (Rejected, re-sourcing)
  // --------------------------------------------------------------------------
  "OMS-2026-0161": {
    id: "OMS-2026-0161",
    positionTitle: "Penetration Tester",
    departmentId: "dept-digital-security",
    departmentName: "Digital Security",
    requestorId: "usr-mariam",
    currentStage: "RE_SOURCING",
    stageLabel: "Rejected, re-sourcing",
    positions: {
      required: 1,
      filled: 0,
      inProgress: 0,
    },
    engagementMonths: 12,
    workLocation: "DIEZ_PREMISES",
    expectedStartDate: "2026-10-15",
    salaryGrade: "G8",
    candidateRoute: "UNKNOWN",
    justification: "Application and network vulnerability assessment, red teaming, and remediation verification.",
    budgetAmount: 34000000, // AED 340,000.00
    currency: "AED",
    fundingRoute: "BUDGETED",
    allocations: [
      {
        budgetLineId: "line-cs-dig-001",
        code: "CS-DIG-001",
        name: "Cybersecurity Services FY2026",
        amount: 34000000,
      },
    ],
    approvalRoute: [
      { index: 1, stageCode: "REQUESTOR", label: "Requestor", state: "COMPLETE", userId: "usr-mariam", actionedAt: "2026-08-01T10:00:00Z" },
      { index: 2, stageCode: "LINE_MANAGER", label: "Line Manager", state: "COMPLETE", userId: "usr-omar", actionedAt: "2026-08-01T15:00:00Z" },
      { index: 3, stageCode: "SECTION_HEAD", label: "Section Head", state: "COMPLETE", userId: "usr-fatima", actionedAt: "2026-08-02T09:30:00Z" },
      { index: 4, stageCode: "HOD", label: "Head of Department", state: "COMPLETE", userId: "usr-khalid", actionedAt: "2026-08-02T16:00:00Z" },
      { index: 5, stageCode: "HR_REVIEW", label: "HR Review", state: "COMPLETE", userId: "usr-aisha", actionedAt: "2026-08-03T11:00:00Z" },
      { index: 6, stageCode: "PROCUREMENT", label: "Procurement Sourcing", state: "CURRENT", userId: "usr-salma", actionedAt: "2026-08-16T09:00:00Z" },
    ],
    submittedAt: "2026-08-01T10:00:00Z",
    createdAt: "2026-07-28T10:00:00Z",
    updatedAt: "2026-08-16T09:00:00Z",
    flags: ["RE_SOURCING", "CANDIDATE_REJECTED"],
    evidence: {
      jobDescriptionAttached: true,
      supportingDocumentCount: 1,
      adHierarchyVerified: true,
    },
    attachments: [],
  },

  // --------------------------------------------------------------------------
  // 0170 — Security Architect (Just submitted today!)
  // --------------------------------------------------------------------------
  "OMS-2026-0170": {
    id: "OMS-2026-0170",
    positionTitle: "Security Architect",
    departmentId: "dept-digital-security",
    departmentName: "Digital Security",
    requestorId: "usr-mariam",
    currentStage: "PENDING_APPROVAL",
    stageLabel: "Just submitted",
    positions: {
      required: 1,
      filled: 0,
      inProgress: 0,
    },
    engagementMonths: 12,
    workLocation: "DIEZ_PREMISES",
    expectedStartDate: "2026-11-01",
    salaryGrade: "G9",
    candidateRoute: "UNKNOWN",
    justification: "Design of zero-trust architecture, identity management modernisation, and cloud security patterns.",
    budgetAmount: 42000000, // AED 420,000.00
    currency: "AED",
    fundingRoute: "BUDGETED",
    allocations: [
      {
        budgetLineId: "line-cs-dig-001",
        code: "CS-DIG-001",
        name: "Cybersecurity Services FY2026",
        amount: 42000000,
      },
    ],
    approvalRoute: [
      {
        index: 1,
        stageCode: "REQUESTOR",
        label: "Requestor",
        state: "COMPLETE",
        userId: "usr-mariam",
        userName: "Mariam Al Mansoori",
        actionedAt: "2026-09-09T08:30:00Z",
      },
      {
        index: 2,
        stageCode: "LINE_MANAGER",
        label: "Line Manager",
        state: "CURRENT",
        userId: "usr-omar",
        userName: "Omar Al Hashmi",
        actionedAt: null,
      },
      {
        index: 3,
        stageCode: "SECTION_HEAD",
        label: "Section Head",
        state: "PENDING",
        userId: "usr-fatima",
        userName: "Fatima Al Marri",
        actionedAt: null,
      },
      {
        index: 4,
        stageCode: "HOD",
        label: "Head of Department",
        state: "PENDING",
        userId: "usr-khalid",
        userName: "Khalid Al Suwaidi",
        actionedAt: null,
      },
      {
        index: 5,
        stageCode: "HR_REVIEW",
        label: "HR Review",
        state: "PENDING",
        userId: "usr-aisha",
        actionedAt: null,
      },
      {
        index: 6,
        stageCode: "PROCUREMENT",
        label: "Procurement",
        state: "PENDING",
        userId: "usr-salma",
        actionedAt: null,
      },
    ],
    submittedAt: "2026-09-09T08:30:00Z", // Submitted today
    createdAt: "2026-09-09T08:00:00Z",
    updatedAt: "2026-09-09T08:30:00Z",
    sla: {
      targetDays: 3,
      dueAt: "2026-09-12T08:30:00Z",
      daysRemaining: 3,
      breached: false,
      overdueDays: 0,
    },
    flags: ["NEW", "SUBMITTED_TODAY"],
    evidence: {
      jobDescriptionAttached: true,
      supportingDocumentCount: 1,
      adHierarchyVerified: true,
    },
    attachments: [],
  },
};

export const REQUISITIONS_LIST: Requisition[] = Object.values(REQUISITIONS);

// ============================================================================
// 2. Candidates
// ============================================================================

export const CANDIDATES: Record<string, Candidate> = {
  // 0148 Candidates
  "C-014": {
    candidateRef: "C-014",
    requisitionId: "OMS-2026-0148",
    fullName: "Samir Rahman",
    anonymisedRef: "Candidate C-014",
    priority: "P1",
    status: "QUALIFIED_PENDING_BUDGET",
    nationality: "India",
    residentStatus: "ONSHORE",
    timezone: "Asia/Dubai",
    experienceYears: 9,
    noticePeriod: "2 weeks",
    leadTimeDays: 14,
    expectedAnnualCost: 33000000, // AED 330,000.00 — EXACT match with evaluation & amendment!
    approvedBudget: 31000000,     // AED 310,000.00 — EXACT match!
    vendorId: "ven-falcon",
    vendorHidden: true,
    email: "samir.rahman@falcontech-candidate.com",
    mobile: "+971 50 123 4567",
  },
  "C-021": {
    candidateRef: "C-021",
    requisitionId: "OMS-2026-0148",
    fullName: "Elena Rostova",
    anonymisedRef: "Candidate C-021",
    priority: "P2",
    status: "INTERVIEW_PENDING",
    nationality: "Kazakhstan",
    residentStatus: "ONSHORE",
    timezone: "Asia/Dubai",
    experienceYears: 7,
    noticePeriod: "1 month",
    leadTimeDays: 30,
    expectedAnnualCost: 31000000, // AED 310,000.00
    approvedBudget: 31000000,
    vendorId: "ven-falcon",
    vendorHidden: true,
    email: "elena.rostova@falcontech-candidate.com",
    mobile: "+971 52 987 6543",
  },

  // 0119 Candidates
  "C-030": {
    candidateRef: "C-030",
    requisitionId: "OMS-2026-0119",
    fullName: "Tariq Al Hammadi",
    anonymisedRef: "Candidate C-030",
    priority: "P1",
    status: "ONBOARDING",
    nationality: "UAE",
    residentStatus: "ONSHORE",
    timezone: "Asia/Dubai",
    experienceYears: 5,
    noticePeriod: "Immediate",
    leadTimeDays: 0,
    expectedAnnualCost: 28000000, // AED 280,000.00
    approvedBudget: 28000000,
    vendorId: "ven-falcon",
    vendorHidden: false,
    email: "tariq.alhammadi@falcontech-candidate.com",
    mobile: "+971 50 888 7766",
  },

  // 0102 Candidates
  "C-031": {
    candidateRef: "C-031",
    requisitionId: "OMS-2026-0102",
    fullName: "Priya Sharma",
    anonymisedRef: "Candidate C-031",
    priority: "P1",
    status: "ONBOARDING",
    nationality: "India",
    residentStatus: "OFFSHORE",
    timezone: "Asia/Kolkata",
    experienceYears: 6,
    noticePeriod: "3 weeks",
    leadTimeDays: 21,
    expectedAnnualCost: 24000000, // AED 240,000.00
    approvedBudget: 24000000,
    vendorId: "ven-falcon",
    vendorHidden: false,
    email: "priya.sharma@falcontech-candidate.com",
    mobile: "+91 98200 12345",
  },

  // 0161 Rejected Candidate
  "C-040": {
    candidateRef: "C-040",
    requisitionId: "OMS-2026-0161",
    fullName: "Kareem Mostafa",
    anonymisedRef: "Candidate C-040",
    priority: "P1",
    status: "REJECTED",
    nationality: "Egypt",
    residentStatus: "ONSHORE",
    timezone: "Asia/Dubai",
    experienceYears: 4,
    noticePeriod: "1 month",
    leadTimeDays: 30,
    expectedAnnualCost: 34000000,
    approvedBudget: 34000000,
    vendorId: "ven-falcon",
    vendorHidden: true,
    email: "kareem.mostafa@falcontech-candidate.com",
    mobile: "+971 55 432 1098",
    rejectionDetails: {
      reasonCode: "NOT_SUITABLE_DELETE_CV",
      label: "Doesn't meet requirements — delete the CV",
      retentionConsequence: "The CV will be permanently deleted after the HR-defined retention window under UAE PDPL.",
      rejectedAt: "2026-08-15T14:30:00Z",
      retentionDeletionDate: "2027-02-15", // Explicit concrete date: 6 months under PDPL
    },
  },
};

export const CANDIDATES_LIST: Candidate[] = Object.values(CANDIDATES);

// ============================================================================
// 3. Interview Plans
// ============================================================================

export const INTERVIEW_PLANS: Record<string, InterviewPlan> = {
  "int-plan-0148-C-014": {
    id: "int-plan-0148-C-014",
    requisitionId: "OMS-2026-0148",
    candidateRef: "C-014",
    status: "AWAITING_OUTCOME",
    daysWaiting: 0,
    methodPreference: "ONLINE",
    timezone: "Asia/Dubai",
    isOffshore: false,
    rescheduleCount: 0,
    withdrawnSlot: null,
    proposal: {
      slots: [
        { start: "2026-08-12T07:00:00Z", durationMinutes: 60 },
      ],
      settings: {
        method: "ONLINE",
        platform: "MICROSOFT_TEAMS",
        replyByDate: "2026-08-10",
        allowAlternatives: true,
        allowReschedule: true,
      },
      sentAt: "2026-08-08T09:30:00Z",
    },
    interviewers: [
      { userId: "usr-noura", name: "Noura Al Mazrouei", initials: "NA", role: "Lead Security Architect", isMain: true },
      { userId: "usr-yousef-f", name: "Yousef Al Falasi", initials: "YF", role: "Senior SOC Analyst", isMain: false },
      { userId: "usr-omar", name: "Omar Al Hashmi", initials: "OH", role: "Information Security Operations Manager", isMain: false },
    ],
    scheduledSlot: { start: "2026-08-12T07:00:00Z", durationMinutes: 60 },
    confirmedAt: "2026-08-08T14:30:00Z",
    occurred: true,
  },
  "int-plan-0148-C-021": {
    id: "int-plan-0148-C-021",
    requisitionId: "OMS-2026-0148",
    candidateRef: "C-021",
    status: "AWAITING_REPLY",
    daysWaiting: 1,
    methodPreference: "ONLINE",
    timezone: "Asia/Dubai",
    isOffshore: false,
    rescheduleCount: 0,
    withdrawnSlot: null,
    proposal: {
      slots: [
        { start: "2026-09-12T08:30:00Z", durationMinutes: 45 },
        { start: "2026-09-13T10:00:00Z", durationMinutes: 45 },
        { start: "2026-09-14T09:00:00Z", durationMinutes: 45 },
      ],
      settings: {
        method: "ONLINE",
        platform: "MICROSOFT_TEAMS",
        location: null,
        replyByDate: "2026-09-12",
        allowAlternatives: true,
        allowReschedule: true,
      },
      sentAt: "2026-09-10T09:00:00Z",
    },
    interviewers: [
      { userId: "usr-noura", name: "Noura Al Mazrouei", initials: "NA", role: "Lead Security Architect", isMain: true },
      { userId: "usr-yousef-f", name: "Yousef Al Falasi", initials: "YF", role: "Senior SOC Analyst", isMain: false },
    ],
    scheduledSlot: null,
    confirmedAt: null,
    occurred: false,
  },
};

export const INTERVIEW_PLANS_LIST: InterviewPlan[] = Object.values(INTERVIEW_PLANS);

// ============================================================================
// 4. Evaluations
// ============================================================================

export const EVALUATIONS: Record<string, Evaluation> = {
  // C-014 Evaluated & Qualified over budget
  "eval-2026-0042": {
    id: "eval-2026-0042",
    requisitionId: "OMS-2026-0148",
    candidateRef: "C-014",
    interview: {
      occurred: true,
      confirmedAt: "2026-08-12T07:45:00Z",
      method: "ONLINE",
      scheduledFor: "2026-08-12T07:00:00Z",
      nonOccurrenceReason: null,
      nonOccurrenceNotes: null,
    },
    overallScore: 86.7,
    overallAnchor: "Above requirement",
    outcome: "QUALIFY",
    criteria: [
      {
        code: "TECHNICAL_EXPERTISE",
        label: "Technical expertise",
        weightPercent: 25,
        anchors: { "1": "Well below", "3": "Meets requirement", "5": "Outstanding" },
        rating: 5,
      },
      {
        code: "CYBERSECURITY_OPS",
        label: "Cybersecurity operations",
        weightPercent: 20,
        anchors: { "1": "Well below", "3": "Meets requirement", "5": "Outstanding" },
        rating: 4,
      },
      {
        code: "PROBLEM_SOLVING",
        label: "Problem solving & incident handling",
        weightPercent: 15,
        anchors: { "1": "Well below", "3": "Meets requirement", "5": "Outstanding" },
        rating: 4,
      },
      {
        code: "COMMUNICATION",
        label: "Communication & stakeholder management",
        weightPercent: 15,
        anchors: { "1": "Well below", "3": "Meets requirement", "5": "Outstanding" },
        rating: 4,
      },
      {
        code: "INCIDENT_RESPONSE",
        label: "Incident response under pressure",
        weightPercent: 15,
        anchors: { "1": "Well below", "3": "Meets requirement", "5": "Outstanding" },
        rating: 5,
      },
      {
        code: "DIEZ_FIT",
        label: "DIEZ environment & culture fit",
        weightPercent: 10,
        anchors: { "1": "Well below", "3": "Meets requirement", "5": "Outstanding" },
        rating: 4,
      },
    ],
    comments: "Strong technical foundation in SIEM and SOC operations. Demonstrated sound incident triage methodology.",
    strengthTags: ["SIEM & SOC", "Incident response"],
    developmentTags: ["DIEZ internal processes"],
    suggestedTags: ["SIEM & SOC", "Threat hunting", "Regulatory knowledge", "Cloud Security", "Vulnerability Management"],
    panel: {
      isPanel: true,
      targetCount: 3,
      completedCount: 2,
      contributors: [
        {
          userId: "usr-noura",
          name: "Noura Al Mazrouei",
          role: "Main interviewer",
          status: "COMPLETE",
          overallScore: 86.7,
          criteria: [
            { code: "TECHNICAL_EXPERTISE", rating: 5 },
            { code: "CYBERSECURITY_OPS", rating: 4 },
            { code: "PROBLEM_SOLVING", rating: 4 },
            { code: "COMMUNICATION", rating: 4 },
            { code: "INCIDENT_RESPONSE", rating: 5 },
            { code: "DIEZ_FIT", rating: 4 },
          ],
        },
        {
          userId: "usr-yousef-f",
          name: "Yousef Al Falasi",
          role: "Senior SOC Analyst",
          status: "COMPLETE",
          overallScore: 83.3,
          criteria: [
            { code: "TECHNICAL_EXPERTISE", rating: 5 },
            { code: "CYBERSECURITY_OPS", rating: 4 },
            { code: "PROBLEM_SOLVING", rating: 4 },
            { code: "COMMUNICATION", rating: 3 },
            { code: "INCIDENT_RESPONSE", rating: 5 },
            { code: "DIEZ_FIT", rating: 4 },
          ],
        },
        {
          userId: "usr-omar",
          name: "Omar Al Hashmi",
          role: "Infrastructure Manager",
          status: "PENDING",
          overallScore: null,
          criteria: [],
        },
      ],
      disagreements: [
        {
          criterionCode: "COMMUNICATION",
          ratings: [4, 3],
          spread: 1,
        },
      ],
    },
    cost: {
      approvedBudget: 31000000,      // AED 310,000.00 — identical to candidate & amendment
      expectedAnnualCost: 33000000,  // AED 330,000.00 — identical to candidate & amendment
      variance: 2000000,             // +AED 20,000.00 shortfall
      status: "OVER_BUDGET",
      overBudgetConsequence: "Creates budget amendment amd-2026-0089 requiring Line Manager approval.",
    },
    positions: {
      required: 2,
      filled: 0,
      thisWouldFill: 1,
    },
    submittedAt: "2026-08-12T11:46:00Z",
    mainEvaluatorId: "usr-noura",
  },

  // C-040 Evaluated & Rejected (0161)
  "eval-2026-0161-040": {
    id: "eval-2026-0161-040",
    requisitionId: "OMS-2026-0161",
    candidateRef: "C-040",
    interview: {
      occurred: true,
      confirmedAt: "2026-08-15T10:00:00Z",
      method: "ONLINE",
      scheduledFor: "2026-08-15T09:00:00Z",
    },
    overallScore: 52.4,
    overallAnchor: "Below requirement",
    outcome: "REJECT",
    criteria: [
      { code: "PEN_TESTING", label: "Penetration testing depth", weightPercent: 40, anchors: {}, rating: 2 },
      { code: "WEB_APP_SEC", label: "Web application security", weightPercent: 30, anchors: {}, rating: 3 },
      { code: "REPORTING", label: "Executive vulnerability reporting", weightPercent: 30, anchors: {}, rating: 2 },
    ],
    comments: "Candidate lacks required senior-level experience in API security and cloud red teaming. Does not meet G8 expectations.",
    strengthTags: ["Basic web penetration testing"],
    developmentTags: ["Cloud security", "API testing", "Executive communication"],
    suggestedTags: [],
    panel: {
      isPanel: false,
      targetCount: 1,
      completedCount: 1,
      contributors: [],
      disagreements: [],
    },
    cost: {
      approvedBudget: 34000000,
      expectedAnnualCost: 34000000,
      variance: 0,
      status: "WITHIN_BUDGET",
    },
    positions: {
      required: 1,
      filled: 0,
      thisWouldFill: 1,
    },
    rejectionReasonCode: "NOT_SUITABLE_DELETE_CV",
    rejectionRetentionDate: "2027-02-15",
    submittedAt: "2026-08-15T14:30:00Z",
    mainEvaluatorId: "usr-noura",
  },
};

export const EVALUATIONS_LIST: Evaluation[] = Object.values(EVALUATIONS);

// ============================================================================
// 5. Budget Amendments
// ============================================================================

export const AMENDMENTS: Record<string, Amendment> = {
  "amd-2026-0089": {
    id: "amd-2026-0089",
    requisitionId: "OMS-2026-0148",
    candidateRef: "C-014",
    positionTitle: "Senior Cybersecurity Analyst",
    status: "AWAITING_APPROVAL",
    triggeredBy: {
      event: "CANDIDATE_QUALIFIED",
      at: "2026-08-12T11:46:00Z",
      evaluationId: "eval-2026-0042",
    },
    cost: {
      approved: 31000000,       // AED 310,000.00 — identical to evaluation
      qualified: 33000000,      // AED 330,000.00 — identical to evaluation
      shortfall: 2000000,       // AED 20,000.00 — identical to evaluation
      variancePercent: 6.45,
      status: "OVER_BUDGET",
    },
    fundingRoute: "BUDGETED",
    selectedLines: [
      {
        lineId: "line-cs-dig-001",
        code: "CS-DIG-001",
        name: "Cybersecurity Services FY2026",
        drawdownAmount: 2000000, // AED 20,000.00
      },
    ],
    reapprovalRoute: [
      {
        stage: "LINE_MANAGER",
        user: { name: "Omar Al Hashmi", userId: "usr-omar" },
        role: "Line Manager",
        status: "CURRENT",
        actionedAt: null,
        rejectionConsequence: "Closes this candidate's path and releases reserved funds.",
      },
      {
        stage: "SECTION_HEAD",
        user: { name: "Fatima Al Marri", userId: "usr-fatima" },
        role: "Section Head",
        status: "PENDING",
        rejectionConsequence: "Rejects amendment and returns to Line Manager.",
      },
      {
        stage: "HOD",
        user: { name: "Khalid Al Suwaidi", userId: "usr-khalid" },
        role: "Head of Department",
        status: "PENDING",
        rejectionConsequence: "Rejects amendment back to section level.",
      },
      {
        stage: "FINANCE",
        user: { name: "Rashid Al Mansoori", userId: "usr-rashid-m" },
        role: "Finance Manager",
        status: "PENDING",
        rejectionConsequence: "Declines budget re-allocation.",
      },
    ],
    revisedPosition: [
      {
        item: "Candidate Cost (Samir Rahman)",
        current: 31000000,
        revised: 33000000,
        change: 2000000, // POSITIVE for cost increase
      },
      {
        item: "CS-DIG-001 Cybersecurity Services FY2026 Remaining",
        current: 45000000,
        revised: 43000000,
        change: -2000000, // NEGATIVE for budget decrease
      },
    ],
    deadline: {
      closesAt: "2026-09-11T23:59:59Z",
      daysRemaining: 2,
      severity: "WARNING",
    },
    currentAssigneeId: "usr-omar", // Omar Al Hashmi approves
    submittedAt: "2026-08-12T12:30:00Z",
    justification:
      "Candidate brings 9 years of specialized threat hunting and incident triage experience, commanding AED 330,000.00. The AED 20,000.00 shortfall is drawn from CS-DIG-001 open surplus balance.",
  },
};

export const AMENDMENTS_LIST: Amendment[] = Object.values(AMENDMENTS);

// ============================================================================
// 6. Clarifications
// ============================================================================

export const CLARIFICATIONS: Record<string, Clarification> = {
  // 0139 Clarification (Responded 1 day ago)
  "clar-2026-0089": {
    id: "clar-2026-0089",
    requisitionId: "OMS-2026-0139",
    type: "INFO_WITH_APPROVAL",
    status: "SUBMITTED",
    raisedByUserId: "usr-aisha",
    raisedAt: "2026-09-02T11:20:00Z",
    message:
      "Please clarify the data-governance deliverables, update the engagement end date to match the Q3 project milestone, and attach the approved project plan.",
    attachments: [
      {
        id: "att-clar-01",
        name: "Original_Request_Details.pdf",
        sizeBytes: 2457600,
        url: "https://storage.diez.ae/requests/att-clar-01.pdf",
        scanStatus: "VERIFIED",
      },
    ],
    asks: [
      { id: "ask-1", text: "Clarify the data-governance deliverables", fieldKey: "justification", addressed: true },
      { id: "ask-2", text: "Update the engagement end date", fieldKey: "engagementEndDate", addressed: true },
      { id: "ask-3", text: "Attach the approved project plan", fieldKey: null, addressed: true },
    ],
    editableFields: [
      {
        key: "engagementEndDate",
        label: "Engagement end date",
        type: "DATE",
        currentValue: "2027-06-30",
        proposedValue: "2027-08-31",
        financialImpact: false,
        helpText: "Aligned with Data Governance Phase 2 milestones",
      },
      {
        key: "durationMonths",
        label: "Duration (Months)",
        type: "NUMBER",
        unit: "months",
        currentValue: 10,
        proposedValue: 12,
        financialImpact: false,
        helpText: null,
      },
      {
        key: "justification",
        label: "Business justification",
        type: "TEXT",
        currentValue: "Initial data governance scope.",
        proposedValue: "Expanded scope covering regulatory compliance and metadata catalog implementation.",
        financialImpact: false,
        helpText: null,
      },
      {
        key: "budgetAmount",
        label: "Budget amount",
        type: "MONEY",
        currentValue: 28500000,
        proposedValue: 28500000,
        financialImpact: true,
        helpText: null,
      },
    ],
    response: {
      respondedByUserId: "usr-mariam",
      respondedAt: "2026-09-08T14:20:00Z", // 1 day ago
      message: "Deliverables clarified and approved project plan attached as requested.",
      attachments: [
        {
          id: "att-clar-resp-01",
          name: "Approved_Data_Gov_Project_Plan_v2.pdf",
          sizeBytes: 3120000,
          url: "https://storage.diez.ae/requests/att-clar-resp-01.pdf",
          scanStatus: "VERIFIED",
        },
      ],
      updatedValues: {
        engagementEndDate: "2027-08-31",
        durationMonths: 12,
        justification: "Expanded scope covering regulatory compliance and metadata catalog implementation.",
      },
    },
    deadline: {
      closesAt: "2026-10-02T11:20:00Z",
      daysRemaining: 23,
      severity: "NORMAL",
    },
  },

  // 0143 Clarification (Awaiting requester response)
  "clar-2026-0143-01": {
    id: "clar-2026-0143-01",
    requisitionId: "OMS-2026-0143",
    type: "MORE_INFO",
    status: "AWAITING_RESPONSE",
    raisedByUserId: "usr-aisha",
    raisedAt: "2026-09-07T10:30:00Z", // 2 days ago
    message:
      "Please confirm whether this role requires Azure or AWS specialist certification, and provide the specific hybrid cloud architecture reference document.",
    attachments: [],
    asks: [
      { id: "ask-143-1", text: "Confirm cloud certification requirement (AWS vs Azure)", fieldKey: null, addressed: false },
      { id: "ask-143-2", text: "Attach hybrid architecture reference document", fieldKey: null, addressed: false },
    ],
    editableFields: [
      {
        key: "justification",
        label: "Technical Justification",
        type: "TEXT",
        currentValue: "Support multi-cloud landing zones and Kubernetes cluster orchestration.",
        proposedValue: "Support multi-cloud landing zones and Kubernetes cluster orchestration.",
        financialImpact: false,
        helpText: "Include certification and architecture details",
      },
    ],
    response: null,
    deadline: {
      closesAt: "2026-10-07T23:59:59Z",
      daysRemaining: 28,
      severity: "NORMAL",
    },
  },
};

export const CLARIFICATIONS_LIST: Clarification[] = Object.values(CLARIFICATIONS);

// ============================================================================
// 7. Approval Tasks (Powers Persona Switcher & "Needs My Action")
// ============================================================================

export const APPROVAL_TASKS: Record<string, ApprovalTask> = {
  // Task for Omar: 0148 Budget Amendment
  "task-appr-0148-omar": {
    id: "task-appr-0148-omar",
    type: "BUDGET_AMENDMENT",
    requisitionId: "OMS-2026-0148",
    subjectRef: "OMS-2026-0148",
    title: "Budget Amendment — Senior Cybersecurity Analyst (C-014)",
    context: "Digital Security Department",
    stage: { code: "LINE_MANAGER", label: "Line Manager Approval", index: 1, total: 4 },
    assignment: { mode: "NAMED", assignedUserId: "usr-omar" },
    amount: 2000000, // Shortfall amount in fils (AED 20,000.00)
    currency: "AED",
    submittedAt: "2026-08-12T12:30:00Z",
    assignedAt: "2026-08-12T12:30:00Z",
    sla: { dueAt: "2026-09-11T12:30:00Z", daysRemaining: 2, breached: false },
    priority: "HIGH",
    status: "PENDING",
    amendmentId: "amd-2026-0089",
  },

  // Task for Omar: 0170 Requisition Just Submitted Today
  "task-appr-0170-omar": {
    id: "task-appr-0170-omar",
    type: "REQUISITION",
    requisitionId: "OMS-2026-0170",
    subjectRef: "OMS-2026-0170",
    title: "Requisition Approval — Security Architect",
    context: "Digital Security Department",
    stage: { code: "LINE_MANAGER", label: "Line Manager Approval", index: 2, total: 6 },
    assignment: { mode: "NAMED", assignedUserId: "usr-omar" },
    amount: 42000000,
    currency: "AED",
    submittedAt: "2026-09-09T08:30:00Z",
    assignedAt: "2026-09-09T08:30:00Z",
    sla: { dueAt: "2026-09-12T08:30:00Z", daysRemaining: 3, breached: false },
    priority: "NORMAL",
    status: "PENDING",
  },

  // Task for Aisha: 0139 HR Review Returned from Clarification
  "task-appr-0139-aisha": {
    id: "task-appr-0139-aisha",
    type: "HR_REVIEW",
    requisitionId: "OMS-2026-0139",
    subjectRef: "OMS-2026-0139",
    title: "HR Review — Data Governance Specialist (Returned)",
    context: "Data Management Department",
    stage: { code: "HR_REVIEW", label: "HR Review", index: 5, total: 5 },
    assignment: { mode: "NAMED", assignedUserId: "usr-aisha" },
    amount: 28500000,
    currency: "AED",
    submittedAt: "2026-08-30T10:00:00Z",
    assignedAt: "2026-09-08T14:20:00Z",
    sla: { dueAt: "2026-09-11T14:20:00Z", daysRemaining: 2, breached: false },
    priority: "HIGH",
    status: "PENDING",
    clarificationId: "clar-2026-0089",
  },

  // Task for Aisha: 0128 HR Review OVERDUE
  "task-appr-0128-aisha": {
    id: "task-appr-0128-aisha",
    type: "HR_REVIEW",
    requisitionId: "OMS-2026-0128",
    subjectRef: "OMS-2026-0128",
    title: "HR Review — PMO Analyst (OVERDUE)",
    context: "Project Management Office",
    stage: { code: "HR_REVIEW", label: "HR Review", index: 3, total: 4 },
    assignment: { mode: "NAMED", assignedUserId: "usr-aisha" },
    amount: 22000000,
    currency: "AED",
    submittedAt: "2026-09-04T10:00:00Z",
    assignedAt: "2026-09-05T09:30:00Z",
    sla: { dueAt: "2026-09-07T09:30:00Z", daysRemaining: -2, breached: true, overdueDays: 2 },
    priority: "URGENT",
    status: "PENDING",
  },

  // Task for Rashid Al Mansoori: 0155 SoD Approval
  "task-appr-0155-rashid": {
    id: "task-appr-0155-rashid",
    type: "REQUISITION",
    requisitionId: "OMS-2026-0155",
    subjectRef: "OMS-2026-0155",
    title: "Requisition Approval — HR Coordinator (SoD Watch)",
    context: "Human Resources Department",
    stage: { code: "LINE_MANAGER", label: "Acting Line Manager", index: 2, total: 3 },
    assignment: { mode: "NAMED", assignedUserId: "usr-rashid-m" },
    amount: 18000000,
    currency: "AED",
    submittedAt: "2026-09-08T09:00:00Z",
    assignedAt: "2026-09-08T09:00:00Z",
    sla: { dueAt: "2026-09-11T09:00:00Z", daysRemaining: 2, breached: false },
    priority: "NORMAL",
    status: "PENDING",
  },

  // Task for Salma: 0141 Sourcing
  "task-proc-0141-salma": {
    id: "task-proc-0141-salma",
    type: "REQUISITION",
    requisitionId: "OMS-2026-0141",
    subjectRef: "OMS-2026-0141",
    title: "Vendor Sourcing — Cloud Security Engineer",
    context: "IT Infrastructure",
    stage: { code: "PROCUREMENT", label: "Procurement Sourcing", index: 4, total: 4 },
    assignment: { mode: "NAMED", assignedUserId: "usr-salma" },
    amount: 35000000,
    currency: "AED",
    submittedAt: "2026-08-20T08:00:00Z",
    assignedAt: "2026-08-22T14:00:00Z",
    sla: { dueAt: "2026-09-12T14:00:00Z", daysRemaining: 3, breached: false },
    priority: "NORMAL",
    status: "PENDING",
  },
};

export const APPROVAL_TASKS_LIST: ApprovalTask[] = Object.values(APPROVAL_TASKS);

// ============================================================================
// 8. Vendor Onboarding Cases
// ============================================================================

export const ONBOARDING_CASES: Record<string, OnboardingCase> = {
  // 0119 Onshore Case (Layla Hassan / Falcon Tech)
  "ONB-2026-0119": {
    id: "ONB-2026-0119",
    requisitionId: "OMS-2026-0119",
    candidateRef: "C-030",
    positionTitle: "SOC Analyst",
    vendorId: "ven-falcon",
    vendorCoordinatorId: "usr-layla",
    residentStatus: "ONSHORE",
    candidate: {
      fullName: "Tariq Al Hammadi",
      nationality: "UAE",
      residentStatus: "ONSHORE",
      expectedJoining: "2026-10-01",
      email: "tariq.alhammadi@falcontech-candidate.com",
      mobile: "+971 50 888 7766",
      privacyNoticeAcknowledged: true,
    },
    documents: [
      {
        code: "PASSPORT",
        label: "Passport (bio page)",
        status: "APPROVED",
        file: {
          id: "file-pass-0119",
          name: "Passport_Tariq.pdf",
          sizeBytes: 2457600,
          mimeType: "application/pdf",
          uploadedAt: "2026-08-20T10:15:00Z",
        },
        expiresOn: "2031-03-14",
        expiringWithinDays: 1648,
        malwareScanPassed: true,
        fileTypeValid: true,
        rejectionReason: null,
      },
      {
        code: "EMIRATES_ID",
        label: "Emirates ID",
        status: "UNDER_REVIEW",
        file: {
          id: "file-eid-0119",
          name: "EID_Tariq.pdf",
          sizeBytes: 1843200,
          mimeType: "application/pdf",
          uploadedAt: "2026-08-21T08:30:00Z",
        },
        expiresOn: "2027-11-21",
        expiringWithinDays: 439,
        malwareScanPassed: true,
        fileTypeValid: true,
        rejectionReason: null,
      },
      {
        code: "POLICE_CLEARANCE",
        label: "Police Clearance",
        status: "UPLOADED",
        file: {
          id: "file-pcc-0119",
          name: "Police_Clearance_Tariq.pdf",
          sizeBytes: 3145728,
          mimeType: "application/pdf",
          uploadedAt: "2026-08-24T08:15:00Z",
        },
        expiresOn: "2026-10-30",
        expiringWithinDays: 51, // <= 90 triggers amber "· soon"
        malwareScanPassed: true,
        fileTypeValid: true,
        rejectionReason: null,
      },
      {
        code: "NDA",
        label: "NDA",
        status: "PENDING_SIGNATURE",
        file: null,
        expiresOn: null,
        expiringWithinDays: null,
        malwareScanPassed: null,
        fileTypeValid: null,
        rejectionReason: null,
        requiresSignature: true,
      },
    ],
    signature: {
      templateName: "DIEZ Standard Contractor Non-Disclosure Agreement v3.2",
      envelopeStatus: "SENT",
      signers: [
        { order: 1, name: "Tariq Al Hammadi", role: "Candidate", status: "PENDING" },
        { order: 2, name: "Aisha Al Nuaimi", role: "DIEZ", status: "PENDING" },
      ],
      previewUrl: "https://storage.diez.ae/legal/templates/nda-v3.2-preview.pdf",
      sentAt: "2026-08-24T09:00:00Z",
      signedAt: null,
    },
    deadline: {
      joiningDate: "2026-10-01",
      daysRemaining: 22,
      severity: "NORMAL",
    },
    canEdit: true,
    submittedToDiez: false,
  },

  // 0102 Offshore Case (3 documents, dual timezone)
  "ONB-2026-0102": {
    id: "ONB-2026-0102",
    requisitionId: "OMS-2026-0102",
    candidateRef: "C-031",
    positionTitle: "Data Analyst",
    vendorId: "ven-falcon",
    vendorCoordinatorId: "usr-layla",
    residentStatus: "OFFSHORE",
    candidate: {
      fullName: "Priya Sharma",
      nationality: "India",
      residentStatus: "OFFSHORE",
      expectedJoining: "2026-10-15",
      email: "priya.sharma@falcontech-candidate.com",
      mobile: "+91 98200 12345",
      privacyNoticeAcknowledged: true,
    },
    documents: [
      {
        code: "PASSPORT",
        label: "Passport (bio page)",
        status: "APPROVED",
        file: {
          id: "file-pass-0102",
          name: "Passport_Priya.pdf",
          sizeBytes: 2120000,
          mimeType: "application/pdf",
          uploadedAt: "2026-08-28T07:00:00Z",
        },
        expiresOn: "2030-08-15",
        expiringWithinDays: 1436,
        malwareScanPassed: true,
        fileTypeValid: true,
        rejectionReason: null,
      },
      {
        code: "NATIONAL_ID",
        label: "National ID (India Aadhaar)",
        status: "UNDER_REVIEW",
        file: {
          id: "file-nid-0102",
          name: "National_ID_Priya.pdf",
          sizeBytes: 1540000,
          mimeType: "application/pdf",
          uploadedAt: "2026-08-28T07:15:00Z",
        },
        expiresOn: "2032-12-31",
        expiringWithinDays: 2305,
        malwareScanPassed: true,
        fileTypeValid: true,
        rejectionReason: null,
      },
      {
        code: "NDA",
        label: "NDA",
        status: "APPROVED",
        file: {
          id: "file-nda-signed-0102",
          name: "NDA_Priya_Executed.pdf",
          sizeBytes: 1890000,
          mimeType: "application/pdf",
          uploadedAt: "2026-09-05T10:35:00Z",
        },
        expiresOn: null,
        expiringWithinDays: null,
        malwareScanPassed: true,
        fileTypeValid: true,
        rejectionReason: null,
        requiresSignature: true,
      },
    ],
    signature: {
      templateName: "DIEZ Standard Contractor Non-Disclosure Agreement (Offshore) v3.2",
      envelopeStatus: "SIGNED",
      signers: [
        { order: 1, name: "Priya Sharma", role: "Candidate", status: "SIGNED" },
        { order: 2, name: "Aisha Al Nuaimi", role: "DIEZ", status: "SIGNED" },
      ],
      previewUrl: "https://storage.diez.ae/legal/templates/nda-offshore-v3.2-preview.pdf",
      sentAt: "2026-09-04T08:00:00Z",
      signedAt: "2026-09-05T10:30:00Z",
    },
    deadline: {
      joiningDate: "2026-10-15",
      daysRemaining: 36,
      severity: "NORMAL",
    },
    canEdit: true,
    submittedToDiez: true,
  },

  // 0148 Onshore Reference Case (C-014 Samir Rahman / Falcon Tech)
  "ONB-2026-0148": {
    id: "ONB-2026-0148",
    requisitionId: "OMS-2026-0148",
    candidateRef: "C-014",
    positionTitle: "Senior Cybersecurity Analyst",
    vendorId: "ven-falcon",
    vendorCoordinatorId: "usr-layla",
    residentStatus: "ONSHORE",
    candidate: {
      fullName: "Samir Rahman",
      nationality: "India",
      residentStatus: "ONSHORE",
      expectedJoining: "2026-09-01",
      email: "samir.rahman@falcontech-candidate.com",
      mobile: "+971 50 123 4567",
      privacyNoticeAcknowledged: true,
    },
    documents: [
      {
        code: "PASSPORT",
        label: "Passport (bio page)",
        status: "APPROVED",
        file: {
          id: "file-pass-0148",
          name: "Passport_Samir.pdf",
          sizeBytes: 2457600,
          mimeType: "application/pdf",
          uploadedAt: "2026-08-20T10:15:00Z",
        },
        expiresOn: "2031-03-14",
        expiringWithinDays: 1648,
        malwareScanPassed: true,
        fileTypeValid: true,
        rejectionReason: null,
      },
      {
        code: "EMIRATES_ID",
        label: "Emirates ID",
        status: "UNDER_REVIEW",
        file: {
          id: "file-eid-0148",
          name: "EID_Samir.pdf",
          sizeBytes: 1843200,
          mimeType: "application/pdf",
          uploadedAt: "2026-08-21T08:30:00Z",
        },
        expiresOn: "2027-11-21",
        expiringWithinDays: 439,
        malwareScanPassed: true,
        fileTypeValid: true,
        rejectionReason: null,
      },
      {
        code: "POLICE_CLEARANCE",
        label: "Police Clearance",
        status: "UPLOADED",
        file: {
          id: "file-pcc-0148",
          name: "Police_Clearance_Samir.pdf",
          sizeBytes: 3145728,
          mimeType: "application/pdf",
          uploadedAt: "2026-08-24T08:15:00Z",
        },
        expiresOn: "2026-10-30",
        expiringWithinDays: 51,
        malwareScanPassed: true,
        fileTypeValid: true,
        rejectionReason: null,
      },
      {
        code: "NDA",
        label: "NDA",
        status: "PENDING_SIGNATURE",
        file: null,
        expiresOn: null,
        expiringWithinDays: null,
        malwareScanPassed: null,
        fileTypeValid: null,
        rejectionReason: null,
        requiresSignature: true,
      },
    ],
    signature: {
      templateName: "DIEZ Standard Contractor Non-Disclosure Agreement v3.2",
      envelopeStatus: "SENT",
      signers: [
        { order: 1, name: "Samir Rahman", role: "Candidate", status: "PENDING" },
        { order: 2, name: "Aisha Al Nuaimi", role: "DIEZ", status: "PENDING" },
      ],
      previewUrl: "https://storage.diez.ae/legal/templates/nda-v3.2-preview.pdf",
      sentAt: "2026-08-24T09:00:00Z",
      signedAt: null,
    },
    deadline: {
      joiningDate: "2026-09-01",
      daysRemaining: 21,
      severity: "NORMAL",
    },
    canEdit: true,
    submittedToDiez: false,
  },

  // 0161 Rejected & Critical Onboarding Case (C-040 Kareem Mostafa)
  "ONB-2026-0161": {
    id: "ONB-2026-0161",
    requisitionId: "OMS-2026-0161",
    candidateRef: "C-040",
    positionTitle: "Senior DevOps Engineer",
    vendorId: "ven-falcon",
    vendorCoordinatorId: "usr-layla",
    residentStatus: "ONSHORE",
    candidate: {
      fullName: "Kareem Mostafa",
      nationality: "Egypt",
      residentStatus: "ONSHORE",
      expectedJoining: "2026-09-11",
      email: "kareem.mostafa@falcontech-candidate.com",
      mobile: "+971 50 444 3322",
      privacyNoticeAcknowledged: true,
    },
    documents: [
      {
        code: "PASSPORT",
        label: "Passport (bio page)",
        status: "APPROVED",
        file: {
          id: "file-pass-0161",
          name: "Passport_Kareem.pdf",
          sizeBytes: 2457600,
          mimeType: "application/pdf",
          uploadedAt: "2026-08-15T10:15:00Z",
        },
        expiresOn: "2030-05-20",
        expiringWithinDays: 1350,
        malwareScanPassed: true,
        fileTypeValid: true,
        rejectionReason: null,
      },
      {
        code: "EMIRATES_ID",
        label: "Emirates ID",
        status: "REJECTED",
        file: {
          id: "file-eid-0161",
          name: "EID_Kareem_Expired.pdf",
          sizeBytes: 1543200,
          mimeType: "application/pdf",
          uploadedAt: "2026-08-16T08:30:00Z",
        },
        expiresOn: "2026-08-01",
        expiringWithinDays: -39,
        malwareScanPassed: true,
        fileTypeValid: true,
        rejectionReason: "Emirates ID expired on 1 Aug 2026. Please upload renewed resident identity card.",
      },
      {
        code: "POLICE_CLEARANCE",
        label: "Police Clearance",
        status: "UPLOADED",
        file: {
          id: "file-pcc-0161",
          name: "Police_Clearance_Kareem.pdf",
          sizeBytes: 2945728,
          mimeType: "application/pdf",
          uploadedAt: "2026-08-16T09:15:00Z",
        },
        expiresOn: "2026-09-11",
        expiringWithinDays: 2,
        malwareScanPassed: false,
        fileTypeValid: true,
        rejectionReason: "Security quarantine: suspicious embedded macro detected.",
      },
      {
        code: "NDA",
        label: "NDA",
        status: "PENDING_SIGNATURE",
        file: null,
        expiresOn: null,
        expiringWithinDays: null,
        malwareScanPassed: null,
        fileTypeValid: null,
        rejectionReason: null,
        requiresSignature: true,
      },
    ],
    signature: {
      templateName: "DIEZ Standard Contractor Non-Disclosure Agreement v3.2",
      envelopeStatus: "SENT",
      signers: [
        { order: 1, name: "Kareem Mostafa", role: "Candidate", status: "PENDING" },
        { order: 2, name: "Aisha Al Nuaimi", role: "DIEZ", status: "PENDING" },
      ],
      previewUrl: "https://storage.diez.ae/legal/templates/nda-v3.2-preview.pdf",
      sentAt: "2026-08-16T10:00:00Z",
      signedAt: null,
    },
    deadline: {
      joiningDate: "2026-09-11",
      daysRemaining: 2,
      severity: "CRITICAL",
    },
    canEdit: true,
    submittedToDiez: false,
  },

  // 0095 Historical Onboarding Case (Completed 3 months ago)
  "ONB-2026-0095": {
    id: "ONB-2026-0095",
    requisitionId: "OMS-2026-0095",
    candidateRef: "C-019",
    positionTitle: "Network Engineer",
    vendorId: "ven-falcon",
    vendorCoordinatorId: "usr-layla",
    residentStatus: "ONSHORE",
    candidate: {
      fullName: "Vikram Patel",
      nationality: "India",
      residentStatus: "ONSHORE",
      expectedJoining: "2026-06-09",
      email: "vikram.patel@falcontech-candidate.com",
      mobile: "+971 50 112 2334",
      privacyNoticeAcknowledged: true,
    },
    documents: [
      {
        code: "PASSPORT",
        label: "Passport Copy",
        status: "APPROVED",
        file: {
          id: "file-pass-0095",
          name: "Passport_Vikram.pdf",
          sizeBytes: 2145728,
          mimeType: "application/pdf",
          uploadedAt: "2026-05-15T10:00:00Z",
        },
        expiresOn: "2031-04-10",
        expiringWithinDays: 1675,
        malwareScanPassed: true,
        fileTypeValid: true,
        rejectionReason: null,
      },
      {
        code: "EMIRATES_ID",
        label: "Emirates ID",
        status: "APPROVED",
        file: {
          id: "file-eid-0095",
          name: "EID_Vikram.pdf",
          sizeBytes: 1843200,
          mimeType: "application/pdf",
          uploadedAt: "2026-05-15T10:15:00Z",
        },
        expiresOn: "2028-06-01",
        expiringWithinDays: 630,
        malwareScanPassed: true,
        fileTypeValid: true,
        rejectionReason: null,
      },
    ],
    signature: {
      templateName: "DIEZ Standard Contractor Non-Disclosure Agreement v3.2",
      envelopeStatus: "SIGNED",
      signers: [
        { order: 1, name: "Vikram Patel", role: "Candidate", status: "SIGNED" },
        { order: 2, name: "Aisha Al Nuaimi", role: "DIEZ", status: "SIGNED" },
      ],
      previewUrl: "https://storage.diez.ae/legal/templates/nda-v3.2-preview.pdf",
      sentAt: "2026-05-16T08:00:00Z",
      signedAt: "2026-05-16T11:30:00Z",
    },
    deadline: {
      joiningDate: "2026-06-09",
      daysRemaining: 0,
      severity: "NORMAL",
    },
    canEdit: false,
    submittedToDiez: true,
  },
};

// Aliases for backwards compatibility with sandbox fixtures
ONBOARDING_CASES["ONB-2026-0061"] = ONBOARDING_CASES["ONB-2026-0148"];
ONBOARDING_CASES["ONB-2026-0062"] = ONBOARDING_CASES["ONB-2026-0102"];
ONBOARDING_CASES["ONB-2026-0064"] = ONBOARDING_CASES["ONB-2026-0161"];

export const ONBOARDING_CASES_LIST: OnboardingCase[] = Object.values(ONBOARDING_CASES);

// ============================================================================
// 9. Workforce Members
// ============================================================================

export const WORKFORCE_MEMBERS: Record<string, WorkforceMember> = {
  // 0095 — Network Engineer (Active, 9 months remaining)
  "wm-2026-0095": {
    id: "wm-2026-0095",
    requisitionId: "OMS-2026-0095",
    candidateRef: "C-019",
    onboardingId: "ONB-2026-0095",
    fullName: "Vikram Patel",
    positionTitle: "Network Engineer",
    departmentId: "dept-it-infra",
    departmentName: "IT Infrastructure",
    vendorId: "ven-falcon",
    vendorName: "Falcon Tech Resourcing",
    status: "ACTIVE",
    joinedDate: "2026-06-09", // Joined 3 months ago
    contractEndDate: "2027-06-08", // ~9 months remaining
    daysRemaining: 272,
    terminationDate: null,
    replacementRequisitionId: null,
    monthlyRate: 2500000, // AED 25,000.00
    annualCost: 30000000, // AED 300,000.00
  },

  // 0081 — QA Engineer (Active, ending in 21 days — inside 30-day runway window!)
  "wm-2026-0081": {
    id: "wm-2026-0081",
    requisitionId: "OMS-2026-0081",
    candidateRef: "C-011",
    onboardingId: "ONB-2025-0081",
    fullName: "Sarah Jenkins",
    positionTitle: "QA Engineer",
    departmentId: "dept-it-infra",
    departmentName: "IT Infrastructure",
    vendorId: "ven-falcon",
    vendorName: "Falcon Tech Resourcing",
    status: "ENDING_SOON",
    joinedDate: "2025-10-01",
    contractEndDate: "2026-09-30", // Inside 30 days! (21 days remaining)
    daysRemaining: 21,
    terminationDate: null,
    replacementRequisitionId: null,
    monthlyRate: 2333333,
    annualCost: 28000000,
  },

  // 0074 — Business Analyst (Terminated 2 months ago, replaced by 0074-R)
  "wm-2026-0074": {
    id: "wm-2026-0074",
    requisitionId: "OMS-2026-0074",
    candidateRef: "C-008",
    onboardingId: "ONB-2025-0074",
    fullName: "David Miller",
    positionTitle: "Business Analyst",
    departmentId: "dept-pmo",
    departmentName: "Project Management Office",
    vendorId: "ven-meridian",
    vendorName: "Meridian Workforce Solutions",
    status: "TERMINATED",
    joinedDate: "2025-07-01",
    contractEndDate: "2026-07-09",
    daysRemaining: 0,
    terminationDate: "2026-07-09", // 2 months ago
    replacementRequisitionId: "OMS-2026-0074-R",
    monthlyRate: 2083333,
    annualCost: 25000000,
  },
};

export const WORKFORCE_MEMBERS_LIST: WorkforceMember[] = Object.values(WORKFORCE_MEMBERS);

// ============================================================================
// 10. Supplementary Reconciliation Record (OMS-2026-0131)
// ============================================================================

export const RECONCILIATION_VARIANCE_RECORD: ReconciliationVariance = {
  id: "OMS-2026-0131",
  budgetLineId: "line-cs-dig-001",
  budgetLineCode: "CS-DIG-001",
  budgetLineName: "Cybersecurity Services FY2026",
  departmentId: "dept-digital-security",
  departmentName: "Digital Security",
  type: "ORACLE_VS_BUDGET_VARIANCE",
  description: "Oracle ledger actuals vs OMS committed funds variance on Cybersecurity Services FY2026 line",
  omsCommitted: 160000000,  // AED 1,600,000.00
  oracleActuals: 164500000, // AED 1,645,000.00
  varianceAmount: 4500000,  // AED 45,000.00 variance
  recordedAt: "2026-09-01T08:00:00Z",
  status: "UNRESOLVED",
};

// ============================================================================
// 11. Rate Cards (VENDOR-PORTAL-UI.md Part 4.7 & Part 6)
// ============================================================================

export const RATE_CARDS: Record<string, RateCard> = {
  "rc-falcon-001": {
    id: "rc-falcon-001",
    vendorId: "ven-falcon",
    code: "RC-FT-2026",
    name: "Falcon Tech IT Specialist Rate Card 2026",
    template: "DIEZA_PREMISES",
    status: "PUBLISHED",
    effectiveFrom: "2026-01-01",
    effectiveTo: "2026-12-31",
    currency: "AED",
    grades: [
      {
        gradeCode: "G6",
        level: "Junior",
        roleTitle: "Associate Systems / Security Analyst",
        minSalary: 1400000,
        maxSalary: 1800000,
        serviceChargePercent: 15,
        monthlyRate: 2070000, // AED 20,700.00
        dailyRate: 95000,     // AED 950.00
      },
      {
        gradeCode: "G7",
        level: "Mid-Level",
        roleTitle: "Cybersecurity Analyst / Infrastructure Engineer",
        minSalary: 1800000,
        maxSalary: 2400000,
        serviceChargePercent: 15,
        monthlyRate: 2760000, // AED 27,600.00
        dailyRate: 125000,    // AED 1,250.00
      },
      {
        gradeCode: "G8",
        level: "Senior",
        roleTitle: "Senior Cybersecurity Specialist / Systems Architect",
        minSalary: 2400000,
        maxSalary: 3200000,
        serviceChargePercent: 14,
        monthlyRate: 3648000, // AED 36,480.00
        dailyRate: 165000,    // AED 1,650.00
      },
      {
        gradeCode: "G9",
        level: "Lead",
        roleTitle: "Principal Security Architect / Project Director",
        minSalary: 3200000,
        maxSalary: 4200000,
        serviceChargePercent: 12,
        monthlyRate: 4704000, // AED 47,040.00
        dailyRate: 215000,    // AED 2,150.00
      },
    ],
  },
  "rc-falcon-002": {
    id: "rc-falcon-002",
    vendorId: "ven-falcon",
    code: "RC-FT-WFH-2026",
    name: "Falcon Tech UAE Remote (WFH) Software Engineering Rate Card",
    template: "UAE_REMOTE_WFH",
    status: "SUBMITTED",
    effectiveFrom: "2026-06-01",
    effectiveTo: "2027-05-31",
    currency: "AED",
    grades: [
      {
        gradeCode: "G6",
        level: "Junior",
        roleTitle: "Remote Software QA Analyst",
        minSalary: 1200000,
        maxSalary: 1600000,
        serviceChargePercent: 12,
        monthlyRate: 1568000, // AED 15,680.00
        dailyRate: 72000,     // AED 720.00
      },
      {
        gradeCode: "G7",
        level: "Mid-Level",
        roleTitle: "Remote Full Stack / DevOps Engineer",
        minSalary: 1600000,
        maxSalary: 2200000,
        serviceChargePercent: 12,
        monthlyRate: 2128000, // AED 21,280.00
        dailyRate: 97000,     // AED 970.00
      },
      {
        gradeCode: "G8",
        level: "Senior",
        roleTitle: "Remote Senior Backend Engineer",
        minSalary: 2100000,
        maxSalary: 2800000,
        serviceChargePercent: 11,
        monthlyRate: 2719500, // AED 27,195.00
        dailyRate: 124000,    // AED 1,240.00
      },
      {
        gradeCode: "G9",
        level: "Lead",
        roleTitle: "Remote Cloud Solutions Architect",
        minSalary: 2800000,
        maxSalary: 3800000,
        serviceChargePercent: 10,
        monthlyRate: 3630000, // AED 36,300.00
        dailyRate: 165000,    // AED 1,650.00
      },
    ],
  },
  "rc-falcon-003": {
    id: "rc-falcon-003",
    vendorId: "ven-falcon",
    code: "RC-FT-ABROAD-2026",
    name: "Falcon Tech Offshore Remote (Abroad) Specialists Draft",
    template: "REMOTE_ABROAD",
    status: "DRAFT",
    effectiveFrom: "2026-09-01",
    effectiveTo: "2027-08-31",
    currency: "AED",
    grades: [
      {
        gradeCode: "G6",
        level: "Junior",
        roleTitle: "Offshore Data Migration Assistant",
        minSalary: 800000,
        maxSalary: 1100000,
        serviceChargePercent: 10,
        monthlyRate: 1045000, // AED 10,450.00
        dailyRate: 48000,     // AED 480.00
      },
      {
        gradeCode: "G7",
        level: "Mid-Level",
        roleTitle: "Offshore Systems Developer",
        minSalary: 1100000,
        maxSalary: 1500000,
        serviceChargePercent: 10,
        monthlyRate: 1430000, // AED 14,300.00
        dailyRate: 65000,     // AED 650.00
      },
    ],
  },
};

export const RATE_CARDS_LIST: RateCard[] = Object.values(RATE_CARDS);

// ============================================================================
// 12. Vendor Compliance Documents (VENDOR-PORTAL-UI.md Part 4.9 & Part 6)
// ============================================================================

export const VENDOR_COMPLIANCE_DOCUMENTS: Record<string, VendorComplianceDocument> = {
  "doc-tl-001": {
    id: "doc-tl-001",
    vendorId: "ven-falcon",
    documentType: "TRADE_LICENCE",
    title: "Commercial Trade Licence",
    issuingAuthority: "Dubai Economy & Tourism (DET)",
    licenceNumber: "DET-849201",
    status: "EXPIRING_SOON",
    expiresOn: "2026-10-04",
    daysRemaining: 24,
    severity: "WARNING",
    file: {
      id: "f-tl-2026",
      name: "Falcon_Tech_Trade_Licence_2026.pdf",
      sizeBytes: 1482092,
      uploadedAt: "2025-10-05T09:00:00Z",
    },
  },
  "doc-tax-001": {
    id: "doc-tax-001",
    vendorId: "ven-falcon",
    documentType: "TAX_REGISTRATION",
    title: "VAT Registration Certificate (TRN)",
    issuingAuthority: "Federal Tax Authority (FTA)",
    licenceNumber: "100-3492-9102-0003",
    status: "ACTIVE",
    expiresOn: "2027-12-31",
    daysRemaining: 477,
    severity: "NORMAL",
    file: {
      id: "f-tax-2026",
      name: "Falcon_Tech_TRN_Certificate.pdf",
      sizeBytes: 814920,
      uploadedAt: "2024-01-10T11:00:00Z",
    },
  },
  "doc-ins-001": {
    id: "doc-ins-001",
    vendorId: "ven-falcon",
    documentType: "INSURANCE",
    title: "Commercial General Liability Insurance",
    issuingAuthority: "Oman Insurance Company (Sukoon)",
    licenceNumber: "POL-GL-2026-9912",
    status: "ACTIVE",
    expiresOn: "2027-04-15",
    daysRemaining: 217,
    severity: "NORMAL",
    file: {
      id: "f-ins-2026",
      name: "Falcon_Tech_CGL_Insurance_Schedule.pdf",
      sizeBytes: 2314902,
      uploadedAt: "2026-04-15T14:30:00Z",
    },
  },
  "doc-iso-001": {
    id: "doc-iso-001",
    vendorId: "ven-falcon",
    documentType: "ISO_CERTIFICATE",
    title: "ISO 27001:2022 Information Security Management",
    issuingAuthority: "BSI Middle East",
    licenceNumber: "ISMS-774912",
    status: "ACTIVE",
    expiresOn: "2028-06-30",
    daysRemaining: 659,
    severity: "NORMAL",
    file: {
      id: "f-iso-2026",
      name: "Falcon_Tech_ISO27001_Certificate.pdf",
      sizeBytes: 1948210,
      uploadedAt: "2025-06-30T10:00:00Z",
    },
  },
};

export const VENDOR_COMPLIANCE_DOCUMENTS_LIST: VendorComplianceDocument[] = Object.values(VENDOR_COMPLIANCE_DOCUMENTS);

// ============================================================================
// 13. Vendor Contracts (VENDOR-PORTAL-UI.md Part 4.6 & RFP Step 4)
// ============================================================================

export const VENDOR_CONTRACTS: Record<string, VendorContract> = {
  "ct-falcon-001": {
    id: "ct-falcon-001",
    contractCode: "DIEZ-MSA-2025-0042",
    vendorId: "ven-falcon",
    title: "Master IT & Cybersecurity Professional Services Agreement",
    status: "ACTIVE",
    template: "DIEZA_PREMISES",
    validFrom: "2025-01-01",
    validTo: "2027-12-31",
    preAgreedMonthlyRate: 3100000, // AED 31,000.00 / month pre-agreed contract rate
    preAgreedDailyRate: 140000,   // AED 1,400.00 / day
    applicablePositions: [
      "Cloud Security Engineer",
      "Penetration Tester",
      "Senior Cybersecurity Analyst",
      "SOC Analyst",
    ],
  },
  "ct-falcon-002": {
    id: "ct-falcon-002",
    contractCode: "DIEZ-MSA-2023-0019",
    vendorId: "ven-falcon",
    title: "Enterprise Remote Software Engineering & Maintenance Support",
    status: "EXPIRED",
    template: "UAE_REMOTE_WFH",
    validFrom: "2023-01-01",
    validTo: "2024-12-31",
    preAgreedMonthlyRate: 2400000, // AED 24,000.00 / month pre-agreed rate
    preAgreedDailyRate: 110000,   // AED 1,100.00 / day
    applicablePositions: [
      "Full Stack Engineer",
      "DevOps Engineer",
      "Software QA Automation Specialist",
    ],
  },
};

export const VENDOR_CONTRACTS_LIST: VendorContract[] = Object.values(VENDOR_CONTRACTS);

