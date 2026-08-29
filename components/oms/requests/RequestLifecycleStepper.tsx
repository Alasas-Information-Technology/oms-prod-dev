import { Fragment } from "react";

import {
  ArrowDown,
  ArrowRight,
  Check,
  Circle,
  Clock3,
} from "lucide-react";

import { cn } from "@/components/ui/utils";

import { RequestLifecycleStep } from "./request.types";

interface RequestLifecycleStepperProps {
  steps: RequestLifecycleStep[];
}

export function RequestLifecycleStepper({
  steps,
}: RequestLifecycleStepperProps) {
  return (
    <div className="flex w-full flex-col xl:flex-row xl:items-start">
      {steps.map((step, index) => {
        const isCompleted =
          step.state === "completed";

        const isCurrent =
          step.state === "current";

        return (
          <Fragment key={step.id}>
            <div className="flex min-w-0 flex-1 items-center gap-3 rounded-lg bg-slate-50 px-3 py-2 xl:flex-col xl:bg-transparent xl:p-0 xl:text-center">
              <span
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full border-2 bg-white",

                  isCompleted &&
                    "border-primary bg-primary text-primary-foreground",

                  isCurrent &&
                    "border-primary text-primary ring-4 ring-primary/10",

                  !isCompleted &&
                    !isCurrent &&
                    "border-border text-muted-foreground"
                )}
              >
                {isCompleted ? (
                  <Check className="size-4" />
                ) : isCurrent ? (
                  <Clock3 className="size-4" />
                ) : (
                  <Circle className="size-3" />
                )}
              </span>

              <div className="min-w-0 xl:mt-2">
                <p
                  className={cn(
                    "whitespace-normal break-words text-xs font-medium leading-4",

                    isCurrent
                      ? "text-primary"
                      : "text-foreground"
                  )}
                >
                  {step.label}
                </p>

                <p className="mt-1 whitespace-normal text-[11px] text-muted-foreground">
                  {step.completedAt ??
                    (isCurrent
                      ? "In progress"
                      : "Upcoming")}
                </p>
              </div>
            </div>

            {index < steps.length - 1 && (
              <div
                aria-hidden="true"
                className="flex h-7 shrink-0 items-center justify-center text-slate-400 xl:mt-2 xl:h-auto xl:w-7"
              >
                <ArrowDown className="size-4 xl:hidden" />

                <ArrowRight
                  className={cn(
                    "hidden size-4 xl:block",
                    isCompleted &&
                      "text-primary"
                  )}
                />
              </div>
            )}
          </Fragment>
        );
      })}
    </div>
  );
}