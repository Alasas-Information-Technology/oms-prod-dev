/**
 * Domain 3 — User Administration UI Constants & Plain Language Mappings
 * Matches specifications in DOMAIN-3-USER-ADMIN-UI.md (Part 2 Vocabulary & Part 3.7)
 */

// =============================================================================
// Role Explanations (§Part 2 & 3.5)
// =============================================================================

export interface RoleDefinition {
  code: string;
  name: string;
  explanation: string;
  category?: 'ADMIN' | 'OPERATIONS' | 'FINANCE' | 'GOVERNANCE' | 'VENDOR';
}

export const ROLE_DEFINITIONS: Record<string, RoleDefinition> = {
  SYSTEM_ADMIN: {
    code: 'SYSTEM_ADMIN',
    name: 'System Administrator',
    explanation: 'Full administrative access across all modules, settings, and user access.',
    category: 'ADMIN',
  },
  ORG_ADMIN: {
    code: 'ORG_ADMIN',
    name: 'Organization Administrator',
    explanation: 'Manages departments, organizational units, and structural hierarchy.',
    category: 'ADMIN',
  },
  HOD: {
    code: 'HOD',
    name: 'Head of Department',
    explanation: 'Approves requests, manages team access, and locks budgets for their department.',
    category: 'OPERATIONS',
  },
  DEPARTMENT_HEAD: {
    code: 'DEPARTMENT_HEAD',
    name: 'Head of Department',
    explanation: 'Approves requests, manages team access, and locks budgets for their department.',
    category: 'OPERATIONS',
  },
  LINE_MANAGER: {
    code: 'LINE_MANAGER',
    name: 'Line Manager',
    explanation: 'Supervises direct team members and submits team staffing requests.',
    category: 'OPERATIONS',
  },
  REQUESTOR: {
    code: 'REQUESTOR',
    name: 'Requestor',
    explanation: 'Submits operational requisitions and resource requests for their department.',
    category: 'OPERATIONS',
  },
  HR: {
    code: 'HR',
    name: 'Human Resources',
    explanation: 'Manages candidate onboarding, reviews applicants, and approves hiring.',
    category: 'OPERATIONS',
  },
  HR_MANAGER: {
    code: 'HR_MANAGER',
    name: 'HR Manager',
    explanation: 'Oversees organizational staffing, job descriptions, and hiring approvals.',
    category: 'OPERATIONS',
  },
  FINANCE: {
    code: 'FINANCE',
    name: 'Finance Officer',
    explanation: 'Reviews budget allocations, approves spending, and tracks expenditures.',
    category: 'FINANCE',
  },
  FINANCE_ANALYST: {
    code: 'FINANCE_ANALYST',
    name: 'Finance Analyst',
    explanation: 'Reviews budget allocations, approves spending, and tracks expenditures.',
    category: 'FINANCE',
  },
  PROCUREMENT: {
    code: 'PROCUREMENT',
    name: 'Procurement Specialist',
    explanation: 'Coordinates vendor sourcing, requests for quotes, and purchasing.',
    category: 'OPERATIONS',
  },
  PROCUREMENT_BUYER: {
    code: 'PROCUREMENT_BUYER',
    name: 'Procurement Buyer',
    explanation: 'Coordinates vendor sourcing, requests for quotes, and purchasing.',
    category: 'OPERATIONS',
  },
  INTERVIEWER: {
    code: 'INTERVIEWER',
    name: 'Candidate Interviewer',
    explanation: 'Evaluates candidate qualifications and submits interview scorecards.',
    category: 'OPERATIONS',
  },
  MAIN_INTERVIEWER: {
    code: 'MAIN_INTERVIEWER',
    name: 'Lead Interviewer',
    explanation: 'Leads candidate interview panels and submits final hiring evaluations.',
    category: 'OPERATIONS',
  },
  WORK_COMPLETION_ASSIGNEE: {
    code: 'WORK_COMPLETION_ASSIGNEE',
    name: 'Work Completion Sign-off',
    explanation: 'Verifies deliverable completion and signs off on supplier work orders.',
    category: 'OPERATIONS',
  },
  AUDITOR: {
    code: 'AUDITOR',
    name: 'Compliance Auditor',
    explanation: 'Read-only visibility across organizational records, activity, and logs for audit.',
    category: 'GOVERNANCE',
  },
  VENDOR: {
    code: 'VENDOR',
    name: 'Vendor Representative',
    explanation: 'Submits candidate profiles and vendor responses via the external portal.',
    category: 'VENDOR',
  },
  VENDOR_ADMIN: {
    code: 'VENDOR_ADMIN',
    name: 'Vendor Administrator',
    explanation: 'Manages external supplier staff accounts and company submissions.',
    category: 'VENDOR',
  },
};

