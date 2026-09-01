"use client";

import React from "react";
import { UserCheck } from "lucide-react";
import { KpiTile } from "../KpiTile";
import { WidgetProps } from "@/lib/dashboard/registry";
import { ElevatedAccountsData } from "@/types/dashboard";

export function ElevatedAccountsTile({
  scope,
  data,
  isLoading,
  error,
  onRetry,
  updatedAt,
}: WidgetProps<ElevatedAccountsData>) {
  const count = data?.count ?? 0;
  const sysAdmins = data?.systemAdminsCount ?? count;
  const globalScope = data?.globalScopeCount ?? 0;

  const isZero = count === 0;

  return (
    <KpiTile
      title="Elevated accounts"
      scopeLabel={scope?.label}
      value={count}
      badge={
        isZero
          ? {
              text: "Lockout risk",
              tone: "destructive",
            }
          : {
              text: `${sysAdmins} admins · ${globalScope} global`,
              tone: "neutral",
            }
      }
      href="/app/administration/users?filter=elevated"
      icon={UserCheck}
      tone={isZero ? "destructive" : "default"}
      sparklineData={data?.sparkline}
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      updatedAt={updatedAt}
      zeroMeaning="NEEDS_ACTION"
      zeroMessage="No administrators — this is a lockout risk."
    />
  );
}
