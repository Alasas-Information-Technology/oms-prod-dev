"use client";

import { CartesianGrid, Line, LineChart, XAxis } from "recharts";

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
    { month: "Jan", fy2022: 250000, fy2023: 320000, fy2024: 380000, fy2025: 420000, fy2026: 500000 },
    { month: "Feb", fy2022: 390000, fy2023: 340000, fy2024: 410000, fy2025: 450000, fy2026: 550000 },
    { month: "Mar", fy2022: 300000, fy2023: 370000, fy2024: 450000, fy2025: 500000, fy2026: 620000 },
    { month: "Apr", fy2022: 340000, fy2023: 400000, fy2024: 500000, fy2025: 560000, fy2026: 700000 },
    { month: "May", fy2022: 390000, fy2023: 680000, fy2024: 1000000, fy2025: 630000, fy2026: 780000 },
    { month: "Jun", fy2022: 420000, fy2023: 500000, fy2024: 620000, fy2025: 710000, fy2026: 850000 },
    { month: "Jul", fy2022: 450000, fy2023: 340000, fy2024: 680000, fy2025: 450000, fy2026: 920000 },
    { month: "Aug", fy2022: 680000, fy2023: 740000, fy2024: 450000, fy2025: 840000, fy2026: 980000 },
    { month: "Sep", fy2022: 520000, fy2023: 620000, fy2024: 790000, fy2025: 900000, fy2026: 1050000 },
    { month: "Oct", fy2022: 560000, fy2023: 680000, fy2024: 850000, fy2025: 450000, fy2026: 1120000 },
    { month: "Nov", fy2022: 610000, fy2023: 620000, fy2024: 910000, fy2025: 780000, fy2026: 1190000 },
    { month: "Dec", fy2022: 520000, fy2023: 820000, fy2024: 910000, fy2025: 780000, fy2026: 1300000 },
];

const chartConfig = {
    fy2022: {
        label: "FY2022",
        color: "#ef4444",
    },
    fy2023: {
        label: "FY2023",
        color: "#f97316",
    },
    fy2024: {
        label: "FY2024",
        color: "#eab308",
    },
    fy2025: {
        label: "FY2025",
        color: "#22c55e",
    },
    fy2026: {
        label: "FY2026",
        color: "#3b82f6",
    },
} satisfies ChartConfig;

export function AnnualBudgetTrend() {
    return (
        <Card className="h-full ml-4">
            <CardHeader>
                <CardTitle>Annual Budget Trend</CardTitle>
                <CardDescription>
                    Monthly budget utilization across the last 5 financial years
                </CardDescription>
            </CardHeader>

            <CardContent>
                <ChartContainer config={chartConfig} className="h-[155px] w-full">
                    <LineChart accessibilityLayer data={chartData} margin={{left: 12, right: 12,}}>
                        <CartesianGrid vertical={false} />
                        <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8}/>

                        <ChartTooltip content={<ChartTooltipContent />} />

                        <div className="mt-4 flex flex-wrap justify-center gap-6 text-sm">
                            <div className="flex items-center gap-2">
                                <span className="h-3 w-3 rounded-full bg-red-500" />
                                FY2022:
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="h-3 w-3 rounded-full bg-orange-500" />
                                FY2023:
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="h-3 w-3 rounded-full bg-yellow-500" />
                                FY2024:
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="h-3 w-3 rounded-full bg-green-500" />
                                FY2025:
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="h-3 w-3 rounded-full bg-blue-500" />
                                FY2026:
                            </div>
                        </div>
                        <Line dataKey="fy2022" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 6 }} />
                        <Line dataKey="fy2023" stroke="#f97316" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 6 }} />
                        <Line dataKey="fy2024" stroke="#B519AE" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 6 }} />
                        <Line dataKey="fy2025" stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 6 }} />
                        <Line dataKey="fy2026" stroke="#EB3324" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 6 }} />
                    </LineChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}