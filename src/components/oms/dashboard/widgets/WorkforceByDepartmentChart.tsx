"use client";

import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import { WidgetShell } from "../WidgetShell";
import { WidgetProps } from "@/src/lib/dashboard/registry";
import { WorkforceByDepartmentData } from "@/src/types/dashboard";
import { BarChartCard } from "../charts/BarChartCard";
import { categoricalScale } from "@/src/lib/dashboard/chart-tokens";

export function WorkforceByDepartmentChart({
  scope,
  data,
  isLoading,
  error,
  onRetry,
  updatedAt,
}: WidgetProps<WorkforceByDepartmentData>) {
  const router = useRouter();
  const departments = useMemo(() => data?.departments || [], [data]);

  // Two opacities of ONE hue for Onshore vs Offshore
  const twoOpacities = useMemo(() => categoricalScale(2), []);

  const chartData = useMemo(() => {
    return departments.slice(0, 8).map((d) => ({
      name: d.name,
      onshore: d.onshore,
      offshore: d.offshore,
      orgUnitId: d.orgUnitId,
    }));
  }, [departments]);

  const handleBarClick = (entry: any) => {
    if (entry?.orgUnitId) {
      router.push(`/app/workforce?department=${entry.orgUnitId}`);
    }
  };

  const srSummary = departments
    .map(
      (d) =>
        `${d.name}: ${d.active} active (${d.onshore} onshore, ${d.offshore} offshore)`
    )
    .join("; ");

  return (
    <WidgetShell
      title="Workforce by department"
      scopeLabel={scope?.label}
      updatedAt={updatedAt}
      href="/app/workforce"
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      minHeight={215}
    >
      <span className="sr-only">
        Active workforce distribution by department: {srSummary}
      </span>

      {departments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
          <p className="text-sm">No workforce records available.</p>
        </div>
      ) : (
        <div className="flex flex-col justify-between flex-1">
          <BarChartCard
            data={chartData.slice(0, 6)}
            series={[
              {
                key: "onshore",
                name: "Onshore",
                color: twoOpacities[0], // 100% opacity
              },
              {
                key: "offshore",
                name: "Offshore",
                color: twoOpacities[1], // 75% opacity of same hue
              },
            ]}
            xAxisKey="name"
            layout="horizontal"
            height={130}
            hideLegend={false}
            onBarClick={handleBarClick}
            accessibilitySummary="Grouped bar chart showing onshore and offshore workforce distribution across departments"
          />
        </div>
      )}
    </WidgetShell>
  );
}
