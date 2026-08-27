import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions,
} from '@tanstack/react-query';
import {
  orgUnitsApi,
  orgUnitTypesApi,
  orgManagersApi,
  orgResolutionApi,
} from '@/lib/api/organization';
import {
  OrgUnitSummaryDto,
  OrgUnitDetailDto,
  OrgUnitTreeNodeDto,
  OrgUnitTypeDto,
  AllowedParentTypeDto,
  OrgUnitManagerDto,
  OrgUnitChangeLogDto,
  ApprovalChainNodeDto,
  BudgetOwnerDto,
  CreateOrgUnitDto,
  UpdateOrgUnitDto,
  MoveOrgUnitDto,
  AssignManagerDto,
  UpdateManagerDto,
  OrgUnitListQueryDto,
  OrgUnitExportQueryDto,
  PaginatedResponse,
  ExportQueuedResponseDto,
} from '@/lib/types/organization.types';

// =============================================================================
// Query Keys Factory
// =============================================================================

export const orgKeys = {
  all: ['organization'] as const,

  // Types
  types: () => [...orgKeys.all, 'types'] as const,
  allowedParents: (typeId?: number) => [...orgKeys.types(), 'allowedParents', typeId] as const,

  // Units
  units: () => [...orgKeys.all, 'units'] as const,
  unitsList: (query?: OrgUnitListQueryDto) => [...orgKeys.units(), 'list', query ?? {}] as const,
  tree: () => [...orgKeys.units(), 'tree'] as const,
  unit: (id?: string) => [...orgKeys.units(), 'detail', id ?? ''] as const,
  children: (id?: string) => [...orgKeys.unit(id), 'children'] as const,
  ancestors: (id?: string) => [...orgKeys.unit(id), 'ancestors'] as const,
  descendants: (id?: string) => [...orgKeys.unit(id), 'descendants'] as const,
  changeLog: (id?: string, page?: number, pageSize?: number) =>
    [...orgKeys.unit(id), 'changeLog', { page, pageSize }] as const,

  // Managers
  managers: (unitId?: string) => [...orgKeys.unit(unitId), 'managers'] as const,
  currentHead: (unitId?: string) => [...orgKeys.unit(unitId), 'currentHead'] as const,
  userManaged: (userId?: string) => [...orgKeys.all, 'userManaged', userId ?? ''] as const,

  // Resolution Helpers
  approvalChain: (unitId?: string) => [...orgKeys.unit(unitId), 'approvalChain'] as const,
  budgetOwner: (unitId?: string) => [...orgKeys.unit(unitId), 'budgetOwner'] as const,
  visibleUnits: () => [...orgKeys.all, 'visibleUnits'] as const,
};

// =============================================================================
// 1. Organization Unit Types Hooks
// =============================================================================

export function useOrgUnitTypes(
  options?: Omit<UseQueryOptions<OrgUnitTypeDto[], Error>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: orgKeys.types(),
    queryFn: orgUnitTypesApi.getTypes,
    staleTime: 5 * 60 * 1000, // Types change very rarely (5 mins)
    ...options,
  });
}

export function useAllowedParentTypes(
  typeId?: number,
  options?: Omit<UseQueryOptions<AllowedParentTypeDto[], Error>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: orgKeys.allowedParents(typeId),
    queryFn: () => (typeId ? orgUnitTypesApi.getAllowedParents(typeId) : Promise.resolve([])),
    enabled: typeof typeId === 'number' && typeId > 0 && (options?.enabled ?? true),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

// =============================================================================
// 2. Organization Units Query Hooks
// =============================================================================

export function useOrgUnits(
  query?: OrgUnitListQueryDto,
  options?: Omit<UseQueryOptions<PaginatedResponse<OrgUnitSummaryDto>, Error>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: orgKeys.unitsList(query),
    queryFn: () => orgUnitsApi.getUnits(query),
    staleTime: 30 * 1000,
    ...options,
  });
}

export function useOrgUnitTree(
  options?: Omit<UseQueryOptions<OrgUnitTreeNodeDto[], Error>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: orgKeys.tree(),
    queryFn: orgUnitsApi.getTree,
    staleTime: 60 * 1000,
    ...options,
  });
}

export function useOrgUnit(
  id?: string,
  options?: Omit<UseQueryOptions<OrgUnitDetailDto, Error>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: orgKeys.unit(id),
    queryFn: () => (id ? orgUnitsApi.getUnitById(id) : Promise.reject(new Error('Unit ID required'))),
    enabled: Boolean(id) && (options?.enabled ?? true),
    staleTime: 30 * 1000,
    ...options,
  });
}

