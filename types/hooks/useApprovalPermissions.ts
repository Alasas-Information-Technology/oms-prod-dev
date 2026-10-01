import { useMemo } from "react";
import { ApprovalTaskDetail } from "@/lib/types/approval.types";

export interface ApprovalPermissions {
  /**
   * Whether the current user is authorized to act on this approval (Approve/Reject/Send Back).
   * Strictly derived from the server's evaluation, never computed client-side.
   */
  canAct: boolean;

  /**
   * Whether the user can view this request.
   * If they have the data to render, this is true. Out-of-scope requests should 404 at the network layer.
   */
  canView: boolean;

  /**
   * The user identity the current user is acting on behalf of, if this is a delegated task.
   */
  actingFor: ApprovalTaskDetail["actingFor"];

  /**
   * Explains why canAct is false (e.g., "Awaiting HOD approval", "Preflight checks failed").
   */
  readOnlyReason: string | null;
}

/**
 * Extracts and strictly enforces the Approval Workflow visibility and action rights
 * defined by the API contract (Part 2 of spec).
 * 
 * NEVER computes `canAct` locally by comparing user IDs or roles. The server is the
 * single source of truth for segregation of duties and assignment.
 */
export function useApprovalPermissions(
  taskDetail: ApprovalTaskDetail | undefined | null
): ApprovalPermissions {
  return useMemo(() => {
    if (!taskDetail) {
      return {
        canAct: false,
        canView: false,
        actingFor: null,
        readOnlyReason: "Loading",
      };
    }

    return {
      canAct: taskDetail.canAct,
      canView: true,
      actingFor: taskDetail.actingFor,
      readOnlyReason: taskDetail.readOnlyReason,
    };
  }, [taskDetail]);
}
