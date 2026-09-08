/**
 * Interview Planning — Mock Fixtures
 *
 * FIVE comprehensive fixtures exercising:
 *  a) Reference Case (OMS-2026-0148): Senior Cybersecurity Analyst, 2 candidates (C-014 Awaiting reply 2d, C-021 Not sent),
 *     3 interviewers, clear / one-busy / two-busy blocks, slot collision on Tue 11 Aug 14:00 GST.
 *  b) Offshore Case: Candidate in Asia/Kolkata (IST) exercising dual-timezone rendering and boundary warnings.
 *  c) Disconnected Case: availability.connected = false, source = "NONE", exercising disconnected integration state.
 *  d) Rescheduling Case: Candidate in RESCHEDULING state with rescheduleCount = 2, withdrawn slot, and reason.
 *  e) Read-Only Case: isMainInterviewer = false, canSchedule = false, testing read-only panelist view without action buttons.
 *
 * CRITICAL ARCHITECTURAL INVARIANT:
 * Zero vendor fields anywhere in these fixtures. Blind Review boundary is strictly preserved.
 * All timestamps are UTC ISO strings.
 */

import { InterviewPlanningResponse } from "@/src/types/interview-planning";

// ─────────────────────────────────────────────────────────────────────────────
// Shared Defaults
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_SETTINGS = {
  defaultDurationMinutes: 45,
  timezone: "Asia/Dubai",
  platforms: ["MICROSOFT_TEAMS" as const, "ZOOM" as const],
  locations: [
    { id: "loc-hq-rm3", name: "DIEZ HQ, Meeting Room 3" },
    { id: "loc-hq-board", name: "DIEZ HQ, Executive Boardroom" },
    { id: "loc-dafza-4w", name: "DAFZA Wing 4W, Interview Suite A" },
  ],
  defaultReplyDays: 3,
};

const DEFAULT_BLIND_BOUNDARY = {
  vendorHiddenFromInterviewer: true as const,
  interviewerHiddenFromVendor: true as const,
  relayActive: true,
};

const DEFAULT_PANEL_INTERVIEWERS = [
  {
    userId: "usr-091",
    name: "Noura Al Mazrouei",
    initials: "NA",
    role: "Lead Security Architect",
    isMain: true,
  },
  {
    userId: "usr-104",
    name: "Yousef Al Falasi",
    initials: "YF",
    role: "Senior SOC Analyst",
    isMain: false,
  },
  {
    userId: "usr-118",
    name: "Omar Al Hashmi",
    initials: "OH",
    role: "Infrastructure Manager",
    isMain: false,
  },
];

const WORKING_HOURS_DUBAI = {
  start: "09:00",
  end: "17:00",
  timezone: "Asia/Dubai",
  workingDays: [1, 2, 3, 4, 5],
};

