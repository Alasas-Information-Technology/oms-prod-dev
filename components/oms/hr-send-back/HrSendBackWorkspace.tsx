"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Bookmark,
  Send,
  Loader2,
  Check,
  MessageSquareText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  HrSendBackOptionsResponse,
  ClarificationType,
  HrSendBackAsk,
  HrSendBackDraftPayload,
  HrSendBackError,
  ClarificationAttachment,
  ClarificationRouteStep,
} from "@/src/types/hr-send-back";
import {
  useHrSendBackDraft,
  useSubmitHrSendBack,
} from "@/src/lib/hr-send-back/api";
import { useHrReviewQueue, hrReviewKeys } from "@/hooks/useHrReview";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  ClarificationLayout,
  ClarificationThread,
  AskList,
  ReapprovalRoute,
  BudgetImpactPanel,
  AttachmentList,
} from "@/components/oms/clarification";
import { HrSendBackModeChooser } from "./HrSendBackModeChooser";
import { HrSendBackDeadlineNotice } from "./HrSendBackDeadlineNotice";
import { HrSendBackFieldSelector } from "./HrSendBackFieldSelector";
import { HrSendBackSubmitDialog } from "./HrSendBackSubmitDialog";
import { HrSendBackLivePreview } from "./HrSendBackLivePreview";

interface HrSendBackWorkspaceProps {
  options: HrSendBackOptionsResponse;
  onSendBackSuccess?: () => void;
}

