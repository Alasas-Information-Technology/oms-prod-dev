"use client";

import * as React from "react";
import {
  VendorOnboardingDocumentsWorkspace,
  VendorDocument,
  VendorDocumentFile,
  VendorSignatureInfo,
  DocumentStatus,
  computeDocumentHealth,
} from "@/src/types/vendor-documents";
import {
  useVendorDocuments,
  useDebouncedDraftSave,
  useSubmitDocuments,
  useSendForSignature,
} from "@/src/lib/vendor-documents/api";
import { VendorProgressRail } from "./VendorProgressRail";
import { VendorContextBar } from "./VendorContextBar";
import { CandidateSummaryPanel } from "./CandidateSummaryPanel";
import { RequiredDocumentsPanel } from "./RequiredDocumentsPanel";
import { DocumentHealthPanel } from "./DocumentHealthPanel";
import { DocumentUploadModal } from "./DocumentUploadModal";
import { SignaturePanel } from "./SignaturePanel";
import { NdaPreviewModal } from "./NdaPreviewModal";
import { SubmitConfirmationModal } from "./SubmitConfirmationModal";
import { SubmissionReceiptCard } from "./SubmissionReceiptCard";
import { Info, ShieldAlert, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface VendorDocumentsWorkspaceProps {
  onboardingId: string;
  initialData?: VendorOnboardingDocumentsWorkspace;
  fixtureKey?: string;
  className?: string;
}

/**
 * Main Candidate Documents & E-signature Workspace Component
 * Implements layout grid per VENDOR-DOCUMENTS-UI.md Part 2:
 * Desktop: 260px 1fr 320px, 24px gap
 * < 1280px: Right column stacks
 * < 1024px: Single column, signature panel last
 */
export function VendorDocumentsWorkspace({
  onboardingId,
  initialData,
  fixtureKey,
  className,
}: VendorDocumentsWorkspaceProps) {
  // Query hook
  const {
    data: workspace = initialData,
    isLoading,
    error,
  } = useVendorDocuments(onboardingId, fixtureKey, {
    initialData,
  });

  // Local document state to support interactive upload & replace flows
  const [requiredDocsState, setRequiredDocsState] = React.useState<VendorDocument[]>(
    workspace?.requiredDocuments || []
  );
  const [optionalDocsState, setOptionalDocsState] = React.useState<VendorDocument[]>(
    workspace?.optionalDocuments || []
  );

  // Signature state and NDA preview modal state per §4.3
  const [signatureState, setSignatureState] = React.useState<VendorSignatureInfo | null>(
    workspace?.signature || null
  );
  const [isNdaPreviewOpen, setIsNdaPreviewOpen] = React.useState(false);

  // Sync state if remote workspace changes
  React.useEffect(() => {
    if (workspace) {
      setRequiredDocsState(workspace.requiredDocuments);
      setOptionalDocsState(workspace.optionalDocuments);
      setSignatureState(workspace.signature);
    }
  }, [workspace]);

  // Upload/Replace modal state
  const [uploadTargetDoc, setUploadTargetDoc] = React.useState<VendorDocument | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = React.useState(false);

  // Submit confirmation modal and idempotency key (generated once on open, reused on retry per §5 Task 3)
  const [isConfirmModalOpen, setIsConfirmModalOpen] = React.useState(false);
  const [idempotencyKey, setIdempotencyKey] = React.useState<string>("");

  // Successful submission receipt state
  const [submissionSuccess, setSubmissionSuccess] = React.useState<{
    receiptNumber: string;
    receiptDownloadUrl?: string | null;
    submittedAt?: string | null;
  } | null>(
    workspace?.receiptIssued && workspace?.receiptNumber
      ? {
          receiptNumber: workspace.receiptNumber,
          receiptDownloadUrl: workspace.receiptDownloadUrl,
          submittedAt: new Date().toISOString(),
        }
      : null
  );

  // Lifecycle progress rail stage (advances to Stage 4 "DIEZ Review" on submit per §5 Task 3)
  const [currentStage, setCurrentStage] = React.useState<number>(
    workspace?.receiptIssued ? 4 : 2
  );
  const [currentStageLabel, setCurrentStageLabel] = React.useState<string>(
    workspace?.receiptIssued ? "DIEZ Review" : "Required documents"
  );

  // Debounced auto-save hook (2000ms debounce per spec)
  const { isSaving, lastSavedAt, saveNow } = useDebouncedDraftSave(
    onboardingId,
    { optionalDocuments: optionalDocsState },
    2000
  );

  // Submit and signature mutation hooks
  const submitMutation = useSubmitDocuments(onboardingId);
  const sendForSignatureMutation = useSendForSignature(onboardingId);

  // Synced document list ensuring NDA row reflects envelopeStatus per §4.3 & Task 4
  // One state, read in two places, never two separate trackers.
  const syncedRequiredDocs = React.useMemo<VendorDocument[]>(() => {
    return requiredDocsState.map((doc): VendorDocument => {
      if (doc.code === "NDA" || doc.requiresSignature) {
        const isSigned = signatureState?.envelopeStatus === "SIGNED";
        const status: DocumentStatus = isSigned ? "APPROVED" : "PENDING_SIGNATURE";
        return {
          ...doc,
          status,
          file: isSigned
            ? doc.file || {
                id: "file-signed-nda-001",
                name: "DIEZ_NDA_Executed.pdf",
                sizeBytes: 845000,
                mimeType: "application/pdf",
                uploadedAt: signatureState?.signedAt || new Date().toISOString(),
                downloadUrl: "/mock-files/DIEZ_NDA_Executed.pdf",
              }
            : doc.file,
          malwareScanPassed: isSigned ? true : doc.malwareScanPassed,
          fileTypeValid: isSigned ? true : doc.fileTypeValid,
        };
      }
      return doc;
    });
  }, [requiredDocsState, signatureState]);

  // Derived health single source of truth (§1.1 & Requirement 2)
  const health = React.useMemo(() => {
    if (!workspace) return null;
    return computeDocumentHealth(
      syncedRequiredDocs,
      signatureState || workspace.signature
    );
  }, [workspace, syncedRequiredDocs, signatureState]);

  if (isLoading && !workspace) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-muted-foreground text-sm">
        <div className="animate-spin size-5 border-2 border-primary border-t-transparent rounded-full mr-2.5" />
        Loading candidate documents workspace...
      </div>
    );
  }

  if (error || !workspace) {
    return (
      <div className="p-8 max-w-2xl mx-auto my-12 bg-destructive/10 border border-destructive/30 rounded-xl text-center space-y-3">
        <ShieldAlert className="size-8 text-destructive mx-auto" />
        <h2 className="text-lg font-semibold text-foreground">
          Unable to load onboarding documents
        </h2>
        <p className="text-xs text-muted-foreground">
          {error?.message || "Record not found or access unauthorized."}
        </p>
      </div>
    );
  }

  const { candidateRef, position, candidate, deadline, canEdit } = workspace;

  // Handlers for modal interactions
  const handleOpenUpload = (doc: VendorDocument) => {
    setUploadTargetDoc(doc);
    setIsUploadModalOpen(true);
  };

  const handleOpenReplace = (doc: VendorDocument) => {
    setUploadTargetDoc(doc);
    setIsUploadModalOpen(true);
  };

  const handleViewDocument = (doc: VendorDocument) => {
    if (doc.file?.downloadUrl) {
      window.open(doc.file.downloadUrl, "_blank");
    }
  };

  const handleUploadSuccess = (
    docCode: string,
    fileMeta: VendorDocumentFile,
    newExpiresOn?: string
  ) => {
    const updateDoc = (doc: VendorDocument): VendorDocument => {
      if (doc.code !== docCode) return doc;
      return {
        ...doc,
        file: fileMeta,
        status: "UPLOADED",
        expiresOn: newExpiresOn || doc.expiresOn,
        expiringWithinDays: newExpiresOn ? 365 : doc.expiringWithinDays,
        malwareScanPassed: true,
        fileTypeValid: true,
        rejectionReason: null,
      };
    };

    setRequiredDocsState((prev) => prev.map(updateDoc));
    setOptionalDocsState((prev) => prev.map(updateDoc));
  };

  const handleUploadError = (
    docCode: string,
    err: { message: string; code?: string }
  ) => {
    // If it's a replace attempt on an existing file, the existing file is retained!
    // Per §1.13: "The previous file is retained until the new one clears scanning, so a failed replace does not leave the requirement empty."
    setRequiredDocsState((prev) =>
      prev.map((doc) => {
        if (doc.code !== docCode) return doc;
        if (!doc.file) {
          return {
            ...doc,
            status: "SCAN_FAILED",
            malwareScanPassed: false,
            rejectionReason: err.message,
          };
        }
        return doc;
      })
    );
  };

  // Submit blocking reason per Task 5 & Task 1
  let submitDisabledReason: string | undefined;
  if (health) {
    if (health.scanFailed > 0) {
      const failedDoc = syncedRequiredDocs.find((d) => d.status === "SCAN_FAILED");
      submitDisabledReason = `Submission blocked: file "${failedDoc?.file?.name || failedDoc?.label || "document"}" failed malware scanning.`;
    } else if (health.rejected > 0) {
      const rejectedDoc = syncedRequiredDocs.find((d) => d.status === "REJECTED");
      submitDisabledReason = `Submission blocked: ${rejectedDoc?.label || "a document"} was rejected and must be replaced.`;
    } else if (signatureState?.envelopeStatus !== "SIGNED") {
      submitDisabledReason = "Submission blocked: candidate must sign the NDA before submission.";
    } else if (health.missing > 0) {
      submitDisabledReason = `Submission blocked: ${health.missing} required document${health.missing === 1 ? "" : "s"} missing.`;
    }
  }

  // Task 4: When canEdit is false (or submission already completed), the whole page renders read-only:
  // no upload controls, no Send for signature, both page-bar actions ABSENT.
  const isReadonly = !canEdit || Boolean(submissionSuccess) || Boolean(workspace.receiptIssued);
  const effectiveCanEdit = !isReadonly;

  const handleOpenSubmitConfirmation = () => {
    if (!health?.canSubmit) return;
    // Task 3: Key generated once when the confirmation opens, reused on retry
    if (!idempotencyKey) {
      setIdempotencyKey(`idemp-vd-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`);
    }
    setIsConfirmModalOpen(true);
  };

  const handleConfirmSubmit = () => {
    if (!idempotencyKey) return;
    submitMutation.mutate(
      { idempotencyKey },
      {
        onSuccess: (data) => {
          setIsConfirmModalOpen(false);
          setSubmissionSuccess({
            receiptNumber: data.receiptNumber,
            receiptDownloadUrl: data.receiptDownloadUrl,
            submittedAt: data.submittedAt,
          });
          // Advance progress rail to next stage (Stage 4: DIEZ Review per §1.6 & §5)
          setCurrentStage(4);
          setCurrentStageLabel("DIEZ Review");
        },
      }
    );
  };

  return (
    <div className={cn("w-full flex flex-col bg-background", className)}>
      {/* 1. Page Context Bar with Breadcrumb, Sub-line, Severity Deadline, Action Buttons */}
      <VendorContextBar
        onboardingId={onboardingId}
        candidateRef={candidateRef}
        position={position}
        candidate={candidate}
        deadline={deadline}
        canEdit={effectiveCanEdit}
        isSavingDraft={isSaving}
        isSubmitting={submitMutation.isPending}
        onSaveDraft={saveNow}
        onSubmit={handleOpenSubmitConfirmation}
        submitDisabled={!health?.canSubmit}
        submitDisabledReason={submitDisabledReason}
      />

      {/* 2. 4px Progress Rail: Advances on success per §5 Task 3 */}
      <VendorProgressRail
        currentStage={currentStage}
        totalStages={5}
        stageLabel={currentStageLabel}
      />

      {/* 3. Main Workspace Grid: 260px 1fr 320px, 24px gap */}
      <div className="max-w-[1440px] w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Success Receipt Banner (§5 Task 3) */}
        {(submissionSuccess || workspace.receiptIssued) && (
          <SubmissionReceiptCard
            receiptNumber={submissionSuccess?.receiptNumber || workspace.receiptNumber || "RCT-2026-0061"}
            receiptDownloadUrl={submissionSuccess?.receiptDownloadUrl || workspace.receiptDownloadUrl}
            submittedAt={submissionSuccess?.submittedAt}
          />
        )}

        {/* Read-only Banner when user cannot edit (§5 Task 4) */}
        {!effectiveCanEdit && !submissionSuccess && !workspace.receiptIssued && (
          <div className="p-3.5 rounded-xl bg-muted/40 border border-border/70 text-xs text-muted-foreground flex items-center gap-2.5">
            <Lock className="size-4 text-muted-foreground shrink-0" />
            <span>
              <strong>Read-only mode:</strong>{" "}
              {workspace.readOnlyReason ||
                "Only the assigned vendor coordinator for this onboarding record may edit documents."}
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] xl:grid-cols-[260px_1fr_320px] gap-6 items-start">
          {/* Left Column (260px): Candidate Summary Panel */}
          <CandidateSummaryPanel
            candidate={candidate}
            candidateRef={candidateRef}
            position={position}
            deadline={deadline}
            className="order-1"
          />

          {/* Middle Column (1fr): Required Documents (Location-Driven per §1.4 & Part 3) */}
          {health && (
            <RequiredDocumentsPanel
              requiredDocuments={syncedRequiredDocs}
              optionalDocuments={optionalDocsState}
              residentStatus={candidate.residentStatus}
              health={health}
              canEdit={effectiveCanEdit}
              onViewDocument={handleViewDocument}
              onReplaceDocument={handleOpenReplace}
              onUploadDocument={handleOpenUpload}
              className="order-2"
            />
          )}

          {/* Right Column (320px): Signature & Document Health (Stacks on <1280px; Last on <1024px) */}
          <aside
            aria-label="Signature and Document Health"
            className="order-3 lg:order-3 xl:order-3 space-y-6 w-full xl:w-[320px] shrink-0"
          >
            {/* Dedicated E-Signature Panel (§1.2, §1.3, §4.3) */}
            {signatureState && (
              <SignaturePanel
                signature={signatureState}
                candidateName={candidate.fullName}
                canEdit={effectiveCanEdit}
                onSendForSignature={() => {
                  sendForSignatureMutation.mutate(undefined, {
                    onSuccess: (res) => {
                      setSignatureState(res.signature);
                    },
                  });
                }}
                onPreviewNda={() => setIsNdaPreviewOpen(true)}
                isSending={sendForSignatureMutation.isPending}
              />
            )}

            {/* Document Health Derived Summary (§1.1 & §3) */}
            {health && <DocumentHealthPanel health={health} />}
          </aside>
        </div>

        {/* Bottom Legal Notice */}
        <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30 border border-border/50 text-xs text-muted-foreground">
          <Info className="size-4 text-teal-600 dark:text-teal-400 shrink-0" />
          <span>
            Documents are shared only with authorized DIEZ personnel. An audit
            receipt is issued immediately upon final submission.
          </span>
        </div>
      </div>

      {/* Scoped Document Upload / Replace Modal reusing AttachmentList (§1.13 & §4.2) */}
      <DocumentUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => {
          setIsUploadModalOpen(false);
          setUploadTargetDoc(null);
        }}
        document={uploadTargetDoc}
        onUploadSuccess={handleUploadSuccess}
        onUploadError={handleUploadError}
      />

      {/* Rendered NDA Document Preview Modal (§4.3 & Task 3) */}
      {signatureState && (
        <NdaPreviewModal
          isOpen={isNdaPreviewOpen}
          onClose={() => setIsNdaPreviewOpen(false)}
          signature={signatureState}
          candidateName={candidate.fullName}
          candidateNationality={candidate.nationality}
          candidateResidentStatus={candidate.residentStatus}
          position={position}
          onSendForSignature={() => {
            sendForSignatureMutation.mutate(undefined, {
              onSuccess: (res) => {
                setSignatureState(res.signature);
              },
            });
          }}
          isSending={sendForSignatureMutation.isPending}
        />
      )}

      {/* Submit Confirmation Modal per §5 Task 2 & Task 3 */}
      {health && (
        <SubmitConfirmationModal
          isOpen={isConfirmModalOpen}
          onClose={() => setIsConfirmModalOpen(false)}
          candidateName={candidate.fullName}
          candidateRef={candidateRef}
          position={position}
          approvedCount={health.approved}
          pendingCount={health.required - health.approved}
          totalRequired={health.required}
          signatureStatus={signatureState?.envelopeStatus || "NOT_SENT"}
          idempotencyKey={idempotencyKey}
          onConfirmSubmit={handleConfirmSubmit}
          isSubmitting={submitMutation.isPending}
        />
      )}
    </div>
  );
}
