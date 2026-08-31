"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, FileEdit, Sliders, SlidersHorizontal } from "lucide-react";
import { WidgetShell } from "../WidgetShell";
import { WidgetProps } from "@/src/lib/dashboard/registry";
import { ConfigurationDriftData } from "@/src/types/dashboard";

function formatRelativeTime(isoDate: string): string {
  try {
    const diffMs = Date.now() - new Date(isoDate).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  } catch {
    return isoDate;
  }
}

export function ConfigurationDriftWidget({
  scope,
  data,
  isLoading,
  error,
  onRetry,
  updatedAt,
}: WidgetProps<ConfigurationDriftData>) {
  const changes = data?.changes || [];
  const count = data?.count ?? changes.length;

  return (
    <WidgetShell
      title="Configuration drift"
      scopeLabel={scope?.label}
      updatedAt={updatedAt}
      href="/app/administration/settings"
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      minHeight={240}
      headerActions={
        count > 0 ? (
          <span className="text-[11.5px] font-medium text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
            {count} customized setting{count === 1 ? "" : "s"}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" />
            Default baseline
          </span>
        )
      }
    >
      <div className="space-y-1.5 select-none">
        {changes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground text-xs">
            <SlidersHorizontal className="w-6 h-6 mb-2 opacity-50 text-emerald-600" />
            <span className="font-medium text-foreground">All settings are at their defaults.</span>
            <span className="text-[11px] mt-0.5">No configuration drift detected.</span>
          </div>
        ) : (
          changes.map((item, idx) => (
            <Link
              key={idx}
              href="/app/administration/settings"
              className="group flex items-center justify-between min-h-[44px] px-3.5 py-1.5 rounded-md hover:bg-muted/50 transition-colors border border-transparent hover:border-border/40"
            >
              {/* Left: Icon + Setting name + Changed By */}
              <div className="flex items-center gap-3 min-w-0 flex-1 pr-3">
                <div className="w-6 h-6 rounded flex items-center justify-center shrink-0 bg-muted text-muted-foreground text-xs">
                  <Sliders className="w-3.5 h-3.5" />
                </div>

                <div className="flex flex-col min-w-0">
                  <span className="text-[13px] font-medium text-foreground group-hover:text-primary transition-colors truncate leading-tight">
                    {item.setting}
                  </span>
                  <span className="text-[11px] text-muted-foreground truncate leading-tight mt-0.5">
                    Modified by {item.changedBy.name} · {formatRelativeTime(item.changedAt)}
                  </span>
                </div>
              </div>

              {/* Right: Default -> Current Value Chip */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="flex items-center gap-1.5 text-xs bg-muted/40 px-2.5 py-1 rounded border border-border/30">
                  <span className="text-muted-foreground line-through decoration-muted-foreground/60 tabular-nums">
                    {item.defaultValue}
                  </span>
                  <ArrowRight className="w-3 h-3 text-muted-foreground" />
                  <span className="font-semibold text-foreground tabular-nums">
                    {item.currentValue}
                  </span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </WidgetShell>
  );
}
