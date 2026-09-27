import { getVendorDocumentsFixture } from "../src/lib/vendor-documents/fixtures";
import { getClarificationFixture } from "../lib/clarification/fixtures";
import { getInterviewPlanningFixture } from "../src/lib/interview-planning/fixtures";
import { getHrSendBackOptionsFixture } from "../src/lib/hr-send-back/fixtures";
import { getNeedsAttentionSummary } from "../lib/fixtures/dashboard-attention.fixtures";
import * as fs from "fs";
import * as path from "path";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`✅ ${message}`);
  }
}

async function runVerification() {
  console.log("=== STEP 1: VERIFYING WORKBENCH SCENARIOS AGAINST DEMO-DATA ===");

  // 1. Vendor Documents Workbench
  console.log("\n--- Testing Vendor Documents Workbench Fixtures ---");
  const v148 = getVendorDocumentsFixture("ONB-2026-0148");
  assert(!!v148, "ONB-2026-0148 fixture found");
  assert(v148.candidateRef === "C-014", `ONB-2026-0148 candidateRef is C-014 (got ${v148.candidateRef})`);
  assert(v148.candidate.fullName === "Samir Rahman", `Candidate name is Samir Rahman (got ${v148.candidate.fullName})`);
  assert(v148.requiredDocuments.length >= 4, `ONB-2026-0148 has document package (${v148.requiredDocuments.length} docs)`);

  const v102 = getVendorDocumentsFixture("ONB-2026-0102");
  assert(!!v102, "ONB-2026-0102 fixture found");
  assert(v102.candidateRef === "C-031", `ONB-2026-0102 candidateRef is C-031 (got ${v102.candidateRef})`);
  assert(v102.candidate.fullName === "Priya Sharma", `Candidate name is Priya Sharma (got ${v102.candidate.fullName})`);

  const v119 = getVendorDocumentsFixture("ONB-2026-0119");
  assert(!!v119, "ONB-2026-0119 fixture found");
  assert(v119.candidateRef === "C-030", `ONB-2026-0119 candidateRef is C-030 (got ${v119.candidateRef})`);

  const v161 = getVendorDocumentsFixture("ONB-2026-0161");
  assert(!!v161, "ONB-2026-0161 fixture found");
  assert(v161.candidateRef === "C-040", `ONB-2026-0161 candidateRef is C-040 (got ${v161.candidateRef})`);
  assert(v161.candidate.fullName === "Kareem Mostafa", `Candidate name is Kareem Mostafa (got ${v161.candidate.fullName})`);
  assert(v161.requiredDocuments.some(d => d.status === "REJECTED"), "ONB-2026-0161 includes rejected document");

  // 2. Clarifications Workbench
  console.log("\n--- Testing Clarifications Workbench Fixtures ---");
  const c139 = getClarificationFixture("clar-2026-0089");
  assert(!!c139, "clar-2026-0089 fixture found");
  assert(c139.requestId === "OMS-2026-0139", `clar-2026-0089 maps to OMS-2026-0139 (got ${c139.requestId})`);

  const c143 = getClarificationFixture("clar-2026-0143-01");
  assert(!!c143, "clar-2026-0143-01 fixture found");
  assert(c143.requestId === "OMS-2026-0143", `clar-2026-0143-01 maps to OMS-2026-0143 (got ${c143.requestId})`);

  const cByReq139 = getClarificationFixture("OMS-2026-0139");
  assert(!!cByReq139, "getClarificationFixture('OMS-2026-0139') found");
  assert(cByReq139.requestId === "OMS-2026-0139", `maps to OMS-2026-0139`);

  // 3. Interview Planning Workbench
  console.log("\n--- Testing Interview Planning Workbench Fixtures ---");
  const ip148 = getInterviewPlanningFixture("OMS-2026-0148");
  assert(!!ip148, "OMS-2026-0148 interview planning fixture found");
  assert(ip148.request.id === "OMS-2026-0148", `Interview planning maps to OMS-2026-0148`);
  assert(ip148.candidates.length >= 2, `OMS-2026-0148 has candidates (${ip148.candidates.length} candidates)`);
  assert(ip148.candidates.some(c => c.candidateRef === "C-014"), "Contains C-014 (Samir Rahman)");
  assert(ip148.candidates.some(c => c.candidateRef === "C-021"), "Contains C-021 (Fatima Al-Hashimi)");

  const ip102 = getInterviewPlanningFixture("OMS-2026-0102");
  assert(!!ip102, "OMS-2026-0102 interview planning fixture found");
  assert(ip102.candidates.some(c => c.candidateRef === "C-031"), "Contains C-031 (Priya Sharma)");

  const ip141 = getInterviewPlanningFixture("OMS-2026-0141");
  assert(!!ip141, "OMS-2026-0141 empty interview planning fixture found");
  assert(ip141.candidates.length === 0, `OMS-2026-0141 has 0 candidates as expected`);

  // 4. HR Send-Back Workbench
  console.log("\n--- Testing HR Send-Back Workbench Fixtures ---");
  const sb139 = getHrSendBackOptionsFixture("OMS-2026-0139");
  assert(!!sb139, "OMS-2026-0139 HR send back fixture found");
  assert(sb139.requestId === "OMS-2026-0139", `HR send back maps to OMS-2026-0139`);
  assert(sb139.modes.length > 0, `OMS-2026-0139 has send-back modes (${sb139.modes.length} modes)`);

  const sb128 = getHrSendBackOptionsFixture("OMS-2026-0128");
  assert(!!sb128, "OMS-2026-0128 HR send back fixture found");
  assert(sb128.requestId === "OMS-2026-0128", `HR send back maps to OMS-2026-0128`);

  // 5. Dashboard Attention Fixture Adaptation
  console.log("\n--- Testing Needs Attention Summary Fixture ---");
  const omarAttention = getNeedsAttentionSummary("usr-omar");
  assert(omarAttention.totalCount > 0, `Omar has pending attention tasks (${omarAttention.totalCount})`);
  const omarReqItem = omarAttention.items.find(i => i.id === "requisitions");
  assert(!!omarReqItem && omarReqItem.count > 0, `Omar has requisitions awaiting action (${omarReqItem?.count})`);

  console.log("\n=== STEP 2: VERIFYING LEGACY /users/* REDIRECTS ===");
  const legacyDir = path.join(__dirname, "../app/users");
  const files = ["page.tsx", "[id]/page.tsx", "new/page.tsx", "vendors/page.tsx"];
  for (const f of files) {
    const fullPath = path.join(legacyDir, f);
    assert(fs.existsSync(fullPath), `Legacy route file ${f} exists`);
    const content = fs.readFileSync(fullPath, "utf-8");
    assert(content.includes('/app/administration/users') && content.includes('redirect('), `${f} contains server redirect to /app/administration/users`);
  }

  console.log("\n=== STEP 3: VERIFYING NO PAGE IMPORTS UNADAPTED FIXTURES ===");
  // Scan all page.tsx and layout.tsx under app/
  function scanDir(dir: string, fileList: string[] = []) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const p = path.join(dir, file);
      if (fs.statSync(p).isDirectory()) {
        scanDir(p, fileList);
      } else if (file.endsWith("page.tsx") || file.endsWith("layout.tsx")) {
        fileList.push(p);
      }
    }
    return fileList;
  }

  const appPages = scanDir(path.join(__dirname, "../app"));
  let fixtureImportCount = 0;
  for (const pagePath of appPages) {
    const relativePath = path.relative(path.join(__dirname, ".."), pagePath);
    const code = fs.readFileSync(pagePath, "utf-8");
    const matches = code.match(/import\s+.*from\s+['"][^'"]*fixture[^'"]*['"]/g);
    if (matches) {
      for (const m of matches) {
        fixtureImportCount++;
        console.log(`ℹ️ [Fixture Import] ${relativePath}: ${m}`);
        // Ensure that imported fixture module is backed by demo-data
        // The allowed paths are dev workbenches and adapted fixtures
        const isDevWorkbench = relativePath.startsWith("app/app/dev/");
        assert(
          isDevWorkbench || relativePath.includes("components/"),
          `Production page ${relativePath} should not import fixtures directly without adapter`
        );
      }
    }
  }
  console.log(`✅ Scanned ${appPages.length} app pages/layouts: verified ${fixtureImportCount} fixture references are isolated or adapted.`);

  console.log("\n🎉 ALL VERIFICATION CHECKS PASSED SUCCESSFULLY!");
}

runVerification().catch(err => {
  console.error("Verification failed:", err);
  process.exit(1);
});
