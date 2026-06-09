"use client"

import { TrendingUp } from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

const chartData = [
  { month: "January", allocation: 320000, commitments: 140000, supplements: 10000 },
  { month: "February", allocation: 480000, commitments: 860000, supplements: 45000 },
  { month: "March", allocation: 410000, commitments: 210000, supplements: 20000 },
  { month: "April", allocation: 720000, commitments: 520000, supplements: 80000 },
  { month: "May", allocation: 580000, commitments: 340000, supplements: 35000 },
  { month: "June", allocation: 620000, commitments: 390000, supplements: 490000 },
]

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
} satisfies ChartConfig

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
              content={<ChartTooltipContent />}
            />

            <defs>
              <linearGradient id="fillAllocation" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-allocation)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-allocation)" stopOpacity={0.1} />
              </linearGradient>

              <linearGradient id="fillCommitments" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-commitments)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-commitments)" stopOpacity={0.1} />
              </linearGradient>

              <linearGradient id="fillSupplements" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-supplements)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-supplements)" stopOpacity={0.1} />
              </linearGradient>
            </defs>

            <Area
              dataKey="allocation"
              type="natural"
              fill="url(#fillAllocation)"
              fillOpacity={0.4}
              stroke="var(--color-allocation)"
            />

            <Area
              dataKey="commitments"
              type="natural"
              fill="url(#fillCommitments)"
              fillOpacity={0.4}
              stroke="var(--color-commitments)"
            />

            <Area
              dataKey="supplements"
              type="natural"
              fill="url(#fillSupplements)"
              fillOpacity={0.4}
              stroke="var(--color-supplements)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>

      <CardFooter>
        <div className="flex items-center gap-2 text-sm font-medium">
          Commitments increased this quarter
          <TrendingUp className="h-4 w-4" />
        </div>
      </CardFooter>
    </Card>
  )
}