"use client";

import * as React from "react";
import { GitFork, Check } from "lucide-react";
import { ClarificationRouteStep } from "@/types/clarification";
import { cn } from "@/lib/utils";

interface ClarificationRouteStepperProps {
  route?: ClarificationRouteStep[];
  isLoading?: boolean;
  className?: string;
}

export function ClarificationRouteStepper({
  route = [],
  isLoading = false,
  className,
}: ClarificationRouteStepperProps) {
  if (!route || route.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        "rounded-xl border border-border/80 bg-card shadow-xs overflow-hidden transition-opacity duration-200",
        isLoading && "opacity-70",
        className
      )}
    >
      {/* Header */}
      <div className="px-4 py-3 sm:px-5 sm:py-3.5 bg-muted/40 border-b border-border/70 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GitFork className="size-4 text-primary" />
          <span className="text-xs font-bold uppercase tracking-wider text-foreground">
            Approval Route
          </span>
        </div>
        <span className="text-xs text-muted-foreground font-semibold px-2 py-0.5 rounded-full bg-muted border border-border/60">
          {route.length} stages
        </span>
      </div>

      {/* Stepper Chain */}
      <div className="p-4 sm:p-5 space-y-4">
        <div className="relative">
          <div className="flex flex-col gap-3.5">
            {route.map((step, idx) => {
              const isLast = idx === route.length - 1;
              const isComplete = step.state === "COMPLETE";
              const isCurrent = step.state === "CURRENT";

              return (
                <div key={`${step.stage}-${idx}`} className="flex items-start gap-3.5 relative">
                  {/* Step Icon / Indicator */}
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        "size-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 border",
                        isCurrent
                          ? "bg-primary text-primary-foreground border-primary shadow-xs"
                          : isComplete
                          ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                          : "bg-muted text-muted-foreground border-border/60"
                      )}
                    >
                      {isComplete ? (
                        <Check className="size-3.5" />
                      ) : (
                        idx + 1
                      )}
                    </div>

                    {!isLast && (
                      <div className="w-0.5 h-7 bg-border/80 my-1 shrink-0" />
                    )}
                  </div>

                  {/* Step Content */}
                  <div className="min-w-0 flex-1 pt-0.5">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {step.label}
                      </p>
                      <span className="text-[10.5px] uppercase px-2 py-0.5 rounded-md bg-muted/60 text-muted-foreground font-semibold">
                        {step.stage.replace(/_/g, " ")}
                      </span>
                    </div>

                    {step.user && (
                      <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
                        <span className="font-medium text-foreground">
                          {step.user.name}
                        </span>
                        {step.user.role && (
                          <span className="text-muted-foreground/80">
                            · {step.user.role}
                          </span>
                        )}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Note beneath stepper */}
        <p className="pt-2 border-t border-border/40 text-[11.5px] text-muted-foreground leading-normal">
          Everyone in this list is notified in the system and by email.
        </p>
      </div>
    </div>
  );
}
