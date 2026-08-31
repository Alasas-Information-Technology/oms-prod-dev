import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { approvalsApi, ApprovalsQueryDto } from "@/lib/api/approvals";
import { ApprovalsListResponse } from "@/lib/types/approval.types";

export const approvalKeys = {
  all: ["approvals"] as const,
  list: (query?: ApprovalsQueryDto) =>
    [...approvalKeys.all, "list", query] as const,
};

export function useMyApprovals(
  query?: ApprovalsQueryDto,
  options?: Partial<UseQueryOptions<ApprovalsListResponse>>
) {
  return useQuery({
    queryKey: approvalKeys.list(query),
    queryFn: () => approvalsApi.getMyApprovals(query),
    staleTime: 30 * 1000,
    ...options,
  });
}
