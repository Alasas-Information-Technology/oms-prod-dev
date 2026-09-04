"use client";

import * as React from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import {
  InterviewPlanningResponse,
  InterviewDraftPayload,
  InterviewDraftResponse,
  InterviewSendPayload,
  InterviewSendResponse,
  InterviewEmailPreviewResponse,
  InterviewBypassRequestPayload,
  InterviewBypassRequestResponse,
} from "@/src/types/interview-planning";
import {
  MOCK_INTERVIEW_PLANNING_FIXTURES,
  FIXTURE_INTERVIEW_REFERENCE,
} from "./fixtures";
import { useDebounce } from "@/hooks/useDebounce";

/**
 * Feature flag for mock fixtures during frontend development
 */
export const USE_FIXTURES = true;

/**
 * Interview Planning API Service Layer
 */
export const interviewPlanningApi = {
  /**
   * GET /api/v1/requests/{requestId}/interviews/planning
   */
  async getPlanning(requestId: string): Promise<InterviewPlanningResponse> {
    if (USE_FIXTURES) {
      await new Promise((resolve) => setTimeout(resolve, 250));
      const match =
        MOCK_INTERVIEW_PLANNING_FIXTURES[requestId] ||
        FIXTURE_INTERVIEW_REFERENCE;
      return JSON.parse(JSON.stringify(match));
    }

    const res = await fetch(
      `/api/v1/requests/${encodeURIComponent(requestId)}/interviews/planning`
    );
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw {
        statusCode: res.status,
        code: errorData.code || "FETCH_PLANNING_ERROR",
        message: errorData.message || "Failed to load interview planning workspace",
      };
    }
    return res.json();
  },

  /**
   * PUT /api/v1/requests/{requestId}/interviews/planning/{candidateRef}/draft
   */
  async saveDraft(
    requestId: string,
    candidateRef: string,
    payload: InterviewDraftPayload
  ): Promise<InterviewDraftResponse> {
    if (USE_FIXTURES) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      return {
        success: true,
        savedAt: new Date().toISOString(),
        candidateRef,
      };
    }

    const res = await fetch(
      `/api/v1/requests/${encodeURIComponent(
        requestId
      )}/interviews/planning/${encodeURIComponent(candidateRef)}/draft`,
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
        message: errorData.message || "Failed to save proposal draft",
      };
    }
    return res.json();
  },

  /**
   * POST /api/v1/requests/{requestId}/interviews/planning/{candidateRef}/send
   */
  async sendSlots(
    requestId: string,
    candidateRef: string,
    payload: InterviewSendPayload
  ): Promise<InterviewSendResponse> {
    if (USE_FIXTURES) {
      await new Promise((resolve) => setTimeout(resolve, 400));

      if (payload.slots.length === 0) {
        throw {
          statusCode: 400,
          code: "INTERVIEW_NO_SLOTS",
          message: "Please propose at least one interview slot.",
        };
      }

      // Check if earliest slot date violates replyByDate
      const earliestSlot = [...payload.slots].sort((a, b) =>
        a.start.localeCompare(b.start)
      )[0];
      const earliestSlotDate = earliestSlot.start.split("T")[0];
      if (payload.replyByDate >= earliestSlotDate) {
        throw {
          statusCode: 422,
          code: "INTERVIEW_REPLY_DATE_INVALID",
          message: `The reply deadline must be before the earliest proposed slot date (${earliestSlotDate}).`,
          earliestSlot: earliestSlot.start,
          latestReplyDate: earliestSlotDate,
        };
      }

      return {
        success: true,
        message: `${payload.slots.length} interview slots sent to candidate ${candidateRef} via vendor relay.`,
        candidateRef,
        sentAt: new Date().toISOString(),
        status: "AWAITING_REPLY",
      };
    }

    const res = await fetch(
      `/api/v1/requests/${encodeURIComponent(
        requestId
      )}/interviews/planning/${encodeURIComponent(candidateRef)}/send`,
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
        code: errorData.code || "SEND_SLOTS_ERROR",
        message: errorData.message || "Failed to send interview slots",
        slotStart: errorData.slotStart,
        earliestSlot: errorData.earliestSlot,
        latestReplyDate: errorData.latestReplyDate,
      };
    }
    return res.json();
  },

  /**
   * GET /api/v1/requests/{requestId}/interviews/planning/{candidateRef}/preview-email
   */
  async getPreviewEmail(
    requestId: string,
    candidateRef: string
  ): Promise<InterviewEmailPreviewResponse> {
    if (USE_FIXTURES) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      return {
        subject: "Interview Invitation — Senior Cybersecurity Analyst",
        bodyText: `You are invited to an interview for the Senior Cybersecurity Analyst position.\n\nMethod: Online (Microsoft Teams)\nDuration: 45 minutes\n\nProposed Times (GST):\n- Mon, 10 Aug 2026 at 10:00 GST\n- Mon, 10 Aug 2026 at 14:00 GST\n- Tue, 11 Aug 2026 at 14:00 GST\n\nPlease confirm your preferred time by 14 Aug 2026.`,
        bodyHtml: `<div style="font-family: sans-serif; line-height: 1.5; color: #1e293b;">
          <p>Dear Candidate,</p>
          <p>You have been shortlisted and invited to an interview for the <strong>Senior Cybersecurity Analyst</strong> role.</p>
          <p><strong>Method:</strong> Online (Microsoft Teams)<br/><strong>Duration:</strong> 45 minutes</p>
          <p><strong>Proposed Times:</strong></p>
          <ul>
            <li>Mon, 10 Aug 2026 at 10:00 GST</li>
            <li>Mon, 10 Aug 2026 at 14:00 GST</li>
            <li>Tue, 11 Aug 2026 at 14:00 GST</li>
          </ul>
          <p>Please select your preferred time by <strong>14 Aug 2026</strong>.</p>
        </div>`,
        candidateRef,
        proposedSlots: [
          {
            startUtc: "2026-08-10T06:00:00Z",
            endUtc: "2026-08-10T06:45:00Z",
            localTimeCandidate: "Mon 10 Aug, 10:00 – 10:45 GST",
            durationMinutes: 45,
          },
          {
            startUtc: "2026-08-10T10:00:00Z",
            endUtc: "2026-08-10T10:45:00Z",
            localTimeCandidate: "Mon 10 Aug, 14:00 – 14:45 GST",
            durationMinutes: 45,
          },
          {
            startUtc: "2026-08-11T10:00:00Z",
            endUtc: "2026-08-11T10:45:00Z",
            localTimeCandidate: "Tue 11 Aug, 14:00 – 14:45 GST",
            durationMinutes: 45,
          },
        ],
        replyByDate: "2026-08-14",
        method: "ONLINE",
        platformOrLocation: "Microsoft Teams",
        blindBoundaryNotice:
          "Sent through the vendor relay. The vendor's identity stays hidden from you, and your contact details stay hidden from them.",
      };
    }

    const res = await fetch(
      `/api/v1/requests/${encodeURIComponent(
        requestId
      )}/interviews/planning/${encodeURIComponent(candidateRef)}/preview-email`
    );
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw {
        statusCode: res.status,
        code: errorData.code || "PREVIEW_EMAIL_ERROR",
        message: errorData.message || "Failed to load email preview",
      };
    }
    return res.json();
  },

  /**
   * POST /api/v1/requests/{requestId}/interviews/planning/{candidateRef}/bypass-request
   */
  async requestBypass(
    requestId: string,
    candidateRef: string,
    payload: InterviewBypassRequestPayload
  ): Promise<InterviewBypassRequestResponse> {
    if (USE_FIXTURES) {
      await new Promise((resolve) => setTimeout(resolve, 350));
      return {
        success: true,
        message: `Interview bypass request submitted to Khalid Al Suwaidi for candidate ${candidateRef}.`,
        candidateRef,
        routedTo: "Khalid Al Suwaidi",
        status: "BYPASS_REQUESTED",
      };
    }

    const res = await fetch(
      `/api/v1/requests/${encodeURIComponent(
        requestId
      )}/interviews/planning/${encodeURIComponent(candidateRef)}/bypass-request`,
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
        code: errorData.code || "BYPASS_REQUEST_ERROR",
        message: errorData.message || "Failed to submit bypass request",
      };
    }
    return res.json();
  },
};

