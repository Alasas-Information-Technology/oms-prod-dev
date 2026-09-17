"use client";

// TODO(notifications): wire to the real delivery service
// Note: Domain 3 invitations and SLA reminder alerts depend on this service.

import React from "react";
import { AlertCircle, Clock, Mail, RefreshCw, Send } from "lucide-react";
import { WidgetShell } from "../WidgetShell";
import { StatusTooltipIcon } from "../StatusTooltipIcon";
import { WidgetProps } from "@/lib/dashboard/registry";
import { NotificationDeliveryData } from "@/types/dashboard";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { DistributionRing } from "../DistributionRing";

export function NotificationDeliveryWidget({
  scope,
  data,
  isLoading,
  error,
  onRetry,
  updatedAt,
}: WidgetProps<NotificationDeliveryData>) {
  const queued = data?.queued ?? 0;
  const sent = data?.sent ?? 0;
  const failed = data?.failed ?? 0;
  const retrying = data?.retrying ?? 0;
  const oldestQueuedAgeMinutes = data?.oldestQueuedAgeMinutes ?? 0;
  const failuresByType = data?.failuresByType || {};
  const failureEntries = Object.entries(failuresByType);

  const hasFailures = failed > 0;

  return (
    <WidgetShell
      title="Notification delivery"
      scopeLabel={scope?.label}
      updatedAt={updatedAt}
      href="/app/administration/notifications"
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      minHeight={240}
      headerActions={
        <StatusTooltipIcon
          status={hasFailures ? "FAILED" : "HEALTHY"}
          label={hasFailures ? `${failed} failed` : "Healthy"}
          tooltipTitle="Notification Delivery Queues"
          tooltipDescription={
            hasFailures
              ? `${failed} notification messages failed delivery across channels.`
              : "All email, SMS, and in-app delivery dispatchers are operating normally with real-time throughput."
          }
          tooltipDetails={[
            { label: "Sent (24h)", value: `${sent}` },
            { label: "Queued", value: `${queued}` },
            { label: "Retrying", value: `${retrying}` },
            { label: "Oldest Queue Age", value: `${oldestQueuedAgeMinutes}m` },
          ]}
          showBorder
        />
      }

    >
      <div className="space-y-6 select-none">
        {/* NEW: DistributionRing (M1) */}
        <div className="pb-4 border-b border-border/30">
          <DistributionRing
            segments={[
              { label: "Sent", value: sent, percent: (sent / Math.max(1, sent + queued + failed + retrying)) * 100 },
              { label: "Queued", value: queued, percent: (queued / Math.max(1, sent + queued + failed + retrying)) * 100 },
              { label: "Retrying", value: retrying, percent: (retrying / Math.max(1, sent + queued + failed + retrying)) * 100 },
              { label: "Failed", value: failed, percent: (failed / Math.max(1, sent + queued + failed + retrying)) * 100 },
            ]}
            totalLabel="Notifications"
          />
        </div>

        {/* Four Core Figures with Horizontal Bars per TASK 3 */}
        {(() => {
          const maxVal = Math.max(sent, queued, failed, retrying, 1);
          const metrics = [
            { label: "Sent", value: sent, subtext: "24h volume", icon: Send },
            { label: "Queued", value: queued, subtext: oldestQueuedAgeMinutes > 0 ? `${oldestQueuedAgeMinutes}m oldest` : "Real-time", icon: Mail },
            { label: "Failed", value: failed, subtext: "Needs retry", icon: AlertCircle, isWarning: true },
            { label: "Retrying", value: retrying, subtext: "Auto-queue", icon: RefreshCw },
          ];

          return (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {metrics.map((m) => {
                const barWidth = m.value > 0 ? Math.max(6, Math.min(100, (m.value / maxVal) * 100)) : 0;
                return (
                  <div
                    key={m.label}
                    className={cn(
                      "p-2.5 rounded-sm border flex flex-col justify-between gap-1.5 transition-colors",
                      m.isWarning && m.value > 0
                        ? "bg-[var(--danger-surface)] border-[var(--danger-border)]/40 text-danger-text"
                        : "bg-muted/20 hover:bg-accent border-foreground/10 dark:border-foreground/4 text-foreground"
                    )}
                  >
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="font-medium text-foreground/90">{m.label}</span>
                      <m.icon className="w-3.5 h-3.5 text-foreground/60 shrink-0" />
                    </div>

                    <div className="flex flex-col gap-1 mt-0.5">
                      <div className="flex items-baseline justify-between">
                        <span className="text-base font-bold tabular-nums text-foreground">
                          {m.value}
                        </span>
                        <span className="text-[10px] text-muted-foreground">{m.subtext}</span>
                      </div>

                      {/* Horizontal Bar */}
                      <Progress value={barWidth} className="h-1.5" />
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}

        {/* Failures by Type / Service Status */}
        {failureEntries.length > 0 ? (
          <div className="space-y-1.5 p-3 rounded-md bg-[var(--danger-surface)] border border-[var(--danger-border)]/30">
            <div className="text-xs font-semibold text-danger-text flex items-center justify-between">
              <span>Failures Breakdown</span>
              <span className="text-[11px] font-normal">{failureEntries.length} affected categories</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {failureEntries.map(([type, count]) => (
                <div
                  key={type}
                  className="flex items-center justify-between px-2.5 py-1.5 rounded bg-background/80 border border-[var(--danger-border)]/30 text-xs"
                >
                  <span className="text-muted-foreground text-[11px]">{type}</span>
                  <span className="font-semibold text-danger-text tabular-nums">
                    {count} failed
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between px-3 py-2 rounded-md bg-muted/30 border border-foreground/10 text-xs text-muted-foreground">
            <span className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-muted-foreground" />
              Oldest queued message age: <strong className="text-foreground">{oldestQueuedAgeMinutes} minutes</strong>
            </span>
            <span className="text-[11px]">SLA Threshold: 15m</span>
          </div>
        )}
      </div>
    </WidgetShell>
  );
}
