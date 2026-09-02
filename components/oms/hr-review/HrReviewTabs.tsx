"use client";

import { TabsButton } from "@/components/shared/TabsButton";

import {
  HR_REVIEW_TABS,
  HrReviewTab,
} from "./hr-review.types";

interface HrReviewTabsProps {
  value: HrReviewTab;
  onValueChange: (
    value: HrReviewTab
  ) => void;
  attachmentCount?: number;
  auditCount?: number;
}

export function HrReviewTabs({
  value,
  onValueChange,
  attachmentCount = 0,
  auditCount = 0,
}: HrReviewTabsProps) {
  const tabs = HR_REVIEW_TABS.map(
    (tab) => ({
      ...tab,

      badge:
        tab.value === "attachments"
          ? attachmentCount
          : tab.value === "audit"
            ? auditCount
            : undefined,
    })
  );

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