"use client";

import React from "react";
import { SimpleKpiCard } from "@/components/budget/SimpleKpiCard";
import { WidgetProps } from "@/lib/dashboard/registry";
import { JobsFailed24hData } from "@/types/dashboard";

export function JobsFailedTile({
  data,
  isLoading,
  error,
}: WidgetProps<JobsFailed24hData>) {
  const count = data?.count ?? 0;
  const totalRuns = data?.totalRuns ?? 18;

  return (
    <SimpleKpiCard
      title="Jobs failed (24h)"
      value={count}
      description={count > 0 ? `${count} of ${totalRuns} runs failed` : `${totalRuns} of ${totalRuns} runs ok`}
      href="/app/administration/jobs"
      icon="lucide:clock-alert"
      sparkline={data?.sparkline}
      isLoading={isLoading}
      zeroMeaning="GOOD"
      zeroLabel="All jobs completed"
    />
  );
}
