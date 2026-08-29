"use client";

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
}

export function ApprovalRouteStepper({
  route,
  className,
}: ApprovalRouteStepperProps) {
  if (!route || route.length === 0) return null;

  return (
    <div className={cn("w-full py-4 overflow-x-auto", className)}>
      <div className="flex items-center min-w-max px-2">
        {route.map((step, index) => {
          const isLast = index === route.length - 1;
          const isComplete = step.state === "COMPLETE" || step.state === "SKIPPED";
          const isCurrent = step.state === "CURRENT";
          const isPending = step.state === "PENDING";

          return (
            <div key={step.code} className="flex items-center">
              {/* Step Node */}
              <div className="relative flex flex-col items-center group">
                <TooltipProvider>
                  <Tooltip delayDuration={300}>
                    <TooltipTrigger asChild>
                      <div
                        className={cn(
                          "z-10 flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm font-semibold transition-colors duration-200",
                          isComplete
                            ? "bg-primary border-primary text-primary-foreground"
                            : isCurrent
                            ? "bg-background border-primary text-primary"
                            : "bg-background border-muted-foreground/30 text-muted-foreground"
                        )}
                      >
                        {isComplete ? (
                          <Check className="size-4" strokeWidth={3} />
                        ) : (
                          step.index
                        )}
                      </div>
                    </TooltipTrigger>
                    {isComplete && step.at && (
                      <TooltipContent>
                        <p className="text-xs">
                          {format(new Date(step.at), "MMM d, yyyy HH:mm")}
                        </p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>

                {/* Step Label Container - positioned absolutely below */}
                <div className="absolute top-10 flex flex-col items-center text-center w-32">
                  <span
                    className={cn(
                      "text-xs font-medium leading-tight",
                      isCurrent ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {step.label}
                  </span>
                  {isComplete && step.user && (
                    <span className="text-[10px] text-muted-foreground mt-0.5 truncate max-w-[120px]">
                      {step.user.name}
                    </span>
                  )}
                </div>
              </div>

              {/* Connecting Line */}
              {!isLast && (
                <div
                  className={cn(
                    "h-[2px] w-16 mx-2 transition-colors duration-200",
                    isComplete ? "bg-primary" : "bg-muted-foreground/20"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
      {/* Spacer to account for absolute labels */}
      <div className="h-12" />
    </div>
  );
}
