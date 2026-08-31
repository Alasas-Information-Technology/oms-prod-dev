"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { WidgetShell } from "../WidgetShell";
import { WidgetProps } from "@/src/lib/dashboard/registry";
import { BudgetAllocationByDepartmentData, DepartmentBudgetAllocationItem } from "@/src/types/dashboard";
import { formatAbbreviated } from "@/lib/money";
import { cn } from "@/lib/utils";

function getUtilisationTone(pct: number) {
  if (pct >= 95) {
    return {
      bar: "bg-rose-500 dark:bg-rose-600",
      badge: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30 font-bold",
      text: "text-rose-600 dark:text-rose-400",
    };
  }
  if (pct >= 80) {
    return {
      bar: "bg-amber-500 dark:bg-amber-600",
      badge: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 font-semibold",
      text: "text-amber-600 dark:text-amber-400",
    };
  }
  return {
    bar: "bg-blue-500 dark:bg-blue-600",
    badge: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20 font-medium",
    text: "text-blue-600 dark:text-blue-400",
  };
}

export function BudgetAllocationByDepartmentChart({
  scope,
  data,
  isLoading,
  error,
  onRetry,
}: WidgetProps<BudgetAllocationByDepartmentData>) {
  const router = useRouter();

  // Pre-sorted by utilisation descending as mandated by requirement
  const departments = React.useMemo(() => {
    if (!data?.departments) return [];
    return [...data.departments].sort((a, b) => b.utilisationPercent - a.utilisationPercent);
  }, [data]);

  const handleRowClick = (dept: DepartmentBudgetAllocationItem) => {
    router.push(`/app/budget?department=${dept.orgUnitId}`);
  };

  const srSummary = departments
    .map(
      (d) =>
        `${d.name}: ${d.utilisationPercent}% utilized (${formatAbbreviated(d.consumed)} consumed of ${formatAbbreviated(d.allocated)})`
    )
    .join("; ");

  return (
    <WidgetShell
      title="Budget allocation by department"
      scopeLabel={scope?.label}
      href="/app/budget"
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      minHeight={280}
    >
      {/* Screen Reader Accessible Summary */}
      <span className="sr-only">
        Department budget allocation sorted by utilisation: {srSummary}
      </span>

      {departments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
          <p className="text-sm">No department budget allocations found.</p>
        </div>
      ) : (
        <div className="flex flex-col justify-between flex-1 gap-3 py-1">
          {/* Department Rows */}
          <div className="flex flex-col gap-2.5">
            {departments.map((dept) => {
              const tone = getUtilisationTone(dept.utilisationPercent);
              const barWidth = Math.min(Math.max(dept.utilisationPercent, 2), 100);

              return (
                <button
                  type="button"
                  key={dept.orgUnitId}
                  onClick={() => handleRowClick(dept)}
                  className="group flex flex-col gap-1.5 p-2 rounded-lg border border-border/40 bg-card/40 hover:bg-muted/40 transition-all text-left cursor-pointer"
                >
                  {/* Row Header: Name + Utilisation badge + Raw amounts */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-foreground truncate group-hover:text-primary transition-colors">
                      {dept.name}
                    </span>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] text-muted-foreground tabular-nums">
                        {formatAbbreviated(dept.consumed)} / {formatAbbreviated(dept.allocated)}
                      </span>
                      <span
                        className={cn(
                          "px-1.5 py-0.2 rounded text-[10px] border tabular-nums",
                          tone.badge
                        )}
                      >
                        {dept.utilisationPercent.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  {/* Horizontal Progress Bar */}
                  <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted/70 flex">
                    <div
                      style={{ width: `${barWidth}%` }}
                      className={cn("h-full transition-all duration-300 rounded-full", tone.bar)}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </WidgetShell>
  );
}
