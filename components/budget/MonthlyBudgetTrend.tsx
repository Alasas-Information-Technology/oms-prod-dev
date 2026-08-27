"use client";

import { TrendingUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
  { month: "January", allocation: 320000, commitments: 140000, supplements: 10000 },
  { month: "February", allocation: 480000, commitments: 860000, supplements: 45000 },
  { month: "March", allocation: 410000, commitments: 210000, supplements: 20000 },
  { month: "April", allocation: 720000, commitments: 520000, supplements: 80000 },
  { month: "May", allocation: 580000, commitments: 340000, supplements: 35000 },
  { month: "June", allocation: 620000, commitments: 390000, supplements: 490000 },
];

const chartConfig = {
  allocation: {
    label: "Allocation",
    color: "var(--primary)",
  },
  commitments: {
    label: "Commitments",
    color: "var(--chart-2)",
  },
  supplements: {
    label: "Supplements",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;

export function MonthlyBudgetTrend() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Monthly Budget Trend</CardTitle>
        <CardDescription>
          Allocation, commitments, and supplements over time
        </CardDescription>
      </CardHeader>

      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Area
              dataKey="supplements"
              type="natural"
              fill="var(--chart-3)"
              fillOpacity={0.25}
              stroke="var(--chart-3)"
              stackId="a"
            />
            <Area
              dataKey="commitments"
              type="natural"
              fill="var(--chart-2)"
              fillOpacity={0.35}
              stroke="var(--chart-2)"
              stackId="a"
            />
            <Area
              dataKey="allocation"
              type="natural"
              fill="var(--primary)"
              fillOpacity={0.45}
              stroke="var(--primary)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>

      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 font-medium leading-none">
              Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2 leading-none text-muted-foreground">
              January - June 2024
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