export function HrSendBackWorkspace({
  options,
  onSendBackSuccess,
}: HrSendBackWorkspaceProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: queueData } = useHrReviewQueue();
  const { requestId, requestTitle, requester, draft } = options;

  // Form State: mode defaults to "MORE_INFO" (least disruptive per spec)
  const [mode, setMode] = React.useState<ClarificationType>(
    draft?.mode || "MORE_INFO"
  );
  const [message, setMessage] = React.useState<string>(draft?.message || "");
  const [asks, setAsks] = React.useState<HrSendBackAsk[]>(
    (draft?.asks as HrSendBackAsk[]) || []
  );
  const [editableFieldKeys, setEditableFieldKeys] = React.useState<string[]>(
    draft?.editableFieldKeys || []
  );
  const [attachments, setAttachments] = React.useState<ClarificationAttachment[]>([]);

  // Dialog State
  const [isSubmitOpen, setIsSubmitOpen] = React.useState<boolean>(false);
  const [idempotencyKey, setIdempotencyKey] = React.useState<string>("");
  const [submitError, setSubmitError] = React.useState<HrSendBackError | null>(
    null
  );

  const handleOpenSubmit = React.useCallback(() => {
    setIdempotencyKey(
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `sendback-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    );
    setIsSubmitOpen(true);
  }, []);

  // Auto-grow textarea ref
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  React.useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.max(120, textareaRef.current.scrollHeight)}px`;
    }
  }, [message]);

  // Discrimination flag: MORE_INFO has NO field selection, route or budget
  const isMoreInfo = mode === "MORE_INFO";

  // Current draft payload for 2s debounced autosave
  const currentDraftPayload: HrSendBackDraftPayload = React.useMemo(
    () => ({
      mode,
      message,
      asks,
      editableFieldKeys: isMoreInfo ? [] : editableFieldKeys,
      attachmentIds: attachments.map((a) => a.id),
    }),
    [mode, message, asks, editableFieldKeys, isMoreInfo, attachments]
  );

  // Draft autosave hook (2s debounce)
  const {
    saveDraft,
    isSaving: isSavingDraft,
    lastSavedAt,
  } = useHrSendBackDraft(requestId, currentDraftPayload, { autoSave: true });

  // Submit mutation hook
  const submitMutation = useSubmitHrSendBack(requestId);

  const handleLinkField = React.useCallback(
    (_askId: string, fieldKey: string | null) => {
      if (fieldKey && !editableFieldKeys.includes(fieldKey)) {
        setEditableFieldKeys((prev) => [...prev, fieldKey]);
      }
    },
    [editableFieldKeys]
  );

  const handleUnlinkField = React.useCallback((fieldKey: string) => {
    setAsks((prev) =>
      prev.map((ask) =>
        ask.fieldKey === fieldKey ? { ...ask, fieldKey: null } : ask
      )
    );
  }, []);

  const handleDeselectField = React.useCallback(
    (fieldKey: string) => {
      setEditableFieldKeys((prev) => prev.filter((k) => k !== fieldKey));
      handleUnlinkField(fieldKey);
    },
    [handleUnlinkField]
  );

  const handleManualSave = () => {
    saveDraft(currentDraftPayload);
    toast.success("Draft saved successfully");
  };

  const handleConfirmSubmit = async (idempotencyKey: string) => {
    try {
      setSubmitError(null);

      await submitMutation.mutateAsync({
        mode,
        message,
        asks,
        editableFieldKeys: isMoreInfo ? [] : editableFieldKeys,
        attachmentIds: attachments.map((a) => a.id),
        idempotencyKey,
      });

      // Clear local draft per Task 5
      if (typeof window !== "undefined") {
        try {
          localStorage.removeItem(`hr_send_back_draft_${requestId}`);
        } catch {
          // ignore
        }
      }

      setIsSubmitOpen(false);

      // Format closesAt date in plain words per Task 5 (e.g. "30 September")
      let formattedCloses = "30 days";
      try {
        formattedCloses = format(new Date(options.deadline.closesAt), "d MMMM");
      } catch {
        formattedCloses = "30 days";
      }

      // Success confirmation naming what happened: "Sent back to Mariam Al Mansoori. She has until 30 September to respond."
      toast.success(
        `Sent back to ${requester.name}. She has until ${formattedCloses} to respond.`
      );

      // Invalidate queries so queue is refreshed
      queryClient.invalidateQueries({ queryKey: hrReviewKeys.all });

      // Determine next queue item per HR6
      const queueItems = queueData?.items || [];
      const currentIdx = queueItems.findIndex((i) => i.requestId === requestId);
      const nextRequestItem =
        currentIdx >= 0 && currentIdx < queueItems.length - 1
          ? queueItems[currentIdx + 1]
          : null;

      if (onSendBackSuccess) {
        onSendBackSuccess();
      } else if (nextRequestItem) {
        router.push(
          `/app/hr-review?request=${encodeURIComponent(nextRequestItem.requestId)}`
        );
      } else {
        router.push("/app/hr-review");
      }
    } catch (err: unknown) {
      const errorObj = err as Record<string, unknown> | null;
      if (errorObj && typeof errorObj.code === "string") {
        setSubmitError(err as HrSendBackError);
      } else {
        setSubmitError({
          code: "NOT_ASSIGNED_REVIEWER",
          message:
            errorObj && typeof errorObj.message === "string"
              ? errorObj.message
              : "Failed to send request back. Please try again.",
        });
      }
    }
  };

  // Convert route stages for ReapprovalRoute component (Task 2: Her, approvers by name, then you)
  const mappedRoute: ClarificationRouteStep[] = React.useMemo(() => {
    const steps: ClarificationRouteStep[] = [];

    // 1. "Her" (The requester)
    steps.push({
      index: 1,
      stage: "REQUESTOR",
      label: "Requester",
      state: "PENDING",
      user: {
        userId: requester.userId,
        name: requester.name,
        role: requester.role || "Requester",
      },
    });

    // 2. Intermediate approvers by name from options.reapprovalRoute
    const intermediate = (options.reapprovalRoute || []).filter(
      (s) => s.stage !== "HR_REVIEW" && s.stage !== "HR"
    );

    intermediate.forEach((stage) => {
      steps.push({
        index: steps.length + 1,
        stage: stage.stage,
        label: stage.label || stage.stage.replace(/_/g, " "),
        state: "PENDING",
        user: {
          userId: stage.user.userId,
          name: stage.user.name,
          role: stage.user.role,
        },
      });
    });

    // 3. "You" (HR Review)
    steps.push({
      index: steps.length + 1,
      stage: "HR_REVIEW",
      label: "HR Review",
      state: "PENDING",
      user: {
        name: "You (HR Review)",
        role: "HR Specialist",
      },
    });

    return steps;
  }, [requester, options.reapprovalRoute]);

  // Breadcrumbs: "HR Review / OMS-2026-0139 / Send back"
  const crumbs = [
    { label: "HR Review", href: "/app/hr-review" },
    { label: requestId, href: `/app/hr-review?request=${requestId}` },
    { label: "Send back", isCurrent: true },
  ];

  // Subtitle per Task 1: "Send this back to Mariam Al Mansoori" + title and ID
  const subtitleNode = (
    <div className="space-y-1">
      <h2 className="text-base font-semibold text-foreground">
        Send this back to {requester.name}
      </h2>
      <p className="text-xs text-muted-foreground font-medium flex items-center gap-2">
        <span>{requestTitle || "Outsource Request"}</span>
        <span className="text-muted-foreground/40">·</span>
        <span className="font-mono text-xs bg-muted/60 px-2 py-0.5 rounded border border-border/50">
          {requestId}
        </span>
      </p>
    </div>
  );

  const isMessageValid = message.trim().length > 0;

  // Header actions: Quiet saved indicator, Save draft (ghost), Send back (primary)
  const headerActionsNode = (
    <div className="flex items-center gap-2">
      {isSavingDraft ? (
        <span className="inline-flex items-center gap-1.5 text-xs text-primary mr-1">
          <Loader2 className="size-3 animate-spin" /> Saving draft...
        </span>
      ) : lastSavedAt ? (
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground mr-1 hidden sm:inline-flex">
          <Check className="size-3.5 text-emerald-600 dark:text-emerald-400" />
          Saved {new Date(lastSavedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      ) : null}

      <Button
        variant="ghost"
        size="sm"
        onClick={handleManualSave}
        disabled={isSavingDraft || submitMutation.isPending}
        className="h-9 px-3.5 text-xs font-medium border border-border/70 hover:bg-accent cursor-pointer"
      >
        <Bookmark className="size-3.5 mr-1.5" />
        Save draft
      </Button>

      <Button
        size="sm"
        onClick={handleOpenSubmit}
        disabled={submitMutation.isPending || !isMessageValid}
        className="h-9 px-4 text-xs font-medium shadow-xs cursor-pointer"
      >
        <Send className="size-3.5 mr-1.5" />
        Send back
      </Button>
    </div>
  );

  // Left column assembly
  const leftColumnNode = (
    <div className="space-y-6">
      {/* 1. Mode Chooser (Task 2) */}
      <HrSendBackModeChooser
        mode={mode}
        onSelectMode={setMode}
        reapprovalRoute={options.reapprovalRoute}
      />

      {/* 2. Previous Clarification Thread (if any) */}
      {options.cycleNumber > 1 && options.thread && options.thread.length > 0 && (
        <ClarificationThread
          entries={options.thread}
          cycleNumber={options.cycleNumber}
        />
      )}

      {/* 3. Ask Composer (Task 3: Ask composer is present for all modes) */}
      <AskList
        mode="edit"
        title="What you need"
        asks={asks}
        onChange={setAsks}
        selectableFields={isMoreInfo ? [] : options.selectableFields}
        suggestedAsks={options.suggestedAsks}
        onLinkField={handleLinkField}
      />

      {/* 4. Your Message Textarea */}
      <div className="rounded-xl border border-border/80 bg-card shadow-xs overflow-hidden space-y-4">
        <div className="px-4 py-3 sm:px-5 sm:py-3.5 bg-muted/40 border-b border-border/70 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquareText className="size-4 text-primary" />
            <span className="text-xs font-bold uppercase tracking-wider text-foreground">
              Your message
            </span>
          </div>
          <span className="text-[11px] text-muted-foreground">
            {message.length} characters
          </span>
        </div>

        <div className="px-4 sm:px-5 pb-5 space-y-4">
          <Textarea
            ref={textareaRef}
            id="hr-send-back-message"
            rows={5}
            placeholder="Explain clearly why this request is being returned and what information is required..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-[140px] resize-none text-sm leading-relaxed p-4 bg-background focus-visible:ring-2 focus-visible:ring-primary/20 shadow-2xs border-border/80 rounded-lg"
          />

          {/* Attachments Section */}
          <div className="pt-2">
            <AttachmentList
              attachments={attachments}
              editable={true}
              onAddAttachment={(att) => setAttachments((prev) => [...prev, att])}
              onRemoveAttachment={(id) =>
                setAttachments((prev) => prev.filter((a) => a.id !== id))
              }
              title="Add attachments"
              scanningStates={true}
            />
          </div>
        </div>
      </div>

      {/* 5. Field Selector (Task 3: ABSENT for "Ask a question", PRESENT for modes 2 & 3) */}
      {!isMoreInfo && options.selectableFields && options.selectableFields.length > 0 && (
        <HrSendBackFieldSelector
          fields={options.selectableFields}
          selectedKeys={editableFieldKeys}
          onChangeSelectedKeys={setEditableFieldKeys}
          onUnlinkField={handleUnlinkField}
          asks={asks}
        />
      )}
    </div>
  );

  // Right column assembly (Task 3: STRICTLY ABSENT for "Ask a question")
  const rightColumnNode = !isMoreInfo ? (
    <div className="space-y-6">
      {/* 1. Live Preview of "What she will see" (Part 4.4, Task 1) */}
      <HrSendBackLivePreview
        asks={asks}
        editableFieldKeys={editableFieldKeys}
        allFields={options.selectableFields || []}
        message={message}
        attachments={attachments}
        requesterName={requester.name}
      />

      {/* 2. Route Preview: "Who it goes back through" (Part 4.5, Task 2) */}
      {options.reapprovalRoute && options.reapprovalRoute.length > 0 && (
        <ReapprovalRoute
          variant="return-path"
          title="Who it goes back through"
          route={mappedRoute}
          note="Request returns to HR after these approvals are completed."
        />
      )}

      {/* 3. Budget Note (Part 4.5, Task 3) */}
      {options.budget && (
        <BudgetImpactPanel
          variant="note"
          title="Budget"
          figures={{
            currentReservation: options.budget.reserved,
            note: options.budget.note,
          }}
          noteText={options.budget.note}
        />
      )}
    </div>
  ) : undefined;

  return (
    <>
      <ClarificationLayout
        crumbs={crumbs}
        title="HR Review / Send back"
        subtitle={subtitleNode}
        headerActions={headerActionsNode}
        banner={<HrSendBackDeadlineNotice deadline={options.deadline} />}
        leftColumn={leftColumnNode}
        rightColumn={rightColumnNode}
        backLink={{
          href: `/app/hr-review?request=${requestId}`,
          label: `Back to HR Review`,
        }}
        isSingleColumn={isMoreInfo}
        auditNote="Every message, change and approval is kept for audit."
      />

      {/* Confirmation Dialog */}
      <HrSendBackSubmitDialog
        open={isSubmitOpen}
        onOpenChange={setIsSubmitOpen}
        options={options}
        mode={mode}
        message={message}
        asks={asks}
        editableFieldKeys={isMoreInfo ? [] : editableFieldKeys}
        attachmentIds={attachments.map((a) => a.id)}
        idempotencyKey={idempotencyKey}
        isSubmitting={submitMutation.isPending}
        onConfirmSubmit={handleConfirmSubmit}
        submitError={submitError}
        onClearError={() => setSubmitError(null)}
        onSwitchToQuestion={() => setMode("MORE_INFO")}
        onDeselectField={handleDeselectField}
      />
    </>
  );
}
