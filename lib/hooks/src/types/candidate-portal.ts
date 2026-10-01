/**
 * TypeScript Contracts for Candidate Joining Readiness (Third Surface)
 * Specification: docs/CANDIDATE-JOINING-READINESS.md Part 4 and docs/CANDIDATE-JOINING-API-CONTRACT.md
 */

export type CandidateResidentStatus = "ONSHORE" | "OFFSHORE";

export type CandidateTaskStatus =
  | "DANGER"    // Urgent / critical / overdue
  | "WARNING"   // Needs action soon (e.g. < 2 days)
  | "INFO"      // Action available
  | "COMPLETE"  // Task fulfilled
  | "PENDING";  // Awaiting antecedent action

export type CandidateTaskAction =
  | "BOOK_SLOT"           // Opens slot booking modal/pattern
  | "UPLOAD"              // Opens document/photo upload
  | "VIEW_SIGNED"         // Views signed e-envelope / document
  | "CONFIRM_DATE"        // Confirm joining date
  | "CONFIRM_READINESS"   // Final readiness attestation
  | "NONE";               // Read-only indicator

export type CandidateTaskCode =
  | "PRE_EMPLOYMENT_MEDICAL"
  | "BIOMETRIC_ENROLLMENT"
  | "PASSPORT_PHOTO_UPLOAD"
  | "REMOTE_ACCESS_READINESS"
  | "NDA_SIGNATURE"
  | "CONFIRM_JOINING_DATE"
  | string;

export interface CandidatePortalTask {
  code: CandidateTaskCode;
  label: string;
  detail: string;
  dueAt: string;                // ISO Date YYYY-MM-DD
  status: CandidateTaskStatus;
  action: CandidateTaskAction;
  onshoreOnly: boolean;
}

export type BiometricAppointmentStatus =
  | "NOT_REQUIRED"
  | "NOT_SCHEDULED"
  | "PENDING"
  | "SCHEDULED"
  | "COMPLETED";

export interface CandidatePortalKpi {
  documents: {
    completed: number;
    total: number;
  };
  offerReference: string;
  biometricAppointment: BiometricAppointmentStatus | string;
  joiningConfirmed: boolean;
}

export type CandidateStepperStageCode =
  | "DOCUMENTS_SUBMITTED"
  | "E_SIGNATURE"
  | "DIEZ_REVIEW"
  | "JOINING_READINESS"
  | "JOINED"
  | string;

export type StepperSegmentState = "COMPLETE" | "CURRENT" | "PENDING" | "UPCOMING";

export interface CandidatePortalStepperStage {
  stage: CandidateStepperStageCode;
  label?: string;
  state: StepperSegmentState;
  completedAt: string | null;   // ISO timestamp or null
  actorRole: string | null;     // Anonymised: "onboarding team", never a person's name
}

export type ITReadinessStatus = "IN_PROGRESS" | "READY";

export interface CandidateFirstDayInfo {
  location: string;
  reportingTime: string;
  dressCode: string;
  whatToBring: string[];
  itReadiness: ITReadinessStatus;
}

export interface CandidateCoordinator {
  name: string;
  role: string;
  avatarUrl?: string;
  email?: string;
  phone?: string;
}

/**
 * Authoritative response payload for GET /api/v1/candidate-portal/{token}
 */
export interface CandidatePortalResponse {
  valid: boolean;
  onboardingCase: string;       // e.g. "ONB-2026-0061"
  candidateRef: string;         // e.g. "C-014"
  candidateName?: string;       // e.g. "Samir Rahman"
  candidateFirstName?: string;  // e.g. "Samir" (for top bar greeting / avatar)
  position: string;             // e.g. "Senior Cybersecurity Analyst"
  residentStatus: CandidateResidentStatus;
  expectedJoining: string;      // YYYY-MM-DD
  readinessScore: number;       // 0-100 (rendered as T5 segmented tick bar, 20 ticks)
  kpi: CandidatePortalKpi;
  tasks: CandidatePortalTask[];
  stepper: CandidatePortalStepperStage[];
  firstDay: CandidateFirstDayInfo;
  coordinator: CandidateCoordinator;
  readyToConfirm: boolean;
  blockingTasksRemaining: number;
}

/**
 * Generic non-enumeration error payload for unknown/expired/revoked tokens
 */
export interface CandidatePortalErrorResponse {
  valid: false;
  code: string;
  message: string;
}
