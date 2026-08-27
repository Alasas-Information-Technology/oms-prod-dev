/**
 * Domain 2 — Organization Structure: Response Contracts & DTOs
 * Matches Section 8.5 of DOMAIN-2-ORGANIZATION-STRUCTURE.md
 */

// =============================================================================
// Enums & Constants
// =============================================================================

export enum ManagerRoleCode {
  HEAD = 'HEAD',
  ACTING_HEAD = 'ACTING_HEAD',
  DEPUTY = 'DEPUTY',
  ASSISTANT = 'ASSISTANT',
}

export enum ScopeLevelCode {
  ORGANIZATION = 'ORGANIZATION',
  BUSINESS_UNIT = 'BUSINESS_UNIT',
  DEPARTMENT = 'DEPARTMENT',
  SECTION = 'SECTION',
}

export const ORG_ERROR_CODES = {
  // Creation rules C1–C10
  ORG_TYPE_INVALID: 'ORG_TYPE_INVALID',
  ORG_TYPE_INACTIVE: 'ORG_TYPE_INACTIVE',
  ORG_PARENT_REQUIRED: 'ORG_PARENT_REQUIRED',
  ORG_ROOT_CANNOT_HAVE_PARENT: 'ORG_ROOT_CANNOT_HAVE_PARENT',
  ORG_ROOT_EXISTS: 'ORG_ROOT_EXISTS',
  ORG_HIERARCHY_RULE_VIOLATION: 'ORG_HIERARCHY_RULE_VIOLATION',
  ORG_PARENT_INVALID: 'ORG_PARENT_INVALID',
  ORG_PARENT_INACTIVE: 'ORG_PARENT_INACTIVE',
  ORG_CODE_DUPLICATE: 'ORG_CODE_DUPLICATE',
  ORG_CODE_FORMAT: 'ORG_CODE_FORMAT',
  ORG_EFFECTIVE_BEFORE_PARENT: 'ORG_EFFECTIVE_BEFORE_PARENT',
  ORG_SCOPE_DENIED: 'ORG_SCOPE_DENIED',

  // Move rules M1–M8
  ORG_MOVE_TO_SELF: 'ORG_MOVE_TO_SELF',
  ORG_MOVE_CYCLE: 'ORG_MOVE_CYCLE',
  ORG_MOVE_BLOCKED_BUDGET: 'ORG_MOVE_BLOCKED_BUDGET',
  ORG_CONCURRENCY_CONFLICT: 'ORG_CONCURRENCY_CONFLICT',

  // Delete & Deactivation rules D1–D7
  ORG_HAS_ACTIVE_CHILDREN: 'ORG_HAS_ACTIVE_CHILDREN',
  ORG_HAS_CHILDREN: 'ORG_HAS_CHILDREN',
  ORG_HAS_ASSIGNED_USERS: 'ORG_HAS_ASSIGNED_USERS',
  ORG_REFERENCED: 'ORG_REFERENCED',
  ORG_ROOT_PROTECTED: 'ORG_ROOT_PROTECTED',

  // Manager rules G1–G7
  ORG_PRIMARY_HEAD_EXISTS: 'ORG_PRIMARY_HEAD_EXISTS',
  ORG_MANAGER_PERIOD_OVERLAP: 'ORG_MANAGER_PERIOD_OVERLAP',
  ORG_MANAGER_INVALID_USER: 'ORG_MANAGER_INVALID_USER',
  ORG_TYPE_NO_MANAGER: 'ORG_TYPE_NO_MANAGER',
  ORG_MANAGER_NOT_FOUND: 'ORG_MANAGER_NOT_FOUND',

  // General
  ORG_NOT_FOUND: 'ORG_NOT_FOUND',
  ORG_FORBIDDEN: 'ORG_FORBIDDEN',
  ORG_VENDOR_RESTRICTED: 'ORG_VENDOR_RESTRICTED',
  ORG_EXPORT_FAILED: 'ORG_EXPORT_FAILED',
} as const;

