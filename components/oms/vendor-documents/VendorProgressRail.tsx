"use client";

import * as React from "react";
import { Check } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface OnboardingLifecycleStage {
  number: number;
  label: string;
  status: "completed" | "current" | "pending";
  description: string;
}

export const ONBOARDING_LIFECYCLE_STAGES: OnboardingLifecycleStage[] = [
  {
    number: 1,
    label: "Candidate submission",
    status: "completed",
    description: "Candidate profile and contact information submitted by vendor coordinator in Step 1",
  },
  {
    number: 2,
    label: "Required documents",
    status: "current",
    description: "Uploading compliance documents, identity verifications, and candidate NDA e-signature",
  },
  {
    number: 3,
    label: "Pre-submission review",
    status: "pending",
    description: "Vendor coordinator final audit, receipt issuance, and dispatch to DIEZ",
  },
  {
    number: 4,
    label: "DIEZ Review",
    status: "pending",
    description: "DIEZ security vetting, background clearance, and compliance verification",
  },
  {
    number: 5,
    label: "Clearance & onboarding",
    status: "pending",
    description: "Work permit issuance, security access clearance, and onboarding confirmation",
  },
];

interface VendorProgressRailProps {
  currentStage?: number; // 1-indexed, default 2 (Required documents)
  totalStages?: number;  // default 5
  stageLabel?: string;   // default "Required documents"
  className?: string;
  stages?: OnboardingLifecycleStage[];
  defaultOpen?: boolean;
}

/**
 * 4px progress rail directly beneath breadcrumb per VENDOR-DOCUMENTS-UI.md §1.11 & INTERVIEW-PLANNING-UX.md Part 3.
 * Replaces large 5-stage horizontal stepper with a compact, informative 4px rail.
 * "Required documents · 2 of 5" with hover/focus popover for detail.
 */
export function VendorProgressRail({
  currentStage = 2,
  totalStages = 5,
  stageLabel = "Required documents",
  className,
  stages = ONBOARDING_LIFECYCLE_STAGES,
  defaultOpen = false,
}: VendorProgressRailProps) {
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
            aria-label={`Onboarding progress: ${stageLabel}, stage ${currentStage} of ${totalStages}. Click or hover to view lifecycle details.`}
            className="w-full flex items-center justify-between gap-4 group cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/40 rounded-sm py-0.5 text-left"
          >
            {/* 4px Progress Rail: Five segments, 2px gaps, 4px tall (hidden on mobile, label alone) */}
            <div
              className="hidden sm:grid flex-1 items-center gap-[2px] h-1"
              style={{
                gridTemplateColumns: `repeat(${totalStages}, minmax(0, 1fr))`,
              }}
            >
              {Array.from({ length: totalStages }).map((_, index) => {
                const stageNum = index + 1;
                const isCompleted = stageNum < currentStage;
                const isCurrent = stageNum === currentStage;

                return (
                  <div
                    key={stageNum}
                    className={cn(
                      "h-1 rounded-full transition-all duration-300 relative overflow-hidden",
                      isCompleted && "bg-primary",
                      isCurrent && "bg-primary shadow-xs",
                      !isCompleted && !isCurrent && "bg-foreground/12 dark:bg-foreground/15"
                    )}
                  >
                    {isCurrent && (
                      <span
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"
                        style={{
                          animationDuration: "2.4s",
                          animationIterationCount: "2",
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Stage Label: 11px muted font */}
            <div className="shrink-0 flex items-center gap-1.5 text-[11px] text-muted-foreground group-hover:text-foreground transition-colors font-mono tabular-nums">
              <span className="font-sans font-medium text-foreground/85">
                {stageLabel}
              </span>
              <span>·</span>
              <span>
                {currentStage} of {totalStages}
              </span>
            </div>
          </button>
        </PopoverTrigger>

        <PopoverContent
          side="bottom"
          align="end"
          sideOffset={8}
          className="w-84 sm:w-96 p-4 shadow-xl border-border bg-popover/95 backdrop-blur-md rounded-lg text-xs"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-border/60 pb-2">
              <span className="font-semibold text-foreground text-xs uppercase tracking-wider">
                Onboarding Lifecycle
              </span>
              <span className="text-[11px] font-mono text-muted-foreground">
                Stage {currentStage} of {totalStages}
              </span>
            </div>

            <div className="space-y-2.5 pt-1">
              {stages.map((stage) => {
                const isCompleted = stage.number < currentStage;
                const isCurrent = stage.number === currentStage;
                const isPending = stage.number > currentStage;

                return (
                  <div
                    key={stage.number}
                    className={cn(
                      "flex items-start gap-3 p-2 rounded-md transition-colors",
                      isCurrent && "bg-primary/8 border border-primary/20",
                      !isCurrent && "hover:bg-muted/40"
                    )}
                  >
                    {/* Step Icon */}
                    <div
                      className={cn(
                        "size-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 transition-colors",
                        isCompleted && "bg-primary text-primary-foreground",
                        isCurrent &&
                          "bg-primary text-primary-foreground ring-4 ring-primary/20 animate-pulse",
                        isPending && "bg-muted text-muted-foreground border border-border"
                      )}
                    >
                      {isCompleted ? (
                        <Check className="size-3 stroke-[3]" />
                      ) : (
                        stage.number
                      )}
                    </div>

                    {/* Step Details */}
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="flex items-center justify-between gap-2">
                        <p
                          className={cn(
                            "font-medium leading-none",
                            isCurrent && "text-primary font-semibold",
                            isCompleted && "text-foreground",
                            isPending && "text-muted-foreground"
                          )}
                        >
                          {stage.label}
                        </p>
                        <span
                          className={cn(
                            "text-[10px] px-1.5 py-0.2 rounded-full uppercase tracking-wider font-mono",
                            isCompleted && "bg-muted text-muted-foreground",
                            isCurrent && "bg-primary/15 text-primary font-semibold",
                            isPending && "text-muted-foreground/60"
                          )}
                        >
                          {isCompleted
                            ? "Done"
                            : isCurrent
                            ? "Current"
                            : "Upcoming"}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-normal">
                        {stage.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