export function useOrgUnitChildren(
  id?: string,
  options?: Omit<UseQueryOptions<OrgUnitSummaryDto[], Error>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: orgKeys.children(id),
    queryFn: () => (id ? orgUnitsApi.getChildren(id) : Promise.resolve([])),
    enabled: Boolean(id) && (options?.enabled ?? true),
    staleTime: 30 * 1000,
    ...options,
  });
}

export function useOrgUnitAncestors(
  id?: string,
  options?: Omit<UseQueryOptions<OrgUnitSummaryDto[], Error>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: orgKeys.ancestors(id),
    queryFn: () => (id ? orgUnitsApi.getAncestors(id) : Promise.resolve([])),
    enabled: Boolean(id) && (options?.enabled ?? true),
    staleTime: 60 * 1000,
    ...options,
  });
}

export function useOrgUnitDescendants(
  id?: string,
  options?: Omit<UseQueryOptions<OrgUnitSummaryDto[], Error>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: orgKeys.descendants(id),
    queryFn: () => (id ? orgUnitsApi.getDescendants(id) : Promise.resolve([])),
    enabled: Boolean(id) && (options?.enabled ?? true),
    staleTime: 60 * 1000,
    ...options,
  });
}

export function useOrgUnitChangeLog(
  id?: string,
  page = 1,
  pageSize = 20,
  options?: Omit<UseQueryOptions<PaginatedResponse<OrgUnitChangeLogDto>, Error>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: orgKeys.changeLog(id, page, pageSize),
    queryFn: () =>
      id
        ? orgUnitsApi.getChangeLog(id, page, pageSize)
        : Promise.resolve({ data: [], total: 0, page, pageSize, totalPages: 1 }),
    enabled: Boolean(id) && (options?.enabled ?? true),
    ...options,
  });
}

// =============================================================================
// 3. Organization Managers Query Hooks
// =============================================================================

export function useOrgUnitManagers(
  unitId?: string,
  options?: Omit<UseQueryOptions<OrgUnitManagerDto[], Error>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: orgKeys.managers(unitId),
    queryFn: () => (unitId ? orgManagersApi.getManagers(unitId) : Promise.resolve([])),
    enabled: Boolean(unitId) && (options?.enabled ?? true),
    staleTime: 30 * 1000,
    ...options,
  });
}

export function useOrgUnitCurrentHead(
  unitId?: string,
  options?: Omit<UseQueryOptions<OrgUnitManagerDto | null, Error>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: orgKeys.currentHead(unitId),
    queryFn: () => (unitId ? orgManagersApi.getCurrentHead(unitId) : Promise.resolve(null)),
    enabled: Boolean(unitId) && (options?.enabled ?? true),
    staleTime: 30 * 1000,
    ...options,
  });
}

export function useUserManagedUnits(
  userId?: string,
  options?: Omit<UseQueryOptions<OrgUnitSummaryDto[], Error>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: orgKeys.userManaged(userId),
    queryFn: () => (userId ? orgManagersApi.getUserManagedUnits(userId) : Promise.resolve([])),
    enabled: Boolean(userId) && (options?.enabled ?? true),
    staleTime: 60 * 1000,
    ...options,
  });
}

// =============================================================================
// 4. Resolution Helpers Query Hooks
// =============================================================================

export function useApprovalChain(
  unitId?: string,
  options?: Omit<UseQueryOptions<ApprovalChainNodeDto[], Error>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: orgKeys.approvalChain(unitId),
    queryFn: () => (unitId ? orgResolutionApi.getApprovalChain(unitId) : Promise.resolve([])),
    enabled: Boolean(unitId) && (options?.enabled ?? true),
    staleTime: 60 * 1000,
    ...options,
  });
}

export function useBudgetOwner(
  unitId?: string,
  options?: Omit<UseQueryOptions<BudgetOwnerDto | null, Error>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: orgKeys.budgetOwner(unitId),
    queryFn: () => (unitId ? orgResolutionApi.getBudgetOwner(unitId) : Promise.resolve(null)),
    enabled: Boolean(unitId) && (options?.enabled ?? true),
    staleTime: 60 * 1000,
    ...options,
  });
}

