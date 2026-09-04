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
      <div className="space-y-4 select-none">
        {/* Four Core Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="p-3 rounded-md bg-muted/40 border border-border/40 flex flex-col justify-between">
            <div className="flex items-center justify-between text-muted-foreground text-xs">
              <span>Sent</span>
              <Send className="w-3.5 h-3.5 text-blue-500" />
            </div>
            <div className="text-xl font-bold text-foreground tabular-nums mt-1">{sent}</div>
            <div className="text-[10.5px] text-muted-foreground mt-0.5">Last 24 hours</div>
          </div>

          <div className="p-3 rounded-md bg-muted/40 border border-border/40 flex flex-col justify-between">
            <div className="flex items-center justify-between text-muted-foreground text-xs">
              <span>Queued</span>
              <Mail className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <div className="text-xl font-bold text-foreground tabular-nums mt-1">{queued}</div>
            <div className="text-[10.5px] text-muted-foreground mt-0.5">
              {oldestQueuedAgeMinutes > 0 ? `Oldest: ${oldestQueuedAgeMinutes}m` : "Real-time"}
            </div>
          </div>

          <div className={cn(
            "p-3 rounded-md border flex flex-col justify-between",
            failed > 0
              ? "bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-300"
              : "bg-muted/40 border-border/40"
          )}>
            <div className="flex items-center justify-between text-xs">
              <span className={failed > 0 ? "font-semibold" : "text-muted-foreground"}>Failed</span>
              <AlertCircle className={cn("w-3.5 h-3.5", failed > 0 ? "text-red-600 dark:text-red-400" : "text-muted-foreground")} />
            </div>
            <div className={cn("text-xl font-bold tabular-nums mt-1", failed > 0 ? "text-red-600 dark:text-red-400" : "text-foreground")}>
              {failed}
            </div>
            <div className="text-[10.5px] opacity-80 mt-0.5">Requires retry</div>
          </div>

          <div className="p-3 rounded-md bg-muted/40 border border-border/40 flex flex-col justify-between">
            <div className="flex items-center justify-between text-muted-foreground text-xs">
              <span>Retrying</span>
              <RefreshCw className="w-3.5 h-3.5 text-purple-500" />
            </div>
            <div className="text-xl font-bold text-foreground tabular-nums mt-1">{retrying}</div>
            <div className="text-[10.5px] text-muted-foreground mt-0.5">Auto-retry queue</div>
          </div>
        </div>

        {/* Failures by Type / Service Status */}
        {failureEntries.length > 0 ? (
          <div className="space-y-1.5 p-3 rounded-md bg-red-500/5 border border-red-500/20">
            <div className="text-xs font-semibold text-red-700 dark:text-red-300 flex items-center justify-between">
              <span>Failures Breakdown</span>
              <span className="text-[11px] font-normal">{failureEntries.length} affected categories</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {failureEntries.map(([type, count]) => (
                <div
                  key={type}
                  className="flex items-center justify-between px-2.5 py-1.5 rounded bg-background/80 border border-red-500/20 text-xs"
                >
                  <span className="text-muted-foreground font-mono text-[11px]">{type}</span>
                  <span className="font-semibold text-red-600 dark:text-red-400 tabular-nums">
                    {count} failed
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between px-3 py-2 rounded bg-muted/30 border border-border/30 text-xs text-muted-foreground">
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
