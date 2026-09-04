"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { format } from "date-fns";
import { ApprovalStage } from "@/lib/types/approval.types";
import { cn } from "@/components/ui/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ApprovalRouteStepperProps {
  route: ApprovalStage[];
  className?: string;
  showCurrentBadge?: boolean;
  currentBadgeLabel?: string;
}

export function ApprovalRouteStepper({
  route,
  className,
  showCurrentBadge = true,
  currentBadgeLabel = "In Review",
}: ApprovalRouteStepperProps) {
  if (!route || route.length === 0) return null;

  return (
    <div className={cn("w-full py-3", className)}>
      <div className="w-full flex items-start">
        {route.map((step, index) => {
          const isFirst = index === 0;
          const isLast = index === route.length - 1;
          const isComplete = step.state === "COMPLETE" || step.state === "SKIPPED";
          const isCurrent = step.state === "CURRENT";

          // Left connector line state
          const leftLineActive = isComplete || isCurrent;
          // Right connector line state (only active if current step is complete)
          const rightLineActive = isComplete;

          return (
            <div
              key={step.code}
              className="flex-1 flex flex-col items-center relative min-w-0"
            >
              {/* Stepper Node & Connecting Track */}
              <div className="w-full flex items-center">
                {/* Left Connector Line */}
                <div
                  className={cn(
                    "h-[2px] flex-1 transition-colors duration-300",
                    isFirst ? "opacity-0" : leftLineActive ? "bg-primary" : "bg-border/80"
                  )}
                />

                {/* Node Circle */}
                <TooltipProvider>
                  <Tooltip delayDuration={200}>
                    <TooltipTrigger asChild>
                      <div
                        className={cn(
                          "relative z-10 flex items-center justify-center size-8 sm:size-9 rounded-full text-xs font-bold transition-all duration-300 shrink-0 cursor-default select-none",
                          isComplete
                            ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20 hover:scale-105"
                            : isCurrent
                            ? "bg-background border-2 border-primary text-primary ring-4 ring-primary/15 shadow-sm font-extrabold hover:scale-105"
                            : "bg-muted/60 border border-border/80 text-muted-foreground/80 hover:bg-muted"
                        )}
                      >
                        {isComplete ? (
                          <Check className="size-4 stroke-[2.5]" />
                        ) : (
                          <span>{step.index}</span>
                        )}
                      </div>
                    </TooltipTrigger>
                    {isComplete && step.at ? (
                      <TooltipContent side="top" className="text-xs">
                        <p className="font-semibold">{step.label}</p>
                        <p className="text-[11px] text-muted-foreground">
                          Completed on {format(new Date(step.at), "MMM d, yyyy 'at' HH:mm")}
                        </p>
                      </TooltipContent>
                    ) : isCurrent ? (
                      <TooltipContent side="top" className="text-xs">
                        <p className="font-semibold">{step.label}</p>
                        <p className="text-[11px] text-primary-foreground/80">
                          Currently awaiting decision
                        </p>
                      </TooltipContent>
                    ) : (
                      <TooltipContent side="top" className="text-xs">
                        <p className="font-semibold">{step.label}</p>
                        <p className="text-[11px] text-muted-foreground">
                          Step {step.index} of {route.length} (Pending)
                        </p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>

                {/* Right Connector Line */}
                <div
                  className={cn(
                    "h-[2px] flex-1 transition-colors duration-300",
                    isLast ? "opacity-0" : rightLineActive ? "bg-primary" : "bg-border/80"
                  )}
                />
              </div>

              {/* Step Labels & Approver Info */}
              <div className="mt-2.5 flex flex-col items-center text-center px-1 w-full max-w-[130px]">
                <span
                  className={cn(
                    "text-xs leading-snug tracking-tight transition-colors line-clamp-2",
                    isCurrent
                      ? "font-bold text-primary dark:text-primary-foreground"
                      : isComplete
                      ? "font-semibold text-foreground"
                      : "font-medium text-muted-foreground"
                  )}
                >
                  {step.label}
                </span>

                {step.user?.name && (
                  <span className="text-[11px] text-muted-foreground mt-0.5 truncate w-full font-normal">
                    {step.user.name}
                  </span>
                )}

                {isCurrent && showCurrentBadge && (
                  <span className="mt-1 inline-flex items-center text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                    {currentBadgeLabel}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