export type OrgErrorCode = (typeof ORG_ERROR_CODES)[keyof typeof ORG_ERROR_CODES];

export const ORG_PERMISSIONS = {
  VIEW: 'ORG.VIEW',
  CREATE: 'ORG.CREATE',
  UPDATE: 'ORG.UPDATE',
  MOVE: 'ORG.MOVE',
  DELETE: 'ORG.DELETE',
  MANAGE_MANAGERS: 'ORG.MANAGER.ASSIGN',
  MANAGE_TYPES: 'ORG.TYPE.MANAGE',
  EXPORT: 'ORG.EXPORT',
} as const;

// =============================================================================
// Org Unit Types & Hierarchy Rules
// =============================================================================

export interface OrgUnitTypeHierarchyRuleDto {
  ruleId: number;
  childOrgUnitTypeId: number;
  parentOrgUnitTypeId: number;
  isAllowed: boolean;
}

export interface OrgUnitTypeDto {
  orgUnitTypeId: number;
  code: string;
  name: string;
  nameAr?: string | null;
  description?: string | null;
  canonicalLevel: number;
  scopeLevelCode: string;
  allowsBudget: boolean;
  allowsRequisition: boolean;
  allowsManager: boolean;
  isRootType: boolean;
  sortOrder: number;
  isActive: boolean;
  allowedChildTypeIds?: number[];
  hierarchyRules?: OrgUnitTypeHierarchyRuleDto[];
}

export interface AllowedParentTypeDto {
  orgUnitTypeId: number;
  code: string;
  name: string;
  nameAr?: string | null;
  canonicalLevel: number;
}

// =============================================================================
// Org Units (Summary, Detail, Tree, Breadcrumb, Head)
// =============================================================================

export interface OrgUnitHeadDto {
  userId: string;
  displayName: string;
  userDisplayName?: string;
  email?: string | null;
  userEmail?: string | null;
  effectiveFrom: string;
}

export interface OrgUnitBreadcrumbDto {
  orgUnitId: string;
  code: string;
  name: string;
  nameAr?: string | null;
  depth: number;
}

export interface OrgUnitSummaryDto {
  orgUnitId: string;
  orgUnitTypeId?: number;
  orgUnitType?: {
    orgUnitTypeId: number;
    code: string;
    name: string;
    nameAr?: string | null;
    canonicalLevel?: number;
    scopeLevelCode?: string;
  };
  type?: {
    orgUnitTypeId: number;
    code: string;
    name: string;
    nameAr?: string | null;
    canonicalLevel?: number;
    scopeLevelCode?: string;
  };
  parentOrgUnitId: string | null;
  parentName?: string | null;
  parentCode?: string | null;
  code: string;
  name: string;
  nameAr?: string | null;
  shortName?: string | null;
  description?: string | null;
  depth: number;
  costCenterCode?: string | null;
  oracleOrgCode?: string | null;
  emailAddress?: string | null;
  phoneNumber?: string | null;
  head: OrgUnitHeadDto | null;
  childCount?: number;
  descendantCount?: number;
  allowsBudget?: boolean;
  allowsRequisition?: boolean;
  sortOrder: number;
  effectiveFrom: string;
  effectiveTo?: string | null;
  isActive: boolean;
  rowVersion: string;
}

export interface OrgUnitDetailDto extends OrgUnitSummaryDto {
  childCount: number;
  descendantCount: number;
  breadcrumb: OrgUnitBreadcrumbDto[];
}

export interface OrgUnitTreeNodeDto extends OrgUnitSummaryDto {
  children: OrgUnitTreeNodeDto[];
}

export type OrgUnitEntity = OrgUnitSummaryDto & {
  type?: { orgUnitTypeId: number; code: string; name: string };
};

// =============================================================================
// Managers & Assignments
// =============================================================================

