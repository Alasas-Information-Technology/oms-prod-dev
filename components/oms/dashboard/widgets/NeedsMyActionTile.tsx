"use client";

import React from "react";
import { Inbox } from "lucide-react";
import { KpiTile } from "../KpiTile";
import { WidgetProps } from "@/lib/dashboard/registry";
import { NeedsMyActionData } from "@/types/dashboard";

export function NeedsMyActionTile({
  scope,
  data,
  isLoading,
  error,
  onRetry,
  updatedAt,
}: WidgetProps<NeedsMyActionData>) {
  const total = data?.total ?? 0;
  const overdue = data?.overdue ?? 0;

  return (
    <KpiTile
      title="Needs my action"
      scopeLabel={scope?.label}
      value={total}
      badge={
        overdue > 0
          ? {
              text: `${overdue} overdue`,
              tone: "amber",
            }
          : null
      }
      href="/app/requests?tab=needs-my-action"
      icon={Inbox}
      tone={overdue > 0 ? "amber" : "indigo"}
      sparklineData={data?.sparkline}
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      updatedAt={updatedAt}
      zeroMeaning="GOOD"
      zeroMessage="Nothing waiting on you"
    />
  );
}
