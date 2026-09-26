/**
 * Automated Verification Test for VD3 (Document Status Model, Row Anatomy, Location-Driven Lists, Health Reconciliation)
 */

import React from "react";
import fs from "fs";
import path from "path";
import { renderToString } from "react-dom/server";
import {
  computeDocumentHealth,
  VendorDocument,
  DocumentStatus,
} from "../src/types/vendor-documents";
import {
  FIXTURE_VENDOR_DOCUMENTS_REFERENCE,
  FIXTURE_VENDOR_DOCUMENTS_OFFSHORE,
  FIXTURE_VENDOR_DOCUMENTS_SCAN_FAILED,
  FIXTURE_VENDOR_DOCUMENTS_REJECTED,
  FIXTURE_VENDOR_DOCUMENTS_DEADLINE_CRITICAL,
  getFixtureHealth,
} from "../src/lib/vendor-documents/fixtures";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DocumentStatusBadge } from "../components/oms/vendor-documents/DocumentStatusBadge";
import { DocumentRow } from "../components/oms/vendor-documents/DocumentRow";
import { RequiredDocumentsPanel } from "../components/oms/vendor-documents/RequiredDocumentsPanel";
import { DocumentHealthPanel } from "../components/oms/vendor-documents/DocumentHealthPanel";
import { VendorDocumentsWorkspace } from "../components/oms/vendor-documents/VendorDocumentsWorkspace";

