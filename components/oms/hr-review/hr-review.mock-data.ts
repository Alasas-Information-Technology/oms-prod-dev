import {
  HrComplianceCheck,
  HrDispositionDefinition,
  HrReviewRequest,
  HrReviewSlaState,
} from "./hr-review.types";

function createComplianceChecks(
  reviewRequiredLabel?: string
): HrComplianceCheck[] {
  const labels = [
    "Outsourcing suitability",
    "Job profile attached",
    "AD approval completed",
    "Budget availability",
    "Segregation of duties",
  ];

  return labels.map((label) => ({
    id: label
      .toLowerCase()
      .replaceAll(" ", "-"),

    label,

    state:
      label === reviewRequiredLabel
        ? "review-required"
        : "passed",

    note:
      label === reviewRequiredLabel
        ? "HR confirmation is required before disposition."
        : undefined,
  }));
}

interface HrReviewSeed {
  requestId: string;
  position: string;
  department: string;
  resources: number;
  engagementMonths: number;
  expectedStart: string;
  grade: string;
  queueStatus:
    HrReviewRequest["queueStatus"];
  slaAgeDays: number;
  slaState: HrReviewSlaState;
  budget: number;
  businessNeed: string;
  requestedBy: string;
  reviewRequiredLabel?: string;
  location?: string;
  candidateVisibility?: string;
  budgetVerified?: boolean;
}

function createHrReviewRequest(
  seed: HrReviewSeed
): HrReviewRequest {
  const personnelAmount = Math.round(
    seed.budget * 0.65
  );

  const supportAmount =
    seed.budget - personnelAmount;

  return {
    id: seed.requestId,
    requestId: seed.requestId,
    position: seed.position,
    department: seed.department,
    resources: seed.resources,
    engagementMonths:
      seed.engagementMonths,
    expectedStart: seed.expectedStart,
    grade: seed.grade,

    location:
      seed.location ??
      "DIEZ Premises",

    candidateVisibility:
      seed.candidateVisibility ??
      "Unknown candidates",

    queueStatus: seed.queueStatus,
    slaAgeDays: seed.slaAgeDays,
    slaTargetDays: 3,
    slaState: seed.slaState,

    budgetVerified:
      seed.budgetVerified ?? true,

    businessNeed: seed.businessNeed,

    complianceChecks:
      createComplianceChecks(
        seed.reviewRequiredLabel
      ),

    budget: {
      approved: seed.budget,
      reserved: seed.budget,
      availableRemaining:
        seed.budget,
      fundingRoute: "Budgeted",

      verified:
        seed.budgetVerified ?? true,

      budgetCode: `HR-${seed.department
        .replaceAll(" ", "-")
        .toUpperCase()
        .slice(0, 18)}-FY2026`,

      budgetName:
        `${seed.department} FY2026`,

      lines: [
        {
          id: `${seed.requestId}-personnel`,
          label: "Personnel services",
          amount: personnelAmount,
        },
        {
          id: `${seed.requestId}-support`,
          label:
            "Operational and compliance support",
          amount: supportAmount,
        },
      ],
    },

    approvalTrail: [
      {
        id: `${seed.requestId}-submitted`,
        stage: "Requestor submitted",
        approver: seed.requestedBy,
        completedAt: "04 Aug, 09:18",
        state: "completed",
      },
      {
        id: `${seed.requestId}-line-manager`,
        stage:
          "Line Manager approved",
        approver: "Omar Al Hashmi",
        completedAt: "04 Aug, 14:42",
        state: "completed",
      },
      {
        id: `${seed.requestId}-section-head`,
        stage:
          "Section Head approved",
        approver: "Fatima Al Marri",
        completedAt: "05 Aug, 10:05",
        state: "completed",
      },
      {
        id: `${seed.requestId}-hod`,
        stage: "HOD approved",
        approver:
          "Khalid Al Suwaidi",
        completedAt: "05 Aug, 11:15",
        state: "completed",
      },
    ],

    attachments: [
      {
        id: `${seed.requestId}-job-profile`,

        name: `${seed.position
          .replaceAll(" ", "-")
          .toLowerCase()}-profile.pdf`,

        type: "PDF",
        size: "1.4 MB",
        uploadedBy: seed.requestedBy,
        uploadedAt:
          "04 Aug 2026, 09:12",
      },
      {
        id: `${seed.requestId}-business-case`,
        name:
          "business-justification.docx",
        type: "DOCX",
        size: "640 KB",
        uploadedBy: seed.requestedBy,
        uploadedAt:
          "04 Aug 2026, 09:14",
      },
      {
        id: `${seed.requestId}-budget`,
        name:
          "budget-confirmation.pdf",
        type: "PDF",
        size: "820 KB",
        uploadedBy:
          "Finance Operations",
        uploadedAt:
          "05 Aug 2026, 12:20",
      },
    ],

    audit: [
      {
        id: `${seed.requestId}-audit-created`,
        action: "Request created",
        actor: seed.requestedBy,
        occurredAt:
          "04 Aug 2026, 09:18",
        description:
          "The requisition was created and submitted for approval.",
      },
      {
        id: `${seed.requestId}-audit-department`,
        action:
          "Department approvals completed",
        actor:
          "Khalid Al Suwaidi",
        occurredAt:
          "05 Aug 2026, 11:15",
        description:
          "All required department approval stages were completed.",
      },
      {
        id: `${seed.requestId}-audit-budget`,
        action:
          "Budget position verified",
        actor:
          "Finance Operations",
        occurredAt:
          "05 Aug 2026, 12:20",
        description:
          "Funding reservation and available balance were checked.",
      },
      {
        id: `${seed.requestId}-audit-hr`,
        action:
          "Sent to HR Review",
        actor: "OMS Workflow",
        occurredAt:
          "05 Aug 2026, 12:21",
        description:
          "The request entered the HR Review queue.",
      },
    ],
  };
}

