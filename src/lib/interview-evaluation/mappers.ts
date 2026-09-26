/**
 * Interview Evaluation Domain Mappers
 * Converts canonical Demo Data entities (Requisition, Candidate, Evaluation, Amendment)
 * into InterviewEvaluationWorkspace API contract.
 */

import {
  InterviewEvaluationWorkspace,
  InterviewDetails,
  EvaluationCriterion,
  PanelEvaluation,
  CandidateEvaluationSummary,
  EvaluationCostSummary,
  PositionProgress,
  RejectionReason,
  EvaluationDeadline,
  EvaluationAuditEvent,
  CriterionRatingLevel,
} from "@/src/types/interview-evaluation";
import {
  Requisition,
  Candidate,
  Evaluation,
} from "@/src/lib/demo-data/entities";
import {
  getAmendment,
  getEvaluation,
  getCandidate,
  getRequisition,
} from "@/src/lib/demo-data";

const DEFAULT_REJECTION_REASONS: RejectionReason[] = [
  {
    code: "NOT_SUITABLE_KEEP_CV",
    label: "Doesn't meet requirements, keep CV on file",
    retentionConsequence: "Retained for 12 months under UAE PDPL Article 14 for future talent pool consideration.",
    deletionDate: "2027-08-15",
  },
  {
    code: "NOT_SUITABLE_DELETE_CV",
    label: "Doesn't meet requirements, delete CV immediately",
    retentionConsequence: "Candidate CV purged within 30 days. No record retained in applicant pool.",
    deletionDate: "2026-09-15",
  },
  {
    code: "DUPLICATE_CV",
    label: "Duplicate profile submission across accredited agencies",
    retentionConsequence: "Flagged as duplicate. Primary agency representation preserved.",
    deletionDate: null,
  },
];

const DEFAULT_CRITERIA_SECURITY: EvaluationCriterion[] = [
  {
    code: "TECHNICAL_EXPERTISE",
    label: "Technical Depth & Threat Analysis",
    weightPercent: 25,
    anchors: { "1": "Well below", "2": "Below", "3": "Meets requirement", "4": "Above", "5": "Outstanding" },
    rating: 5,
  },
  {
    code: "CYBERSECURITY_OPS",
    label: "Cybersecurity Operations & SIEM Triage",
    weightPercent: 20,
    anchors: { "1": "Well below", "2": "Below", "3": "Meets requirement", "4": "Above", "5": "Outstanding" },
    rating: 4,
  },
  {
    code: "PROBLEM_SOLVING",
    label: "Incident Investigation & Problem Solving",
    weightPercent: 15,
    anchors: { "1": "Well below", "2": "Below", "3": "Meets requirement", "4": "Above", "5": "Outstanding" },
    rating: 4,
  },
  {
    code: "COMMUNICATION",
    label: "Communication & Stakeholder Reporting",
    weightPercent: 15,
    anchors: { "1": "Well below", "2": "Below", "3": "Meets requirement", "4": "Above", "5": "Outstanding" },
    rating: 4,
  },
  {
    code: "INCIDENT_RESPONSE",
    label: "Incident Response Under Pressure",
    weightPercent: 15,
    anchors: { "1": "Well below", "2": "Below", "3": "Meets requirement", "4": "Above", "5": "Outstanding" },
    rating: 5,
  },
  {
    code: "DIEZ_FIT",
    label: "DIEZ Environment & Governance Fit",
    weightPercent: 10,
    anchors: { "1": "Well below", "2": "Below", "3": "Meets requirement", "4": "Above", "5": "Outstanding" },
    rating: 4,
  },
];

/**
 * Maps canonical Requisition and Candidate into InterviewEvaluationWorkspace
 */
