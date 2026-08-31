import {
  Building2,
  CalendarDays,
  CircleDollarSign,
  Clock3,
  MapPin,
  UserRound,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import { RequestLifecycleStepper } from "./RequestLifecycleStepper";
import { RequestApprovalRouteSummary } from "@/components/oms/approvals";
import { OmsRequest } from "./request.types";

interface RequestExpandedDetailsProps {
  request: OmsRequest;
}

const dateFormatter =
  new Intl.DateTimeFormat("en-AE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const currencyFormatter =
  new Intl.NumberFormat("en-AE", {
    style: "currency",
    currency: "AED",
    maximumFractionDigits: 0,
  });

function formatDate(value: string) {
  return dateFormatter.format(
    new Date(`${value}T00:00:00`)
  );
}

function DetailItem({
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
      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="size-4" />
      </span>

      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">
          {label}
        </p>

        <div className="mt-1 whitespace-normal break-words text-sm font-medium leading-5 text-foreground">
          {value}
        </div>
      </div>
    </div>
  );
}

export function RequestExpandedDetails({
  request,
}: RequestExpandedDetailsProps) {
  return (
    <div className="w-full max-w-full overflow-hidden whitespace-normal bg-white px-4 py-5 md:px-6">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground">
            Request lifecycle
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            Current progress from submission to
            active engagement.
          </p>
        </div>

        <Badge
          variant="outline"
          className="rounded-md border-primary/20 bg-primary/5 text-primary"
        >
          {request.currentStage}
        </Badge>
      </div>

      <RequestLifecycleStepper
        steps={request.lifecycle}
      />

      <Separator className="my-5" />

      <div className="grid min-w-0 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <DetailItem
          icon={Building2}
          label="Organisation"
          value={request.organization}
        />

        <DetailItem
          icon={Building2}
          label="Department"
          value={request.department}
        />

        <DetailItem
          icon={Users}
          label="Resources"
          value={`${request.resources} requested`}
        />

        <DetailItem
          icon={UserRound}
          label="Current owner"
          value={request.currentOwner}
        />

        <DetailItem
          icon={MapPin}
          label="Location"
          value={request.location}
        />

        <DetailItem
          icon={CalendarDays}
          label="Engagement period"
          value={`${formatDate(
            request.startDate
          )} – ${formatDate(
            request.endDate
          )}`}
        />

        <DetailItem
          icon={CircleDollarSign}
          label="Approved budget"
          value={currencyFormatter.format(
            request.budget
          )}
        />

        <DetailItem
          icon={Clock3}
          label="Last updated"
          value={request.updatedLabel}
        />
      </div>

      <div className="mt-5 rounded-lg border border-border/70 bg-background p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Business justification
        </p>

        <p className="mt-2 whitespace-normal break-words text-sm leading-6 text-foreground-secondary">
          {request.justification}
        </p>
      </div>

      <div className="mt-5">
        <RequestApprovalRouteSummary
          requestId={request.requestId}
          currentStageName={request.currentStage}
          currentOwnerName={request.currentOwner}
        />
      </div>
    </div>
  );
}