export function useVisibleUnits(
  options?: Omit<UseQueryOptions<string[], Error>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: orgKeys.visibleUnits(),
    queryFn: orgResolutionApi.getVisibleUnits,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

// =============================================================================
// 5. Invalidation Helper: Invalidate Node & Ancestor Hierarchy
// =============================================================================

/**
 * Invalidates the tree, a node, and all cached ancestors of that node.
 */
async function invalidateNodeAndAncestors(
  queryClient: ReturnType<typeof useQueryClient>,
  nodeId: string,
  extraAncestorIds: string[] = [],
) {
  // 1. Invalidate tree and lists
  queryClient.invalidateQueries({ queryKey: orgKeys.tree() });
  queryClient.invalidateQueries({ queryKey: orgKeys.units() });

  // 2. Invalidate node detail, children, descendants
  queryClient.invalidateQueries({ queryKey: orgKeys.unit(nodeId) });

  // 3. Collect ancestor IDs from cache or query
  const cachedDetail = queryClient.getQueryData<OrgUnitDetailDto>(orgKeys.unit(nodeId));
  const ancestorIdsFromCache = cachedDetail?.breadcrumb?.map((b) => b.orgUnitId) || [];
  const allAncestorIds = Array.from(
    new Set([...ancestorIdsFromCache, ...extraAncestorIds].filter(Boolean)),
  );

  // Invalidate every ancestor's detail, children, approvalChain, and budgetOwner
  for (const ancId of allAncestorIds) {
    queryClient.invalidateQueries({ queryKey: orgKeys.unit(ancId) });
  }
}

// =============================================================================
// 6. Organization Units Mutation Hooks (With Invalidation Engine)
// =============================================================================

export function useCreateOrgUnit(
  options?: UseMutationOptions<OrgUnitDetailDto, Error, CreateOrgUnitDto>,
) {
  const queryClient = useQueryClient();
  const { onSuccess, ...restOptions } = options || {};

  return useMutation({
    mutationFn: orgUnitsApi.createUnit,
    onSuccess: async (createdUnit, variables, context, mutation) => {
      // Invalidate tree & units list
      queryClient.invalidateQueries({ queryKey: orgKeys.tree() });
      queryClient.invalidateQueries({ queryKey: orgKeys.units() });

      // Invalidate parent's children & detail
      if (variables.parentOrgUnitId) {
        queryClient.invalidateQueries({ queryKey: orgKeys.unit(variables.parentOrgUnitId) });
      }

      if (onSuccess) {
        await (onSuccess as any)(createdUnit, variables, context, mutation);
      }
    },
    ...restOptions,
  });
}

export function useUpdateOrgUnit(
  options?: UseMutationOptions<OrgUnitDetailDto, Error, { id: string; dto: UpdateOrgUnitDto }>,
) {
  const queryClient = useQueryClient();
  const { onSuccess, ...restOptions } = options || {};

  return useMutation({
    mutationFn: ({ id, dto }) => orgUnitsApi.updateUnit(id, dto),
    onSuccess: async (updatedUnit, variables, context, mutation) => {
      // Invalidate unit detail, list, tree, change log
      queryClient.invalidateQueries({ queryKey: orgKeys.unit(variables.id) });
      queryClient.invalidateQueries({ queryKey: orgKeys.tree() });
      queryClient.invalidateQueries({ queryKey: orgKeys.units() });

      if (onSuccess) {
        await (onSuccess as any)(updatedUnit, variables, context, mutation);
      }
    },
    ...restOptions,
  });
}

export function useMoveOrgUnit(
  options?: UseMutationOptions<OrgUnitDetailDto, Error, { id: string; dto: MoveOrgUnitDto }>,
) {
  const queryClient = useQueryClient();
  const { onSuccess, ...restOptions } = options || {};

  return useMutation({
    mutationFn: ({ id, dto }) => orgUnitsApi.moveUnit(id, dto),
    onSuccess: async (movedUnit, variables, context, mutation) => {
      // Invalidate tree, affected node, old parent ancestors, new parent ancestors
      await invalidateNodeAndAncestors(queryClient, variables.id, [
        variables.dto.newParentOrgUnitId,
      ]);

      // Invalidate approval chain and budget owner for subtree
      queryClient.invalidateQueries({ queryKey: orgKeys.approvalChain(variables.id) });
      queryClient.invalidateQueries({ queryKey: orgKeys.budgetOwner(variables.id) });

      if (onSuccess) {
        await (onSuccess as any)(movedUnit, variables, context, mutation);
      }
    },
    ...restOptions,
  });
}

export function useActivateOrgUnit(
  options?: UseMutationOptions<OrgUnitDetailDto, Error, string>,
) {
  const queryClient = useQueryClient();
  const { onSuccess, ...restOptions } = options || {};

  return useMutation({
    mutationFn: (id: string) => orgUnitsApi.activateUnit(id),
    onSuccess: async (unit, id, context, mutation) => {
      await invalidateNodeAndAncestors(queryClient, id);
      if (onSuccess) {
        await (onSuccess as any)(unit, id, context, mutation);
      }
    },
    ...restOptions,
  });
}

export function useDeactivateOrgUnit(
  options?: UseMutationOptions<OrgUnitDetailDto, Error, { id: string; effectiveTo?: string }>,
) {
  const queryClient = useQueryClient();
  const { onSuccess, ...restOptions } = options || {};

  return useMutation({
    mutationFn: ({ id, effectiveTo }) => orgUnitsApi.deactivateUnit(id, effectiveTo),
    onSuccess: async (unit, variables, context, mutation) => {
      await invalidateNodeAndAncestors(queryClient, variables.id);
      if (onSuccess) {
        await (onSuccess as any)(unit, variables, context, mutation);
      }
    },
    ...restOptions,
  });
}

export function useDeleteOrgUnit(
  options?: UseMutationOptions<void, Error, string>,
) {
  const queryClient = useQueryClient();
  const { onSuccess, ...restOptions } = options || {};

  return useMutation({
    mutationFn: (id: string) => orgUnitsApi.deleteUnit(id),
    onSuccess: async (res, id, context, mutation) => {
      await invalidateNodeAndAncestors(queryClient, id);
      if (onSuccess) {
        await (onSuccess as any)(res, id, context, mutation);
      }
    },
    ...restOptions,
  });
}

// =============================================================================
// 7. Organization Managers Mutation Hooks
// =============================================================================

export function useAssignManager(
  options?: UseMutationOptions<OrgUnitManagerDto, Error, { unitId: string; dto: AssignManagerDto }>,
) {
  const queryClient = useQueryClient();
  const { onSuccess, ...restOptions } = options || {};

  return useMutation({
    mutationFn: ({ unitId, dto }) => orgManagersApi.assignManager(unitId, dto),
    onSuccess: async (manager, variables, context, mutation) => {
      // Invalidate managers and current head
      queryClient.invalidateQueries({ queryKey: orgKeys.managers(variables.unitId) });
      queryClient.invalidateQueries({ queryKey: orgKeys.currentHead(variables.unitId) });

      // Invalidate unit detail (to sync head field) & tree
      queryClient.invalidateQueries({ queryKey: orgKeys.unit(variables.unitId) });
      queryClient.invalidateQueries({ queryKey: orgKeys.tree() });

      // Invalidate approval chain
      queryClient.invalidateQueries({ queryKey: orgKeys.approvalChain(variables.unitId) });

      // Invalidate user managed units
      queryClient.invalidateQueries({ queryKey: orgKeys.userManaged(variables.dto.userId) });

      if (onSuccess) {
        await (onSuccess as any)(manager, variables, context, mutation);
      }
    },
    ...restOptions,
  });
}

export function useUpdateManager(
  options?: UseMutationOptions<
    OrgUnitManagerDto,
    Error,
    { managerId: string; unitId?: string; userId?: string; dto: UpdateManagerDto }
  >,
) {
  const queryClient = useQueryClient();
  const { onSuccess, ...restOptions } = options || {};

  return useMutation({
    mutationFn: ({ managerId, dto }) => orgManagersApi.updateManager(managerId, dto),
    onSuccess: async (manager, variables, context, mutation) => {
      const uId = variables.unitId || manager.orgUnitId;
      const usrId = variables.userId || manager.userId;
      if (uId) {
        queryClient.invalidateQueries({ queryKey: orgKeys.managers(uId) });
        queryClient.invalidateQueries({ queryKey: orgKeys.currentHead(uId) });
        queryClient.invalidateQueries({ queryKey: orgKeys.unit(uId) });
        queryClient.invalidateQueries({ queryKey: orgKeys.approvalChain(uId) });
      }
      if (usrId) {
        queryClient.invalidateQueries({ queryKey: orgKeys.userManaged(usrId) });
      }

      if (onSuccess) {
        await (onSuccess as any)(manager, variables, context, mutation);
      }
    },
    ...restOptions,
  });
}

export function useRemoveManager(
  options?: UseMutationOptions<
    void,
    Error,
    { managerId: string; unitId?: string; userId?: string } | string
  >,
) {
  const queryClient = useQueryClient();
  const { onSuccess, ...restOptions } = options || {};

  return useMutation({
    mutationFn: (vars) => {
      const managerId = typeof vars === 'string' ? vars : vars.managerId;
      return orgManagersApi.removeManager(managerId);
    },
    onSuccess: async (res, variables, context, mutation) => {
      const vars = typeof variables === 'string' ? { managerId: variables } : variables;
      if (vars.unitId) {
        queryClient.invalidateQueries({ queryKey: orgKeys.managers(vars.unitId) });
        queryClient.invalidateQueries({ queryKey: orgKeys.currentHead(vars.unitId) });
        queryClient.invalidateQueries({ queryKey: orgKeys.unit(vars.unitId) });
        queryClient.invalidateQueries({ queryKey: orgKeys.approvalChain(vars.unitId) });
      } else {
        queryClient.invalidateQueries({ queryKey: orgKeys.all });
      }
      if (vars.userId) {
        queryClient.invalidateQueries({ queryKey: orgKeys.userManaged(vars.userId) });
      }

      if (onSuccess) {
        await (onSuccess as any)(res, variables, context, mutation);
      }
    },
    ...restOptions,
  });
}
