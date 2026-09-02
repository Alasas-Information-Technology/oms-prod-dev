import { ApprovalsListResponse, ApprovalTaskDetail } from "@/lib/types/approval.types";
import { MOCK_APPROVAL_FIXTURES } from "@/lib/fixtures/approval.fixtures";

export interface ApprovalsQueryDto {
  status?: string;
  type?: string;
  page?: number;
  pageSize?: number;
}

export const approvalsApi = {
  async getMyApprovals(query?: ApprovalsQueryDto): Promise<ApprovalsListResponse> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 600));

    // Extract all our mock fixtures into a flat list
    const allItems = [
      MOCK_APPROVAL_FIXTURES.baseline.task,
      MOCK_APPROVAL_FIXTURES.fourStepRoute.task,
      MOCK_APPROVAL_FIXTURES.roleQueue.task,
      MOCK_APPROVAL_FIXTURES.delegated.task,
      MOCK_APPROVAL_FIXTURES.breachedSla.task,
      MOCK_APPROVAL_FIXTURES.failingPreflight.task,
    ];

    let filtered = [...allItems];

    if (query?.type && query.type !== "all" && query.type !== "overdue") {
      filtered = filtered.filter((t) => t.type === (query.type as string).toUpperCase());
    }
    
    if (query?.type === "overdue") {
      filtered = filtered.filter((t) => t.sla.breached);
    }

    // Pagination
    const page = query?.page ?? 1;
    const pageSize = query?.pageSize ?? 10;
    const startIndex = (page - 1) * pageSize;
    const paginatedItems = filtered.slice(startIndex, startIndex + pageSize);

    // Compute counts dynamically from full dataset
    const counts = {
      all: allItems.length,
      requisition: allItems.filter(t => t.type === "REQUISITION").length,
      budget: allItems.filter(t => t.type === "BUDGET_AMENDMENT").length,
      other: allItems.filter(t => t.type !== "REQUISITION" && t.type !== "BUDGET_AMENDMENT").length,
      breached: allItems.filter(t => t.sla.breached).length,
    };

    return {
      items: paginatedItems,
      counts,
    };
  },

  async getApprovalDetail(taskId: string): Promise<ApprovalTaskDetail> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 600));

    // Map URL id to the exact fixture
    const idMap: Record<string, keyof typeof MOCK_APPROVAL_FIXTURES> = {
      "OMS-2026-0148": "baseline",
      "OMS-2026-0146": "delegated",
      "OMS-2026-0144": "roleQueue",
      "OMS-2026-0139": "fourStepRoute",
      "OMS-2026-0140": "failingPreflight",
    };
    const key = (idMap[taskId] || taskId) as keyof typeof MOCK_APPROVAL_FIXTURES;
    const detail = MOCK_APPROVAL_FIXTURES[key] as ApprovalTaskDetail | undefined;

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
