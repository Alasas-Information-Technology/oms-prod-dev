"use client";

import React from "react";
import { DistributionRing } from "@/components/oms/dashboard/DistributionRing";
import { Heatmap } from "@/components/oms/dashboard/Heatmap";
import { Gauge } from "@/components/oms/dashboard/Gauge";
import { Waffle } from "@/components/oms/dashboard/Waffle";
import { ColumnChart } from "@/components/oms/dashboard/ColumnChart";
import { DistributionBar } from "@/components/oms/dashboard/DistributionBar";

const mockSegmentsRing = [
  { label: "Approved", value: 120, percent: 50 },
  { label: "Pending", value: 60, percent: 25 },
  { label: "Rejected", value: 36, percent: 15 },
  { label: "Drafts", value: 24, percent: 10, isResidual: true },
];

const mockSegmentsFails = [
  { label: "Approved", value: 120, percent: 66.6 },
  { label: "Rejected", value: 60, percent: 33.3 },
];

const mockHeatmapRows = [
  { id: "r1", label: "System A" },
  { id: "r2", label: "System B" },
  { id: "r3", label: "System C" },
];
const mockHeatmapCols = [
  { id: "c1", label: "Mon" },
  { id: "c2", label: "Tue" },
  { id: "c3", label: "Wed" },
  { id: "c4", label: "Thu" },
  { id: "c5", label: "Fri" },
];

const mockHeatmapData = [
  { rowId: "r1", colId: "c1", value: 10 },
  { rowId: "r1", colId: "c2", value: 45 },
  { rowId: "r1", colId: "c3", value: 90 },
  { rowId: "r1", colId: "c4", value: 20 },
  { rowId: "r1", colId: "c5", value: 5 },
  
  { rowId: "r2", colId: "c1", value: -10 },
  { rowId: "r2", colId: "c2", value: -45 },
  { rowId: "r2", colId: "c3", value: -90 },
  { rowId: "r2", colId: "c4", value: 20 },
  { rowId: "r2", colId: "c5", value: 60 },
  
  { rowId: "r3", colId: "c1", value: 100 },
  { rowId: "r3", colId: "c2", value: 0 },
  { rowId: "r3", colId: "c3", value: 50 },
  { rowId: "r3", colId: "c4", value: -50 },
  { rowId: "r3", colId: "c5", value: -100 },
];

const mockColumnData = [
  { category: "HR", allocated: 500, consumed: 450 },
  { category: "IT", allocated: 1200, consumed: 900 },
  { category: "Ops", allocated: 800, consumed: 800 },
  { category: "Sales", allocated: 300, consumed: 100 },
  { category: "Mktg", allocated: 600, consumed: 550 },
];

export default function DashboardDemoPage() {
  return (
    <div className="p-8 flex flex-col gap-12 max-w-5xl mx-auto pb-24">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Primitives (L2)</h1>
        <p className="text-muted-foreground">Demo page to verify L2 chart primitives.</p>
      </div>

      <section className="flex flex-col gap-6">
        <h2 className="text-xl font-semibold border-b pb-2">DistributionRing (M1)</h2>
        <div className="grid grid-cols-2 gap-8">
          <div className="p-6 border rounded-lg bg-card">
            <h3 className="text-sm font-medium mb-4">Valid (4 segments)</h3>
            <DistributionRing segments={mockSegmentsRing} totalLabel="Requests" />
          </div>
          <div className="p-6 border rounded-lg bg-card">
            <h3 className="text-sm font-medium mb-4">Invalid (2 segments) -{">"} Falls back to Bar</h3>
            <DistributionRing segments={mockSegmentsFails} totalLabel="Requests" />
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-xl font-semibold border-b pb-2">Heatmap (M2)</h2>
        <div className="grid grid-cols-2 gap-8">
          <div className="p-6 border rounded-lg bg-card">
            <h3 className="text-sm font-medium mb-4">Default (Single Hue)</h3>
            <Heatmap 
              rows={mockHeatmapRows} 
              cols={mockHeatmapCols} 
              valueAccessor={(r, c) => {
                const cell = mockHeatmapData.find(d => d.rowId === r.id && d.colId === c.id);
                return cell ? Math.abs(cell.value) : null;
              }}
            />
          </div>
          <div className="p-6 border rounded-lg bg-card">
            <h3 className="text-sm font-medium mb-4">Diverging (Danger/Success)</h3>
            <Heatmap 
              rows={mockHeatmapRows} 
              cols={mockHeatmapCols} 
              valueAccessor={(r, c) => {
                const cell = mockHeatmapData.find(d => d.rowId === r.id && d.colId === c.id);
                return cell ? cell.value : null;
              }}
              diverging 
            />
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-xl font-semibold border-b pb-2">Gauge (M6)</h2>
        <div className="grid grid-cols-3 gap-8">
          <div className="p-6 border rounded-lg bg-card flex justify-center">
            <Gauge value={45} max={100} threshold={80} label="Usage" />
          </div>
          <div className="p-6 border rounded-lg bg-card flex justify-center">
            <Gauge value={85} max={100} threshold={80} thresholdCrossed thresholdSemantic="danger" label="Danger" />
          </div>
          <div className="p-6 border rounded-lg bg-card flex justify-center">
            <Gauge value={95} max={100} threshold={90} thresholdCrossed thresholdSemantic="success" label="Success" />
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-xl font-semibold border-b pb-2">Waffle (M7)</h2>
        <div className="grid grid-cols-2 gap-8">
          <div className="p-6 border rounded-lg bg-card flex justify-center">
            <Waffle percent={14.1} label="Compliance" />
          </div>
          <div className="p-6 border rounded-lg bg-card flex justify-center">
            <Waffle percent={87} label="Quota Fill" />
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-xl font-semibold border-b pb-2">Column Chart (M4)</h2>
        <div className="p-6 border rounded-lg bg-card h-[300px]">
          <ColumnChart
            data={mockColumnData}
            xAxisKey="category"
            series={[
              { key: "allocated", name: "Allocated", color: "var(--primary)" },
              { key: "consumed", name: "Consumed", color: "var(--accent)" }
            ]}
            accessibilitySummary="Budget allocation column chart"
            height={200}
          />
        </div>
      </section>
    </div>
  );
}
