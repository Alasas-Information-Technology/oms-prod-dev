import {
  CircleAlert,
  Clock3,
  LockKeyhole,
  Users,
  WalletCards,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/components/ui/utils";

import { OmsRequest } from "./request.types";

interface PortfolioSnapshotProps {
  requests: OmsRequest[];
}

const compactCurrencyFormatter =
  new Intl.NumberFormat("en-AE", {
    style: "currency",
    currency: "AED",
    notation: "compact",
    maximumFractionDigits: 2,
  });

function SnapshotCard({
  icon: Icon,
  label,
  value,
  attention = false,
}: {
  icon: React.ComponentType<{
    className?: string;
  }>;
  label: string;
  value: string;
  attention?: boolean;
}) {
  return (
    <Card className="gap-0 rounded-xl bg-white p-4 shadow-xs hover:translate-y-0">
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary",
            attention &&
              "bg-warning-light text-warning"
          )}
        >
          <Icon className="size-4" />
        </span>

        <div className="min-w-0">
          <p className="truncate text-xs text-muted-foreground">
            {label}
          </p>

          <p className="mt-1 truncate text-base font-semibold text-foreground">
            {value}
          </p>
        </div>
      </div>
    </Card>
  );
}

export function PortfolioSnapshot({
  requests,
}: PortfolioSnapshotProps) {
  const reserved = requests.reduce(
    (total, request) =>
      total + request.budget,
    0
  );

  const locked = requests.reduce(
    (total, request) =>
      total + request.lockedBudget,
    0
  );

  const resources = requests.reduce(
    (total, request) =>
      total + request.resources,
    0
  );

  const slaItems = requests.filter(
    (request) => request.needsSlaAttention
  ).length;

  const averageApprovalAge = requests.length
    ? requests.reduce((total, request) => {
        const currentStageIndex =
          request.lifecycle.findIndex(
            (step) =>
              step.state === "current"
          );

        return (
          total +
          Math.max(
            0.8,
            5.8 -
              currentStageIndex * 0.65
          )
        );
      }, 0) / requests.length
    : 0;

  return (
    <section>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-foreground">
            Portfolio snapshot
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            Totals reflect the current
            filtered view.
          </p>
        </div>

        {slaItems > 0 && (
          <Badge
            variant="outline"
            className="rounded-md border-warning/30 bg-warning-light text-warning"
          >
            <CircleAlert className="size-3.5" />

            {slaItems} SLA{" "}
            {slaItems === 1
              ? "item"
              : "items"}
          </Badge>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SnapshotCard
          icon={WalletCards}
          label="Reserved"
          value={compactCurrencyFormatter.format(
            reserved
          )}
        />

        <SnapshotCard
          icon={LockKeyhole}
          label="Locked & allocated"
          value={compactCurrencyFormatter.format(
            locked
          )}
        />

        <SnapshotCard
          icon={Users}
          label="Resources requested"
          value={String(resources)}
        />

        <SnapshotCard
          icon={Clock3}
          label="Average approval age"
          value={`${averageApprovalAge.toFixed(
            1
          )} days`}
          attention={slaItems > 0}
        />
      </div>
    </section>
  );
}