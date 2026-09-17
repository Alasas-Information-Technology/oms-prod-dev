"use client";

import * as React from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Amount } from "@/components/budget/Amount";
import { AttachmentList } from "@/components/oms/clarification/AttachmentList";
import { ClarificationAttachment } from "@/types/clarification";
import { AmendmentCostSummary } from "@/src/types/budget-amendment";
import { cn } from "@/lib/utils";

export interface WhyNeededPanelProps {
  cost: AmendmentCostSummary;
  justification: string;
  onJustificationChange: (val: string) => void;
  attachments: ClarificationAttachment[];
  onAddAttachment?: (attachment: ClarificationAttachment) => void;
  onRemoveAttachment?: (attachmentId: string) => void;
  readOnly?: boolean;
  className?: string;
}

const MIN_JUSTIFICATION_CHARS = 40;

/**
 * "Why this is needed" panel per BUDGET-AMENDMENT-UI.md 1.4 & 3.1:
 *  - Approved, qualified, shortfall, variance percentage, status badge
 *  - Reuses Amount component with T2 weight contrast (muted currency, bold integer, muted decimals)
 *  - EXACT figures, never abbreviated
 *  - Justification textarea, required, 40-character minimum with live counter
 *  - Attachments via existing AttachmentList component with scanning states
 */
export function WhyNeededPanel({
  cost,
  justification,
  onJustificationChange,
  attachments,
  onAddAttachment,
  onRemoveAttachment,
  readOnly = false,
  className,
}: WhyNeededPanelProps) {
  const charCount = justification.trim().length;
  const isTooShort = charCount < MIN_JUSTIFICATION_CHARS;
  const charsNeeded = MIN_JUSTIFICATION_CHARS - charCount;

  return (
    <section
      aria-labelledby="panel-why-needed-heading"
      className={cn(
        "rounded-lg border border-border bg-card p-5 space-y-5 shadow-xs transition-all",
        className
      )}
    >
      <div className="border-b border-border/80 pb-3">
        <h2
          id="panel-why-needed-heading"
          className="text-xs font-bold tracking-wider uppercase text-muted-foreground"
        >
          Why This Is Needed
        </h2>
      </div>

      {/* ── 1. Financial Figures with T2 Weight Contrast (Exact, Never Abbreviated) ── */}
      <div className="space-y-2.5 text-xs">
        {/* Approved Figure */}
        <div className="flex items-center justify-between text-muted-foreground">
          <span>Approved</span>
          <Amount
            variant="display"
            size="sm"
            value={cost.approved}
            abbreviate={false}
          />
        </div>

        {/* Qualified Figure */}
        <div className="flex items-center justify-between text-muted-foreground">
          <span>Qualified</span>
          <Amount
            variant="display"
            size="sm"
            value={cost.qualified}
            abbreviate={false}
          />
        </div>

        {/* Shortfall Figure */}
        <div className="flex items-center justify-between font-semibold pt-1 border-t border-border/60">
          <span className="text-destructive">Short by</span>
          <Amount
            variant="display"
            size="sm"
            value={cost.shortfall}
            abbreviate={false}
            className="text-destructive"
          />
        </div>
      </div>

      {/* ── 2. Status Badge: Red when over budget, neutral when within budget ── */}
      <div>
        {cost.shortfall > 0 || cost.status === "OVER_BUDGET" ? (
          <div
            data-slot="status-badge-over-budget"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-destructive/10 text-destructive text-[11px] font-semibold border border-destructive/20"
          >
            <span className="size-1.5 rounded-full bg-destructive animate-pulse" />
            <span>{`Over budget by ${cost.variancePercent}%`}</span>
          </div>
        ) : (
          <div
            data-slot="status-badge-within-budget"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted text-muted-foreground text-[11px] font-medium border border-border"
          >
            <span className="size-1.5 rounded-full bg-muted-foreground/60" />
            <span>Within budget after correction</span>
          </div>
        )}
      </div>

      {/* ── 3. Justification Textarea with 40-character Minimum & Live Counter ── */}
      <div className="space-y-1.5 pt-1">
        <div className="flex items-center justify-between">
          <label
            htmlFor="amendment-justification-input"
            className="text-xs font-semibold text-foreground flex items-center gap-1"
          >
            <span>Justification</span>
            <span className="text-destructive" title="Required">*</span>
          </label>
          <span
            data-slot="justification-counter"
            className={cn(
              "text-[11px]",
              isTooShort
                ? "text-amber-800 dark:text-amber-400 font-semibold"
                : "text-emerald-800 dark:text-emerald-400 font-medium"
            )}
          >
            {`${charCount} / ${MIN_JUSTIFICATION_CHARS} min`}
          </span>
        </div>

        <textarea
          id="amendment-justification-input"
          value={justification}
          onChange={(e) => onJustificationChange(e.target.value)}
          disabled={readOnly}
          required
          rows={3}
          placeholder="State the market benchmark, specialized certifications, or project criticality that justifies this budget amendment..."
          className={cn(
            "w-full text-xs p-3 rounded-md bg-background border text-foreground placeholder:text-muted-foreground/60 resize-none focus:outline-hidden focus-visible:ring-1 transition-colors leading-relaxed",
            isTooShort
              ? "border-amber-500/50 focus-visible:ring-amber-500/60"
              : "border-border focus-visible:ring-primary"
          )}
        />

        {isTooShort && (
          <p
            data-slot="justification-warning"
            className="text-[11px] text-amber-800 dark:text-amber-400 flex items-center gap-1 pt-0.5"
          >
            <AlertCircle className="size-3 shrink-0" />
            <span>
              {`Minimum 40 characters required (${charsNeeded} more needed to submit).`}
            </span>
          </p>
        )}
      </div>

      {/* ── 4. Attachments via existing AttachmentList component ── */}
      <div className="pt-2 border-t border-border/60">
        <AttachmentList
          attachments={attachments}
          editable={!readOnly}
          onAddAttachment={onAddAttachment}
          onRemoveAttachment={onRemoveAttachment}
          scanningStates={true}
          showDropzone={!readOnly}
          title="Supporting Documents"
        />
      </div>
    </section>
  );
}
