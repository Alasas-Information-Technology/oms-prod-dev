"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const items = [
  { title: "Approval SLA Compliance", desc: "Target achieved", value: 92 },
  { title: "Position Fulfillment", desc: "Open positions filled", value: 78 },
  { title: "Budget Utilization", desc: "Allocated budget used", value: 84 },
];

export function RequisitionPerformanceWidget() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Requisition Performance</CardTitle>
        <CardDescription>Key process indicators</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {items.map((item) => (
          <div key={item.title}>
            <div className="mb-2 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              <p className="text-sm font-semibold">{item.value}%</p>
            </div>

            <div className="h-2.5 rounded-full bg-slate-100">
              <div className="h-2.5 rounded-full bg-primary" style={{ width: `${item.value}%` }} />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}