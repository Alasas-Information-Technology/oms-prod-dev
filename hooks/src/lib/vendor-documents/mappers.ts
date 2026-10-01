/**
 * Vendor Documents Domain Mappers
 * Converts canonical Demo Data entity (OnboardingCase) into VendorOnboardingDocumentsWorkspace.
 */

import {
  VendorOnboardingDocumentsWorkspace,
  VendorDocument,
  VendorDocumentFile,
  VendorSignatureInfo,
  VendorOnboardingDeadline,
  DocumentStatus,
} from "@/src/types/vendor-documents";
import { OnboardingCase, OnboardingDocument } from "@/src/lib/demo-data/entities";

/**
 * Maps a canonical OnboardingDocument to VendorDocument
 */
export function mapToVendorDocument(doc: OnboardingDocument): VendorDocument {
  const file: VendorDocumentFile | null = doc.file
    ? {
        id: doc.file.id,
        name: doc.file.name,
        sizeBytes: doc.file.sizeBytes,
        mimeType: doc.file.mimeType || "application/pdf",
        uploadedAt: doc.file.uploadedAt || new Date().toISOString(),
        downloadUrl: `/mock-files/${doc.file.name}`,
      }
    : null;

  return {
    code: doc.code,
    label: doc.label,
    status: doc.status as DocumentStatus,
    file,
    expiresOn: doc.expiresOn || null,
    expiringWithinDays: doc.expiringWithinDays ?? null,
    malwareScanPassed: doc.malwareScanPassed ?? null,
    fileTypeValid: doc.fileTypeValid ?? null,
    rejectionReason: doc.rejectionReason || null,
    requiresSignature: doc.requiresSignature ?? (doc.code === "NDA"),
    isOptional: false,
  };
}

/**
 * Maps canonical OnboardingCase to VendorOnboardingDocumentsWorkspace
 */
export function mapToVendorOnboardingWorkspace(
  onb: OnboardingCase
): VendorOnboardingDocumentsWorkspace {
  const requiredDocuments = (onb.documents || []).map(mapToVendorDocument);

  const signature: VendorSignatureInfo = {
    templateName: onb.signature?.templateName || "DIEZ Standard Contractor Non-Disclosure Agreement v3.2",
    envelopeStatus: onb.signature?.envelopeStatus || "SENT",
    signers: (onb.signature?.signers || []).map((s) => ({
      order: s.order,
      name: s.name,
      role: s.role,
      status: s.status,
    })),
    previewUrl: onb.signature?.previewUrl || "https://storage.diez.ae/legal/templates/nda-v3.2-preview.pdf",
    sentAt: onb.signature?.sentAt ?? null,
    signedAt: onb.signature?.signedAt ?? null,
  };

  const deadline: VendorOnboardingDeadline = {
    joiningDate: onb.deadline?.joiningDate || "2026-10-01",
    daysRemaining: onb.deadline?.daysRemaining ?? 21,
    severity: onb.deadline?.severity || "NORMAL",
  };

  return {
    onboardingId: onb.id,
    candidateRef: onb.candidateRef,
    position: onb.positionTitle,
    candidate: {
      fullName: onb.candidate.fullName,
      nationality: onb.candidate.nationality,
      residentStatus: onb.candidate.residentStatus,
      expectedJoining: onb.candidate.expectedJoining,
      email: onb.candidate.email,
      mobile: onb.candidate.mobile,
      privacyNoticeAcknowledged: onb.candidate.privacyNoticeAcknowledged ?? true,
    },
    canEdit: onb.canEdit ?? true,
    readOnlyReason: onb.canEdit ? null : "Submitted to DIEZ Procurement. Workspace is currently locked for review.",
    requiredDocuments,
    optionalDocuments: [],
    signature,
    deadline,
    receiptIssued: onb.submittedToDiez ?? false,
    receiptNumber: onb.submittedToDiez ? `RCP-${onb.id.replace("ONB-", "")}` : null,
    receiptDownloadUrl: onb.submittedToDiez ? `/mock-files/receipt-${onb.id}.pdf` : null,
  };
}
