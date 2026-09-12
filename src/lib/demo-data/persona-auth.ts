/**
 * Persona Authentication & Session Engine for Demo Mode
 *
 * Generalises the vendor cookie injector pattern across all 16 canonical cast members.
 * Produces valid HMAC-SHA256 JWT access tokens matching the system's JWT_SECRET and contracts.
 */

import { SignJWT, jwtVerify } from "jose";
import { CAST } from "./cast";
import { Person } from "./entities";

const JWT_SECRET_STRING =
  process.env.JWT_SECRET ||
  "6000576da50db77526e8258b4b29353405b3d0936678de321cf5c781b29a6b5eca007840ea28c5caddd1ec155174303d0251ab2000d7b4e9f904d419d569e94a";

const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_STRING);
const JWT_ISSUER = process.env.JWT_ISSUER || "OMS";
const JWT_AUDIENCE = process.env.JWT_AUDIENCE || "OMS_USERS";

export interface PersonaScope {
  scopeCode: "DEPARTMENT" | "GLOBAL" | "VENDOR";
  departmentId?: string;
  vendorId?: string;
}

export interface PersonaAuthConfig {
  person: Person;
  roles: string[];
  permissions: string[];
  scopes: PersonaScope[];
}

/**
 * Enterprise permissions and scopes mapped to each of the 16 cast members.
 */
