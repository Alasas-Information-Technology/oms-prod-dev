/**
 * Fixtures for Candidate Documents & E-signature (Vendor Portal)
 * Specification: docs/VENDOR-DOCUMENTS-UI.md Part 1, Part 4, Part 5
 *
 * Covers all 5 mandatory cases:
 * a) Reference case, onshore, C-014, 3 of 4 uploaded, one pending signature.
 * b) OFFSHORE candidate — different required document set (Passport, National ID, NDA only).
 * c) A SCAN_FAILED row, to test the blocking state.
 * d) A REJECTED row with a reason, to test re-upload.
 * e) Deadline CRITICAL — 2 days remaining to joining.
 */

import {
  VendorOnboardingDocumentsWorkspace,
  computeDocumentHealth,
  DocumentHealth,
} from "@/src/types/vendor-documents";

/**
 * Case a: Reference case (Onshore, C-014 Samir Rahman)
 * 3 of 4 uploaded, one pending signature, 1 expiring soon (Police Clearance).
 * Document Health strictly reconciles with the 4 rows:
 * Required: 4 | Uploaded: 3 | Approved: 1 | Expiring soon: 1 | Missing: 0
 */
export const FIXTURE_VENDOR_DOCUMENTS_REFERENCE: VendorOnboardingDocumentsWorkspace = {
  onboardingId: "ONB-2026-0061",
  candidateRef: "C-014",
  position: "Senior Cybersecurity Analyst",
  candidate: {
    fullName: "Samir Rahman",
    nationality: "India",
    residentStatus: "ONSHORE",
    expectedJoining: "2026-09-01",
    email: "samir.rahman@example.com",
    mobile: "+971 50 123 4567",
    privacyNoticeAcknowledged: true,
  },
  canEdit: true,
  readOnlyReason: null,
  requiredDocuments: [
    {
      code: "PASSPORT",
      label: "Passport (bio page)",
      status: "APPROVED",
      file: {
        id: "file-pass-001",
        name: "Passport_Samir.pdf",
        sizeBytes: 2457600,
        mimeType: "application/pdf",
        uploadedAt: "2026-08-20T10:15:00Z",
        downloadUrl: "/mock-files/Passport_Samir.pdf",
      },
      expiresOn: "2031-03-14",
      expiringWithinDays: 1648,
      malwareScanPassed: true,
      fileTypeValid: true,
      rejectionReason: null,
      isOptional: false,
    },
    {
      code: "EMIRATES_ID",
      label: "Emirates ID",
      status: "UNDER_REVIEW",
      file: {
        id: "file-eid-001",
        name: "EID_Samir.pdf",
        sizeBytes: 1843200,
        mimeType: "application/pdf",
        uploadedAt: "2026-08-21T08:30:00Z",
        downloadUrl: "/mock-files/EID_Samir.pdf",
      },
      expiresOn: "2027-11-21",
      expiringWithinDays: 439,
      malwareScanPassed: true,
      fileTypeValid: true,
      rejectionReason: null,
      isOptional: false,
    },
    {
      code: "POLICE_CLEARANCE",
      label: "Police Clearance",
      status: "UPLOADED",
      file: {
        id: "file-pcc-001",
        name: "Police_Clearance.pdf",
        sizeBytes: 3145728,
        mimeType: "application/pdf",
        uploadedAt: "2026-08-24T08:15:00Z",
        downloadUrl: "/mock-files/Police_Clearance.pdf",
      },
      expiresOn: "2026-10-30",
      expiringWithinDays: 67, // <= 90 triggers amber "· soon"
      malwareScanPassed: true,
      fileTypeValid: true,
      rejectionReason: null,
      isOptional: false,
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
      isOptional: false,
    },
  ],
  optionalDocuments: [],
  signature: {
    templateName: "DIEZ Outsourced Resource NDA",
    envelopeStatus: "NOT_SENT",
    signers: [
      { order: 1, name: "Samir Rahman", role: "Candidate", status: "PENDING" },
      { order: 2, name: "DIEZ Representative", role: "DIEZ", status: "PENDING" },
    ],
    previewUrl: "/mock/nda-preview.pdf",
    sentAt: null,
    signedAt: null,
  },
  deadline: {
    joiningDate: "2026-09-01",
    daysRemaining: 8,
    severity: "NORMAL",
  },
  receiptIssued: false,
  receiptNumber: null,
};

/**
 * Case b: OFFSHORE candidate (C-015 Elena Rostova)
 * Location-driven requirement set per §1.4:
 * Required: Passport, National ID, NDA (3 items total — NO Emirates ID, NO Police Clearance).
 */
