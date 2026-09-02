"use client";

import * as React from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import {
  ClarificationDetail,
  ClarificationDraftPayload,
  ClarificationDraftResponse,
  ClarificationPreviewPayload,
  ClarificationPreviewResponse,
  ClarificationSubmitPayload,
  ClarificationSubmitResponse,
} from "@/types/clarification";
import {
  MOCK_CLARIFICATION_FIXTURES,
  generateMockClarificationPreview,
} from "./fixtures";
import { useDebounce } from "@/hooks/useDebounce";

/**
 * Feature flag to switch between mock fixtures and live BFF / NestJS API
 */
export const USE_FIXTURES = true;

/**
 * Clarification API Service Layer
 */
export const clarificationsApi = {
  /**
   * GET /api/v1/requests/{requestId}/clarifications/{clarificationId}
   */
  async getClarification(
    requestId: string,
    clarificationId: string
  ): Promise<ClarificationDetail> {
    if (USE_FIXTURES) {
      await new Promise((resolve) => setTimeout(resolve, 400));

      const match =
        MOCK_CLARIFICATION_FIXTURES[requestId] ||
        MOCK_CLARIFICATION_FIXTURES[clarificationId] ||
        MOCK_CLARIFICATION_FIXTURES["OMS-2026-0139"];

      if (!match) {
        throw new Error(`Clarification not found for request ${requestId}`);
      }

      return JSON.parse(JSON.stringify(match));
    }

    const res = await fetch(
      `/api/v1/requests/${encodeURIComponent(requestId)}/clarifications/${encodeURIComponent(clarificationId)}`
    );
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw {
        statusCode: res.status,
        code: errorData.code || "FETCH_ERROR",
        message: errorData.message || "Failed to load clarification detail",
      };
    }
    return res.json();
  },

  /**
   * POST /api/v1/requests/{requestId}/clarifications/{clarificationId}/preview
   */
  async previewClarification(
    requestId: string,
    clarificationId: string,
    payload: ClarificationPreviewPayload
  ): Promise<ClarificationPreviewResponse> {
    if (USE_FIXTURES) {
      await new Promise((resolve) => setTimeout(resolve, 300));

      const detail = await clarificationsApi.getClarification(
        requestId,
        clarificationId
      );

      return generateMockClarificationPreview(detail, payload.fieldValues);
    }

    const res = await fetch(
      `/api/v1/requests/${encodeURIComponent(requestId)}/clarifications/${encodeURIComponent(clarificationId)}/preview`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw {
        statusCode: res.status,
        code: errorData.code || "PREVIEW_ERROR",
        message: errorData.message || "Failed to compute clarification preview",
      };
    }

    return res.json();
  },

  /**
   * PUT /api/v1/requests/{requestId}/clarifications/{clarificationId}/draft
   */
  async saveDraft(
    requestId: string,
    clarificationId: string,
    payload: ClarificationDraftPayload
  ): Promise<ClarificationDraftResponse> {
    if (USE_FIXTURES) {
      await new Promise((resolve) => setTimeout(resolve, 350));
      return {
        success: true,
        savedAt: new Date().toISOString(),
      };
    }

    const res = await fetch(
      `/api/v1/requests/${encodeURIComponent(requestId)}/clarifications/${encodeURIComponent(clarificationId)}/draft`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw {
        statusCode: res.status,
        code: errorData.code || "DRAFT_SAVE_ERROR",
        message: errorData.message || "Failed to save draft",
      };
    }

    return res.json();
  },

  /**
   * POST /api/v1/requests/{requestId}/clarifications/{clarificationId}/submit
   */
  async submitResponse(
    requestId: string,
    clarificationId: string,
    payload: ClarificationSubmitPayload
  ): Promise<ClarificationSubmitResponse> {
    if (!payload.idempotencyKey) {
      throw {
        statusCode: 400,
        code: "MISSING_IDEMPOTENCY_KEY",
        message: "An idempotency key is strictly required on submit",
      };
    }

    if (USE_FIXTURES) {
      await new Promise((resolve) => setTimeout(resolve, 600));

      return {
        success: true,
        message: "Clarification response submitted successfully.",
        requestId: requestId || "OMS-2026-0139",
        nextStage: "LINE_MANAGER",
        nextApproverName: "Omar Al Hashmi",
      };
    }

    const res = await fetch(
      `/api/v1/requests/${encodeURIComponent(requestId)}/clarifications/${encodeURIComponent(clarificationId)}/submit`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw {
        statusCode: res.status,
        code: errorData.code || "SUBMISSION_ERROR",
        message: errorData.message || "Failed to submit clarification response",
      };
    }

    return res.json();
  },
};

