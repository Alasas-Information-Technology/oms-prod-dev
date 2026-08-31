"use client";

import React from "react";
import { UserCheck } from "lucide-react";
import { KpiTile } from "../KpiTile";
import { WidgetProps } from "@/src/lib/dashboard/registry";
import { OnboardingCasesData } from "@/src/types/dashboard";

export function OnboardingCasesTile({
  scope,
  data,
  isLoading,
  error,
  onRetry,
}: WidgetProps<OnboardingCasesData>) {
  const activeCount = data?.activeCount ?? 0;
  const joiningThisWeek = data?.joiningThisWeek ?? 0;

  return (
    <KpiTile
      title="Onboarding cases"
      scopeLabel={scope?.label}
      value={activeCount}
      badge={
        joiningThisWeek > 0
          ? {
              text: `${joiningThisWeek} joining this week`,
              tone: "emerald",
            }
          : {
              text: "Active cases",
              tone: "neutral",
            }
      }
      href="/app/workforce/onboarding"
      icon={UserCheck}
      tone="emerald"
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
    />
  );
}