/**
 * React Query Keys for Interview Planning
 */
export const interviewPlanningKeys = {
  all: ["interview-planning"] as const,
  planning: (requestId: string) =>
    [...interviewPlanningKeys.all, "planning", requestId] as const,
  draft: (requestId: string, candidateRef: string) =>
    [...interviewPlanningKeys.all, "draft", requestId, candidateRef] as const,
  previewEmail: (requestId: string, candidateRef: string) =>
    [...interviewPlanningKeys.all, "previewEmail", requestId, candidateRef] as const,
};

/**
 * Hook 1: Fetch Full Interview Planning Workspace Data
 */
export function useInterviewPlanning(
  requestId: string,
  options?: Partial<UseQueryOptions<InterviewPlanningResponse>>
) {
  return useQuery({
    queryKey: interviewPlanningKeys.planning(requestId),
    queryFn: () => interviewPlanningApi.getPlanning(requestId),
    enabled: Boolean(requestId),
    staleTime: 30 * 1000,
    ...options,
  });
}

/**
 * Hook 2: Candidate Proposal Draft with 2-second Debounced Autosave
 */
export function useInterviewDraft(
  requestId: string,
  candidateRef: string,
  currentDraft?: InterviewDraftPayload,
  options?: { autoSave?: boolean }
) {
  const queryClient = useQueryClient();
  const [lastSavedAt, setLastSavedAt] = React.useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (payload: InterviewDraftPayload) =>
      interviewPlanningApi.saveDraft(requestId, candidateRef, payload),
    onSuccess: (data) => {
      setLastSavedAt(data.savedAt);
      queryClient.invalidateQueries({
        queryKey: interviewPlanningKeys.draft(requestId, candidateRef),
      });
    },
  });

  // 2s debounced draft value for autosave
  const debouncedDraft = useDebounce(currentDraft, 2000);

  React.useEffect(() => {
    if (
      options?.autoSave !== false &&
      debouncedDraft &&
      debouncedDraft.slots &&
      debouncedDraft.slots.length > 0
    ) {
      mutation.mutate(debouncedDraft);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedDraft]);

  return {
    saveDraft: (payload: InterviewDraftPayload) => mutation.mutate(payload),
    saveDraftAsync: (payload: InterviewDraftPayload) =>
      mutation.mutateAsync(payload),
    isSaving: mutation.isPending,
    lastSavedAt,
    error: mutation.error,
  };
}

