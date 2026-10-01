"use client";

import { TabsButton } from "@/components/shared/TabsButton";

export type ApprovalsTab = "all" | "requisition" | "budget" | "other" | "overdue";

interface ApprovalsTabsProps {
  value: ApprovalsTab;
  onValueChange: (value: ApprovalsTab) => void;
  counts: {
    all: number;
    requisition: number;
    budget: number;
    other: number;
    breached: number;
  };
}

export function ApprovalsTabs({
  value,
  onValueChange,
  counts,
}: ApprovalsTabsProps) {
  const tabs: { value: ApprovalsTab; label: string; badge: number }[] = [
    {
      value: "all",
      label: "All",
      badge: counts.all,
    },
    {
      value: "requisition",
      label: "Requisitions",
      badge: counts.requisition,
    },
    {
      value: "budget",
      label: "Budget",
      badge: counts.budget,
    },
    {
      value: "other",
      label: "Other",
      badge: counts.other,
    },
  ];

  // Part 4.1: Add an Overdue tab that appears only when something is breached
  if (counts.breached > 0) {
    tabs.push({
      value: "overdue",
      label: "Overdue",
      badge: counts.breached,
    });
  }

  return (
    <div className="border-b border-border/40 px-6 py-2">
      <TabsButton
        tabs={tabs}
        value={value}
        onValueChange={onValueChange}
      />
    </div>
  );
}
