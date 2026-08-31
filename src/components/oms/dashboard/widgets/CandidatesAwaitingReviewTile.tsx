"use client";

import React from "react";
import { Users } from "lucide-react";
import { KpiTile } from "../KpiTile";
import { WidgetProps } from "@/src/lib/dashboard/registry";
import { CandidatesAwaitingReviewData } from "@/src/types/dashboard";

export function CandidatesAwaitingReviewTile({
  scope,
  data,
  isLoading,
  error,
  onRetry,
}: WidgetProps<CandidatesAwaitingReviewData>) {
  const total = data?.totalAwaiting ?? 0;
  const urgent = data?.urgentReview ?? 0;

  return (
    <KpiTile
      title="Candidates awaiting review"
      scopeLabel={scope?.label}
      value={total}
      badge={
        urgent > 0
          ? {
              text: `${urgent} urgent review`,
              tone: "amber",
            }
          : {
              text: "Awaiting review",
              tone: "neutral",
            }
      }
      href="/app/candidates?filter=awaiting-review"
      icon={Users}
      tone={urgent > 0 ? "amber" : "indigo"}
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
    />
  );
}
