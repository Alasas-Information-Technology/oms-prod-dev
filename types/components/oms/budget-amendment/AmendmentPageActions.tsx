"use client";

import * as React from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatAmount } from "@/lib/money";

export interface AmendmentPageActionsProps {
  activeFixtureKey?: string;
  onFixtureChange?: (key: string) => void;
  onCancel: () => void;
  onSaveDraft?: () => void;
  onSubmit?: () => void;
  isSavingDraft?: boolean;
  isSubmitting?: boolean;
  submitDisabled?: boolean;
  cancelConsequence?: string;
  balanced?: boolean;
  shortfallRemaining?: number;
}

/**
 * Page-bar actions per BUDGET-AMENDMENT-UI.md TASK 1 & TASK 4:
 *  - Cancel (ghost, danger text)
 *  - Quiet, always-visible cancel consequence note near Cancel action
 *  - Save draft (ghost)
 *  - Submit (primary), disabled while balanced is false
 *  - Inline shortfall amount next to Submit button when balanced is false
 *  - Fixture switcher for testing fixtures (a, b, c, d)
 */
export function AmendmentPageActions({
  activeFixtureKey = "reference",
  onFixtureChange,
  onCancel,
  onSaveDraft,
  onSubmit,
  isSavingDraft = false,
  isSubmitting = false,
  submitDisabled = false,
  cancelConsequence,
  balanced = true,
  shortfallRemaining = 0,
}: AmendmentPageActionsProps) {
  return (
    <div className="flex items-center gap-2">
      {/* Subtle fixture switcher for testing Phase BA1-BA6 (especially Fixture d) */}
      {onFixtureChange && (
        <div className="hidden lg:flex items-center gap-1 mr-2 px-2 py-1 rounded-md bg-muted/50 border border-border text-[11px] text-muted-foreground">
          <span className="font-semibold text-foreground/80">Fixture:</span>
          <select
            value={activeFixtureKey}
            onChange={(e) => onFixtureChange(e.target.value)}
            className="bg-transparent border-none text-[11px] font-medium text-foreground focus:outline-hidden cursor-pointer"
            aria-label="Select budget amendment fixture"
            id="fixture-selector"
          >
            <option value="reference">a) Reference (C-009)</option>
            <option value="unbudgeted">b) Unbudgeted route</option>
            <option value="insufficient">c) Insufficient allocation</option>
            <option value="critical">d) Deadline critical (2 days)</option>
          </select>
        </div>
      )}

      {/* TASK 4: Cancel consequence as a quiet, ALWAYS-VISIBLE note near the Cancel action */}
      {cancelConsequence && (
        <span
          data-slot="cancel-consequence-note"
          className="hidden md:inline-flex items-center text-[11px] text-muted-foreground/80 italic pr-1 select-none max-w-[280px] lg:max-w-none truncate"
          title={cancelConsequence}
        >
          {cancelConsequence}
        </span>
      )}

      {/* Cancel button: ghost, danger text */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onCancel}
        className="h-9 px-3 text-xs font-medium text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer shrink-0"
        id="btn-cancel-amendment"
      >
        Cancel
      </Button>

      {/* Save draft button: ghost */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onSaveDraft}
        disabled={isSavingDraft}
        className="h-9 px-3 text-xs font-medium cursor-pointer"
        id="btn-save-draft"
      >
        {isSavingDraft ? "Saving..." : "Save draft"}
      </Button>

      {/* TASK 1: Shortfall amount stated inline next to the button when not balanced */}
      {!balanced && shortfallRemaining > 0 && (
        <span
          data-slot="submit-shortfall-inline"
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-destructive bg-destructive/10 border border-destructive/20 px-2 py-1 rounded shrink-0"
          title={`Short by AED ${formatAmount(shortfallRemaining)}`}
        >
          <AlertTriangle className="size-3 shrink-0" aria-hidden="true" />
          <span>{`Short by AED ${formatAmount(shortfallRemaining)}`}</span>
        </span>
      )}

      {/* Submit button: primary/default */}
      <Button
        variant="default"
        size="sm"
        onClick={onSubmit}
        disabled={isSubmitting || submitDisabled || !balanced}
        className="h-9 px-4 text-xs font-semibold cursor-pointer shrink-0"
        id="btn-submit-amendment"
      >
        {isSubmitting ? "Submitting..." : "Submit"}
      </Button>
    </div>
  );
}
