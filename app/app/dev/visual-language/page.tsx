"use client";

import React from "react";
import { Amount } from "@/components/budget/Amount";
import { SimpleKpiCard } from "@/components/budget";
import { SegmentedBar } from "@/components/oms/dashboard/SegmentedBar";
import { DistributionBar } from "@/components/oms/dashboard/DistributionBar";
import { DashboardListRow } from "@/components/oms/dashboard/DashboardListRow";
import { AreaChartCard } from "@/components/oms/dashboard/charts/AreaChartCard";
import { LineChartCard } from "@/components/oms/dashboard/charts/LineChartCard";
import { ClockAlert, Building2, FileCheck2, UserCheck } from "lucide-react";

export default function VisualLanguageDevPage() {
  const trendData = [
    { month: "Jan", planned: 450, actual: 420 },
    { month: "Feb", planned: 520, actual: 560 },
    { month: "Mar", planned: 490, actual: 480 },
    { month: "Apr", planned: 610, actual: 640 },
    { month: "May", planned: 580, actual: 570 },
    { month: "Jun", planned: 650, actual: 690 },
  ];

  const distributionSegments = [
    {
      label: "Reserved",
      value: 540000000,
      formatted: <Amount value={540000000} abbreviate variant="inline" />,
      percent: 21.8,
    },
    {
      label: "Locked",
      value: 710000000,
      formatted: <Amount value={710000000} abbreviate variant="inline" />,
      percent: 28.6,
    },
    {
      label: "Consumed",
      value: 210000000,
      formatted: <Amount value={210000000} abbreviate variant="inline" />,
      percent: 8.5,
    },
    {
      label: "Available",
      value: 1020000000,
      formatted: <Amount value={1020000000} abbreviate variant="inline" />,
      percent: 41.1,
      isResidual: true,
    },
  ];

  return (
    <div className="p-8 pb-32 max-w-6xl mx-auto space-y-12">
      <div>
        <h1 className="text-3xl font-display font-bold text-heading">
          Dashboard Visual Language & Primitives (F1 - F4)
        </h1>
        <p className="text-muted-foreground mt-2">
          Demonstrating uniform SimpleKpiCards (from Security Dashboard), T9 floating pill table rows, Numeral weight contrast (T2), Hatched fills (T4), Segmented progress (T5), Distribution bar (T6), and 130px short chart plots (T3).
        </p>
      </div>

      {/* 1. UNIFORM SECURITY DASHBOARD KPI CARDS */}
      <section className="space-y-4">
        <div className="border-b border-border/60 pb-2">
          <h2 className="text-xl font-bold">1. Uniform KPI Cards (Security Dashboard Standard)</h2>
          <p className="text-xs text-muted-foreground">
            Using the exact SimpleKpiCard component used in the Security Dashboard across all metrics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <SimpleKpiCard
            title="Active Sessions"
            value={1}
            icon="mdi:shield-account"
            description="Currently active"
            color="text-blue-600"
            bg="bg-blue-100 dark:bg-blue-900/30"
            href="/app/administration/security-dashboard"
          />
          <SimpleKpiCard
            title="Needs My Action"
            value={4}
            icon="mdi:inbox-arrow-down"
            description="2 overdue"
            color="text-indigo-600"
            bg="bg-indigo-100 dark:bg-indigo-900/30"
            href="/app/requests?tab=needs-my-action"
          />
          <SimpleKpiCard
            title="Failed Logins"
            value={0}
            icon="mdi:alert-circle-outline"
            description="Last 24 hours"
            color="text-red-600"
            bg="bg-red-100 dark:bg-red-900/30"
            href="/app/administration/security-dashboard"
          />
          <SimpleKpiCard
            title="Locked Accounts"
            value={0}
            icon="mdi:lock-outline"
            description="Requires admin unlock"
            color="text-orange-600"
            bg="bg-orange-100 dark:bg-orange-900/30"
            href="/app/administration/security-dashboard"
          />
        </div>
      </section>

      {/* 2. T9: TABLE & LIST ROWS (FLOATING INSET PILL HIGHLIGHTS) */}
      <section className="space-y-4">
        <div className="border-b border-border/60 pb-2">
          <h2 className="text-xl font-bold">2. Table & List Rows (T9)</h2>
          <p className="text-xs text-muted-foreground">
            44px row height, hover state is an inset rounded pill (not full-bleed), zero divider lines, 20px icon inside 28px square at 8% tint, right-aligned tabular amounts.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-border/60 bg-card space-y-1">
          <DashboardListRow
            icon={ClockAlert}
            iconBg="bg-rose-500/10"
            iconColor="text-rose-600 dark:text-rose-400"
            title="Senior Frontend Engineer Position (REQ-2026-089)"
            subtitle="Engineering · In Approval"
            center={
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-muted-foreground">Utilisation:</span>
                <SegmentedBar value={84} color="var(--warning)" />
              </div>
            }
            trailing={<Amount value={45000000} variant="table" />}
            trailingSubtitle={<span className="text-rose-600 dark:text-rose-400 font-semibold">+3d overdue</span>}
            href="/app/requests"
          />

          <DashboardListRow
            icon={Building2}
            iconBg="bg-blue-500/10"
            iconColor="text-blue-600 dark:text-blue-400"
            title="Wipro Middle East Engagement Runway"
            subtitle="IT Services · 14 Active Resources"
            center={
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-muted-foreground">Compliance:</span>
                <SegmentedBar value={92} color="var(--primary)" />
              </div>
            }
            trailing={<Amount value={128000000} variant="table" />}
            trailingSubtitle="4 ending <90d"
            href="/app/workforce"
          />

          <DashboardListRow
            icon={FileCheck2}
            iconBg="bg-emerald-500/10"
            iconColor="text-emerald-600 dark:text-emerald-400"
            title="Cloud Infrastructure Annual Renewal (REQ-2026-042)"
            subtitle="DevOps · Completed"
            trailing={<Amount value={240000000} variant="table" />}
            trailingSubtitle="Approved yesterday"
            href="/app/requests"
          />

          <DashboardListRow
            icon={UserCheck}
            iconBg="bg-purple-500/10"
            iconColor="text-purple-600 dark:text-purple-400"
            title="HR Salary Exception Review"
            subtitle="Operations · 2 Pending Candidates"
            trailing="2 cases"
            trailingSubtitle="Action required"
            href="/app/requests"
          />
        </div>
      </section>

      {/* 3. T2: NUMERAL WEIGHT CONTRAST */}
      <section className="space-y-4">
        <div className="border-b border-border/60 pb-2">
          <h2 className="text-xl font-bold">3. Numeral Weight Contrast (T2)</h2>
          <p className="text-xs text-muted-foreground">
            Currency 12px muted, Integer 30px/600 bold foreground, Decimal/Suffix 30px/400 muted. Eye reads magnitude first.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 rounded-xl border border-border/60 bg-card">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium text-muted-foreground">Exact Display Amount</span>
            <Amount value={124832000} variant="display" />
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium text-muted-foreground">Abbreviated Millions</span>
            <Amount value={2480000000} abbreviate variant="display" />
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium text-muted-foreground">Negative Display Amount</span>
            <Amount value={-45000000} abbreviate variant="display" />
          </div>
        </div>
      </section>

      {/* 4. T5: SEGMENTED PROGRESS BARS */}
      <section className="space-y-4">
        <div className="border-b border-border/60 pb-2">
          <h2 className="text-xl font-bold">4. Segmented Progress Gauge (T5)</h2>
          <p className="text-xs text-muted-foreground">
            20 discrete ticks (2px x 12px, 1px radius, 2px gap) with percentage in parentheses to the left.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 rounded-xl border border-border/60 bg-card">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium text-muted-foreground">72% Progress</span>
            <SegmentedBar value={72} />
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium text-muted-foreground">95% Critical</span>
            <SegmentedBar value={95} color="var(--destructive)" />
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium text-muted-foreground">30% Starting</span>
            <SegmentedBar value={30} color="var(--warning)" />
          </div>
        </div>
      </section>

      {/* 5. T6: DISTRIBUTION BAR */}
      <section className="space-y-4">
        <div className="border-b border-border/60 pb-2">
          <h2 className="text-xl font-bold">5. Distribution Single Stacked Bar (T6)</h2>
          <p className="text-xs text-muted-foreground">
            Labels/values above with 1px dividers, 28px bar with 6px outer radii, descending one-hue opacities, 45° hatched residual segment, and aligned percentages below.
          </p>
        </div>

        <div className="p-6 rounded-xl border border-border/60 bg-card">
          <DistributionBar segments={distributionSegments} />
        </div>
      </section>

      {/* 6. T3, T4, T7, T8, T11: SHORT CHARTS (130px PLOT AREA) */}
      <section className="space-y-4">
        <div className="border-b border-border/60 pb-2">
          <h2 className="text-xl font-bold">6. Refined Short Charts (T3, T4, T7, T8, T11)</h2>
          <p className="text-xs text-muted-foreground">
            Plot height 130px, 45° diagonal hatched area fills (T4), 1.5px lines, no dots except hover, 4% horizontal gridlines, max 4 Y-ticks, and inline header legends.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Hatched Area Chart */}
          <div className="p-5 rounded-xl border border-border/60 bg-card space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">Hatched Area Trend (T4)</span>
            </div>
            <AreaChartCard
              data={trendData}
              series={[
                { key: "planned", name: "Planned" },
                { key: "actual", name: "Actual" },
              ]}
              xAxisKey="month"
              accessibilitySummary="Hatched area trend comparison"
            />
          </div>

          {/* Step Line Chart */}
          <div className="p-5 rounded-xl border border-border/60 bg-card space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">Discrete Step Line (T3, T8)</span>
            </div>
            <LineChartCard
              data={trendData}
              type="step"
              series={[
                { key: "planned", name: "Planned" },
                { key: "actual", name: "Actual" },
              ]}
              xAxisKey="month"
              accessibilitySummary="Discrete step line comparison"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
