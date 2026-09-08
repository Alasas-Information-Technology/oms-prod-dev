"use client";

import * as React from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import {
  InterviewEvaluationWorkspace,
  InterviewOutcomePayload,
  InterviewOutcomeResponse,
  InterviewEvaluationDraftPayload,
  InterviewEvaluationDraftResponse,
  InterviewEvaluationSubmitPayload,
  InterviewEvaluationSubmitResponse,
  InterviewEvaluationError,
} from "@/src/types/interview-evaluation";
import {
  MOCK_INTERVIEW_EVALUATION_FIXTURES,
  FIXTURE_EVALUATION_REFERENCE,
} from "./fixtures";
import { useDebounce } from "@/hooks/useDebounce";

/**
 * Feature flag for mock fixtures during frontend development
 */
export const USE_FIXTURES = true;

/**
 * Interview Evaluation API Service Layer
 */
export const interviewEvaluationApi = {
  /**
   * GET /api/v1/requests/{requestId}/interviews/{candidateRef}/evaluation
   */
  async getEvaluation(
    requestId: string,
    candidateRef: string,
    fixtureKey?: string
  ): Promise<InterviewEvaluationWorkspace> {
    if (USE_FIXTURES) {
      await new Promise((resolve) => setTimeout(resolve, 250));

      const key = fixtureKey || `${requestId}-${candidateRef}`;
      const match =
        MOCK_INTERVIEW_EVALUATION_FIXTURES[key] ||
        MOCK_INTERVIEW_EVALUATION_FIXTURES[fixtureKey || ""] ||
        FIXTURE_EVALUATION_REFERENCE;

      return JSON.parse(JSON.stringify(match));
    }

    const res = await fetch(
      `/api/v1/requests/${encodeURIComponent(
        requestId
      )}/interviews/${encodeURIComponent(candidateRef)}/evaluation`
    );

    if (!res.ok) {
      const errorData = (await res.json().catch(() => ({}))) as Partial<InterviewEvaluationError>;
      throw {
        statusCode: res.status,
        code: errorData.code || "FETCH_EVALUATION_ERROR",
        message:
          errorData.message || "Failed to load candidate evaluation workspace",
        details: errorData.details,
      };
    }

    return res.json();
  },

  /**
   * POST /api/v1/requests/{requestId}/interviews/{candidateRef}/evaluation/interview-outcome
   */
  async confirmInterviewOutcome(
    requestId: string,
    candidateRef: string,
    payload: InterviewOutcomePayload
  ): Promise<InterviewOutcomeResponse> {
    if (USE_FIXTURES) {
      await new Promise((resolve) => setTimeout(resolve, 250));
      return {
        success: true,
        occurred: payload.occurred,
        updatedAt: new Date().toISOString(),
      };
    }

    const res = await fetch(
      `/api/v1/requests/${encodeURIComponent(
        requestId
      )}/interviews/${encodeURIComponent(candidateRef)}/evaluation/interview-outcome`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) {
      const errorData = (await res.json().catch(() => ({}))) as Partial<InterviewEvaluationError>;
      throw {
        statusCode: res.status,
        code: errorData.code || "CONFIRM_INTERVIEW_ERROR",
        message:
          errorData.message || "Failed to confirm interview occurrence status",
        details: errorData.details,
      };
    }

    return res.json();
  },

  /**
   * PUT /api/v1/requests/{requestId}/interviews/{candidateRef}/evaluation/draft
   */
  async saveDraft(
    requestId: string,
    candidateRef: string,
    payload: InterviewEvaluationDraftPayload
  ): Promise<InterviewEvaluationDraftResponse> {
    if (USE_FIXTURES) {
      await new Promise((resolve) => setTimeout(resolve, 200));

      let overallScore: number | null = 86.7;
      let overallAnchor: string | null = "Above requirement";

      if (payload.ratings && payload.ratings.length > 0) {
        const weights: Record<string, number> = {
          TECHNICAL_EXPERTISE: 25,
          CYBERSECURITY_OPS: 20,
          PROBLEM_SOLVING: 15,
          COMMUNICATION: 15,
          INCIDENT_RESPONSE: 15,
          DIEZ_FIT: 10,
        };
        let totalWeighted = 0;
        let totalWeight = 0;
        for (const r of payload.ratings) {
          const w = weights[r.criterionCode] || 15;
          totalWeighted += (r.rating / 5) * w;
          totalWeight += w;
        }
        if (totalWeight > 0) {
          overallScore = Math.round(((totalWeighted / totalWeight) * 100) * 10) / 10;
          if (overallScore >= 90) overallAnchor = "Outstanding";
          else if (overallScore >= 80) overallAnchor = "Above requirement";
          else if (overallScore >= 60) overallAnchor = "Meets requirement";
          else if (overallScore >= 40) overallAnchor = "Below requirement";
          else overallAnchor = "Well below requirement";
        }
      }

      return {
        success: true,
        savedAt: new Date().toISOString(),
        overallScore,
        overallAnchor,
      };
    }

    const res = await fetch(
      `/api/v1/requests/${encodeURIComponent(
        requestId
      )}/interviews/${encodeURIComponent(candidateRef)}/evaluation/draft`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) {
      const errorData = (await res.json().catch(() => ({}))) as Partial<InterviewEvaluationError>;
      throw {
        statusCode: res.status,
        code: errorData.code || "SAVE_DRAFT_ERROR",
        message: errorData.message || "Failed to save evaluation draft",
        details: errorData.details,
      };
    }

    return res.json();
  },

  /**
   * POST /api/v1/requests/{requestId}/interviews/{candidateRef}/evaluation/submit
   */
  async submitEvaluation(
    requestId: string,
    candidateRef: string,
    payload: InterviewEvaluationSubmitPayload
  ): Promise<InterviewEvaluationSubmitResponse> {
    if (USE_FIXTURES) {
      await new Promise((resolve) => setTimeout(resolve, 400));

      if (!payload.idempotencyKey) {
        throw {
          statusCode: 400,
          code: "EVALUATION_IDEMPOTENCY_MISSING",
          message: "Idempotency key is required.",
        };
      }

      if (payload.outcome === "REJECT" && !payload.rejectionReasonCode) {
        throw {
          statusCode: 422,
          code: "EVALUATION_REJECTION_REASON_REQUIRED",
          message: "A rejection reason must be selected.",
        };
      }

      return {
        success: true,
        submittedAt: new Date().toISOString(),
        outcome: payload.outcome || "RATINGS_ONLY",
        rejectionReasonCode:
          payload.outcome === "REJECT" ? payload.rejectionReasonCode : null,
        budgetAmendmentQueued: payload.outcome === "QUALIFY",
        message:
          payload.outcome === "QUALIFY"
            ? `Candidate ${candidateRef} qualified. Procurement has been notified to begin onboarding.`
            : payload.outcome === "REJECT"
            ? `Candidate ${candidateRef} rejected. Retention decision applied.`
            : `Your evaluation ratings have been recorded for candidate ${candidateRef}.`,
      };
    }

    const res = await fetch(
      `/api/v1/requests/${encodeURIComponent(
        requestId
      )}/interviews/${encodeURIComponent(candidateRef)}/evaluation/submit`,
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
      const errorData = (await res.json().catch(() => ({}))) as Partial<InterviewEvaluationError>;
      throw {
        statusCode: res.status,
        code: errorData.code || "SUBMIT_EVALUATION_ERROR",
        message: errorData.message || "Failed to submit evaluation",
        details: errorData.details,
      };
    }

    return res.json();
  },
};

