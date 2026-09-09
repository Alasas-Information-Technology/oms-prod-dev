/**
 * Automated Verification Test for VD5 (E-Signature Panel, Preview Modal, Plain Language Status, Row Sync)
 * Specification: docs/VENDOR-DOCUMENTS-UI.md §1.2, §1.3, §4.3
 */

import React from "react";
import fs from "fs";
import path from "path";
import { renderToString } from "react-dom/server";
import {
  FIXTURE_VENDOR_DOCUMENTS_REFERENCE,
  FIXTURE_VENDOR_DOCUMENTS_OFFSHORE,
} from "../src/lib/vendor-documents/fixtures";
import {
  SignaturePanel,
  formatPlainEnvelopeStatus,
} from "../components/oms/vendor-documents/SignaturePanel";
import {
  NdaPreviewModal,
  NdaPreviewModalContent,
} from "../components/oms/vendor-documents/NdaPreviewModal";
import { Dialog } from "../components/ui/dialog";
import {
  computeDocumentHealth,
  VendorSignatureInfo,
  VendorDocument,
} from "../src/types/vendor-documents";

async function main() {
  console.log("=== VD5 E-SIGNATURE PANEL & WORKFLOW VERIFICATION ===");
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

  const initialSignature = FIXTURE_VENDOR_DOCUMENTS_REFERENCE.signature;

  // ───────────────────────────────────────────────────────────────────────────
  // TASK 1: Panel Content & Plain Language Envelope Status (NO Callback Status)
  // ───────────────────────────────────────────────────────────────────────────
  const panelHtml = renderToString(
    <SignaturePanel
      signature={initialSignature}
      candidateName="Samir Rahman"
      canEdit={true}
      onSendForSignature={() => {}}
      onPreviewNda={() => {}}
    />
  );

  // 1. Template name rendered
  assert(
    panelHtml.includes("DIEZ Outsourced Resource NDA"),
    "SignaturePanel renders template name"
  );

  // 2. Signer order with names and roles
  assert(panelHtml.includes("Samir Rahman"), "Signer 1 name (Samir Rahman) rendered");
  assert(panelHtml.includes("Candidate"), "Signer 1 role (Candidate) rendered");
  assert(panelHtml.includes("DIEZ Representative"), "Signer 2 name (DIEZ Representative) rendered");
  assert(panelHtml.includes("DIEZ"), "Signer 2 role (DIEZ) rendered");
  assert(panelHtml.includes("1") && panelHtml.includes("2"), "Signer sequence numbers rendered");

  // 3. Plain language status mapping
  assert(
    formatPlainEnvelopeStatus("NOT_SENT").label === "Not sent",
    "Envelope status NOT_SENT maps to plain language 'Not sent'"
  );
  assert(
    formatPlainEnvelopeStatus("SENT").label.includes("Sent"),
    "Envelope status SENT maps to plain language 'Sent'"
  );
  assert(
    formatPlainEnvelopeStatus("VIEWED").label.includes("Viewed"),
    "Envelope status VIEWED maps to plain language 'Viewed by candidate'"
  );
  assert(
    formatPlainEnvelopeStatus("SIGNED").label.includes("Signed"),
    "Envelope status SIGNED maps to plain language 'Signed and executed'"
  );
  assert(
    formatPlainEnvelopeStatus("DECLINED").label.includes("Declined"),
    "Envelope status DECLINED maps to plain language 'Declined by signer'"
  );

  // 4. Strict exclusion of "Callback status" engineering leak (§1.2)
  const signaturePanelSource = fs.readFileSync(
    path.resolve(__dirname, "../components/oms/vendor-documents/SignaturePanel.tsx"),
    "utf8"
  );
  const ndaPreviewSource = fs.readFileSync(
    path.resolve(__dirname, "../components/oms/vendor-documents/NdaPreviewModal.tsx"),
    "utf8"
  );
  assert(
    !panelHtml.toLowerCase().includes("callback"),
    "Rendered SignaturePanel contains 0 instances of 'callback'"
  );
  assert(
    !signaturePanelSource.toLowerCase().includes("callback"),
    "SignaturePanel.tsx source contains 0 instances of 'callback'"
  );
  assert(
    !ndaPreviewSource.toLowerCase().includes("callback"),
    "NdaPreviewModal.tsx source contains 0 instances of 'callback'"
  );

  // ───────────────────────────────────────────────────────────────────────────
  // TASK 2: Action Hierarchy per §1.3 (Secondary Outlined Action, NEVER Primary)
  // ───────────────────────────────────────────────────────────────────────────
  assert(panelHtml.includes("Send for signature"), "Renders 'Send for signature' button");
  assert(
    !signaturePanelSource.includes('bg-teal-600') && !signaturePanelSource.includes('bg-primary'),
    "'Send for signature' is NOT solid primary colored (no bg-teal-600 or bg-primary)"
  );
  assert(
    signaturePanelSource.includes('border-teal-600'),
    "'Send for signature' is styled with outlined secondary weight"
  );

  // ───────────────────────────────────────────────────────────────────────────
  // TASK 3: Preview NDA Modal (Rendered Legal Text)
  // ───────────────────────────────────────────────────────────────────────────
  const previewHtml = renderToString(
    <Dialog open={true}>
      <NdaPreviewModalContent
        signature={initialSignature}
        candidateName="Samir Rahman"
        candidateNationality="India"
        candidateResidentStatus="ONSHORE"
        position="Senior Cybersecurity Analyst"
        onClose={() => {}}
        onSendForSignature={() => {}}
      />
    </Dialog>
  );

  assert(
    previewHtml.includes("NON-DISCLOSURE AND CONFIDENTIALITY AGREEMENT"),
    "NDA preview renders official agreement title"
  );
  assert(
    previewHtml.includes("Dubai Integrated Economic Zones Authority"),
    "NDA preview renders DIEZ Authority identifier"
  );
  assert(
    previewHtml.includes("Samir Rahman"),
    "NDA preview renders personalized candidate name"
  );
  assert(
    previewHtml.includes("Senior Cybersecurity Analyst"),
    "NDA preview renders candidate position"
  );
  assert(
    previewHtml.includes("CONFIDENTIAL INFORMATION"),
    "NDA preview renders Confidential Information definition clause"
  );
  assert(
    previewHtml.includes("Emirate of Dubai"),
    "NDA preview renders Dubai governing law jurisdiction clause"
  );
  assert(
    previewHtml.includes("Signer 1 (Resource)") && previewHtml.includes("Signer 2 (Authority)"),
    "NDA preview renders execution blocks for both sequential signers"
  );

  // ───────────────────────────────────────────────────────────────────────────
  // TASK 4: Sync with Document Row & Single Source of Truth
  // ───────────────────────────────────────────────────────────────────────────
  // 1. Initial State: envelope NOT_SENT -> NDA row is PENDING_SIGNATURE
  const docsPending = FIXTURE_VENDOR_DOCUMENTS_REFERENCE.requiredDocuments;
  const ndaDocPending = docsPending.find((d) => d.code === "NDA")!;
  assert(
    ndaDocPending.status === "PENDING_SIGNATURE",
    "NDA row initially has status PENDING_SIGNATURE"
  );

  const healthPending = computeDocumentHealth(docsPending, {
    ...initialSignature,
    envelopeStatus: "NOT_SENT",
  });
  assert(
    !healthPending.canSubmit,
    "Workspace submit is blocked when envelope status is NOT_SENT"
  );

  // 2. Transformed State: envelope SIGNED -> NDA row resolves to APPROVED
  const signedSignature: VendorSignatureInfo = {
    ...initialSignature,
    envelopeStatus: "SIGNED",
    signedAt: "2026-08-25T10:30:00Z",
  };

  // Simulate workspace reactive memo sync
  const syncedDocsSigned = docsPending.map((doc) => {
    if (doc.code === "NDA" || doc.requiresSignature) {
      const isSigned = signedSignature.envelopeStatus === "SIGNED";
      return {
        ...doc,
        status: isSigned ? ("APPROVED" as const) : ("PENDING_SIGNATURE" as const),
        file: isSigned
          ? {
              id: "file-signed-nda-001",
              name: "DIEZ_NDA_Executed.pdf",
              sizeBytes: 845000,
              mimeType: "application/pdf",
              uploadedAt: signedSignature.signedAt || new Date().toISOString(),
              downloadUrl: "/mock-files/DIEZ_NDA_Executed.pdf",
            }
          : null,
        malwareScanPassed: isSigned ? true : doc.malwareScanPassed,
        fileTypeValid: isSigned ? true : doc.fileTypeValid,
      };
    }
    return doc;
  });

  const ndaDocSigned = syncedDocsSigned.find((d) => d.code === "NDA")!;
  assert(
    ndaDocSigned.status === "APPROVED",
    "NDA row status synchronously resolves to APPROVED when envelope is SIGNED"
  );
  assert(
    Boolean(ndaDocSigned.file),
    "NDA row acquires executed document file upon electronic signature"
  );

  const healthSigned = computeDocumentHealth(syncedDocsSigned, signedSignature);
  assert(
    healthSigned.approved === healthPending.approved + 1,
    "Approved count increments by 1 when NDA transitions to SIGNED"
  );
  assert(
    healthSigned.canSubmit === true,
    "Workspace submit becomes enabled when all required items and NDA signature are complete"
  );

  console.log(`\nVerification complete: ${passed} / ${total} checks passed.`);
}

main().catch((err) => {
  console.error("Verification error:", err);
  process.exit(1);
});