/**
 * Returns plain explanation for any role code with graceful fallback.
 */
export function getRoleExplanation(roleCode: string): string {
  const normalized = roleCode.toUpperCase().trim();
  return (
    ROLE_DEFINITIONS[normalized]?.explanation ||
    'Grants operational capabilities and module responsibilities.'
  );
}

/**
 * Returns formatted plain display name for a role code.
 */
export function getRoleDisplayName(roleCode: string): string {
  const normalized = roleCode.toUpperCase().trim();
  return ROLE_DEFINITIONS[normalized]?.name || roleCode;
}

// =============================================================================
// Scope Levels (§Part 3.6 — "What they can see")
// =============================================================================

export interface ScopeLevelDefinition {
  code: 'GLOBAL' | 'ORGANIZATION' | 'BUSINESS_UNIT' | 'DEPARTMENT' | 'SECTION' | 'SELF_ONLY';
  scopeDefinitionId: string;
  label: string;
  explanation: string;
  unitTypeId?: number; // 1: Org, 2: BU, 3: Dept, 4: Section
  hierarchyRank: number; // 1 (broadest) to 5 (narrowest)
}

export const SCOPE_LEVEL_DEFINITIONS: ScopeLevelDefinition[] = [
  {
    code: 'GLOBAL',
    scopeDefinitionId: '3053433E-F36B-1410-85ED-009A959FB341',
    label: 'Everything',
    explanation: 'All departments across DIEZ',
    hierarchyRank: 1,
  },
  {
    code: 'BUSINESS_UNIT',
    scopeDefinitionId: '3053433E-F36B-1410-85ED-009A959FB342',
    label: 'One business unit',
    explanation: 'That business unit and everything inside it',
    unitTypeId: 2,
    hierarchyRank: 2,
  },
  {
    code: 'DEPARTMENT',
    scopeDefinitionId: '3053433E-F36B-1410-85ED-009A959FB343',
    label: 'One department',
    explanation: 'That department and its sections',
    unitTypeId: 3,
    hierarchyRank: 3,
  },
  {
    code: 'SECTION',
    scopeDefinitionId: '3053433E-F36B-1410-85ED-009A959FB344',
    label: 'One section',
    explanation: 'Just that section',
    unitTypeId: 4,
    hierarchyRank: 4,
  },
  {
    code: 'SELF_ONLY',
    scopeDefinitionId: '',
    label: 'Only themselves',
    explanation: 'Only their own requests',
    hierarchyRank: 5,
  },
];

/**
 * Maps raw backend scope codes to plain display names.
 */
export function getScopeLevelDisplayName(scopeCode?: string | null): string {
  if (!scopeCode) return 'Only themselves';
  const normalized = scopeCode.toUpperCase();
  if (normalized === 'GLOBAL' || normalized === 'ORGANIZATION') return 'Everything';
  if (normalized === 'BUSINESS_UNIT') return 'One business unit';
  if (normalized === 'DEPARTMENT') return 'One department';
  if (normalized === 'SECTION') return 'One section';
  if (normalized === 'SELF' || normalized === 'SELF_ONLY') return 'Only themselves';
  return scopeCode;
}

// =============================================================================
// Plain Language Error Message Mappings (§Part 2)
// =============================================================================

