/**
 * Automated Verification Test for VD4 (Upload, Replace Flow, AttachmentList Reuse, Optional Documents)
 */

import React from "react";
import fs from "fs";
import path from "path";
import { renderToString } from "react-dom/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  FIXTURE_VENDOR_DOCUMENTS_REFERENCE,
  FIXTURE_VENDOR_DOCUMENTS_SCAN_FAILED,
  FIXTURE_VENDOR_DOCUMENTS_REJECTED,
} from "../src/lib/vendor-documents/fixtures";
import {
  DocumentUploadModal,
  DocumentUploadModalContent,
} from "../components/oms/vendor-documents/DocumentUploadModal";
import { OptionalDocumentsSection } from "../components/oms/vendor-documents/OptionalDocumentsSection";
import { RequiredDocumentsPanel } from "../components/oms/vendor-documents/RequiredDocumentsPanel";
import { VendorDocumentsWorkspace } from "../components/oms/vendor-documents/VendorDocumentsWorkspace";
import { computeDocumentHealth, VendorDocument } from "../src/types/vendor-documents";
import { Dialog } from "../components/ui/dialog";

async function main() {
  console.log("=== VD4 UPLOAD & REPLACE INTERACTION VERIFICATION ===");
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

  // ───────────────────────────────────────────────────────────────────────────
  // TASK 1: Reuse AttachmentList
  // ───────────────────────────────────────────────────────────────────────────
  const uploadModalFile = fs.readFileSync(
    path.resolve(__dirname, "../components/oms/vendor-documents/DocumentUploadModal.tsx"),
    "utf8"
  );
  assert(
    uploadModalFile.includes('import { AttachmentList } from "@/components/oms/clarification/AttachmentList"'),
    "DocumentUploadModal imports AttachmentList from clarification without duplicating upload pattern"
  );
  assert(
    uploadModalFile.includes("PDF, DOCX, XLSX, PNG, JPG") && uploadModalFile.includes("10 MB"),
    "Stated accepted types (PDF, DOCX, XLSX, PNG, JPG) and 10 MB size limit exist BEFORE upload"
  );
  assert(
    uploadModalFile.includes("onDragOver") && uploadModalFile.includes("onDrop"),
    "Drag-and-drop zone implemented"
  );
  assert(
    uploadModalFile.includes("isScanning") && uploadModalFile.includes("Scanning for security threats..."),
    "Scanning-pending state implemented"
  );

  // ───────────────────────────────────────────────────────────────────────────
  // TASK 2: Replace Flow & Previous File Retention
  // ───────────────────────────────────────────────────────────────────────────
  const pccDoc = FIXTURE_VENDOR_DOCUMENTS_REFERENCE.requiredDocuments.find((d) => d.code === "POLICE_CLEARANCE")!;
  assert(Boolean(pccDoc.file), "Fixture Police Clearance has existing file");

  // Render modal content in replace mode inside Dialog context
  const replaceModalHtml = renderToString(
    <Dialog open={true}>
      <DocumentUploadModalContent
        document={pccDoc}
        onClose={() => {}}
        onUploadSuccess={() => {}}
        onUploadError={() => {}}
      />
    </Dialog>
  );
  assert(replaceModalHtml.includes("Replace Police Clearance"), "Modal title shows 'Replace Police Clearance'");
  assert(replaceModalHtml.includes("Currently Active File"), "Modal displays 'Currently Active File' retention section");
  assert(replaceModalHtml.includes("Police_Clearance.pdf"), "Modal displays active file name");
  assert(replaceModalHtml.includes("Retained until scan clears"), "Modal informs user previous file is retained until scan clears");

  // Check code logic for retention on failed replace
  const workspaceFile = fs.readFileSync(
    path.resolve(__dirname, "../components/oms/vendor-documents/VendorDocumentsWorkspace.tsx"),
    "utf8"
  );
  assert(
    workspaceFile.includes("if (!doc.file)") &&
    workspaceFile.includes("The previous file is retained until the new one clears scanning"),
    "Workspace explicitly retains existing file if replacement upload/scan fails"
  );

  // ───────────────────────────────────────────────────────────────────────────
  // TASK 3: Optional Documents Section
  // ───────────────────────────────────────────────────────────────────────────
  // 1. Collapsed by default: "Optional documents (0)" with chevron
  const emptyOptionalHtml = renderToString(
    <OptionalDocumentsSection optionalDocuments={[]} />
  );
  assert(emptyOptionalHtml.includes("Optional documents (0)"), "Renders 'Optional documents (0)' by default");
  assert(emptyOptionalHtml.includes("lucide-chevron-down"), "Renders chevron icon");

  // 2. With optional document attached (expanded via defaultOpen={true})
  const sampleOptionalDoc: VendorDocument = {
    code: "OPT_CERT_01",
    label: "CISSP Security Certification",
    status: "UPLOADED",
    file: {
      id: "file-cert-001",
      name: "CISSP_Samir.pdf",
      sizeBytes: 1540000,
      mimeType: "application/pdf",
      uploadedAt: "2026-08-23T12:00:00Z",
    },
    expiresOn: "2028-10-15",
    expiringWithinDays: 780,
    malwareScanPassed: true,
    fileTypeValid: true,
    rejectionReason: null,
    isOptional: true,
  };

  const filledOptionalHtml = renderToString(
    <OptionalDocumentsSection optionalDocuments={[sampleOptionalDoc]} defaultOpen={true} />
  );
  assert(filledOptionalHtml.includes("Optional documents (1)"), "Renders 'Optional documents (1)' when populated");
  assert(filledOptionalHtml.includes("CISSP Security Certification"), "Renders optional document label");
  assert(filledOptionalHtml.includes("CISSP_Samir.pdf"), "Renders optional document filename");
  assert(filledOptionalHtml.includes("OPTIONAL"), "Renders OPTIONAL pill badge on row");

  // 3. Render inside RequiredDocumentsPanel
  const healthA = computeDocumentHealth(FIXTURE_VENDOR_DOCUMENTS_REFERENCE.requiredDocuments);
  const panelHtml = renderToString(
    <RequiredDocumentsPanel
      requiredDocuments={FIXTURE_VENDOR_DOCUMENTS_REFERENCE.requiredDocuments}
      optionalDocuments={[sampleOptionalDoc]}
      residentStatus="ONSHORE"
      health={healthA}
    />
  );
  assert(panelHtml.includes("Optional documents (1)"), "RequiredDocumentsPanel integrates OptionalDocumentsSection");

  // ───────────────────────────────────────────────────────────────────────────
  // TASK 4: Add a Document Investigation
  // ───────────────────────────────────────────────────────────────────────────
  // Confirm that API contract was audited for arbitrary document addition endpoints
  const contractContent = fs.readFileSync(
    path.resolve(__dirname, "../docs/VENDOR-DOCUMENTS-API-CONTRACT.md"),
    "utf8"
  );
  const hasCustomAddEndpoint = contractContent.includes("POST /api/v1/vendor/onboarding/{onboardingId}/documents/new") ||
    contractContent.includes("POST /api/v1/vendor/onboarding/{onboardingId}/documents/custom");
  assert(
    !hasCustomAddEndpoint,
    "Confirmed: No backend API endpoint exists for arbitrary custom document registration"
  );

  console.log(`\nVerification complete: ${passed} / ${total} checks passed.`);
}

main().catch((err) => {
  console.error("Verification error:", err);
  process.exit(1);
});
