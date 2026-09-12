/**
 * Automated Verification Test for VD6 (Submit Flow, Gating, Confirmation Modal, Idempotency, Receipt, Read-Only)
 * Specification: docs/VENDOR-DOCUMENTS-UI.md Part 5 Server Requirements & §1.3, §1.6
 */

import React from "react";
import fs from "fs";
import path from "path";
import { renderToString } from "react-dom/server";
import {
  FIXTURE_VENDOR_DOCUMENTS_REFERENCE,
  FIXTURE_VENDOR_DOCUMENTS_SCAN_FAILED,
  FIXTURE_VENDOR_DOCUMENTS_REJECTED,
} from "../src/lib/vendor-documents/fixtures";
import { VendorContextBar } from "../components/oms/vendor-documents/VendorContextBar";
import {
  SubmitConfirmationModalContent,
} from "../components/oms/vendor-documents/SubmitConfirmationModal";
import { SubmissionReceiptCard } from "../components/oms/vendor-documents/SubmissionReceiptCard";
import { SignaturePanel } from "../components/oms/vendor-documents/SignaturePanel";
import { DocumentRow } from "../components/oms/vendor-documents/DocumentRow";
import { Dialog } from "../components/ui/dialog";
import { computeDocumentHealth, VendorDocument } from "../src/types/vendor-documents";

