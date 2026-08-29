/**
 * Domain 3 — User Administration & Authorization: Types & Contracts
 * Matches Domain 3 Specification Section 4.6, 5, 6, 7, 8, 9
 */

// =============================================================================
// Enums & Constants
// =============================================================================

export enum UserType {
  INTERNAL = 'INTERNAL',
  VENDOR = 'VENDOR',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  PENDING_INVITE = 'PENDING_INVITE',
  INACTIVE = 'INACTIVE',
  LOCKED = 'LOCKED',
}

export enum ScopeCode {
  GLOBAL = 'GLOBAL',
  ORGANIZATION = 'ORGANIZATION',
  BUSINESS_UNIT = 'BUSINESS_UNIT',
  DEPARTMENT = 'DEPARTMENT',
  SECTION = 'SECTION',
}

export enum PermissionSource {
  ROLE = 'ROLE',
  ROLE_INHERITED = 'ROLE_INHERITED',
  OVERRIDE_GRANT = 'OVERRIDE_GRANT',
  OVERRIDE_REVOKE = 'OVERRIDE_REVOKE',
  DELEGATION = 'DELEGATION',
}

export const USER_PERMISSIONS = {
  VIEW: 'USER.VIEW',
  CREATE: 'USER.CREATE',
  UPDATE: 'USER.UPDATE',
  DEACTIVATE: 'USER.DEACTIVATE',
  REACTIVATE: 'USER.REACTIVATE',
  DELETE: 'USER.DELETE',
  UNLOCK: 'USER.UNLOCK',
  INVITE: 'USER.INVITE',
  RESET_PASSWORD: 'USER.RESET_PASSWORD',
  FORCE_PASSWORD_CHANGE: 'USER.FORCE_PASSWORD_CHANGE',
  ROLE_ASSIGN: 'USER.ROLE.ASSIGN',
  SCOPE_ASSIGN: 'USER.SCOPE.ASSIGN',
  OVERRIDE_MANAGE: 'USER.OVERRIDE.MANAGE',
  DELEGATION_MANAGE: 'USER.DELEGATION.MANAGE',
  IMPORT: 'USER.IMPORT',
  VENDORUSER_MANAGE: 'VENDORUSER.MANAGE',
} as const;

export const USER_ERROR_CODES = {
  // Section 5: User Lifecycle
  USER_EMAIL_EXISTS: 'USER_EMAIL_EXISTS',
  USER_USERNAME_EXISTS: 'USER_USERNAME_EXISTS',
  USER_TYPE_INVALID: 'USER_TYPE_INVALID',
  USER_EMPLOYEE_ID_REQUIRED: 'USER_EMPLOYEE_ID_REQUIRED',
  USER_VENDOR_INVALID: 'USER_VENDOR_INVALID',
  USER_ORG_UNIT_INVALID: 'USER_ORG_UNIT_INVALID',
  USER_SCOPE_DENIED: 'USER_SCOPE_DENIED',
  USER_SELF_ACTION: 'USER_SELF_ACTION',
  USER_LAST_ADMIN: 'USER_LAST_ADMIN',
  USER_IS_ORG_HEAD: 'USER_IS_ORG_HEAD',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  USER_INACTIVE: 'USER_INACTIVE',
  USER_LOCKED: 'USER_LOCKED',

  // Section 6: Roles & Scopes
  ROLE_NOT_FOUND: 'ROLE_NOT_FOUND',
  ROLE_ASSIGNMENT_INVALID: 'ROLE_ASSIGNMENT_INVALID',
  SCOPE_ASSIGNMENT_INVALID: 'SCOPE_ASSIGNMENT_INVALID',
  SCOPE_ORG_UNIT_INVALID: 'SCOPE_ORG_UNIT_INVALID',
  SCOPE_ESCALATION: 'SCOPE_ESCALATION',
  SCOPE_VENDOR_NOT_ALLOWED: 'SCOPE_VENDOR_NOT_ALLOWED',
  SCOPE_DUPLICATE: 'SCOPE_DUPLICATE',
  SCOPE_NOT_FOUND: 'SCOPE_NOT_FOUND',

  // Section 7: Vendor Users
  VENDOR_REQUIRED: 'VENDOR_REQUIRED',
  VENDOR_ROLE_INVALID: 'VENDOR_ROLE_INVALID',
  VENDOR_SCOPE_NOT_ALLOWED: 'VENDOR_SCOPE_NOT_ALLOWED',
  VENDOR_ORG_UNIT_NOT_ALLOWED: 'VENDOR_ORG_UNIT_NOT_ALLOWED',

  // Section 9: Delegations
  DELEGATION_SELF_NOT_ALLOWED: 'DELEGATION_SELF_NOT_ALLOWED',
  DELEGATION_INVALID_DATES: 'DELEGATION_INVALID_DATES',
  DELEGATION_OVERLAP: 'DELEGATION_OVERLAP',
  DELEGATION_INVALID_DELEGATE: 'DELEGATION_INVALID_DELEGATE',
  DELEGATION_CHAINED_NOT_ALLOWED: 'DELEGATION_CHAINED_NOT_ALLOWED',
  DELEGATION_NOT_FOUND: 'DELEGATION_NOT_FOUND',

  // Password & Invitations
  INVITATION_INVALID_OR_EXPIRED: 'INVITATION_INVALID_OR_EXPIRED',
  PASSWORD_HISTORY_VIOLATION: 'PASSWORD_HISTORY_VIOLATION',
  PASSWORD_WEAK: 'PASSWORD_WEAK',
} as const;

