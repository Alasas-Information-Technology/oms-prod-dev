"use client";

import * as React from "react";
import { ApprovalTaskDetail } from "@/lib/types/approval.types";
import { useApprovalPermissions } from "@/hooks/useApprovalPermissions";

export interface ApprovalGuardProps {
  /**
   * The complete task detail payload from GET /api/v1/approvals/{taskId}
   */
  taskDetail: ApprovalTaskDetail | undefined | null;
  /**
   * Rendered only if the server explicitly states this user is the active assignee
   * and is authorized to act on this specific task.
   */
  children: React.ReactNode;
  /**
   * Optional fallback to render when the user cannot act (e.g., a banner explaining why).
   * Do NOT use this to render disabled approval buttons.
   */
  fallback?: React.ReactNode;
}

/**
 * A security boundary wrapper that enforces the Approval Workflow visibility rules.
 * It prevents rendering the decision bar for non-assignees.
 *
 * Rules strictly followed:
 * - The decision bar is ABSENT for non-assignees, never disabled.
 * - `canAct` is derived strictly from the server, never computed locally.
 */
export function ApprovalGuard({
  taskDetail,
  children,
  fallback = null,
}: ApprovalGuardProps) {
  const { canAct } = useApprovalPermissions(taskDetail);

  if (!canAct) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
