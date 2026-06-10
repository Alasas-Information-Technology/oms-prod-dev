"use client";

import { TrendingUp } from "lucide-react";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const chartData = [
  { year: "2022", requested: 400000 },
  { year: "2023", requested: 650000 },
  { year: "2024", requested: 900000 },
  { year: "2025", requested: 1100000 },
  { year: "2026", requested: 1400000 },
];

const chartConfig = {
  requested: { label: "Requested Amount", color: "var(--chart-1)" },
} satisfies ChartConfig;

export function BudgetSupplementTrend() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Supplement Requests Trend</CardTitle>
        <CardDescription>FY 2022 - FY 2026</CardDescription>
      </CardHeader>

      <CardContent>
        <ChartContainer config={chartConfig} className="h-[240px] w-full">
          <LineChart accessibilityLayer data={chartData} margin={{ left: 12, right: 12 }}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="year" tickLine={false} axisLine={false} tickMargin={8} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Line dataKey="requested" type="linear" stroke="var(--color-requested)" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ChartContainer>
      </CardContent>

      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          Supplement requests increased over the last five years <TrendingUp className="h-4 w-4" />
        </div>

        <div className="leading-none text-muted-foreground">
          Showing total requested supplement amounts from FY 2022 to FY 2026
        </div>
      </CardFooter>
    </Card>
  );
}