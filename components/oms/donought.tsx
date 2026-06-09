"use client";

import { Pie, PieChart } from "recharts";

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
  type ChartConfig,
} from "@/components/ui/chart";

const chartData = [
  {
    name: "Allocated",
    value: 750000,
    fill: "#2ec4b6",
  },
  {
    name: "Committed",
    value: 650000,
    fill: "#2997c8",
  },
  {
    name: "Available",
    value: 350000,
    fill: "#7ccbc7",
  },
];

const chartConfig = {
  value: {
    label: "Budget",
  },
  allocated: {
    label: "Allocated",
    color: "var(--chart-1)",
  },
  committed: {
    label: "Committed",
    color: "var(--chart-2)",
  },
  available: {
    label: "Available",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;

export function BudgetDistributionChart() {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Budget Distribution</CardTitle>
        <CardDescription>
          Allocated, committed, and available budget
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 pb-4">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[280px] [&_.recharts-pie-label-text]:fill-foreground"
        >
          <PieChart>
            <ChartTooltip
              content={<ChartTooltipContent hideLabel />}
            />

            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              label
            />


          </PieChart>
        </ChartContainer>
        <div className="mt-4 flex justify-center gap-8">
          {chartData.map((item) => (
            <div
              key={item.name}
              className="flex items-center gap-2 text-sm font-medium"
            >
              <span
                className="h-3 w-3 rounded-full border"
                style={{ backgroundColor: item.fill }}
              />
              <span>{item.name}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}


