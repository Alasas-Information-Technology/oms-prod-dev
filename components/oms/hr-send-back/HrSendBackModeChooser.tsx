"use client";

import * as React from "react";
import { ClarificationType } from "@/types/clarification";
import { HrSendBackRouteStage } from "@/src/types/hr-send-back";
import { HelpCircle, RefreshCw, AlertOctagon } from "lucide-react";
import { cn } from "@/lib/utils";

interface HrSendBackModeChooserProps {
  mode: ClarificationType;
  onSelectMode: (mode: ClarificationType) => void;
  reapprovalRoute?: HrSendBackRouteStage[];
  disabled?: boolean;
  className?: string;
}

export function formatApproversSentence(route?: HrSendBackRouteStage[]): string {
  if (!route || route.length === 0) {
    return "it repeats standard management approval before returning to you.";
  }

  // Filter out HR_REVIEW if it's the final stage (since it returns to HR)
  const nonHrStages = route.filter(
    (r) => r.stage !== "HR_REVIEW" && r.stage !== "HR"
  );
  const stagesToUse = nonHrStages.length > 0 ? nonHrStages : route;
  const names = stagesToUse
    .map((r) => r.user?.name)
    .filter(Boolean) as string[];

  if (names.length === 0) {
    return "it repeats management approval before returning to you.";
  }
  if (names.length === 1) {
    return `it goes back through ${names[0]} before returning to you.`;
  }
  if (names.length === 2) {
    return `it goes back through ${names[0]} and ${names[1]} before returning to you.`;
  }

  const allExceptLast = names.slice(0, -1).join(", ");
  const last = names[names.length - 1];
  return `it goes back through ${allExceptLast} and ${last} before returning to you.`;
}

export function HrSendBackModeChooser({
  mode,
  onSelectMode,
  reapprovalRoute = [],
  disabled = false,
  className,
}: HrSendBackModeChooserProps) {
  const returnPathSentence = React.useMemo(
    () => formatApproversSentence(reapprovalRoute),
    [reapprovalRoute]
  );

  const modesConfig: Array<{
    code: ClarificationType;
    title: string;
    description: string;
    consequence: string;
    icon: React.ComponentType<{ className?: string }>;
    accentColor: string;
  }> = [
    {
      code: "MORE_INFO",
      title: "Ask a question",
      description: "Least disruptive",
      consequence:
        "She answers. Nothing needs re-approval and the request stays with you.",
      icon: HelpCircle,
      accentColor: "border-primary text-primary",
    },
    {
      code: "INFO_WITH_APPROVAL",
      title: "Ask for changes that need re-approval",
      description: "Return path",
      consequence: `She updates the details, then ${returnPathSentence}`,
      icon: RefreshCw,
      accentColor: "border-amber-500 text-amber-600 dark:text-amber-400",
    },
    {
      code: "AMEND",
      title: "Ask her to amend the request",
      description: "Full restart",
      consequence: "She revises it. Full approval and budget checks repeat.",
      icon: AlertOctagon,
      accentColor: "border-rose-500 text-rose-600 dark:text-rose-400",
    },
  ];

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          What should happen
        </label>
        <span className="text-[11px] text-muted-foreground font-medium">
          Choose clarification consequence
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {modesConfig.map((item) => {
          const isSelected = mode === item.code;
          const Icon = item.icon;

          return (
            <button
              key={item.code}
              type="button"
              disabled={disabled}
              onClick={() => onSelectMode(item.code)}
              className={cn(
                "relative text-left p-4 rounded-xl border transition-all flex flex-col justify-between cursor-pointer",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20",
                isSelected
                  ? "border-primary bg-primary/5 shadow-xs ring-1 ring-primary/30"
                  : "border-border/80 bg-card hover:border-border hover:bg-muted/30 shadow-2xs",
                disabled && "opacity-60 cursor-not-allowed"
              )}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "size-4 rounded-full border flex items-center justify-center transition-colors shrink-0",
                        isSelected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-muted-foreground/40 bg-background"
                      )}
                    >
                      {isSelected && (
                        <span className="size-1.5 rounded-full bg-white" />
                      )}
                    </span>
                    <span
                      className={cn(
                        "text-xs font-semibold leading-tight",
                        isSelected ? "text-foreground" : "text-foreground/90"
                      )}
                    >
                      {item.title}
                    </span>
                  </div>

                  <Icon
                    className={cn(
                      "size-4 shrink-0 opacity-70",
                      isSelected ? item.accentColor : "text-muted-foreground"
                    )}
                  />
                </div>

                <p className="text-[12px] text-muted-foreground leading-relaxed pl-6">
                  {item.consequence}
                </p>
              </div>

              {item.code === "MORE_INFO" && (
                <div className="mt-3 pl-6">
                  <span className="inline-block text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                    Recommended
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
