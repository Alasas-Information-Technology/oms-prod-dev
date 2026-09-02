"use client";

import React from "react";
import { SimpleKpiCard } from "@/components/budget/SimpleKpiCard";
import { WidgetProps } from "@/lib/dashboard/registry";
import { ExpiringDocumentsData } from "@/types/dashboard";

export function ExpiringDocumentsTile({
  data,
  isLoading,
  error,
}: WidgetProps<ExpiringDocumentsData>) {
  const count = data?.countWithin30Days ?? 0;
  const critical = data?.criticalCount ?? 0;

  return (
    <SimpleKpiCard
      title="Expiring documents"
      value={count}
      description="Within 30 days"
      href="/app/workforce?filter=expiring-documents"
      icon="lucide:file-warning"
      sparkline={data?.sparkline}
      isLoading={isLoading}
      zeroMeaning="GOOD"
      zeroLabel="No documents expiring"
    />
  );
}