export const MOCK_HR_REVIEW_REQUESTS:
  HrReviewRequest[] = [
  createHrReviewRequest({
    requestId: "OMS-2026-0148",
    position:
      "Senior Cybersecurity Analyst",
    department: "Digital Security",
    resources: 2,
    engagementMonths: 12,
    expectedStart: "2026-09-01",
    grade: "G8",
    queueStatus:
      "Awaiting HR Review",
    slaAgeDays: 1,
    slaState: "within-target",
    budget: 620000,
    requestedBy:
      "Mariam Al Mansoori",

    reviewRequiredLabel:
      "Outsourcing suitability",

    businessNeed:
      "Enhance cyber-risk monitoring, threat detection and incident response capability in line with IT security strategy and regulatory requirements.",
  }),

  createHrReviewRequest({
    requestId: "OMS-2026-0143",
    position: "Cloud Engineer",
    department: "IT Infrastructure",
    resources: 1,
    engagementMonths: 12,
    expectedStart: "2026-09-15",
    grade: "G7",
    queueStatus: "New",
    slaAgeDays: 3,
    slaState: "due-soon",
    budget: 310000,
    requestedBy: "Salma Al Ketbi",

    businessNeed:
      "Provide cloud engineering capacity for platform migration, resilience improvement and operational support.",
  }),

  createHrReviewRequest({
    requestId: "OMS-2026-0139",
    position:
      "Data Governance Specialist",
    department: "Data Management",
    resources: 1,
    engagementMonths: 9,
    expectedStart: "2026-10-01",
    grade: "G7",
    queueStatus:
      "Clarification Returned",
    slaAgeDays: 5,
    slaState: "overdue",
    budget: 285000,
    requestedBy: "Aisha Al Nuaimi",

    reviewRequiredLabel:
      "Job profile attached",

    businessNeed:
      "Strengthen data ownership, catalogue governance and regulatory reporting across business units.",
  }),

  createHrReviewRequest({
    requestId: "OMS-2026-0128",
    position: "PMO Analyst",
    department:
      "Project Management Office",
    resources: 1,
    engagementMonths: 6,
    expectedStart: "2026-10-15",
    grade: "G6",
    queueStatus: "New",
    slaAgeDays: 5,
    slaState: "overdue",
    budget: 220000,
    requestedBy:
      "Hessa Al Suwaidi",

    reviewRequiredLabel:
      "Budget availability",

    budgetVerified: false,

    businessNeed:
      "Support portfolio reporting, dependency tracking and executive governance for the approved transformation programme.",
  }),

  createHrReviewRequest({
    requestId: "OMS-2026-0124",
    position:
      "Network Operations Engineer",
    department: "IT Infrastructure",
    resources: 2,
    engagementMonths: 12,
    expectedStart: "2026-10-20",
    grade: "G7",
    queueStatus:
      "Awaiting HR Review",
    slaAgeDays: 2,
    slaState: "within-target",
    budget: 475000,
    requestedBy: "Omar Al Falasi",

    businessNeed:
      "Maintain network availability and provide additional operational coverage for critical infrastructure services.",
  }),

  createHrReviewRequest({
    requestId: "OMS-2026-0119",
    position:
      "Procurement Category Specialist",
    department: "Procurement",
    resources: 1,
    engagementMonths: 12,
    expectedStart: "2026-11-01",
    grade: "G7",
    queueStatus: "New",
    slaAgeDays: 1,
    slaState: "within-target",
    budget: 240000,
    requestedBy: "Layla Al Marri",

    businessNeed:
      "Increase category sourcing capacity and strengthen supplier performance governance for technology contracts.",
  }),

  createHrReviewRequest({
    requestId: "OMS-2026-0116",
    position:
      "Enterprise Architect",
    department:
      "Enterprise Architecture",
    resources: 1,
    engagementMonths: 12,
    expectedStart: "2026-11-10",
    grade: "G9",
    queueStatus:
      "Awaiting HR Review",
    slaAgeDays: 3,
    slaState: "due-soon",
    budget: 410000,
    requestedBy:
      "Noura Al Mazrouei",

    reviewRequiredLabel:
      "Segregation of duties",

    businessNeed:
      "Provide architecture governance for enterprise platforms and ensure alignment with approved technology standards.",
  }),

  createHrReviewRequest({
    requestId: "OMS-2026-0110",
    position:
      "Finance Reporting Analyst",
    department: "Finance",
    resources: 1,
    engagementMonths: 8,
    expectedStart: "2026-11-15",
    grade: "G6",
    queueStatus: "New",
    slaAgeDays: 2,
    slaState: "within-target",
    budget: 190000,
    requestedBy:
      "Hessa Al Suwaidi",

    businessNeed:
      "Support management reporting, budget monitoring and monthly financial control activities.",
  }),

  createHrReviewRequest({
    requestId: "OMS-2026-0107",
    position:
      "Service Delivery Manager",
    department:
      "Corporate Services",
    resources: 1,
    engagementMonths: 12,
    expectedStart: "2026-11-20",
    grade: "G8",
    queueStatus:
      "Clarification Returned",
    slaAgeDays: 4,
    slaState: "overdue",
    budget: 360000,
    requestedBy:
      "Mariam Al Mansoori",

    reviewRequiredLabel:
      "Outsourcing suitability",

    businessNeed:
      "Improve service governance, SLA reporting and supplier coordination across corporate support functions.",
  }),

  createHrReviewRequest({
    requestId: "OMS-2026-0101",
    position:
      "Business Process Consultant",
    department:
      "Operational Excellence",
    resources: 1,
    engagementMonths: 10,
    expectedStart: "2026-12-01",
    grade: "G8",
    queueStatus:
      "Awaiting HR Review",
    slaAgeDays: 2,
    slaState: "within-target",
    budget: 255000,
    requestedBy:
      "Fatima Al Marri",

    businessNeed:
      "Redesign priority business processes and support implementation of agreed operational improvements.",
  }),

  createHrReviewRequest({
    requestId: "OMS-2026-0096",
    position:
      "Information Security Officer",
    department: "Digital Security",
    resources: 1,
    engagementMonths: 12,
    expectedStart: "2026-12-05",
    grade: "G8",
    queueStatus:
      "Clarification Returned",
    slaAgeDays: 6,
    slaState: "overdue",
    budget: 330000,
    requestedBy:
      "Noura Al Mazrouei",

    reviewRequiredLabel:
      "AD approval completed",

    businessNeed:
      "Support security policy assurance, control testing and evidence management for regulatory assessments.",
  }),

  createHrReviewRequest({
    requestId: "OMS-2026-0092",
    position:
      "Onboarding Coordinator",
    department: "Human Resources",
    resources: 2,
    engagementMonths: 6,
    expectedStart: "2026-12-10",
    grade: "G5",
    queueStatus: "New",
    slaAgeDays: 1,
    slaState: "within-target",
    budget: 180000,
    requestedBy:
      "Aisha Al Nuaimi",

    businessNeed:
      "Provide temporary onboarding capacity during the planned recruitment and mobilisation period.",
  }),
];

export const HR_DISPOSITION_ACTIONS:
  HrDispositionDefinition[] = [
  {
    id: "approve-oms",
    label: "Approve as OMS",

    description:
      "Approve the request to continue through the OMS workflow.",

    tone: "primary",
    requiresComment: true,
  },
  {
    id: "request-more-info",
    label: "Request More Info",

    description:
      "Return the request to the owner for additional information.",

    tone: "outline",
    requiresComment: true,
  },
  {
    id: "request-info-with-approval",
    label:
      "Request Info with Approval",

    description:
      "Approve conditionally while requesting supporting information.",

    tone: "outline",
    requiresComment: true,
  },
  {
    id: "amend-request",
    label: "Amend Request",

    description:
      "Return the request with required amendments before approval.",

    tone: "outline",
    requiresComment: true,
  },
  {
    id: "approve-permanent-hire",
    label:
      "Approve as Permanent Hire",

    description:
      "Approve the requirement through the permanent hiring route.",

    tone: "outline",
    requiresComment: true,
  },
  {
    id: "reject",
    label: "Reject",

    description:
      "Reject the request and record the HR justification.",

    tone: "danger",
    requiresComment: true,
  },
];