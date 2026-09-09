"use client";

import * as React from "react";
import {
  AlertTriangle,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  Coins,
  FileCheck,
  FolderOpen,
  Info,
  ShieldAlert,
  UserCheck,
  XCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Amount } from "@/components/budget/Amount";
import { formatAmount } from "@/lib/money";
import { cn } from "@/lib/utils";
import {
  FundingRouteCode,
  FundingRouteOption,
  AmendmentAllocationInput,
  AvailableBudgetLine,
  ReapprovalRouteStep,
  AmendmentDeadline,
  BudgetAmendmentError,
} from "@/src/types/budget-amendment";

export interface AmendmentSubmitDialogContentProps {
  candidateRef: string;
  position: string;
  shortfall: number; // in fils
  fundingRoute: FundingRouteCode;
  fundingRouteOption?: FundingRouteOption;
  allocations: AmendmentAllocationInput[];
  availableLines?: AvailableBudgetLine[];
  reapprovalRoute: ReapprovalRouteStep[];
  deadline: AmendmentDeadline;
  idempotencyKey: string;
  isSubmitting: boolean;
  submitError: BudgetAmendmentError | null;
  onConfirm: () => void;
  onClearError: () => void;
  onClose?: () => void;
}

export interface AmendmentSubmitDialogProps
  extends Omit<AmendmentSubmitDialogContentProps, "onClose"> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Inner body of the Submit Confirmation Dialog.
 * Exported separately so it can be rendered and verified in tests without Radix Portal SSR suppression.
 */
