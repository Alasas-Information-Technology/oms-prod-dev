"use client";

import {
  AlertTriangle,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  HrReviewQueueStatus,
  HrReviewSlaState,
} from "./hr-review.types";

export type HrReviewStatusFilter =
  | "all"
  | HrReviewQueueStatus;

export type HrReviewSlaFilter =
  | "all"
  | HrReviewSlaState;

interface HrReviewFiltersProps {
  search: string;
  status: HrReviewStatusFilter;
  sla: HrReviewSlaFilter;
  department: string;
  departments: string[];
  overdueCount: number;
  onSearchChange: (
    value: string
  ) => void;
  onStatusChange: (
    value: HrReviewStatusFilter
  ) => void;
  onSlaChange: (
    value: HrReviewSlaFilter
  ) => void;
  onDepartmentChange: (
    value: string
  ) => void;
  onClear: () => void;
}

export function HrReviewFilters({
  search,
  status,
  sla,
  department,
  departments,
  overdueCount,
  onSearchChange,
  onStatusChange,
  onSlaChange,
  onDepartmentChange,
  onClear,
}: HrReviewFiltersProps) {
  const hasFilters =
    search.trim() !== "" ||
    status !== "all" ||
    sla !== "all" ||
    department !== "all";

  return (
    <div className="rounded-xl border border-border bg-white p-4 shadow-xs">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            value={search}
            onChange={(event) =>
              onSearchChange(
                event.target.value
              )
            }
            placeholder="Search request ID, position or department..."
            className="pl-9"
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-3 xl:flex xl:shrink-0">
          <Select
            value={status}
            onValueChange={(value) =>
              onStatusChange(
                value as HrReviewStatusFilter
              )
            }
          >
            <SelectTrigger className="w-full sm:min-w-48">
              <SelectValue placeholder="Queue status" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">
                All statuses
              </SelectItem>

              <SelectItem value="New">
                New
              </SelectItem>

              <SelectItem value="Awaiting HR Review">
                Awaiting HR Review
              </SelectItem>

              <SelectItem value="Clarification Returned">
                Clarification Returned
              </SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={department}
            onValueChange={
              onDepartmentChange
            }
          >
            <SelectTrigger className="w-full sm:min-w-48">
              <SelectValue placeholder="Department" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">
                All departments
              </SelectItem>

              {departments.map(
                (item) => (
                  <SelectItem
                    key={item}
                    value={item}
                  >
                    {item}
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>

          <Select
            value={sla}
            onValueChange={(value) =>
              onSlaChange(
                value as HrReviewSlaFilter
              )
            }
          >
            <SelectTrigger className="w-full sm:min-w-44">
              <SelectValue placeholder="SLA status" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">
                All SLA states
              </SelectItem>

              <SelectItem value="within-target">
                Within target
              </SelectItem>

              <SelectItem value="due-soon">
                Due today
              </SelectItem>

              <SelectItem value="overdue">
                Overdue
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {hasFilters && (
          <Button
            type="button"
            variant="ghost"
            onClick={onClear}
            className="shrink-0"
          >
            <X className="size-4" />
            Clear
          </Button>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <SlidersHorizontal className="size-3.5" />
          Filter the HR review queue
        </span>

        <span className="inline-flex items-center gap-1.5 font-medium text-red-600">
          <AlertTriangle className="size-3.5" />
          {overdueCount} overdue
        </span>
      </div>
    </div>
  );
}