"use client";

import * as React from "react";
import { Info, UserCheck, ShieldAlert, ArrowRight } from "lucide-react";
import { ClarificationDetail } from "@/types/clarification";
import { cn } from "@/lib/utils";

interface ClarificationConsequenceBannerProps {
  clarification: ClarificationDetail;
  className?: string;
}

/**
 * Consequence Banner per Part 3.1:
 * Always present, directly under the header.
 * Written as a sentence naming actual people from consequence.summary.
 */
export function ClarificationConsequenceBanner({
  clarification,
  className,
}: ClarificationConsequenceBannerProps) {
  const { type, consequence } = clarification;
  const isMoreInfo = type === "MORE_INFO";
  const isAmend = type === "AMEND";

  let icon = <Info className="size-4.5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />;
  let containerStyles = "bg-blue-500/5 border-blue-500/20 text-foreground dark:bg-blue-950/20 dark:border-blue-900/30";
  let title = "Your changes will need approval again";

  if (isMoreInfo) {
    icon = <UserCheck className="size-4.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />;
    containerStyles = "bg-emerald-500/5 border-emerald-500/20 text-foreground dark:bg-emerald-950/20 dark:border-emerald-900/30";
    title = "Information-only clarification";
  } else if (isAmend) {
    icon = <ShieldAlert className="size-4.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />;
    containerStyles = "bg-amber-500/5 border-amber-500/20 text-foreground dark:bg-amber-950/20 dark:border-amber-900/30";
    title = "Formal amendment cycle";
  }

  return (
    <div
      className={cn(
        "rounded-xl border p-4 sm:p-5 flex items-start gap-3.5 shadow-xs transition-all",
        containerStyles,
        className
      )}
    >
      {icon}
      <div className="flex-1 space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </p>
        <p className="text-sm font-medium leading-relaxed text-foreground">
          {consequence.summary}
        </p>
        {consequence.approvers && consequence.approvers.length > 0 && (
          <div className="pt-2 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground/80">Approval chain:</span>
            {consequence.approvers.map((approver, index) => (
              <React.Fragment key={approver.userId || approver.name}>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-background/80 border border-border/60 text-foreground text-[11.5px] font-medium shadow-2xs">
                  {approver.name}
                  <span className="text-[10px] text-muted-foreground">({approver.stage.replace(/_/g, " ")})</span>
                </span>
                {index < consequence.approvers.length - 1 && (
                  <ArrowRight className="size-3 text-muted-foreground/60 shrink-0" />
                )}
              </React.Fragment>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
