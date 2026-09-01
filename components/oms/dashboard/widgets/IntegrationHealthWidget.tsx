"use client";

import React from "react";
import { WidgetShell } from "../WidgetShell";
import { WidgetProps } from "@/lib/dashboard/registry";
import { IntegrationHealthData } from "@/types/dashboard";
import { cn } from "@/lib/utils";

// TODO(integration-ops): wire to real health checks

export function IntegrationHealthWidget({
  scope,
  data,
  isLoading,
  error,
  onRetry,
}: WidgetProps<IntegrationHealthData>) {
  
  const systems = data?.systems || [];

  return (
    <WidgetShell
      title="Integration health"
      scopeLabel={scope?.label}
      href="/app/administration/integrations"
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      minHeight={240}
    >
      {!data ? (
        <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
          No health data available.
        </div>
      ) : (
        <div className="flex flex-col gap-0 mt-1">
          {systems.map((sys) => {
            const isHealthy = sys.status === "HEALTHY";
            const isFailing = sys.status === "FAILING";
            
            return (
              <div 
                key={sys.id} 
                className="flex items-center justify-between py-2.5 border-b border-border/40 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "size-2.5 rounded-full shrink-0 shadow-sm",
                    isHealthy ? "bg-emerald-500 shadow-emerald-500/20" : 
                    isFailing ? "bg-red-500 shadow-red-500/20" : 
                    "bg-amber-500 shadow-amber-500/20"
                  )} />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-foreground">{sys.name}</span>
                    <span className="text-[11px] text-muted-foreground">
                      Last sync: {sys.lastSyncAt}
                    </span>
                  </div>
                </div>
                
                {sys.failureCount24h > 0 && (
                  <div className="flex items-center gap-1.5">
                    <span className={cn(
                      "text-[11px] font-semibold px-1.5 py-0.5 rounded",
                      isFailing ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"
                    )}>
                      {sys.failureCount24h} {sys.failureCount24h === 1 ? 'failure' : 'failures'}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </WidgetShell>
  );
}
