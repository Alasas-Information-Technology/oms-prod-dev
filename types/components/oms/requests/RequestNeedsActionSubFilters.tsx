"use client";

import { NeedsActionSubFilter } from "./request.types";
import { cn } from "@/components/ui/utils";

interface RequestNeedsActionSubFiltersProps {
  value: NeedsActionSubFilter;
  onValueChange: (value: NeedsActionSubFilter) => void;
  counts: Record<NeedsActionSubFilter, number>;
}

export function RequestNeedsActionSubFilters({
  value,
  onValueChange,
  counts,
}: RequestNeedsActionSubFiltersProps) {
  const filters: { key: NeedsActionSubFilter; label: string; count: number }[] = [
    { key: "all", label: "All", count: counts.all },
    { key: "approvals", label: "Approvals", count: counts.approvals },
    { key: "revision", label: "Needs revision", count: counts.revision },
    { key: "drafts", label: "Drafts", count: counts.drafts },
    { key: "other", label: "Other", count: counts.other },
  ];

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
      {filters.map((f) => {
        const isActive = value === f.key;
        return (
          <button
            key={f.key}
            type="button"
            onClick={() => onValueChange(f.key)}
            className={cn(
              "inline-flex items-center gap-2 px-3 py-1 rounded-md text-xs font-medium transition-all duration-200 border cursor-pointer select-none",
              isActive
                ? "bg-primary text-primary-foreground border-primary shadow-xs font-semibold"
                : "bg-muted/50 text-muted-foreground border-border/60 hover:bg-muted hover:text-foreground"
            )}
          >
            <span>{f.label}</span>
            <span
              className={cn(
                "inline-flex items-center justify-center min-w-[1.25rem] h-4.5 px-1.5 rounded-full text-[10px] font-bold tabular-nums",
                isActive
                  ? "bg-primary-foreground/20 text-primary-foreground"
                  : "bg-muted-foreground/15 text-muted-foreground"
              )}
            >
              {f.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
