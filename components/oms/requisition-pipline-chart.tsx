"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const chartData = [
  { month: "Jan", created: 12, approved: 8 },
  { month: "Feb", created: 15, approved: 10 },
  { month: "Mar", created: 18, approved: 14 },
  { month: "Apr", created: 11, approved: 9 },
  { month: "May", created: 20, approved: 16 },
  { month: "Jun", created: 17, approved: 12 },
  { month: "Jul", created: 22, approved: 18 },
  { month: "Aug", created: 14, approved: 11 },
  { month: "Sep", created: 19, approved: 15 },
  { month: "Oct", created: 25, approved: 20 },
  { month: "Nov", created: 21, approved: 17 },
  { month: "Dec", created: 16, approved: 13 },
];

const chartConfig = {
  created: { label: "Created Requests", color: "hsl(var(--chart-1))" },
  approved: { label: "Approved Requests", color: "hsl(var(--chart-2))" },
};

export function RequisitionPipelineChart() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Requisition Pipeline</CardTitle>
        <CardDescription>Monthly requisition activity</CardDescription>
      </CardHeader>

      <CardContent>
        <ChartContainer config={chartConfig} className="h-[260px] w-full">
          <BarChart data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="month" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} />
    <ChartTooltip content={<ChartTooltipContent />} />
<Bar dataKey="created" radius={4} fill="#14b8a6" />
<Bar dataKey="approved" radius={4} fill="#6366f1" />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}