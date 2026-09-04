"use client";

import * as React from "react";
import {
  CalendarCog,
  CheckCircle2,
  Lock,
  Unlock,
  Clock,
  ShieldCheck,
  Info,
  RotateCcw,
  Edit3,
  ArrowLeft,
  FileText,
  CircleDot,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { IBudgetPeriodDto } from "@/lib/types/budget.types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export interface ManagePeriodDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  periodData?: IBudgetPeriodDto;
  /** Total budget lines in the current scope — used in confirmation copy */
  affectedLinesCount?: number;
  /** Open requests in the current scope — used in confirmation copy */
  openRequestsCount?: number;
}

type DialogView = "main" | "confirm-close" | "confirm-reopen";

function formatTimestamp(isoString?: string | null): string {
  if (!isoString) return "—";
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } catch {
    return isoString;
  }
}

export function ManagePeriodDialog({
  open,
  onOpenChange,
  periodData,
  affectedLinesCount = 12,
  openRequestsCount = 7,
}: ManagePeriodDialogProps) {
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [view, setView] = React.useState<DialogView>("main");

  // Reset to main view when dialog closes
  React.useEffect(() => {
    if (!open) setView("main");
  }, [open]);

  const periodCode = periodData?.code || "FY 2026";
  const isClosed = periodData?.status === "CLOSED";
  const isPendingApproval = periodData?.status === "AMENDMENT_PENDING";
  const approval = periodData?.threeLevelApproval;
  const lastAmended = periodData?.lastAmendedAt;

  const handleAmend = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onOpenChange(false);
      toast.success(`Amendment request for ${periodCode} submitted successfully.`);
    }, 600);
  };

  const handleConfirmClose = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onOpenChange(false);
      toast.success(`${periodCode} has been closed. All ${affectedLinesCount} budget lines are now locked.`);
    }, 700);
  };

  const handleConfirmReopen = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onOpenChange(false);
      toast.success(`Reopening request for ${periodCode} submitted for three-level approval.`);
    }, 700);
  };

  // ── Confirmation: Close Period ──────────────────────────────────────────────
  if (view === "confirm-close") {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md rounded-xl p-0 overflow-hidden [&>button.absolute]:hidden">
          <div className="p-6 space-y-5">
            <div className="flex items-start gap-4">
              <div className="size-10 rounded-lg bg-rose-500/10 flex items-center justify-center shrink-0">
                <Lock className="size-5 text-rose-600 dark:text-rose-400" />
              </div>
              <div>
                <h2 className="text-base font-bold text-foreground">Close {periodCode}?</h2>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  This is a significant action. Closing the period locks all fund movements
                  until a three-level approval process reopens it.
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-border/60 bg-muted/30 divide-y divide-border/40 text-xs overflow-hidden">
              <div className="px-4 py-3 flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <FileText className="size-3.5" /> Budget lines affected
                </span>
                <span className="font-semibold text-foreground tabular-nums">{affectedLinesCount}</span>
              </div>
              <div className="px-4 py-3 flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <CircleDot className="size-3.5" /> Open requests that will be frozen
                </span>
                <span className="font-semibold text-amber-700 dark:text-amber-400 tabular-nums">{openRequestsCount}</span>
              </div>
            </div>

            <div className="flex items-start gap-2 rounded-lg bg-amber-500/10 border border-amber-500/20 px-3 py-2.5 text-[11px] leading-relaxed text-amber-900 dark:text-amber-200">
              <Info className="size-3.5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
              <span>
                <strong>Governance rule:</strong> Reopening requires the same three-level approval
                (Analyst → Manager → HOD). This cannot be undone without that approval chain.
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 pt-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setView("main")}
                className="gap-1.5 text-xs"
              >
                <ArrowLeft className="size-3.5" />
                Back
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={isProcessing}
                onClick={handleConfirmClose}
                className="text-xs font-semibold gap-1.5 px-4"
              >
                <Lock className="size-3.5" />
                {isProcessing ? "Closing…" : `Close ${periodCode}`}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // ── Confirmation: Reopen Period ─────────────────────────────────────────────
  if (view === "confirm-reopen") {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md rounded-xl p-0 overflow-hidden [&>button.absolute]:hidden">
          <div className="p-6 space-y-5">
            <div className="flex items-start gap-4">
              <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Unlock className="size-5 text-primary" />
              </div>
              <div>
                <h2 className="text-base font-bold text-foreground">Request to Reopen {periodCode}?</h2>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  Reopening requires the full three-level approval process before any fund movements
                  can resume.
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-border/60 bg-muted/30 divide-y divide-border/40 text-xs overflow-hidden">
              <div className="px-4 py-3 flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <FileText className="size-3.5" /> Budget lines currently locked
                </span>
                <span className="font-semibold text-foreground tabular-nums">{affectedLinesCount}</span>
              </div>
              <div className="px-4 py-3 flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <ShieldCheck className="size-3.5" /> Approval levels required
                </span>
                <span className="font-semibold text-foreground tabular-nums">3</span>
              </div>
            </div>

            <div className="flex items-start gap-2 rounded-lg bg-muted/50 border border-border/60 px-3 py-2.5 text-[11px] leading-relaxed text-muted-foreground">
              <Info className="size-3.5 shrink-0 mt-0.5" />
              <span>
                Submitting this request will initiate the three-level approval workflow.
                Fund movements remain locked until all three levels sign off.
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 pt-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setView("main")}
                className="gap-1.5 text-xs"
              >
                <ArrowLeft className="size-3.5" />
                Back
              </Button>
              <Button
                variant="default"
                size="sm"
                disabled={isProcessing}
                onClick={handleConfirmReopen}
                className="text-xs font-semibold gap-1.5 px-4"
              >
                <RotateCcw className="size-3.5" />
                {isProcessing ? "Submitting…" : "Submit Reopen Request"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // ── Main View ───────────────────────────────────────────────────────────────
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl rounded-xl p-0 overflow-hidden max-h-[90vh] flex flex-col [&>button.absolute]:hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-border/40 shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <CalendarCog className="size-4.5" />
              </div>
              <div>
                <DialogTitle className="text-sm font-bold font-display leading-tight">
                  Period Governance
                </DialogTitle>
                <p className="text-xs text-muted-foreground">{periodCode} · Financial period operations</p>
              </div>
            </div>
            <Badge
              variant="outline"
              className={cn(
                "font-semibold text-xs px-2.5 py-0.5 gap-1.5 shadow-xs",
                isClosed
                  ? "bg-zinc-500/10 text-zinc-700 dark:text-zinc-300 border-zinc-500/30"
                  : isPendingApproval
                  ? "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30"
                  : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
              )}
            >
              <span
                className={cn(
                  "size-1.5 rounded-full shrink-0",
                  isClosed ? "bg-zinc-400" : isPendingApproval ? "bg-amber-500" : "bg-emerald-500"
                )}
              />
              {isClosed ? "Closed" : isPendingApproval ? "Closing — Pending Approval" : "Open"}
            </Badge>
          </div>

          {/* Period meta row */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
            <span className="font-semibold text-foreground">{periodCode}</span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Clock className="size-3" />
              Last amended {formatTimestamp(lastAmended)}
            </span>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* ── Three-Level Approval Chain ── */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <ShieldCheck className="size-3.5 text-primary" />
                Three-Level Approval
              </span>
              {approval?.isComplete ? (
                <Badge
                  variant="outline"
                  className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20 text-[10px] font-semibold gap-1 py-0 px-1.5"
                >
                  <CheckCircle2 className="size-2.5" /> Completed
                </Badge>
              ) : (
                <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                  Level {approval?.currentLevel ?? 1} of {approval?.totalLevels ?? 3}
                </span>
              )}
            </div>

            <div className="space-y-2">
              {approval?.steps?.length ? (
                approval.steps.map((step, i) => {
                  const isApproved = step.status === "APPROVED";
                  const isPending = step.status === "PENDING";
                  return (
                    <div
                      key={step.level}
                      className={cn(
                        "relative flex items-start gap-3 p-3 rounded-lg border text-xs",
                        isApproved
                          ? "border-emerald-500/20 bg-emerald-500/5"
                          : isPending
                          ? "border-amber-500/20 bg-amber-500/5"
                          : "border-border/50 bg-muted/20"
                      )}
                    >
                      <div
                        className={cn(
                          "size-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5",
                          isApproved
                            ? "bg-emerald-500 text-white"
                            : isPending
                            ? "bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/40"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {step.level}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="font-semibold text-foreground truncate">
                            {step.roleDisplayName || step.role}
                          </span>
                          <span className="text-[10px] text-muted-foreground whitespace-nowrap font-mono shrink-0">
                            {isApproved ? formatTimestamp(step.approvedAt) : isPending ? "Awaiting" : "—"}
                          </span>
                        </div>
                        {step.approverName && (
                          <span className="text-[11px] text-muted-foreground">{step.approverName}</span>
                        )}
                        {step.comments && isApproved && (
                          <p className="text-[10px] text-muted-foreground/80 mt-0.5 italic leading-relaxed">
                            &quot;{step.comments}&quot;
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                // Fallback static steps
                [
                  { level: 1, label: "Finance Analyst Review", time: "1 Aug 09:10" },
                  { level: 2, label: "Finance Manager Endorsement", time: "1 Aug 10:25" },
                  { level: 3, label: "Finance HOD Executive Approval", time: "1 Aug 11:05" },
                ].map((s) => (
                  <div
                    key={s.level}
                    className="flex items-center justify-between p-2.5 rounded-lg border border-emerald-500/20 bg-emerald-500/5 text-xs"
                  >
                    <span className="font-medium flex items-center gap-2">
                      <span className="size-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold">
                        {s.level}
                      </span>
                      {s.label}
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground">{s.time}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <Separator className="opacity-40" />

          {/* ── Governance Rule ── */}
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-muted/50 border border-border/60 text-[11px] leading-relaxed text-muted-foreground">
            <Info className="size-3.5 shrink-0 text-primary mt-0.5" />
            <p>
              <strong className="text-foreground font-semibold">Governance rule:</strong>{" "}
              {periodData?.reopenGovernanceRule ??
                "Reopening a closed period requires the full three-level approval process (Analyst → Manager → HOD)."}
            </p>
          </div>
        </div>

        {/* Footer actions — gated by period state */}
        <div className="px-6 py-4 border-t border-border/40 shrink-0">
          <div className="flex items-center justify-between gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs"
            >
              Close
            </Button>

            <div className="flex items-center gap-2">
              {isClosed ? (
                <Button
                  variant="default"
                  size="sm"
                  disabled={isProcessing}
                  onClick={() => setView("confirm-reopen")}
                  className="text-xs font-semibold gap-1.5"
                >
                  <RotateCcw className="size-3.5" />
                  Request Reopening
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isProcessing || !periodData?.canAmend}
                    onClick={handleAmend}
                    className="text-xs font-semibold gap-1"
                    title={!periodData?.canAmend ? "Amendments are not available for this period" : undefined}
                  >
                    <Edit3 className="size-3" />
                    Amend Period
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isProcessing || !periodData?.canClose}
                    onClick={() => setView("confirm-close")}
                    className="text-xs font-semibold gap-1 text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border-rose-200 dark:border-rose-900 disabled:opacity-40"
                    title={!periodData?.canClose ? "Period cannot be closed at this time" : undefined}
                  >
                    <Lock className="size-3" />
                    Close Period
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
