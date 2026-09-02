import {
  CircleDollarSign,
  ShieldCheck,
  WalletCards,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/components/ui/utils";

import { HrBudgetPosition } from "./hr-review.types";

interface BudgetPositionPanelProps {
  budget: HrBudgetPosition;
  detailed?: boolean;
}

const currencyFormatter =
  new Intl.NumberFormat("en-AE", {
    style: "currency",
    currency: "AED",
    maximumFractionDigits: 0,
  });

function BudgetMetric({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="min-w-0 rounded-xl border border-border/70 bg-slate-50/70 p-3">
      <p className="text-xs text-muted-foreground">
        {label}
      </p>

      <p className="mt-1 whitespace-normal break-words text-base font-semibold text-foreground">
        {currencyFormatter.format(
          value
        )}
      </p>
    </div>
  );
}

export function BudgetPositionPanel({
  budget,
  detailed = false,
}: BudgetPositionPanelProps) {
  const total = budget.lines.reduce(
    (sum, line) =>
      sum + line.amount,
    0
  );

  return (
    <Card className="gap-4 rounded-xl bg-white p-5 shadow-xs hover:translate-y-0">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <WalletCards className="size-4" />
          </span>

          <div>
            <p className="text-sm font-semibold text-foreground">
              Budget Position
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              Funding position from the
              mock fund-state module.
            </p>
          </div>
        </div>

        <Badge
          variant="outline"
          className={cn(
            "rounded-md",

            budget.verified
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-amber-200 bg-amber-50 text-amber-700"
          )}
        >
          <ShieldCheck className="size-3.5" />

          {budget.verified
            ? "Verified"
            : "Verification required"}
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
          value={
            budget.availableRemaining
          }
        />
      </div>

      <div className="grid gap-3 rounded-xl border border-border/70 p-4 sm:grid-cols-2">
        <div>
          <p className="text-xs text-muted-foreground">
            Budget code / account
          </p>

          <p className="mt-1 whitespace-normal break-words text-sm font-medium text-foreground">
            {budget.budgetCode}
          </p>
        </div>

        <div>
          <p className="text-xs text-muted-foreground">
            Funding route
          </p>

          <p className="mt-1 text-sm font-medium text-foreground">
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

              <p className="text-sm font-semibold text-foreground">
                Budget breakdown
              </p>
            </div>

            <div className="overflow-hidden rounded-xl border border-border">
              {budget.lines.map(
                (line, index) => (
                  <div
                    key={line.id}
                    className={cn(
                      "flex items-center justify-between gap-4 px-4 py-3 text-sm",

                      index <
                        budget.lines
                          .length -
                          1 &&
                        "border-b border-border"
                    )}
                  >
                    <span className="whitespace-normal text-muted-foreground">
                      {line.label}
                    </span>

                    <span className="shrink-0 font-semibold text-foreground">
                      {currencyFormatter.format(
                        line.amount
                      )}
                    </span>
                  </div>
                )
              )}

              <div className="flex items-center justify-between gap-4 bg-slate-50 px-4 py-3 text-sm font-semibold">
                <span>Total</span>

                <span>
                  {currencyFormatter.format(
                    total
                  )}
                </span>
              </div>
            </div>
          </div>
        </>
      )}
    </Card>
  );
}