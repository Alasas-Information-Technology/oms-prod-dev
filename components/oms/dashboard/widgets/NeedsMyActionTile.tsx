"use client";

import React from "react";
import { SimpleKpiCard } from "@/components/budget/SimpleKpiCard";
import { WidgetProps } from "@/lib/dashboard/registry";
import { NeedsMyActionData } from "@/types/dashboard";

export function NeedsMyActionTile({
  data,
  isLoading,
  error,
}: WidgetProps<NeedsMyActionData>) {
  const total = data?.total ?? 0;
  const overdue = data?.overdue ?? 0;

  return (
    <SimpleKpiCard
      title="Needs my action"
      value={total}
      description={overdue > 0 ? `${overdue} overdue` : undefined}
      href="/app/requests?tab=needs-my-action"
      icon="lucide:inbox"
      sparkline={data?.sparkline}
      isLoading={isLoading}
      zeroMeaning="GOOD"
      zeroLabel="Nothing waiting on you"
    />
  );
}
