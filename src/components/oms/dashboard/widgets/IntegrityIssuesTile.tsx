"use client";

import React from "react";
import { ShieldAlert } from "lucide-react";
import { KpiTile } from "../KpiTile";
import { WidgetProps } from "@/src/lib/dashboard/registry";
import { IntegrityIssuesData } from "@/src/types/dashboard";

export function IntegrityIssuesTile({
  scope,
  data,
  isLoading,
  error,
  onRetry,
  updatedAt,
}: WidgetProps<IntegrityIssuesData>) {
  const count = data?.count ?? (data?.failedChecks ?? 0);

  return (
    <KpiTile
      title="Integrity issues"
      scopeLabel={scope?.label}
      value={count}
      badge={
        count > 0
          ? {
              text: `${count} check failure${count === 1 ? "" : "s"}`,
              tone: "destructive",
            }
          : {
              text: "All checks passed",
              tone: "emerald",
            }
      }
      href="/app/administration/integrity"
      icon={ShieldAlert}
      tone={count > 0 ? "destructive" : "default"}
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      updatedAt={updatedAt}
      zeroMeaning="GOOD"
      zeroMessage="All checks passed"
    />
  );
}
