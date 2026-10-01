"use client";

import { WidgetProps } from "@/lib/dashboard/registry";
import { ElevatedAccessRegisterData } from "@/types/dashboard";
import { ArrowUpRight, Globe, Key, Shield, Users } from "lucide-react";
import Link from "next/link";
import React from "react";
import { StatusTooltipIcon } from "../StatusTooltipIcon";
import { WidgetShell } from "../WidgetShell";
import { cn } from "@/lib/utils";

// ─── MetricTile ──────────────────────────────────────────────────────────────
// Reusable linked stat card for the 3-column secondary metrics grid.

interface MetricTileProps {
  href: string;
  label: string;
  icon: React.ReactNode;
  value: number;
  sub?: React.ReactNode;
  focus?: boolean;
}

function MetricTile({ href, label, icon, value, sub, focus = false }: MetricTileProps) {
  return (
    <Link
      href={href}
      className={cn(
        "p-2.5 rounded-sm bg-muted/30 border hover:bg-accent border-foreground/10 dark:border-foreground/4 transition-colors flex flex-col justify-between",
        focus && "bg-gradient-to-br from-brand-teal/15 to-brand-teal/50 border-brand-teal/30 dark:border-brand-teal/20"
      )}
    >
      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
        <span>{label}</span>
        <span className={cn("text-foreground/70", focus && "text-brand-teal")}>{icon}</span>
      </div>
      <div className={cn("text-lg font-bold text-foreground tabular-nums mt-1", focus && "text-brand-teal")}>{value}</div>
      <div className="text-[10px] text-muted-foreground mt-0.5">{sub}</div>
    </Link>
  );
}

// ─── ElevatedAccessRegisterWidget ────────────────────────────────────────────

export function ElevatedAccessRegisterWidget({
  scope,
  data,
  isLoading,
  error,
  onRetry,
  updatedAt,
}: WidgetProps<ElevatedAccessRegisterData>) {
  const sysAdmins = data?.systemAdmins || { count: 0, users: [] };
  const globalScope = data?.globalScope || { count: 0 };
  const activeOverrides = data?.activeOverrides || { count: 0, expiringWithin7Days: 0 };
  const activeDelegations = data?.activeDelegations || { count: 0 };

  return (
    <WidgetShell
      title="Elevated access register"
      scopeLabel={scope?.label}
      updatedAt={updatedAt}
      href="/app/administration/users?filter=elevated"
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      minHeight={240}
      headerActions={
        <StatusTooltipIcon
          status="INFO"
          label={`${sysAdmins.count + globalScope.count} privileged`}
          tooltipTitle="Elevated & Privileged Access"
          tooltipDescription="Total accounts holding administrative roles, full-tenant global scopes, active overrides, or delegations."
          tooltipDetails={[
            { label: "System Admins", value: `${sysAdmins.count}` },
            { label: "Global Scope", value: `${globalScope.count}` },
            { label: "Active Overrides", value: `${activeOverrides.count}` },
            { label: "Active Delegations", value: `${activeDelegations.count}` },
          ]}
          showBorder
        />
      }
    >
      <div className="space-y-2.5 select-none">

        {/* System Admins primary row */}
        <div className="p-3 rounded-sm bg-muted/40 border hover:bg-accent border-foreground/10 dark:border-foreground/4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
              <Shield className="w-3.5 h-3.5 text-primary" />
              <span>System Administrators ({sysAdmins.count})</span>
            </div>
            <Link
              href="/app/administration/users?role=SYSTEM_ADMIN"
              className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-0.5 hover:underline"
            >
              <span>Manage</span>
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {sysAdmins.users && sysAdmins.users.length > 0 ? (
              sysAdmins.users.map((u) => (
                <span
                  key={u.userId}
                  className="text-[11.5px] font-medium px-2 py-0.5 rounded bg-background border border-border/60 text-foreground"
                >
                  {u.name}
                </span>
              ))
            ) : (
              <span className="text-xs text-muted-foreground">None assigned</span>
            )}
          </div>
        </div>

        {/* 3-column secondary metrics */}
        <div className="grid grid-cols-3 gap-2">
          <MetricTile
            href="/app/administration/users?filter=global-scope"
            label="Global Scope"
            icon={<Globe className="w-3 h-3" />}
            value={globalScope.count}
            sub="Unrestricted"
            focus
          />

          <MetricTile
            href="/app/administration/security-dashboard?tab=overrides"
            label="Overrides"
            icon={<Key className="w-3 h-3" />}
            value={activeOverrides.count}
            sub={
              activeOverrides.expiringWithin7Days > 0 ? (
                <span className="text-warning-text font-medium">
                  {activeOverrides.expiringWithin7Days} exp. in 7d
                </span>
              ) : (
                "Active"
              )
            }
          />
          <MetricTile
            href="/app/administration/delegations"
            label="Delegations"
            icon={<Users className="w-3 h-3" />}
            value={activeDelegations.count}
            sub="In effect"
          />
        </div>
      </div>
    </WidgetShell>
  );
}