export const ERROR_MESSAGES: Record<string, string> = {
  // User Lifecycle Errors
  USER_LAST_ADMIN:
    "You can't turn off the only administrator. Give someone else admin access first.",
  USER_EMAIL_EXISTS:
    'An account with this corporate email address already exists.',
  USER_USERNAME_EXISTS:
    'This username is already in use. Please choose another username.',
  USER_TYPE_INVALID:
    'Invalid account type specified.',
  USER_EMPLOYEE_ID_REQUIRED:
    'An Employee ID is required for all internal staff accounts.',
  USER_VENDOR_INVALID:
    'A valid vendor company is required for external vendor accounts.',
  USER_ORG_UNIT_INVALID:
    'The selected department or organizational unit is invalid or inactive.',
  USER_SCOPE_DENIED:
    'You cannot grant access broader than your own organizational visibility.',
  USER_SELF_ACTION:
    'You cannot modify or remove your own administrator permissions.',
  USER_IS_ORG_HEAD:
    'This person is currently listed as head of a department. Reassign the department head before deactivating.',
  USER_NOT_FOUND:
    'User account not found.',
  USER_INACTIVE:
    'This user account is currently turned off.',
  USER_LOCKED:
    'This account is locked after too many failed sign-in attempts.',

  // Role & Scope Errors
  ROLE_NOT_FOUND:
    'The requested role does not exist or is inactive.',
  ROLE_ASSIGNMENT_INVALID:
    'This role assignment cannot be granted.',
  SCOPE_ASSIGNMENT_INVALID:
    'Invalid organizational visibility configuration.',
  SCOPE_ORG_UNIT_INVALID:
    'The selected unit cannot receive visibility assignments.',
  SCOPE_ESCALATION:
    'You cannot grant broader organizational visibility than you possess.',
  SCOPE_VENDOR_NOT_ALLOWED:
    'Vendor accounts cannot be assigned organizational visibility.',
  SCOPE_DUPLICATE:
    'This organizational access is already assigned to this user.',
  SCOPE_NOT_FOUND:
    'Organizational visibility setting not found.',

  // Vendor User Errors
  VENDOR_REQUIRED:
    'A vendor company link is required.',
  VENDOR_ROLE_INVALID:
    'Internal staff roles cannot be assigned to vendor accounts.',
  VENDOR_SCOPE_NOT_ALLOWED:
    'Vendor accounts cannot have organizational visibility.',
  VENDOR_ORG_UNIT_NOT_ALLOWED:
    'Vendor accounts cannot be assigned to an internal department.',

  // Standing In (Delegation) Errors
  DELEGATION_SELF_NOT_ALLOWED:
    'You cannot stand in for yourself.',
  DELEGATION_INVALID_DATES:
    'The end date must be after the start date and cannot exceed 90 days.',
  DELEGATION_OVERLAP:
    'This person already has an active standing-in arrangement for this period.',
  DELEGATION_INVALID_DELEGATE:
    'You can only delegate to an active internal colleague.',
  DELEGATION_CHAINED_NOT_ALLOWED:
    'A colleague standing in for someone else cannot delegate that authority further.',
  DELEGATION_NOT_FOUND:
    'Standing-in arrangement not found.',

  // Invitation & Password Errors
  INVITATION_INVALID_OR_EXPIRED:
    'This link is no longer valid. Ask an administrator to send you a new invitation.',
  PASSWORD_HISTORY_VIOLATION:
    'Your new password cannot be one of your last 5 passwords.',
  PASSWORD_WEAK:
    'Password does not meet enterprise security requirements.',

  // Import Errors
  IMPORT_EMPTY:
    'The uploaded file contains no user records.',
  IMPORT_EXCEEDS_MAX_ROWS:
    'The file exceeds the maximum limit of 500 people per import.',
  IMPORT_TOKEN_EXPIRED:
    'The validation token has expired. Please re-validate the file.',
  IMPORT_TOKEN_INVALID:
    'The validation token is invalid.',
};

/**
 * Returns plain language, actionable error message.
 */
export function getPlainErrorMessage(errorCode?: string, fallbackMessage?: string): string {
  if (!errorCode) return fallbackMessage || 'An unexpected error occurred. Please try again.';
  return (
    ERROR_MESSAGES[errorCode] ||
    fallbackMessage ||
    'An error occurred while processing your request.'
  );
}

// =============================================================================
// Plain Language Permission Capability Mappings (§Part 3.7)
// =============================================================================

export interface PermissionCapability {
  code: string;
  name: string;
  area: 'Requests' | 'Budget' | 'Candidates' | 'Vendors' | 'Administration' | 'General';
}

