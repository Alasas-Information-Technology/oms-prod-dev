"use client";

import * as React from "react";
import { Check } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface AmendmentLifecycleStep {
  number: number;
  label: string;
  status: "completed" | "current" | "pending";
  description: string;
}

export const AMENDMENT_LIFECYCLE_STEPS: AmendmentLifecycleStep[] = [
  {
    number: 1,
    label: "Candidate qualified",
    status: "completed",
    description: "Candidate evaluated and marked qualified with compensation exceeding approved budget",
  },
  {
    number: 2,
    label: "Amendment draft",
    status: "current",
    description: "Allocating funding route, providing justification, and submitting amendment for approval",
  },
  {
    number: 3,
    label: "Department approval",
    status: "pending",
    description: "Line manager, section head, and head of department review and approve reallocation",
  },
  {
    number: 4,
    label: "HR review",
    status: "pending",
    description: "Human resources review, compensation benchmarking, and endorsement",
  },
  {
    number: 5,
    label: "Finance review & allocation",
    status: "pending",
    description: "Finance verification, fund locking, budget line adjustment, and onboarding clearance",
  },
];

interface AmendmentProgressRailProps {
  currentStep?: number; // 1-indexed, default 2 (Amendment draft)
  totalSteps?: number; // default 5
  stepLabel?: string; // default "Amendment draft"
  className?: string;
  steps?: AmendmentLifecycleStep[];
  defaultOpen?: boolean;
}

/**
 * 4px progress rail directly beneath breadcrumbs per BUDGET-AMENDMENT-UI.md 1.2 & Part 2.
 * Replaces large 5-stage horizontal stepper with a compact, informative 4px rail.
 * "Amendment draft · 2 of 5" with hover/focus popover for detail.
 */
export function AmendmentProgressRail({
  currentStep = 2,
  totalSteps = 5,
  stepLabel = "Amendment draft",
  className,
  steps = AMENDMENT_LIFECYCLE_STEPS,
  defaultOpen = false,
}: AmendmentProgressRailProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  return (
    <div
      className={cn(
        "w-full px-4 sm:px-6 py-2 bg-background border-b border-border/60 transition-colors",
        className
      )}
    >
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
            onFocus={() => setIsOpen(true)}
            onBlur={() => setIsOpen(false)}
            aria-label={`Amendment lifecycle progress: ${stepLabel}, step ${currentStep} of ${totalSteps}. Click or hover to view lifecycle details.`}
            className="w-full flex items-center justify-between gap-4 group cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/40 rounded-sm py-0.5 text-left"
          >
            {/* 4px Progress Rail: Five segments, 2px gaps, 4px tall (hidden on mobile, label alone) */}
            <div
              className="hidden sm:grid flex-1 items-center gap-[2px] h-1"
              style={{
                gridTemplateColumns: `repeat(${totalSteps}, minmax(0, 1fr))`,
              }}
            >
              {Array.from({ length: totalSteps }, (_, index) => {
                const stepNum = index + 1;
                const isCompleted = stepNum < currentStep;
                const isCurrent = stepNum === currentStep;

                if (isCompleted) {
                  return (
                    <div
                      key={stepNum}
                      className="h-1 rounded-full bg-primary transition-all"
                      title={`Step ${stepNum}: Completed`}
                    />
                  );
                }

                if (isCurrent) {
                  return (
                    <div
                      key={stepNum}
                      className="relative h-1 rounded-full bg-primary overflow-hidden transition-all"
                      title={`Step ${stepNum}: Current (${stepLabel})`}
                    >
                      {/* Shimmer sweep on load */}
                      <span
                        aria-hidden="true"
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full animate-[shimmer-once_1.2s_cubic-bezier(0.2,0,0,1)_forwards] motion-reduce:hidden"
                      />
                    </div>
                  );
                }

                return (
                  <div
                    key={stepNum}
                    className="h-1 rounded-full bg-foreground/12 dark:bg-foreground/12 transition-all"
                    title={`Step ${stepNum}: Pending`}
                  />
                );
              })}
            </div>

            {/* Label right-aligned: 11px muted */}
            <div className="flex items-center gap-1.5 shrink-0 ml-auto text-[11px] text-muted-foreground group-hover:text-foreground transition-colors font-medium">
              <span>
                {`${stepLabel} · ${currentStep} of ${totalSteps}`}
              </span>
            </div>
          </button>
        </PopoverTrigger>

        {/* Hover / Focus Popover showing 5-step lifecycle detail */}
        <PopoverContent
          side="bottom"
          align="end"
          sideOffset={8}
          className="w-84 p-4 space-y-3 bg-popover/95 backdrop-blur-md shadow-lg border border-border"
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
        >
          <div className="border-b border-border pb-2">
            <h4 className="text-xs font-semibold text-foreground">
              Amendment Lifecycle
            </h4>
            <p className="text-[11px] text-muted-foreground">
              Step {currentStep} of {totalSteps} · Current stage: {stepLabel}
            </p>
          </div>

          <div className="space-y-2.5">
            {steps.map((step) => {
              const isCompleted = step.number < currentStep;
              const isCurrent = step.number === currentStep;

              return (
                <div
                  key={step.number}
                  className={cn(
                    "flex items-start gap-2.5 text-xs p-1.5 rounded-md transition-colors",
                    isCurrent
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground"
                  )}
                >
                  <div
                    className={cn(
                      "size-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5",
                      isCompleted && "bg-primary text-primary-foreground",
                      isCurrent && "bg-primary text-primary-foreground ring-2 ring-primary/20",
                      !isCompleted && !isCurrent && "bg-muted text-muted-foreground"
                    )}
                  >
                    {isCompleted ? <Check className="size-3" /> : step.number}
                  </div>

                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={cn(
                          "font-semibold",
                          isCurrent
                            ? "text-foreground"
                            : isCompleted
                            ? "text-foreground"
                            : "text-muted-foreground"
                        )}
                      >
                        {step.label}
                      </span>
                      {isCurrent && (
                        <span className="text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.2 rounded bg-primary/15 text-primary">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground/90 leading-tight">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
