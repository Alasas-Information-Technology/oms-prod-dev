"use client";

import React from "react";
import { SimpleKpiCard } from "@/components/budget/SimpleKpiCard";
import { WidgetProps } from "@/lib/dashboard/registry";
import { VendorSubmissionsData } from "@/types/dashboard";

export function VendorSubmissionsTile({
  data,
  isLoading,
}: WidgetProps<VendorSubmissionsData>) {
  const total = data?.totalPending ?? 0;
  const thisWeek = data?.submittedThisWeek ?? 0;

  return (
    <SimpleKpiCard
      title="Vendor submissions"
      value={total}
      description={thisWeek > 0 ? `${thisWeek} this week` : "No submissions"}
      href="/app/vendors?filter=pending-submissions"
      icon="lucide:building-2"
      sparkline={data?.sparkline}
      isLoading={isLoading}
      zeroMeaning="GOOD"
      zeroLabel="No pending submissions"
    />
  );
}