export interface OrgUnitManagerDto {
  orgUnitManagerId: string;
  orgUnitId: string;
  userId: string;
  username?: string;
  userDisplayName?: string | null;
  userEmail?: string | null;
  managerRoleCode: ManagerRoleCode | string;
  isPrimary: boolean;
  effectiveFrom: string;
  effectiveTo?: string | null;
  assignmentReason?: string | null;
  isCurrent: boolean;
  isActive?: boolean;
  createdBy?: string | null;
  createdAt: string;
  updatedBy?: string | null;
  updatedAt?: string | null;
}

// =============================================================================
// Change Log
// =============================================================================

export interface OrgUnitChangeLogDto {
  changeLogId: string;
  orgUnitId: string;
  changeType: 'CREATED' | 'UPDATED' | 'MOVED' | 'ACTIVATED' | 'DEACTIVATED' | 'DELETED' | string;
  oldValues?: Record<string, any> | null;
  newValues?: Record<string, any> | null;
  affectedNodeCount: number;
  reason?: string | null;
  performedBy?: string | null;
  performedByDisplayName?: string | null;
  performedAt: string;
}

// =============================================================================
// Workflow Resolution Helpers
// =============================================================================

export interface ApprovalChainNodeDto {
  orgUnitId: string;
  code: string;
  name: string;
  nameAr?: string | null;
  depth: number;
  orgUnitTypeCode: string;
  orgUnitTypeName: string;
  head: {
    userId: string;
    displayName: string;
    email: string;
    effectiveFrom: string;
  } | null;
}

export interface BudgetOwnerDto {
  orgUnitId: string;
  code: string;
  name: string;
  nameAr?: string | null;
  orgUnitTypeCode: string;
  orgUnitTypeName: string;
  depth: number;
  costCenterCode?: string | null;
  head: OrgUnitHeadDto | null;
}

// =============================================================================
// Request Payloads (Mutations & Queries)
// =============================================================================

export interface CreateOrgUnitDto {
  orgUnitTypeId: number;
  parentOrgUnitId?: string | null;
  code: string;
  name: string;
  nameAr?: string | null;
  shortName?: string | null;
  description?: string | null;
  costCenterCode?: string | null;
  oracleOrgCode?: string | null;
  emailAddress?: string | null;
  phoneNumber?: string | null;
  sortOrder?: number;
  effectiveFrom: string;
}

export interface UpdateOrgUnitDto {
  code?: string;
  name?: string;
  nameAr?: string | null;
  shortName?: string | null;
  description?: string | null;
  costCenterCode?: string | null;
  oracleOrgCode?: string | null;
  emailAddress?: string | null;
  phoneNumber?: string | null;
  sortOrder?: number;
  effectiveFrom?: string;
  effectiveTo?: string | null;
  rowVersion: string;
}

export interface MoveOrgUnitDto {
  newParentOrgUnitId: string;
  reason?: string;
  rowVersion: string;
}

export interface DeactivateOrgUnitDto {
  effectiveTo?: string;
}

export interface AssignManagerDto {
  userId: string;
  managerRoleCode: ManagerRoleCode | string;
  isPrimary?: boolean;
  effectiveFrom: string;
  effectiveTo?: string | null;
  assignmentReason?: string | null;
}

export interface UpdateManagerDto {
  managerRoleCode?: ManagerRoleCode | string;
  isPrimary?: boolean;
  effectiveFrom?: string;
  effectiveTo?: string | null;
  assignmentReason?: string | null;
}

export interface OrgUnitListQueryDto {
  page?: number;
  pageSize?: number;
  search?: string;
  code?: string;
  depth?: number;
  orgUnitTypeId?: number;
  parentOrgUnitId?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface OrgUnitExportQueryDto {
  orgUnitTypeId?: number;
  parentOrgUnitId?: string;
  depth?: number;
  code?: string;
  search?: string;
  isActive?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ExportQueuedResponseDto {
  queued: boolean;
  jobId: string;
  totalRows: number;
  message: string;
}
