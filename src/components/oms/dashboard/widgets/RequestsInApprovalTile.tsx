"use client";

import React from "react";
import { GitPullRequest } from "lucide-react";
import { KpiTile } from "../KpiTile";
import { WidgetProps } from "@/src/lib/dashboard/registry";
import { RequestsInApprovalData } from "@/src/types/dashboard";

export function RequestsInApprovalTile({
  scope,
  data,
  isLoading,
  error,
  onRetry,
  updatedAt,
}: WidgetProps<RequestsInApprovalData>) {
  const count = data?.count ?? 0;
  const urgent = data?.urgentCount ?? 0;

  return (
    <KpiTile
      title="Requests in approval"
      scopeLabel={scope?.label}
      value={count}
      badge={
        urgent > 0
          ? {
              text: `${urgent} urgent`,
              tone: "amber",
            }
          : {
              text: "In-flight",
              tone: "neutral",
            }
      }
      href="/app/requests?status=in-approval"
      icon={GitPullRequest}
      tone="indigo"
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      updatedAt={updatedAt}
      zeroMeaning="GOOD"
      zeroMessage="No requests pending approval"
    />
  );
}
