"use client";

import * as React from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import {
  HrSendBackOptionsResponse,
  HrSendBackDraftPayload,
  HrSendBackDraftResponse,
  HrSendBackSubmitPayload,
  HrSendBackSubmitResponse,
} from "@/src/types/hr-send-back";
import {
  MOCK_HR_SEND_BACK_FIXTURES,
  FIXTURE_HR_SEND_BACK_OMS_2026_0139,
} from "./fixtures";
import { useDebounce } from "@/hooks/useDebounce";

/**
 * Feature flag for fixtures during frontend development
 */
export const USE_FIXTURES = true;

/**
 * HR Send-Back API Service Layer
 */
export const hrSendBackApi = {
  /**
   * GET /api/v1/hr-review/{requestId}/send-back/options
   */
  async getOptions(requestId: string): Promise<HrSendBackOptionsResponse> {
    if (USE_FIXTURES) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const match =
        MOCK_HR_SEND_BACK_FIXTURES[requestId] ||
        FIXTURE_HR_SEND_BACK_OMS_2026_0139;
      return JSON.parse(JSON.stringify(match));
    }

    const res = await fetch(
      `/api/v1/hr-review/${encodeURIComponent(requestId)}/send-back/options`
    );
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw {
        statusCode: res.status,
        code: errorData.code || "FETCH_OPTIONS_ERROR",
        message: errorData.message || "Failed to load send-back options",
      };
    }
    return res.json();
  },

  /**
   * PUT /api/v1/hr-review/{requestId}/send-back/draft
   */
  async saveDraft(
    requestId: string,
    payload: HrSendBackDraftPayload
  ): Promise<HrSendBackDraftResponse> {
    if (USE_FIXTURES) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return {
        success: true,
        savedAt: new Date().toISOString(),
      };
    }

    const res = await fetch(
      `/api/v1/hr-review/${encodeURIComponent(requestId)}/send-back/draft`,
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
        code: errorData.code || "SAVE_DRAFT_ERROR",
        message: errorData.message || "Failed to save send-back draft",
      };
    }

    return res.json();
  },

  /**
   * POST /api/v1/hr-review/{requestId}/send-back
   */
  async sendBack(
    requestId: string,
    payload: HrSendBackSubmitPayload
  ): Promise<HrSendBackSubmitResponse> {
    if (USE_FIXTURES) {
      await new Promise((resolve) => setTimeout(resolve, 600));

      // Client validation replicating server invariants
      if (!payload.message || !payload.message.trim()) {
        throw {
          code: "COMMENT_REQUIRED",
          message: "A message explaining what is needed is required.",
        };
      }

      if (!payload.idempotencyKey) {
        throw {
          code: "MISSING_IDEMPOTENCY_KEY",
          message: "Idempotency key is mandatory.",
        };
      }

      // Simulation triggers for TASK 4 error verification
      if (payload.message.includes("[test-locked-field]")) {
        throw {
          code: "SEND_BACK_FIELD_NOT_SELECTABLE",
          fieldKey: payload.editableFieldKeys[0] || "budgetAmount",
          fieldName: "Budget amount",
          message: "Field may have been locked since the page loaded.",
        };
      }

      if (payload.message.includes("[test-already-decided]")) {
        throw {
          code: "SEND_BACK_ALREADY_DECIDED",
          decidedBy: "Omar Al Hashmi",
          message: "This request was already decided by Omar Al Hashmi.",
        };
      }

      if (payload.message.includes("[test-scan-pending]")) {
        throw {
          code: "ATTACHMENT_SCAN_PENDING",
          message: "One attachment is still being checked.",
        };
      }

      if (payload.message.includes("[test-budget-changed]")) {
        throw {
          code: "HR_REVIEW_BUDGET_CHANGED",
          currentBudget: {
            reserved: 28500000,
            note: "Updated reservation based on concurrent financial change.",
          },
          message: "Budget figures have changed since review started.",
        };
      }

      if (payload.mode === "MORE_INFO" && payload.editableFieldKeys.length > 0) {
        throw {
          code: "INVALID_MODE_PAYLOAD",
          message: "Asking a question must not permit field editing.",
        };
      }

      return {
        success: true,
        message: "Request sent back to Mariam Al Mansoori.",
        requestId,
        cycleNumber: 2,
        nextStage: "REQUESTOR",
        recipient: {
          name: "Mariam Al Mansoori",
          email: "mariam.almansoori@diez.ae",
        },
      };
    }

    const res = await fetch(
      `/api/v1/hr-review/${encodeURIComponent(requestId)}/send-back`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Idempotency-Key": payload.idempotencyKey,
        },
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw {
        statusCode: res.status,
        code: errorData.code || "SEND_BACK_ERROR",
        message: errorData.message || "Failed to send request back",
        filename: errorData.filename,
        fieldKey: errorData.fieldKey,
      };
    }

    return res.json();
  },
};

/**
 * React Query Keys for HR Send-Back
 */
export const hrSendBackKeys = {
  all: ["hr-send-back"] as const,
  options: (requestId: string) =>
    [...hrSendBackKeys.all, "options", requestId] as const,
  draft: (requestId: string) =>
    [...hrSendBackKeys.all, "draft", requestId] as const,
};

/**
 * Hook 1: Fetch Send-Back Options
 */
export function useHrSendBackOptions(
  requestId: string,
  options?: Partial<UseQueryOptions<HrSendBackOptionsResponse>>
) {
  return useQuery({
    queryKey: hrSendBackKeys.options(requestId),
    queryFn: () => hrSendBackApi.getOptions(requestId),
    enabled: Boolean(requestId),
    staleTime: 30 * 1000,
    ...options,
  });
}

/**
 * Hook 2: Draft Save Hook with 2s Debounced Autosave
 */
export function useHrSendBackDraft(
  requestId: string,
  currentDraft?: HrSendBackDraftPayload,
  options?: { autoSave?: boolean }
) {
  const queryClient = useQueryClient();
  const [lastSavedAt, setLastSavedAt] = React.useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (payload: HrSendBackDraftPayload) =>
      hrSendBackApi.saveDraft(requestId, payload),
    onSuccess: (data) => {
      setLastSavedAt(data.savedAt);
      queryClient.invalidateQueries({
        queryKey: hrSendBackKeys.draft(requestId),
      });
    },
  });

  const debouncedDraft = useDebounce(currentDraft, 2000);

  // Trigger autosave when debounced draft changes and has meaningful content
  React.useEffect(() => {
    if (
      options?.autoSave !== false &&
      debouncedDraft &&
      (debouncedDraft.message?.trim().length > 0 ||
        (debouncedDraft.asks && debouncedDraft.asks.length > 0) ||
        (debouncedDraft.editableFieldKeys &&
          debouncedDraft.editableFieldKeys.length > 0) ||
        (debouncedDraft.attachmentIds &&
          debouncedDraft.attachmentIds.length > 0))
    ) {
      mutation.mutate(debouncedDraft);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedDraft]);

  return {
    saveDraft: (payload: HrSendBackDraftPayload) => mutation.mutate(payload),
    saveDraftAsync: (payload: HrSendBackDraftPayload) =>
      mutation.mutateAsync(payload),
    isSaving: mutation.isPending,
    lastSavedAt,
    error: mutation.error,
  };
}

/**
 * Hook 3: Send-Back Submission Mutation Hook
 */
export function useSubmitHrSendBack(requestId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: HrSendBackSubmitPayload) =>
      hrSendBackApi.sendBack(requestId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: hrSendBackKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: ["hr-review"],
      });
    },
  });
}
