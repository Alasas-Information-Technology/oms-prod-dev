import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions,
} from '@tanstack/react-query';
import {
  usersApi,
  userCredentialsApi,
  userRolesApi,
  userScopesApi,
  userOverridesApi,
  delegationsApi,
  vendorUsersApi,
  userImportApi,
} from '@/lib/api/authorization';
import {
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
  PasswordResetRequestResultDto,
  AcceptInvitationDto,
  ChangePasswordDto,
  PaginatedResponse,
  ApiSuccessResponse,
} from '@/lib/types/authorization.types';

// =============================================================================
// Query Keys Factory
// =============================================================================

export const authKeys = {
  all: ['authorization'] as const,

  // Users
  users: () => [...authKeys.all, 'users'] as const,
  usersList: (query?: UserListQueryDto) =>
    [...authKeys.users(), 'list', query ?? {}] as const,
  userDetail: (id?: string) =>
    [...authKeys.users(), 'detail', id ?? ''] as const,
  effectivePermissions: (id?: string) =>
    [...authKeys.userDetail(id), 'effectivePermissions'] as const,

  // User Assignments
  userRoles: (id?: string) => [...authKeys.userDetail(id), 'roles'] as const,
  userScopes: (id?: string) => [...authKeys.userDetail(id), 'scopes'] as const,
  userOverrides: (id?: string) =>
    [...authKeys.userDetail(id), 'overrides'] as const,
  userDelegations: (id?: string) =>
    [...authKeys.userDetail(id), 'delegations'] as const,

  // Scope Coverage Preview
  scopeCoveragePreview: (scopeDefId?: string, orgUnitId?: string) =>
    [
      ...authKeys.all,
      'scopes',
      'preview',
      { scopeDefId, orgUnitId: orgUnitId ?? null },
    ] as const,

  // Delegations
  delegations: () => [...authKeys.all, 'delegations'] as const,
  myDelegations: () => [...authKeys.delegations(), 'me'] as const,

  // Vendor Users
  vendorUsers: () => [...authKeys.all, 'vendorUsers'] as const,
  vendorUsersList: () => [...authKeys.vendorUsers(), 'list'] as const,
  vendorUserDetail: (id?: string) =>
    [...authKeys.vendorUsers(), 'detail', id ?? ''] as const,
};

// =============================================================================
// 1. Users & Profile Hooks
// =============================================================================

export function useUsers(
  query?: UserListQueryDto,
  options?: Omit<
    UseQueryOptions<PaginatedResponse<UserSummaryDto>, Error>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery({
    queryKey: authKeys.usersList(query),
    queryFn: () => usersApi.getUsers(query),
    ...options,
  });
}

export function useUserDetail(
  id?: string,
  options?: Omit<
    UseQueryOptions<UserDetailDto, Error>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery({
    queryKey: authKeys.userDetail(id),
    queryFn: () => (id ? usersApi.getUserById(id) : Promise.reject('No ID')),
    enabled: Boolean(id) && (options?.enabled ?? true),
    ...options,
  });
}

export function useEffectivePermissions(
  id?: string,
  options?: Omit<
    UseQueryOptions<EffectivePermissionsResponse, Error>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery({
    queryKey: authKeys.effectivePermissions(id),
    queryFn: () =>
      id ? usersApi.getEffectivePermissions(id) : Promise.reject('No ID'),
    enabled: Boolean(id) && (options?.enabled ?? true),
    ...options,
  });
}

export function useCreateUser(
  options?: UseMutationOptions<UserDetailDto, Error, CreateUserDto>,
) {
  const queryClient = useQueryClient();
  const { onSuccess, ...restOptions } = options || {};

  return useMutation({
    mutationFn: usersApi.createUser,
    onSuccess: async (data, variables, context, mutation) => {
      queryClient.invalidateQueries({ queryKey: authKeys.users() });
      if (onSuccess) {
        await onSuccess(data, variables, context, mutation);
      }
    },
    ...restOptions,
  });
}

export function useUpdateUser(
  options?: UseMutationOptions<
    UserDetailDto,
    Error,
    { id: string; dto: UpdateUserDto }
  >,
) {
  const queryClient = useQueryClient();
  const { onSuccess, ...restOptions } = options || {};

  return useMutation({
    mutationFn: ({ id, dto }) => usersApi.updateUser(id, dto),
    onSuccess: async (data, variables, context, mutation) => {
      queryClient.invalidateQueries({
        queryKey: authKeys.userDetail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: authKeys.usersList() });
      if (onSuccess) {
        await onSuccess(data, variables, context, mutation);
      }
    },
    ...restOptions,
  });
}

