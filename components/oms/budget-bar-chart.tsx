"use client";

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

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
  { department: "IT", allocated: 1000000, committed: 650000 },
  { department: "Operations", allocated: 2000000, committed: 1200000 },
  { department: "HR", allocated: 500000, committed: 300000 },
  { department: "Finance", allocated: 700000, committed: 420000 },
  { department: "Procurement", allocated: 800000, committed: 510000 },
  { department: "Legal", allocated: 450000, committed: 250000 },
  { department: "Admin", allocated: 600000, committed: 380000 },
  { department: "Facilities", allocated: 900000, committed: 700000 },
  { department: "Security", allocated: 750000, committed: 500000 },
  { department: "Customer Care", allocated: 650000, committed: 390000 },
  { department: "Marketing", allocated: 400000, committed: 220000 },
  { department: "Sales", allocated: 850000, committed: 560000 },
  { department: "Compliance", allocated: 550000, committed: 310000 },
  { department: "Training", allocated: 300000, committed: 150000 },
  { department: "Logistics", allocated: 720000, committed: 460000 },
  { department: "Engineering", allocated: 1100000, committed: 780000 },
  { department: "Support", allocated: 480000, committed: 260000 },
  { department: "Quality", allocated: 350000, committed: 190000 },
  { department: "Strategy", allocated: 680000, committed: 410000 },
  { department: "Risk", allocated: 530000, committed: 330000 },
  { department: "Aarush", allocated: 1000000, committed: 700000}
];

const topTenDepartments = [...chartData]
  .sort((a, b) => b.allocated - a.allocated)
  .slice(0, 10);

const chartConfig = {
    allocated: {
        label: "Allocated",
        color: "#14b8a6",
    },
    committed: {
        label: "Committed",
        color: "#3b82f6",
    },
} satisfies ChartConfig;

export function DepartmentBudgetBarChart() {
    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Department Budget Comparison</CardTitle>

            </CardHeader>

            <CardContent>
                <ChartContainer config={chartConfig} className="h-[178px] w-full">
                    <BarChart data={topTenDepartments}>
                        <CartesianGrid vertical={false} />

                        <XAxis
                            dataKey="department"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                        />

                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent indicator="dashed" />}
                        />

                        <Bar dataKey="allocated" fill="#14b8a6" radius={4} />
                        <Bar dataKey="committed" fill="#3b82f6" radius={4} />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}