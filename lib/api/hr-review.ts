import {
  HrConfirmationUpdatePayload,
  HrDecisionPayload,
  HrReviewDetailResponse,
  HrReviewQueueResponse,
} from "@/types/hr-review";
import {
  MOCK_HR_DETAIL_FAILED_CHECK,
  MOCK_HR_DETAIL_OVERDUE,
  MOCK_HR_DETAIL_REFERENCE,
  MOCK_HR_DETAIL_RETURNED,
  MOCK_HR_QUEUE,
  getHrReviewQueueFixture,
  getHrReviewDetailFixture,
} from "../hr-review/fixtures";

export interface HrReviewQueueQuery {
  department?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}

export const hrReviewApi = {
  async getQueue(query?: HrReviewQueueQuery): Promise<HrReviewQueueResponse> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return getHrReviewQueueFixture(query);
  },

  async getDetail(requestId: string): Promise<HrReviewDetailResponse> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const detail = getHrReviewDetailFixture(requestId);

    if (!detail) {
      throw new Error("404 Not Found");
    }

    return detail;
  },

  async updateConfirmation(
    requestId: string,
    payload: HrConfirmationUpdatePayload
  ): Promise<{ success: boolean }> {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return { success: true };
  },

  async submitDecision(
    requestId: string,
    payload: HrDecisionPayload
  ): Promise<{ success: boolean; message: string }> {
    if (!payload.idempotencyKey) {
      throw { code: "MISSING_IDEMPOTENCY_KEY", message: "Idempotency key is required" };
    }
    if (!payload.comment?.trim()) {
      throw { code: "COMMENT_REQUIRED", message: "Comment is required" };
    }
    if (payload.decision === "SEND_BACK" && !payload.sendBackMode) {
      throw { code: "SEND_BACK_MODE_REQUIRED", message: "Send back mode is required" };
    }

    await new Promise((resolve) => setTimeout(resolve, 800));

    // Simulate budget error based on strict invariant mock checks
    if (requestId === "OMS-2026-0143") {
      throw {
        code: "HR_REVIEW_BUDGET_CHANGED",
        message: "Budget position changed. Insufficient funds available.",
      };
    }

    return { success: true, message: "Decision submitted successfully" };
  },
};