export function useDeactivateUser(
  options?: UseMutationOptions<ApiSuccessResponse, Error, string>,
) {
  const queryClient = useQueryClient();
  const { onSuccess, ...restOptions } = options || {};

  return useMutation({
    mutationFn: usersApi.deactivateUser,
    onSuccess: async (data, userId, context, mutation) => {
      queryClient.invalidateQueries({
        queryKey: authKeys.userDetail(userId),
      });
      queryClient.invalidateQueries({
        queryKey: authKeys.effectivePermissions(userId),
      });
      queryClient.invalidateQueries({ queryKey: authKeys.usersList() });
      if (onSuccess) {
        await onSuccess(data, userId, context, mutation);
      }
    },
    ...restOptions,
  });
}

export function useReactivateUser(
  options?: UseMutationOptions<ApiSuccessResponse, Error, string>,
) {
  const queryClient = useQueryClient();
  const { onSuccess, ...restOptions } = options || {};

  return useMutation({
    mutationFn: usersApi.reactivateUser,
    onSuccess: async (data, userId, context, mutation) => {
      queryClient.invalidateQueries({
        queryKey: authKeys.userDetail(userId),
      });
      queryClient.invalidateQueries({
        queryKey: authKeys.effectivePermissions(userId),
      });
      queryClient.invalidateQueries({ queryKey: authKeys.usersList() });
      if (onSuccess) {
        await onSuccess(data, userId, context, mutation);
      }
    },
    ...restOptions,
  });
}

export function useDeleteUser(
  options?: UseMutationOptions<ApiSuccessResponse, Error, string>,
) {
  const queryClient = useQueryClient();
  const { onSuccess, ...restOptions } = options || {};

  return useMutation({
    mutationFn: usersApi.deleteUser,
    onSuccess: async (data, userId, context, mutation) => {
      queryClient.invalidateQueries({
        queryKey: authKeys.userDetail(userId),
      });
      queryClient.invalidateQueries({ queryKey: authKeys.usersList() });
      if (onSuccess) {
        await onSuccess(data, userId, context, mutation);
      }
    },
    ...restOptions,
  });
}

export function useUnlockUser(
  options?: UseMutationOptions<ApiSuccessResponse, Error, string>,
) {
  const queryClient = useQueryClient();
  const { onSuccess, ...restOptions } = options || {};

  return useMutation({
    mutationFn: usersApi.unlockUser,
    onSuccess: async (data, userId, context, mutation) => {
      queryClient.invalidateQueries({
        queryKey: authKeys.userDetail(userId),
      });
      queryClient.invalidateQueries({ queryKey: authKeys.usersList() });
      if (onSuccess) {
        await onSuccess(data, userId, context, mutation);
      }
    },
    ...restOptions,
  });
}

// =============================================================================
// 2. User Credentials & Invitations Hooks
// =============================================================================

export function useInviteUser(
  options?: UseMutationOptions<
    InvitationDispatchResultDto,
    Error,
    { id: string; resend?: boolean }
  >,
) {
  const queryClient = useQueryClient();
  const { onSuccess, ...restOptions } = options || {};

  return useMutation({
    mutationFn: ({ id, resend }) => userCredentialsApi.inviteUser(id, resend),
    onSuccess: async (data, variables, context, mutation) => {
      queryClient.invalidateQueries({
        queryKey: authKeys.userDetail(variables.id),
      });
      if (onSuccess) {
        await onSuccess(data, variables, context, mutation);
      }
    },
    ...restOptions,
  });
}

export function useResetPassword(
  options?: UseMutationOptions<PasswordResetRequestResultDto, Error, string>,
) {
  return useMutation({
    mutationFn: userCredentialsApi.resetPassword,
    ...options,
  });
}

export function useValidateInvitation(
  token?: string,
  options?: Omit<
    UseQueryOptions<InvitationValidationResultDto, Error>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery({
    queryKey: ['invitation', 'validate', token],
    queryFn: () =>
      token
        ? userCredentialsApi.validateInvitation(token)
        : Promise.reject('No token'),
    enabled: Boolean(token) && (options?.enabled ?? true),
    staleTime: 0,
    ...options,
  });
}

