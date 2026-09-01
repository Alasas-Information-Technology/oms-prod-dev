"use client";

import React from "react";
import { FileWarning } from "lucide-react";
import { KpiTile } from "../KpiTile";
import { WidgetProps } from "@/src/lib/dashboard/registry";
import { ExpiringDocumentsData } from "@/src/types/dashboard";

export function ExpiringDocumentsTile({
  scope,
  data,
  isLoading,
  error,
  onRetry,
  updatedAt,
}: WidgetProps<ExpiringDocumentsData>) {
  const count = data?.countWithin30Days ?? 0;
  const critical = data?.criticalCount ?? 0;

  return (
    <KpiTile
      title="Expiring documents"
      scopeLabel={scope?.label}
      value={count}
      badge={{
        text: "Within 30 days",
        tone: critical > 0 ? "amber" : "neutral",
      }}
      href="/app/workforce?filter=expiring-documents"
      icon={FileWarning}
      tone={count > 0 ? "amber" : "default"}
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      updatedAt={updatedAt}
      zeroMeaning="GOOD"
      zeroMessage="No documents expiring"
    />
  );
}
