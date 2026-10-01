"use client";

import React from "react";
import { SimpleKpiCard } from "@/components/budget/SimpleKpiCard";
import { WidgetProps } from "@/lib/dashboard/registry";
import { ElevatedAccountsData } from "@/types/dashboard";

export function ElevatedAccountsTile({
  data,
  isLoading,
  error,
}: WidgetProps<ElevatedAccountsData>) {
  const count = data?.count ?? 0;
  const sysAdmins = data?.systemAdminsCount ?? count;
  const globalScope = data?.globalScopeCount ?? 0;

  const isZero = count === 0;

  return (
    <SimpleKpiCard
      title="Elevated accounts"
      value={count}
      description={isZero ? "Lockout risk" : `${sysAdmins} admins · ${globalScope} global`}
      href="/app/administration/users?filter=elevated"
      icon="lucide:user-check"
      sparkline={data?.sparkline}
      isLoading={isLoading}
      zeroMeaning="NEEDS_ACTION"
      zeroLabel="No administrators — this is a lockout risk."
    />
  );
}
