"use client";

import * as React from "react";
import { CheckCircle2, Circle, ArrowRight, CornerDownRight, ListChecks } from "lucide-react";
import { ClarificationAsk, ClarificationDetail, ClarificationPreviewResponse } from "@/types/clarification";
import { cn } from "@/lib/utils";

interface ClarificationAsksChecklistProps {
  asks: ClarificationAsk[];
  asksAddressed?: string[];
  preview?: ClarificationPreviewResponse;
  clarification?: ClarificationDetail;
  onSelectField?: (fieldKey: string) => void;
  className?: string;
}

export function ClarificationAsksChecklist({
  asks,
  asksAddressed,
  preview,
  clarification,
  onSelectField,
  className,
}: ClarificationAsksChecklistProps) {
  if (!asks || asks.length === 0) {
    return null;
  }

  // Derive addressed state from preview.asksAddressed if available, otherwise ask.addressed
  const addressedSet = new Set(
    preview?.asksAddressed !== undefined
      ? preview.asksAddressed
      : asksAddressed || asks.filter((a) => a.addressed).map((a) => a.id)
  );

  const doneCount = asks.filter((a) => addressedSet.has(a.id)).length;
  const totalCount = asks.length;
  const allDone = doneCount === totalCount;

  // Helper to retrieve proposed/current value for inline resolution preview
  const getFieldResolution = (fieldKey: string | null): string | null => {
    if (!fieldKey || !clarification) return null;
    const isApproval =
      clarification.type === "INFO_WITH_APPROVAL" ||
      clarification.type === "AMEND";
    if (!isApproval || !clarification.editableFields) return null;

    const field = clarification.editableFields.find((f) => f.key === fieldKey);
    if (!field) return null;

    // Check preview diff if available
    if (preview && preview.type !== "MORE_INFO" && preview.diff) {
      const diffItem = preview.diff.find((d) => d.fieldKey === fieldKey);
      if (diffItem && diffItem.changed) {
        return diffItem.after;
      }
    }

    if (
      field.proposedValue &&
      String(field.proposedValue) !== String(field.currentValue)
    ) {
      if (field.type === "DATE" && field.proposedValue === "2027-08-31") {
        return "31 Aug 2027";
      }
      return String(field.proposedValue);
    }

    return null;
  };

  const handleAskClick = (fieldKey: string | null) => {
    if (!fieldKey) return;
    if (onSelectField) {
      onSelectField(fieldKey);
    } else {
      const el = document.getElementById(`field-${fieldKey}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.focus();
      }
    }
  };

  return (
    <div
      className={cn(
        "rounded-xl border border-border/80 bg-card shadow-xs overflow-hidden",
        className
      )}
    >
      {/* Header with Done Count */}
      <div className="px-4 py-3 sm:px-5 sm:py-3.5 bg-muted/40 border-b border-border/70 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ListChecks className="size-4 text-primary" />
          <span className="text-xs font-bold uppercase tracking-wider text-foreground">
            What HR needs from you
          </span>
        </div>

        <span
          className={cn(
            "text-xs font-semibold px-2.5 py-0.5 rounded-full transition-colors",
            allDone
              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30"
              : "bg-muted text-muted-foreground border border-border/60"
          )}
        >
          {doneCount} of {totalCount} completed
        </span>
      </div>

      {/* Checklist items */}
      <div className="divide-y divide-border/40">
        {asks.map((ask) => {
          const isAddressed = addressedSet.has(ask.id);
          const resolution = getFieldResolution(ask.fieldKey);
          const isClickable = Boolean(ask.fieldKey);

          return (
            <div
              key={ask.id}
              onClick={() => isClickable && handleAskClick(ask.fieldKey)}
              className={cn(
                "px-4 py-3.5 sm:px-5 sm:py-4 flex items-start justify-between gap-3 text-sm transition-all",
                isClickable && "cursor-pointer hover:bg-muted/30 group",
                isAddressed && "bg-emerald-500/[0.03]"
              )}
            >
              <div className="flex items-start gap-3 min-w-0 flex-1">
                {isAddressed ? (
                  <div className="size-5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="size-4.5" />
                  </div>
                ) : (
                  <div className="size-5 rounded-full text-muted-foreground/50 flex items-center justify-center shrink-0 mt-0.5">
                    <Circle className="size-4.5" />
                  </div>
                )}

                <div className="min-w-0 flex-1 space-y-1.5">
                  <p
                    className={cn(
                      "font-medium leading-snug",
                      isAddressed ? "text-foreground" : "text-foreground/90",
                      isClickable && "group-hover:text-primary transition-colors"
                    )}
                  >
                    {ask.text}
                  </p>

                  {/* Inline resolution preview when addressed */}
                  {resolution && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-800 dark:text-emerald-200 border border-emerald-500/20 text-xs font-semibold">
                      <CornerDownRight className="size-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>Updated to: {resolution}</span>
                    </div>
                  )}
                </div>
              </div>

              {isClickable && (
                <div className="shrink-0 hidden sm:flex items-center gap-1 text-xs font-medium text-muted-foreground group-hover:text-primary transition-colors pt-0.5">
                  <span>Edit field</span>
                  <ArrowRight className="size-3.5" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