export function useAcceptInvitation(
  options?: UseMutationOptions<ApiSuccessResponse, Error, AcceptInvitationDto>,
) {
  return useMutation({
    mutationFn: userCredentialsApi.acceptInvitation,
    ...options,
  });
}

export function useChangePassword(
  options?: UseMutationOptions<ApiSuccessResponse, Error, ChangePasswordDto>,
) {
  return useMutation({
    mutationFn: userCredentialsApi.changePassword,
    ...options,
  });
}

export function useUserSessions(
  userId?: string,
  options?: Omit<UseQueryOptions<Record<string, unknown>[], Error>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: ['userSessions', userId],
    queryFn: () => (userId ? userCredentialsApi.getUserSessions(userId) : Promise.resolve([])),
    enabled: Boolean(userId) && (options?.enabled ?? true),
    ...options,
  });
}

export function useRevokeUserSessions(
  options?: UseMutationOptions<ApiSuccessResponse, Error, string>,
) {
  const queryClient = useQueryClient();
  const { onSuccess, ...restOptions } = options || {};

  return useMutation({
    mutationFn: (userId: string) => userCredentialsApi.revokeUserSessions(userId),
    onSuccess: async (data, userId, context, mutation) => {
      queryClient.invalidateQueries({ queryKey: ['userSessions', userId] });
      queryClient.invalidateQueries({ queryKey: authKeys.userDetail(userId) });
      if (onSuccess) {
        await onSuccess(data, userId, context, mutation);
      }
    },
    ...restOptions,
  });
}

// =============================================================================
// 3. User Roles Hooks & Cache Invalidation
// =============================================================================

export function useUserRoles(
  userId?: string,
  options?: Omit<
    UseQueryOptions<IUserRoleAssignmentDto[], Error>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery({
    queryKey: authKeys.userRoles(userId),
    queryFn: () =>
      userId ? userRolesApi.getRoles(userId) : Promise.reject('No user ID'),
    enabled: Boolean(userId) && (options?.enabled ?? true),
    ...options,
  });
}

export function useAssignRole(
  options?: UseMutationOptions<
    IUserRoleAssignmentDto,
    Error,
    { userId: string; dto: AssignRoleDto }
  >,
) {
  const queryClient = useQueryClient();
  const { onSuccess, ...restOptions } = options || {};

  return useMutation({
    mutationFn: ({ userId, dto }) => userRolesApi.assignRole(userId, dto),
    onSuccess: async (data, variables, context, mutation) => {
      // Invalidate roles, effective permissions, user detail, and user list
      queryClient.invalidateQueries({
        queryKey: authKeys.userRoles(variables.userId),
      });
      queryClient.invalidateQueries({
        queryKey: authKeys.effectivePermissions(variables.userId),
      });
      queryClient.invalidateQueries({
        queryKey: authKeys.userDetail(variables.userId),
      });
      queryClient.invalidateQueries({ queryKey: authKeys.usersList() });
      if (onSuccess) {
        await onSuccess(data, variables, context, mutation);
      }
    },
    ...restOptions,
  });
}

export function useRevokeRole(
  options?: UseMutationOptions<
    ApiSuccessResponse,
    Error,
    { userId: string; roleId: string }
  >,
) {
  const queryClient = useQueryClient();
  const { onSuccess, ...restOptions } = options || {};

  return useMutation({
    mutationFn: ({ userId, roleId }) =>
      userRolesApi.revokeRole(userId, roleId),
    onSuccess: async (data, variables, context, mutation) => {
      // Invalidate roles, effective permissions, user detail, and user list
      queryClient.invalidateQueries({
        queryKey: authKeys.userRoles(variables.userId),
      });
      queryClient.invalidateQueries({
        queryKey: authKeys.effectivePermissions(variables.userId),
      });
      queryClient.invalidateQueries({
        queryKey: authKeys.userDetail(variables.userId),
      });
      queryClient.invalidateQueries({ queryKey: authKeys.usersList() });
      if (onSuccess) {
        await onSuccess(data, variables, context, mutation);
      }
    },
    ...restOptions,
  });
}

