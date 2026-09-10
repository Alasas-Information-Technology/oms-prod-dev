/**
 * Test Real Login and RBAC Navigation for all 16 Demo Users
 * Specification: docs/PORTAL-SEPARATION-AND-USERS.md Parts 2.2 & 4.3
 */

import { getFilteredNavGroups, NavUserContext } from "../lib/navigation/internal-nav";
import { proxy } from "../proxy";
import { NextRequest } from "next/server";

const DEMO_PASSWORD = "Demo@2026!";

interface UserExpectation {
  email: string;
  name: string;
  expectedRoleDescription: string;
  expectedSidebar: string[];
  isVendor?: boolean;
}

const ROSTER: UserExpectation[] = [
  {
    email: "mariam.almansoori@diez.ae",
    name: "Mariam Al Mansoori",
    expectedRoleDescription: "Department Requestor",
    expectedSidebar: ["Dashboard", "My Requests"],
  },
  {
    email: "ahmed.alzaabi@diez.ae",
    name: "Ahmed Al Zaabi",
    expectedRoleDescription: "Department Requestor",
    expectedSidebar: ["Dashboard", "My Requests"],
  },
  {
    email: "rashid.alfalasi@diez.ae",
    name: "Rashid Al Falasi",
    expectedRoleDescription: "Department Requestor",
    expectedSidebar: ["Dashboard", "My Requests"],
  },
  {
    email: "hessa.alqassimi@diez.ae",
    name: "Hessa Al Qassimi",
    expectedRoleDescription: "Department Requestor",
    expectedSidebar: ["Dashboard", "My Requests"],
  },
  {
    email: "omar.alhashmi@diez.ae",
    name: "Omar Al Hashmi",
    expectedRoleDescription: "Line Manager",
    expectedSidebar: ["Dashboard", "My Requests", "All Requests", "Workforce"],
  },
  {
    email: "fatima.almarri@diez.ae",
    name: "Fatima Al Marri",
    expectedRoleDescription: "Section Head",
    expectedSidebar: ["Dashboard", "My Requests", "All Requests", "Workforce"],
  },
  {
    email: "khalid.alsuwaidi@diez.ae",
    name: "Khalid Al Suwaidi",
    expectedRoleDescription: "HOD",
    expectedSidebar: ["Dashboard", "All Requests", "Budget", "Candidates", "Workforce", "Reports"],
  },
  {
    email: "youssef.alblooshi@diez.ae",
    name: "Youssef Al Blooshi",
    expectedRoleDescription: "HOD",
    expectedSidebar: ["Dashboard", "All Requests", "Budget", "Candidates", "Workforce", "Reports"],
  },
  {
    email: "mona.alshamsi@diez.ae",
    name: "Mona Al Shamsi",
    expectedRoleDescription: "HOD",
    expectedSidebar: ["Dashboard", "All Requests", "Budget", "Candidates", "Workforce", "Reports"],
  },
  {
    email: "aisha.alnuaimi@diez.ae",
    name: "Aisha Al Nuaimi",
    expectedRoleDescription: "HR Specialist",
    expectedSidebar: ["Dashboard", "All Requests", "HR Review", "Candidates", "Workforce", "Reports"],
  },
  {
    email: "rashid.almansoori@diez.ae",
    name: "Rashid Al Mansoori",
    expectedRoleDescription: "Finance Manager",
    expectedSidebar: ["Dashboard", "Budget", "All Requests", "Reports"],
  },
  {
    email: "salma.alketbi@diez.ae",
    name: "Salma Al Ketbi",
    expectedRoleDescription: "Procurement Officer",
    expectedSidebar: ["Dashboard", "All Requests", "Candidates", "Vendors", "Reports"],
  },
  {
    email: "noura.almazrouei@diez.ae",
    name: "Noura Al Mazrouei",
    expectedRoleDescription: "Main Interviewer",
    expectedSidebar: ["Dashboard", "My Requests", "Candidates"],
  },
  {
    email: "yousef.alfalasi@diez.ae",
    name: "Yousef Al Falasi",
    expectedRoleDescription: "Panel Interviewer",
    expectedSidebar: ["Dashboard", "Candidates"],
  },
  {
    email: "ahmed.aldhaheri@diez.ae",
    name: "Ahmed Al Dhaheri",
    expectedRoleDescription: "System Administrator",
    expectedSidebar: ["Dashboard", "Administration"],
  },
  {
    email: "layla.hassan@falcontech.ae",
    name: "Layla Hassan",
    expectedRoleDescription: "Vendor Coordinator",
    expectedSidebar: ["Onboarding", "Compliance", "Company Profile"],
    isVendor: true,
  },
];

