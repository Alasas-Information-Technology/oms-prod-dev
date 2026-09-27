/**
 * Types & Pure Derivations for Candidate Documents & E-signature (Vendor Portal)
 * Specification: docs/VENDOR-DOCUMENTS-UI.md and docs/VENDOR-DOCUMENTS-API-CONTRACT.md
 */

/**
 * Document Status Model (Part 3 of spec)
 * Single enum used across rows, health panel, and workspace status badge.
 */
export type DocumentStatus =
  | "NOT_STARTED"       // No file, not yet due (Neutral)
  | "UPLOADED"          // Submitted, awaiting scan (Info)
  | "SCAN_FAILED"       // Failed malware scan — blocks submission (Danger)
  | "UNDER_REVIEW"      // Passed scan, awaiting DIEZ review (Info)
  | "APPROVED"          // Reviewed and accepted (Success)
  | "REJECTED"          // Reviewed and declined — reason shown, re-upload required (Danger)
  | "PENDING_SIGNATURE" // Awaiting e-signature, not a file upload (Warning)
  | "MISSING";          // Required, nothing provided, past deadline (Danger)

/**
 * Standard Document Codes
 */
export type StandardDocumentCode =
  | "PASSPORT"
  | "EMIRATES_ID"
  | "NATIONAL_ID"
  | "POLICE_CLEARANCE"
  | "NDA";

export type ResidentStatus = "ONSHORE" | "OFFSHORE";

export type EnvelopeStatus =
  | "NOT_SENT"
  | "SENT"
  | "VIEWED"
  | "SIGNED"
  | "DECLINED";

export type DeadlineSeverity = "NORMAL" | "WARNING" | "CRITICAL";

/**
 * Uploaded Document File Metadata
 */
export interface VendorDocumentFile {
  id: string;
  name: string;
  sizeBytes: number;
  mimeType?: string;
  uploadedAt?: string;
  downloadUrl?: string;
}

/**
 * Document Row Item
 */
export interface VendorDocument {
  code: string;
  label: string;
  status: DocumentStatus;
  file: VendorDocumentFile | null;
  expiresOn: string | null;            // ISO Date YYYY-MM-DD
  expiringWithinDays: number | null;   // Precomputed or evaluated; <= 90 is "soon"
  malwareScanPassed: boolean | null;
  fileTypeValid: boolean | null;
  rejectionReason: string | null;
  requiresSignature?: boolean;
  isOptional?: boolean;
}

/**
 * Candidate Details (Read-only reference from submission)
 */
export interface VendorCandidateSummary {
  fullName: string;
  nationality: string;
  residentStatus: ResidentStatus;
  expectedJoining: string;             // ISO Date YYYY-MM-DD
  email: string;                       // Unmasked for record owner
  mobile: string;                      // Unmasked for record owner
  privacyNoticeAcknowledged: boolean;
}

/**
 * Signer in Envelope
 */
export interface VendorSigner {
  order: number;
  name: string;
  role: "Candidate" | "DIEZ" | string;
  status?: "PENDING" | "SIGNED" | "DECLINED";
}

/**
 * Signature Panel Details
 */
export interface VendorSignatureInfo {
  templateName: string;
  envelopeStatus: EnvelopeStatus;
  signers: VendorSigner[];
  previewUrl: string;
  sentAt?: string | null;
  signedAt?: string | null;
}

/**
 * Joining Deadline
 */
export interface VendorOnboardingDeadline {
  joiningDate: string;
  daysRemaining: number;
  severity: DeadlineSeverity;
}

/**
 * Complete Workspace Response
 */
export interface VendorOnboardingDocumentsWorkspace {
  onboardingId: string;
  candidateRef: string;
  position: string;
  candidate: VendorCandidateSummary;
  canEdit: boolean;
  readOnlyReason: string | null;
  requiredDocuments: VendorDocument[];
  optionalDocuments: VendorDocument[];
  signature: VendorSignatureInfo;
  deadline: VendorOnboardingDeadline;
  receiptIssued: boolean;
  receiptNumber?: string | null;
  receiptDownloadUrl?: string | null;
}

/**
 * Document Health (Derived View)
 * This is a TYPE-LEVEL derived value, strictly computed from the row list.
 */
export interface DocumentHealth {
  required: number;
  uploaded: number;
  approved: number;
  expiringSoon: number;
  missing: number;
  scanFailed: number;
  rejected: number;
  canSubmit: boolean;
}

