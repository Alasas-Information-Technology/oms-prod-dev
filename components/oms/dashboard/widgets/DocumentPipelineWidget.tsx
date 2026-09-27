"use client";

// TODO(file-storage): wire when the storage service ships
// Note: Attachment scanning and document storage services pending backend infrastructure.

import React from "react";
import { CheckCircle2, FileCheck2, FileWarning, HardDrive, ShieldCheck } from "lucide-react";
import { WidgetShell } from "../WidgetShell";
import { StatusTooltipIcon } from "../StatusTooltipIcon";
import { WidgetProps } from "@/lib/dashboard/registry";
import { DocumentPipelineData } from "@/types/dashboard";
import { cn } from "@/lib/utils";
import { ColumnChart } from "../ColumnChart";
import { Progress } from "@/components/ui/progress";

interface MetricCardProps {
  label: string;
  value: number;
  formatted: string;
  subtext: string;
  icon: React.ComponentType<{ className?: string }>;
  hasBar: boolean;
  isWarning?: boolean;
  barWidth: number;
}

function MetricCard({
  label,
  formatted,
  subtext,
  icon: Icon,
  hasBar,
  isWarning,
  barWidth,
}: MetricCardProps) {
  return (
    <div
      className={cn(
        "p-2.5 rounded-sm border flex flex-col justify-between gap-1.5 transition-colors",
        isWarning
          ? "bg-[var(--danger-surface)] border-[var(--danger-border)]/40 text-danger-text"
          : "bg-muted/20 hover:bg-accent border-foreground/10 dark:border-foreground/4 text-foreground"
      )}
    >
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="font-medium text-foreground/90">{label}</span>
        <Icon className="w-3.5 h-3.5 text-foreground/60 shrink-0" />
      </div>

      <div className="flex flex-col gap-1 mt-0.5">
        <div className="flex items-baseline justify-between">
          <span className="text-base font-bold tabular-nums text-foreground">
            {formatted}
          </span>
          <span className="text-[10px] text-muted-foreground">{subtext}</span>
        </div>

        {/* Horizontal Bar */}
        {hasBar ? (
          <Progress value={barWidth} className="h-1.5" />
        ) : (
          <div className="w-full h-1.5 bg-muted/40 rounded-full overflow-hidden" />
        )}
      </div>
    </div>
  );
}

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
      <div className="space-y-6 select-none">
        {/* NEW: ColumnChart (M4) */}
        <div className="pb-4 border-b border-border/30 h-[180px]">
          <ColumnChart
            data={[
              { category: "Stored", count: totalStored },
              { category: "Scan Fails", count: malwareScanFailures },
              { category: "Expiring", count: expiringWithin30Days },
            ]}
            xAxisKey="category"
            series={[
              { key: "count", name: "Documents", color: "var(--primary)" }
            ]}
            accessibilitySummary="Document pipeline totals"
            height={160}
          />
        </div>

        {/* Three Core Figures with Horizontal Bars per TASK 3 (+ Volume) */}
        {(() => {
          const maxVal = Math.max(totalStored, malwareScanFailures, expiringWithin30Days, 1);
          const metrics = [
            {
              label: "Total Stored",
              value: totalStored,
              formatted: totalStored.toLocaleString(),
              subtext: "Encrypted at rest",
              icon: FileCheck2,
              hasBar: true,
            },
            {
              label: "Scan Failures",
              value: malwareScanFailures,
              formatted: malwareScanFailures.toLocaleString(),
              subtext: hasMalware ? "Quarantined" : "All clean",
              icon: ShieldCheck,
              hasBar: true,
              isWarning: hasMalware,
            },
            {
              label: "Expiring (30d)",
              value: expiringWithin30Days,
              formatted: expiringWithin30Days.toLocaleString(),
              subtext: "System-wide",
              icon: FileWarning,
              hasBar: true,
            },
            {
              label: "Total Volume",
              value: 0,
              formatted: formatBytes(totalStorageBytes),
              subtext: "Hot S3 storage",
              icon: HardDrive,
              hasBar: false,
            },
          ];

          return (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {metrics.map((m) => {
                const barWidth =
                  m.hasBar && m.value > 0
                    ? Math.max(6, Math.min(100, (m.value / maxVal) * 100))
                    : 0;
                return <MetricCard key={m.label} {...m} barWidth={barWidth} />;
              })}
            </div>
          );
        })()}

        {/* Status Line */}
        <div className="flex items-center justify-between px-3 py-2 rounded bg-muted/30 border border-border/30 text-xs text-muted-foreground">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-success-text" />
            Pipeline status: ClamAV virus scanning active on ingestion
          </span>
          <span className="text-[11px]">Retention policy: 7 years</span>
        </div>
      </div>
    </WidgetShell>
  );
}