export function mapToInterviewEvaluationWorkspace(
  req: Requisition,
  candidate: Candidate,
  evalRecord?: Evaluation | null,
  activeUserId?: string
): InterviewEvaluationWorkspace {
  const evalData = evalRecord || getEvaluation(req.id, candidate.candidateRef);
  const linkedAmd = getAmendment(req.id);
  const effectiveUserId =
    activeUserId ||
    (typeof window !== "undefined" ? localStorage.getItem("oms_demo_persona") : undefined) ||
    "usr-noura";

  // 1. Cost summary — EXACT match between candidate, evaluation, and amendment
  const approvedBudget =
    evalData?.cost.approvedBudget ??
    candidate.approvedBudget ??
    Math.floor(req.budgetAmount / (req.positions.required || 1));

  const expectedAnnualCost =
    evalData?.cost.expectedAnnualCost ??
    candidate.expectedAnnualCost ??
    approvedBudget;

  const variance = expectedAnnualCost - approvedBudget;
  const isOverBudget = variance > 0;

  const cost: EvaluationCostSummary = {
    approvedBudget,
    expectedAnnualCost,
    variance,
    status: isOverBudget ? "OVER_BUDGET" : "WITHIN_BUDGET",
    overBudgetConsequence: isOverBudget
      ? `Creates budget amendment ${linkedAmd?.id || "amd-2026-0089"} requiring Line Manager approval.`
      : null,
  };

  // 2. Criteria mapping
  const criteria: EvaluationCriterion[] = evalData?.criteria && evalData.criteria.length > 0
    ? evalData.criteria.map((c) => ({
        code: c.code,
        label: c.label,
        weightPercent: c.weightPercent,
        anchors: {
          "1": c.anchors?.["1"] || "Well below",
          "2": c.anchors?.["2"] || "Below",
          "3": c.anchors?.["3"] || "Meets requirement",
          "4": c.anchors?.["4"] || "Above",
          "5": c.anchors?.["5"] || "Outstanding",
        },
        rating: (c.rating || null) as CriterionRatingLevel | null,
      }))
    : DEFAULT_CRITERIA_SECURITY;

  // 3. Panel Evaluation mapping
  const panel: PanelEvaluation = evalData?.panel
    ? {
        isPanel: evalData.panel.isPanel,
        targetCount: evalData.panel.targetCount,
        completedCount: evalData.panel.completedCount,
        contributors: evalData.panel.contributors.map((contrib) => ({
          userId: contrib.userId,
          name: contrib.name,
          role: contrib.role,
          isYou: contrib.userId === effectiveUserId,
          status: contrib.status,
          overallScore: contrib.overallScore,
          criteria: contrib.criteria.map((crit) => ({
            code: crit.code,
            rating: (crit.rating || null) as CriterionRatingLevel | null,
          })),
        })),
        disagreements: evalData.panel.disagreements || [],
      }
    : {
        isPanel: true,
        targetCount: 3,
        completedCount: 2,
        contributors: [
          {
            userId: "usr-noura",
            name: "Noura Al Mazrouei",
            role: "Lead Security Architect (Main Interviewer)",
            isYou: effectiveUserId === "usr-noura",
            status: "COMPLETE",
            overallScore: 86.7,
            criteria: criteria.map((c) => ({ code: c.code, rating: c.rating })),
          },
          {
            userId: "usr-yousef-f",
            name: "Yousef Al Falasi",
            role: "Senior SOC Analyst",
            isYou: effectiveUserId === "usr-yousef-f",
            status: "COMPLETE",
            overallScore: 83.3,
            criteria: criteria.map((c) => ({ code: c.code, rating: c.rating })),
          },
          {
            userId: "usr-omar",
            name: "Omar Al Hashmi",
            role: "Information Security Operations Manager",
            isYou: effectiveUserId === "usr-omar",
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
      };

  // 4. Candidate summary (Strict Blind Boundary: vendor identity never exposed)
  const candidateSummary: CandidateEvaluationSummary = {
    experienceYears: candidate.experienceYears || 9,
    noticePeriod: candidate.noticePeriod || "2 weeks",
    leadTimeDays: candidate.leadTimeDays || 14,
    specialTerms: "Standard contractor engagement terms under DIEZ Framework Agreement.",
    vendorHidden: true,
  };

  // 5. Positions progress
  const positions: PositionProgress = {
    required: req.positions.required,
    filled: req.positions.filled,
    thisWouldFill: 1,
  };

  const isInterviewer = effectiveUserId === "usr-noura" || effectiveUserId === "usr-yousef-f";

  return {
    candidateRef: candidate.candidateRef,
    priority: candidate.priority,
    requestId: req.id,
    position: req.positionTitle,

    interview: {
      occurred: evalData?.interview.occurred ?? true,
      confirmedAt: evalData?.interview.confirmedAt || "2026-08-11T12:00:00Z",
      method: evalData?.interview.method || "ONLINE",
      scheduledFor: evalData?.interview.scheduledFor || "2026-08-11T10:00:00Z",
    },

    canEvaluate: isInterviewer,
    isMainInterviewer: effectiveUserId === "usr-noura",
    readOnlyReason: isInterviewer ? null : "Only assigned interview panel members can evaluate candidates.",

    criteria,
    overallScore: evalData?.overallScore ?? 86.7,
    overallAnchor: evalData?.overallAnchor ?? "Above requirement",

    comments:
      evalData?.comments ||
      "Candidate demonstrated deep architectural comprehension of enterprise threat monitoring, SIEM rules tuning, and rapid incident isolation.",
    strengthTags: evalData?.strengthTags || ["SIEM & SOC", "Incident response"],
    developmentTags: evalData?.developmentTags || ["DIEZ internal processes"],
    suggestedTags:
      evalData?.suggestedTags || ["SIEM & SOC", "Threat hunting", "Regulatory knowledge", "Cloud Security"],

    panel,
    candidate: candidateSummary,
    cost,
    positions,
    rejectionReasons: DEFAULT_REJECTION_REASONS,
    deadline: {
      dueAt: "2026-09-12T17:00:00Z",
      daysRemaining: 3,
      severity: "NORMAL",
    },
    auditTrail: [
      {
        event: "CANDIDATE_SHORTLISTED",
        label: `Candidate ${candidate.candidateRef} shortlisted for technical evaluation`,
        at: "2026-08-04T10:00:00Z",
        actor: "Mariam Al Mansoori",
      },
      {
        event: "INTERVIEW_CONFIRMED",
        label: "Technical panel interview confirmed and conducted online",
        at: "2026-08-11T12:00:00Z",
        actor: "Noura Al Mazrouei",
      },
    ],
    immutabilityNotice: "Final evaluation decisions are binding under the DIEZ Hiring Governance Framework. Over-budget qualification automatically initiates a candidate budget amendment.",
  };
}
