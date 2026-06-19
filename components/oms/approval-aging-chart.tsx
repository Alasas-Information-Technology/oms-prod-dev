"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartData = [
  { range: "0-2 Days", requests: 5 },
  { range: "3-5 Days", requests: 3 },
  { range: "6-10 Days", requests: 2 },
  { range: "10+ Days", requests: 1 },
];

const chartConfig = {
  requests: {
    label: "Requests",
    color: "hsl(var(--chart-1))",
  },
};

export function ApprovalAgingChart() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Approval Aging</CardTitle>
        <CardDescription>
          Pending requisitions grouped by waiting time
        </CardDescription>
      </CardHeader>

      <CardContent>
        <ChartContainer config={chartConfig} className="h-[320px] w-full">
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid horizontal={false} />
            <YAxis
              dataKey="range"
              type="category"
              tickLine={false}
              axisLine={false}
              width={80}
            />
            <XAxis
              type="number"
              tickLine={false}
              axisLine={false}
            />

            <ChartTooltip
              content={<ChartTooltipContent />}
            />

            <Bar
              dataKey="requests"
              radius={6}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}