/**
 * Automated Verification Script for VD1 (Contracts, Types, Fixtures, API Hooks)
 */

import {
  computeDocumentHealth,
  isExpiringSoon,
  EXPIRY_SOON_THRESHOLD_DAYS,
} from "../src/types/vendor-documents";
import {
  FIXTURE_VENDOR_DOCUMENTS_REFERENCE,
  FIXTURE_VENDOR_DOCUMENTS_OFFSHORE,
  FIXTURE_VENDOR_DOCUMENTS_SCAN_FAILED,
  FIXTURE_VENDOR_DOCUMENTS_REJECTED,
  FIXTURE_VENDOR_DOCUMENTS_DEADLINE_CRITICAL,
  getFixtureHealth,
} from "../src/lib/vendor-documents/fixtures";
import { vendorDocumentsApi } from "../src/lib/vendor-documents/api";
import fs from "fs";
import path from "path";

async function main() {
  console.log("=== VD1 CONTRACTS & FIXTURES VERIFICATION ===");
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

  // 1. Reference fixture health reconciliation
  const refHealth = getFixtureHealth(FIXTURE_VENDOR_DOCUMENTS_REFERENCE);
  console.log("Reference health counts:", refHealth);
  assert(refHealth.required === 4, "Fixture (a) required count is exactly 4");
  assert(refHealth.uploaded === 3, "Fixture (a) uploaded count is exactly 3");
  assert(refHealth.approved === 1, "Fixture (a) approved count is exactly 1");
  assert(refHealth.expiringSoon === 1, "Fixture (a) expiring soon count is exactly 1 (Police Clearance)");
  assert(refHealth.missing === 0, "Fixture (a) missing count is exactly 0");
  assert(refHealth.canSubmit === false, "Fixture (a) cannot submit because NDA is pending signature");

  // 2. Offshore candidate fixture (b)
  const offshoreHealth = getFixtureHealth(FIXTURE_VENDOR_DOCUMENTS_OFFSHORE);
  console.log("Offshore health counts:", offshoreHealth);
  const offshoreCodes = FIXTURE_VENDOR_DOCUMENTS_OFFSHORE.requiredDocuments.map((d) => d.code);
  assert(offshoreCodes.length === 3, "Fixture (b) has exactly 3 required documents");
  assert(offshoreCodes.includes("PASSPORT"), "Fixture (b) includes PASSPORT");
  assert(offshoreCodes.includes("NATIONAL_ID"), "Fixture (b) includes NATIONAL_ID");
  assert(offshoreCodes.includes("NDA"), "Fixture (b) includes NDA");
  assert(!offshoreCodes.includes("EMIRATES_ID"), "Fixture (b) DOES NOT include EMIRATES_ID");
  assert(!offshoreCodes.includes("POLICE_CLEARANCE"), "Fixture (b) DOES NOT include POLICE_CLEARANCE");
  assert(offshoreHealth.required === 3, "Fixture (b) required count is exactly 3");
  assert(offshoreHealth.uploaded === 2, "Fixture (b) uploaded count is exactly 2");

  // 3. Scan Failed fixture (c)
  const scanFailedHealth = getFixtureHealth(FIXTURE_VENDOR_DOCUMENTS_SCAN_FAILED);
  console.log("Scan failed health counts:", scanFailedHealth);
  assert(scanFailedHealth.scanFailed === 1, "Fixture (c) scanFailed count is 1");
  assert(scanFailedHealth.canSubmit === false, "Fixture (c) blocks submission due to scan failure");
  const failedDoc = FIXTURE_VENDOR_DOCUMENTS_SCAN_FAILED.requiredDocuments.find((d) => d.status === "SCAN_FAILED");
  assert(Boolean(failedDoc && failedDoc.rejectionReason?.includes("Malware")), "Fixture (c) has malware reason");

  // 4. Rejected fixture (d)
  const rejectedHealth = getFixtureHealth(FIXTURE_VENDOR_DOCUMENTS_REJECTED);
  console.log("Rejected health counts:", rejectedHealth);
  assert(rejectedHealth.rejected === 1, "Fixture (d) rejected count is 1");
  assert(rejectedHealth.canSubmit === false, "Fixture (d) blocks submission due to unreplaced rejection");
  const rejectedDoc = FIXTURE_VENDOR_DOCUMENTS_REJECTED.requiredDocuments.find((d) => d.status === "REJECTED");
  assert(Boolean(rejectedDoc && rejectedDoc.rejectionReason?.includes("blurry")), "Fixture (d) has rejection reason");

  // 5. Deadline Critical fixture (e)
  assert(FIXTURE_VENDOR_DOCUMENTS_DEADLINE_CRITICAL.deadline.daysRemaining === 2, "Fixture (e) has 2 days remaining");
  assert(FIXTURE_VENDOR_DOCUMENTS_DEADLINE_CRITICAL.deadline.severity === "CRITICAL", "Fixture (e) has CRITICAL severity");

  // 6. Check TODO markers in api.ts
  const apiFile = fs.readFileSync(path.resolve(__dirname, "../src/lib/vendor-documents/api.ts"), "utf8");
  assert(apiFile.includes("// TODO(file-storage):"), "api.ts contains TODO(file-storage) marker");
  assert(apiFile.includes("// TODO(malware-scan):"), "api.ts contains TODO(malware-scan) marker");

  // 7. Check contract document exists and contains prominent requirements
  const contractFile = fs.readFileSync(path.resolve(__dirname, "../docs/VENDOR-DOCUMENTS-API-CONTRACT.md"), "utf8");
  assert(contractFile.includes("SERVER REQUIREMENT 1"), "Contract includes SERVER REQUIREMENT 1 prominently");
  assert(contractFile.includes("SERVER REQUIREMENT 2"), "Contract includes SERVER REQUIREMENT 2 prominently");
  assert(contractFile.includes("SERVER REQUIREMENT 3"), "Contract includes SERVER REQUIREMENT 3 prominently");
  assert(contractFile.includes("SERVER REQUIREMENT 4"), "Contract includes SERVER REQUIREMENT 4 prominently");
  assert(contractFile.includes("SERVER REQUIREMENT 5"), "Contract includes SERVER REQUIREMENT 5 prominently");
  assert(contractFile.includes("SERVER REQUIREMENT 6"), "Contract includes SERVER REQUIREMENT 6 prominently");

  // 8. Test API layer mock functions
  const docWorkspace = await vendorDocumentsApi.getDocuments("ONB-2026-0061");
  assert(docWorkspace.onboardingId === "ONB-2026-0061", "API getDocuments returns workspace");

  const sigRes = await vendorDocumentsApi.sendSignature("ONB-2026-0061");
  assert(sigRes.signature.envelopeStatus === "SENT", "API sendSignature returns envelope SENT");

  const draftRes = await vendorDocumentsApi.saveDraft("ONB-2026-0061", { optionalDocuments: [] });
  assert(draftRes.success === true, "API saveDraft succeeds");

  const submitRes = await vendorDocumentsApi.submitDocuments("ONB-2026-0061", { idempotencyKey: "test-key-123" });
  assert(submitRes.success === true && submitRes.receiptNumber.startsWith("RCT-"), "API submitDocuments returns receipt");

  console.log(`\nVerification complete: ${passed} / ${total} checks passed.`);
}

main().catch((err) => {
  console.error("Test error:", err);
  process.exit(1);
});
