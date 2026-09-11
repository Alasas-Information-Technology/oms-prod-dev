/**
 * Verification Script for VP5: Onboarding Index, Documents, Profile, Support
 * Specification: docs/VENDOR-PORTAL-UI.md Part 4.8, 4.9, 4.10, 4.11 & Part 7 VP5
 *
 * Tests:
 * 1. /vendor/onboarding: lists 0119 (onshore, C-030) and 0102 (offshore, C-031).
 *    Verifies document completion ("3 of 4" for 0119, "3 of 3" for 0102) computed from
 *    the SAME computeDocumentHealth function as the detail page.
 * 2. /vendor/documents: vendor's own compliance repository (trade licence, tax TRN, insurance, ISO).
 *    Confirms 90-day expiry threshold logic (trade licence expiring in 24 days flagged as WARNING).
 * 3. /vendor/profile: company details, primary contact, coordinator list governed by VENDORUSER.MANAGE.
 * 4. /vendor/support: message stream to Procurement with compose & attachment capabilities.
 */

import {
  listVendorOnboardingCases,
  getVendorComplianceDocuments,
  uploadOrReplaceVendorComplianceDocument,
  getVendorProfile,
  listVendorSupportMessages,
  sendVendorSupportMessage,
} from "../src/lib/demo-data";
import { computeDocumentHealth } from "../src/types/vendor-documents";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exit(1);
  }
  console.log(`✅ PASS: ${message}`);
}

console.log("\n====================================================================");
console.log("  RUNNING VP5 VERIFICATION: ONBOARDING, DOCUMENTS, PROFILE, SUPPORT");
console.log("====================================================================\n");

// --------------------------------------------------------------------------
// TEST 1: /vendor/onboarding Index & computeDocumentHealth Consistency
// --------------------------------------------------------------------------
console.log("--- TEST 1: Candidate Onboarding Cases & Derived Health ---");
const cases = listVendorOnboardingCases("ven-falcon");
assert(cases.length >= 2, `Expected at least 2 onboarding cases for Falcon Tech, got ${cases.length}`);

// Case 0119 (Onshore, C-030: Tariq Al Hammadi)
const case0119 = cases.find((c) => c.requisitionId === "OMS-2026-0119");
assert(!!case0119, "Seeded onboarding case for OMS-2026-0119 found");
assert(case0119?.candidateRef === "C-030", `Case 0119 candidate is C-030 (got ${case0119?.candidateRef})`);
assert(case0119?.residentStatus === "ONSHORE", `Case 0119 is ONSHORE (got ${case0119?.residentStatus})`);
assert(case0119?.candidate.fullName === "Tariq Al Hammadi", "Candidate name is Tariq Al Hammadi");

// Derived health check via computeDocumentHealth
const health0119 = computeDocumentHealth(case0119!.documents as any, case0119!.signature as any);
assert(
  health0119.required === 4,
  `Case 0119 required documents count is 4 (got ${health0119.required})`
);
assert(
  health0119.uploaded === 3,
  `Case 0119 uploaded documents count is 3 (got ${health0119.uploaded})`
);
const ratio0119 = `${health0119.uploaded} of ${health0119.required}`;
assert(
  ratio0119 === "3 of 4",
  `Case 0119 document completion renders strictly as "3 of 4" (got "${ratio0119}")`
);
assert(
  case0119!.signature.envelopeStatus === "SENT",
  `Case 0119 signature status is SENT (Pending Signature)`
);

// Case 0102 (Offshore, C-031: Priya Sharma)
const case0102 = cases.find((c) => c.requisitionId === "OMS-2026-0102");
assert(!!case0102, "Seeded onboarding case for OMS-2026-0102 found");
assert(case0102?.candidateRef === "C-031", `Case 0102 candidate is C-031 (got ${case0102?.candidateRef})`);
assert(case0102?.residentStatus === "OFFSHORE", `Case 0102 is OFFSHORE (got ${case0102?.residentStatus})`);
assert(case0102?.candidate.fullName === "Priya Sharma", "Candidate name is Priya Sharma");

const health0102 = computeDocumentHealth(case0102!.documents as any, case0102!.signature as any);
assert(
  health0102.required === 3,
  `Case 0102 required documents count is 3 (got ${health0102.required})`
);
assert(
  health0102.uploaded === 3,
  `Case 0102 uploaded documents count is 3 (got ${health0102.uploaded})`
);
const ratio0102 = `${health0102.uploaded} of ${health0102.required}`;
assert(
  ratio0102 === "3 of 3",
  `Case 0102 document completion renders strictly as "3 of 3" (got "${ratio0102}")`
);
assert(
  case0102!.signature.envelopeStatus === "SIGNED",
  `Case 0102 signature status is SIGNED`
);

// --------------------------------------------------------------------------
// TEST 2: /vendor/documents Vendor Compliance Repository & 90-Day Expiry
// --------------------------------------------------------------------------
console.log("\n--- TEST 2: Vendor Compliance Documents & 90-Day Expiry Threshold ---");
const complianceDocs = getVendorComplianceDocuments("ven-falcon");
assert(complianceDocs.length === 4, `Expected 4 compliance documents, got ${complianceDocs.length}`);

