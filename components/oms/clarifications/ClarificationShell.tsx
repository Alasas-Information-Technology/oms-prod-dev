"use client";

import * as React from "react";
import Link from "next/link";
import {
  PageBarBreadcrumbs,
  PageBarActions,
} from "@/components/ui/layouts/page-bar-context";
import { Button } from "@/components/ui/button";
import {
  ClarificationDetail,
  ClarificationPreviewResponse,
} from "@/types/clarification";
import { ClarificationConsequenceBanner } from "./ClarificationConsequenceBanner";
import {
  ClarificationDeadlineBanner,
  ClarificationDeadlineBadge,
} from "./ClarificationDeadlineBanner";
import { ClarificationAsksChecklist } from "./ClarificationAsksChecklist";
import { ClarificationMessagePanel } from "./ClarificationMessagePanel";
import { ClarificationThread } from "./ClarificationThread";
import {
  Bookmark,
  Send,
  ArrowLeft,
  Lock,
  FileCheck2,
  AlertCircle,
  Clock,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ClarificationShellProps {
  clarification: ClarificationDetail;
  preview?: ClarificationPreviewResponse;
  onSaveDraft?: () => void;
  onSubmitResponse?: () => void;
  isSavingDraft?: boolean;
  isSubmitting?: boolean;
  lastSavedAt?: string | null;
  leftColumnContent?: React.ReactNode;
  rightColumnContent?: React.ReactNode;
}

export function ClarificationShell({
  clarification,
  preview,
  onSaveDraft,
  onSubmitResponse,
  isSavingDraft = false,
  isSubmitting = false,
  lastSavedAt,
  leftColumnContent,
  rightColumnContent,
}: ClarificationShellProps) {
  const {
    requestId,
    requestTitle,
    type,
    canRespond,
    readOnlyReason,
    deadline,
  } = clarification;

  const isMoreInfo = type === "MORE_INFO";

  return (
    <div className="flex flex-col min-h-full pb-16 animate-in fade-in-50 duration-300">
      {/* 1. Breadcrumb as Page Title per APP-SHELL-SPEC.md */}
      <PageBarBreadcrumbs
        crumbs={[
          { label: "My Requests", href: "/app/requests" },
          { label: requestId, href: `/app/requests/${requestId}` },
          { label: "Clarification", isCurrent: true },
        ]}
      />

      {/* 2. Page Bar Action Buttons (36px tall, 8px gap) */}
      {canRespond && (
        <PageBarActions>
          <div className="flex items-center gap-2">
            {lastSavedAt && (
              <span className="text-[11.5px] text-muted-foreground mr-1 hidden sm:inline-block">
                Saved {new Date(lastSavedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onSaveDraft}
              disabled={isSavingDraft || isSubmitting}
              className="h-9 px-3.5 text-xs font-medium border border-border/60 hover:bg-accent"
            >
              <Bookmark className="size-3.5 mr-1.5" />
              {isSavingDraft ? "Saving..." : "Save draft"}
            </Button>

            <Button
              size="sm"
              onClick={onSubmitResponse}
              disabled={isSubmitting}
              className="h-9 px-4 text-xs font-medium shadow-xs"
            >
              <Send className="size-3.5 mr-1.5" />
              {isSubmitting ? "Submitting..." : "Submit response"}
            </Button>
          </div>
        </PageBarActions>
      )}

      {/* Main Container */}
      <div className="p-4 sm:p-6 max-w-[1680px] w-full mx-auto space-y-6">
        {/* Back Link & Navigation */}
        <div className="flex items-center justify-between">
          <Link
            href={`/app/requests/${requestId}`}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-3.5" />
            <span>Back to Request {requestId}</span>
          </Link>
        </div>

        {/* Read-Only State Alert when caller cannot respond */}
        {!canRespond && (
          <div className="rounded-xl bg-muted/60 border border-border/80 p-4 text-xs text-foreground flex items-center gap-3 shadow-2xs">
            <Lock className="size-4 text-muted-foreground shrink-0" />
            <span>
              <strong>Read-only mode:</strong> {readOnlyReason || "You are viewing this clarification in read-only mode."}
            </span>
          </div>
        )}

        {/* Critical Deadline Escalation Red Banner (under 3 days / overdue) */}
        <ClarificationDeadlineBanner deadline={deadline} />

        {/* Sub-line Row: Request Title & ID on left, Deadline badge on right */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/40 pb-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
              <span>Respond to HR Clarification</span>
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground font-medium flex items-center gap-2">
              <span className="text-foreground font-semibold">{requestTitle}</span>
              <span className="text-muted-foreground/50">·</span>
              <span className="font-semibold text-xs text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md border border-border/50">{requestId}</span>
            </p>
          </div>

          <ClarificationDeadlineBadge deadline={deadline} />
        </div>

        {/* Consequence Banner per Part 3.1: Always present, naming actual people */}
        <ClarificationConsequenceBanner clarification={clarification} />

        {/* Responsive Grid Layout per Part 2:
            1fr 420px, 24px gap. Right column stacks below 1280px (xl).
            Single column below 1024px (lg) with right-hand panels moving beneath composer.
            For MORE_INFO: Diff, Route & Budget panels are ABSENT from the DOM entirely.
        */}
        <div
          className={cn(
            "grid gap-6 items-start",
            isMoreInfo
              ? "grid-cols-1 max-w-4xl" // Clean, single-column focused layout for MORE_INFO
              : "grid-cols-1 xl:grid-cols-[1fr_420px]"
          )}
        >
          {/* Left Column: Asks Checklist, Message Panel, Message Thread, Response Composer, Inline Field Editors */}
          <div className="space-y-6 min-w-0">
            {leftColumnContent || (
              <>
                {/* 1. What HR Needs Checklist per Part 3.2 (omitted if asks is empty) */}
                {clarification.asks && clarification.asks.length > 0 && (
                  <ClarificationAsksChecklist
                    asks={clarification.asks}
                    preview={preview}
                    clarification={clarification}
                  />
                )}

                {/* 2. HR Request Panel per Part 3.3 (avatar, role, full untruncated message, attachments) */}
                <ClarificationMessagePanel clarification={clarification} />

                {/* 3. Thread History per Part 3.3 (latest expanded, earlier cycles collapsed, cycle info) */}
                {clarification.thread && clarification.thread.length > 0 && (
                  <ClarificationThread
                    thread={clarification.thread}
                    cycleNumber={clarification.cycleNumber}
                  />
                )}
              </>
            )}
          </div>

          {/* Right Column: Diff Table, Route Stepper, Budget Panel (STRICTLY ABSENT for MORE_INFO) */}
          {!isMoreInfo && (
            <div className="space-y-6 min-w-0">
              {rightColumnContent || (
                <div className="rounded-xl border border-border/70 bg-card p-6 shadow-xs space-y-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Sparkles className="size-4 text-primary" />
                    <span>Governance & Impact Preview</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Live diff, approval route stepper, and budget ledger verification will render here.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Audit Trail Persistent Note */}
        <div className="pt-4 border-t border-border/40 text-[11.5px] text-muted-foreground flex items-center gap-2">
          <span>🛈 Every message, change and approval is kept for audit.</span>
        </div>
      </div>
    </div>
  );
}
