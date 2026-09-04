/**
 * Interview Planning — TypeScript Definitions
 *
 * CRITICAL ARCHITECTURAL INVARIANT 1:
 * THE INTERVIEWER MUST NEVER RECEIVE VENDOR IDENTITY IN ANY PAYLOAD.
 * All candidate evaluation is strictly anonymised (Blind Review boundary).
 *
 * CRITICAL ARCHITECTURAL INVARIANT 2:
 * ALL TIMESTAMPS AND SLOT TIMES ARE UTC ISO-8601 STRINGS (e.g., "2026-08-10T06:00:00Z").
 * Never send or accept local time strings without timezone offsets.
 */

/**
 * Candidate review priority
 */
export type CandidatePriority = "P1" | "P2" | "P3";

/**
 * Candidate interview scheduling status.
 * Modeled as a strict union so impossible states are unrepresentable.
 */
export type InterviewCandidateStatus =
  | "NOT_SENT"
  | "AWAITING_REPLY"
  | "DECLINED"
  | "CONFIRMED"
  | "RESCHEDULING"
  | "AWAITING_OUTCOME"
  | "BYPASS_REQUESTED";

/**
 * Candidate's declared interview method preference
 */
export type InterviewMethodPreference = "ONLINE" | "PHYSICAL" | "NO_PREFERENCE";

/**
 * Concrete method selected for the interview
 */
export type InterviewMethod = "ONLINE" | "PHYSICAL";

/**
 * Supported online meeting platforms
 */
export type InterviewPlatform = "MICROSOFT_TEAMS" | "ZOOM" | "GOOGLE_MEET" | "OTHER";

/**
 * Physical location for in-person interviews
 */
export interface PhysicalLocation {
  id: string;
  name: string;
}

/**
 * Individual proposed slot.
 * `start` MUST be a UTC ISO-8601 string.
 */
export interface InterviewProposedSlot {
  start: string; // UTC ISO-8601 e.g. "2026-08-10T06:00:00Z"
  durationMinutes: number; // e.g. 45
}

/**
 * Settings attached to a specific candidate's proposal
 */
export interface InterviewProposalSettings {
  method: InterviewMethod;
  platform?: InterviewPlatform | null;
  location?: string | null;
  replyByDate: string; // YYYY-MM-DD
  allowAlternatives: boolean;
  allowReschedule: boolean;
}

/**
 * Slot and settings proposal associated with a candidate
 */
export interface InterviewCandidateProposal {
  slots: InterviewProposedSlot[];
  settings: InterviewProposalSettings;
  sentAt: string | null; // UTC ISO-8601 or null if not yet sent
}

/**
 * Previously confirmed slot that has been withdrawn during a reschedule
 */
export interface WithdrawnSlotInfo {
  start: string; // UTC ISO-8601
  durationMinutes: number;
  reason: string;
}

/**
 * Candidate in the interview queue
 */
export interface InterviewCandidate {
  candidateRef: string; // e.g. "C-014"
  priority: CandidatePriority;
  status: InterviewCandidateStatus;
  daysWaiting: number;
  methodPreference: InterviewMethodPreference;
  timezone: string; // e.g. "Asia/Dubai" or "Asia/Kolkata"
  isOffshore: boolean;
  rescheduleCount: number;
  withdrawnSlot?: WithdrawnSlotInfo | null;
  proposal: InterviewCandidateProposal;
}

/**
 * Panel interviewer profile
 */
export interface Interviewer {
  userId: string;
  name: string;
  initials: string;
  role?: string;
  isMain: boolean; // Only the main interviewer has scheduling authority
}

/**
 * Busy block for an interviewer.
 * `from` and `to` are UTC ISO-8601 strings.
 */
export interface BusyBlock {
  userId: string;
  from: string; // UTC ISO-8601
  to: string; // UTC ISO-8601
}

/**
 * Official working hours definition
 */
export interface WorkingHours {
  start: string; // "09:00"
  end: string; // "17:00"
  timezone: string; // "Asia/Dubai"
  workingDays: number[]; // [1, 2, 3, 4, 5] (Mon-Fri)
}

/**
 * Interviewer calendar availability state
 */
export interface InterviewAvailability {
  connected: boolean;
  source: "OUTLOOK" | "GOOGLE_CALENDAR" | "INTERNAL" | "NONE";
  busy: BusyBlock[];
  workingHours: WorkingHours;
}

/**
 * Global configuration settings for interview planning
 */