// Trade Licence expiring soon
const tradeLicence = complianceDocs.find((d) => d.documentType === "TRADE_LICENCE");
assert(!!tradeLicence, "Trade licence document exists");
assert(
  tradeLicence?.status === "EXPIRING_SOON",
  `Trade licence status is EXPIRING_SOON (got ${tradeLicence?.status})`
);
assert(
  tradeLicence?.severity === "WARNING",
  `Trade licence severity is WARNING (got ${tradeLicence?.severity})`
);
assert(
  tradeLicence?.daysRemaining === 24,
  `Trade licence has 24 days remaining <= 90-day threshold (got ${tradeLicence?.daysRemaining})`
);

// VAT, Insurance, ISO
const taxDoc = complianceDocs.find((d) => d.documentType === "TAX_REGISTRATION");
assert(taxDoc?.status === "ACTIVE", "VAT certificate is ACTIVE");

const insDoc = complianceDocs.find((d) => d.documentType === "INSURANCE");
assert(insDoc?.status === "ACTIVE", "Insurance certificate is ACTIVE");

const isoDoc = complianceDocs.find((d) => d.documentType === "ISO_CERTIFICATE");
assert(isoDoc?.status === "ACTIVE", "ISO certificate is ACTIVE");

// Test file replacement
const updatedDoc = uploadOrReplaceVendorComplianceDocument(
  "doc-tl-001",
  {
    id: "f-tl-replaced",
    name: "Falcon_Tech_Trade_Licence_Renewed_2026.pdf",
    sizeBytes: 1540000,
  },
  "ven-falcon"
);
assert(
  updatedDoc.file.name === "Falcon_Tech_Trade_Licence_Renewed_2026.pdf",
  "Compliance file replacement updated successfully"
);

// --------------------------------------------------------------------------
// TEST 3: /vendor/profile Company Details, Primary Contact, VENDORUSER.MANAGE
// --------------------------------------------------------------------------
console.log("\n--- TEST 3: Company Profile & Coordinator Governance ---");
const profile = getVendorProfile("ven-falcon");
assert(!!profile, "Vendor profile for Falcon Tech exists");
assert(profile?.companyName === "Falcon Tech Resourcing LLC", `Company name matches (got ${profile?.companyName})`);
assert(profile?.tradeLicenceNumber === "DET-849201", "Trade licence number matches DET-849201");
assert(profile?.taxRegistrationNumber === "100-3492-9102-0003", "TRN matches 100-3492-9102-0003");
assert(profile?.primaryContact.name === "Layla Hassan", "Primary contact is Layla Hassan");
assert(profile?.coordinators.length === 2, `Expected 2 coordinators, got ${profile?.coordinators.length}`);

const primaryCoord = profile?.coordinators.find((c) => c.isPrimary);
assert(primaryCoord?.id === "usr-layla", "Primary coordinator is usr-layla (Layla Hassan)");
assert(primaryCoord?.status === "ACTIVE", "Layla Hassan is ACTIVE");

const secondaryCoord = profile?.coordinators.find((c) => !c.isPrimary);
assert(secondaryCoord?.name === "Kareem Mostafa", "Secondary coordinator is Kareem Mostafa");

// --------------------------------------------------------------------------
// TEST 4: /vendor/support Procurement Message Thread
// --------------------------------------------------------------------------
console.log("\n--- TEST 4: Procurement Support Helpdesk ---");
const messages = listVendorSupportMessages("ven-falcon");
assert(messages.length >= 2, `Expected at least 2 seeded support messages, got ${messages.length}`);

const vendorMsg = messages.find((m) => m.isVendor);
assert(!!vendorMsg, "Vendor inquiry message found");
assert(vendorMsg?.senderName === "Layla Hassan", "Vendor sender is Layla Hassan");

const procMsg = messages.find((m) => !m.isVendor);
assert(!!procMsg, "Procurement response message found");
assert(procMsg?.senderName === "Aisha Al Nuaimi", "Procurement sender is Aisha Al Nuaimi");

// Test composing and sending a new message
const newMsg = sendVendorSupportMessage({
  vendorId: "ven-falcon",
  senderName: "Layla Hassan",
  senderRole: "Vendor Coordinator",
  isVendor: true,
  subject: "Inquiry on Invoicing Schedule for Requisition 0119",
  body: "Please confirm monthly timesheet cutoff date for October billing.",
  category: "BILLING",
});

assert(!!newMsg.id, "New support message received an ID");
const updatedMessages = listVendorSupportMessages("ven-falcon");
assert(
  updatedMessages.some((m) => m.id === newMsg.id),
  "New support message appended to vendor thread"
);

console.log("\n====================================================================");
console.log("  ALL VP5 VERIFICATION CHECKS PASSED SUCCESSFULLY (100%)");
console.log("====================================================================\n");
