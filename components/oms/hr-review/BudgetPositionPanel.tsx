import {
  CircleDollarSign,
  ShieldCheck,
  WalletCards,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/components/ui/utils";
import { formatAmount } from "@/lib/money";

import { HrBudget } from "@/types/hr-review";

interface BudgetPositionPanelProps {
  budget: HrBudget;
  detailed?: boolean;
}

function BudgetMetric({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="min-w-0 rounded-xl border border-border bg-slate-50 p-3">
      <p className="text-[12px] font-normal text-muted-foreground">
        {label}
      </p>

      <p className="mt-1 whitespace-normal break-words text-[13px] font-medium text-foreground tabular-nums">
        AED {formatAmount(value)}
      </p>
    </div>
  );
}

export function BudgetPositionPanel({
  budget,
  detailed = false,
}: BudgetPositionPanelProps) {
  return (
    <Card className="gap-4 rounded-xl bg-white p-5 shadow-xs hover:translate-y-0 border border-border">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <WalletCards className="size-4" />
          </span>

          <div>
            <p className="text-[14px] font-semibold text-foreground">
              Budget Position
            </p>

            <p className="mt-1 text-[12px] font-normal text-muted-foreground">
              Verified funding status for this request.
            </p>
          </div>
        </div>

        <Badge
          variant="outline"
          className={cn(
            "rounded-md text-[11px] font-medium",
            budget.verified
              ? "border-success/30 bg-success-light text-success"
              : "border-warning/30 bg-warning-light text-warning"
          )}
        >
          <ShieldCheck className="size-3.5 mr-1" />
          {budget.verified ? "Verified" : "Verification required"}
        </Badge>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <BudgetMetric
          label="Approved"
          value={budget.approved}
        />

        <BudgetMetric
          label="Reserved"
          value={budget.reserved}
        />

        <BudgetMetric
          label="Available remaining"
          value={budget.availableRemaining}
        />
      </div>

      <div className="grid gap-3 rounded-xl border border-border/70 p-4">
        <div>
          <p className="text-[12px] font-normal text-muted-foreground">
            Funding route
          </p>

          <p className="mt-1 text-[13px] font-medium text-foreground">
            {budget.fundingRoute}
          </p>
        </div>
      </div>

      {detailed && (
        <>
          <Separator />

          <div>
            <div className="mb-3 flex items-center gap-2">
              <CircleDollarSign className="size-4 text-primary" />

              <p className="text-[14px] font-semibold text-foreground">
                Budget breakdown
              </p>
            </div>

            <div className="overflow-hidden rounded-xl border border-border">
              {budget.lines.map((line, index) => (
                <div
                  key={line.code}
                  className={cn(
                    "flex items-center justify-between gap-4 px-4 py-3 text-[13px]",
                    index < budget.lines.length - 1 && "border-b border-border"
                  )}
                >
                  <span className="whitespace-normal text-[13px] font-normal text-muted-foreground">
                    <span className="font-mono text-[11px] font-medium text-secondary mr-2">{line.code}</span>
                    {line.name}
                  </span>

                  <span className="shrink-0 text-[13px] font-medium text-foreground tabular-nums">
                    AED {formatAmount(line.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </Card>
  );
}