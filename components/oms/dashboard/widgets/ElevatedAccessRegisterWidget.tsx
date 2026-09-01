"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight, Globe, Key, Shield, UserCheck, Users } from "lucide-react";
import { WidgetShell } from "../WidgetShell";
import { WidgetProps } from "@/lib/dashboard/registry";
import { ElevatedAccessRegisterData } from "@/types/dashboard";
import { cn } from "@/lib/utils";

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
        <span className="text-[11.5px] font-medium text-muted-foreground bg-muted/50 px-2 py-0.5 rounded border border-border/30">
          {sysAdmins.count + globalScope.count} privileged accounts
        </span>
      }
    >
      <div className="space-y-2.5 select-none">
        {/* System Admins Row */}
        <div className="p-3 rounded-md bg-muted/40 border border-border/40 space-y-2">
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

        {/* 3 Secondary Metric Rows */}
        <div className="grid grid-cols-3 gap-2">
          <Link
            href="/app/administration/users?filter=global-scope"
            className="p-2.5 rounded-md bg-muted/30 hover:bg-muted/60 border border-border/30 transition-colors flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Global Scope</span>
              <Globe className="w-3 h-3 text-blue-500" />
            </div>
            <div className="text-lg font-bold text-foreground tabular-nums mt-1">{globalScope.count}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">Unrestricted</div>
          </Link>

          <Link
            href="/app/administration/security-dashboard?tab=overrides"
            className="p-2.5 rounded-md bg-muted/30 hover:bg-muted/60 border border-border/30 transition-colors flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Overrides</span>
              <Key className="w-3 h-3 text-amber-500" />
            </div>
            <div className="text-lg font-bold text-foreground tabular-nums mt-1">{activeOverrides.count}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">
              {activeOverrides.expiringWithin7Days > 0 ? (
                <span className="text-amber-600 dark:text-amber-400 font-medium">
                  {activeOverrides.expiringWithin7Days} exp. in 7d
                </span>
              ) : (
                "Active"
              )}
            </div>
          </Link>

          <Link
            href="/app/administration/delegations"
            className="p-2.5 rounded-md bg-muted/30 hover:bg-muted/60 border border-border/30 transition-colors flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Delegations</span>
              <Users className="w-3 h-3 text-purple-500" />
            </div>
            <div className="text-lg font-bold text-foreground tabular-nums mt-1">{activeDelegations.count}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">In effect</div>
          </Link>
        </div>
      </div>
    </WidgetShell>
  );
}