/**
 * Query Key Factory
 */
export const clarificationKeys = {
  all: ["clarifications"] as const,
  detail: (requestId: string, clarificationId: string) =>
    [...clarificationKeys.all, "detail", requestId, clarificationId] as const,
  preview: (
    requestId: string,
    clarificationId: string,
    fieldValues: Record<string, any>
  ) =>
    [
      ...clarificationKeys.all,
      "preview",
      requestId,
      clarificationId,
      fieldValues,
    ] as const,
};

/**
 * Hook 1: Fetch Clarification Detail
 */
export function useClarification(
  requestId: string,
  clarificationId: string,
  options?: Partial<UseQueryOptions<ClarificationDetail>>
) {
  return useQuery({
    queryKey: clarificationKeys.detail(requestId, clarificationId),
    queryFn: () => clarificationsApi.getClarification(requestId, clarificationId),
    staleTime: 30 * 1000,
    retry: false,
    ...options,
  });
}

/**
 * Hook 2: Live Clarification Preview (Debounced 500ms)
 */
export function useClarificationPreview(
  requestId: string,
  clarificationId: string,
  fieldValues: Record<string, any>,
  options?: { enabled?: boolean }
) {
  const debouncedFieldValues = useDebounce(fieldValues, 500);

  return useQuery({
    queryKey: clarificationKeys.preview(
      requestId,
      clarificationId,
      debouncedFieldValues
    ),
    queryFn: () =>
      clarificationsApi.previewClarification(requestId, clarificationId, {
        fieldValues: debouncedFieldValues,
      }),
    enabled: options?.enabled !== false && Boolean(requestId) && Boolean(clarificationId),
    staleTime: 10 * 1000,
    placeholderData: (previousData) => previousData,
  });
}

/**
 * Hook 3: Draft Save Hook with 2s Debounced Autosave
 */
export function useClarificationDraft(
  requestId: string,
  clarificationId: string,
  currentDraft?: ClarificationDraftPayload,
  options?: { autoSave?: boolean }
) {
  const queryClient = useQueryClient();
  const [lastSavedAt, setLastSavedAt] = React.useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (payload: ClarificationDraftPayload) =>
      clarificationsApi.saveDraft(requestId, clarificationId, payload),
    onSuccess: (data) => {
      setLastSavedAt(data.savedAt);
      queryClient.invalidateQueries({
        queryKey: clarificationKeys.detail(requestId, clarificationId),
      });
    },
  });

  const debouncedDraft = useDebounce(currentDraft, 2000);

  // Trigger autosave when debouncedDraft changes and has meaningful content
  React.useEffect(() => {
    if (
      options?.autoSave !== false &&
      debouncedDraft &&
      (debouncedDraft.message?.trim().length > 0 ||
        Object.keys(debouncedDraft.fieldValues || {}).length > 0 ||
        (debouncedDraft.attachmentIds || []).length > 0)
    ) {
      mutation.mutate(debouncedDraft);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedDraft]);

  return {
    saveDraft: (payload: ClarificationDraftPayload) => mutation.mutate(payload),
    saveDraftAsync: (payload: ClarificationDraftPayload) =>
      mutation.mutateAsync(payload),
    isSaving: mutation.isPending,
    lastSavedAt,
    error: mutation.error,
  };
}

/**
 * Hook 4: Submit Clarification Response Mutation Hook
 */
export function useSubmitClarification(
  requestId: string,
  clarificationId: string
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ClarificationSubmitPayload) =>
      clarificationsApi.submitResponse(requestId, clarificationId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: clarificationKeys.all,
      });
    },
  });
}