/**
 * React Query Keys for Interview Evaluation
 */
export const interviewEvaluationKeys = {
  all: ["interview-evaluation"] as const,
  detail: (requestId: string, candidateRef: string) =>
    [...interviewEvaluationKeys.all, "detail", requestId, candidateRef] as const,
  draft: (requestId: string, candidateRef: string) =>
    [...interviewEvaluationKeys.all, "draft", requestId, candidateRef] as const,
};

/**
 * Hook 1: Fetch Evaluation Workspace
 */
export function useInterviewEvaluation(
  requestId: string,
  candidateRef: string,
  options?: Partial<UseQueryOptions<InterviewEvaluationWorkspace>>,
  fixtureKey?: string
) {
  return useQuery({
    queryKey: [
      ...interviewEvaluationKeys.detail(requestId, candidateRef),
      fixtureKey,
    ],
    queryFn: () =>
      interviewEvaluationApi.getEvaluation(requestId, candidateRef, fixtureKey),
    enabled: Boolean(requestId) && Boolean(candidateRef),
    staleTime: 30 * 1000,
    ...options,
  });
}

/**
 * Hook 2: Confirm Interview Occurrence Mutation Hook (RFP Step 6)
 */
export function useConfirmInterviewOutcome(
  requestId: string,
  candidateRef: string
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: InterviewOutcomePayload) =>
      interviewEvaluationApi.confirmInterviewOutcome(
        requestId,
        candidateRef,
        payload
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: interviewEvaluationKeys.detail(requestId, candidateRef),
      });
    },
  });
}

/**
 * Hook 3: Draft Save Hook with 2000ms Debounced Autosave
 */
export function useInterviewEvaluationDraft(
  requestId: string,
  candidateRef: string,
  currentDraft?: InterviewEvaluationDraftPayload,
  options?: {
    autoSave?: boolean;
    onSaveSuccess?: (data: InterviewEvaluationDraftResponse) => void;
  }
) {
  const queryClient = useQueryClient();
  const [lastSavedAt, setLastSavedAt] = React.useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (payload: InterviewEvaluationDraftPayload) =>
      interviewEvaluationApi.saveDraft(requestId, candidateRef, payload),
    onSuccess: (data) => {
      setLastSavedAt(data.savedAt);
      options?.onSaveSuccess?.(data);
      queryClient.invalidateQueries({
        queryKey: interviewEvaluationKeys.draft(requestId, candidateRef),
      });
    },
  });

  const debouncedDraft = useDebounce(currentDraft, 2000);

  // Trigger autosave when debounced draft changes and has content
  React.useEffect(() => {
    if (
      options?.autoSave &&
      debouncedDraft &&
      (debouncedDraft.comments?.trim().length > 0 ||
        (debouncedDraft.ratings && debouncedDraft.ratings.length > 0) ||
        (debouncedDraft.strengthTags && debouncedDraft.strengthTags.length > 0) ||
        (debouncedDraft.developmentTags && debouncedDraft.developmentTags.length > 0))
    ) {
      mutation.mutate(debouncedDraft);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedDraft, options?.autoSave]);

  return {
    saveDraft: (payload: InterviewEvaluationDraftPayload) =>
      mutation.mutate(payload),
    saveDraftAsync: (payload: InterviewEvaluationDraftPayload) =>
      mutation.mutateAsync(payload),
    isSaving: mutation.isPending,
    lastSavedAt,
    error: mutation.error,
  };
}

/**
 * Hook 4: Final Evaluation Submit Mutation Hook
 */
export function useSubmitInterviewEvaluation(
  requestId: string,
  candidateRef: string
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: InterviewEvaluationSubmitPayload) =>
      interviewEvaluationApi.submitEvaluation(requestId, candidateRef, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: interviewEvaluationKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: ["interviews"],
      });
    },
  });
}
