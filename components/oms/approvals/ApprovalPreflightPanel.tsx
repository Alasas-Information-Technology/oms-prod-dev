"use client";

import { PreflightResult } from "@/lib/types/approval.types";
import { Check, X, ShieldAlert, ShieldCheck, Clock, Info } from "lucide-react";
import { cn } from "@/components/ui/utils";

interface ApprovalPreflightPanelProps {
  preflight: PreflightResult;
}

function getCheckStateIcon(state: string) {
  switch (state) {
    case "PASSED":
    case "VERIFIED":
      return <Check className="size-4 stroke-[2.5]" />;
    case "FAILED":
      return <X className="size-4 stroke-[2.5]" />;
    case "PENDING":
      return <Clock className="size-4" />;
    default:
      return <Info className="size-4" />;
  }
}

function getCheckStateClass(state: string) {
  switch (state) {
    case "PASSED":
    case "VERIFIED":
      return {
        card: "bg-muted/20 border-border text-foreground",
        iconWrap: "bg-emerald-50 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
        badge: "text-emerald-700 dark:text-emerald-400 font-bold",
      };
    case "FAILED":
      return {
        card: "bg-rose-50/30 border-rose-200 text-rose-950 dark:bg-rose-950/20 dark:border-rose-900 dark:text-rose-200",
        iconWrap: "bg-rose-50 text-rose-800 border border-rose-300 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800",
        badge: "text-rose-700 dark:text-rose-400 font-bold",
      };
    case "PENDING":
      return {
        card: "bg-amber-50/30 border-amber-200 text-amber-950 dark:bg-amber-950/20 dark:border-amber-900 dark:text-amber-200",
        iconWrap: "bg-amber-50 text-amber-800 border border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800",
        badge: "text-amber-700 dark:text-amber-400 font-bold",
      };
    default:
      return {
        card: "bg-muted/20 border-border text-muted-foreground",
        iconWrap: "bg-muted text-muted-foreground border border-border",
        badge: "text-muted-foreground font-semibold",
      };
  }
}

export function ApprovalPreflightPanel({ preflight }: ApprovalPreflightPanelProps) {
  const passedCount = preflight.checks.filter(
    (c) => c.state === "PASSED" || c.state === "VERIFIED"
  ).length;
  const totalCount = preflight.checks.length;

  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-xs flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-4 text-primary" />
          <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Preflight Verification</h3>
        </div>
        <span
          className={cn(
            "px-2.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase border",
            preflight.allPassed
              ? "bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
              : "bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800"
          )}
        >
          {preflight.allPassed ? `All Passed (${passedCount}/${totalCount})` : `Failed (${passedCount}/${totalCount})`}
        </span>
      </div>

      <div className="flex flex-col gap-2.5">
        {preflight.checks.map((check) => {
          const style = getCheckStateClass(check.state);
          return (
            <div
              key={check.code}
              className={cn(
                "flex items-center gap-3 px-3.5 py-2.5 rounded-lg border text-xs font-semibold transition-all hover:shadow-2xs",
                style.card
              )}
            >
              <div className={cn("flex size-7 shrink-0 items-center justify-center rounded-lg", style.iconWrap)}>
                {getCheckStateIcon(check.state)}
              </div>
              <span className="flex-1 leading-snug text-foreground/90">{check.label}</span>
              <span className={cn("text-[10px] uppercase tracking-wider", style.badge)}>
                {check.state}
              </span>
            </div>
          );
        })}
      </div>

      {preflight.blockingMessage && (
        <div className="mt-1 p-4 rounded-lg border border-rose-500/30 bg-rose-500/10 flex items-start gap-3 text-rose-950 dark:text-rose-200 shadow-2xs">
          <ShieldAlert className="size-5 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
          <div className="flex flex-col gap-1">
            <span className="font-bold text-xs uppercase tracking-wide">Action Blocked</span>
            <span className="text-xs leading-relaxed opacity-90">
              {preflight.blockingMessage}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

