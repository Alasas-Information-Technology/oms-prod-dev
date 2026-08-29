import api from './axios';
import {
  PaginatedResponse,
  ApiSuccessResponse,
  UserSummaryDto,
  UserDetailDto,
  UserListQueryDto,
  CreateUserDto,
  UpdateUserDto,
  EffectivePermissionsResponse,
  IUserRoleAssignmentDto,
  AssignRoleDto,
  IUserScopeAssignmentDto,
  AssignScopeDto,
  ScopeCountResponseDto,
  IUserOverrideAssignmentDto,
  ManageOverrideDto,
  IDelegationDto,
  CreateDelegationDto,
  UpdateDelegationDto,
  MyDelegationsResponseDto,
  VendorUserDto,
  CreateVendorUserDto,
  UpdateVendorUserDto,
  ValidateImportDto,
  ImportValidationResultDto,
  CommitImportDto,
  ImportCommitResultDto,
  InvitationDispatchResultDto,
  InvitationValidationResultDto,
  AcceptInvitationDto,
  ForceChangePasswordDto,
  PasswordResetRequestResultDto,
  ChangePasswordDto,
} from '../types/authorization.types';

/**
 * Strips null values from DTO payloads before sending to backend.
 * NestJS class-validator @IsOptional() skips undefined/missing keys,
 * but @IsDateString() rejects null. This ensures null fields are omitted.
 */
function stripNullFields<T extends Record<string, unknown>>(dto: T): T {
  const cleaned = { ...dto };
  for (const key of Object.keys(cleaned)) {
    if (cleaned[key] === null || cleaned[key] === undefined) {
      delete cleaned[key];
    }
  }
  return cleaned as T;
}

// =============================================================================
// 1. Users & Profile API
// =============================================================================

export const usersApi = {
  /**
   * Retrieves paginated list of internal users with search/filter criteria.
   */
  getUsers: async (query?: UserListQueryDto): Promise<PaginatedResponse<UserSummaryDto>> => {
    const response = await api.get('/authorization/users', { params: query });
    const res = response.data;
    if (Array.isArray(res)) {
      return {
        data: res,
        meta: {
          total: res.length,
          page: query?.page || 1,
          pageSize: query?.pageSize || 10,
          totalPages: 1,
        },
      };
    }
    if (Array.isArray(res?.data)) {
      return {
        data: res.data,
        meta: res.meta?.pagination || res.meta || {
          total: res.data.length,
          page: query?.page || 1,
          pageSize: query?.pageSize || 10,
          totalPages: 1,
        },
      };
    }
    if (Array.isArray(res?.data?.items)) {
      return {
        data: res.data.items,
        meta: {
          total: res.data.total ?? res.data.items.length,
          page: res.data.page ?? query?.page ?? 1,
          pageSize: res.data.limit ?? res.data.pageSize ?? query?.pageSize ?? 10,
          totalPages: res.data.totalPages ?? 1,
        },
      };
    }
    if (Array.isArray(res?.items)) {
      return {
        data: res.items,
        meta: {
          total: res.total ?? res.items.length,
          page: res.page ?? query?.page ?? 1,
          pageSize: res.limit ?? res.pageSize ?? query?.pageSize ?? 10,
          totalPages: res.totalPages ?? 1,
        },
      };
    }
    return {
      data: res?.data || [],
      meta: res?.meta || { total: 0, page: 1, pageSize: 10, totalPages: 1 },
    };
  },

  /**
   * Retrieves single user details including profile, roles, and scopes.
   */
  getUserById: async (id: string): Promise<UserDetailDto> => {
    const response = await api.get(`/authorization/users/${id}`);
    const res = response.data;
    return res?.data ?? res;
  },

  /**
   * Creates a new internal user account.
   */
  createUser: async (dto: CreateUserDto): Promise<UserDetailDto> => {
    const response = await api.post('/authorization/users', dto);
    const res = response.data;
    return res?.data ?? res;
  },

  /**
   * Updates an existing user profile.
   */
  updateUser: async (id: string, dto: UpdateUserDto): Promise<UserDetailDto> => {
    const response = await api.patch(`/authorization/users/${id}`, dto);
    const res = response.data;
    return res?.data ?? res;
  },

  /**
   * Deactivates a user account immediately.
   */
  deactivateUser: async (id: string): Promise<ApiSuccessResponse> => {
    const response = await api.post(`/authorization/users/${id}/deactivate`);
    return response.data;
  },

  /**
   * Reactivates a suspended user account.
   */
  reactivateUser: async (id: string): Promise<ApiSuccessResponse> => {
    const response = await api.post(`/authorization/users/${id}/reactivate`);
    return response.data;
  },

  /**
   * Forcibly changes the password for a user.
   */
  forceChangePassword: async (id: string, dto: ForceChangePasswordDto): Promise<ApiSuccessResponse> => {
    const response = await api.post(`/authorization/users/${id}/force-password`, dto);
    return response.data;
  },

  /**
   * Soft deletes a user account.
   */
  deleteUser: async (id: string): Promise<ApiSuccessResponse> => {
    const response = await api.delete(`/authorization/users/${id}`);
    return response.data;
  },

  /**
   * Unlocks an account locked due to excessive failed login attempts.
   */
  unlockUser: async (id: string): Promise<ApiSuccessResponse> => {
    const response = await api.post(`/authorization/users/${id}/unlock`);
    return response.data;
  },

  /**
   * Retrieves full effective permissions audit preview (Section 4.6).
   */
  getEffectivePermissions: async (id: string): Promise<EffectivePermissionsResponse> => {
    const response = await api.get(`/authorization/users/${id}/effective-permissions`);
    const res = response.data;
    return res?.data ?? res;
  },
};