export const FIXTURE_VENDOR_DOCUMENTS_OFFSHORE: VendorOnboardingDocumentsWorkspace = {
  onboardingId: "ONB-2026-0062",
  candidateRef: "C-015",
  position: "Senior Cloud Solutions Architect",
  candidate: {
    fullName: "Elena Rostova",
    nationality: "Poland",
    residentStatus: "OFFSHORE",
    expectedJoining: "2026-09-15",
    email: "elena.rostova@cloudsolutions.eu",
    mobile: "+48 22 123 4567",
    privacyNoticeAcknowledged: true,
  },
  canEdit: true,
  readOnlyReason: null,
  requiredDocuments: [
    {
      code: "PASSPORT",
      label: "Passport (bio page)",
      status: "APPROVED",
      file: {
        id: "file-pass-002",
        name: "Passport_Elena.pdf",
        sizeBytes: 2100000,
        mimeType: "application/pdf",
        uploadedAt: "2026-08-18T14:00:00Z",
      },
      expiresOn: "2030-06-15",
      expiringWithinDays: 1375,
      malwareScanPassed: true,
      fileTypeValid: true,
      rejectionReason: null,
      isOptional: false,
    },
    {
      code: "NATIONAL_ID",
      label: "National Identity Card",
      status: "UNDER_REVIEW",
      file: {
        id: "file-nid-001",
        name: "National_ID_Elena.pdf",
        sizeBytes: 1500000,
        mimeType: "application/pdf",
        uploadedAt: "2026-08-19T11:20:00Z",
      },
      expiresOn: "2029-08-20",
      expiringWithinDays: 1075,
      malwareScanPassed: true,
      fileTypeValid: true,
      rejectionReason: null,
      isOptional: false,
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
      isOptional: false,
    },
  ],
  optionalDocuments: [],
  signature: {
    templateName: "DIEZ Outsourced Resource NDA",
    envelopeStatus: "NOT_SENT",
    signers: [
      { order: 1, name: "Elena Rostova", role: "Candidate", status: "PENDING" },
      { order: 2, name: "DIEZ Representative", role: "DIEZ", status: "PENDING" },
    ],
    previewUrl: "/mock/nda-preview.pdf",
    sentAt: null,
    signedAt: null,
  },
  deadline: {
    joiningDate: "2026-09-15",
    daysRemaining: 14,
    severity: "NORMAL",
  },
  receiptIssued: false,
  receiptNumber: null,
};

/**
 * Case c: SCAN_FAILED row (C-016 Tariq Al-Hashemi)
 * Demonstrates cybersecurity blocking state per §1.7 and Server Requirement 3.
 * Submit button is disabled; banner identifies quarantined file.
 */
export const FIXTURE_VENDOR_DOCUMENTS_SCAN_FAILED: VendorOnboardingDocumentsWorkspace = {
  onboardingId: "ONB-2026-0063",
  candidateRef: "C-016",
  position: "Principal SOC Analyst",
  candidate: {
    fullName: "Tariq Al-Hashemi",
    nationality: "Jordan",
    residentStatus: "ONSHORE",
    expectedJoining: "2026-09-05",
    email: "tariq.hashemi@socsec.jo",
    mobile: "+971 52 987 6543",
    privacyNoticeAcknowledged: true,
  },
  canEdit: true,
  readOnlyReason: null,
  requiredDocuments: [
    {
      code: "PASSPORT",
      label: "Passport (bio page)",
      status: "APPROVED",
      file: {
        id: "file-pass-003",
        name: "Passport_Tariq.pdf",
        sizeBytes: 2500000,
        uploadedAt: "2026-08-15T09:00:00Z",
      },
      expiresOn: "2032-01-10",
      expiringWithinDays: 1965,
      malwareScanPassed: true,
      fileTypeValid: true,
      rejectionReason: null,
      isOptional: false,
    },
    {
      code: "EMIRATES_ID",
      label: "Emirates ID",
      status: "APPROVED",
      file: {
        id: "file-eid-003",
        name: "EID_Tariq.pdf",
        sizeBytes: 1900000,
        uploadedAt: "2026-08-15T09:05:00Z",
      },
      expiresOn: "2028-04-12",
      expiringWithinDays: 600,
      malwareScanPassed: true,
      fileTypeValid: true,
      rejectionReason: null,
      isOptional: false,
    },
    {
      code: "POLICE_CLEARANCE",
      label: "Police Clearance",
      status: "SCAN_FAILED", // BLOCKING STATE
      file: {
        id: "file-pcc-corrupt",
        name: "Police_Clearance_Scan.pdf",
        sizeBytes: 524288,
        uploadedAt: "2026-08-22T16:45:00Z",
      },
      expiresOn: null,
      expiringWithinDays: null,
      malwareScanPassed: false,
      fileTypeValid: true,
      rejectionReason: "Malware threat detected: Win32.EICAR-Test-File. File quarantined and blocked from submission.",
      isOptional: false,
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
      isOptional: false,
    },
  ],
  optionalDocuments: [],
  signature: {
    templateName: "DIEZ Outsourced Resource NDA",
    envelopeStatus: "SENT",
    signers: [
      { order: 1, name: "Tariq Al-Hashemi", role: "Candidate", status: "PENDING" },
      { order: 2, name: "DIEZ Representative", role: "DIEZ", status: "PENDING" },
    ],
    previewUrl: "/mock/nda-preview.pdf",
    sentAt: "2026-08-22T10:00:00Z",
    signedAt: null,
  },
  deadline: {
    joiningDate: "2026-09-05",
    daysRemaining: 12,
    severity: "NORMAL",
  },
  receiptIssued: false,
  receiptNumber: null,
};

