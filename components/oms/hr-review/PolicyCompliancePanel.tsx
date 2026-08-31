import {
  CheckCircle2,
  CircleAlert,
  ShieldCheck,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/components/ui/utils";

import { HrComplianceCheck } from "./hr-review.types";

interface PolicyCompliancePanelProps {
  checks: HrComplianceCheck[];
}

export function PolicyCompliancePanel({
  checks,
}: PolicyCompliancePanelProps) {
  const reviewRequiredCount =
    checks.filter(
      (check) =>
        check.state ===
        "review-required"
    ).length;

  return (
    <Card className="gap-4 rounded-xl bg-white p-5 shadow-xs hover:translate-y-0">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <ShieldCheck className="size-4" />
          </span>

          <div>
            <p className="text-sm font-semibold text-foreground">
              Policy &amp; Compliance
              Checks
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              Review every HR policy
              requirement before
              disposition.
            </p>
          </div>
        </div>

        <Badge
          variant="outline"
          className={cn(
            "rounded-md",

            reviewRequiredCount > 0
              ? "border-amber-200 bg-amber-50 text-amber-700"
              : "border-emerald-200 bg-emerald-50 text-emerald-700"
          )}
        >
          {reviewRequiredCount > 0
            ? `${reviewRequiredCount} review required`
            : "All checks passed"}
        </Badge>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {checks.map((check) => {
          const needsReview =
            check.state ===
            "review-required";

          return (
            <div
              key={check.id}
              className={cn(
                "flex min-w-0 items-start gap-3 rounded-xl border p-3",

                needsReview
                  ? "border-amber-200 bg-amber-50/70"
                  : "border-emerald-100 bg-emerald-50/50"
              )}
            >
              <span
                className={cn(
                  "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full",

                  needsReview
                    ? "bg-amber-100 text-amber-700"
                    : "bg-emerald-100 text-emerald-700"
                )}
              >
                {needsReview ? (
                  <CircleAlert className="size-3.5" />
                ) : (
                  <CheckCircle2 className="size-3.5" />
                )}
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="whitespace-normal text-sm font-medium text-foreground">
                    {check.label}
                  </p>

                  <Badge
                    variant="outline"
                    className={cn(
                      "rounded-md px-2 py-0.5 text-[10px]",

                      needsReview
                        ? "border-amber-200 bg-white text-amber-700"
                        : "border-emerald-200 bg-white text-emerald-700"
                    )}
                  >
                    {needsReview
                      ? "Review required"
                      : "Passed"}
                  </Badge>
                </div>

                {check.note && (
                  <p className="mt-1 whitespace-normal text-xs leading-5 text-muted-foreground">
                    {check.note}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}