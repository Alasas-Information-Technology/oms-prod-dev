"use client";

import React from "react";
import { WidgetShell } from "../WidgetShell";
import { StatusTooltipIcon } from "../StatusTooltipIcon";
import { WidgetProps } from "@/lib/dashboard/registry";
import { EmiratisationQuotaData } from "@/types/dashboard";
import { Waffle } from "../Waffle";
import { cn } from "@/lib/utils";

export function EmiratisationQuotaWidget({
  scope,
  data,
  isLoading,
  error,
  onRetry,
  updatedAt,
}: WidgetProps<EmiratisationQuotaData>) {
  const isCompliant = data?.isCompliant ?? false;
  const currentPercent = data?.currentPercent ?? 0;
  const targetPercent = data?.targetPercent ?? 0;
  const byBusinessUnit = data?.byBusinessUnit || [];

  return (
    <WidgetShell
      title="Emiratisation quota"
      scopeLabel={scope?.label}
      href="/app/workforce"
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      updatedAt={updatedAt}
      minHeight={215}
      headerActions={
        <StatusTooltipIcon
          status={isCompliant ? "SUCCESS" : "WARNING"}
          label={isCompliant ? "Compliant" : "Below target"}
          tooltipTitle="Emiratisation Compliance Status"
          tooltipDescription={
            isCompliant
              ? `National workforce participation is at ${currentPercent.toFixed(1)}%, exceeding the regulatory target of ${targetPercent.toFixed(1)}%.`
              : `Current quota of ${currentPercent.toFixed(1)}% is below the required target of ${targetPercent.toFixed(1)}%. Remediation active.`
          }
          tooltipDetails={[
            { label: "Current Rate", value: `${currentPercent.toFixed(1)}%` },
            { label: "Regulatory Target", value: `${targetPercent.toFixed(1)}%` },
            { label: "Compliance", value: isCompliant ? "Passed" : "Action Needed" },
          ]}
          showBorder
        />
      }
    >

      {!data ? (
        <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
          No quota data available.
        </div>
      ) : (
        <div className="flex flex-col justify-between flex-1 gap-2">
          {/* NEW: Waffle (M7) */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-foreground">
                {currentPercent.toFixed(1)}%
              </span>
              <span className="text-xs text-muted-foreground">
                (target {targetPercent.toFixed(1)}%)
              </span>
            </div>
            <div className="flex items-center">
              <Waffle 
                percent={currentPercent} 
                label="Current Quota"
              />
            </div>
          </div>

          {/* Breakdown per BU with Horizontal Bars per Task 1 */}
          {byBusinessUnit.length > 0 && (
            <div className="flex flex-col gap-2 pt-2 border-t border-border/40">
              {byBusinessUnit.slice(0, 3).map((bu) => {
                const meetsTarget = bu.currentPercent >= bu.targetPercent;
                const barColor = meetsTarget
                  ? "var(--success-border, #3A8F6B)"
                  : "var(--warning-border, #B4791F)";
                // Scale proportional to max possible quota window (e.g. 25%)
                const maxScale = Math.max(25, Math.ceil(bu.targetPercent * 1.3));
                const barPercent = Math.min(100, Math.max(4, (bu.currentPercent / maxScale) * 100));
                const targetPos = Math.min(100, (bu.targetPercent / maxScale) * 100);

                return (
                  <div key={bu.businessUnitId} className="flex flex-col gap-1 w-full">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-foreground truncate max-w-[160px]" title={bu.name}>
                        {bu.name}
                      </span>
                      <div className="flex items-center gap-2 text-[11px] tabular-nums">
                        <span className="text-muted-foreground">
                          {bu.uaeNationalHeadcount}/{bu.totalHeadcount}
                        </span>
                        <span
                          className={cn(
                            "font-semibold",
                            meetsTarget
                              ? "text-success-text"
                              : "text-warning-text"
                          )}
                        >
                          {bu.currentPercent.toFixed(1)}%
                        </span>
                      </div>
                    </div>

                    {/* Horizontal Bar with Target Line */}
                    <div className="relative w-full h-1.5 bg-muted/60 dark:bg-slate-800/80 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${barPercent}%`,
                          backgroundColor: barColor,
                        }}
                      />
                      <div
                        style={{ left: `${targetPos}%` }}
                        className="absolute top-0 bottom-0 w-[1.5px] bg-foreground/70 border-l border-dashed border-background"
                        title={`Target: ${bu.targetPercent}%`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </WidgetShell>
  );
}
