"use client";

import * as React from "react";
import { Receipt, CheckCircle2, Download, ExternalLink, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatAuditTimestamp } from "@/src/lib/vendor-documents/formatters";

interface SubmissionReceiptCardProps {
  receiptNumber: string;
  receiptDownloadUrl?: string | null;
  submittedAt?: string | null;
  className?: string;
}

/**
 * Prominent submission success banner per VENDOR-DOCUMENTS-UI.md Part 5 & VD6 Task 3.
 * - Displays "Documents submitted to DIEZ. A receipt has been issued."
 * - Provides link to download or view the receipt.
 */
export function SubmissionReceiptCard({
  receiptNumber,
  receiptDownloadUrl,
  submittedAt,
  className,
}: SubmissionReceiptCardProps) {
  const formattedTime = formatAuditTimestamp(submittedAt || new Date().toISOString());

  return (
    <div
      className={cn(
        "p-4.5 sm:p-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-950 dark:text-emerald-100 shadow-sm space-y-3",
        className
      )}
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="size-9 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0 mt-0.5">
            <CheckCircle2 className="size-5" />
          </div>
          <div className="space-y-0.5">
            <h3 className="font-bold text-sm sm:text-base text-emerald-900 dark:text-emerald-200">
              Documents submitted to DIEZ. A receipt has been issued.
            </h3>
            <p className="text-xs text-emerald-800/80 dark:text-emerald-300/80">
              All compliance requirements verified. Your onboarding package has been transmitted to DIEZ Security & HR Review.
            </p>
          </div>
        </div>

        {receiptDownloadUrl && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => window.open(receiptDownloadUrl, "_blank")}
            className="shrink-0 h-8.5 text-xs font-semibold bg-white/60 dark:bg-card/60 border-emerald-500/40 text-emerald-800 dark:text-emerald-200 hover:bg-emerald-500/20 cursor-pointer shadow-xs"
          >
            <Download className="size-3.5 mr-1.5" />
            Download Receipt
          </Button>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-emerald-500/20 text-xs">
        <div className="flex items-center gap-2">
          <Receipt className="size-3.5 text-emerald-700 dark:text-emerald-300" />
          <span>
            Receipt Ref: <strong>{receiptNumber}</strong>
          </span>
        </div>

        <div className="flex items-center gap-1 text-[11px] text-emerald-800/70 dark:text-emerald-300/70">
          <ShieldCheck className="size-3" />
          <span>Audit timestamp: {formattedTime}</span>
        </div>
      </div>
    </div>
  );
}
