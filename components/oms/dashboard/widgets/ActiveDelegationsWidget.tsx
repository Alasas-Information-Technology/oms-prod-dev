"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, UserCheck } from "lucide-react";
import { WidgetShell } from "../WidgetShell";
import { StatusTooltipIcon } from "../StatusTooltipIcon";
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
        <StatusTooltipIcon
          status={expiringSoonCount > 0 ? "WARNING" : "SUCCESS"}
          label={expiringSoonCount > 0 ? `${expiringSoonCount} expiring` : `${delegations.length} active`}
          tooltipTitle="Authority Delegations"
          tooltipDescription={
            expiringSoonCount > 0
              ? `${expiringSoonCount} approval delegations are expiring within 3 days.`
              : "All active delegations are currently valid."
          }
          tooltipDetails={[
            { label: "Active Delegations", value: `${delegations.length}` },
            { label: "Expiring Soon (≤3d)", value: `${expiringSoonCount}` },
          ]}
          showBorder
        />
      }
    >
      <div className="space-y-0.5 select-none">
        {delegations.length === 0 ? (
          <div className="py-6 text-center text-xs text-muted-foreground">
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
                  "group flex items-center justify-between h-[38px] px-2.5 sm:px-3 rounded-lg transition-colors border",
                  isExpiringSoon
                    ? "bg-amber-500/10 border-amber-500/30 dark:bg-amber-950/20 dark:border-amber-900/40 hover:bg-amber-500/15"
                    : "bg-transparent hover:bg-muted/40 border-transparent hover:border-border/30 dark:hover:border-white/[0.04]"
                )}
              >
                {/* Left: Delegator -> Delegate + Scope */}
                <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
                  <div
                    className={cn(
                      "w-5.5 h-5.5 rounded-md flex items-center justify-center shrink-0 text-xs",
                      isExpiringSoon
                        ? "bg-amber-500/20 text-amber-700 dark:text-amber-300"
                        : "bg-muted/60 text-muted-foreground"
                    )}
                  >
                    <UserCheck className="w-3 h-3" />
                  </div>

                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5 text-[12.5px] font-medium text-foreground/90 truncate leading-tight">
                      <span className="truncate">{del.delegator.name}</span>
                      <ArrowRight className="w-3 h-3 text-muted-foreground/60 shrink-0" />
                      <span className="font-semibold text-primary truncate">{del.delegate.name}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground/70 truncate leading-tight mt-0.5">
                      {del.scope}
                    </span>
                  </div>
                </div>

                {/* Right: Expiry badge with tooltip */}
                <div className="flex items-center gap-2 shrink-0">
                  {isExpiringSoon ? (
                    <StatusTooltipIcon
                      status="WARNING"
                      label={`${del.daysRemaining}d left`}
                      tooltipTitle="Delegation Expiring Soon"
                      tooltipDescription={`Delegation from ${del.delegator.name} to ${del.delegate.name} expires in ${del.daysRemaining} days (${formatDate(del.validUntil)}).`}
                      tooltipDetails={[
                        { label: "Delegator", value: del.delegator.name },
                        { label: "Delegate", value: del.delegate.name },
                        { label: "Valid Until", value: formatDate(del.validUntil) },
                        { label: "Days Left", value: `${del.daysRemaining} days` },
                      ]}
                      size="sm"
                    />
                  ) : (
                    <span className="text-[10.5px] font-mono text-muted-foreground tabular-nums">
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

