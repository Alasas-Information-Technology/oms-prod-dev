import api from './axios';
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
} from '../types/organization.types';

// =============================================================================
// Organization Units API
// =============================================================================

export const orgUnitsApi = {
  /**
   * Retrieves paginated, scope-filtered organization units list.
   */
  getUnits: async (query?: OrgUnitListQueryDto): Promise<PaginatedResponse<OrgUnitSummaryDto>> => {
    const response = await api.get('/organization/units', { params: query });
    return response.data;
  },

  /**
   * Retrieves full visible organization hierarchy as a nested tree.
   */
  getTree: async (): Promise<OrgUnitTreeNodeDto[]> => {
    const response = await api.get('/organization/units/tree');
    return response.data;
  },

  /**
   * Retrieves single organization unit details including breadcrumbs and head.
   */
  getUnitById: async (id: string): Promise<OrgUnitDetailDto> => {
    const response = await api.get(`/organization/units/${id}`);
    return response.data;
  },

  /**
   * Retrieves direct children of an organization unit for lazy loading.
   */
  getChildren: async (id: string): Promise<OrgUnitSummaryDto[]> => {
    const response = await api.get(`/organization/units/${id}/children`);
    return response.data;
  },

  /**
   * Retrieves ancestor chain ordered from root down to parent.
   */
  getAncestors: async (id: string): Promise<OrgUnitSummaryDto[]> => {
    const response = await api.get(`/organization/units/${id}/ancestors`);
    return response.data;
  },

  /**
   * Retrieves all flat descendants of an organization unit.
   */
  getDescendants: async (id: string): Promise<OrgUnitSummaryDto[]> => {
    const response = await api.get(`/organization/units/${id}/descendants`);
    return response.data;
  },

  /**
   * Retrieves paginated change log history for an organization unit.
   */
  getChangeLog: async (
    id: string,
    page = 1,
    pageSize = 20,
  ): Promise<PaginatedResponse<OrgUnitChangeLogDto>> => {
    const response = await api.get(`/organization/units/${id}/change-log`, {
      params: { page, pageSize },
    });
    return response.data;
  },

  /**
   * Creates a new organization unit.
   */
  createUnit: async (dto: CreateOrgUnitDto): Promise<OrgUnitDetailDto> => {
    const response = await api.post('/organization/units', dto);
    return response.data;
  },

  /**
   * Updates attributes of an organization unit (never reparents).
   */
  updateUnit: async (id: string, dto: UpdateOrgUnitDto): Promise<OrgUnitDetailDto> => {
    const response = await api.patch(`/organization/units/${id}`, dto);
    return response.data;
  },

  /**
   * Reparents an organization unit and its entire subtree.
   */
  moveUnit: async (id: string, dto: MoveOrgUnitDto): Promise<OrgUnitDetailDto> => {
    const response = await api.post(`/organization/units/${id}/move`, dto);
    return response.data;
  },

  /**
   * Activates an organization unit.
   */
  activateUnit: async (id: string): Promise<OrgUnitDetailDto> => {
    const response = await api.post(`/organization/units/${id}/activate`, {});
    return response.data;
  },

  /**
   * Deactivates an organization unit with optional effectiveTo date.
   */
  deactivateUnit: async (id: string, effectiveTo?: string): Promise<OrgUnitDetailDto> => {
    const response = await api.post(`/organization/units/${id}/deactivate`, { effectiveTo });
    return response.data;
  },

  /**
   * Soft deletes an organization unit.
   */
  deleteUnit: async (id: string): Promise<void> => {
    await api.delete(`/organization/units/${id}`);
  },

  /**
   * Exports organization units to Excel (.xlsx) or returns queue info for large datasets.
   */
  exportUnits: async (
    query?: OrgUnitExportQueryDto,
  ): Promise<{ data: Blob; filename: string } | ExportQueuedResponseDto> => {
    const response = await api.get('/organization/units/export', {
      params: query,
      responseType: 'blob',
    });

    const contentType = String(response.headers['content-type'] || '');
    if (contentType.includes('application/json')) {
      // Parse blob as JSON for queued response
      const text = await (response.data as Blob).text();
      return JSON.parse(text) as ExportQueuedResponseDto;
    }

    // Extract filename from header or fallback
    let filename = `organization_units_export_${new Date().toISOString().split('T')[0]}.xlsx`;
    const disposition = String(response.headers['content-disposition'] || '');
    if (disposition && disposition.includes('filename=')) {
      const match = disposition.match(/filename="?([^";]+)"?/);
      if (match && match[1]) {
        filename = match[1];
      }
    }

    return { data: response.data as Blob, filename };
  },
};

