"use client";

import * as React from "react";
import { EnvelopeStatus } from "@/src/types/vendor-documents";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Send,
  FileCheck2,
  FileSignature,
  Receipt,
  Clock,
  ShieldCheck,
  User,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface SubmitConfirmationModalContentProps {
  candidateName: string;
  candidateRef: string;
  position: string;
  approvedCount: number;
  pendingCount: number;
  totalRequired: number;
  signatureStatus: EnvelopeStatus;
  idempotencyKey: string;
  onClose: () => void;
  onConfirmSubmit: () => void;
  isSubmitting?: boolean;
}

/**
 * Inner content component for Submit Confirmation.
 * Cleanly separated for direct SSR unit testing.
 */
export function SubmitConfirmationModalContent({
  candidateName,
  candidateRef,
  position,
  approvedCount,
  pendingCount,
  totalRequired,
  signatureStatus,
  idempotencyKey,
  onClose,
  onConfirmSubmit,
  isSubmitting = false,
}: SubmitConfirmationModalContentProps) {
  const isSignatureComplete = signatureStatus === "SIGNED";

  return (
    <>
      <DialogHeader className="space-y-1 text-left border-b border-border/50 pb-3">
        <div className="flex items-center gap-2">
          <Send className="size-4.5 text-teal-600 dark:text-teal-400" />
          <DialogTitle className="text-base sm:text-lg font-semibold text-foreground">
            Confirm Submission to DIEZ
          </DialogTitle>
        </div>
        <DialogDescription className="text-xs text-muted-foreground">
          Please review the compliance summary before transmitting documents for DIEZ security and HR clearance.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 py-2 text-xs">
        {/* Restate Candidate per §5 Task 2 */}
        <div className="p-3 rounded-lg bg-muted/20 border border-border/60 space-y-1.5">
          <span className="text-[10px] uppercase text-muted-foreground font-semibold tracking-wider">
            Candidate Details
          </span>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="size-4 text-teal-600 dark:text-teal-400 shrink-0" />
              <div>
                <p className="font-semibold text-sm text-foreground">
                  {candidateName}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {position} · {candidateRef}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Restate Approved vs Pending Documents & Signature Status per §5 Task 2 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div className="p-3 rounded-lg bg-muted/15 border border-border/50 space-y-1">
            <span className="text-[10px] uppercase text-muted-foreground font-semibold flex items-center gap-1">
              <FileCheck2 className="size-3.5 text-teal-600 dark:text-teal-400" />
              Document Status
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold text-foreground tabular-nums">
                {approvedCount}
              </span>
              <span className="text-muted-foreground text-xs">
                {`of ${totalRequired} approved`}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              {pendingCount > 0
                ? `${pendingCount} document${pendingCount === 1 ? "" : "s"} awaiting review`
                : "All required documents approved"}
            </p>
          </div>

          <div className="p-3 rounded-lg bg-muted/15 border border-border/50 space-y-1">
            <span className="text-[10px] uppercase text-muted-foreground font-semibold flex items-center gap-1">
              <FileSignature className="size-3.5 text-teal-600 dark:text-teal-400" />
              E-Signature
            </span>
            <div className="flex items-center gap-1.5 pt-0.5">
              <span
                className={cn(
                  "font-semibold text-xs",
                  isSignatureComplete
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-amber-600 dark:text-amber-400"
                )}
              >
                {isSignatureComplete ? "Signed and executed" : "Pending signature"}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              {isSignatureComplete
                ? "DIEZ NDA executed by candidate"
                : "Candidate signature required"}
            </p>
          </div>
        </div>

        {/* Restate Receipt Issuance per §5 Task 2 */}
        <div className="p-3 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-800 dark:text-teal-300 space-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-xs">
            <Receipt className="size-4 shrink-0 text-teal-600 dark:text-teal-400" />
            <span>Audit Receipt Issuance</span>
          </div>
          <p className="text-[11px] leading-relaxed text-teal-900/90 dark:text-teal-200/90">
            A formal, tamper-evident submission receipt with a unique DIEZ audit reference will be generated immediately upon confirmation.
          </p>
        </div>

        {/* Idempotency Key Notice (§5 Task 3) */}
        <div className="flex items-center justify-between text-[10px] text-muted-foreground/80 px-1">
          <span>Idempotency Key</span>
          <span className="truncate max-w-[200px] select-all">{idempotencyKey}</span>
        </div>
      </div>

      <DialogFooter className="flex items-center justify-between sm:justify-end gap-2 pt-2 border-t border-border/40">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onClose}
          disabled={isSubmitting}
          className="text-xs"
        >
          Cancel
        </Button>

        <Button
          type="button"
          variant="default"
          size="sm"
          onClick={onConfirmSubmit}
          disabled={isSubmitting}
          className="text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white cursor-pointer shadow-xs"
        >
          {isSubmitting ? (
            <>
              <Clock className="size-3.5 mr-1.5 animate-spin" />
              Submitting to DIEZ...
            </>
          ) : (
            <>
              <Send className="size-3.5 mr-1.5" />
              Confirm & submit
            </>
          )}
        </Button>
      </DialogFooter>
    </>
  );
}

export interface SubmitConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidateName: string;
  candidateRef: string;
  position: string;
  approvedCount: number;
  pendingCount: number;
  totalRequired: number;
  signatureStatus: EnvelopeStatus;
  idempotencyKey: string;
  onConfirmSubmit: () => void;
  isSubmitting?: boolean;
}

/**
 * Submit Confirmation Modal per VENDOR-DOCUMENTS-UI.md Part 5 & VD6.
 * Restates candidate, approved vs pending, signature status, receipt generation,
 * and passes the idempotency key generated on open.
 */
export function SubmitConfirmationModal({
  isOpen,
  onClose,
  candidateName,
  candidateRef,
  position,
  approvedCount,
  pendingCount,
  totalRequired,
  signatureStatus,
  idempotencyKey,
  onConfirmSubmit,
  isSubmitting,
}: SubmitConfirmationModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isSubmitting && onClose()}>
      <DialogContent className="sm:max-w-md bg-card border-border shadow-2xl">
        <SubmitConfirmationModalContent
          candidateName={candidateName}
          candidateRef={candidateRef}
          position={position}
          approvedCount={approvedCount}
          pendingCount={pendingCount}
          totalRequired={totalRequired}
          signatureStatus={signatureStatus}
          idempotencyKey={idempotencyKey}
          onClose={onClose}
          onConfirmSubmit={onConfirmSubmit}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
}
