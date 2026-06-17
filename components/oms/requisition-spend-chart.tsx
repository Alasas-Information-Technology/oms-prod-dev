"use client";

import { TrendingUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";

const chartData = [
  { month: "Jan", spend: 1100000 },
  { month: "Feb", spend: 1250000 },
  { month: "Mar", spend: 1050000 },
  { month: "Apr", spend: 1600000 },
  { month: "May", spend: 1450000 },
  { month: "Jun", spend: 2050000 },
  { month: "Jul", spend: 1800000 },
  { month: "Aug", spend: 2450000 },
  { month: "Sep", spend: 2100000 },
  { month: "Oct", spend: 2800000 },
  { month: "Nov", spend: 2250000 },
  { month: "Dec", spend: 1550000 },
];

const chartConfig = {
  spend: { label: "Procurement Spend", color: "var(--chart-1)" },
} satisfies ChartConfig;

export function RequestionSpendChart() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Procurement Spend Trend</CardTitle>
            <CardDescription>Monthly procurement spend across FY 2026</CardDescription>
          </div>

          <div className="flex items-center gap-1 rounded-full border px-3 py-1 text-xs text-muted-foreground">
            <TrendingUp className="h-3.5 w-3.5" />
            FY 2026
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <ChartContainer config={chartConfig} className="h-[320px] w-full">
          <AreaChart data={chartData} margin={{ left: 12, right: 12, top: 10 }}>
            <defs>
              <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-spend)" stopOpacity={0.35} />
                <stop offset="95%" stopColor="var(--color-spend)" stopOpacity={0.03} />
              </linearGradient>
            </defs>

            <CartesianGrid vertical={false} />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => `${Number(value) / 1000000}M`} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />

            <Area dataKey="spend" type="monotone" stroke="var(--color-spend)" strokeWidth={2.5} fill="url(#spendGradient)" dot={false} activeDot={{ r: 5 }} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}