import { getCandidateAccessToken, listCandidateAccessTokens, getCandidatePortalData, getOnboarding, getAmendment, getRequisition } from "../src/lib/demo-data/queries";
import { ONBOARDING_CASES } from "../src/lib/demo-data/seed";
import { FIXTURE_VENDOR_DOCUMENTS_REFERENCE } from "../src/lib/vendor-documents/fixtures";

console.log("====================================================================");
console.log("  RUNNING JR1 CANDIDATE TOKENS & DEMO-DATA VERIFICATION");
console.log("====================================================================\n");

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string, details?: any) {
  if (condition) {
    console.log(`[✅ PASS] ${message}`);
    passed++;
  } else {
    console.error(`[❌ FAIL] ${message}`, details !== undefined ? details : "");
    failed++;
  }
}

// 1. Amendment 0148 for C-014 is APPROVED
const amd = getAmendment("amd-2026-0089");
assert(amd !== null && amd.status === "APPROVED", "Amendment amd-2026-0089 status is APPROVED", amd?.status);
assert(
  amd?.reapprovalRoute?.length === 4 &&
  amd.reapprovalRoute[0].user.name.includes("Omar") && amd.reapprovalRoute[0].status === "COMPLETED" &&
  amd.reapprovalRoute[1].user.name.includes("Fatima") && amd.reapprovalRoute[1].status === "COMPLETED" &&
  amd.reapprovalRoute[2].user.name.includes("Khalid") && amd.reapprovalRoute[2].status === "COMPLETED",
  "Amendment reapproval steps (Omar, Fatima, Khalid) are COMPLETED in sequence"
);

// 2. Requisition 0148 is in ONBOARDING stage
const req = getRequisition("OMS-2026-0148");
assert(req !== null && req.currentStage === "ONBOARDING", "Requisition OMS-2026-0148 currentStage is ONBOARDING", req?.currentStage);

// 3. Single ONB-2026-0061 record in ONBOARDING_CASES (no duplicate)
const onbList = Object.values(ONBOARDING_CASES).filter(c => c.id === "ONB-2026-0061");
assert(onbList.length === 1, "Exactly 1 ONB-2026-0061 record in ONBOARDING_CASES (no duplicate)", onbList.length);

const onb0061 = getOnboarding("ONB-2026-0061");
assert(onb0061 !== null && onb0061.candidateRef === "C-014" && onb0061.candidate.fullName === "Samir Rahman", "ONB-2026-0061 maps to C-014 Samir Rahman");
assert(onb0061?.residentStatus === "ONSHORE", "ONB-2026-0061 is ONSHORE");

// 4. Backward compatibility: getOnboarding('ONB-2026-0148') resolves to ONB-2026-0061
const onbLegacy = getOnboarding("ONB-2026-0148");
assert(onbLegacy !== null && onbLegacy.id === "ONB-2026-0061", "Legacy lookup for ONB-2026-0148 resolves to canonical ONB-2026-0061");

// 5. Vendor Documents reference fixture resolves to ONB-2026-0061
assert(FIXTURE_VENDOR_DOCUMENTS_REFERENCE.onboardingId === "ONB-2026-0061", "VENDOR-DOCUMENTS-UI reference fixture points to ONB-2026-0061", FIXTURE_VENDOR_DOCUMENTS_REFERENCE.onboardingId);

// 6. Token Issuance & Resolution for ONB-2026-0061 (C-014)
const tokens = listCandidateAccessTokens();
assert(tokens.length >= 2, "Demo tokens list has at least 2 tokens", tokens.length);

const token0061 = getCandidateAccessToken("c-tok-onb0061-c014-samir-rahman-78");
assert(token0061 !== null && token0061.onboardingId === "ONB-2026-0061", "Token c-tok-onb0061-c014-samir-rahman-78 resolves to ONB-2026-0061");

// 7. Candidate Portal Data for C-014 (Onshore)
const portal0061 = getCandidatePortalData("c-tok-onb0061-c014-samir-rahman-78");
assert(portal0061 !== null, "portal0061 payload is non-null");
assert(portal0061?.candidateName === "Samir Rahman", "Candidate name is Samir Rahman", portal0061?.candidateName);
assert(portal0061?.candidateFirstName === "Samir", "Candidate first name is Samir", portal0061?.candidateFirstName);
assert(portal0061?.position === "Senior Cybersecurity Analyst", "Position matches Senior Cybersecurity Analyst", portal0061?.position);
assert(portal0061?.residentStatus === "ONSHORE", "Resident status is ONSHORE", portal0061?.residentStatus);
assert(portal0061?.readinessScore === 78, "Readiness score is 78", portal0061?.readinessScore);

// Check Onshore tasks include medical and biometrics
const taskCodes0061 = portal0061?.tasks.map(t => t.code) || [];
assert(taskCodes0061.includes("PRE_EMPLOYMENT_MEDICAL") && taskCodes0061.includes("BIOMETRIC_ENROLLMENT"), "Onshore tasks include medical and biometrics", taskCodes0061);

// 8. Candidate Portal Data for C-031 (Offshore)
const portal0102 = getCandidatePortalData("c-tok-onb0102-c031-priya-sharma-offshore");
assert(portal0102 !== null, "portal0102 payload is non-null");
assert(portal0102?.candidateName === "Priya Sharma", "Candidate name is Priya Sharma", portal0102?.candidateName);
assert(Boolean(portal0102?.firstDay.location.includes("Remote")), "Location is Remote", portal0102?.firstDay.location);
assert(portal0102?.residentStatus === "OFFSHORE", "Resident status is OFFSHORE", portal0102?.residentStatus);

// Check Offshore tasks include remote access readiness, but NO medical or biometrics
const taskCodes0102 = portal0102?.tasks.map(t => t.code) || [];
assert(taskCodes0102.includes("REMOTE_ACCESS_READINESS") && !taskCodes0102.includes("PRE_EMPLOYMENT_MEDICAL"), "Offshore tasks include remote access and NO medical", taskCodes0102);

// 9. Invalid token returns null (non-enumeration)
const invalidPortal = getCandidatePortalData("c-tok-invalid-non-existent-token");
assert(invalidPortal === null, "Invalid or expired token returns null (non-enumeration)");

// 10. Data Isolation Check: No budget, financial fields, or competitor data in portal payload
const portalJson = JSON.stringify(portal0061);
const forbiddenTerms = ["fils", "budget", "rate", "approvedAmount", "currency", "margin", "salary", "interviewers"];
let leaksFound: string[] = [];
for (const term of forbiddenTerms) {
  if (portalJson.toLowerCase().includes(`"${term.toLowerCase()}"`)) {
    leaksFound.push(term);
  }
}
assert(leaksFound.length === 0, "Candidate portal payload contains NO budget/rate/financial/interviewer fields", leaksFound);

// 11. Internal Reviewer Anonymity Check (actorRole is "onboarding team", never individual user name)
const stepperActors = portal0061?.stepper.map(s => s.actorRole) || [];
const hasIndividualName = stepperActors.some(a => a !== "onboarding team" && a !== null);
assert(!hasIndividualName, "Stepper actor roles are strictly anonymous ('onboarding team')", stepperActors);

console.log(`\n====================================================================`);
console.log(`  SUMMARY: Passed: ${passed}, Failed: ${failed}`);
console.log(`====================================================================`);

if (failed > 0) {
  process.exit(1);
}