/**
 * Case d: REJECTED row with reason (C-017 Marcus Vance)
 * Demonstrates DIEZ review rejection state per §1.6.
 * Emirates ID was rejected with plain inline reason; primary action is Replace.
 */
export const FIXTURE_VENDOR_DOCUMENTS_REJECTED: VendorOnboardingDocumentsWorkspace = {
  onboardingId: "ONB-2026-0064",
  candidateRef: "C-017",
  position: "Senior DevSecOps Engineer",
  candidate: {
    fullName: "Marcus Vance",
    nationality: "United Kingdom",
    residentStatus: "ONSHORE",
    expectedJoining: "2026-09-10",
    email: "marcus.vance@cloudsec.co.uk",
    mobile: "+971 55 432 1098",
    privacyNoticeAcknowledged: true,
  },
  canEdit: true,
  readOnlyReason: null,
  requiredDocuments: [
    {
      code: "PASSPORT",
      label: "Passport (bio page)",
      status: "APPROVED",
      file: {
        id: "file-pass-004",
        name: "Passport_Marcus.pdf",
        sizeBytes: 2800000,
        uploadedAt: "2026-08-16T12:00:00Z",
      },
      expiresOn: "2031-10-01",
      expiringWithinDays: 1860,
      malwareScanPassed: true,
      fileTypeValid: true,
      rejectionReason: null,
      isOptional: false,
    },
    {
      code: "EMIRATES_ID",
      label: "Emirates ID",
      status: "REJECTED", // REJECTED STATE
      file: {
        id: "file-eid-blurry",
        name: "EID_Scan_Blurry.pdf",
        sizeBytes: 950000,
        uploadedAt: "2026-08-17T14:30:00Z",
      },
      expiresOn: "2027-05-15",
      expiringWithinDays: 250,
      malwareScanPassed: true,
      fileTypeValid: true,
      rejectionReason: "The back side of Emirates ID is blurry and unreadable. Please re-upload a clear colour scan of both sides.",
      isOptional: false,
    },
    {
      code: "POLICE_CLEARANCE",
      label: "Police Clearance",
      status: "UNDER_REVIEW",
      file: {
        id: "file-pcc-004",
        name: "Police_Clearance_Marcus.pdf",
        sizeBytes: 2400000,
        uploadedAt: "2026-08-18T10:00:00Z",
      },
      expiresOn: "2027-02-28",
      expiringWithinDays: 180,
      malwareScanPassed: true,
      fileTypeValid: true,
      rejectionReason: null,
      isOptional: false,
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
      isOptional: false,
    },
  ],
  optionalDocuments: [],
  signature: {
    templateName: "DIEZ Outsourced Resource NDA",
    envelopeStatus: "VIEWED",
    signers: [
      { order: 1, name: "Marcus Vance", role: "Candidate", status: "PENDING" },
      { order: 2, name: "DIEZ Representative", role: "DIEZ", status: "PENDING" },
    ],
    previewUrl: "/mock/nda-preview.pdf",
    sentAt: "2026-08-19T09:00:00Z",
    signedAt: null,
  },
  deadline: {
    joiningDate: "2026-09-10",
    daysRemaining: 7,
    severity: "WARNING",
  },
  receiptIssued: false,
  receiptNumber: null,
};

/**
 * Case e: Deadline CRITICAL — 2 days remaining to joining (C-018 Amina Al-Mansoor)
 * Demonstrates deadline escalation per §1.12.
 * Days remaining is 2 (<3 days threshold) -> severity "CRITICAL" (red tone).
 */
