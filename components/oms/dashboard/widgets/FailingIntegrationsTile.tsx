"use client";

import React from "react";
import { SimpleKpiCard } from "@/components/budget/SimpleKpiCard";
import { WidgetProps } from "@/lib/dashboard/registry";
import { FailingIntegrationsData } from "@/types/dashboard";

export function FailingIntegrationsTile({
  data,
  isLoading,
  error,
}: WidgetProps<FailingIntegrationsData>) {
  const count = data?.count ?? 0;
  const total = data?.total ?? 4;

  return (
    <SimpleKpiCard
      title="Failing integrations"
      value={count}
      description={count > 0 ? `${count} of ${total} degraded` : "All 4 healthy"}
      href="/app/administration/integrations"
      icon="lucide:server"
      sparkline={data?.sparkline}
      isLoading={isLoading}
      zeroMeaning="GOOD"
      zeroLabel="All integrations healthy"
    />
  );
}
