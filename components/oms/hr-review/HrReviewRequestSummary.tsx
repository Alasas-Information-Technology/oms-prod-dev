import {
  CalendarDays,
  Clock3,
  MapPin,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { HrReviewRequestDetail } from "@/types/hr-review";
import { cn } from "@/components/ui/utils";

interface HrReviewRequestSummaryProps {
  request: HrReviewRequestDetail;
}

const dateFormatter = new Intl.DateTimeFormat("en-AE", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

function MetricItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 px-4 first:pl-0">
      <div className="flex items-center gap-1.5">
        <Icon className="size-4 text-muted-foreground" />
        <span className="text-[12px] font-normal text-muted-foreground">{label}</span>
      </div>
      <span className="text-[14px] font-semibold text-foreground tabular-nums">{value}</span>
    </div>
  );
}

export function HrReviewRequestSummary({
  request,
}: HrReviewRequestSummaryProps) {
  return (
    <div className="flex flex-col">
      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <h1 className="text-[22px] font-semibold text-foreground tracking-tight">
            {request.position}
          </h1>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            {request.badges.map((badge) => (
              <Badge
                key={badge}
                variant="outline"
                className={cn(
                  "rounded-md px-2 py-0.5 text-[11px] font-medium",
                  badge === "BUDGET_VERIFIED" && "border-success/30 bg-success-light text-success",
                  badge === "NEW" && "border-transparent bg-muted text-foreground-secondary",
                  badge === "RETURNED" && "border-transparent bg-muted text-foreground-secondary"
                )}
              >
                {badge === "BUDGET_VERIFIED"
                  ? "Budget verified"
                  : badge === "RETURNED"
                  ? "Clarification returned"
                  : "New"}
              </Badge>
            ))}

            <Badge variant="outline" className="rounded-md font-medium text-[11px] border-transparent bg-muted text-foreground-secondary">
              {request.candidateRoute}
            </Badge>

            <Badge variant="outline" className="rounded-md font-medium text-[11px] border-transparent bg-muted text-foreground-secondary">
              <MapPin className="size-3 mr-1" />
              {request.workLocation}
            </Badge>
          </div>
        </div>

        <div className="shrink-0">
          <span className="font-mono text-[11px] font-medium text-muted-foreground">
            {request.id}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center divide-x divide-border/40 pt-4 mt-4 border-t border-border">
        <MetricItem
          icon={Users}
          label="Resources"
          value={request.resources}
        />

        <MetricItem
          icon={Clock3}
          label="Engagement"
          value={`${request.engagementMonths} months`}
        />

        <MetricItem
          icon={CalendarDays}
          label="Expected start"
          value={dateFormatter.format(new Date(request.expectedStart))}
        />

        <MetricItem
          icon={ShieldCheck}
          label="Grade"
          value={request.grade}
        />
      </div>
    </div>
  );
}