export interface InterviewPlanningSettings {
  defaultDurationMinutes: number;
  timezone: string; // Primary requisition timezone e.g. "Asia/Dubai"
  platforms: InterviewPlatform[];
  locations: PhysicalLocation[];
  defaultReplyDays: number;
}

/**
 * Slot collision notification when a slot is also proposed to another candidate
 */
export interface SlotCollision {
  slotStart: string; // UTC ISO-8601
  alsoOfferedTo: string[]; // Array of candidateRefs, e.g. ["C-021"]
}

/**
 * Anonymised Blind Boundary state confirmation
 */
export interface BlindBoundaryInfo {
  vendorHiddenFromInterviewer: true;
  interviewerHiddenFromVendor: true;
  relayActive: boolean;
}

/**
 * HOD Approval details for the interview bypass route (RFP Step 6)
 */
export interface InterviewBypassInfo {
  available: boolean;
  requiresApprovalFrom: {
    id?: string;
    name: string;
    role?: string;
  };
}

/**
 * Full Interview Planning Workspace Data (GET response)
 */
export interface InterviewPlanningResponse {
  request: {
    id: string;
    position: string;
    department?: string;
    shortlistedCount?: number;
  };
  canSchedule: boolean;
  isMainInterviewer: boolean;
  readOnlyReason: string | null;
  candidates: InterviewCandidate[];
  interviewers: Interviewer[];
  availability: InterviewAvailability;
  settings: InterviewPlanningSettings;
  collisions: SlotCollision[];
  blindBoundary: BlindBoundaryInfo;
  bypass: InterviewBypassInfo;
}

/**
 * PUT /api/v1/requests/{requestId}/interviews/planning/{candidateRef}/draft payload
 */
export interface InterviewDraftPayload {
  slots: InterviewProposedSlot[];
  method: InterviewMethod;
  platform?: InterviewPlatform | null;
  location?: string | null;
  replyByDate: string;
  allowAlternatives: boolean;
  allowReschedule: boolean;
}

/**
 * PUT draft response
 */
export interface InterviewDraftResponse {
  success: boolean;
  savedAt: string; // UTC ISO-8601
  candidateRef: string;
}

/**
 * POST /api/v1/requests/{requestId}/interviews/planning/{candidateRef}/send payload
 */
export interface InterviewSendPayload {
  slots: InterviewProposedSlot[];
  method: InterviewMethod;
  platform?: InterviewPlatform | null;
  location?: string | null;
  replyByDate: string;
  allowAlternatives: boolean;
  allowReschedule: boolean;
  idempotencyKey: string;
}

/**
 * POST send response
 */
export interface InterviewSendResponse {
  success: boolean;
  message: string;
  candidateRef: string;
  sentAt: string; // UTC ISO-8601
  status: "AWAITING_REPLY";
}

/**
 * GET preview-email response
 */
export interface InterviewEmailPreviewSlot {
  startUtc: string;
  endUtc: string;
  localTimeCandidate: string;
  durationMinutes: number;
}

export interface InterviewEmailPreviewResponse {
  subject: string;
  bodyText: string;
  bodyHtml: string;
  candidateRef: string;
  proposedSlots: InterviewEmailPreviewSlot[];
  replyByDate: string;
  method: InterviewMethod;
  platformOrLocation: string;
  blindBoundaryNotice: string;
}

/**
 * POST bypass-request payload & response
 */
export interface InterviewBypassRequestPayload {
  justification: string;
}

export interface InterviewBypassRequestResponse {
  success: boolean;
  message: string;
  candidateRef: string;
  routedTo: string;
  status: "BYPASS_REQUESTED";
}

/**
 * Structured error codes for interview scheduling
 */
export type InterviewErrorCode =
  | "INTERVIEW_SLOT_TAKEN"
  | "INTERVIEW_RELAY_UNAVAILABLE"
  | "INTERVIEW_NOT_MAIN"
  | "INTERVIEW_REPLY_DATE_INVALID"
  | "INTERVIEW_NO_SLOTS"
  | "INTERVIEW_ALREADY_CONFIRMED"
  | "INTERVIEW_CANDIDATE_NOT_FOUND"
  | "INTERVIEW_INVALID_PAYLOAD";

export interface InterviewError {
  statusCode: number;
  code: InterviewErrorCode | string;
  message: string;
  slotStart?: string;
  earliestSlot?: string;
  latestReplyDate?: string;
}
