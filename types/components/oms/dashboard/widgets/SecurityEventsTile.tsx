"use client";

import React from "react";
import { SimpleKpiCard } from "@/components/budget/SimpleKpiCard";
import { WidgetProps } from "@/lib/dashboard/registry";
import { SecurityEventsData } from "@/types/dashboard";

export function SecurityEventsTile({
  data,
  isLoading,
}: WidgetProps<SecurityEventsData>) {
  const total = data?.totalEvents24h ?? 0;
  const failedLogins = data?.failedLogins ?? 0;

  return (
    <SimpleKpiCard
      title="Security events"
      value={total}
      description={failedLogins > 0 ? `${failedLogins} failed logins` : "0 failed logins"}
      href="/app/administration/security-dashboard"
      icon="lucide:shield-alert"
      sparkline={data?.sparkline}
      isLoading={isLoading}
      zeroMeaning="GOOD"
      zeroLabel="No security events in 24 hours"
    />
  );
}
