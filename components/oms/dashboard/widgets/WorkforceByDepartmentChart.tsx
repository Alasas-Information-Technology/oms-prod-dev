"use client";

import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { WidgetShell } from "../WidgetShell";
import { WidgetProps } from "@/lib/dashboard/registry";
import { WorkforceByDepartmentData } from "@/types/dashboard";
import { DataTable, ColumnDef } from "@/components/shared/DataTable";
import { cn } from "@/lib/utils";

/**
 * V6 — Workforce by department, proportional per DASHBOARD-VISUAL-DEPTH.md:
 * - Proportional horizontal bars (not a table) showing relative headcount at a glance
 * - Onshore and offshore as two opacities of one hue, stacked within each bar
 * - Secondary line per row: "3 onboarding · 4 ending within 90 days"
 * - Maximum 8 departments, then "+N more"
 * - T8 Header Legend: Onshore / Offshore
 * - Mobile Table below 768px
 */
export function WorkforceByDepartmentChart({
  scope,
  data,
  isLoading,
  error,
  onRetry,
  updatedAt,
}: WidgetProps<WorkforceByDepartmentData>) {
  const router = useRouter();
  const allDepartments = useMemo(() => data?.departments || [], [data]);
  const displayedDepartments = useMemo(() => allDepartments.slice(0, 8), [allDepartments]);
  const remainingCount = Math.max(0, allDepartments.length - 8);

  const maxActive = useMemo(() => {
    if (!allDepartments.length) return 50;
    return Math.max(...allDepartments.map((d) => d.active || d.onshore + d.offshore || 1));
  }, [allDepartments]);

  const totals = data?.totals;

  const srSummary = allDepartments
    .map(
      (d) =>
        `${d.name}: ${d.active} active (${d.onshore} onshore, ${d.offshore} offshore, ${d.onboarding} onboarding, ${d.endingWithin90Days} ending soon)`
    )
    .join("; ");

  // T8 Header Legend
  const headerLegend = (
    <div className="flex items-center gap-3 text-[11px] text-muted-foreground select-none">
      <div className="flex items-center gap-1.5">
        <span className="w-2.5 h-2.5 rounded-xs bg-primary shrink-0" />
        <span>Onshore</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span
          style={{ backgroundColor: "color-mix(in srgb, var(--primary) 40%, transparent)" }}
          className="w-2.5 h-2.5 rounded-xs border border-primary/30 shrink-0"
        />
        <span>Offshore</span>
      </div>
    </div>
  );

  // Mobile Table columns
  const tableColumns: ColumnDef<any>[] = [
    {
      key: "name",
      header: "Department",
      render: (val, row) => (
        <div className="flex flex-col">
          <span className="font-medium text-foreground">{row.name}</span>
          <span className="text-[11px] text-muted-foreground">
            {row.onboarding || 0} onboarding · {row.endingWithin90Days || 0} ending
          </span>
        </div>
      ),
    },
    {
      key: "active",
      header: "Active",
      align: "right",
      render: (val, row) => (
        <span className="font-mono tabular-nums font-semibold text-foreground">
          {row.active || row.onshore + row.offshore}
        </span>
      ),
    },
    {
      key: "onshore",
      header: "On/Off",
      align: "right",
      render: (val, row) => (
        <span className="font-mono tabular-nums text-xs text-muted-foreground">
          {row.onshore}/{row.offshore}
        </span>
      ),
    },
  ];

  return (
    <WidgetShell
      title="Workforce by department"
      scopeLabel={scope?.label}
      updatedAt={updatedAt}
      href="/app/workforce"
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      headerActions={headerLegend}
      minHeight={280}
    >
      <span className="sr-only">
        Active workforce distribution by department: {srSummary}
      </span>

      {allDepartments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
          <p className="text-sm">No workforce records available.</p>
        </div>
      ) : (
        <div className="flex flex-col justify-between h-full p-5 gap-3 select-none font-sans">
          {/* Mobile Fallback Table (below 768px) */}
          <div className="block md:hidden overflow-hidden rounded-md border border-border/50">
            <DataTable
              columns={tableColumns}
              data={displayedDepartments}
              keyField="orgUnitId"
              compact
              hidePagination
            />
          </div>

          {/* Desktop Proportional Stacked Horizontal Bars View */}
          <div className="hidden md:flex flex-col gap-3 w-full">
            {displayedDepartments.map((dept) => {
              const activeCount = dept.active || dept.onshore + dept.offshore || 0;
              const totalBarPercent = Math.min(100, Math.max(8, (activeCount / maxActive) * 100));
              const onshorePercent = activeCount > 0 ? (dept.onshore / activeCount) * 100 : 50;
              const offshorePercent = activeCount > 0 ? (dept.offshore / activeCount) * 100 : 50;

              return (
                <div
                  key={dept.orgUnitId}
                  className="flex flex-col gap-1 w-full group cursor-pointer"
                  onClick={() => router.push(`/app/workforce?department=${dept.orgUnitId}`)}
                >
                  {/* Primary Line: Dept Name & Headcount Breakdown */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-foreground group-hover:text-primary transition-colors truncate">
                      {dept.name}
                    </span>
                    <div className="flex items-center gap-1.5 font-mono text-[11px] tabular-nums shrink-0 ml-2">
                      <span className="font-semibold text-foreground">{activeCount}</span>
                      <span className="text-muted-foreground text-[10px]">
                        ({dept.onshore} on · {dept.offshore} off)
                      </span>
                    </div>
                  </div>

                  {/* Proportional Stacked Bar */}
                  <div
                    style={{ width: `${totalBarPercent}%` }}
                    className="h-2.5 flex items-center bg-muted/40 rounded-[3px] overflow-hidden transition-all duration-300"
                  >
                    {/* Onshore Slice (100% hue) */}
                    <div
                      style={{ width: `${onshorePercent}%` }}
                      className="h-full bg-primary"
                      title={`${dept.name} Onshore: ${dept.onshore}`}
                    />
                    {/* Offshore Slice (40% hue) */}
                    <div
                      style={{
                        width: `${offshorePercent}%`,
                        backgroundColor: "color-mix(in srgb, var(--primary) 40%, transparent)",
                      }}
                      className="h-full"
                      title={`${dept.name} Offshore: ${dept.offshore}`}
                    />
                  </div>

                  {/* Secondary Contextual Line per Row */}
                  <div className="flex items-center text-[10px] text-muted-foreground">
                    <span>
                      {dept.onboarding || 0} onboarding · {dept.endingWithin90Days || 0} ending within 90 days
                    </span>
                  </div>
                </div>
              );
            })}

            {/* +N More indicator */}
            {remainingCount > 0 && (
              <div className="pt-1 text-center">
                <Link
                  href="/app/workforce"
                  className="text-xs font-medium text-primary hover:underline"
                >
                  +{remainingCount} more departments
                </Link>
              </div>
            )}
          </div>

          {/* Bottom Summary Bar */}
          {totals && (
            <div className="pt-2 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
              <span>Total Active Headcount</span>
              <span className="font-mono font-semibold text-foreground tabular-nums">
                {totals.active} ({totals.onshore} onshore · {totals.offshore} offshore)
              </span>
            </div>
          )}
        </div>
      )}
    </WidgetShell>
  );
}
