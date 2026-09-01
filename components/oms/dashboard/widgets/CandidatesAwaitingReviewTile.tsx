"use client";

import React from "react";
import { Users } from "lucide-react";
import { KpiTile } from "../KpiTile";
import { WidgetProps } from "@/lib/dashboard/registry";
import { CandidatesAwaitingReviewData } from "@/types/dashboard";

export function CandidatesAwaitingReviewTile({
  scope,
  data,
  isLoading,
  error,
  onRetry,
  updatedAt,
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
      sparklineData={data?.sparkline}
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      updatedAt={updatedAt}
      zeroMeaning="GOOD"
      zeroMessage="No candidates to review"
    />
  );
}
