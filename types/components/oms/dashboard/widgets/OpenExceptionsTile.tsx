"use client";

import React from "react";
import { SimpleKpiCard } from "@/components/budget/SimpleKpiCard";
import { WidgetProps } from "@/lib/dashboard/registry";
import { OpenExceptionsData } from "@/types/dashboard";

export function OpenExceptionsTile({
  data,
  isLoading,
}: WidgetProps<OpenExceptionsData>) {
  const total = data?.totalExceptions ?? 0;
  const breaches = data?.slaBreaches ?? 0;

  return (
    <SimpleKpiCard
      title="Open exceptions"
      value={total}
      description={total > 0 ? (breaches > 0 ? `${breaches} SLA breaches` : `${total} active exceptions`) : "All normal"}
      href="/app/requests?filter=exceptions"
      icon="lucide:alert-octagon"
      sparkline={data?.sparkline}
      isLoading={isLoading}
      zeroMeaning="GOOD"
      zeroLabel="No open exceptions"
    />
  );
}
