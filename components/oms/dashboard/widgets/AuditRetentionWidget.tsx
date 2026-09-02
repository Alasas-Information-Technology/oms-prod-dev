"use client";

import React from "react";
import { Archive, Calendar, Database, FileText, ShieldCheck } from "lucide-react";
import { WidgetShell } from "../WidgetShell";
import { StatusTooltipIcon } from "../StatusTooltipIcon";
import { WidgetProps } from "@/lib/dashboard/registry";
import { AuditRetentionData } from "@/types/dashboard";

function formatDate(isoDate: string): string {
  try {
    const d = new Date(isoDate);
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return isoDate;
  }
}

export function AuditRetentionWidget({
  scope,
  data,
  isLoading,
  error,
  onRetry,
  updatedAt,
}: WidgetProps<AuditRetentionData>) {
  const eventsWritten24h = data?.eventsWritten24h ?? 0;
  const totalRetained = data?.totalRetained ?? 0;
  const oldestRetainedDate = data?.oldestRetainedDate || "2025-08-31T00:00:00Z";
  const nextPurgeDate = data?.nextPurgeDate || "2026-09-01T03:00:00Z";

  return (
    <WidgetShell
      title="Audit & retention"
      scopeLabel={scope?.label}
      updatedAt={updatedAt}
      href="/app/administration/audit-logs"
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      minHeight={240}
      headerActions={
        <StatusTooltipIcon
          status="INFO"
          label="365d retention"
          tooltipTitle="Audit Log Retention Policy"
          tooltipDescription="Legal & regulatory compliance retention policy. Immutable audit records are retained for 365 days before archival."
          tooltipDetails={[
            { label: "Retention Window", value: "365 days" },
            { label: "Ingested (24h)", value: eventsWritten24h.toLocaleString() },
            { label: "Total Retained", value: totalRetained.toLocaleString() },
            { label: "Next Scheduled Purge", value: formatDate(nextPurgeDate) },
          ]}
          showBorder
        />
      }

    >
      <div className="space-y-3 select-none">
        {/* Top 2 Metric Cards */}
        <div className="grid grid-cols-2 gap-2">
          <div className="p-3 rounded-md bg-muted/40 border border-border/40 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Ingested (24h)</span>
              <FileText className="w-3.5 h-3.5 text-blue-500" />
            </div>
            <div className="text-xl font-bold text-foreground tabular-nums mt-1">
              {eventsWritten24h.toLocaleString()}
            </div>
            <div className="text-[10.5px] text-muted-foreground mt-0.5">Immutable audit events</div>
          </div>

          <div className="p-3 rounded-md bg-muted/40 border border-border/40 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Total Retained</span>
              <Database className="w-3.5 h-3.5 text-purple-500" />
            </div>
            <div className="text-xl font-bold text-foreground tabular-nums mt-1">
              {totalRetained.toLocaleString()}
            </div>
            <div className="text-[10.5px] text-muted-foreground mt-0.5">Hot & cold stores</div>
          </div>
        </div>

        {/* Timeline Rows */}
        <div className="space-y-1.5 p-3 rounded-md bg-muted/20 border border-border/30 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <Archive className="w-3.5 h-3.5 text-muted-foreground" />
              Oldest retained event:
            </span>
            <span className="font-semibold text-foreground tabular-nums">
              {formatDate(oldestRetainedDate)}
            </span>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-border/20">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
              Next automated purge:
            </span>
            <span className="font-semibold text-foreground tabular-nums">
              {formatDate(nextPurgeDate)}
            </span>
          </div>
        </div>
      </div>
    </WidgetShell>
  );
}
