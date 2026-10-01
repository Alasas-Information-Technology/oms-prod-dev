import { Badge } from "@/components/ui/badge";
import { cn } from "@/components/ui/utils";

import { RequestActualStatus } from "./request.types";

const STATUS_STYLES: Record<RequestActualStatus, string> = {
  Draft:
    "border-border/60 bg-muted/60 text-muted-foreground dark:border-white/[0.08] dark:bg-muted/40 dark:text-muted-foreground",

  "Department Approval":
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400",

  "More Information Required":
    "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-500/20 dark:bg-orange-500/10 dark:text-orange-400",

  "HR Approved":
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400",

  Procurement:
    "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-400",

  "Candidate Review":
    "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400",

  Onboarding:
    "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-400",

  "Active Engagement":
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400",

  Closed:
    "border-border/60 bg-muted/60 text-muted-foreground dark:border-white/[0.08] dark:bg-muted/40 dark:text-muted-foreground",
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
        "inline-flex items-center justify-center whitespace-nowrap rounded-md px-2.5 py-0.5 text-[11px] font-semibold shrink-0",
        STATUS_STYLES[status],
        className
      )}
    >
      {status}
    </Badge>
  );
}