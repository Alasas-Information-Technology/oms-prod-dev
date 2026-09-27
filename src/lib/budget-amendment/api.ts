"use client";

import * as React from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import {
  BudgetAmendmentWorkspace,
  AmendmentPreviewPayload,
  AmendmentPreviewResponse,
  BudgetAmendmentDraftPayload,
  BudgetAmendmentDraftResponse,
  BudgetAmendmentSubmitPayload,
  BudgetAmendmentSubmitResponse,
  BudgetAmendmentCancelPayload,
  BudgetAmendmentCancelResponse,
  BudgetAmendmentError,
  FundingRouteCode,
  AmendmentAllocationInput,
} from "@/src/types/budget-amendment";
import {
  MOCK_BUDGET_AMENDMENT_FIXTURES,
  FIXTURE_AMENDMENT_REFERENCE,
  computeMockAmendmentPreview,
  getBudgetAmendmentFixture,
} from "./fixtures";
import { useDebounce } from "@/hooks/useDebounce";

/**
 * Feature flag for mock fixtures during frontend development
 */
export const USE_FIXTURES = true;

/**
 * Budget Amendment API Service Layer
 */
export const budgetAmendmentApi = {
  /**
   * GET /api/v1/requests/{requestId}/amendments/{amendmentId}
   */
  async getAmendment(
    requestId: string,
    amendmentId: string,
    fixtureKey?: string
  ): Promise<BudgetAmendmentWorkspace> {
    if (USE_FIXTURES) {
      await new Promise((resolve) => setTimeout(resolve, 200));

      let activeUserId: string | undefined;
      if (typeof window !== "undefined") {
        activeUserId = localStorage.getItem("oms_demo_persona") || undefined;
      }

      // 1. Try demo-data query first
      const fixture = getBudgetAmendmentFixture(requestId, amendmentId, activeUserId);
      if (fixture) {
        return JSON.parse(JSON.stringify(fixture));
      }

      // 2. Check explicit fixture key override
      const key = fixtureKey || `${requestId}-${amendmentId}`;
      const match =
        MOCK_BUDGET_AMENDMENT_FIXTURES[key] ||
        MOCK_BUDGET_AMENDMENT_FIXTURES[fixtureKey || ""] ||
        MOCK_BUDGET_AMENDMENT_FIXTURES[amendmentId];

      if (match) {
        return JSON.parse(JSON.stringify(match));
      }

      throw {
        statusCode: 404,
        code: "NOT_FOUND",
        message: `Candidate budget amendment ${amendmentId} on request ${requestId} not found`,
      };
    }

    const res = await fetch(
      `/api/v1/requests/${encodeURIComponent(
        requestId
      )}/amendments/${encodeURIComponent(amendmentId)}`
    );

    if (!res.ok) {
      const errorData = (await res.json().catch(() => ({}))) as Partial<BudgetAmendmentError>;
      throw {
        statusCode: res.status,
        code: errorData.code || "FETCH_AMENDMENT_ERROR",
        message: errorData.message || "Failed to load candidate budget amendment workspace",
        details: errorData.details,
      };
    }

    return res.json();
  },

  /**
   * POST /api/v1/requests/{requestId}/amendments/{amendmentId}/preview
   * Debounced at 500ms on the client.
   */
  async previewAmendment(
    requestId: string,
    amendmentId: string,
    payload: AmendmentPreviewPayload,
    fixtureKey?: string
  ): Promise<AmendmentPreviewResponse> {
    if (USE_FIXTURES) {
      await new Promise((resolve) => setTimeout(resolve, 150));

      const key = fixtureKey || `${requestId}-${amendmentId}`;
      const workspace =
        MOCK_BUDGET_AMENDMENT_FIXTURES[key] ||
        MOCK_BUDGET_AMENDMENT_FIXTURES[fixtureKey || ""] ||
        MOCK_BUDGET_AMENDMENT_FIXTURES[amendmentId] ||
        FIXTURE_AMENDMENT_REFERENCE;

      return computeMockAmendmentPreview(
        workspace,
        payload.fundingRoute,
        payload.allocations
      );
    }

    const res = await fetch(
      `/api/v1/requests/${encodeURIComponent(
        requestId
      )}/amendments/${encodeURIComponent(amendmentId)}/preview`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) {
      const errorData = (await res.json().catch(() => ({}))) as Partial<BudgetAmendmentError>;
      throw {
        statusCode: res.status,
        code: errorData.code || "PREVIEW_AMENDMENT_ERROR",
        message: errorData.message || "Failed to calculate revised budget position preview",
        details: errorData.details,
      };
    }

    return res.json();
  },

  /**
   * PUT /api/v1/requests/{requestId}/amendments/{amendmentId}/draft
   * Debounced at 2000ms on the client.
   */
  async saveDraft(
    requestId: string,
    amendmentId: string,
    payload: BudgetAmendmentDraftPayload
  ): Promise<BudgetAmendmentDraftResponse> {
    if (USE_FIXTURES) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      return {
        success: true,
        savedAt: new Date().toISOString(),
        amendmentId,
      };
    }

    const res = await fetch(
      `/api/v1/requests/${encodeURIComponent(
        requestId
      )}/amendments/${encodeURIComponent(amendmentId)}/draft`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) {
      const errorData = (await res.json().catch(() => ({}))) as Partial<BudgetAmendmentError>;
      throw {
        statusCode: res.status,
        code: errorData.code || "SAVE_DRAFT_ERROR",
        message: errorData.message || "Failed to save budget amendment draft",
        details: errorData.details,
      };
    }

    return res.json();
  },

  /**
   * POST /api/v1/requests/{requestId}/amendments/{amendmentId}/submit
   * Requires mandatory idempotency key header.
   */
  async submitAmendment(
    requestId: string,
    amendmentId: string,
    payload: BudgetAmendmentSubmitPayload
  ): Promise<BudgetAmendmentSubmitResponse> {
    if (USE_FIXTURES) {
      await new Promise((resolve) => setTimeout(resolve, 350));

      if (!payload.idempotencyKey) {
        throw {
          statusCode: 400,
          code: "AMENDMENT_IDEMPOTENCY_MISSING",
          message: "Idempotency key is required for submission.",
        };
      }

      // Allow simulated error testing
      if ((payload as any)._simulatedError) {
        throw (payload as any)._simulatedError;
      }
      if (payload.justification?.includes("__TEST_ERR_INSUFFICIENT__")) {
        throw {
          statusCode: 422,
          code: "AMENDMENT_INSUFFICIENT_FUNDS",
          message: "Line has insufficient available funds to fulfill amendment request.",
          details: {
            lineId: payload.allocations[0]?.lineId || "line-cs-001",
            lineName: "Cybersecurity Services FY2026",
            currentAvailable: 1000000,
            requested: payload.allocations[0]?.amount || 2000000,
          },
        };
      }
      if (payload.justification?.includes("__TEST_ERR_LINE_CLOSED__")) {
        throw {
          statusCode: 422,
          code: "AMENDMENT_LINE_CLOSED",
          message: "The requested budget line is closed and cannot accept allocations.",
          details: {
            lineId: payload.allocations[0]?.lineId || "line-cs-001",
            lineName: "Cybersecurity Services FY2026",
          },
        };
      }
      if (payload.justification?.includes("__TEST_ERR_ALREADY_DECIDED__")) {
        throw {
          statusCode: 409,
          code: "AMENDMENT_ALREADY_DECIDED",
          message: "Amendment was already decided by Tariq Mansoor on 2026-08-14T09:30:00Z.",
          details: {
            decidedBy: "Tariq Mansoor",
            decidedAt: "2026-08-14T09:30:00Z",
            decision: "REJECTED",
          },
        };
      }

      if (payload.fundingRoute === "UNBUDGETED" && payload.allocations.length > 0) {
        throw {
          statusCode: 422,
          code: "AMENDMENT_UNBUDGETED_ALLOCATIONS_FORBIDDEN",
          message: "Unbudgeted route does not accept line allocations.",
        };
      }

      const nextApprover =
        payload.fundingRoute === "UNBUDGETED"
          ? { name: "Fatima Al Suwaidi", stage: "HR" }
          : { name: "Omar Al Hashmi", stage: "LINE_MANAGER" };

      return {
        success: true,
        submittedAt: new Date().toISOString(),
        amendmentId,
        nextApprover,
        message: `Amendment submitted. It now goes to ${nextApprover.name} for approval.`,
      };
    }

    const res = await fetch(
      `/api/v1/requests/${encodeURIComponent(
        requestId
      )}/amendments/${encodeURIComponent(amendmentId)}/submit`,
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
      const errorData = (await res.json().catch(() => ({}))) as Partial<BudgetAmendmentError>;
      throw {
        statusCode: res.status,
        code: errorData.code || "SUBMIT_AMENDMENT_ERROR",
        message: errorData.message || "Failed to submit budget amendment",
        details: errorData.details,
      };
    }

    return res.json();
  },

  /**
   * POST /api/v1/requests/{requestId}/amendments/{amendmentId}/cancel
   */
  async cancelAmendment(
    requestId: string,
    amendmentId: string,
    payload: BudgetAmendmentCancelPayload
  ): Promise<BudgetAmendmentCancelResponse> {
    if (USE_FIXTURES) {
      await new Promise((resolve) => setTimeout(resolve, 250));
      return {
        success: true,
        cancelledAt: new Date().toISOString(),
        candidateRef: "C-009",
        candidateStatus: "QUALIFIED_PENDING_BUDGET",
        message: "Amendment cancelled. C-009 is Qualified, pending budget.",
      };
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (payload.idempotencyKey) {
      headers["X-Idempotency-Key"] = payload.idempotencyKey;
    }

    const res = await fetch(
      `/api/v1/requests/${encodeURIComponent(
        requestId
      )}/amendments/${encodeURIComponent(amendmentId)}/cancel`,
      {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) {
      const errorData = (await res.json().catch(() => ({}))) as Partial<BudgetAmendmentError>;
      throw {
        statusCode: res.status,
        code: errorData.code || "CANCEL_AMENDMENT_ERROR",
        message: errorData.message || "Failed to cancel budget amendment",
        details: errorData.details,
      };
    }

    return res.json();
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// React Query Keys
// ─────────────────────────────────────────────────────────────────────────────

export const budgetAmendmentKeys = {
  all: ["budget-amendment"] as const,
  detail: (requestId: string, amendmentId: string) =>
    [...budgetAmendmentKeys.all, "detail", requestId, amendmentId] as const,
  preview: (
    requestId: string,
    amendmentId: string,
    fundingRoute: string,
    allocationsKey: string
  ) =>
    [
      ...budgetAmendmentKeys.all,
      "preview",
      requestId,
      amendmentId,
      fundingRoute,
      allocationsKey,
    ] as const,
  draft: (requestId: string, amendmentId: string) =>
    [...budgetAmendmentKeys.all, "draft", requestId, amendmentId] as const,
};

// ─────────────────────────────────────────────────────────────────────────────
// React Query Hooks
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Hook 1: Fetch Budget Amendment Workspace
 */
export function useBudgetAmendment(
  requestId: string,
  amendmentId: string,
  options?: Partial<UseQueryOptions<BudgetAmendmentWorkspace>>,
  fixtureKey?: string
) {
  return useQuery({
    queryKey: [
      ...budgetAmendmentKeys.detail(requestId, amendmentId),
      fixtureKey,
    ],
    queryFn: () =>
      budgetAmendmentApi.getAmendment(requestId, amendmentId, fixtureKey),
    enabled: Boolean(requestId) && Boolean(amendmentId),
    staleTime: 30 * 1000,
    ...options,
  });
}

/**
 * Hook 2: Preview Revised Budget Position with 500ms Debounce
 */
export function useBudgetAmendmentPreview(
  requestId: string,
  amendmentId: string,
  fundingRoute: FundingRouteCode,
  allocations: AmendmentAllocationInput[],
  options?: Partial<UseQueryOptions<AmendmentPreviewResponse>>,
  fixtureKey?: string
) {
  // Debounce the input allocations by 500ms to avoid spamming the preview endpoint
  const debouncedAllocations = useDebounce(allocations, 500);
  const allocationsKey = React.useMemo(
    () => JSON.stringify(debouncedAllocations || []),
    [debouncedAllocations]
  );

  return useQuery({
    queryKey: [
      ...budgetAmendmentKeys.preview(
        requestId,
        amendmentId,
        fundingRoute,
        allocationsKey
      ),
      fixtureKey,
    ],
    queryFn: () =>
      budgetAmendmentApi.previewAmendment(
        requestId,
        amendmentId,
        {
          fundingRoute,
          allocations: debouncedAllocations || [],
        },
        fixtureKey
      ),
    enabled: Boolean(requestId) && Boolean(amendmentId) && Boolean(fundingRoute),
    staleTime: 10 * 1000,
    ...options,
  });
}

/**
 * Hook 3: Draft Save Hook with 2000ms Debounced Autosave
 */
export function useBudgetAmendmentDraft(
  requestId: string,
  amendmentId: string,
  currentDraft?: BudgetAmendmentDraftPayload,
  options?: {
    autoSave?: boolean;
    onSaveSuccess?: (data: BudgetAmendmentDraftResponse) => void;
  }
) {
  const queryClient = useQueryClient();
  const [lastSavedAt, setLastSavedAt] = React.useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (payload: BudgetAmendmentDraftPayload) =>
      budgetAmendmentApi.saveDraft(requestId, amendmentId, payload),
    onSuccess: (data) => {
      setLastSavedAt(data.savedAt);
      options?.onSaveSuccess?.(data);
      queryClient.invalidateQueries({
        queryKey: budgetAmendmentKeys.draft(requestId, amendmentId),
      });
    },
  });

  // Debounce draft autosave by 2000ms
  const debouncedDraft = useDebounce(currentDraft, 2000);

  React.useEffect(() => {
    if (
      options?.autoSave &&
      debouncedDraft &&
      (Boolean(debouncedDraft.justification?.trim()) ||
        (debouncedDraft.allocations && debouncedDraft.allocations.length > 0))
    ) {
      mutation.mutate(debouncedDraft);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedDraft, options?.autoSave]);

  return {
    saveDraft: (payload: BudgetAmendmentDraftPayload) => mutation.mutate(payload),
    saveDraftAsync: (payload: BudgetAmendmentDraftPayload) =>
      mutation.mutateAsync(payload),
    isSaving: mutation.isPending,
    lastSavedAt,
    error: mutation.error,
  };
}

/**
 * Hook 4: Submit Final Amendment for Approval Mutation Hook
 */
export function useSubmitBudgetAmendment(
  requestId: string,
  amendmentId: string
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: BudgetAmendmentSubmitPayload) =>
      budgetAmendmentApi.submitAmendment(requestId, amendmentId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: budgetAmendmentKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: ["requests", requestId],
      });
    },
  });
}

/**
 * Hook 5: Cancel Amendment Mutation Hook
 */
export function useCancelBudgetAmendment(
  requestId: string,
  amendmentId: string
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: BudgetAmendmentCancelPayload) =>
      budgetAmendmentApi.cancelAmendment(requestId, amendmentId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: budgetAmendmentKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: ["requests", requestId],
      });
    },
  });
}
