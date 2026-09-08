/**
 * Interview Evaluation — Mock Fixtures
 *
 * SIX comprehensive fixtures exercising:
 *  a) Reference Case (FIXTURE_EVALUATION_REFERENCE):
 *     C-014, P1, six criteria weighted 25/20/15/15/15/10, ratings 5/4/4/4/5/4,
 *     overall 86.7. Approved 31000000, expected 29800000, variance -1200000,
 *     WITHIN_BUDGET. Panel of three, two complete, Omar pending.
 *     Positions 2 required, 1 filled. Due today.
 *  b) Over Budget Case (FIXTURE_EVALUATION_OVER_BUDGET):
 *     expected 33500000, variance +2500000 (AED 25,000.00 over budget).
 *  c) Single Interviewer Case (FIXTURE_EVALUATION_SINGLE_INTERVIEWER):
 *     panel.isPanel false, single evaluator scorecard.
 *  d) Panel Disagreement Case (FIXTURE_EVALUATION_DISAGREEMENT):
 *     Panel with a disagreement: Communication rated 5, 3, 2 (spread 3).
 *  e) Interview Not Confirmed Case (FIXTURE_EVALUATION_NOT_OCCURRED):
 *     interview.occurred false — not yet confirmed.
 *  f) Overdue Case (FIXTURE_EVALUATION_OVERDUE):
 *     Deadline OVERDUE by 2 days, overdue red banner state.
 *
 * CRITICAL ARCHITECTURAL INVARIANT 1:
 * ALL MONETARY VALUES ARE INTEGERS IN MINOR UNITS (fils: 1 AED = 100 fils).
 *
 * CRITICAL ARCHITECTURAL INVARIANT 2:
 * Zero vendor fields anywhere in these fixtures. Blind Review boundary is strictly preserved.
 */

import {
  CriterionAnchorMap,
  EvaluationCriterion,
  InterviewEvaluationWorkspace,
  RejectionReason,
} from "@/src/types/interview-evaluation";

// ─────────────────────────────────────────────────────────────────────────────
// Shared Scoring Anchors
// ─────────────────────────────────────────────────────────────────────────────

export const STANDARD_5_POINT_ANCHORS: CriterionAnchorMap = {
  "1": "Well below requirement",
  "2": "Below requirement",
  "3": "Meets requirement",
  "4": "Above requirement",
  "5": "Outstanding",
};

// ─────────────────────────────────────────────────────────────────────────────
// Shared Criteria List for Senior Cybersecurity Analyst
// Weights sum to 100%: 25 + 20 + 15 + 15 + 15 + 10 = 100
// Ratings: 5/4/4/4/5/4 -> Server weighted overall score: 86.7%
// ─────────────────────────────────────────────────────────────────────────────

