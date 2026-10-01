"use client";

import React from "react";
import { RequestsByLifecycleStageChart } from "@/components/oms/dashboard/widgets/RequestsByLifecycleStageChart";
import { BudgetExposureChart } from "@/components/oms/dashboard/widgets/BudgetExposureChart";
import { BudgetAllocationByDepartmentChart } from "@/components/oms/dashboard/widgets/BudgetAllocationByDepartmentChart";
import { WorkforceByDepartmentChart } from "@/components/oms/dashboard/widgets/WorkforceByDepartmentChart";
import { BudgetVsActualTrendChart } from "@/components/oms/dashboard/widgets/BudgetVsActualTrendChart";
import { TimeInStageChart } from "@/components/oms/dashboard/widgets/TimeInStageChart";
import { DASHBOARD_WIDGET_FIXTURES } from "@/lib/dashboard/fixtures";

export default function BandBDevPage() {
  const scope = { level: "ORGANIZATION" as const, label: "Organization Wide" };
  const nowIso = new Date().toISOString();

  return (
    <div className="p-8 pb-32 max-w-7xl mx-auto space-y-12">
      <div>
        <h1 className="text-3xl font-display font-bold text-heading">Band B Charts Refinement (E3)</h1>
        <p className="text-muted-foreground mt-2">
          Verifying single-hue categorical scales, constrained 200-260px heights, semantic-only highlights, table fallbacks, and zero direct Recharts imports.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* B1 */}
        <RequestsByLifecycleStageChart
          widgetId="requests-by-lifecycle-stage"
          scope={scope}
          data={DASHBOARD_WIDGET_FIXTURES["requests-by-lifecycle-stage"].data}
          updatedAt={nowIso}
        />

        {/* B2 */}
        <BudgetExposureChart
          widgetId="budget-exposure"
          scope={scope}
          data={DASHBOARD_WIDGET_FIXTURES["budget-exposure"].data}
          updatedAt={nowIso}
        />

        {/* B3 */}
        <BudgetAllocationByDepartmentChart
          widgetId="budget-allocation-by-department"
          scope={scope}
          data={DASHBOARD_WIDGET_FIXTURES["budget-allocation-by-department"].data}
          updatedAt={nowIso}
        />

        {/* B4 */}
        <WorkforceByDepartmentChart
          widgetId="workforce-by-department"
          scope={scope}
          data={DASHBOARD_WIDGET_FIXTURES["workforce-by-department"].data}
          updatedAt={nowIso}
        />

        {/* B5 */}
        <BudgetVsActualTrendChart
          widgetId="budget-vs-actual-trend"
          scope={scope}
          data={DASHBOARD_WIDGET_FIXTURES["budget-vs-actual-trend"].data}
          updatedAt={nowIso}
        />

        {/* B6 */}
        <TimeInStageChart
          widgetId="time-in-stage"
          scope={scope}
          data={DASHBOARD_WIDGET_FIXTURES["time-in-stage"].data}
          updatedAt={nowIso}
        />
      </div>
    </div>
  );
}
