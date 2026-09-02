import {
  Check,
  Clock3,
  UserRound,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/components/ui/utils";

import { HrApprovalTrailItem } from "./hr-review.types";

interface DepartmentApprovalTrailProps {
  items: HrApprovalTrailItem[];
  detailed?: boolean;
}

export function DepartmentApprovalTrail({
  items,
  detailed = false,
}: DepartmentApprovalTrailProps) {
  const completedCount =
    items.filter(
      (item) =>
        item.state === "completed"
    ).length;

  return (
    <Card className="gap-4 rounded-xl bg-white p-5 shadow-xs hover:translate-y-0">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <UserRound className="size-4" />
          </span>

          <div>
            <p className="text-sm font-semibold text-foreground">
              Department Approval Trail
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              Recorded department approvals
              before HR Review.
            </p>
          </div>
        </div>

        <Badge
          variant="outline"
          className="rounded-md border-emerald-200 bg-emerald-50 text-emerald-700"
        >
          {completedCount} of{" "}
          {items.length} completed
        </Badge>
      </div>

      <div
        className={cn(
          "space-y-0",
          detailed && "max-w-4xl"
        )}
      >
        {items.map((item, index) => {
          const isCompleted =
            item.state === "completed";

          return (
            <div
              key={item.id}
              className="relative flex min-w-0 gap-3 pb-4 last:pb-0"
            >
              {index <
                items.length - 1 && (
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute left-[13px] top-7 h-[calc(100%-20px)] w-px bg-border",

                    isCompleted &&
                      "bg-primary/50"
                  )}
                />
              )}

              <span
                className={cn(
                  "relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full border bg-white",

                  isCompleted
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground"
                )}
              >
                {isCompleted ? (
                  <Check className="size-3.5" />
                ) : (
                  <Clock3 className="size-3.5" />
                )}
              </span>

              <div className="grid min-w-0 flex-1 gap-1 pt-0.5 sm:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)_auto] sm:items-center sm:gap-4">
                <p className="whitespace-normal text-sm font-medium text-foreground">
                  {item.stage}
                </p>

                <p className="whitespace-normal text-xs text-muted-foreground">
                  {item.approver}
                </p>

                <p className="whitespace-nowrap text-xs text-muted-foreground">
                  {item.completedAt ??
                    "Pending"}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}