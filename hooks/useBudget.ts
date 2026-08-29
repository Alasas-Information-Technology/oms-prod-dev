import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { budgetApi } from "@/lib/api/budget";
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
} from "@/lib/types/budget.types";

// =============================================================================
// Query Keys Factory
// =============================================================================

export const budgetKeys = {
  all: ["budget"] as const,
  summary: (query?: BudgetSummaryQueryDto) =>
    [...budgetKeys.all, "summary", query] as const,
  lines: (query?: IBudgetLinesQueryDto) =>
    [...budgetKeys.all, "lines", query] as const,
  movements: (lineId?: string | null, departmentId?: string) =>
    [...budgetKeys.all, "movements", lineId || "department-recent", departmentId] as const,
  period: (periodId = "active") =>
    [...budgetKeys.all, "period", periodId] as const,
  requests: (query?: IBudgetRequestsQueryDto) =>
    [...budgetKeys.all, "requests", query] as const,
  safeguards: () => [...budgetKeys.all, "safeguards"] as const,
};

// =============================================================================
// React Query Hooks
// =============================================================================

/**
 * Retrieves the 5 headline budget KPI figures and fund state breakdown.
 */
export function useBudgetSummary(
  query?: BudgetSummaryQueryDto,
  options?: Partial<UseQueryOptions<IBudgetSummaryDto>>
) {
  return useQuery({
    queryKey: budgetKeys.summary(query),
    queryFn: () => budgetApi.getSummary(query),
    staleTime: 60 * 1000,
    ...options,
  });
}

/**
 * Retrieves paginated, filtered budget lines list for the main table.
 */
export function useBudgetLines(
  query?: IBudgetLinesQueryDto,
  options?: Partial<UseQueryOptions<IBudgetLinesResponseDto>>
) {
  return useQuery({
    queryKey: budgetKeys.lines(query),
    queryFn: () => budgetApi.getLines(query),
    staleTime: 30 * 1000,
    ...options,
  });
}

/**
 * Retrieves sequential fund state movement events for a budget line or department.
 */
export function useBudgetLineMovements(
  lineId?: string | null,
  departmentId?: string,
  options?: Partial<UseQueryOptions<IFundMovementsResponseDto>>
) {
  return useQuery({
    queryKey: budgetKeys.movements(lineId, departmentId),
    queryFn: () => budgetApi.getLineMovements(lineId, departmentId),
    staleTime: 30 * 1000,
    ...options,
  });
}

/**
 * Retrieves period governance status, 3-level approvals, and reopening constraints.
 */
export function useBudgetPeriod(
  periodId = "active",
  options?: Partial<UseQueryOptions<IBudgetPeriodDto>>
) {
  return useQuery({
    queryKey: budgetKeys.period(periodId),
    queryFn: () => budgetApi.getPeriod(periodId),
    staleTime: 60 * 1000,
    ...options,
  });
}

/**
 * Retrieves unbudgeted, top-up, amendment, and exception requests.
 */
export function useBudgetRequests(
  query?: IBudgetRequestsQueryDto,
  options?: Partial<UseQueryOptions<IBudgetRequestsResponseDto>>
) {
  return useQuery({
    queryKey: budgetKeys.requests(query),
    queryFn: () => budgetApi.getRequests(query),
    staleTime: 30 * 1000,
    ...options,
  });
}

/**
 * Retrieves active financial safeguards and Oracle system-of-record control status.
 */
export function useBudgetSafeguards(
  options?: Partial<UseQueryOptions<IBudgetSafeguardsResponseDto>>
) {
  return useQuery({
    queryKey: budgetKeys.safeguards(),
    queryFn: () => budgetApi.getSafeguards(),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}