// ─────────────────────────────────────────────────────────────────────────────
// Fixture A: The Reference Case (OMS-2026-0148)
// ─────────────────────────────────────────────────────────────────────────────
export const FIXTURE_INTERVIEW_REFERENCE: InterviewPlanningResponse = {
  request: {
    id: "OMS-2026-0148",
    position: "Senior Cybersecurity Analyst",
    department: "Digital Security",
    shortlistedCount: 2,
  },
  canSchedule: true,
  isMainInterviewer: true,
  readOnlyReason: null,

  candidates: [
    {
      candidateRef: "C-014",
      priority: "P1",
      status: "AWAITING_REPLY",
      daysWaiting: 2,
      methodPreference: "ONLINE",
      timezone: "Asia/Dubai",
      isOffshore: false,
      rescheduleCount: 0,
      withdrawnSlot: null,
      proposal: {
        slots: [
          // Mon 10 Aug 10:00 GST -> 06:00 UTC
          { start: "2026-08-10T06:00:00Z", durationMinutes: 45 },
          // Mon 10 Aug 14:00 GST -> 10:00 UTC
          { start: "2026-08-10T10:00:00Z", durationMinutes: 45 },
          // Tue 11 Aug 14:00 GST -> 10:00 UTC (Collides with C-021)
          { start: "2026-08-11T10:00:00Z", durationMinutes: 45 },
        ],
        settings: {
          method: "ONLINE",
          platform: "MICROSOFT_TEAMS",
          location: null,
          replyByDate: "2026-08-08",
          allowAlternatives: true,
          allowReschedule: true,
        },
        sentAt: "2026-08-05T09:30:00Z",
      },
    },
    {
      candidateRef: "C-021",
      priority: "P2",
      status: "NOT_SENT",
      daysWaiting: 0,
      methodPreference: "NO_PREFERENCE",
      timezone: "Asia/Dubai",
      isOffshore: false,
      rescheduleCount: 0,
      withdrawnSlot: null,
      proposal: {
        slots: [
          // Candidate 2 has a draft proposing the same Tue 14:00 GST slot
          { start: "2026-08-11T10:00:00Z", durationMinutes: 45 },
        ],
        settings: {
          method: "ONLINE",
          platform: "MICROSOFT_TEAMS",
          location: null,
          replyByDate: "2026-08-10",
          allowAlternatives: true,
          allowReschedule: true,
        },
        sentAt: null,
      },
    },
  ],

  interviewers: DEFAULT_PANEL_INTERVIEWERS,

  availability: {
    connected: true,
    source: "OUTLOOK",
    busy: [
      // Noura busy blocks
      { userId: "usr-091", from: "2026-08-10T05:00:00Z", to: "2026-08-10T06:00:00Z" }, // Mon 09:00-10:00 GST (one-busy)
      { userId: "usr-091", from: "2026-08-11T07:00:00Z", to: "2026-08-11T08:30:00Z" }, // Tue 11:00-12:30 GST (one-busy)
      { userId: "usr-091", from: "2026-08-12T07:00:00Z", to: "2026-08-12T08:00:00Z" }, // Wed 11:00-12:00 GST (two-busy with Omar)
      { userId: "usr-091", from: "2026-08-13T09:00:00Z", to: "2026-08-13T10:00:00Z" }, // Thu 13:00-14:00 GST (one-busy)

      // Yousef busy blocks
      { userId: "usr-104", from: "2026-08-11T06:00:00Z", to: "2026-08-11T07:00:00Z" }, // Tue 10:00-11:00 GST (one-busy)
      { userId: "usr-104", from: "2026-08-12T11:00:00Z", to: "2026-08-12T12:30:00Z" }, // Wed 15:00-16:30 GST (one-busy)
      { userId: "usr-104", from: "2026-08-14T05:30:00Z", to: "2026-08-14T06:30:00Z" }, // Fri 09:30-10:30 GST (one-busy)

      // Omar busy blocks
      { userId: "usr-118", from: "2026-08-12T07:00:00Z", to: "2026-08-12T08:00:00Z" }, // Wed 11:00-12:00 GST (two-busy with Noura)
      { userId: "usr-118", from: "2026-08-13T05:00:00Z", to: "2026-08-13T06:00:00Z" }, // Thu 09:00-10:00 GST (one-busy)
      { userId: "usr-118", from: "2026-08-13T07:00:00Z", to: "2026-08-13T08:00:00Z" }, // Thu 11:00-12:00 GST (one-busy)
    ],
    workingHours: WORKING_HOURS_DUBAI,
  },

  settings: DEFAULT_SETTINGS,

  collisions: [
    {
      slotStart: "2026-08-11T10:00:00Z", // Tue 11 Aug 14:00 GST
      alsoOfferedTo: ["C-021"],
    },
  ],

  blindBoundary: DEFAULT_BLIND_BOUNDARY,

  bypass: {
    available: true,
    requiresApprovalFrom: {
      id: "usr-042",
      name: "Khalid Al Suwaidi",
      role: "Head of Digital Security",
    },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Fixture B: Offshore Candidate in Asia/Kolkata (OMS-2026-0152)
// ─────────────────────────────────────────────────────────────────────────────
export const FIXTURE_INTERVIEW_OFFSHORE: InterviewPlanningResponse = {
  request: {
    id: "OMS-2026-0152",
    position: "Senior Lead Cloud Engineer",
    department: "Digital Architecture",
    shortlistedCount: 2,
  },
  canSchedule: true,
  isMainInterviewer: true,
  readOnlyReason: null,

  candidates: [
    {
      candidateRef: "C-032",
      priority: "P1",
      status: "NOT_SENT",
      daysWaiting: 1,
      methodPreference: "ONLINE",
      timezone: "Asia/Kolkata", // UTC+5:30
      isOffshore: true,
      rescheduleCount: 0,
      withdrawnSlot: null,
      proposal: {
        slots: [
          // Mon 10 Aug 10:00 GST (11:30 IST) -> 06:00 UTC
          { start: "2026-08-10T06:00:00Z", durationMinutes: 45 },
          // Mon 10 Aug 14:00 GST (15:30 IST) -> 10:00 UTC
          { start: "2026-08-10T10:00:00Z", durationMinutes: 45 },
          // Wed 12 Aug 15:30 GST (17:00 IST) -> 11:30 UTC
          { start: "2026-08-12T11:30:00Z", durationMinutes: 45 },
        ],
        settings: {
          method: "ONLINE",
          platform: "MICROSOFT_TEAMS",
          location: null,
          replyByDate: "2026-08-09",
          allowAlternatives: true,
          allowReschedule: true,
        },
        sentAt: null,
      },
    },
    {
      candidateRef: "C-035",
      priority: "P2",
      status: "NOT_SENT",
      daysWaiting: 0,
      methodPreference: "ONLINE",
      timezone: "Asia/Dubai",
      isOffshore: false,
      rescheduleCount: 0,
      withdrawnSlot: null,
      proposal: {
        slots: [],
        settings: {
          method: "ONLINE",
          platform: "MICROSOFT_TEAMS",
          location: null,
          replyByDate: "2026-08-10",
          allowAlternatives: true,
          allowReschedule: true,
        },
        sentAt: null,
      },
    },
  ],

  interviewers: [
    {
      userId: "usr-091",
      name: "Noura Al Mazrouei",
      initials: "NA",
      role: "Lead Security Architect",
      isMain: true,
    },
    {
      userId: "usr-205",
      name: "Sultan Bin Mejren",
      initials: "SM",
      role: "Cloud Infrastructure Architect",
      isMain: false,
    },
  ],

  availability: {
    connected: true,
    source: "OUTLOOK",
    busy: [
      { userId: "usr-091", from: "2026-08-10T08:00:00Z", to: "2026-08-10T09:30:00Z" },
      { userId: "usr-205", from: "2026-08-11T05:00:00Z", to: "2026-08-11T06:30:00Z" },
    ],
    workingHours: WORKING_HOURS_DUBAI,
  },

  settings: DEFAULT_SETTINGS,
  collisions: [],
  blindBoundary: DEFAULT_BLIND_BOUNDARY,

  bypass: {
    available: true,
    requiresApprovalFrom: {
      id: "usr-042",
      name: "Khalid Al Suwaidi",
      role: "Head of Digital Security",
    },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Fixture C: Disconnected Calendar Service (OMS-2026-0155)
// ─────────────────────────────────────────────────────────────────────────────
export const FIXTURE_INTERVIEW_DISCONNECTED: InterviewPlanningResponse = {
  request: {
    id: "OMS-2026-0155",
    position: "Senior Data Privacy Specialist",
    department: "Legal & Governance",
    shortlistedCount: 1,
  },
  canSchedule: true,
  isMainInterviewer: true,
  readOnlyReason: null,

  candidates: [
    {
      candidateRef: "C-018",
      priority: "P1",
      status: "NOT_SENT",
      daysWaiting: 3,
      methodPreference: "PHYSICAL",
      timezone: "Asia/Dubai",
      isOffshore: false,
      rescheduleCount: 0,
      withdrawnSlot: null,
      proposal: {
        slots: [
          { start: "2026-08-11T06:00:00Z", durationMinutes: 45 },
          { start: "2026-08-11T09:00:00Z", durationMinutes: 45 },
        ],
        settings: {
          method: "PHYSICAL",
          platform: null,
          location: "loc-hq-rm3",
          replyByDate: "2026-08-10",
          allowAlternatives: true,
          allowReschedule: false,
        },
        sentAt: null,
      },
    },
  ],

  interviewers: [
    {
      userId: "usr-301",
      name: "Fatima Al Qasimi",
      initials: "FQ",
      role: "General Counsel",
      isMain: true,
    },
    {
      userId: "usr-305",
      name: "Tariq Al Marzooqi",
      initials: "TM",
      role: "Data Protection Officer",
      isMain: false,
    },
  ],

  // Disconnected state: Availability integration is offline
  availability: {
    connected: false,
    source: "NONE",
    busy: [],
    workingHours: WORKING_HOURS_DUBAI,
  },

  settings: DEFAULT_SETTINGS,
  collisions: [],
  blindBoundary: DEFAULT_BLIND_BOUNDARY,

  bypass: {
    available: false,
    requiresApprovalFrom: {
      name: "Legal Directorate",
    },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Fixture D: Rescheduling Candidate (OMS-2026-0160)
// ─────────────────────────────────────────────────────────────────────────────
export const FIXTURE_INTERVIEW_RESCHEDULING: InterviewPlanningResponse = {
  request: {
    id: "OMS-2026-0160",
    position: "Senior Systems Security Analyst",
    department: "Digital Security",
    shortlistedCount: 1,
  },
  canSchedule: true,
  isMainInterviewer: true,
  readOnlyReason: null,

  candidates: [
    {
      candidateRef: "C-045",
      priority: "P1",
      status: "RESCHEDULING",
      daysWaiting: 1,
      methodPreference: "ONLINE",
      timezone: "Asia/Dubai",
      isOffshore: false,
      rescheduleCount: 2, // Rescheduled twice
      withdrawnSlot: {
        start: "2026-08-12T06:00:00Z", // Wed 12 Aug 10:00 GST
        durationMinutes: 45,
        reason: "Candidate experienced an emergency at current employer and requested an afternoon alternative later in the week.",
      },
      proposal: {
        slots: [
          // Re-proposing slots for Thu and Fri
          { start: "2026-08-13T10:00:00Z", durationMinutes: 45 },
          { start: "2026-08-14T06:00:00Z", durationMinutes: 45 },
        ],
        settings: {
          method: "ONLINE",
          platform: "MICROSOFT_TEAMS",
          location: null,
          replyByDate: "2026-08-12",
          allowAlternatives: true,
          allowReschedule: true,
        },
        sentAt: null,
      },
    },
  ],

  interviewers: DEFAULT_PANEL_INTERVIEWERS,

  availability: {
    connected: true,
    source: "OUTLOOK",
    busy: [
      { userId: "usr-091", from: "2026-08-13T06:00:00Z", to: "2026-08-13T07:30:00Z" },
      { userId: "usr-104", from: "2026-08-14T08:00:00Z", to: "2026-08-14T09:30:00Z" },
    ],
    workingHours: WORKING_HOURS_DUBAI,
  },

  settings: DEFAULT_SETTINGS,
  collisions: [],
  blindBoundary: DEFAULT_BLIND_BOUNDARY,

  bypass: {
    available: true,
    requiresApprovalFrom: {
      name: "Khalid Al Suwaidi",
      role: "Head of Digital Security",
    },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Fixture E: Read-Only Non-Main Interviewer (OMS-2026-0168)
// ─────────────────────────────────────────────────────────────────────────────
export const FIXTURE_INTERVIEW_READONLY: InterviewPlanningResponse = {
  request: {
    id: "OMS-2026-0168",
    position: "Senior Cybersecurity Analyst",
    department: "Digital Security",
    shortlistedCount: 2,
  },
  canSchedule: false,
  isMainInterviewer: false,
  readOnlyReason: "Only the Main Interviewer (Noura Al Mazrouei) has scheduling authority.",

  candidates: [
    {
      candidateRef: "C-014",
      priority: "P1",
      status: "AWAITING_REPLY",
      daysWaiting: 2,
      methodPreference: "ONLINE",
      timezone: "Asia/Dubai",
      isOffshore: false,
      rescheduleCount: 0,
      withdrawnSlot: null,
      proposal: {
        slots: [
          { start: "2026-08-10T06:00:00Z", durationMinutes: 45 },
          { start: "2026-08-10T10:00:00Z", durationMinutes: 45 },
          { start: "2026-08-11T10:00:00Z", durationMinutes: 45 },
        ],
        settings: {
          method: "ONLINE",
          platform: "MICROSOFT_TEAMS",
          location: null,
          replyByDate: "2026-08-08",
          allowAlternatives: true,
          allowReschedule: true,
        },
        sentAt: "2026-08-05T09:30:00Z",
      },
    },
    {
      candidateRef: "C-021",
      priority: "P2",
      status: "NOT_SENT",
      daysWaiting: 0,
      methodPreference: "NO_PREFERENCE",
      timezone: "Asia/Dubai",
      isOffshore: false,
      rescheduleCount: 0,
      withdrawnSlot: null,
      proposal: {
        slots: [],
        settings: {
          method: "ONLINE",
          platform: "MICROSOFT_TEAMS",
          location: null,
          replyByDate: "2026-08-10",
          allowAlternatives: true,
          allowReschedule: true,
        },
        sentAt: null,
      },
    },
  ],

  interviewers: DEFAULT_PANEL_INTERVIEWERS,

  availability: {
    connected: true,
    source: "OUTLOOK",
    busy: [
      { userId: "usr-091", from: "2026-08-10T05:00:00Z", to: "2026-08-10T06:00:00Z" },
    ],
    workingHours: WORKING_HOURS_DUBAI,
  },

  settings: DEFAULT_SETTINGS,
  collisions: [
    {
      slotStart: "2026-08-11T10:00:00Z",
      alsoOfferedTo: ["C-021"],
    },
  ],
  blindBoundary: DEFAULT_BLIND_BOUNDARY,

  bypass: {
    available: false,
    requiresApprovalFrom: {
      name: "Khalid Al Suwaidi",
    },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Fixture Dictionary
// ─────────────────────────────────────────────────────────────────────────────
export const MOCK_INTERVIEW_PLANNING_FIXTURES: Record<string, InterviewPlanningResponse> = {
  "OMS-2026-0148": FIXTURE_INTERVIEW_REFERENCE,
  "OMS-2026-OFFSHORE": FIXTURE_INTERVIEW_OFFSHORE,
  "OMS-2026-DISCONNECTED": FIXTURE_INTERVIEW_DISCONNECTED,
  "OMS-2026-RESCHEDULE": FIXTURE_INTERVIEW_RESCHEDULING,
  "OMS-2026-READONLY": FIXTURE_INTERVIEW_READONLY,
};

// ─────────────────────────────────────────────────────────────────────────────
// Task 2: Suggestions Fixtures (UX Parts 1.1, 4.2, 9)
// ─────────────────────────────────────────────────────────────────────────────

import { InterviewSuggestionsResponse, InterviewSuggestion } from "@/src/types/interview-planning";

export const MOCK_SUGGESTIONS_NINE: InterviewSuggestion[] = [
  // 3 suggestions with ALL interviewers free (allFree: true)
  {
    slotId: "sug-20260811-1000",
    start: "2026-08-11T06:00:00Z", // Tue 11 Aug 10:00 GST
    durationMinutes: 45,
    score: 0.96,
    rank: 1,
    isBestMatch: true, // "Best match" on the top card ONLY
    availability: [
      { userId: "usr-091", name: "Noura Al Mazrouei", free: true },
      { userId: "usr-104", name: "Yousef Al Falasi", free: true },
      { userId: "usr-118", name: "Omar Al Hashmi", free: true },
    ],
    allFree: true,
    reasons: ["ALL_INTERVIEWERS_FREE", "MORNING", "FOUR_DAYS_OUT", "WITHIN_CANDIDATE_HOURS"],
    candidateLocalTime: {
      timezone: "Asia/Kolkata",
      start: "11:30",
      end: "12:15",
    },
    warnings: [],
  },
  {
    slotId: "sug-20260812-1030",
    start: "2026-08-12T06:30:00Z", // Wed 12 Aug 10:30 GST
    durationMinutes: 45,
    score: 0.92,
    rank: 2,
    isBestMatch: false,
    availability: [
      { userId: "usr-091", name: "Noura Al Mazrouei", free: true },
      { userId: "usr-104", name: "Yousef Al Falasi", free: true },
      { userId: "usr-118", name: "Omar Al Hashmi", free: true },
    ],
    allFree: true,
    reasons: ["ALL_INTERVIEWERS_FREE", "MORNING", "FIVE_DAYS_OUT", "WITHIN_CANDIDATE_HOURS"],
    candidateLocalTime: {
      timezone: "Asia/Kolkata",
      start: "12:00",
      end: "12:45",
    },
    warnings: [],
  },
  {
    slotId: "sug-20260813-1400",
    start: "2026-08-13T10:00:00Z", // Thu 13 Aug 14:00 GST
    durationMinutes: 45,
    score: 0.88,
    rank: 3,
    isBestMatch: false,
    availability: [
      { userId: "usr-091", name: "Noura Al Mazrouei", free: true },
      { userId: "usr-104", name: "Yousef Al Falasi", free: true },
      { userId: "usr-118", name: "Omar Al Hashmi", free: true },
    ],
    allFree: true,
    reasons: ["ALL_INTERVIEWERS_FREE", "AFTERNOON", "WITHIN_CANDIDATE_HOURS"],
    candidateLocalTime: {
      timezone: "Asia/Kolkata",
      start: "15:30",
      end: "16:15",
    },
    warnings: [],
  },

  // 4 suggestions with ONE interviewer busy (rendered at 85% opacity, naming who is busy)
  {
    slotId: "sug-20260810-1100",
    start: "2026-08-10T07:00:00Z", // Mon 10 Aug 11:00 GST
    durationMinutes: 45,
    score: 0.79,
    rank: 4,
    isBestMatch: false,
    availability: [
      { userId: "usr-091", name: "Noura Al Mazrouei", free: true },
      { userId: "usr-104", name: "Yousef Al Falasi", free: true },
      { userId: "usr-118", name: "Omar Al Hashmi", free: false, reason: "Budget Review" },
    ],
    allFree: false,
    reasons: ["MORNING", "TWO_DAYS_OUT", "WITHIN_CANDIDATE_HOURS"],
    candidateLocalTime: {
      timezone: "Asia/Kolkata",
      start: "12:30",
      end: "13:15",
    },
    warnings: ["Omar Al Hashmi is busy (Budget Review)"],
  },
  {
    slotId: "sug-20260811-1400",
    start: "2026-08-11T10:00:00Z", // Tue 11 Aug 14:00 GST
    durationMinutes: 45,
    score: 0.75,
    rank: 5,
    isBestMatch: false,
    availability: [
      { userId: "usr-091", name: "Noura Al Mazrouei", free: true },
      { userId: "usr-104", name: "Yousef Al Falasi", free: false, reason: "Client Onboarding" },
      { userId: "usr-118", name: "Omar Al Hashmi", free: true },
    ],
    allFree: false,
    reasons: ["AFTERNOON", "FOUR_DAYS_OUT", "WITHIN_CANDIDATE_HOURS"],
    candidateLocalTime: {
      timezone: "Asia/Kolkata",
      start: "15:30",
      end: "16:15",
    },
    warnings: ["Yousef Al Falasi is busy (Client Onboarding)"],
  },
  {
    slotId: "sug-20260812-1500",
    start: "2026-08-12T11:00:00Z", // Wed 12 Aug 15:00 GST
    durationMinutes: 45,
    score: 0.72,
    rank: 6,
    isBestMatch: false,
    availability: [
      { userId: "usr-091", name: "Noura Al Mazrouei", free: true },
      { userId: "usr-104", name: "Yousef Al Falasi", free: true },
      { userId: "usr-118", name: "Omar Al Hashmi", free: false, reason: "Department All-Hands" },
    ],
    allFree: false,
    reasons: ["AFTERNOON", "FIVE_DAYS_OUT", "WITHIN_CANDIDATE_HOURS"],
    candidateLocalTime: {
      timezone: "Asia/Kolkata",
      start: "16:30",
      end: "17:15",
    },
    warnings: ["Omar Al Hashmi is busy (Department All-Hands)"],
  },
  {
    slotId: "sug-20260813-1100",
    start: "2026-08-13T07:00:00Z", // Thu 13 Aug 11:00 GST
    durationMinutes: 45,
    score: 0.70,
    rank: 7,
    isBestMatch: false,
    availability: [
      { userId: "usr-091", name: "Noura Al Mazrouei", free: false, reason: "Architecture Guild" },
      { userId: "usr-104", name: "Yousef Al Falasi", free: true },
      { userId: "usr-118", name: "Omar Al Hashmi", free: true },
    ],
    allFree: false,
    reasons: ["MORNING", "WITHIN_CANDIDATE_HOURS"],
    candidateLocalTime: {
      timezone: "Asia/Kolkata",
      start: "12:30",
      end: "13:15",
    },
    warnings: ["Noura Al Mazrouei is busy (Architecture Guild)"],
  },

  // 2 suggestions with TWO interviewers busy (rendered at 85% opacity, naming who is busy)
  {
    slotId: "sug-20260810-1500",
    start: "2026-08-10T11:00:00Z", // Mon 10 Aug 15:00 GST
    durationMinutes: 45,
    score: 0.55,
    rank: 8,
    isBestMatch: false,
    availability: [
      { userId: "usr-091", name: "Noura Al Mazrouei", free: true },
      { userId: "usr-104", name: "Yousef Al Falasi", free: false, reason: "Vendor Sync" },
      { userId: "usr-118", name: "Omar Al Hashmi", free: false, reason: "Steering Committee" },
    ],
    allFree: false,
    reasons: ["AFTERNOON", "TWO_DAYS_OUT"],
    candidateLocalTime: {
      timezone: "Asia/Kolkata",
      start: "16:30",
      end: "17:15",
    },
    warnings: ["Yousef Al Falasi and Omar Al Hashmi are busy"],
  },
  {
    slotId: "sug-20260812-0900",
    start: "2026-08-12T05:00:00Z", // Wed 12 Aug 09:00 GST
    durationMinutes: 45,
    score: 0.50,
    rank: 9,
    isBestMatch: false,
    availability: [
      { userId: "usr-091", name: "Noura Al Mazrouei", free: false, reason: "Executive Standup" },
      { userId: "usr-104", name: "Yousef Al Falasi", free: false, reason: "Weekly Audit" },
      { userId: "usr-118", name: "Omar Al Hashmi", free: true },
    ],
    allFree: false,
    reasons: ["MORNING"],
    candidateLocalTime: {
      timezone: "Asia/Kolkata",
      start: "10:30",
      end: "11:15",
    },
    warnings: ["Noura Al Mazrouei and Yousef Al Falasi are busy"],
  },
];

export const FIXTURE_SUGGESTIONS_REFERENCE: InterviewSuggestionsResponse = {
  suggestions: MOCK_SUGGESTIONS_NINE,
  totalFound: 9,
  availabilityConnected: true,
  computedAt: "2026-08-06T09:12:00Z",
};

export const FIXTURE_SUGGESTIONS_OFFSHORE: InterviewSuggestionsResponse = {
  suggestions: MOCK_SUGGESTIONS_NINE.map((s) => ({
    ...s,
    candidateLocalTime: {
      timezone: "Asia/Kolkata",
      start: s.candidateLocalTime?.start || "11:30",
      end: s.candidateLocalTime?.end || "12:15",
    },
  })),
  totalFound: 9,
  availabilityConnected: true,
  computedAt: "2026-08-06T09:12:00Z",
};

export const FIXTURE_SUGGESTIONS_DISCONNECTED: InterviewSuggestionsResponse = {
  suggestions: [], // EMPTY list when availability is not connected per Requirement 5
  totalFound: 0,
  availabilityConnected: false,
  computedAt: "2026-08-06T09:12:00Z",
};

export const MOCK_INTERVIEW_SUGGESTIONS_FIXTURES: Record<string, InterviewSuggestionsResponse> = {
  "OMS-2026-0148": FIXTURE_SUGGESTIONS_REFERENCE,
  "OMS-2026-OFFSHORE": FIXTURE_SUGGESTIONS_OFFSHORE,
  "OMS-2026-DISCONNECTED": FIXTURE_SUGGESTIONS_DISCONNECTED,
  "OMS-2026-RESCHEDULE": FIXTURE_SUGGESTIONS_REFERENCE,
  "OMS-2026-READONLY": FIXTURE_SUGGESTIONS_REFERENCE,
};

