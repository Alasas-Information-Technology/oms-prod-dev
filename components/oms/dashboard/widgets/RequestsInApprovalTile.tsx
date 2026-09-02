"use client";

import React from "react";
import { SimpleKpiCard } from "@/components/budget/SimpleKpiCard";
import { WidgetProps } from "@/lib/dashboard/registry";
import { RequestsInApprovalData } from "@/types/dashboard";

export function RequestsInApprovalTile({
  data,
  isLoading,
}: WidgetProps<RequestsInApprovalData>) {
  const count = data?.count ?? 0;
  const urgent = data?.urgentCount ?? 0;

  return (
    <SimpleKpiCard
      title="Requests in approval"
      value={count}
      description={urgent > 0 ? `${urgent} urgent` : "In-flight"}
      href="/app/requests?status=in-approval"
      icon="lucide:git-pull-request"
      sparkline={data?.sparkline}
      isLoading={isLoading}
      zeroMeaning="GOOD"
      zeroLabel="No requests pending approval"
    />
  );
}