export function useMasterRoles() {
  return useQuery({
    queryKey: ['masterRoles'],
    queryFn: () => userRolesApi.getMasterRoles(),
    staleTime: 5 * 60 * 1000,
  });
}

// =============================================================================
// 4. User Organizational Scopes Hooks & Cache Invalidation
// =============================================================================

export function useUserScopes(
  userId?: string,
  options?: Omit<
    UseQueryOptions<IUserScopeAssignmentDto[], Error>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery({
    queryKey: authKeys.userScopes(userId),
    queryFn: () =>
      userId ? userScopesApi.getScopes(userId) : Promise.reject('No user ID'),
    enabled: Boolean(userId) && (options?.enabled ?? true),
    ...options,
  });
}

export function useAssignScope(
  options?: UseMutationOptions<
    IUserScopeAssignmentDto,
    Error,
    { userId: string; dto: AssignScopeDto }
  >,
) {
  const queryClient = useQueryClient();
  const { onSuccess, ...restOptions } = options || {};

  return useMutation({
    mutationFn: ({ userId, dto }) => userScopesApi.assignScope(userId, dto),
    onSuccess: async (data, variables, context, mutation) => {
      // Invalidate scopes, effective permissions, user detail, and user list
      queryClient.invalidateQueries({
        queryKey: authKeys.userScopes(variables.userId),
      });
      queryClient.invalidateQueries({
        queryKey: authKeys.effectivePermissions(variables.userId),
      });
      queryClient.invalidateQueries({
        queryKey: authKeys.userDetail(variables.userId),
      });
      queryClient.invalidateQueries({ queryKey: authKeys.usersList() });
      if (onSuccess) {
        await onSuccess(data, variables, context, mutation);
      }
    },
    ...restOptions,
  });
}

export function useRevokeScope(
  options?: UseMutationOptions<
    ApiSuccessResponse,
    Error,
    { userId: string; scopeId: string }
  >,
) {
  const queryClient = useQueryClient();
  const { onSuccess, ...restOptions } = options || {};

  return useMutation({
    mutationFn: ({ userId, scopeId }) =>
      userScopesApi.revokeScope(userId, scopeId),
    onSuccess: async (data, variables, context, mutation) => {
      // Invalidate scopes, effective permissions, user detail, and user list
      queryClient.invalidateQueries({
        queryKey: authKeys.userScopes(variables.userId),
      });
      queryClient.invalidateQueries({
        queryKey: authKeys.effectivePermissions(variables.userId),
      });
      queryClient.invalidateQueries({
        queryKey: authKeys.userDetail(variables.userId),
      });
      queryClient.invalidateQueries({ queryKey: authKeys.usersList() });
      if (onSuccess) {
        await onSuccess(data, variables, context, mutation);
      }
    },
    ...restOptions,
  });
}

export function useScopeCoveragePreview(
  scopeDefinitionId?: string,
  orgUnitId?: string,
  options?: Omit<
    UseQueryOptions<ScopeCountResponseDto, Error>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery({
    queryKey: authKeys.scopeCoveragePreview(scopeDefinitionId, orgUnitId),
    queryFn: () =>
      scopeDefinitionId
        ? userScopesApi.previewCoverage(scopeDefinitionId, orgUnitId)
        : Promise.reject('No scopeDefinitionId'),
    enabled: Boolean(scopeDefinitionId) && (options?.enabled ?? true),
    ...options,
  });
}

// =============================================================================
// 5. User Permission Overrides Hooks & Cache Invalidation
// =============================================================================

export function useUserOverrides(
  userId?: string,
  options?: Omit<
    UseQueryOptions<IUserOverrideAssignmentDto[], Error>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery({
    queryKey: authKeys.userOverrides(userId),
    queryFn: () =>
      userId
        ? userOverridesApi.getOverrides(userId)
        : Promise.reject('No user ID'),
    enabled: Boolean(userId) && (options?.enabled ?? true),
    ...options,
  });
}

