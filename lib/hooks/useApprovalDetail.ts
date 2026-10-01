import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { approvalsApi } from "@/lib/api/approvals";
import { ApprovalTaskDetail } from "@/lib/types/approval.types";
import { approvalKeys } from "./useApprovals";

export const approvalDetailKeys = {
  detail: (taskId: string) => [...approvalKeys.all, "detail", taskId] as const,
};

export function useApprovalDetail(
  taskId: string,
  options?: Partial<UseQueryOptions<ApprovalTaskDetail>>
) {
  return useQuery({
    queryKey: approvalDetailKeys.detail(taskId),
    queryFn: () => approvalsApi.getApprovalDetail(taskId),
    staleTime: 30 * 1000,
    retry: false, // Don't retry on 404s to avoid delay for out-of-scope errors
    ...options,
  });
}
