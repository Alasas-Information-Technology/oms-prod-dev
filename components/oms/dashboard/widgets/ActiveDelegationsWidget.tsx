"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Clock, UserCheck, Users } from "lucide-react";
import { WidgetShell } from "../WidgetShell";
import { WidgetProps } from "@/lib/dashboard/registry";
import { ActiveDelegationsData } from "@/types/dashboard";
import { cn } from "@/lib/utils";

function formatDate(isoDate: string): string {
  try {
    const d = new Date(isoDate);
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
  } catch {
    return isoDate;
  }
}

export function ActiveDelegationsWidget({
  scope,
  data,
  isLoading,
  error,
  onRetry,
  updatedAt,
}: WidgetProps<ActiveDelegationsData>) {
  const delegations = data?.delegations || [];
  const expiringSoonCount = data?.expiringWithin3Days ?? delegations.filter((d) => d.daysRemaining <= 3).length;

  return (
    <WidgetShell
      title="Active delegations"
      scopeLabel={scope?.label}
      updatedAt={updatedAt}
      href="/app/administration/delegations"
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      minHeight={240}
      headerActions={
        expiringSoonCount > 0 ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
            <Clock className="w-3 h-3" />
            {expiringSoonCount} expiring soon
          </span>
        ) : (
          <span className="text-[11.5px] font-medium text-muted-foreground bg-muted/50 px-2 py-0.5 rounded border border-border/30">
            {delegations.length} active
          </span>
        )
      }
    >
      <div className="space-y-1.5 select-none">
        {delegations.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted-foreground">
            No active authority delegations in place.
          </div>
        ) : (
          delegations.map((del) => {
            const isExpiringSoon = del.daysRemaining <= 3 || del.isExpiringSoon;

            return (
              <Link
                key={del.delegationId}
                href="/app/administration/delegations"
                className={cn(
                  "group flex items-center justify-between min-h-[44px] px-3.5 py-1.5 rounded-md transition-colors border",
                  isExpiringSoon
                    ? "bg-amber-500/10 border-amber-500/30 dark:bg-amber-950/20 dark:border-amber-900/40 hover:bg-amber-500/15"
                    : "bg-background/40 hover:bg-muted/50 border-transparent hover:border-border/40"
                )}
              >
                {/* Left: Delegator -> Delegate + Scope */}
                <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
                  <div className={cn(
                    "w-6 h-6 rounded flex items-center justify-center shrink-0 text-xs",
                    isExpiringSoon
                      ? "bg-amber-500/20 text-amber-700 dark:text-amber-300"
                      : "bg-muted text-muted-foreground"
                  )}>
                    <UserCheck className="w-3.5 h-3.5" />
                  </div>

                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5 text-[13px] font-medium text-foreground truncate leading-tight">
                      <span className="truncate">{del.delegator.name}</span>
                      <ArrowRight className="w-3 h-3 text-muted-foreground shrink-0" />
                      <span className="font-semibold text-primary truncate">{del.delegate.name}</span>
                    </div>
                    <span className="text-[11px] text-muted-foreground truncate leading-tight mt-0.5">
                      {del.scope}
                    </span>
                  </div>
                </div>

                {/* Right: Expiry badge */}
                <div className="flex items-center gap-2 shrink-0">
                  {isExpiringSoon ? (
                    <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30 tabular-nums">
                      {del.daysRemaining}d left
                    </span>
                  ) : (
                    <span className="text-[11px] font-medium text-muted-foreground tabular-nums">
                      Until {formatDate(del.validUntil)}
                    </span>
                  )}
                </div>
              </Link>
            );
          })
        )}
      </div>
    </WidgetShell>
  );
}
