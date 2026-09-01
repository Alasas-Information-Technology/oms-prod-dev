import React from "react";
import { BarChartCard } from "@/src/components/oms/dashboard/charts/BarChartCard";
import { LineChartCard } from "@/src/components/oms/dashboard/charts/LineChartCard";
import { AreaChartCard } from "@/src/components/oms/dashboard/charts/AreaChartCard";
import { Sparkline } from "@/src/components/oms/dashboard/charts/Sparkline";
import { DeltaChip } from "@/src/components/oms/dashboard/DeltaChip";

function generateData(seriesCount: number) {
  const data = [];
  const series = [];
  for (let s = 1; s <= seriesCount; s++) {
    series.push({ key: `series${s}`, name: `Series ${s}` });
  }
  for (let i = 1; i <= 6; i++) {
    const point: any = { category: `Jan 0${i}` };
    for (let s = 1; s <= seriesCount; s++) {
      point[`series${s}`] = Math.floor(Math.random() * 1000) + 100 * (s * 0.5);
    }
    data.push(point);
  }
  return { data, series };
}

export default function ChartTokensDemoPage() {
  const data2 = generateData(2);
  const data5 = generateData(5);
  const data12 = generateData(12);

  return (
    <div className="p-8 pb-32 max-w-7xl mx-auto space-y-16">
      <div>
        <h1 className="text-3xl font-display font-bold text-heading">Chart Tokens Verification</h1>
        <p className="text-muted-foreground mt-2">
          Verify categoricalScale output (1 hue, descending opacity) and primitive constraints.
        </p>
      </div>

      <section className="space-y-6">
        <h2 className="text-xl font-bold border-b pb-2">Delta Chip</h2>
        <div className="flex gap-4 p-6 border rounded-lg bg-card">
          <div className="flex flex-col items-center gap-2">
            <span className="text-sm font-medium">Up (Good)</span>
            <DeltaChip value={12.4} direction="up" increaseIsGood={true} />
          </div>
          <div className="flex flex-col items-center gap-2">
            <span className="text-sm font-medium">Down (Good)</span>
            <DeltaChip value={4.2} direction="down" increaseIsGood={false} />
          </div>
          <div className="flex flex-col items-center gap-2">
            <span className="text-sm font-medium">Up (Bad)</span>
            <DeltaChip value={33.1} direction="up" increaseIsGood={false} />
          </div>
          <div className="flex flex-col items-center gap-2">
            <span className="text-sm font-medium">Down (Bad)</span>
            <DeltaChip value={8.5} direction="down" increaseIsGood={true} />
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-xl font-bold border-b pb-2">2 Categories (Bar)</h2>
        <p className="text-sm text-muted-foreground">Direct labels applied automatically (since &lt;= 3 series).</p>
        <div className="p-6 border rounded-lg bg-card">
          <BarChartCard
            data={data2.data}
            series={data2.series}
            xAxisKey="category"
            accessibilitySummary="Bar chart showing 2 categories"
          />
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-xl font-bold border-b pb-2">5 Categories (Area)</h2>
        <div className="p-6 border rounded-lg bg-card">
          <AreaChartCard
            data={data5.data}
            series={data5.series}
            xAxisKey="category"
            accessibilitySummary="Area chart showing 5 categories"
          />
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-xl font-bold border-b pb-2">12 Categories (Bar Stacked Test)</h2>
        <p className="text-sm text-muted-foreground">
          Must be ONE hue at twelve opacities, not 12 random colors.
        </p>
        <div className="p-6 border rounded-lg bg-card">
          <BarChartCard
            data={data12.data}
            series={data12.series}
            xAxisKey="category"
            accessibilitySummary="Bar chart showing 12 categories to verify scale"
          />
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-xl font-bold border-b pb-2">Line Chart (Step)</h2>
        <p className="text-sm text-muted-foreground">Discrete data gets step or linear lines. Monotone smoothing is explicitly prohibited.</p>
        <div className="p-6 border rounded-lg bg-card">
          <LineChartCard
            data={data2.data}
            series={data2.series}
            xAxisKey="category"
            accessibilitySummary="Line chart showing 2 categories"
            type="step"
          />
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-xl font-bold border-b pb-2">Sparkline</h2>
        <div className="p-6 border rounded-lg bg-card max-w-xs flex flex-col gap-2">
          <span className="text-2xl font-bold tabular-nums">42.5k</span>
          <Sparkline
            data={data2.data}
            dataKey="series1"
            accessibilitySummary="Sparkline indicator"
          />
        </div>
      </section>
    </div>
  );
}
