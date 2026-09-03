"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  ClarificationDetail,
  ClarificationPreviewResponse,
} from "@/types/clarification";
import { ClarificationLayout } from "@/components/oms/clarification/ClarificationLayout";
import { ConsequenceBanner } from "@/components/oms/clarification/ConsequenceBanner";
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
  Lock,
  Sparkles,
} from "lucide-react";

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

  const crumbs = [
    { label: "My Requests", href: "/app/requests" },
    { label: requestId, href: `/app/requests/${requestId}` },
    { label: "Clarification", isCurrent: true },
  ];

  const headerActions = canRespond ? (
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
  ) : null;

  const readOnlyAlert = !canRespond ? (
    <div className="rounded-xl bg-muted/60 border border-border/80 p-4 text-xs text-foreground flex items-center gap-3 shadow-2xs">
      <Lock className="size-4 text-muted-foreground shrink-0" />
      <span>
        <strong>Read-only mode:</strong> {readOnlyReason || "You are viewing this clarification in read-only mode."}
      </span>
    </div>
  ) : null;

  const subtitle = (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 w-full">
      <p className="text-xs sm:text-sm text-muted-foreground font-medium flex items-center gap-2">
        <span className="text-foreground font-semibold">{requestTitle}</span>
        <span className="text-muted-foreground/50">·</span>
        <span className="font-semibold text-xs text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md border border-border/50">
          {requestId}
        </span>
      </p>
      <ClarificationDeadlineBadge deadline={deadline} />
    </div>
  );

  const banner = (
    <>
      <ClarificationDeadlineBanner deadline={deadline} />
      <ConsequenceBanner
        mode={clarification.type}
        consequence={clarification.consequence}
        approvers={clarification.consequence?.approvers}
        direction="receiving"
      />
    </>
  );

  const defaultLeft = (
    <>
      {clarification.asks && clarification.asks.length > 0 && (
        <ClarificationAsksChecklist
          asks={clarification.asks}
          preview={preview}
          clarification={clarification}
        />
      )}
      <ClarificationMessagePanel clarification={clarification} />
      {clarification.thread && clarification.thread.length > 0 && (
        <ClarificationThread
          thread={clarification.thread}
          cycleNumber={clarification.cycleNumber}
        />
      )}
    </>
  );

  const defaultRight = !isMoreInfo ? (
    <div className="rounded-xl border border-border/70 bg-card p-6 shadow-xs space-y-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <Sparkles className="size-4 text-primary" />
        <span>Governance & Impact Preview</span>
      </div>
      <p className="text-xs text-muted-foreground">
        Live diff, approval route stepper, and budget ledger verification will render here.
      </p>
    </div>
  ) : undefined;

  return (
    <ClarificationLayout
      crumbs={crumbs}
      title="Respond to HR Clarification"
      subtitle={subtitle}
      headerActions={headerActions}
      banner={banner}
      leftColumn={leftColumnContent || defaultLeft}
      rightColumn={!isMoreInfo ? (rightColumnContent || defaultRight) : undefined}
      backLink={{
        href: `/app/requests/${requestId}`,
        label: `Back to Request ${requestId}`,
      }}
      readOnlyAlert={readOnlyAlert}
      isSingleColumn={isMoreInfo}
    />
  );
}