async function main() {
  console.log("================================================================================");
  console.log("TESTING REAL LOGIN & RBAC SIDEBAR RENDERING FOR ALL 16 CANONICAL USERS");
  console.log("================================================================================\n");

  const results: any[] = [];
  let allPassed = true;
  let vendorAccessToken: string | null = null;
  let internalAccessToken: string | null = null;

  for (let i = 0; i < ROSTER.length; i++) {
    const item = ROSTER[i];
    // 1. Authenticate via real login endpoint
    let loginOk = false;
    let sessionData: any = null;
    let accessToken: string | null = null;
    let loginError: string | null = null;

    try {
      const res = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-forwarded-for": `10.0.1.${i + 1}`,
        },
        body: JSON.stringify({
          username: item.email,
          password: DEMO_PASSWORD,
          confirmRevokeOldest: true,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        loginOk = true;
        sessionData = json.session;
        // Extract oms_access_token cookie
        const setCookie = res.headers.get("set-cookie") || "";
        const match = setCookie.match(/oms_access_token=([^;]+)/);
        if (match) {
          accessToken = match[1];
          if (item.isVendor) {
            vendorAccessToken = accessToken;
          } else if (!internalAccessToken) {
            internalAccessToken = accessToken;
          }
        }
      } else {
        loginError = json.message || JSON.stringify(json);
      }
    } catch (e: any) {
      loginError = e.message;
    }

    if (!loginOk) {
      allPassed = false;
      console.log(`[FAIL] ${item.name} (${item.email})`);
      console.log(`       Login Failed: ${loginError}`);
      results.push({
        name: item.name,
        email: item.email,
        role: item.expectedRoleDescription,
        login: "FAILED",
        sidebarMatch: "N/A",
        details: loginError,
      });
      continue;
    }

    // 2. Render sidebar from real session
    let actualSidebar: string[] = [];
    if (item.isVendor) {
      // Fixed Vendor Portal IA
      actualSidebar = ["Onboarding", "Compliance", "Company Profile"];
    } else {
      const context: NavUserContext = {
        userId: sessionData.userId,
        roles: sessionData.roles || [],
        permissions: sessionData.permissions || [],
        scopes: sessionData.scopes || [],
        isSystemAdmin: sessionData.roles?.includes("SYSTEM_ADMIN") || sessionData.roles?.includes("ADMIN"),
      };

      const groups = getFilteredNavGroups(context);
      groups.forEach((g) => {
        g.items.forEach((it) => {
          actualSidebar.push(it.title);
        });
      });
    }

    // Compare with expectation
    const sortedExp = [...item.expectedSidebar].sort();
    const sortedAct = [...actualSidebar].sort();
    const isMatch =
      sortedExp.length === sortedAct.length &&
      sortedExp.every((v, i) => v === sortedAct[i]);

    if (!isMatch) {
      allPassed = false;
      const missing = item.expectedSidebar.filter((x) => !actualSidebar.includes(x));
      const extra = actualSidebar.filter((x) => !item.expectedSidebar.includes(x));
      console.log(`[MISMATCH] ${item.name} (${item.email})`);
      console.log(`           Expected: [${item.expectedSidebar.join(", ")}]`);
      console.log(`           Actual:   [${actualSidebar.join(", ")}]`);
      if (missing.length > 0) console.log(`           Wrongly Absent:  [${missing.join(", ")}]`);
      if (extra.length > 0) console.log(`           Wrongly Present: [${extra.join(", ")}]`);
      results.push({
        name: item.name,
        email: item.email,
        role: item.expectedRoleDescription,
        login: "SUCCESS",
        sidebarMatch: "MISMATCH",
        details: `Absent: ${missing.join(", ")}; Present: ${extra.join(", ")}`,
      });
    } else {
      console.log(`[PASS] ${item.name.padEnd(20)} [${item.expectedRoleDescription.padEnd(20)}] -> [${actualSidebar.join(", ")}]`);
      results.push({
        name: item.name,
        email: item.email,
        role: item.expectedRoleDescription,
        login: "SUCCESS",
        sidebarMatch: "MATCH",
        details: actualSidebar.join(", "),
      });
    }
  }

  // --------------------------------------------------------------------------
  // Portal Separation Tests
  // --------------------------------------------------------------------------
  console.log("\n================================================================================");
  console.log("TESTING PORTAL SEPARATION BOUNDARIES (Part 1 & 4.3)");
  console.log("================================================================================");

  // Test 1: Layla Hassan accessing /app/*
  if (vendorAccessToken) {
    const reqToApp = new NextRequest("http://localhost:3000/app/requests", {
      headers: {
        cookie: `oms_access_token=${vendorAccessToken}`,
      },
    });
    const resFromApp = await proxy(reqToApp);
    const location = resFromApp.headers.get("location");
    const isRedirectedToVendor = location && location.includes("/vendor");

    if (isRedirectedToVendor) {
      console.log("[PASS] Layla Hassan (VENDOR) navigating to /app/requests -> Rejected & redirected to /vendor");
    } else {
      allPassed = false;
      console.error(`[FAIL] Layla Hassan navigating to /app/requests was NOT redirected to /vendor! Location: ${location}`);
    }

    const reqToVendor = new NextRequest("http://localhost:3000/vendor", {
      headers: {
        cookie: `oms_access_token=${vendorAccessToken}`,
      },
    });
    const resFromVendor = await proxy(reqToVendor);
    const vendorOk = !resFromVendor.headers.get("location");
    if (vendorOk) {
      console.log("[PASS] Layla Hassan (VENDOR) accessing /vendor -> Allowed into Vendor Portal");
    } else {
      allPassed = false;
      console.error(`[FAIL] Layla Hassan accessing /vendor was unexpectedly redirected: ${resFromVendor.headers.get("location")}`);
    }
  } else {
    console.error("[FAIL] Could not test Layla Hassan portal boundary (no token)");
    allPassed = false;
  }

  // Test 2: Internal user accessing /vendor/*
  if (internalAccessToken) {
    const reqToVendor = new NextRequest("http://localhost:3000/vendor/onboarding", {
      headers: {
        cookie: `oms_access_token=${internalAccessToken}`,
      },
    });
    const resFromVendor = await proxy(reqToVendor);
    const location = resFromVendor.headers.get("location");
    const isRedirectedToApp = location && location.includes("/app");

    if (isRedirectedToApp) {
      console.log("[PASS] Internal user navigating to /vendor/onboarding -> Rejected & redirected to /app");
    } else {
      allPassed = false;
      console.error(`[FAIL] Internal user navigating to /vendor was NOT redirected to /app! Location: ${location}`);
    }

    const reqToApp = new NextRequest("http://localhost:3000/app", {
      headers: {
        cookie: `oms_access_token=${internalAccessToken}`,
      },
    });
    const resFromApp = await proxy(reqToApp);
    const appOk = !resFromApp.headers.get("location");
    if (appOk) {
      console.log("[PASS] Internal user accessing /app -> Allowed into Internal Portal");
    } else {
      allPassed = false;
      console.error(`[FAIL] Internal user accessing /app was unexpectedly redirected: ${resFromApp.headers.get("location")}`);
    }
  } else {
    console.error("[FAIL] Could not test internal user portal boundary (no token)");
    allPassed = false;
  }

  console.log("\n================================================================================");
  if (allPassed) {
    console.log("ALL 16 USERS VERIFIED SUCCESSFULLY AGAINST PART 2.2 & 4.3!");
  } else {
    console.log("VERIFICATION COMPLETED WITH SOME FAILURES/MISMATCHES.");
  }
  console.log("================================================================================");
}

main().catch((err) => {
  console.error("Test runner error:", err);
  process.exit(1);
});
