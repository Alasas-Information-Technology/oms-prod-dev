"use client";

import React from "react";
import { SimpleKpiCard } from "@/components/budget/SimpleKpiCard";
import { WidgetProps } from "@/lib/dashboard/registry";

export function RequisitorActionStackTile({
  data,
  isLoading,
}: WidgetProps<any>) {
  // We'll mock the data here if not provided since it's a structural compound widget
  const activeCount = data?.activeCount ?? 3;
  const joiningThisWeek = data?.joiningThisWeek ?? 1;
  
  const draftExpiringCount = data?.draftExpiringCount ?? 2;
  const draftsTotal = data?.draftsTotal ?? 5;

  return (
    <div className="flex flex-col gap-3 h-full">
      <div className="flex-1 min-h-0">
        <SimpleKpiCard
          title="Onboarding cases"
          value={activeCount}
          description={joiningThisWeek > 0 ? `${joiningThisWeek} joining this week` : "Active cases"}
          href="/app/workforce/onboarding"
          icon="lucide:user-check"
          sparkline={[3, 4, 3, 2, 3, 4, 5, 4, 3, 4, 5, 6, 5, 4, 3, 4, 5, 4, 3, 4, 5, 6]}
          isLoading={isLoading}
          zeroMeaning="GOOD"
          zeroLabel="No active cases"
          className="h-full"
        />
      </div>
      <div className="flex-1 min-h-0">
        <SimpleKpiCard
          title="Drafts expiring soon"
          value={draftExpiringCount}
          description={`Out of ${draftsTotal} saved drafts`}
          href="/app/requests?filter=drafts"
          icon="lucide:clock"
          isLoading={isLoading}
          zeroMeaning="GOOD"
          zeroLabel="No expiring drafts"
          color="text-amber-600"
          bg="bg-amber-500/10"
          className="h-full"
        />
      </div>
    </div>
  );
}
