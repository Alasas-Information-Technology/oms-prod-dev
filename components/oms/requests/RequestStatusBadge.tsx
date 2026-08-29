import { Badge } from "@/components/ui/badge";
import { cn } from "@/components/ui/utils";

import { RequestActualStatus } from "./request.types";

const STATUS_STYLES: Record<RequestActualStatus, string> = {
  Draft: "border-slate-200 bg-slate-100 text-slate-700",

  "Department Approval":
    "border-amber-200 bg-amber-50 text-amber-700",

  "More Information Required":
    "border-orange-200 bg-orange-50 text-orange-700",

  "HR Approved":
    "border-emerald-200 bg-emerald-50 text-emerald-700",

  Procurement:
    "border-indigo-200 bg-indigo-50 text-indigo-700",

  "Candidate Review":
    "border-blue-200 bg-blue-50 text-blue-700",

  Onboarding:
    "border-violet-200 bg-violet-50 text-violet-700",

  "Active Engagement":
    "border-emerald-200 bg-emerald-50 text-emerald-700",

  Closed:
    "border-slate-200 bg-slate-100 text-slate-600",
};

interface RequestStatusBadgeProps {
  status: RequestActualStatus;
  className?: string;
}

export function RequestStatusBadge({
  status,
  className,
}: RequestStatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-md px-2 py-1 text-[11px] font-semibold",
        STATUS_STYLES[status],
        className
      )}
    >
      {status}
    </Badge>
  );
}