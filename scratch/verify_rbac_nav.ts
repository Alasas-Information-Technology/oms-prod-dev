/**
 * Verification Script: RBAC-Filtered Navigation vs Part 2.2 Role Table
 */

import { getFilteredNavGroups, NavUserContext } from "../lib/navigation/internal-nav";
import { PERSONA_AUTH_MAP } from "../src/lib/demo-data/persona-auth";

interface TestCase {
  roleName: string;
  context: NavUserContext;
  expectedItems: string[];
}

const testCases: TestCase[] = [
  {
    roleName: "Department Requestor",
    context: {
      userId: "usr-mariam",
      roles: PERSONA_AUTH_MAP["usr-mariam"].roles,
      permissions: PERSONA_AUTH_MAP["usr-mariam"].permissions,
      scopes: PERSONA_AUTH_MAP["usr-mariam"].scopes,
      isSystemAdmin: false,
    },
    expectedItems: ["Dashboard", "My Requests"],
  },
  {
    roleName: "Line Manager",
    context: {
      userId: "usr-omar",
      roles: PERSONA_AUTH_MAP["usr-omar"].roles,
      permissions: PERSONA_AUTH_MAP["usr-omar"].permissions,
      scopes: PERSONA_AUTH_MAP["usr-omar"].scopes,
      isSystemAdmin: false,
    },
    expectedItems: ["Dashboard", "My Requests", "All Requests", "Workforce"],
  },
  {
    roleName: "Section Head",
    context: {
      userId: "usr-fatima",
      roles: PERSONA_AUTH_MAP["usr-fatima"].roles,
      permissions: PERSONA_AUTH_MAP["usr-fatima"].permissions,
      scopes: PERSONA_AUTH_MAP["usr-fatima"].scopes,
      isSystemAdmin: false,
    },
    expectedItems: ["Dashboard", "My Requests", "All Requests", "Workforce"],
  },
  {
    roleName: "HOD",
    context: {
      userId: "usr-khalid",
      roles: PERSONA_AUTH_MAP["usr-khalid"].roles,
      permissions: PERSONA_AUTH_MAP["usr-khalid"].permissions,
      scopes: PERSONA_AUTH_MAP["usr-khalid"].scopes,
      isSystemAdmin: false,
    },
    expectedItems: ["Dashboard", "All Requests", "Budget", "Candidates", "Workforce", "Reports"],
  },
  {
    roleName: "HR Specialist",
    context: {
      userId: "usr-aisha",
      roles: PERSONA_AUTH_MAP["usr-aisha"].roles,
      permissions: PERSONA_AUTH_MAP["usr-aisha"].permissions,
      scopes: PERSONA_AUTH_MAP["usr-aisha"].scopes,
      isSystemAdmin: false,
    },
    expectedItems: ["Dashboard", "All Requests", "HR Review", "Candidates", "Workforce", "Reports"],
  },
  {
    roleName: "Finance Manager",
    context: {
      userId: "usr-rashid-m",
      roles: PERSONA_AUTH_MAP["usr-rashid-m"].roles,
      permissions: PERSONA_AUTH_MAP["usr-rashid-m"].permissions,
      scopes: PERSONA_AUTH_MAP["usr-rashid-m"].scopes,
      isSystemAdmin: false,
    },
    expectedItems: ["Dashboard", "All Requests", "Budget", "Reports"],
  },
  {
    roleName: "Procurement Officer",
    context: {
      userId: "usr-salma",
      roles: PERSONA_AUTH_MAP["usr-salma"].roles,
      permissions: PERSONA_AUTH_MAP["usr-salma"].permissions,
      scopes: PERSONA_AUTH_MAP["usr-salma"].scopes,
      isSystemAdmin: false,
    },
    expectedItems: ["Dashboard", "All Requests", "Candidates", "Vendors", "Reports"],
  },
  {
    roleName: "Main Interviewer",
    context: {
      userId: "usr-noura",
      roles: PERSONA_AUTH_MAP["usr-noura"].roles,
      permissions: PERSONA_AUTH_MAP["usr-noura"].permissions,
      scopes: PERSONA_AUTH_MAP["usr-noura"].scopes,
      isSystemAdmin: false,
    },
    expectedItems: ["Dashboard", "My Requests", "Candidates"],
  },
  {
    roleName: "System Administrator",
    context: {
      userId: "usr-admin",
      roles: PERSONA_AUTH_MAP["usr-admin"].roles,
      permissions: PERSONA_AUTH_MAP["usr-admin"].permissions,
      scopes: PERSONA_AUTH_MAP["usr-admin"].scopes,
      isSystemAdmin: true,
    },
    expectedItems: ["Dashboard", "Administration"],
  },
];

console.log("================================================================================");
console.log("RUNNING RBAC NAVIGATION VERIFICATION ACROSS ALL 9 ROLES (Part 2.2)");
console.log("================================================================================");

let allPassed = true;

for (const tc of testCases) {
  const groups = getFilteredNavGroups(tc.context);
  const actualItems: string[] = [];
  groups.forEach((g) => {
    g.items.forEach((item) => {
      actualItems.push(item.title);
    });
  });

  const sortedExpected = [...tc.expectedItems].sort();
  const sortedActual = [...actualItems].sort();

  const isMatch =
    sortedExpected.length === sortedActual.length &&
    sortedExpected.every((val, idx) => val === sortedActual[idx]);

  if (isMatch) {
    console.log(`[PASS] ${tc.roleName.padEnd(24)} -> [${actualItems.join(", ")}]`);
    if (tc.roleName === "System Administrator") {
      const adminGroup = groups.find((g) => g.groupLabel === "Administration");
      const adminSubItems = adminGroup?.items[0]?.items?.map((s) => s.title) || [];
      console.log(`       Administration subitems: [${adminSubItems.join(", ")}]`);
    }
  } else {
    allPassed = false;
    console.error(`[FAIL] ${tc.roleName}`);
    console.error(`       Expected: [${tc.expectedItems.join(", ")}]`);
    console.error(`       Actual:   [${actualItems.join(", ")}]`);
  }
}

console.log("================================================================================");
if (allPassed) {
  console.log("ALL 9 ROLES MATCH PART 2.2 SPECIFICATIONS 100%!");
} else {
  console.error("SOME ROLES FAILED VERIFICATION!");
  process.exit(1);
}
