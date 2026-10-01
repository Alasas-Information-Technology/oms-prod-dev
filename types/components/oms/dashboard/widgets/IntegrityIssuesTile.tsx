"use client";

import React from "react";
import { SimpleKpiCard } from "@/components/budget/SimpleKpiCard";
import { WidgetProps } from "@/lib/dashboard/registry";
import { IntegrityIssuesData } from "@/types/dashboard";

export function IntegrityIssuesTile({
  data,
  isLoading,
}: WidgetProps<IntegrityIssuesData>) {
  const count = data?.count ?? (data?.failedChecks ?? 0);

  return (
    <SimpleKpiCard
      title="Integrity issues"
      value={count}
      description={count > 0 ? `${count} check failure${count === 1 ? "" : "s"}` : "All checks passed"}
      href="/app/administration/integrity"
      icon="lucide:shield-alert"
      sparkline={data?.sparkline}
      isLoading={isLoading}
      zeroMeaning="GOOD"
      zeroLabel="All checks passed"
    />
  );
}