/**
 * Expiry threshold in days per system standard (§1.8)
 */
export const EXPIRY_SOON_THRESHOLD_DAYS = 90;

/**
 * Helper to check if a date is within 90 days
 */
export function isExpiringSoon(expiresOn: string | null, referenceDate: Date = new Date()): boolean {
  if (!expiresOn) return false;
  const exp = new Date(expiresOn);
  if (isNaN(exp.getTime())) return false;
  const diffTime = exp.getTime() - referenceDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays >= 0 && diffDays <= EXPIRY_SOON_THRESHOLD_DAYS;
}

/**
 * Pure function: Computes Document Health from row data.
 * Single source of truth for the health panel, badges, and submit gating.
 * Prevents any reconciliation drift between health counts and visible rows.
 */
export function computeDocumentHealth(
  documents: VendorDocument[],
  signature?: VendorSignatureInfo
): DocumentHealth {
  const requiredDocs = documents.filter((d) => !d.isOptional);

  let uploadedCount = 0;
  let approvedCount = 0;
  let expiringSoonCount = 0;
  let missingCount = 0;
  let scanFailedCount = 0;
  let rejectedCount = 0;

  for (const doc of requiredDocs) {
    // Check if uploaded
    if (
      doc.file !== null ||
      doc.status === "UPLOADED" ||
      doc.status === "UNDER_REVIEW" ||
      doc.status === "APPROVED" ||
      doc.status === "SCAN_FAILED" ||
      doc.status === "REJECTED" ||
      (doc.requiresSignature && signature?.envelopeStatus === "SIGNED")
    ) {
      uploadedCount++;
    }

    // Check approved
    if (doc.status === "APPROVED") {
      approvedCount++;
    }

    // Check expiring soon
    if (
      (doc.expiringWithinDays !== null &&
        doc.expiringWithinDays !== undefined &&
        doc.expiringWithinDays <= EXPIRY_SOON_THRESHOLD_DAYS &&
        doc.expiringWithinDays >= 0) ||
      isExpiringSoon(doc.expiresOn)
    ) {
      expiringSoonCount++;
    }

    // Check missing
    if (doc.status === "MISSING" || (doc.status === "NOT_STARTED" && !doc.file)) {
      missingCount++;
    }

    // Check scan failed
    if (doc.status === "SCAN_FAILED" || doc.malwareScanPassed === false) {
      scanFailedCount++;
    }

    // Check rejected
    if (doc.status === "REJECTED") {
      rejectedCount++;
    }
  }

  // Submit is allowed only when:
  // 1. No required doc is missing or not started
  // 2. Zero scan failures
  // 3. Zero un-replaced rejected documents
  // 4. NDA is signed (if required)
  const isNdaSigned = signature ? signature.envelopeStatus === "SIGNED" : true;
  const canSubmit =
    missingCount === 0 &&
    scanFailedCount === 0 &&
    rejectedCount === 0 &&
    isNdaSigned &&
    uploadedCount === requiredDocs.length;

  return {
    required: requiredDocs.length,
    uploaded: uploadedCount,
    approved: approvedCount,
    expiringSoon: expiringSoonCount,
    missing: missingCount,
    scanFailed: scanFailedCount,
    rejected: rejectedCount,
    canSubmit,
  };
}

/**
 * API Payloads & Responses
 */
export interface VendorDocumentUploadResponse {
  success: boolean;
  document: VendorDocument;
}

export interface VendorDocumentReplaceResponse {
  success: boolean;
  document: VendorDocument;
  previousFileArchived: boolean;
}

export interface VendorSignatureSendResponse {
  success: boolean;
  signature: VendorSignatureInfo;
}

export interface VendorDocumentDraftPayload {
  optionalDocuments: VendorDocument[];
  notes?: string;
}

export interface VendorDocumentDraftResponse {
  success: boolean;
  savedAt: string;
}

export interface VendorDocumentSubmitPayload {
  idempotencyKey: string;
}

export interface VendorDocumentSubmitResponse {
  success: boolean;
  receiptNumber: string;
  submittedAt: string;
  receiptDownloadUrl: string;
  nextStage: string;
}

export interface VendorDocumentsApiError {
  statusCode: number;
  code: string;
  message: string;
  details?: Record<string, unknown> | null;
}
