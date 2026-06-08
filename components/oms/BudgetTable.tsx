"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Funnel } from "lucide-react";

const activities = [
  {
    action: "Budget Allocated",
    department: "IT",
    type: "Allocation",
    date: "22 Mar 2026",
    amount: "AED 250,000",
  },
  {
    action: "Manpower Request Approved",
    department: "HR",
    type: "Commitment",
    date: "23 Mar 2026",
    amount: "AED 45,000",
  },
  {
    action: "Budget Supplement Approved",
    department: "Finance",
    type: "Supplement",
    date: "24 Mar 2026",
    amount: "AED 100,000",
  },
  {
    action: "Vendor Budget Assigned",
    department: "Procurement",
    type: "Allocation",
    date: "25 Mar 2026",
    amount: "AED 75,000",
  },
  {
    action: "Budget Transfer",
    department: "Operations",
    type: "Transfer",
    date: "26 Mar 2026",
    amount: "AED 50,000",
  },
];

export function RecentBudgetActivities() {
  return (
    <div className="rounded-xl border bg-background p-4 shadow-sm w-full">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-lg">
            Recent Budget Activities
          </h3>
          <p className="text-sm text-muted-foreground">
            Latest budget transactions and approvals
          </p>
        </div>

        <Button variant="outline" size="icon">
          <Funnel className="h-4 w-4" />
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Action</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {activities.slice(0, 3).map((activity) => (
            <TableRow key={activity.action}>
              <TableCell>{activity.action}</TableCell>
              <TableCell>{activity.department}</TableCell>
              <TableCell>{activity.type}</TableCell>
              <TableCell>{activity.date}</TableCell>
              <TableCell className="text-right font-medium">
                {activity.amount}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}