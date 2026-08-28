"use client";

import * as React from "react";
import {
  CalendarCog,
  CheckCircle2,
  Lock,
  Clock,
  ShieldCheck,
  Info,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IBudgetPeriodDto } from "@/lib/types/budget.types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export interface ManagePeriodDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  periodData?: IBudgetPeriodDto;
}

export function ManagePeriodDialog({
  open,
  onOpenChange,
  periodData,
}: ManagePeriodDialogProps) {
  const [isProcessing, setIsProcessing] = React.useState(false);

  const periodCode = periodData?.code || "FY 2026";
  const isClosed = periodData?.status === "CLOSED";

  const handleAction = (actionName: string) => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onOpenChange(false);
      toast.success(`Action "${actionName}" for ${periodCode} processed successfully.`);
    }, 600);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl rounded-2xl p-6">
        <DialogHeader className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <CalendarCog className="size-5" />
            </div>
            <Badge
              variant="outline"
              className={cn(
                "font-semibold text-xs px-2.5 py-1",
                isClosed
                  ? "bg-zinc-500/10 text-zinc-700 dark:text-zinc-300 border-zinc-500/30"
                  : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
              )}
            >
              {isClosed ? "Period Closed" : "Period Open"}
            </Badge>
          </div>
          <DialogTitle className="text-lg font-bold font-display">
            Period Governance — {periodCode}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
            Financial period operations require strict three-level authorization per DIEZ government
            compliance standards.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Three-Level Approval Chain Timeline */}
          <div className="p-4 rounded-xl bg-muted/30 border border-border/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <ShieldCheck className="size-4 text-primary" />
                <span>Three-Level Approval Governance</span>
              </span>
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                {isClosed ? "Completed & Locked" : "Authorized"}
              </span>
            </div>

            <div className="space-y-2.5 pt-1">
              {/* Level 1: Finance Analyst */}
              <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-background/80 border border-border/40">
                <div className="flex items-center gap-2">
                  <div className="size-5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-[10px]">
                    1
                  </div>
                  <div>
                    <span className="font-semibold text-foreground">Finance Analyst</span>
                    <span className="text-[11px] text-muted-foreground block">
                      Reconciled baseline allocations
                    </span>
                  </div>
                </div>
                <span className="text-[11px] font-mono text-muted-foreground">1 Aug 09:10</span>
              </div>

              {/* Level 2: Finance Manager */}
              <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-background/80 border border-border/40">
                <div className="flex items-center gap-2">
                  <div className="size-5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-[10px]">
                    2
                  </div>
                  <div>
                    <span className="font-semibold text-foreground">Finance Manager</span>
                    <span className="text-[11px] text-muted-foreground">
                      Variance & scope review
                    </span>
                  </div>
                </div>
                <span className="text-[11px] font-mono text-muted-foreground">1 Aug 10:25</span>
              </div>

              {/* Level 3: Finance HOD */}
              <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-background/80 border border-border/40">
                <div className="flex items-center gap-2">
                  <div className="size-5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-[10px]">
                    3
                  </div>
                  <div>
                    <span className="font-semibold text-foreground">Finance HOD</span>
                    <span className="text-[11px] text-muted-foreground">
                      Final executive sign-off
                    </span>
                  </div>
                </div>
                <span className="text-[11px] font-mono text-muted-foreground">1 Aug 11:05</span>
              </div>
            </div>

            {/* Reopening Rule Notice */}
            <div className="flex items-start gap-2 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 text-[11px] leading-relaxed">
              <Info className="size-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
              <span>
                <strong>Audit Rule:</strong> Reopening a closed period requires the exact same
                three-level sign-off workflow (Analyst &rarr; Manager &rarr; HOD).
              </span>
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row items-center justify-between gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs h-9 rounded-xl"
          >
            Close Window
          </Button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {isClosed ? (
              <Button
                variant="default"
                size="sm"
                disabled={isProcessing}
                onClick={() => handleAction("Request Period Reopening")}
                className="rounded-xl text-xs h-9 font-semibold gap-1.5 w-full sm:w-auto"
              >
                <RotateCcw className="size-3.5" />
                <span>Request Reopening</span>
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isProcessing}
                  onClick={() => handleAction("Amend Period Parameters")}
                  className="rounded-xl text-xs h-9 font-semibold"
                >
                  Amend Period
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={isProcessing}
                  onClick={() => handleAction("Close Financial Period")}
                  className="rounded-xl text-xs h-9 font-semibold gap-1.5"
                >
                  <Lock className="size-3.5" />
                  <span>Close Period</span>
                </Button>
              </>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
