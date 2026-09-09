/**
 * Automated Verification Test for VD2 (Route, Shell, Progress Rail, Deadline, Candidate Panel, Timezone)
 */

import React from "react";
import fs from "fs";
import path from "path";
import { renderToString } from "react-dom/server";
import { VendorProgressRail, ONBOARDING_LIFECYCLE_STAGES } from "../components/oms/vendor-documents/VendorProgressRail";
import { VendorContextBar } from "../components/oms/vendor-documents/VendorContextBar";
import { CandidateSummaryPanel } from "../components/oms/vendor-documents/CandidateSummaryPanel";
import { VendorTopbar } from "../components/ui/layouts/VendorTopbar";
import {
  FIXTURE_VENDOR_DOCUMENTS_REFERENCE,
  FIXTURE_VENDOR_DOCUMENTS_DEADLINE_CRITICAL,
} from "../src/lib/vendor-documents/fixtures";
import {
  formatJoiningDate,
  formatAuditTimestamp,
  getDeadlineVisuals,
} from "../src/lib/vendor-documents/formatters";

async function main() {
  console.log("=== VD2 SHELL & COMPONENTS VERIFICATION ===");
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

  // 1. Task 1: Check route and shell existence
  const pagePath = path.resolve(__dirname, "../app/vendor/onboarding/[onboardingId]/documents/page.tsx");
  const layoutPath = path.resolve(__dirname, "../app/vendor/layout.tsx");
  assert(fs.existsSync(pagePath), "Route app/vendor/onboarding/[onboardingId]/documents/page.tsx exists");
  assert(fs.existsSync(layoutPath), "Vendor layout app/vendor/layout.tsx exists");

  // Check VendorTopbar branding
  const topbarHtml = renderToString(<VendorTopbar />);
  assert(topbarHtml.includes("OEMS Vendor Portal"), "VendorTopbar renders 'OEMS Vendor Portal' branding");
  assert(topbarHtml.includes("Accredited Partner"), "VendorTopbar renders 'Accredited Partner' badge");

  // Check ContextBar breadcrumbs, sub-line, actions
  const contextBarHtml = renderToString(
    <VendorContextBar
      onboardingId="ONB-2026-0061"
      candidateRef="C-014"
      position="Senior Cybersecurity Analyst"
      candidate={FIXTURE_VENDOR_DOCUMENTS_REFERENCE.candidate}
      deadline={FIXTURE_VENDOR_DOCUMENTS_REFERENCE.deadline}
    />
  );
  assert(contextBarHtml.includes("Onboarding"), "ContextBar renders Onboarding breadcrumb");
  assert(contextBarHtml.includes("ONB-2026-0061"), "ContextBar renders ONB-2026-0061");
  assert(contextBarHtml.includes("Candidate C-014"), "ContextBar renders Candidate C-014 in sub-line");
  assert(contextBarHtml.includes("Senior Cybersecurity Analyst"), "ContextBar renders position in sub-line");
  assert(contextBarHtml.includes("onshore"), "ContextBar renders resident status in sub-line");
  assert(contextBarHtml.includes("Save draft"), "ContextBar renders Save draft ghost action");
  assert(contextBarHtml.includes("Submit documents"), "ContextBar renders Submit primary action");

  // 2. Task 2: Progress Rail
  const railHtml = renderToString(
    <VendorProgressRail
      currentStage={2}
      totalStages={5}
      stageLabel="Required documents"
    />
  );
  assert(railHtml.includes("Required documents"), "Progress rail renders 'Required documents' label");
  assert(railHtml.includes("2 of 5"), "Progress rail renders '2 of 5'");
  assert(ONBOARDING_LIFECYCLE_STAGES.length === 5, "Lifecycle stages array contains 5 stages");
  assert(ONBOARDING_LIFECYCLE_STAGES[0].status === "completed", "Stage 1 is completed");
  assert(ONBOARDING_LIFECYCLE_STAGES[1].status === "current", "Stage 2 is current");
  assert(ONBOARDING_LIFECYCLE_STAGES[3].label === "DIEZ Review", "Stage 4 is 'DIEZ Review'");

  // 3. Task 3: Deadline per 1.12
  const normalVisuals = getDeadlineVisuals(FIXTURE_VENDOR_DOCUMENTS_REFERENCE.deadline);
  assert(normalVisuals.noticeText.includes("Joining 1 Sep 2026 · 8 days left to complete documents"), "Normal deadline format matches spec");
  assert(!normalVisuals.isAtRisk, "Normal deadline is not marked at risk");

  const criticalVisuals = getDeadlineVisuals(FIXTURE_VENDOR_DOCUMENTS_DEADLINE_CRITICAL.deadline);
  console.log("Critical deadline notice:", criticalVisuals.noticeText);
  assert(criticalVisuals.noticeText.includes("2 days left · Joining date at risk"), "Critical deadline states joining date is at risk");
  assert(criticalVisuals.isAtRisk, "Critical deadline is flagged at risk");
  assert(criticalVisuals.severityClass.includes("text-destructive"), "Critical deadline is styled red (text-destructive)");

  const contextBarCriticalHtml = renderToString(
    <VendorContextBar
      onboardingId="ONB-2026-0065"
      candidateRef="C-018"
      position="Cyber Threat Hunter"
      candidate={FIXTURE_VENDOR_DOCUMENTS_DEADLINE_CRITICAL.candidate}
      deadline={FIXTURE_VENDOR_DOCUMENTS_DEADLINE_CRITICAL.deadline}
    />
  );
  assert(contextBarCriticalHtml.includes("Joining date at risk"), "Critical context bar renders 'Joining date at risk'");
  assert(contextBarCriticalHtml.includes("text-destructive"), "Critical context bar renders text-destructive styling");

  // 4. Task 4: Candidate Panel (260px)
  const candidateHtml = renderToString(
    <CandidateSummaryPanel
      candidate={FIXTURE_VENDOR_DOCUMENTS_REFERENCE.candidate}
      candidateRef="C-014"
      position="Senior Cybersecurity Analyst"
      deadline={FIXTURE_VENDOR_DOCUMENTS_REFERENCE.deadline}
    />
  );
  assert(candidateHtml.includes("lg:w-[260px]"), "Candidate panel has 260px desktop width class");
  assert(candidateHtml.includes("From your submission"), "Candidate panel renders 'From your submission' badge");
  assert(candidateHtml.includes("Samir Rahman"), "Candidate panel renders full name Samir Rahman");
  assert(candidateHtml.includes("India"), "Candidate panel renders nationality India");
  assert(candidateHtml.includes("ONSHORE"), "Candidate panel renders resident status ONSHORE");
  assert(candidateHtml.includes("1 Sep 2026"), "Candidate panel renders joining date 1 Sep 2026");
  assert(candidateHtml.includes("samir.rahman@example.com"), "Candidate panel renders unmasked email");
  assert(candidateHtml.includes("+971 50 123 4567"), "Candidate panel renders unmasked mobile");
  assert(candidateHtml.includes("Privacy notice acknowledged"), "Candidate panel renders privacy notice acknowledged");
  assert(candidateHtml.includes("Secure platform"), "Candidate panel renders collapsed 'Secure platform' indicator");
  assert(candidateHtml.includes("6 controls"), "Candidate panel shows 6 controls count on trigger");

  // Check that the six facts are present in the panel code
  const candidateFile = fs.readFileSync(
    path.resolve(__dirname, "../components/oms/vendor-documents/CandidateSummaryPanel.tsx"),
    "utf8"
  );
  assert(candidateFile.includes("Signed session"), "Panel contains 'Signed session' control");
  assert(candidateFile.includes("File types validated"), "Panel contains 'File types validated' control");
  assert(candidateFile.includes("Malware scanned"), "Panel contains 'Malware scanned' control");
  assert(candidateFile.includes("Encrypted"), "Panel contains 'Encrypted' control");
  assert(candidateFile.includes("Access audited"), "Panel contains 'Access audited' control");
  assert(candidateFile.includes("Consent recorded"), "Panel contains 'Consent recorded' control");

  // 5. Task 5: Timezone per 1.10
  const sampleTime = new Date("2026-08-24T08:15:00Z");
  const formattedTz = formatAuditTimestamp(sampleTime);
  console.log("Formatted audit timestamp:", formattedTz);
  assert(formattedTz.includes("Gulf Standard Time"), "Timestamp includes 'Gulf Standard Time'");
  assert(!formattedTz.match(/\bGST\b/), "Timestamp NEVER has bare abbreviation 'GST'");

  // Check no bare GST in component code
  const vendorDir = path.resolve(__dirname, "../components/oms/vendor-documents");
  const files = fs.readdirSync(vendorDir);
  let bareGstFound = false;
  for (const file of files) {
    const content = fs.readFileSync(path.join(vendorDir, file), "utf8");
    if (content.match(/['"`][^'"`]*\bGST\b[^'"`]*['"`]/)) {
      bareGstFound = true;
      console.error(`Found bare GST in ${file}`);
    }
  }
  assert(!bareGstFound, "0 instances of bare 'GST' found in vendor components");

  console.log(`\nVerification complete: ${passed} / ${total} checks passed.`);
}

main().catch((err) => {
  console.error("Verification error:", err);
  process.exit(1);
});
