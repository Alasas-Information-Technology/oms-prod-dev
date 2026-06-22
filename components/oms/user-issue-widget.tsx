"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const userIssues = [
  { employee: "Ahmed Khan", department: "IT", issue: "Account locked", detail: "User failed login 5 times and needs unlock.", severity: "High" },
  { employee: "Sarah Ali", department: "HR", issue: "MFA not configured", detail: "User account is active but MFA setup is incomplete.", severity: "Medium" },
  { employee: "Mohammed Noor", department: "Finance", issue: "Password expired", detail: "Password expired yesterday and user cannot access OMS.", severity: "Medium" },
  { employee: "Fatima Hassan", department: "Procurement", issue: "Access pending", detail: "Role assignment is waiting for IT approval.", severity: "Low" },
];

export function UserIssueWidget() {
  const [index, setIndex] = useState(0);
  const item = userIssues[index];

  const next = () => setIndex((prev) => (prev + 1) % userIssues.length);
  const prev = () => setIndex((prev) => (prev === 0 ? userIssues.length - 1 : prev - 1));

  const badgeClass =
    item.severity === "High"
      ? "bg-red-100 text-red-700 border-red-200"
      : item.severity === "Medium"
      ? "bg-yellow-100 text-yellow-700 border-yellow-200"
      : "bg-green-100 text-green-700 border-green-200";

  return (
    <div className="h-[220px] rounded-xl border bg-white p-5 shadow-sm">
      <div className="flex h-full flex-col justify-between">
        <div className="flex items-start justify-between">
          <p className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <AlertTriangle className="h-4 w-4" />
            User Issue Requiring Attention
          </p>

          <Badge variant="outline" className={badgeClass}>
            {item.severity}
          </Badge>
        </div>

        <div>
          <h2 className="text-2xl font-semibold">{item.employee}</h2>
          <p className="text-sm text-muted-foreground">{item.department}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Issue</p>
            <p className="font-medium">{item.issue}</p>
          </div>

          <div>
            <p className="text-muted-foreground">Details</p>
            <p className="font-medium">{item.detail}</p>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" size="icon" onClick={prev}>
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <Button size="icon" onClick={next}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}