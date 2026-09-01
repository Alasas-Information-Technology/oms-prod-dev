"use client";

import React from "react";
import { ClockAlert } from "lucide-react";
import { KpiTile } from "../KpiTile";
import { WidgetProps } from "@/src/lib/dashboard/registry";
import { JobsFailed24hData } from "@/src/types/dashboard";

export function JobsFailedTile({
  scope,
  data,
  isLoading,
  error,
  onRetry,
  updatedAt,
}: WidgetProps<JobsFailed24hData>) {
  const count = data?.count ?? 0;
  const totalRuns = data?.totalRuns ?? 18;

  return (
    <KpiTile
      title="Jobs failed (24h)"
      scopeLabel={scope?.label}
      value={count}
      badge={
        count > 0
          ? {
              text: `${count} of ${totalRuns} runs failed`,
              tone: "destructive",
            }
          : {
              text: `${totalRuns} of ${totalRuns} runs ok`,
              tone: "emerald",
            }
      }
      href="/app/administration/jobs"
      icon={ClockAlert}
      tone={count > 0 ? "destructive" : "default"}
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      updatedAt={updatedAt}
      zeroMeaning="GOOD"
      zeroMessage="All jobs completed"
    />
  );
}
