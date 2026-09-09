"use client";

import * as React from "react";
import Link from "next/link";
import {
  VendorCandidateSummary,
  VendorOnboardingDeadline,
} from "@/src/types/vendor-documents";
import { getDeadlineVisuals } from "@/src/lib/vendor-documents/formatters";
import { Button } from "@/components/ui/button";
import {
  ChevronRight,
  Clock,
  AlertTriangle,
  AlertCircle,
  FileCheck2,
  Save,
  Send,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface VendorContextBarProps {
  onboardingId: string;
  candidateRef: string;
  position: string;
  candidate: VendorCandidateSummary;
  deadline: VendorOnboardingDeadline;
  canEdit?: boolean;
  isSavingDraft?: boolean;
  isSubmitting?: boolean;
  onSaveDraft?: () => void;
  onSubmit?: () => void;
  submitDisabled?: boolean;
  submitDisabledReason?: string;
  className?: string;
}

/**
 * Top Page Bar & Context Bar for Vendor Onboarding Documents Workspace
 * Features:
 * - Breadcrumb: Onboarding / {onboardingId}
 * - Sub-line: Candidate {candidateRef} · {position} · {residentStatus}
 * - Deadline severity notice per §1.12: neutral (>7d), amber (3-7d), red (<3d at risk)
 * - Page-bar actions: Save draft (ghost), Submit (primary)
 */
export function VendorContextBar({
  onboardingId,
  candidateRef,
  position,
  candidate,
  deadline,
  canEdit = true,
  isSavingDraft = false,
  isSubmitting = false,
  onSaveDraft,
  onSubmit,
  submitDisabled = false,
  submitDisabledReason,
  className,
}: VendorContextBarProps) {
  const deadlineVisuals = getDeadlineVisuals(deadline);

  return (
    <div
      className={cn(
        "w-full bg-background border-b border-border/70 px-4 sm:px-6 py-3.5 space-y-3 transition-colors",
        className
      )}
    >
      {/* Row 1: Breadcrumb + Page Title + Top Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Breadcrumb & Title */}
        <div className="space-y-1">
          {/* Breadcrumb: Onboarding / ONB-2026-0061 */}
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 text-xs text-muted-foreground"
          >
            <Link
              href="/vendor/onboarding"
              className="hover:text-foreground transition-colors"
            >
              Onboarding
            </Link>
            <ChevronRight className="size-3 text-muted-foreground/60" />
            <span className="font-mono text-foreground/90 font-medium">
              {onboardingId}
            </span>
          </nav>

          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Candidate documents & e-signature
          </h1>
        </div>

        {/* Right: Page-bar Actions per §1.3 (Save draft = ghost, Submit = primary) */}
        {canEdit && (
          <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onSaveDraft}
              disabled={isSavingDraft || isSubmitting}
              className="cursor-pointer text-muted-foreground hover:text-foreground text-xs h-9 px-3"
            >
              <Save className="size-3.5 mr-1.5" />
              {isSavingDraft ? "Saving..." : "Save draft"}
            </Button>

            {submitDisabled && submitDisabledReason && (
              <span className="text-[11px] text-muted-foreground italic text-right max-w-xs leading-tight">
                {submitDisabledReason}
              </span>
            )}

            <div className="relative group">
              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={onSubmit}
                disabled={submitDisabled || isSubmitting}
                className={cn(
                  "cursor-pointer text-xs h-9 px-4 font-semibold shadow-xs transition-all shrink-0",
                  "bg-teal-600 hover:bg-teal-700 text-white dark:bg-teal-600 dark:hover:bg-teal-500",
                  submitDisabled && "opacity-60 cursor-not-allowed"
                )}
              >
                <Send className="size-3.5 mr-1.5" />
                {isSubmitting ? "Submitting..." : "Submit documents"}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Row 2: Sub-line Context + Deadline Severity Escalation per §1.12 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 text-xs border-t border-border/40 pt-2.5">
        {/* Sub-line: candidate, position, resident status */}
        <div className="flex items-center flex-wrap gap-2 text-muted-foreground">
          <span className="font-semibold text-foreground font-mono">
            {`Candidate ${candidateRef}`}
          </span>
          <span>·</span>
          <span>{position}</span>
          <span>·</span>
          <span className="capitalize font-medium text-foreground/80">
            {candidate.residentStatus.toLowerCase()}
          </span>
        </div>

        {/* Deadline Context Line per §1.12 */}
        <div
          className={cn(
            "flex items-center gap-1.5 tabular-nums text-xs",
            deadlineVisuals.severityClass
          )}
        >
          {deadlineVisuals.isAtRisk ? (
            <AlertCircle className="size-4 text-destructive shrink-0 animate-pulse" />
          ) : deadline.severity === "WARNING" ? (
            <AlertTriangle className="size-3.5 text-amber-500 shrink-0" />
          ) : (
            <Clock className="size-3.5 text-muted-foreground/70 shrink-0" />
          )}
          <span>{deadlineVisuals.noticeText}</span>
        </div>
      </div>
    </div>
  );
}
