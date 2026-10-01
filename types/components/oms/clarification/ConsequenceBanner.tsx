"use client";

import * as React from "react";
import { Info, UserCheck, ShieldAlert, ArrowRight, Send } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ConsequenceApprover {
  userId?: string;
  name: string;
  stage: string;
  role?: string;
}

export interface ConsequenceBannerProps {
  mode: "MORE_INFO" | "INFO_WITH_APPROVAL" | "AMEND" | string;
  consequenceText?: string;
  /**
   * For backwards compatibility with objects carrying summary/approvers
   */
  consequence?:
    | {
        summary: string;
        approvers?: ConsequenceApprover[];
      }
    | string;
  approvers?: ConsequenceApprover[];
  /**
   * 'receiving' = requester page ("Your changes will need approval again")
   * 'sending' = HR send-back page ("What happens when you send this")
   */
  direction?: "sending" | "receiving";
  className?: string;
}

export function ConsequenceBanner({
  mode,
  consequenceText,
  consequence,
  approvers,
  direction = "receiving",
  className,
}: ConsequenceBannerProps) {
  const isMoreInfo = mode === "MORE_INFO";
  const isAmend = mode === "AMEND";

  // Resolve consequence text
  const summaryText =
    consequenceText ||
    (typeof consequence === "string" ? consequence : consequence?.summary) ||
    "";

  // Resolve approvers list
  const approverList =
    approvers ||
    (typeof consequence === "object" && consequence !== null
      ? consequence.approvers
      : undefined) ||
    [];

  let icon = <Info className="size-4.5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />;
  let containerStyles =
    "bg-blue-500/5 border-blue-500/20 text-foreground dark:bg-blue-950/20 dark:border-blue-900/30";
  let title =
    direction === "sending"
      ? "Changes will need re-approval"
      : "Your changes will need approval again";

  if (isMoreInfo) {
    icon = direction === "sending" ? (
      <Send className="size-4.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
    ) : (
      <UserCheck className="size-4.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
    );
    containerStyles =
      "bg-emerald-500/5 border-emerald-500/20 text-foreground dark:bg-emerald-950/20 dark:border-emerald-900/30";
    title =
      direction === "sending"
        ? "No re-approval needed"
        : "Information-only clarification";
  } else if (isAmend) {
    icon = (
      <ShieldAlert className="size-4.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
    );
    containerStyles =
      "bg-amber-500/5 border-amber-500/20 text-foreground dark:bg-amber-950/20 dark:border-amber-900/30";
    title =
      direction === "sending"
        ? "Formal amendment cycle will start"
        : "Formal amendment cycle";
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
          {summaryText}
        </p>
        {approverList && approverList.length > 0 && (
          <div className="pt-2 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground/80">
              {direction === "sending" ? "Approval route on return:" : "Approval chain:"}
            </span>
            {approverList.map((approver, index) => (
              <React.Fragment key={approver.userId || approver.name}>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-background/80 border border-border/60 text-foreground text-[11.5px] font-medium shadow-2xs">
                  {approver.name}
                  {approver.stage && (
                    <span className="text-[10px] text-muted-foreground">
                      ({approver.stage.replace(/_/g, " ")})
                    </span>
                  )}
                </span>
                {index < approverList.length - 1 && (
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