export type UserErrorCode = (typeof USER_ERROR_CODES)[keyof typeof USER_ERROR_CODES];

// =============================================================================
// Generic Pagination & API Responses
// =============================================================================

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiSuccessResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

// =============================================================================
// User Profiles & Details DTOs (§8)
// =============================================================================

export interface UserProfileDto {
  userProfileId: string;
  userId: string;
  firstName: string;
  lastName: string;
  displayName: string;
  phoneNumber?: string | null;
  jobTitle?: string | null;
  employeeId?: string | null;
  vendorId?: string | null;
  organizationId?: string | null;
  organizationName?: string | null;
  businessUnitId?: string | null;
  businessUnitName?: string | null;
  departmentId?: string | null;
  departmentName?: string | null;
  sectionId?: string | null;
  sectionName?: string | null;
  mustChangePassword?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserSummaryDto {
  userId: string;
  employeeId?: string | null;
  username: string;
  email: string;
  userType: UserType | string;
  isActive: boolean;
  isDeleted: boolean;
  failedLoginCount: number;
  lockedUntil?: string | null;
  status: UserStatus | string;
  profile?: UserProfileDto | null;
  roles?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface UserDetailDto extends UserSummaryDto {
  rolesList?: IUserRoleAssignmentDto[];
  scopesList?: IUserScopeAssignmentDto[];
  overridesList?: IUserOverrideAssignmentDto[];
}

export interface UserListQueryDto {
  search?: string;
  departmentId?: string;
  roleId?: string;
  role?: string;
  hasNoRole?: boolean;
  status?: 'ACTIVE' | 'INACTIVE' | 'INVITED' | 'LOCKED' | string;
  userType?: UserType | string;
  isActive?: boolean;
  isLocked?: boolean;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface CreateUserDto {
  username: string;
  email: string;
  userType: UserType | string;
  employeeId?: string;
  profile: {
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    jobTitle?: string;
    departmentId?: string;
    sectionId?: string;
    businessUnitId?: string;
    organizationId?: string;
    vendorId?: string;
  };
  initialRoleIds?: string[];
  initialScope?: {
    scopeDefinitionId: string;
    orgUnitId?: string;
    organizationId?: string;
    businessUnitId?: string;
    departmentId?: string;
    sectionId?: string;
  };
}

export interface UpdateUserDto {
  username?: string;
  email?: string;
  userType?: UserType | string;
  employeeId?: string;
  profile?: {
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    jobTitle?: string;
    departmentId?: string;
    sectionId?: string;
    businessUnitId?: string;
    organizationId?: string;
  };
}

// =============================================================================
// Section 4.6 & Section 8: Effective Permissions Contract
// =============================================================================

export interface EffectivePermissionItem {
  code: string;
  source: 'ROLE' | 'ROLE_INHERITED' | 'OVERRIDE_GRANT' | 'DELEGATION';
  via?: string;
  reason?: string;
  until?: string; // ISO String or YYYY-MM-DD
}

export interface RevokedPermissionItem {
  code: string;
  source: 'OVERRIDE_REVOKE';
  reason?: string;
}

export interface EffectivePermissionsResponse {
  permissions: EffectivePermissionItem[];
  revoked: RevokedPermissionItem[];
}

// =============================================================================
// Section 6 & 8: Role Assignments
// =============================================================================

export interface IUserRoleAssignmentDto {
  userRoleId: string;
  userId: string;
  roleId: string;
  roleCode: string;
  roleName: string;
  effectiveFrom: string;
  effectiveTo?: string | null;
  isActive: boolean;
  assignedBy?: string | null;
  assignedAt: string;
  isDirect?: boolean;
  inheritedVia?: string;
}

export interface AssignRoleDto {
  roleId: string;
  effectiveFrom?: string | Date;
  effectiveTo?: string | Date;
}

// =============================================================================
// Section 6 & 8: Organizational Scopes
// =============================================================================

export interface IUserScopeAssignmentDto {
  userOrganizationScopeId: string;
  userId: string;
  scopeDefinitionId: string;
  scopeCode: string;
  scopeName: string;
  orgUnitId?: string | null;
  organizationId?: string | null;
  businessUnitId?: string | null;
  departmentId?: string | null;
  sectionId?: string | null;
  orgUnitName?: string | null;
  orgUnitCode?: string | null;
  effectiveFrom?: string | null;
  effectiveTo?: string | null;
  isActive: boolean;
}

export interface AssignScopeDto {
  scopeDefinitionId: string;
  orgUnitId?: string;
  organizationId?: string;
  businessUnitId?: string;
  departmentId?: string;
  sectionId?: string;
  effectiveFrom?: string | Date;
  effectiveTo?: string | Date;
}

export interface ScopeCountResponseDto {
  accessibleOrgUnitsCount: number;
  scopeCode: string;
  orgUnitId?: string | null;
}

// =============================================================================
// Section 4.4 & 8: Permission Overrides
// =============================================================================

export interface IUserOverrideAssignmentDto {
  userPermissionOverrideId: string;
  userId: string;
  permissionId: string;
  permissionCode: string;
  moduleName?: string;
  actionName?: string;
  isGranted: boolean;
  reason: string;
  approvedBy?: string | null;
  effectiveFrom: string;
  effectiveTo?: string | null;
}

export interface ManageOverrideDto {
  permissionId: string;
  isGranted: boolean;
  reason: string;
  effectiveFrom?: string | Date;
  effectiveTo?: string | Date;
}

// =============================================================================
// Section 9.3 & 8: Delegations
// =============================================================================

export interface IDelegationDto {
  delegationId: string;
  fromUserId: string;
  fromUserName?: string;
  toUserId: string;
  toUserName?: string;
  startDate: string;
  endDate: string;
  reason: string;
  isActive: boolean;
  permissionIds?: string[];
  permissionCodes?: string[];
  createdAt: string;
}

export interface CreateDelegationDto {
  toUserId: string;
  startDate: string | Date;
  endDate: string | Date;
  reason: string;
  permissionIds?: string[];
}

export interface UpdateDelegationDto {
  endDate?: string | Date;
  reason?: string;
  isActive?: boolean;
}

export interface MyDelegationsResponseDto {
  granted: IDelegationDto[];
  received: IDelegationDto[];
}

// =============================================================================
// Section 7 & 8: Vendor Users
// =============================================================================

export interface VendorUserDto extends UserSummaryDto {
  vendorId: string;
  vendorName?: string;
}

export interface CreateVendorUserDto {
  username: string;
  email: string;
  vendorId: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  jobTitle?: string;
}

export interface UpdateVendorUserDto {
  email?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  jobTitle?: string;
}

// =============================================================================
// Section 5.1 & 8: User Import Submodule
// =============================================================================

export interface UserImportRowDto {
  rowNumber?: number;
  employeeId?: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  jobTitle?: string;
  departmentCode?: string;
  roles?: string[];
  scopeCode?: string;
  scopeUnitCode?: string;
}

export interface ValidateImportDto {
  rows: UserImportRowDto[];
}

export interface IRowValidationErrorDto {
  rowNumber: number;
  field: string;
  errorCode: string;
  message: string;
}

export interface ImportValidationResultDto {
  importToken: string;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  errors: IRowValidationErrorDto[];
}

export interface CommitImportDto {
  importToken: string;
}

export interface ImportCommitResultDto {
  importedCount: number;
  failedCount: number;
  createdUserIds: string[];
}

// =============================================================================
// Section 5.2, 5.3 & 8: Credentials & Public Invitations
// =============================================================================

export interface InvitationDispatchResultDto {
  success: boolean;
  message: string;
  userId: string;
  expiresAt: string;
  dispatchMode: string;
}

export interface InvitationValidationResultDto {
  valid: boolean;
  purpose: string;
  userId: string;
  username: string;
  email: string;
  displayName: string;
  expiresAt: string;
}

export interface AcceptInvitationDto {
  token: string;
  newPassword: string;
  confirmPassword?: string;
}

export interface PasswordResetRequestResultDto {
  success: boolean;
  message: string;
  expiresAt: string;
}

export interface ChangePasswordDto {
  oldPassword?: string;
  newPassword: string;
  confirmPassword?: string;
}

export interface ForceChangePasswordDto {
  newPassword: string;
}

// Backward compatibility authorization check types
export interface AuthorizationRequest {
  userId: string;
  permission: string;
  workflowState?: string;
  departmentId?: string;
  businessUnitId?: string;
}

export interface AuthorizationResult {
  authorized: boolean;
  reason?: string;
}