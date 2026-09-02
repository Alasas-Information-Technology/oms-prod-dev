"use client";

import React from "react";
import { SimpleKpiCard } from "@/components/budget/SimpleKpiCard";
import { WidgetProps } from "@/lib/dashboard/registry";
import { CandidatesAwaitingReviewData } from "@/types/dashboard";

export function CandidatesAwaitingReviewTile({
  data,
  isLoading,
}: WidgetProps<CandidatesAwaitingReviewData>) {
  const total = data?.totalAwaiting ?? 0;
  const urgent = data?.urgentReview ?? 0;

  return (
    <SimpleKpiCard
      title="Candidates awaiting review"
      value={total}
      description={urgent > 0 ? `${urgent} urgent review` : "Awaiting review"}
      href="/app/candidates?filter=awaiting-review"
      icon="lucide:users"
      sparkline={data?.sparkline}
      isLoading={isLoading}
      zeroMeaning="GOOD"
      zeroLabel="No candidates to review"
    />
  );
}
