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
    fill: "var(--color-allocated)",
  },
  {
    name: "Committed",
    value: 650000,
    fill: "var(--color-committed)",
  },
  {
    name: "Available",
    value: 350000,
    fill: "var(--color-available)",
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
        <div className="mt-4 flex flex-wrap justify-center gap-4">
          {chartData.map((item) => (
            <div key={item.name} className="flex items-center gap-2 text-sm">
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: item.fill }}
              />
              <span>{item.name}</span>
              <span className="font-medium">AED {item.value.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}


