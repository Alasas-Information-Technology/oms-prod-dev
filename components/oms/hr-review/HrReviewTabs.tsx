"use client";

import { HR_REVIEW_TABS, HrReviewTab } from "@/types/hr-review";
import { cn } from "@/components/ui/utils";

interface HrReviewTabsProps {
  value: HrReviewTab;
  onValueChange: (value: HrReviewTab) => void;
  attachmentCount?: number;
  auditCount?: number;
}

export function HrReviewTabs({
  value,
  onValueChange,
  attachmentCount = 0,
  auditCount = 0,
}: HrReviewTabsProps) {
  const tabs = HR_REVIEW_TABS.map((tab) => ({
    ...tab,
    count:
      tab.value === "attachments"
        ? attachmentCount
        : tab.value === "audit"
        ? auditCount
        : 0,
  }));

  return (
    <div className="w-full border-b border-border">
      <div className="flex h-10 overflow-x-auto">
        {tabs.map((tab, index) => {
          const isActive = value === tab.value;
          
          return (
            <button
              key={tab.value}
              onClick={() => onValueChange(tab.value as HrReviewTab)}
              className={cn(
                "relative flex h-full items-center whitespace-nowrap px-4 text-[14px] transition-colors focus-visible:outline-none",
                index === 0 && "pl-0", // First item flush left
                isActive
                  ? "font-medium text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
              
              {tab.count > 0 && (
                <span className="ml-[6px] text-[13px] font-normal tabular-nums text-muted-foreground/70">
                  {tab.count}
                </span>
              )}

              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand-teal" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}