export const PERSONA_AUTH_MAP: Record<string, { roles: string[]; permissions: string[]; scopes: PersonaScope[] }> = {
  "usr-mariam": {
    roles: ["DEPARTMENT_REQUESTOR", "REQUESTOR"],
    permissions: ["REQUEST.CREATE", "REQUEST.VIEW", "REQUEST.EDIT", "REQUEST.SUBMIT", "REQUEST.LIST_MINE", "REQUISITION.CREATE", "REQUISITION.VIEW"],
    scopes: [{ scopeCode: "DEPARTMENT", departmentId: "dept-digital-security" }],
  },
  "usr-ahmed-z": {
    roles: ["DEPARTMENT_REQUESTOR", "REQUESTOR"],
    permissions: ["REQUEST.CREATE", "REQUEST.VIEW", "REQUEST.EDIT", "REQUEST.SUBMIT", "REQUEST.LIST_MINE", "REQUISITION.CREATE", "REQUISITION.VIEW"],
    scopes: [{ scopeCode: "DEPARTMENT", departmentId: "dept-it-infra" }],
  },
  "usr-rashid-f": {
    roles: ["DEPARTMENT_REQUESTOR", "REQUESTOR"],
    permissions: ["REQUEST.CREATE", "REQUEST.VIEW", "REQUEST.EDIT", "REQUEST.SUBMIT", "REQUEST.LIST_MINE", "REQUISITION.CREATE", "REQUISITION.VIEW"],
    scopes: [{ scopeCode: "DEPARTMENT", departmentId: "dept-pmo" }],
  },
  "usr-hessa": {
    roles: ["DEPARTMENT_REQUESTOR", "REQUESTOR"],
    permissions: ["REQUEST.CREATE", "REQUEST.VIEW", "REQUEST.EDIT", "REQUEST.SUBMIT", "REQUEST.LIST_MINE", "REQUISITION.CREATE", "REQUISITION.VIEW"],
    scopes: [{ scopeCode: "DEPARTMENT", departmentId: "dept-finance" }],
  },
  "usr-omar": {
    roles: ["LINE_MANAGER", "APPROVER"],
    permissions: [
      "APPROVAL.VIEW",
      "APPROVAL.DECIDE",
      "APPROVAL.APPROVE",
      "APPROVAL.REJECT",
      "APPROVAL.SEND_BACK",
      "REQUEST.VIEW",
      "REQUISITION.VIEW",
      "WORKFORCE.VIEW",
    ],
    scopes: [{ scopeCode: "DEPARTMENT", departmentId: "dept-digital-security" }],
  },
  "usr-fatima": {
    roles: ["SECTION_HEAD", "APPROVER"],
    permissions: [
      "APPROVAL.VIEW",
      "APPROVAL.DECIDE",
      "APPROVAL.APPROVE",
      "APPROVAL.REJECT",
      "APPROVAL.SEND_BACK",
      "REQUEST.VIEW",
      "REQUISITION.VIEW",
      "WORKFORCE.VIEW",
    ],
    scopes: [{ scopeCode: "DEPARTMENT", departmentId: "dept-digital-security" }],
  },
  "usr-khalid": {
    roles: ["HEAD_OF_DEPARTMENT", "HOD", "APPROVER"],
    permissions: [
      "APPROVAL.VIEW",
      "APPROVAL.DECIDE",
      "APPROVAL.APPROVE",
      "APPROVAL.REJECT",
      "APPROVAL.SEND_BACK",
      "REQUEST.VIEW",
      "REQUISITION.VIEW",
      "BUDGET.VIEW",
      "WORKFORCE.VIEW",
      "CANDIDATE.VIEW",
      "REPORTS.VIEW",
    ],
    scopes: [{ scopeCode: "DEPARTMENT", departmentId: "dept-digital-security" }],
  },
  "usr-youssef-b": {
    roles: ["HEAD_OF_DEPARTMENT", "HOD", "APPROVER"],
    permissions: [
      "APPROVAL.VIEW",
      "APPROVAL.DECIDE",
      "APPROVAL.APPROVE",
      "APPROVAL.REJECT",
      "APPROVAL.SEND_BACK",
      "REQUEST.VIEW",
      "REQUISITION.VIEW",
      "BUDGET.VIEW",
      "WORKFORCE.VIEW",
      "CANDIDATE.VIEW",
      "REPORTS.VIEW",
    ],
    scopes: [{ scopeCode: "DEPARTMENT", departmentId: "dept-pmo" }],
  },
  "usr-mona": {
    roles: ["HEAD_OF_DEPARTMENT", "HOD", "APPROVER"],
    permissions: [
      "APPROVAL.VIEW",
      "APPROVAL.DECIDE",
      "APPROVAL.APPROVE",
      "APPROVAL.REJECT",
      "APPROVAL.SEND_BACK",
      "REQUEST.VIEW",
      "REQUISITION.VIEW",
      "BUDGET.VIEW",
      "WORKFORCE.VIEW",
      "CANDIDATE.VIEW",
      "REPORTS.VIEW",
    ],
    scopes: [{ scopeCode: "DEPARTMENT", departmentId: "dept-it-infra" }],
  },
  "usr-aisha": {
    roles: ["HR_SPECIALIST", "HR_REVIEWER", "APPROVER"],
    permissions: [
      "HR.REVIEW",
      "HR_REVIEW.VIEW",
      "HR.VIEW",
      "HR.SEND_BACK",
      "HR.ASSIGN_SOURCING",
      "REQUEST.VIEW",
      "REQUISITION.VIEW",
      "CANDIDATE.VIEW",
      "WORKFORCE.VIEW",
      "REPORTS.VIEW",
      "APPROVAL.VIEW",
    ],
    scopes: [{ scopeCode: "GLOBAL" }],
  },
  "usr-rashid-m": {
    roles: ["FINANCE_MANAGER", "BUDGET_CONTROLLER", "APPROVER"],
    permissions: [
      "BUDGET.VIEW",
      "BUDGET.ALLOCATE",
      "BUDGET.TRANSFER",
      "APPROVAL.VIEW",
      "APPROVAL.DECIDE",
      "REQUEST.VIEW",
      "REQUISITION.VIEW",
      "REPORTS.VIEW",
    ],
    scopes: [{ scopeCode: "GLOBAL" }],
  },
  "usr-salma": {
    roles: ["PROCUREMENT_OFFICER", "VENDOR_MANAGER"],
    permissions: [
      "PROCUREMENT.VIEW",
      "VENDOR.VIEW",
      "VENDOR.MANAGE",
      "REQUEST.VIEW",
      "REQUISITION.VIEW",
      "CANDIDATE.VIEW",
      "REPORTS.VIEW",
    ],
    scopes: [{ scopeCode: "GLOBAL" }],
  },
  "usr-noura": {
    roles: ["MAIN_INTERVIEWER", "INTERVIEWER"],
    permissions: [
      "INTERVIEW.EVALUATE",
      "INTERVIEW.PLAN",
      "INTERVIEW.VIEW",
      "CANDIDATE.VIEW",
      "REQUEST.VIEW",
      "REQUISITION.VIEW",
    ],
    scopes: [{ scopeCode: "DEPARTMENT", departmentId: "dept-digital-security" }],
  },
  "usr-yousef-f": {
    roles: ["PANEL_INTERVIEWER", "INTERVIEWER"],
    permissions: [
      "INTERVIEW.EVALUATE",
      "INTERVIEW.VIEW",
      "CANDIDATE.VIEW",
      "REQUEST.VIEW",
      "REQUISITION.VIEW",
    ],
    scopes: [{ scopeCode: "DEPARTMENT", departmentId: "dept-digital-security" }],
  },
  "usr-layla": {
    roles: ["VENDOR_COORDINATOR"],
    permissions: [
      "VENDOR.DOCUMENTS.VIEW",
      "VENDOR.DOCUMENTS.UPLOAD",
      "VENDOR.ONBOARDING.VIEW",
    ],
    scopes: [{ scopeCode: "VENDOR", vendorId: "ven-falcon" }],
  },
  "usr-admin": {
    roles: ["SYSTEM_ADMIN", "ADMIN"],
    permissions: ["*"],
    scopes: [{ scopeCode: "GLOBAL" }],
  },
};

