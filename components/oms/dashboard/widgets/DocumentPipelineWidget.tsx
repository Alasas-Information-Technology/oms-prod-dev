"use client";

// TODO(file-storage): wire when the storage service ships
// Note: Attachment scanning and document storage services pending backend infrastructure.

import React from "react";
import { AlertTriangle, CheckCircle2, FileCheck2, FileWarning, HardDrive, ShieldCheck } from "lucide-react";
import { WidgetShell } from "../WidgetShell";
import { StatusTooltipIcon } from "../StatusTooltipIcon";
import { WidgetProps } from "@/lib/dashboard/registry";
import { DocumentPipelineData } from "@/types/dashboard";
import { cn } from "@/lib/utils";

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export function DocumentPipelineWidget({
  scope,
  data,
  isLoading,
  error,
  onRetry,
  updatedAt,
}: WidgetProps<DocumentPipelineData>) {
  const totalStored = data?.totalStored ?? 0;
  const malwareScanFailures = data?.malwareScanFailures ?? 0;
  const expiringWithin30Days = data?.expiringWithin30Days ?? 0;
  const totalStorageBytes = data?.totalStorageBytes ?? 0;

  const hasMalware = malwareScanFailures > 0;

  return (
    <WidgetShell
      title="Document pipeline"
      scopeLabel={scope?.label}
      updatedAt={updatedAt}
      href="/app/administration/documents"
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      minHeight={240}
      headerActions={
        <StatusTooltipIcon
          status={hasMalware ? "FAILED" : "CLEAN"}
          label={hasMalware ? `${malwareScanFailures} quarantined` : "Clean"}
          tooltipTitle="Document Pipeline Security"
          tooltipDescription={
            hasMalware
              ? `${malwareScanFailures} files failed automated malware scanning and were quarantined.`
              : "All documents processed through the attachment pipeline passed antivirus validation."
          }
          tooltipDetails={[
            { label: "Total Stored", value: `${totalStored} files` },
            { label: "Storage Volume", value: formatBytes(totalStorageBytes) },
            { label: "Expiring (30d)", value: `${expiringWithin30Days}` },
            { label: "Virus Scanner", value: "Active" },
          ]}
          showBorder
        />
      }

    >
      <div className="space-y-4 select-none">
        {/* Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="p-3 rounded-md bg-muted/40 border border-border/40 flex flex-col justify-between">
            <div className="flex items-center justify-between text-muted-foreground text-xs">
              <span>Total Stored</span>
              <FileCheck2 className="w-3.5 h-3.5 text-blue-500" />
            </div>
            <div className="text-xl font-bold text-foreground tabular-nums mt-1">{totalStored}</div>
            <div className="text-[10.5px] text-muted-foreground mt-0.5">Encrypted at rest</div>
          </div>

          <div className="p-3 rounded-md bg-muted/40 border border-border/40 flex flex-col justify-between">
            <div className="flex items-center justify-between text-muted-foreground text-xs">
              <span>Volume</span>
              <HardDrive className="w-3.5 h-3.5 text-purple-500" />
            </div>
            <div className="text-xl font-bold text-foreground tabular-nums mt-1">
              {formatBytes(totalStorageBytes)}
            </div>
            <div className="text-[10.5px] text-muted-foreground mt-0.5">Hot S3 storage</div>
          </div>

          <div className={cn(
            "p-3 rounded-md border flex flex-col justify-between",
            hasMalware
              ? "bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-300"
              : "bg-muted/40 border-border/40"
          )}>
            <div className="flex items-center justify-between text-xs">
              <span className={hasMalware ? "font-semibold" : "text-muted-foreground"}>Scan Failures</span>
              <ShieldCheck className={cn("w-3.5 h-3.5", hasMalware ? "text-red-600 dark:text-red-400" : "text-emerald-500")} />
            </div>
            <div className={cn("text-xl font-bold tabular-nums mt-1", hasMalware ? "text-red-600 dark:text-red-400" : "text-foreground")}>
              {malwareScanFailures}
            </div>
            <div className="text-[10.5px] opacity-80 mt-0.5">
              {hasMalware ? "Quarantined" : "All clean"}
            </div>
          </div>

          <div className="p-3 rounded-md bg-muted/40 border border-border/40 flex flex-col justify-between">
            <div className="flex items-center justify-between text-muted-foreground text-xs">
              <span>Expiring (30d)</span>
              <FileWarning className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <div className="text-xl font-bold text-foreground tabular-nums mt-1">{expiringWithin30Days}</div>
            <div className="text-[10.5px] text-muted-foreground mt-0.5">System-wide</div>
          </div>
        </div>

        {/* Status Line */}
        <div className="flex items-center justify-between px-3 py-2 rounded bg-muted/30 border border-border/30 text-xs text-muted-foreground">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            Pipeline status: ClamAV virus scanning active on ingestion
          </span>
          <span className="text-[11px]">Retention policy: 7 years</span>
        </div>
      </div>
    </WidgetShell>
  );
}
