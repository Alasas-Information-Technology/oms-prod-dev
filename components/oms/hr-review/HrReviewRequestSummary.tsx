import {
  CalendarDays,
  Clock3,
  MapPin,
  ShieldCheck,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

import { HrReviewSlaBadge } from "./HrReviewSlaBadge";
import { HrReviewRequest } from "./hr-review.types";

interface HrReviewRequestSummaryProps {
  request: HrReviewRequest;
}

const dateFormatter =
  new Intl.DateTimeFormat("en-AE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

function SummaryItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{
    className?: string;
  }>;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex min-w-0 items-start gap-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="size-4" />
      </span>

      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">
          {label}
        </p>

        <div className="mt-1 whitespace-normal break-words text-sm font-semibold text-foreground">
          {value}
        </div>
      </div>
    </div>
  );
}

export function HrReviewRequestSummary({
  request,
}: HrReviewRequestSummaryProps) {
  return (
    <Card className="gap-5 rounded-xl bg-white p-5 shadow-xs hover:translate-y-0">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="whitespace-normal text-xl font-semibold text-foreground">
              {request.position}
            </h2>

            <Badge
              variant="outline"
              className="rounded-md border-blue-200 bg-blue-50 text-blue-700"
            >
              {request.queueStatus}
            </Badge>

            <HrReviewSlaBadge
              state={request.slaState}
              ageDays={
                request.slaAgeDays
              }
              targetDays={
                request.slaTargetDays
              }
            />
          </div>

          <p className="mt-2 text-sm text-muted-foreground">
            {request.department}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="secondary"
            className="rounded-md"
          >
            {
              request.candidateVisibility
            }
          </Badge>

          <Badge
            variant="secondary"
            className="rounded-md"
          >
            {request.location}
          </Badge>

          <span className="font-mono text-xs font-semibold text-secondary">
            {request.requestId}
          </span>
        </div>
      </div>

      <div className="grid gap-4 border-t border-border pt-5 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryItem
          icon={Users}
          label="Resources"
          value={request.resources}
        />

        <SummaryItem
          icon={Clock3}
          label="Engagement"
          value={`${request.engagementMonths} months`}
        />

        <SummaryItem
          icon={CalendarDays}
          label="Expected start"
          value={dateFormatter.format(
            new Date(
              `${request.expectedStart}T00:00:00`
            )
          )}
        />

        <SummaryItem
          icon={ShieldCheck}
          label="Grade"
          value={request.grade}
        />
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <MapPin className="size-3.5" />

        Work location:{" "}
        {request.location}
      </div>
    </Card>
  );
}