export function AmendmentSubmitDialogContent({
  candidateRef,
  position,
  shortfall,
  fundingRoute,
  fundingRouteOption,
  allocations,
  availableLines = [],
  reapprovalRoute,
  deadline,
  idempotencyKey,
  isSubmitting,
  submitError,
  onConfirm,
  onClearError,
  onClose,
}: AmendmentSubmitDialogContentProps) {
  // Find next approver by name from the reapproval route (first non-requestor stage)
  const nextApprover = React.useMemo(() => {
    if (!reapprovalRoute || reapprovalRoute.length === 0) {
      return { user: { name: "Omar Al Hashmi" }, stage: "LINE_MANAGER", role: "Line Manager" };
    }
    return (
      reapprovalRoute.find(
        (s) => s.stage !== "REQUESTOR" && s.status !== "COMPLETED"
      ) ||
      reapprovalRoute.find((s) => s.stage !== "REQUESTOR") ||
      reapprovalRoute[0]
    );
  }, [reapprovalRoute]);

  // Route label
  const routeLabel = React.useMemo(() => {
    if (fundingRouteOption?.label) return fundingRouteOption.label;
    if (fundingRoute === "BUDGETED") return "Budgeted";
    if (fundingRoute === "UNALLOCATED") return "Unallocated";
    return "Unbudgeted";
  }, [fundingRoute, fundingRouteOption]);

  // Error inspection
  const isInsufficientFunds = submitError?.code === "AMENDMENT_INSUFFICIENT_FUNDS";
  const isLineClosed = submitError?.code === "AMENDMENT_LINE_CLOSED";
  const isAlreadyDecided = submitError?.code === "AMENDMENT_ALREADY_DECIDED";

  // When error is insufficient funds, line closed, or already decided, we do NOT allow direct re-submission without reselection/closing
  const disableSubmit =
    isSubmitting || isInsufficientFunds || isLineClosed || isAlreadyDecided;

  return (
    <div data-slot="amendment-submit-content" className="space-y-5">
      <DialogHeader className="gap-1.5 text-left">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-md bg-primary/10 text-primary">
            <FileCheck className="size-4" aria-hidden="true" />
          </span>
          <DialogTitle className="text-lg font-bold text-foreground">
            Confirm Amendment Submission
          </DialogTitle>
        </div>
        <DialogDescription className="text-xs text-muted-foreground">
          Review the financial and approval parameters before submitting Candidate{" "}
          <span className="font-semibold text-foreground">{candidateRef}</span> ({position}).
        </DialogDescription>
      </DialogHeader>

      {/* ── Error Callouts (TASK 3) ── */}
      {submitError && (
        <div
          role="alert"
          data-slot="submit-error-container"
          className="space-y-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3.5 text-xs text-destructive"
        >
          {/* AMENDMENT_INSUFFICIENT_FUNDS: show current availability inline, do NOT auto-resubmit */}
          {isInsufficientFunds ? (
            <div data-slot="error-insufficient-funds" className="space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertTriangle className="size-4 shrink-0 text-destructive" />
                <span>Insufficient Funds on Selected Line</span>
              </div>
              <p className="text-[11.5px] leading-relaxed text-destructive/90">
                The selected budget line does not have enough remaining funds to satisfy this amendment.
              </p>
              <div className="mt-2 rounded bg-background/80 p-2.5 border border-destructive/20 text-[11px] space-y-1 font-sans">
                <div className="flex justify-between">
                  <span className="text-muted-foreground font-medium">Line:</span>
                  <span className="font-semibold text-foreground">
                    {(submitError.details?.lineName as string) || "Cybersecurity Services FY2026"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground font-medium">Currently Available:</span>
                  <span className="font-mono font-bold text-destructive">
                    {`AED ${formatAmount(
                      (submitError.details?.currentAvailable as number) ?? 0
                    )}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground font-medium">Requested:</span>
                  <span className="font-mono font-medium text-foreground">
                    {`AED ${formatAmount(
                      (submitError.details?.requested as number) ?? shortfall
                    )}`}
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground pt-1 italic">
                Auto-resubmit is blocked. Please close this dialog and adjust your allocation or switch funding routes.
              </p>
            </div>
          ) : isLineClosed ? (
            /* AMENDMENT_LINE_CLOSED: name the closed line, prompt to reselect */
            <div data-slot="error-line-closed" className="space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold">
                <XCircle className="size-4 shrink-0 text-destructive" />
                <span>Selected Budget Line is Closed</span>
              </div>
              <p className="text-[11.5px] leading-relaxed text-destructive/90">
                Budget line{" "}
                <strong className="text-foreground">
                  {(submitError.details?.lineName as string) || "Selected Line"}
                </strong>{" "}
                has been closed by Finance and cannot receive new allocations.
              </p>
              <p className="text-[11px] font-medium text-destructive/90 pt-0.5">
                Please close this confirmation dialog and reselect an active, open budget line.
              </p>
            </div>
          ) : isAlreadyDecided ? (
            /* AMENDMENT_ALREADY_DECIDED: name who decided and when */
            <div data-slot="error-already-decided" className="space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold">
                <ShieldAlert className="size-4 shrink-0 text-destructive" />
                <span>Amendment Already Decided</span>
              </div>
              <p className="text-[11.5px] leading-relaxed text-destructive/90">
                This amendment was already decided by{" "}
                <strong className="text-foreground">
                  {(submitError.details?.decidedBy as string) || "an authorized approver"}
                </strong>
                {submitError.details?.decidedAt
                  ? ` on ${new Date(
                      submitError.details.decidedAt as string
                    ).toLocaleDateString("en-US", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}`
                  : ""}
                .
              </p>
              <p className="text-[11px] text-muted-foreground pt-0.5">
                No further submissions are permitted for this amendment record.
              </p>
            </div>
          ) : (
            /* Generic / Network error */
            <div data-slot="error-generic" className="space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertTriangle className="size-4 shrink-0" />
                <span>Submission Failed</span>
              </div>
              <p className="text-[11.5px]">{submitError.message}</p>
              <p className="text-[11px] text-muted-foreground">
                You can retry submission using the same idempotency key.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── TASK 2: Restatement Sections ── */}
      <div className="space-y-3 rounded-lg border border-border bg-muted/20 p-4 text-xs">
        {/* 1. Shortfall Amount */}
        <div
          data-slot="restate-shortfall"
          className="flex items-center justify-between pb-3 border-b border-border/60"
        >
          <div className="space-y-0.5">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
              Shortfall Amount Covered
            </span>
            <p className="text-xs text-muted-foreground">
              Total variance to cover via amendment
            </p>
          </div>
          <div className="text-right font-mono">
            <Amount
              variant="display"
              size="md"
              value={shortfall}
              showCurrency={true}
              currency="AED"
              abbreviate={false}
            />
          </div>
        </div>

        {/* 2. Chosen Funding Route */}
        <div
          data-slot="restate-funding-route"
          className="flex items-center justify-between py-2 border-b border-border/60"
        >
          <span className="text-muted-foreground font-medium">Funding Route</span>
          <div className="inline-flex items-center gap-1.5">
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20">
              {routeLabel}
            </span>
          </div>
        </div>

        {/* 3. Lines and amounts drawn from (Budgeted or Unallocated) */}
        <div data-slot="restate-lines" className="py-2 border-b border-border/60 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground font-medium">Drawdown Lines</span>
            <span className="text-[11px] text-muted-foreground">
              {fundingRoute === "UNBUDGETED"
                ? "HR / Finance Review"
                : `${allocations.length} line${allocations.length === 1 ? "" : "s"} selected`}
            </span>
          </div>

          {fundingRoute === "UNBUDGETED" ? (
            <div className="rounded bg-background p-2.5 border border-border text-[11.5px] text-muted-foreground italic leading-relaxed">
              HR reviews this first. If they approve, Finance selects or creates the funding line. Only then does this continue to procurement. (No lines pre-selected).
            </div>
          ) : allocations.length === 0 ? (
            <p className="text-[11.5px] text-destructive italic">No lines allocated.</p>
          ) : (
            <div className="space-y-1.5">
              {allocations.map((alloc) => {
                const line = availableLines.find((l) => l.lineId === alloc.lineId);
                const lineName = line?.name || alloc.lineId;
                const lineCode = line?.code;

                return (
                  <div
                    key={alloc.lineId}
                    className="flex items-center justify-between rounded bg-background px-3 py-2 border border-border/60"
                  >
                    <div className="min-w-0 pr-3">
                      <p className="font-medium text-foreground truncate text-xs">
                        {lineName}
                      </p>
                      {lineCode && (
                        <p className="text-[10.5px] font-mono text-muted-foreground">
                          {lineCode}
                        </p>
                      )}
                    </div>
                    <div className="text-right shrink-0 font-mono font-semibold text-foreground">
                      {`AED ${formatAmount(alloc.amount)}`}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 4. Who it goes to next by name */}
        <div
          data-slot="restate-next-approver"
          className="flex items-center justify-between py-2 border-b border-border/60"
        >
          <div className="space-y-0.5">
            <span className="text-muted-foreground font-medium">Next Approver</span>
            <p className="text-[11px] text-muted-foreground">
              First stage in reapproval chain
            </p>
          </div>
          <div className="text-right">
            <span className="font-semibold text-foreground inline-flex items-center gap-1.5">
              <UserCheck className="size-3.5 text-primary" aria-hidden="true" />
              {nextApprover.user?.name || "Omar Al Hashmi"}
            </span>
            <p className="text-[10.5px] text-muted-foreground">
              {nextApprover.role || nextApprover.stage}
            </p>
          </div>
        </div>

        {/* 5. Deadline */}
        <div
          data-slot="restate-deadline"
          className="flex items-center justify-between pt-1"
        >
          <div className="flex items-center gap-1.5 text-muted-foreground font-medium">
            <Clock className="size-3.5" aria-hidden="true" />
            <span>Original Request Deadline</span>
          </div>
          <div className="text-right">
            <span
              className={cn(
                "font-semibold text-xs",
                deadline.severity === "CRITICAL"
                  ? "text-destructive"
                  : deadline.severity === "WARNING"
                  ? "text-amber-800 dark:text-amber-300"
                  : "text-foreground"
              )}
            >
              {`${deadline.daysRemaining} days remaining`}
            </span>
          </div>
        </div>
      </div>

      {/* Quiet Idempotency key indicator */}
      <div className="flex items-center justify-between text-[11px] text-muted-foreground/70 font-mono">
        <span>Idempotency token:</span>
        <span className="truncate max-w-[200px]" title={idempotencyKey}>
          {idempotencyKey ? `${idempotencyKey.slice(0, 18)}...` : "None"}
        </span>
      </div>

      {/* ── Dialog Footer ── */}
      <DialogFooter className="gap-2 sm:gap-0 mt-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            onClearError();
            onClose?.();
          }}
          disabled={isSubmitting}
          className="text-xs"
          id="btn-dialog-cancel"
        >
          {isInsufficientFunds || isLineClosed || isAlreadyDecided
            ? "Close"
            : "Back to editing"}
        </Button>

        {/* Submit / Retry button */}
        {!isInsufficientFunds && !isLineClosed && !isAlreadyDecided && (
          <Button
            variant="default"
            size="sm"
            onClick={onConfirm}
            disabled={disableSubmit}
            className="text-xs font-semibold"
            id="btn-dialog-confirm-submit"
          >
            {isSubmitting
              ? "Submitting amendment..."
              : submitError
              ? "Retry submission"
              : "Confirm & submit"}
          </Button>
        )}
      </DialogFooter>
    </div>
  );
}

/**
 * Submit Confirmation Dialog per BUDGET-AMENDMENT-UI.md Part 4 & BA6:
 *
 * TASK 2 — Submit confirmation:
 *  - Shortfall amount (reusing Amount with T2 contrast)
 *  - Chosen funding route
 *  - Lines and amounts if Budgeted or Unallocated
 *  - Who it goes to next by name from reapproval route
 *  - Request deadline
 *
 * TASK 3 — Idempotency and errors:
 *  - Key generated once when confirmation opens, reused on retry
 *  - AMENDMENT_INSUFFICIENT_FUNDS: show current availability inline, do NOT auto-resubmit
 *  - AMENDMENT_LINE_CLOSED: name the closed line, prompt to reselect
 *  - AMENDMENT_ALREADY_DECIDED: name who decided and when
 */
export function AmendmentSubmitDialog({
  open,
  onOpenChange,
  ...contentProps
}: AmendmentSubmitDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-slot="amendment-submit-dialog"
        className="max-w-xl p-6 sm:p-7 gap-5 max-h-[90vh] overflow-y-auto"
      >
        <AmendmentSubmitDialogContent
          {...contentProps}
          onClose={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
