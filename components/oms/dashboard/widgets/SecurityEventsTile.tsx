"use client";

import React from "react";
import { ShieldAlert } from "lucide-react";
import { KpiTile } from "../KpiTile";
import { WidgetProps } from "@/lib/dashboard/registry";
import { SecurityEventsData } from "@/types/dashboard";

export function SecurityEventsTile({
  scope,
  data,
  isLoading,
  error,
  onRetry,
  updatedAt,
}: WidgetProps<SecurityEventsData>) {
  const total = data?.totalEvents24h ?? 0;
  const failedLogins = data?.failedLogins ?? 0;

  return (
    <KpiTile
      title="Security events"
      scopeLabel={scope?.label}
      value={total}
      badge={
        failedLogins > 0
          ? {
              text: `${failedLogins} failed logins`,
              tone: failedLogins > 10 ? "amber" : "neutral",
            }
          : {
              text: "0 failed logins",
              tone: "neutral",
            }
      }
      href="/app/administration/security-dashboard"
      icon={ShieldAlert}
      tone={total > 10 ? "amber" : "default"}
      sparklineData={data?.sparkline}
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      updatedAt={updatedAt}
      zeroMeaning="GOOD"
      zeroMessage="No security events in 24 hours"
    />
  );
}