/**
 * Hook 3: Send Proposed Slots to Candidate Mutation Hook
 */
export function useSendInterviewSlots(requestId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      candidateRef,
      payload,
    }: {
      candidateRef: string;
      payload: InterviewSendPayload;
    }) => interviewPlanningApi.sendSlots(requestId, candidateRef, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: interviewPlanningKeys.planning(requestId),
      });
    },
  });
}

/**
 * Hook 4: Candidate Email Preview Hook (Blind Boundary Modal)
 */
export function useInterviewEmailPreview(
  requestId: string,
  candidateRef: string,
  options?: Partial<UseQueryOptions<InterviewEmailPreviewResponse>>
) {
  return useQuery({
    queryKey: interviewPlanningKeys.previewEmail(requestId, candidateRef),
    queryFn: () => interviewPlanningApi.getPreviewEmail(requestId, candidateRef),
    enabled: Boolean(requestId && candidateRef),
    staleTime: 60 * 1000,
    ...options,
  });
}

/**
 * Hook 5: Request Interview Bypass Mutation Hook
 */
export function useBypassInterview(requestId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      candidateRef,
      payload,
    }: {
      candidateRef: string;
      payload: InterviewBypassRequestPayload;
    }) => interviewPlanningApi.requestBypass(requestId, candidateRef, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: interviewPlanningKeys.planning(requestId),
      });
    },
  });
}