export function useCreateOverride(
  options?: UseMutationOptions<
    IUserOverrideAssignmentDto,
    Error,
    { userId: string; dto: ManageOverrideDto }
  >,
) {
  const queryClient = useQueryClient();
  const { onSuccess, ...restOptions } = options || {};

  return useMutation({
    mutationFn: ({ userId, dto }) =>
      userOverridesApi.createOverride(userId, dto),
    onSuccess: async (data, variables, context, mutation) => {
      // Invalidate overrides, effective permissions, user detail, and user list
      queryClient.invalidateQueries({
        queryKey: authKeys.userOverrides(variables.userId),
      });
      queryClient.invalidateQueries({
        queryKey: authKeys.effectivePermissions(variables.userId),
      });
      queryClient.invalidateQueries({
        queryKey: authKeys.userDetail(variables.userId),
      });
      queryClient.invalidateQueries({ queryKey: authKeys.usersList() });
      if (onSuccess) {
        await onSuccess(data, variables, context, mutation);
      }
    },
    ...restOptions,
  });
}

export function useRevokeOverride(
  options?: UseMutationOptions<
    ApiSuccessResponse,
    Error,
    { userId: string; overrideId: string }
  >,
) {
  const queryClient = useQueryClient();
  const { onSuccess, ...restOptions } = options || {};

  return useMutation({
    mutationFn: ({ userId, overrideId }) =>
      userOverridesApi.revokeOverride(userId, overrideId),
    onSuccess: async (data, variables, context, mutation) => {
      // Invalidate overrides, effective permissions, user detail, and user list
      queryClient.invalidateQueries({
        queryKey: authKeys.userOverrides(variables.userId),
      });
      queryClient.invalidateQueries({
        queryKey: authKeys.effectivePermissions(variables.userId),
      });
      queryClient.invalidateQueries({
        queryKey: authKeys.userDetail(variables.userId),
      });
      queryClient.invalidateQueries({ queryKey: authKeys.usersList() });
      if (onSuccess) {
        await onSuccess(data, variables, context, mutation);
      }
    },
    ...restOptions,
  });
}

// =============================================================================
// 6. Delegations Hooks
// =============================================================================

export function useMyDelegations(
  options?: Omit<
    UseQueryOptions<MyDelegationsResponseDto, Error>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery({
    queryKey: authKeys.myDelegations(),
    queryFn: delegationsApi.getMyDelegations,
    ...options,
  });
}

export function useUserDelegations(
  userId?: string,
  options?: Omit<
    UseQueryOptions<IDelegationDto[], Error>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery({
    queryKey: authKeys.userDelegations(userId),
    queryFn: () =>
      userId
        ? delegationsApi.getUserDelegations(userId)
        : Promise.reject('No user ID'),
    enabled: Boolean(userId) && (options?.enabled ?? true),
    ...options,
  });
}

export function useCreateDelegation(
  options?: UseMutationOptions<
    IDelegationDto,
    Error,
    { userId: string; dto: CreateDelegationDto }
  >,
) {
  const queryClient = useQueryClient();
  const { onSuccess, ...restOptions } = options || {};

  return useMutation({
    mutationFn: ({ userId, dto }) =>
      delegationsApi.createDelegation(userId, dto),
    onSuccess: async (data, variables, context, mutation) => {
      queryClient.invalidateQueries({ queryKey: authKeys.myDelegations() });
      queryClient.invalidateQueries({
        queryKey: authKeys.userDelegations(variables.userId),
      });
      queryClient.invalidateQueries({
        queryKey: authKeys.effectivePermissions(variables.dto.toUserId),
      });
      if (onSuccess) {
        await onSuccess(data, variables, context, mutation);
      }
    },
    ...restOptions,
  });
}

export function useUpdateDelegation(
  options?: UseMutationOptions<
    IDelegationDto,
    Error,
    { id: string; dto: UpdateDelegationDto }
  >,
) {
  const queryClient = useQueryClient();
  const { onSuccess, ...restOptions } = options || {};

  return useMutation({
    mutationFn: ({ id, dto }) => delegationsApi.updateDelegation(id, dto),
    onSuccess: async (data, variables, context, mutation) => {
      queryClient.invalidateQueries({ queryKey: authKeys.delegations() });
      if (onSuccess) {
        await onSuccess(data, variables, context, mutation);
      }
    },
    ...restOptions,
  });
}

export function useCancelDelegation(
  options?: UseMutationOptions<ApiSuccessResponse, Error, string>,
) {
  const queryClient = useQueryClient();
  const { onSuccess, ...restOptions } = options || {};

  return useMutation({
    mutationFn: delegationsApi.cancelDelegation,
    onSuccess: async (data, delegationId, context, mutation) => {
      queryClient.invalidateQueries({ queryKey: authKeys.delegations() });
      if (onSuccess) {
        await onSuccess(data, delegationId, context, mutation);
      }
    },
    ...restOptions,
  });
}

