"use client";

import { PreflightResult } from "@/lib/types/approval.types";
import { Check, X, ShieldAlert, Clock, Info } from "lucide-react";
import { cn } from "@/components/ui/utils";

interface ApprovalPreflightPanelProps {
  preflight: PreflightResult;
}

function getCheckStateIcon(state: string) {
  switch (state) {
    case "PASSED":
    case "VERIFIED":
      return <Check className="size-4 text-emerald-600" />;
    case "FAILED":
      return <X className="size-4 text-red-600" />;
    case "PENDING":
      return <Clock className="size-4 text-amber-600" />;
    default:
      return <Info className="size-4 text-muted-foreground" />;
  }
}

function getCheckStateClass(state: string) {
  switch (state) {
    case "PASSED":
    case "VERIFIED":
      return "text-emerald-700 bg-emerald-50 border-emerald-200/50";
    case "FAILED":
      return "text-red-700 bg-red-50 border-red-200/50 font-medium";
    case "PENDING":
      return "text-amber-700 bg-amber-50 border-amber-200/50";
    default:
      return "text-muted-foreground bg-muted/50 border-border";
  }
}

export function ApprovalPreflightPanel({ preflight }: ApprovalPreflightPanelProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-semibold text-foreground">Preflight Checks</h3>
        {!preflight.allPassed && (
          <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-bold tracking-wide uppercase">
            Failed
          </span>
        )}
      </div>

      <div className="flex flex-col gap-2">
        {preflight.checks.map((check) => (
          <div
            key={check.code}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-md border text-sm",
              getCheckStateClass(check.state)
            )}
          >
            <div className="shrink-0">{getCheckStateIcon(check.state)}</div>
            <span className="flex-1 leading-none">{check.label}</span>
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">
              {check.state}
            </span>
          </div>
        ))}
      </div>

      {preflight.blockingMessage && (
        <div className="mt-2 p-3.5 rounded-lg border border-red-200 bg-red-50 flex items-start gap-3 text-red-900">
          <ShieldAlert className="size-5 shrink-0 text-red-600 mt-0.5" />
          <div className="flex flex-col gap-1">
            <span className="font-semibold text-sm">Action Blocked</span>
            <span className="text-sm leading-relaxed opacity-90">
              {preflight.blockingMessage}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
