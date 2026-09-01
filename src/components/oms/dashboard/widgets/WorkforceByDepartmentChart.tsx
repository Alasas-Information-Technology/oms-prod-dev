"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { WidgetShell } from "../WidgetShell";
import { WidgetProps } from "@/src/lib/dashboard/registry";
import { WorkforceByDepartmentData, DepartmentWorkforceItem } from "@/src/types/dashboard";

export function WorkforceByDepartmentChart({
  scope,
  data,
  isLoading,
  error,
  onRetry,
}: WidgetProps<WorkforceByDepartmentData>) {
  const router = useRouter();
  const departments = data?.departments || [];

  const handleRowClick = (dept: DepartmentWorkforceItem) => {
    router.push(`/app/workforce?department=${dept.orgUnitId}`);
  };

  const srSummary = departments
    .map(
      (d) =>
        `${d.name}: ${d.active} active (${d.onshore} onshore, ${d.offshore} offshore), ${d.onboarding} onboarding, ${d.endingWithin90Days} ending within 90 days`
    )
    .join("; ");

  return (
    <WidgetShell
      title="Workforce by department"
      scopeLabel={scope?.label}
      href="/app/workforce"
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      minHeight={280}
      headerActions={
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground font-medium">
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-blue-500" />
            <span>Onshore</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-purple-500" />
            <span>Offshore</span>
          </div>
        </div>
      }
    >
      {/* Screen Reader Accessible Summary */}
      <span className="sr-only">
        Active workforce distribution by department: {srSummary}
      </span>

      {departments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
          <p className="text-sm">No workforce records available.</p>
        </div>
      ) : (
        <div className="flex flex-col justify-between flex-1 gap-2.5 py-1">
          {departments.map((dept) => {
            const total = dept.active > 0 ? dept.active : 1;
            const onshorePct = (dept.onshore / total) * 100;
            const offshorePct = (dept.offshore / total) * 100;

            return (
              <button
                type="button"
                key={dept.orgUnitId}
                onClick={() => handleRowClick(dept)}
                className="group flex flex-col gap-1.5 p-2 rounded-lg border border-border/40 bg-card/40 hover:bg-muted/40 transition-all text-left cursor-pointer"
              >
                {/* Top Row: Name + Active total + Sub-breakdown */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-foreground truncate group-hover:text-primary transition-colors">
                    {dept.name}
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-semibold text-foreground font-mono tabular-nums">
                      {dept.active} active
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      ({dept.onshore} on · {dept.offshore} off)
                    </span>
                  </div>
                </div>

                {/* Stacked Onshore / Offshore Bar */}
                <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted/70 flex">
                  <div
                    style={{ width: `${Math.max(onshorePct, 2)}%` }}
                    className="h-full bg-blue-500 dark:bg-blue-600 transition-all duration-300"
                    title={`Onshore: ${dept.onshore}`}
                  />
                  <div
                    style={{ width: `${Math.max(offshorePct, 2)}%` }}
                    className="h-full bg-purple-500 dark:bg-purple-600 transition-all duration-300"
                    title={`Offshore: ${dept.offshore}`}
                  />
                </div>

                {/* Secondary Status Line */}
                <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-0.5">
                  <span>
                    {dept.onboarding} onboarding · {dept.endingWithin90Days} ending within 90 days
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </WidgetShell>
  );
}