// =============================================================================
// 2. User Credentials & Invitations API
// =============================================================================

export const userCredentialsApi = {
  /**
   * Issues or re-sends an onboarding invitation token.
   */
  inviteUser: async (id: string, resend = false): Promise<InvitationDispatchResultDto> => {
    const response = await api.post(`/authorization/users/${id}/invite`, { resend });
    return response.data;
  },

  /**
   * Initiates an administrative password reset invitation.
   */
  resetPassword: async (id: string): Promise<PasswordResetRequestResultDto> => {
    const response = await api.post(`/authorization/users/${id}/reset-password`);
    return response.data;
  },

  /**
   * Validates a public invitation token.
   */
  validateInvitation: async (token: string): Promise<InvitationValidationResultDto> => {
    const response = await api.get('/authorization/invitations/validate', {
      params: { token },
    });
    return response.data;
  },

  /**
   * Consumes an invitation token and establishes initial password.
   */
  acceptInvitation: async (dto: AcceptInvitationDto): Promise<ApiSuccessResponse> => {
    const response = await api.post('/authorization/invitations/accept', dto);
    return response.data;
  },

  /**
   * Changes current password for authenticated session.
   */
  changePassword: async (dto: ChangePasswordDto): Promise<ApiSuccessResponse> => {
    const response = await api.post('/authorization/credentials/change-password', dto);
    return response.data;
  },

  /**
   * Retrieves active session list for a user.
   */
  getUserSessions: async (userId: string): Promise<Record<string, unknown>[]> => {
    const response = await api.get(`/internal/security/settings/users/${userId}/sessions`);
    return response.data;
  },

  /**
   * Revokes all active sessions for a user (sign out everywhere).
   */
  revokeUserSessions: async (userId: string): Promise<ApiSuccessResponse> => {
    const response = await api.post(`/internal/security/settings/users/${userId}/logout-all`);
    return response.data;
  },
};

// =============================================================================
// 3. User Roles API
// =============================================================================

