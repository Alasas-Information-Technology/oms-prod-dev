import api from "./axios";
import {
  IBudgetSummaryDto,
  BudgetSummaryQueryDto,
  IBudgetLinesResponseDto,
  IBudgetLinesQueryDto,
  IFundMovementsResponseDto,
  IBudgetPeriodDto,
  IBudgetRequestsResponseDto,
  IBudgetRequestsQueryDto,
  IBudgetSafeguardsResponseDto,
} from "../types/budget.types";
import {
  getMockBudgetSummaryResponse,
  getMockBudgetLinesResponse,
  mockFundMovementsLine002,
  mockDepartmentRecentMovements,
  mockBudgetPeriod,
  getMockBudgetRequestsResponse,
  mockBudgetSafeguards,
} from "../fixtures/budget.fixtures";

/**
 * Global Configuration Flag for Budget API:
 *
 * Set to `true` to use mock fixtures matching BUDGET-API-CONTRACT.md reference figures.
 * Switch to `false` in a single line when the backend NestJS budget module is deployed.
 */
export const USE_BUDGET_FIXTURES = true;

/**
 * Helper to simulate network latency for fixtures in dev mode.
 */
const mockDelay = (ms = 120) => new Promise((resolve) => setTimeout(resolve, ms));

export const budgetApi = {
  /**
   * Retrieves budget summary figures and fund state breakdown (GET /api/v1/budget/summary).
   */
  getSummary: async (query?: BudgetSummaryQueryDto & { search?: string }): Promise<IBudgetSummaryDto> => {
    if (USE_BUDGET_FIXTURES) {
      await mockDelay();
      return getMockBudgetSummaryResponse(query);
    }
    const response = await api.get<IBudgetSummaryDto>("/v1/budget/summary", {
      params: query,
    });
    return response.data;
  },

  /**
   * Retrieves paginated budget lines table (GET /api/v1/budget/lines).
   */
  getLines: async (query?: IBudgetLinesQueryDto): Promise<IBudgetLinesResponseDto> => {
    if (USE_BUDGET_FIXTURES) {
      await mockDelay();
      return getMockBudgetLinesResponse(query);
    }
    const response = await api.get<IBudgetLinesResponseDto>("/v1/budget/lines", {
      params: query,
    });
    return response.data;
  },

  /**
   * Retrieves fund movements for a specific line or department recent (GET /api/v1/budget/lines/:id/movements).
   */
  getLineMovements: async (
    lineId?: string | null,
    departmentId?: string
  ): Promise<IFundMovementsResponseDto> => {
    if (USE_BUDGET_FIXTURES) {
      await mockDelay();
      if (!lineId || lineId === "department-recent") {
        return mockDepartmentRecentMovements;
      }
      return mockFundMovementsLine002;
    }
    const endpoint = lineId
      ? `/v1/budget/lines/${lineId}/movements`
      : `/v1/budget/lines/department-recent/movements`;
    const response = await api.get<IFundMovementsResponseDto>(endpoint, {
      params: { departmentId },
    });
    return response.data;
  },

  /**
   * Retrieves period status, 3-level approval history, and governance rules (GET /api/v1/budget/periods/:id).
   */
  getPeriod: async (periodId = "active"): Promise<IBudgetPeriodDto> => {
    if (USE_BUDGET_FIXTURES) {
      await mockDelay();
      return mockBudgetPeriod;
    }
    const response = await api.get<IBudgetPeriodDto>(`/v1/budget/periods/${periodId}`);
    return response.data;
  },

  /**
   * Retrieves unbudgeted, top-up, amendment, and exception requests (GET /api/v1/budget/requests).
   */
  getRequests: async (
    query?: IBudgetRequestsQueryDto
  ): Promise<IBudgetRequestsResponseDto> => {
    if (USE_BUDGET_FIXTURES) {
      await mockDelay();
      return getMockBudgetRequestsResponse(query);
    }
    const response = await api.get<IBudgetRequestsResponseDto>("/v1/budget/requests", {
      params: query,
    });
    return response.data;
  },

  /**
   * Retrieves active financial control safeguards status (GET /api/v1/budget/safeguards).
   */
  getSafeguards: async (): Promise<IBudgetSafeguardsResponseDto> => {
    if (USE_BUDGET_FIXTURES) {
      await mockDelay();
      return mockBudgetSafeguards;
    }
    const response = await api.get<IBudgetSafeguardsResponseDto>("/v1/budget/safeguards");
    return response.data;
  },
};
