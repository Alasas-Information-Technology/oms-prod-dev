/**
 * Interview Planning Domain Mappers
 * Converts canonical Demo Data entities (Requisition, Candidate, InterviewPlan)
 * into the InterviewPlanningResponse API contract.
 */

import {
  InterviewPlanningResponse,
  InterviewCandidate,
  Interviewer,
  InterviewAvailability,
  InterviewPlanningSettings,
  SlotCollision,
  BlindBoundaryInfo,
  InterviewBypassInfo,
  CandidatePriority,
  InterviewCandidateStatus,
} from "@/src/types/interview-planning";
import {
  Requisition,
  Candidate,
  InterviewPlan,
} from "@/src/lib/demo-data/entities";
import {
  getCandidatesForRequisition,
  getInterview,
  getPerson,
} from "@/src/lib/demo-data";

const DEFAULT_SETTINGS: InterviewPlanningSettings = {
  defaultDurationMinutes: 45,
  timezone: "Asia/Dubai",
  platforms: ["MICROSOFT_TEAMS", "ZOOM"],
  locations: [
    { id: "loc-hq-rm3", name: "DIEZ HQ, Meeting Room 3" },
    { id: "loc-hq-board", name: "DIEZ HQ, Executive Boardroom" },
    { id: "loc-dafza-4w", name: "DAFZA Wing 4W, Interview Suite A" },
  ],
  defaultReplyDays: 3,
};

const DEFAULT_BLIND_BOUNDARY: BlindBoundaryInfo = {
  vendorHiddenFromInterviewer: true,
  interviewerHiddenFromVendor: true,
  relayActive: true,
};

const WORKING_HOURS_DUBAI = {
  start: "09:00",
  end: "17:00",
  timezone: "Asia/Dubai",
  workingDays: [1, 2, 3, 4, 5],
};

/**
 * Maps Candidate entity to InterviewCandidate
 */
export function mapCandidateToInterviewCandidate(
  cand: Candidate,
  plan?: InterviewPlan | null
): InterviewCandidate {
  // Determine interview status based on candidate status
  let status: InterviewCandidateStatus = "NOT_SENT";
  if (cand.status === "INTERVIEW_PENDING" || cand.status === "SHORTLISTED") {
    status = "NOT_SENT";
  } else if (cand.status === "INTERVIEW_SCHEDULED") {
    status = "CONFIRMED";
  } else if (cand.status === "EVALUATED" || cand.status === "QUALIFIED" || cand.status === "QUALIFIED_PENDING_BUDGET") {
    status = "AWAITING_OUTCOME";
  }

  // Default proposed slots
  const planSlots = plan?.proposal?.slots;
  const slots = planSlots && planSlots.length > 0
    ? planSlots.map((s) => ({
        start: s.start,
        durationMinutes: s.durationMinutes,
      }))
    : cand.candidateRef === "C-014"
    ? [
        { start: "2026-08-10T06:00:00Z", durationMinutes: 45 },
        { start: "2026-08-11T10:00:00Z", durationMinutes: 45 },
        { start: "2026-08-12T07:00:00Z", durationMinutes: 45 },
      ]
    : [];

  return {
    candidateRef: cand.candidateRef,
    priority: (cand.priority || "P1") as CandidatePriority,
    status: (plan?.status as InterviewCandidateStatus) || (cand.candidateRef === "C-014" ? "AWAITING_REPLY" : status),
    daysWaiting: plan ? plan.daysWaiting : (cand.candidateRef === "C-014" ? 2 : 0),
    methodPreference: "ONLINE",
    timezone: cand.timezone || "Asia/Dubai",
    isOffshore: cand.residentStatus === "OFFSHORE",
    rescheduleCount: plan?.rescheduleCount || 0,
    withdrawnSlot: plan?.withdrawnSlot
      ? {
          start: plan.withdrawnSlot.start,
          durationMinutes: plan.withdrawnSlot.durationMinutes,
          reason: plan.withdrawnSlot.reason,
        }
      : null,
    proposal: {
      slots,
      settings: {
        method: "ONLINE",
        platform: "MICROSOFT_TEAMS",
        location: null,
        replyByDate: "2026-08-13",
        allowAlternatives: true,
        allowReschedule: true,
      },
      sentAt: cand.candidateRef === "C-014" ? "2026-08-08T09:00:00Z" : null,
    },
  };
}

