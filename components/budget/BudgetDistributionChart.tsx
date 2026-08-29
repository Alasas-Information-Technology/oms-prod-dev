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
          Budget allocation, commitment, and available funds overview
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[300px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius={70}
              strokeWidth={5}
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