export const userRolesApi = {
  /**
   * Retrieves all master roles available in the system.
   */
  getMasterRoles: async (): Promise<Array<{ roleId: string; roleCode: string; roleName: string; description?: string; isSystemRole: boolean; isActive: boolean }>> => {
    const response = await api.get('/authorization/roles');
    const res = response.data;
    if (Array.isArray(res)) return res;
    if (Array.isArray(res?.data)) return res.data;
    return [];
  },

  /**
   * Retrieves all role assignments for a user.
   */
  getRoles: async (userId: string): Promise<IUserRoleAssignmentDto[]> => {
    const response = await api.get(`/authorization/users/${userId}/roles`);
    const res = response.data;
    if (Array.isArray(res)) return res;
    if (Array.isArray(res?.data)) return res.data;
    if (Array.isArray(res?.data?.items)) return res.data.items;
    if (Array.isArray(res?.items)) return res.items;
    return [];
  },

  /**
   * Assigns a role to a user.
   */
  assignRole: async (userId: string, dto: AssignRoleDto): Promise<IUserRoleAssignmentDto> => {
    const response = await api.post(`/authorization/users/${userId}/roles`, stripNullFields(dto as unknown as Record<string, unknown>));
    const res = response.data;
    return res?.data ?? res;
  },

  /**
   * Revokes a role assignment by setting EffectiveTo = now.
   */
  revokeRole: async (userId: string, roleId: string): Promise<ApiSuccessResponse> => {
    const response = await api.delete(`/authorization/users/${userId}/roles/${roleId}`);
    return response.data;
  },
};

// =============================================================================
// 4. User Organizational Scopes API
// =============================================================================

export const userScopesApi = {
  /**
   * Retrieves all organizational scope assignments for a user.
   */
  getScopes: async (userId: string): Promise<IUserScopeAssignmentDto[]> => {
    const response = await api.get(`/authorization/users/${userId}/scopes`);
    const res = response.data;
    if (Array.isArray(res)) return res;
    if (Array.isArray(res?.data)) return res.data;
    if (Array.isArray(res?.data?.items)) return res.data.items;
    if (Array.isArray(res?.items)) return res.items;
    return [];
  },

  /**
   * Assigns an organizational scope to a user.
   */
  assignScope: async (userId: string, dto: AssignScopeDto): Promise<IUserScopeAssignmentDto> => {
    const response = await api.post(`/authorization/users/${userId}/scopes`, stripNullFields(dto as unknown as Record<string, unknown>));
    const res = response.data;
    return res?.data ?? res;
  },

  /**
   * Revokes a scope assignment.
   */
  revokeScope: async (userId: string, scopeId: string): Promise<ApiSuccessResponse> => {
    const response = await api.delete(`/authorization/users/${userId}/scopes/${scopeId}`);
    return response.data;
  },

  /**
   * Previews the count of accessible organizational units for a proposed scope.
   */
  previewCoverage: async (
    scopeDefinitionId: string,
    orgUnitId?: string,
  ): Promise<ScopeCountResponseDto> => {
    const response = await api.get('/authorization/users/scopes/preview-coverage', {
      params: { scopeDefinitionId, orgUnitId },
    });
    return response.data;
  },
};

// =============================================================================
// 5. User Permission Overrides API
// =============================================================================

export const userOverridesApi = {
  /**
   * Retrieves all permission overrides for a user.
   */
  getOverrides: async (userId: string): Promise<IUserOverrideAssignmentDto[]> => {
    const response = await api.get(`/authorization/users/${userId}/overrides`);
    return response.data;
  },

  /**
   * Creates a grant or revoke permission override (mandatory Reason).
   */
  createOverride: async (
    userId: string,
    dto: ManageOverrideDto,
  ): Promise<IUserOverrideAssignmentDto> => {
    const response = await api.post(`/authorization/users/${userId}/overrides`, stripNullFields(dto as unknown as Record<string, unknown>));
    return response.data;
  },

  /**
   * Revokes a permission override.
   */
  revokeOverride: async (userId: string, overrideId: string): Promise<ApiSuccessResponse> => {
    const response = await api.delete(`/authorization/users/${userId}/overrides/${overrideId}`);
    return response.data;
  },
};

// =============================================================================
// 6. Delegations API
// =============================================================================