export const PERMISSION_CAPABILITIES: Record<string, PermissionCapability> = {
  // Users & Admin
  'USER.VIEW': { code: 'USER.VIEW', name: 'View user accounts and profiles', area: 'Administration' },
  'USER.CREATE': { code: 'USER.CREATE', name: 'Create and invite new internal staff', area: 'Administration' },
  'USER.UPDATE': { code: 'USER.UPDATE', name: 'Update user details and departmental placements', area: 'Administration' },
  'USER.DEACTIVATE': { code: 'USER.DEACTIVATE', name: 'Turn off account access', area: 'Administration' },
  'USER.REACTIVATE': { code: 'USER.REACTIVATE', name: 'Reactivate suspended accounts', area: 'Administration' },
  'USER.DELETE': { code: 'USER.DELETE', name: 'Remove user accounts', area: 'Administration' },
  'USER.UNLOCK': { code: 'USER.UNLOCK', name: 'Unlock accounts after failed sign-in lockouts', area: 'Administration' },
  'USER.INVITE': { code: 'USER.INVITE', name: 'Issue and resend onboarding invitations', area: 'Administration' },
  'USER.RESET_PASSWORD': { code: 'USER.RESET_PASSWORD', name: 'Trigger password reset invitations', area: 'Administration' },
  'USER.ROLE.ASSIGN': { code: 'USER.ROLE.ASSIGN', name: 'Assign and revoke operational roles', area: 'Administration' },
  'USER.SCOPE.ASSIGN': { code: 'USER.SCOPE.ASSIGN', name: 'Assign and modify organizational visibility', area: 'Administration' },
  'USER.OVERRIDE.MANAGE': { code: 'USER.OVERRIDE.MANAGE', name: 'Grant or revoke special access overrides', area: 'Administration' },
  'USER.DELEGATION.MANAGE': { code: 'USER.DELEGATION.MANAGE', name: 'Manage standing-in arrangements for colleagues', area: 'Administration' },
  'USER.IMPORT': { code: 'USER.IMPORT', name: 'Perform bulk onboarding imports', area: 'Administration' },
  'VENDORUSER.MANAGE': { code: 'VENDORUSER.MANAGE', name: 'Manage external supplier portal accounts', area: 'Vendors' },

  // Organization Structure
  'ORG.VIEW': { code: 'ORG.VIEW', name: 'View organizational structure and charts', area: 'Administration' },
  'ORG.CREATE': { code: 'ORG.CREATE', name: 'Create new departments and units', area: 'Administration' },
  'ORG.UPDATE': { code: 'ORG.UPDATE', name: 'Update organizational unit details', area: 'Administration' },
  'ORG.MOVE': { code: 'ORG.MOVE', name: 'Move departments within the hierarchy', area: 'Administration' },
  'ORG.DELETE': { code: 'ORG.DELETE', name: 'Remove organizational units', area: 'Administration' },
  'ORG.MANAGER.ASSIGN': { code: 'ORG.MANAGER.ASSIGN', name: 'Appoint and change department heads', area: 'Administration' },

  // Requisitions & Approvals
  'REQUISITION.VIEW': { code: 'REQUISITION.VIEW', name: 'View department requisitions', area: 'Requests' },
  'REQUISITION.CREATE': { code: 'REQUISITION.CREATE', name: 'Submit workforce and resource requests', area: 'Requests' },
  'REQUISITION.APPROVE': { code: 'REQUISITION.APPROVE', name: 'Approve and authorize department requisitions', area: 'Requests' },

  // Budget
  'BUDGET.VIEW': { code: 'BUDGET.VIEW', name: 'View departmental budget allocations', area: 'Budget' },
  'BUDGET.APPROVE': { code: 'BUDGET.APPROVE', name: 'Approve budget expenditures', area: 'Budget' },
  'BUDGET.LOCK': { code: 'BUDGET.LOCK', name: 'Lock and finalize departmental budgets', area: 'Budget' },
  'BUDGET.REALLOCATE': { code: 'BUDGET.REALLOCATE', name: 'Transfer budget between departments', area: 'Budget' },
  'BUDGET.UPLOAD': { code: 'BUDGET.UPLOAD', name: 'Upload annual baseline departmental budget', area: 'Budget' },
  'BUDGET.PERIOD.MANAGE': { code: 'BUDGET.PERIOD.MANAGE', name: 'Manage, amend, close, and reopen financial periods', area: 'Budget' },
  'BUDGET.AMEND': { code: 'BUDGET.AMEND', name: 'Raise budget amendment and reallocation requests', area: 'Budget' },
  'BUDGET.RECONCILE': { code: 'BUDGET.RECONCILE', name: 'Process Oracle system-of-record reconciliation exceptions', area: 'Budget' },
  'BUDGET.EXPORT': { code: 'BUDGET.EXPORT', name: 'Export audit statements and ledger reports', area: 'Budget' },

  // Candidates & Workforce
  'CANDIDATE.VIEW': { code: 'CANDIDATE.VIEW', name: 'Review applicant profiles and resumes', area: 'Candidates' },
  'CANDIDATE.INTERVIEW': { code: 'CANDIDATE.INTERVIEW', name: 'Conduct candidate evaluation interviews', area: 'Candidates' },
  'CANDIDATE.OFFER': { code: 'CANDIDATE.OFFER', name: 'Issue candidate employment offers', area: 'Candidates' },

  // Vendors
  'VENDOR.VIEW': { code: 'VENDOR.VIEW', name: 'View vendor directory and supplier performance', area: 'Vendors' },
  'VENDOR.MANAGE': { code: 'VENDOR.MANAGE', name: 'Register and manage supplier partnerships', area: 'Vendors' },

  // Security
  'SECURITY.DASHBOARD': { code: 'SECURITY.DASHBOARD', name: 'View security monitoring and threat dashboards', area: 'Administration' },
  'SECURITY.SETTINGS': { code: 'SECURITY.SETTINGS', name: 'Manage session policies and lockout rules', area: 'Administration' },
};

/**
 * Converts a raw permission code into plain English capability description.
 */
export function getPermissionPlainName(code: string): string {
  return PERMISSION_CAPABILITIES[code]?.name || code.replace(/\./g, ' ').toLowerCase();
}

/**
 * Returns the module/area for a permission code.
 */
export function getPermissionArea(code: string): PermissionCapability['area'] {
  return PERMISSION_CAPABILITIES[code]?.area || 'General';
}
