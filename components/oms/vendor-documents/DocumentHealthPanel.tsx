"use client";

import * as React from "react";
import { DocumentHealth } from "@/src/types/vendor-documents";
import {
  FileCheck,
  Upload,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DocumentHealthPanelProps {
  health: DocumentHealth;
  className?: string;
}

/**
 * Right Column: Document Health Panel per VENDOR-DOCUMENTS-UI.md §1.1 & §4.4.
 * - Single source of truth derived strictly from row data via computeDocumentHealth()
 * - Missing shown even at zero in neutral reassurance
 * - Exact tabular-nums formatting
 */
export function DocumentHealthPanel({
  health,
  className,
}: DocumentHealthPanelProps) {
  return (
    <div
      className={cn(
        "bg-card border border-border/70 rounded-xl p-5 shadow-xs space-y-4",
        className
      )}
      aria-label="Document Health Summary"
    >
      <div className="flex items-center justify-between border-b border-border/50 pb-2.5">
        <div className="space-y-0.5">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Document Health
          </span>
          <h4 className="text-xs font-semibold text-foreground">
            Compliance Reconciliation
          </h4>
        </div>
        <span className="text-[10px] text-muted-foreground">
          Derived counts
        </span>
      </div>

      <div className="space-y-2.5 text-xs">
        {/* Required */}
        <div className="flex items-center justify-between py-0.5">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <FileCheck className="size-3.5 text-muted-foreground/70" />
            Required
          </span>
          <span className="font-semibold text-foreground tabular-nums">
            {health.required}
          </span>
        </div>

        {/* Uploaded */}
        <div className="flex items-center justify-between py-0.5">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Upload className="size-3.5 text-muted-foreground/70" />
            Uploaded
          </span>
          <span className="font-semibold text-foreground tabular-nums">
            {health.uploaded}
          </span>
        </div>

        {/* Approved */}
        <div className="flex items-center justify-between py-0.5">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <CheckCircle2 className="size-3.5 text-success-text" />
            Approved
          </span>
          <span className="font-semibold text-success-text tabular-nums">
            {health.approved}
          </span>
        </div>

        {/* Expiring soon */}
        <div className="flex items-center justify-between py-0.5">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="size-3.5 text-warning-text" />
            Expiring soon
          </span>
          <span className="font-semibold text-warning-text tabular-nums">
            {health.expiringSoon}
          </span>
        </div>

        {/* Missing — per §4.4: shown even at zero in neutral */}
        <div className="flex items-center justify-between py-0.5">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <AlertCircle
              className={cn(
                "size-3.5",
                health.missing > 0
                  ? "text-danger-text"
                  : "text-muted-foreground/70"
              )}
            />
            Missing
          </span>
          <span
            className={cn(
              "font-semibold tabular-nums",
              health.missing > 0
                ? "text-danger-text"
                : "text-muted-foreground"
            )}
          >
            {health.missing}
          </span>
        </div>

        {/* Scan failed (Conditional alert indicator if > 0) */}
        {health.scanFailed > 0 && (
          <div className="flex items-center justify-between py-0.5 pt-1 border-t border-danger-border/20 text-danger-text">
            <span className="flex items-center gap-1.5 font-medium">
              <XCircle className="size-3.5 text-danger-text" />
              Scan failed (blocking)
            </span>
            <span className="font-bold tabular-nums">
              {health.scanFailed}
            </span>
          </div>
        )}

        {/* Rejected (Conditional alert indicator if > 0) */}
        {health.rejected > 0 && (
          <div className="flex items-center justify-between py-0.5 pt-1 border-t border-danger-border/20 text-danger-text">
            <span className="flex items-center gap-1.5 font-medium">
              <AlertCircle className="size-3.5 text-danger-text" />
              Rejected by DIEZ
            </span>
            <span className="font-bold tabular-nums">
              {health.rejected}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