export const REFERENCE_CRITERIA: EvaluationCriterion[] = [
  {
    code: "TECHNICAL_EXPERTISE",
    label: "Technical expertise",
    weightPercent: 25,
    anchors: STANDARD_5_POINT_ANCHORS,
    rating: 5,
  },
  {
    code: "CYBERSECURITY_OPS",
    label: "Cybersecurity operations",
    weightPercent: 20,
    anchors: STANDARD_5_POINT_ANCHORS,
    rating: 4,
  },
  {
    code: "PROBLEM_SOLVING",
    label: "Problem solving & incident handling",
    weightPercent: 15,
    anchors: STANDARD_5_POINT_ANCHORS,
    rating: 4,
  },
  {
    code: "COMMUNICATION",
    label: "Communication & stakeholder management",
    weightPercent: 15,
    anchors: STANDARD_5_POINT_ANCHORS,
    rating: 4,
  },
  {
    code: "INCIDENT_RESPONSE",
    label: "Incident response under pressure",
    weightPercent: 15,
    anchors: STANDARD_5_POINT_ANCHORS,
    rating: 5,
  },
  {
    code: "DIEZ_FIT",
    label: "DIEZ environment & culture fit",
    weightPercent: 10,
    anchors: STANDARD_5_POINT_ANCHORS,
    rating: 4,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Shared PDPL-Compliant Rejection Reasons
// ─────────────────────────────────────────────────────────────────────────────

export const STANDARD_REJECTION_REASONS: RejectionReason[] = [
  {
    code: "NOT_SUITABLE_KEEP_CV",
    label: "Doesn't meet requirements — keep the CV",
    retentionConsequence: "The CV is stored centrally for future roles.",
    deletionDate: null,
  },
  {
    code: "NOT_SUITABLE_DELETE_CV",
    label: "Doesn't meet requirements — don't keep the CV",
    retentionConsequence: "The CV will be deleted on 11 Feb 2027.",
    deletionDate: "2027-02-11",
  },
  {
    code: "DUPLICATE_CV",
    label: "Duplicate CV",
    retentionConsequence: "The CV will be deleted on 11 Feb 2027.",
    deletionDate: "2027-02-11",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// FIXTURE A: Reference Case (FIXTURE_EVALUATION_REFERENCE)
// C-014, P1, 6 criteria 25/20/15/15/15/10, ratings 5/4/4/4/5/4, overall 86.7
// Approved 31000000, expected 29800000, variance -1200000, WITHIN_BUDGET
// Panel of three (2 complete, Omar pending). Positions 2 req, 1 filled. Due today.
// ─────────────────────────────────────────────────────────────────────────────

export const FIXTURE_EVALUATION_REFERENCE: InterviewEvaluationWorkspace = {
  candidateRef: "C-014",
  priority: "P1",
  requestId: "OMS-2026-0148",
  position: "Senior Cybersecurity Analyst",

  interview: {
    occurred: true,
    confirmedAt: "2026-08-12T07:45:00Z",
    method: "ONLINE",
    scheduledFor: "2026-08-12T07:00:00Z",
    nonOccurrenceReason: null,
    nonOccurrenceNotes: null,
  },

  canEvaluate: true,
  isMainInterviewer: true,
  readOnlyReason: null,

  criteria: REFERENCE_CRITERIA,
  overallScore: 86.7,
  overallAnchor: "Above requirement",

  comments:
    "Strong technical foundation in SIEM and SOC operations. Demonstrated sound incident triage methodology and clear stakeholder communications.",
  strengthTags: ["SIEM & SOC", "Incident response"],
  developmentTags: ["DIEZ internal processes"],
  suggestedTags: [
    "SIEM & SOC",
    "Threat hunting",
    "Regulatory knowledge",
    "Cloud Security",
    "Vulnerability Management",
  ],

  panel: {
    isPanel: true,
    targetCount: 3,
    completedCount: 2,
    contributors: [
      {
        userId: "usr-091",
        name: "Noura Al Mazrouei",
        role: "Main interviewer",
        isYou: true,
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
        userId: "usr-104",
        name: "Yousef Al Falasi",
        role: "Senior SOC Analyst",
        isYou: false,
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
        userId: "usr-118",
        name: "Omar Al Hashmi",
        role: "Infrastructure Manager",
        isYou: false,
        status: "PENDING",
        overallScore: null,
        criteria: [],
      },
    ],
    disagreements: [],
  },

  candidate: {
    experienceYears: 9,
    noticePeriod: "2 weeks",
    leadTimeDays: 14,
    specialTerms: "Standard",
    vendorHidden: true,
  },

  cost: {
    approvedBudget: 31000000,     // AED 310,000.00
    expectedAnnualCost: 29800000, // AED 298,000.00
    variance: -1200000,           // -AED 12,000.00
    status: "WITHIN_BUDGET",
    overBudgetConsequence: null,
  },

  positions: {
    required: 2,
    filled: 1,
    thisWouldFill: 2,
  },

  rejectionReasons: STANDARD_REJECTION_REASONS,

  deadline: {
    dueAt: "2026-08-12T00:00:00Z",
    daysRemaining: 0,
    severity: "WARNING", // Due today
    overdueMessage: null,
  },

  auditTrail: [
    {
      event: "PROMPT_SENT",
      label: "Evaluation prompt sent",
      at: "2026-08-12T07:45:00Z",
      actor: "System",
    },
    {
      event: "DUE_DATE_SET",
      label: "Evaluation deadline set",
      at: "2026-08-12T07:45:00Z",
      actor: "System",
    },
    {
      event: "INTERVIEW_CONFIRMED",
      label: "Interview confirmed as completed",
      at: "2026-08-12T08:00:00Z",
      actor: "Noura Al Mazrouei",
    },
    {
      event: "DRAFT_SAVED",
      label: "Evaluation draft saved",
      at: "2026-08-12T08:15:30Z",
      actor: "Noura Al Mazrouei",
    },
  ],

  immutabilityNotice:
    "Once submitted, the outcome can only be changed under controlled correction.",
};

// ─────────────────────────────────────────────────────────────────────────────
// FIXTURE B: Over Budget Case (FIXTURE_EVALUATION_OVER_BUDGET)
// expected 33500000, variance +2500000, OVER_BUDGET
// ─────────────────────────────────────────────────────────────────────────────

export const FIXTURE_EVALUATION_OVER_BUDGET: InterviewEvaluationWorkspace = {
  ...FIXTURE_EVALUATION_REFERENCE,
  cost: {
    approvedBudget: 31000000,     // AED 310,000.00
    expectedAnnualCost: 33500000, // AED 335,000.00
    variance: 2500000,            // +AED 25,000.00 (over budget)
    status: "OVER_BUDGET",
    overBudgetConsequence:
      "This is AED 25,000.00 over the approved budget. Qualifying starts a Budget Amendment, which needs Finance approval before onboarding can begin.",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// FIXTURE C: Single Interviewer Case (FIXTURE_EVALUATION_SINGLE_INTERVIEWER)
// Single interviewer, panel.isPanel false
// ─────────────────────────────────────────────────────────────────────────────

export const FIXTURE_EVALUATION_SINGLE_INTERVIEWER: InterviewEvaluationWorkspace = {
  ...FIXTURE_EVALUATION_REFERENCE,
  panel: {
    isPanel: false,
    targetCount: 1,
    completedCount: 1,
    contributors: [
      {
        userId: "usr-091",
        name: "Noura Al Mazrouei",
        role: "Main interviewer",
        isYou: true,
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
    ],
    disagreements: [],
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// FIXTURE D: Panel Disagreement Case (FIXTURE_EVALUATION_DISAGREEMENT)
// Panel with a disagreement: Communication rated 5, 3, 2 across 3 evaluators
// ─────────────────────────────────────────────────────────────────────────────

export const FIXTURE_EVALUATION_DISAGREEMENT: InterviewEvaluationWorkspace = {
  ...FIXTURE_EVALUATION_REFERENCE,
  panel: {
    isPanel: true,
    targetCount: 3,
    completedCount: 3,
    contributors: [
      {
        userId: "usr-091",
        name: "Noura Al Mazrouei",
        role: "Main interviewer",
        isYou: true,
        status: "COMPLETE",
        overallScore: 86.7,
        criteria: [
          { code: "TECHNICAL_EXPERTISE", rating: 5 },
          { code: "CYBERSECURITY_OPS", rating: 4 },
          { code: "PROBLEM_SOLVING", rating: 4 },
          { code: "COMMUNICATION", rating: 5 },
          { code: "INCIDENT_RESPONSE", rating: 5 },
          { code: "DIEZ_FIT", rating: 4 },
        ],
      },
      {
        userId: "usr-104",
        name: "Yousef Al Falasi",
        role: "Senior SOC Analyst",
        isYou: false,
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
        userId: "usr-118",
        name: "Omar Al Hashmi",
        role: "Infrastructure Manager",
        isYou: false,
        status: "COMPLETE",
        overallScore: 76.7,
        criteria: [
          { code: "TECHNICAL_EXPERTISE", rating: 4 },
          { code: "CYBERSECURITY_OPS", rating: 4 },
          { code: "PROBLEM_SOLVING", rating: 3 },
          { code: "COMMUNICATION", rating: 2 },
          { code: "INCIDENT_RESPONSE", rating: 4 },
          { code: "DIEZ_FIT", rating: 4 },
        ],
      },
    ],
    disagreements: [
      {
        criterionCode: "COMMUNICATION",
        ratings: [5, 3, 2],
        spread: 3,
      },
    ],
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// FIXTURE E: Interview Not Confirmed Case (FIXTURE_EVALUATION_NOT_OCCURRED)
// interview.occurred false — not yet confirmed
// ─────────────────────────────────────────────────────────────────────────────

export const FIXTURE_EVALUATION_NOT_OCCURRED: InterviewEvaluationWorkspace = {
  ...FIXTURE_EVALUATION_REFERENCE,
  interview: {
    occurred: false,
    confirmedAt: null,
    method: "ONLINE",
    scheduledFor: "2026-08-12T07:00:00Z",
    nonOccurrenceReason: null,
    nonOccurrenceNotes: null,
  },
  criteria: REFERENCE_CRITERIA.map((c) => ({
    ...c,
    rating: null,
  })),
  overallScore: null,
  overallAnchor: null,
  comments: "",
  strengthTags: [],
  developmentTags: [],
};

// ─────────────────────────────────────────────────────────────────────────────
// FIXTURE F: Deadline Overdue Case (FIXTURE_EVALUATION_OVERDUE)
// Deadline OVERDUE by 2 days
// ─────────────────────────────────────────────────────────────────────────────

export const FIXTURE_EVALUATION_OVERDUE: InterviewEvaluationWorkspace = {
  ...FIXTURE_EVALUATION_REFERENCE,
  deadline: {
    dueAt: "2026-08-10T00:00:00Z",
    daysRemaining: -2,
    severity: "OVERDUE",
    overdueMessage:
      "This evaluation is 2 days overdue. Procurement is waiting to begin onboarding.",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// FIXTURE G: Non-Main Interviewer Panel Member (FIXTURE_EVALUATION_NON_MAIN)
// isMainInterviewer: false — panel member can rate, but cannot decide outcome
// ─────────────────────────────────────────────────────────────────────────────

export const FIXTURE_EVALUATION_NON_MAIN: InterviewEvaluationWorkspace = {
  ...FIXTURE_EVALUATION_REFERENCE,
  isMainInterviewer: false,
  panel: {
    ...FIXTURE_EVALUATION_REFERENCE.panel,
    contributors: FIXTURE_EVALUATION_REFERENCE.panel.contributors.map((c) =>
      c.role === "Main interviewer"
        ? { ...c, isYou: false }
        : c.name === "Yousef Al Falasi"
        ? { ...c, isYou: true }
        : c
    ),
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Mock Fixtures Registry by Identifier
// ─────────────────────────────────────────────────────────────────────────────

export const MOCK_INTERVIEW_EVALUATION_FIXTURES: Record<
  string,
  InterviewEvaluationWorkspace
> = {
  reference: FIXTURE_EVALUATION_REFERENCE,
  "over-budget": FIXTURE_EVALUATION_OVER_BUDGET,
  "single-interviewer": FIXTURE_EVALUATION_SINGLE_INTERVIEWER,
  disagreement: FIXTURE_EVALUATION_DISAGREEMENT,
  "not-occurred": FIXTURE_EVALUATION_NOT_OCCURRED,
  overdue: FIXTURE_EVALUATION_OVERDUE,
  "non-main": FIXTURE_EVALUATION_NON_MAIN,
  "OMS-2026-0148-C-014": FIXTURE_EVALUATION_REFERENCE,
};
