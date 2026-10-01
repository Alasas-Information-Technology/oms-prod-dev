import { Check, CircleDot, Route, ShieldCheck, UserRoundCheck } from "lucide-react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { LeaveApprovalStep } from "./leave.types";

interface LeaveApprovalRouteProps {
  steps: LeaveApprovalStep[];
}

const STEP_ICONS = [Check, UserRoundCheck, ShieldCheck, CircleDot];

export function LeaveApprovalRoute({ steps }: LeaveApprovalRouteProps) {
  return (
    <Card className="h-full gap-4 rounded-xl border border-border/60 bg-card p-5 shadow-xs hover:translate-y-0">
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Route className="size-4" />
        </span>

        <div>
          <h2 className="text-sm font-semibold text-foreground">Approval Route</h2>
          <p className="mt-1 text-xs text-muted-foreground">How a leave request is processed.</p>
        </div>
      </div>

      <div className="space-y-0">
        {steps.map((step, index) => {
          const Icon = STEP_ICONS[index] ?? CircleDot;
          const isLast = index === steps.length - 1;

          return (
            <div key={step.id} className="relative flex gap-3 pb-5 last:pb-0">
              {!isLast && (
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute left-[15px] top-8 h-[calc(100%-18px)] w-px bg-border",
                    step.state === "complete" && "bg-primary/50",
                  )}
                />
              )}

              <span
                className={cn(
                  "relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border bg-card",
                  step.state === "complete" && "border-primary bg-primary text-primary-foreground",
                  step.state === "current" && "border-amber-300 bg-amber-50 text-amber-700",
                  step.state === "upcoming" && "border-border text-muted-foreground",
                )}
              >
                <Icon className="size-3.5" />
              </span>

              <div className="min-w-0 pt-0.5">
                <p className="text-sm font-medium text-foreground">{step.label}</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">{step.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