/**
 * Generates and cryptographically signs a genuine JWT access token for a persona.
 */
export async function signPersonaToken(person: Person): Promise<string> {
  const config = PERSONA_AUTH_MAP[person.id] || {
    roles: [person.role.toUpperCase().replace(/[^A-Z0-9]/g, "_")],
    permissions: ["REQUEST.VIEW"],
    scopes: [{ scopeCode: "GLOBAL" as const }],
  };

  const username = person.id.replace("usr-", "");

  return await new SignJWT({
    userId: person.id,
    sub: person.id,
    username,
    email: person.email,
    userType: person.userType,
    roles: config.roles,
    permissions: config.permissions,
    scopes: config.scopes,
    loginSessionId: `sess-demo-${person.id}`,
    fullName: person.name,
    department: person.departmentName,
    avatarUrl: person.avatarUrl,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer(JWT_ISSUER)
    .setAudience(JWT_AUDIENCE)
    .setExpirationTime("30d")
    .sign(JWT_SECRET);
}

/**
 * Client-side helper: reads currently active demo persona ID.
 */
export function getActivePersonaId(): string {
  if (typeof window === "undefined") return "usr-mariam";
  return localStorage.getItem("oms_demo_persona") || "usr-mariam";
}

/**
 * Client-side helper: reads currently active demo persona object.
 */
export function getActivePersona(): Person {
  const id = getActivePersonaId();
  return CAST[id] || CAST["usr-mariam"];
}

/**
 * Switches the active persona:
 * 1. Signs/retrieves valid JWT token for persona
 * 2. Writes oms_access_token cookie (SameSite=Lax, 30 days)
 * 3. Updates localStorage items
 * 4. Calls server endpoint to set HTTP cookie
 * 5. Handles portal redirect (VENDOR -> /vendor, INTERNAL -> /app)
 */
export async function switchPersona(personaId: string): Promise<void> {
  const person = CAST[personaId];
  if (!person) {
    throw new Error(`Unknown persona ID: ${personaId}`);
  }

  const token = await signPersonaToken(person);

  // 1. Client-accessible cookie
  document.cookie = `oms_access_token=${token}; path=/; max-age=2592000; SameSite=Lax`;

  // 2. Local storage keys
  localStorage.setItem("oms_demo_persona", person.id);
  localStorage.setItem(
    "oms_user_profile",
    JSON.stringify({
      userId: person.id,
      fullName: person.name,
      displayName: person.name,
      email: person.email,
      department: person.departmentName,
      departmentId: person.departmentId,
      role: person.role,
      title: person.title,
      avatarUrl: person.avatarUrl,
      userType: person.userType,
    })
  );

  // 3. Server-side cookie synchronization
  try {
    await fetch("/api/demo/set-persona", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ personaId: person.id, token }),
    });
  } catch (err) {
    console.warn("Failed to notify /api/demo/set-persona:", err);
  }

  // 4. Portal navigation check
  const currentPath = window.location.pathname;
  if (person.userType === "VENDOR" && !currentPath.startsWith("/vendor")) {
    window.location.href = "/vendor/onboarding";
    return;
  }
  if (person.userType === "INTERNAL" && currentPath.startsWith("/vendor")) {
    window.location.href = "/app";
    return;
  }

  // Refresh current view to let all components re-render with new persona
  window.location.reload();
}