/**
 * Maps Requisition into InterviewPlanningResponse
 */
export function mapToInterviewPlanningResponse(
  req: Requisition,
  customPlan?: InterviewPlan | null,
  customCandidates?: Candidate[]
): InterviewPlanningResponse {
  const candidatesList = customCandidates || getCandidatesForRequisition(req.id);
  const interviewPlan = customPlan || getInterview(req.id);

  const candidates: InterviewCandidate[] = candidatesList.map((cand) => {
    const candPlan = cand.candidateRef === interviewPlan?.candidateRef ? interviewPlan : null;
    return mapCandidateToInterviewCandidate(cand, candPlan);
  });

  const interviewers: Interviewer[] = [
    {
      userId: "usr-noura",
      name: "Noura Al Mazrouei",
      initials: "NA",
      role: "Lead Security Architect",
      isMain: true,
    },
    {
      userId: "usr-yousef-f",
      name: "Yousef Al Falasi",
      initials: "YF",
      role: "Senior SOC Analyst",
      isMain: false,
    },
    {
      userId: "usr-omar",
      name: "Omar Al Hashmi",
      initials: "OH",
      role: "Information Security Operations Manager",
      isMain: false,
    },
  ];

  const availability: InterviewAvailability = {
    connected: true,
    source: "OUTLOOK",
    busy: [
      // Noura busy blocks
      { userId: "usr-noura", from: "2026-08-10T05:00:00Z", to: "2026-08-10T06:00:00Z" },
      { userId: "usr-noura", from: "2026-08-10T09:00:00Z", to: "2026-08-10T10:30:00Z" },
      { userId: "usr-noura", from: "2026-08-11T06:00:00Z", to: "2026-08-11T07:00:00Z" },
      { userId: "usr-noura", from: "2026-08-11T09:00:00Z", to: "2026-08-11T11:00:00Z" },
      { userId: "usr-noura", from: "2026-08-12T08:00:00Z", to: "2026-08-12T09:30:00Z" },
      // Yousef busy blocks
      { userId: "usr-yousef-f", from: "2026-08-10T07:00:00Z", to: "2026-08-10T08:30:00Z" },
      { userId: "usr-yousef-f", from: "2026-08-11T10:00:00Z", to: "2026-08-11T11:00:00Z" },
      { userId: "usr-yousef-f", from: "2026-08-12T05:00:00Z", to: "2026-08-12T06:30:00Z" },
      // Omar busy blocks
      { userId: "usr-omar", from: "2026-08-10T08:00:00Z", to: "2026-08-10T10:00:00Z" },
      { userId: "usr-omar", from: "2026-08-11T08:00:00Z", to: "2026-08-11T09:00:00Z" },
      { userId: "usr-omar", from: "2026-08-12T07:00:00Z", to: "2026-08-12T08:00:00Z" },
    ],
    workingHours: WORKING_HOURS_DUBAI,
  };

  const collisions: SlotCollision[] = candidates.some((c) => c.candidateRef === "C-014") &&
    candidates.some((c) => c.candidateRef === "C-021")
    ? [
        {
          slotStart: "2026-08-11T10:00:00Z",
          alsoOfferedTo: ["C-021"],
        },
      ]
    : [];

  const bypass: InterviewBypassInfo = {
    available: true,
    requiresApprovalFrom: {
      id: "usr-khalid",
      name: "Khalid Al Suwaidi",
      role: "Head of Department",
    },
  };

  return {
    request: {
      id: req.id,
      position: req.positionTitle,
      department: req.departmentName,
      shortlistedCount: candidates.length,
    },
    canSchedule: true,
    isMainInterviewer: true,
    readOnlyReason: null,
    candidates,
    interviewers,
    availability,
    settings: DEFAULT_SETTINGS,
    collisions,
    blindBoundary: DEFAULT_BLIND_BOUNDARY,
    bypass,
  };
}
