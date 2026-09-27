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
    <div className="w-full border-b border-border/80">
      <div className="flex h-10 gap-1 overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = value === tab.value;

          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => onValueChange(tab.value as HrReviewTab)}
              className={cn(
                "group relative flex h-full items-center whitespace-nowrap px-3.5 text-[13.5px] transition-all focus-visible:outline-none cursor-pointer rounded-t-lg",
                isActive
                  ? "font-semibold text-brand-teal dark:text-brand-teal"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              )}
            >
              {tab.label}

              {tab.count > 0 && (
                <span
                  className={cn(
                    "ml-1.5 rounded-full px-1.5 py-0.2 text-[11px] font-semibold tabular-nums",
                    isActive
                      ? "bg-brand-teal/15 text-brand-teal"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {tab.count}
                </span>
              )}

              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-[2.5px] rounded-t-full bg-brand-teal shadow-[0_-1px_6px_rgba(35,135,156,0.5)]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}