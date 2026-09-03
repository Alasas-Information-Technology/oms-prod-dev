"use client";

import React from "react";
import { SimpleKpiCard } from "@/components/budget/SimpleKpiCard";
import { WidgetProps } from "@/lib/dashboard/registry";
import { OnboardingCasesData } from "@/types/dashboard";

export function OnboardingCasesTile({
  data,
  isLoading,
}: WidgetProps<OnboardingCasesData>) {
  const activeCount = data?.activeCount ?? 0;
  const joiningThisWeek = data?.joiningThisWeek ?? 0;

  return (
    <SimpleKpiCard
      title="Onboarding cases"
      value={activeCount}
      description={joiningThisWeek > 0 ? `${joiningThisWeek} joining this week` : "Active cases"}
      href="/app/workforce/onboarding"
      icon="lucide:user-check"
      sparkline={data?.sparkline}
      isLoading={isLoading}
      zeroMeaning="GOOD"
      zeroLabel="No active cases"
      className="h-full"
    />
  );
}
