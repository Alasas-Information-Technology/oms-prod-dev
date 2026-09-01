"use client";

import React from "react";
import { Server } from "lucide-react";
import { KpiTile } from "../KpiTile";
import { WidgetProps } from "@/lib/dashboard/registry";
import { FailingIntegrationsData } from "@/types/dashboard";

export function FailingIntegrationsTile({
  scope,
  data,
  isLoading,
  error,
  onRetry,
  updatedAt,
}: WidgetProps<FailingIntegrationsData>) {
  const count = data?.count ?? 0;
  const total = data?.total ?? 4;

  return (
    <KpiTile
      title="Failing integrations"
      scopeLabel={scope?.label}
      value={count}
      badge={
        count > 0
          ? {
              text: `${count} of ${total} degraded`,
              tone: "destructive",
            }
          : {
              text: "All 4 healthy",
              tone: "emerald",
            }
      }
      href="/app/administration/integrations"
      icon={Server}
      tone={count > 0 ? "destructive" : "default"}
      sparklineData={data?.sparkline}
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      updatedAt={updatedAt}
      zeroMeaning="GOOD"
      zeroMessage="All integrations healthy"
    />
  );
}