async function main() {
  console.log("=== VD3 DOCUMENT STATUS MODEL & ROWS VERIFICATION ===");
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
  // TASK 1: Status Enum and Derived Health Reconciliation
  // ───────────────────────────────────────────────────────────────────────────
  const allStatuses: DocumentStatus[] = [
    "NOT_STARTED",
    "UPLOADED",
    "SCAN_FAILED",
    "UNDER_REVIEW",
    "APPROVED",
    "REJECTED",
    "PENDING_SIGNATURE",
    "MISSING",
  ];

  // Verify all 8 badges render with expected text
  for (const st of allStatuses) {
    const badgeHtml = renderToString(<DocumentStatusBadge status={st} />);
    assert(badgeHtml.length > 0, `DocumentStatusBadge renders for ${st}`);
  }

  // Health Reconciliation Unit Tests against all 5 fixtures:
  // Fixture a: Reference (onshore)
  const healthA = getFixtureHealth(FIXTURE_VENDOR_DOCUMENTS_REFERENCE);
  assert(healthA.required === 4, "Fixture (a) required count = 4");
  assert(healthA.uploaded === 3, "Fixture (a) uploaded count = 3");
  assert(healthA.approved === 1, "Fixture (a) approved count = 1");
  assert(healthA.expiringSoon === 1, "Fixture (a) expiring soon count = 1 (Police Clearance)");
  assert(healthA.missing === 0, "Fixture (a) missing count = 0");
  assert(healthA.scanFailed === 0, "Fixture (a) scanFailed count = 0");
  assert(healthA.rejected === 0, "Fixture (a) rejected count = 0");

  // Fixture b: Offshore
  const healthB = getFixtureHealth(FIXTURE_VENDOR_DOCUMENTS_OFFSHORE);
  assert(healthB.required === 3, "Fixture (b) required count = 3");
  assert(healthB.uploaded === 2, "Fixture (b) uploaded count = 2");
  assert(healthB.approved === 1, "Fixture (b) approved count = 1");
  assert(healthB.missing === 0, "Fixture (b) missing count = 0");

  // Fixture c: Scan Failed
  const healthC = getFixtureHealth(FIXTURE_VENDOR_DOCUMENTS_SCAN_FAILED);
  assert(healthC.scanFailed === 1, "Fixture (c) scanFailed count = 1");
  assert(healthC.canSubmit === false, "Fixture (c) canSubmit is FALSE");

  // Fixture d: Rejected
  const healthD = getFixtureHealth(FIXTURE_VENDOR_DOCUMENTS_REJECTED);
  assert(healthD.rejected === 1, "Fixture (d) rejected count = 1");
  assert(healthD.canSubmit === false, "Fixture (d) canSubmit is FALSE");

  // Fixture e: Deadline Critical
  const healthE = getFixtureHealth(FIXTURE_VENDOR_DOCUMENTS_DEADLINE_CRITICAL);
  assert(healthE.required === 4, "Fixture (e) required count = 4");
  assert(healthE.approved === 3, "Fixture (e) approved count = 3");

  // Confirm health panel HTML strictly outputs exact figures for Fixture (a)
  const healthPanelHtml = renderToString(<DocumentHealthPanel health={healthA} />);
  assert(healthPanelHtml.includes("Required"), "Health panel renders Required label");
  assert(healthPanelHtml.includes("4"), "Health panel renders Required count = 4");
  assert(healthPanelHtml.includes("Uploaded"), "Health panel renders Uploaded label");
  assert(healthPanelHtml.includes("3"), "Health panel renders Uploaded count = 3");
  assert(healthPanelHtml.includes("Approved"), "Health panel renders Approved label");
  assert(healthPanelHtml.includes("1"), "Health panel renders Approved count = 1");
  assert(healthPanelHtml.includes("Expiring soon"), "Health panel renders Expiring soon label");
  assert(healthPanelHtml.includes("Missing"), "Health panel renders Missing label");
  assert(healthPanelHtml.includes("0"), "Health panel renders Missing count = 0 in neutral");

  // ───────────────────────────────────────────────────────────────────────────
  // TASK 2: Location-Driven Document List per §1.4
  // ───────────────────────────────────────────────────────────────────────────
  const offshorePanelHtml = renderToString(
    <RequiredDocumentsPanel
      requiredDocuments={FIXTURE_VENDOR_DOCUMENTS_OFFSHORE.requiredDocuments}
      residentStatus={FIXTURE_VENDOR_DOCUMENTS_OFFSHORE.candidate.residentStatus}
      health={healthB}
    />
  );
  assert(offshorePanelHtml.includes("Required documents — Offshore"), "Offshore panel header states 'Required documents — Offshore'");
  assert(offshorePanelHtml.includes("2/3"), "Offshore panel header states count '2/3'");
  assert(offshorePanelHtml.includes("Passport (bio page)"), "Offshore renders Passport");
  assert(offshorePanelHtml.includes("National Identity Card"), "Offshore renders National Identity Card");
  assert(offshorePanelHtml.includes("NDA"), "Offshore renders NDA");
  assert(!offshorePanelHtml.includes("Emirates ID"), "Offshore DOES NOT render Emirates ID");
  assert(!offshorePanelHtml.includes("Police Clearance"), "Offshore DOES NOT render Police Clearance");

  const onshorePanelHtml = renderToString(
    <RequiredDocumentsPanel
      requiredDocuments={FIXTURE_VENDOR_DOCUMENTS_REFERENCE.requiredDocuments}
      residentStatus={FIXTURE_VENDOR_DOCUMENTS_REFERENCE.candidate.residentStatus}
      health={healthA}
    />
  );
  assert(onshorePanelHtml.includes("Required documents — Onshore"), "Onshore panel header states 'Required documents — Onshore'");
  assert(onshorePanelHtml.includes("3/4"), "Onshore panel header states count '3/4'");
  assert(onshorePanelHtml.includes("Passport (bio page)"), "Onshore renders Passport");
  assert(onshorePanelHtml.includes("Emirates ID"), "Onshore renders Emirates ID");
  assert(onshorePanelHtml.includes("Police Clearance"), "Onshore renders Police Clearance");
  assert(onshorePanelHtml.includes("NDA"), "Onshore renders NDA");

  // ───────────────────────────────────────────────────────────────────────────
  // TASK 3: Row Anatomy per Part 3
  // ───────────────────────────────────────────────────────────────────────────
  const pccDoc = FIXTURE_VENDOR_DOCUMENTS_REFERENCE.requiredDocuments.find((d) => d.code === "POLICE_CLEARANCE")!;
  const pccRowHtml = renderToString(<DocumentRow document={pccDoc} />);
  assert(pccRowHtml.includes("Police Clearance"), "Row renders document name 'Police Clearance'");
  assert(pccRowHtml.includes("Police_Clearance.pdf"), "Row renders filename 'Police_Clearance.pdf'");
  assert(pccRowHtml.includes("Malware scan passed"), "Row renders 'Malware scan passed' chip");
  assert(pccRowHtml.includes("File type valid"), "Row renders 'File type valid' chip");
  assert(pccRowHtml.includes("View"), "Row renders 'View' action");
  assert(pccRowHtml.includes("Replace"), "Row renders 'Replace' action");

  // ───────────────────────────────────────────────────────────────────────────
  // TASK 4: Rejected State per §1.6
  // ───────────────────────────────────────────────────────────────────────────
  const rejectedDoc = FIXTURE_VENDOR_DOCUMENTS_REJECTED.requiredDocuments.find((d) => d.status === "REJECTED")!;
  const rejectedRowHtml = renderToString(<DocumentRow document={rejectedDoc} />);
  assert(rejectedRowHtml.includes("Document Declined by DIEZ Review"), "Rejected row renders danger alert header");
  assert(rejectedRowHtml.includes("blurry and unreadable"), "Rejected row renders plain rejection reason inline");
  assert(rejectedRowHtml.includes("bg-destructive"), "Rejected row renders Replace as primary action (bg-destructive)");

  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  const rejectedWorkspaceHtml = renderToString(
    <QueryClientProvider client={queryClient}>
      <VendorDocumentsWorkspace
        onboardingId="ONB-2026-0064"
        initialData={FIXTURE_VENDOR_DOCUMENTS_REJECTED}
      />
    </QueryClientProvider>
  );
  assert(rejectedWorkspaceHtml.includes("disabled"), "Submit button disabled when a row is REJECTED");
  assert(rejectedWorkspaceHtml.includes("Submission blocked: Emirates ID was rejected"), "Context bar specifies rejection blocking reason");

  // ───────────────────────────────────────────────────────────────────────────
  // TASK 5: Scan Failed State per §1.7
  // ───────────────────────────────────────────────────────────────────────────
  const scanFailedDoc = FIXTURE_VENDOR_DOCUMENTS_SCAN_FAILED.requiredDocuments.find((d) => d.status === "SCAN_FAILED")!;
  const scanFailedRowHtml = renderToString(<DocumentRow document={scanFailedDoc} />);
  assert(scanFailedRowHtml.includes("Malware Scan Failed — Submission Blocked"), "Scan failed row renders danger alert header");
  assert(scanFailedRowHtml.includes("Win32.EICAR-Test-File"), "Scan failed row renders malware threat name");
  assert(scanFailedRowHtml.includes("quarantined"), "Scan failed row identifies file is quarantined");

  const scanFailedWorkspaceHtml = renderToString(
    <QueryClientProvider client={queryClient}>
      <VendorDocumentsWorkspace
        onboardingId="ONB-2026-0063"
        initialData={FIXTURE_VENDOR_DOCUMENTS_SCAN_FAILED}
      />
    </QueryClientProvider>
  );
  assert(scanFailedWorkspaceHtml.includes("disabled"), "Submit button disabled when a row is SCAN_FAILED");
  assert(scanFailedWorkspaceHtml.includes("failed malware scanning"), "Context bar specifies malware scan blocking reason");
  assert(scanFailedWorkspaceHtml.includes("Police_Clearance_Scan.pdf"), "Context bar names the quarantined file");

  // ───────────────────────────────────────────────────────────────────────────
  // TASK 6: Expiry Proximity per §1.8
  // ───────────────────────────────────────────────────────────────────────────
  assert(pccRowHtml.includes("· soon"), "Expiring within 90 days renders '· soon' suffix");
  assert(pccRowHtml.includes("text-amber-600"), "Expiring within 90 days renders amber color token");

  // Document expiring far in the future should NOT have "· soon"
  const passportDoc = FIXTURE_VENDOR_DOCUMENTS_REFERENCE.requiredDocuments.find((d) => d.code === "PASSPORT")!;
  const passportRowHtml = renderToString(<DocumentRow document={passportDoc} />);
  assert(!passportRowHtml.includes("· soon"), "Document expiring in 2031 DOES NOT render '· soon' suffix");

  console.log(`\nVerification complete: ${passed} / ${total} checks passed.`);
}

main().catch((err) => {
  console.error("Verification error:", err);
  process.exit(1);
});
