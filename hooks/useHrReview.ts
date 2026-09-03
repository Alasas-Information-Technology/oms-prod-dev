import { useMutation, useQuery, UseQueryOptions } from "@tanstack/react-query";
import { hrReviewApi, HrReviewQueueQuery } from "@/lib/api/hr-review";
import {
  HrConfirmationUpdatePayload,
  HrDecisionPayload,
  HrReviewDetailResponse,
  HrReviewQueueResponse,
} from "@/types/hr-review";

export const hrReviewKeys = {
  all: ["hr-review"] as const,
  queue: (query?: HrReviewQueueQuery) =>
    [...hrReviewKeys.all, "queue", query] as const,
  detail: (requestId: string) =>
    [...hrReviewKeys.all, "detail", requestId] as const,
};

export function useHrReviewQueue(
  query?: HrReviewQueueQuery,
  options?: Partial<UseQueryOptions<HrReviewQueueResponse>>
) {
  return useQuery({
    queryKey: hrReviewKeys.queue(query),
    queryFn: () => hrReviewApi.getQueue(query),
    staleTime: 30 * 1000,
    ...options,
  });
}

export function useHrReviewDetail(
  requestId: string,
  options?: Partial<UseQueryOptions<HrReviewDetailResponse>>
) {
  return useQuery({
    queryKey: hrReviewKeys.detail(requestId),
    queryFn: () => hrReviewApi.getDetail(requestId),
    staleTime: 30 * 1000,
    ...options,
  });
}

export function useHrReviewUpdateConfirmation() {
  return useMutation({
    mutationFn: ({
      requestId,
      payload,
    }: {
      requestId: string;
      payload: HrConfirmationUpdatePayload;
    }) => hrReviewApi.updateConfirmation(requestId, payload),
  });
}

export function useHrReviewSubmitDecision() {
  return useMutation({
    mutationFn: ({
      requestId,
      payload,
    }: {
      requestId: string;
      payload: HrDecisionPayload;
    }) => hrReviewApi.submitDecision(requestId, payload),
  });
}
