"use client";

import React, { useMemo, useState } from "react";
import { WidgetShell } from "../WidgetShell";
import { WidgetProps } from "@/src/lib/dashboard/registry";
import { RequestsByLifecycleStageData } from "@/src/types/dashboard";
import { DistributionBar, DistributionSegment } from "../DistributionBar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function RequestsByLifecycleStageChart({
  scope,
  data,
  isLoading,
  error,
  onRetry,
  updatedAt,
}: WidgetProps<RequestsByLifecycleStageData>) {
  const [period, setPeriod] = useState("90d");

  const stages = useMemo(() => data?.stages || [], [data]);
  const totalRequests = useMemo(() => {
    return stages.reduce((sum, s) => sum + s.count, 0) || data?.totalRequests || 1;
  }, [stages, data?.totalRequests]);

  const segments: DistributionSegment[] = useMemo(() => {
    return stages.map((s) => ({
      label: s.label || s.stage,
      value: s.count,
      formatted: `${s.count}`,
      percent: (s.count / totalRequests) * 100,
    }));
  }, [stages, totalRequests]);

  const srSummary = stages
    .map((s) => `${s.label}: ${s.count} requests`)
    .join(", ");

  return (
    <WidgetShell
      title="Requests by lifecycle stage"
      scopeLabel={scope?.label}
      updatedAt={updatedAt}
      href="/app/requests"
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      minHeight={180}
      headerActions={
        <div className="flex items-center gap-1">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="h-7 w-28 text-[12px] font-normal border-border/50 bg-muted/30 focus:ring-0 rounded-md">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent align="end">
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="FY">This FY</SelectItem>
            </SelectContent>
          </Select>
        </div>
      }
    >
      <span className="sr-only">
        Requisitions by lifecycle stage for {period}. Total {totalRequests} requests. Breakdown: {srSummary}
      </span>

      {stages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
          <p className="text-sm">No requests in the selected period.</p>
        </div>
      ) : (
        <div className="flex flex-col justify-center flex-1 w-full py-1">
          <DistributionBar segments={segments} />
        </div>
      )}
    </WidgetShell>
  );
}
