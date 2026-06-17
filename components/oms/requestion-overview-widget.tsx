"use client";

import { useState } from "react";
import { MoreHorizontal, Lightbulb } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const reportData = {
  all: {
    submitted: "1,254",
    value: "AED 8.4M",
    approved: 74,
    pending: 18,
    rejected: 8,
  },
  daily: {
    submitted: "42",
    value: "AED 280K",
    approved: 69,
    pending: 24,
    rejected: 7,
  },
  quarterly: {
    submitted: "356",
    value: "AED 2.3M",
    approved: 76,
    pending: 16,
    rejected: 8,
  },
};

function CircleStat({
  value,
  label,
  sub,
  color,
}: {
  value: number;
  label: string;
  sub: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl border p-2 min-w-0">
      <div className="relative size-10 shrink-0">
        <svg className="size-10 -rotate-90">
          <circle
            cx="20"
            cy="20"
            r="16"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
            className="text-muted"
          />
          <circle
            cx="20"
            cy="20"
            r="16"
            stroke={color}
            strokeWidth="4"
            fill="none"
            strokeDasharray={`${value} 100`}
            strokeLinecap="round"
          />
        </svg>

        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-semibold">
          {value}%
        </span>
      </div>

      <div className="min-w-0 flex-1 overflow-hidden">
        <p className="truncate text-[11px] font-semibold leading-tight">
          {label}
        </p>

        <p className="truncate text-[10px] text-muted-foreground leading-tight">
          {sub}
        </p>
      </div>
    </div>
  );
}

export function RequesitionOverviewWidget() {
  const [active, setActive] = useState<"all" | "daily" | "quarterly">("all");

  const data = reportData[active];

  return (
    <Card className="h-full overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Procurement Funnel</CardTitle>

            <CardDescription>
              Request progression by status
            </CardDescription>
          </div>

          <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 rounded-full bg-muted p-1 text-[11px]">
          {["all", "daily", "quarterly"].map((item) => (
            <button
              key={item}
              onClick={() =>
                setActive(item as "all" | "daily" | "quarterly")
              }
              className={`rounded-full py-1 capitalize transition ${
                active === item
                  ? "bg-background font-medium shadow-sm"
                  : "text-muted-foreground"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-[11px] text-muted-foreground">
              Total Submitted
            </p>

            <p className="text-xl font-bold">{data.submitted}</p>

            <p className="text-[11px] text-muted-foreground">
              Requests
            </p>
          </div>

          <div>
            <p className="text-[11px] text-muted-foreground">
              Total Value
            </p>

            <p className="text-xl font-bold">{data.value}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <CircleStat
            value={data.approved}
            label="Approval"
            sub={`${data.approved}% approved`}
            color="#14b8a6"
          />

          <CircleStat
            value={data.pending}
            label="Pending"
            sub={`${data.pending}% waiting`}
            color="#f59e0b"
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-green-500" />
              Approved
            </span>

            <span className="text-muted-foreground">
              {data.approved}%
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-yellow-500" />
              Pending
            </span>

            <span className="text-muted-foreground">
              {data.pending}%
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-red-500" />
              Rejected
            </span>

            <span className="text-muted-foreground">
              {data.rejected}%
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}