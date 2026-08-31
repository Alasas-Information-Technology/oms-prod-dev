"use client";

import { TabsButton } from "@/components/shared/TabsButton";

import { RequestTab } from "./request.types";

interface RequestStatusTabsProps {
  value: RequestTab;
  onValueChange: (value: RequestTab) => void;
  counts: Record<RequestTab, number>;
}

export function RequestStatusTabs({
  value,
  onValueChange,
  counts,
}: RequestStatusTabsProps) {
  const tabs = [
    {
      value: "all" as const,
      label: "All",
      badge: counts.all,
    },
    {
      value: "draft" as const,
      label: "Drafts",
      badge: counts.draft,
    },
    {
      value: "needs-action" as const,
      label: "Needs My Action",
      badge: counts["needs-action"],
    },
    {
      value: "in-progress" as const,
      label: "In Progress",
      badge: counts["in-progress"],
    },
    {
      value: "closed" as const,
      label: "Closed",
      badge: counts.closed,
    },
  ];

  return (
    <div className="overflow-x-auto pb-1">
      <TabsButton
        tabs={tabs}
        value={value}
        onValueChange={onValueChange}
        className="w-max"
      />
    </div>
  );
}