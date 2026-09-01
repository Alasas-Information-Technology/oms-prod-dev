"use client";

import React from "react";
import { AlertOctagon } from "lucide-react";
import { KpiTile } from "../KpiTile";
import { WidgetProps } from "@/lib/dashboard/registry";
import { OpenExceptionsData } from "@/types/dashboard";

export function OpenExceptionsTile({
  scope,
  data,
  isLoading,
  error,
  onRetry,
  updatedAt,
}: WidgetProps<OpenExceptionsData>) {
  const total = data?.totalExceptions ?? 0;
  const breaches = data?.slaBreaches ?? 0;

  return (
    <KpiTile
      title="Open exceptions"
      scopeLabel={scope?.label}
      value={total}
      badge={
        total > 0
          ? {
              text: breaches > 0 ? `${breaches} SLA breaches` : `${total} active exceptions`,
              tone: "amber",
            }
          : {
              text: "All normal",
              tone: "neutral",
            }
      }
      href="/app/requests?filter=exceptions"
      icon={AlertOctagon}
      tone={total > 0 ? "amber" : "default"}
      sparklineData={data?.sparkline}
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      updatedAt={updatedAt}
      zeroMeaning="GOOD"
      zeroMessage="No open exceptions"
    />
  );
}