export const FIXTURE_VENDOR_DOCUMENTS_DEADLINE_CRITICAL: VendorOnboardingDocumentsWorkspace = {
  onboardingId: "ONB-2026-0065",
  candidateRef: "C-018",
  position: "Cyber Threat Hunter",
  candidate: {
    fullName: "Amina Al-Mansoor",
    nationality: "United Arab Emirates",
    residentStatus: "ONSHORE",
    expectedJoining: "2026-08-26",
    email: "amina.mansoor@diez-partners.ae",
    mobile: "+971 50 999 8877",
    privacyNoticeAcknowledged: true,
  },
  canEdit: true,
  readOnlyReason: null,
  requiredDocuments: [
    {
      code: "PASSPORT",
      label: "Passport (bio page)",
      status: "APPROVED",
      file: {
        id: "file-pass-005",
        name: "Passport_Amina.pdf",
        sizeBytes: 3100000,
        uploadedAt: "2026-08-10T10:00:00Z",
      },
      expiresOn: "2033-05-12",
      expiringWithinDays: 2450,
      malwareScanPassed: true,
      fileTypeValid: true,
      rejectionReason: null,
      isOptional: false,
    },
    {
      code: "EMIRATES_ID",
      label: "Emirates ID",
      status: "APPROVED",
      file: {
        id: "file-eid-005",
        name: "EID_Amina.pdf",
        sizeBytes: 2100000,
        uploadedAt: "2026-08-10T10:15:00Z",
      },
      expiresOn: "2028-09-20",
      expiringWithinDays: 750,
      malwareScanPassed: true,
      fileTypeValid: true,
      rejectionReason: null,
      isOptional: false,
    },
    {
      code: "POLICE_CLEARANCE",
      label: "Police Clearance",
      status: "APPROVED",
      file: {
        id: "file-pcc-005",
        name: "Police_Clearance_Amina.pdf",
        sizeBytes: 2600000,
        uploadedAt: "2026-08-11T11:00:00Z",
      },
      expiresOn: "2027-01-15",
      expiringWithinDays: 140,
      malwareScanPassed: true,
      fileTypeValid: true,
      rejectionReason: null,
      isOptional: false,
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
      isOptional: false,
    },
  ],
  optionalDocuments: [],
  signature: {
    templateName: "DIEZ Outsourced Resource NDA",
    envelopeStatus: "SENT",
    signers: [
      { order: 1, name: "Amina Al-Mansoor", role: "Candidate", status: "PENDING" },
      { order: 2, name: "DIEZ Representative", role: "DIEZ", status: "PENDING" },
    ],
    previewUrl: "/mock/nda-preview.pdf",
    sentAt: "2026-08-20T12:00:00Z",
    signedAt: null,
  },
  deadline: {
    joiningDate: "2026-08-26",
    daysRemaining: 2, // CRITICAL (< 3 days)
    severity: "CRITICAL",
  },
  receiptIssued: false,
  receiptNumber: null,
};

/**
 * Map of all available vendor onboarding fixtures
 */
export const MOCK_VENDOR_DOCUMENTS_FIXTURES: Record<string, VendorOnboardingDocumentsWorkspace> = {
  "ONB-2026-0061": FIXTURE_VENDOR_DOCUMENTS_REFERENCE,
  reference: FIXTURE_VENDOR_DOCUMENTS_REFERENCE,
  "ONB-2026-0062": FIXTURE_VENDOR_DOCUMENTS_OFFSHORE,
  offshore: FIXTURE_VENDOR_DOCUMENTS_OFFSHORE,
  "ONB-2026-0063": FIXTURE_VENDOR_DOCUMENTS_SCAN_FAILED,
  "scan-failed": FIXTURE_VENDOR_DOCUMENTS_SCAN_FAILED,
  "ONB-2026-0064": FIXTURE_VENDOR_DOCUMENTS_REJECTED,
  rejected: FIXTURE_VENDOR_DOCUMENTS_REJECTED,
  "ONB-2026-0065": FIXTURE_VENDOR_DOCUMENTS_DEADLINE_CRITICAL,
  "deadline-critical": FIXTURE_VENDOR_DOCUMENTS_DEADLINE_CRITICAL,
};

/**
 * Pure helper to obtain derived health for any fixture
 */
export function getFixtureHealth(fixture: VendorOnboardingDocumentsWorkspace): DocumentHealth {
  return computeDocumentHealth(fixture.requiredDocuments, fixture.signature);
}

import { getOnboarding } from "@/src/lib/demo-data";
import { mapToVendorOnboardingWorkspace } from "./mappers";

/**
 * Demo-data backed Vendor Documents fixture.
 * Returns null if the onboarding case does not exist in demo-data (strict 404).
 */
export function getVendorDocumentsFixture(
  onboardingId: string
): VendorOnboardingDocumentsWorkspace | null {
  if (!onboardingId) return null;

  const onb = getOnboarding(onboardingId);
  if (!onb) return null;

  return mapToVendorOnboardingWorkspace(onb);
}