export const delegationsApi = {
  /**
   * Retrieves active received and granted delegations for the calling user.
   */
  getMyDelegations: async (): Promise<MyDelegationsResponseDto> => {
    const response = await api.get('/authorization/me/delegations');
    return response.data;
  },

  /**
   * Retrieves all delegations granted by a target user.
   */
  getUserDelegations: async (userId: string): Promise<IDelegationDto[]> => {
    const response = await api.get(`/authorization/users/${userId}/delegations`);
    return response.data;
  },

  /**
   * Creates a delegation of authority from a user.
   */
  createDelegation: async (userId: string, dto: CreateDelegationDto): Promise<IDelegationDto> => {
    const response = await api.post(`/authorization/users/${userId}/delegations`, dto);
    return response.data;
  },

  /**
   * Updates an existing delegation.
   */
  updateDelegation: async (id: string, dto: UpdateDelegationDto): Promise<IDelegationDto> => {
    const response = await api.patch(`/authorization/delegations/${id}`, dto);
    return response.data;
  },

  /**
   * Cancels/ends an active delegation immediately.
   */
  cancelDelegation: async (id: string): Promise<ApiSuccessResponse> => {
    const response = await api.delete(`/authorization/delegations/${id}`);
    return response.data;
  },
};

// =============================================================================
// 7. Vendor Users API
// =============================================================================

export const vendorUsersApi = {
  /**
   * Lists all active vendor users (isolated from internal users).
   */
  getVendorUsers: async (): Promise<VendorUserDto[]> => {
    const response = await api.get('/authorization/vendor-users');
    const res = response.data;
    if (Array.isArray(res)) return res;
    if (Array.isArray(res?.data)) return res.data;
    if (Array.isArray(res?.data?.items)) return res.data.items;
    if (Array.isArray(res?.items)) return res.items;
    return [];
  },

  /**
   * Retrieves single vendor user details.
   */
  getVendorUserById: async (id: string): Promise<VendorUserDto> => {
    const response = await api.get(`/authorization/vendor-users/${id}`);
    const res = response.data;
    return res?.data ?? res;
  },

  /**
   * Creates a new vendor user.
   */
  createVendorUser: async (dto: CreateVendorUserDto): Promise<VendorUserDto> => {
    const response = await api.post('/authorization/vendor-users', dto);
    const res = response.data;
    return res?.data ?? res;
  },

  /**
   * Updates vendor user profile fields.
   */
  updateVendorUser: async (id: string, dto: UpdateVendorUserDto): Promise<VendorUserDto> => {
    const response = await api.patch(`/authorization/vendor-users/${id}`, dto);
    return response.data;
  },

  /**
   * Deactivates a single vendor user.
   */
  deactivateVendorUser: async (id: string): Promise<ApiSuccessResponse> => {
    const response = await api.post(`/authorization/vendor-users/${id}/deactivate`);
    return response.data;
  },

  /**
   * Deactivates all users associated with a specific vendor (Rule V10).
   */
  deactivateVendorAll: async (vendorId: string): Promise<ApiSuccessResponse> => {
    const response = await api.post(`/authorization/vendor-users/vendors/${vendorId}/deactivate`);
    return response.data;
  },
};

// =============================================================================
// 8. User Import API
// =============================================================================

export const userImportApi = {
  /**
   * Downloads the official CSV template for bulk user import.
   */
  downloadTemplate: async (): Promise<Blob> => {
    const response = await api.get('/authorization/users/import/template', {
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * Phase 1: Validates bulk import batch against all rules and returns validation token.
   */
  validateImport: async (dto: ValidateImportDto): Promise<ImportValidationResultDto> => {
    const response = await api.post('/authorization/users/import/validate', dto);
    return response.data;
  },

  /**
   * Phase 2: Atomically commits validated batch using the validation token.
   */
  commitImport: async (dto: CommitImportDto): Promise<ImportCommitResultDto> => {
    const response = await api.post('/authorization/users/import/commit', dto);
    return response.data;
  },
};