// =============================================================================
// 7. Vendor Users Hooks
// =============================================================================

export function useVendorUsers(
  options?: Omit<
    UseQueryOptions<VendorUserDto[], Error>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery({
    queryKey: authKeys.vendorUsersList(),
    queryFn: vendorUsersApi.getVendorUsers,
    ...options,
  });
}

export function useVendorUserDetail(
  id?: string,
  options?: Omit<
    UseQueryOptions<VendorUserDto, Error>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery({
    queryKey: authKeys.vendorUserDetail(id),
    queryFn: () =>
      id ? vendorUsersApi.getVendorUserById(id) : Promise.reject('No ID'),
    enabled: Boolean(id) && (options?.enabled ?? true),
    ...options,
  });
}

export function useCreateVendorUser(
  options?: UseMutationOptions<VendorUserDto, Error, CreateVendorUserDto>,
) {
  const queryClient = useQueryClient();
  const { onSuccess, ...restOptions } = options || {};

  return useMutation({
    mutationFn: vendorUsersApi.createVendorUser,
    onSuccess: async (data, variables, context, mutation) => {
      queryClient.invalidateQueries({ queryKey: authKeys.vendorUsers() });
      if (onSuccess) {
        await onSuccess(data, variables, context, mutation);
      }
    },
    ...restOptions,
  });
}

export function useUpdateVendorUser(
  options?: UseMutationOptions<
    VendorUserDto,
    Error,
    { id: string; dto: UpdateVendorUserDto }
  >,
) {
  const queryClient = useQueryClient();
  const { onSuccess, ...restOptions } = options || {};

  return useMutation({
    mutationFn: ({ id, dto }) => vendorUsersApi.updateVendorUser(id, dto),
    onSuccess: async (data, variables, context, mutation) => {
      queryClient.invalidateQueries({
        queryKey: authKeys.vendorUserDetail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: authKeys.vendorUsersList() });
      if (onSuccess) {
        await onSuccess(data, variables, context, mutation);
      }
    },
    ...restOptions,
  });
}

export function useDeactivateVendorUser(
  options?: UseMutationOptions<ApiSuccessResponse, Error, string>,
) {
  const queryClient = useQueryClient();
  const { onSuccess, ...restOptions } = options || {};

  return useMutation({
    mutationFn: vendorUsersApi.deactivateVendorUser,
    onSuccess: async (data, userId, context, mutation) => {
      queryClient.invalidateQueries({
        queryKey: authKeys.vendorUserDetail(userId),
      });
      queryClient.invalidateQueries({ queryKey: authKeys.vendorUsersList() });
      if (onSuccess) {
        await onSuccess(data, userId, context, mutation);
      }
    },
    ...restOptions,
  });
}

export function useDeactivateVendorAll(
  options?: UseMutationOptions<ApiSuccessResponse, Error, string>,
) {
  const queryClient = useQueryClient();
  const { onSuccess, ...restOptions } = options || {};

  return useMutation({
    mutationFn: vendorUsersApi.deactivateVendorAll,
    onSuccess: async (data, vendorId, context, mutation) => {
      queryClient.invalidateQueries({ queryKey: authKeys.vendorUsers() });
      if (onSuccess) {
        await onSuccess(data, vendorId, context, mutation);
      }
    },
    ...restOptions,
  });
}

// =============================================================================
// 8. User Import Hooks
// =============================================================================

export function useValidateImport(
  options?: UseMutationOptions<
    ImportValidationResultDto,
    Error,
    ValidateImportDto
  >,
) {
  return useMutation({
    mutationFn: userImportApi.validateImport,
    ...options,
  });
}

export function useCommitImport(
  options?: UseMutationOptions<
    ImportCommitResultDto,
    Error,
    CommitImportDto
  >,
) {
  const queryClient = useQueryClient();
  const { onSuccess, ...restOptions } = options || {};

  return useMutation({
    mutationFn: userImportApi.commitImport,
    onSuccess: async (data, variables, context, mutation) => {
      queryClient.invalidateQueries({ queryKey: authKeys.users() });
      if (onSuccess) {
        await onSuccess(data, variables, context, mutation);
      }
    },
    ...restOptions,
  });
}
