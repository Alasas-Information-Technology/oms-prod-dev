import { ApprovalsListResponse, ApprovalTaskDetail } from "@/lib/types/approval.types";
import {
  getApprovalDetailFixture,
  getApprovalTasksForUserFixture,
  listApprovalTasksFixture,
} from "@/lib/fixtures/approval.fixtures";

export interface ApprovalsQueryDto {
  status?: string;
  type?: string;
  page?: number;
  pageSize?: number;
  userId?: string;
}

export const approvalsApi = {
  async getMyApprovals(query?: ApprovalsQueryDto): Promise<ApprovalsListResponse> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 200));

    // Determine active user
    let activeUserId = query?.userId;
    if (!activeUserId && typeof window !== "undefined") {
      activeUserId = localStorage.getItem("oms_demo_persona") || undefined;
    }
    // Default to Omar (Line Manager) or query user
    const effectiveUserId = activeUserId || "usr-omar";

    // Driven by getApprovalTasksForUser for whichever persona is active
    let tasks = getApprovalTasksForUserFixture(effectiveUserId);
    if (tasks.length === 0 && !query?.userId && !activeUserId) {
      tasks = listApprovalTasksFixture();
    }

    let filtered = [...tasks];

    if (query?.type && query.type !== "all" && query.type !== "overdue") {
      filtered = filtered.filter(
        (t) => t.type.toLowerCase() === query.type?.toLowerCase()
      );
    }

    if (query?.type === "overdue") {
      filtered = filtered.filter((t) => t.sla.breached);
    }

    // Pagination
    const page = query?.page ?? 1;
    const pageSize = query?.pageSize ?? 10;
    const startIndex = (page - 1) * pageSize;
    const paginatedItems = filtered.slice(startIndex, startIndex + pageSize);

    // Compute counts dynamically from dataset
    const counts = {
      all: tasks.length,
      requisition: tasks.filter((t) => t.type === "REQUISITION").length,
      budget: tasks.filter((t) => t.type === "BUDGET_AMENDMENT").length,
      other: tasks.filter((t) => t.type !== "REQUISITION" && t.type !== "BUDGET_AMENDMENT").length,
      breached: tasks.filter((t) => t.sla.breached).length,
    };

    return {
      items: paginatedItems,
      counts,
    };
  },

  async getApprovalDetail(taskId: string, userId?: string): Promise<ApprovalTaskDetail> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 200));

    let activeUserId = userId;
    if (!activeUserId && typeof window !== "undefined") {
      activeUserId = localStorage.getItem("oms_demo_persona") || undefined;
    }

    const detail = getApprovalDetailFixture(taskId, activeUserId);

    if (!detail) {
      throw new Error("404 Not Found");
    }

    return detail;
  },

  async approveTask(
    taskId: string,
    payload: { comment?: string; idempotencyKey: string }
  ): Promise<{ success: boolean; message: string }> {
    if (!payload.idempotencyKey) {
      throw { code: "MISSING_IDEMPOTENCY_KEY", message: "Idempotency key is required" };
    }
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (taskId === "failingPreflight") {
      throw {
        code: "APPROVAL_PREFLIGHT_FAILED",
        message: "Insufficient funds available. A recent budget transfer reduced the available amount below the requested AED 620,000.",
      };
    }

    return { success: true, message: "Requisition approved successfully" };
  },

  async sendBackTask(
    taskId: string,
    payload: { comment: string; sendBackToStage: string; idempotencyKey: string }
  ): Promise<{ success: boolean; message: string }> {
    if (!payload.idempotencyKey) {
      throw { code: "MISSING_IDEMPOTENCY_KEY", message: "Idempotency key is required" };
    }
    if (!payload.comment?.trim()) {
      throw { code: "COMMENT_REQUIRED", message: "Comment is required on send back" };
    }
    await new Promise((resolve) => setTimeout(resolve, 800));

    return { success: true, message: "Requisition sent back successfully" };
  },

  async rejectTask(
    taskId: string,
    payload: { comment: string; reasonCode: string; idempotencyKey: string }
  ): Promise<{ success: boolean; message: string }> {
    if (!payload.idempotencyKey) {
      throw { code: "MISSING_IDEMPOTENCY_KEY", message: "Idempotency key is required" };
    }
    if (!payload.comment?.trim()) {
      throw { code: "COMMENT_REQUIRED", message: "Comment is required on reject" };
    }
    if (!payload.reasonCode) {
      throw { code: "REASON_CODE_REQUIRED", message: "Reason code is required on reject" };
    }
    await new Promise((resolve) => setTimeout(resolve, 800));

    return { success: true, message: "Requisition rejected and funds released" };
  },
};
