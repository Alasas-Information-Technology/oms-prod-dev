"use client";

import React from "react";
import { Building2 } from "lucide-react";
import { KpiTile } from "../KpiTile";
import { WidgetProps } from "@/src/lib/dashboard/registry";
import { VendorSubmissionsData } from "@/src/types/dashboard";

export function VendorSubmissionsTile({
  scope,
  data,
  isLoading,
  error,
  onRetry,
}: WidgetProps<VendorSubmissionsData>) {
  const total = data?.totalPending ?? 0;
  const thisWeek = data?.submittedThisWeek ?? 0;

  return (
    <KpiTile
      title="Vendor submissions"
      scopeLabel={scope?.label}
      value={total}
      badge={
        thisWeek > 0
          ? {
              text: `${thisWeek} this week`,
              tone: "neutral",
            }
          : null
      }
      href="/app/vendors?filter=pending-submissions"
      icon={Building2}
      tone="default"
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
    />
  );
}