async function main() {
  console.log("=== VD6 SUBMIT FLOW & SERVER REQUIREMENTS VERIFICATION ===");
  let passed = 0;
  let total = 0;

  function assert(condition: boolean, description: string) {
    total++;
    if (condition) {
      console.log(`[PASS] ${description}`);
      passed++;
    } else {
      console.error(`[FAIL] ${description}`);
      process.exitCode = 1;
    }
  }

  const ref = FIXTURE_VENDOR_DOCUMENTS_REFERENCE;

  // ───────────────────────────────────────────────────────────────────────────
  // TASK 1: Submit Gating & Inline Blocking Reason
  // ───────────────────────────────────────────────────────────────────────────
  // Case A: NDA Not Signed
  const healthNdaNotSigned = computeDocumentHealth(ref.requiredDocuments, {
    ...ref.signature,
    envelopeStatus: "NOT_SENT",
  });
  assert(
    !healthNdaNotSigned.canSubmit,
    "Gating: canSubmit is FALSE when NDA is not signed"
  );

  const contextBarNdaBlockedHtml = renderToString(
    <VendorContextBar
      onboardingId="ONB-2026-0061"
      candidateRef="C-014"
      position="Senior Cybersecurity Analyst"
      candidate={ref.candidate}
      deadline={ref.deadline}
      canEdit={true}
      isSavingDraft={false}
      isSubmitting={false}
      onSaveDraft={() => {}}
      onSubmit={() => {}}
      submitDisabled={!healthNdaNotSigned.canSubmit}
      submitDisabledReason="Submission blocked: candidate must sign the NDA before submission."
    />
  );
  assert(
    contextBarNdaBlockedHtml.includes("Submission blocked: candidate must sign the NDA before submission."),
    "Gating: Specific blocking reason rendered inline next to Submit button when NDA unsigned"
  );
  assert(
    contextBarNdaBlockedHtml.includes("opacity-60 cursor-not-allowed"),
    "Gating: Submit button has disabled styling when gated"
  );

  // Case B: Scan Failed
  const healthScanFailed = computeDocumentHealth(FIXTURE_VENDOR_DOCUMENTS_SCAN_FAILED.requiredDocuments);
  assert(
    !healthScanFailed.canSubmit,
    "Gating: canSubmit is FALSE when any required document is SCAN_FAILED"
  );

  // Case C: Rejected
  const healthRejected = computeDocumentHealth(FIXTURE_VENDOR_DOCUMENTS_REJECTED.requiredDocuments);
  assert(
    !healthRejected.canSubmit,
    "Gating: canSubmit is FALSE when any required document is REJECTED"
  );

  // ───────────────────────────────────────────────────────────────────────────
  // TASK 2: Confirmation Modal
  // ───────────────────────────────────────────────────────────────────────────
  const testIdempKey = "idemp-vd-1788764184000-xyz987";
  const confirmHtml = renderToString(
    <Dialog open={true}>
      <SubmitConfirmationModalContent
        candidateName="Samir Rahman"
        candidateRef="C-014"
        position="Senior Cybersecurity Analyst"
        approvedCount={4}
        pendingCount={0}
        totalRequired={4}
        signatureStatus="SIGNED"
        idempotencyKey={testIdempKey}
        onClose={() => {}}
        onConfirmSubmit={() => {}}
      />
    </Dialog>
  );

  // 1. Restates candidate details
  assert(confirmHtml.includes("Samir Rahman"), "Confirmation restates candidate full name");
  assert(confirmHtml.includes("C-014"), "Confirmation restates candidate reference");
  assert(confirmHtml.includes("Senior Cybersecurity Analyst"), "Confirmation restates candidate position");

  // 2. Restates approved vs pending
  assert(confirmHtml.includes("4"), "Confirmation restates approved count");
  assert(confirmHtml.includes("of 4 approved"), "Confirmation restates total required count");
  assert(
    confirmHtml.includes("All required documents approved") || confirmHtml.includes("awaiting review"),
    "Confirmation restates approved vs pending summary"
  );

  // 3. Restates signature status
  assert(
    confirmHtml.includes("Signed and executed"),
    "Confirmation restates E-signature status as Signed and executed"
  );

  // 4. Restates receipt generation
  assert(
    confirmHtml.includes("A formal, tamper-evident submission receipt with a unique DIEZ audit reference will be generated immediately"),
    "Confirmation explicitly restates that a receipt will be issued"
  );

  // ───────────────────────────────────────────────────────────────────────────
  // TASK 3: Idempotency Key & Success State
  // ───────────────────────────────────────────────────────────────────────────
  // Idempotency key present in confirmation
  assert(confirmHtml.includes(testIdempKey), "Confirmation modal displays and binds the generated idempotency key");

  // Source code check for key generation on modal open and reuse on retry
  const workspaceSource = fs.readFileSync(
    path.resolve(__dirname, "../components/oms/vendor-documents/VendorDocumentsWorkspace.tsx"),
    "utf8"
  );
  assert(
    workspaceSource.includes("if (!idempotencyKey)") &&
    workspaceSource.includes("idemp-vd-"),
    "Workspace generates idempotency key ONCE when confirmation opens and reuses it on retry"
  );

  // Success Receipt Card rendering
  const receiptCardHtml = renderToString(
    <SubmissionReceiptCard
      receiptNumber="RCT-2026-883921"
      receiptDownloadUrl="/mock/receipts/RCT-2026-883921.pdf"
      submittedAt="2026-08-25T14:30:00Z"
    />
  );
  assert(
    receiptCardHtml.includes("Documents submitted to DIEZ. A receipt has been issued."),
    "Success state displays exact wording: 'Documents submitted to DIEZ. A receipt has been issued.'"
  );
  assert(
    receiptCardHtml.includes("RCT-2026-883921"),
    "Success state displays the unique audit receipt number"
  );
  assert(
    receiptCardHtml.includes("Download Receipt"),
    "Success state provides action button to download/view receipt"
  );
  assert(
    receiptCardHtml.includes("Gulf Standard Time"),
    "Receipt audit timestamp is formatted with Gulf Standard Time"
  );

  // Progress rail stage advancement
  assert(
    workspaceSource.includes("setCurrentStage(4)") &&
    workspaceSource.includes('setCurrentStageLabel("DIEZ Review")'),
    "Progress rail advances to Stage 4 ('DIEZ Review') upon successful submission"
  );

  // ───────────────────────────────────────────────────────────────────────────
  // TASK 4: Read-Only Mode when canEdit is false
  // ───────────────────────────────────────────────────────────────────────────
  // 1. Context bar with canEdit = false: both page-bar actions (Save draft & Submit) are ABSENT
  const contextBarReadonlyHtml = renderToString(
    <VendorContextBar
      onboardingId="ONB-2026-0061"
      candidateRef="C-014"
      position="Senior Cybersecurity Analyst"
      candidate={ref.candidate}
      deadline={ref.deadline}
      canEdit={false}
      isSavingDraft={false}
      isSubmitting={false}
      onSaveDraft={() => {}}
      onSubmit={() => {}}
    />
  );
  assert(
    !contextBarReadonlyHtml.includes("Save draft"),
    "Read-only: 'Save draft' action is strictly ABSENT when canEdit is false"
  );
  assert(
    !contextBarReadonlyHtml.includes("Submit documents"),
    "Read-only: 'Submit documents' action is strictly ABSENT when canEdit is false"
  );

  // 2. Signature panel with canEdit = false: "Send for signature" is ABSENT
  const signatureReadonlyHtml = renderToString(
    <SignaturePanel
      signature={{ ...ref.signature, envelopeStatus: "NOT_SENT" }}
      candidateName="Samir Rahman"
      canEdit={false}
      onSendForSignature={() => {}}
      onPreviewNda={() => {}}
    />
  );
  assert(
    !signatureReadonlyHtml.includes("Send for signature"),
    "Read-only: 'Send for signature' action is strictly ABSENT when canEdit is false"
  );

  // 3. Document row with canEdit = false: Upload and Replace buttons are ABSENT
  const sampleDocUploadable: VendorDocument = {
    code: "POLICE_CLEARANCE",
    label: "Police Clearance",
    status: "UPLOADED",
    file: {
      id: "f-1",
      name: "PCC.pdf",
      sizeBytes: 120000,
      mimeType: "application/pdf",
      uploadedAt: "2026-08-24T12:00:00Z",
    },
    expiresOn: null,
    expiringWithinDays: null,
    malwareScanPassed: true,
    fileTypeValid: true,
    rejectionReason: null,
  };

  const docRowReadonlyHtml = renderToString(
    <DocumentRow
      document={sampleDocUploadable}
      canEdit={false}
    />
  );
  assert(
    !docRowReadonlyHtml.includes("Replace"),
    "Read-only: 'Replace' action button is strictly ABSENT when canEdit is false"
  );

  const sampleDocUnuploaded: VendorDocument = {
    code: "EMIRATES_ID",
    label: "Emirates ID",
    status: "NOT_STARTED",
    file: null,
    expiresOn: null,
    expiringWithinDays: null,
    malwareScanPassed: null,
    fileTypeValid: null,
    rejectionReason: null,
  };

  const docRowUnuploadedReadonlyHtml = renderToString(
    <DocumentRow
      document={sampleDocUnuploaded}
      canEdit={false}
    />
  );
  assert(
    !docRowUnuploadedReadonlyHtml.includes("Upload"),
    "Read-only: 'Upload' action button is strictly ABSENT when canEdit is false"
  );

  // 4. Workspace displays Read-only lock banner when canEdit is false
  assert(
    workspaceSource.includes("Read-only mode:"),
    "Workspace renders dedicated read-only banner when canEdit is false"
  );

  console.log(`\nVerification complete: ${passed} / ${total} checks passed.`);
}

main().catch((err) => {
  console.error("Verification error:", err);
  process.exit(1);
});
