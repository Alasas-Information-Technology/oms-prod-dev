"use client";

import * as React from "react";
import { GitCompare, ArrowRight, Eye } from "lucide-react";
import { ClarificationDiffItem } from "@/types/clarification";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface ClarificationDiffPanelProps {
  diff?: ClarificationDiffItem[];
  isLoading?: boolean;
  className?: string;
}

export function ClarificationDiffPanel({
  diff = [],
  isLoading = false,
  className,
}: ClarificationDiffPanelProps) {
  const [selectedLongDiff, setSelectedLongDiff] =
    React.useState<ClarificationDiffItem | null>(null);

  if (!diff) {
    return null;
  }

  const isLongText = (text: string) => text && text.length > 80;

  return (
    <div
      className={cn(
        "rounded-xl border border-border/80 bg-card shadow-xs overflow-hidden transition-opacity duration-200",
        isLoading && "opacity-70",
        className
      )}
    >
      {/* Panel Header */}
      <div className="px-4 py-3 sm:px-5 sm:py-3.5 bg-muted/40 border-b border-border/70 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GitCompare className="size-4 text-primary" />
          <span className="text-xs font-bold uppercase tracking-wider text-foreground">
            Summary of Changes
          </span>
        </div>
        {diff.length > 0 && (
          <span className="text-xs text-muted-foreground font-semibold px-2 py-0.5 rounded-full bg-muted border border-border/60">
            {diff.filter((d) => d.changed).length} modified
          </span>
        )}
      </div>

      {/* Content / Diff Rows */}
      {diff.length === 0 ? (
        <div className="p-6 text-center text-xs text-muted-foreground">
          Nothing changed yet.
        </div>
      ) : (
        <div className="divide-y divide-border/40">
          {diff.map((item) => {
            const isChanged = item.changed;
            const isLong = isLongText(item.before) || isLongText(item.after);

            return (
              <div
                key={item.fieldKey}
                className={cn(
                  "p-3.5 sm:p-4 text-xs space-y-2.5 transition-colors",
                  isChanged
                    ? "border-l-3 border-l-primary bg-primary/[0.02]"
                    : "bg-muted/10 opacity-75"
                )}
              >
                {/* Field Label & Status Badge */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs sm:text-sm font-semibold text-foreground">
                    {item.label}
                  </span>
                  <span
                    className={cn(
                      "text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full",
                      isChanged
                        ? "bg-primary/10 text-primary border border-primary/20"
                        : "bg-muted text-muted-foreground border border-border/60"
                    )}
                  >
                    {isChanged ? "Modified" : "Unchanged"}
                  </span>
                </div>

                {/* Diff Comparison Row */}
                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2.5 pt-0.5 text-xs">
                  {/* Before */}
                  <div className="min-w-0 p-2.5 rounded-lg bg-muted/40 border border-border/60 text-muted-foreground">
                    <span className="text-[10px] uppercase font-bold block text-muted-foreground/70 mb-1">
                      Original
                    </span>
                    <p className="truncate line-clamp-2 leading-relaxed">
                      {item.before || <span className="italic">Empty</span>}
                    </p>
                  </div>

                  <ArrowRight className="size-3.5 text-muted-foreground/60 shrink-0" />

                  {/* After */}
                  <div
                    className={cn(
                      "min-w-0 p-2.5 rounded-lg border",
                      isChanged
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-200 font-semibold"
                        : "bg-muted/40 border-border/60 text-muted-foreground"
                    )}
                  >
                    <span
                      className={cn(
                        "text-[10px] uppercase font-bold block mb-1",
                        isChanged
                          ? "text-emerald-700 dark:text-emerald-400"
                          : "text-muted-foreground/70"
                      )}
                    >
                      Updated
                    </span>
                    <p className="truncate line-clamp-2 leading-relaxed">
                      {item.after || <span className="italic">Empty</span>}
                    </p>
                  </div>
                </div>

                {/* View Full Change Modal Trigger for long strings */}
                {isLong && (
                  <div className="pt-1 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setSelectedLongDiff(item)}
                      className="text-xs text-primary hover:underline inline-flex items-center gap-1 font-semibold"
                    >
                      <Eye className="size-3.5" />
                      <span>View full text comparison</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Side-by-Side Full Comparison Dialog */}
      <Dialog
        open={Boolean(selectedLongDiff)}
        onOpenChange={(open) => !open && setSelectedLongDiff(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">
              Comparison: {selectedLongDiff?.label}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Review full before and after text differences for this field.
            </DialogDescription>
          </DialogHeader>

          {selectedLongDiff && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 text-xs">
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Original Value
                </span>
                <div className="p-3.5 rounded-lg border border-border bg-muted/30 whitespace-pre-wrap leading-relaxed max-h-[300px] overflow-y-auto">
                  {selectedLongDiff.before}
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
                  Updated Value
                </span>
                <div className="p-3.5 rounded-lg border border-emerald-500/30 bg-emerald-500/5 whitespace-pre-wrap leading-relaxed max-h-[300px] overflow-y-auto font-medium">
                  {selectedLongDiff.after}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
