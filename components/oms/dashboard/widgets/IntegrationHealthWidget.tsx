"use client";

import React from "react";
import { WidgetShell } from "../WidgetShell";
import { StatusTooltipIcon } from "../StatusTooltipIcon";
import { WidgetProps } from "@/lib/dashboard/registry";
import { IntegrationHealthData } from "@/types/dashboard";

// TODO(integration-ops): wire to real health checks

export function IntegrationHealthWidget({
  scope,
  data,
  isLoading,
  error,
  onRetry,
}: WidgetProps<IntegrationHealthData>) {
  const systems = data?.systems || [];
  const failingCount = systems.filter((s) => s.status === "FAILING").length;

  return (
    <WidgetShell
      title="Integration health"
      scopeLabel={scope?.label}
      href="/app/administration/integrations"
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      minHeight={215}
      headerActions={
        <StatusTooltipIcon
          status={failingCount > 0 ? "FAILED" : "HEALTHY"}
          label={failingCount > 0 ? `${failingCount} failing` : "All connected"}
          tooltipTitle="Enterprise Integrations Health"
          tooltipDescription={
            failingCount > 0
              ? `${failingCount} external API integrations/sync jobs are experiencing connection or data failures.`
              : "All enterprise HRIS, ERP, and payment gateway connectors are synced and healthy."
          }
          tooltipDetails={[
            { label: "Active Connectors", value: `${systems.length} systems` },
            { label: "Failing Services", value: `${failingCount}` },
          ]}
          showBorder
        />
      }
    >
      {!data || systems.length === 0 ? (
        <div className="flex items-center justify-center py-8 text-xs text-muted-foreground">
          No health data available.
        </div>
      ) : (
        <div className="flex flex-col gap-1 select-none">
          {systems.map((sys) => {
            const isHealthy = sys.status === "HEALTHY";
            const isFailing = sys.status === "FAILING";
            const statusLabel = isFailing ? "FAILING" : isHealthy ? "HEALTHY" : "DEGRADED";

            return (
              <div 
                key={sys.id} 
                className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/30 transition-colors border border-transparent hover:border-border/30 dark:hover:border-white/[0.04]"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
                  <StatusTooltipIcon
                    status={statusLabel}
                    tooltipTitle={`Integration: ${sys.name}`}
                    tooltipDescription={`Status: ${statusLabel}. Last synchronization event was recorded at ${sys.lastSyncAt}.`}
                    tooltipDetails={[
                      { label: "System Name", value: sys.name },
                      { label: "Connection Status", value: statusLabel },
                      { label: "Failures (24h)", value: `${sys.failureCount24h}` },
                      { label: "Last Sync", value: sys.lastSyncAt },
                    ]}
                    size="sm"
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="text-[12.5px] font-medium text-foreground/90 truncate leading-tight">{sys.name}</span>
                    <span className="text-[10.5px] text-muted-foreground truncate leading-tight mt-0.5">
                      Last sync: {sys.lastSyncAt}
                    </span>
                  </div>
                </div>
                
                {sys.failureCount24h > 0 ? (
                  <span className="text-[10.5px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-500/10 px-1.5 py-0.2 rounded border border-rose-500/20 tabular-nums">
                    {sys.failureCount24h} fail{sys.failureCount24h > 1 ? "s" : ""}
                  </span>
                ) : (
                  <span className="text-[10.5px] font-mono text-muted-foreground tabular-nums">
                    Synced
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </WidgetShell>
  );
}

