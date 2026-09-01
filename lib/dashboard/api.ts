/**
 * Dashboard API Client & React Query Data Hooks
 *
 * Pattern matches project conventions established in lib/api/budget.ts and hooks/useBudget.ts.
 *
 * Read from fixtures behind a single configuration flag (USE_DASHBOARD_FIXTURES).
 * Switching to the production NestJS backend is a one-line change.
 */

import { useQuery, useQueries, UseQueryOptions } from "@tanstack/react-query";
import api from "@/lib/api/axios";
import {
  DashboardLayout,
  DashboardPersona,
  WidgetId,
  WidgetPlacement,
  WidgetQueryParams,
  WidgetResponse,
  WidgetDataMap,
} from "@/types/dashboard";
import {
  getMockDashboardLayout,
  getMockWidgetData,
} from "./fixtures";

/**
 * Global Configuration Flag for Dashboard API:
 *
 * Set to `true` to use mock fixtures matching DASHBOARD-API-CONTRACT.md reference figures.
 * Switch to `false` in a single line when the backend NestJS dashboard module is deployed.
 */
export const USE_DASHBOARD_FIXTURES = true;

/**
 * Helper to simulate network latency for fixtures in dev mode.
 */
const mockDelay = (ms = 120) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// =============================================================================
// Dashboard API Client
// =============================================================================

export const dashboardApi = {
  /**
   * Retrieves the user's computed dashboard layout (GET /api/v1/dashboard/layout).
   * Note: Scope is resolved entirely server-side; no scope parameter is sent.
   */
  getLayout: async (persona: DashboardPersona = "requestor"): Promise<DashboardLayout> => {
    if (USE_DASHBOARD_FIXTURES) {
      await mockDelay(100);
      return getMockDashboardLayout(persona);
    }
    const response = await api.get<DashboardLayout>("/v1/dashboard/layout");
    return response.data;
  },

  /**
   * Retrieves pre-aggregated data for a specific widget (GET /api/v1/dashboard/widgets/:widgetId).
   * Note: Scope is resolved entirely server-side; no scope parameter is sent.
   */
  getWidgetData: async <K extends WidgetId>(
    widgetId: K,
    params?: WidgetQueryParams
  ): Promise<WidgetResponse<WidgetDataMap[K]>> => {
    if (USE_DASHBOARD_FIXTURES) {
      await mockDelay(80);
      return getMockWidgetData(widgetId, params);
    }
    const response = await api.get<WidgetResponse<WidgetDataMap[K]>>(
      `/v1/dashboard/widgets/${widgetId}`,
      { params }
    );
    return response.data;
  },
};

// =============================================================================
// Query Keys Factory
// =============================================================================

export const dashboardKeys = {
  all: ["dashboard"] as const,
  layout: (persona: DashboardPersona = "requestor") =>
    [...dashboardKeys.all, "layout", persona] as const,
  widget: (widgetId: WidgetId, params?: WidgetQueryParams) =>
    [...dashboardKeys.all, "widget", widgetId, params] as const,
};

// =============================================================================
// React Query Data Hooks
// =============================================================================

/**
 * Hook to retrieve the dashboard layout, greeting, scope, and bands.
 * Cached for 60 seconds per the API contract.
 */
export function useDashboardLayout(
  persona: DashboardPersona = "requestor",
  options?: Partial<UseQueryOptions<DashboardLayout>>
) {
  return useQuery({
    queryKey: dashboardKeys.layout(persona),
    queryFn: () => dashboardApi.getLayout(persona),
    staleTime: 60 * 1000,
    ...options,
  });
}

/**
 * Hook to retrieve data for a single widget.
 * Cached for 60 seconds per the API contract.
 */
export function useDashboardWidget<K extends WidgetId>(
  widgetId: K,
  params?: WidgetQueryParams,
  options?: Partial<UseQueryOptions<WidgetResponse<WidgetDataMap[K]>>>
) {
  return useQuery({
    queryKey: dashboardKeys.widget(widgetId, params),
    queryFn: () => dashboardApi.getWidgetData(widgetId, params),
    staleTime: 60 * 1000,
    ...options,
  });
}

/**
 * Hook to fetch all widgets in a layout IN PARALLEL after layout resolution.
 * Isolates widget failures so one slow or failing widget never blocks the page.
 */
export function useParallelDashboardWidgets(
  placements: WidgetPlacement[],
  params?: WidgetQueryParams
) {
  return useQueries({
    queries: placements.map((p) => ({
      queryKey: dashboardKeys.widget(p.id, params),
      queryFn: () => dashboardApi.getWidgetData(p.id, params),
      staleTime: 60 * 1000,
    })),
  });
}