// =============================================================================
// Organization Unit Types API
// =============================================================================

export const orgUnitTypesApi = {
  /**
   * Retrieves all unit types with hierarchy rules.
   */
  getTypes: async (): Promise<OrgUnitTypeDto[]> => {
    const response = await api.get('/organization/unit-types');
    return response.data;
  },

  /**
   * Retrieves allowed parent types for a given unit type to drive creation UI.
   */
  getAllowedParents: async (typeId: number): Promise<AllowedParentTypeDto[]> => {
    const response = await api.get(`/organization/unit-types/${typeId}/allowed-parents`);
    return response.data;
  },
};

// =============================================================================
// Organization Managers API
// =============================================================================

export const orgManagersApi = {
  /**
   * Retrieves historical and active manager assignments for a unit.
   */
  getManagers: async (unitId: string): Promise<OrgUnitManagerDto[]> => {
    const response = await api.get(`/organization/units/${unitId}/managers`);
    return response.data;
  },

  /**
   * Retrieves current primary head manager for a unit.
   */
  getCurrentHead: async (unitId: string): Promise<OrgUnitManagerDto | null> => {
    const response = await api.get(`/organization/units/${unitId}/managers/current`);
    return response.data;
  },

  /**
   * Assigns a manager to an organization unit.
   */
  assignManager: async (unitId: string, dto: AssignManagerDto): Promise<OrgUnitManagerDto> => {
    const response = await api.post(`/organization/units/${unitId}/managers`, dto);
    return response.data;
  },

  /**
   * Updates manager assignment tenure or primary status.
   */
  updateManager: async (managerId: string, dto: UpdateManagerDto): Promise<OrgUnitManagerDto> => {
    const response = await api.patch(`/organization/managers/${managerId}`, dto);
    return response.data;
  },

  /**
   * Removes a manager assignment.
   */
  removeManager: async (managerId: string): Promise<void> => {
    await api.delete(`/organization/managers/${managerId}`);
  },

  /**
   * Retrieves all organization units managed by a user.
   */
  getUserManagedUnits: async (userId: string): Promise<OrgUnitSummaryDto[]> => {
    const response = await api.get(`/organization/users/${userId}/managed-units`);
    return response.data;
  },
};

// =============================================================================
// Workflow Resolution Helpers API
// =============================================================================

export const orgResolutionApi = {
  /**
   * Resolves multi-tier approval chain walking up the closure hierarchy.
   */
  getApprovalChain: async (unitId: string): Promise<ApprovalChainNodeDto[]> => {
    const response = await api.get(`/organization/units/${unitId}/approval-chain`);
    return response.data;
  },

  /**
   * Resolves nearest ancestor unit with budget authority.
   */
  getBudgetOwner: async (unitId: string): Promise<BudgetOwnerDto | null> => {
    const response = await api.get(`/organization/units/${unitId}/budget-owner`);
    return response.data;
  },

  /**
   * Retrieves list of org unit IDs within caller's scope.
   */
  getVisibleUnits: async (): Promise<string[]> => {
    const response = await api.get('/organization/me/visible-units');
    return response.data;
  },
};
