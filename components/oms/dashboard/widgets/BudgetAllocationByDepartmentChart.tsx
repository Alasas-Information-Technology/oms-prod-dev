"use client";

import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { WidgetShell } from "../WidgetShell";
import { WidgetProps } from "@/lib/dashboard/registry";
import { BudgetAllocationByDepartmentData, DepartmentBudgetAllocationItem } from "@/types/dashboard";
import { formatAbbreviated } from "@/lib/money";
import { BarChartCard } from "../charts/BarChartCard";
import { semanticColors, categoricalScale } from "@/lib/dashboard/chart-tokens";

export function BudgetAllocationByDepartmentChart({
  scope,
  data,
  isLoading,
  error,
  onRetry,
  updatedAt,
}: WidgetProps<BudgetAllocationByDepartmentData>) {
  const router = useRouter();

  // Pre-sorted by utilisation descending as mandated by requirement
  const sortedDepts = useMemo(() => {
    if (!data?.departments) return [];
    return [...data.departments].sort((a, b) => b.utilisationPercent - a.utilisationPercent);
  }, [data]);

  // Maximum 8 departments; beyond that show top 8 + "+N more"
  const top8 = useMemo(() => sortedDepts.slice(0, 8), [sortedDepts]);
  const remainingCount = sortedDepts.length - 8;

  // Single hue descending scale for ranks
  const rankScale = useMemo(() => categoricalScale(top8.length || 8), [top8.length]);

  const chartData = useMemo(() => {
    return top8.map((dept, idx) => ({
      name: dept.name,
      utilisation: dept.utilisationPercent,
      consumed: dept.consumed,
      allocated: dept.allocated,
      orgUnitId: dept.orgUnitId,
      rankColor: rankScale[idx],
    }));
  }, [top8, rankScale]);

  // Only semantic colours allowed: amber > 80%, red > 95%, otherwise rank opacity of primary
  const getBarColor = (entry: any) => {
    if (entry.utilisation >= 95) return semanticColors.failure;
    if (entry.utilisation >= 80) return semanticColors.warning;
    return entry.rankColor || "var(--primary)";
  };

  const handleRowClick = (entry: any) => {
    if (entry?.orgUnitId) {
      router.push(`/app/budget?department=${entry.orgUnitId}`);
    }
  };

  const srSummary = sortedDepts
    .map(
      (d) =>
        `${d.name}: ${d.utilisationPercent}% utilized (${formatAbbreviated(d.consumed)} of ${formatAbbreviated(d.allocated)})`
    )
    .join("; ");

  return (
    <WidgetShell
      title="Budget allocation by department"
      scopeLabel={scope?.label}
      updatedAt={updatedAt}
      href="/app/budget"
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      minHeight={215}
      headerActions={
        remainingCount > 0 ? (
          <Link
            href="/app/budget"
            className="text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            +{remainingCount} more
          </Link>
        ) : undefined
      }
    >
      <span className="sr-only">
        Department budget allocation sorted by utilisation: {srSummary}
      </span>

      {sortedDepts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
          <p className="text-sm">No department budget allocations recorded.</p>
        </div>
      ) : (
        <div className="flex flex-col flex-1 h-full min-h-0 w-full pt-1 pb-2">
          <BarChartCard
            data={chartData.slice(0, 5)}
            series={[
              {
                key: "utilisation",
                name: "Utilisation %",
              },
            ]}
            xAxisKey="name"
            layout="vertical"
            height="100%"
            className="flex-1 h-full min-h-0"
            hideLegend
            xAxisFormatter={(val) => `${val}%`}
            getCellColor={(entry) => getBarColor(entry)}
            onBarClick={handleRowClick}
            accessibilitySummary="Horizontal bar chart showing department budget utilisation sorted descending"
          />
        </div>
      )}
    </WidgetShell>
  );
}
